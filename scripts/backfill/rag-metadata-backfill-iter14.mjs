#!/usr/bin/env node
// ELAB Iter 14 P0 — RAG Metadata Backfill DRAFT (Path A: substring match)
//
// PURPOSE: Backfill chapter + page + section_title in rag_chunks for the ~1881
//          rows where these fields are 100% NULL (root cause iter 13 B2 stall).
//
// SAFETY:
//   - DEFAULT MODE: --dry-run (writes SQL to file, NO Supabase write)
//   - --commit MODE requires explicit flag + ANDREA_RATIFY=1 env var
//   - Reversible: run scripts/backfill/rag-metadata-rollback-iter14.mjs (TODO future)
//
// USAGE:
//   # DRY (default):
//   node scripts/backfill/rag-metadata-backfill-iter14.mjs --dry-run
//
//   # COMMIT (requires ratify):
//   ANDREA_RATIFY=1 SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill/rag-metadata-backfill-iter14.mjs --commit
//
// REQUIRES env (commit mode only):
//   SUPABASE_URL              (default: euqpdueopmlllqjmqnyb)
//   SUPABASE_SERVICE_ROLE_KEY (NOT in repo — Andrea injects)
//   ANDREA_RATIFY=1           (binary safety gate)
//
// OUTPUT:
//   scripts/backfill/output/dry-run-iter14-{ts}.sql   (DRY)
//   scripts/backfill/output/commit-result-iter14-{ts}.json   (COMMIT)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fuzzyMatchChunkToLesson, scoreMatch } from './match-chunks-to-lessons.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

// ─────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const ANDREA_RATIFY = process.env.ANDREA_RATIFY === '1';

const ARGS = process.argv.slice(2);
const MODE_DRY = ARGS.includes('--dry-run') || (!ARGS.includes('--commit'));
const MODE_COMMIT = ARGS.includes('--commit');
const VERBOSE = ARGS.includes('--verbose');

const MIN_MATCH_SCORE = 0.55;   // below this → skip (NULL stays NULL)
const BATCH_SIZE = 50;          // UPDATE in batches via REST PATCH
const OUTPUT_DIR = path.join(__dirname, 'output');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────
// SAFETY GATES
// ─────────────────────────────────────────────────
if (MODE_COMMIT) {
  if (!ANDREA_RATIFY) {
    console.error('FATAL: --commit requires ANDREA_RATIFY=1 env var');
    console.error('       Run --dry-run first, Andrea reviews output, then re-run with ratify.');
    process.exit(2);
  }
  if (!SUPABASE_KEY) {
    console.error('FATAL: --commit requires SUPABASE_SERVICE_ROLE_KEY env var');
    process.exit(2);
  }
  console.warn('=== COMMIT MODE ENABLED ===');
  console.warn('Andrea ratify gate passed. Will write to PROD Supabase rag_chunks.');
  console.warn('Press Ctrl+C in next 5s to abort...');
  await new Promise(r => setTimeout(r, 5000));
}

// ─────────────────────────────────────────────────
// LOAD volume-references.js mapping
// ─────────────────────────────────────────────────
async function loadVolumeReferences() {
  const refPath = path.join(REPO_ROOT, 'src', 'data', 'volume-references.js');
  if (!fs.existsSync(refPath)) {
    throw new Error(`volume-references.js not found: ${refPath}`);
  }
  const mod = await import(`file://${refPath}`);
  // file uses `const VOLUME_REFERENCES = {...}` then `export default VOLUME_REFERENCES`
  const refs = mod.default || mod.VOLUME_REFERENCES;
  if (!refs) throw new Error('VOLUME_REFERENCES export not found');
  console.log(`[load] ${Object.keys(refs).length} lesson-paths loaded`);
  return refs;
}

// ─────────────────────────────────────────────────
// FETCH NULL-chapter rag_chunks (paginated)
// ─────────────────────────────────────────────────
async function fetchNullChunks() {
  if (!SUPABASE_KEY && MODE_COMMIT) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY required for fetch');
  }

  if (MODE_DRY && !SUPABASE_KEY) {
    // DRY without key: read sample fixture if available
    const fixturePath = path.join(__dirname, 'fixtures', 'rag-chunks-null-sample.json');
    if (fs.existsSync(fixturePath)) {
      const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
      console.log(`[fetch] DRY-without-key: loaded ${data.length} fixture chunks`);
      return data;
    }
    console.warn('[fetch] DRY mode: no SUPABASE_SERVICE_ROLE_KEY + no fixture → returning empty.');
    console.warn('        For real DRY-run preview Andrea must provide read-only key.');
    return [];
  }

  const url = `${SUPABASE_URL}/rest/v1/rag_chunks?chapter=is.null&select=id,source,content_raw&limit=2000`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Fetch ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  console.log(`[fetch] ${data.length} chunks with chapter IS NULL`);
  return data;
}

// ─────────────────────────────────────────────────
// MATCH each chunk to best lesson
// ─────────────────────────────────────────────────
function buildMatches(chunks, refs) {
  const matches = [];
  const skipped = [];
  let i = 0;
  for (const chunk of chunks) {
    i++;
    if (i % 100 === 0) process.stdout.write(`[match] ${i}/${chunks.length}  \r`);

    const candidate = fuzzyMatchChunkToLesson(chunk, refs);
    if (!candidate || candidate.score < MIN_MATCH_SCORE) {
      skipped.push({ id: chunk.id, source: chunk.source, reason: candidate ? `score ${candidate.score.toFixed(2)} < ${MIN_MATCH_SCORE}` : 'no candidate' });
      continue;
    }
    matches.push({
      id: chunk.id,
      source: chunk.source,
      lessonId: candidate.lessonId,
      chapter: candidate.chapter,
      chapterInt: candidate.chapterInt,
      page: candidate.page,
      sectionTitle: candidate.sectionTitle,
      score: candidate.score,
    });
  }
  console.log(`\n[match] ${matches.length} matched, ${skipped.length} skipped`);
  return { matches, skipped };
}

