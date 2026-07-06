// Smoke Z7 — il cruscotto docente (?vista=cruscotto) carica pulito: brand,
// zona Student-pack visibile, empty state ONESTO su profilo browser fresco
// (IndexedDB vuoto = coda vuota reale, non un errore mascherato), zero errori
// console. La derivazione candidati è coperta dai test jsdom sul proiettore
// reale (TeacherDashboardZ7View.test.tsx).
import { test, expect } from "@playwright/test"

test("cruscotto: zona Z7 con empty state onesto, console senza errori", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/?vista=cruscotto")

  await expect(page.locator(".st-word").first()).toHaveText("Ardesia", { timeout: 15_000 })
  await expect(page.getByRole("heading", { name: /student-pack/i })).toBeVisible({
    timeout: 15_000,
  })
  // Browser fresco: event log vuoto → empty state dichiarato, mai zona muta.
  await expect(page.getByText(/nessun candidato/i)).toBeVisible({ timeout: 15_000 })

  expect(consoleErrors).toEqual([])
})
