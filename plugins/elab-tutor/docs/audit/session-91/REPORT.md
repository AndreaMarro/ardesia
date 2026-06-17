# SESSION 91 — TOTAL AUDIT REPORT
**Data**: 2026-03-08 | **Auditor**: Claude (Opus 4.6) | **Metodo**: ONESTA BRUTALE

## Executive Summary

19 bugs found across 7 categories. 0 false positives. 3 P1 critical, 8 P2 important, 8 P3 minor.
The simulator's core circuit functionality is solid (9.8/10), but Galileo AI chat is completely broken (P1), Scratch code generation fails for simple experiments (P1), and the panel state machine causes Galileo to auto-open on virtually every user action (P2 but feels P1).

## Bug Summary

### P1 — Critical (3 bugs)
| # | Area | Description | Fix Scope |
|---|------|-------------|-----------|
| S1 | DNS/Domain | www.elabtutor.school redirects to Netlify vetrina instead of Vercel simulator | Vercel domain config OR DNS CNAME |
| S9 | Scratch/CodeGen | scratchGenerator.js produces broken C++ — `void loop() {}` empty, statements orphaned outside | Blockly code generator for simple-statement blocks |
| G1 | Galileo/Chat | Galileo chat sends ZERO HTTP requests when user submits messages. `handleSend()` likely blocked by stuck `isLoading` flag | isLoading state management in ElabTutorV4.jsx |

### P2 — Important (8 bugs)
| # | Area | Description | Fix Scope |
|---|------|-------------|-----------|
| S2 | UI/Sidebar | Experiment list panel stays visible (220px wasted) | Sidebar state in NewElabSimulator.jsx |
| S3 | Panel/State | Closing info panel triggers Galileo auto-open | Panel state machine in NewElabSimulator.jsx |
| S4 | Panel/State | Mode switch (Già Montato/Passo Passo/Libero) triggers Galileo auto-open | Same fix as S3 |
| S5 | UI/Mode | Già Montato green checkmark persists when other modes selected | Mode selector component state/CSS |
| S8 | Panel/State | Tab switching (Blocchi ↔ Arduino C++) triggers Galileo auto-open | Same fix as S3 |
| S10 | State/Error | Compilation errors persist across experiment switches | Clear error state in experiment load handler |
| G2 | Galileo/Chat | User messages vanish from chat after ~10-15 seconds | Related to G1 — likely resolves together |
| R1 | CSS/iPad | Code editor panel on iPad portrait has `height: 100dvh` — overlaps top navbar (44px) | `height: calc(100dvh - 44px)` in layout.module.css |

### P3 — Minor (8 bugs)
| # | Area | Description | Fix Scope |
|---|------|-------------|-----------|
| S6 | UI/Color | Libero button uses red danger color instead of neutral | CSS color change |
| S7 | A11y | Two buttons with no accessible labels (ref_127, ref_133) | Add aria-label to 2 buttons |
| R2 | Touch | Range slider track only 12px height vs 44px thumb | Increase track to 24px in overlays.module.css |
| R3 | CSS/iPad | Scratch panel width jumps 398px at 1024px breakpoint | Smooth clamp() transition |
| R4 | Font/WCAG | `.overflow-separator` at 0.65rem (~10.4px) violates 14px min | Change to 0.875rem |
| R5 | CSS/Mobile | Bottom panel no max-height for <768px — may consume 50% screen | Add max-height rule |
| R6 | Touch | Toolbar separator only 28px (should be 44px or hidden) | Increase height |
| R7 | Font | Watermark 10px, borderline illegible on iPad | Increase to 12px or hide on mobile |

### Cross-Referenced (E1=R4, E2=R7, E3=R2)
Aesthetic bugs E1-E3 are the same as responsive bugs R4, R7, R2 — counted once.

## Scorecard

