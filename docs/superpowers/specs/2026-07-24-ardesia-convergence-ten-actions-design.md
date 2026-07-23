---
id: ardesia-convergence-ten-actions-design-2026-07-24
type: design-specification
status: REVIEW_PENDING
project: ARDESIA
owner: Andrea Marro
created: 2026-07-24T01:04:36+02:00
timezone: Europe/Rome
source_of_truth: false
authority: approved-design-proposal-pending-written-review
base_sha: ad8f0f9f42733bfb95dedd05b4a09734f91947f8
execution_mode: serial-no-swarms
related:
  - REPORT_ARDESIA_AUDIT_TOTALE_2026-07-23.md
  - PIANO_ARDESIA_CONVERGENZA_HARNESS_LLM_VLM_2026-07-23.md
  - ARDESIA_PIANO_10_AZIONI_ALTA_LEVA_2026-07-23.md
---

# ARDESIA Convergence Program — Ten Actions Design

## 1. Decision and intent

ARDESIA will be improved through one serial convergence program, not ten
parallel initiatives. The program converts the ten attached recommendations
into executable boundaries, evidence-producing gates, reversible migrations,
and small implementation slices.

The governing idea is:

> Preserve ARDESIA's product potential by reducing competing authorities and
> special paths, not by deleting capabilities or rewriting the product.

The program therefore preserves:

- the local-first living-board product thesis;
- the append-only lesson and evidence history;
- the Python LessonOS research engine;
- the Simulation vertical and its physical/didactic IP;
- the ELABTutor Pack content and methodology;
- the future possibility of multiple plugins, Packs, and projection engines;
- legacy sources until their useful behavior has characterization coverage and
  an explicit salvage disposition.

The program does not equate more code, more tests, or more documents with
product readiness. Source integration, local verification, served bytes,
operational rollback, and human use remain separate evidence planes.

## 2. Evidence boundary and temporal adjudication

### 2.1 Frozen inputs

The design was derived from these locally verified inputs:

| Source | SHA-256 or Git identity | Role |
|---|---|---|
| `ardesia_analisi_opus48-2026-07-23_1632.zip` | `0c7305a6a6341d7d67ac7d23ebc85a493badf4d9797fb4c565eeb94baeee6e6a` | measured local/GitHub/Obsidian audit |
| `ardesia_analisi_opus48-2026-07-23_1912.zip` | `150fe5f15a21a42c56009ac37571133b8ea35dbe5b2e3fe68d20cc8676e10df8` | later corrective adjudication |
| total audit report | `c31cd6c7a9da8e96ced72843a401a6932eb2f5fb4c821637186c15e4384be765` | cross-snapshot synthesis |
| convergence/harness plan | `9cff6ba5a72b0ba35e6e3b57298b2b2a99726727b7d4dd407ee83bc2d93d0482` | operating-model proposal |
| ten-actions plan | `c84bf09e69c9fd9e65ec45a23e2c842cef59cf1c0725ce6dafeca37853a9e23c` | detailed non-normative blueprint |
| product base | `ad8f0f9f42733bfb95dedd05b4a09734f91947f8` | integrated source baseline |
| protected local Continuity slice | `dbe49aa27ef017a47e08a3725e8dd6490b3dced0` | one unpushed commit, outside this branch |

Where the 19:12 archive contradicts the 16:32 archive, the 19:12
adjudication wins for its measured scope. Neither archive becomes product
authority merely because it is newer. Git bytes, current tests, current build,
and behavior observed on the exact candidate remain higher technical evidence.

### 2.2 Baseline established for this design

The isolated worktree was created from the exact base SHA above. Before this
document was written, `npm run verify` completed with:

- Engine: 2044 passed, 7 skipped;
- Studio: 1970 passed, 5 skipped;
- Studio typecheck: exit 0;
- Studio production build: exit 0;
- build warning retained: multiple chunks exceed the existing 500 kB warning
  threshold.

This is a source/build baseline, not evidence of a deployed Founder Beta or
human product value.

