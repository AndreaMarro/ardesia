# ARDESIA V1 - Pull Request Register

Snapshot time: `2026-07-10T15:52:44+0200 CEST`
Repository: `AndreaMarro/ardesia`
Evidence base: `82bf629d0d73e837b4c58bed370b7f1d24509316`

Commands:

```bash
gh pr list --repo AndreaMarro/ardesia --state open --limit 30 --json number,title,isDraft,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup,updatedAt,url
gh pr view 161 --repo AndreaMarro/ardesia --json number,title,state,isDraft,baseRefName,headRefName,headRefOid,mergedAt,mergeCommit,url,statusCheckRollup
gh run list --repo AndreaMarro/ardesia --commit 82bf629d0d73e837b4c58bed370b7f1d24509316 --limit 10 --json databaseId,workflowName,headSha,status,conclusion,createdAt,updatedAt,url
```

Allowed claim labels: `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`, `RED`,
`DEFERRED`.

## Current Main

| Claim | Status | Evidence | Limit |
|---|---|---|---|
| Current `origin/main` is `82bf629d0d73e837b4c58bed370b7f1d24509316` | VERIFIED | local branch tracks `origin/main`; `gh run list --commit 82bf629d...` | Volatile after future merges |
| PR #161 is merged | VERIFIED | merge commit `82bf629d0d73e837b4c58bed370b7f1d24509316`; mergedAt `2026-07-10T13:41:07Z` | Docs-only ledger |
| Post-merge CI for `82bf629d` passed | VERIFIED | `ci` run `29096978340` conclusion `success` | Workflow evidence, not production redeploy |

## Open PRs

| PR | Base <- head @ OID | Draft | Checks at snapshot | Merge state | Ruling |
|---:|---|:---:|---|---|---|
| [#150](https://github.com/AndreaMarro/ardesia/pull/150) | `main` <- `p30/free-manipulation-trace-v0-20260709-185100@f63219758ab2` | yes | `ci` + readiness `SUCCESS` | CLEAN | VERIFIED CI, RED for e2e readiness because title still says `e2e RED_BLOCKER` |
| [#6](https://github.com/AndreaMarro/ardesia/pull/6) | `main` <- `codex/add-codex-minimax-worker@9a694c603e99` | yes | none | BLOCKED | DEFERRED historical proposal |
| [#5](https://github.com/AndreaMarro/ardesia/pull/5) | `main` <- `docs/canon-2026-06-27@0af9007dcf5d` | yes | none | BLOCKED | DEFERRED historical docs |
| [#4](https://github.com/AndreaMarro/ardesia/pull/4) | `main` <- `docs/ops-maps-2026-06-26@f09be5914c46` | yes | none | BLOCKED | DEFERRED historical maps |
| [#2](https://github.com/AndreaMarro/ardesia/pull/2) | `main` <- `docs/knowledge-maps-2026-06-25@3420b180d430` | yes | none | DIRTY | DEFERRED conflicting historical docs |
| [#1](https://github.com/AndreaMarro/ardesia/pull/1) | `main` <- `session/long-2026-06-25@902b98b6d101` | yes | none | DIRTY | DEFERRED session lineage |

## Merged V1 Stack 2026-07-10

| PR | Merge commit | Status | Ruling |
|---:|---|---|---|
| [#151](https://github.com/AndreaMarro/ardesia/pull/151) | `7c2ae9d6f0487958f463bbe43165c43507d0f4b1` | VERIFIED | Baseline/harness/docs integrated; not V1 green |
| [#155](https://github.com/AndreaMarro/ardesia/pull/155) | `8b9fbe1dd1a471029dce18b5a72adc15004e0298` | VERIFIED | Vercel monorepo deploy config integrated |
| [#156](https://github.com/AndreaMarro/ardesia/pull/156) | `a5684387ba3073f1aa50d4c5646b0cb17765333a` | VERIFIED | Deploy evidence recorded; docs only |
| [#157](https://github.com/AndreaMarro/ardesia/pull/157) | `bf511a4420fba6011de31eb5d2b3f886e54fc9d4` | VERIFIED | Production smoke command integrated |
| [#158](https://github.com/AndreaMarro/ardesia/pull/158) | `d19faae3b03f2d684f26a49430ef11e935cdad97` | VERIFIED | Production scenario smoke gate integrated |
| [#159](https://github.com/AndreaMarro/ardesia/pull/159) | `063b609c6f8a42e704a75f43e3f4256aaf28e662` | VERIFIED | Scenario gate ledger corrected |
| [#160](https://github.com/AndreaMarro/ardesia/pull/160) | `ce209b310c8c3f7432d2c8878df0d235386ac9f9` | VERIFIED | Studio dependency audit hardening integrated and production deployed |
| [#161](https://github.com/AndreaMarro/ardesia/pull/161) | `82bf629d0d73e837b4c58bed370b7f1d24509316` | VERIFIED | Dependency deploy ledger recorded; docs only, no redeploy |

Current production deploy evidence after #160 remains `ardesia-lavagna`
deployment `dpl_3LmGUXKofdHtUW2s8UawXrekEW89`, alias
`https://ardesia-lavagna.vercel.app`, HTTP 200, base smoke PASS and scenario
smoke PASS with 9 checkpoints. This is deploy + scenario-smoke evidence only,
not V1 or classroom readiness.

## Interpretation Rules

- `SUCCESS` applies only to the named workflow, exact head OID and code it ran.
- Draft, mergeable, clean and successful checks are independent properties.
- `no-deploy-check` proves that the workflow did not deploy.
- No direct push to `main`; integration still goes through PR.
- Any head update invalidates this snapshot until checks are tied to the new
  OID.
