// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import MathComposer from "../MathComposer"

// Mock mathlive — il costruttore MathfieldElement non esiste in jsdom
vi.mock("mathlive", () => {
  class MathfieldElement extends HTMLElement {
    static fontsDirectory = ""
    static soundsDirectory: string | null = null
    value = ""
    mathVirtualKeyboardPolicy = "auto"
    canUndo() { return false }
    canRedo() { return false }
    insert = vi.fn()
  }
  customElements.define("composer-math-field", MathfieldElement)
  return { MathfieldElement }
})

describe("MathComposer unificato", () => {
  it("rende il titolo Formula e bottoni struttura", () => {
    const { container } = render(<MathComposer onClose={() => {}} onInsert={() => {}} />)
    expect(container.querySelector(".st-composer-panel")).toBeTruthy()
    expect(container.querySelector(".st-card-title")?.textContent).toBe("Formula")
    expect(container.querySelector(".st-primary")?.textContent).toContain("inserisci sulla lavagna")
  })

  it("6 chip template italiani presenti", () => {
    const { container } = render(<MathComposer onClose={() => {}} onInsert={() => {}} />)
    const nodes = container.querySelectorAll(".st-chip")
    expect(nodes.length).toBe(6)
    const labels: string[] = []
    for (const n of nodes) {
      if (n.textContent) labels.push(n.textContent)
    }
    expect(labels).toContain("frazione")
    expect(labels).toContain("radice")
    expect(labels).toContain("integrale")
    expect(labels).toContain("sommatoria")
    expect(labels).toContain("limite")
    expect(labels).toContain("matrice")
  })

  it("click chip non crasha", () => {
    const { container } = render(<MathComposer onClose={() => {}} onInsert={() => {}} />)
    const chip = container.querySelector(".st-chip")
    expect(chip).toBeTruthy()
    expect(() => fireEvent.click(chip!)).not.toThrow()
    expect(container.querySelector(".st-composer-panel")).toBeTruthy()
  })

  it("chiudi chiama onClose", () => {
    const onClose = vi.fn()
    const { container } = render(<MathComposer onClose={onClose} onInsert={() => {}} />)
    let found: Element | null = null
    for (const b of container.querySelectorAll(".st-ghost")) {
      if (b.textContent === "chiudi") found = b
    }
    expect(found).toBeTruthy()
    fireEvent.click(found!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("non usa hex inline fuori da tokens", () => {
    const { container } = render(<MathComposer onClose={() => {}} onInsert={() => {}} />)
    const html = container.innerHTML
    const matches = (html.match(/#[\da-fA-F]{6}/g) ?? []) as string[]
    const bad = matches.filter((h: string) => h !== "#ffffff" && h !== "#fffefb")
    expect(bad).toEqual([])
  })
})
