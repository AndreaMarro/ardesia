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
  onChunk?: (chunkIndex: number, startEpoch: number, endEpoch: number) => void
  /** Factory MediaRecorder iniettabile per test */
  createMediaRecorder?: (stream: MediaStream) => MediaRecorder
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
  private onChunk: ((chunkIndex: number, startEpoch: number, endEpoch: number) => void) | undefined
  private _consent: boolean = false
  private _recording: boolean = false
  private _startEpoch: number | null = null
  private _chunkIndex: number = 0
  private _mediaRecorder: MediaRecorder | null = null
  private _stream: MediaStream | null = null
  private _chunkStartEpoch: number | null = null
  private createMediaRecorder: (stream: MediaStream) => MediaRecorder

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

  /**
   * Imposta il consenso e persiste in session.yaml.
   * Se consent passa da false→true: registra audioStartEpoch in session.yaml.
   * Se consent passa da true→false: ferma registrazione in corso.
   */
  set consent(val: boolean) {
    if (this._consent === val) return
    this._consent = val
    if (val) {
      this._startEpoch = this.clock()
      this._chunkStartEpoch = this._startEpoch
      this._chunkIndex = 0
    }
    // Persiste SEMPRE: ON (audioConsent + startEpoch) e OFF (revoca)
    this.persistSession().catch(() => {})
    if (!val) {
      this.stop().catch(() => {})
    }
  }

  /** Avvia registrazione (chiede permesso microfono) */
  async start(): Promise<void> {
    if (this._recording || !this._consent) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this._stream = stream

      const recorder = this.createMediaRecorder(stream)
      this._mediaRecorder = recorder

      // Salva chunk ogni 30s
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.handleChunk(event.data).catch(() => {})
        }
      }

      recorder.onerror = () => {
        this.stopInternal()
      }

      recorder.onstop = () => {
        this.stopInternal()
        this.releaseStream()
      }

      recorder.start(30000) // timeslice = 30s
      this._recording = true
    } catch {
      // Permesso microfono negato — registrazione non parte, revoca persistita
      this._consent = false
      this._recording = false
      this.persistSession().catch(() => {})
    }
  }

  /** Ferma registrazione */
  async stop(): Promise<void> {
    if (!this._recording) return

    if (this._mediaRecorder && this._mediaRecorder.state !== "inactive") {
      this._mediaRecorder.stop()
    } else {
      this.stopInternal()
      this.releaseStream()
    }
  }

  /** Reimposta consenso senza persistere (per caricamento da session.yaml all'avvio) */
  setConsentFromSession(consent: boolean, startEpoch: number | null): void {
    this._consent = consent
    this._startEpoch = startEpoch
  }

  /** Persiste session.yaml con stato corrente */
  private async persistSession(): Promise<void> {
    const yaml = serializeSessionYaml({
      v: 1,
      created: this.clock(),
      audioConsent: this._consent,
      audioStartEpoch: this._startEpoch,
    })
    await this.store.saveSessionYaml(yaml)
  }

  /** Gestisce un chunk ricevuto da MediaRecorder */
  private async handleChunk(data: Blob): Promise<void> {
    if (!this._recording) return
    const now = this.clock()
    const chunkStart = this._chunkStartEpoch ?? now
    const index = this._chunkIndex
    const fileName = `raw/audio/chunk-${index}.webm`

    // Incrementa PRIMA dell'await per evitare race su chunkIndex
    this._chunkIndex++
    this._chunkStartEpoch = now

    this.onChunk?.(index, chunkStart, now)

    await this.store.write(fileName, data)
  }

  private stopInternal(): void {
    this._recording = false
    this._mediaRecorder = null
  }

  private releaseStream(): void {
    if (this._stream) {
      for (const track of this._stream.getTracks()) {
        track.stop()
      }
      this._stream = null
    }
  }

  /** Rilascia risorse (da chiamare su unmount) */
  dispose(): void {
    if (this._recording) {
      this.stop().catch(() => {})
    }
    this._consent = false
    this._startEpoch = null
    this._chunkIndex = 0
    this._chunkStartEpoch = null
  }
}
