# CLAUDE.md Quality Report — Post i18n Migration

## Summary

- Files reviewed: 1 (project root `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/CLAUDE.md`)
- Score: **78/100 (Grade B)** — comprehensive but stale on i18n
- Status: needs targeted insertions reflecting feat/i18n-en-it-full delivery

## Quality Assessment

| Criterion | Score | Notes |
|-----------|-------|-------|
| Commands/workflows | 18/20 | All build/test/deploy documented |
| Architecture clarity | 19/20 | Sense 1/1.5/2 Morfismo extensively documented |
| Non-obvious patterns | 14/15 | Narrative arc, NeverGalileo rule, Principio Zero captured |
| Conciseness | 10/15 | 211+ lines (warns at 200 limit per session reminder) |
| Currency | 11/15 | Missing entire i18n stack added 2026-05-28 |
| Actionability | 13/15 | Mostly actionable, missing locale workflow |

**Top issues:**

1. **No mention of react-i18next stack** — installed deps not in "Stack tecnico" table
2. **Principio Zero documented Italian-only** — EN plural equivalent ("Class,") not codified, despite migration completion
3. **Tutor name immutable rule** mentions only IT — not extended to clarify EN behavior
4. **No bilingual mandate** — risk new components added hardcoded Italian, bypassing migration
5. **No locale parity gate documented** — implicit but not made immutable rule
6. **Missing link to spec doc** `docs/superpowers/specs/2026-05-28-english-i18n-design.md`
7. **No mention of `LIVE_SYSTEM_PROMPT_EN`** + Andrea pedagogical ratify gate

## Recommended Diff Patches

### Patch 1 — Add i18n stack to "Stack tecnico" section

**Why:** Documents installed deps so future agents don't reintroduce them or use a different library.

```diff
## Stack tecnico
- React 19 + Vite 7 (NO react-router — routing custom con useState e hash)
+ React 19 + Vite 7 (NO react-router — routing custom con useState e hash)
+ **i18n stack**: react-i18next 17 + i18next 26 + i18next-browser-languagedetector 8
+   - Config: `src/i18n/index.js` (fallbackLng:'it', supportedLngs:['it','en'], cache localStorage 'elab-locale')
+   - Locales: `src/locales/{it,en}.json` (661+ keys, parity MANDATORY)
+   - Pattern: `useTranslation()` hook + `t('namespace.key')` calls
+   - 3 documented exceptions use `import i18n` direct (class components, render-outside-React-fn)
- Vitest — **baseline**: unica fonte di verità `automa/baseline-tests.txt`
+ Vitest — **baseline**: unica fonte di verità `automa/baseline-tests.txt`
```

### Patch 2 — Extend Principio Zero with EN voice equivalent

**Why:** Migration shipped Principio Zero across locales. Future docs/teachers need explicit EN voice rule, otherwise EN responses drift from teacher-voice pattern.

```diff
### 1. PRINCIPIO ZERO (la regola pedagogica)

**Il docente e il tramite. UNLIM e lo strumento del docente. Gli studenti lavorano sui kit fisici ELAB.**
...
- Il linguaggio di UNLIM NON e rivolto direttamente all'insegnante come "fai questo" — deve fargli CAPIRE cosa fare e cosa dire ai ragazzi, usando le stesse parole del libro
+ Il linguaggio di UNLIM NON e rivolto direttamente all'insegnante come "fai questo" — deve fargli CAPIRE cosa fare e cosa dire ai ragazzi, usando le stesse parole del libro
+
+ **Principio Zero cross-locale (post i18n migration 2026-05-28):**
+ - IT plural opener: **"Ragazzi,"** OBBLIGATORIO
+ - EN plural opener: **"Class,"** / **"Team,"** / **"Everyone,"** — equivalente funzionale (preserva teacher voice, evita "student-direct")
+ - Inglese: NEVER "you" singular addressing one student — usa inclusive "let's", "we"
+ - Citazione volumi: IT `Vol.N pag.M`, EN `Vol N p. M`
+ - Manuali source-of-truth: Italian (Morfismo Sense 2). EN drafts in `VOLUMI pdf e MD/MANUALE VOLUME {1,2,3} ENGLISH/markdown.md`
+ - UNLIM EN system prompt: `LIVE_SYSTEM_PROMPT_EN` in `supabase/functions/_shared/system-prompt.ts` — **v0 DRAFT, Andrea ratify required pre-prod**
```

### Patch 3 — Add bilingual UI mandate to "Regole immutabili"

**Why:** Prevents future devs from naively writing `<h2>Ciao Ragazzi!</h2>` and bypassing i18n. Make it an immutable rule.

```diff
### Tecniche
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. Scala SVG: NanoR4Board SCALE=1.8
3. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
4. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
5. `.trim()` su TUTTE le letture di env var (bug Vercel trailing \n)
+ 6. **i18n MANDATORY**: ogni nuovo componente UI text DEVE usare `useTranslation()` + `t('key')`. MAI hardcode stringhe italiane in JSX (regola post 2026-05-28).
+ 7. **Locale parity GATE**: ogni modifica a `src/locales/{it,en}.json` DEVE mantenere parity esatta (stesso numero + path identici). Run check: `python3 scripts/check-locale-parity.py` pre-commit.

### Qualita'
- 6. `npm run build` deve passare prima di ogni deploy
+ 8. `npm run build` deve passare prima di ogni deploy
- 7. `npx vitest run` deve passare prima di ogni commit
+ 9. `npx vitest run` deve passare prima di ogni commit
...
```

(re-number subsequent rules accordingly)

### Patch 4 — Update UNLIM AI section with bilingual

**Why:** Existing UNLIM section documents IT-only. Add EN behavior to prevent future agent confusion.

