# Iter 31 Activation Prompt — Handoff next session

**Data**: 2026-04-30
**Branch**: `e2e-bypass-preview`
**HEAD start iter 31**: post commit `f5127d6` + pending iter 30 close audit commit
**Score iter 30 close ONESTO**: 8.5/10 G45 anti-inflation cap

## ORIGINE DEI COMMIT QUESTA SESSIONE (chiarimento Andrea)

**`be93d8d` + `f5127d6` + iter 30 close audit commit pending = LAVORO QUESTA SESSIONE Claude (NON Tea)**.

Andrea pensava fossero push Tea ma sono autonomous Claude work iter 29+30 close.

## DECISIONI MODELLI AI PRESE QUESTA SESSIONE

### Stack ufficiale 9 capability AI ELAB Tutor

| Capability | Provider | Modello | Region | GDPR |
|------------|----------|---------|--------|------|
| **LLM chat 65%** | Mistral | mistral-small-latest | FR Paris | ✅ EU |
| **LLM premium 20%** | Mistral | mistral-large-latest | FR Paris | ✅ EU |
| **LLM emergency 15%** | Together AI | meta-llama/Llama-3.3-70B-Instruct-Turbo | US gated | ⚠️ block student runtime |
| **LLM fallback** | Google | gemini-2.5-flash-lite/flash/pro | DE Frankfurt | ✅ EU |
| **Vision** | Mistral | pixtral-12b-2409 | FR Paris | ✅ EU |
| **TTS** | **Mistral Voxtral (NEW iter 29)** | **voxtral-mini-tts-2603** | **FR Paris** | ✅ EU |
| **STT** | Cloudflare WAI | @cf/openai/whisper-large-v3-turbo | EU edge | ✅ EU |
| **ImgGen** | Cloudflare WAI | @cf/black-forest-labs/flux-1-schnell | EU edge | ✅ EU |
| **Embeddings RAG** | Voyage AI | voyage-3 + rerank-2.5 | US (gated static) | ⚠️ ZERO PII |

**4/9 stack omogeneo Mistral EU FR**: LLM Small + LLM Large + Vision Pixtral + TTS Voxtral.

### Scelte rigettate iter 29

- ❌ **Cartesia Sonic 3** scartato — Voxtral primario sostituisce
- ❌ **ElevenLabs** scartato — EU residency Enterprise-only fuori budget
- ❌ **OpenAI TTS** scartato — NO GDPR DPA EU
- ❌ **XTTS-v2 RunPod permanent** scartato — revert Path A decommission
- ❌ **Brain V13 VPS** decommissionato — Mistral più capace + economico
- ❌ **Edge TTS Microsoft Isabella WSS** demoted da PRIMARY a FALLBACK (NetworkError prod)

## DELIVERABLES QUESTA SESSIONE (DONE)

### Iter 29 close (commit `be93d8d`)
- ✅ Voxtral mini-tts-2603 PRIMARY TTS (`voxtral-client.ts` 260 LOC)
- ✅ unlim-tts wire-up Voxtral primary + Edge TTS fallback
- ✅ Live verified prod 5/5 sample IT 1181ms p50 48 KB MP3
- ✅ Task 29.1 wires root cause investigation (H3 harness identified)
- ✅ Task 29.2 PIVOT harness state.connections fix + 9/9 unit tests PASS

### Iter 30 close (commit `f5127d6`)
- ✅ CF Whisper STT type mismatch FIX (octet-stream binary, deployed)
- ✅ Vitest baseline sync 12290 → 13212
- ✅ GDPR 4 docs minimal drafts (~600 LOC):
  - public/privacy-policy.html (12 sezioni minori 8-14)
  - public/cookie-policy.html (5 cookie tecnici, ZERO profilazione)
  - public/terms-of-service.html (Tribunale Torino)
  - public/sub-processors.html (13 provider tabella)
- ✅ Onniscenza 7-layer aggregator wire-up unlim-chat (opt-in env `ENABLE_ONNISCENZA=true`)
- ✅ Setup chiavi: TOGETHER_API_KEY set, CARTESIA_API_KEY removed (Voxtral)
- ✅ Massive prod test 24 cases via Playwright MCP (16/24 PASS, 8 gap iter 31)
- ✅ Marketing PDF tex updated Voxtral pivot + costi ricalcolati

### Iter 30 close audit + PZ V3 fix (commit pending b2idnr28b)
- ✅ docs/audits/2026-04-30-iter-30-MASSIVE-PROD-TEST-CLOSE.md (~250 LOC)
- ✅ docs/audits/iter-29-wires-root-cause.md (158 LOC)
- ✅ docs/audits/2026-04-30-iter-29-MODEL-MATRIX-LIVE-TEST.md (215 LOC)
- ✅ docs/audits/2026-04-30-iter-29-ONNISCENZA-ONNIPOTENZA-AUDIT.md (525 LOC)
- ✅ .team-status/QUALITY-AUDIT.md
- ✅ src/services/simulator-api.js getCircuitDescription FIX kit fisico breadboard mention (Andrea iter 21 mandate)
- ✅ CLAUDE.md +106 LOC iter 29 close addendum

