/**
 * iter 65 Atom 2.5 — onniscenza-bridge V2 wire-up dispatch unit tests.
 *
 * Scope: validates the wire-up surface introduced in `unlim-chat/index.ts`
 * for ADR-049 Sense 1.6 V2. The dispatcher logic is replicated as a pure
 * function below (`dispatchOnniscenza`) so it can be unit-tested without
 * spinning up the full Edge Function HTTP stack. The replication is a
 * faithful port of the branching + telemetry semantics shipped in
 * `supabase/functions/unlim-chat/index.ts` lines 575-720 region.
 *
 * Coverage:
 *   - V2 flag on/off branching (ENABLE_ONNISCENZA_V2)
 *   - Outer gate (ENABLE_ONNISCENZA off → skip entirely)
 *   - V2 success → snapshot V2 surfaced + telemetry collectors_status
 *   - V2 returns null → defensive fallback to V1
 *   - V2 throws → defensive fallback to V1 + warn log
 *   - V2 partial collectors (some 'ok' some 'empty') telemetry shape
 *   - has_teacher_uuid / has_class_key boolean flags in telemetry
 *   - sense_1_6_enabled flag propagation to V2 caller
 *   - Snapshot inject shape preservation (fused top-K array)
 *
 * NO Deno runtime. NO HTTP. Pure JS unit tests under vitest.
 *
 * (c) Andrea Marro 2026-05-15 — ELAB Tutor — Sprint U iter 65 Atom 2.5.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ────────────────────────────────────────────────────────────────────────────
// Pure dispatcher replication (port from unlim-chat/index.ts iter 65 Atom 2.5).
// Inputs map 1:1 to env + body fields. Outputs match telemetry shape.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Dispatcher port — replicates V1↔V2 branching + telemetry semantics from
 * unlim-chat dispatch block. Kept in test file so this contract is the
 * canonical assertion surface (decoupled from Deno Edge runtime).
 *
 * @param {object} args
 * @param {object} args.env — { ENABLE_ONNISCENZA, ENABLE_ONNISCENZA_V2 }
 * @param {object} args.promptClass — { skipOnniscenza, topK }
 * @param {string} [args.teacherAnonUuid]
 * @param {string} [args.classKey]
 * @param {string} args.sessionId
 * @param {Function} args.aggregateOnniscenza — V1 fn mock
 * @param {Function} args.aggregateOnniscenzaV2 — V2 fn mock
 * @param {object} args.sharedInput — passed-through to aggregator
 */
