/**
 * useGalileoChat-awareness-wire.test.jsx — UNLIM Slice 1C
 *
 * Contract-level tests for client-side wire-up of `boardSnapshot` +
 * `previousBoardSnapshot` collection. Slice 1B shipped the server-side wire
 * (Edge Function accepts the snapshots in POST body). Slice 1C wires the
 * client (`useGalileoChat` hook + `sendChat` service) to collect and forward
 * them per turn.
 *
 * Contract being tested (NOT implementation internals):
 *   1. `buildBoardSnapshot()` is exported from useGalileoChat.js as a pure,
 *      defensive helper returning a BoardSnapshot-shaped object (matches the
 *      `BoardSnapshot` interface in supabase/functions/_shared/awareness-flags.ts).
 *   2. `sendChat()` accepts `boardSnapshot` + `previousBoardSnapshot` options
 *      and forwards them in the fetch body of the unlim-chat call.
 *   3. Cross-turn state preservation: previousBoardSnapshot of turn N is the
 *      snapshot collected on turn N-1.
 *
 * Reference shape (BoardSnapshot from awareness-flags.ts §27-39):
 *   { circuit?, drawingHash?, experimentId?, step?, compileStatus?, compileMessage? }
 *
 * Style: aligned with useGalileoChatFastPath.test.jsx (relative imports,
 * vi.mock dependencies, installApi for window.__ELAB_API). Deterministic
 * (no flaky timers). No new npm deps.
 *
 * Spec: docs/superpowers/specs/2026-05-21-unlim-context-engineering-overhaul-design.md §7.2
 * (c) Andrea Marro 2026-05-25 — ELAB Tutor
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ─── Module mocks (mirror useGalileoChatFastPath.test.jsx) ──────────────────
vi.mock('../../../src/services/api', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../../../src/utils/contentFilter', () => ({
  validateMessage: vi.fn(() => ({ allowed: true })),
  sanitizeOutput: vi.fn((text) => text),
}));

vi.mock('../../../src/services/lessonPrepService', () => ({
  isLessonPrepCommand: vi.fn(() => false),
  getLessonSummary: vi.fn(),
  prepareLesson: vi.fn(),
}));

vi.mock('../../../src/services/unlimContextCollector', () => ({
  collectFullContext: vi.fn(() => ({})),
  getLatestVisualSnapshotImage: vi.fn(() => null),
}));

vi.mock('../../../src/components/lavagna/intentsDispatcher', () => ({
  executeServerIntents: vi.fn(() => []),
}));

vi.mock('../../../src/services/unlimLatencyLog', () => ({
  logLatency: vi.fn(),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import useGalileoChat, { __test__ } from '../../../src/components/lavagna/useGalileoChat.js';
import { sendChat } from '../../../src/services/api';
// `buildBoardSnapshot` is added by the Slice 1C implementer. The repo
// convention (see existing __test__ export on line 898 of useGalileoChat.js)
// is to expose file-scope helpers via the `__test__` object rather than
// polluting the module's public surface. We follow that convention here.
// If the helper is missing (Slice 1C not yet landed), __test__.buildBoardSnapshot
// is undefined and the contract tests below fail explicitly — surfacing the
// gap rather than silently passing.
const { buildBoardSnapshot } = __test__ || {};

// ─── Helpers ────────────────────────────────────────────────────────────────
function installApi(overrides = {}) {
  window.__ELAB_API = {
    getActiveExperiment: vi.fn(() => null),
    getCurrentExperiment: vi.fn(() => null),
    captureScreenshot: vi.fn(() => null),
    getCircuitDescription: vi.fn(() => ''),
    unlim: { clearHighlights: vi.fn() },
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PART A — buildBoardSnapshot pure-function contract
// ════════════════════════════════════════════════════════════════════════════
describe('buildBoardSnapshot — pure helper contract', () => {
  it('is exported as a function from useGalileoChat module', () => {
    expect(typeof buildBoardSnapshot).toBe('function');
  });

  it('returns a BoardSnapshot-shaped object on all-null inputs (defensive)', () => {
    const snap = buildBoardSnapshot(null, null, null, null, null, null);
    expect(snap).toBeTruthy();
    expect(typeof snap).toBe('object');
    // BoardSnapshot interface fields (all optional, all nullable).
    // We assert the field NAMES are present (value may be null/undefined/[]).
    const keys = Object.keys(snap);
    // Contract: at minimum these keys exist on the returned shape.
    // Implementer may include all or a subset of optional fields, but the
    // shape must be serialisable as a BoardSnapshot (no garbage).
    expect(keys.length).toBeGreaterThan(0);
    // No throw, no exception escapes — that's the defensive guarantee.
  });

  it('extracts components + connections from circuitState.structured', () => {
    const circuitState = {
      structured: {
        components: [{ id: 'led1', type: 'led' }, { id: 'r1', type: 'resistor' }],
        connections: [{ from: 'led1:anode', to: 'nano:D13' }],
      },
    };
    const snap = buildBoardSnapshot(circuitState, null, null, null, null, null);
    expect(snap.circuit).toBeTruthy();
    // Contract: the structured circuit data flows through to snap.circuit.
    // Implementer may pass through verbatim or normalise — either is fine
    // as long as components + connections are reachable.
    const compIds = (snap.circuit.components || []).map(c => c.id);
    expect(compIds).toContain('led1');
    expect(compIds).toContain('r1');
    const conns = snap.circuit.connections || [];
    expect(conns.length).toBeGreaterThan(0);
  });

  it('handles circuitState with only .text (no structured) without throwing', () => {
    const circuitState = { text: 'LED collegato a pin 13' };
    // Must not throw. snap.circuit may be null OR an empty-shape object —
    // either is acceptable per the defensive contract. The KEY assertion is
    // that no exception escapes and snap is well-formed.
    let snap;
    expect(() => {
      snap = buildBoardSnapshot(circuitState, null, null, null, null, null);
    }).not.toThrow();
    expect(snap).toBeTruthy();
    // If circuit is present, components/connections must be arrays (not undefined)
    if (snap.circuit) {
      const comps = snap.circuit.components;
      const conns = snap.circuit.connections;
      // Either both are arrays, or circuit is itself a sparse object — both OK.
      // We only forbid the case where they exist but are non-arrays.
      if (comps !== undefined) expect(Array.isArray(comps)).toBe(true);
      if (conns !== undefined) expect(Array.isArray(conns)).toBe(true);
    }
  });

  it('passes experimentId, step, compileStatus, compileMessage, drawingHash through to snapshot fields', () => {
    const snap = buildBoardSnapshot(
      null,
      'v1-cap6-esp1',          // experimentId
      3,                        // step
      'error',                  // compileStatus
      'expected ; before }',    // compileMessage
      'hash-abc123',            // drawingHash
    );
    expect(snap.experimentId).toBe('v1-cap6-esp1');
    expect(snap.step).toBe(3);
    expect(snap.compileStatus).toBe('error');
    expect(snap.compileMessage).toBe('expected ; before }');
    expect(snap.drawingHash).toBe('hash-abc123');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PART B — sendChat wire-up contract
//
// Note: we mock `../../../src/services/api` at the top of this file so the
// hook receives a stubbed sendChat. But for PART B we want to verify the
// REAL sendChat forwards boardSnapshot in the fetch body. To do that we
// load the real module via `vi.importActual` inside the test.
// ════════════════════════════════════════════════════════════════════════════
describe('sendChat — boardSnapshot forwarding contract', () => {
  let realSendChat;
  let fetchSpy;

  /**
   * Mock the fetch fallback chain so the nanobot/edge endpoint is the one
   * that succeeds. sendChat() tries (in order):
   *   1. localhost:8000/health → /chat  (tryLocalServer — Ollama dev path)
   *   2. nanobot edge (/unlim-chat or /tutor-chat)  (the path we test)
   *   3. n8n webhook
   * We force #1 to fail (503 on /health) so the call falls through to #2,
   * where the Slice 1C wire-up lives (api.js tryNanobot payload).
   */
  function makeFetchMock() {
    return vi.fn((url, opts) => {
      const u = String(url || '');
      // Local server health check → fail so tryLocalServer bails.
      if (u.includes('localhost:8000')) {
        return Promise.resolve({
          ok: false,
          status: 503,
          json: async () => ({}),
          text: async () => '',
        });
      }
      // Everything else (nanobot edge, webhook, etc.) succeeds.
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, response: 'test response from mock' }),
        text: async () => '{"success":true,"response":"test"}',
      });
    });
  }

  /**
   * Locate the nanobot/edge call (the one carrying the Slice 1C payload).
   * Exclude localhost (local Ollama server) — only matches the real cloud
   * endpoint where tryNanobot constructs the payload with boardSnapshot.
   */
  function findNanobotCall() {
    return fetchSpy.mock.calls.find(call => {
      const url = String(call[0] || '');
      if (url.includes('localhost')) return false;
      return url.includes('unlim-chat') || url.includes('/tutor-chat') || url.includes('/chat');
    });
  }

  beforeEach(async () => {
    // Load the REAL sendChat (the top-level vi.mock returns a stub; we need
    // the actual impl for these wire-up assertions).
    const real = await vi.importActual('../../../src/services/api');
    realSendChat = real.sendChat;

    fetchSpy = makeFetchMock();
    global.fetch = fetchSpy;
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('includes boardSnapshot in the unlim-chat fetch body when provided', async () => {
    const boardSnapshot = {
      circuit: { components: [{ id: 'led1', type: 'led' }], connections: [] },
      experimentId: 'v1-cap6-esp1',
      step: 1,
      drawingHash: null,
      compileStatus: null,
      compileMessage: null,
    };
    await realSendChat('test message', [], {
      boardSnapshot,
      previousBoardSnapshot: null,
    });

    const nanobotCall = findNanobotCall();
    expect(nanobotCall).toBeTruthy();
    const body = JSON.parse(nanobotCall[1].body);
    expect(body).toHaveProperty('boardSnapshot');
    expect(body.boardSnapshot).toEqual(boardSnapshot);
  });

  it('includes previousBoardSnapshot in the unlim-chat fetch body when provided', async () => {
    const previousBoardSnapshot = {
      circuit: { components: [], connections: [] },
      experimentId: 'v1-cap6-esp1',
      step: 0,
      drawingHash: null,
      compileStatus: null,
      compileMessage: null,
    };
    await realSendChat('next turn', [], {
      boardSnapshot: { circuit: null },
      previousBoardSnapshot,
    });

    const nanobotCall = findNanobotCall();
    expect(nanobotCall).toBeTruthy();
    const body = JSON.parse(nanobotCall[1].body);
    expect(body).toHaveProperty('previousBoardSnapshot');
    expect(body.previousBoardSnapshot).toEqual(previousBoardSnapshot);
  });

  it('includes UNLIM intent flags and screenSnapshot in the unlim-chat fetch body when provided', async () => {
    const flags = {
      triggered_flags: ['WANTS_SCREEN_VIEW', 'WANTS_EXPLAIN'],
      flags: { WANTS_SCREEN_VIEW: true, WANTS_EXPLAIN: true },
    };
    const screenSnapshot = {
      circuit: { components: [{ id: 'led1', type: 'led' }] },
      arduino: { code: 'void setup() {}' },
      step: { current: 1, total: 3 },
    };

    await realSendChat('guarda e spiega', [], {
      flags,
      screenSnapshot,
    });

    const nanobotCall = findNanobotCall();
    expect(nanobotCall).toBeTruthy();
    const body = JSON.parse(nanobotCall[1].body);
    expect(body).toHaveProperty('flags');
    expect(body.flags.triggered_flags).toEqual(['WANTS_SCREEN_VIEW', 'WANTS_EXPLAIN']);
    expect(body).toHaveProperty('screenSnapshot');
    expect(body.screenSnapshot).toEqual(screenSnapshot);
  });

  it('omits boardSnapshot/previousBoardSnapshot from body when both options are absent (legacy callers unchanged)', async () => {
    // Legacy callers pre-Slice-1C call sendChat without the new options.
    // The contract here: the body either OMITS the keys entirely, OR sets
    // them to null. EITHER is acceptable per Slice 1B server tolerance
    // (the Edge Function defensively handles missing/null snapshots — see
    // supabase/functions/_shared/awareness-flags.ts emptyFlags() default).
    //
    // We assert "absent OR null" rather than strictly omitted, so the
    // implementer has freedom in defaults without flaking the test.
    await realSendChat('plain legacy message', [], {
      socraticMode: true,
      experimentId: 'v1-cap6-esp1',
    });

    const nanobotCall = findNanobotCall();
    expect(nanobotCall).toBeTruthy();
    const body = JSON.parse(nanobotCall[1].body);
    // Either the keys are missing, or present-but-null. Both honour the
    // backward-compat contract. Reject only the case where a non-null value
    // sneaks in for a legacy caller.
    if ('boardSnapshot' in body) {
      expect(body.boardSnapshot).toBeNull();
    }
    if ('previousBoardSnapshot' in body) {
      expect(body.previousBoardSnapshot).toBeNull();
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// PART C — Integration: hook updates previousBoardSnapshotRef across turns
// ════════════════════════════════════════════════════════════════════════════
describe('useGalileoChat hook — cross-turn previousBoardSnapshot preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    installApi();
    sendChat.mockResolvedValue({
      success: true,
      response: 'mocked AI response',
      source: 'test',
    });
  });

  afterEach(() => {
    delete window.__ELAB_API;
  });

  it('on the SECOND send, previousBoardSnapshot equals the boardSnapshot from the FIRST send', async () => {
    const { result } = renderHook(() => useGalileoChat());

    // ── Turn 1 ──
    await act(async () => {
      await result.current.handleSend('spiegami la prima domanda sul LED');
    });
    await waitFor(() => expect(sendChat).toHaveBeenCalledTimes(1));

    const firstCall = sendChat.mock.calls[0];
    const firstOptions = firstCall[2] || {};
    // First turn's previousBoardSnapshot should be null (no prior turn).
    // If the contract is "undefined if missing", accept that too.
    if ('previousBoardSnapshot' in firstOptions) {
      expect(firstOptions.previousBoardSnapshot).toBeNull();
    }
    // First turn MUST have a boardSnapshot field (the wire-up's whole point).
    expect(firstOptions).toHaveProperty('boardSnapshot');
    expect(firstOptions).toHaveProperty('flags');
    expect(firstOptions.flags.triggered_flags).toContain('WANTS_EXPLAIN');
    expect(firstOptions).toHaveProperty('screenSnapshot');
    const firstBoardSnapshot = firstOptions.boardSnapshot;

    // ── Turn 2 ──
    await act(async () => {
      await result.current.handleSend('seconda domanda');
    });
    await waitFor(() => expect(sendChat).toHaveBeenCalledTimes(2));

    const secondCall = sendChat.mock.calls[1];
    const secondOptions = secondCall[2] || {};
    // Contract: previousBoardSnapshot on turn 2 == boardSnapshot from turn 1.
    expect(secondOptions).toHaveProperty('previousBoardSnapshot');
    expect(secondOptions.previousBoardSnapshot).toEqual(firstBoardSnapshot);
  });
});
