# Iter 24+ Plan — Memoria + Multimodal + Latency improvements

**Data**: 2026-05-11
**Scope**: Iter 11-23 close 8.5/10 ONESTO. Iter 24+ improve 3 dimensioni weak + 6 problemi P1/P2/P3 carryover.
**Vincoli mandatory**: Principio Zero V3 (plurale "Ragazzi" + Vol/pag verbatim + max 120 parole + analogia opzionale) + Morfismo Sense 2 (kit fisico + volumi cartacei + software coerenza).

---

## 0. Diagnosi 3 dimensioni weak ULTRATHINK

### 0.1 Memoria persistente 7/10 — semantic hallucination

**Evidence iter 22 marathon 5×5**:
- Session 2: msg1 "Vol.2 cap.5 multimetro" → msg3 "Quale strumento?" → response cita **"batterie"** WRONG (Vol.2 cap.4 = batterie, NON cap.5 multimetro)
- Session 4: msg1 "Vol.1 cap.8 pulsante" → msg3 "Componente?" → response cita **"RGB"** WRONG (Vol.1 cap.7 = RGB, NON cap.8 pulsante)

**5 hypothesis ROOT CAUSE**:
1. Multi-row collision `unlim_session_memory` session_id reuse cross-bench
2. LLM retrieval drift (forceCitationFromSession injecta corretto MA LLM ignora narrative)
3. Race condition sessioni parallele scrambling
4. System prompt directive weak ("Ultimo esperimento: v1-cap8" + LLM cita RGB chapter precedente)
5. Telemetry compact override (circuitState con LED RGB → LLM cita RGB)

**Most likely**: #2 + #4 LLM ignora directive sistemica + cita chapter adjacency. Plus #1 possible if marathon test reuses session_id.

### 0.2 Multimodal 6/10 — Pixtral mock NO real test

**Evidence**: Voxtral TTS LIVE iter 31 voice clone Andrea (verified). Pixtral 12B endpoint `unlim-vision/index.ts` exists MA NEVER tested con real kit Omaric photo.

**3 hypothesis ROOT CAUSE**:
1. Pixtral endpoint code working MA few-shot prompt non ottimizzato kit Omaric specifici
2. GDPR on-device blur volti spec (iter 36 ADR-028) NOT verified runtime
3. Latency Pixtral vs Gemini Vision fallback chain non bench

### 0.3 Latency 7/10 — hot-path 409ms vs target <300ms

**Evidence iter 22**: hot-path safety/offtopic pre-LLM avg 409ms (miss +109ms target).

**4 hypothesis ROOT CAUSE**:
1. Supabase Edge Function cold start dopo idle ~200-300ms
2. **`loadStudentContext` sync await blocking in offtopic gentle bridge** (iter 21 introdotto: gentle bridge fa `await loadStudentContext` PRE return per recall session) → +200-300ms
3. Network latency Frankfurt EU + remote client RTT
4. Supabase region us-east-1 default vs EU optimal

**Most likely**: #2 iter 21 introduced overhead. Defer studentContext load → async fire-and-forget OR use cached.

---

## Phase 0 — Documentation Discovery (BEFORE implementation)

### Subagent Doc-1: Supabase Edge Function performance docs
- Read Supabase Edge Functions docs cold start mitigation patterns
- Find: `Deno.serve` vs `Deno.deploy` warm-up patterns
- Find: Connection pooling best practices `@supabase/supabase-js`
- Output: "Allowed APIs" list with citations + anti-patterns

### Subagent Doc-2: Mistral Pixtral 12B vision API
- Read Mistral La Plateforme docs `pixtral-12b-2409` model
- Find: image input formats accepted (base64, URL, multipart)
- Find: few-shot prompt patterns vision Italian K-12 examples
- Find: rate limits + cost per image
- Output: Pixtral API reference + GDPR best practices

### Subagent Doc-3: PostgreSQL session state RLS patterns
- Read Supabase RLS policies docs anonymous session pattern
- Find: how to handle session_id collision multi-tenant
- Find: best practices for last-N rows query optimization
- Output: schema recommendation `unlim_session_memory` v2 if needed

