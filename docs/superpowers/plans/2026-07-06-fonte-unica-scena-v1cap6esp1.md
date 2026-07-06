# Fonte Unica Scena v1-cap6-esp1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spegnere la topologia infedele hand-coded di `createReferenceSimulationScene()` e derivare la scena reference v1-cap6-esp1 dall'unica fonte fedele: `simulationSceneFromElabScene(fixture candidate)`.

**Architecture:** `createReferenceSimulationScene({ledOn})` diventa un thin wrapper: importa la fixture JSON `elab-scene-v2-candidate-v1cap6esp1.json`, la passa al bridge con `ELAB_V1_CAP6_ESP1_BRIDGE_OPTS` (nuova export di produzione in `ToolCanvasEmbeddable.tsx`, dove vivono già le costanti crop), e applica solo l'override `runtime.ledOn`. Nessun runtime cycle: `elabSceneBridge.ts` importa da `ToolCanvasEmbeddable` solo `import type`.

**Tech Stack:** React 19 + Vite + Vitest (jsdom), TypeScript strict, tsc -b.

## Global Constraints

- vitest SEMPRE da `apps/studio` (mai da root).
- TDD RED→GREEN osservato; suite ×3 prima della PR; `npx tsc -b` = verità; `npm run build`.
- TESTO manuale fa fede: p30 "collegate il positivo alla striscia rossa superiore" → rail obbligatorio; fori liberi = canonical simulator placement.
- D4 (Vf 1.8 vs 2.0 → render 15.3 vs 14.9 mA): il manuale NON dichiara alcun valore in mA; la tabella engine (red=1.8) è già canone su main. Il golden diventa 15.3 mA con commento gate-Andrea esplicito: NON mascherare.
- No nuove dipendenze npm. No push main. Fixture JSON mai riscritta con json.dump/riformattazioni.

---

### Task 1: RED — characterization fonte unica

**Files:**
- Create: `apps/studio/src/__tests__/FonteUnicaScena.test.tsx`

**Interfaces:**
- Consumes: `createReferenceSimulationScene`, `ELAB_V1_CAP6_ESP1_BRIDGE_OPTS` (Task 2), `simulationSceneFromElabScene`, fixture JSON.
- Produces: il contratto "reference === bridge(fixture)" che vieta ogni drift futuro.

- [ ] **Step 1: Write the failing test**

```tsx
// @vitest-environment jsdom
//
// FONTE UNICA: la scena reference v1-cap6-esp1 NON è più hand-coded ma
// derivata dal bridge sulla fixture candidate (schema circuit-scene/2).
// Questo test vieta il drift: se qualcuno reintroduce una topologia a mano
// (bat+→j2 senza rail, violazione p30 provata da ElabBookConstraints
// .test.ts:109-125), il deep-equal fallisce.
import * as fs from "node:fs"
import * as path from "node:path"
import { describe, expect, it } from "vitest"
import { simulationSceneFromElabScene } from "../toolhost/elabSceneBridge"
import {
  ELAB_V1_CAP6_ESP1_BRIDGE_OPTS,
  createReferenceSimulationScene,
} from "../toolhost/ToolCanvasEmbeddable"

const repoRoot = path.resolve(import.meta.dirname, "../../../..")

function candidateFixture(): unknown {
  return JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, "apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json"),
      "utf-8",
    ),
  )
}

describe("fonte unica scena v1-cap6-esp1", () => {
  it("createReferenceSimulationScene = bridge(fixture): zero topologia hand-coded", () => {
    const reference = createReferenceSimulationScene()
    const bridged = simulationSceneFromElabScene(candidateFixture(), ELAB_V1_CAP6_ESP1_BRIDGE_OPTS)
    expect(reference).toEqual(bridged)
  })

  it("la reference rispetta il testo p30: bat+ arriva a un rail plus, non a un foro di zona", () => {
    const scene = createReferenceSimulationScene()
    const positive = scene.connections.find((c) => c.from === "bat1:positive")
    expect(positive?.to).toBe("bb1:bus-top-plus-1")
    expect(positive?.path?.kind).toBe("polyline")
  })

  it("ledOn override sopravvive al bridge (unico delta ammesso)", () => {
    const off = createReferenceSimulationScene({ ledOn: false })
    expect(off.runtime.kind).toBe("battery-led")
    if (off.runtime.kind === "battery-led") expect(off.runtime.ledOn).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/studio && npx vitest run src/__tests__/FonteUnicaScena.test.tsx`
