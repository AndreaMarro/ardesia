// Breadboard copy system — helper PURI per copiare un circuito dal libro
// (foto/pagina) a una fixture circuit-scene/2 con passi ripetibili.
//
// Il problema che risolve: autorare pose e wire.path "a mano" invita a
// inventare pixel. Qui ogni coordinata deriva dalla STESSA griglia che il
// grader strutturale usa per giudicare (pointForBreadboardRef): una scena
// costruita con questi helper nasce on-grid per costruzione, e ogni drift
// futuro della griglia diventa un test rosso, non un disallineamento muto.
//
// Procedura ripetibile (docs/ops/BREADBOARD-COPY-SYSTEM-2026-07-13.md):
//   figura → fori (ref ELAB) → helper → fixture → grader strict → bookConstraints.
import {
  parseBreadboardRef,
  pointForBreadboardRef,
} from "./simulationBreadboard"

export type ScenePoint = { x: number; y: number }
export type ScenePolyline = { kind: "polyline"; points: ScenePoint[] }

/** Grid-point di un ref foro/rail. Fail-closed: ref non-breadboard = errore. */
export function holePoint(ref: string): ScenePoint {
  const point = pointForBreadboardRef(ref)
  if (point === null) {
    throw new Error(`ref non sulla griglia breadboard: ${ref}`)
  }
  return { x: point.x, y: point.y }
}

/**
 * Pose di un componente a 2 pin tra due fori = centroide dei grid-point
 * (la stessa definizione usata dal grader strutturale: pose ↔ centroide pin).
 */
export function poseBetween(refA: string, refB: string): ScenePoint {
  const a = holePoint(refA)
  const b = holePoint(refB)
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Polyline dritta foro→foro (jumper corti, es. rail→strip). */
export function straightPath(refFrom: string, refTo: string): ScenePolyline {
  return { kind: "polyline", points: [holePoint(refFrom), holePoint(refTo)] }
}

/**
 * Polyline con bend-points: estremi ANCORATI alla griglia, pieghe libere
 * (le pieghe riproducono la curva del filo nella figura del libro; gli
 * estremi restano falsificabili dal grader).
 */
export function pathWithBends(
  refFrom: string,
  bends: readonly ScenePoint[],
  refTo: string,
): ScenePolyline {
  return {
    kind: "polyline",
    points: [holePoint(refFrom), ...bends.map((bend) => ({ ...bend })), holePoint(refTo)],
  }
}

/**
 * Inserisce un bend-point in una polyline esistente (modello dati del wire
 * editing: l'estremo 0 e l'estremo n-1 sono ancore, i bend stanno in mezzo).
 * Pure: ritorna una NUOVA polyline; indice fuori range = errore, mai clamp
 * silenzioso.
 */
export function insertBendPoint(
  path: ScenePolyline,
  afterIndex: number,
  point: ScenePoint,
): ScenePolyline {
  if (afterIndex < 0 || afterIndex >= path.points.length - 1) {
    throw new Error(
      `bend-point fuori dai segmenti della polyline: afterIndex ${afterIndex} su ${path.points.length} punti`,
    )
  }
  const points = [...path.points]
  points.splice(afterIndex + 1, 0, { ...point })
  return { kind: "polyline", points }
}

export type HoleDescription = {
  ref: string
  nodeId: string
  /** Etichetta didattica it della strip/rail condivisa (per hover/copy). */
  labelIt: string
}

/**
 * Descrizione umana di un foro: quale net/strip tocca. È la voce che
 * l'hover della breadboard mostra al docente (Principio Zero: il vocabolario
 * del libro — striscia rossa/nera, colonna, metà sopra/sotto).
 */
export function describeHole(ref: string): HoleDescription {
  const parsed = parseBreadboardRef(ref)
  if (parsed === null) {
    throw new Error(`ref non sulla griglia breadboard: ${ref}`)
  }
  if (parsed.kind === "rail") {
    const color = parsed.rail.endsWith("plus") ? "striscia rossa (+)" : "striscia nera/blu (−)"
    const side = parsed.rail.startsWith("bus-top") ? "sopra" : "sotto"
    return {
      ref,
      nodeId: parsed.nodeId,
      labelIt: `${color} ${side} — colonna ${parsed.column}`,
    }
  }
  const half = parsed.nodeId.includes("-top-") ? "metà sopra (f-j)" : "metà sotto (a-e)"
  return {
    ref,
    nodeId: parsed.nodeId,
    labelIt: `foro ${parsed.row}${parsed.column} — ${half}, colonna ${parsed.column}`,
  }
}
