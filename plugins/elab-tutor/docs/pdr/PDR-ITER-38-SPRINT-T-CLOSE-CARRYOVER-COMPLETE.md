# PDR ITER 38 — Sprint T Close — Carryover Complete iter 36+37+33

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal**: Sprint T close target 9.5/10 ONESTO conditional Onnipotenza Deno port 62-tool + canary rollout + 14 carryover gap iter 36+37 chiusi + iter 38 P0 latency mitigation Tier 1 + Vercel deploy + smoke prod end-to-end.

**Architecture**: Pattern S r3 4-agent OPUS PHASE-PHASE + Documenter Phase 2 sequential + 5 fix BG agents Phase 3 (proven 9× iter consecutive). Stack 100% Mistral EU FR consolidation (LLM Mixtral 8x7B + Pixtral 12B Vision + Voxtral Transcribe 2 STT migration + Voxtral mini-tts-2603 TTS clone Andrea).

**Tech Stack**: Supabase Edge Functions Deno + Vercel React 19 Vite 7 PWA + Mistral La Plateforme APIs + Cloudflare Workers AI (FLUX schnell only post STT migration) + Voyage embeddings (consolidate iter 39 → Mistral) + Together AI gated fallback + Mac Mini autonomous H24.

**Anti-inflation G45 mandate**: cap 9.5 ONESTO conditional Opus indipendente review. NO claim Sprint T close senza:
- R5 avg <3000ms + p95 <6000ms (vs iter 37 4496/10096)
- R7 INTENT canonical ≥80% (vs iter 37 0% pre-fix → post-v53 Tester-6 verify)
- Onnipotenza 62-tool Deno port server-safe subset live + canary 5% rollout
- 92→94 esperimenti Playwright UNO PER UNO sweep audit (Andrea iter 21+ mandate)
- Linguaggio codemod 200 violations singolare→plurale (Andrea iter 21+ mandate)
- Vercel deploy frontend verify post iter 32 key rotation
- 14 carryover voci iter 36+37+33 closed o explicit deferral iter 39+

**Anti-regressione FERREA**: vitest baseline 13474 NEVER scendere. Build PASS pre-commit. NO `--no-verify`. NO push main. NO debito tecnico (eccetto explicit defer iter 39+ documented).

---

## §0 PRINCIPIO ZERO + MORFISMO compliance gate (8/8 invariato)

Reference CLAUDE.md "DUE PAROLE D'ORDINE" §1+§2 + `.impeccable.md` Test Morfismo 10-check.

Gate ogni atom MUST:
1. Linguaggio plurale "Ragazzi," + Vol/pag verbatim ≤60 parole + analogia
2. Kit fisico mention ogni response/tooltip/empty state
3. Palette CSS var Navy/Lime/Orange/Red (NO hard-coded hex)
4. Iconografia ElabIcons (NO material-design generic, NO emoji come icone)
5. Morphic runtime (NO static config)
6. Cross-pollination Onniscenza L1+L4+L7 minimum
7. Triplet coerenza kit Omaric SVG + volumi cartacei + software (Sense 2)
8. Multimodale Voxtral voice clone Andrea + Vision Pixtral EU + STT migration Voxtral Transcribe 2

---

## §1 Goal imperativo iter 38 — 24 voci CARRYOVER complete

### Carryover iter 36 (12 voci ratify queue iter 36 close)

| # | Voce | Status iter 37 | Iter 38 atom |
|---|------|----------------|--------------|
| 1 | ADR-025 Modalità 4 simplification ratify | DEFERRED iter 22 | ATOM-S38-D1 ratify Andrea (15 min) |
| 2 | ADR-026 content-safety-guard runtime ratify + deploy | DEFERRED iter 22 | ATOM-S38-D2 ratify + deploy (30 min) |
| 3 | ADR-027 volumi narrative refactor schema ratify (Davide co-author) | DEFERRED iter 25 | ATOM-S38-D3 Davide session 1h + Maker-2 schema (4h) |
| 4 | Vision Gemini Flash deploy verify | Pixtral active fallback iter 37 | ATOM-S38-A8 Andrea ratify GOOGLE_API_KEY env + smoke verify Gemini primary |
| 5 | PWA SW Workbox cache invalidation prompt-update | RESEARCH only iter 36 | ATOM-S38-A12 Maker-1 wire-up `registerType: 'prompt'` + toast plurale (2h) |
| 6 | Vercel frontend deploy verify post key rotation iter 32 | NOT executed iter 37 | ATOM-S38-PHASE-3 orchestrator inline (15 min) |
| 7 | Linguaggio codemod 200 violations singolare→plurale (iter 21 mandate) | NOT started | ATOM-S38-A14 Maker-3 codemod automatico + audit (4h) |
| 8 | 92→94 esperimenti audit Playwright UNO PER UNO (iter 21 mandate) | NOT started | ATOM-S38-A15 Tester-1 harness real exec 94 sweep (3h) |
| 9 | Wake word UX flow auto-warm-up (UI nudge mic permission) | iter 36 partial | ATOM-S38-A11 WebDesigner-1 LavagnaShell mic permission UX + nudge plurale (1.5h) |
| 10 | Tea homepage Glossario integration main app | DEFERRED iter 33+ | ATOM-S38-D4 Tea spec session + Maker-3 port (4h) |
| 11 | Tres Jolie volumi parallelismo audit ~600 LOC table per cap | DEFERRED iter 33+ | ATOM-S38-A16 Documenter audit Vol1+2+3 image refs (3h) |
| 12 | Cronologia sessioni Google-style + UNLIM-generated description | DEFERRED iter 33+ | ATOM-S38-A6.b WebDesigner-1 ChatbotOnly enhancement (2h) |

### Carryover iter 37 (12 voci gap onesti)

