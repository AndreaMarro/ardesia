/**
 * OpenClaw Tool Memory — cache + reuse + garbage collection
 *
 * Persists generated tools to Supabase pgvector. Algorithmic reuse
 * via BGE-M3 embedding similarity. Quality tracking + auto-deletion
 * of low-performing tools.
 *
 * Storage: Supabase table `openclaw_tool_memory` with pgvector HNSW
 *   index on description_embedding (1024-dim BGE-M3).
 *
 * Lifecycle:
 *   1. Generate → persist with quality_score=0.5 (untested prior)
 *   2. Use → update usage_count, success/failure, recompute quality
 *   3. Periodic GC → soft-delete low quality or stale, then hard-delete
 *      after 90 days soft-deleted
 *
 * (c) ELAB Tutor — 2026-04-22
 */

import type { GeneratedTool } from './morphic-generator.ts';

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export interface ToolMemoryRow {
  id: string;
  content_hash: string;
  name: string;
  description_it: string;
  description_en?: string;
  description_embedding: Float32Array | number[];
  level: 'L1' | 'L2' | 'L3';
  composition_steps?: unknown;
  template_name?: string;
  template_filled?: string;
  generated_code?: string;
  created_at: string;
  last_used: string;
  usage_count: number;
  success_count: number;
  failure_count: number;
  quality_score: number;
  pz_v3_compliance: boolean;
  locales_tested: string[];
  deleted: boolean;
  reason_deleted?: string;
  parent_ids?: string[];
}

export interface ReuseCandidate {
  id: string;
  name: string;
  similarity: number;
  quality_score: number;
  level: 'L1' | 'L2' | 'L3';
}

export interface OutcomeReport {
  success: boolean;
  error?: string;
  latency_ms: number;
  pz_v3_ok: boolean;
}

// ════════════════════════════════════════════════════════════════════
// Supabase client abstraction (injected so this file is portable
// between Edge Function and Deno test runners)
// ════════════════════════════════════════════════════════════════════

