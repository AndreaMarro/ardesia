> **Import storico del 25 ottobre 2026, PR #293 `5a4d89312f6a46e3a0dd435e6c040b3c134ba9f5`.** Proposta/snapshot della data originale, non nuovo canone né capacità implementata o approvazione editoriale. Per stato effettivo, limiti e correzioni successive leggi `docs/ops/PROJECT-CONVERGENCE.md`, RUNLOG e lo stato generato.

# Ardesia — donor licensing, real marketing evidence and a 48-hour visual pilot
**Date:** 2026-10-24 · **Status:** PROPOSED; primary-source research + live read-only HTTP extraction, not a REA donor capture nor a screenshot review.

> Companion to independent convergence [PR #291](https://github.com/AndreaMarro/ardesia/pull/291) and [MCP Core reuse RFC](MCP-CORRECTION-WRITE-CORE-REUSE-RFC-2026-10-24.md). The purpose is a *measurable differentiating vertical*, not another presentation of existing quiz content.

## 1. Marketing preview: what is visible today

A fresh HTML/text fetch of https://ardesia-golive02-preview.onrender.com/ and the exact URLs below completed successfully on 24 October 2026 using an external browser-capable fetch connector:

- https://ardesia-golive02-preview.onrender.com/esempi/fluidi-termodinamica/
- https://ardesia-golive02-preview.onrender.com/esempi/elettricita-magnetismo/

Observed: four curricula grouped into named pathways; specific interest links to WhatsApp; progressive worked explanations; explicit **DRAFT editorial preview** label; noindex/nofollow preview metadata. The Fluidi example is about mean pressure p=F/A when F and A both double; the electrical example about I=V/R when V and R double. Wording states model assumptions and error checks.

**Important limitation:** this fetch checked rendered text, headings, links and metadata. It did NOT establish visual aesthetics, cross-device layout, motion, Web Vitals or interaction state after clicks. #290's own reported Playwright/REA/CI evidence is separate. This does confirm that the preview **is reachable via HTTPS from this execution tool**; an earlier audit's inability to fetch it is an environment limitation, not an outage. A guessed path /esempi/onde returned 404; the published exact path is /esempi/onde-ottica-radiazioni/ and no defect is inferred.

**What remains absent in the observed marketing journey:** a live physical model, board, audio synchronized to a lesson and actual student-specific continuity. The text worked example is not equivalent to these capabilities. Do not claim otherwise in marketing.

## 2. Low-cost pilot choice: extend the EXISTING Fluidi example, not a new subject

A particularly convergent candidate is the Fluidi pressure example already deployed. It has a verified explanation in #290's draft source and requires one controlled deterministic relation rather than a new science engine.

**Scenario model:** average pressure p = F/A, with F≥0 N and A>0 m². Display values with explicit SI units; do not claim uniform local pressure or infer material deformation. Boundary A=0 is invalid, not Infinity; refuse negative area. Ask student to PREDICT before allowing result reveal.

**Concrete original visual interaction:**

1. A vector arrow represents the normal force. A rectangle represents the loaded area. Numeric or accessible slider controls change F and A.
2. Formula, diagram and calculated average pressure derive from one immutable model state; they are not separately edited. The area representation must change dimension/area coherently, not randomly scale pixels.
3. Prediction: starting F=120 N, A=0.04 m² gives 3000 Pa. Doubling both yields F=240 N, A=0.08 m² and still 3000 Pa. Independently doubling F only yields 6000 Pa. Halving area only yields 6000 Pa. Use a physically plausible bounded range and no claims about uniform stress or pressure distributions.
4. Teacher explains on Ardesia board while changing a control. Journal receives the state transition (one semantic event, **not one event per animation frame**) and source revision.
5. A synthetic prerecorded audio narration may illustrate timeline alignment, **clearly labeled** and without visitor microphone prompt. Do not use real pupil audio for this marketing proof.
6. Timeline seek backwards/forwards restores the exact earlier parameters, diagram, formula and annotation state. Generated study card binds the same exact event/source; a second *nonidentical* transfer question tests comprehension.
7. A visible CTA goes back to the same Fluidi pathway and interest flow; exact review status remains DRAFT unless approved.

This is a candidate selected by minimizing new content and backend invention, **not a determination that this is the best plugin seam**. Builder must first check whether a currently available Physics/Simulation Plugin produces a better authenticated end-to-end slice without duplicating Core.

### Scientific acceptance
| Case | Expected |
| --- | --- |
| F=120, A=0.04 | p=3000 Pa |
| F=240, A=0.08 | p=3000 Pa |
| F=240, A=0.04 | p=6000 Pa |
| F=120, A=0.02 | p=6000 Pa |
| A=0, negative, NaN, nonsensical input | explicit error/no numeric leak |
| Undo→redo, save→reload, seek 10s→2s→10s | exact model + board + source digest match |
| Keyboard and reduced motion | identical semantic state changes; animation optional |
| Consent off/revoke | no unauthorized or residual audio in export/caches |
| Wrong lesson/session source | deny state join; no silent latest-source fallback |

Do not replace the independent numerical oracle with an animation or screenshot assertion.

## 3. REA: what should actually be acquired

Primary tool: https://github.com/morluto/rea ; specific workflow contract and safeguards are documented in #291's [REA playbook](https://github.com/AndreaMarro/ardesia/blob/audit/ardesia-convergence-20261024-0600/docs/ops/2026-10-24-REA-TRANSFER-PLAYBOOK.md).

The goal is **one licensed/authorized donor behavior, a new Ardesia implementation and one repeatable test**. Produce Evidence IDs and retained artifacts where available, not broad claims that REA has recreated entire proprietary ecosystems. Do not infer a backend from frontend screenshots; passive observation cannot assert code parity. This automation runtime has Node 22.16.0, below REA's documented 22.19+ floor, no REA CLI, and no connected remote desktop. **NO new REA capture was executed in this research run.** Existing #285/#290 REA receipts belong to those agents, not to this run.

Recommended bounded acquisitions:

**REA-1 / Pressure teaching sequence:** capture an authorized publicly accessible mathematical manipulation, preferably a Mathigon/Polypad interaction with accessible controls. Record baseline, prediction/reveal, input change, undo, invalid boundary, keyboard and mobile. Implement ORIGINAL semantics tied to p=F/A, not an image clone.

**REA-2 / Audio-annotation timeline:** use BigBlueButton's documented event/media separation as architecture guidance. On a permitted demo/own deployment, exercise a seek backward then forward across a slide/annotation change; compare exact event ordering and recovery. Build an Ardesia-owned event/media time-mapping test, not a second BBB stack.

**REA-3 / Formula↔drawing:** investigate documented Desmos/GeoGebra behavior, observing how graph and formula remain synchronized under changes; require strict deterministic test of p=F/A model state at sampled/boundary values. Prefer an officially supported licensed embed where appropriate.

For each: donor URL+version+rights → approved REA scope → Evidence IDs → precise observations/unknowns → Ardesia contract → deterministic RED → implementation GREEN → browser/visual review and accessibility → SHA/diff → remaining limitations.

## 4. Commercial licensing: a release-blocking distinction

**PhET is NOT a general-purpose free asset source for paid Ardesia courses.** Its [official licensing page](https://phet.colorado.edu/en/licensing) says regular HTML simulations are **CC BY-NC 4.0**, with commercial license required for commercial use, including incorporation into paid/subscription products and even screenshots in marketing. Thus: **do not embed PhET simulations or marketing screenshots commercially without documented authorization/licensing.** Studying mechanics and independently implementing elementary physical laws is different from copying protected code/assets. Re-check the exact per-repository license before any reuse.

**Mathigon Studio has mixed licensing.** The [published LICENSE.md](https://github.com/mathigon/studio/blob/main/LICENSE.md) identifies most source under MIT but images, media, documentation and UI elements under CC BY-SA 4.0; third-party pieces retain their licenses and trademarks are excluded. This is not blanket permission to copy the entire experience, and a proposed Polypad subproject needs exact package/file license checks before reuse.

**tldraw is source-available but its SDK requires a production license key**, including commercial production; see [SDK License](https://tldraw.dev/community/license) and [License key](https://tldraw.dev/sdk-features/license-key). Don't rewrite the Excalidraw renderer merely after seeing tldraw's UX. Require a working proof, license/cost delta and migration/rollback.

**Excalidraw React package is presented as MIT** in [npm's package metadata](https://www.npmjs.com/package/@excalidraw/excalidraw); verify the exact installed package/dependency licenses and font assets. Existing licensed primitives normally beat a cross-engine rewrite.

**BigBlueButton 4.1 recording documentation** describes capture→archive→process→publish→playback of media and whiteboard events separately; it is an architectural donor, not automatically an embeddable lesson component. Its [4.1 recording documentation](https://docs.bigbluebutton.org/4.1/development/recording/) identifies the version as in development. Pin release/version before code import.

**Brilliant and proprietary platforms:** behavioral inspiration on accessible surfaces only. No copying of proprietary JS bundles, graphics, text, interface assets or restricted content into Ardesia. Any direct code reuse must be backed by a compatible license/authorization. REA's ability to inspect is not a reuse license.

**Licensing verdict:** donor source/version/rights must be a mandatory field in each REA evidence transfer, evaluated BEFORE integration and commercial promotion, not as a late legal cleanup.

## 5. UX excellence must be functional, not decorative

The first 48-hour demonstration should visually convey novelty within a few actions:
- Before→after on one genuinely manipulated phenomenon.
- Meaningful progressive reveal and a transparent explanation of the misconception.
- Fluid transition between physical scene, formula, board and audio-timeline event.
- Readable units, scientific typography and reliable bounds.
- Desktop, tablet and 390 px mobile behavior.
- Reduced motion, keyboard interaction and observable focus.
- Cold reload with identical state and historical evidence.

Use a tight original design system and measure actual interaction failures and user comprehension. Do not set frame-rate claims without observing hardware and throttling conditions. For audio, visible transcript snippets must be either manually-authored for a synthetic demo or verified ASR; no invented recognition quality. Do not equate a single answer with a student's mastery.

The first marketing visitor should understand the demonstration with one sentence: **«Modifica la situazione, scopri perché cambia il risultato, ritrova la spiegazione anche dopo la lezione.»**

## 6. 2 days vs 9 days — truth gates

**26 October / vertical:** the single pressure/simulator lesson must work on real HTTPS preview at pinned SHA, with one physical interaction, one real captured event, deterministic model oracle, optional truthful synthetic audio, reviewable derived card and CTA. If no ToolHost/lesson seam, constrain the demonstration and explicitly label what is prerecorded; never fake an end-to-end LessonOS.

**2 November / scoped beta candidate:** teacher→session→consent/audio if verified→board/plugin events→LessonOS evidence→reviewed material→student authorized practice→next session context. Separately validate tenant isolation, revocation, RLS where applicable, rollback and economics. This does NOT include a public plugin marketplace, full Riccardo port, all LLM platforms, full Kirchhoff or autopublished corrections.

### What should be measured for profit
Conversion stages: landing unique visitors → demo start → demo completed → contact initiated → contacted lead → committed seat → paid seat. Collect with privacy-respecting, authorized instrumentation, not guesswork. Operational: preparation minutes, correction minutes, teacher live hours, support contacts, per-course storage/audio/AI costs, refund rate and tutor onboarding time. Without these measurements no reliable LTV, gross margin or creator-marketplace revenue estimate exists.

## 7. Verification state and independent reviewer judgment

- **PASS:** live HTTP/text extraction of marketing preview (exact URLs above); original pressure example text and CTA observed; source-based donor licensing rules checked.
- **PASS as proposal only:** concrete p=F/A vertical behavior + independent numeric test and interaction gates.
- **NOT_RUN:** REA execution, actual local/browser clicks and screenshots, code tests, physical animation quality, audio replay, LessonOS export, personal student model, live auth/RLS, conversion experiment.
- **BLOCKED until approval/proof:** PhET commercial reuse, tldraw production embedding without license, any transfer of proprietary bundles/graphics, human editorial approval of DRAFT examples, launch claims.
- **DO NOT CLAIM:** “platform ready”, “full personalized learning”, “automatic lesson generation” or “commercially licensed donor assets” based on this research.

## NEXT PRIORITY TASKS

1. **VIS-01 / GPT-6.1:** inspect active ToolHost/journal branch and select the minimum live p=F/A interaction (or superior existing Physics component). RED→GREEN deterministic tests, no second state owner. Due candidate: 26 Oct.
2. **VIS-02 / DeepSeek-REA worker:** one authorized donor interaction acquisition from Mathigon/Polypad or similar, rights memo, version, Evidence ID, exact behavior test; no third-party assets imported. Gate: capability transferred and independently checked.
3. **VIS-03 / GPT-6.1 + Astra:** timeline event/board pin + synthetic audio seek, first fix audio final-chunk issue #292. Gate: backward/forward replay digest and revoke/purge test.
4. **VIS-04 / Pro:** independent visual screenshot/usability review at 390/820/1440 on exact HTTPS SHA, keyboard/reduced motion/contrast; source metadata fetch alone does not pass this gate.
5. **VIS-05 / Product+Marketing:** after human editorial approval, measure first actual demo→contact funnel and tutor correction time, record genuine results, reject unsupported personalization claims.
