// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { isInkUndoTarget } from '../sceneBoundary'
test('native math-field and text controls keep their own undo inside an ink Room', () => {
  const room = document.createElement('div')
  room.dataset.inkRoom = 'lesson'
  const canvas = document.createElement('canvas'), field = document.createElement('math-field')
  const input = document.createElement('textarea')
  const child = document.createElement('span')
  field.append(child)
  room.append(canvas, field, input)
  expect(isInkUndoTarget(canvas, 'lesson')).toBe(true)
  expect(isInkUndoTarget(input, 'lesson')).toBe(false)
  expect(isInkUndoTarget(field, 'lesson')).toBe(false)
  expect(isInkUndoTarget(child, 'lesson')).toBe(false)
  expect(isInkUndoTarget(canvas, 'other')).toBe(false)
})
