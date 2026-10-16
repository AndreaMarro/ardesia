// @vitest-environment jsdom

import { createElement } from "react"
import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { createMultiPostitWorkbenchPostits } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene } from "../design/multiPostitBoardPersistence"
import { renderPluginPostitBoardEmbeddable } from "../toolhost/pluginPostitBoardRender"

afterEach(cleanup)

type RenderInput = Parameters<typeof renderPluginPostitBoardEmbeddable>[0]

describe("Board post-it renderer link identity", () => {
  it.each([
    { name: "another instance", link: "maestro-tool://io.ardesia.simulation/another-instance" },
    { name: "another plugin", link: "maestro-tool://io.other.plugin/plugin-postit-sim-a-board" },
    { name: "an empty link", link: "" },
    { name: "a numeric link from JSON", link: 42 },
    { name: "an object link from JSON", link: { href: "maestro-tool://io.ardesia.simulation/sim-a" } },
    { name: "an array link from JSON", link: [] },
  ])("rejects $name even when the marker owner and board ID are valid", ({ link }) => {
    const [element] = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits()).elements
    const input = { ...element, link } as unknown as RenderInput
    const before = JSON.stringify(input)

    expect(() => renderPluginPostitBoardEmbeddable(input)).toThrow(
      "plugin post-it board link mismatch for sim-a",
    )
    expect(JSON.stringify(input)).toBe(before)
  })

  it.each(["canonical", "null", "absent"] as const)(
    "keeps the real Simulation and consumer cards when the link is %s",
    (profile) => {
      const scene = createPluginPostitBoardScene(createMultiPostitWorkbenchPostits())
      const inputs = scene.elements.map((element) => {
        if (profile === "canonical") return element
        if (profile === "null") return { ...element, link: null }
        const { link: ignored, ...normalized } = element
        void ignored
        return normalized
      })
      const before = JSON.stringify(inputs)
      const cards = inputs.map((element) => renderPluginPostitBoardEmbeddable(element))
      expect(cards.every((card) => card !== null)).toBe(true)
      const { container } = render(createElement("div", null, ...cards))

      expect(
        Array.from(container.querySelectorAll("[data-plugin-postit-instance]")).map((node) =>
          node.getAttribute("data-plugin-postit-instance"),
        ),
      ).toEqual(["sim-a", "sim-b", "elab-consumer"])
      expect(container.querySelectorAll('[data-plugin-postit-plugin="io.ardesia.simulation"]')).toHaveLength(2)
      expect(container.querySelector('[data-elabtutor-simulation-instance]')?.getAttribute(
        "data-elabtutor-simulation-instance",
      )).toBe("sim-a")
      expect(JSON.stringify(inputs)).toBe(before)
    },
  )
})
