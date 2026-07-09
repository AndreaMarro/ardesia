# CLAUDE CONSOLIDATION PLAN + ADR — "unire le parti e farle funzionare" — 2026-07-08

> Long-run di consolidamento (Andrea). Obiettivo: la **finestra plugin** inserisce TUTTI i tipi
> (simulatore, elab-tutor, plugin essenziali: citazione/checklist/mappa-concetti, disegnatore HD,
> funzioni, web, user-created) + **LessonOS COLLEGATO** + unire le parti e farle funzionare davvero.
> Questo doc è nel lane Claude (nuovo file, nessuna collisione Codex).

## 1. Stato VERIFICATO firsthand (non fidarsi, misurato)
Worktree `tutor-ux` @ branch `docs/simulation-plugin-v2-contract-20260707` (Codex, MOLTO dirty, uncommitted).
- **P+21 DONE & green**: `BoardPluginPostitPersistence`+`Room.integration`+`BrowserHostedMultiPostit` = 58 test pass.
  `createPluginPostitBoardScene` emette full Excalidraw embeddable + link element-id. (checkpoint doc §P+21).
- **Claude product lane M1–M7 DONE & green** (71 test): `EssentialPlugins`(3 plugin: manual-evidence=citazione,
  lesson-checklist, concept-map), `MarketplaceItem`, `SubPostitObject`, `PluginPostitObject`,
  **`TeacherDashboardProjection`** (campo `plugins` = registry Z6 con readiness/lastUsedAt + `contentCreated`
  → QUESTO è il ponte plugin→LessonOS a livello projection).
- **M7 UX spec** scritto: `docs/product/ARDESIA-PLUGIN-ON-PAPER-UX-SPEC.md` (first-screen board, stati post-it,
  proximity, function-surface, sub-post-it, Pagina Personale, marketplace/creation flow, iPad/LIM, WCAG, Playwright).
- **`MultiPostitWorkbench.tsx`** costruito (rende N plugin-postit: sim + elab-tutor + essenziali) MA **non renderizzato
  da nessun route** (App.tsx/Room non lo montano ancora).
- Ownership autorevole: `docs/ops/OWNERSHIP-MATRIX-2026-07-15.md`. Lane Claude "MAY/MUST-AVOID": gap-audit §4/§5.

## 2. Cosa MANCA davvero (net-new, per "farle funzionare")
- **S6 — finestra plugin UI**: un picker/palette che elenca TUTTI i tipi (essential ∪ marketplace ∪
  sim-registry-as-provenance ∪ elab-tutor ∪ user-created) e li **inserisce** sulla board come post-it
  (usa `mountEssentialPluginPostit`/`createPluginPostitObject`/`multiPostitBoardPersistence` già pronti).
  Gate M7 §8 (Playwright desktop/iPad/LIM/narrow). NON ancora esistente (MultiPostitWorkbench è la board, non il picker).
- **Wiring nel runtime**: montare finestra+workbench in un route reale → tocca `App.tsx`/`Room.tsx` (Shell/UX,
  **oggi Codex-dirty** → collisione).
- **LessonOS end-to-end**: la projection legge un `pluginRegistry`/`lastUsedAt`; serve verificare/चिudere che
  l'uso plugin EMETTA un evento nel log (seam bus→log `bindBusToEventLog`) così `lastUsedAt` derivi da fatti reali.
- **Tipi plugin mancanti nel catalogo essenziale**: "disegnatore HD" e "web" non sono in `essentialPlugins.ts` (M3 ne ha 3).
- **Nav launcher (lavoro Claude precedente)** vive in worktree SEPARATO `ardesia-wt-lessonos-shell`
  (branch off origin/main 54332d28): `LauncherMenu` (Plugin ▾ | Lezioni ▾). Da unire alla finestra plugin.

## 3. BLOCCANTE STRUTTURALE (decisione di Andrea — non risolvibile dal codice)
Le due parti da "unire" sono su **worktree/branch divergenti ed entrambi UNCOMMITTED**:
- `tutor-ux`: foundation plugin+sim (Codex branch, ~25 file mod + decine untracked, disk 100%/3.1Gi liberi).
- `ardesia-wt-lessonos-shell`: nav launcher (branch pulito off origin/main).
Non si possono fondere due alberi grandi, divergenti e **non committati** senza perdere lavoro o clobberare Codex.
**Serve decidere**: (a) committare il lavoro Codex di `tutor-ux` (chi/quando), (b) scegliere una base comune
(consiglio: integration branch off origin/main), (c) ri-applicare sopra il nav launcher (piccolo, additivo Shell/UX).
Finché entrambi restano uncommitted+divergenti, "unire" resta bloccato.

