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

// pdftotext volume text uses curly typographic punctuation; Tea bookText / repo
// titles use straight ASCII. Fold both to ASCII so indexOf() exact-match works.
export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[‘’‚‛`´]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();

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

export function buildAlignmentRecord(id, src = {}) {
  const { lessonPath: lp, teaMapEntry: tm, teaMetaEntry: tmeta, volumeRefEntry: vref, volumeText } = src ?? {};
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
      titleAgree: lp?.title != null && tm?.title != null && norm(lp.title) === norm(tm.title),
      nextIdAgree: (lp?.next_experiment?.id ?? null) != null
        && (tm?.next_id ?? null) != null
        && lp.next_experiment.id === tm.next_id,
      teaBookTextVerified: teaVerbatim.found,
    },
  };
}

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
  const narrativeMap = readJson(join(TEA, 'narrative_map.json'));
  const metadata94 = readJson(join(TEA, 'narrative_metadata_94.json'));
  const teaMap = {};
  for (const volKey of Object.keys(narrativeMap)) {
    const vol = narrativeMap[volKey];
    for (const chKey of Object.keys(vol.chapters || {})) {
      for (const e of vol.chapters[chKey].experiments || []) teaMap[e.id] = e;
    }
  }
  const lpDir = join(REPO, '..', '..', 'packs', 'elab-tutor', 'data', 'lesson-paths');
  const lessonPaths = {};
  for (const f of readdirSync(lpDir).filter((f) => f.endsWith('.json'))) {
    const j = readJson(join(lpDir, f));
    if (j.experiment_id) lessonPaths[j.experiment_id] = j;
  }
  return { narrativeMap, metadata94, teaMap, lessonPaths };
}

async function run() {
  const { metadata94, teaMap, lessonPaths } = main();
  // Literal relative specifier: a non-literal import() breaks vite's SSR parser
  // when vitest imports this module for its named exports. This dynamic import
  // stays lazy — it runs only on direct `node` invocation, never during tests.
  const volumeRefs = (await import('../../../../packs/elab-tutor/data/volume-references.js')).default;
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

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run().catch((e) => { console.error('FATAL', e); process.exit(1); });
}
