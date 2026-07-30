// F5-8 — gli esperimenti che un docente può DAVVERO aprire devono risolvere.
//
// `VISIBLE_EXP_IDS` è la whitelist Founder Beta: gli 8 id che compaiono nel
// picker di ELAB Lab. Sonda del 2026-07-31, prima di questo test:
//
//     v1-cap6-esp1  ok      v2-cap7-esp1  THROW  capacitor (id c1)
//     v1-cap6-esp2  ok      v2-cap7-esp2  THROW  capacitor (id c1)
//     v1-cap6-esp3  ok      v3-cap6-esp4  THROW  nano-r4  (id nano1)
//     v1-cap9-esp6  ok      v3-cap6-esp5  THROW  nano-r4  (id nano1)
//
// QUATTRO SU OTTO. Sulla produzione il docente vede un disegno completo e
// corretto — la breadboard, i componenti, i fili — e sotto «solve fallito:
// Error: tipo componente non catalogato per il solve». Il messaggio non è per
// lui, e il circuito non calcola niente.
//
// La causa non è il motore: `CircuitSolver` ha già `_solveCapacitor`,
// `_solveMultimeter` e i case per `push-button`, e il plugin registra tutti e
// quattro i tipi nei propri file componente (Capacitor.jsx:162,
// PushButton.jsx:85, Multimeter.jsx:187, NanoR4Board.jsx:966). È il catalogo
// dell'host — `apps/studio/sim/solver/catalog.ts` — che li nega, perché
// ri-dichiara a mano soltanto sette tipi. Stessa forma di NOTTE-13, quando
// potentiometer e rgb-led erano negati dal catalogo e non dal motore.
//
// PERCHE' QUESTO TEST NON COPRE nano-r4. I suoi pin non sono una lista: sono
// CALCOLATI (allTopPins/allBottomPins/allWingPins, ~40 pin più l'aliasing
// `mapsTo` delle ali). Ricopiarli qui sarebbe la duplicazione che questo loop
// esiste per togliere, e la riparazione giusta è far leggere all'host le
// registrazioni del plugin invece di riscriverle. È unità separata, e questo
// test la tiene VISIBILE invece di lasciarla implicita: l'atteso dichiara che
// due id su otto ancora non risolvono, e il giorno in cui risolveranno questo
// assert diventerà rosso e costringerà a tornare qui.
import { describe, expect, it } from "vitest"
import { findExperimentById } from "@elab-tutor-plugin/data/experiments-index"
import { VISIBLE_EXP_IDS } from "@elab-tutor-plugin/data/experiment-visibility"
import { solveElabExperiment } from "../../sim/solver/elabSolver"

/** Id ancora non risolvibili, con la ragione. Deve solo ACCORCIARSI. */
const ANCORA_ROTTI: Record<string, string> = {
  "v3-cap6-esp4": "nano-r4: pin calcolati, catalogare a mano sarebbe duplicazione",
  "v3-cap6-esp5": "nano-r4: pin calcolati, catalogare a mano sarebbe duplicazione",
}

function esito(id: string): { kind: "ok"; ok: boolean } | { kind: "throw"; detail: string } {
  const experiment = findExperimentById(id)
  if (experiment === null) return { kind: "throw", detail: `esperimento ${id} non trovato` }
  try {
    const result = solveElabExperiment({
      components: experiment.components,
      connections: experiment.connections,
      pinAssignments: experiment.pinAssignments,
    })
    return { kind: "ok", ok: result.ok }
  } catch (error) {
    return { kind: "throw", detail: String(error) }
  }
}

describe("gli 8 esperimenti della whitelist Founder Beta", () => {
  it("la whitelist è quella che credo (l'oracolo non è vacuo)", () => {
    expect(VISIBLE_EXP_IDS.length).toBe(8)
    for (const id of VISIBLE_EXP_IDS) expect(findExperimentById(id), id).not.toBeNull()
  })

  // «Non lancia» è un'asserzione debole: un solve che restituisce un oggetto
  // vuoto la soddisfa. Quello che il docente guadagna è un VERDETTO al posto
  // di un errore interno, quindi è il verdetto che si pretende.
  //
  // E va detto per intero: il circuito esce a RIPOSO. `btn1.pressed` è false,
  // quindi nessuna corrente, condensatore a 0 V, LED spento. È fisicamente
  // corretto — l'esperimento è «scarica del condensatore», e senza premere il
  // pulsante non succede niente — ma NON significa che l'esperimento sia
  // utilizzabile: su questa rotta non c'è modo di premere il pulsante.
  // L'unità chiusa è «il solve non è più un errore», non «l'esperimento
  // funziona».
  it("v2-cap7-esp2: il pannello ha un verdetto vero, non solo l'assenza di eccezione", () => {
    const experiment = findExperimentById("v2-cap7-esp2")
    expect(experiment).not.toBeNull()
    const result = solveElabExperiment({
      components: experiment!.components,
      connections: experiment!.connections,
      pinAssignments: experiment!.pinAssignments,
    })
    // Ogni componente del Pack ha uno stato: nessuno «assente travestito da spento».
    for (const component of experiment!.components) {
      expect(result.componentStates[component.id], `stato mancante per ${component.id}`).toBeDefined()
    }
    // Il LED è conosciuto dal solve, con le sue grandezze.
    const led = result.componentStates.led1 as { on?: boolean; burned?: boolean } | undefined
    expect(led?.on).toBe(false)
    expect(led?.burned).toBe(false)
    // Il condensatore riporta la tensione, che è la grandezza del capitolo.
    const cap = result.componentStates.c1 as { voltage?: number } | undefined
    expect(typeof cap?.voltage).toBe("number")
    // E lo stato a riposo è DICHIARATO, non dedotto: il pulsante non è premuto.
    expect((result.componentStates.btn1 as { pressed?: boolean } | undefined)?.pressed).toBe(false)
  })

  for (const id of VISIBLE_EXP_IDS) {
    const rotto = ANCORA_ROTTI[id]
    if (rotto === undefined) {
      it(`${id}: il solve NON lancia`, () => {
        const risultato = esito(id)
        expect(
          risultato.kind,
          risultato.kind === "throw" ? risultato.detail : "",
        ).toBe("ok")
      })
    } else {
      it(`${id}: ancora rotto, e dichiarato — ${rotto}`, () => {
        // Assert INVERTITO di proposito: se un giorno risolve, questo diventa
        // rosso e obbliga a togliere l'id da ANCORA_ROTTI. Un elenco di
        // eccezioni che nessuno accorcia è un elenco che cresce.
        const risultato = esito(id)
        expect(risultato.kind).toBe("throw")
        if (risultato.kind === "throw") expect(risultato.detail).toContain("nano-r4")
      })
    }
  }
})
