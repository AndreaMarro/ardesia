/**
 * Sprint T iter 36 Phase 1 — Atom A1 — generator-test (Maker-1).
 *
 * Tests for `supabase/functions/_shared/intent-parser.ts`.
 *
 * Source TS file runs on Deno Edge runtime; vitest 3.x can import .ts via the
 * Vite plugin (same pattern as `clawbot-template-router.test.js` and
 * `together-fallback.test.js`).
 *
 * Coverage targets per Pattern S r3 contract:
 *   - single intent simple
 *   - multiple intents in one response (2, 3)
 *   - malformed JSON (try/catch ok, never throws)
 *   - nested braces in args (e.g. `args:{filter:{type:"led"}}`)
 *   - Italian text mixed with intent
 *   - special chars unicode (é, à, ò, "Ragazzi,")
 *   - empty text
 *   - no intent tags
 *   - intent at start vs middle vs end of text
 *   - intent with whitespace variations
 *   - very long args
 *   - args with array values
 *   - regex defensive non-greedy
 */

import { describe, it, expect } from 'vitest';

let parseIntentTags;
let stripIntentTags;
let importError = null;

try {
  const mod = await import('../../supabase/functions/_shared/intent-parser.ts');
  parseIntentTags = mod.parseIntentTags;
  stripIntentTags = mod.stripIntentTags;
} catch (err) {
  importError = err;
}

describe('intent-parser — module loads', () => {
  it('imports without error', () => {
    expect(importError, importError && importError.message).toBeNull();
    expect(typeof parseIntentTags).toBe('function');
    expect(typeof stripIntentTags).toBe('function');
  });
});

describe('parseIntentTags — happy path', () => {
  it('parses a single simple intent', () => {
    const text =
      'Ragazzi, guardate il LED. [INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].tool).toBe('highlightComponent');
    expect(intents[0].args).toEqual({ ids: ['led1'] });
    expect(intents[0].raw).toBe(
      '[INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}]',
    );
    expect(typeof intents[0].startIdx).toBe('number');
    expect(typeof intents[0].endIdx).toBe('number');
    expect(intents[0].endIdx).toBeGreaterThan(intents[0].startIdx);
  });

  it('parses two intents in one response', () => {
    const text =
      'Ok. [INTENT:{"tool":"highlightComponent","args":{"ids":["led1"]}}] poi [INTENT:{"tool":"speakTTS","args":{"text":"ciao"}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(2);
    expect(intents[0].tool).toBe('highlightComponent');
    expect(intents[1].tool).toBe('speakTTS');
    expect(intents[1].args).toEqual({ text: 'ciao' });
  });

  it('parses three intents in source order', () => {
    const text = [
      '[INTENT:{"tool":"a","args":{"x":1}}]',
      'middle text',
      '[INTENT:{"tool":"b","args":{"x":2}}]',
      'end text',
      '[INTENT:{"tool":"c","args":{"x":3}}]',
    ].join(' ');
    const intents = parseIntentTags(text);
    expect(intents.map((i) => i.tool)).toEqual(['a', 'b', 'c']);
    expect(intents.map((i) => i.args.x)).toEqual([1, 2, 3]);
    // Source order (start indices strictly increasing).
    expect(intents[0].startIdx).toBeLessThan(intents[1].startIdx);
    expect(intents[1].startIdx).toBeLessThan(intents[2].startIdx);
  });
});

describe('parseIntentTags — defensive parsing', () => {
  it('does NOT throw on malformed JSON, drops the tag', () => {
    const text =
      'Pre [INTENT:{this is not json}] post [INTENT:{"tool":"ok","args":{}}]';
    let intents;
    expect(() => {
      intents = parseIntentTags(text);
    }).not.toThrow();
    // Only the well-formed tag survives.
    expect(intents).toHaveLength(1);
    expect(intents[0].tool).toBe('ok');
  });

  it('does NOT throw on completely broken tag (unterminated brace)', () => {
    const text = 'Hi [INTENT:{"tool":"x","args":{ no close';
    let intents;
    expect(() => {
      intents = parseIntentTags(text);
    }).not.toThrow();
    expect(intents).toEqual([]);
  });

  it('drops a tag missing the required `tool` field', () => {
    const text = '[INTENT:{"args":{"x":1}}] [INTENT:{"tool":"good","args":{}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].tool).toBe('good');
  });
});

