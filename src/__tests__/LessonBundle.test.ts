// @vitest-environment jsdom
// MAESTRO-Studio — Test LessonBundle (.lesson ZIP format)
// Accettazione T3:
//   (1) consenso OFF ⇒ bundle NON contiene audio
//   (2) bundle ri-processabile da zero: export→import→export dà contenuti identici (idempotenza)
//   (3) struttura raw/ conforme: events.jsonl + session.yaml + board.excalidraw sempre presenti

import { describe, it, expect, beforeEach } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { WorkspaceDriver, FileEntry } from "../store/types"
import { exportLesson, importLesson, LESSON_PATHS } from "../store/lessonBundle"

// --- Mock driver (stesso pattern degli altri test) ---

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
  private store = new Map<string, ArrayBuffer>()
  private mtim = new Map<string, number>()

  available(): boolean { return true }
  async init(): Promise<boolean> { return true }

  async read(path: string): Promise<Blob | null> {
    const raw = this.store.get(path)
    if (!raw) return null
    return new Blob([raw])
  }

  async write(path: string, data: Blob): Promise<void> {
    this.store.set(path, await data.arrayBuffer())
    this.mtim.set(path, Date.now())
  }

  async delete(path: string): Promise<void> {
    this.store.delete(path)
    this.mtim.delete(path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    const entries: FileEntry[] = []
    for (const [path, buf] of this.store) {
      if (prefix && !path.startsWith(prefix)) continue
      entries.push({
        path,
        data: new Blob([buf]),
        mtime: this.mtim.get(path) ?? 0,
      })
    }
    return entries
  }

  getLegacyScene(_room: string): string | null { return null }
  setLegacyScene(_room: string, _data: string): void {}
}

function withMockDriver(store: WorkspaceStore, mock: MockDriver) {
  ;(store as any).driver = mock
  ;(store as any).fallback = mock
  ;(store as any)._mode = "localStorage"
}

/** Helper: estrae lista path da un Blob ZIP */
async function listZipPaths(blob: Blob): Promise<string[]> {
  const zip = await JSZip.loadAsync(blob)
  const paths: string[] = []
  zip.forEach((relPath) => { paths.push(relPath) })
  return paths.sort()
}

/** Helper: legge contenuto testo da ZIP */
async function readZipText(blob: Blob, path: string): Promise<string | null> {
  const zip = await JSZip.loadAsync(blob)
  const entry = zip.file(path)
  if (!entry) return null
  return await entry.async("text")
}

