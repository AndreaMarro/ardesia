# ELAB Tutor — Full IT/EN i18n Design Spec

**Date:** 2026-05-28
**Author:** Andrea Marro + Claude (brainstorming session)
**Status:** Draft — pending Andrea ratify
**Scope:** Make ELAB Tutor site **fully usable in both Italian and English**. UNLIM tutor tuned per-locale. Foundation for future multilingua (DE/ES later).

---

## 1. Goal & Non-Goals

### Goal
Both Italian and English fully functional end-to-end across the entire site:
- Every UI string translatable, no hardcoded strings remain in user-visible surfaces.
- UNLIM tutor responds in user's chosen language with locale-tuned system prompt (not word-for-word translation).
- RAG retrieval works for English queries against Italian source chunks (query-translate at runtime).
- Language switcher in UI, user choice persisted (Supabase + localStorage).
- Italian remains default locale; missing-key fallback always Italian.

### Non-Goals (this iteration)
- German / Spanish locales (deferred — `locales/de.json` and `es.json` exist as stubs but stay untranslated).
- Translating physical Volume PDF manuals (English manuals do **not** exist in Volume 3 repo — only Italian Vol 1/Vol 2/Vol 3 PDFs found in `VOLUMI pdf e MD/`). Manual content stays Italian; the digital app wraps Italian source with English UI + English UNLIM responses.
- Right-to-left languages.
- Per-locale image/asset swaps (kit photos labeled in Italian stay as-is unless trivial caption swap).
- Re-embedding RAG chunks with a multilingual embedding model.

---

## 2. Locked Decisions (from Andrea brainstorm)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | EN/IT toggle, **IT default** | Italian is canonical, Omaric/Giovanni demos remain Italian-first |
| D2 | UNLIM system prompt **re-tuned per locale** (not translated) | Preserve pedagogical voice (linguaggio docente/classe, Principio Zero, plurale). English version writes a parallel idiomatic prompt |
| D3 | RAG strategy: **query-translate at runtime + IT chunks → EN response** | Zero re-embedding cost. ~200ms overhead per English query. Honest: source material is Italian, UNLIM response is perfect English |
| D4 | i18n library: **react-i18next** | Industry standard, `useTranslation()` hook, lazy-load, `fallbackLng: 'it'` safety net |
| D5 | Rollout: **phased layered** with each phase gated by Andrea ratify | Incremental risk, easy revert per phase |

---

## 3. Architecture

### 3.1 Frontend layers

```
src/
├── i18n/
│   ├── index.js                ← react-i18next init (NEW)
│   ├── blockly-msg-it.js       ← existing, untouched
│   └── blockly-msg-en.js       ← NEW (Blockly EN message overrides)
├── locales/
│   ├── it.json                 ← existing, audit + expand to ~500+ keys
│   ├── en.json                 ← existing, audit + expand mirror IT
│   ├── de.json                 ← stays stub
│   └── es.json                 ← stays stub
├── components/
│   ├── common/
│   │   └── LanguageSwitcher.jsx ← NEW (top-right header dropdown IT/EN flag)
│   └── ...                      ← incrementally migrate hardcoded strings → t('key')
├── context/
│   └── LanguageContext.jsx     ← NEW or extend AuthContext with `locale` field
└── App.jsx                     ← wrap with <I18nextProvider>
```

### 3.2 Backend (Supabase Edge Functions)

```
supabase/functions/unlim-chat/
├── index.ts                    ← already accepts `language: 'it'` param. Extend to 'en'.
├── prompts/
│   ├── system-prompt-it.ts     ← extract existing IT prompt into module (NEW file, content existed inline)
│   └── system-prompt-en.ts     ← NEW (Andrea-authored parallel English prompt)
└── ragQuery.ts                 ← NEW translate helper: if lang=en, translate user query → IT before vector search
```

### 3.3 Data flow — English user chat turn

```
User (EN) types: "How does a pull-down resistor work?"
        │
        ▼
[frontend] → unlim-chat Edge Function
        ▼
{ message: "How does...", language: 'en', ... }
        ▼
ragQuery.ts: translate query "How does a pull-down resistor work?" → "Come funziona una resistenza pull-down?"
   (via Gemini Flash-Lite, single-shot translation, ~80 tokens, ~150ms)
        ▼
pgvector similarity search on rag_chunks (Italian) → top-K Italian chunks
        ▼
LLM call (Gemini Flash):
   system = system-prompt-en.ts (English voice, locale rules)
   context = top-K Italian chunks (verbatim — LLM reads IT fine)
   user = "How does a pull-down resistor work?"
   instruction = "Respond in fluent English. Cite Volume/page in English (Vol 2 p. 47)."
        ▼
Response: perfect English, ~120 words, with Vol/page citations Italian source.
```

