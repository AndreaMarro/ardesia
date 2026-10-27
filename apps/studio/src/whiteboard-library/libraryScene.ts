import type { LibraryItems } from "@excalidraw/excalidraw/types"

// The SDK owns restore, import/merge, selection, insertion and rendering. This
// boundary only snapshots the lesson-owned payload for the existing save fence.
export const LIBRARY_LIMITS = Object.freeze({ items: 100, elements: 2000, bytes: 2 * 1024 * 1024 })

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function invalid(): never {
  throw new Error("Raccolta non valida o troppo grande. Usa fino a 100 schemi e 2000 elementi (2 MiB).")
}

function inspectTree(value: unknown, depth = 0, freezeNodes = false): void {
  if (depth > 80) invalid()
  if (value && typeof value === "object") {
    if (Object.hasOwn(value, "ardesiaInkV1")) {
      throw new Error("I tratti collaborativi restano nel proprio spazio: non possono essere copiati nella raccolta della lezione.")
    }
    for (const child of Object.values(value)) inspectTree(child, depth + 1, freezeNodes)
    if (freezeNodes) Object.freeze(value)
  }
}

/** Capture now: neither the SDK nor a queued callback may mutate saved bytes. */
export function snapshotLibraryItems(value: unknown): LibraryItems {
  if (!Array.isArray(value) || value.length > LIBRARY_LIMITS.items) invalid()
  const ids = new Set<string>()
  let count = 0
  for (const item of value) {
    if (!record(item) || typeof item.id !== "string" || !item.id || ids.has(item.id) ||
      (item.status !== "published" && item.status !== "unpublished") ||
      typeof item.created !== "number" || !Number.isFinite(item.created) || item.created < 0 ||
      !Array.isArray(item.elements)) invalid()
    ids.add(item.id)
    count += item.elements.length
    if (count > LIBRARY_LIMITS.elements) invalid()
    for (const element of item.elements) {
      if (!record(element) || typeof element.id !== "string" || typeof element.type !== "string") invalid()
      // A collaborative projection is a view of an authorized scope, never a
      // portable library asset. Reject the whole change rather than leaking or
      // silently deleting one author's work. S07 owns that scope's lifecycle.
      if (record(element.customData) && Object.hasOwn(element.customData, "ardesiaInkV1")) {
        throw new Error("I tratti collaborativi restano nel proprio spazio: non possono essere copiati nella raccolta della lezione.")
      }
    }
  }
  // Inspect the original tree before JSON can erase own undefined markers.
  // Only the cloned snapshot is frozen; the SDK retains ownership of its input.
  inspectTree(value)
  const json = JSON.stringify(value)
  if (new TextEncoder().encode(json).length > LIBRARY_LIMITS.bytes) invalid()
  const snapshot: unknown = JSON.parse(json)
  inspectTree(snapshot, 0, true)
  return snapshot as LibraryItems
}

/** Missing is legacy. Present-but-invalid must never become an empty save. */
export function libraryFromScene(scene: unknown): LibraryItems {
  if (!record(scene)) invalid()
  return Object.hasOwn(scene, "libraryItems") ? snapshotLibraryItems(scene.libraryItems) : Object.freeze([])
}

/** Travels inside raw/board.excalidraw, covered by the existing bundle digest. */
export function sceneWithLibrary(serializedScene: string, items: LibraryItems): string {
  const scene: unknown = JSON.parse(serializedScene)
  if (!record(scene)) invalid()
  return JSON.stringify({ ...scene, libraryItems: snapshotLibraryItems(items) })
}

/** One instance per Room lifecycle generation; it does not own storage. */
export class LessonLibraryState {
  private current: LibraryItems = Object.freeze([])
  private loadError: Error | null = null

  get items(): LibraryItems { return this.current }
  get error(): Error | null { return this.loadError }

  load(scene: unknown): void {
    try {
      this.current = libraryFromScene(scene)
      this.loadError = null
    } catch (error) {
      this.loadError = error instanceof Error ? error : new Error(String(error))
      throw this.loadError
    }
  }

  change(value: unknown): void {
    // A late initial callback cannot turn a corrupt source into a valid empty
    // collection. Only a successful explicit source load can unblock saving.
    if (this.loadError) throw this.loadError
    this.current = snapshotLibraryItems(value)
  }
}
