# PDR Iter 19 — 16 ATOM-S19 Detailed Plan

**Date**: 2026-04-29 | **Sprint**: T iter 18-30 | **Iter**: 19 | **Author**: planner-opus PHASE 1
**Cross-link**: PDR-MASTER-2026-04-29.md §6 + ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md §1-§6
**Architecture deps**: ADR-023 Onniscenza 7-layer + ADR-024 Onnipotenza ClawBot 4-layer
**Linguaggio**: plurale "Ragazzi" + Vol/pag VERBATIM (Principio Zero V3 CLAUDE.md §0)
**Constraint**: NO push main, NO `--no-verify`, NO inflation auto-score, ralph caveman dynamic mode | **Cap**: 600 LOC

Andrea mandates verbatim iter 18 PM:
- "MOLTISSIMI ESPERIMENTI NON FUNZIONANO" → A5
- "non concentrarmi sulla fiera" → all ATOMs (NO demo focus)
- "ClawBot pilota tutto simulator/scratch/arduino con massima precisione e consapevolezza" → A2, A9, A10
- "previeni qualunque messaggio volgare o sbagliato" → A3
- "esperimenti sui volumi non sono proposti come su elabtutor" → A4
- "Scegli gli stessi modelli che userai dopo la migrazioni. FAI SCELTA PERFETTA" → A6
- Modalità simplification 4 modes NO "guida da errore" → A1

---

## ATOM-S19-A1 — Modalità 4-mode simplification spec

- **Owner**: architect-opus
- **Mandate**: ADDENDUM §1 verbatim — "eliminare guida da errore. Default Libero auto-start Percorso"
- **Files (RIGID)**: WRITE `docs/architectures/ADR-025-modalita-4-mode-simplification.md` NEW; READ-ONLY `src/components/lavagna/ModalitaSwitch.jsx` + ADDENDUM §1
- **Deliverable**: ADR-025 ~280 LOC: Status PROPOSED + 4 mode table (Percorso default + Passo-Passo + Già Montato + Libero auto-Percorso) + auto-behavior `onLiberoClick→setMode('Percorso')` + Removed "Guida da errore" rationale + per-mode linguaggio "Ragazzi" plurale + Vol/pag VERBATIM + UX flow ASCII + cross-link ADR-019 Sense 1.5
- **CoV gate**: file readable; ZERO src/tests/ touched (architect read-only sul codice); cross-link ADR-019+023+ADDENDUM §1 verified
- **Success**: 4 mode table con target user + UX + Linguaggio plurale; "Guida da errore" sezione removed esplicita; auto-behavior Libero NON sandbox vuoto; Andrea ratify queue voce 1+2 cross-link
- **LOC**: ~280 | **Duration**: ~45 min
- **Deps**: ADDENDUM §1+§2

---

## ATOM-S19-A2 — ClawBot consapevolezza onniscenza-bridge pre-execute

- **Owner**: architect-opus
- **Mandate**: ADDENDUM §2 verbatim — "ClawBot pilota tutto con massima precisione e consapevolezza"
- **Files (RIGID)**: WRITE `docs/architectures/ADR-026-clawbot-consapevolezza-onniscenza-bridge.md` NEW; READ-ONLY ADR-023 §5 + ADR-024 §5
- **Deliverable**: ADR-026 ~250 LOC: Status PROPOSED + sequence diagram ASCII (intent → onniscenza-router → state-snapshot-aggregator → ClawBot composite-handler → emit) + Consapevolezza checklist (5 pre-execute reads: simulator state + step + memoria docente + Vol/pag + Wiki) + Precisione checklist (5 PZ V3 enforce: plurale + Vol/pag VERBATIM + ≤60 parole + analogia + NO imperative) + cross-link A10 onniscenza-bridge.ts impl
- **CoV gate**: file readable; cross-link ADR-023+024 verified; ZERO src/tests/ touched
- **Success**: pre-execute consapevolezza step explicit; 5+5 checklist; reference A10 module
- **LOC**: ~250 | **Duration**: ~40 min
- **Deps**: A10, ADR-023 §5

---

## ATOM-S19-A3 — Content safety guard 10 rules runtime Deno

