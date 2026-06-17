#!/usr/bin/env node
// ELAB Sprint S iter 2 — R0 Baseline Render Endpoint Benchmark
// generator-test-opus | 2026-04-26
//
// Measures CURRENT UNLIM response quality on production Render endpoint
// (https://elab-galileo.onrender.com) BEFORE prompt v3 wire-up.
// Provides delta baseline for post-wire-up comparison (later iter).
//
// Endpoint contract (verified src/services/api.js line 745-749):
//   POST {RENDER_FALLBACK}/chat
//   body: { message, sessionId, experimentId }
//   response: { success: bool, response: string }
//
// Scorer args contract (verified scripts/bench/score-unlim-quality.mjs line 213-220):
//   POSITIONAL: <responses.jsonl> [--baseline]
//   Sprint S iter 1 caveat #2: scorer does NOT accept --responses/--fixture flags.
//   This runner aligns to actual positional scorer signature.
//
// Usage:
//   RENDER_UNLIM_URL="https://elab-galileo.onrender.com/chat" \
//     node scripts/bench/run-sprint-r0-render.mjs
//
// Output:
//   - scripts/bench/output/r0-render-responses-<TS>.jsonl  (raw responses)
//   - scripts/bench/output/r0-render-scores-<TS>.json     (scorer JSON)
//   - scripts/bench/output/r0-render-report-<TS>.md       (summary table)
//   - scripts/bench/workloads/sprint-r0-score-results.json (scorer default writes here)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const RENDER_UNLIM_URL = (process.env.RENDER_UNLIM_URL || 'https://elab-galileo.onrender.com/chat').trim();
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'workloads/sprint-r0-unlim-quality-fixtures.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r0-render-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r0-render-report-${TIMESTAMP}.md`);
const SCORES_OUT = path.join(OUT_DIR, `r0-render-scores-${TIMESTAMP}.json`);

const REQUEST_TIMEOUT_MS = 30000; // Render cold start ~18s
const COLD_START_RETRY_DELAY_MS = 30000;
const MAX_TOTAL_FAILURES = 5;

if (!RENDER_UNLIM_URL) {
    console.error('ERROR: RENDER_UNLIM_URL env var required (default: https://elab-galileo.onrender.com/chat)');
    process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').filter(Boolean).map(JSON.parse);
console.log(`[R0-render] Loaded ${fixture.length} fixtures from ${path.relative(REPO_ROOT, FIXTURE)}`);
console.log(`[R0-render] Endpoint: ${RENDER_UNLIM_URL}`);
console.log(`[R0-render] Timestamp: ${TIMESTAMP}`);

const responsesStream = fs.createWriteStream(RESPONSES_OUT);
const results = [];
let failures = 0;

function makeSessionId() {
    return `s_r0_${TIMESTAMP}_${Math.random().toString(36).slice(2, 10)}`;
}

async function callRender(userMessage, experimentId, sessionId, attempt = 1) {
    const start = Date.now();
    let timeoutId;
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const res = await fetch(RENDER_UNLIM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                sessionId,
                experimentId: experimentId || null,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const latency = Date.now() - start;

        if (!res.ok) {
            const txt = await res.text();
            const isCold = res.status === 503 || res.status === 502;
            if (isCold && attempt === 1) {
                console.log(`  ↳ HTTP ${res.status} (cold start), waiting ${COLD_START_RETRY_DELAY_MS / 1000}s and retrying...`);
                await new Promise(r => setTimeout(r, COLD_START_RETRY_DELAY_MS));
                return callRender(userMessage, experimentId, sessionId, attempt + 1);
            }
            throw new Error(`HTTP ${res.status}: ${txt.slice(0, 300)}`);
        }

        const json = await res.json();
        const responseText = json.response || json.message || json.text || '';
        return { responseText, latency, raw: json };
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' && attempt === 1) {
            console.log(`  ↳ timeout after ${REQUEST_TIMEOUT_MS}ms (cold start?), retrying once...`);
            await new Promise(r => setTimeout(r, 5000));
            return callRender(userMessage, experimentId, sessionId, attempt + 1);
        }
        throw err;
    }
}

