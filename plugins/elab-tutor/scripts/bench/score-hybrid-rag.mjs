#!/usr/bin/env node
/**
 * Sprint S iter 8 — Hybrid RAG Scorer (ATOM-S8-A9)
 *
 * Scores hybrid retrieval results against gold-set:
 *   recall@1 / recall@3 / recall@5, precision@1, MRR, nDCG@5,
 *   latency_ms (per query), token_count_retrieved (chars/4 estimate).
 *
 * Input JSONL  (--input): each line {query_id, query, retrieved:[{id,content,score}],
 *                                    gold_chunks:[id...], latency_ms}
 * Output JSON  (--output): aggregates + per-query detail.
 *
 * Pass criteria default --threshold 0.85 on recall@5.
 * Exit 0 if recall@5 >= threshold, else 1 with detail.
 *
 * Usage:
 *   node scripts/bench/score-hybrid-rag.mjs --input retrieved.jsonl --output scores.json [--threshold 0.85]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── CLI parsing ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { input: null, output: null, threshold: 0.85, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--input') out.input = argv[++i];
    else if (a.startsWith('--input=')) out.input = a.slice(8);
    else if (a === '--output') out.output = argv[++i];
    else if (a.startsWith('--output=')) out.output = a.slice(9);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a.startsWith('--threshold=')) out.threshold = parseFloat(a.slice(12));
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — Hybrid RAG Scorer

Usage:
  node scripts/bench/score-hybrid-rag.mjs --input <file.jsonl> --output <file.json> [--threshold 0.85]

Input JSONL line schema:
  { query_id, query, retrieved: [{id, content?, score?}], gold_chunks: [id...], latency_ms? }

Output JSON:
  { aggregates: { recall_at_1, recall_at_3, recall_at_5, precision_at_1,
                  mrr, ndcg_at_5, avg_latency_ms, avg_token_count, n },
    per_query: [...] }

Exit codes:
  0 = recall_at_5 >= threshold (PASS)
  1 = recall_at_5 < threshold (FAIL with detail to stderr)
`);
}

// ─── Metrics ────────────────────────────────────────────────────────────────

function recallAtK(retrievedIds, goldIds, k) {
  if (!goldIds.length) return 0;
  const top = retrievedIds.slice(0, k);
  const hits = top.filter(id => goldIds.includes(id)).length;
  return hits / goldIds.length;
}

function precisionAtK(retrievedIds, goldIds, k) {
  if (!retrievedIds.length || k === 0) return 0;
  const top = retrievedIds.slice(0, k);
  const hits = top.filter(id => goldIds.includes(id)).length;
  return hits / Math.min(top.length, k);
}

function mrr(retrievedIds, goldIds) {
  for (let i = 0; i < retrievedIds.length; i++) {
    if (goldIds.includes(retrievedIds[i])) return 1 / (i + 1);
  }
  return 0;
}

function dcgAtK(retrievedIds, goldIds, k) {
  let dcg = 0;
  const top = retrievedIds.slice(0, k);
  for (let i = 0; i < top.length; i++) {
    const rel = goldIds.includes(top[i]) ? 1 : 0;
    if (rel) dcg += rel / Math.log2(i + 2);
  }
  return dcg;
}

function ndcgAtK(retrievedIds, goldIds, k) {
  const idealHits = Math.min(goldIds.length, k);
  if (!idealHits) return 0;
  let idcg = 0;
  for (let i = 0; i < idealHits; i++) idcg += 1 / Math.log2(i + 2);
  const dcg = dcgAtK(retrievedIds, goldIds, k);
  return idcg > 0 ? dcg / idcg : 0;
}

function tokenCount(retrieved) {
  // Estimate: char count / 4 (English/Italian ratio ~3.5-4.5)
  let chars = 0;
  for (const r of retrieved) {
    if (r && typeof r.content === 'string') chars += r.content.length;
  }
  return Math.round(chars / 4);
}

// Iter 10 P1 fix: keyword content match fallback when gold UUIDs not align with prod chunks.
// Returns recall@k = fraction of expected_keywords found in any top-k chunk content (case-insensitive substring).
// Used when expected_chunks IDs are synthetic (gold-set) vs prod chunk UUIDs.
function recallAtKKeyword(retrievedChunks, expectedKeywords, k) {
  if (!expectedKeywords?.length) return 0;
  const top = retrievedChunks.slice(0, k);
  let hits = 0;
  for (const kw of expectedKeywords) {
    const kwLower = String(kw).toLowerCase();
    const matched = top.some(c => {
      const content = String(c.content || c.content_raw || '').toLowerCase();
      return content.includes(kwLower);
    });
    if (matched) hits++;
  }
  return hits / expectedKeywords.length;
}

function precisionAtKKeyword(retrievedChunks, expectedKeywords, k) {
  if (!retrievedChunks.length || !expectedKeywords?.length || k === 0) return 0;
  const top = retrievedChunks.slice(0, k);
  let matchedChunks = 0;
  for (const c of top) {
    const content = String(c.content || c.content_raw || '').toLowerCase();
    if (expectedKeywords.some(kw => content.includes(String(kw).toLowerCase()))) matchedChunks++;
  }
  return matchedChunks / Math.min(top.length, k);
}

function mrrKeyword(retrievedChunks, expectedKeywords) {
  for (let i = 0; i < retrievedChunks.length; i++) {
    const content = String(retrievedChunks[i].content || retrievedChunks[i].content_raw || '').toLowerCase();
    if (expectedKeywords.some(kw => content.includes(String(kw).toLowerCase()))) return 1 / (i + 1);
  }
  return 0;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function loadJsonl(path) {
  const text = readFileSync(path, 'utf-8');
  return text.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function average(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) { printHelp(); process.exit(args.help ? 0 : 2); }

  const inputPath = resolve(args.input);
  const rows = loadJsonl(inputPath);
  if (!rows.length) {
    console.error(`[score-hybrid-rag] empty input ${inputPath}`);
    process.exit(2);
  }

  const perQuery = [];
  for (const row of rows) {
    const retrievedChunks = row.retrieved || [];
    const retrievedIds = retrievedChunks.map(r => r.id);
    const goldIds = row.gold_chunks || row.expected_chunks || [];
    const expectedKeywords = row.expected_keywords || [];

    // Iter 10 P1: dual scoring — UUID match (legacy) AND keyword content match (robust).
    // Take MAX of two: if gold UUIDs align use them, else fallback content keyword match.
    const idRecall1 = recallAtK(retrievedIds, goldIds, 1);
    const idRecall3 = recallAtK(retrievedIds, goldIds, 3);
    const idRecall5 = recallAtK(retrievedIds, goldIds, 5);
    const idPrecision1 = precisionAtK(retrievedIds, goldIds, 1);
    const idMrr = mrr(retrievedIds, goldIds);

    const kwRecall1 = recallAtKKeyword(retrievedChunks, expectedKeywords, 1);
    const kwRecall3 = recallAtKKeyword(retrievedChunks, expectedKeywords, 3);
    const kwRecall5 = recallAtKKeyword(retrievedChunks, expectedKeywords, 5);
    const kwPrecision1 = precisionAtKKeyword(retrievedChunks, expectedKeywords, 1);
    const kwMrr = mrrKeyword(retrievedChunks, expectedKeywords);

    perQuery.push({
      query_id: row.query_id || row.id,
      query: row.query,
      recall_at_1: Math.max(idRecall1, kwRecall1),
      recall_at_3: Math.max(idRecall3, kwRecall3),
      recall_at_5: Math.max(idRecall5, kwRecall5),
      precision_at_1: Math.max(idPrecision1, kwPrecision1),
      mrr: Math.max(idMrr, kwMrr),
      ndcg_at_5: ndcgAtK(retrievedIds, goldIds, 5),
      latency_ms: row.latency_ms || 0,
      token_count: tokenCount(retrievedChunks),
      n_retrieved: retrievedIds.length,
      n_gold: goldIds.length,
      n_keywords: expectedKeywords.length,
      // Surface match-type for diagnosis
      match_type: idRecall5 >= kwRecall5 ? 'uuid' : 'keyword',
    });
  }

  const aggregates = {
    n: perQuery.length,
    recall_at_1: average(perQuery.map(p => p.recall_at_1)),
    recall_at_3: average(perQuery.map(p => p.recall_at_3)),
    recall_at_5: average(perQuery.map(p => p.recall_at_5)),
    precision_at_1: average(perQuery.map(p => p.precision_at_1)),
    mrr: average(perQuery.map(p => p.mrr)),
    ndcg_at_5: average(perQuery.map(p => p.ndcg_at_5)),
    avg_latency_ms: average(perQuery.map(p => p.latency_ms)),
    avg_token_count: average(perQuery.map(p => p.token_count)),
  };

  const verdict = aggregates.recall_at_5 >= args.threshold ? 'PASS' : 'FAIL';
  const out = {
    generated_at: new Date().toISOString(),
    scorer: 'score-hybrid-rag',
    threshold_recall_at_5: args.threshold,
    verdict,
    aggregates,
    per_query: perQuery,
  };

  if (args.output) {
    const outPath = resolve(args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[score-hybrid-rag] wrote ${outPath}`);
  } else {
    console.log(JSON.stringify(out, null, 2));
  }

  console.log(`# Hybrid RAG Score`);
  console.log(`recall@1=${aggregates.recall_at_1.toFixed(3)} recall@3=${aggregates.recall_at_3.toFixed(3)} recall@5=${aggregates.recall_at_5.toFixed(3)}`);
  console.log(`precision@1=${aggregates.precision_at_1.toFixed(3)} MRR=${aggregates.mrr.toFixed(3)} nDCG@5=${aggregates.ndcg_at_5.toFixed(3)}`);
  console.log(`avg_latency=${aggregates.avg_latency_ms.toFixed(0)}ms avg_tokens=${aggregates.avg_token_count.toFixed(0)} n=${aggregates.n}`);
  console.log(`Verdict: ${verdict} (recall@5=${aggregates.recall_at_5.toFixed(3)} vs threshold ${args.threshold})`);

  if (verdict === 'FAIL') {
    console.error(`[score-hybrid-rag] FAIL — recall@5 ${aggregates.recall_at_5.toFixed(3)} < threshold ${args.threshold}`);
    const fails = perQuery.filter(p => p.recall_at_5 < args.threshold).slice(0, 5);
    for (const f of fails) {
      console.error(`  FAIL ${f.query_id}: recall@5=${f.recall_at_5.toFixed(3)} (gold=${f.n_gold}, retrieved=${f.n_retrieved})`);
    }
  }

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
