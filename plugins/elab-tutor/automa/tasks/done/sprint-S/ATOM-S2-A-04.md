---
id: ATOM-S2-A-04
parent_task: A
sprint: S
iter: 2
assignee: generator-test-opus
depends_on: []
est_hours: 1.5
files_owned:
  - tests/unit/supabase/principio-zero-validator.test.ts
acceptance_criteria:
  - Test file with 12+ unit tests, one per rule + integration tests for severity aggregation
  - Tests use realistic UNLIM response samples (good + violating)
  - Verifies validatePrincipioZero returns correct severity, violations array, and passed boolean
  - 3x re-run consistent
  - Goes RED before A-03 lands, GREEN after
references:
  - ATOM-S2-A-03 implementation contract
---

## Task

Write `tests/unit/supabase/principio-zero-validator.test.ts` with TDD red-green per rule.

## Test scaffolds

```ts
import { describe, it, expect } from 'vitest';
import { validatePrincipioZero } from '../../../supabase/functions/_shared/principio-zero-validator.ts';

describe('validatePrincipioZero', () => {
  describe('R1 max_words', () => {
    it('passes response under 60 words', () => { ... });
    it('flags HIGH violation when over 60 words', () => { ... });
    it('excludes [AZIONE:...] tags from word count', () => { ... });
  });
  describe('R3 no_imperative_teacher', () => {
    it('flags CRITICAL when "fai questo" present', () => { ... });
  });
  describe('R8 unlim_name', () => {
    it('flags CRITICAL when self-reference "Galileo"', () => { ... });
  });
  describe('severity aggregation', () => {
    it('returns CRITICAL when any rule CRITICAL fires', () => { ... });
    it('returns OK when 0 violations', () => { ... });
    it('passed=false when severity HIGH or worse', () => { ... });
  });
  // ... R2, R4, R5, R6, R7, R9, R10, R11, R12
});
```

## CoV

- 3x test PASS
- baseline ≥12498