## 3. Constitutional constraints

Every implementation unit inherits these constraints:

1. Serial execution only. No swarms, parallel agents, model councils, or
   concurrent implementation lanes.
2. Never push directly to `main` or `master`; never merge autonomously.
3. No push, PR creation, GitHub mutation, deployment, secret change, purchase,
   cloud activation, destructive cleanup, or external publication without the
   applicable human authorization.
4. No `reset --hard`, `clean -fd`, force push, `--no-verify`, broad recursive
   deletion, or unreviewed data removal.
5. No new npm dependency or framework without Andrea's explicit approval.
   Initial gates use Python standard library, existing npm packages, Git, and
   repository-local scripts.
6. Maximum five changed files per implementation cycle unless Andrea approves
   a larger generated/vendor-only boundary.
7. One hypothesis and one independently reviewable outcome per cycle.
8. Production behavior changes follow RED → observed causal failure → minimal
   GREEN → adjacent/full verification.
9. Evaluators, baselines, Canon, and merge policy cannot be changed by the
   candidate they judge.
10. Existing dirty worktrees and the local `dbe49aa2` Continuity slice are
    preserved and excluded from this branch unless Andrea explicitly disposes
    or integrates them.
11. No real student PII, corpus, lesson contents, secrets, or direct personal
    data enter Git, CI artifacts, screenshots, or eval transcripts.
12. AgentMemory remains `RETIRED_NO_READ_NO_WRITE`.
13. The product tutor name remains UNLIM. Existing product invariants and
    Principle Zero are not changed by this convergence program.
14. No rewrite of ARDESIA, Excalidraw, Simulation, LessonOS, or ELABTutor.
15. No success or readiness claim without fresh command output tied to the
    exact candidate. User-facing behavioral fixes require explicit user
    verification before they are described as resolved.

## 4. Program architecture

The ten actions are arranged as one dependency graph:

```text
Truth/control plane
  ├── evidence and CI pyramid
  ├── executable architecture boundaries
  └── release/supply-chain inventory
          │
          ├── LessonOS authority
          ├── unified plugin runtime
          └── .lesson transaction model
                  │
                  ├── ELAB/Simulation strangler
                  ├── monolith seams
                  └── bounded Quality Lab
                          │
                          └── identifiable, reversible candidate
```

The architecture has five control surfaces.

### 4.1 State control surface

A deterministic, read-only-by-default generator derives current state from
Git and, when explicitly enabled, read-only GitHub queries. It never becomes a
second hand-maintained authority.

The generated state distinguishes:

- accepted base SHA;
- active local branch and worktree;
- dirty/ahead/behind status;
- open work whose disposition is known or unknown;
- active human decisions;
- stale documentation claims;
- release/evidence identity;
- freshness and generation inputs.

The first implementation does not delete worktrees, close PRs, or apply
labels. It emits a proposed disposition and refuses destructive action when a
branch has uncommitted, untracked, unreachable, or unbundled work.

### 4.2 Verification control surface

The gate pyramid separates cheap structural failures from deep behavioral
evidence:

| Gate | Purpose | Initial implementation |
|---|---|---|
| G0 | syntax, scope, freshness, forbidden paths, exact base | standard-library scripts and existing tools |
| G1 | focused type/lint/contract tests and negative controls | affected files plus sticky baselines |
| G2 | Studio/Engine integration and persistence contracts | existing deterministic suites |
| G3 | Founder golden path, keyboard/touch, console, cold reopen | existing Playwright, introduced only after written flow approval |
| G4 | mutation, dead code, bundle, supply chain, flake cohorts | optional tools only after approval and bounded canary |
| G5 | artifact identity, smoke, rollback receipt | external action, human-gated |

Evidence produced by CI lives as a run artifact or release attachment. A
commit must not generate another commit merely to record the SHA of the first
commit.

### 4.3 Architecture control surface

Executable rules enforce directional boundaries while baselining existing
debt:

- Core depends on contracts and ports, not concrete ELAB/Simulation modules.
- Packs contain data and methodology, not shell, auth, storage drivers,
  dashboard, Supabase, or runtime AI clients.
- Plugins use host capabilities and a runtime port; they do not write directly
  to LessonOS storage or global UI state.
- Session-scoped LessonOS reads cannot call global `readAll` paths or implicit
  last/current-room fallbacks.
- Views cannot own raw FSA/IndexedDB persistence semantics.
- Legacy adapters are named, read-only when possible, owned, measured, and
  expire through an explicit removal gate.

The initial rule engine is repository-local and standard-library based.
`dependency-cruiser` or a custom ESLint rule is a future challenger, not an
assumed dependency.

### 4.4 Runtime/data control surface

Three decisions define runtime convergence:

1. The local Studio TypeScript append-only event log is proposed as the sole
   mutable lesson/session history.
2. The Python Engine is proposed as a reproducible projection and research
   consumer; it cannot silently mutate the canonical history.
3. Built-in and installed plugins have separate acquisition/trust paths but a
   shared post-acquisition runtime lifecycle and receipt model.

These are design proposals until their ADRs receive human ratification.

### 4.5 Knowledge and claims control surface

Documentation synchronization is strict and evidence-first:

- code/config/current Git beats prose for implemented-state claims;
- active human decisions beat non-normative plans;
- historical documents remain immutable where possible and receive
  superseding markers or append-only corrections;
- every current-state claim records its evidence type and observation time;
- `NOT_RUN`, `BLOCKED`, `PARTIAL`, and `HUMAN_GATE` remain first-class outcomes;
- no document may silently promote a source slice to release, product, or
  pedagogical evidence.

## 5. The ten actions

### Action 1 — Single control plane and entropy budget

**Outcome:** a person or agent can determine the accepted base, active work,
unknown dispositions, and human gates within five minutes.

**Design:**

- generate a machine-readable current-state document from Git and bounded
  read-only GitHub inputs;
- validate it with a versioned schema;
- maintain one concise active-decision index;
- define sticky ceilings for active WIP, unclassified PRs, stale current-state
  evidence, and unowned adapters;
- produce worktree bundle/disposition proposals without executing deletion.

**Negative controls:**

- two active programs must fail validation;
- stale state must fail freshness;
- an unclassified open PR must fail the completeness report;
- a worktree with untracked or unreachable data must be ineligible for
  automated removal.

**Human gates:** GitHub labels/issues, branch/PR closure, worktree removal, and
bundle archival outside the repository.

**Potential preserved:** historical and experimental work remains recoverable
as donor/bundle evidence without competing with the integration line.

### Action 2 — CI pyramid and immutable evidence

**Outcome:** every accepted claim links base SHA, diff, evaluator identity,
result, artifact digest, and candidate SHA.

**Design:**

- introduce G0/G1 incrementally;
- add sticky lint and monolith ceilings without requiring immediate debt
  repayment;
- re-derive the Founder browser flow from current `main`, not by merging a
  historical stack blindly;
- store evidence outside the product tree;
- require a causal negative control for every new gate.

**Negative controls:**

- reintroducing a known flat-path read must make the boundary gate red;
- increasing per-file lint debt must make the ratchet red;
- generating evidence with a self-referential commit filename must be rejected;
- removing the visible error state from the Founder flow must make browser
  verification red.

**Human gates:** required-check changes and any GitHub ruleset mutation.

**Potential preserved:** deep tests remain available without slowing every
small edit; the pyramid makes cheap feedback required and expensive evidence
targeted.

### Action 3 — Executable architecture boundaries

**Outcome:** new Core/Plugin/Pack/LessonOS violations cannot enter unnoticed.

**Design:**

- publish a concise module map based on the current source tree;
- express initial path/symbol rules in a deterministic local checker;
- inventory legacy violations in a versioned baseline;
- fail only on new violations or expired exceptions;
- generate remediation that names the violated rule and allowed port.

**Negative controls:**

