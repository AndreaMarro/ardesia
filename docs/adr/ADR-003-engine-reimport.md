# ADR-003: Resolve the ARDESIA monorepo engine drift (re-import vs submodule/symlink)

## Status

Proposed (re-import = gate-Andrea)

Date: 2026-06-25

## Context

The WF1 read-only audit established the canonical-repo topology:

- **ardesia** is the CANONICAL monorepo / platform hub (engine + studio + tools +
  docs nav). Its origin is GitHub directly (`AndreaMarro/ardesia`), unlike the
  other code repos.
- **lessonos** is the CANONICAL headless teaching engine ("fabbrica"), default
  branch `auto/main` (GitHub HEAD `20560ec`).

A guard branch on ardesia, **`ci/engine-sync-guard`** (audit ref `@6c9e73bd`),
detected that the engine vendored inside the monorepo (`packages/engine`) has
**drifted from the canonical lessonos `auto/main`** — a 22-file ACTIVE drift.
The audit also CONFIRMED that `ci/engine-sync-guard` is **local-only on the
mac-mini** (`gh api` returns "Branch not found"; 404). The drift exists because
the monorepo carries a point-in-time copy of the engine rather than tracking
lessonos by reference, and because lessonos itself lags GitHub via the
local-bare-origin lineage trap.

The drift carries a real schema/runtime hazard: the engine has moved through
schema migrations (referenced as **v10 → v12**) and a storage backend change
(**libSQL**, per prior ARDESIA work). A stale vendored engine in the monorepo can
diverge in schema expectations and store backend from the canonical engine,
producing silent incompatibilities when the monorepo path is exercised.

Evidence boundary: the audit reports the **22-file drift count** and that the
guard branch is local-only. It did **not** enumerate which 22 files differ, nor
verify the exact schema versions/backend at each side this pass — the v10→v12 and
libSQL specifics come from the surrounding ARDESIA context and must be confirmed
firsthand against both trees before executing a re-import.

## Decision Drivers

- **Single source of truth for the engine** — the monorepo must not carry a
  divergent second copy that drifts.
- **Schema/backend correctness** — avoid v10↔v12 and store-backend mismatches.
- **Maintainability** — minimize the recurring cost of keeping the monorepo's
  engine current.
- **History/bootstrap-additive** — ardesia is documented as history-preserved,
  bootstrap-additive; the resolution should respect that.

## Considered Options

### Option 1: Re-import `packages/engine` from `lessonos@auto/main` (vendored snapshot)

- **Pros**: Simple, self-contained monorepo; no external fetch needed to build;
  matches the existing vendored model.
- **Cons**: Re-introduces the **same drift problem** over time — a snapshot goes
  stale the moment lessonos advances; requires a repeatable re-import process and
  the `engine-sync-guard` CI check to catch future drift; a one-shot re-import
  must pin a known-good lessonos SHA and reconcile schema v10→v12 + libSQL.

### Option 2: Replace the vendored copy with a git submodule pointing at lessonos

- **Pros**: The engine is tracked **by reference** at an explicit commit; drift
  becomes visible as a submodule pointer bump; no silent divergence.
- **Cons**: Submodule UX friction (clone/update ergonomics, CI checkout config);
  lessonos' canonical line is `auto/main` whose origin is a **local bare repo** —
  a public submodule must point at the GitHub mirror, which lags by design until
  pushed; contributors must have access.

### Option 3: Symlink `packages/engine` to a local lessonos checkout

- **Pros**: Zero-copy, always reflects the local engine.
- **Cons**: **Not portable** — a symlink to a machine-local path does not survive
  clone on another machine or in CI; breaks the monorepo's self-containedness;
  unsuitable as a durable answer.

## Decision

Adopt a **two-part decision**:

1. **Immediate (gate-Andrea): re-import** `packages/engine` from a pinned
   `lessonos@auto/main` SHA (Option 1) to clear the current 22-file ACTIVE drift,
   reconciling schema v10→v12 and the libSQL backend, and **keep
   `ci/engine-sync-guard` as the standing drift detector** (push it to GitHub so
   the check runs on the canonical CI).
2. **Direction-of-travel (deferred): evaluate migrating to a submodule**
   (Option 2) once lessonos' GitHub mirror is the reliable reference, to make
   drift structurally impossible rather than CI-detected.

Symlink (Option 3) is rejected outright as non-portable.

The re-import itself is **gate-Andrea**: it mutates the canonical monorepo engine
and carries schema/backend reconciliation risk.

## Consequences

### Positive

- The 22-file ACTIVE drift is cleared; the monorepo engine matches a known-good
  lessonos SHA with reconciled schema (v10→v12) and backend (libSQL).
- `ci/engine-sync-guard` remains as a guardrail that surfaces future drift.

### Negative

- A vendored re-import **will drift again** as lessonos advances; this option
  treats the symptom and relies on the guard + a repeatable re-import to manage
  recurrence (hence the deferred submodule evaluation).
- Re-import requires firsthand schema/backend reconciliation; getting v10→v12 or
  libSQL wrong risks runtime incompatibility on the monorepo path.

### Risks / Mitigations

- **Risk**: re-importing an unpushed/stale lessonos line (local-bare lineage).
  **Mitigation**: pin a specific lessonos SHA that is on the GitHub mirror, not
  only on the local bare repo.
- **Risk**: schema/backend specifics (v10→v12, libSQL) assumed rather than
  verified. **Mitigation**: confirm both trees' schema version and store backend
  firsthand before executing.
- **Risk**: guard branch is local-only → the drift check doesn't run on CI.
  **Mitigation**: push `ci/engine-sync-guard` to GitHub.

## Implementation Notes (gate-Andrea)

1. Enumerate the 22 drifted files firsthand; confirm schema version and store
   backend on both `packages/engine` and `lessonos@auto/main`.
2. Pin the target lessonos SHA (must exist on the GitHub mirror).
3. Re-import `packages/engine` at that SHA; reconcile schema v10→v12 and libSQL.
4. Push `ci/engine-sync-guard` (local-only `@6c9e73bd`) to GitHub so the drift
   check runs on canonical CI.
5. Schedule the submodule-migration evaluation as a follow-up.

## Alternatives

See Considered Options. Submodule deferred (kept as direction-of-travel);
symlink rejected as non-portable.

## Related Decisions

- ADR-001 (arm strict auth) and ADR-002 (MCP host wiring) — same local-bare-origin
  lineage trap as the underlying cause of GitHub lag.

## References

- WF1 audit evidence: GitHub deep audit — `ci/engine-sync-guard` CONFIRMED
  local-only (gh api "Branch not found") and reporting a 22-file ACTIVE engine
  drift between the monorepo `packages/engine` and canonical lessonos
  `auto/main`; ardesia origin = GitHub directly; lessonos origin = local bare
  `/Users/progettibelli/lessonos.git`.


## Provenance note (resolves A2 nit)
SHA `6c9e73bd` on branch `ci/engine-sync-guard` is verified in this session’s `QA-GATE-2026-06-25.md` (vault, A2 PASS-WITH-NITS: drift-guard that surfaced the 22-file active engine drift). The WF1 GitHub audit confirmed the branch is **local-only on the mini**; SHA source = session build/qa-gate, not the GitHub audit.