## 4. ADR — approccio integrazione (raccomandato)
- **ADR-C1: costruire la finestra plugin come componente Claude-lane ISOLATO** (`src/design/PluginWindow.tsx` +
  test) con callback `onInsert(plugin) → PluginPostitObject`, guidato dai cataloghi reali (essential ∪ marketplace).
  Zero edit a file Codex-dirty (solo file NUOVI). Wiring in Room/App = slice separata coordinata.
  Motivo: massimo valore, zero collisione, testabile jsdom subito.
- **ADR-C2: LessonOS collegato via projection (già) + emit su uso** — nessun secondo store; l'insert/uso plugin
  emette sul bus → `bindBusToEventLog` → event-log; la projection deriva `plugins.lastUsedAt`. Evidence `plugin:<id>@<v>`.
- **ADR-C3: unificazione worktree via integration branch off origin/main** dopo commit Codex; nav launcher ri-applicato
  come diff additivo Shell/UX (ViewNav/index.css/pluginLauncherCatalog). NON fondere alberi uncommitted.

## 5. Slice sequenziate (≤5 file, TDD, no dep nuove, no import simulatore, no edit Codex-dirty)
- **CS1 (prossimo loop, SAFE)**: `PluginWindow.tsx` picker isolato + `PluginWindow.test.tsx`. Elenca essential ∪
  marketplace, readiness/stati (M7 §2/§5), a11y menu, `onInsert`. Nessun edit Room/App. Verifica jsdom.
- **CS2**: aggiungere plugin essenziali mancanti (disegnatore-hd, web) in `essentialPlugins.ts` (M3 additivo) + test.
- **CS3**: `pluginRegistryFromCatalog()` puro (catalog→projection input) + test → chiude LessonOS end-to-end lato dati.
- **CS4 (gated, coord. Codex)**: wiring finestra+workbench in un route; richiede Room/App non-dirty o merge Codex.
- **CS5 (gated, decisione §3)**: unione worktree + nav launcher; Playwright M7 §8 desktop/iPad/LIM/narrow.

## 6. Rischi
- Disk 100% (3.1Gi) → build/test pesanti rischiosi; preferire test focused.
- `tutor-ux` uncommitted enorme → NON `git add -A`, NON reset/clean, NON editare file Codex-dirty.
- Doppio worktree divergente → vedi §3, blocco fino a decisione.

## 7. CS1 Codex Checkpoint — Plugin Window Isolata (2026-07-08)

Status: **done, green**.

Analisi usata da Claude:
- P+21 e la lane M1-M7 risultano gia' presenti; il prossimo avanzamento non
  era rifare P+21, ma costruire la finestra plugin isolata.
- Correzione al piano: CS1 non elenca solo essential/marketplace; supporta gia'
  tutte le famiglie richieste da Andrea: simulatore, ELABTutor, essenziali,
  funzioni, disegno HD, web, marketplace e user-created.
- Nessun wiring in `Room.tsx`/`App.tsx`: quei file restano Codex-dirty e vanno
  integrati in uno slice coordinato.

File aggiunti:
- `apps/studio/src/design/pluginWindowCatalog.ts`
- `apps/studio/src/design/PluginWindow.tsx`
- `apps/studio/src/__tests__/PluginWindow.test.tsx`

Comportamento consegnato:
- `buildDefaultPluginWindowCatalog()` compone builtin + `ESSENTIAL_PLUGINS` +
  marketplace plugin + user-created.
- Ogni item porta `lessonOs.eventType = plugin.insert.requested` e
  `evidenceRef = plugin:<id>@<version>`.
- `createPluginWindowInsertRequest()` produce un payload pronto per il journal
  LessonOS: `type`, `pluginId`, `pluginKind`, `evidenceRefs`, `label`.
- `PluginWindow` rende filtri per tipo, ricerca globale sul catalogo e
  callback `onInsert(request)` senza importare simulator internals.

Gate eseguiti:
- RED iniziale: `PluginWindow` mancante, test fallito come atteso.
- Focused CS1:
  `npm --prefix apps/studio run test -- src/__tests__/PluginWindow.test.tsx ...`
  → 1 file / 4 test pass.
