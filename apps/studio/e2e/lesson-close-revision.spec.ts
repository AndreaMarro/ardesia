import { test, expect, type Page } from "@playwright/test"
import JSZip from "jszip"
import { readFile, writeFile } from "node:fs/promises"

const ROOM = "closed-revision-synthetic"
const QUESTION = "Domanda sintetica: quale risultato conserva la lezione?"
type Failure = "delayed" | "rejected" | "lost-ack"

async function actions(page: Page) {
  const sim = page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna", exact: true })
  if (!await sim.isVisible()) await page.getByRole("button", { name: "Apri menu", exact: true }).click()
  return sim
}
async function materials(page: Page) {
  const link = page.locator('[data-view-nav-item="materiali"]')
  if (!await link.isVisible()) await page.getByRole("button", { name: "Apri menu", exact: true }).click()
  await link.click()
}
async function holdActualBackend(page: Page, mode: Failure) {
  await page.evaluate(async mode => {
    const path = "/src/lessonos/indexedDbEventLog.ts"
    const { IndexedDbEventLog } = await import(/* @vite-ignore */ path)
    const native = IndexedDbEventLog.prototype.appendEnvelope
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    const probe = { started: false, first: true, mode, release }
    ;(window as any).__CLOSE_WRITES_PROBE__ = probe
    IndexedDbEventLog.prototype.appendEnvelope = async function(envelope: any) {
      if (envelope.kind !== "simulation.circuit.solved" || !probe.first) return native.call(this, envelope)
      probe.first = false; probe.started = true
      await gate
      if (mode === "rejected") throw new Error("synthetic persistent append refused")
      const result = await native.call(this, envelope)
      if (mode === "lost-ack") throw new Error("synthetic ACK lost after persistent commit")
      return result
    }
  }, mode)
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  for (const mode of ["delayed", "rejected", "lost-ack"] as const) {
    test(`real accepted ${mode} write closes once before Materials at ${viewport.width}px`, async ({ page }, info) => {
      await page.setViewportSize(viewport)
      const errors: string[] = []
      page.on("pageerror", error => errors.push(error.message))
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
      await page.goto(`/#${ROOM}`)
      await expect(page.locator(".excalidraw").first()).toBeVisible()
      await page.getByRole("radio", { name: "Testo", exact: true }).locator("..").click()
      const point = await page.evaluate(() => {
        for (const y of [0.5, 0.7, 0.35]) for (const x of [0.8, 0.6, 0.4]) {
          const point = { x: innerWidth * x, y: innerHeight * y }
          if (document.elementFromPoint(point.x, point.y)?.tagName === "CANVAS") return point
        }
        throw new Error("No unobstructed drawing canvas point")
      })
      await page.mouse.click(point.x, point.y)
      const editor = page.locator("textarea.excalidraw-wysiwyg")
      await expect(editor).toBeVisible()
      await editor.fill(QUESTION)
      await editor.press("Escape")
      await expect.poll(() => page.evaluate(async ({ room, question }) => {
        const path = "/src/store/WorkspaceStore.ts"
        const { workspaceStore } = await import(/* @vite-ignore */ path)
        const source = await workspaceStore.loadScene(room)
        return source ? JSON.parse(source).elements.some((e: any) => e.type === "text" && e.text === question) : false
      }, { room: ROOM, question: QUESTION })).toBe(true)
      await holdActualBackend(page, mode)
      await (await actions(page)).click()
      await expect.poll(() => page.evaluate(() => (window as any).__CLOSE_WRITES_PROBE__?.started)).toBe(true)
      await materials(page)
      await expect(page).not.toHaveURL(/vista=/)
      await expect(page.getByRole("status", { name: "" }).filter({ hasText: "Chiusura della lezione" })).toHaveCount(1)
      await page.evaluate(() => (window as any).__CLOSE_WRITES_PROBE__.release())
      if (mode !== "delayed") {
        await expect(page.locator(".st-err")).toContainText(mode === "rejected" ? "synthetic persistent append refused" : "synthetic ACK lost")
        await expect(page).not.toHaveURL(/vista=/)
        await materials(page)
      }
      await expect(page).toHaveURL(new RegExp(`vista=lezioni-salvate#${ROOM}$`))
      await expect(page.getByRole("heading", { name: `Lezione ${ROOM}`, exact: true })).toBeVisible()
      const downloadPromise = page.waitForEvent("download")
      await page.getByRole("button", { name: "Esporta .lesson", exact: true }).click()
      const download = await downloadPromise
      const file = info.outputPath(`closed-${mode}.lesson`)
      await download.saveAs(file)
      const zip = await JSZip.loadAsync(await readFile(file))
      const events = (await zip.file("raw/lessonos-events.jsonl")!.async("text")).trim().split("\n").map(line => JSON.parse(line))
      const solved = events.filter(event => event.kind === "simulation.circuit.solved")
      expect(solved).toHaveLength(1)
      expect(events.at(-1)?.kind).toBe("lesson.ended")
      expect(solved[0].seq).toBeLessThan(events.at(-1)!.seq)
      expect(events.every(e => e.lessonId === ROOM && e.sessionId === solved[0].sessionId)).toBe(true)
      expect(new Set(events.map(e => e.eventId)).size).toBe(events.length)
      const journal = await zip.file("raw/events.jsonl")!.async("text")
      expect(journal).toContain(QUESTION)
      const manifest = JSON.parse(await zip.file("manifest.json")!.async("text"))
      await writeFile(info.outputPath("closed-revision-events.json"), JSON.stringify({ mode, viewport, manifest, events, journal: journal.trim().split("\n").map(line => JSON.parse(line)), codeState: "uncommitted draft; final exact-SHA rerun required" }, null, 2))
      await page.screenshot({ path: info.outputPath("materials-after-closed-revision.png") })
      await expect(page).toHaveTitle("Ardesia · studio")
      await expect(page.locator("vite-error-overlay")).toHaveCount(0)
      expect(errors).toEqual([])
    })
  }
}
