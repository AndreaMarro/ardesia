// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import JSZip from "jszip"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { JournalRecorder } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import { studioProducerIdentity } from "../core/contracts/eventEnvelope"
import { exportLesson, importLesson } from "../store/lessonBundle"
import { EMBED_DATA_KEY, persistEmbedStateThroughToolHost, type BoardApiLike, type BoardElementLike } from "../toolhost/caps/board"
import { buildFunctionGraphInsert, normalizeDuplicatedToolEmbeds, parseToolLink, renderToolCanvasEmbeddable } from "../toolhost/ToolCanvasEmbeddable"
import { getSimulationTool, type SimulationToolHost } from "../toolhost/simulationPluginRegistry"
import { FUNCTION_GRAPH_TOOL_ID, emptyFunctionGraphState, evaluateGraph, exportFunctionGraphSvg, graphNumber,
  readFunctionGraphState, type FunctionGraphState } from "../toolhost/functionGraph"

const teacherState: FunctionGraphState = { kind: "function-graph-v1", v: 1, title: "Traiettoria", coefficients: ["1/2", "-3", "2"], domain: { min: "-2", max: "6" } }
let storage: Storage
beforeEach(() => {
  const values = new Map<string, string>()
  storage = { get length() { return values.size }, clear: () => values.clear(), getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)) }, removeItem: key => { values.delete(key) }, key: index => [...values.keys()][index] ?? null }
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })
})
afterEach(cleanup)
function stateOf(element: BoardElementLike): FunctionGraphState {
  return readFunctionGraphState((element.customData?.[EMBED_DATA_KEY] as { state: unknown }).state)
}

