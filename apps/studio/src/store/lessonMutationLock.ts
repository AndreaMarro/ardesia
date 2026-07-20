// ARDESIA Studio — origin-wide mutation lock foundation.
// Web Locks garantisce esclusione fra tab dello stesso origin; il fallback
// in-process resta utilizzabile ma dichiara esplicitamente safety local-only.

import { validateRoomId } from "./roomPaths"

export type MutationSafety = "origin-exclusive" | "local-only"
export type MutationLockMode = "shared" | "exclusive"

export type MutationLockOptions = Readonly<{
  mode: MutationLockMode
}>

export interface MutationLockBroker {
  readonly safety: MutationSafety
  request<T>(
    name: string,
    options: MutationLockOptions,
    work: () => Promise<T>,
  ): Promise<T>
}

/**
 * Coordinator non reentrant: una callback eseguita sotto lease non deve
 * riacquisire questo coordinator. Il codice già protetto deve usare la porta
 * driver interna, non una public operation che acquisirebbe nuovamente i lock.
 */
export interface LessonMutationCoordinator {
  readonly safety: MutationSafety
  withPathMutation<T>(path: string, work: () => Promise<T>): Promise<T>
  withWorkspaceExclusive<T>(work: () => Promise<T>): Promise<T>
}

export const WORKSPACE_MUTATION_LOCK = "ardesia:workspace-mutation"

export function lessonMutationLockName(lessonId: string): string {
  const validLessonId = validateRoomId(lessonId)
  return `ardesia:lesson-mutation:${asciiCaseFold(validLessonId)}`
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
          void Promise.resolve().then(work).then(resolve, reject).finally(() => {
            if (options.mode === "shared") state.readers -= 1
            else state.writer = false
            this.drain(name)
          })
        },
      }
      this.state(name).queue.push(queued)
      this.drain(name)
    })
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
  ? new WebLocksMutationLockBroker(browserLocks)
  : localOnlyBroker

export function createLessonMutationCoordinator(
  broker: MutationLockBroker = originBroker,
): LessonMutationCoordinator {
  return new DefaultLessonMutationCoordinator(broker)
}

/** Condiviso da tutte le WorkspaceStore di questo realm. */
export const originLessonMutationCoordinator = createLessonMutationCoordinator()
