# ARDESIA V1 — next slice

Updated: 2026-07-10. Base for this contract:
`origin/main@9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`.

## Slice

`P33-INTEGRATION-SPINE-REGATE-001`

Objective: prove the first real integration boundary that fails between a
current simulation/free-wire behavior and the required V1 spine:

pointer/touch -> domain operation -> plugin capability -> ToolHost ->
LessonOS event -> local persistence -> backend persistence -> graph projection
-> ElabTutor retrieval -> export -> close/reopen -> exact-SHA deploy proof
when the approved deploy route is part of the slice.

This is an audit/regate slice first. It may end as `HONEST_RED`; it should not
add a new product feature before the boundary and ownership are proven.

## Why This Slice

- PR #150 is merged and repeat-gated, so the free manipulation trace is now an
  integration anchor.
- PR #163 reduced the browser-side Principio Zero runtime conflict, so the next
  highest leverage blocker is not more tutor prose; it is proving whether real
  circuit operations cross the product spine.
- Existing evidence still indicates ToolHost/direct-callback, LessonOS sync,
  backend/RLS, graph/tutor and deploy proof gaps.

## File Ownership

Read-only first:

- `apps/studio/e2e/`
- `apps/studio/src/toolhost/`
- `apps/studio/src/Room.tsx`
- `apps/studio/src/lessonos/`
- `apps/studio/src/store/`
- `docs/ops/V1-INTEGRATION-MAP.md`
- `docs/ops/V1-FAILURE-LEDGER.md`
- `docs/ops/V1-CLAIM-REGISTER.md`

If a write slice is selected afterward, assign one owner and no more than five
files before editing.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: one existing operation is proven through every applicable
  boundary listed above with commands/tests/CI evidence; or
- `HONEST_RED`: the first failing boundary is reproduced, documented with exact
  command/file evidence, and converted into the next smallest remediation; or
- `SECURITY_RED` / `ARCHITECTURE_RED` / `ENVIRONMENT_RED` if those gates block
  a trustworthy verdict.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. exact operation under test;
3. test or command showing pointer/domain behavior;
4. evidence for or against ToolHost/capability crossing;
5. evidence for or against LessonOS event emission and persistence/reopen;
6. evidence for or against backend/RLS if the path claims backend sync;
7. evidence for or against graph/tutor/export/deploy only when that boundary is
   actually reached; deploy evidence must name the exact SHA, URL and smoke
   command, otherwise record `DEPLOY_UNKNOWN_FOR_HEAD`;
8. updated claim/failure/integration map.

## Commands To Define Before Coding

- `git status --short --branch`
- `git rev-parse HEAD`
- `gh run list --repo AndreaMarro/ardesia --branch main --limit 5`
- targeted test/e2e command after the operation is selected
- `python3 bin/ci/secret_scan.py`
- `git diff --check`
- deploy inspect/smoke command only if the slice reaches deploy proof on an
  approved exact-SHA route

## Stop Conditions

- dirty path ownership is ambiguous;
- another writer owns the same files;
- security scan reports a high-confidence secret;
- the required boundary needs external credentials/access;
- disk headroom is too low for a reliable test/install;
- deploy proof would require an external route that cannot be tied to the exact
  SHA under test;
- two repair cycles fail.
