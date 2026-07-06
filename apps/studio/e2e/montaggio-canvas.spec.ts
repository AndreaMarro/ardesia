// Montaggio libero slice 3 — tap-tap dalla palette SVG del Simulation Plugin
// sulla lavagna REALE: inserisci l'embed dalla toolbar di Room, seleziona la
// resistenza dalla palette, tocca due fori liberi → piazzata; un foro del
// manuale (bb1:i2, occupato dai pinAssignments) rifiuta il tap con notice.
import { test, expect } from "@playwright/test"

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
  // Gotcha Excalidraw: attendere l'ELEMENTO, mai lo stato — l'embed arriva
  // quando il renderEmbeddable monta la palette.
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
  await page.locator('[data-bb-hole="bb1:c3"]').click()
  await expect(page.locator('[data-bb-hole="bb1:c3"]')).toHaveAttribute("data-pending", "1")
  await page.locator('[data-bb-hole="bb1:c4"]').click()
  await expect(page.locator("[data-montaggio-canvas-count]")).toHaveAttribute(
    "data-montaggio-canvas-count",
    "1",
  )
  await expect(page.locator('[aria-label="Resistore montaggio libero r-libero-1"]')).toBeVisible()

  // Foro occupato dal manuale: rifiuto visibile, conteggio invariato.
  await page.locator('[data-bb-hole="bb1:i2"]').click()
  await expect(page.locator("[data-montaggio-canvas-notice]")).toContainText("bb1:i2")
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