| # | Voce | Status iter 37 | Iter 38 atom |
|---|------|----------------|--------------|
| 13 | R5 latency p95 re-misurazione post v52 deploy | NON re-measured | ATOM-S38-A1.b Tester-2 R5 re-run post-iter-37-fixes (30 min) |
| 14 | R6 fixture rebuild + page metadata storage prod | recall@5 0.067 fixture mismatch | ATOM-S38-A1 Tester-2 R6 fixture v2 + Maker-1 page metadata SQL update (4h) |
| 15 | R7 INTENT canonical post-v53 verify | Tester-6 BG running | ATOM-S38-PHASE-0 entrance gate result analysis |
| 16 | Playwright 1/4 prod regression Fumetto stub-fallback (iter 36 A7) | iter 38 P0 flag | ATOM-S38-A2 Maker-1 investigate Fumetto API endpoint + fix (2h) |
| 17 | Lighthouse score ChatbotOnly + EasterModal | DEFERRED iter 38 | ATOM-S38-A6 WebDesigner-1 Lighthouse Chrome DevTools (1h) |
| 18 | Latency mitigation deeper Tier 1 (semantic cache + parallelize + streaming SSE) | Tier 1 candidates iter 38 P0 plan | ATOM-S38-A3+A4+A5 Maker-1 implementation (8h) |
| 19 | INTENT Mistral function calling ADR-030 candidate | NOT shipped iter 37 | ATOM-S38-A7 Maker-2 ADR-030 + Maker-1 callLLM `response_format: json_schema` wire-up (6h) |
| 20 | STT migration CF Whisper → Voxtral Transcribe 2 (candidate Q strategic) | NOT shipped iter 37 | ATOM-S38-A9 Maker-1 voxtral-stt-client.ts + unlim-stt migration + Tester-4 verify (6h) |
| 21 | End-to-end browser INTENT dispatch verify post Vercel deploy | NOT verified | ATOM-S38-PHASE-3 smoke prod verify (1h) |
| 22 | Onnipotenza Deno port 62-tool subset server-safe (highlight + mountExperiment + captureScreenshot) | NOT shipped iter 37 | ATOM-S38-A10 Maker-1 Deno port 12-tool subset + dispatcher.ts wire (6-8h) |
| 23 | Canary 5%→25%→100% rollout per ADR-028 §7 | NOT shipped | ATOM-S38-A13 Maker-1 canary env flag + telemetry (3h) |
| 24 | Vision Gemini Flash primary verify (vs Pixtral fallback active) | Pixtral verified iter 37 | ATOM-S38-A8 Andrea ratify env + Maker-1 wire-up + Tester-3 smoke (1h) |

**Total iter 38 atoms**: 16 atoms ATOM (A1-A16) + 4 Davide/Andrea decision atoms (D1-D4) + Phase 0/2/3 orchestrator + Documenter Phase 2.

---

## §2 Team 4-agent OPUS orchestrato + 5 fix BG Phase 3 (Pattern S r3 9× validated)

| Ruolo | Agent type | File ownership | Tools/skills |
|-------|------------|----------------|--------------|
| **Maker-1** (gen-app primary) | `backend-development:backend-architect` | `supabase/functions/**` + `src/services/**` + Deno port 62-tool | latency Tier 1 + STT migration + Onnipotenza Deno port + canary |
| **Maker-2** (architect) | `feature-dev:code-architect` | `docs/adrs/**` READ src/ | ADR-030 Mistral function calling + ADR-027 Davide co-author + ADR-031 STT migration |
| **Maker-3** (codemod + esperimenti) | `backend-development:backend-architect` | `src/data/**` + `src/components/**` codemod | Linguaggio codemod 200 + Vol3 narrative + Glossario port Tea |
| **WebDesigner-1** (UI/UX + Lighthouse) | `application-performance:frontend-developer` | `src/components/**` (lavagna + chatbot + easter + LavagnaShell mic) | A11 wake word UX + A6 Lighthouse + Cronologia enhancement |
| **Tester-1** (E2E harness real) | `agent-teams:team-debugger` | `tests/e2e/**` + `tests/integration/**` | A15 94 esperimenti Playwright UNO PER UNO + Fumetto investigate |
| **Tester-2** (bench R5+R6+R7) | `agent-teams:team-debugger` | `scripts/bench/**` | A1 R6 fixture v2 + A1.b R5 re-run + R7 post-deploy |
| **Tester-3** (Playwright + Vision smoke) | `agent-teams:team-debugger` | `tests/e2e/**` + smoke scripts | Vision Gemini smoke + Playwright fix + STT Voxtral verify |
| **Tester-4** (STT migration verify) | `agent-teams:team-debugger` | `scripts/smoke/**` | STT Voxtral 9-cell matrix re-verify post migration |

**Documenter Phase 2 sequential**: `general-purpose` agent → audit + handoff + CLAUDE.md append + Andrea ratify queue updated.

**Performance Engineer parallel BG Phase 3**: `application-performance:performance-engineer` → iter 39+ plan continuation post Tier 1+2 implementation.

**Inter-agent**: filesystem barrier `automa/team-state/messages/{agent}-iter38-phase{0,1,2,3}-{status}.md`. Race-cond fix protocol mandatory msg emission step ogni agent (mitigation iter 12 P §7.2 protocol gap).

**Mac Mini autonomous H24** (continua iter 36+37): cron L1+L2+L3+aggregator LIVE 4 entries. Iter 38 entrance: refresh env keys post Vercel deploy + check D2/D3 retry SSH unblock.

---

## §3 Atomi imperativi (16 ATOM-S38 + 4 Decision + 3 Phase orchestrator)

### ATOM-S38-A1 — Tester-2 R6 fixture v2 + Maker-1 page metadata SQL update (P0, 4h)

