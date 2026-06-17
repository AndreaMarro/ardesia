# Retroactive Regression Scan — 20260505T195009Z

**Original HEAD**: `41da6f40c0c76f53a91fb0434f38c22b93459ff0`
**Original branch**: `fix/sprint-V-iter-1-homepage-restore-lavagna-fix`
**Scan depth**: last 15 commits

| commit | timestamp | homepage_cards | cronologia | modalita | lavagna_comp | toolspec | rag | wiki | lesson | vitest | edge | adr |
|--------|-----------|---------------:|-----------:|---------:|-------------:|---------:|----:|-----:|-------:|-------:|-----:|----:|
| `41da6f4` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `35b5173` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `dc15d85` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `9c8d4ab` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `0c66146` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `2a1b1d8` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `e1e6918` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `a0381c9` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `b349934` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `1d4572f` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `be352fa` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `71fd604` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `d448a6c` | 2026-05-05 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `cc85b61` | 2026-05-04 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |
| `e4f6846` | 2026-05-04 | 4 | 1 | 4 | 24 | 57 | 549 | 126 | 94 | 13474 | 11 | 17 |

## Drift detected

Nessun drift detected nei 15 commit scanned.

## Note

- Drift "homepage_cards drop" = commit più recente ha MENO card del precedente (regressione probabile).
- Lettura tabella: prima riga = HEAD (più recente), ultima riga = N commit fa (più vecchio).
- Per ogni regressione: `git show <commit>` per vedere diff + ratify Andrea revert necessità.
