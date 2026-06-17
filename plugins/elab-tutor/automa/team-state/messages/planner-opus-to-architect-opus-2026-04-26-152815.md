---
from: planner-opus
to: architect-opus
ts: 2026-04-26T152815
sprint: S-iter-3
priority: P2
blocking: false
---

## Task / Output

Architect-opus assigned 2 ATOMs iter 3 (P2 foundation iter 4+):

### ATOM-S3-C1 — ADR-010 Together AI fallback design (~400 righe)
- File path: `docs/adrs/ADR-010-together-ai-fallback-design.md`
- Sections REQUIRED: Status, Context, Decision, Consequences, Alternatives, Implementation Notes, References
- Mermaid: provider chain + gate decision + audit lifecycle
- BLOCKS: ATOM-S3-B1 (gen-app-opus needs design contract before wire-up impl)

### ATOM-S3-C2 — ADR-011 R5 stress fixture 50 prompts design (~400 righe)
- File path: `docs/adrs/ADR-011-r5-stress-fixture-50-prompts-design.md`
- 5 categories × 10 prompts = 50 total
- 12 base PZ rules + 3 R5-specific rules
- Pass threshold ≥90% per category
- Mermaid: fixture distribution + scoring pipeline

## Dependencies

- waits: []
- provides: [ADR-010 design contract (unblocks B1), ADR-011 R5 fixture spec (unblocks iter 5+ R5 expansion)]

## Acceptance criteria

- [ ] CoV 3x PASS (vitest ≥12532, build PASS, baseline preserved)
- [ ] file ownership respected (only docs/adrs/, NO src/ writes)
- [ ] each ADR ≥2000 words (~400 righe target)
- [ ] all required sections present (grep -c "^## " >= 7 per file)
- [ ] mermaid diagrams render valid

## Skills consigliate (load via Skill tool)

- engineering:architecture
- engineering:system-design
- design:design-system
- agent-orchestration:improve-agent

## File completion message destination

`automa/team-state/messages/architect-opus-to-orchestrator-2026-04-26-<HHMMSS>.md`

## Hard rules

- NO src/ writes (read-only su src/)
- NO push main, NO merge senza Andrea
- Caveman mode chat replies, ADR docs normal language (skill rules)
- Each ADR self-contained (paste-ready per future agents)
