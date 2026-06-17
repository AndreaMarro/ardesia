#!/usr/bin/env node
// ELAB Sprint T iter 37 Phase 3 fix — R6 Stress Bench Runner
// Tester-2 | 2026-04-30
//
// Sprint T iter 37 Phase 3 fix Atom A7-R6: hybrid RAG recall@5 metric over the
// 100-prompt iter 8 seed fixture against the prod Edge Function `unlim-chat`
// at https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat.
//
// Per Atom spec, recall@5 is computed by intersecting the top-5 retrieved
// chunks (returned in `debug_retrieval` when the request body sets
// `debug_retrieval:true`) with each fixture's "expected" set.
//
// Fixture format (r6-fixture-100.jsonl, 100 prompts):
//   {
//     "id": "r6-001",
//     "category": "plurale_ragazzi",
//     "prompt": "Spiega ai ragazzi cos'e un LED.",
//     "expected_intent": "definition_with_plural",
//     "metadata": { "vol": "1", "pag": "27", "keywords": ["LED","ragazzi","luce"] }
//   }
//
// HONESTY CAVEAT (file-system verified, smoke 4 evidence):
//   The fixture spec'd in the original PDR (`expected_chunks: [chunk_ids]`) is
//   NOT what's on disk — the fixture has `metadata.vol/pag/keywords` instead.
//   We adapt: a chunk is considered "matching" when EITHER
//     (a) its `page` matches `metadata.pag` AND `corpus === "rag"` (volume
//         retrieval) AND its content_preview overlaps a metadata keyword, OR
//     (b) at least one metadata keyword appears in `content_preview` /
//         `chunk_id` / `section_title` (case-insensitive).
//   recall@5 = |matched_in_top5| / max(1, expected_signal_count) where
//   expected_signal_count = 1 (vol+pag pair) + len(keywords) for granularity.
//   Verdict: PASS recall@5_avg ≥ 0.55 / WARN [0.45-0.55) / FAIL <0.45.
//
// ALSO HONEST: many prompts in the fixture trigger the L2 template router
// (`clawbot-template-router` short-circuit) which BYPASSES RAG. For those
// prompts the response will NOT include `debug_retrieval` and recall is
// recorded as `null` (template_shortcut). Verdict aggregation excludes
// template_shortcut prompts from the average — they form a separate bucket.
//
// Endpoint: prod elab-unlim Edge Function (same auth as run-sprint-r5-stress.mjs).
//
// Usage:
//   SUPABASE_ANON_KEY="<anon>" ELAB_API_KEY="<key>" \
//     node scripts/bench/run-sprint-r6-stress.mjs
//
// Output:
//   - scripts/bench/output/r6-stress-responses-<TS>.jsonl  (per-prompt detail)
//   - scripts/bench/output/r6-stress-scores-<TS>.json      (aggregate scoring)
//   - scripts/bench/output/r6-stress-report-<TS>.md        (summary report)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
// Default to 100-prompt fixture per PDR Atom A7-R6.
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'r6-fixture-100.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r6-stress-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r6-stress-report-${TIMESTAMP}.md`);
const SCORES_OUT = path.join(OUT_DIR, `r6-stress-scores-${TIMESTAMP}.json`);

const REQUEST_TIMEOUT_MS = 45000;
const COLD_START_RETRY_DELAY_MS = 15000;
const MAX_TOTAL_FAILURES = 15;

const R6_TARGET_PROMPTS = 100;
const R6_PASS_THRESHOLD = 0.55;
const R6_WARN_THRESHOLD = 0.45;

if (!SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_ANON_KEY env var REQUIRED for Edge Function R6 stress.');
  console.error('       Re-run: SUPABASE_ANON_KEY=<key> ELAB_API_KEY=<key> node scripts/bench/run-sprint-r6-stress.mjs');
  process.exit(1);
}

