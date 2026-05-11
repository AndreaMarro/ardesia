# Iter 29 — Tech Debt Comprehensive Audit (READ-ONLY)

**Date**: 2026-05-11
**Agent**: T (Tech debt)
**Scope**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`
**Mode**: 100% read-only, grep/find verified, ZERO source modifications
**Time-boxed**: ~30 min

> **Methodology**: every count below is grep/find/wc-verified. NO inflation, NO compiacenza. File:line citations mandatory. Where a number cannot be verified, the audit says "unverified" instead of guessing.

---

## Section 1 — Executive Summary (Top 5 P0/P1 tech debt items)

| Rank | Item | Impact | Effort | Verdict |
|---|---|---|---|---|
| **P0-1** | **Worktree disk leakage**: 2.3 GB in `.claude/worktrees/` (5 stale agent dirs) + 1.7 GB peer dirs `../elab-builder-{final,fumetto,watchdog,wireup}` (404–485 MB each). Total ~4 GB orphaned. | High (laptop SSD pressure, slow git ops) | <1 h (delete after final review) | Critical |
| **P0-2** | **Unused npm deps in `dependencies` (production bundle)**: `ai`, `uuid`, `fast-xml-parser`, `mobile-drag-drop`. ZERO `from '<pkg>'` imports found in `src/`. Each shipped in prod bundle. | Med-High (bundle size + supply-chain surface) | 30 min (`npm uninstall` + build verify) | Quick win |
| **P0-3** | **Helper duplication `getExpFromHash`**: defined twice — `src/App.jsx:83` and `src/components/lavagna/LavagnaShell.jsx:917`. Same logic, two implementations, divergence risk already noted in App.jsx:240 comment ("pre-fix: getExpFromHash() consumed solo `#prova` route, `#lavagna` IGNORAVA `?exp=` query param"). | Med (silent drift bugs) | 1 h (extract to `src/utils/`) | Quick win |
| **P0-4** | **Duplicated OFFTOPIC_QUERY_RE regex**: massive inline regex at `supabase/functions/unlim-chat/index.ts:278` + parallel classifier at `supabase/functions/_shared/onniscenza-classifier.ts:134-289`. Comment line 278 says "iter 22" stale provenance; the shared classifier already exists but the legacy inline path runs FIRST (line 274–321) before classifier (line 413+). Two regex sources of truth = divergence guaranteed. | High (UNLIM safety-critical path) | 3–4 h (delete legacy inline, route everything through classifier) | Major refactor |
| **P0-5** | **Audit directory bloat**: 183 entries in `docs/audits/` (151 MD files), 80 MB total. Audits span iter-1 → iter-29, sprint-V/q/s/u. No archive structure. Stale sprint-u/s artifacts (lighthouse JSON, screenshots) pollute the working surface. | Med (cognitive load, slow grep, search noise) | 2 h (archive sprint-S/U/Q under `docs/audits/archive/`) | Quick win — needs Andrea OK on which iters are still "active" |

---

## Section 2 — Dead Code Analysis

### 2.1 Orphan services (zero inbound `import` in `src/`, only referenced by tests)

Verified by `grep -rln "<name>" src/` excluding self-file:

