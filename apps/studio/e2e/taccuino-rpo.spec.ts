// RPO del taccuino — PC-R1-001 → PRD §8.4: «autosave locale con RPO 0 per
// eventi confermati e recovery dopo kill/crash».
//
// L'autosave e' debounced. Se l'utente chiude o naviga via entro la finestra di
// debounce, l'ultimo tratto e' un evento confermato dall'utente che il prodotto
// non ha scritto: RPO > 0. Questo test misura esattamente quella finestra, e
// fallisce finche' non esiste un flush all'uscita.

import { test, expect, type Page } from "@playwright/test"

async function apriTaccuino(page: Page): Promise<void> {
  const apri = page.locator("[data-open-notebook]").first()
  if (!(await apri.isVisible())) await page.locator(".st-menu-btn").first().click()
  await apri.click()
}

async function disegna(page: Page): Promise<void> {
  const box = await page.locator(".excalidraw canvas").first().boundingBox()
  if (!box) throw new Error("canvas senza bounding box")
  const x0 = box.x + box.width * 0.62
  const y0 = box.y + box.height * 0.5
  await page.mouse.click(x0, y0)
  await page.keyboard.press("7")
  await page.mouse.move(x0, y0)
  await page.mouse.down()
  for (let i = 1; i <= 12; i += 1) {
    await page.mouse.move(x0 + i * 8, y0 + Math.sin(i) * 12)
    await page.waitForTimeout(12)
  }
  await page.mouse.up()
}

test("il tratto sopravvive a un'uscita immediata, dentro la finestra di debounce", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })
  await apriTaccuino(page)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })
  const urlTaccuino = page.url()

  await disegna(page)

  // NESSUNA attesa: si esce mentre l'autosave e' ancora in attesa. E' il caso
  // dell'utente che chiude il coperchio appena finito di scrivere.
  await page.goto("/")
  await expect(page.locator(".excalidraw").first()).toBeVisible({ timeout: 15_000 })

  // Si rientra nello stesso taccuino: il tratto confermato deve esserci.
  await page.goto(urlTaccuino)
  await expect(page.locator("[data-notebook-document-id]").first()).toBeVisible({ timeout: 15_000 })
  const conteggio = page.locator("[data-notebook-scene-elements]").first()
  await expect(conteggio).not.toHaveAttribute("data-notebook-scene-elements", "0", {
    timeout: 10_000,
  })
})
