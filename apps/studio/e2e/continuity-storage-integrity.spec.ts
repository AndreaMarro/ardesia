import { test, expect, type Page } from "@playwright/test"

const ROOM = "storage-integrity-room"
const SESSION = "11111111-1111-4111-8111-111111111111"
const DATABASE = "lessonos-eventlog"
const STORE = "lessonos_events"

function canonical(seq: number, lessonId: string = ROOM): Record<string, unknown> {
  return {
    schemaVersion: 2, seq,
    eventId: `70000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    lessonId, sessionId: SESSION, kind: "lesson.started",
    occurredAt: `2026-10-16T00:00:${String(seq).padStart(2, "0")}.000Z`,
    actor: { type: "teacher", id: "founder-beta-teacher" },
    producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: "b".repeat(40) },
    causationId: null, idempotencyKey: `storage-integrity:${seq}`,
    evidence: [{ ref: `lesson:${lessonId}@${seq}`, resolution: "verified" }],
    payload: { room: lessonId },
  }
}

const legacy = { kind: "lesson.started", room: ROOM, t: 1, evidence: [`lesson:${ROOM}@1`] }
const cases = [
  { name: "sequenza interrotta senza chiavi della lezione", rows: [canonical(1, "other-room"), canonical(3, "other-room")], backend: "corrupt", state: "storage-degraded", title: "Archivio danneggiato" },
  { name: "V2 malformato non indicizzabile", rows: [{ seq: 1, schemaVersion: 2, eventId: "invalid", kind: "unknown" }], backend: "data-loss", state: "storage-degraded", title: "Archivio parziale" },
  { name: "righe legacy non attribuite", rows: [{ seq: 1, ...legacy, payload: JSON.stringify(legacy) }], backend: "data-loss", state: "storage-degraded", title: "Archivio parziale" },
  { name: "sequenza interrotta con chiavi ancora presenti", rows: [canonical(1), canonical(3)], backend: "corrupt", state: "storage-degraded", title: "Archivio danneggiato" },
  { name: "archivio verificato realmente vuoto", rows: [], backend: "verified-indexeddb", state: "no-sessions", title: "Nessuna sessione da riprendere" },
  { name: "archivio verificato con sessione", rows: [canonical(1)], backend: "verified-indexeddb", state: "sessions", title: "Riprendi una sessione" },
]

async function physicalRows(page: Page): Promise<unknown[]> {
  return page.evaluate(async ({ database, store }) => new Promise<unknown[]>((resolve, reject) => {
    const request = indexedDB.open(database)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(store, "readonly")
      const rows = tx.objectStore(store).getAll()
      tx.onabort = () => { db.close(); reject(tx.error) }
      tx.oncomplete = () => { db.close(); resolve(rows.result) }
    }
  }), { database: DATABASE, store: STORE })
}

for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  test.describe(viewport.name, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })
    for (const scenario of cases) {
      test(scenario.name, async ({ page, context }, testInfo) => {
        const errors: string[] = []
        const observe = (tab: Page) => {
          tab.on("pageerror", error => errors.push(error.message))
          tab.on("console", message => { if (message.type() === "error") errors.push(message.text()) })
        }
        observe(page)
        const url = `/?vista=continuita#${ROOM}`
        await page.goto(url)
        await expect(page.getByTestId("continuity-surface")).toHaveAttribute("data-state", "no-sessions")
        // Soltanto lo storage del contesto sintetico appena creato: nessun profilo utente.
        await page.evaluate(async ({ database, store, rows }) => new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(database)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            const db = request.result
            const tx = db.transaction(store, "readwrite")
            tx.objectStore(store).clear()
            for (const row of rows) tx.objectStore(store).put(row)
            tx.onabort = () => { db.close(); reject(tx.error) }
            tx.oncomplete = () => { db.close(); resolve() }
          }
        }), { database: DATABASE, store: STORE, rows: scenario.rows })
        const before = await physicalRows(page)
        expect(before).toEqual(scenario.rows)
        const backend = await page.evaluate(async () => {
          const { openIndexedDbEventLog } = await import("/src/lessonos/indexedDbEventLog.ts")
          const handle = await openIndexedDbEventLog()
          try { return handle.backend.kind } finally { await handle.close() }
        })
        expect(backend).toBe(scenario.backend)

        await page.reload()
        await expect(page.getByTestId("continuity-surface")).not.toHaveAttribute("data-state", "loading")
        const screenshot = testInfo.outputPath("integrity-screen.png")
        await page.screenshot({ path: screenshot })
        await testInfo.attach("integrity-screen", { path: screenshot, contentType: "image/png" })
        await expect(page.getByTestId("continuity-surface")).toHaveAttribute("data-state", scenario.state)
        await expect(page.getByRole("heading", { name: scenario.title, exact: true })).toBeVisible()
        await expect(page).toHaveTitle("Ardesia · studio")
        expect(new URL(page.url()).hash).toBe(`#${ROOM}`)
        await expect(page.locator("vite-error-overlay")).toHaveCount(0)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        if (scenario.state === "storage-degraded") {
          await expect(page.getByText("Nessuna sessione da riprendere", { exact: true })).toHaveCount(0)
          await expect(page.getByTestId("continuity-session")).toHaveCount(0)
        }
        expect(await physicalRows(page)).toEqual(before)
        await page.close()

        const cold = await context.newPage()
        observe(cold)
        await cold.goto(url)
        await expect(cold.getByTestId("continuity-surface")).toHaveAttribute("data-state", scenario.state)
        expect(await physicalRows(cold)).toEqual(before)
        const materials = cold.locator('[data-view-nav-item="materiali"]')
        await materials.focus()
        await expect(materials).toBeFocused()
        await cold.keyboard.press("Enter")
        await expect(cold).toHaveURL(new RegExp(`vista=lezioni-salvate#${ROOM}$`))
        expect(errors).toEqual([])
      })
    }
  })
}