**Files**:
- Modify `scripts/bench/r6-fixture.jsonl` (rebuild 100 prompts con `expected_chunks: [chunk_ids]` per format match runner)
- Create migration `supabase/migrations/20260501_rag_chunks_page_metadata.sql` (UPDATE rag_chunks SET page = COALESCE(metadata->>'page', NULL))
- Modify `scripts/bench/run-sprint-r6-stress.mjs` runner adapter

**Acceptance**: R6 100/100 PASS recall@5 ≥0.55 baseline.

**TDD pattern**:
- [ ] Write failing fixture v2 schema test (regex `expected_chunks: \[\".*\"\]` match)
- [ ] Run vitest fixture-validator → FAIL
- [ ] Implement fixture rebuild + migration apply
- [ ] Run R6 bench → PASS recall@5 ≥0.55
- [ ] Commit `feat(iter-38): R6 fixture v2 + page metadata SQL`

### ATOM-S38-A1.b — Tester-2 R5 re-run post-iter-37 fixes (P0, 30 min)

**Files**: re-run `scripts/bench/run-sprint-r5-stress.mjs`

**Acceptance**: R5 avg <3000ms (vs iter 37 4496ms) + p95 <6000ms (vs iter 37 10096ms) post v52 timeout 8s + max_tokens 120.

**TDD**:
- [ ] Run R5 50-prompt bench prod
- [ ] Verify p95 <6000ms (R5 timeout 8s effective tail kill)
- [ ] Commit output `scripts/bench/output/r5-stress-iter38-postfix-{ISO}.{md,jsonl,json}`

### ATOM-S38-A2 — Maker-1 Playwright Fumetto prod regression fix (P0, 2h)

**Files**: investigate `src/components/lavagna/Fumetto.jsx` + `src/services/api.js` `unlim-fumetto` Edge Function call.

**Bug**: Tester-3 iter 37 Phase 3 Test #1 FAIL prod regression toast `Nessuna sessione salvata` — iter 36 A7 stub-fallback either undeployed post key-rotation iter 32 OR fallback emits toast plus stub.

**Acceptance**: Fumetto E2E spec PASS prod (4/4 specs Tester-3 iter 38 re-run).

**TDD**: failing E2E test → diagnose API endpoint stub-fallback path → fix → verify PASS.

### ATOM-S38-A3 — Maker-1 Promise.all parallelize loadStudentContext + RAG retrieve (P0 Tier 1, 2h)

**Files**: `supabase/functions/unlim-chat/index.ts:241-294` (refactor sequential await → Promise.all parallel)

**Spec**: line 241 `loadStudentContext(sessionId)` + line 247-294 RAG retrieve (hybrid OR dense) currently sequential. Refactor:
```typescript
const [studentContext, ragResult] = await Promise.all([
  loadStudentContext(sessionId),
  useHybrid ? hybridRetrieve(safeMessage, topKReq, {}) : retrieveVolumeContext(safeMessage, safeExperimentId, 3),
]);
```

**Acceptance**: R5 latency lift -800-1200ms p95 (Azure pattern parallelize 72x potential, conservative 30% on this hot path).

**Source**: Azure LLM Latency Guidebook + Mistral docs (parallel_tool_calls default true).

### ATOM-S38-A4 — Maker-1 Mistral streaming SSE wire-up (P0 Tier 1, 4h)

**Files**: `supabase/functions/_shared/llm-client.ts:callLLM` aggiunge `stream: true` + chunk parsing + `supabase/functions/unlim-chat/index.ts` SSE response forwarding.

**Spec**: Mistral chat completions `stream:true` returns `data: {...}\n\n` SSE format. Forward chunks to client browser `useGalileoChat.js` via SSE Edge Function response.

**Acceptance**: TTFB perceived improvement (first chunk <500ms vs current full response 3000-8000ms).

**Source**: Mistral docs API streaming + Azure LLM Latency Guidebook + Voxtral Realtime arxiv paper streaming WS pattern.

### ATOM-S38-A5 — Maker-1 Onniscenza topK 3→2 default + warmup cron (P0 Tier 1, 1h)

**Files**: `supabase/functions/_shared/onniscenza-classifier.ts` topK default 3→2 (deep_question + safety_warning preserve 3, others 2). Cron 30s warmup ping `unlim-chat` HEAD request prevent cold start.

**Acceptance**: chit_chat latency preserve <1000ms; deep_question latency reduction -300-500ms; cold start <500ms first request.

### ATOM-S38-A6 — WebDesigner-1 Lighthouse score ChatbotOnly + EasterModal (P1, 1h)

**Files**: `npx lighthouse https://www.elabtutor.school/#chatbot-only --view` + EasterModal route.

**Acceptance**: Lighthouse perf ≥90 + a11y ≥95 + SEO ≥100 (PDR iter 37 Atom A6 deferred).

### ATOM-S38-A6.b — WebDesigner-1 ChatbotOnly Cronologia enhancement Google-style (P2, 2h)

**Files**: `src/components/chatbot/ChatbotOnly.jsx` Sidebar Cronologia rebuild Google-style (search bar + filtering + bulk select + export).

**Source**: Tea iter 33+ carryover.

### ATOM-S38-A7 — Maker-2 ADR-030 + Maker-1 Mistral function calling INTENT (P0 Tier 1 ⭐, 6h)

**Files**:
- NEW `docs/adrs/ADR-030-mistral-function-calling-intent-canonical.md` (~400 LOC)
- Modify `supabase/functions/_shared/llm-client.ts:callLLM` aggiunge optional `responseFormat: { type: 'json_schema', schema: { ... } }` parameter
- Modify `supabase/functions/_shared/system-prompt.ts` drop INTENT prompt block (replaced by tools schema)
- Modify `supabase/functions/unlim-chat/index.ts` pass tools schema su action-required prompts

