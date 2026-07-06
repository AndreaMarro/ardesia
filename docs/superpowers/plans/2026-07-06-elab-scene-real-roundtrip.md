# ElabScene v1-cap6-esp1 Real Round-Trip — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the v1-cap6-esp1 `circuit-scene/2` fixture from a synthetic-adjacent island into the first REAL book-faithful scene: topology matching the manual text, authored `wires[].path` + poses, populated `source` evidence, and `bookMatch`/`electrical` provenance checks COMPUTED by falsifiable code instead of author-asserted strings.

**Architecture:** Three PRs. PR-1 reconciles the fixture topology with the book text (Vol.1 pp.29-31), adds a `bookConstraints` checker module + electrical solve test, and drift-guards the fixture's claimed checks against computed results. PR-2 adds a bridge `ElabScene → SimulationSceneV1` so the real renderer draws the schema-frozen scene (render round-trip). PR-3 (budget-permitting) closes P0-B: `studentpack.generated/exported` event kinds + Z7 action.

**Tech Stack:** TypeScript, Zod (existing `elabScene.ts`), vitest (jsdom), vendored CircuitSolver via `solveElabExperiment`.

## Global Constraints

- vitest SEMPRE da `apps/studio`: `npx vitest run --pool=threads --maxWorkers=1` (×3 prima di dichiarare verde).
- `tsc -b` = verità: `npm --prefix apps/studio run typecheck` exit 0.
- Nessun push su main; branch da origin/main 97f26e6f; merge via `bin/pr-merge-verify.sh` solo con CI verde.
- Mai toccare `apps/studio/sim/solver/engine/` (vendored, drift-guard sha256).
- Il TESTO del manuale fa fede; dove il libro dice "un punto qualsiasi" i fori esatti sono **canonical simulator placement** e vanno dichiarati tali, mai spacciati per vincolo del libro.
- Provenance resta `candidate`: la promozione a `verified` è gate-Andrea (human ✓). `visualMatch` resta `"unknown"` (nessun overlay grader in questo piano — non fingere).
- Zero nuove dipendenze npm.

## Book evidence (firsthand, crop committati su main)

Da `apps/studio/public/elab/manuals/vol1/page-030-esercizio-6-1.png` + `page-031-esercizio-6-1.png` (testo verbatim):
1. p30: "Collega il positivo della batteria alla striscia rossa superiore della breadboard" → **bat+ → rail rosso**.
2. p30: "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto" → **una gamba del resistore NEL rail, l'altra nella zona fori**.
3. p30: "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale" → **anodo sulla stessa strip del pin2 del resistore; catodo oltre il canale centrale**.
4. p31: "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED" → **bat− → stessa colonna del catodo**.
5. Componenti: LED, breadboard, batteria 9V, clip, resistore 470 Ω (elenco p29/bookText).

Stato attuale (entrambi infedeli al testo):
- Fixture candidate (`elab-scene-v2-candidate-v1cap6esp1.json`): resistore i9↔i3 (due gambe in zona) + filo extra rail→j9 → viola il vincolo 2.
- `createReferenceSimulationScene()` (SimulationSceneV1): bat+→j2 diretto, **nessun uso del rail** → viola i vincoli 1 e 2 (il suo stesso `blocker` ammette il drift).

Topologia riconciliata (canonical placement dichiarato per i fori esatti):
- `w1`: `bat1:positive → bb1:bus-top-plus-1` (rosso) — vincolo 1.
- `r1:pin1 → bb1:bus-top-plus-9`, `r1:pin2 → bb1:i9` — vincolo 2 (gamba nel rail).
- `led1:anode → bb1:f9` (stessa strip net-bot-9 di i9), `led1:cathode → bb1:e9` (oltre il canale) — vincolo 3.
- `w2`: `bat1:negative → bb1:a9` (nero) — vincolo 4 (net-top-9 = colonna del catodo).
- Rete: 9V → rail+ → R470 → LED → colonna 9 top → bat−. Corrente attesa dal motore (Vf red 1.8 da tabella engine): (9−1.8)/470 = **15.3 mA** (golden già in repo).

---

## PR-1 — branch `feat/elab-scene-real-v1cap6esp1-20260706`

### Task 1: bookConstraints checker (falsificabile) — RED su fixture attuale

**Files:**
- Create: `apps/studio/sim/elab/bookConstraints.ts`
- Test: `apps/studio/src/__tests__/ElabBookConstraints.test.ts`

