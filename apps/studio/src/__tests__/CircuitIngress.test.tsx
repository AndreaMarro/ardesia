// @vitest-environment jsdom
import { webcrypto } from "node:crypto"
import { readFileSync } from "node:fs"
import { PdfOriginals, PDF_PAGE_DATA_KEY, readPdfPageSource } from "../pdfPageSource"
import { WorkspaceStore } from "../store/WorkspaceStore"
import { pdfSha256 } from "../store/pdfAssets"
import type { RoomSync, SharedPdfDocument } from "../collaboration/roomSync"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CircuitCheckEmbed } from "../toolhost/CircuitCheckEmbed"
import { CIRCUIT_CHECK_TOOL_ID, emptyCircuitState, type CircuitEmbedState } from "../toolhost/circuitCheckAdapter"
import { confirmCircuitInput, initialCircuitIngress, inputSourceFromImage, readCircuitIngress, type CircuitIngressState } from "../toolhost/circuitIngress"
import { captureToolSource, prepareToolSourceSelection, sourceSha256, verifyToolSource } from "../toolhost/toolSource"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import portResponse from "./fixtures/circuitcheck-port-response.json"

// One real PNG pixel used only to exercise the source/receipt boundary; no OCR claim.
const image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ioAAAAASUVORK5CYII="
const link={toolId:CIRCUIT_CHECK_TOOL_ID,embedId:"circuit-input-test"}
type Saved=CircuitEmbedState & {input:CircuitIngressState}
const element=(state:Saved)=>({id:link.embedId,customData:{[EMBED_DATA_KEY]:{owner:link.toolId,state}}})
beforeEach(()=>vi.stubGlobal("crypto",webcrypto))
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
async function sourceState():Promise<Saved>{
  const input=initialCircuitIngress(portResponse.netlist)
  return {...emptyCircuitState(),netlist:portResponse.netlist,input:{...input,mode:"structured",source:await inputSourceFromImage(image,"source.png")}}
}
describe("ingresso CircuitCheck con fonte conservata",()=>{
  it("lega la conferma ai byte della fonte e della revisione e rifiuta ricevute di altro circuito",async()=>{
    const source=await inputSourceFromImage(image,"source.png"), circuit_sha256=await sourceSha256(portResponse.netlist)
    const fetch=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({source_sha256:source.sha256,source_token:"local-source"})))
      .mockResolvedValueOnce(new Response(JSON.stringify({source_sha256:source.sha256,circuit_sha256,confirmed_at_unix:123,confirmation_token:"local-confirmed"})))
    vi.stubGlobal("fetch",fetch)
    expect((await confirmCircuitInput(source,portResponse.netlist)).receipt.circuit_sha256).toBe(circuit_sha256)
    expect(JSON.parse(fetch.mock.calls[1]![1].body).netlist).toBe(portResponse.netlist)
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({source_sha256:source.sha256,source_token:"local-source"})))
      .mockResolvedValueOnce(new Response(JSON.stringify({source_sha256:source.sha256,circuit_sha256:"a".repeat(64),confirmed_at_unix:123,confirmation_token:"wrong"})))
    await expect(confirmCircuitInput(source,portResponse.netlist)).rejects.toThrow("questa revisione")
    await expect(confirmCircuitInput({...source,sha256:"a".repeat(64)},portResponse.netlist)).rejects.toThrow("cambiata")
  })
  it("conserva vettori selezionati e respinge hash manomessi e oggetti semantici rasterizzati",async()=>{
    const scene=JSON.stringify({elements:[{id:"stroke",type:"freedraw",points:[[0,0],[30,20]],pressures:[0.2,0.7]}],files:{}})
    const source={schema:"tool-source.v1",image,scene,elementIds:["stroke"],sceneSha256:await sourceSha256(scene)}
    expect((await verifyToolSource(source)).scene).toBe(scene)
    await expect(verifyToolSource({...source,scene:scene.replace("0.7","0.5")})).rejects.toThrow("cambiata")
    await expect(verifyToolSource({...source,scene:scene.replace("freedraw","embeddable")})).rejects.toThrow("semantici")
    await expect(verifyToolSource({...source,elementIds:["other"]})).rejects.toThrow()
  })
  it("acquisisce soltanto la selezione originale, senza mutarla né trascinare altri file",async()=>{
    const stroke={id:"stroke",type:"freedraw",points:[[0,0],[30,20]],pressures:[0.2,0.7]}
    const photo={id:"photo",type:"image",fileId:"file"}
    const elements=[stroke,photo,{id:"private-other",type:"image",fileId:"unselected"}]
    const files={file:{id:"file",dataURL:image},unselected:{id:"unselected",dataURL:"not-in-selection"}}
    const before=JSON.stringify({elements,files})
    const selection=prepareToolSourceSelection(elements,files,["stroke","photo"])
    const render=vi.fn(async()=>image)
    const source=await captureToolSource(selection,render)
    expect(source.scene).not.toContain("unselected")
    expect(source.scene).not.toContain("private-other")
    expect(JSON.parse(source.scene).elements[0]).toEqual(stroke)
    expect(JSON.stringify({elements,files})).toBe(before)
    expect(render).toHaveBeenCalledOnce()
    expect(()=>prepareToolSourceSelection([{...stroke,customData:{semantic:"equation"}}],{},["stroke"])).toThrow("semantici")
    expect(()=>prepareToolSourceSelection(elements,files,["missing"])).toThrow()
    expect(()=>prepareToolSourceSelection([photo],{},["photo"])).toThrow("file originale")
  })
  it("trasferisce una pagina PDF con provenienza valida e rifiuta raster o metadati cambiati",async()=>{
    const rasterSha256=await sourceSha256(Uint8Array.from(atob(image.split(",")[1]!),c=>c.charCodeAt(0)))
    const page={schema:"pdf-page.v1",documentId:"document:sha256:"+"a".repeat(64),documentName:"pagina.pdf",page:2,totalPages:7,sourceBytes:12685,rasterSha256}
    const photo={id:"pdf-page",type:"image",fileId:"page-file",customData:{[PDF_PAGE_DATA_KEY]:page}}
    const files={"page-file":{id:"page-file",dataURL:image}}
    const selection=prepareToolSourceSelection([photo],files,[photo.id])
    expect(JSON.parse((await captureToolSource(selection,async()=>image)).scene).elements[0].customData).toEqual(photo.customData)
    const altered={...photo,customData:{[PDF_PAGE_DATA_KEY]:{...page,rasterSha256:"b".repeat(64)}}}
    await expect(captureToolSource(prepareToolSourceSelection([altered],files,[photo.id]),async()=>image)).rejects.toThrow("pagina PDF selezionata è cambiata")
    for(const metadata of [{...page,page:8},{...page,page:0},{...page,documentId:"bad"},{...page,semantic:"solver"}]) {
      expect(readPdfPageSource(metadata)).toBeNull()
      expect(()=>prepareToolSourceSelection([{...photo,customData:{[PDF_PAGE_DATA_KEY]:metadata}}],files,[photo.id])).toThrow("semantici")
    }
    expect(()=>prepareToolSourceSelection([{...photo,customData:{...photo.customData,toolEmbed:{}}}],files,[photo.id])).toThrow("semantici")
  })
  it("offre download e apertura solo dopo aver verificato i byte del PDF originale",async()=>{
    const pdf=new Blob([readFileSync("../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf")])
    const documentId="document:sha256:"+await pdfSha256(pdf)
    const page={schema:"pdf-page.v1" as const,documentId,documentName:"fonte.pdf",page:1,totalPages:7,sourceBytes:pdf.size,rasterSha256:"a".repeat(64)}
    const store=new WorkspaceStore()
    const read=vi.spyOn(store,"read").mockResolvedValue(pdf)
    const create=vi.fn(()=>"blob:verified-pdf"),revoke=vi.fn()
    const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL
    URL.createObjectURL=create;URL.revokeObjectURL=revoke
    try {
      const view=render(<PdfOriginals store={store} lessonId="pdf-test" pages={[page]} onClose={()=>{}}/>)
      expect((await screen.findByRole("link",{name:"Scarica PDF originale"})).getAttribute("download")).toBe("fonte.pdf")
      expect(screen.getByRole("link",{name:"Apri PDF originale"}).getAttribute("href")).toBe("blob:verified-pdf#page=1")
      expect(read).toHaveBeenCalledWith(`raw/pdf-test/documents/${documentId.slice("document:sha256:".length)}.pdf`)
      view.unmount();expect(revoke).toHaveBeenCalledWith("blob:verified-pdf")
      read.mockResolvedValue(new Blob(["%PDF- changed"]))
      const changed=render(<PdfOriginals store={store} lessonId="pdf-test" pages={[page]} onClose={()=>{}}/>)
      expect((await screen.findByRole("alert")).textContent).toContain("SHA-256 discordante")
      expect(screen.queryByRole("link",{name:"Scarica PDF originale"})).toBeNull()
      changed.unmount();read.mockResolvedValue(null)
      render(<PdfOriginals store={store} lessonId="pdf-test" pages={[page]} onClose={()=>{}}/>)
      expect((await screen.findByRole("alert")).textContent).toContain("Originale assente")
    } finally {URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke}
  })
  it("il documento resta privato fino al gesto esplicito di condivisione per quel PDF",async()=>{
    const pdf=new Blob([readFileSync("../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf")])
    const sha256=await pdfSha256(pdf)
    const page={schema:"pdf-page.v1" as const,documentId:"document:sha256:"+sha256,documentName:"fonte.pdf",page:1,totalPages:7,sourceBytes:pdf.size,rasterSha256:"a".repeat(64)}
    const store=new WorkspaceStore();vi.spyOn(store,"read").mockResolvedValue(pdf)
    const publishPdf=vi.fn(async()=>{}),downloadPdf=vi.fn(),withdrawPdf=vi.fn()
    const client={publishPdf,downloadPdf,withdrawPdf} as unknown as RoomSync
    const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL
    URL.createObjectURL=vi.fn(()=>"blob:private-original");URL.revokeObjectURL=vi.fn()
    try {
      render(<PdfOriginals store={store} lessonId="pdf-test" pages={[page]} onClose={()=>{}} shared={{client,documents:[],role:"owner",grantId:"owner",canWrite:true}}/>)
      const share=await screen.findByRole("button",{name:"Condividi PDF originale con i partecipanti"})
      expect(screen.getByText(/invia tutte le 7 pagine/)).toBeDefined()
      expect(publishPdf).not.toHaveBeenCalled();expect(downloadPdf).not.toHaveBeenCalled()
      fireEvent.click(share)
      await screen.findByText("PDF originale condiviso con i partecipanti autorizzati.")
      expect(publishPdf).toHaveBeenCalledOnce()
      expect(publishPdf).toHaveBeenCalledWith({sha256,name:"fonte.pdf",totalPages:7},expect.any(Blob),'share-complete-document')
    } finally {URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke}
  })
  it("il viewer conserva soltanto su richiesta e un errore di integrità non crea copie o link",async()=>{
    const pdf=new Blob([readFileSync("../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf")])
    const sha256=await pdfSha256(pdf)
    const page={schema:"pdf-page.v1" as const,documentId:"document:sha256:"+sha256,documentName:"fonte.pdf",page:1,totalPages:7,sourceBytes:pdf.size,rasterSha256:"a".repeat(64)}
    const document:SharedPdfDocument={schema:'shared-pdf.v1',sha256,name:'fonte.pdf',bytes:pdf.size,totalPages:7,publishedBy:'owner',publishedAt:1,withdrawnAt:null}
    const files=new Map<string,Blob>(),store=new WorkspaceStore()
    vi.spyOn(store,"read").mockImplementation(async path=>files.get(path) ?? null)
    vi.spyOn(store,"write").mockImplementation(async(path,blob)=>{files.set(path,blob)})
    vi.spyOn(store,"list").mockImplementation(async()=>[...files].map(([path,data])=>({path,data,mtime:0})))
    const downloadPdf=vi.fn(async()=>new Blob(['%PDF- altered'])),publishPdf=vi.fn()
    const client={downloadPdf,publishPdf} as unknown as RoomSync
    const oldCreate=URL.createObjectURL,oldRevoke=URL.revokeObjectURL
    URL.createObjectURL=vi.fn(()=>"blob:received-original");URL.revokeObjectURL=vi.fn()
    try {
      render(<PdfOriginals store={store} lessonId="pdf-test" pages={[page]} onClose={()=>{}} shared={{client,documents:[document],role:"viewer",grantId:"viewer",canWrite:false}}/>)
      await screen.findByText(/Originale assente/)
      expect(downloadPdf).not.toHaveBeenCalled();expect(publishPdf).not.toHaveBeenCalled()
      expect(screen.queryByRole("button",{name:"Condividi PDF originale con i partecipanti"})).toBeNull()
      expect(screen.queryByRole("button",{name:"Interrompi condivisione originale"})).toBeNull()
      fireEvent.click(screen.getByRole("button",{name:"Conserva PDF originale in questa lezione"}))
      await screen.findByText(/SHA-256 discordante/)
      expect(files.size).toBe(0)
      expect(screen.queryByRole("link",{name:"Scarica PDF originale"})).toBeNull()
      downloadPdf.mockResolvedValue(pdf)
      fireEvent.click(screen.getByRole("button",{name:"Conserva PDF originale in questa lezione"}))
      await screen.findByRole("link",{name:"Scarica PDF originale"})
      expect(await files.get(`raw/pdf-test/documents/${sha256}.pdf`)!.arrayBuffer()).toEqual(await pdf.arrayBuffer())
    } finally {URL.createObjectURL=oldCreate;URL.revokeObjectURL=oldRevoke}
  })
  it("trasferisce dalla lavagna alla fonte persistita e riapre tratti e pressioni",async()=>{
    const selection=prepareToolSourceSelection([{id:"pen",type:"freedraw",points:[[0,0],[5,7]],pressures:[0.2,0.9]}],{},["pen"])
    const board=await captureToolSource(selection,async()=>image)
    let saved=await sourceState()
    const host={captureSelection:vi.fn(async()=>board),persistEmbedState:async(_id:string,next:unknown)=>{saved=JSON.parse(JSON.stringify(next)) as Saved;return true}}
    const first=render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={host}/>)
    fireEvent.click(screen.getByRole("button",{name:"Acquisisci selezione della lavagna"}))
    await screen.findByText("Selezione lavagna · 1 elementi")
    expect(saved.input.source?.board?.scene).toBe(selection.scene)
    expect(host.captureSelection).toHaveBeenCalledWith(link.embedId)
    first.unmount()
    render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={host}/>)
    expect(screen.getByText(/Tratti e file originali: 1 elementi/)).toBeDefined()
    expect(JSON.parse(saved.input.source!.board!.scene).elements[0].pressures).toEqual([0.2,0.9])
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
  })
  it("ogni modifica locale annulla la revisione e il reopen non riusa una conferma",async()=>{
    let saved=await sourceState()
    const calls=vi.fn(async()=>new Response(JSON.stringify({})))
    vi.stubGlobal("fetch",calls)
    const host={persistEmbedState:async(_id:string,next:unknown)=>{saved=JSON.parse(JSON.stringify(next)) as Saved;return true},flushEmbedState:async()=>true}
    const first=render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={host}/>)
    const confirmation=screen.getByRole("checkbox") as HTMLInputElement
    expect(calls).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    expect((await screen.findByRole("alert")).textContent).toContain("conferma questa revisione")
    expect(calls).not.toHaveBeenCalled()
    fireEvent.click(confirmation)
    expect(confirmation.checked).toBe(true)
    fireEvent.change(screen.getByLabelText("Valore R1"),{target:{value:"4"}})
    expect(confirmation.checked).toBe(false)
    expect(saved.netlist).toContain("R1 a 0 4 ohm")
    expect(saved.input.source?.image).toBe(image)
    fireEvent.change(screen.getByLabelText("Valore R1"),{target:{value:"3"}})
    expect(confirmation.checked).toBe(false)
    fireEvent.click(confirmation)
    first.unmount()
    render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={host}/>)
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
    expect(screen.getByAltText("Fonte originale da confrontare con i componenti").getAttribute("src")).toBe(image)
    expect(calls).not.toHaveBeenCalled()
  })
  it("aprire la vista esperta non elude la revisione del modello strutturato",async()=>{
    const saved=await sourceState()
    saved.input={...saved.input,source:null,reviewRequired:true}
    const fetch=vi.fn();vi.stubGlobal("fetch",fetch)
    render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={{persistEmbedState:async()=>true}}/>)
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.change(screen.getByLabelText("Valore R1"),{target:{value:"4"}})
    fireEvent.click(screen.getByRole("button",{name:"Vista esperta"}))
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    expect((await screen.findByRole("alert")).textContent).toContain("conferma questa revisione")
    expect(fetch).not.toHaveBeenCalled()
  })
  it("salva fonte, interpretazione e ricevuta prima di registrare la prova senza textbox obbligatoria",async()=>{
    let saved=await sourceState()
    const receipt={source_sha256:saved.input.source!.sha256,circuit_sha256:await sourceSha256(saved.netlist),confirmed_at_unix:123}
    const calls=vi.fn(async(url:string)=>new Response(JSON.stringify(url.endsWith("/source") ? {...receipt,source_token:"source"} : url.endsWith("/confirm") ? {...receipt,confirmation_token:"confirmation"} : {...portResponse,input_provenance:{source_kind:"image",...receipt}})))
    vi.stubGlobal("fetch",calls)
    const emitLessonEvent=vi.fn()
    render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={{persistEmbedState:async(_id,next)=>{saved=JSON.parse(JSON.stringify(next)) as Saved;return true},flushEmbedState:async()=>true,emitLessonEvent}}/>)
    expect(screen.queryByRole("textbox",{name:"Circuito CircuitCheck"})).toBeNull()
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    await screen.findByText("confrontato ora")
    expect(calls.mock.calls.map(c=>c[0])).toEqual(["/circuitcheck/api/source","/circuitcheck/api/confirm","/circuitcheck/api/solve"])
    expect(emitLessonEvent).toHaveBeenCalledOnce()
    expect(readCircuitIngress(saved.input).receipt).toEqual(receipt)
    expect(saved.input.source?.image).toBe(image)
    expect(saved.input.model?.components).toHaveLength(2)
    expect(saved.proof?.inputProvenance?.source_sha256).toBe(receipt.source_sha256)
  })
  it("un errore di riconoscimento mantiene la fonte e il percorso manuale",async()=>{
    const saved=await sourceState()
    vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({message:"Provider non configurato"}),{status:422})))
    render(<CircuitCheckEmbed element={element(saved)} toolLink={link} host={{persistEmbedState:async()=>true}}/>)
    fireEvent.click(screen.getByRole("button",{name:"Invia a OpenAI e proponi lettura"}))
    expect((await screen.findByRole("alert")).textContent).toContain("Provider non configurato")
    await waitFor(()=>expect((screen.getByLabelText("Valore R1") as HTMLInputElement).disabled).toBe(false))
    expect(screen.getByAltText("Fonte originale da confrontare con i componenti").getAttribute("src")).toBe(image)
    expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false)
  })
})
