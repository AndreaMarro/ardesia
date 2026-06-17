#!/usr/bin/env node
// ELAB Sprint S iter 3 — R0 Baseline Edge Function Endpoint Benchmark
// generator-test-opus | 2026-04-26
//
// Re-run R0 baseline post UNLIM v3 BASE_PROMPT deploy on the elab-unlim
// Supabase Edge Function (NOT the legacy Render endpoint). Provides delta
// vs iter 2 75.81% WARN baseline measured on Render.
//
// Endpoint contract (verified supabase/functions/unlim-chat/index.ts:133-134):
//   POST {SUPABASE_EDGE_URL}/unlim-chat
//   headers: { 'Content-Type': 'application/json', apikey, Authorization }
//   body: { message, sessionId, circuitState?, experimentId?, simulatorContext?, images? }
//   response: { success: bool, response: string, ... }
//
// Auth contract (mirrors src/services/api.js:148-160 nanobotHeaders):
//   - apikey: SUPABASE_ANON_KEY (required by Supabase Edge)
//   - Authorization: Bearer SUPABASE_ANON_KEY
//   - X-Elab-Api-Key: ELAB_API_KEY (optional, fail-open server-side)
//
// Scorer args contract (verified scripts/bench/score-unlim-quality.mjs:213-220):
//   POSITIONAL: <responses.jsonl> [--baseline]
//
// Usage:
//   SUPABASE_ANON_KEY="<anon>" \
//     node scripts/bench/run-sprint-r0-edge-function.mjs
//
// Env overrides:
//   UNLIM_EDGE_URL  — defaults to elab-unlim project URL
//   SUPABASE_ANON_KEY — required, no embedded fallback (avoid leaking)
//   ELAB_API_KEY  — optional, sent if set
//
// Output:
//   - scripts/bench/output/r0-edge-function-responses-<TS>.jsonl
//   - scripts/bench/output/r0-edge-function-scores-<TS>.json
//   - scripts/bench/output/r0-edge-function-report-<TS>.md
//   - scripts/bench/workloads/sprint-r0-score-results.json (scorer default writes here)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const UNLIM_EDGE_URL = (process.env.UNLIM_EDGE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const ELAB_API_KEY = (process.env.ELAB_API_KEY || '').trim();
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'workloads/sprint-r0-unlim-quality-fixtures.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r0-edge-function-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r0-edge-function-report-${TIMESTAMP}.md`);
const SCORES_OUT = path.join(OUT_DIR, `r0-edge-function-scores-${TIMESTAMP}.json`);

const ITER_2_BASELINE_PCT = 75.81; // Render baseline reference

const REQUEST_TIMEOUT_MS = 30000; // Edge Function cold start + LLM round-trip
const COLD_START_RETRY_DELAY_MS = 15000;
const MAX_TOTAL_FAILURES = 5;

