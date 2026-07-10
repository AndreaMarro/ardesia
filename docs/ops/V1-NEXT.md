# ARDESIA V1 — next slice

Updated: 2026-07-10 after P37 production P30 audit smoke. Base for this
contract: `origin/main@b3a8522424f29303900e1fc738a16f106bc26bc5`.

## Slice

`P38-P30-LESSONOS-EVENT-PROJECTION-001`

Objective: prove whether the P30 circuit action that now crosses ToolHost audit
also produces durable LessonOS event evidence. Do not start backend/RLS work
until the local LessonOS boundary is proven or honestly red.

## Why This Slice

- P34 routes Simulation Plugin write-back through ToolHost `board.write`.
- P35 proves browser audit locally and in CI.
- P36 proves the deployed Studio runtime and production scenario smoke.
- P37 proves the P30 audit-specific path against the production alias.
- The next unproven integration boundary is LessonOS durable event evidence,
  not another UI feature.

## File Ownership

Maximum initial write set:

- P30 e2e/test helper only if the existing trace can expose LessonOS evidence
  without runtime coupling;
- focused LessonOS test files if a targeted local test is the safer proof;
- `docs/ops/` evidence updates.

No backend migrations, RLS changes, graph storage or tutor retrieval in this
slice unless the local LessonOS boundary is already green and the next command
is trivial.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: P30 solve/break emits durable LessonOS event evidence with
  command/test proof and reload/persistence scope clearly stated; or
- `HONEST_RED`: the current P30 path only exposes DOM/audit signals and does
  not append the required LessonOS event evidence; or
- `ARCHITECTURE_RED`: there are multiple incompatible event sources and an ADR
  is required before patching.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. exact command proving or falsifying LessonOS event evidence;
3. event kind(s), source, persistence location and reload behavior;
4. updated claim/failure/integration map;
5. local gates: targeted test, typecheck when TS changes, diff check, secret
   scans.

## Stop Conditions

- the proof requires backend credentials or shared production data;
- the proof would depend on dev-only globals as the only evidence;
- the fix would broaden into backend/RLS/graph/export;
- two repair cycles fail.
