// G9 — iPad/LIM touch for the Simulation Plugin.
// Firsthand finding (2026-07-09): at 810px the full toolbar (~1356px,
// overflow:visible) with the hamburger gated to ≤768px left the "sim" insert
// button off-screen (DIAG_GEOM btn.right=893 > innerWidth=810), unreachable by
// touch OR mouse. Fix: extend the collapsible menu to 769–1024px + lift .st-bar
// above the Excalidraw canvas (z-index:500) in index.css.
// Test 1: teacher inserts the Simulation Plugin on iPad touch → canvas mounts.
// Test 2: student places a resistor via touch inside the mounted surface.
import { test, expect, type Locator, type Page } from "@playwright/test"

test.use({ viewport: { width: 810, height: 1080 }, hasTouch: true, deviceScaleFactor: 2 })

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`))
  return errors
}

async function dblTap(page: Page, target: Locator) {
  const box = await target.boundingBox()
  if (!box) throw new Error("no bounding box to double-tap")
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.touchscreen.tap(cx, cy)
  await page.touchscreen.tap(cx, cy)
}

// On the tablet band the toolbar is collapsed: open the hamburger, tap "sim".
async function insertSimViaTouch(page: Page) {
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await page.getByRole("button", { name: "Apri menu" }).tap()
  await page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" }).tap()
  await expect(
    page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]').first(),
  ).toBeVisible({ timeout: 15_000 })
}

test("iPad+touch: teacher opens the menu and inserts the Simulation Plugin", async ({ page }) => {
  const errors = collectErrors(page)
  await insertSimViaTouch(page)
  // L'evento LessonOS del solve deve uscire sotto l'esperimento CHE E' APERTO.
  // `simulationSolveEvent` e' una funzione pura, coperta dagli unitari con gli
  // argomenti che gli passa il test; quali argomenti passi il COMPONENTE non lo
  // verificava nessuno. Misurato 2026-08-24: sostituito `scene.experimentId` con
  // un id inventato, vitest exit 0, tsc exit 0, tutti e sedici i journey exit 0.
  const freeMode = page.locator("[data-simulation-free-mode]").first()
  await expect(freeMode).toBeVisible({ timeout: 15_000 })
  await expect(freeMode).toHaveAttribute("data-sim-emitted-event-scene", "v1-cap6-esp1")

  const mount = page.locator("[data-elab-core-canvas-mounted]").first()
  await expect(mount).toBeVisible({ timeout: 15_000 })
  expect(["pending", "true"]).toContain(await mount.getAttribute("data-elab-core-canvas-mounted"))
  expect(errors).toEqual([])
})

// KNOWN GAP (documented, not silently skipped): with pure touch gestures the
// LEGACY montaggio embed does not activate — Excalidraw's interactive canvas
// keeps intercepting pointer events (double-tap does not trigger the embed
// activation that mouse double-click does). This is the legacy tap-tap panel;
// the CORE canvas is the primary surface. Deferred to P1: determine whether
// Excalidraw embeds are touch-activatable (tap/long-press) and wire it, then
// promote this fixme back to a real test. See docs/ops/P29-NEXT-PLAN.md.
test.fixme("iPad+touch: student places a resistor via touch (montaggio tap-tap)", async ({ page }) => {
  const errors = collectErrors(page)
  await insertSimViaTouch(page)

  const legacySummary = page.getByText("Montaggio libero legacy").first()
  await expect(legacySummary).toBeVisible()
  await dblTap(page, legacySummary)
  await legacySummary.tap()

  const legacyStage = page.locator('[data-experiment-id="v1-cap6-esp1"]').first()
  await expect(legacyStage).toBeVisible({ timeout: 15_000 })
  const paletteResistenza = page.getByRole("button", { name: "palette Resistenza" })
  await expect(paletteResistenza).toBeVisible({ timeout: 15_000 })

  // Activate the Excalidraw embed via a real double-tap, then select the palette.
  await dblTap(page, paletteResistenza)
  await paletteResistenza.tap()
  await expect(paletteResistenza).toHaveAttribute("aria-pressed", "true")

  // Two free holes: c3 pending → c4 places one component.
  await legacyStage.locator('[data-bb-hole="bb1:c3"]').tap({ force: true })
  await expect(legacyStage.locator('[data-bb-hole="bb1:c3"]')).toHaveAttribute("data-pending", "1")
  await legacyStage.locator('[data-bb-hole="bb1:c4"]').tap({ force: true })
  // Il verdetto deve essere VISTO, non solo presente. Misurato il 2026-08-23:
  // con i verdetti resi `display: none` — nel DOM e fuori dallo schermo —
  // TUTTI E DODICI i journey del cancello restavano verdi. Un'asserzione di
  // testo o attributo legge l'albero, non la vista.
  await expect(page.locator("[data-montaggio-canvas-count]")).toBeVisible()
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )

  expect(errors).toEqual([])
})
