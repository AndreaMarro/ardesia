import { useEffect, useRef, useState } from 'react'
import { CaptureUpdateAction, restoreElements } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { CollaborationToolbar } from './CollaborationToolbar'
import { captureInkStroke, projectInk } from './canvasBinding'
import type { PageGeometry } from './canvasBinding'
import { CompletedInkCapture, isInkProjection, isInkUndoTarget } from './sceneBoundary'
import { validateRoomInkAdapter, type RoomInkAdapter } from './roomAdapter'
export type { RoomInkAdapter } from './roomAdapter'
import { writeInkCheckpoint } from './persistence'
import type { WorkspaceStore } from '../store/WorkspaceStore'
import { usePresentation } from './usePresentation'

function signature(element: Pick<ExcalidrawElement, 'id' | 'type' | 'x' | 'y' | 'width' | 'height' | 'angle' | 'strokeColor' | 'strokeWidth' | 'locked' | 'customData'>): string {
  const extra = element as unknown as { points?: number[][]; text?: string }
  return JSON.stringify([element.id, element.type, element.x, element.y, element.width, element.height,
    element.angle, element.strokeColor, element.strokeWidth, element.locked, element.customData, extra.points, extra.text])
}
export function RoomCollaboration({ adapter, api, store }: { adapter: RoomInkAdapter; api: ExcalidrawImperativeAPI | null; store: WorkspaceStore }) {
  const [audience, setAudience] = useState<'personal' | 'shared'>('personal'), [page, setPage] = useState(1), [zoom, setZoom] = useState(1)
  const [error, setError] = useState('')
  const captured = useRef(new Set<string>())
  const latestAdapter = useRef(adapter)
  latestAdapter.current = adapter
  const refreshProjection = useRef<(() => void) | null>(null)
  const session = adapter.sessions[audience]
  const presentation = usePresentation(adapter, api, setPage)
  const matching = adapter.roomId === session.scope.roomId
  useEffect(() => {
    if (!api || !matching) return
    try { validateRoomInkAdapter(adapter) } catch { setError('Il documento o la sessione non corrispondono ai layer.'); return }
    let applying = false, disposed = false
    const capture = new CompletedInkCapture(api.getSceneElements())
    let timer: ReturnType<typeof setTimeout> | undefined
    let gesturePage: PageGeometry | undefined
    const project = () => {
      if (disposed || applying) return
      const currentAdapter = latestAdapter.current
      try { validateRoomInkAdapter(currentAdapter) } catch { setError('Il documento o la sessione non corrispondono ai layer.'); return }
      const scene = api.getSceneElements()
      const items = currentAdapter.signal.aborted || session.state().status === 'revoked' ? [] : [...session.objects().map(item => ({ item, scope: session.scope })),
        ...(audience === 'shared' ? (currentAdapter.peers ?? []).flatMap(layer => layer.objects().map(item => ({ item, scope: layer.scope }))) : [])]
      const projected = items.map(({ item, scope }) => projectInk(item, scope, currentAdapter.pages[item.source.page - 1]))
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
    setZoom(api.getAppState().zoom.value)
    refreshProjection.current = project
    const unsubscribers = [
      session.subscribe(project),
      api.onChange(project),
      api.onScrollChange((_x, _y, value) => setZoom(value.value)),
      api.onPointerDown((tool, state) => {
        capture.begin(tool.type, new Set(state.originalElements.keys()))
        const geometry = latestAdapter.current.pages[page - 1]
        gesturePage = tool.type === 'freedraw' && geometry ? { ...geometry } : undefined
      }),
      api.onPointerUp(() => {
        const geometry = gesturePage
        gesturePage = undefined
        clearTimeout(timer)
        timer = setTimeout(() => {
          if (disposed) return
          for (const element of capture.completed(api.getSceneElements())) {
            captured.current.add(element.id)
            try {
              if (adapter.signal.aborted || !geometry) throw Error('ink_read_only')
              session.add(captureInkStroke(element as Parameters<typeof captureInkStroke>[0], session.scope, geometry)); setError('')
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
      presentation.revoke()
    }
    const keydown = (event: KeyboardEvent) => {
      if (!isInkUndoTarget(event.target, adapter.roomId)
          || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault(); event.stopImmediatePropagation()
      if (session.state().status !== 'revoked' && !session.state().frozen) { if (event.shiftKey) session.redo(); else session.undo() }
    }
    document.addEventListener('keydown', keydown, true)
    adapter.signal.addEventListener('abort', revoke, { once: true })
    if (adapter.signal.aborted) revoke(); else project()
    return () => { disposed = true; if (refreshProjection.current === project) refreshProjection.current = null; clearTimeout(timer); document.removeEventListener('keydown', keydown, true); adapter.signal.removeEventListener('abort', revoke); for (const unsubscribe of unsubscribers) unsubscribe() }
  }, [api, audience, page, session, matching, adapter.signal, adapter.sessions.personal, adapter.sessions.shared,
    presentation.revoke])
  useEffect(() => { refreshProjection.current?.() }, [adapter])
  if (!matching) return <p role="alert">Il layer appartiene a un’altra lezione.</p>
  return <div onKeyDownCapture={event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
    event.preventDefault(); event.stopPropagation()
    if (session.state().status !== 'revoked' && !session.state().frozen) { if (event.shiftKey) session.redo(); else session.undo() }
  }}>
    <CollaborationToolbar session={session} page={page} pageCount={adapter.pages.length} onPage={value => {
      presentation.onFollow?.(false)
      setPage(value); const geometry = adapter.pages[value - 1]
      const currentZoom = api?.getAppState().zoom.value ?? 1
      api?.updateScene({ appState: { scrollX: 40 / currentZoom - geometry.x, scrollY: 40 / currentZoom - geometry.y } })
    }} audience={audience} onAudience={setAudience} zoom={zoom} onZoom={value => {
      presentation.onFollow?.(false)
      setZoom(value); api?.updateScene({ appState: { zoom: { value: value as ReturnType<ExcalidrawImperativeAPI['getAppState']>['zoom']['value'] } } })
    }} storageMode={store.mode} transport={adapter.transport}
    following={presentation.following} onFollow={presentation.onFollow} onPresent={presentation.onPresent}
    presenting={presentation.presenting} presentationStatus={presentation.presentationStatus} onSave={async () => {
      await writeInkCheckpoint(store, adapter.sessions.personal.checkpoint())
      await writeInkCheckpoint(store, adapter.sessions.shared.checkpoint())
    }} />
    {error && <p className="ink-error" role="alert">{error}</p>}
    {presentation.error && <p className="ink-error" role="alert">{presentation.error}</p>}
  </div>
}
