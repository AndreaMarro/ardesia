# Independent technical review and disposition

A fresh read-only reviewer inspected actual S18 files, tests and contracts. No edits, builds or tests were delegated. The reviewer could not resolve the iCloud-dataless base pack; this limitation is retained. Metadata was later recovered. The review is neither human approval nor a scientific endorsement.

No Critical issue and no Core authorization bypass found. Exact resource authorization precedes original reads; authoritative owner/edition/hash/MIME checks block generic JSON laundering; receipt retries reauthorize dependencies; old references never select current revisions.

| Finding | Disposition / proof |
|---|---|
| Delayed export after detected resource revocation | Fixed lifetime abort + generation guards; revocation-red.log reproduces unwanted download; revocation-green.log and final Web suite |
| Portable original exceeds256KiB JSON route | Fixed existing binary upload + small manifest, no shared admission change; large-import-red.log, core-http-2.log |
| Saved link points to previous revision | Collection adopts canonical saved selection; browser asserts link revision after save |
| Overlay/page geometry after resize | React-owned sibling overlays, resize/scale observation; browser compares bounding boxes at390/820/1440 and width fit |
| Same-page notebook idempotency collisions | Fingerprint full copied state; browser copies distinct notes on one page and asserts distinct successful notebooks |
| Citation truncated after5000-character body | Complete citation in separate bounded chunks, all regions preserved; notebookBridge.test.ts covers5000-character text/50regions |
| Generated title exceeds200 | Bounded Unicode-safe title; notebookBridge tests |
| Missing physical original file | Controlled503, no fallback; missing-bytes-red.log and final Core tests |

Considered limitations were resolved or bounded explicitly: multi-region/text target parity is retained in complete citation chunks plus all highlights; remote-provider/final S00 composition and Safari/device behavior remain NOT_RUN. Browser success is established only by the actual final run and evidence manifest, not by the reviewer's observation. No deferred review finding remains in S18 code.

Final executor fixes beyond the initial review: shared openPdf/PdfTask now reports worker failures to an accessible retry state (workerFailure.test.tsx RED→GREEN); acknowledged save updates the exact living URL, not only a link (lessonBridge.test.ts plus actual native refresh browser proof). URI changes retain shell/edition/hash/history state. Complete notebook citation chunks and bounded prose/title also pass valid-Unicode boundary tests. No new review seat or claimed human approval was added.
