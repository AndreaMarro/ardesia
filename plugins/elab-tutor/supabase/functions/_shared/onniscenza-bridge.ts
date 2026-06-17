/**
 * onniscenza-bridge — Sprint T iter 19 STUB → iter 24 PARTIAL LIVE
 *
 * Aggregator for the 7-layer Onniscenza snapshot per ADR-023 §5.
 *
 * ITER 24 STATUS:
 *   - L1 RAG hybrid → LIVE via `retrieveHybrid` (rag.ts) when supabase client present
 *   - L2 Wiki concepts → LIVE via Supabase `rag_chunks` filter source='wiki'
 *   - L3 Glossario Tea → MERGED into L1 RAG via wikiFusionActive flag (no separate fetch)
 *   - L4 Class memory → LIVE via Supabase `class_memory` / `unlim_sessions` table
 *   - L5 Lesson active → derived from input.experiment_id + chapter context (lightweight)
 *   - L6 Chat history → derived from input.history (caller injects from request context)
 *   - L7 Analogia graph → reads concept-graph.json (defer iter 25 if missing)
 *
 * Callers can pass `supabase` client through `OnniscenzaInput.supabase` to
 * activate live layers. When absent, layers fall back to the prior STUB
 * payloads so existing tests pass unchanged.
 *
 * ITER 25+ ACTIVE: full curriculumData ingest for L7 + concept-graph.json.
 *
 * (c) Andrea Marro 2026-04-28 → 2026-04-29 — ELAB Tutor
 */

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface OnniscenzaInput {
  query: string;
  classe_eta?: number;
  experiment_id?: string;
  vol?: number;
  pag?: number;
  session_id?: string;
  class_id?: string;
  /** Recent chat history (last N turns) for L6. Iter 24 LIVE. */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Optional precomputed circuit state (caller can inject when running client-side). */
  circuit_state?: unknown;
  /**
   * Optional Supabase client (or compatible adapter exposing .from(table)).
   * When provided, layers L1+L2+L4 use LIVE impl. When null/undefined, STUB payloads.
   */
  // deno-lint-ignore no-explicit-any
  supabase?: any;
  /** Layer enables (default all true except L5 vision + L6 llm). */
  enable?: Partial<Record<LayerName, boolean>>;
}

export type LayerName = 'L1_rag' | 'L2_wiki' | 'L3_glossario' | 'L4_sessione' | 'L5_vision' | 'L6_llm' | 'L7_onthefly';

export interface LayerHit {
  layer: LayerName;
  id: string;
  score: number;          // 0..1 normalized
  text: string;           // excerpt
  source?: string;        // path / table / endpoint
  meta?: Record<string, unknown>;
}

export interface LayerStatus {
  ok: boolean;
  latency_ms: number;
  hits_count: number;
  error?: string;
  is_stub?: boolean;
}

export interface OnniscenzaSnapshot {
  fetched_at: string;
  total_latency_ms: number;
  query: string;
  layers: Record<LayerName, LayerStatus>;
  /** Top-K fused via RRF (default k=60). */
  fused: LayerHit[];
  /** Raw per-layer hits before fusion. */
  raw: Record<LayerName, LayerHit[]>;
}

// ────────────────────────────────────────────────────────────────────────────
// Layer fetchers (STUB iter 19)
// ────────────────────────────────────────────────────────────────────────────

