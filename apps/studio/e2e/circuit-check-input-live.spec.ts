import { expect, test, type Page } from "@playwright/test"
import JSZip from "jszip"
import { createHash } from "node:crypto"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

test.skip(!process.env.KIRCHHOFF_LOCAL_URL || !process.env.ARDESIA_STUDIO_E2E_BASE_URL,
  "Requires real local Ardesia and Kirchhoff services")

async function drawSource(page:Page) {
  // Mouse-generated freehand input exercises the actual editor protocol. It is
  // not acceptance evidence for a physical pen, pressure sensor or palm rejection.
  const strokes=[[[380,250],[580,250]],[[380,590],[580,590]],
    [[380,250],[380,350],[370,365],[390,385],[370,405],[390,425],[380,445],[380,590]],
    [[580,250],[580,350],[570,365],[590,385],[570,405],[590,425],[580,445],[580,590]]]
  for (const points of strokes) {
    await page.locator("label").filter({has:page.getByTestId("toolbar-freedraw")}).click()
    await page.mouse.move(points[0]![0]!,points[0]![1]!);await page.mouse.down()
    for (const [x,y] of points.slice(1)) await page.mouse.move(x!,y!,{steps:3})
    await page.mouse.up();await page.keyboard.press("Escape")
  }
  for (const [x,y,text] of [[330,220,"a"],[330,600,"0"],[280,375,"R1 = 3 Ω"],[610,375,"R2 = 6 Ω"],[350,660,"Resistenza tra a e 0"]] as const) {
    await page.locator("label").filter({has:page.getByTestId("toolbar-text")}).click()
    await page.mouse.click(x,y);await page.keyboard.insertText(text);await page.keyboard.press("Escape")
  }
  await page.keyboard.press("Escape");await page.keyboard.press("v")
}
async function fillPort(page:Page) {
  for (const [id,value] of [["R1","3"],["R2","6"]]) {
    await page.getByRole("button",{name:"Aggiungi resistore",exact:true}).click()
    await page.getByLabel(`Valore ${id}`,{exact:true}).fill(value!)
    await page.getByLabel(`Primo morsetto ${id}`,{exact:true}).fill("a")
    await page.getByLabel(`Secondo morsetto ${id}`,{exact:true}).fill("0")
  }
  await page.getByLabel("Grandezza da trovare",{exact:true}).selectOption("resistance")
  await page.getByLabel("Primo morsetto della porta",{exact:true}).selectOption("a")
  await page.getByLabel("Secondo morsetto della porta",{exact:true}).selectOption("0")
}
const liveState = (page:Page) => page.evaluate(()=>{
  const el=(window as any).__MAESTRO_TEST__?.apiRef.current?.getSceneElements()
    .find((item:any)=>item.customData?.maestroTool?.owner === "io.ardesia.circuit-reasoning")
  return el?.customData.maestroTool.state
})

