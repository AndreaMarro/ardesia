# AGENT-15: Galileo AI Bridge Audit Report

**Auditor**: AGENT-15 (Galileo AI Bridge Auditor)
**Date**: 2026-02-13
**Scope**: Complete AI integration pipeline from UI to n8n backend
**Project**: ELAB Simulator + ELAB Tutor "Galileo"

---

## Executive Summary

The Galileo AI integration is a **dual-channel system**: one channel in the Simulator (one-shot explain button) and another in the Tutor (multi-turn conversational chat). Both funnel through the same `sendChat()` function in `src/services/api.js`, which POSTs to an n8n webhook on Hostinger. The architecture is sound but has notable gaps in privacy compliance, conversation memory, and reliability safeguards.

---

## 1. AI Conversation UX: 5/10

### Flow A: Simulator "Chiedi a Galileo" (One-Shot)

**Path**: ControlBar button -> `handleAskGalileo()` (NES:1167) -> `apiSendChat()` -> n8n webhook -> GalileoResponsePanel modal

- PASS: Button clearly labeled "Chiedi a Galileo" with visual feedback (loading state, disabled during request) -- `src/components/simulator/panels/ControlBar.jsx:261-285`
- PASS: Loading state shows immediately with "Galileo sta analizzando..." message -- `NewElabSimulator.jsx:1172`
- PASS: Screenshot of current circuit captured as PNG and sent alongside text prompt -- `NewElabSimulator.jsx:1182-1216`
- PASS: Graceful degradation -- if screenshot fails, text-only prompt is still sent -- `NewElabSimulator.jsx:1213-1214`
- WARNING: **One-shot only** -- no follow-up questions possible. User can only "Chiedi ancora" which resends the same galileoPrompt. The user cannot type a custom question in the simulator context. -- `GalileoResponsePanel.jsx:48-54`
- WARNING: **Response vanishes on close** -- no persistence. If user closes the Galileo panel, the response is gone forever (`setGalileoResponse(null)` on close) -- `NewElabSimulator.jsx:2006`
- WARNING: **No markdown rendering** -- response text is split by `\n` and rendered as `<p>` tags. Bold, lists, code blocks from AI are displayed as raw text. -- `GalileoResponsePanel.jsx:39-41`
- INFO: Max image dimension capped at 600px for speed -- `NewElabSimulator.jsx:1201-1203`

### Flow B: Tutor Chat (Multi-Turn)

**Path**: Chat input -> `handleSend()` (ElabTutorV4.jsx:1534) -> `validateMessage()` -> `checkRateLimit()` -> `detectIntent()` -> `sendChat()` -> response rendering

- PASS: Full conversational UI with message history, user/assistant bubbles -- `ElabTutorV4.jsx:1534-1661`
- PASS: Content filtering for children (profanity, PII detection) BEFORE sending to API -- `contentFilter.js:1-136`
- PASS: Rate limiting (3 messages per 10 seconds, 100 per session) -- `api.js:29-79`
- PASS: Local intent detection (navigation commands like "apri volume 1 pagina 5") handled without AI call -- `ElabTutorV4.jsx:1563-1571`
- PASS: Smart action parsing from AI response (code blocks -> editor, page references -> manual navigation, simulator mentions -> tab switch) -- `ElabTutorV4.jsx:1592-1639`
- PASS: Output sanitization via `sanitizeOutput()` -- `ElabTutorV4.jsx:1581`
- PASS: Retry mechanism for failed messages -- `ElabTutorV4.jsx:1663-1666`
- WARNING: **No conversation context sent to AI** -- each message is sent independently. The n8n webhook receives `{message, sessionId}` but there is no explicit conversation history array. Memory depends entirely on n8n workflow's session management. -- `api.js:217-221`
- CRITICAL: **sessionId stored in localStorage** -- persists across browser restarts. A child on a shared school computer inherits another student's AI conversation context if they use the same browser profile. -- `api.js:123-124, 204-205`

### Flow C: Game Tools -> Galileo

- PASS: CircuitDetective has "Chiedi a Galileo" button that sends a Socratic prompt -- `CircuitDetective.jsx:77-80`
- PASS: CircuitReview generates circuits via `sendChat()` with structured system prompts -- `CircuitReview.jsx:33-72`
- INFO: Both game tools use `onSendToGalileo` callback to pipe messages through the main tutor chat

---

## 2. API Bridge Completeness: 7/10

**File**: `src/services/simulator-api.js` (351 LOC)

