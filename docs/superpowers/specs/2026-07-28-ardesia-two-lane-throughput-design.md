# Spec — ARDESIA two-lane productive throughput

> 2026-07-28 · design approved by Andrea Marro.
>
> This document narrows the previously approved progressive-autonomy design
> into a throughput-first architecture. It preserves Hermes, Paperclip, Pi,
> Headroom, Obsidian, WikiLLM and GitHub, but does not put all of them on the
> critical path. It authorizes local low-risk execution only. Push, pull-request
> creation, merge and deploy remain outside this design.

## 1. Decision

ARDESIA will operate as two failure-isolated lanes:

- **Lane P — Product:** the shortest governed path from a provenance-bearing
  candidate to a locally accepted unit of product work;
- **Lane C — Context:** persistent memory, contradiction detection, operational
  observation and bounded challengers that improve future decisions without
  blocking current product work.

The immediate objective is not another green service check. It is the first
real `ACCEPTED_LOCAL` outcome:

```text
approved GitHub/Obsidian candidate
  -> deterministic PROGRESSIVE_LOW_RISK_V1 admission
  -> one long Claude Opus/max writer session
  -> deterministic gates
  -> one Codex SOL/xhigh review
  -> at most one repair and one re-review
  -> hook-respecting local commit
  -> ACCEPTED_LOCAL + append-only evidence
```

Hermes, Paperclip and Pi remain in the architecture, but Lane P neither waits
for them nor treats their health as an acceptance gate. This is the minimal
change capable of making current throughput greater than zero: the existing
queue is terminal, while the current scheduled proposal is deliberately
non-admissible.

## 2. Evidence and falsifiable hypothesis

The most recent observed scheduled audit was operationally successful but
productively empty:

- `audit_execution_state=PASS`;
- four model requests;
- 70,539 input tokens and 5,475 output tokens;
- approximately 119 seconds of controller wall time;
- approximately USD 0.4248 attributed only as
  `GLOBAL_WINDOW_UPPER_BOUND`;
- no admitted candidate;
- five of five existing product tasks in `BLOCKED_CAUSAL`.

The current runtime therefore proves scheduling, bounded context, route
attestation and evidence publication. It does not prove useful autonomous
work. Its causal admission probability for a newly proposed task is zero.

The next experiment tests:

> If exactly one source-grounded, low-risk candidate is admitted by a frozen
> deterministic oracle, a long Claude writer session followed by deterministic
> gates and one independent-role Codex review can produce an
> `ACCEPTED_LOCAL` unit without a safety violation, regression, remote write or
> canonical-knowledge divergence.

The hypothesis is falsified if no unit reaches `ACCEPTED_LOCAL` within 24 hours
of a valid candidate becoming available, or if doing so requires widening its
frozen scope or weakening an acceptance gate.

## 3. Non-goals and frozen prohibitions

- No push, pull request, merge or deploy.
- No direct write to `main` or `master`.
- No autonomous dependency, manifest, migration, CI, authentication,
  authorization, security-policy, secrets, payments, billing, cloud or
  production-infrastructure change.
- No self-rewrite of the admission oracle, scheduler, authority table, safety
  threshold, routing policy, sandbox or frozen acceptance criteria.
- No second product writer and no concurrent writer on the same worktree.
- No direct write to WikiLLM SQLite. It remains derived and rebuildable.
- No automatic promotion of Hermes memory, proposals, skills or interpretations
  into protected Obsidian canon.
- No AI call merely because 30 minutes elapsed.
- No repeated automatic attempt after the same candidate/failure fingerprint
  has failed twice.
- No claim of component benefit without a controlled comparison against the
  preceding champion.

## 4. Authority model

