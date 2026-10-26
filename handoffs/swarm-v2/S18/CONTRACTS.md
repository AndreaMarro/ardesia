# S18 contracts for S03 / S17 / S20 / S00

All entry descriptors consume `{resourceId, revisionId, contextId?}`. The server resolves canonical `contextId`; a caller value never grants access. `LivingSourceReader` also receives `kind: living-source|living-annotation` and the existing `StudyMe`. No latest-version fallback.

Canonical saved target:
```
{ resourceId, revisionId, contextId, documentSha256,
  page: 1, rects: [[x,y,width,height]],
  text: null | {model:"native-pdfjs-items-concat-utf16-v1",start,end,exact,prefix,suffix} }
```

Pages are 1-based. Regions are normalized to the original **unrotated CropBox**, top-left, convention `pdf-normalized-unrotated-top-left-v1`; display conversion uses actual PDF.js viewport (rotation/userUnit). Text offsets are UTF-16 code units into PDF.js native text items' `str` concatenation, without inserted separators. Quote plus prefix/suffix are checked on reopening; mismatch is reported and never guessed/re-anchored. No OCR has run. These selectors locate content; they do not establish scientific understanding or correctness.

`livingSourceLink(ref,kind,editionId,lesson?)` returns a same-origin Materials URL. `readLivingRoute` parses it; Core reauthorizes its claims. `lesson={lessonId,activityId}` is a declared association to the consumer's actual activity, not a new activity/publication authority. `onUse` returns the canonical annotation resource reference for existing submission `sourceRefs`; `onSaved` returns the saved resource. S20 can open the supplied `LivingSourceReader` directly from an activity. S17 preserves its own page/journal/media authority; attach this descriptor as an exact source reference, not as a replacement scene/page ID.

Private note = existing StudyResource with kind `living-annotation`, owner/edition/revision/visibility from Core. Teacher can explicitly share an annotation only when source is shared. A student's personal note and notebook remain private. The notebook button copies authorized immutable PDF bytes through existing `uploadOriginal` and `scientific-notebooks`, preserves the content SHA/page/region and records the exact source citation in the notebook note; it opens the real NotebookEditor. This is an explicit student's private copy, not permission to the teacher's asset endpoint.

Source JSON is not an asset grant. The Core reader checks the authorized exact resource revision, authoritative resource owner/edition against immutable asset owner/edition, actual stored byte length/hash and MIME. Existing GET/assets policy stays unchanged. No owner impersonation, public URLs, client ACL, new DB or ledger. Current membership and deletion checks precede receipt replay.

Export carries exact source/annotation revisions plus original bytes. Import validates byte hash and selectors, creates private Core copies under the current actor and preserves original source/annotation references under `origin`. Imported provenance is an unsigned claim, not canonical authorship or inherited permission. Local export is explicit disclosure; no physical revocation of an already downloaded file is claimed.

Composition seams: Materials (#313/#317), SourceViewer (#309/#315 + S06 structured-kind guards), and API factory belong to S00. Only the concrete Materials + API installer patches are supplied here; SourceViewer should dispatch the typed living-source/annotation reader rather than raw JSON. No dependency on unmerged implementation code from those PRs. Main/app integration and remote provider verification remain S00.

Transport detail: the portable JSON file includes original base64 for export. UI import first verifies it with the existing portable-PDF decoder, uploads the bytes through `/study/assets`, removes base64 from the command and supplies `original.assetId` in a small manifest. HTTP import refuses embedded base64. No shared body-admission limit or budget is enlarged. The importer checks that the supplied uploaded asset is owned by the current principal in the target edition and matches the exact document SHA.

Notebook detail: each selected region becomes a highlight. Complete canonical target (including text selector and version) plus the annotation reference are preserved in Unicode-safe citation chunks under the existing per-note limit; a separately labeled prose excerpt is bounded. The notebook's immutable source binding still identifies the exact PDF bytes. Retry identity fingerprints the copied state, so different notes on one PDF page do not collide.
