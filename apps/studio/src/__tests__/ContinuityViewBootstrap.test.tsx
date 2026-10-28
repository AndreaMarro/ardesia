// @vitest-environment jsdom
import { Blob as NodeBlob } from 'node:buffer'
import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import type { ScopedContinuitySnapshotV1 } from '../lessonos/continuityProjection'
import type { ContinuityViewDeps } from '../design/ContinuityView'

const room = 'continuity-marked-room'
const session = '11111111-1111-4111-8111-111111111111'
const build = 'a'.repeat(40)
const marker = { id: 'fluid-thermo-lab', type: 'text', text: 'Only the requested room', version: 7 }
function at(lesson = room, id = session) {
  window.history.replaceState(null, '', `/?vista=continuita&sessione=${id}#${lesson}`)
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(yes => { resolve = yes })
  return { promise, resolve }
}
beforeEach(() => {
  vi.resetModules()
  const entries = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    get length() { return entries.size },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, String(value)) },
    removeItem: (key: string) => { entries.delete(key) },
    clear: () => entries.clear(),
  } satisfies Storage)
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('indexedDB', new IDBFactory())
  vi.stubGlobal('IDBKeyRange', IDBKeyRange)
  at()
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

async function fixture() {
  const { WorkspaceStore, workspaceStore } = await import('../store/WorkspaceStore')
  const { IndexedDbEventLog } = await import('../lessonos/indexedDbEventLog')
  const { loadScopedContinuitySnapshot } = await import('../lessonos/continuityRuntime')
  const { default: ContinuityView } = await import('../design/ContinuityView')
  const seed = new WorkspaceStore()
  await seed.init()
  await seed.write(`raw/${room}/${session}/session.yaml`, new Blob([
    `v: 2\nlessonId: ${room}\nsessionId: ${session}\ncreated: 100\nrevision: 7\naudioConsent: false\naudioStartEpoch: null\n`,
  ]))
  await seed.write(`raw/${room}/board.excalidraw`, new Blob([JSON.stringify({ elements: [marker] })]))
  await seed.write(`raw/${room}/events.jsonl`, new Blob(['']))
  await seed.write('raw/other-room/board.excalidraw', new Blob([JSON.stringify({ elements: [{ ...marker, text: 'Must not appear' }] })]))
  const log = new IndexedDbEventLog()
  await log.open()
  await log.appendEnvelope({
    schemaVersion: 2, eventId: '22222222-2222-4222-8222-222222222222', lessonId: room, sessionId: session,
    kind: 'lesson.started', occurredAt: '2026-10-28T10:00:00.000Z',
    actor: { type: 'teacher', id: 'founder-beta-teacher' },
    producer: { id: 'com.github.andreamarro.ardesia.studio', version: '0.0.0', commitSha: build },
    causationId: null, idempotencyKey: null,
    evidence: [{ ref: 'board:fluid-thermo-lab', resolution: 'verified' }], payload: { room },
  })
  await log.close()
  const snapshots: ScopedContinuitySnapshotV1[] = []
  const loadSnapshot: NonNullable<ContinuityViewDeps['loadSnapshot']> = async (scope, factories) => {
    const result = await loadScopedContinuitySnapshot(scope, { ...factories, buildCommitSha: build })
    if (result.kind === 'loaded') snapshots.push(result.snapshot)
    return result
  }
  return { workspaceStore, ContinuityView, snapshots, loadSnapshot }
}

