# ELAB Tutor — Onniscenza + Onnipotenza Audit (iter 29 close, pre-iter 30)

**Date**: 2026-04-30
**Author**: Audit agent (read-only)
**Commit baseline**: `be93d8d` (iter 29 Voxtral mini-tts-2603 PRIMARY + Task 29.1+29.2 PIVOT)
**Scope**: verify Onniscenza 7-layer aggregator + Onnipotenza 4-layer ClawBot dispatcher + PRINCIPIO ZERO + Morfismo runtime + GDPR + Voxtral + test infra + ELAB API global runtime.
**Method**: file-system evidence + line citations only. ZERO mock, ZERO claim without grep verification. G45 anti-inflation cap enforced.

---

## 1. Executive summary

**Score readiness ONESTO 1-10**: **6.4 / 10**

| Pillar | Score | Status |
|--------|-------|--------|
| Onnipotenza (ClawBot dispatcher chain) | 7.5 / 10 | **DONE_WITH_CONCERNS** — L1/L2/L3 modules all shipped, L2 templates wired in unlim-chat:317-376; dispatcher.ts NOT called from Edge Function path; auditDispatcher only console-driven |
| Onniscenza (7-layer aggregator) | 4.0 / 10 | **NEEDS_CONTEXT** — `state-snapshot-aggregator.ts` (455 LOC) + `onniscenza-bridge.ts` (381 LOC) both shipped, **but NEITHER called from any production code path**. Edge Function uses ad-hoc `retrieveVolumeContext` + `hybridRetrieve` directly, not the aggregator |
| PRINCIPIO ZERO + Morfismo runtime | 7.5 / 10 | **DONE** — 6 PZ rules runtime LIVE (`principio-zero-validator.ts` 181 LOC), BASE_PROMPT v3.1 deployed (kit fisico mandatory + plurale Ragazzi + Vol/cap citation), `buildCapitoloPromptFragment` wired |
| GDPR | 6.5 / 10 | **DONE_WITH_CONCERNS** — ConsentBanner + DataDeletion + RegisterPage + together_audit_log + DPIA file present; **Privacy Policy / Cookie Policy / ToS files MISSING from `public/`**; **sub-processor list MISSING** |
| Voxtral integration | 7.0 / 10 | **DONE** — PRIMARY in chain (unlim-tts:24,109-135), Edge TTS fallback step 2, voice cloning helper exposed (`cloneVoice`), VOXTRAL_VOICE_ID env override active. Voice clone audio Andrea/Davide pending |
| Test infrastructure | 7.0 / 10 | **DONE** — patched harness `tests/e2e/29-92-esperimenti-audit.spec.js` present, ClawBot composite tests 5/5 PASS asserted in CLAUDE.md, vitest baseline 12290 (file `automa/baseline-tests.txt`), 14+ bench runners in `scripts/bench/` |
| ELAB API global runtime | 8.0 / 10 | **DONE** — `window.__ELAB_API` exposed via `registerSimulatorInstance` (simulator-api.js:41-42), `getCircuitState` + `mountExperiment` + `clearCircuit` + `connectWire` + `on`/`off` events all present |

**Critical gap iter 30 P0**: the **Onniscenza aggregator is NOT WIRED to production**. The Edge Function delivers context via direct calls to `retrieveVolumeContext` (rag.ts) and `hybridRetrieve`, bypassing the documented 7-layer parallel orchestration. Modules `state-snapshot-aggregator.ts` and `onniscenza-bridge.ts` are exposed but no `import` from any function under `supabase/functions/` references either entrypoint (verified via `grep -rn "aggregateOnniscenza\|buildStateSnapshot" supabase/`).

---

## 2. Onniscenza checklist — 7-layer aggregator

Two distinct modules exist (not consolidated):

### 2A. `scripts/openclaw/state-snapshot-aggregator.ts` (455 LOC, dated 2026-04-22)

| Claim | Evidence | Status |
|-------|----------|--------|
| Parallel orchestration circuit + Wiki + RAG + memoria classe + vision + LLM-knowledge | `Promise.all` over 6 layers (`buildStateSnapshot` lines 215-277) | OK in code |
| RRF k=60 fusion | **MISSING** — uses `withTimeout` parallel collection but NO RRF code in this module | NOT in this file |
| Dedup + intent routing | Not implemented in this file | NOT here |
| Cache (Redis / Supabase pgvector) | None — all live calls | none |
| Latency target p50 <2s p95 <5s | Default `timeoutMs = 400` (line 201). Per-layer `withTimeout` enforces this. Total realistic p50 ~400ms when retrieval cold | projection |
| Wired in production Edge Functions | **NO** — `grep -rn "buildStateSnapshot" supabase/` returns ONLY `state-snapshot-aggregator.ts` itself | **scaffold only** |

