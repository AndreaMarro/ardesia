// @vitest-environment jsdom
//
// SERVICE BROKER `service.simulation` — un Pack/plugin disciplinare (consumer)
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
// FUORI SLICE (deferito, con oracoli propri): `simulation.applyOperation` — la
// mutazione trascina placement pipeline, occupancy e pin vocabulary e merita
// falsificatori dedicati. Qui il ciclo dimostrato è load → solve → read →
// serialize.
import { afterEach, describe, expect, it } from "vitest"
import { ERR, PROTOCOL_VERSION, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolHost } from "../toolhost/host.ts"
import { assertGrantWithinManifest } from "../toolhost/policy.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { SimulationRuntimeApiLike } from "../toolhost/caps/simulation.ts"
import type { SimulationScene } from "../toolhost-protocol/index.ts"
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest.ts"

const SIMULATION_RUNTIME_API_VERSION = "simulation-runtime/1" as const
const SIMULATION_RUNTIME_PLUGIN_ID = "io.ardesia.simulation" as const
const SIMULATION_RUNTIME_STATE_SCHEMA = "synthetic-broker-service/1" as const

type SimulationRuntimeState = { schema: string; instanceId: string; scene: SimulationScene; diagnostics: string[] }
type SimulationRuntimeProviderRequest = { provider: string; mode: string }
function loadSimulationRuntimeScene(input: { instanceId: string; scene: SimulationScene; diagnostics?: string[] }): SimulationRuntimeState {
  return { schema: SIMULATION_RUNTIME_STATE_SCHEMA, instanceId: input.instanceId, scene: structuredClone(input.scene), diagnostics: [...input.diagnostics ?? []] }
}
function serializeSimulationRuntimeState(state: SimulationRuntimeState): SimulationRuntimeState { return structuredClone(state) }
function solveSimulationRuntimeProvider(state: SimulationRuntimeState, request: SimulationRuntimeProviderRequest) {
  return { state: structuredClone(state), result: { fixture: true, provider: request.provider, mode: request.mode } }
}
function runtimeStateSceneDigest(state: unknown): string { return simulationSceneDigest((state as SimulationRuntimeState).scene) }
/** Synthetic injected service: the production broker remains the subject under test. */
const fixtureSimulationService: SimulationRuntimeApiLike = {
  describe: () => ({ pluginId: SIMULATION_RUNTIME_PLUGIN_ID, apiVersion: SIMULATION_RUNTIME_API_VERSION, stateSchema: SIMULATION_RUNTIME_STATE_SCHEMA }),
  sceneDigest: simulationSceneDigest,
  stateSceneDigest: runtimeStateSceneDigest,
  loadScene: loadSimulationRuntimeScene,
  solve: (state, request) => solveSimulationRuntimeProvider(state as SimulationRuntimeState, request),
  readDiagnostics: (state) => ({ instanceId: (state as SimulationRuntimeState).instanceId, fixture: true }),
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
    name: "consumer",
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
    simulation: fixtureSimulationService,
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
describe("service.simulation — composizione consumer→servizio host-mediated", () => {
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
      simulation: fixtureSimulationService,
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
          simulation: fixtureSimulationService,
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
  it("RED-10: se il digest fallisce, il receipt non deve mai legare la scena VECCHIA allo stato NUOVO", async () => {
    const SECONDA_SCENA = {
      components: [{ id: "r9", type: "resistor", value: 1000 }],
      connections: [{ from: "r9:a", to: "r9:b" }],
    }
    let chiamate = 0
    const digestRottoAllaSeconda: SimulationRuntimeApiLike = {
      ...fixtureSimulationService,
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
      ...fixtureSimulationService,
      loadScene: () => undefined,
    }
    const host = new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
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
      ...fixtureSimulationService,
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
      simulation: servizioFuoriContratto,
    })
    const { call } = await mountReady(host)

    const { result, error } = await call("simulation.loadScene", { scene: LED_SCENE })

    expect(result).toBeUndefined()
    expect(error?.code).toBe(ERR.INTERNAL)
  })
})

