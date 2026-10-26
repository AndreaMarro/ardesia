# S18 — living scientific sources

Candidate for S00 integration. Base main `a00f2f40091aecf69e58ebaba42cf70d748e4066`. No merge/deploy or remote-provider claim. Shared consumers/factory/DB/lock/manifests are untouched.

The reader adopts the installed Mozilla PDF.js6.4.299 full viewer stack, with thumbnails, sections, native text search, pointer/keyboard text selection, unrotated normalized regions, zoom/pan and saved view. A teacher's shared annotation opens from a real student's submitted activity in Work; the student creates a private note and a real existing scientific notebook, then restores source/page/region after refresh and a server process restart. Source references require exact resource+revision; canonical context is returned by Core. Document content SHA and original bytes are separately checked. Old versions remain old; missing originals and erased sources fail closed.

## Composition owned by S00

Apply/reconcile the following minimal patches in this same implementation PR, accounting for Materials313/317, SourceViewer309/315 and S06 structured-kind guards:

1. `api-composition.patch`: install S18 routes using existing authenticate/store dependency and blob repository.
2. `materials-consumer.patch`: lazy collection in actual Materials; exclude these typed resources from the legacy generic title list.
3. `source-viewer-consumer.patch`: typed lazy reader from exact reference, actor resolved through existing `/me` (never resource.ownerId).

`git apply --check` is verified against the declared base; it is not a promise about a future combined branch. The proof composes these same seams **in memory** in the real compiled app and API factory, not a stand-in reader shell. No production route is claimed mounted on main. No stacked PR is needed.

The browser helper is `proof/browser.mjs`; `proof/vite.config.ts` composes the candidate UI, `proof/composition.py` composes the candidate installer, and `proof/serve.py` starts the ordinary cookie-authenticated Study app. Build with `node node_modules/vite/bin/vite.js build --config handoffs/swarm-v2/S18/proof/vite.config.ts`. Set `ARDESIA_S18_PROOF_STATE` to a fresh disposable directory before a new proof. The runner currently records the locally available Python environment path; on another host replace that path with its existing Study API Python. It owns/stops its server on127.0.0.1:5419. Built files and synthetic SQLite/tokens remain in ignored scratch, outside the deliverable.

## Verification

- Targeted Core/HTTP:10PASS before the final missing-byte case, including a300KiB real PDF imported through original upload + a small manifest. Full study/Core/HTTP run was interrupted above85% to release the local heavy-job slot at S00 request; `evidence/core-http-full.log` preserves KeyboardInterrupt and a teardown error during interruption. It is NOT a complete green suite; exact-head CI remains required.
- Web full lane:449PASS/69files before final Unicode-copy boundary case; final source verification is recorded separately in `evidence/web-final.log`.
- Compiled browser:21 groups PASS in `evidence/browser-result.json` and `browser-final-2.log`, Chromium148.0.7778.96, CSP without unsafe-eval, no unexpected console errors or external requests. Includes source original, native equation + MathLive, actual Work delivery→SourceViewer, private note, graphical page2, zoom/pan resume, full-target notebook citation, UI export/import, two different PDF revisions, disabled document JavaScript/link actions,390/820/1440, keyboard/reduced motion, peer403, session revocation, same-store process restart and source deletion without latest fallback. Responsive checks compare page/overlay geometry and width fit, not just body overflow. A later repeat after final formatting/Unicode hardening is identified by the evidence manifest.
- `evidence/bundle.json` records raw/gzip/hash of the actual candidate chunks. One locked PDF.js package and one emitted worker module; full viewer is lazy. Large-chunk build warning is retained (existing MathLive and PDF worker are large).
- Browser plugin skill was absent; regular cached Playwright Chromium was used. Screenshots are saved in this chat's outputs and inspected visually. Firefox, Safari, mobile hardware, remote Study providers and production integration are NOT_RUN.
- Fresh read-only technical review found no Critical or Core permission bypass. All Important findings were corrected with preserved RED/GREEN evidence: revoked delayed export, body admission, saved revision link, overlay lifecycle/resize, notebook idempotence and citation loss. Reviewer could not diff the iCloud-dataless Git pack; local metadata was recovered without product changes. This review is not human/scientific approval.

## Authority and persistence

No second database, login, localStorage journal, publication authority, OCR or LLM. Resource revisions, owner/edition ACL, current membership, immutable asset repository, receipt retry and CAS remain Study Core. Shared-original route checks authoritative resource owner/edition against the stored asset owner/edition/MIME and actual byte hash. Generic resource JSON cannot launder a peer's upload. Existing GET/assets privacy is unchanged. Dependency checks precede receipt replay; erased/missing originals remain unavailable even with an old receipt.

Reader entry/focus/visibility and visible15s checks reauthorize the exact source and annotation; a5s deadline fails closed. This is bounded polling, not instantaneous server push or physical revocation of downloaded/exported bytes. In-flight callbacks use the same reader lifetime and cannot repopulate/download after detected revocation.

Structured annotations keep plain explanations, inert LaTeX, exercises, canonical target and a declared lesson/activity association. Quaderno reuses existing NotebookEditor: all regions become highlights; complete canonical citation/annotation ref is kept in bounded Unicode-safe note chunks, separate from a clearly labeled prose excerpt. Full original annotation remains in Core. No claim that selectors prove scientific comprehension.

Export is an explicit local disclosure containing originals and exact source/annotation revisions. Import verifies bytes, uploads through existing asset transport, sends a small manifest under the unchanged256KiB command limit, creates private Core copies, and preserves original references as unsigned provenance. A portable file grants no access to original identities.

[Contracts](CONTRACTS.md) specify S03/S17/S20 interfaces and coordinate/UTF16 conventions. [Acquisition decisions](acquisition/DECISIONS.md), full license copies and manifest preserve pinned versions, SRI/SHA-256, dependency inventories and ADOPT/REJECT rationale. OpenSeadragon6.1.1, BlockNote Core0.56.0 and Annotorious3.9.5 were inspected and rejected for this increment; no XL use or license grant inferred. Full PDF.js reader is the substantial acquired system.

## History and next actions for S00

Failed runs are preserved, including wrong test cwd, a mistaken rotated-width assertion, first missing disclosure step, React portal ownership on zoom, late export, null lesson context, large import, missing bytes, surrogate boundaries and detached-viewer scrolling. None is replaced by a later green log. PLAN.md records decisions and environment recovery. No existing shared RUNLOG/NEXT was edited because S00 is the sole writer; MEMORY-APPENDIX.md supplies an append-only entry.

1. Compose the three patches with313/315/317/S06 on the final candidate; acceptance: the same teacher→student→quaderno path in the actual consumer, with Core ACL and exact bytes.
2. Recheck required CI on that exact composed head and merge tree; then let S00 integrate and verify post-merge main. This PR alone does not certify main.
3. Exercise remote provider/revocation and Safari/device compatibility on synthetic data; do not extrapolate local SQLite/Chromium results.
4. Connect S17 replay and S20 activity entry using CONTRACTS.md, retaining their own canonical page/media/activity authority.
