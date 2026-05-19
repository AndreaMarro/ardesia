---
id: ATOM-S2-A-03
parent_task: A
sprint: S
iter: 2
assignee: generator-app-opus
depends_on: []
est_hours: 2
files_owned:
  - supabase/functions/_shared/principio-zero-validator.ts
acceptance_criteria:
  - File created with exported function validatePrincipioZero(response, opts?)
  - Returns ValidationResult { violations: Violation[], severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'OK', score: 0-100 }
  - Implements 12 rules ported from scripts/bench/score-unlim-quality.mjs (sintesi%, plurale%, citation_format, max_words<=60, age_appropriate vocab, NO imperative-to-teacher, etc.)
  - severity = CRITICAL if any rule with severity:CRITICAL fires (e.g. imperative-to-teacher), else HIGH if 2+ HIGH, etc.
  - Pure function (no IO), Deno-runtime safe (no Node-only APIs)
  - Each rule has: id, description, severity, regex_or_predicate, suggestion
  - JSDoc + @example
references:
  - scripts/bench/score-unlim-quality.mjs (12 PZ rules source)
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §3.1 PRINCIPIO ZERO v3.1
  - docs/adrs/ADR-009-principio-zero-validator-middleware.md (architect-opus delivers parallel)
---

## Task

Create `supabase/functions/_shared/principio-zero-validator.ts` implementing 12 PZ enforcement rules as pure validator. Used post-LLM in unlim-chat to detect Principio Zero violations BEFORE returning to client.

## Rules to port (from score-unlim-quality.mjs)

1. R1 max_words: response word count ≤ 60 (excluding [AZIONE:...] tags) — HIGH
2. R2 plurale_classe: contains "ragazzi|vediamo|provate|guardate" or class plural — MEDIUM
3. R3 no_imperative_teacher: NOT contains "fai|prendi|collega tu" addressed to docente — CRITICAL
4. R4 citation_format: if contains Vol.N reference, must match /Vol\.\d+ pag\.\d+/ — MEDIUM
5. R5 age_appropriate: NOT contains universitarian terms (impedenza, transconduttanza, semiconduzione_intrinseca) — HIGH
6. R6 no_emoji_replacement: NOT use emoji as icon (use [AZIONE:...] tags) — LOW
7. R7 no_3_consecutive_quotes: NOT 3+ frasi consecutive da libro (heuristic) — HIGH
8. R8 unlim_name: NOT call self "Galileo" anywhere — CRITICAL
9. R9 has_concrete: contains at least 1 noun-verb concrete (not abstract only) — MEDIUM
10. R10 single_concept: NOT introduce >1 concept per response — MEDIUM
11. R11 no_password_leak: NOT mention class_key or admin password — CRITICAL
12. R12 italian_only: detected language IT (not EN/ES sliding) — LOW

(Adjust rule list to match actual `score-unlim-quality.mjs`. Read it first.)

## Output shape

```ts
export interface Violation {
  rule_id: string;
  severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW';
  description: string;
  matched_text?: string;
  suggestion: string;
}

export interface ValidationResult {
  violations: Violation[];
  severity: 'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'|'OK';
  score: number;  // 0-100
  passed: boolean; // true if severity === 'OK' || severity === 'LOW'
}

export function validatePrincipioZero(response: string, opts?: { strict?: boolean }): ValidationResult
```

## CoV before claim done

- 3x `npx vitest run tests/unit/supabase/principio-zero-validator.test.ts` PASS (scaffold ATOM-S2-A-04)
- baseline ≥12498 preserved
- npm run build PASS
