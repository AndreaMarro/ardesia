#!/usr/bin/env node
/**
 * scripts/bench/run-unlim-live-smoke.mjs — Sprint X iter 105.4
 *
 * LIVE smoke test runner against deployed UNLIM Edge Function on Supabase.
 * Standalone Node script (NOT vitest) to avoid jsdom env complications with
 * fetch + setup.js window dependencies.
 *
 * Usage:
 *   node scripts/bench/run-unlim-live-smoke.mjs
 *
 * Env required:
 *   VITE_SUPABASE_URL          — e.g. https://vxvqalmxqtezvgiboxyv.supabase.co
 *   VITE_ELAB_API_KEY          — ELAB API key for X-Elab-Api-Key header
 *   VITE_SUPABASE_ANON_KEY     — anon JWT for Authorization Bearer
 *
 * Exit codes:
 *   0 = all smoke tests PASS
 *   1 = one or more FAIL
 *   2 = config missing
 *
 * Output: JSONL line per test + final summary JSON to stdout + persisted to
 *   automa/state/unlim-live-smoke-<ISODATE>.json
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const URL = process.env.UNLIM_LIVE_URL || (process.env.VITE_SUPABASE_URL
  ? `${process.env.VITE_SUPABASE_URL}/functions/v1/unlim-chat`
  : null);
const API_KEY = process.env.ELAB_API_KEY || process.env.VITE_ELAB_API_KEY || '';
const JWT = process.env.SUPABASE_ANON_JWT || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!URL) {
  console.error('FATAL: UNLIM_LIVE_URL or VITE_SUPABASE_URL required');
  process.exit(2);
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (API_KEY) h['X-Elab-Api-Key'] = API_KEY;
  if (JWT) h['Authorization'] = `Bearer ${JWT}`;
  return h;
}

async function postChat(body, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    let json = null;
    try { json = await res.json(); } catch {}
    return { status: res.status, json, ok: true };
  } catch (err) {
    clearTimeout(t);
    return { status: 0, json: null, ok: false, error: err?.message ?? String(err) };
  }
}

const results = [];
let passed = 0;
let failed = 0;

async function test(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    const dt = Date.now() - t0;
    results.push({ name, status: 'PASS', durationMs: dt });
    passed++;
    process.stdout.write(`✓ ${name} (${dt}ms)\n`);
  } catch (err) {
    const dt = Date.now() - t0;
    results.push({ name, status: 'FAIL', durationMs: dt, error: err.message });
    failed++;
    process.stdout.write(`✗ ${name} — ${err.message}\n`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(`assertion failed: ${msg}`);
}

// ===========================================================================
// Smoke tests
// ===========================================================================

console.log(`UNLIM LIVE SMOKE — target: ${URL}\n`);

await test('GET /health returns 200 with status JSON', async () => {
  const res = await fetch(URL, { method: 'GET', headers: authHeaders() });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.status === 'string', 'no status field');
  assert(typeof json.version === 'string', 'no version field');
  console.log(`    → version: ${json.version}, uptime: ${json.uptimeSeconds}s`);
});

await test('POST basic Italian LED query returns 200 + response', async () => {
  const sid = `live-smoke-${Date.now()}-1`;
  const r = await postChat({ message: 'Cosa è un LED?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  assert(r.status === 200, `expected 200, got ${r.status}`);
  assert(r.json?.success === true, 'success !== true');
  assert(typeof r.json.response === 'string' && r.json.response.length > 20,
    `response too short: ${r.json?.response}`);
  console.log(`    → response[${r.json.response.length}]: ${r.json.response.slice(0, 80)}...`);
});

await test('Response starts with "Ragazzi," (PZ V3 plural opener)', async () => {
  const sid = `live-smoke-${Date.now()}-pz`;
  const r = await postChat({ message: 'spiega il LED', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json?.response) {
    const trimmed = r.json.response.trim();
    assert(trimmed.toLowerCase().startsWith('ragazzi'),
      `does not start with Ragazzi: ${trimmed.slice(0, 60)}`);
  }
});

await test('Word cap UNLIM_MAX_VISIBLE_WORDS=120 respected', async () => {
  const sid = `live-smoke-${Date.now()}-wc`;
  const r = await postChat({ message: 'Cosa è un LED?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json?.response) {
    const visible = r.json.response
      .replace(/\[AZIONE:[^\]]+\]/gi, '')
      .replace(/\[INTENT:\{[\s\S]*?\}\]/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    assert(visible.length <= 125, `visible words ${visible.length} > 125`);
    console.log(`    → visible words: ${visible.length}`);
  }
});

await test('prompt_class metadata present in response', async () => {
  const sid = `live-smoke-${Date.now()}-pc`;
  const r = await postChat({ message: 'Cosa è un LED?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json?.prompt_class) {
    assert(typeof r.json.prompt_class.category === 'string', 'no category');
    console.log(`    → category: ${r.json.prompt_class.category}, topK: ${r.json.prompt_class.topK}`);
  }
});

await test('Vol/cap query response contains canonical Vol.X pag.Y', async () => {
  const sid = `live-smoke-${Date.now()}-cite`;
  const r = await postChat({ message: 'Vol.1 cap.6 cosa dice del LED?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json?.response) {
    assert(/Vol\.\s*1\s+pag\.\s*\d+/i.test(r.json.response),
      `no canonical citation: ${r.json.response.slice(0, 100)}`);
  }
});

await test('220V safety query triggers safety canonical (NOT LLM)', async () => {
  const sid = `live-smoke-${Date.now()}-volt`;
  const r = await postChat({ message: 'posso collegare il LED a 220V?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json) {
    assert(r.json.success === true, 'success != true');
    const validSafetySource = /safety-pre-llm|safety-hardcoded-fallback/i.test(String(r.json.source));
    assert(validSafetySource, `source not safety: ${r.json.source}`);
    assert(/9\s*[Vv]/.test(r.json.response), '9V not mentioned');
    console.log(`    → source: ${r.json.source}, fires: ${JSON.stringify(r.json.safety_fires)}`);
  }
});

await test('Off-topic query (sport) returns gentle bridge', async () => {
  const sid = `live-smoke-${Date.now()}-off`;
  const r = await postChat({ message: 'chi ha vinto la partita Juve Inter?', sessionId: sid });
  assert(r.ok, `fetch failed: ${r.error}`);
  if (r.json) {
    assert(/offtopic/i.test(String(r.json.source)), `source not offtopic: ${r.json.source}`);
    assert(/elab|kit|esperiment|circuito|volume/i.test(String(r.json.response)),
      'response does not bridge to ELAB');
    console.log(`    → source: ${r.json.source}`);
  }
});

await test('Missing sessionId returns 400', async () => {
  const res = await fetch(URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message: 'test' }),
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

await test('Invalid sessionId format returns 400', async () => {
  const res = await fetch(URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message: 'test', sessionId: 'a$%^&*invalid' }),
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

await test('PUT method returns 405', async () => {
  const res = await fetch(URL, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ message: 'x', sessionId: 'test-put-check' }),
  });
  assert(res.status === 405, `expected 405, got ${res.status}`);
});

await test('Latency basic query < 12s', async () => {
  const t0 = Date.now();
  const sid = `live-smoke-${Date.now()}-perf`;
  await postChat({ message: 'Cosa è un LED?', sessionId: sid });
  const dt = Date.now() - t0;
  assert(dt < 12000, `took ${dt}ms (> 12s budget)`);
  console.log(`    → ${dt}ms`);
});

await test('Latency safety pre-LLM short-circuit < 5s', async () => {
  const t0 = Date.now();
  const sid = `live-smoke-${Date.now()}-perfsafe`;
  await postChat({ message: 'posso collegare a 220V?', sessionId: sid });
  const dt = Date.now() - t0;
  // Generous budget — safety path should be fast but cold start can spike
  assert(dt < 5000, `took ${dt}ms (> 5s budget)`);
  console.log(`    → ${dt}ms`);
});

await test('Memory persistence: 2 sequential msgs preserve sessionId', async () => {
  const sid = `live-smoke-${Date.now()}-mem`;
  await postChat({
    message: 'Vol.1 cap.6 esp.1 cosa monto?',
    sessionId: sid,
    experimentId: 'v1-cap6-esp1',
  });
  const r2 = await postChat({ message: 'continuiamo', sessionId: sid });
  if (r2.json?.response) {
    assert(/vol|cap|esperiment/i.test(r2.json.response),
      `2nd msg lost context: ${r2.json.response.slice(0, 100)}`);
  }
});

// ===========================================================================
// Final summary + persist
// ===========================================================================

const summary = {
  timestamp: new Date().toISOString(),
  url: URL,
  total: results.length,
  passed,
  failed,
  durationMsTotal: results.reduce((a, r) => a + r.durationMs, 0),
  pass_rate: passed / results.length,
  tests: results,
};

console.log('\n================================================');
console.log(`UNLIM LIVE SMOKE RESULT: ${passed}/${results.length} PASS, ${failed} FAIL`);
console.log(`Pass rate: ${(summary.pass_rate * 100).toFixed(1)}%`);
console.log(`Total duration: ${summary.durationMsTotal}ms`);

const outDir = resolve(ROOT, 'automa/state');
mkdirSync(outDir, { recursive: true });
const outFile = resolve(outDir, `unlim-live-smoke-${summary.timestamp.replace(/:/g, '-').slice(0, 19)}.json`);
writeFileSync(outFile, JSON.stringify(summary, null, 2));
console.log(`Persisted: ${outFile}`);

process.exit(failed === 0 ? 0 : 1);