// ─────────────────────────────────────────────────
// EMIT SQL UPDATE statements (DRY mode)
// ─────────────────────────────────────────────────
function emitDryRunSql(matches, skipped) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const sqlPath = path.join(OUTPUT_DIR, `dry-run-iter14-${ts}.sql`);
  const reportPath = path.join(OUTPUT_DIR, `dry-run-iter14-${ts}.report.json`);

  const lines = [
    `-- Iter 14 P0 RAG Metadata Backfill DRY-RUN`,
    `-- Generated: ${ts}`,
    `-- Total matches: ${matches.length}`,
    `-- Total skipped: ${skipped.length}`,
    `-- Min match score: ${MIN_MATCH_SCORE}`,
    `-- DO NOT execute as-is — Andrea reviews 10 random first`,
    ``,
    `BEGIN;`,
    ``,
  ];

  // group by (chapterInt, page, sectionTitle) for compact UPDATE...IN(...)
  const groups = new Map();
  for (const m of matches) {
    const key = `${m.chapterInt}|${m.page}|${m.sectionTitle}`;
    if (!groups.has(key)) groups.set(key, { chapterInt: m.chapterInt, page: m.page, sectionTitle: m.sectionTitle, ids: [] });
    groups.get(key).ids.push(m.id);
  }

  for (const [, g] of groups) {
    const idsList = g.ids.map(id => `'${id}'`).join(', ');
    const titleEsc = (g.sectionTitle || '').replace(/'/g, "''");
    // iter 12 patch: chapterInt may be null for Path C (wiki topic-ID
    // sources) since wiki concepts are organised by volume+page only,
    // no chapter integer. Emit SQL NULL literal in that case.
    const chapterSql = (g.chapterInt === null || g.chapterInt === undefined)
      ? 'NULL'
      : String(g.chapterInt);
    const pageSql = (g.page === null || g.page === undefined)
      ? 'NULL'
      : String(g.page);
    lines.push(
      `UPDATE rag_chunks SET chapter=${chapterSql}, page=${pageSql}, section_title='${titleEsc}', updated_at=now() WHERE id IN (${idsList});  -- ${g.ids.length} rows`,
    );
  }

  lines.push(``, `-- Verify post-execute:`, `-- SELECT COUNT(*) FROM rag_chunks WHERE chapter IS NULL;  -- expect ~${skipped.length}`, `COMMIT;`, ``);

  fs.writeFileSync(sqlPath, lines.join('\n'));
  fs.writeFileSync(reportPath, JSON.stringify({
    ts,
    total_matches: matches.length,
    total_skipped: skipped.length,
    min_match_score: MIN_MATCH_SCORE,
    groups: groups.size,
    sample_matches: matches.slice(0, 10),
    sample_skipped: skipped.slice(0, 10),
  }, null, 2));

  console.log(`[dry] SQL written: ${sqlPath}`);
  console.log(`[dry] Report:      ${reportPath}`);
  console.log(`[dry] Andrea: review 10 sample matches in report.json before --commit`);
}

// ─────────────────────────────────────────────────
// EXECUTE PATCH against rag_chunks (COMMIT mode)
// ─────────────────────────────────────────────────
async function executeCommit(matches) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const resultPath = path.join(OUTPUT_DIR, `commit-result-iter14-${ts}.json`);
  const result = { ts, total: matches.length, success: 0, errors: [] };

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = matches.slice(i, i + BATCH_SIZE);
    for (const m of batch) {
      const url = `${SUPABASE_URL}/rest/v1/rag_chunks?id=eq.${m.id}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          chapter: m.chapterInt,
          page: m.page,
          section_title: m.sectionTitle,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        result.errors.push({ id: m.id, status: res.status, body: (await res.text()).slice(0, 100) });
      } else {
        result.success++;
      }
    }
    process.stdout.write(`[commit] ${i + batch.length}/${matches.length} success=${result.success} err=${result.errors.length}  \r`);
  }

  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log(`\n[commit] DONE: ${result.success}/${result.total} success, ${result.errors.length} errors`);
  console.log(`[commit] Result: ${resultPath}`);
}

// ─────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────
async function main() {
  console.log('=== RAG Metadata Backfill iter 14 ===');
  console.log(`Mode: ${MODE_COMMIT ? 'COMMIT (writes to prod)' : 'DRY-RUN (file output only)'}`);
  console.log(`Min match score: ${MIN_MATCH_SCORE}`);
  console.log('');

  const refs = await loadVolumeReferences();
  const chunks = await fetchNullChunks();
  if (chunks.length === 0) {
    console.log('[main] No NULL-chapter chunks found. Nothing to do.');
    return;
  }

  const { matches, skipped } = buildMatches(chunks, refs);

  if (MODE_DRY) {
    emitDryRunSql(matches, skipped);
  } else {
    await executeCommit(matches);
    console.log('[main] Run B2 bench next: node scripts/bench/run-hybrid-rag-eval.mjs');
  }
}

main().catch(err => {
  console.error('FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});
