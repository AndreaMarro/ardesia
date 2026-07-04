export type BreadboardTerminalRow = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";
export type BreadboardRailName = "bus-top-plus" | "bus-top-minus" | "bus-bot-plus" | "bus-bot-minus";

export type BreadboardPoint =
  | {
      kind: "terminal";
      boardId: string;
      row: BreadboardTerminalRow;
      column: number;
      nodeId: string;
      x: number;
      y: number;
    }
  | {
      kind: "rail";
      boardId: string;
      rail: BreadboardRailName;
      column: number;
      nodeId: string;
      x: number;
      y: number;
    };

export type ParsedBreadboardRef =
  | {
      kind: "terminal";
      boardId: string;
      row: BreadboardTerminalRow;
      column: number;
      nodeId: string;
    }
  | {
      kind: "rail";
      boardId: string;
      rail: BreadboardRailName;
      column: number;
      nodeId: string;
    };

export const ELAB_BREADBOARD_COLUMNS = 30;
export const ELAB_BREADBOARD_POINT_COUNT = ELAB_BREADBOARD_COLUMNS * 14;

// Ported from ELABTutor BreadboardHalf/WireRenderer/breadboardSnap and corrected
// into a renderer-agnostic geometry module for the Simulation Plugin. The important
// non-generic bit is ELAB's volume grammar: top terminal rows are drawn j..f and
// bottom rows e..a, while plus rails are visually inner and minus rails outer.
export const breadboardGeometry = {
  viewBoxWidth: 253,
  viewBoxHeight: 145,
  boardX: 0,
  boardY: 0,
  boardWidth: 253,
  boardHeight: 145,
  padX: 14,
  padY: 10,
  columnPitch: 7.5,
  holeRadius: 1.4,
  holeCoreRadius: 0.8,
  busRowHeight: 7.5,
  busGap: 5,
  sectionHeight: 37.5,
  centralGapHeight: 10,
  labelYTop: 28,
  labelYBottom: 119.7,
  terminalY: {
    j: 33.75,
    i: 41.25,
    h: 48.75,
    g: 56.25,
    f: 63.75,
    e: 81.25,
    d: 88.75,
    c: 96.25,
    b: 103.75,
    a: 111.25,
  } satisfies Record<BreadboardTerminalRow, number>,
  railY: {
    "bus-top-minus": 13.75,
    "bus-top-plus": 21.25,
    "bus-bot-plus": 123.75,
    "bus-bot-minus": 131.25,
  } satisfies Record<BreadboardRailName, number>,
};

export const ELAB_TOP_TERMINAL_ROWS: BreadboardTerminalRow[] = ["j", "i", "h", "g", "f"];
export const ELAB_BOTTOM_TERMINAL_ROWS: BreadboardTerminalRow[] = ["e", "d", "c", "b", "a"];
export const ELAB_TERMINAL_ROWS: BreadboardTerminalRow[] = [...ELAB_TOP_TERMINAL_ROWS, ...ELAB_BOTTOM_TERMINAL_ROWS];
export const ELAB_RAILS: BreadboardRailName[] = ["bus-top-minus", "bus-top-plus", "bus-bot-plus", "bus-bot-minus"];

function columnX(column: number): number {
  return breadboardGeometry.padX + (column - 1) * breadboardGeometry.columnPitch + breadboardGeometry.columnPitch / 2;
}

function isColumn(column: number): boolean {
  return Number.isInteger(column) && column >= 1 && column <= ELAB_BREADBOARD_COLUMNS;
}

function terminalNodeId(boardId: string, row: BreadboardTerminalRow, column: number): string {
  const side = ELAB_TOP_TERMINAL_ROWS.includes(row) ? "top" : "bottom";
  return `${boardId}:tie-${side}-${column}`;
}

function railNodeId(boardId: string, rail: BreadboardRailName): string {
  return `${boardId}:${rail}`;
}

export function parseBreadboardRef(ref: string): ParsedBreadboardRef | null {
  const terminal = ref.match(/^(bb\d+):([a-j])(\d+)$/);
  if (terminal) {
    const column = Number(terminal[3]);
    if (!isColumn(column)) return null;
    const boardId = terminal[1];
    const row = terminal[2] as BreadboardTerminalRow;
    return { kind: "terminal", boardId, row, column, nodeId: terminalNodeId(boardId, row, column) };
  }

  const rail = ref.match(/^(bb\d+):(bus-(?:top|bot)-(?:plus|minus))-(\d+)$/);
  if (rail) {
    const column = Number(rail[3]);
    if (!isColumn(column)) return null;
    const boardId = rail[1];
    const railName = rail[2] as BreadboardRailName;
    return { kind: "rail", boardId, rail: railName, column, nodeId: railNodeId(boardId, railName) };
  }

  return null;
}

export function isBreadboardRef(ref: string): boolean {
  return parseBreadboardRef(ref) !== null;
}

export function breadboardNodeId(ref: string): string {
  const parsed = parseBreadboardRef(ref);
  if (!parsed) throw new Error(`invalid breadboard ref: ${ref}`);
  return parsed.nodeId;
}

export function pointForBreadboardRef(ref: string): BreadboardPoint | null {
  const parsed = parseBreadboardRef(ref);
  if (!parsed) return null;
  const x = columnX(parsed.column);
  if (parsed.kind === "terminal") {
    return { ...parsed, x, y: breadboardGeometry.terminalY[parsed.row] };
  }
  return { ...parsed, x, y: breadboardGeometry.railY[parsed.rail] };
}

