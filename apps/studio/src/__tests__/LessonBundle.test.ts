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
import {
  toLegacyLessonOsEvent,
  type AnyEventEnvelopeV2,
  type AppendedEvent,
  type AppendedEventEnvelopeV2,
  type AppendEnvelopeResult,
  type EnvelopeEventLogStore,
  type LessonOsEvent,
} from "../lessonos/eventlog"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"

// --- Mock driver (stesso pattern degli altri test) ---

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
  private store = new Map<string, ArrayBuffer>()
  private mtim = new Map<string, number>()
  private legacyScenes = new Map<string, string>()

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

  getLegacyScene(room: string): string | null { return this.legacyScenes.get(room) ?? null }
  setLegacyScene(room: string, data: string): void { this.legacyScenes.set(room, data) }
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

const FIXED_PRODUCER = Object.freeze({
  id: "com.github.andreamarro.ardesia.studio",
  version: "0.0.0",
  commitSha: "a".repeat(40),
})

function canonicalLessonEvent(
  lessonId: string,
  sessionId = "11111111-1111-4111-8111-111111111111",
  eventId = "22222222-2222-4222-8222-222222222222",
): AnyEventEnvelopeV2 {
  return createEventEnvelopeV2(
    {
      lessonId,
      sessionId,
      kind: "lesson.started",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: FIXED_PRODUCER,
      causationId: null,
      idempotencyKey: `session:${sessionId}:started`,
      evidence: [{ ref: `lesson:${lessonId}@1000`, resolution: "verified" }],
      payload: { room: lessonId },
    },
    { eventId: () => eventId, now: () => new Date(1000) },
  )
}

function canonicalConceptEvent(
  lessonId: string,
  sessionId = "11111111-1111-4111-8111-111111111111",
): AnyEventEnvelopeV2 {
  return createEventEnvelopeV2(
    {
      lessonId,
      sessionId,
      kind: "concept.introduced",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: FIXED_PRODUCER,
      causationId: null,
      idempotencyKey: `concept:${sessionId}:led_polarity`,
      evidence: [{ ref: "manual:vol1:p30", resolution: "verified" }],
      payload: { conceptId: "led_polarity", labels: { it: "Polarità del LED" } },
    },
    {
      eventId: () => "44444444-4444-4444-8444-444444444444",
      now: () => new Date(1100),
    },
  )
}

function canonicalJournalLine(
  lessonId: string,
  sessionId = "11111111-1111-4111-8111-111111111111",
): string {
  return JSON.stringify(createEventEnvelopeV2(
    {
      lessonId,
      sessionId,
      kind: "journal.pointer.down",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: FIXED_PRODUCER,
      causationId: null,
      idempotencyKey: `journal:${sessionId}:33333333-3333-4333-8333-333333333333`,
      evidence: [{ ref: "board:pointer", resolution: "verified" }],
      payload: {},
    },
    {
      eventId: () => "33333333-3333-4333-8333-333333333333",
      now: () => new Date(1100),
    },
  ))
}

class CanonicalRestorableLog implements EnvelopeEventLogStore {
  private envelopes: AppendedEventEnvelopeV2[]
  restoreCalls = 0

  constructor(initial: readonly AnyEventEnvelopeV2[] = []) {
    this.envelopes = initial.map((envelope, index) => Object.freeze({
      ...structuredClone(envelope),
      seq: index + 1,
    }))
  }

  async append(_event: LessonOsEvent): Promise<AppendedEvent> {
    throw new Error("legacy append not supported by canonical test log")
  }

  async readAll(): Promise<AppendedEvent[]> {
    return this.envelopes
      .map(toLegacyLessonOsEvent)
      .filter((event): event is AppendedEvent => event !== null)
  }

  async appendEnvelope(envelope: AnyEventEnvelopeV2): Promise<AppendEnvelopeResult> {
    const event = Object.freeze({
      ...structuredClone(envelope),
      seq: this.envelopes.length + 1,
    }) as AppendedEventEnvelopeV2
    this.envelopes.push(event)
    return { event, appended: true }
  }

