# Ardesia — REA evidence-to-product transfer playbook
**Date:** 2026-10-24. **Status:** PROPOSED / implementation handoff, not a completed REA capture. Companion to `docs/ops/2026-10-24-STRATEGIC-CONVERGENCE-AUDIT.md`. Do not replace that audit or the existing REA receipts.

## 1. Exact problem and measurement

We need at most **three verified behavior transfers**, not another competitor image gallery. The chosen transfers must make the two-day demonstration measurably more differentiated: (a) visually legible predict→manipulate→explain, (b) temporal seek restoring the board state corresponding to speech, and (c) formula/graph mutual consistency. Each requires real donor observation, **original** Ardesia implementation, and before/after source-pinned regression.

Deliverables per transfer: source URL+version+rights; narrowly framed investigation question; REA Evidence IDs and coverage; interaction steps; state/action/data model; physical/didactic oracle; target Core/ToolHost seam; implementation PR; Playwright traces and screenshots; negative tests; license memo; remaining unknowns. Until acquired, donor claims are `NOT_RUN`. Do not count copies, website hits or REA's synthetic readiness score as product success.

**Priority rule:** inspect the *current implementation* before choosing a donor. Ardesia #290 static preview `339ab08f…` and #285 teacher catalog `c43f5b9…` are different draft branch surfaces. For the first two days use only the one interaction that can be connected to a real session/journal, without creating a parallel simulator.

## 2. REA execution contract — exact primary documentation

Official distribution: https://github.com/morluto/rea . Only packages and setup linked from this maintainer or rea.tools are treated as official. Primary docs consulted at 2026-10-24:
- https://github.com/morluto/rea/blob/main/docs/browser-observation.md
- https://github.com/morluto/rea/blob/main/docs/browser-scenario-contract.md
- https://github.com/morluto/rea/blob/main/docs/website-script-export.md
- https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md
- https://github.com/morluto/rea/blob/main/docs/reconstruction-readiness.md

REA supports passive CDP observation and active Playwright scenarios, with distinct authority and lifecycle. `inspect_web_page` may collect DOM, accessibility, scripts and optional retained script content; `capture_browser_scenario` drives declarative actions and captures explicitly requested artifacts. `compare_web_captures` compares compatible observations while preserving partial/unknown outcomes. `export_web_scripts` materializes retained sources with a verified manifest, then `analyze_javascript_application` analyzes their static relationships. These tools **do not** establish complete server behavior or permission to reuse exported source. No unrestricted browser automation can be inferred from a passive capture.

Before attempting execution:
1. Check installed binary/provider version using the maintainer-approved setup, not a random fork. The local automation container inspected on this date has Node **22.16.0**, below REA's documented supported 22.x floor **22.19**, and no `rea` binary: **REA execution NOT_RUN here**. Codex's #285/#290 descriptions separately report REA **6.7.0** executions in their own environments; do not infer their installation applies to this runtime.
2. Use an isolated browser profile and disposable synthetic test account; CDP port only loopback; deny access to private courses and student data.
3. Name exact question and readiness predicate BEFORE capture; a URL-only complete result says nothing about the changed visual state.
4. Request `dom`, `accessibility` and `screenshot` where appropriate, plus event observations only when needed. Prefer `after_each_step` snapshots for animations; never infer full interaction from final state only.
5. Export source bytes only for code/resources legally authorized to be inspected and for which a source-level question exists. Use original implementations or licensed packages; **no proprietary code transplant**.
6. Save Evidence ID, source digest, step outcome, limitations, missing artifacts and browser version. Distinguish `complete` capture of requested dimensions from complete product coverage.

### Canonical controlled fixture

A minimal original scenario on a **locally owned** Ardesia fixture (replace executable and URL in the builder environment):

