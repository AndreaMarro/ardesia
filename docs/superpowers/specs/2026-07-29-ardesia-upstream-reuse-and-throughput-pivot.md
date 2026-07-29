# ARDESIA — upstream reuse and throughput pivot

> 2026-07-29 · scientific decision receipt.
>
> This note records a fail-closed pivot after independent review. It does not
> authorize a push, pull request, merge, deploy, installation, remote service
> activation or protected Obsidian write.

## Outcome first

The experimental `PROGRESSIVE_LOW_RISK_V1` implementation was reverted before
runtime installation. Its 52-test predecessor remains green and the Mac mini
continues to run the previously verified immutable queue.

The rejected implementation added approximately 1,900 lines across four files.
Independent adversarial review found two critical and nine major/moderate
authority or integrity defects, including self-asserted source provenance,
protected-path admission, incomplete verification, state/lease races,
non-idempotent replay, incomplete GitHub inventory and intake TOCTOU. A first
fix attempt grew the total experimental delta to approximately 2,600 lines
while the new adversarial tests were still red. Continuing would have optimized
test surface and controller size, not accepted product throughput.

The safe result is therefore:

- experimental admission code: reverted, not installed;
- baseline controller suite: 52/52 passed;
- materialized queue mode: `PREAPPROVED_IMMUTABLE`;
- progressive writer dispatch: absent;
- current Mini service version: unchanged at `1.8.1`;
- push, PR creation, merge and deploy: not performed.

## Firsthand bottleneck inventory

At 2026-07-29 00:10–00:15 CEST:

- the Mini doctor reported `READY_FOR_PRODUCTIVE_LOOP`;
- Headroom `0.32.1` was healthy in required stateless/lossless mode;
- Obsidian Headless was continuously alive and the exact Knowledge clone was
  clean at `5a8c50d`;
- the product clone was clean at exact main SHA `36e6753`;
- the immutable five-task queue was terminal, so it could not dispatch new
  work;
- GitHub had only three open issues:
  - `#215`, the control-plane programme itself;
  - `#190`, explicitly labelled `human-gate`;
  - `#92`, explicitly `reported-not-patched` until the physical book is
    checked;
- the clearest ratified one-file product falsifier was already inside open PR
  `#213`, so a second worktree would violate the no-parallel-divergence rule.

The immediate zero throughput is therefore not caused by a short Claude
timeout. The writer hard limit is already 10,800 seconds. It is caused by the
absence of a complete non-overlapping admitted task.

## Upstream capabilities that should be reused

Official upstream research changes the integration plan:

1. Paperclip already provides native `claude_local`, `codex_local`,
   `pi_local`, `hermes_local` and `hermes_gateway` adapters, and coalesces
   wakeups while an agent is running.
   - https://github.com/paperclipai/paperclip/blob/master/docs/adapters/overview.md
   - https://github.com/paperclipai/docs/blob/main/agents-runtime.md
2. Paperclip managed agents, projects, routines and skills are the supported
   pattern for durable work. Its LLM Wiki plugin is the upstream reference for
   wiki maintenance and ingest. ARDESIA should not build a parallel unmanaged
   wiki scheduler.
   - https://github.com/paperclipai/paperclip/blob/master/doc/plugins/PLUGIN_SPEC.md
3. Paperclip release history already includes routines, coalescing, execution
   policies, blocker-aware wakeups, session-resume fixes and safer LLM Wiki
   packaging.
   - https://github.com/paperclipai/paperclip/releases
4. Claude Code natively supports named/resumable sessions, effort selection,
   structured JSON output and bounded long print-mode runs. One long writer
   session should be resumed, not repeatedly restarted.
   - https://code.claude.com/docs/en/cli-usage
5. Hermes can wrap a Codex App Server foreground turn, but its memory/skill
   background review can use a separate `codex_responses` path. Every such
   auxiliary path must be disabled or independently Headroom-attested before
   activation.
   - https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/codex-app-server-runtime.md
6. Headroom supports an OpenAI-compatible proxy and agent wrappers. Published
   saving percentages are hypotheses; ARDESIA promotion still requires a
   paired accepted-unit experiment.
   - https://github.com/headroomlabs-ai/headroom

## Firsthand component reality

