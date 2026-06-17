# AGENT-11: CoVe Cross-Verification Report

**Verifier**: AGENT-11 (Chain-of-Verification Cross-Verifier)
**Date**: 2026-02-13 (session 2 -- independent re-verification)
**Method**: For each CRITICAL finding, (1) read original report, (2) read actual source at cited line, (3) verify if issue exists as described, (4) classify verdict.
**Files Independently Verified**: 14 source files, 6 agent reports, 1 env file
**Model**: Claude Opus 4.6

---

## Verification Matrix -- 14 Assigned CRITICAL Findings

| # | Source Agent | Finding ID | Description | File:Line | Verdict | Evidence |
|---|-------------|-----------|-------------|-----------|---------|----------|
| 1 | AGENT-01 | CRITICAL-01 | MNA LED polarity not checked -- reverse-biased LEDs modeled as conducting | CircuitSolver.js:934-952 | **CONFIRMED** | Lines 934-952: LED is always stamped as voltage source with `posNet: anodeNet, negNet: cathodeNet` regardless of actual circuit voltages. The only guard is `anodeNet !== cathodeNet` (L940) which checks net identity, NOT voltage polarity. A reverse-biased LED (cathode at higher potential than anode) would still be modeled as a conducting Vf source, producing incorrect MNA solutions. Note: polarity fixes exist at L1274 (RGB path-tracer) and L1385 (capacitor) but NOT in MNA LED stamping. |
| 2 | AGENT-01 | CRITICAL-02 | Servo PWM frequency assumption -- 50Hz assumed but Timer1 default is 490Hz | AVRBridge.js:855-868 | **CONFIRMED** | L853 comment: "Servo PWM: 50Hz". L860-862: duty range heuristic `0.025-0.125` excludes normal PWM (0.502 for analogWrite(128)). L864: angle formula `((duty - 0.05) / 0.05) * 180`. Works correctly ONLY because Servo.h library reconfigures Timer1 to ~50Hz before writing. If a user writes raw Timer1 register manipulation at 490Hz default, the duty cycle would be misinterpreted. The heuristic range guard (L862) provides partial protection by rejecting out-of-range values. |
| 3 | AGENT-03 | C-01 to C-09 | Touch targets systematically below 44px minimum | ControlBar.jsx:392,439; SimulatorCanvas.jsx:1809-1822 | **CONFIRMED** | Verified exact values: `btnStyle.height: 30` (L392), `toggleBtnStyle.height: 28` (L439), zoom buttons `width: 32, height: 32`. SVG delete circle `r=7` (14px diameter). All below Apple HIG 44pt minimum for child interfaces. Not a single interactive element in the simulator meets the 44px threshold. |
| 4 | AGENT-03 | C-22,23,24 | Zero ARIA accessibility (no aria-label, no role, no tabIndex) | All simulator files | **CONFIRMED** | Independent grep searches: `aria-` across `/src/components/simulator/` = **0 matches**. `role=` = **0 matches**. `tabIndex` or `tabindex` = **0 matches**. The simulator has zero accessibility markup. Screen reader users and keyboard-only users are completely excluded. |
| 5 | AGENT-08 | AUTH-01,02 | Client-side auth bypassable from DevTools | userService.js:17-53 | **CONFIRMED** | L17-26: `DB_KEYS` object stores ALL app data in 8 localStorage keys. L33-36: HMAC secret generated as `crypto.randomUUID()` stored in `sessionStorage` when `VITE_SESSION_SECRET` is not set (verified NOT in `.env` -- `.env` has 8 vars, none named `VITE_SESSION_SECRET`). L91: Admin password hash `c56bcbd957d6f0de92aba70b0ae029f9166909c7f9bf56376c313e1b993d4273` hardcoded in source code. Bypass: `localStorage.setItem('elab_current_user', JSON.stringify({id:'x',ruolo:'admin'}))` grants instant admin access. |
| 6 | AGENT-08 | DATA-02 | PII in plaintext localStorage -- children's emotional/psychological data | userService.js:162-186; studentService.js:32-65 | **CONFIRMED** | Registration at L87-99 stores: nome, email, scuola (school), citta (city), passwordHash (unsalted SHA-256), ruolo. studentService additionally stores mood logs, confusion levels, learning difficulties, session tracking. All stored as plaintext JSON in localStorage. On shared school computers, any user can open DevTools and read all data. Under GDPR Article 9, emotional/psychological data about minors constitutes special category personal data requiring enhanced protections. |
| 7 | AGENT-09 | CRITICAL-01 | Base wires not deletable -- silent ignore with no user feedback | NewElabSimulator.jsx:1314-1328 | **CONFIRMED** | L1316: `const baseCount = (currentExperiment?.connections || []).length`. L1317: `const customIndex = wireIndex - baseCount`. L1319: `if (customIndex >= 0 && customIndex < customConnections.length)` -- only custom wires enter the deletion branch. Base wires (customIndex < 0) fall through silently. L1327-1328 comment: "base experiment connections cannot be deleted... In the future, we could add them to a hidden connections list". No toast, no error message, no visual feedback given to the user. |
| 8 | AGENT-10 | CRITICAL-01 | Bus rail snap returns wrong pinId (`bus-N` instead of specific rail name) | SimulatorCanvas.jsx:118-128 | **CONFIRMED** | L110-116: `busYOffsets` array has 4 entries representing top-plus, top-minus, bot-plus, bot-minus. L118-127: The loop iterates over ALL 4 bus offsets but L125 always returns `bus-${col + 1}` -- a generic name that does not distinguish between the 4 different rails. The breadboard registry uses `bus-top-plus-N`, `bus-top-minus-N`, `bus-bot-plus-N`, `bus-bot-minus-N`. This mismatch means interactive snapping to bus rails produces pin IDs that do not match any registered hole. Currently partially latent since `breadboardSnap.js` (used for auto-assignment) also does not snap to bus rails at all (separate issue). |
| 9 | AGENT-10 | CRITICAL-02 | Drag not undoable + drops rotation field | NewElabSimulator.jsx:1243-1246 | **CONFIRMED** | (a) **No undo**: L1243 `handleLayoutChange` does NOT call `pushSnapshot()`. Every other mutation handler does: `handleConnectionAdd` (L1286), `handleComponentAdd` (L1339), `handleComponentDelete` (L1395), `handleWireDelete` (L1312). This is the only missing case. (b) **Rotation loss**: L1246: `{ x: newPos.x, y: newPos.y }` explicitly extracts only x and y, discarding any `rotation` property. If user rotates a component then drags it, the rotation is silently lost. |
| 10 | AGENT-15 | CRITICAL-01 | No COPPA/GDPR compliance mechanisms | Entire codebase | **CONFIRMED** | Grep for `COPPA`, `GDPR`, `coppa`, `gdpr`, `privacy.?policy`, `parental.?consent` across entire `src/` directory = **0 matches**. No age gate, no parental consent workflow, no privacy policy page, no data minimization, no data retention limits, no parental review mechanism. Application explicitly targets children ages 8-12 (stated in CLAUDE.md). This constitutes a regulatory gap under US COPPA, EU GDPR Article 8, and Italian D.Lgs. 196/2003. *Note: Identical to AGENT-08 COPPA-01 -- same underlying issue reported by two independent agents.* |
| 11 | AGENT-15 | CRITICAL-02 | No analytics consent mechanism | AnalyticsWebhook.js:14-42 | **CONFIRMED** | L14: `sendAnalyticsEvent()` fires immediately with no consent check. L24-28: Uses `navigator.sendBeacon()` (fire-and-forget, cannot be intercepted or revoked by the user). L47-53: Session ID generated and stored in `sessionStorage` (correctly session-scoped, unlike chat session). Grep for `consent`, `cookie.?banner`, `opt.?in`, `opt.?out` across entire `src/` = **0 matches**. No mechanism exists for users to opt in or out of analytics tracking. |
| 12 | AGENT-15 | CRITICAL-03 | Session IDs persist in localStorage (shared school computers) | api.js:123-124 | **CONFIRMED** | L123: `const sessionId = localStorage.getItem('galileo_session') || \`s_\${crypto.randomUUID()}\``. L124: `localStorage.setItem('galileo_session', sessionId)`. Same pattern repeated at L204-205 (text-only path). `localStorage` persists across browser sessions indefinitely. On shared school computers, the next student inherits the previous student's `galileo_session` ID, which the n8n backend may associate with the previous student's conversation context. *Important distinction*: The analytics session ID uses `sessionStorage` (AnalyticsWebhook.js:48) which is correctly scoped and clears on tab close -- only the Galileo chat session ID is problematic. |
| 13 | AGENT-15 | CRITICAL-04 | No retry logic for chat requests | api.js:286-318 | **CONFIRMED** | L286: `catch(error)` block in `sendChat()`. L289-310: Fallback to local RAG if configured (`LOCAL_API` set), otherwise L313-317: returns error directly with `success: false`. Grep for `retry`, `retries`, `backoff` in `api.js` = **0 matches**. No automatic retry with exponential backoff. The Tutor UI has a manual "retry" button (ElabTutorV4:1663-1666) but the Simulator's `handleAskGalileo` (NES:1167-1238) does not expose any retry mechanism -- user must click "Chiedi a Galileo" again manually. |
| 14 | AGENT-15 | CRITICAL-05 | Content filter bypassed in simulator | NewElabSimulator.jsx:1167-1238 | **PARTIALLY TRUE** | `handleAskGalileo` (L1167) calls `apiSendChat(galileoPrompt, images)` directly (L1220) without calling `validateMessage()` from contentFilter.js. However, the content sent is a PRE-WRITTEN `galileoPrompt` from experiment data (L1176) or a system-generated default template (L1177-1180). There is NO user text input field in the simulator's Galileo panel -- GalileoResponsePanel.jsx has no input, only a "Chiedi ancora" button that re-sends the same prompt. The architectural bypass exists but is **not exploitable** since users cannot inject arbitrary text. **Recommend downgrading from CRITICAL to WARNING.** |

