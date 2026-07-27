// @vitest-environment jsdom
//
// SERVICE BROKER `service.simulation` — un Pack/plugin disciplinare (ELABTutor)
// deve poter USARE il Simulation Plugin senza importarne il codice: la sola via
// legittima è una chiamata host-mediated sul wire ToolHost, capability-gated.
//
// Perché una capability `service.*` e non `simulation.*`: il vocabolario attuale
// (board/graph/lesson/storage/ui) è fatto di FACOLTÀ DEL CORE. Simulation è il
// servizio di un plugin: metterlo nel vocabolario del Core sarebbe il
// "first-party bypass". Il prefisso apre una famiglia; il secondo servizio sarà
// additivo, non una riscrittura.
//
// Perché metodi espliciti e non un broker generico `service.call(payload)`: la
// proprietà più forte di questo protocollo è che ogni params passa da uno
// strictObject validato lato host. Un envelope opaco la distruggerebbe.
//
// SDK 1.4 aggiunge `simulation.applyOperation` con falsificatori dedicati nella
// verticale Sessione 2. Qui resta congelato il ciclo precedente
// load → solve → read → serialize e la sua compatibilità.
import { afterEach, describe, expect, it } from "vitest"
import { ERR, PROTOCOL_VERSION, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolHost } from "../toolhost/host.ts"
import { assertGrantWithinManifest } from "../toolhost/policy.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { SimulationRuntimeApiLike } from "../toolhost/caps/simulation.ts"
import {
  SIMULATION_RUNTIME_API_VERSION,
  SIMULATION_RUNTIME_PLUGIN_ID,
  SIMULATION_RUNTIME_STATE_SCHEMA,
  describeSimulationRuntimeApi,
  loadSimulationRuntimeScene,
  readSimulationRuntimeDiagnostics,
  serializeSimulationRuntimeState,
  solveSimulationRuntimeProvider,
} from "../../sim/core/simulationRuntime.ts"
import type {
  SimulationRuntimeProviderRequest,
  SimulationRuntimeState,
} from "../../sim/core/simulationRuntime.ts"
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest.ts"

/**
 * Composition root del test: lega il servizio REALE `simulation-runtime/1`.
 * Nessun mock del soggetto sotto prova — se il broker funziona qui, funziona
 * contro il motore vero. È anche la prova che l'host NON importa `sim/`: senza
 * questa iniezione esplicita nessun metodo esiste.
 */
const realSimulationService: SimulationRuntimeApiLike = {
  describe: () => describeSimulationRuntimeApi(),
  sceneDigest: (scene) => simulationSceneDigest(scene),
  loadScene: (input) => loadSimulationRuntimeScene(input),
  solve: (state, request) => {
    const solved = solveSimulationRuntimeProvider(
      state as SimulationRuntimeState,
      request as SimulationRuntimeProviderRequest,
    )
    return { state: solved.state, result: solved.result }
  },
  readDiagnostics: (state) => readSimulationRuntimeDiagnostics(state as SimulationRuntimeState),
  serializeState: (state) => serializeSimulationRuntimeState(state as SimulationRuntimeState),
}

// ---------- fixture: la scena LED+resistenza del manuale, ridotta al minimo ----------

const LED_SCENE = {
  components: [
    { id: "bat1", type: "battery", value: 5 },
    { id: "r1", type: "resistor", value: 220 },
    { id: "led1", type: "led" },
  ],
  connections: [
    { from: "bat1:+", to: "r1:a" },
    { from: "r1:b", to: "led1:anode" },
    { from: "led1:cathode", to: "bat1:-" },
  ],
} as const

const SCENE_DIGEST = simulationSceneDigest(LED_SCENE)
const malformedRuntimeScenes: Array<[
  name: string,
  mutate: (scene: Record<string, unknown>) => void,
]> = [
  ["empty component id", (scene) => {
    scene.components = [{ id: "", type: "battery", value: 5 }]
  }],
  ["wrong component value", (scene) => {
    scene.components = [{ id: "bat1", type: "battery", value: "5" }]
  }],
  ["wrong connection id", (scene) => {
    scene.connections = [{ id: 7, from: "bat1:+", to: "bat1:-" }]
  }],
  ["unsupported connection kind", (scene) => {
    scene.connections = [{ from: "bat1:+", to: "bat1:-", kind: "bus" }]
  }],
  ["too many components", (scene) => {
    scene.components = Array.from(
      { length: 501 },
      (_, index) => ({ id: `component-${index}`, type: "resistor" }),
    )
  }],
  ["too many connections", (scene) => {
    scene.connections = Array.from(
      { length: 2001 },
      (_, index) => ({
        id: `connection-${index}`,
        from: "bat1:+",
        to: "bat1:-",
      }),
    )
  }],
  ["non-string pin assignment", (scene) => {
    scene.pinAssignments = { "bat1:+": 7 }
  }],
]

