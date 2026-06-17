# ADR-028 — Iter 23 Stack Architecture Decision

**Date**: 2026-04-29
**Author**: architect-opus iter 23
**Tone**: caveman terse — onesto, no inflation

---

## 1. Status

**PROPOSED** — decided iter 23 (2026-04-29). Andrea ratify pending iter 24.

Supersedes nothing yet. Consolidates ADR-023/024 progress + introduces V2 stack.

---

## 2. Context — what changed iter 22-23

Iter 22-23 fire many things. Track:

- **License gate fix** (`WelcomePage.jsx`): ELAB2026 hardcoded gate had bypass leak preview-only env. Closed via env conditional iter 22 (commit `111e4c1`). Prod gate now intact.
- **Mac Mini V2 task queue dispatcher** (commits `005b75e` + `49ccba8`): autonomous loop pid 93383+ live, dispatches background tasks (D1 ClawBot expand, D2 vol-pag regression, D3 telemetry).
- **Tea Glossario 180 termini LIVE prod**: Onniscenza Layer 7 closed. Supabase `wiki_concepts` populated 180 rows + `rag_chunks` 180 embeddings BGE-M3 dim 1024 wiki source. Sequential HF Inference API (3 RPM tolerated).
- **Vol/pag VERBATIM rule UNLIM Edge Fn** (commit `fdb97d9`): 5/5 prod conformance — Vol.1 cap.2 Ohm, Vol.1 cap.3 resistore, Vol.1 cap.4 breadboard, Vol.1 cap.6 LED, Vol.3 cap.7 PWM. Was 0/3 iter 21.
- **RunPod V2 vLLM bootstrap** (pod `pj0t1rh0l3d8mw` RUNNING RTX A6000 $0.49/hr): 8-service stack in flight (Llama 3.1 8B AWQ + Qwen2.5-VL 7B + BGE-M3 + Whisper Turbo + Coqui XTTS-v2 IT + FLUX.1 Schnell + ClawBot dispatcher + control plane).
- **Vol3 ground truth corrected**: re-audit V2 (`automa/state/VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md`, 504 LOC) → Vol3 = **0.92** (NOT 0.55 as iter 21 claimed wrong). Morfismo Sense 2 corrected score = **0.764/1.0** (Vol3 0.92 / Vol2 0.78 / Vol1 0.85). Davide Vol3 V0.9 NOT a blocker.

---

## 3. Decision

Stack iter 23+ consolidated below. Three pillars: Onniscenza, Onnipotenza, LLM/Voice/Vision/Embed.

### 3.1 Onniscenza 7-layer (PRODUCTION LIVE)

Layers feed UNLIM Edge Fn pre-execute context. All 7 closed iter 22-23.

| # | Layer | Source | Status |
|---|-------|--------|--------|
| 1 | RAG chunks | Supabase pgvector — 1881 chunks volumi (Vol1+2+3) | LIVE |
| 2 | Wiki concepts | Wiki Tea Glossario 180 termini (iter 22 ingest) | LIVE |
| 3 | Class memory | Supabase per-classe sessioni storiche | LIVE |
| 4 | Lesson active | Lesson context current step + circuitContext | LIVE |
| 5 | Chat history | 10-turn rolling window (Edge Fn memory) | LIVE |
| 6 | Analogia graph | concept-graph + curriculumData mapping | LIVE |
| 7 | Glossario Tea | 180 termini wiki source dim 1024 BGE-M3 — NEW iter 22 | LIVE |

Cross-ref: ADR-023 onniscenza completa.

### 3.2 Onnipotenza ClawBot (IN-PROGRESS)

- 52 ToolSpec OpenClaw current (registry V2 3-layer).
- Target **80 L2 templates** iter 24-25 (Mac Mini D1 background task).
- Composite handler runtime active (commit `592ea3a` iter 20).
- `onniscenza-bridge.ts` pre-execute integration planned iter 22-25 (partial).

Gap: 28 templates. Mac Mini dispatcher autoexpand.

Cross-ref: ADR-024 onnipotenza ClawBot.

### 3.3 LLM stack — production routing

| Tier | Provider | Routing % | Status |
|------|----------|-----------|--------|
| Primary | Gemini Flash + Flash-Lite + Pro | 70/25/5 | LIVE |
| Fallback | Together Llama 3.3 70B Turbo | reserve | configured iter 21, NOT primary yet |
| Self-host | RunPod V2 Llama 3.1 8B AWQ | bench | iter 23 bootstrap in flight |

Switch Gemini → Llama 3.3 70B Together pending evidence iter 24+.

### 3.4 Voice stack

- **TTS**: Coqui XTTS-v2 IT voice clone (RunPod V2)
- **STT**: Whisper Turbo IT (RunPod V2)
- **Wake-word**: "Ehi UNLIM" (planned iter 25)

### 3.5 Vision stack

- **VLM**: Qwen2.5-VL 7B Instruct (RunPod V2) — fototessuta circuiti, debugger visivo
- **Image gen**: FLUX.1 Schnell (RunPod V2) — schemi/diagrammi inline esperimenti

### 3.6 Embeddings

| Tier | Provider | Use |
|------|----------|-----|
| Primary | BGE-M3 self-host RunPod V2 | dim 1024, prod target |
| Paid fallback | Voyage-3 | free tier 3 RPM blocking |
| Free fallback | HuggingFace Inference API BGE-M3 | sequential (180 termini OK) |

### 3.7 Migration target

- **Iter 23-26**: RunPod V2 sandbox bench (8 service stack)
- **Iter 27-30**: Scaleway production replicate (post bench winner only)

NO direct Scaleway commit until bench evidence.

---

