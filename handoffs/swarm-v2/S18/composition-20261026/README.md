# Source reader: actual product composition

Date: 26 October 2026. Upstream #324: `31cd637bbe9789c1a4eb675f542e1d8fead72fb8`.
Base main: `b24ef9784bcac50c00d6e343a172eef904c19eab`.
Local merge: `8297c0b3284f7c6440c514499be84d3dc1f59692`.
Product: `730457fb9ad6b02f1a2506609580cbd8e914f72a`.

The direct product hooks replace the need for test-time source rewriting. The
ordinary factory, Materials and SourceViewer own their mounts. Source data,
original assets, revision/CAS, authorization and receipts retain the existing
Study Core authority. PDF.js is the already locked package, loaded on demand.

## Verification executed

| Boundary | Evidence | Result |
| --- | --- | --- |
| Actual factory before mount | `factory-red.log.gz` | 2 FAIL: `/study/living-sources` returned404 |
| Actual factory and source invariants after mount | `factory-green.log.gz` | 11 PASS: Core + HTTP, shared originals, private notes, peer denial, membership revocation, deletion, export/import and large original upload |
| Actual consumer before mount | `consumer-red.log.gz` | 3 FAIL: source collection/typed dispatch absent |
| Consumer and existing SourceViewer boundaries | `consumer-green.log.gz` | 33 PASS across10files; includes source sessions, S06, Science and Kirchhoff readers |
| Web strict typecheck | `typecheck.log.gz` | PASS |
| Actual production Web build | `build.log.gz`, `build-manifest.json` | PASS on the product SHA, all emitted files sized and hashed |

The first HTTP test process inside the restricted sandbox produced no output and
was interrupted (exit130). `factory-sandbox-interrupted.log.gz` preserves that empty
capture; it is not a failing assertion or a PASS. With the permitted local-socket
runtime, the same direct-factory command produced the real RED in0.98s. GREEN
completed in2.27s. Python3.13 and Node24.22.1 were used with frozen dependencies.

The build retains the pre-existing large-chunk and JSXGraph `eval` warnings.
Measured output: 18,667,837bytes total;3,893,406JS;372,142CSS. The source reader JS
is28,254bytes (gzip9,427); its shared viewer CSS is234,906 (gzip42,225); PDFViewer
JS is169,719 (gzip51,020). These gzip sizes are computed from actual emitted
bytes; they are not network timings or capacity claims. No regression threshold
was weakened. Asset inventory and hashes are in `build-manifest.json`.

## Remaining acceptance

The new composed browser proof has not yet run. The shared Chromium installation
attempt reported by S00 failed with an empty/incomplete archive; this worker did
not repeat the installation. The previous24browser groups in the upstream
handoff certify that historical source only. New screenshots, real browser
navigation, remote provider/ACL, Safari and hardware remain unverified here.

Independent review, exact-head CI, merge/post-merge and Vercel release belong to
S00. No push, GitHub merge, PR disposition, external message, deployment or cost
was performed by this delegated worker.

## Reproduction

From the repository root, use the repository's frozen dependencies:

```sh
npm run typecheck:web
npm run build:web
PYTHONPATH=packages/engine:services/study-api:plugins/s19-circuit-lab \
  services/study-api/.venv/bin/python -m pytest \
  packages/engine/tests/study/test_living_sources.py \
  services/study-api/tests/test_living_sources_http.py -q
```

From `apps/web`, run the targeted consumer boundary suite:

```sh
node ../../node_modules/vitest/vitest.mjs run \
  src/features/living-sources \
  src/features/independent-study/SourceViewer.integration.test.tsx \
  src/__tests__/source-context-identity.test.tsx \
  src/__tests__/circuit-source.test.tsx \
  src/features/science-library/__tests__/MaterialsScience.test.tsx --maxWorkers=1
```

Once the browser runtime is available, run the existing journey against the
actual build with fresh state/output directories (substitute unique paths):

```sh
ARDESIA_S18_FRONTEND=apps/web/dist \
ARDESIA_S18_PROOF_STATE=/tmp/ardesia-s18-state-FRESH \
ARDESIA_S18_EVIDENCE=/tmp/ardesia-s18-evidence-FRESH \
ARDESIA_S18_OUTPUTS=/tmp/ardesia-s18-images-FRESH \
ARDESIA_STUDY_PYTHON=services/study-api/.venv/bin/python \
  node handoffs/swarm-v2/S18/proof/browser.mjs
```

Keep the product SHA and all relevant source bytes fixed during the build and
proof. Private synthetic state and tokens stay outside the delivered evidence.
The browser runner owns port5419 and its server processes; it stops them in its
own cleanup. It does not alter other streams or application permissions.

## S00 continuation

1. Review the three actual mounts and this proof conversion, then compose with
   #313 and #323 on the final main candidate. Keep one installer and the exact
   typed readers; do not reapply historical patches.
2. Execute the24group browser journey on the combined product, including native
   refresh/restart, revocation, two document versions and student notebook.
3. Record the result of exact-head CI, merge/post-merge and protected release.
   Keep the still-missing canonical lesson/version/phase binding separate from
   S18's declared `lessonId`/`activityId` annotation association.

S00 integration note: raw logs are now losslessly gzip-compressed for the repository whitespace gate. The manifest retains their original byte counts and SHA-256 hashes; no test output or conclusion was edited.