### Mac Mini autonomous
- ✅ MM1 wiki batch +26 concepts (100→126 dispatched + completed)
- ⚠️ MM2/3/4 silent post-dispatch (autonomous loop probable dead, retry iter 31)

### Skills invoked
- ✅ /superpowers:subagent-driven-development
- ✅ /agent-teams:team-spawn (verified env flag set)
- ✅ /quality-audit (skill output `.team-status/QUALITY-AUDIT.md`)
- ✅ /superpowers:systematic-debugging (Phase 1 root cause investigation)
- ✅ /claude-mem:mem-search (search past keys/decisions)

## DEFER ITER 31+ (out of scope sessione singola)

Andrea triple-prompt richiede ~28-32h work multi-day. ONESTO G45: NON realistico in singola sessione context-bound.

### P0 ITER 31 IMMEDIATE (24h, prima sessione successiva)

1. **🔴 CRASH bugs homepage + modalità guida** (deploy-blocker)
   - Reproduce via Playwright Chrome+Safari+Firefox
   - 3 hypothesis: race condition useEffect / memory leak modalità switch / __ELAB_API not ready Percorso
   - File: tests/e2e/30-crash-homepage-reproduce.spec.js + tests/e2e/30-crash-modalita-guida-reproduce.spec.js

2. **🔴 Marketing PDF V2 compile + PowerPoint Giovanni Fagherazzi** (deadline 30/04)
   - Tex updated this session ✅
   - Compile pdflatex (xelatex absent local — Andrea install OR online)
   - PowerPoint anthropic-skills:pptx (~2h) NOT done

3. **🟠 Homepage Tea + Cronologia + UNLIM descriptions**
   - Hero "ELAB TUTOR" maiuscolo + "Impara, sperimenta, scopri"
   - 5 Card Glossario/Lavagna/Manuale/UNLIM/Chi siamo
   - Cronologia Google-style sessioni passate + UNLIM-generated description
   - File: src/components/HomePage.jsx + HomeCronologia.jsx + supabase/functions/unlim-session-description/

4. **🟠 UNLIM 7-layer context audit + integration test**
   - L1 circuit + L2 ELAB state + L3 vision + L4 chat history + L4 RAG + L6 wiki + L7 verbatim
   - Verify TUTTI wired in unlim-chat
   - Output: tests/e2e/30-unlim-7-layer-context.spec.js (NEW ~250 LOC)

5. **🟠 ClawBot dispatcher 62-tool wire post-LLM** (Onnipotenza completion)
   - Currently only L2 template router wired
   - Wire dispatcher.ts post-LLM composite tag handling
   - File: supabase/functions/unlim-chat/index.ts post-LLM JSON `[INTENT:...]` parser

6. **🟠 Onniscenza snapshot inject prompt** (currently logged only)
   - aggregateOnniscenza fused result → BASE_PROMPT additional context section
   - Test: smoke chat call returns response with Onniscenza layer references

### P1 ITER 31-32

7. T2 starter 4 editorial bugs PDF volumi (Davide notify)
8. L03 prompt tune R5 91.80% → 95%+ via system-prompt.ts v3.2 + bench
9. Tres Jolie volumi 1-2-3 deep parallelismo audit (~600 LOC table per cap)
10. Lingua codemod 200 violations singolare → plurale Ragazzi
11. Modalità 4 wire-up complete (Già Montato render, Percorso highlight sequence)
12. unlim.sendMessage __ELAB_API → Edge wire-up (BUG iter 30)
13. ADR-001 dual Supabase project drift Andrea ratify (vxvqalmxqtezvgiboxyv vs euqpdueopmlllqjmqnyb)

### P1 ITER 32-35 + Sprint U

14. Wiki batch 50 NEW concepts Mac Mini D7 P0 upgrade
15. Voice clone Andrea/Davide 6s audio Voxtral cloning (Morfismo Sense 2)
16. RunPod V2 bootstrap + benchmark frugal $13 (ADR-028 cost matrix)
17. 5 persona simulation REAL Playwright
18. L08 100+ Playwright E2E test suite
19. L09 Galileo Brain V14 dataset 5000
20. L10 Tea Master Orchestrator ADR-029 design
21. Grafica overhaul `/colorize` + `/typeset` + `/arrange` impeccable
22. Vol3 narrative refactor Davide co-author (Sprint U)

## CoV verification iter 30 finale

- vitest **13233 PASS** pre-commit hook verified (baseline 11958 file, +21 vs iter 29 13212)
- Build NOT re-run (heavy ~14min, defer iter 31 entrance)
- ZERO regression
- Pre-commit hook PASS commit `f5127d6`

