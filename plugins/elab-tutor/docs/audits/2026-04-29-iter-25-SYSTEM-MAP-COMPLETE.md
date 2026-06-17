# ELAB Tutor — Iter 25 System Map COMPLETE (caveman onesto)

**Date**: 2026-04-29
**Author**: readonly system audit agent iter 25
**Mandate**: Andrea iter 25 — "MAPPA TUTTO IL SISTEMA"
**Tone**: caveman terse, file:line cited, NO inflation per G45 mandate
**Score recap**: iter 21 entrance honest = 5.8-7.0/10 (vs iter 18-20 claim 8.5-8.8)

---

## Sezione 1 — Codebase inventory (A)

| Directory | File count | LOC |
|---|---|---|
| `src/components/**/*.{jsx,tsx,js,ts}` | 188 | 77 524 |
| `src/services/**/*.{js,ts}` | 37 | 11 924 |
| `src/data/**/*.{json,js}` | 154 | 88 256 |
| `supabase/functions/**/*.ts` (Edge + _shared) | 26 | 6 808 |
| `tests/**/*.{test,spec}` (vitest) | 262 | 53 904 |
| `e2e/*.spec.js` (Playwright) | 23 | 4 999 |
| `scripts/**/*.{sh,mjs}` | 103 | 19 077 |
| `docs/**/*.md` | 944 | 208 387 |
| `automa/**/*.{md,json,sh}` | 731 | 120 659 |
| **TOTAL src+tests+edge** | **730** | **243 415** |
| **TOTAL repo (no node_modules)** | **2 468** | **591 538** |

Notes:
- Test files repo-wide (incl colocated): **1 777**.
- `src/data/lesson-paths/` carries **95 esperimenti JSON** (`v{N}-cap{M}-esp{K}.json`).
- 6 Supabase migrations applied (`supabase/migrations/`).

---

## Sezione 2 — Edge Functions (B) — 8 fn LIVE + 2 infra

Endpoints `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/`:

| Fn | Method | Input | Provider | Status | LOC |
|---|---|---|---|---|---|
| `unlim-chat` | POST | `ChatRequest{message,images?,sessionId,experimentId,...}` | Gemini 70/25/5 (router.ts:30-39) → Together fallback → Brain VPS | LIVE (deploy verified iter 13 + smoke 200 OK 6.4s, audit 2026-04-28-sprint-s-iter-13-CLOSE) | 454 (`unlim-chat/index.ts:1-454`) |
| `unlim-diagnose` | POST | `DiagnoseRequest{circuitState,experimentId,sessionId,image?}` | Gemini Flash + Vision (Pixtral indirect via llm-client) | LIVE (`unlim-diagnose/index.ts:1-162`) | 162 |
| `unlim-hints` | POST | `HintsRequest{experimentId,currentStep,difficulty,sessionId}` | Gemini Flash-Lite | LIVE | 112 |
| `unlim-tts` | POST | `TTSRequest{text,sessionId,voice,language,speed,provider?}` | Microsoft edge-tts Isabella (default ON since iter 6) + Voxtral VPS fallback | LIVE | 189 (`unlim-tts/index.ts:1-189`) |
| `unlim-gdpr` | POST | `{action:'delete'|'export'|'consent', studentId/sessionId, ...}` | Supabase RLS | LIVE | 262 |
| `unlim-imagegen` | POST | `{prompt,sessionId,width?,height?}` | Cloudflare Workers AI `@cf/black-forest-labs/flux-1-schnell` | iter 25 NEW (Sprint T) — wired NOT yet smoke-tested PROD | 87 (`unlim-imagegen/index.ts:1-87`) |
| `unlim-stt` | POST multipart OR JSON | `{audio_base64?,sessionId,language?}` | CF Whisper Large v3 Turbo `@cf/openai/whisper-large-v3-turbo` | iter 25 NEW (Sprint T) — wired NOT yet smoke-tested PROD | 103 |
| `unlim-vision` | POST | `{prompt, images:string[], sessionId}` | Mistral Pixtral 12B (`pixtral-12b-2409`) FR EU | iter 25 NEW (Sprint T) — wired NOT yet smoke-tested PROD | 102 |
| `compile-proxy` | POST | `{code:string}` → n8n `/webhook/compile` | n8n on Hostinger VPS | LIVE iter 19 P0 deploy verified iter 21 (Vercel env set 57m before) | 153 |
| `dashboard-data` | GET | `?teacher_id&range` | Supabase queries | SCAFFOLD only — returns stub shape, real queries Day 05 wiring (`dashboard-data/index.ts:21`) | 133 |