| Concern | Sole authority | Permitted subordinate behavior |
|---|---|---|
| Schedule and lifecycle | deterministic ARDESIA controller | launchd wakes the controller; Paperclip may observe events |
| Exogenous work | authenticated GitHub plus canonical Obsidian/directives | WikiLLM provides a content-addressed retrieval projection |
| Candidate admission | `PROGRESSIVE_LOW_RISK_V1` oracle in the controller | models may propose; only the oracle may admit |
| Product writing | Claude Code Opus/max | one leased, isolated worktree and one resumable session |
| Product verification | deterministic commands and invariants | no model can override a failed gate |
| Product review | Codex `gpt-5.6-sol`/`xhigh` | read-only, route-attested, one review plus at most one re-review |
| Local acceptance | controller | creates a hook-respecting local commit and terminal receipt |
| Canonical knowledge | Obsidian Markdown plus Git/GitHub provenance | protected roots require human-reviewed Git workflow |
| Derived retrieval | WikiLLM SQLite FTS5 | rebuild only from an exact source digest |
| Episodic context | Hermes private session plus append-only proposals | no scheduling, product write or canon promotion |
| Operational ledger/UI | Paperclip observer | event-driven mirror; no authoritative queue |
| Cheap challenger | Pi canary | read-only structured output; no write/review authority |
| AI routing evidence | Headroom required gateway | no direct-provider fallback |

The controller remains the only component allowed to transition a candidate
through the Lane P state machine. A model output is always data, never an
authority grant.

## 5. Lane P — product

### 5.1 Frontier and candidate sources

The controller computes an exogenous digest from:

- authenticated GitHub issue, pull-request and CI inventory;
- canonical Obsidian requirements, decisions, architecture and operator inbox;
- validated external directives;
- exact product and knowledge Git state.

Agent receipts, generated proposals, context packets and derived WikiLLM index
files do not count as exogenous change. An unchanged digest returns
`SKIP_NO_AI`, `ai_calls=0` and no Obsidian write.

A `frontier_candidate` may originate from:

1. an authenticated operator-authored GitHub or Obsidian directive already
   containing the complete contract; or
2. one bounded planning proposal produced after a material exogenous change.

Both paths feed the same deterministic oracle. A planner cannot admit its own
proposal. In particular, a scheduled SOL proposal is not trusted because it
was generated by SOL; its sources, schema, paths, commands and overlap must
independently pass the oracle.

### 5.2 `PROGRESSIVE_LOW_RISK_V1` admission

The oracle admits at most one candidate when no productive task is nonterminal.
It performs no AI call and must verify all of the following:

- schema and schema hash are known;
- candidate ID and material digest are content-addressed and not previously
  terminal;
- source references belong to an approved GitHub/Obsidian/directive namespace,
  exist, and match their exact digest;
- exact base SHA equals the current clean product base;
- exactly one to three regular-file paths are named;
- every path is non-critical, repository-relative, symlink-safe and not under
  `.git`;
- no path touches a dependency/manifest, migration, CI, auth, security,
  secret, payment, billing, cloud, infrastructure or protected product file;
- no overlap exists with open pull requests, other worktrees, active leases or
  another admitted task;
- acceptance criteria and falsifiers are non-empty and frozen;
- verification commands are exact argv arrays selected from a reviewed
  allow-list; shell strings and command substitution are forbidden;
- branch and isolated worktree names derive deterministically from the
  candidate ID;
- writer identity is Claude, reviewer identity is Codex, repair budget is one;
- remote writes and scope expansion are forbidden.

The admitted record is content-addressed, append-only and runtime-local. It
does not mutate the tracked policy or add a task to the old immutable queue.
Any failed check yields `PROPOSED_NOT_ADMITTED` plus exact reason codes and no
writer dispatch.

### 5.3 Context compiler

The compiler is task-scoped, not a warehouse dump:

- initial target: 8,000–12,000 characters;
- hard writer packet limit: 30,000 characters;
- required sources retain digest, path, heading and selected excerpt;
- supplementary material is trimmed before required material;
- prior failure fingerprints and forbidden actions are explicit;
- credentials, full headers, full vault dumps and unrelated agent transcripts
  are excluded;
- Claude may perform bounded read-only queries against GitHub, WikiLLM and the
  frozen Obsidian snapshot when the initial packet is insufficient.

The packet binds the candidate, exact base, allowed paths, acceptance,
falsifiers, verification argv, source digests, prior failures, budgets and
prohibitions. Its canonical serialization and SHA-256 are stored before
writing begins.

### 5.4 Claude writer

Claude Code is the sole product writer:

