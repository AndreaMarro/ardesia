// ARDESIA Studio — origin-wide mutation lock foundation.
// Web Locks garantisce esclusione fra tab dello stesso origin; il fallback
// in-process resta utilizzabile ma dichiara esplicitamente safety local-only.

import { validateRoomId } from "./roomPaths"

export type MutationSafety = "origin-exclusive" | "local-only"
export type MutationLockMode = "shared" | "exclusive"

export type MutationLockOptions = Readonly<{
  mode: MutationLockMode
}>

export type MutationTryLockResult<T> =
  | Readonly<{ acquired: true; value: T }>
  | Readonly<{ acquired: false }>

export interface MutationLockBroker {
  readonly safety: MutationSafety
  request<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<T>
  tryRequest<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<MutationTryLockResult<T>>
}

export type ActiveLessonRegistration = Readonly<{
  lessonId: string
  release(): Promise<void>
}>

export type InactiveLessonProbe =
  | Readonly<{ status: "inactive" }>
  | Readonly<{ status: "unavailable"; reason: "active" | "local-only" }>

/**
 * Coordinator non reentrant: una callback eseguita sotto lease non deve
 * riacquisire questo coordinator. Il codice già protetto deve usare la porta
 * driver interna, non una public operation che acquisirebbe nuovamente i lock.
 * Il lifetime activity resta una registration esplicita: un callback pubblico
 * potrebbe invertire activity -> workspace -> lesson. Il futuro macro-import
 * deve invece possedere internamente l'intero ordine workspace -> activity -> lesson.
 */
export interface LessonMutationCoordinator {
  readonly safety: MutationSafety
  withPathMutation<T>(path: string, work: () => Promise<T>): Promise<T>
  withWorkspaceExclusive<T>(work: () => Promise<T>): Promise<T>
  registerActiveLesson(lessonId: string): Promise<ActiveLessonRegistration>
  probeInactiveLesson(lessonId: string): Promise<InactiveLessonProbe>
}

export const WORKSPACE_MUTATION_LOCK = "ardesia:workspace-mutation"

export function lessonMutationLockName(lessonId: string): string {
  const validLessonId = validateRoomId(lessonId)
  return `ardesia:lesson-mutation:${asciiCaseFold(validLessonId)}`
}

function lessonActivityLockName(lessonId: string): string {
  const validLessonId = validateRoomId(lessonId)
  return `ardesia:lesson-active:${asciiCaseFold(validLessonId)}`
}

function asciiCaseFold(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => letter.toLowerCase())
}

function lessonIdFromPath(path: string): string | null {
  const segments = path.split("/")
  if (segments.length < 3 || segments[0] !== "raw") return null
  const lessonId = segments[1] ?? ""
  if (asciiCaseFold(lessonId) === ".ardesia") return null
  if (segments.slice(2).some((segment) => (
    segment === "" ||
    segment === "." ||
    segment === ".." ||
    /[\u0000-\u001f\u007f]/.test(segment)
  ))) {
    return null
  }
  try {
    return validateRoomId(lessonId)
  } catch {
    return null
  }
}

type QueuedLock = {
  mode: MutationLockMode
  start(): void
}

type InProcessLockState = {
  readers: number
  writer: boolean
  queue: QueuedLock[]
}

class InProcessMutationLockBroker implements MutationLockBroker {
  readonly safety = "local-only" as const
  private readonly states = new Map<string, InProcessLockState>()

