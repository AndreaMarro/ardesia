// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import MathComposer from "../MathComposer"

// MathLive's browser CustomElement is unavailable in jsdom. Only the native
// boundary is replaced here; real selection/history/keyboard are browser tests.
vi.mock("mathlive", () => {
  class TestMathfield extends HTMLElement {
    static fontsDirectory = ""
    static soundsDirectory: string | null = null
    value = ""
    readOnly = false
    disabled = false
    mathVirtualKeyboardPolicy = "auto"
    canUndo() { return false }
    canRedo() { return false }
    nativeConnected = false
    keyboardHidden = false
    connectedCallback() { this.nativeConnected = true }
    disconnectedCallback() { this.nativeConnected = false }
    executeCommand(selector: string) {
      // The real MathLive command target is destroyed on disconnect.
      if (!this.nativeConnected) return false
      if (selector === "hideVirtualKeyboard") this.keyboardHidden = true
      return true
    }
    insert(value: string) { this.value += value; return true }
  }
  customElements.define("test-math-field", TestMathfield)
  return { MathfieldElement: TestMathfield }
})

afterEach(() => { cleanup(); vi.restoreAllMocks() })
function field() {
  return document.querySelector("test-math-field") as HTMLElement & { value: string; readOnly: boolean; disabled: boolean; keyboardHidden: boolean; nativeConnected: boolean; insert: (value: string, options?: unknown) => boolean; executeCommand: (selector: string) => boolean }
}
function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

describe("formula host lifecycle", () => {
  it("hides the shared native keyboard while the mathfield is still connected", () => {
    const view = render(<MathComposer onInsert={() => {}} onClose={() => {}} />)
    const mf = field()
    const hide = vi.spyOn(mf, "executeCommand")
    const remove = vi.spyOn(mf, "remove")
    view.unmount()
    expect(mf.keyboardHidden).toBe(true)
    expect(mf.nativeConnected).toBe(false)
    expect(hide).toHaveBeenCalledWith("hideVirtualKeyboard")
    expect(hide.mock.invocationCallOrder[0]).toBeLessThan(remove.mock.invocationCallOrder[0]!)
  })

  it("sends one insertion while pending, then closes after success", async () => {
    const pending = deferred()
    const insert = vi.fn(() => pending.promise)
    const close = vi.fn()
    render(<MathComposer onInsert={insert} onClose={close} />)
    const button = screen.getByRole("button", { name: /inserisci sulla lavagna/ })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(insert).toHaveBeenCalledTimes(1)
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole("button", { name: "chiudi" }) as HTMLButtonElement).disabled).toBe(true)
    expect(field().readOnly).toBe(true)
    expect(field().disabled).toBe(true)
    expect(close).not.toHaveBeenCalled()
    await act(async () => { pending.resolve(); await pending.promise })
    expect(close).toHaveBeenCalledOnce()
    expect(field().disabled).toBe(false)
  })

  it("retains the expression on rejection and retries the same draft", async () => {
    const pending = deferred()
    const insert = vi.fn().mockImplementationOnce(() => pending.promise).mockResolvedValue(undefined)
    const close = vi.fn()
    render(<MathComposer onInsert={insert} onClose={close} />)
    field().value = "x^2+1"
    fireEvent.input(field())
    fireEvent.click(screen.getByRole("button", { name: /inserisci sulla lavagna/ }))
    await act(async () => { pending.reject(new Error("Canvas occupato")); await pending.promise.catch(() => {}) })
    expect(screen.getByRole("alert").textContent).toContain("Canvas occupato")
    expect(close).not.toHaveBeenCalled()
    expect(field().value).toBe("x^2+1")
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /inserisci sulla lavagna/ })) })
    expect(insert.mock.calls).toEqual([["x^2+1"], ["x^2+1"]])
    expect(close).toHaveBeenCalledOnce()
  })

  it("ignores a successful insertion after unmount", async () => {
    const pending = deferred()
    const close = vi.fn()
    const view = render(<MathComposer onInsert={() => pending.promise} onClose={close} />)
    fireEvent.click(screen.getByRole("button", { name: /inserisci sulla lavagna/ }))
    view.unmount()
    await act(async () => { pending.resolve(); await pending.promise })
    expect(close).not.toHaveBeenCalled()
  })

  it("blocks an empty expression", () => {
    const insert = vi.fn()
    render(<MathComposer onInsert={insert} onClose={() => {}} />)
    field().value = "  "
    fireEvent.input(field())
    expect((screen.getByRole("button", { name: /inserisci sulla lavagna/ }) as HTMLButtonElement).disabled).toBe(true)
    expect(insert).not.toHaveBeenCalled()
  })

  it("reports clipboard rejection without closing or losing the draft", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } })
    const close = vi.fn()
    render(<MathComposer onInsert={() => {}} onClose={close} />)
    field().value = "E=mc^2"
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "copia LaTeX" })) })
    expect(screen.getByRole("alert").textContent).toContain("copia")
    expect(field().value).toBe("E=mc^2")
    expect(close).not.toHaveBeenCalled()
  })

  it("confirms a successful LaTeX copy", async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: write } })
    render(<MathComposer onInsert={() => {}} onClose={() => {}} />)
    field().value = "a+b"
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "copia LaTeX" })) })
    expect(write).toHaveBeenCalledWith("a+b")
    expect(screen.getByRole("status").textContent).toContain("copiato")
  })

  it("requests math-mode structural insertion even when the native cursor is in text", () => {
    render(<MathComposer onInsert={() => {}} onClose={() => {}} />)
    const insert = vi.spyOn(field(), "insert")
    fireEvent.click(screen.getByRole("button", { name: "frazione" }))
    expect(insert).toHaveBeenCalledWith("\\frac{#0}{#?}", {
      format: "latex", mode: "math", insertionMode: "replaceSelection", selectionMode: "placeholder",
    })
  })

  it("commits native LaTeX composition before inserting a template", () => {
    render(<MathComposer onInsert={() => {}} onClose={() => {}} />)
    const complete = vi.spyOn(field(), "executeCommand")
    const insert = vi.spyOn(field(), "insert")
    fireEvent.click(screen.getByRole("button", { name: "frazione" }))
    expect(complete).toHaveBeenCalledWith("complete")
    expect(complete.mock.invocationCallOrder[0]).toBeLessThan(insert.mock.invocationCallOrder[0]!)
  })
})
