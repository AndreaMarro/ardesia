/**
 * ADR-049 Sense 1.6 Atom 2 — Integration tests for aggregateOnniscenzaV2.
 *
 * Validates:
 *   - Gate `sense_1_6_enabled=false` → falls back to V1 baseline unchanged
 *   - Gate `sense_1_6_enabled=true`  → V2 path + 4 collectors invoked via Promise.all
 *   - Defensive collectors: missing supabase / missing identifier → graceful empty
 *   - Defensive collectors: Supabase error → graceful empty + warn log
 *   - predictNextNudgeStub → empty array iter 65 (full algo Atom 6)
 *
 * NO deploy prod. NO production Supabase wire. Mock client only.
 *
 * Test path location: tests/unit/ matches existing vitest config glob and the
 * sibling test file `onniscenza-classifier.test.js`. Task spec mentioned
 * `supabase/functions/_shared/onniscenza-bridge.test.ts` but vitest discovery
 * is restricted to `tests/**` — placed here so `npx vitest run` finds it.
 *
 * (c) Andrea Marro 2026-05-15 — ELAB Tutor — Sprint U iter 65 Atom 2.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  aggregateOnniscenzaV2,
  queryTeacherHistoryLog,
  queryClassSessionMetadata,
  queryVoiceMovementLog,
  queryErrorePattern,
  predictNextNudgeStub,
  ONNISCENZA_BRIDGE_V2_ITER,
  ONNISCENZA_BRIDGE_V2_IS_WIRED,
  ONNISCENZA_V2_COLLECTORS_STATUS,
} from '../../supabase/functions/_shared/onniscenza-bridge.ts';

// ────────────────────────────────────────────────────────────────────────────
// Mock Supabase chainable builder.
// Each call to .from(table) returns a fresh chain whose terminal `.limit()`
// resolves to { data, error }. Per-test, we override `tableResponses[table]`
// to control what each collector sees.
// ────────────────────────────────────────────────────────────────────────────

function makeMockSupabase(tableResponses) {
  const calls = [];
  return {
    _calls: calls,
    from(table) {
      const entry = { table, ops: [] };
      calls.push(entry);
      const chain = {
        select(cols) { entry.ops.push(['select', cols]); return chain; },
        eq(col, val) { entry.ops.push(['eq', col, val]); return chain; },
        order(col, opts) { entry.ops.push(['order', col, opts]); return chain; },
        limit(n) {
          entry.ops.push(['limit', n]);
          const resolver = tableResponses[table];
          if (!resolver) return Promise.resolve({ data: [], error: null });
          if (typeof resolver === 'function') return Promise.resolve(resolver(entry));
          return Promise.resolve(resolver);
        },
      };
      return chain;
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Gate behavior — sense_1_6_enabled flag.
// ────────────────────────────────────────────────────────────────────────────

describe('aggregateOnniscenzaV2 — gate sense_1_6_enabled', () => {
  it('returns V1 baseline shape when sense_1_6_enabled is missing', async () => {
    const snap = await aggregateOnniscenzaV2({ query: 'cos\'è un LED' });
    // V1 baseline fields present
    expect(snap).toHaveProperty('fetched_at');
    expect(snap).toHaveProperty('layers');
    expect(snap).toHaveProperty('fused');
    expect(snap).toHaveProperty('raw');
    // V2 fields ABSENT (no Sense 1.6 surfacing)
    expect(snap.teacher_history).toBeUndefined();
    expect(snap.class_metadata).toBeUndefined();
    expect(snap.voice_movement_summary).toBeUndefined();
    expect(snap.errore_ricorrente_patterns).toBeUndefined();
    expect(snap.predicted_nudges).toBeUndefined();
  });

  it('returns V1 baseline shape when sense_1_6_enabled is explicitly false', async () => {
    const snap = await aggregateOnniscenzaV2({ query: 'spiega', sense_1_6_enabled: false });
    expect(snap.teacher_history).toBeUndefined();
    expect(snap.class_metadata).toBeUndefined();
    expect(snap.predicted_nudges).toBeUndefined();
  });

  it('surfaces all V2 fields when sense_1_6_enabled=true (even with no inputs)', async () => {
    const snap = await aggregateOnniscenzaV2({ query: 'led', sense_1_6_enabled: true });
    // V2 fields present (may be empty arrays / null — that\'s the contract)
    expect(snap.teacher_history).toEqual([]);
    expect(snap.class_metadata).toBeNull();
    expect(snap.voice_movement_summary).toBeNull();
    expect(snap.errore_ricorrente_patterns).toEqual([]);
    expect(snap.predicted_nudges).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Collectors — defensive null-safe paths.
// ────────────────────────────────────────────────────────────────────────────

describe('queryTeacherHistoryLog — defensive', () => {
  it('returns [] when supabase is null/undefined', async () => {
    expect(await queryTeacherHistoryLog(null, 'uuid-123')).toEqual([]);
    expect(await queryTeacherHistoryLog(undefined, 'uuid-123')).toEqual([]);
  });

  it('returns [] when teacher_anon_uuid is missing', async () => {
    const supa = makeMockSupabase({});
    expect(await queryTeacherHistoryLog(supa, undefined)).toEqual([]);
    expect(await queryTeacherHistoryLog(supa, '')).toEqual([]);
    // No supabase call attempted
    expect(supa._calls.length).toBe(0);
  });

  it('returns [] gracefully when Supabase returns an error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = makeMockSupabase({
      teacher_history_log: { data: null, error: { message: 'permission denied' } },
    });
    const result = await queryTeacherHistoryLog(supa, 'uuid-abc');
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('returns rows when Supabase returns data array', async () => {
    const supa = makeMockSupabase({
      teacher_history_log: {
        data: [
          { id: 'r1', teacher_anon_uuid: 'uuid-abc', experiment_id: 'v1-cap6-esp1', started_at: '2026-05-15T10:00:00Z' },
          { id: 'r2', teacher_anon_uuid: 'uuid-abc', experiment_id: 'v1-cap6-esp2', started_at: '2026-05-14T10:00:00Z' },
        ],
        error: null,
      },
    });
    const result = await queryTeacherHistoryLog(supa, 'uuid-abc');
    expect(result).toHaveLength(2);
    expect(result[0].experiment_id).toBe('v1-cap6-esp1');
    // Verify chain ops
    const call = supa._calls[0];
    expect(call.table).toBe('teacher_history_log');
    expect(call.ops.find(o => o[0] === 'eq')).toEqual(['eq', 'teacher_anon_uuid', 'uuid-abc']);
    expect(call.ops.find(o => o[0] === 'limit')).toEqual(['limit', 10]);
  });

  it('returns [] when chain throws synchronously', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = {
      from() { throw new Error('connection refused'); },
    };
    const result = await queryTeacherHistoryLog(supa, 'uuid-abc');
    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('queryClassSessionMetadata — defensive', () => {
  it('returns null when supabase or class_key missing', async () => {
    expect(await queryClassSessionMetadata(null, 'class-1')).toBeNull();
    expect(await queryClassSessionMetadata(makeMockSupabase({}), '')).toBeNull();
  });

  it('returns null when no rows match', async () => {
    const supa = makeMockSupabase({
      class_session_metadata: { data: [], error: null },
    });
    expect(await queryClassSessionMetadata(supa, 'class-x')).toBeNull();
  });

  it('returns first row when match exists', async () => {
    const supa = makeMockSupabase({
      class_session_metadata: {
        data: [{ id: 'cm1', class_key: 'class-a', tempo_disponibile_min: 50, livello_autonomia: 'shared' }],
        error: null,
      },
    });
    const row = await queryClassSessionMetadata(supa, 'class-a');
    expect(row).not.toBeNull();
    expect(row.tempo_disponibile_min).toBe(50);
    expect(row.livello_autonomia).toBe('shared');
  });

  it('returns null gracefully on Supabase error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = makeMockSupabase({
      class_session_metadata: { data: null, error: { message: 'timeout' } },
    });
    expect(await queryClassSessionMetadata(supa, 'class-a')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('queryVoiceMovementLog — defensive + aggregation', () => {
  it('returns null when supabase or session_id missing', async () => {
    expect(await queryVoiceMovementLog(null, 'sess-1')).toBeNull();
    expect(await queryVoiceMovementLog(makeMockSupabase({}), undefined)).toBeNull();
  });

  it('returns empty summary when no events recorded for session', async () => {
    const supa = makeMockSupabase({
      voice_movement_log: { data: [], error: null },
    });
    const summary = await queryVoiceMovementLog(supa, 'sess-empty');
    expect(summary).toEqual({
      session_id: 'sess-empty',
      events_count: 0,
      event_types: [],
      movement_intensity_avg: null,
      zones_preferred: [],
      recent_events: [],
    });
  });

  it('aggregates event_types + zones + intensity avg correctly', async () => {
    const supa = makeMockSupabase({
      voice_movement_log: {
        data: [
          { voice_event_type: 'wake_word_triggered', movement_intensity: 0.4, zone_preferred: ['breadboard'], created_at: '2026-05-15T10:00:00Z', voice_payload: { conf: 0.9 } },
          { voice_event_type: 'stt_transcription', movement_intensity: 0.6, zone_preferred: ['breadboard', 'arduino'], created_at: '2026-05-15T10:01:00Z' },
          { voice_event_type: 'tts_played', movement_intensity: null, zone_preferred: ['led-area'], created_at: '2026-05-15T10:02:00Z' },
        ],
        error: null,
      },
    });
    const summary = await queryVoiceMovementLog(supa, 'sess-x');
    expect(summary.events_count).toBe(3);
    expect(summary.event_types.sort()).toEqual(['stt_transcription', 'tts_played', 'wake_word_triggered']);
    expect(summary.zones_preferred.sort()).toEqual(['arduino', 'breadboard', 'led-area']);
    // (0.4 + 0.6) / 2 = 0.5  — null intensity skipped
    expect(summary.movement_intensity_avg).toBeCloseTo(0.5, 5);
    expect(summary.recent_events.length).toBeLessThanOrEqual(10);
    expect(summary.recent_events[0].event_type).toBe('wake_word_triggered');
    expect(summary.recent_events[0].payload).toEqual({ conf: 0.9 });
  });

  it('returns null gracefully on Supabase error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = makeMockSupabase({
      voice_movement_log: { data: null, error: { message: 'db down' } },
    });
    expect(await queryVoiceMovementLog(supa, 'sess-fail')).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('queryErrorePattern — defensive', () => {
  it('returns [] when supabase or uuid missing', async () => {
    expect(await queryErrorePattern(null, 'uuid-1')).toEqual([]);
    expect(await queryErrorePattern(makeMockSupabase({}), undefined)).toEqual([]);
  });

  it('returns rows sorted by detected_count desc (Supabase-side order)', async () => {
    const supa = makeMockSupabase({
      errore_ricorrente_pattern: {
        data: [
          { id: 'e1', pattern_signature: 'led_polarity_dimenticata', detected_count: 12 },
          { id: 'e2', pattern_signature: 'r220_inversione_alim', detected_count: 7 },
        ],
        error: null,
      },
    });
    const rows = await queryErrorePattern(supa, 'uuid-z');
    expect(rows).toHaveLength(2);
    expect(rows[0].detected_count).toBe(12);
    // Verify limit = 5 per ADR-049 §4.1 top-N
    const call = supa._calls[0];
    expect(call.ops.find(o => o[0] === 'limit')).toEqual(['limit', 5]);
  });

  it('returns [] on Supabase error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = makeMockSupabase({
      errore_ricorrente_pattern: { data: null, error: { message: 'rls denied' } },
    });
    expect(await queryErrorePattern(supa, 'uuid-z')).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// predictNextNudgeStub — iter 65 STUB.
// ────────────────────────────────────────────────────────────────────────────

describe('predictNextNudgeStub — iter 65 STUB', () => {
  it('returns empty array regardless of inputs', () => {
    const out = predictNextNudgeStub({
      history: [{ teacher_anon_uuid: 'u', pattern_signature: 'x', detected_count: 1 }],
      currentExperiment: 'v1-cap6-esp1',
      classMeta: { class_key: 'c', tempo_disponibile_min: 30 },
      errorePatterns: [{ teacher_anon_uuid: 'u', pattern_signature: 'led_polarity', detected_count: 5 }],
    });
    expect(out).toEqual([]);
  });

  it('returns empty array when all signals are empty', () => {
    expect(predictNextNudgeStub({ history: [], classMeta: null, errorePatterns: [] })).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// V2 end-to-end — Promise.all parallel + V2 fields surfaced.
// ────────────────────────────────────────────────────────────────────────────

describe('aggregateOnniscenzaV2 — V2 path full flow', () => {
  it('invokes all 4 collectors when sense_1_6_enabled=true with full identifiers', async () => {
    const supa = makeMockSupabase({
      teacher_history_log: {
        data: [{ id: 'h1', teacher_anon_uuid: 'u-1', experiment_id: 'v1-cap6-esp1' }],
        error: null,
      },
      class_session_metadata: {
        data: [{ class_key: 'c-1', tempo_disponibile_min: 40, livello_autonomia: 'lead' }],
        error: null,
      },
      voice_movement_log: {
        data: [{ voice_event_type: 'wake_word_triggered', movement_intensity: 0.3, zone_preferred: ['breadboard'] }],
        error: null,
      },
      errore_ricorrente_pattern: {
        data: [{ teacher_anon_uuid: 'u-1', pattern_signature: 'led_polarity_dimenticata', detected_count: 4 }],
        error: null,
      },
    });

    const snap = await aggregateOnniscenzaV2({
      query: 'come faccio l\'esperimento LED',
      supabase: supa,
      teacher_anon_uuid: 'u-1',
      class_key: 'c-1',
      session_id: 'sess-1',
      experiment_id: 'v1-cap6-esp1',
      sense_1_6_enabled: true,
    });

    // V1 baseline fields preserved
    expect(snap.fetched_at).toBeDefined();
    expect(snap.layers).toBeDefined();
    expect(snap.fused).toBeDefined();

    // V2 collectors all returned populated data
    expect(snap.teacher_history).toHaveLength(1);
    expect(snap.teacher_history[0].experiment_id).toBe('v1-cap6-esp1');
    expect(snap.class_metadata).not.toBeNull();
    expect(snap.class_metadata.tempo_disponibile_min).toBe(40);
    expect(snap.voice_movement_summary).not.toBeNull();
    expect(snap.voice_movement_summary.events_count).toBe(1);
    expect(snap.errore_ricorrente_patterns).toHaveLength(1);
    expect(snap.predicted_nudges).toEqual([]); // STUB iter 65

    // 4 Sense 1.6 tables consulted (baseline aggregator may also hit
    // additional tables; count specifically the V2 ones)
    const tables = supa._calls.map(c => c.table);
    expect(tables).toContain('teacher_history_log');
    expect(tables).toContain('class_session_metadata');
    expect(tables).toContain('voice_movement_log');
    expect(tables).toContain('errore_ricorrente_pattern');
  });

  it('isolates collector failures: 1 error does not break the other 3', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const supa = makeMockSupabase({
      teacher_history_log: {
        data: [{ id: 'h1', teacher_anon_uuid: 'u-1' }],
        error: null,
      },
      class_session_metadata: { data: null, error: { message: 'simulated rls fail' } },
      voice_movement_log: {
        data: [{ voice_event_type: 'tts_played', movement_intensity: 0.2, zone_preferred: ['arduino'] }],
        error: null,
      },
      errore_ricorrente_pattern: {
        data: [{ teacher_anon_uuid: 'u-1', pattern_signature: 'x', detected_count: 1 }],
        error: null,
      },
    });

    const snap = await aggregateOnniscenzaV2({
      query: 'spiega',
      supabase: supa,
      teacher_anon_uuid: 'u-1',
      class_key: 'c-1',
      session_id: 'sess-1',
      sense_1_6_enabled: true,
    });

    expect(snap.teacher_history).toHaveLength(1);
    expect(snap.class_metadata).toBeNull(); // failed gracefully
    expect(snap.voice_movement_summary).not.toBeNull();
    expect(snap.errore_ricorrente_patterns).toHaveLength(1);
    expect(snap.predicted_nudges).toEqual([]);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('falls back gracefully when identifiers absent but gate is ON', async () => {
    const supa = makeMockSupabase({});
    const snap = await aggregateOnniscenzaV2({
      query: 'q',
      supabase: supa,
      sense_1_6_enabled: true,
      // no teacher_anon_uuid, class_key, session_id
    });

    expect(snap.teacher_history).toEqual([]);
    expect(snap.class_metadata).toBeNull();
    expect(snap.voice_movement_summary).toBeNull();
    expect(snap.errore_ricorrente_patterns).toEqual([]);
    expect(snap.predicted_nudges).toEqual([]);
    // V2 Sense 1.6 tables NOT consulted because identifiers gate at the
    // collector boundary (queryTeacherHistoryLog/queryClassSessionMetadata/
    // queryVoiceMovementLog/queryErrorePattern all return early when
    // identifier is falsy). V1 baseline may still query other tables
    // (rag_chunks/wiki/unlim_sessions) — that's preserved unchanged.
    const v2Tables = new Set(['teacher_history_log', 'class_session_metadata', 'voice_movement_log', 'errore_ricorrente_pattern']);
    const v2Calls = supa._calls.filter(c => v2Tables.has(c.table));
    expect(v2Calls.length).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Module-level invariants.
// ────────────────────────────────────────────────────────────────────────────

describe('onniscenza-bridge V2 module markers', () => {
  it('exports iter marker 65', () => {
    expect(ONNISCENZA_BRIDGE_V2_ITER).toBe(65);
  });

  it('flags V2 wire-up as NOT yet wired into dispatch (Atom 2.5 gate)', () => {
    expect(ONNISCENZA_BRIDGE_V2_IS_WIRED).toBe(false);
  });

  it('collectors status maps 4 LIVE + 1 STUB nudge predictor', () => {
    expect(ONNISCENZA_V2_COLLECTORS_STATUS.D1_teacher_history).toBe('LIVE');
    expect(ONNISCENZA_V2_COLLECTORS_STATUS.D2_class_metadata).toBe('LIVE');
    expect(ONNISCENZA_V2_COLLECTORS_STATUS.D3_voice_movement).toBe('LIVE');
    expect(ONNISCENZA_V2_COLLECTORS_STATUS.D4_errore_pattern).toBe('LIVE');
    expect(ONNISCENZA_V2_COLLECTORS_STATUS.predicted_nudges).toBe('STUB');
  });
});
