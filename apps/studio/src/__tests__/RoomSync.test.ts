// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { pdfSha256 } from '../store/pdfAssets'
import type { SharedPdfDocument } from '../collaboration/roomSync'
import { RoomSync, type SyncState } from '../collaboration/roomSync'

let storage: Map<string, string>
let state: SyncState | undefined
let remote: any
let deny = false
let failAck = false
let accepted: any[]
let undoRequests: any[]
let failUndoAck = false
let undoGate: Promise<void> | null = null
let operationBefore: Map<string, any>
let undone: Set<string>
let clients: RoomSync[]
beforeEach(() => {
  storage = new Map(); accepted = []; deny = false; failAck = false; state = undefined
  undoRequests = []; failUndoAck = false; undoGate = null; operationBefore = new Map(); undone = new Set()
  clients = []
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  } })
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto })
  remote = { roomId: 'room', title: '', role: 'editor', grantId: 'grant', revision: 0, elements: [], objectVersions: {}, files: {} }
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: any) => {
    const route = new URL(url).pathname.split('/').at(-1)
    if (deny) return { ok: false, status: 401, json: async () => ({ error: 'unauthorized' }) }
    if (route === 'operations') {
      const op = JSON.parse(init.body)
      if (!accepted.some(item => item.operationId === op.operationId)) {
        operationBefore.set(op.operationId, structuredClone(remote))
        for (const change of op.changes) {
          expect(Object.keys(change).sort()).toEqual(['baseVersion', 'element', 'id'])
          remote.elements = [...remote.elements.filter((el: any) => el.id !== change.id), ...(change.element ? [change.element] : [])]
          remote.objectVersions[change.id] = (remote.objectVersions[change.id] ?? 0) + 1
        }
        remote.files = { ...remote.files, ...op.files }
        remote.revision++; accepted.push(op)
      }
      if (failAck) { failAck = false; throw new Error('network after durable write') }
    }
    if (route === 'undo') {
      const op = JSON.parse(init.body); undoRequests.push(op)
      if (undoGate) await undoGate
      if (!undone.has(op.operationId)) {
        const target = accepted.find(item => item.operationId === op.targetOperationId)
        const before = operationBefore.get(op.targetOperationId)
        for (const change of target.changes) {
          const original = before.elements.find((element: any) => element.id === change.id)
          remote.elements = [...remote.elements.filter((element: any) => element.id !== change.id), ...(original ? [original] : [])]
          remote.objectVersions[change.id]++
        }
        remote.revision++; undone.add(op.operationId)
      }
      if (failUndoAck) { failUndoAck = false; throw new Error('network after durable undo') }
    }
    return { ok: true, json: async () => structuredClone(route === 'presence' ? { peers: [] } : remote) }
  }))
})
afterEach(() => { clients.forEach(client => client.stop()); vi.unstubAllGlobals(); vi.restoreAllMocks() })
const access = { roomId: 'room', token: 'test-token', service: 'http://127.0.0.1:4318' }
async function open() {
  const client = await RoomSync.open(access, next => { state = next })
  clients.push(client)
  await client.tick(); client.stop()
  return client
}

it('does not publish a canvas callback which changes only selection', async () => {
  const client = await open()
  const last = state
  client.change([], {})
  expect(state).toBe(last)
})

it('persists the operation ID across a lost acknowledgement and reload', async () => {
  const first = await open()
  first.change([{ id: 'student', type: 'rectangle' }], {})
  failAck = true
  first.start(); await vi.waitFor(() => expect(state?.status).toBe('offline')); first.stop()
  expect(accepted).toHaveLength(1)
  const restored = await open()
  expect(state?.status).toBe('synced')
  expect(state?.elements).toHaveLength(1)
  expect(accepted).toHaveLength(1)
  expect(remote.objectVersions.student).toBe(1)
  restored.stop()
})

it('checks the grant before sending a recovered private draft', async () => {
  const first = await open()
  first.change([{ id: 'local', type: 'rectangle' }], {})
  deny = true
  const restored = await open()
  expect(state?.status).toBe('denied')
  expect(accepted).toHaveLength(0)
  expect(restored.exportDraft().elements).toHaveLength(1)
  expect(restored.canWrite).toBe(false)
})

it('a viewer cannot write even with a manipulated UI mode', async () => {
  remote.role = 'viewer'
  const client = await open()
  client.change([{ id: 'not-allowed', type: 'rectangle' }], {})
  expect(client.exportDraft().elements).toHaveLength(0)
  expect(accepted).toHaveLength(0)
})