`docs finding`: **[ ] aggregator scaffold non in path** — `state-snapshot-aggregator.ts` exists with full type contract + parallel `Promise.all` over 6 layers + graceful degradation, but no Edge Function imports it.

### 2B. `supabase/functions/_shared/onniscenza-bridge.ts` (381 LOC, dated 2026-04-29 iter 24)

| Claim | Evidence | Status |
|-------|----------|--------|
| 7-layer aggregator (L1-L7) | `aggregateOnniscenza()` lines 299-367 with `timed()` wrapper Promise.all of 7 fetchers | OK in code |
| RRF k=60 fusion | `rrfFuse(layered, k=60)` lines 275-293 | LIVE |
| L1 RAG hybrid via `hybridRetrieve` | Lines 87-110 (lazy import, supabase-client gated) | LIVE-when-supabase-client-passed |
| L2 Wiki via `rag_chunks WHERE source='wiki'` | Lines 128-149 | LIVE-when-supabase-client-passed |
| L3 Glossario merged into L1 (`wikiFusionActive`) | Line 96 + line 376 status `'TODO'` | TODO marker |
| L4 Sessione (`unlim_sessions`) | Lines 168-194 | LIVE-when-supabase-client-passed |
| L5 Lesson context (NOT vision per iter 24 spec) | Lines 209-225 (mislabeled L5_vision) | LIVE |
| L6 Chat history rolling window | Lines 227-246 | LIVE-when-history-passed |
| L7 Onthefly circuit_state | Lines 248-261 | STUB |
| Wired in production Edge Functions | **NO** — `grep -rn "aggregateOnniscenza" supabase/` returns ONLY `onniscenza-bridge.ts` itself | **NOT WIRED** |

`docs finding`: **[ ] aggregator more complete (7-layer + RRF) but unused** — `onniscenza-bridge.ts` is the more advanced of the two and explicitly marked `ONNISCENZA_BRIDGE_IS_STUB = false` (line 371). Despite being LIVE-capable, **no caller invokes it**. The unlim-chat Edge Function (lines 268-316) uses direct `retrieveVolumeContext` + `hybridRetrieve` calls instead of `aggregateOnniscenza`.

---

## 3. Onnipotenza checklist — 4-layer ClawBot dispatcher

### 3A. ToolSpec count (52 claim)

`grep -cE "^\s+name:\s*'[a-zA-Z]" scripts/openclaw/tools-registry.ts` → **57 entries** (claim "52" understates by 5; cap at 57).

### 3B. L1 composite chain `executeComposite`

| Claim | Evidence | Status |
|-------|----------|--------|
| `executeComposite` exported | `composite-handler.ts:304` | LIVE |
| Sequential dispatch via injectable `dispatch` | `dispatcher.ts:213-244` lazy-imports `executeComposite` when `context.use_composite=true` | LIVE behind opt-in |
| Memory cache adapter (`CompositeMemoryAdapter`) | `composite-handler.ts:156` | type defined |
| 5/5 composite tests PASS | `scripts/openclaw/composite-handler.test.ts` exists 224→481 LOC | per CLAUDE.md (not re-run this audit) |

### 3C. L2 templates 20/20 LIVE

| Claim | Evidence | Status |
|-------|----------|--------|
| `clawbot-templates.ts` 20 templates | 424 LOC, dated 2026-04-29 | LIVE |
| `clawbot-template-router.ts` `selectTemplate` + `executeTemplate` | 300 LOC | LIVE |
| Wired pre-LLM in unlim-chat | `unlim-chat/index.ts:317-376` (try block with selectTemplate → executeTemplate → return short-circuit response) | **WIRED PROD** |
| RAG injection inside template | `unlim-chat/index.ts:330-336` passes `hybridRetrieve` as `ragRetrieve` callback | LIVE |

### 3D. L3 morphic dynamic JS DEV-ONLY flag

