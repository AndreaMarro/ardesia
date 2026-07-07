export const V3_CAP6_ESP4_BLOCKER =
  "missing verified SimulationScene/circuit-scene/2 fixture with authored geometry and manual evidence"

export type SceneCheck = "pass" | "fail" | "unknown"

export type SceneProvenance = {
  experimentId: string
  volume: 1 | 2 | 3
  chapter: number
  page: number
  sourceManual: string
  status: "blocked" | "draft" | "candidate" | "reviewed" | "verified"
  blocker?: string
  checks: {
    electrical: SceneCheck
    geometry: SceneCheck
    bookMatch: SceneCheck
    visualMatch: SceneCheck
  }
}

export type BlockedElabSceneStatus = {
  kind: "blocked"
  experimentId: string
  blocker: string
  provenance: SceneProvenance
  scene?: undefined
}

export type ReadyElabSceneStatus = {
  kind: "ready"
  experimentId: string
  provenance: SceneProvenance
  scene: unknown
}

export type ElabSceneStatus = BlockedElabSceneStatus | ReadyElabSceneStatus

function blocked(
  experimentId: string,
  blocker: string,
  manual: { volume: 1 | 2 | 3; chapter: number; page: number; sourceManual: string },
): BlockedElabSceneStatus {
  return {
    kind: "blocked",
    experimentId,
    blocker,
    provenance: {
      experimentId,
      volume: manual.volume,
      chapter: manual.chapter,
      page: manual.page,
      sourceManual: manual.sourceManual,
      status: "blocked",
      blocker,
      checks: {
        electrical: "unknown",
        geometry: "unknown",
        bookMatch: "unknown",
        visualMatch: "unknown",
      },
    },
  }
}

export function getElabSceneStatus(experimentId: string): ElabSceneStatus {
  if (experimentId === "v3-cap6-esp4") {
    return blocked("v3-cap6-esp4", V3_CAP6_ESP4_BLOCKER, {
      volume: 3,
      chapter: 6,
      page: 54,
      sourceManual: "Vol.3 pag.54 - ESERCIZIO 6.4",
    })
  }

  return blocked(experimentId, `no SimulationScene registered for ${experimentId}`, {
    volume: 1,
    chapter: 0,
    page: 0,
    sourceManual: "unknown",
  })
}
