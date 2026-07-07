// v1-cap9-esp6 "Lampada RGB con 3 potenziometri" — post-it multi-pin sulla
// lavagna: 3 potenziometri (3 pin) + LED RGB (4 pin) renderizzati dal
// Simulation Plugin, canali dal motore MNA reale (runtime elab-mna).
// Evidenza visiva desktop + tablet + mobile.
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

test("lavagna: post-it esp6 dalla toolbar — 3 pot, LED RGB acceso, canali in mA reali", async ({
  page,
}) => {
  const consoleErrors = await collectConsoleErrors(page)

  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  await page
    .getByRole("button", { name: "Inserisci esperimento lampada RGB con 3 potenziometri sulla lavagna" })
    .click()

  // Gotcha Excalidraw: attendere l'ELEMENTO, mai lo stato.
  const stage = page.locator('[data-experiment-id="v1-cap9-esp6"]')
  await expect(stage).toBeVisible({ timeout: 15_000 })

  // Multi-pin renderizzato: 3 potenziometri e il LED RGB acceso.
  await expect(stage.locator("[aria-label^='Potenziometro']")).toHaveCount(3)
  await expect(stage.locator("[aria-label='LED RGB acceso']")).toBeVisible()

  // Diagnostica per canale dal solve MNA reale (mai valori pre-dichiarati).
  const channels = stage.locator("[data-rgb-channels]")
  await expect(channels).toBeVisible()
  await expect(channels).toContainText("mA")

  // Banner onestà: 4 scene montate su 88.
  const banner = page.locator("[data-elab-catalog-summary]")
  await expect(banner).toHaveAttribute("data-elab-catalog-summary", "4/88")

  // Evidenza visiva desktop / tablet / mobile.
  await page.screenshot({ path: "test-results/esp6-lavagna-desktop.png", fullPage: false })
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(stage.locator("[aria-label='LED RGB acceso']")).toBeVisible()
  await page.screenshot({ path: "test-results/esp6-lavagna-tablet.png", fullPage: false })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(stage.locator("[aria-label='LED RGB acceso']")).toBeVisible()
  await page.screenshot({ path: "test-results/esp6-lavagna-mobile.png", fullPage: false })

  expect(consoleErrors).toEqual([])
})
