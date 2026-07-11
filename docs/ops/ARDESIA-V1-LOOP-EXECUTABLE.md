# ARDESIA V1 — executable convergence loop

Version: 2026-07-11. Scope: re-gate, one bounded slice, independent review and
evidence. This prompt is a control plane, not a V1 certificate.

## Frozen mandate and evidence language

The immutable baseline is the Canon
`4a59deec58d0e1ca23720da3a958a6d30148e71224f4be15ebc18476ea86916b` plus the
Addendum `17000115531d1bacc62d06025f89a3bea5e1ac0342f364dd00ff8805e0186a50`.
Their line-level denominator is checked by
`node scripts/check-full-traceability.mjs`.

Every frozen source line remains binding. This condensed operational prompt is
only an execution aid: if it omits or conflicts with the frozen Canon/Addendum,
the frozen source prevails and the conflict is `RED` until Andrea approves a
baseline change.

Every claim is exactly one of `VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`,
`RED`, `DEFERRED`, `BLOCKED` or `GREEN_CANDIDATE`. Evidence names the command,
SHA, date, runtime and limit. A CI check, unit test, screenshot or HTTP 200 is
not by itself end-to-end product proof.

## Current reality gate — observed 2026-07-11

- `origin/main` is `91ec22ed`; PR #170 is merged.
- PR #171, #172, #173 and #174 are open, clean and CI-green at the observed
  time. They are `GREEN_CANDIDATE`, not integrated slices. Merge remains human.
- The shared checkout is dirty and not a write lane. This G0 branch is an
  isolated worktree with a clean base stacked on PR #173; its own five-file
  documentation diff is intentionally uncommitted. Do not recover, delete or fold in other
  worktrees' tracked asset deletions without their owner.
- The tracked working-tree secret scan found no high-confidence pattern. A
  separate path scan covered this slice's three untracked files, and a targeted
  scan of 77 changed text blobs across the last 20 `origin/main` commits found
  none. RLS, provider rotation/history beyond that sample, sandbox/CSP and
  deploy proof remain `UNKNOWN`, not security green.
- No privileged `VITE_*` key/token/secret reference was found in Studio source;
  tracked `.env` paths are examples only.
- The simulation ToolHost has public `board.write` and `lesson.event.emit`
  capability paths, but the M0 WIP still contains a global
  `elab-component-selected` browser event and Room currently swallows a LessonOS
  append failure. Both are `ARCHITECTURE_RED` for that WIP.
- P38's open PR adds browser evidence for local IndexedDB persistence of
  simulation events. It is not a graph-to-tutor-to-artifact proof and it is not
  merged.
- Principio Zero's authentic semantic core is recovered in
  `V1-PRINCIPIO-ZERO-CANON.md`; runtime compliance, real book certification and
  tutor end-to-end behavior remain `RED`/`UNKNOWN`.

## Non-negotiable invariants

1. `SimulationScene` is domain truth; DOM/SVG are renderers.
2. Mounted and step-by-step modes derive from one scene/typed operations and
   must reduce to the same scene and netlist.
3. Manual and AI actions use typed, reversible, permission-checked, auditable
   commands. AI never uses DOM/SVG as circuit truth.
4. Plugin reuse crosses only public capabilities/contracts; no private import,
   implicit permission, global browser event or dependency cycle.
5. LessonOS is append-only, ordered, idempotent and replayable. One vertical
   action must cross user action → domain → plugin → log → graph → grounded
   tutor → cited artifact → export/reopen, stopping at the first `RED`.
6. Principio Zero keeps the teacher, real kit and book evidence central. There
   is no silent correction or generic answer where canon exists.
7. UI is teacher-first, touch-first, accessible and token-based. A UI claim
   needs real browser pointer/touch, desktop+iPad screenshots, empty
   console/network errors, focus/touch evidence and persistence where relevant.
8. Security, GDPR and minors outrank feature throughput; no privileged client
   key, auto-merge, force push, destructive reset/clean or production deploy.

## Operating rules

- A0 owns integration and critical path; one writer owns each file; A7 reviews
  read-only. Default is A0 + one writer + one reviewer.
- One feature, branch and PR; maximum five files unless its short brief records
  why a broader atomic scope is unavoidable.
- No more than one invisible slice in sequence. After three local slices in a
  subsystem, run an integration iteration rather than a fourth local feature.
- Reuse in order: monorepo/worktrees, existing public API/assets/tests, then at
  most three audited external candidates. No new dependency without a measured
  bottleneck, license/security review and rollback owner.

## Slice protocol

1. **Re-gate.** Record SHA, branch, dirty paths, worktrees, processes, PR/CI,
   secrets, client env boundary and known bypasses.
2. **Select.** Score at most three slices by visible teacher value, unblock
   power, verifiability, integration leverage, regression risk, unresolved
   dependency and merge risk.
3. **Brief/TDD.** Write a one-page contract: before/after, owner and ≤5 files,
   public contract/direction, reuse, falsifiable acceptance, test, risk,
   rollback and explicit non-goals.
4. **Implement.** Minimal complete change only: no second source of truth,
   silent fallback, unrelated refactor or unreviewed framework.
5. **Verify.** Focused test, typecheck, lint/build appropriate to risk,
   persistence/reopen, real pointer/touch, console/network, accessibility,
   security/dependency scan and deploy smoke where applicable.
6. **Review.** A7 attempts to falsify the claim: bypass, race, error swallowing,
   duplicate state, wrong book fidelity, fake gesture, claim inflation and
   runtime/SHA mismatch.
7. **Integrate or stop.** Only independent review, CI and human merge turn a
   candidate into `GREEN_SLICE`. Otherwise record `HONEST_RED`,
   `SECURITY_RED`, `ARCHITECTURE_RED`, `ENVIRONMENT_RED`, `BLOCKED_EXTERNAL` or
   `STOP` with the first failed boundary and next experiment.

## Mandatory next sequence

1. Finish and independently review this G0 traceability/prompt correction; do
   not call it integrated until PR/CI/human merge. Its validator is a local
   control, not a CI hook; CI wiring needs its own reviewed slice.
2. Preserve the human merge/reject decision for #171 and #172. Their current CI
   does not replace a scope or architecture review.
3. Review/reshape or reject the b-bis palette WIP: it exceeds the five-file
   default, touches plugin internals and exposes raw-color/registry risk.
4. Re-gate the M0 worktree. The first code slice is a single visible teacher
   surface with no global-event bypass and no duplicated simulation state. It
   must pass the full M0 browser gate before any UI-green claim.
5. After the two required visible UX slices, take the LED spine only to its
   first failed boundary. Today that boundary is after local persistence, before
   grounded tutor retrieval/cited artifact proof.

## Release truth

`V1_GREEN` needs a deployed teacher journey, a certified LED experiment,
Principio Zero, ToolHost contracts, LessonOS/graph/tutor/artifact/export,
security/RLS, iPad/LIM, CI/deploy SHA and Andrea's unaided protocol. The larger
goal remains open until every source-matrix row is GREEN and the golden journey
works on desktop, iPad and LIM. Do not use “parity”, “production-ready”,
“robust”, “perfect” or “finished” without evidence of that same breadth.