### `window.__ELAB_API` Namespace

- PASS: Properly initialized on `window.__ELAB_API` with guard against React StrictMode double-mount -- `simulator-api.js:35-41`
- PASS: Cleanup on unmount (`delete window.__ELAB_API`) -- `simulator-api.js:49-52`
- PASS: Version field (`1.0.0`) and name field present -- `simulator-api.js:61-62`

### Core Methods

| Method | Status | Notes |
|--------|--------|-------|
| `getExperimentList()` | PASS | Returns vol1/2/3 with metadata |
| `getExperiment(id)` | PASS | Full experiment data by ID |
| `loadExperiment(id)` | PASS | Loads into simulator with guard |
| `getCurrentExperiment()` | PASS | Delegates to simulator ref |
| `play()` / `pause()` / `reset()` | PASS | Simulation control |
| `getComponentStates()` | PASS | Returns current state map |
| `interact(id, action, value)` | PASS | Button press, pot set, etc |
| `captureScreenshot()` | PASS | SVG -> Canvas -> PNG data URL |
| `askGalileo(prompt)` | PASS | Auto-captures screenshot + sends to API |
| `analyzeImage(dataUrl, question)` | PASS | Image analysis via n8n/Gemini |
| `compile(code, board)` | PASS | Arduino compilation |
| `getEditorCode()` / `setEditorCode()` | PASS | Code editor access |

### `__ELAB_API.galileo` Sub-Namespace

| Method | Status | Notes |
|--------|--------|-------|
| `highlightComponent(ids)` | PASS | Sets `apiHighlightedComponents` state, merged with prop highlights -- NES:513 |
| `highlightPin(refs)` | PASS | Sets `apiHighlightedPins` state -- NES:514 |
| `clearHighlights()` | PASS | Clears both arrays -- simulator-api.js:279-282 |
| `serialWrite(text)` | PASS | Delegates to AVRBridge -- NES:515 |
| `getCircuitState()` | PASS | Returns component states |

- WARNING: **`onStateChange` / `onSerialOutput` callbacks not in galileo namespace** -- they exist as top-level `__ELAB_API.on('stateChange', ...)` events, not as galileo-specific callbacks. This is architecturally fine but the CLAUDE.md documentation lists them as galileo features. -- `simulator-api.js:317-335`
- WARNING: **`totalExperiments` hardcoded to 67** but actual count is 69 (after Sprint 2 added 2 extra experiments). -- `simulator-api.js:305`

### Event System (pub/sub)

- PASS: `on(event, callback)` returns unsubscribe function -- `simulator-api.js:317-324`
- PASS: `off(event, callback)` for explicit unsubscribe -- `simulator-api.js:331-335`
- PASS: 5 event types emitted: `experimentChange`, `stateChange`, `serialOutput`, `componentInteract`, `circuitChange` -- verified in NES grep
- PASS: Error isolation in event callbacks (`try/catch` per callback) -- `simulator-api.js:347`
- PASS: Events stored on `window.__ELAB_EVENTS` (separate from API object) -- cleaned up on unmount

---

## 3. Webhook Reliability: 6/10

**File**: `src/services/api.js` (539 LOC)

### Webhook URLs

| Webhook | URL | Purpose |
|---------|-----|---------|
| Chat | `https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat` | Galileo AI (DeepSeek + Gemini) |
| Compile | `https://n8n.srv1022317.hstgr.cloud/compile` | Arduino compilation (standalone) |
| Compile (n8n) | `https://n8n.srv1022317.hstgr.cloud/webhook/elab-compile` | Compile fallback via n8n |
| Analytics | `https://andreamarro.app.n8n.cloud/webhook/elab-simulator-analytics` | Usage tracking |
| License | `https://n8n.srv1022317.hstgr.cloud/webhook/elab-license` | License verification |
| Admin | `https://n8n.srv1022317.hstgr.cloud/webhook/elab-admin` | Admin CRUD |

- PASS: All URLs configurable via environment variables with `.env` file -- `api.js:9-13`, `.env:1-33`
- PASS: Timeout configured at 30s (code default) / 60s (.env override) with AbortController -- `api.js:14, 127-128`
- PASS: Compile timeout at 65s (matches arduino-cli 60s timeout) -- `api.js:15`
- PASS: Compilation uses 3-tier fallback: standalone server -> n8n webhook -> local dev -- `api.js:511-534`

### Error Handling

