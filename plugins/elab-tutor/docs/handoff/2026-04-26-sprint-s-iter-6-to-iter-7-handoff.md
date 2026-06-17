# Sprint S iter 6 Phase 1 → iter 7 Handoff

**Date**: 2026-04-26 23:30 CEST (autonomous loop tick 50+, scribe-opus iter 6 Phase 2 close)
**Author**: scribe-opus iter 6
**Sprint**: S — Onniscenza + Onnipotenza
**Iter close**: 6 Phase 1 (post 4-agent OPUS parallel + scribe Phase 2 sequential)
**Score iter 6 P1 close ONESTO**: **7.5/10** (vs 6.55 iter 5 close = +0.95 lift)
**Iter 7 target**: 8.0+/10

---

## 1. ACTIVATION STRING (paste-ready iter 7 next session)

```
Sprint S iter 7 START. Pattern S 4-agent OPUS Phase 1 + scribe Phase 2 sequential (race-cond fix validated iter 6 P1).

Read precondition:
- docs/audits/2026-04-26-sprint-s-iter6-PHASE1-FINAL-audit.md (score 7.5/10 ONESTO)
- docs/handoff/2026-04-26-sprint-s-iter-6-to-iter-7-handoff.md (this file)
- /Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/PROMPT-PER-TEA-2026-04-26-AGGIORNATO.md (Tea brief refresh)
- automa/team-state/messages/scribe-iter6-phase2-to-orchestrator-*.md
- CLAUDE.md (Sprint S sezione completa, iter 1-6 closure)

Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/

Iter 7 P0 priorities (Andrea actions BEFORE 4-agent OPUS dispatch):
1. Andrea Voyage AI signup (5 min, voyageai.com) → VOYAGE_API_KEY
2. Andrea Edge Function deploy unlim-tts (Isabella Neural prod live)
3. Andrea Vision E2E run Playwright (5 fixtures prod, ELAB_API_KEY + class_key TEST-VISION-E2E)
4. Andrea Python 3.11 brew install OR Voyage cloud path (RAG ingest 6000 chunks)

Iter 7 4-agent OPUS Phase 1 (parallel):
- planner-opus: 8-10 ATOM-S7 atoms decompose (postToVisionEndpoint + Hybrid RAG retriever + R6 expand 10→100 + memory cache pgvector wire)
- architect-opus: ADR-015 Hybrid RAG retriever (BM25+dense+RRF) + ADR-016 R6 stress execution gate
- generator-app-opus: postToVisionEndpoint sub-handler (ADR-013 D4) + Hybrid RAG retriever wire-up + memory cache TTL pgvector adapter (ADR-013 D5)
- generator-test-opus: R6 fixture expand 10→100 prompts + Hybrid RAG unit tests + Vision E2E baseline assert 5/5 PASS

Iter 7 scribe-opus Phase 2 (SEQUENTIAL after Phase 1 completion 4/4):
- audit doc iter 7 + handoff iter 7→8 + wiki extension 100→110 + CLAUDE.md APPEND

Iter 7 hard rules: NO push main, NO merge, NO deploy autonomous, --no-verify forbidden, Karpathy 4 principles, Pattern S file ownership rigid.

Score target iter 7: 8.0+/10 ONESTO (NO inflation, file-system verified).
```

---

## 2. State entry iter 7 (post iter 6 P1 close ~7.5/10)

| Box | Stato iter 6 P1 close | Score | Note |
|-----|----------------------|-------|------|
| 1 VPS GPU | Pod TERMINATED Path A | 0.4 | iter 5 P3 decision, no change |
| 2 7-component stack | 5/7 deployed | 0.4 | Coqui+ClawBot+BGE-M3 fix iter 7+ |
| 3 RAG 6000 chunks | NOT ingested (Python crash) | 0.0 | Voyage signup OR Python 3.11 fix iter 7 P0 |
| 4 Wiki 100/100 | LIVE | 1.0 | iter 5 close raggiunto |
| 5 UNLIM v3 + R0 ≥85% | LIVE 91.80% | 1.0 | Edge Function deployed iter 5 P3 |
| 6 Hybrid RAG | NOT live | 0.0 | depend RAG ingest |
| 7 Vision flow | spec ready 262 LOC | **0.3** | NOT executed prod (5/5 fixtures Playwright) |
| 8 TTS+STT | Isabella code shipped | **0.7** | Edge Function deploy pending Andrea |
| 9 R5 ≥90% | LIVE 91.80% | 1.0 | Edge Function deployed iter 5 P3 |
| 10 ClawBot composite | composite-handler.ts shipped | **0.6** | postToVisionEndpoint sub-handler iter 7 |

