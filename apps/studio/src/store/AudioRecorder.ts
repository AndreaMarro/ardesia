// MAESTRO-Studio — AudioRecorder
// Microfono docente (MediaRecorder), chunk 30s, clock condiviso col journal.
// GDPR by design: interruttore per-lezione default OFF, consenso registrato in session.yaml.
//
// Strategy:
// - Clock iniettato (`now`) per testabilità deterministica (stessa firma di JournalRecorder.now).
// - MediaRecorder factory iniettabile per test (jsdom non ha MediaRecorder nativo).
// - Chunk ogni 30s via timeslice di MediaRecorder.start().
// - Ogni chunk è salvato su WorkspaceStore (raw/audio/chunk-{index}.webm).
// - Un marker audio.chunk è emesso nel journal via callback onChunk.
// - session.yaml registra il consenso: audioConsent + audioStartEpoch.

import { type WorkspaceStore } from "./WorkspaceStore"
import { PATHS } from "./types"

// --- Tipi per session.yaml ---

export interface SessionData {
  v: number
  created: number
  audioConsent: boolean
  audioStartEpoch: number | null
}

/** Parser minimale YAML per session.yaml (solo campi noti) */
export function parseSessionYaml(text: string): Partial<SessionData> {
  const data: Partial<SessionData> = {}
  const matchV = text.match(/^v:\s*(\d+)$/m)
  if (matchV) data.v = parseInt(matchV[1], 10)
  const matchCreated = text.match(/^created:\s*(\d+)$/m)
  if (matchCreated) data.created = parseInt(matchCreated[1], 10)
  const matchConsent = text.match(/^audioConsent:\s*(true|false)$/m)
  if (matchConsent) data.audioConsent = matchConsent[1] === "true"
  const matchEpoch = text.match(/^audioStartEpoch:\s*(\d+)$/m)
  if (matchEpoch) data.audioStartEpoch = parseInt(matchEpoch[1], 10)
  return data
}

/** Serializza dati sessione in YAML */
export function serializeSessionYaml(data: Partial<SessionData>): string {
  const lines: string[] = []
  lines.push(`v: ${data.v ?? 1}`)
  lines.push(`created: ${data.created ?? Date.now()}`)
  if (data.audioConsent !== undefined) {
    lines.push(`audioConsent: ${data.audioConsent}`)
  }
  if (data.audioStartEpoch !== undefined && data.audioStartEpoch !== null) {
    lines.push(`audioStartEpoch: ${data.audioStartEpoch}`)
  }
  return lines.join("\n") + "\n"
}

// --- Opzioni AudioRecorder ---

export interface AudioRecorderOptions {
  store: WorkspaceStore
  /** Clock condiviso col journal (stesso riferimento epoch) */
  clock: () => number
  /** Chiamato quando un chunk audio è completato */
  onChunk?: (chunkIndex: number, startEpoch: number, endEpoch: number) => void | Promise<void>
  /** Factory MediaRecorder iniettabile per test */
  createMediaRecorder?: (stream: MediaStream) => MediaRecorder
}

type RecordingTake = {
  recorder: MediaRecorder
  stream: MediaStream
  closed: boolean
  discard: boolean
  stopped: Promise<void>
  resolveStopped: () => void
}

/**
 * AudioRecorder: registra audio dal microfono docente in chunk da 30s.
 *
 * Lifecycle:
 *   recorder = new AudioRecorder({ store, clock, onChunk })
 *   recorder.start()  // chiede permesso microfono, inizia registrazione
 *   recorder.stop()   // ferma registrazione
 *
 * Consenso:
 *   recorder.consent = true   // attiva registrazione
 *   recorder.consent = false  // disattiva (default)
 *   Al toggle ON: scrive audioConsent + audioStartEpoch in session.yaml
 */
export class AudioRecorder {
  private store: WorkspaceStore
  private clock: () => number
  private onChunk: ((chunkIndex: number, startEpoch: number, endEpoch: number) => void | Promise<void>) | undefined
  private _consent: boolean = false
  private _recording: boolean = false
  private _startEpoch: number | null = null
  private _chunkIndex: number = 0
  private _take: RecordingTake | null = null
  private _chunkStartEpoch: number | null = null
  private createMediaRecorder: (stream: MediaStream) => MediaRecorder
  private _lastRevoke: Promise<void> = Promise.resolve()
  private _disposed = false
  /** A pending permission request belongs to exactly one consent/start lifetime. */
  private _generation = 0
  private _starting: { generation: number; promise: Promise<void> } | null = null
  private _stopping: Promise<void> | null = null
  private _pendingSessionWrites: Promise<void> = Promise.resolve()
  private _lastError: Error | null = null
  /** stop() drains this queue AFTER the recorder's final dataavailable/onstop. */
  private _pendingChunkWrites: Promise<void> = Promise.resolve()

