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
import { exportLesson, importLesson, restoreLessonOsSnapshotFromBundle, LESSON_PATHS } from "../store/lessonBundle"

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

    await expect(importLesson(store2, blob)).rejects.toThrow(/Bundle incoerente|incoerente/)

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

    await expect(importLesson(store2, blob)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const journalBlob = await store2.read(LESSON_PATHS.JOURNAL)
    expect(journalBlob).not.toBeNull()
    const audioBlob = await store2.read("raw/audio/chunk-0.webm")
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

    await expect(importLesson(store2, blob)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const audioBlob = await store2.read("raw/audio/chunk-0.webm")
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

    await expect(importLesson(store2, blob)).resolves.toEqual({ lessonOsRestore: { kind: "not-attempted" } })

    const notesBlob = await store2.read("raw/notes..2024.jsonl")
    expect(notesBlob).not.toBeNull()
  })

  it("path malevolo raw/../etc/passwd ancora rifiutato (check per-segmento catcha ..)", async () => {
    const zip = new JSZip()
    zip.file("raw/../etc/passwd", "evil")
    const blob = await zip.generateAsync({ type: "blob" })

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)

    await expect(importLesson(store2, blob)).rejects.toThrow(/ZipSlip/)
  })
})

// --- Snapshot event-log LessonOS nel bundle (spec #35 §4.3) ---

describe("LessonBundle — snapshot event-log LessonOS", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  const ROOM = "test-room-lessonos"

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
    await importLesson(store2, bundle)
    const restored = await store2.read(LESSON_PATHS.LESSONOS)
    expect(restored).not.toBeNull()
    expect((await restored!.text()).trimEnd().split("\n")).toHaveLength(2)
  })
})

describe("LessonBundle — restore event-log LessonOS all'import (P32 R10)", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  const ROOM = "test-room-restore"

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
        for (const line of lines) {
          const { seq: _seq, ...event } = JSON.parse(line)
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

    const result = await importLesson(store2, bundle, target)

    expect(result.lessonOsRestore).toEqual({ kind: "restored", recovered: 2 })
    const events = await target.readAll()
    expect(events).toHaveLength(2)
    expect(events.map((e) => e.seq)).toEqual([1, 2])
    expect(events[1]!.kind).toBe("concept.introduced")
  })

  it("log NON vuoto ⇒ status skipped-non-empty, log INVARIATO (mai merge)", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()
    await target.append({ kind: "lesson.started", room: "altra", t: 500, evidence: ["lesson:altra@500"] })

    const result = await importLesson(store2, bundle, target)

    expect(result.lessonOsRestore).toEqual({ kind: "skipped-non-empty" })
    expect(await target.readAll()).toHaveLength(1)
    // I file del bundle sono comunque importati (il board non dipende dal restore)
    expect(await store2.read(LESSON_PATHS.SCENE)).not.toBeNull()
  })

  it("bundle SENZA snapshot ⇒ status no-snapshot, log intatto", async () => {
    const senzaSnapshot = await exportLesson(store, ROOM) // nessun log ⇒ nessun file lessonos
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()

    const result = await importLesson(store2, senzaSnapshot, target)

    expect(result.lessonOsRestore).toEqual({ kind: "no-snapshot" })
    expect(await target.readAll()).toHaveLength(0)
  })

  it("nessun log fornito ⇒ status not-attempted (comportamento pre-esistente conservato)", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())

    const result = await importLesson(store2, bundle)

    expect(result.lessonOsRestore).toEqual({ kind: "not-attempted" })
    // Il file snapshot viaggia comunque nello store (comportamento invariato)
    expect(await store2.read(LESSON_PATHS.LESSONOS)).not.toBeNull()
  })

  it("log senza importSnapshot (fallback InMemory) ⇒ status unsupported, niente throw", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    const plain = new InMemoryEventLog()

    const result = await importLesson(store2, bundle, plain)

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

    const result = await importLesson(store2, bundle, target)

    expect(result.lessonOsRestore).toEqual({ kind: "failed", error: "scrittura fallita" })
    // Il board resta importato: il restore è secondario, mai bloccante
    expect(await store2.read(LESSON_PATHS.SCENE)).not.toBeNull()
  })

  it("bundle malevolo ⇒ import rigetta PRIMA di toccare il log (restore mai su bundle invalido)", async () => {
    const zip = new JSZip()
    zip.file("raw/../etc/passwd", "x")
    zip.file(LESSON_PATHS.LESSONOS, '{"kind":"lesson.started"}\n')
    const malicious = await zip.generateAsync({ type: "blob" })
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const target = await restorableLog()

    await expect(importLesson(store2, malicious, target)).rejects.toThrow(/ZipSlip/)
    expect(await target.readAll()).toHaveLength(0)
  })
})

// P32 R10b — helper per il SOLO restore della memoria dal bundle, senza
// riscrivere i file (la Room lo usa nel flusso recovery: il board è già stato
// importato dal primo importLesson; qui si riprova solo il restore sul log
// appena ricreato vuoto).
describe("LessonBundle — restoreLessonOsSnapshotFromBundle (P32 R10b)", () => {
  let store: WorkspaceStore
  const ROOM = "test-room-recovery"

  beforeEach(async () => {
    store = new WorkspaceStore()
    withMockDriver(store, new MockDriver())
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

  async function restorableLog() {
    const { InMemoryEventLog } = await import("../lessonos/eventlog")
    class RestorableFakeLog extends InMemoryEventLog {
      async importSnapshot(snapshot: Blob) {
        const existing = await this.readAll()
        if (existing.length > 0) {
          throw new Error("LessonOS event log: importSnapshot richiede un log vuoto (restore, mai merge)")
        }
        const lines = (await snapshot.text()).split("\n").filter((line) => line.length > 0)
        for (const line of lines) {
          const { seq: _seq, ...event } = JSON.parse(line)
          await this.append(event)
        }
        return { recovered: lines.length, lastSeq: lines.length, droppedTail: 0, corrupted: false }
      }
    }
    return new RestorableFakeLog()
  }

  it("bundle con snapshot + log vuoto ⇒ restored, SENZA riscrivere i file dello store", async () => {
    const bundle = await exportLesson(store, ROOM, await filledLog())
    const target = await restorableLog()

    const status = await restoreLessonOsSnapshotFromBundle(bundle, target)

    expect(status).toEqual({ kind: "restored", recovered: 2 })
    expect(await target.readAll()).toHaveLength(2)
  })

  it("bundle senza snapshot ⇒ no-snapshot (bundle esportato senza memoria)", async () => {
    const bundle = await exportLesson(store, ROOM)
    const target = await restorableLog()

    const status = await restoreLessonOsSnapshotFromBundle(bundle, target)

    expect(status).toEqual({ kind: "no-snapshot" })
    expect(await target.readAll()).toHaveLength(0)
  })

  it("log non vuoto ⇒ skipped-non-empty anche via helper (mai merge)", async () => {
    const bundle = await exportLesson(store, ROOM, await filledLog())
    const target = await restorableLog()
    await target.append({ kind: "lesson.started", room: "viva", t: 1, evidence: ["lesson:viva@1"] })

    const status = await restoreLessonOsSnapshotFromBundle(bundle, target)

    expect(status).toEqual({ kind: "skipped-non-empty" })
    expect(await target.readAll()).toHaveLength(1)
  })
})
