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
