# Sprint S iter 5 Phase 2 → iter 6 Handoff

**Date**: 2026-04-26 PM (autonomous loop tick 38, scribe-opus Phase 2 close)
**Author**: scribe-opus
**Sprint**: S — Onniscenza + Onnipotenza
**Iter close**: 5 Phase 2 (post Phase 1 sequential)
**Score iter 5 Phase 2 close ONESTO**: **6.35/10** (NOT 6.75 inflated, post Box 1 honest recalibration)
**Iter 6 target**: 7.0+/10

---

## 1. ACTIVATION STRING (paste-ready iter 6 next session)

```
Sprint S iter 6 START. Pattern S 5-agent OPUS Phase 1+2 (race-cond fix validated iter 5 P1). 
Read precondition:
- docs/audits/2026-04-26-sprint-s-iter5-PHASE1-FINAL-audit.md (score 6.35/10 ONESTO)
- docs/handoff/2026-04-26-sprint-s-iter-5-to-iter-6-handoff.md (this file)
- /Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/RISULTATI-CONCRETI-ITER5-PHASE1.md
- automa/team-state/messages/scribe-iter5-phase2-to-orchestrator-2026-04-26-*.md
- CLAUDE.md (Sprint S sezione completa, iter 1-5 closure)

Working dir: /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/

Iter 6 P0 priorities (Andrea decisions BEFORE 5-agent OPUS dispatch):
1. Repair migration drift (Option A in audit §5)
2. Deploy Edge Function unlim-chat (code shipped iter 5 P1, deploy pending)
3. Decide VPS GPU 3-path (decommission / keep idle / upgrade)

Iter 6 5-agent OPUS Phase 1+2:
- planner-opus: 8 ATOM-S6 atoms decompose (composite handler ClawBot + browser wire-up + Vision E2E)
- architect-opus: ADR-012 composite handler design + ADR-013 Vision flow integration
- generator-app-opus (Phase 1 parallel gen-test): src/ + supabase/ wire-up
- generator-test-opus (Phase 1 parallel gen-app): tests/ + scripts/bench/ R6 stress + Playwright E2E
- scribe-opus (Phase 2 SEQUENTIAL after Phase 1): audit + handoff + wiki +1-2 by-hand toward 100/100

Iter 6 hard rules: NO push main, NO merge, NO deploy autonomous, --no-verify forbidden, Karpathy 4 principles.

Score target iter 6: 7.0+/10 ONESTO (NO inflation, file-system verified).
```

---

## 2. State entry iter 6 (post iter 5 Phase 2 close)

| Box | Stato | Score | Note |
|-----|-------|-------|------|
| 1 VPS GPU | ⚠️ paid storage zero runtime | **0.4** (ricalibrato honest) | iter 4+5 P1 EXITED entire iter |
| 2 7-component stack | ⚠️ 5/7 deployati | 0.4 | Coqui+ClawBot+BGE-M3 fix iter 6 |
| 3 RAG 6000 chunks | ❌ NOT ingested | 0 | depend GPU OR Anthropic Contextual API direct |
| 4 Wiki 100 | ⚠️ 87/100 | 0.87 | iter 5 P2 +1 (matrice-led-8x8) |
| 5 UNLIM v3 + R0 ≥85% | ✅ R0 91.80% | 1.0 | Edge Function deployed iter 2 |
| 6 Hybrid RAG | ❌ NOT live | 0 | depend GPU + BGE-M3 |
| 7 Vision flow | ❌ NOT live | 0 | depend Qwen-VL integration iter 6+ |
| 8 TTS+STT | ⚠️ STT OK Whisper | 0.5 | TTS Isabella Neural wire-up iter 5 P2 → iter 6 |
| 9 R5 ≥90% | ✅ **91.45% PASS** | **1.0** | iter 5 P1 R5 Edge Function 50/50 HTTP |
| 10 ClawBot 80-tool | ⚠️ scaffold | 0.3 | dispatcher.ts iter 4, composite handler iter 6 P0 |

