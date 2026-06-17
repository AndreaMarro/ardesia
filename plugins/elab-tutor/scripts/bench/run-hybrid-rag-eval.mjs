#!/usr/bin/env node
/**
 * Sprint S iter 8 — Hybrid RAG Bench Runner (ATOM-S8-A10 prep)
 *
 * Loads gold-set fixtures (scripts/bench/hybrid-rag-gold-set.jsonl), POSTs each
 * query to the unlim-chat Edge Function with debug retrieval mode, captures
 * retrieved chunks, hands off to score-hybrid-rag.mjs.
 *
 * Iter 8 honesty: when SUPABASE_URL+ANON_KEY missing OR endpoint down, runner
 * emits dry-run mode with mocked retrieval (returns gold chunks as retrieved
 * for sanity testing scorer end-to-end).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/bench/run-hybrid-rag-eval.mjs
 *     [--fixture scripts/bench/hybrid-rag-gold-set.jsonl] [--dry-run] [--threshold 0.85]
 *
 * Output: scripts/bench/output/hybrid-rag-{ts}.{jsonl,json,md}
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const ENDPOINT = `${SUPABASE_URL}/functions/v1/unlim-chat`;
let SESSION_COUNTER = 0;

function parseArgs(argv) {
  const out = { fixture: null, dryRun: false, threshold: 0.85, topK: 5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixture') out.fixture = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--top-k') out.topK = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node run-hybrid-rag-eval.mjs [--fixture <path>] [--dry-run] [--threshold 0.85] [--top-k 5]');
      process.exit(0);
    }
  }
  return out;
}

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

async function callRetrieval(query, topK, dryRun, goldChunks) {
  const start = Date.now();

  if (dryRun || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Dry-run: return gold chunks as retrieved (perfect recall sanity)
    return {
      retrieved: (goldChunks || []).slice(0, topK).map(id => ({ id, content: '', score: 1.0 })),
      latency_ms: Date.now() - start,
      dry_run: true,
    };
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    };
    // Iter 10 fix: Edge Function unlim-chat requires X-Elab-Api-Key header (auth gate)
    if (ELAB_API_KEY) {
      headers['X-Elab-Api-Key'] = ELAB_API_KEY;
    }
    SESSION_COUNTER++;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: query,
        sessionId: `bench-hybrid-${Date.now()}-${SESSION_COUNTER}`,
        experimentId: 'v1-cap6-esp1',
        debug_retrieval: true,
        retrieval_mode: 'hybrid',
        top_k: topK,
      }),
    });
    if (!res.ok) {
      return { retrieved: [], latency_ms: Date.now() - start, error: `http ${res.status}` };
    }
    const data = await res.json();
    const chunks = data.debug_retrieval || data.retrieval || data.rag_chunks || [];
    return {
      retrieved: chunks.slice(0, topK).map(c => {
        // Iter 10: emit BOTH UUID and synthetic composite key for gold-set matching flexibility
        const uuid = c.id || c.chunk_id || null;
        const composite = c.source && c.page ? `${c.source}_cap${c.chapter || 'X'}_pag${c.page}_${(c.section_title || c.figure_id || '').toLowerCase().replace(/\s+/g, '_').slice(0, 30)}` : null;
        return {
          id: uuid,
          composite_id: composite,
          source: c.source || null,
          chapter: c.chapter ?? null,
          page: c.page ?? null,
          section_title: c.section_title || null,
          figure_id: c.figure_id || null,
          content: c.content || c.content_raw || '',
          score: c.rrf_score || c.similarity || c.score || 0,
        };
      }),
      latency_ms: Date.now() - start,
      retrieval_mode_used: data.retrieval_mode,
    };
  } catch (err) {
    return { retrieved: [], latency_ms: Date.now() - start, error: err.message };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fixturePath = args.fixture
    ? resolve(args.fixture)
    : resolve(__dirname, 'hybrid-rag-gold-set.jsonl');

  if (!existsSync(fixturePath)) {
    console.error(`[run-hybrid-rag] fixture not found: ${fixturePath}`);
    process.exit(2);
  }

  const fixtures = loadJsonl(fixturePath);
  console.log(`[run-hybrid-rag] loaded ${fixtures.length} fixtures`);
  console.log(`[run-hybrid-rag] endpoint=${ENDPOINT || '(none)'} dry_run=${args.dryRun || !SUPABASE_URL}`);

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const retrievedPath = join(outDir, `hybrid-rag-retrieved-${ts}.jsonl`);
  const scoresPath = join(outDir, `hybrid-rag-scores-${ts}.json`);
  const reportPath = join(outDir, `hybrid-rag-report-${ts}.md`);

  const retrievedLines = [];
  for (const f of fixtures) {
    const result = await callRetrieval(f.query, args.topK, args.dryRun, f.expected_chunks);
    retrievedLines.push(JSON.stringify({
      query_id: f.id,
      query: f.query,
      retrieved: result.retrieved,
      gold_chunks: f.expected_chunks || [],
      expected_keywords: f.expected_keywords || [], // Iter 10 P1: propagate keywords for content-match scoring
      latency_ms: result.latency_ms,
      error: result.error,
      dry_run: result.dry_run,
    }));
  }
  writeFileSync(retrievedPath, retrievedLines.join('\n'));
  console.log(`[run-hybrid-rag] wrote ${retrievedPath}`);

  // Hand off to scorer
  const scorerPath = resolve(__dirname, 'score-hybrid-rag.mjs');
  const r = spawnSync(process.execPath, [
    scorerPath,
    '--input', retrievedPath,
    '--output', scoresPath,
    '--threshold', String(args.threshold),
  ], { stdio: 'inherit' });

  // Generate report
  let scoreData = {};
  try { scoreData = JSON.parse(readFileSync(scoresPath, 'utf-8')); } catch (e) { /* ignore */ }
  const a = scoreData.aggregates || {};
  const md = [
    `# Hybrid RAG Bench Report`,
    `Generated: ${new Date().toISOString()}`,
    `Endpoint: ${ENDPOINT || '(dry-run)'}`,
    `Fixtures: ${fixtures.length}`,
    `Threshold recall@5: ${args.threshold}`,
    ``,
    `## Aggregates`,
    `- recall@1: ${(a.recall_at_1 || 0).toFixed(3)}`,
    `- recall@3: ${(a.recall_at_3 || 0).toFixed(3)}`,
    `- recall@5: ${(a.recall_at_5 || 0).toFixed(3)}`,
    `- precision@1: ${(a.precision_at_1 || 0).toFixed(3)}`,
    `- MRR: ${(a.mrr || 0).toFixed(3)}`,
    `- nDCG@5: ${(a.ndcg_at_5 || 0).toFixed(3)}`,
    `- avg_latency_ms: ${(a.avg_latency_ms || 0).toFixed(0)}`,
    ``,
    `Verdict: **${scoreData.verdict || 'UNKNOWN'}**`,
  ].join('\n');
  writeFileSync(reportPath, md);
  console.log(`[run-hybrid-rag] wrote ${reportPath}`);

  process.exit(r.status || 0);
}

main().catch(err => {
  console.error('[run-hybrid-rag] fatal:', err);
  process.exit(1);
});
