# TESTING-STATE
last-verified: 2026-06-25 (gate 3739)
verified-by: bash eval/gate.sh firsthand (lessonos@b368438)

## Gates
- lessonos: eval/gate.sh -> uv run pytest, JSON {passed,failed,exit}. GREEN = exit0 + passed non-regress. baseline 3749 (3737 + 2 F2a + 4 F2b + 6 graph-lint). FROZEN evaluator (do not weaken).
- pre-commit hook check-no-gte-literal: warns on >= over deterministic counts.
- studio: tsc + vitest (maestro-studio).

## Browser-gate
- Playwright scripts/shots-storia.mjs, desktop+iPad. done-marker browser-gate-report.json (sections/citations/console-errors). NOT re-run this session (F4 scope).

## Backlog (TOOLING-TESTING-PLAN)
- golden-path north-star Playwright (manuale->citazione->lavagna->pack).
- ZERO-LLM gates: token-leak scan, hardcoded-content scan, DB sqlite-invariant.
- served-SHA==committed-SHA done-detection (now feasible: /health git_sha live).

Deep: ~/ardesia-vault/TOOLING-TESTING-PLAN-2026-06-25.
