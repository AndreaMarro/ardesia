# Actual product browser proof — 26 October 2026

The ordinary compiled Web application and `study_api.app.create_app` passed all
**25 browser groups** using Chromium **148.0.7778.96**. This dated evidence
supersedes the browser `NOT_RUN` state in the earlier
[composition snapshot](../composition-20261026/README.md), which remains intact.

## Exact subject of the proof

- Upstream #324: `31cd637bbe9789c1a4eb675f542e1d8fead72fb8`.
- Integrated main: `b24ef9784bcac50c00d6e343a172eef904c19eab`.
- Local merge: `8297c0b3284f7c6440c514499be84d3dc1f59692`.
- Product and ordinary build: `730457fb9ad6b02f1a2506609580cbd8e914f72a`.
- Browser runner/source HEAD: `48fa62eaf793c83ee4755be54484988b4169190d`.
  Subsequent commits before this run contain evidence and the additional 360px
  proof viewport; product source is unchanged from the product commit.
- All 307 emitted assets match the recorded SHA-256 values in
  [build-manifest.json](../composition-20261026/build-manifest.json).
- The runner verifies its HEAD and the actual Materials, SourceViewer, factory
  and proof server hashes before and after the journey. They are recorded in
  [browser-result.json](browser-result.json).

No consumer transform or replacement Core factory is involved. The proof
server installs the actual product factory with a fresh synthetic SQLite store
and local original-asset directory. The browser runtime and local listener ran
with the permitted process permissions. No product dependency, gate, timeout,
skip or threshold was changed to obtain this result.

## Observed behavior

The journey opens the actual Materials screen and renders the original PDF,
outline and thumbnails. It searches native text, saves a teacher's equation and
graphical region, and opens the exact shared annotation through the student's
actual activity delivery and SourceViewer. Personal text and region notes
survive a cold reload, native refresh and an actual server-process restart.
The existing scientific NotebookEditor creates and persists two distinct
notebooks for different notes on the same page.

Export/import preserves original bytes and exact origin revisions. Two PDF
versions retain their historical byte identity. The active document fixture
does not execute its JavaScript or link annotations. Peer access to the private
annotation is denied with 403. Session revocation removes the private reader
and original URL, and deletion of the exact source removes the reader without
falling back to the latest revision. The run records zero unexpected JavaScript
errors and zero external requests.

The exact assertions and synthetic identifiers are in the machine-readable
result; [browser.log](browser.log) records the 25 passing groups and
[browser-server.log](browser-server.log) preserves the local HTTP/server trace.
The private fixture state, session tokens, SQLite database and uploaded
originals are deliberately absent from these deliverables.

## Screenshots and inspection

| Browser viewport | Capture | Visual observation |
| --- | --- | --- |
| 1440 × 1100 | [s18-1440.png](s18-1440.png) | Thumbnail navigation, original PDF and note editor are visible together. The saved equation highlight is aligned with the page. |
| 820 × 1100 | [s18-820.png](s18-820.png) | Controls wrap and the note editor moves below the PDF. The capture includes a visible keyboard skip link over the navigation area. |
| 390 × 1100 | [s18-390.png](s18-390.png) | Actions wrap, the document fits the reader width, and the note editor remains reachable below it. |
| 360 × 1100 | [s18-360.png](s18-360.png) | The narrow release viewport has no horizontal document overflow; controls and note actions remain within the reader. |

All four captures were inspected. They are element captures of
`.living-sources`, not full application-shell screenshots. The browser tests
also assert page/annotation alignment within two pixels, no document-body
horizontal overflow, fit to the narrow reader, accessible native text,
keyboard region selection and reduced-motion behavior. Full-page PDF text is
small at mobile widths; zoom and the accessible native-text panel remain the
available reading routes. These observations are not a user study or a claim
about real device or Safari behavior.

## Reproduction

Run the ordinary build first, keep product source fixed, and use fresh state
and output directories. The browser binary was supplied by S00; install the
same locked Playwright browser when reproducing elsewhere.

```sh
npm run build:web
PLAYWRIGHT_BROWSERS_PATH=/tmp/ardesia-browsers \
ARDESIA_S18_FRONTEND=apps/web/dist \
ARDESIA_S18_PROOF_STATE=work/integrated-browser-1/state \
ARDESIA_S18_EVIDENCE=work/integrated-browser-1/evidence \
ARDESIA_S18_OUTPUTS=work/integrated-browser-1/images \
ARDESIA_STUDY_PYTHON=services/study-api/.venv/bin/python \
  node handoffs/swarm-v2/S18/proof/browser.mjs
```

The recorded command exited 0. Its runner owns port 5419, restarts its own
server for persistence verification, and stops its processes in cleanup.
[evidence-manifest.json](evidence-manifest.json) hashes this evidence set and
pins the prior build manifest.

## Boundary and continuation

This certifies the local synthetic Core and its local `blob_dir` adapter. It
does not certify a hosted provider, remote storage or G1, Safari, hardware,
scientific/editorial approval, canonical lesson/version/phase authority,
GitHub CI, merge, post-merge main, or a deployment. The declared annotation
`lessonId`/`activityId` association is not canonical lesson authority.

S00 reviewed the three consumer/factory mounts and LivingSourceReference and
reported no blocking delta finding. That is a technical review, not an
independent human approval. S00 owns final integration with the other consumers,
exact-head and merge/post-merge gates, shared RUNLOG/NEXT, and publication.
