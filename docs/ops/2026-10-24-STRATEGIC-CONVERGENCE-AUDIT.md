# ARDESIA — independent convergence & adversarial audit
**As-of:** 2026-10-24 ~06:00 Europe/Rome  
**Status:** PROPOSED; docs-only draft PR, no changes to production, bank or other workers' branches.  
**Scope:** public `AndreaMarro/ardesia`, linked private `ardesia-knowledge` (read only), current Oct-23 PR chain, REA primary docs, pedagogy, MCP/security and donor licensing.  
**Method:** direct GitHub connector reads of source files and live PR metadata/workflow-run summaries; read-only Render service/deploy API; primary public documentation research. **No local checkout tests, no REA execution, no live preview/browser test in this run.** The HTTPS page could not be fetched from this environment; this is NOT evidence that the service is down.

## 1. Snapshot: what was observed, what is only claimed

| Surface | Observed status | Evidence and qualification |
|---|---|---|
| Monorepo `main` | `b124eee04acc8062c27284f23c5d9108e3767c27` | Direct GitHub branch read. Its commit dates to **2026-08-23**; it is not the latest October product. |
| Ratified knowledge `main` | `dedb19577c331ebb7d38dca4962a9089b4f46deb` | Private repo read. `00-CURRENT.md` on main is generated, DEGRADED, **2026-07-25**. |
| Editor knowledge `sync/current` | branch `627b8ffa361245645d57f4303e40bdc642561edc` | Direct branch read. Generated `00-CURRENT.md` says DEGRADED, **2026-08-22**. This is not an October operational snapshot. `sync/current` is protected; existing Obsidian single-writer rules must remain. |
| Integration `#282` | open draft `68af43a6c7fd0e072fea1c3b12f9ea96a1a93f30` | Converges #279, #280, #281 onto #278 and adds teacher catalog. Its detailed October 22 audit was read on the **PR branch**, not on `main`. |
| Publication guard `#284` | open draft `57c492af2bc391652f8c243107cfe8f00a22820d` | Fixes RED found by independent #283: legacy approval could publish without saved scientific review. The #284 description itself leaves examination of internal `ApprovalGate.approve(..., review_id=None)` callers for the release gate. |
| Teacher pathways `#285` | open draft `c43f5b9d52fec10d554059be9ae63ed87a4c15aa` | Four versioned Physics pathways (reported distribution 1088/1472/800/640 = 4000 DRAFT), teacher catalog and `catalog.get_teacher` in Study MCP. CI run `39976319049`: completed/success per GitHub API. |
| Browser runner `#286–#287` | open drafts `8f903a68588a6f616ea3df7110f45008b05ca1ba` and `870b515ef6b598fb8e617b7fbed903561f334fd2` | Real SQLite/Study API Playwright gate; then runner isolation. #286 CI `40000993436` success. Synthetic identity and loopback are not live auth/cloud evidence. |
| Marketing `#288–#290` | open stacked drafts, #290 head `339ab08f4139da0b37e78bbde81e9fe4e83afea0`, base #289 | Four course pages, WhatsApp contact, hints and worked explanations, build status DRAFT. CI runs `40034887180` and `40034887686` success per GitHub API. Read-only Render API confirms static service `srv-dbdu1g3l550s738cq3t0`, deploy `dep-dbdu3p7f3r2c73c2ee8g` at this exact SHA with status **live** and autodeploy OFF; https://ardesia-golive02-preview.onrender.com/ . Direct page navigation remains **BLOCKED** from this environment. Production/DNS not changed. |
| REA on marketing | reported in #289/#290, **not re-executed today** | #290 lists 17 attempts with 5 selected COMPLETE receipts, 3 INCOMPLETE and 6 ERROR. This supports a selected transfer, **not** full verification of competitor equivalence or product pedagogy. |
| Science review & artifacts | DRAFT, human editorial approval absent | #290 lists four selected source JSON, twelve TeX sources and twelve referenced PDFs absent; do not market them as final course materials or claim production approval. |

**Change since previously known:** there is a well-tested marketing **surface**, not yet the differentiating audio/board/lesson/material continuity product. Current `main` and the two knowledge-state snapshots are substantially older than the active October PR chain. A green SHA in #290 cannot certify the beta or even imply its features were merged into main.

