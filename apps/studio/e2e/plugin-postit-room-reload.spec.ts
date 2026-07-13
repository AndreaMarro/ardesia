import { mkdir, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test, type Page } from "@playwright/test"
import JSZip from "jszip"

import {
  createPluginPostitBoardScene,
  normalizeDuplicatedPluginPostits,
  pluginPostitBoardElementId,
  restorePluginPostitsFromBoardScene,
} from "../src/design/multiPostitBoardPersistence"
import {
  createMultiPostitWorkbenchPostits,
  createPostitFromPluginWindowInsert,
} from "../src/design/multiPostitWorkbenchModel"
import {
  buildDefaultPluginWindowCatalog,
  createPluginWindowInsertRequest,
} from "../src/design/pluginWindowCatalog"
import { EMBED_DATA_KEY } from "../src/toolhost/caps/board"

const EVIDENCE_DIR = fileURLToPath(new URL("../../../output/playwright", import.meta.url))
const EXPECTED_INSTANCES = ["elab-consumer", "sim-a", "sim-b"] as const
const SOURCE_CONNECTOR_ID = "sim-a-source-connector"

type ViewportTarget = {
  name: "desktop" | "tablet"
  size: { width: number; height: number }
}

type DomRectEvidence = {
  id: string
  instance: string
  plugin: string
  x: number
  y: number
  width: number
  height: number
  text: string
}

type BoardElement = ReturnType<typeof createPluginPostitBoardScene>["elements"][number]

type MarkerState = {
  instanceId: string
  pluginId: string
  bounds: { x: number; y: number; width: number; height: number }
  pluginState: Record<string, unknown>
}

type BoardMarker = {
  owner: string
  schema: string
  state: MarkerState
}

type BrowserPluginIdentity = {
  id: string
  link: string | null
  instanceId: string
  pluginId: string
  owner: string
  x: number
  y: number
  runtimeInstanceId: string | null
  providerInstanceId: string | null
  runtimeDiagnostics: string[]
  providerDiagnostics: string[]
}

type BrowserStructuralReference = {
  id: string
  type: string
  startBindingElementId: string | null
  endBindingElementId: string | null
  containerId: string | null
  boundElementIds: string[]
}

const VIEWPORTS: ViewportTarget[] = [
  { name: "desktop", size: { width: 1440, height: 960 } },
  { name: "tablet", size: { width: 768, height: 1024 } },
]

function markerOf(element: BoardElement): BoardMarker {
  return element.customData[EMBED_DATA_KEY] as unknown as BoardMarker
}

function nativeDuplicate(
  source: BoardElement,
  id: string,
  bounds: Partial<Pick<BoardElement, "x" | "y" | "width" | "height">> = {},
): BoardElement {
  return {
    ...structuredClone(source),
    ...bounds,
    id,
    customData: structuredClone(source.customData),
  }
}

function canonicalCopyId(sourceId: string, ordinal = 1): string {
  const suffix = ordinal === 1 ? "--copy" : `--copy-${ordinal}`
  return `${sourceId.slice(0, 64 - suffix.length)}${suffix}`
}

function withCanonicalInstance(source: BoardElement, instanceId: string): BoardElement {
  const element = structuredClone(source)
  const marker = markerOf(element)
  const state = marker.state
  const pluginState = state.pluginState
  state.instanceId = instanceId
  if (typeof pluginState.runtimeState === "object" && pluginState.runtimeState !== null) {
    ;(pluginState.runtimeState as { instanceId: string }).instanceId = instanceId
  }
  if (typeof pluginState.providerOutput === "object" && pluginState.providerOutput !== null) {
    ;(pluginState.providerOutput as { instanceId: string }).instanceId = instanceId
  }
  marker.owner = `${state.pluginId}#${instanceId}`
  element.id = pluginPostitBoardElementId(instanceId)
  element.link = `maestro-tool://${state.pluginId}/${element.id}`
  return element
}

