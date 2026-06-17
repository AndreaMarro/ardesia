#!/usr/bin/env node
/**
 * Sprint S iter 8 — Cost Bench Runner (ATOM-S8-A10 prep)
 *
 * Simulates 12-turn UNLIM sessions sampled from realistic distribution and
 * computes cost per session via score-cost-per-session.mjs. Optional --replay
 * loads real session logs from Supabase nudge_logs / together_audit_log.
 *
 * Iter 8: replay Supabase mode requires service-role-key + a query script
 * (deferred). Default mode synthesizes 50 sessions with realistic token counts.
 *
 * Realistic distribution per ATOM-S8-A10 + iter 7 R5 metrics:
 *   - 12 turns avg, 8 ± 4 std dev
 *   - tokens_in per turn: 600 ± 200 (RAG context + system prompt)
 *   - tokens_out per turn: 80 ± 30 (60 words ≈ 80 tokens)
 *   - 70% Together, 25% Gemini Flash, 5% Gemini Pro
 *   - 1 RAG query per turn, 800 embedding tokens
 *   - 0.3 TTS calls per turn (only on click "leggi pagina")
 *
 * Usage:
 *   node scripts/bench/run-cost-bench.mjs [--n 50] [--threshold 0.012] [--currency EUR]
 *
 * Output: scripts/bench/output/cost-bench-{ts}.{jsonl,json,md}
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv) {
  const out = { n: 50, threshold: 0.012, currency: 'EUR', seed: 42 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--n') out.n = parseInt(argv[++i], 10);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--currency') out.currency = argv[++i];
    else if (a === '--seed') out.seed = parseInt(argv[++i], 10);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node run-cost-bench.mjs [--n 50] [--threshold 0.012] [--currency EUR|USD] [--seed 42]');
      process.exit(0);
    }
  }
  return out;
}

// Simple seeded RNG (mulberry32) for reproducibility
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand, mean, std) {
  // Box-Muller
  const u1 = Math.max(1e-9, rand());
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function pickProvider(rand) {
  const r = rand();
  if (r < 0.70) return 'together';
  if (r < 0.95) return 'gemini-flash';
  return 'gemini-pro';
}

function synthesizeSession(id, rand) {
  const nTurns = Math.max(2, Math.round(gauss(rand, 12, 4)));
  const turns = [];
  for (let i = 0; i < nTurns; i++) {
    const tIn = Math.max(50, Math.round(gauss(rand, 600, 200)));
    const tOut = Math.max(20, Math.round(gauss(rand, 80, 30)));
    const ragTokens = Math.max(0, Math.round(gauss(rand, 800, 200)));
    const tts = rand() < 0.3 ? 1 : 0;
    turns.push({
      tokens_in: tIn,
      tokens_out: tOut,
      provider: pickProvider(rand),
      n_rag_queries: 1,
      rag_tokens: ragTokens,
      n_tts_calls: tts,
    });
  }
  return { session_id: id, turns };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rand = seededRandom(args.seed);

  console.log(`[run-cost] synthesizing n=${args.n} sessions seed=${args.seed}`);

  const sessions = [];
  for (let i = 0; i < args.n; i++) {
    sessions.push(synthesizeSession(`syn-${i + 1}`, rand));
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const sessionsPath = join(outDir, `cost-bench-sessions-${ts}.jsonl`);
  const scoresPath = join(outDir, `cost-bench-scores-${ts}.json`);
  const reportPath = join(outDir, `cost-bench-report-${ts}.md`);

  writeFileSync(sessionsPath, sessions.map(s => JSON.stringify(s)).join('\n'));
  console.log(`[run-cost] wrote ${sessionsPath}`);

  const scorerPath = resolve(__dirname, 'score-cost-per-session.mjs');
  const r = spawnSync(process.execPath, [
    scorerPath,
    '--input', sessionsPath,
    '--output', scoresPath,
    '--threshold', String(args.threshold),
    '--currency', args.currency,
  ], { stdio: 'inherit' });

  let scoreData = {};
  try { scoreData = JSON.parse(readFileSync(scoresPath, 'utf-8')); } catch {}
  const a = scoreData.aggregates || {};
  const md = [
    `# Cost Bench Report`,
    `Generated: ${new Date().toISOString()}`,
    `Sessions: ${sessions.length} (synthetic, seed=${args.seed})`,
    `Threshold: ${args.threshold} ${args.currency}`,
    ``,
    `## Aggregates`,
    `- avg_cost_total_eur: ${(a.avg_cost_total_eur || 0).toFixed(6)}`,
    `- avg_cost_total_usd: ${(a.avg_cost_total_usd || 0).toFixed(6)}`,
    `- p50_cost: ${(a.p50_cost || 0).toFixed(6)}`,
    `- p95_cost: ${(a.p95_cost || 0).toFixed(6)}`,
    `- max_cost: ${(a.max_cost || 0).toFixed(6)}`,
    `- avg_n_turns: ${(a.avg_n_turns || 0).toFixed(1)}`,
    `- avg_tokens_input: ${(a.avg_tokens_input || 0).toFixed(0)}`,
    `- avg_tokens_output: ${(a.avg_tokens_output || 0).toFixed(0)}`,
    ``,
    `Pricing reference: 2026-04-27 (Together $0.18/M, Voyage $0.06/M, Gemini Flash-Lite $0.075/M)`,
    ``,
    `Verdict: **${scoreData.verdict || 'UNKNOWN'}**`,
  ].join('\n');
  writeFileSync(reportPath, md);
  console.log(`[run-cost] wrote ${reportPath}`);

  process.exit(r.status || 0);
}

main();