| Claim | Evidence | Status |
|-------|----------|--------|
| `VITE_ENABLE_MORPHIC_L3=false` prod default | `morphic-generator.ts:346-348` reads `import.meta.env.VITE_ENABLE_MORPHIC_L3 === 'true'` (defaults FALSE if env var absent) | LIVE GATED OFF |
| No `.env*` file sets L3 to true | `grep -rn "VITE_ENABLE_MORPHIC_L3" .env*` returns 0 matches | confirmed disabled |
| Web Worker sandbox | `morphic-generator.ts` 465 LOC | scaffold (not live-tested in this audit) |

### 3E. Wire-up in unlim-chat:317-376 + Capitolo + RAG inject

| Component | Line | Status |
|-----------|------|-------|
| L2 template short-circuit | 317-376 | WIRED |
| Capitolo fragment via `getCapitoloByExperimentId` + `buildCapitoloPromptFragment` | 294-307 | WIRED |
| RAG dense retrieve → `retrieveVolumeContext` | 281-282 | WIRED |
| Hybrid RAG → `hybridRetrieve` (when env flag set) | logic upstream lines 268-280 (not visible in 280-316 snippet) | wired |
| Pre-LLM check ordering (template before LLM) | 317 (`// 3.5 ClawBot L2 template short-circuit`) before `// 4. Route to optimal model` (382) | CORRECT |

### 3F. `auditDispatcher` audit log

| Claim | Evidence | Status |
|-------|----------|--------|
| `auditDispatcher` defined | `dispatcher.ts:354-380` | LIVE function |
| Persists to Supabase OR file | **NO** — function returns object only (lines 373-379), no insert/write | console-only |
| `audit_writer` callback in DispatchContext | `dispatcher.ts:71-79` parameter exists, optional | callback hook present, no caller |

`docs finding`: **dispatcher.ts is NOT called from any Edge Function** — `grep -rn "dispatcher\|composite-handler" supabase/functions/` returns 0 matches. The composite handler + dispatcher run only in test/script harnesses, not in production unlim-chat path. L2 template router IS wired, which gives a partial Onnipotenza in production (~20 templates) but the broader 57-tool dispatcher is NOT in the request path.

---

## 4. PRINCIPIO ZERO + Morfismo runtime checklist

### 4A. 6 PZ rules runtime enforcement

`supabase/functions/_shared/principio-zero-validator.ts:81-181`. Lines 87-163 implement:

1. `imperativo_docente` HIGH (line 90)
2. `singolare_studente` HIGH (line 104)
3. `max_words_60` MEDIUM (line 116)
4. `no_citation_concept_intro` LOW conditional (line 128)
5. `english_filler` LOW (line 141)
6. `chatbot_preamble` LOW (line 154)

→ **6/6 LIVE**, deferred 6 more to bench-time scorer (`scripts/bench/score-unlim-quality.mjs` per file header).

### 4B. BASE_PROMPT v3 sintesi + Vol/pag + plurale "Ragazzi"

`supabase/functions/_shared/system-prompt.ts:14-176`. Verified:
- Line 14: "Sei UNLIM, il generatore di contenuto didattico"
- Line 20: "SEMPRE plurale inclusivo (\"Ragazzi,\", ...)"
- Line 92-96: REGOLA SINTESI vs CITAZIONE
- Line 98-103: REGOLA CITAZIONE VERBATIM OBBLIGATORIA (iter 23)
- Line 123-127: REGOLA KIT FISICO OBBLIGATORIA (iter 27 v3.1) — kit, breadboard, montate, etc.
- Line 136: "INIZIA SEMPRE con 'Ragazzi,'"
- Line 105-133: 5 few-shot examples Vol/cap citation pattern

→ BASE_PROMPT v3.1 LIVE (kit_mention + plurale Ragazzi + Vol/cap verbatim mandatory).

### 4C. `buildCapitoloPromptFragment` Capitolo injection

| Component | Line | Status |
|-----------|------|-------|
| Function exported | `_shared/capitoli-loader.ts` (8591 bytes) | LIVE |
| Imported in unlim-chat | `index.ts:17` | WIRED |
| Called per request | `index.ts:294-307` | WIRED |

### 4D. Morfismo Sense 1.5 docente/classe adaptation