## 4. Consequences

| Status | Item |
|--------|------|
| OK | Onniscenza Layer 7 closed (Tea Glossario LIVE 180 termini) |
| OK | Vol/pag verbatim conformance prod **5/5** (was 0/3 iter 21) |
| OK | Mac Mini autonomous productive (V2 task queue working pid 93383+) |
| OK | License gate hardened (preview-only env conditional) |
| OK | Vol3 ground truth corrected — Davide NOT blocker |
| MID | Onnipotenza ClawBot **52/80** templates — 28 gap iter 24 expand |
| MID | RunPod V2 8 services bench TBD iter 23 (loading models) |
| MID | onniscenza-bridge.ts pre-execute partial integration |
| MID | Scaleway migration deferred iter 27+ |

No regressions identified iter 22-23.

---

## 5. Alternatives considered

**A. Stay 100% Together API Llama 3.3 70B (no self-host)**
- Rejected: cost scales linear. $7-10/mo @ 1k classes ok, but $400/mo+ @ 50k classes prohibitive.
- Margin UNLIM €20/classe/mese requires self-host >10k classes.

**B. Direct Scaleway prod (skip RunPod sandbox)**
- Rejected: experiment cost on Scaleway commit > sandbox cost.
- Sandbox $0.49/hr pause-able vs Scaleway monthly commit.

**C. RunPod V2 production (skip Scaleway)**
- Partial reject: spot pods can't resume (kill = lose state).
- Need on-demand pricing prod stability — not RunPod's strength.

**Chosen: hybrid** — RunPod sandbox iter 23-26, Scaleway prod iter 27+ (post bench winner).

---

## 6. ADR cross-references

| ADR | Status | Note |
|-----|--------|------|
| ADR-009 | LIVE | Principio Zero validator V3 |
| ADR-019 | LIVE | Sense 1.5 Morfismo runtime |
| ADR-023 | LIVE | Onniscenza completa 7-layer (this consolidates Layer 7 LIVE) |
| ADR-024 | IN-PROGRESS | Onnipotenza ClawBot — 52/80 |
| ADR-025 | PROPOSED | Modalità 4 simplification |
| ADR-026 | PROPOSED | Content safety guard 10 rules |
| ADR-027 | DEPRECATED-Vol3 | Volumi narrative refactor — V2 ground truth corrects Vol3, NOT broken |

---

## 7. Andrea ratify queue (8 voci pending)

Order = priority. Andrea decide iter 24 mattina:

1. **ADR-025** modalità 4 simplification
2. **ADR-026** content safety guard 10 rules
3. **ADR-027** Volumi narrative refactor (revised — Vol3 NOT blocker, scope reduced)
4. **ADR-028** (this ADR — stack consolidato)
5. **UNLIM main LLM Gemini → Llama 3.3 70B Together** (post iter 24 bench evidence required)
6. **Mistral PAYG signup** (fallback chain — secondary fallback Together)
7. **Tea co-founder equity 25%** (legal pending)
8. **Scaleway signup + credit** (iter 27 pre-prep)

---

## 8. Test plan iter 23-26

| Iter | Tests | Target |
|------|-------|--------|
| 23 | vol-pag regression 30 prompts + harness REAL pilot **5 esperimenti** | conformance ≥4/5 |
| 24 | persona simulation 5 utenti + harness REAL **87 esperimenti** full | sense2 ≥0.85 |
| 25 | voice command + simulator Arduino+Scratch perfetti | latenza <2s, simulatore parità Tinkercad |
| 26 | stress 1000+ test prod regression + competitor analysis | regression 0, competitor matrix close |

---

## 9. Score progression target — onesto

| Iter | Score target | Rationale |
|------|--------------|-----------|
| 23 close | **7.5–8.0/10** | 5 P0 progress + Vol/pag 5/5 + Tea Layer 7 LIVE |
| 24 close | 8.0-8.3 | 80 templates + bench evidence + persona pass |
| 25 close | 8.3-8.7 | voice live + simulator parity Tinkercad |
| 26 close | 8.7-9.1 | stress pass + competitor matrix |
| 30 close | **9.5+/10** | Sprint T close — production scale ready |

Honest. NO inflation auto-claim. Verify Opus indipendente iter 26+.

---

## 10. Risk + mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| RunPod V2 bootstrap fail (torch/Coqui pip dep hell) | Med | Med | iter 22 fix patches applied + retry logged + fallback to single-service degrade |
| Vercel preview deploy not ready harness | Med | Low | Andrea browser smoke test + fallback static spec |
| Davide schedule slip Vol3 V0.9 | **LOW** (was HIGH iter 21 wrong) | Low | Re-audit V2 corrects — Vol3 0.92 NOT blocker |
| Inflation score self-claim re-emerges | Med | High | Opus indipendente verify iter 26+ + harness REAL evidence required |
| Mac Mini V2 dispatcher hang | Low | Med | pid monitor + auto-restart + Telegram alert Andrea |
| Tea Glossario embed drift | Low | Low | nightly re-embed cron + integrity check dim 1024 |
| Scaleway price shock iter 27 | Med | Med | bench winner iter 26 → cost project before commit |

---

## Appendix — commit fingerprint iter 22-23

- `111e4c1` — license gate preview-only env conditional
- `005b75e` + `49ccba8` — Mac Mini V2 task queue dispatcher
- `fdb97d9` — Vol/pag VERBATIM rule UNLIM Edge Fn
- `592ea3a` (iter 20) — composite handler runtime
- HEAD `bwbi40vq6` — post re-audit V2 + Tea ingest

---

**Decision recorded. Andrea ratify pending iter 24.**

caveman done. fire good. stack consolidate.