// ---------- doppi minimi (nessun mock del soggetto sotto test) ----------

class MemoryWorkspace implements StorageDriverLike, AuditStore {
  files = new Map<string, Blob>()
  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }
  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, data)
  }
  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

const board: BoardApiLike = {
  getSceneElements: (): readonly BoardElementLike[] => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

/** Manifest di un Pack disciplinare eseguibile: UNA sola capability, quella del servizio. */
function elabTutorManifest(capabilities: Record<string, unknown>): ToolManifest {
  return ToolManifestSchema.parse({
    manifestVersion: 1,
    id: "io.elab.tutor",
    name: "ELABTutor",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "dist/index.html",
    surfaces: ["panel"],
    capabilities,
    publisher: { id: "elab", pubkey: "ed25519:AAAA" },
    privacy: { dataOut: "none" },
  })
}

const SERVICE_CAP = { "service.simulation": { apiVersion: SIMULATION_RUNTIME_API_VERSION } }

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

interface WireError {
  code: number
  message: string
}

/** Lato tool: porta viva dopo handshake reale, più un `call` JSON-RPC. */
async function mountReady(host: ToolHost): Promise<{
  call: (method: string, params?: unknown) => Promise<{ result?: unknown; error?: WireError }>
  port: MessagePort
}> {
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  ch.port2.start()
  const ready = new Promise<void>((resolve) => {
    const onReady = (ev: MessageEvent): void => {
      const data = ev.data as { id?: unknown; result?: unknown }
      if (data.id === 1) {
        ch.port2.removeEventListener("message", onReady)
        resolve()
      }
    }
    ch.port2.addEventListener("message", onReady)
  })
  ch.port2.postMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "tool.ready",
    params: { protocolVersion: PROTOCOL_VERSION, nonce: session.nonce },
  })
  await ready

  let nextId = 2
  const call = (method: string, params: unknown = {}) =>
    new Promise<{ result?: unknown; error?: WireError }>((resolve) => {
      const id = nextId++
      const onMessage = (ev: MessageEvent): void => {
        const data = ev.data as { id?: unknown; result?: unknown; error?: WireError }
        if (data.id !== id) return
        ch.port2.removeEventListener("message", onMessage)
        resolve({ result: data.result, error: data.error })
      }
      ch.port2.addEventListener("message", onMessage)
      ch.port2.postMessage({ jsonrpc: "2.0", id, method, params })
    })

  return { call, port: ch.port2 }
}

/** Host con il servizio Simulation cablato e un'identità di istanza HOST-side. */
function hostWithSimulation(instanceId: string, grant: Capabilities = SERVICE_CAP): ToolHost {
  return new ToolHost(elabTutorManifest(SERVICE_CAP), grant, {
    store: new MemoryWorkspace(),
    board,
    instanceId,
    roomId: "broker-room",
    simulation: realSimulationService,
  })
}

// ---------------------------------------------------------------------------
// RED-1 — il canale di discovery non esiste ancora
// ---------------------------------------------------------------------------
describe("service.simulation — discovery", () => {
  it("RED-1: simulation.describe pubblica il contratto simulation-runtime/1 sul wire", async () => {
    const { call } = await mountReady(hostWithSimulation("elab-1"))

    const { result, error } = await call("simulation.describe")

    expect(error).toBeUndefined()
    expect(result).toMatchObject({
      pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
      apiVersion: SIMULATION_RUNTIME_API_VERSION,
      stateSchema: SIMULATION_RUNTIME_STATE_SCHEMA,
    })
  })
})

