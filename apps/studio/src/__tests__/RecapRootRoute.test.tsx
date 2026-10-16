// @vitest-environment jsdom
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { workspaceStore } from "../store/WorkspaceStore"
import App from "../App"

vi.mock("../Room", () => ({ default: () => <div data-testid="room-writer">Room writer</div> }))
vi.mock("../RecapView", () => ({ default: ({ room }: { room: string }) => <div data-testid="readonly-recap">{room}</div> }))
let root: Root; let container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount()); container.remove(); window.history.replaceState(null, "", "/")
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})
async function renderApp() {
  await act(async () => {
    root.render(<App />)
    // Await the real lazy route module; this test checks routing/ownership,
    // while the native browser covers its cold load.
    await import("../RecapPage")
  })
}

describe("root route for closed lesson material", () => {
  it("routes recap without mounting a Room writer or its activity registration", async () => {
    window.history.replaceState(null, "", "/?vista=recap#closed-synthetic")
    vi.spyOn(workspaceStore, "init").mockResolvedValue("localStorage")
    await renderApp()
    expect(container.querySelector('[data-testid="readonly-recap"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="room-writer"]')).toBeNull()
    expect(container.textContent).toContain("closed-synthetic")
  })

  it.each(["", "#.."])("does not create or initialize a lesson from an invalid hash %s", async hash => {
    window.history.replaceState(null, "", `/?vista=recap${hash}`)
    const init = vi.spyOn(workspaceStore, "init").mockResolvedValue("localStorage")
    await renderApp()
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
    expect(init).not.toHaveBeenCalled()
    expect(window.location.hash).toBe(hash)
    expect(container.querySelector('[data-testid="room-writer"]')).toBeNull()
  })
})
