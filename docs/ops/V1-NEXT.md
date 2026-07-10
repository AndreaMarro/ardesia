# ARDESIA V1 — next slice

Updated: 2026-07-10 after P36 current SHA deploy proof. Base for this
contract: `origin/main@b86ce8b67795d3239196fbd1a70d8e57a4444314`.

## Slice

`P37-PRODUCTION-P30-AUDIT-SMOKE-001`

Objective: prove the deployed production alias exercises the P30 browser path
with ToolHost `board.write` audit visibility, not only the broader Studio
scenario smoke.

Do not add new product behavior unless the production proof fails because of a
small test harness gap. This is a live verification slice for the already
integrated P34/P35/P36 path.

## Why This Slice

- P34 is merged in PR #166 and CI-green.
- P35 is merged in PR #167 and proves the P30 browser Room path observes
  ToolHost `board.write` audit locally and in CI.
- P36 deploys `main@b86ce8b6` to production and base/scenario smokes pass.
- The current blocker is narrower: production smoke does not yet read the
  ToolHost audit log for the P30 path.

## File Ownership

Maximum initial write set:

- one smoke/e2e helper or script if the existing P30 spec cannot target the
  production alias cleanly;
- focused docs under `docs/ops/`;
- no runtime product code unless the live proof exposes a real regression.

Do not touch runtime code for harness convenience.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: production alias proves P30 browser path plus
  `board.write`/`ok` audit visibility with command/URL evidence; or
- `HONEST_RED`: production P30 audit proof cannot be run or fails with
  preserved evidence; or
- `SECURITY_RED` / `ARCHITECTURE_RED` / `ENVIRONMENT_RED` if those gates block
  a trustworthy verdict.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. production alias and deployment id;
3. exact P30 production audit smoke command and result;
4. browser-observed audit entry count or snapshot;
5. updated claim/failure/integration map.

## Commands To Define Before Coding

- `git status --short --branch`
- `git rev-parse HEAD`
- `vercel inspect https://ardesia-lavagna.vercel.app --scope team_23uD0RgdInaTaOPEL0EGltup`
- inspect whether `apps/studio/e2e/p30-free-manipulation.spec.ts` can run
  against an external `baseURL` without writing to production data outside the
  browser-local room
- run the focused production-safe P30 audit command
- `python3 bin/ci/secret_scan.py`
- `git diff --check`

## Stop Conditions

- dirty path ownership is ambiguous;
- another writer owns the same files;
- security scan reports a high-confidence secret;
- the required boundary needs external credentials/access;
- remediation would require broad backend/RLS/export work;
- the production proof would mutate shared remote data instead of an isolated
  room/hash/local browser state;
- two repair cycles fail.
