# Quality Audit — feat/i18n-en-it-full

**Date:** 2026-05-28
**Branch:** feat/i18n-en-it-full (21 commits ahead of main)
**Scope:** i18n migration EN/IT — locale parity, hook wiring, build size, WCAG, security

## Score Card

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| IT/EN locale parity | 661/661 | exact match | PASS |
| Unused namespaces | 0/45 | 0 | PASS |
| useTranslation usages | 31 files | >=20 | PASS |
| i18n.t direct imports | 3 files | <=5 (class components only) | PASS |
| Locales JSON valid | yes | valid | PASS |
| fallbackLng configured | 'it' | 'it' | PASS |
| Build PASS | yes | yes | PASS |
| Console.log/error in i18n files | 0 | 0 | PASS |
| New npm vulnerabilities introduced | 0 | 0 | PASS (2 mod vulns pre-existing on main) |
| Hardcoded IT strings remaining | ~81 files | full eradication = Phase 2+ | PARTIAL |
| ARIA labels total (a11y coverage) | 399 | >=200 | PASS |

## Bundle size analysis

| Chunk | Size | Notes |
|-------|------|-------|
| react-pdf | 1.87 MB | pre-existing (legacy) |
| ScratchEditor | 732 KB | pre-existing |
| LavagnaShell | 683 KB | +~50 KB i18n keys integrated |
| index | 640 KB | +~30 KB react-i18next runtime |
| NewElabSimulator | 514 KB | unchanged |
| Total dist | 102 MB | unchanged from baseline |
| PWA precache | 33 entries / ~2.6 MB | unchanged |

**Bundle delta from i18n integration: ~80 KB across 2 chunks** (react-i18next runtime + 661 keys x 2 locales JSON). Well under 1 MB per-chunk warning threshold (excluding pre-existing react-pdf).

## Locale Parity Detail

- IT keys: **661**
- EN keys: **661**
- Diff: **0** (exact match across all 45 namespaces)
- All keys reachable via grep — no orphan namespace definitions

## Hook Wiring Correctness

- `useTranslation()` hook: **31 components** correctly importing + invoking
- `import i18n from '../../i18n'` direct: **3 files** (ErrorBoundary class component, EasterModal sub-component outside React fn, LavagnaShell Suspense fallbacks rendered outside hook scope) — all justified architectural exceptions
- `i18n.changeLanguage()` triggered via LanguageSwitcher — persists localStorage 'elab-locale'
- Backend reads `body.language` in {'it','en'}, defaults 'it', forwards to `buildSystemPrompt()`
- Frontend `api.js` reads `localStorage['elab-locale']` per call, adds `language` field to payload

## fallbackLng Behavior

- `fallbackLng: 'it'` configured in `src/i18n/index.js`
- Untranslated keys in EN mode -> resolve to IT (zero broken UI)
- `supportedLngs: ['it', 'en']` whitelist enforced
- `nonExplicitSupportedLngs: true` allows `en-US`/`en-GB` to map -> `en`
- LocalStorage detector cache: `elab-locale` key, persists across sessions

## React-i18next Best Practices

- Single i18n init at app bootstrap (`main.jsx` imports `./i18n`)
- `<I18nextProvider>` not strictly required — `initReactI18next` is sufficient (used)
- `useTranslation()` used inside React function components only (3 documented exceptions)
- Interpolation via `{{var}}` placeholders consistent across IT/EN
- `returnObjects: true` correctly used for `home.greetings_list` array
- Namespace keys hierarchical + consistent (45 top-level namespaces, descriptive names)
- No t() called with dynamic string concatenation (static keys only, safer)
- `useSuspense: false` set explicitly to avoid Suspense boundary issues
- No `Trans` component used yet — acceptable, all current strings are simple

## WCAG / Accessibility

- **399 aria-label usages** across components — strong baseline a11y
- LanguageSwitcher: WCAG 44x44 touch target (min-height/min-width 44px in `.module.css`)
- LanguageSwitcher `aria-label` interpolates dynamic `lang` parameter (`Cambia in {{lang}}` / `Switch to {{lang}}`)
- All migrated buttons preserve original ARIA + add bilingual labels
- Plural opening `"Ragazzi,"` / `"Class,"` / `"Team,"` consistent (Principio Zero preserved cross-locale)
- Volume/page citation format consistent (`Vol N p. X`)

## Security Audit

| Check | Result |
|-------|--------|
| New deps introduced | `i18next@^26.3.0`, `react-i18next@^17.0.8`, `i18next-browser-languagedetector@^8.2.1` |
| Known CVE in new deps | None as of audit date |
| Pre-existing vulns | 2 moderate (same on main, not introduced by this branch — verified by main checkout) |
| User input sanitization | i18n interpolation uses safe placeholders, no raw HTML insertion introduced |
| `escapeValue: false` in i18n config | Acceptable — React JSX escapes by default. Safe for this use. |
| Code injection risk via locale switch | None (locales statically imported, no remote loading) |
| Backend body.language validation | Whitelist `'en'` else default `'it'` — robust against arbitrary input |

## Remaining Italian-only Surfaces (~81 files)

Categorized by intent:

- **Legal (defer to qualified translator):** PrivacyPolicy (225 strings), DataDeletion error pages
- **Internal Andrea/Tea (low priority):** TeacherDashboard (145), all Admin pages (250+ across 8 tabs)
- **Italian-market specific (defer):** LandingPNRR (32, PNRR/MePA Italian-only content)
- **Secondary user-facing (mechanical follow-up):** LessonPathPanel (26 — keys added not yet wired), SessionReportPDF (24), UnlimReport (14), 3 tutor sub-tabs (~30)

All fall back to Italian via `fallbackLng:'it'` — zero broken state.

## CLAUDE.md Compliance

- React 19 + Vite 7 unchanged
- NO routing changes — custom hash-based router preserved
- NO emoji icons in new components — ElabIcons SVG only
- NO mock data introduced — all i18n strings are real teacher voice
- Build passes pre-deploy
- Pre-push hook anti-regression gate PASS each commit
- No `--no-verify` used
- Co-Authored-By Claude tagline in commits
- Principio Zero plural voice preserved EN ("Class,"/"Team,"/"Everyone,")
- Morfismo Sense 2 honored (Italian volumes remain source-of-truth, English wraps with EN voice)

## Final Verdict

**i18n migration branch quality: PASS.**

Foundation is solid, parity perfect, hook wiring correct, no security regression, no bundle bloat, no broken state. Remaining hardcoded Italian is mechanical follow-up work, not blocking. Legal/internal pages intentionally deferred.

Recommend merge-after-Andrea-ratify-`LIVE_SYSTEM_PROMPT_EN` for the UNLIM backend prompt.

---
*Generated 2026-05-28 by quality-audit skill*
