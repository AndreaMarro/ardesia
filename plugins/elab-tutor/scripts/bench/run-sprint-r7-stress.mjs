#!/usr/bin/env node
// ELAB Sprint T iter 37 Phase 3 fix — R7 Stress Bench Runner
// Tester-2 | 2026-04-30
//
// Sprint T iter 37 Phase 3 fix Atom A7-R7: server-side INTENT parser quality
// over the 200-prompt iter-12 seed fixture (10 categories x 20 prompts each)
// against prod Edge Function `unlim-chat`.
//
// Per Atom spec, the runner measures three signals on each response's
// `intents_parsed` array (surfaced by unlim-chat/index.ts:619 when the LLM
// emits `[INTENT:{tool,args}]` tags):
//   (1) shape valid (each item has `tool` string + `args` object)
//   (2) action whitelist match (subset of 12-action whitelist from
//       src/components/lavagna/intentsDispatcher.js ALLOWED_INTENT_ACTIONS)
//   (3) params shape per action (e.g. `highlightComponent` requires
//       `args.ids: string[]`)
//
// Acceptance: ≥80% prompts produce ≥1 valid executable intent
// (160/200 PASS minimum).
//
// HONESTY CAVEAT — server-side parser quality only, NOT end-to-end browser
// dispatch. INTENT execution in the browser via `__ELAB_API` requires Vercel
// frontend deploy of `useGalileoChat.js` iter 36 wire-up, which is independent
// of the Edge Function INTENT parser measured here.
//
// HONESTY CAVEAT 2 — many fixture prompts trigger the L2 template router
// (`clawbot-template-router`) which BYPASSES the LLM entirely and emits
// `[AZIONE:tool:{...}]` syntax (NOT `[INTENT:{tool,args}]`). The
// `intents_parsed` array on those responses is therefore null/empty.
// We bucket those separately as `template_shortcut`. As a SECONDARY signal
// we ALSO count `[AZIONE:...]` regex hits in the response text (legacy
// surface). The PRIMARY pass criterion remains the canonical `intents_parsed`
// array per ADR-028 §14.
//
// Endpoint: prod elab-unlim Edge Function (same auth as run-sprint-r5-stress.mjs).
//
// Usage:
//   SUPABASE_ANON_KEY="<anon>" ELAB_API_KEY="<key>" \
//     node scripts/bench/run-sprint-r7-stress.mjs
//
// Output:
//   - scripts/bench/output/r7-stress-responses-<TS>.jsonl
//   - scripts/bench/output/r7-stress-scores-<TS>.json
//   - scripts/bench/output/r7-stress-report-<TS>.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'r7-fixture.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r7-stress-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r7-stress-report-${TIMESTAMP}.md`);
const SCORES_OUT = path.join(OUT_DIR, `r7-stress-scores-${TIMESTAMP}.json`);

const REQUEST_TIMEOUT_MS = 45000;
const COLD_START_RETRY_DELAY_MS = 15000;
const MAX_TOTAL_FAILURES = 30;

const R7_TARGET_PROMPTS = 200;
const R7_PASS_THRESHOLD = 0.80;

// 12-action whitelist mirroring src/components/lavagna/intentsDispatcher.js
// ALLOWED_INTENT_ACTIONS (verified 2026-04-30 file-system).
const ALLOWED_INTENT_ACTIONS = new Set([
  'highlightComponent',
  'highlightPin',
  'clearHighlights',
  'mountExperiment',
  'getCircuitState',
  'getCircuitDescription',
  'captureScreenshot',
  'serialWrite',
  'setComponentValue',
  'connectWire',
  'clearCircuit',
  'toggleDrawing',
]);

// Per-action params shape requirements (subset — applied opportunistically).
const PARAMS_SHAPE_RULES = {
  highlightComponent: (args) => Array.isArray(args?.ids) && args.ids.every(x => typeof x === 'string'),
  highlightPin:       (args) => Array.isArray(args?.pins) && args.pins.every(x => typeof x === 'string'),
  mountExperiment:    (args) => typeof args?.experimentId === 'string' && args.experimentId.length > 0,
  serialWrite:        (args) => typeof args?.text === 'string',
  setComponentValue:  (args) => typeof args?.id === 'string' && typeof args?.param === 'string',
  connectWire:        (args) => typeof args?.from === 'string' && typeof args?.to === 'string',
  toggleDrawing:      (args) => typeof args?.enabled === 'boolean',
  clearHighlights:    () => true,
  getCircuitState:    () => true,
  getCircuitDescription: () => true,
  captureScreenshot:  () => true,
  clearCircuit:       () => true,
};