### Explicit negative evidence from source files (on #285/#290 branch)

- `services/study-mcp/study_mcp/server.py` enumerates **four** read-only tools: `catalog.get_teacher`, `course.list_mine`, `lesson.get_context`, `submission.get_receipt`. It identifies itself as `ardesia-study-readonly`; annotations are `readOnlyHint=True`. `gateway.py` performs bounded GET requests only. This is a good security baseline but **no write correction authority**.
- `apps/studio/src/store/AudioRecorder.ts` contains real MediaRecorder primitives: per-lesson consent default off, 30-s chunks, WorkspaceStore and journal onChunk callback. This proves an implementable **primitive**, not an end-to-end studio→LessonOS→student replay.
- `apps/studio/src/lessonos/journalBridge.ts` deterministically promotes **only** recognized `pdf.page.view` to `material.cited`, with explicit manual registry and evidence. `audio.chunk`, ink and formulas remain journal-side counts. This is correct **anti-hallucination discipline**, but is not semantic audio transcription or a lesson-material generator.
- `apps/studio/src/lessonos/eventlog.ts` defines provenance-constrained didactic events (including `error.observed`, `exercise.completed`, simulation and plugin events); runtime wiring and persistency require separate full-flow proof.
- `apps/marketing-01/templates/example.html` is an original HTML page with a problem, native `<details>` for hints/steps/check and CTA. It **does not** embed canvas, simulation, audio, LessonOS retrieval or student-specific continuity. Call it a worked-example marketing preview, not a living lesson.
- `docs/product/CHATGPT-APPS-MCP-INTEGRATION.md` explicitly scopes its historical MVP as read-only. The requested write channel is therefore a **new proposal requiring ratification and safety design**, not an already approved feature.

## 2. Adversarial review: product and architecture decisions

| Verdict | Evidence-based finding | Minimal corrective decision |
|---|---|---|
| **ACCEPT** `#285` | Exact versioned course identity + teacher catalog + bounded MCP GET are reusable foundations; real SQLite/HTTP CI reduces drift. | Preserve contracts and sign/review gates. Do not rebuild catalog/search from scratch. |
| **ACCEPT WITH CONDITIONS** `#284` | Two-act review→publication fixes a proven bypass; critical for scientific and AI-driven correction. | Audit every remaining internal publisher and test revocation/retry on real configured RLS before cloud release. |
| **MODIFY** `#290` | Strong static UI, accessibility and provenance tests; independently verified via CI summaries. However it primarily shows an example and CTA, not the distinctive product. | Add **one real interactive lesson vertical** from an actual product runtime, marked as preview when synthetic. Do not bloat first-page bundle. |
| **MODIFY** original MVP ordering | July Founder Beta explicitly excluded audio, marketplace and sharing to close deterministic room/export. The current October commercial vision requires audio-context demonstration. Neither historical choice was necessarily wrong. | Separate **recording+replay demo** (with controlled consent and synthetic fixture) from production ASR/AI grading. Add a dated proposed decision instead of silently rewriting history. |
| **MODIFY** Study MCP scope | Read-only is safe and implemented. User value increasingly depends on submitted work→teacher correction→feedback release. | Add a new, additive **MCP write command layer** only through Core review services, optimistic concurrency and human release. No agent direct DB/approval write. |
| **DEFER** public marketplace/payments | Existing signed ToolHost/Pack principles are valuable, but public sale and revenue share do not improve the first cohort outcome today. | Define authoring/pack contracts and run one **external-tutor usability test** before building marketplace payments. |
| **MODIFY** REA intensity | Current selected donor transfers produced helpful progressive disclosure, mobile course navigation and CTA continuity. These are valid but materially narrower than scientific manipulation, audio replay or canvas workflow. | Shift donor study to **observable interaction mechanics**, not number of screenshots or donor logos. Make each transfer close a product test. |
| **REJECT** rewrite-by-impression | Rebuilding Core/Excalidraw/Study just because another site's aesthetics are better has no tested cost-benefit. | Permit replacement only after concrete seam failure, licensed donor assessment, migration plan and before/after behavior equivalence test. |
| **REJECT** blanket claim “full platform beta in 9 days” | No verified end-to-end consent/audio→LessonOS→reviewed pack→student adaptation→tutor handoff, live auth/RLS or all plugin integrations. | By November 2 demand a **scope-limited instructor+student pilot beta candidate**, not a public complete marketplace, multi-platform or fully autonomous AI tutor. |
| **MODIFY** status plane | October product and August generated knowledge state have no verified synchronization. | Add a read-only dated external audit snapshot with links; never edit generated state, overwrite Obsidian `sync/current`, or misrepresent the old snapshot as current. |

