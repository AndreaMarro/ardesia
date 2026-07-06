// Bridge ElabScene (circuit-scene/2, schema congelato) → SimulationSceneV1
// (formato che il renderer reale disegna). Chiude il round-trip "schema →
// renderer" per le scene reali: PRIMA di questo file l'adapter aveva come
// unici consumer i test.
//
// Regole:
// - ADDITIVO: createReferenceSimulationScene resta intatta; questo modulo
//   traduce, non reinventa (pinAssignments/wires copiati 1:1).
// - FAIL-CLOSED: senza geometria autorata completa il bridge rifiuta — non
//   inventa layout che poi sembrerebbero "dal libro".
// - ONESTO: candidate→draft (mai gonfiare la provenance), Vf del LED dalla
//   tabella del motore (engineLedForwardVoltsForColor), non auto-dichiarato.
import { createSimulationAdapterPayloadFromElabScene } from "../../sim/elab/elabSceneAdapter"
import { engineLedForwardVoltsForColor } from "../../sim/solver/elabSolver"
import { parseBreadboardRef } from "../../sim/breadboard/simulationBreadboard"
import type { SimulationSceneV1 } from "./ToolCanvasEmbeddable"

export type ElabSceneBridgeOptions = {
  title: string
  chapter: string
  bookText: string
  bookInstructions: string[]
  bookQuote: string
  manualCrop?: string | null
  manualFinalCrop?: string | null
}

type BridgeComponentType = SimulationSceneV1["components"][number]["type"]

const COMPONENT_TYPES: ReadonlySet<string> = new Set([
  "battery9v",
  "breadboard-half",
  "nano-r4",
  "resistor",
  "led",
  "builtin-led",
] satisfies BridgeComponentType[])

function componentLabel(component: { type: string; value?: string | number; color?: string }): string {
  switch (component.type) {
    case "battery9v":
      return "Batteria 9V"
    case "breadboard-half":
      return "Breadboard"
    case "resistor":
      return component.value !== undefined ? `Resistore ${component.value} Ohm` : "Resistore"
    case "led":
      return component.color !== undefined ? `LED ${component.color}` : "LED"
    default:
      return component.type
  }
}

function statusFromProvenance(status: string): "draft" | "reviewed" | "verified" {
  // candidate e ogni stato non-promosso restano draft: il bridge non è un
  // canale di promozione. verified richiede il gate umano già avvenuto a monte.
  if (status === "verified") return "verified"
  if (status === "reviewed") return "reviewed"
  return "draft"
}

function bookLayoutEndpoint(ref: string): {
  ref: string
  componentId: string
  pin: string
  target: string
  targetKind: "breadboard-hole" | "internal-net"
} {
  const parsed = parseBreadboardRef(ref)
  const separator = ref.indexOf(":")
  const componentId = separator === -1 ? ref : ref.slice(0, separator)
  const pin = separator === -1 ? ref : ref.slice(separator + 1)
  if (parsed !== null) {
    return { ref, componentId, pin, target: ref, targetKind: "breadboard-hole" }
  }
  return { ref, componentId, pin, target: pin, targetKind: "internal-net" }
}

