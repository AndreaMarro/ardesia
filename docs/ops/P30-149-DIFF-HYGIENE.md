# P30 PR #149 — Diff Hygiene

Merge gate for PR #149 (adopt dormant simulation substrate). 191 files vs `origin/main`.

## Classification

| Class | Count | Keep/Remove | Reason | Evidence |
|---|---|---|---|---|
| SOURCE (`apps/studio/src`) | 85 | KEEP | real source | — |
| SIM_SOURCE (`apps/studio/sim`) | 21 | KEEP | real solver/scene source | — |
| E2E (`apps/studio/e2e`) | 8 | KEEP | real specs | — |
| DOCS_OPS (`docs/ops`) | 23 | KEEP | P29/P30 session docs + this report | — |
| DOCS (`docs/`) | 8 | KEEP | architecture/product specs | — |
| PACK (`packs/`) | 2 | KEEP | elab-tutor pack data | — |
| OTHER | 2 | KEEP | `.impeccable.md` (design-context doc), `apps/studio/plugins/simulation/manifest.ts` (source) | — |
| **GENERATED (`output/playwright/**`)** | **42** | **REMOVE** | playwright evidence dumps (png/json/.lesson), regenerated at runtime | test writes them |

## Generated-artifact decision
- `output/playwright/**` is a **runtime output/evidence directory**, not a fixture.
- `apps/studio/e2e/plugin-postit-room-reload.spec.ts:228` does `await mkdir(EVIDENCE_DIR, { recursive: true })` before writing → dir is regenerated on demand.
- **No test reads** committed `output/playwright` files (write-only). Removal is safe.
- Not stable fixtures → not moved to `e2e/fixtures/`; simply excluded.

## Patch applied (commit `7fd97794`)
- `git rm -r output/playwright` → 42 files removed (−2081 lines).
- `.gitignore` += `output/playwright/`, `test-results/`, `playwright-report/`.

## Post-hygiene verification
- Tree clean; `output/playwright/` now git-ignored (`.gitignore:16`); recreated at runtime by the reload spec but no longer tracked.
- typecheck=0 · build=0 · targeted 57/57 · e2e 4 passed (incl. `plugin-postit-room-reload`).
- Repair cycles used: **0** (hygiene patch caused no breakage).
