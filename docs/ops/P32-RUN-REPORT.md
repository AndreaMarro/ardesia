# P32 — Run Report

## Iter 4 — Phase 5 slice 1: il CAVO entra nella palette (connection reale, D6)

**Branch / SHA:** `p30/free-manipulation-trace-v0-20260709-185100` @ `884f6b38` → +1 commit.
**Single-writer:** PASS. **CI su `884f6b38`:** 4/4 green (commit prodotto iter 3 validato).

### Pre-work (U1 risolto, correzione all'audit)
`@elab-tutor-plugin` è IN-REPO (`plugins/elab-tutor/src`, alias `vite.config.ts:16`) —
l'audit iter 2 lo diceva out-of-repo: SBAGLIATO. Gesti reali del canvas plugin:
wire pin-pin (`SimulatorCanvas.jsx:1155`), waypoint-drag (`:1387`, NIENTE
endpoint-retarget), palette `pendingPlacement`→`onComponentAdd` (`:1065-1123`)
NON cablato dall'host (solo 4 callback, `ToolCanvasEmbeddable.tsx:1217-1282`).

### Slice (D6)
Cavo = terza voce viva della palette tap-tap; produce una **connection**
(`{from,to,kind:"wire",color:"green"}`), NON un component. Fisica reale gratis:
`buildNets` unisce già pinAssignments ∪ connections; digest già copre `W:`;
`BoardWires` disegna già le connections; envelope `connect-wire` già nel
vocabolario. battery9v RINVIATA (rompe l'assunzione single-loop del solver = design).

### What changed
- `ToolCanvasEmbeddable.tsx`: union `+"wire"`; `createBoardSceneWithPlacements`
  → connections; ops builder → `connect-wire`; id `cavo-libero-N`; palette Cavo
  interattiva; `PlacedPartsSvg` skip (il cavo lo disegna BoardWires).
- `simulationStepMode.ts`: cavo → `wires` del circuito valutabile (mai pinAssignments).
- Test: +6 in `ToolCanvasMontaggioLibero.test.tsx`, incl. **fisica**: circuito serie
  sintetico con gap → `solveSeriesLoop.closed` false→true col solo cavo piazzato;
  `resolveNet` unificata; occupato→notice; reset azzera.

### Gates
tsc 0 · build 0 · targeted 16/16 · **full vitest 1587/5skip/0** (+6) · **e2e
p30+montaggio `--repeat-each=3` 6/6** · secret 0. → [P32-GATES.md](P32-GATES.md)

### Honest caveats
- Cavo solo tra fori LIBERI (regola occupazione v1 uniforme): il jumper verso
  foro occupato — uso canonico Tinkercad — è il follow-up (a) in NEXT.
- Nessun drag: gesto = tap-tap (scelta LIM/iPad di #93). Niente e2e nuovo per il
  cavo (montaggio-canvas copre il meccanismo palette; candidato follow-up).
- **NON è Tinkercad parity**: mancano jumper-su-occupato, retarget, undo/redo,
  battery/strumenti/netlist-export (NEXT a-f).

### Should continue? **Yes.**

---

## Iter 3 — R10: `.lesson` import ripristina la memoria didattica (meccanismo)

**Branch / SHA:** `p30/free-manipulation-trace-v0-20260709-185100` @ `5be02e38` → +1 commit.
**Single-writer:** PASS. **CI on `5be02e38`:** 4/4 green. **Security:** diff scan 0 hit.

### Slice
Chiudere R10 (audit §3): lo snapshot LessonOS viaggiava nel bundle ma l'import non
lo ripristinava mai (`lessonBundle.ts:52-56` "fase successiva"). TDD: RED 6/7 → GREEN.

### What changed (surgical)
- `store/lessonBundle.ts`: `importLesson(store, blob, lessonOsLog?)` →
  `ImportLessonResult` con union esplicita `restored | no-snapshot | not-attempted |
  unsupported | skipped-non-empty | failed` (D5). Restore DOPO le scritture, mai
  bloccante, empty-log-only (contratto `importSnapshot`), capability rilevata a
  runtime (type guard; interfaccia `EventLogStore` invariata).
- `store/WorkspaceStore.ts`: param opzionale + pass-through result su
  `importLessonBlob`/`importLessonBlobForRoom` (additive).
- `Room.tsx`: passa `lessonOsRef.current?.store` all'import (simmetrico all'export);
  `failed` → `setStorageError` (telemetria mai silenziosa §4.4).
- Test: +7 in `LessonBundle.test.ts` (tutti gli stati + bundle malevolo non tocca il
  log); 3 assertion pre-esistenti aggiornate al nuovo contratto (`resolves.toEqual`).

### Gates
tsc 0 · build 0 · targeted 50/50 · **full vitest 1581/5skip/0fail** (+7) · RED-first
verificato · secret scan 0. Dettaglio in [P32-GATES.md](P32-GATES.md).

### Honest caveats
- Nella Room live il log ha già `lesson.started` dal mount ⇒ l'import di default
  esita `skipped-non-empty`: il RESTORE REALE user-facing richiede il flusso
  recovery (destroy con conferma → log vuoto → restore) = slice successiva.
- Il fake di test (`RestorableFakeLog`) replica il contratto documentato; la
  semantica reale di `importSnapshot` è coperta da IndexedDbEventLog.test.ts.
  Integrazione reale IndexedDbEventLog+importLesson = candidata con fake-indexeddb.
- Nessun e2e nuovo (import via file picker non ha e2e esistente).

### Should continue? **Yes.**

---

## Iter 2 — Phase 0 verify + Phase 1 state audit

**Branch / SHA:** `p30/free-manipulation-trace-v0-20260709-185100` @ `69f928c8` → +1 doc commit.
**Single-writer:** re-gate PASS (clean tree, HEAD==anchor, no lock).
**Security:** no code changes; doc-only diff secret-scanned pre-commit.

### What happened
1. **CI on `69f928c8`: 4/4 PASS** (engine · hygiene · no-deploy · studio). PR #150 did
   not regress → **Phase 0 formally CLOSED** (recorded in P32-GATES.md).
2. **Phase 1 audit executed** via 5 parallel read-only Explore agents (toolhost,
   simulator, LessonOS+storage, ElabTutor, engine+deploy) → synthesized into
   [P32-STATE-AUDIT.md](P32-STATE-AUDIT.md). No product code touched.

### Headline findings (detail in the audit)
- Signed-manifest/capability system is real and fail-closed, **but the live board
  bypasses it** (direct React import) — R8, Phase 2 target.
- Two diverging sim scene models (V1 live / V2 workbench) — R9; undo/redo absent — R11.
- `.lesson` export includes the LessonOS event snapshot but **import never restores
  it** — R10, cheapest high-value next slice.
- Product host verified **ZERO-LLM**; tutor chat exists only in legacy plugin,
  proxied via Supabase Edge (no client keys).
- Python engine completely disconnected from studio; zero deploy config for studio;
  CI has no Playwright (confirmed again).

### Honest caveats
- Audit is static (agents read code; nothing executed beyond Phase-0 gates).
- file:line refs are agent reads; loop lead spot-checked only convergent claims
  (e.g. both toolhost and elabtutor agents independently confirmed the direct-mount bypass).

### Should continue? **Yes** — next slice per [P32-NEXT.md](P32-NEXT.md): R10 `.lesson`
import restore (narrow, testable), unless Andrea redirects.

---

## Iter 1 — Phase 0: P31 lockdown, close the pointer-reachability caveat

**Branch / SHA:** `p30/free-manipulation-trace-v0-20260709-185100` @ `6082555b` → +1 commit this iter.
**Single-writer:** clean (0 dirty, no index.lock, HEAD == anchor).
**Security:** diff secret scan 0 hits; CI hygiene secret_scan green.

### Goal
Make PR #150's one documented honesty caveat — real-pointer *reachability* of the
free-mode strip `[data-sim-break]` — either closed by a real test or an honest RED.
(P31 proved the *logic* via `dispatchEvent`; reachability was the open follow-up.)

### What changed
- `apps/studio/e2e/p30-free-manipulation.spec.ts` only:
  - `activateEmbed(page, anchor)` — raw-mouse `dblclick` to activate the Excalidraw
    embed (the single gesture Excalidraw requires; same model as montaggio-canvas).
  - `assertPointerReachable(target)` — after activation, `document.elementFromPoint`
    at the control's center must return the control (or a descendant): proves
    visible + enabled + **topmost** (not overlay/canvas-covered). No click/hover → deterministic.
  - Wired both before the existing break step; `dispatchEvent` retained for the
    **logic** click, labeled as such. Header honesty comment updated.
- No product/shared code touched.

### What was verified
See [P32-GATES.md](P32-GATES.md). Headlines: typecheck 0; p30 e2e ×3 = 3/3, ×5 = 5/5;
regression 2/2 (+1 pre-existing skip); PR #150 CI 4/4.

### Pass/fail table
| Check | Result |
|---|---|
| reachability probe (with activation) | pass |
| p30 trace ×3 / ×5 | 3/3 · 5/5 |
| regression (montaggio + first-led) | 2/2 (+1 skip pre-existing) |
| typecheck | 0 |
| console errors in test | none |

### Honest caveats
- The reachability test proves the break control is **topmost after standard
  activation**. It does not drive a full real-pointer *click-through* to the
  handler (logic still uses `dispatchEvent`) — intentional, to avoid the known
  Excalidraw pointer-routing flake; labeled in the spec header.
- `build` and full `vitest` were not run this iter (e2e-spec-only diff; CI covers them).
- **No Tinkercad parity claimed.** Still trace v0; wide palette / free wire
  connect-retarget / undo-redo / instruments / export remain absent.

### Remaining non-parity areas
Simulator (wide palette, wire first-class, retarget, undo/redo, netlist, DC across
arbitrary topologies), ElabTutor↔graph, LessonOS backend, GoodNotes lavagna, deploy.

### Next smallest slice
See [P32-NEXT.md](P32-NEXT.md). Candidate: un-Draft decision for #150 (Andrea) →
then Phase 1 state audit (read-only) → Phase 5 palette slice 1 (battery9v/wire first-class).

### Should continue? **Yes** — Phase 0 closed green; next is the read-only Phase 1 audit (no code risk).
