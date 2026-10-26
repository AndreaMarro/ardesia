// @vitest-environment jsdom
import { expect, test, vi } from 'vitest'
// jsdom lacks canvas; only the import-time feature probe/measurement port is shimmed.
vi.hoisted(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { configurable: true, value: () => ({
    filter: 'none', font: '', measureText: (text: string) => ({ width: text.length * 10 }),
  }) })
})
import { restoreElements } from '@excalidraw/excalidraw'
import { projectInk } from '../canvasBinding'
import type { InkObject, LayerScope } from '../model'
const scope: LayerScope = { v: 1, roomId: 'room', ownerId: 'alice', audience: 'shared',
  source: { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 1 } }
for (const kind of ['formula', 'proposal'] as const) test(`single-anchor ${kind} survives the real Excalidraw restore`, () => {
  const item: InkObject = { v: 1, id: 'text', authorId: 'alice', source: { ...scope.source, page: 1 }, kind,
    color: '#123456', width: .003, points: [[.2, .3, 1]], text: 'F = k x', ...(kind === 'proposal' ? { targetId: 'student-stroke' } : {}) }
  const projected = projectInk(item, scope, { x: 100, y: 100, width: 600, height: 800, page: 1 })
  const restored = restoreElements([projected] as unknown as Parameters<typeof restoreElements>[0], null)
  expect(restored).toHaveLength(1)
  expect(restored[0].width).toBeGreaterThan(0); expect(restored[0].height).toBeGreaterThan(0)
  expect(restored[0].customData?.ardesiaInkV1).toMatchObject({ objectId: 'text', authorId: 'alice', page: 1, revisionId: 'v1' })
})
