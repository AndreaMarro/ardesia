# Handoff iter 62 → iter 63

> 2026-05-15. Sprint U Cycle 2 iter 62 close → iter 63 entrance.
> Branch: `feat/iter-41-sprint-u-cycle-2-real-user-fix`.
> Score iter 62 close: **8.7/10 ONESTO G45 cap** (raw 9.0 capped).

## 1. Activation string iter 63 (paste-ready)

```
Continua ELAB Tutor iter 63. Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder, branch feat/iter-41-sprint-u-cycle-2-real-user-fix, HEAD <post-iter-62-commit-sha>.

§1 STATE PRIMING
- Vitest baseline canonical: 13209 (13197 base iter 61 + 12 sprint-u-linguaggio-codemod iter 62 B1.5).
- automa/baseline-tests.txt 13106 STILL STALE -103 vs canonical (iter 63 separate sync commit P0.8).
- Build PASS exit 0 iter 62 close.
- Validator: 94/94 · 0 unresolved · 0 cyclic.
- 8 lesson-paths Vol1 transformed iter 62 B1.5 (10 violations → 0 teacher_message + teacher_response PLURALE imperativo STRICT case-sensitive mode).
- iter 61 77 lesson-paths teacher_tip transformed PRESERVED iter 62 (Codex CONFIRM no regression).
- Vercel preview NOT redeployed iter 62 (Andrea trigger se richiede).

§2 ITER 62 DELIVERED
B1.5 P0 PRIMARIO Andrea iter 21+ mandate carryover RESOLVED:
- scripts/sprint-u/linguaggio-codemod.mjs (+35 -10): transformLessonPath extends to teacher_message + common_mistakes[].teacher_response with STRICT { caseInsensitive: false } opts
- tests/unit/sprint-u-linguaggio-codemod.test.js (+130 -22): 12 NEW iter 62 tests, 91/91 PASS (79 iter 61 + 12 NEW)
- 8 file Vol1 modified (+9 -9 lines, 10 changes total)
- Codex Pattern C-V aggregate verify CONFIRM: 10/10 transforms safe, NO teacher_tip touched

§3 HONESTY DELTA iter 62 surfaced
- PDR/activation §4 claimed "91 viol cross-volume teacher_messages" → reality **10 viol Vol1 only** (teacher_message + teacher_response).
- Field name actual: teacher_message (singular) + teacher_response (nested in common_mistakes[]). Plural "teacher_messages" doesn't exist in schema.
- Vol2 + Vol3 = ZERO violations.
- All 395 teacher_message entries already have "Ragazzi," opener (0 missing).
- Initial naive extension `gi` flag yielded 54 viol / 33 file mostly FALSE POSITIVES (devastating: "dai tre trattini" → "date tre trattini"). STRICT case-sensitive pivot resolved to exact verified count 10/8.

§4 ITER 63 PRIORITIES P0
- P0.1 Andrea ratify queue 10 voci dismissed iter 62: A4.1e (3 sub-voci v3-cap9 + pages 57+58 + titles align Vol3) + Q4-Q7 Phase 2-3 Blockly UX + Q2 SSH PREREQ + Q3.5 nanor4 3rd FQBN + verb-map-v2 expand
- P0.2 Full vitest 13209 verify + npm run build PASS verify post iter 62 commit (pre-commit hook gate)
- P0.3 Sync automa/baseline-tests.txt 13106 → 13209 separate commit chore(iter-63)
- P0.4 verb-map-v2 expand IF Andrea ratify (~+30-50 viol estimate ripeti/segna/gira/conta/leggi/scrivi/ascolta/calcola/aspetta) — STRICT mode mandatory new fields
- P0.5 B2 92 esperimenti Playwright UNO PER UNO entry 5-10 esp (skill elab-harness-real-runner) — Andrea iter 21+ mandate Sprint T close gate
- P0.6 B3 HomePage test guard 4 DOM-text + Playwright toHaveScreenshot baseline (anti-regression iter 41 PM)
- P0.7 Q2 SSH PREREQ ratify → Phase 1 R1-R6 execute Blockly cross-compile (~6-8h post-ratify)

§5 ANTI-REGRESSIONE FERREO 4-gate
vitest 13209 PRESERVED + npm run build exit 0 + validator 94/94 + Codex CONFIRM. MAI --no-verify push main git stash add -A. Re-baseline SOLO arithmetic proof.

§6 CODEX PATTERN C-V mandate
Template 4-element single-line per claim. scripts/dev/codex-prompts/verify-linguaggio-codemod.txt iter 61 NEW (reused iter 62). Pattern C-V default OGNI commit. Stdin pipe pattern (NOT $(cat) which can stuck).

§7 ANTI-PATTERN NON FARE
git add -A / --no-verify / git stash with loop / push main / Codex 1-line / BRE \| / heredoc Codex / no SKILL.md guard / /ultrareview Claude-launch / claim senza Codex C-V / score inflation / numeri inventati.

§8 NON COMPIACERE
Score iter 63 target 9.0/10 ONESTO G45 cap. NO claim Phase 1 LIVE senza R6 PASS + Codex C-V CONFIRM. Workstream B multi-iter completion (B2+B3 iter 64+).

§9 DELIVERABLES iter 63 close (~4-6 PR)
1 PR verb-map-v2 carryover (IF ratify) / 1 PR B2 92 esperimenti entry / 1 PR B3 HomePage guard / 1 PR Phase 1 R1-R6 Blockly post-Q2 SSH ratify / 1 PR baseline sync chore / 1 PR iter 63 close audit + handoff iter 64.
```

