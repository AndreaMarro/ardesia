# ARDESIA V1 — loop rewrite report

Date: 2026-07-11. Scope: first read-only macrophase after the independently
reviewed goal published in PR #173. This report records a correction to the
control plane, not product completion.

## Verdict

The previous executable prompt was useful as historical evidence but was stale:
it named `origin/main@9b7342fc`, while the observed canonical head is now
`91ec22ed`; it described older PR #150/#163 conditions; and its traceability
index did not satisfy the new mandate's complete-denominator rule. The revised
prompt preserves the ambition while making the next action falsifiable.

Result: `G0_TRACEABILITY_VERIFIED_LOCAL` for frozen-source coverage and basic
local secret scan only. The validator is not CI-enforced. `V1_GREEN`, product
security, ToolHost compliance, book fidelity, graph retrieval, artifact
generation and deploy proof remain open.

## What changed

| Change | Why | Risk reduced |
|---|---|---|
| Added lossless JSONL traceability mirror and validator | The old seed had a few grouped milestones, not one source unit per frozen-line denominator | omission, duplicate or altered mandate text |
| Updated reality gate to `origin/main@91ec22ed` and PRs #170–#174 | Older SHA/PR facts were stale | executing against obsolete topology |
| Separated scanner success from RLS/sandbox/deploy/history claims | A local secret scan cannot prove backend security | false `SECURITY_GREEN` |
| Recorded real ToolHost bypasses in the M0 WIP | A global event and swallowed append failure evade the declared contract | fake integration and a second control plane |
| Narrowed next work to review/reshape before M0 implementation | The working M0 UI lacks its required browser/architecture gate | compounding an unverified surface |

## Runtime and tool applicability

| Requirement | Actual enforcement in this run | Limit |
|---|---|---|
| Frozen source integrity | Local `node scripts/check-full-traceability.mjs` checks 7,113 lossless rows and both approved SHA-256 values | It is not wired into CI yet; external source paths are local |
| Worktree isolation | Isolated branch `codex/g0-traceability-20260711` has a clean base stacked on #173 | Its own five-file diff is intentionally uncommitted; other worktrees remain dirty and unowned |
| Current working-tree secrets | `python3 bin/ci/secret_scan.py` covers tracked files; the three untracked additions receive the explicit path scan below | Does not prove key rotation, RLS, CSP or provider setup |
| Recent history secrets | 20 commits / 77 changed text blobs: zero high-confidence secret shapes | This is a bounded recent-history sample, not a lifetime attestation |
| A7 independence | Required before this document slice can become `GREEN_SLICE` | Review has not yet run |
| Claude hooks/skills/agents | Repository files may exist | Their runtime execution is not inferred in Codex Desktop |

The reproducible untracked-path scan for this five-file slice is:

```bash
matches=$(rg -l \
  -e '-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----' \
  -e 'AKIA[0-9A-Z]{16}' \
  -e 'gh[pousr]_[A-Za-z0-9]{36,}' \
  -e 'xox[baprs]-[A-Za-z0-9-]{10,}' \
  -e 'sk-[A-Za-z0-9_-]{32,}' \
  -e 'sk_live_[A-Za-z0-9]{16,}' \
  -e 'AIza[0-9A-Za-z_-]{35}' \
  docs/ops/ARDESIA-FULL-TRACEABILITY.jsonl \
  docs/ops/ARDESIA-FULL-TRACEABILITY.md \
  scripts/check-full-traceability.mjs)
scan_rc=$?
if [ "$scan_rc" -eq 1 ]; then
  echo 'untracked_slice_secret_scan=OK'
elif [ "$scan_rc" -eq 0 ]; then
  printf 'untracked_slice_secret_paths=%s\n' "$(printf '%s\n' "$matches" | wc -l | tr -d ' ')"
  exit 1
else
  exit "$scan_rc"
fi
```

Observed result: `untracked_slice_secret_scan=OK` (zero exit). The two modified
tracked documents are covered by the regular tracked-file scanner. This is
evidence for this slice only, not a replacement for CI secret enforcement.

## Fundamental requirement preservation

| Requirement | Preserved in executable loop | Enforcement now | Residual risk |
|---|---:|---|---|
| Principio Zero and teacher centrality | yes | canon + prompt + future acceptance review | runtime conformance RED/UNKNOWN |
| Book semantic/topology/visual/temporal parity | yes | per-experiment matrix and certification gate | zero real certified experiment |
| One SimulationScene; mounted/steps equality | yes | architecture invariant + test gate | implementation not certified |
| Typed AI circuit actions | yes | contract/release gate | incomplete runtime evidence |
| Public ToolHost/plugin capabilities | yes | invariant + A7 bypass review | M0 global event is RED |
| LessonOS → graph → tutor → artifact chain | yes | first-failed-boundary integration iteration | local persistence only candidate evidence |
| Knowledge Cards, creator and composition | yes | M1/M6 gated roadmap | not yet proven |
| UI quality, touch, iPad and LIM | yes | browser/M0 protocol + Andrea review | current UI remains RED |
| Security, GDPR, RLS and deploy SHA | yes | G0/M5/release gates | partial scan only |
| Full goal denominator and honest stop | yes | lossless matrix + terminal states | no product rows are GREEN |

## Next prompt

Do not start a new session merely to restate the goal. Continue from this clean
G0 branch, obtain independent review and CI, then retain human ownership of the
#171/#172 merge decisions. Only after that re-gate the M0 candidate and select
one visible, contract-compliant teacher-surface slice. The first broken
LessonOS boundary remains the retrieval/artifact side, not a reason to build a
parallel graph or tutor implementation.