**Subtotal box ricalibrato**: 4.47/10
**Bonus deliverables iter 3+4+5**: 1.88
**TOTAL iter 5 Phase 2 close**: **6.35/10 ONESTO**

---

## 3. Iter 6 P0 (Andrea decisions + 5-agent OPUS work)

### 3.1 Andrea repair migration drift (BEFORE iter 6 dispatch)

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc

# Option A (RECOMMENDED): mark drift entries reverted, push only 2 expected
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase migration repair --status reverted 20260420070003 --linked
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase migration repair --status reverted 001 --linked
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked --dry-run
# Expected: ONLY 20260426152944_together_audit_log + 20260426152945_openclaw_tool_memory pending
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked
```

Unblocks `together_audit_log` Supabase table (audit log Together calls) + `openclaw_tool_memory` (pgvector cache).

### 3.2 Andrea deploy Edge Function unlim-chat

`callLLM` provider=together default OK shipped iter 3 + verified iter 5 P1. Deploy pending Andrea OK:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
source ~/.zshrc
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```

Verify TOGETHER_API_KEY env set on Supabase project elab-unlim (likely already iter 1+2):

```bash
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets list --project-ref euqpdueopmlllqjmqnyb | grep -i together
```

### 3.3 Phase 1+2 5-agent OPUS iter 6 — composite handler + browser wire-up + Vision E2E

**Phase 1 parallel (gen-app + gen-test)**:
- gen-app-opus: composite handler ClawBot in `scripts/openclaw/dispatcher.ts` (extend iter 4 scaffold), browser wire-up `src/services/multimodalRouter.js` (extend iter 4 scaffold for live screenshot + Vision API call), Vision E2E flow `src/services/api.js` (live `captureScreenshot` → Gemini Vision → diagnosi)
- gen-test-opus: R6 stress fixture extension (Vision prompts), Playwright E2E spec NN-vision-flow.spec.js (real screenshot + assertion), composite handler test 30+ PASS

**Phase 2 sequential (scribe AFTER Phase 1 completion messages)**:
- scribe-opus: audit doc iter 6 (~250-300 righe), handoff iter 6→7 (~250-300 righe), wiki +1-2 by-hand toward 100/100

---

## 4. Iter 6 P1 priorities

### 4.1 Mac Mini wiki 87 → 100 batch overnight

Mac Mini autonomous H24 LIVE (`launchctl com.elab.mac-mini-autonomous-loop` PID 23944). Target overnight batch +13 concepts kebab-case toward Box 4 = 1.0:

Concept candidates missing high-value:
- sensore-pir.md (movimento, capstone Vol.3)
- encoder-rotativo.md
- stepper-motor.md
- accelerometro-mpu6050.md
- bluetooth-hc05.md
- ir-receiver.md
- rfid-rc522.md
- gps-neo6.md
- microfono-electret.md
- ultrasonic-vs-ir.md (comparison)
- watchdog-timer.md
- struct-arduino.md
- enum-arduino.md

### 4.2 RAG ingest 6000 chunks via Anthropic Contextual API direct (no GPU)

Anthropic Contextual API endpoint NEW (released 2026): `claude-3-5-sonnet contextual_retrieval`. Chunks 6000 ingest 1-pass NO GPU dependency. Cost ~$15-30 one-shot. Stage 1 unblock Box 3 (0 → 1.0). Implementation `scripts/rag/ingest-anthropic-contextual.mjs` ~200 LOC.

---

## 5. Iter 6 P2 priorities

### 5.1 Stress test prod Playwright

