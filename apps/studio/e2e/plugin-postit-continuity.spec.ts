import { test, expect, type Page } from "@playwright/test"
import JSZip from "jszip"
import { writeFile } from "node:fs/promises"
import { createPluginPostitBoardScene } from "../src/design/multiPostitBoardPersistence"
import { createMultiPostitWorkbenchPostits } from "../src/design/multiPostitWorkbenchModel"

const ROOM = "postit-continuity-proof"
const ROUTE = `/#${ROOM}`
const INSTANCES = ["elab-consumer", "sim-a", "sim-b"]

// Synthetic transport fixture. Provider readouts do not attest a live solver.
async function lessonFixture() {
  const zip = new JSZip()
  zip.file("raw/board.excalidraw", JSON.stringify(createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())))
  zip.file("raw/events.jsonl", "")
  zip.file("raw/session.yaml", "v: 1\naudioConsent: false\n")
  return zip.generateAsync({ type: "nodebuffer" })
}

async function importLesson(page: Page, buffer: Buffer) {
  await page.locator('input[type="file"][accept*=".lesson"]').setInputFiles({
    name: "postit-continuity.lesson", mimeType: "application/zip", buffer,
  })
  await expect(page.locator("[data-plugin-postit-instance]")).toHaveCount(3)
}

async function boardState(page: Page, persisted = false) {
  return page.evaluate(async ({ room, persisted }) => {
    type Element = { id: string; x: number; y: number; width: number; height: number; link?: string | null; isDeleted?: boolean; customData?: { maestroTool?: { schema?: string; owner?: string; state?: unknown } } }
    let elements: Element[]
    if (persisted) {
      const { workspaceStore } = await import("/src/store/WorkspaceStore.ts")
      const text = await workspaceStore.loadScene(room)
      elements = text === null ? [] : JSON.parse(text).elements
    } else {
      const api = (window as unknown as { __MAESTRO_TEST__?: { apiRef?: { current?: { getSceneElements(): Element[] } } } }).__MAESTRO_TEST__?.apiRef?.current
      if (!api) throw new Error("Existing Excalidraw API unavailable")
      elements = api.getSceneElements()
    }
    return elements.filter(e => !e.isDeleted && e.customData?.maestroTool?.schema === "plugin-postit-board-state/1")
      .map(e => ({ id: e.id, link: e.link, x: e.x, y: e.y, width: e.width, height: e.height, marker: e.customData!.maestroTool! }))
      .sort((a, b) => a.id.localeCompare(b.id))
  }, { room: ROOM, persisted })
}

async function assertReadouts(page: Page) {
  const cards = page.locator("[data-plugin-postit-instance]")
  await expect(cards).toHaveCount(3)
  expect(await cards.evaluateAll(nodes => nodes.map(n => n.getAttribute("data-plugin-postit-instance")).sort())).toEqual(INSTANCES)
  await expect(page.locator('[data-solver-output-instance="sim-a"]')).toHaveText("led current 0.0153")
  await expect(page.locator('[data-provider-output-instance="sim-b"]')).toContainText("FastAPI provider hub not configured")
  await expect(page.locator('[data-elabtutor-simulation-instance="sim-a"]')).toHaveText("consumer of sim-a")
  const ids = await page.locator('[id^="plugin-postit-"]').evaluateAll(nodes => nodes.map(n => n.id))
  expect(new Set(ids).size).toBe(ids.length)
  await expect(page.locator("vite-error-overlay")).toHaveCount(0)
  await expect(page).toHaveTitle("Ardesia · studio")
}

async function nudgeFirstPostit(page: Page) {
  const before = await boardState(page)
  const a = before.find(e => e.id === "plugin-postit-sim-a-board")!
  const bounds = await page.locator('[data-plugin-postit-instance="sim-a"]').boundingBox()
  if (!bounds) throw new Error("Post-it has no rendered bounds")
  await page.keyboard.press("Escape")
  await page.mouse.click(bounds.x - 2, bounds.y + bounds.height / 2)
  await page.keyboard.press("ArrowRight")
  await expect.poll(async () => (await boardState(page)).find(e => e.id === a.id)?.x).toBeGreaterThan(a.x)
  const after = await boardState(page)
  expect(after.filter(e => e.id !== a.id)).toEqual(before.filter(e => e.id !== a.id))
  return { before, after }
}

