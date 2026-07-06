#!/usr/bin/env node
/**
 * EPIC 1 / ATOM A2 — Narrative canon reconciliation audit (READ-ONLY).
 *
 * Cross-diffs the five repo narrative/chapter/experiment data sources against
 * Tea's three canonical files (vendored in ./tea-canon/). Emits a markdown gap
 * report. Mutates nothing under src/.
 *
 * Repo sources:
 *   src/data/lesson-paths/*.json   — 94 per-experiment files (5-phase `phases`)
 *   src/data/capitoli/*.json       — chapter-level grouping + nested experiments
 *   src/data/chapter-map.js        — CHAPTER_MAP display realignment
 *   src/data/lesson-groups.js      — LESSON_GROUPS concept grouping
 *   src/data/volume-references.js  — VOLUME_REFERENCES verbatim citations
 *
 * Tea canon (vendored, ADR-047):
 *   tea-canon/narrative_map.json         — 94-node arc graph
 *   tea-canon/narrative_metadata_94.json — per-experiment metadata
 *   tea-canon/standard_experiment_schema.json — 7-step schema + PZ-V3 gate
 *
 * Usage: node scripts/epic1/reconcile-narrative-canon.mjs
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const TEA = join(HERE, 'tea-canon');
const OUT = join(REPO, 'docs', 'audits', '2026-05-14-epic1-narrative-canon-reconciliation.md');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const warnings = [];
const safe = (label, fn, fallback) => {
  try { return fn(); } catch (e) { warnings.push(`${label}: ${e.message}`); return fallback; }
};

// ── Load Tea canon ────────────────────────────────────────────────────────
const narrativeMap = readJson(join(TEA, 'narrative_map.json'));
const metadata94 = readJson(join(TEA, 'narrative_metadata_94.json'));

// Flatten narrative_map → { id: {title, page, next_id, chapter, volume, esp_num} }
const teaExp = {};
const teaChain = {};
for (const volKey of Object.keys(narrativeMap)) {
  const vol = narrativeMap[volKey];
  for (const chKey of Object.keys(vol.chapters || {})) {
    const ch = vol.chapters[chKey];
    for (const e of ch.experiments || []) {
      teaExp[e.id] = {
        title: e.title, page: e.page, next_id: e.next_id ?? null,
        chapter: ch.chapter_number, volume: vol.volume, esp_num: e.esp_num,
        chapter_title: ch.chapter_title,
      };
      teaChain[e.id] = e.next_id ?? null;
    }
  }
}
const TEA_IDS = Object.keys(teaExp).sort();
const teaCapstones = TEA_IDS.filter((id) => teaChain[id] === null).sort();

// ── Load repo sources ─────────────────────────────────────────────────────
const lpDir = join(REPO, '..', '..', 'packs', 'elab-tutor', 'data', 'lesson-paths');
const lessonPaths = {};
for (const f of readdirSync(lpDir).filter((f) => f.endsWith('.json'))) {
  const j = safe(`lesson-path ${f}`, () => readJson(join(lpDir, f)), null);
  if (j && j.experiment_id) lessonPaths[j.experiment_id] = j;
}

const capDir = join(REPO, 'src', 'data', 'capitoli');
const capitoliExp = {};
for (const f of safe('capitoli dir', () => readdirSync(capDir).filter((f) => f.endsWith('.json')), [])) {
  const j = safe(`capitolo ${f}`, () => readJson(join(capDir, f)), null);
  for (const e of (j?.esperimenti || [])) if (e.id) capitoliExp[e.id] = { ...e, _chapter: j.capitolo, _volume: j.volume };
}

const chapterMap = await safe('chapter-map.js',
  async () => (await import(join(REPO, 'src/data/chapter-map.js'))).CHAPTER_MAP, {});
const lessonGroups = await safe('lesson-groups.js',
  async () => (await import(join(REPO, 'src/data/lesson-groups.js'))).default, {});
const volumeRefs = await safe('volume-references.js',
  async () => (await import(join(REPO, '../../packs/elab-tutor/data/volume-references.js'))).default, {});

// experiment → lesson-group membership
const expInGroup = {};
for (const gid of Object.keys(lessonGroups || {})) {
  for (const eid of (lessonGroups[gid]?.experiments || [])) expInGroup[eid] = gid;
}

// ── Cross-diff ────────────────────────────────────────────────────────────
const rows = [];
const norm = (s) => String(s ?? '').trim().toLowerCase();
for (const id of TEA_IDS) {
  const tea = teaExp[id];
  const meta = metadata94[id];
  const lp = lessonPaths[id];
  const cap = capitoliExp[id];
  const vref = volumeRefs[id];

  const lpNext = lp?.next_experiment?.id ?? null;
  const vrefPage = vref?.bookPage ?? null;

  rows.push({
    id,
    inLP: !!lp, inCap: !!cap, inVref: !!vref, inMeta: !!meta, inGroup: !!expInGroup[id],
    titleMatch: lp ? norm(lp.title) === norm(tea.title) : null,
    lpTitle: lp?.title ?? null, teaTitle: tea.title,
    chapterMatch: lp ? Number(lp.chapter) === Number(tea.chapter) : null,
    lpChapter: lp?.chapter ?? null, teaChapter: tea.chapter,
    nextMatch: lp ? (lpNext === tea.next_id) : null,
    lpNext, teaNext: tea.next_id,
    pageMatch: vrefPage != null ? Number(vrefPage) === Number(tea.page) : null,
    vrefPage, teaPage: tea.page,
    hasSteps: lp ? !!lp.steps : null,
    hasDurationMin: lp ? (lp.metadata?.duration_min != null || lp.duration_min != null) : null,
    hasDurationMinutes: lp ? lp.duration_minutes != null : null,
    isCapstone: tea.next_id === null,
  });
}

// IDs present in a repo source but NOT in Tea's canonical 94
const extraLP = Object.keys(lessonPaths).filter((id) => !teaExp[id]).sort();
const extraCap = Object.keys(capitoliExp).filter((id) => !teaExp[id]).sort();
const extraVref = Object.keys(volumeRefs).filter((id) => !teaExp[id]).sort();

const count = (pred) => rows.filter(pred).length;
const titleMismatch = rows.filter((r) => r.inLP && r.titleMatch === false);
const chapterMismatch = rows.filter((r) => r.inLP && r.chapterMatch === false);
const nextMismatch = rows.filter((r) => r.inLP && r.nextMatch === false);
const pageMismatch = rows.filter((r) => r.pageMatch === false);
const missingLP = rows.filter((r) => !r.inLP);
const missingVref = rows.filter((r) => !r.inVref);
const missingMeta = rows.filter((r) => !r.inMeta);
const missingGroup = rows.filter((r) => !r.inGroup);

// ── Emit report ───────────────────────────────────────────────────────────
const tbl = (arr, cols, fmt) =>
  arr.length === 0 ? '_(nessuno)_\n'
  : `| ${cols.join(' | ')} |\n| ${cols.map(() => '---').join(' | ')} |\n${arr.map(fmt).join('\n')}\n`;

const md = `# EPIC 1 / A2 — Narrative canon reconciliation audit

> Generato da \`scripts/epic1/reconcile-narrative-canon.mjs\` — READ-ONLY, nessuna mutazione \`src/\`.
> Data: 2026-05-14 · ADR: ADR-047 · Iter 54.

## Sintesi

| Metrica | Valore |
|---|---|
| ID canonici Tea (narrative_map) | **${TEA_IDS.length}** |
| Presenti in \`lesson-paths/\` | ${count((r) => r.inLP)} / ${TEA_IDS.length} |
| Presenti in \`capitoli/\` | ${count((r) => r.inCap)} / ${TEA_IDS.length} |
| Presenti in \`volume-references.js\` | ${count((r) => r.inVref)} / ${TEA_IDS.length} |
| Presenti in \`narrative_metadata_94\` | ${count((r) => r.inMeta)} / ${TEA_IDS.length} |
| In un \`LESSON_GROUP\` | ${count((r) => r.inGroup)} / ${TEA_IDS.length} |
| Title mismatch (lesson-path ↔ Tea) | ${titleMismatch.length} |
| Chapter mismatch | ${chapterMismatch.length} |
| **next_id chain mismatch** | **${nextMismatch.length}** |
| Page mismatch (volume-references ↔ Tea) | ${pageMismatch.length} |
| Lesson-path con blocco \`steps\` 7-step | ${count((r) => r.hasSteps === true)} / ${TEA_IDS.length} |
| Lesson-path con \`duration_min\` (R12 PZ-V3) | ${count((r) => r.hasDurationMin === true)} / ${TEA_IDS.length} |
| Capstone canonici (next_id=null) | ${teaCapstones.length} |
| ID extra in \`lesson-paths/\` non in Tea | ${extraLP.length} |
| ID extra in \`capitoli/\` non in Tea | ${extraCap.length} |
| ID extra in \`volume-references\` non in Tea | ${extraVref.length} |

${warnings.length ? `> ⚠️ Warning caricamento sorgenti:\n${warnings.map((w) => `> - ${w}`).join('\n')}\n` : ''}
## Gap 1 — Schema 7-step non adottato

Nessun lesson-path ha il blocco \`steps\` canonico Tea (setup/ipotesi/costruzione/misura/variazione/conclusione/trasferimento). Tutti usano ancora \`phases\` 5-fasi. Migrazione **additiva** (ADR-047 D2) richiesta su tutti i ${TEA_IDS.length}.
\`duration_min\` (prerequisito regola PZ-V3 R12) assente su ${count((r) => r.hasDurationMin !== true)} file — presente \`duration_minutes\` su ${count((r) => r.hasDurationMinutes === true)}, da rimappare.

## Gap 2 — next_id chain mismatch (Morfismo Sense 2 core)

${tbl(nextMismatch, ['id', 'lesson-path next_experiment.id', 'Tea next_id'], (r) => `| ${r.id} | ${r.lpNext ?? '_(null)_'} | ${r.teaNext ?? '_(null)_'} |`)}

## Gap 3 — Title mismatch

${tbl(titleMismatch, ['id', 'lesson-path title', 'Tea title'], (r) => `| ${r.id} | ${r.lpTitle} | ${r.teaTitle} |`)}

## Gap 4 — Chapter mismatch

${tbl(chapterMismatch, ['id', 'lesson-path chapter', 'Tea chapter'], (r) => `| ${r.id} | ${r.lpChapter} | ${r.teaChapter} |`)}

## Gap 5 — Page mismatch (volume-references ↔ Tea narrative_map)

${tbl(pageMismatch, ['id', 'volume-references bookPage', 'Tea page'], (r) => `| ${r.id} | ${r.vrefPage} | ${r.teaPage} |`)}

## Gap 6 — Copertura mancante

**Assenti da \`lesson-paths/\`:** ${missingLP.length ? missingLP.map((r) => r.id).join(', ') : '_(nessuno)_'}

**Assenti da \`volume-references.js\`** (blocca citazione verbatim PZ-V3 R4): ${missingVref.length ? missingVref.map((r) => r.id).join(', ') : '_(nessuno)_'}

**Assenti da \`narrative_metadata_94\`:** ${missingMeta.length ? missingMeta.map((r) => r.id).join(', ') : '_(nessuno)_'}

**Non in alcun \`LESSON_GROUP\`:** ${missingGroup.length ? missingGroup.map((r) => r.id).join(', ') : '_(nessuno)_'}

## Gap 7 — ID extra (presenti nel repo, NON nei 94 canonici Tea)

**lesson-paths/:** ${extraLP.length ? extraLP.join(', ') : '_(nessuno)_'}
**capitoli/:** ${extraCap.length ? extraCap.join(', ') : '_(nessuno)_'}
**volume-references.js:** ${extraVref.length ? extraVref.join(', ') : '_(nessuno)_'}

## Capstone canonici (next_id=null) — ${teaCapstones.length}

${teaCapstones.map((id) => `- \`${id}\``).join('\n')}

> Questi richiedono \`is_capstone=true\` + step \`trasferimento\` con \`next_experiment_id=null\` + overlay celebrativo UI invece del banner cliffhanger.

## Tabella completa per-esperimento

| id | LP | Cap | Vref | Meta | Grp | title✓ | chap✓ | next✓ | page✓ | steps | capstone |
|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.inLP ? '✓' : '✗'} | ${r.inCap ? '✓' : '✗'} | ${r.inVref ? '✓' : '✗'} | ${r.inMeta ? '✓' : '✗'} | ${r.inGroup ? '✓' : '✗'} | ${r.titleMatch === null ? '–' : r.titleMatch ? '✓' : '✗'} | ${r.chapterMatch === null ? '–' : r.chapterMatch ? '✓' : '✗'} | ${r.nextMatch === null ? '–' : r.nextMatch ? '✓' : '✗'} | ${r.pageMatch === null ? '–' : r.pageMatch ? '✓' : '✗'} | ${r.hasSteps ? '✓' : '✗'} | ${r.isCapstone ? '✓' : ''} |`).join('\n')}

---
_ADR-047 · EPIC 1 A2 · gate: Andrea ratifica questo report prima di A3-A7._
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, md, 'utf8');
console.log(`✓ Report scritto: ${OUT}`);
console.log(`  ${TEA_IDS.length} ID canonici · ${nextMismatch.length} next_id mismatch · ${titleMismatch.length} title mismatch · ${pageMismatch.length} page mismatch · ${missingLP.length} assenti da lesson-paths`);
if (warnings.length) console.log(`  ⚠️ ${warnings.length} warning caricamento — vedi report`);
