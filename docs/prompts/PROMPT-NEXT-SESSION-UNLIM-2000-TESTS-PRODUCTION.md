# PROMPT NEXT SESSION — UNLIM 2000+ Tests + Production Wiring

**Context handoff date**: 2026-05-26 03:00 GMT+2
**Branch in progress**: `fix/unlim-compile-helper-mascot-tweak-2026-05-24`
**Mandate Andrea**: "il prompt deve vertere su migliaia di test di ogni tipo su prodotto live e non, NON COMPIACERE, SII SCIENTIFICO"

---

## Stato attuale (iter 105.1 → 105.3)

**Test UNLIM oggi (locale):** ~1700+ test (target Andrea: 2000+)

**Moduli NEW (sidecar, NON wired in prod path):**
- `_shared/observability.ts` — `logSilentFailure` + `logSilentError` (80 LOC)
- `_shared/intent-flags-classifier.ts` — 8-flag regex L1 + hybrid 3-tier orchestrator (341 LOC)
- `_shared/intent-flags-schema.ts` — Mistral JSON schema 8-flag (109 LOC)
- `_shared/intent-flags-llm.ts` — Mistral L3 (152 LOC)
- `_shared/intent-flags-embedding.ts` — Mistral embed L2 + cosine sim (244 LOC)
- `_shared/pii-scrub.ts` — GDPR Art. 8 Italian PII redaction (170 LOC)
- `_shared/ip-rate-limit.ts` — IP-bound outer rate limit C2 fix (149 LOC)
- `_shared/consent-gate.ts` — strict consent refusal C4 fix (102 LOC)

**Wired:**
- `rag.ts:603` STOPWORDS_IT dedupe
- `rag.ts` 5 silent catches → `logSilentFailure`
- `guards.ts:66-89` ELAB_API_KEY fail-CLOSED gated by `DENO_DEPLOYMENT_ID`
- `unlim-chat/index.ts` shadow-mode `classifyIntentFlags` post-line 424 (env flag `DEBUG_INTENT_FLAGS_V3` for log, `ENABLE_INTENT_FLAGS_V3` to expose in response)
- `unlim-chat/index.ts` dead code removed (-59 LOC)

---

## Mandate per next session

### MUST DO (in ordine)

#### 1 — Ratify + wire ENV flags in production
Andrea decide quale flippare LIVE in Supabase Edge prod (`euqpdueopmlllqjmqnyb`):
- `ELAB_API_KEY` (set secret) → fail-CLOSED attivato automaticamente
- `STRICT_CONSENT_UNKNOWN_REFUSE='true'` → hard refusal su consent unknown
- `ENABLE_PII_SCRUB='true'` → richiede wire-up `scrubPII` su 16 callsites `saveMessageHistory`/`saveInteraction`
- `ENABLE_IP_RATE_LIMIT='true'` → richiede wire-up `checkRateLimitFromRequest` in `unlim-chat/index.ts:185-205`
- `ENABLE_INTENT_FLAGS_V3='true'` → solo SHADOW, no routing change ancora
- `DEBUG_INTENT_FLAGS_V3='true'` → log shadow