  request<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queued: QueuedLock = {
        mode: options.mode,
        start: () => {
          const state = this.state(name)
          if (options.mode === "shared") state.readers += 1
          else state.writer = true
          void this.runGranted(name, options.mode, work).then(resolve, reject)
        },
      }
      this.state(name).queue.push(queued)
      this.drain(name)
    })
  }

  tryRequest<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<MutationTryLockResult<T>> {
    const state = this.state(name)
    const available = (
      state.queue.length === 0 &&
      !state.writer &&
      (options.mode === "shared" || state.readers === 0)
    )
    if (!available) {
      this.deleteIdleState(name, state)
      return Promise.resolve(Object.freeze({ acquired: false as const }))
    }

    if (options.mode === "shared") state.readers += 1
    else state.writer = true
    return this.runGranted(name, options.mode, work).then((value) => (
      Object.freeze({ acquired: true as const, value })
    ))
  }

  private async runGranted<T>(
    name: string,
    mode: MutationLockMode,
    work: () => Promise<T>,
  ): Promise<T> {
    try {
      return await work()
    } finally {
      const state = this.state(name)
      if (mode === "shared") state.readers -= 1
      else state.writer = false
      this.drain(name)
    }
  }

  private state(name: string): InProcessLockState {
    let state = this.states.get(name)
    if (!state) {
      state = { readers: 0, writer: false, queue: [] }
      this.states.set(name, state)
    }
    return state
  }

  private drain(name: string): void {
    const state = this.state(name)
    if (state.writer || state.queue.length === 0) {
      this.deleteIdleState(name, state)
      return
    }
    const next = state.queue[0]!
    if (next.mode === "exclusive") {
      if (state.readers > 0) return
      state.queue.shift()
      next.start()
      return
    }
    while (!state.writer && state.queue[0]?.mode === "shared") {
      state.queue.shift()!.start()
    }
  }

  private deleteIdleState(name: string, state: InProcessLockState): void {
    if (!state.writer && state.readers === 0 && state.queue.length === 0) {
      this.states.delete(name)
    }
  }
}

class WebLocksMutationLockBroker implements MutationLockBroker {
  readonly safety = "origin-exclusive" as const
  private readonly locks: LockManager

  constructor(locks: LockManager) {
    this.locks = locks
  }

  request<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<T> {
    return this.locks.request(name, { mode: options.mode }, (lock) => {
      if (lock === null) {
        return Promise.reject(new Error("Mutation lock not granted"))
      }
      return work()
    })
  }

  tryRequest<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<MutationTryLockResult<T>> {
    return this.locks.request(
      name,
      { mode: options.mode, ifAvailable: true },
      async (lock): Promise<MutationTryLockResult<T>> => {
        if (lock === null) {
          return Object.freeze({ acquired: false as const })
        }
        return Object.freeze({ acquired: true as const, value: await work() })
      },
    )
  }
}

export function createWebLocksMutationLockBroker(
  locks: LockManager,
): MutationLockBroker {
  return new WebLocksMutationLockBroker(locks)
}

class DefaultLessonMutationCoordinator implements LessonMutationCoordinator {
  readonly safety: MutationSafety
  private readonly broker: MutationLockBroker

  constructor(broker: MutationLockBroker) {
    this.broker = broker
    this.safety = broker.safety
  }

  withPathMutation<T>(path: string, work: () => Promise<T>): Promise<T> {
    const lessonId = lessonIdFromPath(path)
    if (lessonId === null) {
      return this.withWorkspaceExclusive(work)
    }
    return this.broker.request(
      WORKSPACE_MUTATION_LOCK,
      { mode: "shared" },
      () => this.broker.request(
        lessonMutationLockName(lessonId),
        { mode: "exclusive" },
        work,
      ),
    )
  }

  withWorkspaceExclusive<T>(work: () => Promise<T>): Promise<T> {
    return this.broker.request(WORKSPACE_MUTATION_LOCK, { mode: "exclusive" }, work)
  }

  async registerActiveLesson(lessonId: string): Promise<ActiveLessonRegistration> {
    const validLessonId = validateRoomId(lessonId)
    let releaseHold: (() => void) | undefined
    let releaseRequested = false
    const hold = new Promise<void>((resolve) => { releaseHold = resolve })
    let resolveGrant: ((registration: ActiveLessonRegistration) => void) | undefined
    let rejectGrant: ((error: unknown) => void) | undefined
    let granted = false
    const grant = new Promise<ActiveLessonRegistration>((resolve, reject) => {
      resolveGrant = resolve
      rejectGrant = reject
    })

    const completion = Promise.resolve().then(() => this.broker.request(
      lessonActivityLockName(validLessonId),
      { mode: "shared" },
      async () => {
        granted = true
        resolveGrant?.(registration)
        await hold
      },
    ))
    const registration: ActiveLessonRegistration = Object.freeze({
      lessonId: validLessonId,
      release: (): Promise<void> => {
        if (!releaseRequested) {
          releaseRequested = true
          releaseHold?.()
        }
        return completion
      },
    })
    void completion.catch((error) => {
      if (!granted) rejectGrant?.(error)
    })
    return grant
  }