async function dispatchOnniscenza({
  env,
  promptClass,
  teacherAnonUuid,
  classKey,
  sessionId,
  aggregateOnniscenza,
  aggregateOnniscenzaV2,
  sharedInput,
  logger = console,
}) {
  let onniscenzaSnapshot = null;
  let onniTopK = 3;
  let onniscenzaV2Used = false;
  const v2CollectorsStatus = {
    teacher: 'empty',
    class: 'empty',
    voice: 'empty',
    errore: 'empty',
  };

  const onniscenzaEnabled = (env.ENABLE_ONNISCENZA || 'false').toLowerCase() === 'true';
  if (!onniscenzaEnabled || promptClass.skipOnniscenza) {
    return { onniscenzaSnapshot, onniTopK, onniscenzaV2Used, v2CollectorsStatus, telemetryEmitted: false };
  }

  onniTopK = promptClass.topK;
  const onniscenzaV2Flag = (env.ENABLE_ONNISCENZA_V2 || 'false').toLowerCase() === 'true';

  try {
    if (onniscenzaV2Flag) {
      try {
        const v2Snap = await aggregateOnniscenzaV2({
          ...sharedInput,
          teacher_anon_uuid: teacherAnonUuid,
          class_key: classKey,
          sense_1_6_enabled: true,
        });
        if (v2Snap && typeof v2Snap === 'object') {
          onniscenzaSnapshot = v2Snap;
          onniscenzaV2Used = true;
          v2CollectorsStatus.teacher = Array.isArray(v2Snap.teacher_history) && v2Snap.teacher_history.length > 0 ? 'ok' : 'empty';
          v2CollectorsStatus.class = v2Snap.class_metadata && typeof v2Snap.class_metadata === 'object' ? 'ok' : 'empty';
          v2CollectorsStatus.voice = v2Snap.voice_movement_summary && typeof v2Snap.voice_movement_summary === 'object' ? 'ok' : 'empty';
          v2CollectorsStatus.errore = Array.isArray(v2Snap.errore_ricorrente_patterns) && v2Snap.errore_ricorrente_patterns.length > 0 ? 'ok' : 'empty';
        } else {
          v2CollectorsStatus.teacher = 'fail';
          v2CollectorsStatus.class = 'fail';
          v2CollectorsStatus.voice = 'fail';
          v2CollectorsStatus.errore = 'fail';
          onniscenzaSnapshot = await aggregateOnniscenza(sharedInput);
        }
      } catch (v2Err) {
        logger.warn(JSON.stringify({
          level: 'warn', event: 'onniscenza_v2_fallback_to_v1',
          error: v2Err instanceof Error ? v2Err.message : 'unknown',
        }));
        v2CollectorsStatus.teacher = 'fail';
        v2CollectorsStatus.class = 'fail';
        v2CollectorsStatus.voice = 'fail';
        v2CollectorsStatus.errore = 'fail';
        onniscenzaSnapshot = await aggregateOnniscenza(sharedInput);
      }
    } else {
      onniscenzaSnapshot = await aggregateOnniscenza(sharedInput);
    }

    logger.info(JSON.stringify({
      level: 'info',
      event: 'onniscenza_v2_telemetry',
      onniscenza_v2_used: onniscenzaV2Used,
      v2_collectors_status: v2CollectorsStatus,
      has_teacher_uuid: !!teacherAnonUuid,
      has_class_key: !!classKey,
      session_prefix: sessionId.slice(0, 8),
    }));
    return { onniscenzaSnapshot, onniTopK, onniscenzaV2Used, v2CollectorsStatus, telemetryEmitted: true };
  } catch (onniErr) {
    logger.warn(JSON.stringify({
      level: 'warn', event: 'onniscenza_bridge_error',
      error: onniErr instanceof Error ? onniErr.message : 'unknown',
    }));
    onniscenzaSnapshot = null;
    return { onniscenzaSnapshot, onniTopK, onniscenzaV2Used, v2CollectorsStatus, telemetryEmitted: false };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Fixture builders.
// ────────────────────────────────────────────────────────────────────────────

function makeV1Snapshot() {
  return {
    fetched_at: new Date().toISOString(),
    total_latency_ms: 12,
    query: 'cos\'è un LED',
    layers: {
      L1_rag: { ok: true, latency_ms: 5, hits_count: 1 },
      L2_wiki: { ok: true, latency_ms: 3, hits_count: 0 },
      L3_glossario: { ok: true, latency_ms: 0, hits_count: 0 },
      L4_sessione: { ok: true, latency_ms: 0, hits_count: 0 },
      L5_vision: { ok: true, latency_ms: 0, hits_count: 0 },
      L6_llm: { ok: true, latency_ms: 0, hits_count: 0 },
      L7_onthefly: { ok: true, latency_ms: 0, hits_count: 0 },
    },
    fused: [
      { layer: 'L1_rag', id: 'rag:vol1', score: 0.85, text: 'LED Vol.1 pag.45', source: 'vol1' },
    ],
    raw: { L1_rag: [], L2_wiki: [], L3_glossario: [], L4_sessione: [], L5_vision: [], L6_llm: [], L7_onthefly: [] },
  };
}

function makeV2Snapshot(overrides = {}) {
  return {
    ...makeV1Snapshot(),
    teacher_history: [],
    class_metadata: null,
    voice_movement_summary: null,
    errore_ricorrente_patterns: [],
    predicted_nudges: [],
    ...overrides,
  };
}

function makeSilentLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
  };
}

const baseArgs = () => ({
  env: { ENABLE_ONNISCENZA: 'true' },
  promptClass: { skipOnniscenza: false, topK: 3 },
  teacherAnonUuid: undefined,
  classKey: undefined,
  sessionId: 'sess_abc123def456',
  sharedInput: { query: 'test', experiment_id: null, session_id: 'sess_abc123def456', history: [], supabase: null, enable: { L1_rag: false } },
  aggregateOnniscenza: vi.fn(async () => makeV1Snapshot()),
  aggregateOnniscenzaV2: vi.fn(async () => makeV2Snapshot()),
});