**Totale 10 endpoint, 1 757 LOC**. `_shared/` = 16 modules, **5 051 LOC** (rag.ts dominante 1 108 LOC + llm-client.ts 568 + guards.ts 470).

---

## Sezione 3 — Provider integrations matrix (C) — 8 providers

| Provider | Module | Model(s) | Use | Status |
|---|---|---|---|---|
| **Gemini** (Google) | `_shared/gemini.ts` (290 LOC) | `gemini-2.5-flash-lite` 70%, `gemini-2.5-flash` 25%, `gemini-2.5-pro` 5% | chat + vision + embedding fallback | LIVE — primary LLM unlim-chat / diagnose / hints |
| **Together AI** | `_shared/together-fallback.ts` (200 LOC) + `llm-client.ts` | Llama 3.3 70B (RAG contextualization) | fallback chat + RAG ingest contextualization | LIVE iter 7 (~1 012 chunks contextualized prod, audit 2026-04-27 §1.1) |
| **Mistral** | `_shared/mistral-client.ts` (196 LOC) | `mistral-small-latest` (chat), `mistral-large-latest` (premium), `pixtral-12b-2409` (vision), `mistral-embed` (1 024-dim) | unlim-vision + premium router | wired iter 25 — vision endpoint deployed NOT PROD smoke yet |
| **Cloudflare Workers AI** | `_shared/cloudflare-client.ts` (163 LOC) | `@cf/black-forest-labs/flux-1-schnell`, `@cf/openai/whisper-large-v3-turbo`, `@cf/baai/bge-m3` | imagegen + STT + free embed | wired iter 24-25 — endpoints deployed NOT PROD smoke yet |
| **Voyage AI** | `_shared/rag.ts:voyageRerank()` + scripts/rag-contextual-ingest-voyage.mjs | `voyage-3` (1 024-dim) | RAG embed query + iter 7 ingest | LIVE iter 7 ingest pipeline (~1 012 chunks 2026-04-27); query path active when `VOYAGE_API_KEY` env present |
| **HuggingFace Inference** | n/a in src — only iter 22 BGE-M3 free trial | BGE-M3 sentence-transformers | optional embed fallback | DEAD code-path (Python script `scripts/rag-ingest-local.py` Python 3.9 incompat per audit iter 7 §1.1) |
| **Anthropic Claude** | NONE in supabase/functions or src | claude-3.x | NOT wired | env key claim CLAUDEMD memory but `grep ANTHROPIC src/ supabase/` = 0 hits — DEAD in PROD code |
| **RunPod** | scripts only: `scripts/runpod-r0-bench.mjs`, `runpod-status.sh`, `runpod-bootstrap-v2-vllm.sh`, `runpod-tts-server-v2.py` | RTX 6000 Ada 48GB / A6000 sandbox | dev bench LLM + TTS prototyping | DEV-only (audit 2026-04-28-iter-21-TECH-DEBT §0: pod `elab-iter18-a6000` ALIVE 6h ZERO util ~$2.40 wasted, balance $11.15) |
| **Brain VPS** (legacy Galileo) | `_shared/llm-client.ts:callBrainFallback` | Qwen3.5-2B Q5_K_M `galileo-brain-v13` | last-resort chat fallback | LIVE `http://72.60.129.50:11434` (CLAUDEMD Quick Reference) |
| **Voxtral VPS TTS** | `_shared/edge-tts-client.ts` + `unlim-tts/index.ts:13` | Voxtral 4B custom | TTS fallback | LIVE `http://72.60.129.50:8880/tts` — overshadowed by Microsoft edge-tts Isabella default since iter 6 |

---

## Sezione 4 — Onniscenza 7-layer status (D)

Source of truth: `supabase/functions/_shared/onniscenza-bridge.ts:5-22` doc header. Iter 24 PARTIAL LIVE.

