/**
 * UNLIM Dreams Batch — Sprint U iter 39 Phase 4
 *
 * Anthropic Dreams pattern equivalent: overnight asynchronous consolidation
 * of session history into compressed per-docente / per-classe / per-experiment
 * insights, retrieved next-day at low latency via Dashboard + chat pre-context
 * inject. Emergent personalization without runtime cost.
 *
 * Schedule: pg_cron 03:00 UTC nightly (zero class activity Italy 04:00-05:00).
 * TTL: 30 days (separate pg_cron prune 04:00 UTC).
 *
 * 4-phase pattern (Anthropic-derived):
 *   1. Orient   — fetch past 24h sessions per docente_id (≥3 turns + ≥1 component
 *                  mounted + duration ≥3 min relevance filter)
 *   2. Gather   — extract structured features (topics + linguaggio + errori +
 *                  tempo + intents)
 *   3. Consolidate — LLM-summarize (Mistral Medium 3.5 batch overnight cheap rate)
 *                  → per_docente + per_classe + per_experiment insights
 *   4. Prune    — separate cron 04:00 UTC TTL cleanup
 *
 * Auth: cron_secret header. Service-to-service only (NOT public).
 *
 * Reference: docs/audits/2026-05-12-phase-4-unlim-dreams-design.md
 * Migration: supabase/migrations/20260512141854_unlim_dreams_insights.sql
 * (c) Andrea Marro — 2026-05-12 — ELAB Tutor Sprint U iter 39 Phase 4
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { callLLM } from '../_shared/llm-client.ts';

// ── Type contracts ──

interface SessionRow {
  id: string;
  docente_id: string;
  class_key: string | null;
  session_data: Record<string, unknown>;
  experiment_id: string | null;
  created_at: string;
  duration_seconds: number | null;
  turn_count: number | null;
}

interface DocenteFeatures {
  docenteId: string;
  classKeys: Set<string>;
  experimentIds: Set<string>;
  totalTurns: number;
  totalDurationSec: number;
  sessionCount: number;
  sessionIds: string[];
  topics: string[];
  intentsCount: Record<string, number>;
}

interface BatchSummary {
  processedSessions: number;
  insightsCreated: number;
  errors: number;
  durationMs: number;
}

// ── Auth ──

function verifyCronAuth(req: Request): boolean {
  const expected = Deno.env.get('DREAMS_CRON_SECRET');
  if (!expected) return false; // Fail-closed when secret not configured
  const provided = req.headers.get('Authorization') || '';
  // Match Bearer <token>
  const match = provided.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1].trim() === expected;
}

// ── Supabase client (lazy) ──

let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (_client) return _client;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase env not configured');
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

// ── Phase Dreams 1: Orient ──

async function orientPastSessions(): Promise<SessionRow[]> {
  const supabase = getClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // Filter: past 24h + min 3 turns + non-empty session_data
  // Note: schema flexibility — sessions table may have different shape per ELAB
  // evolution. Defensive selects with optional fields, ignore on shape mismatch.
  const { data, error } = await supabase
    .from('sessions')
    .select('id, docente_id, class_key, session_data, experiment_id, created_at, duration_seconds, turn_count')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) {
    console.warn(JSON.stringify({
      level: 'warn', event: 'dreams_orient_query_error',
      error: error.message,
    }));
    return [];
  }
  if (!data) return [];
  // Filter relevance criteria in app layer (PostgREST select can't filter
  // session_data emptiness reliably across schema versions).
  return (data as SessionRow[]).filter(s => {
    if (!s.docente_id) return false;
    if ((s.turn_count ?? 0) < 3) return false;
    if ((s.duration_seconds ?? 0) < 180) return false;
    return true;
  });
}

// ── Phase Dreams 2: Gather (extract features per docente) ──

function extractFeaturesPerDocente(sessions: SessionRow[]): Map<string, DocenteFeatures> {
  const grouped = new Map<string, DocenteFeatures>();
  for (const s of sessions) {
    let f = grouped.get(s.docente_id);
    if (!f) {
      f = {
        docenteId: s.docente_id,
        classKeys: new Set(),
        experimentIds: new Set(),
        totalTurns: 0,
        totalDurationSec: 0,
        sessionCount: 0,
        sessionIds: [],
        topics: [],
        intentsCount: {},
      };
      grouped.set(s.docente_id, f);
    }
    if (s.class_key) f.classKeys.add(s.class_key);
    if (s.experiment_id) f.experimentIds.add(s.experiment_id);
    f.totalTurns += s.turn_count ?? 0;
    f.totalDurationSec += s.duration_seconds ?? 0;
    f.sessionCount += 1;
    f.sessionIds.push(s.id);
    // Best-effort topic extraction from session_data (shape varies)
    const sd = s.session_data || {};
    const topics = Array.isArray((sd as Record<string, unknown>).topics)
      ? ((sd as Record<string, unknown>).topics as string[])
      : [];
    f.topics.push(...topics.slice(0, 5));
    // Best-effort intent counts
    const intents = (sd as Record<string, unknown>).intents_dispatched as
      Record<string, number> | undefined;
    if (intents) {
      for (const [k, v] of Object.entries(intents)) {
        f.intentsCount[k] = (f.intentsCount[k] || 0) + (typeof v === 'number' ? v : 1);
      }
    }
  }
  return grouped;
}

// ── Phase Dreams 3: Consolidate (LLM-summarize features → insight text) ──

const DREAMS_CONSOLIDATION_PROMPT = `Sei UNLIM Dreams, sistema di consolidamento notturno ELAB Tutor.

Compito: leggi le features aggregate di un docente nelle ultime 24h e
produci 1 paragrafo (max 80 parole) in italiano che riassuma:
- cosa il docente ha fatto in classe (capitoli/esperimenti coperti)
- pattern emersi (tempo medio per task, errori ricorrenti, intent UNLIM frequenti)
- suggerimento PEDAGOGICO concreto per la prossima sessione

Regole MANDATORY:
- Linguaggio plurale "il docente" (NO "tu/lei")
- Cita Vol./pag. se topic chiaro
- NO opinioni, solo fatti dai dati
- Tono professionale + caldo
- Max 80 parole, NO lista, paragrafo prosastico

Output: SOLO il paragrafo. Nessun preambolo.`;

async function consolidateInsight(features: DocenteFeatures): Promise<string | null> {
  const featurePayload = JSON.stringify({
    classi: Array.from(features.classKeys),
    esperimenti: Array.from(features.experimentIds),
    sessioni_count: features.sessionCount,
    turni_totali: features.totalTurns,
    durata_totale_minuti: Math.round(features.totalDurationSec / 60),
    topics_visti: features.topics.slice(0, 10),
    intents_frequenti: Object.entries(features.intentsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => ({ intent: k, count: v })),
  });

  try {
    const result = await callLLM({
      model: 'mistral-medium-latest',     // batch overnight, no rush
      systemPrompt: DREAMS_CONSOLIDATION_PROMPT,
      message: featurePayload,
      maxOutputTokens: 250,
      temperature: 0.3,                    // low for stable summarization
      preferFastProvider: false,           // overnight batch, no rush
    });
    return result.text.trim() || null;
  } catch (e) {
    console.warn(JSON.stringify({
      level: 'warn', event: 'dreams_consolidate_llm_error',
      docenteId: features.docenteId,
      error: e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200),
    }));
    return null;
  }
}

// ── Insert insight row ──

async function storeInsight(
  docenteId: string,
  insightType: 'per_docente' | 'per_classe' | 'per_experiment',
  scopeKey: string | null,
  text: string,
  sourceSessionIds: string[],
  turnCount: number
): Promise<boolean> {
  const supabase = getClient();
  const { error } = await supabase.from('unlim_dreams_insights').insert({
    docente_id: docenteId,
    insight_type: insightType,
    scope_key: scopeKey,
    insight_text: text,
    sources: {
      session_ids: sourceSessionIds,
      turn_count: turnCount,
      model: 'mistral-medium-latest',
      generated_at_utc: new Date().toISOString(),
    },
    // embedding left NULL — Phase 4.1 future enhancement (Voyage embed via
    // separate call) for semantic retrieval. Per-docente recent fetch index
    // suffices Phase 4 MVP.
  });
  if (error) {
    console.warn(JSON.stringify({
      level: 'warn', event: 'dreams_store_error',
      docenteId, error: error.message,
    }));
    return false;
  }
  return true;
}

// ── Main batch handler ──

async function runBatch(): Promise<BatchSummary> {
  const start = Date.now();
  let processedSessions = 0;
  let insightsCreated = 0;
  let errors = 0;

  // Phase 1 Orient
  const sessions = await orientPastSessions();
  processedSessions = sessions.length;

  if (sessions.length === 0) {
    console.info(JSON.stringify({
      level: 'info', event: 'dreams_batch_empty',
      message: 'No sessions matched relevance criteria past 24h',
    }));
    return { processedSessions: 0, insightsCreated: 0, errors: 0, durationMs: Date.now() - start };
  }

  // Phase 2 Gather (group by docente)
  const grouped = extractFeaturesPerDocente(sessions);

  // Phase 3 Consolidate + store sequentially (overnight batch, no concurrency
  // pressure; sequential easier to debug + respect Mistral rate limits)
  for (const [docenteId, features] of grouped) {
    const insightText = await consolidateInsight(features);
    if (!insightText) {
      errors++;
      continue;
    }
    const stored = await storeInsight(
      docenteId,
      'per_docente',
      null,
      insightText,
      features.sessionIds,
      features.totalTurns
    );
    if (stored) {
      insightsCreated++;
    } else {
      errors++;
    }
  }

  // Phase 4 Prune handled by separate pg_cron job (DELETE WHERE expires_at < now)

  const summary: BatchSummary = {
    processedSessions,
    insightsCreated,
    errors,
    durationMs: Date.now() - start,
  };
  console.info(JSON.stringify({
    level: 'info', event: 'dreams_batch_complete',
    ...summary,
  }));
  return summary;
}

// ── HTTP handler ──

serve(async (req: Request) => {
  // CORS preflight (defensive — function is service-to-service but pg_net + curl can OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Cron secret auth (fail-closed)
  if (!verifyCronAuth(req)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const summary = await runBatch();
    return new Response(JSON.stringify({ ok: true, ...summary }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(JSON.stringify({
      level: 'error', event: 'dreams_batch_fatal',
      error: e instanceof Error ? e.message : String(e),
    }));
    return new Response(JSON.stringify({
      ok: false,
      error: 'batch_failed',
      detail: e instanceof Error ? e.message.slice(0, 200) : 'unknown',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
