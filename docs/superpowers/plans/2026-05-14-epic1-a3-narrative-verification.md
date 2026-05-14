# EPIC 1 A3 — Narrative Canon Per-Experiment Verification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** For each of the 94 ELAB experiments, produce a book-faithful canonical verdict by cross-verifying the repo `lesson-paths/` definition against Tea's `narrative_map`/`narrative_metadata_94` against the physical volume text — read-only, no `src/data/` mutation, output is the gate report for EPIC 1 A4.

**Architecture:** Extend the A2 reconciliation codemod into a 3-way alignment builder. For each experiment ID it assembles `{repo claim, Tea claim, volume-text evidence}` into one record — crucially it searches Tea's claimed verbatim `bookText` against the actual extracted volume text (Tea's own fumetti v1→v2 note admits agents previously *invented* bookText, so "Tea said so" is not proof). Three parallel subagents — one per volume — read the alignment records + volume text and assign per-experiment verdicts. A synthesis pass merges them into a master verdict table. ADR-047 is updated with the ratified decisions + A3 findings.

**Tech Stack:** Node.js ESM (`.mjs`, matches `scripts/epic1/reconcile-narrative-canon.mjs`), pre-extracted volume text (`/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol{1,2,3-v0.8.1}.txt`), Vitest for the pure-function logic, Claude subagents for the judgment-heavy verdicts.

---

## NON COMPIACERE — honest caveats (read before starting)

1. **Not a feature, an audit.** Classic TDD (failing test → impl → pass) fits the *script* tasks (Tasks 2-4) cleanly. The *verdict* tasks (Tasks 6-8) are agent orchestration + synthesis — they have clear step lists but no unit tests, because "which definition is book-faithful" is judgment, not code.
2. **No worktree.** The writing-plans skill expects a dedicated worktree from brainstorming. We have neither — A1+A2+Codex-workflow were committed straight to `feat/iter-41-sprint-u-cycle-2-real-user-fix`. A3 writes only to `scripts/epic1/`, `docs/`, and one new `tests/unit/epic1/` file — zero `src/` mutation — so worktree isolation is low-value. Execute on the current branch unless Andrea wants isolation.
3. **A3 touches `tests/`.** Unlike A2, A3 adds `tests/unit/epic1/build-alignment-records.test.js`. Vitest picks it up — this *raises* the baseline (adds passing tests), it does not regress. Pre-commit hook will confirm.
4. **Page numbers are unreliable for extraction.** A2 found `volume-references.js` `bookPage` aligns with Tea `page` (0 mismatch), but PDF page ≠ printed page (front-matter offset), and `volume-references.js` also carries a separate `chapterPage`. So this plan does **verbatim text search**, not page-offset extraction.
5. **`vol3.txt` is stale.** Use `vol3-v0.8.1.txt` (May 2, matches "Manuale VOLUME 3 V0.8.1.pdf"). `vol3.txt` is the Apr 26 extraction of an older PDF — ignore it.
6. **Volume text is NOT vendored into the repo.** It is Davide's raw IP; `volume-references.js` + `rag-chunks.json` already hold chunked excerpts, which is enough for the repo. The A3 script references the `CONTENUTI/` text by absolute path — meaning the audit is reproducible on Andrea's machine but not portable. This is a deliberate trade-off; noted in the script header.
7. **This is multi-hour work.** 94 experiments × 3 sources + 3 subagent passes + synthesis. The plan is complete for A3; do not expect A4-A7 in the same session. A4-A7 is a gated roadmap section, not bite-sized tasks.
8. **claude-mem corpus is stale (~April 28).** mem-search this session returned April-era context, not iter 29-53. The iter 29-53 history lives inline in `CLAUDE.md`. Do not treat mem-search as authoritative for recent state.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `scripts/epic1/build-alignment-records.mjs` | Create | 3-way alignment builder: pure functions `norm`, `findVerbatimInVolume`, `buildAlignmentRecord` + `main()` loader/writer |
| `tests/unit/epic1/build-alignment-records.test.js` | Create | Vitest unit tests for the two pure functions |
| `scripts/epic1/alignment-records.json` | Create (generated) | Output of `main()` — the input the subagents read |
| `docs/audits/2026-05-14-epic1-a3-vol1-verdict.md` | Create (subagent) | Per-experiment verdict, Vol 1 (38 exp) |
| `docs/audits/2026-05-14-epic1-a3-vol2-verdict.md` | Create (subagent) | Per-experiment verdict, Vol 2 (27 exp) |
| `docs/audits/2026-05-14-epic1-a3-vol3-verdict.md` | Create (subagent) | Per-experiment verdict, Vol 3 (29 exp) |
| `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` | Create (synthesis) | Merged master verdict table + chapter_titles verdict + A4 recommendation |
| `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md` | Modify | Append "iter-54 ratified decisions" + "A3 findings" addendum; flip status PROPOSED→ACCEPTED for A1+A2 scope |