---

## 4. Components — phased rollout

### Phase 0 — Foundation (~3-4h) — single PR
- [ ] Install `react-i18next` + `i18next` + `i18next-browser-languagedetector`.
- [ ] Create `src/i18n/index.js` with config: resources from `locales/*.json`, `fallbackLng: 'it'`, detection from localStorage→browser→default `it`.
- [ ] Wrap `App.jsx` with `<I18nextProvider i18n={i18n}>`.
- [ ] Audit existing `locales/it.json` + `en.json`: currently 120 lines each, expand to cover Phase 1 surfaces (~250-300 keys).
- [ ] Create `LanguageSwitcher.jsx`: top-right of `AppHeader`, IT/EN flag icons, click → `i18n.changeLanguage()` + persist to localStorage + (if authenticated) Supabase user preference.
- [ ] Extend `users` Supabase table with `preferred_language` column (text, default 'it').
- [ ] Write `system-prompt-en.ts` (Andrea reviews — pedagogical voice preserved).
- [ ] Wire `unlim-chat` to load EN prompt when `language === 'en'`.
- [ ] Add `ragQuery.ts` translate helper (Gemini Flash-Lite, prompt: "Translate user query to Italian, preserve technical terms, output only translated query no preamble").

**Phase 0 gate (Andrea ratify):** language switcher works, UNLIM responds in English with proper voice + Vol/page citations, IT mode completely unchanged.

### Phase 1 — High-traffic surfaces (~6-8h)
Target components (~10 files):
- `HomePage.jsx` (hero, cards, footer)
- `AppHeader.jsx` (already mounts switcher in Phase 0; migrate remaining labels)
- `LavagnaShell.jsx` + `FloatingToolbar.jsx`
- `ChatOverlay.jsx` / `GalileoAdapter.jsx` (UNLIM chat UI labels — buttons, placeholders, error toasts)
- `LoginPage.jsx` + `RegisterPage.jsx` + `WelcomePage.jsx`
- `ConsentBanner.jsx`
- `Toast.jsx` (error/success messages)

Each component: replace hardcoded Italian → `useTranslation()` + `t('namespace.key')`. New keys added to both `it.json` + `en.json` simultaneously.

**Phase 1 gate:** Playwright IT smoke pass + EN smoke pass. Both flows: homepage → login → lavagna → UNLIM question → response.

### Phase 2 — Volumi / Lezioni / Glossario (~4-6h)
- `VolumeReader.jsx` / `LessonPath.jsx` / `BuildModeGuide.jsx`
- `Glossario.jsx` (61 Italian terms — note: glossary **content** stays Italian for volumes 1-3 source fidelity, but **UI chrome** translatable: filters, search, navigation)
- `Onboarding3Click.jsx`

**Phase 2 gate:** Andrea Playwright ratify per usual.

### Phase 3 — Admin + Student/Teacher Dashboard + peripheral (~6-8h)
- `AdminPage.jsx` + tabs (AdminCorsi, AdminWaitlist, ...)
- `StudentDashboard.jsx` + `TeacherDashboard.jsx`
- ~30 remaining components from the 76 Italian-hardcoded list

**Phase 3 gate:** Full IT/EN regression Playwright; zero hardcoded Italian strings in user-visible surfaces (grep CI gate).

---

## 5. UNLIM English System Prompt — content rules

Translation philosophy: parallel, not literal. Italian-original rules preserved with English idiom:

| IT concept | EN equivalent | Note |
|------------|---------------|------|
| "Linguaggio docente/classe, plurale" | "Teacher voice, addressing the class (plural 'you all' / 'let's')" | Use inclusive "let's" + "we" frequently |
| "Principio Zero" (no jargon, simple words first) | "Zero Principle: explain simply, jargon only after analogy" | Keep concept name capitalized as proper noun |
| "Citation: Vol 2 pag. 47" | "Citation: Vol 2 p. 47" | Format: `Vol N p. X` |
| "Massimo 120 parole" | "Max 120 words" | Same word budget |
| Analogies optional | Analogies optional | Same rule |
| Italian colloquialisms ("ragazzi", "andiamo") | English equivalents ("everyone", "let's go") | Avoid stiff "students" |

