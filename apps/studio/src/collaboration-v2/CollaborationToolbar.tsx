import { useEffect, useRef, useState } from 'react'
import type { InkSession, InkTransport } from './session'
import './collaboration.css'

export type CollaborationToolbarProps = {
  session: InkSession
  page: number
  pageCount: number
  onPage: (page: number) => void
  audience: 'personal' | 'shared'
  onAudience: (audience: 'personal' | 'shared') => void
  zoom: number
  onZoom: (zoom: number) => void
  onSave: () => Promise<void>
  storageMode: 'fsa' | 'localStorage' | 'unavailable'
  transport?: InkTransport
  following?: boolean
  onFollow?: (value: boolean) => void
}
const messages = {
  local: 'Pronto per scrivere', offline: 'Tratti in attesa di conferma', syncing: 'Conferma in corso…',
  committed: 'Tratti confermati', revoked: 'Accesso revocato. Riapri la lezione.', error: 'Connessione non riuscita. I tratti restano in attesa.',
}
/** Small consumer for the existing Excalidraw surface; no login, canvas or microphone of its own. */
export function CollaborationToolbar(props: CollaborationToolbarProps) {
  const { session } = props
  const [, refresh] = useState(0)
  const currentSession = useRef(session)
  currentSession.current = session
  const [saving, setSaving] = useState(false), [saveError, setSaveError] = useState(''), [saved, setSaved] = useState(false)
  useEffect(() => { setSaved(false); return session.subscribe(() => { setSaved(false); refresh(value => value + 1) }) }, [session])
  const state = session.state(), revoked = state.status === 'revoked'
  async function save() {
    if (saving || revoked) return
    setSaving(true); setSaveError(''); setSaved(false)
    const checkpoint = JSON.stringify(session.checkpoint())
    try { await props.onSave(); if (currentSession.current === session) {
      if (JSON.stringify(session.checkpoint()) === checkpoint) setSaved(true)
      else setSaveError('Copia precedente salvata. Salva anche i nuovi tratti.')
    } }
    catch { setSaveError('Salvataggio non riuscito. Mantieni aperta la lezione e riprova.') }
    finally { setSaving(false) }
  }
  return <section className="ink-collaboration" aria-label="Scrittura e layer della lezione">
    <div className="ink-heading"><div><span className="ink-eyebrow">SPAZI DI SCRITTURA</span>
      <h2>Un foglio, i tuoi passaggi.</h2></div><span className="ink-page-count">{props.page} / {props.pageCount}</span></div>
    <div className="ink-controls">
      <fieldset disabled={revoked}><legend>Scrivi nello spazio</legend>
        <div className="ink-segment"><button type="button" aria-pressed={props.audience === 'personal'} onClick={() => props.onAudience('personal')}>Personale</button>
          <button type="button" aria-pressed={props.audience === 'shared'} onClick={() => props.onAudience('shared')}>Condiviso</button></div>
      </fieldset>
      <div className="ink-undo" role="group" aria-label="Cronologia dei miei tratti">
        <button type="button" disabled={!state.canUndo || revoked} onClick={() => session.undo()}>Annulla mio tratto</button>
        <button type="button" disabled={!state.canRedo || revoked} onClick={() => session.redo()}>Ripristina</button>
      </div>
      <label>Pagina<select aria-label="Pagina del documento" value={props.page} disabled={revoked}
        onChange={event => props.onPage(Number(event.target.value))}>
        {Array.from({ length: props.pageCount }, (_, i) => <option key={i} value={i + 1}>Pagina {i + 1}</option>)}
      </select></label>
      <label>Il tuo zoom<select aria-label="Il tuo zoom" value={props.zoom} disabled={revoked}
        onChange={event => props.onZoom(Number(event.target.value))}>
        {[...new Set([props.zoom, .5, .75, 1, 1.25, 1.5, 2])].sort((a, b) => a - b).map(value => <option key={value} value={value}>{Math.round(value * 100)}%</option>)}
      </select></label>
      {props.onFollow && <label className="ink-follow"><input type="checkbox" checked={!!props.following} disabled={revoked}
        onChange={event => props.onFollow?.(event.target.checked)} />Segui presentazione docente</label>}
      <button className="ink-save" type="button" onClick={() => void save()} disabled={saving || revoked || props.storageMode === 'unavailable'}>
        {saving ? 'Salvataggio…' : 'Salva su questo dispositivo'}</button>
      {props.transport && <button type="button" disabled={revoked || !state.pending || state.status === 'syncing'}
        onClick={() => void session.flush(props.transport!)}>Riprova connessione</button>}
    </div>
    <div className="ink-status" role="status" aria-live="polite"><span className={`ink-dot ink-dot-${state.status}`} aria-hidden="true" />
      {state.frozen && !revoked ? 'Layer in sola lettura' : messages[state.status]}{!props.transport && !revoked ? ' · Collegamento remoto non attivo' : ''}
      {saved && !saveError && <span> · {props.storageMode === 'fsa' ? 'Salvato nella cartella collegata' : 'Copia salvata nella cache del browser'}</span>}
    </div>
    <p className="ink-hint">{props.audience === 'personal' ? 'Lo spazio personale resta separato da quello condiviso.' : 'Ogni autore conserva il proprio layer. Le sovrapposizioni rimangono visibili.'}
      {' '}Annullare rimuove solo i tuoi tratti. Lo zoom cambia solo la tua vista.</p>
    {saveError && <p className="ink-error" role="alert">{saveError}</p>}
  </section>
}
