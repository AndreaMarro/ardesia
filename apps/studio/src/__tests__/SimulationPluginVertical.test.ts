// @vitest-environment jsdom
//
// Sessione 2 — harness verticale causale parziale:
// pack reale v1-cap6-esp1 → PluginInstance Simulation → ToolHost JSON-RPC →
// runtime/provider reali → LessonOS → Workspace save/cold reopen/export-import.
//
// Nessun valore elettrico atteso è inventato: gli oracoli leggono il risultato
// del provider locale e il suo solverDiagnostics.shortCircuit.

import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import {
  ERR,
  PROTOCOL_VERSION,
  ToolManifestSchema,
  protocolSatisfies,
} from "../toolhost-protocol/index.ts"
import type {
  CapabilityName,
  ToolManifest,
} from "../toolhost-protocol/index.ts"
import { manifest as simulationManifest } from "../../plugins/simulation/manifest.ts"
import { ToolHost } from "../toolhost/host.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { SimulationRuntimeApiLike } from "../toolhost/caps/simulation.ts"
import { WorkspaceStore } from "../store/WorkspaceStore.ts"
import {
  createEventLogStore,
  exportEnvelopeEventLogSnapshot,
} from "../lessonos/indexedDbEventLog.ts"
import type {
  EnvelopeEventLogStore,
} from "../lessonos/eventlog.ts"
import { materialize } from "../lessonos/materializer.ts"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope.ts"
import {
  applySimulationRuntimeOperation,
  describeSimulationRuntimeApi,
  loadSimulationRuntimeScene,
  readSimulationRuntimeDiagnostics,
  restoreSimulationRuntimeState,
  serializeSimulationRuntimeState,
  solveSimulationRuntimeProvider,
} from "../../sim/core/simulationRuntime.ts"
import type {
  SimulationRuntimeProviderRequest,
  SimulationRuntimeState,
} from "../../sim/core/simulationRuntime.ts"
import type { SimulationOperationEnvelope } from "../../sim/core/simulationOperations.ts"
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest.ts"
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter.ts"

const repoRoot = resolve(import.meta.dirname, "../../../..")
const ROOM_A = "session-2-room-a"
const ROOM_B = "session-2-room-b"
const SESSION_A = "10000000-0000-4000-8000-000000000002"
const INSTANCE_A = "simulation-a"
const INSTANCE_B = "simulation-b"

type CandidateFixture = {
  schemaVersion: "circuit-scene/2"
  experimentId: string
  provenance: {
    status: string
    checks: {
      electrical: string
      geometry: string
      bookMatch: string
      visualMatch: string
    }
  }
  components: Array<{
    id: string
    type: string
    value?: number
  }>
  wires: Array<{
    id: string
    from: string
    to: string
  }>
  pinAssignments: Record<string, string>
}

type PackManifest = {
  kind: string
  id: string
  version: string
  dependencies: {
    plugins: Record<string, string>
  }
}

type LessonPath = {
  experiment_id: string
  book_reference: {
    volume: number
    page: number
  }
}

type ServiceScene = {
  components: Array<{
    id: string
    type: string
    value?: number
  }>
  connections: Array<{
    id: string
    from: string
    to: string
  }>
  pinAssignments: Record<string, string>
}

type SolverOutcome = {
  ok: boolean
  provider: string
  diagnostics: string[]
  providerDiagnostics: Array<{
    code: string
    severity: string
    message: string
  }>
  solverDiagnostics: {
    shortCircuit?: boolean
  } | null
  componentStates: Record<string, Record<string, unknown>>
  currents: Record<string, number>
  voltages: Record<string, number>
}

type SimulationReceipt = {
  apiVersion: string
  pluginId: string
  instanceId: string
  sceneDigest: string
}

type ApplyOperationWireResult = {
  receipt: SimulationReceipt
  roomId: string
  operationId: string
  accepted: true
  solveOutcome: SolverOutcome
  diagnostics: unknown
}

type SerializedWireResult = {
  receipt: SimulationReceipt
  state: SimulationRuntimeState
}

