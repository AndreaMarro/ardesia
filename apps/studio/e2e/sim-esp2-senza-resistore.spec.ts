// v1-cap6-esp2 "LED senza resistore (cosa NON fare!)" — golden path reale
// nell'ELAB Lab: l'esperimento è in whitelist (picker), il solve del motore
// vendored dichiara il LED BRUCIATO (mai un finto acceso), la citazione punta
// a Vol.1 p.32. Screenshot desktop + mobile come evidenza visiva.
import { test, expect } from "@playwright/test"

async function collectConsoleErrors(page: import("@playwright/test").Page) {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`)
  })
  return errors
}

test("ELAB Lab esp2: solve onesto BRUCIATO, whitelist nel picker, console pulita", async ({
  page,
}) => {
  const consoleErrors = await collectConsoleErrors(page)

  await page.goto("/?vista=elab-lab&esperimento=v1-cap6-esp2")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })

  // Il picker offre SOLO la whitelist (8 opzioni, disciplina Scene Forge).
  const select = page.locator("select[data-elab-experiment-select]")
  await expect(select).toBeVisible()
  await expect(select.locator("option")).toHaveCount(8)
  await expect(select).toHaveValue("v1-cap6-esp2")

  // Solve reale via registry: il LED è BRUCIATO, non acceso.
  await expect(page.locator("[data-elab-lab-solve=ok]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-led-burned]")).toHaveAttribute("data-led-burned", "1")
  await expect(page.locator("[data-led-on]")).toHaveAttribute("data-led-on", "0")
  await expect(page.getByText("BRUCIATO (sovracorrente!)")).toBeVisible()

  // Citazione reale dal Pack: Vol.1 p.32.
  const citazione = page.locator("[data-elab-lab-citation]")
  await expect(citazione).toBeVisible()
  await expect(citazione).toContainText("Vol. 1, p. 32")

  // Evidenza visiva desktop.
  await page.screenshot({ path: "test-results/esp2-elab-lab-desktop.png", fullPage: false })

  // Mobile: la vista resta leggibile e il verdetto onesto resta visibile.
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator("[data-led-burned]")).toHaveAttribute("data-led-burned", "1")
  await page.screenshot({ path: "test-results/esp2-elab-lab-mobile.png", fullPage: false })

  expect(consoleErrors).toEqual([])
})

// IL SECONDO TEST DI QUESTO FILE E' STATO RIMOSSO (2026-07-30).
//
// Asseriva che l'esperimento comparisse come post-it SULLA LAVAGNA cliccando il
// bottone di toolbar "Inserisci esperimento LED senza resistore sulla lavagna".
// Quel bottone e' stato ritirato APPOSTA dal commit e7ebc42f del 2026-07-20
// ("constrain founder beta lesson surface"), che ha sostituito i bottoni
// per-esperimento con l'allowlist chiusa della Founder Beta — e nello stesso
// commit ha aggiornato `product-flow-shell.spec.ts`, che oggi asserisce
// l'ASSENZA di "sim esp2/esp3/esp6" dalle azioni di lezione.
//
// Le due asserzioni erano quindi CONTRADDITTORIE: una pretendeva il bottone,
// l'altra ne pretendeva l'assenza. Tenere entrambe significa una suite che non
// puo' diventare verde per costruzione.
//
// La garanzia sul rendering di esp2 NON e' andata persa: il test qui sopra la
// copre sulla rotta ELAB Lab, che e' quella superstite, e lo fa in modo piu'
// forte (verdetto BRUCIATO dal solve reale, whitelist del picker, citazione
// Vol.1 p.32).