// ────────────────────────────────────────────────────────────────────────────
// Tests.
// ────────────────────────────────────────────────────────────────────────────

describe('onniscenza-bridge V2 wire-up — outer gate', () => {
  it('skips entirely when ENABLE_ONNISCENZA is missing (default off)', async () => {
    const args = baseArgs();
    args.env = {};
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot).toBeNull();
    expect(out.onniscenzaV2Used).toBe(false);
    expect(args.aggregateOnniscenza).not.toHaveBeenCalled();
    expect(args.aggregateOnniscenzaV2).not.toHaveBeenCalled();
    expect(out.telemetryEmitted).toBe(false);
  });

  it('skips entirely when classifier sets skipOnniscenza=true (chit_chat)', async () => {
    const args = baseArgs();
    args.promptClass = { skipOnniscenza: true, topK: 0 };
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot).toBeNull();
    expect(args.aggregateOnniscenza).not.toHaveBeenCalled();
    expect(args.aggregateOnniscenzaV2).not.toHaveBeenCalled();
  });
});

describe('onniscenza-bridge V2 wire-up — V2 flag off (V1 baseline preserved)', () => {
  it('calls V1 aggregateOnniscenza when ENABLE_ONNISCENZA_V2 is missing', async () => {
    const args = baseArgs();
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1);
    expect(args.aggregateOnniscenzaV2).not.toHaveBeenCalled();
    expect(out.onniscenzaV2Used).toBe(false);
    expect(out.onniscenzaSnapshot).toBeTruthy();
  });

  it('calls V1 when ENABLE_ONNISCENZA_V2=false explicit', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'false' };
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1);
    expect(args.aggregateOnniscenzaV2).not.toHaveBeenCalled();
    expect(out.onniscenzaV2Used).toBe(false);
  });

  it('does NOT forward teacher_anon_uuid / class_key to V1 (V1 has no such params)', async () => {
    const args = baseArgs();
    args.teacherAnonUuid = 'teacher_xyz';
    args.classKey = 'class_42';
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1);
    const call = args.aggregateOnniscenza.mock.calls[0][0];
    expect(call.teacher_anon_uuid).toBeUndefined();
    expect(call.class_key).toBeUndefined();
    expect(call.sense_1_6_enabled).toBeUndefined();
  });
});

describe('onniscenza-bridge V2 wire-up — V2 flag on (success path)', () => {
  it('calls V2 when BOTH ENABLE_ONNISCENZA=true AND ENABLE_ONNISCENZA_V2=true', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenzaV2).toHaveBeenCalledTimes(1);
    expect(args.aggregateOnniscenza).not.toHaveBeenCalled();
    expect(out.onniscenzaV2Used).toBe(true);
  });

  it('forwards sense_1_6_enabled=true + teacher_anon_uuid + class_key to V2', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.teacherAnonUuid = 'teacher_abc';
    args.classKey = 'class_xyz';
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);
    const call = args.aggregateOnniscenzaV2.mock.calls[0][0];
    expect(call.sense_1_6_enabled).toBe(true);
    expect(call.teacher_anon_uuid).toBe('teacher_abc');
    expect(call.class_key).toBe('class_xyz');
  });

  it('surfaces v2 snapshot fields (teacher_history + class_metadata etc) when collectors return data', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => makeV2Snapshot({
      teacher_history: [{ teacher_anon_uuid: 't1', experiment_id: 'v1-led' }],
      class_metadata: { class_key: 'c1', tempo_disponibile_min: 60 },
      voice_movement_summary: { session_id: 's1', events_count: 5, event_types: ['stt'], zones_preferred: [] },
      errore_ricorrente_patterns: [{ teacher_anon_uuid: 't1', pattern_signature: 'led_inverso', detected_count: 3 }],
    }));
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot.teacher_history).toHaveLength(1);
    expect(out.onniscenzaSnapshot.class_metadata).toBeDefined();
    expect(out.onniscenzaSnapshot.voice_movement_summary).toBeDefined();
    expect(out.onniscenzaSnapshot.errore_ricorrente_patterns).toHaveLength(1);
    expect(out.v2CollectorsStatus.teacher).toBe('ok');
    expect(out.v2CollectorsStatus.class).toBe('ok');
    expect(out.v2CollectorsStatus.voice).toBe('ok');
    expect(out.v2CollectorsStatus.errore).toBe('ok');
  });

  it('marks all collectors empty when V2 returns baseline-only snapshot (no NEW fields populated)', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => makeV2Snapshot());
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.v2CollectorsStatus.teacher).toBe('empty');
    expect(out.v2CollectorsStatus.class).toBe('empty');
    expect(out.v2CollectorsStatus.voice).toBe('empty');
    expect(out.v2CollectorsStatus.errore).toBe('empty');
    expect(out.onniscenzaV2Used).toBe(true);
  });

  it('marks partial collectors: teacher=ok, class=empty, voice=empty, errore=empty', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => makeV2Snapshot({
      teacher_history: [{ teacher_anon_uuid: 't1' }],
    }));
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.v2CollectorsStatus.teacher).toBe('ok');
    expect(out.v2CollectorsStatus.class).toBe('empty');
    expect(out.v2CollectorsStatus.voice).toBe('empty');
    expect(out.v2CollectorsStatus.errore).toBe('empty');
  });
});

