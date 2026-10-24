import { describe, expect, it } from "vitest"
import { wrapPassageAnnotation } from "../store/passageAnnotation"
describe("readable teacher annotation", () => {
  it("wraps long prose without dropping its words or an explicit paragraph", () => {
    const text = "La differenza di pressione resta fissata mentre confrontiamo due raggi diversi del condotto.\nLa portata cambia."
    const lines = wrapPassageAnnotation(text).split("\n")
    expect(lines.every((line) => line.length <= 40)).toBe(true)
    expect(lines.join(" ").replace(/\s+/g, " ")).toBe(text.replace(/\s+/g, " "))
    expect(lines).toContain("La portata cambia.")
  })
  it("keeps a long unbroken token readable without losing characters", () => {
    const text = "Q".repeat(125)
    const lines = wrapPassageAnnotation(text).split("\n")
    expect(lines.every((line) => line.length <= 40)).toBe(true)
    expect(lines.join("")).toBe(text)
  })
})
