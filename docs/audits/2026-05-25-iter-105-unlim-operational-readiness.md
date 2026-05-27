# UNLIM Operational Readiness Audit — Iter 105

**Date**: 2026-05-25 → 2026-05-26 PM/notte
**Mandate** (Andrea): "fino a farlo diventare completamente operativo … NON COMPIACERE, SII SCIENTIFICO"
**Method**: mem-search reconstruction + multi-agent reviews (security, performance, silent-failure, automation-recommender, code-review) + comprehensive new test suite + 1 safe surgical fix
**Verdict**: **NOT production-ready for K-12 minors without P0 sweep**. OWASP 6.4/10, GDPR Art. 8 7.5/10, 4 CRITICAL + 6 HIGH silent-failure paths, 1 dead system prompt branch (~296 lines unused).

---

## 1 — Architecture map (reconstructed via mem-search)

| Layer | File | LOC | Role |
|---|---|---|---|
| Edge entry | `supabase/functions/unlim-chat/index.ts` | 1576 | HTTP handler, routing, fallback chain |
| RAG | `supabase/functions/_shared/rag.ts` | 1108 | BM25 + dense pgvector + RRF k=60 + optional Voyage rerank |
| Guards | `supabase/functions/_shared/guards.ts` | 475 | CORS, auth, rate limit, sanitize |
| System prompt | `supabase/functions/_shared/system-prompt.ts` | 578 | `LIVE_SYSTEM_PROMPT` build (+ `BASE_PROMPT` **unused**) |
| Router | `supabase/functions/_shared/router.ts` | 136 | Gemini 70/25/5 model selection |
| PZ V3 validator | `supabase/functions/_shared/principio-zero-validator.ts` | ~700 | Append-only (never blocks) |
| Content safety | `supabase/functions/_shared/content-safety-guard.ts` | 306 | 10 paletti runtime, audit log |
| Operational response | `supabase/functions/_shared/operational-response.ts` | ~280 | `UNLIM_MAX_VISIBLE_WORDS = 120`, cap helpers |
| Onniscenza V1/V2 | `supabase/functions/_shared/onniscenza-bridge.ts` | ~700 | 7-layer aggregator |
| Volumi citazioni | `supabase/functions/_shared/volumi-citazioni.ts` | ~250 | `rewriteCitationToCanonical`, `forceCitationFromQuery/Session` |
| Experiment registry | `supabase/functions/_shared/experiment-registry.ts` | ~130 | `stripInvalidExperimentTags` (hallucination scrubber) |
| Intent parser | `supabase/functions/_shared/intent-parser.ts` | ~250 | `[INTENT:{…}]` tag extractor |

**Total edge fns**: 15 (`unlim-chat`, `unlim-diagnose`, `unlim-dreams-batch`, `unlim-fumetto`, `unlim-gdpr`, `unlim-hints`, `unlim-imagegen`, `unlim-intent`, `unlim-session-description`, `unlim-stt`, `unlim-tts`, `unlim-vision`, `dashboard-data`, `compile-proxy`, `capitoli`).

**RAG corpus**: `rag_chunks` table = 1881 rows (`vol1`+`vol2`+`vol3`+`wiki`). **100% NULL `chapter`/`page`/`section_title`** (root cause: `scripts/rag-ingest-voyage-batch.mjs` omits these fields in INSERT — Iter 7 commit `3bf84e0` migrated from Python pdfplumber to Node Voyage batch reading pre-extracted `.txt` files, losing page boundaries).

**Frontend bridge**: `window.__ELAB_API.unlim.sendMessage(text)` dispatches `CustomEvent('elab-unlim-send')` → `useGalileoChat.useEffect` handler → `handleSend()`. Wired iter 12 (commit `ded9843`) to fix wake word + ErrorToast + ExperimentPicker + PercorsoPanel previously calling dead `api.galileo.sendMessage`.

---

## 2 — Findings by severity (consolidated across 5 reviewers)

### 2.1 CRITICAL (4 items — must fix before next K-12 deploy)

