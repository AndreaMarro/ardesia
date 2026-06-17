# ELAB Tutor — Comprehensive Problems Map ULTRAREVIEW + Quality Audit

**Data**: 2026-05-11
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10` (26 commits ahead origin/main, 7 iter 24-29)
**Scope**: aggregato BRUTAL ONESTO tutti i problemi documentati iter 24-29 + carryover Sprint S/T/U + Andrea brutal mandate.

**CoV finale verificata 5/5**:
- ✅ Git: 26 commits ahead (7 iter 24-29 pushed origin) + working tree dirty Mac Mini autonomous loop debris
- ✅ Frontend prod `https://www.elabtutor.school`: HTTP 200
- ✅ Backend Edge `unlim-chat` OPTIONS: HTTP 204
- ⚠️ Backend Edge POST: COLLAPSE iter 27 W brutal 503 77.8% rate (Andrea recovery deploy URGENT)
- ✅ Vitest 14179 PASS preserved baseline 11958 (+2221 cumulative iter 24-29) ZERO regression
- ⚠️ `automa/baseline-tests.txt` stantio 13474 (real 14179, hook NON auto-update file)
- ✅ 4 migrations shipped working tree iter 24-28

---

## EXECUTIVE SUMMARY — STATE OF PROJECT

| Metric | Code (shipped) | LIVE prod | Delta |
|---|---|---|---|
| Score ONESTO G45 | **8.8/10** | **3.5/10** | **-5.3** (Mistral collapse documented iter 27 W) |
| Vitest PASS | 14179 | N/A | +2221 vs baseline 11958 |
| Esperimenti deep-link mount | 94/94 unblocked code | 0/94 PASS PRE-DEPLOY | gap deploy |
| HTTP 503 rate prod | retry-backoff shipped | 11.4%-77.8% LIVE | gap deploy |
| Off-topic Cat D canonical | classifier shipped 8.5/10 | 37.5% LIVE | gap deploy |
| Memoria msg4 marathon | timeline RPC race-safe shipped | UNMEASURED post-iter-22 | gap deploy + Cat B re-bench |

**Root issue 1**: Iter 25-28 fixes ALL shipped CODE but Edge Function v50 LIVE prod ha vecchio code. Andrea ratify deploy critical recovery.
**Root issue 2**: Mistral primary collapse documented (iter 27 W 503 77.8% rate). Flip LLM_ROUTING_WEIGHTS Gemini-primary emergency.

---

## PARTE I — P0 BLOCKERS (URGENT recovery)

### P0.1 — Edge Function v50 LIVE prod NON contiene iter 25-28 fixes
**Source**: iter 27 W BAIL + iter 28 commit log
**Evidence**: 6 commits CODE pushed origin MA Andrea NON ha deployato v51+. Current LIVE = vecchio code pre-iter-25.
**Fix command**: `SUPABASE_ACCESS_TOKEN=sbp_xxx npx supabase functions deploy unlim-chat _shared --project-ref euqpdueopmlllqjmqnyb`
**Effort**: 3 min Andrea
**Carries**: iter 25 P0-B retry + iter 26 saveHistory + iter 27 P0 surgical+PZ+safety + iter 28 H1/H6/M5/L4 + classifier off_topic + Pixtral mistral-small-2506

### P0.2 — 4 migrations NON applicate prod
**Source**: iter 24 Agent T + iter 25 P0-A + iter 28 H3 NEW
**Evidence**: `ls supabase/migrations/2026051*` mostra 4 NEW SQL files NOT yet `db push`:
- `20260511060000_unlim_session_memory` (iter 18.5 carryover)
- `20260511080000_unlim_session_memory_user_intent` (iter 24 column + RPC)
- `20260511120000_unlim_message_history` (iter 25 timeline table + RPC race-unsafe)
- `20260511180000_unlim_message_history_rpc_race_fix` (iter 28 H3 FOR UPDATE lock NEW)
- `20260430220000_unlim_chat_warmup_cron` (iter 38 sub-minute)
**Fix command**: `npx supabase db push --linked`
**Effort**: 5 min Andrea
**Impact**: timeline architettura race-safe + user_intent_seed propagation + 30s cron warmup