it('retries a persisted undo with its original ID after a lost acknowledgement and reload', async () => {
  const first = await open()
  first.change([{ id: 'first', type: 'rectangle' }], {})
  first.start(); await vi.waitFor(() => expect(state?.status).toBe('synced')); first.stop()
  first.change([{ id: 'first', type: 'rectangle' }, { id: 'second', type: 'rectangle' }], {})
  first.start(); await vi.waitFor(() => expect(state?.status).toBe('synced')); first.stop()
  failUndoAck = true
  await expect(first.undo()).rejects.toThrow('network after durable undo')
  expect(first.canWrite).toBe(false)
  const restored = await open()
  expect(undoRequests).toHaveLength(2)
  expect(undoRequests[1].operationId).toBe(undoRequests[0].operationId)
  expect(remote.revision).toBe(3)
  expect(state?.elements.map(element => element.id)).toEqual(['first'])
  await restored.undo()
  expect(undoRequests.at(-1).targetOperationId).toBe(accepted[0].operationId)
  expect(remote.elements).toHaveLength(0)
  restored.stop()
})

it('keeps polling when its scheduled tick overlaps a slow undo', async () => {
  const client = await open()
  client.change([{ id: 'first', type: 'rectangle' }], {})
  client.start(); await vi.waitFor(() => expect(state?.status).toBe('synced'))
  let release: () => void = () => {}
  undoGate = new Promise(resolve => { release = resolve })
  const undo = client.undo()
  await vi.waitFor(() => expect(undoRequests).toHaveLength(1))
  await new Promise(resolve => setTimeout(resolve, 750))
  release(); await undo
  const calls = vi.mocked(fetch).mock.calls.length
  await vi.waitFor(() => expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(calls), { timeout: 1200 })
  client.stop()
})

it('reports a failed recovery write as storage failure and sends no operation', async () => {
  const client = await open()
  client.change([{ id: 'draft', type: 'rectangle' }], {})
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new DOMException('quota', 'QuotaExceededError') })
  client.start(); await vi.waitFor(() => expect(state?.status).toBe('conflict')); client.stop()
  expect(state?.message).toContain('Spazio locale')
  expect(client.canWrite).toBe(false)
  expect(accepted).toHaveLength(0)
  expect(client.exportDraft().elements).toHaveLength(1)
})

it('sends a files-only change and retains newer local edits at the original acknowledged version', async () => {
  const client = await open()
  const files = { picture: { id: 'picture', dataURL: 'data:image/png;base64,YQ==', mimeType: 'image/png' } }
  client.change([], files)
  client.start(); await vi.waitFor(() => expect(remote.files.picture).toEqual(files.picture)); client.stop()
  client.change([{ id: 'A', type: 'rectangle', x: 1 }], {})
  failAck = true
  client.start(); await vi.waitFor(() => expect(state?.status).toBe('offline')); client.stop()
  client.change([{ id: 'A', type: 'rectangle', x: 2 }], {})
  remote.elements = [{ id: 'A', type: 'rectangle', x: 9 }]; remote.objectVersions.A = 2; remote.revision++
  client.start()
  await vi.waitFor(() => expect(JSON.parse([...storage.values()][0]).inFlight).toBeNull())
  client.stop()
  const draft = JSON.parse([...storage.values()][0])
  expect(draft.dirty[0].baseVersion).toBe(1)
  expect(draft.dirty[0].element.x).toBe(2)
})

async function pdfFixture() {
  const bytes=Uint8Array.from(readFileSync('../../plugins/elab-tutor/ELAB-Collaborator-Deck.pdf'))
  const blob=new Blob([bytes],{type:'application/pdf'})
  const document:SharedPdfDocument={schema:'shared-pdf.v1',sha256:await pdfSha256(blob),name:'deck.pdf',bytes:bytes.length,totalPages:7,publishedBy:'grant',publishedAt:1,withdrawnAt:null}
  return {bytes,blob,document}
}

it('announces a shared PDF revision without downloading or uploading the original',async()=>{
  const client=await open(),{document}=await pdfFixture()
  const base=vi.mocked(fetch).getMockImplementation()!
  vi.mocked(fetch).mockImplementation(async(url:any,init:any)=>new URL(String(url)).pathname.endsWith('/pdf')
    ? new Response(JSON.stringify({revision:1,documents:[document]})) : base(url,init))
  remote.pdfRevision=1
  client.start()
  await vi.waitFor(()=>expect(state?.snapshot?.pdfDocuments).toEqual([document]))
  client.stop()
  expect(vi.mocked(fetch).mock.calls.some(([url])=>String(url).endsWith('/pdf/'+document.sha256))).toBe(false)
})