| Area | Session 87 Score | Session 91 Score | Delta | Notes |
|------|-----------------|-----------------|-------|-------|
| Auth + Security | 9.8/10 | 9.8/10 | — | Not audited (out of scope) |
| Sito Pubblico | 9.6/10 | 9.6/10 | — | Not audited (out of scope) |
| Simulatore (funzionalita) | 9.8/10 | **9.0/10** | **-0.8** | S9 Scratch compile broken, S10 stale errors |
| Simulatore (estetica) | 6.5/10 | **6.0/10** | **-0.5** | S5 checkmark confusion, S6 red Libero, font WCAG violations |
| Simulatore (iPad) | 7.0/10 | **6.5/10** | **-0.5** | R1 code editor overlap, R3 Scratch panel jump |
| Simulatore (physics) | 7.0/10 | 7.0/10 | — | Vol1 passive circuit works, not deeply tested |
| Scratch Universale | 10.0/10 | **7.0/10** | **-3.0** | S9 broken C++ for simple statements. The Blink experiment (most basic) fails! |
| AI Integration | 10.0/10 | **4.0/10** | **-6.0** | G1 chat completely broken, G2 messages vanish, S3/S4/S8 Galileo auto-open |
| Responsive/A11y | 7.5/10 | **6.5/10** | **-1.0** | R1-R7 new CSS issues, S7 missing aria-labels |
| Code Quality | 9.8/10 | 9.8/10 | — | Not audited (build verified via compile test) |
| **Overall** | **~8.7/10** | **~7.5/10** | **-1.2** | AI and Scratch regressions dominate |

### Score Justification — Key Downgrades

**AI Integration 10 → 4**: The GALILEO SPIEGA toolbar button still works (explains experiments correctly). But the actual CHAT feature — the core interactive AI — is 100% broken. Zero network requests, messages vanish. Plus Galileo auto-opens everywhere. This is not a 10.

**Scratch 10 → 7**: Session 86 reported 11/12 compile. But this audit found the MOST BASIC experiment (Blink on pin 13) fails. If Blink fails, the score cannot be 10. The Blockly workspace loads and looks correct, but generated C++ is broken for simple-statement blocks.

**Simulatore funzionalita 9.8 → 9.0**: Core circuit works. Passo Passo works. But S9+S10 are real functional failures, and S1 (wrong domain redirect) prevents users from even reaching the app.

## Root Cause Patterns

### Pattern 1: Panel State Machine (S3, S4, S8)
The right-side panel defaults to Galileo when no other panel is active. Every action that closes or changes a panel triggers Galileo to auto-open. This is the single most impactful UX bug.

**Fix**: Panel state machine should have a "NONE" state. When a panel closes, the new state should be NONE, not GALILEO.

### Pattern 2: Scratch Code Generation (S9)
The `scratchGenerator.js` template string looks structurally correct, but Blockly's custom block code generators for simple statements (digitalWrite, delay) don't collect their output into the `loopCode` variable. Compound blocks (if/else) work because they generate as a single nested structure.

**Fix**: Investigate the Blockly code generators for each custom block type. The `arduino_base` block's `statementToCode()` call may not be capturing simple statement blocks correctly.

### Pattern 3: Galileo Chat State (G1, G2)
`handleSend()` at line 1082 of ElabTutorV4.jsx does a silent return when `isLoading === true`. The "GALILEO SPIEGA" modal operation may leave `isLoading` stuck at `true`, blocking all subsequent chat sends.

**Fix**: 1) Add timeout/safety reset for `isLoading` flag. 2) Ensure "GALILEO SPIEGA" modal cleanup sets `isLoading = false`. 3) Add error boundary around chat send.

## Files Audited
- 03-SCAN-SIMULATOR.md (10 bugs)
- 06-SCAN-GALILEO.md (2 bugs)
- 07-SCAN-ESTETICA.md (3 bugs, cross-ref with R4/R7/R2)
- 08-SCAN-RESPONSIVE.md (7 bugs)
- 09-COV-RESULTS.md (19 bugs verified, 0 false positives)
- 10-RALPH-LOOPS.md (2 loops, all key bugs confirmed)

## Methodology
- Chrome extension automation on production (elab-builder.vercel.app)
- MacBook 1440x900 viewport
- CSS source code analysis for responsive bugs (window resize API failed)
- Accessibility tree analysis via read_page
- Network request monitoring for Galileo chat
- Background agent for CSS audit (parallel)
- Background agents for code analysis (scratchGenerator.js, ElabTutorV4.jsx handleSend)
- Chain of Verification: 6 criteria per bug, 0 false positives

## Recommendation

**Priority 1 (Fix before any demo)**:
1. G1 — Galileo chat broken. This is the flagship AI feature.
2. S9 — Scratch compile broken. The most basic experiment fails.
3. S1 — Domain redirect. Users can't reach the app.

**Priority 2 (Fix this week)**:
4. S3/S4/S8 — Panel state machine. Single fix, three bugs resolved.
5. S5 — Checkmark confusion. Quick CSS/state fix.
6. S10 — Stale errors. Clear state on experiment load.

**Priority 3 (Fix this sprint)**:
7-19. All remaining P2/P3 bugs (CSS-only fixes, no JS changes needed for R1-R7).
