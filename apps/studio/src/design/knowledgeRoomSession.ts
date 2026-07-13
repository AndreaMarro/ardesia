import type { AppendedEvent } from "../lessonos/eventlog"
import { validateRoomId } from "../store/roomPaths"

function bySequence(a: AppendedEvent, b: AppendedEvent): number {
  return a.seq - b.seq
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
  const selected = [...selectRoomSession(events, room)]
  const selectedSequences = new Set(selected.map((event) => event.seq))
  const candidatePackIds = new Set(
    selected
      .filter((event) => event.kind === "error.observed")
      .map((event) => `sp-${event.errorId}`),
  )
  const selectedGeneratedSequences = new Set<number>()
  const selectedGeneratedPackIds = new Set<string>()
  const foreignGeneratedPackIds = new Set<string>()
  const sortedEvents = [...events].sort(bySequence)

  for (const event of sortedEvents) {
    if (event.kind !== "studentpack.generated") continue
    const belongsToRoom =
      event.fromRoom !== undefined
        ? event.fromRoom === room
        : candidatePackIds.has(event.packId)
    if (belongsToRoom) {
      selectedGeneratedSequences.add(event.seq)
      selectedGeneratedPackIds.add(event.packId)
    } else if (event.fromRoom !== undefined) {
      foreignGeneratedPackIds.add(event.packId)
    }
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
      selectedGeneratedPackIds.has(event.packId) &&
      !foreignGeneratedPackIds.has(event.packId)
    ) {
      if (!selectedSequences.has(event.seq)) {
        selected.push(event)
        selectedSequences.add(event.seq)
      }
    }
  }

  return selected.sort(bySequence)
}