test("raw board selection → editable interpretation → confirmed proof → portable original source",async({page,browser},testInfo)=>{
  test.setTimeout(120_000)
  await page.setViewportSize({width:1440,height:1000})
  const room="input-board-port"
  const evidence=process.env.ARDESIA_E2E_EVIDENCE_DIR
  const screenshot=async(target:Page,name:string)=>{
    const bytes=await target.screenshot({path:testInfo.outputPath(name),fullPage:true})
    if(evidence){await mkdir(evidence,{recursive:true});await writeFile(join(evidence,name),bytes)}
  }
  await page.goto(`/#${room}`)
  await expect(page.getByRole("button",{name:"Inserisci CircuitCheck sulla lavagna"})).toBeVisible()
  await drawSource(page)
  const image=await page.screenshot({clip:{x:250,y:200,width:480,height:520}})
  await testInfo.attach("source-drawn-with-mouse.png",{body:image,contentType:"image/png"})
  await page.keyboard.press("ControlOrMeta+a")
  const originals=await page.evaluate(()=>{
    const api=(window as any).__MAESTRO_TEST__.apiRef.current
    const selected=api.getAppState().selectedElementIds
    return api.getSceneElements().filter((el:any)=>selected[el.id])
  })
  expect(originals.filter((el:any)=>el.type === "freedraw")).toHaveLength(4)
  expect(originals.filter((el:any)=>el.type === "text")).toHaveLength(5)
  await page.getByRole("button",{name:"Inserisci CircuitCheck sulla lavagna"}).click()
  await page.getByRole("button",{name:"Acquisisci selezione della lavagna",exact:true}).click()
  await expect(page.getByAltText("Fonte originale da confrontare con i componenti")).toBeVisible()
  await expect(page.getByText(/Tratti e file originali: 9 elementi/)).toBeVisible()
  await page.getByAltText("Fonte originale da confrontare con i componenti").scrollIntoViewIfNeeded()
  await screenshot(page,"board-input-source-visible.png")
  await fillPort(page)
  const confirmation=page.getByRole("checkbox",{name:/Ho confrontato con la fonte/})
  await confirmation.check()
  await page.getByLabel("Valore R1",{exact:true}).fill("4")
  await expect(confirmation).not.toBeChecked()
  await page.getByLabel("Valore R1",{exact:true}).fill("3")
  await expect(confirmation).not.toBeChecked()
  await page.getByRole("button",{name:"Risolvi e verifica",exact:true}).click()
  await expect(page.getByRole("alert")).toContainText("conferma questa revisione")
  await confirmation.check()
  const response=page.waitForResponse(r=>r.url().endsWith("/api/solve") && r.request().method() === "POST")
  await page.getByRole("button",{name:"Risolvi e verifica",exact:true}).click()
  const solve=await response,wire=await solve.json()
  expect(solve.request().postDataJSON().source_kind).toBe("image")
  expect(wire.answer.exact).toBe("2")
  expect(wire.verification.electrical_claim).toBe("PORT_SUBPROOFS_CROSSCHECKED")
  await expect(page.getByText("confrontato ora",{exact:true})).toBeVisible()
  const state=await liveState(page)
  expect(state.input.mode).toBe("structured")
  expect(state.netlist).toBe("R1 a 0 3 ohm\nR2 a 0 6 ohm\n? resistance a 0")
  const sourceScene=JSON.parse(state.input.source.board.scene)
  expect(sourceScene.elements).toEqual(originals)
  expect(createHash("sha256").update(state.input.source.board.scene).digest("hex")).toBe(state.input.source.board.sceneSha256)
  expect(createHash("sha256").update(Buffer.from(state.input.source.image.split(",")[1],"base64")).digest("hex")).toBe(wire.input_provenance.source_sha256)
  expect(state.proof.inputProvenance).toEqual(wire.input_provenance)
  await page.getByRole("heading",{name:"Resistenza vista fra a e 0",exact:true}).scrollIntoViewIfNeeded()
  await screenshot(page,"board-input-proof.png")
  await page.getByRole("link",{name:"Materiali",exact:true}).click()
  const download=page.waitForEvent("download")
  await page.getByRole("button",{name:"Esporta .lesson",exact:true}).click()
  const bundle=await readFile(await (await download).path())
  const zip=await JSZip.loadAsync(bundle)
  const board=JSON.parse(await zip.file("raw/board.excalidraw")!.async("string"))
  const bundled=board.elements.find((el:any)=>el.id === "circuit-reasoning").customData.maestroTool.state
  expect(bundled.input).toEqual(state.input)
  if(evidence){await mkdir(evidence,{recursive:true});await writeFile(join(evidence,"board-input.lesson"),bundle);await writeFile(join(evidence,"board-input-source.png"),image)}
  await testInfo.attach("board-input.lesson",{body:bundle,contentType:"application/zip"})
  const fresh=await browser.newContext({baseURL:process.env.ARDESIA_STUDIO_E2E_BASE_URL,viewport:{width:1440,height:1000}})
  try {
    const reopened=await fresh.newPage()
    await reopened.goto(`/?vista=lezioni-salvate#${room}`)
    await reopened.getByLabel("Seleziona bundle .lesson").setInputFiles({name:"board-input.lesson",mimeType:"application/zip",buffer:bundle})
    await expect(reopened.getByRole("heading",{name:"Anteprima import"})).toBeVisible()
    await reopened.getByRole("button",{name:"Importa il bundle"}).click()
    await expect(reopened.getByRole("status")).toContainText("Import completato")
    await reopened.goto(`/#${room}`)
    await expect(reopened.getByText("prova da ricalcolare",{exact:true})).toBeVisible()
    await expect(reopened.getByRole("checkbox",{name:/Ho confrontato con la fonte/})).not.toBeChecked()
    expect((await liveState(reopened)).input.source).toEqual(state.input.source)
    await reopened.getByRole("button",{name:"Ricalcola e verifica",exact:true}).click()
    await expect(reopened.getByRole("alert")).toContainText("conferma questa revisione")
    await reopened.getByAltText("Fonte originale da confrontare con i componenti").scrollIntoViewIfNeeded()
    await screenshot(reopened,"board-input-restored.png")

    // The same actual source can be loaded as an image without a netlist field.
    const photoContext=await browser.newContext({baseURL:process.env.ARDESIA_STUDIO_E2E_BASE_URL,viewport:{width:1440,height:1000}})
    try {
      const photoPage=await photoContext.newPage()
      await photoPage.goto("/#input-photo-port")
      await photoPage.getByRole("button",{name:"Inserisci CircuitCheck sulla lavagna"}).click()
      await photoPage.getByLabel("Carica fonte CircuitCheck").setInputFiles({name:"source-drawn-with-mouse.png",mimeType:"image/png",buffer:image})
      await expect(photoPage.getByAltText("Fonte originale da confrontare con i componenti")).toBeVisible()
      await fillPort(photoPage)
      await photoPage.getByRole("checkbox",{name:/Ho confrontato con la fonte/}).check()
      await photoPage.getByRole("button",{name:"Risolvi e verifica",exact:true}).click()
      await expect(photoPage.getByText("confrontato ora",{exact:true})).toBeVisible()
      const photo=await liveState(photoPage)
      expect(photo.input.source.sha256).toBe(createHash("sha256").update(image).digest("hex"))
      expect(photo.input.source.kind).toBe("image")
      expect(photo.input.source.board).toBeUndefined()
      expect(photo.proof.answer.exact).toBe("2")
      await photoPage.getByRole("heading",{name:"Resistenza vista fra a e 0",exact:true}).scrollIntoViewIfNeeded()
      await screenshot(photoPage,"photo-input-proof.png")
    } finally {await photoContext.close()}
  } finally {await fresh.close()}
})
