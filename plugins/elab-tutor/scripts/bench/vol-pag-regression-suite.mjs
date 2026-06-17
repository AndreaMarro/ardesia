#!/usr/bin/env node
// ELAB Sprint T iter 23 — Vol/pag Regression Suite (PRINCIPIO ZERO V3 conformance)
// generator-test-opus | 2026-04-28
//
// Mide PRINCIPIO ZERO V3 conformance UNLIM responses post-deploy
// commit fdb97d9 (Vol/pag VERBATIM rule). Confronto vs:
//   - iter 22 pre-fix: 0/3 verbatim (smoke prod)
//   - iter 23 post-fix smoke: 5/5 verbatim
//
// Endpoint contract (verified supabase/functions/unlim-chat/index.ts):
//   POST {SUPABASE_EDGE_URL}/functions/v1/unlim-chat
//   headers: { 'Content-Type': 'application/json', apikey, Authorization }
//   body: { message, sessionId, experimentId?, circuitState?, simulatorContext? }
//   response: { success: bool, response: string, ... }
//
// USAGE:
//   SUPABASE_ANON_KEY="<anon>" node scripts/bench/vol-pag-regression-suite.mjs
//
// ENV:
//   UNLIM_EDGE_URL    — default https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat
//   SUPABASE_ANON_KEY — REQUIRED (use VITE_SUPABASE_EDGE_KEY from .env)
//   ELAB_API_KEY      — optional (sent as X-Elab-Api-Key)
//
// OUTPUT:
//   - automa/state/vol-pag-regression-iter23.json
//   - scripts/bench/output/vol-pag-regression-responses-<TS>.jsonl

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const AUTOMA_STATE_DIR = path.resolve(REPO_ROOT, '..', '..', 'automa', 'state');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const REQUEST_TIMEOUT_MS = 30000;
const COLD_RETRY_DELAY_MS = 12000;
const MAX_FAILURES = 6;