| # | Layer | Source | Status | Note |
|---|---|---|---|---|
| L1 | RAG hybrid retrieval Supabase pgvector | `_shared/rag.ts:retrieveHybrid` + `rag_chunks` | LIVE | ~1 012 chunks ingested mid-run iter 7 (audit §1.1 2026-04-27); recall@5 = 0.390 iter 12-13 UNCHANGED, P0 backfill chapter/page/section_title NULL identified iter 13 (`§3.3` audit 2026-04-28-sprint-s-iter-13) |
| L2 | Wiki concepts (Tea Glossario 180 termini) | `rag_chunks` filter `source='wiki'` + `wiki_concepts` table seeded iter 22 | partial | 180/180 termini parsed (audit 2026-04-28-iter-22 §1) ; **migration NOT applied + seed NOT executed** + embedding **DEFERRED** (status `MIGRATION/SEED NOT APPLIED · EMBEDDING DEFERRED`) |
| L3 | Glossario Tea (180 termini per età) | merged into L1 RAG via `wikiFusionActive` flag | partial | duplicato di L2 — onniscenza-bridge.ts:11 esplicita "MERGED into L1 RAG" — non layer separato runtime |
| L4 | Class memory | Supabase `class_memory` / `unlim_sessions` | LIVE iter 24 via Supabase client injection | row count NOT verified iter 25 entrance |
| L5 | Lesson active context | derived from `input.experiment_id` + `_shared/capitoli-loader.ts` (223 LOC) + `supabase/functions/capitoli.json` | LIVE | lightweight derivation — capitoli-loader builds prompt fragment via experimentId lookup |
| L6 | Chat history rolling 10-turn | derived from `input.history` (caller injects) | LIVE iter 24 | impl via OnniscenzaInput.history field — iter 24 active |
| L7 | Analogia graph (concept-graph + curriculumData) | `concept-graph.json` + curriculumData | NOT impl | onniscenza-bridge.ts:14 "defer iter 25 if missing" — iter 25 entrance: status `ITER 25+ ACTIVE` claim NOT VERIFIED runtime |

**Onniscenza-bridge code-only iter 24** = endpoint smoke pending (tech-debt-ledger 2026-04-28 §1).

---

## Sezione 5 — UI surface map + Lavagna modalità (E)

### Routes (App.jsx hash-based + pathname hybrid)

`src/App.jsx:60` `VALID_HASHES = ['tutor','admin','teacher','vetrina','vetrina2','login','register','dashboard','dashboard-v2','showcase','prova','lavagna']`.

| URL | Component | Status |
|---|---|---|
| `/` (default) | `ShowcasePage` (App.jsx:113 fallback `'showcase'`) | LIVE |
| `/#tutor` | `ElabTutorV4` (lazy) | LIVE — legacy entry |
| `/#lavagna` | `LavagnaShell` (App.jsx:33 lazy import) | LIVE iter 24 — Andrea iter 18 PM mandate switch tutor→lavagna pending decision (CLAUDEMD "S8 PENDING") |
| `/#admin` | `AdminPage` password `[REDACTED-MOVED-TO-ENV]` (CLAUDEMD) | LIVE |
| `/#dashboard` | `StudentDashboard` (RequireAuth gated) | LIVE |
| `/#dashboard-v2` | `DashboardShell` (App.jsx:301-304, gated `?live=1`) | LIVE iter 24 — backend SCAFFOLD only `dashboard-data` Edge Fn |
| `/#teacher` | `TeacherDashboard` (isDocente or isAdmin) | LIVE |
| `/#login`, `/#register` | LoginPage / RegisterPage | LIVE |
| `/#vetrina`, `/#vetrina2` | `ShowcasePage` / `VetrinaV2` | LIVE |
| `/#showcase` | `ShowcasePage` | LIVE |
| `/privacy` (pathname) | `PrivacyPolicy` (App.jsx:103) | LIVE |
| `/data-deletion` (pathname) | `DataDeletion` | LIVE |
| `/scuole/*` (pathname) | `LandingPNRR` (App.jsx:104) | LIVE iter 19 (Sprint G38) |
| `/welcome` | n/a — mounted via WelcomePage component (App.jsx:32) — license gate hardcoded `ELAB2026` (audit iter 21 §1.3) | LIVE — P0 BUG bypass triviale |
| `/manuali/*` PDF | NOT yet exist | NOT impl |
| `/glossario` Tea Next.js | NOT integrated portale homepage | deferred |

### Lavagna modalità (mandate ADR-025)