The Mini does not currently have Paperclip or Pi installed.

Hermes is installed at `v0.19.0`, commit `f228e145`, 233 commits behind its
observed upstream. Its native memory is disabled. Its foreground model is
routed through local LiteLLM and its auxiliary clients are configured for
direct Moonshot endpoints. This does not satisfy ARDESIA's requirement that
all inference paths yield a unique Headroom route receipt.

Consequently:

- do not activate current Hermes as a trusted context worker;
- do not claim that all AI instances use Headroom;
- do not install Paperclip/Pi merely to increase component count while product
  throughput remains zero;
- after the first accepted product unit, reuse Paperclip's native adapters,
  coalescing, routines and LLM Wiki pattern instead of custom adapters;
- activate Hermes only after a no-bypass canary covers foreground,
  auxiliary and background inference;
- keep Pi read-only and experimental until its exact Headroom route is proven.

## Revised causal sequence

1. **WIP convergence:** classify open PRs and avoid creating overlapping
   product branches. The controller must be able to select work on an existing
   PR as an explicit mode, or wait for a genuinely non-overlapping directive.
2. **One frozen unit:** use an operator-authored GitHub object or exact
   ratified Knowledge Git blob to create one complete task contract. If no
   such unit exists, report `NO_ADMISSIBLE_TASK`; do not invoke a planner every
   30 minutes.
3. **Existing productive machinery:** dispatch the already implemented long
   Claude Opus/max writer, full tests/typecheck/build, one Codex SOL/xhigh
   review and at most one repair.
4. **Local evidence:** require a hook-respecting local commit and
   `ACCEPTED_LOCAL`; the next unchanged scheduled tick must consume zero AI.
5. **Paperclip reuse:** install only under a separately approved,
   version-pinned and reversible canary. Use its state/session/routine surfaces
   rather than reimplementing them in the controller.
6. **Hermes context:** feed terminal outcome envelopes after every inference
   path is Headroom-attested; Hermes remains a challenger/context worker and
   never a second product writer.
7. **Pi and Headroom transforms:** paired canaries only after a baseline of
   accepted units exists.

## Metrics and falsifier

The primary metric remains:

```text
accepted local product units / wall-hour
```

Secondary metrics are AI calls, tokens, attempts, repair count and human
cleanup per accepted unit, with zero safety violations and regressions.

This pivot is falsified if reusing the upstream orchestration/session/wiki
surfaces requires more custom code or causes more duplicate work, divergence or
human cleanup than the deterministic Lane P baseline. In that case, keep the
component disabled and retain the receipts.

## Measured context improvement

At 2026-07-29 00:20–00:38 CEST, the live Mini WikiLLM retrieval path was
evaluated against the unchanged 30-question golden set
`9a115dc5acad9fec8e953284d709f71a74baea5021e18a194bf1314532b4a7dc`.
The treatment retrieves a bounded pool of 20 FTS candidates and applies a
stable, deterministic filename-slug rerank before returning the requested
limit.

The first implementation was not promoted even though all 54 tests passed.
Independent review found three defects: path-depth bias could prefer a partial
filename, accented Italian queries did not consistently match ASCII slugs, and
body text was unnecessarily materialized for metadata-only searches. The
follow-up uses basename-only symmetric Dice scoring, NFKD normalization and a
body-free SQL projection unless the caller explicitly requests note bodies.
The second independent review returned `APPROVED` with no findings.

Paired read-only Mini results on the same SQLite database:

| Metric | live 1.8.1 | candidate 1.8.2 |
|---|---:|---:|
| hit in top 5 | 22/30 | **24/30** |
| recall@5 | 0.733333 | **0.800000** |
| MRR | 0.543889 | **0.636111** |
| baseline hit → miss | — | **0** |
| median time, 30 queries | 0.1111 s | 0.2200 s |
| median time per query | 3.70 ms | 7.33 ms |

The absolute latency cost is approximately 3.63 ms/query. Five alternating
replicas were used for each arm. The WikiLLM SQLite SHA, golden SHA, Knowledge
Git head/status and product Git head/status were identical before and after.
No AI call and no Obsidian write occurred.

