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
import { describe, it, expect, beforeEach } from "vitest"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { WorkspaceDriver, FileEntry } from "../store/types"
import { exportLesson, importLesson, LESSON_PATHS } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"

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