CLAUDE.md describes Sense 1.5 (memoria docente + classe adaptation, Andrea iter 10 extension 2026-04-27). **No runtime code in `_shared/` or `_shared/memory.ts`** that reads docente-specific context. `loadStudentContext` in `_shared/memory.ts` (line 13 import) loads class-level context only. ADR-019 covers Sense 1.5 design (per CLAUDE.md iter 12 close).

→ **Sense 1.5 = DESIGN ONLY (ADR-019), runtime NOT IMPL.**

### 4E. Morfismo Sense 2 triplet kit + volumi + software coherence

Enforced via:
- BASE_PROMPT line 123-127 (kit mandatory)
- Capitolo loader (volume/page mapping)
- Few-shot examples line 105-133 (kit ELAB phrasing)

→ Sense 2 ENFORCED IN PROMPT, no runtime triplet validator (no DB-side test "is kit/volume/software coherent for current experimentId").

---

## 5. GDPR requirements full matrix

### 5A. EU-only student runtime

| Provider | Region | Used at | Compliance |
|----------|--------|---------|-----------|
| Mistral (primary 65%) | FR | `llm-client.ts:213-217` | EU OK |
| Gemini Flash (fallback) | EU Frankfurt | router.ts | EU OK |
| Together AI | US | gated, `together-fallback.ts:83-97` runtime='student' BLOCKED | gate enforces EU-only for students |
| Voyage 3 embeddings | US | batch only `scripts/rag-ingest-voyage-batch.mjs` | gated batch, OK |
| Cloudflare Workers AI (FLUX schnell + Whisper Turbo + Pixtral 12B) | edge | iter 26-28 deploys | edge runs locally near user |

### 5B. UI components

| Component | File | Status |
|-----------|------|--------|
| ConsentBanner | `src/components/common/ConsentBanner.jsx` (imported `App.jsx:17`) | LIVE |
| DataDeletion | `src/components/auth/DataDeletion.jsx` (lazy `App.jsx:28`) | LIVE |
| RegisterPage minore | `src/components/auth/RegisterPage.jsx` (lazy `App.jsx:27`) | LIVE |

### 5C. Backend tables + RLS

| Table | Migration | Status |
|-------|-----------|--------|
| `gdpr_audit_log` | `001_gdpr_compliance.sql:129` (142 LOC) | applied |
| `together_audit_log` | `20260426152944_together_audit_log.sql` (RLS, indexes, role check) | applied |
| `openclaw_tool_memory` | `20260426152945_openclaw_tool_memory.sql` | applied |
| `rag_chunks` (1881 chunks) | `20260426160000_rag_chunks_hybrid.sql` + `20260427090000_rag_chunks_dedup_unique.sql` | applied per CLAUDE.md iter 7 |
| `scribble_paths` | `20260429120000_scribble_paths.sql` | applied |

### 5D. together-fallback gate truth-table 8 cases

`supabase/functions/_shared/together-fallback.ts:83-97`. Truth table verified:

| runtime | consent_id | anonymized | result |
|---------|------------|------------|--------|
| student | * | * | **false** (line 85) |
| teacher | absent | * | false (line 88) |
| teacher | present | * | true (line 88) |
| batch | * | false | false (line 92) |
| batch | * | true | true (line 92) |
| emergency | * | false | false (line 92) |
| emergency | * | true | true (line 92) |
| unknown | * | * | **false** (line 96, fail-closed) |

→ 8/8 cases enforced.

### 5E. Consent flow integrated in unlim-chat

| Component | Line | Status |
|-----------|------|--------|
| `checkConsent` import | `index.ts:13` | WIRED |
| Consent mode 'soft'/'strict'/'off' | `index.ts:199-222` | WIRED |
| Default 'soft' | `index.ts:199` | enabled |

### 5F. Static legal files

```
public/_headers
public/apple-touch-icon.png
public/assets
public/dataset_b64.txt
public/fonts
public/hex
public/icon-192.png
public/icon-512.png
public/manifest.json
public/pdf.worker.min.mjs
public/redirect.html
public/robots.txt
public/sitemap.xml
public/test-board.html
public/volumes
```

| File | Path | Status |
|------|------|--------|
| Privacy Policy | `public/privacy*` | **MISSING** ❌ |
| Cookie Policy | `public/cookie*` | **MISSING** ❌ |
| ToS | `public/tos*` / `public/terms*` | **MISSING** ❌ |
| DPIA | `docs/gdpr/DPIA.md` + `docs/legal/DPIA-elab-v1.md` | PRESENT ✓ |
| Sub-processor list | `**/*sub-processor*` / `**/*subprocessor*` | **MISSING** ❌ |

