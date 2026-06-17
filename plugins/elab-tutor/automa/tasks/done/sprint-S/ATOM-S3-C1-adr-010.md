---
id: ATOM-S3-C1
parent_task: C1
sprint: S
iter: 3
priority: P2
assigned_to: architect-opus
depends_on: []
provides:
  - docs/adrs/ADR-010-together-ai-fallback-design.md (~400 righe)
  - design contract for ATOM-S3-B1 implementation
est_hours: 3.0
files_owned:
  - docs/adrs/ADR-010-together-ai-fallback-design.md
acceptance_criteria:
  - ADR file `docs/adrs/ADR-010-together-ai-fallback-design.md` ~400 righe
  - Sections REQUIRED: Status, Context, Decision, Consequences, Alternatives Considered, Implementation Notes
  - Context section: GDPR EU constraints, student safety, US provider risk, audit obligations
  - Decision section: callLLMWithFallback chain order, canUseTogether gate logic, anonymization heuristic, audit log requirements
  - Diagrams (mermaid): provider chain flow, gate decision tree, audit log lifecycle
  - Alternatives: pure-EU only (rejected: no fallback when EU down), Together always (rejected: GDPR violations students), pure-Gemini (rejected: single point failure)
  - Implementation Notes: env vars (TOGETHER_API_KEY), schema together_audit_log, block guard student_mode, 2+ providers down trigger
  - Cross-references: ATOM-S3-B1 (impl), ATOM-S3-B2 (migration), scripts/openclaw/together-teacher-mode.ts (existing scaffold)
  - CoV: file exists + word count >2000 + all required sections present
  - NO src/ writes (architect-opus read-only su src/)
references:
  - docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md (template format iter 2)
  - docs/adrs/ADR-009-principio-zero-validator-middleware.md (template format iter 2)
  - scripts/openclaw/together-teacher-mode.ts (existing scaffold reuse)
  - docs/pdr/PDR-SPRINT-S-ITER-3-RALPH-LOOP-5-AGENT-OPUS-2026-04-27.md §5 (architecture spec)
---

## Task

ADR-010 Together AI fallback design ~400 righe. Definisce contract per ATOM-S3-B1 wire-up.

## Implementation outline

Sections:
1. Status: Proposed (Sprint S iter 3) → Accepted post review
2. Context: 5 paragraphs (GDPR, student safety, US risk, EU providers landscape, audit obligation)
3. Decision: chain order + gate logic + anonymization + audit
4. Consequences: positive (resilience, cost-effective fallback) + negative (complexity, audit overhead) + neutral (env var management)
5. Alternatives: 4+ alternatives evaluated rejected
6. Implementation Notes: env vars, schema, block guard, 2-providers trigger
7. Mermaid diagrams: provider chain, gate decision, audit lifecycle
8. References + cross-links

## CoV before claim done

- File exists `docs/adrs/ADR-010-together-ai-fallback-design.md`
- Word count >2000 (~400 righe target)
- All 7 required sections present (`grep -c "^## " ADR-010` >= 7)
- Mermaid diagrams render valid (3+)
- 3x `npx vitest run` ≥12532 PASS preserved (no test changes)
- `npm run build` PASS exit 0
