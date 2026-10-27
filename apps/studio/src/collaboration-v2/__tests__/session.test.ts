import { expect, test } from 'vitest'
import { InkSession, type InkTransport } from '../session'
import type { InkObject, LayerScope } from '../model'
const scope: LayerScope = { v: 1, roomId: 'room', ownerId: 'alice', audience: 'shared',
  source: { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 } }
const stroke = (id: string): InkObject => ({ v: 1, id, authorId: 'alice', source: { ...scope.source, page: 1 },
  kind: 'stroke', points: [[.1, .1, 1], [.2, .2, 1]], color: '#123456', width: .003 })
test('offline writes are pending; lost-response retries retain their request id', async () => {
  const session = new InkSession(scope); session.add(stroke('a'))
  expect(session.state().status).toBe('offline')
  expect(session.checkpoint().committed.update).not.toEqual(session.checkpoint().pending!.update)
  const ids: string[] = []
  const transport: InkTransport = { submit: async request => { ids.push(request.requestId); throw Error('offline') } }
  await session.flush(transport); await session.flush(transport)
  expect(ids[0]).toBe(ids[1]); expect(session.state().pending).toBe(true)
})
test('a late ack commits only its submitted version and never clears a newer pending stroke', async () => {
  const session = new InkSession(scope); session.add(stroke('a'))
  let complete!: () => void
  const transport: InkTransport = { submit: request => new Promise(resolve => {
    complete = () => resolve({ requestId: request.requestId, scope: request.scope, update: request.update })
  }) }
  const flushing = session.flush(transport); session.add(stroke('b')); complete(); await flushing
  expect(session.state().pending).toBe(true)
  expect(session.committedObjects().map(item => item.id)).toEqual(['a'])
  expect(session.objects().map(item => item.id)).toEqual(['a', 'b'])
})
test('revocation during an open request rejects late ack and all subsequent local writes', async () => {
  const session = new InkSession(scope); session.add(stroke('a'))
  let complete!: () => void
  const flushing = session.flush({ submit: request => new Promise(resolve => {
    complete = () => resolve({ requestId: request.requestId, scope: request.scope, update: request.update })
  }) })
  session.revoke(); complete(); await flushing
  expect(session.state().status).toBe('revoked'); expect(session.committedObjects()).toEqual([])
  expect(() => session.add(stroke('b'))).toThrow('ink_read_only')
  expect(session.checkpoint().pending).not.toBeNull()
})
test('a forged scope ack is never treated as committed, and permission refusal stops retries', async () => {
  const session = new InkSession(scope); session.add(stroke('a'))
  await session.flush({ submit: async request => ({ ...request, scope: { ...scope, ownerId: 'bob' } }) })
  expect(session.committedObjects()).toEqual([]); expect(session.state().status).toBe('error')
  await session.flush({ submit: async () => { throw Object.assign(Error('forbidden'), { status: 403 }) } })
  expect(session.state().status).toBe('revoked')
})

test('cold reopen retains the exact idempotency key after an unconfirmed request', async () => {
  const session = new InkSession(scope); session.add(stroke('a'))
  let original = ''
  await session.flush({ submit: async request => { original = request.requestId; throw Error('response lost') } })
  const reopened = new InkSession(scope, session.checkpoint())
  let restored = ''
  await reopened.flush({ submit: async request => { restored = request.requestId; return request } })
  expect(restored).toBe(original); expect(reopened.state().pending).toBe(false)
})

test('cold retry after undo sends the exact unconfirmed bytes and accepts the original receipt', async () => {
  const session = new InkSession(scope); session.add(stroke('a')); session.undo()
  let receipt!: import('../session').InkRequest
  await session.flush({ submit: async request => { receipt = request; throw Error('response lost') } })
  const reopened = new InkSession(scope, session.checkpoint())
  await reopened.flush({ submit: async request => {
    expect(request.requestId).toBe(receipt.requestId)
    expect(request.update).toEqual(receipt.update)
    return receipt
  } })
  expect(reopened.state().status).toBe('committed')
})
