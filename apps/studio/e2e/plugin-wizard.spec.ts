// P0-D — Officina plugin nel browser REALE: qui il giro è tutto vero, niente
// seam. Ed25519 WebCrypto firma il manifest, l'entry scaffoldata gira in un
// iframe sandbox e parla l'handshake del protocollo con runHandshakeHarness
// (4 check), l'export scarica un .maestrotool vero (zip con manifest.json +
// signature.b64 + entry.html). I test jsdom coprono la logica; questo spec
// prova che i mattoni reali collimano davvero.
import { test, expect } from "@playwright/test"

test("officina: spec → genera firmato → collaudo 4/4 verde → export .maestrotool", async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/?vista=officina-plugin")

  await page.getByLabel(/^nome$/i).fill("Voltmetro di classe")
  await page.getByLabel(/identificatore/i).fill("it.scuola.voltmetro")
  await page.getByLabel(/superficie/i).selectOption("board-embed")
  await page.getByLabel(/board\.read/i).check()

  // Genera: chiavi dev + scaffold + firma Ed25519 REALE nel browser.
  await page.getByRole("button", { name: "Genera il plugin" }).click()
  const card = page.getByTestId("manifest-card")
  await expect(card).toContainText("it.scuola.voltmetro")
  await expect(card).toContainText("firmato ed25519")

  // Collaudo: handshake vero contro l'entry scaffoldata nell'iframe sandbox.
  // Il bottone si abilita all'onLoad dell'anteprima (auto-wait Playwright).
  await page.getByRole("button", { name: "Collauda l'handshake" }).click()
  const checks = page.locator("[data-testid^='harness-check-']")
  await expect(checks).toHaveCount(4)
  for (const id of [
    "tool-ready-received",
    "ready-well-formed",
    "nonce-echoed",
    "no-out-of-band-reply",
  ]) {
    await expect(page.getByTestId(`harness-check-${id}`)).toHaveAttribute("data-pass", "1")
  }

  // Export: fail-closed superato → download reale del package v1.
  const downloadPromise = page.waitForEvent("download")
  const esporta = page.getByRole("button", { name: "Esporta .maestrotool" })
  await expect(esporta).toBeEnabled()
  await esporta.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe("it.scuola.voltmetro.maestrotool")

  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk as Buffer)
  const bytes = Buffer.concat(chunks)
  // Zip store-only vero: magic PK e i tre file del package v1 nel central dir.
  expect(bytes.subarray(0, 2).toString("latin1")).toBe("PK")
  const asText = bytes.toString("latin1")
  expect(asText).toContain("manifest.json")
  expect(asText).toContain("signature.b64")
  expect(asText).toContain("entry.html")

  expect(consoleErrors).toEqual([])
})