**Spec ADR-030**: Mistral La Plateforme native function calling guarantees JSON output matching schema. Replace iter 36+37 prompt-teaching INTENT (R7 0% pre-fix evidence) with type-safe schema:
```typescript
const INTENT_TOOLS_SCHEMA = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      intents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            tool: { type: 'string', enum: ['highlightComponent', 'mountExperiment', 'captureScreenshot', /* 12 whitelist */] },
            args: { type: 'object' },
          },
          required: ['tool', 'args'],
        },
      },
      text: { type: 'string', description: 'Response prose Italian K-12 plurale Ragazzi' },
    },
    required: ['text'],
  },
};
```

**Acceptance**: R7 INTENT exec rate ≥95% (vs iter 37 0% pre-fix → projected ~50-70% post v53 system-prompt fix → ≥95% via native schema).

**Source**: Mistral docs API response_format + tools + Azure LLM Latency Guidebook + Perf Engineer iter 38 P0 plan candidate P.

### ATOM-S38-A8 — Tester-3 Vision Gemini Flash primary smoke + Andrea ratify GOOGLE_API_KEY env (P0, 1h)

**Spec**: Verify Gemini Flash primary path works (not just Pixtral fallback verified iter 37). Andrea ratify GOOGLE_API_KEY env set Supabase secrets.

**Acceptance**: smoke `unlim-vision` HTTP 200 con header `X-Vision-Provider: gemini-2.5-flash` (vs `pixtral-12b` iter 37 fallback).

### ATOM-S38-A9 — Maker-1 STT migration CF Whisper → Voxtral Transcribe 2 (P0 Tier 1 ⭐⭐, 6h)

**Files**:
- NEW `supabase/functions/_shared/voxtral-stt-client.ts` (~250 LOC, Mistral REST `https://api.mistral.ai/v1/audio/transcriptions`)
- Modify `supabase/functions/unlim-stt/index.ts` migration callVoxtralTranscribe primary + cfWhisperSTT fallback (gradual migration safety)
- NEW `docs/adrs/ADR-031-stt-migration-voxtral-transcribe.md` (~300 LOC rationale)

**Spec**: Mistral Voxtral Transcribe 2:
- $0.003/min Mini (vs CF Whisper free tier 10k/day shared)
- Italian K-12 ✓ (13 lingue)
- 4% WER FLEURS (vs CF Whisper unverified WER prod)
- mp3/wav/m4a/flac/ogg ✓
- 3 ore max + 1GB max
- Speaker diarization + context bias (Datasette example Simon Willison)
- EU GDPR clean Francia (vs CF US/EU edge)
- Stack 100% Mistral coherence (Sense 2 Morfismo)

**Acceptance**: Tester-4 STT 9-cell matrix Voxtral primary 9/9 PASS + latency <500ms (vs iter 37 CF Whisper post-fix 1071-2200ms).

**Source**: Mistral Voxtral Transcribe 2 + Simon Willison hands-on + arxiv Voxtral Realtime paper.

### ATOM-S38-A10 — Maker-1 Onnipotenza Deno port 62-tool subset server-safe (P0, 6-8h)

**Files**:
- NEW `supabase/functions/_shared/clawbot-dispatcher-deno.ts` (~600 LOC, port 12-tool subset server-safe)
- Modify `supabase/functions/unlim-chat/index.ts` post-LLM dispatch via Deno dispatcher (not just surface to browser)

**Spec**: 12-tool subset server-safe (NO browser DOM dependencies):
- highlightComponent (server tracks state, browser renders)
- mountExperiment (Edge Function loads lesson-path, browser renders)
- captureScreenshot (browser-only, surface to browser)
- getCircuitState / getCircuitDescription (browser context, surface to browser)
- clearCircuit (server validates, browser executes)
- highlightPin / clearHighlights (state tracking)

**Acceptance**: 12-tool subset Deno port unit tests 24+ PASS + integration test live unlim-chat dispatcher invokes tool stub successfully.

**Source**: ADR-028 §7 canary rollout + iter 36 close A1 INTENT parser surface-to-browser pivot.

### ATOM-S38-A11 — WebDesigner-1 wake word UX flow auto-warm-up (P1, 1.5h)

**Files**: `src/components/lavagna/LavagnaShell.jsx` + `src/components/HomePage.jsx` mount-time UX prompt.

**Spec**: Pre-emptive permission request UX nudge "Ragazzi, autorizza il microfono per usare la voce di UNLIM" + click bottone "Autorizza" → `navigator.permissions.query({name: 'microphone'})` → if `prompt` then `getUserMedia({audio: true})` → on success start `wakeWord.startWakeWordListener()`.

**Acceptance**: First-load HomePage UX shows permission nudge if mic not yet granted; on grant, wake word listener starts immediately.

### ATOM-S38-A12 — Maker-1 PWA SW Workbox prompt-update pattern (P1 carryover iter 36, 2h)

**Files**: `vite.config.js` PWA config `registerType: 'autoUpdate'` → `'prompt'` + `src/components/common/UpdatePrompt.jsx` NEW + LavagnaShell mount.

**Spec**: VitePWA registerType prompt + `controllerchange` event listener → toast plurale "Ragazzi, c'è una nuova versione di ELAB Tutor. Ricaricate la pagina per aggiornare?" + 5s auto-reload countdown + manual reload button.

**Acceptance**: Post Vercel deploy → users see toast → reload → fresh chunks loaded (NO stale UI strings post key rotation iter 32 reproduced).

**Source**: web.dev PWA + Workbox Issue #2767 + iter 36 Atom A12 research.

### ATOM-S38-A13 — Maker-1 canary 5%→25%→100% rollout ADR-028 §7 (P0, 3h)

**Files**: `supabase/functions/unlim-chat/index.ts` env flag `CANARY_DENO_DISPATCH_PERCENT=5` + bucket sessionId hash → execute Deno dispatcher (5%) vs surface-to-browser (95%).