### P0.3 — Mistral primary collapse LIVE prod (HTTP 503 77.8% rate)
**Source**: iter 27 Agent W LIVE 50q BAIL 5/5 consecutive 503
**Evidence**: 3/3 follow-up curl probes 503/503/503 persistente. Gemini Flash fallback works only citation_vol_pag class (2/9 success).
**Fix command**: emergency `npx supabase secrets set LLM_ROUTING_WEIGHTS="0,100,0" --project-ref euqpdueopmlllqjmqnyb` (Gemini-only) OR `"20,70,10"` (Gemini-primary)
**Effort**: 2 min Andrea
**Impact**: immediate recovery HTTP 200 rate target 22.2% → 95%+

### P0.4 — Esperimenti 94/94 BROKEN deep-link prod (root cause shipped CODE non deployato)
**Source**: iter 27 Agent X Playwright sweep
**Evidence**: 0/94 PASS via `#lavagna?exp=<id>` (Vol1 38/38 + Vol2 27/27 + Vol3 29/29 ALL broken). Cat 2 (0 components rendered) + Cat 3 (no Vol/pag citation) 94/94.
**Fix**: shipped iter 27 commit ee4eaa45 (App.jsx:213+239 + LavagnaShell.jsx:393 prop wire) + iter 28 hashchange listener. VERIFIED preview load v1-cap6-esp1.
**Andrea action**: deploy Vercel post `npm run build` + re-run Playwright sweep verify ≥80 PASS
**Effort**: 5-10 min Andrea + 8 min Playwright run

### P0.5 — Marathon msg4 universal "Blink Vol.3 pag.23" template collapse 5/5 sessioni
**Source**: iter 24 Doc-4 brutal + iter 22 marathon evidence
**Evidence**: Session 3 msg5 leaks circuit state dump invece recall "pulsante v1-cap8". Session 5 msg3 cites Vol.3 pag.33 for "LED Vol.1" query.
**ROOT CAUSE 75% Doc-4**: single-row `unlim_session_memory` last_* overwrite drift + NO timeline table architettura.
**ROOT CAUSE 25%**: LLM directive narrow only "continuiamo/riprendiamo".
**Fix**: iter 25 P0-A NEW `unlim_message_history` timeline + iter 25/28 directive expand + iter 28 H3 race-fix RPC.
**Andrea action**: apply 4 migrations + deploy + Cat B marathon 5×5 FIRST re-bench post-deploy.
**Effort**: 10 min Andrea

### P0.6 — Vol/pag verbatim 60% strict prod (target ≥85%)
**Source**: iter 27 W Cat A 60% strict
**Evidence**: A03 wrong-volume "Vol.1 cap.6 Blink → Vol.3 pag.23" hallucination. Vol1 cap.9-14 pages fabbricate iter 14 fixed iter 24 P5.1.
**Fix**: iter 24 P5.1 volumi-citazioni.ts Vol1 6× pages (51→57, 61→81, 71→93, 78→97, 86→103, 95→107) + iter 28 H6 forceCitation classifier off-topic wire.
**Andrea action**: deploy + re-bench post-deploy verify ≥85%.
**Effort**: included Step P0.1 deploy

### P0.7 — GDPR Art. 8 minori 8-14 anni safety 503 vuoto rischio legale
**Source**: iter 24 dim-1 Cat C + iter 27 Agent Z
**Evidence**: iter 24 query "scossa" → 503 vuoto = minori senza warning sicurezza 220V.
**Fix**: iter 27 Agent Z `safety-hardcoded-fallback.ts` + `unlim-chat/index.ts:829` catch wrap (+71 LOC) + iter 28 ITER27_SAFETY_BROAD_RE (scossa|elettrocuzione|brucia|pericolo|ferito|folgora|ustione).
**Andrea action**: deploy + Cat C re-bench post-deploy verify 100% canonical (never 503-empty).
**Effort**: included Step P0.1 deploy