- Core importing a concrete ELAB Pack module;
- a Pack importing auth or Supabase runtime;
- a plugin writing LessonOS storage directly;
- a session reader using a global scan;
- a view importing a concrete storage driver.

**Human gates:** any exception that changes product semantics or creates a new
long-lived adapter.

**Potential preserved:** collaboration across layers occurs through versioned
ports instead of being banned.

### Action 4 — One LessonOS mutable authority

**Outcome:** one mutable history with multiple rebuildable projections.

**Design proposal:**

- Studio TS owns append-only local lesson/session facts, evidence, sequence,
  import/export identity, and recovery markers;
- Python owns graph/retrieval/recap/analysis projections tied to a source
  digest;
- the external LessonOS repository remains a research upstream imported
  consciously through drift guards;
- language-neutral versioned schemas and shared positive/negative fixtures
  prevent contract drift;
- legacy readers are recovery-only and cannot become implicit writers.

**Negative controls:**

- two sessions of one lesson cannot contaminate each other;
- corrupt input cannot yield a misleading partial projection;
- Python projection cannot mutate source bytes;
- a divergent upstream commit cannot change ARDESIA runtime without an
  explicit import;
- no second writer can pass the architecture gate.

**Human gate:** ratification of the authority ADR and any future dual-write
period.

**Potential preserved:** projection engines can become more sophisticated
without multiplying source histories.

### Action 5 — One plugin runtime with verified trust

**Outcome:** built-in and installed plugins converge after acquisition on one
lifecycle, capability, audit, ownership, storage, event, suspension, and kill
path.

**Design:**

- separate `PluginAcquisition` from `PluginRuntime`;
- derive a trust receipt from identity, publisher, version, bundle digest,
  source SHA, acquisition mode, and verified checks;
- adapt the current Founder registry behind the runtime port before removing
  it;
- require host services for grounded mutations; absence becomes a visible
  blocked state rather than fail-soft silence;
- use a deliberately small non-ELAB plugin only after Simulation uses the
  shared runtime.

**Negative controls:**

- digest or publisher mismatch refuses preparation;
- a built-in plugin without a receipt cannot mount;
- instance A cannot write instance B;
- missing capability refuses dispatch before handler execution;
- kill switch closes a live session;
- grounded LessonOS events require mount/command receipts.

**Human gate:** trust-model ADR, remote loading, third-party installation, and
any marketplace/publication surface.

**Potential preserved:** marketplace capability remains possible without
building catalog, billing, or public distribution prematurely.

### Action 6 — ELABTutor/Simulation strangler

**Outcome:** Simulation is a reusable plugin, ELABTutor is a pure Pack, and
ARDESIA Core owns shell/memory/storage/report/navigation.

**Design:**

- classify each guest dependency and runtime path as KEEP, MOVE, PACK DATA,
  LEGACY ARCHIVE, or REMOVE;
- freeze new standalone-only dependencies;
- extract existing scene, solver, diagnostics, instruments, and providers
  behind stable interfaces;
- keep the vendored solver byte guard until an equivalent contract and
  characterization suite exist;
- exclude legacy standalone paths from the ARDESIA production graph one
  function at a time;
- preserve removed behavior in source history and a salvage register.

**Negative controls:**

- the Pack must load without React, Supabase, auth, or AI runtime;
- Simulation must accept a non-ELAB Pack fixture conforming to the real Pack
  contract;
- chip/provider mismatch remains fail-closed;
- unverified provenance cannot guide a real lesson;
- no new standalone dependency may enter the Founder bundle.

**Human gates:** final legacy removal and any change to physical/didactic
semantics.

**Potential preserved:** ELAB methodology and Simulation IP become more
reusable rather than amputated.

### Action 7 — `.lesson` transaction, recovery, and concurrency

**Outcome:** import cannot silently leave mixed canonical state after failure,
restart, case aliasing, or concurrent writers.

**Design:**

