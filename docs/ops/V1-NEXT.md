# ARDESIA V1 — next slice

Updated: 2026-07-10 after P34 local remediation. Base for this contract:
`origin/main@e61e7dcd5b842351f3ee8ae3a671ad7e158deec6`.

## Slice

`P35-P30-ROOM-AUDIT-REGRESSION-001`

Objective: prove the real browser Room/P30 path still passes after the governed
write-back change, and decide whether audit visibility needs a browser-level
assertion.

Do not add backend/RLS/export/deploy work. This is a regression/proof slice for
the existing P30 flow plus the new ToolHost `board.write` audit path.

## Why This Slice

- P34 makes `break-connections` write-back cross `board.write` capability and
  audit locally.
- The remaining risk is browser integration: P30 e2e was not rerun locally due
  disk headroom, and audit visibility is only unit-tested.
- The next proof should be a focused regression, not a new feature.

## File Ownership

Maximum initial write set:

- `apps/studio/e2e/p30-free-manipulation.spec.ts` only if adding a minimal audit assertion is feasible
- `docs/ops/V1-FAILURE-LEDGER.md`
- `docs/ops/V1-CLAIM-REGISTER.md`

Do not touch runtime code unless the regression fails.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: P30 browser regression passes with the governed write-back, and
  audit visibility is either asserted or explicitly deferred with reason; or
- `HONEST_RED`: P30 fails or audit cannot be observed from the browser without a
  smaller enabling patch; or
- `SECURITY_RED` / `ARCHITECTURE_RED` / `ENVIRONMENT_RED` if those gates block
  a trustworthy verdict.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. exact browser command or CI run for P30;
3. evidence that break/write-back still persists after reload;
4. evidence for or against audit visibility from Room/P30;
5. updated claim/failure/integration map.

## Commands To Define Before Coding

- `git status --short --branch`
- `git rev-parse HEAD`
- `gh run list --repo AndreaMarro/ardesia --branch main --limit 5`
- focused P30 e2e command if disk permits, otherwise CI-only PR gate
- `python3 bin/ci/secret_scan.py`
- `git diff --check`

## Stop Conditions

- dirty path ownership is ambiguous;
- another writer owns the same files;
- security scan reports a high-confidence secret;
- the required boundary needs external credentials/access;
- disk headroom is too low for a reliable test/install;
- remediation would require broad backend/RLS/export work;
- two repair cycles fail.
