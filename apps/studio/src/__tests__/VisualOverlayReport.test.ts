// @vitest-environment node
// Drift-guard dell'evidenza visiva strutturale (NOTTE-13): i report committati
// in docs/ops/overlays/ devono coincidere con le metriche RICALCOLATE adesso.
// Se una fixture/crop cambia senza rigenerare l'evidenza, questo test è rosso.
// Il claim massimo è "verified-structural" — MAI verified-human.

import { describe, expect, it } from "vitest"
import * as fs from "node:fs"
import * as path from "node:path"
import {
  OVERLAY_SCENES,
  buildOverlayReport,
} from "../../scripts/visual-overlay-report.ts"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")
const overlaysDir = path.join(repoRoot, "docs/ops/overlays")

describe("overlay strutturale — evidenza committata = metriche ricalcolate", () => {
  for (const entry of OVERLAY_SCENES) {
    const match = entry.fixture.match(/v1cap(\d+)esp(\d)/)!
    const experimentId = `v1-cap${match[1]}-esp${match[2]}`
    it(`${experimentId}: report committato coincide col ricalcolo (drift-guard)`, () => {
      const committed = JSON.parse(
        fs.readFileSync(path.join(overlaysDir, `${experimentId}-report.json`), "utf-8"),
      )
      const recomputed = buildOverlayReport(entry.fixture, entry.crop)
      expect(committed).toEqual(recomputed)
    })

    it(`${experimentId}: PNG di evidenza presente e claim mai oltre structural`, () => {
      expect(fs.existsSync(path.join(overlaysDir, `${experimentId}-overlay.png`))).toBe(true)
      const report = buildOverlayReport(entry.fixture, entry.crop)
      expect(report.visualMatch).toBe("structural-only")
      expect(["verified-structural", "not-verified-structural"]).toContain(report.levelClaim)
    })
  }

  it("le 4 scene reali sono oggi verified-structural (soglia dichiarata 0.5px)", () => {
    for (const entry of OVERLAY_SCENES) {
      const report = buildOverlayReport(entry.fixture, entry.crop)
      expect(report.levelClaim, entry.fixture).toBe("verified-structural")
      expect(report.thresholds.tolerancePx).toBe(0.5)
      expect(report.metrics.strictOnGrid).toBe(true)
    }
  })
})
