// @vitest-environment jsdom
// MAESTRO-Studio — Test AudioRecorder
// Verifica: default OFF (nessun chunk), ON produce chunk con marker allineati al clock,
// chunk da 30s produce timestamps corretti, session.yaml persistito su toggle.
//
// MediaRecorder non esiste in jsdom — mocking completo via factory iniettabile.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { AudioRecorder, parseSessionYaml, serializeSessionYaml } from "../store/AudioRecorder"
import { roomPaths } from "../store/roomPaths"
import type { WorkspaceDriver, FileEntry } from "../store/types"

// --- Mock driver (stesso pattern di JournalRecorder.test.ts) ---

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
  private store = new Map<string, ArrayBuffer>()

  available(): boolean { return true }
  async init(): Promise<boolean> { return true }

  async read(path: string): Promise<Blob | null> {
    const raw = this.store.get(path)
    if (!raw) return null
    return new Blob([raw])
  }

  async write(path: string, data: Blob): Promise<void> {
    this.store.set(path, await data.arrayBuffer())
  }

  async delete(path: string): Promise<void> {
    this.store.delete(path)
  }

  async list(prefix?: string): Promise<FileEntry[]> {
    const entries: FileEntry[] = []
    for (const [path, buf] of this.store) {
      if (prefix && !path.startsWith(prefix)) continue
      entries.push({ path, data: new Blob([buf]), mtime: Date.now() })
    }
    return entries
  }

  getLegacyScene(_room: string): string | null { return null }
  setLegacyScene(_room: string, _data: string): void {}
}

function withMockDriver(store: WorkspaceStore, mock: MockDriver) {
  ;(store as any).driver = mock
  ;(store as any).fallback = mock
}

// --- Mock MediaStream ---

