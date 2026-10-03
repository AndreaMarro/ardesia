import { expect, test, type Page } from "@playwright/test"
import JSZip from "jszip"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

test.skip(!process.env.ARDESIA_STUDIO_E2E_BASE_URL, "Requires the real local Ardesia service")
const toolId = "io.ardesia.function-graph"
const graphs = (page: Page) => page.evaluate(owner => ((window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements() ?? [])
  .filter((el: any) => !el.isDeleted && el.customData?.maestroTool?.owner === owner), toolId)

test("quadratic graph: insert → edit → save → independent clone → cold .lesson import", async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000)
  const room = "function-graph-live"
  const evidence = process.env.ARDESIA_E2E_EVIDENCE_DIR
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(`/#${room}`)
  await page.getByRole("button", { name: "Inserisci grafico di funzione sulla lavagna" }).click()
  const first = page.locator('[data-function-graph="function-graph"]')
  await expect(first.getByLabel("Coefficiente a", { exact: true })).toHaveValue("")
  await expect(first.locator("[data-function-curve]")).toHaveCount(0)
  for (const [label, value] of [["Titolo del grafico", "Traiettoria"], ["Coefficiente a", "1/2"],
    ["Coefficiente b", "-3"], ["Coefficiente c", "2"], ["x minimo", "-2"], ["x massimo", "6"]])
    await first.getByLabel(label!, { exact: true }).fill(value!)
  await first.getByRole("button", { name: "Salva grafico", exact: true }).click()
  await expect(first.getByRole("status")).toHaveText("Grafico salvato.")
  await page.reload()
  await expect(first.getByLabel("Coefficiente a", { exact: true })).toHaveValue("1/2")
  await expect(first.locator("[data-function-curve]")).toHaveCount(1)
  const original = (await graphs(page))[0]

  // Select through the public editor API, then invoke Excalidraw's real duplicate
  // keyboard action. Identity/state are created by the editor and Room normalizer.
  await page.keyboard.press("Escape")
  await page.evaluate(id => {
    const api = (window as any).__MAESTRO_TEST__.apiRef.current
    api.updateScene({ appState: { selectedElementIds: { [id]: true }, activeEmbeddable: null } })
  }, original.id)
  await page.locator(".excalidraw").focus()
  await page.keyboard.press("ControlOrMeta+d")
  await expect.poll(async () => (await graphs(page)).length).toBe(2)
  const copy = (await graphs(page)).find((el: any) => el.id !== original.id)
  expect(copy.id).not.toBe(original.id)
  expect(copy.link).not.toBe(original.link)
  expect(copy.customData.maestroTool.state).toEqual(original.customData.maestroTool.state)
  // Place the two large cards side by side so neither intercepts the other's UI.
  await page.evaluate(({ id, x, y }) => {
    const api = (window as any).__MAESTRO_TEST__.apiRef.current
    const elements = api.getSceneElements().map((el: any) => el.id === id
      ? { ...el, x, y, version: el.version + 1, versionNonce: el.versionNonce + 1, updated: Date.now() } : el)
    api.updateScene({ elements, appState: { selectedElementIds: {}, activeEmbeddable: null } })
    api.scrollToContent(elements.find((el: any) => el.id === id), { fitToContent: true, maxZoom: 1, animate: false })
  }, { id: copy.id, x: original.x + original.width + 40, y: original.y })
  const clone = page.locator(`[data-function-graph="${copy.id}"]`)
  await clone.getByLabel("Titolo del grafico", { exact: true }).fill("Copia modificata")
  await clone.getByLabel("Coefficiente a", { exact: true }).fill("-1")
  await clone.getByRole("button", { name: "Salva grafico", exact: true }).click()
  await expect(clone.getByRole("status")).toHaveText("Grafico salvato.")
  const saved = await graphs(page)
  expect(saved.find((el: any) => el.id === original.id).customData.maestroTool.state.coefficients).toEqual(["1/2", "-3", "2"])
  expect(saved.find((el: any) => el.id === copy.id).customData.maestroTool.state.coefficients).toEqual(["-1", "-3", "2"])
  const svgDownload = page.waitForEvent("download")
  await clone.getByRole("button", { name: "Esporta SVG", exact: true }).click()
  const svg = await readFile(await (await svgDownload).path(), "utf8")
  expect(svg).toContain("y = (-1)x² + (-3)x + (2)")
  expect(svg).not.toMatch(/<script|https?:\/\/(?!www\.w3\.org)/)
  await testInfo.attach("function-graph.svg", { contentType: "image/svg+xml", body: svg })
  await page.getByRole("link", { name: "Materiali", exact: true }).click()
  const download = page.waitForEvent("download")
  await page.getByRole("button", { name: "Esporta .lesson", exact: true }).click()
  const bundle = await readFile(await (await download).path())
  const zip = await JSZip.loadAsync(bundle)
  const board = JSON.parse(await zip.file("raw/board.excalidraw")!.async("string"))
  const bundled = board.elements.filter((el: any) => !el.isDeleted && el.customData?.maestroTool?.owner === toolId)
  expect(bundled.map((el: any) => [el.id, el.link, el.customData.maestroTool.state]))
    .toEqual(saved.map((el: any) => [el.id, el.link, el.customData.maestroTool.state]))
  await testInfo.attach("function-graph.lesson", { contentType: "application/zip", body: bundle })
  if (evidence) {
    await mkdir(evidence, { recursive: true })
    await writeFile(join(evidence, "function-graph.lesson"), bundle)
    await writeFile(join(evidence, "function-graph.svg"), svg)
  }

  const fresh = await browser.newContext({ baseURL: process.env.ARDESIA_STUDIO_E2E_BASE_URL, viewport: { width: 1440, height: 1000 } })
  try {
    const reopened = await fresh.newPage()
    await reopened.goto(`/?vista=lezioni-salvate#${room}`)
    await reopened.getByLabel("Seleziona bundle .lesson").setInputFiles({ name: "function-graph.lesson", mimeType: "application/zip", buffer: bundle })
    await expect(reopened.getByRole("heading", { name: "Anteprima import" })).toBeVisible()
    await reopened.getByRole("button", { name: "Importa il bundle" }).click()
    await expect(reopened.getByRole("status")).toContainText("Import completato")
    await reopened.goto(`/#${room}`)
    await expect.poll(async () => (await graphs(reopened)).length).toBe(2)
    const restored = await graphs(reopened)
    expect(restored.map((el: any) => [el.id, el.link, el.customData.maestroTool.state]))
      .toEqual(bundled.map((el: any) => [el.id, el.link, el.customData.maestroTool.state]))
    for (const element of restored) {
      await reopened.evaluate(id => {
        const api = (window as any).__MAESTRO_TEST__.apiRef.current
        api.scrollToContent(api.getSceneElements().find((el: any) => el.id === id), { fitToContent: true, maxZoom: 1, animate: false })
      }, element.id)
      const card = reopened.locator(`[data-function-graph="${element.id}"]`)
      await expect(card.getByLabel("Coefficiente a", { exact: true })).toHaveValue(element.customData.maestroTool.state.coefficients[0])
      await expect(card.locator("[data-function-curve]")).toHaveCount(1)
      const image = await reopened.screenshot({ path: testInfo.outputPath(`${element.id}.png`), fullPage: true })
      if (evidence) await writeFile(join(evidence, `${element.id}.png`), image)
    }
  } finally { await fresh.close() }
})
