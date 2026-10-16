// @vitest-environment jsdom
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import JSZip from "jszip"
import RecapView from "../RecapView"
import { closedLessonFixture, MATERIAL_ROOM } from "./closedLessonFixture"
import type { WorkspaceStore } from "../store/WorkspaceStore"

let root: Root; let container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render(store: WorkspaceStore, room = MATERIAL_ROOM) {
  await act(async () => root.render(<RecapView store={store} room={room} />))
}
async function ready() {
  await vi.waitFor(async () => { await act(async () => {}); expect(container.querySelector("iframe")).not.toBeNull() })
}
const exportButton = () => [...container.querySelectorAll("button")].find(button => /esporta.*lesson/i.test(button.textContent ?? ""))!

describe("closed capture in the real recap consumer", () => {
  it("downloads the captured title and bytes even after the workspace changes", async () => {
    const { store } = await closedLessonFixture(); const blobs: Blob[] = []
    class DownloadURL extends URL {
      static createObjectURL = vi.fn((blob: Blob) => { blobs.push(blob); return "blob:synthetic" })
      static revokeObjectURL = vi.fn()
    }
    vi.stubGlobal("URL", DownloadURL)
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
    await render(store); await ready()
    const preview = container.querySelector("iframe")!.srcdoc
    await store.saveMeta(MATERIAL_ROOM, { v: 1, name: "AFTER CAPTURE", createdAt: 2000 })
    await act(async () => exportButton().click())
    await vi.waitFor(() => expect(blobs).toHaveLength(1))
    const zip = await JSZip.loadAsync(blobs[0]!)
    expect(await zip.file(`raw/${MATERIAL_ROOM}/meta.json`)!.async("text")).toContain("Lezione sintetica DC")
    expect(container.querySelector("iframe")!.srcdoc).toBe(preview)
    expect(preview).toContain("SHA-256")
  })

  it("shows unavailable canonical memory as an error and offers no partial document/download", async () => {
    const { store } = await closedLessonFixture(); vi.stubGlobal("indexedDB", undefined)
    await render(store)
    await vi.waitFor(async () => { await act(async () => {}); expect(container.querySelector('[role="alert"]')).not.toBeNull() })
    expect(container.querySelector("iframe")).toBeNull()
    expect(exportButton().disabled).toBe(true)
    expect([...container.querySelectorAll("button")].find(button => /scarica recap/i.test(button.textContent ?? ""))!.disabled).toBe(true)
  })

  it("clears the previous room's error when a valid closed lesson is selected", async () => {
    const { store } = await closedLessonFixture()
    await render(store, "../invalid")
    await vi.waitFor(async () => { await act(async () => {}); expect(container.querySelector('[role="alert"]')).not.toBeNull() })
    await render(store); await ready()
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.textContent).toContain("Lezione sintetica DC")
  })
})
