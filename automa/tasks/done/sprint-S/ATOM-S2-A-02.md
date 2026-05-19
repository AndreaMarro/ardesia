---
id: ATOM-S2-A-02
parent_task: A
sprint: S
iter: 2
assignee: generator-test-opus
depends_on: []
est_hours: 1.5
files_owned:
  - tests/unit/supabase/capitoli-loader.test.ts
acceptance_criteria:
  - Test file scaffolds 8+ unit tests covering buildCapitoloPromptFragment
  - Covers cases: undefined capitolo, capitolo only, capitolo + esperimento with theory, citazione truncation, figure_refs, transition_text, output max 800 char, returns string never null
  - Uses vitest, no live Supabase/Deno calls
  - PASSES against ATOM-S2-A-01 implementation (run after A-01 lands)
  - 3x re-run consistency (no flakes)
references:
  - ATOM-S2-A-01 (implementation it tests)
  - docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md (acceptance contract)
---

## Task

Write `tests/unit/supabase/capitoli-loader.test.ts` with TDD red-green tests for `buildCapitoloPromptFragment`. RED phase first (write before A-01 lands), then GREEN (verify A-01 passes).

## Test outline

```ts
import { describe, it, expect } from 'vitest';
import { buildCapitoloPromptFragment } from '../../../supabase/functions/_shared/capitoli-loader.ts';

describe('buildCapitoloPromptFragment', () => {
  it('returns empty string if capitolo undefined', () => { ... });
  it('returns capitolo header only if no esperimento', () => { ... });
  it('includes narrativa from theory.testo_classe truncated to 200 char', () => { ... });
  it('formats citazione_volume as «quote» Vol.N pag.X', () => { ... });
  it('truncates final output at 800 char with ellipsis', () => { ... });
  it('handles missing theory gracefully', () => { ... });
  it('formats figure_refs as fig.X.Y captions when present', () => { ... });
  it('appends transition_text when present', () => { ... });
});
```

Use small fixtures, no JSON files. Hard-code Capitolo + Esperimento literals.

## CoV before claim done

- 3x `npx vitest run tests/unit/supabase/capitoli-loader.test.ts` PASS
- `npx vitest run` baseline ≥12498+ PASS