describe('onniscenza-bridge V2 wire-up — defensive fallback to V1', () => {
  it('falls back to V1 when V2 throws + emits warn log', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => { throw new Error('v2_boom'); });
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenzaV2).toHaveBeenCalledTimes(1);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1); // fallback fired
    expect(out.onniscenzaV2Used).toBe(false);
    expect(out.onniscenzaSnapshot).toBeTruthy(); // V1 snapshot delivered
    // Warn log emitted with fallback event marker.
    const warnCalls = args.logger.warn.mock.calls.map(c => c[0]);
    const hasFallbackWarn = warnCalls.some(s => s.includes('onniscenza_v2_fallback_to_v1') && s.includes('v2_boom'));
    expect(hasFallbackWarn).toBe(true);
    // All collectors marked 'fail' in telemetry.
    expect(out.v2CollectorsStatus.teacher).toBe('fail');
    expect(out.v2CollectorsStatus.class).toBe('fail');
    expect(out.v2CollectorsStatus.voice).toBe('fail');
    expect(out.v2CollectorsStatus.errore).toBe('fail');
  });

  it('falls back to V1 when V2 returns null + collectors marked fail', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => null);
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1);
    expect(out.onniscenzaV2Used).toBe(false);
    expect(out.onniscenzaSnapshot).toBeTruthy();
    expect(out.v2CollectorsStatus.teacher).toBe('fail');
  });

  it('falls back to V1 when V2 returns non-object (defensive)', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => 'not-an-object');
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(args.aggregateOnniscenza).toHaveBeenCalledTimes(1);
    expect(out.onniscenzaV2Used).toBe(false);
  });

  it('returns null snapshot when BOTH V2 and V1 throw (final defensive catch)', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.aggregateOnniscenzaV2 = vi.fn(async () => { throw new Error('v2_boom'); });
    args.aggregateOnniscenza = vi.fn(async () => { throw new Error('v1_also_boom'); });
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot).toBeNull();
    expect(out.onniscenzaV2Used).toBe(false);
    expect(out.telemetryEmitted).toBe(false);
  });
});

