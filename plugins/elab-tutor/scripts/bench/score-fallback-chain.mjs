#!/usr/bin/env node
/**
 * Sprint S iter 8 — Fallback Chain Scorer (ATOM-S8-A9)
 *
 * Scores the LLM fallback chain (RunPod → Gemini → Together gated):
 *   - provider_used (which provider actually answered)
 *   - fallback_transit_latency_ms (time from primary fail to fallback success)
 *   - gate_decision_correct (Together blocked correctly when student runtime?)
 *   - audit_log_present (together_audit_log row inserted?)
 *   - anonymization_applied (PII strip when Together gated emergency?)
 *   - total_latency_ms
 *
 * Input JSONL  (--input): each line {call_id, scenario, expected_provider,
 *                                    actual_provider, gate_runtime, gate_decision,
 *                                    audit_log_id?, anonymized?, transit_latency_ms,
 *                                    total_latency_ms, error?}
 * Output JSON  (--output): per-call + aggregates + gate accuracy.
 *
 * Pass criteria default --threshold 1.0 on gate_accuracy (100% required for safety).
 * Exit 0 if gate_accuracy == 1.0, 1 otherwise.
 *
 * Usage:
 *   node scripts/bench/score-fallback-chain.mjs --input calls.jsonl --output scores.json [--threshold 1.0]
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv) {
  const out = { input: null, output: null, threshold: 1.0, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--input') out.input = argv[++i];
    else if (a.startsWith('--input=')) out.input = a.slice(8);
    else if (a === '--output') out.output = argv[++i];
    else if (a.startsWith('--output=')) out.output = a.slice(9);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
  }
  return out;
}

function printHelp() {
  console.log(`Sprint S iter 8 — Fallback Chain Scorer

Usage:
  node scripts/bench/score-fallback-chain.mjs --input <file.jsonl> --output <file.json> [--threshold 1.0]

Input JSONL call schema:
  { call_id, scenario:'runpod_down_gemini_ok'|'all_down_together_gated'|'student_runtime_block'|...,
    expected_provider, actual_provider, gate_runtime:'student'|'teacher'|'batch'|'emergency',
    gate_decision:'allow'|'block', audit_log_id?, anonymized:boolean,
    transit_latency_ms, total_latency_ms, error? }

Pass criteria:
  gate_accuracy == 1.0 (NO student runtime ever calls Together — safety hard gate)

Output aggregates:
  { n, gate_accuracy, audit_log_completeness, anonymization_rate,
    avg_transit_latency_ms, avg_total_latency_ms, provider_distribution }
`);
}

function loadJsonl(path) {
  return readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function average(arr) {
  return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

// ─── Per-call scoring ───────────────────────────────────────────────────────

function gateDecisionCorrect(call) {
  // Hard rule: student runtime → MUST block Together
  if (call.gate_runtime === 'student' && call.actual_provider === 'together') {
    return false;
  }
  // If expected_provider provided, must match (loose match)
  if (call.expected_provider && call.actual_provider) {
    return call.expected_provider === call.actual_provider;
  }
  // Default: gate_decision allow + provider != null = correct
  if (call.gate_decision === 'allow' && call.actual_provider) return true;
  if (call.gate_decision === 'block' && !call.actual_provider) return true;
  return true;
}

function scoreCall(call) {
  const correct = gateDecisionCorrect(call);
  return {
    call_id: call.call_id || call.id,
    scenario: call.scenario,
    expected_provider: call.expected_provider,
    actual_provider: call.actual_provider,
    gate_runtime: call.gate_runtime,
    gate_decision: call.gate_decision,
    gate_decision_correct: correct,
    audit_log_present: !!call.audit_log_id || call.audit_log_present === true,
    anonymization_applied: !!call.anonymized,
    transit_latency_ms: call.transit_latency_ms || 0,
    total_latency_ms: call.total_latency_ms || 0,
    error: call.error || null,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) { printHelp(); process.exit(args.help ? 0 : 2); }

  const calls = loadJsonl(resolve(args.input));
  if (!calls.length) { console.error('[score-fallback] empty input'); process.exit(2); }

  const perCall = calls.map(scoreCall);

  // Aggregates
  const gateCorrect = perCall.filter(c => c.gate_decision_correct).length;
  const auditPresent = perCall.filter(c => c.audit_log_present || c.actual_provider !== 'together').length;
  // Audit log only required when Together used
  const togetherCalls = perCall.filter(c => c.actual_provider === 'together');
  const togetherWithAudit = togetherCalls.filter(c => c.audit_log_present).length;
  const togetherAnonymized = togetherCalls.filter(c => c.anonymization_applied).length;

  const providerDist = {};
  for (const c of perCall) {
    const p = c.actual_provider || 'none';
    providerDist[p] = (providerDist[p] || 0) + 1;
  }

  const aggregates = {
    n: perCall.length,
    gate_accuracy: perCall.length ? gateCorrect / perCall.length : 0,
    n_gate_violations: perCall.length - gateCorrect,
    audit_log_completeness: togetherCalls.length ? togetherWithAudit / togetherCalls.length : 1,
    anonymization_rate: togetherCalls.length ? togetherAnonymized / togetherCalls.length : 1,
    avg_transit_latency_ms: average(perCall.map(c => c.transit_latency_ms)),
    avg_total_latency_ms: average(perCall.map(c => c.total_latency_ms)),
    provider_distribution: providerDist,
    n_together_calls: togetherCalls.length,
    n_together_with_audit: togetherWithAudit,
    n_together_anonymized: togetherAnonymized,
  };

  const passGate = aggregates.gate_accuracy >= args.threshold;
  const passAudit = aggregates.audit_log_completeness >= 0.95;
  const passAnonymize = aggregates.anonymization_rate >= 0.95;
  const verdict = passGate && passAudit && passAnonymize ? 'PASS' : 'FAIL';

  const violations = perCall.filter(c => !c.gate_decision_correct);

  const out = {
    generated_at: new Date().toISOString(),
    scorer: 'score-fallback-chain',
    threshold_gate_accuracy: args.threshold,
    verdict,
    pass_breakdown: { gate: passGate, audit: passAudit, anonymize: passAnonymize },
    aggregates,
    violations: violations.slice(0, 20),
    per_call: perCall,
  };

  if (args.output) {
    const outPath = resolve(args.output);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log(`[score-fallback] wrote ${outPath}`);
  }

  console.log(`# Fallback Chain Score`);
  console.log(`gate_accuracy=${(aggregates.gate_accuracy * 100).toFixed(1)}% violations=${aggregates.n_gate_violations}`);
  console.log(`audit_completeness=${(aggregates.audit_log_completeness * 100).toFixed(1)}% anonymization=${(aggregates.anonymization_rate * 100).toFixed(1)}%`);
  console.log(`avg_transit=${aggregates.avg_transit_latency_ms.toFixed(0)}ms avg_total=${aggregates.avg_total_latency_ms.toFixed(0)}ms`);
  console.log(`provider_dist: ${JSON.stringify(providerDist)}`);
  console.log(`Verdict: ${verdict}`);

  if (violations.length > 0) {
    console.error(`[score-fallback] ${violations.length} gate violations:`);
    for (const v of violations.slice(0, 5)) {
      console.error(`  ${v.call_id} scenario=${v.scenario} runtime=${v.gate_runtime} actual=${v.actual_provider}`);
    }
  }

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