type PersistedRoomScene = {
  v: 1
  roomId: string
  pluginInstances: Array<{
    pluginId: string
    pluginVersion: string
    packId: string
    experimentId: string
    instanceId: string
    sceneDigest: string
    runtimeState: SimulationRuntimeState
  }>
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8")) as T
}

const candidateFixture = readJson<CandidateFixture>(
  "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json",
)
const packManifest = readJson<PackManifest>("packs/elab-tutor/manifest.json")
const lessonPath = readJson<LessonPath>(
  "packs/elab-tutor/data/lesson-paths/v1-cap6-esp1.json",
)

function serviceSceneFromFixture(fixture: CandidateFixture): ServiceScene {
  const adapted = createSimulationAdapterPayloadFromElabScene(fixture)
  return {
    components: adapted.circuit.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(typeof component.value === "number" ? { value: component.value } : {}),
    })),
    connections: adapted.circuit.wires.map((wire) => ({
      id: wire.id,
      from: wire.from,
      to: wire.to,
    })),
    pinAssignments: { ...adapted.circuit.pinAssignments },
  }
}

const ORIGINAL_SCENE = serviceSceneFromFixture(candidateFixture)
const ORIGINAL_DIGEST = simulationSceneDigest(ORIGINAL_SCENE)

const SHORT_CIRCUIT_OPERATION = {
  schema: "simulation-operation/1",
  id: "session-2:short-battery",
  actor: "manual",
  origin: "canvas",
  targetProvider: "local",
  providerMode: "static",
  operation: {
    kind: "connect-wire",
    wire: {
      id: "session-2-short",
      from: "bat1:positive",
      to: "bat1:negative",
      color: "red",
    },
  },
} as const

/**
 * Manifest proiettato usato dal test RED originario. La verifica di convergenza
 * in fondo al file impedisce che resti una seconda verità rispetto al manifest
 * vivo ora allineato a service.simulation/SDK 1.4.
 */
const verticalManifest: ToolManifest = ToolManifestSchema.parse({
  ...simulationManifest,
  contract: ">=1.4 <2.0",
  capabilities: {
    ...simulationManifest.capabilities,
    "service.simulation": { apiVersion: "simulation-runtime/1" },
  },
})

/**
 * Composition root del test: collega l'interfaccia strutturale del Core alle
 * funzioni reali simulation-runtime/1. ToolHost non importa mai sim/.
 */
const realSimulationService: SimulationRuntimeApiLike = Object.assign(
  {
    describe: () => describeSimulationRuntimeApi(),
    sceneDigest: (scene: Parameters<typeof simulationSceneDigest>[0]) =>
      simulationSceneDigest(scene),
    loadScene: (input: {
      instanceId: string
      scene: Parameters<typeof loadSimulationRuntimeScene>[0]["scene"]
      diagnostics?: string[]
    }) => loadSimulationRuntimeScene(input),
    solve: (state: unknown, request: { provider: string; mode: string }) => {
      const solved = solveSimulationRuntimeProvider(
        state as SimulationRuntimeState,
        request as SimulationRuntimeProviderRequest,
      )
      return { state: solved.state, result: solved.result }
    },
    readDiagnostics: (state: unknown) =>
      readSimulationRuntimeDiagnostics(state as SimulationRuntimeState),
    serializeState: (state: unknown) =>
      serializeSimulationRuntimeState(state as SimulationRuntimeState),
    restoreState: (serialized: unknown) =>
      restoreSimulationRuntimeState(serialized as SimulationRuntimeState),
  },
  {
    applyOperation: (state: unknown, operation: unknown) => {
      const applied = applySimulationRuntimeOperation(
        state as SimulationRuntimeState,
        operation as SimulationOperationEnvelope,
      )
      const accepted = applied.report.ok && (applied.placement === null || applied.placement.ok)
      return {
        state: applied.state,
        accepted,
        result: applied.state.lastSolverResult ?? null,
        diagnostics: readSimulationRuntimeDiagnostics(applied.state),
      }
    },
  },
)

