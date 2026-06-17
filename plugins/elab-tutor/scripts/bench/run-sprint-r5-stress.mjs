#!/usr/bin/env node
// ELAB Sprint S iter 3 — R5 Stress Bench Runner (skeleton)
// generator-test-opus | 2026-04-26
//
// Sprint S iter 3 deliverable Task C2: skeleton for R5 stress bench (50 prompts).
// Current fixture is 10-prompt seed in scripts/bench/r5-fixture.jsonl. Full 50
// expansion + final scoring weights deferred to ADR-011 (architect-opus).
//
// Endpoint: elab-unlim Edge Function (same auth as run-sprint-r0-edge-function.mjs).
//
// Categories (10 seed prompts mapped to ADR-011 categories):
//   - plurale_ragazzi      x2
//   - citation_vol_pag     x2
//   - sintesi_60_parole    x2
//   - safety_warning       x1
//   - off_topic_redirect   x1
//   - deep_question        x2
//
// Scoring: re-uses scripts/bench/score-unlim-quality.mjs (12 PZ rules).
// ADR-011 will define R5-specific extensions (consistency_across_runs,
// response_diversity). When that lands, this runner gains a final aggregation
// stage `aggregateR5Score(scores) → { overall_pct, per_category: {...} }`.
//
// Pass thresholds (ADR-011 placeholder, refine post-architect-opus):
//   ≥90% per-category PASS (R5 hard gate)
//   ≥85% per-rule PASS (R5 soft gate)
//
// Usage:
//   SUPABASE_ANON_KEY="<anon>" node scripts/bench/run-sprint-r5-stress.mjs
//
// Output:
//   - scripts/bench/output/r5-stress-responses-<TS>.jsonl
//   - scripts/bench/output/r5-stress-scores-<TS>.json
//   - scripts/bench/output/r5-stress-report-<TS>.md

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'r5-fixture.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r5-stress-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r5-stress-report-${TIMESTAMP}.md`);
const SCORES_OUT = path.join(OUT_DIR, `r5-stress-scores-${TIMESTAMP}.json`);

const REQUEST_TIMEOUT_MS = 30000;
const COLD_START_RETRY_DELAY_MS = 15000;
const MAX_TOTAL_FAILURES = 8;

const R5_TARGET_PROMPTS = 50;
const R5_HARD_GATE_PCT = 90;
const R5_SOFT_GATE_PCT = 85;

if (!SUPABASE_ANON_KEY) {
    console.error('ERROR: SUPABASE_ANON_KEY env var REQUIRED for Edge Function R5 stress.');
    console.error('       Re-run: SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r5-stress.mjs');
    process.exit(1);
}

