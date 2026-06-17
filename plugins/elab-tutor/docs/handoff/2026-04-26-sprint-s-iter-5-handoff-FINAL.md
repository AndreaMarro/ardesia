---
sprint: S
iter: 5 (next session)
date: 2026-04-26 PM (post tick 34 autonomous loop close)
type: handoff next session — onniscenza + VPS GPU + RAG 6000 + ClawBot
mode: ralph loop continue, max 100, promise SPRINT_S_COMPLETE
---

# Sprint S iter 5 — Onniscenza + Onnipotenza Definitiva — Handoff

## 1. Stato chiusura iter 4 partial autonomous (tick 34)

**Score ONESTO**: **6.05/10** (era 2.5 inizio sessione, +3.55 lift).

**Wiki**: **86/100** (era 59 inizio, +27 autonomous: zener, for-loop, pull-up-pulldown, arduino-power, tmp36, arduino-port, bjt-thermal, bjt-saturation, zener-fail, millis-vs-delay, while-loop, funzioni-arduino, array-arduino, map-constrain, random-arduino, tone-notone, eeprom, progmem, bit-byte, string-arduino, shift-register-74hc595, ultrasonic-hcsr04, display-7segmenti, joystick-2axis, i2c-spi, +2 scribe by-hand iter 3 = analog-write + if-else).

**CoV finale**: 12575 PASS + 7 skip + 8 todo (12590 total) + OpenClaw 119 PASS. ZERO regression.

**Major deliverables iter 3+4 partial**:
- 5-agent OPUS Pattern S spawned + iter 3 deliverables (race-cond corrected)
- ADR-010 Together fallback (688 righe) + ADR-011 R5 fixture (630 righe)
- `_shared/llm-client.ts` callLLMWithFallback chain WIRED 115 lines
- `_shared/together-fallback.ts` 200 righe gate+anonymize+audit
- 2 SQL migrations files (NOT applied)
- R0 Edge Function 91.80% PASS (vs 75.81% Render baseline) — **+15.99pp lift**
- R5 fixture 50/50 valid JSON ADR-011 distribution
- multimodalRouter.js 7-modality scaffold (210 righe + 18 tests PASS)
- `scripts/openclaw/dispatcher.ts` ClawBot dispatcher scaffold (250 righe + 16 tests PASS)
- Smart on/off scripts `runpod-smart-onoff.sh` (DRY_RUN tested)
- SPEC iter 4 master 12 sections
- Voice UNLIM `it-IT-IsabellaNeural` approvato + wired
- Hetzner naming corretto → "VPS provider TBD"

## 2. Blocker R5 stress — ELAB_API_KEY missing

```
HTTP 401 "missing X-Elab-Api-Key header"
```

Env sourced ~/.zshrc + ~/.elab-credentials/sprint-s-tokens.env:
- ✅ GITHUB_TOKEN, TOGETHER_API_KEY, SUPABASE_ANON_KEY, SUPABASE_ACCESS_TOKEN, RUNPOD_API_KEY, CLOUDFLARE, HF
- ❌ ELAB_API_KEY (probabilmente in `.env` project, sandbox-blocked safety hook)
- ❌ ANTHROPIC_API_KEY, GEMINI_API_KEY (in Supabase Edge Function secrets, non locale)

**Andrea action prima next session**:
```bash
# Aggiungere keys mancanti a tokens env
cat >> ~/.elab-credentials/sprint-s-tokens.env << 'EOF'
ELAB_API_KEY=...        # da X-Elab-Api-Key Edge Function config
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
EOF
```

## 3. Iter 5 priorities (ordinate)

### P0 (block iter 5 close)

1. **Apply Supabase migrations** (richiede Andrea OK):
   ```bash
   source ~/.zshrc
   cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
   npx supabase db push --linked
   ```

2. **R5 stress execution** (con ELAB_API_KEY):
   ```bash
   source ~/.elab-credentials/sprint-s-tokens.env
   node scripts/bench/run-sprint-r5-stress.mjs
   # Target ≥90% PASS overall
   ```

3. **Resume RunPod pod 5ren6xbrprhkl5** (per RAG ingest + GPU bench):
   ```bash
   bash scripts/runpod-resume.sh 5ren6xbrprhkl5
   # ~2min boot
   ```

### P1 (substantial)

4. **RAG 6000 chunks Anthropic Contextual ingest** (richiede ANTHROPIC_API_KEY + GPU pod):
   - Script: `scripts/rag-contextual-ingest.mjs`
   - Stima costo $1-2 one-time
   - Embedding: BGE-M3 RunPod port 7997

5. **OpenAI new model research** (user request):
   - Cerca "gpt-oss" o "OpenAI open model" 2026
   - Verificare licensing + benchmark
   - Eventuale integration test

6. **callLLMWithFallback prod test**: con TOGETHER_API_KEY chain RunPod→Gemini→Together

### P2

7. **Mac Mini wiki batch** continue (currently 86/100 toward 100 — 14 mancanti)
8. **Stress test prod Playwright + Control Chrome MCP** ogni 4 iter (iter 8 entrance gate)
9. **ClawBot dispatcher real wire-up** (composite handler L1 morphic)

## 4. Activation string Sprint S iter 5 (paste-ready)