if (!SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_ANON_KEY env var REQUIRED for Edge Function R7 stress.');
  console.error('       Re-run: SUPABASE_ANON_KEY=<key> ELAB_API_KEY=<key> node scripts/bench/run-sprint-r7-stress.mjs');
  process.exit(1);
}

if (!fs.existsSync(FIXTURE)) {
  console.error(`ERROR: Fixture ${FIXTURE} not found.`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').filter(Boolean).map(JSON.parse);
console.log(`[R7-stress] Loaded ${fixture.length} fixtures from ${path.relative(REPO_ROOT, FIXTURE)}`);
console.log(`[R7-stress] Endpoint: ${UNLIM_EDGE_URL}`);
console.log(`[R7-stress] Auth: apikey + Authorization Bearer (anon JWT)${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ' (NO X-Elab-Api-Key — fail-open server-side)'}`);
console.log(`[R7-stress] Timestamp: ${TIMESTAMP}`);
console.log(`[R7-stress] Whitelist: ${[...ALLOWED_INTENT_ACTIONS].join(', ')}`);

const byCategory = {};
for (const fx of fixture) {
  const cat = fx.category || 'uncategorized';
  byCategory[cat] = (byCategory[cat] || 0) + 1;
}
console.log(`[R7-stress] Categories:`, byCategory);

const responsesStream = fs.createWriteStream(RESPONSES_OUT);
const results = [];
let failures = 0;

function makeSessionId() {
  return `s_r7_${TIMESTAMP.replace(/-/g,'').slice(0,12)}_${crypto.randomUUID().slice(0,8)}`;
}

function buildHeaders() {
  const h = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (ELAB_API_KEY) h['X-Elab-Api-Key'] = ELAB_API_KEY;
  return h;
}

async function callEdge(userMessage, experimentId, sessionId, attempt = 1) {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(UNLIM_EDGE_URL, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        message: userMessage,
        sessionId,
        experimentId: experimentId || null,
        circuitState: null,
        simulatorContext: null,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    if (!res.ok) {
      const txt = await res.text();
      const isCold = res.status === 503 || res.status === 502 || res.status === 504;
      if (isCold && attempt === 1) {
        console.log(`  ↳ HTTP ${res.status} (cold start), waiting ${COLD_START_RETRY_DELAY_MS / 1000}s and retrying...`);
        await new Promise(r => setTimeout(r, COLD_START_RETRY_DELAY_MS));
        return callEdge(userMessage, experimentId, sessionId, attempt + 1);
      }
      throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
    }
    const json = await res.json();
    return { latency, raw: json };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError' && attempt === 1) {
      console.log(`  ↳ timeout after ${REQUEST_TIMEOUT_MS}ms, retrying once...`);
      await new Promise(r => setTimeout(r, 5000));
      return callEdge(userMessage, experimentId, sessionId, attempt + 1);
    }
    throw err;
  }
}

/**
 * Score a single intent record. Returns { shape_ok, whitelist_ok, params_ok }.
 */
function scoreIntent(intent) {
  // shape_ok: tool string + args object.
  const tool = typeof intent?.tool === 'string' ? intent.tool
    : typeof intent?.action === 'string' ? intent.action : null;
  const args = (intent?.args && typeof intent.args === 'object') ? intent.args
    : (intent?.params && typeof intent.params === 'object') ? intent.params : null;
  const shape_ok = !!(tool && args !== null);

  const whitelist_ok = !!(tool && ALLOWED_INTENT_ACTIONS.has(tool));

  let params_ok = false;
  if (whitelist_ok && shape_ok) {
    const rule = PARAMS_SHAPE_RULES[tool];
    params_ok = rule ? !!rule(args) : true; // unknown rule => pass-through (rare)
  }
  return { tool, shape_ok, whitelist_ok, params_ok };
}

// Legacy [AZIONE:tool:{...}] secondary surface scanner (template path output).
const AZIONE_REGEX = /\[AZIONE:([a-zA-Z]+):(\{[^\]]*\})\]/g;
function countAzioneTags(text) {
  if (!text || typeof text !== 'string') return { total: 0, whitelistHits: 0, tools: [] };
  let m;
  let total = 0;
  let whitelistHits = 0;
  const tools = [];
  AZIONE_REGEX.lastIndex = 0;
  while ((m = AZIONE_REGEX.exec(text)) !== null) {
    total += 1;
    const tool = m[1];
    tools.push(tool);
    if (ALLOWED_INTENT_ACTIONS.has(tool)) whitelistHits += 1;
  }
  return { total, whitelistHits, tools };
}

