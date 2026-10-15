import { test, expect } from '@playwright/test'

for (const viewport of [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const failure of ['missing', 'open-rejected'] as const) {
    test(`ElabLab does not confirm volatile marks: ${failure}, ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport)
      await page.addInitScript((mode) => {
        Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: mode === 'missing'
          ? undefined
          : { open() { throw new DOMException('Synthetic storage blocked', 'SecurityError') } } })
      }, failure)
      await page.goto('/?vista=elab-lab')
      const marking = page.locator('[data-elab-lab-marcatura]')
      await expect(marking).toBeVisible()
      await marking.locator('input[name=elab-lab-concept]').first().check()
      await expect(marking.getByRole('alert')).toContainText('non disponibile', { timeout: 5000 })
      await expect(marking.locator('[data-mistake-id]').first()).toBeDisabled()
      await expect(marking.locator('[data-marked-count]')).toHaveText('errori segnati: 0')
      await expect(page.getByRole('button', { name: 'Esporta memoria (JSON)' })).toBeDisabled()
      await page.reload()
      await expect(page.locator('[data-elab-lab-marcatura]').getByRole('alert')).toContainText('non disponibile')
      await page.locator('[data-elab-lab-marcatura]').getByRole('alert').scrollIntoViewIfNeeded()
      await page.screenshot({ path: testInfo.outputPath(`storage-${failure}-${viewport.name}.png`) })
    })
  }
}
