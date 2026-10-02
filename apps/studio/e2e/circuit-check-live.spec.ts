import { expect, test } from "@playwright/test"
import JSZip from "jszip"
import { readFile } from "node:fs/promises"
import { createHash } from "node:crypto"

function materialSha(html: string): string {
  const name = Buffer.from("recap.html")
  const body = Buffer.from(html)
  const size = (length:number) => { const bytes=Buffer.alloc(8); bytes.writeBigUInt64BE(BigInt(length)); return bytes }
  return createHash("sha256").update(Buffer.concat([size(name.length),name,size(body.length),body])).digest("hex")
}

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
    .trim().split("\n").map(line => JSON.parse(line) as {kind:string;payload?:{observedStep?:{transcription:string}}})
  expect(events.filter(item => item.kind === "circuit.proof.verified")).toHaveLength(2)
  expect(events.filter(item => item.kind === "circuit.trace.assessed")).toHaveLength(3)
  expect(events.find(item => item.kind === "circuit.trace.assessed" && item.payload?.observedStep)
    ?.payload?.observedStep?.transcription).toBe("R1+R2=11")

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
  await page.getByLabel("Nome docente").fill("Prof. Rossi")
  await page.getByRole("button",{name:"Approva questa versione"}).click()
  await expect(page.getByRole("status")).toContainText("approvata da Prof. Rossi")
  const reviewedExport = page.waitForEvent("download")
  await page.getByRole("button",{name:"esporta .lesson"}).click()
  const reviewedZip = await JSZip.loadAsync(await readFile(await (await reviewedExport).path()))
  const reviewedEvents = (await reviewedZip.file("raw/lessonos-events.jsonl")!.async("string"))
    .trim().split("\n").map(line => JSON.parse(line) as {kind:string;payload?:{revisionSha256:string;reviewer:string}})
  const review = reviewedEvents.find(item=>item.kind==="material.reviewed")
  expect(review?.payload?.reviewer).toBe("Prof. Rossi")
  expect(review?.payload?.revisionSha256).toBe(materialSha(recapHtml))
  const printDownload = page.waitForEvent("download")
  await page.getByRole("button",{name:"scarica materiale revisionato per PDF"}).click()
  const printPath = await (await printDownload).path()
  const printHtml = await readFile(printPath,"utf8")
  expect(printHtml).toContain(`data-revision-sha256="${review?.payload?.revisionSha256}"`)
  expect(printHtml).toContain("Docente: Prof. Rossi")
  const printable = await page.context().newPage()
  try {
    // Playwright's temporary download path has no .html extension, so opening
    // it as file:// would make Chromium treat the same bytes as plain text.
    await printable.setContent(printHtml)
    await expect(printable.getByText("Revisione docente registrata")).toBeVisible()
    await expect(printable.locator('img[alt="Schema del passaggio 1"]')).toBeVisible()
    expect(await printable.locator('img[alt="Schema del passaggio 1"]').evaluate(image =>
      (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const pdf = await printable.pdf({printBackground:true})
    expect(pdf.subarray(0,5).toString()).toBe("%PDF-")
    expect(pdf.length).toBeGreaterThan(10000)
  } finally { await printable.close() }
  await page.reload()
  await expect(page.getByRole("status")).toContainText("approvata da Prof. Rossi")
})

test("a KCL error and correction survive the real board and lesson memory", async ({page}) => {
  const netlist = "V1 a 0 12 volt\nR1 a b 100 ohm\nR2 b 0 200 ohm\nR3 b 0 300 ohm\n? current R2"
  await page.goto("/")
  await page.getByRole("button", {name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("textbox", {name:"Circuito CircuitCheck"}).fill(netlist)
  await page.getByRole("button", {name:"Risolvi e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*9\/275 A/)).toBeVisible()
  await page.getByRole("button", {name:"Aggiungi passaggio"}).click()
  await page.getByRole("combobox", {name:"Operazione 1"}).selectOption("kcl")
  await page.getByRole("textbox", {name:"Primo componente 1"}).fill("b")
  await page.getByRole("textbox", {name:"Secondo componente 1"}).fill("-R1,+R2")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Primo passaggio da rivedere: 1/)).toBeVisible()
  const wrong = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string;errorId?:string;conceptId?:string}>>
    }}}}}).__MAESTRO_TEST__
    const events = await harness?.lessonOs?.current?.store?.readAll() ?? []
    return events.findLast(item => item.kind === "circuit.trace.assessed")
  })
  expect(wrong?.conceptId).toBe("circuit:method:kcl")
  expect(wrong?.errorId).toMatch(/:error$/)
  await page.reload()
  await expect(page.getByText(/Prova riaperta dalla lavagna/)).toBeVisible()
  await page.getByRole("button", {name:"Ricalcola e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*9\/275 A/)).toBeVisible()
  await expect(page.getByRole("combobox", {name:"Operazione 1"})).toHaveValue("kcl")
  await expect(page.getByRole("textbox", {name:"Secondo componente 1"})).toHaveValue("-R1,+R2")
  await page.getByRole("textbox", {name:"Secondo componente 1"}).fill("-R1,+R2,+R3")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Valido fin qui/)).toBeVisible()
  await expect.poll(async () => page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string;correctsErrorId?:string}>>
    }}}}}).__MAESTRO_TEST__
    const events = await harness?.lessonOs?.current?.store?.readAll() ?? []
    return events.findLast(item => item.kind === "circuit.trace.assessed")?.correctsErrorId
  })).toBe(wrong?.errorId)
})