async function main() {
  console.log('\n=== Running R7 stress fixture against prod Edge Function unlim-chat ===\n');

  for (let idx = 0; idx < fixture.length; idx++) {
    const fx = fixture[idx];
    const sessionId = makeSessionId();
    process.stdout.write(`[${(idx + 1).toString().padStart(3)}/${fixture.length}] ${fx.id} (${(fx.category || '?').padEnd(20)}): `);
    try {
      const { latency, raw } = await callEdge(fx.prompt, fx.experimentId || null, sessionId);
      const intents = Array.isArray(raw.intents_parsed) ? raw.intents_parsed : [];
      const isTemplateShortcut = !!raw.template_id || raw.source?.startsWith?.('clawbot-l2-');
      const azione = countAzioneTags(raw.response || '');

      const perIntentScores = intents.map(scoreIntent);
      const validExecutableCount = perIntentScores.filter(s => s.shape_ok && s.whitelist_ok && s.params_ok).length;
      const hasValidExecutable = validExecutableCount >= 1;

      const row = {
        fixture_id: fx.id,
        category: fx.category,
        prompt: fx.prompt,
        expected_intent: fx.expected_intent || null,
        latency_ms: latency,
        source: raw.source || null,
        template_id: raw.template_id || null,
        template_shortcut: isTemplateShortcut,
        intents_parsed: intents,
        intents_count: intents.length,
        per_intent_scores: perIntentScores,
        valid_executable_count: validExecutableCount,
        has_valid_executable: hasValidExecutable,
        // Secondary [AZIONE:...] legacy surface
        azione_total: azione.total,
        azione_whitelist_hits: azione.whitelistHits,
        azione_tools: azione.tools,
        response_text_excerpt: (raw.response || '').slice(0, 200),
      };

      const verdict = hasValidExecutable ? 'PASS'
        : (azione.whitelistHits >= 1 ? 'PASS_LEGACY' : 'FAIL');
      console.log(`${latency}ms intents=${intents.length} valid=${validExecutableCount} azione=${azione.total} (${verdict}) [src=${raw.source || '?'}]`);
      results.push(row);
      responsesStream.write(JSON.stringify(row) + '\n');
    } catch (err) {
      failures++;
      console.log(`FAIL: ${err.message}`);
      const row = {
        fixture_id: fx.id,
        category: fx.category,
        error: err.message,
      };
      results.push(row);
      responsesStream.write(JSON.stringify(row) + '\n');
      if (failures >= MAX_TOTAL_FAILURES) {
        console.error(`\n[R7-stress] HALT: ${failures} failures reached threshold. Endpoint likely degraded.`);
        break;
      }
    }
  }
  responsesStream.end();
  await new Promise(r => responsesStream.on('finish', r));

  console.log(`\n[R7-stress] Responses written: ${path.relative(REPO_ROOT, RESPONSES_OUT)}`);

  const successful = results.filter(r => !r.error);
  const withCanonicalIntent = successful.filter(r => r.has_valid_executable);
  const withLegacyAzione = successful.filter(r => !r.has_valid_executable && r.azione_whitelist_hits >= 1);
  const noIntent = successful.filter(r => !r.has_valid_executable && r.azione_whitelist_hits === 0);

  // Primary metric: % prompts with valid canonical intent_parsed.
  const canonicalRate = successful.length === 0 ? 0
    : withCanonicalIntent.length / successful.length;
  // Combined: canonical + legacy.
  const combinedRate = successful.length === 0 ? 0
    : (withCanonicalIntent.length + withLegacyAzione.length) / successful.length;

  // Shape / whitelist stats.
  const allIntents = successful.flatMap(r => r.per_intent_scores || []);
  const totalIntentsCount = allIntents.length;
  const shapeValidCount = allIntents.filter(s => s.shape_ok).length;
  const whitelistMatchCount = allIntents.filter(s => s.whitelist_ok).length;
  const paramsValidCount = allIntents.filter(s => s.params_ok).length;
  const shapeValidPct = totalIntentsCount === 0 ? 0 : shapeValidCount / totalIntentsCount;
  const whitelistMatchPct = totalIntentsCount === 0 ? 0 : whitelistMatchCount / totalIntentsCount;
  const paramsValidPct = totalIntentsCount === 0 ? 0 : paramsValidCount / totalIntentsCount;

  const verdict = canonicalRate >= R7_PASS_THRESHOLD ? 'PASS'
    : (combinedRate >= R7_PASS_THRESHOLD ? 'PASS_COMBINED' : 'FAIL');

  // Per-category breakdown.
  const byCat = {};
  for (const r of successful) {
    const cat = r.category || 'uncategorized';
    if (!byCat[cat]) byCat[cat] = { total: 0, canonical: 0, legacy: 0, none: 0 };
    byCat[cat].total += 1;
    if (r.has_valid_executable) byCat[cat].canonical += 1;
    else if (r.azione_whitelist_hits >= 1) byCat[cat].legacy += 1;
    else byCat[cat].none += 1;
  }
  for (const cat of Object.keys(byCat)) {
    const b = byCat[cat];
    b.canonicalRate = b.total > 0 ? b.canonical / b.total : 0;
    b.combinedRate = b.total > 0 ? (b.canonical + b.legacy) / b.total : 0;
  }

  const avgLatency = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length) : 0;

  const lats = successful.map(r => r.latency_ms).sort((a, b) => a - b);
  const pct = (p) => lats.length === 0 ? 0 : lats[Math.min(lats.length - 1, Math.floor(p * lats.length))];

  const scoresJson = {
    bench: 'R7-stress',
    timestamp: TIMESTAMP,
    fixture: path.relative(REPO_ROOT, FIXTURE),
    fixture_count: fixture.length,
    endpoint: UNLIM_EDGE_URL,
    success_count: successful.length,
    failure_count: failures,
    canonical_intent_count: withCanonicalIntent.length,
    legacy_azione_count: withLegacyAzione.length,
    no_intent_count: noIntent.length,
    canonical_rate: canonicalRate,
    combined_rate: combinedRate,
    pass_threshold: R7_PASS_THRESHOLD,
    verdict,
    intent_aggregate: {
      total_intents: totalIntentsCount,
      shape_valid_count: shapeValidCount,
      whitelist_match_count: whitelistMatchCount,
      params_valid_count: paramsValidCount,
      shape_valid_pct: shapeValidPct,
      whitelist_match_pct: whitelistMatchPct,
      params_valid_pct: paramsValidPct,
    },
    latency_avg_ms: avgLatency,
    latency_p50_ms: pct(0.5),
    latency_p95_ms: pct(0.95),
    latency_p99_ms: pct(0.99),
    by_category: byCat,
  };
  fs.writeFileSync(SCORES_OUT, JSON.stringify(scoresJson, null, 2));

  const catRows = Object.entries(byCat).map(([cat, b]) =>
    `| ${cat} | ${b.total} | ${b.canonical} | ${b.legacy} | ${b.none} | ${(b.canonicalRate * 100).toFixed(1)}% | ${(b.combinedRate * 100).toFixed(1)}% |`).join('\n');

  const report = `# Sprint T iter 37 Phase 3 fix — R7 Stress (INTENT exec rate) ${TIMESTAMP}

> Server-side INTENT parser quality over the 200-prompt iter-12 seed fixture
> (10 categories x 20 prompts) against prod Edge Function \`unlim-chat\`.
> Measures \`intents_parsed\` array shape + whitelist match + params shape.
> Acceptance: ≥${(R7_PASS_THRESHOLD * 100).toFixed(0)}% prompts produce ≥1 valid executable intent.

## Setup

- **Endpoint**: \`${UNLIM_EDGE_URL}\`
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts)
- **Generator**: scripts/bench/run-sprint-r7-stress.mjs
- **Whitelist**: 12 actions from \`src/components/lavagna/intentsDispatcher.js\` ALLOWED_INTENT_ACTIONS

## Aggregate

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| Successful | ${successful.length}/${fixture.length} | — | — |
| Failures | ${failures} | — | — |
| Canonical \`intents_parsed\` (≥1 valid) | ${withCanonicalIntent.length} | — | — |
| Legacy \`[AZIONE:...]\` only | ${withLegacyAzione.length} | — | — |
| No actionable signal | ${noIntent.length} | — | — |
| **Canonical INTENT exec rate** | **${(canonicalRate * 100).toFixed(1)}%** | ≥${(R7_PASS_THRESHOLD * 100).toFixed(0)}% | **${verdict === 'PASS' ? 'PASS' : 'FAIL'}** |
| Combined (canonical + legacy AZIONE) | ${(combinedRate * 100).toFixed(1)}% | ≥${(R7_PASS_THRESHOLD * 100).toFixed(0)}% | ${verdict === 'PASS_COMBINED' ? 'PASS_COMBINED' : (combinedRate >= R7_PASS_THRESHOLD ? 'PASS' : 'FAIL')} |

## Intent quality (across all canonical intents seen)

| Metric | Count | % |
|--------|-------|---|
| Total intents emitted | ${totalIntentsCount} | — |
| Shape valid (tool + args) | ${shapeValidCount} | ${(shapeValidPct * 100).toFixed(1)}% |
| Whitelist match | ${whitelistMatchCount} | ${(whitelistMatchPct * 100).toFixed(1)}% |
| Params shape valid | ${paramsValidCount} | ${(paramsValidPct * 100).toFixed(1)}% |

## Latency

| Metric | Value |
|--------|-------|
| Avg | ${avgLatency}ms |
| p50 | ${pct(0.5)}ms |
| p95 | ${pct(0.95)}ms |
| p99 | ${pct(0.99)}ms |

## Per-category breakdown

| Category | Total | Canonical | Legacy AZIONE | None | Canonical % | Combined % |
|----------|-------|-----------|---------------|------|-------------|------------|
${catRows}

## Honesty caveats

1. **Server-side parser quality only** — INTENT execution in the browser via
   \`__ELAB_API\` requires Vercel frontend deploy of \`useGalileoChat.js\` iter
   36 wire-up. This bench measures the SERVER-SIDE \`intent-parser.ts\`
   output surfaced as \`intents_parsed\`; it does NOT verify end-to-end
   browser dispatch.
2. **Template router shortcut bypasses LLM** — when the L2
   \`clawbot-template-router\` matches a prompt, it returns a hardcoded
   response with legacy \`[AZIONE:tool:{...}]\` syntax (NOT canonical
   \`[INTENT:{tool,args}]\`). \`intents_parsed\` on those responses is null.
   We bucket those as "Legacy AZIONE" prompts and report a combined rate as
   a SECONDARY signal. Primary acceptance is canonical INTENT only.
3. **PASS gate ≥80%** baseline per Atom A7-R7. The combined rate is
   reported alongside but is NOT the official pass criterion.
4. **Whitelist of 12 actions** mirrors \`src/components/lavagna/intentsDispatcher.js\`
   ALLOWED_INTENT_ACTIONS exactly (verified 2026-04-30 file-system).

## Verdict

- **Canonical INTENT exec rate**: ${(canonicalRate * 100).toFixed(1)}% (target ≥${(R7_PASS_THRESHOLD * 100).toFixed(0)}%)
- **Combined rate**: ${(combinedRate * 100).toFixed(1)}%
- **Verdict**: ${verdict}

## Files

- Raw responses: ${path.relative(REPO_ROOT, RESPONSES_OUT)}
- Scorer JSON: ${path.relative(REPO_ROOT, SCORES_OUT)}
- This report: ${path.relative(REPO_ROOT, REPORT_OUT)}
`;
  fs.writeFileSync(REPORT_OUT, report);
  console.log(`\n[R7-stress] Report: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
  console.log(`[R7-stress] Verdict: ${verdict} (canonical=${(canonicalRate * 100).toFixed(1)}%, combined=${(combinedRate * 100).toFixed(1)}%)`);
}

main().catch(err => {
  console.error('[R7-stress] FATAL:', err);
  process.exit(1);
});
