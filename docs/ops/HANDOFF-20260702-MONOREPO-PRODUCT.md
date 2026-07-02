# HANDOFF 2026-07-02 - Monorepo + Product

Mode: bounded Codex coordinator pass with three read-only lanes plus one isolated
worktree product micro-slice. No push, merge, deploy, service restart, launchd
edit, reset, clean, or factory reactivation.

## Current Safety State

- Local Codex automation `ardesia-factory-audit-and-concrete-progress` is
  `PAUSED`.
- Mini `launchctl` filtered sample does not show `com.elab.lessonos-hourly`.
- STOP had a hazard during this pass: a read-only-looking SSH probe launched
  `bash eval/gate.sh` and `uv run pytest -q --no-header` under `~/lessonos` as
  PID `7888` in the first process sample. A later process-only sample no longer
  showed `eval/gate`, `uv run pytest`, or `pytest -q`.
- Do not start another factory gate. Future STOP probes must use process checks
  only and must not compute `GATE=$(bash eval/gate.sh ...)`.
- AgentMemory `/agentmemory/livez` is OK locally and on the Mini, but keep it
  as cache/watch because `com.elab.agentmemory` still reports launchd status
  `-9` and high RSS.
- Headroom is healthy, ready, version `0.27.0`; the `8787` Headroom/broker port
  ambiguity remains.

## PR Queue Snapshot

Verified with `gh pr list/view` on 2026-07-02:

- #19 open, clean, base `main`.
- #24 open, clean, base `main`.
- #30 open, clean, base `feat/lessonos-eventlog-microslice-20260702`; do not
  update as if #24 landed.
- #31 open, clean, base `feat/elab-v1-cap6-esp1-book-topology`; do not update
  as if #19 landed.
- #23 open, clean; not remeasured by instruction.
- #27 open draft, clean; not touched by instruction.

## Worktree Output

Worktree:

```text
/private/tmp/ardesia-monorepo-product-handoff-20260702-2345
```

Branch:

```text
codex/monorepo-product-handoff-20260702-2345
```

Micro-slice implemented:

- Reference Plugin manifest now declares `contract: ">=1.0 <2.0"`.
- Reference Sim manifest now declares the same SDK contract range.
- Reference Sim bundler now preserves that contract field when regenerating the
  manifest.
- `SdkContract.compat.test.ts` now fails if either reference tool stops
  declaring a range satisfied by the current `CONTRACT_VERSION`.

Files changed:

- `apps/studio/plugins/reference/manifest.ts`
- `apps/studio/sim/manifest-source.json`
- `apps/studio/sim/bundle.ts`
- `apps/studio/src/__tests__/SdkContract.compat.test.ts`
- `docs/ops/HANDOFF-20260702-MONOREPO-PRODUCT.md`

## Monorepo Decision

Treat the current repository as a physical monorepo but not yet a ratified
cutover. Target ownership stays:

- `packages/engine`: deterministic LessonOS engine and projections.
- `apps/studio`: runnable board app and ToolHost host.
- `plugins/elab-tutor`: temporary lineage/quarantine until plugin extraction.
- `ops/tools`: factory-only tooling, not user product.
- `docs`: SoT, ops handoffs, maps.

Root command surface is already represented by PR #17. Do not mix it with
product slices. Next monorepo PR should either ratify #17 or create a separate
boundary guard; do not move directories or repoint the Mini factory in the same
slice.

## Memory Strategy

Keep Markdown + git as the source-of-truth baseline. Do not replace AgentMemory
in place. Shadow Hindsight, TencentDB-Agent-Memory, or Supermemory only after
explicit Andrea approval, with synthetic fixtures only, no live hooks, no real
transcripts, and hard timeouts/export evidence.

## Update 2026-07-03 00:47 CEST - Six-Agent COV

Mode: coordinator plus six subagents. No push, merge, deploy, service restart,
launchd edit, process kill, reset, clean, or factory reactivation.

Executive status:

- Factory STOP is still clean: `com.elab.lessonos-hourly` absent from filtered
  Mini launchctl, and no `hourly-tick|driver-orch|eval/gate|uv run pytest|pytest -q`
  rows in filtered process samples.
- AgentMemory `/agentmemory/livez` is OK locally and on Mini, but treat it as
  degraded cache/watch: local `3111` is a tunnel to Mini, launchd status remains
  `-9`, `/health` was unstable, `/export` timed out, and RSS was high.
- Headroom is healthy on Mini `127.0.0.1:8787`, version `0.27.0`, with memory
  backend disabled.
- ARDESIA PRs #17/#19/#23/#24/#27/#30/#31/#32 are open and merge-clean in the
  sampled `gh pr view` results; #27 and #32 are drafts. `statusCheckRollup` was
  empty, so CI green is not claimed from GitHub.
- #17 should be treated as conditional, not blindly ratified: no checks reported,
  local dirty root-command files differ, and `factory:readonly` should include
  full STOP-safe launchctl plus broad process filters.
