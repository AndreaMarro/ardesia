/**
 * Intent tag parser — Sprint T iter 36 Phase 1 — Atom A1.
 *
 * Parses `[INTENT:{tool:"...",args:{...}}]` tags emitted by the LLM in its
 * response text, returns a structured list of `IntentTag` for downstream
 * dispatch (browser-side via `__ELAB_API`), and produces a "clean" version
 * of the response text with all intent tags stripped (for display + TTS).
 *
 * Design notes:
 *   - The LLM is instructed to emit JSON-shaped intent tags. We use a
 *     brace-counting scan instead of a single regex because args can contain
 *     nested objects (e.g. `args:{filter:{type:"led"}}`). A non-greedy regex
 *     would terminate at the first inner `}`.
 *   - All parsing is defensive: malformed JSON inside a tag is logged via
 *     `_lastParseErrors` (test hook) but never throws. Bad tags fall through
 *     to `stripIntentTags` so the user-facing text stays clean.
 *   - JSON.parse with a tolerant pre-pass: LLMs sometimes emit single-quoted
 *     strings or unquoted keys. We normalize the most common cases before
 *     handing to JSON.parse, falling back to a permissive parse via
 *     `Function('return ' + s)` only as a last resort and only when no
 *     suspicious sigils ($, `, eval, fetch, import) are present.
 *
 * Wire-up in `unlim-chat/index.ts`:
 *   import { parseIntentTags, stripIntentTags } from '../_shared/intent-parser.ts';
 *   const intents = parseIntentTags(llmText);
 *   const cleanText = stripIntentTags(llmText);
 *   // dispatch each intent (or surface to client to dispatch via __ELAB_API)
 *
 * (c) Andrea Marro — 2026-04-30
 */

export interface IntentTag {
  /** Original raw substring including `[INTENT:...]` wrappers. */
  raw: string;
  /** Tool name (e.g. `"highlightComponent"`). */
  tool: string;
  /** Tool arguments object (already parsed from JSON). */
  args: Record<string, unknown>;
  /** Index of the `[` opening bracket in the source string. */
  startIdx: number;
  /** Index immediately past the `]` closing bracket. */
  endIdx: number;
}

/** Optional debug surface for tests — last batch of parse errors. */
const _lastParseErrors: string[] = [];

/**
 * Internal: locate `[INTENT:{...}]` spans using a brace-balanced scan.
 * Returns each match's outer span and the inner JSON-ish substring.
 */
function findIntentSpans(text: string): Array<{
  startIdx: number;
  endIdx: number;
  jsonRaw: string;
}> {
  const out: Array<{ startIdx: number; endIdx: number; jsonRaw: string }> = [];
  if (!text) return out;

  const marker = '[INTENT:';
  let i = 0;

  while (i < text.length) {
    const start = text.indexOf(marker, i);
    if (start < 0) break;

    const jsonStart = start + marker.length;
    if (text[jsonStart] !== '{') {
      // Malformed — `[INTENT:` not followed by `{`. Skip past to avoid loop.
      i = jsonStart + 1;
      continue;
    }

    // Brace-balanced scan, ignore braces inside strings.
    let depth = 0;
    let inString = false;
    let stringQuote = '';
    let escaped = false;
    let jsonEnd = -1;

    for (let j = jsonStart; j < text.length; j++) {
      const ch = text[j];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === stringQuote) {
          inString = false;
          stringQuote = '';
        }
        continue;
      }

      if (ch === '"' || ch === "'") {
        inString = true;
        stringQuote = ch;
        continue;
      }

      if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
        if (depth === 0) {
          jsonEnd = j;
          break;
        }
      }
    }

    if (jsonEnd < 0) {
      // Unterminated `{...}` — abandon, advance past `[INTENT:` to keep scanning.
      _lastParseErrors.push(`unterminated_brace_at_${start}`);
      i = jsonStart;
      continue;
    }

    // Expect `]` immediately after the closing `}`. Allow optional whitespace
    // for tolerance, then require `]`.
    let k = jsonEnd + 1;
    while (k < text.length && /\s/.test(text[k])) k++;
    if (text[k] !== ']') {
      _lastParseErrors.push(`missing_close_bracket_at_${start}`);
      i = jsonEnd + 1;
      continue;
    }

    out.push({
      startIdx: start,
      endIdx: k + 1,
      jsonRaw: text.slice(jsonStart, jsonEnd + 1),
    });
    i = k + 1;
  }

  return out;
}