describe('parseIntentTags — nested args', () => {
  it('handles nested object args (filter.type)', () => {
    const text =
      '[INTENT:{"tool":"queryComponents","args":{"filter":{"type":"led","color":"red"}}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].args).toEqual({
      filter: { type: 'led', color: 'red' },
    });
  });

  it('handles deeply nested args (3 levels)', () => {
    const text =
      '[INTENT:{"tool":"setConfig","args":{"a":{"b":{"c":{"d":42}}}}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    const a = intents[0].args.a;
    expect(a).toEqual({ b: { c: { d: 42 } } });
  });

  it('handles array values inside args', () => {
    const text =
      '[INTENT:{"tool":"highlightPin","args":{"pins":["nano:D13","nano:GND","nano:5V"]}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].args.pins).toEqual(['nano:D13', 'nano:GND', 'nano:5V']);
  });
});

describe('parseIntentTags — text mix + unicode', () => {
  it('extracts intent from Italian text with accents', () => {
    const text =
      'Ragazzi, perché il LED è acceso? [INTENT:{"tool":"explain","args":{"q":"perché acceso"}}] àòè';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].tool).toBe('explain');
    // The accented payload survives the parse.
    expect(intents[0].args.q).toMatch(/perch/);
  });

  it('handles unicode inside string args', () => {
    const text = '[INTENT:{"tool":"speakTTS","args":{"text":"Ciao Ragazzi, è facile!"}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].args.text).toBe('Ciao Ragazzi, è facile!');
  });

  it('returns empty array for empty input', () => {
    expect(parseIntentTags('')).toEqual([]);
    expect(parseIntentTags(null)).toEqual([]);
    expect(parseIntentTags(undefined)).toEqual([]);
  });

  it('returns empty array when no intent tags present', () => {
    const text = 'Solo testo, nessun intent qui.';
    expect(parseIntentTags(text)).toEqual([]);
  });
});

describe('parseIntentTags — position invariance', () => {
  it('parses an intent at the very start of text', () => {
    const text = '[INTENT:{"tool":"a","args":{}}] tail';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].startIdx).toBe(0);
  });

  it('parses an intent in the middle of text', () => {
    const text = 'head [INTENT:{"tool":"a","args":{}}] tail';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].startIdx).toBe(5);
  });

  it('parses an intent at the very end of text', () => {
    const text = 'head text [INTENT:{"tool":"a","args":{}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].endIdx).toBe(text.length);
  });
});

describe('parseIntentTags — whitespace + scale', () => {
  it('tolerates whitespace inside the JSON object', () => {
    const text = '[INTENT:{ "tool": "x" , "args": { "k": 1 } }]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].tool).toBe('x');
    expect(intents[0].args).toEqual({ k: 1 });
  });

  it('handles a very long args payload (>2KB string)', () => {
    const big = 'x'.repeat(2048);
    const text = `[INTENT:{"tool":"explain","args":{"text":"${big}"}}]`;
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(1);
    expect(intents[0].args.text.length).toBe(2048);
  });

  it('non-greedy: does NOT swallow text between two intent tags', () => {
    const text =
      '[INTENT:{"tool":"a","args":{}}] BETWEEN [INTENT:{"tool":"b","args":{}}]';
    const intents = parseIntentTags(text);
    expect(intents).toHaveLength(2);
    expect(intents[0].tool).toBe('a');
    expect(intents[1].tool).toBe('b');
    // raw of first MUST end before "BETWEEN" — defensive non-greedy assertion.
    expect(intents[0].raw).not.toContain('BETWEEN');
    expect(intents[0].raw).not.toContain('"b"');
  });
});

describe('stripIntentTags', () => {
  it('removes a single intent tag and trims', () => {
    const text = 'Ciao Ragazzi! [INTENT:{"tool":"a","args":{}}]';
    expect(stripIntentTags(text)).toBe('Ciao Ragazzi!');
  });

  it('removes multiple intent tags and collapses whitespace', () => {
    const text =
      'Pre [INTENT:{"tool":"a","args":{}}] mid [INTENT:{"tool":"b","args":{}}] tail';
    expect(stripIntentTags(text)).toBe('Pre mid tail');
  });

  it('removes nested-args intent tag fully (regex would leak `}`)', () => {
    const text =
      'X [INTENT:{"tool":"q","args":{"f":{"t":"led"}}}] Y';
    const out = stripIntentTags(text);
    expect(out).toBe('X Y');
    // CRITICAL: ensure no orphan `}]` from the nested object leaks through.
    expect(out).not.toContain('}]');
    expect(out).not.toContain('"led"');
  });

  it('returns trimmed input when no intent tags present', () => {
    expect(stripIntentTags('   ciao   ')).toBe('ciao');
    expect(stripIntentTags('')).toBe('');
  });
});
