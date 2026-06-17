---
from: architect-opus
to: orchestrator
ts: 2026-04-26T153640
sprint: S-iter-3
priority: P2
blocking: false
---

## Output

ADR-010 + ADR-011 entrambi DELIVERED iter 3. File ownership rispettato (solo `docs/adrs/` toccato, NO src/ NO supabase/ NO tests/).

### Files

| ADR | Path | Lines | Sections |
|-----|------|-------|----------|
| ADR-010 | `docs/adrs/ADR-010-together-ai-fallback-gated-2026-04-26.md` | **688** | 7 (Contesto, Decisione, Implementation, Acceptance, Trade-off, Open Q, Riferimenti) — 10 sub-decisions D1-D10 |
| ADR-011 | `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-2026-04-26.md` | **630** | 7 (Contesto, Decisione, Implementation, Acceptance, Trade-off, Open Q, Riferimenti) — 10 sub-decisions D1-D10 |

Total: **1318 righe**. Entrambi ≥350 righe target.

### CoV

- Read `supabase/functions/_shared/llm-client.ts` (227 LOC) → confirmed `callLLM(options)` signature + Together→Gemini auto fallback existing → ADR-010 `opts.fallback` extension backward compat preservata.
- Read `scripts/together-ai-fallback-wireup.ts` (217 LOC) → confirmed Node-style scaffold (NOT Deno). ADR-010 design ports logic to Deno _shared/llm-client.ts + adds gate predicate explicit + audit log dedicated table.
- Read `scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl` (10 entries) → confirmed jsonl schema. ADR-011 v1.0 fixture extends backward compat (additive `category` + `weight` + `expectedPattern` + `gate_threshold` + `rationale` fields).
- Read `scripts/bench/run-sprint-r0-render.mjs` (200 LOC) → confirmed runner pattern (POST + cold start retry + responses jsonl + scorer invocation). ADR-011 D5 contract reuses pattern with Edge Function endpoint + auth header.
- Cross-references valid: ADR-010 references ADR-008/009/011 + Master plan §4.5 + PDR §5. ADR-011 references ADR-008/009/010 + Master plan §6 + PDR §1.5/§2.5 box 9.

### Key decisions ADR-010 (5 bullet)

- **Chain 4 livelli EU-first**: RunPod EU → Hetzner EU (stub Sprint H2) → Gemini EU → Together US gated. Total worst case 23s timeout, p99 user-visible <8s. Backward compat 100% via `opts.fallback?` optional.
- **Gate predicate `canUseTogether(ctx)` puro**: student_runtime BLOCKED sempre, teacher_lesson_prep richiede consentId+anonymized, batch_ingest richiede anonymized, emergency_anonymized richiede 2+ EU down + anonymized. Feature flag `VITE_ENABLE_TOGETHER_FALLBACK=false` default kill switch.
- **Audit log Supabase `together_audit_log`**: tabella dedicata (NO riuso `unlim_pz_violations` per semantic), RLS service-role only, fields {request_kind, anonymized_payload JSONB, user_role, consent_id, eu_providers_down, latency_ms, status, cost_usd, validator_version}. Retention 90gg manuale (cron Sprint H2).
- **Anonymization heuristic IT-first**: regex strip email + phone IT + codice fiscale + class_key + student UUID. False negative 5-10% atteso (NER deferred Sprint H2). Latency <5ms. Output `AnonymizationDiff` per ROPA compliance.
- **Cost discipline + rollback**: budget cap per use case (batch $50 una-tantum, teacher $20/mese, emergency $5/mese, student $0). Rollback flip flag false <5min senza redeploy. Manual canary post-DPO sign-off pre-flip prod.

### Key decisions ADR-011 (5 bullet)

- **6 categorie 50 prompts**: 10 plurale + 10 citazione + 8 sintesi + 6 safety + 6 off-topic + 10 deep-question. Distribution riflette frequenza realistica + emphasis su gap baseline (R1 plurale 0/10, R4 citation 0/10).
- **Score weights non uniformi**: plurale 1.0, safety 1.0, citazione 0.9, sintesi 0.85, deep 0.8, off-topic 0.7. Riflette criticità UX docente live (Andrea call-out plurale + safety = CRITICAL).
- **Doppia soglia gate**: overall ≥90% PASS AND each category ≥80%. Previene false PASS con category degradata. Verdetti PASS/WARN/FAIL automatici per CI.
- **Endpoint Edge Function elab-unlim** (NON Render legacy): runner `run-sprint-r5-edge-function.mjs` POSTs `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat` con `Authorization: Bearer ${SUPABASE_ANON_KEY}`. Cold start ~1s vs Render 18s.
- **CI GitHub Actions manual_dispatch**: workflow `sprint-r5-bench.yml` con `workflow_dispatch` (NOT pull_request auto-block). Andrea triggera quando misura delta. Honesty caveats automatici nel summary JSON (deploy_age, cold_start, rate_limit_hits, gemini_quota, validator_blocked).

### Dependencies

- waits: []
- provides:
  - ADR-010 design contract → `generator-app-opus` può implementare `_shared/anonymize.ts` + extend `_shared/llm-client.ts` + migration `together_audit_log` + 15 unit + 6 integration test
  - ADR-011 design contract → `generator-test-opus` può creare fixture jsonl 50 entries + runner Edge Function + workflow GH Actions + scorer extension category-aware

### Open questions per orchestrator

ADR-010:
1. **DPO sign-off timing**: implement code+flag false iter 3, flip true iter 5+ post-DPO? O DPO PRIMA merge code?
2. **Retention audit log**: 90gg default — Garante può chiedere 30gg/365gg, conferma?
3. **Together model**: Llama-3.3-70B Turbo proposto vs Mixtral 8x7B (cheaper IT lower) — preferenza?
4. **Migration timing**: applicare migration `together_audit_log` SUBITO iter 3 anche se code non flippato live? Mio default yes.
5. **Hetzner Livello 2 stub**: includere endpoint placeholder + flag empty default, o skip totalmente fino commit reale? Mio default stub.
6. **Heuristic anonymization vs spaCy NER**: defer Sprint H2 server dedicato? O NER subito (Mac Mini server stand-alone)?

ADR-011:
1. **Threshold per category**: 80% proposto — stricter 85% safety o lasso 75% tolleranza?
2. **Multilingue stub**: roadmap iter 5+ con 5 EN + 5 ES — conferma o IT-only forever?
3. **Fixture composition timing**: architect-opus iter 3 fornisce 50 prompts (collaborazione gen-test) — conferma?
4. **CI workflow secrets**: SUPABASE_ANON_KEY già in GH secrets? Se no Andrea action richiesta.
5. **Honesty caveats**: lista campi expanded? Mio default lista come ADR §2.9.
6. **Gate "Sprint 6 Day 39 unblocked"**: cosa significa concretamente — auto-deploy true o solo "ClawBot dev può iniziare"?

## Acceptance criteria

- [x] CoV 3x: read 4 input files, cross-reference 5 ADR/docs validi, line counts ≥350 entrambi
- [x] file ownership respected: solo `docs/adrs/` toccato (688+630=1318 righe), 0 file src/supabase/tests/
- [x] sezioni 10 (1.Contesto + 2.Decisione D1-D10 + 3.Contract + 4.Acceptance + 5.Trade-off + 6.Open Q + 7.Riferimenti) entrambi
- [x] references valid (ADR-007/008/009/010/011 cross-link consistent)
- [x] caveman tone tutto messaggio
- [x] Open questions per Andrea esplicit (12 questions across 2 ADR)