export function generateBreadboardPoints(boardId = "bb1"): BreadboardPoint[] {
  const points: BreadboardPoint[] = [];
  for (let column = 1; column <= ELAB_BREADBOARD_COLUMNS; column++) {
    for (const rail of ELAB_RAILS) {
      points.push({
        kind: "rail",
        boardId,
        rail,
        column,
        nodeId: railNodeId(boardId, rail),
        x: columnX(column),
        y: breadboardGeometry.railY[rail],
      });
    }
    for (const row of ELAB_TERMINAL_ROWS) {
      points.push({
        kind: "terminal",
        boardId,
        row,
        column,
        nodeId: terminalNodeId(boardId, row, column),
        x: columnX(column),
        y: breadboardGeometry.terminalY[row],
      });
    }
  }
  return points;
}

export function areBreadboardRefsContinuous(a: string, b: string): boolean {
  const pointA = parseBreadboardRef(a);
  const pointB = parseBreadboardRef(b);
  return Boolean(pointA && pointB && pointA.nodeId === pointB.nodeId);
}

// --- Solve serie graph-driven -------------------------------------------------
// Le net elettriche nascono dalla stessa grammatica di areBreadboardRefsContinuous
// (ref breadboard → nodeId di tie/rail) estesa con pinAssignments + connections.
// Il solve percorre il grafo battery→…→battery genericamente, senza hard-codare
// il numero o l'ordine dei componenti.

/** Forma strutturale minima della scena per il solve (SimulationSceneV1 la soddisfa). */
export interface SeriesCircuitScene {
  components: Array<{ id: string; type: string; value?: number }>;
  pinAssignments: Record<string, string>;
  connections: Array<{ from: string; to: string }>;
}

export interface SeriesLoopResult {
  /** Esiste un cammino elettrico battery:positive → battery:negative. */
  closed: boolean;
  /** Somma delle resistenze dei componenti sul cammino. */
  resistanceOhms: number;
  /** Numero di LED attraversati sul cammino. */
  ledCount: number;
}

/** Ref → nodo: ref breadboard collassano sul nodeId (tie/rail), il resto è un nodo proprio. */
function circuitNode(ref: string): string {
  const parsed = parseBreadboardRef(ref);
  return parsed ? parsed.nodeId : ref;
}

/** Union-find sulle net: pinAssignments e connections uniscono i nodi. */
function buildNets(scene: SeriesCircuitScene): (ref: string) => string {
  const parent = new Map<string, string>();
  const find = (node: string): string => {
    let root = parent.get(node) ?? node;
    if (root !== node) {
      root = find(root);
      parent.set(node, root);
    }
    return root;
  };
  const union = (a: string, b: string): void => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  for (const [pinRef, holeRef] of Object.entries(scene.pinAssignments)) {
    union(circuitNode(pinRef), circuitNode(holeRef));
  }
  for (const connection of scene.connections) {
    union(circuitNode(connection.from), circuitNode(connection.to));
  }
  return (ref: string) => find(circuitNode(ref));
}

/** Net canonica di un ref (pin componente, foro o rail) nella scena data. */
export function resolveNet(ref: string, scene: SeriesCircuitScene): string {
  return buildNets(scene)(ref);
}

/**
 * Solve serie minimo: cerca un cammino semplice battery:positive→battery:negative
 * attraverso i componenti a due terminali (resistor: pin1/pin2, led: anode/cathode)
 * e somma resistenze/LED incontrati. Nessun ramo parallelo (fuori scope).
 */
export function solveSeriesLoop(scene: SeriesCircuitScene): SeriesLoopResult {
  const open: SeriesLoopResult = { closed: false, resistanceOhms: 0, ledCount: 0 };
  const battery = scene.components.find((component) => component.type === "battery9v");
  if (!battery) return open;

  const net = buildNets(scene);
  const start = net(`${battery.id}:positive`);
  const target = net(`${battery.id}:negative`);

  const edges = scene.components.flatMap((component) => {
    if (component.type === "resistor") {
      return [{
        a: net(`${component.id}:pin1`),
        b: net(`${component.id}:pin2`),
        resistance: component.value ?? 0,
        led: false,
      }];
    }
    if (component.type === "led") {
      return [{
        a: net(`${component.id}:anode`),
        b: net(`${component.id}:cathode`),
        resistance: 0,
        led: true,
      }];
    }
    return [];
  });

  // Budget anti-DoS: la DFS dei cammini semplici è fattoriale su scene dense e
  // le scene arrivano anche da embed condivisi/importati. Budget esaurito →
  // scena trattata come aperta (0 mA), mai freeze del tab.
  const MAX_WALK_STEPS = 20000;
  let steps = 0;
  const usedEdges = new Set<number>();
  const visitedNets = new Set<string>();
  const walk = (from: string): { resistance: number; leds: number } | null => {
    if (++steps > MAX_WALK_STEPS) return null;
    if (from === target) return { resistance: 0, leds: 0 };
    visitedNets.add(from);
    for (let i = 0; i < edges.length; i++) {
      if (usedEdges.has(i)) continue;
      const edge = edges[i];
      const next = edge.a === from ? edge.b : edge.b === from ? edge.a : null;
      if (next === null || (visitedNets.has(next) && next !== target)) continue;
      usedEdges.add(i);
      const rest = walk(next);
      if (rest) {
        return { resistance: rest.resistance + edge.resistance, leds: rest.leds + (edge.led ? 1 : 0) };
      }
      usedEdges.delete(i);
    }
    visitedNets.delete(from);
    return null;
  };

  const path = walk(start);
  if (!path) return open;
  return { closed: true, resistanceOhms: path.resistance, ledCount: path.leds };
}
