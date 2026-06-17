# Watermark Filter — CI Integration Analysis (Day 12)

**Date**: 2026-04-21
**Author**: Claude Code headless loop (Day 12 P0-3)
**Scope**: propose CI enforcement path for `scripts/pre-commit-watermark-filter.sh` landed Day 11 (commit `8b97720`).
**Decision**: ANALYSIS ONLY — no workflow change applied. Awaits Andrea review.

---

## 1. Current state

### 1.1 Filter script

- Path: `scripts/pre-commit-watermark-filter.sh` (126 lines)
- Smoke test: `scripts/pre-commit-watermark-filter.test.sh` (65 lines)
- Modes: `--dry-run`, `--staged` (default), `--working`, `--verbose`
- Landed: Day 11 commit `8b97720`
- Production outcome Day 11: 73/75 dirty files auto-reverted successfully, zero false-positive (smoke test PASS).
- Day 12 reproduction: 75 dirty → 73 restored → 2 legitimate churn remain (`automa/state/heartbeat` + `automa/state/claude-mem-pending/` untracked).

### 1.2 Invocation surface

**Currently invoked**: manually / via agent at session start.
**NOT invoked**: pre-commit hook (no `.git/hooks/pre-commit` wiring yet), no `.husky/` equivalent, no CI step.

Consequence: script is correct but its enforcement is **discipline-gated** (agent must remember to run `bash scripts/pre-commit-watermark-filter.sh --working` before staging). When agent forgets → watermark noise reaches remote (historical pattern BLOCKER-003).

### 1.3 CI workflows touching diff

| Workflow | File | Triggers filter candidate |
|----------|------|---------------------------|
| E2E Tests | `.github/workflows/e2e.yml` | on: push, pull_request — runs vitest + playwright. No diff lint. |
| Quality Gate | `.github/workflows/quality-gate.yml` | per PR — runs checks. No watermark lint. |
| Governance Gate | `.github/workflows/governance-gate.yml` | per PR — policy checks. No watermark lint. |

**Conclusion**: watermark noise currently passes CI silently because no job lints for it. The filter only prevents the noise locally when run.

---

## 2. Risk assessment

### 2.1 Risk inventory

| Risk | Severity | Evidence |
|------|----------|----------|
| Watermark noise commits bloat git history | P2 | Day 09 audit BLOCKER-003: 96%+ dirty files were watermark-only |
| Engine semantic diff false alarm when watermark touches `simulator/engine/*` | P2 | Day 11 worked around manually (reset then re-apply), fragile |
| Agent discipline gap when headless loop proceeds without filter | P1 | Pre-commit hook absent = no automatic safety net |
| Filter script itself could rot (regex drift) | P3 | Smoke test covers canonical case but not exhaustive date formats |

### 2.2 Blast radius if CI lint lands

- **Low**: grep-based diff lint is fast (< 2s typical)
- **Breaks**: any legitimate copyright date update would need to be split off before touching other code (acceptable UX, matches intent)
- **False positives**: filter already guards against this via `TOTAL_LINES == WATERMARK_LINES` strict equality — so CI lint built on same regex inherits same safety

---

## 3. Proposed enforcement paths

### 3.1 Path A — pre-commit git hook (local, simplest)

**File**: `.git/hooks/pre-commit` (NOT under version control — requires install script).

```bash
#!/usr/bin/env bash
# Auto-install: scripts/install-git-hooks.sh
bash scripts/pre-commit-watermark-filter.sh --staged || exit 1
```

**Pros**:
- Zero CI infra change
- Runs at author time — prevents noise entering local history at all

**Cons**:
- Per-checkout install discipline required (solvable via `scripts/install-git-hooks.sh`)
- Bypass-able via `--no-verify` (against project rule but technically possible)
- No protection for pushes coming from other machines (stale checkout)

### 3.2 Path B — CI lint gate (recommended for team safety net)

**New workflow file**: `.github/workflows/watermark-lint.yml` (proposed, NOT applied).