**Comando deploy:**
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase secrets set ELAB_API_KEY=<key> --project-ref euqpdueopmlllqjmqnyb
SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions deploy unlim-chat --project-ref euqpdueopmlllqjmqnyb
```

#### 2 — TEST 2000+ TARGET (Andrea verbatim)
Aggiungi le batterie ancora mancanti per superare 2000:
- **`tests/unit/unlim-multilang-fuzz.test.js`** — input misti italiano/inglese/spagnolo/dialetto + emoji + Cyrillic (~150 tests). Verifica sanitizer NON falsi positivi su accenti italiani.
- **`tests/unit/unlim-system-prompt-construction.test.js`** — mocka `buildSystemPrompt` con tutti i combinazioni (studentContext / circuitState / experimentContext / capitoloFragment / useIntentSchema / aiProfile) e verifica output shape + word-cap propagation (~80 tests).
- **`tests/unit/unlim-mock-llm-pipeline-e2e.test.js`** — mocca `callLLM`/`callMistralChat`/`callBrainFallback` e simula pipeline end-to-end senza Edge runtime. Verifica fallback chain, timeout race, JSON envelope scrubbers, post-LLM pipeline composition (~200 tests).
- **`tests/integration/unlim-rag-supabase-mock.test.js`** — mock `fetch` per Supabase REST/RPC; verifica `hybridRetrieve` con risposte realistiche da fixture `rag-chunks.json` snapshot (~100 tests).
- **`tests/integration/unlim-chat-handler-mock.test.js`** — chiamata diretta a `serve()` handler con Request synthetic; verifica route + tutti i body shape + headers + status codes (~150 tests).
- **`tests/unit/unlim-prompt-injection-battery.test.js`** — 100+ injection vectors da OWASP LLM Top 10 (base64, multi-line, homoglyph, role swap, function-call extraction, system-prompt leak) — verifica `sanitizeMessage` + classifier `secret_project` flag (~120 tests).

**Target totale aggiuntivo: +800 test**. Sommati ai ~1700 attuali = **2500+**.

#### 3 — LIVE smoke tests (production)
Esegui `UNLIM_LIVE_SMOKE=true npx vitest run tests/unit/unlim-live-smoke.test.js` contro prod live:
- 19 test file pronti (17 skipped finché non opt-in)
- Verifica response shape + word cap + plural opener + citation format + safety paths + latency budget p95<12s
- Salva output in `automa/state/unlim-live-smoke-<date>.json` per cronologia

#### 4 — Wire PII scrub + IP rate limit
Dopo Andrea ratify P0:
- Per ogni `saveMessageHistory` callsite (16 totali) in `unlim-chat/index.ts`: `if (Deno.env.get('ENABLE_PII_SCRUB')==='true') { msg = scrubPII(msg); }`
- In handler entrata POST: aggiungere `import { checkRateLimitFromRequest } from '../_shared/ip-rate-limit.ts';` + `if (env enable) { const { ok, ip } = checkRateLimitFromRequest(req); if (!ok) return 429 }`

#### 5 — Run `scripts/bench/run-hybrid-rag-eval.mjs` head-to-head
- `classifyPrompt` baseline vs `classifyIntentFlagsHybrid` shadow
- Confronta: top-1 intent accuracy, p95 latency, costo/1000 chiamate
- Se accuracy ≥ baseline + p95 ≤ +200ms + costo ≤ +$0.10/1000 → ratify routing swap iter 106

#### 6 — Systematic debugging finale
Skill: `superpowers:systematic-debugging`
- Audit 4-Phase: ricerca residual silent catches, race conditions, type holes
- Cross-check con codex CLI per second opinion (codex exec --skip-git-repo-check --sandbox read-only "<prompt>")

#### 7 — Quality audit finale
Skill: `quality-audit`
- Score card finale: PASS/FAIL per metrica
- Commit con CoV: 3× `npx vitest run` prima di dichiarare PASS

---

## Anti-pattern da evitare

Per Andrea CLAUDE.md + NON COMPIACERE mandate:
- **NO** "tutto pronto per deploy" senza CoV 3-volte vitest
- **NO** scrivere tutto in 1 PR — atomic commits per ogni modulo
- **NO** modificare `experiments-vol*.js` senza ratify
- **NO** reintrodurre demo-era code (book-geometry/, demo-mode.js)
- **NO** chiamare tutor "Galileo" — sempre UNLIM
- **NO** auto-aggiungere ID a `VISIBLE_EXP_IDS` whitelist 8

---

## Comandi di rapida verifica

```bash
# Test count UNLIM
ls tests/unit/unlim*.test.* tests/unit/unlim-*.test.* | wc -l
npx vitest run tests/unit/unlim*.test.* tests/unit/unlim-*.test.* 2>&1 | tail -5

# Build
npm run build

# Live smoke (production)
UNLIM_LIVE_SMOKE=true \
  UNLIM_LIVE_URL=https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat \
  ELAB_API_KEY=<key> SUPABASE_ANON_JWT=<jwt> \
  npx vitest run tests/unit/unlim-live-smoke.test.js

# RAG bench head-to-head
node scripts/bench/run-hybrid-rag-eval.mjs

# Baseline
npx vitest run 2>&1 | tail -3
```

---

## File da leggere prima di iniziare

1. **`docs/audits/2026-05-25-iter-105-unlim-operational-readiness.md`** — audit comprehensive 16 finding cross-validato 5 reviewer
2. **`docs/audits/2026-05-26-iter-105.2-unlim-intent-classifier-v3.md`** — close iter 105.2 (intent classifier + P0 C1 fix)
3. **`docs/audits/2026-05-26-iter-105-unlim-score-card.md`** — score card iter 105
4. **`CLAUDE.md`** — Andrea mandates immutabili (Principio Zero V3 + Morfismo + 120 parole + NON COMPIACERE + 8 esperimenti whitelist + REVERT post-demo)

---

## Stop hook condition

Sessione successiva: ASPETTA `npx vitest run` PASS 3-volte + `npm run build` PASS + UNLIM live smoke PASS prima di chiudere. Se uno fallisce → systematic-debugging non skippare.
