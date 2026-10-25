# TARGET-082: independent integration review

Review scope: frozen prototype `TARGET-082-ADAPTER`, not a deployed Ardesia component. No product code, dependencies, DB, Auth, Storage, provider or shared runtime changed. No browser or real PDF.js decoding was run by this reviewer. The product comparison uses commit `2d6002b17bedc567bf3057d6265b459807235bc3`; AssetPreview, SourceViewer, shared transport and Core/API asset paths are unchanged from its parent `f4384eed61e87510cbb7e29b9e7f9ff6d6fecebd`.

The prototype is useful as a bounded PDF rendering port, but is not ready to copy into the product. One wrapper lifecycle defect is independently reproduced. Ardesia also needs an authorized binary descriptor before it can check an expected SHA in the client. This is an integration requirement: the current server already checks original bytes against the canonical asset hash.

## Provenance

- Frozen FREEZE.json SHA256: `698d279d5e7ff5f7484f76b8f0acd2a4d418ed435a0954e8346cd62d1b7b8d71`.
- Frozen manifest.json SHA256: `3189e99e8e26bd9dabc5e5cec10307f3600084ed69602afe10629ddc65e90cad`.
- All 79 manifest-listed files were independently read, their byte counts and SHA256 checked, then copied into this review's private scratch: 11,844,794 bytes. `verified-inputs.json` records each input. This proves byte identity with the frozen bundle, not completeness of the donor's semantics or an independent upstream re-download.
- Original wrapper `site/app.mjs`: 7,946 bytes, SHA256 `d037b09d436fba63c1021642c09b14d86cced206ef35dd97567f3739eff9a228`.
- Author evidence remains scoped: four REA scenarios/21 completed steps, with globally INCOMPLETE event captures. Its real browser worker, fetch race and TypedArray detachment observations are donor evidence, not this reviewer's runtime tests or final-product receipts.
- Reads of dataless inputs were materialized through the normal Foundation API. That operation is not a QA result. General filesystem stalls do not establish a FileProvider cause.

## F082-1: old page/text rejection replaces the new source status

The original previous/next handlers call `showPage(...).catch(e => reportState(e.message))`. `showPage` guards the successful completion of `getPage` and `getTextContent`, but those rejected awaits escape to this unguarded catch. The catch reads current global state and can report a failure from source V1 while V2 is ready.

`page-rejection-probe.mjs` evaluates the byte-exact original wrapper in Node VM with controlled fake DOM, fetch/hash and PDF.js lifecycle ports. This is a unit wrapper probe, not actual PDF decoding or a product/browser test.

| Controlled case | Before old operation settles | After it settles |
| --- | --- | --- |
| V1 getPage(2) rejects after V2 is ready | V2 / page1 / ready | V2 / page1 / OLD_V1_getPage |
| V1 getTextContent rejects after V2 is ready | V2 / page1 / ready | V2 / page1 / OLD_V1_getTextContent |
| V1 getPage(2) fulfills after V2 is ready | V2 / page1 / ready | V2 / page1 / ready |

The fulfillment control confirms an existing guard works; it does not cover rejection. Text remained V2 in these probes. No stale canvas paint, data disclosure or Core permission bypass was observed. The first VM harness attempt lacked AbortController; its source/log are preserved separately and not counted as a prototype failure.

Integration requirement: capture source generation and page/render generation; check both on every success, catch, finally and state mutation. A button-level catch must not report an old request using the current source. Unmount/logout/session switch must invalidate callbacks before cleanup. Test delayed resolve AND reject of fetch, hash, document load, getPage, getTextContent and render, including a blocked cleanup. Generation-owned canvas nodes or equivalent isolation must prevent old work from painting into the new source; this last paint requirement still needs a real renderer test.

## Identity and the existing Core

`AssetPreview` currently obtains an authorized Blob through the shared C7 transport and uses native image/audio/PDF presentation; it aborts on unmount/id change and revokes object URLs. It has no canonical expected-SHA client check. `SourceViewer` opens exactly `(resourceId, revisionId)` and exact context references, with separate context generation guards.

These are different identities. A text revision's `resource.sha256` hashes text; it is not an attachment's SHA. Submissions carry `asset_refs` as IDs and `source_refs` as resource/revision/context triples, without a one-to-one association. The receipt does not supply an asset-to-SHA map. The prototype's same-fingerprint/different-SHA V1/V2 observation also rules out PDF fingerprint as a canonical identifier.

The first integration should replace the PDF iframe for immutable submission attachments only. Keep image/audio handling and exact text SourceViewer semantics. Use `assetId + originalSha256`, scoped by actor, role/session epoch and edition. Do not infer a resource revision from an asset, pair arrays by index, reopen head by resource ID, or make a derived transcript an authoritative diary anchor. PDF views in SourceBoard require an explicit canonical attachment binding or an honest label as submission attachments; that is a later bounded contract change.

### Minimal authorized binary contract, without another store

Reuse the Core asset authorization path and immutable `study_assets` metadata. Extend the existing authorized asset response with a canonical descriptor (headers or an equivalent narrow DTO): `{id, editionId, mime, bytes, sha256, extractionStatus, kind: 'immutable-upload'}`. Expose no blob_ref/storage path. Authorize before descriptor or byte disclosure with the existing owner/exact-submitted-teacher policy. Preserve unavailable/corrupt `503`, forbidden/not-found behavior, `no-store` and original download behavior. Do not expose metadata as evidence the backing object exists: the byte read still checks availability and hash.

