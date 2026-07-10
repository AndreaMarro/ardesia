# ARDESIA V1 — next slice

Updated: 2026-07-10 after P33 regate. Base for this contract:
`origin/main@177f5c731ffc68fd69a86573ddf08670d3d5226f`.

## Slice

`P34-SIMULATION-TOOLHOST-WIRE-REMEDIATION-001`

Objective: remediate the first boundary found by P33:

Simulation Plugin write operation -> ToolHost capability/RPC/audit boundary.

Pick one write operation, preferably `wire-add` or `break-connections`, and make
its governed path explicit:

operation schema -> ToolHost method/capability -> audit event -> host mutation.

If ToolHost is intentionally not the boundary for first-party Simulation Plugin
writes, this slice must produce a ratified ADR exception plus a test that proves
the alternate boundary. Do not expand to backend/RLS/export before this boundary
is green.

## Why This Slice

- P33 found `HONEST_RED`: P30 proves local behavior but not ToolHost
  capability/RPC/audit for Simulation Plugin writes.
- Current code uses direct React callbacks/host closures for write-back:
  `ToolCanvasEmbeddable.tsx:1287-1354`, `Room.tsx:929-944`.
- ToolHost already has JSON-RPC/capability/audit machinery; this slice should
  connect one concrete operation to it, not build a new subsystem.

## File Ownership

Maximum initial write set:

- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`
- one ToolHost protocol/router/cap file if required
- one focused unit/e2e test file
- `docs/ops/V1-FAILURE-LEDGER.md`
- `docs/ops/V1-CLAIM-REGISTER.md`

Do not touch backend/RLS/export in this slice.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: one Simulation Plugin write operation is proven to cross a
  governed ToolHost method/capability/audit boundary with focused tests; or
- `ADR_EXCEPTION`: first-party Simulation Plugin bypass is explicitly ratified
  with an alternate tested boundary and updated claims; or
- `HONEST_RED`: the chosen remediation is blocked by a smaller reproduced
  boundary with exact file/command evidence; or
- `SECURITY_RED` / `ARCHITECTURE_RED` / `ENVIRONMENT_RED` if those gates block
  a trustworthy verdict.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. exact operation under test and its schema;
3. focused test proving method/capability/audit or ADR exception;
4. regression check for existing P30 behavior where feasible;
5. updated claim/failure/integration map.

## Commands To Define Before Coding

- `git status --short --branch`
- `git rev-parse HEAD`
- `gh run list --repo AndreaMarro/ardesia --branch main --limit 5`
- focused unit/e2e command after the operation is selected
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
