import { expect, test } from "@playwright/test"

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
] as const) {
  test.describe(name, () => {
    test.use({ viewport })

    test("an archive open failure leaves loading without claiming the lesson is empty", async ({ page }) => {
      // IndexedDB resta quello del browser. La mancanza di Web Crypto fa
      // rigettare il costruttore reale prima che restituisca un handle.
      await page.addInitScript(() => {
        Object.defineProperty(window, "crypto", { configurable: true, value: {} })
      })
      const errors: string[] = []
      page.on("pageerror", error => errors.push(error.message))
      await page.goto("/?vista=continuita#wbstudio-abc123")
      const surface = page.getByTestId("continuity-surface")
      await expect(surface).toHaveAttribute("data-state", "storage-unavailable")
      await expect(page.getByText("Archivio non raggiungibile")).toBeVisible()
      await expect(surface).toContainText("Le sessioni potrebbero esistere: non sono state lette")
      await expect(surface).not.toContainText("Lettura delle sessioni")
      await expect(surface).not.toContainText("Nessuna sessione da riprendere")
      const materials = page.getByRole("link", { name: "Materiali", exact: true })
      await page.keyboard.press("Tab")
      await expect(page.getByRole("link", { name: "Lezione", exact: true })).toBeFocused()
      await page.keyboard.press("Tab")
      await expect(page.getByRole("link", { name: "Continuità", exact: true })).toBeFocused()
      await page.keyboard.press("Tab")
      await expect(materials).toBeFocused()
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
      expect(errors).toEqual([])
    })
  })
}