function watchErrors(page: Page, errors: string[]) {
  page.on("pageerror", e => errors.push(e.message))
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
}

for (const viewport of [{ name: "desktop", width: 1440, height: 960 }, { name: "tablet", width: 768, height: 1024 }]) {
  test(`real reload and isolated bundle transfer preserve post-it identity (${viewport.name})`, async ({ page, browser }, info) => {
    const errors: string[] = []
    watchErrors(page, errors)
    await page.setViewportSize(viewport)
    await page.goto(ROUTE)
    await expect(page.locator(".excalidraw").first()).toBeVisible()
    await expect(page.locator("[data-plugin-postit-instance]")).toHaveCount(0)
    await importLesson(page, await lessonFixture())
    await assertReadouts(page)
    const { before, after } = await nudgeFirstPostit(page)
    await expect.poll(() => boardState(page, true)).toEqual(after)
    await page.reload()
    await assertReadouts(page)
    expect(await boardState(page)).toEqual(after)
    expect(await boardState(page, true)).toEqual(after)

    // Export uses the real application API; this is not a UI export-flow proof.
    const bytes = await page.evaluate(async room => {
      const { workspaceStore } = await import("/src/store/WorkspaceStore.ts")
      return Array.from(new Uint8Array(await (await workspaceStore.exportLesson(room)).arrayBuffer()))
    }, ROOM)
    const buffer = Buffer.from(bytes)
    const exportPath = info.outputPath("postits-exported.lesson")
    await writeFile(exportPath, buffer)
    await info.attach("exported-lesson", { path: exportPath, contentType: "application/zip" })
    const recipient = await browser.newContext({ viewport })
    try {
      const cold = await recipient.newPage()
      watchErrors(cold, errors)
      await cold.goto(ROUTE)
      await expect(cold.locator(".excalidraw").first()).toBeVisible()
      await expect(cold.locator("[data-plugin-postit-instance]")).toHaveCount(0)
      expect(await boardState(cold, true)).toEqual([])
      await importLesson(cold, buffer)
      await expect.poll(() => boardState(cold, true)).toEqual(after)
      await cold.reload()
      await assertReadouts(cold)
      expect(await boardState(cold)).toEqual(after)
      // Canvas may legitimately reopen at 100% with off-screen cards on tablet.
      // Exercise the real zoom-to-fit shortcut before recording the overview.
      await cold.mouse.click(16, 600)
      await cold.keyboard.press("Shift+1")
      for (const instance of INSTANCES) {
        await expect(cold.locator(`[data-plugin-postit-instance="${instance}"]`)).toBeInViewport({ ratio: 0.99 })
      }
      await cold.screenshot({ path: info.outputPath("postits-recipient-reloaded.png") })
      const proofPath = info.outputPath("postits-identity.json")
      await writeFile(proofPath, JSON.stringify({ before, after, recipient: await boardState(cold), errors }, null, 2))
      await info.attach("identity-before-after", { path: proofPath, contentType: "application/json" })
    } finally { await recipient.close() }
    expect(errors).toEqual([])
  })
}

for (const failure of ["SecurityError", "QuotaExceededError"]) {
  test(`rejected scene write is visible and does not claim the new position (${failure})`, async ({ page }) => {
    const errors: string[] = []
    watchErrors(page, errors)
    await page.goto(ROUTE)
    await expect(page.locator(".excalidraw").first()).toBeVisible()
    await importLesson(page, await lessonFixture())
    const saved = await boardState(page)
    await expect.poll(() => boardState(page, true)).toEqual(saved)
    await page.evaluate(({ key, failure }) => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (name, value) {
        if (this === localStorage && name === key) throw new DOMException("Synthetic refused scene write", failure)
        original.call(this, name, value)
      }
    }, { key: `maestro:raw/${ROOM}/board.excalidraw`, failure })
    await nudgeFirstPostit(page)
    await expect(page.locator(".st-err")).toContainText("Salvataggio non riuscito")
    expect(await boardState(page, true)).toEqual(saved)
    await page.reload()
    await assertReadouts(page)
    expect(await boardState(page)).toEqual(saved)
    expect(errors).toEqual([])
  })
}
