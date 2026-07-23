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
import {
  exportLesson,
  importLesson,
  LESSON_PATHS,
  recoverPendingLessonImport,
} from "../store/lessonBundle"
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
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"

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

class FaultInjectingDriver extends MockDriver {
  failWrite: ((path: string, data: Blob) => boolean) | null = null

  override async write(path: string, data: Blob): Promise<void> {
    if (this.failWrite?.(path, data)) throw new Error(`fault injection write: ${path}`)
    await super.write(path, data)
  }
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

async function sha256Hex(data: Uint8Array): Promise<string> {
  const bytes = Uint8Array.from(data)
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function refreshManifestFile(zip: JSZip, path: string): Promise<void> {
  const manifestEntry = zip.file(LESSON_PATHS.MANIFEST)
  const payloadEntry = zip.file(path)
  if (!manifestEntry || !payloadEntry) throw new Error(`fixture manifest incompleta: ${path}`)
  const manifest = JSON.parse(await manifestEntry.async("text")) as {
    files: Array<{ path: string; bytes: number; sha256: string }>
  }
  const bytes = await payloadEntry.async("uint8array")
  const record = manifest.files.find((file) => file.path === path)
  if (!record) throw new Error(`fixture manifest senza record: ${path}`)
  record.bytes = bytes.byteLength
  record.sha256 = await sha256Hex(bytes)
  zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest)}\n`)
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

  it("FB-5A esporta un manifest che lega identità, payload, byte e SHA-256", async () => {
    const sessionId = "11111111-1111-4111-8111-111111111111"
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM, sessionId)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))

    const bundle = await exportLesson(
      store,
      ROOM,
      new CanonicalRestorableLog([canonicalLessonEvent(ROOM, sessionId)]),
    )
    const zip = await JSZip.loadAsync(bundle)
    const manifestText = await readZipText(bundle, "manifest.json")

    expect(manifestText).not.toBeNull()
    const manifest = JSON.parse(manifestText!) as {
      bundleVersion: number
      schemaVersion: number
      lessonId: string
      sessionIds: string[]
      producer: unknown
      requiredArtifacts: string[]
      optionalArtifacts: string[]
      lessonOs: { status: string; warnings: string[] }
      files: Array<{ path: string; bytes: number; sha256: string; required: boolean }>
    }
    expect(manifest).toMatchObject({
      bundleVersion: 1,
      schemaVersion: 1,
      lessonId: ROOM,
      sessionIds: [sessionId],
      producer: studioProducerIdentity(),
      requiredArtifacts: [
        LESSON_PATHS.SCENE,
        LESSON_PATHS.JOURNAL,
        LESSON_PATHS.SESSION,
      ],
      optionalArtifacts: [LESSON_PATHS.LESSONOS, `${LESSON_PATHS.AUDIO_DIR}*`],
      lessonOs: { status: "included", warnings: [] },
    })
    expect(manifest.files.map((file) => file.path)).toEqual([
      LESSON_PATHS.SCENE,
      LESSON_PATHS.JOURNAL,
      LESSON_PATHS.LESSONOS,
      LESSON_PATHS.SESSION,
    ])

    for (const file of manifest.files) {
      const entry = zip.file(file.path)
      expect(entry, file.path).not.toBeNull()
      const bytes = await entry!.async("uint8array")
      expect(file.bytes, file.path).toBe(bytes.byteLength)
      expect(file.sha256, file.path).toBe(await sha256Hex(bytes))
      expect(file.required, file.path).toBe(new Set<string>([
        LESSON_PATHS.SCENE,
        LESSON_PATHS.JOURNAL,
        LESSON_PATHS.SESSION,
      ]).has(file.path))
    }
  })

  it("FB-5A importa un bundle manifestato senza materializzare il manifest nel workspace", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const bundle = await exportLesson(store, ROOM)
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())

    await expect(importLesson(target, bundle, null, {
      destinationLessonId: ROOM,
    })).resolves.toMatchObject({ identity: { kind: "embedded", lessonId: ROOM } })
    expect(await target.read(roomPaths(ROOM).scene)).not.toBeNull()
    expect(await target.read(LESSON_PATHS.MANIFEST)).toBeNull()
  })

  it("FB-5A rifiuta payload manomesso prima di workspace e LessonOS", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const bundle = await exportLesson(
      store,
      ROOM,
      new CanonicalRestorableLog([canonicalLessonEvent(ROOM)]),
    )
    const zip = await JSZip.loadAsync(bundle)
    zip.file(LESSON_PATHS.SCENE, JSON.stringify({ tampered: true }))
    const tampered = await zip.generateAsync({ type: "blob" })

    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetPaths = roomPaths(ROOM)
    await target.write(targetPaths.scene, new Blob(["original-scene"]))
    const targetLog = new CanonicalRestorableLog()

    await expect(importLesson(target, tampered, targetLog, {
      destinationLessonId: ROOM,
    })).rejects.toThrow(/SHA-256|hash|integrit/i)
    expect(await (await target.read(targetPaths.scene))!.text()).toBe("original-scene")
    expect(await target.read(targetPaths.journal)).toBeNull()
    expect(await targetLog.readAllEnvelopes()).toEqual([])
    expect(targetLog.restoreCalls).toBe(0)
  })

  it("FB-5A non esporta un bundle senza tutti i required artifacts", async () => {
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")

    await expect(exportLesson(store, ROOM)).rejects.toThrow(/obbligatorio|required/i)
  })

  it("FB-5A rifiuta uno schema manifest non supportato prima di ogni write", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const zip = await JSZip.loadAsync(await exportLesson(store, ROOM))
    const manifest = JSON.parse((await zip.file(LESSON_PATHS.MANIFEST)!.async("text")))
    manifest.schemaVersion = 2
    zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest)}\n`)
    const unsupported = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetPaths = roomPaths(ROOM)
    await target.write(targetPaths.scene, new Blob(["original-scene"]))

    await expect(importLesson(target, unsupported, null, {
      destinationLessonId: ROOM,
    })).rejects.toThrow(/schema non supportato/i)
    expect(await (await target.read(targetPaths.scene))!.text()).toBe("original-scene")
    expect(await target.read(targetPaths.journal)).toBeNull()
  })

  it("FB-5A rifiuta producer manifest non reverse-DNS o non SemVer prima di ogni write", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const sourceBundle = await exportLesson(store, ROOM)

    for (const producer of [
      { id: "studio", version: "1.0.0", commitSha: FIXED_PRODUCER.commitSha },
      { id: FIXED_PRODUCER.id, version: "latest", commitSha: FIXED_PRODUCER.commitSha },
    ]) {
      const zip = await JSZip.loadAsync(sourceBundle)
      const manifest = JSON.parse(await zip.file(LESSON_PATHS.MANIFEST)!.async("text"))
      manifest.producer = producer
      zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest)}\n`)
      const invalid = await zip.generateAsync({ type: "blob" })
      const target = new WorkspaceStore()
      withMockDriver(target, new MockDriver())
      await target.write("raw/sentinel", new Blob(["intatto"]))

      await expect(importLesson(target, invalid, null, {
        destinationLessonId: ROOM,
      })).rejects.toThrow(/producer/i)
      expect((await target.list()).map((entry) => entry.path)).toEqual(["raw/sentinel"])
    }
  })

  it("FB-5A rifiuta un required artifact mancante anche se omesso dall'inventario", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const zip = await JSZip.loadAsync(await exportLesson(store, ROOM))
    const manifest = JSON.parse(await zip.file(LESSON_PATHS.MANIFEST)!.async("text"))
    manifest.files = manifest.files.filter((file: { path: string }) => (
      file.path !== LESSON_PATHS.JOURNAL
    ))
    zip.remove(LESSON_PATHS.JOURNAL)
    zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest)}\n`)
    const missing = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    await target.write("raw/sentinel", new Blob(["intatto"]))

    await expect(importLesson(target, missing, null, {
      destinationLessonId: ROOM,
    })).rejects.toThrow(/obbligatorio|required/i)
    expect(await (await target.read("raw/sentinel"))!.text()).toBe("intatto")
    expect((await target.list()).map((entry) => entry.path)).toEqual(["raw/sentinel"])
  })

  it("FB-5A rifiuta il downgrade ottenuto rimuovendo il manifest da payload v2", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const zip = await JSZip.loadAsync(await exportLesson(
      store,
      ROOM,
      new CanonicalRestorableLog([canonicalLessonEvent(ROOM)]),
    ))
    zip.remove(LESSON_PATHS.MANIFEST)
    const downgraded = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    const targetPaths = roomPaths(ROOM)
    await target.write(targetPaths.scene, new Blob(["original-scene"]))
    const targetLog = new CanonicalRestorableLog()

    await expect(importLesson(target, downgraded, targetLog, {
      destinationLessonId: ROOM,
    })).rejects.toThrow(/manifest.*mancante|downgrade/i)
    expect(await (await target.read(targetPaths.scene))!.text()).toBe("original-scene")
    expect(await target.read(targetPaths.journal)).toBeNull()
    expect(await targetLog.readAllEnvelopes()).toEqual([])
    expect(targetLog.restoreCalls).toBe(0)
  })

  it("FB-5A rifiuta sessionIds manifest discordanti dal payload canonico", async () => {
    await store.write(
      roomPaths(ROOM).journal,
      new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
    )
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const zip = await JSZip.loadAsync(await exportLesson(store, ROOM))
    const manifest = JSON.parse(await zip.file(LESSON_PATHS.MANIFEST)!.async("text"))
    manifest.sessionIds = ["99999999-9999-4999-8999-999999999999"]
    zip.file(LESSON_PATHS.MANIFEST, `${JSON.stringify(manifest)}\n`)
    const mismatched = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    await target.write("raw/sentinel", new Blob(["intatto"]))

    await expect(importLesson(target, mismatched, null, {
      destinationLessonId: ROOM,
    })).rejects.toThrow(/sessionIds|session/i)
    expect((await target.list()).map((entry) => entry.path)).toEqual(["raw/sentinel"])
  })

  it("FB-5A usa il manifest come identità per un journal legacy verificato", async () => {
    const legacyJournal = '{"t":100,"type":"t0"}\n'
    await store.write(roomPaths(ROOM).journal, new Blob([legacyJournal]))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    const bundle = await exportLesson(store, ROOM)
    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())

    const result = await importLesson(target, bundle, null, { destinationLessonId: ROOM })

    expect(result.identity).toEqual({ kind: "embedded", lessonId: ROOM })
    expect(await (await target.read(roomPaths(ROOM).journal))!.text()).toBe(legacyJournal)
    expect(await target.read(LESSON_PATHS.JOURNAL)).toBeNull()
  })

  // --- TEST (3): struttura raw/ conforme ---

  it("bundle contiene sempre raw/events.jsonl, raw/session.yaml, raw/board.excalidraw", async () => {
    // Seed dei 3 file obbligatori
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"]))
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
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    // Seeda chunk audio come se fossero ancora su disco (consenso revocato)
    await store.write(`${roomPaths(ROOM).audioDir}chunk-0.webm`, new Blob(["audio-data-0"], { type: "audio/webm" }))

    const bundle = await exportLesson(store, ROOM)
    const paths = await listZipPaths(bundle)

    const audioPaths = paths.filter((p) => p.startsWith(LESSON_PATHS.AUDIO_DIR))
    expect(audioPaths).toHaveLength(0)
  })

  // --- TEST gemello: consenso ON + chunk esistenti ⇒ bundle CONTIENE audio ---

  it("consenso ON con chunk audio esistenti — bundle contiene raw/audio/chunk-*.webm", async () => {
    await store.write(roomPaths(ROOM).journal, new Blob(['{"t":100,"type":"element.add"}'], { type: "application/x-ndjson" }))
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
    await store.write(`${roomPaths(ROOM).audioDir}chunk-0.webm`, new Blob(["audio-data-0"], { type: "audio/webm" }))
    await store.write(`${roomPaths(ROOM).audioDir}chunk-1.webm`, new Blob(["audio-data-1"], { type: "audio/webm" }))

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
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [{ id: "rect1", type: "rectangle", x: 0, y: 0 }] }))
    await store.write(`${roomPaths(ROOM).audioDir}chunk-0.webm`, new Blob(["fake-audio-data-0"], { type: "audio/webm" }))

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
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 1\naudioConsent: false\n"]))

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
    await store.write(roomPaths(ROOM).session, new Blob(["v: 1\ncreated: 10\naudioConsent: false\n"]))
    await store.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))

    const bundle = await exportLesson(store, ROOM)

    const store2 = new WorkspaceStore()
    const mock2 = new MockDriver()
    withMockDriver(store2, mock2)
    await importLesson(store2, bundle)

    const journalBlob = await store2.read(roomPaths(ROOM).journal)
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
    await store.write(roomPaths(ROOM).journal, new Blob([`${canonicalJournalLine(ROOM)}\n`]))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
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
    const restored = await store2.read(roomPaths(ROOM).lessonOsSnapshot)
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
    await store.write(roomPaths(ROOM).journal, new Blob([`${canonicalJournalLine(ROOM)}\n`]))
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
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
    expect(await store2.read(roomPaths(ROOM).scene)).not.toBeNull()
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
    expect(await store2.read(roomPaths(ROOM).lessonOsSnapshot)).not.toBeNull()
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

  it("importSnapshot che fallisce ⇒ status failed e workspace precedente byte-identico", async () => {
    const bundle = await bundleWithSnapshot()
    const store2 = new WorkspaceStore()
    withMockDriver(store2, new MockDriver())
    const previousScene = new Blob(['{"previous":true}'])
    await store2.write(roomPaths(ROOM).scene, previousScene)
    const target = await restorableLog()
    target.importSnapshot = async () => {
      throw new Error("scrittura fallita")
    }

    const result = await importLesson(store2, bundle, target)

    expect(result.lessonOsRestore).toEqual({ kind: "failed", error: "scrittura fallita" })
    expect(new Uint8Array(await (await store2.read(roomPaths(ROOM).scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await previousScene.arrayBuffer()))
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
    await store.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
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
    await source.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
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
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(roomPaths("room-A").scene, new Blob(['{"room":"A"}']))
    await source.write(roomPaths("room-A").journal, new Blob([`${canonicalJournalLine("room-A")}\n`]))
    await source.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    const bundle = await exportLesson(
      source,
      "room-A",
      new CanonicalRestorableLog([canonicalLessonEvent("room-A")]),
    )
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
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(roomPaths("room-A").scene, new Blob(['{"room":"A"}']))
    await source.write(roomPaths("room-A").journal, new Blob([`${canonicalJournalLine("room-A")}\n`]))
    await source.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
    const zip = await JSZip.loadAsync(await exportLesson(
      source,
      "room-A",
      new CanonicalRestorableLog([canonicalLessonEvent("room-A")]),
    ))
    zip.file(
      LESSON_PATHS.LESSONOS,
      `${JSON.stringify({ ...canonicalLessonEvent("room-B"), seq: 1 })}\n`,
    )
    await refreshManifestFile(zip, LESSON_PATHS.LESSONOS)
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

  it("FB-6B valida in preview senza scrivere stage, target o cache legacy", async () => {
    const room = "room-materials-preview"
    const paths = roomPaths(room)
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(paths.scene, new Blob(['{"version":"candidate"}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine(room)}\n`]))
    await source.write(paths.session, new Blob(["v: 1\ncreated: 2000\naudioConsent: false\n"]))
    const bundle = await exportLesson(source, room)

    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    const originalScene = new Blob(['{"version":"original"}'])
    await target.write(paths.scene, originalScene)
    driver.failWrite = () => true

    const preview = await target.previewLessonBlobForRoom(bundle, room)

    expect(preview).toMatchObject({
      kind: "validated",
      identity: { kind: "embedded", lessonId: room },
      lessonOs: "missing",
      pendingRecovery: null,
      commitReady: true,
      manifest: {
        lessonId: room,
        producer: studioProducerIdentity(),
      },
    })
    expect(preview.files).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourcePath: LESSON_PATHS.SCENE,
        targetPath: paths.scene,
        bytes: expect.any(Number),
        action: "replace",
      }),
      expect.objectContaining({
        sourcePath: LESSON_PATHS.JOURNAL,
        targetPath: paths.journal,
        bytes: expect.any(Number),
        action: "create",
      }),
    ]))
    expect(new Uint8Array(await (await target.read(paths.scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await originalScene.arrayBuffer()))
    expect(await target.list("raw/.ardesia/import-transactions/")).toEqual([])
    expect(driver.getLegacyScene(room)).toBeNull()
  })

  it("FB-6B rifiuta in preview il namespace transazionale riservato", async () => {
    const zip = new JSZip()
    zip.file("raw/.ardesia/import-transactions/active.json", "{}")
    const bundle = await zip.generateAsync({ type: "blob" })
    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    driver.failWrite = () => true

    await expect(target.previewLessonBlobForRoom(bundle, "room-reserved-namespace"))
      .rejects.toThrow(/transaction|target|riservat/i)
    expect(await target.list()).toEqual([])

    const rootZip = new JSZip()
    rootZip.file("raw/.ardesia/import-transactions", "{}")
    await expect(target.previewLessonBlobForRoom(
      await rootZip.generateAsync({ type: "blob" }),
      "room-reserved-root",
    )).rejects.toThrow(/transaction|target|riservat/i)
    expect(await target.list()).toEqual([])

    await expect(target.previewLessonBlobForRoom(new Blob(["not-a-zip"]), "private/secret"))
      .rejects.toThrow(/room/i)
    expect(await target.list()).toEqual([])
  })
})

describe("LessonBundle — FB-5B transactional import", () => {
  it("ripristina byte per byte la lezione se una write fallisce a commit iniziato", async () => {
    const room = "room-transaction-write-failure"
    const paths = roomPaths(room)
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(paths.scene, new Blob(['{"version":"new"}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine(room)}\n`]))
    await source.write(paths.session, new Blob(["v: 1\ncreated: 2000\naudioConsent: false\n"]))
    const bundle = await exportLesson(source, room)

    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    const originalScene = new Blob(['{"version":"original"}'])
    const originalJournal = new Blob(["original-journal\n"])
    const originalSession = new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"])
    await target.write(paths.scene, originalScene)
    await target.write(paths.journal, originalJournal)
    await target.write(paths.session, originalSession)

    const liveTargets = new Set([paths.session, paths.scene, paths.journal])
    let liveWrites = 0
    driver.failWrite = (path) => liveTargets.has(path) && ++liveWrites === 3

    await expect(importLesson(target, bundle, null, {
      destinationLessonId: room,
    })).rejects.toThrow(/fault injection|rollback|transaction/i)

    expect(liveWrites).toBeGreaterThan(1)
    expect(new Uint8Array(await (await target.read(paths.scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await originalScene.arrayBuffer()))
    expect(new Uint8Array(await (await target.read(paths.journal))!.arrayBuffer()))
      .toEqual(new Uint8Array(await originalJournal.arrayBuffer()))
    expect(new Uint8Array(await (await target.read(paths.session))!.arrayBuffer()))
      .toEqual(new Uint8Array(await originalSession.arrayBuffer()))
    const transactionEvidence = await target.list("raw/.ardesia/import-transactions/")
    expect(transactionEvidence.some((entry) => entry.path.endsWith("/transaction.json"))).toBe(true)
    expect(transactionEvidence.some((entry) => entry.path.endsWith("/active.json"))).toBe(false)
  })

  it("riprende dopo riavvio un rollback interrotto senza perdere gli originali", async () => {
    const room = "room-transaction-restart"
    const paths = roomPaths(room)
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(paths.scene, new Blob(['{"version":"new"}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine(room)}\n`]))
    await source.write(paths.session, new Blob(["v: 1\ncreated: 2000\naudioConsent: false\n"]))
    const bundle = await exportLesson(source, room)

    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    const originals = new Map<string, Blob>([
      [paths.scene, new Blob(['{"version":"original"}'])],
      [paths.journal, new Blob(["original-journal\n"])],
      [paths.session, new Blob(["v: 1\ncreated: 1000\naudioConsent: false\n"])],
    ])
    for (const [path, data] of originals) await target.write(path, data)

    const liveTargets = new Set(originals.keys())
    let liveWrites = 0
    driver.failWrite = (path) => {
      if (!liveTargets.has(path)) return false
      liveWrites += 1
      return liveWrites === 3 || liveWrites === 5
    }

    await expect(importLesson(target, bundle, null, {
      destinationLessonId: room,
    })).rejects.toThrow(/recovery pendente/i)
    expect(await target.read("raw/.ardesia/import-transactions/active.json")).not.toBeNull()

    driver.failWrite = null
    await expect(target.recoverPendingLessonImport()).resolves.toBeNull()
    expect(await target.read("raw/.ardesia/import-transactions/active.json")).toBeNull()
    for (const [path, original] of originals) {
      expect(new Uint8Array(await (await target.read(path))!.arrayBuffer()))
        .toEqual(new Uint8Array(await original.arrayBuffer()))
    }
  })

  it("abbandona uno stage stale senza mutare la lezione e conserva la diagnosi", async () => {
    const room = "room-transaction-stale-stage"
    const paths = roomPaths(room)
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(paths.scene, new Blob(['{"version":"new"}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine(room)}\n`]))
    await source.write(paths.session, new Blob(["v: 1\ncreated: 2000\naudioConsent: false\n"]))
    const bundle = await exportLesson(source, room)

    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    const previousScene = new Blob(['{"version":"original"}'])
    await target.write(paths.scene, previousScene)
    driver.failWrite = (path) => path.includes("/stage/1.blob")

    await expect(importLesson(target, bundle, null, {
      destinationLessonId: room,
    })).rejects.toThrow(/fault injection/i)
    expect(await target.read("raw/.ardesia/import-transactions/active.json")).not.toBeNull()
    expect(new Uint8Array(await (await target.read(paths.scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await previousScene.arrayBuffer()))

    driver.failWrite = null
    await expect(recoverPendingLessonImport(target)).resolves.toBeNull()
    expect(await target.read("raw/.ardesia/import-transactions/active.json")).toBeNull()
    const evidence = await target.list("raw/.ardesia/import-transactions/")
    const record = evidence.find((entry) => entry.path.endsWith("/transaction.json"))
    expect(record).toBeDefined()
    expect(await record!.data.text()).toContain('"phase": "aborted"')
    expect(new Uint8Array(await (await target.read(paths.scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await previousScene.arrayBuffer()))
  })

  it("FB-6B segnala una recovery pendente in preview senza eseguirla", async () => {
    const room = "room-materials-pending-recovery"
    const paths = roomPaths(room)
    const source = new WorkspaceStore()
    withMockDriver(source, new MockDriver())
    await source.write(paths.scene, new Blob(['{"version":"candidate"}']))
    await source.write(paths.journal, new Blob([`${canonicalJournalLine(room)}\n`]))
    await source.write(paths.session, new Blob(["v: 1\ncreated: 2000\naudioConsent: false\n"]))
    const bundle = await exportLesson(source, room)

    const target = new WorkspaceStore()
    const driver = new FaultInjectingDriver()
    withMockDriver(target, driver)
    const originalScene = new Blob(['{"version":"original"}'])
    await target.write(paths.scene, originalScene)
    driver.failWrite = (path) => path.includes("/stage/1.blob")

    await expect(importLesson(target, bundle, null, {
      destinationLessonId: room,
    })).rejects.toThrow(/fault injection/i)
    const activeBefore = await (await target.read(
      "raw/.ardesia/import-transactions/active.json",
    ))!.text()

    driver.failWrite = () => true
    const preview = await target.previewLessonBlobForRoom(bundle, room)

    expect(preview.commitReady).toBe(false)
    expect(preview.pendingRecovery).toMatchObject({ phase: "staging" })
    expect(await (await target.read("raw/.ardesia/import-transactions/active.json"))!.text())
      .toBe(activeBefore)
    expect(new Uint8Array(await (await target.read(paths.scene))!.arrayBuffer()))
      .toEqual(new Uint8Array(await originalScene.arrayBuffer()))
  })
})