### Subagent Doc-4: Iter 18.5 + iter 22 evidence consolidate
- Re-read `docs/audits/2026-05-11-iter-11-23-CUMULATIVE-CLOSE-audit.md`
- Re-read `docs/audits/iter-22-test-sistematico-prod.md` brutal evidence
- Re-read `automa/state/iter-22-marathon-results.json` raw evidence
- Identify exact response strings + sessionId pattern collision
- Output: precise reproduction recipe for memoria hallucination

**Phase 0 Output consolidated**: `docs/plans/2026-05-11-iter-24-phase0-discovery.md`

---

## Phase 1 — Memoria semantic hallucination diagnose + fix (P1 3-4h)

### 1.1 Reproduce hallucination clean

Single-session controlled test:
- Run Q10 multi-msg session 5 distinct experiment IDs (v1-cap6 LED, v2-cap5 multimetro, v3-cap5 Blink, v1-cap8 pulsante, v2-cap7 condensatore)
- Verify `unlim_session_memory` row per session: 1 entry, `last_experiment_id` correct
- Verify msg2/msg3 short-prompt response: cita Vol/cap correct?
- Compare actual response vs DB state

### 1.2 System prompt directive STRENGTHEN

**File**: `supabase/functions/_shared/system-prompt.ts:400`

Current:
```
Ultimo esperimento sessione: ${lastExperimentId} (Vol.X cap.Y). Se utente dice "continuiamo" / "riprendiamo" SENZA specificare esperimento, USA questo come contesto + cita Vol.X cap.Y nel messaggio.
```

Iter 24 strengthen (3 elementi):
```
[REGOLA RICORDO SESSIONE — OBBLIGATORIA]
Ultimo esperimento sessione: ${lastExperimentId} (Vol.${currentVolume} cap.${currentChapter}).
VIETATO citare componenti di altri esperimenti (es. NO "RGB" se esperimento è "pulsante", NO "batterie" se è "multimetro").
SOLO componenti specifici del ${lastExperimentId}: [lista componenti hardcoded da volumi-citazioni.ts].
Se utente dice "continuiamo"/"riprendiamo"/"ricordi"/"cosa stavamo": SEMPRE cita ${lastExperimentId} + Vol.${currentVolume} pag.X verbatim.
```

### 1.3 `forceComponentValidation` NEW post-LLM

NEW function in `volumi-citazioni.ts`:
- Map lastExperimentId → componenti attesi list
- Strip response references a componenti OUT-of-scope
- Es: msg session v1-cap8 pulsante → response mentions "RGB" → strip "RGB" mentions + warn

### 1.4 `unlim_session_memory` cleanup multi-row defense

- Migration SQL add UNIQUE constraint check on insert
- Verify saveInteraction upsert `onConflict: 'session_id'` working as expected
- Add `INSERT INTO unlim_session_memory ... ON CONFLICT DO UPDATE SET ...` test integration

### 1.5 Verification checklist Phase 1
- ✅ 5 distinct sessions × 3 msg = 15 query, verbatim recall 13+/15 (target 87%+)
- ✅ NO hallucination batterie/RGB out-of-scope
- ✅ DB unlim_session_memory 1 row per session_id
- ✅ Iter 22 marathon 5×5 retry: 5/5 recall vs baseline 4/5
- ✅ pre-commit + pre-push hook vitest 13974 PASS

### 1.6 Anti-pattern guards Phase 1
- ❌ Don't break iter 18.5 schema migration backward compat
- ❌ Don't introduce blocking sync await in hot-path
- ❌ Don't strip legitimate component mentions when within-scope

---

## Phase 2 — Latency hot-path optimize (P2 2-3h)

### 2.1 Profile hot-path offtopic + safety latency

Tools:
- Edge Function logs `console.time` instrumentation
- Add response field `_timing: { pre_llm_ms: N, llm_ms: N, post_llm_ms: N }`
- Run 50 query stress + measure breakdown

### 2.2 Defer studentContext load offtopic path

**File**: `supabase/functions/unlim-chat/index.ts:260-280` (offtopic block)

