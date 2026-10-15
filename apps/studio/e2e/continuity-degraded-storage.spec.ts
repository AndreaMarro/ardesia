import { expect, test } from "@playwright/test"

const LESSON = "wbstudio-degraded"
const SESSION = "11111111-1111-4111-8111-111111111111"
const canonical = (seq: number) => ({
  seq, schemaVersion: 2, eventId: `70000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
  lessonId: LESSON, sessionId: SESSION, kind: "lesson.started", occurredAt: "2026-10-15T00:00:00.000Z",
  actor: { type: "teacher", id: "synthetic-teacher" },
  producer: { id: "com.github.andreamarro.ardesia.studio", version: "0.0.0", commitSha: "a".repeat(40) },
  causationId: null, idempotencyKey: `degraded:${seq}`,
  evidence: [{ ref: `lesson:${LESSON}@${seq}`, resolution: "verified" }], payload: { room: LESSON },
})

const cases: Array<{ name: string; rows: Record<string, unknown>[]; heading: string; links: number }> = [
  { name: "malformed-unindexed", rows: [{ seq: 1, schemaVersion: 2 }], heading: "Archivio incompleto", links: 0 },
  { name: "mixed-recoverable", rows: [canonical(1), { seq: 2, schemaVersion: 2 }], heading: "Archivio incompleto", links: 1 },
  { name: "malformed-addressable", rows: [{ seq: 1, schemaVersion: 2, lessonId: LESSON, sessionId: SESSION }], heading: "Archivio incompleto", links: 1 },
  { name: "invalid-keys", rows: [
    { seq: 1, schemaVersion: 2, lessonId: LESSON, sessionId: 7 },
    { seq: 2, schemaVersion: 2, lessonId: LESSON, sessionId: "not-a-uuid" },
  ], heading: "Archivio incompleto", links: 0 },
  { name: "corrupt-sequence", rows: [canonical(1), canonical(3)], heading: "Archivio danneggiato", links: 0 },
]

for (const [viewportName, viewport] of [
  ["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }],
] as const) {
  test.describe(viewportName, () => {
    test.use({ viewport })
    for (const scenario of cases) {
      test(scenario.name, async ({ page }, testInfo) => {
        const errors: string[] = []
        page.on("pageerror", error => errors.push(error.message))
        await page.goto("/?vista=continuita")
        await expect(page.getByTestId("continuity-surface")).toHaveAttribute("data-state", "no-lesson")
        // Righe fisiche sintetiche nel vero IndexedDB Chromium. La migration
        // del log aggiungera' il proprio indice senza riscrivere le righe.
        await page.evaluate(async rows => {
          await new Promise<void>((resolve, reject) => {
            const request = indexedDB.open("lessonos-eventlog", 1)
            request.onupgradeneeded = () => request.result.createObjectStore("lessonos_events", { keyPath: "seq" })
            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
              const db = request.result
              const tx = db.transaction("lessonos_events", "readwrite")
              for (const row of rows) tx.objectStore("lessonos_events").put(row)
              tx.oncomplete = () => { db.close(); resolve() }
              tx.onerror = () => { db.close(); reject(tx.error) }
              tx.onabort = () => { db.close(); reject(tx.error) }
            }
          })
        }, scenario.rows)
        await page.goto(`/?vista=continuita#${LESSON}`)
        // Il solo hash puo' essere navigazione nello stesso documento. Qui
        // serve una riapertura a freddo, dopo che il seed e' stato committato.
        await page.reload()
        await expect(page.getByRole("heading", { name: scenario.heading, exact: true })).toBeVisible()
        const surface = page.getByTestId("continuity-surface")
        await expect(surface).toHaveAttribute("data-state", "storage-degraded")
        await expect(surface).not.toContainText("Nessuna sessione da riprendere")
        await expect(page.getByTestId("continuity-session")).toHaveCount(scenario.links)
        expect(await surface.textContent()).not.toContain(SESSION)
        await page.keyboard.press("Tab")
        await expect(page.getByRole("link", { name: "Lezione", exact: true })).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(page.getByRole("link", { name: "Continuità", exact: true })).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(page.getByRole("link", { name: "Materiali", exact: true })).toBeFocused()
        expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
        await page.screenshot({ path: testInfo.outputPath("degraded.png"), fullPage: true })
        if (scenario.links) {
          await page.getByRole("link", { name: "Controlla sessione 1", exact: true }).click()
          // Una chiave indirizzabile non autorizza una projection ready:
          // il loader deve ancora verificare scope e byte del contenuto.
          await expect(page.locator("[data-continuity-phase]"))
            .toHaveAttribute("data-continuity-phase", /^(degraded|corrupt)$/)
        }
        const after = await page.evaluate(async () => await new Promise<unknown[]>((resolve, reject) => {
          const request = indexedDB.open("lessonos-eventlog")
          request.onerror = () => reject(request.error)
          request.onsuccess = () => {
            const db = request.result
            const read = db.transaction("lessonos_events", "readonly").objectStore("lessonos_events").getAll()
            read.onsuccess = () => { db.close(); resolve(read.result) }
            read.onerror = () => { db.close(); reject(read.error) }
          }
        }))
        expect(after).toEqual(scenario.rows)
        expect(errors).toEqual([])
      })
    }
  })
}
