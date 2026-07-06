// Golden-path §8 segmento 1 — ELAB Lab reale: mount del Simulation Plugin,
// solve via registry (LED acceso con corrente), marcatura di un errore
// comune (fase CHIEDI) che transita bus → event-log SENZA errori di
// registrazione. Tutto contro il dev server, dati reali del Pack
// (v1-cap6-esp1), zero mock. I segmenti manuale→citazione ed export
// arrivano con le slice successive.
import { test, expect } from "@playwright/test"

test("ELAB Lab: sim reale + marcatura errore comune, console pulita", async ({ page }) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => {
    consoleErrors.push(`pageerror: ${error.message}`)
  })

  await page.goto("/?vista=elab-lab")

  // Vista montata con l'esperimento reale del Pack (fail-closed visibile se assente).
  await expect(page.locator("[data-elab-lab-state=mounted]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator(".st-name-text")).toContainText("ELAB Lab")

  // Citazione REALE dal libro (Pack volume-references): etichetta Vol/Pag,
  // capitolo e passi verbatim — il segmento manuale→citazione del §8.
  const citazione = page.locator("[data-elab-lab-citation]")
  await expect(citazione).toBeVisible()
  await expect(citazione).toContainText("Vol. 1, p. 29")
  await expect(citazione).toContainText("Capitolo 6 - Cos'è il diodo LED?")
  await expect(citazione.locator("[data-book-step]")).toHaveCount(5)

  // Solve via registry: esito ok e LED acceso con corrente numerica.
  await expect(page.locator("[data-elab-lab-solve=ok]")).toBeVisible({ timeout: 15_000 })
  await expect(page.locator("[data-led-on]")).toHaveAttribute("data-led-on", "1")
  await expect(page.locator("[data-led-current-ma]")).not.toHaveText("—")

  // Marcatura errore comune (CHIEDI): concetto scelto dal docente, poi click.
  const marcatura = page.locator("[data-elab-lab-marcatura]")
  await expect(marcatura).toBeVisible()
  await marcatura.locator("input[name=elab-lab-concept]").first().check()
  // Il bottone si abilita solo con concetto scelto + event-log pronto (IndexedDB).
  const mistakeButton = marcatura.locator("[data-mistake-id]").first()
  await expect(mistakeButton).toBeEnabled({ timeout: 15_000 })
  await mistakeButton.click()

  await expect(marcatura.locator("[data-marked-count]")).toHaveText("errori segnati: 1")
  // Nessun fallimento di registrazione visibile (onRecordError resta muto).
  await expect(
    marcatura.getByText("Errore osservato NON registrato", { exact: false }),
  ).toHaveCount(0)

  // Segmento export: la memoria della lezione scende come JSON versionato
  // e contiene l'error.observed appena marcato (chiude il §8 sulla vista).
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Esporta memoria (JSON)" }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^lezione-v1-cap6-esp1-.*\.json$/)
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(chunk as Buffer)
  const exported = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    format: string
    experimentId?: string
    events: Array<{ kind: string }>
  }
  expect(exported.format).toBe("ardesia.lesson-memory/1")
  expect(exported.experimentId).toBe("v1-cap6-esp1")
  expect(exported.events.map((event) => event.kind)).toContain("error.observed")

  expect(consoleErrors).toEqual([])
})