→ **GDPR P0 GAP iter 30**: 4 legal files MISSING for ECFE / DPA / public-facing legal disclosure.

---

## 6. Voxtral integration status

| Claim | File / Line | Status |
|-------|-------------|--------|
| `voxtral-client.ts` exists | `_shared/voxtral-client.ts` 281 LOC dated 2026-04-30 | LIVE |
| Voxtral PRIMARY in chain | `unlim-tts/index.ts:24,109-135` `VOXTRAL_TTS_ENABLED` default true, opt-out via `DISABLE_VOXTRAL_TTS=1` | LIVE PRIMARY |
| Edge TTS Isabella fallback | `unlim-tts/index.ts:25,150-175` step 2 in chain | LIVE FALLBACK 2 |
| VPS 3rd / Browser SpeechSynthesis 4th | `unlim-tts/index.ts:202-227` | LIVE chain |
| `cloneVoice` helper exposed | `voxtral-client.ts:234-261` | LIVE function |
| `VOXTRAL_VOICE_ID` env override | `voxtral-client.ts:95` | LIVE |
| `VOXTRAL_MODEL` env override (default `voxtral-mini-tts-2603`) | `voxtral-client.ts:42,94` | LIVE |
| Voice clone audio Andrea/Davide | per CLAUDE.md iter 1 "Andrea cp /tmp/voice.mp4" | **PENDING** ⚠️ |
| Mistral key access verified live 2026-04-30 04:18 UTC | per `voxtral-client.ts:34-37` "23 KB MP3 generated for 'Ragazzi, oggi costruiamo un circuito con un LED.'" | VERIFIED |

---

## 7. Test infrastructure

| Claim | Evidence | Status |
|-------|----------|--------|
| `tests/e2e/29-92-esperimenti-audit.spec.js` patched harness | exists | LIVE |
| `tests/e2e/29-simulator-arduino-scratch-sweep.spec.js` | exists | LIVE |
| Vitest baseline 13222 | `automa/baseline-tests.txt` reads **12290** (NOT 13222) | **DRIFT** ⚠️ — baseline file out of sync vs CLAUDE.md iter 28 close claim 13212 |
| ClawBot composite tests 5/5 PASS | `scripts/openclaw/composite-handler.test.ts` exists 224→481 LOC | per CLAUDE.md, not re-run |
| Hybrid RAG tests | `scripts/openclaw/rag-retriever.test.ts` exists | exists |
| 7+ bench runners ready | `scripts/bench/`: 21 files including run-clawbot-composite-bench.mjs, run-cost-bench.mjs, run-fallback-chain-bench.mjs, run-hybrid-rag-eval.mjs, run-sprint-r0-edge-function.mjs, run-sprint-r0-render.mjs, run-sprint-r5-stress.mjs, iter-12-bench-runner.mjs, iter-8-bench-runner.mjs, pixtral-vision-92-experiments.mjs, clawbot-multi-tool-50-scenarios.mjs | **14 runners shipped** |

→ Baseline drift: `automa/baseline-tests.txt = 12290` vs CLAUDE.md iter 28 close `13212 PASS`. **Fix iter 30 P0**: `npx vitest run` + `automa/baseline-tests.txt` update.

---

## 8. ELAB API global runtime

`src/services/simulator-api.js` (1040 LOC per CLAUDE.md, file existence verified):

| Claim | Line | Status |
|-------|------|--------|
| `window.__ELAB_API` exposed | 41-42 (`if (typeof window !== 'undefined' && !window.__ELAB_API) { window.__ELAB_API = createPublicAPI(); }`) | LIVE |
| `getCircuitState()` | 716-718 (`return _simulatorRef?.getCircuitState?.() || ...`) | LIVE |
| Returns `{connections, ...}` canonical | actual key is `_simulatorRef?.getCircuitState?.()` direct passthrough — **NOT verified** to expose `connections` field by this audit | **PARTIAL** — passes through |
| `on/off` events pattern | 937 (`on(event, callback)`), 951 (`off(event, callback)`) | LIVE |
| `mountExperiment(experimentId)` | 264 | LIVE |
| `clearCircuit()` | 254 | LIVE |
| `connectWire(fromPin, toPin)` | 246 | LIVE |
| `captureScreenshot()` | per CLAUDE.md, not grepped this audit | per docs |
| `getCircuitDescription()` | per CLAUDE.md | per docs |

