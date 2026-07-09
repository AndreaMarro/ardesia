# P32 — Decisions

## D1 — Reachability via activation + `elementFromPoint`, not a real click-through
**Decision:** close the P31 reachability caveat with a raw-mouse **activation**
(`dblclick`) + a topmost **hit-test** (`elementFromPoint`), keeping the logic click
as `dispatchEvent`.
**Why:** Excalidraw embeddables are inert until activated (verified:
`montaggio-canvas.spec.ts:55-57`), and the real-pointer *routing* to embedded
controls is the known flake source P31 fought. A hit-test proves reachability
(visible + enabled + topmost) deterministically — it fails if a regression overlays
the strip — without reintroducing the flaky click. This is exactly what P31-NEXT
follow-up #1 asked for ("raw-mouse activation + reachability assertion").
**Status:** implemented, GREEN (×5). Caveat closed.

## D2 — Defer a minimal Playwright smoke in CI (do NOT add it in this slice)
**Decision:** keep Playwright e2e out of CI for now; do not bundle a CI browser job
into the reachability slice.
**Why:** CI `studio` job (typecheck+vitest+build) already ~3.5 min; adding Playwright
needs browser install/caching, a headless vite server, and a flake budget — a
separate infra slice that deserves its own small ADR. The e2e reliability is
provable locally (`--repeat-each`) today; the reachability regression is now caught
by the spec. One narrow slice per iteration.
**Status:** recorded as a NEXT candidate (see [P32-NEXT.md](P32-NEXT.md)). Not done.

## D3 — Un-Draft / merge of PR #150 is Andrea's call
**Decision:** do not un-Draft or merge #150 autonomously.
**Why:** AGENTS.md governance — never auto-merge to main. #150 is now unambiguously
green (CI 4/4 + local e2e ×5 + reachability closed); the decision to un-Draft/merge
belongs to Andrea.
**Status:** open (human gate).

## D6 — Phase 5 slice 1: il CAVO entra nella palette come CONNECTION su modello V1 (Iter 4)
**Decision:** la prima estensione della palette live è il **cavo (wire)** come
`MontaggioPlacementType`, che produce una **connection** (`{from,to,kind:"wire"}`)
in `boardScene.connections` — NON un component. Il modello resta **V1** (live
embed); V2 (`simulation-scene/2`) non si tocca.
**Why (evidence-backed, tutte parti esistenti):**
- `buildNets` unisce già pinAssignments ∪ connections (`simulationBreadboard.ts:216-238`) → la fisica del cavo è REALE a solver invariato;
- il digest topologico copre già le connections (sezione `W:`, `simulationSceneDigest.ts:33-36`) → save/reopen invariante gratis;
- `BoardWires` disegna già `scene.connections` con fallback bezier (`ToolCanvasEmbeddable.tsx:1854+`) e riceve `boardScene` → rendering gratis;
- il vocabolario operazioni ha già `connect-wire` (`simulationOperations.ts:70-75`) → envelope senza nuovi kind;
- il gesto è il tap-tap ESISTENTE (`handleHoleTap`), affidabile su LIM/iPad (stessa scelta di #93).
**Perché NON battery9v ora:** una seconda sorgente rompe l'assunzione single-loop
di `solveSeriesLoop` (`simulationBreadboard.ts:248`) → richiede decisione solver
(multi-sorgente/MNA generale) = slice separata con design, non additiva.
**Perché NON il canvas plugin (`SimulatorCanvas.jsx`) per questo slice:** ha palette
e wire-mode propri (`pendingPlacement`/`onComponentAdd` :1065-1123, wire pin-pin
:1155) ma l'host NON cabla `onComponentAdd` (solo i 4 callback wire/layout,
`ToolCanvasEmbeddable.tsx:1217-1282`); cablarlo = superficie molto più ampia
(descriptor arbitrari, validazione, id-collision) = slice successiva.
**Limite onesto (v1):** gli estremi del cavo occupano i fori come ogni placement
(`occupiedHoles` :887-894) — il jumper VERSO un foro occupato (uso canonico
Tinkercad) è un follow-up esplicito; il cavo tra fori liberi estende comunque
le net reali (tie↔tie). Step-mode ignora i cavi (predicati del libro invariati).
**Status:** implemented (Iter 4).