function createMockStream(): MediaStream {
  return {
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream
}

// --- Clock deterministico (stesso pattern dei test JournalRecorder) ---

function makeClock() {
  let tick = 10000  // start da un epoch realistico
  return () => {
    const t = tick
    tick += 100
    return t
  }
}

// --- Helper: crea mock MediaRecorder ---

interface MockMediaRecorder {
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  state: "inactive" | "recording" | "paused"
  ondataavailable: ((event: { data: Blob }) => void) | null
  onstop: (() => void) | null
  onerror: (() => void) | null
}

function createMockMediaRecorderFactory(): {
  factory: (stream: MediaStream) => MediaRecorder
  instances: MockMediaRecorder[]
  /** Emette un chunk finto */
  emitChunk: (instanceIndex?: number) => void
  /** Emette stop */
  emitStop: (instanceIndex?: number) => void
} {
  const instances: MockMediaRecorder[] = []

  const factory = (): MediaRecorder => {
    const mr: MockMediaRecorder = {
      start: vi.fn((_timeslice?: number) => {
        mr.state = "recording"
      }),
      stop: vi.fn(() => {
        mr.state = "inactive"
        mr.onstop?.()
      }),
      state: "inactive",
      ondataavailable: null,
      onstop: null,
      onerror: null,
    }
    instances.push(mr)
    return mr as unknown as MediaRecorder
  }

  function emitChunk(instanceIndex: number = 0) {
    const mr = instances[instanceIndex]
    if (mr && mr.ondataavailable) {
      mr.ondataavailable({ data: new Blob(["fake-audio-data"], { type: "audio/webm" }) })
    }
  }

  function emitStop(instanceIndex: number = 0) {
    const mr = instances[instanceIndex]
    if (mr) {
      mr.state = "inactive"
      mr.onstop?.()
    }
  }

  return { factory, instances, emitChunk, emitStop }
}

// --- Tests ---

const TEST_PATHS = roomPaths("audio-test-room")

describe("AudioRecorder", () => {
  let store: WorkspaceStore
  let mock: MockDriver
  let clock: () => number
  let recorder: AudioRecorder
  let chunks: Array<{ chunkIndex: number; startEpoch: number; endEpoch: number }>
  let mrHelper: ReturnType<typeof createMockMediaRecorderFactory>

  beforeEach(() => {
    store = new WorkspaceStore()
    mock = new MockDriver()
    withMockDriver(store, mock)
    clock = makeClock()
    chunks = []
    mrHelper = createMockMediaRecorderFactory()

    // Stub getUserMedia (jsdom non lo fornisce)
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(createMockStream()),
      },
    })

    recorder = new AudioRecorder({
      store,
      sessionPath: TEST_PATHS.session,
      audioDir: TEST_PATHS.audioDir,
      clock,
      onChunk: (chunkIndex, startEpoch, endEpoch) => {
        chunks.push({ chunkIndex, startEpoch, endEpoch })
      },
      createMediaRecorder: mrHelper.factory,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // --- TEST 1: Default OFF === nessuna registrazione ---

  it("default consent è false (GDPR — nessuna registrazione nascosta)", () => {
    expect(recorder.consent).toBe(false)
    expect(recorder.recording).toBe(false)
    expect(recorder.startEpoch).toBeNull()
  })

  it("isola consenso, chunk e revoca GDPR tra due stanze", async () => {
    const pathsA = roomPaths("room-a")
    const pathsB = roomPaths("room-b")
    const mediaA = createMockMediaRecorderFactory()
    const mediaB = createMockMediaRecorderFactory()
    const recorderA = new AudioRecorder({
      store,
      sessionPath: pathsA.session,
      audioDir: pathsA.audioDir,
      clock: makeClock(),
      createMediaRecorder: mediaA.factory,
    })
    const recorderB = new AudioRecorder({
      store,
      sessionPath: pathsB.session,
      audioDir: pathsB.audioDir,
      clock: makeClock(),
      createMediaRecorder: mediaB.factory,
    })

    recorderA.consent = true
    recorderB.consent = true
    await recorderA.start()
    await recorderB.start()
    mediaA.emitChunk()
    mediaB.emitChunk()

    await vi.waitFor(async () => {
      expect(await store.read(pathsA.session)).not.toBeNull()
      expect(await store.read(pathsB.session)).not.toBeNull()
      expect(await store.list(pathsA.audioDir)).toHaveLength(1)
      expect(await store.list(pathsB.audioDir)).toHaveLength(1)
    }, { timeout: 500, interval: 10 })

    recorderA.consent = false
    await recorderA.lastRevoke

    expect(await store.list(pathsA.audioDir)).toHaveLength(0)
    expect(await store.list(pathsB.audioDir)).toHaveLength(1)
    await vi.waitFor(async () => {
      expect(await (await store.read(pathsA.session))!.text()).toContain("audioConsent: false")
      expect(await (await store.read(pathsB.session))!.text()).toContain("audioConsent: true")
    }, { timeout: 500, interval: 10 })
  })

  it("rifiuta percorsi flat, ostili o di stanze diverse prima di accedere allo store", () => {
    const read = vi.spyOn(store, "read")
    const write = vi.spyOn(store, "write")
    const list = vi.spyOn(store, "list")
    const validA = roomPaths("room-a")
    const validB = roomPaths("room-b")
    const construct = (sessionPath: string, audioDir: string) => () => new AudioRecorder({
      store,
      sessionPath,
      audioDir,
      clock: makeClock(),
      createMediaRecorder: createMockMediaRecorderFactory().factory,
    })

    expect(construct("raw/session.yaml", "raw/audio/")).toThrow()
    expect(construct(validA.session, validB.audioDir)).toThrow()
    expect(construct("raw/../session.yaml", "raw/../audio/")).toThrow()
    expect(read).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
    expect(list).not.toHaveBeenCalled()
  })

  // --- TEST 2: Consenso OFF → nessun chunk scritto su store ---

  it("consent OFF, start() non fa nulla e non scrive chunk", async () => {
    await recorder.start()
    expect(recorder.recording).toBe(false)
    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries).toHaveLength(0)
  })

  // --- TEST 3: Consenso ON → session.yaml contiene audioConsent + audioStartEpoch ---

  it("consent ON persiste session.yaml con audioConsent e audioStartEpoch", async () => {
    recorder.consent = true
    await vi.waitFor(async () => {
      const blob = await store.read(TEST_PATHS.session)
      expect(blob).not.toBeNull()
    })
    const blob = await store.read(TEST_PATHS.session)
    expect(blob).not.toBeNull()
    const text = await blob!.text()
    expect(text).toContain("audioConsent: true")
    expect(text).toContain("audioStartEpoch: 10000") // primo tick del clock deterministico
  })

  // --- TEST 4: Consenso ON → chunk con marker allineati al clock ---

  it("consent ON, chunk emesso produce marker con timestamps dal clock", async () => {
    recorder.consent = true
    await recorder.start()

    // Simula un chunk (30s)
    mrHelper.emitChunk(0)

    await vi.waitFor(() => {
      expect(chunks).toHaveLength(1)
    }, { timeout: 500, interval: 10 })
    expect(chunks[0].chunkIndex).toBe(0)
    // clock parte da 10000, ogni chiamata +100
    // al set consent: clock() = 10000 (startEpoch, chunkStartEpoch)
    // al emitChunk: clock() = 10100 (endEpoch)
    expect(chunks[0].startEpoch).toBe(10000)
    expect(chunks[0].endEpoch).toBeGreaterThan(chunks[0].startEpoch)
    expect(chunks[0].endEpoch).toBeLessThanOrEqual(10200)

    // Chunk scritto su store (async — attendi)
    await vi.waitFor(async () => {
      const entries = await store.list(TEST_PATHS.audioDir)
      expect(entries).toHaveLength(1)
    }, { timeout: 500, interval: 10 })
    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries[0].path).toBe(`${TEST_PATHS.audioDir}chunk-0.webm`)
  })

  // --- TEST 5: Multipli chunk producono timestamps progressivi ---

  it("3 chunk consecutivi producono chunk-0, chunk-1, chunk-2 con indici progressivi", async () => {
    recorder.consent = true
    await recorder.start()

    mrHelper.emitChunk(0) // chunk-0
    mrHelper.emitChunk(0) // chunk-1
    mrHelper.emitChunk(0) // chunk-2

    await vi.waitFor(() => {
      expect(chunks).toHaveLength(3)
    }, { timeout: 500, interval: 10 })
    expect(chunks[0].chunkIndex).toBe(0)
    expect(chunks[1].chunkIndex).toBe(1)
    expect(chunks[2].chunkIndex).toBe(2)

    await vi.waitFor(async () => {
      const entries = await store.list(TEST_PATHS.audioDir)
      expect(entries).toHaveLength(3)
    }, { timeout: 500, interval: 10 })
    const entries = await store.list(TEST_PATHS.audioDir)
    const paths = entries.map((e) => e.path).sort()
    expect(paths).toEqual([
      `${TEST_PATHS.audioDir}chunk-0.webm`,
      `${TEST_PATHS.audioDir}chunk-1.webm`,
      `${TEST_PATHS.audioDir}chunk-2.webm`,
    ])
  })

  // --- TEST 6: stop() rilascia stream e resetta stato ---

  it("stop() ferma registrazione e non emette piu chunk", async () => {
    recorder.consent = true
    await recorder.start()

    mrHelper.emitChunk(0)
    await recorder.stop()

    expect(recorder.recording).toBe(false)
    const l1 = chunks.length

    // Tentativo di emettere chunk dopo stop — deve essere ignorato
    mrHelper.emitChunk(0)
    expect(chunks).toHaveLength(l1)
  })

  // --- TEST 7: dispose() rilascia risorse su unmount ---

  it("dispose() ferma registrazione se attiva", async () => {
    recorder.consent = true
    await recorder.start()

    mrHelper.emitChunk(0)
    expect(recorder.recording).toBe(true)

    recorder.dispose()
    // stop() ora ha await _pendingChunkWrites — attendi microtask
    await new Promise((r) => setTimeout(r, 0))
    expect(recorder.consent).toBe(false)
    expect(recorder.recording).toBe(false)
  })

  // --- TEST 8: Toggle OFF → OFF ferma registrazione ---

  it("toggle da ON a OFF ferma registrazione", async () => {
    recorder.consent = true
    await recorder.start()
    expect(recorder.recording).toBe(true)

    recorder.consent = false
    // stop() ora ha await _pendingChunkWrites — attendi microtask
    await new Promise((r) => setTimeout(r, 0))
    expect(recorder.recording).toBe(false)
  })

  // --- T2b punto 1: revoca consenso = CANCELLAZIONE dei chunk (GDPR-delete) ---

  it("revoca consenso CANCELLA tutti i chunk audio dallo store (GDPR-delete)", async () => {
    recorder.consent = true
    await recorder.start()

    mrHelper.emitChunk(0)
    mrHelper.emitChunk(0)
    await vi.waitFor(async () => {
      const entries = await store.list(TEST_PATHS.audioDir)
      expect(entries).toHaveLength(2)
    }, { timeout: 500, interval: 10 })

    // Revoca: i dati NON devono più esistere (il filtro in export non basta)
    recorder.consent = false
    await recorder.lastRevoke

    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries).toHaveLength(0)

    // E la revoca è persistita in session.yaml
    await vi.waitFor(async () => {
      const blob = await store.read(TEST_PATHS.session)
      expect(blob).not.toBeNull()
      expect(await blob!.text()).toContain("audioConsent: false")
    }, { timeout: 500, interval: 10 })
  })

  it("chunk tardivo dopo la revoca NON viene scritto né marcato (nessun dato post-revoca)", async () => {
    recorder.consent = true
    await recorder.start()

    recorder.consent = false
    await recorder.lastRevoke

    // dataavailable tardivo (MediaRecorder.stop() emette il chunk parziale finale)
    mrHelper.emitChunk(0)
    await new Promise((r) => setTimeout(r, 20))

    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries).toHaveLength(0)
    expect(chunks).toHaveLength(0)
  })

  // --- T2b punto 2a: onerror rilascia il MediaStream (HERMES-0816) ---

  it("onerror rilascia il MediaStream: il microfono si spegne anche su errore", async () => {
    const trackStop = vi.fn()
    vi.stubGlobal("navigator", {
      ...navigator,
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: trackStop }],
        } as unknown as MediaStream),
      },
    })

    recorder.consent = true
    await recorder.start()
    expect(recorder.recording).toBe(true)

    mrHelper.instances[0].onerror?.()

    expect(recorder.recording).toBe(false)
    expect(trackStop).toHaveBeenCalled()
  })

  // --- T2b punto 2b: chunk su store PRIMA del marker journal (HERMES-0816) ---

  it("marker journal emesso solo DOPO che la write del chunk è riuscita", async () => {
    recorder.consent = true
    await recorder.start()

    let resolveWrite: () => void = () => {}
    const writeSpy = vi.spyOn(store, "write").mockImplementationOnce(
      () => new Promise<void>((resolve) => { resolveWrite = resolve })
    )

    mrHelper.emitChunk(0)
    await vi.waitFor(() => {
      expect(writeSpy).toHaveBeenCalledWith(`${TEST_PATHS.audioDir}chunk-0.webm`, expect.any(Blob))
    }, { timeout: 500, interval: 10 })

    // Write in sospeso ⇒ il marker NON deve ancora esistere
    expect(chunks).toHaveLength(0)

    resolveWrite()
    await vi.waitFor(() => {
      expect(chunks).toHaveLength(1)
    }, { timeout: 500, interval: 10 })
  })

  it("write del chunk fallita ⇒ NESSUN marker journal (niente marker orfani)", async () => {
    recorder.consent = true
    await recorder.start()

    const writeSpy = vi.spyOn(store, "write").mockRejectedValueOnce(new Error("disk full"))

    mrHelper.emitChunk(0)
    await vi.waitFor(() => {
      expect(writeSpy).toHaveBeenCalled()
    }, { timeout: 500, interval: 10 })
    await new Promise((r) => setTimeout(r, 20))

    expect(chunks).toHaveLength(0)
    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries).toHaveLength(0)
  })

  it("double-stop non lancia eccezioni", async () => {
    recorder.consent = true
    await recorder.start()

    await recorder.stop()
    await expect(recorder.stop()).resolves.toBeUndefined()
    expect(recorder.recording).toBe(false)
  })

  // --- T2c punto 1: purge fallisce → lastRevoke RIGETTA (non più silenzio) ---

  it("purgeAudioChunks fallita → lastRevoke rigetta con errore visibile", async () => {
    recorder.consent = true
    await recorder.start()

    mrHelper.emitChunk(0)
    await vi.waitFor(async () => {
      const entries = await store.list(TEST_PATHS.audioDir)
      expect(entries).toHaveLength(1)
    }, { timeout: 500, interval: 10 })

    // Mock store.delete per fallire — purge non riesce a cancellare il chunk
    const deleteMock = vi.spyOn(store, "delete").mockRejectedValue(
      new Error("file locked by OS")
    )

    recorder.consent = false

    // lastRevoke deve RIGETTARE con l'errore della purge (non silenziarlo)
    await expect(recorder.lastRevoke).rejects.toThrow("file locked by OS")

    deleteMock.mockRestore()
  })

  // --- T2c punto 2: chunk in volo (write delay) NON sopravvive alla revoca ---

  it("chunk in volo durante la revoca non sopravvive: store.list(audio) vuoto a fine corsa", async () => {
    recorder.consent = true
    await recorder.start()

    // Defer della write del chunk — handleChunk parte ma store.write è in sospeso
    let resolveWrite: () => void = () => {}
    const writeSpy = vi.spyOn(store, "write").mockImplementationOnce(
      () => new Promise<void>((resolve) => { resolveWrite = resolve })
    )

    mrHelper.emitChunk(0)

    // Attendi che handleChunk abbia chiamato store.write (ora in sospeso)
    await vi.waitFor(() => {
      expect(writeSpy).toHaveBeenCalledWith(
        `${TEST_PATHS.audioDir}chunk-0.webm`,
        expect.any(Blob)
      )
    }, { timeout: 500, interval: 10 })

    // Il chunk è in volo — la write non è ancora atterrata
    // FLIP consenso OFF: stop() attende _pendingChunkWrites (che include questa write)
    recorder.consent = false

    // Risolvi la write in sospeso — ora il chunk atterra, poi purge lo cancella
    resolveWrite()

    // lastRevoke deve risolversi senza errori (purge ha cancellato il chunk atterrato)
    await expect(recorder.lastRevoke).resolves.toBeUndefined()

    // Verifica finale: nessun chunk sopravvissuto
    const entries = await store.list(TEST_PATHS.audioDir)
    expect(entries).toHaveLength(0)
  })
})

