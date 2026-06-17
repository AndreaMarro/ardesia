# Audit-1 Completion — Sprint U Cycle 1 Iter 1
**Agent**: Audit-1 (vol1+vol2)
**Timestamp**: 2026-05-01T10:30:00+02:00
**Status**: COMPLETE
**Output**: docs/audits/sprint-u-cycle1-iter1-audit-vol1-vol2.md

## Summary
- Experiments audited: 65 (38 vol1 + 27 vol2)
- Circuit issues: 0 (9 conns=0 are measurement experiments — correct by design)
- Linguaggio violations (score<6): 0
- Descriptive "premi" in unlimPrompts: 3 (low severity — descriptive, not imperative)
- "Ragazzi," opener in unlimPrompts: 0/65 (by design — unlimPrompts are AI context briefs, PZ enforced at inference)
- Missing bookText: 0
- Missing bookInstructions: 0
- Missing lesson-path: 0
- LP singolare violations (teacher_messages): 52/65 — systematic "Premi Play" in OSSERVA phase (fix: "Premete Play")
- LP zero-violation exemplars: 13/65 (v2-cap3/4/5/6/7 predominantly clean)
- Parity score: 10/10 for all 65 experiments

## Top 5 Broken/Flagged Experiments
1. **v2-cap5-esp1** — bookText only 5 words (title only, not descriptive) — enrich from Vol2
2. **v1-cap7-esp5** — thinnest unlimPrompt (47 words, no analogy) in cap7 intermediate
3. **v1-cap7-esp4** — thin prompt (56 words) — enrich with color-mixing analogy
4. **v1-cap13-esp1** — minimal circuit (2 comps/2 conns) + short prompt (45w) — elettropongo chapter, consider prompt enrichment
5. **v1-cap8-esp1** — LP has 3 singolare violations across 3 phases (PREPARA+CHIEDI+OSSERVA) — most LP violations in dataset

## Key Finding
**Systematic fix needed**: "Premi Play" → "Premete Play" in OSSERVA teacher_message across ~50/65 lesson-path JSONs. Regex-fixable, low effort, high PZ V3 compliance impact.

**Vol2 Chapter 11 gap**: No v2-cap11-* experiments or lesson-paths exist. Verify with Davide Fagherazzi whether cap11 needs simulator coverage.
