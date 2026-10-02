import { expect, test } from "@playwright/test"
import JSZip from "jszip"
import { readFile } from "node:fs/promises"

// Requires the real Kirchhoff HTTP service behind the Ardesia dev proxy.
test.skip(!process.env.KIRCHHOFF_LOCAL_URL || !process.env.ARDESIA_STUDIO_E2E_BASE_URL,
  "Start both local services and set KIRCHHOFF_LOCAL_URL + ARDESIA_STUDIO_E2E_BASE_URL")

test("the owned proof and a student's first error survive a real Ardesia reopen", async ({page}) => {
  const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
  await page.goto("/")
  await page.getByRole("button", {name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("textbox", {name:"Circuito CircuitCheck"}).fill(netlist)
  await page.getByRole("button", {name:"Risolvi e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*42\/5 V/)).toBeVisible()
  await page.getByRole("button", {name:"Aggiungi passaggio"}).click()
  await page.getByRole("textbox", {name:"Trascrizione 1"}).fill("R1+R2=11")
  await page.getByRole("textbox", {name:"Primo componente 1"}).fill("R1")
  await page.getByRole("textbox", {name:"Secondo componente 1"}).fill("R2")
  await page.getByRole("textbox", {name:"Valore 1"}).fill("11")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Primo passaggio da rivedere: 1/)).toBeVisible()
  const before = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {readAll(): Promise<Array<{kind:string;evidence:string[]}> >}}}}}).__MAESTRO_TEST__
    return await harness?.lessonOs?.current?.store?.readAll() ?? []
  })
  expect(before.filter(item => item.kind === "circuit.proof.verified")).toHaveLength(1)
  expect(before.filter(item => item.kind === "circuit.trace.assessed")).toHaveLength(1)
  expect(before.find(item => item.kind === "circuit.trace.assessed")?.evidence).toContain("board:circuit-reasoning")
  const attributed = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {
      room: string; lessonOs?: {current?: {store?: {
        readEnvelopesByLesson(room: string): Promise<Array<{kind:string;lessonId:string}>>
      }}}
    }}).__MAESTRO_TEST__
    return harness?.lessonOs?.current?.store?.readEnvelopesByLesson(harness.room) ?? []
  })
  expect(attributed.filter(item => item.kind.startsWith("circuit.")).map(item => item.lessonId))
    .toEqual([attributed[0]!.lessonId, attributed[0]!.lessonId])

  await page.reload()
  await expect(page.getByText(/Prova riaperta dalla lavagna/)).toBeVisible()
  await expect(page.getByText(/Risultato registrato, in attesa di nuova verifica:.*42\/5 V/)).toBeVisible()
  await page.getByRole("button", {name:"Ricalcola e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*42\/5 V/)).toBeVisible()
  await expect(page.getByRole("textbox", {name:"Trascrizione 1"})).toHaveValue("R1+R2=11")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/valore equivalente è 10 ohm, non 11 ohm/)).toBeVisible()
  await expect.poll(async () => page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string}>>
    }}}}}).__MAESTRO_TEST__
    return (await harness?.lessonOs?.current?.store?.readAll() ?? [])
      .filter(item => item.kind === "circuit.trace.assessed").length
  })).toBe(2)
  const after = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {readAll(): Promise<Array<{kind:string}> >}}}}}).__MAESTRO_TEST__
    return await harness?.lessonOs?.current?.store?.readAll() ?? []
  })
  expect(after.filter(item => item.kind === "circuit.proof.verified")).toHaveLength(2)
  expect(after.filter(item => item.kind === "circuit.trace.assessed")).toHaveLength(2)

  await page.getByRole("textbox", {name:"Trascrizione 1"}).fill("R1+R2=10")
  await page.getByRole("textbox", {name:"Valore 1"}).fill("10")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Valido fin qui/)).toBeVisible()
  await expect.poll(async () => page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string}>>
    }}}}}).__MAESTRO_TEST__
    return (await harness?.lessonOs?.current?.store?.readAll() ?? [])
      .filter(item => item.kind === "circuit.trace.assessed").length
  })).toBe(3)
  const corrected = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string;errorId?:string;correctsErrorId?:string}>>
    }}}}}).__MAESTRO_TEST__
    return await harness?.lessonOs?.current?.store?.readAll() ?? []
  })
  const assessments = corrected.filter(item => item.kind === "circuit.trace.assessed")
  expect(assessments).toHaveLength(3)
  expect(assessments[2]?.correctsErrorId).toBe(assessments[0]?.errorId)

  await page.getByRole("link", {name:"Materiali"}).click()
  await expect(page.getByText("Materiali locali")).toBeVisible()
  const download = page.waitForEvent("download")
  await page.getByRole("button", {name:"Esporta .lesson"}).click()
  const zip = await JSZip.loadAsync(await readFile(await (await download).path()))
  const board = JSON.parse(await zip.file("raw/board.excalidraw")!.async("string"))
  const object = board.elements.find((item: {id:string}) => item.id === "circuit-reasoning")
  expect(object.customData.maestroTool.state.proof.answer.exact).toBe("42/5")
  expect(object.customData.maestroTool.state.trace[0].claimed_value).toBe("10")
  const events = (await zip.file("raw/lessonos-events.jsonl")!.async("string"))
    .trim().split("\n").map(line => JSON.parse(line) as {kind:string})
  expect(events.filter(item => item.kind === "circuit.proof.verified")).toHaveLength(2)
  expect(events.filter(item => item.kind === "circuit.trace.assessed")).toHaveLength(3)

  await page.getByRole("link", {name:"Rivedi il recap stampabile"}).click()
  const preview = page.frameLocator('iframe[title="Anteprima del recap stampabile da consegnare"]')
  await expect(preview.getByText("Ragionamento sui circuiti")).toBeVisible()
  await expect(preview.getByText(/Risultato registrato: 42\/5 V/)).toBeVisible()
  await expect(preview.locator('img[alt="Schema del passaggio 1"]')).toBeVisible()
  await expect(preview.getByText("Procedimento dello studente")).toBeVisible()
  await expect(preview.getByText("corretto", {exact:true})).toBeVisible()
  const recapDownload = page.waitForEvent("download")
  await page.getByRole("button", {name:"scarica recap"}).click()
  const recapHtml = await readFile(await (await recapDownload).path(), "utf8")
  expect(recapHtml).toContain("Ragionamento sui circuiti")
  expect(recapHtml).toContain("42/5 V")
})