**Box subtotal iter 6 P1**: 5.4/10
**Bonus deliverables iter 3-6 cumulative**: 2.1
**TOTAL iter 6 P1 close ONESTO**: **7.5/10**

---

## 3. Iter 7 P0 (Andrea actions + 4-agent OPUS work)

### 3.1 Andrea Voyage AI signup (5 min)

**Browser path**:
1. https://voyageai.com → Sign Up (email + password)
2. Dashboard → API Keys → Create Key (free tier 50M tokens/mo)
3. Copy `pa-...` key

**ENV iter 7 entrance**:
```bash
export VOYAGE_API_KEY=pa-...
echo 'export VOYAGE_API_KEY=pa-...' >> ~/.zshrc
```

**Cost estimate**: 6000 chunks × ~500 tokens avg × 1 model = 3M tokens single ingest. Cost <$1 (free tier covers).

### 3.2 Andrea Edge Function deploy unlim-tts (Isabella Neural prod live)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc

SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN \
  npx supabase functions deploy unlim-tts \
  --project-ref euqpdueopmlllqjmqnyb
```

Verify post-deploy:
```bash
curl -X POST \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "X-Elab-Api-Key: $ELAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Ciao ragazzi, sono UNLIM."}' \
  "https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-tts" \
  --output /tmp/test-isabella.mp3

# Play file mac:
afplay /tmp/test-isabella.mp3
```

Box 8 lift atteso post deploy + Andrea ear-test: 0.7 → **0.85** (live prod conferma).

### 3.3 Andrea Vision E2E run Playwright

**Pre-req setup** (Andrea SQL Supabase Studio):
```sql
-- Create class_key fixture TEST-VISION-E2E
INSERT INTO classes (class_key, class_name, teacher_id, created_at)
VALUES ('TEST-VISION-E2E', 'Test Vision E2E', null, NOW())
ON CONFLICT DO NOTHING;
```

**Run prod Playwright**:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc

ELAB_API_KEY=$ELAB_API_KEY \
VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
TEST_CLASS_KEY=TEST-VISION-E2E \
  npx playwright test \
  --config=tests/e2e/playwright.config.js \
  tests/e2e/02-vision-flow.spec.js \
  --headed
```

5 fixtures expected (per ADR-012 D3):
1. LED OK (resistance + correct polarity)
2. LED no resistance (PZ block expected)
3. LED reverse polarity (warn fixture)
4. Wire missing (PZ block expected)
5. Power off (warn fixture)

Box 7 lift atteso post 5/5 PASS: 0.3 → **0.7** (live prod conferma + invariant 7 met).

### 3.4 Andrea RAG ingest path (Voyage cloud OR Python 3.11)

