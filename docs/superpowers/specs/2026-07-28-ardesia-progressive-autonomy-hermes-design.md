# Spec — ARDESIA progressive autonomy with Hermes

> 2026-07-28 · approved interactively by Andrea Marro.
> This document defines an experiment, not evidence that autonomy is already
> productive. Merge and deploy remain outside the authorized scope.

## Verified starting state

The current control plane is safer and more observable than the earlier loop,
but it has not demonstrated useful autonomous throughput:

- five of five admitted product slices ended `BLOCKED_CAUSAL`;
- the runtime contains 45 review completions and 40 Obsidian publications;
- the first scheduled v1.8 review started from launchd at 20:32 local time,
  completed with exit 0, used `gpt-5.6-sol` at `xhigh`, produced a correlated
  Headroom route receipt and wrote an append-only Obsidian receipt;
- that review was nevertheless `BLOCKED_CAUSAL`: Codex tool calls tried to
  apply its native sandbox inside the outer Headroom-only sandbox and failed
  reproducibly with `sandbox_apply: Operation not permitted`, exit 71;
- the same review caused seven Headroom request observations, approximately
  125,556 input tokens and USD 0.48 of estimated cost, with zero compression
  savings;
- Headroom 0.32.1 is installed as a required loopback gateway, but its current
  lossless/stateless configuration is an enforcement and observability
  boundary, not yet an efficiency mechanism;
- the Hermes 0.19.0 source checkout has been updated, but there is no governed,
  route-attested Hermes worker or LaunchAgent.

These observations reject the claim that a running schedule is equivalent to a
productive autonomous system.

## Objective

Determine whether a progressively autonomous ARDESIA loop can improve accepted
product throughput, cost, latency and knowledge recall without increasing
regressions, unauthorized writes, epistemic divergence or human cleanup.

The experiment must converge Andrea's ideas from GitHub, Obsidian, WikiLLM,
external directives and prior agent sessions into small falsifiable tasks.

## Non-goals

- No autonomous merge or deploy.
- No direct writes to `main` or `master`.
- No autonomous secret, billing, cloud, dependency, migration, authentication,
  security-policy or production-infrastructure changes.
- No self-rewrite of admission gates, safety thresholds, scheduler, sandbox,
  routing policy, oracle or frozen evaluation corpus.
- No direct writes to the derived WikiLLM SQLite database.
- No second writer on the same worktree.
- No claim that Hermes and Codex are statistically independent when both use
  correlated OpenAI/Codex inference paths.

## Architecture

```text
GitHub + canonical Obsidian + directives + prior receipts
  -> deterministic Frontier Builder
  -> exogenous-change digest and deduplication
  -> no change: SKIP_NO_AI
  -> changed frontier: bounded context packet
  -> Hermes persistent meta-planner / Knowledge Steward
  -> deterministic Admission Oracle
  -> Claude Opus/max sole product writer
  -> deterministic test/typecheck/build gates
  -> Codex SOL/xhigh independent-role reviewer
  -> local commit / optional draft PR / append-only receipts
```

### Authority

The policy author and installer define the frozen charter. The controller is the
only runtime scheduler and admission authority. Models may propose or evaluate
work; they cannot change their own authority.

The Frontier Builder ranks candidates deterministically from provenance,
priority, path overlap, risk, evidence freshness and prior outcomes. The first
runtime "planner" is therefore not an unconstrained LLM.

### Claude

Claude Opus/max is the only product writer. It receives one exact-SHA task,
one worktree, one lease, one to three exact non-critical files, frozen
acceptance criteria and falsifiers. It may perform at most one bounded repair
after Codex review.

`--dangerously-skip-permissions` is permitted only inside the controller-owned
filesystem and Headroom-only network boundary. Claude cannot dispatch another
writer, expand scope, push, merge or deploy.

### Codex

Codex SOL/xhigh reviews a frozen candidate and performs scheduled scientific
audits. Codex uses its native read-only tool sandbox, controller-owned Headroom
provider configuration, `--ignore-user-config`, denied routing overrides and a
unique route receipt.

Codex is not wrapped in a second macOS sandbox: the nested-sandbox failure is a
reproduced incompatibility. Under the experiment's threat model the pinned
Codex binary is trusted, while configuration, route correlation, repository
hashes and native tool sandboxing are independently checked. Any missing route
receipt fails the invocation.

### Hermes

Hermes 0.19.0 is an active persistent meta-planner and Knowledge Steward, but
not a product writer. The design uses its distinguishing capabilities:

- persistent SessionDB resume and search;
- `MEMORY.md` and `USER.md` long-term memory;
- procedural skills with versioned challenger candidates;
- multi-step AIAgent tool orchestration;
- background review of outcomes and proposed evolution.

Stock `hermes -z` is forbidden. Its credential pool, auxiliary clients, image
path, model probes and fallback providers can select direct endpoints. Hermes
therefore runs only behind a controller-owned adapter with:

- Headroom loopback routing and a unique correlation receipt;
- macOS egress sandbox restricted to the Headroom port;
- no provider fallback and no auxiliary, image, browser, terminal, cron or
  delegation tools;
- an initial tool allow-list of `session_search`, `memory`, `skills`,
  `wikillm_read` and `proposal_submit`;
- bounded context length, timeout and output schema;
- a dedicated private `HERMES_HOME`.

Before Claude writes, Hermes produces a plan, risk model and falsifiers. During
the slice it may inspect controller-owned progress receipts. After review it
stores the outcome, clusters failure patterns and proposes better strategies.
It never edits the product worktree.

## Knowledge write authority

Hermes has effective write authority over the source corpus consumed by
WikiLLM, not over the derived database or protected canon.

Hermes may write privately to its dedicated runtime:

- `state.db`;
- `MEMORY.md` and `USER.md`;
- challenger skills;
- pending strategies and scratch artifacts.

The only write into the shared knowledge system is the controller-owned
`proposal_submit` boundary. It permits create-only, append-only Markdown under:

- `80-Sources/AI-Inbox/Hermes/<cycle_id>/` for provenance-bearing knowledge
  deltas;
- `85-Agent-Proposals/Hermes/<cycle_id>/` for strategies and canon proposals;
- `92-Evidence/Hermes/<cycle_id>/` for receipts.

Every shared write requires a unique cycle ID, source references, content
digest, confidence, epistemic class and optional `supersedes` link. Overwrite,
delete, rename and symlink operations are rejected. A successful write triggers
an atomic WikiLLM reindex. Protected roots and Git refs remain read-only; their
changes require an exact-digest branch and draft PR controlled by the
controller.

Hermes memory has three epistemic classes:

- `OBSERVED`: immutable external evidence;
- `INFERRED`: Hermes hypotheses and summaries;
- `PROMOTED`: strategies that passed the frozen benchmark and canary.

`INFERRED` material cannot be cited as evidence for its own promotion.

## Progressive autonomy

### Stage 0 — Shadow

Hermes evaluates ten frozen tasks and writes only private memory, proposals and
receipts. There is no product write.

### Stage 1 — Controlled serial execution

The controller may auto-admit one low-risk task at a time. Each task must:

- touch one to three exact non-critical files;
- use an exact clean base SHA and isolated branch/worktree;
- have deterministic acceptance criteria, falsifiers and local verification;
- have no overlap with open PRs, other worktrees or active tasks;
- derive from a provenance-bearing approved source;
- exclude dependencies, manifests, migrations, CI, auth, security, secrets,
  payments, infrastructure and protected files.

Only local commits are created.

### Stage 2 — Autonomous draft PR

Draft PR creation becomes eligible only after the experimental promotion
criteria pass. Merge and deploy remain human-only.

### Stage 3 — Limited parallelism

At most two tasks may run concurrently, each with a separate writer and
worktree, only when their exact file sets are disjoint and the serial stage has
completed without safety violations. There remains one controller and one
writer per worktree.

Any safety violation immediately returns the whole system to Stage 0.

## Cycle and prompt contract

Every 30-minute trigger first computes a digest from exogenous material:
canonical Git/Obsidian sources, GitHub inventory, validated directives and
product state. Agent-generated receipts, proposals and context packets are
excluded from this trigger.

If the digest is unchanged, the cycle records `SKIP_NO_AI`. It performs no
Hermes, Claude or Codex inference and produces no Obsidian churn.

If changed, the Context Compiler emits a provenance-bearing packet targeted at
approximately 24–30 KB. Full sources remain addressable through bounded search;
they are not copied wholesale into every prompt.

The writer prompt freezes:

- task and goal identifiers;
- exact base SHA and branch;
- exact file allow-list;
- acceptance criteria and falsifiers;
- relevant prior failures;
- forbidden actions;
- GitHub/Obsidian inventory digests;
- context digest;
- retry and repair budgets.

## State machine and errors

```text
DETECTED
  -> PROPOSED
  -> SHADOW_EVALUATED
  -> ADMITTED | ABSTAINED
  -> CONTEXT_COMPILED
  -> WRITING
  -> VERIFIED
  -> REVIEWED
  -> ACCEPTED | REPAIR | BLOCKED_CAUSAL
```

