# ARDESIA two-lane productive throughput — implementation plan

> **For Codex:** execute this plan task by task with independent review after
> every implementation slice. Keep each cycle at five tracked files or fewer.
> Do not push, open a pull request, merge or deploy. Operational publication is
> limited to the operator-authorized append-only Obsidian evidence and one
> bounded `ardesia-status` block on GitHub issue `#215` after its stated proof
> gates pass.

**Goal:** Produce the first real `ACCEPTED_LOCAL` product unit through a minimal
Lane P, then attach Hermes, Paperclip and Pi as failure-isolated Lane C
components with measured marginal value.

**Architecture:** The deterministic controller remains the sole scheduler and
admission authority. `PROGRESSIVE_LOW_RISK_V1` turns one complete,
source-grounded, low-risk candidate into runtime `PENDING` state. Claude
Opus/max is the sole long-session writer; deterministic gates precede one
Codex SOL/xhigh review and at most one repair/re-review. Hermes, Paperclip and
Pi consume bounded contracts asynchronously and cannot block Lane P. Headroom
is required and lossless until a later paired A/B experiment.

**Primary evidence:** `ACCEPTED_LOCAL` per wall-hour, attempts/tokens/wall-time
per accepted unit, first-pass acceptance, human cleanup, and zero safety
violations/regressions. Service liveness alone is not success.

**Design:** `docs/superpowers/specs/2026-07-28-ardesia-two-lane-throughput-design.md`

---

## Global execution rules

1. Start each task from a clean branch and record the exact base SHA.
2. Read current `AGENTS.md`, project instructions and operator orders before
   editing.
3. Run the full deterministic controller suite before and after every code
   slice.
4. Inspect `git diff` before staging; stage only the enumerated files.
5. Maximum five tracked files per implementation/review cycle.
6. One implementer, one independent-role reviewer, at most three fix rounds.
7. Do not add a dependency, change a package manifest or activate a remote
   service implicitly.
8. Do not push, create a PR, merge or deploy.
9. Never treat a manual trigger as evidence of a scheduled trigger.
10. A GitHub issue comment is published only after the corresponding
    falsifiable proof passes and must include exact IDs/digests, measured
    metrics, known limitations and `no merge/deploy/push`.

Baseline command:

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

Rollback is evidence-preserving: disable the new runtime mode or adapter,
restore the previous content-addressed policy/controller pair, retain receipts,
and do not delete failed worktrees or terminal artifacts.

---

## Task 1 — Implement `PROGRESSIVE_LOW_RISK_V1`

**Purpose:** Remove the current mathematical zero in new-task admission without
giving a model authority over policy, gates or scope. This slice starts
immediately and does not wait for Hermes, Paperclip or Pi.

**Tracked files (exactly four):**

- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py`
- Modify: `ops/dev-os/control-plane/policy.source.json`
- Modify: `ops/dev-os/control-plane/test_ardesia_control_plane.py`
- Modify: `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md`

### Step 1: Freeze the runtime contract in failing tests

Add fixtures for a complete `frontier_candidate` and its source snapshots.
Write failing tests proving:

- policy accepts the new queue mode `PROGRESSIVE_LOW_RISK_V1` only with the
  exact reviewed oracle configuration;
- the legacy immutable task ledger remains immutable and terminal;
- at most one runtime candidate can be admitted while no productive task is
  nonterminal;
- one, two and three exact non-critical file paths can pass;
- zero paths, a fourth path, a glob, absolute path, traversal, `.git`, symlink,
  submodule and critical/protected path fail;
- dependency/manifest, migration, CI, auth, security, secrets, payments,
  billing, cloud and infrastructure paths fail;
- unknown source authority, missing source, source digest mismatch, stale
  GitHub snapshot and mutable/agent-generated-only source fail;
- non-clean or wrong exact base SHA fails;
- open-PR, other-worktree, active-lease and active-task overlap fail;
- missing acceptance, missing falsifier, shell-string command, command
  substitution and command outside the exact allow-list fail;
- candidate ID, schema hash, material digest and overlap digest are verified;
- an admitted record is content-addressed, append-only, runtime-local and
  `PENDING`;
- rejection remains `PROPOSED_NOT_ADMITTED` and dispatches no writer;
- identical candidate reprocessing is idempotent;
- terminal repeated candidate/failure fingerprint does not retry;
- admission performs zero AI calls and cannot mutate tracked policy.

Run the focused tests and verify that they fail for absence of the new oracle,
not because fixtures are malformed.

### Step 2: Implement strict schema and policy validation

Add a frozen `progressive_admission` policy object containing:

- mode `PROGRESSIVE_LOW_RISK_V1`;
- maximum active tasks `1`;
- maximum paths `3`;
- exact approved source namespaces;
- exact forbidden path classes/prefixes;
- exact verification argv allow-list;
- retry/failure-fingerprint budget;
- remote-write prohibition.

Reject additional fields and ambiguous configurations. Do not make model output
or Obsidian proposal status an authority signal.

### Step 3: Implement deterministic candidate ingestion and admission

Add pure helpers that:

1. parse and strictly validate `frontier_candidate`;
2. resolve approved source references and verify their digests;
3. recompute candidate/material/overlap digests;
4. query exact GitHub/worktree/lease coordination state;
5. classify risk and paths from deterministic rules;
6. validate exact argv arrays against the allow-list;
7. write a content-addressed `admission_receipt`;
8. atomically create one runtime `PENDING` record only after every check passes.

Keep the old immutable queue ledger unchanged. A progressive record uses a
separate namespaced state/ledger so an admitted runtime candidate cannot be
mistaken for a policy task.

### Step 4: Connect admission to `productive_tick`

When the immutable queue is terminal:

- unchanged exogenous digest remains `SKIP_NO_AI`;
- a complete source-grounded candidate is passed to the oracle;
- `ADMITTED` becomes the only new path to writer dispatch;
- rejected/incomplete candidates create one bounded local receipt and no AI
  loop;
- an active writer causes coalescing, not duplicate dispatch;
- 30-minute wake cadence never changes the 10,800-second writer timeout.

The writer/reviewer identities, Headroom boundaries, one-repair budget and
remote-write prohibitions remain frozen.

### Step 5: Update operator documentation

Document:

- the difference between candidate proposal and deterministic admission;
- the exact low-risk exclusions;
- one-to-three-file scope;
- local-commit-only terminal;
- unchanged `SKIP_NO_AI`;
- long Claude session and one Codex review;
- Hermes/Paperclip/Pi not required for this path.

### Step 6: Verify

Run:

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
python3 ops/dev-os/control-plane/ardesia_control_plane.py \
  --policy ops/dev-os/control-plane/policy.source.json \
  materialize-policy --review-minute 0
git diff --check
git status --short
```

Expected:

- all existing and new tests pass;
- materialized policy is valid;
- no existing route, context, Obsidian, skip or immutable-queue test regresses;
- only the four enumerated files differ.

### Step 7: Review, commit and rollback receipt

Independent review must inspect schema strictness, content-addressing, overlap,
TOCTOU boundaries, command allow-list, idempotency and dispatch authority.

Commit only after clean review:

```text
feat(control-plane): admit bounded low-risk runtime tasks
```

Rollback:

- set the runtime admission mode back to the prior immutable-only champion;
- restore the previous four-file commit;
- leave candidate/admission receipts as evidence;
- verify the next tick cannot dispatch a progressive task.

GitHub documentation receipt after local verification:

- one bounded issue `#215` `ardesia-status` block with commit SHA, oracle
  digest, test count, explicit `NOT_YET_PRODUCTIVE`, and no secrets/prompts.

---

## Task 2 — Prove the first real `ACCEPTED_LOCAL`

**Purpose:** Demonstrate useful product throughput, not just control-plane
liveness.

**Tracked files:** none expected. The product candidate itself is constrained
to one to three files in its own isolated product worktree and local branch.
If controller code must change, stop and return to a separately reviewed Task 1
fix cycle of no more than five files.

### Step 1: Select and freeze one real candidate

From an approved GitHub or canonical Obsidian source, resolve a candidate that:

- is low-risk and non-critical;
- touches one to three exact files;
- starts from the exact clean product SHA;
- has no open-PR/worktree/lease overlap;
- has non-tautological acceptance criteria and falsifiers;
- uses only reviewed exact verification argv;
- requires no dependency, migration, CI, auth, security, cloud or protected
  file change.

Persist the source snapshots, candidate JSON and digests before admission.
Do not recycle a blocked BETA task unless its exact causal blocker is removed
and the candidate independently satisfies the new contract.

### Step 2: Observe real deterministic admission

Use the normal controller path, not a test-only mutation. Record:

- `candidate_id`;
- source and material digests;
- `admission_receipt` and oracle digest;
- exact base SHA;
- GitHub/worktree overlap snapshot;
- runtime `PENDING` transition.

If admission fails, fix the candidate or record one causal blocker. Do not
weaken the oracle.

### Step 3: Observe the long Claude writer

Require:

- Claude `opus`/`max`;
- existing Headroom-only outer network sandbox and unique route receipt;
- isolated worktree and renewable lease;
- a single session ID;
- heartbeat every 30 seconds;
- 60–180 minute normal window and 10,800-second hard timeout;
- no duplicate writer from the next 30-minute wake-up;
- same-session resume only for a typed overload.

Do not stop a healthy writer because a scheduler tick arrived. Do stop a
causally stalled writer when its diff/test/progress fingerprint remains
unchanged for 30 minutes.

### Step 4: Run gates and Codex review

Record pre/post:

- changed-path inventory;
- candidate-focused tests;
- required full tests;
- typecheck;
- build;
- project score/baseline when applicable;
- final GitHub/worktree overlap;
- route metrics for Claude and Codex.

Run one Codex `gpt-5.6-sol`/`xhigh` read-only review using only the candidate,
diff and evidence. Permit one repair and one complete re-review at most.

### Step 5: Accept locally

Only if all gates and review pass:

- create a normal hook-respecting local commit;
- transition to `ACCEPTED_LOCAL`;
- generate `outcome_envelope`;
- append a local and Obsidian evidence receipt;
- rebuild WikiLLM only from the resulting exact Markdown source digest;
- perform no push, PR, merge or deploy.

### Step 6: Prove the unchanged successor tick

Wait for the next real scheduled 30-minute trigger. It must record:

- `SKIP_NO_AI`;
- `ai_calls=0`;
- no Headroom route receipt;
- no Obsidian churn;
- no duplicate writer or task.

A manual trigger is not acceptable evidence for this step.

### Step 7: Publish the proof receipt

Publish one operator-authorized `ardesia-status` block to GitHub issue `#215`
containing:

- candidate/run IDs and digests;
- local commit SHA and exact changed paths;
- all gate result digests;
- Codex verdict and route receipt digest;
- Claude/Codex request, token, latency and upper-bound cost observations;
- writer duration and repair count;
- Obsidian receipt and WikiLLM source digest;
- scheduled `SKIP_NO_AI` evidence;
- explicit statement that one accepted unit proves minimal local productivity,
  not statistical superiority or permission to merge/deploy/push.

Rollback:

- stop only the exact worker process group if still live;
- retain the local branch, worktree and receipts;
- disable progressive admission to shadow if any authority/path violation
  occurred;
- do not discard a failing diff with a destructive Git command.

Task 2 passes only with a real `ACCEPTED_LOCAL`. A green controller, route
receipt or `BLOCKED_CAUSAL` does not substitute.

---

## Task 3 — Add the Hermes safe context adapter and shadow canary

**Purpose:** Retain long-lived context and convergence without introducing a
second writer, scheduler or un-attested inference path.

**Prerequisite:** Task 2 has one `ACCEPTED_LOCAL`.

**Tracked files (maximum five):**

- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py`
- Modify: `ops/dev-os/control-plane/policy.source.json`
- Modify: `ops/dev-os/control-plane/test_ardesia_control_plane.py`
- Modify: `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md`
- Optional add: `ops/dev-os/control-plane/hermes_context_adapter.py`

If the adapter fits cleanly in the controller, omit the fifth file.

### Step 1: Write negative tests first

Prove:

- raw provider `openai-codex` is rejected;
- `codex_responses`, provider fallback, auxiliary image/model clients, browser,
  shell, cron and delegation are disabled;
- automatic background raw memory and skill review remain off;
- a missing/mismatched Headroom route receipt fails closed;
- Headroom-down produces `CONTEXT_DEFERRED`, never direct routing;
- Hermes cannot acquire a writer lease, modify product, schedule a task, write
  GitHub or write a protected Obsidian root;
- unknown output fields, missing source provenance and inference-as-self-
  evidence are rejected;
- duplicate outcome batches and proposals are idempotent.

### Step 2: Implement the app-server-only adapter

Use the already verified Codex App Server lifecycle with:

- frozen controller-owned Headroom provider;
- unique route correlation;
- dedicated private `HERMES_HOME`;
- one persistent ARDESIA session/lineage identifier;
- batch of one to three `outcome_envelope` objects;
- at most 12,000 source characters;
- strict `hermes_proposal` output no larger than 2,000 characters;
- explicit `OBSERVED` and `INFERRED` claims;
- no product or canonical write tools.

Issue `#5875` remains a hard constraint. Do not call the raw Hermes
`openai-codex` provider. Because app-server turns do not expose all native
Hermes memory tools, store only the proven session lineage and controller-
validated proposal. Do not claim native background memory persistence that was
not observed.

