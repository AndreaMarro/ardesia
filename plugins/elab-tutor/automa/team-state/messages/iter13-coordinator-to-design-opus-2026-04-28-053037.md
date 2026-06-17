---
from: iter13-coordinator-opus
to: design-opus
iter: 13
sprint: S
date: 2026-04-28
timestamp: 053037
atoms_assigned: [D1, D2, D3, D4]
priority: 3 — Design impeccable LIM legibility (PROPOSE-ONLY iter 13)
file_ownership_rigid:
  WRITE_NEW:
    - docs/audits/2026-04-28-design-impeccable-LIM-audit.md
    - docs/audits/2026-04-28-design-critique-4-pages.md
    - docs/specs/SPEC-iter-14-design-LIM-legibility.md
    - docs/specs/SPEC-iter-14-design-system-extraction.md
  WRITE_MODIFY: []
  READ_ONLY: all_repo_source_code
mandate: ZERO src/ touch — DOC ONLY iter 13 (preserves vitest 12599 + build PASS for 12h sellable deadline)
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.3
loc_estimate: ~900 LOC docs only
time_estimate: 5h Opus dedicated
completion_msg_required: automa/team-state/messages/design-opus-iter13-to-orchestrator-2026-04-28-*.md
---

# Dispatch brief — design-opus iter 13

## Self-contained context (NO prior conversation memory)