async function browserPluginIdentities(page: Page): Promise<BrowserPluginIdentity[]> {
  return page.evaluate((dataKey) => {
    const api = (
      window as Window & {
        __MAESTRO_TEST__?: {
          apiRef?: {
            current?: {
              getSceneElements?: () => Array<Record<string, unknown>>
            }
          }
        }
      }
    ).__MAESTRO_TEST__?.apiRef?.current
    const elements = api?.getSceneElements?.() ?? []
    return elements.flatMap((element) => {
      const customData = element.customData
      if (typeof customData !== "object" || customData === null || Array.isArray(customData)) {
        return []
      }
      const marker = (customData as Record<string, unknown>)[dataKey]
      if (typeof marker !== "object" || marker === null || Array.isArray(marker)) return []
      const markerRecord = marker as Record<string, unknown>
      if (markerRecord.schema !== "plugin-postit-board-state/1") return []
      const state = markerRecord.state
      if (typeof state !== "object" || state === null || Array.isArray(state)) return []
      const stateRecord = state as Record<string, unknown>
      const pluginState = stateRecord.pluginState
      const pluginStateRecord =
        typeof pluginState === "object" && pluginState !== null && !Array.isArray(pluginState)
          ? (pluginState as Record<string, unknown>)
          : {}
      const runtimeState = pluginStateRecord.runtimeState
      const providerOutput = pluginStateRecord.providerOutput
      return [
        {
          id: typeof element.id === "string" ? element.id : "",
          link: typeof element.link === "string" ? element.link : null,
          instanceId: typeof stateRecord.instanceId === "string" ? stateRecord.instanceId : "",
          pluginId: typeof stateRecord.pluginId === "string" ? stateRecord.pluginId : "",
          owner: typeof markerRecord.owner === "string" ? markerRecord.owner : "",
          x: typeof element.x === "number" ? element.x : Number.NaN,
          y: typeof element.y === "number" ? element.y : Number.NaN,
          runtimeInstanceId:
            typeof runtimeState === "object" &&
            runtimeState !== null &&
            !Array.isArray(runtimeState) &&
            typeof (runtimeState as Record<string, unknown>).instanceId === "string"
              ? ((runtimeState as Record<string, unknown>).instanceId as string)
              : null,
          providerInstanceId:
            typeof providerOutput === "object" &&
            providerOutput !== null &&
            !Array.isArray(providerOutput) &&
            typeof (providerOutput as Record<string, unknown>).instanceId === "string"
              ? ((providerOutput as Record<string, unknown>).instanceId as string)
              : null,
          runtimeDiagnostics:
            typeof runtimeState === "object" &&
            runtimeState !== null &&
            !Array.isArray(runtimeState) &&
            Array.isArray((runtimeState as Record<string, unknown>).diagnostics)
              ? ([...(runtimeState as Record<string, unknown>).diagnostics] as string[])
              : [],
          providerDiagnostics:
            typeof providerOutput === "object" &&
            providerOutput !== null &&
            !Array.isArray(providerOutput) &&
            Array.isArray((providerOutput as Record<string, unknown>).diagnostics)
              ? ([...(providerOutput as Record<string, unknown>).diagnostics] as string[])
              : [],
        },
      ]
    })
  }, EMBED_DATA_KEY)
}

async function browserSelectedElementIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const api = (
      window as Window & {
        __MAESTRO_TEST__?: {
          apiRef?: {
            current?: {
              getAppState?: () => { selectedElementIds?: Record<string, boolean> }
            }
          }
        }
      }
    ).__MAESTRO_TEST__?.apiRef?.current
    return Object.keys(api?.getAppState?.().selectedElementIds ?? {})
  })
}

async function browserSelectElements(page: Page, elementIds: readonly string[]): Promise<void> {
  await page.evaluate((selectedIds) => {
    const api = (
      window as Window & {
        __MAESTRO_TEST__?: {
          apiRef?: {
            current?: {
              updateScene?: (scene: {
                appState: { selectedElementIds: Record<string, boolean> }
              }) => void
            }
          }
        }
      }
    ).__MAESTRO_TEST__?.apiRef?.current
    api?.updateScene?.({
      appState: {
        selectedElementIds: Object.fromEntries(selectedIds.map((selectedId) => [selectedId, true])),
      },
    })
  }, elementIds)
}

async function browserStructuralReferences(page: Page): Promise<BrowserStructuralReference[]> {
  return page.evaluate(() => {
    const api = (
      window as Window & {
        __MAESTRO_TEST__?: {
          apiRef?: {
            current?: {
              getSceneElements?: () => Array<Record<string, unknown>>
            }
          }
        }
      }
    ).__MAESTRO_TEST__?.apiRef?.current
    return (api?.getSceneElements?.() ?? []).flatMap((element) => {
      const startBinding = element.startBinding
      const endBinding = element.endBinding
      const startBindingElementId =
        typeof startBinding === "object" &&
        startBinding !== null &&
        !Array.isArray(startBinding) &&
        typeof (startBinding as Record<string, unknown>).elementId === "string"
          ? ((startBinding as Record<string, unknown>).elementId as string)
          : null
      const endBindingElementId =
        typeof endBinding === "object" &&
        endBinding !== null &&
        !Array.isArray(endBinding) &&
        typeof (endBinding as Record<string, unknown>).elementId === "string"
          ? ((endBinding as Record<string, unknown>).elementId as string)
          : null
      const boundElementIds = Array.isArray(element.boundElements)
        ? element.boundElements.flatMap((boundElement) =>
            typeof boundElement === "object" &&
            boundElement !== null &&
            !Array.isArray(boundElement) &&
            typeof (boundElement as Record<string, unknown>).id === "string"
              ? [(boundElement as Record<string, unknown>).id as string]
              : [],
          )
        : []
      if (
        startBindingElementId === null &&
        endBindingElementId === null &&
        typeof element.containerId !== "string" &&
        boundElementIds.length === 0
      ) {
        return []
      }
      return [
        {
          id: typeof element.id === "string" ? element.id : "",
          type: typeof element.type === "string" ? element.type : "",
          startBindingElementId,
          endBindingElementId,
          containerId: typeof element.containerId === "string" ? element.containerId : null,
          boundElementIds,
        },
      ]
    })
  })
}

