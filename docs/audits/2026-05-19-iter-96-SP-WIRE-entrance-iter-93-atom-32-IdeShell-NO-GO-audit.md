# Iter 96 SP-WIRE entrance audit — IdeShell (iter 93 atom 32) NO-GO production wire-up

> **Date**: 2026-05-19 iter 96 entrance
> **Status**: NO-GO — keep orphan, defer wire-up iter 97+
> **Author**: Claude Opus 4.7 (1M context) + code-reviewer:code-reviewer subagent
> **Andrea ratify gate**: required pre any future wire-up attempt
> **Mandate context**: Andrea "fai i controlli incorciati con codex a massima potenza e continua" iter 96 entrance cross-check

## Executive summary

Iter 96 entrance attempted SP-WIRE atom 1 (App.jsx + HomePage.jsx route addition for `#compile-home-v2` → CompileHomeV2 → IdeShell). code-reviewer:code-reviewer subagent verdict on iter 93 atom 32 IdeShell (PR #99 merged main MA orphan) = **NO-GO** with 5 CRITICAL findings + 8 WARNINGS + 6 SUGGESTIONS.

**Wire-up edits REVERTED pre-commit** per Andrea iter 82 lesson "dual-verify BEFORE commit" (Codex Pattern V + code-reviewer dual-verify caught 5 CRITICAL pre-production).

## 5 CRITICAL findings (must fix pre any wire-up)

### CRITICAL-1: Compile endpoint `/api/compile/nanor4` DOES NOT EXIST

**File**: `src/components/ide/CompileButton.tsx:34`

Hardcoded `POST /api/compile/nanor4`. Empirical verification:
- `vite.config.js` zero matches for this path
- `src/services/api.js` zero matches
- `vercel.json` zero matches
- Production chain uses:
  - LOCAL: `http://localhost:8765/compile` (`src/services/elab-agent/http-server.js` iter 70+)
  - CLOUD: Render endpoint `infra/cloud-compile/` (iter 76 D.3 OpenAPI 3.1)
  - Legacy: `https://n8n.srv1022317.hstgr.cloud/compile` (CLAUDE.md infrastruttura)

**Impact**: production wire-up → click "Compila" → **404 every time**. StatusBar shows "errore di rete" defeating entire flow.

**Fix recommendation**:
```typescript
import { compileArduinoCode } from '../../services/api';
const result = await compileArduinoCode(source, 'arduino:renesas_uno:nanor4');
```
Routes through iter 79.A A3 hexBase64 + iter 80.A5 size shape contract.

**Severity**: BLOCKER. Wire-up impossible without this fix.

### CRITICAL-2: Iter 95 PR #120 VirtualSerialMonitor layout collision unavoidable

**File**: `src/components/ide/IdeShell.module.css:5` — `grid-template-rows: 52px minmax(0, 1fr) 40px`

Bottom row fixed 40px. Andrea iter 94 PM spec verbatim: "Basso: Monitor Seriale Virtuale + stato compilazione".

VirtualSerialMonitor.jsx (PR #120) component scaffold:
- Header (52px) + content panel + disclaimer footer = minimum ~250px
- Existing SerialMonitor.jsx 383 LOC scrollable log + send-input + baud-rate selector + timestamps toggle + "Send to UNLIM" button

40px holds status pill only. Cannot fit VSM.

**Impact**: PR #120 wire into IdeShell impossible without CSS grid refactor.

**Fix recommendation**: `grid-template-rows: 52px minmax(0, 1fr) auto` + status pill into 32px sub-bar inside bottom region. Reserve remaining vertical space for VSM mount slot.

**Severity**: BLOCKER for SP3 + atom 32 integration.

### CRITICAL-3: Test infrastructure broken — 9/12 tests workaround via vi.useRealTimers()

**File**: `tests/unit/ide/IdeShell.test.jsx:38`

`vi.useFakeTimers()` global `beforeEach` collides with:
- `findByTestId` async waits in Suspense lazy mount
- `fetch.mockResolvedValueOnce` microtask resolution
- `userEvent` autoflushing

Mitigation via `vi.useRealTimers()` per-test in 9 of 12 tests. Code smell — global setup wrong.

**Impact**: future contributors writing tests forget the override → flaky failures. Pattern identical to iter 80.A2 BG agent bug PHASE 5.5 fix.

**Fix recommendation**: remove `vi.useFakeTimers()` from `beforeEach`. Apply locally only in T7 + T8 (the 2 debounce tests). Selective `toFake: ['setInterval', 'clearInterval']` per PHASE 5.5 pattern.

**Severity**: BLOCKER. Tests will break randomly until refactored.

### CRITICAL-4: localStorage mock assumes global setup may not exist

**File**: `tests/unit/ide/IdeShell.test.jsx:39`

`window.localStorage.getItem.mockReturnValue(null)` without preceding `vi.spyOn(window.localStorage, 'getItem')`. Works only if vitest.setup.js pre-installs `vi.fn` mock on every localStorage method. If setup file removed/moved, **all 12 tests crash on first beforeEach** (TypeError).

**Fix recommendation**: explicit mock per test file:
```javascript
beforeEach(() => {
  vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
  vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});
});
```

**Severity**: BLOCKER. Tests fragile across vitest config changes.

### CRITICAL-5: NO experimentId prop — Morfismo Sense 1.5 violation

**File**: `IdeShell.tsx` (entire component)

CLAUDE.md "DUE PAROLE D'ORDINE §Morfismo Sense 1.5" mandates per-classe/per-docente/per-kit/per-livello-studente runtime adaptation. IdeShell zero experiment awareness:
- No `experimentId` prop
- No `useSimulatorAPI` consumption
- No `experimentChange` event listener
- `DEFAULT_CPP` line 12 hardcoded Blink — same for every user/class/volume

**Impact**: when wired to route reachable from `#tutor` → Lavagna → "vai al codice", `experimentId` does not propagate. User sees Blink regardless of which Volume 3 experiment they were following. Breaks Triplet coerenza esterna (software ↔ kit ↔ volumi).

**Fix recommendation**:
```typescript
interface IdeShellProps {
  initialCpp?: string;
  experimentId?: string;
}
// On mount, query experiment registry → load DEFAULT_CPP_FOR_EXPERIMENT(id)
// from experiments-vol*.js .code field. Pattern identical to HomeCompileEntry
// + useExperimentLoader.handleSelectExperiment line 171-174.
```

**Severity**: BLOCKER per Andrea iter 94 PM mandate "stessa esperienza in esperimenti Arduino Volume 3".

## 8 WARNINGS (HIGH severity, should fix pre wire-up)

| ID | Issue | Impact |
|---|---|---|
| WARN-1 | Duplication of HomeCompileEntry 441 LOC features (R5 banner state machine iter 66 + CodeEditorCM6+ScratchEditor tab switcher iter 80.A2 + compile error gate iter 82 PHASE 5.5 + compileAndUpload WebUSB DFU iter 76+ + Plurale "Ragazzi" speech bubble) | Migration drops 7+ LIVE prod features OR 8-12h parity work |
| WARN-2 | Bidirectional Blockly ↔ C++ AST sync is theatre — `window.__ELAB_IDE_SYNC__` declared MA never installed in production code | Dual mode misleading: user thinks editors mirrored, actually disconnected |
| WARN-3 | ScratchEditor `initialCode` not `code` prop → first mount only, never updates from C++ edits | Subsequent C++ edits never reach Blockly pane visually |
| WARN-4 | No React.memo on heavy children → keystroke triggers full re-render storm | Measurable jank on LIM 1366×768 hardware |
| WARN-5 | EditorPane lazy ScratchEditor ~731KB chunk + static fallback (no spinner) | 5-10s lag school WiFi no progress indicator |
| WARN-6 | TypeScript `strict: true` compatibility unverified (no tsconfig.json root) | ~5-10 latent type issues likely surface when added |
| WARN-7 | CompileHomeV2.jsx wrapper missing `data-testid` (uses `data-elab-mode` only) | Smoke spec + regression scans miss this route entirely |
| WARN-8 | Iter 78 PROD silent functional regression class not addressed | Smoke spec catches only build-preview time, not prod runtime |

## 6 SUGGESTIONS (LOW-MED, polish iter 97+)

- SUG-1: ARIA tablist on ModeSwitcher (currently `role="group"`)
- SUG-2: WCAG contrast asymmetry top bar (light) vs bottom bar (dark)
- SUG-3: Responsive breakpoints incomplete (iPad 1024×768 + portrait 768 collision)
- SUG-4: localStorage namespacing OK (no action)
- SUG-5: Codex Pattern V mandatory BEFORE wire-up (this finding validates pattern)
- SUG-6: Status promotion to toast for success/error transitions

## Recommended action

1. **Keep IdeShell orphan**. Do NOT wire to `#compile-home` OR `#compile-home-v2` until 5 CRITICAL fixed.
2. **Iter 97 P0 plan**: address CRITICAL-1 (compile endpoint) + CRITICAL-5 (experimentId prop) + CRITICAL-2 (CSS grid refactor) + CRITICAL-3+4 (test infra). Estimated 8-12h.
3. **Codex Pattern V mandatory** post-fix verification BEFORE any wire-up retry.
4. **code-reviewer subagent** ratify post-fix.
5. **Andrea ratify gate** behind feature flag `VITE_USE_IDE_SHELL_V2=true` for canary `#compile-home-v2` route.
6. **14-day canary** + 1000q matrix preservation verify.

## Iter 96 SP-WIRE atom revised priority

**Original Master SPEC ADDENDUM** (PR #120 branch): SP-WIRE iter 93 atoms 32-34 integration (~6-8h).

**Revised post code-reviewer verdict**:
- **DEFER atom 32 (IdeShell) wire-up to iter 98+** post-fix 5 CRITICAL
- **Atom 33 (CodePalette) + atom 34 (unlimScreenAgent) BG verdict pending** — code-reviewer agent still running
- **Atom 36 cherry-pick (no-fake-upload)** still valuable independent
- **VirtualSerialMonitor (PR #120) wire deferred until IdeShell grid refactor OR alternative consumer**

**Iter 96 P0 revised priorities** (post Andrea ratify 4 open PRs):
1. Andrea ratify PR #117 + #118 + #120 (3 PRs Andrea decision)
2. Wait code-reviewer atom 33+34 verdict (BG agent running)
3. Consume Codex BG verdict synthesis (6448 LOC noisy, may need re-dispatch with tighter scope)
4. Decision: iter 97 P0 = IdeShell rework OR alternative path (e.g., enhance HomeCompileEntry incrementally with iter 93 atom 33+34 features)
5. A-SECURITY ELAB_API_KEY rotation iter 70 carryover (Andrea browser action)
6. CI governance gate PR #117 (Andrea TASK-XXX + CHANGELOG decision)

## Empirical actions taken iter 96 entrance

1. ✅ Created branch `feat/iter-96-SP-WIRE-iter-93-atoms-orphan-integration` from main HEAD `411cfa42`
2. ✅ Dispatched Codex BG Pattern V GPT-5.5 high (6448 LOC verdict, mostly file dumps)
3. ✅ Dispatched code-reviewer subagent atom 32 → NO-GO 5 CRITICAL + 8 WARN + 6 SUG
4. ✅ Dispatched code-reviewer subagent atom 33+34 (RUNNING)
5. ✅ Applied surgical edits App.jsx + HomePage.jsx (CompileHomeV2 lazy import + HOMEPAGE_SUBROUTES addition)
6. ✅ REVERTED edits pre-commit upon code-reviewer NO-GO verdict
7. ✅ This audit doc shipped

## Anti-COMPIACENZA acknowledgment

iter 96 entrance attempted wire-up SP-WIRE 1 BEFORE proper Codex+code-reviewer dual-verify on iter 93 atom 32 quality. Andrea iter 82 lesson "dual-verify BEFORE commit" was correct mandate — caught 5 CRITICAL pre-production.

Pattern reinforced: iter 93 atoms broker_v4 autonomous-generated quality must be verified BEFORE wire-up. Cannot assume merged main = production-ready.

**3rd redundancy/quality discovery iter 95-96 cross-check** (after Master SPEC iter 93 atoms orphan + PR #119 redundant canonical path). G45 anti-inflation reinforced.

## Anti-inflation G45 mandate iter 96 entrance enforced

- NO claim "iter 93 atoms shippable" (5 CRITICAL on atom 32 alone, atoms 33+34 pending verdict)
- NO claim "Sprint V close iter 100" (iter 97+ rework required)
- NO claim "Andrea ratify gate ready iter 96 SP-WIRE" (NO-GO verdict)
- NO claim "demo Riccardo certificate" (iter 93 atoms quality unverified production)
- NO claim "Master SPEC effort 14-22h iter 96-98 accurate" (revised: 8-12h rework atom 32 + atom 33+34 verdict pending)

## Cross-link

- code-reviewer:code-reviewer atom 32 verdict (BG agent ID `a2651d97dd23374b5`): 5 CRITICAL + 8 WARN + 6 SUG
- code-reviewer atom 33+34 BG agent (ID `a0420aa490dbb086f`): RUNNING
- Codex BG Pattern V (ID `br07x4gy8`): 6448 LOC `/tmp/codex-verify.txt` (mostly file dumps, low signal)
- IdeShell.tsx canonical: `src/components/ide/IdeShell.tsx`
- CompileButton.tsx CRITICAL-1: `src/components/ide/CompileButton.tsx:34`
- IdeShell.module.css CRITICAL-2: `src/components/ide/IdeShell.module.css:5`
- IdeShell.test.jsx CRITICAL-3+4: `tests/unit/ide/IdeShell.test.jsx:38-39`
- HomeCompileEntry parity reference: `src/components/home/HomeCompileEntry.jsx` (441 LOC LIVE prod)
- Iter 95 Master SPEC ADDENDUM (PR #120 branch): `docs/superpowers/plans/2026-05-19-iter-95-MASTER-SPEC-ADDENDUM-iter-93-atoms-orphan-finding.md`

---

**Andrea action richiesta**:
1. Ratify findings (5 CRITICAL on IdeShell)
2. Decide iter 97 P0: IdeShell rework OR enhance HomeCompileEntry incrementally
3. Wait code-reviewer atom 33+34 verdict + Codex BG synthesis before iter 96 SP-WIRE atom 2-3 decision
4. CI governance gate PR #117 resolution (TASK-XXX + CHANGELOG OR waiver)
5. A-SECURITY ELAB_API_KEY rotation iter 70 carryover (8+ days exposure)
