// @vitest-environment jsdom

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createElement } from "react"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import {
  createMultiPostitWorkbenchPostits,
  isElabTutorPostitState,
  isSimulationPostitState,
} from "../design/multiPostitWorkbenchModel"
import {
  createPluginPostitBoardScene,
  loadPluginPostitBoardHydrationFromStore,
  pluginPostitBoardElementId,
  restorePluginPostitsFromBoardScene,
  type PluginPostitBoardScene,
} from "../design/multiPostitBoardPersistence"
import { deriveFunctionSurfaceMode, pluginPostitControlIds } from "../toolhost/postitObject"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import { normalizeDuplicatedToolEmbeds } from "../toolhost/ToolCanvasEmbeddable"
import { renderPluginPostitBoardEmbeddable } from "../toolhost/pluginPostitBoardRender"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { FileEntry, WorkspaceDriver } from "../store/types"
import { exportLesson, importLesson } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest"

const ROOM = "plugin-postit-board-room"

afterEach(() => {
  cleanup()
})

class MockDriver implements WorkspaceDriver {
  readonly name = "mock"
  private store = new Map<string, ArrayBuffer>()
  private mtim = new Map<string, number>()

  available(): boolean {
    return true
  }

  async init(): Promise<boolean> {
    return true
  }

  async read(path: string): Promise<Blob | null> {
    const raw = this.store.get(path)
    return raw === undefined ? null : new Blob([raw])
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
      if (prefix !== undefined && !path.startsWith(prefix)) continue
      entries.push({
        path,
        data: new Blob([buf]),
        mtime: this.mtim.get(path) ?? 0,
      })
    }
    return entries
  }

  getLegacyScene(): string | null {
    return null
  }

  setLegacyScene(): void {}
}

function withMockDriver(store: WorkspaceStore, mock: MockDriver) {
  const writableStore = store as unknown as {
    driver: WorkspaceDriver
    fallback: MockDriver
    _mode: "localStorage"
  }
  writableStore.driver = mock
  writableStore.fallback = mock
  writableStore._mode = "localStorage"
}

function createStore(): WorkspaceStore {
  const store = new WorkspaceStore()
  withMockDriver(store, new MockDriver())
  return store
}

async function seedRequiredLessonArtifacts(store: WorkspaceStore, room: string): Promise<void> {
  await store.write(
    roomPaths(room).journal,
    new Blob(['{"t":1,"type":"t0"}\n'], { type: "application/x-ndjson" }),
  )
  await store.saveSessionYaml("v: 1\ncreated: 1\naudioConsent: false\n")
}

type ToolEmbedLike = {
  id?: string
  link?: string | null
  customData?: Record<string, unknown> | null
}

type Rect = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

function expectRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be a record`)
  }
  return value as Record<string, unknown>
}

function overlappingPairs(rects: readonly Rect[]): string[] {
  const pairs: string[] = []
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!
      const b = rects[j]!
      const overlaps =
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      if (overlaps) pairs.push(`${a.id}:${b.id}`)
    }
  }
  return pairs
}

describe("Board plugin post-it persistence", () => {
  it("emits full Excalidraw embeddables that survive ToolCanvas duplicate normalization", () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)
    const postitsByInstance = new Map(postits.map((postit) => [postit.instanceId, postit]))

    for (const element of boardScene.elements) {
      const rawElement = element as unknown as Record<string, unknown>
      const customData = expectRecord(rawElement.customData, "plugin post-it customData")
      const marker = expectRecord(customData[EMBED_DATA_KEY], "plugin post-it marker")
      const state = expectRecord(marker.state, "plugin post-it marker state")
      const instanceId = state.instanceId
      if (typeof instanceId !== "string") {
        throw new Error("plugin post-it state instanceId must be a string")
      }
      const sourcePostit = postitsByInstance.get(instanceId)
      if (sourcePostit === undefined) {
        throw new Error(`missing source post-it for ${instanceId}`)
      }

      expect(element.id).toBe(pluginPostitBoardElementId(instanceId))
      expect(element.link).toBe(`maestro-tool://${sourcePostit.pluginId}/${element.id}`)
      expect(rawElement.angle).toBe(0)
      expect(rawElement.strokeColor).toBeTypeOf("string")
      expect(rawElement.backgroundColor).toBeTypeOf("string")
      expect(rawElement.fillStyle).toBe("solid")
      expect(rawElement.strokeWidth).toBeTypeOf("number")
      expect(rawElement.strokeStyle).toBe("solid")
      expect(rawElement.roughness).toBeTypeOf("number")
      expect(rawElement.opacity).toBe(100)
      expect(rawElement.roundness).toEqual({ type: 3 })
      expect(rawElement.seed).toBeTypeOf("number")
      expect(rawElement.version).toBe(1)
      expect(rawElement.versionNonce).toBeTypeOf("number")
      expect(rawElement.index).toBeNull()
      expect(rawElement.isDeleted).toBe(false)
      expect(rawElement.groupIds).toEqual([])
      expect(rawElement.frameId).toBeNull()
      expect(rawElement.boundElements).toBeNull()
      expect(rawElement.updated).toBeTypeOf("number")
      expect(rawElement.locked).toBe(false)
    }

    const normalization = normalizeDuplicatedToolEmbeds(
      boardScene.elements.map((element) => element as unknown as ToolEmbedLike),
    )
    expect(normalization.changed).toBe(false)
    expect(normalization.elements.map((element) => element.link)).toEqual(
      boardScene.elements.map((element) => element.link),
    )

    expect(restorePluginPostitsFromBoardScene(boardScene).map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])
  })

  it("emits default production-helper board bounds without incoherent post-it overlap", () => {
    const boardScene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())

    expect(overlappingPairs(boardScene.elements)).toEqual([])
  })

  it("round-trips Simulation and ELABTutor post-it objects through board.excalidraw .lesson export/import", async () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)

    const boardResizedScene = {
      ...boardScene,
      elements: boardScene.elements.map((element) => {
        if (element.id === pluginPostitBoardElementId("sim-a")) {
          return { ...element, x: 84, y: 126, width: 260, height: 180 }
        }
        if (element.id === pluginPostitBoardElementId("sim-b")) {
          return { ...element, x: 384, y: 126, width: 960, height: 560 }
        }
        return element
      }),
    }

    const simAMarker = boardResizedScene.elements.find(
      (element) => element.id === pluginPostitBoardElementId("sim-a"),
    )?.customData?.[EMBED_DATA_KEY]
    expect(simAMarker).toMatchObject({
      owner: "io.ardesia.simulation#sim-a",
      schema: "plugin-postit-board-state/1",
    })

    const store = createStore()
    await store.saveScene(ROOM, JSON.stringify(boardResizedScene))
    await seedRequiredLessonArtifacts(store, ROOM)
    const bundle = await exportLesson(store, ROOM)

    const restoredStore = createStore()
    await importLesson(restoredStore, bundle)
    const restoredSceneText = await restoredStore.loadScene(ROOM)
    expect(restoredSceneText).not.toBeNull()

    const restoredPostits = restorePluginPostitsFromBoardScene(JSON.parse(restoredSceneText!))
    expect(restoredPostits.map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])

    const simA = restoredPostits[0]
    const simB = restoredPostits[1]
    const elabTutor = restoredPostits[2]
    expect(simA.bounds).toMatchObject({ x: 84, y: 126, width: 260, height: 180 })
    expect(simB.bounds).toMatchObject({ x: 384, y: 126, width: 960, height: 560 })
    expect(deriveFunctionSurfaceMode(simA)).toBe("compact")
    expect(deriveFunctionSurfaceMode(simB)).toBe("expanded")

    if (!isSimulationPostitState(simA.pluginState)) throw new Error("sim-a state not restored")
    if (!isSimulationPostitState(simB.pluginState)) throw new Error("sim-b state not restored")
    if (!isElabTutorPostitState(elabTutor.pluginState)) throw new Error("ELABTutor state not restored")

    expect(simA.pluginState.providerOutput.instanceId).toBe("sim-a")
    expect(simA.pluginState.providerOutput.providerId).toBe("local")
    expect(simA.pluginState.providerOutput.solverOutput.currents.led).toBe(0.0153)
    expect(simA.pluginState.providerStatus).toEqual({ id: "local", available: true })
    expect(simA.pluginState.runtimeState).toMatchObject({
      schema: "simulation-runtime-state/1",
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      lastSolverResult: {
        provider: "local",
        currents: { led: 0.0153 },
      },
    })
    expect(simA.pluginState.runtimeState.scene.components?.map((component) => component.id)).toEqual([
      "battery",
      "resistor",
      "led",
    ])
    expect(simA.pluginState.runtimeState.diagnostics).toContain("local solver available")
    expect(simA.pluginState.sceneDigest).toBe(simulationSceneDigest({
      components: simA.pluginState.runtimeState.scene.components!,
      connections: simA.pluginState.runtimeState.scene.connections!,
      pinAssignments: simA.pluginState.runtimeState.scene.pinAssignments,
    }))
    expect(simB.pluginState.providerOutput.instanceId).toBe("sim-b")
    expect(simB.pluginState.providerOutput.providerId).toBe("fastapi")
    expect(simB.pluginState.providerStatus).toEqual({
      id: "fastapi",
      available: false,
      reason: "FastAPI provider hub not configured",
    })
    expect(simB.pluginState.runtimeState).toMatchObject({
      schema: "simulation-runtime-state/1",
      instanceId: "sim-b",
      pluginId: "io.ardesia.simulation",
      lastSolverResult: {
        provider: "fastapi",
        ok: false,
      },
    })
    expect(elabTutor.pluginState.simulationInstanceId).toBe("sim-a")
    expect(elabTutor.pluginState.runtimeApi).toBe("simulation-runtime/1")

    const ids = restoredPostits.flatMap((postit) => Object.values(pluginPostitControlIds(postit)))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("rejects a canonical Simulation marker whose persisted digest is stale", () => {
    const scene = createPluginPostitBoardScene(
      createMultiPostitWorkbenchPostits(),
    )
    const simulationElement = scene.elements.find(
      (element) => element.id === pluginPostitBoardElementId("sim-a"),
    )
    if (simulationElement === undefined) {
      throw new Error("test precondition: sim-a board element missing")
    }
    const tampered = structuredClone(scene)
    const tamperedElement = tampered.elements.find(
      (element) => element.id === simulationElement.id,
    )!
    const pluginState = tamperedElement.customData[EMBED_DATA_KEY].state
      .pluginState as { sceneDigest?: string }
    pluginState.sceneDigest = "00000000"

    expect(() => restorePluginPostitsFromBoardScene(tampered)).toThrow(
      /invalid Simulation state/i,
    )
  })

  it("imports a .lesson into a new store and renders the restored Room embeddables", async () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)
    const sourceScene = {
      ...boardScene,
      elements: boardScene.elements.map((element) => {
        if (element.id === pluginPostitBoardElementId("sim-a")) {
          return { ...element, x: 92, y: 132, width: 260, height: 180 }
        }
        if (element.id === pluginPostitBoardElementId("sim-b")) {
          return { ...element, x: 392, y: 132, width: 960, height: 560 }
        }
        return element
      }),
    }

    const sourceStore = createStore()
    await sourceStore.saveScene(ROOM, JSON.stringify(sourceScene))
    await seedRequiredLessonArtifacts(sourceStore, ROOM)
    const bundle = await exportLesson(sourceStore, ROOM)

    const importedStore = createStore()
    await importLesson(importedStore, bundle)

    const hydration = await loadPluginPostitBoardHydrationFromStore(importedStore, ROOM)
    expect(hydration.renderModels.map((model) => `${model.pluginId}:${model.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])
    expect(hydration.renderModels.map((model) => model.owner)).toEqual([
      "io.ardesia.simulation#sim-a",
      "io.ardesia.simulation#sim-b",
      "io.elab.tutor#elab-consumer",
    ])
    expect(hydration.renderModels.map((model) => model.functionSurfaceMode)).toEqual([
      "compact",
      "expanded",
      "normal",
    ])
    expect(hydration.renderModels[0]?.providerOutput).toMatchObject({
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      providerId: "local",
      solverOutput: { currents: { led: 0.0153 } },
    })
    expect(hydration.renderModels[0]?.providerStatus).toEqual({ id: "local", available: true })
    expect(hydration.renderModels[0]?.runtimeState).toMatchObject({
      schema: "simulation-runtime-state/1",
      instanceId: "sim-a",
      lastSolverResult: {
        provider: "local",
      },
    })
    expect(hydration.renderModels[1]?.providerOutput).toMatchObject({
      instanceId: "sim-b",
      pluginId: "io.ardesia.simulation",
      providerId: "fastapi",
    })
    expect(hydration.renderModels[1]?.providerStatus).toEqual({
      id: "fastapi",
      available: false,
      reason: "FastAPI provider hub not configured",
    })
    expect(hydration.renderModels[1]?.runtimeState?.lastSolverResult?.providerDiagnostics).toEqual([
      {
        code: "provider-unavailable",
        severity: "blocker",
        message: "FastAPI provider hub not configured",
      },
    ])
    expect(hydration.renderModels[2]?.elabTutorRuntime).toEqual({
      runtimeApi: "simulation-runtime/1",
      simulationInstanceId: "sim-a",
    })

    const importedSceneText = await importedStore.loadScene(ROOM)
    expect(importedSceneText).not.toBeNull()
    const importedScene = JSON.parse(importedSceneText!) as PluginPostitBoardScene
    const renderedPostits = importedScene.elements
      .map((element) => renderPluginPostitBoardEmbeddable(element))
      .filter((node): node is NonNullable<typeof node> => node !== null)
    const { container } = render(createElement("div", null, ...renderedPostits))

    expect(
      Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
        node.getAttribute("data-plugin-postit-instance"),
      ),
    ).toEqual(["sim-a", "sim-b", "elab-consumer"])
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.ardesia.simulation"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.elab.tutor"]')).toHaveLength(1)
    expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("compact")
    expect(container.querySelector('[data-function-surface-instance="sim-b"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("expanded")
    expect(container.querySelector("[data-provider-output-instance='sim-a']")?.textContent).toContain("local")
    expect(container.querySelector("[data-provider-output-instance='sim-b']")?.textContent).toContain("fastapi")
    expect(container.querySelector("[data-solver-output-instance='sim-a']")?.textContent).toContain("0.0153")
    expect(container.querySelector("[data-elabtutor-runtime-api]")?.getAttribute(
      "data-elabtutor-runtime-api",
    )).toBe("simulation-runtime/1")

    const ids = Array.from(container.querySelectorAll("[id^='plugin-postit-']")).map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("normalizes imported .lesson board scene into the target room path before Room hydration", async () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)
    const importedRoom = "imported-postit-room"
    const sourceStore = createStore()
    await sourceStore.saveScene(importedRoom, JSON.stringify(boardScene))
    await seedRequiredLessonArtifacts(sourceStore, importedRoom)
    const bundle = await exportLesson(sourceStore, importedRoom)

    const importedStore = createStore()
    await importedStore.importLessonBlobForRoom(bundle, importedRoom)

    const roomSceneBlob = await importedStore.read(`raw/${importedRoom}/board.excalidraw`)
    expect(roomSceneBlob).not.toBeNull()
    const roomScene = JSON.parse(await roomSceneBlob!.text()) as PluginPostitBoardScene
    const restoredPostits = restorePluginPostitsFromBoardScene(roomScene)

    expect(restoredPostits.map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])

    const hydration = await loadPluginPostitBoardHydrationFromStore(importedStore, importedRoom)
    expect(hydration.renderModels.map((model) => `${model.pluginId}:${model.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])
  })

  it("adapter source imports no private simulator or ELABTutor runtime internals", () => {
    const source = readFileSync(
      join(process.cwd(), "src", "design", "multiPostitBoardPersistence.ts"),
      "utf8",
    )

    expect(source).toContain("EMBED_DATA_KEY")
    expect(source).toContain("loadPluginPostitBoardHydrationFromStore")
    expect(source).not.toMatch(
      /\b(?:CircuitSolver|AVRBridge|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|simulationProviders)\b/,
    )
    expect(source).not.toMatch(/@elab-tutor-plugin|sim\/solver|components\/simulator/)
  })

  it("hydrates a persisted board scene into Room-consumable plugin post-it render models", async () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)
    const roomScene = {
      ...boardScene,
      elements: [
        ...boardScene.elements.map((element) => {
          if (element.id === pluginPostitBoardElementId("sim-a")) {
            return { ...element, x: 88, y: 144, width: 260, height: 180 }
          }
          if (element.id === pluginPostitBoardElementId("sim-b")) {
            return { ...element, x: 380, y: 144, width: 960, height: 560 }
          }
          return element
        }),
        {
          id: "teacher-note",
          type: "rectangle",
          x: 20,
          y: 20,
          width: 120,
          height: 80,
          customData: {},
        },
      ],
    }

    const store = createStore()
    await store.saveScene(ROOM, JSON.stringify(roomScene))

    const hydration = await loadPluginPostitBoardHydrationFromStore(store, ROOM)

    expect(hydration.room).toBe(ROOM)
    expect(hydration.sceneType).toBe("excalidraw")
    expect(hydration.renderModels.map((model) => `${model.pluginId}:${model.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
      "io.ardesia.simulation:sim-b",
      "io.elab.tutor:elab-consumer",
    ])
    expect(hydration.renderModels.map((model) => model.elementId)).toEqual([
      pluginPostitBoardElementId("sim-a"),
      pluginPostitBoardElementId("sim-b"),
      pluginPostitBoardElementId("elab-consumer"),
    ])
    expect(hydration.renderModels.map((model) => model.owner)).toEqual([
      "io.ardesia.simulation#sim-a",
      "io.ardesia.simulation#sim-b",
      "io.elab.tutor#elab-consumer",
    ])

    const simA = hydration.renderModels[0]
    const simB = hydration.renderModels[1]
    const elabTutor = hydration.renderModels[2]

    expect(simA.bounds).toMatchObject({ x: 88, y: 144, width: 260, height: 180 })
    expect(simA.functionSurfaceMode).toBe("compact")
    expect(simA.providerOutput).toMatchObject({
      instanceId: "sim-a",
      pluginId: "io.ardesia.simulation",
      providerId: "local",
      solverOutput: { currents: { led: 0.0153 } },
    })
    expect(simB.bounds).toMatchObject({ x: 380, y: 144, width: 960, height: 560 })
    expect(simB.functionSurfaceMode).toBe("expanded")
    expect(simB.providerOutput).toMatchObject({
      instanceId: "sim-b",
      providerId: "fastapi",
    })
    expect(elabTutor.functionSurfaceMode).toBe("normal")
    expect(elabTutor.elabTutorRuntime).toEqual({
      runtimeApi: "simulation-runtime/1",
      simulationInstanceId: "sim-a",
    })
    expect(elabTutor.providerOutput).toBeUndefined()

    const ids = hydration.renderModels.flatMap((model) => Object.values(model.controlIds))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("renders persisted plugin post-it board elements through the ToolCanvas embeddable path", () => {
    const postits = createMultiPostitWorkbenchPostits()
    const boardScene = createPluginPostitBoardScene(postits)
    const roomScene = {
      ...boardScene,
      elements: boardScene.elements.map((element) => {
        if (element.id === pluginPostitBoardElementId("sim-a")) {
          return { ...element, x: 88, y: 144, width: 260, height: 180 }
        }
        if (element.id === pluginPostitBoardElementId("sim-b")) {
          return { ...element, x: 380, y: 144, width: 960, height: 560 }
        }
        return element
      }),
    }

    const renderedPostits = roomScene.elements
      .map((element) => renderPluginPostitBoardEmbeddable(element))
      .filter((node): node is NonNullable<typeof node> => node !== null)
    const { container } = render(createElement("div", null, ...renderedPostits))

    expect(
      Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
        node.getAttribute("data-plugin-postit-instance"),
      ),
    ).toEqual(["sim-a", "sim-b", "elab-consumer"])
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.ardesia.simulation"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-plugin-postit-plugin="io.elab.tutor"]')).toHaveLength(1)
    expect(container.querySelector('[data-function-surface-instance="sim-a"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("compact")
    expect(container.querySelector('[data-function-surface-instance="sim-b"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("expanded")
    expect(container.querySelector('[data-function-surface-instance="elab-consumer"]')?.getAttribute(
      "data-function-surface-mode",
    )).toBe("normal")
    expect(container.querySelector('[data-provider-output-instance="sim-a"]')?.textContent).toContain("local")
    expect(container.querySelector('[data-provider-output-instance="sim-b"]')?.textContent).toContain("fastapi")
    expect(container.querySelector('[data-solver-output-instance="sim-a"]')?.textContent).toContain("0.0153")
    expect(container.querySelector("[data-elabtutor-simulation-instance]")?.getAttribute(
      "data-elabtutor-simulation-instance",
    )).toBe("sim-a")
    expect(container.querySelector("[data-elabtutor-runtime-api]")?.getAttribute(
      "data-elabtutor-runtime-api",
    )).toBe("simulation-runtime/1")

    const ids = Array.from(container.querySelectorAll("[id^='plugin-postit-']")).map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)

    const bridgePath = join(process.cwd(), "src", "toolhost", "pluginPostitBoardRender.tsx")
    expect(existsSync(bridgePath)).toBe(true)
    const bridgeSource = readFileSync(bridgePath, "utf8")
    const toolCanvasSource = readFileSync(
      join(process.cwd(), "src", "toolhost", "ToolCanvasEmbeddable.tsx"),
      "utf8",
    )
    expect(bridgeSource).toContain("PLUGIN_POSTIT_BOARD_STATE_SCHEMA")
    expect(toolCanvasSource).toContain("renderPluginPostitBoardEmbeddable")
    expect(bridgeSource).not.toMatch(
      /\b(?:CircuitSolver|AVRBridge|SimulatorCanvas|Breadboard|PlacementEngine|WireRenderer|simulationProviders)\b/,
    )
    expect(bridgeSource).not.toMatch(/@elab-tutor-plugin|sim\/solver|components\/simulator/)
  })

  it("renders plugin post-it board markers when Room passes a normalized element without link", () => {
    const boardScene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
    const roomNormalizedElements = boardScene.elements.map((element) => ({ ...element, link: null }))

    const renderedPostits = roomNormalizedElements
      .map((element) => renderPluginPostitBoardEmbeddable(element))
      .filter((node): node is NonNullable<typeof node> => node !== null)
    const { container } = render(createElement("div", null, ...renderedPostits))

    expect(
      Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
        node.getAttribute("data-plugin-postit-instance"),
      ),
    ).toEqual(["sim-a", "sim-b", "elab-consumer"])
    expect(container.querySelector("[data-elabtutor-simulation-instance]")?.getAttribute(
      "data-elabtutor-simulation-instance",
    )).toBe("sim-a")
  })

  it("rejects duplicated render elements whose board id no longer matches the persisted instance", () => {
    const [simAElement] = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements
    const duplicatedElement = {
      ...simAElement,
      id: "copied-sim-a-element",
      link: "maestro-tool://io.ardesia.simulation/copied-sim-a-element",
      customData: structuredClone(simAElement.customData),
    }

    expect(() => renderPluginPostitBoardEmbeddable(duplicatedElement)).toThrow(
      "plugin post-it board id mismatch for sim-a",
    )
  })

  it("rejects non-finite plugin state before JSON can coerce it during .lesson export", () => {
    const [simA] = createMultiPostitWorkbenchPostits()
    if (!isSimulationPostitState(simA.pluginState)) throw new Error("expected Simulation state")
    const unsafeSimA = {
      ...simA,
      pluginState: {
        ...simA.pluginState,
        providerOutput: {
          ...simA.pluginState.providerOutput,
          solverOutput: {
            ...simA.pluginState.providerOutput.solverOutput,
            currents: { led: Infinity },
          },
        },
      },
    }

    expect(() => createPluginPostitBoardScene([unsafeSimA])).toThrow(
      "plugin state contains non-finite number at providerOutput.solverOutput.currents.led",
    )
  })

  it("restores legacy bare-id plugin post-it elements when the legacy link is present", () => {
    const [simAElement] = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements
    const legacyElement = {
      ...simAElement,
      id: "sim-a",
      link: "maestro-tool://io.ardesia.simulation/sim-a",
    }

    const restored = restorePluginPostitsFromBoardScene({
      type: "excalidraw",
      elements: [legacyElement],
      appState: {},
    })

    expect(restored.map((postit) => `${postit.pluginId}:${postit.instanceId}`)).toEqual([
      "io.ardesia.simulation:sim-a",
    ])
    expect(restored[0]?.bounds).toMatchObject({ x: simAElement.x, y: simAElement.y })
  })

  it("rejects non-embeddable elements that carry plugin post-it markers", () => {
    const [simAElement] = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements
    const rectangleWithMarker = {
      ...simAElement,
      type: "rectangle",
    }

    expect(() =>
      restorePluginPostitsFromBoardScene({
        type: "excalidraw",
        elements: [rectangleWithMarker],
        appState: {},
      }),
    ).toThrow("plugin post-it board element must be embeddable")
  })
})
