// @vitest-environment jsdom
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import JSZip from "jszip"
import RecapView from "../RecapView"
import * as lessonMaterial from "../store/lessonMaterial"
import { closedLessonFixture, MATERIAL_ROOM } from "./closedLessonFixture"
import type { WorkspaceStore } from "../store/WorkspaceStore"

let root: Root; let container: HTMLDivElement
const captureClosedLessonMaterial = lessonMaterial.captureClosedLessonMaterial
let pendingCapture: ReturnType<typeof captureClosedLessonMaterial> | null
beforeEach(() => {
  pendingCapture = null
  // Observe the real capture, including IndexedDB and hashes; don't replace it
  // with a fixture result or guess when its asynchronous read has finished.
  vi.spyOn(lessonMaterial, "captureClosedLessonMaterial").mockImplementation((...args) => {
    pendingCapture = captureClosedLessonMaterial(...args)
    return pendingCapture
  })
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container)
})
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render(store: WorkspaceStore, room = MATERIAL_ROOM) {
  await act(async () => root.render(<RecapView store={store} room={room} />))
}
async function ready() {
  await settled()
  expect(container.querySelector("iframe")).not.toBeNull()
}
async function settled() {
  expect(pendingCapture).not.toBeNull()
  await act(async () => { await Promise.allSettled([pendingCapture!]) })
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
    await settled()
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
    expect(container.querySelector("iframe")).toBeNull()
    expect(exportButton().disabled).toBe(true)
    expect([...container.querySelectorAll("button")].find(button => /scarica recap/i.test(button.textContent ?? ""))!.disabled).toBe(true)
    expect([...container.querySelectorAll("button")].find(button => /apri recap per stampare/i.test(button.textContent ?? ""))!.disabled).toBe(true)
  })

  it("opens exactly the captured HTML for printing without relaxing the preview sandbox", async () => {
    const { store } = await closedLessonFixture(); const blobs: Blob[] = []; const links: HTMLAnchorElement[] = []
    class PrintURL extends URL {
      static createObjectURL = vi.fn((blob: Blob) => { blobs.push(blob); return "blob:print-capture" })
      static revokeObjectURL = vi.fn()
    }
    vi.stubGlobal("URL", PrintURL)
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function(this: HTMLAnchorElement) { links.push(this) })
    await render(store); await ready()
    const preview = container.querySelector("iframe")!
    expect(preview.getAttribute("sandbox")).toBe("")
    const captured = preview.srcdoc
    await store.saveMeta(MATERIAL_ROOM, { v: 1, name: "AFTER CAPTURE", createdAt: 2000 })
    const open = [...container.querySelectorAll("button")].find(button => /apri recap per stampare/i.test(button.textContent ?? ""))
    expect(open).toBeDefined()
    await act(async () => open!.click())
    expect(blobs).toHaveLength(1)
    expect(await blobs[0]!.text()).toBe(captured)
    expect(links).toHaveLength(1)
    expect(links[0]!.target).toBe("_blank")
    expect(links[0]!.relList.contains("noopener")).toBe(true)
    expect(links[0]!.relList.contains("noreferrer")).toBe(true)
    expect(PrintURL.revokeObjectURL).not.toHaveBeenCalled()
    await render(store, "../invalid")
    expect(PrintURL.revokeObjectURL).toHaveBeenCalledWith("blob:print-capture")
  })

  it("keeps the captured material when preparing the print document fails", async () => {
    const { store } = await closedLessonFixture()
    class RefusedURL extends URL {
      static createObjectURL(): string { throw new Error("object URL refused") }
    }
    vi.stubGlobal("URL", RefusedURL)
    await render(store); await ready()
    const captured = container.querySelector("iframe")!.srcdoc
    const open = [...container.querySelectorAll("button")].find(button => /apri recap per stampare/i.test(button.textContent ?? ""))
    expect(open).toBeDefined()
    await act(async () => open!.click())
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Apertura del riepilogo non riuscita")
    expect(container.querySelector("iframe")!.srcdoc).toBe(captured)
    expect(exportButton().disabled).toBe(false)
  })

  it("clears the previous room's error when a valid closed lesson is selected", async () => {
    const { store } = await closedLessonFixture()
    await render(store, "../invalid")
    await settled()
    expect(container.querySelector('[role="alert"]')).not.toBeNull()
    await render(store); await ready()
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.textContent).toContain("Lezione sintetica DC")
  })
})