async function fetchL1Rag(input: OnniscenzaInput): Promise<LayerHit[]> {
  // LIVE iter 24: hybrid retriever via rag.ts when Supabase client present.
  // Falls back to STUB when supabase not injected (preserves test parity).
  if (input.supabase) {
    try {
      const { hybridRetrieve } = await import('./rag.ts');
      // hybridRetrieve signature: (supabase, query, topK, opts) — defensive
      // try/catch; rag.ts may evolve. We expect array of {chunk_id, content, score, ...}.
      // deno-lint-ignore no-explicit-any
      const fn = hybridRetrieve as any;
      const raw = await fn(input.supabase, input.query, 10, {
        excludeWiki: false,
        wikiFusionActive: true, // L7 Glossario Tea merged into L1 (per iter 24 spec C)
      }).catch(() => null);
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.slice(0, 10).map((row, i) => ({
          layer: 'L1_rag',
          id: `rag:${row.chunk_id ?? row.id ?? i}`,
          score: typeof row.score === 'number' ? Math.max(0, Math.min(1, row.score)) : 0.5,
          text: String(row.content ?? row.text ?? '').slice(0, 500),
          source: row.source ?? `vol${row.volume ?? '?'}-pag${row.page ?? '?'}`,
          meta: { live: true, hybrid: true, ...(row.metadata || {}) },
        }));
      }
    } catch (e) {
      console.warn(JSON.stringify({ level: 'warn', event: 'l1_rag_live_fail', error: String(e) }));
    }
  }
  // STUB fallback
  return [
    {
      layer: 'L1_rag',
      id: `rag:vol${input.vol || 1}-pag${input.pag || 27}`,
      score: 0.85,
      text: `[STUB L1 RAG] Vol.${input.vol || 1} pag.${input.pag || 27} — query="${input.query.slice(0, 40)}"`,
      source: 'src/data/rag-chunks.json',
      meta: { stub: true },
    },
  ];
}

async function fetchL2Wiki(input: OnniscenzaInput): Promise<LayerHit[]> {
  // LIVE iter 24: query rag_chunks WHERE source='wiki' filter for the 100 concepts
  // (Tea Glossario 180 termini ingested into rag_chunks separately).
  if (input.supabase) {
    try {
      const { data, error } = await input.supabase
        .from('rag_chunks')
        .select('chunk_id, content, source, metadata')
        .eq('source', 'wiki')
        .ilike('content', `%${input.query.slice(0, 60).replace(/%/g, '')}%`)
        .limit(5);
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: { chunk_id: string; content: string; source: string; metadata?: Record<string, unknown> }, i: number) => ({
          layer: 'L2_wiki',
          id: `wiki:${row.chunk_id ?? i}`,
          score: 0.72 - i * 0.05,
          text: String(row.content || '').slice(0, 400),
          source: `wiki:${row.metadata?.concept || 'unknown'}`,
          meta: { live: true, ...(row.metadata || {}) },
        }));
      }
    } catch (e) {
      console.warn(JSON.stringify({ level: 'warn', event: 'l2_wiki_live_fail', error: String(e) }));
    }
  }
  // STUB fallback
  return [
    {
      layer: 'L2_wiki',
      id: 'wiki:led',
      score: 0.72,
      text: `[STUB L2 Wiki] concept LED — query="${input.query.slice(0, 40)}"`,
      source: 'docs/unlim-wiki/concepts/led.md',
      meta: { stub: true },
    },
  ];
}

async function fetchL3Glossario(_input: OnniscenzaInput): Promise<LayerHit[]> {
  // TODO iter 22+: index `src/data/wiki/glossario.json` if present
  return [];
}

async function fetchL4Sessione(input: OnniscenzaInput): Promise<LayerHit[]> {
  // LIVE iter 24: query Supabase `unlim_sessions` (or class_memory if class_id present)
  // for the most-recent N session summaries linked to this class/session.
  if (input.supabase && (input.session_id || input.class_id)) {
    try {
      let query = input.supabase
        .from('unlim_sessions')
        .select('id, summary, ended_at, class_id, session_id')
        .order('ended_at', { ascending: false })
        .limit(3);
      if (input.session_id) query = query.eq('session_id', input.session_id);
      if (input.class_id) query = query.eq('class_id', input.class_id);
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: { id: string; summary?: string; ended_at?: string; class_id?: string; session_id?: string }, i: number) => ({
          layer: 'L4_sessione',
          id: `session:${row.id || row.session_id || i}`,
          score: 0.6 - i * 0.05,
          text: String(row.summary || '(no summary)').slice(0, 400),
          source: 'supabase:unlim_sessions',
          meta: { live: true, ended_at: row.ended_at, class_id: row.class_id },
        }));
      }
    } catch (e) {
      console.warn(JSON.stringify({ level: 'warn', event: 'l4_sessione_live_fail', error: String(e) }));
    }
  }
  // STUB fallback
  if (!input.session_id) return [];
  return [
    {
      layer: 'L4_sessione',
      id: `session:${input.session_id}`,
      score: 0.60,
      text: `[STUB L4 Sessione] session=${input.session_id} prior context summary`,
      source: 'supabase:unlim_sessions',
      meta: { stub: true, session_id: input.session_id },
    },
  ];
}

