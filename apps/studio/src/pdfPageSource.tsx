import { useEffect, useState } from "react"
import { readPdfAsset, writePdfAsset } from "./store/pdfAssets"
import type { RoomSync, SharedPdfDocument } from "./collaboration/roomSync"
import type { WorkspaceStore } from "./store/WorkspaceStore"

export const PDF_PAGE_DATA_KEY = "ardesiaPdfPage"
export type PdfPageSource = {
  schema: "pdf-page.v1"
  documentId: string
  documentName: string
  page: number
  totalPages: number
  sourceBytes: number
  rasterSha256: string
}

export function readPdfPageSource(value: unknown): PdfPageSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const v = value as Partial<PdfPageSource>
  if (v.schema !== "pdf-page.v1" || !/^document:sha256:[0-9a-f]{64}$/.test(v.documentId ?? "") ||
      typeof v.documentName !== "string" || !v.documentName.trim() || v.documentName.length > 255 || /[\u0000-\u001f\u007f]/.test(v.documentName) ||
      !Number.isSafeInteger(v.totalPages) || v.totalPages! < 1 || !Number.isSafeInteger(v.page) || v.page! < 1 || v.page! > v.totalPages! ||
      !Number.isSafeInteger(v.sourceBytes) || v.sourceBytes! < 1 || v.sourceBytes! > 20 * 1024 * 1024 ||
      !/^[0-9a-f]{64}$/.test(v.rasterSha256 ?? "") || Object.keys(v).some(key =>
        !["schema", "documentId", "documentName", "page", "totalPages", "sourceBytes", "rasterSha256"].includes(key))) return null
  return {schema: v.schema, documentId: v.documentId!, documentName: v.documentName, page: v.page!,
    totalPages: v.totalPages!, sourceBytes: v.sourceBytes!, rasterSha256: v.rasterSha256!}
}

/** PDF provenance does not make an image a semantic tool or prove that its page was read. */
export function rawPdfPageCustomData(type: unknown, value: unknown): boolean {
  if (type !== "image" || !value || typeof value !== "object" || Array.isArray(value)) return false
  const data = value as Record<string, unknown>
  return Object.keys(data).length === 1 && readPdfPageSource(data[PDF_PAGE_DATA_KEY]) !== null
}

export function collectPdfPageSources(elements: readonly unknown[]): PdfPageSource[] {
  return elements.flatMap(element => {
    if (!element || typeof element !== "object") return []
    const el = element as {type?:unknown; isDeleted?:unknown; customData?:Record<string,unknown>}
    if (el.type !== "image" || el.isDeleted) return []
    const source = readPdfPageSource(el.customData?.[PDF_PAGE_DATA_KEY])
    return source ? [source] : []
  })
}

