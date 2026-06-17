#!/usr/bin/env node
/**
 * Sprint S iter 8 — ClawBot Composite Scorer (ATOM-S8-A9)
 *
 * Scores ClawBot composite-handler executions (3-5 sub-tool sequences):
 *   - success_rate (composites finished status='ok' / total)
 *   - sub_tool_latency_p95 (across all sub-step latencies)
 *   - total_latency_ms (per composite)
 *   - cache_hit_rate (memory adapter hits)
 *   - pz_v3_warnings_count (warn-mode iter 6)
 *   - failed_at_index (when status != 'ok', which step index failed)
 *
 * Input JSONL  (--input): each line per composite execution
 *   { exec_id, composite_id, status, latency_ms, sub_steps:[{step,status,latency_ms,pz_warnings?}],
 *     cache_hit?, failed_sub_stage?, error? }
 * Output JSON  (--output): per-exec + aggregates.
 *
 * Pass criteria default --threshold 0.90 on success_rate.
 * Exit 0 if success_rate >= threshold, 1 otherwise.
 *
 * Usage:
 *   node scripts/bench/score-clawbot-composite.mjs --input execs.jsonl --output scores.json [--threshold 0.90]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv) {
  const out = { input: null, output: null, threshold: 0.90, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--input') out.input = argv[++i];
    else if (a.startsWith('--input=')) out.input = a.slice(8);
    else if (a === '--output') out.output = argv[++i];
    else if (a.startsWith('--output=')) out.output = a.slice(9);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — ClawBot Composite Scorer

Usage:
  node scripts/bench/score-clawbot-composite.mjs --input <file.jsonl> --output <file.json> [--threshold 0.90]

Input JSONL exec schema:
  { exec_id, composite_id, status:'ok'|'error'|'blocked_pz'|'cache_hit'|'timeout',
    latency_ms, sub_steps: [{step, status, latency_ms, pz_warnings?:[]}],
    cache_hit?, failed_sub_stage?, error? }

Pass criteria default:
  success_rate >= 0.90 (composite finishing status='ok' or 'cache_hit')

Output aggregates:
  { n, success_rate, sub_tool_latency_p50, sub_tool_latency_p95,
    avg_total_latency_ms, cache_hit_rate, pz_v3_warnings_count,
    failed_at_index_distribution }
`);
}

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function average(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function scoreExec(exec) {
  const subSteps = exec.sub_steps || exec.steps || [];
  const success = exec.status === 'ok' || exec.status === 'cache_hit';
  const subLatencies = subSteps.map(s => s.latency_ms || 0);
  const pzWarnings = subSteps.reduce((acc, s) => acc + (s.pz_warnings ? s.pz_warnings.length : 0), 0);

  let failedAtIndex = null;
  if (!success) {
    if (typeof exec.failed_at_index === 'number') failedAtIndex = exec.failed_at_index;
    else if (exec.failed_sub_stage) {
      failedAtIndex = subSteps.findIndex(s => s.step === exec.failed_sub_stage);
      if (failedAtIndex < 0) failedAtIndex = subSteps.length;
    } else {
      failedAtIndex = subSteps.findIndex(s => s.status && s.status !== 'ok');
      if (failedAtIndex < 0) failedAtIndex = subSteps.length;
    }
  }

  return {
    exec_id: exec.exec_id || exec.id,
    composite_id: exec.composite_id || exec.tool,
    status: exec.status,
    success,
    cache_hit: exec.cache_hit || exec.status === 'cache_hit',
    total_latency_ms: exec.latency_ms || subLatencies.reduce((a, b) => a + b, 0),
    n_sub_steps: subSteps.length,
    sub_latencies: subLatencies,
    pz_warnings_count: pzWarnings,
    failed_at_index: failedAtIndex,
    error: exec.error || null,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) { printHelp(); process.exit(args.help ? 0 : 2); }

  const execs = loadJsonl(resolve(args.input));
  if (!execs.length) { console.error('[score-clawbot] empty input'); process.exit(2); }

  const perExec = execs.map(scoreExec);

  const successCount = perExec.filter(p => p.success).length;
  const cacheHits = perExec.filter(p => p.cache_hit).length;
  const allSubLatencies = perExec.flatMap(p => p.sub_latencies);
  const totalPzWarnings = perExec.reduce((s, p) => s + p.pz_warnings_count, 0);

  const failedAtDist = {};
  for (const p of perExec) {
    if (!p.success && p.failed_at_index !== null) {
      const k = String(p.failed_at_index);
      failedAtDist[k] = (failedAtDist[k] || 0) + 1;
    }
  }

  const aggregates = {
    n: perExec.length,
    n_success: successCount,
    success_rate: perExec.length ? successCount / perExec.length : 0,
    cache_hit_rate: perExec.length ? cacheHits / perExec.length : 0,
    sub_tool_latency_p50: percentile(allSubLatencies, 50),
    sub_tool_latency_p95: percentile(allSubLatencies, 95),
    avg_total_latency_ms: average(perExec.map(p => p.total_latency_ms)),
    avg_n_sub_steps: average(perExec.map(p => p.n_sub_steps)),
    pz_v3_warnings_count: totalPzWarnings,
    failed_at_index_distribution: failedAtDist,
  };

  const verdict = aggregates.success_rate >= args.threshold ? 'PASS' : 'FAIL';

  const out = {
    generated_at: new Date().toISOString(),
    scorer: 'score-clawbot-composite',
    threshold_success_rate: args.threshold,
    verdict,
    aggregates,
    per_exec: perExec,
  };

  if (args.output) {
    const outPath = resolve(args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[score-clawbot] wrote ${outPath}`);
  }

  console.log(`# ClawBot Composite Score`);
  console.log(`success_rate=${(aggregates.success_rate * 100).toFixed(1)}% (n=${aggregates.n})`);
  console.log(`sub_tool_p50=${aggregates.sub_tool_latency_p50}ms p95=${aggregates.sub_tool_latency_p95}ms avg_total=${aggregates.avg_total_latency_ms.toFixed(0)}ms`);
  console.log(`cache_hit=${(aggregates.cache_hit_rate * 100).toFixed(1)}% pz_warnings=${aggregates.pz_v3_warnings_count}`);
  console.log(`Verdict: ${verdict} (success_rate=${aggregates.success_rate.toFixed(3)} vs threshold ${args.threshold})`);

  if (verdict === 'FAIL') {
    const fails = perExec.filter(p => !p.success).slice(0, 5);
    for (const f of fails) {
      console.error(`  FAIL ${f.exec_id}: status=${f.status} failed_at=${f.failed_at_index} err=${(f.error || '').slice(0, 80)}`);
    }
  }

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
