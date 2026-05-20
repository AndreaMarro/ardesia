# Master SPEC ADDENDUM — Iter 93 Atoms Orphan Subsystem Finding

> **Discovered during iter 95 entrance document-sync** (2026-05-19). Material change to Master SPEC iter 95-100 atomization. Andrea ratify ricalibrazione required.

## Discovery summary

While performing cross-check Pattern V Codex BG + 4 code-reviewer subagents on iter 94+95 PRs (#117-#120) + Master SPEC, **document-sync inline analysis discovered iter 93 atoms 32-36 form a complete subsystem ALREADY merged main MA totally ORPHANED** — code exists but no UI route reaches it.

## Empirical evidence

### iter 93 atom 32 — IdeShell 3-pane C++-first IDE (PR #99 merged main)

**Files shipped main HEAD `411cfa42`**:
- `src/components/ide/IdeShell.tsx` (169 LOC)
- `src/components/ide/IdeShell.module.css` (280 LOC)
- `src/components/ide/EditorPane.tsx` (53 LOC)
- `src/components/ide/ModeSwitcher.tsx` (34 LOC)
- `src/components/ide/CompileButton.tsx` (69 LOC)
- `src/components/ide/StatusBar.tsx` (52 LOC)
- `src/pages/CompileHomeV2.jsx` (10 LOC wrapper)
- `tests/e2e/04-ide-shell-layout.spec.js` (80 LOC)
- `tests/unit/ide/IdeShell.test.jsx` (199 LOC)

**Scope**: CSS Grid 3-pane layout (left 240px palette + center flex editor + right 320px UNLIM + bottom 40px status) per Andrea iter 94 PM mandate verbatim.

### iter 93 atom 33 — CodePalette drag-drop C++ insertion (PR #109 merged main)

**Files shipped main**:
- `src/components/ide/CodePalette/CodePalette.tsx`
- `src/components/ide/CodePalette/CodePalette.module.css`
- `src/components/ide/CodePalette/DragDropHandler.ts` (drag handler CM6)
- `src/components/ide/CodePalette/paletteActions.ts` (9 azioni italiane Arduino)
- `tests/unit/ide/CodePalette.test.tsx` (11 tests)
- `tests/unit/ide/DragDropHandler.test.ts` (10 tests)

**Scope**: Andrea iter 94 PM "Drag-and-drop dentro il C++" mandate — palette 9 azioni (Accendi LED, Spegni LED, Attendi, Avvia seriale, Scrivi seriale, Leggi pulsante, Leggi sensore, Se/Altrimenti, PWM) trascinabili nel CodeMirror 6 editor con custom MIME `PALETTE_SNIPPET_MIME` + try/finally cleanup state.

### iter 93 atom 34 — unlimScreenAgent screen-aware (PR #110 merged main)

**Files shipped main** (`src/features/unlimScreenAgent/`, 1335 LOC totale):
- `screenContext.ts` (173 LOC) — state reader (route + experimentId + editorMode + cppCode + selectedText + compileStatus + boardConnected + uploadState + serialMode)
- `intentExecutor.ts` — NL→intent→execute pipeline
- `intentSchema.ts` — JSON schema for LLM tool-use
- `llmClient.ts` — UNLIM API client
- `actions/index.ts` + 11 action handlers:
  - `createBlink.ts`, `createButtonLed.ts`, `createAnalogSerial.ts`
  - `insertSnippet.ts`, `highlightBlock.ts`, `switchEditorMode.ts`
  - `compileNanoR4.ts`, `explainSelectedCode.ts`, `fixCompileError.ts`
  - `ast.ts` (C++↔Blockly XML serialization)
- `utils/xmlEscape.ts` (xss-prevention escape)
- `types.ts` (TypeScript types)
- 3 test files (516 LOC): actions.test.ts + screenContext.test.ts + xmlEscape.test.ts

**Scope**: Andrea iter 94 PM "UNLIM capace e cosciente dello schermo" + "UNLIM deve poter agire: Crea Blink seriale, Crea pulsante+LED, Crea lettura sensore, Converti C++↔blocchi, Compila Nano R4, Apri monitor seriale, Correggi errore, Spiega riga selezionata" — TUTTE LIVE come azioni in `actions/` folder.

### iter 93 atom 36 — NO-fake-upload honesty (raw commit `1f86d793` NOT merged main)

Files (would-be shipped):
- `src/store/upload.ts` — upload state store
- `src/components/upload/UploadButton.tsx`
- `src/components/upload/UploadStatus.tsx`
- Modifications: App.jsx (+58), NewElabSimulator.jsx (+24), useCircuitHandlers.js (+5)

**Status**: raw commit exists on broker_v4 era but NO branch reaches main (`git branch --contains 1f86d793` returns empty). Atom 36 deliverable for "Caricato never without flash" Andrea mandate NOT in production.

### `UnlimChatInput.tsx` entry point — ALSO ORPHAN

`src/components/unlim/UnlimChatInput.tsx` imports `executeIntent` + `requestUnlimIntent` from `unlimScreenAgent/`. Consumer count: **ZERO** other files render UnlimChatInput.

`grep -rln "UnlimChatInput" src/` returns only self-reference.

### Route reachability — `#compile-home` vs `#compile-home-v2`

`src/App.jsx:74` defines `HOMEPAGE_SUBROUTES = ['chatbot-only', 'about-easter', 'glossario', 'compile-home']`.

**Missing**: `'compile-home-v2'` NOT in subroutes. CompileHomeV2.jsx page exists wrapping IdeShell MA **unreachable production**. Andrea cannot navigate to it via URL.

`grep "compile-home-v2" src/App.jsx` returns empty → ZERO router wire for CompileHomeV2.

## Material implications

### Master SPEC iter 95-100 atomization REVISED

**Original Master SPEC** (iter 95 entrance estimate ~38-51h):

| SP | Scope | Effort | Status post-discovery |
|---|---|---|---|
| SP1 Vol3 Arduino compile wire | 4-6h | iter 95 P0 | ✅ Shipped PR #119 (still valid) |
| SP2 UI 11-states canonical | 2-3h | iter 95 P0 | ⚠️ Atom 36 covers partial — defer post atom 36 cherry-pick |
| SP3 Virtual Serial Monitor | 6-8h | iter 96 P0 | ✅ Shipped PR #120 (still valid, net-new scope) |
| SP4 UNLIM screen-aware | 6-8h | iter 97 P0 | ❌ **OBSOLETE** — atom 34 LIVE main, just orphan |
| SP5 Drag-drop snippets C++ | 6-8h | iter 98 P0 | ❌ **OBSOLETE** — atom 33 LIVE main, just orphan |
| SP6 C++↔Blockly subset roundtrip | 10-12h | iter 99 P0 | ⚠️ Atom 34 actions/ast.ts covers partial — verify scope match |
| SP7 mBlock 3-pane layout | 4-6h | iter 100 P0 | ❌ **OBSOLETE** — atom 32 LIVE main, just orphan |

**Revised Master SPEC effort** (much smaller scope):

| Iter | Scope | Effort | Status |
|---|---|---|---|
| 95 | SP1 + SP3 ALREADY shipped (PR #119 + #120) | 0 | Andrea ratify pending |
| 96 | **SP-WIRE — Orphan atoms 32-34 wire-up + atom 36 cherry-pick** | 6-8h | NEW priority |
| 96 | Atom 36 backport (no-fake-upload state machine) | 2-3h | Sub-task SP-WIRE |
| 96 | Wire CompileHomeV2 to App.jsx routes | 30min | Sub-task SP-WIRE |
| 96 | Migrate `#compile-home` route → IdeShell (decision below) | 1-2h | Sub-task SP-WIRE |
| 96 | Wire VirtualSerialMonitor (PR #120) into IdeShell bottom pane | 1h | Sub-task SP-WIRE |
| 96 | Wire UnlimChatInput into HomePage UNLIM panel | 1-2h | Sub-task SP-WIRE |
| 97 | SP6 C++↔Blockly roundtrip — verify atom 34 ast.ts coverage gap | 4-6h | Reduced from 10-12h |
| 98 | SP-UAT — Hardware UAT Nano R4 USB Andrea/Tea/Riccardo | 2h | Post Sprint V close |

**Total revised effort**: ~14-22h across iter 96-98. Down from 38-51h.

### `#compile-home` route migration decision matrix

Andrea mandate verbatim: `https://elab-builder.vercel.app/#compile-home` — explicit URL `#compile-home`.

3 options for iter 96 P0 implementation:

**Option A**: Add `'compile-home-v2'` to HOMEPAGE_SUBROUTES + leave `#compile-home` legacy. Andrea navigates separately to `#compile-home-v2` for IdeShell.
- Pros: Zero risk legacy regression. Both routes coexist.
- Cons: Andrea mandate URL is `#compile-home` NOT v2. Two routes confusing.

**Option B (RECOMMENDED)**: Migrate `#compile-home` route → IdeShell rendering. Deprecate HomeCompileEntry legacy.
- Pros: Andrea mandate URL preserved. Single source of truth. mBlock UX live at exact URL.
- Cons: Risk regression for users with bookmarks (HomeCompileEntry features may differ from IdeShell).

**Option C**: Hybrid — preserve `#compile-home` legacy MA add new mBlock features (CodePalette + unlimScreenAgent) into HomeCompileEntry. Don't use IdeShell at all.
- Pros: Backward-compat preserved. Familiar UI.
- Cons: Iter 93 atom 32 (IdeShell 974 LOC) wasted. Maintenance overhead two parallel UIs.

**Recommendation**: **Option B** — migrate `#compile-home` to IdeShell. Audit HomeCompileEntry features (R5 banner, ProgramExplainer, HomeCompileOnboarding) for parity matrix → port any missing feature into IdeShell first.

## Anti-COMPIACENZA honest acknowledgment

Master SPEC iter 95 entrance authored without checking iter 93 atoms shipped state. Same lesson as iter 67 PHASE 5 where Andrea documento was 95% redundant with iter 63 spec esistente.

**Pattern**: When given a major Andrea mandate, ALWAYS verify pre-existing work first (`git log --grep="<topic>"` + filesystem audit) BEFORE atomization.

**Counter-measure iter 96+ entrance MANDATORY**: pre-flight check for orphan code + recent merged work covering scope. Use `claude-mem` corpus search if available (currently stale Apr 28, rebuild iter 96 P0.0).

## Honest assessment value delivered iter 94-95

Despite Master SPEC redundancy, real value shipped:

1. **PR #117** CI E2E gate teaFumettiPackageAudit — NET NEW (no iter 93 atom covers)
2. **PR #118** PuzzleIcon rotational asymmetry fix — NET NEW (Andrea iter 94 PM flag, no iter 93 coverage)
3. **PR #119** Vol3 Arduino defaults centralized data + NewElabSimulator integration — NET NEW (atom 30 has C++ parser but not data defaults; this complements not duplicates)
4. **PR #120** VirtualSerialMonitor + interpretSerialOutput parser — NET NEW (predicted-output UI panel; iter 93 atom 36 covers upload state machine differently, complementary not duplicate)

**Master SPEC value**: documentation framework + 4 acceptance criteria gates + iter 96+ revised priority. Despite redundancy, the document still serves as the spec for iter 96+ INTEGRATION work.

## Iter 96 P0 priorities (revised from Master SPEC)

1. Andrea ratify 4 PRs #117-#120 (foundation)
2. SP-WIRE orphan atoms 32-34 integration (~6-8h, P0 critical)
3. Atom 36 backport / cherry-pick (no-fake-upload) (~2-3h)
4. Wire VirtualSerialMonitor (PR #120) into IdeShell bottom pane (~1h)
5. Decide migration `#compile-home` → IdeShell (Option B recommended) + execute
6. Codex Pattern V verify SP-WIRE pre-merge

## Sprint V revised close projection

**Iter 100 → Iter 98 close** projected. ~14-22h total iter 96-98 work + hardware UAT.

Anti-inflation G45 mandate: NO claim "Sprint V close" until SP-WIRE shipped + atom 36 backport + hardware UAT verified Nano R4 USB Andrea/Tea/Riccardo.

---

**ADDENDUM author**: Claude Opus 4.7 (1M context) — 2026-05-19 iter 95 entrance document-sync
**Andrea ratify required**: confirm Option B migration + iter 96 P0 priority revision OR feedback re-scope
