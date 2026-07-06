// visualMatch — grader STRUTTURALE no-dep, no-CV (ELAB-SCENE-FORGE-CANON §4/§8).
//
// PERCHE': l'overlay validator del canon §4 vuole render→PNG allineato al crop
// del manuale via OpenCV ORB/ECC/SSIM. Blocco reale: cv2/skimage non installati
// (aggiungerli = GATE-Andrea) e il crop è ART STILIZZATA del libro, non una
// foto del render → un overlay pixel ha segnale basso e richiede ground-truth
// annotato a mano (altro gate). Vedi docs/ops/VISUALMATCH-GRADER-DOSSIER.md.
//
// COSA MISURA INVECE, onestamente e subito: la scena porta DUE sorgenti di
// geometria autorate in modo indipendente — pixel (component.pose, wire.path)
// e topologica (pinAssignments, wire.from/to). Il modello griglia
// `pointForBreadboardRef` mappa ref→(x,y). Incrociandole ottengo px-error
// REALI (componentPoseErrorPx, wireEndpointErrorPx) senza CV e senza dip. Un
// endpoint autorato che non cade sul foro del suo ref viene flaggato.
//
// NON promuove candidate→verified: emette evidenza. visualMatch resta
// "unknown" e visualOverlayScore null finché non c'è overlay CV + GT + gate.
import type { ElabScene } from "../elab/elabScene"
import { pointForBreadboardRef } from "../breadboard/simulationBreadboard"

// Tolleranza tarata SOLO sulla scena hand-authored (l'unica verified-in-spirito):
// sulla fixture v1-cap6-esp1 pose e path cadono ESATTI sulla griglia (delta 0.0).
// 0.5px = margine float, NON un numero inventato su scene mai viste.
export const STRUCTURAL_GRADE_TOLERANCE_PX = 0.5

export type StructuralGradeReport = {
  /** Max |path-endpoint − grid(ref)| sui soli endpoint che sono fori/rail. */
  wireEndpointErrorPx: number
  /** Max |pose − centroide dei grid-point dei pin assegnati| sui componenti mappabili. */
  componentPoseErrorPx: number
  /** Quanti endpoint-foro sono stati effettivamente controllati (internal-net esclusi). */
  checkedWireEndpoints: number
  /** Quanti componenti avevano pose + almeno un pin su griglia. */
  checkedComponentPoses: number
  /** true sse ogni errore misurato è entro tolleranza. */
  onGrid: boolean
  /** Overlay sul crop del libro: NON calcolabile no-dep → null (gate CV+GT). */
  visualOverlayScore: number | null
  /** Il grader strutturale non promuove: visualMatch resta unknown. */
  visualMatch: "unknown"
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Grid-point di un ref foro/rail, o null se il ref non è sulla breadboard. */
function gridPoint(ref: string): { x: number; y: number } | null {
  const point = pointForBreadboardRef(ref)
  return point === null ? null : { x: point.x, y: point.y }
}

function componentIdOf(pinRef: string): string {
  const separator = pinRef.indexOf(":")
  return separator === -1 ? pinRef : pinRef.slice(0, separator)
}

/**
 * Errore strutturale della scena: geometria pixel autorata vs griglia implicata
 * dai ref topologici. Nessuna CV, nessuna nuova dip.
 */
export function gradeSceneGeometry(scene: ElabScene): StructuralGradeReport {
  // 1) Wire endpoints: confronta path.start↔from e path.end↔to, ma solo per gli
  //    endpoint che sono fori/rail (gli internal-net tipo bat1:negative non
  //    hanno una griglia e vanno saltati onestamente, non contati come errore).
  let wireEndpointErrorPx = 0
  let checkedWireEndpoints = 0
  for (const wire of scene.wires) {
    if (wire.path === undefined || wire.path.points.length < 2) continue
    const start = wire.path.points[0]!
    const end = wire.path.points[wire.path.points.length - 1]!
    for (const [ref, point] of [
      [wire.from, start],
      [wire.to, end],
    ] as const) {
      const grid = gridPoint(ref)
      if (grid === null) continue
      wireEndpointErrorPx = Math.max(wireEndpointErrorPx, distance(point, grid))
      checkedWireEndpoints += 1
    }
  }

  // 2) Component poses: il centroide dei grid-point dei pin assegnati a un
  //    componente deve coincidere con la sua pose (vero per i componenti a più
  //    pin tra due fori: LED, resistore). Componenti senza pin-su-griglia o
  //    senza pose (batteria, breadboard) sono saltati.
  const pinsByComponent = new Map<string, Array<{ x: number; y: number }>>()
  for (const [pinRef, holeRef] of Object.entries(scene.pinAssignments)) {
    const grid = gridPoint(holeRef)
    if (grid === null) continue
    const id = componentIdOf(pinRef)
    const list = pinsByComponent.get(id) ?? []
    list.push(grid)
    pinsByComponent.set(id, list)
  }

  let componentPoseErrorPx = 0
  let checkedComponentPoses = 0
  for (const component of scene.components) {
    if (component.pose === undefined) continue
    const pins = pinsByComponent.get(component.id)
    if (pins === undefined || pins.length === 0) continue
    const centroid = {
      x: pins.reduce((sum, pin) => sum + pin.x, 0) / pins.length,
      y: pins.reduce((sum, pin) => sum + pin.y, 0) / pins.length,
    }
    componentPoseErrorPx = Math.max(
      componentPoseErrorPx,
      distance({ x: component.pose.x, y: component.pose.y }, centroid),
    )
    checkedComponentPoses += 1
  }

  const onGrid =
    wireEndpointErrorPx <= STRUCTURAL_GRADE_TOLERANCE_PX &&
    componentPoseErrorPx <= STRUCTURAL_GRADE_TOLERANCE_PX

  return {
    wireEndpointErrorPx,
    componentPoseErrorPx,
    checkedWireEndpoints,
    checkedComponentPoses,
    onGrid,
    visualOverlayScore: null,
    visualMatch: "unknown",
  }
}