The remote test suite initially produced 54 fixture errors because the isolated
canary directory did not yet contain `policy.source.json`. After copying that
required test fixture, the exact candidate passed 54/54 under the Mini's Python
3.9 runtime. This was an environmental canary setup error, not recorded as a
code pass.

Version `1.8.2` was then installed atomically with a complete v1.8.1 backup at:

```text
/Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8.1-pre-wikillm-rerank-20260729
```

The candidate materialized policy differed from live only at
`service_version: 1.8.1 → 1.8.2`. Post-install doctor returned
`READY_FOR_PRODUCTIVE_LOOP`, the live suite passed 54/54, and the controller
was running as PID `95297`.

The first true post-install calendar run started at minute 02 without a manual
kickstart and completed at 2026-07-29 01:04:55 CEST:

- review ID:
  `20260728T230205540104Z-5c430e36-aa95d177`;
- trigger: `scheduled-30m`;
- execution: `PASS`;
- state: `READY_FOR_PRODUCTIVE_LOOP`;
- scientific classification: `INCONCLUSIVE`;
- model: `gpt-5.6-sol`, reasoning effort `xhigh`, sandbox read-only;
- logical AI calls: 1; Headroom request count: 3;
- Headroom global-window upper-bound cost: USD 0.428;
- original/optimized input tokens: 54,437/54,437; saved: 0;
- Obsidian receipt:
  `92-Evidence/20260728T230205540104Z-5c430e36-aa95d177-SCIENTIFIC-CYCLE.md`,
  SHA-256
  `7d42acee25067b96eaae908a453c1f486d0f5205d31f638563328b686c0936c4`;
- queue proposal: none.

The Obsidian live file and pending Git delta were byte-identical, and Headless
logged upload completion followed by `Fully synced`. Product and Knowledge Git
heads/status remained exact and clean. The derived WikiLLM database SHA changed
as expected because the new append-only evidence receipt was ingested; that is
derived-index churn, not canonical Git drift.

The `INCONCLUSIVE` result exposed the next prompt-construction defect: the
supervisor packet omitted the 497-character WikiLLM state and truncated 20,707
characters from the productive-task outcomes. The model therefore could verify
healthy gates, terminal queue, Headroom and disabled Hermes, but could not
inspect all five task outcomes or infer a new accepted unit. The next context
slice must provide compact complete outcome and WikiLLM summaries before any
large research/history body. It must not raise the 24,000-character ceiling or
dispatch another planner.

## Measured WIP bottleneck and revised dispatch policy

The 2026-07-29 00:30 CEST GitHub inventory contained 33 open pull requests:

- 12 targeted `main`;
- 21 were stacked on non-main branches;
- 4 non-draft PRs targeting `main` were clean, green and without requested
  changes (`#211`–`#214`);
- 7 PRs had requested changes, dirty merge state or a failed check and were
  possible repair candidates;
- no merge was performed.

This inventory is a stronger explanation of low delivered throughput than
writer-session duration. New product branches increase work in progress while
four already-green product changes remain behind the human merge gate and 21
stacked changes depend on earlier branches.

Official Paperclip guidance matches the required correction:

- agents should normally stay dormant until assignment, comment or routine
  provides real work; timer heartbeats are deliberately off by default:
  https://docs.paperclip.ing/guides/projects-workflow/routines/
- only one agent can hold an issue in progress, and a run can reuse an existing
  workspace to resume prior work:
  https://docs.paperclip.ing/guides/day-to-day/issues/
- review and approval transitions can be runtime-enforced rather than trusted
  to prompt wording:
  https://docs.paperclip.ing/guides/power/execution-policy/

The next productive mode must therefore be `WIP_AWARE_EXISTING_WORK_V1`:

1. build the GitHub/Knowledge/Obsidian material digest with zero AI;
2. if a non-human-gated existing PR has requested changes or a deterministic
   failed gate, bind the run to that exact PR and reuse its workspace/session;
3. if the eligible PR is clean and waiting for human merge, emit
   `WAITING_HUMAN_GATE` with zero AI;
4. create a new product branch only when no repairable existing work overlaps,
   the task contract is ratified and the WIP budget permits it;
5. resume one named Claude writer session for that work unit, then run
   deterministic gates and one Codex review;
6. use Paperclip assignment/routine coalescing only after a version-pinned,
   reversible canary; do not keep multiple AI timer heartbeats;
