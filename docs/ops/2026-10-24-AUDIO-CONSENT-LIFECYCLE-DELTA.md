> **Import storico del 25 ottobre 2026, PR #295 `15fa8176e6ede03a4430b4bccf03dc25ec5595b3`.** Proposta/snapshot della data originale, non nuovo canone né capacità implementata o approvazione editoriale. Per stato effettivo, limiti e correzioni successive leggi `docs/ops/PROJECT-CONVERGENCE.md`, RUNLOG e lo stato generato.

# Ardesia — Audio consent lifecycle adversarial delta

**Observed:** 2026-10-24, Europe/Rome. **Status:** PROPOSED / source-level finding, not executed browser test. **Evidence pin:** `#285@c43f5b9d52fec10d554059be9ae63ed87a4c15aa`. This document is intentionally a *small differential* to [the broader audit #291](https://github.com/AndreaMarro/ardesia/pull/291) and [MCP/Core reuse analysis #293](https://github.com/AndreaMarro/ardesia/pull/293). It does not duplicate their North Star, historical decision ledger, REA donor matrix, licensing investigation or work already delegated to GPT-6.1.

## 1. Source-verified, previously uncaptured privacy race

**Issue:** [#294 — post-revocation `getUserMedia` resolution can start the microphone](https://github.com/AndreaMarro/ardesia/issues/294).

[AudioRecorder.ts at pinned commit](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/apps/studio/src/store/AudioRecorder.ts) checks `_consent` and `_recording` only **before** an asynchronous `getUserMedia` call. Consent can be revoked while the permission promise is pending. `stop()` then sees `_recording=false` and returns; `lastRevoke` can finish. When the old permission promise resolves, `start()` creates and starts a recorder **without rechecking consent or cancellation**. Since the last revocation completed before acquisition, the media tracks may remain active. The chunk store guard does not prevent a live microphone.

This is a deterministic **source control-flow counterexample**, not an observed microphone incident. MDN: [getUserMedia asynchronous contract](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia); [MediaStreamTrack.stop()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop).

The existing [AudioRecorder tests](https://github.com/AndreaMarro/ardesia/blob/c43f5b9d52fec10d554059be9ae63ed87a4c15aa/apps/studio/src/__tests__/AudioRecorder.test.ts) use an immediately resolved getUserMedia fixture and do not cover revocation/disposal while permission is pending. A related, separate [issue #292](https://github.com/AndreaMarro/ardesia/issues/292) documents the final MediaRecorder blob loss on *normal* stop.

### Adjacent risks (hypotheses requiring tests)

- Two `start()` calls before the first permission resolves can acquire two streams; `_stream` and `_mediaRecorder` are mutable single slots, and the older stream might be overwritten without track disposal. **Probable from control flow; NOT_RUN**.
- `consent` setter persists session YAML in fire-and-forget asynchronous calls. A previous ON write may complete after a later OFF write unless the underlying storage enforces ordering. **Potential stale-consent persistence; needs injected delayed-driver RED**, not a proven on-disk failure.
- `dispose()` while permission is pending does not cancel acquisition. Even if disposal itself is intended to retain previously approved data, it must not allow subsequent microphone startup. **Source-level lifecycle gap; NOT_RUN**.
- `handleChunk` intentionally swallows a write failure to protect marker integrity, but the teacher needs an explicit surfaced recording failure status before any material generation claim. **UX observability requirement**, not independently verified runtime defect.

### Immediate corrective contract

Use a single lifecycle/session generation token (or explicit state machine) and a **single-flight** acquisition. At every async boundary check active generation, consent and disposed state; on a stale `getUserMedia` result, **immediately stop all acquired tracks**, never call MediaRecorder.start, and never promote audio events. Distinguish *normal finish and final-blob flush* (#292) from *revoke, discard and purge*. Serialize persistence and verify the final revocation state. Do not create a second session store or change Core consent authority.

A simplistic post-await `if (!consent) return` without stopping tracks is inadequate. A simplistic `_recording=false` on stop without waiting for the browser's final `dataavailable` is also inadequate. Avoid a large audio subsystem rewrite unless both focused repairs demonstrably fail.

### RED-first acceptance matrix

| ID | Trigger | Required result | Current audit |
|---|---|---|---|
| AUD-1 | Permission pending; revoke; deferred stream resolves | No recorder start; acquired tracks stopped; consent persisted OFF; zero audio | NOT_RUN |
| AUD-2 | Permission pending; dispose; deferred stream resolves | No new live stream or persisted ON | NOT_RUN |
| AUD-3 | Two concurrent starts, completions reordered | At most one active recorder/stream, no orphan | NOT_RUN |
| AUD-4 | Revoke, rapid fresh consent; delayed old purge | New approved session data never erased by old generation | NOT_RUN |
| AUD-5 | Delayed ON/OFF `saveSessionYaml` writes | Persistent consent agrees with last valid transition | NOT_RUN |
| AUD-6 | Normal stop before first 30-s timeslice | Final partial blob stored exactly once; journal receipt matches | NOT_RUN, see #292 |
| AUD-7 | Revocation during in-flight chunk and final callback | Purge complete, no late write or stale export | NOT_RUN |
| AUD-8 | Real Chromium synthetic permission timing and replay | Source behavior consistent in real browser, export/import safe | BLOCKED here |

**Required gate:** TS typecheck, Studio unit tests, browser permission rehearsal where authorized, consent+revocation+export integrity all green at one exact implementation SHA before live recording is marketed. Real user recordings must not be test fixtures.

## 2. Convergence snapshot, not a second North Star

As of this read, `ardesia/main@b124eee04acc8062c27284f23c5d9108e3767c27` is still distinct from the October stacked drafts. PRs #282→#284→#285→#286→#287→#288→#289→#290 describe the Study/Physics/marketing integration chain; #290 HEAD is `339ab08f4139da0b37e78bbde81e9fe4e83afea0` with no demonstrated live living-lesson Core/audio integration. Separate docs-only drafts #291 (`690e158615cc3c4fb3a3a7f2578122d465a43297`) and #293 (`5a4d89312f6a46e3a0dd435e6c040b3c134ba9f5`) have GitHub Actions CI reported **completed/success** at those respective SHAs; that verifies their limited checks, not runtime product readiness.

The ratified private knowledge `main` snapshot `00-CURRENT.md` has freshness 2026-07-25 and editor `sync/current` snapshot 2026-08-22, both DEGRADED and explicitly generated. Do **not** manually update those files, overwrite the Obsidian single writer, or represent July/August as current October behavior.

The strategic audit #291 and reusable MCP/feedback proposal #293 are already substantial. **Do not produce a third large vision document.** Adopt/reject their decisions via normal independent human review and consolidate only after ratification. This sidecar adds one actionable P0 candidate and a focused test gate.

### Proposed decision delta — do not self-ratify

- **ACCEPT** single shared clock/provenance, explicit per-lesson consent, teacher review and ToolHost/Core/Pack/Workflow separation.
- **MODIFY** audio release criteria: microphone acquisition must be cancellation-safe *before* showcasing contextual recording; treat #292 and #294 together.
- **REJECT** using privacy-safe chunk storage tests alone as proof that microphone lifecycle is privacy-safe.
- **DEFER** real student recording and full multi-tenant MCP write pending consent/auth/RLS and teacher approval; preserve current ZERO-LLM-in-product rule until explicitly revised.
- **DEFER** renderer or lesson-engine rewrite based only on REA screenshot similarity; demand a licensed donor, specified feature gap and deterministic before/after oracle.

## 3. REA and two-day pilot implications

REA's [primary README](https://github.com/morluto/rea) requires Node >=22.19 on the 22.x line; this automation container has Node 22.16.0 and no connected Desktop Commander device, so **REA execution was NOT_RUN** here. Existing reported #289/#290 captures cannot be attributed to this audit. The [REA transfer playbook in #291](https://github.com/AndreaMarro/ardesia/blob/audit/ardesia-convergence-20261024-0600/docs/ops/2026-10-24-REA-TRANSFER-PLAYBOOK.md) already defines the right experiment: verified predict→manipulate→explain, timeline seek, and formula/diagram coherence with source/version/license. Do not duplicate it; have the authorized REA-capable builder run it.

**Marketing by 26 October:** a real parametric `p=F/A` scene with explicit N, m² and Pa, one semantic journal event, stable snapshot/cold reopen and a separate, clearly labeled prerecorded demo track is defensible. **Live microphone recording and synchronized audio product claims must be withheld** until #292+#294 are fixed and browser tested. Synthetic narrated replay may be shown as synthetic; no fake LessonOS semantic extraction.

**Scoped beta candidate by 2 November:** one instructor and student run teach→observe→review→practice→reopen with Core-owned permission, submission and feedback; no claim of marketplace, public multi-tenant production, autonomous AI correction or cross-client MCP write without separate gates. For MCP correction, reuse Study's existing submission/feedback/diary chain documented in #293; avoid a new ledger.

**Business criterion:** demonstrate the exact instructor minutes saved and the student step completed; track one-funnel conversion from demo to qualified interest. The visual novelty matters but cannot override source correctness, privacy or the real Core seam.

### Evidence ledger

| Item | Verdict | Scope |
|---|---|---|
| Direct source read: AudioRecorder and tests at #285 | PASS | Identifies a controlled interleaving capable of starting after revocation |
| Official MDN getUserMedia/stop contracts | PASS | Supports the expected asynchronous lifecycle |
| New GitHub issue #294 | PASS | Reproduction and RED acceptance recorded |
| #291 and #293 GitHub Actions status at exact SHAs | PASS (docs checks only) | Completed/success returned by connected GitHub API |
| Full local TS gate / Studio test on this candidate | NOT_RUN | No local repository execution |
| REA CLI and donor browser capture | NOT_RUN | Node 22.16, no connected authorized runtime |
| Real microphone/consent/browser A/B | NOT_RUN | Needs isolated, consented synthetic local fixture |
| Multi-tenant RLS/real backend MCP writes | NOT_RUN | No remote production proof |
| New product code/market site/deploy | NO_CHANGE | This PR changes documentation only |

## NEXT PRIORITY TASKS

1. **P0-AUDIO-1 — Codex Studio:** create deferred-permission RED tests AUD-1..AUD-5; fix revoke/dispose/start generation and concurrency with fail-closed track disposal. Base: current actual Studio integration head (not assumed main). Acceptance: all tests + typecheck pass, no mic after revocation; revert on regression.
2. **P0-AUDIO-2 — Codex Studio, independent reviewer:** close #292 final-blob flush and revocation/export invariants AUD-6..AUD-8, using the same lifecycle state machine as #294 rather than competing fixes. Acceptance: normal stop retains final audio, revocation removes it; real browser proof, not mock only.
3. **P1-DEMO-1 — GPT-6.1 + REA-capable builder:** complete one licensed/original interactive pressure lesson and journal replay, binding one explicit source event to a reviewed study card and clear marketing CTA. Acceptance: independently checked numeric oracle, real browser 390px/desktop, cold reopen, explicitly synthetic audio; cancel if requiring parallel Core.
4. **P1-MCP-1 — Codex Study:** implement RED-only proposal fixture using existing submission/feedback/review/diary Core (#293), no direct DB or publish tool. Acceptance: source-bound private draft and teacher-only release, live auth/RLS marked NOT_RUN until separately checked.
5. **P1-INTEGRATION-1 — integration owner:** reconcile stacked PR chain #282–#290 on a candidate branch and run exact-SHA full-stack CI + real HTTPS browser without merging. Acceptance: no hidden inherited failures or falsely assumed feature completeness; rollback documented.
6. **P2-REA-1 — REA owner:** obtain authorized REA host/node and produce one *new* donor evidence capture with original transfer, license memo and repeatable visual/scientific test; don't repeat screenshots without behavior. Acceptance: Evidence ID + user journey + checked Ardesia implementation, not merely a REA score.
7. **P2-PILOT-1 — product owner:** field-test one tutor submission→correction→new student exercise→next-lesson retrieval and record minutes, friction and willingness-to-pay. Acceptance: signed-off pilot scope, no private personal data in GitHub, measured instructor value.
