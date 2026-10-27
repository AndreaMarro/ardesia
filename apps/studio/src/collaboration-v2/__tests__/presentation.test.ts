import { expect, test } from 'vitest'
import { PresentationFollower, presentationPoint } from '../presentation'
import type { PresentationFocus, RoomPresentationAdapter } from '../presentation'
const source = { resourceId: 'pdf', revisionId: 'v1', sha256: 'a'.repeat(64), pageCount: 2 }
const focus = (sequence = 1, page = 2): PresentationFocus => ({ channelId: 'lesson-focus', sequence,
  target: { v: 1, roomId: 'room', source, page, center: [.25, .75] } })
const adapter = (value = focus()): RoomPresentationAdapter => ({ channelId: value.channelId, focus: value })
test('following is opt-in and duplicate/reordered focuses do not move the personal view', () => {
  const follower = new PresentationFollower('room', source)
  expect(follower.receive(adapter())).toBeNull()
  expect(follower.setFollowing(true)).toEqual(focus().target)
  expect(follower.receive(adapter())).toBeNull()
  expect(follower.receive(adapter(focus(0)))).toBeNull()
  expect(follower.receive(adapter(focus(2, 1)))?.page).toBe(1)
  follower.setFollowing(false)
  expect(follower.receive(adapter(focus(3)))).toBeNull()
  expect(follower.setFollowing(true)?.page).toBe(2)
})
test('focus during an active gesture waits for completion and takes only the latest target', () => {
  const follower = new PresentationFollower('room', source)
  follower.receive(adapter()); follower.setFollowing(true); follower.beginInteraction()
  expect(follower.receive(adapter(focus(2, 1)))).toBeNull()
  expect(follower.receive(adapter(focus(3, 2)))).toBeNull()
  expect(follower.endInteraction()).toEqual(focus(3, 2).target)
  expect(follower.endInteraction()).toBeNull()
})
test('new presentation channel requires fresh consent; revocation rejects all later movement', () => {
  const follower = new PresentationFollower('room', source)
  follower.receive(adapter()); follower.setFollowing(true)
  expect(follower.receive(adapter({ ...focus(), channelId: 'other-presentation' }))).toBeNull()
  expect(follower.isFollowing).toBe(false)
  follower.setFollowing(true); follower.revoke()
  expect(follower.receive(adapter(focus(4)))).toBeNull()
  expect(follower.setFollowing(true)).toBeNull()
  expect(follower.isFollowing).toBe(false)
})
test('source/page/channel/coordinate validation rejects a focus before changing camera policy', () => {
  const follower = new PresentationFollower('room', source)
  const cases: PresentationFocus[] = [
    { ...focus(), channelId: 'wrong' }, { ...focus(), sequence: NaN },
    { ...focus(), target: { ...focus().target, roomId: 'other' } },
    { ...focus(), target: { ...focus().target, source: { ...source, revisionId: 'v2' } } },
    { ...focus(), target: { ...focus().target, page: 3 } },
    { ...focus(), target: { ...focus().target, center: [Infinity, .5] } },
  ]
  for (const value of cases) expect(() => follower.receive({ channelId: 'lesson-focus', focus: value })).toThrow('ink_focus_mismatch')
  const value = focus(); follower.receive(adapter(value)); value.target.center[0] = 1
  expect(follower.setFollowing(true)?.center).toEqual([.25, .75])
  expect(presentationPoint(focus().target, { page: 2, x: 100, y: 924, width: 600, height: 800 })).toEqual({ x: 250, y: 1524 })
  expect(() => presentationPoint(focus().target, { page: 1, x: 0, y: 0, width: 600, height: 800 })).toThrow('ink_focus_mismatch')
})
test('temporarily absent focus never makes an older sequence current again', () => {
  const follower = new PresentationFollower('room', source)
  follower.receive(adapter(focus(8))); follower.setFollowing(true)
  follower.receive({ channelId: 'lesson-focus', focus: null })
  follower.setFollowing(false)
  follower.receive(adapter(focus(3, 1)))
  expect(follower.setFollowing(true)).toBeNull()
  expect(follower.receive(adapter(focus(9)))?.page).toBe(2)
})
test('missing channel identifiers are not coerced into valid string identifiers', () => {
  const follower = new PresentationFollower('room', source)
  expect(() => follower.receive({ focus: null } as unknown as RoomPresentationAdapter)).toThrow('ink_focus_mismatch')
})
test('ten participants and a presenter preserve independent views under reordered focus and an active gesture', () => {
  const group = Array.from({ length: 11 }, () => new PresentationFollower('room', source))
  for (const [index, follower] of group.entries()) {
    follower.receive(adapter(focus(0)))
    if (index > 0) follower.setFollowing(true)
  }
  group[3].setFollowing(false); group[4].beginInteraction(); group[5].revoke()
  const movements = group.map(() => [] as number[])
  for (const sequence of [9, 3, 9, 10, 7, 12, 11]) {
    const value = focus(sequence); value.target.center[0] = sequence / 100
    for (const [index, follower] of group.entries()) {
      const target = follower.receive(adapter(value))
      if (target) movements[index].push(target.center[0])
    }
  }
  for (const index of [0, 3, 4, 5]) expect(movements[index]).toEqual([])
  for (const index of [1, 2, 6, 7, 8, 9, 10]) expect(movements[index]).toEqual([.09, .1, .12])
  expect(group[4].endInteraction()?.center[0]).toBe(.12)
  expect(group[5].setFollowing(true)).toBeNull()
})
