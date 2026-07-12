// Product Flow Shell: il docente attraversa i quattro ingressi globali reali
// e torna alla STESSA lavagna (hash preservato).
import { test, expect } from "@playwright/test"

const legacyGlobalIds = ["elab-lab", "simulatore", "cruscotto", "lezioni-salvate"]

test("flusso docente: Lavagna → Knowledge → Library → Marketplace → Lavagna", async (
  { page },
  testInfo,
) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))

  const roomHash = `#wbstudio-g1d-${testInfo.repeatEachIndex}`
  const nav = page.locator("[data-view-nav]").first()
  const currentLink = (id: string) => nav.locator(`[data-view-nav-item="${id}"]`)
  const assertGlobalNavigation = async () => {
    await expect(nav.locator("[data-view-nav-item]")).toHaveCount(4)
    for (const id of legacyGlobalIds) {
      await expect(nav.locator(`[data-view-nav-item="${id}"]`)).toHaveCount(0)
    }
  }

  // 1. Apri la Lavagna in una stanza distinta per ogni ripetizione CI.
  await page.goto(`/${roomHash}`)
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await expect(nav).toBeVisible()
  await assertGlobalNavigation()
  await expect(currentLink("lavagna")).toHaveAttribute("aria-current", "page")

  // 2. Knowledge via link visibile della nav.
  const knowledgeLink = nav.getByRole("link", { name: "Knowledge", exact: true })
  await expect(knowledgeLink).toBeVisible()
  await knowledgeLink.click()
  await expect(page).toHaveURL((url) => url.searchParams.get("vista") === "knowledge")
  await expect(page.locator("[data-knowledge-explorer]")).toBeVisible()
  await assertGlobalNavigation()
  await expect(currentLink("knowledge")).toHaveAttribute("aria-current", "page")

  // 3. Library via link visibile della nav.
  const libraryLink = nav.getByRole("link", { name: "Library", exact: true })
  await expect(libraryLink).toBeVisible()
  await libraryLink.click()
  await expect(page).toHaveURL((url) => url.searchParams.get("vista") === "library")
  await expect(page.locator("[data-library-view]")).toBeVisible()
  await assertGlobalNavigation()
  await expect(currentLink("library")).toHaveAttribute("aria-current", "page")

  // 4. Marketplace via link visibile della nav.
  const marketplaceLink = nav.getByRole("link", { name: "Marketplace", exact: true })
  await expect(marketplaceLink).toBeVisible()
  await marketplaceLink.click()
  await expect(page).toHaveURL((url) => url.searchParams.get("vista") === "marketplace")
  await expect(page.locator("[data-marketplace-view]")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Marketplace", exact: true })).toBeVisible()
  await assertGlobalNavigation()
  await expect(currentLink("marketplace")).toHaveAttribute("aria-current", "page")

  // 5. Torna alla Lavagna: STESSA stanza preservata attraverso tutte le viste.
  const lavagnaLink = nav.getByRole("link", { name: "Lavagna", exact: true })
  await expect(lavagnaLink).toBeVisible()
  await lavagnaLink.click()
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await expect(page).toHaveURL((url) => url.hash === roomHash)
  await assertGlobalNavigation()
  await expect(currentLink("lavagna")).toHaveAttribute("aria-current", "page")

  expect(consoleErrors).toEqual([])
})