```text
validate all inputs
  → acquire workspace mutation ownership
  → register lesson/session fencing token
  → stage in collision-safe namespace
  → verify schema, identity, inventory, and hashes
  → persist versioned commit intent
  → promote through the raw driver transaction port
  → verify read-back byte identity
  → persist commit marker
  → clean stage or expose diagnostic debris
  → release locks in fixed order
```

`withWorkspaceExclusive` cannot wrap the existing nested writes because the
coordinator is non-reentrant. The implementation must own the raw driver port
and a single lock order: workspace → activity → lesson → path.

**Negative controls:**

- truncated ZIP causes zero canonical writes;
- failure at every state-machine edge has a deterministic resume or rollback;
- two concurrent imports cannot interleave;
- `RoomA`/`rooma` aliasing is rejected before mutation on insensitive storage;
- future schema is not silently downgraded;
- failed import preserves the previous bytes exactly.

**Human gate:** lock-order/transaction ADR before production implementation.

**Potential preserved:** open local formats and offline ownership remain; no
cloud database is introduced.

### Action 8 — Monolith decomposition with characterization ratchets

**Outcome:** persistence, navigation, plugin, solver, and rendering changes no
longer require simultaneous understanding of the two largest components.

**Design:**

- characterize existing behavior before extraction;
- extract one vertical responsibility per cycle;
- keep internal exports minimal;
- measure fan-out, cycles, files touched per change, and responsibility count;
- use LOC only as a sticky ceiling and secondary signal;
- stop extraction when coupling or public surface worsens.

Initial seam order:

1. Room lifecycle and persistence coordination;
2. Room navigation and plugin bridge;
3. Room shell/presentation;
4. ToolCanvas identity and scene adapter;
5. ToolCanvas persistence/command dispatch;
6. solver and instruments;
7. renderer and host bridge.

**Negative controls:**

- mount/unmount during pending open;
- journal/LessonOS/activity cleanup ordering;
- save debounce/flush across navigation;
- plugin insert/writeback/event round trip;
- scene/diagnostic equivalence across the adapter;
- no new generic `utils` dumping ground.

**Human gate:** any extraction that intentionally changes behavior.

**Potential preserved:** the seams become extension points for future plugins,
providers, projections, and views.

### Action 9 — Bounded Quality Lab for LLM/VLM and test strength

**Outcome:** failure-derived tasks measure model+harness+environment without
granting agents authority over product semantics.

**Design:**

- define versioned task/result schemas;
- freeze base SHA, allowed paths, evaluator digest, budget, negative control,
  and rollback before a trial;
- start with deterministic graders and 30 validated tasks derived from real
  failures;
- add model-based, mutation, dead-code, bundle, and VLM tools only through
  bounded canaries;
- keep generated artifacts out of the product tree;
- record unavailable, failed, NOOP, and reverted outcomes.

Allowed autonomous classes are mechanical: lint, dead exports, bundle size,
test duration, mutation strength, touch geometry, cycles, and stale documents.
Forbidden autonomous classes include LessonOS authority, trust model, schema
semantics, lesson methodology, history deletion, merge, and release.

**Negative controls:**

- the candidate cannot modify its evaluator or policy;
- an out-of-scope diff invalidates the trial;
- two repeated failures without new evidence force replan;
- a primary metric improvement with a regressed guardrail is rejected;
- VLM output cannot override deterministic geometry/a11y facts.

**Human gate:** model promotion, tool/dependency installation, paid services,
and any semantic grader.

**Potential preserved:** the system optimizes bounded, falsifiable work rather
than reducing ARDESIA to whatever is easiest to score.

### Action 10 — Supply chain, release identity, and privacy-safe operations

**Outcome:** a candidate is legally classified, inventoryable, attributable to
source bytes, diagnosable without PII, and operationally reversible.

**Design:**

- prepare a component/asset/license inventory before selecting license text;
- separate Core, guest/legacy, third-party code, and content rights;
- create SBOM and vulnerability artifacts per candidate once tooling is
  approved;
- create an artifact release manifest with source SHA, artifact digest, lock
  digest, tool versions, gate results, and SBOM digest;
