// Catalogo onestà del Simulation Plugin: quali esperimenti ELAB sono
// REALMENTE montati oggi (fixture circuit-scene su disco + superficie che li
// renderizza), contro il totale del corpus. Regola prodotto: la UI non vende
// esperimenti non montati — il banner dichiara sempre montati/totale.
//
// Fonti di verità (blindate da SimulationStepByStep.test.tsx):
//   - fixture scene:   apps/studio/sim/fixtures/ (path relativo ad apps/studio)
//   - corpus:          packs/elab-tutor/data/lesson-paths/ (88 percorsi)

export type ElabCatalogEntry = {
  experimentId: string
  title: string
  volume: 1 | 2 | 3
  page: number
  /** Provenance della fixture scene: mai "verified" senza gate umano. */
  sceneStatus: "candidate" | "verified"
  /** Path della fixture circuit-scene, relativo ad apps/studio. */
  sceneFixture: string
  capabilities: {
    giaMontato: boolean
    montaggioLibero: boolean
    passoPasso: boolean
    simulazioneElettrica: boolean
    compileUpload: boolean
  }
}

/** Corpus ELAB totale (drift-guard: conteggio lesson-paths su disco nel test). */
export const ELAB_CORPUS_TOTAL = 88

/**
 * SOLO esperimenti con fixture scene reale e superficie che li monta.
 * Entrambi Vol.1 a batteria (compileUpload false, nessuno sketch):
 * - v1-cap6-esp1: scena candidate + già-montato/montaggio libero/passo-passo.
 * - v1-cap6-esp2: dimostrazione "cosa NON fare" (p.32) — scena candidate,
 *   solve onesto = LED bruciato per sovracorrente, passo-passo dedicato.
 */
export const ELAB_EXPERIMENT_CATALOG: readonly ElabCatalogEntry[] = [
  {
    experimentId: "v1-cap6-esp1",
    title: "Accendi il tuo primo LED",
    volume: 1,
    page: 29,
    sceneStatus: "candidate",
    sceneFixture: "sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json",
    capabilities: {
      giaMontato: true,
      montaggioLibero: true,
      passoPasso: true,
      simulazioneElettrica: true,
      compileUpload: false,
    },
  },
  {
    experimentId: "v1-cap6-esp2",
    title: "LED senza resistore (cosa NON fare!)",
    volume: 1,
    page: 32,
    sceneStatus: "candidate",
    sceneFixture: "sim/fixtures/elab-scene-v2-candidate-v1cap6esp2.json",
    capabilities: {
      giaMontato: true,
      montaggioLibero: true,
      passoPasso: true,
      simulazioneElettrica: true,
      compileUpload: false,
    },
  },
]

export type CatalogSummary = { mounted: number; total: number; label: string }

export function catalogSummary(): CatalogSummary {
  const mounted = ELAB_EXPERIMENT_CATALOG.length
  return {
    mounted,
    total: ELAB_CORPUS_TOTAL,
    label: `${mounted} esperimento${mounted === 1 ? "" : "i"} montato${mounted === 1 ? "" : "i"} di ${ELAB_CORPUS_TOTAL} nel corpus`,
  }
}