You are design-opus, an Opus 4.7 1M-context agent dispatched by iter13-coordinator for **Sprint S iter 13** of ELAB Tutor. Working directory: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`. Repo HEAD: `9f589ba`.

ELAB Tutor is projected on **LIM (Lavagna Interattiva Multimediale)** — large interactive whiteboards in Italian classrooms. Students sit 3-5m away from screen. Touch interaction by teacher (1 user) on shared display visible to 20-30 students. Current UI design has **legibility gaps from LIM distance**.

**Quality audit raw signals** (iter 12 carry-forward, iter 13 must quantify):
- 435 font<14 instances in CSS files (estimate from grep).
- 1326 fontSize<14 instances in JSX files (estimate).
- 103 touch<44 instances (CLAUDE.md regola 9 violations).
- 9 console.log leftover (defer Sprint T iter 15+).

User Andrea Marro identified iter 13 **Priority 3**: "Design impeccable: Principio Zero V3 LIM legibility. Quality audit raw signals."

**CRITICAL MANDATE — DOC ONLY iter 13**: ZERO src/ code changes this iter. 12h product-sellable deadline → cannot risk vitest 12599 + build PASS regression on cosmetic changes. Iter 13 deliverable = HIGH-QUALITY iter 14 implementation specs (so Andrea/Tea can review without time pressure, then iter 14 implements with confidence).

CLAUDE.md constraints:
- Regola 8: font min 13px body, 10px label.
- Regola 9: touch ≥44x44px.
- Regola 10: contrast WCAG AA 4.5:1 (your spec proposes AAA 7:1 for primary CTA).
- Regola 17: Oswald + Open Sans + Fira Code.
- Regola 16: palette Navy #1E4D8C / Lime #4A7A25 / Orange #E8941C / Red #E54B3D.
- `.impeccable.md` (project root) is design source of truth — 5 Design Principles + 10-anti-pattern checklist. READ before all 4 atoms.

## Task scope detailed (4 atoms — DOC ONLY)

### D1 — Design audit raw signals quantified (~250 LOC)

Write `docs/audits/2026-04-28-design-impeccable-LIM-audit.md`:

1. **Run real grep counts** (NOT estimates):
   - `grep -rn "font-size:\s*\(1[0-3]px\|[0-9]px\)" src/ --include="*.css" --include="*.module.css" | wc -l` → real count font<14 CSS.
   - `grep -rn "fontSize:\s*['\"]\?\(1[0-3]\|[0-9]\)" src/ --include="*.jsx" --include="*.js" | wc -l` → real count fontSize<14 JSX.
   - `grep -rn "min-\(width\|height\):\s*\([0-3][0-9]\|4[0-3]\)px" src/ --include="*.css" | wc -l` → real touch<44.
2. Top-30 worst offenders by file:line (sort grep output).
3. Cross-reference `.impeccable.md` 5 Design Principles + 10-anti-pattern checklist — identify which violations apply.
4. LIM-distance assessment: which screens fail at 3-5m readability (Dashboard, NewElabSimulator, LavagnaShell, UnlimOverlay primary candidates).
5. Hierarchy issues: visual weight + spacing + alignment audit raw notes (Tea-style critique).

**Verify**: `wc -l` ≥250. ALL grep counts REAL not estimates (anti-inflation rule CLAUDE.md).

### D2 — Principio Zero V3 LIM legibility proposal (~300 LOC)

Write `docs/specs/SPEC-iter-14-design-LIM-legibility.md`:

1. **Font scale proposal LIM-distance 5m**:
   - Body min 16px (up from 13px regola 8).
   - Titoli min 24px (Oswald).
   - Labels secondarie min 14px (up from 10px regola 8).
   - Code (Fira Code) min 14px.
   - All values rem-based for accessibility scaling.
2. **Touch target proposal**:
   - Primary 52px × 52px (up from 44px regola 9 — matches LIM tap-distance teacher reach).
   - Secondary 44px (current minimum).
   - Spacing between targets ≥8px.
3. **Color contrast proposal**:
   - Primary CTA WCAG AAA 7:1 (up from AA 4.5:1).
   - Body text AA 4.5:1 (current).
   - Disabled state ≥3:1 (current).
4. **Iter 14 implementation roadmap** atomic steps:
   - Step 1: src/styles/design-tokens.css NEW (per D4).
   - Step 2: globals.css migration to tokens (find/replace).
   - Step 3: 30 worst-offender file:line surgical fixes (per D1 list).
   - Step 4: visual regression test (Playwright LIM 1080p + 4K viewport screenshot diff).
5. **NO code changes iter 13**. Andrea reviews spec, Tea reviews aesthetics, iter 14 implements.

**Verify**: `wc -l` ≥300.

### D3 — Design critique 4 worst pages (~200 LOC)

Use `design:design-critique` skill (or critique-style structured eval if skill unavailable).

Write `docs/audits/2026-04-28-design-critique-4-pages.md`:

For each of 4 pages (open via Read tool, do NOT modify):
1. **Dashboard** (`src/components/dashboard/`)
2. **NewElabSimulator shell** (`src/components/simulator/NewElabSimulator.jsx`)
3. **LavagnaShell** (`src/components/lavagna/LavagnaShell.jsx`)
4. **UnlimOverlay** (`src/components/unlim/UnlimOverlay.jsx`)

Per page (50 LOC each):
- Visual hierarchy critique (5 items).
- Spacing + alignment issues (5 items).
- Typography violations (3 items).
- Touch target failures with file:line refs (3 items).
- LIM-distance readability score 1-10 honest.
- Top-5 actionable fixes prioritized (concrete file:line + before/after).

**Verify**: `wc -l` ≥200. ≥30 actionable items total (8+ per page minimum).

### D4 — Design system extraction proposal (~150 LOC)

Write `docs/specs/SPEC-iter-14-design-system-extraction.md`:

1. **`src/styles/design-tokens.css` proposal** (NEW file iter 14):
   - CSS custom properties: --color-{navy,lime,orange,red,...} + --font-{oswald,open-sans,fira-code} + --spacing-{xs,sm,md,lg,xl} + --radius-{sm,md,lg} + --touch-{primary,secondary} + --font-size-{body,title,label,code} + --line-height-{tight,normal,loose}.
   - All values from CLAUDE.md regole 8/9/10/16/17 + D2 LIM proposal.
2. **Migration plan iter 14**:
   - Step 1: ship design-tokens.css.
   - Step 2: src/styles/globals.css imports tokens.
   - Step 3: codemod find-replace hardcoded values to var(--token).
   - Step 4: lint rule via stylelint (--no-hardcoded-values).
3. **Conformance test** iter 14: NEW `tests/unit/design-tokens.test.js` validates all CSS files use var(--*) NOT hardcoded.

**Verify**: `wc -l` ≥150.

## Anti-regression mandate (CoV mandatory)

1. **ZERO src/ touch** — `git diff src/` empty after your work. Spec docs only.
2. `npx vitest run` UNCHANGED ≥12599 PASS (no test added/removed by you).
3. `npm run build` UNCHANGED PASS (no bundle delta — orchestrator PHASE 3 verifies).
4. `automa/baseline-tests.txt` delta = 0.
5. ZERO touch other agents' files.

## CoV requirements

- 3× verify rule on grep counts (NOT estimates).
- File system verify post-write: `ls -la docs/audits/*.md docs/specs/*.md` confirm 4 NEW files.
- LOC verify: `wc -l` per file (D1 250 + D2 300 + D3 200 + D4 150 = 900 total).
- NO inflation: do NOT claim "design is now impeccable" — only proposals shipped, iter 14 implements.

## Completion message expected output

Write `automa/team-state/messages/design-opus-iter13-to-orchestrator-2026-04-28-<HHMMSS>.md` per coordinator schema. State explicitly "DOC ONLY — ZERO src/ touch". Include: 4 grep counts (real), top-30 file:line offenders summary, top-5 LIM-readability page rankings, iter 14 effort estimate (LOC + days for design-system implementation).

NO inflation. Caveman mode preferred. ONESTÀ MASSIMA.

— iter13-coordinator-opus, 2026-04-28 05:30:37 CEST.
