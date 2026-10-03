// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import { roomIdFromHash, roomPaths } from '../store/roomPaths'
import { continuityLessonIdFromLocation } from '../store/continuityView'
import { viewHref } from '../design/ViewNav'
import { UNASSIGNED_LESSON_ID } from '../lessonos/eventlog'

afterEach(() => window.history.replaceState(null, '', '/'))
it('keeps access on links while filesystem and continuity receive only the lesson identity', () => {
  const fragment = '#shared-room&sync=http%3A%2F%2F127.0.0.1%3A4318&access=private-grant'
  for (const surface of ['lezione', 'continuita', 'materiali'] as const) {
    const href = viewHref(surface, fragment)
    window.history.replaceState(null, '', href)
    expect(continuityLessonIdFromLocation()).toBe('shared-room')
    expect(roomPaths(roomIdFromHash(window.location.hash)).scene).toBe('raw/shared-room/board.excalidraw')
    expect(window.location.hash).toBe(fragment)
  }
})
it.each(['#x&something=1', '#x&access=a', '#x&access=a&access=b&sync=c', '#../other&sync=x&access=y', '#x&sync=&access=y'])('rejects malformed shared scope %s', hash => {
  expect(() => roomIdFromHash(hash)).toThrow()
})
it('ordinary and reserved lesson boundary behavior remains unchanged', () => {
  expect(roomIdFromHash('#ordinary')).toBe('ordinary')
  window.history.replaceState(null, '', `/?vista=continuita#${UNASSIGNED_LESSON_ID}&sync=x&access=y`)
  expect(continuityLessonIdFromLocation()).toBe(null)
})
