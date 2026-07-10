# ARDESIA V1 — next slice

Updated: 2026-07-10 after P35 browser regression. Base for this contract:
`origin/main@6f9665b12b64d2fdaedcf28a471391f758cd8e9d`.

## Slice

`P36-CURRENT-SHA-DEPLOY-PROOF-001`

Objective: prove whether the current integrated Studio SHA is deployed, and if
not, produce a current-SHA deploy/preview plus smoke evidence.

Do not add new product behavior. This is a deploy/provenance slice for the
already integrated P34/P35 path.

## Why This Slice

- P34 is merged in PR #166 and CI-green.
- P35 proves the P30 browser Room path observes ToolHost `board.write` audit
  locally.
- The current blocker is deploy provenance: an old production URL or HTTP 200
  does not prove `main@6f9665b1` is deployed.

## File Ownership

Maximum initial write set:

- deploy/readiness docs under `docs/ops/`
- deployment config only if a verified deploy command proves a small config gap
- no runtime code unless the smoke reveals a regression

Do not touch runtime code unless the regression fails.

## Acceptance Criteria

The slice is complete when it produces one of:

- `GREEN_SLICE`: current SHA is deployed/previewed and smoke passes with
  command/URL/run evidence; or
- `HONEST_RED`: deploy provenance cannot be tied to the SHA, or smoke fails with
  preserved evidence; or
- `SECURITY_RED` / `ARCHITECTURE_RED` / `ENVIRONMENT_RED` if those gates block
  a trustworthy verdict.

Minimum evidence:

1. current branch/SHA/worktree receipt;
2. exact deploy/provenance command and URL;
3. exact smoke command and result;
4. commit SHA shown in deploy metadata or equivalent provenance;
5. updated claim/failure/integration map.

## Commands To Define Before Coding

- `git status --short --branch`
- `git rev-parse HEAD`
- `gh run list --repo AndreaMarro/ardesia --branch main --limit 5`
- `gh run list --repo AndreaMarro/ardesia --commit 6f9665b12b64d2fdaedcf28a471391f758cd8e9d --limit 10 --json ...`
- Vercel inspect/deploy command selected from current repo config
- smoke command selected from `package.json`
- `python3 bin/ci/secret_scan.py`
- `git diff --check`

## Stop Conditions

- dirty path ownership is ambiguous;
- another writer owns the same files;
- security scan reports a high-confidence secret;
- the required boundary needs external credentials/access;
- deploy command would write production without an explicit approval trail;
- remediation would require broad backend/RLS/export work;
- two repair cycles fail.
