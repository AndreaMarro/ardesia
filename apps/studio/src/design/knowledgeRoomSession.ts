import type { AppendedEvent } from "../lessonos/eventlog"
import { validateRoomId } from "../store/roomPaths"

function bySequence(a: AppendedEvent, b: AppendedEvent): number {
  return a.seq - b.seq
}

function isStudentPackLifecycle(event: AppendedEvent): boolean {
  return event.kind === "studentpack.generated" || event.kind === "studentpack.exported"
}

function candidateOwnersByPackId(
  events: readonly AppendedEvent[],
): ReadonlyMap<string, ReadonlySet<string>> {
  const owners = new Map<string, Set<string>>()
  let activeRoom: string | null = null

  for (const event of events) {
    if (event.kind === "lesson.started") {
      activeRoom = event.room
      continue
    }
    if (event.kind === "lesson.ended") {
      activeRoom = null
      continue
    }
    if (activeRoom === null || event.kind !== "error.observed") continue
    const packId = `sp-${event.errorId}`
    const packOwners = owners.get(packId) ?? new Set<string>()
    packOwners.add(activeRoom)
    owners.set(packId, packOwners)
  }

  return owners
}

/**
 * Selects every segment owned by one room from the legacy app-wide event log.
 * A new lesson.started transfers ownership; timestamps never define boundaries.
 */
export function selectRoomSession(events: readonly AppendedEvent[], room: string): readonly AppendedEvent[] {
  validateRoomId(room)
  const selected: AppendedEvent[] = []
  let activeRoom: string | null = null

  for (const event of [...events].sort(bySequence)) {
    if (event.kind === "lesson.started") {
      activeRoom = event.room
      if (activeRoom === room) selected.push(event)
      continue
    }

    if (event.kind === "lesson.ended") {
      if (activeRoom === event.room && activeRoom === room) selected.push(event)
      // Any unmatched end makes the legacy stream ambiguous. Fail closed until
      // a later lesson.started establishes a new owner.
      activeRoom = null
      continue
    }

    if (activeRoom !== room) continue
    const explicitRoom = "room" in event ? event.room : undefined
    if (explicitRoom !== undefined && explicitRoom !== room) continue
    selected.push(event)
  }

  return selected
}

/**
 * Selects the dashboard projection for one room from the legacy app-wide log.
 * Student-pack lifecycle events may be appended after lesson.ended, so they
 * are retained only when their explicit room or derived candidate belongs to
 * the selected room. The original array and events are never mutated.
 */
export function selectDashboardRoomEvents(
  events: readonly AppendedEvent[],
  room: string,
): readonly AppendedEvent[] {
  const selected = selectRoomSession(events, room).filter((event) => !isStudentPackLifecycle(event))
  const selectedSequences = new Set(selected.map((event) => event.seq))
  const selectedGeneratedSequences = new Set<number>()
  const sortedEvents = [...events].sort(bySequence)
  const candidateOwners = candidateOwnersByPackId(sortedEvents)
  const generatedOwners = new Map<string, Set<string>>()

  for (const event of sortedEvents) {
    if (event.kind !== "studentpack.generated") continue
    const inferredOwners = candidateOwners.get(event.packId)
    const owner = event.fromRoom !== undefined
      ? event.fromRoom
      : inferredOwners?.size === 1
        ? [...inferredOwners][0]
        : undefined
    if (owner === undefined) continue
    const packOwners = generatedOwners.get(event.packId) ?? new Set<string>()
    packOwners.add(owner)
    generatedOwners.set(event.packId, packOwners)
    if (owner === room) selectedGeneratedSequences.add(event.seq)
  }

  for (const event of sortedEvents) {
    if (event.kind === "studentpack.generated" && selectedGeneratedSequences.has(event.seq)) {
      if (!selectedSequences.has(event.seq)) {
        selected.push(event)
        selectedSequences.add(event.seq)
      }
      continue
    }

    if (
      event.kind === "studentpack.exported" &&
      generatedOwners.get(event.packId)?.size === 1 &&
      generatedOwners.get(event.packId)?.has(room) === true
    ) {
      if (!selectedSequences.has(event.seq)) {
        selected.push(event)
        selectedSequences.add(event.seq)
      }
    }
  }

  return selected.sort(bySequence)
}