- **Owner**: gen-app-opus
- **Mandate**: ADDENDUM §3 verbatim — "previeni qualunque messaggio volgare o sbagliato"
- **Files (RIGID)**: WRITE `supabase/functions/_shared/content-safety-guard.ts` NEW ~150 LOC Deno; MODIFY `supabase/functions/unlim-chat/index.ts` (+15 LOC wire-up post-LLM); READ-ONLY ADDENDUM §3
- **Deliverable**: 10 rules pre-emit + post-LLM:
  1. Volgari blacklist Italian 50+ → reject+retry
  2. Off-topic non-STEM-K12 → "Ragazzi, restiamo su elettronica..."
  3. Linguaggio inappropriato 8-14 (Flesch-Kincaid <8th grade IT)
  4. Imperative docente → auto-rewrite plurale
  5. "Ragazzi," obbligatorio regex → retry
  6. Vol/pag VERBATIM cross-check pre-emit RAG chunk
  7. Hallucination numerico/factual senza source → block+retry
  8. Privacy minori NO student name + class name (anonymize)
  9. GDPR Art. 8 minori parental consent flag
  10. EU AI Act log audit_log table
  - API: `applyContentSafetyGuard(response, ctx) → { ok, blocked_rules, rewritten, retry_required }`
- **CoV gate**: NEW `tests/unit/content-safety-guard.test.js` 10 tests; Build PASS Deno; smoke 5 evil prompts → ≥80% blocked+retry success; telemetry counters registered
- **Success**: 10 rules unit-tested; block rate <5% R5 50-prompt; retry success ≥70%; audit_log insert verified
- **LOC**: ~150 module + ~15 wire + ~150 test = ~315 | **Duration**: ~3h
- **Deps**: A10 onniscenza-bridge (rule 6 RAG chunk access)

---

## ATOM-S19-A4 — Volumi narrative refactor Step 1 audit Vol1+2+3

- **Owner**: Mac Mini D3 elab-auditor-v2 (background overnight)
- **Mandate**: ADDENDUM §4 verbatim — "esperimenti sui volumi: variazioni di uno stesso tema vs pezzi staccati"
- **Files (RIGID)**: WRITE `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` NEW; READ-ONLY `/VOLUME 3/CONTENUTI/volumi-pdf/Vol{1,2,3}.pdf` via pdftotext + `src/data/lesson-paths/v{1,2,3}-cap*-esp*.json` (92 file flat)
- **Deliverable**: Mac Mini D3 audit cap-by-cap mapping per Vol1 (38) + Vol2 (27) + Vol3 (27) → table per capitolo `{ chapter_id, theme, variations_pdf, lesson_paths_current, gap, recommend_action }`; Davide co-review trigger PDR §3.4
- **CoV gate**: file readable; mapping completo 92 lesson-paths → 38 capitoli libro target; Davide approve flag pending iter 25
- **Success**: 38 capitoli mapped (Vol1 ~20 + Vol2 ~9 + Vol3 ~9 stima); gap "pezzi staccati" identificato esplicitamente; recommend keep/merge/remove per ogni lesson-path
- **LOC**: ~600 markdown table | **Duration**: ~6h Mac Mini overnight
- **Deps**: Mac Mini D3 SSH alive (`docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md`), pdftotext, A14 dispatch

---

## ATOM-S19-A5 — Esperimenti systematic 92 test harness 2.0

- **Owner**: gen-test-opus
- **Mandate**: PDR-MASTER §1 verbatim — "MOLTISSIMI ESPERIMENTI NON FUNZIONANO"
- **Files (RIGID)**: WRITE `tests/e2e/03-esperimenti-systematic-92.spec.js` NEW Playwright ~400 LOC; WRITE `scripts/bench/harness-2.0-runner.mjs` NEW ~250 LOC; WRITE `automa/state/iter-19-harness-2.0-results.json`; READ-ONLY `src/data/lesson-paths/*.json`
- **Deliverable**: enumerate 92 lesson-paths + per esperimento: load → mountExperiment → simulate → voice roundtrip (Whisper STT → unlim-chat → Isabella TTS) → tutor turn → diagnose (Vision Gemini EU OR Qwen) → captureScreenshot → confront golden `tests/fixtures/golden-states/exp-{id}.json` SSIM ≥0.92; failure log JSON granular → fix queue
- **CoV gate**: harness runner unit ~10 mock tests; Build PASS; smoke 5 esperimenti subset locally → JSON valid; Playwright spec executable
- **Success**: 92 lesson-paths enumerated (NOT skipped); JSON schema `{ exp_id, status: pass|fail|partial, failure_log, latency_ms, ssim }`; iter 19 baseline ≥40% pass first run (iter 22 target ≥80% per PDR §3.1)
- **LOC**: ~400 spec + ~250 runner + golden states defer iter 20 = ~650 | **Duration**: ~5h
- **Deps**: Vision flow live (Andrea env iter 19+), `__ELAB_API.mountExperiment` working (iter-18-experiments-test-FIXED 10/10)

