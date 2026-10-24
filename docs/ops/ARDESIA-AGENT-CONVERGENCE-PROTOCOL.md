# ARDESIA — Agent convergence protocol (proposal, 2026-10-24)

> **Status: PROPOSED / PR-DRAFT until merged.** This is an operational protocol, **not** a replacement for the Product/Architecture canons, the Obsidian truth plane, or generated current-state artifacts. Source of this proposal: independent 2026-10-24 audit. Approval and adoption require normal PR review; no autonomous author may self-ratify.
>
> This protocol accompanies `docs/ops/2026-10-24-STRATEGIC-CONVERGENCE-AUDIT.md` and the existing two-hinge workflow (`docs/ops/ARDESIA-LOOP-TWO-HINGE-2026-07-30.md`).

## 1. Invariant and order of evidence

**North Star:** ARDESIA = Core of lesson, board, provenance, continuity, materials and teacher workflows; plugins/disciplinary packs extend it. Physics microcourses are the first commercial entry, not the product's ontology. Success is a complete **teach → observe → preserve → explain → review → practice → reopen** circuit that a tutor and student can operate. A static worked-example page does not satisfy the circuit.

Order of authority for factual, **time-scoped** statements:

1. Fresh GitHub/API state: exact repository/branch/SHA, PR base and head, tree, workflow run, deployment source and code.
2. Independently executed tests against **that** exact SHA and actual configured target; report all skipped tests and unknown environments.
3. Evidence with provenance (REA capture/replay, browser trace, deterministic logs), explaining what it does **not** establish.
4. Canonical requirements and decisions in `docs/PRODUCT-CANON.md`, `docs/ARCHITECTURE-CANON.md`, the product/Study specs, and the ratified `ardesia-knowledge` branch; preserve dates and supersession.
5. Dated audit / PR descriptions / conversation records as **historical claims**, not runtime proof.

The monorepo `main` and the newest draft PR can have different states. The `ardesia-knowledge/main` ratified branch and `sync/current` editor branch have distinct roles. Neither `00-CURRENT.md` nor `docs/ops/CURRENT.md` is a normative document to rewrite by hand. Generate runtime state only with its owning tooling. Do not move the private Obsidian writer authority into an unattended GitHub task.

## 2. Mandatory entry checklist for every significant agent run

1. Fetch default branch SHA and current PRs (including **stacked bases** and exact head SHAs). Confirm whether the expected work is already present in an open branch.
2. Read root and package `AGENTS.md`; read `docs/vault/ARDESIA-MAP.md`, product/architecture canons, applicable domain spec, the two-hinge loop, the latest dated convergence audit and the current PR's evidence.
3. If relevant and authorized, read the knowledge vault's ratified and current branches **read-only**; verify its `freshness` and `status`, do not rely on a stale generated snapshot.
4. Define **one closable intervention** with an explicit owner, touched files, expected customer value, RED test, integration point, acceptance and exit conditions.
5. Check for active workers (GPT-6.1/Codex, Pro/Astra, DeepSeek, Riccardo/Giovanni). Never write concurrently to the same files; preserve their branches and review separation.
6. Consider whether a fresh REA acquisition or an authorized open-source donor offers measurable advantage over new code.
7. Set the initial evidence verdict: `PASS / FAIL / BLOCKED / NOT_RUN` for each critical claim.

## 3. Mandatory exit checklist