| # | Modalità | UI exposed | Status |
|---|---|---|---|
| 1 | **Percorso** (lettura libro) | LavagnaShell exposes via toolbar | LIVE — guida lettura |
| 2 | **Passo-Passo** (build seq) | Steps panel + ProgressBar | LIVE |
| 3 | **Già Montato** (pre-assembled) | UI claim 3-mode (audit iter 21 P1.1) | NOT impl runtime |
| 4 | **Libero** (sandbox) | LavagnaShell `Lavagna libera` toggle iter 14 | partial (no auto-Percorso, mandate iter 18 PM violato per audit iter 21 §1) |
| — | **Guida-da-errore** (mandate 4 ADR-025) | NOT exposed | NOT impl |

UI mostra **3 modalità** vs mandate **4** → ADR-025 PROPOSED implementation pending iter 22+ (still pending iter 25 entrance).

---

## Sezione 6 — Tests inventory + coverage (F)

| Layer | Files | Tests asserted (`it/test`) | Status |
|---|---|---|---|
| Vitest unit (`tests/`) | 262 | 4 967 | high water mark CI 12 056 (`automa/state/ralph-metrics.json:14`); local Mac 12 718 PASS iter 14 (audit `2026-04-28-iter-14-lim-legibility-impl-audit.md:7-9`); CLAUDEMD mention 12 794 iter 24 baseline |
| Test files repo-wide (incl integration/regression/e2e dir) | 1 777 | n/a | aggregate count |
| Playwright E2E (`e2e/*.spec.js`) | 23 | 314 | LIVE — but pilot iter 23 5/5 = **0/5 PASS** on prod `elabtutor.school` (api_ready=false svg_count=0) per `iter-23-harness-real-pilot/results.jsonl` |
| Harness REAL spec | `automa/state/iter-23-harness-real-pilot/results.jsonl` | 87 esperimenti planned (`_meta.total:87`), 5/87 sample run | FAILING — root cause `window.__ELAB_API` non esposto post-navigate prod (audit `2026-04-29-iter-24-2-broken-experiments-investigation.md` TL;DR) + Vercel SSO 401 preview bypass URL |
| Vol/pag regression iter 23 | 30 prompt prod unlim-chat | 30/30 HTTP success | composite **72.78%**, **vol_pag_citation 14/30 = 46.7%** target ≥90% **FAIL** (audit `2026-04-29-iter-23-HARNESS-REAL-pilot-results.md §1`) |

**Coverage gaps confermati iter 25 entrance**:
1. 91/92 esperimenti UNTESTED on real prod (only 5 pilot — all FAIL via api_ready bug)
2. Harness 2.0 iter 19 = FALSE POSITIVE (94/94 "pass" sono static JSON checks, NON real browser interaction — audit iter 21 TECH-DEBT §0)
3. 123 test gap CI vs Mac local persistente Node 22 + lightningcss + pool=forks IPC hypothesis (`.test-count-baseline.json:14-22`)
4. Edge Functions iter 25 NEW (vision + stt + imagegen) ZERO tests + ZERO smoke prod

---

## Sezione 7 — Mac Mini autonomous state (G)

SSH `progettibelli@100.124.198.59` — **NON raggiungibile da MacBook iter 25** (Permission denied publickey — chiavi non sincronizzate questa workstation; OK da MacBook Andrea originale per audit iter 21).

Stato dichiarato (audit iter 21 entrance §1 + CLAUDEMD):
- launchctl plist autonomous loop H24 PID **23944** (audit C1 §0.4)
- Repo HEAD synced `09d47a5` (iter 21) → drift atteso post-iter22-25 commit (HEAD attuale `38a74cd` per `automa/state/cycle-snapshot.json:3`)
- Last health snapshot: `automa/state/cycle-snapshot.json:1-4` timestamp **2026-04-29T12:23:53.710253**, score_before 0.9577
- Loop iter 21 entrance flag: "**SOLO HEARTBEAT log ogni 5min, NESSUN trigger work eseguito 6h+**" (tech-debt-ledger §0)
- Ralph loop cancelled iter 7 (cron `1299498e` deleted, audit 2026-04-27 §1.4) — autonomous cron OFF
- Task queue: `automa/state/ralph-next-task.md` + `ralph-mission.md` + `ralph-builder-log.md` exist; metrics last_builder_run iter `2026-04-17T11:32:00Z` outcome `NO_COMMIT`