async function browserAppendSimulationDiagnostic(
  page: Page,
  elementId: string,
  diagnostic: string,
): Promise<void> {
  await page.evaluate(
    ({ dataKey, diagnosticText, targetId }) => {
      type SceneElement = {
        id?: string
        customData?: Record<string, unknown>
      }
      const api = (
        window as Window & {
          __MAESTRO_TEST__?: {
            apiRef?: {
              current?: {
                getSceneElements?: () => SceneElement[]
                updateScene?: (scene: { elements: SceneElement[] }) => void
              }
            }
          }
        }
      ).__MAESTRO_TEST__?.apiRef?.current
      const elements = api?.getSceneElements?.()
      if (elements === undefined) throw new Error("Excalidraw test API unavailable")
      const nextElements = elements.map((element) => {
        if (element.id !== targetId) return element
        const clone = structuredClone(element)
        const marker = clone.customData?.[dataKey]
        if (typeof marker !== "object" || marker === null || Array.isArray(marker)) {
          throw new Error("plugin marker unavailable")
        }
        const state = (marker as Record<string, unknown>).state
        if (typeof state !== "object" || state === null || Array.isArray(state)) {
          throw new Error("plugin state unavailable")
        }
        const pluginState = (state as Record<string, unknown>).pluginState
        if (typeof pluginState !== "object" || pluginState === null || Array.isArray(pluginState)) {
          throw new Error("Simulation state unavailable")
        }
        for (const key of ["runtimeState", "providerOutput"] as const) {
          const scopedState = (pluginState as Record<string, unknown>)[key]
          if (typeof scopedState !== "object" || scopedState === null || Array.isArray(scopedState)) {
            throw new Error(`${key} unavailable`)
          }
          const diagnostics = (scopedState as Record<string, unknown>).diagnostics
          if (!Array.isArray(diagnostics)) throw new Error(`${key} diagnostics unavailable`)
          diagnostics.push(diagnosticText)
        }
        return clone
      })
      api?.updateScene?.({ elements: nextElements })
    },
    { dataKey: EMBED_DATA_KEY, diagnosticText: diagnostic, targetId: elementId },
  )
}

