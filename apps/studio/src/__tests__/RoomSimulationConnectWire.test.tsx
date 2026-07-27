// @vitest-environment jsdom
// Sessione 2 — il gesto live non applica più una patch ottimistica nel canvas:
// attraversa SDK/MessageChannel, ToolHost, runtime/provider reale e solo dopo
// una receipt coerente aggiorna il marker posseduto sulla board.

import { act, cleanup, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

type CapturedCanvasProps = {
  experiment: {
    components: Array<{ id: string }>
    connections: Array<{ from: string; to: string }>
  }
  onComponentAdd?: (
    type: string,
    position: { x: number; y: number },
  ) => string | null
  onConnectionAdd?: (from: string, to: string) => void
}

const rendered: CapturedCanvasProps[] = []
vi.mock("@elab-tutor-plugin/plugin/renderEmbeddable", () => ({
  renderEmbeddable: (_node: HTMLElement, props: CapturedCanvasProps) => {
    rendered.push(props)
    return { dispose() {} }
  },
}))

import {
  createBoardSceneWithPlacements,
  createReferenceSimulationScene,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"
import { applyRoomSimulationConnectWire } from "../roomSimulationComposition"
import { readAuditLog } from "../toolhost/audit"
import { addToKillList } from "../toolhost/killList"
import { EMBED_DATA_KEY, type BoardElementLike } from "../toolhost/caps/board"
import type { SimulationApplyOperationParams } from "../toolhost-protocol"
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest"

afterEach(() => {
  cleanup()
  rendered.length = 0
})

class MemoryStore {
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

  async list(prefix?: string): Promise<Array<{ path: string; data: Blob }>> {
    return [...this.files.entries()]
      .filter(([path]) => prefix === undefined || path.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

function shortCircuitOperation(
  suffix: string,
): SimulationApplyOperationParams["operation"] {
  return {
    schema: "simulation-operation/1",
    id: `session-2:live-short:${suffix}`,
    actor: "manual",
    origin: "canvas",
    targetProvider: "local",
    providerMode: "static",
    operation: {
      kind: "connect-wire",
      wire: {
        id: `session-2-live-short-${suffix}`,
        from: "bat1:positive",
        to: "bat1:negative",
        color: "red",
      },
    },
  }
}

function providerDigest(scene: ReturnType<typeof createReferenceSimulationScene>): string {
  return simulationSceneDigest({
    components: scene.components.map(({ id, type, value }) => ({ id, type, value })),
    connections: scene.connections.map(({ from, to }) => ({ from, to })),
    pinAssignments: scene.pinAssignments,
  })
}

function boardHarness({
  embedId = "elab-v1-cap6-esp1-first-led",
  state,
}: {
  embedId?: string
  state?: unknown
} = {}) {
  let elements: BoardElementLike[] = [
    createToolEmbedElement({
      embedId,
      ...(state === undefined ? {} : { state }),
    }) as BoardElementLike,
  ]
  const board = {
    getSceneElements: () => elements,
    getAppState: () => ({ selectedElementIds: {} }),
    updateScene: (next: { elements: BoardElementLike[] }) => {
      elements = next.elements
    },
  }
  const binding = () => {
    const marker = elements[0]?.customData?.[EMBED_DATA_KEY] as {
      owner: string
      state: {
        kind: string
        scene: ReturnType<typeof createReferenceSimulationScene>
        montaggio?: { placements: Array<{ id: string; type: "resistor" | "led" | "wire"; holes: [string, string] }> }
      }
    }
    return marker
  }
  return { board, binding, json: () => JSON.stringify(elements) }
}

describe("Room live Simulation connect-wire", () => {
  it("attraversa ToolHost/provider reale e persiste soltanto la scena accettata", async () => {
    const store = new MemoryStore()
    const harness = boardHarness()
    const before = harness.binding().state.scene

    const applied = await applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: before,
        operation: shortCircuitOperation("a"),
      },
    )

    expect(applied.result).toMatchObject({
      roomId: "session-2-room-a",
      operationId: "session-2:live-short:a",
      accepted: true,
      receipt: {
        pluginId: "io.ardesia.simulation",
        instanceId: expect.stringMatching(/^[0-9a-f]{64}$/),
      },
      solveOutcome: {
        ok: false,
        provider: "local",
        solverDiagnostics: { shortCircuit: true },
      },
    })
    expect(harness.binding().state.scene).toEqual(applied.scene)
    expect(applied.result.receipt.sceneDigest).toBe(providerDigest(applied.scene))
    expect(harness.binding().state.scene.connections.at(-1)).toMatchObject({
      id: "session-2-live-short-a",
      from: "bat1:positive",
      to: "bat1:negative",
      kind: "wire",
    })
    expect((await readAuditLog(store, "io.ardesia.simulation")).entries.map(
      ({ method, outcome }) => ({ method, outcome }),
    )).toEqual([
      { method: "simulation.loadScene", outcome: "ok" },
      { method: "simulation.applyOperation", outcome: "ok" },
      { method: "board.write", outcome: "ok" },
    ])
  })

  it("un'operazione rigettata dal runtime non scrive la board e rilascia la coda", async () => {
    const store = new MemoryStore()
    const harness = boardHarness()
    const original = structuredClone(harness.binding().state.scene)
    const before = harness.json()
    const rejectedOperation = shortCircuitOperation("rejected")
    if (rejectedOperation.operation.kind !== "connect-wire") {
      throw new Error("test precondition: expected connect-wire")
    }
    rejectedOperation.operation.wire.from = "ghost:missing"

    await expect(applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: original,
        operation: rejectedOperation,
      },
    )).rejects.toThrow(/operation .* rejected/i)

    expect(harness.json()).toBe(before)
    await waitFor(async () => {
      expect((await readAuditLog(store, "io.ardesia.simulation")).entries.map(
        ({ method, outcome }) => ({ method, outcome }),
      )).toEqual([
        { method: "simulation.loadScene", outcome: "ok" },
        { method: "simulation.applyOperation", outcome: "error" },
      ])
    })

    const accepted = await applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: original,
        operation: shortCircuitOperation("after-reject"),
      },
    )
    expect(accepted.result.accepted).toBe(true)
    expect((await readAuditLog(store, "io.ardesia.simulation")).entries.filter(
      (entry) => entry.method === "board.write",
    )).toHaveLength(1)
  })

  it("nega scene stantie e richieste concorrenti senza write-back aggiuntivi", async () => {
    const store = new MemoryStore()
    const harness = boardHarness()
    const original = structuredClone(harness.binding().state.scene)
    const first = applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: original,
        operation: shortCircuitOperation("first"),
      },
    )
    const concurrent = applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: original,
        operation: shortCircuitOperation("concurrent"),
      },
    )
    await expect(concurrent).rejects.toThrow(/already pending/)
    await first
    const afterFirst = harness.json()

    await expect(applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: original,
        operation: shortCircuitOperation("stale"),
      },
    )).rejects.toThrow(/stale live scene/)
    expect(harness.json()).toBe(afterFirst)
    expect((await readAuditLog(store, "io.ardesia.simulation")).entries.filter(
      (entry) => entry.method === "board.write",
    )).toHaveLength(1)
  })

  it("serializza due istanze sullo stesso audit senza perdere righe", async () => {
    const store = new MemoryStore()
    const first = boardHarness()
    const secondId = "elab-v1-cap6-esp1-first-led--2"
    const second = boardHarness({ embedId: secondId })

    await Promise.all([
      applyRoomSimulationConnectWire(
        { roomId: "session-2-room-a", store, board: first.board },
        {
          toolId: "io.ardesia.simulation",
          embedId: "elab-v1-cap6-esp1-first-led",
          scene: first.binding().state.scene,
          operation: shortCircuitOperation("audit-a"),
        },
      ),
      applyRoomSimulationConnectWire(
        { roomId: "session-2-room-a", store, board: second.board },
        {
          toolId: "io.ardesia.simulation",
          embedId: secondId,
          scene: second.binding().state.scene,
          operation: shortCircuitOperation("audit-b"),
        },
      ),
    ])

    const audit = await readAuditLog(store, "io.ardesia.simulation")
    expect(audit.malformed).toBe(0)
    expect(audit.entries.map((entry) => entry.method)).toEqual([
      "simulation.loadScene",
      "simulation.applyOperation",
      "board.write",
      "simulation.loadScene",
      "simulation.applyOperation",
      "board.write",
    ])
  })

  it("risolve sul montaggio attivo ma persiste una sola scena base senza duplicarlo", async () => {
    const store = new MemoryStore()
    const baseScene = createReferenceSimulationScene()
    const placements = [
      {
        id: "r-libero-1",
        type: "resistor" as const,
        holes: ["bb1:c3", "bb1:c4"] as [string, string],
      },
    ]
    const state = {
      kind: "simulation-scene-v1",
      scene: baseScene,
      montaggio: { placements },
    }
    const harness = boardHarness({ state })
    const activeScene = createBoardSceneWithPlacements(baseScene, placements)

    const applied = await applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: harness.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: activeScene,
        operation: shortCircuitOperation("montaggio"),
      },
    )

    const persisted = harness.binding().state
    expect(persisted.montaggio?.placements).toEqual(placements)
    expect(persisted.scene.components).toHaveLength(baseScene.components.length)
    expect(persisted.scene.connections).toHaveLength(baseScene.connections.length + 1)
    expect(createBoardSceneWithPlacements(
      persisted.scene,
      persisted.montaggio!.placements,
    )).toEqual(applied.scene)
  })

  it("nega kill-list e connection kind lossy prima di qualunque write-back", async () => {
    const revokedStore = new MemoryStore()
    const revoked = boardHarness()
    const revokedBytes = revoked.json()
    await addToKillList(
      revokedStore,
      "io.ardesia.simulation",
      "session-2-test",
      () => 1,
    )
    await expect(applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store: revokedStore, board: revoked.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: revoked.binding().state.scene,
        operation: shortCircuitOperation("revoked"),
      },
    )).rejects.toThrow(/revoked/)
    expect(revoked.json()).toBe(revokedBytes)

    const internalStore = new MemoryStore()
    const internalScene = createReferenceSimulationScene()
    internalScene.connections[0] = { ...internalScene.connections[0]!, kind: "internal" }
    const internal = boardHarness({
      state: { kind: "simulation-scene-v1", scene: internalScene },
    })
    const internalBytes = internal.json()
    await expect(applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store: internalStore, board: internal.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: internalScene,
        operation: shortCircuitOperation("internal"),
      },
    )).rejects.toThrow(/connection kind/)
    expect(internal.json()).toBe(internalBytes)
    expect(await readAuditLog(internalStore, "io.ardesia.simulation")).toEqual({
      entries: [],
      malformed: 0,
    })
  })

  it("mantiene room, instance receipt e board isolate anche sullo stesso store", async () => {
    const store = new MemoryStore()
    const roomA = boardHarness()
    const roomB = boardHarness()
    const roomABytes = roomA.json()
    const roomBBytes = roomB.json()

    const resultB = await applyRoomSimulationConnectWire(
      { roomId: "session-2-room-b", store, board: roomB.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: roomB.binding().state.scene,
        operation: shortCircuitOperation("room-b"),
      },
    )

    expect(roomA.json()).toBe(roomABytes)
    expect(roomB.json()).not.toBe(roomABytes)
    const roomBAfterOwnMutation = roomB.json()
    const resultA = await applyRoomSimulationConnectWire(
      { roomId: "session-2-room-a", store, board: roomA.board },
      {
        toolId: "io.ardesia.simulation",
        embedId: "elab-v1-cap6-esp1-first-led",
        scene: roomA.binding().state.scene,
        operation: shortCircuitOperation("room-a"),
      },
    )

    expect(roomA.json()).not.toBe(roomABytes)
    expect(roomB.json()).toBe(roomBAfterOwnMutation)
    expect(roomBAfterOwnMutation).not.toBe(roomBBytes)
    expect((roomA.binding().state.scene.connections.at(-1) as { id?: string })?.id).toBe(
      "session-2-live-short-room-a",
    )
    expect((roomB.binding().state.scene.connections.at(-1) as { id?: string })?.id).toBe(
      "session-2-live-short-room-b",
    )
    expect(resultA.result.roomId).toBe("session-2-room-a")
    expect(resultB.result.roomId).toBe("session-2-room-b")
    expect(resultA.result.receipt.instanceId).not.toBe(
      resultB.result.receipt.instanceId,
    )
    const audit = await readAuditLog(store, "io.ardesia.simulation")
    expect(audit.malformed).toBe(0)
    expect(audit.entries.map((entry) => entry.method)).toEqual([
      "simulation.loadScene",
      "simulation.applyOperation",
      "board.write",
      "simulation.loadScene",
      "simulation.applyOperation",
      "board.write",
    ])
  })

  it("ToolCanvas non muta né persiste prima della receipt e non ha fallback sul reject", async () => {
    const persist = vi.fn()
    let resolveApply!: (value: unknown) => void
    const pending = new Promise((resolve) => {
      resolveApply = resolve
    })
    const applyConnectWire = vi.fn((_request: unknown) => pending)
    const element = createToolEmbedElement()
    const view = renderToolCanvasEmbeddable(element as never, {
      persistEmbedState: persist,
      applyConnectWire: applyConnectWire as never,
    })
    if (view === null) throw new Error("simulation embed not rendered")
    const mounted = render(view)
    await waitFor(() => expect(rendered.length).toBeGreaterThan(0))
    const baseline = rendered.at(-1)!.experiment.connections.length
    const operationMarker = () => mounted.container.querySelector(
      "[data-elab-canvas-last-operation]",
    )?.getAttribute("data-elab-canvas-last-operation") ?? null

    act(() => rendered.at(-1)!.onConnectionAdd!("bat1:positive", "bat1:negative"))
    act(() => rendered.at(-1)!.onConnectionAdd!("bat1:positive", "bat1:negative"))
    await waitFor(() => expect(applyConnectWire).toHaveBeenCalledTimes(1))
    expect(rendered.at(-1)!.experiment.connections).toHaveLength(baseline)
    const componentBaseline = rendered.at(-1)!.experiment.components.length
    let concurrentComponentId: string | null | undefined
    act(() => {
      concurrentComponentId = rendered.at(-1)!.onComponentAdd?.(
        "resistor",
        { x: 120, y: 160 },
      )
    })
    expect(concurrentComponentId).toBeNull()
    expect(rendered.at(-1)!.experiment.components).toHaveLength(componentBaseline)
    expect(operationMarker()).toBeNull()
    expect(persist).not.toHaveBeenCalled()

    const request = applyConnectWire.mock.calls[0]![0] as {
      scene: ReturnType<typeof createReferenceSimulationScene>
      operation: SimulationApplyOperationParams["operation"]
    }
    const acceptedScene = {
      ...request.scene,
      connections: [
        ...request.scene.connections,
        {
          id: request.operation.operation.kind === "connect-wire"
            ? request.operation.operation.wire.id
            : "unreachable",
          from: "bat1:positive",
          to: "bat1:negative",
          color: "red",
          kind: "wire" as const,
        },
      ],
    }
    await act(async () => resolveApply({
      scene: acceptedScene,
      result: {
        operationId: request.operation.id,
        roomId: "session-2-room-a",
        accepted: true,
        receipt: {
          apiVersion: "simulation-runtime/1",
          pluginId: "io.ardesia.simulation",
          instanceId: "elab-v1-cap6-esp1-first-led",
          sceneDigest: "accepted-digest",
        },
        solveOutcome: {},
        diagnostics: {},
      },
    }))
    await waitFor(() =>
      expect(rendered.at(-1)!.experiment.connections).toHaveLength(baseline + 1),
    )
    expect(operationMarker()).toBe(request.operation.id)
    expect(persist).not.toHaveBeenCalled()
    act(() => rendered.at(-1)!.onConnectionAdd!("bat1:positive", "bat1:negative"))
    await waitFor(() => expect(applyConnectWire).toHaveBeenCalledTimes(2))
    await act(async () => Promise.resolve())
    mounted.unmount()

    const rejected = vi.fn(() => Promise.reject(new Error("host rejected")))
    const beforeRejectedMount = rendered.length
    const rejectedView = renderToolCanvasEmbeddable(createToolEmbedElement() as never, {
      persistEmbedState: persist,
      applyConnectWire: rejected as never,
    })
    const rejectedMount = render(rejectedView!)
    await waitFor(() => expect(rendered.length).toBeGreaterThan(beforeRejectedMount))
    const rejectedProps = rendered.at(-1)!
    const rejectedBaseline = rejectedProps.experiment.connections.length
    act(() => rejectedProps.onConnectionAdd!("bat1:positive", "bat1:negative"))
    await waitFor(() => expect(rejected).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(rejectedMount.container.querySelector(
      "[data-elab-canvas-experiment-id][data-elab-core-canvas-mounted]",
    )?.getAttribute("data-elab-core-canvas-mounted")).toBe("error"))
    act(() => rejectedProps.onConnectionAdd!("bat1:positive", "bat1:negative"))
    await waitFor(() => expect(rejected).toHaveBeenCalledTimes(2))
    expect(rejectedProps.experiment.connections).toHaveLength(rejectedBaseline)
    expect(persist).not.toHaveBeenCalled()

    const beforeNoHostMount = rendered.length
    render(renderToolCanvasEmbeddable(createToolEmbedElement() as never, {
      persistEmbedState: persist,
    })!)
    await waitFor(() => expect(rendered.length).toBeGreaterThan(beforeNoHostMount))
    const noHostProps = rendered.at(-1)!
    const noHostBaseline = noHostProps.experiment.connections.length
    act(() => noHostProps.onConnectionAdd!("bat1:positive", "bat1:negative"))
    await act(async () => Promise.resolve())
    expect(noHostProps.experiment.connections).toHaveLength(noHostBaseline)
    expect(persist).not.toHaveBeenCalled()
  })
})