7. keep Hermes disabled until foreground, auxiliary and background inference
   paths are independently Headroom-attested.

This policy is falsified if existing-work reuse creates more duplicate edits or
human cleanup than a fresh isolated unit. The primary outcome remains accepted
local product units per wall-hour, not run count.

## Similar efficiency components screened

Adding another gateway is not currently supported by a causal bottleneck.
Official-source screening found four adjacent categories:

| Component | Relevant capability | ARDESIA decision |
|---|---|---|
| Microsoft LLMLingua | model-based prompt compression | challenger only after a frozen answer-quality/citation eval; its Transformers/model dependency and lossy transformation are unnecessary for the deterministic context slice |
| LiteLLM Proxy | multi-provider normalization, retry/fallback, budgets and cost tracking | do not stack behind/in front of Headroom now; it overlaps routing and does not close Hermes' un-attested auxiliary path |
| Helicone Gateway | managed multi-provider routing, fallback and observability | do not add a cloud egress/credential surface to solve a local WIP/admission bottleneck |
| Portkey Gateway | routing, cache, retries, circuit breakers, budgets and canaries | useful feature reference, but a second policy gateway would make route attribution and no-bypass proof harder |

Sources:

- https://github.com/microsoft/LLMLingua
- https://docs.litellm.ai/
- https://docs.helicone.ai/gateway/overview
- https://portkey.ai/docs/product/ai-gateway

Headroom remains the single required AI boundary because it is already live,
loopback-only and attested for the accepted Claude/Codex paths. Its compression
transforms remain off: no saving percentage is claimed. Any future challenger
must beat Headroom-only on accepted-unit cost and quality under paired replay,
not merely expose more routing features.

## Prompt compiler 1.8.3

Independent review of the 1.8.2 scheduled proof found a truthfulness defect,
not a model-quality defect: the final audit packet could omit the WikiLLM
snapshot and most of the five productive-task outcomes while still asking the
reviewer to judge convergence. Four successive candidate fixes were rejected
before promotion because they respectively lost too much raw supervisor
context, admitted no structured producer signals, preserved arbitrary prefixes
instead of producer identity, or incorrectly hoisted fields that were not
shared by every record.

The approved implementation builds compact summaries directly from the raw
producers before any lossy bounding and requires complete non-null coverage
before hoisting shared task/directive/path fields. It also keeps compact
WikiLLM and productive-loop snapshots outside the large bounded context body.

Final deterministic evidence:

- exact five-task synthetic packet: 23,696 characters;
- exact eight-task ceiling packet: 23,250 characters;
- nine-task and 125-task policies: explicitly rejected;
- legacy bounded sections without a minimum: still accepted with a zero
  default;
- focused prompt tests: 7/7;
- complete local and Mac mini suites: 57/57;
- independent cumulative review: `APPROVED`, no findings;
- live-data canary packet: 23,289/24,000 characters;
- live-data identities retained: 5/5 task outcomes, 5/5 prior-run task IDs,
  the validated external directive, Git history state, local coordination
  state and WikiLLM `INDEXED_CURRENT` with 607 notes;
- raw per-finding arrays: absent from the compact task snapshot.

The canary materialized policy differed from live only at
`service_version: 1.8.2 → 1.8.3`. Version 1.8.3 was installed atomically at
2026-07-29 02:11 CEST after a hash-verified backup at:

```text
/Users/progettibelli/ARDESIA-RUNTIME/backups/control-plane-v1.8.2-pre-prompt-compiler-20260729
```

Post-install doctor reported `READY_FOR_PRODUCTIVE_LOOP`; product and Knowledge
clones stayed exact and clean at `36e6753` and `5a8c50d`; the controller was
running with the exact canary bytes.

The true minute-32 launchd event then started version 1.8.3 without a manual
kickstart and completed at 2026-07-29 02:33:58 CEST:

- review ID:
  `20260729T003203551959Z-5c430e36-37fa882c`;
- trigger: `scheduled-30m`;
- audit execution: `PASS`;
- scientific classification: `FALSIFIED`;
- model: `gpt-5.6-sol`; effort: `xhigh`; sandbox: read-only;
- audit input: 23,283/24,000 characters;
- visible evidence: 5/5 task outcomes, 5/5 prior-run identities, validated
  directive, Git/local coordination states and WikiLLM `INDEXED_CURRENT`;
