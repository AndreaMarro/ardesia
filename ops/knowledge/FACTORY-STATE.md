# FACTORY-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — GitHub deep

## The factory

**lessonos** is the autonomous build engine ("la fabbrica"). Its default branch is **`auto/main`** (the factory line that the loop commits to); `main` is the ratified line, promoted via PR #3 (auto/main → main).

- lessonos auto/main HEAD on GitHub = **`20560ec`** ("refactor(graph): remove redundant bin/graph_lint.py") — this is the served-SHA pin for this session.
- lessonos main = `92e393d`.
- mini auto/main = `20560ec`, 5 commits unpushed vs the LOCAL bare origin.

## Lineage trap (root cause of GitHub lag)

lessonos and maestro-studio use a **LOCAL bare repo as `origin`** (`/Users/progettibelli/lessonos.git`, `/Users/progettibelli/studio.git`); GitHub is only a *secondary* push remote. → factory commits land on the bare repo, GitHub stays behind unless explicitly pushed. **ardesia is the only mini code repo whose `origin` is GitHub directly.**

This means "GitHub lags by design" for lessonos/studio. Always reconcile served-SHA against the local bare HEAD, not just GitHub.

## Local-only tech branches (absent on GitHub, 404 confirmed)
- lessonos: `fix/auth-validator-flag-gated`, `feat/mcp-stdio-transport` (both CONFIRMED local-only) + `claude/c1-ocr-local`, `claude/c5-export`, `claude/m1-seam`, `claude/sv-gates-lessonos`, `merge/serving-backport`, `t6r/*` (5).
- ardesia: `ci/engine-sync-guard`, `claude/secret-purge-gemini`.

## Risk flags
- **No branch protection** on lessonos/auto/main (and ardesia/main) → the factory line can be force-pushed by anything. (gate-Andrea: add protection.)
- ardesia-studio divergent lineage: mini auto/main `899a350` ≠ GitHub auto/main `f881a78`; mini work was pushed as `studio/consolidate-2026-06-25` (`899a350` matches mini HEAD), NOT onto auto/main.

## Gate-Andrea
- Push durable tech branches to GitHub if they should survive.
- Add branch protection to auto/main lines.
- Reconcile studio divergent lineage (force vs merge — Andrea decides).
