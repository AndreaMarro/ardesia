---
id: ATOM-S8-A5
sprint: S-iter-8
priority: P0
owner: gen-test-opus
phase: 1
deps: []
created: 2026-04-27
---

## Task
Execute Playwright Vision E2E spec `tests/e2e/02-vision-flow.spec.js` (iter 6 ready 262 LOC) on production. Measure latency p95 + topology accuracy + diagnosis accuracy across 20 circuit screenshots.

## Acceptance criteria
- [ ] CoV vitest 12599+ PASS preserved (read-only verify, no src/ changes)
- [ ] build PASS exit 0 (defer if heavy)
- [ ] file ownership respected — write ONLY `tests/fixtures/circuits/{1..20}.png` + `playwright-report/` + `automa/team-state/messages/gen-test-*.md`
- [ ] 20 fixture circuit screenshots (5 corretti + 5 errore comune + 5 complessi + 5 edge-case) populated `tests/fixtures/circuits/`
- [ ] Run `npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=html,json` against `https://www.elabtutor.school`
- [ ] Measure latency p95 (target <8s end-to-end Gemini Vision + UNLIM response)
- [ ] Measure topology accuracy (target ≥80%, componenti identificati correttamente)
- [ ] Measure diagnosis accuracy (target ≥75%, errori reali rilevati no falsi positivi >15%)
- [ ] Measure hallucination rate (target ≤5%)
- [ ] Output `playwright-report/` HTML + `test-results.json` JSON
- [ ] Score-style report `scripts/bench/output/vision-e2e-{ts}.md` summary
- [ ] PRINCIPIO ZERO + MORFISMO compliance: vision response cites Vol/pag, plurale "Ragazzi,", ≤60 parole

## Output files
- `tests/fixtures/circuits/01.png` ... `20.png` (NEW, 20 screenshots)
- `playwright-report/` (NEW, generated)
- `test-results.json` (NEW, generated)
- `scripts/bench/output/vision-e2e-2026-04-27-<HHMMSS>.md` (NEW summary)
- `automa/team-state/messages/gen-test-opus-iter8-to-orchestrator-2026-04-27-<HHMMSS>.md` (completion)

## Done when
20 fixtures present, Playwright run completed exit 0 OR fail with measurements, latency+accuracy measurements logged, completion msg emitted.