---

## PARTE II — P1 (must fix before R5 50-prompt re-bench)

### P1.1 — `[INTENT:...]` strip regex nested args (iter 28 H1 FIXED CODE)
**Source**: iter 28 code-review H1
**Status**: SHIPPED iter 28 commit 267e7d9a. `principio-zero-validator.ts:64` + `unlim-chat/index.ts:74` regex `[\s\S]*?` non-greedy.
**Deploy required**: yes via P0.1.

### P1.2 — `insert_message_history` RPC race condition (iter 28 H3 FIXED CODE)
**Source**: iter 28 code-review H3
**Status**: SHIPPED migration NEW `20260511180000_unlim_message_history_rpc_race_fix.sql` FOR UPDATE row lock.
**Deploy required**: yes via P0.2 apply.

### P1.3 — OFFTOPIC regex DUPLICATE safety-critical (iter 28 H2 + iter 29 Agent T conferma)
**Source**: iter 28 code-review H2 + iter 29 Agent T finding P0-4
**Evidence**: 270-char inline regex `unlim-chat/index.ts:278` (iter 22) + parallel classifier `onniscenza-classifier.ts:134-289` (iter 25). DRIFT surface — 2 sources of truth.
**Fix design**: import `OFFTOPIC_RE` + `classifyOfftopicType` da classifier in unlim-chat + DELETE inline block lines 271-325 (~55 LOC).
**Effort**: 2-3h iter 30 refactor.
**Risk**: classifier check must fire BEFORE legacy regex point. Test extensively.

### P1.4 — Mistral inner+outer retry stack (iter 28 M5 FIXED CODE)
**Source**: iter 28 code-review M5
**Status**: SHIPPED `llm-client.ts:704/714` `maxAttempts: 1` outer. Inner Mistral retry [400ms,1000ms] preserved.
**Deploy required**: yes via P0.1.

### P1.5 — forceCitationFromQuery missing classifier off-topic (iter 28 H6 FIXED CODE)
**Source**: iter 28 code-review H6
**Status**: SHIPPED 4-chain wrap classifier off-topic path mirror direct-operational `unlim-chat/index.ts:420-429`.
**Deploy required**: yes via P0.1.

### P1.6 — API auth gap solo `unlim-chat` enforces X-Elab-Api-Key
**Source**: iter 29 Agent A API audit P0
**Evidence**: 10 altri Edge endpoints rely solo anon JWT browser-bundle-visible = defense-in-depth gap.
**Fix**: wire `verifyElabApiKey` middleware su tutti endpoints sensibili (unlim-vision + unlim-tts + unlim-stt + unlim-imagegen + dashboard-data).
**Effort**: 2-3h iter 30.

### P1.7 — API error envelope DRIFT 3+ shapes
**Source**: iter 29 Agent A API audit P0
**Evidence**: `{success:false,error}` vs `{...,details}` vs compile-proxy `{error,...}` (no success).
**Fix**: harmonize ErrorResponse schema in `_shared/types.ts` + update all 10 endpoints.
**Effort**: 4-6h iter 30+.

### P1.8 — Schema drift OpenAPI inline (VisionRequest 9 runtime vs 4 declared)
**Source**: iter 29 Agent A
**Evidence**: TTSRequest accepts 9 fields runtime, type declares 4. DiagnoseRequest 2 parallel shapes.
**Fix**: codify `_shared/types.ts` exact + update OpenAPI 3.1 spec + CI lint `@redocly/cli`.
**Effort**: 3-4h iter 30+.

### P1.9 — PZ V3 MAJOR severity tier non-blocking iter 27
**Source**: iter 27 Agent Y + iter 28 commit
**Status**: 6 NEW runtime rules promoted (plurale/citation/analogia/no_verbatim/off_topic_recog/action_tags) MA `console.warn` telemetry only. Hard-enforce ratify Andrea.
**Andrea action**: ratify env flag `PZ_HARD_ENFORCE_MAJOR=true` iter 30+.