The two pure functions live in the same file as `main()` but are exported so the test can import them — one file, one responsibility (build alignment records), small enough to hold in context.

---

## Task 1: Verify volume-text inputs are current

**Files:**
- Read-only check, no file created.

- [ ] **Step 1: Confirm the three volume text files exist and note sizes/dates**

Run:
```bash
ls -la "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/"vol*.txt
```
Expected: `vol1.txt`, `vol2.txt`, `vol3-v0.8.1.txt` present. `vol3.txt` (older, Apr 26) is present too — it will NOT be used.

- [ ] **Step 2: Confirm the page-break / structure of the extracted text**

Run:
```bash
head -c 600 "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol1.txt"; echo; \
grep -c $'\f' "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol1.txt" || echo "no form-feed page breaks"
```
Expected: readable Italian text. Whether or not form-feeds exist does not matter — the script uses verbatim search, not page slicing. This step just confirms the text is real, not garbled OCR.

- [ ] **Step 3: If any volume text is missing or garbled, re-extract**

Only if Step 1/2 fails. Run:
```bash
cd "/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/"
pdftotext "VOL1_ITA_ COMPLETO V.0.1 GP.pdf" vol1.txt
pdftotext "VOL2_ITA_COMPLETO GP V 0.1.pdf" vol2.txt
pdftotext "Manuale VOLUME 3 V0.8.1.pdf" vol3-v0.8.1.txt
```
Expected: three `.txt` files regenerated. If Step 1/2 passed, skip this step.

---

## Task 2: Pure function `findVerbatimInVolume` (TDD)

**Files:**
- Create: `scripts/epic1/build-alignment-records.mjs`
- Test: `tests/unit/epic1/build-alignment-records.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/epic1/build-alignment-records.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { norm, findVerbatimInVolume } from '../../../scripts/epic1/build-alignment-records.mjs';

const SAMPLE_VOLUME = `
Capitolo 6 — Il diodo LED.
Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di:
un LED, una breadboard, una batteria 9V, la clip per la batteria 9V, un resistore da 470 Ohm.
Il LED ha una polarita: la gambetta lunga e l'anodo.
`;

describe('norm', () => {
  it('lowercases and collapses whitespace', () => {
    expect(norm('  Ciao   RAGAZZI \n ')).toBe('ciao ragazzi');
  });
  it('handles null/undefined', () => {
    expect(norm(null)).toBe('');
    expect(norm(undefined)).toBe('');
  });
});

describe('findVerbatimInVolume', () => {
  it('finds a full verbatim claim', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'Per accendere il LED e fare il nostro primo esperimento');
    expect(r.found).toBe(true);
    expect(r.matchType).toBe('full');
    expect(r.context).toContain('breadboard');
  });
  it('falls back to first-8-words prefix match', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'Per accendere il LED e fare il nostro TOTALLY DIFFERENT ENDING');
    expect(r.found).toBe(true);
    expect(r.matchType).toBe('prefix-8w');
  });
  it('returns not-found for absent text', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'questo testo non esiste nel volume affatto');
    expect(r.found).toBe(false);
    expect(r.reason).toBe('not in volume text');
  });
  it('rejects claims shorter than 12 chars', () => {
    const r = findVerbatimInVolume(SAMPLE_VOLUME, 'LED');
    expect(r.found).toBe(false);
    expect(r.reason).toBe('claim too short');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/epic1/build-alignment-records.test.js`