- #19 is a 6-file slice and overlaps #31 on `apps/studio/sim/elab/fixtureAdapter.ts`;
  sequence #19 before #31 or explicitly approve the max-5 exception.
- Product SDK contract slice is valid in the worktree. Product lane reported the
  standard targeted Studio tests, typecheck, and `git diff --check` passing.
- Coordinator also observed one Vitest `forks` worker startup timeout, then a
  diagnostic retry with `--pool=threads --maxWorkers=1` passed: 2 files, 27 tests.
- Full factory/Mini gate was not run by design.

Six-agent table:

| Agent | Status | Files / tests |
|---|---|---|
| OPS | STOP clean locally and on Mini; no dangerous `eval/gate.sh` probe confirmed in sampled files. | No writes; operational checks only. |
| Memory | AgentMemory livez OK but degraded; Headroom healthy with memory disabled. | No writes; no shadow install. |
| Monorepo | #17 open/clean but conditional; root commands should be amended or replaced from clean `origin/main`. | No writes; `bash -n bin/monorepo.sh`, status, diff-check. |
| Product A | Existing SDK contract slice verified; no extra hardening slice added. | 5-file slice; targeted Studio tests/typecheck/diff-check. |
| Product B | Coordinator PR COV supersedes one out-of-scope subagent result that inspected `elab-tutor`. | No #23 remeasure; #27 metadata only. |
| QA | Confirmed no gate weakening, fake product data, #23/#27 mutation, or file overlap in handoff slice. | No writes; recommends updating this handoff only. |

Files changed in this worktree remain:

- `apps/studio/plugins/reference/manifest.ts`
- `apps/studio/sim/manifest-source.json`
- `apps/studio/sim/bundle.ts`
- `apps/studio/src/__tests__/SdkContract.compat.test.ts`
- `docs/ops/HANDOFF-20260702-MONOREPO-PRODUCT.md`

Coordinator commands:

```bash
gh auth status
gh pr view 17/19/23/24/27/30/31/32 --repo AndreaMarro/ardesia --json ...
git status -sb
git log --oneline -5
git diff --stat
git diff --name-only
curl --max-time 5 -fsS http://127.0.0.1:3111/agentmemory/livez
ssh macmini 'date; launchctl list | grep -iE "..."; ps aux | grep -iE "..."'
ssh macmini 'curl --max-time 5 -fsS http://127.0.0.1:3111/agentmemory/livez; curl --max-time 5 -fsS http://127.0.0.1:8787/health; launchctl list | grep -i agentmemory; ps -o ...'
npm --prefix apps/studio test -- SdkContract.compat.test.ts ToolReferenceSim.test.ts
npm --prefix apps/studio test -- SdkContract.compat.test.ts ToolReferenceSim.test.ts --pool=threads --maxWorkers=1
npm --prefix apps/studio run typecheck
git diff --check
```

Validation:

- `git diff --check`: passed.
- Product lane: `npm --prefix apps/studio test -- SdkContract.compat.test.ts ToolReferenceSim.test.ts`: passed, 2 files / 27 tests.
- Product lane: `npm --prefix apps/studio run typecheck`: passed.
- Coordinator diagnostic: `npm --prefix apps/studio test -- SdkContract.compat.test.ts ToolReferenceSim.test.ts --pool=threads --maxWorkers=1`: passed, 2 files / 27 tests.
- Coordinator standard Vitest run: failed before running tests because the
  default `forks` worker pool timed out.
- Full gate: not run.

Andrea gates:

1. Approve whether to amend/replace PR #17 with full STOP-safe
   `factory:readonly` and current queue context.
2. Approve whether #19's 6-file slice is acceptable or must be split.
3. Sequence #19 before #31 because they overlap on `fixtureAdapter.ts`.
4. Approve whether to include this handoff doc in the product SDK contract PR.
5. Approve any AgentMemory maintenance window or shadow memory adapter PR.
6. Keep factory STOP active unless Andrea explicitly re-enables it.

## Next Session Prompt

Read `AGENTS.md`, `ardesia/AGENTS.md`, `docs/vault/ARDESIA-MAP.md`,
`docs/ops/FACTORY-LIVE-STATUS.md`, this handoff, and
`/private/tmp/ardesia-memory-eval-20260703/docs/ops/FACTORY-MEMORY-REPLACEMENT-EVAL-20260703.md`.

First verify STOP without running `eval/gate.sh`: use `launchctl list` and `ps`
only. If any successor gate is active, ask Andrea whether to wait or stop it.
Then run local Studio-only COV for the product micro-slice:

```bash
npm --prefix apps/studio ci
npm --prefix apps/studio test -- SdkContract.compat.test.ts ToolReferenceSim.test.ts
npm --prefix apps/studio run typecheck
git diff --check
```

Do not run Mini factory gates, do not touch #27, and do not remeasure #23 unless
Andrea explicitly asks.