if (!SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_ANON_KEY env var REQUIRED.');
  console.error('  Use: SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_EDGE_KEY .env | cut -d= -f2) node scripts/bench/vol-pag-regression-suite.mjs');
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(AUTOMA_STATE_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// 30 GOLD-SET prompts — Italian K-12 ELAB topics
// (LED + resistore + breadboard + Arduino + PWM + pulsante + analogRead + ecc)
// ─────────────────────────────────────────────────────────────────────────────
const GOLD_SET = [
  { id: 'g01', topic: 'LED-base', experimentId: 'v1-cap6-esp1', message: 'Spiegami come collegare un LED al kit Arduino' },
  { id: 'g02', topic: 'resistore-pullup', experimentId: 'v1-cap6-esp1', message: 'Cosa serve la resistenza con il LED?' },
  { id: 'g03', topic: 'breadboard-rails', experimentId: 'v1-cap1-esp1', message: 'Come funzionano le piste della breadboard?' },
  { id: 'g04', topic: 'Arduino-pin', experimentId: 'v3-cap5-esp1', message: 'Cosa significa il pin 13 di Arduino?' },
  { id: 'g05', topic: 'PWM-base', experimentId: 'v3-cap7-esp1', message: 'Cos\'è il PWM e come funziona analogWrite?' },
  { id: 'g06', topic: 'pulsante-pullup', experimentId: 'v2-cap3-esp1', message: 'Perché serve la resistenza pull-up con il pulsante?' },
  { id: 'g07', topic: 'fotoresistore', experimentId: 'v1-cap10-esp1', message: 'Come misuro la luce con il fotoresistore?' },
  { id: 'g08', topic: 'serial-monitor', experimentId: 'v3-cap5-esp1', message: 'A cosa serve Serial.println()?' },
  { id: 'g09', topic: 'blink-loop', experimentId: 'v3-cap5-esp1', message: 'Spiegami il programma Blink' },
  { id: 'g10', topic: 'digitalWrite-HIGH', experimentId: 'v3-cap6-esp1', message: 'Cosa fa digitalWrite(13, HIGH)?' },
  { id: 'g11', topic: 'analogRead-A0', experimentId: 'v3-cap8-esp1', message: 'Come leggo un valore analogico su A0?' },
  { id: 'g12', topic: 'corrente-LED', experimentId: 'v1-cap6-esp1', message: 'Quanta corrente passa nel LED rosso?' },
  { id: 'g13', topic: 'legge-Ohm', experimentId: 'v1-cap5-esp1', message: 'Come applico la legge di Ohm al circuito LED?' },
  { id: 'g14', topic: 'GND-massa', experimentId: 'v1-cap1-esp1', message: 'Cosa è il GND?' },
  { id: 'g15', topic: 'pinMode-OUTPUT', experimentId: 'v3-cap5-esp1', message: 'A cosa serve pinMode(13, OUTPUT)?' },
  { id: 'g16', topic: 'delay-millis', experimentId: 'v3-cap5-esp1', message: 'Differenza tra delay() e millis()?' },
  { id: 'g17', topic: 'condensatore-decoupling', experimentId: 'v2-cap5-esp1', message: 'A cosa serve un condensatore di disaccoppiamento?' },
  { id: 'g18', topic: 'LED-RGB', experimentId: 'v2-cap4-esp1', message: 'Come accendo un LED RGB di colore viola?' },
  { id: 'g19', topic: 'tensione-batteria', experimentId: 'v1-cap2-esp1', message: 'Come misuro la tensione di una pila?' },
  { id: 'g20', topic: 'short-circuit-rischio', experimentId: 'v1-cap1-esp1', message: 'Cos\'è un cortocircuito e perché è pericoloso?' },
  { id: 'g21', topic: 'led-anodo-catodo', experimentId: 'v1-cap6-esp1', message: 'Come distinguo anodo e catodo del LED?' },
  { id: 'g22', topic: 'breadboard-jumpers', experimentId: 'v1-cap1-esp1', message: 'Quali ponticelli uso sulla breadboard?' },
  { id: 'g23', topic: 'sketch-setup', experimentId: 'v3-cap5-esp1', message: 'Cosa devo mettere nella funzione setup()?' },
  { id: 'g24', topic: 'sketch-loop', experimentId: 'v3-cap5-esp1', message: 'Cosa fa la funzione loop() di Arduino?' },
  { id: 'g25', topic: 'pull-down-resistor', experimentId: 'v2-cap3-esp1', message: 'Quando uso una resistenza di pull-down?' },
  { id: 'g26', topic: 'analog-vs-digital', experimentId: 'v3-cap8-esp1', message: 'Differenza tra pin analogici e digitali?' },
  { id: 'g27', topic: 'cicalino-buzzer', experimentId: 'v2-cap6-esp1', message: 'Come faccio suonare il cicalino?' },
  { id: 'g28', topic: 'voltage-divider', experimentId: 'v1-cap10-esp1', message: 'Spiegami il partitore di tensione' },
  { id: 'g29', topic: 'codice-colori-resistenze', experimentId: 'v1-cap5-esp1', message: 'Come leggo il codice colori di una resistenza?' },
  { id: 'g30', topic: 'arduino-alimentazione', experimentId: 'v3-cap5-esp1', message: 'Come alimento Arduino in modo sicuro?' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Metric regexes
// ─────────────────────────────────────────────────────────────────────────────
const RAGAZZI_OPENING = /^\s*(?:[\(\[\{]*)?ragazzi[\s,!:]/i;
const VERBATIM_QUOTE = /[«"]([^«»"]{6,})[»"]/; // quote 6+ chars
const VOL_PAG_CITATION = /\bVol\.?\s*\d+\b.*?(?:cap\.?\s*\d+|pag\.?\s*\d+)/i;
const ANALOGY = /\b(come|simile a|pensa(?:te|ci)?|immagin[ai](?:te)?|è come|paragona|fai conto|ricorda|come (?:un|una|il|la|lo))\b/i;
const KIT_PHYSICAL = /\b(breadboard|kit|montat[eaiou]|costru(?:ite|isce|ire)|fila\s+[a-h]|piastra|pin\s+\d+|jumper|cavo(?:tto)?)\b/i;

function stripActionTags(text) {
  return String(text || '')
    .replace(/\[AZIONE:[^\]]+\]/gi, '')
    .replace(/\[INTENT:\{[^}]*\}\]/g, '')
    .replace(/\[LOAD:[^\]]+\]/gi, '');
}

function wordCount(text) {
  return stripActionTags(text).trim().split(/\s+/).filter(Boolean).length;
}

function evaluateResponse(text) {
  const stripped = stripActionTags(text);
  const wc = wordCount(text);
  const checks = {
    ragazzi_opening: RAGAZZI_OPENING.test(stripped),
    verbatim_quote: VERBATIM_QUOTE.test(stripped),
    vol_pag_citation: VOL_PAG_CITATION.test(stripped),
    word_count_ok: wc <= 60,
    analogy_present: ANALOGY.test(stripped),
    kit_mention: KIT_PHYSICAL.test(stripped),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  return { checks, passed, total, score_pct: (passed / total) * 100, word_count: wc };
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge Function call
// ─────────────────────────────────────────────────────────────────────────────
function buildHeaders() {
  const h = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (ELAB_API_KEY) h['X-Elab-Api-Key'] = ELAB_API_KEY;
  return h;
}

async function callEdge(message, experimentId, sessionId, attempt = 1) {
  const start = Date.now();
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(UNLIM_EDGE_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        message,
        sessionId,
        experimentId: experimentId || null,
        circuitState: null,
        simulatorContext: null,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    const latency = Date.now() - start;
    if (!res.ok) {
      const txt = await res.text();
      const cold = res.status === 503 || res.status === 502 || res.status === 504;
      if (cold && attempt === 1) {
        await new Promise(r => setTimeout(r, COLD_RETRY_DELAY_MS));
        return callEdge(message, experimentId, sessionId, attempt + 1);
      }
      throw new Error(`HTTP ${res.status}: ${txt.slice(0, 240)}`);
    }
    const json = await res.json();
    const responseText = json.response || json.message || json.text || '';
    return { responseText, latency, raw: json };
  } catch (err) {
    clearTimeout(tid);
    if (err.name === 'AbortError' && attempt === 1) {
      await new Promise(r => setTimeout(r, 4000));
      return callEdge(message, experimentId, sessionId, attempt + 1);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const sessionId = `s_volpag_iter23_${TIMESTAMP}_${Math.random().toString(36).slice(2, 8)}`;
  const responsesPath = path.join(OUT_DIR, `vol-pag-regression-responses-${TIMESTAMP}.jsonl`);
  const respStream = fs.createWriteStream(responsesPath);

  console.log(`[vol-pag iter23] Endpoint: ${UNLIM_EDGE_URL}`);
  console.log(`[vol-pag iter23] Gold-set: ${GOLD_SET.length} prompts`);
  console.log(`[vol-pag iter23] Session: ${sessionId}\n`);

  const results = [];
  let failures = 0;

  for (const fx of GOLD_SET) {
    process.stdout.write(`[${fx.id}] ${fx.topic.padEnd(28)}: `);
    try {
      const { responseText, latency, raw } = await callEdge(fx.message, fx.experimentId, sessionId);
      const ev = evaluateResponse(responseText);
      console.log(`${latency}ms ${ev.word_count}w ${ev.passed}/${ev.total} ${ev.checks.vol_pag_citation ? 'VOL✓' : 'VOL✗'} ${ev.checks.verbatim_quote ? 'V✓' : 'V✗'}`);
      const record = {
        id: fx.id,
        topic: fx.topic,
        experimentId: fx.experimentId,
        message: fx.message,
        response_text: responseText,
        latency_ms: latency,
        word_count: ev.word_count,
        checks: ev.checks,
        passed: ev.passed,
        total: ev.total,
        score_pct: ev.score_pct,
        raw_keys: Object.keys(raw || {}),
      };
      results.push(record);
      respStream.write(JSON.stringify(record) + '\n');
    } catch (err) {
      failures++;
      console.log(`FAIL: ${err.message}`);
      results.push({ id: fx.id, topic: fx.topic, error: err.message });
      if (failures >= MAX_FAILURES) {
        console.error(`\n[vol-pag iter23] HALT: ${failures} failures.`);
        break;
      }
    }
  }
  respStream.end();
  await new Promise(r => respStream.on('finish', r));

  // ───── Aggregate ─────
  const successful = results.filter(r => !r.error);
  const aggregate = {
    ragazzi_opening: 0,
    verbatim_quote: 0,
    vol_pag_citation: 0,
    word_count_ok: 0,
    analogy_present: 0,
    kit_mention: 0,
  };
  for (const r of successful) {
    for (const k of Object.keys(aggregate)) {
      if (r.checks?.[k]) aggregate[k]++;
    }
  }
  const n = successful.length || 1;
  const pct = Object.fromEntries(Object.entries(aggregate).map(([k, v]) => [k, +(v / n * 100).toFixed(1)]));

  const overallPasses = successful.reduce((s, r) => s + (r.passed || 0), 0);
  const overallTotal = successful.reduce((s, r) => s + (r.total || 0), 0);
  const overallPct = overallTotal ? +(overallPasses / overallTotal * 100).toFixed(2) : 0;
  const volPagPct = pct.vol_pag_citation;

  const summary = {
    iter: 23,
    deploy_commit: 'fdb97d9',
    timestamp: TIMESTAMP,
    endpoint: UNLIM_EDGE_URL,
    fixtures_total: GOLD_SET.length,
    fixtures_successful: successful.length,
    fixtures_failed: failures,
    overall_score_pct: overallPct,
    target_pct: 90,
    target_met: overallPct >= 90,
    vol_pag_conformance_pct: volPagPct,
    vol_pag_target_pct: 90,
    vol_pag_target_met: volPagPct >= 90,
    aggregate_counts: aggregate,
    aggregate_pct: pct,
    iter_22_baseline_vol_pag_pct: 0,
    iter_23_smoke_vol_pag_pct: 100,
    delta_vs_iter_22_pp: +(volPagPct - 0).toFixed(2),
    per_prompt: results.map(r => ({
      id: r.id,
      topic: r.topic,
      experimentId: r.experimentId,
      passed: r.passed,
      total: r.total,
      score_pct: r.score_pct,
      checks: r.checks,
      word_count: r.word_count,
      latency_ms: r.latency_ms,
      error: r.error,
    })),
  };

  const outPath = path.join(AUTOMA_STATE_DIR, 'vol-pag-regression-iter23.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));

  console.log('\n=== AGGREGATE ===');
  console.log(`Overall conformance: ${overallPct}% (target 90%) ${overallPct >= 90 ? 'PASS' : 'WARN'}`);
  console.log(`Vol/pag conformance: ${volPagPct}% (target 90%) ${volPagPct >= 90 ? 'PASS' : 'WARN'}`);
  for (const [k, v] of Object.entries(pct)) console.log(`  ${k.padEnd(22)} ${v}%`);
  console.log(`\nResults JSONL: ${responsesPath}`);
  console.log(`Summary JSON:  ${outPath}\n`);

  process.exit(overallPct >= 90 ? 0 : 1);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(2);
});