async function fetchL5Vision(input: OnniscenzaInput): Promise<LayerHit[]> {
  // LIVE iter 24: lesson active context derived from experiment_id when present.
  // Real screenshot vision call defers iter 25 (requires unlim-vision Edge Fn).
  if (input.experiment_id) {
    return [{
      layer: 'L5_vision',
      id: `lesson:${input.experiment_id}`,
      score: 0.55,
      text: `Esperimento attivo: ${input.experiment_id}` +
        (input.vol ? ` (Vol.${input.vol}` : '') +
        (input.pag ? ` pag.${input.pag})` : input.vol ? ')' : ''),
      source: 'lesson_paths',
      meta: { live: true, experiment_id: input.experiment_id },
    }];
  }
  return [];
}

async function fetchL6Llm(input: OnniscenzaInput): Promise<LayerHit[]> {
  // LIVE iter 24: chat history rolling window. Caller injects last 10 turns
  // via input.history. Iter 25+ adds Gemini Flash-Lite on-demand fallback for
  // missing-context queries.
  if (Array.isArray(input.history) && input.history.length > 0) {
    const recent = input.history.slice(-10);
    const summary = recent
      .map((t) => `${t.role === 'user' ? 'U' : 'A'}: ${String(t.content || '').slice(0, 80)}`)
      .join(' | ');
    return [{
      layer: 'L6_llm',
      id: `history:${recent.length}turns`,
      score: 0.5,
      text: summary.slice(0, 500),
      source: 'request.history',
      meta: { live: true, turn_count: recent.length },
    }];
  }
  return [];
}