**Spec**: Hash-based deterministic bucket (consistent per session) + telemetry log dispatch_path metric. Phase rollout:
- iter 38 entrance: 5%
- iter 38 mid: 25% (post 24h baseline)
- iter 39 entrance: 100%

**Acceptance**: Canary telemetry `intent_dispatch_path: { 'deno': N, 'browser': M }` ratio matches env flag.

### ATOM-S38-A14 — Maker-3 linguaggio codemod 200 violations singolare→plurale (P0 carryover iter 21, 4h)

**Files**: scan `src/**/*.{jsx,js,ts}` per pattern singolare imperativo (`fai`, `clicca`, `premi`, `controllA`, `monta`, `verifica` 2nd person singular) + replace plurale ("ragazzi, fate/cliccate/premete/controllate/montate/verificate").

**Tool**: `comby` o `ast-grep` pattern matching + manual review false positives.

**Acceptance**: codemod scan 200 violations → ≤20 false positives + 180+ replaced + audit doc `docs/audits/iter-38-linguaggio-codemod.md`.

**Source**: Andrea iter 21 mandate + iter 28 close honesty caveat #4.

### ATOM-S38-A15 — Tester-1 94 esperimenti Playwright UNO PER UNO sweep audit (P0 carryover iter 21, 3h)

**Files**: `tests/e2e/29-94-esperimenti-audit.spec.js` (rename from 92→94 + harness real exec) + `docs/audits/iter-38-94-esperimenti-broken-audit.md`.

**Spec**: Use `elab-harness-real-runner` skill — Playwright per esperimento → mountExperiment → verify components placed correctly + connections valid + simulator runs without error + Vol/pag book reference present. Document broken count REAL (vs iter 36 D3 87/92 lesson-paths reali — extend to 94).

**Acceptance**: 94 esperimenti × 4 categorie test (mount, components, simulate, book ref) = 376 atomic checks. Broken count REAL ≤10 ideal target (Andrea iter 21 mandate "broken UNO PER UNO ~92 esperimenti audit kit fisico mismatch + componenti mal disposti + non-funzionanti").

### ATOM-S38-A16 — Documenter audit Tres Jolie volumi parallelismo (P2 carryover iter 33+, 3h)

**Files**: NEW `docs/audits/iter-38-tres-jolie-volumi-parallelismo.md` ~600 LOC table per cap.

**Spec**: scan `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/` + match each volume cap → software lesson-path → audit visual coherence Sense 2 Morfismo.

### ATOM-S38-D1 — Andrea ratify ADR-025 modalità 4 simplification (15 min)

Andrea decide voci 1+2+3 ADR-025 per simplification iter 22 carryover.

### ATOM-S38-D2 — Andrea ratify ADR-026 + Maker-1 deploy content-safety-guard runtime (30 min)

Andrea ratify deploy + Maker-1 wire-up + smoke test 10 rules.

### ATOM-S38-D3 — Davide co-author session 1h ADR-027 schema + Maker-2 implement (4h)

Davide bookText Vol1+2+3 narrative refactor 92→140 lesson-paths schema. Maker-2 architect schema. Maker-3 implement.

### ATOM-S38-D4 — Tea homepage Glossario integration spec session + Maker-3 port (4h)

Tea spec session + Maker-3 port from elab-tutor-glossario.vercel.app to main app.

---

## §4 Anti-inflation benchmark obbligatorio (G45 iter 38)

| Metrica | Pre iter 38 (iter 37 close) | Target iter 38 ONESTO | Misurazione |
|---------|------------------------------|----------------------|-------------|
| vitest PASS | 13474 | ≥13524 (+50 NEW) | `npx vitest run` |
| Build | PASS dist/sw.js + 32 precache | PASS <14min | `npm run build` |
| **R5 50-prompt avg latency** | 4496ms | **<3000ms** | bench R5 post-Tier-1 |
| **R5 50-prompt p95 latency** | 10096ms | **<6000ms** | bench R5 post-Tier-1 |
| R5 PZ V3 verdict | PASS 93.60% | PASS ≥85% (preserve) | scorer 12 rules |
| R6 100-prompt recall@5 | 0.067 (fixture mismatch) | **≥0.55** | bench R6 v2 fixture |
| **R7 200-prompt INTENT exec** | 0% pre-fix → ⏳ Tester-6 v53 | **≥95%** post Mistral function calling | bench R7 native schema |
| Vision Pixtral latency | 2748ms | preserve | curl smoke |
| **Vision Gemini Flash primary** | NOT verified (Pixtral fallback) | **HTTP 200 X-Vision-Provider: gemini-2.5-flash** | smoke env GOOGLE_API_KEY |
| TTS Voxtral latency | 1181ms p50 (iter 31) | preserve | curl smoke |
| **STT Voxtral Transcribe** | NEW migration | **9/9 PASS <500ms** | Tester-4 9-cell matrix |
| **94 esperimenti broken count** | unaudited | **≤10 broken** | Tester-1 Playwright sweep |
| **Linguaggio violations singolare** | ~200 unaudited | **≤20 false positives** | Maker-3 codemod scan |
| Lighthouse perf | unaudited | **≥90** | Chrome DevTools |
| Lighthouse a11y | unaudited | **≥95** | Chrome DevTools |
| Lighthouse SEO | unaudited | **≥100** | Chrome DevTools |
| ToolSpec count | 57 definitive | preserve | grep `^\s+name:\s+["']` |
| Bug Andrea ≤2 unresolved | 5+ carryover | **≤2** (Davide schema + Tea Glossario expected) | audit |
| Vercel deploy | NOT verified post key rotation iter 32 | LIVE + fresh chunks served | npx vercel --prod |
| Browser INTENT dispatch | NOT verified end-to-end | LIVE + dispatcher whitelist 12 actions exec | smoke prod |