- model `opus`, effort `max`;
- `--dangerously-skip-permissions` only inside the controller-owned isolated
  worktree and existing Headroom-only outer network sandbox;
- one primary session, persisted by session ID and resumable only for a bounded
  transport overload;
- normal working window 60–180 minutes;
- hard worker timeout 10,800 seconds;
- renewable lease and heartbeat every 30 seconds;
- the 30-minute scheduler cadence never interrupts or duplicates an active
  writer;
- warning after 15 minutes without a new diff, test result or explicit progress
  receipt;
- causal stop after 30 minutes with unchanged diff, tests and progress
  fingerprint;
- no sub-writer, push, merge, deploy, policy change or path expansion.

Long sessions are intentional. Savings come from not repeating unchanged
audits and not sending irrelevant context, not from truncating the writing
window or reducing model effort.

### 5.5 Deterministic gates

The controller verifies, in order:

1. lease, exact base, clean coordination and live Headroom boundary;
2. changed paths are a subset of the exact one-to-three-file allow-list;
3. no symlink, submodule, ignored escape or forbidden generated artifact;
4. candidate-specific focused tests;
5. repository-required full tests, typecheck, build and score/baseline rules;
6. no reduced test count or changed frozen oracle;
7. final GitHub/worktree overlap and exact diff digest.

A failed gate transitions to `BLOCKED_CAUSAL` or `REJECTED_REGRESSION`. It
cannot be converted to success by Claude, Codex, Hermes or Paperclip.

### 5.6 Codex review and local terminal

Codex reviews only the frozen task, diff and gate evidence:

- `gpt-5.6-sol`, `xhigh`;
- official Codex path with native read-only sandbox;
- frozen controller-owned `model_provider=headroom`;
- no second outer macOS sandbox;
- no caller routing override and no direct fallback;
- one review; at most one Claude repair followed by complete gates and one
  re-review;
- target packet at most 16,000 characters and target aggregate no more than
  30,000 input/4,000 output tokens per review attempt.

`PASS` plus all deterministic gates creates a local commit without
`--no-verify`, an append-only outcome receipt and state `ACCEPTED_LOCAL`.
Nothing is pushed. A reviewer finding remains tied to the exact candidate SHA
and cannot silently widen the task.

## 6. Lane C — context and convergence

Lane C consumes terminal `outcome_envelope` objects from Lane P. It is
asynchronous and cannot hold a Lane P lease.

### 6.1 Hermes persistent context

Hermes remains the persistent context and challenger component, with these
initial capabilities:

- one long-lived ARDESIA session with explicit resume lineage;
- compacted episodic history of accepted, rejected and blocked outcomes;
- source-grounded contradiction and supersession detection;
- structured `memory_delta`, next-task hypothesis and falsifier proposals;
- private challenger skills and strategy drafts;
- append-only shared proposals under controller-owned Obsidian roots.

Hermes has no product-worktree, scheduling, GitHub-write, policy-write or
protected-canon authority. The controller supplies a bounded batch of one to
three terminal outcome envelopes and validates the structured result.

