// P0-C residuo — duplicare un post-it del Simulation Plugin dal canvas
// (copy/paste reale) deve produrre una NUOVA istanza: id ≠ id, link ≠ link,
// e per ogni embed id === embedId del link (altrimenti persistEmbedState
// scriverebbe lo stato del duplicato sull'ORIGINALE).
import { test, expect } from "@playwright/test"

type EmbedInfo = { id: string; link: string | null }

async function toolEmbeds(page: import("@playwright/test").Page): Promise<EmbedInfo[]> {
  return page.evaluate(() => {
    const harness = (window as unknown as Record<string, unknown>).__MAESTRO_TEST__ as
      | {
          apiRef?: {
            current?: { getSceneElements(): readonly { id: string; link?: string | null }[] } | null
          }
        }
      | undefined
    const elements = harness?.apiRef?.current?.getSceneElements() ?? []
    return elements
      .filter((el) => typeof el.link === "string" && el.link.startsWith("maestro-tool://"))
      .map((el) => ({ id: el.id, link: el.link ?? null }))
  })
}

test("copy/paste del post-it = nuova istanza con identità coerente", async ({ page }) => {
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
  const coreCanvas = page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]').first()
  await expect(coreCanvas).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator("[data-elab-core-canvas-host] svg").first()).toBeVisible()

  // Il focus dopo l'insert è sul bottone della toolbar: un click raw sul
  // post-it lo seleziona E porta il focus sul canvas (serve per la clipboard
  // di Excalidraw). Poi copy/paste da tastiera (gesto utente reale): il paste
  // clona link+customData con id nuovo.
  const canvasBox = await coreCanvas.boundingBox()
  if (!canvasBox) throw new Error("post-it senza bounding box")
  await page.mouse.click(canvasBox.x + canvasBox.width / 2, canvasBox.y + 20)
  await page.keyboard.press("ControlOrMeta+c")
  await page.keyboard.press("ControlOrMeta+v")

  await expect(page.locator('[data-elab-canvas-source-of-truth="simulation-scene"]')).toHaveCount(2, {
    timeout: 15_000,
  })

  // La normalizzazione in handleChange promuove il duplicato a nuova istanza.
  await expect(async () => {
    const embeds = await toolEmbeds(page)
    expect(embeds).toHaveLength(2)
    expect(embeds[0].id).not.toBe(embeds[1].id)
    expect(embeds[0].link).not.toBe(embeds[1].link)
    for (const embed of embeds) {
      const embedId = embed.link?.split("/").pop()
      expect(embed.id, `id ≠ embedId per ${embed.link}`).toBe(embedId)
    }
  }).toPass({ timeout: 10_000 })

  expect(consoleErrors).toEqual([])
})