Current iter 21:
```ts
const offSessionCtx = await loadStudentContext(sessionId).catch(() => null);
const hasSession = offSessionCtx?.lastExperimentId;
```

Iter 24 optimize: race with timeout 100ms:
```ts
const ctxPromise = loadStudentContext(sessionId).catch(() => null);
const timeoutPromise = new Promise<null>(r => setTimeout(() => r(null), 100));
const offSessionCtx = await Promise.race([ctxPromise, timeoutPromise]);
const hasSession = offSessionCtx?.lastExperimentId;
```

Trade-off: 100ms slow session fetch → no recall (fallback "prima volta" template). Acceptable for hot-path.

### 2.3 Edge Function warmup cron

Supabase cron job (`supabase_cron`):
- Every 30 seconds ping `unlim-chat` GET endpoint
- Keep instance warm
- Cost ~$0 (Edge cron free tier 1000 invocations/day)

Migration:
```sql
-- supabase/migrations/20260511_unlim_chat_warmup_cron.sql
SELECT cron.schedule(
  'unlim-chat-warmup',
  '*/30 * * * * *',
  $$ SELECT net.http_get(url:='https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat') $$
);
```

NOTE: iter 38 P0.A5 already shipped this in migration `20260430220000_unlim_chat_warmup_cron.sql`. Verify if applied prod via Supabase Management API.

### 2.4 Verification checklist Phase 2
- ✅ Hot-path safety/offtopic p50 ≤ 280ms (target -129ms vs iter 22 409ms)
- ✅ Cold start eliminated via cron warmup
- ✅ Total p95 LLM ≤ 3.0s
- ✅ Burst 20-concurrent preserved 100%

### 2.5 Anti-pattern guards Phase 2
- ❌ Don't break gentle bridge recall feature (only timeout if slow)
- ❌ Don't introduce new bottleneck (forceCitation* run fast)
- ❌ Don't disable safety/offtopic checks for latency

---

## Phase 3 — Multimodal Pixtral live real test (P1 3-4h)

### 3.1 Setup real kit Omaric photo

Andrea action:
- 5 foto smartphone kit Omaric breadboard:
  - LED Vol.1 cap.6 esp.1 corretto
  - LED Vol.1 cap.6 esp.2 senza resistore (errore)
  - Pulsante Vol.1 cap.8 esp.1
  - Multimetro Vol.2 cap.5 collegato in parallelo
  - Arduino Vol.3 cap.5 Blink pin 13
- Upload to `tests/fixtures/screenshots/real-kit-omaric/`

### 3.2 Few-shot prompt optimization Pixtral

**File**: `supabase/functions/_shared/mistral-vision.ts` (or `unlim-vision/index.ts`)

Add 3-shot prompt examples specifici kit Omaric:
```
Esempio 1 (LED Vol.1 cap.6 esp.1):
[Immagine: breadboard con LED rosso + resistore 470Ω + batteria 9V]
Response: "Ragazzi, vedo un LED rosso collegato in serie con un resistore da 470Ω, alimentato da batteria 9V. Polarità corretta. Vol.1 pag.27. [AZIONE:highlight:led1,r1]"

Esempio 2 (Pulsante Vol.1 cap.8):
[Immagine: breadboard con pulsante + LED + Arduino]
Response: "Ragazzi, vedo un pulsante collegato a Arduino digital pin con LED feedback. Manca resistore pull-down? Vol.1 pag.43. [AZIONE:highlight:button1]"

Esempio 3 (Errore - LED senza resistore):
[Immagine: LED collegato direttamente a 9V senza resistore]
Response: "Ragazzi, ATTENZIONE: LED collegato a 9V SENZA resistore = LED brucia! Aggiungete subito resistore 470Ω in serie. Vol.1 pag.32. [AZIONE:diagnose]"
```

### 3.3 GDPR on-device blur volti

Verify iter 36 ADR-028 implementation:
- Frontend `<CameraDiagnoseButton>` (iter 36 spec) → on-device face detection JS lib
- Pre-upload blur pixel scuri detected as face
- DPIA draft consolidated

