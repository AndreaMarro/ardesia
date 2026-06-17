---
id: ATOM-S3-B3
parent_task: B3
sprint: S
iter: 3
priority: P1
assigned_to: generator-test-opus
depends_on: []
provides:
  - tests/integration/wiki-retriever.test.js (NEW E2E offline test)
  - test count delta +1 file, +N tests in baseline-tests.txt
est_hours: 2.5
files_owned:
  - tests/integration/wiki-retriever.test.js
acceptance_criteria:
  - Test file `tests/integration/wiki-retriever.test.js` NEW
  - Loads corpus from `docs/unlim-wiki/concepts/` (real markdown files no mocks)
  - Uses `scripts/wiki-corpus-loader.mjs` (existing) + `scripts/wiki-query-core.mjs` `makeRetriever(corpus)`
  - 5+ test cases: retrieve "led" → match `led-*.md`, retrieve "ohm" → match `ohm.md`, retrieve "delay" → match `delay-millis.md`, retrieve unknown → empty result, retrieve plural form → match singular
  - Each test asserts: result.concept_name kebab-case, result.body contains keyword, result.score > threshold
  - All tests PASS via `npx vitest run tests/integration/wiki-retriever.test.js`
  - Baseline updates ≥12533 (or higher post test add)
  - CoV 3x `npx vitest run` PASS preserved (no regression)
  - `npm run build` PASS exit 0
references:
  - scripts/wiki-corpus-loader.mjs (existing markdown+frontmatter reader)
  - scripts/wiki-query-core.mjs (existing makeRetriever scaffold)
  - tests/unit/wiki/wiki-concepts.test.js (Q4 SCHEMA validator)
  - docs/unlim-wiki/concepts/*.md (real corpus 59+ files)
---

## Task

E2E offline integration test: corpus → retriever → semantic match concept. Verifica wiki retriever functional su 59+ concept locali.

## Implementation outline

```js
// tests/integration/wiki-retriever.test.js
import { describe, it, expect } from 'vitest';
import { loadWikiCorpus } from '../../scripts/wiki-corpus-loader.mjs';
import { makeRetriever } from '../../scripts/wiki-query-core.mjs';
import path from 'path';

describe('Wiki retriever offline integration', () => {
  let retriever;

  beforeAll(async () => {
    const corpusDir = path.resolve(__dirname, '../../docs/unlim-wiki/concepts');
    const corpus = await loadWikiCorpus(corpusDir);
    retriever = makeRetriever(corpus);
  });

  it('retrieves led concept by keyword', () => {
    const results = retriever.query('led');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].concept_name).toMatch(/led/);
  });

  // 4+ more test cases
});
```

## CoV before claim done

- 3x `npx vitest run tests/integration/wiki-retriever.test.js` PASS
- 3x `npx vitest run` ≥12533 PASS (baseline +1+ tests)
- `npm run build` PASS exit 0
- Pre-commit hook auto-update `automa/baseline-tests.txt`