  async probeInactiveLesson(lessonId: string): Promise<InactiveLessonProbe> {
    const lockName = lessonActivityLockName(lessonId)
    if (this.safety === "local-only") {
      return Object.freeze({ status: "unavailable", reason: "local-only" })
    }
    const attempt = await this.broker.tryRequest(
      lockName,
      { mode: "exclusive" },
      async () => undefined,
    )
    return attempt.acquired
      ? Object.freeze({ status: "inactive" })
      : Object.freeze({ status: "unavailable", reason: "active" })
  }
}

function browserLockManager(): LockManager | null {
  try {
    if (typeof navigator === "undefined") return null
    const locks = navigator.locks
    return locks && typeof locks.request === "function" ? locks : null
  } catch {
    return null
  }
}

const localOnlyBroker = new InProcessMutationLockBroker()
const browserLocks = browserLockManager()
const originBroker: MutationLockBroker = browserLocks
  ? createWebLocksMutationLockBroker(browserLocks)
  : localOnlyBroker

/** Capture lifetime is a separate namespace: never acquire it under a mutation lease. */
export type AudioCaptureLease = Readonly<{ release(): Promise<void> }>
export const originAudioCaptureSafety: MutationSafety = originBroker.safety

function audioCaptureBackendLock(scope: string): string {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(scope)) throw new Error("Audio capture scope invalid")
  return `ardesia:audio-capture:backend:${scope}`
}
function audioCaptureSessionLock(scope: string, lessonId: string, sessionId: string): string {
  return `${audioCaptureBackendLock(scope)}:session:${validateRoomId(lessonId)}:${sessionId}`
}
export async function registerAudioCaptureLease(scope: string, lessonId: string, sessionId: string): Promise<AudioCaptureLease> {
  let releaseHold!: () => void
  let grant!: (lease: AudioCaptureLease) => void
  let fail!: (error: unknown) => void
  const held = new Promise<void>((resolve) => { releaseHold = resolve })
  const acquired = new Promise<AudioCaptureLease>((resolve, reject) => { grant = resolve; fail = reject })
  let released = false
  const completion = originBroker.request(audioCaptureBackendLock(scope), { mode: "shared" }, () => (
    originBroker.request(audioCaptureSessionLock(scope, lessonId, sessionId), { mode: "shared" }, async () => {
      grant({ release: () => { if (!released) { released = true; releaseHold() }; return completion } })
      await held
    })
  ))
  void completion.catch(fail)
  return acquired
}
export function withDrainedAudioCaptureLeases<T>(scope: string, lessonId: string, sessionId: string, work: () => Promise<T>): Promise<T> {
  return originBroker.request(audioCaptureSessionLock(scope, lessonId, sessionId), { mode: "exclusive" }, work)
}
/** Short ON/start transitions release before permission prompts; OFF holds through purge. */
export function withAudioCaptureTransition<T>(scope: string, lessonId: string, sessionId: string, mode: MutationLockMode, work: () => Promise<T>): Promise<T> {
  return originBroker.request(`${audioCaptureSessionLock(scope, lessonId, sessionId)}:transition`, { mode }, work)
}
/** Switching a store while recording would move canonical reads to another backend. */
export async function withNoAudioCaptures<T>(scope: string, work: () => Promise<T>): Promise<T> {
  const result = await originBroker.tryRequest(audioCaptureBackendLock(scope), { mode: "exclusive" }, work)
  if (!result.acquired) throw new Error("Termina la registrazione audio prima di cambiare archivio")
  return result.value
}

export function createLessonMutationCoordinator(
  broker: MutationLockBroker = originBroker,
): LessonMutationCoordinator {
  return new DefaultLessonMutationCoordinator(broker)
}

/** Condiviso da tutte le WorkspaceStore di questo realm. */
export const originLessonMutationCoordinator = createLessonMutationCoordinator()