it('cold navigation bootstraps the real singleton, reads the exact room and preserves bytes and unresolved references', async () => {
  const { workspaceStore, ContinuityView, snapshots, loadSnapshot } = await fixture()
  expect(workspaceStore.mode).toBe('unavailable')
  const before = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!).map(key => [key, localStorage.getItem(key)])
  const read = vi.spyOn(workspaceStore, 'read')
  render(<ContinuityView deps={{ loadSnapshot }} />)
  await waitFor(() => expect(snapshots).toHaveLength(1))
  expect(snapshots[0].session?.document.revision).toBe(7)
  expect(snapshots[0].scope).toEqual({ lessonId: room, roomId: room, sessionId: session })
  expect(snapshots[0].scene?.elements).toEqual([marker])
  expect(read.mock.calls.map(([path]) => path)).toEqual([
    `raw/${room}/${session}/session.yaml`, `raw/${room}/events.jsonl`, `raw/${room}/board.excalidraw`,
  ])
  expect(snapshots[0].issues.filter(issue => issue.code === 'workspace-uninitialised')).toEqual([])
  expect(snapshots[0].issues.some(issue => issue.code === 'local-storage-non-authoritative')).toBe(true)
  expect([...snapshots[0].evidenceByOccurrence.values()]).toMatchObject([
    { ref: 'board:fluid-thermo-lab', status: 'unsupported', target: null },
  ])
  expect(screen.queryByText('Workspace non inizializzato')).toBeNull()
  expect(screen.getByRole('link', { name: /Ripristina continuita/ }).getAttribute('href')).toContain(room)
  expect(Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!).map(key => [key, localStorage.getItem(key)])).toEqual(before)
})

it('rejects an invalid session before initializing or reading the workspace', async () => {
  const { workspaceStore, ContinuityView } = await fixture()
  at(room, 'invalid')
  const init = vi.spyOn(workspaceStore, 'init'), read = vi.spyOn(workspaceStore, 'read')
  render(<ContinuityView />)
  await screen.findByText('Identificatore sessione non valido')
  expect(init).not.toHaveBeenCalled(); expect(read).not.toHaveBeenCalled()
})

it('shows a bootstrap failure as an unavailable source, not an empty session', async () => {
  const { workspaceStore, ContinuityView, loadSnapshot } = await fixture()
  vi.spyOn(workspaceStore, 'init').mockRejectedValue(new Error('storage unavailable'))
  const read = vi.spyOn(workspaceStore, 'read')
  render(<ContinuityView deps={{ loadSnapshot }} />)
  await waitFor(() => expect(screen.getAllByText('Factory workspace rifiutata')).toHaveLength(3))
  expect(read).not.toHaveBeenCalled()
  expect(screen.queryByText('Nessun fatto da ricomporre')).toBeNull()
})

it('keeps loading until initialization completes and abandons reads after unmount', async () => {
  const { workspaceStore, ContinuityView, snapshots, loadSnapshot } = await fixture()
  const gate = deferred<'localStorage'>()
  const init = vi.spyOn(workspaceStore, 'init').mockReturnValue(gate.promise)
  const read = vi.spyOn(workspaceStore, 'read')
  const view = render(<ContinuityView deps={{ loadSnapshot }} />)
  await waitFor(() => expect(init).toHaveBeenCalledTimes(1))
  expect(document.querySelector('[data-continuity-phase="loading"]')).toBeTruthy()
  expect(read).not.toHaveBeenCalled()
  view.unmount()
  await act(async () => { gate.resolve('localStorage') })
  await waitFor(() => expect(snapshots).toHaveLength(1))
  expect(read).not.toHaveBeenCalled()
  expect(document.querySelector('[data-continuity-phase]')).toBeNull()
})

it('does not let a late old-room bootstrap paint over a newly mounted scope', async () => {
  const { workspaceStore, ContinuityView, snapshots, loadSnapshot } = await fixture()
  const originalInit = workspaceStore.init.bind(workspaceStore)
  const gate = deferred<'localStorage'>()
  const init = vi.spyOn(workspaceStore, 'init').mockImplementationOnce(() => gate.promise).mockImplementation(originalInit)
  const view = render(<ContinuityView deps={{ loadSnapshot }} />)
  await waitFor(() => expect(init).toHaveBeenCalledTimes(1))
  at('other-room')
  view.rerender(<ContinuityView key="other-room" deps={{ loadSnapshot }} />)
  await waitFor(() => expect(snapshots).toHaveLength(1))
  expect(snapshots[0].scene?.elements[0].text).toBe('Must not appear')
  const painted = document.body.textContent
  await act(async () => { gate.resolve('localStorage') })
  await waitFor(() => expect(snapshots).toHaveLength(2))
  expect(document.body.textContent).toBe(painted)
  expect(snapshots[1].scene).toBeNull()
})
