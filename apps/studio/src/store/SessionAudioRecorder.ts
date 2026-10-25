import type { WorkspaceStore } from "./WorkspaceStore"
import type { JournalRecorder } from "./JournalRecorder"
import { sessionPaths, type LessonSessionIdentityV1, type SessionSnapshotV2 } from "./sessionState"
import { audioExtension, audioSha256, readAudioSession, snapshotAudioObjectRefs, type AudioObjectReference, type AudioRecordingRef } from "./audioRecording"
import { purgeSessionImportAudioCopies } from "./lessonImportTransaction"
import { withDrainedAudioCaptureLeases, withAudioCaptureTransition, originAudioCaptureSafety, registerAudioCaptureLease, type AudioCaptureLease } from "./lessonMutationLock"

type RevocationNotice = Readonly<{ v: 1; scope: string; lessonId: string; sessionId: string; sha256: string }>
type RevocationListener = (notice: RevocationNotice) => Promise<void>
const revocationListeners = new Set<RevocationListener>()
const localBackendScopes = new WeakMap<object, string>()
const REVOCATION_CHANNEL = "ardesia:canonical-audio-revocation:v1"
let channel: BroadcastChannel | null = null
let channelUsers = 0

function coordinationScope(store: WorkspaceStore, requireCapture = false): string | null {
  const backend = store.audioCaptureCoordinationBackend()
  if (backend.kind === "filesystem") {
    // Directory names and copied session IDs cannot establish cross-tab identity.
    // Until native isSameEntry coordination exists, do not open a live microphone.
    if (requireCapture) throw new Error("Registrazione audio su cartella sospesa: coordinamento della revoca tra viste non disponibile. Usa l'archivio locale del browser.")
    return null
  }
  if (backend.kind === "local-storage") {
    if (requireCapture && (originAudioCaptureSafety !== "origin-exclusive" || typeof BroadcastChannel !== "function")) {
      throw new Error("Registrazione audio sospesa: questo browser non coordina la revoca tra viste")
    }
    return "local-storage"
  }
  let scope = localBackendScopes.get(backend.identity)
  if (!scope) { scope = `memory-${crypto.randomUUID()}`; localBackendScopes.set(backend.identity, scope) }
  return scope
}
function parseNotice(value: unknown): RevocationNotice | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null
  const notice = value as Record<string, unknown>
  if (Object.keys(notice).sort().join(",") !== "lessonId,scope,sessionId,sha256,v" || notice.v !== 1 || notice.scope !== "local-storage" || typeof notice.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(notice.sha256)) return null
  if (typeof notice.lessonId !== "string" || typeof notice.sessionId !== "string") return null
  try { sessionPaths({ lessonId: notice.lessonId, sessionId: notice.sessionId }) } catch { return null }
  return notice as RevocationNotice
}
function openRevocationChannel(): BroadcastChannel {
  const next = new BroadcastChannel(REVOCATION_CHANNEL)
  next.onmessage = (event: MessageEvent<unknown>) => {
    const notice = parseNotice(event.data)
    if (notice) for (const listener of revocationListeners) void listener(notice).catch(() => {})
  }
  return next
}
function subscribeRevocation(scope: string, listener: RevocationListener): () => void {
  revocationListeners.add(listener)
  if (scope === "local-storage" && typeof BroadcastChannel === "function") {
    channel ??= openRevocationChannel(); channelUsers++
  }
  return () => {
    revocationListeners.delete(listener)
    if (scope === "local-storage" && channelUsers > 0 && --channelUsers === 0) { channel?.close(); channel = null }
  }
}
async function invalidateCaptures(store: WorkspaceStore, snapshot: SessionSnapshotV2, purge: () => Promise<void>): Promise<void> {
  const scope = coordinationScope(store)
  if (scope === null) return purge() // This backend cannot start a live capture.
  const notice: RevocationNotice = { v: 1, scope, lessonId: snapshot.value.lessonId, sessionId: snapshot.value.sessionId, sha256: snapshot.sha256 }
  let temporary: BroadcastChannel | null = null
  let transportFailure: unknown = null
  try {
    if (scope === "local-storage") {
      // A notice can only invalidate; receivers always read canonical consent.
      try {
        const transport = channel ?? (temporary = openRevocationChannel())
        transport.postMessage(notice)
      } catch (error) { transportFailure = error }
    }
    const invalidations = await Promise.allSettled([...revocationListeners].map((listener) => listener(notice)))
    if (transportFailure) {
      await purge()
      throw new Error("Revoca audio tra viste non confermata: canale non disponibile", { cause: transportFailure })
    }
    // CAS/stop writes have completed before taking this distinct lifetime barrier.
    await withDrainedAudioCaptureLeases(scope, notice.lessonId, notice.sessionId, purge)
    const failed = invalidations.find((result) => result.status === "rejected")
    if (failed?.status === "rejected") throw failed.reason
  } finally { temporary?.close() }
}