```json
{
  "browser": { "mode": "launch", "executable_path": "/absolute/path/to/chromium" },
  "start_url": { "url": "http://127.0.0.1:3000" },
  "actions": [
    { "step_id": "predict", "action": "click", "locator": { "kind": "css", "selector": "[data-testid='prediction-choice-a']" }, "timeout_ms": 10000 },
    { "step_id": "predicted", "action": "wait_for", "locator": { "kind": "css", "selector": "[data-testid='prediction-state'][data-state='chosen']" }, "state": "visible", "timeout_ms": 10000 }
  ],
  "capture": { "at_end": [ "dom", "accessibility", "screenshot", "url" ] }
}
```

The selectors and readiness marker are **proposals**, not confirmed existing Ardesia DOM. Run `rea capture-browser-scenario ./scenario.json --json > capture.json` after the fixture is implemented. For retained script extraction on an authorized capture with requested content, use `rea export-web-scripts ./capture.json ./new-export-directory --json`, then `rea analyze-javascript-application ./new-export-directory/files --json`. Read the export manifest's coverage; when source is unavailable do not claim successful script analysis. Follow the exact documented browser capture schemas; do not assume a screenshot proves timing or correctness.

REA `npm run verify:readiness` is an internal development/conformance verifier with synthetic stages, **not** an end-to-end readiness certificate for Ardesia or a generic public CLI subcommand. An actual donor-to-Ardesia parity claim requires independently executed and compared user journeys with explicit unobserved dimensions.

## 3. Donor A: BigBlueButton — temporal replay (P2)

**Source:** https://docs.bigbluebutton.org/4.1/development/recording/ (version 4.1 docs labeled in development; inspect stable tagged repository and exact terms before port). BigBlueButton's documented recording architecture captures whiteboard/cursor/slide events separately from audiovisual media and publishes a browser playback representation. Its *architectural pattern* is relevant; its server stack should not be copied wholesale into Studio.

**Question:** when a user seeks the audio timeline to a selected time, how do presentation and annotation events reconstruct the corresponding context, including slides, pointer, and elapsed-time offsets?

**Authorized acquisition:** run on a disposable owned BBB server or permitted public demonstration; capture seek, backwards seek, page change, and replay reset; inspect only public source tagged to the same release. Do not record other users. A documentation read alone establishes architecture intent, not runtime equivalence.