- PASS: `friendlyError()` maps HTTP codes + network errors to child-friendly Italian messages -- `api.js:84-110`
- PASS: Empty response detection (`!responseText || responseText.trim() === ''`) -- `api.js:156, 235`
- PASS: JSON parse fallback -- if response is not JSON, use raw text -- `api.js:161-171, 241-249`
- PASS: Robust n8n response extraction -- handles array wrapping, nested objects, multiple key names (`output`, `text`, `response`, `message`) -- `api.js:254-272`
- PASS: Fallback to local RAG if n8n fails (only when LOCAL_API configured) -- `api.js:289-311`

### Reliability Concerns

- CRITICAL: **No retry logic for chat** -- if the first request fails, the user sees an error. The Tutor UI has a "retry" button but the Simulator's `handleAskGalileo` does not retry automatically. -- `api.js:286-318`
- WARNING: **Different n8n instances for chat vs analytics** -- chat goes to `n8n.srv1022317.hstgr.cloud` (Hostinger) while analytics goes to `andreamarro.app.n8n.cloud` (n8n Cloud). If one goes down, the other may still work, but this creates configuration complexity. -- `api.js:9` vs `AnalyticsWebhook.js:7`
- WARNING: **No health check** -- no endpoint ping before sending requests. Users get timeout errors with no pre-flight check. -- no health check code found
- WARNING: **Webhook URL hardcoded as fallback** in api.js:9 (`|| 'https://n8n.srv1022317.hstgr.cloud/webhook/galileo-chat'`). If env var is missing, production falls back to hardcoded URL. This is actually a safety net but obscures configuration issues.
- INFO: Analytics uses `navigator.sendBeacon()` for fire-and-forget reliability -- `AnalyticsWebhook.js:24-28`
- INFO: Compilation errors silently fall through (null returns trigger next fallback) -- `api.js:504-508`

---

## 4. Galileo Prompt Quality: 8/10

### Coverage

- **Vol1**: 39 galileoPrompts for ~38 experiments (one experiment may have a duplicate entry or the Elettropongo experiment has a prompt despite no breadboard) -- `experiments-vol1.js`
- **Vol2**: 18 galileoPrompts for 18 experiments -- **100% coverage** -- `experiments-vol2.js`
- **Vol3**: 13 galileoPrompts for 13 experiments (11 original + 2 extras) -- **100% coverage** -- `experiments-vol3.js`
- **Total**: 70 galileoPrompt fields across ~69 experiments -- effectively **100% coverage**

### Prompt Structure

Each galileoPrompt follows a consistent pattern:
```
"Sei Galileo, il tutor AI di ELAB. Lo studente sta guardando l'esperimento '[TITLE]'. [CONTEXT]. Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano."
```

- PASS: All prompts include role identity ("Sei Galileo") -- consistent persona
- PASS: Age-appropriate language instructions ("bambini di 8-12 anni") in every prompt
- PASS: Italian language instruction ("Rispondi in italiano") in every prompt
- PASS: Context-specific analogies (water flow for circuits, doors of different heights for LED voltage thresholds, etc.)
- PASS: Default fallback prompt generated when galileoPrompt is missing -- `NewElabSimulator.jsx:1176-1180`

### Safety in Prompts

- PASS: "LED senza resistore" experiment explicitly mentions danger ("perche' e' pericoloso: troppa corrente brucia il LED") -- `experiments-vol1.js:100`
- WARNING: **No explicit safety warnings** in the system prompt template for experiments involving high voltages or component damage. Safety context is embedded in individual galileoPrompts but there is no global safety preamble. A missed galileoPrompt would have the default fallback which has NO safety instructions.
- INFO: 7 experiments across vol1 data mention "brucia" or "pericol" in desc/galileoPrompt -- appropriate coverage for danger experiments

### Pedagogical Quality

- PASS: Prompts use Socratic method for detective games ("domanda socratica senza darmi la risposta") -- `CircuitDetective.jsx:79`
- PASS: CircuitReview prompts include structured output format with review questions for students -- `CircuitReview.jsx:45-70`
- PASS: Confusion check-in after 10 minutes ("Come ti senti? Qualcosa ti confonde?") -- `ContextualHints.jsx:88-93`
- PASS: Idle suggestions prioritize unvisited tools -- `ContextualHints.jsx:190-206`

---

## 5. Privacy / Compliance: 3/10

### Data Sent to n8n Webhooks

**Chat webhook receives**:
```json
{
  "message": "user's question",
  "sessionId": "s_<uuid>",
  "images": [{"base64": "...", "mimeType": "image/png"}]
}
```

