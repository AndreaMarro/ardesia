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
import { roomPaths } from "../store/roomPaths"

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

  getLegacyScene(): string | null { return null }
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
  const ROOM_PATHS = roomPaths(ROOM)

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
  })

  it("esporta solo A, importa solo in C e lascia i flat legacy non attribuiti", async () => {
    const pathsA = roomPaths("room-a")
    const pathsB = roomPaths("room-b")
    const pathsC = roomPaths("room-c")

    await store.saveScene("room-a", JSON.stringify({ room: "room-a", token: "scene-a" }))
    await store.write(pathsA.journal, new Blob(["journal-a"]))
    await store.write(pathsA.session, new Blob(["v: 1\naudioConsent: true\n"]))
    await store.write(`${pathsA.audioDir}chunk-0.webm`, new Blob(["audio-a"]))

    await store.saveScene("room-b", JSON.stringify({ room: "room-b", token: "scene-b" }))
    await store.write(pathsB.journal, new Blob(["journal-b"]))
    await store.write(pathsB.session, new Blob(["v: 1\naudioConsent: true\n"]))
    await store.write(`${pathsB.audioDir}chunk-0.webm`, new Blob(["audio-b"]))

    await store.write(LESSON_PATHS.SCENE, new Blob(["legacy-scene"]))
    await store.write(LESSON_PATHS.JOURNAL, new Blob(["legacy-journal"]))
    await store.write(LESSON_PATHS.SESSION, new Blob(["v: 1\naudioConsent: true\nlegacy-session: true\n"]))
    await store.write(`${LESSON_PATHS.AUDIO_DIR}chunk-0.webm`, new Blob(["legacy-audio"]))

    const bundle = await exportLesson(store, "room-a")
    expect(await readZipText(bundle, LESSON_PATHS.SCENE)).toContain("scene-a")
    expect(await readZipText(bundle, LESSON_PATHS.JOURNAL)).toBe("journal-a")
    expect(await readZipText(bundle, LESSON_PATHS.SESSION)).not.toContain("legacy-session")
    expect(await readZipText(bundle, `${LESSON_PATHS.AUDIO_DIR}chunk-0.webm`)).toBe("audio-a")

    const bundleText = (await Promise.all((await listZipPaths(bundle)).map(
      async (path) => await readZipText(bundle, path) ?? "",
    ))).join("\n")
    expect(bundleText).not.toContain("scene-b")
    expect(bundleText).not.toContain("journal-b")
    expect(bundleText).not.toContain("audio-b")
    expect(bundleText).not.toContain("legacy-")

    const imported = new WorkspaceStore()
    withMockDriver(imported, new MockDriver())
    await importLesson(imported, bundle, "room-c")

    expect(await imported.read(pathsC.scene)).not.toBeNull()
    expect(await imported.read(pathsC.journal)).not.toBeNull()
    expect(await imported.read(pathsC.session)).not.toBeNull()
    expect(await imported.read(`${pathsC.audioDir}chunk-0.webm`)).not.toBeNull()
    expect(await imported.read(LESSON_PATHS.SCENE)).toBeNull()
    expect(await imported.read(LESSON_PATHS.JOURNAL)).toBeNull()
    expect((await imported.list("raw/")).every((entry) => entry.path.startsWith("raw/room-c/"))).toBe(true)

    expect(await (await store.read(LESSON_PATHS.JOURNAL))!.text()).toBe("legacy-journal")
  })

  it("room ID ostile fallisce prima di scrivere qualunque entry importata", async () => {
    const zip = new JSZip()
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ elements: [] }))
    const bundle = await zip.generateAsync({ type: "blob" })
    const imported = new WorkspaceStore()
    withMockDriver(imported, new MockDriver())

    await expect(importLesson(imported, bundle, "../escape")).rejects.toThrow()
    expect(await imported.list()).toHaveLength(0)
  })

  it("rifiuta una stanza target già popolata senza sovrapporre o cancellare dati", async () => {
    const targetRoom = "room-target"
    const targetPaths = roomPaths(targetRoom)
    const zip = new JSZip()
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ token: "nuova-scena" }))
    zip.file(LESSON_PATHS.SESSION, "v: 1\naudioConsent: false\n")
    const bundle = await zip.generateAsync({ type: "blob" })
    const imported = new WorkspaceStore()
    withMockDriver(imported, new MockDriver())
    await imported.write(targetPaths.scene, new Blob(["scena-esistente"]))
    await imported.write(`${targetPaths.audioDir}chunk-9.webm`, new Blob(["audio-esistente"]))

    await expect(importLesson(imported, bundle, targetRoom)).rejects.toThrow(/non vuota/i)
    expect(await (await imported.read(targetPaths.scene))!.text()).toBe("scena-esistente")
    expect(await (await imported.read(`${targetPaths.audioDir}chunk-9.webm`))!.text()).toBe("audio-esistente")
    expect(await imported.read(targetPaths.session)).toBeNull()
  })

  it.each(["raw/con", "raw/file.", "raw/a:b", "raw/audio/lpt1.webm"])(
    "rifiuta il segmento non portabile %s prima di qualunque write",
    async (portablePath) => {
      const zip = new JSZip()
      zip.file(portablePath, "payload")
      const bundle = await zip.generateAsync({ type: "blob" })
      const imported = new WorkspaceStore()
      withMockDriver(imported, new MockDriver())
      await imported.write("raw/legacy-sentinel", new Blob(["intatto"]))

      await expect(importLesson(imported, bundle, "room-portable")).rejects.toThrow(/portabile|ZipSlip/i)
      const entries = await imported.list()
      expect(entries.map((entry) => entry.path)).toEqual(["raw/legacy-sentinel"])
      expect(await entries[0].data.text()).toBe("intatto")
    },
  )

  it.each(["con", "file.", "a:b", "audio/lpt1.webm"])(
    "rifiuta in export il segmento non portabile %s invece di creare un bundle non reimportabile",
    async (roomRelativePath) => {
      await store.write(ROOM_PATHS.session, new Blob(["v: 1\naudioConsent: true\n"]))
      await store.write(`raw/${ROOM}/${roomRelativePath}`, new Blob(["payload"]))

      await expect(exportLesson(store, ROOM)).rejects.toThrow(/portabile/i)
    },
  )

  // --- TEST (3): struttura raw/ conforme ---

  it("bundle contiene sempre raw/events.jsonl, raw/session.yaml, raw/board.excalidraw", async () => {
    // Seed dei 3 file obbligatori
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [], appState: {} }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    expect(paths).toContain(LESSON_PATHS.JOURNAL)
    expect(paths).toContain(LESSON_PATHS.SESSION)
    expect(paths).toContain(LESSON_PATHS.SCENE)
  })

  // --- TEST (1): consenso OFF ⇒ bundle NON contiene audio (anche se chunk su disco) ---

  it("consenso OFF con chunk audio su disco — bundle non contiene raw/audio/", async () => {
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    // Seeda chunk audio come se fossero ancora su disco (consenso revocato)
    await store.write(`${ROOM_PATHS.audioDir}chunk-0.webm`, new Blob(["audio-data-0"], { type: "audio/webm" }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    const audioPaths = paths.filter((p) => p.startsWith(LESSON_PATHS.AUDIO_DIR))
    expect(audioPaths).toHaveLength(0)
  })

  // --- TEST gemello: consenso ON + chunk esistenti ⇒ bundle CONTIENE audio ---

  it("consenso ON con chunk audio esistenti — bundle contiene raw/audio/chunk-*.webm", async () => {
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    await store.write(`${ROOM_PATHS.audioDir}chunk-0.webm`, new Blob(["audio-data-0"], { type: "audio/webm" }))
    await store.write(`${ROOM_PATHS.audioDir}chunk-1.webm`, new Blob(["audio-data-1"], { type: "audio/webm" }))

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
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":100,"type":"element.add"}\n{"t":200,"type":"t0"}\n'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [{ id: "rect1", type: "rectangle", x: 0, y: 0 }] }))
    await store.write(`${ROOM_PATHS.audioDir}chunk-0.webm`, new Blob(["fake-audio-data-0"], { type: "audio/webm" }))

    // Primo export
    const bundle1 = await exportLesson(store, ROOM)

    // Import su store pulito (simula ri-processamento da zero)
    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await importLesson(store2, bundle1, ROOM)

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
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":1,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 1\naudioConsent: false\n"]))

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
    await store.write(ROOM_PATHS.journal, new Blob(['{"t":10,"type":"t0"}'], { type: "application/x-ndjson" }))
    await store.write(ROOM_PATHS.session, new Blob(["v: 1\ncreated: 10\naudioConsent: false\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))

    const bundle = await exportLesson(store, ROOM)

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await importLesson(store2, bundle, ROOM)

    const journalBlob = await store2.read(ROOM_PATHS.journal)
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

    await expect(importLesson(store2, blob, ROOM)).rejects.toThrow(/ZipSlip/)
  })

  it("zip misto (entry valida + malevola) — reject E store2 vuoto", async () => {
    const zip = new JSZip()
    zip.file("raw/events.jsonl", '{"t":1,"type":"element.add"}')
    zip.file("../../etc/passwd", "evil")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).rejects.toThrow(/ZipSlip/)

    // Store deve essere vuoto — nessuna write parziale
    const all = await store2.list()
    expect(all).toHaveLength(0)
  })

  // --- T3-FIX-2: coerenza bundle (GDPR — import non deve reintrodurre dati revocati) ---

  it("bundle incoerente (audioConsent:false + raw/audio/ esistenti) — reject E store vuoto", async () => {
    // Costruisce bundle artigianale con session.yaml = audioConsent:false + chunk audio
    const zip = new JSZip()
    zip.file(LESSON_PATHS.JOURNAL, '{"t":1,"type":"element.add"}')
    zip.file(LESSON_PATHS.SESSION, "v: 1\ncreated: 1000\naudioConsent: false\naudioStartEpoch: 500\n")
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ elements: [] }))
    zip.file("raw/audio/chunk-0.webm", "fake-audio-data")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).rejects.toThrow(/Bundle incoerente|incoerente/)

    // Store deve rimanere vuoto — nessuna write parziale
    const all = await store2.list()
    expect(all).toHaveLength(0)
  })

  it("bundle coerente (audioConsent:true + audio) — import OK", async () => {
    const zip = new JSZip()
    zip.file(LESSON_PATHS.JOURNAL, '{"t":1,"type":"element.add"}')
    zip.file(LESSON_PATHS.SESSION, "v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n")
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ elements: [] }))
    zip.file("raw/audio/chunk-0.webm", "fake-audio-data")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const journalBlob = await store2.read(ROOM_PATHS.journal)
    expect(journalBlob).not.toBeNull()
    const audioBlob = await store2.read(`${ROOM_PATHS.audioDir}chunk-0.webm`)
    expect(audioBlob).not.toBeNull()
  })

  it("bundle legacy senza session.yaml + audio — import OK (nessuna informazione consenso)", async () => {
    // Bundle senza session.yaml (pre-T2): non possiamo validare coerenza audio
    const zip = new JSZip()
    zip.file(LESSON_PATHS.JOURNAL, '{"t":1,"type":"element.add"}')
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ elements: [] }))
    zip.file("raw/audio/chunk-0.webm", "fake-audio-data")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const audioBlob = await store2.read(`${ROOM_PATHS.audioDir}chunk-0.webm`)
    expect(audioBlob).not.toBeNull()
  })

  // --- T3-FIX-2: .. check per-segmento (non include("..") che è sovra-ampio) ---

  it('filename legittimo con ".." nel nome (raw/notes..2024.jsonl) passa', async () => {
    const zip = new JSZip()
    zip.file("raw/notes..2024.jsonl", '{"t":1}')
    zip.file(LESSON_PATHS.SESSION, "v: 1\ncreated: 1\naudioConsent: false\n")
    zip.file(LESSON_PATHS.JOURNAL, '{"t":1,"type":"element.add"}')
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ elements: [] }))
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const notesBlob = await store2.read(`raw/${ROOM}/notes..2024.jsonl`)
    expect(notesBlob).not.toBeNull()
  })

  it("path malevolo raw/../etc/passwd ancora rifiutato (check per-segmento catcha ..)", async () => {
    const zip = new JSZip()
    zip.file("raw/../etc/passwd", "evil")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob, ROOM)).rejects.toThrow(/ZipSlip/)
  })
})

