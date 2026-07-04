# Spec — `simulature` Fase 2: CircuitSolver dietro il registry (confine P2)

> 2026-07-04 · estende `docs/ELABTUTOR-PLUGIN-SPEC` e `docs/ELAB-SCENE-FORGE-CANON` (non li duplica).
> Contesto prodotto completo: `PROMPT-TOTALE-SIMULATURE-ARDESIA-FABLE5-2026-07-15.md` (VOLUME 3).

## Stato verificato firsthand (2026-07-04)

- `origin/main` = `f03ec119` — PR #44-#47 **già mergiate** (Fase 0 chiusa).
- PR aperte gate-Andrea: #48 (docs), **#49 = Fase 1 già implementata** (freeze `ElabScene circuit-scene/2` + read-shim), #50 (adapter ElabScene→sim payload + F4/F5), #51 (config manuali C1), #52 (preflight preview).
- Baseline CoV su main: `tsc -b` exit 0 · vitest ×3 = **773 passed / 5 skipped**, exit 0.
- Confine P2 (grafo G3): `simulationPluginRegistry.ts` (studio, #45) e `CircuitSolver.js`
  (`plugins/elab-tutor/src/components/simulator/engine/`, 2486 righe, net-based Union-Find +
  path-tracing + MNA per percorsi paralleli) **scollegati** — zero import, solo similarità semantica.

## Obiettivo della fase

Il motore elettrico reale (`CircuitSolver.js`) diventa invocabile attraverso il registry di
dispatch del Simulation Plugin (`simulationPluginRegistry`), con contratto tipizzato,
senza riscrivere il solver e senza toccare la superficie di sicurezza ToolHost
(`session.ts` / `router.ts` / `host.ts` non si toccano).

## Non-goal (esplicitamente fuori slice)

- Firma completa del ToolManifest per il bundle solver (il registry oggi governa solo il
  dispatch del render; la firma del bundle arriva quando il solver entra nel bundle tool).
- Sostituire il traversal di render in `ToolCanvasEmbeddable` (il golden UI 14.9 mA resta
  traversal-driven; PR #50 tocca lo stesso file ed è gated).
- Vision, toolchain, 3 modalità didattiche (fasi 5-7 del piano).

## Design

### D1 — Packaging: vendored byte-identical + drift-guard

`CircuitSolver.js` e `components/registry.js` (88 righe, senza React) vengono copiati
**byte-identici** sotto `apps/studio/sim/solver/`:

```
apps/studio/sim/solver/
  engine/CircuitSolver.js        ← copia byte-identica (import '../components/registry' invariato)
  engine/CircuitSolver.d.ts      ← superficie tipizzata minima (nuovo)
  components/registry.js         ← copia byte-identica
  components/registry.d.ts       ← tipi minimi (nuovo)
  catalog.ts                     ← catalogo elettrico headless (nuovo, dati dai JSX firsthand)
  elabSolver.ts                  ← wrapper tipizzato: experiment → SolveResult (nuovo)
```

Un **drift-guard test** (pattern repo, cfr. commit `02973e01`) confronta sha256 della copia
vendored con la sorgente canonica in `plugins/elab-tutor`: se il plugin evolve il solver,
il test fallisce e obbliga il refresh consapevole.

Alternative scartate: import cross-package (elab-tutor è una app Vite, non un package;
direzione import vietata dal gate ImportBoundary), riscrittura in TS (vietata dal canone
"impacchettare, non riscrivere"), refactor DI del solver (tocca il runtime del plugin).

### D2 — Catalogo elettrico headless

Il solver legge dal registry componenti solo `pins` e `getInternalConnections()`
(mai `component` React). `catalog.ts` registra via `registerComponent` i soli dati
elettrici, estratti firsthand dalle chiamate `registerComponent(...)` nei JSX:
`battery9v`, `resistor`, `led`, `wire`, `breadboard-half` (pins + strip interne).
Estensioni future (mosfet, sensori) = slice successive on-demand.

### D3 — Contratto registry: `solve?` additivo

`SimulationToolEntry` guadagna un campo opzionale:

```ts
solve?(experiment: SolverExperiment): SolveResult;
```

- `SolverExperiment` = `{ components, connections, pinAssignments }` (il contratto nativo di
  `loadExperiment`, tipizzato).
- `SolveResult` = `{ ok, componentStates, diagnostics, warnings }` con correnti/tensioni per
  componente e diagnostica (short/overload/disconnessi) dal solver.
- Deny-by-default preservato: tool non registrato → nessun solve.
- Il reference sim tool registra `solve` = wrapper `elabSolver.ts` sul vendored engine.

### D4 — Conflitto Vf esplicito (mai silenzioso)

Firsthand: la scena reference studio dichiara `ledForwardVolts: 2` (→ golden UI 14.9 mA),
il solver canonico usa `LED_VF.red = 1.8` (→ suo golden 15.3 mA,
`CircuitSolver.comprehensive.test.js:81`). Il wrapper NON riconcilia in silenzio:
se la scena dichiara un Vf diverso dalla tabella del motore per quel colore, emette
`warnings: ["led1: scene ledForwardVolts=2 ≠ engine LED_VF.red=1.8"]`.
Golden elettrico del solve via registry = **15.3 mA** (canon del motore, preservato);
golden UI = **14.9 mA** (traversal, intoccato). Entrambi testati.

### D5 — Typecheck

Niente `allowJs`: i `.js` vendored ricevono `.d.ts` companion. Nessuna modifica a
`tsconfig.app.json` (PR #50 ciclo C porta `sim/` sotto `tsc -b`; questa slice non deve
confliggere). Verifica locale: typecheck ad hoc dei nuovi `.ts` + vitest.

## Test (predicati eseguibili)

1. **Drift-guard**: sha256(vendored) == sha256(sorgente plugin) per entrambi i file.
2. **Golden elettrico**: solve via registry del circuito reference (9V + 470Ω + LED rosso su
   breadboard-half, connections+pinAssignments della scena reference) → `led1.current ≈ 0.0153 A`
   (tolleranza `toBeCloseTo(0.0153, 3)`) e `on === true`.
3. **Conflitto Vf**: warning presente quando scene Vf ≠ tabella motore.
4. **Circuito aperto**: senza filo negativo → corrente 0, `on === false`.
5. **Deny-by-default**: toolId non registrato → `getSimulationTool` undefined (già coperto,
   si estende al solve).
6. **Regressione**: golden UI 14.9 mA e le 773 esistenti invariate; vitest ×3 exit 0; `tsc -b` exit 0.

## Rischi

- **Drift del solver nel plugin**: coperto dal drift-guard (fallimento esplicito).
- **Vf model mismatch**: reso esplicito (D4), decisione di riconciliazione = GATE-Andrea
  (quale Vf è canone per il Vol.1: 1.8 del motore o 2.0 della scena).
- **Conflitto con PR #50**: evitato non toccando `ToolCanvasEmbeddable.tsx` render/tsconfig;
  l'unico file condiviso è `simulationPluginRegistry.ts` (#50 non lo tocca — verificato nel diff).
