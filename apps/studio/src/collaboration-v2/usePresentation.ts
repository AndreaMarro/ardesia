import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { convertToExcalidrawElements, viewportCoordsToSceneCoords } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { PresentationFollower, presentationPoint } from './presentation'
import type { PresentationTarget } from './presentation'
import { validateRoomInkAdapter, type RoomInkAdapter } from './roomAdapter'

const revokedSession = (adapter: RoomInkAdapter) => adapter.signal.aborted
  || adapter.sessions.personal.state().status === 'revoked' || adapter.sessions.shared.state().status === 'revoked'

export function usePresentation(adapter: RoomInkAdapter, api: ExcalidrawImperativeAPI | null, onPage: (page: number) => void) {
  const current = useRef({ adapter, api, onPage })
  current.current = { adapter, api, onPage }
  const follower = useMemo(() => new PresentationFollower(adapter.roomId, adapter.sessions.personal.scope.source),
    [adapter.roomId, adapter.sessions.personal, adapter.sessions.shared, adapter.signal])
  const [following, setFollowing] = useState(false), [presenting, setPresenting] = useState(false), [revoked, setRevoked] = useState(false)
  const [notice, setNotice] = useState(''), [focusError, setFocusError] = useState(''), [publishError, setPublishError] = useState(''), [denied, setDenied] = useState(false)
  const flight = useRef<AbortController | null>(null)
  const apply = useCallback((target: PresentationTarget | null) => {
    const context = current.current
    if (!target || !context.api || revokedSession(context.adapter)) return
    try {
      validateRoomInkAdapter(context.adapter)
      const point = presentationPoint(target, context.adapter.pages[target.page - 1])
      const anchor = convertToExcalidrawElements([{ type: 'rectangle', ...point, width: 1, height: 1 }])
      context.onPage(target.page)
      context.api.scrollToContent(anchor, { fitToContent: false, animate: false })
    } catch { follower.setFollowing(false); setFollowing(false); setFocusError('La presentazione non corrisponde a questo documento.') }
  }, [follower])
  const onFollow = useCallback((value: boolean) => {
    if (!current.current.api || revokedSession(current.current.adapter)) return
    setFocusError(''); apply(follower.setFollowing(value)); setFollowing(follower.isFollowing)
  }, [follower, apply])
  const beginInteraction = useCallback(() => follower.beginInteraction(), [follower])
  const endInteraction = useCallback(() => apply(follower.endInteraction()), [follower, apply])
  const revoke = useCallback(() => {
    follower.revoke(); flight.current?.abort(); setFollowing(false); setRevoked(true); setNotice('')
  }, [follower])
  useEffect(() => {
    if (!api) follower.setFollowing(false)
    try { const target = follower.receive(adapter.presentation); setFocusError(''); apply(target); setFollowing(follower.isFollowing) }
    catch { follower.setFollowing(false); setFollowing(false); setFocusError('La presentazione non corrisponde a questo documento.') }
  }, [adapter.presentation, api, follower, apply])
  useEffect(() => {
    setDenied(false); setNotice(''); setPublishError('')
  }, [adapter.signal, adapter.sessions.personal, adapter.sessions.shared, adapter.presentation?.channelId, adapter.presentation?.publish])
  useEffect(() => {
    setRevoked(false); setPresenting(false)
    const checkRevocation = () => { if (revokedSession(adapter)) revoke() }
    const unsubscribe = [adapter.sessions.personal.subscribe(checkRevocation), adapter.sessions.shared.subscribe(checkRevocation)]
    adapter.signal.addEventListener('abort', revoke, { once: true })
    checkRevocation()
    return () => {
      for (const stop of unsubscribe) stop()
      adapter.signal.removeEventListener('abort', revoke)
      flight.current?.abort(); flight.current = null
    }
  }, [api, adapter.signal, adapter.sessions.personal, adapter.sessions.shared, adapter.presentation?.channelId, adapter.presentation?.publish, revoke])
  useEffect(() => {
    if (!api) return
    const pointers = new Set<number>()
    let disposed = false, wheeling = false, releaseTimer: ReturnType<typeof setTimeout> | undefined, wheelTimer: ReturnType<typeof setTimeout> | undefined
    const isCanvas = (target: EventTarget | null) => target instanceof HTMLCanvasElement && target.classList.contains('interactive')
      && target.closest('[data-ink-room]')?.getAttribute('data-ink-room') === adapter.roomId
    // SDK creation callbacks omit native hand/Space/middle-button pan.
    const finish = () => {
      if (disposed || pointers.size || wheeling) return
      clearTimeout(releaseTimer)
      // Two task turns: native DOM can checkpoint microtasks between listeners.
      // The second timer follows the capture timer registered by Room on pointer-up.
      releaseTimer = setTimeout(() => {
        releaseTimer = setTimeout(() => { if (!disposed && !pointers.size && !wheeling) endInteraction() }, 0)
      }, 0)
    }
    const down = (event: PointerEvent) => { if (isCanvas(event.target)) { pointers.add(event.pointerId); clearTimeout(releaseTimer); beginInteraction() } }
    const up = (event: PointerEvent) => { if (pointers.delete(event.pointerId)) finish() }
    const wheel = (event: WheelEvent) => {
      if (!isCanvas(event.target)) return
      wheeling = true; beginInteraction(); clearTimeout(wheelTimer)
      wheelTimer = setTimeout(() => { wheeling = false; finish() }, 150)
    }
    const blur = () => { pointers.clear(); wheeling = false; clearTimeout(wheelTimer); finish() }
    document.addEventListener('pointerdown', down, true); document.addEventListener('pointerup', up, true)
    document.addEventListener('pointercancel', up, true); document.addEventListener('wheel', wheel, { capture: true, passive: true })
    window.addEventListener('blur', blur)
    return () => {
      disposed = true; clearTimeout(releaseTimer); clearTimeout(wheelTimer)
      document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointerup', up, true)
      document.removeEventListener('pointercancel', up, true); document.removeEventListener('wheel', wheel, true); window.removeEventListener('blur', blur)
      follower.setFollowing(false); follower.endInteraction()
    }
  }, [api, adapter.roomId, follower, beginInteraction, endInteraction])
  async function present() {
    const context = current.current, { presentation, signal } = context.adapter
    if (denied || flight.current || revokedSession(context.adapter) || !presentation?.publish) return
    if (!context.api) { setPublishError('Attendi che la lavagna sia pronta.'); return }
    const cancellation = new AbortController()
    flight.current = cancellation
    const abort = () => cancellation.abort(), detach = () => signal.removeEventListener('abort', abort)
    signal.addEventListener('abort', abort, { once: true })
    cancellation.signal.addEventListener('abort', detach, { once: true })
    const isCurrent = () => flight.current === cancellation && !cancellation.signal.aborted && !revokedSession(current.current.adapter)
      && current.current.api === context.api && current.current.adapter.signal === signal
      && current.current.adapter.sessions.personal === context.adapter.sessions.personal
      && current.current.adapter.sessions.shared === context.adapter.sessions.shared
      && current.current.adapter.presentation?.channelId === presentation.channelId
      && current.current.adapter.presentation?.publish === presentation.publish
    setPresenting(true); setPublishError(''); setNotice('')
    try {
      validateRoomInkAdapter(context.adapter)
      const state = context.api.getAppState()
      const center = viewportCoordsToSceneCoords({ clientX: state.offsetLeft + state.width / 2, clientY: state.offsetTop + state.height / 2 }, state)
      const visible = context.adapter.pages.filter(p => center.x >= p.x && center.x <= p.x + p.width && center.y >= p.y && center.y <= p.y + p.height)
      if (visible.length !== 1) { setPublishError('Centra una pagina del documento prima di indicare un punto.'); return }
      const geometry = visible[0]
      const target: PresentationTarget = { v: 1, roomId: context.adapter.roomId, source: context.adapter.sessions.personal.scope.source,
        page: geometry.page, center: [(center.x - geometry.x) / geometry.width, (center.y - geometry.y) / geometry.height] }
      await presentation.publish(target, cancellation.signal)
      if (isCurrent()) setNotice('Punto della presentazione inviato')
    } catch (failure) {
      if (isCurrent()) {
        const status = (failure as { status?: number })?.status
        if (status === 401 || status === 403) { setDenied(true); setPublishError('Non puoi più indicare punti. Riapri la lezione.') }
        else setPublishError('Punto non inviato. Riprova quando la connessione è disponibile.')
      }
    } finally {
      detach(); cancellation.signal.removeEventListener('abort', detach)
      if (flight.current === cancellation) { flight.current = null; setPresenting(false) }
    }
  }
  return { following, onFollow: adapter.presentation && api && !revoked ? onFollow : undefined,
    onPresent: adapter.presentation?.publish && api && !denied && !revoked ? () => void present() : undefined,
    presenting, presentationStatus: following ? 'Segui la presentazione · il tuo zoom resta personale' : notice,
    error: focusError || publishError, beginInteraction, endInteraction, revoke }
}
