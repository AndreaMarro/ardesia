import { expect, test } from 'vitest'
import { InkLayer } from '../layer'
import { InkSession } from '../session'
import { validateRoomInkAdapter, type RoomInkAdapter } from '../roomAdapter'
import type { LayerScope } from '../model'

test('Room accepts equal source fields independently of deserialization property order', () => {
  const source = { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 1 }
  const reversed = { pageCount: 1, sha256: 'a'.repeat(64), revisionId: 'v1', resourceId: 'pdf' }
  const base = { v: 1 as const, roomId: 'room', ownerId: 'alice', source }
  const personal = new InkSession({ ...base, audience: 'personal' })
  const shared = new InkSession({ ...base, source: reversed, audience: 'shared' })
  const peerScope: LayerScope = { ...base, source: reversed, ownerId: 'bob', audience: 'shared' }
  const peer = new InkLayer(peerScope)
  const adapter: RoomInkAdapter = { roomId: 'room', sessions: { personal, shared },
    peers: [peer], pages: [{ page: 1, x: 100, y: 100, width: 600, height: 800 }], signal: new AbortController().signal }
  expect(() => validateRoomInkAdapter(adapter)).not.toThrow()
  const wrongPeer = new InkLayer({ ...peerScope, source: { ...source, revisionId: 'v2' } })
  expect(() => validateRoomInkAdapter({ ...adapter, peers: [wrongPeer] })).toThrow('ink_scope_mismatch')
  expect(() => validateRoomInkAdapter({ ...adapter, pages: [] })).toThrow('ink_scope_mismatch')
  personal.destroy(); shared.destroy(); peer.destroy(); wrongPeer.destroy()
})
