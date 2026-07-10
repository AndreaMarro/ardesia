# ARDESIA V1 — executable loop prompt

Version: 2026-07-10 after PR #163. Status: executable for regate, audit and
one verified slice at a time. This prompt does not certify V1.

## Mission

Move ARDESIA toward a teaching prototype Andrea can use in a real lesson. The
loop optimizes for integrated, falsifiable progress across the teacher journey,
not for more code, more documents or broad parity claims.

## Current Reality Gate

- Repository candidate: `AndreaMarro/ardesia`.
- Verified current `origin/main`: `9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`
  (`Merge pull request #163`).
- PR #150 is merged at `4f25f72c1975c5aaf66fc13272583fa28e3b4c70`;
  post-merge CI and `studio-preview-readiness` were green.
- PR #163 is merged at `9b7342fcbe8363a8033bc17be86766a1a0bdfd7d`;
  post-merge CI run `29101655495` was green.
- Main local checkout `/Users/andreamarro/VOLUME 3/ardesia` is dirty; it is not
  a write lane.
- Active write lane for the next docs/harness slice:
  `/Users/andreamarro/ardesia-wt/tutor-ux`, branch
  `codex/v1-loop-executable-20260710`.
- Production deploy proof is current only through the earlier verified Studio
  deploy/smoke around `ce209b31`. The current `9b7342fc` SHA is CI-green but
  not production-deploy-proven.
- Open PRs #4, #5 and #6 are old drafts with no current check evidence.

## Evidence Language

Every claim must use exactly one status:

`VERIFIED`, `REPORTED`, `INFERRED`, `UNKNOWN`, `RED`, `DEFERRED`.

Evidence must name the command, URL, file, SHA, date, confidence and limit.
Do not upgrade `REPORTED` to `VERIFIED` without reproduction. CI green, HTTP
200, unit tests or a demo are not end-to-end product proof.

## Non-Negotiable Invariants

- Principio Zero: “Il docente è il tramite. UNLIM è lo strumento del docente.
  Gli studenti lavorano sui kit fisici ELAB.” Use plural teacher-facing class
  language (`Ragazzi,`), physical kit centrality, Vol./pag. anchors and real
  book words when a book reference exists.
- Book fidelity is multi-level: semantic, topological, visual, electrical and
  didactic/temporal. Electrical equivalence is not editorial fidelity.
- Mounted mode and step-by-step must reduce to the same canonical scene:
  `reduce(stepOperations) == mountedScene`, and their netlists must match the
  book target.
- `SimulationScene` or the ratified successor is domain truth. DOM/SVG are
  render layers.
- AI circuit control must use typed, reversible, permission-checked,
  event-producing operations. The AI must not manipulate DOM/SVG as truth.
- Plugin composition goes through public capability contracts and ToolHost
  enforcement. First-party direct imports/callbacks are debt until ratified by
  ADR and tested.
- LessonOS is the integration spine: user action -> typed operation -> plugin
  event -> local event log -> sync/backend where applicable -> graph/memory ->
  ElabTutor context -> exportable artifact.
- Knowledge Cards remain simple at rest, powerful on demand, with identity,
  provenance, graph links, version/history and export path.
- UI must be simple at rest, joyful in use, original, teacher-first,
  touch-first, accessible, reduced-motion aware, and verified on iPad and LIM
  before any pilot claim.
- Security/GDPR/minors outrank feature work. No privileged key in the browser,
  prompt, logs, fixtures or commits.
- No global Tinkercad/Miro/GoodNotes parity claim. Only scenario-scoped
  matrices and certifications are allowed.

## Runtime Capabilities and Enforcement

- Repository contains `.claude/skills/ardesia-regate/SKILL.md`,
  `.claude/agents/ardesia-repo-cartographer.md`,
  `.claude/agents/ardesia-adversarial-reviewer.md`, and
  `.claude/settings.json` with a Claude PreToolUse guardrail hook.