export interface SupabaseLike {
  rpc(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  from(table: string): {
    insert(row: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
    update(row: Record<string, unknown>): {
      eq(col: string, val: unknown): Promise<{ data: unknown; error: unknown }>;
    };
    delete(): {
      eq(col: string, val: unknown): Promise<{ data: unknown; error: unknown }>;
      lt(col: string, val: unknown): Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export interface EmbedderLike {
  embed(text: string): Promise<number[]>;
}

// ════════════════════════════════════════════════════════════════════
// Main API
// ════════════════════════════════════════════════════════════════════

export async function findReuseCandidate(params: {
  userMsg: string;
  supabase: SupabaseLike;
  embedder: EmbedderLike;
  minQuality?: number;
  maxMatches?: number;
  threshold?: number;
}): Promise<ReuseCandidate | null> {
  const minQuality = params.minQuality ?? 0.7;
  const maxMatches = params.maxMatches ?? 5;
  const threshold = params.threshold ?? 0.85;

  const queryEmbedding = await params.embedder.embed(params.userMsg);

  const { data, error } = await params.supabase.rpc('match_tools', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: maxMatches,
    filter_min_quality: minQuality,
    filter_deleted: false,
  });

  if (error) {
    console.error('[tool-memory] match_tools rpc failed', error);
    return null;
  }

  const candidates = (data as ReuseCandidate[] | null) ?? [];
  if (!candidates.length) return null;

  // Highest similarity wins (rpc already ordered)
  return candidates[0];
}

export async function persistTool(params: {
  tool: GeneratedTool;
  supabase: SupabaseLike;
  embedder: EmbedderLike;
  parentIds?: string[];
}): Promise<{ id: string } | null> {
  const contentHash = await hashContent(params.tool);
  const embedding = await params.embedder.embed(params.tool.description_it);

  const row: Partial<ToolMemoryRow> = {
    content_hash: contentHash,
    name: params.tool.name,
    description_it: params.tool.description_it,
    description_embedding: embedding,
    level: params.tool.level,
    composition_steps: params.tool.composition_steps,
    template_name: params.tool.template_name,
    template_filled: params.tool.template_filled,
    generated_code: params.tool.generated_code,
    pz_v3_compliance: params.tool.pz_v3_ok,
    locales_tested: [params.tool.locale],
    parent_ids: params.parentIds,
    usage_count: 0,
    success_count: 0,
    failure_count: 0,
    quality_score: 0.5, // unknown prior
    deleted: false,
  };

  const { data, error } = await params.supabase.from('openclaw_tool_memory').insert(row);
  if (error) {
    console.error('[tool-memory] persist failed', error);
    return null;
  }
  const inserted = data as { id: string } | null;
  return inserted;
}

export async function markUsed(params: { id: string; supabase: SupabaseLike }): Promise<void> {
  await params.supabase.rpc('touch_tool', { tool_id: params.id });
}

export async function trackOutcome(params: {
  id: string;
  outcome: OutcomeReport;
  supabase: SupabaseLike;
}): Promise<void> {
  const { id, outcome, supabase } = params;
  await supabase.rpc('record_tool_outcome', {
    tool_id: id,
    success: outcome.success,
    error_message: outcome.error ?? null,
    latency_ms: outcome.latency_ms,
    pz_v3_ok: outcome.pz_v3_ok,
  });
}

// ════════════════════════════════════════════════════════════════════
// Garbage collection (cron 04:00 UTC nightly)
// ════════════════════════════════════════════════════════════════════

export async function garbageCollect(params: {
  supabase: SupabaseLike;
  lowQualityThreshold?: number;
  minUsageForQualityCheck?: number;
  staleDays?: number;
  minUsageToKeepStale?: number;
  hardDeleteAfterDays?: number;
}): Promise<GcReport> {
  const lowQualityThreshold = params.lowQualityThreshold ?? 0.3;
  const minUsage = params.minUsageForQualityCheck ?? 5;
  const staleDays = params.staleDays ?? 30;
  const minUsageStale = params.minUsageToKeepStale ?? 3;
  const hardDeleteDays = params.hardDeleteAfterDays ?? 90;

  const { data, error } = await params.supabase.rpc('gc_tool_memory', {
    low_quality_threshold: lowQualityThreshold,
    min_usage_quality: minUsage,
    stale_days: staleDays,
    min_usage_stale: minUsageStale,
    hard_delete_days: hardDeleteDays,
  });

  if (error) {
    console.error('[tool-memory] gc rpc failed', error);
    return { softDeleted: 0, hardDeleted: 0, deduped: 0, errors: [String(error)] };
  }

  const report = (data as GcReport | null) ?? { softDeleted: 0, hardDeleted: 0, deduped: 0, errors: [] };
  return report;
}

export interface GcReport {
  softDeleted: number;
  hardDeleted: number;
  deduped: number;
  errors: string[];
}

// ════════════════════════════════════════════════════════════════════
// Cross-pollination — find parents to borrow patterns from
// ════════════════════════════════════════════════════════════════════

export async function findCrossPollinationParents(params: {
  userMsg: string;
  supabase: SupabaseLike;
  embedder: EmbedderLike;
  k?: number;
  threshold?: number;
}): Promise<string[]> {
  const k = params.k ?? 3;
  const threshold = params.threshold ?? 0.75;

  const emb = await params.embedder.embed(params.userMsg);
  const { data } = await params.supabase.rpc('match_tools', {
    query_embedding: emb,
    match_threshold: threshold,
    match_count: k,
    filter_min_quality: 0.6,
    filter_deleted: false,
  });
  const matches = (data as Array<{ id: string }> | null) ?? [];
  return matches.map(m => m.id);
}

// ════════════════════════════════════════════════════════════════════
// Utilities
// ════════════════════════════════════════════════════════════════════

async function hashContent(tool: GeneratedTool): Promise<string> {
  const serialized = JSON.stringify({
    level: tool.level,
    steps: tool.composition_steps,
    template: tool.template_filled,
    code: tool.generated_code,
  });

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buffer = new TextEncoder().encode(serialized);
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Node fallback (for test runner without Web Crypto)
  const nodeCrypto = await import('node:crypto');
  return nodeCrypto.createHash('sha256').update(serialized).digest('hex');
}

// ════════════════════════════════════════════════════════════════════
// Supabase migration SQL (reference — apply separately)
// ════════════════════════════════════════════════════════════════════

export const MIGRATION_SQL = `
-- OpenClaw Tool Memory table
CREATE TABLE IF NOT EXISTS openclaw_tool_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description_it TEXT NOT NULL,
  description_en TEXT,
  description_embedding VECTOR(1024),
  level TEXT NOT NULL CHECK (level IN ('L1','L2','L3')),
  composition_steps JSONB,
  template_name TEXT,
  template_filled TEXT,
  generated_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used TIMESTAMPTZ DEFAULT now(),
  usage_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  quality_score FLOAT DEFAULT 0.5,
  pz_v3_compliance BOOLEAN DEFAULT true,
  locales_tested TEXT[] DEFAULT ARRAY['it'],
  deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  reason_deleted TEXT,
  parent_ids UUID[]
);

CREATE INDEX IF NOT EXISTS tool_memory_embedding_hnsw
  ON openclaw_tool_memory USING hnsw (description_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS tool_memory_quality ON openclaw_tool_memory (quality_score);
CREATE INDEX IF NOT EXISTS tool_memory_deleted ON openclaw_tool_memory (deleted);
CREATE INDEX IF NOT EXISTS tool_memory_last_used ON openclaw_tool_memory (last_used);

-- RPC: cosine similarity match
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding VECTOR(1024),
  match_threshold FLOAT,
  match_count INT,
  filter_min_quality FLOAT DEFAULT 0.7,
  filter_deleted BOOLEAN DEFAULT false
) RETURNS TABLE(id UUID, name TEXT, similarity FLOAT, quality_score FLOAT, level TEXT) AS $$
  SELECT t.id, t.name, 1 - (t.description_embedding <=> query_embedding) AS similarity,
         t.quality_score, t.level
  FROM openclaw_tool_memory t
  WHERE t.deleted = filter_deleted
    AND t.quality_score >= filter_min_quality
    AND 1 - (t.description_embedding <=> query_embedding) > match_threshold
  ORDER BY t.description_embedding <=> query_embedding
  LIMIT match_count
$$ LANGUAGE SQL STABLE;

-- RPC: mark tool as used
CREATE OR REPLACE FUNCTION touch_tool(tool_id UUID) RETURNS VOID AS $$
  UPDATE openclaw_tool_memory
  SET usage_count = usage_count + 1,
      last_used = now()
  WHERE id = tool_id;
$$ LANGUAGE SQL;

-- RPC: record outcome (updates counts + quality_score)
CREATE OR REPLACE FUNCTION record_tool_outcome(
  tool_id UUID,
  success BOOLEAN,
  error_message TEXT DEFAULT NULL,
  latency_ms INT DEFAULT NULL,
  pz_v3_ok BOOLEAN DEFAULT true
) RETURNS VOID AS $$
  UPDATE openclaw_tool_memory
  SET
    usage_count = usage_count + 1,
    success_count = success_count + CASE WHEN success THEN 1 ELSE 0 END,
    failure_count = failure_count + CASE WHEN success THEN 0 ELSE 1 END,
    last_used = now(),
    updated_at = now(),
    quality_score = (success_count + CASE WHEN success THEN 1 ELSE 0 END)::FLOAT /
                    GREATEST(usage_count + 1, 1)::FLOAT,
    pz_v3_compliance = pz_v3_compliance AND pz_v3_ok
  WHERE id = tool_id;
$$ LANGUAGE SQL;

-- RPC: garbage collection
CREATE OR REPLACE FUNCTION gc_tool_memory(
  low_quality_threshold FLOAT,
  min_usage_quality INT,
  stale_days INT,
  min_usage_stale INT,
  hard_delete_days INT
) RETURNS JSONB AS $$
DECLARE
  soft_count INT := 0;
  hard_count INT := 0;
BEGIN
  -- Soft delete low quality
  UPDATE openclaw_tool_memory
  SET deleted = true, deleted_at = now(), reason_deleted = 'low quality after minimum attempts'
  WHERE NOT deleted AND quality_score < low_quality_threshold AND usage_count >= min_usage_quality;
  GET DIAGNOSTICS soft_count = ROW_COUNT;

  -- Soft delete stale
  UPDATE openclaw_tool_memory
  SET deleted = true, deleted_at = now(), reason_deleted = 'stale + rare usage'
  WHERE NOT deleted
    AND last_used < now() - (stale_days || ' days')::interval
    AND usage_count < min_usage_stale;

  -- Hard delete after X days soft-deleted
  DELETE FROM openclaw_tool_memory
  WHERE deleted AND deleted_at < now() - (hard_delete_days || ' days')::interval;
  GET DIAGNOSTICS hard_count = ROW_COUNT;

  RETURN jsonb_build_object('softDeleted', soft_count, 'hardDeleted', hard_count, 'deduped', 0, 'errors', '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;
`;
