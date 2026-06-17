#!/usr/bin/env node
// ELAB RunPod R0 Benchmark — runs Sprint R0 fixture against deployed pod
// Sprint S iter 1 — 2026-04-26
//
// Usage:
//   RUNPOD_PROXY_BASE="https://<pod-id>-11434.proxy.runpod.net" \
//   MODEL="qwen2.5:7b" \
//     node scripts/runpod-r0-bench.mjs
//
// Output:
//   - Per-prompt response + latency
//   - Sprint R0 PZ scoring via score-unlim-quality.mjs
//   - Verdict PASS (>=85%) / WARN / FAIL
//   - Audit doc: docs/audits/2026-04-26-sprint-s-iter1-r0-bench.md
//
// (c) Andrea Marro — Sprint S iter 1

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const RUNPOD_PROXY_BASE = process.env.RUNPOD_PROXY_BASE;
const MODEL = process.env.MODEL || 'qwen2.5:7b';
const FIXTURE = process.env.FIXTURE || path.join(REPO_ROOT, 'scripts/bench/workloads/sprint-r0-unlim-quality-fixtures.jsonl');
const OUT_DIR = path.join(REPO_ROOT, 'docs/audits');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const OUT_DOC = path.join(OUT_DIR, `2026-04-26-sprint-s-iter1-r0-bench-${TIMESTAMP}.md`);
const RESPONSES_OUT = path.join(REPO_ROOT, 'scripts/bench/output', `r0-runpod-${TIMESTAMP}.jsonl`);

if (!RUNPOD_PROXY_BASE) {
    console.error('ERROR: RUNPOD_PROXY_BASE env var required.');
    console.error('Format: https://<pod-id>-11434.proxy.runpod.net');
    process.exit(1);
}

const SYSTEM_PROMPT = `Sei UNLIM, tutor AI di ELAB Tutor. Parli ai RAGAZZI plurale (Vediamo, Provate, Ragazzi). MAI imperativo al docente. MAX 60 parole. Cita Vol.X pag.Y quando rilevante. Sintetizza, non copiare verbatim libro. Linguaggio età 10-14 anni. Una analogia concreta quando spieghi concetti nuovi.`;

const fixture = fs.readFileSync(FIXTURE, 'utf-8').trim().split('\n').map(JSON.parse);
console.log(`Loaded ${fixture.length} fixtures from ${FIXTURE}`);
console.log(`Target: ${RUNPOD_PROXY_BASE} | Model: ${MODEL}`);

fs.mkdirSync(path.dirname(RESPONSES_OUT), { recursive: true });
const responsesStream = fs.createWriteStream(RESPONSES_OUT);

const results = [];

async function callOllama(systemPrompt, userMessage) {
    const url = `${RUNPOD_PROXY_BASE.replace(/\/$/, '')}/api/chat`;
    const start = Date.now();
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            stream: false,
            options: { num_predict: 200, temperature: 0.7 },
        }),
    });
    const latency = Date.now() - start;
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt.slice(0, 500)}`);
    }
    const json = await res.json();
    return { response: json.message?.content || json.response || '', latency };
}

async function main() {
    console.log('\n=== Running R0 fixture against RunPod ===\n');

    for (const fx of fixture) {
        process.stdout.write(`[${fx.id}] ${fx.scenario}: `);
        try {
            const { response, latency } = await callOllama(SYSTEM_PROMPT, fx.userMessage);
            const wordCount = response.split(/\s+/).filter(Boolean).length;
            console.log(`${latency}ms, ${wordCount} words`);
            const result = { ...fx, response, latency_ms: latency, word_count: wordCount };
            results.push(result);
            responsesStream.write(JSON.stringify(result) + '\n');
        } catch (err) {
            console.log(`FAIL: ${err.message}`);
            results.push({ ...fx, error: err.message });
        }
    }
    responsesStream.end();

    console.log(`\nResponses saved: ${RESPONSES_OUT}`);

    console.log('\n=== Running Principio Zero scorer ===\n');
    let scoreOutput = '';
    try {
        scoreOutput = execFileSync(
            'node',
            [
                path.join(REPO_ROOT, 'scripts/bench/score-unlim-quality.mjs'),
                '--responses', RESPONSES_OUT,
                '--fixture', FIXTURE,
            ],
            { encoding: 'utf-8' }
        );
        console.log(scoreOutput);
    } catch (e) {
        scoreOutput = `Scorer failed: ${e.message}\n${e.stdout || ''}\n${e.stderr || ''}`;
        console.error(scoreOutput);
    }

    const successful = results.filter(r => !r.error);
    const avgLatency = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.latency_ms, 0) / successful.length)
        : 0;
    const avgWords = successful.length
        ? Math.round(successful.reduce((s, r) => s + r.word_count, 0) / successful.length)
        : 0;
    const errors = results.length - successful.length;

    const audit = `# Sprint S iter 1 — R0 Benchmark RunPod ${TIMESTAMP}

> RunPod trial first run on Sprint R0 fixture (10 prompts ELAB tutoring scenarios)

## Setup

- **Provider**: RunPod on-demand
- **Endpoint**: \`${RUNPOD_PROXY_BASE}\`
- **Model**: \`${MODEL}\`
- **Fixture**: ${path.relative(REPO_ROOT, FIXTURE)} (${fixture.length} prompts)
- **System prompt**: PRINCIPIO ZERO v3.1 condensed (plurale + max 60w + Vol/pag + sintesi)

## Latency

- Avg: ${avgLatency}ms
- Successful: ${successful.length}/${results.length}
- Errors: ${errors}

## Per-prompt

| ID | Scenario | Latency | Words |
|----|----------|---------|-------|
${results.map(r => `| ${r.id} | ${r.scenario} | ${r.error ? 'FAIL' : r.latency_ms + 'ms'} | ${r.error ? '-' : r.word_count} |`).join('\n')}

## Principio Zero scorer

\`\`\`
${scoreOutput.trim()}
\`\`\`

## Verdict

- Avg word count: ${avgWords} (target ≤60)
- Errors: ${errors === 0 ? 'NONE' : errors}
- Latency: ${avgLatency < 1500 ? 'GOOD' : avgLatency < 3000 ? 'ACCEPTABLE' : 'SLOW'}

## Next iter actions

- IF scorer ≥85%: GO commit Hetzner GEX44/GEX130 monthly
- IF 70-84%: WARN, identify lowest axis, plan Sprint S iter 2 fix (synthesis prompt revision)
- IF <70%: FAIL, model selection revisit (try qwen2.5vl:32b on bigger GPU)

## Cost

- Pod runtime: TBD (check RunPod console billing)
- Estimated: ~\$0.79/h × benchmark duration

## File metadata

- Path: \`${path.relative(REPO_ROOT, OUT_DOC)}\`
- Skill compliance: quality-audit + bench
- Sprint: S iter 1
- Honesty: raw scorer output included verbatim above
`;

    fs.writeFileSync(OUT_DOC, audit);
    console.log(`\nAudit written: ${OUT_DOC}`);
    console.log(`Responses: ${RESPONSES_OUT}`);
}

main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