- Headroom route: 3 requests, all `codex`/`gpt-5.6-sol`/OpenAI, route receipt
  SHA-256
  `6e4f623b68d234439e9bda51705e3bb4bf56baff65c2827ff806b928ad3f1664`;
- global-window upper-bound cost: USD 0.4289;
- original/optimized input tokens: 54,513/54,513; saved: 0;
- Obsidian live and pending receipt:
  `92-Evidence/20260729T003203551959Z-5c430e36-37fa882c-SCIENTIFIC-CYCLE.md`,
  byte-identical at SHA-256
  `ec8afd82c754edac469c800a93b4e1d042d2f5a9bb36694b051da52e19245f7f`;
- Headless log: new file, upload complete, then `Fully synced`;
- launchd: run count 13, exit 0;
- controller, review and Obsidian service stderr: zero bytes;
- product and Knowledge Git heads/status: unchanged and clean.

The `FALSIFIED` result is the scientifically correct improvement over the prior
`INCONCLUSIVE`: the reviewer could now see that all five tasks were
`BLOCKED_CAUSAL`, no product commit was accepted, the latest writer heartbeat
was stale and the healthy operational gates did not imply progress. Version
1.8.3 is therefore scheduled-verified as a control plane, but the productive
no-stop hypothesis remains false.

The audit also identified the next bounded information need: a task-scoped
packet for BETA-005 with its complete five repair findings, exact artifact
receipt, Git history and path-overlap inventory. Those details should not be
forced into every global 30-minute packet. The next throughput slice must
reuse one exact existing task/PR workspace and compile this evidence on demand;
it must not enlarge the global ceiling or restart a generic planner.

## Upstream authority-transfer decision

The current official upstream evidence supports a narrower integration than
"put every agent in the loop":

- Paperclip's current release is `v2026.722.0`; its documented local
  installation requires Node 20+ and pnpm 9+:
  https://github.com/paperclipai/paperclip/releases
  and
  https://docs.paperclip.ing/guides/getting-started/installation/
- Paperclip routines default to `coalesce_if_active` and `skip_missed`, so
  overlapping ticks do not create a backlog:
  https://docs.paperclip.ing/guides/projects-workflow/routines/
- issue/workspace APIs provide revision conflicts, single ownership and
  explicit isolated or reused execution workspaces:
  https://docs.paperclip.ing/reference/api/issues/
  and
  https://docs.paperclip.ing/guides/projects-workflow/workspaces/
- execution policy can enforce review/approval transitions in the runtime
  instead of relying only on prompt wording:
  https://docs.paperclip.ing/guides/power/execution-policy/
- the current Pi upstream is `earendil-works/pi`, release `v0.82.1`; its own
  README states that Pi has no built-in filesystem, process, network or
  credential permission system:
  https://github.com/earendil-works/pi/releases
  and
  https://github.com/earendil-works/pi
- Headroom documents native wrappers for Claude, Codex and Oh My Pi, but those
  compatibility claims do not replace ARDESIA's per-run no-bypass receipt:
  https://github.com/headroomlabs-ai/headroom

Therefore Paperclip may be canaried only by replacing, for one task class, the
existing schedule + checkout + workspace authority. Running it as a parallel
observer with timers enabled would create a second control plane and decrease
causal attribution. The first canary must use a manual API trigger, disabled
timer heartbeats, an existing workspace, double-trigger coalescing and a single
`executionWorkspaceId`; Paperclip failure must leave 1.8.3 unaffected.

Claude remains the only product writer. Codex remains the independent reviewer.
Pi may be a read-only challenger only inside an outer sandbox and through a
fail-closed Headroom route; it cannot be a writer or policy actor. Hermes
`v0.19.0` remains disabled because its observed auxiliary clients still bypass
the attested Headroom route and its native memory is disabled. No Paperclip or
Pi installation was performed, and no Hermes activation is claimed.

This decision is falsified unless the canary improves accepted local product
units per wall-hour, cost per accepted unit or human-cleanup time without
increasing duplicate work, WIP, regressions or authority ambiguity.
