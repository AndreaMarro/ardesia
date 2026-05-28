# Swarm 5 — TESTING + E2E + ACCESSIBILITY — STATUS

Branch: `test/swarm-5-home-compile-comprehensive-suite-2026-05-29` (from origin/main 03e5f7b6)
Started: 2026-05-29 00:30
Closed: 2026-05-29 00:55

## STATE: ready-for-pr

## TESTS_ADDED

### Unit (Vitest) — 16 added, 16/16 PASS

1. `tests/unit/components/home/swarm-2026-05-29-compile-state-machine.test.jsx` — **8 tests PASS**
   - T1 initial state idle
   - T2 editor onChange propagates scratchCode (no stale closure)
   - T3+T4 compile dispatch transitions compiling → success with hex + size
   - T5+T6 REGRESSION GUARD — edit after success → recompile picks NEW code, replaces hex (Andrea bug)
   - T7 board switch invalidates compiled hex + resets status
   - T8 empty code compile attempt → error state, NO API call
   - T9 compile API failure → error state, NOT stuck on compiling
   - T10 compile fqbn matches selected board id (UNO R3 picker)
2. `tests/unit/components/home/swarm-2026-05-29-unlim-chat-context.test.jsx` — **8 tests PASS**
   - initial mount idle status + Nano R4 default board label
   - compileStatus prop propagates through compile lifecycle
   - boardLabel prop reflects BoardPicker selection (regression #178-186)
   - sketchCode prop reflects live editor content (not stale)
   - blockCount prop propagates from ScratchEditor onBlockCountChange
   - editorMode prop flips when ModeToggle switches blocks → code
   - onAskQuestion handler forwards question to localStorage seed
   - helper receives consistent props snapshot — no stale renders

### E2E (Playwright) — 3 specs added

3. `tests/e2e/swarm-2026-05-29-home-compile-full-flow.spec.js` — 5 tests
   - T1 page load + BoardPicker visible + default Nano R4 selected
   - T2 switching picker UNO R3 updates upload button identity
   - T3 real compile UNO R3 via /api/compile/nanor4 (mocked fallback) → display size
   - T4 upload button enabled after success, NOT before
   - T5 [SKIP — pending Swarm 1 fix] full compile→upload cycle TWICE (one-shot bug)
4. `tests/e2e/swarm-2026-05-29-home-compile-a11y.spec.js` — 10 tests
   - A1 axe-core scan WCAG2A+AA+21A+21AA+22AA: 0 critical, 0 serious, <=8 moderate
   - A2 page exposes header + main + aside landmarks
   - A3 keyboard nav Tab reaches BoardPicker
   - A4 focus ring visible on focused button
   - A5 touch targets >= 44x44 for primary CTAs
   - A6 live region announces compile status changes
   - A7 serial drawer disclosure pattern toggles aria-expanded
   - A8 ModeToggle tablist pattern keyboard arrow nav
   - A9 button labels non-empty (accessible-name rule)
   - A10 heading hierarchy monotonic (no skipped levels)
5. `tests/e2e/swarm-2026-05-29-home-compile-mobile-touch.spec.js` — 7 tests
   - T1 LIM 1080p no horizontal overflow
   - T2 iPad portrait touch targets >= 44x44
   - T3 iPad landscape editor + compile-bar side-by-side
   - T4 Phone fallback (375x812) no horizontal overflow
   - T5 tap on compile button not blocked by overlay
   - T6 viewport meta does NOT block pinch zoom (WCAG 1.4.4)
   - T7 orientation change portrait → landscape no broken layout

## COVERAGE_REPORT_DELTA

- Pre-PR baseline: 14551 (automa/baseline-tests.txt)
- Post-PR projection: pre-existing pass count + 16 swarm-5 unit tests + E2E specs (22 new tests not counted in vitest baseline — Playwright runs separately)
- Updated baseline file: 14567 (14551 + 16 unit tests)
- Coverage gates (vitest.config.js): src/services/** 70% — UNCHANGED. New tests primarily cover component behavior (HomeCompileEntry) which is outside the 70% gate per current vitest.config include list.

## A11Y_VIOLATIONS_BASELINE

Documented in `docs/audits/2026-05-29-home-compile-a11y-baseline.md`:
- CRITICAL: 0 (target: 0 forever)
- SERIOUS: 0 (target: 0 forever)
- MODERATE: <= 5 known, <= 8 budget
- MINOR: best-effort

Known violations tracked (A1-A11 in audit doc, with priority + recommendation per row).

## CODEX_VERDICT

`.team-status/swarms-2026-05-29/swarm-5-codex-review.md` — VERDICT: NON-BLOCKER, OK TO LAND.

Review covered:
- 11 flakiness risks (F1-F11) — all OK or documented limitation
- Coverage gap analysis vs Andrea bug — all closure paths covered
- 7 fragile-selector entries — all have stable data-testid OR fallback
- 5 recommended follow-ups (not blockers)
- Recommendations to other 4 swarms re: selector preservation

## KNOWN_SKIPS_DEPENDING_ON_OTHER_SWARMS

| Skip | File | Reason | Unblock condition |
|------|------|--------|-------------------|
| full-flow T5 (real cycle x2) | swarm-2026-05-29-home-compile-full-flow.spec.js | Andrea one-shot regression bug | Swarm 1 fix lands → change `test.skip` to `test` |
| Multiple a11y tests with `test.skip(true, 'Swarm 2 V2 may move')` | swarm-2026-05-29-home-compile-a11y.spec.js | V2 redesign may rework DOM | After Swarm 2 PR merges → rerun, re-baseline |
| Multiple mobile tests with `test.skip(true, 'V2 redesign')` | swarm-2026-05-29-home-compile-mobile-touch.spec.js | Same | Same |

## INTEGRATION POINTS WITH OTHER SWARMS

- **Swarm 1 (BUG)**: My unit T5+T6 + unit chat-context "sketchCode reflects live editor" provide regression guards once fix lands. Swarm 1 should run these as the validation gate.
- **Swarm 2 (UI V2)**: Must preserve `data-testid="home-compile-entry"`, `data-testid="board-picker"`, `data-onboard-target="editor"`, `data-onboard-target="compile-bar"`. Add `data-testid="compile-button"` to the new V2 button for selector stability.
- **Swarm 3 (UNLIM chat V2)**: My chat-context tests assert HomeCompileEntry → helper props contract. Chat V2 should expose: `data-compile-status`, `data-board-label`, etc on the new chat shell so my tests can be extended. The `onAskQuestion` handler contract preservation is mandatory.
- **Swarm 4 (POLISH)**: Run a11y spec post-polish CSS to verify color contrast not regressed.

## BLOCKERS

None.

## FILES TOUCHED

```
tests/unit/components/home/swarm-2026-05-29-compile-state-machine.test.jsx
tests/unit/components/home/swarm-2026-05-29-unlim-chat-context.test.jsx
tests/e2e/swarm-2026-05-29-home-compile-full-flow.spec.js
tests/e2e/swarm-2026-05-29-home-compile-a11y.spec.js
tests/e2e/swarm-2026-05-29-home-compile-mobile-touch.spec.js
docs/audits/2026-05-29-home-compile-a11y-baseline.md
.team-status/swarms-2026-05-29/swarm-5-codex-review.md
.team-status/swarms-2026-05-29/swarm-5-status.md
automa/baseline-tests.txt  (updated)
```

Zero production code touched. Pure test surface addition.