**Analytics webhook receives**:
```json
{
  "event": "experiment_loaded",
  "timestamp": "2026-02-13T10:00:00Z",
  "sessionId": "sim-lz1abc-xyz123",
  "experimentId": "v1-cap6-esp1",
  "title": "...",
  "mode": "circuit"
}
```

### Findings

- CRITICAL: **No COPPA/GDPR compliance** -- zero references to COPPA, GDPR, privacy policy, parental consent, or data processing agreements anywhere in the codebase. This platform targets children 8-14 years old. Under COPPA (US) and GDPR Article 8 (EU), parental consent is required before collecting data from children under 13/16. -- grep for COPPA/GDPR returns 0 results
- CRITICAL: **No consent mechanism** -- analytics data is sent immediately on page load with no consent banner, no cookie notice, no opt-out. The `sendAnalyticsEvent` fires on `EXPERIMENT_LOADED` as soon as a user selects an experiment. -- `AnalyticsWebhook.js:14-42`
- CRITICAL: **Session IDs in localStorage** -- `galileo_session` persists across browser sessions indefinitely. On shared school computers, the next student inherits the session, potentially seeing the previous student's conversation context on the n8n side. -- `api.js:123-124`
- WARNING: **PII filter only on client side** -- `contentFilter.js` catches emails, phone numbers, fiscal codes, and addresses, but ONLY in the Tutor chat. The Simulator's `handleAskGalileo` bypasses content filtering entirely (sends galileoPrompt directly, not user-typed text). -- no `validateMessage` call in NES:1167-1238
- WARNING: **No data retention policy** -- no mention of how long n8n stores conversation data, session IDs, or analytics events
- WARNING: **Confusion logs stored in localStorage** (`elab_confusion_log`) -- stores timestamped emotional check-in responses from children locally. While not sent to server, this is sensitive data about minors' emotional state stored in the browser. -- `ContextualHints.jsx:256-268`
- PASS: Content filter blocks inappropriate language (Italian profanity, violence, drugs, adult content) -- `contentFilter.js:9-16`
- PASS: PII detection catches email, phone, fiscal code, street addresses -- `contentFilter.js:19-28`
- PASS: Analytics uses anonymous session IDs (no user identifiers, no names, no emails) -- `AnalyticsWebhook.js:47-53`
- PASS: Analytics is fire-and-forget with silent failure -- never breaks the app -- `AnalyticsWebhook.js:39-41`
- INFO: 9 analytics events tracked: EXPERIMENT_LOADED, SIMULATION_STARTED/PAUSED/RESET, COMPONENT_INTERACTED, CODE_VIEWED, SERIAL_USED, VOLUME_SELECTED, ERROR -- `AnalyticsWebhook.js:59-69`

---

## 6. Overall AI Integration: 5.5/10

### Scores Summary

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| AI Conversation UX | 5/10 | 20% | 1.0 |
| API Bridge Completeness | 7/10 | 15% | 1.05 |
| Webhook Reliability | 6/10 | 20% | 1.2 |
| Galileo Prompt Quality | 8/10 | 20% | 1.6 |
| Privacy / Compliance | 3/10 | 25% | 0.75 |
| **Overall** | **5.6/10** | 100% | **5.6** |

---

## Complete Findings Registry

### CRITICAL (5)

1. **No COPPA/GDPR compliance for children's data** -- No parental consent, no privacy policy, no data processing documentation. Platform targets children 8-14. -- entire codebase (0 references found)
2. **No consent mechanism for analytics** -- Data collection starts immediately with no opt-in/opt-out. -- `src/components/simulator/api/AnalyticsWebhook.js:14-42`
3. **Session IDs persist in localStorage** -- Shared school computers leak sessions between students. -- `src/services/api.js:123-124`
4. **No retry logic for chat requests** -- Single point of failure for AI responses in simulator context. -- `src/services/api.js:286-318`
5. **Simulator bypasses content filter** -- `handleAskGalileo` sends galileoPrompt directly without `validateMessage()`. Not exploitable since it uses pre-written prompts, but architecturally inconsistent. -- `src/components/simulator/NewElabSimulator.jsx:1167-1238`

### WARNING (8)