**Ardesia contract:** `LessonSessionId + timeline clock + JournalEvent ref + asset digest + snapshot cursor + PlaybackSeekResult`; separate raw audio from sparse LessonOS semantic facts. Assert (1) seek 10s→2s→10s restores identical board/document, (2) offline .lesson import reconstructs, (3) user stop retains final audio blob, and (4) revocation removes audio without deleting unrelated journal facts. First blocker: [source-level likely final-blob loss, issue #292](https://github.com/AndreaMarro/ardesia/issues/292). Do not promote audio chunks to comprehension facts.

**Stop condition:** if direct board/journal replay is not yet deterministic, fix that seam before adding transcription or AI recap. Keep an original synthetic prerecorded asset marked DEMO.

## 4. Donor B: PhET or Mathigon — physical manipulation (P1)

**Question:** how does a learner predict, manipulate a physically meaningful variable, observe a visually smooth consequence and receive guided explanation *without* turning the experience into click-through trivia?

**Acquisition:** one publicly accessible explicitly authorized experiment with one scalar parameter. Observe baseline, prediction prompt, input variation, formula/text update, invalid boundary, keyboard use, reduced motion and return/reload. Use Playwright to derive state transition and numerical observations; REA to record DOM/accessibility/visual steps and available module relationships. Determine exact simulation version and item-level licensing before considering reuse.

**Ardesia transfer:** a deterministic domain function independent from UI, stateful accessible control, SVG/Canvas visualization, layout constraints, numeric oracle and `EvidenceRef` when a teacher explains a change. First domain candidate hydrostatics only if present code/library reuse is demonstrably better than alternatives. A complete regression must check units, nonphysical values, formula↔graphic coherence, real interaction, mobile and keyboard.

**Licensing:** official PhET source guidance says many simulation-specific repositories are GPL; use its mechanics as a design reference or follow the *specific* repository's obligations, not presumed permissive licensing. Public educational access is not a blanket commercial code/assets grant. Mathigon/Polypad content and package licenses similarly require file/version-level review; no copyrighted code/assets copied absent permission.

## 5. Donor C: Desmos/GeoGebra — formula ↔ visual semantics (P1/P2)

**Question:** can modifying one mathematical parameter keep formula, numbers, diagram and evidence event in sync with low latency and zero contradictory states? Study a minimal first-party public demo or licensed documented API.

**Ardesia transfer:** `ModelState` is the sole owner of typed physical variables; views are pure projections. On every state transition, recompute scientific invariants, update formula and curve/diagram atomically, and record at most one meaningful semantically labeled interaction (not every animation frame). Compare before/after screenshot only as UI evidence; rely on independent math oracle for correctness.

**Acceptance:** no mismatch during drag, focus/key operation, invalid-state handling, 320/390/1440 px, reduced motion and cold reload; accessibility names label variables and units. If a documented embed suffices for the first demonstration, use it under its actual service terms rather than reverse engineering the proprietary backend.

## 6. Visual design donor and license caution

tldraw's current SDK is source-available with **production license/key requirement**; see https://tldraw.dev/community/license and https://tldraw.dev/sdk-features/license-key. Studying its interaction design or MIT-licensed individual examples does not authorize embedding its commercial SDK. Ardesia already has Excalidraw: require a measured architectural or UX advantage before a renderer rewrite.

Screen study must cover hierarchy, spatial density, alignment to voice, formula typography, behavior of annotations, 60-fps target under reasonable hardware, accessible focus states and reduced motion. No fake state change. Reconstruct *principles*, not branded visual identity.

## 7. Team handoff & priority

**Codex/GPT-6.1:** implement one real living-lesson scientific journey on active builder branch, with independent scientific/oracle tests; reuse signed ToolHost, journal, exact Session identity, no second Core.

**REA researcher (DeepSeek or authorized local agent):** donor A/B/C reports in separate folders, one behavior each; preserve source rights, capture IDs, and residual unknowns. No overlapping app writes. **Pro/Astra:** reject proposed architectural replacements without parity, license, migration and rollback evidence; demand genuine browser test on exact head.

**First closure:** solve [#292](https://github.com/AndreaMarro/ardesia/issues/292) with RED normal-stop final-blob test, then one correct replay seek. This is higher leverage than adding more quiz cards or cosmetic movement.

### NEXT PRIORITY TASKS

1. **REA-R1** — Obtain a real supported REA runtime (builder machine), record owned Ardesia baseline at pinned current SHA with DOM/accessibility/screenshot and report an Evidence ID. Owner: DeepSeek/REA worker. Gate: full captured requested artifacts, source/version and no sensitive data. Stop if runtime/authority unavailable.
2. **REA-R2** — Acquire one authorized PhET/Mathigon parameter-change journey and derive an original state-transition + math-oracle test for the Physics pilot. Owner: REA worker→Codex. Gate: RED before implementation, GREEN after, keyboard/motion. Stop if license unknown.
3. **REA-R3** — Investigate BigBlueButton timeline/annotation ordering in tagged source or permitted demo and specify cold-reopen playback tests. Owner: Pro research→Codex. Gate: seek backward then forward retains board digest and source refs. Stop if seeking cannot be reproduced.
4. **CORE-AUDIO** — Close normal-stop final audio blob [#292](https://github.com/AndreaMarro/ardesia/issues/292) without revocation regression. Owner: Codex. Gate: tests preserve last segment and purge on withdrawal, exact SHA CI.
5. **MCP-WRITE-RED** — Draft bounded teacher correction write contract with tenant/CAS/idempotency/release adversarial cases, without live writes or AI approval. Owner: Pro then Codex. Gate: concrete RED test catalog and review by independent agent; keep ZERO-LLM policy until expressly amended.