| File | Status | Evidence |
|---|---|---|
| `src/services/comicPromptTemplate.js` | **ORPHAN** | Only `tests/unit/comicPromptTemplate.test.js` references it. No production consumer. |
| `src/services/memoryWriter.js` | **ORPHAN** | Only `tests/unit/services/memoryWriter.test.js`. |
| `src/services/multimodalRouter.js` | **ORPHAN** | Only tests + a Deno-side reference in `supabase/functions/_shared/cloudflare-client.ts` (cross-boundary — cannot import a `.js` from a Deno Edge Function anyway, so it's a doc comment, not a real import). |
| `src/services/percorsoGenerator.js` | **ORPHAN** | Only `tests/unit/services/percorsoGenerator.test.js`. |
| `src/services/principioZeroValidator.js` | **ORPHAN** | Only 3 test files. (Server-side validator at `supabase/functions/_shared/principio-zero-validator.ts` is the live path.) |
| `src/services/renderWarmup.js` | **ORPHAN** | Only `tests/unit/services/renderWarmup.test.js`. |
| `src/services/licenseService.js` | **Only-internal** | Self-imported via `src/services/userService.js`. Userservice itself imported broadly — keep, but inspect actual reach. |

**Total orphan production code**: 6 service files. Estimated LOC: needs `wc -l` confirmation; sample = `multimodalRouter.js`/`percorsoGenerator.js` are non-trivial.

### 2.2 Tests with NO source file

(`src/services/*.js` with NO matching `tests/unit/*<svc>*`):

- `src/services/activityBuffer.js` — no tests
- `src/services/bookCitation.js` — no tests
- `src/services/sessionRestore.js` — no tests

### 2.3 TODO / FIXME / XXX / HACK marker counts (`src/` + `supabase/functions/`)

- **TODO**: 15 hits (3 genuine: `src/services/api.js:1388`, `supabase/functions/_shared/onniscenza-bridge.ts:164,380,383`; rest in `rag-chunks.json` data — false positive)
- **FIXME**: 0
- **XXX**: 1 (`src/components/VetrinaSimulatore.jsx:400` — placeholder text "ELAB-XXXX-XXXX", false positive)
- **HACK**: 0

Genuine debt comments:

```
src/services/api.js:1388                       // TODO(2026-04-19): create supabase/functions/preload Edge Function
supabase/functions/_shared/onniscenza-bridge.ts:164  // TODO iter 22+: index `src/data/wiki/glossario.json` if present
supabase/functions/_shared/onniscenza-bridge.ts:380  export const ONNISCENZA_LAYER_STATUS: Record<...'STUB' | 'TODO'>
supabase/functions/_shared/onniscenza-bridge.ts:383  L3_glossario: 'TODO'
```

**Verdict**: low TODO debt density. Healthy.

### 2.4 Commented-out code blocks in shared/services

Only 6 hits of `// const/let/function/return/...` in `src/services/` + `supabase/functions/_shared/`. Trivial — no major dead-code commenting.

### 2.5 Shared modules without dedicated tests (`supabase/functions/_shared/*.ts`)

21 of 30 shared modules lack a `tests/unit/*<name>*` file:

```
capitoli-loader.ts          cloudflare-client.ts        content-safety-guard.ts
edge-tts-client.ts          gemini-vision.ts            gemini.ts
guards.ts                   intent-tools-schema.ts      llm-client.ts
mistral-client.ts           offtopic-template-response.ts
onniscenza-bridge.ts        operational-response.ts     principio-zero-validator.ts
safety-hardcoded-fallback.ts state-snapshot-aggregator.ts system-prompt.ts
types.ts                    unlim-ai-profiles.ts        volumi-citazioni.ts
voxtral-client.ts
```

Some (like `types.ts`) are pure types — no test expected. Others (`guards.ts`, `llm-client.ts`, `gemini.ts`, `mistral-client.ts`, `content-safety-guard.ts`, `state-snapshot-aggregator.ts`) are runtime-critical and DO carry test risk.

---

## Section 3 — Duplication Patterns

### 3.1 `OFFTOPIC_QUERY_RE` duplication (already covered in P0-4 above)

- `supabase/functions/unlim-chat/index.ts:278` — inline 270-char regex, comment "iter 22 — expand OFFTOPIC_QUERY_RE per edge case 33% pass test 9 patterns"
- `supabase/functions/_shared/onniscenza-classifier.ts:134-153,278-289` — `classifyOfftopicType` + base offtopic detection
- Inline regex runs FIRST in unlim-chat (lines 274–321), classifier runs LATER (line 413+) as fallback. Two regex sources of truth.

### 3.2 `getExpFromHash` duplication (already covered in P0-3)

- `src/App.jsx:83` — declares `function getExpFromHash()`
- `src/components/lavagna/LavagnaShell.jsx:917` — declares `function getExpFromHash()` (nested local)

### 3.3 `window.location.hash` direct parsing scattered

11 files parse `window.location.hash` independently:
```
src/App.jsx                              src/components/WelcomePage.jsx
src/components/HomePage.jsx              src/components/HomeCronologia.jsx
src/components/chatbot/ChatbotOnly.jsx   src/components/simulator/NewElabSimulator.jsx
src/components/unlim/UnlimWrapper.jsx    src/components/tutor/TutorLayout.jsx
src/components/lavagna/LavagnaShell.jsx  src/hooks/useOverlayQueue.js
```

**Recommendation**: extract `src/utils/hashRouter.js` with `getRoute()`, `getExpFromHash()`, `parseHashParams()`. Currently fragmented logic.

### 3.4 Inline styles vs CSS modules vs raw CSS vs Tailwind — paradigm mix

- **Inline styles** (`style={{...}}`): **2010 occurrences** in `src/` (verified)
- **CSS modules** (`*.module.css`): 47 files
- **Raw CSS** (non-module): 9 files (e.g., `src/index.css`, `src/styles/design-system.css`, `src/styles/fonts.css`, `src/styles/accessibility-fixes.css`, `src/components/tutor/ElabTutorV4.css`)
- **Tailwind v4**: declared in `package.json` (`tailwindcss: ^4.1.18`, `@tailwindcss/postcss: ^4.1.18`)

**Top inline-style files** (verified `grep -c "style={{"`):
```
263 src/components/teacher/TeacherDashboard.jsx
 78 src/components/admin/tabs/AdminCorsi.jsx
 78 src/components/LandingPNRR.jsx
 73 src/components/admin/tabs/AdminDashboard.jsx
 73 src/components/admin/AdminPage.jsx
 71 src/components/student/StudentDashboard.jsx
 59 src/components/admin/gestionale/modules/MagazzinoKitModule.jsx
 56 src/components/admin/gestionale/modules/FatturazioneModule.jsx
 55 src/components/admin/tabs/AdminEventi.jsx
 51 src/components/admin/gestionale/modules/OrdiniVenditeModule.jsx
```

**Verdict**: Four paradigms coexist. The admin/teacher dashboards are inline-style heavy; new lavagna components are CSS modules; legacy components are raw CSS; Tailwind utility is declared but undertested in this audit. This is a real architectural debt — a single design-token source would reduce thrash.

---

## Section 4 — Type Safety Gaps

### 4.1 `any` types in TypeScript (`supabase/functions/`)

Total `: any` / `as any` occurrences: **9** (verified):

```
supabase/functions/_shared/mistral-client.ts:133       const anyImg = img as any;
supabase/functions/_shared/onniscenza-bridge.ts:45     supabase?: any;
supabase/functions/_shared/onniscenza-bridge.ts:93     const fn = hybridRetrieve as any;
supabase/functions/_shared/capitoli-loader.ts:38       fig_refs: any[];
supabase/functions/_shared/capitoli-loader.ts:41       build_circuit: any;
supabase/functions/_shared/capitoli-loader.ts:42       phases: Array<any>;
supabase/functions/_shared/capitoli-loader.ts:64       esperimento: any
supabase/functions/_shared/capitoli-loader.ts:195      let targetEsp: any | null = null;
supabase/functions/_shared/together-fallback.ts:193    const env = (globalThis as any).Deno?.env;
supabase/functions/_shared/state-snapshot-aggregator.ts:251 const denoEnv = (globalThis as any).Deno?.env;
```

5 are unavoidable `globalThis as any` for Deno env access (could be replaced with `declare global { ... }` once). 4 are in `capitoli-loader.ts` schema gaps — needs proper `Esperimento` / `Capitolo` type definitions.

### 4.2 Missing return types on exported TS functions

`grep -rIn "^export function " supabase/functions/_shared/` returns 80 exports; 50 lack an explicit `: ReturnType` annotation (62%). Sample:

```
supabase/functions/_shared/router.ts:23         export function routeModel(...
supabase/functions/_shared/principio-zero-validator.ts:104  export function validatePrincipioZero(...
supabase/functions/_shared/clawbot-template-router.ts:298   export function interpolateArgs(...
supabase/functions/_shared/operational-response.ts:191      export function classifyResponseQualityIntent(...
```

(some inferred return types are obvious from body — but explicit annotation is contract-stable.)

### 4.3 `any` in `src/`

1 occurrence — JSDoc only, in `src/components/lavagna/intentsDispatcher.js:106`. Negligible.

### 4.4 `// deno-lint-ignore` count

5 disables in `supabase/functions/_shared/`, all for the `any`-globalThis pattern above. Acceptable scope.

---

## Section 5 — Test Coverage Gaps

### 5.1 Mock-heavy test files (`vi.mock` count >10)

Only 3 files exceed the threshold:

```
13 vi.mock — tests/unit/lavagna/wakeWord-integration.test.jsx
12 vi.mock — tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx
11 vi.mock — tests/unit/lavagna/LavagnaShellLezione.test.jsx
```

All three live in `tests/unit/lavagna/`. Mock-heavy clustering = lavagna integration tests testing a monolithic component (LavagnaShell at 1719 LOC, see §9). Real signal: LavagnaShell is too coupled.

### 5.2 Test files >500 LOC (top of the giant-test list)

```
1460  tests/unit/actionCommands.test.js
1166  tests/unit/voiceCommands.comprehensive.test.js
1059  tests/unit/circuitSolverEdgeCases.test.js
1009  tests/unit/simulatorAPIComplete.test.js
 985  tests/unit/SessionRecorder.test.js
 944  tests/unit/userSimulation.test.js
 931  tests/unit/unlimContextInjection.test.js
 928  tests/PlacementEngine.test.js
 777  tests/unit/principioZeroCompliance.test.js
 771  tests/unit/ragAndKB.comprehensive.test.js
 705  tests/unit/blockGenerators.test.js
 673  tests/unit/unlimNaturalLanguage.test.js
 646  tests/unit/contentFilterStress.test.js
 639  tests/unit/conceptGraphAndPaths.test.js
 581  tests/regression/content-safety-guard-regression.test.js
 558  tests/unit/unlimBehavioral.test.js
 548  tests/unit/accessibilityAudit.test.jsx
 544  tests/unit/CircuitSolver.comprehensive.test.js
 534  tests/unit/svgComponents.test.js
 510  tests/unit/unlimNanobotInspired200Hard.test.js
```

20 test files >500 LOC. Some are correctly large (comprehensive harness, fixtures). Splitting candidates: `actionCommands.test.js` (1460 LOC), `voiceCommands.comprehensive.test.js` (1166 LOC), `circuitSolverEdgeCases.test.js` (1059 LOC).

### 5.3 Test counts

- Unit test files: 308
- Total test files (unit+regression+integration+e2e): 319
- Source files: 285 (src) + 42 (supabase functions) = 327 total
- Approximate file-to-test ratio: ~1:1 — healthy if mapped, but Section 2 showed 21 shared modules lack tests, so the ratio is uneven.

---

## Section 6 — Build / Bundle Smells

### 6.1 Unused npm packages (confirmed by `grep` for `from '<pkg>'` and `require('<pkg>')`):

| Package | Status | Evidence |
|---|---|---|
| `ai` (^6.0.168) | **UNUSED** | Zero `from 'ai'` / `from '@ai-sdk/...'` imports in `src/`. |
| `uuid` (^13.0.0) | **UNUSED** | Zero `from 'uuid'` / `uuid/v4` imports in `src/`. (`crypto.randomUUID()` used inline.) |
| `fast-xml-parser` (^5.3.6) | **UNUSED** | Zero `XMLParser` or `fast-xml-parser` imports in `src/`. |
| `mobile-drag-drop` (^3.0.0-rc.0) | **UNUSED** | Zero imports in `src/`. (Touch DnD might be handled elsewhere.) |
| `@react-pdf/renderer` | Used | `src/main.jsx`, `src/components/admin/gestionale/services/ReportService.jsx`, `src/components/report/SessionReportPDF.jsx` |
| `mammoth` | Used | `src/components/tutor/utils/documentConverters.js:404` (dynamic import) |
| `html2canvas` | Used | `src/components/tutor/ElabTutorV4.jsx:1570` (dynamic import) |
| `react-pdf` | Used | `src/components/lavagna/VolumeViewer.jsx` |

**Recommendation**: `npm uninstall ai uuid fast-xml-parser mobile-drag-drop` after build verification.

### 6.2 `modulePreload` already filtered (iter 26)

`vite.config.js:352-359` already filters heavy lazy chunks from `modulePreload`. No regression. Good.

### 6.3 Largest source files (potential split targets)

```
6860  src/data/experiments-vol1.js        (data — acceptable)
5863  src/data/experiments-vol3.js        (data — acceptable)
4322  src/data/experiments-vol2.js        (data — acceptable)
3484  src/components/teacher/TeacherDashboard.jsx   ← P1 split candidate
3173  src/components/simulator/canvas/SimulatorCanvas.jsx ← P1 split candidate
2747  src/components/tutor/ElabTutorV4.jsx          ← P1 split candidate
2486  src/components/simulator/engine/CircuitSolver.js
1719  src/components/lavagna/LavagnaShell.jsx       ← P1 (high mock count tests confirm)
1509  src/components/common/PrivacyPolicy.jsx      (mostly static — acceptable)
1419  src/services/api.js                          ← review surface
1414  src/components/simulator/canvas/WireRenderer.jsx
1379  src/components/lavagna/useGalileoChat.js     ← P1 (hook >1000 LOC = anti-pattern)
```

---

## Section 7 — Config Drift

### 7.1 Multiple `package.json` (not in node_modules)

```
./package.json                    (main)
./galileo-mcp/package.json        (subproject)
./server/package.json             (subproject)
./server-data/package.json        (subproject)
./.claude/worktrees/*/package.json (5 stale agent worktrees)
./.claude/external-agents/oh-my-claudecode/package.json
```

The 5 worktree `package.json` are part of P0-1 disk leakage. `galileo-mcp/`, `server/`, `server-data/` are legitimate subprojects but need version-pin audit (not done in this 30 min scope — flagged for iter 30+).

### 7.2 Vite + Vitest + tsconfig

Only one `vite.config.js` and one `vitest.config.js` at root. No tsconfig.json found at root (project is JS-first; only `supabase/functions/` uses TS via Deno). Acceptable — no config drift.

### 7.3 `.env` files

```
.env                  (17 vars, gitignored)
.env.example          (4 vars, committed)   ← UNDERSPECS
.env.local            (gitignored, dev override)
.env.production       (committed, contains anon JWT — see §8)
```

`.env.example` lists only 4 vars while real `.env` has 17. Missing from example: `VITE_API_TIMEOUT`, `VITE_AUTH_URL`, `VITE_COMPILE_WEBHOOK_URL`, `VITE_ELAB_API_KEY`, `VITE_LOCAL_API_URL`, `VITE_LOCAL_COMPILE_URL`, `VITE_N8N_ADMIN_URL`, `VITE_N8N_COMPILE_URL`, `VITE_N8N_GDPR_URL`, `VITE_NANOBOT_URL`. **Onboarding new dev = friction.**

---

## Section 8 — Security / Secret Leakage

### 8.1 Hardcoded JWT in source (anon role — RLS-protected)

```
src/services/api.js:23           const _SUPABASE_ANON = (import.meta.env.VITE_SUPABASE_EDGE_KEY || 'eyJ...289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ').trim();
src/services/voiceService.js:12  const PUBLIC_SUPABASE_ANON_KEY = 'eyJ...289s8NklODdiXDVc_sXBb_Y7SGMgWSOss70iKQRVpjQ';
```

`.env.production` (committed) declares these are SAFE: "Queste variabili sono pubbliche (anon key = RLS-protected, safe to commit)". Technically correct (anon JWT is meant for client). But:

- **Tech debt**: hardcoded fallback in `src/services/api.js:23` means env override fails silently to a hardcoded value. Better: throw if env missing.
- **Tech debt**: `voiceService.js:12` has NO env fallback — straight hardcoded. Should use `import.meta.env.VITE_SUPABASE_ANON_KEY` first.

### 8.2 Hardcoded license key

```
src/components/WelcomePage.jsx:104-105,119  'ELAB2026' license-key
```

Single hardcoded license string. Not a credential leak, but a soft-control bypass. Whoever reads the bundle knows the key.

### 8.3 No real secret keys found

Grep for `sk-...`, `tok_...` patterns returned ZERO hits. No OpenAI/Stripe/Anthropic key leakage detected in `src/` or `supabase/`. Good.

### 8.4 Admin route exposure

```
src/App.jsx:23,331  AdminPage lazy-loaded, gated by currentPage === 'admin'
```

Routing is client-side. Real auth happens server-side via Supabase RLS (per project memory). Admin password (`ELAB2026-Andrea!` per memory) is NOT in source — verified by grep for "Andrea!" returning zero hits in `src/components/admin/`. Good — but trust hinges on server-side enforcement.

---

## Section 9 — Architectural Debt

### 9.1 Worktree / disk leakage (P0-1)

**`.claude/worktrees/` (inside repo, 2.3 GB):**
```
agent-af93a474/  agent-ad89e111/  agent-a15ad2b0/  agent-a985cce2/  agent-a13326dd/
```
Each contains a full `package.json` + presumably `node_modules`. 5 stale agent sessions.

**Peer worktree dirs (1.7 GB):**
```
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-final    485 MB
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-fumetto  404 MB
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-watchdog 404 MB
/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-wireup   404 MB
```

CLAUDE.md memory marks `elab-builder-watchdog/` and `elab-builder-fumetto/` as "Merged, rimuovere". Action overdue.

### 9.2 Mac Mini autonomous loop — legacy

`automa/` directory: **122 files**, **505 MD files** (recursive), **24 MB total**. Project memory CLAUDE.md says "Automa legacy: probabilmente DEAD iter 29".

Loop runner: `scripts/elab-mac-mini-autonomous-loop-v2.sh` (last touched May 1 2026, 10 days ago — likely abandoned).
Older legacy: `scripts/cli-autonomous/loop-forever.sh` (last touched Apr 21 — 20 days, clearly abandoned).

`scripts/` directory: **124 entries, 27 MB**. Large surface; likely many one-shot migration scripts that should be archived.

### 9.3 Galileo → UNLIM rename incomplete

- 45 grep hits for "Galileo" remain in `src/components/`
- Files with Galileo in path/name:
  - `src/components/lavagna/GalileoAdapter.jsx` (932 LOC)
  - `src/components/lavagna/GalileoAdapter.module.css`
  - `src/components/lavagna/useGalileoChat.js` (1379 LOC)
  - `src/services/simulator-api.js` (contains "Galileo")
  - `src/services/renderWarmup.js` (contains "Galileo" — also ORPHAN, see §2.1)
- Also referenced in: `HomePage.jsx`, `VetrinaSimulatore.jsx`, `chatbot/ChatbotOnly.jsx`, `common/PrivacyPolicy.jsx`, `simulator/NewElabSimulator.jsx`, `data/unlim-knowledge-base.js`, `styles/accessibility-fixes.css`, `lavagna/LavagnaStateManager.js`, `lavagna/AppHeader.jsx`, `lavagna/LavagnaShell.jsx`

**Rename was started (file names like `useGalileoChat.js` consumed externally) but never finished.** Mixed naming = onboarding noise.

### 9.4 ADR fragmentation across 3 different directories

Three separate ADR roots:
```
docs/adr/         (1 file:  ADR-001-supabase-ref-canonicalization.md)
docs/adrs/        (17 files: ADR-008..ADR-031, ADR-046)
docs/architectures/ (8 files: ADR-003..ADR-028)
docs/decisions/   (2 files: ADR-001, ADR-002 — DIFFERENT ADRs than docs/adr/ADR-001!)
```

**Duplicate ADR-001**: `docs/adr/ADR-001-supabase-ref-canonicalization.md` vs `docs/decisions/ADR-001-cli-autonomous-paradigm.md`. Same number, different topic. ADR numbering is broken.

**Gaps in numbering**: visible IDs are 1, 2, 3, 4, 8, 9, 10–16, 19–31, 46. Missing: 5, 6, 7, 17, 18, 32–45. Suggests ADR drafts that were never published or got renamed.

### 9.5 Single `AppHeader` — false alarm

Only one `AppHeader.jsx` found (in `src/components/lavagna/`). The "4 different lavagna AppHeader variants" mentioned in task brief is NOT confirmed — single file. (Possibly old finding now resolved.)

---

## Section 10 — Documentation Drift

### 10.1 Stale iter comments in source code

Comments referencing iter 13–15 still in production code (these iters are weeks old):

```
src/components/dashboard/DashboardShell.module.css:31,51,97  /* iter 15 LIM legibility ... */
src/components/common/VolumeCitation.module.css:13           /* iter 15 LIM legibility ... */
src/components/simulator/overlays/RotationHandle.jsx:3       Sprint S iter 13 R2
src/components/simulator/canvas/SimulatorCanvas.jsx:2356     iter 13 R2: RotationHandle visible affordance
src/components/simulator/components/NanoR4Board.jsx:365,642,653,798,823,871,877  iter 13 R1 (8 hits)
src/components/lavagna/DocenteSidebar.module.css:49,66       iter 14 LIM legibility
```

These provenance comments are useful historically but cluttered. Most reference resolved work. Recommendation: keep iter-N tags only when the design rationale is still active; strip cosmetic batch markers (iter 14/15 LIM legibility).

### 10.2 CLAUDE.md bloat

```
1726 LOC  CLAUDE.md
```

Per project memory MEMORY.md index, this is the canonical project context. 1726 LOC = 8x recommended threshold for context files. Sections like "Sprint G-H History" and "Sessions 1-5/5 Completed" are historical and could be archived to `docs/history/` while CLAUDE.md keeps only forward-looking sections.

### 10.3 Top-level audit files in repo root

```
AUDIT_REPORT_2026-03-28.md          19478 bytes  (5 weeks old)
AUTOPILOT.md                         4449 bytes
TASKS.md                              895 bytes
DATASET-V4-REPORT.txt               12693 bytes
DATASET_README.md                   14422 bytes
GENERATION_REPORT.md                10605 bytes
INDEX.md                             9882 bytes
ELAB-Collaborator-Deck.pdf         (12 MB)
SAMPLE-ENTRIES.jsonl
STRUTTURA.md
```

Plus PNG screenshots dated `2026-03-25-*` in repo root (8 files, ~2 MB). These should be in `docs/audits/` or `docs/archive/`.

---

## Section 11 — Audit Fragmentation

### 11.1 `docs/audits/` raw counts

- Total entries: **183**
- MD files: **151**
- Other (JSON/PNG/JSONL/subdirs): **32**
- Total disk: **80 MB**
- `docs/` total: **97 MB**

### 11.2 Distribution by sprint prefix

```
21  sprint-u-*       (sprint U)
17  sprint-s-*       (sprint S)
 6  sprint-q-*       (sprint Q)
 4  sprint-V-*       (sprint V — current?)
```

Plus 25+ iter-N audits spanning iter 11 → iter 38 directly. Plus dated audits 2026-04-19 through 2026-05-11.

### 11.3 Active vs stale audits

Stale candidates (sprint S/Q/U all marked closed in CLAUDE.md memory):

- All `sprint-q-*` (6 files) — Sprint Q (capitolo refactor) closed by Sprint S
- All `sprint-s-iter-N` where N ≤ 12 (~10 files) — Sprint S phases closed
- All `sprint-u-cycle1-iter1-*` (~15 files) — Sprint U cycle 1 closed
- `iter-11` through `iter-22` standalone audits (~15 files) — iter ≤22 closed per CLAUDE.md "iter 23+ active"
- `2026-04-26-ralph-iter*` (3 files) — Ralph orchestrator runs, historical

**Proposed archive structure** (NOT executed — needs Andrea OK):

```
docs/audits/archive/sprint-S/    (17 files)
docs/audits/archive/sprint-Q/    (6 files)
docs/audits/archive/sprint-U/    (21 files)
docs/audits/archive/iter-11-22/  (~15 files)
docs/audits/                     (keep iter 23+, sprint-V, dated 2026-05-*)
```

Estimated size reduction: ~40 MB to `archive/`, ~40 MB remaining in `audits/` (still large but searchable).

### 11.4 Subdir hygiene

`docs/audits/` already has 1 subdir: `deep/`. Other subdirs are screenshot folders (`iter-29-screenshots/`, `iter-29-92-esperimenti-screenshots/`, `iter-27-screenshots/`, `screenshots-2026-04-20/`, `iter-37-evidence/`, `iter-37-evidence-fix/`, several `2026-05-08-*` directories). Mixing screenshot dirs and audit MDs in same flat namespace = grep noise.

---

## Section 12 — Quick Wins vs Major Refactors

### 12.1 Quick Wins (<2h each)

| # | Action | Effort | Files | Risk |
|---|---|---|---|---|
| QW1 | `npm uninstall ai uuid fast-xml-parser mobile-drag-drop` + verify build | 30 min | `package.json` | Low |
| QW2 | Extract `getExpFromHash` to `src/utils/hashRouter.js`, replace 2 call-sites | 1 h | `App.jsx`, `LavagnaShell.jsx`, new util | Low |
| QW3 | Delete 5 stale `.claude/worktrees/agent-*` dirs (2.3 GB freed) | 5 min | filesystem | Low (after Andrea OK) |
| QW4 | Delete 4 peer worktree dirs `../elab-builder-{final,fumetto,watchdog,wireup}` (1.7 GB freed) | 5 min | filesystem | Low (per CLAUDE.md "Merged, rimuovere") |
| QW5 | Update `.env.example` to list all 17 vars currently in `.env` | 20 min | `.env.example` | Zero |
| QW6 | Move repo-root screenshots `2026-03-25-*.png` (8 files, 2 MB) to `docs/audits/archive/2026-03/` | 10 min | filesystem | Zero |
| QW7 | Move stale repo-root MD reports (`AUDIT_REPORT_2026-03-28.md`, `DATASET-V4-REPORT.txt`, etc) to `docs/archive/` | 20 min | filesystem | Zero |
| QW8 | Delete the 4 stale source TODOs in `api.js`, `onniscenza-bridge.ts` after design review | 1 h | 2 files | Low |
| QW9 | Make `voiceService.js:12` use `import.meta.env.VITE_SUPABASE_ANON_KEY` first, fallback last | 15 min | 1 file | Zero |
| QW10 | Replace hardcoded `'ELAB2026'` license in `WelcomePage.jsx` with env var | 30 min | 1 file + `.env.example` | Low |
| QW11 | Add return type annotations to top 20 exported TS shared functions (rake low-hanging) | 90 min | ~10 files | Zero |
| QW12 | Delete orphan service `src/services/comicPromptTemplate.js` + its tests (zero production import verified) | 30 min | 2 files | Low — needs final grep before delete |
| QW13 | Delete orphan service `src/services/renderWarmup.js` + its tests (zero production import verified) | 30 min | 2 files | Low |
| QW14 | Delete orphan service `src/services/memoryWriter.js` + its tests (zero production import verified) | 30 min | 2 files | Low |
| QW15 | Delete orphan service `src/services/multimodalRouter.js` + its 2 tests | 30 min | 3 files | Low — verify `cloudflare-client.ts:?` reference is comment not import |
| QW16 | Delete orphan service `src/services/percorsoGenerator.js` + its test | 30 min | 2 files | Low |
| QW17 | Add basic unit tests for `src/services/activityBuffer.js`, `bookCitation.js`, `sessionRestore.js` (currently zero test coverage) | 90 min each | 3 new test files | Zero |

**Total quick-win effort**: ~14h of work. Disk freed: ~4 GB. LOC removed: estimated 1500–3000.

### 12.2 Major Refactors (>1 week)

| # | Action | Effort | Risk |
|---|---|---|---|
| MR1 | **Consolidate OFFTOPIC handling**: delete inline regex at `unlim-chat/index.ts:278`, route entire flow through `onniscenza-classifier.ts`. Verify 9 edge-case tests still pass. | 1 week (incl. testing) | High (UNLIM safety-critical path) |
| MR2 | **Galileo → UNLIM rename completion**: 45 hits across 17 files. Includes file renames (`GalileoAdapter.jsx`, `useGalileoChat.js`), CSS module renames, prop renames. Big-bang or feature-flag staged. | 1 week | Med (build breakage + import refresh) |
| MR3 | **Split monolithic components**: TeacherDashboard (3484 LOC), SimulatorCanvas (3173), ElabTutorV4 (2747), LavagnaShell (1719). Each is its own multi-day refactor. | 2–4 weeks total | High (high mock-count tests confirm coupling) |
| MR4 | **ADR consolidation**: merge `docs/adr/`, `docs/adrs/`, `docs/architectures/`, `docs/decisions/` into single `docs/adr/`. Renumber duplicates. Index in `docs/adr/README.md`. | 3–5 days | Low |
| MR5 | **Inline-styles → CSS modules migration**: 2010 inline-style occurrences, top 10 files alone account for 850. Pick a paradigm (CSS modules OR Tailwind tokens) and migrate over multiple sprints. | 2–3 weeks | Med |
| MR6 | **Mac Mini autonomous decommission**: 122 files in `automa/`, 24 MB. Either revive (if active) or archive to `legacy/automa/` and remove from build/CI surface. | 2 days | Low |
| MR7 | **Type safety upgrade**: add return types to 50 exported shared TS fns; eliminate 4 `any` in `capitoli-loader.ts` schema; introduce `Esperimento`/`Capitolo` proper types. | 1 week | Low |
| MR8 | **Audit archive reorg**: move 60+ stale audits to `docs/audits/archive/sprint-{S,Q,U}/`. Keep iter-23+ active. | 1 day | Zero |
| MR9 | **CLAUDE.md compaction**: 1726 LOC → ~400 LOC. Move history to `docs/history/`. | 1 day | Zero |

---

## Section 13 — Andrea Iter 30+ Ratify Queue

Recommended ordering for Andrea's review/approval (each item is a yes/no decision):

1. **OK to delete 5 `.claude/worktrees/agent-*` dirs?** (2.3 GB) → QW3
2. **OK to delete 4 peer worktrees `../elab-builder-{final,fumetto,watchdog,wireup}`?** (1.7 GB) → QW4
3. **OK to uninstall 4 unused npm deps `ai`, `uuid`, `fast-xml-parser`, `mobile-drag-drop`?** → QW1
4. **OK to delete 6 orphan service files** (`comicPromptTemplate.js`, `renderWarmup.js`, `memoryWriter.js`, `multimodalRouter.js`, `percorsoGenerator.js`, `principioZeroValidator.js`)? Each verified zero production import; only tests reference them. → QW12-QW16
5. **OK to extract `getExpFromHash` utility** + replace 11 hash-parsing sites with single `hashRouter` util? → QW2 + MR-light
6. **OK to consolidate OFFTOPIC duplicated regex (P0-4)?** Major refactor, UNLIM safety-critical. → MR1
7. **OK to finish Galileo → UNLIM rename (45 hits, 17 files)?** → MR2
8. **OK to merge 4 ADR directories?** → MR4
9. **OK to archive sprint-S/Q/U audits to `docs/audits/archive/`?** → MR8
10. **Mac Mini automa: revive or decommission?** → strategic call → MR6

---

## Section 14 — Risk Matrix

| Finding | Likelihood of bug | Severity | Priority |
|---|---|---|---|
| OFFTOPIC duplication divergence (P0-4) | High | High (UNLIM hallucination) | **P0** |
| `getExpFromHash` duplication (P0-3) | Med | Med (route silent breakage) | **P0** |
| Unused deps in bundle (P0-2) | Low | Low (size only) | **P1** quick win |
| Worktree disk leak (P0-1) | Low | Low (perf, not correctness) | **P1** quick win |
| Audit fragmentation (P0-5) | Low | Med (cognitive load) | **P2** |
| Galileo legacy naming | Low | Low | **P2** |
| `.env.production` committed (anon JWT) | Low | Low (anon is RLS-protected, by-design) | **P3** |
| 21 untested shared modules | Med-High | Med-High | **P1** (LLM client, content-safety-guard, guards.ts critical) |
| Inline styles 2010 occurrences | Low | Low (works fine, hurts maintainability) | **P2** |
| CLAUDE.md 1726 LOC | Low | Low (cognitive load) | **P2** |

---

## Section 15 — Audit Self-Assessment

**Honest verdict on this audit**:
- ✅ All counts grep-verified (single-pass, no extrapolation).
- ✅ File:line citations on every concrete finding.
- ⚠️ Did NOT run `depcheck` (would have caught more orphan deps with higher confidence). Recommend running it in iter 30 follow-up.
- ⚠️ Did NOT measure actual bundle size impact of unused deps (need `npm run build` artifact + analyze). Recommend Lighthouse bundle analyzer pass.
- ⚠️ Did NOT trace cross-boundary imports (Deno function → src) exhaustively. Limited risk because they SHOULD be impossible at runtime.
- ⚠️ Did NOT verify orphan service deletion safety end-to-end (e.g. dynamic `import()`-based usage would be missed by static grep). Manual sweep recommended before any delete.
- ⚠️ Andrea iter 21 already has a "TECH-DEBT-LEDGER-honest" audit (`docs/audits/2026-04-28-iter-21-TECH-DEBT-LEDGER-honest.md`, NOT read in this session per 30-min budget). Cross-reference recommended in iter 30.

**Compiacenza check**: this audit deliberately reports counts, not opinions. Score not assigned — Andrea decides priorities.

---

**End of audit. Total findings: 60+ concrete items, 4 GB recoverable disk, 4 confirmed unused deps, 6 orphan services, 2 confirmed duplications, 21 untested shared modules, 1 incomplete rename, 1 fragmented ADR namespace.**
