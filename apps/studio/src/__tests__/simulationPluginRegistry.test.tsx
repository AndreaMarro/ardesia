// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { buildSimulationInsert, normalizeDuplicatedToolEmbeds, parseToolLink, renderToolCanvasEmbeddable } from "../toolhost/ToolCanvasEmbeddable"
import { getSimulationTool, registerSimulationTool } from "../toolhost/simulationPluginRegistry"
import { buildDefaultPluginWindowCatalog, createPluginWindowInsertRequest, type PluginWindowCatalogItem } from "../design/pluginWindowCatalog"
import { createPostitFromPluginWindowInsert } from "../design/multiPostitWorkbenchModel"
import { createPluginPostitBoardScene, restorePluginPostitsFromBoardScene } from "../design/multiPostitBoardPersistence"
import { manifest as referenceManifest } from "../../plugins/reference/manifest"


describe("independent plugin dispatch after product removal", () => {
  it("old plugin and disguised simulator aliases cannot mount or insert", () => {
    for (const id of ["io.elab.tutor", "io.ardesia.simulation", "io.ardesia.simulation-plugin"]) {
      expect(() => registerSimulationTool(id, { embedId: "blocked", render: () => null, createEmbed: () => ({ id: "blocked", type: "embeddable" }) })).toThrow(/retired plugin/)
      expect(getSimulationTool(id)).toBeUndefined()
      expect(buildSimulationInsert([], id)).toBeNull()
      const html = renderToStaticMarkup(renderToolCanvasEmbeddable({ link: `maestro-tool://${id}/old` })!)
      expect(html).toContain("Plugin non disponibile")
      expect(html).not.toContain("<svg")
    }
    expect(buildDefaultPluginWindowCatalog().some((item) => item.pluginId === "io.elab.tutor" || item.pluginId === "io.ardesia.simulation")).toBe(false)
  })

  it("preserves the independent reference identity through registration, insertion and cold restore", () => {
    const id = referenceManifest.id
    expect(id).toBe("io.maestro.plugin-ref")
    // The retired renderer used this alias too. Its replacement must be explicit,
    // never a side effect of importing the host or the retained reference manifest.
    expect(getSimulationTool(id)).toBeUndefined()
    expect(buildSimulationInsert([], id)).toBeNull()
    const unavailable = renderToStaticMarkup(renderToolCanvasEmbeddable({ link: `maestro-tool://${id}/saved-reference` })!)
    expect(unavailable).toContain("Plugin non disponibile")
    expect(unavailable).not.toContain("<svg")

    const render = vi.fn(() => <div>Independent Arduino reference</div>)
    expect(() => registerSimulationTool(id, {
      embedId: "reference-a",
      render,
      createEmbed: (embedId = "reference-a") => ({ id: embedId, type: "embeddable", link: `maestro-tool://${id}/${embedId}` }),
    })).not.toThrow()
    const insert = buildSimulationInsert([], id)!
    expect(parseToolLink(insert.embed.link as string)).toEqual({ toolId: id, embedId: "reference-a" })
    renderToolCanvasEmbeddable(insert.embed)
    expect(render).toHaveBeenCalledWith(insert.embed, { toolId: id, embedId: "reference-a" }, undefined)

    const referenceItem: PluginWindowCatalogItem = {
      id, pluginId: id, title: referenceManifest.name,
      description: "Retained independent SDK example",
      kind: "user-created", source: "user", readiness: "ready", availability: "available",
      version: referenceManifest.version, publisher: referenceManifest.publisher.id,
      lessonOs: { eventType: "plugin.insert.requested", evidenceRef: `plugin:${id}@${referenceManifest.version}` },
    }
    const item = buildDefaultPluginWindowCatalog({ userCreated: [referenceItem] }).find((entry) => entry.pluginId === id)
    expect(item).toEqual(referenceItem)
    const postit = createPostitFromPluginWindowInsert(createPluginWindowInsertRequest(item!), [])
    const saved = JSON.parse(JSON.stringify(createPluginPostitBoardScene([postit])))
    const restored = restorePluginPostitsFromBoardScene(saved)
    expect(restored).toEqual([postit])
    expect(restored[0].pluginId).toBe(referenceManifest.id)
    expect(restored[0].instanceId).toBe(postit.instanceId)
    expect(restored[0].pluginState.evidenceRef).toBe(`plugin:${id}@${referenceManifest.version}`)
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