1. State verified commit SHA, PR/head/base, environment, actual test commands and results **separately** for unit tests, typecheck, build, API integration, real browser and actual hosting.
2. Report REA evidence IDs, donor URL/version/license, observed behavior, transferred contract, implementation file and regression proof. Unacquired donors stay `NOT_RUN`.
3. Record defects and critiques even when the conclusion is `REFUTED` or `DEFERRED`; preserve prior contradictory evidence append-only with a new adjudication.
4. Record product decisions as `PROPOSED`, `RATIFIED`, `SUPERSEDED` or `REJECTED`, identifying the human authorization for ratification. No self-approval or synthetic scientific/editorial sign-off.
5. Update *only the relevant* canonical document if the PR actually changed an approved contract; do not make transient statuses permanent normative text.
6. Update the dated audit when a material change occurs; otherwise report `NO MATERIAL CHANGE`, and do not create a blank PR/commit.
7. Add **NEXT PRIORITY TASKS** as the final section of the audit, 3–7 prioritized, autonomous, closable items. Every item: ID, precise objective, owner, prerequisite branch/SHA, file scope, adversarial criterion/RED-GREEN gate, product impact, risks, stop/rollback rule.
8. Preserve a non-empty `NOT_CHECKED` scope and blocked external or physical tests.

## 4. Convergence-specific acceptance

A claim that Ardesia delivers its differentiation needs **one user-visible, executable vertical** with:

- Board and a real scientific manipulation (correct units, physical assumptions and constraints).
- Explicit lecture/session identity and ordered journal with actual provenance.
- Audio only with consent; timed alignment to board events if claimed; replay and revocation tested separately.
- LessonOS facts sourced from explicit semantic events. **Do not promote every pen stroke or audio chunk to a learning fact.** Journal is high-frequency evidence; LessonOS events are sparse, source-attributed facts.
- Teacher-reviewed derived material with exact source/version and a different practice prompt.
- Student outcome recorded with authorization, accessible in the next lesson; no unsupported competence/psychology inference.
- Plugin through the existing signed/capability-controlled ToolHost where required, not a parallel auth/memory/app.
- Closure after save→cold reopen→replay and a real browser workflow, plus a public marketing demonstration explicitly marked when synthetic/preview.

Physical testing, live identity/PG/Supabase, production load, accessibility with assistive hardware, actual payments, and user-consent flows stay `NOT_RUN` unless independently exercised.

## 5. REA and donor-research evidence protocol

Never equate **source export** with legal reuse, exact runtime behavior or a complete server reconstruction. Implement original behavior using owned code and authorized open-source packages under reviewed terms. No bypassing access, licenses, authentication, encryption or technical protections.

For each donor:

`TARGET + VERSION + RIGHTS → QUESTION → OBSERVED INTERACTION → CAPTURE/EVIDENCE ID → CONTRACT (state/gesture/timing/UX) → ARDESIA IMPLEMENTATION → RED TEST → GREEN TEST → VISUAL/BEHAVIORAL COMPARISON → RESIDUAL UNKNOWN`.

Prefer REA's website observation, scenario capture, script export and JavaScript analysis **when configured and authorized**, plus Playwright/Chrome DevTools. The official REA readiness verifier distinguishes partial/unknown/unmet obligations from verified conformance; never replace the verifier with a visual judgement. For native/Electron/desktop inspect only authorized targets.

Prioritize **learning-affecting animation** (predict, manipulate, compare, explain) and clear visual hierarchy over decorative motion. Check keyboard, focus, reduced motion, 320–1440px layout, mathematical typography, graph accuracy, frame drops and source attribution. Research pedagogy (ICAP, worked-example fading, signaling/contiguity, retrieval) as design constraints, not as universal proof that any animation improves learning.

## 6. MCP Core, AI and student work: future write contract

The current Study MCP is a **read-only HTTP adapter**. Do **not** add database writes directly to that MCP server. Propose an additive authorized command layer into the existing Core and the same editorial/submission ledgers.

**Normative AI gate:** root `AGENTS.md` currently says **ZERO-LLM in prodotto**. This proposal does not authorize a hosted LLM or autonomous grading in production. Deterministic Core and evidence contracts remain LLM-independent. Any optional AI draft service must first be proposed and expressly ratified as a scoped change, with source grounding, privacy, costs, provider policy, opt-out and deterministic/manual fallback. Until then correction drafts are teacher-authored or deterministic only.

Candidate commands are separate phases:

- `submission.list_authorized` / `submission.get` (read, bounded scope).
- `correction.create_draft` (teacher-only append-only draft tied to submission ID, revision, digest, actor and idempotency key).
- `correction.propose_feedback` (AI suggestion, explicitly non-authoritative, source- and calculation-grounded).
- `correction.update_draft` (conditional/CAS version change; no student visibility).
- `correction.approve_and_release` (explicit human approval, same exact revision, two-act gate, audit and eligibility checks).
- `correction.revoke` (controlled transition, no late retry replay).

All mutations require server-side identity/role/tenant enforcement, least-privilege scopes, per-command quotas, nonces/idempotency keys, immutable audit provenance, PII minimization and safe error envelopes. Untrusted uploaded text cannot grant tool authority. Record retention, deletion, export and consent policy before real users. LLMs may suggest; deterministic validators and the teacher authorize corrections. No silent publication, grade, payment or enrollment.

**Phase order:** contract and attack cases → Core API + synthetic Postgres/RLS → MCP adapter with write annotations → teacher review UI → controlled pilot. Nothing here is permission to enable writes in production.

## 7. Plugin, management, business and multi-platform governance

- Core owns identity, session, journals, grounded memory, catalog, permissions, student outcomes, review/publication, billing records where relevant.
- Plugin offers tools/simulations via signed manifest and capability broker; Pack supplies discipline content; Workflow defines a teachable/reusable sequence. No second ledger, auth, journal or second domain-scoring engine in a plugin.
- Priority integration pilots: physics interaction, Kirchhoff solver, ELABTutor manual-driven Pack; only after a verified ToolHost mount/serialization seam.
- The **gestionale** must cover tutor-oriented value: intake, editions, groups, schedule, attendance, student/submission ledger, draft correction, release, billing status (not live payments), CRM consent and safe exports.
- MCP/ChatGPT/Claude/LMS and desktop/native are **adapters** to Core with explicit capability matrices, not separate authoritative backends.
- Monetization should test **instructor hours saved** and repeatable group delivery before creator marketplace/revenue share. Model conversion, paid seats, support, infra+AI cost, teacher review time and churn using observed data rather than fixed invented conversion rates.
- No invented urgency/seat counts, fake testimonials, unchecked scientific claims or accidental publishing of DRAFT.

## 8. Risk and priority discipline

Use a compact risk ledger per changed area:
`EVIDENCE / SEVERITY / LIKELIHOOD / OWNER / COST TO IGNORE / MINIMAL FIX / TEST / DECISION / RESIDUAL`.

Prefer the smallest **vertical closure** over a large subsystem rewrite. A rewrite is justified only by verified seam failure or measured negative value, a replacement contract, migration/rollback, and a before/after oracle. REA screenshots or donor bundles alone cannot justify discarding a functioning subsystem.

Schedule heuristic (not a promise): 24–26 October = public **distinctive pilot**; by 2 November = narrowly scoped **integrated beta candidate** if all critical gates pass. Full marketplace, automated AI grading, all cross-platform integrations and all Kirchhoff/ELAB content are independent milestones, not implied by either deadline.

## 9. Required final format

Each run must publish or propose:

1. **SNAPSHOT:** exact SHA/branches/prs, freshness and deltas.
2. **ADVERSARIAL VERDICTS:** ACCEPT/MODIFY/REPLACE/DEFER/REJECT, sourced.
3. **CONVERGENCE GATES:** PASS/FAIL/BLOCKED/NOT_RUN.
4. **REA TRANSFERS:** licensed donor observation → actual product gain.
5. **BUSINESS / UX / MCP / TECH DEBT:** only material findings.
6. **NEXT PRIORITY TASKS:** final section, ranked, each a closable action with test and owner.

Do not update `main`, deploy, DNS, live banking/payment settings or production data without an explicit authorized workflow. A no-change run must not create empty records or pretend to have performed operations.
