# REMEDIATION PROMPT — Session 92
**Generated from**: Session 91 Total Audit (2026-03-08)
**Scope**: Fix all 19 bugs found in audit. NO new features. ZERO regressions.

---

## Instructions for Session 92

You are fixing bugs found in the Session 91 audit of ELAB Tutor (elab-builder). Read these files first:
- `docs/audit/session-91/REPORT.md` — Full bug list and root cause analysis
- `docs/audit/session-91/09-COV-RESULTS.md` — Chain of Verification with root causes

### Phase 1: P1 Critical (3 bugs)

#### FIX-G1: Galileo Chat Not Responding
**File**: `src/components/ElabTutorV4.jsx`
**Root Cause**: `handleSend()` line ~1082 silently returns when `isLoading === true`. The "GALILEO SPIEGA" modal likely leaves `isLoading` stuck.
**Fix Strategy**:
1. Find where `isLoading` is set to `true` in the "GALILEO SPIEGA" flow
2. Ensure it's reset to `false` in all exit paths (success, error, timeout)
3. Add a safety timeout: if `isLoading` stays `true` for >30 seconds, auto-reset
4. Test: Open Galileo chat, type message, press Enter → should see network request to nanobot `/tutor-chat`

#### FIX-S9: Scratch Code Generation
**File**: `src/components/simulator/panels/scratchGenerator.js` AND custom Blockly block generators
**Root Cause**: Simple-statement blocks (digitalWrite, delay) don't collect into `loopCode` variable. `void loop() {}` closes empty, statements appear outside.
**Fix Strategy**:
1. Read `scratchGenerator.js` — find `arduino_base` block generator
2. Check `Blockly.Arduino.statementToCode(block, 'LOOP')` — does it capture all child statements?
3. Check individual block generators (in `scratchBlocks.js` or separate generator files) — do they return code properly?
4. Test: Load Vol3 Cap 6 Esp 1 "LED Blink esterno" in Blocchi tab → Compila & Carica → should compile successfully
5. **Regression check**: Also test a compound block experiment (e.g., if/else) to ensure it still works

#### FIX-S1: Domain Redirect
**Root Cause**: `www.elabtutor.school` DNS/Vercel config points to Netlify instead of Vercel
**Fix Strategy**:
1. Check Vercel domain settings for `elab-builder` project
2. Ensure `www.elabtutor.school` is listed as a domain
3. If DNS: update CNAME for `www` subdomain to point to Vercel's cname target
4. Test: Navigate to `www.elabtutor.school` → should load the simulator, not the marketing site

### Phase 2: P2 Panel State Machine (3 bugs, 1 fix)

#### FIX-S3/S4/S8: Galileo Auto-Open
**File**: `src/components/simulator/NewElabSimulator.jsx`
**Root Cause**: Right-side panel state machine defaults to Galileo when no panel is active. Every close/switch triggers Galileo.
**Fix Strategy**:
1. Find the panel state variable (likely `activeRightPanel` or similar)
2. Add a `null`/`"none"` state — when a panel closes, set to `null` instead of `"galileo"`
3. Search for ALL places where panel state changes. Ensure:
   - Closing info panel → state = null (not galileo)
   - Switching build modes → state = unchanged (not galileo)
   - Switching editor tabs → state = unchanged (not galileo)
4. Test: Close info panel → right side should be empty. Switch modes → no panel change. Switch tabs → no panel change.

### Phase 3: P2 UI Bugs (3 bugs)

#### FIX-S5: Già Montato Checkmark
**File**: `src/components/simulator/NewElabSimulator.jsx` (mode selector)
**Root Cause**: Green checkmark not tied to active mode correctly
**Fix**: Ensure checkmark only shows on the CURRENTLY ACTIVE mode, not on "Già Montato" permanently.

#### FIX-S10: Stale Compilation Errors
**File**: `src/components/simulator/NewElabSimulator.jsx` or wherever experiment load handler is
**Root Cause**: Error state not cleared on experiment switch
**Fix**: In the experiment load handler, reset compilation error state (clear error messages, reset error panel visibility).

#### FIX-S2: Sidebar Stays Open
**File**: `src/components/simulator/NewElabSimulator.jsx`
**Root Cause**: Sidebar doesn't auto-collapse when experiment loads
**Fix**: Add `setSidebarOpen(false)` (or equivalent) in experiment load handler. This reclaims ~220px of breadboard space.
**Note**: This MAY be intentional for quick navigation between experiments. Ask user before fixing.

### Phase 4: P3 CSS Fixes (8 bugs)

All CSS-only. No JS changes needed.

#### FIX-S6: Libero Red Color
**File**: `src/styles/ElabSimulator.css`
**Fix**: Change Libero button color from `--color-vol3` (#E54B3D) to a neutral/brand color.

#### FIX-S7: Missing Accessible Labels
**File**: Experiment card action buttons (likely in ExperimentPicker or ExperimentCard component)
**Fix**: Add `aria-label` to the 2 buttons (ref_127, ref_133 in accessibility tree).

#### FIX-R1: iPad Code Editor Overlap
**File**: `src/styles/layout.module.css`
**Fix**: Change `height: 100dvh` → `height: calc(100dvh - 44px)` for code editor at 768-1023px breakpoint.

#### FIX-R2/E3: Range Slider Track
**File**: `src/styles/overlays.module.css`
**Fix**: Increase track height from 12px → 24px.

#### FIX-R3: Scratch Panel Width Jump
**File**: `src/styles/ElabSimulator.css`
**Fix**: Smooth the `clamp()` transition at 1023→1024px breakpoint.

#### FIX-R4/E1: Overflow Separator Font
**File**: `src/styles/ElabSimulator.css`
**Fix**: Change `.overflow-separator` from `0.65rem` → `0.875rem` (14px).

#### FIX-R5: Mobile Bottom Panel
**File**: `src/styles/ElabSimulator.css`
**Fix**: Add `max-height: min(120px, 20dvh)` for bottom panel at `<768px`.

#### FIX-R6: Toolbar Separator Height
**File**: `src/styles/ElabSimulator.css`
**Fix**: Increase `.toolbar-separator` from 28px → 40px.

#### FIX-R7/E2: Watermark Font
**File**: `src/styles/ElabSimulator.css`
**Fix**: Increase watermark from 10px → 12px, or hide on `<768px`.

### Phase 5: Verification

After ALL fixes:
1. **Ralph Loop**: Vol1 experiment → Vol3 Scratch compile → Vol2 Passo Passo → verify no regressions
2. **Galileo Chat**: Type message → should receive AI response
3. **Panel State**: Close panels → Galileo should NOT auto-open
4. **Scratch Compile**: Vol3 Cap 6 Esp 1 Blink → should compile successfully
5. **Build**: `npm run build` → 0 errors, 0 warnings (or same warnings as before)
6. **Deploy**: Vercel production

### Estimated Fix Effort
- Phase 1 (P1): ~2-3 hours (G1 needs investigation, S9 needs Blockly debugging, S1 is config)
- Phase 2 (Panel): ~30 min (single state machine fix)
- Phase 3 (P2 UI): ~30 min (3 small state fixes)
- Phase 4 (CSS): ~1 hour (8 CSS-only changes)
- Phase 5 (Verification): ~30 min
- **Total: ~5-6 hours**
