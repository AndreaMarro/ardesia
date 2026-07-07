// visualMatch STRUCTURAL OVERLAY (NOTTE-13, decisione autonoma — evoluzione
// del gate "overlay CV"): report + immagine di confronto crop-libro ↔ scena
// proiettata sulla griglia, SENZA nuove dipendenze (niente cv2/skimage:
// Playwright, già dev-dep, rasterizza l'HTML).
//
// COSA PRODUCE per ogni scena (docs/ops/overlays/):
//   <id>-overlay.png   crop del manuale accanto alla proiezione della scena
//                      (griglia + pose + wire.path + ref dei pin annotati)
//   <id>-report.json   metriche del grader severo + soglie DICHIARATE +
//                      visualMatch: "structural-only" (MAI un claim CV/umano)
//
// Livello introdotto: "verified-structural" = strictOnGrid + bookConstraints
// pass + electrical calcolato + questa evidenza visiva. NON è verified-human.
//
// Uso:  npx tsx scripts/visual-overlay-report.ts     (da apps/studio)
// I report committati sono blindati dal test VisualOverlayReport.test.ts
// (drift-guard: metriche ricalcolate = metriche committate).

import { chromium } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"
import { createHash } from "node:crypto"
import { validateElabScene, type ElabScene } from "../sim/elab/elabScene"
import {
  gradeSceneGeometryStrict,
  STRUCTURAL_GRADE_TOLERANCE_PX,
} from "../sim/visual/structuralGrader"
import {
  generateBreadboardPoints,
  pointForBreadboardRef,
  breadboardGeometry,
} from "../sim/breadboard/simulationBreadboard"

const repoRoot = path.resolve(import.meta.dirname, "../../..")
const overlaysDir = path.join(repoRoot, "docs/ops/overlays")

export const OVERLAY_SCENES: ReadonlyArray<{ fixture: string; crop: string }> = [
  {
    fixture: "elab-scene-v2-candidate-v1cap6esp1.json",
    crop: "apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png",
  },
  {
    fixture: "elab-scene-v2-candidate-v1cap6esp2.json",
    crop: "apps/studio/public/elab/manuals/vol1/page-032-esercizio-6-2.png",
  },
  {
    fixture: "elab-scene-v2-candidate-v1cap6esp3.json",
    crop: "apps/studio/public/elab/manuals/vol1/page-033-esercizio-6-3.png",
  },
]

function loadScene(fixtureName: string): ElabScene {
  const raw = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "apps/studio/sim/fixtures", fixtureName), "utf-8"),
  )
  const result = validateElabScene(raw)
  if (!result.ok) throw new Error(`fixture invalida: ${fixtureName}`)
  return result.scene
}

/** SVG della proiezione: griglia reale + pose + wire.path + pin annotati. */
export function sceneProjectionSvg(scene: ElabScene): string {
  const points = generateBreadboardPoints("bb1")
  const holes = points
    .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="0.9" fill="#c9c2b6"/>`)
    .join("")
  const wires = scene.wires
    .filter((wire) => wire.path !== undefined)
    .map((wire) => {
      const pts = wire.path!.points.map((p) => `${p.x},${p.y}`).join(" ")
      return `<polyline points="${pts}" fill="none" stroke="${wire.color === "red" ? "#d3413a" : wire.color === "black" ? "#22282e" : "#2f68ad"}" stroke-width="2" stroke-linecap="round" opacity="0.9"/>`
    })
    .join("")
  const pins = Object.entries(scene.pinAssignments)
    .map(([pinRef, holeRef]) => {
      const grid = pointForBreadboardRef(holeRef)
      if (grid === null) return ""
      return (
        `<circle cx="${grid.x}" cy="${grid.y}" r="2.6" fill="none" stroke="#1f7f36" stroke-width="1"/>` +
        `<text x="${grid.x + 4}" y="${grid.y - 3}" font-size="5" fill="#1f7f36">${pinRef}→${holeRef.replace("bb1:", "")}</text>`
      )
    })
    .join("")
  const poses = scene.components
    .filter((component) => component.pose !== undefined && component.type !== "breadboard-half")
    .map(
      (component) =>
        `<rect x="${component.pose!.x - 5}" y="${component.pose!.y - 5}" width="10" height="10" fill="none" stroke="#9d2d27" stroke-width="1" stroke-dasharray="2 1.5"/>` +
        `<text x="${component.pose!.x + 7}" y="${component.pose!.y + 2}" font-size="5.5" fill="#9d2d27">${component.id}</text>`,
    )
    .join("")
  const w = breadboardGeometry.boardWidth
  const h = breadboardGeometry.boardHeight
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-150 -20 ${w + 190} ${h + 60}" width="820">` +
    `<rect x="0" y="0" width="${w}" height="${h}" rx="3" fill="#f4f1e9" stroke="#d4cdc1"/>` +
    holes +
    wires +
    poses +
    pins +
    `</svg>`
  )
}

