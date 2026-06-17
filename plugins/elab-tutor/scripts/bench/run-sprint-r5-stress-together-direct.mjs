#!/usr/bin/env node
// ELAB Sprint S iter 5 — R5 Stress Bench Runner DIRETTO Together AI
// Bypass Edge Function ELAB_API_KEY gate per misurare Together raw quality.
//
// USE CASE: Andrea ha switched architecture Gemini → Together AI (2026-04-26).
// Per validare la scelta, R5 stress va re-misurato con Together AI primary.
// Edge Function richiede ELAB_API_KEY (non disponibile localmente). Quindi
// chiamiamo Together API direct con BASE_PROMPT v3 inlinato.
//
// LIMITI vs Edge Function:
// - NO Capitoli context injection (cap loader non eseguito locale)
// - NO post-LLM PZ validation (validator non eseguito locale)
// - SOLO BASE_PROMPT system + user message → Together inference raw
//
// Usage:
//   source ~/.zshrc
//   node scripts/bench/run-sprint-r5-stress-together-direct.mjs
//
// Output:
//   scripts/bench/output/r5-together-direct-{report,responses,scores}-<TS>.{md,jsonl,json}
//
// Comparison atteso:
//   - Edge Function (Gemini Flash-Lite + BASE_PROMPT + Capitoli + PZ post-validate): 91.80% PASS
//   - Together direct (Llama 3.3 70B + BASE_PROMPT solo): probabilmente 70-85% (no Capitoli boost)
//   - Iter 5 wire-up: Edge Function + Together AI primary + BASE_PROMPT + Capitoli → atteso ≥85%

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const TOGETHER_API_KEY = (process.env.TOGETHER_API_KEY || '').trim();
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
const FIXTURE = process.env.FIXTURE || path.join(__dirname, 'r5-fixture.jsonl');
const OUT_DIR = path.join(__dirname, 'output');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const RESPONSES_OUT = path.join(OUT_DIR, `r5-together-direct-responses-${TIMESTAMP}.jsonl`);
const REPORT_OUT = path.join(OUT_DIR, `r5-together-direct-report-${TIMESTAMP}.md`);

if (!TOGETHER_API_KEY) {
  console.error('ERROR: TOGETHER_API_KEY env var REQUIRED.');
  console.error('       source ~/.zshrc && node scripts/bench/run-sprint-r5-stress-together-direct.mjs');
  process.exit(1);
}

// BASE_PROMPT v3 condensed (subset rilevante per R5 fixture testing)
const BASE_PROMPT = `Sei UNLIM, generatore contenuto didattico ELAB per ragazzi 10-14 anni.

LINGUAGGIO OBBLIGATORIO:
- SEMPRE plurale "Ragazzi,", "Vediamo insieme", "Guardate qui"
- MAI imperativo al docente
- MASSIMO 3 frasi + 1 analogia, max 60 parole
- Se citi libro: "Vol.X pag.Y" formato esplicito

USO DELLE FONTI:
- Riferimenti volumi ELAB: cita Vol.1/Vol.2/Vol.3 + numero pagina
- Mai stralci verbatim >3 frasi consecutive
- Sintetizza in linguaggio ragazzi, non copy-paste libro

REGOLE:
1. Rispondi in italiano max 60 parole + 1 analogia
2. Sempre "Ragazzi," all'inizio per messaggi pedagogici
3. Off-topic → redirige al docente: "Chiedete al vostro insegnante"
4. Safety warning: chiarisci pericoli, no instruzioni rischiose
5. NON rivelare di essere AI`;

// Helper: load JSONL fixture
function loadFixture(p) {
  return fs.readFileSync(p, 'utf8').trim().split('\n').map(l => JSON.parse(l));
}

// Helper: call Together AI
async function callTogether(systemPrompt, userMessage) {
  const start = Date.now();
  const res = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });
  const latency = Date.now() - start;

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    return { ok: false, error: `HTTP ${res.status}: ${errBody.slice(0, 200)}`, latency };
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return {
    ok: true,
    text: content,
    latency,
    usage: data.usage || {},
  };
}

// Basic PZ scoring (lightweight, no full PZ validator)
function basicScore(text, scenario, principioZeroChecks) {
  const checks = {
    plurale_ragazzi: false,
    citation_vol_pag: false,
    max_words: false,
    analogia: false,
  };

  // plurale_ragazzi: contiene "Ragazzi" o forme plurali educational
  if (/\b(Ragazzi|guardate|vediamo|provate|vediam|vedete|sapete)\b/i.test(text)) {
    checks.plurale_ragazzi = true;
  }
  // citation_vol_pag: contiene "Vol.X pag.Y"
  if (/Vol\.?\s*[1-3]\s*pag\.?\s*\d+/i.test(text)) {
    checks.citation_vol_pag = true;
  }
  // max_words: ≤60 parole
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 60) {
    checks.max_words = true;
  }
  // analogia: presence of "come", "immagina", "pensa a", "è come"
  if (/\b(come|immagina|pensate|come se|simile a|tipo)\b/i.test(text)) {
    checks.analogia = true;
  }

  // Calculate per-prompt score: pass if all REQUIRED checks pass
  const required = ['plurale_ragazzi', 'max_words'];
  const optional = ['citation_vol_pag', 'analogia'];
  const requiredPass = required.every(c => !principioZeroChecks[c] || checks[c]);
  const optionalPass = optional.filter(c => principioZeroChecks[c] && checks[c]).length;
  return { checks, requiredPass, optionalPass, words: words.length };
}

