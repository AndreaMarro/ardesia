import { expect, test } from 'vitest'
import { captureInkStroke, projectInk, applyInkProjection } from '../canvasBinding'
import type { LayerScope } from '../model'
const scope: LayerScope = { v: 1, roomId: 'room', ownerId: 'alice', audience: 'shared',
  source: { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 } }
const page = { x: 100, y: 200, width: 600, height: 800, page: 2 }
test('stroke coordinates roundtrip on the exact page without scroll/zoom in shared data', () => {
  const item = captureInkStroke({ id: 'stroke', type: 'freedraw', x: 160, y: 360,
    points: [[0, 0], [120, 240]], pressures: [.2, .8], strokeColor: '#123456', strokeWidth: 2 }, scope, page)
  expect(item.points).toEqual([[.1, .2, .2], [.3, .5, .8]])
  const projected = projectInk(item, scope, { ...page, x: 1000, y: 2000 })
  expect(projected).toMatchObject({ x: 1060, y: 2160 })
  expect(projected.points![1][0]).toBeCloseTo(120, 10)
  expect(projected.points![1][1]).toBeCloseTo(240, 10)
  expect(() => projectInk(item, scope, { ...page, page: 1 })).toThrow('ink_page_mismatch')
})
test('projection keeps PDF and unrelated elements; a removed ink stroke is removed without moving peers', () => {
  const item = captureInkStroke({ id: 'stroke', type: 'freedraw', x: 160, y: 360,
    points: [[0, 0], [120, 240]], strokeColor: '#123456', strokeWidth: 2 }, scope, page)
  const ink = projectInk(item, scope, page)
  const pdf = { id: 'pdf-page-2', type: 'image', x: 100, y: 200 }
  const untouched = { id: 'ordinary-note', type: 'text', x: 22, y: 33 }
  expect(applyInkProjection([pdf, untouched, ink], [], [scope])).toEqual([pdf, untouched])
  expect(applyInkProjection([pdf, untouched], [ink], [scope])).toEqual([pdf, untouched, ink])
})
test('cross-page, rotated and incomplete strokes are refused instead of clipped or relocated', () => {
  const input = { id: 'stroke', type: 'freedraw', x: 99, y: 200, points: [[0, 0], [2, 2]], strokeColor: '#123456', strokeWidth: 2 }
  expect(() => captureInkStroke(input, scope, page)).toThrow('ink_invalid_object')
  expect(() => captureInkStroke({ ...input, x: 100, angle: .2 }, scope, page)).toThrow('ink_unsupported_geometry')
})
