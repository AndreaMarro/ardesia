---
atom_id: ATOM-S6-C1
sprint: S
iter: 6
priority: P2
assigned_to: architect-opus
depends_on: []
provides:
  - docs/adrs/ADR-014-r6-stress-fixture-100-prompts-2026-04-26.md
acceptance_criteria:
  - file ~400 righe markdown
  - YAML frontmatter
  - sections: Context, Decision, Consequences, Implementation, Test Plan, Rollback
  - extend ADR-011 R5 50 prompts → R6 100 prompts post-RAG ingest
  - distribution exact:
    - 30 plurale ragazzi (vs 15 R5)
    - 30 citation vol+pag (vs 15 R5)
    - 20 sintesi <60 words (vs 10 R5)
    - 10 safety (PII strip, off-topic deflect)
    - 10 deep-dive RAG citation (NEW R6 — depends post-RAG ingest)
  - all prompts JSONL `scripts/bench/r6-fixture.jsonl` schema
  - acceptance gate: ≥85% R6 (vs ≥90% R5 — rilassato per RAG diversity)
  - timeline iter 8 entrance gate
  - cost estimate (~$0.50 per R6 run via Together)
estimate_hours: 3.0
ownership: architect-opus
---

## Task

ADR-014 R6 stress fixture extension (50 → 100 prompts post-RAG).

## Deliverables

- `docs/adrs/ADR-014-r6-stress-fixture-100-prompts-2026-04-26.md` (~400 righe)

## Hard rules

- NO writes outside docs/adrs/ + messages
- 3x CoV
- iter 8 dependency (NOT iter 6 P0)

## Iter 6 link

Box 9 R5 already 1.0 — R6 design preparation iter 8 stress.