if (!fs.existsSync(FIXTURE)) {
  console.error(`ERROR: Fixture ${FIXTURE} not found.`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').filter(Boolean).map(JSON.parse);
console.log(`[R6-stress] Loaded ${fixture.length} fixtures from ${path.relative(REPO_ROOT, FIXTURE)}`);
console.log(`[R6-stress] Endpoint: ${UNLIM_EDGE_URL}`);
console.log(`[R6-stress] Auth: apikey + Authorization Bearer (anon JWT)${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ' (NO X-Elab-Api-Key — fail-open server-side)'}`);
console.log(`[R6-stress] Timestamp: ${TIMESTAMP}`);
console.log(`[R6-stress] debug_retrieval: true (request RAG chunks surface)`);

const byCategory = {};
for (const fx of fixture) {
  const cat = fx.category || 'uncategorized';
  byCategory[cat] = (byCategory[cat] || 0) + 1;
}
console.log(`[R6-stress] Categories:`, byCategory);

const responsesStream = fs.createWriteStream(RESPONSES_OUT);
const results = [];
let failures = 0;

function makeSessionId() {
  // crypto.randomUUID per Atom spec. SessionId pattern matches validateSessionId() expected.
  return `s_r6_${TIMESTAMP.replace(/-/g,'').slice(0,12)}_${crypto.randomUUID().slice(0,8)}`;
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
        debug_retrieval: true,
        top_k: 5,
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
 * Adapted recall@5 — see file header HONESTY CAVEAT block.
 * Returns null when retrieval data absent (template_shortcut).
 */
function computeRecallAt5(metadata, debugRetrieval) {
  if (!debugRetrieval || !Array.isArray(debugRetrieval) || debugRetrieval.length === 0) {
    return { recall: null, reason: 'no_retrieval_data', matched: 0, expected: 0 };
  }
  const top5 = debugRetrieval.slice(0, 5);
  const expectedKeywords = (metadata?.keywords || []).map(k => String(k).toLowerCase());
  const expectedVol = metadata?.vol ? String(metadata.vol).trim() : null;
  const expectedPag = metadata?.pag ? String(metadata.pag).trim() : null;

  // Build "expected signal" set: 1 entry for the vol+pag pair (if present),
  // plus 1 entry per keyword. expected_count = max(1, signals).
  let expectedSignals = expectedKeywords.length;
  const wantsVolPag = expectedVol && expectedPag;
  if (wantsVolPag) expectedSignals += 1;
  if (expectedSignals === 0) expectedSignals = 1; // avoid div-by-zero

  let matched = 0;
  let volPagMatched = false;
  const matchedKeywords = new Set();
  const matchDetail = [];

  for (const chunk of top5) {
    const corpus = String(chunk.corpus || '').toLowerCase();
    const page = chunk.page !== null && chunk.page !== undefined ? String(chunk.page).trim() : '';
    const chunkId = String(chunk.chunk_id || chunk.id || '').toLowerCase();
    const contentPreview = String(chunk.content_preview || chunk.content || '').toLowerCase();
    const sectionTitle = String(chunk.section_title || '').toLowerCase();
    const haystack = `${chunkId} ${contentPreview} ${sectionTitle}`;

    // Vol+pag match: page exact match AND corpus rag.
    if (wantsVolPag && !volPagMatched && corpus === 'rag' && page === expectedPag) {
      // Bonus: keyword presence in haystack increases confidence.
      const kwHit = expectedKeywords.some(kw => haystack.includes(kw));
      if (kwHit) {
        volPagMatched = true;
        matched += 1;
        matchDetail.push({ chunk_id: chunkId, type: 'vol_pag_kw', page, corpus });
      }
    }

    // Keyword matches (each keyword counts once across the top-5).
    for (const kw of expectedKeywords) {
      if (matchedKeywords.has(kw)) continue;
      if (haystack.includes(kw)) {
        matchedKeywords.add(kw);
        matched += 1;
        matchDetail.push({ chunk_id: chunkId, type: 'keyword', kw });
      }
    }
  }

  const recall = matched / expectedSignals;
  return {
    recall: Math.min(1, recall),
    matched,
    expected: expectedSignals,
    matchDetail,
    volPagMatched,
    keywordsMatched: Array.from(matchedKeywords),
    reason: 'computed',
  };
}

async function main() {
  console.log('\n=== Running R6 stress fixture against prod Edge Function unlim-chat ===\n');

  for (let idx = 0; idx < fixture.length; idx++) {
    const fx = fixture[idx];
    const sessionId = makeSessionId();
    process.stdout.write(`[${(idx + 1).toString().padStart(3)}/${fixture.length}] ${fx.id} (${(fx.category || '?').padEnd(20)}): `);
    try {
      const { latency, raw } = await callEdge(fx.prompt, fx.experimentId || null, sessionId);
      const debugRetrieval = raw.debug_retrieval || null;
      const retrievedTop5 = Array.isArray(debugRetrieval) ? debugRetrieval.slice(0, 5).map(c => ({
        chunk_id: c.chunk_id ?? c.id ?? null,
        corpus: c.corpus ?? null,
        page: c.page ?? null,
        score: c.score ?? c.rrf_score ?? c.similarity ?? null,
        content_preview: c.content_preview ?? null,
        section_title: c.section_title ?? null,
      })) : [];
      const recallResult = computeRecallAt5(fx.metadata, debugRetrieval);
      const isTemplateShortcut = !!raw.template_id || raw.source?.startsWith?.('clawbot-l2-');

      const row = {
        fixture_id: fx.id,
        category: fx.category,
        prompt: fx.prompt,
        expected_intent: fx.expected_intent || null,
        metadata: fx.metadata || null,
        latency_ms: latency,
        source: raw.source || null,
        template_id: raw.template_id || null,
        template_shortcut: isTemplateShortcut,
        retrieval_mode: raw.retrieval_mode || null,
        debug_retrieval_count: Array.isArray(debugRetrieval) ? debugRetrieval.length : 0,
        retrieved_top5: retrievedTop5,
        recall_at_5: recallResult.recall,
        recall_reason: recallResult.reason,
        recall_matched: recallResult.matched,
        recall_expected: recallResult.expected,
        recall_detail: recallResult.matchDetail || null,
        prompt_class: raw.prompt_class || null,
        response_text: raw.response || null,
        intents_parsed_count: Array.isArray(raw.intents_parsed) ? raw.intents_parsed.length : 0,
      };

      const verdict = recallResult.recall === null
        ? 'TEMPLATE_SHORTCUT'
        : (recallResult.recall >= R6_PASS_THRESHOLD ? 'PASS' : recallResult.recall >= R6_WARN_THRESHOLD ? 'WARN' : 'FAIL');
      console.log(`${latency}ms recall@5=${recallResult.recall === null ? 'N/A' : recallResult.recall.toFixed(2)} (${verdict}) [src=${raw.source || '?'}]`);
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
        console.error(`\n[R6-stress] HALT: ${failures} failures reached threshold. Endpoint likely degraded.`);
        break;
      }
    }
  }
  responsesStream.end();
  await new Promise(r => responsesStream.on('finish', r));

  console.log(`\n[R6-stress] Responses written: ${path.relative(REPO_ROOT, RESPONSES_OUT)}`);

  const successful = results.filter(r => !r.error);
  const measured = successful.filter(r => r.recall_at_5 !== null && r.recall_at_5 !== undefined);
  const templateShortcut = successful.filter(r => r.recall_at_5 === null);

  // Aggregate recall@5 over MEASURED prompts only.
  const avgRecall = measured.length === 0 ? 0
    : measured.reduce((s, r) => s + r.recall_at_5, 0) / measured.length;

  // Per-category breakdown.
  const byCat = {};
  for (const r of successful) {
    const cat = r.category || 'uncategorized';
    if (!byCat[cat]) byCat[cat] = { measured: 0, sumRecall: 0, templateShortcut: 0, errors: 0, total: 0 };
    byCat[cat].total += 1;
    if (r.recall_at_5 !== null && r.recall_at_5 !== undefined) {
      byCat[cat].measured += 1;
      byCat[cat].sumRecall += r.recall_at_5;
    } else {
      byCat[cat].templateShortcut += 1;
    }
  }
  for (const cat of Object.keys(byCat)) {
    const b = byCat[cat];
    b.avgRecall = b.measured > 0 ? b.sumRecall / b.measured : null;
  }

  const verdict = avgRecall >= R6_PASS_THRESHOLD ? 'PASS'
    : avgRecall >= R6_WARN_THRESHOLD ? 'WARN' : 'FAIL';

  const avgLatency = successful.length
    ? Math.round(successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length) : 0;

  // Latency percentiles.
  const lats = successful.map(r => r.latency_ms).sort((a, b) => a - b);
  const pct = (p) => lats.length === 0 ? 0 : lats[Math.min(lats.length - 1, Math.floor(p * lats.length))];

  const scoresJson = {
    bench: 'R6-stress',
    timestamp: TIMESTAMP,
    fixture: path.relative(REPO_ROOT, FIXTURE),
    fixture_count: fixture.length,
    endpoint: UNLIM_EDGE_URL,
    success_count: successful.length,
    failure_count: failures,
    template_shortcut_count: templateShortcut.length,
    measured_count: measured.length,
    avg_recall_at_5: avgRecall,
    pass_threshold: R6_PASS_THRESHOLD,
    warn_threshold: R6_WARN_THRESHOLD,
    verdict,
    latency_avg_ms: avgLatency,
    latency_p50_ms: pct(0.5),
    latency_p95_ms: pct(0.95),
    latency_p99_ms: pct(0.99),
    by_category: byCat,
  };
  fs.writeFileSync(SCORES_OUT, JSON.stringify(scoresJson, null, 2));

  // Report MD.
  const catRows = Object.entries(byCat).map(([cat, b]) =>
    `| ${cat} | ${b.total} | ${b.measured} | ${b.templateShortcut} | ${b.avgRecall === null ? 'N/A' : b.avgRecall.toFixed(3)} |`).join('\n');

  const report = `# Sprint T iter 37 Phase 3 fix — R6 Stress (recall@5) ${TIMESTAMP}

> Hybrid RAG recall@5 over the 100-prompt iter-8 seed fixture against prod
> Edge Function \`unlim-chat\`. Adapted metric (see runner header HONESTY
> CAVEAT) — fixture lacks \`expected_chunks\` so we score against
> \`metadata.vol/pag/keywords\`.

## Setup

- **Endpoint**: \`${UNLIM_EDGE_URL}\`
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts)
- **Generator**: scripts/bench/run-sprint-r6-stress.mjs
- **Auth**: apikey + Authorization Bearer (anon JWT)${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ' (no X-Elab-Api-Key)'}
- **debug_retrieval**: true (top_k=5)

## Aggregate

| Metric | Value | Threshold | Verdict |
|--------|-------|-----------|---------|
| Successful | ${successful.length}/${fixture.length} | — | — |
| Failures | ${failures} | — | — |
| Template-shortcut (RAG bypassed) | ${templateShortcut.length} | — | — |
| Measured (with debug_retrieval) | ${measured.length} | — | — |
| **avg recall@5 (measured)** | **${avgRecall.toFixed(3)}** | ≥${R6_PASS_THRESHOLD} | **${verdict}** |

## Latency

| Metric | Value |
|--------|-------|
| Avg | ${avgLatency}ms |
| p50 | ${pct(0.5)}ms |
| p95 | ${pct(0.95)}ms |
| p99 | ${pct(0.99)}ms |

## Per-category breakdown

| Category | Total | Measured | Template-shortcut | avg recall@5 |
|----------|-------|----------|-------------------|--------------|
${catRows}

## Honesty caveats

1. **Adapted recall metric** — fixture spec on disk does NOT contain
   \`expected_chunks: [chunk_ids]\` as the original PDR description claimed.
   Each fixture entry has \`metadata.vol/pag/keywords\` instead. We score
   matches via vol+pag pair (corpus=rag, page exact match, keyword overlap)
   plus per-keyword presence in chunk content_preview / chunk_id /
   section_title (case-insensitive).
2. **Template-shortcut prompts excluded from average** — the L2 template
   router (\`clawbot-template-router\`) short-circuits before RAG retrieval
   for prompts matching its 22 inlined templates. Those prompts return no
   \`debug_retrieval\` array and are bucketed separately.
3. **PASS threshold ≥0.55** baseline per Atom A7-R6. Real production users
   benefit from BOTH the L2 templates AND the RAG path; recall@5 measures
   the latter only and is therefore a partial-stack signal.
4. **Per-prompt verdict** distribution may be skewed when the L2 template
   path consumes the majority — see \`template_shortcut_count\` vs
   \`measured_count\`.

## Verdict

- **avg recall@5**: ${avgRecall.toFixed(3)} (target ≥${R6_PASS_THRESHOLD})
- **Verdict**: ${verdict}

## Files

- Raw responses: ${path.relative(REPO_ROOT, RESPONSES_OUT)}
- Scorer JSON: ${path.relative(REPO_ROOT, SCORES_OUT)}
- This report: ${path.relative(REPO_ROOT, REPORT_OUT)}
`;
  fs.writeFileSync(REPORT_OUT, report);
  console.log(`\n[R6-stress] Report: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
  console.log(`[R6-stress] Verdict: ${verdict} (avg recall@5 = ${avgRecall.toFixed(3)})`);
  console.log(`[R6-stress] Measured ${measured.length}/${successful.length} (${templateShortcut.length} template-shortcut, ${failures} failures)`);
}

main().catch(err => {
  console.error('[R6-stress] FATAL:', err);
  process.exit(1);
});
