// @vitest-environment jsdom
// Simulation LessonOS append rejection must surface a visible diagnostic (F-02).
// The delay/rejection lives IN THE TEST doubles, never in production.
import { describe, it, expect, vi } from "vitest"
import { reportLessonOsAppendResult } from "../lessonos/reportAppend"

describe("reportLessonOsAppendResult (F-02)", () => {
  it("append rejected -> visible didactic-memory persistence error", async () => {
    const setStorageError = vi.fn()
    await reportLessonOsAppendResult(
      Promise.reject(new Error("storage giù")),
      setStorageError,
    )
    expect(setStorageError).toHaveBeenCalledTimes(1)
    expect(setStorageError.mock.calls[0][0]).toMatch(/memoria didattica|didactic.memory|persist/i)
  })

  it("append resolved -> no diagnostic", async () => {
    const setStorageError = vi.fn()
    await reportLessonOsAppendResult(Promise.resolve({ ok: true }), setStorageError)
    expect(setStorageError).not.toHaveBeenCalled()
  })
})