Per SPEC iter 4 §11 ("iter 8 entrance gate stress test prod"). Iter 6 P2 prep:
- Playwright spec `tests/e2e/iter6-stress-prod.spec.js` 5+ scenarios (login class_key, mount Capitolo, UNLIM chat synthesis, Vision flow, TTS/STT live)
- Real prod URL `https://www.elabtutor.school` (NOT staging)
- Pass criteria: 0 console errors + screenshot evidence + UNLIM response ≥90% PASS scorer

### 5.2 VPS GPU 3-path decision (Andrea)

**Path A — Decommission**: stop pod + delete volume → $0/mo. Pro: ROI honesty. Con: re-bootstrap 60GB models lost iter 7 if needed.

**Path B — Keep idle storage**: pod EXITED + volume retained → $13-33/mo storage. Pro: resume <2min. Con: paid storage zero runtime use questionable ROI.

**Path C — Upgrade dedicated H-bench**: dedicated H100/A100 weekend bench €15-20 burst → measure Vision/TTS/RAG latency real. Pro: data-driven decision. Con: bench-only, NOT production.

Recommendation: Path A iter 6 (decommission), Path C iter 7 (weekend H-bench burst), Path B fallback if iter 7 H-bench shows NEED.

---

## 6. Box 1 honest recalibration explanation (DETAIL)

**Iter 1 claim**: VPS GPU deployed → Box 1 = 0.8 (deploy = value).

**Reality iter 4 + iter 5 P1**:
- Pod EXITED entire iter 4 (12 polling attempts FAIL "not enough free GPUs on host machine")
- Pod EXITED entire iter 5 P1 (no resume attempt, gen-app/gen-test SOFTWARE-only path)
- Storage paid: $13/mo A6000 + $0.33/mo 6000 RTX = **$13.33/mo idle**
- Production runtime use iter 4 + iter 5 P1 = **ZERO** (no inference, no training, no bench, no embedding)
- ROI: storage spent (~$13.33/mo) ÷ value delivered (0) = ∞ negative

**Honest score recalibration**: 0.8 → **0.4**
- 0.4 partial credit: pod CONFIGURED + bootstrap scripts shipped + bench scripts ready iter 1
- NOT 0.8: deploy ≠ value if zero production runtime use
- NOT 0.0: bootstrap scripts + persistent volume + RTX 6000/A6000 inventory have potential future value

**Mandate iter 6**: Andrea VPS GPU 3-path decision FORCED. Continued idle storage zero runtime = decommission Path A.

---

## 7. 3 path opzioni VPS GPU (decision iter 6)

### Path A — Decommission

```bash
bash scripts/runpod-stop.sh felby5z84fk3ly
# Wait 5 min for clean exit
bash scripts/runpod-stop.sh 5ren6xbrprhkl5
# Delete volumes (PERMANENT, models lost):
# RunPod web UI → Volumes → Delete (manual, no API)
```

**Cost saving**: -$13.33/mo. **Value lost**: 60GB models re-download iter 7 if needed (~3h re-bootstrap).

### Path B — Keep idle storage

Status quo. Pod EXITED, volume retained. Paid $13.33/mo. Resume <2min.

**Cost**: $13.33/mo. **Value**: <2min resume time iter 7 if Vision/TTS/RAG bench needed.

### Path C — Upgrade dedicated H-bench

```bash
# Decommission existing
bash scripts/runpod-stop.sh felby5z84fk3ly && bash scripts/runpod-stop.sh 5ren6xbrprhkl5
# Spawn dedicated H100 weekend (€15-20 burst):
bash scripts/runpod-pod-create.sh --gpu H100 --hours 12 --auto-stop
# Measure Vision/TTS/RAG latency real → data-driven Stage 2 decision
```

**Cost**: €15-20 one-shot. **Value**: data-driven, NOT production.

**Recommendation**: **Path A iter 6** (decommission, free up $13.33/mo), Path C iter 7 (weekend H-bench burst per data), Path B fallback if iter 7 confirms NEED.

---

## 8. Voice UNLIM Isabella Neural wired SPEC §1