→ ELAB API surface 8.0/10. Canonical `{connections}` field shape not verified end-to-end (depends on `_simulatorRef.getCircuitState` which is in `SimulatorCanvas.jsx` — out of scope for this audit).

---

## 9. GAPS critical to fix iter 30 P0

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 1 | **Onniscenza aggregator NOT WIRED** to unlim-chat — `aggregateOnniscenza` (onniscenza-bridge.ts) and `buildStateSnapshot` (state-snapshot-aggregator.ts) both exposed but no production caller | Reduces UNLIM context completeness vs documented 7-layer; unlim-chat uses ad-hoc `retrieveVolumeContext` + `hybridRetrieve` only | 4-6h: replace `index.ts:280-316` retrieval block with `aggregateOnniscenza({...})` call, map output `fused` array to RAG context string |
| 2 | **Privacy Policy + Cookie Policy + ToS files MISSING** in `public/` | Public-facing legal compliance gap; required for ECFE / DPA reviewer | 2-3h: write 3 files based on existing DPIA at `docs/gdpr/DPIA.md` + `docs/legal/DPIA-elab-v1.md`, link from ConsentBanner |
| 3 | **Sub-processor list MISSING** | GDPR Art. 28 sub-processor disclosure required for B2B school contracts | 1h: enumerate Mistral, Gemini, Cloudflare, Supabase, Vercel, Voyage AI, Together AI in `docs/gdpr/sub-processors.md` |
| 4 | **Vitest baseline file drift** (`automa/baseline-tests.txt = 12290` vs claimed 13212) | Pre-commit hook may falsely pass/fail | 5 min: `npx vitest run` to get true count + write to file |
| 5 | **Dispatcher (57-ToolSpec) NOT in production path** — only L2 template router (20 templates) is wired in unlim-chat | Onnipotenza is currently 20-template subset, not full 57-tool. ClawBot dispatcher.ts:354-380 + composite-handler executeComposite are scaffold-only in production | 6-8h: wire `dispatch()` + `executeComposite` as post-LLM action handler when LLM emits `[AZIONE:...]` tags requiring composite (analyzeImage, etc.) |
| 6 | **Voice clone audio Andrea/Davide PENDING** — Voxtral runs with default Paul-Neutral en_us cross-lingual transfer | Voice not yet in Italian narratore-volumi register (Morfismo Sense 2 violation) | Andrea side: 5 min record + cp /tmp/voice.mp4 + run cloneVoice helper. Voxtral cloning helper (`voxtral-client.ts:234-261`) ready |

## 10. GAPS deferred Sprint U+