// ---------------------------------------------------------------------------
// RED-2 — LA prova della slice: composizione senza import diretto
// ---------------------------------------------------------------------------
describe("service.simulation — composizione ELABTutor→Simulation host-mediated", () => {
  it("RED-2: load → solve → read → serialize, con receipt che lega istanza e digest scena", async () => {
    const { call } = await mountReady(hostWithSimulation("elab-1"))

    const load = await call("simulation.loadScene", { scene: LED_SCENE })
    expect(load.error).toBeUndefined()
    expect(load.result).toMatchObject({
      receipt: {
        apiVersion: SIMULATION_RUNTIME_API_VERSION,
        pluginId: SIMULATION_RUNTIME_PLUGIN_ID,
        instanceId: "elab-1",
        sceneDigest: SCENE_DIGEST,
      },
    })

    const solved = await call("simulation.solve", { provider: "local", mode: "static" })
    expect(solved.error).toBeUndefined()
    expect(solved.result).toMatchObject({ receipt: { instanceId: "elab-1", sceneDigest: SCENE_DIGEST } })
    expect((solved.result as { result?: unknown }).result).toBeDefined()

    const diagnostics = await call("simulation.readDiagnostics")
    expect(diagnostics.error).toBeUndefined()
    expect((diagnostics.result as { diagnostics?: { instanceId?: string } }).diagnostics?.instanceId).toBe("elab-1")

    const serialized = await call("simulation.serializeState")
    expect(serialized.error).toBeUndefined()
    expect((serialized.result as { state?: { schema?: string } }).state?.schema).toBe(
      SIMULATION_RUNTIME_STATE_SCHEMA,
    )
  })

  it("RED-2b: solve senza loadScene → errore esplicito, mai una scena vuota implicita", async () => {
    const { call } = await mountReady(hostWithSimulation("elab-1"))

    const { result, error } = await call("simulation.solve", { provider: "local", mode: "static" })

    expect(result).toBeUndefined()
    expect(error?.code).toBe(ERR.INTERNAL)
    expect(error?.message).toMatch(/no scene loaded/i)
  })

  it("RED-2c: ogni richiesta stateful senza room host-owned fallisce chiusa", async () => {
    let runtimeCalls = 0
    const roomlessSimulation: SimulationRuntimeApiLike = {
      describe: () => {
        runtimeCalls += 1
        return describeSimulationRuntimeApi()
      },
      sceneDigest: (scene) => {
        runtimeCalls += 1
        return simulationSceneDigest(scene)
      },
      loadScene: (input) => {
        runtimeCalls += 1
        return loadSimulationRuntimeScene(input)
      },
      applyOperation: () => {
        runtimeCalls += 1
        throw new Error("room gate did not run before applyOperation")
      },
      solve: (state, request) => {
        runtimeCalls += 1
        const solved = solveSimulationRuntimeProvider(
          state as SimulationRuntimeState,
          request as SimulationRuntimeProviderRequest,
        )
        return { state: solved.state, result: solved.result }
      },
      readDiagnostics: (state) => {
        runtimeCalls += 1
        return readSimulationRuntimeDiagnostics(state as SimulationRuntimeState)
      },
      serializeState: (state) => {
        runtimeCalls += 1
        return serializeSimulationRuntimeState(state as SimulationRuntimeState)
      },
    }
    const host = new ToolHost(
      elabTutorManifest(SERVICE_CAP),
      SERVICE_CAP as Capabilities,
      {
        store: new MemoryWorkspace(),
        board,
        instanceId: "elab-1",
        simulation: roomlessSimulation,
      },
    )
    const { call } = await mountReady(host)

    const described = await call("simulation.describe")
    expect(described.error).toBeUndefined()
    expect(runtimeCalls).toBe(1)

    const statefulCalls: Array<[string, unknown]> = [
      ["simulation.loadScene", { scene: LED_SCENE }],
      ["simulation.applyOperation", {
        expectedSceneDigest: SCENE_DIGEST,
        operation: {
          schema: "simulation-operation/1",
          id: "roomless-connect-wire",
          actor: "manual",
          origin: "canvas",
          targetProvider: "local",
          providerMode: "static",
          operation: {
            kind: "connect-wire",
            wire: {
              id: "roomless-wire",
              from: "bat1:+",
              to: "bat1:-",
              color: "red",
            },
          },
        },
      }],
      ["simulation.solve", { provider: "local", mode: "static" }],
      ["simulation.readDiagnostics", {}],
      ["simulation.serializeState", {}],
    ]
    for (const [method, params] of statefulCalls) {
      const response = await call(method, params)
      expect(response.result, method).toBeUndefined()
      expect(response.error?.code, method).toBe(ERR.INTERNAL)
      expect(response.error?.message, method).toBe(
        'simulation state access requires a host-owned roomId for instance "elab-1"',
      )
    }
    expect(runtimeCalls).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// RED-3 — isolamento per istanza
// ---------------------------------------------------------------------------
describe("service.simulation — isolamento", () => {
  it("RED-3: due istanze non condividono la scena", async () => {
    const a = await mountReady(hostWithSimulation("elab-a"))
    const b = await mountReady(hostWithSimulation("elab-b"))

    await a.call("simulation.loadScene", { scene: LED_SCENE })

    const solvedB = await b.call("simulation.solve", { provider: "local", mode: "static" })
    expect(solvedB.error?.code).toBe(ERR.INTERNAL)
    expect(solvedB.error?.message).toMatch(/no scene loaded/i)

    const serializedA = await a.call("simulation.serializeState")
    expect((serializedA.result as { state?: { instanceId?: string } }).state?.instanceId).toBe("elab-a")
  })
})

// ---------------------------------------------------------------------------
// RED-4 — l'identità di istanza NON esiste sul wire
// ---------------------------------------------------------------------------
describe("service.simulation — chi possiede l'instanceId", () => {
  it("RED-4: un instanceId nei params è rifiutato dallo schema, mai usato come override", async () => {
    const { call } = await mountReady(hostWithSimulation("elab-a"))

    const { result, error } = await call("simulation.loadScene", {
      scene: LED_SCENE,
      instanceId: "elab-vittima",
    })

    expect(result).toBeUndefined()
    expect(error?.code).toBe(ERR.INVALID_PARAMS)
  })
})

// ---------------------------------------------------------------------------
// RED-5 / RED-6 / RED-7 — gating fail-closed
// ---------------------------------------------------------------------------
describe("service.simulation — gating fail-closed", () => {
  const METHODS = [
    "simulation.describe",
    "simulation.loadScene",
    "simulation.solve",
    "simulation.readDiagnostics",
    "simulation.serializeState",
  ] as const

  it("RED-5: senza la capability concessa, tutti i metodi rispondono CAPABILITY_DENIED", async () => {
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), {}, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
      roomId: "broker-room",
      simulation: realSimulationService,
    })
    const { call } = await mountReady(host)

    for (const method of METHODS) {
      const { result, error } = await call(method, {})
      expect(result, `${method} non deve rispondere`).toBeUndefined()
      expect(error?.code, `${method} deve negare`).toBe(ERR.CAPABILITY_DENIED)
    }
  })

  it("RED-6: un grant che eccede il manifest è rifiutato alla radice", () => {
    const manifestSenzaServizio = elabTutorManifest({ "board.read": {} })

    expect(() =>
      assertGrantWithinManifest(manifestSenzaServizio, SERVICE_CAP as Capabilities),
    ).toThrow()
    expect(
      () =>
        new ToolHost(manifestSenzaServizio, SERVICE_CAP as Capabilities, {
          store: new MemoryWorkspace(),
          board,
          instanceId: "elab-a",
          roomId: "broker-room",
          simulation: realSimulationService,
        }),
    ).toThrow()
  })

  it("RED-7: capability concessa ma servizio NON iniettato → INTERNAL, mai silenzio", async () => {
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
    })
    const { call } = await mountReady(host)

    const { result, error } = await call("simulation.describe")

    expect(result).toBeUndefined()
    expect(error?.code).toBe(ERR.INTERNAL)
    expect(error?.message).toMatch(/not wired by host/i)
  })
})