if (!fs.existsSync(FIXTURE)) {
    console.error(`ERROR: Fixture ${FIXTURE} not found.`);
    process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').filter(Boolean).map(JSON.parse);
console.log(`[R5-stress] Loaded ${fixture.length} fixtures from ${path.relative(REPO_ROOT, FIXTURE)}`);
console.log(`[R5-stress] Endpoint: ${UNLIM_EDGE_URL}`);
console.log(`[R5-stress] Auth: apikey + Authorization Bearer (anon JWT)${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ''}`);
console.log(`[R5-stress] Timestamp: ${TIMESTAMP}`);
if (fixture.length < R5_TARGET_PROMPTS) {
    console.log(`[R5-stress] NOTE: seed fixture (${fixture.length}/${R5_TARGET_PROMPTS}). ADR-011 (architect-opus) defines full 50-prompt expansion + final R5 scoring weights.`);
}

// Category breakdown sanity log
const byCategory = {};
for (const fx of fixture) {
    const cat = fx.r5Category || 'uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
}
console.log(`[R5-stress] Categories:`, byCategory);

const responsesStream = fs.createWriteStream(RESPONSES_OUT);
const results = [];
let failures = 0;

function makeSessionId() {
    return `s_r5_${TIMESTAMP}_${Math.random().toString(36).slice(2, 10)}`;
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
        const responseText = json.response || json.message || json.text || '';
        return { responseText, latency, raw: json };
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

async function main() {
    console.log('\n=== Running R5 stress fixture against elab-unlim Edge Function ===\n');
    const sessionId = makeSessionId();

    for (const fx of fixture) {
        process.stdout.write(`[${fx.id}] ${(fx.r5Category || fx.scenario).padEnd(24)}: `);
        try {
            const { responseText, latency, raw } = await callEdge(fx.userMessage, fx.experimentId, sessionId);
            const wordCount = responseText.replace(/\[AZIONE:[^\]]+\]/gi, '').replace(/\[INTENT:\{[^}]+\}\]/g, '').split(/\s+/).filter(Boolean).length;
            console.log(`${latency}ms, ${wordCount} words`);
            const result = {
                fixture_id: fx.id,
                scenario: fx.scenario,
                r5Category: fx.r5Category || null,
                experimentId: fx.experimentId,
                userMessage: fx.userMessage,
                response_text: responseText,
                latency_ms: latency,
                word_count: wordCount,
                raw_keys: Object.keys(raw),
            };
            results.push(result);
            responsesStream.write(JSON.stringify(result) + '\n');
        } catch (err) {
            failures++;
            console.log(`FAIL: ${err.message}`);
            results.push({
                fixture_id: fx.id,
                scenario: fx.scenario,
                r5Category: fx.r5Category || null,
                error: err.message,
            });
            if (failures >= MAX_TOTAL_FAILURES) {
                console.error(`\n[R5-stress] HALT: ${failures} failures reached threshold. Endpoint likely degraded.`);
                break;
            }
        }
    }
    responsesStream.end();
    await new Promise(r => responsesStream.on('finish', r));

    console.log(`\n[R5-stress] Responses written: ${path.relative(REPO_ROOT, RESPONSES_OUT)}`);

    const successful = results.filter(r => !r.error);
    if (successful.length === 0) {
        console.error('[R5-stress] ZERO successful responses — skipping scorer.');
        const failAudit = `# R5 Stress FAILURE — ${TIMESTAMP}

Zero successful responses against ${UNLIM_EDGE_URL}.
Failures: ${failures}/${results.length}

## Note
Fixture is ${fixture.length}-prompt SEED (full ${R5_TARGET_PROMPTS} pending ADR-011).
`;
        fs.writeFileSync(REPORT_OUT, failAudit);
        process.exit(2);
    }

    console.log(`\n=== Running Principio Zero scorer (${successful.length}/${results.length} responses) ===\n`);
    let scoreOutput = '';
    let scoreVerdict = 'UNKNOWN';
    let scoreOverallPct = null;
    try {
        // Iter 5 fix: pass --fixture-path so scorer matches r5-NNN ids correctly.
        // Without this, scorer defaulted to R0 30-prompt fixtures and skipped 20+ R5 ids.
        scoreOutput = execFileSync(
            'node',
            [
                path.join(__dirname, 'score-unlim-quality.mjs'),
                RESPONSES_OUT,
                '--fixture-path', FIXTURE,
            ],
            { encoding: 'utf-8' }
        );
        console.log(scoreOutput);
        const verdictMatch = scoreOutput.match(/Verdict:\s*\*\*(\w+)\*\*/);
        if (verdictMatch) scoreVerdict = verdictMatch[1];
        const overallMatch = scoreOutput.match(/Overall:\s*(\d+\.\d+)%/);
        if (overallMatch) scoreOverallPct = parseFloat(overallMatch[1]);
        const defaultScorerJson = path.join(__dirname, 'workloads/sprint-r0-score-results.json');
        if (fs.existsSync(defaultScorerJson)) {
            fs.copyFileSync(defaultScorerJson, SCORES_OUT);
        }
    } catch (e) {
        scoreOutput = `${e.stdout || ''}\n${e.stderr || ''}\n[scorer exit ${e.status}]`;
        const verdictMatch = scoreOutput.match(/Verdict:\s*\*\*(\w+)\*\*/);
        if (verdictMatch) scoreVerdict = verdictMatch[1];
        else scoreVerdict = 'SCORER_ERROR';
        console.log(scoreOutput);
    }

    const avgLatency = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length)
        : 0;
    const avgWords = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.word_count, 0) / successful.length)
        : 0;

    const report = `# Sprint S iter 3 — R5 Stress (SEED) ${TIMESTAMP}

> Skeleton runner for R5 stress fixture. Seed=${fixture.length} prompts. Full ${R5_TARGET_PROMPTS}-prompt expansion + R5-specific scoring weights pending ADR-011 (architect-opus).

## Setup

- **Endpoint**: \`${UNLIM_EDGE_URL}\`
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts SEED)
- **Session ID**: ${sessionId}
- **Generator**: scripts/bench/run-sprint-r5-stress.mjs
- **Scorer**: scripts/bench/score-unlim-quality.mjs (12 PZ rules — R5-specific extensions pending)

## Latency

- Avg: ${avgLatency}ms
- Successful: ${successful.length}/${results.length}
- Failures: ${failures}

## Per-prompt

| ID | Category | Latency | Words | Status |
|----|----------|---------|-------|--------|
${results.map(r => `| ${r.fixture_id} | ${r.r5Category || '?'} | ${r.error ? '-' : r.latency_ms + 'ms'} | ${r.error ? '-' : r.word_count} | ${r.error ? 'FAIL' : 'OK'} |`).join('\n')}

## Avg word count vs PZ target

- Avg words: ${avgWords} (PZ target ≤60)

## R5 thresholds (placeholder per ADR-011)

- Hard gate per-category: ≥${R5_HARD_GATE_PCT}%
- Soft gate per-rule:    ≥${R5_SOFT_GATE_PCT}%

## Principio Zero scorer raw output

\`\`\`
${scoreOutput.trim().slice(0, 8000)}
\`\`\`

## Verdict

- **Score verdict**: ${scoreVerdict}
- **Overall pct**: ${scoreOverallPct !== null ? scoreOverallPct.toFixed(2) + '%' : 'UNKNOWN'}
- **Failures threshold**: ${failures}/${MAX_TOTAL_FAILURES}

## Files

- Raw responses: ${path.relative(REPO_ROOT, RESPONSES_OUT)}
- Scorer JSON: ${fs.existsSync(SCORES_OUT) ? path.relative(REPO_ROOT, SCORES_OUT) : 'NOT WRITTEN'}
- This report: ${path.relative(REPO_ROOT, REPORT_OUT)}

## Honesty disclosure

- This is a SEED runner. Full R5 fixture (${R5_TARGET_PROMPTS} prompts) pending ADR-011.
- R5-specific scoring (consistency_across_runs, response_diversity) NOT yet implemented.
- Re-run for CoV: \`SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r5-stress.mjs\`
`;
    fs.writeFileSync(REPORT_OUT, report);
    console.log(`\n[R5-stress] Report: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
    console.log(`[R5-stress] Verdict: ${scoreVerdict}`);
}

main().catch(err => {
    console.error('[R5-stress] FATAL:', err);
    process.exit(1);
});