export function simulationSceneFromElabScene(
  input: unknown,
  options: ElabSceneBridgeOptions,
): SimulationSceneV1 {
  const payload = createSimulationAdapterPayloadFromElabScene(input)
  const scene = input as {
    book: { volume: number; pages: number[] }
    provenance: { status: string; sourceRef?: string }
  }

  const volume = scene.book.volume
  if (volume !== 1 && volume !== 2 && volume !== 3) {
    throw new Error(`volume fuori catalogo manuali: ${volume}`)
  }
  const page = Math.min(...scene.book.pages)

  const components = payload.circuit.components.map((component) => {
    if (!COMPONENT_TYPES.has(component.type)) {
      throw new Error(`tipo componente non renderizzabile: ${component.type} (id ${component.id})`)
    }
    const numericValue = typeof component.value === "number" ? component.value : undefined
    return {
      id: component.id,
      type: component.type as BridgeComponentType,
      label: componentLabel(component),
      ...(numericValue !== undefined ? { value: numericValue } : {}),
      ...(component.color !== undefined ? { color: component.color } : {}),
      ...(component.type === "resistor" || component.type === "led" ? { anchor: "bb1" } : {}),
    }
  })

  const layout: SimulationSceneV1["layout"] = {}
  for (const component of payload.circuit.components) {
    const pose = payload.geometry.componentPoses[component.id]
    if (pose === undefined) {
      throw new Error(`pose mancante per ${component.id}: il bridge non inventa layout`)
    }
    layout[component.id] = { x: pose.x, y: pose.y }
  }

  const battery = payload.circuit.components.find((component) => component.type === "battery9v")
  const resistor = payload.circuit.components.find((component) => component.type === "resistor")
  const led = payload.circuit.components.find((component) => component.type === "led")
  if (!battery || !resistor || !led || typeof resistor.value !== "number") {
    throw new Error("scena non battery-led: il bridge v1 supporta solo il circuito batteria+resistore+LED")
  }

  const status = statusFromProvenance(scene.provenance.status)

  const connections: SimulationSceneV1["connections"] = payload.circuit.wires.map((wire) => ({
    from: wire.from,
    to: wire.to,
    color: wire.color,
    kind: "wire" as const,
  }))

  return {
    v: 1,
    experimentId: payload.experimentId,
    title: options.title,
    manual: {
      volume,
      page,
      chapter: options.chapter,
      label: `${payload.sourceLabel} - ESPERIMENTO`,
      bookText: options.bookText,
      bookInstructions: [...options.bookInstructions],
      bookQuote: options.bookQuote,
    },
    components,
    pinAssignments: { ...payload.circuit.pinAssignments },
    connections,
    layout,
    bookLayout: {
      v: 1,
      experimentId: payload.experimentId,
      volume,
      page,
      status,
      manualSource: {
        pdf: `VOLUMI pdf e MD/MANUALE VOLUME ${volume} ITALIANO 2.pdf`,
        pdfPage: page,
        textSource: scene.provenance.sourceRef ?? "",
        crop: options.manualCrop ?? null,
        finalCrop: options.manualFinalCrop ?? null,
        blocker:
          "Scena bridgata da circuit-scene/2 (fixture reale): il bookLayout è speculare alla scena, la verifica indipendente resta bookConstraints+electrical sul formato sorgente.",
      },
      components: payload.circuit.components.map((component) => ({
        id: component.id,
        type: component.type as BridgeComponentType,
        expected: layout[component.id]!,
        tolerancePx: 0,
      })),
      pins: Object.entries(payload.circuit.pinAssignments).map(([pinRef, holeRef]) => {
        const endpoint = bookLayoutEndpoint(pinRef)
        return { ...endpoint, target: holeRef, targetKind: "breadboard-hole" as const }
      }),
      wires: payload.circuit.wires.map((wire) => ({
        id: `wire-${wire.id}`,
        from: bookLayoutEndpoint(wire.from),
        to: bookLayoutEndpoint(wire.to),
        color: wire.color,
        kind: "wire" as const,
      })),
      // Nessuna regola spaziale autorata dal libro per questa scena: lista
      // vuota onesta, non regole inventate.
      spatialRules: [],
      tolerances: { coordinatePx: 0, relationPx: 2 },
    },
    runtime: {
      kind: "battery-led",
      supplyVolts: 9,
      resistorOhms: resistor.value,
      ledForwardVolts: engineLedForwardVoltsForColor(led.color ?? null),
      ledOn: true,
    },
    compile: { sketchKind: "none", targetFqbn: null, provider: "none" },
    provenance: {
      lessonPath: `packs/elab-tutor/data/lesson-paths/${payload.experimentId}.json`,
      experimentData: "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json",
      volumeReference: "packs/elab-tutor/data/volume-references.js",
      status,
      blocker:
        status === "verified"
          ? ""
          : "Scena reale candidate: promozione a verified = gate umano (canon §3); visualMatch assente.",
    },
  }
}
