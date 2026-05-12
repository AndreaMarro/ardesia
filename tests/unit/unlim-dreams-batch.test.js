/**
 * Unit tests UNLIM Dreams batch (Sprint U iter 39 Phase 4).
 *
 * Validates structural invariants without spinning Deno + Supabase + LLM:
 *   - Migration SQL: table + indexes + RLS + correct constraints
 *   - Edge Function source: auth gate present + 4-phase pattern present
 *   - DREAMS_CONSOLIDATION_PROMPT: PRINCIPIO ZERO compliance (plurale + Vol/pag)
 *   - File paths match deploy expectations
 *
 * Live integration (real pg_cron + Mistral batch + Supabase insert) tested
 * post-deploy + 5-night smoke review per Phase 4 design doc step 10.
 *
 * Reference: docs/audits/2026-05-12-phase-4-unlim-dreams-design.md
 * (c) Andrea Marro — 2026-05-12 — ELAB Tutor Sprint U iter 39 Phase 4
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = join(import.meta.dirname, '..', '..');
const MIGRATION_PATH = join(REPO_ROOT, 'supabase/migrations/20260512141854_unlim_dreams_insights.sql');
const FUNCTION_PATH = join(REPO_ROOT, 'supabase/functions/unlim-dreams-batch/index.ts');

describe('Phase 4 — Migration file', () => {
  it('migration file exists at expected path', () => {
    expect(existsSync(MIGRATION_PATH)).toBe(true);
  });

  let sql;
  it('reads migration content', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql.length).toBeGreaterThan(500);
  });

  it('creates unlim_dreams_insights table', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS unlim_dreams_insights/);
  });

  it('has BIGSERIAL primary key id', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/id BIGSERIAL PRIMARY KEY/);
  });

  it('has docente_id NOT NULL TEXT', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/docente_id TEXT NOT NULL/);
  });

  it('has insight_type CHECK constraint with 3 values', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/insight_type IN \('per_docente', 'per_classe', 'per_experiment'\)/);
  });

  it('has embedding VECTOR(1024) for pgvector semantic retrieval', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/embedding VECTOR\(1024\)/);
  });

  it('has sources JSONB for audit + GDPR Art.28 §3 compliance', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/sources JSONB/);
  });

  it('has expires_at default 30 days TTL', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/expires_at TIMESTAMPTZ.*INTERVAL '30 days'/);
  });

  it('has insight_text non-empty CHECK constraint', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/insight_text_nonempty CHECK \(length\(trim\(insight_text\)\) > 0\)/);
  });

  it('creates 4 indexes (docente_recent + embedding + scope + expires)', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/idx_dreams_docente_recent/);
    expect(sql).toMatch(/idx_dreams_embedding/);
    expect(sql).toMatch(/idx_dreams_scope/);
    expect(sql).toMatch(/idx_dreams_expires/);
  });

  it('enables RLS + service_role_full policy', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(/CREATE POLICY "service_role_full"/);
  });

  it('grants on authenticated + anon + service_role', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    expect(sql).toMatch(/GRANT.*ON unlim_dreams_insights/);
    expect(sql).toMatch(/TO authenticated, anon, service_role/);
  });

  it('pg_cron scheduling COMMENTED (Andrea explicit ratify required)', () => {
    sql = readFileSync(MIGRATION_PATH, 'utf-8');
    // Both Dreams nightly + Prune scheduling blocks present but commented
    expect(sql).toMatch(/--\s*SELECT cron\.schedule\(/);
    expect(sql).toMatch(/unlim-dreams-nightly/);
    expect(sql).toMatch(/unlim-dreams-prune/);
  });
});

describe('Phase 4 — Edge Function source', () => {
  it('function file exists at expected path', () => {
    expect(existsSync(FUNCTION_PATH)).toBe(true);
  });

  let src;
  it('reads function content', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src.length).toBeGreaterThan(1000);
  });

  it('imports serve from std http', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/import \{ serve \} from 'https:\/\/deno\.land\/std/);
  });

  it('imports callLLM from llm-client.ts', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/import \{ callLLM \} from '\.\.\/_shared\/llm-client\.ts'/);
  });

  it('has verifyCronAuth function (fail-closed Bearer secret)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/function verifyCronAuth/);
    expect(src).toMatch(/DREAMS_CRON_SECRET/);
  });

  it('has 4-phase Dreams pattern (orient + gather + consolidate + prune)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/Phase Dreams 1.*Orient/i);
    expect(src).toMatch(/Phase Dreams 2.*Gather/i);
    expect(src).toMatch(/Phase Dreams 3.*Consolidate/i);
    // Phase 4 Prune is implemented as separate pg_cron job, not in this
    // Edge Function — the function comment references "Phase 4 Prune handled
    // by separate pg_cron job" (no "Dreams" prefix on Phase 4).
    expect(src).toMatch(/Phase\s+(Dreams\s+)?4.*Prune/i);
  });

  it('has orientPastSessions function (Phase 1)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/function orientPastSessions/);
    expect(src).toMatch(/24 \* 60 \* 60 \* 1000/); // past 24h
  });

  it('has extractFeaturesPerDocente function (Phase 2)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/function extractFeaturesPerDocente/);
  });

  it('has consolidateInsight function (Phase 3) via callLLM', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/async function consolidateInsight/);
    expect(src).toMatch(/await callLLM/);
  });

  it('uses mistral-medium-latest model for batch overnight (cheap rate)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/model:\s*'mistral-medium-latest'/);
  });

  it('storeInsight inserts into unlim_dreams_insights table', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/\.from\('unlim_dreams_insights'\)/);
    expect(src).toMatch(/\.insert\(/);
  });

  it('records sources JSONB for GDPR Art.28 §3 audit', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/sources:\s*\{/);
    expect(src).toMatch(/session_ids/);
    expect(src).toMatch(/generated_at_utc/);
  });

  it('rejects non-POST methods (405)', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/method_not_allowed/);
  });

  it('returns 401 on missing/bad Bearer token', () => {
    src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/unauthorized/);
  });
});

describe('Phase 4 — DREAMS_CONSOLIDATION_PROMPT (PRINCIPIO ZERO compliance)', () => {
  it('prompt enforces plurale "il docente" (NO singolare tu/lei)', () => {
    const src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/Linguaggio plurale "il docente"/);
    expect(src).toMatch(/NO "tu\/lei"/);
  });

  it('prompt mentions Vol\\/pag canonical citation rule', () => {
    const src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/Cita Vol\.\/pag\./);
  });

  it('prompt caps output 80 words paragraph (no list)', () => {
    const src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/Max 80 parole.*NO lista/);
  });

  it('prompt requires fact-only output (NO opinions)', () => {
    const src = readFileSync(FUNCTION_PATH, 'utf-8');
    expect(src).toMatch(/NO opinioni.*solo fatti/);
  });

  it('prompt italian language', () => {
    const src = readFileSync(FUNCTION_PATH, 'utf-8');
    // Prompt itself should be in Italian (UNLIM target language)
    expect(src).toMatch(/Sei UNLIM Dreams/);
    expect(src).toMatch(/in italiano/);
  });
});
