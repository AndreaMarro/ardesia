import { test, expect, type Page } from "@playwright/test"
import JSZip from "jszip"
import { writeFile } from "node:fs/promises"

const ROOM = "led-readout-transport"
const ROUTE = `/#${ROOM}`
test.use({ viewport: { width: 1440, height: 1000 } })

async function inputLesson(page: Page, kind: "healthy" | "short" | "open" | "mono-short" | "mono-absent") {
  const board = await page.evaluate(async kind => {
    const modulePath = "/src/toolhost/ToolCanvasEmbeddable.tsx"
    const factories = await import(/* @vite-ignore */ modulePath)
    const scene = kind.startsWith("mono-") ? factories.createReferenceSimulationScene() : factories.createV1Cap9Esp6SimulationScene()
    if (kind === "mono-absent") delete scene.runtime.ledOn
    if (kind === "short" || kind === "mono-short") scene.connections.push({ from: "bat1:positive", to: "bat1:negative", color: "red", kind: "wire" })
    if (kind === "open") scene.connections = []
    const element = factories.createToolEmbedElement({ embedId: kind.startsWith("mono-") ? factories.REFERENCE_SIM_EMBED_ID : factories.ELAB_V1_RGB_LAMP_EMBED_ID, state: { kind: "simulation-scene-v1", scene } })
    return { type: "excalidraw", elements: [element], appState: {} }
  }, kind)
  const zip = new JSZip()
  zip.file("raw/board.excalidraw", JSON.stringify(board))
  zip.file("raw/events.jsonl", "")
  zip.file("raw/session.yaml", "v: 1\naudioConsent: false\n")
  return zip.generateAsync({ type: "nodebuffer" })
}