  constructor(options: AudioRecorderOptions) {
    this.store = options.store
    this.clock = options.clock
    this.onChunk = options.onChunk
    this.createMediaRecorder = options.createMediaRecorder ?? ((stream) => new MediaRecorder(stream))
  }

  get consent(): boolean {
    return this._consent
  }

  get recording(): boolean {
    return this._recording
  }

  get startEpoch(): number | null {
    return this._startEpoch
  }

  /** Capture/storage failure remains observable even when revocation cleans up. */
  get lastError(): Error | null {
    return this._lastError
  }

  /**
   * Imposta il consenso e persiste in session.yaml.
   * Se consent passa da false→true: registra audioStartEpoch in session.yaml.
   * Se consent passa da true→false: ferma la registrazione E CANCELLA tutti i
   * chunk audio (GDPR: revoca = i dati non devono esistere, il filtro in export non basta).
   */
  set consent(val: boolean) {
    if (this._disposed || this._consent === val) return
    this._generation++
    this._consent = val
    if (val) {
      this._startEpoch = this.clock()
      this._chunkStartEpoch = this._startEpoch
      this._chunkIndex = 0
      this.persistSession().catch(() => {})
      return
    }

    // Revoke synchronously: no later permission/data callback may revive this
    // take, even if the user grants NEW consent before cleanup finishes.
    if (this._take) this._take.discard = true
    const stopped = this.stop()
    // Observe a capture failure immediately, even if an earlier revoke is
    // still draining; cleanup below still waits for this exact stop promise.
    stopped.catch(() => {})
    const persisted = this.persistSession()
    // Attach now; cleanup still exposes the original error through lastRevoke.
    persisted.catch(() => {})
    const previousRevoke = this._lastRevoke
    this._lastRevoke = (async () => {
      // A subsequent revoke can retry a failed purge; a start cannot bypass it.
      await previousRevoke.catch(() => {})
      // A failed recording must still be deleted. lastError preserves the
      // capture failure; lastRevoke reports failure of deletion/persistence.
      await stopped.catch(() => {})
      await this._pendingChunkWrites
      await this.purgeAudioChunks()
      await persisted
    })()
    this._lastRevoke.catch(() => {})
  }

  /** Promise dell'ultima revoca (stop + cancellazione chunk) — awaitabile da UI e test */
  get lastRevoke(): Promise<void> {
    return this._lastRevoke
  }

  /** GDPR-DELETE: cancella TUTTI i chunk audio dal workspace con verifica post-operazione */
  async purgeAudioChunks(): Promise<void> {
    const entries = await this.store.list(PATHS.AUDIO_DIR)
    for (const entry of entries) {
      await this.store.delete(entry.path)
    }
    // Verifica: store.list vuoto — se non vuoto, retry una volta
    const remaining = await this.store.list(PATHS.AUDIO_DIR)
    if (remaining.length > 0) {
      for (const entry of remaining) {
        await this.store.delete(entry.path)
      }
      const stillThere = await this.store.list(PATHS.AUDIO_DIR)
      if (stillThere.length > 0) {
        throw new Error(
          `GDPR purge fallita: ${stillThere.length} chunk rimasti dopo retry`
        )
      }
    }
  }

  /** Avvia registrazione (chiede permesso microfono) */
  start(): Promise<void> {
    if (this._disposed || this._recording || !this._consent) return Promise.resolve()
    const generation = this._generation
    if (this._starting?.generation === generation) return this._starting.promise
    const promise = this.startGeneration(generation).finally(() => {
      if (this._starting?.generation === generation) this._starting = null
    })
    this._starting = { generation, promise }
    return promise
  }

  private currentGeneration(generation: number): boolean {
    return !this._disposed && this._consent && generation === this._generation
  }