```diff
## UNLIM AI (nome corretto, NON Galileo)
- **RAG**: 549 chunk in `src/data/rag-chunks.json` (volumi + glossario + FAQ + errori + analogie + codice)
- **KB**: `src/data/unlim-knowledge-base.js` → `searchKnowledgeBase()` + `searchRAGChunks()`
+ **Bilingual (post 2026-05-28)**: Accetta `language` ∈ {'it','en'} via body. Default 'it'. EN selects `LIVE_SYSTEM_PROMPT_EN` parallel prompt.
+ **System prompts**: IT `LIVE_SYSTEM_PROMPT` (verbatim Italian invariant) + EN `LIVE_SYSTEM_PROMPT_EN` (v0 DRAFT) in `supabase/functions/_shared/system-prompt.ts`.
+ **Action tags IMMUTABLE**: always `[AZIONE:...]` italian — parser whitelist case-insensitive italian only. EN responses keep tags Italian.
+ **RAG cross-language**: Italian chunks unchanged. EN queries: LLM reads IT chunks, responds EN (Gemini multilingual). Optional Phase 2: query-translate helper.
```

### Patch 5 — Reference spec doc + state of migration

**Why:** Documents recent major delivery. New agents reading CLAUDE.md need to know migration shipped.

```diff
## Sprint history archive

Storia completa iter 3-82 (Sprint S/T/U close logs, ~3500 righe) archiviata in [docs/sprint-history-iter3-82-archive.md](docs/sprint-history-iter3-82-archive.md) — Fase 3 riconciliazione doc 2026-05-20.
+
+ ## i18n EN/IT Migration (2026-05-28)
+
+ Branch `feat/i18n-en-it-full` (21 commits) shipped:
+ - Foundation: react-i18next + LanguageSwitcher (HomePage top-right + Lavagna AppHeader)
+ - 661 IT/EN parity keys, 31 components migrated bilingual end-to-end
+ - User-facing surfaces COMPLETE: WelcomePage, Login/Register, ConsentBanner GDPR/COPPA, DataDeletion, HomePage (cards/footer/greetings/Suspense), Lavagna AppHeader/FloatingToolbar/GalileoAdapter+UnlimAdapter/UnlimBar/DocenteSidebar/VolumeViewer/VideoFloat/ExperimentPicker/PercorsoCapitoloView/SessionReportComic/LavagnaShell, StudentDashboard, ManualTab, VideosTab, NewElabSimulator shell, ErrorBoundary
+ - English manual drafts: `VOLUMI pdf e MD/MANUALE VOLUME {1,2,3} ENGLISH/markdown.md` (714 lines, qualified translator review needed for print)
+ - UNLIM backend: per-locale prompt selection + frontend `api.js` forwards `localStorage['elab-locale']`
+ - Spec: `docs/superpowers/specs/2026-05-28-english-i18n-design.md`
+ - Quality audit: `.team-status/QUALITY-AUDIT-i18n-2026-05-28.md`
+ - Adversarial review: `.team-status/ADVERSARIAL-REVIEW-i18n-2026-05-28.md`
+
+ **Deferred (Phase 2+):**
+ - TeacherDashboard 145 strings (internal use)
+ - PrivacyPolicy 225 strings (legal — qualified translator only)
+ - LandingPNRR 32 strings (PNRR/MePA Italian-market specific)
+ - Admin pages 250+ strings (internal Andrea/Tea workflow)
+ - LessonPathPanel 26 (keys added, wiring pending)
+ - Supabase `users.preferred_language` column (Andrea ratify migration)
+ - `LIVE_SYSTEM_PROMPT_EN` Andrea pedagogical ratify pre-prod
+
+ **Roadmap multilingua:** memory file `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/multilingua-roadmap.md`. Stub locales `de.json` + `es.json` exist orphan, deferred indefinitely.
```

### Patch 6 — Add locale-add workflow to "Aree dove si puo' lavorare liberamente"

**Why:** Daily i18n workflow needs documented entry point.

```diff
## Aree dove si puo' lavorare liberamente
- `src/components/lavagna/` — Redesign lavagna (in corso)
- `src/components/unlim/` — UNLIM mode UI (chat, mascotte, voice)
+ - `src/locales/{it,en}.json` — i18n keys (parity MANDATORY)
+   - Add key: edit BOTH it.json AND en.json at same JSON path
+   - Verify: `python3 -c "import json; k=lambda o,p='': [f'{p}.{kk}' if p else kk for kk,v in o.items() if not isinstance(v,dict)] + [x for kk,v in o.items() if isinstance(v,dict) for x in k(v,f'{p}.{kk}' if p else kk)]; ik=set(k(json.load(open('src/locales/it.json')))); ek=set(k(json.load(open('src/locales/en.json')))); assert ik==ek; print(f'OK {len(ik)}')"`
```

## Recommended Apply Order

1. **Patch 1** (i18n stack) — minimum disruption, additive
2. **Patch 5** (spec ref + migration state) — informational addition at end
3. **Patch 2** (Principio Zero EN voice) — extends existing principle
4. **Patch 3** (immutable rules + renumber) — most invasive, requires renumbering
5. **Patch 4** (UNLIM bilingual) — additive
6. **Patch 6** (locale workflow) — additive

## Final notes

CLAUDE.md already past 200-line soft limit (per session reminder). All 6 patches add ~40 lines net. Consider:
- Moving i18n migration history detail (Patch 5) to a separate memory file `i18n-migration-2026-05-28.md` and link from CLAUDE.md (1-line cross-ref)
- Same for the long English manual drafts list

This keeps CLAUDE.md scannable while preserving discoverability via cross-links — matches the existing convention used for sprint history archive.

---
*Generated 2026-05-28 by claude-md-improver skill*