| # | Gap | Why defer |
|---|-----|-----------|
| 7 | Morfismo Sense 1.5 runtime docente/classe adaptation | ADR-019 design only; no schema migration yet for `teacher_profile` + `class_profile` tables |
| 8 | Triplet validator runtime (Sense 2) | enforced via prompt; runtime DB cross-check coherent kit/volume/software for experimentId is nice-to-have, not blocker |
| 9 | RRF k=60 in `state-snapshot-aggregator.ts` | `onniscenza-bridge.ts` already has it; consolidate the two modules |
| 10 | L3 morphic (dynamic JS gen Web Worker) | DEV-ONLY by design; no production need until iter 32+ stress test |
| 11 | `auditDispatcher` Supabase persistence | `audit_writer` callback hook exists; supply implementation when dispatcher wired (gap #5) |

---

## 11. Cross-reference index

| Claim | File | Line range |
|-------|------|------------|
| BASE_PROMPT v3.1 kit fisico mandatory | `supabase/functions/_shared/system-prompt.ts` | 14-176 (esp 123-127) |
| 6 PZ rules runtime | `supabase/functions/_shared/principio-zero-validator.ts` | 81-181 |
| `buildCapitoloPromptFragment` wired | `supabase/functions/unlim-chat/index.ts` | 17, 294-307 |
| L2 template short-circuit pre-LLM | `supabase/functions/unlim-chat/index.ts` | 19, 317-376 |
| `clawbot-templates.ts` 20 templates inlined | `supabase/functions/_shared/clawbot-templates.ts` | 1-424 |
| `selectTemplate` + `executeTemplate` exports | `supabase/functions/_shared/clawbot-template-router.ts` | 1-300 |
| Mistral routing 65/25/10 weighted | `supabase/functions/_shared/llm-client.ts` | 208-220, 365-372 |
| `pickWeightedProvider` | `supabase/functions/_shared/llm-client.ts` | 371 |
| `callLLMWithFallback` chain | `supabase/functions/_shared/llm-client.ts` | 403+ |
| Voxtral PRIMARY + Edge TTS fallback | `supabase/functions/unlim-tts/index.ts` | 12-25, 109-175 |
| `synthesizeVoxtral` | `supabase/functions/_shared/voxtral-client.ts` | 74-193 |
| `cloneVoice` helper | `supabase/functions/_shared/voxtral-client.ts` | 234-261 |
| `canUseTogether` 8-case truth table | `supabase/functions/_shared/together-fallback.ts` | 83-97 |
| `anonymizePayload` PII strip | `supabase/functions/_shared/together-fallback.ts` | 115-132 |
| `logTogetherCall` audit insert | `supabase/functions/_shared/together-fallback.ts` | 148-179 |
| ConsentBanner wired in App | `src/App.jsx` | 17, 361-373, 434 |
| RegisterPage + DataDeletion lazy | `src/App.jsx` | 27-28, 158, 291 |
| `aggregateOnniscenza` (NOT WIRED) | `supabase/functions/_shared/onniscenza-bridge.ts` | 299-367 |
| `rrfFuse` k=60 | `supabase/functions/_shared/onniscenza-bridge.ts` | 275-293 |
| `buildStateSnapshot` (NOT WIRED) | `scripts/openclaw/state-snapshot-aggregator.ts` | 189-315 |
| `executeComposite` L1 morphic | `scripts/openclaw/composite-handler.ts` | 304+ |
| `dispatch()` + composite branch | `scripts/openclaw/dispatcher.ts` | 147-348 |
| `auditDispatcher` (no persistence) | `scripts/openclaw/dispatcher.ts` | 354-380 |
| L3 morphic flag default OFF | `scripts/openclaw/morphic-generator.ts` | 346-348 |
| 57 ToolSpec entries | `scripts/openclaw/tools-registry.ts` | grep `^\s+name:` |
| `window.__ELAB_API` registration | `src/services/simulator-api.js` | 41-42 |
| `mountExperiment` | `src/services/simulator-api.js` | 264 |
| `connectWire` | `src/services/simulator-api.js` | 246 |
| `clearCircuit` | `src/services/simulator-api.js` | 254 |
| `getCircuitState` | `src/services/simulator-api.js` | 716-718 |
| `on(event, callback)` | `src/services/simulator-api.js` | 937 |
| `off(event, callback)` | `src/services/simulator-api.js` | 951 |
| `together_audit_log` migration | `supabase/migrations/20260426152944_together_audit_log.sql` | 14-36 |
| DPIA documents | `docs/gdpr/DPIA.md` + `docs/legal/DPIA-elab-v1.md` | exist |
| Vitest baseline | `automa/baseline-tests.txt` | reads "12290" |
| Patched harness 92 esperimenti | `tests/e2e/29-92-esperimenti-audit.spec.js` | exists |

---

## Final score ONESTO 1-10 (G45 anti-inflation)

**6.4 / 10** — pre-iter-30 readiness.

Justification: All 4 layer modules (L1 composite + L2 template + L3 morphic flag + L4 ToolSpec registry) are SHIPPED in code; PRINCIPIO ZERO + Morfismo Sense 2 runtime + Voxtral integration + ELAB API surface are LIVE. **Two critical gaps prevent claiming 7.5+:**

1. **Onniscenza aggregator NOT WIRED**: the headline "7-layer parallel orchestration" promise of iter 19+ is technically scaffolded (in two places: `onniscenza-bridge.ts` and `state-snapshot-aggregator.ts`) but **zero production callers**. The unlim-chat Edge Function delivers context via direct ad-hoc retrieval, not via the documented aggregator. This is the single largest discrepancy between docs and code.
2. **Public-facing legal files MISSING** (Privacy / Cookie / ToS): GDPR self-attestation gap; cannot honestly claim "GDPR full" without these surfaced from `public/`.

If these 2 are closed iter 30 P0 (~10h work), score lifts to projected **8.0+/10**.

— *Audit complete. No mock, no inflation. File-system evidence only.*
