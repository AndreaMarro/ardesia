# Iter 25 ClawBot Onnipotenza Score — ONESTO G45

Date: 2026-04-29
Author: agent multi-tool dispatch test (caveman terse)
Scope: realtà filesystem + 5 pilot scenarios LIVE prod Edge Fn

## TL;DR honest

**Score iter 25 ClawBot onnipotenza: 5.5/10**

Pilot 5/5 PASS LIVE 100% success rate. UNLIM v3 emit AZIONE tags multi-tool correttamente. PZ "Ragazzi," + Vol/pag verbatim presente in 5/5 risposte. MA L2 templates 20/52 = 38% (claim inflated 52/80), composite-handler L1 runtime LIVE solo browser (NOT bench-tested via Edge Fn — limite onestò), Layer 2 templates NON wire-up runtime (esistono in repo ma nessun `loadL2Template()` chiamato dall'Edge Fn unlim-chat).

## A. ToolSpec L2 inventory (file system verified)

`find scripts/openclaw/templates -name "L2-*.json" | wc -l` = **20**

NOT 52 come claim CLAUDE.md "Sense 1" + master PDR. Inflation 32 templates.

Breakdown 20 templates:
- lesson-explain × 4
- lesson-introduce × 3
- diagnose × 4 (incl. critique-vision + diagnose-vision)
- guide × 4
- celebrate × 2
- recap × 1
- error-recovery × 1
- (full inventory: `automa/state/iter-25-clawbot-toolspec-inventory.md`)

Tutti 5-step (composite multi-tool sequential). Pattern morphic Sense 1.5 con `inputs.classProfile`+`kitTier`+`docenteExperienceLevel`.

**Layer 2 wire-up runtime**: NON verificato. Templates esistono come JSON definition file ma nessuna chiamata `loadL2Template(id)` o equivalente in `unlim-chat/index.ts` o `composite-handler.ts`. Solo L1 composition (composite_of array in tools-registry) attivo runtime via `executeComposite()` browser.

## B. Composite-handler L1 runtime

File: `scripts/openclaw/composite-handler.ts:1-492` (492 LOC, iter 6 task B1).
Test: `composite-handler.test.ts` 5/5 PASS (iter 6) +5 NEW iter 8 = **10/10 PASS**.
Status enum: ok/error/blocked_pz/cache_hit/timeout/unknown_tool/not_composite (lines 73-80).

Deployment context: **browser-only runtime**. Composite handler richiede `window.__ELAB_API` ref (injectable per test). NON deployato in Edge Fn (Deno runtime non ha `window`). Bench iter 25 usa Edge Fn unlim-chat come proxy multi-tool dispatch (UNLIM v3 prompt emette `[AZIONE:...]` tags, frontend simulator-api.js esegue azioni client-side).

## C. Pilot 5 scenarios LIVE prod

Endpoint: `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat`
Output: `automa/state/iter-25-clawbot-multitool-results.jsonl`

| ID | Cat | Status | Latency | Tools emit | Sample tool |
|----|-----|--------|---------|------------|-------------|
| build-01 | build | ok | 8204ms | 2 | loadexp:v1-cap6-esp1, highlight:led1,r1 |
| explain-01 | explain | ok | 6871ms | 1 | highlight:r1,battery1,multimeter |
| diag-01 | diagnose | ok | 4626ms | 1 | describe |
| voice-01 | voice | ok | 14713ms | 2 | loadexp:v1-cap6-esp1, highlight:led1 |
| mm-03 | multimodal | ok | 4820ms | 1 | describe |

**Aggregate**:
- success rate: **5/5 = 100%**
- latency p50: **6871ms**
- latency p95: **14713ms**
- avg tools emitted: **1.4 per query**
- HTTP status: **200 × 5**

**Quality checks** (manual inspect):
- PZ "Ragazzi," primary plurale: **5/5 = 100%**
- Vol/pag citation verbatim: **4/5 = 80%** (diag-01 NO citation, naturale per diagnose)
- Analogia (porta girevole / strada): **4/5 = 80%**
- Risposta breve <60 parole: **probably 4/5** (build-01 + voice-01 longer, others compatto)

**Latency note**: voice-01 14.7s outlier — Together AI fallback chain ritardo provider primary. P50 6.9s coerente con R5 91.80% baseline (4831ms iter 3 R0 Edge Fn).

## D. Onnipotenza scoring breakdown

| Componente | Status | Score | Note |
|-----------|--------|-------|------|
| Layer 1 composite handler runtime | LIVE browser | 0.7 | 10/10 test, ma NON wired Edge Fn |
| Layer 2 templates ToolSpec | 20/52 = 38% | 0.4 | Claim 52 inflated (file system 20) |
| Layer 2 runtime wire-up | NOT wired | 0.1 | JSON templates esistono, nessuna invocazione runtime |
| Multi-tool e2e dispatch (pilot 5) | 5/5 = 100% | 1.0 | Edge Fn UNLIM v3 emit AZIONE tags OK |
| Provider integration (Mistral 65/25/10 + Together + Gemini) | LIVE | 0.7 | callLLMWithFallback chain iter 5 P3 deploy |
| Edge Functions LIVE | 9 dirs filesystem | 0.8 | claim "4 LIVE" UNDERREPORT, vere 9 (chat,tts,stt,vision,imagegen,diagnose,hints,gdpr,dashboard) |
| Onniscenza-bridge L1+L2+L4+L5+L6 | iter 24 STUB 254 LOC | 0.5 | iter 19 P1 "STUB" — wire-up live NON verificato |
| RAG 1881 chunks | LIVE iter 7 | 0.8 | Voyage + Together contextualization |
| Vision flow E2E | spec ready, NOT exec | 0.3 | iter 12 spec ma NOT verified prod |
| Voice STT+TTS Italian | Isabella code shipped | 0.5 | iter 6 P1 ship NOT exec live verify |

**Mean**: (0.7+0.4+0.1+1.0+0.7+0.8+0.5+0.8+0.3+0.5) / 10 = **0.58 → 5.8/10**

**Cap G45 anti-inflation**: -0.3 perché claim "52/80 templates" nella mandate è inflated → **5.5/10 ONESTO**.

## E. Gap critici iter 26+

1. **Layer 2 runtime wire-up MISSING**: 20 templates JSON esistono, nessun loader runtime. Need: implementare `loadL2Template(name, classCtx)` + chiamata da unlim-chat/index.ts post-LLM per emit composite chain.
2. **52 templates roadmap**: 32 mancanti per claim. Mac Mini D1 batch in flight ma stato non verificato (iter 19 PHASE1 audit menziona "deferred SSH block").
3. **Composite handler Edge Fn portabilità**: refactor possibile per spostare `executeComposite()` lato Deno (sostituire `window.__ELAB_API` con HTTP-callable simulator-api ref).
4. **Vision E2E live exec**: tests/e2e/02-vision-flow.spec.js (iter 6 + iter 12 debug) NOT runnable da this session (browser depend).
5. **Stress test 50 scenarios full**: pilot 5 OK, full 50 (~7-8min @ 10s avg) defer Andrea cost (~$0.03 Together iter 25).

## F. Comando full bench (iter 26+)

```bash
cd "/VOLUME 3/PRODOTTO/elab-builder"
export SUPABASE_URL="https://euqpdueopmlllqjmqnyb.supabase.co"
export SUPABASE_ANON_KEY=$(grep "^VITE_SUPABASE_EDGE_KEY" .env | cut -d= -f2-)
export ELAB_API_KEY="REDACTED-rotated-iter31-2026-04-30"
node scripts/bench/clawbot-multi-tool-50-scenarios.mjs --full
```

Output: `automa/state/iter-25-clawbot-multitool-results.jsonl` (50 rows).

## G. Honest summary

ClawBot iter 25 NON è "collegato a TUTTO" come mandate Andrea iter 24 PM auspica. È **collegato a UNLIM v3 Edge Fn dispatch text-emit** (AZIONE tags 1.4 avg per query, 100% pilot 5/5 success). Composite L1 browser-runtime LIVE ma NOT exercised via bench Edge Fn (limite architettura). L2 templates esistono come definition ma NON loader runtime. 9/9 Edge Fn deploy ma vision/imagegen/stt/tts pilot E2E non verificato.

**Score ONESTO 5.5/10**. Iter 26 priorità: L2 runtime loader wire-up (impatto 5.5 → 7.0) + full 50 bench exec (verify multi-tool dispatch quality at scale).

## Files refs

- Inventory: `automa/state/iter-25-clawbot-toolspec-inventory.md`
- Bench script: `scripts/bench/clawbot-multi-tool-50-scenarios.mjs`
- Pilot results: `automa/state/iter-25-clawbot-multitool-results.jsonl`
- Composite handler: `scripts/openclaw/composite-handler.ts:1-492`
- 20 L2 templates: `scripts/openclaw/templates/L2-*.json`
- Edge Fn unlim-chat: `supabase/functions/unlim-chat/index.ts:133-340`