Expected: FAIL — `ELAB_V1_CAP6_ESP1_BRIDGE_OPTS` non esportata; poi deep-equal diverso (topologia j2/i2 vs rail).

### Task 2: GREEN — swap del body

**Files:**
- Modify: `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:189-300` (body di `createReferenceSimulationScene` + export `ELAB_V1_CAP6_ESP1_BRIDGE_OPTS`; import bridge + fixture JSON)
- Modify: `apps/studio/tsconfig.app.json` (aggiungi `"resolveJsonModule": true`)

**Interfaces:**
- Produces: `export const ELAB_V1_CAP6_ESP1_BRIDGE_OPTS: ElabSceneBridgeOptions`; `createReferenceSimulationScene({millis?, ledOn?})` firma INVARIATA, ritorno = scena bridgata.

- [ ] **Step 1: Implementazione**

```tsx
import { simulationSceneFromElabScene, type ElabSceneBridgeOptions } from "./elabSceneBridge";
import elabSceneCandidateV1Cap6Esp1 from "../../sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json";

// Copy canoniche dal testo Vol.1 p29-31 (fori liberi = "un punto qualsiasi").
export const ELAB_V1_CAP6_ESP1_BRIDGE_OPTS: ElabSceneBridgeOptions = {
  title: "Accendi il tuo primo LED",
  chapter: "Capitolo 6 - Cos'e il diodo LED?",
  bookText: "Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di: un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.",
  bookInstructions: [
    "Ragazzi, collegate la clip alla batteria e il positivo alla striscia rossa superiore della breadboard.",
    "Ragazzi, collegate il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto.",
    "Ragazzi, inserite il LED a cavallo della separazione centrale: gambetta lunga verso il resistore, gambetta corta dopo la divisione.",
    "Ragazzi, collegate il negativo della batteria nella stessa colonna della gambetta corta del LED.",
  ],
  bookQuote: "Il LED si e acceso! Bellissimo vero?",
  manualCrop: ELAB_V1_CAP6_ESP1_MANUAL_PAGE_IMAGE,
  manualFinalCrop: ELAB_V1_CAP6_ESP1_FINAL_PAGE_IMAGE,
};

export function createReferenceSimulationScene({
  ledOn = true,
}: { millis?: number; ledOn?: boolean } = {}): SimulationSceneV1 {
  const scene = simulationSceneFromElabScene(elabSceneCandidateV1Cap6Esp1, ELAB_V1_CAP6_ESP1_BRIDGE_OPTS);
  if (scene.runtime.kind === "battery-led") scene.runtime.ledOn = ledOn;
  return scene;
}
```

- [ ] **Step 2: Run Task 1 test → PASS**; poi suite completa per censire i rossi attesi.

### Task 3: riconciliazione consumer pinnati sulla vecchia topologia

**Files (Modify):**
- `apps/studio/src/__tests__/ToolCanvasEmbeddable.test.tsx` (label `Vol.1 pag.29-31 - ESPERIMENTO`, pin `r1:pin1→bb1:bus-top-plus-9`, golden 14.9→15.3 mA con commento D4 gate-Andrea, figurePage/manualSource secondo output bridge)
- `apps/studio/src/__tests__/SimulationSolve.test.ts` (net: `bus-top-plus-1`≡`bus-top-plus-9`≡`r1:pin1` rail; `bat1:negative`≡`bb1:a9`≡`led1:cathode` colonna 9)
- `apps/studio/src/__tests__/ToolCanvasMontaggioLibero.test.tsx:87` (foro occupato: `bb1:i2`→`bb1:i9`)
- `apps/studio/e2e/montaggio-canvas.spec.ts:4,51-52` (idem)
- `apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx` (verifica, aggiorna se pinna fori)
- `apps/studio/src/__tests__/simulationPluginRegistry.test.ts:45` (deve passare invariato — bridge passa validateBookLayoutScene)

Regola: ogni valore aggiornato deve citare la fonte (fixture/engine), niente numeri inventati. Il golden 15.3 mA porta commento: `D4 gate-Andrea aperto: Vf red=1.8 dalla tabella engine (manuale senza valore mA); se Andrea sceglie 2.0 cambia la tabella, non la scena.`

- [ ] Suite completa ×3 verde + `npx tsc -b` + `npm run build`
- [ ] Commit + PR piccola

## Self-review
- Copertura: swap (Task 1-2), consumer (Task 3). D4 documentato non mascherato. e2e testuale aggiornato (smoke se server disponibile).
- Nessun placeholder; firme esatte; niente riscrittura fixture.