it("uses the existing registry without an electrical solver or preloaded function", () => {
  const entry = getSimulationTool(FUNCTION_GRAPH_TOOL_ID)!
  expect(entry.solve).toBeUndefined()
  const first = buildFunctionGraphInsert([])!, second = buildFunctionGraphInsert([first.embed])!
  expect(first.embedId).not.toBe(second.embedId)
  expect(stateOf(first.embed)).toEqual(emptyFunctionGraphState())
  expect(entry.validate?.(teacherState)).toEqual({ ok: true, errors: [] })
  expect(entry.validate?.({ ...teacherState, v: 2 }).ok).toBe(false)
})
it("matches manually evaluated points and includes the parabola vertex", () => {
  for (const [x, y] of [[-2, 10], [0, 2], [3, -2.5], [6, 2]]) expect(evaluateGraph(teacherState, x!)).toBe(y)
  expect(graphNumber("1,5")).toBe(1.5)
  const svg = exportFunctionGraphSvg(teacherState)
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  expect(doc.querySelector("path[data-function-curve]")!.getAttribute("d")).toContain("377.500 276.250")
  const constant = { ...teacherState, coefficients: ["0", "0", "7"] as [string, string, string] }
  expect(evaluateGraph(constant, -900)).toBe(7)
  expect(exportFunctionGraphSvg(constant)).not.toMatch(/NaN|Infinity/)
})
it.each(["NaN", "Infinity", "1e309", "1/0", "1000001", "alert(1)", "1;fetch('/')", "", "1/99999999999999999999999999999999999999999"])("refuses invalid or excessive coefficient %s", coefficient => {
  expect(() => readFunctionGraphState({ ...teacherState, coefficients: [coefficient, "0", "0"] })).toThrow()
})
it("rejects bad schema and bounds, and escapes SVG titles", () => {
  for (const value of [null, { ...teacherState, v: 2 }, { ...teacherState, coefficients: [1, 2, 3] },
    { ...teacherState, domain: { min: "3", max: "-1" } }, { ...teacherState, domain: { min: "0", max: "10001" } }])
    expect(() => readFunctionGraphState(value)).toThrow()
  const svg = exportFunctionGraphSvg({ ...teacherState, title: '<script>alert("x")</script>' })
  expect(svg).not.toContain("<script>"); expect(svg).toContain("&lt;script&gt;")
  const extreme = exportFunctionGraphSvg({ ...teacherState, title: "a".repeat(120),
    coefficients: ["1000000", "1000000", "1000000"], domain: { min: "-10000", max: "10000" } })
  const doc = new DOMParser().parseFromString(extreme, "image/svg+xml")
  expect(doc.querySelector('text[y="26"]')!.getAttribute("textLength")).toBe("500")
  expect(doc.querySelector('text[y="80"]')!.textContent!.length).toBeLessThanOrEqual(10)
  expect(extreme).not.toMatch(/NaN|Infinity/)
})
it("inserts, edits through ToolHost, saves, clones independently and cold-imports a real .lesson", async () => {
  const store = new WorkspaceStore(); await store.init()
  const identity = { lessonId: "graph-lesson", sessionId: crypto.randomUUID() }
  await store.createSessionOnce(identity, { created: Date.now() })
  const recorder = new JournalRecorder({ store, journalPath: roomPaths(identity.lessonId).journal,
    identity: { ...identity, actor: { type: "teacher", id: "function-graph-test" } }, producer: studioProducerIdentity(),
    withExclusiveLock: async (_name, work) => work() })
  const first = buildFunctionGraphInsert([])!
  let elements: BoardElementLike[] = [first.embed]
  const api: BoardApiLike = { getSceneElements: () => elements, getAppState: () => ({ selectedElementIds: {} }), updateScene: next => { elements = next.elements } }
  expect(await persistEmbedStateThroughToolHost(api, store, first.embedId, teacherState, { toolId: FUNCTION_GRAPH_TOOL_ID })).toBe(true)
  const duplicate = { ...structuredClone(elements[0]!), id: "function-graph-copy" }
  elements = normalizeDuplicatedToolEmbeds([...elements, duplicate]).elements as BoardElementLike[]
  expect(parseToolLink(elements[1]!.link as string)?.embedId).toBe(duplicate.id)
  expect(elements[0]!.customData).not.toBe(elements[1]!.customData)
  const changed = { ...teacherState, title: "Copia modificata", coefficients: ["-1", "2", "4"] as [string, string, string] }
  expect(await persistEmbedStateThroughToolHost(api, store, duplicate.id, changed, { toolId: FUNCTION_GRAPH_TOOL_ID })).toBe(true)
  expect(stateOf(elements[0]!)).toEqual(teacherState)
  expect(stateOf(elements[1]!)).toEqual(changed)
  expect(await persistEmbedStateThroughToolHost(api, store, duplicate.id, teacherState, { toolId: "io.other.tool" })).toBe(false)
  recorder.recordChange(elements)
  await recorder.flush()
  await store.saveScene("graph-lesson", JSON.stringify({ type: "excalidraw", version: 2, elements, appState: {}, files: {} }))
  const exported = await exportLesson(store, "graph-lesson"), zip = await JSZip.loadAsync(exported)
  expect(JSON.parse(await zip.file("raw/board.excalidraw")!.async("text")).elements).toHaveLength(2)
  storage.clear()
  const cold = new WorkspaceStore(); await cold.init()
  await importLesson(cold, exported, null, { destinationLessonId: "graph-lesson", legacyClaim: { userConfirmed: true } })
  const restored = JSON.parse((await cold.loadScene("graph-lesson"))!) as { elements: BoardElementLike[] }
  expect(restored.elements.map(stateOf)).toEqual([teacherState, changed])
  for (const element of restored.elements) {
    const html = renderToStaticMarkup(renderToolCanvasEmbeddable(element)!)
    expect(html).toContain("data-function-curve"); expect(html).toContain("sola lettura"); expect(html).not.toContain("CircuitCheck")
  }
})
it("edits in the UI through the actual host gate and reopens saved coefficients", async () => {
  const store = new WorkspaceStore(); await store.init()
  let elements: BoardElementLike[] = [buildFunctionGraphInsert([])!.embed]
  const api: BoardApiLike = { getSceneElements: () => elements, getAppState: () => ({ selectedElementIds: {} }),
    updateScene: next => { elements = next.elements; view.rerender(renderToolCanvasEmbeddable(elements[0]!, host)!) } }
  const host: SimulationToolHost = {
    persistEmbedState: (id, state, toolId) => persistEmbedStateThroughToolHost(api, store, id, state, { toolId }),
    flushEmbedState: async () => { await store.saveScene("graph-ui", JSON.stringify({ elements })); return true },
  }
  const view = render(renderToolCanvasEmbeddable(elements[0]!, host)!)
  for (const [key, value] of [["a", "2"], ["b", "-4"], ["c", "1"]])
    fireEvent.change(screen.getByLabelText(`Coefficiente ${key}`), { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: "Salva grafico" }))
  await screen.findByText("Grafico salvato.")
  expect(stateOf(elements[0]!).coefficients).toEqual(["2", "-4", "1"])
  view.unmount()
  const restored = JSON.parse((await store.loadScene("graph-ui"))!) as { elements: BoardElementLike[] }
  render(renderToolCanvasEmbeddable(restored.elements[0]!)!)
  expect((screen.getByLabelText("Coefficiente b") as HTMLInputElement).value).toBe("-4")
  expect((screen.getByRole("button", { name: "Salva grafico" }) as HTMLButtonElement).disabled).toBe(true)
})
it("retains denied drafts and never reports a failed durability barrier as saved", async () => {
  const embed = buildFunctionGraphInsert([])!.embed
  const view = render(renderToolCanvasEmbeddable(embed, { persistEmbedState: async () => false })!)
  for (const key of ["a", "b", "c"]) fireEvent.change(screen.getByLabelText(`Coefficiente ${key}`), { target: { value: "2" } })
  fireEvent.click(screen.getByRole("button", { name: "Salva grafico" }))
  expect((await screen.findByRole("alert")).textContent).toContain("rifiutata")
  expect((screen.getByLabelText("Coefficiente a") as HTMLInputElement).value).toBe("2")
  view.rerender(renderToolCanvasEmbeddable(embed, { persistEmbedState: async () => true, flushEmbedState: async () => false })!)
  fireEvent.click(screen.getByRole("button", { name: "Salva grafico" }))
  expect((await screen.findByRole("alert")).textContent).toContain("non è ancora salvato")
  expect(screen.queryByText("Grafico salvato.")).toBeNull()
})
it("rejects another owner and preserves dirty input on external changes", async () => {
  const embed = buildFunctionGraphInsert([])!.embed
  const invalid = render(renderToolCanvasEmbeddable({ ...embed, customData: { [EMBED_DATA_KEY]: { owner: "io.other.tool", state: teacherState } } })!)
  expect(screen.getByRole("alert").textContent).toContain("non appartiene"); invalid.unmount()
  const host = { persistEmbedState: async () => true }
  const view = render(renderToolCanvasEmbeddable(embed, host)!)
  fireEvent.change(screen.getByLabelText("Coefficiente a"), { target: { value: "8" } })
  view.rerender(renderToolCanvasEmbeddable({ ...embed, customData: { [EMBED_DATA_KEY]: { owner: FUNCTION_GRAPH_TOOL_ID, state: teacherState } } }, host)!)
  await screen.findByRole("button", { name: "Ricarica dalla lavagna" })
  expect((screen.getByLabelText("Coefficiente a") as HTMLInputElement).value).toBe("8")
  expect((screen.getByRole("button", { name: "Salva grafico" }) as HTMLButtonElement).disabled).toBe(true)
})
it("does not announce its draft as saved if another writer changes the graph during the durability barrier", async () => {
  const embed = buildFunctionGraphInsert([])!.embed
  let finish!: (value: boolean) => void
  const barrier = new Promise<boolean>(resolve => { finish = resolve })
  const host = { persistEmbedState: async () => true, flushEmbedState: () => barrier }
  const view = render(renderToolCanvasEmbeddable(embed, host)!)
  for (const key of ["a", "b", "c"]) fireEvent.change(screen.getByLabelText(`Coefficiente ${key}`), { target: { value: "4" } })
  await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Salva grafico" })) })
  view.rerender(renderToolCanvasEmbeddable({ ...embed, customData: { [EMBED_DATA_KEY]: { owner: FUNCTION_GRAPH_TOOL_ID, state: teacherState } } }, host)!)
  await act(async () => { finish(true) })
  expect(screen.queryByText("Grafico salvato.")).toBeNull()
  expect(screen.getByRole("alert").textContent).toContain("cambiato durante")
  expect((screen.getByLabelText("Coefficiente a") as HTMLInputElement).value).toBe("4")
  expect(screen.getByRole("button", { name: "Ricarica dalla lavagna" })).toBeTruthy()
})