const board: BoardApiLike = {
  getSceneElements: (): readonly BoardElementLike[] => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

type WireError = {
  code: number
  message: string
}

type WireResponse = {
  result?: unknown
  error?: WireError
}

type MountedClient = {
  call(method: string, params?: unknown): Promise<WireResponse>
  close(): void
}

const mountedClients: MountedClient[] = []

async function mountReady(host: ToolHost): Promise<MountedClient> {
  const channel = new MessageChannel()
  const session = host.mount(channel.port1)
  channel.port2.start()

  const ready = new Promise<void>((resolveReady) => {
    const onReady = (event: MessageEvent): void => {
      const data = event.data as { id?: unknown }
      if (data.id !== 1) return
      channel.port2.removeEventListener("message", onReady)
      resolveReady()
    }
    channel.port2.addEventListener("message", onReady)
  })
  channel.port2.postMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "tool.ready",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      nonce: session.nonce,
    },
  })
  await ready

  let nextId = 2
  const client: MountedClient = {
    call: (method, params = {}) =>
      new Promise<WireResponse>((resolveResponse) => {
        const id = nextId++
        const onResponse = (event: MessageEvent): void => {
          const data = event.data as {
            id?: unknown
            result?: unknown
            error?: WireError
          }
          if (data.id !== id) return
          channel.port2.removeEventListener("message", onResponse)
          resolveResponse({ result: data.result, error: data.error })
        }
        channel.port2.addEventListener("message", onResponse)
        channel.port2.postMessage({
          jsonrpc: "2.0",
          id,
          method,
          params,
        })
      }),
    close: () => {
      channel.port1.close()
      channel.port2.close()
    },
  }
  mountedClients.push(client)
  return client
}

function wireResult<T>(response: WireResponse): T {
  expect(response.error).toBeUndefined()
  expect(response.result).toBeDefined()
  return response.result as T
}

function hostFor(
  workspace: WorkspaceStore & AuditStore,
  eventLog: EnvelopeEventLogStore,
  instanceId: string,
  roomId = ROOM_A,
  initialState?: unknown,
  approved: readonly CapabilityName[] = [
    "service.simulation",
    "lesson.event.emit",
  ],
  simulationService: SimulationRuntimeApiLike = realSimulationService,
): ToolHost {
  const grant = resolveGrant(verticalManifest, approved)
  const deps = Object.assign(
    {
      store: workspace,
      board,
      instanceId,
      simulation: simulationService,
      lessonEventLog: eventLog,
    },
    {
      roomId,
      ...(initialState === undefined
        ? {}
        : {
            simulationInitialState: {
              roomId,
              instanceId,
              state: initialState,
            },
          }),
    },
  )
  return new ToolHost(verticalManifest, grant, deps)
}

async function canonicalEventLog(): Promise<EnvelopeEventLogStore> {
  const buildProducer = studioProducerIdentity()
  return createEventLogStore({
    factory: undefined,
    dbName: `session-2-${crypto.randomUUID()}`,
    trustedContext: {
      lessonId: ROOM_A,
      sessionId: SESSION_A,
      actor: { type: "plugin", id: "io.ardesia.simulation" },
      producer: {
        id: "io.ardesia.simulation",
        version: simulationManifest.version,
        commitSha: buildProducer.commitSha,
      },
    },
  })
}