export type SessionAudioState = Readonly<{
  stage: "idle" | "requesting" | "recording" | "saving" | "revoking" | "error" | "disposed"
  error: string | null
  lastRecording: AudioRecordingRef | null
}>
export interface SessionAudioRecorderOptions {
  store: WorkspaceStore
  identity: LessonSessionIdentityV1
  journal: JournalRecorder
  clock?: () => number
  monotonicClock?: () => number
  createMediaRecorder?: (stream: MediaStream) => MediaRecorder
}
type Take = {
  id: string; recorder: MediaRecorder; stream: MediaStream; chunks: Blob[]
  startEpoch: number; monotonicStart: number; durationMs: number | null; consentSha256: string
  refs: readonly AudioObjectReference[]; closed: boolean; discard: boolean; failure: Error | null
  stopped: Promise<void>; finish(): void; result: Promise<AudioRecordingRef | null> | null
}

async function persistAudioRevocation(store: WorkspaceStore, identity: LessonSessionIdentityV1): Promise<SessionSnapshotV2> {
  const current = await readAudioSession(store, identity)
  if (!current) throw new Error("Sessione audio da revocare non trovata")
  const result = await store.updateSessionAudioCAS(identity, { expectedSha256: current.sha256, audioConsent: false, audioStartEpoch: null })
  if (result.kind !== "updated" && result.kind !== "idempotent") throw new Error(`Revoca audio non salvata: ${result.kind}`)
  return result.snapshot
}
async function purgeStoredSessionAudio(store: WorkspaceStore, identity: LessonSessionIdentityV1): Promise<void> {
  const prefix = sessionPaths(identity).audioDir
  for (const entry of await store.list(prefix)) await store.delete(entry.path)
  await purgeSessionImportAudioCopies(store, identity)
  if ((await store.list(prefix)).length > 0) throw new Error("Cancellazione audio incompleta: riprova la revoca")
}
/** Explicit revocation of a historical, inactive session selected by the teacher after reopen/import. */
export async function revokeStoredAudioSession(store: WorkspaceStore, identity: LessonSessionIdentityV1): Promise<void> {
  await revokeCanonicalSession(store, identity)
}
async function revokeCanonicalSession(store: WorkspaceStore, identity: LessonSessionIdentityV1): Promise<SessionSnapshotV2> {
  const scope = coordinationScope(store)
  const revoke = async () => {
    const snapshot = await persistAudioRevocation(store, identity)
    await invalidateCaptures(store, snapshot, () => purgeStoredSessionAudio(store, identity))
    return snapshot
  }
  return scope ? withAudioCaptureTransition(scope, identity.lessonId, identity.sessionId, "exclusive", revoke) : revoke()
}

/** Session-scoped capture. Saved consent never starts a microphone on reopen. */
export class SessionAudioRecorder {
  readonly identity: LessonSessionIdentityV1
  private readonly options: SessionAudioRecorderOptions
  private readonly clock: () => number
  private readonly mono: () => number
  private session: SessionSnapshotV2 | null = null
  private initialization: Promise<void> | null = null
  private sessionWrites: Promise<void> = Promise.resolve()
  private generation = 0
  private disposed = false
  private take: Take | null = null
  private starting: Promise<void> | null = null
  private revoking: Promise<void> = Promise.resolve()
  private refs: readonly AudioObjectReference[] = []
  private listeners = new Set<() => void>()
  private state: SessionAudioState = { stage: "idle", error: null, lastRecording: null }
  private captureLease: AudioCaptureLease | null = null
  private scope: string | null = null
  private unsubscribeRevocation: (() => void) | null = null

