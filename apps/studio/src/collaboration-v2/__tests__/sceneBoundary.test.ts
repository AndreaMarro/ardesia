import { expect, test } from 'vitest'
import { CompletedInkCapture, legacyBoardScene } from '../sceneBoundary'
const pdf = { id: 'pdf', type: 'image' }, old = { id: 'old', type: 'freedraw' }
const fresh = { id: 'new', type: 'freedraw' }
const personal = { id: 'private', type: 'freedraw', customData: { ardesiaInkV1: { scope: 'alice-personal' } } }
const peer = { id: 'peer', type: 'freedraw', customData: { ardesiaInkV1: { scope: 'bob-shared' } } }
test('capture uses the attachment baseline even though pointerDown already contains the new stroke', () => {
  const capture = new CompletedInkCapture([pdf, old])
  // Excalidraw 0.18.1 inserts fresh before its public onPointerDown callback.
  const pointerDownScene = [pdf, old, fresh, peer]
  expect(capture.completed(pointerDownScene)).toEqual([fresh])
  expect(capture.completed(pointerDownScene)).toEqual([])
})
test('personal, pending and peer projections never enter legacy board/journal, regardless of owner/adapter', () => {
  expect(legacyBoardScene([pdf, old, personal, peer])).toEqual([pdf, old])
  expect(legacyBoardScene([pdf, old, fresh, personal, peer], new Set(['old']))).toEqual([pdf, old])
  expect(legacyBoardScene([pdf, old, fresh])).toEqual([pdf, old, fresh])
})