Add a narrow shared C7 transport decoder for descriptor plus Blob; do not bypass it with component fetch. Process trusted session-rejection headers before decoding, then recheck epoch after stream read, arrayBuffer/hash and worker load. Abort on local identity change and logout. Read the body with an actual byte cap; Content-Length is a hint. Check SHA before transferring a TypedArray to the worker, while retaining an immutable verified Blob for the original download. A hash received over the same authorized channel proves consistency with Core metadata, not a signed origin attestation.

No Core schema or second ledger is needed for that binary descriptor. The descriptor/helper should share the current read authorization and hash check rather than duplicate them. API/transport contract tests must precede the component bridge.

## Pinned worker, licensing and fidelity limits

The frozen package is PDF.js/pdfjs-dist 6.4.299. The main module is 860,818 bytes / `dd13af821c9c3e1778653340d6539a1ba07bc56cba40073a4c727864cf0c232a`; the worker is 2,229,713 bytes / `07ceb740d746e5d9012fcf9f27d5c7dea09f7d2f5e74f5c8109e5787551a2333`. Use a pinned, same-origin build artifact and a real self-hosted worker, with matching main/worker versions. A CDN, arbitrary document URL or blob-worker fallback is outside this slice.

The selected modules are Apache-2.0. The two selected Foxit standard-font files use the inspected BSD-style three-condition notice (`LICENSE_FOXIT`, SHA256 `b578cdd2345840ada550bd12519533812320d5f1d21cf4c1c7e1b1b0a31c98b7`). Keep their copyright, redistribution notices and disclaimer alongside the Apache license/notices. Do not copy the entire distribution under a blanket license claim: the frozen inventory distinguishes Liberation GPLv2-with-font-exceptions, CMaps, ICC and Wasm notices; those assets are excluded from the proposed selection. This is an inventory of inspected bytes, not legal clearance for an expanded vendor set.

Expose a small `PdfSourcePort`, not PDF.js throughout course components: load verified bytes, show one page, obtain same-page derived text, cancel page, destroy document/worker. Close options over the selected asset set: no XFA, annotation interactivity, scripting manager, attachment opening or arbitrary external navigation. Verify supported options in the pinned API; do not claim an ignored `isEvalSupported` property is a security control. The prototype's `useSystemFonts:true` leaves cross-platform font fidelity unknown. Its CSP observations are not a product build/CSP audit.

The prototype's 8MiB cap, 4M embedded-image pixel cap, 2M canvas pixels and four-position cache are experimental. Core accepts PDF originals up to 20MiB/20 pages. The pinned API documentation states `maxImageSize` excludes images above the threshold from rendering. A pure Core validation probe accepted our 5,163-byte PDF containing a 3000×1500 (4.5M pixel) image, with `needs_clarification`; no PDF.js rendering was run. Therefore copying the 4M option can reduce coverage of accepted originals. Choose an explicit compatible rendering/degraded-preview policy, test scanned PDFs, and retain a verified original download. Never label a blank/degraded canvas as faithful original rendering. Native text is derived, may have ordering/formula losses, and is neither OCR nor scientific approval.

Keep only one document/visible-page workload and bounded page-position metadata. Scope position memory by actor/session/edition/asset/SHA and clear it on logout; it is a convenience cache, not a learning journal. Destroy loading tasks, render tasks, document/worker and object URLs; observe actual worker termination and late failure behavior before asserting lifecycle completeness. Encoded-byte, page and canvas caps do not establish a whole-browser RSS or throughput bound.

## Required bridge proof before product adoption

1. Actual StudyHTTP/Auth/Storage: upload an original, read canonical descriptor/bytes as owner and authorized tutor; compare expected SHA. Peer/other-tutor/revoked denial and exact historical text/context pins must survive; a newer private head stays unavailable.
2. Same PDF fingerprint but different SHA/asset identities: isolated page position and original Blob; no array-index attachment/source binding.
3. Deterministic resolve/reject barriers at every asynchronous phase, rapid page changes, source/edition switch, logout/new login, unmount and cleanup. Check old canvas, text, error and busy state cannot replace the new source, including catch/finally.
4. Corrupt/missing bytes, wrong MIME/hash, actual streamed limit and 20MiB boundary. Accepted scanned/high-pixel originals and unsupported font/CMap cases must show a truthful fallback; no silent head/original substitution.
5. Production build with self-hosted pinned worker/license assets and CSP; actual worker startup/termination, unsupported-browser fallback, native original download after buffer transfer. This does not follow from a fake port or a main-module byte comparison.
6. Keyboard page controls, focus/announcements and same-page text alternative at 390/820/1440; inspect pixels and Axe results on the final candidate. Derivation and historical/canonical status must remain clear without introducing new authority claims.

No final G0/G1/REA gate is promoted by this review. Actual product PDF decoding, accessibility, rendering fidelity, memory/worker lifecycle and session/Storage bridge remain NOT_RUN here. No author fix or approval is required to record F082-1: root can implement the bounded adapter with these guards and tests.
