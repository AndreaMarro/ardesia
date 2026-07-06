/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState, type CSSProperties, type ReactElement } from "react";

import { ArduinoRuntime, LED_BUILTIN, SketchScheduler, blinkSketch } from "../../plugins/reference/arduino";
import { EMBED_DATA_KEY } from "./caps/board";
import {
  ELAB_BREADBOARD_POINT_COUNT,
  ELAB_BOTTOM_TERMINAL_ROWS,
  ELAB_TOP_TERMINAL_ROWS,
  areBreadboardRefsContinuous,
  breadboardGeometry,
  generateBreadboardPoints,
  isBreadboardRef,
  pointForBreadboardRef,
  solveSeriesLoop,
} from "../../sim/breadboard/simulationBreadboard";
import { registerSimulationTool, getSimulationTool, type SimulationToolHost } from "./simulationPluginRegistry";
import { solveElabExperiment } from "../../sim/solver/elabSolver";

type EmbedLike = {
  id?: string;
  link?: string | null;
  customData?: Record<string, unknown> | null;
};

type ToolLink = {
  toolId: string;
  embedId: string;
};

type SimulationComponent = {
  id: string;
  type: "battery9v" | "breadboard-half" | "nano-r4" | "resistor" | "led" | "builtin-led";
  label: string;
  anchor?: string;
  value?: number;
  color?: string;
};

type SimulationLayout = {
  x: number;
  y: number;
  rotation?: number;
  parentId?: string;
};

type BookLayoutEndpoint = {
  ref: string;
  componentId: string;
  pin: string;
  target: string;
  targetKind: "board-pin" | "breadboard-hole" | "internal-net";
  manualToken?: string;
};

type BookLayoutSpatialRule = {
  id: string;
  a: string;
  relation: "inside" | "right-of" | "below";
  b: string;
  minDelta?: number;
  tolerancePx?: number;
};

type BookLayoutComponent = {
  id: string;
  type: SimulationComponent["type"];
  expected: SimulationLayout;
  tolerancePx?: number;
};

type BookLayoutWire = {
  id: string;
  from: BookLayoutEndpoint;
  to: BookLayoutEndpoint;
  color: string;
  kind: "internal" | "wire";
};

type BookLayoutV1 = {
  v: 1;
  experimentId: string;
  volume: 1 | 2 | 3;
  page: number;
  status: "draft" | "reviewed" | "verified";
  manualSource: {
    pdf: string;
    pdfPage: number;
    figurePage?: number;
    textSource: string;
    crop: string | null;
    finalCrop?: string | null;
    blocker: string;
  };
  components: BookLayoutComponent[];
  pins: BookLayoutEndpoint[];
  wires: BookLayoutWire[];
  spatialRules: BookLayoutSpatialRule[];
  tolerances: {
    coordinatePx: number;
    relationPx: number;
  };
};

export type SimulationSceneV1 = {
  v: 1;
  experimentId: string;
  title: string;
  manual: {
    volume: 1 | 2 | 3;
    page: number;
    chapter: string;
    label: string;
    bookText: string;
    bookInstructions: string[];
    bookQuote: string;
  };
  components: SimulationComponent[];
  pinAssignments: Record<string, string>;
  connections: Array<{
    from: string;
    to: string;
    color: string;
    kind: "internal" | "wire";
    // Polyline autorata (schema circuit-scene/2): quando presente il renderer
    // la disegna byte-identica, senza risintetizzare curve.
    path?: { kind: "polyline"; points: Array<{ x: number; y: number }> };
  }>;
  layout: Record<string, SimulationLayout>;
  bookLayout: BookLayoutV1;
  runtime:
    | {
        kind: "arduino-blink";
        ledPin: number;
        millis: number;
        ledOn: boolean;
      }
    | {
        kind: "battery-led";
        supplyVolts: number;
        resistorOhms: number;
        ledForwardVolts: number;
        ledOn: boolean;
      };
  compile: {
    sketchKind: "arduino-cpp" | "none";
    targetFqbn: string | null;
    provider: "local-agent" | "browser-avr" | "precompiled" | "none";
  };
  provenance: {
    lessonPath: string;
    experimentData: string;
    volumeReference: string;
    status: "draft" | "reviewed" | "verified";
    blocker: string;
  };
};

// I piazzamenti del montaggio libero viaggiano NELLO state dell'embed
// (slice 4, persistenza): sopravvivono a re-mount e save/load con la scena.
type SimulationToolState =
  | { kind: "simulation-scene-v1"; scene: SimulationSceneV1; montaggio?: MontaggioState }
  | { kind: "reference-blink"; ledOn?: boolean; millis?: number; montaggio?: MontaggioState };

export const TOOL_EMBED_SCHEME = "maestro-tool://";
export const REFERENCE_SIM_TOOL_ID = "io.ardesia.simulation-plugin";
export const REFERENCE_PLUGIN_REF_ID = "io.maestro.plugin-ref";
export const REFERENCE_SIM_EMBED_ID = "elab-v1-cap6-esp1-first-led";
export const REFERENCE_SIM_LINK = `${TOOL_EMBED_SCHEME}${REFERENCE_SIM_TOOL_ID}/${REFERENCE_SIM_EMBED_ID}`;
export const ELAB_V1_FIRST_LED_EXPERIMENT_ID = "v1-cap6-esp1";
export const ELAB_BLINK_EXPERIMENT_ID = "v3-cap5-esp1";
export const ELAB_EXTERNAL_LED_EXPERIMENT_ID = "v3-cap6-esp2";
export const ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE = "/elab/manuals/vol1/page-030-esercizio-6-1.png";
export const ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE = "/elab/manuals/vol1/page-031-esercizio-6-1.png";
export const ELAB_V3_CAP6_ESP2_MANUAL_PAGE_IMAGE = "/elab/manuals/vol3/page-051-esercizio-6-2.png";

export function parseToolLink(link: string | null | undefined): ToolLink | null {
  if (!link?.startsWith(TOOL_EMBED_SCHEME)) return null;
  try {
    const parsed = new URL(link);
    const embedId = parsed.pathname.replace(/^\/+/, "");
    if (!parsed.hostname || !embedId) return null;
    return { toolId: parsed.hostname, embedId };
  } catch {
    return null;
  }
}