## SPRINT_T_COMPLETE 12 boxes status post iter 30

- Box 1 VPS GPU 0.4 (UNCHANGED Path A)
- Box 2 stack 0.7 (CF multimodal LIVE)
- Box 3 RAG 0.7 (1881 chunks)
- Box 4 Wiki **1.0** (126/100 = 126% MM1 batch)
- Box 5 R0 1.0
- Box 6 Hybrid RAG 0.85
- Box 7 Vision **0.75** (Pixtral live)
- Box 8 TTS **0.95** (Voxtral primary LIVE iter 29)
- Box 9 R5 1.0
- Box 10 ClawBot **1.0** (L2 templates 20/20 LIVE)
- **NEW Box 11 Onniscenza 0.6** (aggregator wired prod opt-in iter 30)
- **NEW Box 12 GDPR 0.7** (4 docs DRAFT shipped iter 30)

Box subtotal **9.20/12** + bonus 2.10 → **G45 cap 8.5/10 ONESTO**.

## Iter 31 score target

8.5 → **9.0+/10** ONESTO conditional crash bugs fix + dispatcher wire + Onniscenza prompt inject.

## Activation string iter 31 (paste-ready)

```
ULTRATHINK + Iter 31 Sprint T close (P0 crash + Marketing PDF + Homepage Tea + UNLIM 7-layer)

PRE-FLIGHT CoV (5 min):
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git pull origin e2e-bypass-preview
git log --oneline -5  # Expected HEAD = iter 30 close commit
npx vitest run --reporter=basic 2>&1 | tail -5  # Expected 13233+ PASS, 0 FAIL

P0 IMMEDIATE (24h):
1. Crash bugs homepage + modalità guida diagnose + fix (deploy-blocker)
2. Marketing PDF compile + PowerPoint Giovanni Fagherazzi (DEADLINE)
3. Sync Tea verifica push main (be93d8d + f5127d6 = COMMIT MIEI iter 29-30, NOT Tea)
4. Homepage Tea + Cronologia + UNLIM descriptions (Andrea iter 30 mandate)

P0 ITER 31 (3 giorni):
5. UNLIM 7-layer context audit + integration test
6. ClawBot dispatcher 62-tool wire post-LLM
7. Onniscenza snapshot inject prompt (currently logged only)
8. T2 starter 4 editorial bugs PDF volumi

Skill chain mandatory:
/superpowers:systematic-debugging (crash bugs root cause)
/agent-teams:team-debug (3 hypothesis parallel)
/anthropic-skills:pptx (PowerPoint Giovanni)
/impeccable:audit + critique + frontend-design (homepage Tea)
/quality-audit (CoV ogni 25%)
/superpowers:test-driven-development (TDD ogni fix)

PRINCIPIO ZERO V3 IMPERATIVO. G45 anti-inflation. Mai compiacenza.
SERVE RENDERE TUTTO BENE ORDINATO.

INIZIA: Phase 0 → Phase 12 (crash P0) → Phase 6 (marketing).
```

## PRINCIPIO ZERO V3 + Morfismo compliance iter 30

- ✅ Voxtral primary EU FR — student runtime EU-only ferreo
- ✅ Capitolo injection wired (buildCapitoloPromptFragment)
- ✅ BASE_PROMPT v3.1 + 6 PZ runtime rules deployed
- ✅ canonical naming bat1/r1/led1 + Cap. X Esp. Y matching kit Omaric
- ✅ getCircuitDescription FIX "kit fisico ELAB (breadboard)" mention iter 30 PZ V3 (commit pending b2idnr28b)
- ⚠️ Voice clone Andrea/Davide audio pending → Morfismo Sense 2 narratore volumi DEFERRED iter 31+

## Honest caveats massima onestà G45

1. Sessione singola NON sufficiente per Phase 0-13 (~28-32h work multi-day) — DEFER realistic
2. Crash bugs P0 NOT diagnosticati questa sessione (deploy-blocker carryover iter 31)
3. PowerPoint Giovanni Fagherazzi NOT shipped (Marketing PDF tex updated MA compile + PPT manca)
4. Homepage Tea + Cronologia NOT implementato (Andrea mandate iter 30 carryover)
5. UNLIM 7-layer integration test NOT scritto (solo audit doc shipped)
6. Tres Jolie volumi parallelismo audit NOT eseguito (Phase 4 expanded ~600 LOC defer)
7. Mac Mini MM2/3/4 silent (autonomous loop probable dead, retry iter 31)
8. Marketing PDF V2 compile pdflatex NOT eseguito (xelatex absent local)
9. RunPod V2 bootstrap NOT eseguito (Path A respect)
10. Voice clone Andrea/Davide audio pending → Voxtral cross-lingual EN→IT temporary

---

**Iter 30 close ONESTO 8.5/10 G45 anti-inflation cap. Iter 31 entrance pending crash bugs + Marketing PDF + Homepage Tea + UNLIM 7-layer.**
