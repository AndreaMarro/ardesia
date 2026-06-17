---
id: ATOM-S2-A-07
parent_task: A
sprint: S
iter: 2
assignee: generator-test-opus
depends_on:
  - ATOM-S2-A-06
est_hours: 2
files_owned:
  - tests/integration/unlim-chat-prompt-v3.test.ts
acceptance_criteria:
  - Integration test scaffolded with 6+ scenarios: capitolo hit/miss, PZ violation CRITICAL/OK, strict mode 422 vs lenient mode header, backward compat (no experimentContext), audit log call mock verify
  - Mocks LLM client, getCapitoloByExperimentId, Supabase audit log writer
  - 3x re-run consistent
  - Marked WAIT until A-06 lands (depends_on enforced)
references:
  - ATOM-S2-A-06 wire-up
---

## Task

Write `tests/integration/unlim-chat-prompt-v3.test.ts` covering wire-up paths.

## Scenarios

1. capitolo found + PZ OK → response includes capitolo fragment in system prompt + X-PZ-Severity header OK
2. capitolo not found → fragment empty + system prompt unchanged backward compat
3. PZ CRITICAL violation + strict=false → response 200 with X-PZ-Severity CRITICAL header + audit log called
4. PZ CRITICAL violation + strict=true → response 422 with violations array
5. PZ OK + capitolo found → audit log NOT called
6. validatePrincipioZero throws → response 200 fallback with header X-PZ-Severity unknown (resilience)

## Mocking strategy

```ts
import { vi } from 'vitest';
vi.mock('../../supabase/functions/_shared/llm-client.ts');
vi.mock('../../supabase/functions/_shared/capitoli-loader.ts');
// validatePrincipioZero used REAL (we want it tested integrated)
```

## CoV

- 3x PASS
- baseline ≥12498
