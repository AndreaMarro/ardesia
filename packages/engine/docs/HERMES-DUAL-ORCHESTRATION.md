# ARDESIA dual-Hermes orchestration

Target from Andrea:

```text
Two Hermes workers, both using available subscriptions/resources intelligently.
H1: Codex/OpenAI using GPT-5.5 with medium reasoning.
H2: MiniMax-M3 standalone inside Hermes.
An orchestrator routes tasks instead of letting both spend blindly.
```

## Scientific position

This is the right shape **only if the two resources are separated and metered**.

It is not safe to simply remove the existing `unset OPENAI_API_KEY` lines from the factory drivers and let Hermes inherit every credential. That would blur provenance and widen secret exposure. The safer shape is:

```text
factory supervisor / router
├── Hermes-Codex lane
│   └── invokes Codex with model gpt-5.5 and model_reasoning_effort=medium
└── Hermes-MiniMax lane
    └── Hermes Agent configured natively with MiniMax-M3
```

The two lanes can both be launched by Hermes/driver code, but they should not share broad process-level secrets.

## Evidence from vendor docs

OpenAI Codex supports `codex exec` for scripts/CI and automation, explicit sandboxing, JSONL output, and `--model/-m` selection. Codex docs list `gpt-5.5` as the recommended model for complex coding, computer use, knowledge work, and research workflows; the API model page also lists `gpt-5.5` with reasoning levels including `medium` and a 1M context window.

MiniMax documents native Hermes Agent integration: configure MiniMax via `hermes model`, select “MiniMax (global endpoint)”, enter the Subscription Key, and select MiniMax-M3. MiniMax also distinguishes Subscription Keys from pay-as-you-go API keys.

## Files added by this PR

- `packages/engine/bin/codex-openai-worker.sh`
- `packages/engine/bin/hermes-dual-orchestrator.sh`
- `packages/engine/docs/HERMES-DUAL-ORCHESTRATION.md`

## Required setup on the Mac mini

### 1. OpenAI / Codex lane

Preferred: use existing Codex login/API-key setup in `~/.codex-openai-gpt55-medium`.

The worker creates this config:

```toml
model = "gpt-5.5"
model_provider = "openai"
model_reasoning_effort = "medium"
model_reasoning_summary = "concise"
model_context_window = 1000000
```

Run manually:

```bash
cd ~/lessonos
bash packages/engine/bin/codex-openai-worker.sh review ~/lessonos
```

Override if needed:

```bash
ARDESIA_CODEX_MODEL="gpt-5.5" \
ARDESIA_CODEX_REASONING="medium" \
bash packages/engine/bin/codex-openai-worker.sh review ~/lessonos
```

If you must use an API key, pass it only for the single invocation, not as a job-wide environment variable:

```bash
CODEX_API_KEY="..." bash packages/engine/bin/codex-openai-worker.sh review ~/lessonos
```

### 2. MiniMax / Hermes lane

Configure once:

```bash
hermes doctor
hermes model
```

Then select:

```text
provider: MiniMax (global endpoint)
model: MiniMax-M3
key: MiniMax Subscription Key
```

Run manually:

```bash
bash packages/engine/bin/hermes-dual-orchestrator.sh minimax-review \
  "Audit current factory state without editing files" \
  ~/lessonos
```

## Orchestration policy

The router uses a deliberately simple policy first:

| Task class | Primary lane | Secondary lane |
|---|---|---|
| architecture, auth, secrets, drivers, gates, CI, regressions | Codex GPT-5.5 medium | MiniMax review |
| docs, inventory, long-context audit, churn triage, research digestion | MiniMax-M3 | Codex review |
| high-risk writes | one writer only | other lane reviews |
| routine review | both lanes read-only | supervisor reconciles |

The invariant is:

```text
Never let both lanes write the same repo at the same time.
```

Use fanout only for read-only review:

```bash
bash packages/engine/bin/hermes-dual-orchestrator.sh fanout-review \
  "Review PRD plugin-system for unsafe assumptions" \
  ~/lessonos
```

Use routing for bounded work:

```bash
bash packages/engine/bin/hermes-dual-orchestrator.sh route \
  "Fix the failing gate in the smallest safe way; do not touch eval/gate.sh" \
  ~/lessonos
```

## What this PR deliberately does not do

- It does not modify `driver-orch.sh`.
- It does not modify `driver-studio.sh`.
- It does not remove the existing Hermes blind in the production driver.
- It does not make Codex or MiniMax the default builder.
- It does not store any API key in the repo.

That is intentional. The next step is runtime validation, not immediate full automation.

## Runtime validation protocol

Minimum before wiring into tick:

```text
5 fanout-review runs on lessonos
5 fanout-review runs on studio
5 fanout-review runs on ardesia-lavagna
5 bounded repair runs where only one lane writes
```

Track:

```text
run_id
repo
lane
mode
task_class
start/end/duration
exit code
gate before/after
files changed
tokens/cost if available
P0/P1/P2 findings
whether the finding was real
whether the other lane duplicated it
```

Promotion rule:

```text
Only add a non-blocking post-keep hook after the dual lane finds real issues or useful fixes in >=30% of measured runs without increasing red gates.
```

## Proposed later hook, not enabled now

After measurement:

```bash
if [ "${ARDESIA_DUAL_HERMES_POST_REVIEW:-0}" = "1" ]; then
  nohup bash packages/engine/bin/hermes-dual-orchestrator.sh fanout-review \
    "Review the kept commit range for regressions and product risk" \
    "$REPO" >> "$HOME/lessonos/hourly.log" 2>&1 &
fi
```

## Bottom line

This turns “two subscriptions” into a controlled resource pool:

```text
Codex/OpenAI GPT-5.5 medium = expensive/high-precision lane
MiniMax-M3 Hermes = efficient/long-context/throughput lane
Router = decides who writes, who reviews, and when both run read-only
Gate = final authority
```