## 2. Setup steps Andrea iter 63 entrance (~5-10 min)

1. **Verify iter 62 commit applied origin**: `git log --oneline -5` → expect `feat(iter-62-B1.5)` head + handoff commit
2. **Verify vitest baseline**: `cat .test-count-baseline.json` → `total: 13209` expected (was 13197)
3. **Run vitest full**: `npx vitest run` → 13209 PASS (subset confirmed iter 62 close)
4. **Run build verify**: `npm run build` → exit 0 (heavy ~14min)
5. **Andrea ratify queue 10 voci** dismissed iter 62 (A4.1e + Q4-Q7 + Q2 SSH + Q3.5 + verb-map-v2)

## 3. Files refs iter 62 close

- Codemod script: `scripts/sprint-u/linguaggio-codemod.mjs` (modified +35 -10)
- Tests: `tests/unit/sprint-u-linguaggio-codemod.test.js` (modified +130 -22, 91/91 PASS)
- 8 lesson-paths Vol1: `src/data/lesson-paths/v1-cap{6,7,10,11}-*.json` (10 changes / +9 -9)
- Codex template: `scripts/dev/codex-prompts/verify-linguaggio-codemod.txt` (reused iter 61)
- Close audit: `docs/audits/2026-05-15-iter-62-CLOSE-audit.md`
- This handoff: `docs/handoff/2026-05-15-iter-62-to-iter-63-handoff.md`

## 4. Anti-regression 4-gate FERREO iter 62 close status

| Gate | Status iter 62 close |
|---|---|
| vitest 13197 PRESERVED + 12 new = 13209 | ✓ **13209 PASS** | 327 Test Files PASS | Duration 446.46s |
| npm run build exit 0 | ✓ Exit 0 | 4m53s | 26 precache 1236.27 KiB |
| validator 94/94 PASS · 0 unresolved · 0 cyclic | ✓ |
| Codex Pattern C-V CONFIRM | ✓ aggregate verify 8 affected file: 10/10 safe, NO teacher_tip touched, NO false positives |

## 5. Iter 63 score target

8.7 → **9.0/10 ONESTO G45 cap** conditional:
- verb-map-v2 carryover catch +30-50 viol → +0.1 (IF ratify)
- B2 92 esperimenti entry 5-10 esp Codex C-V → +0.2
- B3 HomePage guard ship + execution Playwright → +0.1
- Phase 1 R1-R6 Blockly cross-compile post Q2 SSH PREREQ → +0.2

NO claim 9.0 senza Opus indipendente review G45 mandate.

## 6. Honest gaps iter 62 → iter 63 carryover

1. **Build verification BG completion gate iter 63 entrance** (mid-run at audit write).
2. **STRICT case-sensitive scope teacher_message + teacher_response**: catches TitleCase imperatives ONLY (sentence-start common). Lowercase mid-sentence imperatives NOT transformed (rare in real corpus per scope-report). Future iter (verb-map-v2 expand OR NLP/POS-tagger) could broaden carefully.
3. **PDR/activation 91 viol claim refute**: actual 10 viol Vol1 only. Sprint U Cycle 1 audit doc may need re-audit to identify what 91 referenced.
4. **A4.1e carryover iter 58 (3 voci v3-cap9 + pages + titles)** dismissed iter 62. Defer iter 63+ ratify or Sprint V Vol3 narrative refactor (Davide co-author).
5. **Q4-Q7 Blockly Phase 2 UX overhaul** dismissed iter 62. Defer iter 66+ post pilot Q8.
6. **Q2 SSH PREREQ + Q3.5 nanor4** dismissed iter 62. Defer iter 63+ Andrea ratify.
7. **verb-map-v2 expand (~30-50 viol estimate)** dismissed iter 62. Defer iter 63+ ratify additional verbs.
8. **`automa/baseline-tests.txt` 13106 → 13209 expected**: sync separate commit P0.3 iter 63.
9. **`AGENTS.md + automa/state/*` 4 file uncommitted carryover** (pre-iter-61, NOT iter 62 scope) — decide commit/discard iter 63 entrance.
10. **B2 92 esperimenti Playwright UNO PER UNO audit + B3 HomePage test guard** carryover iter 60 P0 PRIMARIO — NOT addressed iter 62 (single-iter scope multi-iter expected).

## 7. Cross-link

- Iter 61 close: `docs/audits/2026-05-15-iter-61-CLOSE-audit.md` (score 8.5/10)
- Iter 60 ultrathink brief: `docs/audits/2026-05-15-iter-60-ultrathink-brief.md`
- Sprint U Cycle 1 audit: `docs/audits/sprint-u-cycle1-iter1-CONSOLIDATED-audit.md`
- Andrea mandate iter 21+: `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/feedback_iter21_mandate_critical.md`
- ADR-019 Sense 1.5 Morfismo runtime: `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md`

## NON COMPIACERE iter 63

- Score iter 63 target 9.0/10 ONESTO G45 cap. NO claim 9.0+ senza Opus indipendente re-review.
- Codex C-V mandate iter 63+ STRICT per-file per Q-CODEMOD-3=a (if verb-map-v2 carryover or B2 92 esp).
- Pre-commit hook NEVER bypass `--no-verify`. Pre-push hook NEVER bypass.
- Anti-regression 4-gate FERREO ZERO compromise.
- `/ultrareview` Andrea trigger ONLY.
- Honesty delta surface ALWAYS upfront BEFORE apply (iter 62 pattern: PDR 91 vs reality 10 surfaced + ratified).