- expose version/full SHA in a restrained diagnostic surface;
- begin bundle control with a no-growth baseline, then reduce measured top
  contributors without breaking offline behavior;
- use synthetic monitoring and local diagnostic export without lesson/student
  contents;
- exercise deploy → smoke → rollback → smoke → redeploy only after explicit
  authorization.

**Negative controls:**

- a release manifest with a non-reachable SHA is invalid;
- an artifact digest mismatch blocks the candidate;
- unknown or forbidden license classifications remain visible and blocking;
- diagnostic output containing lesson text or personal data is rejected;
- bundle growth beyond the sticky baseline requires an explicit exception;
- rollback evidence cannot be inferred from documentation alone.

**Human gates:** license choice, legal review where necessary, scanner/tool
installation, deploy, rollback, monitoring activation, and release.

**Potential preserved:** operability does not move lesson truth or content into
the cloud.

## 6. Serial execution model

The program runs through the following states:

```text
ORIENT
  → CONTRACT
  → FALSIFY
  → IMPLEMENT
  → FOCUSED VERIFY
  → ADJACENT/FULL VERIFY
  → SELF-REVIEW
  → HUMAN/INDEPENDENT REVIEW
  → LOCAL COMMIT
  → HUMAN-GATED PR/INTEGRATION
  → RECEIPT
  → REBASELINE
  → NEXT UNIT
```

Only one stateful implementation unit is active in this program. The existing
`dbe49aa2` Continuity unit remains protected external WIP and is not modified.
Before a future convergence unit touches the same files, its disposition must
be resolved and the base re-established.

### 6.1 Tranches

| Tranche | Actions | Entry gate | Exit evidence |
|---|---|---|---|
| T1 Truth foundation | 1, 2, 3, inventory portion of 10 | written spec and plan approved | generated state, schema, first boundary/freshness negative controls |
| T2 Authority decisions | 4, 5, 7 | T1 structural gates green | three ratified ADRs and shared contracts |
| T3 Runtime seams | 4, 5, 7 | authority ADRs ratified | one writer, one runtime port, transaction state machine under TDD |
| T4 Strangler/decomposition | 6, 8 | runtime ports stable | guest dependency ratchet and first behavior-preserving seams |
| T5 Quality/release preparation | 9, 10 | stable evaluators and no-growth baselines | bounded eval tasks, artifact manifest, approved inventory tooling |
| T6 Operational proof | 2, 7, 9, 10 | exact candidate and explicit authorization | browser/cold-reopen evidence and authorized rollback receipt |

Time elapsed never satisfies an entry or exit gate. A red prerequisite yields
`BLOCKED_BY_GATE`, not schedule-driven continuation.

## 7. Error handling and stop rules

Every tool and product failure is classified:

- `FAIL`: the frozen evaluator found a candidate defect;
- `REPAIR`: the harness or required local capability is broken;
- `BLOCKED_BY_GATE`: a prerequisite or human decision is absent;
- `NOT_RUN`: no execution evidence exists;
- `DEFER`: useful work is outside the current scope or authorization;
- `REPLAN_REQUIRED`: the same failure repeated twice without new evidence,
  scope crossed two subsystems, or the evaluator would need to change;
- `REJECT`: the proposal worsens a higher-priority safety/correctness level;
- `DONOR_ONLY`: useful material exists but the branch/PR cannot be integrated
  as a unit.

Stop immediately when:

- source PII, secrets, or real lesson/student content would enter an artifact;
- a candidate modifies its evaluator, frozen baseline, or merge policy;
- a new dependency is needed without approval;
- an action becomes destructive or external without authorization;
- the diff exceeds five files or crosses the declared allowed paths;
- the implementation would require a second writer/runtime/source of truth;
- a guardrail regresses even when the primary metric improves;
- a proposed transaction can deadlock or cannot demonstrate byte-preserving
  recovery.

## 8. Testing and evidence strategy

### 8.1 Test order

