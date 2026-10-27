// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { InkLayer } from '../layer'
import { readInkCheckpoint, writeInkCheckpoint } from '../persistence'
import { WorkspaceStore } from '../../store/WorkspaceStore'
import type { LayerScope } from '../model'
const scope: LayerScope = { v: 1, roomId: 's07-persistence', ownerId: 'alice', audience: 'personal',
  source: { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 } }
test('WorkspaceStore cold reopen preserves committed and pending separately and rejects scope substitution', async () => {
  const store = new WorkspaceStore(); await store.init()
  const layer = new InkLayer(scope)
  const committed = layer.snapshot()
  layer.add({ v: 1, id: 'stroke', authorId: 'alice', source: { ...scope.source, page: 2 },
    kind: 'stroke', points: [[.1, .1, 1], [.2, .2, 1]], color: '#123456', width: .004 })
  await writeInkCheckpoint(store, { v: 1, scope, committed, pending: layer.snapshot(), pendingRequestId: '12345678-abcd-abcd-abcd-123456789012' })
  const cold = new WorkspaceStore(); await cold.init()
  const result = (await readInkCheckpoint(cold, scope))!
  expect(InkLayer.restore(scope, result.committed).objects()).toEqual([])
  expect(InkLayer.restore(scope, result.pending!).objects()[0].source.page).toBe(2)
  expect(await readInkCheckpoint(cold, { ...scope, ownerId: 'bob' })).toBeNull()
  const writes: string[] = []
  await expect(writeInkCheckpoint({ write: async path => { writes.push(path) } },
    { ...result, pending: { ...result.pending!, scope: { ...scope, ownerId: 'bob' } } })).rejects.toThrow('ink_scope_mismatch')
  expect(writes).toEqual([])
})