async function loadFile(page: Page, buffer: Buffer) {
  await page.locator('input[type="file"][accept*=".lesson"]').setInputFiles({ name: "led.lesson", mimeType: "application/zip", buffer })
  await expect(page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')).toHaveCount(1)
}

async function openLegacy(page: Page) {
  const legacy = page.locator("[data-legacy-free-assembly-harness]")
  const summary = legacy.locator("summary")
  await summary.scrollIntoViewIfNeeded()
  const bounds = await summary.boundingBox()
  if (!bounds) throw new Error("Legacy disclosure has no bounds")
  const point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
  const active = await page.evaluate(({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest("summary")), point)
  // Excalidraw first selects an embed, then a real double click activates it.
  if (!active) await page.mouse.dblclick(point.x, point.y)
  if (await legacy.getAttribute("open") === null) await summary.click()
  await expect(legacy).toHaveAttribute("open", "")
  return legacy
}

async function readout(page: Page, kind: "healthy" | "short" | "open") {
  const core = page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')
  await expect(core).toHaveAttribute("data-elab-canvas-measurement", kind === "short" ? "unknown" : "known")
  await expect(core.locator("[data-elab-core-canvas-host] svg")).toHaveCount(1)
  if (kind === "short") await expect(core.getByRole("status")).toContainText("non disponibile")
  const legacy = await openLegacy(page)
  const value = legacy.locator("[data-led-readout]")
  await expect(value).toHaveAttribute("data-led-readout", kind === "healthy" ? "on" : kind === "short" ? "unknown" : "off")
  await expect(value).toContainText(kind === "healthy" ? "LED RGB ON" : kind === "short" ? "LED RGB ?" : "LED RGB OFF")
  if (kind === "short") {
    await expect(legacy.locator("[data-rgb-channels]")).not.toContainText("0.0 mA")
    await expect(core.locator('[data-type="rgb-led"]')).not.toHaveAttribute("aria-label", /rgb\(/)
  }
  return value
}

for (const kind of ["healthy", "short", "open"] as const) {
  test(`real lesson transport retains ${kind} RGB evidence after a prior valid result`, async ({ page, browser }, info) => {
    const errors: string[] = []
    const observe = (p: Page) => {
      p.on("pageerror", e => errors.push(e.message))
      p.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
    }
    observe(page)
    await page.goto(ROUTE)
    await expect(page.locator(".excalidraw").first()).toBeVisible()
    await loadFile(page, await inputLesson(page, "healthy"))
    await readout(page, "healthy")
    if (kind !== "healthy") {
      await loadFile(page, await inputLesson(page, kind))
      await readout(page, kind)
    }
    await expect.poll(() => page.evaluate(async room => {
      const { workspaceStore } = await import("/src/store/WorkspaceStore.ts")
      return (await workspaceStore.loadScene(room))?.includes("v1-cap9-esp6") ?? false
    }, ROOM)).toBe(true)
    await page.reload()
    await readout(page, kind)
    const exportedData = await page.evaluate(async room => {
      const { workspaceStore } = await import("/src/store/WorkspaceStore.ts")
      const { openIndexedDbEventLog } = await import("/src/lessonos/indexedDbEventLog.ts")
      const { buildRoomStudyDigest } = await import("/src/lessonos/studyDigest.ts")
      const handle = await openIndexedDbEventLog()
      try {
        if (handle.log === null) throw new Error("Real event log unavailable")
        const events = await handle.log.readAll()
        return { bytes: Array.from(new Uint8Array(await (await workspaceStore.exportLesson(room, handle.log)).arrayBuffer())), digest: buildRoomStudyDigest(events, room), events }
      }
      finally { await handle.close() }
    }, ROOM)
    const buffer = Buffer.from(exportedData.bytes)
    if (kind === "short") expect(exportedData.digest.errors.some(error => /corto circuito/i.test(error.label))).toBe(true)
    const exported = await JSZip.loadAsync(buffer)
    const snapshot = await exported.file("raw/lessonos-events.jsonl")!.async("text")
    const events = snapshot.trim().split("\n").map(line => JSON.parse(line))
    const relevant = events.filter(e => e.kind.startsWith("simulation."))
    expect(relevant.at(-1)?.kind).toBe(kind === "short" ? "simulation.error.observed" : "simulation.circuit.solved")
    if (kind === "open") expect(relevant.at(-1)?.payload.currentMa).toBe(0)
    const path = info.outputPath(`rgb-${kind}.lesson`)
    await writeFile(path, buffer)
    await writeFile(info.outputPath("canonical-events.json"), JSON.stringify(events, null, 2))
    await writeFile(info.outputPath("study-digest.json"), JSON.stringify(exportedData.digest, null, 2))
    await writeFile(info.outputPath("legacy-events.json"), JSON.stringify(exportedData.events, null, 2))
    const recipient = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    try {
      const cold = await recipient.newPage()
      observe(cold)
      await cold.goto(ROUTE)
      await expect(cold.locator(".excalidraw").first()).toBeVisible()
      await expect(cold.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')).toHaveCount(0)
      await loadFile(cold, buffer)
      await cold.reload()
      const value = await readout(cold, kind)
      await value.scrollIntoViewIfNeeded()
      await cold.mouse.click(1420, 920)
      await cold.screenshot({ path: info.outputPath(`rgb-${kind}-recipient.png`) })
      await expect(cold).toHaveTitle("Ardesia · studio")
      await expect(cold.locator("vite-error-overlay")).toHaveCount(0)
    } finally { await recipient.close() }
    expect(errors).toEqual([])
  })
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`Lab panel and primary canvas share measured LED state at width${viewport.width}`, async ({ page }, info) => {
    const errors: string[] = []
    page.on("pageerror", e => errors.push(e.message))
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
    await page.setViewportSize(viewport)
    await page.goto("/?vista=elab-lab&esperimento=v1-cap6-esp1")
    await expect(page.locator("[data-led-on]")).toHaveText("acceso")
    await expect(page.locator('[data-elab-canvas] [data-type="led"]')).toHaveAttribute("aria-label", /acceso/)
    await page.screenshot({ path: info.outputPath("lab-shared-result.png") })
    expect(errors).toEqual([])
  })
}


for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`mono short and absent state remain unavailable after real import/reload at ${viewport.width}px`, async ({ page }, info) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on("pageerror", e => errors.push(e.message))
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()) })
    await page.goto(ROUTE)
    await expect(page.locator(".excalidraw").first()).toBeVisible()
    for (const kind of ["mono-short", "mono-absent"] as const) {
      await loadFile(page, await inputLesson(page, kind))
      await page.reload()
      if (viewport.width < 500) {
        await page.locator(".excalidraw").first().click({ position: { x: 20, y: 200 } })
        await page.keyboard.press("Shift+1")
      }
      const core = page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')
      await expect(core).toHaveAttribute("data-elab-canvas-measurement", kind === "mono-short" ? "unknown" : "known")
      const legacy = await openLegacy(page)
      await expect(legacy.locator("[data-battery-led-readout]")).toHaveAttribute("data-battery-led-readout", "unknown")
      await expect(legacy).toContainText("corrente ? mA")
      await expect(legacy.locator('[aria-label$="stato non disponibile"]')).toHaveCount(1)
      const metrics = page.locator('[data-simulation-surface="elab-core-canvas"] aside').first()
      await expect(metrics).toContainText("LED?")
      await expect(metrics).toContainText("corrente? mA")
      if (kind === "mono-short") await page.screenshot({ path: info.outputPath("mono-short-unknown.png") })
    }
    await expect(page).toHaveTitle("Ardesia · studio")
    await expect(page.locator("vite-error-overlay")).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
