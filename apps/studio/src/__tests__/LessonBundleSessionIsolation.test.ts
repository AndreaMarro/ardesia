// @vitest-environment jsdom
// ARDESIA Studio — isolamento room di session.yaml e raw/audio/ nell'export .lesson.
//
// Regressione coperta: exportLesson leggeva la sessione e i chunk audio dai path
// FLAT globali (raw/session.yaml, raw/audio/) mentre scena, journal e snapshot
// LessonOS erano già room-scoped. Due conseguenze, entrambe riprodotte qui:
//   (1) una lezione creata nell'app (mai importata, nessun consenso audio) non
//       aveva alcun file flat e l'export falliva sull'artefatto obbligatorio;
//   (2) il bundle della lezione A trasportava la sessione — e con consenso ON
//       i chunk audio — appartenenti alla lezione B.
import { describe, it, expect, beforeEach, vi } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { WorkspaceDriver, FileEntry } from "../store/types"
import { exportLesson, importLesson, LESSON_PATHS } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import { IDBFactory, IDBKeyRange } from "fake-indexeddb"
import { IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import { buildLessonBundleManifest } from "../store/lessonBundleManifest"
import { parseSessionYamlV2, serializeSessionYamlV2, sessionPaths } from "../store/sessionState"

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
      entries.push({ path, data: new Blob([buf]), mtime: this.mtim.get(path) ?? 0 })
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

/** Solo file: JSZip materializza anche le directory implicite (es. "raw/audio/"). */
async function zipPaths(blob: Blob): Promise<string[]> {
  const zip = await JSZip.loadAsync(blob)
  const out: string[] = []
  zip.forEach((path, entry) => { if (!entry.dir) out.push(path) })
  return out.sort()
}

async function zipText(blob: Blob, path: string): Promise<string | null> {
  const zip = await JSZip.loadAsync(blob)
  const entry = zip.file(path)
  return entry ? entry.async("text") : null
}

const LESSON_A = "lezione-a"
const LESSON_B = "lezione-b"
const B_MARKER = "SESSIONE-DELLA-LEZIONE-B"

async function seedRoom(store: WorkspaceStore, room: string, tick: number): Promise<void> {
  await store.write(roomPaths(room).journal, new Blob([`{"t":${tick}}\n`]))
  await store.saveScene(room, JSON.stringify({ type: "excalidraw", elements: [] }))
}

describe("export .lesson — isolamento room di sessione e audio", () => {
  let store: WorkspaceStore

  beforeEach(() => {
    store = new WorkspaceStore()
    withMockDriver(store, new MockDriver())
  })

  it("trasporta due sessioni canoniche con identità e byte invariati, escludendo l'altra lezione", async () => {
    const first = {lessonId:LESSON_B,sessionId:"11111111-1111-4111-8111-111111111111"}
    const second = {...first,sessionId:"22222222-2222-4222-8222-222222222222"}
    await seedRoom(store,LESSON_B,2)
    for (const identity of [first,second,{...first,lessonId:LESSON_A}]) {
      expect((await store.createSessionOnce(identity,{created:1000})).kind).toBe("created")
    }
    const bundle = await exportLesson(store,LESSON_B)
    const manifest = JSON.parse((await zipText(bundle,LESSON_PATHS.MANIFEST))!)
    expect(manifest).toMatchObject({schemaVersion:2,sessionIds:[first.sessionId,second.sessionId],
      sessions:{includedSessionIds:[first.sessionId,second.sessionId],missingSessionIds:[]},
      compatibility:{minimumReaderSchemaVersion:2}})
    const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
    await importLesson(target,bundle,undefined,{destinationLessonId:LESSON_B})
    for (const identity of [first,second]) {
      const path = sessionPaths(identity).session
      const original = await store.read(path)
      const restored = await target.read(path)
      expect(await restored!.text()).toBe(await original!.text())
      expect(parseSessionYamlV2(new Uint8Array(await restored!.arrayBuffer()))).toMatchObject(identity)
      const portable = `${LESSON_PATHS.SESSIONS_DIR}${identity.sessionId}/session.yaml`
      expect(await zipText(await exportLesson(target,LESSON_B),portable)).toBe(await zipText(bundle,portable))
    }
    expect(await target.read(sessionPaths({...first,lessonId:LESSON_A}).session)).toBeNull()
  })

  it("rifiuta sessioni alterate o fuori scope prima di scrivere, anche con digest aggiornati", async () => {
    const identity = {lessonId:LESSON_B,sessionId:"11111111-1111-4111-8111-111111111111"}
    await seedRoom(store,LESSON_B,2)
    await store.createSessionOnce(identity,{created:1000})
    const bundle = await exportLesson(store,LESSON_B)
    const path = `${LESSON_PATHS.SESSIONS_DIR}${identity.sessionId}/session.yaml`
    const original = parseSessionYamlV2(new Uint8Array(await (await store.read(sessionPaths(identity).session))!.arrayBuffer()))
    for (const variant of [
      {path,bytes:serializeSessionYamlV2({...original,lessonId:LESSON_A})},
      {path,bytes:serializeSessionYamlV2({...original,sessionId:"22222222-2222-4222-8222-222222222222"})},
      {path,bytes:new TextEncoder().encode("v: 2\ninvalid: true\n")},
    ]) {
      const zip = await JSZip.loadAsync(bundle)
      zip.file(variant.path,new TextDecoder().decode(variant.bytes))
      const entries = new Map<string,FileEntry>()
      for (const [entryPath,entry] of Object.entries(zip.files)) {
        if (!entry.dir && entryPath.startsWith("raw/")) entries.set(entryPath,{path:entryPath,data:await entry.async("blob"),mtime:0})
      }
      const manifest = await buildLessonBundleManifest(LESSON_B,[identity.sessionId],entries)
      zip.file(LESSON_PATHS.MANIFEST,JSON.stringify(manifest))
      const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
      await expect(importLesson(target,await zip.generateAsync({type:"blob"}),undefined,{destinationLessonId:LESSON_B})).rejects.toThrow()
      expect(await target.list()).toEqual([])
    }
    for (const invalidPath of ["raw/sessions/not-a-uuid/session.yaml",`${LESSON_PATHS.SESSIONS_DIR}${identity.sessionId}/audio/1.webm`]) {
      const zip = await JSZip.loadAsync(bundle)
      zip.file(invalidPath,"unexpected")
      const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
      await expect(importLesson(target,await zip.generateAsync({type:"blob"}))).rejects.toThrow(/path sessione non canonico/)
      expect(await target.list()).toEqual([])
    }
    // A legacy manifest cannot smuggle a workspace session path around v2's
    // namespace and overwrite a different lesson during a claimed import.
    const legacy = new JSZip()
    const foreign = {...identity,lessonId:LESSON_A}
    legacy.file(sessionPaths(foreign).session,"replacement")
    const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
    await target.createSessionOnce(foreign,{created:1234})
    const before = await (await target.read(sessionPaths(foreign).session))!.text()
    await expect(importLesson(target,await legacy.generateAsync({type:"blob"}),undefined,{
      destinationLessonId:LESSON_B,legacyClaim:{userConfirmed:true},
    })).rejects.toThrow(/path sessione workspace non portabile/)
    expect(await (await target.read(sessionPaths(foreign).session))!.text()).toBe(before)
  })

  it("legge ancora schema 1 senza inventare documenti canonici mancanti", async () => {
    await seedRoom(store,LESSON_B,2)
    const bundle = await exportLesson(store,LESSON_B)
    const zip = await JSZip.loadAsync(bundle)
    const manifest = JSON.parse((await zipText(bundle,LESSON_PATHS.MANIFEST))!)
    manifest.schemaVersion = 1
    manifest.compatibility.minimumReaderSchemaVersion = 1
    manifest.optionalArtifacts.pop()
    delete manifest.sessions
    zip.file(LESSON_PATHS.MANIFEST,JSON.stringify(manifest))
    const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
    await importLesson(target,await zip.generateAsync({type:"blob"}),undefined,{destinationLessonId:LESSON_B})
    expect((await target.list()).filter(entry=>entry.path.includes("/sessions/")).length).toBe(0)
    expect(await target.loadScene(LESSON_B)).toBe(await store.loadScene(LESSON_B))
  })

  it("ripristina B dopo eventi precedenti e intercalati di A, conservando identità e ordine", async () => {
    vi.stubGlobal("IDBKeyRange",IDBKeyRange)
    const source = new IndexedDbEventLog({factory:new IDBFactory(),dbName:"bundle-source"})
    const targetLog = new IndexedDbEventLog({factory:new IDBFactory(),dbName:"bundle-target"})
    const corruptTarget = new IndexedDbEventLog({factory:new IDBFactory(),dbName:"bundle-invalid"})
    const event = (lessonId:string,index:number) => createEventEnvelopeV2({
      lessonId,sessionId:"11111111-1111-4111-8111-111111111111",kind:"concept.introduced",
      actor:{type:"teacher",id:"test-teacher"},producer:{id:"test.bundle",version:"1.0.0",commitSha:"a".repeat(40)},
      causationId:null,idempotencyKey:`concept:${index}`,evidence:[{ref:`board:${index}`,resolution:"verified"}],
      payload:{conceptId:`concept:${index}`,labels:{it:`Concetto ${index}`}},
    },{eventId:()=>`22222222-2222-4222-8222-${String(index).padStart(12,"0")}`,now:()=>new Date(1000+index)})
    try {
      await source.open();await targetLog.open();await corruptTarget.open()
      for (const [index,lessonId] of [LESSON_A,LESSON_B,LESSON_A,LESSON_B].entries()) {
        await source.appendEnvelope(event(lessonId,index+1))
      }
      const original = await source.readEnvelopesByLesson(LESSON_B)
      expect(original.map(item=>item.seq)).toEqual([2,4])
      await seedRoom(store,LESSON_B,2)
      const bundle = await exportLesson(store,LESSON_B,source)
      const exported = (await zipText(bundle,LESSON_PATHS.LESSONOS))!
      const records = exported.trim().split("\n").map(line=>JSON.parse(line))
      expect(records.map(item=>item.seq)).toEqual([1,2])
      expect(records).toEqual(original.map((item,index)=>({...item,seq:index+1})))
      expect((await source.readEnvelopesByLesson(LESSON_B)).map(item=>item.seq)).toEqual([2,4])
      const target = new WorkspaceStore();withMockDriver(target,new MockDriver())
      expect((await importLesson(target,bundle,targetLog,{destinationLessonId:LESSON_B})).lessonOsRestore)
        .toEqual({kind:"restored",recovered:2})
      expect(await targetLog.readAllEnvelopes()).toEqual(records)
      expect(await zipText(await exportLesson(target,LESSON_B,targetLog),LESSON_PATHS.LESSONOS)).toBe(exported)
      await expect(corruptTarget.importSnapshot(new Blob([records.map((item,index)=>JSON.stringify({...item,seq:index+2})).join("\n")])))
        .rejects.toThrow(/sequenza non contigua/)
      expect(await corruptTarget.readAllEnvelopes()).toEqual([])
      const readSource = vi.spyOn(source,"readEnvelopesByLesson")
      for (const invalid of [
        [{...original[0]!,seq:0},original[1]!],
        [original[0]!,{...original[1]!,seq:original[0]!.seq}],
        [original[1]!,original[0]!],
        [{...original[0]!,seq:Number.NaN},original[1]!],
        [{...original[0]!,lessonId:LESSON_A},original[1]!],
      ]) {
        readSource.mockResolvedValue(invalid)
        await expect(exportLesson(store,LESSON_B,source)).rejects.toThrow(/invalid LessonOS export scope or sequence/)
      }
      readSource.mockRestore()
    } finally {
      await source.close();await targetLog.close();await corruptTarget.close();vi.unstubAllGlobals()
    }
  })

  it("esporta una lezione creata nell'app senza alcun session.yaml flat", async () => {
    await seedRoom(store, LESSON_A, 1)

    const bundle = await exportLesson(store, LESSON_A)

    // L'artefatto obbligatorio esiste ed è la sessione sintetizzata: consenso
    // assente significa audioConsent false, non export fallito.
    expect(await zipPaths(bundle)).toContain(LESSON_PATHS.SESSION)
    expect(await zipText(bundle, LESSON_PATHS.SESSION)).toBe(
      "v: 1\ncreated: 0\naudioConsent: false\n",
    )
  })

  it("non trasporta nel bundle di A la sessione flat scritta lavorando su B", async () => {
    await seedRoom(store, LESSON_A, 1)
    await seedRoom(store, LESSON_B, 2)
    // Percorso legacy: AudioRecorder persiste il consenso su path flat globale.
    await store.saveSessionYaml(
      `v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 500\nmarker: ${B_MARKER}\n`,
    )
    await store.write("raw/audio/chunk-0.webm", new Blob(["audio-registrato-in-B"]))

    const bundle = await exportLesson(store, LESSON_A)
    const paths = await zipPaths(bundle)

    expect(await zipText(bundle, LESSON_PATHS.SESSION)).not.toContain(B_MARKER)
    expect(paths.filter((path) => path.startsWith(LESSON_PATHS.AUDIO_DIR))).toEqual([])
  })

  it("esporta la sessione room-scoped della lezione richiesta", async () => {
    await seedRoom(store, LESSON_A, 1)
    await seedRoom(store, LESSON_B, 2)
    await store.write(
      roomPaths(LESSON_A).session,
      new Blob(["v: 1\ncreated: 111\naudioConsent: false\nmarker: SESSIONE-DELLA-LEZIONE-A\n"]),
    )
    await store.write(
      roomPaths(LESSON_B).session,
      new Blob([`v: 1\ncreated: 222\naudioConsent: false\nmarker: ${B_MARKER}\n`]),
    )

    const sessionInA = await zipText(await exportLesson(store, LESSON_A), LESSON_PATHS.SESSION)

    expect(sessionInA).toContain("SESSIONE-DELLA-LEZIONE-A")
    expect(sessionInA).not.toContain(B_MARKER)
  })

  it("esporta soltanto i chunk audio della lezione richiesta quando il consenso è ON", async () => {
    await seedRoom(store, LESSON_A, 1)
    await seedRoom(store, LESSON_B, 2)
    await store.write(
      roomPaths(LESSON_A).session,
      new Blob(["v: 1\ncreated: 111\naudioConsent: true\naudioStartEpoch: 5\n"]),
    )
    await store.write(`${roomPaths(LESSON_A).audioDir}chunk-0.webm`, new Blob(["audio-A"]))
    await store.write(`${roomPaths(LESSON_B).audioDir}chunk-0.webm`, new Blob(["audio-B"]))

    const bundle = await exportLesson(store, LESSON_A)

    // Il path nello ZIP resta portabile (flat), il contenuto è quello di A.
    expect((await zipPaths(bundle)).filter((path) => path.startsWith(LESSON_PATHS.AUDIO_DIR)))
      .toEqual([`${LESSON_PATHS.AUDIO_DIR}chunk-0.webm`])
    expect(await zipText(bundle, `${LESSON_PATHS.AUDIO_DIR}chunk-0.webm`)).toBe("audio-A")
  })

  it("l'import fa atterrare sessione e audio sotto la lezione di destinazione", async () => {
    await seedRoom(store, LESSON_A, 1)
    await store.write(
      roomPaths(LESSON_A).session,
      new Blob(["v: 1\ncreated: 111\naudioConsent: true\naudioStartEpoch: 5\n"]),
    )
    await store.write(`${roomPaths(LESSON_A).audioDir}chunk-0.webm`, new Blob(["audio-A"]))
    const bundle = await exportLesson(store, LESSON_A)

    const target = new WorkspaceStore()
    withMockDriver(target, new MockDriver())
    await importLesson(target, bundle, null, { destinationLessonId: LESSON_A })

    expect(await (await target.read(roomPaths(LESSON_A).session))!.text())
      .toContain("audioConsent: true")
    expect(await (await target.read(`${roomPaths(LESSON_A).audioDir}chunk-0.webm`))!.text())
      .toBe("audio-A")
    // Nessun residuo sui path flat globali.
    expect(await target.read(LESSON_PATHS.SESSION)).toBeNull()
    expect(await target.read(`${LESSON_PATHS.AUDIO_DIR}chunk-0.webm`)).toBeNull()
  })
})