export function createReferenceSimulationScene({
  ledOn = true,
}: {
  millis?: number;
  ledOn?: boolean;
} = {}): SimulationSceneV1 {
  return {
    v: 1,
    experimentId: ELAB_V1_FIRST_LED_EXPERIMENT_ID,
    title: "Accendi il tuo primo LED",
    manual: {
      volume: 1,
      page: 29,
      chapter: "Capitolo 6 - Cos'e il diodo LED?",
      label: "Vol. 1 pag. 29-31 - ESPERIMENTO 1",
      bookText: "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
      bookInstructions: [
        "Ragazzi, collegate la clip alla batteria e il positivo alla striscia rossa superiore della breadboard.",
        "Ragazzi, collegate il resistore da 470 Ohm tra la zona positiva e la parte destra della breadboard.",
        "Ragazzi, inserite il LED rosso a cavallo della separazione centrale: anodo verso il resistore, catodo sotto.",
        "Ragazzi, collegate il negativo della batteria nella stessa colonna della gambetta corta del LED.",
      ],
      bookQuote: "Il LED si e acceso! Bellissimo vero?",
    },
    components: [
      { id: "bat1", type: "battery9v", label: "Batteria 9V" },
      { id: "bb1", type: "breadboard-half", label: "Breadboard" },
      { id: "r1", type: "resistor", label: "Resistore 470 Ohm", value: 470, anchor: "bb1" },
      { id: "led1", type: "led", label: "LED rosso", color: "red", anchor: "bb1" },
    ],
    pinAssignments: {
      "r1:pin1": "bb1:i2",
      "r1:pin2": "bb1:i9",
      "led1:anode": "bb1:f9",
      "led1:cathode": "bb1:e9",
    },
    connections: [
      { from: "bat1:positive", to: "bb1:j2", color: "red", kind: "wire" },
      { from: "bat1:negative", to: "bb1:a9", color: "black", kind: "wire" },
    ],
    layout: {
      bat1: { x: 165, y: 45 },
      bb1: { x: 280, y: 10 },
      r1: { x: 331.5, y: 51.25 },
      led1: { x: 357.75, y: 72.5 },
    },
    bookLayout: {
      v: 1,
      experimentId: ELAB_V1_FIRST_LED_EXPERIMENT_ID,
      volume: 1,
      page: 29,
      status: "draft",
      manualSource: {
        pdf: "plugins/elab-tutor/public/volumes/volume1.pdf",
        pdfPage: 29,
        figurePage: 30,
        textSource: "plugins/elab-tutor/docs/volumi-originali/VOLUME-1-TESTO.txt",
        crop: ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
        finalCrop: ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
        blocker: "Pagine PDF reali Vol.1 p.30-31 montate; fori presi dal lesson-path v1-cap6-esp1 per correggere il drift rispetto a experiments-vol1.js.",
      },
      components: [
        { id: "bat1", type: "battery9v", expected: { x: 165, y: 45 }, tolerancePx: 0 },
        { id: "bb1", type: "breadboard-half", expected: { x: 280, y: 10 }, tolerancePx: 0 },
        { id: "r1", type: "resistor", expected: { x: 331.5, y: 51.25 }, tolerancePx: 0 },
        { id: "led1", type: "led", expected: { x: 357.75, y: 72.5 }, tolerancePx: 0 },
      ],
      pins: [
        { ref: "r1:pin1", componentId: "r1", pin: "pin1", target: "bb1:i2", targetKind: "breadboard-hole" },
        { ref: "r1:pin2", componentId: "r1", pin: "pin2", target: "bb1:i9", targetKind: "breadboard-hole" },
        { ref: "led1:anode", componentId: "led1", pin: "anode", target: "bb1:f9", targetKind: "breadboard-hole" },
        { ref: "led1:cathode", componentId: "led1", pin: "cathode", target: "bb1:e9", targetKind: "breadboard-hole" },
      ],
      wires: [
        {
          id: "wire-battery-positive",
          from: { ref: "bat1:positive", componentId: "bat1", pin: "positive", target: "battery-positive", targetKind: "internal-net" },
          to: { ref: "bb1:j2", componentId: "bb1", pin: "j2", target: "bb1:j2", targetKind: "breadboard-hole" },
          color: "red",
          kind: "wire",
        },
        {
          id: "wire-battery-negative",
          from: { ref: "bat1:negative", componentId: "bat1", pin: "negative", target: "battery-negative", targetKind: "internal-net" },
          to: { ref: "bb1:a9", componentId: "bb1", pin: "a9", target: "bb1:a9", targetKind: "breadboard-hole" },
          color: "black",
          kind: "wire",
        },
      ],
      spatialRules: [
        { id: "breadboard-right-of-battery", a: "bb1", relation: "right-of", b: "bat1", minDelta: 100 },
        { id: "resistor-right-of-battery", a: "r1", relation: "right-of", b: "bat1", minDelta: 150 },
        { id: "led-right-of-resistor", a: "led1", relation: "right-of", b: "r1", minDelta: 24 },
      ],
      tolerances: {
        coordinatePx: 0,
        relationPx: 2,
      },
    },
    runtime: {
      kind: "battery-led",
      supplyVolts: 9,
      resistorOhms: 470,
      ledForwardVolts: 2,
      ledOn,
    },
    compile: {
      sketchKind: "none",
      targetFqbn: null,
      provider: "none",
    },
    provenance: {
      lessonPath: "packs/elab-tutor/data/lesson-paths/v1-cap6-esp1.json",
      experimentData: "plugins/elab-tutor/src/data/experiments-vol1.js",
      volumeReference: "packs/elab-tutor/data/volume-references.js",
      status: "draft",
      blocker: "Scena derivata dal lesson-path ELABTutor con pagine PDF reali; experiments-vol1.js contiene un layout alternativo con piu fili/rail, quindi il pack resta draft finche il drift non viene normalizzato.",
    },
  };
}

export function validateBookLayoutScene(scene: SimulationSceneV1): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const componentIds = new Set(scene.components.map((component) => component.id));
  const bookLayout = scene.bookLayout;

  if (bookLayout.v !== 1) errors.push("bookLayout version drift");
  if (bookLayout.experimentId !== scene.experimentId) errors.push("bookLayout experimentId drift");
  if (bookLayout.volume !== scene.manual.volume || bookLayout.page !== scene.manual.page) {
    errors.push("bookLayout manual reference drift");
  }
  if (scene.experimentId !== ELAB_V1_FIRST_LED_EXPERIMENT_ID) errors.push("experimentId drift");
  if (scene.manual.volume !== 1 || scene.manual.page !== 29) errors.push("manual reference drift");

  for (const component of bookLayout.components) {
    if (!componentIds.has(component.id)) errors.push(`missing component ${component.id}`);
    const actual = scene.layout[component.id];
    if (!actual) {
      errors.push(`missing layout ${component.id}`);
      continue;
    }
    const tolerance = component.tolerancePx ?? bookLayout.tolerances.coordinatePx;
    if (Math.abs(actual.x - component.expected.x) > tolerance || Math.abs(actual.y - component.expected.y) > tolerance) {
      errors.push(`layout drift ${component.id}`);
    }
    if ((actual.parentId ?? null) !== (component.expected.parentId ?? null)) {
      errors.push(`layout parent drift ${component.id}`);
    }
  }

  for (const pin of bookLayout.pins) {
    if (!componentIds.has(pin.componentId)) errors.push(`pin component missing ${pin.componentId}`);
    if (pin.targetKind === "breadboard-hole" && !isBreadboardRef(pin.target)) {
      errors.push(`invalid breadboard hole ${pin.ref}`);
    }
    if (scene.pinAssignments[pin.ref] !== pin.target) {
      errors.push(`pin target drift ${pin.ref}`);
    }
  }

  for (const wire of bookLayout.wires) {
    const matchingConnection = scene.connections.find(
      (connection) =>
        connection.from === wire.from.ref &&
        connection.to === wire.to.ref &&
        connection.color === wire.color &&
        connection.kind === wire.kind,
    );
    if (!matchingConnection) errors.push(`wire drift ${wire.id}`);
  }

  for (const rule of bookLayout.spatialRules) {
    const a = scene.layout[rule.a];
    const b = scene.layout[rule.b];
    if (!a || !b) continue;
    const tolerance = rule.tolerancePx ?? bookLayout.tolerances.relationPx;
    const minDelta = rule.minDelta ?? 0;
    if (rule.relation === "inside" && a.parentId !== rule.b) {
      errors.push(`spatial drift ${rule.id}`);
    }
    if (rule.relation === "right-of" && a.x - b.x < minDelta - tolerance) {
      errors.push(`spatial drift ${rule.id}`);
    }
    if (rule.relation === "below" && a.y - b.y < minDelta - tolerance) {
      errors.push(`spatial drift ${rule.id}`);
    }
  }

  if (!areBreadboardRefsContinuous("bb1:j2", "bb1:i2")) {
    errors.push("ELAB breadboard terminal grammar drift");
  }
  if (areBreadboardRefsContinuous("bb1:f9", "bb1:e9")) {
    errors.push("breadboard central channel shorted");
  }
  if (scene.provenance.status === "verified" || bookLayout.status === "verified") {
    if (!bookLayout.manualSource.crop) errors.push("verified requires manual crop evidence");
    if (!bookLayout.manualSource.finalCrop) errors.push("verified requires final manual page evidence");
  }
  return { ok: errors.length === 0, errors };
}

export function createToolEmbedElement({
  link = REFERENCE_SIM_LINK,
  toolId = REFERENCE_SIM_TOOL_ID,
  embedId = REFERENCE_SIM_EMBED_ID,
  state = { kind: "simulation-scene-v1", scene: createReferenceSimulationScene() },
}: {
  link?: string;
  toolId?: string;
  embedId?: string;
  state?: unknown;
} = {}) {
  const updated = Date.now();

  return {
    id: embedId,
    type: "embeddable",
    x: 120,
    y: 90,
    width: 1180,
    height: 760,
    angle: 0,
    strokeColor: "#1f3f63",
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    roundness: { type: 3 },
    seed: 1733,
    version: 1,
    versionNonce: 1733001,
    index: null,
    isDeleted: false,
    groupIds: [],
    frameId: null,
    boundElements: null,
    updated,
    link,
    locked: false,
    customData: {
      [EMBED_DATA_KEY]: {
        owner: toolId,
        state,
      },
    },
  };
}

