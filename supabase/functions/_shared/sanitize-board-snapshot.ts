/**
 * UNLIM Slice 1B+ hardening — sanitize client-supplied boardSnapshot before
 * passing to computeAwarenessFlags / renderAwarenessFlags pipeline.
 *
 * Extracted from guards.ts as a pure ESM module so vitest can test it without
 * the Deno https:esm.sh imports that guards.ts uses for Supabase client.
 *
 * Mitigations:
 * - C1 (prompt injection): strips LLM instruction patterns ("ignore previous
 *   instructions", "you are now", "system prompt", "[SYSTEM]", "[ADMIN]",
 *   "[INST]", "<|...|>") from string fields that flow into the LLM prompt
 *   (circuit.errors[], experimentId, compileMessage).
 * - C2 (DoS): caps array sizes at MAX_ARRAY_SIZE — prevents unbounded loops
 *   in awareness-flags.ts circuitSignature() on huge components/connections.
 * - Recursion safety: caps depth at MAX_DEPTH — prevents stack-blow on cycles.
 * - String length safety: caps individual strings at MAX_STRING_LENGTH.
 * - Type safety: strips unknown types (function, symbol -> null).
 *
 * Spec: code review report 2026-05-25 sections C1, C2.
 * (c) Andrea Marro - ELAB Tutor
 */

const MAX_DEPTH = 10;
const MAX_STRING_LENGTH = 500;
const MAX_ARRAY_SIZE = 50;

// Zero-width chars (ZWSP U+200B, ZWNJ U+200C, ZWJ U+200D, LRM U+200E,
// RLM U+200F, BOM U+FEFF) commonly used to evade keyword-based injection
// detection. Stripped before applying pattern matchers.
const ZERO_WIDTH_RE = /[​-‏﻿]/g;

function normalizeStr(value: string): string {
  return value.normalize('NFC').replace(ZERO_WIDTH_RE, '');
}

/**
 * Deep sanitize any value — recursive with depth limit.
 * Strips LLM injection patterns, caps string + array sizes.
 *
 * Identical security policy to guards.ts deepSanitize but with NO external
 * dependencies so it can be tested in vitest (Node ESM).
 */
function deepSanitize(value: unknown, depth: number = 0): unknown {
  if (depth > MAX_DEPTH) return null;
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    const normalized = normalizeStr(value);
    return normalized
      .replace(/ignore.*previous.*instructions/gi, '[filtered]')
      .replace(/you are now/gi, '[filtered]')
      .replace(/system.*prompt/gi, '[filtered]')
      .replace(/\[SYSTEM\]/gi, '')
      .replace(/\[ADMIN\]/gi, '')
      .replace(/\[INST\]/gi, '')
      .replace(/<\|[^|]+\|>/g, '')
      .slice(0, MAX_STRING_LENGTH);
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_SIZE).map(item => deepSanitize(item, depth + 1));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    const keys = Object.keys(value as Record<string, unknown>);
    for (const key of keys.slice(0, MAX_ARRAY_SIZE)) {
      const sanitizedKey = key.slice(0, 100);
      result[sanitizedKey] = deepSanitize((value as Record<string, unknown>)[key], depth + 1);
    }
    return result;
  }

  return null; // Unknown types (function, symbol) stripped.
}

/**
 * Sanitize a client-supplied boardSnapshot before passing to awareness-flags
 * pipeline. Falsy / non-object input -> null (server tolerates null per
 * Slice 1B backward-compat invariant).
 */
export function sanitizeBoardSnapshot(boardSnapshot: unknown): unknown {
  if (!boardSnapshot || typeof boardSnapshot !== 'object') return null;
  return deepSanitize(boardSnapshot, 0);
}

/** Public constants for tests + downstream consumers. */
export const SANITIZER_LIMITS = {
  MAX_DEPTH,
  MAX_STRING_LENGTH,
  MAX_ARRAY_SIZE,
};
