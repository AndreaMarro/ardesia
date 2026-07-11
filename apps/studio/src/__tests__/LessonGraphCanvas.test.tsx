// @vitest-environment jsdom

import { StrictMode } from "react"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import cytoscape from "cytoscape"
import LessonGraphCanvas, { displayedLevel } from "../design/LessonGraphCanvas"

type ElementInput = { group: "nodes" | "edges"; data: Record<string, unknown>; classes?: string }

class FakeElement {
  classes = new Set<string>()
  selected = false

  constructor(readonly core: FakeCore, readonly input: ElementInput, readonly index: number) {
    for (const className of input.classes?.split(" ") ?? []) if (className) this.classes.add(className)
  }

  id() { return String(this.input.data.id) }
  data(key: string, value?: unknown) {
    if (arguments.length === 2) this.input.data[key] = value
    return this.input.data[key]
  }
  position() { return { x: 100 + this.index * 80, y: 100 + this.index * 40 } }
  source() { return this.core.getElementById(String(this.input.data.source)).first() }
  target() { return this.core.getElementById(String(this.input.data.target)).first() }
}

class FakeCollection {
  constructor(readonly core: FakeCore, readonly items: FakeElement[]) {}
  forEach(callback: (element: FakeElement) => void) { this.items.forEach(callback); return this }
  map<T>(callback: (element: FakeElement) => T) { return this.items.map(callback) }
  remove() { this.core.clear(); return this }
  removeClass(className: string) { this.items.forEach((item) => item.classes.delete(className)); return this }
  addClass(className: string) { this.items.forEach((item) => item.classes.add(className)); return this }
  unselect() { this.items.forEach((item) => { item.selected = false }); return this }
  select() { this.items.forEach((item) => { item.selected = true }); return this }
  nonempty() { return this.items.length > 0 }
  not(other: FakeCollection) { return new FakeCollection(this.core, this.items.filter((item) => !other.items.includes(item))) }
  closedNeighborhood() {
    const ids = new Set(this.items.map((item) => item.id()))
    const incident = this.core.edgeItems.filter((edge) => ids.has(String(edge.input.data.source)) || ids.has(String(edge.input.data.target)))
    for (const edge of incident) {
      ids.add(String(edge.input.data.source))
      ids.add(String(edge.input.data.target))
    }
    return new FakeCollection(this.core, [...this.core.nodeItems.filter((node) => ids.has(node.id())), ...incident])
  }
  first() { return this.items[0] as FakeElement }
}

class FakeCore {
  nodeItems: FakeElement[] = []
  edgeItems: FakeElement[] = []
  layoutRuns = 0
  layoutStops = 0
  fit = vi.fn()
  destroy = vi.fn(() => { this.destroyedValue = true })
  stop = vi.fn()
  private destroyedValue = false
  private layoutStop?: () => void
  private selectListener?: (event: { target: FakeElement }) => void

  add(inputs: ElementInput[]) {
    for (const input of inputs) {
      const item = new FakeElement(this, input, this.nodeItems.length + this.edgeItems.length)
      if (input.group === "nodes") this.nodeItems.push(item)
      else this.edgeItems.push(item)
    }
  }
  clear() { this.nodeItems = []; this.edgeItems = [] }
  startBatch() {}
  endBatch() {}
  elements() { return new FakeCollection(this, [...this.nodeItems, ...this.edgeItems]) }
  nodes() { return new FakeCollection(this, this.nodeItems) }
  edges() { return new FakeCollection(this, this.edgeItems) }
  collection() { return new FakeCollection(this, []) }
  getElementById(id: string) { return new FakeCollection(this, [...this.nodeItems, ...this.edgeItems].filter((item) => item.id() === id)) }
  destroyed() { return this.destroyedValue }
  one(event: string, callback: () => void) { if (event === "layoutstop") this.layoutStop = callback }
  off(event: string) { if (event === "layoutstop") this.layoutStop = undefined }
  on(event: string, _selector: string, callback: (payload: { target: FakeElement }) => void) { if (event === "select") this.selectListener = callback }
  layout() {
    return {
      run: () => { this.layoutRuns += 1; const listener = this.layoutStop; this.layoutStop = undefined; listener?.() },
      stop: () => { this.layoutStops += 1 },
    }
  }
  resize() {}
  minZoom() { return 0.42 }
  maxZoom() { return 2.4 }
  zoom() { return 1 }
  animate() {}
  selectNode(id: string) {
    const node = this.getElementById(id).first()
    this.selectListener?.({ target: node })
  }
}

