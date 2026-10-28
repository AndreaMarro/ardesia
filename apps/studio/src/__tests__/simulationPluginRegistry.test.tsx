// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { buildSimulationInsert, normalizeDuplicatedToolEmbeds, parseToolLink, renderToolCanvasEmbeddable } from "../toolhost/ToolCanvasEmbeddable"
import { getSimulationTool, registerSimulationTool } from "../toolhost/simulationPluginRegistry"
import { buildDefaultPluginWindowCatalog } from "../design/pluginWindowCatalog"

describe("independent plugin dispatch after product removal", () => {
  it("old plugin and disguised simulator aliases cannot mount or insert", () => {
    for (const id of ["io.elab.tutor", "io.ardesia.simulation", "io.ardesia.simulation-plugin", "io.maestro.plugin-ref"]) {
      expect(() => registerSimulationTool(id, { embedId: "blocked", render: () => null, createEmbed: () => ({ id: "blocked", type: "embeddable" }) })).toThrow(/retired plugin/)
      expect(getSimulationTool(id)).toBeUndefined()
      expect(buildSimulationInsert([], id)).toBeNull()
      const html = renderToStaticMarkup(renderToolCanvasEmbeddable({ link: `maestro-tool://${id}/old` })!)
      expect(html).toContain("Plugin non disponibile")
      expect(html).not.toContain("<svg")
    }
    expect(buildDefaultPluginWindowCatalog().some((item) => item.pluginId === "io.elab.tutor" || item.pluginId === "io.ardesia.simulation")).toBe(false)
  })

  it("registered independent tools receive their instance and host unchanged", () => {
    const id = "org.test.independent-science"
    const render = vi.fn(() => <div>Independent science</div>)
    registerSimulationTool(id, {
      embedId: "science-a",
      render,
      createEmbed: (embedId = "science-a") => ({ id: embedId, type: "embeddable", link: `maestro-tool://${id}/${embedId}` }),
    })
    const inserted = buildSimulationInsert([{ id: "science-a" }], id)!
    expect(inserted.embedId).toBe("science-a--2")
    const host = { persistEmbedState: vi.fn() }
    renderToolCanvasEmbeddable(inserted.embed, host)
    expect(render).toHaveBeenCalledWith(inserted.embed, { toolId: id, embedId: "science-a--2" }, host)
  })

  it("duplicate normalization keeps state isolated and preserves unrelated elements", () => {
    const original = { id: "copy", link: "maestro-tool://org.test.science/original", customData: { scene: { value: 1 } } }
    const plain = { id: "plain", link: null }
    const result = normalizeDuplicatedToolEmbeds([original, plain])
    expect(result.changed).toBe(true)
    expect(parseToolLink(result.elements[0].link)).toEqual({ toolId: "org.test.science", embedId: "copy" })
    expect(result.elements[0].customData).toEqual(original.customData)
    expect(result.elements[0].customData).not.toBe(original.customData)
    expect(result.elements[1]).toBe(plain)
    expect(parseToolLink("https://example.test")).toBeNull()
  })
})
