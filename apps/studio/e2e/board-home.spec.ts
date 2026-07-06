// Smoke §8 segmento 0 — la lavagna home carica pulita: brand visibile,
// canvas Excalidraw montato (chunk lazy), ZERO errori console.
// I segmenti manuale→citazione→sim→errore→export arrivano quando le viste
// ELAB (#67/#68) e l'emittente error.observed sono su main (gate-Andrea).
import { test, expect } from "@playwright/test"

test("lavagna home: brand + canvas, console senza errori", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/")

  // Timeout esplicito come per il canvas: sotto carico (piu' run paralleli
  // sullo stesso dev server) l'entry lazy supera i 5s default — flake 2/6
  // osservato firsthand 2026-07-06.
  await expect(page.locator(".st-word").first()).toHaveText("Ardesia", { timeout: 15_000 })
  // Excalidraw è un chunk lazy: attesa esplicita del mount del canvas.
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  expect(consoleErrors).toEqual([])
})