test.describe("native plugin post-it clone identity", () => {
  test("canonicalizza atomicamente una copia, riscopa solo Simulation ed è idempotente", () => {
    const source = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    const sourceMarker = markerOf(source)
    sourceMarker.state.pluginState.unrelatedInstanceText = sourceMarker.state.instanceId
    const duplicate = nativeDuplicate(source, "opaque-excalidraw-copy", {
      x: 812,
      y: 136,
      width: 420,
      height: 310,
    })
    const input = [source, duplicate]
    const inputBefore = structuredClone(input)

    const normalized = normalizeDuplicatedPluginPostits(input)

    expect(normalized.changed).toBe(true)
    expect(normalized.elements[0]).toBe(source)
    expect(input).toEqual(inputBefore)
    const clone = normalized.elements[1] as BoardElement
    const cloneMarker = markerOf(clone)
    expect(clone.id).toBe(pluginPostitBoardElementId("sim-a--copy"))
    expect(clone.link).toBe(`maestro-tool://io.ardesia.simulation/${clone.id}`)
    expect(cloneMarker.owner).toBe("io.ardesia.simulation#sim-a--copy")
    expect(cloneMarker.state.instanceId).toBe("sim-a--copy")
    expect(cloneMarker.state.bounds).toEqual({ x: 812, y: 136, width: 420, height: 310 })
    expect(cloneMarker.state.pluginState.runtimeState).toMatchObject({
      instanceId: "sim-a--copy",
      pluginId: "io.ardesia.simulation",
    })
    expect(cloneMarker.state.pluginState.providerOutput).toMatchObject({
      instanceId: "sim-a--copy",
      pluginId: "io.ardesia.simulation",
    })
    expect(cloneMarker.state.pluginState.unrelatedInstanceText).toBe("sim-a")
    expect(cloneMarker.state.pluginState).not.toBe(sourceMarker.state.pluginState)

    const cloneRuntime = cloneMarker.state.pluginState.runtimeState as { diagnostics: string[] }
    cloneRuntime.diagnostics.push("clone-only")
    const sourceRuntime = sourceMarker.state.pluginState.runtimeState as { diagnostics: string[] }
    expect(sourceRuntime.diagnostics).not.toContain("clone-only")

    const secondPass = normalizeDuplicatedPluginPostits(normalized.elements)
    expect(secondPass.changed).toBe(false)
    expect(secondPass.elements).toEqual(normalized.elements)

    const reopened = restorePluginPostitsFromBoardScene({
      type: "excalidraw",
      elements: JSON.parse(JSON.stringify(normalized.elements)),
      appState: {},
    })
    expect(reopened.map((postit) => postit.instanceId)).toEqual(["sim-a", "sim-a--copy"])
  })

  test("alloca collisioni e più copie in ordine stabile entro 64 caratteri", () => {
    const seed = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    const sourceId = `a${"b".repeat(63)}`
    const source = withCanonicalInstance(seed, sourceId)
    const firstCopyId = canonicalCopyId(sourceId)
    const existingCopy = withCanonicalInstance(seed, firstCopyId)
    const input = [
      source,
      existingCopy,
      nativeDuplicate(source, "opaque-copy-1"),
      nativeDuplicate(source, "opaque-copy-2"),
    ]

    const firstRun = normalizeDuplicatedPluginPostits(structuredClone(input))
    const secondRun = normalizeDuplicatedPluginPostits(structuredClone(input))
    const ids = firstRun.elements.map((element) => markerOf(element as BoardElement).state.instanceId)

    expect(firstRun).toEqual(secondRun)
    expect(ids).toEqual([
      sourceId,
      firstCopyId,
      canonicalCopyId(sourceId, 2),
      canonicalCopyId(sourceId, 3),
    ])
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9][a-z0-9-]{0,63}$/)
      expect(id.length).toBeLessThanOrEqual(64)
    }
  })

  test("preserva il target esterno ELABTutor e clona invariato lo stato catalogo", () => {
    const scene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
    const tutor = scene.elements.find((element) => markerOf(element).state.instanceId === "elab-consumer")!
    const catalogItem = buildDefaultPluginWindowCatalog().find((item) => item.kind === "function")!
    const catalogPostit = createPostitFromPluginWindowInsert(
      createPluginWindowInsertRequest(catalogItem),
      [],
    )
    const catalog = createPluginPostitBoardScene([catalogPostit]).elements[0]!
    const catalogStateBefore = structuredClone(markerOf(catalog).state.pluginState)

    const normalized = normalizeDuplicatedPluginPostits([
      tutor,
      nativeDuplicate(tutor, "opaque-tutor-copy"),
      catalog,
      nativeDuplicate(catalog, "opaque-catalog-copy"),
    ])

    const tutorClone = markerOf(normalized.elements[1] as BoardElement).state
    const catalogClone = markerOf(normalized.elements[3] as BoardElement).state
    expect(tutorClone.instanceId).toBe("elab-consumer--copy")
    expect(tutorClone.pluginState.simulationInstanceId).toBe("sim-a")
    expect(catalogClone.pluginState).toEqual(catalogStateBefore)
    expect(catalogClone.pluginState).not.toBe(markerOf(catalog).state.pluginState)
  })

  test("fallisce chiuso su marker, identità, link, bounds e sorgenti incoerenti", () => {
    const source = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    const malformedState = structuredClone(source)
    ;(markerOf(malformedState) as { state: unknown }).state = null

    const pluginMismatch = structuredClone(source)
    const mismatchMarker = markerOf(pluginMismatch)
    mismatchMarker.state.pluginId = "io.elab.tutor"
    mismatchMarker.owner = "io.elab.tutor#sim-a"
    pluginMismatch.link = `maestro-tool://io.elab.tutor/${pluginMismatch.id}`

    const catalogItem = buildDefaultPluginWindowCatalog().find((item) => item.kind === "function")!
    const invalidPluginId = createPluginPostitBoardScene([
      createPostitFromPluginWindowInsert(createPluginWindowInsertRequest(catalogItem), []),
    ]).elements[0]!
    const invalidPluginMarker = markerOf(invalidPluginId)
    invalidPluginMarker.state.pluginId = "../evil"
    invalidPluginMarker.state.pluginState.pluginId = "../evil"
    invalidPluginMarker.owner = `../evil#${invalidPluginMarker.state.instanceId}`
    invalidPluginId.link = `maestro-tool://../evil/${invalidPluginId.id}`

    const ownerMismatch = structuredClone(source)
    markerOf(ownerMismatch).owner = "io.ardesia.simulation#sim-b"

    const linkMismatch = structuredClone(source)
    linkMismatch.link = "maestro-tool://io.ardesia.simulation/wrong"

    const invalidInstance = structuredClone(source)
    markerOf(invalidInstance).state.instanceId = "../escape"

    const nonFinite = nativeDuplicate(source, "opaque-infinite", { x: Number.POSITIVE_INFINITY })
    const duplicateCanonicalId = structuredClone(source)
    const orphanCopy = nativeDuplicate(source, "opaque-orphan")

    const cases: Array<{ elements: BoardElement[]; message: RegExp }> = [
      { elements: [malformedState], message: /serialized post-it|object/ },
      { elements: [pluginMismatch], message: /invalid (?:catalog plugin|Simulation|ELABTutor) state/ },
      { elements: [invalidPluginId], message: /invalid plugin id/ },
      { elements: [ownerMismatch], message: /owner mismatch/ },
      { elements: [linkMismatch], message: /link mismatch/ },
      { elements: [invalidInstance], message: /invalid instance id/ },
      { elements: [source, nonFinite], message: /bounds must be finite/ },
      { elements: [source, duplicateCanonicalId], message: /duplicate canonical/ },
      { elements: [orphanCopy], message: /canonical source/ },
    ]

    for (const entry of cases) {
      const before = structuredClone(entry.elements)
      expect(() => normalizeDuplicatedPluginPostits(entry.elements)).toThrow(entry.message)
      expect(entry.elements).toEqual(before)
    }
  })

  test("lascia intatti gli elementi non-plugin e riproduce la stessa identità dopo undo/redo", () => {
    const source = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    const rectangle = { id: "teacher-note", type: "rectangle", x: 1, y: 2 }
    const external = { id: "external", type: "embeddable", link: "https://example.test" }
    const untouched = normalizeDuplicatedPluginPostits([rectangle, external])
    expect(untouched.changed).toBe(false)
    expect(untouched.elements[0]).toBe(rectangle)
    expect(untouched.elements[1]).toBe(external)

    const nativeScene = [source, nativeDuplicate(source, "opaque-redo-copy")]
    const first = normalizeDuplicatedPluginPostits(nativeScene)
    const undo = normalizeDuplicatedPluginPostits([source])
    const redo = normalizeDuplicatedPluginPostits(nativeScene)
    expect(undo.changed).toBe(false)
    expect(redo.elements[1]).toEqual(first.elements[1])
  })

  test("rimappa atomicamente i riferimenti strutturali verso il clone canonico", () => {
    const source = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    Object.assign(source, { boundElements: [{ id: "source-arrow", type: "arrow" }] })
    const opaqueId = "opaque-bound-plugin-copy"
    const duplicate = nativeDuplicate(source, opaqueId)
    const sourceArrow = {
      id: "source-arrow",
      type: "arrow",
      startBinding: { elementId: source.id, focus: 0, gap: 8 },
      endBinding: null,
    }
    const duplicateArrow = {
      id: "duplicated-arrow",
      type: "arrow",
      startBinding: { elementId: opaqueId, focus: 0, gap: 8 },
      endBinding: { elementId: source.id, focus: 0, gap: 8 },
    }
    const label = { id: "duplicated-label", type: "text", containerId: opaqueId }
    const external = {
      id: "external-arrow",
      type: "arrow",
      startBinding: { elementId: "external-target", focus: 0, gap: 8 },
      endBinding: null,
    }
    const input = [source, duplicate, sourceArrow, duplicateArrow, label, external]
    const inputBefore = structuredClone(input)

    const normalized = normalizeDuplicatedPluginPostits(input)
    const canonicalId = pluginPostitBoardElementId("sim-a--copy")

    expect(normalized.changed).toBe(true)
    expect(input).toEqual(inputBefore)
    expect(normalized.elements[3]).toMatchObject({
      startBinding: { elementId: canonicalId },
      endBinding: { elementId: source.id },
    })
    expect(normalized.elements[1]).toMatchObject({
      boundElements: [
        { id: "duplicated-arrow", type: "arrow" },
        { id: "duplicated-label", type: "text" },
      ],
    })
    expect(normalized.elements[0]).toMatchObject({
      boundElements: [{ id: "source-arrow", type: "arrow" }],
    })
    expect(normalized.elements[4]).toMatchObject({ containerId: canonicalId })
    expect(normalized.elements[5]).toBe(external)

    const secondPass = normalizeDuplicatedPluginPostits(normalized.elements)
    expect(secondPass.changed).toBe(false)
    expect(secondPass.elements).toEqual(normalized.elements)

    const reboundByExcalidraw = {
      ...normalized.elements[3]!,
      startBinding: { elementId: opaqueId, focus: 0, gap: 8 },
    }
    const ignoredNonPluginTarget = normalizeDuplicatedPluginPostits(
      [
        normalized.elements[0]!,
        normalized.elements[1]!,
        reboundByExcalidraw,
        { id: "non-plugin-target", type: "rectangle" },
      ],
      new Map([[opaqueId, "non-plugin-target"]]),
    )
    expect(ignoredNonPluginTarget.changed).toBe(false)
    expect(ignoredNonPluginTarget.elements[2]).toMatchObject({
      startBinding: { elementId: opaqueId },
    })

    const repairedAfterNativeBindingPass = normalizeDuplicatedPluginPostits(
      [
        normalized.elements[0]!,
        normalized.elements[1]!,
        reboundByExcalidraw,
        normalized.elements[4]!,
      ],
      new Map([[opaqueId, canonicalId]]),
    )
    expect(repairedAfterNativeBindingPass.changed).toBe(true)
    expect(repairedAfterNativeBindingPass.elements[2]).toMatchObject({
      startBinding: { elementId: canonicalId },
    })
    expect(
      normalizeDuplicatedPluginPostits(
        repairedAfterNativeBindingPass.elements,
        new Map([[opaqueId, canonicalId]]),
      ).changed,
    ).toBe(false)
  })

  test("fallisce chiuso su riferimenti reciproci malformati, ambigui o mancanti", () => {
    const source = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements[0]!
    const opaqueId = "opaque-malformed-plugin-copy"

    const cases = [
      [
        source,
        nativeDuplicate(source, opaqueId),
        {
          type: "arrow",
          startBinding: { elementId: opaqueId },
          endBinding: null,
        },
      ],
      [
        source,
        nativeDuplicate(source, opaqueId),
        {
          id: "missing-target-arrow",
          type: "arrow",
          startBinding: { elementId: opaqueId },
          endBinding: { elementId: "missing-element" },
        },
      ],
    ]

    for (const elements of cases) {
      const before = structuredClone(elements)
      expect(() => normalizeDuplicatedPluginPostits(elements)).toThrow(/structural reference/)
      expect(elements).toEqual(before)
    }

    expect(() =>
      normalizeDuplicatedPluginPostits(
        [source, nativeDuplicate(source, opaqueId)],
        new Map([[opaqueId, pluginPostitBoardElementId("sim-a")]]),
      ),
    ).toThrow(/ambiguous structural remap/)
  })
})