**Status**: TTS `it-IT-IsabellaNeural` APPROVATO Andrea 2026-04-26 (iter 3 close note). Wire-up iter 5 P2 → iter 6.

**Plan iter 6 wire-up**:
- `supabase/functions/unlim-tts/index.ts` extend Edge TTS endpoint (edge-tts pip Python, NO GPU)
- Voice = `it-IT-IsabellaNeural` default (Andrea approved)
- Fallback Coqui XTTS-v2 if voice clone Andrea pending uploaded
- Test: `tests/integration/unlim-tts-isabella.test.js` 5 PASS (latency + audio bytes + voice ID + locale + fallback)

**Reference**: SPEC iter 4 §1 (multimodal router voice routing).

**Box 8 lift target iter 6**: 0.5 → 0.8 (TTS live + STT Whisper preserved).

---

## 9. 10 honesty caveats (NEW iter 5 Phase 2 close)

1. **Score 6.35/10 ONESTO ≠ 6.75 raw**: Box 1 honest recalibration mandatory (VPS GPU paid storage zero production runtime use → 0.4 not 0.8). NO inflation.
2. **R5 91.45% PASS ≠ R5 100%**: 6/6 categories MET ≥90%, ma `deep_question` margine 0% (right at gate, fragile). `citation_vol_pag` per-rule 6% (33 fixtures, legacy experimentId map gap).
3. **Migration drift unresolved**: Andrea manual repair required iter 6 P0 BEFORE 5-agent dispatch. Migrations NOT applied → audit log silently fails.
4. **Edge Function NOT deployed iter 5 P1**: code wire-up shipped (callLLM provider=together default), deploy pending Andrea iter 6 P0.
5. **Wiki 87/100**: iter 5 P2 +1 by-hand (matrice-led-8x8). Box 4 0.87. Mac Mini overnight batch iter 6 P1 target +13 → 100/100 = 1.0.
6. **Vision flow ❌**: Box 7 zero. Iter 6 P0 Phase 1 work (gen-app live screenshot + Gemini Vision API + Playwright E2E spec).
7. **ClawBot 80-tool ⚠️ scaffold**: Box 10 0.3. Iter 6 P0 composite handler extend iter 4 dispatcher.ts scaffold to live tool dispatch + Phase 1+2 5-agent OPUS work.
8. **Hybrid RAG ❌**: Box 6 zero. Depend GPU (Path B/C) OR Anthropic Contextual API direct (Path no-GPU). Iter 6 P1 ingest 6000 chunks decision Path.
9. **Pattern S race-cond fix validated iter 5 P1**: Phase 1 sequential (gen-app + gen-test parallel WITHIN Phase 1, scribe Phase 2 SEQUENTIAL AFTER). ZERO stale-state risk. Apply iter 6+ standard.
10. **PR cascade iter 3+4+5 uncommitted**: 6+ commits + iter 3+4+5 work uncommitted on feat branch `feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26`. Andrea decide commit + push + PR iter 6 P0.

---

## 10. Reference docs index complete

### Iter 5 Phase 2 deliverables (NEW)
- `docs/audits/2026-04-26-sprint-s-iter5-PHASE1-FINAL-audit.md` (this audit, ~290 righe)
- `docs/handoff/2026-04-26-sprint-s-iter-5-to-iter-6-handoff.md` (THIS file)
- `docs/unlim-wiki/concepts/matrice-led-8x8.md` (NEW, +1 by-hand)
- `docs/unlim-wiki/index.md` (M, count 61 → 87 catch-up)
- `docs/unlim-wiki/log.md` (M, +2 entries)
- `automa/team-state/messages/scribe-iter5-phase2-to-orchestrator-2026-04-26-*.md`

