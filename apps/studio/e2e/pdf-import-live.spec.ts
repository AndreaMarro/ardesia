import { expect, test, type Page } from "@playwright/test"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"
import { join } from "node:path"
import JSZip from "jszip"

test.skip(!process.env.ARDESIA_STUDIO_E2E_BASE_URL,"Requires real local Ardesia")
const sourcePath=fileURLToPath(new URL("../../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf",import.meta.url))
// This existing repository PDF has 7 pages, independently checked with pdfinfo.
const totalPages=7
const snapshot=(page:Page)=>page.evaluate(()=>{
  const api=(window as any).__MAESTRO_TEST__?.apiRef.current
  return api ? {elements:api.getSceneElements().filter((el:any)=>el.type === "image" && !el.isDeleted),files:api.getFiles()} : null
})
const fileHashes=(files:Record<string,{dataURL:string}>)=>Object.fromEntries(Object.entries(files).map(([id,file])=>
  [id,createHash("sha256").update(Buffer.from(file.dataURL.split(",")[1]!,"base64")).digest("hex")]))
const pageLayout=(elements:any[])=>elements.map(el=>[el.id,el.fileId,el.x,el.y,el.width,el.height,el.angle,el.crop ?? null,el.customData?.ardesiaPdfPage ?? null])

test("real seven-page PDF → local board pages → bundle → independent browser",async({page,browser},testInfo)=>{
  test.setTimeout(120_000)
  const room="pdf-import-portability",source=await readFile(sourcePath)
  const sha256=createHash("sha256").update(source).digest("hex")
  const documentId=`document:sha256:${sha256}`
  const remoteRecognition:string[]=[]
  const diagnostics:string[]=[]
  page.on("console",message=>{if(["warning","error"].includes(message.type()))diagnostics.push(`${message.type()}: ${message.text().slice(0,1500)}`)})
  page.on("pageerror",error=>diagnostics.push(`pageerror: ${error.message}`))
  page.on("requestfailed",request=>diagnostics.push(`requestfailed: ${new URL(request.url()).pathname} ${request.failure()?.errorText}`))
  page.on("worker",worker=>diagnostics.push(`worker: ${new URL(worker.url()).pathname}`))
  page.on("request",r=>{if(r.url().includes("/api/recognize"))remoteRecognition.push(r.url())})
  await page.setViewportSize({width:1440,height:1000})
  await page.goto(`/#${room}`)
  await expect(page.getByRole("button",{name:"Inserisci immagine, PDF o .lesson",exact:true})).toBeVisible()
  await expect.poll(()=>page.evaluate(()=>{
    const h=(window as any).__MAESTRO_TEST__
    return Boolean(h?.ready && h.initialLoadDone && h.journal && h.apiRef.current)
  })).toBe(true)
  await page.locator('input[type="file"][accept="image/*,application/pdf,.lesson"]').setInputFiles(sourcePath)
  try {
    await expect.poll(async()=> (await snapshot(page))?.elements.length,{timeout:45_000}).toBe(totalPages)
  } catch(error) {
    await testInfo.attach("pdf-import-diagnostics.json",{body:JSON.stringify({diagnostics,snapshot:await snapshot(page)},null,2),contentType:"application/json"})
    throw error
  }
  const before=await snapshot(page)
  expect(Object.keys(before!.files)).toHaveLength(totalPages)
  expect(before!.elements.every((el:any)=>el.width>0 && el.height>0 && before!.files[el.fileId]?.mimeType === "image/png")).toBe(true)
  const rasterHashes=fileHashes(before!.files)
  expect(before!.elements.map((el:any)=>el.customData?.ardesiaPdfPage)).toEqual(before!.elements.map((el:any,index:number)=>({
    schema:"pdf-page.v1",documentId,documentName:"ELAB-Collaborator-Deck.pdf",page:index+1,totalPages,sourceBytes:source.length,rasterSha256:rasterHashes[el.fileId],
  })))
  await page.getByRole("button",{name:"PDF originali",exact:true}).click()
  await expect(page.getByRole("link",{name:"Apri PDF originale",exact:true})).toHaveAttribute("href",/^blob:.*#page=1$/)
  const originalDownload=page.waitForEvent("download")
  await page.getByRole("link",{name:"Scarica PDF originale",exact:true}).click()
  expect(await readFile(await (await originalDownload).path())).toEqual(source)
  await page.getByRole("region",{name:"PDF originali",exact:true}).getByRole("button",{name:"Chiudi",exact:true}).click()
  expect(new Set(Object.values(rasterHashes)).size).toBe(totalPages)
  const ink=await page.evaluate(async()=>{
    const files=(window as any).__MAESTRO_TEST__.apiRef.current.getFiles()
    const counts=[]
    for(const file of Object.values(files) as {dataURL:string}[]) {
      const image=new Image();image.src=file.dataURL;await image.decode()
      const canvas=document.createElement("canvas");canvas.width=160;canvas.height=220
      const context=canvas.getContext("2d")!;context.drawImage(image,0,0,160,220)
      const pixels=context.getImageData(0,0,160,220).data
      let marked=0
      for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]!>0 && pixels[i]!+pixels[i+1]!+pixels[i+2]!<650)marked++
      counts.push(marked)
    }
    return counts
  })
  expect(ink.every(count=>count>50)).toBe(true)
  const evidence=process.env.ARDESIA_E2E_EVIDENCE_DIR
  const shot=await page.screenshot({path:testInfo.outputPath("pdf-import-board.png"),fullPage:true})
  const firstId=before!.elements[0].fileId
  const firstPage=Buffer.from(before!.files[firstId].dataURL.split(",")[1],"base64")
  await testInfo.attach("pdf-page-1.png",{body:firstPage,contentType:"image/png"})

  // Invalid input must leave the successful import intact rather than adding partial pages.
  await page.locator('input[type="file"][accept="image/*,application/pdf,.lesson"]').setInputFiles({name:"unreadable.pdf",mimeType:"application/pdf",buffer:Buffer.from("%PDF-1.7\ninvalid")})
  await expect(page.getByText(/Caricamento non riuscito:/)).toBeVisible()
  expect(pageLayout((await snapshot(page))!.elements)).toEqual(pageLayout(before!.elements))
  expect(fileHashes((await snapshot(page))!.files)).toEqual(rasterHashes)
  await page.getByRole("link",{name:"Materiali",exact:true}).click()
  const downloading=page.waitForEvent("download")
  await page.getByRole("button",{name:"Esporta .lesson",exact:true}).click()
  const bundle=await readFile(await (await downloading).path())
  const zip=await JSZip.loadAsync(bundle)
  const manifest=JSON.parse(await zip.file("manifest.json")!.async("string"))
  expect(manifest).toMatchObject({schemaVersion:3,compatibility:{minimumReaderSchemaVersion:3}})
  const originalPath=`raw/documents/${sha256}.pdf`
  expect(Buffer.from(await zip.file(originalPath)!.async("uint8array"))).toEqual(source)
  expect(manifest.files.find((entry:any)=>entry.path === originalPath)).toMatchObject({sha256,bytes:source.length})
  const board=JSON.parse(await zip.file("raw/board.excalidraw")!.async("string"))
  expect(fileHashes(board.files)).toEqual(rasterHashes)
  const journal=(await zip.file("raw/events.jsonl")!.async("string")).trim().split("\n").map(line=>JSON.parse(line))
  const imported=journal.filter(event=>event.kind === "journal.pdf.imported")
  expect(imported).toHaveLength(totalPages)
  expect(imported.map(event=>event.payload.page)).toEqual([1,2,3,4,5,6,7])
  expect(imported.every(event=>event.payload.documentId === documentId && event.payload.totalPages === totalPages &&
    event.payload.documentName === "ELAB-Collaborator-Deck.pdf" && event.evidence.every((ref:{resolution:string})=>ref.resolution === "missing"))).toBe(true)
  const events=(await zip.file("raw/lessonos-events.jsonl")!.async("string")).trim().split("\n").map(line=>JSON.parse(line))
  expect(events.some(event=>event.kind === "material.cited")).toBe(false)
  expect(remoteRecognition).toEqual([])
  const summary={documentId,totalPages,pageRasterSha256:rasterHashes,nonWhiteSamplePixels:ink,
    bundleSha256:createHash("sha256").update(bundle).digest("hex"),
    originalPdfIncluded:true,originalPdfSha256:sha256,originalPdfBytes:source.length,manifestSchemaVersion:manifest.schemaVersion,scope:"Original PDF bytes, rendered pages and import provenance; import is not evidence of reading the pages."}
  await testInfo.attach("pdf-import-summary.json",{body:JSON.stringify(summary,null,2),contentType:"application/json"})
  if(evidence){await mkdir(evidence,{recursive:true});await writeFile(join(evidence,"pdf-import.lesson"),bundle);await writeFile(join(evidence,"pdf-import-board.png"),shot);await writeFile(join(evidence,"pdf-page-1.png"),firstPage);await writeFile(join(evidence,"pdf-import-summary.json"),JSON.stringify(summary,null,2)+"\n")}

  const fresh=await browser.newContext({baseURL:process.env.ARDESIA_STUDIO_E2E_BASE_URL,viewport:{width:1440,height:1000}})
  try {
    const reopened=await fresh.newPage()
    await reopened.goto(`/?vista=lezioni-salvate#${room}`)
    await reopened.getByLabel("Seleziona bundle .lesson").setInputFiles({name:"pdf-import.lesson",mimeType:"application/zip",buffer:bundle})
    await expect(reopened.getByRole("heading",{name:"Anteprima import"})).toBeVisible()
    await reopened.getByRole("button",{name:"Importa il bundle"}).click()
    await expect(reopened.getByRole("status")).toContainText("Import completato")
    await reopened.goto(`/#${room}`)
    await expect.poll(async()=> (await snapshot(reopened))?.elements.length).toBe(totalPages)
    const restored=await snapshot(reopened)
    expect(fileHashes(restored!.files)).toEqual(rasterHashes)
    expect(pageLayout(restored!.elements)).toEqual(pageLayout(before!.elements))
    await reopened.getByRole("button",{name:"PDF originali",exact:true}).click()
    await expect(reopened.getByRole("link",{name:"Apri PDF originale",exact:true})).toHaveAttribute("href",/^blob:.*#page=1$/)
    const restoredDownload=reopened.waitForEvent("download")
    await reopened.getByRole("link",{name:"Scarica PDF originale",exact:true}).click()
    expect(await readFile(await (await restoredDownload).path())).toEqual(source)
    await expect(reopened.getByRole("region",{name:"PDF originali",exact:true})).toContainText(sha256)
    await expect(reopened.getByRole("region",{name:"PDF originali",exact:true})).toContainText("1, 2, 3, 4, 5, 6, 7 / 7")
    const restoredJournal=await reopened.evaluate(async path=>await (await (window as any).__MAESTRO_TEST__.store.read(path)).text(),`raw/${room}/events.jsonl`)
    const restoredImports=restoredJournal.trim().split("\n").map((line:string)=>JSON.parse(line)).filter((event:any)=>event.kind === "journal.pdf.imported")
    expect(restoredImports.map((event:any)=>event.payload)).toEqual(imported.map(event=>event.payload))
    const restoredShot=await reopened.screenshot({path:testInfo.outputPath("pdf-import-restored.png"),fullPage:true})
    if(evidence)await writeFile(join(evidence,"pdf-import-restored.png"),restoredShot)
  } finally {await fresh.close()}
})