### 3.4 Pixtral live bench 5 foto

Test:
- Upload 5 foto kit Omaric → unlim-chat POST with `images: [base64]`
- Verify Pixtral response includes:
  - Plurale "Ragazzi" opener
  - Componenti detection accurate
  - Vol/pag canonical citation
  - Errori comuni se applicable
  - [AZIONE:highlight:...] tag
- Measure latency Pixtral vs Gemini Vision fallback
- Cost calculation €/lezione

### 3.5 Verification checklist Phase 3
- ✅ 5/5 foto Pixtral response with correct component detection
- ✅ Plurale "Ragazzi" + Vol/pag verbatim
- ✅ Latency Pixtral ≤ 3.5s (vs Gemini Vision ~2.5s)
- ✅ GDPR on-device blur runtime verified
- ✅ Cost €0.0011/img × 20/lezione = €0.44/lezione confermato

### 3.6 Anti-pattern guards Phase 3
- ❌ Don't upload foto con volti studenti (GDPR Art.8 minori 8-14)
- ❌ Don't hardcode few-shot examples in system prompt (use separate file)
- ❌ Don't disable Gemini Vision fallback (if Pixtral down)

---

## Phase 4 — P2/P3 fix batch carryover iter 22 (2h)

### 4.1 P2 HTTP 503 rapid sequence
- Marathon evidence: 2/5 s5 msg fail 503
- Root cause: Mistral La Plateforme rate limit OR Edge Function timeout
- Fix: retry logic exponential backoff + fallback Gemini Flash

### 4.2 P3 D08 no bridge session active edge
- Edge case off-topic + active session NO recall fallthrough
- Fix: ensure gentle bridge ALWAYS uses session recall if available

### 4.3 P3 E06 no "Ragazzi" Arduino variant
- direct-operational variants NOT covered by iter 20 enforcer wire
- Verify all 5 variants:
  - direct-operational-arduino
  - direct-operational-scratch
  - direct-operational-led-mount
  - direct-operational-parallel-led
  - direct-operational-diagnosis
- Ensure ALL pass through enforceItalianK12Opener

### 4.4 Verification checklist Phase 4
- ✅ 50-query stress retry: 5/5 cat E PASS plurale opener
- ✅ Rapid sequence test: 5/5 msg s5 NO 503

---

## Phase 5 — Deferred iter 24+ Strategic (defer Andrea ratify)

### 5.1 RAG backfill prod 2777 chunks NULL metadata (P0)
- Andrea ratify required `ANDREA_RATIFY=1` env
- Matcher dry-run staging 830/1000 verify
- Sample 10 chunks pre-commit prod
- COMMIT prod 1881-2777 chunks aggiornamento chapter+page+section_title

### 5.2 88/94 esperimenti L2 template expand (P1 Morfismo)
- Current: 6/94 esperimenti template dedicato
- Plan: 30/94 entro iter 30 (Vol.1 cap.6-14 + Vol.2 cap.3-12 + Vol.3 cap.5-12 core 30)
- Template structure: composite handler L2 + Sense 1.5 morfismo

### 5.3 IBSE pedagogia schema 5 lesson-paths Vol.1 cap.6 LED pilota (P1)
- NEW schema `phases` 5-fase: domanda → ipotesi → hands-on → discussione → riflessione
- 5 esperimenti Vol.1 cap.6 pilota
- Wire system prompt detect fase corrente da timestamp

### 5.4 Teacher Dashboard backend MVP PNRR (P0 commerciale)
- 3 Edge Functions: teacher-classes-list + teacher-class-state + teacher-report-pdf
- Schema Supabase 3 tabelle
- RLS gated

---

## Phase 6 — CoV Verification + commit + push + R5+stress100q re-bench

### 6.1 Vitest baseline preserved
- 13974 PASS pre-iter-24, target ≥13990 post-iter-24 (+15 NEW tests for memoria + multimodal)
- ZERO regression

### 6.2 R5 50-prompt re-bench LIVE prod
- Target ≥92% PASS (preserve iter 17 baseline)
- Citation strict Vol/pag stable 100% cherry-pick
- Memoria Q10 verbatim ≥95% PASS