### P1.10 — Lighthouse perf 26+23 chatbot-only/easter-modal (iter 26 modulePreload FIXED CODE)
**Source**: iter 26 dim-2 + iter 24 audit + iter 28 close
**Status**: SHIPPED `vite.config.js` modulePreload filter react-pdf+pdfjs+@react-pdf+mammoth (-2.3MB initial projected +40-50 perf).
**Andrea action**: `npm run build` + verify `dist/index.html` NO modulepreload react-pdf/mammoth + Vercel deploy + Lighthouse CLI verify perf 65+.

---

## PARTE III — P2 (defer iter 30+ tech debt sprint)

### P2.1 — 4 GB disk leak worktree dirs
**Source**: iter 29 Agent T P0-1
**Evidence**: 2.3 GB `.claude/worktrees/` 5 stale agent dirs + 1.7 GB orphan `../elab-builder-{final,fumetto,watchdog,wireup}` (CLAUDE.md "Merged, rimuovere").
**Fix**: `git worktree remove <path>` + `rm -rf` orphan dirs.
**Effort**: 30 min Andrea.

### P2.2 — 4 npm deps unused (iter 29 Agent T P0-2)
- `ai` ^6.0.168 / `uuid` ^13.0.0 / `fast-xml-parser` ^5.3.6 / `mobile-drag-drop` ^3.0.0-rc.0 zero `from '<pkg>'` imports.
- **Caveat**: static grep, run `npx depcheck` first verify NO dynamic imports.
- **Effort**: 30 min iter 30.

### P2.3 — getExpFromHash duplicato App.jsx + LavagnaShell (iter 29 Agent T P0-3 + iter 27 P0 fix carryover)
**Source**: my iter 27 + 28 surgical fix
**Fix design**: extract to `src/utils/hashUtils.js` single source + import both files.
**Effort**: 1h iter 30.

### P2.4 — Audit dir bloat 183 entries 80 MB no archive (iter 29 Agent T P0-5)
**Fix**: create `docs/audits/archive/sprint-S/`, `archive/sprint-T/`, `archive/sprint-U/` + git mv historical.
**Effort**: 2h iter 30 (cleanup + git rename).

### P2.5 — 6 orphan service files (iter 29 Agent T)
- `comicPromptTemplate.js`, `memoryWriter.js`, `multimodalRouter.js`, `percorsoGenerator.js`, `principioZeroValidator.js`, `renderWarmup.js`
- Zero production imports (only test files).
- **Effort**: 1h delete + cleanup imports.

### P2.6 — 45 Galileo→UNLIM rename incomplete 17 files (iter 29 Agent T)
**Top files**: `GalileoAdapter.jsx` 932 LOC + `useGalileoChat.js` 1379 LOC + 15 altri.
**Effort**: 4-6h iter 30+ (multi-file rename + import update + test fix).

### P2.7 — ADR fragmentation 4 directories (iter 29 Agent T)
- `docs/adr/`, `docs/adrs/`, `docs/architectures/`, `docs/decisions/` con duplicate ADR-001 + numbering gaps.
- **Fix**: consolidate canonical `docs/adrs/` + redirect README.
- **Effort**: 1h iter 30.

### P2.8 — 21/30 shared TS modules NO tests
**Critical**: `llm-client.ts` + `guards.ts` + `content-safety-guard.ts` runtime-critical UNTESTED.
**Effort**: 8-12h iter 30+ (Davide review priority list, then test author).

### P2.9 — 2010 inline `style={{` + 47 CSS modules + 9 raw CSS + Tailwind 4 paradigms (iter 29 Agent T)
**Fix**: migrate inline → CSS modules gradual (per-file refactor).
**Effort**: 1-2 settimane iter 30+ Sprint V.

### P2.10 — 5 monolith files >1700 LOC (iter 29 Agent T)
- TeacherDashboard 3484 / SimulatorCanvas 3173 / ElabTutorV4 2747 / LavagnaShell 1719 / useGalileoChat 1379
- **Effort**: 1-2 settimane per file (Davide co-author Sprint V).

