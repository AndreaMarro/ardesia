// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act } from "react"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import ElabLab from "../design/ElabLab"
import { InMemoryEventLog } from "../lessonos/eventlog"

const stores = vi.hoisted(() => ({ open: vi.fn(), legacyFallback: vi.fn() }))
vi.mock("../lessonos/indexedDbEventLog", async (original) => ({
  ...await original<typeof import("../lessonos/indexedDbEventLog")>(),
  openIndexedDbEventLog: stores.open,
  createEventLogStore: stores.legacyFallback,
}))

// These are controlled opener fixtures, not a certification of a real backend.
function handle(kind = "verified-indexeddb", log: InMemoryEventLog | null = new InMemoryEventLog()) {
  return { backend: { kind, code: "synthetic-backend-state", database: "synthetic-elab-log" }, log, close: vi.fn(async () => {}) }
}

const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let oldAct: boolean | undefined
beforeEach(() => {
  oldAct = actEnvironment.IS_REACT_ACT_ENVIRONMENT
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true
  stores.open.mockReset()
  stores.legacyFallback.mockReset().mockImplementation(async () => new InMemoryEventLog())
})
afterEach(() => {
  cleanup()
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = oldAct
})

async function viewDefault() {
  const view = render(<ElabLab />)
  await act(async () => { await Promise.resolve() })
  const panel = view.container.querySelector('[data-elab-lab-marcatura]')!
  fireEvent.click(panel.querySelector('input[name=elab-lab-concept]')!)
  return { ...view, panel, button: panel.querySelector<HTMLButtonElement>('[data-mistake-id]')!,
    exportButton: view.getByRole('button', { name: 'Esporta memoria (JSON)' }) as HTMLButtonElement }
}

function expectBlocked(view: Awaited<ReturnType<typeof viewDefault>>) {
  expect(view.button.disabled).toBe(true)
  expect(view.exportButton.disabled).toBe(true)
  expect(view.panel.querySelector('[data-marked-count]')?.textContent).toBe('errori segnati: 0')
  expect(stores.legacyFallback).not.toHaveBeenCalled()
}

describe('ElabLab owns a persistent log before confirming marks', () => {
  it.each(['unavailable', 'corrupt', 'data-loss'])('blocks marking/export with an honest %s cause and keeps existing logical events intact', async (kind) => {
    const log = new InMemoryEventLog()
    await log.append({ kind: 'error.observed', errorId: 'synthetic-prior-error', conceptId: 'synthetic-concept', labels: { it: 'Fatto sintetico precedente' }, t: 1, evidence: ['pack:synthetic-prior'] })
    const before = await log.readAll()
    const append = vi.spyOn(log, 'append')
    const opened = handle(kind, kind === 'unavailable' ? null : log)
    stores.open.mockResolvedValue(opened)
    const view = await viewDefault()
    await waitFor(() => expectBlocked(view))
    const alert = view.getByRole('alert')
    expect(alert.textContent).toMatch(kind === 'corrupt' ? /corrott|danneggiat/i : kind === 'data-loss' ? /parzial|incomplet/i : /non disponibile/i)
    fireEvent.click(view.button)
    expect(append).not.toHaveBeenCalled()
    expect(await log.readAll()).toEqual(before)
    await waitFor(() => expect(opened.close).toHaveBeenCalledOnce())
    view.unmount()
    expect(opened.close).toHaveBeenCalledOnce()
  })

  it('contains an opener rejection and never enables the volatile fallback', async () => {
    stores.open.mockRejectedValue(new Error('synthetic opener failure'))
    const view = await viewDefault()
    await waitFor(() => expectBlocked(view))
    expect(view.getByRole('alert').textContent).toMatch(/non disponibile/i)
  })

  it('does not treat a ready descriptor without a log as usable', async () => {
    const opened = handle('verified-indexeddb', null)
    stores.open.mockResolvedValue(opened)
    const view = await viewDefault()
    await waitFor(() => expectBlocked(view))
    expect(view.getByRole('alert').textContent).toMatch(/non disponibile/i)
    await waitFor(() => expect(opened.close).toHaveBeenCalledOnce())
  })

  it('keeps marking disabled while open is pending and closes the owned ready handle on unmount', async () => {
    let resolve!: (value: ReturnType<typeof handle>) => void
    stores.open.mockReturnValue(new Promise(value => { resolve = value }))
    const view = await viewDefault()
    expectBlocked(view)
    const opened = handle()
    await act(async () => { resolve(opened) })
    await waitFor(() => expect(view.button.disabled).toBe(false))
    expect(view.exportButton.disabled).toBe(false)
    expect(view.queryByRole('alert')).toBeNull()
    view.unmount()
    await waitFor(() => expect(opened.close).toHaveBeenCalledOnce())
  })

  it('closes a late handle exactly once after cancellation instead of activating it', async () => {
    let resolve!: (value: ReturnType<typeof handle>) => void
    stores.open.mockReturnValue(new Promise(value => { resolve = value }))
    const view = await viewDefault()
    expectBlocked(view)
    view.unmount()
    const opened = handle()
    await act(async () => { resolve(opened) })
    await waitFor(() => expect(opened.close).toHaveBeenCalledOnce())
    expect(stores.legacyFallback).not.toHaveBeenCalled()
  })

  it('does not open or close an event log supplied by its caller', async () => {
    const supplied = Object.assign(new InMemoryEventLog(), { close: vi.fn(async () => {}) })
    const view = render(<ElabLab eventLog={supplied} />)
    fireEvent.click(view.container.querySelector('input[name=elab-lab-concept]')!)
    expect((view.container.querySelector('[data-mistake-id]') as HTMLButtonElement).disabled).toBe(false)
    view.unmount()
    expect(supplied.close).not.toHaveBeenCalled()
    expect(stores.open).not.toHaveBeenCalled()
    expect(stores.legacyFallback).not.toHaveBeenCalled()
  })
})