---

## ATOM-S19-A6 — RunPod $13 results read + integrate bench data

- **Owner**: gen-app-opus
- **Mandate**: ADDENDUM §5 verbatim — "stessi modelli production. FAI SCELTA PERFETTA"
- **Files (RIGID)**: WRITE `automa/state/iter-19-runpod-bench-integration.md` NEW; WRITE `docs/strategy/2026-04-29-runpod-vs-scaleway-1-1-transfer.md` NEW; READ-ONLY `automa/state/iter-12-bench-results.json` + ADDENDUM §5 model table (Llama 3.3 70B + BGE-M3 + Voxtral + XTTS-v2)
- **Deliverable**: read existing RunPod $13 bench (Task A vLLM Llama 70B + Task B BGE-M3 + Task C Voxtral) → 1:1 transfer plan Scaleway H100 SXM iter 21 procurement (PDR §3.3): bench synthesis (latency p50/p95) + VRAM vs H100 80GB headroom + quantization (Q4_K_M Llama, FP16 BGE-M3+Voxtral) + transfer cost (HF gated mirror) + post-Scaleway validation (R5 91.80% threshold)
- **CoV gate**: file readable; cross-link iter-12-bench-{results.json,summary.md}; ZERO src/tests/ touched
- **Success**: 4 models bench summary table; 1:1 transfer explicit (NO smaller variants); Scaleway VRAM fit verified (H100 80GB > 40+1.5+8+~6GB)
- **LOC**: ~300 | **Duration**: ~2h
- **Deps**: ADR-022, iter-12 bench existing

---

## ATOM-S19-A7 — Mistral PAYG migration prep OpenAI-compatible swap stub

- **Owner**: gen-app-opus
- **Mandate**: PDR-MASTER §3.2 — "Gemini routing 70/25/5 retire. Mistral Large 3 PAYG OpenAI-compatible API → swap minimo"
- **Files (RIGID)**: WRITE `supabase/functions/_shared/mistral-client.ts` NEW ~180 LOC; MODIFY `supabase/functions/_shared/llm-client.ts` (+30 LOC chain step); WRITE `docs/strategy/2026-04-29-mistral-payg-migration-prep.md` NEW ~200 LOC; READ-ONLY existing `gemini.ts` + `together-fallback.ts`
- **Deliverable**: Mistral OpenAI-compatible stub: endpoint `https://api.mistral.ai/v1/chat/completions` Frankfurt EU GDPR; models `mistral-large-latest` primary + `mistral-small-latest` fallback; chain extension callLLMWithFallback adds Mistral P1 (currently Together default); anonymize PII reuse from `together-fallback.ts`; audit log decision in plan; Andrea ratify queue voce 9 ADDENDUM §6 — credit card €500 first month
- **CoV gate**: NEW `tests/unit/mistral-client.test.js` 8 mock tests; Build PASS Deno; smoke OpenAI-compatible response shape mocked; ZERO Mistral live call iter 19 (defer iter 20 post-OAuth)
- **Success**: signature mirrors `gemini.ts` swap minimo; migration plan covers signup+key+env+rollback; ~€800/anno saving 100 scuole verified
- **LOC**: ~180 stub + ~30 wire + ~200 plan + ~120 test = ~530 | **Duration**: ~3.5h
- **Deps**: Andrea ratify voce 9

---

## ATOM-S19-A8 — Tea PDF Glossario ingest pipeline draft