- In this Codex Desktop lane, those Claude hooks are repository artifacts, not
  proven runtime enforcement. Codex can run shell/git checks. If this runtime
  exposes `multi_agent_v1`, a reviewer may be spawned for bounded review, but
  availability is per-run and must be evidenced.
- Do not claim hook, agent or skill enforcement unless the relevant runtime has
  actually executed it and produced evidence.

## Operating Limits

- One binary slice at a time.
- Maximum 3 writer agents; prefer 0 or 1 unless scopes are disjoint.
- One owner per file; maximum 5 files per cycle unless the acceptance criterion
  proves broader scope is required.
- No direct push to `main`/`master`, no force push, no destructive reset/clean,
  no `git add -A`, no `--no-verify`, no new dependency without audit.
- Merge/deploy only through the approved route and only with evidence tied to
  the exact SHA.
- After three local slices in the same subsystem, run an Integration Iteration.

## Iteration Algorithm

1. **Regate**: fetch/prune, branch, SHA, upstream, dirty paths, worktrees,
   active PRs/checks, process risk, security state, architecture state.
2. **Select**: score at most three candidate slices by user value, unblock
   power, verifiability, integration leverage, regression risk, unresolved
   dependencies, merge risk and scope.
3. **Spec first**: define binary acceptance, file ownership, tests, rollback and
   terminal state before editing.
4. **Implement**: make the minimal complete change. No opportunistic refactor,
   no silent fallback, no second source of truth.
5. **Verify**: focused tests -> typecheck/lint/build where applicable -> e2e or
   equivalent boundary proof -> persistence/reopen if relevant -> security scan.
6. **Adversarial review**: a separate reviewer tries to falsify the claim,
   checking fake-green, pointer bypass, ToolHost bypass, book fidelity,
   Principio Zero, security, RLS, deploy-SHA, iPad/LIM and overclaim.
7. **Integrate or stop**: only a proven slice may be committed, pushed and PR'd.
   Otherwise record `HONEST_RED`, `SECURITY_RED`, `ARCHITECTURE_RED`,
   `ENVIRONMENT_RED`, `BLOCKED_EXTERNAL` or `STOP`.

## Current Red/Unknown Gates

- `SECURITY_RED/UNKNOWN`: `VITE_ELAB_API_KEY` client-side boundary, history and
  provider rotation, ToolHost sandbox/origin, RLS tenant-negative proof.
- `ARCHITECTURE_RED/UNKNOWN`: behavioral source of truth between canon,
  monorepo, legacy ELAB and satellite repos is not fully resolved.
- `P0_PARTIAL`: PR #163 improved browser prompt/book-anchor post-processing, but
  ElabTutor end-to-end conformance to Principio Zero is not proven.
- `BOOK_FIDELITY_RED`: no experiment is fully certified across semantic,
  topology, visual, step, solver, tutor and export gates.
- `TOOLHOST_RED`: Simulation Plugin path still needs proof that meaningful
  circuit operations cross ToolHost/capability/RPC/audit rather than direct host
  callbacks.
- `DEPLOY_UNKNOWN_FOR_HEAD`: current `main@9b7342fc` is CI-green but not
  deployment-smoke-proven.

## Next Mandatory Slice

Use `docs/ops/V1-NEXT.md` as the single active next-slice contract. As of this
version, the next safe slice is not a new feature: it is a P33 Integration Spine
regate/audit that proves the first real boundary break between pointer/domain
operation, ToolHost, LessonOS, persistence, graph/tutor and export, then
selects the smallest remediation.

## Definition of Done

`V1_GREEN` requires: clear source of truth; governed PR/worktrees; ToolHost or
ratified exception; plugin composition; recovered and tested Principio Zero;
certified Golden Book Circuit; mounted/steps equivalence; real SimulationScene;
wire connect/disconnect/retarget/delete plus undo/redo; save/reopen; LessonOS
event path; backend/RLS proof; graph/memory; grounded ElabTutor; at least one
artifact/export; iPad/LIM UX; Playwright CI; deploy tied to SHA; clean security
gate; Andrea lesson validation; explicit RED/UNKNOWN limits. Until then, every
claim must be scenario-scoped.