type DocumentState = { id: string; url?: string; blob?: Blob; error?: string }
export function PdfOriginals({store, lessonId, pages, onClose, shared, onExport}: {
  store: WorkspaceStore; lessonId: string; pages: readonly PdfPageSource[]; onClose: () => void;
  shared?: {client:RoomSync;documents:readonly SharedPdfDocument[];role:string;grantId:string;canWrite:boolean};
  onExport?: () => void
}) {
  const [states, setStates] = useState<DocumentState[]>([])
  const [reload, setReload] = useState(0)
  const [pending, setPending] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  async function run(id:string, operation:()=>Promise<void>) {
    setPending(id);setNotice('');setActionError('')
    try {await operation()}
    catch(error){setActionError(error instanceof Error ? error.message : String(error))}
    finally{setPending(null)}
  }
  const signature = JSON.stringify(pages)
  useEffect(() => {
    let cancelled = false
    const urls: string[] = []
    setStates([])
    const documents = [...new Map(pages.map(page => [page.documentId, page])).values()]
    void Promise.all(documents.map(async document => {
      try {
        const asset = await readPdfAsset(store, lessonId, document.documentId.slice("document:sha256:".length))
        if (!asset) throw new Error("Originale assente in questa lezione. Le immagini delle pagine restano disponibili.")
        const sameDocument = pages.filter(page => page.documentId === document.documentId)
        if (sameDocument.some(page => page.sourceBytes !== asset.bytes || page.totalPages !== document.totalPages)) {
          throw new Error("Riferimenti delle pagine discordanti dal documento originale.")
        }
        if (cancelled) return {id: document.documentId}
        const url = URL.createObjectURL(asset.blob)
        urls.push(url)
        return {id: document.documentId, url, blob:asset.blob}
      } catch (error) { return {id: document.documentId, error: error instanceof Error ? error.message : String(error)} }
    })).then(next => { if (!cancelled) setStates(next) })
    return () => { cancelled = true; urls.forEach(url => URL.revokeObjectURL(url)) }
  }, [store, lessonId, signature, reload]) // pages content, not each canvas render
  const documents = [...new Map(pages.map(page => [page.documentId, page])).values()]
  return <section aria-label="PDF originali" style={{position:"absolute",right:16,top:66,zIndex:25,width:"min(470px, calc(100vw - 32px))",maxHeight:"70vh",overflow:"auto",padding:18,background:"white",border:"1px solid #d1d5db",borderRadius:12,boxShadow:"0 12px 35px #0002"}}>
    <button type="button" onClick={onClose} style={{float:"right"}}>Chiudi</button>
    <h2 style={{fontSize:18,margin:"0 0 12px"}}>PDF originali</h2>
    <p>Le pagine sono immagini sulla lavagna. Qui puoi aprire i byte del documento conservato nella lezione.</p>
    {notice && <p role="status">{notice}</p>}
    {actionError && <p role="alert">{actionError}</p>}
    {documents.map(document => {
      const state = states.find(entry => entry.id === document.documentId)
      const sha256 = document.documentId.slice("document:sha256:".length)
      const published = shared?.documents.find(item => item.sha256 === sha256)
      const busy = pending !== null
      const pageNumbers = [...new Set(pages.filter(page => page.documentId === document.documentId).map(page => page.page))].sort((a,b)=>a-b)
      return <article key={document.documentId} style={{borderTop:"1px solid #e5e7eb",paddingTop:12,marginTop:12}}>
        <strong>{document.documentName}</strong>
        <p>Pagine sulla lavagna: {pageNumbers.join(", ")} / {document.totalPages}</p>
        <p style={{fontSize:12,overflowWrap:"anywhere"}}>SHA-256: {document.documentId.slice("document:sha256:".length)}</p>
        {!state && <p role="status">Verifica dei byte originali…</p>}
        {state?.error && <p role="alert">{state.error}</p>}
        {state?.url && <><p>{document.sourceBytes} byte · integrità verificata</p>
          <a href={state.url + `#page=${pageNumbers[0]}`} target="_blank" rel="noopener noreferrer">Apri PDF originale</a>{" · "}
          <a href={state.url} download={document.documentName}>Scarica PDF originale</a></>}
        {shared && <div style={{marginTop:12}}>
          {published ? <p>Originale condiviso con i partecipanti.</p> : <p>Il PDF originale non è condiviso. La pagina visibile non invia il documento intero.</p>}
          {!published && state?.blob && shared.canWrite && <>
            <p>Questo gesto invia tutte le {document.totalPages} pagine ({document.sourceBytes} byte) ai partecipanti autorizzati della stanza.</p>
            <button type="button" disabled={busy} onClick={()=>void run(document.documentId,async()=>{
              await shared.client.publishPdf({sha256,name:document.documentName,totalPages:document.totalPages},state.blob!,'share-complete-document')
              setNotice('PDF originale condiviso con i partecipanti autorizzati.')
            })}>Condividi PDF originale con i partecipanti</button>
          </>}
          {published && !state?.blob && <button type="button" disabled={busy} onClick={()=>void run(document.documentId,async()=>{
            if (published.bytes !== document.sourceBytes || published.totalPages !== document.totalPages) throw new Error('Il PDF condiviso non coincide con i riferimenti della pagina.')
            const blob = await shared.client.downloadPdf(published)
            await writePdfAsset(store,lessonId,blob,sha256)
            setReload(value=>value+1)
            setNotice('Originale verificato e conservato in questa lezione. Puoi includerlo nel file .lesson.')
          })}>Conserva PDF originale in questa lezione</button>}
          {published && (shared.role === 'owner' || shared.role === 'editor' && published.publishedBy === shared.grantId) &&
            <button type="button" disabled={busy} onClick={()=>void run(document.documentId,async()=>{
              await shared.client.withdrawPdf(sha256)
              setNotice('Condivisione interrotta. Le copie già salvate dai partecipanti restano sui loro dispositivi.')
            })}>Interrompi condivisione originale</button>}
          {pending === document.documentId && <p role="status">Trasferimento PDF in corso…</p>}
        </div>}
      </article>
    })}
    {shared && <p>La condivisione trasferisce la lavagna e i PDF scelti. La cronologia del docente non viene trasferita: la copia esportata conserva soltanto la memoria già presente su questo dispositivo.</p>}
    {onExport && <button type="button" onClick={onExport}>Apri Materiali per esportare la copia locale</button>}
    <p style={{fontSize:12}}>L’importazione conserva la fonte; non attesta la lettura o la verifica didattica delle pagine. Per la portabilità esporta il file .lesson.</p>
  </section>
}