- **Owner**: gen-app-opus
- **Mandate**: PDR-MASTER §3.5 + ADR-023 §2.2 Layer 3 — "Glossario Tea v2 chunking 549→~750 chunk"
- **Files (RIGID)**: WRITE `scripts/ingest-glossario-tea.mjs` NEW ~200 LOC; WRITE `docs/strategy/2026-04-29-glossario-tea-ingest-spec.md` NEW ~150 LOC; READ-ONLY `/VOLUME 3/TEA/glossario-tea-vol{1,2,3}.*` (180 termini + 58 analogie); READ-ONLY existing `scripts/rag-ingest-voyage-batch.mjs` (template iter 7)
- **Deliverable**: pipeline ingestion: pdftotext extract → chunk per termine `{ term, vol_ref, page_ref, definition_text, analogia_text, capstone_bool, embedding_voyage_1024 }`; Voyage 3 RPM batch 15 chunks/call + sleep 21s (reuse iter 7); Together AI Llama 3.3 70B contextualization (Anthropic Contextual Retrieval); insert `rag_chunks` OR NEW `glossario_chunks` (decision in spec); target ~360 chunk (180 termini × 2: definition + analogia); cost ~€4 una-tantum PDR §3.5
- **CoV gate**: NEW `tests/unit/ingest-glossario-tea.test.js` ~12 mock tests; Build PASS Node; smoke dry-run 5 termini → 10 chunks valid schema; ZERO live ingest iter 19 (defer iter 20 post-env confirm)
- **Success**: schema validated; cost €4 verified (180 × ~600 token × 2 / Voyage free 50M); spec covers rollback `DELETE WHERE source='glossario-tea-v2'`
- **LOC**: ~200 + ~150 + ~150 = ~500 | **Duration**: ~3h
- **Deps**: A6 (BGE-M3 alternative), Andrea env VOYAGE_API_KEY (provisioned iter 7)

---

## ATOM-S19-A9 — composite-handler runtime active prod EXTEND

- **Owner**: gen-app-opus
- **Mandate**: ADR-024 §2.1 — "composite-handler.ts 492 LOC iter 6 P1 NOT prod active. Iter 22 close: runtime active prod"
- **Files (RIGID)**: MODIFY `scripts/openclaw/composite-handler.ts` (EXTEND 492 → ~700 LOC); MODIFY `scripts/openclaw/dispatcher.ts` (+40 LOC composite branch ENABLE prod); READ-ONLY ADR-024 §5 + ADR-013 D2
- **Deliverable**: prod activation gate `COMPOSITE_HANDLER_PROD_ACTIVE` env flag (iter 22+ flip); onniscenza-bridge integration (calls A10 pre-execute); 5 PZ V3 enforcement post-emit (delegates `principio-zero-validator.ts`); telemetry counters: composite_dispatch_total + halt_on_error + pz_violations; 8 NEW composite tests (extend 5 → 13 total): image-based scenario D + E (iter 13 ATOM-S13-A4 deferred) + prod gate + onniscenza bridge call + PZ V3 violation halt
- **CoV gate**: vitest openclaw 129 PASS preserved + 8 NEW = 137 PASS target; Build PASS; dispatcher opt-in gate prod inactive iter 19 (active iter 22 ADR-024 §6); ZERO regression src/tests/ (file ownership rigid scripts/openclaw/)
- **Success**: 8 NEW tests PASS; telemetry wired (auditDispatcher log); onniscenza bridge call stub valid state-snapshot shape; PZ V3 violation triggers halt+retry
- **LOC**: ~210 extend + ~40 dispatcher + ~250 test = ~500 | **Duration**: ~4h
- **Deps**: A10, A2

---

## ATOM-S19-A10 — onniscenza-bridge.ts NEW module

