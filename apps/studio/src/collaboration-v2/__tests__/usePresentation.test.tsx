// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
vi.hoisted(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, value: () => ({
    filter: 'none', font: '', measureText: (text: string) => ({ width: text.length * 10 }),
  }) })
})
import { act, cleanup, fireEvent, renderHook, waitFor } from '@testing-library/react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { InkSession } from '../session'
import { usePresentation } from '../usePresentation'
import type { RoomInkAdapter } from '../roomAdapter'
import type { PresentationFocus, PresentationTarget } from '../presentation'
afterEach(cleanup)
const source = { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 }
const focus = (sequence: number, page = 2): PresentationFocus => ({ channelId: 'channel', sequence,
  target: { v: 1, roomId: 'room', source, page, center: [.25, .75] } })
function setup(ready = true) {
  const cancellation = new AbortController()
  const base = { v: 1 as const, roomId: 'room', ownerId: 'alice', source }
  const adapter: RoomInkAdapter = { roomId: 'room', signal: cancellation.signal,
    sessions: { personal: new InkSession({ ...base, audience: 'personal' }), shared: new InkSession({ ...base, audience: 'shared' }) },
    pages: [1, 2].map((page, i) => ({ page, x: 100, y: 100 + i * 824, width: 600, height: 800 })),
    presentation: { channelId: 'channel', focus: focus(1) } }
  const scroll = vi.fn(), onPage = vi.fn()
  const state = { scrollX: 0, scrollY: 0, zoom: { value: 1.5 }, width: 900, height: 600, offsetLeft: 10, offsetTop: 20 }
  const api = { scrollToContent: scroll, getAppState: () => state } as unknown as ExcalidrawImperativeAPI
  const props: { value: RoomInkAdapter; currentApi?: ExcalidrawImperativeAPI | null } = { value: adapter, currentApi: ready ? api : null }
  const view = renderHook(({ value, currentApi = api }) => usePresentation(value, currentApi, onPage), { initialProps: props })
  return { ...view, adapter, cancellation, scroll, onPage, api, state }
}
test('native camera follows only after consent and applies a queued target after pointer-up', () => {
  const view = setup()
  expect(view.scroll).not.toHaveBeenCalled()
  act(() => view.result.current.onFollow?.(true))
  expect(view.onPage).toHaveBeenLastCalledWith(2)
  expect(view.scroll.mock.lastCall?.[0][0]).toMatchObject({ x: 250, y: 1524 })
  expect(view.scroll.mock.lastCall?.[1]).toEqual({ fitToContent: false, animate: false })
  act(() => view.result.current.beginInteraction())
  view.rerender({ value: { ...view.adapter, presentation: { channelId: 'channel', focus: focus(2, 1) } } })
  expect(view.scroll).toHaveBeenCalledTimes(1)
  act(() => view.result.current.endInteraction())
  expect(view.scroll).toHaveBeenCalledTimes(2)
  expect(view.onPage).toHaveBeenLastCalledWith(1)
  act(() => view.cancellation.abort())
  expect(view.result.current.following).toBe(false)
  view.rerender({ value: { ...view.adapter, presentation: { channelId: 'channel', focus: focus(3, 2) } } })
  expect(view.scroll).toHaveBeenCalledTimes(2)
  expect(view.adapter.sessions.personal.objects()).toEqual([])
})
test('publisher is single-flight, retains retry after failure and stops after forbidden', async () => {
  const view = setup()
  let reject!: (failure: unknown) => void
  const publish = vi.fn((_target: PresentationTarget, _signal: AbortSignal) => new Promise<void>((_resolve, rejectPromise) => { reject = rejectPromise }))
  view.rerender({ value: { ...view.adapter, presentation: { ...view.adapter.presentation!, publish } } })
  act(() => { view.result.current.onPresent?.(); view.result.current.onPresent?.() })
  expect(publish).toHaveBeenCalledTimes(1)
  expect(publish.mock.calls[0][0]).toMatchObject({ roomId: 'room', page: 1, center: [1 / 3, .125] })
  expect(view.result.current.presenting).toBe(true)
  await act(async () => reject(Error('offline')))
  await waitFor(() => expect(view.result.current.error).toContain('Punto non inviato'))
  act(() => view.result.current.onPresent?.())
  expect(publish).toHaveBeenCalledTimes(2)
  await act(async () => reject(Object.assign(Error('forbidden'), { status: 403 })))
  await waitFor(() => expect(view.result.current.onPresent).toBeUndefined())
  expect(view.result.current.error).toContain('Non puoi più indicare punti')
  view.rerender({ value: { ...view.adapter, presentation: { channelId: 'channel', publish, focus: focus(8) } } })
  expect(view.result.current.error).toContain('Non puoi più indicare punti')
})
test('changing presentation or unmounting aborts requests and ignores late success', async () => {
  const view = setup()
  const addListener = vi.spyOn(view.cancellation.signal, 'addEventListener')
  const removeListener = vi.spyOn(view.cancellation.signal, 'removeEventListener')
  let complete!: () => void, requestSignal!: AbortSignal
  const publish = (_target: unknown, signal: AbortSignal) => new Promise<void>(resolve => { complete = resolve; requestSignal = signal })
  view.rerender({ value: { ...view.adapter, presentation: { ...view.adapter.presentation!, publish } } })
  act(() => view.result.current.onPresent?.())
  const parentAbort = addListener.mock.lastCall![1]
  view.rerender({ value: { ...view.adapter, presentation: { channelId: 'replacement', publish } } })
  expect(requestSignal.aborted).toBe(true)
  expect(removeListener).toHaveBeenCalledWith('abort', parentAbort)
  await act(async () => complete())
  expect(view.result.current.presentationStatus).not.toContain('inviato')
  expect(view.result.current.presenting).toBe(false)
  act(() => view.result.current.onPresent?.())
  view.unmount()
  expect(requestSignal.aborted).toBe(true)
  await act(async () => complete())
})
test('session revocation aborts an open publisher and rejects late success without host abort', async () => {
  const view = setup()
  let complete!: () => void, signal!: AbortSignal
  const publish = (_target: PresentationTarget, value: AbortSignal) => new Promise<void>(resolve => { signal = value; complete = resolve })
  view.rerender({ value: { ...view.adapter, presentation: { ...view.adapter.presentation!, publish } } })
  act(() => { view.result.current.onFollow?.(true); view.result.current.onPresent?.() })
  act(() => view.adapter.sessions.shared.revoke())
  expect(view.cancellation.signal.aborted).toBe(false)
  expect(signal.aborted).toBe(true)
  expect(view.result.current.following).toBe(false)
  await act(async () => complete())
  expect(view.result.current.presentationStatus).not.toContain('inviato')
})
test('follow is unavailable until the native API is ready and then uses the retained focus', () => {
  const view = setup(false)
  expect(view.result.current.onFollow).toBeUndefined()
  view.rerender({ value: view.adapter, currentApi: view.api })
  act(() => view.result.current.onFollow?.(true))
  expect(view.onPage).toHaveBeenLastCalledWith(2)
  expect(view.scroll).toHaveBeenCalledTimes(1)
  view.rerender({ value: { ...view.adapter, presentation: { channelId: 'channel', focus: {
    ...focus(2), target: { ...focus(2).target, source: { ...source, revisionId: 'wrong-version' } },
  } } } })
  expect(view.result.current.onFollow).toBeUndefined()
  view.rerender({ value: view.adapter })
  expect(view.result.current.onFollow).toBeTypeOf('function')
})
test('publishing resolves the page at the native viewport center rather than the old selector page', () => {
  const view = setup()
  view.state.scrollY = -824
  const publish = vi.fn(async (_target: PresentationTarget) => {})
  view.rerender({ value: { ...view.adapter, presentation: { ...view.adapter.presentation!, publish } } })
  act(() => view.result.current.onPresent?.())
  expect(publish.mock.calls[0][0]).toMatchObject({ page: 2, center: [1 / 3, .125] })
})
test('all native canvas pointers defer focus even without Excalidraw creation callbacks', async () => {
  const view = setup()
  const room = document.createElement('div'), canvas = document.createElement('canvas')
  room.setAttribute('data-ink-room', 'room'); canvas.classList.add('interactive'); room.append(canvas); document.body.append(room)
  const pointer = (type: string, pointerId: number) => {
    const event = new Event(type, { bubbles: true }); Object.defineProperty(event, 'pointerId', { value: pointerId }); fireEvent(canvas, event)
  }
  try {
    act(() => view.result.current.onFollow?.(true))
    act(() => { pointer('pointerdown', 1); pointer('pointerdown', 2) })
    view.rerender({ value: { ...view.adapter, presentation: { channelId: 'channel', focus: focus(2, 1) } } })
    expect(view.scroll).toHaveBeenCalledTimes(1)
    await act(async () => { pointer('pointerup', 1); await new Promise(resolve => setTimeout(resolve, 10)) })
    expect(view.scroll).toHaveBeenCalledTimes(1)
    act(() => pointer('pointerup', 2))
    await waitFor(() => expect(view.scroll).toHaveBeenCalledTimes(2))
    expect(view.onPage).toHaveBeenLastCalledWith(1)
  } finally { room.remove() }
})
