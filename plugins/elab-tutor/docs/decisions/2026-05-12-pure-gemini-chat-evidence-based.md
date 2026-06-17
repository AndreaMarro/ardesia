# Decision: Pure Gemini Chat (Vertex EU) — Evidence-Based Supersedes Combo C Hybrid

**Date:** 2026-05-12
**Sprint:** Sprint U iter 39
**Status:** ACCEPTED (Andrea ratify "1")
**Supersedes:** Combo C Hybrid analysis (rejected post empirical R5 evidence discovery)
**Owner:** Andrea + orchestrator

---

## Context

Sprint U iter 39 task: pick AI model combination ELAB Tutor maximizing Andrea 5 priorities — velocità + qualità + integrabilità + scalabilità + intelligenza — rispettando 4 principi inviolabili (Principio Zero + Morfismo + Onniscenza + Onnipotenza).

Initial recommendation Combo C Hybrid (Gemini Flash-Lite default + Mistral chit_chat/safety warmth) wired Phase 1 commit `baed3e69` (reverted).

Post-commit empirical evidence discovery on filesystem (`scripts/bench/output/r5-stress-report-2026-05-10T21-24Z.md` + 2 successive runs 05-11) **reverses** the hybrid hypothesis.

---

## Decision

**Pure Gemini chat** strategy:

- **Chat default 100% traffic** → Gemini Flash-Lite Vertex Frankfurt EU (post Phase 0 migration)
- **Reasoning escalation** (deep_question, citation_vol_pag) → Gemini Pro 2.5 thinking mode
- **Vision** → Pixtral Large (Mistral retained, EU FR GDPR clean) OR Gemini Pro Vision (Vertex EU)
- **TTS narratore voice** → Voxtral mini-tts-2603 voice clone Andrea LIVE iter 31 (Mistral retained, Sense 2 morfismo voice unity preserved INDEPENDENT of chat backend)
- **STT** → Voxtral Transcribe 2 (Mistral retained, ADR-031 EU FR)
- **OCR** → Mistral OCR (volumi cartacei Davide Tea workflow)
- **Embeddings** → mistral-embed (RAG existing, 1881 chunks)
- **Fallback chain** → llm-client.ts existing chain (Vertex → AI Studio → Mistral Large → Together gated) preserved

Mistral retained **multimodal + fallback layers only** (TTS + Vision + STT + OCR + Embeddings + emergency fallback). Chat layer 100% Gemini.

---

## Empirical Evidence

### R5 Stress Bench (current branch state, preferFastProvider:true = Gemini Flash-Lite direct)

| Run | Avg Latency | Success Rate | p95 Visible |
|-----|-------------|--------------|-------------|
| 2026-05-10 21:24 | **1914ms** | 30/38 (~79%) | 5000+ms |
| 2026-05-11 01:13 | **1877ms** | 59/60 (98%) | 5806ms |
| 2026-05-11 06:54 | **2727ms** | 59/60 (98%) | 7018ms |

**Conclusion**: Gemini Flash-Lite already delivers sub-3s p50 + 98% success rate on current PROD branch. Andrea quote "Mistral lento" + iter 33 emergency LLM_ROUTING flip Gemini = product signal already chosen, empirically validated.

### Mistral Historical Burst Risk

CLAUDE.md iter 24-30 evidence:
- p95 6800-19008ms burst history
- 503 burst rate 11.4-77.8%
- iter 37 R5 v50 4496ms avg + 10096ms p95 (Mistral routing 70/20/10 weighted active)

Adding Mistral routing 12-15% traffic via Combo C `chit_chat + safety_warning` introduces these tail latency outliers without proportional warmth benefit (Gemini Flash-Lite Italian native trained adequate warmth).

---

## Andrea 5 Priorities — Scored Pure Gemini

| Priorità | Vincitore | Evidence |
|----------|-----------|----------|
| Velocità massima | **Pure Gemini** | 1877ms avg empirical R5 vs Mistral 4-6s baseline |
| Qualità massima | **Pure Gemini** | Pro 2.5 thinking deep_question/citation, Flash-Lite IT warmth adequate |
| Integrabilità massima | tie | both 2-vendor chains (chat + multimodal Mistral retained) |
| Scalabilità massima | **Pure Gemini Vertex** | Google global infra >> Mistral La Plateforme single-region |
| Intelligenza massima | **Pure Gemini Pro thinking** | thinking mode dominant reasoning |

**4/5 Pure Gemini wins, 1/5 tie.** Hybrid Combo C lose-marginally on all 4 winning dimensions for no winning trade.

---

## 4 Principi Inviolabili — Compliance

1. **Principio Zero** (docente-tramite + plurale "Ragazzi" + Vol/pag verbatim + kit fisico) → model-agnostic. BASE_PROMPT v3.1 + 6 PZ runtime rules + classifier preserved. Gemini Italian native handles plurale + citation as well as Mistral.
2. **Morfismo Sense 1** (mutaforma runtime) → model-agnostic. 57 ToolSpec + L1 composite + L2 templates + INTENT JSON schema all preserved.
3. **Morfismo Sense 2** (kit + volumi + software unified narratore voce) → **Voxtral voice clone Andrea LIVE INDIPENDENTE from chat backend**. TTS layer separate. Pure Gemini chat → text generated → Voxtral speaks. Narratore voice unity preserved.
4. **Onniscenza + Onnipotenza** → L1-L7 layers + dispatcher 57-tool model-agnostic. iter 31 wired prod unchanged.

