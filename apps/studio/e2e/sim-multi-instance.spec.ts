// P0-C multi-istanza — due click su "sim" nella toolbar di Room = DUE post-it
// del Simulation Plugin sulla lavagna reale, con embedId distinti. Prima del
// fix il secondo click selezionava l'istanza esistente (singleton).
import { test, expect } from "@playwright/test"

test("lavagna: due inserimenti del Simulation Plugin = due istanze distinte", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  const insertButton = page.getByRole("button", { name: "Inserisci Simulation Plugin sulla lavagna" })
  await insertButton.click()
  // Gotcha Excalidraw: attendere l'ELEMENTO (la palette del primo embed), mai lo stato.
  await expect(page.getByRole("button", { name: "palette Resistenza" }).first()).toBeVisible({
    timeout: 15_000,
  })

  await insertButton.click()
  // Due embed montati = due palette renderizzate (una per istanza).
  await expect(page.getByRole("button", { name: "palette Resistenza" })).toHaveCount(2, {
    timeout: 15_000,
  })

  // Identità distinte in scena: id diversi, link maestro-tool:// diversi.
  const embeds = await page.evaluate(() => {
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
      .map((el) => ({ id: el.id, link: el.link }))
  })
  expect(embeds).toHaveLength(2)
  expect(embeds[0].id).not.toBe(embeds[1].id)
  expect(embeds[0].link).not.toBe(embeds[1].link)

  expect(consoleErrors).toEqual([])
})
