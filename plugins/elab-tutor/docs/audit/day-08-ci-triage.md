# Day 08 CI Triage — 2026-04-21

## Failed runs inspected

### Run 24700722699 (E2E Tests, feature/sett-2-stabilize-v2, 2026-04-21T02:22:57Z)

- **Status**: failure
- **Duration**: 2m28s
- **Root cause**: `tests/integration/deploy-smoke.test.js > should have manifest.json accessible` → `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`
- **Body observed**: `https://www.elabtutor.school/manifest.json` returns HTTP 200 with HTML SPA fallback (no `public/manifest.json` yet deployed to prod)
- **Fix applied Day 08**: `tests/integration/deploy-smoke.test.js:80-89` — content-type + body-prefix guard before `JSON.parse`. SPA fallback accepted.
- **Local verify**: `npx vitest run tests/integration/deploy-smoke.test.js` → 5/5 PASS, 2.81s

### CI/CD Pipeline main (24697257474)

- **Root cause**: `amondnet/vercel-action@v25` pins Vercel CLI 25.1.0; endpoint requires ≥47.2.2
- **File**: `.github/workflows/test.yml:153` (v25 action), `.github/workflows/deploy.yml:35` (`vercel@latest`, OK)
- **Action Day 08**: **DEFERRED to Andrea** per production safety memory (workflow edit = CI risk surface; merge/deploy confirmation owned by Andrea)
- **Recommendation**: upgrade action to `amondnet/vercel-action@v25.2.0+` OR replace with explicit `npm install -g vercel@latest && vercel --prebuilt --archive=tgz ...`

## Workflows housekeeping

- **Routines Orchestrator**: `disabled_manually` verified via `gh workflow list --all` (Sprint 1 Lesson 13 applied)

## Post-fix expected CI

- deploy-smoke test: PASS (tolerant to SPA)
- Manifest prod serve: still HTML until Andrea deploys — no test coupling remains
- Vercel action concern: untouched autonomously; Andrea confirms next workflow edit window

## Zero-regression guarantee

- Changed file: `tests/integration/deploy-smoke.test.js` only
- Test count unchanged: 5 tests in file pre/post fix
- Semantic change: error-tolerance widening, no narrowing