Expected: FAIL — `Failed to resolve import "../../../scripts/epic1/build-alignment-records.mjs"` (file does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `scripts/epic1/build-alignment-records.mjs` with the header + the two pure functions (the `main()` loader is added in Task 4):
```js
#!/usr/bin/env node
/**
 * EPIC 1 / ATOM A3 — Narrative canon per-experiment verification (READ-ONLY).
 *
 * Builds a 3-way alignment record per experiment: repo lesson-path claim vs
 * Tea narrative_map/metadata claim vs verbatim search against the physical
 * volume text. Output: scripts/epic1/alignment-records.json (input for the
 * per-volume subagent verdict pass). Mutates nothing under src/.
 *
 * Volume text is referenced by absolute path (Davide's raw IP — not vendored).
 * Reproducible on Andrea's machine; not portable. See ADR-047.
 *
 * Usage: node scripts/epic1/build-alignment-records.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

export function findVerbatimInVolume(volumeText, claimedText, contextChars = 240) {
  const haystack = norm(volumeText);
  const needle = norm(claimedText);
  if (!needle || needle.length < 12) return { found: false, reason: 'claim too short' };
  let idx = haystack.indexOf(needle);
  if (idx >= 0) {
    return {
      found: true, matchType: 'full',
      context: haystack.slice(Math.max(0, idx - contextChars), idx + needle.length + contextChars),
    };
  }
  const firstWords = needle.split(' ').slice(0, 8).join(' ');
  if (firstWords.length >= 12) {
    idx = haystack.indexOf(firstWords);
    if (idx >= 0) {
      return {
        found: true, matchType: 'prefix-8w',
        context: haystack.slice(Math.max(0, idx - contextChars), idx + contextChars + 400),
      };
    }
  }
  return { found: false, reason: 'not in volume text' };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/epic1/build-alignment-records.test.js`
Expected: PASS — 6 tests (2 `norm` + 4 `findVerbatimInVolume`).

- [ ] **Step 5: Commit**

```bash
git add scripts/epic1/build-alignment-records.mjs tests/unit/epic1/build-alignment-records.test.js
git commit -m "feat(iter-54): EPIC 1 A3 — findVerbatimInVolume pure function + tests"
```

---

## Task 3: Pure function `buildAlignmentRecord` (TDD)

**Files:**
- Modify: `scripts/epic1/build-alignment-records.mjs` (add `buildAlignmentRecord`)
- Modify: `tests/unit/epic1/build-alignment-records.test.js` (add describe block)

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/epic1/build-alignment-records.test.js`:
```js
import { buildAlignmentRecord } from '../../../scripts/epic1/build-alignment-records.mjs';

describe('buildAlignmentRecord', () => {
  const src = {
    lessonPath: {
      title: 'Accendi il tuo primo LED', chapter: 6,
      next_experiment: { id: 'v1-cap6-esp2' },
      components_needed: [{ name: 'LED rosso' }, { name: 'Resistore 470Ω' }],
    },
    teaMapEntry: { title: 'Accendi il tuo primo LED', page: 29, next_id: 'v1-cap6-esp2' },
    teaMetaEntry: { bookText: 'Per accendere il LED e fare il nostro primo esperimento', chapter: 6 },
    volumeRefEntry: { bookPage: 29 },
    volumeText: 'Per accendere il LED e fare il nostro primo esperimento abbiamo bisogno di un LED.',
  };

  it('assembles a 3-way record with agreement flags', () => {
    const r = buildAlignmentRecord('v1-cap6-esp1', src);
    expect(r.id).toBe('v1-cap6-esp1');
    expect(r.flags.titleAgree).toBe(true);
    expect(r.flags.nextIdAgree).toBe(true);
    expect(r.flags.teaBookTextVerified).toBe(true);
    expect(r.repo.components).toEqual(['LED rosso', 'Resistore 470Ω']);
  });

  it('flags title divergence and unverified Tea bookText', () => {
    const diverged = {
      ...src,
      lessonPath: { ...src.lessonPath, title: 'Dimmer LED con potenziometro' },
      teaMetaEntry: { bookText: 'questo testo inventato non e nel volume', chapter: 6 },
    };
    const r = buildAlignmentRecord('v1-cap6-esp1', diverged);
    expect(r.flags.titleAgree).toBe(false);
    expect(r.flags.teaBookTextVerified).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/epic1/build-alignment-records.test.js`
Expected: FAIL — `buildAlignmentRecord is not a function` / import resolves to `undefined`.

- [ ] **Step 3: Write minimal implementation**

Append to `scripts/epic1/build-alignment-records.mjs` (after `findVerbatimInVolume`):
```js
export function buildAlignmentRecord(id, src) {
  const { lessonPath: lp, teaMapEntry: tm, teaMetaEntry: tmeta, volumeRefEntry: vref, volumeText } = src;
  const teaBookText = tmeta?.bookText ?? '';
  const teaVerbatim = findVerbatimInVolume(volumeText, teaBookText);
  const repoTitleHit = findVerbatimInVolume(volumeText, lp?.title ?? '');
  return {
    id,
    repo: {
      title: lp?.title ?? null,
      chapter: lp?.chapter ?? null,
      nextId: lp?.next_experiment?.id ?? null,
      components: (lp?.components_needed ?? []).map((c) => c.name),
    },
    tea: {
      title: tm?.title ?? null,
      page: tm?.page ?? null,
      nextId: tm?.next_id ?? null,
      bookText: teaBookText,
      chapter: tmeta?.chapter ?? null,
    },
    volumeRef: { bookPage: vref?.bookPage ?? null, bookText: vref?.bookText ?? null },
    evidence: {
      teaBookTextInVolume: teaVerbatim,
      repoTitleInVolume: repoTitleHit,
    },
    flags: {
      titleAgree: norm(lp?.title) === norm(tm?.title),
      nextIdAgree: (lp?.next_experiment?.id ?? null) === (tm?.next_id ?? null),
      teaBookTextVerified: teaVerbatim.found,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/epic1/build-alignment-records.test.js`
Expected: PASS — 8 tests total (6 from Task 2 + 2 new).

- [ ] **Step 5: Commit**

```bash
git add scripts/epic1/build-alignment-records.mjs tests/unit/epic1/build-alignment-records.test.js
git commit -m "feat(iter-54): EPIC 1 A3 — buildAlignmentRecord pure function + tests"
```

---

## Task 4: Wire `main()` loader/writer + generate `alignment-records.json`

**Files:**
- Modify: `scripts/epic1/build-alignment-records.mjs` (add `main()`)
- Create (generated): `scripts/epic1/alignment-records.json`

- [ ] **Step 1: Write `main()`**

Append to `scripts/epic1/build-alignment-records.mjs`:
```js
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const TEA = join(HERE, 'tea-canon');
const VOL_DIR = '/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf';
const VOL_TEXT = {
  1: join(VOL_DIR, 'vol1.txt'),
  2: join(VOL_DIR, 'vol2.txt'),
  3: join(VOL_DIR, 'vol3-v0.8.1.txt'),
};
const OUT = join(HERE, 'alignment-records.json');

function main() {
  const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

  // Tea canon
  const narrativeMap = readJson(join(TEA, 'narrative_map.json'));
  const metadata94 = readJson(join(TEA, 'narrative_metadata_94.json'));
  const teaMap = {};
  for (const volKey of Object.keys(narrativeMap)) {
    const vol = narrativeMap[volKey];
    for (const chKey of Object.keys(vol.chapters || {})) {
      for (const e of vol.chapters[chKey].experiments || []) teaMap[e.id] = e;
    }
  }

  // Repo lesson-paths
  const lpDir = join(REPO, 'src', 'data', 'lesson-paths');
  const lessonPaths = {};
  for (const f of readdirSync(lpDir).filter((f) => f.endsWith('.json'))) {
    const j = readJson(join(lpDir, f));
    if (j.experiment_id) lessonPaths[j.experiment_id] = j;
  }

  // volume-references.js (default export, dynamic import done via JSON fallback:
  // read the file is not trivial — instead require the volume-references via a
  // small loader. Simplest robust path: import() the ESM module.)
  // NOTE: top-level await — main() is invoked from an async wrapper below.
  return { narrativeMap, metadata94, teaMap, lessonPaths };
}

async function run() {
  const { metadata94, teaMap, lessonPaths } = main();
  const volumeRefs = (await import(join(REPO, 'src/data/volume-references.js'))).default;
  const volText = {
    1: readFileSync(VOL_TEXT[1], 'utf8'),
    2: readFileSync(VOL_TEXT[2], 'utf8'),
    3: readFileSync(VOL_TEXT[3], 'utf8'),
  };

  const ids = Object.keys(teaMap).sort();
  const records = ids.map((id) => {
    const volNum = Number(id.charAt(1)); // v1-... -> 1
    return buildAlignmentRecord(id, {
      lessonPath: lessonPaths[id] ?? null,
      teaMapEntry: teaMap[id] ?? null,
      teaMetaEntry: metadata94[id] ?? null,
      volumeRefEntry: volumeRefs[id] ?? null,
      volumeText: volText[volNum] ?? '',
    });
  });

  const summary = {
    total: records.length,
    titleAgree: records.filter((r) => r.flags.titleAgree).length,
    nextIdAgree: records.filter((r) => r.flags.nextIdAgree).length,
    teaBookTextVerified: records.filter((r) => r.flags.teaBookTextVerified).length,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, records }, null, 2));
  console.log(`✓ ${OUT}`);
  console.log(`  ${summary.total} records · titleAgree ${summary.titleAgree} · nextIdAgree ${summary.nextIdAgree} · teaBookTextVerified ${summary.teaBookTextVerified}/${summary.total}`);
}

// Only run when invoked directly, not when imported by tests
if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => { console.error('FATAL', e); process.exit(1); });
}
```

- [ ] **Step 2: Run the script**

Run: `node scripts/epic1/build-alignment-records.mjs`
Expected: prints `✓ .../alignment-records.json` and a summary line with `94 records` and a `teaBookTextVerified N/94` count. The N is the key A3 signal — how many of Tea's claimed verbatim bookTexts are actually found in the volumes.

- [ ] **Step 3: Sanity-check the output**

Run:
```bash
node -e "const j=require('./scripts/epic1/alignment-records.json'); console.log('records:', j.records.length); console.log('sample:', JSON.stringify(j.records[0], null, 1).slice(0, 800));"
```
Expected: 94 records; sample record has `repo`, `tea`, `volumeRef`, `evidence`, `flags` keys populated.

- [ ] **Step 4: Re-run the full unit test (regression check)**

Run: `npx vitest run tests/unit/epic1/build-alignment-records.test.js`
Expected: PASS — 8 tests still green (the `import.meta.url` guard means importing the module for tests does NOT run `run()`).

- [ ] **Step 5: Commit**

```bash
git add scripts/epic1/build-alignment-records.mjs scripts/epic1/alignment-records.json
git commit -m "feat(iter-54): EPIC 1 A3 — alignment-records.json generator + 94-record output"
```

---

## Task 5: Pre-flight CoV before the subagent pass

**Files:**
- Read-only verification.

- [ ] **Step 1: Run the full vitest suite**

Run: `npx vitest run --reporter=dot`
Expected: PASS, count `>= 14342 + 8` (the A3 test file adds 8). If the count is below 14342, STOP — something regressed; investigate before continuing.

- [ ] **Step 2: Run the build**

Run: `npm run build`
Expected: exit 0. (A3 added no `src/` files, so the build is unaffected — this confirms it.)

- [ ] **Step 3: Record the numbers**

Write the exact vitest count and build result into the task notes. These are the baseline the subagent pass must preserve. Do not proceed if either is red.

---

## Task 6: Per-volume verdict — 3 parallel subagents

**Files:**
- Create: `docs/audits/2026-05-14-epic1-a3-vol1-verdict.md` (subagent 1)
- Create: `docs/audits/2026-05-14-epic1-a3-vol2-verdict.md` (subagent 2)
- Create: `docs/audits/2026-05-14-epic1-a3-vol3-verdict.md` (subagent 3)

- [ ] **Step 1: Dispatch three subagents in parallel (one message, three Agent calls)**

Use `subagent_type: general-purpose`. Each subagent gets this prompt template, with `{VOL}`, `{VOL_TEXT_PATH}`, `{ID_PREFIX}`, `{OUT_PATH}` substituted:

```
Read-only verification task for the ELAB Tutor project. You verify ONE volume.

INPUTS:
- scripts/epic1/alignment-records.json — filter to records where id starts with "{ID_PREFIX}".
- Volume text: {VOL_TEXT_PATH} — the verbatim extracted text of physical Volume {VOL}.
- src/data/volume-references.js — repo's verbatim book citations, keyed by experiment id.
- scripts/epic1/tea-canon/narrative_map.json — Tea's chapter titles for this volume.

FOR EACH experiment id in this volume, decide the BOOK-FAITHFUL canonical definition:
1. Read the alignment record: repo title/components/nextId, Tea title/page/bookText/nextId,
   and the evidence (teaBookTextInVolume.found, repoTitleInVolume.found, context snippets).
2. Search the volume text yourself (grep / Read with offset) around the experiment's
   topic to confirm what the BOOK actually says — do not trust the repo OR Tea blindly.
3. Verdict per experiment: which TITLE is book-faithful (repo / Tea / neither — propose
   the real one), which PAGE, whether Tea's bookText is genuinely verbatim, and a
   confidence (high / medium / low) with the volume-text evidence quoted.
4. Also verify this volume's CHAPTER TITLES (from narrative_map) against the volume text
   — Tea flagged them as "tea-inferred", unverified. Confirm or correct each.

OUTPUT: write a markdown report to {OUT_PATH} with:
- A summary table: id | book-faithful title | page | tea_bookText_verbatim? | confidence
- A chapter-titles table: chapter | tea-inferred title | volume-text verdict
- A "divergences requiring Andrea decision" section — experiments where repo and Tea
  disagree AND the volume text does not clearly settle it.
- For every "high confidence" verdict, quote the volume-text line that proves it.

Do NOT edit any file except {OUT_PATH}. Do NOT touch src/. Read-only otherwise.
```

Substitutions:
- Subagent 1: `{VOL}=1`, `{ID_PREFIX}=v1-`, `{VOL_TEXT_PATH}=/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol1.txt`, `{OUT_PATH}=docs/audits/2026-05-14-epic1-a3-vol1-verdict.md`
- Subagent 2: `{VOL}=2`, `{ID_PREFIX}=v2-`, `{VOL_TEXT_PATH}=/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol2.txt`, `{OUT_PATH}=docs/audits/2026-05-14-epic1-a3-vol2-verdict.md`
- Subagent 3: `{VOL}=3`, `{ID_PREFIX}=v3-`, `{VOL_TEXT_PATH}=/Users/andreamarro/VOLUME 3/CONTENUTI/volumi-pdf/vol3-v0.8.1.txt`, `{OUT_PATH}=docs/audits/2026-05-14-epic1-a3-vol3-verdict.md`

- [ ] **Step 2: Wait for all three to complete, then verify each output file exists**

Run:
```bash
ls -la docs/audits/2026-05-14-epic1-a3-vol{1,2,3}-verdict.md
```
Expected: three files present. Open each, confirm it has the summary table + chapter-titles table + divergences section. If a subagent returned a stub or a file dump instead of verdicts, re-dispatch that one with a tightened prompt (the failure mode is vague output — demand the tables explicitly).

- [ ] **Step 3: Commit the three verdict files**

```bash
git add docs/audits/2026-05-14-epic1-a3-vol1-verdict.md docs/audits/2026-05-14-epic1-a3-vol2-verdict.md docs/audits/2026-05-14-epic1-a3-vol3-verdict.md
git commit -m "docs(iter-54): EPIC 1 A3 — per-volume book-faithfulness verdicts (94 experiments)"
```

---

## Task 7: Synthesize the master verdict

**Files:**
- Create: `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md`

- [ ] **Step 1: Read all three verdict files**

Read `docs/audits/2026-05-14-epic1-a3-vol{1,2,3}-verdict.md` in full. Do this yourself — do not delegate the synthesis (the writing-plans skill self-review rule applies: synthesis is judgment).

- [ ] **Step 2: Write the master verdict document**

Create `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md` with:
- **Summary counts**: of 94 — how many repo-faithful, how many Tea-faithful, how many neither (need a corrected definition), how many low-confidence / need-Andrea.
- **Master table**: id | book-faithful title | page | canonical nextId | tea_bookText_verbatim? | confidence | source-of-truth (repo/tea/corrected).
- **Chapter-titles master verdict**: all 23 chapter keys, tea-inferred vs volume-verified title.
- **A4 recommendation**: given the verdicts, what A4 actually has to do — quantify it (e.g. "N experiments need full re-definition, M need only title/page correction, K are already faithful and need only the additive `steps` block").
- **Open decisions for Andrea**: every experiment where the volume text did not settle repo-vs-Tea, listed explicitly.

- [ ] **Step 3: Commit**

```bash
git add docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md
git commit -m "docs(iter-54): EPIC 1 A3 — master book-faithfulness verdict + A4 scope quantified"
```

---

## Task 8: Update ADR-047 with ratified decisions + A3 findings

**Files:**
- Modify: `docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md`

- [ ] **Step 1: Append the iter-54 ratified-decisions addendum**

Add a section at the end of ADR-047:
```markdown
## Iter-54 ratified decisions (Andrea, 2026-05-14)

1. **Canonical definition per ID** — not "Tea overrides" nor "repo overrides":
   every experiment is verified against the physical volume text (A3). The
   book-faithful definition wins, per the A3 MASTER verdict.
2. **chapter_titles** — verified against volume text in A3, not accepted as
   tea-inferred and not blocked indefinitely.
3. **Sequencing** — incremental, checkpoint-first: A3 (verification) ships and
   is ratified before A4 (data mutation) starts.
```

- [ ] **Step 2: Append the A3 findings summary**

Add, referencing the master verdict:
```markdown
## A3 findings (see docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md)

[Fill from Task 7 master verdict: the N repo-faithful / M Tea-faithful /
K corrected counts, the chapter-titles verdict, and the quantified A4 scope.]
```
This is NOT a placeholder — fill it with the actual numbers from Task 7's master verdict. If Task 7 is not done, this step cannot be done.

- [ ] **Step 3: Flip status for A1+A2 scope**

Change the ADR frontmatter `status:` line note: A1+A2 are now `ACCEPTED` (delivered + ratified); A3 is `ACCEPTED` (delivered this session); A4-A7 remain `PROPOSED`, gated on Andrea ratifying the A3 master verdict.

- [ ] **Step 4: Commit**

```bash
git add docs/adrs/ADR-047-narrative-arc-canon-tea-schema-adoption.md
git commit -m "docs(iter-54): EPIC 1 A3 — ADR-047 ratified decisions + A3 findings addendum"
```

---

## Task 9: Final checkpoint

**Files:**
- No file created — this is the handoff.

- [ ] **Step 1: Re-run pre-flight CoV one last time**

Run: `npx vitest run --reporter=dot && npm run build`
Expected: vitest `>= 14350`, build exit 0. Quote the exact numbers.

- [ ] **Step 2: Confirm git is clean and list the A3 commits**

Run: `git status --short && git log --oneline -7`
Expected: working tree clean (modulo the auto-regenerating `automa/state/*` files); 6 A3 commits visible (Tasks 2,3,4,6,7,8).

- [ ] **Step 3: Present the checkpoint to Andrea**

Summarize: A3 complete — `alignment-records.json` generated, 94 experiments verified against volume text, master verdict at `docs/audits/2026-05-14-epic1-a3-MASTER-verdict.md`, ADR-047 updated. State the headline counts (repo-faithful / Tea-faithful / corrected / need-Andrea). Then present the gate: A4 (the actual data mutation) does not start until Andrea ratifies the master verdict.

---

## A4–A7 Roadmap (GATED — not bite-sized, do NOT execute without A3 ratification)

These are deliberately NOT decomposed into bite-sized tasks. The A3 master verdict
determines their real scope — decomposing them now would be guessing.

- **A4 — Additive `steps` migration.** Add the Tea 7-step `steps` block to each of the
  94 lesson-paths *alongside* `phases` (ADR-047 D2). Content comes from the A3
  book-faithful verdict + Tea metadata (`bookText`, `success_citation`, `cliffhanger`,
  `analogy`). The `misura` step is new — no `phases` section maps to it; it needs
  authoring per experiment. Scope is quantified by the A3 master verdict, not before.
- **A5 — PZ-V3 validator.** Extend `src/services/principioZeroValidator.js` to the
  12-rule schema gate from `standard_experiment_schema.json` (NOT the comic-rule set —
  the two are distinct, per the iter-54 PDF synthesis). Add conformance tests for all 94.
- **A6 — Modalità Percorso UI.** Chapter-as-narrative-continuum reading view. Touches
  `PercorsoCapitoloView.jsx`, `LessonPathPanel.jsx`. Requires `narrative-arc.js`
  (built in A3-adjacent work or early A4).
- **A7 — Docs.** ADR close, `CLAUDE.md` update, EPIC 1 retrospective.

Each of A4–A7 gets its own bite-sized plan after A3 is ratified.

---

## Self-Review

**1. Spec coverage.** The "spec" here is Andrea's three iter-54 gate answers + the
A2 audit findings. Coverage check:
- "verifica tutto, non omettere" → Tasks 1-7 verify all 94 experiments × 3 sources
  against volume text. ✓
- chapter_titles "fai la cosa migliore / minor debito tecnico" → Task 6 Step 1 point 4
  + Task 7 chapter-titles master verdict verify them in the same pass. ✓
- sequencing "incrementale, checkpoint-first" → Task 9 checkpoint gates A4; A4-A7 is
  roadmap-only, not executed. ✓
- A2's 72 title / 20 next_id divergences → the alignment record carries `titleAgree` /
  `nextIdAgree` flags; the subagent verdict resolves each against the book. ✓

**2. Placeholder scan.** Task 8 Step 2 contains a bracketed fill-in — but it is
explicitly marked "fill with actual numbers from Task 7", and Task 7 produces those
numbers concretely. This is a data dependency, not a placeholder (the content is
defined, its source is named). All code steps have complete code. No "TBD", no "add
error handling", no "similar to Task N".

**3. Type consistency.** `norm` — same signature everywhere. `findVerbatimInVolume`
returns `{found, matchType?, context?, reason?}` — `buildAlignmentRecord` reads
`.found` only. ✓ `buildAlignmentRecord(id, src)` where `src` has keys
`lessonPath / teaMapEntry / teaMetaEntry / volumeRefEntry / volumeText` — the test
fixtures (Task 3) and the `run()` call site (Task 4) use exactly those keys. ✓
The record shape (`repo / tea / volumeRef / evidence / flags`) is identical in the
implementation and the Task 3 assertions. ✓

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-14-epic1-a3-narrative-verification.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration. Note: Task 6 itself dispatches 3 subagents — that is part of the plan, independent of the execution mode.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints for review.

Which approach?
