import { describe, expect, it } from "vitest"
import { LessonLibraryState, libraryFromScene, sceneWithLibrary, snapshotLibraryItems } from "./libraryScene"

const item = () => ({
  id: "diagram-1", status: "unpublished", created: 1,
  elements: [{ id: "vector", type: "arrow", x: 0, y: 0, width: 10, height: 10, isDeleted: false }],
})

describe("lesson library snapshot", () => {
  it("keeps a corrupt saved collection blocked despite the SDK initial empty notification; a valid import recovers", () => {
    const state = new LessonLibraryState()
    expect(() => state.load({ libraryItems: null })).toThrow()
    expect(state.error).toBeInstanceOf(Error)
    expect(() => state.change([])).toThrow()
    expect(state.error).toBeInstanceOf(Error)
    state.load({ libraryItems: [item()] })
    expect(state.error).toBeNull()
    const saved = state.items
    expect(() => state.change([{ ...item(), status: "bad" }])).toThrow()
    expect(state.items).toBe(saved)
    state.change([])
    expect(state.items).toEqual([])
  })
  it("opens legacy scenes with no collection and preserves the entire board", () => {
    expect(libraryFromScene({ elements: [] })).toEqual([])
    const original = { type: "excalidraw", version: 2, elements: [{ id: "board" }], appState: { zoom: { value: 1 } }, files: {} }
    const serialized = sceneWithLibrary(JSON.stringify(original), snapshotLibraryItems([item()]))
    expect(JSON.parse(serialized)).toMatchObject(original)
    expect(libraryFromScene(JSON.parse(serialized))).toEqual([item()])
  })

  it("takes an immutable copy before an asynchronous scene save", () => {
    const input = [item()]
    const snapshot = snapshotLibraryItems(input)
    input[0].elements[0].width = 99
    expect(snapshot[0].elements[0].width).toBe(10)
    expect(Object.isFrozen(snapshot[0].elements[0])).toBe(true)
  })

  it("rejects malformed, duplicate, oversized and collaborative collections without silently emptying them", () => {
    for (const invalid of [null, {}, [item(), item()], [{ ...item(), status: "unknown" }],
      [{ ...item(), elements: [{ ...item().elements[0], customData: { ardesiaInkV1: { scope: "private" } } }] }],
      [{ ...item(), elements: [{ ...item().elements[0], customData: { copied: { ardesiaInkV1: { scope: "private" } } } }] }],
      Array.from({ length: 101 }, (_, id) => ({ ...item(), id: String(id) })),
      [{ ...item(), name: "a".repeat(2 * 1024 * 1024) }]]) {
      expect(() => snapshotLibraryItems(invalid)).toThrow()
    }
    expect(() => libraryFromScene({ libraryItems: null })).toThrow()
  })

  it("records an intentional empty collection so deletion survives reload", () => {
    const serialized = sceneWithLibrary(JSON.stringify({ elements: [] }), [])
    expect(JSON.parse(serialized).libraryItems).toEqual([])
  })

  it("rejects own nested projection markers before JSON can erase them without mutating the SDK input", () => {
    for (const marker of [undefined, null, false]) {
      const copied = { ...item().elements[0], customData: { ardesiaInkV1: marker } }
      const input = [{ ...item(), elements: [{ ...item().elements[0], customData: { copied } }] }]
      expect(Object.hasOwn(copied.customData, "ardesiaInkV1")).toBe(true)
      expect(() => snapshotLibraryItems(input)).toThrow(/tratti collaborativi/)
      expect(Object.hasOwn(copied.customData, "ardesiaInkV1")).toBe(true)
      expect(copied.customData.ardesiaInkV1).toBe(marker)
      expect(Object.isFrozen(input)).toBe(false)
      expect(Object.isFrozen(copied)).toBe(false)
    }
  })
})