async function createPluginPostitLessonBuffer(options: { withConnector?: boolean } = {}) {
  const scene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
  if (options.withConnector) {
    const source = scene.elements.find((element) => markerOf(element).state.instanceId === "sim-a")!
    const connector = {
      id: SOURCE_CONNECTOR_ID,
      type: "arrow",
      x: source.x + source.width,
      y: source.y + source.height / 2,
      width: 120,
      height: 0,
      angle: 0,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      roundness: { type: 2 },
      seed: 104729,
      version: 1,
      versionNonce: 130363,
      index: null,
      isDeleted: false,
      groupIds: [],
      frameId: null,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      points: [
        [0, 0],
        [120, 0],
      ],
      lastCommittedPoint: null,
      startBinding: { elementId: source.id, focus: 0, gap: 8 },
      endBinding: null,
      startArrowhead: null,
      endArrowhead: "arrow",
      elbowed: false,
    }
    Object.assign(source, {
      boundElements: [{ id: connector.id, type: "arrow" }],
    })
    ;(scene.elements as unknown[]).push(connector)
  }
  const zip = new JSZip()

  zip.file("raw/board.excalidraw", JSON.stringify(scene))
  zip.file("raw/events.jsonl", "")
  zip.file("raw/session.yaml", "v: 1\naudioConsent: false\n")

  return zip.generateAsync({ type: "nodebuffer", mimeType: "application/zip" })
}