  async readAllEnvelopes(): Promise<AppendedEventEnvelopeV2[]> {
    return structuredClone(this.envelopes)
  }

  async readEnvelopesByLesson(lessonId: string): Promise<AppendedEventEnvelopeV2[]> {
    return (await this.readAllEnvelopes()).filter((event) => event.lessonId === lessonId)
  }

  async readEnvelopesBySession(
    lessonId: string,
    sessionId: string,
  ): Promise<AppendedEventEnvelopeV2[]> {
    return (await this.readAllEnvelopes()).filter(
      (event) => event.lessonId === lessonId && event.sessionId === sessionId,
    )
  }

  async importSnapshot(snapshot: Blob) {
    this.restoreCalls += 1
    const lines = (await snapshot.text()).split("\n").filter(Boolean)
    this.envelopes = lines.map((line) => Object.freeze(JSON.parse(line) as AppendedEventEnvelopeV2))
    return {
      recovered: this.envelopes.length,
      lastSeq: this.envelopes.length,
      droppedTail: 0,
      corrupted: false,
    }
  }
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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}\n{"t":200,"type":"t0"}\n'], { type: "application/x-ndjson" }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [{ id: "rect1", type: "rectangle", x: 0, y: 0 }] }))
    await store.write("raw/audio/chunk-0.webm", new Blob(["fake-audio-data-0"], { type: "audio/webm" }))

    // Primo export
    const bundle1 = await exportLesson(store, ROOM)

    // Import su store pulito (simula ri-processamento da zero)
    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await store2.importLessonBlobForRoom(bundle1, ROOM)

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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":1,"type":"element.add"}'], { type: "application/x-ndjson" }))
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
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":10,"type":"t0"}'], { type: "application/x-ndjson" }))
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

    await expect(importLesson(store2, blob)).resolves.toEqual({
      lessonOsRestore: { kind: "not-attempted" },
      identity: { kind: "unassigned" },
    })

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

    await expect(importLesson(store2, blob)).resolves.toEqual({
      lessonOsRestore: { kind: "not-attempted" },
      identity: { kind: "unassigned" },
    })

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

    await expect(importLesson(store2, blob)).resolves.toEqual({
      lessonOsRestore: { kind: "not-attempted" },
      identity: { kind: "unassigned" },
    })

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
    return new CanonicalRestorableLog([
      canonicalLessonEvent(ROOM),
      canonicalConceptEvent(ROOM),
    ])
  }

  it("log fornito e non vuoto ⇒ raw/lessonos-events.jsonl nel bundle, una riga per evento", async () => {
    const log = await filledLog()
    const bundle = await exportLesson(store, ROOM, log)
    const text = await readZipText(bundle, LESSON_PATHS.LESSONOS)
    expect(text).not.toBeNull()
    const parsed = text!.trimEnd().split("\n").map((line) => JSON.parse(line))
    expect(parsed).toEqual(await log.readAllEnvelopes())
  })

  it("senza log (o log vuoto) ⇒ NESSUN raw/lessonos-events.jsonl (niente file fantasma)", async () => {
    const senzaLog = await exportLesson(store, ROOM)
    expect(await readZipText(senzaLog, LESSON_PATHS.LESSONOS)).toBeNull()

    const conLogVuoto = await exportLesson(store, ROOM, new CanonicalRestorableLog())
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
    return new CanonicalRestorableLog([
      canonicalLessonEvent(ROOM),
      canonicalConceptEvent(ROOM),
    ])
  }

  /** Il fake canonico testa solo il cablaggio; la semantica IndexedDB reale è
   * coperta da IndexedDbEventLog.test.ts. */
  async function restorableLog() {
    return new CanonicalRestorableLog()
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
    await target.appendEnvelope(canonicalLessonEvent(
      "altra",
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
    ))

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

describe("LessonBundle — FB-4B portable room boundary", () => {
  it("esporta soltanto A e lascia B e i residui flat byte-identici", async () => {
    const store = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(store, mock)
    const roomA = roomPaths("room-A")
    const roomB = roomPaths("room-B")
    const journalA = `${canonicalJournalLine("room-A")}\n`
    const journalB = `${canonicalJournalLine("room-B")}\n`
    const snapshotA = `${JSON.stringify({ ...canonicalLessonEvent("room-A"), seq: 1 })}\n`
    const snapshotB = `${JSON.stringify({ ...canonicalLessonEvent("room-B"), seq: 1 })}\n`
    const flatJournal = '{"t":9,"type":"t0","sentinel":"flat"}\n'
    const flatLessonOs = '{"seq":1,"kind":"lesson.started","room":"flat","t":9,"evidence":["flat"]}\n'

    await store.write(roomA.scene, new Blob(['{"room":"A"}']))
    await store.write(roomA.journal, new Blob([journalA]))
    await store.write(roomA.lessonOsSnapshot, new Blob([snapshotA]))
    await store.write(roomB.scene, new Blob(['{"room":"B"}']))
    await store.write(roomB.journal, new Blob([journalB]))
    await store.write(roomB.lessonOsSnapshot, new Blob([snapshotB]))
    await store.write(LESSON_PATHS.JOURNAL, new Blob([flatJournal]))
    await store.write(LESSON_PATHS.LESSONOS, new Blob([flatLessonOs]))

    const bundle = await exportLesson(store, "room-A")

    expect(await readZipText(bundle, LESSON_PATHS.SCENE)).toBe('{"room":"A"}')
    expect(await readZipText(bundle, LESSON_PATHS.JOURNAL)).toBe(journalA)
    expect(await readZipText(bundle, LESSON_PATHS.LESSONOS)).toBe(snapshotA)
    expect(JSON.stringify(await listZipPaths(bundle))).not.toContain("room-B")
    expect(await (await store.read(roomB.journal))!.text()).toBe(journalB)
    expect(await (await store.read(roomB.lessonOsSnapshot))!.text()).toBe(snapshotB)
    expect(await (await store.read(LESSON_PATHS.JOURNAL))!.text()).toBe(flatJournal)
    expect(await (await store.read(LESSON_PATHS.LESSONOS))!.text()).toBe(flatLessonOs)
  })

  it("round-trip canonico preserva eventId, sessionId e SHA esatti", async () => {
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    const paths = roomPaths("room-A")
    const envelope = canonicalLessonEvent("room-A")
    await source.write(paths.scene, new Blob(['{"room":"A","elements":[]}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine("room-A")}\n`]))
    const bundle = await exportLesson(source, "room-A", new CanonicalRestorableLog([
      envelope,
      canonicalLessonEvent(
        "room-B",
        "77777777-7777-4777-8777-777777777777",
        "88888888-8888-4888-8888-888888888888",
      ),
    ]))
    const exportedText = await readZipText(bundle, LESSON_PATHS.LESSONOS)
    expect(exportedText).not.toBeNull()
    const exportedLines = exportedText!.trim().split("\n")
    expect(exportedLines).toHaveLength(1)
    const exported = JSON.parse(exportedLines[0]!)

    expect(exported.eventId).toBe(envelope.eventId)
    expect(exported.sessionId).toBe(envelope.sessionId)
    expect(exported.producer.commitSha).toBe(FIXED_PRODUCER.commitSha)

    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetLog = new CanonicalRestorableLog()
    const result = await importLesson(target, bundle, targetLog, {
      destinationLessonId: "room-A",
      legacyClaim: { userConfirmed: true },
    })

    expect(result.identity).toEqual({ kind: "embedded", lessonId: "room-A" })
    expect(result.lessonOsRestore).toEqual({ kind: "restored", recovered: 1 })
    expect(targetLog.restoreCalls).toBe(1)
    expect(await targetLog.readAllEnvelopes()).toEqual([{ ...envelope, seq: 1 }])
    expect(await (await target.read(paths.journal))!.text()).toBe(`${canonicalJournalLine("room-A")}\n`)
    expect(await target.read(LESSON_PATHS.JOURNAL)).toBeNull()
  })

  it("rifiuta mismatch destinazione/identità prima di store e log", async () => {
    const zip = new JSZip()
    zip.file(LESSON_PATHS.SCENE, '{"room":"A"}')
    zip.file(LESSON_PATHS.JOURNAL, `${canonicalJournalLine("room-A")}\n`)
    zip.file(
      LESSON_PATHS.LESSONOS,
      `${JSON.stringify({ ...canonicalLessonEvent("room-A"), seq: 1 })}\n`,
    )
    const bundle = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetLog = new CanonicalRestorableLog()

    await expect(importLesson(target, bundle, targetLog, {
      destinationLessonId: "room-B",
      legacyClaim: { userConfirmed: true },
    })).rejects.toThrow(/identity|lesson|destination|destinazione/i)

    expect(await target.list()).toEqual([])
    expect(await targetLog.readAllEnvelopes()).toEqual([])
    expect(targetLog.restoreCalls).toBe(0)
  })

  it("rifiuta journal e LessonOS v2 con lessonId discordanti prima di ogni write", async () => {
    const zip = new JSZip()
    zip.file(LESSON_PATHS.SCENE, '{"room":"A"}')
    zip.file(LESSON_PATHS.JOURNAL, `${canonicalJournalLine("room-A")}\n`)
    zip.file(
      LESSON_PATHS.LESSONOS,
      `${JSON.stringify({ ...canonicalLessonEvent("room-B"), seq: 1 })}\n`,
    )
    const bundle = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetLog = new CanonicalRestorableLog()

    await expect(importLesson(target, bundle, targetLog, {
      destinationLessonId: "room-A",
      legacyClaim: { userConfirmed: true },
    })).rejects.toThrow(/identity|lesson|differenti/i)

    expect(await target.list()).toEqual([])
    expect(await targetLog.readAllEnvelopes()).toEqual([])
    expect(targetLog.restoreCalls).toBe(0)
  })

  it("assegna un bundle legacy alla room solo con conferma esplicita e non muta il ZIP", async () => {
    const zip = new JSZip()
    const legacyJournal = '{"t":100,"type":"t0"}\n'
    zip.file(LESSON_PATHS.SCENE, '{"legacy":true}')
    zip.file(LESSON_PATHS.JOURNAL, legacyJournal)
    const bundle = await zip.generateAsync({ type: "blob" })
    const originalBytes = new Uint8Array(await bundle.arrayBuffer())

    const unconfirmed = new WorkspaceStore()
    withMockDriver(unconfirmed, new MockDriver())
    const unconfirmedResult = await importLesson(unconfirmed, bundle, null, {
      destinationLessonId: "legacy-room",
    })
    expect(unconfirmedResult.identity).toEqual({ kind: "unassigned" })
    expect(await (await unconfirmed.read(LESSON_PATHS.JOURNAL))!.text()).toBe(legacyJournal)
    expect(await unconfirmed.read(roomPaths("legacy-room").journal)).toBeNull()

    const confirmed = new WorkspaceStore()
    withMockDriver(confirmed, new MockDriver())
    const confirmedResult = await importLesson(confirmed, bundle, null, {
      destinationLessonId: "legacy-room",
      legacyClaim: { userConfirmed: true },
    })
    expect(confirmedResult.identity).toEqual({ kind: "claimed", lessonId: "legacy-room" })
    expect(await (await confirmed.read(roomPaths("legacy-room").journal))!.text()).toBe(legacyJournal)
    expect(await confirmed.read(LESSON_PATHS.JOURNAL)).toBeNull()
    expect(new Uint8Array(await bundle.arrayBuffer())).toEqual(originalBytes)
  })

  it("l'import esplicito per room sincronizza la scena nella cache legacy", async () => {
    const zip = new JSZip()
    const scene = '{"cached":true}'
    zip.file(LESSON_PATHS.SCENE, scene)
    const bundle = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    const mock = new MockDriver()
    withMockDriver(target, mock)

    await target.importLessonBlobForRoom(bundle, "cached-room")

    expect(mock.getLegacyScene("cached-room")).toBe(scene)
  })
})
