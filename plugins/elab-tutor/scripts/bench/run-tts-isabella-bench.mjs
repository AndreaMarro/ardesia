#!/usr/bin/env node
/**
 * Sprint S iter 8 — TTS Isabella Bench Runner (ATOM-S8-A10 prep)
 *
 * Loads tts-isabella-fixture.jsonl, POSTs each text to unlim-tts Edge Function,
 * collects audio bytes / latency, hands off to score-tts-isabella.mjs.
 *
 * Iter 8: Edge Function may not be deployed yet — runner supports --dry-run with
 * synthetic latency/size sampled from realistic distribution (mp3 24khz 48kbps).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/bench/run-tts-isabella-bench.mjs
 *     [--fixture <path>] [--dry-run] [--latency-p50 2000]
 *
 * Output: scripts/bench/output/tts-isabella-{ts}.{jsonl,json,md}
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
const TTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/unlim-tts`;

function parseArgs(argv) {
  const out = { fixture: null, dryRun: false, latencyP50: 2000, mosThreshold: 4.0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fixture') out.fixture = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--latency-p50') out.latencyP50 = parseInt(argv[++i], 10);
    else if (a === '--mos-threshold') out.mosThreshold = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node run-tts-isabella-bench.mjs [--fixture <path>] [--dry-run]');
      process.exit(0);
    }
  }
  return out;
}

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

async function callTts(text, dryRun, expectedDurationMs) {
  const start = Date.now();

  if (dryRun || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Synthetic: rate=−5% Isabella avg ~140 wpm → ~2.4 chars/sec spoken
    const charSpeed = 14; // chars per 100ms approximation
    const durationMs = expectedDurationMs || Math.max(500, text.length * 1000 / charSpeed);
    const bytes = Math.round(durationMs * 6); // 48kbps = 6 KB/s = 6 bytes/ms
    // Synthesis latency synthetic 800-2200 ms (realistic Edge TTS WS)
    const latencyMs = 800 + Math.floor(Math.random() * 1400);
    return {
      success: true,
      audio_bytes: bytes,
      duration_ms: Math.round(durationMs),
      latency_ms: latencyMs,
      voice: 'it-IT-IsabellaNeural',
      dry_run: true,
    };
  }

  try {
    const res = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ text, voice: 'it-IT-IsabellaNeural', rate: '-5%' }),
    });
    if (!res.ok) {
      return { success: false, error: `http ${res.status}`, latency_ms: Date.now() - start };
    }
    const buf = await res.arrayBuffer();
    return {
      success: true,
      audio_bytes: buf.byteLength,
      latency_ms: Date.now() - start,
      voice: 'it-IT-IsabellaNeural',
    };
  } catch (err) {
    return { success: false, error: err.message, latency_ms: Date.now() - start };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const fixturePath = args.fixture
    ? resolve(args.fixture)
    : resolve(__dirname, 'tts-isabella-fixture.jsonl');

  if (!existsSync(fixturePath)) {
    console.error(`[run-tts] fixture not found: ${fixturePath}`);
    process.exit(2);
  }

  const fixtures = loadJsonl(fixturePath);
  console.log(`[run-tts] loaded ${fixtures.length} fixtures`);
  const dryRun = args.dryRun || !SUPABASE_URL || !SUPABASE_ANON_KEY;
  console.log(`[run-tts] endpoint=${TTS_ENDPOINT || '(dry-run)'} dry_run=${dryRun}`);

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const resultsPath = join(outDir, `tts-isabella-results-${ts}.jsonl`);
  const scoresPath = join(outDir, `tts-isabella-scores-${ts}.json`);
  const reportPath = join(outDir, `tts-isabella-report-${ts}.md`);

  const lines = [];
  for (const f of fixtures) {
    const expectedDur = f.expected_duration_ms_max || (f.expected_duration_ms_min ? (f.expected_duration_ms_min + 500) : null);
    const r = await callTts(f.text, dryRun, expectedDur);
    lines.push(JSON.stringify({
      id: f.id,
      text: f.text,
      category: f.category,
      audio_bytes: r.audio_bytes,
      latency_ms: r.latency_ms,
      duration_ms: r.duration_ms,
      voice: r.voice,
      success: r.success,
      error: r.error,
      dry_run: r.dry_run,
    }));
  }
  writeFileSync(resultsPath, lines.join('\n'));
  console.log(`[run-tts] wrote ${resultsPath}`);

  const scorerPath = resolve(__dirname, 'score-tts-isabella.mjs');
  const r = spawnSync(process.execPath, [
    scorerPath,
    '--input', resultsPath,
    '--output', scoresPath,
    '--threshold-latency-p50', String(args.latencyP50),
    '--threshold-mos', String(args.mosThreshold),
  ], { stdio: 'inherit' });

  let scoreData = {};
  try { scoreData = JSON.parse(readFileSync(scoresPath, 'utf-8')); } catch {}
  const a = scoreData.aggregates || {};
  const md = [
    `# TTS Isabella Bench Report`,
    `Generated: ${new Date().toISOString()}`,
    `Endpoint: ${TTS_ENDPOINT || '(dry-run)'}`,
    `Fixtures: ${fixtures.length} | dry_run=${dryRun}`,
    ``,
    `## Aggregates`,
    `- p50_latency_ms: ${a.p50_latency_ms || 0}`,
    `- p95_latency_ms: ${a.p95_latency_ms || 0}`,
    `- avg_latency_ms: ${(a.avg_latency_ms || 0).toFixed(0)}`,
    `- avg_duration_ms: ${(a.avg_duration_ms || 0).toFixed(0)}`,
    `- avg_real_time_factor: ${(a.avg_real_time_factor || 0).toFixed(2)}`,
    `- avg_mos: ${(a.avg_mos || 0).toFixed(2)}`,
    `- success_rate: ${((a.success_rate || 0) * 100).toFixed(1)}%`,
    ``,
    `Verdict: **${scoreData.verdict || 'UNKNOWN'}**`,
  ].join('\n');
  writeFileSync(reportPath, md);
  console.log(`[run-tts] wrote ${reportPath}`);

  process.exit(r.status || 0);
}

main().catch(err => {
  console.error('[run-tts] fatal:', err);
  process.exit(1);
});
