---
from: planner-opus
to: architect-opus
sprint: S
iter: 12
timestamp: 2026-04-28T04:35:18+02:00
atoms_assigned: [ATOM-S12-A5]
adrs_to_ship: [ADR-019, ADR-020, ADR-021]
phase: PHASE-1-PARALLEL
file_ownership: docs/adrs/* exclusive
read_only: src/, tests/, supabase/, scripts/
contract_ref: docs/pdr/sprint-S-iter-12-contract.md
---

# DISPATCH planner-opus → architect-opus — iter 12

## Scope

3 ADR new docs in `docs/adrs/`:

### ADR-019 — Sense 1.5 Morfismo runtime adattabilità docente/classe (~600 LOC)
File: `docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md`

**Mandate**: codify Sense 1.5 estensione iter 10 (CLAUDE.md "MORFISMO" section subsection B + C) come architettura runtime adattiva multi-dimensionale.

**Required sections**:
1. **Status**: Proposed iter 12.
2. **Context**: Sense 1 tecnico-architetturale + Sense 2 strategico-competitivo già consolidati iter 5-8. Sense 1.5 NEW dimension iter 10 estensione: per-docente + per-classe + per-UI/funzioni runtime adapt. NON "preferenze utente generiche" → MORFISMO automatico apprendimento.
3. **Decision**: 3 sotto-Sense (A docente, B classe, C UI/funzioni) MUST be encoded in:
   - `unlim_sessions` Supabase memoria docente (style detection + chapter coverage)
   - `student_progress` cross-session classe context
   - Frontend morphic component dimensions (LIM 1080p vs 4K + touch vs mouse vs voice + mode active)
   - Edge Function `unlim-chat` system prompt enrichment con teacher_style + class_age + active_mode
4. **Consequences**: positive (true differentiator vs Tinkercad/Wokwi/LabsLand static-config) + negative (Supabase memoria growth + complexity inference engine).
5. **Test Morfismo S1.5**: stesso esperimento aperto da 2 docenti diversi su stessa LIM = layout/funzioni/finestre adattate identità + storia ciascuno (NOT preferences toggle).
6. **Implementation roadmap iter 13+**: Box 1 redefine ADR-020 dependency + memoria docente schema migration + frontend dimensions adapt hooks.
7. **References**: CLAUDE.md MORFISMO subsection B+C iter 10 estensione, .impeccable.md design context users primario/secondario/terziario.

### ADR-020 — Box 1 redefine prep "VPS GPU strategic decommission = success" (~300 LOC)
File: `docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md`

**Mandate**: prep document iter 13 Andrea ratify decision Box 1 redefinition. Status PROPOSED, awaiting Andrea ratification iter 13.

**Required sections**:
1. **Status**: Proposed iter 12, awaiting Andrea ratification iter 13.
2. **Context**: Iter 5 P3 Path A confirmed (RunPod TERMINATED). Stack cloud-only iter 5+ verified production-stable (R5 91.80% + R6 96.54% iter 8 PHASE 3 LIVE). Box 1 score 0.4 iter 11 reflects "VPS GPU paid storage MA ZERO production runtime use" (CLAUDE.md iter 5 P2 honest recalibration).
3. **Decision proposal**: redefine Box 1 success criteria from "VPS GPU runtime live" → "VPS GPU strategic decommission with cloud equivalent stable production runtime". Score 1.0 if criteria (a) Together + Gemini + Voyage cloud stack production-stable + (b) cost discipline maintained + (c) no production workload requires GPU local.
4. **Andrea decision required iter 13**:
   - Path A confirm: ratify decommission permanent → Box 1 = 1.0
   - Path B reject: resume RunPod for specific workload → Box 1 stays 0.4 until live
5. **Consequences**: positive (intellectual honesty + score reflects reality) + negative (admit VPS GPU NOT critical path → may impact future investor narrative).
6. **References**: CLAUDE.md iter 5 P3 Andrea Path A decision, PDR §1.1 Box 1 row, PDR §5.4 Sprint T VPS GPU 3-path.

### ADR-021 — Box 3 redefine prep "RAG 1881 chunks full Vol1+2+3+wiki coverage" (~300 LOC)
File: `docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md`

**Mandate**: prep document iter 13 Andrea ratify decision Box 3 redefinition. Status PROPOSED.

**Required sections**:
1. **Status**: Proposed iter 12, awaiting Andrea ratification iter 13.
2. **Context**: Iter 7 RAG ingest LIVE 1881 chunks (vol1 203 + vol2 292 + vol3 198 + 100 wiki + delta). Box 3 score 0.7 iter 11 reflects "1881 < 6000 target". MA: 1881 covers full Vol1+Vol2+Vol3 + 100 wiki = NO content gap. Target 6000 was estimate pre-ingest based on chunk size assumption.
3. **Decision proposal**: redefine Box 3 success criteria from "6000 chunks count" → "Full Vol1+Vol2+Vol3+wiki content coverage measured by per-chapter retrieval diversity". Score 1.0 if criteria (a) all 92 esperimenti reachable RAG query + (b) all wiki concepts cited in retrieval + (c) recall@5 ≥0.55 measured (Box 6 dependency).
4. **Andrea decision required iter 13**:
   - Path A confirm: ratify coverage-first metric → Box 3 = 1.0
   - Path B reject: ingest delta to 6000 (~$2 Voyage cloud + 50min) → Box 3 stays 0.7 until 6000 reached
5. **Consequences**: positive (intellectual honesty + measurable coverage) + negative (admit 6000 was arbitrary estimate).
6. **References**: CLAUDE.md iter 7 close RAG ingest 1881 chunks LIVE, PDR §1.1 Box 3 row, iter 11 P0 4 root causes audit (Voyage key + wfts + OR fallback).

## Effort

ADR-019 ~1h (foundation Sense 1.5) + ADR-020 ~30min (prep) + ADR-021 ~30min (prep) = ~2h.

## CoV

- ZERO code touched. ADR docs only.
- Verify referenced files exist filesystem before citing in ADR (`ls -la <path>`).
- Cross-link ADR-019 ↔ CLAUDE.md MORFISMO subsection B+C verbatim.
- ADR-020 + ADR-021 explicit "Andrea decision required iter 13" callout (NO autonomous Box redefine).
- 3× re-read each ADR before completion msg.

## Output

Completion msg: `automa/team-state/messages/architect-opus-iter12-to-orchestrator-2026-04-28-<HHMMSS>.md` con YAML frontmatter:
```yaml
from: architect-opus
to: orchestrator
sprint: S
iter: 12
timestamp: 2026-04-28T<HH:MM:SS>+02:00
atoms_completed: [ATOM-S12-A5]
files_shipped:
  - docs/adrs/ADR-019-sense-1.5-morfismo-runtime-docente-classe.md (LOC: <wc -l>)
  - docs/adrs/ADR-020-box-1-vps-gpu-strategic-decommission-prep.md (LOC: <wc -l>)
  - docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md (LOC: <wc -l>)
cov:
  vitest_pass: <n> (read baseline-tests.txt)
  build_status: NA (no code touched)
  baseline_delta: 0
phase_complete: PHASE-1
```

GO.

— planner-opus, 2026-04-28 04:35:18 CEST.