test("KVL and a reversed numeric reference survive the real board and assessment", async ({page}) => {
  const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
  await page.goto("/")
  await page.getByRole("button", {name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("textbox", {name:"Circuito CircuitCheck"}).fill(netlist)
  await page.getByRole("button", {name:"Risolvi e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*42\/5 V/)).toBeVisible()
  await page.getByRole("button", {name:"Aggiungi passaggio"}).click()
  await page.getByRole("combobox", {name:"Operazione 1"}).selectOption("kvl")
  await page.getByRole("textbox", {name:"Trascrizione 1"}).fill("4 I + 6 I + 14 = 0")
  await page.getByRole("textbox", {name:"Nodo 1"}).fill("p")
  await page.getByRole("textbox", {name:"Termini orientati 1"}).fill("+R1,+R2,+V1")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Primo passaggio da rivedere: 1/)).toBeVisible()
  const wrong = await page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string;errorId?:string;conceptId?:string;observedStep?:{operation:string;first:string;second:string}}>>
    }}}}}).__MAESTRO_TEST__
    const events = await harness?.lessonOs?.current?.store?.readAll() ?? []
    return events.findLast(item => item.kind === "circuit.trace.assessed")
  })
  expect(wrong?.conceptId).toBe("circuit:method:kvl")
  expect(wrong?.observedStep).toEqual(expect.objectContaining({operation:"kvl",first:"p",second:"+R1,+R2,+V1"}))
  await page.reload()
  await expect(page.getByText(/Prova riaperta dalla lavagna/)).toBeVisible()
  await page.getByRole("button", {name:"Ricalcola e verifica"}).click()
  await expect(page.getByRole("combobox", {name:"Operazione 1"})).toHaveValue("kvl")
  await expect(page.getByRole("textbox", {name:"Termini orientati 1"})).toHaveValue("+R1,+R2,+V1")
  await page.getByRole("textbox", {name:"Termini orientati 1"}).fill("+R1,+R2,-V1")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Valido fin qui/)).toBeVisible()
  await expect.poll(async () => page.evaluate(async () => {
    const harness = (window as unknown as {__MAESTRO_TEST__?: {lessonOs?: {current?: {store?: {
      readAll(): Promise<Array<{kind:string;correctsErrorId?:string}>>
    }}}}}).__MAESTRO_TEST__
    const events = await harness?.lessonOs?.current?.store?.readAll() ?? []
    return events.findLast(item => item.kind === "circuit.trace.assessed")?.correctsErrorId
  })).toBe(wrong?.errorId)
  await page.getByRole("combobox", {name:"Operazione 1"}).selectOption("tensione")
  await page.getByRole("textbox", {name:"Trascrizione 1"}).fill("V_R2 da 0 a q = -42/5 V")
  await page.getByRole("textbox", {name:"Primo componente 1"}).fill("R2")
  await page.getByRole("textbox", {name:"Verso (morsetti) 1"}).fill("0,q")
  await page.getByRole("textbox", {name:"Valore 1"}).fill("-42/5")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Valido fin qui/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Prova riaperta dalla lavagna/)).toBeVisible()
  await page.getByRole("button", {name:"Ricalcola e verifica"}).click()
  await expect(page.getByRole("textbox", {name:"Verso (morsetti) 1"})).toHaveValue("0,q")
  await expect(page.getByRole("textbox", {name:"Valore 1"})).toHaveValue("-42/5")
})

test("the next lesson retrieves the exact prior circuit step without copying its memory", async ({page}) => {
  const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
  await page.goto("/#circuit-lesson-a")
  await page.getByRole("button", {name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("textbox", {name:"Circuito CircuitCheck"}).fill(netlist)
  await page.getByRole("button", {name:"Risolvi e verifica"}).click()
  await expect(page.getByText(/Risultato verificato:.*42\/5 V/)).toBeVisible()
  await page.getByRole("button", {name:"Aggiungi passaggio"}).click()
  await page.getByRole("textbox", {name:"Trascrizione 1"}).fill("R1+R2=11 Ω")
  await page.getByRole("textbox", {name:"Primo componente 1"}).fill("R1")
  await page.getByRole("textbox", {name:"Secondo componente 1"}).fill("R2")
  await page.getByRole("textbox", {name:"Valore 1"}).fill("11")
  await page.getByRole("button", {name:"Controlla il procedimento"}).click()
  await expect(page.getByText(/Primo passaggio da rivedere: 1/)).toBeVisible()
  await page.goto("/?vista=recap#circuit-lesson-b")
  await expect(page.getByRole("button",{name:"Cerca lezioni precedenti"})).toBeVisible()
  await expect(page.getByText("R1+R2=11 Ω")).toHaveCount(0)
  await page.getByRole("button",{name:"Cerca lezioni precedenti"}).click()
  await page.getByRole("combobox",{name:"Lezione precedente"}).selectOption("circuit-lesson-a")
  await page.getByRole("button",{name:"Apri evidenze"}).click()
  await expect(page.getByText(/Passaggio osservato 1: R1\+R2=11 Ω/)).toBeVisible()
  await expect(page.getByText(/Risultato storico del circuito: 42\/5 V/)).toBeVisible()
})
