// Ripasso LIVE end-to-end (handoff NOTTE-10 punto 2) — la domanda vera:
// un errore osservato in una lezione REALE (ElabLab, fase CHIEDI) arriva
// fino alla zona "Ripasso errori" del cruscotto docente?
//
// Flusso provato, stesso profilo browser (stessa IndexedDB lessonos-eventlog):
//   ?vista=elab-lab  → marcatura errore comune (error.observed nel log)
//   ?vista=cruscotto → zona ripasso monta il plugin #117 via ToolHost reale,
//                      graph.query legge il materializer → l'errore compare.
// Se il ponte è rotto, questo test è il primo ad arrossire.
import { test, expect } from "@playwright/test"

test("errore osservato in ElabLab → compare nel ripasso del cruscotto", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  // 1. Lezione reale: marca un errore comune in ElabLab (stesso flusso
  //    dell'e2e golden-path elab-lab.spec.ts).
  await page.goto("/?vista=elab-lab")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })

  const marcatura = page.locator("[data-elab-lab-marcatura]")
  await expect(marcatura).toBeVisible({ timeout: 15_000 })
  await marcatura.locator("input[name=elab-lab-concept]").first().check()
  const mistakeButton = marcatura.locator("[data-mistake-id]").first()
  await expect(mistakeButton).toBeEnabled({ timeout: 15_000 })
  const mistakeLabel = (await mistakeButton.textContent())?.trim() ?? ""
  expect(mistakeLabel.length).toBeGreaterThan(0)
  await mistakeButton.click()
  // Il verdetto deve essere VISTO, non solo presente. Misurato il 2026-08-23:
  // con i verdetti resi `display: none` — nel DOM e fuori dallo schermo —
  // TUTTI E DODICI i journey del cancello restavano verdi. Un'asserzione di
  // testo o attributo legge l'albero, non la vista.
  await expect(marcatura.locator("[data-marked-count]")).toBeVisible()
  await expect(marcatura.locator("[data-marked-count]")).toHaveText("errori segnati: 1")

  // 2. Cruscotto docente nello STESSO profilo: la zona ripasso deve vedere
  //    l'errore appena osservato (nessun secondo store: solo event-log).
  await page.goto("/?vista=cruscotto")
  const ripasso = page.locator("[data-zripasso]")
  await expect(ripasso).toBeVisible({ timeout: 15_000 })
  await expect(ripasso).toHaveAttribute("data-zripasso-aperti", /^[1-9]\d*$/, {
    timeout: 15_000,
  })

  expect(consoleErrors).toEqual([])
})