The English prompt is **authored** (not auto-translated). Andrea reviews before deploy.

---

## 6. Testing

### 6.1 Unit
- New: `LanguageSwitcher.test.jsx` — toggle, persist, restore.
- New: `i18n.test.js` — fallback behavior, missing key returns IT, lazy load works.
- Update: vitest snapshots of migrated components (snapshots will change — accept).

### 6.2 Integration
- `unlim-chat` Edge Function: 4 test queries × 2 languages (8 calls), assert response language matches request + RAG citation present.

### 6.3 E2E (Playwright)
- IT smoke: full happy path (already exists, must keep passing).
- EN smoke (NEW): set localStorage `i18nextLng=en`, navigate homepage → login → lavagna → ask UNLIM "What is Ohm's law?" → assert English response + Vol/page citation present.
- Language switcher: load IT, click EN, verify all visible strings switch, click back, verify reverts.

### 6.4 Regression CI gate (Phase 3 close)
- Grep gate: `grep -rE "(Lavagna|Simulatore|Inizia|Accedi|Esci|...)" src/components --include="*.jsx" -l` returns zero files. CI fails otherwise. Whitelist for code comments via `// i18n-ignore` marker.

---

## 7. Error Handling

- Missing translation key → react-i18next fallback chain `en → it`. Console warning in dev, silent in prod.
- Query translate (RAG) failure → fallback: send English query directly to pgvector (cross-lingual embeddings have partial English coverage in multilingual-e5 baseline), log warning.
- Edge function unreachable → existing offline-mode banner already covers (no new error path).
- localStorage write fail (private browsing) → in-memory state only, switcher works for session, doesn't persist.

---

## 8. Open Questions for Andrea (require answer before Plan)

1. **English UNLIM prompt authorship:** want me to draft v1 for your review, or you write the master? (default: I draft, you redline)
2. **Language switcher placement:** top-right of `AppHeader` next to `#admin` shortcut, OR dropdown inside profile menu? (default: top-right header, always visible)
3. **Glossario term content:** Italian-only forever (vol fidelity), OR add English translations field per term over time? (default: Italian-only this iteration; English column reserved future)
4. **Phase ordering acceptable?** Phase 1 = HomePage + Lavagna + UNLIM + auth. Then Volumi. Then admin. (default: yes, as listed)

---

## 9. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Mid-migration mixed-language UI confuses users | High | `fallbackLng: 'it'` means EN missing keys → IT shown, never blank/broken. Phase 1 covers high-traffic so most users never see mixed. |
| English UNLIM prompt drifts from Italian quality | Medium | Andrea ratifies prompt before deploy. Test gold-set EN variants added Phase 1 gate. |
| Query-translate adds 200ms latency | Low | Cached: identical English query → cached IT translation 24h TTL. |
| Italian regressions during migration | High | Each phase Playwright IT smoke must pass — same as EN. No phase merges if IT breaks. |
| `locales/it.json` and `en.json` drift (key missing in one) | Medium | CI script: diff key sets, fail if asymmetric. |

---

## 10. Deliverables

| Deliverable | Phase | Owner |
|------------|-------|-------|
| `src/i18n/index.js` + provider wired | 0 | Claude |
| `LanguageSwitcher.jsx` + Supabase column | 0 | Claude |
| `system-prompt-en.ts` v1 | 0 | Claude drafts, Andrea ratifies |
| `ragQuery.ts` translate helper | 0 | Claude |
| `locales/{it,en}.json` Phase 1 coverage (~250 keys) | 1 | Claude |
| HomePage/Lavagna/UNLIM/Auth migrated | 1 | Claude |
| Playwright EN smoke | 1 | Claude |
| Volumi/Lezioni/Glossario migrated | 2 | Claude |
| Admin/Dashboard/peripheral migrated | 3 | Claude |
| Grep CI gate active | 3 | Claude |

---

## 11. Memory Reference

Saved: `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/multilingua-roadmap.md` — site progressively multilingua, English first, Italian source-of-truth, RAG query-translate strategy locked.