function graphSnapshot(events: Awaited<ReturnType<EnvelopeEventLogStore["readAll"]>>): string {
  const graph = materialize(events)
  return JSON.stringify({
    nodes: [...graph.nodes.values()].sort((left, right) => left.id.localeCompare(right.id)),
    edges: [...graph.edges].sort((left, right) =>
      `${left.from}|${left.kind}|${left.to}`.localeCompare(
        `${right.from}|${right.kind}|${right.to}`,
      ),
    ),
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  for (const client of mountedClients.splice(0)) client.close()
  localStorage.clear()
})

describe("Sessione 2 — harness verticale parziale Simulation Plugin / ELABTutor", () => {
  it("harness: mutazione reale host-mediated → provider → LessonOS → cold reopen → export/import", async () => {
    expect(packManifest).toMatchObject({
      kind: "pack",
      id: "io.elab.tutor",
      dependencies: {
        plugins: {
          "io.ardesia.simulation": ">=2.0.0",
        },
      },
    })
    expect(lessonPath.experiment_id).toBe("v1-cap6-esp1")
    expect(candidateFixture.experimentId).toBe(lessonPath.experiment_id)
    expect(candidateFixture.provenance.checks).toMatchObject({
      electrical: "pass",
      geometry: "pass",
      bookMatch: "pass",
      visualMatch: "unknown",
    })
    expect(candidateFixture.provenance.status).toBe("candidate")

    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const hostA = hostFor(workspace, eventLog, INSTANCE_A)
    const clientA = await mountReady(hostA)

    const loaded = wireResult<{ receipt: SimulationReceipt }>(
      await clientA.call("simulation.loadScene", { scene: ORIGINAL_SCENE }),
    )
    expect(loaded.receipt).toMatchObject({
      pluginId: "io.ardesia.simulation",
      instanceId: INSTANCE_A,
      sceneDigest: ORIGINAL_DIGEST,
    })

    const baseline = wireResult<{ receipt: SimulationReceipt; result: SolverOutcome }>(
      await clientA.call("simulation.solve", {
        provider: "local",
        mode: "static",
      }),
    )
    expect(baseline.result.provider).toBe("local")
    expect(baseline.result.ok).toBe(true)
    const baselineLedCurrent = baseline.result.currents.led1
    expect(baselineLedCurrent).toBeGreaterThan(0)

    const applied = wireResult<ApplyOperationWireResult>(
      await clientA.call("simulation.applyOperation", {
        expectedSceneDigest: ORIGINAL_DIGEST,
        operation: SHORT_CIRCUIT_OPERATION,
      }),
    )
    expect(applied.accepted).toBe(true)
    expect(applied.operationId).toBe(SHORT_CIRCUIT_OPERATION.id)
    expect(applied.receipt.instanceId).toBe(INSTANCE_A)
    expect(applied.roomId).toBe(ROOM_A)
    expect(applied.receipt.sceneDigest).not.toBe(ORIGINAL_DIGEST)
    expect(applied.solveOutcome).toMatchObject({
      ok: false,
      provider: "local",
      solverDiagnostics: {
        shortCircuit: true,
      },
    })
    expect(
      applied.solveOutcome.providerDiagnostics.some(
        (diagnostic) => diagnostic.code === "provider-available",
      ),
    ).toBe(true)

    const diagnostics = wireResult<{
      receipt: SimulationReceipt
      diagnostics: {
        instanceId: string
        provider: string
        solverDiagnostics: {
          shortCircuit?: boolean
        }
      }
    }>(await clientA.call("simulation.readDiagnostics"))
    expect(diagnostics.receipt.sceneDigest).toBe(applied.receipt.sceneDigest)
    expect(diagnostics.diagnostics).toMatchObject({
      instanceId: INSTANCE_A,
      provider: "local",
      solverDiagnostics: {
        shortCircuit: true,
      },
    })

    const evidence = [
      "manual:vol1:p29-31",
      `simulation:scene:${applied.receipt.sceneDigest}`,
      `simulation-instance:${INSTANCE_A}`,
    ]
    wireResult<{ seq: number }>(
      await clientA.call("lesson.event.emit", {
        event: {
          kind: "plugin.mounted",
          pluginId: simulationManifest.id,
          pluginKind: "plugin",
          instanceId: INSTANCE_A,
          room: ROOM_A,
          labels: { it: "Simulation Plugin montato" },
          t: 1_000,
          evidence,
        },
      }),
    )
    const errorId = `simulation-error:${applied.receipt.sceneDigest}:short-circuit`
    wireResult<{ seq: number }>(
      await clientA.call("lesson.event.emit", {
        event: {
          kind: "simulation.error.observed",
          errorId,
          conceptId: "circuito_chiuso",
          sceneId: applied.receipt.sceneDigest,
          experimentId: lessonPath.experiment_id,
          labels: { it: "Cortocircuito osservato dal provider locale" },
          t: 1_001,
          evidence,
        },
      }),
    )

    const envelopes = await eventLog.readAllEnvelopes()
    const errorEnvelope = envelopes.find(
      (event) => event.kind === "simulation.error.observed",
    )
    expect(errorEnvelope).toMatchObject({
      lessonId: ROOM_A,
      sessionId: SESSION_A,
      producer: {
        id: "io.ardesia.simulation",
        version: simulationManifest.version,
        commitSha: studioProducerIdentity().commitSha,
      },
      payload: {
        errorId,
        sceneId: applied.receipt.sceneDigest,
        experimentId: lessonPath.experiment_id,
      },
    })
    expect(errorEnvelope?.producer.commitSha).toMatch(/^[0-9a-f]{40}$/)
    expect(errorEnvelope?.evidence).toEqual(
      evidence.map((ref) => ({ ref, resolution: "missing" })),
    )

    const legacyEvents = await eventLog.readAll()
    expect(graphSnapshot(legacyEvents)).toBe(graphSnapshot(legacyEvents))
    expect(materialize(legacyEvents).nodes.get(errorId)).toMatchObject({
      kind: "errore",
      evidenceRefs: evidence,
    })

    const serialized = wireResult<SerializedWireResult>(
      await clientA.call("simulation.serializeState"),
    )
    const persisted: PersistedRoomScene = {
      v: 1,
      roomId: ROOM_A,
      pluginInstances: [{
        pluginId: simulationManifest.id,
        pluginVersion: simulationManifest.version,
        packId: packManifest.id,
        experimentId: lessonPath.experiment_id,
        instanceId: INSTANCE_A,
        sceneDigest: serialized.receipt.sceneDigest,
        runtimeState: serialized.state,
      }],
    }
    await workspace.saveScene(ROOM_A, JSON.stringify(persisted))

    hostA.unmount()
    const reopenedScene = JSON.parse(
      (await workspace.loadScene(ROOM_A))!,
    ) as PersistedRoomScene
    const reopenedState = reopenedScene.pluginInstances[0]!.runtimeState
    const reopenedHost = hostFor(
      workspace,
      eventLog,
      INSTANCE_A,
      ROOM_A,
      reopenedState,
    )
    const reopenedClient = await mountReady(reopenedHost)
    const reopenedSerialized = wireResult<SerializedWireResult>(
      await reopenedClient.call("simulation.serializeState"),
    )
    expect(reopenedSerialized).toEqual(serialized)
    const reopenedDiagnostics = wireResult<{
      receipt: SimulationReceipt
      diagnostics: unknown
    }>(
      await reopenedClient.call("simulation.readDiagnostics"),
    )
    expect(reopenedDiagnostics).toEqual(diagnostics)

    const hostB = hostFor(workspace, eventLog, INSTANCE_B, ROOM_A)
    const clientB = await mountReady(hostB)
    const aBeforeB = wireResult<SerializedWireResult>(
      await reopenedClient.call("simulation.serializeState"),
    )
    wireResult<{ receipt: SimulationReceipt }>(
      await clientB.call("simulation.loadScene", { scene: ORIGINAL_SCENE }),
    )
    wireResult<ApplyOperationWireResult>(
      await clientB.call("simulation.applyOperation", {
        expectedSceneDigest: ORIGINAL_DIGEST,
        operation: {
          ...SHORT_CIRCUIT_OPERATION,
          id: "session-2:short-battery-instance-b",
          operation: {
            ...SHORT_CIRCUIT_OPERATION.operation,
            wire: {
              ...SHORT_CIRCUIT_OPERATION.operation.wire,
              id: "session-2-short-instance-b",
            },
          },
        },
      }),
    )
    const aAfterB = wireResult<SerializedWireResult>(
      await reopenedClient.call("simulation.serializeState"),
    )
    expect(aAfterB).toEqual(aBeforeB)

    expect(await workspace.loadScene(ROOM_B)).toBeNull()
    const roomBHost = hostFor(workspace, eventLog, INSTANCE_A, ROOM_B)
    const roomBClient = await mountReady(roomBHost)
    wireResult<{ receipt: SimulationReceipt }>(
      await roomBClient.call("simulation.loadScene", { scene: ORIGINAL_SCENE }),
    )
    const roomBState = wireResult<SerializedWireResult>(
      await roomBClient.call("simulation.serializeState"),
    )
    const roomASceneBeforeRoomBSave = await workspace.loadScene(ROOM_A)
    const persistedRoomB: PersistedRoomScene = {
      v: 1,
      roomId: ROOM_B,
      pluginInstances: [{
        pluginId: simulationManifest.id,
        pluginVersion: simulationManifest.version,
        packId: packManifest.id,
        experimentId: lessonPath.experiment_id,
        instanceId: INSTANCE_A,
        sceneDigest: roomBState.receipt.sceneDigest,
        runtimeState: roomBState.state,
      }],
    }
    await workspace.saveScene(ROOM_B, JSON.stringify(persistedRoomB))
    expect(await workspace.loadScene(ROOM_A)).toBe(roomASceneBeforeRoomBSave)
    expect(roomBState.receipt.sceneDigest).toBe(ORIGINAL_DIGEST)

    const eventSnapshotBeforeExport = await exportEnvelopeEventLogSnapshot(eventLog)
    const eventBytesBeforeExport = await eventSnapshotBeforeExport.text()
    await workspace.write(
      `raw/${ROOM_A}/lessonos-events.jsonl`,
      new Blob([eventBytesBeforeExport], { type: "application/x-ndjson" }),
    )
    const sourceRoomA = await workspace.loadScene(ROOM_A)
    const sourceRoomB = await workspace.loadScene(ROOM_B)
    const bundle = await workspace.exportBundle()

    localStorage.clear()
    const importedWorkspace = new WorkspaceStore()
    await importedWorkspace.init()
    await importedWorkspace.importBundle(bundle)

    expect(await importedWorkspace.loadScene(ROOM_A)).toBe(sourceRoomA)
    expect(await importedWorkspace.loadScene(ROOM_B)).toBe(sourceRoomB)
    const importedLogBytes = await importedWorkspace.read(
      `raw/${ROOM_A}/lessonos-events.jsonl`,
    )
    expect(await importedLogBytes?.text()).toBe(eventBytesBeforeExport)

    const importedRoom = JSON.parse(sourceRoomA!) as PersistedRoomScene
    const importedHost = hostFor(
      importedWorkspace,
      eventLog,
      INSTANCE_A,
      ROOM_A,
      importedRoom.pluginInstances[0]!.runtimeState,
    )
    const importedClient = await mountReady(importedHost)
    const importedSerialized = wireResult<SerializedWireResult>(
      await importedClient.call("simulation.serializeState"),
    )
    expect(importedSerialized).toEqual(serialized)
  })
})

describe("Sessione 2 — negative controls del confine", () => {
  it("apply prima del load è negato e un instanceId nel payload è INVALID_PARAMS", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const client = await mountReady(hostFor(workspace, eventLog, INSTANCE_A))

    const beforeLoad = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(beforeLoad.result).toBeUndefined()
    expect(beforeLoad.error).toMatchObject({
      code: ERR.INTERNAL,
    })
    expect(beforeLoad.error?.message).toMatch(/no scene loaded/i)

    const withInstanceOverride = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      instanceId: INSTANCE_B,
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(withInstanceOverride.result).toBeUndefined()
    expect(withInstanceOverride.error?.code).toBe(ERR.INVALID_PARAMS)
  })

  it("digest stantio, target invalido e operation kind fuori slice lasciano lo stato invariato", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const client = await mountReady(hostFor(workspace, eventLog, INSTANCE_A))
    wireResult(await client.call("simulation.loadScene", { scene: ORIGINAL_SCENE }))

    const before = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )

    const stale = await client.call("simulation.applyOperation", {
      expectedSceneDigest: "00000000",
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(stale.result).toBeUndefined()
    expect(stale.error?.code).toBe(ERR.INTERNAL)
    expect(stale.error?.message).toMatch(/scene digest/i)

    const invalidTarget = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: {
        ...SHORT_CIRCUIT_OPERATION,
        id: "session-2:invalid-target",
        operation: {
          ...SHORT_CIRCUIT_OPERATION.operation,
          wire: {
            ...SHORT_CIRCUIT_OPERATION.operation.wire,
            id: "session-2-invalid-target",
            from: "missing-component:pin",
          },
        },
      },
    })
    expect(invalidTarget.result).toBeUndefined()
    expect(invalidTarget.error?.code).toBe(ERR.INTERNAL)

    const unsupported = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: {
        ...SHORT_CIRCUIT_OPERATION,
        id: "session-2:unsupported-delete",
        operation: {
          kind: "delete",
          target: {
            kind: "component",
            id: "r1",
          },
        },
      },
    })
    expect(unsupported.result).toBeUndefined()
    expect(unsupported.error?.code).toBe(ERR.INVALID_PARAMS)

    const after = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )
    expect(after).toEqual(before)

    const unchangedService: SimulationRuntimeApiLike = {
      ...realSimulationService,
      applyOperation: (state) => ({
        state,
        accepted: true,
        result: { ok: true, provider: "local" },
        diagnostics: { provider: "local" },
      }),
    }
    const unchangedClient = await mountReady(hostFor(
      workspace,
      eventLog,
      INSTANCE_B,
      ROOM_A,
      undefined,
      ["service.simulation"],
      unchangedService,
    ))
    wireResult(await unchangedClient.call("simulation.loadScene", {
      scene: ORIGINAL_SCENE,
    }))
    const unchangedBefore = wireResult<SerializedWireResult>(
      await unchangedClient.call("simulation.serializeState"),
    )
    const unchanged = await unchangedClient.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: {
        ...SHORT_CIRCUIT_OPERATION,
        id: "session-2:accepted-noop",
      },
    })
    expect(unchanged.result).toBeUndefined()
    expect(unchanged.error?.code).toBe(ERR.INTERNAL)
    expect(unchanged.error?.message).toMatch(/did not change the scene digest/i)
    expect(wireResult<SerializedWireResult>(
      await unchangedClient.call("simulation.serializeState"),
    )).toEqual(unchangedBefore)
  })

  it("provider assente resta blocked senza correnti o tensioni decorative", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const client = await mountReady(hostFor(workspace, eventLog, INSTANCE_A))
    wireResult(await client.call("simulation.loadScene", { scene: ORIGINAL_SCENE }))

    const unavailable = wireResult<{
      receipt: SimulationReceipt
      result: SolverOutcome
    }>(
      await client.call("simulation.solve", {
        provider: "fastapi",
        mode: "static",
      }),
    )
    expect(unavailable.result).toMatchObject({
      ok: false,
      provider: "fastapi",
      providerDiagnostics: [
        {
          code: "provider-unavailable",
          severity: "blocker",
        },
      ],
      currents: {},
      voltages: {},
    })
  })

  it("capability non concessa nega applyOperation prima dell'handler", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const client = await mountReady(
      hostFor(
        workspace,
        eventLog,
        INSTANCE_A,
        ROOM_A,
        undefined,
        ["lesson.event.emit"],
      ),
    )

    const denied = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(denied.result).toBeUndefined()
    expect(denied.error?.code).toBe(ERR.CAPABILITY_DENIED)
  })

  it("restore lega insieme room, instance e stato con la grammatica room canonica", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const client = await mountReady(hostFor(workspace, eventLog, INSTANCE_A))
    wireResult(await client.call("simulation.loadScene", { scene: ORIGINAL_SCENE }))
    const serialized = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )
    const grant = resolveGrant(verticalManifest, ["service.simulation"])

    expect(() => new ToolHost(verticalManifest, grant, {
      store: workspace,
      board,
      instanceId: INSTANCE_A,
      roomId: ROOM_B,
      simulation: realSimulationService,
      simulationInitialState: {
        roomId: ROOM_A,
        instanceId: INSTANCE_A,
        state: serialized.state,
      },
    })).toThrow(/restore scope mismatch/i)

    expect(() => new ToolHost(verticalManifest, grant, {
      store: workspace,
      board,
      instanceId: INSTANCE_B,
      roomId: ROOM_A,
      simulation: realSimulationService,
      simulationInitialState: {
        roomId: ROOM_A,
        instanceId: INSTANCE_A,
        state: serialized.state,
      },
    })).toThrow(/restore scope mismatch/i)

    expect(() => hostFor(
      workspace,
      eventLog,
      INSTANCE_A,
      "Lezione_1.class",
    )).not.toThrow()
    expect(() => hostFor(
      workspace,
      eventLog,
      INSTANCE_A,
      "..",
    )).toThrow(/invalid room identifier/i)
  })

  it("output provider assenti rifiutano il commit e preservano lo stato", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    const incompleteService: SimulationRuntimeApiLike = {
      ...realSimulationService,
      applyOperation: (state, operation) => {
        const applied = realSimulationService.applyOperation!(state, operation)
        return {
          ...applied,
          result: undefined,
          diagnostics: undefined,
        }
      },
    }
    const client = await mountReady(hostFor(
      workspace,
      eventLog,
      INSTANCE_A,
      ROOM_A,
      undefined,
      ["service.simulation"],
      incompleteService,
    ))
    wireResult(await client.call("simulation.loadScene", { scene: ORIGINAL_SCENE }))
    const before = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )

    const rejected = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(rejected.result).toBeUndefined()
    expect(rejected.error?.code).toBe(ERR.INTERNAL)

    const after = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )
    expect(after).toEqual(before)
  })

  it("un serializer mutante non può alterare lo stato committato prima del rollback", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    const eventLog = await canonicalEventLog()
    let sabotageNextSerialization = true
    const mutatingService: SimulationRuntimeApiLike = {
      ...realSimulationService,
      serializeState: (state) => {
        if (sabotageNextSerialization) {
          sabotageNextSerialization = false
          const runtimeState = state as SimulationRuntimeState
          const connections = runtimeState.scene.connections
          if (connections === undefined) {
            throw new Error("test precondition: runtime scene has no connections")
          }
          connections.push({
            id: "malicious-wire",
            from: "bat1:positive",
            to: "bat1:negative",
            color: "red",
          })
          return undefined
        }
        return serializeSimulationRuntimeState(state as SimulationRuntimeState)
      },
    }
    const client = await mountReady(hostFor(
      workspace,
      eventLog,
      INSTANCE_A,
      ROOM_A,
      undefined,
      ["service.simulation"],
      mutatingService,
    ))
    wireResult(await client.call("simulation.loadScene", { scene: ORIGINAL_SCENE }))

    const rejected = await client.call("simulation.applyOperation", {
      expectedSceneDigest: ORIGINAL_DIGEST,
      operation: SHORT_CIRCUIT_OPERATION,
    })
    expect(rejected.result).toBeUndefined()
    expect(rejected.error?.code).toBe(ERR.INTERNAL)

    const after = wireResult<SerializedWireResult>(
      await client.call("simulation.serializeState"),
    )
    expect(after.receipt.sceneDigest).toBe(ORIGINAL_DIGEST)
    expect(after.state.scene.connections).toEqual(ORIGINAL_SCENE.connections)
  })

  it("import corrotto è atomico e conserva i byte precedenti", async () => {
    const workspace = new WorkspaceStore()
    await workspace.init()
    await workspace.write("raw/sentinel.txt", new Blob(["preserve-me"]))

    await expect(
      workspace.importBundle(new Blob(["not-an-ardesia-bundle"])),
    ).rejects.toThrow()
    expect(await (await workspace.read("raw/sentinel.txt"))?.text()).toBe("preserve-me")
  })

  it("il manifest vivo converge e un host SDK 1.3 non soddisfa il consumer 1.4", () => {
    expect(simulationManifest).toEqual(verticalManifest)
    expect(simulationManifest.contract).toBe(">=1.4 <2.0")
    expect(
      simulationManifest.capabilities["service.simulation"],
    ).toEqual({ apiVersion: "simulation-runtime/1" })
    expect(protocolSatisfies("1.3.0", simulationManifest.contract ?? "")).toBe(false)
    expect(protocolSatisfies("1.4.0", simulationManifest.contract ?? "")).toBe(true)
  })

  it("il producer del test usa sempre un full SHA reale del checkout", () => {
    expect(studioProducerIdentity().commitSha).toMatch(/^[0-9a-f]{40}$/)
  })
})