```yaml
name: Watermark Lint

on: [pull_request, push]

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # need HEAD + parent for diff
      - name: Check for watermark-only commits
        run: |
          # Dry-run against working tree of current commit vs parent.
          # If any diff file is 100% watermark lines, fail the job.
          chmod +x scripts/pre-commit-watermark-filter.sh
          # We compare HEAD to HEAD~1 — not "staged" mode which assumes
          # an unstaged index. Use a custom one-shot analysis:
          CANDIDATES=$(git diff --name-only HEAD~1 HEAD --diff-filter=M | \
            xargs -I{} bash -c '
              f="{}"
              DIFF=$(git diff HEAD~1 HEAD -- "$f" | grep -E "^[+-]" | grep -Ev "^(\+\+\+|---)")
              TOTAL=$(echo "$DIFF" | wc -l | tr -d " ")
              WM=$(echo "$DIFF" | grep -cE "Andrea[[:space:]]+Marro.*[0-9]{2}/[0-9]{2}/[0-9]{4}")
              if [ "$TOTAL" -gt 0 ] && [ "$WM" -eq "$TOTAL" ]; then echo "$f"; fi
            ')
          if [ -n "$CANDIDATES" ]; then
            echo "::error::Watermark-only diff detected:"
            echo "$CANDIDATES"
            exit 1
          fi
          echo "No watermark-only diffs."
```

**Pros**:
- Protects every PR + push regardless of author machine
- Catches stale hooks on collaborator checkouts
- Runs in ~2s — negligible CI cost
- Fails loudly (error annotation) when violation detected

**Cons**:
- Requires PR workflow changes (review + approval)
- Does NOT auto-fix (only flags) — author must rebase/edit to remove watermark-only commits

### 3.3 Path C — combined (defense in depth)

Land BOTH Path A (author-side prevention) + Path B (CI enforcement). Belt-and-braces. Recommended final state.

---

## 4. Recommended enforcement decision matrix

| Scenario | Path |
|----------|------|
| Solo dev, discipline sufficient | A |
| Multi-dev team + CI discipline | B |
| Production-grade ELAB (current goal) | C |

**Recommendation for sett-2 Day 13+**: Path B first (highest ROI, no dev-side install), Path A deferred until multi-agent commits increase.

---

## 5. Day 12 dry-run evidence

```bash
# Pre-clean working tree
$ git status --short | wc -l
75

# Filter dry-run
$ bash scripts/pre-commit-watermark-filter.sh --dry-run --working
[watermark-filter] 73 file(s) with watermark-only diff (mode=working)
  - src/components/... (list truncated)
[watermark-filter] DRY-RUN: no files restored

# Filter apply
$ bash scripts/pre-commit-watermark-filter.sh --working
[watermark-filter] restored 73 file(s) to HEAD

# Post-clean
$ git status --short | wc -l
2   # automa/state/heartbeat + claude-mem-pending/ (untracked, harmless)

# Re-dry-run
$ bash scripts/pre-commit-watermark-filter.sh --dry-run --working
[watermark-filter] no watermark-only diffs detected (mode=working)
```

Filter is idempotent + correct in current working-tree mode.

---

## 6. Related CI drift observed (bonus finding)

While inspecting `.github/workflows/e2e.yml` for watermark integration, noted a comment-vs-grep drift:

> ```
> # Pattern: 01-12 + 21-22 (vision + a11y smoke).
> # Esclusi: 13, 14, 15, 16, 17, 18, 19, 20 (mega/ultra stress).
> run: |
>   npx playwright test \
>     --grep-invert "150-test-reali|stress-6-utenti|mega-stress|ultra-stress|fifty-users-comprehensive"
> ```

The comment claims exclusion of specs 13-20 by filename-number, but the actual `--grep-invert` matches **test title** patterns. Spec 13 (Vision Scaffold) and new spec 14 (Dashboard-v2 Scaffold, landed Day 12 P0-2) are both legitimate smoke specs by design; their test descriptions do NOT match any excluded pattern, so they **will run** in CI. This is consistent with the scaffold intent. The comment is stale and misleads future editors — **suggested fix Day 13+**: update comment to "Pattern: all specs; excluded by-name the 5 stress suites listed below." Not in scope Day 12 P0-3.

---

## 7. Next actions Andrea

1. **DECIDE** Path A / B / C for watermark enforcement.
2. **REVIEW** proposed `.github/workflows/watermark-lint.yml` snippet above.
3. **APPROVE** E2E comment drift fix (stale 13-20 exclusion claim) — trivial, defer Day 13+.
4. **OPTIONAL**: if Path A chosen, create `scripts/install-git-hooks.sh` as Day 13 task.

---

## 8. Acceptance criteria Day 12 P0-3 (self-check)

- [x] Doc analyzes current state (pre-commit local only)
- [x] Doc proposes CI gate (sample yml snippet, not applied)
- [x] Doc lists risk + mitigation
- [x] Script `scripts/pre-commit-watermark-filter.sh` re-tested dry-run against current `git status -s` output → report count of watermark-only dirty files that WOULD be filtered (75 → 73 candidates → 73 restored → 0 residual watermark-only)

Day 12 P0-3 **COMPLETE**.