- Plugin/foundation pack:
  `npm --prefix apps/studio run test -- src/__tests__/PluginWindow.test.tsx src/__tests__/EssentialPlugins.test.ts src/__tests__/MarketplaceItem.test.ts src/__tests__/PluginPostitObject.test.ts src/__tests__/TeacherDashboardProjection.test.ts ...`
  → 5 file / 64 test pass.
- `npm --prefix apps/studio run typecheck` → pass.
- `cd apps/studio && npm exec eslint -- src/design/PluginWindow.tsx src/design/pluginWindowCatalog.ts src/__tests__/PluginWindow.test.tsx`
  → pass.
- `git diff --check` → pass.

Next prompt CS2:

```text
CONTINUA IL CONSOLIDAMENTO PLUGIN WINDOW / LESSONOS.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Leggi:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md sezione "CS1 Codex Checkpoint"
- apps/studio/src/design/pluginWindowCatalog.ts
- apps/studio/src/design/PluginWindow.tsx
- apps/studio/src/__tests__/PluginWindow.test.tsx

Esegui solo CS2:
- trasformare "disegno HD" e "web" da builtin preview a plugin essenziali reali
  in `apps/studio/src/toolhost/essentialPlugins.ts`, con fixture dichiarata,
  manifest valido, capability least-privilege, e test.
- non importare simulator internals;
- non toccare `Room.tsx`, `App.tsx`, `ToolCanvasEmbeddable.tsx` o file sim/**;
- massimo 5 file;
- no nuove dipendenze;
- no staging/commit/push.

Gate:
- test focused su EssentialPlugins + PluginWindow;
- typecheck;
- eslint sui file toccati;
- git diff --check.
```

## 8. CS2 Codex Checkpoint — Disegno HD/Web Come Plugin Essenziali (2026-07-08)

Status: **done, green**.

Scope:
- Eseguito solo CS2 dopo recovery del goal long-run e del checkpoint CS1.
- Nessun wiring in `Room.tsx`, `App.tsx`, `ToolCanvasEmbeddable.tsx` o `sim/**`.
- Nessun push, merge, deploy, staging, reset, clean, `git add -A` o nuova
  dipendenza.

File cambiati:
- `apps/studio/src/toolhost/essentialPlugins.ts`
- `apps/studio/src/__tests__/EssentialPlugins.test.ts`
- `apps/studio/src/design/pluginWindowCatalog.ts`
- `apps/studio/src/__tests__/PluginWindow.test.tsx`
- `docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md`

Comportamento consegnato:
- `com.ardesia.drawing-hd` ora e' un plugin essenziale reale:
  manifest validato, `board.write` limitato a `own-embeds`, privacy `none`,
  fixture state dichiarato, famiglia `drawing-hd`.
- `com.ardesia.web-view` ora e' un plugin essenziale reale:
  manifest validato, `net.fetch` limitato a `example.edu`, privacy
  `declared-domains`, nessuna `board.write`, fixture state dichiarato,
  famiglia `web`.
- La finestra plugin deriva disegno HD e web da `ESSENTIAL_PLUGINS`, non piu'
  da builtin preview duplicati.
- Il catalogo finestra conserva le famiglie richieste da Andrea e mantiene ids
  univoci.

TDD:
- RED su `EssentialPlugins.test.ts` e `PluginWindow.test.tsx`:
  falliti 4 test attesi per assenza di HD/web essenziali e source `builtin`.
- GREEN dopo implementazione: focused CS2 2 file / 33 test pass.

Gate eseguiti:
- `npm --prefix apps/studio run test -- src/__tests__/EssentialPlugins.test.ts src/__tests__/PluginWindow.test.tsx ...`
  → 2 file / 33 test pass.
- `npm --prefix apps/studio run test -- src/__tests__/EssentialPlugins.test.ts src/__tests__/PluginWindow.test.tsx src/__tests__/MarketplaceItem.test.ts src/__tests__/PluginPostitObject.test.ts src/__tests__/TeacherDashboardProjection.test.ts ...`
  → 5 file / 74 test pass.
- `npm --prefix apps/studio run typecheck` → pass.
- `cd apps/studio && npm exec eslint -- src/toolhost/essentialPlugins.ts src/__tests__/EssentialPlugins.test.ts src/design/pluginWindowCatalog.ts src/__tests__/PluginWindow.test.tsx src/design/PluginWindow.tsx`
  → pass.
