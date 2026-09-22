import { UNASSIGNED_LESSON_ID } from "../lessonos/eventlog"

export type RoomPaths = {
  scene: string
  meta: string
  journal: string
  session: string
  audioDir: string
  lessonOsSnapshot: string
}

const ROOM_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/
const WINDOWS_DEVICE_PATTERN = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i
const RESERVED_ROOM_ROOTS = new Set([
  "audio",
  "board.excalidraw",
  "events.jsonl",
  "session.yaml",
  "lessonos-events.jsonl",
])

export function validateRoomId(room: string): string {
  if (
    !ROOM_ID_PATTERN.test(room) ||
    room === "." ||
    room === ".." ||
    room.endsWith(".") ||
    WINDOWS_DEVICE_PATTERN.test(room) ||
    RESERVED_ROOM_ROOTS.has(room.toLowerCase())
  ) {
    throw new Error("Invalid room identifier")
  }
  return room
}

/**
 * Identità stanza per i percorsi di PRODOTTO (UI, export/import, sessioni,
 * recorder). Riserva il contenitore tecnico di recovery: lo strato storage
 * (validateRoomId/roomPaths) e gli envelope LessonOS restano capaci di
 * leggerlo e scriverlo, così i byte esistenti e la recovery non si rompono.
 * Solo la creazione/selezione di lezioni ordinarie lo rifiuta, con esito
 * esplicito e senza migrare o rinominare dati.
 */
export function validateProductRoomId(room: string): string {
  const validRoom = validateRoomId(room)
  if (validRoom === UNASSIGNED_LESSON_ID) {
    throw new Error(
      `Reserved room identifier "${UNASSIGNED_LESSON_ID}": it names the LessonOS recovery container, not a product lesson`,
    )
  }
  return validRoom
}

export function roomPaths(room: string): RoomPaths {
  const validRoom = validateRoomId(room)
  const root = `raw/${validRoom}`
  return {
    scene: `${root}/board.excalidraw`,
    meta: `${root}/meta.json`,
    journal: `${root}/events.jsonl`,
    session: `${root}/session.yaml`,
    audioDir: `${root}/audio/`,
    lessonOsSnapshot: `${root}/lessonos-events.jsonl`,
  }
}
