// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