- **Owner**: gen-app-opus
- **Mandate**: ADR-024 output-files line 45 — "iter 23+: onniscenza-bridge.ts NEW bridge ClawBot pre-execute reads ADR-023 §5 state-snapshot"
- **Files (RIGID)**: WRITE `supabase/functions/_shared/onniscenza-bridge.ts` NEW ~150 LOC Deno; WRITE `tests/unit/onniscenza-bridge.test.js` NEW ~120 LOC; READ-ONLY ADR-023 §5 schema + existing `scripts/openclaw/state-snapshot-aggregator.ts` (port reference)
- **Deliverable**: Edge runtime bridge module: API `getOnniscenzaSnapshot(ctx: { intent, exp_id, user_id, class_key }) → Promise<OnniscenzaSnapshot>`; 7-layer aggregation parallel Promise.all: L1 RAG (`rag.ts`) + L2 Wiki (kebab-case `docs/unlim-wiki/concepts/`) + L3 Glossario (post-A8 query `glossario_chunks`) + L4 Memory (`unlimMemory` 3-tier) + L5 Vision (calls Vision endpoint if intent visual) + L6 LLM-knowledge (main LLM hint) + L7 On-the-fly (prompt + recent history); RRF k=60 fusion L1+L2+L3 textual; dedup (Vol/pag canonical); output `{ snapshot_id, layers: { rag, wiki, glossario, memory, vision, llm_hint, on_fly }, latency_ms }`; latency target p50 <2s p95 <5s ADR-023 §3
- **CoV gate**: 12 tests covering each layer mock + RRF + dedup + latency budget; Build PASS Deno; smoke 1 intent → 7-layer non-null mocked
- **Success**: schema valid + tests PASS; latency p50 <2s mocks; dedup verified (same Vol/pag chunk L1+L3 → merged)
- **LOC**: ~150 + ~120 = ~270 | **Duration**: ~3h
- **Deps**: A8 schema, ADR-023 §5, existing `rag.ts` + `unlimMemory.js`

---

## ATOM-S19-A11 — Gold-set v4 BGE-M3 30 queries Italian

- **Owner**: gen-test-opus
- **Mandate**: ADR-022 + iter 18 RunPod task B BGE-M3 bench
- **Files (RIGID)**: WRITE `tests/fixtures/hybrid-gold-30-bge-m3-v4.jsonl` NEW 30 queries; WRITE `tests/fixtures/hybrid-gold-30-bge-m3-v4-provenance.md` NEW ~80 LOC; READ-ONLY existing `tests/fixtures/hybrid-gold-30.jsonl` (iter 12 baseline) + `src/data/rag-chunks.json` (1881 chunks UUID source)
- **Deliverable**: 30 queries Italian K-12 8-14 anni linguaggio: 5 categories × 6 queries (componenti + concetti circuitali + Arduino code + analogie volumi + diagnose visivo); each `{ query_id, query_text, expected_chunks: [uuid_list], category, vol_ref, difficulty: easy|medium|hard }`; plurale "Ragazzi," 10/30 (verify L4 morfismo); Vol/pag VERBATIM 15/30 (verify L1 RAG + L3 Glossario); 86 UUIDs avg ~3 per query; provenance source PDF page + chunking validation
- **CoV gate**: JSONL valid 30 lines schema compliant; 86 UUIDs resolve `rag_chunks` (post-A8 Glossario possibly); ZERO src/ touched
- **Success**: 30 queries 5 categories evenly; provenance Vol1+2+3 PDF pages; difficulty 10 easy + 15 medium + 5 hard
- **LOC**: ~30 JSONL + ~80 markdown + ~100 spec = ~210 | **Duration**: ~2.5h
- **Deps**: A8 (Glossario chunks), iter 12 hybrid-gold-30 baseline

---

## ATOM-S19-A12 — 8 NEW L2 templates 20→28 (Mac Mini D1)

