// @vitest-environment node

import { describe, expect, it } from "vitest"
import {
  parseBreadboardHole,
  parseBreadboardRail,
  reaches,
  reachesDirectlyWithoutRails,
  sameTie,
  straddlesCenterGap,
} from "../../sim/breadboard/geometry.ts"
describe("breadboard geometry", () => {
  it("parses holes and rails into stable breadboard topology groups", () => {
    expect(parseBreadboardHole("bb1:i9")).toEqual({ boardId: "bb1", letter: "i", tie: 9, block: "top" })
    expect(parseBreadboardHole("bb1:e3")).toEqual({ boardId: "bb1", letter: "e", tie: 3, block: "bottom" })
    expect(parseBreadboardRail("bb1:bus-top-plus-9")).toEqual({
      boardId: "bb1",
      rail: "bus-top-plus",
      index: 9,
    })
    expect(straddlesCenterGap("bb1:f3", "bb1:e3")).toBe(true)
    expect(sameTie("bb1:i3", "bb1:f3")).toBe(true)
    expect(sameTie("bb1:f3", "bb1:e3")).toBe(false)
  })

  it("connects rail/tie paths without bridging the center gap", () => {
    const circuit = { pinAssignments: { "r1:a": "bb1:f3" }, wires: [{ from: "supply:+", to: "bb1:g3" }] }
    expect(reaches("supply:+", "r1:a", circuit)).toBe(true)
    expect(reaches("supply:+", "bb1:e3", circuit)).toBe(false)
    expect(reachesDirectlyWithoutRails("supply:+", "r1:a", circuit)).toBe(true)
  })
})