**Score formula** iter 38:
```
score = (atoms_passed / 20) * 8.0 + (carryover_closed / 24) * 1.5 + bonus_anti_inflation_max_0.5
G45 cap iter 38: 9.5/10 (Sprint T close, Opus indipendente review mandatory)
```

**Cap conditions**:
- vitest <13474 → cap 7.5 (regression block)
- Build FAIL → cap 6.0
- R5 p95 >6000ms → cap 8.5 (latency target miss)
- R7 INTENT <80% → cap 8.5 (Onnipotenza target miss)
- Onnipotenza Deno port NOT shipped → cap 8.5 (Sprint T close incomplete)
- Score raw >9.5 → G45 cap 9.5 (Opus indipendente review needed)
- Carryover iter 36+37 closed <80% (19/24) → cap 9.0

---

## §5 Anti-regressione FERREA (mandate Andrea + iter 36+37 carryover)

1. **vitest baseline 13474** PASS — pre-commit hook ENFORCES delta. `git commit --no-verify` PROIBITO iter 38.
2. **Pre-push hook**: build PASS — bypass vietato.
3. **Branch protection**: NO push `main`. Solo `e2e-bypass-preview` + PR.
4. **Snapshot baseline**: `git tag iter-38-phase-{0,1,2,3}-HHMM`.
5. **Stash + verify**: se test scendono `git stash && npx vitest run` — se passa, bug iter 38, REVERT.
6. **Critical files lock**: `scripts/guard-critical-files.sh` blocca CircuitSolver/AVRBridge/PlacementEngine senza marker.
7. **Score guardrail**: `node scripts/benchmark.cjs --write` post-Phase 3.
8. **Pattern S r3 race-cond fix protocol**: msg emission step MANDATORY each agent contract (mitigation iter 12 §7.2 protocol gap).
9. **NO debito tecnico carryover iter 39**: 24 voci closed o explicit defer iter 39+ documented (NO silent skip).
10. **Mistral Scale tier €18/mese** preserve voice clone Andrea voice_id 9234f1b6-766a-485f-acc4-e2cf6dc42327 — NON cancellare account.

---

## §6 Phase coordination

| Phase | Time | Agents | Sync gate |
|-------|------|--------|-----------|
| Phase 0 entrance | 30min | Tester-2 | vitest 13474 + build GREEN tag iter-38-phase-0 + Tester-6 R7 verify v53 result analysis (pre-iter-37 close) + Vercel deploy verify |
| Phase 1 atomi parallel | 8-10h | Maker-1 + Maker-2 + Maker-3 + WebDesigner-1 (4 parallel) | 4/4 completion msg filesystem barrier |
| Phase 2 Documenter | 2h | Documenter ONLY | 1/1 completion msg + Mac Mini cron LIVE |
| Phase 3 verify+fix BG | 3-5h | Tester-1+2+3+4 + Perf Engineer | 5/5 fix completion msgs + R5/R6/R7 re-bench |
| Phase 4 commit+push+Vercel | 1h | All idle, MacBook orchestrator | bench R5+R6+R7 + Playwright + commit + push origin + Vercel deploy + smoke prod |

**Total**: ~14-18h (1 sessione lunga OR 2 sessioni 7-9h each).

---

## §7 ACTIVATION STRING iter 38 paste-ready

```
Esegui PDR ITER 38 Sprint T close in `docs/pdr/PDR-ITER-38-SPRINT-T-CLOSE-CARRYOVER-COMPLETE.md`.
Spawn Pattern S r3 4-agent OPUS PHASE-PHASE (Maker-1 + Maker-2 + Maker-3 + WebDesigner-1) + Documenter Phase 2 sequential post 4/4 barrier + 5 fix BG agents Phase 3 (Tester-1+2+3+4 + Perf Engineer continuation).
Pre-flight CoV Phase 0: vitest 13474 baseline preserve + build PASS + Edge Function unlim-chat v53 LIVE + Mac Mini cron mapping log delta + Vercel deploy verify post key rotation iter 32 + Tester-6 R7 verify v53 result analysis (pre-iter-37 close).
Andrea ratify queue Phase 0 entrance (4 voci D1+D2+D3+D4): ADR-025 modalità 4 + ADR-026 content-safety-guard deploy + ADR-027 Davide co-author session + Tea Glossario spec session.
Anti-inflation G45 cap 9.5 ONESTO Opus indipendente review. Anti-regressione vitest 13474+ NEVER scendere. NO --no-verify mai. NO push main. NO debito tecnico — 24 carryover voci iter 36+37+33 chiusi o explicit defer iter 39+.
P0 Tier 1 atoms iter 38 P0 latency target R5 avg <3000ms p95 <6000ms: A3 Promise.all parallelize + A4 Mistral streaming SSE + A5 Onniscenza topK reduce + A7 ADR-030 Mistral function calling INTENT (R7 ≥95% target) + A9 STT migration Voxtral Transcribe 2 + A10 Onnipotenza Deno port 62-tool subset server-safe + A13 canary 5%→25%→100% rollout.
P0 carryover iter 21 mandate: A14 linguaggio codemod 200 singolare→plurale + A15 94 esperimenti Playwright UNO PER UNO sweep audit (Tester-1 elab-harness-real-runner skill).
Bench mandatory: R5 post-Tier-1 avg <3000ms p95 <6000ms + R6 v2 fixture recall@5 ≥0.55 + R7 native schema ≥95% + Tester-4 STT Voxtral 9/9 PASS + Lighthouse ≥90/95/100.
Activation iter 39 in audit close §7. Sprint T close iter 38 target 9.5/10 ONESTO Opus indipendente review (G45 mandate).
```

---

## §8 Plugin + connettori critici iter 38

