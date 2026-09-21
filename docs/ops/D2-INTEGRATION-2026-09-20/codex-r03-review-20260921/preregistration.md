# R-03 independent review — preregistration, 2026-09-21

Owner's “vai” authorizes the independent R-03 review proposed after the local
patch, not another implementation or integration unit.

- Candidate: `ba9c3bdfe1b3218273dcf286e3c56723d204b707`.
- Base: `c54fa42c1bb34ac37374a5bb228d838b2b4409ec`.
- Evidence head: `8e4783fd3eb132baf84b0f6ce1baaf09455890de`; only checkpoint
  and browser probe were added after candidate. Main worktree initially clean.
- Reviewer workspace: `/Users/andreamarro/VOLUME 3/ardesia-codex-r03-review-20260921`,
  detached at candidate. Existing worktrees and previous receipts remain untouched.
- Class/risk: bounded product review; medium risk of wrong lesson attribution,
  stale export, or log handle lifecycle regression.
- Frozen oracle: exporting the selected lesson from RecapView passes current
  canonical memory to the existing scoped exporter; foreign/stale memory does
  not leak; empty and rejected live reads retain canonical semantics; a fresh
  handle is released on success and failure. Explicit historical export remains
  compatible. No global flush guarantee or persistence fallback redesign.
- Capability: fresh native Codex reviewer, requested `gpt-5.6-terra/high` under
  the applicable audit routing. Record actual runtime identity only if exposed,
  otherwise `inherited/unknown`; root is the builder and cannot self-approve.
- Reviewer inspects diff and causal callers before builder conclusions, runs
  focused tests/typecheck/build and one new falsification attempt. Preserve
  direct stdout/stderr, commands, exit codes, versions, source and hashes.
- Root's independent work: verify candidate/evidence identity and existing
  execution provenance, prepare append-only closeout and preserve raw evidence.
- Rollback: do not alter candidate code; preserve and then remove only own
  temporary probes. No reset/clean or weakening of tests/gates.
- STOP/REPAIR: reproduced defect means finding and REQUEST_CHANGES; incomplete
  evidence means REVIEW_INCOMPLETE. No silent repair during review.
- Non-goals: further product changes, R-04, Kirchhoff, publication, real pilot,
  provider calls, external memory or new/global dependencies.

Use persistent-capability-evolution for local preregistration and receipts only.
The current mandate overrides its external-vault preflight. No vault, Basic
Memory or AgentMemory probe/read/write. `INDEX_SYNC_DEFERRED`. Remove provider
credentials from every dependency installation and verification subprocess;
never print their values. Only locked project dependencies may be installed.

## Setup deviation recorded before delegation

The full worktree checkout failed with ENOSPC and Git automatically removed
the incomplete directory. A first no-checkout retry also failed before creation.
Root removed only this session's ignored, regenerable Studio dist and .vite
cache, preserving source and all test/review evidence. The subsequent sparse
checkout succeeded, including Studio, required plugin source, packages, bin
and scoped repository documentation, at the same candidate SHA; status is clean.
No unrelated worktree or personal file was removed.

To avoid duplicating dependencies on the nearly full disk, the reviewer worktree
links Studio node_modules to the builder's already installed dependencies.
The two committed lockfiles are byte-identical, SHA-256
`0f7c344b16bab89fb7312a4375533cc7f7715e217837a32cf165b1ee3ccf21d4`.
This is code/worktree/context isolation with shared installed dependencies,
not a fresh dependency installation. Do not run npm ci/install, change packages,
or delete anything through that shared link. Root will not run Studio in parallel.