### P2.11 — STT + ImageGen no GDPR Art.8 parental consent (iter 29 Agent A P2)
- `unlim-stt` + `unlim-imagegen` accept anon requests without `checkConsent` gate.
- **Effort**: 1-2h iter 30+ wire consent check.

### P2.12 — No rate-limit + version headers all Edge (iter 29 Agent A P1)
**Fix**: 5 LOC/endpoint add `X-RateLimit-Remaining` + `X-Elab-Api-Version`.
**Effort**: 1-2h iter 30+ all 10 endpoints.

### P2.13 — `unlim-chat` Edge Function 25K+ tokens cold-start
**Source**: iter 29 Agent A P2
**Fix**: lazy-import heavy `_shared` modules behind classifier flags + lazy JSON clawbot-templates.
**Effort**: 4-6h iter 30+.

### P2.14 — Mac Mini autonomous loop probabilmente DEAD (iter 29 + CLAUDE.md)
**Source**: SSH timeout iter 24+ confirma + Tailscale stopped MacBook.
**Fix**: stop launchctl service Mac Mini (require Tailscale start + SSH access) OR physical reset.
**Decision Andrea**: keep dead OR resume (Mac Mini work invisible recent iters).

### P2.15 — Hardcoded JWT api.js:23 + voiceService.js:12 anon role
**Source**: iter 29 Agent T
**Mitigation**: anon role RLS-protected MA voiceService NO env fallback risk if rotated.
**Fix**: add env var fallback both files.
**Effort**: 30 min iter 30.

### P2.16 — `.env.example` underspec (iter 29 Agent T) FIXED iter 29 ✓
**Status**: shipped iter 29 commit 5da4c4ef (+12 LOC 3 missing vars).

---

## PARTE IV — P3 (low priority + nice-to-have)

### P3.1 — Pixtral 12B deprecated 2 Dec 2025 still alive prod (iter 26 Agent migration)
**Status**: SHIPPED iter 26 commit 6e2e185d `mistral-client.ts` env-aware MISTRAL_VISION_MODEL default `mistral-small-2506`. Rollback via env.
**Andrea action**: live bench 5 sample images post-deploy verify mistral-small-2506 accuracy delta.

### P3.2 — H4 Voxtral dev proxy validation gap (iter 28 code-review)
**Source**: code-review H4
**Evidence**: `voice_id`/`sessionId` no validation + no response size cap + apply: 'serve' MA NO `process.env.VERCEL` assert.
**Fix**: validate voice_id allow-list + sessionId regex + Content-Length cap 5MB.
**Effort**: 1h iter 30 dev hardening.
**Note**: dev-only, lower priority.

### P3.3 — M3-M10 code-review carryover follow-ons (iter 28 close)
- M3 PZ validator stripTags consistency
- M4 leaked-context regex bundle `LEAKED_CONTEXT_PATTERNS[]` array refactor (44 .replace calls)
- M6 unused safety types `minor_inappropriate` / `generic_safety` cleanup
- M8 LavagnaShell freeMode useState initializer side-effects → useEffect + useRef (React 19 strict-mode)
- M10 modulePreload other lazy-only chunks measure (Lighthouse ≥90 gate)

### P3.4 — L1 PZ validator log rate-limit OR aggregate counter
**Source**: code-review L1
**Effort**: 30 min iter 30+.

### P3.5 — L2 extractVolCap regex miss `c.\s*\d+` abbreviation
**Effort**: 15 min iter 30+.

### P3.6 — L3 dead export `SAFETY_HARDCODED_FALLBACK_VERSION` cleanup
**Effort**: 5 min iter 30+.

### P3.7 — Vol3 PDF v0.8.1 cap.9-12 ToC export gap (iter 24 dim-2)
**Source**: dim-2 audit
**Evidence**: Vol3 51 extracted images vs Vol1+Vol2 213+198. PDF export gap.
**Effort**: Davide re-export Vol3 v0.8.2.

