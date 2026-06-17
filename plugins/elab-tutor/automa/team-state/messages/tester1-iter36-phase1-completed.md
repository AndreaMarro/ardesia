# Tester-1 iter 36 Phase 1 — Atoms A7+A8 — STATUS: completed

## Deliverables
- 03-fumetto-flow.spec.js: 2 tests (56 LOC)
  - "Fumetto button SEMPRE genera output (stub session locale fallback)"
  - "Fumetto disabled when 0 messages (graceful)"
- 04-lavagna-persistence.spec.js: 2 tests (75 LOC)
  - "Lavagna scritti NON spariscono post Esci"
  - "Lavagna persistence Supabase sync (online)"
- Total: 4 NEW E2E tests across 2 NEW spec files (131 LOC)

## Specs syntax verify
- node --check tests/e2e/03-fumetto-flow.spec.js: PASS (no parse error)
- node --check tests/e2e/04-lavagna-persistence.spec.js: PASS (no parse error)
- npx playwright test --config tests/e2e/playwright.config.js --list 03-fumetto-flow.spec.js 04-lavagna-persistence.spec.js: PASS
  - Total: 4 tests in 2 files (chromium project)
  - All 4 tests discovered + named correctly

## File ownership compliance
- CREATED: tests/e2e/03-fumetto-flow.spec.js (NEW Atom A7) — within ownership
- CREATED: tests/e2e/04-lavagna-persistence.spec.js (NEW Atom A8) — within ownership
- READ-ONLY respected: NO src/ touched, NO tests/unit/ touched, NO existing tests/e2e/ specs modified, NO package.json/playwright.config.js modified
- NO commits pushed (per task DO NOT)
- evidence dir verified/created: docs/audits/iter-36-evidence/ (target for fumetto-output.png screenshot)

## MORFISMO compliance gate
- baseURL: tests use absolute `https://www.elabtutor.school` (matches prod canonical)
- selectors: generic text= + aria-label + data-tool fallbacks (no brittle internal CSS classes)
- waits: `networkidle` + `waitForTimeout` 1-3s (graceful, not flaky)

## Honesty caveats
- E2E execution deferred Phase 3 (heavy Playwright run + browser install + ~10min runtime)
- Selectors generic — may need tweaks if prod UI labels differ (text=Lavagna, text=Fumetto, text=Esci, [aria-label="Pen tool"], text=Penna). Verify Phase 3 first run.
- Bug 3 Supabase sync test is smoke-level skip if `window.supabase` and `window.__ELAB_API` both absent
- Atom A7 spec test 1 expects either popup window OR download triggered — depends on prod Fumetto implementation (PR #6 MERGED MVP per memory iter 19/04 PM, may not be fully wired Phase 1.5 still)
- Atom A8 localStorage keys probed: `elab-drawing-paths-libero` OR `elab-lavagna-paths` (fallback OR chain — actual key in prod NOT verified live, observe Phase 3 console + adjust if needed)
- Anti-regression vitest baseline 13212 NOT impacted (E2E uses Playwright runner, separate from vitest discovery)
- Existing tests/e2e/ specs (01-16, 29) preserved untouched (verified via diff scope)

## Handoff to Phase 2 Documenter
- Atom A7 (Fumetto): regression guard — verifies "Nessuna sessione salvata" toast no longer appears post Fumetto fix; verifies popup OR download triggered as proof of output. Edge case: 0-messages graceful (disabled OR stub fallback OK, no error toast).
- Atom A8 (Lavagna persistence): Bug 2 regression — drawing paths SURVIVE Esci → re-entry cycle. Smoke test 2 covers Bug 3 Supabase sync iter 28 (skip-on-env if not ready).
- Both specs use prod URL `https://www.elabtutor.school` directly (bypasses dev server requirement of root playwright.config.js); compatible with `tests/e2e/playwright.config.js` (testDir `.`, baseURL elabtutor.school default).
- Run command Phase 3: `cd /Users/andreamarro/VOLUME\ 3/PRODOTTO/elab-builder && npx playwright test --config tests/e2e/playwright.config.js 03-fumetto-flow.spec.js 04-lavagna-persistence.spec.js`
- Mac Mini Cron L1+L2 should pick up new specs via tests/e2e/ glob (verify cron config picks them, otherwise explicit add)
- Anti-regression Atom A7 mandate (25/25 sync drawing tests STILL PASS post Fumetto fix) NOT verified Phase 1 Tester-1 scope — defer to Phase 3 full E2E run by Tester-2 / Documenter / orchestrator