- **Owner**: Mac Mini D1 (background overnight)
- **Mandate**: ADR-024 §6 — "iter 22: 60 L2 templates (40 NEW)" — partial advance iter 19 con 8 NEW (20→28)
- **Files (RIGID)**: WRITE `scripts/openclaw/l2-templates-28.ts` NEW partial expansion ~600 LOC; WRITE `automa/state/iter-19-l2-templates-mac-mini-batch.md` Mac Mini output log; READ-ONLY existing `scripts/openclaw/morphic-generator.ts` + 20 L2 templates iter 13-17
- **Deliverable**: 8 NEW L2 templates per ADR-024 §3.4: (1) Misurare-Tensione (multimeter+pin → highlight + read serial + analogy Vol/pag); (2) Diagnose-Capacitor-Polarity (cap+breadboard → vision + Vol citation); (3) Compute-OhmLaw-Visual (V+I+R partial → calc + highlight equation); (4) Trace-Wire-Path (wire_id → highlight breadboard step-by-step); (5) Identify-IC-Pin1 (IC+image → vision + Vol/pag datasheet); (6) Schematic-vs-Breadboard-Match (diff + highlight mismatch); (7) Calc-PWM-DutyCycle (frequency+duty → calc + scratch block); (8) Map-Sensor-Reading (sensor+pin → ADC + serial print + Vol/pag); pattern `input(circuitContext) → toolCall_sequence → responseGen(plurale + Vol/pag) → tts(Isabella)`
- **CoV gate**: file readable; each template typed `L2Template` interface (existing); Mac Mini D1 batch output captures errors; integration test via A9 composite-handler (NOT separate)
- **Success**: 8 templates valid TypeScript (`tsc --noEmit`); each con plurale "Ragazzi" + Vol/pag VERBATIM responseGen; Mac Mini overnight ≥6/8 (75% threshold)
- **LOC**: ~600 (75 LOC/template) | **Duration**: ~5h Mac Mini overnight
- **Deps**: A14 dispatch, Mac Mini D1 SSH alive, A9 test integration

---

## ATOM-S19-A13 — Vercel env compile-proxy URL switch

- **Owner**: orchestrator (Andrea OAuth click required)
- **Mandate**: ADDENDUM §6 voce 8 — "Vercel env switch compile-proxy OAuth click iter 19"
- **Files (RIGID)**: MODIFY `docs/iter-19-compile-proxy-deployed.md` (UPDATE existing, add iter 19 switch step); READ-ONLY existing Vercel env config
- **Deliverable**: Andrea OAuth: Vercel dashboard → ELAB → Settings → Env Vars; switch `VITE_COMPILE_PROXY_URL` from Hostinger n8n → new Edge Function compile-proxy URL; verify smoke post-switch: 1 Arduino compile request → HEX returned; document new URL + rollback procedure; Andrea Telegram confirmation iter 19 close
- **CoV gate**: doc updated con switch confirmation; smoke `curl POST .../compile -d '{"sketch":"void setup(){}void loop(){}"}'` → HEX 200 OK; ZERO regression existing compile flow
- **Success**: env var verified switched (Andrea screenshot Telegram); smoke PASS post-deploy; rollback documented (revert env var)
- **LOC**: ~80 markdown update | **Duration**: ~15 min OAuth + ~30 min verify
- **Deps**: Andrea OAuth click (gate)

---

## ATOM-S19-A14 — Mac Mini D1-D8 dispatch protocol task queue YAML

- **Owner**: orchestrator
- **Mandate**: PDR-MASTER §5.2 + memoria mac-mini-autonomous-design.md — "Mac Mini M4 16GB factotum 8 task autonomous D1-D8"
- **Files (RIGID)**: WRITE `automa/team-state/mac-mini-dispatch-iter-19.yaml` NEW ~120 LOC; WRITE `automa/team-state/mac-mini-dispatch-protocol.md` NEW ~180 LOC; READ-ONLY existing `docs/handoff/2026-04-28-mac-mini-ssh-access-debug.md`
- **Deliverable**: task queue YAML iter 19: D1 A12 8 NEW L2 templates overnight ~5h; D2 vitest watch + auto-report Telegram continuous; D3 A4 VOLUMI-EXPERIMENT-ALIGNMENT overnight ~6h; D4 build verification cross-branch continuous; D5 lighthouse audit /scuole + lavagna weekly Sunday; D6 cost monitor Gemini/Mistral/Scaleway daily 08:00 CEST; D7 Supabase backup nightly + RLS audit 02:00 CEST; D8 GitHub PR review CodeRabbit AI continuous on PR open. Protocol: SSH `progettibelli@100.124.198.59` via `~/.ssh/id_ed25519_elab`; heartbeat `automa/state/heartbeat` 5min; 3 misses → orchestrator retry SSH + Telegram alert; output `automa/state/iter-19-mac-mini-{D1..D8}-results.{json,md}`; branch pattern `mac-mini/iter-19-{task}-YYYYMMDD-HHMMSS`
- **CoV gate**: YAML syntactically valid (`yamllint`); protocol cross-link SSH handoff; ZERO src/tests/ touched
- **Success**: 8 D-tasks defined con schedule + dispatcher_cmd + output_path + heartbeat_check; failure recovery + Andrea Telegram escalation; dispatch trigger documented (orchestrator → SSH `bash ~/scripts/elab-{task}-runner.sh`)
- **LOC**: ~120 YAML + ~180 markdown = ~300 | **Duration**: ~2h
- **Deps**: Mac Mini SSH alive (Andrea ssh-copy-id retry post iter 18 PM block)

