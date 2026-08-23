// STATO MISURATO il 2026-08-25 — leggere prima di fidarsi del nome del file.
// Questo modulo NON e' il catalogo che il prodotto consulta per montare un
// esperimento: a runtime non lo chiama nessuno. La vista ELAB Lab risolve
// `?esperimento=` dal Pack (`getLessonPath`); il banner «N montati di 88» nasce
// da `src/toolhost/elabExperimentCatalog.ts`. Misura: reso esplosivo
// `getElabSceneStatus`, gli unici rossi sono i due test di questo stesso file, e
// i sedici journey del cancello restano exit 0.
//
// E c'e' di piu': `getElabSceneStatus` risponde `blocked` a QUALUNQUE id —
// il ramo `ready` non viene mai costruito. Quindi risponde «bloccato» anche per
// `v1-cap6-esp1`, che il prodotto monta e risolve davvero. E' uno stub
// fail-closed della slice di contratto del 2026-07-07 (vedi
// docs/superpowers/plans/2026-07-07-simulation-plugin-v2-contract.md, Task 4),
// tenuto per il blocker onesto di `v3-cap6-esp4`. Se un giorno lo si cabla come
// cancello del mount, PRIMA vanno aggiunte le voci `ready`: altrimenti blocca
// tutto.

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
  provenance?: SceneProvenance
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
  manual?: { volume: 1 | 2 | 3; chapter: number; page: number; sourceManual: string },
): BlockedElabSceneStatus {
  const status: BlockedElabSceneStatus = {
    kind: "blocked",
    experimentId,
    blocker,
    scene: undefined,
  }
  if (!manual) {
    return status
  }
  return {
    ...status,
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
    }
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

  return blocked(experimentId, `no SimulationScene registered for ${experimentId}`)
}
