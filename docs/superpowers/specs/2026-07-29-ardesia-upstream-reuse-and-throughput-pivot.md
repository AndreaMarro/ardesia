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
