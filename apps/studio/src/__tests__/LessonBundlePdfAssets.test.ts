// @vitest-environment jsdom
import { readFileSync } from "node:fs"
import JSZip from "jszip"
import { describe, expect, it } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { exportLesson, importLesson, LESSON_PATHS, previewLessonImport } from "../store/lessonBundle"
import { buildLessonBundleManifest } from "../store/lessonBundleManifest"
import { PDF_ASSET_DIR, pdfAssetPath, pdfSha256, readPdfAsset, writePdfAsset } from "../store/pdfAssets"
import { roomPaths } from "../store/roomPaths"
import type { FileEntry, WorkspaceDriver } from "../store/types"

const LESSON = "pdf-portable"
const original = () => new Blob([readFileSync("../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf")])
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
async function seeded() {
  const state = workspace()
  await state.store.write(roomPaths(LESSON).scene, new Blob([JSON.stringify({type: "excalidraw", elements: []})]))
  await state.store.write(roomPaths(LESSON).journal, new Blob(["{\"t\":0}\n"]))
  return state
}
async function manifested(zip: JSZip) {
  const entries = new Map<string, FileEntry>()
  for (const [path, entry] of Object.entries(zip.files)) {
    if (!entry.dir && path.startsWith("raw/")) entries.set(path, {path, data: await entry.async("blob"), mtime: 0})
  }
  zip.file(LESSON_PATHS.MANIFEST, JSON.stringify(await buildLessonBundleManifest(LESSON, [], entries)))
  return zip.generateAsync({type: "blob"})
}