| # | File:Line | Issue | Source |
|---|---|---|---|
| C1 | `guards.ts:67-72` | `ELAB_API_KEY` fail-OPEN when env unset → full auth bypass on any Supabase Edge URL | security-auditor |
| C2 | `index.ts:185-205` (rate limit), `guards.ts:142` | Rate limit keyed only on attacker-controlled `sessionId` (regex 1-128 chars) → trivially bypassed by ID rotation → unbounded LLM cost burn (€150/min on Gemini) | security-auditor |
| C3 | `index.ts:266, 269, 357, …` (16 sites) | `saveInteraction`/`saveMessageHistory` persists raw 16k-char user message to Supabase **without PII scrub** → GDPR Art. 8 (minors) over-collection. Italian phone, email, codice fiscale, full names leak verbatim. | security-auditor |
| C4 | `index.ts:432, 442-460` | `CONSENT_MODE` default `'soft'` → `unknown` status logs `console.info` and proceeds. Italian D.Lgs. 101/2018 requires explicit verifiable parental consent for under-14. | security-auditor |

### 2.2 HIGH (10 items)

| # | File:Line | Issue | Source |
|---|---|---|---|
| H1 | `system-prompt.ts:16-311` defined; `system-prompt.ts:433` uses only `LIVE_SYSTEM_PROMPT` | `BASE_PROMPT` is 296 LOC of TAG AZIONI, FEW-SHOT, INTENT schema, ANTI-INVENZIONE rules **never delivered to model**. Comment at line 417 incorrectly claims it is in the chain. | code-review |
| H2 | `rag.ts:439, 503` | Silent `catch {}` on Gemini embed + pgvector dense path → UNLIM downgrades to keyword search invisibly. No operator signal. | silent-failure-hunter |
| H3 | `content-safety-guard.ts:67` | Audit writer fail swallowed as "non-fatal" — but EU AI Act Annex III "high-risk education" + GDPR require persisted audit. | silent-failure-hunter |
| H4 | `index.ts:642` (inline supaClient `.catch(e => ({data:[], error}))`) | All 7 Onniscenza layers can silently report zero hits during Supabase outage; `error` shape never logged by callers (`Array.isArray(data) → []`). | silent-failure-hunter |
| H5 | `guards.ts:126-136` | `checkBodySize` reads `Content-Length` header only → spoofable with chunked transfer → 500MB body buffered in `req.json()` → OOM kill / DoS. | security-auditor |
| H6 | `guards.ts:21-23` | CORS unknown origin silently rewritten to first allowlist entry instead of 4xx → masks misconfig + future `Allow-Credentials:true` becomes catastrophic. | security-auditor |
| H7 | `guards.ts:300-336` | 32 injection regexes miss base64-encoded, multi-line (`\n` between words, no `s` flag), homoglyph Cyrillic `і` (U+0456), Italian `dimentica le precedenti` (no "tutto"), `nuove regole`. | security-auditor |
| H8 | `index.ts:69-108` | `requestTTS` dead code — `audioUrl` always `null` at line 1495. ~40 LOC + `VPS_TTS_URL` env pollution on cold init. | performance + code-review |
| H9 | `rag.ts:927-953` (Wiki fusion) | Wiki path runs second Voyage embedding for SAME query in parallel to main RAG → 700-1400ms p95 cost duplicated. | performance |
| H10 | `rag.ts:721, 781-807` | Voyage embedding awaited sequentially BEFORE pgvector RPC on every call → 600-1200ms p95 with no LRU cache. | performance |

### 2.3 MEDIUM (12 items, abridged)