### Core/Plugin/Pack/Workflow invariant

`teacher + student + permission + session + journal + lesson event log + source graph + correction ledger + billing state` belong to **Core**.

`real scientific object + controls + verified calculations + drawn scene` belong to a signed **Plugin** mounted through the host.

`physics curriculum + units + explanations + canonical formulas + verified examples` belong to a versioned **Pack**.

`lesson sequence + prediction prompts + practice + handoff + progress policy` form a reusable **Workflow**.

No plugin may silently add another account store, authority service, student competence ledger or private journal. Kirchhoff and ELABTutor should be integrated through this seam rather than reconstituted as full standalone applications.

## 3. REA deep-dive and donor decision matrix

**Primary documentation:** https://github.com/morluto/rea ; https://github.com/morluto/rea/blob/main/docs/browser-observation.md ; https://github.com/morluto/rea/blob/main/docs/website-script-export.md ; https://github.com/morluto/rea/blob/main/docs/reconstruction-readiness.md

REA supports bounded passive browser observation, separately approved scenarios, evidence capture, source export and local JavaScript analysis. Website script export retains origins, digest and capture provenance and **does not fetch or execute scripts**; missing imports and source-map gaps remain unknown. Its readiness conformance rejects `unknown`, truncation or contradiction as proof of equivalence. **No REA executable was available in this run**; these are primary-document findings, not newly executed captures.

