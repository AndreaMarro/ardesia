# BROADCAST iter 8 — MORFISMO DUAL SENSE clarification

**From**: orchestrator iter 8
**To**: ALL in-flight + pending agents (gen-app-opus-r2, scribe-opus, future spawns)
**Sent**: 2026-04-27T12:50:00Z mid-iter-8
**Priority**: P0 — apply IMMEDIATELY before next file write

## Andrea clarification message

Morfismo = DUE sensi combinati. Singolo termine, doppio significato che si rinforzano.

### Sense 1 — Tecnico-architetturale

Piattaforma MORFICA + MUTAFORMA. Software adatta runtime per-classe/per-docente/per-kit/per-momento.

Codice morfico OpenClaw "Onnipotenza Morfica v4":
- **L1 composition**: composite handler sequential dispatch sub-tools (`scripts/openclaw/composite-handler.ts`)
- **L2 template**: pre-defined morphic patterns templates
- **L3 flag DEV**: dynamic JS Web Worker sandbox (DEV-ONLY)
- **52 ToolSpec declarative** + composite handler runtime composition

Differenziatore vs static-config competitor (Tinkercad/Wokwi/LabsLand = scripted/configurato).

### Sense 2 — Strategico-competitivo

Coerenza software ↔ kit Omaric ↔ volumi cartacei. Moat 2026+ vs LLM coding democratizzato.

Triplet artefatti fisici originali NON replicabili via prompt LLM. Richiede investimento kit + volumi originali.

### Combinato — DUAL MOAT 2026+

- INTERNO: morfico runtime self-adapting (S1) = differenziatore tecnico
- ESTERNO: triplet coerenza materiale (S2) = differenziatore competitivo
- Doppia barriera entry: tecnica + materiale
- LLM disruption-proof. Nessun competitor puro-software può replicare entrambi.

## Apply by agent (immediate effect)

### gen-app-opus-r2 (🔄 IN-FLIGHT)

**Hybrid RAG retriever (ADR-015 impl)**:
- S1 morfico: filter chunks by `class_key` + experiment context runtime adaptive (per-class memory Supabase) — retrieval cambia forma per-classe
- S2 triplet: ALWAYS preserve `metadata.source` (vol1/vol2/vol3/wiki) + chunk_index + page → UNLIM cita Vol.X pag.Y verbatim
- BM25 italian + dense + RRF k=60 + bge-reranker → output respect both sensi

**ClawBot composite live wire-up**:
- S1: composite handler adatta sequenza sub-tools per-context (highlight + speak + camera vs vision + diagnose + speak)
- S2: NON inventare tool che NON esistono nel kit fisico. Tool dispatcher = forma del kit Omaric

**TTS Isabella WebSocket Deno (ADR-016 impl)**:
- S1: voice pace adatta per-età studente (slow per primaria, normal per secondaria)
- S2: voce italiana naturale (Isabella Neural) = registro narratore volumi cartacei

### scribe-opus (PENDING PHASE 2)

Quando esegui audit + handoff + CLAUDE.md update:
- Aggiungi sezione "Morfismo dual sense applied iter 8"
- Per ogni feature shipped iter 8 (Hybrid RAG, ClawBot composite, TTS WS, Vision E2E, R6 fixture 100): valuta S1+S2 contribution
- Output: tabella feature × S1 × S2 con score 0/0.5/1 per cell
- Honesty caveat se feature NON contribuisce entrambi sensi

### orchestrator PHASE 3 (post scribe)

- Pre-bench check: verify SHIPPED files non violano S1 OR S2
- Post-bench: score 7/7 GREEN check + Morfismo dual conformance check
- Reject criteria pre-merge: feature contribuisce S1? S2? Se entrambi NO → REJECT

## Test reject pre-merge iter 8

```
For each shipped feature iter 8:
  S1_runtime_adaptive = (does feature change behavior per-class/docente/kit?)
  S2_triplet_coerent = (does feature preserve coerenza con kit Omaric + volumi?)
  if not (S1_runtime_adaptive or S2_triplet_coerent):
      REJECT, defer iter 9 enrichment
  if not S1_runtime_adaptive:
      flag iter 9 enrichment S1
  if not S2_triplet_coerent:
      flag iter 9 enrichment S2
```

## Anti-pattern Morfismo iter 8

NON shipping feature che:
- Hard-coded per single classe/docente (viola S1)
- Inventa tool/component che NON esistono nel kit Omaric (viola S2)
- Parafrasa volumi invece citare verbatim (viola S2)
- Static config NON adapt runtime (viola S1)

## Reference docs

- CLAUDE.md §2 MORFISMO (DUE SENSI combinati — duale moat) — already updated 2026-04-27 12:50
- `docs/architectures/pdr-sett5-openclaw-onnipotenza-morfica-v4.md` (Sense 1 architecture)
- `docs/strategy/2026-04-26-master-plan-v2-comprehensive.md` (Sense 2 strategy)
- `automa/state/iter-8-progress.md` (mid-iter update logged)

— orchestrator iter 8, 2026-04-27 12:50 CEST
