---
name: ardesia-regate
description: Re-gate an ARDESIA worktree before implementation, integration, commit, PR, deploy, or loop resumption. Use to verify branch/SHA, ownership, dirty state, repository truth, security/architecture terminal states, CI/PR evidence, and the exact next safe slice.
---

# ARDESIA regate

Do not edit tracked files. `git fetch` is the only permitted Git mutation.
Evidence commands may create ignored tool caches, so inspect package scripts
before running them and compare repository status before and after. Never
clean, reset, stash, merge, commit, push, deploy, rotate credentials, or repair
findings during this skill.

## Inputs

- worktree path;
- requested slice or resume objective;
- optional PR number/head SHA;
- exact authorized dirty-path allowlist and named writer/captain, when the
  regate occurs after implementation.

Derive repository facts from the requested worktree and V1 state. Never invent
an omitted dirty-path allowlist or writer assignment; classify ownership
`UNKNOWN` until the caller supplies evidence.

## Procedure

1. Canonicalize the requested path with `realpath`, run
   `git -C <requested> rev-parse --show-toplevel`, canonicalize that result,
   and require exact equality. Use `git -C <verified-root>` for every Git
   command. A mismatch or unresolved path is `STOP`; never fall back to the
   process current directory. Then read the nearest `AGENTS.md`, package
   instructions, `docs/vault/ARDESIA-MAP.md`, current canon,
   `V1-LOOP-STATE.md`, `V1-CLAIM-REGISTER.md`, and `V1-SECURITY-MATRIX.md`.
2. Run `git fetch --all --prune`, then capture branch, `HEAD`, upstream,
   ahead/behind, remotes, `git worktree list --porcelain`, and all three path
   sets: `git diff --name-only`, `git diff --cached --name-only`, and untracked
   paths from `git status --porcelain=v2 --untracked-files=all`. Create a start
   fingerprint from `HEAD`, `git diff --binary HEAD --`, and sorted untracked
   path plus `git hash-object --no-filters` pairs. Hash the index and worktree
   separately with `git diff --cached --binary HEAD --` and
   `git diff --binary --`; `git diff HEAD` alone is insufficient. Include
   symbolic branch/HEAD and upstream as separate fields. Hash locally and
   never emit file contents or secret values.
3. Classify ownership path-by-path. `VERIFIED` requires either a clean tree or
   exact equality between the union of dirty paths and the explicit allowlist,
   plus a named exclusive writer/captain for this worktree. If the task context
   cannot prove exclusivity, report `UNKNOWN`; do not infer it from a unique
   worktree path. Any extra path is `RED`. A branch on `main`/`master` or a SHA
   mismatch also blocks a write lane.
4. Inspect `package.json` and invoked script bodies before running
   `npm run status` or package gates. Run only commands whose side effects fit
   the authorized slice and only when dependencies already exist; never
   bootstrap silently. Re-run the three dirty-path inventories afterward and
   report any delta.
5. Run `python3 bin/ci/secret_scan.py` when present, but consult the security
   matrix: exit 0 does not close documented coverage gaps.
6. Verify PR/CI with `gh pr view`/`gh run list` tied to the exact head SHA.
   Treat draft, skipped/no-deploy checks, and historical green runs literally.
   `pr_ci` is `VERIFIED` only when the worktree is clean, an open PR's
   `headRefName` equals the current branch, its head OID equals current `HEAD`,
   and every required check on that OID completed successfully. An empty
   required-check set is `UNKNOWN` unless branch-protection evidence proves
   that zero checks is intentional. No upstream/branch-matched PR, a dirty
   tree, parent-SHA checks, or inherited same-SHA evidence means `UNKNOWN`.
7. Reconcile repository truth. If canon and checkout disagree on behavioral
   ownership, return `ARCHITECTURE_RED`; do not choose a repository by recency.
8. Re-score at most three candidate slices. A live `SECURITY_RED` or
   `ARCHITECTURE_RED` outranks feature work. If ownership is `RED` or the tree
   is `UNOWNED_DIRTY`, the only permissible next slice is reconciliation or
   completion of the already-authorized current slice; do not dispatch a new
   remediation.
   An `AUTHORIZED_DIRTY` tree may pass a pre-commit regate, but never inherits
   PR/CI verification.
9. Recompute exact commit OID, symbolic branch/HEAD, upstream, staged hash,
   unstaged hash and untracked fingerprint immediately before the receipt. Any
   start/end delta invalidates all findings, even when two branches point to
   the same commit: return
   `freshness: STALE` and `terminal: STOP` with reason `STALE_REVIEW`. Do not
   reinterpret a concurrent change as part of the reviewed slice.

## Output

Return one compact receipt:

```text
REGATE
repo/worktree/branch/sha/upstream:
ownership: VERIFIED | RED | UNKNOWN
worktree: CLEAN | AUTHORIZED_DIRTY | UNOWNED_DIRTY
security: VERIFIED | SECURITY_RED | UNKNOWN
architecture: VERIFIED | ARCHITECTURE_RED | UNKNOWN
pr_ci: VERIFIED | RED | UNKNOWN
freshness: VERIFIED | STALE
commands: <command + real exit code>
next_slice: <one binary objective or NONE>
terminal: REGATE_PASS | HONEST_RED | SECURITY_RED | ARCHITECTURE_RED |
          ENVIRONMENT_RED | BLOCKED_EXTERNAL | STOP
```

`REGATE_PASS` is allowed only when freshness is `VERIFIED`, the exact worktree
is owned, its dirty state
is either `CLEAN` or `AUTHORIZED_DIRTY`, the behavioral Source of Truth is
resolved, and no security/architecture stop is open. It is a lane decision,
not authorization to commit, push or deploy and not a CI/release claim. Unknown
tests or `pr_ci` remain unknown and require their own gates. Persist the receipt
in V1 state only in a separate authorized write slice.
