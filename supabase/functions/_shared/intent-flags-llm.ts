/**
 * intent-flags-llm.ts — Sprint X iter 105 P1 (Andrea mandate 2026-05-26)
 *
 * LLM-based 8-flag intent classifier. Used as L2/L3 fallback when regex L1
 * (`intent-flags-classifier.ts`) returns zero flags (ambiguous query) OR
 * caller explicitly opts in via `forceLLM: true`.
 *
 * Primary: Mistral La Plateforme `mistral-small-latest` with `response_format`
 * JSON schema (Sprint T iter 38 A7 pattern). EU data residency.
 *
 * Cost estimate: ~$0.0003/call (Mistral small 8k input + 50 output tokens).
 * Latency: 200-500ms p95.
 *
 * NEVER throws. Returns null when LLM unavailable; caller falls back to regex
 * result (all-false IntentFlags).
 */

import { callMistralChat } from './mistral-client.ts';
import { INTENT_FLAGS_SCHEMA, INTENT_FLAGS_SYSTEM_PROMPT } from './intent-flags-schema.ts';
import { logSilentFailure } from './observability.ts';

import type { IntentFlags } from './intent-flags-classifier.ts';

/** All-false IntentFlags (default when LLM unavailable). */
function emptyFlags(): IntentFlags {
  return {
    wants_screen_view: false,
    wants_action: false,
    wants_diagnose: false,
    wants_next: false,
    wants_review: false,
    off_topic: false,
    safety_minor: false,
    secret_project: false,
    triggered_flags: [],
  };
}

/** Build the triggered_flags helper list from boolean fields. */
function buildTriggeredFlags(parsed: Partial<IntentFlags>): string[] {
  const triggered: string[] = [];
  if (parsed.wants_screen_view) triggered.push('WANTS_SCREEN_VIEW');
  if (parsed.wants_action) triggered.push('WANTS_ACTION');
  if (parsed.wants_diagnose) triggered.push('WANTS_DIAGNOSE');
  if (parsed.wants_next) triggered.push('WANTS_NEXT');
  if (parsed.wants_review) triggered.push('WANTS_REVIEW');
  if (parsed.off_topic) triggered.push('OFF_TOPIC');
  if (parsed.safety_minor) triggered.push('SAFETY_MINOR');
  if (parsed.secret_project) triggered.push('SECRET_PROJECT');
  return triggered;
}

/** Validate parsed JSON has all 8 required boolean fields. */
function isValidIntentFlagsShape(obj: unknown): obj is Partial<IntentFlags> {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  const requiredKeys = [
    'wants_screen_view',
    'wants_action',
    'wants_diagnose',
    'wants_next',
    'wants_review',
    'off_topic',
    'safety_minor',
    'secret_project',
  ];
  return requiredKeys.every(k => typeof o[k] === 'boolean');
}

export interface LLMClassifyOptions {
  /** Override default model (default: mistral-small-latest via Mistral). */
  model?: 'mistral-small-latest' | 'mistral-large-latest';
  /** Override default temperature (default 0.0 for deterministic classification). */
  temperature?: number;
}

/**
 * Classify intent flags via Mistral La Plateforme structured output.
 *
 * Returns:
 *   - IntentFlags object when LLM call succeeds + JSON valid
 *   - null when LLM unavailable (env missing, timeout, schema invalid, etc.)
 *     — caller should treat as "no signal", typically falls back to regex
 *
 * NEVER throws.
 */
export async function classifyIntentFlagsLLM(
  message: string | null | undefined,
  opts: LLMClassifyOptions = {},
): Promise<IntentFlags | null> {
  if (message == null || typeof message !== 'string' || message.trim().length === 0) {
    return null;
  }

  try {
    const result = await callMistralChat({
      model: opts.model ?? 'mistral-small-latest',
      systemPrompt: INTENT_FLAGS_SYSTEM_PROMPT,
      message: message.trim().slice(0, 8000), // cap input for cost control
      maxOutputTokens: 200, // 8 booleans + JSON wrapper << 50 tokens; 200 is generous
      temperature: opts.temperature ?? 0.0, // deterministic classification
      responseFormat: INTENT_FLAGS_SCHEMA,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.text);
    } catch (parseErr) {
      logSilentFailure('intent_flags_llm_json_parse_failed', parseErr, {
        text_preview: result.text.slice(0, 200),
        model: result.model,
      });
      return null;
    }

    if (!isValidIntentFlagsShape(parsed)) {
      logSilentFailure(
        'intent_flags_llm_invalid_shape',
        new Error('schema validation failed'),
        { received_keys: Object.keys(parsed as Record<string, unknown> || {}) },
      );
      return null;
    }

    const flags: IntentFlags = {
      wants_screen_view: parsed.wants_screen_view === true,
      wants_action: parsed.wants_action === true,
      wants_diagnose: parsed.wants_diagnose === true,
      wants_next: parsed.wants_next === true,
      wants_review: parsed.wants_review === true,
      off_topic: parsed.off_topic === true,
      safety_minor: parsed.safety_minor === true,
      secret_project: parsed.secret_project === true,
      triggered_flags: [],
    };
    flags.triggered_flags = buildTriggeredFlags(flags);
    return flags;
  } catch (err) {
    logSilentFailure('intent_flags_llm_call_failed', err, {
      provider: 'mistral',
      model: opts.model ?? 'mistral-small-latest',
    });
    return null;
  }
}

/** Module version for telemetry. */
export const INTENT_FLAGS_LLM_VERSION = '1.0-iter105';

// Re-export emptyFlags for tests/consumers that need a default.
export { emptyFlags as buildEmptyIntentFlags };