---

## Summary Counts

| Verdict | Count |
|---------|-------|
| **CONFIRMED** | **13** |
| **PARTIALLY TRUE** | **1** |
| **FALSE POSITIVE** | **0** |
| **ALREADY FIXED** | **0** |
| **Total Verified** | **14** |

### Confidence Level

All 14 findings were verified by reading the actual source code at the cited line numbers. Every line reference matched the reported content (with minor line-number offsets of 0-5 lines due to Sprint 3 additions, all within tolerance). No finding was fabricated or misattributed.

---

## Breakdown by Agent

| Agent | Findings Assigned | Confirmed | Partially True | False Positive |
|-------|-------------------|-----------|----------------|----------------|
| AGENT-01 (Circuit) | 2 | 2 | 0 | 0 |
| AGENT-03 (UX/A11y) | 2 (groups) | 2 | 0 | 0 |
| AGENT-08 (Security) | 2 | 2 | 0 | 0 |
| AGENT-09 (Wire) | 1 | 1 | 0 | 0 |
| AGENT-10 (Snap) | 2 | 2 | 0 | 0 |
| AGENT-15 (Galileo) | 5 | 4 | 1 | 0 |

---

## Partially True Detail

**Finding #14 -- AGENT-15 CRITICAL-05 (Simulator bypasses content filter)**: The architectural bypass is real -- `handleAskGalileo` does not call `validateMessage()`. However, the actual content sent is never user-typed: it is either a pre-written `galileoPrompt` from experiment data or a system-generated default template. The GalileoResponsePanel has no text input field. Since users cannot inject arbitrary text, the finding is not exploitable in its current form. If a user input field were ever added to the simulator's Galileo panel, this would become a genuine vulnerability. Recommended severity: **WARNING** (architectural inconsistency, not currently exploitable).