### 6.3 Stress 100q multi-dim re-bench
- Target ≥85% PASS (lift +7pp vs iter 22 78%)
- Cat B Memoria semantic hallucination ≤5% (vs iter 22 33%)
- Cat F telemetry resistore value cite ≥90%

### 6.4 Multimodal benchmark NEW
- 5 foto kit Omaric Pixtral live: 5/5 detect correct
- TTS Voxtral roundtrip: 5/5 audio mp3 valid
- STT CF Whisper: 5/5 transcript Italian

### 6.5 Commit cumulative iter 24
- Subset selettivo (NO `git add -A`)
- Pre-commit + pre-push hook PASS
- Push origin
- Tag git `v2.1-iter-24-close`

---

## Effort estimate

| Phase | Effort | Owner |
|---|---|---|
| 0 Doc Discovery (4 subagents parallel) | 30 min | Orchestrator |
| 1 Memoria semantic hallucination | 3-4h | Single-dev |
| 2 Latency hot-path optimize | 2-3h | Single-dev |
| 3 Multimodal Pixtral live | 3-4h | Andrea (foto) + Single-dev |
| 4 P2/P3 fix batch | 2h | Single-dev |
| 5 Strategic deferred | N/A (Andrea ratify) | Andrea |
| 6 CoV + commit + push + bench | 2h | Single-dev |
| **Total iter 24** | **12-15h** | **Single-dev** |

---

## Activation prompt prossima sessione

Paste-ready prompt to copy into next session start:

```
RIPRENDI Sprint U iter 24 — Memoria + Latency + Multimodal improvements

## Stato pre-iter-24

- Iter 11-23 close 8.5/10 ONESTO (anti-inflation G45 cap)
- 9 commits origin pushed iter 11-23
- Backend Edge Function `unlim-chat` 17° deploy LIVE prod
- Frontend Vercel `https://elabtutor.school` LIVE 200 OK
- Vitest 13974 PASS baseline 11958 (+2016 cumulative)
- Memoria UNLIM finally functional post iter 18.5 schema fix (`unlim_session_memory` NEW table)
- ZERO regression

## 3 dimensioni weak iter 24+ improve target

| Dimensione | Pre iter 24 | Target post |
|---|---|---|
| Memoria persistente | 7/10 (semantic hallucination s2 batterie/s4 RGB out-of-scope) | 9/10 |
| Multimodal vision/voice | 6/10 (Voxtral LIVE, Pixtral mock no real test) | 8/10 |
| Latency hot-path | 7/10 (409ms vs target <300ms) | 8.5/10 |

## File plan

Read full plan: `docs/plans/2026-05-11-iter-24-plan-memoria-multimodal-latency.md`

## Phase 0 — Documentation Discovery PRIMA implementation

Dispatch 4 subagents PARALLELI fact-gathering:

1. `Doc-1` Supabase Edge Function performance + cold start mitigation patterns
2. `Doc-2` Mistral Pixtral 12B vision API real image input + few-shot prompt patterns Italian K-12
3. `Doc-3` PostgreSQL session state RLS anonymous patterns + last-N rows optimization
4. `Doc-4` Re-read iter 22 marathon evidence raw responses for precise hallucination reproduction

Output consolidated `docs/plans/2026-05-11-iter-24-phase0-discovery.md`.

## Phase 1 — Memoria semantic hallucination fix (P1 3-4h)

ROOT CAUSE diagnosed iter 22:
- Hypothesis #2 + #4 LLM ignora directive sistemica + cita chapter adjacency
- Hypothesis #1 possible session_id collision multi-marathon

Action:
1. Reproduce hallucination clean single-session test (5 distinct experiments)
2. Strengthen system prompt directive "[REGOLA RICORDO SESSIONE — OBBLIGATORIA]" + VIETATO citare out-of-scope components
3. NEW `forceComponentValidation(lastExperimentId, response)` strip out-of-scope component mentions
4. `unlim_session_memory` UNIQUE constraint multi-row defense