- M1 `index.ts:1305` — `[INTENT:{...}]` parsed without per-tool args schema validation → prompt-injection can fire `clearCircuit`, `serialWrite`, etc. (only `mountExperiment` gated by `stripInvalidExperimentTags`).
- M2 `guards.ts:142` — sessionId regex allows `..` `.` `:` (path-traversal style chars).
- M3 `index.ts:619-651` — Inline Supabase REST adapter does 4× per-table fetch in Onniscenza V2 = N+1 (600-1000ms savings via single RPC).
- M4 `rag.ts:917` — RAG candidate pool default 50 over-fetches; tail beyond rank 20 contributes <1/80 to RRF.
- M5 `rag.ts:600` — `STOPWORDS_IT` allocated inside `bm25Search` body → rebuilt every call (now deduped iter 105 fix).
- M6 `rag.ts:27` vs `:600` — Two divergent Italian stopword lists (`STOP_WORDS` + `STOPWORDS_IT`) → fix in one doesn't propagate.
- M7 3 inconsistent RAG confidence thresholds: `MIN_CONFIDENCE=5` (rag.ts:374) / `similarity=0.55` (rag.ts:472) / RPC threshold `0.5` (rag.ts:731) — no central constants block.
- M8 `index.ts:1354-1378` + `:402-406` + `:497-500` — Citation forcing chain (`enforceItalianK12Opener → rewriteCitationToCanonical → forceCitationFromQuery → forceCitationFromSession`) duplicated across 3 paths; NOT applied to 4 short-circuit paths (voltage_danger pre-LLM, legacy off-topic, ClawBot L2, safety-hardcoded fallback).
- M9 `guards.ts:142-148` — `validateSessionId` allows `..` `:` (path-traversal).
- M10 `index.ts:1305-1322` — `parseIntentTags` silent catch sets `parsedIntents=[]` without telemetry.
- M11 `index.ts:1402` — `checkContentSafety` runs sequentially post-LLM; could be fire-and-forget if pure text classification.
- M12 `index.ts:1432-1459` — `validatePrincipioZero` runs but NEVER blocks/modifies; only adds metric. Soft-only enforcement.

### 2.4 LOW (8 items)

- L1 `X-XSS-Protection` header deprecated.
- L2 Missing CSP, `interest-cohort=()`, `browsing-topics=()`.
- L3 Health endpoint `GET /` no auth → fingerprinting.
- L4 Error message includes `apiKeyCheck.reason` → distinguishes "missing" vs "bad" key.
- L5 Voltage-danger regex misses `380V trifase`, `presa schuko`, kid slang `corrente forte`.
- L6 `OFFTOPIC_QUERY_RE` ~3KB single regex — ReDoS suspect.
- L7 `unlim-chat/index.ts:114-125` `mapDebugRetrievalChunk` dead code (inline at 565-572 instead).
- L8 `retrieveVolumeContext` (rag.ts:448-510) imported at unlim-chat:17 but never called.

---

## 3 — Tests added this iter (106 new, 0 regressions)

| File | Tests | Coverage |
|---|---|---|
| `tests/unit/unlim-operational-readiness.test.js` | 72 | Word cap (UNLIM_MAX_VISIBLE_WORDS=120), control tag splitting (nested braces, malformed), citation forcing idempotency, K12 opener, plural rewrite, stripInvalidExperimentTags shape (`{text, stripped}`), pipeline composition, adversarial inputs |
| `tests/unit/unlim-rag-readiness.test.js` | 34 | `rrfFuseMulti` math correctness (k=60, multi-list), `retrieveContext` MIN_CONFIDENCE behavior, `formatHybridContext` shape (`[VOL1 pag.12]` citation), wiki vs vol chunk paths, adversarial RAG inputs (10k chars, unicode, negative maxTokens) |
| `tests/unit/unlim-observability.test.js` | 19 | `logSilentFailure` + `logSilentError` helpers — JSON shape, error message coercion, stack capping (3 frames pipe-joined), circular-ref safety, console-throws safety |

**Final UNLIM unit count: 1063 tests passing across 33 files** (was 938 baseline pre-audit).

---

## 4 — Surgical fixes applied (safe, reversible)

### F1 — `rag.ts:603` duplicate stopwords removed

