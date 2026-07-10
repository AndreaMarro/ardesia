# ARDESIA V1 — Pull Request Register

Snapshot time: `2026-07-10T03:56:27+02:00`
Repository: `AndreaMarro/ardesia`
Evidence base: `cedfa932dc91088e6bd30af49ed0f648157c6e1b`

```bash
gh pr list --repo AndreaMarro/ardesia --state open --limit 100 --json number,title,body,isDraft,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup,updatedAt,url
```

Confidence is HIGH for the returned snapshot only. PR heads, checks and merge
state are volatile; every later head update requires a fresh query.

## Open PRs

| PR | Base ← head @ OID | Draft | Checks at snapshot | Merge state | Ruling |
|---:|---|:---:|---|---|---|
| [#152](https://github.com/AndreaMarro/ardesia/pull/152) | `codex/v1-baseline-20260710` ← `codex/v1-harness-20260710@cedfa932dc91` | yes | Engine/Studio/hygiene SUCCESS | CLEAN | Harness-only; successful scoped checks are not V1 proof |
| [#151](https://github.com/AndreaMarro/ardesia/pull/151) | `main` ← `codex/v1-baseline-20260710@ece0138f0ca1` | no | Engine/Studio/hygiene SUCCESS | CLEAN | Baseline docs only; SUCCESS is not V1 proof |
| [#150](https://github.com/AndreaMarro/ardesia/pull/150) | `main` ← `p30/free-manipulation-trace-v0-20260709-185100@f63219758ab2` | yes | Engine/Studio/hygiene/no-deploy SUCCESS | CLEAN | Title retains `e2e RED_BLOCKER`; body does not; do not infer e2e green from CI |
| [#6](https://github.com/AndreaMarro/ardesia/pull/6) | `main` ← `codex/add-codex-minimax-worker@9a694c603e99` | yes | none | BLOCKED | Historical proposal; body/content discrepancy reported; no merge |
| [#5](https://github.com/AndreaMarro/ardesia/pull/5) | `main` ← `docs/canon-2026-06-27@0af9007dcf5d` | yes | none | BLOCKED | Reconcile, never treat as current runtime evidence |
| [#4](https://github.com/AndreaMarro/ardesia/pull/4) | `main` ← `docs/ops-maps-2026-06-26@f09be5914c46` | yes | none | BLOCKED | Historical maps; dated evidence only |
| [#2](https://github.com/AndreaMarro/ardesia/pull/2) | `main` ← `docs/knowledge-maps-2026-06-25@3420b180d430` | yes | none | DIRTY | Conflicting historical docs; no merge |
| [#1](https://github.com/AndreaMarro/ardesia/pull/1) | `main` ← `session/long-2026-06-25@902b98b6d101` | yes | none | DIRTY | Session lineage; no merge |

The current branch `codex/v1-repository-truth-20260710@cedfa932` had no PR at
this snapshot. Its PR number must be appended after creation; absence here is
not permission to inherit checks from #152 even though the commit is initially
the same.

## Interpretation rules

- `SUCCESS` applies only to the named workflow, exact head OID, and code it ran.
- Draft, mergeable, clean, and successful checks are independent properties.
- `no-deploy-check` proves that the workflow did not deploy; it is not deploy
  evidence.
- A stacked branch never inherits `pr_ci: VERIFIED` from its parent or another
  branch at the same OID.
- No PR may auto-merge to `main`; deploy and ratification require Andrea.
- Any head update invalidates this snapshot until checks are tied to the new
  OID.

## Current V1 stack

```text
origin/main@204ffefc
  └─ #151 baseline docs @ ece0138f
       └─ #152 Claude harness @ cedfa932
            └─ repository-truth branch (this five-document slice)
```

None of these nodes is a claim of `PILOT_READY` or `V1_GREEN`.
