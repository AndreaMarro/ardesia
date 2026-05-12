# UNLIM Ralph Loop iter 3 → iter 4 Handoff

**Date**: 2026-05-12 ~10:00 GMT+2
**Source audit**: `docs/audits/2026-05-12-unlim-ralph-iter3-close-audit.md`
**Score iter 3 close ONESTO**: 6.8/10 (G45 anti-inflation, parity multimodale 6.1/10)

---

## §1 — ACTIVATION STRING iter 4 (paste-ready)

```
/agent-teams:team-spawn /quality-audit /elab-onnipotenza-coverage /elab-morfismo-validator /coderabbit:review

Ralph loop iter 4 UNLIM. Prima leggi:
1. docs/audits/2026-05-12-unlim-ralph-iter3-close-audit.md
2. docs/handoff/2026-05-12-unlim-ralph-iter3-to-iter4-handoff.md
3. CLAUDE.md sprint history iter 28-37

Mandate iter 4:
- Fix Bug #1 INTENT parser surface (P0, 1-2h)
- Apply warmup_cron migration (P0, 30 min — Andrea ratify required)
- Onniscenza ENABLE_ONNISCENZA default-on (P0, 5 min Andrea ratify)
- Live smoke re-verify post-fix 10 queries (target ≥9/10 PASS substantive)
- Vol/pag citation rate target 60%+
- Memory class_key fallback (P1, 4-6h)

Target iter 4 score: 6.8 → 7.5/10 ONESTO conditional P0 + Andrea ratify queue close.

NO compiacenza. NO score >7 senza Opus indipendente.
Use connettori massivamente (Chrome MCP + Macos MCP + Playwright).
```

---

## §2 — Setup steps Andrea (~10 min)

### Step 1 — Andrea ratify queue (3 voci)
1. **Warmup_cron migration**: `npx supabase db push --linked` (applies `migrations/20260430220000_unlim_chat_warmup_cron.sql`) — eliminates cold start 18-20s
2. **Onniscenza default-on**: `npx supabase secrets set ENABLE_ONNISCENZA=true --project-ref euqpdueopmlllqjmqnyb` — Box 11 lift 0.8→1.0
3. **RAG backfill COMMIT** (optional, after smoke verify): `ANDREA_RATIFY=1 SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/backfill/rag-metadata-backfill-iter14.mjs --commit` (5s abort window built-in)

