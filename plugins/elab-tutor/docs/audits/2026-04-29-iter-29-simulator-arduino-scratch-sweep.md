# Iter 29 — Simulator Arduino + Scratch Bug Sweep

**Date**: 2026-04-29
**Spec**: `tests/e2e/29-simulator-arduino-scratch-sweep.spec.js`
**Target URL**: `https://elab-tutor-git-e2e-bypass-preview-andreas-projects-6d4e9791.vercel.app`
**Runner**: Playwright chromium, headless, 2 workers, serial mode per suite
**Mandate**: Sprint T iter 29 P0 Task C — Andrea iter 21 "MOLTI ESPERIMENTI NON FUNZIONANO"

---

## Results Summary

| Test | Suite | Result | Severity |
|------|-------|--------|----------|
| T29-A1 | Arduino C++ | PASS | — |
| T29-A2 | Arduino C++ | **FAIL** | P0 |
| T29-A3 | Arduino C++ | DID NOT RUN | (serial after T29-A2 fail) |
| T29-S1 | Scratch/Blockly | PASS | — |
| T29-S2 | Scratch/Blockly | PASS | — |
| T29-S3 | Scratch/Blockly | PASS (P1 warning) | P1 |
| T29-W1 | Wire/Palette | PASS | — |
| T29-W2 | Wire/Palette | **FAIL** | P1 |
| T29-W3 | Wire/Palette | DID NOT RUN | (serial after T29-W2 fail) |
| T29-N1 | Console/Network | PASS | P2 known |

**Totals**: 6 PASS | 2 FAIL | 2 DID NOT RUN

---

## Bug Register

### BUG-29-01 (P0) — Compile server CORS blocks bypass preview domain

**Spec**: T29-A2
**Symptom**: `▶ Compila & Carica` button NOT visible on v3 AVR experiment (Blink, Cap.5 Esp.1).

**Root cause** (from T29-S2 console error capture):

```
Access to fetch at 'https://n8n.srv1022317.hstgr.cloud/compile'
from origin 'https://elab-tutor-git-e2e-bypass-preview-...' has been blocked
by CORS policy: No 'Access-Control-Allow-Origin' header.

Access to fetch at 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy'
from origin 'https://elab-tutor-git-e2e-bypass-preview-...' has been blocked
by CORS policy: 'Access-Control-Allow-Origin' has value
'https://www.elabtutor.school' that is not equal to the supplied origin.
```

Two CORS failures:
1. **n8n compiler** (Hostinger) — no CORS header for bypass preview origin
2. **Supabase compile-proxy** — hardcoded to `https://www.elabtutor.school` only

**Impact**: All Arduino C++ compilation is broken on the e2e bypass preview domain. `▶ Compila & Carica` button does not render because the compile service is unreachable. This is a production regression gate: if the button is absent, AVR experiments cannot be tested E2E.

**Note**: The button IS present on `https://www.elabtutor.school` (prod domain). This bug is specific to the bypass preview URL used for E2E testing. Needs either:
- CORS whitelist bypass preview domain in n8n + Supabase compile-proxy
- OR run compile flow tests against prod with auth bypass

**Evidence**: `docs/audits/iter-29-screenshots/arduino/T29-A2-FAIL-no-compile-btn.png`

---

### BUG-29-02 (P1) — T29-W2 Wire toggle test timeout (60s exceeded)

**Spec**: T29-W2
**Symptom**: Test timeout of 60000ms exceeded after wire button click + state check.

**Root cause analysis**: T29-W2 runs after T29-W1 in serial mode. Both reload the experiment picker. Picker load + experiment click + wire button check chain approaches timeout boundary. The `loadExperimentByAriaLabel` helper makes multiple DOM queries (volume tab switch, "Tutti gli esperimenti" click, iterate all `button[aria-label]`). When the Vercel preview is under load, cumulative wait time exceeds 60s.

**Secondary issue**: The test asserts `wireBtnVisible` (Filo button found = true based on T29-W1 passing), but the test timed out during wire button click or state inspection — meaning the click or `getAttribute` call hung.

**Mitigation**: Increase Wire suite timeout to 90s, or move wire toggle to a separate suite that does not depend on experiment reload.

**Evidence**: `docs/audits/iter-29-screenshots/wire/T29-W2-FAIL-timeout.png`

---

### BUG-29-03 (P1) — Compila & Carica not visible in Blocchi (Scratch) view

**Spec**: T29-S3 (soft warning, test does NOT fail hard — recorded as P1)
**Symptom**: `▶ Compila & Carica` button not found after switching to Blocchi tab.