Verdict iter 25: Mac Mini = **idle infrastructure** (foundation OK PR #43 created iter C1 audit, batch loop NOT firing real work).

---

## Sezione 8 — RunPod state (H)

Sources: `automa/state/iter-21-llama-bench-results.json`, scripts dir, audit 2026-04-26-sprint-s-iter1-runpod-trial-prep.md, audit 2026-04-28-iter-21-TECH-DEBT-LEDGER §0.

- Pod corrente (iter 21 entrance): `elab-iter18-a6000` ALIVE 6h, GPU 0% util, bootstrap MAI eseguito → ~$2.40 sprecati
- Balance current iter 21: **$11.15** (NOT $13.63 claim iter 18)
- Last bench JSON: `automa/state/iter-21-llama-bench-results.json` — Llama 3.3 70B sandbox bench
- R0 bench script: `scripts/runpod-r0-bench.mjs`
- Strategy: $0.79/h RTX 6000 Ada 48GB on/off, persist storage $0.10/GB/mo (audit iter1-runpod-trial-prep §0)
- Status iter 25 honest: **DEV-only**, mandate "RunPod $13 frugale non sprechiamo" (CLAUDEMD `feedback_iter21_mandate_critical.md`)

---

## Sezione 9 — Tech debt list 10+ items priority (I)

Cross-ref iter 21 audits + iter 22-24 close + CLAUDEMD bug list. Priority: **P0 = blocker prod**, **P1 = mandate violation**, **P2 = inflation/cleanup**.

| # | P | Item | Source citation | Estimated impact |
|---|---|---|---|---|
| 1 | P0 | **2 esperimenti broken** `v1-cap6-esp1` + `v1-cap7-esp2` resistor placement 7-col span ambiguity | `2026-04-29-iter-24-2-broken-experiments-investigation.md` §"Hypothesis 1" | -3% esperimenti funzionanti |
| 2 | P0 | **Lavagna canvas persistence bug** — bucket-mismatch `elab-drawing-paths` vs `elab-drawing-<id>` su switch experimentId (`DrawingOverlay.jsx:85,103-108`) | `2026-04-29-iter-25-LAVAGNA-PERSISTENCE-investigation.md §"Failure point"` | violazione persistence Principle Andrea iter 19 PM |
| 3 | P0 | **License gate hardcoded `ELAB2026`** in `WelcomePage.jsx:107` — bypass triviale client-side | `2026-04-28-iter-21-FOTOGRAFIA-PROD §3` + `iter-21-AGGREGATE-FINDINGS §1.3` | sicurezza commerciale |
| 4 | P0 | **Vol/pag conformance 46.7% (14/30)** target ≥90% FAIL — Principio Zero V3 violazione | `2026-04-29-iter-23-HARNESS-REAL-pilot-results §1` | -43.3pp vs target |
| 5 | P0 | **Harness REAL 0/5 PASS** prod — `window.__ELAB_API` non esposto post-navigate `elabtutor.school` | `iter-23-harness-real-pilot/results.jsonl` 5 entries `api_ready:false` | 91/92 esperimenti untested |
| 6 | P1 | **794 hex hardcoded** anti-pattern Morfismo (grafica audit iter 21 score 6.0/10) | `2026-04-28-iter-21-GRAFICA-AUDIT.md` | tema mandate iter 21 |
| 7 | P1 | **Modalità 4 UI NOT implemented** — UI mostra 3 (Già Montato/Passo Passo/Libero) vs mandate 4 (ADR-025 Percorso + Guida-da-errore) | `iter-21-AGGREGATE-FINDINGS §1 P1.1` | mandate violation |
| 8 | P1 | **ClawBot 52/80 templates gap** | CLAUDEMD §"Audit Brutale G20" | -28 templates |
| 9 | P1 | **ElabIcons NON derivata da volumi** | `feedback_iter21_mandate_critical.md` | brand alignment |
| 10 | P1 | **Tea homepage portale NOT integrated** + `/glossario` Next.js deferred | tech-debt-ledger §0 + iter 22 audit "EMBEDDING DEFERRED" | onniscenza L2 visibility |
| 11 | P1 | **L2 wiki_concepts migration NOT applied + seed NOT executed** | `2026-04-28-iter-22-TEA-GLOSSARIO-INGEST-design.md §header` | onniscenza L2 stub |
| 12 | P1 | **Onniscenza-bridge code-only smoke pending** | tech-debt-ledger §0 + onniscenza-bridge.ts:5-22 | L1-L7 effective verification gap |
| 13 | P1 | **Lesson narrative parità volumi 0.72/1.0** baseline (Vol3 0.55 problematico) | `iter-21-AGGREGATE-FINDINGS §0` | -0.28 vs ideal 1.0 |
| 14 | P2 | **RunPod $2.40 sprecati pod 6h ZERO util** | tech-debt-ledger §0 | budget waste mandate frugale |
| 15 | P2 | **Mac Mini loop = solo HEARTBEAT 6h+ nessun work eseguito** | tech-debt-ledger §0 | infra-without-output |
| 16 | P2 | **123 test gap CI vs Mac local** persistente | `.test-count-baseline.json:14-22` | CI confidence delta |
| 17 | P2 | **Edge Fn cold-start 503 first call** | `iter-21-AGGREGATE-FINDINGS §1 P1` | UX latency |
| 18 | P2 | **Sprint T NEW endpoints (vision/stt/imagegen) zero PROD smoke** | iter 25 sez 2 questo doc | unverified deploy |
| 19 | P2 | **RAG recall@5 stuck 0.390 iter 12→13** root cause 100% NULL chapter/page/section_title (1000 sample) | `2026-04-28-sprint-s-iter-13-CLOSE-FINAL-audit §1 + §3.3` | retrieval quality cap |
| 20 | P2 | **123/180 wiki concepts L2 vector embeddings DEFERRED** | iter 22 audit header + iter 7 RAG stalled wiki 100/100 | onniscenza L2 retrieval gap |

---

## Sezione 10 — Score iter 25 entrance honest aggregate

Methodology: aggregate dei score onesti reportati audit 2026-04-26 → 2026-04-29 secondo G45 anti-inflation.

| Dimensione | Misura iter 25 | Fonte |
|---|---|---|
| Fotografia PROD readonly | 5.8/10 | `iter-21-FOTOGRAFIA-PROD` |
| Linguaggio Principio Zero V3 | 2.5/10 (200 violations 330 file) | `iter-21-LINGUAGGIO-AUDIT` |
| Grafica Morfismo coerenza | 6.0/10 (794 hex hardcoded) | `iter-21-GRAFICA-AUDIT` |
| Volumi narrative MINUTA Sense 2 triplet | 0.72/1.0 (Vol3 0.55) | `iter-21-AGGREGATE-FINDINGS §2` |
| Vol/pag conformance prod (30 prompt) | 46.7% | `iter-23-HARNESS-REAL §1` |
| Harness REAL prod | 0/5 PASS (0%) | `iter-23-pilot/results.jsonl` |
| Esperimenti untested live | 91/92 | tech-debt-ledger §0 |
| RAG recall@5 | 0.390 | `iter-13-CLOSE §3.3` |
| Onniscenza 7-layer effective | 4/7 LIVE (L1, L4, L5, L6) + 2 partial (L2, L3) + 1 NOT impl (L7) | `onniscenza-bridge.ts:5-22` |
| Tests vitest | 12 056 CI / 12 718 Mac (iter 14) — no recent regression but coverage real <60% per baseline | `.test-count-baseline.json:7-8` |

**Score complessivo iter 25 entrance ONESTO: 6.0/10**

Range: 5.8 (Fotografia PROD baseline) ↔ 6.5 (con peso positivo Sprint T multimodal endpoint deploy iter 25). Iter 18-20 claim **8.5-8.8** invalidato confermato G45 (audit `iter-21-AGGREGATE-FINDINGS §0`).

**Top 5 fix high-impact iter 25 (in priority order)**:
1. Fix `window.__ELAB_API` exposure prod → unblock harness 0/5 → ottenere ground truth 91/92 esperimenti (P0 #5)
2. Fix bucket-mismatch DrawingOverlay → persistence bug Andrea mandate (P0 #2)
3. Fix license hardcoded → P0 commerciale (P0 #3)
4. Apply iter 22 wiki_concepts migration + execute seed + embed → onniscenza L2 effettivo (P1 #11)
5. Smoke-test Sprint T 3 nuovi endpoint (vision/stt/imagegen) PROD curl → conferma deploy reale (P2 #18)

---

**Doc LOC**: ~310 (cap 1000 OK) · No emoji · NO inflation · Cite file:line ogni claim · ONESTO G45 mandate.