The route constraint from upstream issue
[`NousResearch/hermes-agent#5875`](https://github.com/NousResearch/hermes-agent/issues/5875)
is explicit:

- raw Hermes provider `openai-codex` is forbidden;
- the foreground Hermes turn may run only through the already attested Codex
  App Server path with the frozen Headroom provider;
- any app-server turn without the unique Headroom route receipt fails closed;
- automatic background raw memory/skill review is disabled;
- `codex_responses`, provider fallback, auxiliary image/model clients and any
  un-attested background inference remain disabled;
- absence of native memory tools inside an app-server turn is recorded
  honestly; the controller stages the returned `hermes_proposal` and outcome
  lineage rather than pretending the unavailable callback wrote memory;
- background review becomes eligible only after its own no-bypass canary
  attests every inference path.

Hermes proposals may be written create-only under:

- `85-Agent-Proposals/Hermes/<cycle_id>/`;
- `92-Evidence/Hermes/<cycle_id>/`.

They retain `OBSERVED` versus `INFERRED` classes and may not cite an inference
as evidence for its own promotion.

### 6.2 Paperclip observer

Paperclip is event-driven operational infrastructure, not a second scheduler:

- subscribes to `candidate_admitted`, `writer_started`,
  `writer_completed`, `review_completed` and `outcome_terminal`;
- mirrors IDs, state, budgets and receipt references;
- coalesces duplicate events by event ID and digest;
- never owns the task queue, changes acceptance, invokes a writer or emits a
  periodic AI heartbeat;
- starts read-only as an observer/UI/budget ledger;
- after three `ACCEPTED_LOCAL` outcomes without divergence, may canary one
  event-only wake-up to the existing controller.

Loss of Paperclip delays observation only. It cannot stop or duplicate Lane P.

### 6.3 Pi paired canary

Pi is a bounded, read-only challenger:

- one short structured triage/normalization call;
- exact same candidate packet as the deterministic baseline;
- no filesystem write, scheduling, final review or canon authority;
- activation only after Headroom route attestation and Headroom-down failure
  are proven;
- paired comparison of time, tokens, correctness and provenance;
- removal if it does not improve time or cost per accepted unit.

Pi never becomes another writer by implication. Promotion requires a separate
reviewed decision.

### 6.4 Headroom experiment

Headroom remains lossless/stateless while throughput is recovered. Every AI
call in both lanes must produce a unique route receipt with client, provider,
model, effort, request count, token observations and latency.

After at least ten `ACCEPTED_LOCAL` units, one transformation at a time may be
tested, beginning with structural compression of tool output:

- at least 10% holdout;
- same task family and frozen acceptance;
- no effort shaping for Claude max or Codex xhigh;
- paired evaluation after at least 30 comparable units;
- automatic rollback for a lost citation, major additional review finding,
  worse accepted diff or acceptance regression.

Published upstream saving percentages are hypotheses, not ARDESIA evidence.

## 7. Data contracts

Every contract has `schema_version`, `schema_hash`, immutable ID,
`created_at`, producer identity and source digest. Unknown fields fail closed.

### 7.1 `frontier_candidate`

```json
{
  "schema_version": 1,
  "schema_hash": "sha256",
  "candidate_id": "sha256-derived-id",
  "goal_id": "goal",
  "source_refs": [
    {
      "authority": "github|obsidian|directive",
      "uri": "stable-reference",
      "sha256": "source-digest"
    }
  ],
  "exact_base_sha": "40-hex-git-sha",
  "allowed_paths": ["one-to-three-exact-files"],
  "acceptance": {
    "assertions": ["falsifiable statement"],
    "commands": [["exact", "argv"]]
  },
  "falsifiers": ["observable rejection condition"],
  "risk_class": "LOW_NON_CRITICAL",
  "overlap_digest": "sha256",
  "material_digest": "sha256"
}
```

### 7.2 `admission_receipt`

```json
{
  "candidate_id": "id",
  "oracle": "PROGRESSIVE_LOW_RISK_V1",
  "oracle_digest": "sha256",
  "decision": "ADMITTED|PROPOSED_NOT_ADMITTED",
  "checks": [{"id": "check", "pass": true, "evidence_digest": "sha256"}],
  "runtime_task_digest": "sha256-or-null",
  "lease_id": "id-or-null"
}
```

The receipt records all checks, including failures. Only `ADMITTED` may create
runtime state `PENDING`.

### 7.3 `writer_packet`

```json
{
  "candidate": "complete immutable frontier_candidate",
  "context_refs": [{"uri": "ref", "sha256": "digest", "excerpt": "bounded"}],
  "prior_failure_fingerprints": ["sha256"],
  "forbidden_actions": ["explicit prohibition"],
  "runtime_budget_seconds": 10800,
  "repair_budget": 1,
  "packet_sha256": "sha256"
}
```

### 7.4 `review_verdict`

```json
{
  "candidate_id": "id",
  "candidate_sha": "git-sha",
  "verdict": "PASS|REPAIR|BLOCKED",
  "findings": [
    {"severity": "major|minor", "path": "file", "claim": "finding", "evidence": "ref"}
  ],
  "acceptance_coverage": [{"criterion": "digest", "status": "PASS|FAIL"}],
  "route_receipt": {"sha256": "digest", "model": "gpt-5.6-sol", "effort": "xhigh"}
}
```

### 7.5 `outcome_envelope`

```json
{
  "candidate_id": "id",
  "run_id": "id",
  "terminal_state": "ACCEPTED_LOCAL|BLOCKED_CAUSAL|REJECTED_REGRESSION|SKIP_NO_CHANGE",
  "base_sha": "git-sha",
  "candidate_sha": "git-sha-or-null",
  "changed_paths": ["files"],
  "gate_receipts": [{"id": "gate", "sha256": "digest"}],
  "review_receipts": [{"sha256": "digest"}],
  "route_metrics": {"ai_calls": 0, "input_tokens": 0, "output_tokens": 0},
  "obsidian_receipt": {"path": "append-only-path", "sha256": "digest"},
  "failure_fingerprint": "sha256-or-null"
}
```

### 7.6 `hermes_proposal` and `observer_event`

```json
{
  "hermes_proposal": {
    "outcome_digest": "sha256",
    "authority": "PROPOSAL_ONLY",
    "claims": [{"class": "OBSERVED|INFERRED", "text": "claim", "sources": ["ref"]}],
    "contradictions": [{"left": "ref", "right": "ref"}],
    "memory_delta": [{"operation": "APPEND_PROPOSAL", "content": "bounded"}],
    "next_hypothesis": "testable statement",
    "falsifiers": ["condition"],
    "supersedes": ["proposal-id"],
    "confidence": 0.0
  },
  "observer_event": {
    "event_id": "content-addressed-id",
    "event_type": "outcome_terminal",
    "object_id": "candidate-or-run-id",
    "object_digest": "sha256",
    "receipt_refs": ["local-ref"]
  }
}
```

## 8. State machines and failure isolation

### 8.1 Lane P

```text
DETECTED
  -> CANDIDATE
  -> ADMITTED | PROPOSED_NOT_ADMITTED
  -> CONTEXT_COMPILED
  -> WRITING
  -> VERIFIED
  -> REVIEWED
  -> ACCEPTED_LOCAL | REPAIR | BLOCKED_CAUSAL | REJECTED_REGRESSION
```

### 8.2 Lane C

```text
OUTCOME_AVAILABLE
  -> HERMES_SHADOW_PENDING
  -> PROPOSAL_STAGED | CONTEXT_DEFERRED

OUTCOME_AVAILABLE
  -> PAPERCLIP_OBSERVED | OBSERVER_DEFERRED

CANARY_ELIGIBLE
  -> PI_PAIRED_RESULT | PI_DISABLED
```

Failures are isolated by design:

- Lane C unavailable: Lane P continues and queues one content-addressed
  terminal envelope; duplicate enqueue is impossible.
- Obsidian Sync unavailable after context freeze: local append-only receipt is
  queued and flushed idempotently; product gates do not rerun.
- WikiLLM unavailable: exact source references remain usable; no stale index is
  treated as current.
- Headroom unavailable: the affected AI call fails closed; no direct fallback.
- Claude transport overload: resume the same bound session at most twice.
- Claude causal stall: terminate the exact process group and preserve evidence.
- Codex failure: no acceptance; one bounded retry only for a typed transport
  failure, never for a substantive verdict.
- Hermes route ambiguity or missing receipt: `CONTEXT_DEFERRED`; Lane P is
  unaffected.
- Paperclip failure: `OBSERVER_DEFERRED`; no task or lease state changes.
- Pi failure: disable the canary; no effect on admission or acceptance.
- duplicate scheduler/writer or path escape: safety violation, terminate the
  affected process, return autonomy to shadow and require a reviewed recovery.

## 9. Budgets

| Phase | AI budget | Runtime/context guardrail |
|---|---:|---|
| Unchanged frontier | 0 calls | `SKIP_NO_AI`; no Obsidian churn |
| Admission | 0 calls | one deterministic candidate, 1–3 files |
| Optional candidate planning | max 1 call per changed frontier | structured proposal only; no admission authority |
| Claude writer | one long session | 60–180 min normal; 3 h hard; same-session overload resume ≤2 |
| Codex review | 1 + max 1 re-review | ≤16k chars input packet per attempt; target ≤30k aggregate input tokens |
| Hermes | max 1 per batch of 1–3 terminal outcomes | ≤12k source chars; ≤2k structured output chars |
| Paperclip | 0 AI calls in observer mode | event-driven; content-addressed dedupe |
| Pi | 0 baseline, 1 paired canary | read-only, short schema-bound output |
| Meta-audit | 0 on unchanged material | daily/weekly or material event, not every idle tick |

Primary efficiency is measured per accepted unit, not per scheduler tick:

- `ACCEPTED_LOCAL / wall-hour`;
- AI calls, input/output tokens and wall time per `ACCEPTED_LOCAL`;
- attempts and repairs per `ACCEPTED_LOCAL`;
- human cleanup minutes;
- safety violations and regressions, both target zero.

Headroom cost remains labeled `GLOBAL_WINDOW_UPPER_BOUND` until the gateway can
attribute billing to an exact route.

## 10. Convergence contract

For a frozen candidate, define:

```text
D =
  failed_acceptance_criteria
  + failed_deterministic_gates
  + unresolved_major_findings
  + scope_violations
  + regressions
```

A productive cycle converges only if:

- `D` decreases without widening paths or changing the oracle;
- every major claim is traceable to exact source, diff, command output or
  receipt;
- the same failure fingerprint is not retried more than twice;
- task state becomes terminal with a new causal fact;
- Obsidian and GitHub references do not contradict the accepted local commit;
- Lane C suggestions remain proposals until independently tested.

The only successful product terminal is `ACCEPTED_LOCAL`. `BLOCKED_CAUSAL` is
an honest terminal, not accepted throughput. Process liveness, note count,
route count and elapsed model time are not substitutes.

## 11. Promotion and rollback

### Immediate Lane P promotion

`PROGRESSIVE_LOW_RISK_V1` may admit one task at a time because the operator has
approved Stage 1. Stable low-risk autonomy still requires:

- at least 21 accepted tasks out of 30;
- Wilson lower confidence bound above 50%;
- zero safety violations and regressions;
- no statistically material increase in human cleanup.

### Lane C promotion

- Hermes moves from shadow proposal to a next-cycle planning input only after
  route-attested persistence and a paired experiment show non-inferior
  acceptance with lower time/tokens or better source-grounded recall.
- Paperclip gains a single event wake-up canary only after three serial
  `ACCEPTED_LOCAL` outcomes without coordination divergence.
- Pi remains disabled unless its paired canary reduces time or cost without
  degrading acceptance or provenance.
- Headroom transforms remain disabled until ten accepted units; promotion
  requires at least 30 comparable paired observations.

Any authority violation restores the previous content-addressed champion,
disables the offending Lane C component and returns autonomous admission to
shadow. Runtime state, evidence and local commits are retained; no destructive
rollback discards diagnostic evidence.

## 12. Acceptance criteria

This design is implemented only when:

1. one valid 1–3-file candidate is admitted by
   `PROGRESSIVE_LOW_RISK_V1` without a policy edit;
2. an invalid source, dirty base, critical path, overlap, unapproved command or
   fourth path is deterministically rejected;
3. one long Claude Opus/max session runs under the existing lease, sandbox and
   Headroom route boundary;
4. complete deterministic gates and one Codex SOL/xhigh review produce a
   hook-respecting local commit and `ACCEPTED_LOCAL`;
5. no push, PR, merge, deploy or protected-canon write occurs;
6. the exact outcome is recorded locally, in append-only Obsidian evidence and
   in an operator-authorized GitHub issue `#215` status block;
7. the next unchanged tick produces `SKIP_NO_AI`, `ai_calls=0`, no route
   receipt and no Obsidian churn;
8. Hermes can later consume the outcome through an attested app-server path,
   while raw `openai-codex` and background raw memory review remain disabled;
9. Paperclip can observe idempotent terminal events without scheduling work;
10. Pi and Headroom optimizations remain canaries with explicit baseline,
    rollback and marginal-benefit evidence.

Passing criteria 1–7 establishes a minimally productive Lane P. It does not
establish autonomous-system superiority or prove the marginal value of Hermes,
Paperclip, Pi or Headroom optimization.
