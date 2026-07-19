// Founder Beta shell: il docente attraversa soltanto Lezione, Continuità e
// Materiali e torna alla stessa lezione (hash preservato).
import { test, expect } from "@playwright/test"

test("flusso docente: Lezione → Continuità → Materiali → stessa Lezione", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))

  // 1. Apri Ardesia: la lavagna assegna lo hash stanza.
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  const roomHash = new URL(page.url()).hash
  expect(roomHash).toMatch(/^#wbstudio-/)
  const nav = page.locator("[data-view-nav]").first()
  await expect(nav).toBeVisible()
  await expect(nav.locator('[data-view-nav-item="lezione"]')).toHaveAttribute(
    "aria-current",
    "page",
  )
  await expect(nav.locator("[data-view-nav-item]")).toHaveCount(3)
  await expect(nav).not.toContainText("Simulatore")
  await expect(nav).not.toContainText("ELABTutor")
  await expect(nav).not.toContainText("Marketplace")

  // 2. Continuità usa la projection read-only già esistente.
  await nav.locator('[data-view-nav-item="continuita"]').click()
  await expect(page.locator("[data-zstat]")).toBeVisible({ timeout: 15_000 })
  await expect(
    page.locator('[data-view-nav-item="continuita"][aria-current="page"]'),
  ).toBeVisible()
  expect(new URL(page.url()).hash).toBe(roomHash)

  // 3. Materiali usa l'alias profondo ma monta il workflow locale Founder Beta.
  await page.locator('[data-view-nav-item="materiali"]').click()
  await expect(
    page.locator('[data-view-nav-item="materiali"][aria-current="page"]'),
  ).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Materiali locali")).toBeVisible()
  await expect(page.getByLabel("Seleziona bundle .lesson")).toBeVisible()
  await expect(page.getByRole("button", { name: "Esporta .lesson" })).toBeVisible()
  await expect(page.getByText("LessonOS non configurato")).toHaveCount(0)
  expect(new URL(page.url()).hash).toBe(roomHash)

  // 4. Torna alla superficie Lezione: STESSA stanza.
  await page.locator('[data-view-nav-item="lezione"]').click()
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  expect(new URL(page.url()).hash).toBe(roomHash)

  expect(consoleErrors).toEqual([])
})