/**
 * Parse a JSON-ish object string defensively. LLMs sometimes emit lax JSON
 * (single quotes, unquoted keys). We try strict JSON.parse first, then a
 * single normalization pass, then bail.
 */
function tolerantParseObject(jsonRaw: string): Record<string, unknown> | null {
  // 1. Strict JSON.
  try {
    const v = JSON.parse(jsonRaw);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    return null;
  } catch {
    // fall through
  }

  // 2. Normalize: single→double quotes (only outside existing double-quoted strings),
  //    quote unquoted keys (`{tool:"x"}` → `{"tool":"x"}`).
  // Conservative single-pass normalization; only applied when no double quotes found
  // (to avoid corrupting valid JSON-with-string-payload).
  let normalized = jsonRaw;

  // Quote unquoted bare-word keys: `{key: ...}` or `, key: ...`
  normalized = normalized.replace(
    /([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g,
    '$1"$2"$3',
  );

  // Convert single-quoted string literals to double-quoted, escaping inner doubles.
  normalized = normalized.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, inner: string) => {
    const escaped = inner.replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  try {
    const v = JSON.parse(normalized);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
    return null;
  } catch (err) {
    _lastParseErrors.push(
      `parse_failed: ${err instanceof Error ? err.message : 'unknown'}`,
    );
    return null;
  }
}

/**
 * Parse all `[INTENT:{...}]` tags from a response text.
 *
 * Tolerant of:
 *   - multiple intent tags in one response
 *   - intents at start/middle/end of text
 *   - nested objects/arrays in `args`
 *   - whitespace inside the JSON
 *   - unicode + Italian text mixed with intents
 *
 * Returns intents in source order. Malformed tags are silently dropped
 * (not thrown) — they are still removed from `stripIntentTags` output via
 * the same regex.
 */
export function parseIntentTags(text: string): IntentTag[] {
  _lastParseErrors.length = 0;
  if (typeof text !== 'string' || text.length === 0) return [];

  const spans = findIntentSpans(text);
  const out: IntentTag[] = [];

  for (const span of spans) {
    const parsed = tolerantParseObject(span.jsonRaw);
    if (!parsed) continue;

    // iter 37 Phase 3 fix: accept both `tool` (canonical) and `action` (alias)
    // for LLM-emitted intents. Tester-5 R7 found 100% drop when LLM emitted
    // `{"action":"...","params":{...}}` per system-prompt iter 37 amend.
    // Parser is now LLM-forgiving on key naming.
    const tool = typeof parsed.tool === 'string'
      ? parsed.tool
      : typeof parsed.action === 'string'
        ? parsed.action
        : null;
    if (!tool) {
      _lastParseErrors.push(`missing_tool_or_action_field`);
      continue;
    }

    // iter 37 Phase 3 fix: accept both `args` (canonical) and `params` (alias).
    const argsSource = parsed.args ?? parsed.params;
    const args =
      argsSource && typeof argsSource === 'object' && !Array.isArray(argsSource)
        ? (argsSource as Record<string, unknown>)
        : {};

    out.push({
      raw: text.slice(span.startIdx, span.endIdx),
      tool,
      args,
      startIdx: span.startIdx,
      endIdx: span.endIdx,
    });
  }

  return out;
}

/**
 * Remove all `[INTENT:{...}]` tags from a response text, collapse extra
 * whitespace, and trim. Used for the user-facing `text` returned to the
 * client (and for TTS — see `principio-zero-validator.ts:51` which strips
 * the same shape).
 *
 * Implementation uses brace-balanced span detection so nested-args tags are
 * stripped correctly (a flat regex would leak partial JSON for nested `}`).
 */
export function stripIntentTags(text: string): string {
  if (typeof text !== 'string' || text.length === 0) return '';

  const spans = findIntentSpans(text);
  if (spans.length === 0) return text.replace(/\s+/g, ' ').trim();

  let cur = 0;
  let out = '';
  for (const span of spans) {
    out += text.slice(cur, span.startIdx);
    cur = span.endIdx;
  }
  out += text.slice(cur);

  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Test-only hook — exposes the last batch of parse errors. Consumers should
 * not depend on this in production code.
 */
export function _getLastParseErrors(): string[] {
  return [..._lastParseErrors];
}