describe("LessonBundle", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  const ROOM = "test-room-1"

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
  })

  // --- TEST (3): struttura raw/ conforme ---

  it("bundle contiene sempre raw/events.jsonl, raw/session.yaml, raw/board.excalidraw", async () => {
    // Seed dei 3 file obbligatori
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [], appState: {} }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    expect(paths).toContain(LESSON_PATHS.JOURNAL)
    expect(paths).toContain(LESSON_PATHS.SESSION)
    expect(paths).toContain(LESSON_PATHS.SCENE)
  })

  // --- TEST (1): consenso OFF ⇒ bundle NON contiene audio (anche se chunk su disco) ---

  it("consenso OFF con chunk audio su disco — bundle non contiene raw/audio/", async () => {
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    // Seeda chunk audio come se fossero ancora su disco (consenso revocato)
    await store.write("raw/audio/chunk-0.webm", new Blob(["audio-data-0"], { type: "audio/webm" }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    const audioPaths = paths.filter((p) => p.startsWith(LESSON_PATHS.AUDIO_DIR))
    expect(audioPaths).toHaveLength(0)
  })

  // --- TEST gemello: consenso ON + chunk esistenti ⇒ bundle CONTIENE audio ---

  it("consenso ON con chunk audio esistenti — bundle contiene raw/audio/chunk-*.webm", async () => {
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    await store.write("raw/audio/chunk-0.webm", new Blob(["audio-data-0"], { type: "audio/webm" }))
    await store.write("raw/audio/chunk-1.webm", new Blob(["audio-data-1"], { type: "audio/webm" }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    const audioPaths = paths.filter((p) => p.startsWith(LESSON_PATHS.AUDIO_DIR))
    expect(audioPaths).toContain("raw/audio/chunk-0.webm")
    expect(audioPaths).toContain("raw/audio/chunk-1.webm")
    // Verifica anche i 3 file obbligatori sono presenti
    expect(paths).toContain(LESSON_PATHS.JOURNAL)
    expect(paths).toContain(LESSON_PATHS.SESSION)
    expect(paths).toContain(LESSON_PATHS.SCENE)
  })

  // --- TEST (2): idempotenza roundtrip ---

  it("export→import→export è idempotente (stessi file e contenuti)", async () => {
    // Seed: journal + session + scene + un audio chunk
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":100,"type":"element.add"}\n{"t":200,"type":"t0"}\n'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [{ id: "rect1", type: "rectangle", x: 0, y: 0 }] }))
    await store.write("raw/audio/chunk-0.webm", new Blob(["fake-audio-data-0"], { type: "audio/webm" }))

    // Primo export
    const bundle1 = await exportLesson(store, ROOM)

    // Import su store pulito (simula ri-processamento da zero)
    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await importLesson(store2, bundle1)

    // Secondo export dal secondo store
    const bundle2 = await exportLesson(store2, ROOM)

    // Stessi path
    const paths1 = await listZipPaths(bundle1)
    const paths2 = await listZipPaths(bundle2)
    expect(paths1).toEqual(paths2)

    // Stessi contenuti per ogni file
    for (const p of paths1) {
      const text1 = await readZipText(bundle1, p)
      const text2 = await readZipText(bundle2, p)
      expect(text1).toBe(text2)
    }
  })

  // --- TEST extra: scene per-room esclusa, scena flat iniettata ---

  it("scene per-room (raw/<room>/board.excalidraw) sono escluse — solo raw/board.excalidraw flat", async () => {
    // Simula scena per-room esistente
    await store.saveScene(ROOM, JSON.stringify({ room: ROOM, elements: [{ id: "el1" }] }))
    // Scrittura diretta di un'altra raw/board.excalidraw flat (legacy)
    const flatScene = JSON.stringify({ room: "legacy", elements: [{ id: "legacy" }] })
    await store.write(LESSON_PATHS.SCENE, new Blob([flatScene], { type: "application/json" }))

    // Salva anche journal e session
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":1,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1\naudioConsent: false\n")

    const bundle = await exportLesson(store, ROOM)
    const sceneText = await readZipText(bundle, LESSON_PATHS.SCENE)

    // Deve essere la scena della room corrente (loadScene restituisce per-room, iniettata flat)
    expect(sceneText).not.toBeNull()
    const parsed = JSON.parse(sceneText!)
    expect(parsed.room).toBe(ROOM) // loadScene(room) restituisce la per-room

    // Deve esserci UNA sola raw/board.excalidraw
    const paths = await listZipPaths(bundle)
    const scenePaths = paths.filter((p) => p.endsWith("board.excalidraw"))
    expect(scenePaths).toHaveLength(1)
    expect(scenePaths[0]).toBe(LESSON_PATHS.SCENE)
  })

  // --- TEST: import scrive tutti i file sullo store ---

  it("importLesson ripristina tutti i file sul nuovo store", async () => {
    await store.write(LESSON_PATHS.JOURNAL, new Blob(['{"t":10,"type":"t0"}'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 10\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))

    const bundle = await exportLesson(store, ROOM)

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await importLesson(store2, bundle)

    const journalBlob = await store2.read(LESSON_PATHS.JOURNAL)
    expect(journalBlob).not.toBeNull()
    const journalText = await journalBlob!.text()
    expect(journalText).toContain('{"t":10,"type":"t0"}')

    const sceneText = await store2.loadScene(ROOM)
    expect(sceneText).not.toBeNull()
    const sceneParsed = JSON.parse(sceneText!)
    expect(sceneParsed.type).toBe("excalidraw")
  })

  // --- TEST ZipSlip: path malevoli rifiutati ---

  it.each([
    ["../../etc/passwd", "path con .."],
    ["raw/../../etc/passwd", "path con .. dopo raw/"],
  ])("importLesson rifiuta path malevolo: %s", async (maliciousPath) => {
    const zip = new JSZip()
    zip.file(maliciousPath, new Blob(["evil"], { type: "text/plain" }))
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob)).rejects.toThrow(/ZipSlip/)
  })

  it("zip misto (entry valida + malevola) — reject E store2 vuoto", async () => {
    const zip = new JSZip()
    zip.file("raw/events.jsonl", '{"t":1,"type":"element.add"}')
    zip.file("../../etc/passwd", "evil")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob)).rejects.toThrow(/ZipSlip/)

    // Store deve essere vuoto — nessuna write parziale
    const all = await store2.list()
    expect(all).toHaveLength(0)
  })
})
