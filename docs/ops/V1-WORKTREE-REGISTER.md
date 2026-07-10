# ARDESIA V1 — Worktree Register

Snapshot: `2026-07-10T03:35:08+02:00`; refreshed for current writer
`2026-07-10T15:52:44+0200 CEST`
Evidence base: original `cedfa932dc91088e6bd30af49ed0f648157c6e1b`; current
writer base `82bf629d0d73e837b4c58bed370b7f1d24509316`
Command: `git worktree list --porcelain` plus per-path
`git status --porcelain=v1 --untracked-files=all`
Scope: inventory, not ownership proof
Confidence: HIGH for paths/heads/porcelain counts at each snapshot; UNKNOWN for
human/process ownership and changes after each snapshot.

## Refresh 2026-07-10T15:52:44+0200 CEST

| Claim | Status | Evidence | Limit |
|---|---|---|---|
| Current writable lane is isolated | VERIFIED | `/Users/andreamarro/VOLUME 3/ardesia-wt-v1-principle-zero-20260710` on `codex/v1-principle-zero-book-fidelity-20260710`, HEAD `82bf629d0d73e837b4c58bed370b7f1d24509316` | Does not prove ownership of other worktrees |
| Canonical checkout remains off-limits | VERIFIED | `/Users/andreamarro/VOLUME 3/ardesia` is a separate dirty checkout on `codex/ardesia-ops-headroom-20260701` | Do not write there for this slice |
| File ownership for this slice | VERIFIED | `docs/ops` only | Docs-only; no product code |

## Summary

- Registered worktrees: **31**.
- Worktrees with dirty paths: **7**.
- Detached worktrees: **3**.
- Sole authorized writer for this V1 cycle:
  `~/VOLUME 3/ardesia-wt-v1-baseline` on
  `codex/v1-repository-truth-20260710`.
- Main local checkout has **127** porcelain entries and remains untouchable.

`dirty=0` means only that Git porcelain was empty at the snapshot. It does not
prove ownership, absence of another process, valid tests, or permission to
write. Every non-current lane is `UNKNOWN` ownership unless separately leased.

## Register

| Worktree | Branch | HEAD | Dirty paths | Disposition |
|---|---|---:|---:|---|
| `~/VOLUME 3/ardesia` | `codex/ardesia-ops-headroom-20260701` | `8d340de1f026` | 127 | **DO NOT TOUCH** |
| `~/ardesia-wt/entitlement-ux` | `feat/entitlement-ux-fastapi-20260707` | `c8222aa3887e` | 0 | ownership UNKNOWN |
| `~/ardesia-wt/tutor-ux` | `p30/free-manipulation-trace-v0-20260709-185100` | `f63219758ab2` | 0 | PR #150 lane; no writes |
| `~/VOLUME 3/ardesia-board-payload.8aT4JT` | `test/sim-elab-v1-cap6-esp1-board-payload` | `1faf71d8c291` | 46 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-pr14-review.lvibbA` | `test/sim-elab-v1-cap6-esp1-adapter-contract` | `1655bdec0d9a` | 0 | review lineage; ownership UNKNOWN |
| `~/VOLUME 3/ardesia-pr15-review.8G6cpw` | detached | `f4f7c56e51c2` | 0 | detached review; no writes |
| `~/VOLUME 3/ardesia-wt-arduino15` | `feat/arduino-hex-esp5-20260715` | `755179c80766` | 3 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-wt-audit15` | `docs/product-readiness-20260715` | `602e278662d7` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-authoring` | `feat/officina-marketplace-fields-20260706` | `07781046169b` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-ci-fix` | `feat/elab-lab-montaggio-libero-componenti-20260706` | `21e0b1834bd7` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-codex-dashboard15` | detached | `deeb9934a09d` | 0 | detached review; no writes |
| `~/VOLUME 3/ardesia-wt-dash15` | `feat/teacher-dashboard-20260715` | `755179c80766` | 7 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-wt-elab-lab` | `feat/mistake-observed-emitter-20260706` | `541dfebb86c8` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-fastapi15` | `feat/entitlement-api-20260715` | `44f2e86ef606` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-lessonos-shell` | `feat/lessonos-shell-launcher-20260708` | `54332d283de0` | 10 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-wt-main` | `feat/lessonos-student-persistence-20260705` | `bbb9d803efec` | 0 | misleading name; not main; ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-merge-verify` | detached | `61c8a8b5d8ad` | 0 | detached verification; no writes |
| `~/VOLUME 3/ardesia-wt-notte10` | `feat/elab-entitlement-core-20260712` | `606c85a8923a` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte12` | `docs/handoff-notte14-20260714` | `e2f715e646b3` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte15` | `feat/multipin-scene-esp6-20260715` | `7ee5ff9ff46c` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte3` | `fix/toolhost-declared-honesty-20260706` | `ff6d0d0dc10a` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte5` | `feat/visualmatch-structural-grader-20260707` | `7974b80b645c` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte6` | `feat/toolhost-srcdoc-bypass-characterization-20260707` | `95c8c612dcc5` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte7` | `feat/plugin-bundle-integrity-20260708` | `287ba870e212` | 1 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-wt-notte8` | `feat/plugin-ripasso-graph-query-20260709` | `bfcf7d286f6d` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-notte9` | `feat/package-preview-integrity-20260710` | `e5671dc2de90` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-plugins15` | `feat/plugins-trio-20260715` | `755179c80766` | 4 | **DO NOT TOUCH** |
| `~/VOLUME 3/ardesia-wt-sera1` | `docs/corpus-reconcile-20260706` | `4c071b099be6` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-slice2` | `refactor/elab-amputation-slice2-20260705` | `95e97244adf1` | 0 | ownership UNKNOWN |
| `~/VOLUME 3/ardesia-wt-v1-baseline` | `codex/v1-repository-truth-20260710` | `cedfa932dc91` | 0 at lease start | **CURRENT WRITER: V1 docs only** |
| `~/VOLUME 3/wt-fable-notte11` | `test/ripasso-live-e2e-20260712` | `82ccffb4e9cd` | 0 | ownership UNKNOWN |

## Lane rules

1. Never clean, reset, stash, switch, delete, or reuse another worktree to make
   this register look tidy.
2. A new writer must receive an explicit path allowlist and named lease.
3. Compare branch, commit OID, staged hash, unstaged hash, untracked hashes, and
   upstream at start and end. A change makes the review stale.
4. Remove/prune worktrees only in a dedicated human-approved housekeeping task.
5. This register is a dated receipt; re-run it before every new write slice.