// --- Tests per i parser YAML ---

describe("parseSessionYaml / serializeSessionYaml", () => {
  it("serializeSessionYaml produce output YAML valido", () => {
    const yaml = serializeSessionYaml({
      v: 1,
      created: 1000,
      audioConsent: true,
      audioStartEpoch: 5000,
    })
    expect(yaml).toContain("v: 1")
    expect(yaml).toContain("created: 1000")
    expect(yaml).toContain("audioConsent: true")
    expect(yaml).toContain("audioStartEpoch: 5000")
  })

  it("parseSessionYaml legge campi audio", () => {
    const yaml = "v: 1\ncreated: 1000\naudioConsent: true\naudioStartEpoch: 5000\n"
    const parsed = parseSessionYaml(yaml)
    expect(parsed.v).toBe(1)
    expect(parsed.created).toBe(1000)
    expect(parsed.audioConsent).toBe(true)
    expect(parsed.audioStartEpoch).toBe(5000)
  })

  it("parseSessionYaml gestisce audioConsent: false", () => {
    const yaml = "v: 1\ncreated: 1000\naudioConsent: false\n"
    const parsed = parseSessionYaml(yaml)
    expect(parsed.audioConsent).toBe(false)
  })

  it("parseSessionYaml gestisce YAML senza campi audio", () => {
    const yaml = "v: 1\ncreated: 1000\n"
    const parsed = parseSessionYaml(yaml)
    expect(parsed.audioConsent).toBeUndefined()
    expect(parsed.audioStartEpoch).toBeUndefined()
  })

  it("roundtrip serialize→parse è idempotente", () => {
    const input = { v: 1, created: 12345, audioConsent: true, audioStartEpoch: 5000 }
    const yaml = serializeSessionYaml(input)
    const parsed = parseSessionYaml(yaml)
    expect(parsed.v).toBe(1)
    expect(parsed.created).toBe(12345)
    expect(parsed.audioConsent).toBe(true)
    expect(parsed.audioStartEpoch).toBe(5000)
  })
})
