// @vitest-environment jsdom
import { beforeEach, expect, it } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"
import { libraryFromScene, sceneWithLibrary, snapshotLibraryItems } from "./libraryScene"

beforeEach(() => {
  const entries = new Map<string, string>()
  const storage: Storage = {
    get length() { return entries.size }, clear: () => entries.clear(),
    getItem: key => entries.get(key) ?? null, key: i => [...entries.keys()][i] ?? null,
    removeItem: key => { entries.delete(key) }, setItem: (key, value) => { entries.set(key, String(value)) },
  }
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })
})

it("preserves the lesson collection through the real bundle manifest, cold store and room isolation", async () => {
  const items = snapshotLibraryItems([{ id: "axes", status: "unpublished", created: 0,
    elements: [{ id: "x-axis", type: "arrow", x: 0, y: 0, width: 200, height: 0 }] }])
  const store = new WorkspaceStore()
  await store.init()
  const original = sceneWithLibrary(JSON.stringify({ type: "excalidraw", version: 2, elements: [], files: {} }), items)
  await store.saveScene("library-A", original)
  await store.write(roomPaths("library-A").journal, new Blob([""]))
  await store.saveScene("library-B", JSON.stringify({ type: "excalidraw", elements: [] }))
  const bundle = await store.exportLesson("library-A")
  const zip = await JSZip.loadAsync(bundle)
  const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
  expect(manifest.files.find((file: { path: string }) => file.path === "raw/board.excalidraw").sha256).toMatch(/^[a-f0-9]{64}$/)
  expect(await zip.file("raw/board.excalidraw")!.async("text")).toBe(original)
  expect(Object.keys(zip.files).some(path => path.includes("library-B"))).toBe(false)
  await store.delete(roomPaths("library-A").scene)
  const cold = new WorkspaceStore()
  await cold.init()
  await cold.importLessonBlobForRoom(bundle, "library-A")
  expect(libraryFromScene(JSON.parse((await cold.loadScene("library-A"))!))).toEqual(items)
  expect(libraryFromScene(JSON.parse((await cold.loadScene("library-B"))!))).toEqual([])
})
