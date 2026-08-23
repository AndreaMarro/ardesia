// Student Pack artefatto (NOTTE-13): il ciclo Z7 produce un FILE scaricabile
// e re-importabile. Percorso REALE: errore marcato in ELAB Lab (stessa
// IndexedDB) → cruscotto → Genera → Esporta (download) → riapertura via
// import. Zero PII nel pack.
import { test, expect } from "@playwright/test"
import * as fs from "node:fs"

test("Z7: genera → esporta scarica il pack → import lo riapre (round-trip)", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`))

  // 1. Errore osservato in ELAB Lab (stesso profilo → stesso event-log).
  await page.goto("/?vista=elab-lab")
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
  const marcatura = page.locator("[data-elab-lab-marcatura]")
  await marcatura.locator("input[name=elab-lab-concept]").first().check()
  const mistakeButton = marcatura.locator("[data-mistake-id]").first()
  await expect(mistakeButton).toBeEnabled({ timeout: 15_000 })
  await mistakeButton.click()
  // Il verdetto deve essere VISTO, non solo presente. Misurato il 2026-08-23:
  // con i verdetti resi `display: none` — nel DOM e fuori dallo schermo —
  // TUTTI E DODICI i journey del cancello restavano verdi. Un'asserzione di
  // testo o attributo legge l'albero, non la vista.
  await expect(marcatura.locator("[data-marked-count]")).toBeVisible()
  await expect(marcatura.locator("[data-marked-count]")).toHaveText("errori segnati: 1")

  // 2. Cruscotto: candidato in coda → Genera → Esporta con DOWNLOAD reale.
  // La scrittura IndexedDB della marcatura è asincrona rispetto al contatore
  // UI: se la navigazione parte prima del commit, il primo load vede il log
  // vuoto. Retry con reload (local-first single-device: eventuale in ms).
  await expect(async () => {
    await page.goto("/?vista=cruscotto")
    await expect(page.locator("[data-z7-candidate]").first()).toBeVisible({ timeout: 3000 })
  }).toPass({ timeout: 30_000 })
  await page.locator("[data-z7-generate]").first().click()
  await expect(page.locator("[data-z7-export]").first()).toBeVisible({ timeout: 15_000 })

  const downloadPromise = page.waitForEvent("download")
  await page.locator("[data-z7-export]").first().click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^studentpack-.*\.json$/)
  const packPath = testInfo.outputPath("studentpack-roundtrip.json")
  await download.saveAs(packPath)

  // Il file è un artefatto versionato senza PII (solo id/etichette/evidenze).
  const artifact = JSON.parse(fs.readFileSync(packPath, "utf-8")) as {
    format: string
    packs: Array<{ candidateId: string; evidence: string[] }>
  }
  expect(artifact.format).toBe("ardesia.studentpack/1")
  expect(artifact.packs.length).toBe(1)
  expect(artifact.packs[0]!.evidence.length).toBeGreaterThan(0)

  // 3. Riapertura: import del file appena scaricato.
  await page.locator("[data-z7-import]").setInputFiles(packPath)
  await expect(page.locator("[data-imported-pack]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-imported-pack]")).toBeVisible()
  await expect(page.locator("[data-imported-pack]")).toContainText("Pack riaperto")
  await expect(
    page.locator(`[data-imported-pack-id="${artifact.packs[0]!.candidateId}"]`),
  ).toBeVisible()

  expect(consoleErrors).toEqual([])
})