- `git diff --check` → pass.
- `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  → no output; vendored solver drift zero.

Next prompt CS3:

```text
CONTINUA IL CONSOLIDAMENTO PLUGIN WINDOW / LESSONOS.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Leggi:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md sezione "CS2 Codex Checkpoint"
- apps/studio/src/design/pluginWindowCatalog.ts
- apps/studio/src/toolhost/essentialPlugins.ts
- apps/studio/src/lessonos/teacherDashboardProjection.ts
- apps/studio/src/__tests__/TeacherDashboardProjection.test.ts

Esegui solo CS3:
- creare una funzione pura `pluginRegistryFromCatalog()` o equivalente che
  trasformi il catalogo plugin/finestra in input per la projection LessonOS
  senza usare UI state come fonte di verita';
- coprire simulation, ELABTutor, essential, drawing-hd, web, marketplace e
  user-created;
- preservare `plugin:<id>@<version>` come evidence/provenance;
- non toccare `Room.tsx`, `App.tsx`, `ToolCanvasEmbeddable.tsx` o `sim/**`;
- massimo 5 file;
- no nuove dipendenze;
- no staging/commit/push.

Gate:
- test focused su nuovo registry helper + TeacherDashboardProjection +
  PluginWindow;
- typecheck;
- eslint sui file toccati;
- git diff --check;
- solver drift check.
```

## 9. CS3 Codex Checkpoint — Catalogo Plugin Verso LessonOS Z6 (2026-07-08)

Status: **done, green**.

Scope:
- Eseguito solo CS3 dopo recovery del goal long-run e del checkpoint CS2.
- Nessun wiring in `Room.tsx`, `App.tsx`, `ToolCanvasEmbeddable.tsx` o `sim/**`.
- Nessuna modifica a `teacherDashboardProjection.ts`: il projector resta puro e
  riceve solo `PluginRegistryEntry[]` plain.
- Nessun push, merge, deploy, staging, reset, clean, `git add -A` o nuova
  dipendenza.

File cambiati:
- `apps/studio/src/design/pluginWindowCatalog.ts`
- `apps/studio/src/__tests__/PluginWindow.test.tsx`
- `docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md`

Comportamento consegnato:
- `pluginRegistryFromCatalog(catalog)` produce righe compatibili con
  `PluginRegistryEntry` per la projection LessonOS.
- Copertura famiglie: simulation, ELABTutor, essential, drawing-hd, web,
  marketplace, user-created.
- Ogni riga conserva provenance/evidence come `plugin:<id>@<version>` in
  `evidenceRef`, oltre a `pluginKind` e `source`.
- Mapping `kind`: ELABTutor -> `pack`; tutti gli altri plugin della finestra ->
  `tool`.
- Duplicati di `pluginId` nel catalogo falliscono esplicitamente.

TDD:
- RED iniziale: 2 test falliti perché `pluginRegistryFromCatalog` non esisteva.
- GREEN focused CS3: 2 file / 26 test pass.

Gate eseguiti:
- `npm --prefix apps/studio run test -- src/__tests__/PluginWindow.test.tsx src/__tests__/TeacherDashboardProjection.test.ts ...`
  → 2 file / 26 test pass.
- `npm --prefix apps/studio run test -- src/__tests__/PluginWindow.test.tsx src/__tests__/TeacherDashboardProjection.test.ts src/__tests__/EssentialPlugins.test.ts src/__tests__/MarketplaceItem.test.ts src/__tests__/PluginPostitObject.test.ts ...`
  → 5 file / 76 test pass.
- `npm --prefix apps/studio run typecheck` → pass.
- `cd apps/studio && npm exec eslint -- src/design/pluginWindowCatalog.ts src/__tests__/PluginWindow.test.tsx src/lessonos/teacherDashboardProjection.ts src/__tests__/TeacherDashboardProjection.test.ts src/toolhost/essentialPlugins.ts src/__tests__/EssentialPlugins.test.ts`
  → pass.
- `git diff --check` → pass.
- `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  → no output; vendored solver drift zero.

Next prompt CS4:

```text
CONTINUA IL CONSOLIDAMENTO PLUGIN WINDOW / LESSONOS.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Leggi:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md sezione "CS3 Codex Checkpoint"
- apps/studio/src/design/pluginWindowCatalog.ts
- apps/studio/src/design/PluginWindow.tsx
- apps/studio/src/design/MultiPostitWorkbench.tsx
- apps/studio/src/design/multiPostitWorkbenchModel.ts
- apps/studio/src/toolhost/pluginPostitBoardRender.tsx

Esegui solo CS4 se e solo se puoi farlo senza clobberare lavoro sporco:
- integrare `PluginWindow` con `MultiPostitWorkbench` in un harness isolato o
  route non distruttiva, facendo sì che `onInsert` materializzi un post-it
  board object;
- se per il wiring reale serve toccare `Room.tsx`/`App.tsx`, fermati e scrivi
  un blocker operativo invece di modificare quei file sporchi;
- no import di simulator internals;
- massimo 5 file;
- no nuove dipendenze;
- no staging/commit/push.

Gate:
- test focused su PluginWindow + MultiPostitWorkbench/board persistence;
- typecheck;
- eslint sui file toccati;
- git diff --check;
- solver drift check.
```

## 10. CS4 Codex Checkpoint — Plugin Window Inserisce Post-it Board in Harness Isolato (2026-07-08)

Status: **done, green**.

Scope:
- Eseguito solo CS4 senza wiring in route reale.
- Nessuna modifica a `Room.tsx`, `App.tsx`, `ToolCanvasEmbeddable.tsx` o
  `sim/**`.
- Nessun import di simulator internals, nessuna nuova dipendenza, nessun
  push/merge/deploy/staging/commit.

File cambiati:
- `apps/studio/src/__tests__/PluginWindowWorkbench.test.tsx`
- `apps/studio/src/design/multiPostitWorkbenchModel.ts`
- `apps/studio/src/design/MultiPostitWorkbench.tsx`
- `apps/studio/src/toolhost/pluginPostitBoardRender.tsx`
- `docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md`

Comportamento consegnato:
- `createPostitFromPluginWindowInsert()` materializza un insert della finestra
  plugin come `PluginPostitObject` con `instanceId` host-side, `zIndex`,
  bounds deterministici e provenance `plugin:<id>@<version>`.
- I plugin essenziali inseriti dalla finestra conservano la fixture reale del
  catalogo (`com.ardesia.web-view` conserva `allowedDomains: ["example.edu"]`).
- I post-it catalog/plugin non-simulation/non-ELABTutor fanno round-trip in
  `createPluginPostitBoardScene()` e `restorePluginPostitsFromBoardScene()`.
- `PluginWindowMultiPostitHarness` collega `PluginWindow.onInsert` alla board
  visibile senza toccare route sporche.
- Il renderer degli embeddable board non etichetta più i plugin generici come
  `ELABTutor`.

TDD:
- RED iniziale: 2 test falliti perché mancavano
  `createPostitFromPluginWindowInsert` e `PluginWindowMultiPostitHarness`.
- GREEN CS4: 1 file / 3 test pass, poi focused pack verde.

Gate eseguiti:
- `npm --prefix apps/studio run test -- src/__tests__/PluginWindowWorkbench.test.tsx ...`
  → 1 file / 3 test pass.
- `npm --prefix apps/studio run test -- src/__tests__/PluginWindowWorkbench.test.tsx src/__tests__/PluginWindow.test.tsx src/__tests__/BoardPluginPostitPersistence.test.ts src/__tests__/BrowserHostedMultiPostit.test.tsx ...`
  → 4 file / 23 test pass.
- `npm --prefix apps/studio run typecheck` → pass.
- `cd apps/studio && npm exec eslint -- src/design/multiPostitWorkbenchModel.ts src/design/MultiPostitWorkbench.tsx src/toolhost/pluginPostitBoardRender.tsx src/__tests__/PluginWindowWorkbench.test.tsx`
  → pass.
- `git diff --check` → pass.
- `git diff --name-only -- apps/studio/sim/solver apps/studio/sim/solver/engine apps/studio/sim/solver/components`
  → no output; vendored solver drift zero.

Next prompt CS5:

```text
CONTINUA IL CONSOLIDAMENTO PLUGIN WINDOW / LESSONOS.
Worktree: /Users/andreamarro/ardesia-wt/tutor-ux

Leggi:
- AGENTS.md
- apps/studio/AGENTS.md
- docs/vault/ARDESIA-MAP.md
- docs/ops/CLAUDE-CONSOLIDATION-PLAN-20260708.md sezione "CS4 Codex Checkpoint"

Esegui solo CS5 se Andrea ha deciso la strategia di unione worktree:
- unire il nav launcher dal worktree separato `ardesia-wt-lessonos-shell`
  sopra una base comune;
- non fondere alberi uncommitted divergenti;
- se manca la decisione/branch comune, fermati e scrivi blocker operativo.

Gate:
- test focused shell/plugin launcher + PluginWindow harness;
- typecheck;
- eslint sui file toccati;
- git diff --check;
- solver drift check.
```