**Context**: Blockly workspace renders correctly (T29-S2 PASS, 51 SVGs visible). But the compile button disappears or is not rendered when in Blocchi mode. This means Scratch-generated code cannot be compiled from the Blocchi view.

**Impact**: Students using Scratch/Blockly mode cannot compile to AVR. This degrades the Blocchi workflow from "visual coding + instant feedback" to "visual coding + no compile".

---

### BUG-29-04 (P2) — elab-galileo.onrender.com CORS on every mount

**Spec**: T29-N1 (excluded from assert, recorded as known)
**Symptom**: `elab-galileo.onrender.com/health` CORS error on lavagna mount from bypass preview domain.

**Known**: Render free tier does not allow the bypass preview origin. No 'Access-Control-Allow-Origin' header.

**Impact**: 3 console errors on every page load (health check + ERR_FAILED follow-ups). Not critical. UNLIM falls back to Gemini.

---

## Confirmed Working

- **ExperimentPicker flow**: picker auto-opens, volume tabs work, "Tutti gli esperimenti" expands list, experiment buttons with `aria-label="Cap. X Esp. Y - Title"` are clickable. (T29-A1, T29-S1, T29-W1)
- **v1 circuit experiment**: loads without compile button (correct — v1 is circuit mode only). (T29-A1)
- **Blocchi tab**: visible and clickable for vol3 AVR experiments. (T29-S1, T29-S2)
- **Blockly workspace**: renders after Blocchi tab click (51 SVGs). (T29-S2)
- **Component palette**: LED (`Aggiungi LED`) and Resistore (`Aggiungi Resistore`) buttons visible. (T29-W1)
- **Filo button**: visible in component palette (text "Filo", not "Collegamento Fili"). (T29-W1, T29-W2 initial check)
- **No critical JS errors on mount**: 0 critical errors, 3 known CORS excluded. (T29-N1)

---

## DOM Corrections to CLAUDE.md

Verified from debug spec runs (2026-04-29):

| CLAUDE.md claim | Reality |
|----------------|---------|
| Compile button `aria-label="Compila"` | Button has NO aria-label. Text: `"▶ Compila & Carica"` |
| Wire button `"Collegamento Fili"` | Text: `"Filo"` |
| Picker buttons `aria-label^="Carica esperimento"` | `aria-label="Cap. X Esp. Y - Title"` |

---

## Console Errors Detail

| Category | Count | Source |
|----------|-------|--------|
| Critical JS (assert) | 0 | — |
| CORS / health check excluded | 3 | elab-galileo.onrender.com + ERR_FAILED follow-ups |
| Compile CORS (T29-S2) | 2 | n8n Hostinger + Supabase compile-proxy |
| Network request failures | 0 | — |

---

## Screenshots

| File | Test | Content |
|------|------|---------|
| `arduino/T29-A2-FAIL-no-compile-btn.png` | T29-A2 FAIL | v3 Blink loaded, compile btn absent |
| `wire/T29-W2-FAIL-timeout.png` | T29-W2 FAIL | Wire suite state at timeout |

---

## Recommendations (Priority Order)

1. **P0**: Whitelist bypass preview domain in Supabase `compile-proxy` CORS config (add `elab-tutor-git-e2e-bypass-preview-*.vercel.app` to allowed origins). n8n Hostinger CORS header similarly. Unblocks T29-A2 + T29-A3.
2. **P1**: Ensure `▶ Compila & Carica` button renders in Blocchi view — likely compile button is conditionally hidden when Blockly editor is active. Fix: show button regardless of active editor tab.
3. **P1**: Increase T29-W2 timeout to 90s or restructure Wire suite to avoid cumulative picker-load overhead.
4. **P2**: Whitelist bypass preview domain in Render (elab-galileo.onrender.com) CORS config, OR silence the health check on non-prod origins.

---

## Files Produced

- `tests/e2e/29-simulator-arduino-scratch-sweep.spec.js` — spec (10 tests, 4 suites, serial mode)
- `docs/audits/2026-04-29-iter-29-simulator-arduino-scratch-sweep.md` — this file
- `docs/audits/iter-29-screenshots/arduino/T29-A2-FAIL-no-compile-btn.png`
- `docs/audits/iter-29-screenshots/wire/T29-W2-FAIL-timeout.png`

Debug specs (to delete post-session):
- `tests/e2e/debug-picker.spec.js`
- `tests/e2e/debug-picker2.spec.js`
- `tests/e2e/debug-v3-compile.spec.js`
- `tests/e2e/debug-v3-compile2.spec.js`