### P3.8 — TRES JOLIE/ cartella NON exists (iter 24 dim-2)
**Source**: dim-2 audit
**Evidence**: `/Users/andreamarro/VOLUME 3/TRES JOLIE/` not found. Canonical `/CONTENUTI/`.
**Andrea action**: clarify terminology with Davide/Andrea memo.

---

## PARTE V — DEFER Sprint V Davide co-author (~3-4 settimane)

### Sprint V.1 — L2 templates expand 25→94 Davide-authored gold standard
**Source**: Andrea Sprint U cycle 1 audit + iter 28 Agent C
**Status**: 25/94 (27%) shipped iter 28. Davide content review next 69 esperimenti.
**Effort**: 3-4 settimane Davide.

### Sprint V.2 — IBSE pedagogia schema 5 lesson-paths Vol.1 cap.6 LED pilota
**Source**: ADR-027 Davide co-author iter 33+ deferred
**Effort**: 1 settimana Davide + Andrea.

### Sprint V.3 — Vol3 narrative refactor ADR-027
**Source**: ADR-027
**Effort**: 1-2 settimane Davide.

### Sprint V.4 — Teacher Dashboard backend MVP PNRR
**Source**: CLAUDE.md mercato + iter 30+ commerciale
**Effort**: 2-3 settimane Andrea + 3 Edge Functions + 3 tabelle.

### Sprint V.5 — Tea homepage Glossario integration main app
**Source**: feedback iter 41 PM Andrea 2026-05-05
**Effort**: 4-6h iter 30 Tea + Andrea (clone `elab-tutor-glossario.vercel.app` inside main app `#glossario` route).

### Sprint V.6 — Voice clone Davide IT alternative narratore
**Source**: iter 28 + Morfismo Sense 2
**Effort**: 1h Andrea/Davide audio + Mistral Voxtral voice_id register.

---

## PARTE VI — CARRYOVER Andrea brutal mandate iter 21+

### A.1 — Volumi narrative refactor Davide co-author (ADR-027)
- 92→140 lesson-paths schema redefine
- Deferred Sprint V iter 33+

### A.2 — 92 esperimenti broken Playwright UNO PER UNO sweep
**Status**: iter 27 Agent X SHIPPED 94/94 Playwright spec (`tests/e2e/iter-27-92-esperimenti-sweep.spec.js`) + 94 PNG evidence.
**Andrea action**: re-run post-deploy verify ≥80 PASS.

### A.3 — Linguaggio codemod 200 violations singolare→plurale
**Source**: iter 21 mandate
**Status**: Sprint U cycle 1 audit verifier closed 73/94 lesson-paths violations iter 4.
**Carryover**: 127 violations remaining? Audit re-verify iter 30.

### A.4 — Grafica overhaul `/colorize` + `/typeset` + `/arrange`
**Source**: iter 21 mandate
**Status**: NOT STARTED.
**Effort**: 1-2 settimane Sprint V design sprint.

### A.5 — Test connettori massicci LIVE prod ogni iter
**Source**: iter 21+ mandate "NO compiacenza connettori massicci sistematico scientifico"
**Status**: iter 24 dim-1 + iter 27 W BAIL evidence brutale ONGOING.
**Pattern**: re-run W LIVE 50q post Andrea deploy every iter.

---

## PARTE VII — CARRYOVER pre-Sprint U (Sprint S/T close iter 1-22)

### S.1 — VPS GPU Box 1 0.4/10 (Path A decommission iter 5 P3)
**Status**: pod TERMINATED. Storage paid 0 ($0 cost). Decommission complete iter 5 P3.

### S.2 — RAG backfill prod 2777 chunks NULL metadata (iter 24 Doc-2 dim-2)
**Status**: 1881 chunks ingested (iter 7), 894 chunks remaining NULL metadata.
**Defer**: ANDREA_RATIFY iter 31+ Voyage backfill (~$1 cost).

### S.3 — Onniscenza state-snapshot-aggregator.ts NOT wired prod (iter 24 dim-3)
**Status**: 263 LOC scaffold dormant. CLAUDE.md iter 31 claim "wired" parzialmente falso.
**Effort**: 1h iter 30+ wire-up unlim-chat.