1. **One-shot Galileo in simulator** -- No follow-up questions, no custom input field. -- `src/components/simulator/panels/GalileoResponsePanel.jsx`
2. **Response vanishes on panel close** -- No persistence of Galileo explanations. -- `src/components/simulator/NewElabSimulator.jsx:2006`
3. **No markdown rendering in Galileo panel** -- AI response displayed as plain text. -- `src/components/simulator/panels/GalileoResponsePanel.jsx:39-41`
4. **No conversation history sent to AI** -- Each tutor message is independent; context depends on n8n session management. -- `src/services/api.js:217-221`
5. **Different n8n instances for different webhooks** -- Configuration complexity, partial outage risk. -- `api.js:9` vs `AnalyticsWebhook.js:7`
6. **No webhook health check** -- No pre-flight ping before sending requests. -- no health check code found
7. **`totalExperiments` hardcoded to 67** (actually 69). -- `src/services/simulator-api.js:305`
8. **Confusion logs stored locally** -- Timestamped emotional data from minors in localStorage. -- `src/utils/contentFilter.js` / `src/components/tutor/ContextualHints.jsx:256-268`

### PASS (25)

1. Galileo button with clear visual feedback and loading state -- `ControlBar.jsx:261-285`
2. Rate limiting (3/10s, 100/session) -- `api.js:29-79`
3. Content filtering for profanity, violence, PII -- `contentFilter.js:1-136`
4. Output sanitization -- `contentFilter.js:83-95`
5. Friendly error messages in Italian -- `api.js:84-110`
6. 3-tier compilation fallback -- `api.js:511-534`
7. Robust n8n response parsing (array, object, text) -- `api.js:254-272`
8. Local RAG fallback when n8n unreachable -- `api.js:289-311`
9. Screenshot capture for visual AI analysis -- `NES:1182-1216`
10. Graceful degradation without screenshot -- `NES:1213-1214`
11. `__ELAB_API` properly initialized with StrictMode guard -- `simulator-api.js:35-41`
12. All 12 API methods functional -- `simulator-api.js:58-337`
13. Galileo bridge (highlight, pin, serial, state) -- `simulator-api.js:257-307`
14. 5-event pub/sub system with error isolation -- `simulator-api.js:317-350`
15. 70 galileoPrompts for 69 experiments (~100% coverage) -- `experiments-vol1/2/3.js`
16. Age-appropriate prompt language in every galileoPrompt
17. Safety context in danger experiments -- `experiments-vol1.js:100`
18. Socratic method in detective game prompts -- `CircuitDetective.jsx:79`
19. Structured circuit generation prompts -- `CircuitReview.jsx:45-70`
20. Confusion check-in pedagogy -- `ContextualHints.jsx:88-93`
21. Smart idle suggestions prioritizing unvisited tools -- `ContextualHints.jsx:190-206`
22. Anonymous analytics (no PII) -- `AnalyticsWebhook.js:47-53`
23. Fire-and-forget analytics (never breaks app) -- `AnalyticsWebhook.js:39-41`
24. Environment variable configuration for all URLs -- `.env:1-33`
25. Retry button in tutor chat for failed messages -- `ElabTutorV4.jsx:1663-1666`

---

## Recommendations (Priority Order)

### P0 - Must Fix Before Public Launch

1. **Add COPPA/GDPR compliance**: Privacy policy page, parental consent flow, data processing agreement. Required by law for children under 13/16.
2. **Add analytics consent**: Cookie/analytics opt-in banner. No data collection until user (or parent) consents.
3. **Switch sessionId to sessionStorage**: Replace `localStorage.getItem('galileo_session')` with `sessionStorage` to prevent cross-student leakage on shared computers.

### P1 - Should Fix Soon

4. **Add markdown rendering to GalileoResponsePanel**: Use the existing SafeMarkdown component from tutor tools (`src/components/tutor/shared/SafeMarkdown`).
5. **Persist Galileo responses**: Store last response per experiment in sessionStorage so it survives panel close.
6. **Add custom question input to simulator Galileo panel**: Allow children to ask follow-up questions without switching to the tutor chat.
7. **Add retry logic to `sendChat()`**: Auto-retry once with exponential backoff before showing error.

### P2 - Nice to Have

8. **Send conversation history to n8n**: Include last 3-5 messages as context array for better multi-turn responses.
9. **Add webhook health check**: Ping `/health` endpoint on page load, show "Galileo offline" indicator.
10. **Fix `totalExperiments` count**: Change from 67 to 69 in simulator-api.js.
11. **Unify n8n instances**: Move analytics webhook to same n8n instance as chat.

---

*Report generated by AGENT-15 -- 2026-02-13*
*Files audited: 14 source files, 3 experiment data files, 1 env file, 1 vite config*
