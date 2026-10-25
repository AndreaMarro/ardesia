// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import ReplayObjectFocus from "../ReplayObjectFocus"
afterEach(cleanup)
describe("replay object focus follows an exact recorded version", () => {
  const target = { elementId: "formula", version: 3, label: "Pressione fissata" }
  const element = { id: "formula", version: 3, x: 100, y: 50, width: 80, height: 20, angle: 0 }
  it("shows the linked object's bounds after pan and zoom without changing the scene", () => {
    render(<ReplayObjectFocus scene={[element]} target={target} viewport={{ scrollX: -20, scrollY: 10, zoom: 2 }} />)
    const focus = screen.getByRole("img", { name: "Oggetto collegato evidenziato: Pressione fissata" })
    expect(focus.style.left).toBe("152px"); expect(focus.style.top).toBe("112px")
    expect(focus.style.width).toBe("176px"); expect(focus.style.height).toBe("56px")
    expect(element).toEqual({ id: "formula", version: 3, x: 100, y: 50, width: 80, height: 20, angle: 0 })
  })
  it("does not substitute a later object version for the linked historical version", () => {
    render(<ReplayObjectFocus scene={[{ ...element, version: 4 }]} target={target} viewport={{ scrollX: 0, scrollY: 0, zoom: 1 }} />)
    expect(screen.queryByRole("img")).toBeNull()
  })
  it("encloses a rotated object rather than drawing the old unrotated box", () => {
    render(<ReplayObjectFocus scene={[{ ...element, angle: Math.PI / 2 }]} target={target} viewport={{ scrollX: 0, scrollY: 0, zoom: 1 }} />)
    const focus = screen.getByRole("img")
    expect(focus.style.left).toBe("122px"); expect(focus.style.top).toBe("12px")
    expect(Number.parseFloat(focus.style.width)).toBeCloseTo(36)
    expect(Number.parseFloat(focus.style.height)).toBeCloseTo(96)
  })
})
