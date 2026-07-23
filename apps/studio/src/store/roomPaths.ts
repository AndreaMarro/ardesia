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