**Path A RECOMMENDED — Voyage cloud** (no GPU dependency, ~$1, ~50min):
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc
node scripts/rag-contextual-ingest-voyage.mjs
```

Output expected:
- 6000+ chunks ingested Supabase pgvector
- Cost ~$0.50-$1
- ETA ~50min M4 MPS

**Path B alt — Python 3.11 + retry local**:
```bash
brew install python@3.11
cd /Users/andreamarro/.virtualenvs
python3.11 -m venv elab-rag-py311
source elab-rag-py311/bin/activate
pip install transformers==4.57 torch sentence-transformers
# retry ingest script local
```

ETA ~2h (debug) + risk Python regex circular import resta.

Box 3 lift atteso post Voyage ingest 6000 chunks: 0.0 → **1.0**.

### 3.5 Iter 7 4-agent OPUS Phase 1 (parallel) + scribe Phase 2 sequential

**Phase 1 parallel (planner+architect+gen-app+gen-test)**:

**planner-opus iter 7**:
- 8-10 ATOM-S7-* atoms
- Sprint contract iter 7
- 4 dispatch messages

**architect-opus iter 7**:
- **ADR-015 Hybrid RAG retriever** (BM25 + Voyage dense + RRF k=60, post-RAG-ingest)
- **ADR-016 R6 stress execution gate** (100 prompts validation rules + telemetry chunk-level)

**generator-app-opus iter 7**:
- `scripts/openclaw/composite-handler.ts` extension `postToVisionEndpoint` sub-handler (ADR-013 D4)
- `src/services/hybridRagRetriever.js` NEW (ADR-015 BM25 + dense + RRF)
- `scripts/openclaw/tool-memory.ts` adapt CompositeMemoryAdapter → pgvector cache TTL 24h (ADR-013 D5)

**generator-test-opus iter 7**:
- `scripts/bench/r6-fixture.jsonl` expand 10 → 100 prompts (ADR-014 D1: 40 RAG + 30 multi-vol + 20 temporal + 10 deep)
- `tests/unit/hybridRagRetriever.test.js` NEW (ADR-015 unit cases)
- `tests/e2e/02-vision-flow.spec.js` baseline assert post Andrea run 5/5 PASS

**Phase 2 sequential (scribe-opus AFTER Phase 1 4/4 completion messages)**:
- audit iter 7 (~300 LOC)
- handoff iter 7 → 8 (~300 LOC)
- wiki extension 100 → 110 (kebab-case capstone concepts)
- CLAUDE.md APPEND iter 7 close section
- Tea brief refresh aggiornato (post Tea check-in se collaborativa Tea risponde)

---

## 4. Iter 7 P1 priorities

### 4.1 ClawBot postToVisionEndpoint sub-handler full integration

ADR-013 D4 design: `postToVisionEndpoint(args, ctx) → CompositeStepResult`

Wire-up:
- Edge Function `unlim-chat` con images array (ADR-012 D1) deploy first iter 7 P0 (Andrea)
- `postToVisionEndpoint` chiama callLLMWithFallback con `images: [base64]` + Gemini Vision EU primary
- ClawBot composite `analyzeImage` ora e2e-ready (sub-step screenshot + sub-step diagnose + sub-step audit)

ETA gen-app iter 7: 4-6h (1 sub-handler + integration test 5 cases).

### 4.2 Hybrid RAG retriever wire-up (post-RAG-ingest)

ADR-015 design (architect-opus iter 7):
- BM25 sparse retrieval (keyword match)
- Voyage dense retrieval (semantic)
- RRF fusion k=60 (Reciprocal Rank Fusion)
- top-k=10 chunks default
- telemetry `rag_chunks_retrieved` Edge Function audit

Box 6 Hybrid RAG lift atteso: 0.0 → **0.7** post wire-up + R6 baseline rag_match_rate ≥80%.

### 4.3 R6 fixture expansion 10 → 100 prompts

ADR-014 D1 100 prompts target post-RAG-ingest:
- 40 `rag_retrieval_accuracy` (cite Vol/pag retrieved)
- 30 `multi_volume_synthesis` (Vol1+Vol2+Vol3 cross-volume)
- 20 `temporal_continuity` (refer "lezione precedente" + memoria student)
- 10 `deep_concept_retrieval` (capstone)

Pass gate ≥85% overall + ≥80% per category (multi-vol + temporal lasco 70%).

### 4.4 Memory cache TTL 24h pgvector wire-up (ADR-013 D5)

`scripts/openclaw/tool-memory.ts` extension:
- pgvector adapter `CompositeMemoryAdapter`
- TTL 24h cache `composite_cache` Supabase table
- `lookup(key) → {hit, value, cached_at}` SELECT WHERE created_at > NOW() - INTERVAL 24 HOURS
- `store(key, value)` UPSERT with `ON CONFLICT (input_hash) DO UPDATE`

ETA gen-app iter 7: 3-4h.

---

## 5. Iter 7 P2 priorities

### 5.1 Stress test prod Playwright iter 8 entrance gate

Per SPEC iter 4 §11:
- 50+ Playwright fixtures prod
- Control Chrome MCP integration test browser flow
- Audit chunk-level RAG retrieval telemetry
- Pass gate >90% overall + 0 PZ violations

ETA orchestrator iter 7+ stress: 2-3h batch.

### 5.2 Wiki extension 100 → 110 kebab-case capstone

Concepts target iter 7:
- sensore-pir.md (movimento PIR Vol.3)
- encoder-rotativo.md
- stepper-motor.md
- accelerometro-mpu6050.md
- bluetooth-hc05.md
- ir-receiver.md
- rfid-mfrc522.md
- gps-neo6m.md
- ultrasonic-hc-sr04.md
- joystick-analogico.md

Box 4 wiki resta 1.0 (già 100/100), bonus deliverable +0.1 cumulative.

---

## 6. ADR-014 R6 fixture expansion 10 → 100 prompts post-RAG-ingest

Detail expansion (gen-test iter 7):

**40 rag_retrieval_accuracy** (verifica chunk specific retrieved):
- Vol1.pag27 (capitolo lampadina Edison)
- Vol1.pag19 (resistenza Ohm)
- Vol2.pag8 (LED forward voltage)
- Vol3.pag52 (MOSFET canale N)
- Vol3.pag45 (PWM analogWrite)
- ... (35 prompts cite chunk_id verificable da `rag_chunks_retrieved` audit)

**30 multi_volume_synthesis** (cross-volume reasoning):
- Vol1 ohm + Vol2 LED → I = (V_in - V_LED) / R
- Vol2 sensori + Vol3 stepper → encoder rotativo position tracking
- Vol1 batterie + Vol3 ESP32 → battery life calculation
- ... (27 prompts span 2-3 volumes)

**20 temporal_continuity** (memoria sessioni precedenti):
- "Ricordi nell'esperimento di ieri quando..."
- "Cosa avevamo concluso sul condensatore?"
- ... (richiede Supabase student_sessions FK)

**10 deep_concept_retrieval** (capstone complexity):
- MOSFET enhancement vs depletion mode
- Matrice LED 8x8 multiplexing MAX7219
- I2C vs SPI vs UART trade-off
- ADC sample rate Nyquist
- ... (10 prompts edge case)

Run script (architect-opus ADR-014 §3): `scripts/bench/run-sprint-r6-stress.mjs`.

---

## 7. 10 honesty caveats iter 7 entrance

1. **Voyage signup pending Andrea action 5min**: Box 3 = 0.0 fino a Voyage cloud key + ingest 6000 chunks completato.
2. **Edge Function unlim-tts deploy pending Andrea action 5min**: Box 8 lift 0.7 → 0.85 ONLY post deploy + ear-test Isabella voice quality.
3. **Vision E2E spec NOT executed iter 6**: Box 7 = 0.3 fino a Andrea Playwright run 5 fixtures prod + assert 5/5 PASS.
4. **Python 3.9 regex circular import**: ingest local crashed iter 6. Path A Voyage cloud raccomandato (no Python upgrade dependency).
5. **postToVisionEndpoint sub-handler NOT shipped iter 6**: Box 10 = 0.6 fino a gen-app iter 7 ship + integration test 5 cases.
6. **Memory cache TTL 24h pgvector adapter NOT wired iter 6**: ADR-013 D5 design only, gen-app iter 7 deve adapt `tool-memory.ts`.
7. **Hybrid RAG retriever depend RAG ingest**: Box 6 = 0.0 fino a R6 baseline rag_match_rate ≥80% (gate iter 7+).
8. **R6 fixture 10 seed → 100 expand**: gen-test iter 7 expand 90 prompts addizionali post-RAG-ingest.
9. **Stale TDD test `tests/unit/multimodalRouter.test.js > tts defers Tammy Grit`**: gen-test iter 7 deve aggiornare OR delete (Tammy Grit obsoleto).
10. **No deploy iter 7 autonomous Pattern S hard rule**: NO push main, NO merge, NO `--no-verify`, NO `supabase functions deploy`. Andrea OK gate richiesto.

---

## 8. Box lift projection iter 7 close

| Box | Pre iter 7 | Post iter 7 (target) | Δ | Driver |
|-----|-----------|----------------------|---|--------|
| 1 VPS GPU | 0.4 | 0.4 | 0 | Pod TERMINATED, no change planned |
| 2 7-component stack | 0.4 | 0.5 | +0.1 | Voyage stack adds 1 component |
| 3 RAG 6000 chunks | 0.0 | **1.0** | +1.0 | Voyage cloud ingest |
| 4 Wiki 100 | 1.0 | 1.0 | 0 | (110 kebab-case bonus) |
| 5 UNLIM v3 R0 | 1.0 | 1.0 | 0 | LIVE |
| 6 Hybrid RAG | 0.0 | **0.7** | +0.7 | Hybrid retriever wire-up post-ingest |
| 7 Vision flow | 0.3 | **0.7** | +0.4 | Andrea Playwright run 5/5 PASS |
| 8 TTS+STT | 0.7 | **0.85** | +0.15 | Andrea deploy unlim-tts live |
| 9 R5 ≥90% | 1.0 | 1.0 | 0 | LIVE |
| 10 ClawBot composite | 0.6 | **0.8** | +0.2 | postToVisionEndpoint shipped |

**Box subtotal iter 7 target**: 5.4 → **6.95** (+1.55 lift).
**Bonus iter 3-7 cumulative**: 2.1 → **2.3** (+0.2).
**Score iter 7 target**: 7.5 → **9.25/10** OPTIMISTIC, **8.0+/10** REALISTIC ONESTO (depend Andrea actions).

---

## 9. Pattern S race-cond fix continuity

Iter 6 P1 validated Pattern S (Phase 1 4-agent parallel → Phase 2 sequential scribe). Continuous applicabile iter 7:

**Phase 1 (parallel)**:
- planner-opus emit message FIRST
- architect-opus + gen-app-opus + gen-test-opus parallel dopo planner
- 4/4 completion messages → orchestrator inbox

**Phase 2 (sequential)**:
- scribe-opus PHASE 2 START ONLY post 4/4 messages confirmed filesystem barrier
- NO write conflict src/ tests/ docs/adrs/ (file ownership rigid)

**Phase 3 (orchestrator)**:
- /quality-audit + score 10 boxes
- commit + push branch (NO main, NO merge)
- stress test prod Playwright + Control Chrome MCP

---

## 10. Open blockers iter 7

1. **Andrea Voyage signup** (5 min) — Box 3 unblock
2. **Andrea Edge Function unlim-tts deploy** (5 min) — Box 8 live
3. **Andrea Vision E2E run** (10 min + 5 fixtures × 30s) — Box 7 lift
4. **Andrea SQL TEST-VISION-E2E class_key fixture** (1 min) — Vision spec pre-req
5. **Voyage RAG ingest run** (50 min M4 MPS, autonomous post key) — Box 3 → 1.0

ETA iter 7 unblock: ~1h Andrea actions + 50min ingest BG = **~2h totale** iter 7 entrance.

---

## 11. SPRINT_S_COMPLETE projection

Realistic SPRINT_S_COMPLETE iter 8-10 (3-5 iter remaining post iter 6 P1):
- Iter 7 target 8.0+/10 ONESTO
- Iter 8 target 8.5/10 (stress test + Hybrid RAG validate)
- Iter 9 target 9.0/10 (Vision LIVE prod + 80-tool full)
- Iter 10 SPRINT_S_COMPLETE 9.5+/10 (10/10 boxes ≥0.8)

---

**END handoff iter 6 P1 → iter 7**.

Activation string §1 paste-ready. Score iter 6 P1 close ONESTO **7.5/10**. Andrea P0 actions chain ~1h iter 7 entrance.