export function isToolCanvasEmbed(element: EmbedLike): boolean {
  return parseToolLink(element.link) !== null;
}

export function renderToolCanvasEmbeddable(
  element: EmbedLike,
  host?: SimulationToolHost,
): ReactElement | null {
  const toolLink = parseToolLink(element.link);
  if (!toolLink) return null;
  const entry = getSimulationTool(toolLink.toolId);
  if (entry) return entry.render(element, toolLink, host);
  return <UnknownToolCanvasTool toolLink={toolLink} />;
}

// Registrazione dei tool reference: il dispatch di renderToolCanvasEmbeddable e
// l'inserimento da toolbar (Room) passano ENTRAMBI dal registry, non da Set/id
// hard-codati. Tool non registrati non vengono mai dispatchati (deny-by-default).
const referenceSimulationEntry = {
  embedId: REFERENCE_SIM_EMBED_ID,
  render: (element: EmbedLike, toolLink: ToolLink, host?: SimulationToolHost) => (
    <ReferenceSimulationCanvasTool element={element} toolLink={toolLink} host={host} />
  ),
  createEmbed: () => createToolEmbedElement(),
  validate: (state: unknown) => validateBookLayoutScene(state as SimulationSceneV1),
  // Confine P2: il motore elettrico reale (CircuitSolver vendored) dietro il
  // dispatch del registry. Il render resta traversal-driven (golden 14.9 mA).
  solve: solveElabExperiment,
};
registerSimulationTool(REFERENCE_SIM_TOOL_ID, referenceSimulationEntry);
registerSimulationTool(REFERENCE_PLUGIN_REF_ID, referenceSimulationEntry);

// Montaggio libero slice 3 — tap-tap dalla palette SVG (LIM-first: sul touch
// il tap-tap è il gesto affidabile, il drag no). Semantica occupazione = #93:
// contano i SOLI pinAssignments; foro occupato → notice, MAI piazzamento muto.
type MontaggioPlacementType = "resistor" | "led";
type MontaggioPlacement = { id: string; type: MontaggioPlacementType; holes: [string, string] };
type MontaggioState = { placements: MontaggioPlacement[] };
type MontaggioCanvas = {
  tool: MontaggioPlacementType | null;
  pending: string | null;
  notice: string | null;
  placements: MontaggioPlacement[];
  onSelectTool: (tool: MontaggioPlacementType | null) => void;
  onHoleTap: (ref: string) => void;
  onReset: () => void;
};

function ReferenceSimulationCanvasTool({
  element,
  toolLink,
  host,
}: {
  element: EmbedLike;
  toolLink: ToolLink;
  host?: SimulationToolHost;
}) {
  const marker = element.customData?.[EMBED_DATA_KEY] as { state?: SimulationToolState } | undefined;
  const [machine, setMachine] = useState(createBlinkMachine);
  const [snapshot, setSnapshot] = useState({
    millis: readStateMillis(marker?.state) ?? machine.runtime.millis(),
    ledOn: readStateLed(marker?.state) ?? machine.runtime.isLit(LED_BUILTIN),
  });
  const scene = useMemo(
    () => resolveSimulationScene(marker?.state, snapshot),
    [marker?.state, snapshot],
  );
  // La validazione book-layout resta sulla scena del MANUALE: i piazzamenti
  // dello studente non sono un drift del libro.
  const validation = validateBookLayoutScene(scene);

  const [montaggioTool, setMontaggioTool] = useState<MontaggioPlacementType | null>(null);
  const [pendingHole, setPendingHole] = useState<string | null>(null);
  // Ripristino al mount dallo state persistito; da lì in poi lo stato locale
  // guida la UI e ogni cambio viene riscritto nell'embed (se l'host lo offre).
  const [placements, setPlacements] = useState<MontaggioPlacement[]>(
    () => marker?.state?.montaggio?.placements ?? [],
  );
  const [montaggioNotice, setMontaggioNotice] = useState<string | null>(null);

  function applyPlacements(next: MontaggioPlacement[]) {
    setPlacements(next);
    if (host?.persistEmbedState && marker?.state) {
      host.persistEmbedState(toolLink.embedId, { ...marker.state, montaggio: { placements: next } });
    }
  }

  const occupiedHoles = useMemo(() => {
    const occupied = new Set(Object.values(scene.pinAssignments));
    for (const placement of placements) {
      occupied.add(placement.holes[0]);
      occupied.add(placement.holes[1]);
    }
    return occupied;
  }, [scene, placements]);

  function handleSelectTool(tool: MontaggioPlacementType | null) {
    setMontaggioTool(tool);
    setPendingHole(null);
    setMontaggioNotice(null);
  }

  function handleHoleTap(ref: string) {
    if (montaggioTool === null) return;
    if (occupiedHoles.has(ref)) {
      setMontaggioNotice(`foro ${ref} occupato: scegline uno libero`);
      return;
    }
    if (pendingHole === null) {
      setPendingHole(ref);
      setMontaggioNotice(null);
      return;
    }
    if (pendingHole === ref) {
      setMontaggioNotice("stesso foro del primo tap: tocca un secondo foro diverso");
      return;
    }
    const ordinal = placements.filter((p) => p.type === montaggioTool).length + 1;
    const id = montaggioTool === "resistor" ? `r-libero-${ordinal}` : `led-libero-${ordinal}`;
    applyPlacements([...placements, { id, type: montaggioTool, holes: [pendingHole, ref] }]);
    setPendingHole(null);
    setMontaggioNotice(null);
  }

  function handleMontaggioReset() {
    applyPlacements([]);
    setPendingHole(null);
    setMontaggioNotice(null);
    setMontaggioTool(null);
  }

  // Scena AUMENTATA per la sola board: i piazzamenti entrano in components e
  // pinAssignments (i fori si accendono via DetailedBreadboard, stessa via
  // del manuale). runtime/bookLayout restano quelli del libro.
  const boardScene = useMemo(() => {
    if (placements.length === 0) return scene;
    const components = [...scene.components];
    const pinAssignments = { ...scene.pinAssignments };
    for (const placement of placements) {
      if (placement.type === "resistor") {
        components.push({ id: placement.id, type: "resistor", label: "Resistore montaggio libero", value: 470, anchor: "bb1" });
        pinAssignments[`${placement.id}:pin1`] = placement.holes[0];
        pinAssignments[`${placement.id}:pin2`] = placement.holes[1];
      } else {
        components.push({ id: placement.id, type: "led", label: "LED montaggio libero", color: "red", anchor: "bb1" });
        pinAssignments[`${placement.id}:anode`] = placement.holes[0];
        pinAssignments[`${placement.id}:cathode`] = placement.holes[1];
      }
    }
    return { ...scene, components, pinAssignments };
  }, [scene, placements]);

  const montaggio: MontaggioCanvas = {
    tool: montaggioTool,
    pending: pendingHole,
    notice: montaggioNotice,
    placements,
    onSelectTool: handleSelectTool,
    onHoleTap: handleHoleTap,
    onReset: handleMontaggioReset,
  };
  const isArduinoScene = scene.runtime.kind === "arduino-blink";

  function step() {
    if (!isArduinoScene) {
      setSnapshot({ millis: 0, ledOn: true });
      return;
    }
    machine.scheduler.step();
    setSnapshot({
      millis: machine.runtime.millis(),
      ledOn: machine.runtime.isLit(LED_BUILTIN),
    });
  }

  function reset() {
    if (!isArduinoScene) {
      setSnapshot({ millis: 0, ledOn: true });
      return;
    }
    const nextMachine = createBlinkMachine();
    setMachine(nextMachine);
    setSnapshot({ millis: nextMachine.runtime.millis(), ledOn: nextMachine.runtime.isLit(LED_BUILTIN) });
  }

  return (
    <section style={shellStyle}>
      <header style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Simulation Plugin</div>
          <h2 style={titleStyle}>{scene.title}</h2>
          <div style={manualRefStyle}>{scene.manual.label}</div>
        </div>
        <div style={toolIdStyle}>{toolLink.toolId}</div>
      </header>

      <main style={mainStyle}>
        <SimulationBoard scene={boardScene} montaggio={montaggio} />

        <aside style={sideStyle}>
          <ManualCard scene={scene} />
          <StepByStepCard scene={scene} />
          <div style={metricGridStyle}>
            {scene.runtime.kind === "arduino-blink" ? (
              <>
                <Metric label="pin" value={String(scene.runtime.ledPin)} />
                <Metric label="mode" value="OUTPUT" />
                <Metric label="level" value={snapshot.ledOn ? "HIGH" : "LOW"} />
                <Metric label="millis" value={String(snapshot.millis)} />
              </>
            ) : (
              <>
                <Metric label="sorgente" value={`${scene.runtime.supplyVolts} V`} />
                <Metric label="resistore" value={`${scene.runtime.resistorOhms} Ohm`} />
                <Metric label="LED" value={snapshot.ledOn ? "ON" : "OFF"} />
                <Metric label="corrente" value={`${batteryLedCurrentMa(scene).toFixed(1)} mA`} />
              </>
            )}
          </div>
          <div style={actionsStyle}>
            <button type="button" onClick={step} style={buttonStyle}>
              {scene.runtime.kind === "arduino-blink" ? "Step 1000 ms" : "Mostra montato"}
            </button>
            <button type="button" onClick={reset} style={buttonStyle}>
              Reset
            </button>
          </div>
          <div style={provenanceStyle}>
            <strong>{scene.bookLayout.status}</strong>
            <span>{validation.ok ? `${scene.bookLayout.wires.length} wire guard, ${scene.bookLayout.spatialRules.length} layout guard` : validation.errors.join(", ")}</span>
            <span>PDF p.{scene.bookLayout.manualSource.pdfPage} - {scene.bookLayout.manualSource.crop ? "crop presente" : "crop assente"}</span>
          </div>
          <p style={noteStyle}>{scene.provenance.blocker}</p>
        </aside>
      </main>
    </section>
  );
}