if (!SUPABASE_ANON_KEY) {
    console.error('ERROR: SUPABASE_ANON_KEY env var REQUIRED for Edge Function R0 re-run.');
    console.error('       Fetch from .env (line VITE_SUPABASE_EDGE_KEY) or src/services/api.js:22 fallback.');
    console.error('       Then: SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r0-edge-function.mjs');
    process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').filter(Boolean).map(JSON.parse);
console.log(`[R0-edge] Loaded ${fixture.length} fixtures from ${path.relative(REPO_ROOT, FIXTURE)}`);
console.log(`[R0-edge] Endpoint: ${UNLIM_EDGE_URL}`);
console.log(`[R0-edge] Auth: apikey + Authorization Bearer (anon JWT)${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ''}`);
console.log(`[R0-edge] Timestamp: ${TIMESTAMP}`);
console.log(`[R0-edge] Reference iter 2 baseline (Render): ${ITER_2_BASELINE_PCT}% WARN`);

const responsesStream = fs.createWriteStream(RESPONSES_OUT);
const results = [];
let failures = 0;

function makeSessionId() {
    return `s_r0_edge_${TIMESTAMP}_${Math.random().toString(36).slice(2, 10)}`;
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
    console.log('\n=== Running R0 fixture against elab-unlim Edge Function ===\n');
    const sessionId = makeSessionId();

    for (const fx of fixture) {
        process.stdout.write(`[${fx.id}] ${fx.scenario.padEnd(24)}: `);
        try {
            const { responseText, latency, raw } = await callEdge(fx.userMessage, fx.experimentId, sessionId);
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
                console.error(`\n[R0-edge] HALT: ${failures} failures reached threshold. Endpoint likely down.`);
                break;
            }
        }
    }
    responsesStream.end();
    await new Promise(r => responsesStream.on('finish', r));

    console.log(`\n[R0-edge] Responses written: ${path.relative(REPO_ROOT, RESPONSES_OUT)}`);

    const successful = results.filter(r => !r.error);
    if (successful.length === 0) {
        console.error('[R0-edge] ZERO successful responses — skipping scorer, writing failure audit only.');
        const failAudit = `# R0 Edge Function Baseline FAILURE — ${TIMESTAMP}

Zero successful responses against ${UNLIM_EDGE_URL}.

## Failures (${results.length})
${results.map(r => `- ${r.fixture_id}: ${r.error}`).join('\n')}

## Diagnosis
- Edge Function may be cold-stuck, undeployed, or rejecting auth
- Manual retry: \`curl -X POST ${UNLIM_EDGE_URL} -H 'apikey: $SUPABASE_ANON_KEY' -H 'Authorization: Bearer $SUPABASE_ANON_KEY' -H 'Content-Type: application/json' -d '{"message":"ping","sessionId":"test"}'\`
- Check deploy: \`SUPABASE_ACCESS_TOKEN=sbp_... npx supabase functions list --project-ref euqpdueopmlllqjmqnyb\`

## Note
Sprint S iter 3 R0 re-run NOT MEASURED. Document failure mode, do NOT fake numbers.
`;
        fs.writeFileSync(REPORT_OUT, failAudit);
        console.log(`[R0-edge] Failure audit: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
        process.exit(2);
    }

    console.log(`\n=== Running Principio Zero scorer (${successful.length}/${results.length} responses) ===\n`);
    let scoreOutput = '';
    let scoreVerdict = 'UNKNOWN';
    let scoreOverallPct = null;
    try {
        scoreOutput = execFileSync(
            'node',
            [path.join(__dirname, 'score-unlim-quality.mjs'), RESPONSES_OUT],
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
            console.log(`[R0-edge] Scores copied to: ${path.relative(REPO_ROOT, SCORES_OUT)}`);
        }
    } catch (e) {
        scoreOutput = `${e.stdout || ''}\n${e.stderr || ''}\n[scorer exit ${e.status}]`;
        const verdictMatch = scoreOutput.match(/Verdict:\s*\*\*(\w+)\*\*/);
        if (verdictMatch) scoreVerdict = verdictMatch[1];
        else scoreVerdict = 'SCORER_ERROR';
        const overallMatch = scoreOutput.match(/Overall:\s*(\d+\.\d+)%/);
        if (overallMatch) scoreOverallPct = parseFloat(overallMatch[1]);
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

    // Per-rule breakdown — re-parse scorer output to count failing rules
    const ruleCounts = {};
    const ruleLines = scoreOutput.match(/^  - \w+: (PASS|\*\*FAIL[^*]+\*\*)/gm) || [];
    for (const line of ruleLines) {
        const m = line.match(/^  - (\w+):\s+(PASS|\*\*FAIL)/);
        if (!m) continue;
        const rule = m[1];
        const passed = m[2] === 'PASS';
        if (!ruleCounts[rule]) ruleCounts[rule] = { pass: 0, fail: 0 };
        if (passed) ruleCounts[rule].pass++; else ruleCounts[rule].fail++;
    }

    const deltaVsIter2 = scoreOverallPct !== null ? (scoreOverallPct - ITER_2_BASELINE_PCT) : null;

    const report = `# Sprint S iter 3 — R0 Edge Function Baseline ${TIMESTAMP}

> Post-deploy R0 re-run on elab-unlim Edge Function (UNLIM v3 BASE_PROMPT live).
> Comparison: iter 2 Render baseline 75.81% WARN.

## Setup

- **Endpoint**: \`${UNLIM_EDGE_URL}\`
- **Provider**: Supabase Edge Function (Deno)
- **Auth**: apikey + Authorization Bearer SUPABASE_ANON_KEY${ELAB_API_KEY ? ' + X-Elab-Api-Key' : ''}
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts)
- **Session ID**: ${sessionId}
- **Generator**: scripts/bench/run-sprint-r0-edge-function.mjs
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

## Per-rule pass/fail breakdown (parsed scorer output)

${Object.keys(ruleCounts).length === 0 ? '(no rules parsed — scorer output unexpected)' :
  '| Rule | PASS | FAIL |\n|------|------|------|\n' +
  Object.entries(ruleCounts)
    .sort((a, b) => b[1].fail - a[1].fail)
    .map(([rule, c]) => `| ${rule} | ${c.pass} | ${c.fail} |`).join('\n')}

## Delta vs iter 2 baseline (Render 75.81%)

- **iter 2 baseline (Render)**: ${ITER_2_BASELINE_PCT}%
- **iter 3 measure (Edge Function)**: ${scoreOverallPct !== null ? scoreOverallPct.toFixed(2) + '%' : 'UNKNOWN'}
- **Delta**: ${deltaVsIter2 !== null ? (deltaVsIter2 >= 0 ? '+' : '') + deltaVsIter2.toFixed(2) + ' pp' : 'N/A'}
- **Sign**: ${deltaVsIter2 !== null ? (deltaVsIter2 > 0 ? 'IMPROVEMENT' : deltaVsIter2 < 0 ? 'REGRESSION' : 'NEUTRAL') : 'N/A'}

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

- Numbers RAW from production Edge Function. NO inflation.
- Sprint S iter 1 caveat #2 (scorer args) addressed: positional arg per scorer line 214.
- Re-run for CoV: \`SUPABASE_ANON_KEY=<key> node scripts/bench/run-sprint-r0-edge-function.mjs\`
`;
    fs.writeFileSync(REPORT_OUT, report);
    console.log(`\n[R0-edge] Report: ${path.relative(REPO_ROOT, REPORT_OUT)}`);
    console.log(`[R0-edge] Verdict: ${scoreVerdict}`);
    if (deltaVsIter2 !== null) {
        const sign = deltaVsIter2 >= 0 ? '+' : '';
        console.log(`[R0-edge] Delta vs iter 2 baseline: ${sign}${deltaVsIter2.toFixed(2)} pp`);
    }
}

main().catch(err => {
    console.error('[R0-edge] FATAL:', err);
    process.exit(1);
});