1. Static/schema test for contracts and generated state.
2. Focused causal test or checker fixture observed red.
3. Minimal implementation.
4. Focused green.
5. Adjacent subsystem tests.
6. Full deterministic Studio/Engine verification when the slice affects them.
7. Browser verification for user-visible or persistence flows.
8. Negative control transcript or artifact digest.

Tests use current repository contracts and deterministic synthetic fixtures.
They do not fabricate pilot outcomes, production telemetry, student data, or
claims of real-world use.

### 8.2 Claim rules

A receipt records:

- exact base and candidate SHA/tree;
- changed files and scope;
- command, exit code, timestamp, tool version, and relevant counts;
- skipped tests and warnings;
- observed red cause;
- regressions or limitations;
- user verification status for user-facing behavior;
- remaining red/human gates.

The terms `fixed`, `resolved`, `working`, `complete`, `ready`, or equivalent are
not used for user-facing behavior until technical evidence exists and Andrea
has performed or accepted the specified verification.

## 9. Documentation synchronization

The first documentation pass compares current code/config against:

- root and package `AGENTS.md`/`CLAUDE.md`;
- `README.md`;
- `docs/vault/ARDESIA-MAP.md`;
- Product, Architecture, Plugin Marketplace, and ELAB-as-Plugin Canon;
- active decision/index pointers;
- current CI and package manifests.

Each claim receives one status:

- `CURRENT_OBSERVED`;
- `CURRENT_DECIDED`;
- `STALE_SUPERSEDED`;
- `HISTORICAL_SOURCE_ONLY`;
- `PROPOSED_NON_NORMATIVE`;
- `UNKNOWN_NOT_RUN`.

No historical document is silently rewritten to make prior claims appear
correct. Current navigational documents may be replaced through an explicit
supersession record. Product code changes and broad Canon rewrites do not share
one implementation unit.

## 10. Human decision register

The program cannot close these decisions autonomously:

| Decision | Required before |
|---|---|
| license/terms per Core, legacy guest, content, assets, and third parties | creating `LICENSE`/`NOTICE` or external distribution |
| LessonOS mutable authority | production bridge or writer migration |
| plugin trust and acquisition model | removing the Founder special path |
| `.lesson` lock order and transaction semantics | production macro-import implementation |
| supported touch/authoring device strategy for Excalidraw | declaring mobile/iPad conformity |
| GitHub required checks/ruleset | remote enforcement |
| worktree/PR disposition and deletion | cleanup execution |
| security/SBOM/mutation/dependency tool installation | tool adoption |
| deploy, rollback, monitoring, and pilot | operational proof |

## 11. Acceptance of the overall program

The ten-action program is accepted only when adding a new bounded capability
does not require:

- a new competing source of truth;
- a ToolHost bypass;
- a second mutable LessonOS;
- importing the ELAB standalone shell into Core;
- editing both major monoliths for one local change;
- trusting a test that was never observed to reject the target defect;
- manually reconstructing branch/worktree authority;
- guessing which source produced served bytes;
- accepting untested partial-write recovery;
- moving lesson contents or PII to a cloud control plane.

The program is not considered complete merely because its scripts, plans, or
tests exist. Operational and product outcomes retain their own gates.

## 12. Known limitations at written-spec review

- The authoritative capability validator named by the vault is absent. The
  capability registry already classifies this as `ACTIVE_WITH_REPAIR`; this
  design does not recreate it implicitly.
- `dbe49aa2` is local, unpushed, and outside this branch. Its future merge or
  rejection can change the Action 4 implementation base.
- GitHub PR/issue/ruleset state is not mutated by this design.
- No deployed runtime, rollback, WebKit/device matrix, accessibility audit, or
  pilot outcome is claimed.
- The existing build is green with large-chunk warnings; Action 10 begins with
  measurement and a sticky no-growth baseline, not an invented reduction
  promise.
- The cached `document-sync` and `AI Truthfulness Enforcer` skills were applied
  as local protocols; they are not installed as callable Codex skills.
