// Product shell — passo-passo VIVO nel post-it del Simulation Plugin sulla
// lavagna reale: toggle → 4 step del libro valutati (tutti ✓ sulla scena
// canonica già-montata), evidenze Vol/pag verbatim, banner onestà catalogo.
// Screenshot desktop + mobile come CoV visivo.
import { test, expect } from "@playwright/test"

async function openSimWithSteps(page: import("@playwright/test").Page) {
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" }).click()
  // Gotcha Excalidraw: attendere l'ELEMENTO stabile (la palette) prima di
  // qualunque query sul contenuto dell'embed — l'embed si ri-renderizza
  // durante lo scrollToContent e i locator presi troppo presto flakano.
  await expect(page.getByRole("button", { name: "palette Resistenza" }).first()).toBeVisible({
    timeout: 15_000,
  })
  const toggle = page.getByTestId("step-mode-toggle").first()
  await expect(toggle).toBeVisible({ timeout: 15_000 })
  // Gotcha Excalidraw: l'embed appena inserito NON è interattivo — il canvas
  // intercetta i click finché non lo si attiva con un double-click raw sulle
  // coordinate (stesso pattern di montaggio-canvas.spec.ts).
  const toggleBox = await toggle.boundingBox()
  if (!toggleBox) throw new Error("toggle senza bounding box")
  await page.mouse.dblclick(
    toggleBox.x + toggleBox.width / 2,
    toggleBox.y + toggleBox.height / 2,
  )
  return toggle
}

test("post-it: toggle passo-passo → 4 step verdi + evidenza libro + banner onestà", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  const toggle = await openSimWithSteps(page)

  // Banner onestà catalogo sempre visibile nel post-it.
  // Ancora esterna intenzionale: 2 montati = esp1 + esp2 (NOTTE-12).
  const banner = page.locator("[data-elab-catalog-summary]").first()
  await expect(banner).toBeVisible()
  await expect(banner).toHaveAttribute("data-elab-catalog-summary", "2/88")

  await toggle.click()
  await expect(toggle).toHaveAttribute("aria-pressed", "true")

  const steps = page.locator("[data-step-id]")
  await expect(steps).toHaveCount(4)
  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute("data-step-passed", "true")
  }
  await expect(page.getByText("pag.30 — «Collega il positivo della batteria").first()).toBeVisible()

  await page.screenshot({
    path: "test-results/sim-passo-passo-desktop.png",
    fullPage: false,
  })

  expect(consoleErrors).toEqual([])
})

test("mobile: pannello passo-passo leggibile e screenshottato", async ({ page }) => {
  // Flusso reale: il docente inserisce dalla LIM (viewport desktop), lo
  // studente rivede su telefono — su 390px la toolbar docente è collassata
  // nel menu, quindi l'insert avviene PRIMA del resize.
  const toggle = await openSimWithSteps(page)
  await toggle.click()
  await expect(page.locator("[data-step-id]")).toHaveCount(4)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator("[data-step-id]")).toHaveCount(4)
  await page.screenshot({
    path: "test-results/sim-passo-passo-mobile.png",
    fullPage: false,
  })
})