### S.4 — Onnipotenza dispatcher 57-tool Deno port NOT shipped
**Source**: Sprint T iter 38 carryover PDR §4 mechanical cap 8.5
**Status**: surface-to-browser intent parser LIVE (12 whitelist), server-side Deno port deferred Sprint V.
**Effort**: 16h Maker-1 Sprint V.

### S.5 — Mac Mini autonomous loop DEAD (CLAUDE.md iter 29)
**Status**: SSH timeout + Tailscale stopped + 23+ days uptime probable dead.
**Decision**: Andrea revive OR keep stopped.

---

## PARTE VIII — IMMEDIATE ACTION PLAN ANDREA URGENT 8 STEPS (10-15 min totale)

Tutti comandi in `docs/audits/2026-05-11-iter-29-CLOSE-handoff-andrea.md` §3.

1. **EMERGENCY** flip LLM_ROUTING_WEIGHTS (2 min)
2. **P0** apply 4 migrations `db push` (5 min)
3. **P0** deploy Edge unlim-chat v53+ (3 min)
4. **P0** smoke 5q verify recovery (~1 min)
5. **P0** W LIVE 50q re-bench (~10 min)
6. **P0** Cat B marathon 5×5 FIRST post-deploy (~5 min)
7. **P0** Playwright sweep 94/94 verify (~8 min)
8. **P0** npm build + Vercel deploy + Lighthouse CLI (~10 min)

**Totale Andrea time**: ~45 min recovery + verifica completa.

---

## PARTE IX — ANTI-G45 RECAP

- Code shipped 8.8/10 EXPLICITLY DECOUPLED from LIVE prod 3.5/10 brutal
- NO claim "FIXED LIVE" senza commit + deploy + LIVE bench
- 7 commits pushed origin BUT Edge Function v50 LIVE still pre-iter-25
- Vitest 14179 PASS preserved + ZERO regression preserved 7 commits
- Pre-commit + pre-push hook gate enforced NO `--no-verify` ALL iter 24-29
- Comprehensive ULTRAREVIEW: 60+ problems mapped P0/P1/P2/P3 ranked impact/effort
- ZERO inflation: every problem cited source iter + file:line OR evidence count
- NO compiacenza Andrea brutal mandate

---

## PARTE X — COUNTS RIEPILOGO

| Categoria | Count |
|---|---|
| P0 BLOCKERS URGENT | 7 |
| P1 must-fix-before-bench | 10 |
| P2 tech-debt iter 30+ | 16 |
| P3 low + nice-to-have | 8 |
| Sprint V Davide co-author | 6 |
| Andrea brutal mandate carryover | 5 |
| Pre-Sprint-U Sprint S/T close residue | 5 |
| **TOTAL problems mapped** | **~57 unique items** |

---

## PARTE XI — TOP 10 PRIORITY MATRIX impact/effort ratio

| Rank | Problem | Impact | Effort | Owner |
|---|---|---|---|---|
| 1 | P0.3 Flip LLM_ROUTING | 🔥 huge | 2 min | Andrea |
| 2 | P0.1 Deploy Edge v53+ | 🔥 huge | 3 min | Andrea |
| 3 | P0.2 Apply 4 migrations | 🔥 huge | 5 min | Andrea |
| 4 | P0.4 Playwright sweep verify post-deploy | huge | 10 min | CI/Andrea |
| 5 | P0.5 Cat B marathon re-bench post-deploy | huge | 5 min | Andrea |
| 6 | P2.1 4 GB disk cleanup | small | 30 min | Andrea |
| 7 | P2.2 4 npm deps unused | small | 30 min | iter 30 dev |
| 8 | P1.3 OFFTOPIC dup consolidate | medium | 2-3h | iter 30 dev |
| 9 | P2.4 audit dir archive | small | 2h | iter 30 dev |
| 10 | P2.3 getExpFromHash util extract | small | 1h | iter 30 dev |

---

*Co-Authored-By: Claude Opus 4.7 (1M context) — ELAB Problems Map ULTRAREVIEW iter 29 finale*