  private async startGeneration(generation: number): Promise<void> {
    let stream: MediaStream | null = null
    let take: RecordingTake | null = null
    try {
      // New capture cannot race an old purge, old stop, or consent persistence.
      await this._lastRevoke
      await this._stopping
      await this._pendingChunkWrites
      await this._pendingSessionWrites
      if (!this.currentGeneration(generation)) return
      this._lastError = null
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!this.currentGeneration(generation)) {
        this.releaseStream(stream)
        return
      }

      const recorder = this.createMediaRecorder(stream)
      let resolveStopped!: () => void
      const stopped = new Promise<void>((resolve) => { resolveStopped = resolve })
      take = { recorder, stream, closed: false, discard: false, stopped, resolveStopped }
      const currentTake = take
      this._take = take
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.handleChunk(currentTake, event.data)
      }
      recorder.onstop = () => { this.finishTake(currentTake) }
      recorder.onerror = () => {
        if (this._take === currentTake) this.recordFailure(new Error("Audio recording failed"))
        currentTake.discard = true
        this.finishTake(currentTake)
      }
      recorder.start(30000)
      const actualStart = this.clock()
      this._chunkStartEpoch = actualStart
      if (this._chunkIndex === 0) this._startEpoch = actualStart
      this._recording = true
      await this.persistSession()
    } catch (error) {
      if (take) {
        take.discard = true
        try { if (take.recorder.state !== "inactive") take.recorder.stop() } catch { /* already stopped */ }
        this.finishTake(take)
      } else if (stream) {
        this.releaseStream(stream)
      }
      // An old permission rejection must not revoke a newer consent lifetime.
      if (this.currentGeneration(generation)) {
        this.recordFailure(error)
        this.consent = false
      }
    }
  }

  /**
   * Stop capture immediately, then drain the browser's FINAL dataavailable and
   * its writes. Normal stop preserves that tail; revocation/dispose discard it.
   * Cancelling a pending permission prompt cannot abort the browser promise,
   * but its eventual stream is released without ever constructing a recorder.
   */
  stop(): Promise<void> {
    this._generation++
    this._recording = false
    if (this._stopping) return this._stopping
    const take = this._take
    if (!take) return this.drainChunks()

    const stopping = (async () => {
      await take.stopped
      await this.drainChunks()
    })()
    this._stopping = stopping.finally(() => { this._stopping = null })
    if (take.recorder.state !== "inactive") {
      try {
        take.recorder.stop()
      } catch (error) {
        this.recordFailure(error)
        take.discard = true
        this.finishTake(take)
      }
    }
    // Do not keep the microphone alive while waiting for disk writes/events.
    this.releaseStream(take.stream)
    return this._stopping
  }

  /** Reimposta consenso senza persistere (per caricamento da session.yaml all'avvio) */
  setConsentFromSession(consent: boolean, startEpoch: number | null): void {
    if (this._disposed) return
    this._consent = consent
    this._startEpoch = startEpoch
  }

  /** Persiste session.yaml con stato corrente */
  private persistSession(): Promise<void> {
    const yaml = serializeSessionYaml({
      v: 1,
      created: this.clock(),
      audioConsent: this._consent,
      audioStartEpoch: this._startEpoch,
    })
    // Snapshot NOW, serialize writes. A slow ON may never overwrite a later OFF.
    this._pendingSessionWrites = this._pendingSessionWrites.catch(() => {})
      .then(() => this.store.saveSessionYaml(yaml))
    return this._pendingSessionWrites
  }

  /** Gestisce un chunk ricevuto da MediaRecorder */
  private handleChunk(take: RecordingTake, data: Blob): void {
    if (this._take !== take || take.closed || take.discard || !this._consent || this._disposed) return
    const now = this.clock()
    const chunkStart = this._chunkStartEpoch ?? now
    const index = this._chunkIndex
    const fileName = `${PATHS.AUDIO_DIR}chunk-${index}.webm`

    // Incrementa PRIMA dell'await per evitare race su chunkIndex
    this._chunkIndex++
    this._chunkStartEpoch = now

    this._pendingChunkWrites = this._pendingChunkWrites
      .then(async () => {
        if (take.discard || !this._consent || this._disposed) return
        await this.store.write(fileName, data)
        // Revocation may have arrived DURING an unabortable write. Its cleanup
        // drains this queue before deleting; never publish a post-revoke marker.
        if (!take.discard && this._consent && !this._disposed) await this.onChunk?.(index, chunkStart, now)
      })
      .catch((error: unknown) => { this.recordFailure(error) })
  }

  private recordFailure(error: unknown): void {
    this._lastError ??= error instanceof Error ? error : new Error("Audio capture could not be saved", { cause: error })
  }

  private async drainChunks(): Promise<void> {
    await this._pendingChunkWrites
    if (this._lastError) throw this._lastError
  }

  private finishTake(take: RecordingTake): void {
    take.closed = true
    this.releaseStream(take.stream)
    if (this._take === take) {
      this._take = null
      this._recording = false
    }
    take.resolveStopped()
  }

  private releaseStream(stream: MediaStream): void {
    for (const track of stream.getTracks()) track.stop()
  }

  /**
   * Terminal close (unmount): cancels pending capture, preserves already
   * authorized history. Explicit consent=false is the durable revoke/purge.
   */
  dispose(): void {
    this._disposed = true
    if (this._take) this._take.discard = true
    this.stop().catch(() => {})
    this._consent = false
    this._startEpoch = null
    this._chunkIndex = 0
    this._chunkStartEpoch = null
  }
}
