# TEAM 7 — Security & Compliance — Heartbeat
**Timestamp**: 2026-02-13
**Status**: COMPLETED
**Build**: PASSES (555 modules, 41.55s)

## Changes Made

### 1. ConsentBanner Fix (ConsentBanner.jsx)
- Unified consent key: `elab_consent` with values `'accepted'` / `'rejected'`
- Removed dependency on `setAnalyticsConsent` import from AnalyticsWebhook
- Banner writes directly to localStorage with clear values
- Banner does NOT show again once a choice is made (checks `stored === null`)
- Privacy link changed from modal button to `<a href="/privacy">` link
- Removed unused PrivacyPolicy modal import

### 2. AnalyticsWebhook Fix (AnalyticsWebhook.js)
- Consent key unified to `elab_consent` (was `elab_analytics_consent`)
- `hasAnalyticsConsent()` now checks `=== 'accepted'` (was `=== 'true'`)
- Removed `setAnalyticsConsent()` function (no longer needed, ConsentBanner writes directly)
- `sendAnalyticsEvent()` still gates on `hasAnalyticsConsent()` at line 1 — rejecting cookies ACTUALLY blocks all analytics

### 3. PrivacyPolicy Route (PrivacyPolicy.jsx + App.jsx)
- PrivacyPolicy is now dual-mode: full page (no `onClose` prop) or modal (with `onClose`)
- Full page renders at `/privacy` with centered card on light background
- Added comprehensive GDPR content in Italian:
  - What data IS collected (analytics events, Galileo chat messages)
  - What data is NOT collected (no personal data, no tracking cookies)
  - Contact: info@elabproject.com
  - GDPR rights: access, rectification, deletion, portability, opposition
  - Age disclaimer: "bambini di 8-14 anni sotto supervisione"
  - Footer: "Andrea Marro -- 2026"
  - "Torna alla Home" link
- App.jsx: added `isPrivacyPage` check (hooks-safe, before early return)
- No react-router needed — uses `window.location.pathname`

### 4. Error Handling (api.js + simulator-api.js)
- Removed 7 `console.log` calls that leaked raw response data / internal URLs
- Removed 2 `console.error` calls that leaked stack traces
- Removed 1 `console.warn` with error details in compile fallback
- All user-facing errors now go through `friendlyError()` — Italian messages only
- Compile error: "Il compilatore non risponde. Verifica la connessione internet e riprova."
- simulator-api.js: silenced screenshot and event handler errors

### 5. Galileo Content Moderation (api.js)
- Added `BLOCKED_PATTERNS` array with 4 regex categories:
  - Italian profanity (partial patterns to catch variants)
  - Violence keywords
  - Personal info requests (phone, address, password, credit card, codice fiscale)
  - Adult content keywords
- `isMessageBlocked()` checks all patterns
- Blocked messages return a gentle redirect: "Galileo e qui per aiutarti con l'elettronica!"
- Filter runs BEFORE any network call (no data leaves the browser)

### 6. Rate Limiting Visual (api.js)
- Completely rewritten `checkRateLimit()`:
  - 3-second minimum interval: "Aspetta qualche secondo..."
  - 10 messages per minute: "Facciamo una pausa! Riprova tra un minuto."
  - Uses sessionStorage for minute counters (resets on tab close)
  - Returns `{ allowed, message, waitMs }` for UI integration

## localStorage Audit
**Keys in owned files:**
- `elab_consent` (ConsentBanner) — PERSISTENT (user preference, must survive sessions)
- `elab_analytics_consent` — DEPRECATED (was old key, now `elab_consent`)
- Rate limiting — SESSIONSTORAGE (elab_rate_minute, elab_rate_minute_start)

**Outside ownership (noted, not modified):**
- `elab_session_log` in ElabTutorV4.jsx — SHOULD be sessionStorage (session data on school computers)
  - Requires change in tutor file which is outside Team 7 ownership
  - Recommendation: Team that owns ElabTutorV4.jsx should change SESSION_LOG_KEY to use sessionStorage

## Files Modified
1. `src/components/common/ConsentBanner.jsx`
2. `src/components/common/PrivacyPolicy.jsx`
3. `src/components/simulator/api/AnalyticsWebhook.js`
4. `src/services/api.js`
5. `src/services/simulator-api.js`
6. `src/App.jsx`

## Files NOT Modified (as required)
- No simulator components
- No engine files
- No tutor components (except ConsentBanner/PrivacyPolicy)
- No CSS files
- No experiments files
