# VOLUME 3 - Do Not Commit

## Regola
Non committare path sensibili o dati locali grezzi. Questo file registra categorie, conteggi e directory ad alto rischio senza valori segreti e senza elenchi lunghi di file locali.

## Sensitive filename scan
Match totali: 1090.

Top directory:
- `repos-research`: 684
- `PRODOTTO`: 270
- `ardesia-api-vercel`: 45
- `ardesia`: 37
- `ARCHIVIO`: 28
- `elab-builder`: 11
- `.stversions`: 8
- `.venv`: 5
- `SETUP-NEXT-SESSION`: 1
- `ardesia-workspace`: 1

Pattern da bloccare sempre:
- `.env`, `.env.*`, `.vercel/.env*`
- filenames containing `secret`, `token`, `credential`, `password`, or provider key names
- `*.pem`, `*.p12`, `*.key`
- virtualenv/vendor certificate or tokenizer artifacts when found under local env/cache paths

Directory policy:
| Prefix | Decision | Reason |
|---|---|---|
| `PRODOTTO/` | sanitize before any import | Product lineage contains env files, build outputs, manuals, datasets, and many duplicated worktrees. |
| `ARCHIVIO/` | do not commit | Deprecated deploys and archives may contain credentials, generated zips, or stale production material. |
| `repos-research/` | license review only | Third-party repos are references; do not vendor code or config without review. |
| `.stversions/` | do not commit | Local version snapshots, stale copies, and generated artifacts. |
| `.venv/`, `venv/`, `node_modules/` | do not commit | Dependency cache/vendor output. |
| `ardesia-api-vercel/` | sanitize before import | Deployment surface may contain Vercel/env config. |
| `ardesia/` dirty local worktree | review path by path | Some files are canonical docs, others are local/untracked work. |

## Sensitive content scan redatto
Match path-only: 13045. Pattern classes: provider key/token/secret/password, generic secret assignment, private key marker. Values were not recorded in this document.

Top directory:
- `PRODOTTO`: 10532
- `repos-research`: 902
- `ardesia`: 689
- `elab-builder`: 637
- `ARCHIVIO`: 177
- `SESSIONI`: 18
- `ardesia-vault-local`: 15
- `ardesia-api-vercel`: 14
- `unlim-intelligente`: 14
- `SETUP-NEXT-SESSION`: 10
- `docs`: 8
- `workflowxxx`: 7

Review rule:
- A path match is not proof of a real secret, but it blocks automatic import.
- Never copy matched files directly into GitHub.
- First inspect locally, redact values, replace real env/config with examples, then rerun a secret scan on the patch.
- Commit only the sanitized derivative, not the source file.

## Classi vietate
- `.env`, `.env.*`, `.vercel/.env*`, credentials, private keys, tokens, passwords.
- Local databases, caches, long logs, raw AgentMemory dumps, runtime snapshots.
- Personal data, student data, real corpora, and unauthorized teaching material.
- Covered PDF/books/manuals, raw media/audio/video/photos, PSD files, large archives.
- `node_modules`, virtualenv, build output, `dist-test`, `.stversions`, deploy zip files.

## Azione richiesta
- `ignore`: cache, build, virtualenv, dumps, logs, deploy zips.
- `sanitize`: operational docs with provider names, credentials language, or sensitive command examples.
- `private storage`: manuals, photos, videos, audio, PSD, datasets/corpora.
- `license review`: PDF/books/manuals, third-party repos, design assets.
- `human OK`: every file >20MB, every student/personal-data file, every real ELAB asset.

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