function ManualCard({ scene }: { scene: SimulationSceneV1 }) {
  const pageImage = scene.bookLayout.manualSource.crop;
  const finalPageImage = scene.bookLayout.manualSource.finalCrop;
  return (
    <section style={manualPostItStyle} aria-label="Manuale ELAB collegato">
      <div style={manualCardHeaderStyle}>
        <div style={manualTitleStackStyle}>
          <strong>{scene.manual.label}</strong>
          <span>manuale collegato</span>
        </div>
        <span style={manualStatusStyle}>draft</span>
      </div>
      <div style={manualPageStyle}>
        {pageImage ? (
          <div style={manualPageSpreadStyle}>
            <img
              src={pageImage}
              alt={`Pagina reale del manuale ELAB Volume ${scene.manual.volume} pagina ${scene.bookLayout.manualSource.figurePage ?? scene.bookLayout.manualSource.pdfPage}`}
              style={manualPageImageStyle}
            />
            {finalPageImage && (
              <img
                src={finalPageImage}
                alt={`Pagina reale del manuale ELAB Volume ${scene.manual.volume} pagina 31 circuito montato`}
                style={manualPageImageStyle}
              />
            )}
          </div>
        ) : (
          <p style={manualParagraphStyle}>{scene.manual.bookText}</p>
        )}
      </div>
    </section>
  );
}