export type OverlayReport = {
  format: "ardesia.visual-overlay-report/1"
  experimentId: string
  fixture: string
  crop: string
  cropSha256: string
  thresholds: { tolerancePx: number }
  metrics: {
    wireEndpointErrorPx: number
    componentPoseErrorPx: number
    checkedWireEndpoints: number
    checkedComponentPoses: number
    uncoveredWires: string[]
    unposedComponents: string[]
    strictOnGrid: boolean
  }
  /** MAI "verified-human": questa evidenza è strutturale, non CV né umana. */
  visualMatch: "structural-only"
  levelClaim: "verified-structural" | "not-verified-structural"
}

export function buildOverlayReport(fixtureName: string, cropRel: string): OverlayReport {
  const scene = loadScene(fixtureName)
  const grade = gradeSceneGeometryStrict(scene)
  const cropBytes = fs.readFileSync(path.join(repoRoot, cropRel))
  const cropSha256 = createHash("sha256").update(cropBytes).digest("hex")
  const checksPass =
    scene.provenance.checks.electrical === "pass" &&
    scene.provenance.checks.geometry === "pass" &&
    scene.provenance.checks.bookMatch === "pass"
  return {
    format: "ardesia.visual-overlay-report/1",
    experimentId: scene.experimentId,
    fixture: fixtureName,
    crop: cropRel,
    cropSha256,
    thresholds: { tolerancePx: STRUCTURAL_GRADE_TOLERANCE_PX },
    metrics: {
      wireEndpointErrorPx: grade.wireEndpointErrorPx,
      componentPoseErrorPx: grade.componentPoseErrorPx,
      checkedWireEndpoints: grade.checkedWireEndpoints,
      checkedComponentPoses: grade.checkedComponentPoses,
      uncoveredWires: grade.uncoveredWires,
      unposedComponents: grade.unposedComponents,
      strictOnGrid: grade.strictOnGrid,
    },
    visualMatch: "structural-only",
    levelClaim: grade.strictOnGrid && checksPass ? "verified-structural" : "not-verified-structural",
  }
}

function overlayHtml(scene: ElabScene, cropRel: string, report: OverlayReport): string {
  const cropData = fs.readFileSync(path.join(repoRoot, cropRel)).toString("base64")
  return `<!doctype html><meta charset="utf-8"><body style="margin:0;font-family:system-ui;background:#edf3f7">
  <div id="overlay" style="display:flex;gap:16px;padding:16px;align-items:flex-start;width:1400px">
    <figure style="margin:0;flex:0 0 480px">
      <img src="data:image/png;base64,${cropData}" style="width:480px;border:1px solid #d7e1ea" alt="crop manuale">
      <figcaption style="font-size:12px;color:#41556d">MANUALE — ${cropRel.split("/").pop()} (sha256 ${report.cropSha256.slice(0, 12)}…)</figcaption>
    </figure>
    <figure style="margin:0;flex:1;background:#fff;border:1px solid #d7e1ea;padding:8px">
      ${sceneProjectionSvg(scene)}
      <figcaption style="font-size:12px;color:#41556d">
        SCENA ${scene.experimentId} proiettata sulla griglia reale —
        wireEndpointErrPx=${report.metrics.wireEndpointErrorPx.toFixed(2)},
        poseErrPx=${report.metrics.componentPoseErrorPx.toFixed(2)},
        soglia=${report.thresholds.tolerancePx}px,
        strictOnGrid=${report.metrics.strictOnGrid} →
        <strong>${report.levelClaim}</strong> (visualMatch: structural-only, MAI verified-human)
      </figcaption>
    </figure>
  </div></body>`
}

async function main() {
  fs.mkdirSync(overlaysDir, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1450, height: 900 } })
  for (const entry of OVERLAY_SCENES) {
    const scene = loadScene(entry.fixture)
    const report = buildOverlayReport(entry.fixture, entry.crop)
    await page.setContent(overlayHtml(scene, entry.crop, report))
    const element = page.locator("#overlay")
    const pngPath = path.join(overlaysDir, `${scene.experimentId}-overlay.png`)
    await element.screenshot({ path: pngPath })
    fs.writeFileSync(
      path.join(overlaysDir, `${scene.experimentId}-report.json`),
      JSON.stringify(report, null, 2) + "\n",
    )
    console.log(`${scene.experimentId}: ${report.levelClaim} → ${pngPath}`)
  }
  await browser.close()
}

// Eseguito come script (non importato dai test).
if (process.argv[1]?.includes("visual-overlay-report")) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
