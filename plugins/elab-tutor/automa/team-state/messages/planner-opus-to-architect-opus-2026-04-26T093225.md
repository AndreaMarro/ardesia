---
from: planner-opus
to: architect-opus
ts: 2026-04-26T093225
sprint: S
iter: 2
priority: P1
blocking: false
---

## Task E (Sprint S iter 2 architect deliverables)

Two ADRs to write in parallel with generator-app-opus implementation work. ADRs guide implementation contracts.

### ADR-008 — buildCapitoloPromptFragment design

**File**: `docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md`
**Estimate**: 1-1.5h

**Scope**:
- Decision: how Capitolo schema (Sprint Q1.A) gets compressed into prompt fragment
- Format choice: plain text vs JSON vs structured XML-like (recommend plain text, low token cost, LLM-friendly)
- Inclusion priority: titolo → narrativa esp. attivo → 1 citazione_volume preferita → 1 figure_ref → transition_text (max 800 char total budget)
- Truncation strategy: per-field cap + final hard cap with ellipsis
- Empty graceful: returns '' when no capitolo (callable site decides whether to inject)
- When to call: every UNLIM chat invocation if experimentContext.id present (cheap, deterministic, cacheable)
- Token budget rationale: BASE_PROMPT ~1500 char + capitolo ~800 char + dynamic context ~2000 char = ~4300 char system prompt — leaves room for chat history
- Integration point: `unlim-chat/index.ts` line ~234, before buildSystemPrompt call
- Future extension: hook for L2 Wiki concept embedding (Sprint R3)

### ADR-009 — Principio Zero Validator middleware

**File**: `docs/adrs/ADR-009-principio-zero-validator-middleware.md`
**Estimate**: 1-1.5h

**Scope**:
- Decision: post-LLM validation as middleware vs pre-LLM constraint vs both
- Recommendation: post-LLM check is sufficient (constraint already in prompt), middleware audits + flags violations
- Severity gate: CRITICAL = log + optional reject (env flag SUPABASE_PZ_STRICT), HIGH = log + warn header, MEDIUM/LOW = header only
- Reject vs append-warning trade-off: reject = strict but UX hostile (422 on edge cases); append-warning = LLM may auto-correct (future)
- Recommendation iter 2: log all + header X-PZ-Severity, reject ONLY if SUPABASE_PZ_STRICT=true (default false in iter 2, true in iter 5+ post R5 baseline)
- Audit log strategy: reuse `together_audit_log` table with source='principio_zero_violation' (no new migration this iter)
- 12 rules ported from scripts/bench/score-unlim-quality.mjs — single source of truth for PZ scoring + runtime enforcement
- Future: extract rules to YAML config (Sprint R3+) for non-code edits
- Performance: pure regex/predicate, <5ms per response, no LLM call in validator

## File ownership reminder (RIGID)

You may modify ONLY:
- docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md (NEW)
- docs/adrs/ADR-009-principio-zero-validator-middleware.md (NEW)
- (Optionally) docs/architectures/ if you want to update STACK-V3-DEFINITIVE-2026-04-26.md with Sprint S iter 2 wire-up reflection — coordinate with scribe-opus first

DO NOT TOUCH:
- src/, supabase/, scripts/, tests/, automa/, CLAUDE.md
- docs/audits/ (scribe-opus owns)

## Dependencies

- None (write in parallel with implementation)
- Architect ADR PRECEDES gen-app implementation if you finish first (gen-app reads ADR for design rationale)
- If gen-app starts before ADR ready: gen-app uses atomic task acceptance criteria as contract; ADR is post-hoc rationale doc

## Reference reading

- Sprint S iter 2 contract: `automa/team-state/sprint-contracts/sprint-S-iter-2-contract.md`
- Master plan v2 §4.3-§4.5 (UNLIM intelligence design + RAG)
- Master plan v2 §3.1 PRINCIPIO ZERO v3.1
- Existing ADR template: glob `docs/adrs/ADR-007-*.md`
- score-unlim-quality.mjs (rules source)

## CoV (architect-opus)

- ADR markdown well-formed, links valid
- No external commitments (architect is read-only on code)
- Cross-reference ADR-008 in ADR-009 if interaction

## Output expected

When both ADRs done: write completion message to `automa/team-state/messages/architect-opus-to-planner-opus-<TS>.md` with file paths + 3-line summary each.

Massima onesta zero compiacenza.