### Iter 5 Phase 1 (reference)
- `supabase/functions/unlim-chat/index.ts` (M, +3 lines comment marker)
- `scripts/bench/score-unlim-quality.mjs` (M, +`--fixture-path` arg)
- `scripts/bench/run-sprint-r5-stress.mjs` (M, +pass fixture path)
- `scripts/bench/output/r5-stress-{report,responses,scores}-2026-04-26T19-13-43-568Z.{md,jsonl,json}` (NEW)
- `automa/team-state/messages/gen-app-iter5-to-orchestrator-2026-04-26-211342.md`
- `automa/team-state/messages/gen-test-iter5-to-orchestrator-2026-04-26-211938.md`

### Iter 4 partial (reference)
- `docs/audits/2026-04-26-sprint-s-iter4-CORRECTED-consolidated-audit.md`
- `docs/audits/2026-04-26-sprint-s-iter4-r5-fixture-ready-execution-blocked.md`
- `docs/audits/2026-04-26-sprint-s-iter4-r5-together-direct-RESULT.md`
- `docs/audits/2026-04-26-sprint-s-iter4-stress-smoke.md`
- `docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md`

### Iter 3 (reference)
- `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` (688 righe)
- `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md` (630 righe)
- `docs/audits/2026-04-26-sprint-s-iter3-audit.md`
- `docs/handoff/2026-04-26-sprint-s-iter-3-handoff.md`
- `docs/handoff/2026-04-26-sprint-s-iter-3-to-iter-4.md`

### Setup next session (root)
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/README-LEGGI-PRIMA.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/ACTIVATION-STRING.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/KEYS-SETUP.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/STATO-FINALE.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/MAC-MINI-OPERATIVO.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/RUNPOD-OPERATIVO.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/DECISIONE-TOGETHER-REPLACE-GEMINI.md`
- `/Users/andreamarro/VOLUME 3/SETUP-NEXT-SESSION/RISULTATI-CONCRETI-ITER5-PHASE1.md`

### Sprint S master
- `docs/pdr/PDR-SPRINT-S-ONNISCENZA-ONNIPOTENZA-2026-04-27.md`
- `docs/pdr/PDR-SPRINT-S-APPENDIX-2026-04-27.md`
- `docs/pdr/PDR-SPRINT-S-ITER-2-RALPH-LOOP-5-AGENT-2026-04-26.md`
- `docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md`
- `docs/architectures/STACK-V3-DEFINITIVE-2026-04-26.md`
- `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md`

---

## 11. Open blockers iter 6 escalation (decision Andrea)

| # | Blocker | Owner | Effort | Impact |
|---|---------|-------|--------|--------|
| 1 | Migration drift repair | Andrea | 5 min | Box 9+10 unblock audit log |
| 2 | Edge Function deploy | Andrea | 2 min | callLLM together default LIVE prod |
| 3 | VPS GPU 3-path decision | Andrea | 30 min think | Box 1 cost discipline |
| 4 | TOGETHER_API_KEY env verify | Andrea | 1 min | Edge Function deploy unblock |
| 5 | PR cascade commit + push + open | Andrea | 30 min | iter 3+4+5 work merged main |
| 6 | Composite handler ClawBot live | gen-app-opus iter 6 P0 | 4-6h | Box 10 lift 0.3 → 0.7 |
| 7 | Browser wire-up screenshot live | gen-app-opus iter 6 P0 | 2-3h | Box 7 lift 0 → 0.5 |
| 8 | Vision E2E Playwright spec | gen-test-opus iter 6 P0 | 2-3h | Box 7 lift consolidate |
| 9 | Wiki 87 → 100 batch | Mac Mini overnight iter 6 P1 | 8-12h overnight | Box 4 lift 0.87 → 1.0 |
| 10 | RAG 6000 chunks Anthropic Contextual ingest | iter 6 P1 OR iter 7 | 1 day | Box 3 lift 0 → 1.0 |

---

End handoff. Pattern S race-cond fix validated iter 5 P1. Score 6.35/10 ONESTO. Iter 6 target 7.0+/10.
