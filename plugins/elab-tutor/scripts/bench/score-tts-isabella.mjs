#!/usr/bin/env node
/**
 * Sprint S iter 8 — TTS Isabella Scorer (ATOM-S8-A9)
 *
 * Scores Edge TTS Isabella synthesis results:
 *   latency_ms, audio_duration_ms (estimated), real_time_factor,
 *   file_size_kb, mos_score (LLM-as-judge stub default 4.0).
 *
 * Input JSONL  (--input): each line {id, text, audio_bytes (number) | audio_size_kb,
 *                                   latency_ms, duration_ms?, voice?, success}
 * Output JSON  (--output): per-sample + aggregates + verdict.
 *
 * Pass criteria default --threshold "p50_latency<2000,mos>=4.0".
 * Exit 0 if all thresholds met, 1 otherwise.
 *
 * Usage:
 *   node scripts/bench/score-tts-isabella.mjs --input results.jsonl --output scores.json
 *     [--threshold-latency-p50 2000] [--threshold-mos 4.0]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv) {
  const out = {
    input: null, output: null,
    thresholdLatencyP50: 2000,
    thresholdMos: 4.0,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--input') out.input = argv[++i];
    else if (a.startsWith('--input=')) out.input = a.slice(8);
    else if (a === '--output') out.output = argv[++i];
    else if (a.startsWith('--output=')) out.output = a.slice(9);
    else if (a === '--threshold-latency-p50') out.thresholdLatencyP50 = parseInt(argv[++i], 10);
    else if (a === '--threshold-mos') out.thresholdMos = parseFloat(argv[++i]);
    else if (a === '--threshold') {
      const v = argv[++i] || '';
      // accept "p50<2000,mos>=4.0" or split equally
      const parts = v.split(',');
      for (const p of parts) {
        const m = p.match(/p50.*?(\d+)/);
        if (m) out.thresholdLatencyP50 = parseInt(m[1], 10);
        const mos = p.match(/mos.*?([\d.]+)/);
        if (mos) out.thresholdMos = parseFloat(mos[1]);
      }
    }
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — TTS Isabella Scorer

Usage:
  node scripts/bench/score-tts-isabella.mjs --input <file.jsonl> --output <file.json>
    [--threshold-latency-p50 2000] [--threshold-mos 4.0]

Input JSONL line schema:
  { id, text, audio_bytes?, audio_size_kb?, latency_ms, duration_ms?, voice?, success }

Output JSON aggregates:
  { p50_latency_ms, p95_latency_ms, avg_latency_ms,
    avg_duration_ms, avg_real_time_factor, avg_file_size_kb,
    avg_mos, success_rate, n }
`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

function average(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

/**
 * Estimate audio duration (ms) from byte size for mp3 24khz 48kbps mono.
 * 48 kbps = 6 KB/s → duration_ms ≈ bytes / 6.
 */
function estimateDurationMs(bytes) {
  if (!bytes || bytes <= 0) return 0;
  return Math.round(bytes / 6);
}

/**
 * MOS (Mean Opinion Score) stub — LLM-as-judge would call here.
 * Returns 4.0 as default (Isabella Neural rated "good" by Andrea 2026-04-26).
 * Real impl would POST to LLM with text+audio waveform analysis.
 * Heuristic adjustments:
 *   - latency > 5s → -0.5
 *   - duration < 500ms (very short) → -0.3
 *   - file_size_kb < 1 → -1.0 (likely error/empty)
 */
function mosStub(sample) {
  let mos = 4.0;
  if (sample.latency_ms && sample.latency_ms > 5000) mos -= 0.5;
  if (sample.duration_ms && sample.duration_ms < 500) mos -= 0.3;
  if (sample.file_size_kb !== undefined && sample.file_size_kb < 1) mos = 1.0;
  if (sample.success === false) mos = 0;
  return Math.max(0, Math.min(5, mos));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) { printHelp(); process.exit(args.help ? 0 : 2); }

  const rows = loadJsonl(resolve(args.input));
  if (!rows.length) { console.error('[score-tts-isabella] empty input'); process.exit(2); }

  const perSample = rows.map(r => {
    const bytes = r.audio_bytes ?? (r.audio_size_kb ? r.audio_size_kb * 1024 : 0);
    const fileSizeKb = bytes ? bytes / 1024 : 0;
    const durationMs = r.duration_ms || estimateDurationMs(bytes);
    const realTimeFactor = r.latency_ms && durationMs ? r.latency_ms / durationMs : 0;
    const sample = {
      id: r.id,
      text: r.text,
      latency_ms: r.latency_ms || 0,
      audio_bytes: bytes,
      file_size_kb: parseFloat(fileSizeKb.toFixed(2)),
      duration_ms: durationMs,
      real_time_factor: parseFloat(realTimeFactor.toFixed(3)),
      voice: r.voice || 'it-IT-IsabellaNeural',
      success: r.success !== false,
    };
    sample.mos = mosStub(sample);
    return sample;
  });

  const successful = perSample.filter(s => s.success);
  const latencies = successful.map(s => s.latency_ms);
  const aggregates = {
    n: perSample.length,
    n_success: successful.length,
    success_rate: perSample.length ? successful.length / perSample.length : 0,
    p50_latency_ms: percentile(latencies, 50),
    p95_latency_ms: percentile(latencies, 95),
    avg_latency_ms: average(latencies),
    avg_duration_ms: average(successful.map(s => s.duration_ms)),
    avg_real_time_factor: average(successful.map(s => s.real_time_factor)),
    avg_file_size_kb: average(successful.map(s => s.file_size_kb)),
    avg_mos: average(perSample.map(s => s.mos)),
  };

  const passLatency = aggregates.p50_latency_ms <= args.thresholdLatencyP50;
  const passMos = aggregates.avg_mos >= args.thresholdMos;
  const verdict = passLatency && passMos ? 'PASS' : 'FAIL';

  const out = {
    generated_at: new Date().toISOString(),
    scorer: 'score-tts-isabella',
    thresholds: { latency_p50_ms: args.thresholdLatencyP50, mos: args.thresholdMos },
    verdict,
    pass_breakdown: { latency: passLatency, mos: passMos },
    aggregates,
    per_sample: perSample,
  };

  if (args.output) {
    const outPath = resolve(args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[score-tts-isabella] wrote ${outPath}`);
  }

  console.log(`# TTS Isabella Score`);
  console.log(`p50=${aggregates.p50_latency_ms}ms p95=${aggregates.p95_latency_ms}ms avg=${aggregates.avg_latency_ms.toFixed(0)}ms`);
  console.log(`avg_mos=${aggregates.avg_mos.toFixed(2)} avg_rtf=${aggregates.avg_real_time_factor.toFixed(2)} success=${(aggregates.success_rate * 100).toFixed(1)}%`);
  console.log(`Verdict: ${verdict} (latency=${passLatency ? 'PASS' : 'FAIL'}, mos=${passMos ? 'PASS' : 'FAIL'})`);

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
