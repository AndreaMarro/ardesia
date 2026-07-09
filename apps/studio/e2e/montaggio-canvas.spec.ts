// Montaggio libero slice 3 — tap-tap dalla palette SVG del Simulation Plugin
// sulla lavagna REALE: inserisci l'embed dalla toolbar di Room, seleziona la
// resistenza dalla palette, tocca due fori liberi → piazzata; un foro del
// manuale (bb1:i9, occupato dai pinAssignments) rifiuta il tap con notice.
import { test, expect, type Locator } from "@playwright/test"

async function clickHole(stage: Locator, ref: string) {
  const hole = stage.locator(`[data-bb-hole="${ref}"]`)
  await hole.click({ force: true })
}

async function activateStage(page: import("@playwright/test").Page, stage: Locator) {
  const box = await stage.boundingBox()
  if (!box) throw new Error("stage legacy senza bounding box")
  await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2)
}

test("lavagna: palette tap-tap piazza una resistenza e rifiuta i fori occupati", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  await page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" }).click()
  // Il canvas ELABTutor core è la superficie primaria; il tap-tap resta nel
  // pannello legacy finché non viene trasposto in operazioni core.
  await expect(page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]').first()).toBeVisible({
    timeout: 15_000,
  })
  const legacySummary = page.getByText("Montaggio libero legacy").first()
  await expect(legacySummary).toBeVisible()
  const summaryBox = await legacySummary.boundingBox()
  if (!summaryBox) throw new Error("summary legacy senza bounding box")
  await page.mouse.dblclick(
    summaryBox.x + summaryBox.width / 2,
    summaryBox.y + summaryBox.height / 2,
  )
  await legacySummary.click()

  // Gotcha Excalidraw: attendere l'ELEMENTO, mai lo stato — l'embed legacy arriva
  // quando il pannello details espone la palette.
  const legacyStage = page.locator('[data-experiment-id="v1-cap6-esp1"]').first()
  await expect(legacyStage).toBeVisible({ timeout: 15_000 })
  const paletteResistenza = page.getByRole("button", { name: "palette Resistenza" })
  await expect(paletteResistenza).toBeVisible({ timeout: 15_000 })

  // L'embed Excalidraw è inerte finché non viene ATTIVATO (doppio click):
  // il canvas interattivo intercetta i pointer — gesto reale del docente,
  // quindi il double-click va dato via mouse raw sulle coordinate.
  const paletteBox = await paletteResistenza.boundingBox()
  if (!paletteBox) throw new Error("palette senza bounding box")
  await page.mouse.dblclick(
    paletteBox.x + paletteBox.width / 2,
    paletteBox.y + paletteBox.height / 2,
  )

  await paletteResistenza.click()
  await expect(paletteResistenza).toHaveAttribute("aria-pressed", "true")

  // Due fori liberi: c3 pending → c4 piazza.
  await clickHole(legacyStage, "bb1:c3")
  await expect(legacyStage.locator('[data-bb-hole="bb1:c3"]')).toHaveAttribute("data-pending", "1")
  await clickHole(legacyStage, "bb1:c4")
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )
  await expect(page.locator('[aria-label="Resistore montaggio libero r-libero-1"]')).toBeVisible()

  // Foro occupato dal manuale: rifiuto visibile, conteggio invariato.
  await activateStage(page, legacyStage)
  await clickHole(legacyStage, "bb1:i9")
  await expect(legacyStage.locator("[data-montaggio-canvas-notice]")).toContainText("bb1:i9")
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )

  // Riparti dal manuale: tutto azzerato.
  await page.getByRole("button", { name: "riparti dal manuale" }).click()
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "0",
  )

  expect(consoleErrors).toEqual([])
})
