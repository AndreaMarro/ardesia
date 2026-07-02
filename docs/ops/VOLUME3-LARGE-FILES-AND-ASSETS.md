# VOLUME 3 - Large Files And Assets

## Policy
File >20MB do not enter ordinary Git without explicit approval. Prefer Drive/private storage, release artifacts, regeneration from scripts, or Git LFS only after a human decision.

## Sintesi
Totale file >20MB: 109. The raw list stayed local under `/tmp`; this committed policy intentionally uses aggregated categories to avoid publishing unnecessary local media, archive, or corpus paths.

Top directory:
- `PRODOTTO`: 53
- `ELAB - TRES JOLIE`: 18
- `ARCHIVIO`: 15
- `CONTENUTI`: 8
- `ardesia`: 5
- `.stversions`: 3
- `VOLUMI pdf e MD`: 2
- `elab-builder`: 2
- root-level archive/PDF/ingest files: 3

## Asset classes
| Class | Count signal | Put in Git? | Alternative | Reason |
|---|---:|---|---|---|
| ELAB product manuals/PDF volumes | many repeated copies in `PRODOTTO`, plugin, and content folders | No | Drive/private storage; sanitized references only | Copyright/license and repository weight risk. |
| `dist-test`, `public/volumes`, Vercel/static output | repeated across ELAB worktrees | No | Regenerate from source or store private release artifact | Generated output and duplicate lineage. |
| Deploy/export archives | present in deprecated archive/project folders | No | Private archive or GitHub release only after review | Generated deploy artifacts can contain stale config and make Git unusable. |
| Media/video/audio/photo raw assets | present under ELAB/content folders | No | Drive/private storage; optimized derivative only after license review | Potential personal/copyright material and high binary weight. |
| PSD/design originals | present in ELAB design folders | No | Design storage or LFS only after decision | Large binary source assets need ownership/licensing decision. |
| Datasets/model/corpus files | present in ELAB/agent worktrees and root archives | No | Private storage; tiny sanitized fixture if needed | Possible corpus/student/product data. |
| Virtualenv/native dependency blobs | present under `.venv`/package caches | No | Ignore and reinstall from lockfiles | Dependency artifacts are reproducible cache. |
| Local index/cache blobs | present under tool caches | No | Ignore; regenerate locally | Machine-local cache, not source. |

## Git LFS rule
Git LFS is not a default escape hatch. Use it only when all are true:
- Andrea explicitly approves the asset class.
- The file is licensed for repository storage.
- A small generated/optimized alternative is insufficient.
- The PR documents why the asset cannot live in Drive/private storage.

## Import rule
Do not import raw assets as part of a docs inventory PR. Future PRs may add only:
- a manifest with counts/categories;
- sanitized thumbnails or fixtures under a strict size cap;
- scripts that regenerate outputs from approved sources;
- links or references to private storage, if access policy is clear.

## COV
- Path scanned: `/Users/andreamarro/VOLUME 3`
- Repos found: 19
- Dirs mapped: 265
- Files mapped at maxdepth 4: 18962
- Important-file candidates: 123601
- Large files >20MB: 109
- Sensitive filename matches: 1090
- Sensitive content path matches, redacted/path-only: 13045
- Keyword hits, bounded/path+line file only: 1159634
- Raw scan artifacts stayed local under `/tmp`; raw path lists were not committed.
- Interrupted scans: two overly broad Python content scans were stopped by this agent; no runtime/service process was killed.
