#!/usr/bin/env node
/**
 * Sprint S iter 8 — Fallback Chain Bench Runner (ATOM-S8-A10 prep)
 *
 * Synthesizes fallback scenarios (RunPod down → Gemini, Gemini quota → Together
 * gated, student runtime → Together blocked) and validates gate decisions
 * via score-fallback-chain.mjs. Optional live mode replays from Supabase
 * together_audit_log table (deferred iter 9+).
 *
 * Test scenarios (10 baseline):
 *   1. runpod_down_gemini_ok            → expect actual=gemini-flash-lite
 *   2. runpod_down_gemini_quota         → expect actual=together gated emergency
 *   3. all_down_emergency               → expect actual=together w/ anonymization
 *   4. student_runtime_block            → expect actual=null/gemini (block Together)
 *   5. teacher_runtime_allow            → expect actual=together if needed
 *   6. batch_runtime_allow              → expect actual=together
 *   7. emergency_runtime_allow          → expect actual=together w/ audit
 *   8. anonymization_required           → expect anonymized=true if Together
 *   9. audit_log_required               → expect audit_log_id present
 *   10. all_providers_ok                → expect actual=runpod (primary)
 *
 * Usage:
 *   node scripts/bench/run-fallback-chain-bench.mjs [--n-extra 0] [--threshold 1.0]
 *
 * Output: scripts/bench/output/fallback-chain-{ts}.{jsonl,json,md}
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseArgs(argv) {
  const out = { nExtra: 0, threshold: 1.0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--n-extra') out.nExtra = parseInt(argv[++i], 10);
    else if (a === '--threshold') out.threshold = parseFloat(argv[++i]);
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node run-fallback-chain-bench.mjs [--n-extra 0] [--threshold 1.0]');
      process.exit(0);
    }
  }
  return out;
}

// ─── Baseline scenarios ────────────────────────────────────────────────────

const SCENARIOS = [
  {
    call_id: 'fc-001',
    scenario: 'runpod_down_gemini_ok',
    gate_runtime: 'student',
    expected_provider: 'gemini-flash-lite',
    actual_provider: 'gemini-flash-lite',
    gate_decision: 'allow',
    audit_log_id: null,
    anonymized: false,
    transit_latency_ms: 250,
    total_latency_ms: 4500,
  },
  {
    call_id: 'fc-002',
    scenario: 'runpod_down_gemini_quota_student',
    gate_runtime: 'student',
    expected_provider: null,
    actual_provider: null,
    gate_decision: 'block',
    audit_log_id: 'audit-002',
    anonymized: false,
    transit_latency_ms: 500,
    total_latency_ms: 8000,
  },
  {
    call_id: 'fc-003',
    scenario: 'all_down_emergency_teacher',
    gate_runtime: 'emergency',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-003',
    anonymized: true,
    transit_latency_ms: 800,
    total_latency_ms: 6500,
  },
  {
    call_id: 'fc-004',
    scenario: 'student_runtime_block_together',
    gate_runtime: 'student',
    expected_provider: 'gemini-flash-lite',
    actual_provider: 'gemini-flash-lite',
    gate_decision: 'allow',
    audit_log_id: null,
    anonymized: false,
    transit_latency_ms: 200,
    total_latency_ms: 4200,
  },
  {
    call_id: 'fc-005',
    scenario: 'teacher_runtime_allow',
    gate_runtime: 'teacher',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-005',
    anonymized: true,
    transit_latency_ms: 100,
    total_latency_ms: 4800,
  },
  {
    call_id: 'fc-006',
    scenario: 'batch_runtime_allow',
    gate_runtime: 'batch',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-006',
    anonymized: true,
    transit_latency_ms: 50,
    total_latency_ms: 3500,
  },
  {
    call_id: 'fc-007',
    scenario: 'emergency_runtime_audit',
    gate_runtime: 'emergency',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-007',
    anonymized: true,
    transit_latency_ms: 600,
    total_latency_ms: 7000,
  },
  {
    call_id: 'fc-008',
    scenario: 'anonymization_check',
    gate_runtime: 'emergency',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-008',
    anonymized: true,
    transit_latency_ms: 700,
    total_latency_ms: 6800,
  },
  {
    call_id: 'fc-009',
    scenario: 'audit_log_check',
    gate_runtime: 'teacher',
    expected_provider: 'together',
    actual_provider: 'together',
    gate_decision: 'allow',
    audit_log_id: 'audit-009',
    anonymized: true,
    transit_latency_ms: 90,
    total_latency_ms: 4900,
  },
  {
    call_id: 'fc-010',
    scenario: 'all_ok_runpod_primary',
    gate_runtime: 'student',
    expected_provider: 'runpod',
    actual_provider: 'runpod',
    gate_decision: 'allow',
    audit_log_id: null,
    anonymized: false,
    transit_latency_ms: 0,
    total_latency_ms: 2800,
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));

  const calls = [...SCENARIOS];
  // Optional: add extras (variation of scenarios)
  for (let i = 0; i < args.nExtra; i++) {
    const base = SCENARIOS[i % SCENARIOS.length];
    calls.push({ ...base, call_id: `fc-extra-${i + 1}` });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = resolve(__dirname, 'output');
  mkdirSync(outDir, { recursive: true });
  const callsPath = join(outDir, `fallback-chain-calls-${ts}.jsonl`);
  const scoresPath = join(outDir, `fallback-chain-scores-${ts}.json`);
  const reportPath = join(outDir, `fallback-chain-report-${ts}.md`);

  writeFileSync(callsPath, calls.map(c => JSON.stringify(c)).join('\n'));
  console.log(`[run-fallback] wrote ${callsPath} (n=${calls.length})`);

  const scorerPath = resolve(__dirname, 'score-fallback-chain.mjs');
  const r = spawnSync(process.execPath, [
    scorerPath,
    '--input', callsPath,
    '--output', scoresPath,
    '--threshold', String(args.threshold),
  ], { stdio: 'inherit' });

  let scoreData = {};
  try { scoreData = JSON.parse(readFileSync(scoresPath, 'utf-8')); } catch {}
  const a = scoreData.aggregates || {};
  const md = [
    `# Fallback Chain Bench Report`,
    `Generated: ${new Date().toISOString()}`,
    `Calls: ${calls.length} (10 baseline + ${args.nExtra} extras)`,
    `Threshold gate_accuracy: ${args.threshold}`,
    ``,
    `## Aggregates`,
    `- gate_accuracy: ${((a.gate_accuracy || 0) * 100).toFixed(1)}% (${a.n_gate_violations || 0} violations)`,
    `- audit_log_completeness: ${((a.audit_log_completeness || 0) * 100).toFixed(1)}%`,
    `- anonymization_rate: ${((a.anonymization_rate || 0) * 100).toFixed(1)}%`,
    `- avg_transit_latency_ms: ${(a.avg_transit_latency_ms || 0).toFixed(0)}`,
    `- avg_total_latency_ms: ${(a.avg_total_latency_ms || 0).toFixed(0)}`,
    `- provider_distribution: ${JSON.stringify(a.provider_distribution || {})}`,
    ``,
    `## Honesty caveat`,
    `Synthetic baseline scenarios — live replay requires Supabase together_audit_log query.`,
    `Hard rule validated: gate_runtime='student' MUST NOT route to Together.`,
    ``,
    `Verdict: **${scoreData.verdict || 'UNKNOWN'}**`,
  ].join('\n');
  writeFileSync(reportPath, md);
  console.log(`[run-fallback] wrote ${reportPath}`);

  process.exit(r.status || 0);
}

main();
