// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CollaborationToolbar } from '../CollaborationToolbar'
import { InkSession } from '../session'
import type { LayerScope } from '../model'
afterEach(cleanup)
const scope: LayerScope = { v: 1, roomId: 'room', ownerId: 'alice', audience: 'personal',
  source: { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 } }
test('toolbar reports pending honestly, scopes undo and exposes save failure', async () => {
  const session = new InkSession(scope)
  session.add({ v: 1, id: 'a', authorId: 'alice', source: { ...scope.source, page: 1 }, kind: 'stroke',
    color: '#123456', width: .003, points: [[.1, .1, 1], [.2, .2, 1]] })
  render(<CollaborationToolbar session={session} page={1} pageCount={2} onPage={() => {}}
    audience="personal" onAudience={() => {}} zoom={1} onZoom={() => {}} storageMode="localStorage"
    onSave={async () => { throw Error('quota') }} />)
  expect(screen.getByRole('status').textContent).toContain('in attesa di conferma')
  expect(screen.getByRole('status').textContent).toContain('remoto non attivo')
  fireEvent.click(screen.getByRole('button', { name: 'Annulla mio tratto' }))
  expect(session.objects()).toEqual([])
  fireEvent.click(screen.getByRole('button', { name: 'Salva su questo dispositivo' }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Salvataggio non riuscito. Mantieni aperta la lezione e riprova.')
  session.destroy()
})
test('a clean to pending to acknowledged edit cannot mark an older local write saved', async () => {
  const session = new InkSession(scope)
  let finishWrite!: () => void
  const write = new Promise<void>(resolve => { finishWrite = resolve })
  render(<CollaborationToolbar session={session} page={1} pageCount={2} onPage={() => {}}
    audience="personal" onAudience={() => {}} zoom={1} onZoom={() => {}} storageMode="localStorage"
    onSave={() => write} />)
  fireEvent.click(screen.getByRole('button', { name: 'Salva su questo dispositivo' }))
  await act(async () => {
    session.add({ v: 1, id: 'during-write', authorId: 'alice', source: { ...scope.source, page: 1 },
      kind: 'stroke', color: '#123456', width: .003, points: [[.1, .1, 1], [.2, .2, 1]] })
    // jsdom structuredClone is supplied by Node: decode bytes in the receiving realm.
    await session.flush({ submit: async request => ({ ...request, update: Uint8Array.from(request.update) }) })
  })
  expect(session.checkpoint().pendingRequestId).toBeNull()
  await act(async () => { finishWrite(); await write })
  expect(screen.getByRole('status').textContent).not.toContain('Copia salvata')
  expect(screen.getByRole('alert').textContent).toContain('Salva anche i nuovi tratti')
  session.destroy()
})
test('a host presentation action exposes pending and retry without changing ink', async () => {
  const session = new InkSession(scope)
  let calls = 0
  const action = { onPresent: () => { calls++ }, presenting: false }
  const props = { session, page: 1, pageCount: 2, onPage: () => {}, audience: 'personal' as const,
    onAudience: () => {}, zoom: 1.5, onZoom: () => {}, storageMode: 'localStorage' as const, onSave: async () => {} }
  const view = render(<CollaborationToolbar {...props} {...action} />)
  fireEvent.click(screen.getByRole('button', { name: 'Indica questo punto' }))
  expect(calls).toBe(1)
  view.rerender(<CollaborationToolbar {...props} {...action} presenting={true} />)
  expect(screen.getByRole('button', { name: 'Invio punto…' })).toHaveProperty('disabled', true)
  expect(session.objects()).toEqual([])
  view.rerender(<CollaborationToolbar {...props} />)
  expect(screen.queryByRole('button', { name: 'Indica questo punto' })).toBeNull()
  session.destroy()
})