### Step 2 — Verify env (live smoke iter 4)
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
SUPABASE_URL="https://euqpdueopmlllqjmqnyb.supabase.co"
SUPABASE_ANON_KEY=<get from supabase-credentials.md memory>
ELAB_API_KEY=$(grep '^VITE_ELAB_API_KEY=' .env | head -1 | cut -d= -f2 | tr -d '\n\r ')
node scripts/bench/run-sprint-r5-stress.mjs  # full 50-prompt re-bench
```

### Step 3 — Iter 4 entrance CoV
```bash
git status   # verify clean
npx vitest run --reporter=verbose  # baseline 13338+ (post iter 37)
npm run build  # heavy ~14min, but mandatory anti-regression
```

---

## §3 — Priorities iter 4 P0 (3h totale execution)

### Fix Bug #1 — INTENT parser response surface (1-2h)
**File**: `supabase/functions/unlim-chat/index.ts` (1181 LOC, post-LLM block ~L600-700)

**Diagnosis steps**:
1. Read post-LLM block sequencing: search `parseIntentTags` + `stripIntentTags` + `capWords` + `validatePZ`
2. Verify ordering: parseIntentTags MUST run BEFORE stripIntentTags MUST run BEFORE capWords. Else cap strips tags or PZ validator rejects untagged.
3. Verify response object: `return new Response(JSON.stringify({ response, intents_parsed, prompt_class, safety_fires, ... }))` — confirm `intents_parsed` key present
4. Smoke re-verify: Q6 "Quale pin per LED blink?" → expect `intents_parsed: [{action:'openeditor'}, {action:'switcheditor', args:{editor:'arduino'}}]`

**Test**: extend `tests/unit/intent-parser.test.js` (259 LOC iter 36) with API response surface test.

**Anti-regression**: composite-handler 10/10 + clawbot-template-router 19/19 + lavagna 180/180 MUST preserve.

### Fix Bug #2 — Cold start 18-20s "AI temporaneamente non disponibile" (30 min)
**Cause**: warmup_cron migration NOT applied prod.

**Steps**:
1. Andrea: `npx supabase db push --linked --project-ref euqpdueopmlllqjmqnyb`
2. Verify cron active: `npx supabase db query --linked "SELECT * FROM cron.job WHERE jobname LIKE '%unlim%'"`
3. Smoke re-test Q1+Q4 (Ciao Ragazzi + Cosa fa una resistenza?) → expect <5s latency

### Fix Onniscenza default-on (5 min)
**Steps**:
1. Andrea: `npx supabase secrets set ENABLE_ONNISCENZA=true --project-ref euqpdueopmlllqjmqnyb`
2. Deploy unlim-chat: `npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb`
3. Smoke re-verify: R5 re-bench expected lift ≥1pp citation rate + ≥0.5pp PZ rate

---

## §4 — Priorities iter 4 P1 (10h totale)

### Fix Bug #3 — Vol/pag citation rate 37.5% → ≥60% (2-3h)
**File**: `supabase/functions/_shared/system-prompt.ts` + `supabase/functions/_shared/onniscenza-classifier.ts`

**Approach**:
1. Add system-prompt regola NEW: "Citate Vol.X pag.Y almeno 1 volta ogni 2 risposte default. Se categoria=citation_vol_pag, citation OBBLIGATORIA in prima frase."
2. RAG topK floor: default category 3→4 chunks (more Vol/pag exposure to LLM)
3. Few-shot Esempio 6+7 NEW: citation example default+deep_question categories
4. R5 re-bench: expect citation rate 37.5% → 60%+

### Fix Bug #4 — Memoria anon class_key fallback (4-6h)
**File**: `src/services/unlimMemory.js` L207-208 + Supabase schema

**Approach**:
1. Replace `_getCurrentUserId()` strict null check → `userId || class_key || elab_anon_uuid` composite key
2. Add `lesson_contexts.class_key` column index (Supabase migration NEW iter 4)
3. Refactor insert path: anonymous UUID → class_key namespace, NOT silent no-op
4. Test smoke Q9 "Memoria sessione precedente?" → expect history shown after 2 prior sessions

### RAG backfill commit + Path C improvements (3h)
**File**: `scripts/backfill/rag-metadata-backfill-iter14.mjs` + `scripts/backfill/match-chunks-to-lessons.mjs`

**Approach**:
1. Audit ~6 wiki concepts missing `volume_ref` frontmatter (30 min + commit)
2. Add pagination range header loop (15 min, covers all 1881 chunks vs current 1000 limit)
3. Andrea ratify + COMMIT execution post smoke verify (30 min + 4 min wall)
4. Verify post-commit: `SELECT COUNT(*) FROM rag_chunks WHERE chapter IS NOT NULL` ≥ 1500

---

## §5 — Priorities iter 5+ P2 strategic (25h totale, defer)

### STT root cause + Voxtral Transcribe 2 migration (6-10h)
**Files**: `supabase/functions/_shared/cloudflare-client.ts` cfWhisperSTT + ADR-031

**Approach**:
1. Reconcile iter 37 conflict claims: re-run `scripts/smoke/stt-live-iter37.mjs` against Edge Function v54+ → ground truth
2. If 0/9 confirmed: implement ADR-031 Voxtral Transcribe 2 migration ($0.003/min, 4% WER FLEURS Italian, EU France)
3. If 9/9 confirmed: claim audit hallucination, document as resolved
4. Wake word integration test: `tests/unit/services/wakeWord.test.js` + browser MCP live capture

### Vision E2E live prod smoke + real fixtures (4-6h)
**Files**: `tests/e2e/02-vision-flow.spec.js` + `tests/fixtures/screenshots/circuit-*.png`

**Approach**:
1. Remove env-gate skips (`test.skip(!env.GEMINI_API_KEY)` etc) — Edge Function handles auth
2. Replace 20 PNG placeholders 582B with real captures: Playwright `page.screenshot()` of 20 lesson-paths
3. Run E2E `npx playwright test tests/e2e/02-vision-flow.spec.js --reporter=line`
4. Expected: Italian "Ragazzi" + component identification + Vol/pag citation per Gemini Flash response

### Webcam/file-upload kit photo capture (8-12h)
**Files**: `src/services/simulator-api.js` captureScreenshot + NEW `src/components/lavagna/KitPhotoCapture.jsx`

**Approach**:
1. Add `getUserMedia({video: true})` flow + permission prompt
2. Add `<input type="file" accept="image/*" capture="environment">` mobile fallback
3. UI button "Inquadra il kit" + Photo preview + send buffer base64 to `/unlim-vision`
4. UNLIM prompt template per ADR Sense 2: "Vede il kit fisico" mandate

---

## §6 — Iter 4 score target + anti-inflation gate

**Target iter 4 close ONESTO**: 6.8 → **7.5/10** ONESTO conditional:
- Bug #1 INTENT parser surface fix verified live smoke ≥9/10 PASS (+0.3)
- Bug #2 warmup_cron applied + cold start <5s 10/10 (+0.2)
- Onniscenza default-on + R5 re-bench ≥92% PASS (+0.2)
- Andrea ratify queue 3 voci close (+0.0 enabler only)

**Anti-inflation G45 mandate iter 4 enforced**:
- NO claim "INTENT dispatcher LIVE" senza smoke prod evidence response field popolato
- NO claim "memoria perfetta" senza class_key fallback shipped
- NO claim score >7 senza Opus indipendente review
- NO claim "Vision E2E LIVE" senza Playwright real fixtures exec PASS
- NO claim "STT LIVE" senza 5/5 live smoke audio file PASS

---

## §7 — Pattern S evolution iter 4 (race-cond fix preservation)

**Validated 9th iter consecutive** (iter 5+6+8+11+12+19+36+37+38). Pattern S r3 race-cond fix mandate iter 4:
- Phase 0 inline orchestrator: Andrea ratify queue + env verify
- Phase 1 4-agent OPUS parallel: Maker (Bug #1+#2) + WebDesigner (Bug #4) + Tester (R5 re-bench + Bug #3 system-prompt tune) + Architect (ADR amends if needed)
- Phase 2 Documenter sequential: audit + handoff + CLAUDE.md APPEND post 4/4 completion msgs filesystem barrier
- Phase 3 orchestrator: commit + push + smoke re-verify

**File ownership rigid iter 4**:
- Maker → `supabase/functions/**`
- WebDesigner → `src/services/unlimMemory.js`
- Tester → `tests/**` + `scripts/bench/**`
- Architect → `docs/adrs/**` + `docs/specs/**`
- Documenter → `docs/audits/**` + `docs/handoff/**` + `CLAUDE.md` (APPEND only)

---

## §8 — Files refs iter 3

- Audit close: `docs/audits/2026-05-12-unlim-ralph-iter3-close-audit.md`
- Handoff iter 4: `docs/handoff/2026-05-12-unlim-ralph-iter3-to-iter4-handoff.md` (this file)
- Smoke log: `docs/audits/smoke-iter3-2026-05-12T08-24-21Z.log`
- BG agent 1 output: §3.1 audit
- BG agent 2 output: §3.2 audit