| Donor | Transfer-worthy behavior | Ardesia test that would constitute success | Rights and unknowns |
|---|---|---|---|
| BigBlueButton 4.x | Captures session events/media (slides, annotations, audio etc.) and plays event-aligned presentation. | Seek to time T → display same lesson/source version and board state synchronized with original audio; revocation/purge checks. | Primary docs: https://docs.bigbluebutton.org/4.1/development/recording/ ; study architecture and licensed code separately; never clone its service blindly. |
| Mathigon/Polypad | Manipulate mathematical objects with consistent visual state; observe/abstract the direct manipulation. | One controlled scientific object maintains physical invariants across resize, undo and export/cold reopen. | Verify repository license of exact files; REA observation not automatic code reuse. |
| PhET | Predict, manipulate, compare visual representations and explanation. | Slider physical quantity updates model, dimensions, graph and a subsequent prediction question; independent numeric oracle. | Inspect each simulation and asset license/version before commercial inclusion; observe only or implement originally when uncertain. |
| Brilliant | Progressive prompts, self-explanation, adaptive reveal and interaction timing. | Prediction before revealing result, varied follow-up rather than identical retry; REA actual interaction receipts. | Proprietary UX inspiration only; no copied source/assets. |
| Desmos / GeoGebra | Formula↔graph coupled interaction and precise mathematical feedback. | Exact formula and visualization agree at 10+ boundary/sample points, keyboard controls and reduced motion. | Evaluate embedding/API/product terms and attribution. |
| Excalidraw vs tldraw | Canvas embeds, dragging, resizing, snapshots, recovery and annotation ergonomics. | Plugin survives mount→save→reload→replay without bypassing signed host. | **tldraw SDK production requires a valid license** (https://tldraw.dev/sdk-features/license-key); replacing Excalidraw must include total cost and migration evidence. |
| Moodle/Open edX | Course→section→unit hierarchy, authorization, assessment and content sequencing. | Course/edition separation, exact source identity, navigation/bookmarks and safe submission ledger. | #285 already transferred parts; avoid building a second LMS. |

**Donor prioritization in the next 48h:** (1) BBB audio+event playback; (2) PhET/Polypad **one** scientific manipulation; (3) Desmos mathematical binding. Other platforms are follow-ups, not a donor-scanning trophy list. Run REA on accessible, authorized surfaces; for proprietary sites retain bounded observations and design an independent contract. Evidence must link source capture, exact version, transferred code, RED/GREEN regression and a blind replay/visual check on the implemented product.

### Pedagogical design constraints

Use ICAP to prioritize actual constructive prediction/explanation rather than mere clicking (Chi & Wylie, 2014, DOI 10.1080/00461520.2014.965823). Use worked-example **fading** for novices→autonomous practice (Renkl et al., 2004, DOI 10.1023/B:TRUC.0000021815.74806.F6). Use multimedia signaling and temporal/spatial contiguity to align voice, formula and visual change (Fiorella & Mayer, 2021, DOI 10.1017/9781108894333.019). These are design heuristics with contextual caveats, not blanket evidence that animated UI causes better learning.

## 4. Pilot product and critical acceptance

### Deadline A — by 2026-10-26: truthful differentiating vertical for marketing

**Proposed subject:** one small Physics phenomenon, e.g. hydrostatic pressure, if it best reuses existing lab/solver capabilities; builder decides by actual code reachability. Reject a fixed quiz dressed as a simulation.

Single browser journey:

1. Open a preview lesson from one of the four marketing pathways; no login necessary for a demo with **synthetic data**.
2. Predict change in a physical outcome before changing an input.
3. Manipulate one physical variable: formula, diagram and numeric result must agree with deterministic physical oracle. Expose model assumptions, units and invalid cases.
4. Teacher's board view demonstrates a *real* event sequence; allow a timeline seek. Optional synthetic prerecorded audio must be labeled; no microphone prompt on landing.
5. Show a derived study card referencing an actual event and source (can be teacher-authored/approved synthetic fixture, clearly labeled), plus a different transfer question.
6. CTA connects to the same pathway; do not claim a human-approved bank or actual personalization if those remain absent.

**Minimum gate:** HTML/UI/visual tests, scientific edge oracle, event save/cold reopen proof, provenance of the synthetic demonstration, mobile/desktop keyboard/reduced-motion, evidence of actual HTTPS behavior (blocked from this audit runtime). No production publication or fabricated student outcomes.

### Deadline B — by 2026-11-02: limited integrated beta candidate

Teacher opens real controlled local/staging lesson → explicit audio consent & capture (if supported) → board and plugin events with timestamp→LessonOS semantic evidence→ draft material from same source→teacher approval→student authorized material→different practice attempt→recorded learner result→teacher sees context on next opening.

**Must be separately proven:** idempotent import/export, revocation, per-student isolation, scientific review, backup/restore, tenancy/auth, RLS, real browser round-trip, bounded use of AI, no false automation, cost. A failing core gate implies **not beta**; narrowing scope is preferable to publishing an unaudited product.

## 5. MCP Core write: security-first proposal

Current four GET-only tools are valuable. Add a **separate proposal** for write operations, not an unreviewed change to `ardesia-study-readonly`:

**AI policy conflict to ratify:** root `AGENTS.md` explicitly requires **ZERO-LLM in prodotto**. A production LLM feedback generator is not currently authorized by this audit. Keep authoritative facts, grading oracles and release decisions deterministic, and preserve a manual correction path. The optional AI suggestion stage below is **design-only** until a separately ratified decision sets vendor/privacy/consent/cost and evidence boundaries. This prevents a silent policy change while pursuing AI integration.

- Teacher authorizes reading a student's submitted work at exact `submissionId/revision/digest` with a scoped consent/auth envelope.
- Deterministic validators and optional LLM produce a **proposed correction draft** with traceable formula/step/source and explicit uncertainty.
- MCP `correction.create_draft` appends only a private draft, with role/tenant checks, idempotency key, expected version and student-PII minimization.
- `correction.update_draft` operates with CAS; stale revision returns 409 without data loss. No externally supplied actor or arbitrary URL.
- A **human teacher** invokes `correction.approve_and_release` in a distinct step with the exact draft digest, recorded review ID and explicit authorization; only then is feedback student-visible.
- Revocation and late retry cannot republish; audit and retention enforce student rights. Synthetic PostgreSQL+RLS, stale/revoked token, prompt injection, concurrent teacher changes, wrong class, overlarge/hostile PDF and submission replay are mandatory RED→GREEN tests.

MCP specification authorization: https://modelcontextprotocol.info/specification/2026-07-28/basic/authorization/ . Remote transport auth scopes and token audience are necessary but **not sufficient** for application tenant authorization. Do not allow the AI model to be its own reviewer, publisher or payment authority.

## 6. External tutor, gestionale and economics

Without a tutor-facing management workflow, Ardesia risks becoming an expensive private lesson demo. The earliest monetizable benefit is **time saved on a recurring paid group** and superior conversion from an interactive trial.

Build **only the thinnest coherent admin seam** now: create an edition, invite authorized learner, assign an existing Pack/Workflow, receive one submission, draft/release its correction, observe attendance/progress, and export a billable activity record. Respect current roles, catalog, review, receipt and consent models. No Stripe/live invoicing until explicit commercial and legal decisions.

Measure, do not invent:

- Landing visitor → demonstration start → demonstration completion → legitimate expression of interest → confirmed enrollment → paid seat.
- Preparation and correction minutes per student before/after; minutes spent checking AI mistakes.
- Teacher live hours per cohort, capacity, cancellation/no-show and support load.
- Infra/storage/audio/ASR cost per *actual* cohort, retention, gross contribution, legal/admin overhead.
- External tutors' ability to publish their **own** course from one documented Pack/Workflow without copying source files.

Gross contribution model: `paid_seats × price_per_seat − payment_fees − delivery_hours × tutor_cost − correction_hours × tutor_cost − variable_AI/infra/storage/support − refunds`. No current real conversion, price, external-tutor willingness-to-pay or gross margin has been established by this audit. Treat a revenue-share marketplace as a **hypothesis**.

## 7. Cross-platform plan and Kirchhoff/ELAB reuse

Do not port whole products indiscriminately. Stabilize shared contracts:

- `LessonSession` + actor/tenant boundaries.
- `SourceRef` exact revision/digest.
- `EvidenceRef` and `JournalEvent` versus sparse semantic `LessonOsEvent`.
- `PluginManifest` kind/capability/signature/install/mount/snapshot.
- `TeacherReview`, `Submission`, `CorrectionDraft`, `PublishedFeedback`.
- `CoursePack` + edition + workflow.
- `ExportBundle` and migration-safe import.

Then add adapters: browser, native, ChatGPT Apps/MCP, Claude-compatible MCP, LMS, future marketplace. The adapter never owns the source of truth. Native animation fidelity and pen experience require real device tests, not a browser screenshot.

**Kirchhoff**: identify a single narrow first circuit type with known independent solver result; expose as a signed simulation plugin/tool, preserve drawing state and evidence, connect to one exercise and TeacherBook. **ELABTutor**: extract existing manuals/lesson-path datasets as versioned Pack, not the old standalone auth/dashboard. Rewriting/manual reformatting alone is insufficient: references must bind exact manual revision/page, and simulation steps have deterministic validators. Audit licensing and ownership before publishing Riccardo's code or manuals.

## 8. Verification matrix — this audit only

| Claim | Verdict | Why |
|---|---|---|
| Both repositories readable through authorized connector | **PASS** | Direct reads of branch metadata and relevant files. |
| Main and October draft heads distinguished | **PASS** | Exact SHAs read; no assumption of merge. |
| #290 and #285 CI summaries completed successfully | **PASS (metadata only)** | GitHub Actions workflow-run summaries, not local reproduction. |
| Scientific approval of four preview questions | **NOT_RUN** | #290 marks DRAFT and human approval pending. |
| Render preview deploy status | **PASS (metadata only)** | Read-only Render API confirms static preview `live`, exact #290 SHA and autodeploy disabled; not an HTTP/browser correctness test. |
| Direct page fetch, true browser quality and screenshots | **BLOCKED** | Web fetch disabled and runtime DNS unavailable; no claim that preview is down. |
| REA new acquisitions on this audit runtime | **NOT_RUN** | Documentation and prior PR receipts analyzed; no REA CLI/browser executed here. |
| Authentic end-to-end audio+board+LessonOS→personalized pack | **NOT_RUN / NOT ESTABLISHED** | Primitive source files inspected; no exact-session integration browser round-trip. |
| Current live auth, Supabase RLS and PostgreSQL staging | **NOT_RUN** | Synthetic/local PR checks are not live-cloud authorization tests. |
| MCP write correction working | **FAIL as product capability** | Source server contains only four read-only tools, as designed; new capability proposed. |
| Plugin marketplace with outside tutors | **NOT_RUN / NOT ESTABLISHED** | Historical vision/spec is not a deployed and tested creator flow. |
| Cost, conversion and external demand | **NOT_RUN** | No measurements collected here. |
| This audit changes builder branches, private vault, production or main | **PASS: no changes** | Docs-only independent branch proposed; never claim full deployment. |

## 9. Prioritization and stop rules

- **Marketing first**: one visually impressive **truthful** preview, not more explanations of why the product will someday be unique.
- **Integration second**: memory, authorized correction, replay and cold reopen on one exact vertical, not another separate subsystem.
- **REA third as an accelerator throughout**: spend research time where it reduces a named test gap; adapt original behavior, not imported proprietary source.
- **Commercial check**: one teacher run + one external tutor authoring task matters more than an imagined marketplace catalog.
- **Stop a rewrite** if tested capability decreases, if no migration/rollback exists, if the donor license is unclear, or if the change creates a second Core.

### NEXT PRIORITY TASKS

**P1 — Real living-lesson marketing entry**  
Owner: GPT-6.1/Codex. Base: inspect #290 head `339ab08f…` and actual latest relevant Studio branch; do not overwrite either. Scope: one original Physics controlled plugin + one marketing entry/deep link. Gate: predict→manipulate→numeric+visual oracle→timeline event→derived reviewed synthetic study card, stable at 390/1440px; fail if the control is only decorative. Risk: bypassed ToolHost or new duplicated simulator. Stop: keep feature flag off if Core seam is not verified. Value: recognizable product differentiation within two days.

**P2 — Time-aligned board/audio provenance fixture**  
Owner: GPT-6.1 with independent Astra review. Starting sources: `AudioRecorder.ts`, `JournalRecorder`, `journalBridge.ts`, `eventlog.ts`. Gate: consent off by default, synthetic authorized audio capture/replay seek to exact board revision, revoke/purge and cold reopen; distinguish recorded bytes from transcript and semantic claims. Do **not** promote chunks to knowledge automatically. Risk: PII/retention and event drift. Value: authentic LessonOS foundation.

**P3 — MCP correction write RFC + red security tests (NO production mutation)**  
Owner: Pro (contract) then Codex (tests/Core). Base: #285 read-only MCP and #284 reviewed-publication guard. Files: new review RFC/test suite, existing Study API ledgers. Gate: wrong tenant, stale digest, repeated/revoked command and hostile document all fail closed; separate draft vs teacher release. Risk: permission escalation/automatic grading. Value: rapid correction of student submissions.

**P4 — REA donor triad closure**  
Owner: DeepSeek research isolated from app write paths; Pro/Astra reviews. Donors: BigBlueButton recording, one PhET/Polypad interaction, one Desmos formula↔graph behavior. Artifact: three versioned behavior dossiers with rights, receipts when available, a 20-step behavior spec and exact transfer-ready test cases; zero copied proprietary assets. Gate: each dossier can be converted into a named RED regression test; unknown claims stay unknown. Risk: deep research without implementation. Value: drastically reduce rediscovery/design iteration.

**P5 — Minimal gestionale economics/teacher workflow**  
Owner: Pro product spec + Codex narrow delivery. Scope: edition/roster/attendance/submission/review/release/billable activity all via existing Core roles. Gate: synthetic teacher creates and closes one edition with one submission, logs accurate teacher time; independent tutor completes onboarding test. Risk: recreating Moodle and duplicate CRM. Value: direct time saving and measurable sales hypothesis.

**P6 — Kirchhoff/ELAB canonical plugin integration spike**  
Owner: specialized circuit builder with independent scientific review. Scope: **one** validated circuit + **one** manual page + plugin snapshot, not full port. Gate: solver parity with independent oracle, signature/capabilities honored, save/reopen, exercise evidence to LessonOS. Risk: embed second standalone app and unverified manuals. Value: scientific differentiator and reusable domain architecture.

**P7 — Exact-branch consolidation and trust-plane freshness**  
Owner: Pro/Astra adjudicator, **not** autonomous Obsidian writer. Scope: produce GitHub DAG from current heads, plan merge/rebase without actions, add dated snapshot and no-duplicate-status guard. Gate: each PR ancestor checked, exact final CI required, generated current state not manually edited, protected knowledge branch unchanged. Risk: stale main and stale generated knowledge interpreted as active product. Value: maintainable, auditable delivery.
