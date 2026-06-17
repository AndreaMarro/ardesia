---
from: planner-opus
to: generator-app-opus
ts: 2026-04-26T152815
sprint: S-iter-3
priority: P1
blocking: false
---

## Task / Output

Generator-app-opus assigned 2 ATOMs iter 3 (P1 substantial progress):

### ATOM-S3-B1 — Together AI fallback wire-up llm-client.ts
- File ownership: `supabase/functions/_shared/llm-client.ts` + `supabase/functions/_shared/anonymize.ts` (NEW)
- callLLMWithFallback chain: callRunPod → callGemini → callTogether (gated)
- canUseTogether(context, providersDown) gate logic
- Block student runtime SEMPRE (studentMode=true → return false)
- Anonymize heuristic (email regex, phone IT regex, italian name stub)
- Audit log writes via together_audit_log table
- DEPENDS ON: ATOM-S3-C1 (ADR-010 design contract by architect-opus) — start AFTER ADR-010 delivered
- DEPENDS ON: ATOM-S3-B2 (migrations applied by you, sequenza B2 → B1)

### ATOM-S3-B2 — Apply Supabase migrations
- File ownership: `supabase/migrations/2026-04-26_openclaw_tool_memory.sql` + `2026-04-26_together_audit_log.sql`
- openclaw_tool_memory + together_audit_log tables CREATE
- RLS policies open service_role + restricted anon
- Apply via `npx supabase db push --linked --project-ref euqpdueopmlllqjmqnyb`
- Verify via `to_regclass()` SQL query
- BLOCKS: ATOM-S3-B1 (audit log writes need table exist)

## Dependencies

- waits: [ATOM-S3-C1 ADR-010 (architect-opus delivers BEFORE B1 impl)]
- provides: [callLLMWithFallback chain + anonymize + audit log writes (unblocks resilience), migrations applied (unblocks B1 + future OpenClaw cache)]

## Acceptance criteria

- [ ] CoV 3x PASS (vitest ≥12532, build PASS, baseline preserved)
- [ ] file ownership respected (src/ + supabase/ + scripts/openclaw/ only)
- [ ] TDD red-green per ogni nuovo file
- [ ] Edge Function bundle no errors
- [ ] Block guard validation: student_mode=true → callTogether NEVER reached
- [ ] migrations verified applied (to_regclass returns non-NULL)

## Skills consigliate (load via Skill tool)

- superpowers:test-driven-development
- backend-development:feature-development
- supabase:supabase
- agent-teams:team-feature

## File completion message destination

`automa/team-state/messages/generator-app-opus-to-orchestrator-2026-04-26-<HHMMSS>.md`

## Execution order

1. ATOM-S3-B2 (migrations apply) FIRST
2. WAIT for architect-opus ADR-010 delivered (poll `docs/adrs/ADR-010-*.md` exists)
3. ATOM-S3-B1 (wire-up callLLMWithFallback) AFTER ADR-010

## Hard rules

- NO push main, NO merge senza Andrea
- NO --no-verify (pre-commit hook MUST run)
- NO modify src/ if not strictly needed
- DO NOT modify tests/ (gen-test-opus ownership)
- Caveman mode chat replies, code normal language
