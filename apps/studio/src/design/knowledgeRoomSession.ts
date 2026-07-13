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
