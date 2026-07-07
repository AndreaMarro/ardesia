// Product Flow Shell (NOTTE-13): il docente attraversa il flusso senza
// digitare URL — lavagna → ELAB Lab → cruscotto → torna alla STESSA lavagna
// (hash stanza preservato). La nav è sobria e presente in ogni vista.
import { test, expect } from "@playwright/test"

test("flusso docente: lavagna → ELAB Lab → cruscotto → torna lavagna (stessa stanza)", async ({
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
  await expect(nav.locator('[data-view-nav-item="lavagna"]')).toHaveAttribute(
    "aria-current",
    "page",
  )

  // 2. Entra in ELAB Lab dalla nav.
  await nav.locator('[data-view-nav-item="elab-lab"]').click()
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
  await expect(
    page.locator('[data-view-nav-item="elab-lab"][aria-current="page"]'),
  ).toBeVisible()

  // 3. Apri il cruscotto dalla nav di ELAB Lab.
  await page.locator('[data-view-nav-item="cruscotto"]').click()
  await expect(page.locator(".st-name-text")).toContainText("Cruscotto docente", {
    timeout: 15_000,
  })
  await expect(
    page.locator('[data-view-nav-item="cruscotto"][aria-current="page"]'),
  ).toBeVisible()

  // 4. Torna alla lavagna: STESSA stanza (hash preservato attraverso le viste).
  await page.locator('[data-view-nav-item="lavagna"]').click()
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  expect(new URL(page.url()).hash).toBe(roomHash)

  expect(consoleErrors).toEqual([])
})