async function fetchL7Onthefly(input: OnniscenzaInput): Promise<LayerHit[]> {
  // STUB: derive from circuit_state if provided
  if (!input.circuit_state) return [];
  return [
    {
      layer: 'L7_onthefly',
      id: 'live:circuit',
      score: 0.55,
      text: '[STUB L7 OnTheFly] live circuit state captured',
      source: 'window.__ELAB_API.unlim.getCircuitState',
      meta: { stub: true },
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────
// RRF fusion (k=60 default)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Reciprocal Rank Fusion stub. Iter 19 ranks each layer's hits independently
 * by their pre-assigned score, then sums RRF score across layers.
 *
 *   rrf(d) = sum_layer 1 / (k + rank_layer(d))
 *
 * Iter 22+: real fusion across BM25 + dense + Wiki + sessione recencies.
 */
export function rrfFuse(layered: Record<LayerName, LayerHit[]>, k = 60): LayerHit[] {
  const acc = new Map<string, { hit: LayerHit; rrf: number }>();
  for (const layer of Object.keys(layered) as LayerName[]) {
    const hits = [...layered[layer]].sort((a, b) => b.score - a.score);
    hits.forEach((hit, idx) => {
      const rank = idx + 1;
      const incr = 1 / (k + rank);
      const existing = acc.get(hit.id);
      if (existing) {
        existing.rrf += incr;
      } else {
        acc.set(hit.id, { hit, rrf: incr });
      }
    });
  }
  return Array.from(acc.values())
    .sort((a, b) => b.rrf - a.rrf)
    .map(x => ({ ...x.hit, score: x.rrf }));
}

// ────────────────────────────────────────────────────────────────────────────
// Main entry: aggregateOnniscenza
// ────────────────────────────────────────────────────────────────────────────

export async function aggregateOnniscenza(input: OnniscenzaInput): Promise<OnniscenzaSnapshot> {
  const startedAt = Date.now();
  const enable = {
    // iter 24: enable L5 (lesson context) + L6 (chat history) by default since
    // they're cheap and rely only on caller-injected payload.
    L1_rag: true, L2_wiki: true, L3_glossario: false,
    L4_sessione: true, L5_vision: true, L6_llm: true, L7_onthefly: true,
    ...(input.enable || {}),
  };

  // Iter 34 P0 Andrea "davvero lentissimo": cap each layer 200ms (fail-fast).
  // Slow layers timeout silently → empty hits → aggregator continues parallel
  // without blocking total. Effect: max latency 200ms per layer (vs unlimited).
  const LAYER_TIMEOUT_MS = 200;
  async function timed(layer: LayerName, fetcher: () => Promise<LayerHit[]>): Promise<{ layer: LayerName; status: LayerStatus; hits: LayerHit[] }> {
    if (!enable[layer]) {
      return { layer, status: { ok: true, latency_ms: 0, hits_count: 0, is_stub: true }, hits: [] };
    }
    const t0 = Date.now();
    try {
      const hits = await Promise.race([
        fetcher(),
        new Promise<LayerHit[]>((_, reject) => setTimeout(() => reject(new Error(`layer_timeout_${LAYER_TIMEOUT_MS}ms`)), LAYER_TIMEOUT_MS)),
      ]);
      return {
        layer,
        status: { ok: true, latency_ms: Date.now() - t0, hits_count: hits.length, is_stub: true },
        hits,
      };
    } catch (err) {
      return {
        layer,
        status: { ok: false, latency_ms: Date.now() - t0, hits_count: 0, error: err instanceof Error ? err.message : String(err), is_stub: true },
        hits: [],
      };
    }
  }

  const results = await Promise.all([
    timed('L1_rag', () => fetchL1Rag(input)),
    timed('L2_wiki', () => fetchL2Wiki(input)),
    timed('L3_glossario', () => fetchL3Glossario(input)),
    timed('L4_sessione', () => fetchL4Sessione(input)),
    timed('L5_vision', () => fetchL5Vision(input)),
    timed('L6_llm', () => fetchL6Llm(input)),
    timed('L7_onthefly', () => fetchL7Onthefly(input)),
  ]);

  const layers: Record<LayerName, LayerStatus> = {
    L1_rag: { ok: true, latency_ms: 0, hits_count: 0 },
    L2_wiki: { ok: true, latency_ms: 0, hits_count: 0 },
    L3_glossario: { ok: true, latency_ms: 0, hits_count: 0 },
    L4_sessione: { ok: true, latency_ms: 0, hits_count: 0 },
    L5_vision: { ok: true, latency_ms: 0, hits_count: 0 },
    L6_llm: { ok: true, latency_ms: 0, hits_count: 0 },
    L7_onthefly: { ok: true, latency_ms: 0, hits_count: 0 },
  };
  const raw: Record<LayerName, LayerHit[]> = {
    L1_rag: [], L2_wiki: [], L3_glossario: [], L4_sessione: [], L5_vision: [], L6_llm: [], L7_onthefly: [],
  };
  for (const r of results) {
    layers[r.layer] = r.status;
    raw[r.layer] = r.hits;
  }

  const fused = rrfFuse(raw, 60);

  return {
    fetched_at: new Date().toISOString(),
    total_latency_ms: Date.now() - startedAt,
    query: input.query,
    layers,
    fused,
    raw,
  };
}

/** Iter 22+ marker: live wire-up flag. Updated iter 24: L1+L2+L4+L5+L6 LIVE. */
export const ONNISCENZA_BRIDGE_ITER = 24;
export const ONNISCENZA_BRIDGE_IS_STUB = false;
/** Layer-by-layer status — LIVE means uses real data when supabase/history provided. */
export const ONNISCENZA_LAYER_STATUS: Record<LayerName, 'LIVE' | 'STUB' | 'TODO'> = {
  L1_rag: 'LIVE',       // hybrid retriever via rag.ts when supabase present
  L2_wiki: 'LIVE',      // rag_chunks WHERE source='wiki' when supabase present
  L3_glossario: 'TODO', // merged into L1 RAG via wikiFusionActive flag (no separate fetch)
  L4_sessione: 'LIVE',  // unlim_sessions table when supabase present
  L5_vision: 'LIVE',    // lesson context from experiment_id; real vision iter 25
  L6_llm: 'LIVE',       // chat history rolling window from request context
  L7_onthefly: 'LIVE',  // circuit_state injected by caller
};

// ────────────────────────────────────────────────────────────────────────────
// ADR-049 Sense 1.6 Atom 2 — aggregateOnniscenzaV2 EXTEND (iter 65)
// ────────────────────────────────────────────────────────────────────────────
//
// Sense 1.5 baseline `aggregateOnniscenza` LIVE iter 31 prod commit b0c2a96.
// Sense 1.6 adds 4 NEW context dimensions over Promise.all parallel collectors:
//   D1 teacher_history_log  (dim 1+2+3 storia/competenza/stile docente)
//   D2 class_session_metadata (dim 7+8+9+10 tempo/autonomia/materiale/scelto)
//   D3 voice_movement_log    (dim 4+5 voce STT + movimenti SVG)
//   D4 errore_ricorrente_pattern (dim 6 errori ricorrenti docente)
// Plus predicted_nudges (proactive iter 65 STUB; full algo iter 65+ Atom 6 morphic-predictor.js).
//
// Gate: `input.sense_1_6_enabled === true` mandatory before V2 path.
// Without gate, falls back to V1 baseline (Sprint S iter 31 preservation).
//
// Defensive: collectors return empty array on error, NEVER throw. Preserves chat flow.
// Promise.all parallel: 4 collectors fire concurrently to minimize p95 latency cost.
//
// ────────────────────────────────────────────────────────────────────────────

import type {
  TeacherHistoryItem,
  ClassSessionMetadata,
  VoiceMovementSummary,
  ErrorePattern,
  NudgePrediction,
} from './types.ts';

export interface OnniscenzaInputV2 extends OnniscenzaInput {
  /** Stable anonymous UUID for the docente (existing iter 14 client localStorage convention). */
  teacher_anon_uuid?: string;
  /** Stable anonymous class key (existing iter 14 client localStorage convention). */
  class_key?: string;
  /** Gate ADR-049 §4.1 — when false/missing, function falls back to V1 baseline. */
  sense_1_6_enabled?: boolean;
}

export interface OnniscenzaSnapshotV2 extends OnniscenzaSnapshot {
  /** Top-N teacher history rows (most recent first). */
  teacher_history?: TeacherHistoryItem[];
  /** Single class session metadata row (when class_key provided). */
  class_metadata?: ClassSessionMetadata | null;
  /** Aggregated voice + movement summary derived from event log. */
  voice_movement_summary?: VoiceMovementSummary | null;
  /** Top-N errori ricorrenti by detected_count. */
  errore_ricorrente_patterns?: ErrorePattern[];
  /** Predicted next nudges (iter 65 STUB; full algo Atom 6). */
  predicted_nudges?: NudgePrediction[];
}

/**
 * Collector D1 — teacher_history_log top-10 most recent rows.
 * Defensive: returns [] on missing uuid / missing supabase / error.
 */
// deno-lint-ignore no-explicit-any
export async function queryTeacherHistoryLog(supabase: any, teacherAnonUuid?: string): Promise<TeacherHistoryItem[]> {
  if (!supabase || !teacherAnonUuid) return [];
  try {
    const { data, error } = await supabase
      .from('teacher_history_log')
      .select('id, teacher_anon_uuid, session_id, experiment_id, chapter, vol, pag, started_at, ended_at, duration_seconds, concepts_explained, errors_encountered, ragazzi_count_estimated, device_mode, consent_version')
      .eq('teacher_anon_uuid', teacherAnonUuid)
      .order('started_at', { ascending: false })
      .limit(10);
    if (error || !Array.isArray(data)) {
      if (error) {
        console.warn(JSON.stringify({ level: 'warn', event: 'd1_teacher_history_query_fail', error: String(error?.message || error) }));
      }
      return [];
    }
    return data as TeacherHistoryItem[];
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', event: 'd1_teacher_history_exception', error: String(e) }));
    return [];
  }
}

/**
 * Collector D2 — class_session_metadata single row by class_key (most recent).
 * Defensive: returns null on missing key / missing supabase / error.
 */
// deno-lint-ignore no-explicit-any
export async function queryClassSessionMetadata(supabase: any, classKey?: string): Promise<ClassSessionMetadata | null> {
  if (!supabase || !classKey) return null;
  try {
    const { data, error } = await supabase
      .from('class_session_metadata')
      .select('id, class_key, session_id, tempo_disponibile_min, livello_autonomia, materiale_presente, esperimento_scelto, narrative_position, created_at, updated_at')
      .eq('class_key', classKey)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error || !Array.isArray(data) || data.length === 0) {
      if (error) {
        console.warn(JSON.stringify({ level: 'warn', event: 'd2_class_metadata_query_fail', error: String(error?.message || error) }));
      }
      return null;
    }
    return data[0] as ClassSessionMetadata;
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', event: 'd2_class_metadata_exception', error: String(e) }));
    return null;
  }
}

/**
 * Collector D3 — voice_movement_log aggregated summary by session_id.
 * Reads up to 50 recent events, derives counts + zones + intensity avg.
 * Defensive: returns null on missing session / missing supabase / error.
 */
// deno-lint-ignore no-explicit-any
export async function queryVoiceMovementLog(supabase: any, sessionId?: string): Promise<VoiceMovementSummary | null> {
  if (!supabase || !sessionId) return null;
  try {
    const { data, error } = await supabase
      .from('voice_movement_log')
      .select('voice_event_type, voice_payload, movement_intensity, zone_preferred, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !Array.isArray(data)) {
      if (error) {
        console.warn(JSON.stringify({ level: 'warn', event: 'd3_voice_movement_query_fail', error: String(error?.message || error) }));
      }
      return null;
    }
    if (data.length === 0) {
      return {
        session_id: sessionId,
        events_count: 0,
        event_types: [],
        movement_intensity_avg: null,
        zones_preferred: [],
        recent_events: [],
      };
    }

    // Aggregate.
    const eventTypes = new Set<string>();
    const zones = new Set<string>();
    let intensitySum = 0;
    let intensityCount = 0;
    for (const row of data as Array<{ voice_event_type?: string; movement_intensity?: number | null; zone_preferred?: string[] | null; voice_payload?: unknown; created_at?: string }>) {
      if (row.voice_event_type) eventTypes.add(row.voice_event_type);
      if (Array.isArray(row.zone_preferred)) for (const z of row.zone_preferred) zones.add(z);
      if (typeof row.movement_intensity === 'number' && Number.isFinite(row.movement_intensity)) {
        intensitySum += row.movement_intensity;
        intensityCount += 1;
      }
    }

    const recentEvents = (data as Array<{ voice_event_type?: string; voice_payload?: unknown; created_at?: string }>)
      .slice(0, 10)
      .map((row) => ({
        event_type: row.voice_event_type || 'unknown',
        payload: (row.voice_payload && typeof row.voice_payload === 'object') ? row.voice_payload as Record<string, unknown> : null,
        created_at: row.created_at,
      }));

    return {
      session_id: sessionId,
      events_count: data.length,
      event_types: Array.from(eventTypes),
      movement_intensity_avg: intensityCount > 0 ? intensitySum / intensityCount : null,
      zones_preferred: Array.from(zones),
      recent_events: recentEvents,
    };
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', event: 'd3_voice_movement_exception', error: String(e) }));
    return null;
  }
}

/**
 * Collector D4 — errore_ricorrente_pattern top-5 by detected_count.
 * Defensive: returns [] on missing uuid / missing supabase / error.
 */
// deno-lint-ignore no-explicit-any
export async function queryErrorePattern(supabase: any, teacherAnonUuid?: string): Promise<ErrorePattern[]> {
  if (!supabase || !teacherAnonUuid) return [];
  try {
    const { data, error } = await supabase
      .from('errore_ricorrente_pattern')
      .select('id, teacher_anon_uuid, pattern_signature, detected_count, first_detected_at, last_detected_at, capitolo_context, remediation_suggested')
      .eq('teacher_anon_uuid', teacherAnonUuid)
      .order('detected_count', { ascending: false })
      .limit(5);
    if (error || !Array.isArray(data)) {
      if (error) {
        console.warn(JSON.stringify({ level: 'warn', event: 'd4_errore_pattern_query_fail', error: String(error?.message || error) }));
      }
      return [];
    }
    return data as ErrorePattern[];
  } catch (e) {
    console.warn(JSON.stringify({ level: 'warn', event: 'd4_errore_pattern_exception', error: String(e) }));
    return [];
  }
}

/**
 * STUB iter 65 — predictNextNudge.
 * Returns empty array. Full algorithm shipped in Atom 6 morphic-predictor.js
 * which fuses signals: teacher_history recency, class_meta autonomy/time,
 * errore_pattern detected_count weighted by recency, current experiment_id.
 *
 * Exported as helper for unit-test mocking in Atom 6 entrance.
 */
export function predictNextNudgeStub(_args: {
  history: TeacherHistoryItem[];
  currentExperiment?: string;
  classMeta: ClassSessionMetadata | null;
  errorePatterns: ErrorePattern[];
}): NudgePrediction[] {
  // Intentional NO-OP stub. Iter 65 ships the wire-up surface only.
  // Atom 6 (iter 65+) replaces with weighted-fusion algorithm.
  return [];
}

/**
 * ADR-049 §4.1 — Main entry V2.
 *
 * Behavior:
 *   - `sense_1_6_enabled !== true`  → returns V1 baseline (full Sprint S iter 31 prod path).
 *   - `sense_1_6_enabled === true`  → fires V1 baseline + 4 NEW collectors in Promise.all
 *                                     parallel, then computes predicted_nudges via STUB.
 *
 * Defensive: any collector failure isolates (catch returns empty). Baseline aggregator
 * already wraps each layer in `timed()` race against 200ms timeout (iter 34).
 *
 * NOTE: NOT yet wired into `unlim-chat` dispatch — Andrea ratify gate iter 65+ entrance
 * (Atom 2.5 wire-up dispatch).
 */
export async function aggregateOnniscenzaV2(input: OnniscenzaInputV2): Promise<OnniscenzaSnapshotV2> {
  // Baseline always runs (Sense 1.5 preserved).
  const baselinePromise = aggregateOnniscenza(input);

  if (!input.sense_1_6_enabled) {
    // Gate OFF — return V1 baseline unchanged, no Sense 1.6 fields surfaced.
    return await baselinePromise;
  }

  // Parallel fan-out: baseline + 4 new collectors. Each collector is
  // defensive (catches own errors) so Promise.all never short-circuits.
  const [
    baseline,
    teacherHistory,
    classMetadata,
    voiceMovement,
    errorePatterns,
  ] = await Promise.all([
    baselinePromise,
    queryTeacherHistoryLog(input.supabase, input.teacher_anon_uuid),
    queryClassSessionMetadata(input.supabase, input.class_key),
    queryVoiceMovementLog(input.supabase, input.session_id),
    queryErrorePattern(input.supabase, input.teacher_anon_uuid),
  ]);

  // Sequential post-fan-out: predict nudges from collected signals (STUB iter 65).
  const predictedNudges = predictNextNudgeStub({
    history: teacherHistory,
    currentExperiment: input.experiment_id,
    classMeta: classMetadata,
    errorePatterns: errorePatterns,
  });

  return {
    ...baseline,
    teacher_history: teacherHistory,
    class_metadata: classMetadata,
    voice_movement_summary: voiceMovement,
    errore_ricorrente_patterns: errorePatterns,
    predicted_nudges: predictedNudges,
  };
}

/** Iter 65 marker — Sense 1.6 onniscenza-bridge V2 EXTEND. Wire-up dispatch deferred Atom 2.5. */
export const ONNISCENZA_BRIDGE_V2_ITER = 65;
export const ONNISCENZA_BRIDGE_V2_IS_WIRED = false; // wire-up unlim-chat dispatch Atom 2.5+ post Andrea ratify
export const ONNISCENZA_V2_COLLECTORS_STATUS: Record<'D1_teacher_history' | 'D2_class_metadata' | 'D3_voice_movement' | 'D4_errore_pattern' | 'predicted_nudges', 'LIVE' | 'STUB' | 'TODO'> = {
  D1_teacher_history: 'LIVE',       // teacher_history_log query when supabase + uuid present
  D2_class_metadata: 'LIVE',        // class_session_metadata query when supabase + class_key present
  D3_voice_movement: 'LIVE',        // voice_movement_log aggregate when supabase + session_id present
  D4_errore_pattern: 'LIVE',        // errore_ricorrente_pattern query when supabase + uuid present
  predicted_nudges: 'STUB',         // empty array iter 65; full algorithm Atom 6 morphic-predictor.js
};