// --- Snapshot event-log LessonOS nel bundle (spec #35 §4.3) ---

describe("LessonBundle — snapshot event-log LessonOS", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  const ROOM = "test-room-lessonos"
  const ROOM_PATHS = roomPaths(ROOM)

  beforeEach(async () => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [], appState: {} }))
  })

  async function filledLog() {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: ROOM, t: 1000, evidence: [`lesson:${ROOM}@1000`] })
    await log.append({
      kind: "concept.introduced",
      conceptId: "led_polarity",
      labels: { it: "Polarità del LED" },
      t: 1100,
      evidence: ["manual:vol1:p30"],
    })
    return log
  }

  it("log fornito e non vuoto ⇒ raw/lessonos-events.jsonl nel bundle, una riga per evento", async () => {
    const log = await filledLog()
    const bundle = await exportLesson(store, ROOM, log)
    const text = await readZipText(bundle, LESSON_PATHS.LESSONOS)
    expect(text).not.toBeNull()
    const parsed = text!.trimEnd().split("\n").map((line) => JSON.parse(line))
    expect(parsed).toEqual(await log.readAll())
  })

  it("log globale con sessioni A/B esporta soltanto la sessione della stanza richiesta", async () => {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: ROOM, t: 1000, evidence: [`lesson:${ROOM}@1000`] })
    await log.append({
      kind: "concept.introduced",
      conceptId: "concept-a",
      labels: { it: "Concetto A" },
      t: 1010,
      evidence: ["manual:a"],
    })
    await log.append({ kind: "lesson.started", room: "room-b", t: 2000, evidence: ["lesson:room-b@2000"] })
    await log.append({
      kind: "concept.introduced",
      conceptId: "concept-b",
      labels: { it: "Concetto B" },
      t: 2010,
      evidence: ["manual:b"],
    })

    const bundle = await exportLesson(store, ROOM, log)
    const text = await readZipText(bundle, LESSON_PATHS.LESSONOS)
    expect(text).toContain("concept-a")
    expect(text).not.toContain("room-b")
    expect(text).not.toContain("concept-b")
  })

  it("evento studentpack con fromRoom differente rende lo snapshot fail-closed", async () => {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: ROOM, t: 1000, evidence: [`lesson:${ROOM}@1000`] })
    await log.append({
      kind: "studentpack.generated",
      packId: "sp-cross-room",
      errorId: "error-cross-room",
      fromRoom: "room-b",
      t: 1010,
      evidence: ["lesson:room-b@1010"],
    })
    await log.append({ kind: "lesson.ended", room: ROOM, t: 1020, evidence: [`lesson:${ROOM}@1020`] })

    const bundle = await exportLesson(store, ROOM, log)
    expect(await readZipText(bundle, LESSON_PATHS.LESSONOS)).toBeNull()
  })

  it("senza log (o log vuoto) ⇒ NESSUN raw/lessonos-events.jsonl (niente file fantasma)", async () => {
    const senzaLog = await exportLesson(store, ROOM)
    expect(await readZipText(senzaLog, LESSON_PATHS.LESSONOS)).toBeNull()

    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const conLogVuoto = await exportLesson(store, ROOM, new InMemoryEventLog())
    expect(await readZipText(conLogVuoto, LESSON_PATHS.LESSONOS)).toBeNull()
  })

  it("log guasto (readAll che lancia) ⇒ l'export procede senza snapshot, mai bloccato", async () => {
    const broken = {
      append: async () => {
        throw new Error("no")
      },
      readAll: async () => {
        throw new Error("event log corrotto")
      },
    }
    const bundle = await exportLesson(store, ROOM, broken)
    expect(await readZipText(bundle, LESSON_PATHS.LESSONOS)).toBeNull()
    // Il resto del bundle c'è: la scena iniettata sopravvive.
    expect(await readZipText(bundle, LESSON_PATHS.SCENE)).not.toBeNull()
  })

  it("roundtrip: export→import riporta lo snapshot nello store come raw/ (il file viaggia)", async () => {
    const log = await filledLog()
    const bundle = await exportLesson(store, ROOM, log)

    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    await importLesson(store2, bundle, ROOM)
    const restored = await store2.read(ROOM_PATHS.lessonOsSnapshot)
    expect(restored).not.toBeNull()
    expect((await restored!.text()).trimEnd().split("\n")).toHaveLength(2)
  })
})