async function main() {
    console.log('\n=== Running R0 fixture against Render production endpoint ===\n');
    const sessionId = makeSessionId();

    for (const fx of fixture) {
        process.stdout.write(`[${fx.id}] ${fx.scenario.padEnd(24)}: `);
        try {
            const { responseText, latency, raw } = await callRender(fx.userMessage, fx.experimentId, sessionId);
            const wordCount = responseText.replace(/\[AZIONE:[^\]]+\]/gi, '').replace(/\[INTENT:\{[^}]+\}\]/g, '').split(/\s+/).filter(Boolean).length;
            console.log(`${latency}ms, ${wordCount} words`);
            const result = {
                fixture_id: fx.id,
                scenario: fx.scenario,
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
                error: err.message,
            });
            if (failures >= MAX_TOTAL_FAILURES) {
                console.error(`\n[R0-render] HALT: ${failures} failures reached threshold. Endpoint likely down.`);
                break;
            }
        }
    }
    responsesStream.end();
    await new Promise(r => responsesStream.on('finish', r));

    console.log(`\n[R0-render] Responses written: ${path.relative(REPO_ROOT, RESPONSES_OUT)}`);

    const successful = results.filter(r => !r.error);
    if (successful.length === 0) {
        console.error('[R0-render] ZERO successful responses — skipping scorer, writing failure audit only.');
        const failAudit = `# R0 Render Baseline FAILURE — ${TIMESTAMP}

Zero successful responses against ${RENDER_UNLIM_URL}.

## Failures (${results.length})
${results.map(r => `- ${r.fixture_id}: ${r.error}`).join('\n')}

## Diagnosis
- Render endpoint may be cold-stuck or down
- Check https://dashboard.render.com/web/srv-* for status
- Retry manually: \`curl -X POST ${RENDER_UNLIM_URL} -H 'Content-Type: application/json' -d '{"message":"ping","sessionId":"test"}'\`

## Note
Sprint S iter 2 baseline NOT MEASURED. Document failure mode, do NOT fake numbers.
`;
        fs.writeFileSync(REPORT_OUT, failAudit);
        console.log(`[R0-render] Failure audit: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
        process.exit(2);
    }

    console.log(`\n=== Running Principio Zero scorer (${successful.length}/${results.length} responses) ===\n`);
    let scoreOutput = '';
    let scoreVerdict = 'UNKNOWN';
    try {
        // Scorer takes positional <responses.jsonl> arg (verified score-unlim-quality.mjs line 214)
        scoreOutput = execFileSync(
            'node',
            [path.join(__dirname, 'score-unlim-quality.mjs'), RESPONSES_OUT],
            { encoding: 'utf-8' }
        );
        console.log(scoreOutput);
        const verdictMatch = scoreOutput.match(/Verdict:\s*\*\*(\w+)\*\*/);
        if (verdictMatch) scoreVerdict = verdictMatch[1];

        // Copy scorer JSON output to our timestamped path
        const defaultScorerJson = path.join(__dirname, 'workloads/sprint-r0-score-results.json');
        if (fs.existsSync(defaultScorerJson)) {
            fs.copyFileSync(defaultScorerJson, SCORES_OUT);
            console.log(`[R0-render] Scores copied to: ${path.relative(REPO_ROOT, SCORES_OUT)}`);
        }
    } catch (e) {
        // Scorer exits 1 on FAIL verdict — capture output anyway
        scoreOutput = `${e.stdout || ''}\n${e.stderr || ''}\n[scorer exit ${e.status}]`;
        const verdictMatch = scoreOutput.match(/Verdict:\s*\*\*(\w+)\*\*/);
        if (verdictMatch) scoreVerdict = verdictMatch[1];
        else scoreVerdict = 'SCORER_ERROR';
        console.log(scoreOutput);
        const defaultScorerJson = path.join(__dirname, 'workloads/sprint-r0-score-results.json');
        if (fs.existsSync(defaultScorerJson)) {
            fs.copyFileSync(defaultScorerJson, SCORES_OUT);
        }
    }

    const avgLatency = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length)
        : 0;
    const avgWords = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.word_count, 0) / successful.length)
        : 0;

    const report = `# Sprint S iter 2 — R0 Render Baseline ${TIMESTAMP}

> Pre-wire-up baseline measure of UNLIM production endpoint.
> Source of truth for delta comparison after Task A (prompt v3) lands.

## Setup

- **Endpoint**: \`${RENDER_UNLIM_URL}\`
- **Provider**: Render (cold start ~18s)
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts)
- **Session ID**: ${sessionId}
- **Generator**: scripts/bench/run-sprint-r0-render.mjs
- **Scorer**: scripts/bench/score-unlim-quality.mjs (positional arg, 12 PZ rules)

## Latency

- Avg: ${avgLatency}ms
- Successful: ${successful.length}/${results.length}
- Failures: ${failures}

## Per-prompt

| ID | Scenario | Latency | Words | Status |
|----|----------|---------|-------|--------|
${results.map(r => `| ${r.fixture_id} | ${r.scenario} | ${r.error ? '-' : r.latency_ms + 'ms'} | ${r.error ? '-' : r.word_count} | ${r.error ? 'FAIL' : 'OK'} |`).join('\n')}

## Avg word count vs PZ target

- Avg words: ${avgWords} (PZ target ≤60)
- Compliance: ${avgWords <= 60 ? 'PASS' : 'OVER LIMIT'}

## Principio Zero scorer raw output

\`\`\`
${scoreOutput.trim().slice(0, 8000)}
\`\`\`

## Verdict

- **Score verdict**: ${scoreVerdict}
- **Avg latency**: ${avgLatency < 5000 ? 'GOOD' : avgLatency < 15000 ? 'COLD' : 'VERY COLD'}
- **Failures threshold**: ${failures}/${MAX_TOTAL_FAILURES}

## Files

- Raw responses: ${path.relative(REPO_ROOT, RESPONSES_OUT)}
- Scorer JSON: ${fs.existsSync(SCORES_OUT) ? path.relative(REPO_ROOT, SCORES_OUT) : 'NOT WRITTEN'}
- This report: ${path.relative(REPO_ROOT, REPORT_OUT)}

## Honesty disclosure

- Numbers are RAW from production endpoint. NO inflation.
- Sprint S iter 1 caveat #2 (scorer args) addressed: this runner uses POSITIONAL arg per scorer line 214.
- Re-run for CoV: \`RENDER_UNLIM_URL='${RENDER_UNLIM_URL}' node scripts/bench/run-sprint-r0-render.mjs\`
`;
    fs.writeFileSync(REPORT_OUT, report);
    console.log(`\n[R0-render] Report: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
    console.log(`[R0-render] Verdict: ${scoreVerdict}`);
}

main().catch(err => {
    console.error('[R0-render] FATAL:', err);
    process.exit(1);
});
