// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { exportLesson, importLesson, SHARED_VIEWER_HISTORY_WARNING, SHARED_VIEWER_SESSION_YAML } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver } from "../store/types"

class Driver implements WorkspaceDriver {
  readonly name = "memory"
  files = new Map<string, Blob>()
  failAfterWrite: string | null = null
  available() { return true }
  async init() { return true }
  async read(path: string) { return this.files.get(path) ?? null }
  async write(path: string, data: Blob) {
    this.files.set(path, data)
    if (this.failAfterWrite === path) { this.failAfterWrite = null; throw new Error("write interrupted") }
  }
  async delete(path: string) { this.files.delete(path) }
  async list(prefix = "") { return [...this.files].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => ({path, data, mtime: 0})) }
}
function workspace() {
  const store = new WorkspaceStore(), driver = new Driver()
  Object.defineProperty(store, "driver", { value: driver })
  return {store, driver}
}
const room = "shared-viewer-copy", paths = roomPaths(room)
const scene = JSON.stringify({type: "excalidraw", elements: [{id: "received-page", type: "image", fileId: "page-file"}], files: {}})

describe("shared viewer archive", () => {
  it("exports and roundtrips the received scene with explicitly absent history, without invented sessions or events", async () => {
    const {store} = workspace()
    await store.saveSharedViewerScene(room, scene)
    expect(await (await store.read(paths.journal))!.text()).toBe("")
    expect(await (await store.read(paths.session))!.text()).toBe(SHARED_VIEWER_SESSION_YAML)
    const bundle = await exportLesson(store, room)
    const zip = await JSZip.loadAsync(bundle)
    const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
    expect(manifest.sessionIds).toEqual([])
    expect(manifest.lessonOs).toEqual({status: "missing", warnings: ["LessonOS snapshot missing", SHARED_VIEWER_HISTORY_WARNING]})
    expect(await zip.file("raw/events.jsonl")!.async("text")).toBe("")
    expect(zip.file("raw/lessonos-events.jsonl")).toBeNull()
    expect(await zip.file("raw/board.excalidraw")!.async("text")).toBe(scene)
    const destination = workspace()
    await importLesson(destination.store, bundle)
    const reopened = await JSZip.loadAsync(await exportLesson(destination.store, room))
    expect(JSON.parse(await reopened.file("manifest.json")!.async("text")).lessonOs).toEqual(manifest.lessonOs)
    expect(await reopened.file("raw/board.excalidraw")!.async("text")).toBe(scene)
  })

  it.each([paths.scene, paths.session, paths.lessonOsSnapshot, `raw/${room}/session-existing/session.yaml`])(
    "does not repair missing history in an existing archive (%s)", async path => {
      const {store, driver} = workspace()
      const original = new Blob(["existing bytes"])
      driver.files.set(path, original)
      await expect(store.saveSharedViewerScene(room, scene)).rejects.toThrow("cronologia locale mancante")
      expect([...driver.files]).toEqual([[path, original]])
      await expect(exportLesson(store, room)).rejects.toThrow()
    },
  )

  it("does not replace an existing journal or session document, including after an earlier viewer copy", async () => {
    const {store, driver} = workspace()
    const journal = new Blob(['{"t":0}\n']), session = new Blob(["v: 1\ncreated: 123\naudioConsent: false\n"])
    driver.files.set(paths.journal, journal);driver.files.set(paths.session, session)
    await store.saveSharedViewerScene(room, scene)
    expect(driver.files.get(paths.journal)).toBe(journal)
    expect(driver.files.get(paths.session)).toBe(session)
    const manifest = JSON.parse(await (await JSZip.loadAsync(await exportLesson(store, room))).file("manifest.json")!.async("text"))
    expect(manifest.lessonOs.warnings).not.toContain(SHARED_VIEWER_HISTORY_WARNING)
  })

  it.each([paths.session, paths.journal, paths.scene])("rolls back a failed new archive (%s) and permits a real retry", async failedPath => {
    const {store, driver} = workspace()
    const original = new Blob(["retained document"]), documentPath = `raw/${room}/documents/retained.pdf`
    driver.files.set(documentPath, original)
    driver.failAfterWrite = failedPath
    await expect(store.saveSharedViewerScene(room, scene)).rejects.toThrow("write interrupted")
    expect([...driver.files]).toEqual([[documentPath, original]])
    await store.saveSharedViewerScene(room, scene)
    expect(await (await store.read(paths.scene))!.text()).toBe(scene)
    expect(driver.files.get(documentPath)).toBe(original)
  })
})
