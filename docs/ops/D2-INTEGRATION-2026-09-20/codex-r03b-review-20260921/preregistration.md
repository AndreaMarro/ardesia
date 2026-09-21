# R-03b independent review — preregistration, 2026-09-21

Owner's “vai” authorizes the next independent review proposed after R-03b.
It does not authorize another product patch, integration or publication.

- Candidate: `a90d3563014c5cd995630a37ea164f42f4c40b9c`.
- Base: `b76611be7bcfd738d31c9b845a6be1acd95ded74`.
- Evidence head: `54635723e61fac72e7f7727e9a29e0fb33541660`; only checkpoint
  and browser probe were added after candidate. Coordinator worktree clean.
- Reviewer checkout: `/Users/andreamarro/VOLUME 3/ardesia-codex-r03b-review-20260921`,
  detached at candidate, sparse with Studio and its required source/pack inputs.
- Class/risk: bounded product review; medium risk of silent memory omission,
  leaked persistent handles or changed valid-export behavior.
- Frozen oracle: unavailable/unopenable persistent memory must show an error,
  produce no download and allow retry; opened handles must be closed even when
  acquisition/read fails. Real persistent empty memory remains authoritative;
  current and historical explicit export semantics and lesson scope remain valid.
- Capability: fresh native Codex reviewer, new context; requested audit routing
  `gpt-5.6-terra/high` under applicable global instructions. Actual model/effort
  only if exposed, otherwise `inherited/unknown`. Root authored the patch and
  cannot supply its independent approval.
- Reviewer reads code/diff and causal contracts before builder conclusions,
  runs focused regressions, typecheck/build and a new falsification attempt.
  Preserve direct logs, commands, exit codes, versions, probe source and hashes.
- Root concurrently verifies existing evidence provenance and candidate identity,
  prepares append-only closeout; does not run Studio through shared dependencies.
- Installed dependencies are shared by symlink with the coordinator worktree;
  lockfiles must match. No install/update/delete through this link. Isolation is
  agent/context/source, not a separate platform or dependency installation.
- Rollback: no candidate edits; preserve and remove only own temporary probes.
  No reset/clean, gate weakening or silent repair during review.
- STOP/REPAIR: reproduced relevant defect → REQUEST_CHANGES with evidence;
  insufficient evidence → REVIEW_INCOMPLETE. Otherwise bounded APPROVE.
- Non-goals: R-04, changes to other fallback callers, global integrity/recovery,
  Engine, Kirchhoff, live provider/pilot, external memory, push/merge/deploy.

Use persistent-capability-evolution for local preregistration and receipt only.
The current mandate overrides external-vault preflight. No vault, Basic Memory
or AgentMemory reads/writes; `INDEX_SYNC_DEFERRED`. All verification subprocesses
remove provider credentials without printing values. Old receipts remain frozen.
