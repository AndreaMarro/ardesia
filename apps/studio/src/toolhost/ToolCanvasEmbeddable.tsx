/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from "react";

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
  parseBreadboardRef,
  pointForBreadboardRef,
  solveSeriesLoop,
} from "../../sim/breadboard/simulationBreadboard";
import { describeHole } from "../../sim/breadboard/sceneAuthoring";
import { registerSimulationTool, getSimulationTool, type SimulationToolHost } from "./simulationPluginRegistry";
import { simulationSolveEvent, type SimulationSolveOutcome } from "../lessonos/simulationSolveEvent";
import { simulationSceneDigest } from "../../sim/core/simulationSceneDigest";
import { catalogSummary } from "./elabExperimentCatalog";
import { stepByStepModel, type StepByStepModel } from "./simulationStepMode";
import { solveElabExperiment, ledStressZone, LED_STRESS_ZONE_LABELS, type SolveResult } from "../../sim/solver/elabSolver";
import { simulationSceneFromElabScene, type ElabSceneBridgeOptions } from "./elabSceneBridge";
import { renderPluginPostitBoardEmbeddable } from "./pluginPostitBoardRender";
import {
  applyElabCanvasConnectionAdd,
  applyElabCanvasLayoutChange,
  applyElabCanvasWireDelete,
  applyElabCanvasWireUpdate,
  elabCanvasConnectionAddOperation,
  elabCanvasLayoutChangeOperation,
  elabCanvasWireDeleteOperation,
  elabCanvasWireUpdateOperation,
  simulationSceneToElabCanvasState,
  type ElabCanvasProjectionMode,
  type ElabCanvasWireEventConnection,
} from "../../sim/elab/elabCanvasAdapter";
import type {
  PlaceComponentOperation,
  SimulationOperationEnvelope,
} from "../../sim/core/simulationOperations";
import elabSceneCandidateV1Cap6Esp1 from "../../sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json";
import elabSceneCandidateV1Cap6Esp2 from "../../sim/fixtures/elab-scene-v2-candidate-v1cap6esp2.json";
import elabSceneCandidateV1Cap6Esp3 from "../../sim/fixtures/elab-scene-v2-candidate-v1cap6esp3.json";
import elabSceneCandidateV1Cap9Esp6 from "../../sim/fixtures/elab-scene-v2-candidate-v1cap9esp6.json";

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
  type: "battery9v" | "breadboard-half" | "nano-r4" | "resistor" | "led" | "builtin-led" | "potentiometer" | "rgb-led";
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
  // Curvatura autorata dal volume: quando presente, la scena deve riprodurre la
  // STESSA polyline (parità curvatura cavi). Tolleranza = tolerances.coordinatePx.
  // Opzionale/additivo: i book-layout che non la dichiarano non vengono ristretti.
  path?: { kind: "polyline"; points: Array<{ x: number; y: number }> };
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
      }
    | {
        // Dimostrazione "cosa NON fare" (Vol.1 p.32): LED direttamente alla
        // batteria. ledOn resta false: il verdetto onesto è "bruciato".
        kind: "battery-led-senza-resistore";
        supplyVolts: number;
        ledForwardVolts: number;
        ledOn: boolean;
      }
    | {
        // Scene multi-pin (potenziometro/LED RGB, v1-cap9-esp6): nessun
        // valore pre-dichiarato — il renderer interroga il motore MNA reale
        // sui dati della scena e mostra i canali com'escono dal solve.
        kind: "elab-mna";
        supplyVolts: number;
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
export const REFERENCE_SIM_TOOL_ID = "io.ardesia.simulation";
export const LEGACY_REFERENCE_SIM_TOOL_ID = "io.ardesia.simulation-plugin";
export const REFERENCE_PLUGIN_REF_ID = "io.maestro.plugin-ref";
export const REFERENCE_SIM_EMBED_ID = "elab-v1-cap6-esp1-first-led";
export const REFERENCE_SIM_LINK = `${TOOL_EMBED_SCHEME}${REFERENCE_SIM_TOOL_ID}/${REFERENCE_SIM_EMBED_ID}`;
export const ELAB_V1_FIRST_LED_EXPERIMENT_ID = "v1-cap6-esp1";
export const ELAB_V1_NO_RESISTOR_EXPERIMENT_ID = "v1-cap6-esp2";
export const ELAB_V1_NO_RESISTOR_EMBED_ID = "elab-v1-cap6-esp2-led-senza-resistore";
export const ELAB_V1_LUMINOSITA_EXPERIMENT_ID = "v1-cap6-esp3";
export const ELAB_V1_LUMINOSITA_EMBED_ID = "elab-v1-cap6-esp3-luminosita-resistenze";
export const ELAB_V1_RGB_LAMP_EXPERIMENT_ID = "v1-cap9-esp6";
export const ELAB_V1_RGB_LAMP_EMBED_ID = "elab-v1-cap9-esp6-lampada-rgb";
export const ELAB_BLINK_EXPERIMENT_ID = "v3-cap5-esp1";
export const ELAB_EXTERNAL_LED_EXPERIMENT_ID = "v3-cap6-esp2";
export const ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE = "/elab/manuals/vol1/page-030-esercizio-6-1.png";
export const ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE = "/elab/manuals/vol1/page-031-esercizio-6-1.png";
export const ELAB_V1_CAP6_ESP2_MANUAL_PAGE_IMAGE = "/elab/manuals/vol1/page-032-esercizio-6-2.png";
export const ELAB_V1_CAP6_ESP3_MANUAL_PAGE_IMAGE = "/elab/manuals/vol1/page-033-esercizio-6-3.png";
export const ELAB_V1_CAP9_ESP6_MANUAL_PAGE_IMAGE = "/elab/manuals/vol1/page-072-esercizio-9-6.png";
export const ELAB_V1_CAP9_ESP6_FINAL_PAGE_IMAGE = "/elab/manuals/vol1/page-074-esercizio-9-6.png";
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

// Copy canoniche dal testo Vol.1 p29-31 (i fori esatti sono liberi nel testo:
// "un punto qualsiasi" — canonical simulator placement nella fixture).
export const ELAB_V1_CAP6_ESP1_BRIDGE_OPTS: ElabSceneBridgeOptions = {
  title: "Accendi il tuo primo LED",
  chapter: "Capitolo 6 - Cos'e il diodo LED?",
  bookText:
    "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
  bookInstructions: [
    "Ragazzi, collegate la clip alla batteria e il positivo alla striscia rossa superiore della breadboard.",
    "Ragazzi, collegate il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto.",
    "Ragazzi, inserite il LED a cavallo della separazione centrale: gambetta lunga verso il resistore, gambetta corta dopo la divisione.",
    "Ragazzi, collegate il negativo della batteria nella stessa colonna della gambetta corta del LED.",
  ],
  bookQuote: "Il LED si e acceso! Bellissimo vero?",
  manualCrop: ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
  manualFinalCrop: ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
  manualFigurePage: 30,
};

// Copy dal Pack (volume-references v1-cap6-esp2, VERBATIM): l'esperimento è
// una dimostrazione d'errore — il libro stesso avverte che il LED si brucia.
export const ELAB_V1_CAP6_ESP2_BRIDGE_OPTS: ElabSceneBridgeOptions = {
  title: "LED senza resistore (cosa NON fare!)",
  chapter: "Capitolo 6 - Cos'e il diodo LED?",
  bookText:
    "Il nostro circuito include un resistore, ma perché? I resistori servono per limitare la corrente. Ogni LED può sopportare una corrente massima che non deve essere superata altrimenti il led si rompe.",
  bookInstructions: [
    "Collega il LED direttamente alla batteria senza resistore (ATTENZIONE: il LED si brucia!)",
  ],
  bookQuote:
    "RICORDA: NON collegare MAI il LED direttamente alla batteria, ma inserisci sempre un resistore al centro!",
  manualCrop: ELAB_V1_CAP6_ESP2_MANUAL_PAGE_IMAGE,
  manualFinalCrop: null,
  manualFigurePage: 32,
};

/** Scena reale v1-cap6-esp2 dal bridge sulla fixture candidate (nessun override: ledOn resta false, onesto). */
export function createV1Cap6Esp2SimulationScene(): SimulationSceneV1 {
  return simulationSceneFromElabScene(elabSceneCandidateV1Cap6Esp2, ELAB_V1_CAP6_ESP2_BRIDGE_OPTS);
}

// Copy dal Pack (volume-references v1-cap6-esp3, VERBATIM).
export const ELAB_V1_CAP6_ESP3_BRIDGE_OPTS: ElabSceneBridgeOptions = {
  title: "Cambia luminosità con resistenze diverse",
  chapter: "Capitolo 6 - Cos'e il diodo LED?",
  bookText:
    "Per rendere il led più luminoso ci basta partire dal circuito che abbiamo realizzato. Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm.",
  bookInstructions: [
    "Parti dal circuito dell'Esperimento 1",
    "Cambia il resistore da 470 Ohm con uno da 220 Ohm",
  ],
  bookQuote: "Ti ricordi i colori delle resistenze?",
  manualCrop: ELAB_V1_CAP6_ESP3_MANUAL_PAGE_IMAGE,
  manualFinalCrop: null,
  manualFigurePage: 33,
};

/** Scena reale v1-cap6-esp3 (220 Ohm, zona overdrive ADR-0003) dal bridge sulla fixture candidate. */
export function createV1Cap6Esp3SimulationScene(): SimulationSceneV1 {
  return simulationSceneFromElabScene(elabSceneCandidateV1Cap6Esp3, ELAB_V1_CAP6_ESP3_BRIDGE_OPTS);
}

// Copy dal Pack (volume-references v1-cap9-esp6, VERBATIM).
export const ELAB_V1_CAP9_ESP6_BRIDGE_OPTS: ElabSceneBridgeOptions = {
  title: "Lampada RGB con 3 potenziometri",
  chapter: "Capitolo 9 - Cos'è un potenziometro?",
  bookText:
    "Costruiamo una lampada avendo la possibilità di poter scegliere abbastanza facilmente quanto colore aggiungere per ogni luce colorata presente nel LED RGB.",
  bookInstructions: [
    "Collega la clip della batteria alla batteria",
    "Collega il negativo della batteria alla striscia nera della breadboard",
    "Inserisci il LED RGB nella breadboard",
    "Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria con un filo",
    "Inserisci il primo potenziometro nella breadboard",
    "Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il piedino del potenziometro",
    "Inserisci il secondo e terzo potenziometro con le loro resistenze da 470 Ohm",
    "Collega il positivo della batteria alla linea rossa della breadboard",
    "Collega il pin 2 del terzo potenziometro al LED blu del LED RGB",
    "Collega il pin 2 del secondo potenziometro al LED verde del LED RGB",
    "Collega il pin 2 del primo potenziometro al LED rosso del LED RGB",
  ],
  bookQuote:
    "Gioca ora con le regolazioni e crea il colore che ti piace di più! Prova a chiedere un bicchierino del caffé di plastica bianco e poggialo sopra al LED RGB: diffonderà la luce! A proposito prova questo esperimento al buio!",
  manualCrop: ELAB_V1_CAP9_ESP6_MANUAL_PAGE_IMAGE,
  manualFinalCrop: ELAB_V1_CAP9_ESP6_FINAL_PAGE_IMAGE,
  manualFigurePage: 72,
};

/** Scena reale v1-cap9-esp6 (multi-pin: 3 pot + LED RGB) dal bridge sulla fixture candidate. */
export function createV1Cap9Esp6SimulationScene(): SimulationSceneV1 {
  return simulationSceneFromElabScene(elabSceneCandidateV1Cap9Esp6, ELAB_V1_CAP9_ESP6_BRIDGE_OPTS);
}

// FONTE UNICA: la scena reference deriva dal bridge sulla fixture candidate
// (circuit-scene/2). La vecchia topologia hand-coded (bat+ diretto in bb1:j2,
// nessun rail) violava il testo p30 — falsificata da ElabBookConstraints.
// L'unico delta ammesso rispetto al bridge e' l'override di runtime.ledOn.
export function createReferenceSimulationScene({
  ledOn = true,
}: {
  millis?: number;
  ledOn?: boolean;
} = {}): SimulationSceneV1 {
  const scene = simulationSceneFromElabScene(elabSceneCandidateV1Cap6Esp1, ELAB_V1_CAP6_ESP1_BRIDGE_OPTS);
  if (scene.runtime.kind === "battery-led") {
    scene.runtime.ledOn = ledOn;
  }
  return scene;
}

// Ancore Vol/pag delle scene con fixture circuit-scene/2 montata.
const SCENE_MANUAL_ANCHORS: Record<string, { volume: 1 | 2 | 3; page: number }> = {
  [ELAB_V1_FIRST_LED_EXPERIMENT_ID]: { volume: 1, page: 29 },
  [ELAB_V1_NO_RESISTOR_EXPERIMENT_ID]: { volume: 1, page: 32 },
  [ELAB_V1_LUMINOSITA_EXPERIMENT_ID]: { volume: 1, page: 33 },
  [ELAB_V1_RGB_LAMP_EXPERIMENT_ID]: { volume: 1, page: 71 },
};

const SIMULATION_CORE_CANVAS_STATUS =
  "simulation plugin: canvas ELABTutor core montato su SimulationScene canonica";

export function validateBookLayoutScene(scene: SimulationSceneV1): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const componentIds = new Set(scene.components.map((component) => component.id));
  const bookLayout = scene.bookLayout;

  if (bookLayout.v !== 1) errors.push("bookLayout version drift");
  if (bookLayout.experimentId !== scene.experimentId) errors.push("bookLayout experimentId drift");
  if (bookLayout.volume !== scene.manual.volume || bookLayout.page !== scene.manual.page) {
    errors.push("bookLayout manual reference drift");
  }
  // Ancore manuale per esperimento con scena montata: fail-closed sugli id
  // sconosciuti (mai validare una scena contro l'ancora di un altro libro).
  const anchor = SCENE_MANUAL_ANCHORS[scene.experimentId];
  if (anchor === undefined) {
    errors.push("experimentId drift");
  } else if (scene.manual.volume !== anchor.volume || scene.manual.page !== anchor.page) {
    errors.push("manual reference drift");
  }

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
    if (!matchingConnection) {
      errors.push(`wire drift ${wire.id}`);
      continue;
    }
    // Parità curvatura cavi: se il libro dichiara la polyline, la scena deve
    // riprodurla punto-per-punto entro tolleranza (curvatura cavi perfect).
    if (wire.path) {
      const tolerance = bookLayout.tolerances.coordinatePx;
      const actualPath = matchingConnection.path;
      if (
        !actualPath ||
        actualPath.points.length !== wire.path.points.length ||
        wire.path.points.some((expected, index) => {
          const got = actualPath.points[index];
          return Math.abs(got.x - expected.x) > tolerance || Math.abs(got.y - expected.y) > tolerance;
        })
      ) {
        errors.push(`wire curvature drift ${wire.id}`);
      }
    }
  }

  // Parità esatta di conteggio (numero componenti e numero cavi perfect): il
  // book-layout è esaustivo, quindi la scena non può avere elementi in più.
  const bookComponentIds = new Set(bookLayout.components.map((component) => component.id));
  for (const component of scene.components) {
    if (!bookComponentIds.has(component.id)) errors.push(`extra component ${component.id}`);
  }
  for (const connection of scene.connections) {
    const declared = bookLayout.wires.some(
      (wire) =>
        wire.from.ref === connection.from &&
        wire.to.ref === connection.to &&
        wire.color === connection.color &&
        wire.kind === connection.kind,
    );
    if (!declared) errors.push(`extra wire ${connection.from}->${connection.to}`);
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
  toolId = REFERENCE_SIM_TOOL_ID,
  embedId = REFERENCE_SIM_EMBED_ID,
  // il link segue SEMPRE l'identità richiesta: id e link divergenti farebbero
  // dispatchare al render lo stato di un'altra istanza (P0-C)
  link = `${TOOL_EMBED_SCHEME}${toolId}/${embedId}`,
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

/**
 * P0-C residuo — duplicazione dal canvas. Excalidraw su copy/paste/Alt-drag
 * clona link e customData ma assegna un id NUOVO: l'elemento risultante ha
 * id ≠ embedId nel link, e persistEmbedState (match `el.id === embedId`)
 * farebbe scrivere il duplicato sullo stato dell'ORIGINALE (fantasma).
 * Normalizzazione: ogni embed maestro-tool:// con id ≠ embedId diventa una
 * NUOVA istanza — embedId = id dell'elemento (unico per costruzione), stato
 * clonato (il duplicato parte dallo stato copiato, poi vive di suo).
 * Ritorna gli stessi riferimenti quando non c'è nulla da riscrivere.
 */
export function normalizeDuplicatedToolEmbeds(
  elements: readonly EmbedLike[],
): { elements: EmbedLike[]; changed: boolean } {
  let changed = false;
  const next = elements.map((element) => {
    const parsed = parseToolLink(element.link);
    if (parsed === null || element.id === undefined || element.id === parsed.embedId) {
      return element;
    }
    changed = true;
    return {
      ...element,
      link: `${TOOL_EMBED_SCHEME}${parsed.toolId}/${element.id}`,
      customData: element.customData ? structuredClone(element.customData) : element.customData,
    };
  });
  return changed ? { elements: next, changed } : { elements: [...elements], changed };
}

// P0-C multi-istanza: identità del prossimo post-it. Il primo inserimento usa
// l'embedId storico (scene salvate ed e2e invariati); i successivi suffissano
// "--n" scegliendo il primo libero (mai un id già in scena, anche con buchi).
export function nextSimulationEmbedId(existingIds: readonly string[], baseEmbedId: string): string {
  const taken = new Set(existingIds);
  if (!taken.has(baseEmbedId)) return baseEmbedId;
  for (let n = 2; ; n += 1) {
    const candidate = `${baseEmbedId}--${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * Logica PURA dell'inserimento da toolbar (Room): ogni chiamata produce una
 * NUOVA istanza del Simulation Plugin con embedId unico e stato proprio.
 * null se il tool non è registrato (deny-by-default, come il render).
 *
 * experimentId opzionale: default = scena reference (v1-cap6-esp1); gli altri
 * id ammessi sono SOLO quelli con scena montata nel catalogo (fail-closed:
 * id senza scena reale = null, mai un post-it con dati inventati).
 */
export function buildSimulationInsert(
  currentElements: readonly { id?: string }[],
  experimentId: string = ELAB_V1_FIRST_LED_EXPERIMENT_ID,
): { embed: { id: string } & Record<string, unknown>; embedId: string } | null {
  const entry = getSimulationTool(REFERENCE_SIM_TOOL_ID);
  if (!entry) return null;
  const ids = currentElements.map((el) => el.id).filter((id): id is string => typeof id === "string");
  if (experimentId === ELAB_V1_FIRST_LED_EXPERIMENT_ID) {
    const embedId = nextSimulationEmbedId(ids, entry.embedId);
    return { embed: entry.createEmbed(embedId), embedId };
  }
  if (experimentId === ELAB_V1_NO_RESISTOR_EXPERIMENT_ID) {
    const embedId = nextSimulationEmbedId(ids, ELAB_V1_NO_RESISTOR_EMBED_ID);
    return {
      embed: createToolEmbedElement({
        embedId,
        state: { kind: "simulation-scene-v1", scene: createV1Cap6Esp2SimulationScene() },
      }),
      embedId,
    };
  }
  if (experimentId === ELAB_V1_LUMINOSITA_EXPERIMENT_ID) {
    const embedId = nextSimulationEmbedId(ids, ELAB_V1_LUMINOSITA_EMBED_ID);
    return {
      embed: createToolEmbedElement({
        embedId,
        state: { kind: "simulation-scene-v1", scene: createV1Cap6Esp3SimulationScene() },
      }),
      embedId,
    };
  }
  if (experimentId === ELAB_V1_RGB_LAMP_EXPERIMENT_ID) {
    const embedId = nextSimulationEmbedId(ids, ELAB_V1_RGB_LAMP_EMBED_ID);
    return {
      embed: createToolEmbedElement({
        embedId,
        state: { kind: "simulation-scene-v1", scene: createV1Cap9Esp6SimulationScene() },
      }),
      embedId,
    };
  }
  return null;
}

export function renderToolCanvasEmbeddable(
  element: EmbedLike,
  host?: SimulationToolHost,
): ReactElement | null {
  const pluginPostitBoard = renderPluginPostitBoardEmbeddable(element);
  if (pluginPostitBoard !== null) return pluginPostitBoard;

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
  createEmbed: (embedId?: string) =>
    createToolEmbedElement(embedId === undefined ? {} : { embedId }),
  validate: (state: unknown) => validateBookLayoutScene(state as SimulationSceneV1),
  // Confine P2: il motore elettrico reale (CircuitSolver vendored) dietro il
  // dispatch del registry. Il render resta traversal-driven (golden 14.9 mA).
  solve: solveElabExperiment,
};
registerSimulationTool(REFERENCE_SIM_TOOL_ID, referenceSimulationEntry);
registerSimulationTool(LEGACY_REFERENCE_SIM_TOOL_ID, referenceSimulationEntry);
registerSimulationTool(REFERENCE_PLUGIN_REF_ID, referenceSimulationEntry);

// Montaggio libero slice 3 — tap-tap dalla palette SVG (LIM-first: sul touch
// il tap-tap è il gesto affidabile, il drag no). Semantica occupazione = #93:
// contano i SOLI pinAssignments; foro occupato → notice, MAI piazzamento muto.
export type MontaggioPlacementType = "resistor" | "led" | "wire";
/** Strumenti della palette: i tipi piazzabili + la gomma (rimozione, D7). */
export type MontaggioTool = MontaggioPlacementType | "eraser";
export type MontaggioPlacement = { id: string; type: MontaggioPlacementType; holes: [string, string] };
type MontaggioState = {
  placements: MontaggioPlacement[];
  operations?: SimulationOperationEnvelope[];
};
export type MontaggioCanvas = {
  tool: MontaggioTool | null;
  pending: string | null;
  notice: string | null;
  placements: MontaggioPlacement[];
  onSelectTool: (tool: MontaggioTool | null) => void;
  onHoleTap: (ref: string) => void;
  onReset: () => void;
};

export function createBoardSceneWithPlacements(
  scene: SimulationSceneV1,
  placements: readonly MontaggioPlacement[],
): SimulationSceneV1 {
  if (placements.length === 0) return scene;
  const components = [...scene.components];
  const pinAssignments = { ...scene.pinAssignments };
  const connections = [...scene.connections];
  for (const placement of placements) {
    if (placement.type === "wire") {
      // Il cavo è una CONNECTION, non un component (D6): buildNets unisce già
      // pinAssignments ∪ connections, quindi la continuità elettrica è reale
      // a solver invariato; BoardWires lo disegna con la bezier di fallback.
      connections.push({
        from: placement.holes[0],
        to: placement.holes[1],
        color: "green",
        kind: "wire",
      });
    } else if (placement.type === "resistor") {
      components.push({
        id: placement.id,
        type: "resistor",
        label: "Resistore montaggio libero",
        value: 470,
        anchor: "bb1",
      });
      pinAssignments[`${placement.id}:pin1`] = placement.holes[0];
      pinAssignments[`${placement.id}:pin2`] = placement.holes[1];
    } else {
      components.push({
        id: placement.id,
        type: "led",
        label: "LED montaggio libero",
        color: "red",
        anchor: "bb1",
      });
      pinAssignments[`${placement.id}:anode`] = placement.holes[0];
      pinAssignments[`${placement.id}:cathode`] = placement.holes[1];
    }
  }
  return { ...scene, components, pinAssignments, connections };
}

export function createMontaggioPlacementOperations({
  embedId,
  placements,
}: {
  embedId: string;
  placements: readonly MontaggioPlacement[];
}): SimulationOperationEnvelope[] {
  return placements.map((placement) => {
    const envelopeBase = {
      schema: "simulation-operation/1",
      actor: "manual",
      origin: "canvas",
      targetProvider: "local",
      providerMode: "static",
    } as const;
    if (placement.type === "wire") {
      // Cavo = connect-wire (vocabolario esistente), non place-component (D6).
      return {
        ...envelopeBase,
        id: `${embedId}:montaggio:connect:${placement.id}`,
        operation: {
          kind: "connect-wire",
          wire: {
            id: placement.id,
            from: placement.holes[0],
            to: placement.holes[1],
            color: "green",
          },
        },
      };
    }
    return {
      ...envelopeBase,
      id: `${embedId}:montaggio:place:${placement.id}`,
      operation: {
        kind: "place-component",
        component: montaggioComponentDescriptor(placement),
        pose: poseFromMontaggioHoles(placement.holes),
        pinAssignments: montaggioPinAssignments(placement),
      },
    };
  });
}

function montaggioComponentDescriptor(
  placement: MontaggioPlacement,
): PlaceComponentOperation["component"] {
  if (placement.type === "resistor") {
    return {
      id: placement.id,
      type: "resistor",
      label: "Resistore montaggio libero",
      attrs: { value: 470 },
      pins: [{ id: "pin1" }, { id: "pin2" }],
    };
  }
  return {
    id: placement.id,
    type: "led",
    label: "LED montaggio libero",
    attrs: { color: "red" },
    pins: [{ id: "anode" }, { id: "cathode" }],
  };
}

function montaggioPinAssignments(placement: MontaggioPlacement): Record<string, string> {
  if (placement.type === "resistor") {
    return {
      [`${placement.id}:pin1`]: placement.holes[0],
      [`${placement.id}:pin2`]: placement.holes[1],
    };
  }
  return {
    [`${placement.id}:anode`]: placement.holes[0],
    [`${placement.id}:cathode`]: placement.holes[1],
  };
}

function poseFromMontaggioHoles(
  holes: MontaggioPlacement["holes"],
): { x: number; y: number; rotation?: number } {
  const first = pointForBreadboardRef(holes[0]);
  const second = pointForBreadboardRef(holes[1]);
  if (first === null || second === null) return { x: 0, y: 0 };
  const dx = second.x - first.x;
  const dy = second.y - first.y;
  return {
    x: Math.round((first.x + second.x) / 2),
    y: Math.round((first.y + second.y) / 2),
    rotation: Math.abs(dx) >= Math.abs(dy) ? 0 : 90,
  };
}

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
  const baseScene = useMemo(
    () => resolveSimulationScene(marker?.state, snapshot),
    [marker?.state, snapshot],
  );
  // Manipolazione libera: un override locale della scena (es. break di un
  // collegamento) ha la precedenza finché non si cambia esperimento. Il break
  // reale muta le connections → la fisica reale (deriveSimulationSolveOutcome)
  // osserva l'open-circuit; lo stato viene persistito per il reopen.
  const [sceneOverride, setSceneOverride] = useState<SimulationSceneV1 | null>(null);
  useEffect(() => {
    setSceneOverride(null);
  }, [baseScene.experimentId]);
  const scene = sceneOverride ?? baseScene;
  // La validazione book-layout resta sulla scena del MANUALE: i piazzamenti
  // dello studente non sono un drift del libro.
  const validation = validateBookLayoutScene(scene);

  const [montaggioTool, setMontaggioTool] = useState<MontaggioTool | null>(null);
  const [pendingHole, setPendingHole] = useState<string | null>(null);
  // Ripristino al mount dallo state persistito; da lì in poi lo stato locale
  // guida la UI e ogni cambio viene riscritto nell'embed (se l'host lo offre).
  const [placements, setPlacements] = useState<MontaggioPlacement[]>(
    () => marker?.state?.montaggio?.placements ?? [],
  );
  const [montaggioNotice, setMontaggioNotice] = useState<string | null>(null);

  // Passo-passo VIVO: i predicati del libro valutati sul circuito attivo
  // (scena + placements). Nessuna persistenza del toggle: è una vista.
  const [stepMode, setStepMode] = useState(false);
  const stepModel = useMemo(() => stepByStepModel(scene, placements), [scene, placements]);
  const catalog = catalogSummary();
  // Metriche per canale delle scene multi-pin (elab-mna): stesso solve della
  // board, memoizzato sulla scena.
  const sideMnaView = useMemo(
    () => (scene.runtime.kind === "elab-mna" ? computeElabMnaView(scene) : null),
    [scene],
  );

  // host-observes-solve (G7): quando l'esito del solve cambia in modo
  // significativo (risolto con corrente / errore elettrico), registra un evento
  // LessonOS tipato per il loop break→explain. Dedup per firma: nessuno spam su
  // ri-render; nessuna emissione per esiti idle. Il mapping esito→evento è la
  // funzione PURA e testata simulationSolveEvent.
  const lastEmittedSolveRef = useRef<string | null>(null);
  useEffect(() => {
    if (!host?.emitLessonEvent) return;
    const outcome = deriveSimulationSolveOutcome(scene, sideMnaView, validation.ok);
    if (outcome.kind === "idle") return;
    const signature =
      outcome.kind === "solved"
        ? `solved:${outcome.currentMa.toFixed(1)}:${outcome.bookLayoutValid}`
        : `error:${outcome.code}`;
    if (lastEmittedSolveRef.current === signature) return;
    const event = simulationSolveEvent({ experimentId: scene.experimentId, outcome, t: Date.now() });
    if (!event) return;
    lastEmittedSolveRef.current = signature;
    host.emitLessonEvent(event);
  }, [host, scene, sideMnaView, validation.ok]);

  function applyPlacements(next: MontaggioPlacement[]) {
    setPlacements(next);
    if (host?.persistEmbedState && marker?.state) {
      host.persistEmbedState(toolLink.embedId, {
        ...marker.state,
        montaggio: {
          placements: next,
          operations: createMontaggioPlacementOperations({
            embedId: toolLink.embedId,
            placements: next,
          }),
        },
      });
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

  function handleSelectTool(tool: MontaggioTool | null) {
    setMontaggioTool(tool);
    setPendingHole(null);
    setMontaggioNotice(null);
  }

  function handleHoleTap(ref: string) {
    if (montaggioTool === null) return;
    if (montaggioTool === "eraser") {
      // GOMMA (D7): rimuove il placement che possiede questo foro. Il manuale è
      // strutturalmente intoccabile (i componenti del libro NON sono placements).
      // Al più un placement per foro (regola un-foro-un-reoforo) → mai ambiguo.
      const target = placements.find((p) => p.holes[0] === ref || p.holes[1] === ref);
      if (!target) {
        setMontaggioNotice(
          occupiedHoles.has(ref)
            ? `foro ${ref}: componente del manuale, non si cancella`
            : `foro ${ref}: nessun componente libero da cancellare`,
        );
        return;
      }
      applyPlacements(placements.filter((p) => p.id !== target.id));
      setMontaggioNotice(null);
      return;
    }
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
    const id =
      montaggioTool === "resistor"
        ? `r-libero-${ordinal}`
        : montaggioTool === "wire"
          ? `cavo-libero-${ordinal}`
          : `led-libero-${ordinal}`;
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
  const boardScene = useMemo(
    () => createBoardSceneWithPlacements(scene, placements),
    [scene, placements],
  );
  // Fisica reale proiettata nel DOM (contratto stabile per la trace v0). La
  // fisica è quella del circuito EFFETTIVAMENTE costruito = boardScene (scena
  // del libro ± break ± componenti piazzati dalla palette), NON la sola scena
  // del manuale: badge/diagnostica/digest riflettono ciò che lo studente ha
  // davanti. Stesso deriveSimulationSolveOutcome dell'emit verso l'host.
  const boardMnaView = useMemo(
    () => (boardScene.runtime.kind === "elab-mna" ? computeElabMnaView(boardScene) : null),
    [boardScene],
  );
  const solveOutcome = useMemo(
    () => deriveSimulationSolveOutcome(boardScene, boardMnaView, validation.ok),
    [boardScene, boardMnaView, validation.ok],
  );
  const solveEvent = useMemo(
    () => simulationSolveEvent({ experimentId: boardScene.experimentId, outcome: solveOutcome, t: 0 }),
    [boardScene.experimentId, solveOutcome],
  );
  const sceneDigest = useMemo(() => simulationSceneDigest(boardScene), [boardScene]);

  function persistScene(nextScene: SimulationSceneV1) {
    if (host?.persistEmbedState && marker?.state?.kind === "simulation-scene-v1") {
      host.persistEmbedState(toolLink.embedId, { ...marker.state, scene: nextScene });
    }
  }

  function handleBreakConnections() {
    // Break reale = apri il circuito scollegando la batteria. La connettività
    // reale (buildNets) unisce sia pinAssignments sia connections: per un
    // open-circuit deterministico va rimossa OGNI incidenza della batteria in
    // entrambi. Il solver (solveSeriesLoop) allora non trova più il cammino
    // battery:positive→battery:negative → deriveSimulationSolveOutcome emette
    // open-circuit. Nessuna scorciatoia: è la stessa fisica del canvas.
    const battery = scene.components.find((component) => component.type === "battery9v");
    if (!battery) return;
    const prefix = `${battery.id}:`;
    const nextPinAssignments = Object.fromEntries(
      Object.entries(scene.pinAssignments).filter(([pinRef]) => !pinRef.startsWith(prefix)),
    );
    const nextConnections = scene.connections.filter(
      (connection) => !connection.from.startsWith(prefix) && !connection.to.startsWith(prefix),
    );
    const next: SimulationSceneV1 = {
      ...scene,
      pinAssignments: nextPinAssignments,
      connections: nextConnections,
    };
    setSceneOverride(next);
    persistScene(next);
  }

  function handleRestoreConnections() {
    setSceneOverride(null);
    persistScene(baseScene);
  }
  const coreCanvasProjectionMode: ElabCanvasProjectionMode =
    placements.length > 0 || montaggioTool !== null || marker?.state?.montaggio !== undefined
      ? "monta-tu"
      : "gia-montato";

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
    <section
      style={shellStyle}
      data-simulation-surface="elab-core-canvas"
      data-elab-core-canvas-mounted="true"
      aria-label={SIMULATION_CORE_CANVAS_STATUS}
    >
      <header style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Simulation Plugin Canvas</div>
          <h2 style={titleStyle}>{scene.title}</h2>
          <div style={manualRefStyle}>{scene.manual.label}</div>
          <div style={harnessBannerStyle}>{SIMULATION_CORE_CANVAS_STATUS}</div>
          {/* Onestà di catalogo: la UI non vende esperimenti non montati. */}
          <div
            style={catalogBannerStyle}
            data-elab-catalog-summary={`${catalog.mounted}/${catalog.total}`}
          >
            {catalog.label}
          </div>
        </div>
        <div style={toolIdStyle}>{toolLink.toolId}</div>
      </header>

      <main style={mainStyle}>
        <div style={boardStackStyle}>
          <section
            data-simulation-free-mode
            data-sim-solve-kind={solveOutcome.kind}
            data-sim-current-ma={
              solveOutcome.kind === "solved" ? solveOutcome.currentMa.toFixed(1) : "0.0"
            }
            data-sim-last-event-kind={solveEvent?.kind ?? "idle"}
            data-sim-error-id={
              solveEvent?.kind === "simulation.error.observed" ? solveEvent.errorId : ""
            }
            data-sim-scene-digest={sceneDigest}
            aria-label="Manipolazione libera — fisica reale"
            style={freeModeStripStyle}
          >
            <span style={freeModeBadgeStyle}>
              {solveOutcome.kind === "solved"
                ? `corrente ${solveOutcome.currentMa.toFixed(1)} mA`
                : solveOutcome.kind === "error"
                  ? `errore: ${solveOutcome.message}`
                  : "in attesa"}
            </span>
            {solveEvent?.kind === "simulation.error.observed" && (
              <span data-sim-diagnostic role="status" style={freeModeDiagnosticStyle}>
                {solveEvent.labels.it ?? "errore elettrico osservato"}
              </span>
            )}
            <button
              type="button"
              data-sim-break
              onClick={handleBreakConnections}
              style={freeModeButtonStyle}
            >
              Rompi i collegamenti
            </button>
            <button
              type="button"
              data-sim-restore
              onClick={handleRestoreConnections}
              style={freeModeButtonStyle}
            >
              Ripristina
            </button>
          </section>
          <ElabCoreCanvasMount
            scene={boardScene}
            projectionMode={coreCanvasProjectionMode}
            markerState={marker?.state}
            toolLink={toolLink}
            host={host}
          />
          <details style={legacyHarnessDetailsStyle} data-legacy-free-assembly-harness>
            <summary style={legacyHarnessSummaryStyle}>Montaggio libero legacy</summary>
            <SimulationBoard scene={boardScene} montaggio={montaggio} />
          </details>
        </div>

        <aside style={sideStyle}>
          <ManualCard scene={scene} />
          <StepByStepCard
            scene={scene}
            model={stepModel}
            active={stepMode}
            onToggle={() => setStepMode((prev) => !prev)}
          />
          <div style={metricGridStyle}>
            {scene.runtime.kind === "arduino-blink" ? (
              <>
                <Metric label="pin" value={String(scene.runtime.ledPin)} />
                <Metric label="mode" value="OUTPUT" />
                <Metric label="level" value={snapshot.ledOn ? "HIGH" : "LOW"} />
                <Metric label="millis" value={String(snapshot.millis)} />
              </>
            ) : scene.runtime.kind === "battery-led-senza-resistore" ? (
              <>
                <Metric label="sorgente" value={`${scene.runtime.supplyVolts} V`} />
                <Metric label="resistore" value="ASSENTE!" />
                <Metric label="LED" value="BRUCIATO" />
                <Metric label="corrente" value="sovracorrente" />
              </>
            ) : scene.runtime.kind === "elab-mna" ? (
              sideMnaView === null || !sideMnaView.ok ? (
                <>
                  <Metric label="sorgente" value={`${scene.runtime.supplyVolts} V`} />
                  <Metric label="solve" value="non disponibile" />
                </>
              ) : (
                <>
                  <Metric label="sorgente" value={`${scene.runtime.supplyVolts} V`} />
                  <Metric label="canale R" value={formatChannelMa(sideMnaView.channels.red)} />
                  <Metric label="canale G" value={formatChannelMa(sideMnaView.channels.green)} />
                  <Metric label="canale B" value={formatChannelMa(sideMnaView.channels.blue)} />
                </>
              )
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

function ElabCoreCanvasMount({
  scene,
  projectionMode,
  markerState,
  toolLink,
  host,
}: {
  scene: SimulationSceneV1;
  projectionMode: ElabCanvasProjectionMode;
  markerState?: SimulationToolState;
  toolLink: ToolLink;
  host?: SimulationToolHost;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localScene, setLocalScene] = useState(scene);
  const [mountStatus, setMountStatus] = useState<"pending" | "mounted" | "error">("pending");
  const [lastOperationId, setLastOperationId] = useState<string | null>(null);

  useEffect(() => {
    setLocalScene(scene);
  }, [scene]);

  const canvasState = useMemo(
    () => simulationSceneToElabCanvasState(localScene, { projectionMode }),
    [localScene, projectionMode],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (node === null) return;
    let disposed = false;
    let handle: { dispose(): void } | null = null;
    setMountStatus("pending");
    void import("@elab-tutor-plugin/plugin/renderEmbeddable")
      .then(({ renderEmbeddable }) => {
        if (disposed) return;
        handle = renderEmbeddable(node, {
          experiment: canvasState.experiment,
          componentStates: canvasState.componentStates,
          onLayoutChange: (componentId: string, pose: { x: number; y: number; rotation?: number; parentId?: string }) => {
            const operation = elabCanvasLayoutChangeOperation({
              id: `${toolLink.embedId}:move:${componentId}:${Math.round(pose.x)}:${Math.round(pose.y)}`,
              componentId,
              pose,
            });
            setLastOperationId(operation.id);
            setLocalScene((current) => {
              const nextScene = applyElabCanvasLayoutChange(current, componentId, pose);
              if (host?.persistEmbedState && markerState?.kind === "simulation-scene-v1") {
                host.persistEmbedState(toolLink.embedId, { ...markerState, scene: nextScene });
              }
              return nextScene;
            });
          },
          onConnectionAdd: (from: string, to: string) => {
            const connection: ElabCanvasWireEventConnection = {
              id: `${toolLink.embedId}:wire:${canvasState.experiment.connections.length + 1}`,
              from,
              to,
              color: inferCanvasWireColor(from, to),
            };
            const operation = elabCanvasConnectionAddOperation({
              id: `${toolLink.embedId}:connect:${connection.id}`,
              connection,
            });
            setLastOperationId(operation.id);
            setLocalScene((current) => {
              const nextScene = applyElabCanvasConnectionAdd(current, connection);
              if (host?.persistEmbedState && markerState?.kind === "simulation-scene-v1") {
                host.persistEmbedState(toolLink.embedId, { ...markerState, scene: nextScene });
              }
              return nextScene;
            });
          },
          onWireUpdate: (wireIndex: number, connection: ElabCanvasWireEventConnection) => {
            setLocalScene((current) => {
              const operation = elabCanvasWireUpdateOperation({
                id: `${toolLink.embedId}:wire-update:${wireIndex}`,
                scene: current,
                wireIndex,
                connection,
              });
              setLastOperationId(operation.id);
              const nextScene = applyElabCanvasWireUpdate(current, wireIndex, connection);
              if (host?.persistEmbedState && markerState?.kind === "simulation-scene-v1") {
                host.persistEmbedState(toolLink.embedId, { ...markerState, scene: nextScene });
              }
              return nextScene;
            });
          },
          onWireDelete: (wireIndex: number) => {
            setLocalScene((current) => {
              const operation = elabCanvasWireDeleteOperation({
                id: `${toolLink.embedId}:wire-delete:${wireIndex}`,
                scene: current,
                wireIndex,
              });
              setLastOperationId(operation.id);
              const nextScene = applyElabCanvasWireDelete(current, wireIndex);
              if (host?.persistEmbedState && markerState?.kind === "simulation-scene-v1") {
                host.persistEmbedState(toolLink.embedId, { ...markerState, scene: nextScene });
              }
              return nextScene;
            });
          },
          className: "ardesia-simulation-elab-core-canvas",
          style: { width: "100%", height: "100%" },
        });
        setMountStatus("mounted");
      })
      .catch(() => {
        if (!disposed) setMountStatus("error");
      });
    return () => {
      disposed = true;
      handle?.dispose();
    };
  }, [canvasState, host, markerState, toolLink.embedId]);

  return (
    <section
      style={elabCoreStageStyle}
      data-elab-core-canvas-mounted={mountStatus === "mounted" ? "true" : mountStatus}
      data-elab-canvas-source-of-truth={canvasState.sourceOfTruth}
      data-elab-canvas-experiment-id={canvasState.experiment.id}
      data-elab-canvas-components={String(canvasState.experiment.components.length)}
      data-elab-canvas-build-mode={canvasState.experiment.buildMode}
      data-elab-canvas-projection-mode={canvasState.projectionMode}
      data-elab-canvas-last-operation={lastOperationId ?? undefined}
      aria-label={`Canvas ELABTutor core ${canvasState.experiment.id}`}
    >
      <div ref={containerRef} style={elabCoreMountNodeStyle} data-elab-core-canvas-host />
      {canvasState.diagnostics.length > 0 && (
        <div style={elabCoreDiagnosticStyle} role="status">
          {canvasState.diagnostics.join("; ")}
        </div>
      )}
    </section>
  );
}

function inferCanvasWireColor(from: string, to: string): string {
  const joined = `${from} ${to}`.toLowerCase();
  if (joined.includes("positive") || joined.includes("plus")) return "red";
  if (joined.includes("negative") || joined.includes("minus") || joined.includes("gnd")) return "black";
  return "green";
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

function StepByStepCard({
  scene,
  model,
  active,
  onToggle,
}: {
  scene: SimulationSceneV1;
  model: StepByStepModel;
  active: boolean;
  onToggle: () => void;
}) {
  const pageImage = scene.bookLayout.manualSource.crop;
  return (
    <section style={manualPostItStyle} aria-label="Modalita passo passo">
      <div style={stepHeaderRowStyle}>
        <div style={stepHeaderStyle}>PASSO PASSO</div>
        <button
          type="button"
          data-testid="step-mode-toggle"
          aria-pressed={active}
          onClick={onToggle}
          style={active ? stepToggleActiveStyle : stepToggleStyle}
        >
          {active ? `Verifica viva ${model.passedCount}/${model.total}` : "Passo-passo"}
        </button>
      </div>
      {pageImage && (
        <div style={manualZoomFrameStyle} aria-label="Zoom reale della figura circuito sul manuale">
          <img
            src={pageImage}
            alt={`Zoom reale sulla pagina passo passo del manuale ELAB Volume ${scene.manual.volume}`}
            style={manualZoomImageStyle}
          />
        </div>
      )}
      {active ? (
        /* Verifica VIVA: ogni step passa solo se la topologia del circuito
           attivo soddisfa i predicati del libro (didacticSteps). */
        <ol style={stepListStyle}>
          {model.steps.map((step) => (
            <li
              key={step.id}
              data-step-id={step.id}
              data-step-passed={step.passed ? "true" : "false"}
              data-step-current={model.firstFailingId === step.id ? "true" : undefined}
              style={
                model.firstFailingId === step.id
                  ? { ...stepItemStyle, ...stepItemCurrentStyle }
                  : stepItemStyle
              }
            >
              <span style={step.passed ? stepNumberDoneStyle : stepNumberStyle}>
                {step.passed ? "✓" : step.order}
              </span>
              <span>
                {step.instructionIt}
                <span style={stepEvidenceStyle}>
                  {step.evidence.map((item) => (
                    <span key={`${item.page}-${item.evidence}`} style={stepEvidenceItemStyle}>
                      Vol.{scene.manual.volume} pag.{item.page} — «{item.evidence}»
                    </span>
                  ))}
                </span>
                {!step.passed && step.failures.length > 0 && (
                  <span style={stepFailureStyle}>{step.failures.join("; ")}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ol style={stepListStyle}>
          {scene.manual.bookInstructions.map((instruction, index) => (
            <li key={instruction} style={stepItemStyle}>
              <span style={stepNumberStyle}>{index + 1}</span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ── Vista canali per scene multi-pin (runtime elab-mna) ─────────────────────
// Il verdetto per canale esce dal motore MNA reale sui dati della scena.
// currentMa è l'inversione esatta della formula del motore (brightness =
// clamped/0.03, CircuitSolver._solveRGBLed): sotto il clamp è il valore vero,
// a brightness 1 il motore ha clampato → si dichiara ">= 30", mai un numero finto.
type ElabMnaChannel = { on: boolean; brightness: number; currentMa: number };
type ElabMnaChannels = { red: ElabMnaChannel; green: ElabMnaChannel; blue: ElabMnaChannel };
type ElabMnaView =
  | { ok: true; channels: ElabMnaChannels; anyOn: boolean }
  | { ok: false; error: string };

function computeElabMnaView(scene: SimulationSceneV1): ElabMnaView {
  const rgb = scene.components.find((component) => component.type === "rgb-led");
  if (!rgb) return { ok: false, error: "scena elab-mna senza LED RGB" };
  let result: SolveResult;
  try {
    result = solveElabExperiment({
      components: scene.components.map((component) => ({
        id: component.id,
        type: component.type,
        ...(component.value !== undefined ? { value: component.value } : {}),
        ...(component.color !== undefined ? { color: component.color } : {}),
      })),
      connections: scene.connections.map((connection) => ({
        from: connection.from,
        to: connection.to,
        color: connection.color,
      })),
      pinAssignments: scene.pinAssignments,
    });
  } catch (error) {
    // Fail-visible: l'errore del solve arriva in diagnostica, mai verde finto.
    return { ok: false, error: (error as Error).message };
  }
  const state = result.componentStates[rgb.id] as
    | Partial<Record<"red" | "green" | "blue", { on?: boolean; brightness?: number }>>
    | undefined;
  const channel = (name: "red" | "green" | "blue"): ElabMnaChannel => {
    const raw = state?.[name];
    const brightness = raw?.brightness ?? 0;
    return { on: raw?.on === true, brightness, currentMa: brightness * 30 };
  };
  const channels = { red: channel("red"), green: channel("green"), blue: channel("blue") };
  return {
    ok: true,
    channels,
    anyOn: channels.red.on || channels.green.on || channels.blue.on,
  };
}

// Normalizza l'esito del solve (multi-runtime) in un outcome uniforme per
// simulationSolveEvent. Riusa le viste già calcolate: computeElabMnaView per le
// scene elab-mna, batteryLedCurrentMa per le scene battery-led. Puro sul dato.
function deriveSimulationSolveOutcome(
  scene: SimulationSceneV1,
  mnaView: ElabMnaView | null,
  bookLayoutValid: boolean,
): SimulationSolveOutcome {
  if (scene.runtime.kind === "battery-led-senza-resistore") {
    return {
      kind: "error",
      code: "missing-resistor",
      conceptId: "resistenza",
      message: "Resistore mancante: corrente pericolosa per il LED",
    };
  }
  if (scene.runtime.kind === "elab-mna") {
    if (mnaView && !mnaView.ok) {
      return { kind: "error", code: "solve-failed", conceptId: "circuito_chiuso", message: mnaView.error };
    }
    if (mnaView && mnaView.ok && mnaView.anyOn) {
      const lit = mnaView.channels.red.on
        ? mnaView.channels.red
        : mnaView.channels.green.on
          ? mnaView.channels.green
          : mnaView.channels.blue;
      return { kind: "solved", currentMa: Number(lit.currentMa.toFixed(1)), bookLayoutValid };
    }
    return { kind: "idle" };
  }
  const ma = batteryLedCurrentMa(scene);
  if (ma > 0) return { kind: "solved", currentMa: Number(ma.toFixed(1)), bookLayoutValid };
  // Corrente 0: distinguere "spento per scelta" (idle) da "circuito ROTTO" (error),
  // così un break reale durante la manipolazione libera emette simulation.error.observed
  // ("spiegare errori"). Verdetto da fisica reale: solveSeriesLoop.closed /
  // resistanceOhms, mai da una formula hard-coded.
  if (scene.runtime.kind === "battery-led" && scene.runtime.ledOn) {
    const loop = solveSeriesLoop(scene);
    if (!loop.closed) {
      return {
        kind: "error",
        code: "open-circuit",
        conceptId: "circuito_chiuso",
        message: "Circuito aperto: la corrente non scorre — controlla i collegamenti",
      };
    }
    if (loop.resistanceOhms <= 0) {
      return {
        kind: "error",
        code: "no-resistor",
        conceptId: "resistenza",
        message: "Nessuna resistenza sul percorso: corrente pericolosa per il LED",
      };
    }
  }
  return { kind: "idle" };
}

function formatChannelMa(channel: ElabMnaChannel): string {
  return channel.brightness >= 1 ? ">= 30 mA" : `${channel.currentMa.toFixed(1)} mA`;
}

export function SimulationBoard({ scene, montaggio }: { scene: SimulationSceneV1; montaggio?: MontaggioCanvas }) {
  const ledCurrentMa = batteryLedCurrentMa(scene);
  const mnaView = useMemo(
    () => (scene.runtime.kind === "elab-mna" ? computeElabMnaView(scene) : null),
    [scene],
  );
  const hasBattery = scene.components.some((component) => component.type === "battery9v");
  return (
    <div style={boardStageStyle} data-experiment-id={scene.experimentId}>
      <svg width="100%" height="100%" viewBox="0 0 920 520" role="img" aria-label={`Simulation harness breadboard ELABTutor ${scene.experimentId}`}>
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
          <PotentiometersSvg scene={scene} />
          <RgbLedSvg scene={scene} channels={mnaView?.ok === true ? mnaView.channels : null} />
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
          <PaletteItem
            x={338}
            label="Cavo"
            glyph="M9 35 C18 10 34 12 39 30"
            pressed={montaggio ? montaggio.tool === "wire" : undefined}
            onSelect={montaggio ? () => montaggio.onSelectTool("wire") : undefined}
          />
          <PaletteItem
            x={418}
            label="Gomma"
            glyph="M12 34 L26 12 L38 20 L26 40 H16 Z M20 40 H40"
            pressed={montaggio ? montaggio.tool === "eraser" : undefined}
            onSelect={montaggio ? () => montaggio.onSelectTool("eraser") : undefined}
          />
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
          ) : scene.runtime.kind === "battery-led-senza-resistore" ? (
            <>
              <text x="16" y="48" style={diagnosticSvgStyle}>batteria {scene.runtime.supplyVolts}.00 V - LED BRUCIATO</text>
              <text x="16" y="68" style={diagnosticSvgStyle}>SENZA RESISTORE: sovracorrente (Vol.1 p.32)</text>
            </>
          ) : scene.runtime.kind === "elab-mna" ? (
            <>
              <text x="16" y="48" style={diagnosticSvgStyle}>
                batteria {scene.runtime.supplyVolts}.00 V - LED RGB {mnaView?.ok === true && mnaView.anyOn ? "ON" : "OFF"}
              </text>
              <text x="16" y="68" style={diagnosticSvgStyle} data-rgb-channels>
                {mnaView === null
                  ? ""
                  : mnaView.ok
                    ? `R ${formatChannelMa(mnaView.channels.red)} - G ${formatChannelMa(mnaView.channels.green)} - B ${formatChannelMa(mnaView.channels.blue)}`
                    : `solve non disponibile: ${mnaView.error}`}
              </text>
            </>
          ) : (
            <>
              <text x="16" y="48" style={diagnosticSvgStyle}>batteria {scene.runtime.supplyVolts}.00 V - LED {scene.runtime.ledOn ? "ON" : "OFF"}</text>
              <text x="16" y="68" style={diagnosticSvgStyle}>corrente {ledCurrentMa.toFixed(1)} mA - R={scene.runtime.resistorOhms} Ohm</text>
              {ledStressZone(ledCurrentMa / 1000) !== "nominale" && (
                <text x="16" y="78" style={diagnosticSvgStyle} data-led-stress-zone={ledStressZone(ledCurrentMa / 1000)}>
                  {LED_STRESS_ZONE_LABELS[ledStressZone(ledCurrentMa / 1000)]}
                </text>
              )}
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
  // Hover node highlight: ref sotto il puntatore → nodeId della sua strip.
  const [hoverRef, setHoverRef] = useState<string | null>(null);
  const hoverNodeId = hoverRef === null ? null : (parseBreadboardRef(hoverRef)?.nodeId ?? null);
  const hoverLabel = hoverRef === null ? null : `${hoverRef} — ${describeHole(hoverRef).labelIt}`;
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
            highlighted={hoverNodeId !== null && point.nodeId === hoverNodeId}
            onHover={setHoverRef}
          />
        );
      })}
      {/* Hover node highlight (breadboard copy system): il foro sotto il
          puntatore illumina TUTTA la sua tie-strip/rail e dichiara il ref col
          vocabolario del libro — il docente vede la net, non un puntino. */}
      {hoverLabel !== null && (
        <text x="126.5" y="-4" textAnchor="middle" style={bbHoverLabelStyle} data-bb-hover-label>
          {hoverLabel}
        </text>
      )}
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
  highlighted,
  onHover,
}: {
  x: number;
  y: number;
  activeColor?: string;
  holeRef?: string;
  pending?: boolean;
  onTap?: (ref: string) => void;
  highlighted?: boolean;
  onHover?: (ref: string | null) => void;
}) {
  return (
    <g
      data-bb-hole={holeRef}
      data-pending={pending ? "1" : undefined}
      data-highlight={highlighted ? "1" : undefined}
      onClick={onTap && holeRef ? () => onTap(holeRef) : undefined}
      onMouseEnter={onHover && holeRef ? () => onHover(holeRef) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      style={onTap ? { cursor: "pointer" } : undefined}
    >
      {highlighted && <circle cx={x} cy={y} r="3.4" fill="#2f68ad" opacity="0.22" />}
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
      {scene.runtime.kind !== "elab-mna" && scene.runtime.ledOn && (
        <circle cx="150" cy="57" r="5" fill="#91e64f" filter="url(#led-glow)" opacity="0.9" />
      )}
      <circle cx="150" cy="57" r="2.8" fill={scene.runtime.kind !== "elab-mna" && scene.runtime.ledOn ? "#91e64f" : "#587067"} stroke="#123429" strokeWidth="0.4" />
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
  // TUTTI i resistori del manuale (r1, r2, r3, …): la selezione scandisce i
  // componenti, mai id hard-codati. I piazzamenti del montaggio libero
  // (r-libero-*) restano di PlacedPartsSvg — qui vengono esclusi.
  const resistors = scene.components.filter(
    (component) => component.type === "resistor" && !component.id.startsWith("r-libero-"),
  );
  return (
    <g>
      {resistors.map((resistor) => {
        // Scene senza resistore o pin non assegnati: niente da disegnare — e
        // mai parseBreadboardRef su un ref assente.
        const pin1 = scene.pinAssignments[`${resistor.id}:pin1`];
        const pin2 = scene.pinAssignments[`${resistor.id}:pin2`];
        if (pin1 === undefined || pin2 === undefined) return null;
        const a = pointForBreadboardRef(pin1);
        const b = pointForBreadboardRef(pin2);
        if (!a || !b) return null;
        return (
          <g key={resistor.id} aria-label={`Resistore ${resistor.value ?? 470} Ohm`} pointerEvents="none">
            <ResistorBody a={a} b={b} ohms={resistor.value ?? 470} />
          </g>
        );
      })}
    </g>
  );
}

function PotentiometersSvg({ scene }: { scene: SimulationSceneV1 }) {
  // Potenziometro 3-pin (vcc/signal/gnd su tie-strip adiacenti): corpo con
  // manopola blu sopra il canale centrale, come nelle figure del libro.
  const pots = scene.components.filter((component) => component.type === "potentiometer");
  return (
    <g>
      {pots.map((pot) => {
        const pins = ["vcc", "signal", "gnd"].map((pin) =>
          pointForBreadboardRef(scene.pinAssignments[`${pot.id}:${pin}`] ?? ""),
        );
        if (pins.some((pin) => pin === null)) return null;
        const [vcc, signal, gnd] = pins as Array<{ x: number; y: number }>;
        const cx = signal.x;
        const cy = signal.y - 12;
        return (
          <g key={pot.id} aria-label={pot.label} pointerEvents="none">
            {[vcc, signal, gnd].map((pin, index) => (
              <line
                key={index}
                x1={pin.x}
                y1={pin.y}
                x2={cx + (pin.x - cx) * 0.4}
                y2={cy + 7}
                stroke="#9aa0a6"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            ))}
            <rect x={cx - 12} y={cy - 9.5} width="24" height="19" rx="2.5" fill="#3a678f" stroke="#1f3f5c" strokeWidth="0.7" />
            <circle cx={cx} cy={cy} r="7.2" fill="#4d86bd" stroke="#123452" strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="2" fill="#dfe9f2" />
            {/* Indicatore del wiper a metà corsa: il solve usa position 0.5. */}
            <line x1={cx} y1={cy} x2={cx + 5} y2={cy - 5} stroke="#eef4f9" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

function RgbLedSvg({ scene, channels }: { scene: SimulationSceneV1; channels: ElabMnaChannels | null }) {
  const rgb = scene.components.find((component) => component.type === "rgb-led");
  if (!rgb) return null;
  const legs = (["red", "common", "green", "blue"] as const).map((pin) => ({
    pin,
    point: pointForBreadboardRef(scene.pinAssignments[`${rgb.id}:${pin}`] ?? ""),
  }));
  if (legs.some((leg) => leg.point === null)) return null;
  const cx = legs.reduce((sum, leg) => sum + leg.point!.x, 0) / legs.length;
  const baseY = Math.min(...legs.map((leg) => leg.point!.y));
  const cy = baseY - 19;
  const anyOn = channels !== null && (channels.red.on || channels.green.on || channels.blue.on);
  // Miscela additiva SOLO per la resa visiva (il dato onesto sta in
  // diagnostica): canale acceso → contributo pieno del suo colore.
  const mix = anyOn
    ? `rgb(${channels!.red.on ? 235 : 40}, ${channels!.green.on ? 225 : 40}, ${channels!.blue.on ? 230 : 45})`
    : "#c9cdd2";
  const legColor: Record<string, string> = { red: "#d3413a", green: "#2fa764", blue: "#2f68ad", common: "#15191e" };
  return (
    <g aria-label={`LED RGB ${anyOn ? "acceso" : "spento"}`} pointerEvents="none">
      {legs.map((leg) => (
        <line
          key={leg.pin}
          x1={leg.point!.x}
          y1={leg.point!.y}
          x2={cx + (leg.point!.x - cx) * 0.25}
          y2={cy + 8}
          stroke={legColor[leg.pin]}
          strokeWidth={leg.pin === "common" ? 1.4 : 1.1}
          strokeLinecap="round"
        />
      ))}
      {anyOn && <ellipse cx={cx} cy={cy} rx="9.5" ry="11" fill={mix} filter="url(#led-glow)" opacity="0.85" />}
      <path
        d={`M ${cx - 6.5} ${cy + 8} L ${cx - 6.5} ${cy - 2} A 6.5 6.5 0 0 1 ${cx + 6.5} ${cy - 2} L ${cx + 6.5} ${cy + 8} Z`}
        fill={mix}
        stroke="#7d838a"
        strokeWidth="0.7"
        opacity={anyOn ? 0.95 : 0.8}
      />
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#4a5a6a" fontSize="4.8" fontWeight="800">RGB</text>
    </g>
  );
}

function ResistorBody({ a, b, ohms = 470 }: { a: { x: number; y: number }; b: { x: number; y: number }; ohms?: number }) {
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
      <text x={centerX} y={a.y - 8} textAnchor="middle" fill="#5e4930" fontSize="5.2" fontWeight="800">{ohms} Ohm</text>
    </g>
  );
}

function LedSvg({ scene }: { scene: SimulationSceneV1 }) {
  // Scene senza LED singolo (es. multi-pin v1-cap9-esp6): niente da disegnare
  // — e mai parseBreadboardRef su un ref assente.
  const anodeRef = scene.pinAssignments["led1:anode"];
  const cathodeRef = scene.pinAssignments["led1:cathode"];
  if (anodeRef === undefined || cathodeRef === undefined) return null;
  const anode = pointForBreadboardRef(anodeRef);
  const cathode = pointForBreadboardRef(cathodeRef);
  if (!anode || !cathode) return null;
  const led = scene.components.find((component) => component.id === "led1");
  const burned = scene.runtime.kind === "battery-led-senza-resistore";
  const ledOn = scene.runtime.kind === "elab-mna" ? false : scene.runtime.ledOn;
  const ariaLabel = burned
    ? `LED ${led?.color ?? "verde"} bruciato per sovracorrente`
    : ledOn
      ? `LED ${led?.color ?? "verde"} acceso`
      : `LED ${led?.color ?? "verde"} spento`;
  return (
    <g aria-label={ariaLabel} pointerEvents="none">
      <LedBody anode={anode} cathode={cathode} color={led?.color ?? "verde"} on={ledOn} burned={burned} />
    </g>
  );
}

function LedBody({
  anode,
  cathode,
  color,
  on,
  burned = false,
}: {
  anode: { x: number; y: number };
  cathode: { x: number; y: number };
  color: string;
  on: boolean;
  burned?: boolean;
}) {
  const litColor = color === "red" ? "#e5483f" : "#38c85c";
  const dimColor = burned ? "#6b6f73" : color === "red" ? "#d99592" : "#b9d3bd";
  const strokeColor = burned ? "#3f4448" : color === "red" ? "#9d2d27" : "#1f7f36";
  const centerX = (anode.x + cathode.x) / 2;
  const bodyY = anode.y - 21;
  return (
    <g>
      {on && !burned && <circle cx={centerX} cy={bodyY - 2} r="13" fill={litColor} filter="url(#led-glow)" opacity="0.55" />}
      <line x1={anode.x} y1={anode.y} x2={centerX - 3.2} y2={bodyY + 3} stroke="#a8adb2" strokeWidth="1.1" strokeLinecap="round" />
      <line x1={cathode.x} y1={cathode.y} x2={centerX + 3.2} y2={bodyY + 3} stroke="#a8adb2" strokeWidth="1.1" strokeLinecap="round" />
      <path d={`M ${centerX - 9} ${bodyY + 4} Q ${centerX} ${bodyY - 16} ${centerX + 9} ${bodyY + 4} Z`} fill={on && !burned ? litColor : dimColor} stroke={strokeColor} strokeWidth="0.8" opacity={on && !burned ? 0.95 : 0.78} />
      <ellipse cx={centerX - 3.3} cy={bodyY - 4.5} rx="2.2" ry="4" fill="#ffffff" opacity="0.45" />
      {burned ? (
        <g aria-hidden>
          {/* Scoppio stilizzato come la figura p.32: il LED è rotto. */}
          <path
            d={`M ${centerX} ${bodyY - 14} l 2.2 4.4 4.8 -2 -2 4.8 4.4 2.2 -4.4 2.2 2 4.8 -4.8 -2 -2.2 4.4 -2.2 -4.4 -4.8 2 2 -4.8 -4.4 -2.2 4.4 -2.2 -2 -4.8 4.8 2 Z`}
            fill="#f2a33c"
            stroke="#c2530f"
            strokeWidth="0.8"
            opacity="0.92"
          />
          <text x={centerX} y={bodyY - 18} textAnchor="middle" fill="#b03a2e" fontSize="5.4" fontWeight="850">BRUCIATO!</text>
        </g>
      ) : (
        <text x={centerX} y={bodyY - 18} textAnchor="middle" fill={strokeColor} fontSize="5.4" fontWeight="850">LED</text>
      )}
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

/** Corpi dei piazzamenti tap-tap: la geometria entra in components/pinAssignments;
 *  il mapping solve->glifo dei LED liberi resta spento finché non è tracciato. */
function PlacedPartsSvg({ scene, placements }: { scene: SimulationSceneV1; placements: MontaggioPlacement[] }) {
  // Decorativo come i fili: i corpi piazzati non bloccano i tap sui fori vicini.
  return (
    <g pointerEvents="none">
      {placements.map((placement) => {
        // Il cavo NON ha un corpo-componente: è già disegnato da BoardWires
        // come connection di boardScene (bezier di fallback) — D6.
        if (placement.type === "wire") return null;
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
  // Multi-pin: nessun "LED singolo" — le correnti per canale escono dal solve
  // MNA (computeElabMnaView), questo traversal serie non si applica.
  if (scene.runtime.kind === "elab-mna") return 0;
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
  if (scene.runtime.kind === "battery-led-senza-resistore" || scene.runtime.kind === "elab-mna") {
    // Verdetti non animabili dallo snapshot: "bruciato" resta bruciato, e i
    // canali multi-pin escono SOLO dal solve MNA — mai da un toggle.
    return scene;
  }
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
  if (state?.kind === "simulation-scene-v1") {
    const runtime = state.scene.runtime;
    return runtime.kind === "elab-mna" ? undefined : runtime.ledOn;
  }
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

const harnessBannerStyle = {
  marginTop: 8,
  color: "#6f4c13",
  fontSize: 12,
  fontWeight: 800,
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

const boardStackStyle = {
  minHeight: 0,
  display: "grid",
  gridTemplateRows: "auto minmax(420px, 1fr) auto",
  gap: 10,
} as const;

const freeModeStripStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "8px 12px",
  padding: "8px 12px",
  border: "1px solid #c9d7e2",
  borderRadius: 8,
  background: "#ffffff",
  color: "#203044",
  font: "650 13px var(--m-font-ui)",
} as const;

const freeModeBadgeStyle = {
  fontWeight: 800,
  padding: "2px 8px",
  borderRadius: 6,
  background: "#eef4f8",
} as const;

const freeModeDiagnosticStyle = {
  color: "#9a1f1f",
  fontWeight: 700,
} as const;

const freeModeButtonStyle = {
  minHeight: 34,
  minWidth: 44,
  padding: "0 12px",
  border: "1px solid #9f7a2f",
  borderRadius: 6,
  background: "#fff6d8",
  color: "#573d09",
  font: "750 12px var(--m-font-ui)",
  cursor: "pointer",
} as const;

const elabCoreStageStyle = {
  ...boardStageStyle,
  minHeight: 470,
  background: "#f3f7fb",
} as const;

const elabCoreMountNodeStyle = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
} as const;

const elabCoreDiagnosticStyle = {
  position: "absolute",
  left: 12,
  bottom: 12,
  maxWidth: "calc(100% - 24px)",
  borderRadius: 7,
  background: "#fff4d6",
  border: "1px solid #e8cb76",
  color: "#6f4c13",
  padding: "6px 8px",
  fontSize: 12,
  fontWeight: 750,
} as const;

const legacyHarnessDetailsStyle = {
  border: "1px solid #d8e1eb",
  borderRadius: 8,
  background: "#ffffff",
  overflow: "hidden",
} as const;

const legacyHarnessSummaryStyle = {
  cursor: "pointer",
  padding: "8px 10px",
  color: "#52677f",
  fontSize: 12,
  fontWeight: 850,
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

const bbHoverLabelStyle: CSSProperties = {
  fill: "#2f68ad",
  fontSize: 5.4,
  fontWeight: 800,
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

const stepNumberDoneStyle = {
  ...stepNumberStyle,
  background: "#dcf5e4",
  color: "#1d7a3f",
} as const;

const stepHeaderRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
} as const;

const stepToggleStyle = {
  border: "1px solid #c9d9ea",
  borderRadius: 999,
  background: "#f4f9ff",
  color: "#1f4f80",
  fontSize: 10,
  fontWeight: 800,
  padding: "3px 10px",
  cursor: "pointer",
} as const;

const stepToggleActiveStyle = {
  ...stepToggleStyle,
  background: "#1f4f80",
  borderColor: "#1f4f80",
  color: "#f4f9ff",
} as const;

const stepItemCurrentStyle = {
  background: "#fff7e6",
  borderRadius: 6,
  padding: 3,
} as const;

const stepEvidenceStyle = {
  display: "grid",
  gap: 2,
  marginTop: 2,
} as const;

const stepEvidenceItemStyle = {
  display: "block",
  color: "#6b7d92",
  fontSize: 9.5,
  fontStyle: "italic",
} as const;

const stepFailureStyle = {
  display: "block",
  marginTop: 2,
  color: "#a3492c",
  fontSize: 9.5,
  fontWeight: 700,
} as const;

const catalogBannerStyle = {
  marginTop: 4,
  color: "#7c6a2f",
  background: "#fdf6df",
  border: "1px solid #ecd9a0",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 10,
  fontWeight: 700,
  display: "inline-block",
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
