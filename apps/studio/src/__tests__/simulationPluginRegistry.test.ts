// @vitest-environment node
// Simulation Plugin — registry di dispatch (toolId → {render, createEmbed, validate})
// Sostituisce il Set letterale referenceToolIds: registrare un toolId lo rende
// dispatchabile; toolId sconosciuto → nessun render del tool (deny-by-default).

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  getSimulationTool,
  registerSimulationTool,
} from "../toolhost/simulationPluginRegistry"
import {
  REFERENCE_PLUGIN_REF_ID,
  REFERENCE_SIM_EMBED_ID,
  REFERENCE_SIM_TOOL_ID,
  TOOL_EMBED_SCHEME,
  createReferenceSimulationScene,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"

describe("simulationPluginRegistry", () => {
  it("i tool reference sono registrati al load del modulo ToolCanvasEmbeddable", () => {
    expect(getSimulationTool(REFERENCE_SIM_TOOL_ID)).toBeDefined()
    expect(getSimulationTool(REFERENCE_PLUGIN_REF_ID)).toBeDefined()
    expect(getSimulationTool(REFERENCE_SIM_TOOL_ID)!.embedId).toBe(REFERENCE_SIM_EMBED_ID)
  })

  it("toolId sconosciuto → nessuna entry (deny-by-default)", () => {
    expect(getSimulationTool("io.malicious.unknown-tool")).toBeUndefined()
  })

  it("createEmbed della entry produce l'embeddable del tool (id = embedId)", () => {
    const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)!
    const embed = entry.createEmbed()
    expect(embed.id).toBe(REFERENCE_SIM_EMBED_ID)
    expect(embed.type).toBe("embeddable")
  })

  it("validate della entry accetta la scena di riferimento", () => {
    const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)!
    expect(entry.validate).toBeDefined()
    expect(entry.validate!(createReferenceSimulationScene())).toEqual({ ok: true, errors: [] })
  })

  it("registrare un toolId nuovo lo rende dispatchabile da renderToolCanvasEmbeddable", () => {
    const toolId = "io.test.custom-sim"
    registerSimulationTool(toolId, {
      embedId: "custom-embed-1",
      render: () => createElement("div", null, "CUSTOM-TOOL-MARKER"),
      createEmbed: () => ({ id: "custom-embed-1", type: "embeddable" }),
    })
    const view = renderToolCanvasEmbeddable({
      link: `${TOOL_EMBED_SCHEME}${toolId}/custom-embed-1`,
    })
    expect(view).not.toBeNull()
    expect(renderToStaticMarkup(view!)).toContain("CUSTOM-TOOL-MARKER")
  })

  it("toolId non registrato: card 'tool sconosciuto', MAI il render di un tool registrato", () => {
    const view = renderToolCanvasEmbeddable({
      link: `${TOOL_EMBED_SCHEME}io.unknown.tool/embed-x`,
    })
    expect(view).not.toBeNull()
    const html = renderToStaticMarkup(view!)
    // non deve dispatchare al tool reference
    expect(html).not.toContain("Accendi il tuo primo LED")
    expect(html).toContain("io.unknown.tool")
  })

  it("link non maestro-tool → null (comportamento preservato)", () => {
    expect(renderToolCanvasEmbeddable(createToolEmbedElement({ link: "https://example.test/x" }))).toBeNull()
  })
})
