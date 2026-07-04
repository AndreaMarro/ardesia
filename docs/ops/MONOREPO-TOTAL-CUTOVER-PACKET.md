# MONOREPO-TOTAL-CUTOVER-PACKET

Date: 2026-07-01 · **Updated: sessione "2026-07-16" (clock macchina reale: 2026-07-04 — ogni data 15/16jul in questo doc è il nome-sessione del prompt, non la data reale)**
Status: plan, no cutover performed. First time committed to repo (previously lived only untracked in the local dirty checkout — that was itself fragmentation).
Canonical repo: `AndreaMarro/ardesia`

## Stato firsthand 2026-07-16

All claims below verified by command in session (FIRSTHAND unless marked).

- `origin/main` = `a237295c` (merge PR #43). No feature merge since.
- **PR aperti in attesa GATE-Andrea (mai auto-merge). "Verdi" = CoV locale sessione 15jul; il repo NON ha CI, quindi nessuno stato green machine-verificabile sui PR:**
  - **#44** replay player `?vista=replay` (P1)
  - **#45** toolhost registry dispatch + solve serie graph-driven (P2)
  - **#46** LessonOS manualRegistry + bridge call-site su export (P5) — inerte in prod (registry default vuoto)
  - **#47** docs AGENTS.md studio (gotcha tsc-b/erasableSyntaxOnly)
  - Tutti `MERGEABLE` a preflight 2026-07-16. #1/#2 CONFLICTING (vecchi draft docs), #4/#5/#6 draft docs/codex.
- **Merged-cert combinato P1+P2+P5**: branch locale `cert/merge-p1-p2-p5-20260715` @ `46c5ce85`, worktree **`/private/tmp/ardesia-audit-cert-5w6CYl`**.
  ⚠️ Path correction: il vecchio handoff indicava `/private/tmp/ardesia-work-a237295c`, che ora è sulla branch docs di #47 (`docs/agents-md-refresh-20260715`) — path stale, non usarlo per il cert.
  CoV cert (sessione 15jul): tsc 0 · vitest 773 passed | 5 skipped ×3 exit 0 · build 0. Merge sequenziale P1→P2→P5 zero conflitti → merge in qualunque ordine è sicuro; dopo il merge reale rifare tree-verifica `git diff origin/main cert/merge-p1-p2-p5-20260715` (atteso vuoto).
- Prod: `ardesia-lavagna.vercel.app` 200 · `ardesia-api-vercel.vercel.app/health` 200. Vercel `ardesia-lavagna` = repo standalone: merge nel monorepo NON deploya nulla.
- Checkout principale `/Users/andreamarro/VOLUME 3/ardesia` sporco su `codex/ardesia-ops-headroom-20260701` — intoccabile per lavoro di codice; ogni lane parte da worktree pulita su `origin/main`.

## Stato import (cosa è GIÀ nel monorepo)

| Package | Stato | Evidenza |
|---|---|---|
| `packages/engine` | importato da `lessonos@auto/main`, storia preservata | commit `c4327c31`; drift-guard test `02973e01` |
| `apps/studio` | vive nel monorepo (lavagna + ToolHost) | gate verdi su a237295c: 723 passed / 5 skipped ×3 |
| `plugins/elab-tutor` | importato ma è ancora **intera app** (auth, `supabase/`, `api/`, `server/`, `vercel.json`, dashboard) | ls-tree firsthand 2026-07-16 — va splittato, vedi sotto |
| `packages/studio`, `packages/tools`, `packages/api`, `packages/simulation-plugin`, `packs/` | NON esistono ancora | ls-tree origin/main |

Nota target-shape: la realtà attuale è `apps/studio`, il target è `packages/studio`. Il rename/move è cutover Phase 3+, non va fatto opportunisticamente dentro altre lane.

## Package gate map (comandi esatti)

Gate = autorità. Mai indebolire. Baseline sempre PRIMA di toccare codice; non assumere conteggi vecchi.

### apps/studio (FIRSTHAND — verdi su a237295c)
```bash
cd apps/studio
npm run typecheck                        # tsc -b --noEmit
npx vitest run --pool=threads --maxWorkers=1 \
  --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
npm run build                            # tsc -b && vite build
```
CoV completa = typecheck → vitest full ×3 (flag stabilizzati sopra, exit espliciti) → build. Gotcha: vitest NON typechecka (`erasableSyntaxOnly`) — tsc-b obbligatorio. Gotcha cwd (sessione 16jul): vitest va lanciato DA `apps/studio`, mai dalla root con `npm --prefix apps/studio exec vitest` (forma precedente di questo packet: rotta).

### packages/engine (FIRSTHAND: pyproject.toml + uv.lock + tests/ presenti)
```bash
cd packages/engine && uv run pytest
```
Gate FROZEN pytest. Drift-guard vs lessonos canonico in `tests/` (commit `02973e01`).

### plugins/elab-tutor (INFERENCE — non eseguito firsthand in questa sessione)
```bash
cd plugins/elab-tutor && npm test        # vitest.config.js presente; verificare prima di fidarsi
```
TODO: eseguire e registrare baseline reale prima di qualunque lane che tocchi il plugin.

### packages/tools / packages/api / packages/simulation-plugin
Non esistono: gate da definire ALLA CREAZIONE del package, mai dopo.

### Gate import-direction sim/ → src/ (nuovo, in PR #50)
`apps/studio/src/__tests__/ImportBoundarySim.test.ts` (scan fs+regex, zero dipendenze): fallisce se un modulo sotto `apps/studio/sim/` importa relativo dentro `apps/studio/src/`. È il primo enforcement eseguibile della direzione "simulation core puro non dipende da UI/toolhost" (target shape: `packages/simulation` non importa `apps/*`). Gira dentro il gate vitest studio. Limite dichiarato: copre solo specifier relativi statici/`import()` con apici; se entrano path alias va esteso.

## Addendum firsthand 2026-07-04 (sessione F5/F4)

Clock macchina 2026-07-04. Stato PR ricontrollato firsthand dopo push:
- Stack sim: **#49** (schema, base main, fix F3 `2d2b3c70`) → **#50** (adapter, fix F1/F6 `9b82eab4`, **F5 chiuso** `ca5624bb`, **F4 chiuso** `42f749a5`+`a1f06125`+`7d44006f`). Entrambi MERGEABLE.
- Stack LessonOS: **#46** → **#51** (C1 config manuali reale, hash Vol.2/Vol.3 firsthand). Entrambi MERGEABLE.
- **#48** (questo packet) MERGEABLE.
- F4: `simulationBreadboard.ts` ora vive in `apps/studio/sim/breadboard/` (direzione src→sim ovunque); `sim` aggiunto a tsconfig include (prima typecheckato solo via test — ha scoperto un TS6133 latente in `sim/bundle.ts`).
- **F2 resta GATE-Andrea** (canDriveLesson true con zero geometria authored — decisione canon ELAB-SCENE-FORGE §3).
- Baseline test per branch (firsthand 04jul): main+#49 = 749/5 · #49+#50 HEAD `7d44006f` = **763/5** ×3 · #46+#51 = 739/5.

## Decision tree LessonOS / Simulation Plugin

Ordine di priorità quando si apre una lane (post-preflight):

```text
PR #44-#47 aperti?
├─ SÌ → NON mergeare. Lane consentite:
│   ├─ monorepo readiness (docs, gate map, contratti indipendenti)
│   ├─ spec/test che non dipendono dai PR (dichiarare le dipendenze)
│   └─ vietato: lane che assumono #44-#47 in main
└─ NO (merged) → in ordine:
    1. Merged-cert reale: tree-verifica vs cert/merge-p1-p2-p5-20260715 + CoV completa + smoke
    2. Monorepo readiness (se stale)
    3. LessonOS lane C:
       C1 manual registry reale — sha256 dei PDF manuali con la STESSA semantica
          della pipeline loadFile runtime; material.cited vero solo se hash combacia;
          hash sconosciuto → nessuna citazione (test di errore obbligatorio)
       C2 lesson.ended come trigger (export resta fallback, non unica semantica);
          eventi append-only, deterministici, idempotenti; LLM mai scrive su LessonOS
    4. Simulation Plugin lane D (ordine duro, consumer prima del producer):
       schema ElabScene freeze (estensione circuit-scene/2, NON fork)
       → catalogo componenti + coordinate breadboard human/LLM-readable
       → read-shim connections→wires
       → wire.path.points persistito + render deterministico
       → round-trip 1 comando (JSON→PNG→overlay→grader→solver)
       → 5 scene starter hand-authored + gate umano
       → SOLO DOPO: CV/image forge (trappola se fatta prima)
```

Tie-break tra opzioni: preferire (1) ciò che sblocca monorepo, (2) schema/validator su UI polish, (3) consumer round-trip su producer CV, (4) test discriminante su refactor, (5) eventi deterministici LessonOS su AI UX.

## Split obbligatorio elab-tutor (boundary)

- **Simulation Plugin** possiede: simulatore, canvas, solver, catalogo componenti.
- **ELABTutor Pack** (`packs/elab`) possiede: lesson-paths, manual refs, build steps, common mistakes, metodo UNLIM.
- **Core/Studio** possiede: shell, auth, board, ToolHost, memoria, report.
- Mount SOLO via ToolHost (`renderEmbeddable()`/manifest), mai bypass `srcDoc`.
- Lint/CI gate deve fallire se in `plugins/elab-tutor/src/` riappaiono `App.jsx`/`main.jsx`, `auth/`, `supabase/functions/`, dashboard/backend propri.

## Goal

Make ARDESIA a total monorepo containing:

- code;
- docs and canon;
- ideas and product direction;
- plugin and pack contracts;
- marketplace kernel;
- FastAPI integration gateway;
- Vercel demo;
- ChatGPT Apps/MCP integration map;
- Claude/Codex/Hermes/Teams/Moodle/LMS integration map;
- LessonOS graph;
- AgentMemory and Headroom operating docs;
- factory and COV packets.

This must be additive and reversible. No source repo is deleted or archived during cutover.

## Source Repos

| Source | Target | Class | Import rule |
|---|---|---|---|
| `lessonos` | `packages/engine` | engine | **DONE** (c4327c31, storia preservata); gate `uv run pytest` |
| `ardesia-studio` / `maestro-studio` | `packages/studio` | lavagna + ToolHost | vive oggi come `apps/studio`; move = Phase 3+ |
| `ardesia-tools` / `maestro-tools` | `packages/tools` | factory | preserve carefully; local copy is dirty |
| `ardesia-vault` | `docs/vault` | SoT/knowledge | preserve docs, dedupe indexes |
| `ardesia-wiki` | `docs/wiki` | human docs | import after dedupe |
| `ardesia-lavagna` | `packages/lavagna-demo` or harvest into `packages/studio` | demo/prototype | do not merge wholesale until verified |
| `ardesia-simulator` | `packages/simulation-plugin` candidate | prototype | inspect first |
| `whiteboard-studio-sim` | reference/prototype | prototype | inspect only for unique pieces |
| `elab-tutor` | `packs/elab` plus `packages/simulation-plugin` extracts | separate product/lineage | never import whole app shell (oggi lo è ancora — split pending) |
| `elab-volumi` | `packs/elab/content` later | content | check rights/licensing |

## Target Shape

```text
ardesia/
  AGENTS.md
  README.md
  package.json / nx.json or equivalent
  packages/
    engine/
    studio/
    tools/
    api/
    simulation-plugin/
  packs/
    elab/
    electrotechnics-solver/
    examforge/
  docs/
    canon/
    ops/
    product/
    vault/
    wiki/
  apps/
    web-demo/        # optional if not inside packages/studio
```

## Import Method

Preferred:

- `git subtree add --prefix=<target> <source> <branch>` when history size is acceptable.
- `git filter-repo` only for large/dirty histories requiring pruning.

Rules:

- Import docs first.
- Import code only after target package gates are defined.
- Keep source repos read-only during import.
- Do not repoint the live Mini factory until the monorepo builds and package gates pass.

## Order

### Phase 0 - Documentation and maps — in progress
### Phase 1 - Demo surface (`ardesia-lavagna` preview; no prod promotion without Andrea)
### Phase 2 - Core package contracts

Define shared contracts before moving large code:
`ArdesiaPluginManifest.kind` · `LessonMode` · `ManualSource` · `ManualRef` · `BoardCitation` · `CircuitScene`/`ElabScene` · `StudentPack` · `PackManifest` · `WorkflowManifest`.

### Phase 3 - Engine and Studio import — engine DONE; studio move pending
### Phase 4 - ToolHost and Simulation Plugin (mount via host, `renderEmbeddable()`, lint-gate anti-riappari)
### Phase 5 - Packs (`packs/elab`, `packs/electrotechnics-solver`, `packs/examforge` — packs are not full apps)

## Gate Strategy

Each package keeps its native gate (comandi esatti nella gate map sopra). Do not weaken existing gates. Do not touch gate files without a dedicated PR.

## Cutover Strategy

No live factory repoint until:

1. monorepo docs PR merged;
2. package imports compile/test locally;
3. demo preview works;
4. package gates pass;
5. rollback branch/tag exists;
6. Andrea approves repoint.

Cutover one lane at a time: docs only → studio only → engine only → tools/factory last.

## Rollback

- Source repos remain intact.
- No production deploy.
- No source repo archival.
- Repoint can be reversed by restoring factory cwd/path vars.
- Git tags before each phase.

## COV (2026-07-16 update)

- Preflight firsthand: origin/main `a237295c`; PR #44-#47 open MERGEABLE; prod 200/200; cert worktree `/private/tmp/ardesia-audit-cert-5w6CYl` @ `46c5ce85` esistente (`git worktree list`).
- Gate studio verificati indirettamente (verdi su a237295c da sessione 15jul, 723/5 ×3); NON rieseguiti in questa sessione docs-only.
- Gate engine/elab-tutor NON eseguiti in questa sessione (dichiarato sopra).
- No import performed. No merge performed. No deploy performed.
- Biggest risk: dirty `maestro-tools`; handle in separate preservation pass.
