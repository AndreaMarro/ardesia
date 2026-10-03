import { blobToBase64 } from '../store/codec'
import { PDF_ASSET_LIMITS, validatePdfAsset } from '../store/pdfAssets'

export type SharedPdfDocument = {
  schema: 'shared-pdf.v1'; sha256: string; name: string; bytes: number; totalPages: number;
  publishedBy: string; publishedAt: number; withdrawnAt: null;
}
function pdfListing(value: unknown): { revision: number; documents: SharedPdfDocument[] } {
  const data = value as { revision?: unknown; documents?: unknown } | null
  if (!data || !Number.isSafeInteger(data.revision) || (data.revision as number) < 0 || !Array.isArray(data.documents) || data.documents.length > PDF_ASSET_LIMITS.count) throw new Error('Inventario PDF condivisi non valido.')
  const ids = new Set<string>()
  let total = 0
  const documents = data.documents.map((document: Partial<SharedPdfDocument>): SharedPdfDocument => {
    if (!document || document.schema !== 'shared-pdf.v1' || typeof document.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(document.sha256) || ids.has(document.sha256) ||
      typeof document.name !== 'string' || !document.name.trim() || document.name.length > 255 || /[\u0000-\u001f\u007f/\\]/.test(document.name) ||
      !Number.isSafeInteger(document.bytes) || document.bytes! < 1 || document.bytes! > PDF_ASSET_LIMITS.perFile ||
      !Number.isSafeInteger(document.totalPages) || document.totalPages! < 1 || document.totalPages! > 10000 ||
      typeof document.publishedBy !== 'string' || !document.publishedBy || !Number.isSafeInteger(document.publishedAt) || document.publishedAt! < 0 || document.withdrawnAt !== null) throw new Error('Inventario PDF condivisi non valido.')
    ids.add(document.sha256); total += document.bytes!
    return {...document} as SharedPdfDocument
  })
  if (total > PDF_ASSET_LIMITS.total) throw new Error('Inventario PDF oltre il limite di 100 MiB.')
  return {revision: data.revision as number, documents}
}
/** Transport for the shared canvas. Personal notes never enter this module. */
export type Element = { id: string; [key: string]: unknown }
export type Files = Record<string, { id: string; dataURL: string; mimeType: string; [key: string]: unknown }>
export type Access = { roomId: string; token: string; service: string }
export type Snapshot = {
  roomId: string; title: string; role: 'owner' | 'editor' | 'viewer'; grantId: string;
  revision: number; elements: Element[]; objectVersions: Record<string, number>; files: Files;
  pdfRevision?: number; pdfDocuments?: SharedPdfDocument[];
}
type Change = { id: string; baseVersion: number; element: Element | null; serial: number }
type Operation = { operationId: string; clientId: string; changes: Change[]; files: Files }
type UndoOperation = { operationId: string; clientId: string; targetOperationId: string }
class RecoveryWriteError extends Error {}
export type Peer = { clientId: string; name?: string; cursor: { x: number; y: number } | null }
export type SyncState = {
  status: 'connecting' | 'synced' | 'pending' | 'offline' | 'conflict' | 'denied';
  message: string; canWrite: boolean; snapshot: Snapshot | null; elements: Element[]; files: Files; peers: Peer[];
}
const copy = <T,>(value: T): T => structuredClone(value)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function serviceOrigin(value = 'http://127.0.0.1:4318'): string {
  const url = new URL(value)
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
      !(loopback && url.protocol === 'http:' || url.origin === location.origin && url.protocol === 'https:')) {
    throw new Error('Il servizio deve essere locale o sullo stesso sito HTTPS.')
  }
  return url.origin
}
export function readSharedAccess(hash = location.hash): Access | null {
  const [roomId, ...parts] = hash.replace(/^#/, '').split('&')
  const params = new URLSearchParams(parts.join('&'))
  const token = params.get('access')
  if (!token) return null
  return { roomId, token, service: serviceOrigin(params.get('sync') ?? undefined) }
}
export function sharedLink(access: Access): string {
  const url = new URL(location.href)
  url.search = '?vista=studente'
  url.hash = `${access.roomId}&${new URLSearchParams({ sync: access.service, access: access.token })}`
  return url.href
}
export class RoomSync {
  readonly access: Access
  readonly clientId: string
  private key: string
  private listener: (state: SyncState) => void
  private snapshot: Snapshot | null = null
  private persistedRevision: number | null = null
  private dirty = new Map<string, Change>()
  private files: Files = {}
  private inFlight: Operation | null = null
  private pendingUndo: UndoOperation | null = null
  private history: string[] = []
  private serial = 0
  private busy = false
  private stopped = false
  private blocked = false
  private authenticated = false
  private peers: Peer[] = []
  private cursor: Peer['cursor'] = null
  private name = 'Partecipante'
  private lastPresence = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private state: SyncState['status'] = 'connecting'
  private message = 'Connessione alla lezione…'

  private constructor(access: Access, key: string, listener: (state: SyncState) => void) {
    this.access = access; this.key = key; this.listener = listener
    const saved = localStorage.getItem(key)
    const draft = saved ? JSON.parse(saved) : null
    this.clientId = draft?.clientId ?? crypto.randomUUID()
    if (draft) {
      this.snapshot = draft.snapshot; this.files = draft.files ?? {}
      this.inFlight = draft.inFlight; this.history = draft.history ?? []
      this.pendingUndo = draft.pendingUndo ?? null
      this.dirty = new Map(draft.dirty.map((item: Change) => [item.id, item]))
      this.serial = Math.max(0, ...[...this.dirty.values()].map(item => item.serial))
    }
  }
  static async open(access: Access, listener: (state: SyncState) => void): Promise<RoomSync> {
    serviceOrigin(access.service)
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(access.token))
    const fingerprint = [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('')
    return new RoomSync(access, `ardesia:shared:v1:${access.roomId}:${fingerprint}`, listener)
  }
  static async create(title: string): Promise<Access> {
    const service = serviceOrigin()
    const response = await fetch(`${service}/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, clientId: crypto.randomUUID() }),
    })
    if (!response.ok) throw new Error('Impossibile aprire la lezione condivisa. Avvia il servizio locale.')
    const result = await response.json()
    return { roomId: result.roomId, token: result.token, service }
  }
  async request(path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<any> {
    const response = await fetch(`${this.access.service}/rooms/${encodeURIComponent(this.access.roomId)}${path}`, {
      method, headers: { Authorization: `Bearer ${this.access.token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(8000),
    })
    const result = await response.json()
    if (!response.ok) throw Object.assign(new Error(result.error ?? `HTTP ${response.status}`), { status: response.status, result })
    if (['/snapshot', '/operations', '/undo'].includes(path)) {
      const listing = pdfListing({revision:result.pdfRevision ?? 0,documents:result.pdfDocuments ?? []})
      return {...result,pdfRevision:listing.revision,pdfDocuments:listing.documents}
    }
    return result
  }
  private async pdfOperation<T>(operation: () => Promise<T>): Promise<T> {
    try { return await operation() }
    catch (error) {
      if ([401, 403].includes((error as {status?:number}).status ?? 0)) this.reportFailure(error)
      throw error
    }
  }
  async refreshPdfs() {
    return this.pdfOperation(async () => {
      const listing = pdfListing(await this.request('/pdf'))
      if (this.snapshot && this.authenticated) {
        this.snapshot = {...this.snapshot, pdfRevision:listing.revision, pdfDocuments:listing.documents}
        this.publish()
      }
      return listing.documents
    })
  }
  async publishPdf(document: {sha256:string;name:string;totalPages:number}, blob: Blob, consent: 'share-complete-document') {
    if (!this.canWrite || consent !== 'share-complete-document') throw new Error('Conferma la condivisione dell’intero PDF con un accesso di scrittura attivo.')
    const asset = await validatePdfAsset(blob, document.sha256)
    return this.pdfOperation(async () => {
      const result = await this.request(`/pdf/${asset.documentId}`, {consent,name:document.name,totalPages:document.totalPages,base64:await blobToBase64(asset.blob)})
      const receipt = pdfListing({revision:result.revision,documents:[result.document]}).documents[0]!
      if (receipt.sha256 !== asset.documentId || receipt.bytes !== asset.bytes || receipt.totalPages !== document.totalPages) throw new Error('La ricevuta non corrisponde al PDF condiviso.')
      if (!(await this.refreshPdfs()).some(item => item.sha256 === asset.documentId)) throw new Error('Il PDF non risulta più condiviso nella stanza.')
    })
  }
  async withdrawPdf(sha256: string) {
    if (!this.authenticated || !this.snapshot || !/^[0-9a-f]{64}$/.test(sha256)) throw new Error('Accesso PDF non disponibile.')
    return this.pdfOperation(async () => {
      await this.request(`/pdf/${sha256}`, undefined, 'DELETE')
      if ((await this.refreshPdfs()).some(item => item.sha256 === sha256)) throw new Error('Il PDF risulta ancora condiviso nella stanza.')
    })
  }
  async downloadPdf(expected: SharedPdfDocument): Promise<Blob> {
    const document = pdfListing({revision:0,documents:[expected]}).documents[0]!
    if (!this.authenticated || this.blocked) throw new Error('Accesso alla lezione non disponibile.')
    return this.pdfOperation(async () => {
      const response = await fetch(`${this.access.service}/rooms/${encodeURIComponent(this.access.roomId)}/pdf/${document.sha256}`, {
        headers:{Authorization:`Bearer ${this.access.token}`}, signal:AbortSignal.timeout(30000), redirect:'error', cache:'no-store',
      })
      if (!response.ok) {
        const result = await response.json()
        throw Object.assign(new Error(result.error ?? `HTTP ${response.status}`), {status:response.status})
      }
      const declared = response.headers.get('content-length')
      if (response.headers.get('content-type')?.split(';')[0] !== 'application/pdf' || declared !== null && Number(declared) !== document.bytes) {
        await response.body?.cancel().catch(()=>{})
        throw new Error('Dimensione o formato del PDF condiviso discordante.')
      }
      if (!response.body) throw new Error('Il PDF condiviso non contiene byte.')
      const reader = response.body.getReader(), chunks: Uint8Array<ArrayBuffer>[] = []
      let total = 0
      try {
        while (true) {
          const {done,value} = await reader.read()
          if (done) break
          total += value.length
          if (total > document.bytes || total > PDF_ASSET_LIMITS.perFile) throw new Error('PDF condiviso oltre il limite dichiarato.')
          chunks.push(Uint8Array.from(value))
        }
      } catch (error) { await reader.cancel().catch(()=>{}); throw error }
      finally { reader.releaseLock() }
      if (total !== document.bytes) throw new Error('Il PDF condiviso è incompleto.')
      return (await validatePdfAsset(new Blob(chunks), document.sha256)).blob
    })
  }
  private persist() {
    // Fail visibly before transmitting if the local recovery copy cannot be kept.
    try {
      localStorage.setItem(this.key, JSON.stringify({ clientId: this.clientId, snapshot: this.snapshot,
        dirty: [...this.dirty.values()], files: this.files, inFlight: this.inFlight, pendingUndo: this.pendingUndo, history: this.history }))
      this.persistedRevision = this.snapshot?.revision ?? null
    } catch { throw new RecoveryWriteError('Spazio locale esaurito: esporta il lavoro prima di continuare.') }
  }
  private publish(status = this.state, message = this.message) {
    this.state = status; this.message = message
    const elements = new Map((this.snapshot?.elements ?? []).map(el => [el.id, el]))
    for (const item of this.dirty.values()) {
      if (item.element) elements.set(item.id, item.element); else elements.delete(item.id)
    }
    this.listener({ status, message, canWrite: this.canWrite, snapshot: this.authenticated ? this.snapshot : null,
      elements: this.authenticated ? [...elements.values()] : [],
      files: this.authenticated ? { ...this.snapshot?.files, ...this.files } : {}, peers: this.authenticated ? this.peers : [] })
  }
  get canWrite() { return this.authenticated && !this.blocked && !this.pendingUndo && this.snapshot?.role !== 'viewer' }
  private get hasPendingEdits() { return this.dirty.size > 0 || Object.keys(this.files).length > 0 }
  change(elements: readonly Element[], files: Files) {
    if (!this.canWrite || !this.snapshot) return
    const base = new Map(this.snapshot.elements.map(el => [el.id, el]))
    const visible = new Map(base)
    for (const item of this.dirty.values()) {
      if (item.element) visible.set(item.id, item.element); else visible.delete(item.id)
    }
    const next = new Map(elements.map(el => [el.id, el]))
    let changed = false
    for (const id of new Set([...visible.keys(), ...next.keys()])) {
      if (same(visible.get(id), next.get(id))) continue
      changed = true
      const previous = this.dirty.get(id)
      this.dirty.set(id, { id, baseVersion: previous?.baseVersion ?? this.snapshot.objectVersions[id] ?? 0,
        element: copy(next.get(id) ?? null), serial: ++this.serial })
    }
    for (const [id, file] of Object.entries(files)) if (!this.snapshot.files[id] && !same(this.files[id], file)) { this.files[id] = copy(file); changed = true }
    if (!changed) return
    try { this.persist(); this.publish(this.hasPendingEdits ? 'pending' : 'synced', this.hasPendingEdits ? 'Modifiche in attesa di invio' : 'Lavagna sincronizzata') }
    catch (error) { this.reportFailure(error) }
  }
  presence(cursor: Peer['cursor'], name?: string) { this.cursor = cursor; if (name) this.name = name.slice(0, 60) }
  start() { this.stopped = false; void this.tick() }
  stop() { this.stopped = true; if (this.timer) clearTimeout(this.timer); this.timer = null }
  private schedule() {
    if (this.timer) clearTimeout(this.timer)
    if (!this.stopped && this.state !== 'denied') this.timer = setTimeout(() => void this.tick(), 650)
  }
  private reportFailure(error: unknown) {
    const failure = error as { status?: number; result?: { snapshot?: Snapshot } }
    if (error instanceof RecoveryWriteError) {
      this.blocked = true; this.publish('conflict', error.message)
    } else if (failure.status === 401 || failure.status === 403) {
      this.blocked = true; this.authenticated = false
      this.publish('denied', 'Accesso revocato o non valido. La copia locale resta esportabile.')
    } else if (failure.status === 409) {
      this.blocked = true
      if (failure.result?.snapshot) this.snapshot = failure.result.snapshot
      this.publish('conflict', 'Lo stesso oggetto è cambiato altrove. Esporta la tua proposta o scegli la versione condivisa.')
    } else if (failure.status && failure.status >= 400 && failure.status < 500) {
      this.blocked = true
      this.publish('conflict', 'Il servizio non ha accettato queste modifiche. La proposta locale resta esportabile.')
    } else this.publish('offline', 'Connessione assente. Modifiche conservate su questo dispositivo.')
  }
  async tick() {
    if (this.stopped) return
    if (this.busy) { this.schedule(); return }
    this.busy = true
    try {
      if (!this.authenticated) {
        this.snapshot = await this.request('/snapshot'); this.authenticated = true
      }
      if (!this.blocked && this.snapshot?.role !== 'viewer' && this.pendingUndo) await this.sendPendingUndo()
      if (!this.blocked && this.snapshot?.role !== 'viewer' && (this.inFlight || this.hasPendingEdits)) {
        this.inFlight ??= { operationId: crypto.randomUUID(), clientId: this.clientId,
          changes: copy([...this.dirty.values()]), files: copy(this.files) }
        this.persist()
        const sent = this.inFlight
        const accepted = await this.request('/operations', { ...sent, changes: sent.changes.map(({ id, baseVersion, element }) => ({ id, baseVersion, element })) })
        if (!this.history.includes(sent.operationId)) this.history.push(sent.operationId)
        for (const change of sent.changes) {
          const current = this.dirty.get(change.id)
          if (current?.serial === change.serial) this.dirty.delete(change.id)
          // A retry can return a snapshot containing another participant's edit.
          // Rebase only on the version applied by this operation itself.
          else if (current) current.baseVersion = accepted.operationVersions?.[change.id] ?? change.baseVersion + 1
        }
        this.inFlight = null
        this.snapshot = { ...this.snapshot!, ...accepted }
        for (const id of Object.keys(sent.files)) if (same(this.files[id], sent.files[id])) delete this.files[id]
        this.persist()
      }
      const update = await this.request(`/events?since=${this.snapshot!.revision}`)
      if (this.stopped) return
      if (update.resetRequired || update.revision !== this.snapshot!.revision) {
        this.snapshot = await this.request('/snapshot')
      } else if ((update.pdfRevision ?? 0) !== (this.snapshot!.pdfRevision ?? 0)) {
        await this.refreshPdfs()
      }
      if (Date.now() - this.lastPresence > 1500) {
        await this.request('/presence', { clientId: this.clientId, name: this.name, cursor: this.cursor })
        this.peers = (await this.request('/presence')).peers.filter((p: Peer) => p.clientId !== this.clientId)
        this.lastPresence = Date.now()
      }
      if (this.persistedRevision !== this.snapshot!.revision) this.persist()
      if (!this.blocked) this.publish(this.hasPendingEdits ? 'pending' : 'synced', this.hasPendingEdits ? 'Modifiche in attesa di invio' : 'Lavagna sincronizzata')
    } catch (error) {
      if (this.stopped) return
      this.reportFailure(error)
    } finally {
      this.busy = false
      this.schedule()
    }
  }
  async acceptShared() {
    const snapshot = await this.request('/snapshot')
    if (this.pendingUndo) this.history = this.history.filter(id => id !== this.pendingUndo!.targetOperationId)
    this.pendingUndo = null
    this.snapshot = snapshot; this.dirty.clear(); this.inFlight = null; this.files = {}; this.blocked = false
    try { this.persist(); this.publish('synced', 'Versione condivisa ripristinata') }
    catch (error) { this.reportFailure(error); throw error }
  }
  private async sendPendingUndo() {
    const pending = this.pendingUndo
    if (!pending) return
    this.persist()
    const accepted: Snapshot = await this.request('/undo', pending)
    this.history = this.history.filter(id => id !== pending.targetOperationId)
    this.snapshot = accepted; this.pendingUndo = null
    this.persist()
  }
  async undo() {
    if (!this.authenticated || this.blocked || this.snapshot?.role === 'viewer' || this.hasPendingEdits || this.inFlight || this.busy) throw new Error('Attendi il salvataggio prima di annullare.')
    const targetOperationId = this.pendingUndo?.targetOperationId ?? this.history.at(-1)
    if (!targetOperationId) return
    this.busy = true
    try {
      this.pendingUndo ??= { operationId: crypto.randomUUID(), clientId: this.clientId, targetOperationId }
      this.persist(); this.publish('pending', 'Annullamento in attesa di conferma')
      await this.sendPendingUndo()
      this.publish('synced', 'Il tuo ultimo intervento è stato annullato')
    } catch (error) { this.reportFailure(error); throw error }
    finally { this.busy = false; this.schedule() }
  }
  exportDraft() {
    const elements = new Map((this.snapshot?.elements ?? []).map(el => [el.id, el]))
    for (const item of this.dirty.values()) if (item.element) elements.set(item.id, item.element); else elements.delete(item.id)
    return { type: 'excalidraw', version: 2, source: 'Ardesia', elements: [...elements.values()],
      files: { ...this.snapshot?.files, ...this.files }, appState: {}, ardesia: { roomId: this.access.roomId, revision: this.snapshot?.revision, status: this.state } }
  }
}