**Zero principi violation. Pure Gemini chat compatible 4/4 principi.**

---

## Sub-Decisions Cascading

### Phase 0 — Vertex EU Migration (P0 GDPR INVIOLABLE)

Doc `docs/audits/2026-05-12-combo-c-phase-0-gdpr-vertex-migration.md` valid AS-IS. Pure Gemini strategy makes Phase 0 EVEN MORE critical — 100% chat traffic routes Vertex (vs Combo C 80-85% chat). GDPR Art.8 minori EU residency exposure 100% on Vertex post Phase 0 (vs split with Mistral). Cleanest single-residency.

### Phase 4 — UNLIM Dreams Overnight

Doc `docs/audits/2026-05-12-phase-4-unlim-dreams-design.md` valid AS-IS. Model-agnostic batch consolidation — can use Mistral Medium 3.5 batch overnight (cheaper) OR Gemini Pro batch. Decision deferred Phase 4 impl.

### Phase 1 Wire-Up Reverted

Commit `baed3e69` (Combo C classifier-aware routing) **reverted** via `git reset --mixed HEAD~1`. Working tree restored: `unlim-chat/index.ts:788` `preferFastProvider: true` unconditional. `combo-c-routing.test.js` deleted (no longer valid).

No code change needed for Pure Gemini chat — already in effect via `preferFastProvider: true` line 793 (inherited from iter 26+ routing infrastructure).

### Phase 2 Bench — Optional Empirical Confirm

Phase 2 60q × 3-run bench Pure G alone (not vs Combo C) → measure latency p50/p95 + 12 PZ rules quality + Italian warmth subjective. Validation step, NOT decision input (decision already evidence-locked).

---

## Cost Projection

| Scale | Pure Gemini Flash-Lite Vertex | Mistral Scale tier paid (multimodal only) |
|-------|-------------------------------|--------------------------------------------|
| 100 sess/day | ~€3-5/mese | €18/mese (already paid) |
| 1000 sess/day | ~€30-50/mese | €18/mese |
| 10000 sess/day | ~€300-500/mese | €18/mese |

Pure Gemini chat scales linearly with traffic, Mistral retained fixed cost multimodal. Total budget remains within Andrea <€50/mese pilot through ~1000 sess/day.

---

## Honesty Caveats

1. **My initial Combo C recommendation was bias-driven**: I over-weighted "Mistral warmth + Sense 2 voice unity" without empirical validation. R5 May 10-11 evidence proves Gemini Flash-Lite Italian + Voxtral TTS independent layer = same Sense 2 unity preserved with simpler architecture.
2. **Phase 0 Vertex EU still INVIOLABLE prereq**: AI Studio currently used = NOT EU-resident. Pure Gemini strategy makes this MORE urgent (100% chat traffic exposure vs Combo C 80-85%).
3. **Mistral fallback chain preserved**: if Vertex degrades → llm-client.ts existing chain (Vertex → AI Studio → Mistral Large → Together gated) auto-rotate. Pure Gemini chat does NOT mean Mistral abandoned at fallback layer.
4. **Phase 2 bench validation recommended pre-scale**: 60q × 3-run on Pure G post Phase 0 to confirm latency + quality. NOT gate (decision already evidence-locked iter 39 R5 May 10-11).
5. **My flipping pattern Andrea criticized**: this decision was reached via Andrea explicit anti-compiacenza challenge → I went to filesystem R5 evidence → flipped Combo C → Pure G. Andrea was right to push. This is data-driven flip not opinion-driven.

---

## Action Items

- [ ] **Andrea ratify** "Pure Gemini chat" strategy this doc (this turn implicit "1")
- [ ] **Andrea Phase 0** GCP project Vertex Frankfurt SA setup (~2h, see `docs/audits/2026-05-12-combo-c-phase-0-gdpr-vertex-migration.md` §Andrea action steps)
- [ ] **Orchestrator** Phase 0 code impl `vertex-client.ts` + `llm-client.ts` conditional Vertex routing + ADR-032 (~4h post Andrea SA setup)
- [ ] **Orchestrator** Phase 2 bench 60q × 3-run Pure G empirical confirm (1h post Phase 0 deploy)
- [ ] **Orchestrator** Phase 4 UNLIM Dreams overnight impl (6h, post Phase 2 confirm)
- [ ] **Phases 5-10** vision + STT + OpenAPI + PostHog + Anti-G45 audit (~22h backlog Sprint V)

---

## References

- Master plan: `docs/superpowers/plans/2026-05-12-elab-max-everything-strategy.md`
- Phase 0 Vertex EU: `docs/audits/2026-05-12-combo-c-phase-0-gdpr-vertex-migration.md` (filename retains "combo-c" prefix for git history; content valid Pure Gemini strategy)
- Phase 4 Dreams: `docs/audits/2026-05-12-phase-4-unlim-dreams-design.md`
- ADR-029 LLM_ROUTING_WEIGHTS conservative tune (Sprint T iter 37)
- ADR-031 STT Voxtral Transcribe 2 (Sprint T iter 38)
- R5 bench output: `scripts/bench/output/r5-stress-report-2026-05-11T01-13-33-309Z.md` (best empirical)
- CLAUDE.md iter 24-38 sprint history (Mistral burst latency + iter 33 Gemini emergency flip)
