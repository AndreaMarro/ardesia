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
  // Pagina del manuale che la figura/crop ritrae quando diversa dalla prima
  // pagina dell'esperimento (es. testo a p29, figura a p30).
  manualFigurePage?: number
}

type BridgeComponentType = SimulationSceneV1["components"][number]["type"]

const COMPONENT_TYPES: ReadonlySet<string> = new Set([
  "battery9v",
  "breadboard-half",
  "nano-r4",
  "resistor",
  "led",
  "builtin-led",
  // Multi-pin (NOTTE-15, per v1-cap9-esp6): il catalogo elettrico li ha già
  // (#140), qui escono dal fail-closed di bridge+renderer.
  "potentiometer",
  "rgb-led",
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
    case "potentiometer":
      return component.value !== undefined ? `Potenziometro ${component.value} Ohm` : "Potenziometro"
    case "rgb-led":
      return "LED RGB"
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

function bridgeWirePath(
  wireId: string,
  path: { kind: "polyline" | "bezier"; points: ReadonlyArray<{ x: number; y: number }> },
): NonNullable<SimulationSceneV1["connections"][number]["path"]> {
  // FAIL-CLOSED: il renderer disegna solo polyline byte-identiche. Una bezier
  // autorata non va ne' droppata ne' convertita in silenzio.
  if (path.kind !== "polyline") {
    throw new Error(`wire path kind non renderizzabile byte-identico: ${path.kind} (wire ${wireId})`)
  }
  return { kind: "polyline", points: path.points.map((point) => ({ ...point })) }
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
      ...(component.type === "resistor" ||
      component.type === "led" ||
      component.type === "potentiometer" ||
      component.type === "rgb-led"
        ? { anchor: "bb1" }
        : {}),
    }
  })

  const layout: SimulationSceneV1["layout"] = {}
  for (const component of payload.circuit.components) {
    const pose = payload.geometry.componentPoses[component.id]
    if (pose === undefined) {
      throw new Error(`pose mancante per ${component.id}: il bridge non inventa layout`)
    }
    // F5-12 — la rotazione dichiarata dalla scena NON si butta.
    //
    // Prima qui c'era `{ x: pose.x, y: pose.y }`, e `pose.rotationDeg` finiva
    // nel nulla — mentre `SimulationLayout` ha il campo `rotation?: number` da
    // prima di questa unita'. Il dato c'era, il campo c'era, e nessuno li univa.
    //
    // Costo del difetto, dichiarato dalla provenienza delle fixture stesse:
    // «visualMatch resta unknown FINCHE' IL RENDERER NON CONSUMA QUESTA
    // ROTAZIONE». Con la rotazione persa, `visualMatch` non poteva passare da
    // `unknown` per NESSUNA delle 88 scene, e la promozione candidate->verified
    // era bloccata per costruzione, non per mancanza di lavoro.
    //
    // Lo zero NON viene propagato: una rotazione di 0 non e' una rotazione, e
    // scriverla renderebbe indistinguibile «non ruotato» da «ruotato di zero».
    layout[component.id] = {
      x: pose.x,
      y: pose.y,
      ...(pose.rotationDeg !== 0 ? { rotation: pose.rotationDeg } : {}),
    }
  }

  const battery = payload.circuit.components.find((component) => component.type === "battery9v")
  const resistor = payload.circuit.components.find((component) => component.type === "resistor")
  const led = payload.circuit.components.find((component) => component.type === "led")
  // Scene multi-pin (pot/RGB): il verdetto per canale NON è pre-dichiarabile
  // in un runtime statico — arriva dal motore MNA reale sui dati della scena
  // (runtime "elab-mna"). Le scene battery-led restano sul percorso storico.
  const multiPin = payload.circuit.components.some(
    (component) => component.type === "potentiometer" || component.type === "rgb-led",
  )
  if (!battery || (!led && !multiPin)) {
    throw new Error(
      "scena non battery-led: il bridge supporta circuiti batteria+LED (con o senza resistore) o batteria+multi-pin (potenziometro/LED RGB)",
    )
  }
  if (multiPin && !payload.circuit.components.some((component) => component.type === "rgb-led")) {
    throw new Error("scena multi-pin senza LED RGB: nessun runtime onesto disponibile")
  }
  for (const candidate of payload.circuit.components) {
    if (candidate.type === "resistor" && typeof candidate.value !== "number") {
      throw new Error("resistore senza valore numerico: il bridge non inventa resistenze")
    }
  }

  const status = statusFromProvenance(scene.provenance.status)

  const connections: SimulationSceneV1["connections"] = payload.circuit.wires.map((wire) => {
    const authoredPath = payload.geometry.wirePaths[wire.id]
    return {
      from: wire.from,
      to: wire.to,
      color: wire.color,
      kind: "wire" as const,
      ...(authoredPath !== undefined
        ? { path: bridgeWirePath(wire.id, authoredPath) }
        : {}),
    }
  })

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
        ...(options.manualFigurePage !== undefined ? { figurePage: options.manualFigurePage } : {}),
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
    runtime: multiPin
      ? {
          // Multi-pin: nessun valore pre-dichiarato — correnti e stato canali
          // escono dal solve MNA reale nel renderer (fail-visible sugli errori).
          kind: "elab-mna",
          supplyVolts: 9,
        }
      : resistor !== undefined
        ? {
            kind: "battery-led",
            supplyVolts: 9,
            resistorOhms: resistor.value as number,
            ledForwardVolts: engineLedForwardVoltsForColor(led!.color ?? null),
            ledOn: true,
          }
        : {
            // Scena SENZA resistore (dimostrazione "cosa NON fare", Vol.1
            // p.32): il runtime dichiara l'esito onesto del motore — LED
            // bruciato per sovracorrente, mai "acceso".
            kind: "battery-led-senza-resistore",
            supplyVolts: 9,
            ledForwardVolts: engineLedForwardVoltsForColor(led!.color ?? null),
            ledOn: false,
          },
    compile: { sketchKind: "none", targetFqbn: null, provider: "none" },
    provenance: {
      lessonPath: `packs/elab-tutor/data/lesson-paths/${payload.experimentId}.json`,
      // Path della fixture derivato dall'id (convenzione: id senza trattini),
      // mai hardcoded su un solo esperimento.
      experimentData: `apps/studio/sim/fixtures/elab-scene-v2-candidate-${payload.experimentId.replace(/-/g, "")}.json`,
      volumeReference: "packs/elab-tutor/data/volume-references.js",
      status,
      blocker:
        status === "verified"
          ? ""
          : "Scena reale candidate: promozione a verified = gate umano (canon §3); visualMatch assente.",
    },
  }
}
