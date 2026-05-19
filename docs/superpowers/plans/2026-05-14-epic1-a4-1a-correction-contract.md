# EPIC 1 A4.1a — Correction Contract + Schema-Validation Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the machine-readable correction contract (`a3-corrections.json`) that distills the A3 verdicts into one canonical "what each of the 94 experiments should be", plus a `zod`-backed validation gate that checks every lesson-path against it — the foundation the destructive A4.1b-e steps depend on and the thing that makes them *safe*.

**Architecture:** `a3-corrections.json` is the **contract** (api-contract-sync principle: one canonical source, everything syncs to it). `corrections-schema.mjs` validates the *contract file itself* is well-formed (zod). `validate-lesson-paths.mjs` is the **gate** — it compares every `src/data/lesson-paths/*.json` against its contract entry and emits a divergence report. At A4.1a-time the gate reports RED (the A4.1 work-list); it goes GREEN as A4.1b-e land. Non-destructive: this plan only adds files under `scripts/epic1/`, `tests/unit/epic1/`, `docs/audits/` — zero `src/` mutation.

**Tech Stack:** Node.js ESM (`.mjs`, matches `scripts/epic1/`), `zod` (already a project dependency — verified in package.json), Vitest.

---

## NON COMPIACERE — honest caveats (read before starting)

1. **This is A4.1a only — the foundation.** A4.1b (destructive removal of 13 Vol3 experiments), A4.1c (consolidate/collapse/add), A4.1d (apply per-field fidelity), A4.1e (regenerate narrative_map) are a **gated roadmap** at the end, NOT bite-sized here. Each gets its own plan once A4.1a's contract exists.
2. **`a3-corrections.json` is a transcription from the 3 A3 verdict `.md` files.** Transcription error = error propagated through the entire A4 refactor. Task 2 therefore ends with a mandatory Codex Pattern V cross-check (per `docs/dev/CODEX-WORKFLOW.md`) — the contract is not trusted until Codex independently confirms it matches the verdict tables.
3. **The gate reports RED at A4.1a-time.** That is correct — `validate-lesson-paths.mjs` run at the end of this plan produces the A4.1 work-list (current divergences: ~20 title, ~22 nextId, 13 pending-removal, etc.). It is a diagnostic, not a pass/fail blocker yet. It turns GREEN only after A4.1b-e.
4. **No worktree.** Consistent with A3 — read-mostly, only `scripts/epic1/` + `tests/unit/epic1/` + `docs/audits/`. `tests/unit/epic1/` additions raise the vitest baseline; they do not regress it.
5. **Cap.12 #4/#5 are resolved inside the contract, not deferred.** `a3-corrections.json` for `v2-cap12-esp1` encodes `page: 103` (A3-verified against `vol2.txt`) and `bookFaithfulTitle: "Costruiamo il robot segui luce"` (volume body header — the *parità stretta* rule says the chapter body header is what the chapter IS, over the TOC's "Robot marciante!").
6. **A4.1a does NOT validate the 7-step `steps` block.** No lesson-path has `steps` yet — that is A4.2. The gate validates only what the lesson-paths currently carry (title/chapter/next_experiment) + the `action` (keep/remove/consolidate). A forward `hasSteps: false` field is reported as informational, never a failure.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `scripts/epic1/corrections-schema.mjs` | Create | `zod` schema for `a3-corrections.json` + `validateCorrectionsFile(obj)` — validates the *contract file* is well-formed |
| `scripts/epic1/a3-corrections.json` | Create | THE CONTRACT — 94 entries distilled from the 3 A3 verdict files: per id `{action, bookFaithfulTitle, page, chapter, nextId, consolidateInto?, source, confidence, note?}` |
| `scripts/epic1/validate-lesson-paths.mjs` | Create | `checkLessonPath(lessonPath, correction)` pure fn + `main()` loader/reporter — the GATE comparing each lesson-path to its contract entry |
| `tests/unit/epic1/validate-lesson-paths.test.js` | Create | Vitest unit tests for `validateCorrectionsFile` + `checkLessonPath` |
| `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md` | Create (generated) | Output of `validate-lesson-paths.mjs` — the A4.1 divergence work-list |

`norm` (typographic-folding) is imported from the existing `scripts/epic1/build-alignment-records.mjs` — DRY, do not re-implement it.

---

## Task 1: `corrections-schema.mjs` — zod contract schema (TDD)

