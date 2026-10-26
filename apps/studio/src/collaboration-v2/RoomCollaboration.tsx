import { useEffect, useRef, useState } from 'react'
import { CaptureUpdateAction, restoreElements } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { CollaborationToolbar } from './CollaborationToolbar'
import { captureInkStroke, projectInk } from './canvasBinding'
import type { PageGeometry } from './canvasBinding'
import type { InkSession, InkTransport } from './session'
import type { InkLayer } from './layer'
import { CompletedInkCapture, isInkProjection } from './sceneBoundary'
import { writeInkCheckpoint } from './persistence'
import type { WorkspaceStore } from '../store/WorkspaceStore'

/** Host supplies sessions and exact PDF page geometry after resolving its Core session.
 * No query-string actor/role/provider is accepted or constructed by Room.
 */
export type RoomInkAdapter = {
  roomId: string
  sessions: { personal: InkSession; shared: InkSession }
  pages: readonly PageGeometry[]
  peers?: readonly InkLayer[]
  signal: AbortSignal
  transport?: InkTransport
}
function signature(element: Pick<ExcalidrawElement, 'id' | 'type' | 'x' | 'y' | 'width' | 'height' | 'angle' | 'strokeColor' | 'strokeWidth' | 'locked' | 'customData'>): string {
  const extra = element as unknown as { points?: number[][]; text?: string }
  return JSON.stringify([element.id, element.type, element.x, element.y, element.width, element.height,
    element.angle, element.strokeColor, element.strokeWidth, element.locked, element.customData, extra.points, extra.text])
}
function validateAdapter(adapter: RoomInkAdapter): void {
  const a = adapter.sessions.personal.scope, b = adapter.sessions.shared.scope
  if (a.roomId !== adapter.roomId || b.roomId !== adapter.roomId || a.ownerId !== b.ownerId
      || a.audience !== 'personal' || b.audience !== 'shared' || JSON.stringify(a.source) !== JSON.stringify(b.source)
      || adapter.pages.length !== a.source.pageCount || adapter.pages.some((p, i) => p.page !== i + 1
        || ![p.x, p.y, p.width, p.height].every(Number.isFinite) || p.width <= 0 || p.height <= 0))
    throw Error('ink_scope_mismatch')
  for (const peer of adapter.peers ?? []) if (peer.scope.ownerId === a.ownerId || peer.scope.audience !== 'shared' || peer.scope.roomId !== adapter.roomId
      || JSON.stringify(peer.scope.source) !== JSON.stringify(a.source)) throw Error('ink_scope_mismatch')
}
export function RoomCollaboration({ adapter, api, store }: { adapter: RoomInkAdapter; api: ExcalidrawImperativeAPI | null; store: WorkspaceStore }) {
  const [audience, setAudience] = useState<'personal' | 'shared'>('personal'), [page, setPage] = useState(1), [zoom, setZoom] = useState(1)
  const [error, setError] = useState('')
  const captured = useRef(new Set<string>())
  const session = adapter.sessions[audience]
  const matching = adapter.roomId === session.scope.roomId
  useEffect(() => {
    if (!api || !matching) return
    try { validateAdapter(adapter) } catch { setError('Il documento o la sessione non corrispondono ai layer.'); return }
    let applying = false, disposed = false
    const capture = new CompletedInkCapture(api.getSceneElements())
    let timer: ReturnType<typeof setTimeout> | undefined
    const project = () => {
      if (disposed || applying) return
      const scene = api.getSceneElements()
      const items = adapter.signal.aborted || session.state().status === 'revoked' ? [] : [...session.objects().map(item => ({ item, scope: session.scope })),
        ...(audience === 'shared' ? (adapter.peers ?? []).flatMap(layer => layer.objects().map(item => ({ item, scope: layer.scope }))) : [])]
      const projected = items.map(({ item, scope }) => projectInk(item, scope, adapter.pages[item.source.page - 1]))
      const managed = scene.filter(isInkProjection)
      const restored = restoreElements(projected as unknown as Parameters<typeof restoreElements>[0], managed)
      const dropOriginal = scene.some(element => captured.current.has(element.id))
      if (!dropOriginal && managed.length === restored.length && managed.every((element, i) => signature(element) === signature(restored[i]))) return
      applying = true
      try {
        const base = scene.filter(element => !captured.current.has(element.id) && !isInkProjection(element))
        api.updateScene({ elements: [...base, ...restored], captureUpdate: CaptureUpdateAction.NEVER })
      } finally { applying = false }
    }
    const unsubscribers = [
      session.subscribe(project),
      api.onChange(project),
      api.onPointerUp(() => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          if (disposed) return
          for (const element of capture.completed(api.getSceneElements())) {
            captured.current.add(element.id)
            try {
              if (adapter.signal.aborted) throw Error('ink_read_only')
              session.add(captureInkStroke(element as Parameters<typeof captureInkStroke>[0], session.scope, adapter.pages[page - 1])); setError('')
            }
            catch { setError('Tratto non acquisito: scrivi interamente nella pagina selezionata, con il layer abilitato.') }
          }
          project()
        }, 0)
      }),
    ]
    const revoke = () => {
      for (const element of capture.completed(api.getSceneElements())) captured.current.add(element.id)
      adapter.sessions.personal.revoke(); adapter.sessions.shared.revoke(); project()
    }
    const keydown = (event: KeyboardEvent) => {
      const target = event.target
      if (!(target instanceof HTMLElement) || target.closest('[data-ink-room]')?.getAttribute('data-ink-room') !== adapter.roomId
          || target.closest('input, textarea, [contenteditable="true"]') || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault(); event.stopImmediatePropagation()
      if (session.state().status !== 'revoked' && !session.state().frozen) { if (event.shiftKey) session.redo(); else session.undo() }
    }
    document.addEventListener('keydown', keydown, true)
    adapter.signal.addEventListener('abort', revoke, { once: true })
    if (adapter.signal.aborted) revoke(); else project()
    return () => { disposed = true; clearTimeout(timer); document.removeEventListener('keydown', keydown, true); adapter.signal.removeEventListener('abort', revoke); for (const unsubscribe of unsubscribers) unsubscribe() }
  }, [adapter, api, audience, page, session, matching])
  if (!matching) return <p role="alert">Il layer appartiene a un’altra lezione.</p>
  return <div onKeyDownCapture={event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
    event.preventDefault(); event.stopPropagation()
    if (session.state().status !== 'revoked' && !session.state().frozen) { if (event.shiftKey) session.redo(); else session.undo() }
  }}>
    <CollaborationToolbar session={session} page={page} pageCount={adapter.pages.length} onPage={value => {
      setPage(value); const geometry = adapter.pages[value - 1]
      const currentZoom = api?.getAppState().zoom.value ?? 1
      api?.updateScene({ appState: { scrollX: 40 / currentZoom - geometry.x, scrollY: 40 / currentZoom - geometry.y } })
    }} audience={audience} onAudience={setAudience} zoom={zoom} onZoom={value => {
      setZoom(value); api?.updateScene({ appState: { zoom: { value: value as ReturnType<ExcalidrawImperativeAPI['getAppState']>['zoom']['value'] } } })
    }} storageMode={store.mode} transport={adapter.transport} onSave={async () => {
      await writeInkCheckpoint(store, adapter.sessions.personal.checkpoint())
      await writeInkCheckpoint(store, adapter.sessions.shared.checkpoint())
    }} />
    {error && <p className="ink-error" role="alert">{error}</p>}
  </div>
}