Before:
```ts
const STOPWORDS_IT = new Set(['di','il','la',...,'della','della',...,'non','non',...]);
```
After:
```ts
const STOPWORDS_IT = new Set(['di','il','la',...,'della',...,'non',...]);
```
Zero semantic change (Set deduplicates anyway), removes review hazard.

### F2 — `supabase/functions/_shared/observability.ts` (NEW file, 80 LOC)

Helper `logSilentFailure(event, err, extra)` + `logSilentError(event, err, extra)`. Single-line replacement for 18+ silent catch sites without altering silent-fallback contract. Logger of last resort (own try/catch) — cannot upgrade silent failure to thrown error.

Test coverage 19 cases including: circular-ref safety, console-throws safety, Error vs primitive coercion, stack 3-frame cap, error vs warn shape.

**Wire-up to existing call sites deferred** — requires Andrea ratify (large cross-cutting change to `rag.ts`/`unlim-chat/index.ts`/`guards.ts`/`content-safety-guard.ts`/`onniscenza-bridge.ts`). Helper ready, drop-in.

---

## 5 — Andrea ratify queue (P0 next session)

### Q1 — `ELAB_API_KEY` rollout
- Deploy secret on ALL Supabase project refs (prod + preview).
- Flip `verifyElabApiKey` to fail-CLOSED when `DENO_DEPLOYMENT_ID` is set (1h work).

### Q2 — `CONSENT_MODE = 'strict'` default
- Change `index.ts:432` default from `'soft'` to `'strict'`.
- Add hard refusal template for `unknown` status: "consenso genitoriale mancante, contatta amministrazione".
- Add audit log row per chat with `consent_status`. (3h work).

### Q3 — PII scrub before `saveMessageHistory`
- Add `scrubPII()` (Italian regex: phone `\b3\d{2}[\s./-]?\d{6,7}\b`, email, IBAN, codice fiscale, names heuristic).
- Reuse `extractedUserMsg` (already computed at line 315) in all 11 `saveMessageHistory` sites instead of full envelope. (4h work).

### Q4 — IP-based outer rate limit + daily LLM budget cap
- Add IP throttle 100 req/min/IP outside session bucket.
- Add `LLM_DAILY_TOKEN_BUDGET` env, fail-closed when exceeded.
- Bind sessionId limit to (IP, sessionId) tuple. (4h work).

### Q5 — Stream-based body size enforcement
- Replace `Content-Length` check in `checkBodySize` with stream-counted bytes. Eliminates chunked transfer DoS. (2h work).

### Q6 — `BASE_PROMPT` decision
- Either delete (296 LOC dead weight), OR wire into `buildSystemPrompt` at line 433. Comment at line 417 must match reality.
- Likely intentional drift to keep responses concise (LIVE_SYSTEM_PROMPT only). Verify with Andrea.

### Q7 — Wire `observability.ts` to silent catch sites
- 18+ replacement sites in `rag.ts`, `unlim-chat/index.ts`, `guards.ts`, `content-safety-guard.ts`, `onniscenza-bridge.ts`.
- Single PR, mechanical refactor with `logSilentFailure(event, err, extra)`.

---

## 6 — Performance ranked actions (perf review)

