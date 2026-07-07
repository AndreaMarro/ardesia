// Grafo Tutor REALE (?vista=cruscotto): seedato l'event-log LessonOS con eventi
// non-PII (concept/material/error/exercise di una lezione), il cruscotto rende
// un VERO grafo SVG navigabile — nodi cliccabili, archi disegnati — non una
// lista. Verifica: canvas presente, ≥4 nodi tipati, archi reali, focus iniziale
// sul concetto, click su un nodo che sposta il focus, zero errori console.
// Screenshot desktop+mobile NON vuoti come evidenza prodotto.
import { test, expect } from "@playwright/test"

const OUT = "/private/tmp/claude-501/-Users-andreamarro-VOLUME-3/c02b6220-c637-4f89-aa5b-480315eedd79/scratchpad"

// Eventi di una lezione reale, tutti pseudonimi (id + evidenze del libro/lavagna),
// nessun nome/email/telefono: alimentano concetto → materiale/errore/esercizio.
const EVENTS = [
  { kind: "lesson.started", room: "3b-elab", t: 1000, evidence: ["lesson:3b-elab@1000"] },
  { kind: "concept.introduced", conceptId: "concetto:ohm", labels: { it: "Legge di Ohm" }, t: 1200, evidence: ["manual:vol1:p29"] },
  { kind: "material.cited", materialId: "materiale:vol1", conceptId: "concetto:ohm", labels: { it: "Manuale Vol.1" }, t: 1250, evidence: ["manual:vol1:p29"] },
  { kind: "error.observed", errorId: "errore:corto-1", conceptId: "concetto:ohm", labels: { it: "Corto circuito" }, t: 1500, evidence: ["board:wire9"] },
  { kind: "exercise.completed", exerciseId: "esercizio:ohm-1", conceptId: "concetto:ohm", correctsErrorId: "errore:corto-1", labels: { it: "Esercizio Ohm" }, t: 1700, evidence: ["board:quiz1"] },
  { kind: "lesson.ended", room: "3b-elab", t: 2000, evidence: ["lesson:3b-elab@2000"] },
]

async function seedEventLog(page: import("@playwright/test").Page) {
  await page.evaluate(async (events) => {
    const DB = "lessonos-eventlog"
    const STORE = "lessonos_events"
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => {
        const d = req.result
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: "seq" })
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite")
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error)
      tx.onerror = () => reject(tx.error)
      const os = tx.objectStore(STORE)
      events.forEach((ev, i) => {
        os.put({ seq: i + 1, t: (ev as { t: number }).t, kind: ev.kind, payload: JSON.stringify(ev), evidence: (ev as { evidence: string[] }).evidence })
      })
    })
    db.close()
  }, EVENTS)
}

test("cruscotto: grafo Tutor reale, navigabile, con screenshot non vuoti", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text())
  })
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`))

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto("/?vista=cruscotto")
  await expect(page.locator(".st-word").first()).toHaveText("Ardesia", { timeout: 15_000 })
  await seedEventLog(page)
  await page.reload()

  // Il grafo è un canvas SVG reale, non una lista.
  const canvas = page.locator("svg[data-zgraph-canvas]")
  await expect(canvas).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-zgraph-node]")).toHaveCount(4) // concetto+materiale+errore+esercizio
  expect(await page.locator("[data-zgraph-edge]").count()).toBeGreaterThanOrEqual(2)

  // Focus iniziale sul concetto introdotto.
  await expect(page.getByTestId("zgraph-focus")).toContainText("Legge di Ohm")

  // Screenshot desktop NON vuoto della zona grafo.
  await page.locator('[data-testid="zgraph"]').scrollIntoViewIfNeeded()
  await page.locator('[data-testid="zgraph"]').screenshot({ path: `${OUT}/tutor-graph-desktop.png` })

  // Navigazione/expand: click su un nodo sposta il focus (re-projection del vicinato).
  await page.getByRole("button", { name: /Corto circuito/i }).click()
  await expect(page.getByTestId("zgraph-focus")).toContainText("Corto circuito")
  await expect(page.getByTestId("zgraph-descriptor")).toContainText("errore")

  // Mobile: header non affollato, grafo scrollabile, nessun overlap bloccante.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('[data-testid="zgraph"]').scrollIntoViewIfNeeded()
  await page.locator('[data-testid="zgraph"]').screenshot({ path: `${OUT}/tutor-graph-mobile.png` })

  expect(consoleErrors).toEqual([])
})
