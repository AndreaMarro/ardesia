#!/usr/bin/env node
/**
 * Sprint S iter 8 — Cost-per-Session Scorer (ATOM-S8-A9)
 *
 * Computes total cost per UNLIM session (12-turn typical) using 2026-04-27 pricing:
 *   - Together AI Llama 3.3 70B Instruct Turbo: $0.18/M input + $0.18/M output
 *   - Voyage AI voyage-3 embeddings: $0.06/M tokens
 *   - Voyage AI rerank-2.5: $0.05/M tokens (when ENABLE_RERANKER=true)
 *   - Supabase free tier (Edge Functions, pgvector, Auth): $0
 *   - Gemini Flash-Lite (fallback): $0.075/M input + $0.30/M output
 *
 * Input JSONL  (--input): each line per session
 *   { session_id, turns: [{tokens_in, tokens_out, provider, n_rag_queries, n_tts_calls}], ... }
 * Output JSON  (--output): per-session breakdown + aggregates.
 *
 * Pass criteria default --threshold 0.012 (€0.012/session = $0.013 USD ~7% margin vs target).
 * Exit 0 if avg cost <= threshold, 1 otherwise.
 *
 * Pricing reference 2026-04-27 (hardcoded, update on price drift):
 *   Source: together.ai/pricing, voyageai.com/pricing, supabase.com/pricing
 *
 * Usage:
 *   node scripts/bench/score-cost-per-session.mjs --input sessions.jsonl --output cost.json [--threshold 0.012]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Pricing 2026-04-27 (USD per token, NOT per million — multiply M tokens by these) ───

const PRICING = {
  together_llama33_70b_input_per_m: 0.18,
  together_llama33_70b_output_per_m: 0.18,
  gemini_flash_lite_input_per_m: 0.075,
  gemini_flash_lite_output_per_m: 0.30,
  gemini_flash_input_per_m: 0.075,
  gemini_flash_output_per_m: 0.30,
  gemini_pro_input_per_m: 1.25,
  gemini_pro_output_per_m: 5.00,
  voyage_3_per_m: 0.06,
  voyage_rerank_per_m: 0.05,
  supabase_free_per_call: 0,
  edge_tts_per_call: 0, // Microsoft public Trusted Client Token, free
};

const USD_TO_EUR = 0.92; // 2026-04-27 approx FX

function parseArgs(argv) {
  const out = { input: null, output: null, threshold: 0.012, currency: 'EUR', help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--input') out.input = argv[++i];
    else if (a.startsWith('--input=')) out.input = a.slice(8);
    else if (a === '--output') out.output = argv[++i];
    else if (a.startsWith('--output=')) out.output = a.slice(9);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--currency') out.currency = argv[++i];
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — Cost-per-Session Scorer

Usage:
  node scripts/bench/score-cost-per-session.mjs --input <file.jsonl> --output <file.json> [--threshold 0.012] [--currency EUR|USD]

Input JSONL session schema:
  { session_id, turns: [{ tokens_in, tokens_out, provider:'together'|'gemini-flash-lite'|'gemini-flash'|'gemini-pro',
                          n_rag_queries?, rag_tokens?, n_rerank_queries?, rerank_tokens?,
                          n_tts_calls? }] }

Pricing reference 2026-04-27 (USD/M tokens):
  Together Llama-3.3-70B I+O: $0.18 / $0.18
  Gemini Flash-Lite I/O:      $0.075 / $0.30
  Voyage-3 embed:             $0.06
  Voyage rerank:              $0.05
  Supabase free tier:         $0
  Edge TTS Isabella:          $0 (MS public token)
`);
}

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function average(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.min(idx, sorted.length - 1)];
}

// ─── Cost calc ──────────────────────────────────────────────────────────────

function llmCost(provider, tokensIn, tokensOut) {
  const tIn = (tokensIn || 0) / 1_000_000;
  const tOut = (tokensOut || 0) / 1_000_000;
  switch ((provider || 'together').toLowerCase()) {
    case 'together':
    case 'together-llama33':
    case 'llama-3.3':
      return tIn * PRICING.together_llama33_70b_input_per_m + tOut * PRICING.together_llama33_70b_output_per_m;
    case 'gemini-flash-lite':
    case 'gemini':
      return tIn * PRICING.gemini_flash_lite_input_per_m + tOut * PRICING.gemini_flash_lite_output_per_m;
    case 'gemini-flash':
      return tIn * PRICING.gemini_flash_input_per_m + tOut * PRICING.gemini_flash_output_per_m;
    case 'gemini-pro':
      return tIn * PRICING.gemini_pro_input_per_m + tOut * PRICING.gemini_pro_output_per_m;
    case 'runpod':
    case 'local':
      return 0; // amortized, treated as fixed cost
    default:
      // unknown provider — assume Together pricing as conservative upper bound
      return tIn * PRICING.together_llama33_70b_input_per_m + tOut * PRICING.together_llama33_70b_output_per_m;
  }
}

function ragCost(ragTokens, rerankTokens) {
  const cE = (ragTokens || 0) / 1_000_000 * PRICING.voyage_3_per_m;
  const cR = (rerankTokens || 0) / 1_000_000 * PRICING.voyage_rerank_per_m;
  return cE + cR;
}

function scoreSession(session) {
  const breakdown = {
    cost_llm_usd: 0,
    cost_voyage_usd: 0,
    cost_supabase_usd: 0,
    cost_tts_usd: 0,
    tokens_input: 0,
    tokens_output: 0,
    n_turns: 0,
    n_rag_queries: 0,
    n_tts_calls: 0,
    providers_used: new Set(),
  };

  const turns = session.turns || [];
  for (const t of turns) {
    breakdown.n_turns++;
    breakdown.tokens_input += t.tokens_in || 0;
    breakdown.tokens_output += t.tokens_out || 0;
    breakdown.cost_llm_usd += llmCost(t.provider, t.tokens_in, t.tokens_out);
    breakdown.cost_voyage_usd += ragCost(t.rag_tokens, t.rerank_tokens);
    breakdown.n_rag_queries += t.n_rag_queries || 0;
    breakdown.n_tts_calls += t.n_tts_calls || 0;
    breakdown.providers_used.add(t.provider || 'unknown');
    breakdown.cost_tts_usd += (t.n_tts_calls || 0) * PRICING.edge_tts_per_call;
  }

  breakdown.cost_total_usd = parseFloat((
    breakdown.cost_llm_usd +
    breakdown.cost_voyage_usd +
    breakdown.cost_supabase_usd +
    breakdown.cost_tts_usd
  ).toFixed(6));
  breakdown.cost_total_eur = parseFloat((breakdown.cost_total_usd * USD_TO_EUR).toFixed(6));
  breakdown.providers_used = [...breakdown.providers_used];

  return {
    session_id: session.session_id || session.id,
    ...breakdown,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) { printHelp(); process.exit(args.help ? 0 : 2); }

  const sessions = loadJsonl(resolve(args.input));
  if (!sessions.length) { console.error('[score-cost] empty input'); process.exit(2); }

  const perSession = sessions.map(scoreSession);
  const costsTarget = perSession.map(s => args.currency === 'USD' ? s.cost_total_usd : s.cost_total_eur);

  const aggregates = {
    n_sessions: perSession.length,
    avg_cost_total_usd: average(perSession.map(s => s.cost_total_usd)),
    avg_cost_total_eur: average(perSession.map(s => s.cost_total_eur)),
    p50_cost: percentile(costsTarget, 50),
    p95_cost: percentile(costsTarget, 95),
    max_cost: Math.max(...costsTarget),
    avg_tokens_input: average(perSession.map(s => s.tokens_input)),
    avg_tokens_output: average(perSession.map(s => s.tokens_output)),
    avg_n_turns: average(perSession.map(s => s.n_turns)),
    avg_n_rag_queries: average(perSession.map(s => s.n_rag_queries)),
    avg_n_tts_calls: average(perSession.map(s => s.n_tts_calls)),
  };

  const avgCostInCurrency = args.currency === 'USD' ? aggregates.avg_cost_total_usd : aggregates.avg_cost_total_eur;
  const verdict = avgCostInCurrency <= args.threshold ? 'PASS' : 'FAIL';

  const out = {
    generated_at: new Date().toISOString(),
    scorer: 'score-cost-per-session',
    pricing_ref_date: '2026-04-27',
    pricing: PRICING,
    threshold: args.threshold,
    currency: args.currency,
    verdict,
    aggregates,
    per_session: perSession,
  };

  if (args.output) {
    const outPath = resolve(args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[score-cost] wrote ${outPath}`);
  }

  console.log(`# Cost-per-session Score`);
  console.log(`avg=${args.currency} ${avgCostInCurrency.toFixed(6)} (USD ${aggregates.avg_cost_total_usd.toFixed(6)})`);
  console.log(`p50=${aggregates.p50_cost.toFixed(6)} p95=${aggregates.p95_cost.toFixed(6)} max=${aggregates.max_cost.toFixed(6)}`);
  console.log(`avg_turns=${aggregates.avg_n_turns.toFixed(1)} avg_tok_in=${aggregates.avg_tokens_input.toFixed(0)} avg_tok_out=${aggregates.avg_tokens_output.toFixed(0)}`);
  console.log(`Verdict: ${verdict} (avg=${avgCostInCurrency.toFixed(6)} ${args.currency} vs threshold ${args.threshold})`);

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