**Interfaces:**
- Produces: `type BookConstraintResult = { id: string; ok: boolean; detail: string }`; `checkBookConstraintsV1Cap6Esp1(scene: ElabScene): { ok: boolean; results: BookConstraintResult[] }`.
- Consumes: `ElabScene` da `./elabScene.ts`, `pointForBreadboardRef` da `../breadboard/simulationBreadboard.ts` (per riconoscere rail refs: `/^bb\d+:bus-(top|bot)-(plus|minus)-\d+$/`).

Il checker implementa i 4 vincoli topologici del testo (il 5° = BOM: {battery9v, breadboard-half, resistor 470, led} esatti). Vincoli espressi sui dati della scena:
- C1 `battery-positive-to-red-rail`: esiste wire da `bat*:positive` a ref `bus-*-plus-*`.
- C2 `resistor-bridges-rail-and-zone`: dei due pin del resistore, esattamente uno assegnato a un ref rail `plus` e uno a un foro zona (`[a-j]\d+`).
- C3 `led-anode-toward-resistor-cathode-past-channel`: anodo sulla stessa strip interna del pin-zona del resistore (stessa metà f-j e stessa colonna), catodo sull'altra metà (a-e) stessa colonna.
- C4 `battery-negative-same-column-as-cathode`: wire da `bat*:negative` a foro con stessa colonna del catodo, metà a-e.
- C5 `bom-matches-book`: components = esattamente i 4 tipi del libro, resistor value 470, led color red.

- [ ] **Step 1:** scrivi test: fixture attuale (import del JSON) → `checkBookConstraintsV1Cap6Esp1` deve dare `ok:false` con C2 fail (RED osservato = il checker non esiste ancora; poi GREEN col checker e il test asserisce il fail C2 sulla fixture VECCHIA inline-costruita, non sul file, perché il file verrà riconciliato in Task 2). Test falsificabili: scena conforme → ok; scena col resistore due-gambe-in-zona → C2 fail; anodo/catodo invertiti → C3 fail; bat− colonna sbagliata → C4 fail; valore resistore 220 → C5 fail.
- [ ] **Step 2:** run, verifica FAIL per "module not found".
- [ ] **Step 3:** implementa `bookConstraints.ts` minimale.
- [ ] **Step 4:** run, verifica PASS.
- [ ] **Step 5:** commit `feat(sim): bookMatch calcolato per v1-cap6-esp1 (vincoli dal testo, falsificabili)`.

### Task 2: riconcilia la fixture reale (topologia + geometria + source)

**Files:**
- Modify: `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json`
- Test: estendi `apps/studio/src/__tests__/ElabBookConstraints.test.ts`

Nuova fixture: topologia riconciliata (sopra), `source` popolato (`sourceRef` = crop paths `/elab/manuals/vol1/page-030-esercizio-6-1.png` + `page-031-esercizio-6-1.png`; nota "fori esatti = canonical simulator placement, il testo lascia libertà"), poses per tutti i 4 componenti, `wires[].path` polyline autorate per w1/w2 (punti coerenti con `pointForBreadboardRef`), `provenance.checks` = `{electrical:"pass", geometry:"pass", bookMatch:"pass", visualMatch:"unknown"}`, status `candidate`, origin `hand`.
NB: verifica i campi ammessi da `source` in `elabScene.ts` prima di scrivere (fail-closed su unknown keys).

- [ ] **Step 1:** test drift-guard: la fixture → `checkBookConstraintsV1Cap6Esp1` ok:true E `sceneGeometryStatus` = tutti componenti con pose, tutti i wires con path E claimed `bookMatch === "pass"` coincide col computato E `source.sourceRef` non vuoto. RED: fixture vecchia fallisce.
- [ ] **Step 2:** riscrivi la fixture JSON.
- [ ] **Step 3:** run test PASS; run anche `ElabScene.test.ts` + `ElabSceneAdapter.test.ts` (la fixture è usata lì — aggiorna asserzioni che dipendono dalla topologia vecchia, dichiarandolo nel commit).
- [ ] **Step 4:** commit `feat(sim): fixture v1-cap6-esp1 riconciliata col testo del manuale (rail reale, geometria autorata, evidence)`.

### Task 3: electrical calcolato via motore reale

**Files:**
- Test: `apps/studio/src/__tests__/ElabSceneElectrical.test.ts`

**Interfaces:**
- Consumes: `createSimulationAdapterPayloadFromElabScene` (adapter), `solveElabExperiment` da `sim/solver/elabSolver.ts` (SolverExperiment = {components, connections, pinAssignments}; adapter wires {from,to,color} sono già connections-compatibili; i ref `bb1:x` sono risolti dal catalogo via `registerElectricalCatalog`).

