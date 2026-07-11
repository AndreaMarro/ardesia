// @vitest-environment jsdom
//
// P0-C — multi-istanza del Simulation Plugin sulla lavagna (post-it multipli):
// oggi l'inserimento da toolbar (Room.insertSimulationPlugin) è un SINGLETON
// sull'embedId fisso REFERENCE_SIM_EMBED_ID — il secondo click seleziona
// l'esistente invece di creare una nuova istanza. Lo stato vive già
// per-elemento (customData[EMBED_DATA_KEY]), quindi il collo di bottiglia è
// SOLO identità: embedId unico per inserimento e link coerente con l'id.
//
// Invarianti falsificabili:
//   1. il primo inserimento usa l'embedId storico (scene salvate/e2e invariati);
//   2. gli inserimenti successivi generano id NUOVI, mai collisioni;
//   3. il link maestro-tool:// di ogni istanza punta al SUO embedId
//      (round-trip parseToolLink) — altrimenti il render dispatcherebbe
//      lo stato di un'altra istanza;
//   4. gli stati delle istanze sono oggetti indipendenti (nessuna condivisione
//      per riferimento: un tap su A non deve mutare B).

import { describe, expect, it } from "vitest"
import {
  ARDUINO_TOOLCHAIN_EMBED_ID,
  ARDUINO_TOOLCHAIN_TOOL_ID,
  ELABTUTOR_LINKED_EMBED_ID,
  ELABTUTOR_LINKED_TOOL_ID,
  REFERENCE_SIM_EMBED_ID,
  REFERENCE_SIM_TOOL_ID,
  buildArduinoToolchainInsert,
  buildElabTutorLinkedInsert,
  buildSimulationInsert,
  createToolEmbedElement,
  nextSimulationEmbedId,
  parseToolLink,
} from "../toolhost/ToolCanvasEmbeddable"
import { getSimulationTool } from "../toolhost/simulationPluginRegistry"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"

const BASE = REFERENCE_SIM_EMBED_ID

describe("nextSimulationEmbedId (identità per istanza)", () => {
  it("scena libera → embedId storico; occupato → suffissi progressivi senza collisioni", () => {
    expect(nextSimulationEmbedId([], BASE)).toBe(BASE)
    const second = nextSimulationEmbedId([BASE], BASE)
    expect(second).not.toBe(BASE)
    const third = nextSimulationEmbedId([BASE, second], BASE)
    expect(third).not.toBe(BASE)
    expect(third).not.toBe(second)
  })

  it("non pesca MAI un id già presente in scena, nemmeno con buchi nella numerazione", () => {
    const taken = [BASE, `${BASE}--3`]
    const next = nextSimulationEmbedId(taken, BASE)
    expect(taken).not.toContain(next)
  })
})

describe("createToolEmbedElement con embedId esplicito", () => {
  it("id e link restano coerenti: parseToolLink(element.link).embedId === element.id", () => {
    const el = createToolEmbedElement({ embedId: "istanza-2" })
    expect(el.id).toBe("istanza-2")
    const link = parseToolLink((el as { link?: string }).link)
    expect(link).not.toBeNull()
    expect(link!.toolId).toBe(REFERENCE_SIM_TOOL_ID)
    expect(link!.embedId).toBe("istanza-2")
  })
})

describe("registry: createEmbed(embedId) per istanze multiple", () => {
  it("l'entry del Simulation Plugin crea embed con l'id richiesto (link incluso)", () => {
    const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID)!
    const el = entry.createEmbed("istanza-registry-2")
    expect(el.id).toBe("istanza-registry-2")
    const link = parseToolLink((el as { link?: string }).link as string)
    expect(link!.embedId).toBe("istanza-registry-2")
  })
})

describe("buildSimulationInsert (logica inserimento Room, pura)", () => {
  it("due inserimenti consecutivi = due istanze con id diversi e stati indipendenti", () => {
    const first = buildSimulationInsert([])!
    expect(first.embedId).toBe(BASE)

    const scene = [first.embed]
    const second = buildSimulationInsert(scene)!
    expect(second.embedId).not.toBe(first.embedId)

    // stati indipendenti: la mutazione dello stato di A non tocca B
    const stateOf = (el: Record<string, unknown>) =>
      ((el.customData as Record<string, unknown>)[EMBED_DATA_KEY] as { state: Record<string, unknown> }).state
    const a = stateOf(first.embed)
    const b = stateOf(second.embed)
    expect(a).not.toBe(b)
    ;(a as Record<string, unknown>).__tap = "solo-A"
    expect((b as Record<string, unknown>).__tap).toBeUndefined()
  })
})

describe("buildArduinoToolchainInsert (PluginInstance autonoma)", () => {
  it("crea post-it Toolchain con id/link owner propri, separati da Simulation", () => {
    const insert = buildArduinoToolchainInsert([])!
    expect(insert.embedId).toBe(ARDUINO_TOOLCHAIN_EMBED_ID)
    const link = parseToolLink((insert.embed as { link?: string }).link)
    expect(link).toEqual({ toolId: ARDUINO_TOOLCHAIN_TOOL_ID, embedId: ARDUINO_TOOLCHAIN_EMBED_ID })
    const marker = ((insert.embed.customData as Record<string, unknown>)[EMBED_DATA_KEY] as { owner: string; state: { kind: string; project: { fqbn: string } } })
    expect(marker.owner).toBe(ARDUINO_TOOLCHAIN_TOOL_ID)
    expect(marker.state.kind).toBe("arduino-toolchain-v1")
    expect(marker.state.project.fqbn).toBe("arduino:avr:nano:cpu=atmega328old")
  })
})

describe("buildElabTutorLinkedInsert (PluginInstance autonoma)", () => {
  it("crea un post-it ElabTutor separato collegato via PluginLink pubblico", () => {
    const insert = buildElabTutorLinkedInsert([])!
    expect(insert.embedId).toBe(ELABTUTOR_LINKED_EMBED_ID)
    const link = parseToolLink((insert.embed as { link?: string }).link)
    expect(link).toEqual({ toolId: ELABTUTOR_LINKED_TOOL_ID, embedId: ELABTUTOR_LINKED_EMBED_ID })
    const marker = ((insert.embed.customData as Record<string, unknown>)[EMBED_DATA_KEY] as {
      owner: string
      state: { kind: string; links: { simulationInstanceId: string; toolchainInstanceId: string } }
    })
    expect(marker.owner).toBe(ELABTUTOR_LINKED_TOOL_ID)
    expect(marker.state.kind).toBe("elabtutor-linked-v1")
    expect(marker.state.links).toEqual({
      simulationInstanceId: REFERENCE_SIM_EMBED_ID,
      toolchainInstanceId: ARDUINO_TOOLCHAIN_EMBED_ID,
    })
  })
})