## D7 — Rimozione singolo placement: strumento GOMMA in palette (Iter 6)
**Decision:** rimozione di UN placement (resistor/led/cavo) tramite strumento
esplicito **Gomma** nella palette (sostituisce il glifo inerte "Altro", che non
era referenziato da nessun test/e2e): selezioni la Gomma, tocchi un foro di un
placement → rimosso. Il manuale è strutturalmente intoccabile (i componenti del
libro non sono placements). Tap su foro senza placement → notice, mai silenzio.
**Perché Gomma e non "Seleziona-per-cancellare":** (1) "Seleziona" a tool nullo
oggi è un no-op sui fori, con test che lo blinda — riusarlo per DELETE cambierebbe
la semantica di selezione (che in futuro serve per ispezione); (2) la gomma è la
metafora familiare LIM/GoodNotes; (3) additivo puro: un tipo `MontaggioTool =
MontaggioPlacementType | "eraser"`, un branch in `handleHoleTap`.
**Event-vs-state (onestà sul modello):** le operations del montaggio sono una
PROIEZIONE dello stato corrente (`createMontaggioPlacementOperations` ricostruisce
la lista dai placements attuali) — la rimozione NON emette un envelope `delete`:
lo stato post-rimozione È la nuova lista. Il kind `delete` del vocabolario resta
per il futuro modello event-sourced (undo/redo, NEXT e).
**Invariante di occupazione:** al più UN placement per foro (regola uniforme
un-foro-un-reoforo) → la Gomma non è mai ambigua.
**Status:** implemented (Iter 6).

## D6-bis — RIGETTATO "cavo verso foro occupato"; le affordance Tinkercad-equivalenti esistono già (Iter 5)
**Decision:** NON implementare il jumper verso un foro occupato. La regola di
occupazione resta uniforme (un foro = un reoforo) anche per il cavo.
**Why (fisica, non preferenza):** su una breadboard REALE due reofori non entrano
nello stesso foro. Il "wire al terminale" di Tinkercad equivale, nel nostro
modello a fori/tie, a **(1)** un foro LIBERO della stessa tie-strip (colonna a 5
fori: la continuità della tie unifica la net col pin) e **(2)** un foro LIBERO
della rail (la rail è un'unica net su 30 colonne). Entrambe le affordance sono
GIÀ operative — verificato con test falsificabili, passati al primo run:
- pin-access via tie: la net di `bb1:f10` (catodo occupato) si unifica toccando
  solo `bb1:g10` libero (stessa tie) — `resolveNet` test;
- rail-jumper: circuito instradato attraverso `bus-top-plus` si chiude col solo
  cavo `g1→bus-top-plus-3` (r1 su `bus-top-plus-7`) — `solveSeriesLoop` test;
- UI: i fori rail sono tappabili (`points.map` include i rail ref,
  `ToolCanvasEmbeddable.tsx:1815-1830`) — test aria/pending.
**Lesson:** il prompt di loop proponeva la slice (a) come "uso canonico
Tinkercad" — il modello fisico la smentisce; prima verificare, poi costruire.
**Status:** chiuso con test-only commit (3 invarianti in ToolCanvasMontaggioLibero).

## D5 — `.lesson` restore semantics: explicit status union, empty-log-only, never blocking (Iter 3, R10)
**Decision:** `importLesson(store, blob, lessonOsLog?)` returns
`ImportLessonResult.lessonOsRestore` with a closed status union:
`restored | no-snapshot | not-attempted | unsupported | skipped-non-empty | failed`.
Restore runs AFTER file writes, is secondary (a failed restore never breaks the
board import), honors `importSnapshot`'s empty-log-only contract (never merge —
seq collide = corruption), and never throws (every outcome, including failure,
is an explicit status; Room surfaces `failed` to the teacher via storage error).
The `EventLogStore` interface stays minimal (append+readAll); restore is an
optional capability detected at runtime (`supportsSnapshotRestore` type guard) —
the InMemory fallback reports `unsupported` instead of being forced to implement it.
**Why:** "no silent swallow" (loop brief) + spec #35 §4.4 telemetry-never-silent +
`importSnapshot`'s designed disaster-recovery semantics (indexedDbEventLog.ts:183-188).
**Honest limit:** in the live Room the log already holds `lesson.started` from
mount ⇒ default import yields `skipped-non-empty`. The real recovery flow
(user-confirmed `destroyEventLogStorage` → empty log → restore) is a follow-up
UX slice; the mechanism + statuses + tests land now.
**Status:** implemented (Iter 3).

## D4 — Write only the `tutor-ux` worktree
**Decision:** confine all writes to `~/ardesia-wt/tutor-ux`.
**Why:** 28 worktrees share one `.git`; `VOLUME 3/ardesia` is dirty on a codex
branch. Single-writer safety + memory gotcha (checkout dirty → only worktrees).
**Status:** enforced.
