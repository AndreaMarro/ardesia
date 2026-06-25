# ADR-001: Arm `LESSONOS_AUTH_STRICT=1` (fail-closed auth validator)

## Status

Proposed (ARM = gate-Andrea)

Date: 2026-06-25

## Context

The WF1 read-only evidence audit (GitHub deep audit + ELAB/Vercel triage)
established the following facts relevant to authentication posture:

- The lessonos teaching engine (the canonical "fabbrica") runs on default
  branch `auto/main` (GitHub HEAD `20560ec`), which has **no branch protection**
  (the protection API returns HTTP 404 for `lessonos/auto/main`). 5 of 7 default
  branches are unprotected, including `ardesia/main`.
- A flag-gated auth validator exists on the local-only branch
  **`fix/auth-validator-flag-gated`** (lessonos). The GitHub deep audit
  **CONFIRMED this branch is local-only on the mac-mini** — `gh api` returns
  "Branch not found" (404). It has never been pushed to GitHub.
- Root cause of the GitHub lag is independently confirmed: lessonos' origin is a
  **local bare repo** (`/Users/progettibelli/lessonos.git`), with GitHub only a
  secondary push remote. Factory commits accumulate on the bare repo and GitHub
  stays behind unless explicitly pushed.

The validator is **flag-gated**: it only enforces when `LESSONOS_AUTH_STRICT=1`.
Today the served door is effectively open because the flag is not armed. The
risk surface of arming it is the standard fail-closed risk: if the auth secret
is empty/unset when strict mode is on, every request fails closed (service
becomes unreachable rather than open).

Note on evidence boundaries: the WF1 audit names the branch
`fix/auth-validator-flag-gated@9be3632` as the carrier of the flag-gated
validator and confirms it is local-only. The audit did **not** open the diff to
enumerate the exact secret env-var name or the precise empty-secret code path —
those specifics are stated here at the level the evidence supports and should be
verified firsthand before arming.

## Decision Drivers

- **Close the confirmed open-door** on the served auth path.
- **Reversibility** — a single env flag, trivially flippable back to `0`.
- **Fail-closed correctness** — strict mode must reject rather than admit on a
  missing/empty secret.
- **Durability** — the fix must reach GitHub, not live only on the local bare repo.

## Considered Options

### Option 1: Arm `LESSONOS_AUTH_STRICT=1` (this ADR)

- **Pros**: The validator already exists (no new code to write); the flag is the
  only lever; reversible by flipping back to `0`; fail-closed is the safe default
  for an auth gate.
- **Cons**: If the secret is empty/unset, strict mode fails closed and takes the
  served path down until the secret is provisioned; the branch is local-only so a
  push/merge is a prerequisite for the change to be durable.

### Option 2: Leave the flag unset (status quo)

- **Pros**: No risk of a fail-closed outage.
- **Cons**: Leaves the confirmed open-door in place on an unprotected default
  branch — an unacceptable standing risk for an auth gate.

### Option 3: Make strict mode the hardcoded default (remove the flag)

- **Pros**: No way to accidentally run open.
- **Cons**: Removes the reversibility that makes arming safe; higher-blast-radius
  change; not supported by current evidence (the validator is shipped as
  flag-gated, not default-on).

## Decision

Adopt **Option 1**: arm `LESSONOS_AUTH_STRICT=1` on the served lessonos path,
**gated on Andrea** and **preconditioned** on (a) pushing/merging
`fix/auth-validator-flag-gated` so the validator is durable on GitHub, and
(b) firsthand verification that the auth secret is provisioned and non-empty so
fail-closed does not cause an outage.

## Consequences

### Positive

- The confirmed open-door on the served auth path is closed.
- Fail-closed posture: a missing secret denies access rather than granting it.
- Reversible via a single env flag.

### Negative

- If the secret is empty/unset at arm time, strict mode fails closed and the
  served path becomes unreachable until the secret is provisioned.
- The carrier branch is local-only; without a push/merge the change does not
  survive on GitHub and is dead-code for the served path (consistent with the
  WF1-documented "local-bare-origin lineage trap").

### Risks / Mitigations

- **Risk**: empty-secret → fail-closed outage. **Mitigation**: verify the secret
  is set and non-empty before arming; keep a rollback (`LESSONOS_AUTH_STRICT=0`)
  one flip away.
- **Risk**: arming on an unprotected default branch leaves no guardrail against a
  force-push reverting it. **Mitigation**: pair with branch protection on
  `lessonos/auto/main` (a separate WF1 gate item).

## Implementation Notes (gate-Andrea precondition checklist)

1. Push `fix/auth-validator-flag-gated` (local-only `@9be3632`) to GitHub.
2. Verify firsthand the auth secret is provisioned and non-empty on the served
   environment (do not print the value).
3. Set `LESSONOS_AUTH_STRICT=1` on the served path; confirm authorized requests
   pass and unauthorized requests are rejected.
4. Keep `=0` rollback ready.

## Alternatives

See Considered Options (status quo; hardcoded default). Both rejected — status
quo leaves the open-door; hardcoded default sacrifices the reversibility that
makes arming safe.

## Related Decisions

- ADR-002 (MCP host wiring) — companion local-only lessonos branch with the same
  push/durability precondition.
- ADR-003 (engine re-import) — same local-bare-origin lineage trap as root cause.

## References

- WF1 audit evidence: GitHub deep audit — `fix/auth-validator-flag-gated`
  CONFIRMED local-only (gh api "Branch not found"); `lessonos/auto/main`
  unprotected (protection API 404); local-bare origin
  `/Users/progettibelli/lessonos.git`.