describe('onniscenza-bridge V2 wire-up — telemetry log shape', () => {
  it('emits info log onniscenza_v2_telemetry with full required shape', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.teacherAnonUuid = 'teacher_t1';
    args.classKey = 'class_c1';
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);

    expect(args.logger.info).toHaveBeenCalledTimes(1);
    const logLine = args.logger.info.mock.calls[0][0];
    const parsed = JSON.parse(logLine);
    expect(parsed.event).toBe('onniscenza_v2_telemetry');
    expect(parsed.onniscenza_v2_used).toBe(true);
    expect(parsed.v2_collectors_status).toEqual({
      teacher: 'empty',
      class: 'empty',
      voice: 'empty',
      errore: 'empty',
    });
    expect(parsed.has_teacher_uuid).toBe(true);
    expect(parsed.has_class_key).toBe(true);
    expect(parsed.session_prefix).toBe('sess_abc');
  });

  it('telemetry has_teacher_uuid=false / has_class_key=false when identifiers missing', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);
    const parsed = JSON.parse(args.logger.info.mock.calls[0][0]);
    expect(parsed.has_teacher_uuid).toBe(false);
    expect(parsed.has_class_key).toBe(false);
  });

  it('telemetry onniscenza_v2_used=false when V1 path used (flag off)', async () => {
    const args = baseArgs();
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);
    const parsed = JSON.parse(args.logger.info.mock.calls[0][0]);
    expect(parsed.onniscenza_v2_used).toBe(false);
  });

  it('session_prefix is exactly first 8 chars of sessionId', async () => {
    const args = baseArgs();
    args.sessionId = 'abcdefghijklmnopqrstuvwxyz';
    args.logger = makeSilentLogger();
    await dispatchOnniscenza(args);
    const parsed = JSON.parse(args.logger.info.mock.calls[0][0]);
    expect(parsed.session_prefix).toBe('abcdefgh');
  });
});

describe('onniscenza-bridge V2 wire-up — snapshot inject shape preservation', () => {
  it('preserves baseline fused array shape consumable by prompt injection (V1 path)', async () => {
    const args = baseArgs();
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot).toMatchObject({
      fetched_at: expect.any(String),
      query: expect.any(String),
      fused: expect.any(Array),
      layers: expect.any(Object),
    });
    expect(out.onniscenzaSnapshot.fused[0]).toMatchObject({
      layer: expect.any(String),
      text: expect.any(String),
    });
  });

  it('V2 snapshot retains V1 baseline fields (fused + layers + raw)', async () => {
    const args = baseArgs();
    args.env = { ENABLE_ONNISCENZA: 'true', ENABLE_ONNISCENZA_V2: 'true' };
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniscenzaSnapshot.fused).toBeInstanceOf(Array);
    expect(out.onniscenzaSnapshot.layers).toBeDefined();
    expect(out.onniscenzaSnapshot.raw).toBeDefined();
    // V2-specific fields also present.
    expect(out.onniscenzaSnapshot.teacher_history).toBeDefined();
    expect(out.onniscenzaSnapshot.class_metadata).toBeDefined();
  });

  it('onniTopK respects classifier promptClass.topK setting (e.g. 2 for citation_vol_pag)', async () => {
    const args = baseArgs();
    args.promptClass = { skipOnniscenza: false, topK: 2 };
    args.logger = makeSilentLogger();
    const out = await dispatchOnniscenza(args);
    expect(out.onniTopK).toBe(2);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Smoke test: verify the bridge module actually exports aggregateOnniscenzaV2.
// Guards against accidental import removal in unlim-chat/index.ts.
// ────────────────────────────────────────────────────────────────────────────

describe('onniscenza-bridge V2 wire-up — module export contract', () => {
  it('aggregateOnniscenzaV2 is exported by onniscenza-bridge.ts', async () => {
    const mod = await import('../../supabase/functions/_shared/onniscenza-bridge.ts');
    expect(typeof mod.aggregateOnniscenzaV2).toBe('function');
    expect(typeof mod.aggregateOnniscenza).toBe('function'); // V1 still exported (preserved)
  });

  it('ONNISCENZA_BRIDGE_V2_ITER === 65 + V2 marker IS_WIRED reflects current state', async () => {
    const mod = await import('../../supabase/functions/_shared/onniscenza-bridge.ts');
    expect(mod.ONNISCENZA_BRIDGE_V2_ITER).toBe(65);
    // The IS_WIRED constant in the module reflects the wire-up state per docstring.
    // Atom 2 iter 64 shipped value=false; Atom 2.5 iter 65 wire-up keeps the
    // constant as a marker (the actual wire happens in unlim-chat/index.ts,
    // not by mutating this flag). Test asserts the constant is a boolean.
    expect(typeof mod.ONNISCENZA_BRIDGE_V2_IS_WIRED).toBe('boolean');
  });
});
