// @vitest-environment jsdom
import { webcrypto } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
const harness=vi.hoisted(()=>({getDocument:vi.fn(),worker:{workerSrc:""}}))
vi.mock("pdfjs-dist",()=>({getDocument:harness.getDocument,GlobalWorkerOptions:harness.worker}))
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url",()=>({default:"/local-pdf-worker.mjs"}))
import { pdfToImages } from "../loadFile"

const bytes=new TextEncoder().encode("PDF source bytes for the worker lifecycle unit boundary")
const file={name:"source.pdf",arrayBuffer:async()=>bytes.buffer.slice(0)} as File
beforeEach(()=>{
  vi.stubGlobal("crypto",webcrypto)
  vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue({} as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype,"toDataURL").mockReturnValue("data:image/png;base64,unit-boundary")
})
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();harness.getDocument.mockReset()})
describe("risorse e provenienza dell’import PDF",()=>{
  it("associa tutte le pagine allo stesso contenuto e rilascia pagine e worker",async()=>{
    const pages=[1,2].map(()=>({getViewport:vi.fn(()=>({width:400.2,height:600.1})),render:vi.fn(()=>({promise:Promise.resolve()})),cleanup:vi.fn()}))
    const destroy=vi.fn(async()=>{})
    harness.getDocument.mockReturnValue({promise:Promise.resolve({numPages:2,getPage:async(n:number)=>pages[n-1]}),destroy})
    const result=await pdfToImages(file)
    expect(harness.worker.workerSrc).toBe("/local-pdf-worker.mjs")
    expect(harness.getDocument).toHaveBeenCalledWith({data:bytes.buffer,enableXfa:false})
    expect(result.map(p=>[p.page,p.totalPages,p.width,p.height])).toEqual([[1,2,401,601],[2,2,401,601]])
    expect(result[0].documentId).toMatch(/^document:sha256:[a-f0-9]{64}$/)
    expect(result[1].documentId).toBe(result[0].documentId)
    expect(result[0].documentName).toBe("source.pdf")
    expect(pages.every(p=>p.cleanup.mock.calls.length===1)).toBe(true)
    expect(destroy).toHaveBeenCalledOnce()
  })
  it("non restituisce un import parziale se una pagina fallisce e libera il worker",async()=>{
    const cleanup=vi.fn(),destroy=vi.fn(async()=>{})
    const page={getViewport:()=>({width:100,height:100}),render:()=>({promise:Promise.reject(new Error("font rendering failed"))}),cleanup}
    harness.getDocument.mockReturnValue({promise:Promise.resolve({numPages:3,getPage:async()=>page}),destroy})
    await expect(pdfToImages(file)).rejects.toThrow("font rendering failed")
    expect(cleanup).toHaveBeenCalledOnce();expect(destroy).toHaveBeenCalledOnce()
  })
  it("libera il worker anche quando il parser rifiuta il documento",async()=>{
    const destroy=vi.fn(async()=>{})
    harness.getDocument.mockImplementation(()=>({promise:Promise.reject(new Error("Invalid PDF structure")),destroy}))
    await expect(pdfToImages(file)).rejects.toThrow("Invalid PDF structure")
    expect(destroy).toHaveBeenCalledOnce()
  })
})