| Categoria | Tool primario | Uso atoms |
|-----------|---------------|-----------|
| Browser | `mcp__Claude_in_Chrome__*` + `mcp__plugin_playwright_playwright__*` | A8 Vision smoke + A11 wake word UX prod + A15 esperimenti Playwright |
| Testing | `mcp__plugin_playwright_playwright__*` + `superpowers:test-driven-development` | A15 94 esperimenti + A2 Fumetto fix + A11 UX |
| Deploy | `mcp__57ae1081-...__deploy_to_vercel` Vercel MCP + `npx supabase functions deploy` | Phase 4 Vercel + A4 streaming + A7 function calling + A9 STT migration + A10 Deno port |
| Supabase | `npx supabase functions deploy` + `secrets set` + `db push --linked` | A1 page metadata SQL + A7+A9+A10 deploy |
| Debug | `superpowers:systematic-debugging` `agent-teams:team-debug` | A2 Fumetto root cause + A1 R6 fixture |
| Memory | `mcp__plugin_claude-mem_mcp-search__*` `claude-mem:mem-search` `claude-mem:timeline` | A16 Tres Jolie audit + Documenter context |
| Web research | `WebSearch` + `WebFetch` | Mistral docs + Voxtral references |
| Architecture | `feature-dev:code-architect` `superpowers:writing-plans` `superpowers:make-plan` | ADR-030 + ADR-031 design |
| Anti-inflation | `superpowers:verification-before-completion` + `node scripts/benchmark.cjs --write` | Phase 4 score cap G45 |
| GitHub | `gh` CLI | iter close commit + PR + push |
| Mac Mini | SSH `progettibelli@100.124.198.59` + `~/.ssh/id_ed25519_elab` + `elab-macmini-controller` skill | D2/D3/D4 dispatch retry |
| Bench scoring | `scripts/bench/score-unlim-quality.mjs` 12 PZ rules + `elab-benchmark` skill | A1.b R5 + A1 R6 + A7 R7 |
| Telemetry | `mcp__plugin_posthog_*` `mcp__plugin_sentry_*` | Edge Function metrics + canary rollout |
| Codemod | `comby` o `ast-grep` | A14 linguaggio singolare→plurale |
| Lighthouse | `npx lighthouse` Chrome DevTools | A6 |
| Skill ELAB | `elab-harness-real-runner` `elab-quality-gate` `elab-principio-zero-validator` `elab-benchmark` | A15 + Phase 0/2/3 quality gates |

---

## §9 14+ URL sources references (Andrea-provided iter 37 → iter 38 P0 plan)

### Primary references (FETCHED)

1. **Azure LLM Latency Guidebook** — top 10 GenAI techniques + impact %: https://github.com/Azure/The-LLM-Latency-Guidebook-Optimizing-Response-Times-for-GenAI-Applications
2. **Sean Goedecke fast-llm-inference** — KV cache + speculative + memory bandwidth: https://www.seangoedecke.com/fast-llm-inference/
3. **Mistral docs API** — streaming SSE + response_format json_schema + tools: https://docs.mistral.ai/api/
4. **Mistral docs developers** — SDK Python/TS quickstarts: https://docs.mistral.ai/developers
5. **Mistral docs hub** — Le Chat + Studio + Vibe + agents: https://docs.mistral.ai/
6. **Mistral Mixtral of Experts** — MoE 8x7B 12.9B active 6x faster Llama 70B: https://mistral.ai/news/mixtral-of-experts
7. **SuperAnnotate Mixtral analysis** — mistral-small endpoint = Mixtral backend: https://www.superannotate.com/blog/mistral-ai-mixtral-of-experts
8. **Mistral Voxtral Transcribe 2** — STT $0.003/min Italian K-12 4% WER FLEURS: https://mistral.ai/news/voxtral-transcribe-2
9. **DigitalApplied Voxtral TTS guide** — 70ms H200 + 9.7x real-time + voice clone 3s: https://www.digitalapplied.com/blog/mistral-voxtral-tts-open-source-text-to-speech-guide
10. **arxiv Voxtral Realtime paper** — causal audio encoder + paged attention heterogeneous KV: https://arxiv.org/html/2602.11298v3
11. **Simon Willison Voxtral 2** — hands-on $0.18/hour STT speaker diarization: https://simonwillison.net/2026/Feb/4/voxtral-2/
12. **Mistral OCR** — $1/1000 pages 94.89% accuracy iter 38 P2 candidate: https://mistral.ai/news/mistral-ocr
13. **antirez voxtral.c** — native C Voxtral inference Apple M3 Max 2.5x real-time iter 39+ local: https://github.com/antirez/voxtral.c
14. **kdnuggets top-5 LLM API providers** — provider comparison: https://www.kdnuggets.com/top-5-super-fast-llm-api-providers
15. **Lightning vLLM Mistral 7B** — PagedAttention + continuous batching iter 39+: https://lightning.ai/lightning-ai/studios/optimized-llm-inference-api-for-mistral-7b-using-vllm

### Generic API performance references (Perf Engineer absorbed)

16. apitestlab why-is-my-api-slow — N+1 query patterns
17. medium dev-notebook your-api-is-slow — middleware overhead
18. medium kaushalsinh why-your-api-is-slow — EXPLAIN queries batch fetch
19. zuplo solving-poor-api-performance + mastering-throughput — API gateway edge caching
20. bytebytego top-5-improve-api — caching async pagination batch indexing
21. stackademic from-slow-to-supercharged — eager loading indexing
22. linkedin alexxubyte SystemDesign + milan-jovanovic 17h — generic patterns

### Blocked URLs (reddit.com fetch blocked)

- reddit Claude debug API slow
- reddit Mistral 10x TTFT (Reuse Sean Goedecke + Mistral docs equivalent insight)

---

## §10 Skill ELAB-specific iter 38 (custom skills marketplace)