// ---------------------------------------------------------------------------
// RED-13 / RED-14 / RED-15 — il digest deve derivare dallo STATO, non dalla RICHIESTA
//
// RED-10 dimostrava che stato e digest si aggiornano insieme. Non basta: possono
// essere coerenti FRA LORO e insieme scollegati da ciò che il servizio ha davvero
// caricato. Il digest nasceva da `params.scene` — la scena CHIESTA — mentre lo
// stato committato era quello RESTITUITO: un servizio dentro contratto che carica
// B mentre gli si chiede A produce `sceneDigest = hash(A)` sopra uno stato che
// contiene B, e `serializeState` ripete la stessa ricevuta falsa.
// ---------------------------------------------------------------------------
describe("service.simulation — il digest deve descrivere lo stato davvero caricato", () => {
  /** Topologia diversa da LED_SCENE: digest necessariamente diverso. */
  const SCENA_B = {
    components: [{ id: "r9", type: "resistor", value: 1000 }],
    connections: [{ from: "r9:a", to: "r9:b" }],
  }

  function hostConServizio(api: SimulationRuntimeApiLike): ToolHost {
    return new ToolHost(elabTutorManifest(SERVICE_CAP), SERVICE_CAP as Capabilities, {
      store: new MemoryWorkspace(),
      board,
      instanceId: "elab-a",
      simulation: api,
    })
  }

  it("RED-13: un servizio che carica una scena DIVERSA da quella chiesta non ottiene ricevuta", async () => {
    // Soddisfa describe() alla lettera — stesso pluginId, stesso apiVersion,
    // stesso stateSchema — e mente su UNA cosa sola: cosa ha caricato.
    const caricaAltraScena: SimulationRuntimeApiLike = {
      ...fixtureSimulationService,
      loadScene: (input) => loadSimulationRuntimeScene({ ...input, scene: SCENA_B }),
    }
    const { call } = await mountReady(hostConServizio(caricaAltraScena))

    const load = await call("simulation.loadScene", { scene: LED_SCENE })

    // Una ricevuta che non può essere vera non deve essere emessa: fail-closed.
    expect(load.result).toBeUndefined()
    expect(load.error?.code).toBe(ERR.INTERNAL)
    expect(load.error?.message).toMatch(/digest/i)

    // E l'istanza non deve restare con uno stato committato sotto un digest che
    // mente: la sonda del review leggeva `receiptAtSerialize = hash(A)` su uno
    // stato che persisteva B.
    const serialized = await call("simulation.serializeState")
    expect(serialized.result).toBeUndefined()
    expect(serialized.error?.message).toMatch(/no scene loaded/i)
  })

  it("RED-14: nemmeno solve può sostituire lo stato tenendosi il digest del load", async () => {
    // solve committa `solved.state` e riusa `_requireDigest()`: stessa forma del
    // difetto, un passo più in là nel ciclo.
    const solveCambiaScena: SimulationRuntimeApiLike = {
      ...fixtureSimulationService,
      solve: (state, request) => {
        const solved = solveSimulationRuntimeProvider(
          state as SimulationRuntimeState,
          request as SimulationRuntimeProviderRequest,
        )
        return { state: { ...solved.state, scene: SCENA_B }, result: solved.result }
      },
    }
    const { call } = await mountReady(hostConServizio(solveCambiaScena))

    const load = await call("simulation.loadScene", { scene: LED_SCENE })
    expect(load.error).toBeUndefined()

    const solved = await call("simulation.solve", { provider: "local", mode: "static" })
    expect(solved.result).toBeUndefined()
    expect(solved.error?.code).toBe(ERR.INTERNAL)
    expect(solved.error?.message).toMatch(/digest/i)

    // Lo stato pre-solve resta quello valido: la scena chiesta, sotto il suo digest.
    const serialized = await call("simulation.serializeState")
    expect(serialized.error).toBeUndefined()
    const state = (serialized.result as { state?: { scene?: { components?: Array<{ id: string }> } } }).state
    const receipt = (serialized.result as { receipt?: { sceneDigest?: string } }).receipt
    expect(receipt?.sceneDigest).toBe(SCENE_DIGEST)
    expect(state?.scene?.components?.map((c) => c.id)).toEqual(["bat1", "r1", "led1"])
  })

  it("RED-16: serializeState non può consegnare uno stato che la ricevuta non descrive", async () => {
    // È l'osservabile che la sonda del review misurava: `receiptAtSerialize` diceva
    // hash(A) mentre `persistedSceneIds` valeva ["b"]. Con load e solve corretti lo
    // stato TENUTO è giusto, ma i byte CONSEGNATI passano ancora dal servizio.
    const serializzaAltraScena: SimulationRuntimeApiLike = {
      ...fixtureSimulationService,
      serializeState: (state) => ({
        ...serializeSimulationRuntimeState(state as SimulationRuntimeState),
        scene: SCENA_B,
      }),
    }
    const { call } = await mountReady(hostConServizio(serializzaAltraScena))

    const load = await call("simulation.loadScene", { scene: LED_SCENE })
    expect(load.error).toBeUndefined()

    const serialized = await call("simulation.serializeState")
    expect(serialized.result).toBeUndefined()
    expect(serialized.error?.code).toBe(ERR.INTERNAL)
    expect(serialized.error?.message).toMatch(/digest/i)
  })

  it("RED-15: un digest di stato non-stringa è un digest assente, non una ricevuta", async () => {
    // Il valore arriva da un servizio iniettato e finisce DENTRO la ricevuta:
    // accettarlo com'è produrrebbe un receipt fuori da SimulationReceiptSchema.
    const digestNonStringa: SimulationRuntimeApiLike = {
      ...fixtureSimulationService,
      stateSceneDigest: () => undefined as unknown as string,
    }
    const { call } = await mountReady(hostConServizio(digestNonStringa))

    const load = await call("simulation.loadScene", { scene: LED_SCENE })

    expect(load.result).toBeUndefined()
    expect(load.error?.code).toBe(ERR.INTERNAL)
    expect(load.error?.message).toMatch(/digest/i)
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
