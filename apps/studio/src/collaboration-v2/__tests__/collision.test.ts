// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { WorkspaceStore } from '../../store/WorkspaceStore'

test('existing whole-scene persistence loses a competing stroke on the same synthetic PDF', async () => {
  const a = new WorkspaceStore(), b = new WorkspaceStore()
  await a.init(); await b.init()
  const source = { resourceId: 'synthetic-pdf', revisionId: 'pdf-v1', page: 1 }
  await a.saveScene('s07-collision', JSON.stringify({ source, elements: [{ id: 'pdf-page-1', type: 'image' }] }))
  const seenA = JSON.parse((await a.loadScene('s07-collision'))!)
  const seenB = JSON.parse((await b.loadScene('s07-collision'))!)
  seenA.elements.push({ id: 'stroke-a', type: 'freedraw' })
  seenB.elements.push({ id: 'stroke-b', type: 'freedraw' })
  await a.saveScene('s07-collision', JSON.stringify(seenA))
  await b.saveScene('s07-collision', JSON.stringify(seenB))
  expect(JSON.parse((await a.loadScene('s07-collision'))!).elements.map((e: {id:string}) => e.id))
    .toEqual(['pdf-page-1', 'stroke-b'])
})