const fakeCores: FakeCore[] = []

vi.mock("cytoscape", () => ({
  default: vi.fn(() => {
    const core = new FakeCore()
    fakeCores.push(core)
    return core
  }),
}))

afterEach(() => {
  cleanup()
  fakeCores.length = 0
  vi.clearAllMocks()
})

const NODES = [
  { id: "c-ohm", kind: "concept" as const, label: { it: "Legge di Ohm" }, evidenceRefs: ["manual:page:71"] },
  { id: "e-short", kind: "error" as const, label: { it: "Corto circuito" }, evidenceRefs: ["board:elem-1"] },
  { id: "m-vol1", kind: "material" as const, label: { it: "Manuale Vol.1" }, evidenceRefs: ["manual:page:70"] },
]

const EDGES = [
  { from: "m-vol1", to: "c-ohm", kind: "cita" as const, introducedAt: 10 },
  { from: "e-short", to: "c-ohm", kind: "cita" as const, introducedAt: 20 },
]

function renderCanvas(overrides: Partial<React.ComponentProps<typeof LessonGraphCanvas>> = {}) {
  const onFocusNode = overrides.onFocusNode ?? vi.fn()
  const view = render(<LessonGraphCanvas focusNodeId="c-ohm" nodes={NODES} edges={EDGES} onFocusNode={onFocusNode} {...overrides} />)
  return { ...view, onFocusNode }
}

describe("LessonGraphCanvas", () => {
  it("populates the Cytoscape core with real nodes and edges, then runs layout and fit", () => {
    renderCanvas()

    const core = fakeCores.at(-1)
    expect(core?.nodeItems.map((node) => node.id())).toEqual(["c-ohm", "e-short", "m-vol1"])
    expect(core?.edgeItems).toHaveLength(EDGES.length)
    expect(core?.layoutRuns).toBeGreaterThan(0)
    expect(core?.fit).toHaveBeenCalled()
  })

  it("repopulates the replacement primary core after a StrictMode effect remount", () => {
    render(
      <StrictMode>
        <LessonGraphCanvas focusNodeId="c-ohm" nodes={NODES} edges={EDGES} onFocusNode={vi.fn()} />
      </StrictMode>,
    )

    const primaryCore = fakeCores.at(-1)
    expect(fakeCores).toHaveLength(2)
    expect(primaryCore?.destroyed()).toBe(false)
    expect(primaryCore?.nodeItems).toHaveLength(NODES.length)
    expect(primaryCore?.edgeItems).toHaveLength(EDGES.length)
    expect(primaryCore?.layoutRuns).toBeGreaterThan(0)
  })

  it("forwards Cytoscape selection to focus and destroys the populated core on unmount", () => {
    const { onFocusNode, unmount } = renderCanvas()
    const core = fakeCores.at(-1) as FakeCore

    core.selectNode("e-short")
    expect(onFocusNode).toHaveBeenCalledWith("e-short")

    unmount()
    expect(core.stop).toHaveBeenCalled()
    expect(core.destroy).toHaveBeenCalled()
    expect(core.destroyed()).toBe(true)
  })

  it("keeps the accessible node list and minimap SVG separate from the primary graph runtime", () => {
    renderCanvas({ newNodeIds: ["e-short"] })

    expect(screen.getByRole("button", { name: /Legge di Ohm/i })).toBeTruthy()
    expect(document.querySelector('[data-zgraph-node="e-short"]')?.getAttribute("data-delta")).toBe("new")
    expect(document.querySelector("svg[data-knowledge-minimap]")).not.toBeNull()
  })

  it("shows descriptors from the focused node without student data", () => {
    renderCanvas()
    const panel = screen.getByTestId("zgraph-descriptor")
    expect(panel.textContent).toContain("Legge di Ohm")
    expect(within(panel).getByText(/manual:page:71/)).toBeTruthy()
    expect(panel.textContent).not.toMatch(/@/)
  })

  it("uses displayed levels 1 through 3 and assigns disconnected nodes to level 3", () => {
    expect(displayedLevel(0)).toBe(1)
    expect(displayedLevel(1)).toBe(2)
    expect(displayedLevel(2)).toBe(3)
    expect(displayedLevel(undefined)).toBe(3)
  })
})
