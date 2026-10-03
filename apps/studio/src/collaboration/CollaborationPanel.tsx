import { useEffect, useRef, useState } from 'react'
import { readSharedAccess, RoomSync, sharedLink, type SyncState, type Element, type Files } from './roomSync'

export function downloadJson(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function CollaborationPanel({ room, title, student, getScene, onState, prepareSharedLesson, onOpenPdfs, hasPdfPages }: {
  room: string; title: string; student: boolean;
  getScene: () => { elements: Element[]; files: Files };
  onState: (state: SyncState, client: RoomSync) => void;
  prepareSharedLesson?: (newRoomId:string) => Promise<void>;
  hasPdfPages?: boolean; onOpenPdfs?: () => void;
}) {
  const [state, setState] = useState<SyncState | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [invite, setInvite] = useState('')
  const [grants, setGrants] = useState<{ grantId: string; role: string; revokedAt?: number | null }[]>([])
  const [name, setName] = useState('Partecipante')
  const [notes, setNotes] = useState(() => localStorage.getItem(`ardesia:personal:${room}`) ?? '')
  const client = useRef<RoomSync | null>(null)
  const callback = useRef(onState); callback.current = onState
  const isShared = location.hash.includes('&access=')
  useEffect(() => {
    let disposed = false
    try {
      const access = readSharedAccess()
      if (access) void RoomSync.open(access, next => {
        if (!disposed && client.current) { setState(next); callback.current(next, client.current) }
      }).then(connection => {
        if (disposed) return
        client.current = connection; connection.start()
      }).catch(e => setError(String(e)))
    } catch (e) { setError(String(e)) }
    return () => { disposed = true; client.current?.stop() }
  }, [])
  async function run(operation: () => Promise<void>) {
    setError('')
    try { await operation() } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  async function create() {
    const access = await RoomSync.create(title)
    const connection = await RoomSync.open(access, () => {})
    const { elements, files } = getScene()
    await prepareSharedLesson?.(access.roomId)
    if (elements.length) await connection.request('/operations', { operationId: crypto.randomUUID(), clientId: connection.clientId,
      changes: elements.map(element => ({ id: element.id, baseVersion: 0, element })), files })
    const url = new URL(sharedLink(access)); url.search = '?shared=1'
    location.assign(url.href)
  }
  async function refreshGrants() { setGrants((await client.current!.request('/grants')).grants) }
  async function inviteWithRole(role: 'editor' | 'viewer') {
    const grant = await client.current!.request('/grants', { role })
    setInvite(sharedLink({ ...client.current!.access, token: grant.token }))
    await refreshGrants()
  }
  const buttonStyle = { border: '1px solid #d8d5cf', background: '#fff', borderRadius: 6, padding: '6px 10px', color: '#29372f', cursor: 'pointer' }
  return <section aria-label="Lezione condivisa" style={{ background: '#f7f6f2', borderBottom: '1px solid #ddd9d0', padding: '7px 16px', fontSize: 13, color: '#29372f' }}>
    {isShared && <style>{'.undo-redo-buttons { display:none !important }'}</style>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <strong>{isShared ? 'Spazio comune' : 'Lavagna personale'}</strong>
      {isShared && <span role="status" data-testid="sync-status">{state?.message ?? 'Connessione alla lezione…'}</span>}
      {state?.snapshot && <span>{state.snapshot.role === 'viewer' ? 'Puoi osservare' : 'Puoi scrivere'} · revisione {state.snapshot.revision}</span>}
      {state && <span>{state.peers.length + 1} presenti</span>}
      <button style={buttonStyle} onClick={() => setOpen(!open)} aria-expanded={open}>Condivisione e appunti</button>
      {!isShared && !student && <button style={buttonStyle} onClick={() => void run(create)}>Avvia lezione condivisa</button>}
      {isShared && hasPdfPages && <button style={buttonStyle} onClick={onOpenPdfs}>PDF originali</button>}
      {isShared && <button style={buttonStyle} disabled={!client.current?.canWrite} onClick={() => void run(() => client.current!.undo())}>Annulla il mio intervento</button>}
      {isShared && <button style={buttonStyle} onClick={() => client.current && downloadJson(client.current.exportDraft(), `${room}.excalidraw`)}>Esporta lavagna</button>}
      {state?.status === 'conflict' && <button style={buttonStyle} onClick={() => void run(async () => {
        downloadJson(client.current!.exportDraft(), `${room}-proposta-locale.excalidraw`)
        await client.current!.acceptShared()
      })}>Conserva proposta e riprendi la condivisa</button>}
    </div>
    {error && <p role="alert">{error}</p>}
    {open && <div style={{ paddingTop: 10, display: 'grid', gap: 10, maxWidth: 920 }}>
      {isShared && <label>Nome visibile <input aria-label="Nome visibile" value={name} maxLength={60} onChange={event => {
        setName(event.target.value); client.current?.presence(null, event.target.value)
      }} /></label>}
      {state?.snapshot?.role === 'owner' && <div>
        <button style={buttonStyle} onClick={() => void run(() => inviteWithRole('editor'))}>Invita a scrivere</button>{' '}
        <button style={buttonStyle} onClick={() => void run(() => inviteWithRole('viewer'))}>Invita a osservare</button>{' '}
        <button style={buttonStyle} onClick={() => void run(refreshGrants)}>Gestisci accessi</button>
        {invite && <label style={{ display: 'block', marginTop: 8 }}>Link di invito personale
          <input aria-label="Link di invito" readOnly value={invite} onFocus={e => e.target.select()} style={{ width: '100%' }} />
        </label>}
        {invite && <small>Chi possiede questo link può entrare con il permesso scelto. Puoi revocarlo qui.</small>}
        {grants.filter(grant => grant.role !== 'owner' && !grant.revokedAt).map((grant, i) => <div key={grant.grantId}>
          Accesso {i + 1} · {grant.role === 'editor' ? 'scrittura' : 'lettura'}{' '}
          <button style={buttonStyle} onClick={() => void run(async () => {
            await client.current!.request(`/grants/${grant.grantId}`, undefined, 'DELETE'); await refreshGrants()
          })}>Revoca accesso {i + 1}</button>
        </div>)}
      </div>}
      <label>Appunti personali · solo su questo dispositivo
        <textarea aria-label="Appunti personali" value={notes} rows={3} style={{ width: '100%', display: 'block', marginTop: 5 }} onChange={event => {
          setNotes(event.target.value)
          try { localStorage.setItem(`ardesia:personal:${room}`, event.target.value) }
          catch { setError('Appunti non salvati: spazio locale insufficiente. Esportali prima di chiudere.') }
        }} />
      </label>
      <div><button style={buttonStyle} onClick={() => downloadJson({ v: 1, room, notes, visibility: 'private' }, `${room}-appunti.json`)}>Esporta i miei appunti</button></div>
      {!isShared && <small>La condivisione apre una copia della lavagna corrente. La condivisione richiede il servizio della lezione attivo.</small>}
    </div>}
  </section>
}
