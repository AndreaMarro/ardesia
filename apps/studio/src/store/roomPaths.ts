export type RoomPaths = {
  scene: string
  meta: string
  journal: string
  session: string
  audioDir: string
  lessonOsSnapshot: string
}

const MAX_ROOM_ID_LENGTH = 128
const SAFE_ROOM_ID = /^[a-z0-9][a-z0-9._-]*$/
const WINDOWS_DEVICE_NAME = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/

function containsPathSeparatorOrControl(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0
    if (character === "/" || character === "\\" || codePoint <= 31 || codePoint === 127) {
      return true
    }
  }
  return false
}

/**
 * Validates a room identifier without normalizing it. Storage ownership must
 * never depend on trimming, decoding, or otherwise guessing the caller's ID.
 */
export function validateRoomId(room: string): string {
  if (typeof room !== "string") {
    throw new TypeError("Invalid room id: expected a string")
  }
  if (room.length === 0) {
    throw new Error("Invalid room id: empty")
  }
  if (room.length > MAX_ROOM_ID_LENGTH) {
    throw new Error(`Invalid room id: maximum length is ${MAX_ROOM_ID_LENGTH}`)
  }
  if (room === "." || room === "..") {
    throw new Error("Invalid room id: dot segments are not allowed")
  }
  if (containsPathSeparatorOrControl(room)) {
    throw new Error("Invalid room id: path separators and controls are not allowed")
  }
  if (!SAFE_ROOM_ID.test(room)) {
    throw new Error("Invalid room id: use lowercase ASCII letters, digits, dot, underscore, or hyphen")
  }
  if (room.endsWith(".")) {
    throw new Error("Invalid room id: trailing dots are not portable")
  }
  if (WINDOWS_DEVICE_NAME.test(room)) {
    throw new Error("Invalid room id: reserved filesystem device name")
  }
  return room
}

/** Returns the complete room-owned workspace layout for a validated ID. */
export function roomPaths(room: string): RoomPaths {
  const id = validateRoomId(room)
  const root = `raw/${id}`
  return {
    scene: `${root}/board.excalidraw`,
    meta: `${root}/meta.json`,
    journal: `${root}/events.jsonl`,
    session: `${root}/session.yaml`,
    audioDir: `${root}/audio/`,
    lessonOsSnapshot: `${root}/lessonos-events.jsonl`,
  }
}