| Skill | Use case iter 38 |
|-------|------------------|
| `elab-session-orchestrator` | Avvio sessione iter 38 + 8 agent paralleli |
| `elab-benchmark` | 30 categorie benchmark score oggettivo (alternative `node scripts/benchmark.cjs`) |
| `elab-runpod-orchestrator` | iter 39+ voxtral.c local inference exploration ($13 budget cap discipline) |
| `elab-principio-zero-validator` | Runtime PZ V3 12-rule scorer ogni LLM response |
| `elab-harness-real-runner` | A15 Playwright UNO PER UNO 94 esperimenti audit (NOT static JSON harness 2.0) |
| `elab-macmini-controller` | D2/D3/D4 dispatch retry + Wiki batch overnight |
| `elab-competitor-analyzer` | Iter 39+ market positioning Tinkercad/Wokwi/LabsLand |
| `elab-quality-gate` | Phase 0/2/3 gate pre/post sessione |
| `elab-cost-monitor` | Mistral Scale tier €18/mese + budget tracking |
| `volume-replication` | Vol Sense 2 Morfismo coherence verify |

---

## §11 Output finale iter 38

A fine sessione `docs/handoff/2026-05-XX-iter-38-to-iter-39-handoff.md` DEVE contenere:

1. ✅ Score G45 ricalibrato 9.5/10 ONESTO (Opus indipendente review condition met OR cap inferiore con razionale)
2. ✅ 20 atoms delivery matrix (file system verified)
3. ✅ ≤2 honesty caveats critical (residui carryover iter 39+ explicit)
4. ✅ Sprint T close 13 boxes status final + Box 14 INTENT exec end-to-end ≥0.95 + Box 15 STT Voxtral migration LIVE ≥0.95
5. ✅ Mac Mini mapping log delta + L3 cycles count post-deploy refresh keys + D2/D3/D4 dispatch result
6. ✅ Iter 39 priorities P0 preview (Sprint U: voxtral.c local + Mistral OCR re-ingest + multi-region Edge + voice clone Davide narratore Sense 2)
7. ✅ ACTIVATION STRING iter 39 paste-ready
8. ✅ Andrea ratify queue updated (decisioni pending iter 39+: voci 5+ deferred)
9. ✅ R5/R6/R7 final metrics post-Tier-1 + verdict G45
10. ✅ 94 esperimenti broken count REAL + linguaggio codemod result + Lighthouse score

**NO inflation. NO compiacenza. G45 cap 9.5 enforced Opus indipendente review. Anti-regressione FERREA. NO debito tecnico — 24 carryover closed o explicit defer iter 39+.**

---

## §12 Pre-flight CoV iter 38 entrance checklist

Andrea + orchestrator MUST verify Phase 0 entrance:

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"

# 1. Vitest baseline 13474+ PASS
npx vitest run --reporter=basic | tail -5
# Expected: Tests 13474+ passed | 15 skipped | 8 todo

# 2. Build PASS (heavy ~14min)
npm run build 2>&1 | tail -10
# Expected: ✓ dist/sw.js + workbox-* + 32 precache entries

# 3. Edge Function status
SUPABASE_ACCESS_TOKEN=$(grep "^export SUPABASE_ACCESS_TOKEN" ~/.zshrc | cut -d'=' -f2 | tr -d '"\047' | tr -d ' ')
SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" npx supabase functions list --project-ref euqpdueopmlllqjmqnyb
# Expected: 11+ ACTIVE incluso unlim-chat v53+ + unlim-stt vN+ post Tester-6 verify

# 4. Mac Mini cron LIVE
ssh -i ~/.ssh/id_ed25519_elab progettibelli@100.124.198.59 'crontab -l | grep iter3[6-7]-cron.log | wc -l'
# Expected: 4 entries

# 5. Vercel deploy verify post iter 32 key rotation
curl -I https://www.elabtutor.school | head -5
# Expected: HTTP/2 200 + last-modified <24h

# 6. Tester-6 R7 verify v53 result (iter 37 Phase 3 close)
ls -la automa/team-state/messages/tester6-iter37-phase3-completed.md
cat automa/team-state/messages/tester6-iter37-phase3-completed.md | head -30
# Expected: completion msg + R7 canonical INTENT rate post-v53 measured

# 7. Andrea ratify queue 4 voci D1+D2+D3+D4
# D1: ADR-025 modalità 4 simplification YES/NO/AMEND
# D2: ADR-026 content-safety-guard deploy YES/NO
# D3: Davide co-author 1h schedule (today/this week)
# D4: Tea Glossario spec session schedule
```

Se ANY fail → REVERT iter 38 spawn → diagnose + fix → re-entrance.

---

**Status**: PROPOSED iter 38 ready spawn. Cascade target Sprint T close 9.5/10 iter 38 ONESTO conditional Opus indipendente review (G45 mandate).

---

## Appendix — Iter 38 timeline esempio

```
HH:00 — Phase 0 entrance pre-flight CoV (30 min)
HH:30 — Andrea ratify 4 voci D1+D2+D3+D4 (15 min)
HH:45 — Phase 1 spawn 4 agents OPUS parallel
HH:45+8h — Phase 1 close barrier 4/4 completion msgs
HH:45+8h+15min — Phase 2 Documenter spawn sequential
HH:45+10h — Phase 2 close barrier
HH:45+10h+15min — Phase 3 spawn 5 fix BG agents
HH:45+10h+5h — Phase 3 close barrier 5/5 completion msgs
HH:45+15h — Phase 4 commit + push + Vercel deploy + smoke prod (1h)
HH:45+16h — Sprint T close iter 38 final score G45 + handoff iter 39 + activation string
```

**Total wall-clock**: ~16h (2 sessioni 8h o 1 sessione lunga + breaks).

**Andrea bandwidth**: 1h ratify + 1h Davide + 1h Tea spec + 30 min smoke verification = ~3.5h hands-on Andrea iter 38.