**Files:**
- Create: `scripts/epic1/corrections-schema.mjs`
- Test: `tests/unit/epic1/validate-lesson-paths.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/epic1/validate-lesson-paths.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { validateCorrectionsFile, CorrectionEntry } from '../../../scripts/epic1/corrections-schema.mjs';

const VALID_FILE = {
  generatedFrom: ['docs/audits/2026-05-14-epic1-a3-vol1-verdict.md'],
  experiments: {
    'v1-cap6-esp1': {
      action: 'keep', bookFaithfulTitle: 'Accendi il tuo primo LED',
      page: 29, chapter: 6, nextId: 'v1-cap6-esp2',
      source: 'repo', confidence: 'high',
    },
    'v3-cap6-esp6': {
      action: 'remove', bookFaithfulTitle: null, page: null, chapter: null,
      nextId: null, source: 'neither', confidence: 'high',
      note: 'no 6th Ch6 experiment exists in the volume',
    },
  },
};

describe('validateCorrectionsFile', () => {
  it('accepts a well-formed corrections file', () => {
    const r = validateCorrectionsFile(VALID_FILE);
    expect(r.ok).toBe(true);
  });
  it('rejects an unknown action enum', () => {
    const bad = structuredClone(VALID_FILE);
    bad.experiments['v1-cap6-esp1'].action = 'frobnicate';
    const r = validateCorrectionsFile(bad);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/action/i);
  });
  it('rejects a missing required field', () => {
    const bad = structuredClone(VALID_FILE);
    delete bad.experiments['v1-cap6-esp1'].source;
    const r = validateCorrectionsFile(bad);
    expect(r.ok).toBe(false);
  });
  it('CorrectionEntry requires consolidateInto only when action=consolidate', () => {
    const ok = CorrectionEntry.safeParse({
      action: 'consolidate', bookFaithfulTitle: 'x', page: 1, chapter: 1,
      nextId: null, consolidateInto: 'v3-cap6-esp3', source: 'repo', confidence: 'high',
    });
    expect(ok.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run tests/unit/epic1/validate-lesson-paths.test.js`
Expected: FAIL — `Failed to resolve import ".../scripts/epic1/corrections-schema.mjs"`.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/epic1/corrections-schema.mjs`:
```js
#!/usr/bin/env node
/**
 * EPIC 1 / A4.1a — zod schema for a3-corrections.json (the correction contract).
 * Validates the contract FILE is well-formed. Does not touch lesson-paths.
 */
import { z } from 'zod';

export const CorrectionEntry = z.object({
  action: z.enum(['keep', 'correct', 'remove', 'consolidate']),
  bookFaithfulTitle: z.string().nullable(),
  page: z.number().int().positive().nullable(),
  chapter: z.number().int().positive().nullable(),
  nextId: z.string().nullable(),
  consolidateInto: z.string().optional(),
  source: z.enum(['repo', 'tea', 'neither', 'volume']),
  confidence: z.enum(['high', 'medium', 'low']),
  note: z.string().optional(),
});

export const CorrectionsFile = z.object({
  generatedFrom: z.array(z.string()).min(1),
  experiments: z.record(z.string(), CorrectionEntry),
});