// ---------------------------------------------------------------------------
// RED-10 / RED-11 — riproduzione dei due rilievi CodeRabbit su PR #210
// ---------------------------------------------------------------------------
describe("service.simulation — la ricevuta non può mentire", () => {
  it.each(malformedRuntimeScenes)(
    "rifiuta uno stato runtime fuori schema: %s",
    async (_name, mutate) => {
      const malformedService: SimulationRuntimeApiLike = {
        ...realSimulationService,
        loadScene: (input) => {
          const state = loadSimulationRuntimeScene(input) as unknown as Record<string, unknown>
          const scene = state.scene
          if (typeof scene !== "object" || scene === null || Array.isArray(scene)) {
            throw new Error("test precondition: runtime scene missing")
          }
          mutate(scene as Record<string, unknown>)
          return state
        },
      }
      const host = new ToolHost(
        elabTutorManifest(SERVICE_CAP),
        SERVICE_CAP as Capabilities,
        {
          store: new MemoryWorkspace(),
          board,
          instanceId: "elab-a",
          roomId: "broker-room",
          simulation: malformedService,
        },
      )
      const { call } = await mountReady(host)

      const rejected = await call("simulation.loadScene", { scene: LED_SCENE })
      expect(rejected.result).toBeUndefined()
      expect(rejected.error?.code).toBe(ERR.INTERNAL)
      expect(rejected.error?.message).toMatch(/state scene is malformed/i)

      const serialized = await call("simulation.serializeState")
      expect(serialized.result).toBeUndefined()
      expect(serialized.error?.code).toBe(ERR.INTERNAL)
      expect(serialized.error?.message).toMatch(/no scene loaded/i)
    },
  )

  it("RED-10: se il digest fallisce, il receipt non deve mai legare la scena VECCHIA allo stato NUOVO", async () => {
    const SECONDA_SCENA = {
      components: [{ id: "r9", type: "resistor", value: 1000 }],
      connections: [{ from: "r9:a", to: "r9:b" }],
    }
    let chiamate = 0
    const digestRottoAllaSeconda: SimulationRuntimeApiLike = {
      ...realSimulationService,
      sceneDigest: (scene) => {
        chiamate += 1
        if (chiamate === 2) throw new Error("digest non calcolabile")
        return simulationSceneDigest(scene)
      },
    }
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
      roomId: "broker-room",
      simulation: digestRottoAllaSeconda,
    })
    const { call } = await mountReady(host)

    await call("simulation.loadScene", { scene: LED_SCENE })
    const secondo = await call("simulation.loadScene", { scene: SECONDA_SCENA })
    expect(secondo.result).toBeUndefined()
    expect(secondo.error?.code).toBe(ERR.INTERNAL)

    // L'istanza deve essere rimasta INTERAMENTE sulla prima scena: stato e digest
    // insieme. Uno stato nuovo con un digest vecchio è una prova falsa.
    const serializzato = await call("simulation.serializeState")
    const state = (serializzato.result as { state?: { scene?: { components?: Array<{ id: string }> } } }).state
    const receipt = (serializzato.result as { receipt?: { sceneDigest?: string } }).receipt
    expect(receipt?.sceneDigest).toBe(SCENE_DIGEST)
    expect(state?.scene?.components?.map((c) => c.id)).toEqual(["bat1", "r1", "led1"])
  })

  it("RED-12: un servizio che non restituisce uno stato non deve produrre una ricevuta di successo", async () => {
    const servizioSenzaStato: SimulationRuntimeApiLike = {
      ...realSimulationService,
      loadScene: () => undefined,
    }
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
      roomId: "broker-room",
      simulation: servizioSenzaStato,
    })
    const { call } = await mountReady(host)

    // Una ricevuta di successo per uno stato che non esiste è una prova falsa:
    // il passo dopo direbbe "nessuna scena caricata" dopo un caricamento riuscito.
    const load = await call("simulation.loadScene", { scene: LED_SCENE })
    expect(load.result).toBeUndefined()
    expect(load.error?.code).toBe(ERR.INTERNAL)
  })

  it("RED-11: un servizio che dichiara un apiVersion fuori contratto è respinto, non trascritto nel receipt", async () => {
    const servizioFuoriContratto: SimulationRuntimeApiLike = {
      ...realSimulationService,
      describe: () => ({
        pluginId: "io.ardesia.simulation",
        apiVersion: "simulation-runtime/99",
        stateSchema: "simulation-runtime-state/99",
      }),
    }
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
      roomId: "broker-room",
      simulation: servizioFuoriContratto,
    })
    const { call } = await mountReady(host)

    const { result, error } = await call("simulation.loadScene", { scene: LED_SCENE })

    expect(result).toBeUndefined()
    expect(error?.code).toBe(ERR.INTERNAL)
  })
})

// ---------------------------------------------------------------------------
// RED-8 — il kill-switch prevale anche sul servizio
// ---------------------------------------------------------------------------
describe("service.simulation — kill-switch", () => {
  it("RED-8: dopo revoke() nessuna chiamata al servizio riceve risposta", async () => {
    const host = hostWithSimulation("elab-a")
    const { call } = await mountReady(host)
    await call("simulation.loadScene", { scene: LED_SCENE })

    host.revoke()

    const answered = await Promise.race([
      call("simulation.serializeState").then(() => "risposta"),
      new Promise<string>((resolve) => setTimeout(() => resolve("silenzio"), 50)),
    ])
    expect(answered).toBe("silenzio")
    expect(host.session).toBeNull()
  })
})
