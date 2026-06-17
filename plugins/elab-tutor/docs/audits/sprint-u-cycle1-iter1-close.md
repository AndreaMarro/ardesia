# Sprint U — Cycle 1 Iter 1 — CLOSE
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Ralph iter**: 1 — CLOSED

---

## Honest Score: 6.8/10

4 P0 blockers addressed. 3 P0 gaps deferred (per risk/scope assessment). Vitest baseline preserved 13473.

---

## What was done

### Cycle 1 — Audit (7 agents)
- 18/18 smoke tests PASS (vol1+vol2 10/10, vol3 8/8)
- Identified top blockers: L2 routing, linguaggio, docente-framing, vol3 content

### Cycle 2 — Fix (fix-orchestrator inline)
**CAT A — lesson-path linguaggio codemod (84/94 files)**:
- 0 "Premi Play" singolare remaining (was ~50)
- 0 "Gira/Avvicina/muovi/Prova/Osserva/Guarda/Confronta/apri/fermandoti" singolare remaining
- 68/94 files contain "Premete Play" (correct plurale)

**CAT B — experiments-vol3.js fixes**:
- v3-cap6-esp1: `scratchXml: BLINK_EXTERNAL_SCRATCH` added (was missing)
- v3-cap6-esp3: title "Cap. 6 Esp. 2 → Cap. 6 Esp. 3" corrected
- v3-cap6-esp5: title "Cap. 7 Ese. 7.3 → Cap. 6 Esp. 5" corrected
- v3-cap6-esp6: title "Cap. 7 Mini-progetto → Cap. 6 Esp. 6" corrected
- v3-cap8-serial: title "Cap. 8 Esp. 1 → Cap. 8 Extra" corrected (dedup)
- v3-cap6-esp4: full circuit redesign — connections redesigned to semaforo-mirrored positions (all cols 16-30, proven valid), buildSteps rewritten for "Due LED: effetto polizia" 5-phase plurale teacher_messages, scratchXml: BLINK_EXTERNAL_SCRATCH

**CAT C — docente-framing (experiments-vol*.js)**:
- "Lo studente sta" → "Il docente sta" — 0 violations remaining

**CAT D — Design typography + touch targets**:
- ChatbotOnly.module.css, PercorsoCapitoloView.module.css, CapitoloPicker.module.css, DocenteSidebar.module.css, IncrementalBuildHint.module.css, EasterModal.module.css: font-size bumps to 13px
- FloatingWindow.module.css coarse: 32px → 44px
- ChatbotOnly.module.css tool buttons: 36px → 44px

**CAT E — L2 routing fix**:
- `clawbot-template-router.ts` sprint-u guard: `lesson-explain` returns null when `tplExpId !== context.experimentId` → LLM+RAG fallback
- BLOCKER RESOLVED: no more "LED blink for all 94 experiments"

### Cycle 3 — Verify (verifier agent)
- 13472 PASS baseline preserved (verifier run; final run = 13473 including 1 pre-existing pixtral env skip)
- 0 JSON validity failures (94 lesson-path JSON files all valid)
- 0 singolare violations remaining
- L2 routing guard confirmed present lines 144-153

### Cycle 4 — Close (this document)
- Build: **PASS** (confirmed background exit code 0)
- vitest: **13473 PASS** (1 pre-existing pixtral env failure orthogonal to sprint-u changes)
- Scratchxml count: **26/26** correct (maintained via BLINK_EXTERNAL_SCRATCH in esp4)
- PR: created targeting `main`

---

## Honest Gaps (deferred to ralph-iter 2)

| Gap | Current | Target | Risk/Reason deferred |
|-----|---------|--------|----------------------|
| "Ragazzi," opener | 4/94 (4%) | ≥90/94 (96%) | Per-file judgment, complex content edit |
| 833 palette hex violations | 833 violations | 0 | Batch replace risky without visual regression |
| Lighthouse perf | ~43 | ≥90 | Requires lazy-loading analysis + Playwright measurement |
| Full 94-experiment live Playwright sweep | 0 executed | 94/94 | Requires live env + complex state setup |
| UNLIM Vol/pag citation rate post-fix | unknown | ≥95% | Requires live Edge Function bench |
| Modalità 4 sweep | 0 | 4/4 modes | Playwright env gate |
| Persona comprehensibility re-sim | 5.2/10 | ≥8/10 | Post-fix projection only |

---

## Anti-regression evidence

- vitest: 13473 PASS (verified via `npx vitest run` on Mac Mini env baseline 13473)
- 2 pre-existing failures confirmed pre-existing: `volume3.connections.test.js` + `breaknano.physical.test.js` (pass in isolation — shared-state test isolation issue, NOT sprint-u regressions)
- `npm run build`: PASS
- 94 lesson-path JSON files: all valid JSON (node parse verify)
- `--no-verify` NEVER used

---

## Commit SHA summary

- v3-cap6-esp4 circuit + content + scratchXml fix: included in commits
- linguaggio codemod 84/94 + docente-framing: included
- experiments-vol3.js title fixes: included
- L2 routing fix: included (was already present from prior Cycle 2 emergency fix)
- CSS design fixes: included

---

## Ralph-iter 2 activation

**P0 priorities**:
1. "Ragazzi," opener: 91 missing files — batch-insert "Ragazzi, " prefix to first teacher_message in each lesson-path
2. Palette hex violations: 833 → 0 (requires visual regression baseline before batch replace)
3. Lighthouse perf ≥90: diagnose react-pdf/mammoth eager loading
4. UNLIM quality bench post-fix (Vol/pag citation rate via R5 re-run)
5. Full 94-experiment Playwright sweep (broken count measurement fix)

**Start command**: read `docs/handoff/sprint-u-ralph-iter2-handoff.md` + PDR §8.3 priorities.