export function validateCorrectionsFile(obj) {
  const r = CorrectionsFile.safeParse(obj);
  if (r.success) return { ok: true };
  return { ok: false, error: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run tests/unit/epic1/validate-lesson-paths.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add scripts/epic1/corrections-schema.mjs tests/unit/epic1/validate-lesson-paths.test.js
git commit -m "feat(iter-54): EPIC 1 A4.1a — corrections-schema.mjs zod contract + tests"
```

---

## Task 2: `a3-corrections.json` — the correction contract (data + cross-check)

**Files:**
- Create: `scripts/epic1/a3-corrections.json`

**Source of truth:** the 3 A3 verdict files — `docs/audits/2026-05-14-epic1-a3-vol{1,2,3}-verdict.md`. Each has a per-experiment summary table (`id | book-faithful title | source | page | ...`). Transcribe every row.

- [ ] **Step 1: Create the file skeleton + transcribe all 94 entries**

Create `scripts/epic1/a3-corrections.json`. Shape — one key per experiment id, matching `CorrectionEntry` (Task 1). Transcribe directly from the 3 verdict tables. Field mapping from the verdict tables:
- `action`: `keep` if verdict source is `repo` / `repo (=tea)` and title is book-faithful as-is; `correct` if the lesson-path exists with a real volume counterpart but title/page/chapter/nextId needs changing; `remove` if the verdict row says "neither → no volume counterpart"; `consolidate` for the Vol3 duplicate ids (`v3-cap6-esp3`→`v3-cap6-morse`, `v3-cap6-esp5`→`v3-cap6-semaforo` — keep the named id, consolidate the numbered one into it).
- `bookFaithfulTitle`: the verdict's "book-faithful title" column (`null` for `action: remove`).
- `page`: the verdict's page column (`null` if `n/a` or `action: remove`).
- `chapter`: the integer chapter from the id.
- `nextId`: the canonical next id per the A3 master verdict's "repo nextId chain matches book order" finding — use the repo `next_experiment.id` chain, NOT Tea's.
- `source`: `repo` / `tea` / `neither` / `volume` per the verdict.
- `confidence`: the verdict's confidence column.
- `note`: the verdict's note for `remove`/`medium`-confidence rows.

The 13 `action: remove` ids (Vol3, A3 high-confidence "no volume counterpart"):
`v3-cap6-esp6`, `v3-cap6-esp7`, `v3-cap7-esp4`, `v3-cap7-esp5`, `v3-cap7-esp7`, `v3-cap7-esp8`, `v3-cap7-mini`, `v3-cap8-esp4`, `v3-cap8-esp5`, `v3-cap8-serial`, `v3-extra-lcd-hello`, `v3-extra-servo-sweep`, `v3-extra-simon`.

The 2 `action: consolidate` ids: `v3-cap6-esp3` (`consolidateInto: v3-cap6-morse`), `v3-cap6-esp5` (`consolidateInto: v3-cap6-semaforo`).

Cap.12 explicit values: `v2-cap12-esp1` → `page: 103`, `bookFaithfulTitle: "Costruiamo il robot segui luce"`, `action: correct`.

File header:
```json
{
  "generatedFrom": [
    "docs/audits/2026-05-14-epic1-a3-vol1-verdict.md",
    "docs/audits/2026-05-14-epic1-a3-vol2-verdict.md",
    "docs/audits/2026-05-14-epic1-a3-vol3-verdict.md"
  ],
  "experiments": {
    "v1-cap6-esp1": { "action": "keep", "bookFaithfulTitle": "Accendi il tuo primo LED", "page": 29, "chapter": 6, "nextId": "v1-cap6-esp2", "source": "repo", "confidence": "high" }
  }
}
```
(...continue for all 94 ids — the 3 verdict tables list every one.)

- [ ] **Step 2: Verify it parses against the contract schema + has the right shape**

Run:
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
node -e "
import('./scripts/epic1/corrections-schema.mjs').then(m => {
  const f = require('./scripts/epic1/a3-corrections.json');
  const r = m.validateCorrectionsFile(f);
  if (!r.ok) { console.error('SCHEMA FAIL:', r.error); process.exit(1); }
  const e = f.experiments;
  const ids = Object.keys(e);
  const tally = (a) => ids.filter(id => e[id].action === a).length;
  console.log('total:', ids.length, '| keep:', tally('keep'), '| correct:', tally('correct'), '| remove:', tally('remove'), '| consolidate:', tally('consolidate'));
});
"
```
Expected: parses OK; `total: 94`; `remove: 13`; `consolidate: 2`.
If `total` ≠ 94 or `remove` ≠ 13 or `consolidate` ≠ 2 → a row was missed or mis-actioned; fix against the verdict files before continuing.

- [ ] **Step 3: Codex Pattern V cross-check (MANDATORY — the contract must be independently verified)**

Run (per `docs/dev/CODEX-WORKFLOW.md` Pattern V):
```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
scripts/dev/codex-bg.sh verify-a3-corrections --profile verify \
  "GOAL: verify scripts/epic1/a3-corrections.json faithfully transcribes the 3 A3 verdict files. CONTEXT: @scripts/epic1/a3-corrections.json @docs/audits/2026-05-14-epic1-a3-vol1-verdict.md @docs/audits/2026-05-14-epic1-a3-vol2-verdict.md @docs/audits/2026-05-14-epic1-a3-vol3-verdict.md. CONSTRAINTS: read-only, cite verdict-file:line for any mismatch. DONE: for each of the 94 experiments confirm action/bookFaithfulTitle/page/chapter/nextId matches the verdict table row; report a numbered list of mismatches or 'ALL 94 MATCH'."
cat /tmp/codex-verify-a3-corrections.txt | tail -30
```
Expected: `ALL 94 MATCH`. If Codex reports mismatches → fix `a3-corrections.json` against the verdict files, re-run.

- [ ] **Step 4: Commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add scripts/epic1/a3-corrections.json
git commit -m "feat(iter-54): EPIC 1 A4.1a — a3-corrections.json correction contract (94 experiments, Codex-verified)"
```

---

## Task 3: `checkLessonPath` — the per-experiment gate (TDD)

**Files:**
- Create: `scripts/epic1/validate-lesson-paths.mjs`
- Modify: `tests/unit/epic1/validate-lesson-paths.test.js` (append describe block)

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/epic1/validate-lesson-paths.test.js`:
```js
import { checkLessonPath } from '../../../scripts/epic1/validate-lesson-paths.mjs';

describe('checkLessonPath', () => {
  const correction = {
    action: 'correct', bookFaithfulTitle: 'Accendi il tuo primo LED',
    page: 29, chapter: 6, nextId: 'v1-cap6-esp2', source: 'repo', confidence: 'high',
  };
  it('passes when the lesson-path matches its correction', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED',
      chapter: 6, next_experiment: { id: 'v1-cap6-esp2' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });
  it('flags a title divergence', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'WRONG TITLE',
      chapter: 6, next_experiment: { id: 'v1-cap6-esp2' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('title'))).toBe(true);
  });
  it('flags a nextId and chapter divergence', () => {
    const lp = { experiment_id: 'v1-cap6-esp1', title: 'Accendi il tuo primo LED',
      chapter: 99, next_experiment: { id: 'v1-cap6-esp9' } };
    const r = checkLessonPath('v1-cap6-esp1', lp, correction);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('chapter'))).toBe(true);
    expect(r.issues.some((i) => i.includes('nextId'))).toBe(true);
  });
  it('reports pending-removal when correction.action is remove and the file still exists', () => {
    const lp = { experiment_id: 'v3-cap6-esp6', title: 'whatever' };
    const r = checkLessonPath('v3-cap6-esp6', lp, { action: 'remove', bookFaithfulTitle: null,
      page: null, chapter: null, nextId: null, source: 'neither', confidence: 'high' });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('pending-removal'))).toBe(true);
  });
  it('reports pending-consolidation when action is consolidate', () => {
    const lp = { experiment_id: 'v3-cap6-esp3', title: 'whatever' };
    const r = checkLessonPath('v3-cap6-esp3', lp, { action: 'consolidate', bookFaithfulTitle: null,
      page: null, chapter: null, nextId: null, consolidateInto: 'v3-cap6-morse',
      source: 'repo', confidence: 'high' });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('pending-consolidation') && i.includes('v3-cap6-morse'))).toBe(true);
  });
  it('reports a missing correction entry', () => {
    const lp = { experiment_id: 'v9-cap1-esp1', title: 'orphan' };
    const r = checkLessonPath('v9-cap1-esp1', lp, undefined);
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.includes('no correction entry'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run tests/unit/epic1/validate-lesson-paths.test.js`
Expected: FAIL — `checkLessonPath is not a function`. The 4 Task-1 tests still pass.

- [ ] **Step 3: Write minimal implementation**

Create `scripts/epic1/validate-lesson-paths.mjs`:
```js
#!/usr/bin/env node
/**
 * EPIC 1 / A4.1a — lesson-path validation gate (READ-ONLY).
 *
 * Compares every src/data/lesson-paths/*.json against its a3-corrections.json
 * entry (the correction contract). At A4.1a-time this reports RED — it IS the
 * A4.1 divergence work-list. It turns GREEN as A4.1b-e land.
 *
 * Usage: node scripts/epic1/validate-lesson-paths.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { norm } from './build-alignment-records.mjs';

export function checkLessonPath(id, lessonPath, correction) {
  const issues = [];
  if (!correction) {
    return { id, action: null, ok: false, issues: [`no correction entry for ${id}`] };
  }
  if (correction.action === 'remove') {
    issues.push(`pending-removal: correction.action=remove but lesson-path ${id} still exists`);
  } else if (correction.action === 'consolidate') {
    issues.push(`pending-consolidation: ${id} should be consolidated into ${correction.consolidateInto}`);
  } else {
    // action keep | correct — the lesson-path should match the contract
    if (correction.bookFaithfulTitle != null
        && norm(lessonPath?.title) !== norm(correction.bookFaithfulTitle)) {
      issues.push(`title: "${lessonPath?.title}" != contract "${correction.bookFaithfulTitle}"`);
    }
    if (correction.chapter != null && Number(lessonPath?.chapter) !== Number(correction.chapter)) {
      issues.push(`chapter: ${lessonPath?.chapter} != contract ${correction.chapter}`);
    }
    const lpNext = lessonPath?.next_experiment?.id ?? null;
    if (lpNext !== correction.nextId) {
      issues.push(`nextId: ${lpNext} != contract ${correction.nextId}`);
    }
  }
  return { id, action: correction.action, ok: issues.length === 0, issues };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run tests/unit/epic1/validate-lesson-paths.test.js`
Expected: PASS — 10 tests (4 from Task 1 + 6 new).

- [ ] **Step 5: Commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add scripts/epic1/validate-lesson-paths.mjs tests/unit/epic1/validate-lesson-paths.test.js
git commit -m "feat(iter-54): EPIC 1 A4.1a — checkLessonPath gate pure function + tests"
```

---

## Task 4: `main()` — run the gate, emit the A4.1 work-list

**Files:**
- Modify: `scripts/epic1/validate-lesson-paths.mjs` (append `main()` + guard)
- Create (generated): `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md`

- [ ] **Step 1: Append the loader/reporter**

Append to `scripts/epic1/validate-lesson-paths.mjs`:
```js
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const OUT = join(REPO, 'docs', 'audits', '2026-05-14-epic1-a4-1a-contract-validation.md');

function main() {
  const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
  const corrections = readJson(join(HERE, 'a3-corrections.json')).experiments;
  const lpDir = join(REPO, 'src', 'data', 'lesson-paths');
  const lessonPaths = {};
  for (const f of readdirSync(lpDir).filter((f) => f.endsWith('.json'))) {
    const j = readJson(join(lpDir, f));
    if (j.experiment_id) lessonPaths[j.experiment_id] = j;
  }
  const allIds = [...new Set([...Object.keys(corrections), ...Object.keys(lessonPaths)])].sort();
  const results = allIds.map((id) => checkLessonPath(id, lessonPaths[id] ?? null, corrections[id]));

  const failing = results.filter((r) => !r.ok);
  const byAction = (a) => results.filter((r) => r.action === a);
  const md = `# EPIC 1 A4.1a — contract validation (the A4.1 work-list)

> Generated by \`scripts/epic1/validate-lesson-paths.mjs\` — READ-ONLY.
> RED at A4.1a-time is expected: this IS the divergence work-list for A4.1b-e.

## Summary
| Metric | Value |
|---|---|
| Experiments checked | ${results.length} |
| PASS (already match contract) | ${results.length - failing.length} |
| FAIL (need A4.1b-e work) | ${failing.length} |
| action=keep | ${byAction('keep').length} |
| action=correct | ${byAction('correct').length} |
| action=remove (pending A4.1b) | ${byAction('remove').length} |
| action=consolidate (pending A4.1c) | ${byAction('consolidate').length} |

## Divergences
${failing.map((r) => `### ${r.id} (${r.action ?? 'NO CONTRACT'})\n${r.issues.map((i) => `- ${i}`).join('\n')}`).join('\n\n') || '_(none — contract fully satisfied)_'}
`;
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, md, 'utf8');
  console.log(`✓ ${OUT}`);
  console.log(`  ${results.length} checked · ${results.length - failing.length} pass · ${failing.length} fail`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
```

- [ ] **Step 2: Run the gate**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && node scripts/epic1/validate-lesson-paths.mjs`
Expected: prints `✓ .../2026-05-14-epic1-a4-1a-contract-validation.md` and a summary line. The `fail` count will be high (~40-50) — this is the expected RED diagnostic; it is the A4.1 work-list.

- [ ] **Step 3: Re-run the unit tests (regression check)**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run tests/unit/epic1/validate-lesson-paths.test.js`
Expected: PASS — 10 tests still green (the `import.meta.url` guard means importing the module for tests does not run `main()`).

- [ ] **Step 4: Commit**

```bash
cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
git add scripts/epic1/validate-lesson-paths.mjs docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md
git commit -m "feat(iter-54): EPIC 1 A4.1a — validation gate main() + A4.1 work-list report"
```

---

## Task 5: Pre-flight CoV + close A4.1a

**Files:** verification only.

- [ ] **Step 1: Full vitest**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run --reporter=dot`
Expected: PASS, count ≥ 14353 + 10 (the A4.1a test file). If below baseline → STOP, investigate.

- [ ] **Step 2: Build**

Run: `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build`
Expected: exit 0. (A4.1a added no `src/` files — confirms it.)

- [ ] **Step 3: Present the A4.1a close**

Summarize: the correction contract `a3-corrections.json` exists (94 entries, Codex-verified), the validation gate runs, the A4.1 work-list is at `docs/audits/2026-05-14-epic1-a4-1a-contract-validation.md`. State the work-list counts (correct / remove / consolidate). The gate is the GREEN/RED signal for A4.1b-e.

---

## A4.1b–e Roadmap (GATED — not bite-sized, each gets its own plan after A4.1a)

These depend on `a3-corrections.json` (the contract) + `validate-lesson-paths.mjs` (the gate). Each is decomposed into its own plan when reached; the gate going GREEN is each one's exit criterion.

- **A4.1b — Staged removal (destructive).** Remove the 13 `action: remove` Vol3 experiments. Staged: move to `scripts/epic1/removed-no-volume-counterpart/` + manifest → update `index.js`, `lesson-groups.js`, `chapter-map.js`, the 8 consumers → CoV → commit move → commit delete. Exit: gate shows 0 `pending-removal`.
- **A4.1c — Consolidate + collapse + add.** Consolidate the 2 Vol3 duplicate ids; collapse Vol3 Ch7/Ch8 over-splits to the volume's real block count; add Vol2 Cap.11 "I diodi" lesson-paths. Exit: gate shows 0 `pending-consolidation`; Cap.11 experiments exist.
- **A4.1d — Apply per-field fidelity.** For every `action: correct` experiment, apply the contract's title/chapter/nextId to the lesson-path JSON. Exit: gate shows 0 title/chapter/nextId divergences.
- **A4.1e — Regenerate narrative_map.** Rebuild `narrative_map` / `chapter-map.js` / `lesson-groups.js` from the volumes + the contract (22 correct chapter titles). Exit: alignment-audit chapter-titles = 22/22 confirmed.
- **A4.2 — `steps` authoring.** Separate spec/plan — the 7-step block per experiment.

---

## Self-Review

**1. Spec coverage** (against `docs/specs/2026-05-14-epic1-a4-volume-parity-spec.md`):
- R1 (inventory 1:1) → contract encodes `remove`/`consolidate`/`correct` actions; A4.1b/c execute. A4.1a builds the foundation + gate. ✓ (execution gated to b/c)
- R2 (per-field fidelity) → contract encodes bookFaithfulTitle/page/chapter/nextId; `checkLessonPath` validates; A4.1d applies. ✓
- R3 (regenerate narrative_map) → A4.1e roadmap. ✓ (gated)
- R5 (staged removal) → A4.1b roadmap; contract marks the 13. ✓ (gated)
- R6 (zero regression) → Task 5 CoV. ✓
- Contract-gate / api-contract-sync principle → `a3-corrections.json` is the contract, `validate-lesson-paths.mjs` is the sync gate. ✓ — this IS A4.1a's core deliverable.
- Cap.12 #4/#5 → resolved in the contract (Task 2: page 103, title "Costruiamo il robot segui luce"). ✓

**2. Placeholder scan:** Task 2 Step 1 says "continue for all 94 ids" — this is NOT a placeholder: the 94 ids and their values are fully specified by the 3 named verdict files (the source of truth), the field-mapping rules are explicit, the 13 `remove` ids and 2 `consolidate` ids are listed verbatim, the schema is given in Task 1, and Task 2 Steps 2-3 mechanically verify completeness (count==94, remove==13) + Codex cross-checks every row. The engineer has everything needed. All code steps have complete code.

**3. Type consistency:** `CorrectionEntry` fields (`action, bookFaithfulTitle, page, chapter, nextId, consolidateInto?, source, confidence, note?`) — defined in Task 1, used identically in Task 2's JSON and Task 3's `checkLessonPath` (reads `correction.action`, `.bookFaithfulTitle`, `.chapter`, `.nextId`, `.consolidateInto`). `checkLessonPath(id, lessonPath, correction)` — signature defined in Task 3, called identically in Task 4's `main()`. `norm` imported from `build-alignment-records.mjs` — same function used in A3. ✓

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-14-epic1-a4-1a-correction-contract.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, spec + code-quality review between tasks. Note: Task 2 Step 3 dispatches a Codex Pattern V cross-check — part of the plan, independent of execution mode.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