---

## Cross-Agent Consistency Check

### Overlapping findings (same issue reported by multiple agents)

| Issue | Reported By | Consistent? |
|-------|-------------|-------------|
| No COPPA/GDPR compliance | AGENT-08 (COPPA-01), AGENT-15 (CRITICAL-01) | YES -- identical finding, independently discovered |
| Session IDs in localStorage | AGENT-08 (DATA-01 general), AGENT-15 (CRITICAL-03 specific key) | YES -- AGENT-15 more specific about `galileo_session` key |
| Analytics without consent | AGENT-08 (MISC-02 at MEDIUM), AGENT-15 (CRITICAL-02) | YES -- AGENT-15 correctly elevates to CRITICAL given child audience |
| Bus naming bug | AGENT-09 (WARNING-08), AGENT-10 (CRITICAL-01) | YES -- AGENT-10 provides more detail and correctly elevates to CRITICAL |

### Contradictions found: **0**

No agents contradicted each other on any factual claim. Differences exist only in severity classification (e.g., AGENT-08 rates analytics consent as MEDIUM while AGENT-15 rates it CRITICAL), which reflects different prioritization frameworks, not factual disagreement.

---

## Top 10 Deduplicated CRITICAL Issues (Priority-Ranked by Impact)

1. **Client-side auth bypassable via DevTools** (AUTH-01/02) -- Anyone can become admin with one line of JavaScript. All user data, social content, and admin functions exposed.
2. **Children's PII in plaintext localStorage** (DATA-02) -- Names, emails, schools, emotional states, learning difficulties of minors stored without encryption or access control.
3. **Zero COPPA/GDPR compliance** (COPPA-01) -- No consent, no privacy policy, no parental controls. Legal violation for an application explicitly targeting children 8-12.
4. **No analytics consent mechanism** (AGENT-15 CRITICAL-02) -- Data collection fires immediately on experiment load with zero opt-in/opt-out capability.
5. **Chat session IDs persist in localStorage** (AGENT-15 CRITICAL-03) -- On shared school computers, students inherit each other's AI conversation context.
6. **Zero accessibility in simulator** (C-22/23/24) -- No aria-labels, no roles, no tabIndex. Screen reader and keyboard-only users are completely excluded.
7. **Touch targets 28-32px** (C-01 through C-09) -- All interactive elements 28-36% below the 44px minimum for child interfaces. 14 different elements affected.
8. **Font sizes 5-13px across simulator** (C-10 through C-21) -- 22 findings of text sized below 14px minimum for children. Pin tooltips at 5px, component labels at 7px are effectively invisible.
9. **Bus rail snap returns wrong pinId** (AGENT-10 CRITICAL-01) -- Interactive wire placement on bus rails creates connections to non-existent pin IDs, breaking circuit connectivity.
10. **Component drag not undoable + drops rotation** (AGENT-10 CRITICAL-02) -- The most common user action (moving components) cannot be undone, and rotation is silently discarded.

