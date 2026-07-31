// F5-12 — la rotazione della breadboard dichiarata dalla scena non arrivava al disegno.
//
// MISURATO PRIMA DI SCRIVERE QUESTO TEST (2026-07-31).
//
// La fixture di `v1-cap9-esp6` dichiara `board.pose.rotationDeg: 90` e
// `board.orientation: "manual-figure-vertical"`, e la provenienza spiega perche':
// la figura di Vol.1 p.74 mostra la breadboard RUOTATA VERTICALMENTE. La pagina
// e' stata estratta dal PDF nel repo e guardata: il libro numera le colonne
// 1..21 dall'alto in basso e le righe `a b c d e | f g h i j` da sinistra a
// destra. E' verticale.
//
// Lo schema la valida (`sim/elab/elabScene.ts:60`), e `bookConstraints.ts:473`
// controlla perfino la coerenza fra `board.pose.rotationDeg` e
// `board.orientation`. L'informazione esiste, e' tipizzata e verificata.
//
// Poi si perde in una riga: `elabSceneBridge.ts` faceva
//
//     layout[component.id] = { x: pose.x, y: pose.y }
//
// scartando `rotationDeg` — mentre `SimulationLayout` ha GIA' il campo
// `rotation?: number`. Il campo c'era, il dato c'era, e nessuno li univa.
//
// PERCHE' NON E' UN DETTAGLIO. La provenienza della fixture dichiara
// `visualMatch: "unknown"` proprio per questo, verbatim: «board.orientation=
// manual-figure-vertical e rotazione 90 sono parte del contratto di
// book-fidelity, anche se visualMatch resta unknown FINCHE' IL RENDERER NON
// CONSUMA QUESTA ROTAZIONE». Con la rotazione persa, `visualMatch` non puo'
// passare da `unknown` per NESSUNA delle 88 scene: la promozione
// candidate -> verified e' bloccata per costruzione.
//
// ⚠️ CIO' CHE QUESTO TEST NON ASSERISCE, e va detto: che il disegno risultante
// sia FEDELE alla figura. Asserisce che la rotazione dichiarata arrivi al
// layout. Fedelta' della figura significa confronto render-vs-crop, e quello
// non esiste ancora (unita' aperta nel backlog: «costruire l'overlay validator
// render-vs-crop, o dichiarare formalmente che non si fara'»).
import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { simulationSceneFromElabScene } from "../toolhost/elabSceneBridge"

/** Le opzioni minime che il bridge pretende. Non c'entrano con la rotazione:
 *  senza, `simulationSceneFromElabScene` lancia prima di arrivare al layout, e
 *  il test misurerebbe l'eccezione invece del difetto. */
const OPZIONI = {
  title: "Lampada RGB con 3 potenziometri",
  chapter: "Capitolo 9",
  bookText: "test",
  bookInstructions: ["test"],
  bookQuote: "Vol. 1, p. 71",
}

function fixture(nome: string): unknown {
  return JSON.parse(
    readFileSync(fileURLToPath(new URL(`../../sim/fixtures/${nome}`, import.meta.url)), "utf8"),
  )
}

const ESP6 = "elab-scene-v2-candidate-v1cap9esp6.json"

describe("F5-12 — la rotazione dichiarata dalla scena arriva al layout", () => {
  it("precondizione misurata: la fixture DICHIARA la breadboard verticale a 90 gradi", () => {
    const scena = fixture(ESP6) as {
      board: { pose: { rotationDeg: number }; orientation: string }
      components: Array<{ id: string; type: string; pose: { rotationDeg: number } }>
      provenance: { checks: { visualMatch: string } }
    }
    expect(scena.board.pose.rotationDeg).toBe(90)
    expect(scena.board.orientation).toBe("manual-figure-vertical")

    // Anche il componente breadboard porta la sua rotazione: sono due
    // dichiarazioni distinte, ed e' `bookConstraints` a pretendere che
    // concordino. Qui si verifica solo che esistano entrambe.
    const bb = scena.components.find((c) => c.id === "bb1")
    expect(bb?.type).toBe("breadboard-half")
    expect(bb?.pose.rotationDeg).toBe(90)

    // E la provenienza dichiara PERCHE' visualMatch e' unknown.
    expect(scena.provenance.checks.visualMatch).toBe("unknown")
  })

  it("il layout della scena bridgata porta la rotazione della breadboard", () => {
    const scene = simulationSceneFromElabScene(fixture(ESP6), OPZIONI)
    // Il campo esiste nel tipo da prima di questa unita': era il bridge a non
    // riempirlo. Un `undefined` qui e' esattamente il difetto.
    expect(scene.layout.bb1).toBeDefined()
    expect(scene.layout.bb1.rotation).toBe(90)
  })

  it("i componenti senza rotazione dichiarata NON ne acquisiscono una inventata", () => {
    const scene = simulationSceneFromElabScene(fixture(ESP6), OPZIONI)
    // La batteria e i potenziometri hanno `rotationDeg: 0` nella fixture:
    // devono restare senza rotazione o a 0, mai ereditare quella della board.
    for (const id of ["bat1", "pot1", "pot2", "pot3", "r1", "rgb1"]) {
      const rotazione = scene.layout[id]?.rotation ?? 0
      expect(rotazione, `${id} ha ereditato una rotazione che la scena non dichiara`).toBe(0)
    }
  })

  it("una scena a rotazione zero resta a zero: il bridge non ruota di sua iniziativa", () => {
    const scena = fixture(ESP6) as Record<string, unknown> & {
      board: { pose: { rotationDeg: number }; orientation: string }
      components: Array<{ id: string; pose: { rotationDeg: number } }>
    }
    scena.board.pose.rotationDeg = 0
    scena.board.orientation = "manual-figure-horizontal"
    const bb = scena.components.find((c) => c.id === "bb1")
    if (bb) bb.pose.rotationDeg = 0

    const scene = simulationSceneFromElabScene(scena, OPZIONI)
    expect(scene.layout.bb1.rotation ?? 0).toBe(0)
  })
})