describe(".lesson v3 — PDF originali", () => {
  it("roundtrip conserva byte originali e scene; esclude documenti di altre lezioni; senza documenti resta v2", async () => {
    const {store} = await seeded()
    const old = await JSZip.loadAsync(await exportLesson(store, LESSON))
    expect(JSON.parse(await old.file(LESSON_PATHS.MANIFEST)!.async("text")).schemaVersion).toBe(2)
    const asset = await writePdfAsset(store, LESSON, original())
    await writePdfAsset(store, "other", new Blob(["%PDF- separate source"]))
    const bundle = await exportLesson(store, LESSON)
    const zip = await JSZip.loadAsync(bundle)
    const manifest = JSON.parse(await zip.file(LESSON_PATHS.MANIFEST)!.async("text"))
    expect(manifest).toMatchObject({schemaVersion: 3, compatibility: {minimumReaderSchemaVersion: 3}})
    expect(manifest.files.filter((f: {path: string}) => f.path.startsWith(PDF_ASSET_DIR))).toEqual([
      {path: PDF_ASSET_DIR + asset.documentId + ".pdf", sha256: asset.documentId, bytes: 12685, required: false},
    ])
    const target = workspace()
    const preview = await previewLessonImport(target.store, bundle)
    expect(preview.files.find(file => file.targetPath === pdfAssetPath(LESSON, asset.documentId))?.action).toBe("create")
    await importLesson(target.store, bundle)
    expect(await (await readPdfAsset(target.store, LESSON, asset.documentId))!.blob.arrayBuffer()).toEqual(await original().arrayBuffer())
    const again = await JSZip.loadAsync(await exportLesson(target.store, LESSON))
    expect(await again.file(PDF_ASSET_DIR + asset.documentId + ".pdf")!.async("uint8array")).toEqual(new Uint8Array(await original().arrayBuffer()))
    expect(await target.store.read(roomPaths(LESSON).scene)).toEqual(await store.read(roomPaths(LESSON).scene))
  })

  it("rifiuta byte PDF manomessi, anche se il manifest viene ricalcolato", async () => {
    const {store} = await seeded()
    const asset = await writePdfAsset(store, LESSON, original())
    const zip = await JSZip.loadAsync(await exportLesson(store, LESSON))
    const path = PDF_ASSET_DIR + asset.documentId + ".pdf"
    zip.file(path, "%PDF- altered original")
    const target = workspace()
    await expect(importLesson(target.store, await zip.generateAsync({type: "blob"}))).rejects.toThrow("SHA-256")
    await expect(manifested(zip)).rejects.toThrow("impronta PDF")
    expect(target.driver.files.size).toBe(0)
  })

  it("rifiuta namespace workspace, traversal normalizzati, path doppi e downgrade legacy prima delle scritture", async () => {
    const id = await pdfSha256(original())
    for (const path of [`raw/victim/documents/${id}.pdf`, `raw/documents/../documents/${id}.pdf`, `${PDF_ASSET_DIR}${id}.pdf/more`, PDF_ASSET_DIR + id + ".pdf"]) {
      const target = workspace(), zip = new JSZip()
      zip.file(path, original())
      await expect(importLesson(target.store, await zip.generateAsync({type: "blob"}))).rejects.toThrow()
      expect(target.driver.files.size).toBe(0)
    }
  })

  it("rifiuta collisioni esistenti e ripristina tutti i byte dopo una scrittura parziale", async () => {
    const {store} = await seeded()
    const asset = await writePdfAsset(store, LESSON, original())
    const bundle = await exportLesson(store, LESSON)
    const target = workspace(), path = pdfAssetPath(LESSON, asset.documentId)
    target.driver.files.set(path, new Blob(["%PDF- collision"]))
    await expect(importLesson(target.store, bundle)).rejects.toThrow("SHA-256")
    expect(await target.driver.files.get(path)!.text()).toBe("%PDF- collision")
    target.driver.files.delete(path)
    const oldScene = new Blob(["prior scene"])
    target.driver.files.set(roomPaths(LESSON).scene, oldScene)
    target.driver.failAfterWrite = path
    await expect(importLesson(target.store, bundle)).rejects.toThrow("write interrupted")
    expect(await target.driver.files.get(roomPaths(LESSON).scene)!.text()).toBe("prior scene")
    expect(await target.store.read(path)).toBeNull()
    await importLesson(target.store, bundle)
    expect((await readPdfAsset(target.store, LESSON, asset.documentId))?.bytes).toBe(12685)
  })

  it("preview e import contano l’unione con i 32 PDF già presenti, senza contare due volte lo stesso hash", async () => {
    const source = await seeded(), target = await seeded()
    const asset = await writePdfAsset(source.store, LESSON, original())
    const bundle = await exportLesson(source.store, LESSON)
    for (let i = 0; i < 32; i++) {
      await writePdfAsset(target.store, LESSON, new Blob([original(), `\n% prior original ${i}\n`]))
    }
    const before = new Map(target.driver.files)
    await expect(previewLessonImport(target.store, bundle)).rejects.toThrow("32 documenti")
    await expect(importLesson(target.store, bundle)).rejects.toThrow("32 documenti")
    expect(target.driver.files).toEqual(before)
    expect(await target.store.read(pdfAssetPath(LESSON, asset.documentId))).toBeNull()
    const existing = (await target.store.list(`raw/${LESSON}/documents/`))[0]!
    const same = await seeded()
    await writePdfAsset(same.store, LESSON, existing.data)
    const sameBundle = await exportLesson(same.store, LESSON)
    expect((await previewLessonImport(target.store, sameBundle)).commitReady).toBe(true)
    await importLesson(target.store, sameBundle)
    expect(await target.store.list(`raw/${LESSON}/documents/`)).toHaveLength(32)
    expect(JSON.parse(await (await JSZip.loadAsync(await exportLesson(target.store, LESSON))).file(LESSON_PATHS.MANIFEST)!.async("text")).schemaVersion).toBe(3)
  })

  it("preview e import rifiutano l’unione oltre 100 MiB senza cancellare gli originali esistenti", async () => {
    const source = await seeded(), target = await seeded()
    await writePdfAsset(source.store, LESSON, original())
    const bundle = await exportLesson(source.store, LESSON)
    const padding = "x".repeat(20 * 1024 * 1024 - original().size - 5)
    for (let i = 0; i < 5; i++) {
      const blob = new Blob([original(), `\n%${i}`, padding, "\n\n"])
      expect(blob.size).toBe(20 * 1024 * 1024)
      await writePdfAsset(target.store, LESSON, blob)
    }
    const before = new Map(target.driver.files)
    await expect(previewLessonImport(target.store, bundle)).rejects.toThrow("100 MiB")
    await expect(importLesson(target.store, bundle)).rejects.toThrow("100 MiB")
    expect(target.driver.files).toEqual(before)
  })

  it("interrompe la decompressione di un PDF oltre il limite dichiarato", async () => {
    const {store} = await seeded()
    const asset = await writePdfAsset(store, LESSON, original())
    const zip = await JSZip.loadAsync(await exportLesson(store, LESSON))
    zip.file(PDF_ASSET_DIR + asset.documentId + ".pdf", "%PDF-" + "x".repeat(20 * 1024 * 1024), {compression: "DEFLATE"})
    const target = workspace()
    await expect(importLesson(target.store, await zip.generateAsync({type: "blob"}))).rejects.toThrow("limite di decompressione")
    expect(target.driver.files.size).toBe(0)
  })
})