---

## ATOM-S19-A15 — Andrea ratify queue 10 voci tracker

- **Owner**: scribe-opus
- **Mandate**: ADDENDUM §6 — 10 ratify voci iter 18-22 deadline
- **Files (RIGID)**: WRITE `automa/state/andrea-ratify-queue-iter-19.md` NEW ~150 LOC; READ-ONLY ADDENDUM §6 (10 voci verbatim) + PDR-MASTER §7 (sibling 8 voci, dedup)
- **Deliverable**: tracker consolidando 10 ADDENDUM §6 + 8 PDR-MASTER §7 → dedup ~12 unique. Per voce `{ id, title, action_required, deadline_iter, status: pending|approved|rejected, telegram_msg_id, decision_date }`. Status iter 19 close most "pending" (Andrea Telegram approve flow). Escalation: voci approaching deadline iter 22 → Telegram reminder daily. Voci verbatim ADDENDUM §6: (1) Modalità simplification — A1; (2) Libero auto-Percorso — A1; (3) Già Montato new mode — A1; (4) ClawBot consapevolezza — A2+A10; (5) Content safety guard — A3; (6) Volumi narrative refactor — A4; (7) RunPod stessi modelli — A6; (8) Vercel env switch — A13; (9) Mistral PAYG — A7; (10) Tea co-dev formalize TBD pending Andrea decision (termini NON specificati ancora). Plus PDR §7: (11) Hetzner backup hot Mistral fallback; (12) Scaleway H100 procurement €1993/mese 12mo committed
- **CoV gate**: file readable; all 12 voci enumerated con id+title+deadline+status; cross-link ADDENDUM §6 + PDR §7
- **Success**: 12 unique voci post-dedup; each links dependent ATOM (A1, A2, A3, ...); Telegram escalation protocol documented
- **LOC**: ~150 markdown | **Duration**: ~1.5h
- **Deps**: ADDENDUM §6 + PDR-MASTER §7

---

## ATOM-S19-A16 — CoV continuous + score recalibrate iter 19 close

- **Owner**: scribe-opus + orchestrator (final dispatch PHASE 2)
- **Mandate**: PDR-MASTER §9 — "NO auto-score >9 senza agente Opus indipendente. Cross-verify G45 metodologia"
- **Files (RIGID)**: WRITE `docs/audits/2026-04-29-sprint-t-iter19-CLOSE-audit.md` NEW ~400 LOC; WRITE `docs/handoff/2026-04-29-sprint-t-iter-19-to-iter-20-handoff.md` NEW ~250 LOC; MODIFY `CLAUDE.md` (append iter 19 close section ~100 LOC); READ-ONLY ALL 15 prior ATOM outputs (A1-A15)
- **Deliverable**: 16 ATOMs status table `{ atom_id, owner, deliverable, files_touched, cov_pass, success_criteria_met, loc_actual }`; vitest count actual (read `automa/baseline-tests.txt` POST run); Build PASS verification; R5 91.80% baseline preserved (NO Edge Function deploy iter 19 unless Andrea approve); score iter 19 close ONESTO calibration: Box recalibration PDR §9 progression 7.5 → ~7.7 (target iter 22 8.5); NO auto-score >8 (gate CLAUDE.md anti-inflation rule); cite G45 (memoria G45-audit-brutale.md) "auto-score >7 SENZA agente indipendente = inflated"; Pattern S 4-agent OPUS race-cond fix VALIDATED 6th iter consecutive (iter 5+6+8+11+12+19) — filesystem barrier `automa/team-state/messages/{planner,architect,gen-app,gen-test}-opus-iter19-to-orchestrator-*.md`; honest gaps caveat (5 bullets minimum); iter 20 priorities preview (post-Andrea ratify queue 10 voci); activation string iter 20 paste-ready
- **CoV gate**: vitest baseline preserved or +N (ZERO regression); Build PASS; all 15 prior ATOMs verified A1-A15 file system check; cross-link PDR-MASTER + ADR-023+024+025+026 (NEW iter 19) + ADDENDUM §1-6; ZERO push main (CLAUDE.md anti-regression)
- **Success**: 16/16 ATOMs status documented; score ONESTO ≤8 calibrated NO inflation; iter 20 activation string paste-ready; Andrea Telegram summary <300 words
- **LOC**: ~400 + ~250 + ~100 = ~750 | **Duration**: ~4h
- **Deps**: ALL prior A1-A15 completed (PHASE 2 sequential post 15/15 messages)

