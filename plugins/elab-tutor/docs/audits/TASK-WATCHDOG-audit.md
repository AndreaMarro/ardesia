# Audit TASK-WATCHDOG

**Auditor**: Claude Watchdog Session (independent from CLI #1 implementer)
**Date**: 2026-04-19T04:35:00Z
**PR**: #5 https://github.com/AndreaMarro/elab-tutor/pull/5
**Branch**: feature/watchdog-monitor

## Scope

Read-only ops feature: GH Actions workflow + bash orchestrator + ELAB checks + config + initial errors log + smoke test.

## Review checklist

| Item | Status | Notes |
|------|--------|-------|
| Regola 0 (no rewrite) | ✅ | Pure addition. Zero src/ or supabase/ touched |
| Regola 1 (pre-audit) | ✅ | `docs/tasks/TASK-WATCHDOG-start.md` present |
| Regola 2 (TDD) | ✅ | `tests/ops/watchdog-smoke.test.sh` (30 PASS) before feat commits |
| Regola 3 (CoV 3/3) | ✅ | Operational CoV 3/3 PASS in cov.md + smoke 30/30 PASS |
| Regola 5 (docs) | ✅ | watchdog-README.md + errors-log + handoff (in staging) |
| Bash safety | ✅ | `set -uo pipefail`, defensive `${VAR:-default}` expansion, always exit 0 |
| Secret hygiene | ✅ | No secrets in code or commit messages. `ELAB_ANON_KEY` referenced via env var only |
| Rate limiting | ✅ | Issue creation checks for existing open issue with same type before creating duplicate |
| Concurrency safety | ✅ | GH Actions `concurrency: group: watchdog-elab` prevents overlap |
| Permissions least-privilege | ✅ | Only `contents: write` (for log commits), `issues: write` (for alerts), `pull-requests: read`, `actions: read` |
| Portability | ✅ | `watchdog-run.sh` is project-agnostic; ELAB-specific logic in `watchdog-checks.sh` |
| Anti-regression | ✅ | Baseline 12081 preserved (verified pre-commit + pre-push hooks across 7 commits) |
| Honest limits documented | ✅ | watchdog-README.md "Honest limits" section |

## Risks identified

1. **Cron frequency `*/15`** — 96 runs/day. Each ~30-90s GH Actions minutes. ~2h compute/day. Acceptable for paid tier, monitor if costs spike.
2. **Issue spam without rate-limiting label** — first watchdog run with anomaly creates issue. Subsequent runs check open issues. If user closes issue, watchdog re-creates next anomaly. Mitigation: leave issue open until pattern resolved.
3. **`ELAB_ANON_KEY` not set** — degrades to CORS-only checks. Documented in errors-log + PR description as Andrea TODO.
4. **No automated remediation** — by design (alert-only). Andrea decides actions.

## Verdetto: APPROVE

Operational tooling. No risk to product code. Governance compliance met. Honest limits documented.

Conditional approval: Andrea adds `ELAB_ANON_KEY` secret post-merge for full PZ v3 tone validation coverage.

## Independence statement

This audit was performed by the watchdog-deploy session (Claude Desktop App, PID 23987-23998), separate from the CLI #1 implementer session (PID 31857) which is concurrently working on PR #4 (vision-e2e-live). Both sessions operate via different terminals/processes, share no state, and reach independent conclusions. CLI #1 has not reviewed this PR.

For stronger independence, recommend running `coderabbit:code-reviewer` or `wshobson-agents/comprehensive-review` post-merge for second-opinion verification.
