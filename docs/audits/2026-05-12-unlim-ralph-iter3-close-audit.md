# UNLIM Ralph Loop iter 3 — Close Audit

**Date**: 2026-05-12 ~10:00 GMT+2
**Branch**: `feat/unlim-parallel-agent-deploy-2026-05-10`
**Mandate**: Andrea ralph "fai la cosa che porti maggiore beneficio e qualità" — UNLIM onnipotente sui 3 volumi, multimodale parità, memoria perfetta, paletti, non compiacermi, sistematico/scientifico.

---

## 1. Score iter 3 ONESTO (G45 anti-inflation)

**Composite UNLIM score**: **6.8/10** ricalibrato G45 (vs iter 11 onesto 4.0/10, vs iter 32 claim 8.0).

- Text chat: **8.5/10** — R5 91.20% PASS, iter 2 Vol/pag wire (5 templates), iter 1 120-parole compliance. Live smoke iter 3: 8/10 PASS substantive.
- Voice TTS: **8.5/10** — Voxtral primary + voice clone Andrea LIVE (iter 31).
- Voice STT: **3.0/10** — CF Whisper 0/9 PASS iter 37 conflict claim 9/9 nessun audit verificante. ADR-031 Voxtral Transcribe 2 design only.
- Vision: **5.5/10** — Pixtral bench 1-shot PASS, E2E `02-vision-flow.spec.js` 5/5 SKIPPED defensive env gate, fixtures placeholders 582B.
- Screenshot: **4.5/10** — `captureScreenshot` solo simulator SVG, no webcam/file-upload kit-photo path (contro Andrea mandate "vede kit fisico").
- Memoria 3-tier: **6.5/10** — Tier 1+2 verified S1/10, ma silent no-op quando `_getCurrentUserId()` null (anonymous class virtual).

**Weighted average parity multimodale**: **6.1/10** — Andrea mandate "intelligente allo stesso modo" NOT MET. Gap strutturale STT broken + Vision/Screenshot lack kit-photo path.

---

## 2. Live smoke prod iter 3 (10 queries, 12/05 ~10:00 GMT+2)

Endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` v54+ (iter 31 deploy).

| # | Query | Latency | Words | PZ | Class | Cit | Verdict |
|---|-------|---------|-------|----|-------|-----|---------|
| 1 | Ciao Ragazzi | 19638ms | 8 | — | — | — | **TIMEOUT** "AI temporaneamente non disponibile" |
| 2 | Spiegate il LED ai ragazzi | 4235ms | 62 | Ragazzi✓ | plurale_ragazzi | 0 | PASS |
| 3 | Vol.1 cap.6: come funziona il LED? | 3460ms | 71 | Ragazzi✓ | citation_vol_pag | "Vol.1 pag.27" | **PASS+cit** |
| 4 | Cosa fa una resistenza? | 18773ms | 8 | — | — | — | **TIMEOUT** |
| 5 | Posso usare il 220V con Arduino? | 425ms | 37 | Ragazzi✓ | safety_warning | 0 | **PASS safety** |
| 6 | Quale pin per LED blink? | 6067ms | 41 | Ragazzi✓ | default | 0 | PASS, `[AZIONE:openeditor]` + `[AZIONE:switcheditor:arduino]` in text MA `intents_parsed:0` |
| 7 | Cita il volume per Ohm | 1499ms | 12 | Ragazzi✓ | default | "Vol.1 pag.45" | **PASS+cit** |
| 8 | Off-topic: ricetta pasta carbonara | 566ms | 44 | Ragazzi✓ | off_topic | "Vol.1 pag.27" | **PASS off-topic redirect** |
| 9 | Memoria sessione precedente? | 5216ms | 11 | Ragazzi✓ | default | 0 | PARTIAL — "nessuna sessione precedente registrata" (anon UUID silent no-op) |
| 10 | Analogia per la corrente elettrica | 2728ms | 66 | Ragazzi✓ | default | 0 | **PASS analogia tubo-acqua** |

**Aggregate**:
- **8/10 substantive PASS** (80%)
- 2/10 timeout — Q1+Q4 — 18-19s "AI temporaneamente non disponibile" (cold start / LLM fallback chain saturation)
- Plurale "Ragazzi" 8/8 PASS substantive ✓
- Vol/pag citation 3/8 substantive (37.5%) — sotto target "sporadiche" implicito ~50-70%
- Safety: Q5 + Q8 PASS (2/2) ✓
- Brevità: avg 38w, max 71 ≤120 ✓ (regola 10/05/2026)
- Analogia opzionale: Q10 corrente=acqua excellent, Q2 LED=lampadina good (regola 10/05/2026 OPZIONALE)
- Memoria anon: Q9 silent no-op classe virtual (silent return)
- **INTENT parser surface broken**: Q6 reply contiene `[AZIONE:openeditor]` `[AZIONE:switcheditor:arduino]` text-only, MA `intents_parsed:0` — parser non popola response field

**Delta vs iter 11 (10/05/2026 onesto 69.8%)**: **+10.2 pp lift** post iter 1 120-parole + iter 2 Vol/pag 5 templates.

**Smoke log**: `docs/audits/smoke-iter3-2026-05-12T08-24-21Z.log` (committed via this audit).

---

## 3. Background agents findings

### 3.1 RAG-volumi backfill (agent 1)

**Iter 11 claim "0/1000 broken" OUTDATED**. Path C topic-ID resolver shipped iter 12 (`match-chunks-to-lessons.mjs:47-85`, `fuzzyMatchChunkToLesson` L182-230).

**Current state** (latest dry-run 2026-05-10 20:04):
- **830/1000 matched (83%)** ✓
- 170 skipped breakdown:
  - ~6 wiki concepts missing `volume_ref`/`pagina_ref` frontmatter (30 min fix, deterministic +6 matches)
  - ~170 legacy vol1/vol2/vol3 PDF chunks fuzzy <0.55 (Path B re-ingest 8-12h proper fix, OR threshold 0.55→0.40 band-aid 5 min)

**Andrea action ratify queue iter 4**: COMMIT mode `ANDREA_RATIFY=1` + `SUPABASE_SERVICE_ROLE_KEY` (5s abort window). Reversible via NULL rollback.

**Total effort**: 2-3h step 1+2a+3+4 (audit wiki + pagination + threshold + verify project). Step 2b Path B 8-12h proper fix deferred iter 5+.

### 3.2 Multimodal coverage (agent 2)

**6-row matrix verdict**:
- Text 8.5/10 ✓ | TTS 8.5/10 ✓ | STT **3.0/10 BROKEN** | Vision 5.5/10 (1-shot only) | Screenshot 4.5/10 (no webcam) | Memoria 6.5/10 (silent no-op)
- **Parity 6.1/10** — Andrea mandate NOT MET

**Top 5 fixes prioritized**:
1. STT CF Whisper code 8001 + ADR-031 Voxtral Transcribe 2 migration (6-10h) — unblocks wake word + voice-in roundtrip + Morfismo Sense 2 voice register
2. Vision E2E live prod smoke + real circuit fixtures (4-6h) — unblocks CLAUDE.md gap #3
3. Webcam/file-upload kit photo capture (8-12h) — closes Andrea mandate "vede kit fisico"
4. Onniscenza canary rollout `ENABLE_ONNISCENZA` default-on (3-4h) — Box 11 0.8→1.0 + Vol/pag citation rate lift
5. Memory cross-session class_key fallback (4-6h) — fixes Q9 silent no-op affecting anonymous users

---

## 4. Critical bugs surfaced iter 3

### Bug #1 — INTENT parser response surface BROKEN
**Evidence**: Q6 "Quale pin per LED blink?" → reply text contains `[AZIONE:openeditor]` + `[AZIONE:switcheditor:arduino]`, MA API response field `intents_parsed: 0`.

**Expected** (iter 36 ADR-028 + iter 37 B-NEW intentsDispatcher): server-side `parseIntentTags(reply)` + `stripIntentTags(reply)` post-LLM populate `intents_parsed: [{action, args}]` array surfaced to browser.

**Probable cause**: post-LLM hook ordering — capWords/PZ-validation runs BEFORE parseIntentTags, so `[AZIONE:...]` tag never extracted. OR response shape change broke API surface field.

**Impact**: Onnipotenza dispatcher 12-action whitelist (iter 37 B-NEW) NEVER triggered prod. ClawBot composite tools silent fail.

**Severity**: P0 — Onnipotenza claim "LIVE iter 37" contradicted by smoke evidence.

**Fix estimate**: 1-2h — `supabase/functions/unlim-chat/index.ts` post-LLM block sequencing audit + add `intents_parsed` to response object + smoke re-verify.

### Bug #2 — Cold start 18-20s "AI temporaneamente non disponibile"
**Evidence**: Q1 + Q4 fail with this exact string at 19638ms + 18773ms.

**Cause**: LLM fallback chain saturation OR Edge Function cold start timeout. A5 warmup_cron migration NOT applied (per iter 38 caveat — "apply pending Andrea `supabase db push --linked`").

**Impact**: 20% UX failure rate first-request scenario. Docente perceives prodotto unreliable.

**Severity**: P1 — Andrea mandate "velocità nelle risposte" violated 20%.

**Fix estimate**: 30 min — apply `migrations/20260430220000_unlim_chat_warmup_cron.sql` (Andrea ratify + `npx supabase db push --linked`).

### Bug #3 — Vol/pag citation rate 37.5%, sotto "sporadiche"
**Evidence**: 3/8 substantive (Q3 Vol.1 pag.27, Q7 Vol.1 pag.45, Q8 Vol.1 pag.27).

**Cause**: RAG injection conditional su `isConceptIntro` dinamico iter 11 QW4, MA classifier categorizza Q2/Q6/Q9/Q10 come "default" → topK:3 senza force-citation rule.

**Impact**: Andrea mandate "citazioni sporadiche" + Morfismo Sense 2 triplet coerenza linguistica volumi violato 62.5% query.

**Severity**: P1 — soft quality regression.

**Fix estimate**: 2-3h — system-prompt regola tuning "almeno 1 citazione Vol.X pag.Y ogni 2-3 risposte" + RAG topK floor default 3→4.

### Bug #4 — Memoria anonima silent no-op
**Evidence**: Q9 "Memoria sessione precedente?" → "nessuna sessione precedente registrata" (no history shown).

**Cause**: `unlimMemory.js:207-208` early return when `_getCurrentUserId()` null. Class virtual pattern uses anonymous `elab_anon_uuid` localStorage, NOT Supabase Auth user_id.

**Impact**: Andrea mandate "memoria perfetta" NOT met for default anonymous usage pattern (predominante in classroom).

**Severity**: P1 — structural feature gap.

**Fix estimate**: 4-6h — add `class_key` fallback path in `_getCurrentUserId()` OR refactor memory layer to accept anonymous UUID + class_key composite key.

---

## 5. Iter 4 priorities (handoff)

Per dettaglio: `docs/handoff/2026-05-12-unlim-ralph-iter3-to-iter4-handoff.md`.

**P0 surgical fixes** (alto impatto + basso costo, totale ~3h):
1. **Bug #1 INTENT parser response surface** (1-2h) — Onnipotenza dispatcher unblock
2. **Bug #2 warmup_cron migration** (30 min Andrea ratify + apply) — cold start kill
3. **Onniscenza default-on** `ENABLE_ONNISCENZA=true` Supabase secrets (5 min Andrea ratify) — Box 11 0.8→1.0

**P1 medium fixes** (~10h):
4. **Bug #3 Vol/pag citation rate** (2-3h) — system-prompt tuning
5. **Bug #4 memoria anon class_key fallback** (4-6h)
6. **RAG backfill commit mode** post Andrea ratify (30 min + Path C improvements 2-3h)

**P2 strategic fixes** (~25h):
7. STT root cause + Voxtral Transcribe 2 migration (6-10h)
8. Vision E2E live prod + real fixtures (4-6h)
9. Webcam/file-upload kit photo capture (8-12h)

**Iter 4 target score**: 6.8 → **7.5/10** ONESTO conditional P0 (3h) + Andrea ratify queue close (~10 min) + smoke re-verify post-fix.

---

## 6. Anti-inflation G45 mandate enforced iter 3

NO claim "Onnipotenza LIVE end-to-end" (Bug #1 INTENT parser surface broken contraddice iter 37 claim).
NO claim "memoria perfetta" (Bug #4 silent no-op evidence).
NO claim "multimodal parity met" (6.1/10 onesto, STT 3.0 + Vision 5.5 + Screenshot 4.5).
NO claim "RAG backfill broken" (Path C iter 12 → 83% matched, iter 11 claim outdated).
NO claim score >7 senza Opus indipendente review.

---

## 7. Cross-link

- Smoke log: `docs/audits/smoke-iter3-2026-05-12T08-24-21Z.log` (committed via this audit)
- RAG audit: BG agent 1 output (above §3.1)
- Multimodal audit: BG agent 2 output (above §3.2)
- Handoff iter 4: `docs/handoff/2026-05-12-unlim-ralph-iter3-to-iter4-handoff.md`
- ADR-028 INTENT dispatcher: `docs/adrs/ADR-028-onnipotenza-intent-dispatcher-server-side.md`
- ADR-031 STT migration: `docs/adrs/ADR-031-stt-migration-voxtral-transcribe-2.md`
- RAG backfill script: `scripts/backfill/rag-metadata-backfill-iter14.mjs` + `match-chunks-to-lessons.mjs`
- Edge Function: `supabase/functions/unlim-chat/index.ts` (1181 LOC)
