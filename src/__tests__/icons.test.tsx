// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import {
  IconLink, IconFunction, IconImage, IconMic, IconMicOff,
  IconDot, IconDownload, IconArrowUpRight, IconCheck, IconAlert,
} from "../design/icons"

const ALL: [string, any][] = [
  ["Link", IconLink],
  ["Function", IconFunction],
  ["Image", IconImage],
  ["Mic", IconMic],
  ["MicOff", IconMicOff],
  ["Dot", IconDot],
  ["Download", IconDownload],
  ["ArrowUpRight", IconArrowUpRight],
  ["Check", IconCheck],
  ["Alert", IconAlert],
]

describe("10 icone ink", () => {
  it.each(ALL)("%s render con viewBox 24", (name, Icon) => {
    const { container } = render(<Icon />)
    const svg = container.querySelector("svg")
    expect(svg, `${name} svg`).toBeTruthy()
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24")
    const sw = parseFloat(svg!.getAttribute("stroke-width") ?? "0")
    if (name !== "Dot") {
      expect(svg!.getAttribute("stroke"), `${name} stroke`).toBe("currentColor")
      expect(sw, `${name} strokeWidth`).toBeCloseTo(1.75, 2)
    }
    expect(svg!.getAttribute("aria-hidden")).toBe("true")
  })

  it("ogni icona ha contenuto SVG", () => {
    for (const [, Icon] of ALL) {
      const { container } = render(<Icon />)
      const svg = container.querySelector("svg")!
      expect(svg.innerHTML).toBeTruthy()
    }
  })

  it("IconDot è filled (non none)", () => {
    const { container } = render(<IconDot />)
    const svg = container.querySelector("svg")!
    expect(svg.getAttribute("fill")).toBe("currentColor")
    expect(svg.getAttribute("stroke")).toBe("none")
  })
})
