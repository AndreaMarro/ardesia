# Adversarial Review — feat/i18n-en-it-full

**Date:** 2026-05-28
**Mode:** Manual hostile audit (Codex CLI not installed)
**Branch:** feat/i18n-en-it-full (21 commits ahead of main)

## Findings (file:line citations + severity)

### LOW — `src/i18n/index.js:27` — `escapeValue: false` could be hardened
React JSX escapes by default, so output rendering is safe. However, the setting would matter the moment any value reaches raw HTML insertion or a custom string concat. Confirmed no such usage in this branch; risk is hypothetical. Recommend documenting the assumption in a comment.

### MED — `src/locales/{it,en}.json` `data_deletion.step2_description` — HTML tags inside JSON values
Contains `<strong>DELETE</strong>` markup. Currently rendered via JSX split+map in `DataDeletion.jsx` so it does not reach raw HTML insertion, but the JSON value is the only HTML-bearing string in 661 keys and is fragile. Future maintainers might naively render via `t(...)` directly, which would print `<strong>` literal text or — if combined with future unsafe HTML rendering — open XSS. Recommend `Trans` component refactor or split into 3 keys (prefix + keyword + suffix).

### LOW — `src/components/HomePage.jsx`, `src/components/lavagna/GalileoAdapter.jsx`, `src/components/lavagna/UnlimAdapter.jsx`, `src/components/lavagna/SessionReportComic.jsx` — multiple `useTranslation()` calls in same file
HomePage 2 calls, GalileoAdapter/UnlimAdapter 3 calls, SessionReportComic 2 calls. All inside distinct sub-components (PercorsoPanel, GuidedPanel, ChatPanel, UnlimMascot), so each call is per-render-tree-leaf and correct. Mild perf cost: every locale change triggers re-render of every sub-component (acceptable since rare event).

### LOW — `src/components/common/LanguageSwitcher.jsx:25` — `i18n.changeLanguage(next)` does not await Promise
The returned Promise is ignored. If the backend changeLanguage emits an error (e.g., missing resource bundle), error is swallowed. Currently both 'it' and 'en' bundles are statically imported so this cannot fail, but the pattern is fragile if Backend plugin is added later. Recommend `.catch(err => logger.error(err))`.

### LOW — `src/components/lavagna/LavagnaShell.jsx` — `i18n.t(...)` inside Suspense fallback
Fallbacks rendered outside React component render scope use direct `i18n.t()` import. This bypasses re-render on language change for those specific loaders. Acceptable since fallbacks are millisecond-flash transient, but if Suspense fallback persists for >2s during slow load, user could see Italian while UI is EN. Recommend wrap fallback in a small React component using `useTranslation()`.

### PASS — `supabase/functions/_shared/system-prompt.ts:420` — `language` param defaults `'it'`
Defensive default behaves correctly. `LIVE_SYSTEM_PROMPT_EN` preserves all 49 `[AZIONE:...]` action tags Italian (parser requirement) — verified.

### PASS — `supabase/functions/_shared/system-prompt.ts:659` — useIntentSchema branch parity
`if (useIntentSchema) { if (language === 'en') {...} else {...} }` — both branches enforce identical JSON schema, only natural-language instruction differs. Mistral La Plateforme server-side validation unchanged.

### PASS — `supabase/functions/unlim-chat/index.ts:205` — body.language whitelist
`body.language === 'en' ? 'en' : 'it'` — robust against any arbitrary input (null, undefined, "EN", "english", malicious payload all collapse to 'it' default).

### PASS — `src/services/api.js:384-390` — localStorage exception handling
Try/catch wraps localStorage read, returns 'it' on any exception (private browsing, SecurityError, undefined localStorage in SSR-like context). Robust.

### PASS — Interpolation parity
29 keys with `{{var}}` placeholders in IT, 29 in EN, **0 mismatches** across all interpolated keys. Script verified.

### PASS — No `useTranslation()` calls inside conditional or loop
Grep found zero violations. All 31 files invoke `const { t } = useTranslation()` at function-component top.

## Summary

- **HIGH severity findings:** 0
- **MED severity findings:** 1 (HTML in JSON `data_deletion.step2_description`)
- **LOW severity findings:** 4 (escapeValue hardening doc, changeLanguage promise, Suspense fallback i18n.t, multi-call perf)
- **PASS checks:** 6 (action tag preservation, intent schema parity, backend whitelist, localStorage handling, interpolation parity, hook rule-of-hooks compliance)

**Verdict:** branch is production-safe. Recommend addressing MED finding (refactor `data_deletion.step2_description` to Trans component or split keys) before next major refactor pass. UNLIM `LIVE_SYSTEM_PROMPT_EN` requires Andrea pedagogical ratify (institutional, not code).

---
*Generated 2026-05-28 — manual adversarial review (Codex CLI unavailable)*