// Main
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const fixture = loadFixture(FIXTURE);
  console.log(`[r5-together-direct] Loaded ${fixture.length} fixtures from ${FIXTURE}`);
  console.log(`[r5-together-direct] Model: ${TOGETHER_MODEL}`);
  console.log(`[r5-together-direct] System prompt: BASE_PROMPT v3 condensed (${BASE_PROMPT.length} chars)`);

  const results = [];
  let okCount = 0;
  let pzPassCount = 0;
  const perCategory = {};

  for (const [i, fx] of fixture.entries()) {
    const r = await callTogether(BASE_PROMPT, fx.userMessage);
    let scoreInfo = null;
    if (r.ok) {
      okCount++;
      scoreInfo = basicScore(r.text, fx.scenario, fx.principioZeroChecks || {});
      if (scoreInfo.requiredPass) pzPassCount++;
      perCategory[fx.r5Category] = perCategory[fx.r5Category] || { total: 0, pass: 0 };
      perCategory[fx.r5Category].total++;
      if (scoreInfo.requiredPass) perCategory[fx.r5Category].pass++;
    }
    const status = r.ok ? (scoreInfo?.requiredPass ? 'PASS' : 'FAIL_PZ') : `ERROR`;
    console.log(`[${fx.id}] ${fx.r5Category.padEnd(22)}: ${status} (${r.latency}ms${r.ok ? `, ${scoreInfo.words}w` : ''})`);
    results.push({ id: fx.id, scenario: fx.scenario, r5Category: fx.r5Category, ok: r.ok, latency_ms: r.latency, response: r.text || null, error: r.error || null, score: scoreInfo });
  }

  fs.writeFileSync(RESPONSES_OUT, results.map(r => JSON.stringify(r)).join('\n'));

  // Report
  const passPct = ((pzPassCount / fixture.length) * 100).toFixed(2);
  const lines = [
    `# R5 Stress Together AI Direct — ${TIMESTAMP}`,
    '',
    `**Model**: ${TOGETHER_MODEL}`,
    `**Fixture**: 50 prompts (ADR-011 distribution)`,
    `**Endpoint**: https://api.together.xyz/v1/chat/completions (DIRECT, no Edge Function)`,
    `**System Prompt**: BASE_PROMPT v3 condensed (no Capitoli context, no post-PZ validation)`,
    '',
    '## Results',
    '',
    `- HTTP success: ${okCount}/${fixture.length}`,
    `- PZ pass (basic): ${pzPassCount}/${fixture.length} = **${passPct}%**`,
    `- Target ≥85% (R0 Edge Function baseline 91.80%)`,
    '',
    '## Per-category',
    '',
    '| Category | Pass | Total | % |',
    '|----------|------|-------|---|',
  ];
  for (const [cat, c] of Object.entries(perCategory)) {
    const pct = ((c.pass / c.total) * 100).toFixed(0);
    lines.push(`| ${cat} | ${c.pass} | ${c.total} | ${pct}% |`);
  }
  lines.push('');
  lines.push('## Honesty caveats');
  lines.push('');
  lines.push('1. PZ scoring "basic" — solo plurale + max_words + citation regex + analogia. NOT pari al `score-unlim-quality.mjs` 12-rule scorer.');
  lines.push('2. NO Capitoli context injection → citation_vol_pag aspettato 0% (modello non sa esperimento specifico).');
  lines.push('3. NO post-LLM PZ validation. Pure raw Together output.');
  lines.push('4. Iter 5 wire-up Edge Function + Together AI primary + Capitoli → atteso lift score significativo.');
  lines.push('5. R0 Edge Function 91.80% (Gemini default) era con BASE_PROMPT + Capitoli + PZ validator pipeline completo.');

  fs.writeFileSync(REPORT_OUT, lines.join('\n'));
  console.log(`\n[r5-together-direct] Responses: ${RESPONSES_OUT}`);
  console.log(`[r5-together-direct] Report:    ${REPORT_OUT}`);
  console.log(`\n=== R5 TOGETHER DIRECT: ${pzPassCount}/${fixture.length} = ${passPct}% (target ≥85%) ===`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