Verify: 5 sessions × 3 msg = 15 query verbatim recall 13/15 PASS (87%+)

## Phase 2 — Latency hot-path optimize (P2 2-3h)

ROOT CAUSE: iter 21 gentle bridge introduced `await loadStudentContext` block hot-path → +200-300ms.

Action:
1. Instrument hot-path timing breakdown
2. Defer studentContext load offtopic path → Promise.race timeout 100ms
3. Verify Edge Function warmup cron migration `20260430220000` applied prod
4. Bench retry 50-query: hot-path p50 ≤ 280ms

## Phase 3 — Multimodal Pixtral live real test (P1 3-4h)

Andrea action prerequisite:
- 5 foto smartphone kit Omaric breadboard (LED correct, LED no resistor error, Pulsante, Multimetro, Arduino Blink)
- Upload `tests/fixtures/screenshots/real-kit-omaric/`

Action:
1. Add 3-shot Pixtral prompt examples specifici kit Omaric
2. Verify GDPR on-device blur volti runtime
3. Pixtral live bench 5 foto: detection accuracy + latency + cost

Verify: 5/5 foto Pixtral correct component detection + plurale "Ragazzi" + Vol/pag verbatim

## Phase 4 — P2/P3 fix batch (2h)

- P2 HTTP 503 rapid sequence retry exponential backoff
- P3 D08 no bridge session active edge case
- P3 E06 no "Ragazzi" Arduino variants 5 direct-operational sources

## Phase 5 — Strategic deferred Andrea ratify

DEFER iter 25+ session dedicata:
- RAG backfill prod 2777 chunks NULL metadata (ANDREA_RATIFY=1)
- 88/94 esperimenti L2 template expand
- IBSE pedagogia schema 5 lesson-paths
- Teacher Dashboard backend MVP PNRR

## Phase 6 — CoV verification + commit + push + bench

1. Vitest baseline 13974+ PASS preserved
2. R5 50-prompt LIVE prod ≥92% PASS
3. Stress 100q multi-dim ≥85% PASS (vs iter 22 78%)
4. Multimodal benchmark 5 foto Pixtral
5. Commit selettivo iter 24 + push origin + tag `v2.1-iter-24-close`

## Vincoli mandatory PRESERVED

- Principio Zero V3: plurale "Ragazzi" + Vol/pag verbatim + max 120 parole + analogia opzionale
- Morfismo Sense 2: kit fisico + volumi cartacei + software coerenza
- CoV mandate: NO `--no-verify`, ZERO regression test count
- Anti-inflation G45: NO claim 10/10 senza measure, NO compiacenza
- Andrea brutal mandate: test connettori massicci, sistematico scientifico evidence brutale

## Effort total iter 24

12-15h single-dev. Multi-day session OR concentrated 2-day sprint.

GO/STOP decision Andrea Phase 0 entrance.
```

---

## File generated

- `docs/plans/2026-05-11-iter-24-plan-memoria-multimodal-latency.md` (this file)
- Next session output: `docs/plans/2026-05-11-iter-24-phase0-discovery.md` (Phase 0)

---

## Honesty disclosure ULTRATHINK

- Memoria 7/10 score = 1 single test PASS post iter 18.5 + 4/5 marathon + 2 hallucination = ONESTO mid-range
- Multimodal 6/10 = Voxtral verified LIVE iter 31 + Pixtral mock NEVER tested real = HONEST low end
- Latency 7/10 = 409ms hot-path miss vs target + LLM p95 OK = HONEST mid
- 5+ hypothesis ROOT CAUSE diagnosed (NOT assumed)
- Most likely #2 + #4 system prompt + LLM drift (memoria), #2 sync await (latency)
- Effort 12-15h = realistic NOT optimistic 8h
- Andrea action prerequisite (foto kit Omaric) explicit for Phase 3
- Phase 0 doc discovery MANDATORY before implementation per make-plan skill

NO compiacenza. NO inflation. Real diagnosis + concrete actionable plan.

---

*Co-Authored-By: Claude Opus 4.7 (1M context) — Make-plan skill iter 24*