- `TRANSIENT`: provider overload or timeout. Resume the same session with the
  same frozen task, at most twice.
- `BLOCKED_CAUSAL`: conflict, failed gate or insufficient evidence. Publish a
  typed receipt and continue only with a compatible candidate.
- `SAFETY_VIOLATION`: out-of-scope write, routing bypass, duplicate scheduler,
  canon contamination or gate mutation. Terminate the action and revert the
  autonomy stage to shadow.
- `SAFE_MAINTENANCE`: no useful work. This is healthy and must not emit an
  "automation stopped" alert.

Stall detection uses progress receipts, not elapsed time alone.

## Self-improvement

Hermes may propose versioned deltas to memory, skills, prompts and planning
heuristics. It cannot activate them directly.

```text
verified outcome
  -> episodic memory
  -> failure/success cluster
  -> challenger strategy
  -> replay against frozen corpus
  -> bounded live canary
  -> deterministic promotion or rollback
```

The active champion, challenger, oracle, corpus, rubric and results are
content-addressed. Promotion is controller-owned and requires no regression,
measured utility, bounded cost/latency and independent-role Codex review.
Disagreement means abstention, not majority improvisation.

## Scientific protocol

### Systems under comparison

- **Champion A:** controller + Claude writer + Codex reviewer.
- **Challenger B:** the identical system with Hermes planning, memory and
  Knowledge Steward behavior.

Headroom remains lossless in both arms. Compression is a later independent
experiment to avoid confounding two variables.

### Sequence

1. Repair and verify the Codex nested-sandbox incompatibility without weakening
   read-only review.
2. Run negative canaries for Headroom down, direct routing, prompt injection,
   restart, stale GitHub, inactive Obsidian, duplicate scheduler, digest
   mismatch and unauthorized paths.
3. Run ten paired historical smoke tasks.
4. Run at least thirty paired tasks with identical SHA, context, acceptance,
   timeout and reviewer; randomize A/B order and use separate worktrees.
5. Evaluate persistent-memory transfer on later tasks with source-grounded
   recall tests.
6. Only after promotion criteria pass, run new low-risk live tasks.

### Metrics

Primary:

- `PASS` after at most one repair;
- safety violations and regressions, both required to remain zero.

Secondary:

- accepted units per hour;
- tokens, estimated cost and wall time per attempt and accepted unit;
- human interventions;
- review finding count and severity;
- AI calls on unchanged material, required to be zero;
- WikiLLM source recall, duplication and contradiction rates;
- marginal benefit attributable to Hermes.

PASS/FAIL uses a paired comparison. Token and duration changes use paired
medians with bootstrap confidence intervals. The first ten tasks are a smoke
test; thirty tasks provide initial evidence, not definitive proof.

### Promotion

Hermes is promoted only when:

- there is no safety or canon violation;
- the acceptance rate is not inferior to the champion by more than five
  percentage points;
- at least one of the following holds:
  - acceptance improves by at least ten percentage points;
  - median tokens or duration fall by at least twenty percent;
  - WikiLLM recall improves without increasing contradictions.

Stable low-risk autonomy additionally requires at least 21 accepted tasks out
of 30 and a Wilson lower confidence bound above 50%.

Headroom compression or other transforms are enabled only in a separate paired
replay with measurable token reduction and no degradation of acceptance,
falsifiers or source fidelity.

## Rollback and receipts

Every model route, admission, write, promotion, retry, rejection and stage
transition receives an append-only receipt. Any safety failure:

1. stops the affected process group;
2. revokes the active Hermes strategy version;
3. restores the last content-addressed champion;
4. returns autonomy to Stage 0;
5. publishes a causal evidence receipt without modifying protected canon.

No receipt is itself treated as exogenous work.

## Acceptance criteria for implementation

The implementation is complete only when:

1. unchanged scheduled ticks make zero AI requests;
2. Codex can read frozen evidence without nested-sandbox failure;
3. Claude, Codex and Hermes each produce correlated Headroom receipts;
4. Headroom-down tests fail closed with no direct provider request;
5. Hermes persists and retrieves memory across restart;
6. Hermes can create an allowed knowledge delta and cannot overwrite it;
7. protected canon, product worktree, GitHub remote and policy writes are denied
   to Hermes;
8. WikiLLM reindexes the exact accepted Markdown digest;
9. the ten-task shadow smoke test completes without safety violations;
10. all claims distinguish process liveness, useful progress, acceptance and
    statistically supported improvement.