  constructor(options: SessionAudioRecorderOptions) {
    sessionPaths(options.identity)
    this.identity = Object.freeze({ lessonId: options.identity.lessonId, sessionId: options.identity.sessionId })
    this.options = options
    this.clock = options.clock ?? (() => Date.now())
    this.mono = options.monotonicClock ?? (() => performance.now())
  }
  get recording(): boolean { return this.state.stage === "recording" }
  captureUnavailableReason(): string | null {
    try { coordinationScope(this.options.store, true); return null }
    catch (error) { return this.message(error) }
  }
  getSnapshot = (): SessionAudioState => this.state
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(stage: SessionAudioState["stage"], error: string | null = null, lastRecording = this.state.lastRecording): void {
    this.state = Object.freeze({ stage, error, lastRecording })
    for (const listener of this.listeners) listener()
  }
  initialize(): Promise<void> {
    if (this.initialization) return this.initialization
    this.initialization = (async () => {
      this.session = await readAudioSession(this.options.store, this.identity)
      if (!this.session) {
        const created = await this.options.store.createSessionOnce(this.identity, { created: this.clock() })
        if (created.kind !== "created" && created.kind !== "idempotent") throw new Error(`Sessione audio non disponibile: ${created.kind}`)
        this.session = created.snapshot
      }
      this.scope = coordinationScope(this.options.store)
      if (!this.disposed && this.scope) this.unsubscribeRevocation = subscribeRevocation(this.scope, this.invalidate)
    })()
    return this.initialization
  }
  private releaseCaptureLease(): Promise<void> {
    const lease = this.captureLease
    this.captureLease = null
    return lease?.release() ?? Promise.resolve()
  }
  private hasCurrentConsent = async (): Promise<boolean> => {
    const current = await readAudioSession(this.options.store, this.identity)
    return current?.value.audioConsent === true && current.sha256 === this.session?.sha256
  }
  private invalidate = async (notice: RevocationNotice): Promise<void> => {
    if (notice.scope !== this.scope || notice.lessonId !== this.identity.lessonId || notice.sessionId !== this.identity.sessionId) return
    try {
      const current = await readAudioSession(this.options.store, this.identity)
      // A delayed OFF notice cannot demote a fresh, explicitly consented ON.
      // A different canonical hash invalidates an older take even after a newer ON.
      if (current?.value.audioConsent && current.sha256 === this.session?.sha256) return
      if (current?.sha256 !== notice.sha256 && current?.sha256 === this.session?.sha256) return
      const queuedIntent = this.state.stage === "requesting" && this.captureLease === null
      this.generation++
      if (this.take) this.take.discard = true
      this.session = current
      await this.stop().catch(() => {})
      if (queuedIntent && !this.disposed) this.publish("error", "Consenso cambiato in un'altra vista. Premi Registra di nuovo per confermare.", null)
      else if (this.state.stage !== "revoking" && this.state.stage !== "error") this.publish(this.disposed ? "disposed" : "idle", null, null)
    } catch (error) {
      this.generation++
      if (this.take) this.take.discard = true
      await this.stop().catch(() => {})
      this.publish("error", this.message(error))
      throw error
    }
  }
  setObjectRefs(refs: readonly AudioObjectReference[]): void {
    this.refs = snapshotAudioObjectRefs(refs)
    if (this.take && !this.take.closed) this.take.refs = this.refs
  }
  private consent(value: boolean, epoch: number | null): Promise<void> {
    const change = this.sessionWrites.then(async () => {
      await this.initialize()
      if (!this.session) throw new Error("Sessione audio assente")
      const result = await this.options.store.updateSessionAudioCAS(this.identity, {
        expectedSha256: this.session.sha256, audioConsent: value, audioStartEpoch: epoch,
      })
      if (result.kind !== "updated" && result.kind !== "idempotent") {
        // Never retry an old ON against a newer decision.
        this.session = await readAudioSession(this.options.store, this.identity)
        throw new Error(`Consenso audio modificato da un'altra vista: ${result.kind}`)
      }
      this.session = result.snapshot
    })
    this.sessionWrites = change.catch(() => {})
    return change
  }
  start(): Promise<void> {
    if (this.disposed || this.recording) return Promise.resolve()
    if (this.starting) return this.starting
    const generation = ++this.generation
    this.publish("requesting")
    const current = () => !this.disposed && generation === this.generation
    const work = (async () => {
      let stream: MediaStream | null = null
      try {
        await this.revoking
        if (this.take?.result) await this.take.result
        await this.initialize()
        if (!current()) return
        const scope = coordinationScope(this.options.store, true)!
        await withAudioCaptureTransition(scope, this.identity.lessonId, this.identity.sessionId, "shared", async () => {
          const lease = await registerAudioCaptureLease(scope, this.identity.lessonId, this.identity.sessionId)
          if (!current()) { await lease.release(); return }
          this.captureLease = lease
          if (coordinationScope(this.options.store, true) !== scope) throw new Error("Archivio audio modificato durante l'avvio")
          await this.consent(true, this.clock())
        })
        if (!current()) return
        if (!await this.hasCurrentConsent()) { await this.releaseCaptureLease(); this.publish("idle", null, null); return }
        stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 }, video: false })
        if (!current() || !await this.hasCurrentConsent()) { this.release(stream); await this.releaseCaptureLease(); return }
        await withAudioCaptureTransition(scope, this.identity.lessonId, this.identity.sessionId, "shared", async () => {
        if (!current() || !await this.hasCurrentConsent()) { this.release(stream!); await this.releaseCaptureLease(); return }
        const recorder = this.options.createMediaRecorder?.(stream!) ?? new MediaRecorder(stream!)
        let finish!: () => void
        const stopped = new Promise<void>((resolve) => { finish = resolve })
        const take: Take = {
          id: crypto.randomUUID(), recorder, stream: stream!, chunks: [], startEpoch: this.clock(), monotonicStart: this.mono(),
          durationMs: null, consentSha256: "", refs: this.refs, closed: false, discard: false, failure: null,
          stopped, finish, result: null,
        }
        this.take = take
        recorder.ondataavailable = (event) => { if (!take.closed && !take.discard && event.data.size > 0) take.chunks.push(event.data) }
        recorder.onstop = () => {
          take.durationMs ??= Math.max(0, Math.round(this.mono() - take.monotonicStart))
          take.closed = true
          this.release(take.stream)
          take.finish()
          if (!take.result) void this.stop().catch(() => {})
        }
        recorder.onerror = () => {
          take.failure = new Error("Registrazione audio interrotta dal browser")
          this.publish("error", take.failure.message)
          this.release(take.stream)
          void this.stop().catch(() => {})
        }
        recorder.start(30000)
        take.startEpoch = this.clock()
        take.monotonicStart = this.mono()
        await this.consent(true, take.startEpoch)
        take.consentSha256 = this.session!.sha256
        if (!current()) return
        this.publish("recording")
        })
      } catch (error) {
        const report = current()
        if (stream) this.release(stream)
        if (this.take) {
          const take = this.take
          take.discard = true
          take.failure = error instanceof Error ? error : new Error(this.message(error))
          // start() may throw before a native recording exists: no onstop will
          // arrive in that case. A running recorder still drains its real tail.
          if (take.recorder.state === "inactive" && !take.closed) { take.closed = true; take.finish() }
          void this.stop().catch(() => {})
        } else await this.releaseCaptureLease()
        if (report) this.publish("error", this.message(error))
        throw error
      }
    })()
    this.starting = work.finally(() => { this.starting = null })
    return this.starting
  }
  /** Native stop and track release happen synchronously; the promise includes final bytes and marker. */
  stop(): Promise<AudioRecordingRef | null> {
    this.generation++
    const take = this.take
    if (!take) {
      if (!this.disposed && this.state.stage === "requesting") this.publish("idle")
      return this.releaseCaptureLease().then(() => null)
    }
    if (take.result) return take.result
    take.durationMs ??= Math.max(0, Math.round(this.mono() - take.monotonicStart))
    if (!take.discard && !take.failure) this.publish("saving")
    const result = (async () => {
      try {
        await take.stopped
        await this.sessionWrites
        const saved = await this.persist(take)
        if (this.state.stage !== "revoking") this.publish(this.disposed ? "disposed" : "idle", null, saved ?? this.state.lastRecording)
        return saved
      } catch (error) {
        this.publish("error", this.message(error))
        throw error
      } finally {
        if (this.take === take) this.take = null
        await this.releaseCaptureLease()
      }
    })()
    take.result = result
    try {
      if (take.recorder.state !== "inactive") take.recorder.stop()
    } catch (error) {
      take.failure = error instanceof Error ? error : new Error("Arresto audio fallito")
      take.closed = true; take.finish()
    }
    this.release(take.stream)
    return result
  }
  private async persist(take: Take): Promise<AudioRecordingRef | null> {
    if (take.failure) throw take.failure
    if (take.discard) return null
    if (take.chunks.length === 0) throw new Error("Nessun dato audio ricevuto dal browser")
    const mimeType = take.recorder.mimeType || take.chunks[0]!.type
    const data = new Blob(take.chunks, { type: mimeType })
    const ref: AudioRecordingRef = Object.freeze({
      v: 1, recordingId: take.id, assetPath: `${sessionPaths(this.identity).audioDir}${take.id}.${audioExtension(mimeType)}`,
      mimeType, sha256: await audioSha256(data), bytes: data.size, startEpoch: take.startEpoch,
      endEpoch: take.startEpoch + take.durationMs!, durationMs: take.durationMs!, objectRefs: take.refs,
    })
    const authorized = async () => {
      const current = await readAudioSession(this.options.store, this.identity)
      return !take.discard && current?.value.audioConsent === true && current.sha256 === take.consentSha256
    }
    if (!await authorized()) return null
    await this.options.store.write(ref.assetPath, data)
    if (!await authorized()) { await this.options.store.delete(ref.assetPath); return null }
    const readback = await this.options.store.read(ref.assetPath)
    if (!readback || readback.size !== ref.bytes || await audioSha256(readback) !== ref.sha256) throw new Error("Verifica dei dati audio salvati fallita")
    if (!await authorized()) { await this.options.store.delete(ref.assetPath); return null }
    await this.options.journal.recordAudioRecording(ref)
    return ref
  }
  /** Revocation invalidates pending permission immediately, then waits for write drain and verified purge. */
  revoke(): Promise<void> {
    this.generation++
    if (this.take) this.take.discard = true
    const stopped = this.stop()
    stopped.catch(() => {})
    this.publish("revoking")
    const previous = this.revoking
    this.revoking = (async () => {
      await previous.catch(() => {})
      await this.initialize()
      // Refresh only OFF; an old ON is never silently replayed after a conflict.
      await this.sessionWrites
      this.session = await revokeCanonicalSession(this.options.store, this.identity)
      await stopped.catch(() => {})
      this.publish(this.disposed ? "disposed" : "idle", null, null)
    })().catch((error) => { this.publish("error", this.message(error)); throw error })
    return this.revoking
  }
  /** Technical close preserves an authorized take; durable deletion is revoke(). */
  dispose(): Promise<void> {
    this.disposed = true
    this.unsubscribeRevocation?.(); this.unsubscribeRevocation = null
    return this.stop().then(() => { this.publish("disposed") })
  }
  private release(stream: MediaStream): void { for (const track of stream.getTracks()) track.stop() }
  private message(error: unknown): string { return error instanceof Error ? error.message : "Salvataggio audio fallito" }
}