function StepByStepCard({ scene }: { scene: SimulationSceneV1 }) {
  const pageImage = scene.bookLayout.manualSource.crop;
  return (
    <section style={manualPostItStyle} aria-label="Modalita passo passo">
      <div style={stepHeaderStyle}>PASSO PASSO</div>
      {pageImage && (
        <div style={manualZoomFrameStyle} aria-label="Zoom reale della figura circuito sul manuale">
          <img
            src={pageImage}
            alt={`Zoom reale sulla pagina passo passo del manuale ELAB Volume ${scene.manual.volume}`}
            style={manualZoomImageStyle}
          />
        </div>
      )}
      <ol style={stepListStyle}>
        {scene.manual.bookInstructions.map((instruction, index) => (
          <li key={instruction} style={stepItemStyle}>
            <span style={stepNumberStyle}>{index + 1}</span>
            <span>{instruction}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SimulationBoard({ scene, montaggio }: { scene: SimulationSceneV1; montaggio?: MontaggioCanvas }) {
  const ledCurrentMa = batteryLedCurrentMa(scene);
  const hasBattery = scene.components.some((component) => component.type === "battery9v");
  return (
    <div style={boardStageStyle} data-experiment-id={scene.experimentId}>
      <svg width="100%" height="100%" viewBox="0 0 920 520" role="img" aria-label={`Simulation Plugin breadboard ELABTutor ${scene.experimentId}`}>
        <defs>
          <filter id="bb-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#152638" floodOpacity="0.18" />
          </filter>
          <filter id="led-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <pattern id="bb-texture" patternUnits="userSpaceOnUse" width="6" height="6">
            <path d="M0 6 L6 0" stroke="#7f7467" strokeWidth="0.18" opacity="0.35" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="920" height="520" fill="#edf3f7" />
        <text x="24" y="34" style={svgBadgeTextStyle}>{scene.manual.bookQuote}</text>
        <g transform={hasBattery ? "translate(295 86) scale(2.2)" : "translate(225 80) scale(2.45)"}>
          <Battery9vSvg scene={scene} />
          <DetailedBreadboard scene={scene} montaggio={montaggio} />
          <BoardWires scene={scene} />
          <NanoR4Svg scene={scene} />
          <ResistorSvg scene={scene} />
          <LedSvg scene={scene} />
          {montaggio && <PlacedPartsSvg scene={scene} placements={montaggio.placements} />}
        </g>
        <g transform="translate(28 404)">
          <rect x="0" y="0" width="520" height="82" rx="8" fill="#ffffff" stroke="#d7e1ea" />
          <text x="18" y="24" style={paletteTitleSvgStyle}>COMPONENTI</text>
          <PaletteItem
            x={18}
            label="Seleziona"
            glyph="M8 6 L30 24 L18 27 L24 42 L17 44 L11 29 L2 36 Z"
            pressed={montaggio ? montaggio.tool === null : undefined}
            onSelect={montaggio ? () => montaggio.onSelectTool(null) : undefined}
          />
          <PaletteItem
            x={98}
            label="Resistenza"
            glyph="M18 7 L18 17 M18 33 L18 45 M14 17 H22 V33 H14 Z"
            pressed={montaggio ? montaggio.tool === "resistor" : undefined}
            onSelect={montaggio ? () => montaggio.onSelectTool("resistor") : undefined}
          />
          <PaletteItem
            x={178}
            label="LED"
            glyph="M18 8 C10 8 8 16 12 22 H24 C28 16 26 8 18 8 M14 22 V42 M22 22 V42"
            pressed={montaggio ? montaggio.tool === "led" : undefined}
            onSelect={montaggio ? () => montaggio.onSelectTool("led") : undefined}
          />
          <PaletteItem x={258} label="Pulsante" glyph="M9 17 H31 V37 H9 Z M15 11 H25 V17" />
          <PaletteItem x={338} label="Cavo" glyph="M9 35 C18 10 34 12 39 30" />
          <PaletteItem x={418} label="Altro" glyph="M13 26 H15 M23 26 H25 M33 26 H35" />
          {montaggio && (
            <>
              <text
                x="502"
                y="24"
                textAnchor="end"
                style={paletteTitleSvgStyle}
                data-montaggio-canvas-count={String(montaggio.placements.length)}
              >
                {`montaggio libero: ${montaggio.placements.length}`}
              </text>
              <text x="0" y="98" style={diagnosticSvgStyle} data-montaggio-canvas-notice>
                {montaggio.notice ?? ""}
              </text>
              <g
                transform="translate(430 88)"
                role="button"
                tabIndex={0}
                aria-label="riparti dal manuale"
                data-montaggio-canvas-reset
                style={{ cursor: "pointer" }}
                onClick={montaggio.onReset}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") montaggio.onReset();
                }}
              >
                <rect x="0" y="0" width="90" height="14" rx="7" fill="#f6f9fc" stroke="#dce6ef" />
                <text x="45" y="10" textAnchor="middle" fill="#52677f" fontSize="7" fontWeight="700">
                  riparti dal manuale
                </text>
              </g>
            </>
          )}
        </g>
        <g transform="translate(590 405)">
          <rect x="0" y="0" width="300" height="82" rx="8" fill="#ffffff" stroke="#d7e1ea" />
          <text x="16" y="24" style={paletteTitleSvgStyle}>DIAGNOSTICA LIVE</text>
          {scene.runtime.kind === "arduino-blink" ? (
            <>
              <text x="16" y="48" style={diagnosticSvgStyle}>D13 {scene.runtime.ledOn ? "HIGH" : "LOW"} - 5.00 V</text>
              <text x="16" y="68" style={diagnosticSvgStyle}>corrente {ledCurrentMa.toFixed(1)} mA - R=470 Ohm</text>
            </>
          ) : (
            <>
              <text x="16" y="48" style={diagnosticSvgStyle}>batteria {scene.runtime.supplyVolts}.00 V - LED {scene.runtime.ledOn ? "ON" : "OFF"}</text>
              <text x="16" y="68" style={diagnosticSvgStyle}>corrente {ledCurrentMa.toFixed(1)} mA - R={scene.runtime.resistorOhms} Ohm</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

function Battery9vSvg({ scene }: { scene: SimulationSceneV1 }) {
  const origin = scenePoint("bat1", scene);
  if (!origin) return null;
  return (
    <g transform={`translate(${origin.x} ${origin.y})`} aria-label="Batteria 9V dal kit ELAB">
      <rect x="-4" y="-4" width="112" height="74" rx="8" fill="#1b2024" opacity="0.12" />
      <rect x="0" y="0" width="76" height="66" rx="4" fill="#242729" stroke="#111518" strokeWidth="1" />
      <rect x="76" y="0" width="28" height="66" rx="3" fill="#cf8843" stroke="#a76a31" strokeWidth="1" />
      <text x="39" y="42" textAnchor="middle" fill="#f2f4f5" fontSize="29" fontWeight="850" transform="rotate(-90 39 34)">9V</text>
      <circle cx="94" cy="20" r="6" fill="#d99b55" stroke="#6c471f" strokeWidth="0.8" />
      <text x="94" y="23" textAnchor="middle" fill="#5d3c1b" fontSize="9" fontWeight="900">+</text>
      <circle cx="94" cy="48" r="6" fill="#d99b55" stroke="#6c471f" strokeWidth="0.8" />
      <text x="94" y="51" textAnchor="middle" fill="#5d3c1b" fontSize="9" fontWeight="900">-</text>
      <rect x="104" y="15" width="10" height="39" rx="2" fill="#454b51" />
      <circle cx={batteryTerminalPoint("positive").x} cy={batteryTerminalPoint("positive").y} r="2.8" fill="#d83b34" stroke="#74231f" strokeWidth="0.5" />
      <circle cx={batteryTerminalPoint("negative").x} cy={batteryTerminalPoint("negative").y} r="2.8" fill="#15191e" stroke="#060708" strokeWidth="0.5" />
    </g>
  );
}

function DetailedBreadboard({ scene, montaggio }: { scene: SimulationSceneV1; montaggio?: MontaggioCanvas }) {
  const active = new Map<string, string>();
  for (const [pinRef, hole] of Object.entries(scene.pinAssignments)) {
    active.set(hole, pinRef.startsWith("led") ? "#2fa764" : "#b6852f");
  }
  for (const connection of scene.connections) {
    if (isBreadboardRef(connection.from)) active.set(connection.from, wireColor(connection.color));
    if (isBreadboardRef(connection.to)) active.set(connection.to, wireColor(connection.color));
  }
  const points = generateBreadboardPoints("bb1");

  return (
    <g aria-label={`Breadboard ELABTutor 400 tie point model: ${ELAB_BREADBOARD_POINT_COUNT} addressable points`}>
      <rect
        x={0}
        y={0}
        width={breadboardGeometry.boardWidth}
        height={breadboardGeometry.boardHeight}
        rx="3"
        fill="#f4f1e9"
        stroke="#d4cdc1"
        strokeWidth="0.7"
        filter="url(#bb-shadow)"
      />
      <rect x="0" y="0" width={breadboardGeometry.boardWidth} height={breadboardGeometry.boardHeight} rx="3" fill="url(#bb-texture)" opacity="0.08" />
      <BreadboardRail y={breadboardGeometry.railY["bus-top-minus"]} sign="-" color="#2f68ad" />
      <BreadboardRail y={breadboardGeometry.railY["bus-top-plus"]} sign="+" color="#d3413a" />
      <BreadboardRail y={breadboardGeometry.railY["bus-bot-plus"]} sign="+" color="#d3413a" />
      <BreadboardRail y={breadboardGeometry.railY["bus-bot-minus"]} sign="-" color="#2f68ad" />
      <rect x={breadboardGeometry.padX - 2} y="68.5" width="229" height="8" rx="1.5" fill="#ded8ce" />
      {[0, 10, 20].map((column) => (
        <circle key={column} cx={breadboardGeometry.padX + column * breadboardGeometry.columnPitch + breadboardGeometry.columnPitch / 2} cy="72.5" r="2" fill="#cfc8bd" />
      ))}
      {[1, 5, 10, 15, 20, 25, 30].map((column) => {
        const x = pointForBreadboardRef(`bb1:j${column}`)?.x ?? 0;
        return (
          <g key={column}>
            <text x={x} y={breadboardGeometry.labelYTop} textAnchor="middle" style={bbNumberStyle}>{column}</text>
            <text x={x} y={breadboardGeometry.labelYBottom} textAnchor="middle" style={bbNumberStyle}>{column}</text>
          </g>
        );
      })}
      {ELAB_TOP_TERMINAL_ROWS.map((row) => (
        <text key={`l-${row}`} x="8" y={(breadboardGeometry.terminalY[row] ?? 0) + 1.5} style={bbRowLabelStyle}>{row}</text>
      ))}
      {ELAB_BOTTOM_TERMINAL_ROWS.map((row) => (
        <text key={`l-${row}`} x="8" y={(breadboardGeometry.terminalY[row] ?? 0) + 1.5} style={bbRowLabelStyle}>{row}</text>
      ))}
      {[...ELAB_TOP_TERMINAL_ROWS, ...ELAB_BOTTOM_TERMINAL_ROWS].map((row) => (
        <text key={`r-${row}`} x={breadboardGeometry.boardWidth - 8} y={(breadboardGeometry.terminalY[row] ?? 0) + 1.5} textAnchor="middle" style={bbRowLabelStyle}>{row}</text>
      ))}
      {points.map((point) => {
        const ref = point.kind === "terminal" ? `${point.boardId}:${point.row}${point.column}` : `${point.boardId}:${point.rail}-${point.column}`;
        const color = active.get(ref);
        return (
          <BreadboardHole
            key={ref}
            x={point.x}
            y={point.y}
            activeColor={color}
            holeRef={ref}
            pending={montaggio?.pending === ref}
            onTap={montaggio && montaggio.tool !== null ? montaggio.onHoleTap : undefined}
          />
        );
      })}
      <text x="126.5" y="75" textAnchor="middle" style={bbChannelStyle}>ELAB volume grammar: j..f / e..a</text>
    </g>
  );
}

function BreadboardRail({ y, sign, color }: { y: number; sign: "+" | "-"; color: string }) {
  return (
    <g>
      <line x1={breadboardGeometry.padX} x2={breadboardGeometry.boardWidth - breadboardGeometry.padX} y1={y} y2={y} stroke={color} strokeWidth="1.2" opacity="0.9" />
      <text x="7" y={y + 1.8} textAnchor="middle" fill={color} fontSize="6" fontWeight="800">{sign}</text>
      <text x={breadboardGeometry.boardWidth - 7} y={y + 1.8} textAnchor="middle" fill={color} fontSize="6" fontWeight="800">{sign}</text>
    </g>
  );
}

function BreadboardHole({
  x,
  y,
  activeColor,
  holeRef,
  pending,
  onTap,
}: {
  x: number;
  y: number;
  activeColor?: string;
  holeRef?: string;
  pending?: boolean;
  onTap?: (ref: string) => void;
}) {
  return (
    <g
      data-bb-hole={holeRef}
      data-pending={pending ? "1" : undefined}
      onClick={onTap && holeRef ? () => onTap(holeRef) : undefined}
      style={onTap ? { cursor: "pointer" } : undefined}
    >
      {pending && <circle cx={x} cy={y} r="3.6" fill="none" stroke="#2f68ad" strokeWidth="1" />}
      {activeColor && <circle cx={x} cy={y} r="3.2" fill={activeColor} opacity="0.24" />}
      <circle cx={x} cy={y} r={breadboardGeometry.holeRadius} fill={activeColor ?? "#b8b2a7"} />
      <circle cx={x} cy={y} r={breadboardGeometry.holeCoreRadius} fill={activeColor ? "#1f2e2c" : "#2f2f2f"} />
      {!activeColor && <circle cx={x - 0.35} cy={y - 0.35} r="0.45" fill="#fff" opacity="0.28" />}
    </g>
  );
}

function BoardWires({ scene }: { scene: SimulationSceneV1 }) {
  // Decorativo: i fili NON intercettano i pointer, i fori sotto restano tappabili.
  return (
    <g pointerEvents="none">
      {scene.connections.map((connection) => {
        // Path autorato (schema-frozen): disegnato byte-identico, i marker
        // stanno sugli estremi autorati. La bezier sintetica resta SOLO come
        // fallback per scene senza geometria autorata.
        const authored = connection.path;
        const start = authored?.points[0] ?? resolveScenePoint(connection.from, scene);
        const end = authored?.points.at(-1) ?? resolveScenePoint(connection.to, scene);
        if (!start || !end) return null;
        const d = authored
          ? `M ${authored.points[0]!.x} ${authored.points[0]!.y}${authored.points
              .slice(1)
              .map((point) => ` L ${point.x} ${point.y}`)
              .join("")}`
          : wirePath(start.x, start.y, end.x, end.y, connection.color);
        return (
          <g key={`${connection.from}-${connection.to}`}>
            <path d={d} fill="none" stroke="#000000" strokeWidth="2.9" strokeLinecap="round" opacity="0.18" transform="translate(0.6 0.7)" />
            <path d={d} fill="none" stroke={wireColor(connection.color)} strokeWidth="2.4" strokeLinecap="round" />
            <path d={d} fill="none" stroke="#ffffff" strokeWidth="0.45" strokeLinecap="round" opacity="0.28" />
            <circle cx={start.x} cy={start.y} r="2.2" fill={wireColor(connection.color)} stroke="#24313e" strokeWidth="0.35" />
            <circle cx={end.x} cy={end.y} r="2.2" fill={wireColor(connection.color)} stroke="#24313e" strokeWidth="0.35" />
          </g>
        );
      })}
    </g>
  );
}

function NanoR4Svg({ scene }: { scene: SimulationSceneV1 }) {
  const origin = scenePoint("nano1", scene);
  const pin13 = resolveScenePoint("nano1:W_D13", scene);
  if (!origin) return null;
  return (
    <g transform={`translate(${origin.x} ${origin.y})`} aria-label="Arduino Nano R4 imported from ELABTutor pin geometry">
      <rect x="-4" y="-4" width="176" height="107" rx="8" fill="#123b34" opacity="0.18" />
      <rect x="0" y="0" width="168" height="99" rx="7" fill="#126447" stroke="#082f2d" strokeWidth="1.2" />
      <path d="M0 8 Q0 49.5 0 91 Q-23 79 -23 49.5 Q-23 20 0 8" fill="#0f5c43" stroke="#082f2d" strokeWidth="1.2" />
      <rect x="-26" y="40" width="28" height="20" rx="3" fill="#d8dde2" stroke="#919aa4" strokeWidth="0.8" />
      <rect x="50" y="38" width="35" height="27" rx="3" fill="#171b20" />
      <rect x="102" y="42" width="17" height="17" rx="3" fill="#d7d9d5" stroke="#5b625f" strokeWidth="0.7" />
      <circle cx="110.5" cy="50.5" r="4" fill="#7b817d" />
      <text x="78" y="52" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="850">ARDESIA</text>
      <text x="78" y="65" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="750">NANO R4</text>
      <PinRow y={35} labels={["D13", "3V3", "REF", "A0", "A1", "A2", "A3", "A4", "A5", "A7", "5V", "RST", "GND", "VIN"]} />
      <PinRow y={64} labels={["D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "GND", "RST", "RX", "TX"]} />
      {scene.runtime.ledOn && <circle cx="150" cy="57" r="5" fill="#91e64f" filter="url(#led-glow)" opacity="0.9" />}
      <circle cx="150" cy="57" r="2.8" fill={scene.runtime.ledOn ? "#91e64f" : "#587067"} stroke="#123429" strokeWidth="0.4" />
      {pin13 && (
        <g transform={`translate(${pin13.x - origin.x} ${pin13.y - origin.y})`}>
          <circle r="3.3" fill="#35a852" stroke="#0e4f25" strokeWidth="0.6" />
          <text x="0" y="-7" textAnchor="middle" fill="#127a32" fontSize="7" fontWeight="850">D13</text>
        </g>
      )}
    </g>
  );
}

function PinRow({ y, labels }: { y: number; labels: string[] }) {
  return (
    <g>
      {labels.map((label, index) => {
        const x = 20 + index * 7.5;
        return (
          <g key={`${label}-${index}`}>
            <circle cx={x} cy={y} r="2.8" fill="#c7ae62" stroke="#483b19" strokeWidth="0.45" />
            {index % 2 === 0 && <text x={x} y={y + (y < 50 ? -5 : 9)} textAnchor="middle" fill="#eef8f2" fontSize="4.8" fontWeight="800">{label}</text>}
          </g>
        );
      })}
    </g>
  );
}

function ResistorSvg({ scene }: { scene: SimulationSceneV1 }) {
  const a = pointForBreadboardRef(scene.pinAssignments["r1:pin1"]);
  const b = pointForBreadboardRef(scene.pinAssignments["r1:pin2"]);
  if (!a || !b) return null;
  return (
    <g aria-label="Resistore 470 Ohm" pointerEvents="none">
      <ResistorBody a={a} b={b} />
    </g>
  );
}

function ResistorBody({ a, b }: { a: { x: number; y: number }; b: { x: number; y: number } }) {
  const centerX = (a.x + b.x) / 2;
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={centerX - 14} y2={a.y} stroke="#9aa0a6" strokeWidth="1.3" strokeLinecap="round" />
      <line x1={centerX + 14} y1={b.y} x2={b.x} y2={b.y} stroke="#9aa0a6" strokeWidth="1.3" strokeLinecap="round" />
      <rect x={centerX - 15} y={a.y - 4.4} width="30" height="8.8" rx="4.4" fill="#d8b894" stroke="#8c7558" strokeWidth="0.7" />
      <rect x={centerX - 8} y={a.y - 4.4} width="2.2" height="8.8" fill="#f4d11f" />
      <rect x={centerX - 2.5} y={a.y - 4.4} width="2.2" height="8.8" fill="#753d16" />
      <rect x={centerX + 3} y={a.y - 4.4} width="2.2" height="8.8" fill="#753d16" />
      <rect x={centerX + 9} y={a.y - 4.4} width="2.2" height="8.8" fill="#d9ba44" />
      <text x={centerX} y={a.y - 8} textAnchor="middle" fill="#5e4930" fontSize="5.2" fontWeight="800">470 Ohm</text>
    </g>
  );
}

function LedSvg({ scene }: { scene: SimulationSceneV1 }) {
  const anode = pointForBreadboardRef(scene.pinAssignments["led1:anode"]);
  const cathode = pointForBreadboardRef(scene.pinAssignments["led1:cathode"]);
  if (!anode || !cathode) return null;
  const led = scene.components.find((component) => component.id === "led1");
  return (
    <g aria-label={scene.runtime.ledOn ? `LED ${led?.color ?? "verde"} acceso` : `LED ${led?.color ?? "verde"} spento`} pointerEvents="none">
      <LedBody anode={anode} cathode={cathode} color={led?.color ?? "verde"} on={scene.runtime.ledOn} />
    </g>
  );
}

function LedBody({
  anode,
  cathode,
  color,
  on,
}: {
  anode: { x: number; y: number };
  cathode: { x: number; y: number };
  color: string;
  on: boolean;
}) {
  const litColor = color === "red" ? "#e5483f" : "#38c85c";
  const dimColor = color === "red" ? "#d99592" : "#b9d3bd";
  const strokeColor = color === "red" ? "#9d2d27" : "#1f7f36";
  const centerX = (anode.x + cathode.x) / 2;
  const bodyY = anode.y - 21;
  return (
    <g>
      {on && <circle cx={centerX} cy={bodyY - 2} r="13" fill={litColor} filter="url(#led-glow)" opacity="0.55" />}
      <line x1={anode.x} y1={anode.y} x2={centerX - 3.2} y2={bodyY + 3} stroke="#a8adb2" strokeWidth="1.1" strokeLinecap="round" />
      <line x1={cathode.x} y1={cathode.y} x2={centerX + 3.2} y2={bodyY + 3} stroke="#a8adb2" strokeWidth="1.1" strokeLinecap="round" />
      <path d={`M ${centerX - 9} ${bodyY + 4} Q ${centerX} ${bodyY - 16} ${centerX + 9} ${bodyY + 4} Z`} fill={on ? litColor : dimColor} stroke={strokeColor} strokeWidth="0.8" opacity={on ? 0.95 : 0.78} />
      <ellipse cx={centerX - 3.3} cy={bodyY - 4.5} rx="2.2" ry="4" fill="#ffffff" opacity="0.45" />
      <text x={centerX} y={bodyY - 18} textAnchor="middle" fill={strokeColor} fontSize="5.4" fontWeight="850">LED</text>
    </g>
  );
}

function PaletteItem({
  x,
  label,
  glyph,
  pressed,
  onSelect,
}: {
  x: number;
  label: string;
  glyph: string;
  /** Presenti = voce di palette ATTIVA (tap-tap montaggio); assenti = decorativa. */
  pressed?: boolean;
  onSelect?: () => void;
}) {
  const interactive = onSelect !== undefined;
  return (
    <g
      transform={`translate(${x} 32)`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `palette ${label}` : undefined}
      aria-pressed={interactive ? (pressed ? "true" : "false") : undefined}
      style={interactive ? { cursor: "pointer" } : undefined}
      onClick={onSelect}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onSelect();
            }
          : undefined
      }
    >
      <rect
        x="0"
        y="0"
        width="62"
        height="38"
        rx="5"
        fill={pressed ? "#e8f1fb" : "#f6f9fc"}
        stroke={pressed ? "#2f68ad" : "#dce6ef"}
        strokeWidth={pressed ? 1.4 : 1}
      />
      <path d={glyph} fill="none" stroke="#303d49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="31" y="34" textAnchor="middle" fill="#52677f" fontSize="6" fontWeight="650">{label}</text>
    </g>
  );
}

/** Corpi dei piazzamenti tap-tap: LED sempre reso spento (il solve del
 *  montaggio libero è una slice futura — niente accensioni inventate). */
function PlacedPartsSvg({ scene, placements }: { scene: SimulationSceneV1; placements: MontaggioPlacement[] }) {
  // Decorativo come i fili: i corpi piazzati non bloccano i tap sui fori vicini.
  return (
    <g pointerEvents="none">
      {placements.map((placement) => {
        const [firstHole, secondHole] = placement.holes;
        const a = pointForBreadboardRef(firstHole);
        const b = pointForBreadboardRef(secondHole);
        if (!a || !b) return null;
        if (placement.type === "resistor") {
          return (
            <g key={placement.id} aria-label={`Resistore montaggio libero ${placement.id}`}>
              <ResistorBody a={a} b={b} />
            </g>
          );
        }
        const led = scene.components.find((component) => component.id === placement.id);
        return (
          <g key={placement.id} aria-label={`LED montaggio libero ${placement.id}`}>
            <LedBody anode={a} cathode={b} color={led?.color ?? "red"} on={false} />
          </g>
        );
      })}
    </g>
  );
}

function resolveScenePoint(ref: string, scene: SimulationSceneV1): { x: number; y: number } | null {
  if (isBreadboardRef(ref)) return pointForBreadboardRef(ref);
  const [componentId, pinId] = ref.split(":");
  if (componentId === "bat1") {
    const origin = scenePoint("bat1", scene);
    const terminal = batteryTerminalPoint(pinId);
    return origin ? { x: origin.x + terminal.x, y: origin.y + terminal.y } : null;
  }
  if (componentId !== "nano1") return null;
  const origin = scenePoint("nano1", scene);
  if (!origin) return null;
  const point = nanoPinPoint(pinId);
  return point ? { x: origin.x + point.x, y: origin.y + point.y } : null;
}

function batteryTerminalPoint(pinId: string): { x: number; y: number } {
  return pinId === "positive" ? { x: 114, y: 20 } : { x: 114, y: 48 };
}

function scenePoint(componentId: string, scene: SimulationSceneV1): { x: number; y: number } | null {
  const bb = scene.layout.bb1;
  const pos = scene.layout[componentId];
  if (!bb || !pos) return null;
  return { x: pos.x - bb.x, y: pos.y - bb.y };
}

function nanoPinPoint(pinId: string): { x: number; y: number } | null {
  const top = ["D13", "3V3", "AREF", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "5V", "MINUS", "GND", "VIN"];
  const bottom = ["D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "GND_R", "RST_R", "RX", "TX"];
  const wing = ["W_A0", "W_A1", "W_A2", "W_A3", "W_D3", "W_D5", "W_D6", "W_D9", "W_A4", "W_A5", "W_D0", "W_D1", "W_D13", "W_D12", "W_D11", "W_D10", "W_D8", "W_GND1", "W_VCC1"];
  const topIndex = top.indexOf(pinId);
  if (topIndex >= 0) return { x: 20 + topIndex * 7.5, y: 35 };
  const bottomIndex = bottom.indexOf(pinId);
  if (bottomIndex >= 0) return { x: 20 + bottomIndex * 7.5, y: 64 };
  const wingIndex = wing.indexOf(pinId);
  if (wingIndex >= 0) return { x: 76 + wingIndex * 4.2, y: 13 };
  return null;
}

function wirePath(x1: number, y1: number, x2: number, y2: number, color: string): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const sag = Math.min(22, Math.hypot(dx, dy) * 0.18);
  const lift = color === "black" ? sag : -sag;
  if (Math.abs(dx) > Math.abs(dy)) {
    return `M ${x1} ${y1} C ${x1 + dx * 0.35} ${y1 + lift}, ${x1 + dx * 0.65} ${y2 + lift}, ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} C ${x1 + lift} ${y1 + dy * 0.35}, ${x2 + lift} ${y1 + dy * 0.65}, ${x2} ${y2}`;
}

function wireColor(color: string): string {
  return (
    {
      orange: "#ee7b18",
      green: "#2fa764",
      black: "#15191e",
      red: "#d83b34",
      blue: "#2f68ad",
    }[color] ?? color
  );
}

function batteryLedCurrentMa(scene: SimulationSceneV1): number {
  if (scene.runtime.kind === "arduino-blink") {
    return scene.runtime.ledOn ? ((5 - 2) / 470) * 1000 : 0;
  }
  if (!scene.runtime.ledOn) return 0;
  // Solve serie graph-driven: la corrente deriva dal cammino elettrico REALE
  // (connections + pinAssignments + valori dei componenti), non da una formula
  // hard-coded. Circuito aperto o senza resistenza sul path → 0 mA.
  const loop = solveSeriesLoop(scene);
  if (!loop.closed || loop.resistanceOhms <= 0) return 0;
  const driveVolts = scene.runtime.supplyVolts - scene.runtime.ledForwardVolts * loop.ledCount;
  return Math.max(0, (driveVolts / loop.resistanceOhms) * 1000);
}

function resolveSimulationScene(state: SimulationToolState | undefined, snapshot: { millis: number; ledOn: boolean }) {
  const scene = state?.kind === "simulation-scene-v1" ? state.scene : createReferenceSimulationScene(snapshot);
  if (scene.runtime.kind === "battery-led") {
    return {
      ...scene,
      runtime: {
        ...scene.runtime,
        ledOn: snapshot.ledOn,
      },
    };
  }
  return {
    ...scene,
    runtime: {
      ...scene.runtime,
      millis: snapshot.millis,
      ledOn: snapshot.ledOn,
    },
  };
}

function readStateMillis(state: SimulationToolState | undefined): number | undefined {
  if (state?.kind === "simulation-scene-v1") {
    return state.scene.runtime.kind === "arduino-blink" ? state.scene.runtime.millis : 0;
  }
  return state?.millis;
}

function readStateLed(state: SimulationToolState | undefined): boolean | undefined {
  if (state?.kind === "simulation-scene-v1") return state.scene.runtime.ledOn;
  return state?.ledOn;
}

function createBlinkMachine() {
  const runtime = new ArduinoRuntime();
  const scheduler = new SketchScheduler(blinkSketch, runtime);
  return { runtime, scheduler };
}

function UnknownToolCanvasTool({ toolLink }: { toolLink: ToolLink }) {
  return (
    <section style={shellStyle}>
      <header style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Tool Canvas</div>
          <h2 style={titleStyle}>Tool non installato</h2>
        </div>
        <div style={toolIdStyle}>{toolLink.toolId}</div>
      </header>
      <div style={{ padding: 18, color: "#52677f", fontSize: 14 }}>
        Embed {toolLink.embedId} rilevato. Serve il bundle tool firmato per montare il runtime.
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricStyle}>
      <span style={{ fontSize: 11, color: "#6c7d8e", fontWeight: 800 }}>{label}</span>
      <strong style={{ fontSize: 14, color: "#102034" }}>{value}</strong>
    </div>
  );
}

const shellStyle = {
  width: "100%",
  height: "100%",
  background: "#f8fbff",
  color: "#102034",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr",
} as const;

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
  padding: "14px 16px 10px",
  borderBottom: "1px solid #d8e1eb",
  background: "#ffffff",
} as const;

const eyebrowStyle = {
  fontSize: 12,
  color: "#2d6a4f",
  fontWeight: 850,
} as const;

const titleStyle = {
  margin: "4px 0 0",
  fontSize: 21,
  lineHeight: 1.1,
} as const;

const manualRefStyle = {
  marginTop: 5,
  fontSize: 12,
  color: "#52677f",
  fontWeight: 750,
} as const;

const toolIdStyle = {
  fontSize: 12,
  color: "#52677f",
  border: "1px solid #d8e1eb",
  borderRadius: 7,
  padding: "6px 8px",
  background: "#fbfdff",
  maxWidth: 230,
  wordBreak: "break-word",
} as const;

const mainStyle = {
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(560px, 1fr) minmax(300px, 340px)",
  gap: 14,
  padding: 16,
} as const;

const boardStageStyle = {
  position: "relative",
  minHeight: 560,
  borderRadius: 8,
  border: "1px solid #d8e1eb",
  background: "#eef4f8",
  overflow: "hidden",
} as const;

const svgBadgeTextStyle: CSSProperties = {
  fill: "#203044",
  fontSize: 18,
  fontWeight: 850,
};

const paletteTitleSvgStyle: CSSProperties = {
  fill: "#52677f",
  fontSize: 11,
  fontWeight: 850,
};

const diagnosticSvgStyle: CSSProperties = {
  fill: "#253c52",
  fontSize: 14,
  fontWeight: 750,
};

const bbNumberStyle: CSSProperties = {
  fill: "#504b44",
  fontSize: 5.1,
  fontWeight: 750,
};

const bbRowLabelStyle: CSSProperties = {
  fill: "#4c4841",
  fontSize: 6.4,
  fontWeight: 850,
};

const bbChannelStyle: CSSProperties = {
  fill: "#958b7b",
  fontSize: 4.6,
  fontWeight: 750,
};

const sideStyle = {
  minWidth: 0,
  display: "grid",
  alignContent: "start",
  gap: 10,
  overflowY: "auto",
  paddingRight: 2,
} as const;

const manualCardStyle = {
  border: "1px solid #d8e1eb",
  borderRadius: 8,
  background: "#ffffff",
  padding: 10,
  display: "grid",
  gap: 8,
  color: "#253c52",
  fontSize: 12,
} as const;

const manualPostItStyle = {
  ...manualCardStyle,
  boxShadow: "0 10px 20px rgba(39, 54, 64, 0.08)",
} as const;

const manualCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "start",
} as const;

const manualTitleStackStyle = {
  display: "grid",
  gap: 2,
  lineHeight: 1.18,
} as const;

const manualStatusStyle = {
  border: "1px solid #cfe2d3",
  borderRadius: 999,
  padding: "3px 7px",
  color: "#287a43",
  background: "#f1faf3",
  fontWeight: 850,
  fontSize: 10,
} as const;

const manualPageStyle = {
  border: "1px solid #e0e6ed",
  borderRadius: 7,
  padding: 6,
  background: "#fbfcfe",
  maxHeight: 202,
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
} as const;

const manualPageSpreadStyle = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
  alignItems: "center",
} as const;

const manualPageImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  maxHeight: 190,
  objectFit: "contain",
  borderRadius: 5,
  background: "#ffffff",
  boxShadow: "0 1px 8px rgba(31, 63, 99, 0.12)",
};

const manualParagraphStyle = {
  margin: "0 0 6px",
  lineHeight: 1.35,
  color: "#40556b",
} as const;

const stepHeaderStyle = {
  color: "#52677f",
  fontSize: 11,
  fontWeight: 900,
} as const;

const manualZoomFrameStyle = {
  height: 126,
  border: "1px solid #d6e3ef",
  borderRadius: 7,
  overflow: "hidden",
  background: "#e8f6f7",
  position: "relative",
} as const;

const manualZoomImageStyle: CSSProperties = {
  width: "180%",
  height: "180%",
  objectFit: "cover",
  objectPosition: "53% 69%",
  transform: "translate(-21%, -29%)",
  filter: "contrast(1.04) saturate(1.02)",
};

const stepListStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: 5,
} as const;

const stepItemStyle = {
  display: "grid",
  gridTemplateColumns: "22px 1fr",
  gap: 6,
  alignItems: "start",
  lineHeight: 1.2,
} as const;

const stepNumberStyle = {
  width: 18,
  height: 18,
  borderRadius: 999,
  display: "inline-grid",
  placeItems: "center",
  background: "#e8f2ff",
  color: "#1f4f80",
  fontSize: 10,
  fontWeight: 900,
} as const;

const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
} as const;

const metricStyle = {
  border: "1px solid #d8e1eb",
  borderRadius: 8,
  background: "#ffffff",
  padding: 10,
  display: "grid",
  gap: 3,
} as const;

const actionsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
} as const;

const buttonStyle = {
  border: "1px solid #ccd8e5",
  background: "#ffffff",
  color: "#102034",
  borderRadius: 7,
  padding: "8px 10px",
  fontWeight: 750,
  cursor: "pointer",
} as const;

const provenanceStyle = {
  border: "1px solid #d8e1eb",
  borderRadius: 8,
  background: "#ffffff",
  padding: 10,
  display: "grid",
  gap: 4,
  color: "#40556b",
  fontSize: 12,
} as const;

const noteStyle = {
  margin: 0,
  fontSize: 12.5,
  lineHeight: 1.42,
  color: "#52677f",
} as const;