function overlappingPairs(rects: readonly DomRectEvidence[]): string[] {
  const pairs: string[] = []
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!
      const b = rects[j]!
      const overlaps =
        a.x < b.x + b.width - 1 &&
        a.x + a.width > b.x + 1 &&
        a.y < b.y + b.height - 1 &&
        a.y + a.height > b.y + 1
      if (overlaps) pairs.push(`${a.instance}:${b.instance}`)
    }
  }
  return pairs
}

for (const target of VIEWPORTS) {
  test(`Room import .lesson renders plugin post-it board in real Excalidraw (${target.name})`, async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text())
    })
    page.on("pageerror", (error) => {
      consoleErrors.push(`pageerror: ${error.message}`)
    })

    await page.setViewportSize(target.size)
    await page.addInitScript(() => {
      window.localStorage.clear()
    })

    const route = `/#p22b-plugin-postit-${target.name}-${testInfo.workerIndex}`
    await page.goto(route)
    await expect(page.locator(".excalidraw")).toBeVisible({ timeout: 20_000 })
    await page.waitForFunction(
      () =>
        (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__
          ?.ready === true,
    )
    const preImportDuplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[id]"))
        .map((element) => element.id)
        .filter(Boolean)
      return Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index))).filter(
        (id) => !id.startsWith("radix-"),
      )
    })

    const lessonBuffer = await createPluginPostitLessonBuffer()
    await page
      .locator('input[type="file"][accept*=".lesson"]')
      .setInputFiles({
        name: "plugin-postit-room.lesson",
        mimeType: "application/zip",
        buffer: lessonBuffer,
      })

    const postits = page.locator("[data-plugin-postit-instance]")
    await expect(postits).toHaveCount(3, { timeout: 20_000 })

    for (const instanceId of EXPECTED_INSTANCES) {
      await expect(page.locator(`[data-plugin-postit-instance="${instanceId}"]`)).toBeVisible()
    }

    const evidence = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>("[data-plugin-postit-instance]"),
      )
      const elementsWithIds = Array.from(document.querySelectorAll<HTMLElement | SVGElement>("[id]"))
      const ids = elementsWithIds.map((element) => element.id).filter(Boolean)
      const duplicateIds = Array.from(new Set(ids.filter((id, index) => ids.indexOf(id) !== index)))
      const duplicateDetails = duplicateIds
        .filter((id) => !id.startsWith("radix-"))
        .map((id) => ({
          id,
          nodes: elementsWithIds
            .filter((element) => element.id === id)
            .map((element) => {
              const rect = element.getBoundingClientRect()
              const className =
                typeof element.className === "string"
                  ? element.className
                  : element.className.baseVal
              return {
                tagName: element.tagName,
                namespaceURI: element.namespaceURI,
                className,
                role: element.getAttribute("role"),
                ariaLabel: element.getAttribute("aria-label"),
                text: (element.textContent ?? "").trim().slice(0, 160),
                nearestExcalidrawClass:
                  element.closest("[class*='excalidraw']")?.getAttribute("class") ?? null,
                nearestPluginInstance:
                  element.closest("[data-plugin-postit-instance]")?.getAttribute(
                    "data-plugin-postit-instance",
                  ) ?? null,
                rect: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
                outerHTML: element.outerHTML.slice(0, 400),
              }
            }),
        }))
      const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas")
      const canvasRect = canvas?.getBoundingClientRect()
      const sceneElements = (
        (window as Window & {
          __MAESTRO_TEST__?: {
            apiRef?: {
              current?: {
                getSceneElements?: () => Array<{
                  id?: string
                  type?: string
                  index?: string | null
                  link?: string | null
                }>
              }
            }
          }
        }).__MAESTRO_TEST__?.apiRef?.current?.getSceneElements?.() ?? []
      ).map((element) => ({
        id: element.id ?? null,
        type: element.type ?? null,
        index: element.index ?? null,
        link: element.link ?? null,
      }))

      return {
        cards: cards
          .map((card) => {
            const rect = card.getBoundingClientRect()
            return {
              id: card.id,
              instance: card.dataset.pluginPostitInstance ?? "",
              plugin: card.dataset.pluginPostitPlugin ?? "",
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              text: card.innerText.trim(),
            }
          })
          .sort((a, b) => a.instance.localeCompare(b.instance)),
        duplicateIds: duplicateIds.filter((id) => !id.startsWith("radix-")),
        duplicateDetails,
        pluginDuplicateIds: duplicateIds.filter((id) => id.startsWith("plugin-postit-")),
        sceneElements,
        canvasRect:
          canvasRect === undefined
            ? null
            : {
                width: canvasRect.width,
                height: canvasRect.height,
              },
      }
    })

    expect(evidence.cards.map((card) => card.instance)).toEqual([...EXPECTED_INSTANCES])
    expect(evidence.cards.filter((card) => card.plugin === "io.ardesia.simulation")).toHaveLength(2)
    expect(evidence.cards.filter((card) => card.plugin === "io.elab.tutor")).toHaveLength(1)
    const postImportNewDuplicateIds = evidence.duplicateIds.filter(
      (id) => !preImportDuplicateIds.includes(id),
    )
    expect(postImportNewDuplicateIds).toEqual([])
    expect(evidence.pluginDuplicateIds).toEqual([])
    expect(overlappingPairs(evidence.cards)).toEqual([])
    expect(evidence.canvasRect?.width).toBeGreaterThan(240)
    expect(evidence.canvasRect?.height).toBeGreaterThan(240)

    for (const card of evidence.cards) {
      expect(card.id).toContain(card.instance)
      expect(card.width).toBeGreaterThan(120)
      expect(card.height).toBeGreaterThan(120)
      expect(card.text.length).toBeGreaterThan(20)
    }

    await mkdir(EVIDENCE_DIR, { recursive: true })
    const screenshotPath = join(EVIDENCE_DIR, `plugin-postit-room-${target.name}.png`)
    const resultPath = join(EVIDENCE_DIR, `plugin-postit-room-${target.name}.json`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    const screenshot = await stat(screenshotPath)
    await writeFile(
      resultPath,
      JSON.stringify(
        {
          route,
          viewport: target.size,
          screenshotPath,
          screenshotBytes: screenshot.size,
          consoleErrors,
          preImportDuplicateIds,
          postImportNewDuplicateIds,
          cards: evidence.cards,
          duplicateIds: evidence.duplicateIds,
          duplicateDetails: evidence.duplicateDetails,
          pluginDuplicateIds: evidence.pluginDuplicateIds,
          sceneElements: evidence.sceneElements,
          canvasRect: evidence.canvasRect,
        },
        null,
        2,
      ),
    )

    expect(screenshot.size).toBeGreaterThan(10_000)
    expect(consoleErrors).toEqual([])
  })
}