### Second-Tier Issues (CRITICAL but lower immediate impact)

11. **MNA LED polarity not checked** (AGENT-01 CRITICAL-01) -- Reverse-biased LEDs conduct in MNA mode. Affects parallel circuit accuracy.
12. **Servo PWM frequency assumption** (AGENT-01 CRITICAL-02) -- Works with Servo.h but fragile for manual Timer1 code.
13. **Base wires not deletable** (AGENT-09 CRITICAL-01) -- Users cannot modify pre-built experiment wiring. Silent failure with no feedback.
14. **No retry for chat** (AGENT-15 CRITICAL-04) -- Single point of failure for AI responses in simulator context.

---

## Methodology

- Every file:line reference cited by agents was independently opened and read using the Read tool
- Grep searches were performed to verify absence claims (aria-label, role, tabIndex, COPPA, GDPR, consent, retry)
- Source code was read at the exact lines cited, with +/- 5 line tolerance for Sprint 3 drift
- No code was modified during this verification
- All verdicts are based on what the code actually does, not what comments or documentation say

---

*Report generated by AGENT-11 (CoVe Cross-Verifier) -- 2026-02-13, session 2*
*Model: Claude Opus 4.6*
*Verification method: Independent source code reading at cited line numbers + grep absence validation*
*No code was modified during this audit.*