describe("LessonBundle — restore event-log LessonOS all'import (P32 R10)", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  const ROOM = "test-room-restore"
  const ROOM_PATHS = roomPaths(ROOM)

  beforeEach(async () => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [], appState: {} }))
  })

  async function filledLog() {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const log = new InMemoryEventLog()
    await log.append({ kind: "lesson.started", room: ROOM, t: 1000, evidence: [`lesson:${ROOM}@1000`] })
    await log.append({
      kind: "concept.introduced",
      conceptId: "led_polarity",
      labels: { it: "Polarità del LED" },
      t: 1100,
      evidence: ["manual:vol1:p30"],
    })
    return log
  }

  /** Fake contract-fedele di un log restorabile: STESSA semantica documentata di
   *  IndexedDbEventLog.importSnapshot (solo-su-log-vuoto, seq contigui preservati).
   *  La semantica REALE è coperta da IndexedDbEventLog.test.ts; qui si testa il
   *  CABLAGGIO di importLesson (mappatura stati, ordinamento, niente swallow). */
  async function restorableLog() {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    class RestorableFakeLog extends InMemoryEventLog {
      async importSnapshot(snapshot: Blob) {
        const existing = await this.readAll()
        if (existing.length > 0) {
          throw new Error("LessonOS event log: importSnapshot richiede un log vuoto (restore, mai merge)")
        }
        const lines = (await snapshot.text()).split("\n").filter((line) => line.length > 0)
        const parsed = lines.map((line) => JSON.parse(line))
        if (!parsed.every((event, index) => event.seq === index + 1)) {
          throw new Error("LessonOS event log: snapshot corrotto (sequenza non contigua) — non si ripara")
        }
        for (const appended of parsed) {
          const { seq: _seq, ...event } = appended
          await this.append(event)
        }
        return { recovered: lines.length, lastSeq: lines.length, droppedTail: 0, corrupted: false }
      }
    }
    return new RestorableFakeLog()
  }

  async function bundleWithSnapshot() {
    return exportLesson(store, ROOM, await filledLog())
  }

  it("log restorabile VUOTO ⇒ status restored, eventi ripristinati con seq originali", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()

    const result = await importLesson(store2, bundle, ROOM, target)

    expect(result.lessonOsRestore).toEqual({ kind: "restored", recovered: 2 })
    const events = await target.readAll()
    expect(events).toHaveLength(2)
    expect(events.map((e) => e.seq)).toEqual([1, 2])
    expect(events[1]!.kind).toBe("concept.introduced")
  })

  it("la seconda stanza del log globale viene rinumerata 1..N e ripristinata", async () => {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const source = new InMemoryEventLog()
    await source.append({ kind: "lesson.started", room: "room-a", t: 1000, evidence: ["lesson:room-a@1000"] })
    await source.append({ kind: "lesson.ended", room: "room-a", t: 1100, evidence: ["lesson:room-a@1100"] })
    await source.append({ kind: "lesson.started", room: "room-b", t: 2000, evidence: ["lesson:room-b@2000"] })
    await source.append({
      kind: "concept.introduced",
      conceptId: "concept-b",
      labels: { it: "Concetto B" },
      t: 2010,
      evidence: ["manual:b"],
    })

    const bundle = await exportLesson(store, "room-b", source)
    const snapshot = await readZipText(bundle, LESSON_PATHS.LESSONOS)
    expect(snapshot!.trimEnd().split("\n").map((line) => JSON.parse(line).seq)).toEqual([1, 2])

    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()
    const result = await importLesson(store2, bundle, "room-c", target)

    expect(result.lessonOsRestore).toEqual({ kind: "restored", recovered: 2 })
    expect((await target.readAll()).map((event) => event.seq)).toEqual([1, 2])
  })

  it("log NON vuoto ⇒ status skipped-non-empty, log INVARIATO (mai merge)", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()
    await target.append({ kind: "lesson.started", room: "altra", t: 500, evidence: ["lesson:altra@500"] })

    const result = await importLesson(store2, bundle, ROOM, target)

    expect(result.lessonOsRestore).toEqual({ kind: "skipped-non-empty" })
    expect(await target.readAll()).toHaveLength(1)
    // I file del bundle sono comunque importati (il board non dipende dal restore)
    expect(await store2.read(ROOM_PATHS.scene)).not.toBeNull()
  })

  it("bundle SENZA snapshot ⇒ status no-snapshot, log intatto", async () => {
    const senzaSnapshot = await exportLesson(store, ROOM) // nessun log ⇒ nessun file lessonos
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()

    const result = await importLesson(store2, senzaSnapshot, ROOM, target)

    expect(result.lessonOsRestore).toEqual({ kind: "no-snapshot" })
    expect(await target.readAll()).toHaveLength(0)
  })

  it("nessun log fornito ⇒ status not-attempted (comportamento pre-esistente conservato)", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())

    const result = await importLesson(store2, bundle, ROOM)

    expect(result.lessonOsRestore).toEqual({ kind: "not-attempted" })
    // Il file snapshot viaggia comunque nello store (comportamento invariato)
    expect(await store2.read(ROOM_PATHS.lessonOsSnapshot)).not.toBeNull()
  })

  it("log senza importSnapshot (fallback InMemory) ⇒ status unsupported, niente throw", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const plain = new InMemoryEventLog()

    const result = await importLesson(store2, bundle, ROOM, plain)

    expect(result.lessonOsRestore).toEqual({ kind: "unsupported" })
  })

  it("importSnapshot che fallisce ⇒ status failed con messaggio, import file NON compromesso", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()
    target.importSnapshot = async () => {
      throw new Error("scrittura fallita")
    }

    const result = await importLesson(store2, bundle, ROOM, target)

    expect(result.lessonOsRestore).toEqual({ kind: "failed", error: "scrittura fallita" })
    // Il board resta importato: il restore è secondario, mai bloccante
    expect(await store2.read(ROOM_PATHS.scene)).not.toBeNull()
  })

  it("bundle malevolo ⇒ import rigetta PRIMA di toccare il log (restore mai su bundle invalido)", async () => {
    const zip = new JSZip()
    zip.file("raw/../etc/passwd", "x")
    zip.file(LESSON_PATHS.LESSONOS, '{"kind":"lesson.started"}\n')
    const malicious = await zip.generateAsync({ type: "blob" })
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()

    await expect(importLesson(store2, malicious, ROOM, target)).rejects.toThrow(/ZipSlip/)
    expect(await target.readAll()).toHaveLength(0)
  })
})
