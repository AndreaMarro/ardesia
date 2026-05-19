---
id: ATOM-S3-C2
parent_task: C2
sprint: S
iter: 3
priority: P2
assigned_to: architect-opus
depends_on: []
provides:
  - docs/adrs/ADR-011-r5-stress-fixture-50-prompts-design.md (~400 righe)
  - fixture spec for Sprint R5 expansion (R0 10 prompts → R5 50 prompts)
est_hours: 3.0
files_owned:
  - docs/adrs/ADR-011-r5-stress-fixture-50-prompts-design.md
acceptance_criteria:
  - ADR file `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-design.md` ~400 righe
  - Sections REQUIRED: Status, Context, Decision, Consequences, Alternatives Considered, Fixture Categories, Scoring Strategy
  - Context: R0 10 prompts insufficient for ≥90% PASS gate, need stress test diversity
  - Decision: 50 prompts breakdown by category (10 base, 10 deep-question, 10 off-topic, 10 safety-warning, 10 edge-case)
  - Fixture Categories: per-category prompt examples (3 each = 15 example prompts)
  - Scoring Strategy: 12 PZ rules from score-unlim-quality.mjs + new R5-specific rules (consistency_across_runs, response_diversity)
  - Pass threshold: ≥90% per category + ≥85% per individual rule
  - Implementation Notes: file path `scripts/bench/workloads/sprint-r5-unlim-quality-fixtures.jsonl`, runner extension `scripts/bench/run-sprint-r5-edge.mjs`, scoring extension
  - Cross-references: scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl (R0 baseline reuse), ATOM-S3-A1 (R0 re-run)
  - Mermaid diagram: fixture distribution + scoring pipeline
  - CoV: file exists + word count >2000 + all required sections
  - NO src/ writes (architect-opus read-only su src/)
references:
  - scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl (10 prompts R0 base)
  - scripts/bench/score-unlim-quality.mjs (12 PZ rules scorer)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §2.5 box 9 (R5 ≥90% target)
---

## Task

ADR-011 R5 stress fixture 50 prompts design ~400 righe. Spec per Sprint R5 expansion (iter 5+).

## Implementation outline

Sections:
1. Status: Proposed (Sprint S iter 3) → Accepted post review
2. Context: R0 baseline 75.81% on 10 prompts insufficient, need 50 prompts diverse stress
3. Decision: 50 prompts × 5 categories (10 each)
4. Fixture Categories:
   - Base (10): typical lesson questions Vol 1-3
   - Deep-question (10): "spiegami in profondità", "perché succede"
   - Off-topic (10): non-electronics queries (gentle redirect)
   - Safety-warning (10): high-voltage, dangerous configurations
   - Edge-case (10): empty input, super-long, mixed languages
5. Scoring Strategy: 12 base PZ + 3 R5-specific (consistency_across_3_runs, response_diversity, no_hallucination_kit_components)
6. Pass threshold definitions per-category + overall
7. Implementation Notes: file paths, runner script, score script extension
8. Mermaid: fixture distribution + scoring pipeline diagrams
9. Alternatives: 100 prompts (rejected: cost/time), 25 prompts (rejected: low coverage), human eval only (rejected: not reproducible)
10. References + cross-links

## CoV before claim done

- File exists `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-design.md`
- Word count >2000
- All 7+ required sections present
- 15 example prompts present (3 per category)
- Mermaid diagrams render valid
- 3x `npx vitest run` ≥12532 PASS preserved (no test changes)
- `npm run build` PASS exit 0