```
attiva ralph loop /ralph-loop /caveman Sprint S iter 5 onniscenza + onnipotenza definitiva post iter 4 partial 6.05/10.

Pattern S 5-agent OPUS PHASE-PHASE (race-condition fix iter 4 SPEC §6):
- PHASE 1 (parallel): planner-opus + architect-opus + generator-app-opus + generator-test-opus
- PHASE 2 (sequential post phase 1 completion msgs): scribe-opus
- PHASE 3 (orchestrator): CoV finale + /quality-audit + score 10 boxes + stress test ogni 4 iter

Master docs:
- docs/handoff/2026-04-26-sprint-s-iter-5-handoff-FINAL.md (THIS file)
- docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md (still binding)
- docs/audits/2026-04-26-sprint-s-iter4-CORRECTED-consolidated-audit.md
- docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md
- docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md
- docs/adrs/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md
- CLAUDE.md (iter 3+4 close sezioni)

Iter 5 P0:
- Apply Supabase migrations (together_audit_log + openclaw_tool_memory) via supabase db push
- R5 stress execution 50 prompts target ≥90% PASS (ELAB_API_KEY required)
- Resume RunPod pod 5ren6xbrprhkl5 (~2min boot)

Iter 5 P1:
- RAG 6000 chunks Anthropic Contextual ingest (ANTHROPIC_API_KEY + GPU pod)
- OpenAI gpt-oss model research + integration test
- callLLMWithFallback chain prod test

Iter 5 P2:
- Mac Mini wiki 86→100 (14 concepts)
- Stress test Playwright + Control Chrome iter 8 entrance gate
- ClawBot dispatcher composite handler wire-up

Env sources:
- ~/.zshrc: GITHUB_TOKEN + TOGETHER_API_KEY + SUPABASE_ACCESS_TOKEN + SUPABASE_ANON_KEY
- ~/.elab-credentials/sprint-s-tokens.env: RUNPOD_API_KEY + CLOUDFLARE_API_TOKEN + HUGGINGFACE_TOKEN
- ~/.elab-credentials.md: reference doc (NO secrets in plain)
- MISSING: ELAB_API_KEY + ANTHROPIC_API_KEY + GEMINI_API_KEY → Andrea aggiunge a sprint-s-tokens.env

Voice UNLIM: it-IT-IsabellaNeural (approvato Andrea, edge-tts pip)

Pod RunPod: 5ren6xbrprhkl5 RTX A6000 48GB EXITED (resume on-demand)
SSH: id_ed25519_runpod (dedicated)

Mac Mini: PID 23944 launchctl autonomous H24, SSH id_ed25519_elab MacBook only

Git state: feat/sprint-s-iter-2-software-prompt-v3-wireup-2026-04-26 + iter 3+4 uncommitted work. Andrea decide commit/PR strategy.

CoV per agente prima ogni claim: vitest 12575+ PASS, build PASS, baseline preserved, /quality-audit fine ogni iter.

Promise: output `<promise>SPRINT_S_COMPLETE</promise>` SOLO quando 10/10 TRUE. Iter 4 partial close: 6.05/10. Iter 5 target: 7.5+/10 (R5 PASS + migrations applied + RAG ingest started).

Caveman ON. Massima onesta. NO compiacenza. NO inflation. --max-iterations 100 --completion-promise SPRINT_S_COMPLETE.

Skill attive: /quality-audit /skill-creator /documentation /system-design /design-critique /critique /writing-skills /claude-md-improver /consolidate-memory /systematic-debugging /agent-orchestration:multi-agent-optimize /agent-teams:team-feature /agent-teams:team-spawn /agent-development /agent-orchestration:improve-agent /firecrawl:firecrawl (ricerca gpt-oss OpenAI) /vercel:deploy /vercel:status.
```

## 5. Setup steps next session (Andrea, 5 minuti)

```bash
# 1. Verifica state
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git status

# 2. Source env
source ~/.zshrc
source ~/.elab-credentials/sprint-s-tokens.env

# 3. Aggiungi 3 keys mancanti (ELAB_API + ANTHROPIC + GEMINI)
nano ~/.elab-credentials/sprint-s-tokens.env
# Aggiungere:
# ELAB_API_KEY=...
# ANTHROPIC_API_KEY=sk-ant-...
# GEMINI_API_KEY=AIza...

# 4. Verifica Mac Mini autonomous
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'launchctl list | grep elab'

# 5. RunPod pod state
source ~/.elab-credentials/sprint-s-tokens.env
curl -s -H "Authorization: Bearer $RUNPOD_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"query{pod(input:{podId:\"5ren6xbrprhkl5\"}){id desiredStatus}}"}' \
  https://api.runpod.io/graphql

# 6. Conferma a Claude: "Pronto Sprint S iter 5 ralph loop. Activate?"
# 7. Paste activation string sopra
```

## 6. Honesty caveats

1. Score 6.05/10 ONESTO. NON 7+ inflated.
2. R5 fixture 50/50 ready ma 0/50 executed (blocker ELAB_API_KEY).
3. RAG 6000 chunks: 0 ingested (depend GPU + Anthropic key).
4. ClawBot 80-tool: 10/80 scaffold tested, 70 not implemented.
5. Vision flow E2E: NOT verified iter 4.
6. TTS Coqui: voice clone Tammy Grit fallback se Andrea cp /tmp/voice-andrea.m4a.
7. SPRINT_S_COMPLETE projection: iter 8-12 (4-7 iter ancora).
8. Race-condition iter 3 corrected retroactively (scribe stale).
9. Sandbox blocks `.env` access — Andrea unique provisioner di ELAB_API_KEY locale.
10. NO main push, NO merge senza Andrea, NO migration apply senza explicit OK.