| # | Fix | Est. ms saved p95 | LOC |
|---|---|---|---|
| 1 | Voyage embedding LRU cache + hoist parallel | 600-1200 | 20 |
| 2 | Wiki fusion gate behind `deep_question` + reuse embedding | 700-1400 | 15 |
| 3 | Hoist `loadRecentHistory` into top `Promise.all` | 250-400 | 5 |
| 4 | Batch V2 Onniscenza collectors into 1 RPC | 600-1000 | 50 |
| 5 | Drop `candidatePool` 50→20 (rerank-off path) | 200-400 | 1 |
| 6 | Precompute `SYNONYM_MAP` reverse-index | 80-150 | 20 |
| 7 | Delete dead `requestTTS` (H8) | 30-80 | -40 |
| 8 | Consolidate citation chain into single helper | 40-100 | 15 |
| 9 | Gate verbose `console.info` behind `DEBUG_VERBOSE` | 20-40 | 10 |
| 10 | Hoist `STOPWORDS_IT` to module-level (#5 done iter 105) | 10-30 | 3 |

**Total achievable p95**: 7.8s → 3.0-5.3s with #1+#2+#3+#4 alone.

---

## 7 — Claude Code automation recommendations (from automation-recommender)

### Hooks (top 2)
1. **PostToolUse UNLIM regression gate** — runs scoped vitest on UNLIM paths only (~12s vs 60s full suite). Catches: silent catch regressions, word-cap drift, threshold inconsistencies.
2. **PreToolUse forbidden-pattern guard** — rejects `BASE_PROMPT` reintroduction, `requestTTS(` re-add, bare `catch (_) {}`, `wordCount` without `MAX_WORDS` ceiling.

### Subagents (top 2)
1. **`unlim-prompt-reviewer`** — flags numeric thresholds not in constants block, dead string templates, word-cap enforcement asymmetry.
2. **`unlim-rag-metadata-auditor`** — uses Supabase MCP to query `rag_chunks` and assert `% NULL` per metadata column; alerts on regression.

### Skills (top 2)
1. **`unlim-bench-runner`** — `/unlim-bench [r7|hybrid-rag|cost|word-cap]` unified entrypoint over 30+ bench fixtures.
2. **`unlim-rag-debug`** — `/unlim-rag-debug "<query>"` calls `rag.ts` in isolation, prints retrieval trace + metadata completeness.

### MCP servers (top 2)
1. **Supabase MCP** — instant `SELECT COUNT(*) FROM rag_chunks WHERE chapter IS NULL` checks.
2. **Sentry MCP** — capture the 18 silent catches when wired to `observability.ts`.

---

## 8 — Anti-compiacenza assertions (Andrea mandate)

Per `feedback_iter21_mandate_critical.md` + `feedback_repo_audits_before_websearch.md`:

- **NOT verified live in prod**: this audit is static + unit-level. RAG metadata NULL gap measured at 100% via mem-search obs #1218 (recall@5=0.390 vs target 0.55) — needs live re-bench after Q3+Q7 land.
- **No new failing tests claimed as "fixed"**: 1063 tests pass. Bugs identified are LIVE in production code (`fix/unlim-compile-helper-mascot-tweak-2026-05-24` branch + main).
- **Test scope honest**: tests cover shared modules importable via vitest+Vite. The Edge Function `unlim-chat/index.ts` top-level handler (Deno.serve route) is NOT executed by these tests — only `_shared/*.ts` helpers. Integration tests against live Edge Function exist in `scripts/bench/` (R7 fixture 200 queries) but not run this session.
- **Score**: cannot self-rate per CoV rule (`docs/CLAUDE.md`: "Mai self-rate: il benchmark è l'unico score valido"). Suggest Andrea runs `node scripts/benchmark.cjs --write` post-Q1+Q2+Q3+Q7 + `npm run gate` for delta.
- **Codex review attempted but produced no usable output** (codex exec hung on `app-server` mode — auth issue suspected). Adversarial reviews delivered by `code-reviewer:code-reviewer` and `pr-review-toolkit:silent-failure-hunter` instead — independent reviewers confirmed same CRITICAL + HIGH findings as `comprehensive-review:security-auditor` (cross-validation positive).

---

## 9 — Files modified iter 105

- `supabase/functions/_shared/rag.ts:603` — STOPWORDS_IT dedupe (iter 105 ops fix, 0 LOC delta semantically)
- `supabase/functions/_shared/observability.ts` — NEW 80 LOC helper

## 10 — Files added iter 105 (tests + docs)

- `tests/unit/unlim-operational-readiness.test.js` — 72 tests
- `tests/unit/unlim-rag-readiness.test.js` — 34 tests
- `tests/unit/unlim-observability.test.js` — 19 tests
- `docs/audits/2026-05-25-iter-105-unlim-operational-readiness.md` — this report