### Step 3: Stage append-only context

Permit the controller, not Hermes, to create:

- `85-Agent-Proposals/Hermes/<cycle_id>/proposal.md`;
- `92-Evidence/Hermes/<cycle_id>/receipt.md`.

Use create-only semantics, exact source/outcome digests and no symlinks,
overwrite, rename, delete or protected-root access.

### Step 4: Run a shadow canary

Feed the Task 2 `outcome_envelope`; verify:

- app-server model/provider/route attestation;
- persistent session resume across adapter restart;
- structured contradiction/memory/next-hypothesis output;
- append-only Obsidian staging;
- WikiLLM lookup by exact resulting source digest;
- Lane P can complete another deterministic tick while Hermes is disabled,
  delayed or failing.

Run:

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
git diff --check
git status --short
```

Commit after independent review:

```text
feat(control-plane): add attested Hermes context shadow
```

Rollback:

- set Hermes state to disabled;
- stop the exact adapter process;
- preserve private session and append-only proposal receipts;
- confirm Lane P still admits and executes independently.

GitHub receipt:

- issue `#215` status block with app-server route digest, restart/resume
  evidence, no-bypass test, protected-write denial and explicit
  `PROPOSAL_ONLY`; do not claim benefit yet.

---

## Task 4 — Add Paperclip as an event-driven observer

**Purpose:** Gain an operational run/budget ledger and UI without a second
scheduler or authoritative queue.

**Prerequisite:** Task 2 passes. Task 3 may be healthy or deferred; Task 4 must
not depend on it.

**Tracked files (maximum five):**

- Add: `ops/dev-os/control-plane/paperclip_observer.py`
- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py`
- Modify: `ops/dev-os/control-plane/policy.source.json`
- Modify: `ops/dev-os/control-plane/test_ardesia_control_plane.py`
- Modify: `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md`

Any Paperclip installation is performed outside product repositories and only
after its exact version, provenance and operator authorization are recorded.
No package manifest is changed.

### Step 1: Freeze the observer contract

Define strict content-addressed events:

- `candidate_admitted`;
- `writer_started`;
- `writer_completed`;
- `review_completed`;
- `outcome_terminal`.

Each event carries only object IDs/digests, state, bounded metrics and receipt
references. It never includes prompts, secrets, headers or full messages.

### Step 2: Write tests

Prove:

- duplicate event ID/digest is idempotent;
- conflicting reuse of an event ID fails;
- events cannot create/alter a candidate, acceptance, task, lease or writer;
- observer failure returns `OBSERVER_DEFERRED` and does not affect Lane P;
- no periodic AI heartbeat or Paperclip-owned timer exists;
- replay preserves event order and terminal uniqueness;
- budgets are observations, not admission authority;
- Paperclip cannot write product, GitHub or protected Obsidian roots.

### Step 3: Implement an outbox and observer

The controller writes an append-only local outbox after its own state
transition. Paperclip reads and acknowledges events. Delivery is at-least-once;
consumer state is idempotent. Backpressure is bounded and never holds the
writer lease.

Start Paperclip read-only as observer/UI/budget ledger. Do not enable its agent
adapters or scheduling routines.

### Step 4: Verify failure isolation

Replay the Task 2 outcome and then:

- stop Paperclip;
- execute a Lane P no-change tick;
- restart and replay the outbox;
- verify exactly one mirrored terminal outcome and no changed controller state.

Run the full controller suite and inspect Paperclip logs for zero AI calls.

Commit after independent review:

```text
feat(control-plane): mirror terminal events to Paperclip
```

Rollback:

- disable observer delivery;
- preserve the local outbox;
- stop Paperclip without changing controller state;
- verify Lane P remains green.

GitHub receipt:

- issue `#215` block with event count/digests, dedupe replay, outage proof,
  zero AI calls and explicit observer-only authority.

