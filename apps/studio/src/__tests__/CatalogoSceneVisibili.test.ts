// Il catalogo elettrico e le scene che un docente puo' aprire devono restare
// in un rapporto NOTO — e oggi non lo sono.
//
// Misurato il 2026-08-23: il motore e' fail-closed sui tipi non catalogati
// (`apps/studio/sim/solver/elabSolver.ts`, commento verbatim «Fail-closed sui
// tipi non catalogati»), il catalogo ne registra SETTE, e QUATTRO delle otto
// scene visibili contengono componenti fuori catalogo. Quelle quattro non
// risolvono: il docente vede un alert visibile che dice quale tipo manca, e
// nessun verdetto elettrico.
//
//   v2-cap7-esp1/2   capacitor, push-button, multimeter   (tre mancanti)
//   v3-cap6-esp4/5   nano-r4                              (uno solo)
//
// ⚠️ NON E' UN DIFETTO DA RIPARARE QUI. Un catalogo non e' un elenco di nomi:
// e' un modello. Registrare `capacitor` o `nano-r4` senza la fisica
// corrispondente produrrebbe un solve che RISPONDE invece di rifiutare —
// l'opposto esatto di cio' che quel `throw` protegge. E' un gate-Andrea:
// e' voluto che meta' della Founder Beta non risolva?
//
// Cio' che questo test fa e' impedire che il rapporto cambi in SILENZIO, in
// entrambi i versi: una scena nuova che porta dentro un tipo non catalogato, o
// un tipo catalogato che fa risolvere una scena che prima non risolveva,
// rendono questo test rosso e obbligano ad aggiornare la costante SCRIVENDO
// PERCHE'. E' la stessa forma di SOLVE_ATTESO in
// `e2e/elab-lab-canvas-colors.spec.ts`, dal lato dei dati invece che della
// vista.
import { describe, expect, it } from "vitest"
import { VISIBLE_EXP_IDS } from "@elab-tutor-plugin/data/experiment-visibility"
import { findExperimentById } from "@elab-tutor-plugin/data/experiments-index"
import { registerElectricalCatalog } from "../../sim/solver/catalog"
import { getComponent } from "../../sim/solver/components/registry.js"

/** I tipi fuori catalogo usati oggi dalle scene visibili. Misurato, non deciso. */
const FUORI_CATALOGO_OGGI = ["capacitor", "multimeter", "nano-r4", "push-button"] as const

function tipiFuoriCatalogo(): string[] {
  registerElectricalCatalog()
  const fuori = new Set<string>()
  for (const id of VISIBLE_EXP_IDS) {
    const esperimento = findExperimentById(id)
    if (esperimento === null || esperimento === undefined) continue
    for (const componente of esperimento.components ?? []) {
      if (getComponent(componente.type) === null) fuori.add(componente.type)
    }
  }
  return [...fuori].sort()
}

describe("catalogo elettrico contro le scene visibili", () => {
  it("i tipi fuori catalogo sono quelli misurati, non uno di piu' ne' uno di meno", () => {
    expect(tipiFuoriCatalogo()).toEqual([...FUORI_CATALOGO_OGGI])
  })

  it("ogni scena visibile esiste davvero: la whitelist non nomina fantasmi", () => {
    for (const id of VISIBLE_EXP_IDS) {
      expect(findExperimentById(id), `scena dichiarata visibile e assente: ${id}`).toBeTruthy()
    }
  })
})