it('publishes only with explicit document consent and checks the receipt against the original bytes',async()=>{
  const client=await open(),{document,blob}=await pdfFixture()
  const base=vi.mocked(fetch).getMockImplementation()!,posts:any[]=[]
  vi.mocked(fetch).mockImplementation(async(url:any,init:any)=>{
    if(String(url).endsWith('/pdf/'+document.sha256)) {posts.push(JSON.parse(init.body));return new Response(JSON.stringify({document,revision:1}))}
    if(String(url).endsWith('/pdf')) return new Response(JSON.stringify({revision:1,documents:[document]}))
    return base(url,init)
  })
  await expect(client.publishPdf(document,blob,undefined as never)).rejects.toThrow('Conferma')
  expect(posts).toHaveLength(0)
  await client.publishPdf(document,blob,'share-complete-document')
  expect(posts).toHaveLength(1)
  expect(posts[0].consent).toBe('share-complete-document')
  expect(Buffer.from(posts[0].base64,'base64')).toEqual(Buffer.from(await blob.arrayBuffer()))
  expect(state?.snapshot?.pdfDocuments).toEqual([document])
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({document:{...document,sha256:'0'.repeat(64)},revision:1})))
  await expect(client.publishPdf(document,blob,'share-complete-document')).rejects.toThrow('ricevuta')
})

it('a viewer downloads verified bytes on request, rejects truncation/tamper, and cannot publish',async()=>{
  remote.role='viewer'
  const client=await open(),{document,bytes,blob}=await pdfFixture()
  vi.mocked(fetch).mockResolvedValue(new Response(bytes,{headers:{'Content-Type':'application/pdf','Content-Length':String(bytes.length)}}))
  expect(await (await client.downloadPdf(document)).arrayBuffer()).toEqual(await blob.arrayBuffer())
  expect(vi.mocked(fetch).mock.calls.at(-1)![1]?.headers).toEqual({Authorization:'Bearer test-token'})
  const calls=vi.mocked(fetch).mock.calls.length
  await expect(client.publishPdf(document,blob,'share-complete-document')).rejects.toThrow('scrittura attivo')
  expect(vi.mocked(fetch).mock.calls).toHaveLength(calls)
  vi.mocked(fetch).mockResolvedValue(new Response(bytes.slice(0,-1),{headers:{'Content-Type':'application/pdf'}}))
  await expect(client.downloadPdf(document)).rejects.toThrow('incompleto')
  const altered=Uint8Array.from(bytes);altered[altered.length-1]^=1
  vi.mocked(fetch).mockResolvedValue(new Response(altered,{headers:{'Content-Type':'application/pdf'}}))
  await expect(client.downloadPdf(document)).rejects.toThrow('SHA-256')
})

it('bounds download streams and revocation never returns source bytes or preserves active access',async()=>{
  const client=await open(),{document,bytes}=await pdfFixture()
  let cancelled=false
  const stream=new ReadableStream({start(controller){controller.enqueue(new Uint8Array(document.bytes+1))},cancel(){cancelled=true}})
  vi.mocked(fetch).mockResolvedValue(new Response(stream,{headers:{'Content-Type':'application/pdf'}}))
  await expect(client.downloadPdf(document)).rejects.toThrow('limite dichiarato')
  expect(cancelled).toBe(true)
  vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({error:'unauthorized'}),{status:401,headers:{'Content-Type':'application/json'}}))
  await expect(client.downloadPdf(document)).rejects.toThrow('unauthorized')
  expect(state?.status).toBe('denied')
  expect(state?.snapshot).toBeNull()
  expect(client.canWrite).toBe(false)
  vi.mocked(fetch).mockResolvedValue(new Response(bytes,{headers:{'Content-Type':'application/pdf'}}))
  const calls=vi.mocked(fetch).mock.calls.length
  await expect(client.downloadPdf(document)).rejects.toThrow('non disponibile')
  expect(vi.mocked(fetch).mock.calls).toHaveLength(calls)
})

it('rejects malformed PDF metadata before an authenticated snapshot reaches the UI',async()=>{
  remote.pdfRevision=1
  remote.pdfDocuments=[{schema:'shared-pdf.v1',sha256:'0'.repeat(64),bytes:-1}]
  const client=await open()
  expect(state?.snapshot).toBeNull()
  expect(client.canWrite).toBe(false)
})
