# ARDESIA — Full traceability matrix

Status: `G0_TRACEABILITY_VERIFIED_LOCAL`. The control is manual in this branch:
it is not yet wired into CI. This file does not certify any product requirement,
milestone, PR, deploy, or release.

## Frozen baseline

| Source | Approved SHA-256 | Logical lines | Matrix rows |
|---|---|---:|---:|
| Canon | `4a59deec58d0e1ca23720da3a958a6d30148e71224f4be15ebc18476ea86916b` | 6,939 | 6,939 |
| Addendum | `17000115531d1bacc62d06025f89a3bea5e1ac0342f364dd00ff8805e0186a50` | 174 | 174 |

The executable matrix is
[`ARDESIA-FULL-TRACEABILITY.jsonl`](ARDESIA-FULL-TRACEABILITY.jsonl). It has one
lossless source row for every line, including blank context rows, so an atomic
requirement cannot disappear through grouping. A nonblank row begins as
`UNKNOWN`; its `proof` field states the evidence that must exist before a
runtime claim can be promoted.

Every frozen line remains binding. If this index, the condensed executable
prompt, a PR, a test or a report omits or conflicts with a frozen line, the
frozen Canon/Addendum prevails and the conflict is `RED` until Andrea changes
the baseline explicitly.

## Mechanical gate

Run from the repository root:

```bash
node scripts/check-full-traceability.mjs
```

The local control rejects duplicate or missing IDs, an unexpected line count,
altered line content, or a mirror whose reconstructed hash differs from the
approved baseline. When the frozen attachments are available it compares every
matrix line to them; otherwise it still validates the committed lossless mirror
against the approved hashes. CI enforcement remains `UNKNOWN` until an
explicit, separately reviewed CI slice wires this command into the canonical
pipeline.

`--write` is deliberately local-only: it refuses to rewrite the matrix unless
both approved attachment hashes match. It is not a way to change the baseline.
Changing either hash, source, requirement text, or matrix generation policy
requires Andrea's explicit approval and a decision-log entry.

## Current interpretation rules

- The matrix is the denominator for `FULL_GOAL_GREEN`; no source line is
  omitted because it is inconvenient, duplicated, or called "fundamental".
- `G0_TRACEABILITY_VERIFIED_LOCAL` means the source denominator is mechanically
  complete under the local command. It is not `GREEN_SLICE`: independent
  review, CI enforcement and human merge still apply.
- `UNKNOWN`, `RED`, `BLOCKED`, `DEFERRED` and `LATER` remain open denominator
  states. They cannot be silently converted into product completion.
- The published goal in PR #173 is a clean, CI-green document candidate. It is
  not merged and it does not make later product PRs integrated evidence.