- [ ] **Step 1:** test: fixture → adapter payload → SolverExperiment → `solveElabExperiment` → `componentStates.led1.on === true`, `currents.r1` ≈ 0.0153 (±1e-4), `diagnostics.shortCircuit === false`, 0 disconnectedPins. Drift-guard: claimed `checks.electrical === "pass"` coincide. Falsificabile: stessa scena con anodo/catodo scambiati → LED off; senza w2 → circuito aperto (ok:true ma led off, disconnectedPins > 0). RED prima della fixture Task 2 se girato su topologia vecchia; qui RED = file test nuovo che fallisce senza fixture riconciliata.
- [ ] **Step 2:** run PASS ×1, poi suite intera ×3 da apps/studio.
- [ ] **Step 3:** commit `test(sim): electrical check di v1-cap6-esp1 calcolato dal motore vendored (15.3 mA golden)`.

### Task 4: PR
- [ ] typecheck + build + vitest ×3 + `git diff --cached --check` (escl. vendored) + NUL/secret scan → apri PR con body-evidenza CoV. NON mergiare senza CI verde; merge via `bin/pr-merge-verify.sh`.

---

## PR-2 — branch `feat/elab-scene-render-bridge-20260706` (da main post-PR-1)

### Task 5: bridge ElabScene → SimulationSceneV1 (render round-trip)

**Files:**
- Create: `apps/studio/src/toolhost/elabSceneBridge.ts`
- Test: `apps/studio/src/__tests__/ElabSceneBridge.test.tsx`

**Interfaces:**
- Produces: `simulationSceneFromElabScene(scene: unknown, opts: { title: string; chapter: string; bookText: string; bookInstructions: string[]; bookQuote: string }): SimulationSceneV1`.
- Consumes: `createSimulationAdapterPayloadFromElabScene`, tipi `SimulationSceneV1`/`validateBookLayoutScene` da `ToolCanvasEmbeddable.tsx`.

Regole: NON toccare `createReferenceSimulationScene` (additivo); `manual.volume/page` da `scene.book` (page = prima pagina); `pinAssignments`/`connections` dai dati adapter (wires → kind "wire"); `layout` dalle poses; `bookLayout` generato coerente (pins/wires speculari, spatialRules minime derivate dalle poses, `manualSource.crop/finalCrop` dai `source.sourceRef`); `runtime` battery-led con `ledForwardVolts` dalla tabella engine per il colore (red = 1.8 — evita il conflitto D4 dichiarato); `provenance.status` = scene.provenance.status mappato (candidate→draft).
- [ ] **Step 1:** test RED: fixture riconciliata → bridge → `validateBookLayoutScene(bridged).ok === true` + `bridged.pinAssignments` identici alla fixture + render smoke jsdom (mount embeddable con state `{kind:"simulation-scene-v1", scene: bridged}` seguendo il pattern dei test esistenti `ToolCanvasEmbeddable.test.tsx`).
- [ ] **Step 2:** implementa bridge minimale; PASS; suite ×3; typecheck; commit `feat(toolhost): bridge ElabScene→SimulationSceneV1 — la scena circuit-scene/2 reale è renderizzabile`.
- [ ] **Step 3:** PR con CoV.

---

## PR-3 (se budget contesto) — branch `feat/z7-studentpack-events-20260706`

### Task 6: studentpack.generated/exported append-only + azione Z7

> [FATTO NOTTE-4 2026-07-06 — PR studentpack-generated-exported]: union eventlog + projector lift + bottoni Z7 Genera/Esporta. errorId aggiunto all'item queue.

**Files:**
- Modify: `apps/studio/src/lessonos/eventlog.ts` (union: 2 nuovi kind), `apps/studio/src/core/contracts/eventBus.ts` (map), `apps/studio/src/lessonos/teacherDashboardProjection.ts` (lift candidate→generated/exported), `apps/studio/src/design/TeacherDashboardView.tsx` (bottone "Genera pack" per riga candidate → append `studentpack.generated` con evidence refs)
- Test: estendi test esistenti di projection + view.

Eventi: `studentpack.generated { packId, errorId, fromRoom, refs }`, `studentpack.exported { packId }`. Nessun secondo store: solo event-log. Projector: candidate + generated event (stesso packId `sp-<errorId>`) → status generated; + exported → exported. TDD RED→GREEN come sopra, suite ×3, PR.

---

## Self-review
- Copertura: P0-A (scena reale, wires[].path, adapter/render round-trip, validator falsificabili, book refs, crop evidence) = Task 1-5. P0-B residuo = Task 6. visualMatch/overlay = fuori scope, dichiarato.
- Nessun placeholder; interfacce con firme esatte; comandi esatti nei Global Constraints.
- I fori esatti della topologia riconciliata sono scelti = stessa colonna 9 della scena reference (f9/e9/a9/i9) per minimizzare il drift tra i due formati.
