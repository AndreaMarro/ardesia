// @vitest-environment node
// Simulation Plugin — registry di dispatch (toolId → {render, createEmbed, validate})
// Sostituisce il Set letterale referenceToolIds: registrare un toolId lo rende
// dispatchabile; toolId sconosciuto → nessun render del tool (deny-by-default).

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import {
  getSimulationTool,
  registerSimulationTool,
} from "../toolhost/simulationPluginRegistry"
import {
  LEGACY_REFERENCE_SIM_TOOL_ID,
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
    expect(getSimulationTool(LEGACY_REFERENCE_SIM_TOOL_ID)).toBeDefined()
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
    expect(embed.link).toBe(`${TOOL_EMBED_SCHEME}${REFERENCE_SIM_TOOL_ID}/${REFERENCE_SIM_EMBED_ID}`)
    expect((embed.customData as Record<string, { owner: string }>)[EMBED_DATA_KEY]?.owner).toBe(REFERENCE_SIM_TOOL_ID)
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

  it("saved links legacy restano renderizzabili via alias del registry", () => {
    const view = renderToolCanvasEmbeddable({
      link: `${TOOL_EMBED_SCHEME}${LEGACY_REFERENCE_SIM_TOOL_ID}/${REFERENCE_SIM_EMBED_ID}`,
    })
    expect(view).not.toBeNull()
    expect(renderToStaticMarkup(view!)).toContain("Accendi il tuo primo LED")
  })

  // ── Fase 2 simulature: motore elettrico dietro il registry (confine P2) ──

  it("entry registrata senza solve → solve undefined (deny-by-default sul solve)", () => {
    const toolId = "io.test.no-solver"
    registerSimulationTool(toolId, {
      embedId: "no-solver-embed",
      render: () => null,
      createEmbed: () => ({ id: "no-solver-embed", type: "embeddable" }),
    })
    expect(getSimulationTool(toolId)!.solve).toBeUndefined()
  })

  it("il reference tool espone solve: golden 15.3 mA dal motore reale via dispatch del registry", () => {
    const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)
    expect(entry?.solve).toBeDefined()
    // Stessa topologia della scena reference (Vol.1 cap.6 esp.1):
    // 9V → strip f2-j2 → R470 (i2→i9) → LED rosso (f9→e9) → strip a9-e9 → GND.
    const result = entry!.solve!({
      components: [
        { id: "bat1", type: "battery9v" },
        { id: "bb1", type: "breadboard-half" },
        { id: "r1", type: "resistor", value: 470 },
        { id: "led1", type: "led", color: "red" },
      ],
      connections: [
        { from: "bat1:positive", to: "bb1:j2" },
        { from: "bat1:negative", to: "bb1:a9" },
      ],
      pinAssignments: {
        "r1:pin1": "bb1:i2",
        "r1:pin2": "bb1:i9",
        "led1:anode": "bb1:f9",
        "led1:cathode": "bb1:e9",
      },
    })
    expect(result.ok).toBe(true)
    expect(result.componentStates.led1?.on).toBe(true)
    expect(result.currents.led1).toBeCloseTo(0.0153, 3)
  })
})