test("native clone → undo/redo → move clone → save/reopen mantiene due identità indipendenti", async ({
  page,
}, testInfo) => {
  testInfo.setTimeout(120_000)
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })
  await page.addInitScript(() => {
    if (window.sessionStorage.getItem("o1a-storage-cleared") === "1") return
    window.localStorage.clear()
    window.sessionStorage.setItem("o1a-storage-cleared", "1")
  })
  const route = `/#o1a-native-clone-${testInfo.workerIndex}-${testInfo.repeatEachIndex}`
  await page.goto(route)
  await expect(page.locator(".excalidraw")).toBeVisible({ timeout: 20_000 })
  await page.waitForFunction(
    () =>
      (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready ===
      true,
  )
  await page
    .locator('input[type="file"][accept*=".lesson"]')
    .setInputFiles({
      name: "plugin-postit-native-clone.lesson",
      mimeType: "application/zip",
      buffer: await createPluginPostitLessonBuffer({ withConnector: true }),
    })

  const postits = page.locator("[data-plugin-postit-instance]")
  await expect(postits).toHaveCount(3, { timeout: 20_000 })
  await page.reload()
  await expect(page.locator(".excalidraw")).toBeVisible({ timeout: 20_000 })
  await page.waitForFunction(
    () =>
      (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready ===
      true,
  )
  await expect(postits).toHaveCount(3, { timeout: 20_000 })
  let identities = await browserPluginIdentities(page)
  const sourceBefore = identities.find((identity) => identity.instanceId === "sim-a")!
  const sourceCard = page.locator('[data-plugin-postit-instance="sim-a"]')
  const sourceBox = await sourceCard.boundingBox()
  if (sourceBox === null) throw new Error("source plugin post-it has no bounding box")
  await page.mouse.click(sourceBox.x + sourceBox.width / 2, sourceBox.y + 20)
  await browserSelectElements(page, [sourceBefore.id, SOURCE_CONNECTOR_ID])
  await expect.poll(() => browserSelectedElementIds(page)).toEqual(
    expect.arrayContaining([sourceBefore.id, SOURCE_CONNECTOR_ID]),
  )
  const dragStart = {
    x: sourceBox.x + sourceBox.width + 12,
    y: sourceBox.y + sourceBox.height / 2,
  }
  await page.mouse.move(dragStart.x, dragStart.y)
  await page.keyboard.down("Alt")
  await page.mouse.down()
  await page.mouse.move(dragStart.x + 180, dragStart.y + 110, { steps: 12 })
  await page.mouse.up()
  await page.keyboard.up("Alt")

  await expect(postits).toHaveCount(4, { timeout: 20_000 })
  identities = await browserPluginIdentities(page)
  const sourceAfterClone = identities.find((identity) => identity.instanceId === "sim-a")!
  const cloneBeforeUndo = identities.find((identity) => identity.instanceId === "sim-a--copy")!
  expect(cloneBeforeUndo).toMatchObject({
    id: pluginPostitBoardElementId("sim-a--copy"),
    owner: "io.ardesia.simulation#sim-a--copy",
    pluginId: "io.ardesia.simulation",
    runtimeInstanceId: "sim-a--copy",
    providerInstanceId: "sim-a--copy",
  })
  expect(cloneBeforeUndo.link).toBe(
    `maestro-tool://io.ardesia.simulation/${pluginPostitBoardElementId("sim-a--copy")}`,
  )
  const structuralAfterClone = await browserStructuralReferences(page)
  const sourceConnector = structuralAfterClone.find((reference) => reference.id === SOURCE_CONNECTOR_ID)
  const duplicateConnector = structuralAfterClone.find(
    (reference) => reference.type === "arrow" && reference.id !== SOURCE_CONNECTOR_ID,
  )
  expect(sourceConnector?.startBindingElementId).toBe(sourceBefore.id)
  expect(duplicateConnector?.startBindingElementId).toBe(cloneBeforeUndo.id)
  expect(
    structuralAfterClone.find((reference) => reference.id === sourceBefore.id)?.boundElementIds,
  ).toEqual([SOURCE_CONNECTOR_ID])
  expect(
    structuralAfterClone.find((reference) => reference.id === cloneBeforeUndo.id)?.boundElementIds,
  ).toEqual([duplicateConnector?.id])
  const currentElementIds = await page.evaluate(() => {
    const api = (
      window as Window & {
        __MAESTRO_TEST__?: {
          apiRef?: { current?: { getSceneElements?: () => Array<{ id?: string }> } }
        }
      }
    ).__MAESTRO_TEST__?.apiRef?.current
    return (api?.getSceneElements?.() ?? []).flatMap((element) =>
      typeof element.id === "string" ? [element.id] : [],
    )
  })
  for (const reference of structuralAfterClone) {
    for (const target of [
      reference.startBindingElementId,
      reference.endBindingElementId,
      reference.containerId,
    ]) {
      if (target !== null) expect(currentElementIds).toContain(target)
    }
  }

  await browserSelectElements(page, [cloneBeforeUndo.id])
  await expect.poll(() => browserSelectedElementIds(page)).toEqual([cloneBeforeUndo.id])

  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await expect(async () => {
    const current = await browserPluginIdentities(page)
    expect(current.find((identity) => identity.instanceId === "sim-a--copy")?.x).toBeGreaterThan(
      cloneBeforeUndo.x,
    )
    expect(current.find((identity) => identity.instanceId === "sim-a")?.x).toBe(sourceAfterClone.x)
  }).toPass({ timeout: 10_000 })
  const cloneMoved = (await browserPluginIdentities(page)).find(
    (identity) => identity.instanceId === "sim-a--copy",
  )!

  // Excalidraw raggruppa duplicazione e nudging nella stessa voce di storia:
  // undo rimuove la copia, redo la ripristina già modificata e selezionata.
  await page.keyboard.press("ControlOrMeta+z")
  await expect(postits).toHaveCount(3, { timeout: 20_000 })
  await page.keyboard.press("ControlOrMeta+Shift+z")
  await expect(page.locator('[data-plugin-postit-instance="sim-a--copy"]')).toBeVisible({
    timeout: 20_000,
  })
  identities = await browserPluginIdentities(page)
  expect(identities.find((identity) => identity.instanceId === "sim-a--copy")?.id).toBe(
    cloneBeforeUndo.id,
  )
  expect(identities.find((identity) => identity.instanceId === "sim-a--copy")?.x).toBe(
    cloneMoved.x,
  )
  const selectedAfterRedo = await browserSelectedElementIds(page)
  expect(selectedAfterRedo.length).toBeGreaterThan(0)
  expect(selectedAfterRedo.every((elementId) => currentElementIds.includes(elementId))).toBe(true)
  const structuralAfterRedo = await browserStructuralReferences(page)
  expect(
    structuralAfterRedo.find((reference) => reference.id === duplicateConnector?.id)
      ?.startBindingElementId,
  ).toBe(cloneBeforeUndo.id)
  expect(
    structuralAfterRedo.find((reference) => reference.id === cloneBeforeUndo.id)?.boundElementIds,
  ).toEqual([duplicateConnector?.id])

  await browserAppendSimulationDiagnostic(page, cloneBeforeUndo.id, "clone-only-browser")
  await expect(async () => {
    const current = await browserPluginIdentities(page)
    const source = current.find((identity) => identity.instanceId === "sim-a")!
    const clone = current.find((identity) => identity.instanceId === "sim-a--copy")!
    expect(clone.runtimeDiagnostics).toContain("clone-only-browser")
    expect(clone.providerDiagnostics).toContain("clone-only-browser")
    expect(source.runtimeDiagnostics).not.toContain("clone-only-browser")
    expect(source.providerDiagnostics).not.toContain("clone-only-browser")
  }).toPass({ timeout: 10_000 })

  await page.waitForTimeout(1_400)
  await page.reload()
  await expect(page.locator(".excalidraw")).toBeVisible({ timeout: 20_000 })
  await page.waitForFunction(
    () =>
      (window as Window & { __MAESTRO_TEST__?: { ready?: boolean } }).__MAESTRO_TEST__?.ready ===
      true,
  )
  await expect(page.locator("[data-plugin-postit-instance]")).toHaveCount(4, { timeout: 20_000 })
  const reopened = await browserPluginIdentities(page)
  expect(reopened.find((identity) => identity.instanceId === "sim-a")?.x).toBe(sourceAfterClone.x)
  expect(reopened.find((identity) => identity.instanceId === "sim-a--copy")?.x).toBe(
    cloneMoved.x,
  )
  expect(
    reopened.find((identity) => identity.instanceId === "sim-a--copy")?.runtimeDiagnostics,
  ).toContain("clone-only-browser")
  expect(reopened.find((identity) => identity.instanceId === "sim-a")?.runtimeDiagnostics).not.toContain(
    "clone-only-browser",
  )
  expect(new Set(reopened.map((identity) => identity.instanceId)).size).toBe(4)
  const reopenedStructural = await browserStructuralReferences(page)
  expect(
    reopenedStructural.find((reference) => reference.id === duplicateConnector?.id)
      ?.startBindingElementId,
  ).toBe(pluginPostitBoardElementId("sim-a--copy"))
  expect(
    reopenedStructural.find(
      (reference) => reference.id === pluginPostitBoardElementId("sim-a--copy"),
    )?.boundElementIds,
  ).toEqual([duplicateConnector?.id])
  expect(consoleErrors).toEqual([])
})
