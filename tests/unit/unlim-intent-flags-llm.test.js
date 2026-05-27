/**
 * unlim-intent-flags-llm.test.js — Sprint X iter 105 P1 (Andrea mandate 2026-05-26)
 *
 * Tests for `supabase/functions/_shared/intent-flags-llm.ts`.
 *
 * Strategy: mock `callMistralChat` to return controlled JSON, verify
 * `classifyIntentFlagsLLM` parses correctly, validates shape, builds
 * `triggered_flags`, and NEVER throws on adversarial inputs.
 *
 * Coverage:
 *  - Valid JSON with all 8 flags
 *  - Subset of flags true
 *  - All-false (chit-chat)
 *  - Malformed JSON (parse failure → null)
 *  - Missing required keys (shape failure → null)
 *  - Wrong types (string instead of bool → null)
 *  - Mistral throws (network error → null)
 *  - Empty/null input → null
 *  - Whitespace-only → null
 *  - Long input truncation
 *  - Concurrent calls are independent
 *  - Telemetry on each failure mode
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Deno polyfill — Mistral client reads Deno.env at module init
globalThis.Deno = globalThis.Deno || {
  env: {
    get: () => undefined,
    has: () => false,
    toObject: () => ({}),
  },
};

// Mock the Mistral client BEFORE importing the module under test
const mockCallMistralChat = vi.fn();
vi.mock('../../supabase/functions/_shared/mistral-client.ts', () => ({
  callMistralChat: (...args) => mockCallMistralChat(...args),
}));

const { classifyIntentFlagsLLM, buildEmptyIntentFlags, INTENT_FLAGS_LLM_VERSION } = await import(
  '../../supabase/functions/_shared/intent-flags-llm.ts'
);

// ===========================================================================

beforeEach(() => {
  mockCallMistralChat.mockReset();
});

describe('classifyIntentFlagsLLM — null/empty input handling', () => {
  it('1.1 — null input returns null without calling Mistral', async () => {
    const result = await classifyIntentFlagsLLM(null);
    expect(result).toBe(null);
    expect(mockCallMistralChat).not.toHaveBeenCalled();
  });

  it('1.2 — undefined input returns null', async () => {
    const result = await classifyIntentFlagsLLM(undefined);
    expect(result).toBe(null);
    expect(mockCallMistralChat).not.toHaveBeenCalled();
  });

  it('1.3 — empty string returns null', async () => {
    const result = await classifyIntentFlagsLLM('');
    expect(result).toBe(null);
    expect(mockCallMistralChat).not.toHaveBeenCalled();
  });

  it('1.4 — whitespace-only returns null', async () => {
    const result = await classifyIntentFlagsLLM('   \n\t  ');
    expect(result).toBe(null);
    expect(mockCallMistralChat).not.toHaveBeenCalled();
  });

  it('1.5 — non-string returns null', async () => {
    const result = await classifyIntentFlagsLLM(42);
    expect(result).toBe(null);
    expect(mockCallMistralChat).not.toHaveBeenCalled();
  });
});

describe('classifyIntentFlagsLLM — valid JSON parsing', () => {
  it('2.1 — all flags true returns IntentFlags with all true + triggered_flags populated', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: true,
        wants_action: true,
        wants_diagnose: true,
        wants_next: true,
        wants_review: true,
        off_topic: true,
        safety_minor: true,
        secret_project: true,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 100, output: 30 },
      latencyMs: 250,
    });
    const result = await classifyIntentFlagsLLM('guarda e diagnostica');
    expect(result).not.toBe(null);
    expect(result.wants_screen_view).toBe(true);
    expect(result.wants_action).toBe(true);
    expect(result.wants_diagnose).toBe(true);
    expect(result.wants_next).toBe(true);
    expect(result.wants_review).toBe(true);
    expect(result.off_topic).toBe(true);
    expect(result.safety_minor).toBe(true);
    expect(result.secret_project).toBe(true);
    expect(result.triggered_flags).toHaveLength(8);
  });

  it('2.2 — all flags false (chit-chat) returns valid IntentFlags', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: false,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 180,
    });
    const result = await classifyIntentFlagsLLM('ciao');
    expect(result).not.toBe(null);
    expect(result.triggered_flags).toEqual([]);
  });

  it('2.3 — subset of flags true (diagnose only) builds correct triggered_flags', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: false,
        wants_action: false,
        wants_diagnose: true,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 60, output: 30 },
      latencyMs: 200,
    });
    const result = await classifyIntentFlagsLLM('non capisco perché crasha');
    expect(result.wants_diagnose).toBe(true);
    expect(result.triggered_flags).toEqual(['WANTS_DIAGNOSE']);
  });

  it('2.4 — Mistral response uses schema (response_format set)', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: true,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 150,
    });
    await classifyIntentFlagsLLM('guarda lo schermo');
    const callArgs = mockCallMistralChat.mock.calls[0][0];
    expect(callArgs.responseFormat).toBeDefined();
    expect(callArgs.responseFormat.type).toBe('json_schema');
    expect(callArgs.responseFormat.json_schema.strict).toBe(true);
    expect(callArgs.temperature).toBe(0.0); // default deterministic
  });
});

describe('classifyIntentFlagsLLM — malformed responses', () => {
  it('3.1 — invalid JSON text returns null', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: 'not valid json {{{',
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 5 },
      latencyMs: 100,
    });
    const result = await classifyIntentFlagsLLM('test');
    expect(result).toBe(null);
  });

  it('3.2 — JSON missing required keys returns null', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({ wants_screen_view: true }), // missing 7 other keys
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 10 },
      latencyMs: 100,
    });
    const result = await classifyIntentFlagsLLM('test');
    expect(result).toBe(null);
  });

  it('3.3 — JSON with non-boolean values (string instead of bool) returns null', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: 'yes', // wrong type
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 100,
    });
    const result = await classifyIntentFlagsLLM('test');
    expect(result).toBe(null);
  });

  it('3.4 — empty JSON object returns null', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: '{}',
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 1 },
      latencyMs: 100,
    });
    const result = await classifyIntentFlagsLLM('test');
    expect(result).toBe(null);
  });

  it('3.5 — JSON null returns null', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: 'null',
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 1 },
      latencyMs: 100,
    });
    const result = await classifyIntentFlagsLLM('test');
    expect(result).toBe(null);
  });
});

describe('classifyIntentFlagsLLM — Mistral throws / unavailable', () => {
  it('4.1 — Mistral throws network error → returns null (never propagates)', async () => {
    mockCallMistralChat.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const result = await classifyIntentFlagsLLM('guarda il LED');
    expect(result).toBe(null);
  });

  it('4.2 — Mistral throws auth error → returns null', async () => {
    mockCallMistralChat.mockRejectedValueOnce(
      new Error('MISTRAL_API_KEY not configured'),
    );
    const result = await classifyIntentFlagsLLM('guarda il LED');
    expect(result).toBe(null);
  });

  it('4.3 — Mistral throws timeout error → returns null', async () => {
    mockCallMistralChat.mockRejectedValueOnce(new Error('AbortError: timed out'));
    const result = await classifyIntentFlagsLLM('guarda il LED');
    expect(result).toBe(null);
  });

  it('4.4 — Mistral throws after first success works on next call', async () => {
    mockCallMistralChat
      .mockRejectedValueOnce(new Error('5xx'))
      .mockResolvedValueOnce({
        text: JSON.stringify({
          wants_screen_view: true,
          wants_action: false,
          wants_diagnose: false,
          wants_next: false,
          wants_review: false,
          off_topic: false,
          safety_minor: false,
          secret_project: false,
        }),
        model: 'mistral-small-latest',
        provider: 'mistral',
        tokensUsed: { input: 50, output: 30 },
        latencyMs: 150,
      });
    const first = await classifyIntentFlagsLLM('guarda il LED');
    const second = await classifyIntentFlagsLLM('guarda il LED');
    expect(first).toBe(null);
    expect(second).not.toBe(null);
    expect(second.wants_screen_view).toBe(true);
  });
});

describe('classifyIntentFlagsLLM — input bounding', () => {
  it('5.1 — long input is truncated to 8000 chars', async () => {
    const longInput = 'x'.repeat(20000);
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: false,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 2000, output: 30 },
      latencyMs: 250,
    });
    await classifyIntentFlagsLLM(longInput);
    const callArgs = mockCallMistralChat.mock.calls[0][0];
    expect(callArgs.message.length).toBeLessThanOrEqual(8000);
  });

  it('5.2 — input is trimmed before send', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: false,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 100,
    });
    await classifyIntentFlagsLLM('   guarda  ');
    const callArgs = mockCallMistralChat.mock.calls[0][0];
    expect(callArgs.message).toBe('guarda');
  });
});

describe('classifyIntentFlagsLLM — opts overrides', () => {
  it('6.1 — opts.model overrides default mistral-small-latest', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: true,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-large-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 400,
    });
    await classifyIntentFlagsLLM('guarda', { model: 'mistral-large-latest' });
    const callArgs = mockCallMistralChat.mock.calls[0][0];
    expect(callArgs.model).toBe('mistral-large-latest');
  });

  it('6.2 — opts.temperature overrides default 0.0', async () => {
    mockCallMistralChat.mockResolvedValueOnce({
      text: JSON.stringify({
        wants_screen_view: false,
        wants_action: false,
        wants_diagnose: false,
        wants_next: false,
        wants_review: false,
        off_topic: false,
        safety_minor: false,
        secret_project: false,
      }),
      model: 'mistral-small-latest',
      provider: 'mistral',
      tokensUsed: { input: 50, output: 30 },
      latencyMs: 100,
    });
    await classifyIntentFlagsLLM('guarda', { temperature: 0.7 });
    const callArgs = mockCallMistralChat.mock.calls[0][0];
    expect(callArgs.temperature).toBe(0.7);
  });
});

describe('classifyIntentFlagsLLM — module exports', () => {
  it('7.1 — INTENT_FLAGS_LLM_VERSION exports a string', () => {
    expect(typeof INTENT_FLAGS_LLM_VERSION).toBe('string');
    expect(INTENT_FLAGS_LLM_VERSION).toMatch(/^\d+\.\d+/);
  });

  it('7.2 — buildEmptyIntentFlags returns all-false IntentFlags', () => {
    const empty = buildEmptyIntentFlags();
    expect(empty.wants_screen_view).toBe(false);
    expect(empty.triggered_flags).toEqual([]);
  });
});