After three serial `ACCEPTED_LOCAL` outcomes with zero coordination divergence,
write a separate plan before allowing one event-only wake-up canary. Do not add
that authority in this task.

---

## Task 5 — Run a Pi paired canary, then a separate Headroom A/B

**Purpose:** Test whether a cheaper bounded challenger and later one Headroom
transformation improve accepted-unit economics without reducing quality.

**Prerequisites:**

- Task 2 passes;
- at least three comparable Lane P candidates exist before interpreting Pi;
- at least ten `ACCEPTED_LOCAL` units exist before changing Headroom behavior.

**Tracked files for the Pi slice (maximum five):**

- Add: `ops/dev-os/control-plane/pi_canary.py`
- Modify: `ops/dev-os/control-plane/ardesia_control_plane.py`
- Modify: `ops/dev-os/control-plane/policy.source.json`
- Modify: `ops/dev-os/control-plane/test_ardesia_control_plane.py`
- Modify: `docs/ops/ARDESIA-MCP-CONTROL-PLANE.md`

The later Headroom A/B is a separate maximum-five-file review cycle and commit.
Do not combine Pi activation and Headroom transformation in one experiment.

### Step 1: Define the Pi canary

Pi receives the same bounded candidate packet as deterministic triage and may
emit only:

- structured risk flags;
- missing-provenance flags;
- suggested prioritization;
- confidence and abstention.

It has no filesystem write, MCP write, task, lease, schedule, review or canon
authority.

### Step 2: Prove Headroom routing before use

Tests and live canary must show:

- exact Pi executable/version;
- controller-owned loopback base URL;
- unique Headroom route receipt;
- no direct-provider fallback;
- Headroom-down failure closed;
- denied tool set and bounded output.

An adapter claim is not enough. If upstream Pi cannot be route-attested through
Headroom, record `PI_DISABLED_UNATTESTED` and stop.

### Step 3: Run paired observations

For comparable candidates, record deterministic baseline first, then Pi
challenger using frozen packets and randomized order where applicable. Pi
cannot change which task is admitted. Measure:

- agreement with deterministic risk/provenance checks;
- latency and input/output tokens;
- false-negative safety flags;
- downstream first-pass acceptance;
- human correction minutes.

Commit the canary only after independent review:

```text
feat(control-plane): add route-attested Pi triage canary
```

Rollback:

- disable Pi and remove it from event consumption;
- retain paired receipts;
- confirm candidate admission is byte-for-byte unchanged.

GitHub receipt:

- issue `#215` block with sample size, paired observations, route proof and an
  honest `NO_PROMOTION` or promotion recommendation.

### Step 4: Plan and run Headroom A/B separately

Only after at least ten accepted units:

1. freeze the lossless/stateless champion;
2. select one transformation only: structural compression of tool output;
3. use at least 10% randomized holdout;
4. keep Claude `max`, Codex `xhigh`, candidate, acceptance and timeouts fixed;
5. collect at least 30 comparable paired units before a promotion claim;
6. bootstrap the paired median for tokens per accepted unit;
7. examine acceptance, source fidelity, major findings, diff quality and human
   cleanup;
8. roll back automatically for a lost citation, new major finding, worse
   accepted diff, safety violation or acceptance regression.

Headroom cost must remain `GLOBAL_WINDOW_UPPER_BOUND` unless exact per-route
billing becomes available. Do not advertise upstream savings as observed
ARDESIA savings.

Suggested separate commit only after the A/B harness passes review:

```text
test(control-plane): add Headroom compression holdout
```

---

## Final system review

After Tasks 1–5:

1. generate a complete base-to-head diff and evidence index;
2. verify no task exceeded five tracked files per review cycle;
3. run the full deterministic controller suite;
4. verify all managed AI paths fail closed without Headroom;
5. verify exactly one scheduler, one admission authority and one writer per
   worktree;
6. verify Obsidian protected roots and GitHub remote remain unmodified except
   for explicitly authorized issue-status comments;
7. verify WikiLLM is derivable from exact Markdown source digests;
8. compute accepted units/hour, tokens/accepted unit, first-pass rate, repair
   rate, human cleanup and safety violations;
9. distinguish observed facts, inferences and unsupported component-benefit
   claims;
10. conduct one independent whole-branch review and one scoped re-review if
    findings require fixes.

Do not merge, deploy or push at the end of the plan. Hand the local branch,
commits, receipts, issue links and unresolved falsifiers to the operator.