---

## §17 — Iter 19 dispatch order (Pattern S PHASE-PHASE)

**Phase 1 parallel** (architect + gen-app + gen-test + orchestrator):
- architect-opus: A1 + A2
- gen-app-opus: A3 + A7 + A8 + A9 + A10
- gen-test-opus: A5 + A11
- orchestrator: A6 + A13 + A14 + A15

**Phase 1 background** (Mac Mini dispatch via A14):
- D1: A12 8 NEW L2 templates overnight
- D3: A4 VOLUMI-EXPERIMENT-ALIGNMENT overnight

**Phase 2 sequential** (scribe-opus AFTER 13/13 Phase 1 completion msgs):
- A16 CoV + score recalibrate + audit + handoff + CLAUDE.md update

**Filesystem barrier**: `automa/team-state/messages/*-iter19-to-orchestrator-*.md` 13/13 emit MANDATORY pre-A16 spawn.
**Anti-regression**: vitest 12599+ PASS preserved (iter 12 baseline) + Build PASS + ZERO push main + NO `--no-verify`.

---

## §18 — Total LOC budget iter 19

| ATOM | Owner | LOC | Duration |
|------|-------|-----|----------|
| A1 | architect | 280 | 45 min |
| A2 | architect | 250 | 40 min |
| A3 | gen-app | 315 | 3h |
| A4 | Mac Mini D3 | 600 | 6h overnight |
| A5 | gen-test | 650 | 5h |
| A6 | gen-app | 300 | 2h |
| A7 | gen-app | 530 | 3.5h |
| A8 | gen-app | 500 | 3h |
| A9 | gen-app | 500 | 4h |
| A10 | gen-app | 270 | 3h |
| A11 | gen-test | 210 | 2.5h |
| A12 | Mac Mini D1 | 600 | 5h overnight |
| A13 | orchestrator | 80 | 45 min |
| A14 | orchestrator | 300 | 2h |
| A15 | scribe | 150 | 1.5h |
| A16 | scribe + orch | 750 | 4h |
| **TOTAL** | — | **~6285** | ~46h (foreground ~35h + Mac Mini ~11h) |

Distribuzione foreground: architect ~1.5h | gen-app ~18.5h | gen-test ~7.5h | orchestrator ~3h | scribe ~5.5h. Iter 19 spans ~24h calendar (overnight Mac Mini + day work parallel).

---

## §19 — Cross-references

- PDR-MASTER-2026-04-29.md (parent master plan iter 18-30)
- ANDREA-MANDATES-ITER-18-PM-ADDENDUM.md (mandates verbatim §1-§6)
- ADR-023 Onniscenza 7-layer + ADR-024 Onnipotenza ClawBot 4-layer (architecture parents)
- ADR-025 Modalità 4-mode (NEW iter 19 A1) + ADR-026 ClawBot consapevolezza (NEW iter 19 A2)
- CLAUDE.md DUE PAROLE D'ORDINE Principio Zero V3 + Morfismo Sense 1.5
- memoria G45-audit-brutale.md (anti-inflation methodology)
- memoria mac-mini-autonomous-design.md (D1-D8 protocol)
- memoria long-session-best-practices.md (Pattern S race-cond fix)
- COST-REVENUE-ONGOING-ANALYSIS.md + COMPETITOR-ADVERSARIAL-SCENARIOS.md (siblings)

---

**FINE PDR-ITER-19-ATOMS** — 16 ATOMs canonical. Pattern S PHASE-PHASE iter 19 dispatch ready. NO push main. NO `--no-verify`. NO inflation. Plurale "Ragazzi" + Vol/pag VERBATIM enforced cross-ATOM.
