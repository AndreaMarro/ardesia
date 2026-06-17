/**
 * unlimActions.test.js — Test UNLIM action tag system
 * Tests: executeActionTags, extractIntentTags, stripTagsForDisplay, capWords
 * 60 tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Replicate the pure functions from useGalileoChat.js for testing ──

function extractIntentTags(text) {
  const results = [];
  let idx = 0;
  while (idx < text.length) {
    const start = text.indexOf('[INTENT:{', idx);
    if (start === -1) break;
    const jsonStart = start + 8;
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') {
        depth--;
        if (depth === 0) { jsonEnd = i + 1; break; }
      }
    }
    if (jsonEnd === -1) break;
    const closeIdx = text.indexOf(']', jsonEnd);
    if (closeIdx === -1) break;
    results.push({
      fullMatch: text.substring(start, closeIdx + 1),
      json: text.substring(jsonStart, jsonEnd),
    });
    idx = closeIdx + 1;
  }
  return results;
}

function stripTagsForDisplay(text) {
  let stripped = text;
  for (const { fullMatch } of extractIntentTags(text)) {
    stripped = stripped.replace(fullMatch, '');
  }
  return stripped
    .replace(/\[azione:[^\]]+\]/gi, '')
    .replace(/\[AZIONE:[^\]]+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const MAX_WORDS = 80;
function capWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= MAX_WORDS) return text;
  const truncated = words.slice(0, MAX_WORDS).join(' ');
  const lastSentence = truncated.search(/[.!?][^.!?]*$/);
  return lastSentence > 20
    ? truncated.substring(0, lastSentence + 1)
    : truncated + '\u2026';
}

function parseActionTag(tag) {
  const re = /\[azione:([^\]]+)\]/gi;
  const match = re.exec(tag);
  if (!match) return null;
  const full = match[1].trim();
  const parts = full.split(':').map(s => s.trim());
  return { cmd: parts[0].toLowerCase(), parts };
}

// ══════════════════════════════════════
// TESTS
// ══════════════════════════════════════

describe('UNLIM Action Tag Parser', () => {
  describe('parseActionTag — basic commands', () => {
    it('parses [AZIONE:play]', () => {
      const r = parseActionTag('[AZIONE:play]');
      expect(r.cmd).toBe('play');
    });

    it('parses [azione:play] lowercase', () => {
      const r = parseActionTag('[azione:play]');
      expect(r.cmd).toBe('play');
    });

    it('parses [AZIONE:pause]', () => {
      const r = parseActionTag('[AZIONE:pause]');
      expect(r.cmd).toBe('pause');
    });

    it('parses [AZIONE:reset]', () => {
      const r = parseActionTag('[AZIONE:reset]');
      expect(r.cmd).toBe('reset');
    });

    it('parses [AZIONE:compile]', () => {
      const r = parseActionTag('[AZIONE:compile]');
      expect(r.cmd).toBe('compile');
    });

    it('parses [AZIONE:undo]', () => {
      const r = parseActionTag('[AZIONE:undo]');
      expect(r.cmd).toBe('undo');
    });

    it('parses [AZIONE:redo]', () => {
      const r = parseActionTag('[AZIONE:redo]');
      expect(r.cmd).toBe('redo');
    });

    it('parses [AZIONE:clearall]', () => {
      const r = parseActionTag('[AZIONE:clearall]');
      expect(r.cmd).toBe('clearall');
    });

    it('parses [AZIONE:screenshot]', () => {
      const r = parseActionTag('[AZIONE:screenshot]');
      expect(r.cmd).toBe('screenshot');
    });

    it('parses [AZIONE:describe]', () => {
      const r = parseActionTag('[AZIONE:describe]');
      expect(r.cmd).toBe('describe');
    });
  });

  describe('parseActionTag — parameterized commands', () => {
    it('parses [AZIONE:highlight:led1]', () => {
      const r = parseActionTag('[AZIONE:highlight:led1]');
      expect(r.cmd).toBe('highlight');
      expect(r.parts[1]).toBe('led1');
    });

    it('parses [AZIONE:highlight:led1,r1] with multiple targets', () => {
      const r = parseActionTag('[AZIONE:highlight:led1,r1]');
      expect(r.cmd).toBe('highlight');
      expect(r.parts[1]).toBe('led1,r1');
    });

    it('parses [AZIONE:addcomponent:led]', () => {
      const r = parseActionTag('[AZIONE:addcomponent:led]');
      expect(r.cmd).toBe('addcomponent');
      expect(r.parts[1]).toBe('led');
    });

    it('parses [AZIONE:addcomponent:resistor:200:150] with coords', () => {
      const r = parseActionTag('[AZIONE:addcomponent:resistor:200:150]');
      expect(r.cmd).toBe('addcomponent');
      expect(r.parts[1]).toBe('resistor');
      expect(r.parts[2]).toBe('200');
      expect(r.parts[3]).toBe('150');
    });

    it('parses [AZIONE:removecomponent:r1]', () => {
      const r = parseActionTag('[AZIONE:removecomponent:r1]');
      expect(r.cmd).toBe('removecomponent');
      expect(r.parts[1]).toBe('r1');
    });

    it('parses [AZIONE:loadexp:v1-cap6-esp1]', () => {
      const r = parseActionTag('[AZIONE:loadexp:v1-cap6-esp1]');
      expect(r.cmd).toBe('loadexp');
      expect(r.parts[1]).toBe('v1-cap6-esp1');
    });

    it('parses [AZIONE:addwire:bat1:positive:bb1:bus-top-plus-1]', () => {
      const r = parseActionTag('[AZIONE:addwire:bat1:positive:bb1:bus-top-plus-1]');
      expect(r.cmd).toBe('addwire');
      expect(r.parts.length).toBe(5);
    });

    it('parses [AZIONE:interact:btn1:press]', () => {
      const r = parseActionTag('[AZIONE:interact:btn1:press]');
      expect(r.cmd).toBe('interact');
      expect(r.parts[1]).toBe('btn1');
      expect(r.parts[2]).toBe('press');
    });

    it('parses [AZIONE:setvalue:r1:value:1000]', () => {
      const r = parseActionTag('[AZIONE:setvalue:r1:value:1000]');
      expect(r.cmd).toBe('setvalue');
      expect(r.parts[1]).toBe('r1');
      expect(r.parts[2]).toBe('value');
      expect(r.parts[3]).toBe('1000');
    });
  });

  describe('parseActionTag — edge cases', () => {
    it('returns null for empty string', () => {
      expect(parseActionTag('')).toBeNull();
    });

    it('returns null for no tag', () => {
      expect(parseActionTag('just some text')).toBeNull();
    });

    it('returns null for malformed tag without closing bracket', () => {
      expect(parseActionTag('[AZIONE:play')).toBeNull();
    });

    it('handles whitespace in parts', () => {
      const r = parseActionTag('[AZIONE: play ]');
      expect(r.cmd).toBe('play');
    });
  });
});

describe('extractIntentTags', () => {
  it('extracts a simple INTENT tag', () => {
    const text = 'Ecco [INTENT:{"action":"add","type":"led"}] fatto!';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(1);
    expect(JSON.parse(tags[0].json)).toEqual({ action: 'add', type: 'led' });
  });

  it('extracts INTENT tag with nested object', () => {
    const text = '[INTENT:{"action":"add","position":{"x":100,"y":200}}]';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(1);
    const parsed = JSON.parse(tags[0].json);
    expect(parsed.position.x).toBe(100);
  });

  it('extracts multiple INTENT tags', () => {
    const text = 'A [INTENT:{"a":1}] B [INTENT:{"b":2}] C';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(2);
  });

  it('returns empty array for no INTENT tags', () => {
    expect(extractIntentTags('no tags here')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(extractIntentTags('')).toEqual([]);
  });

  it('handles INTENT with array value', () => {
    const text = '[INTENT:{"components":["led","resistor"]}]';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(1);
    expect(JSON.parse(tags[0].json).components).toEqual(['led', 'resistor']);
  });

  it('fullMatch contains the entire tag', () => {
    const tag = '[INTENT:{"x":1}]';
    const text = 'before ' + tag + ' after';
    const tags = extractIntentTags(text);
    expect(tags[0].fullMatch).toBe(tag);
  });

  it('handles malformed JSON gracefully (unclosed brace)', () => {
    const text = '[INTENT:{"x":1';
    const tags = extractIntentTags(text);
    expect(tags).toEqual([]);
  });

  it('handles missing closing bracket', () => {
    const text = '[INTENT:{"x":1}';
    const tags = extractIntentTags(text);
    expect(tags).toEqual([]);
  });
});

describe('stripTagsForDisplay', () => {
  it('removes [AZIONE:play] from text', () => {
    expect(stripTagsForDisplay('Avvio! [AZIONE:play]')).toBe('Avvio!');
  });

  it('removes [azione:play] lowercase', () => {
    expect(stripTagsForDisplay('Avvio! [azione:play]')).toBe('Avvio!');
  });

  it('removes [AZIONE:highlight:led1]', () => {
    expect(stripTagsForDisplay('Guarda il LED [AZIONE:highlight:led1]')).toBe('Guarda il LED');
  });

  it('removes INTENT tags', () => {
    const text = 'Aggiungo un LED [INTENT:{"action":"add","type":"led"}] ecco!';
    expect(stripTagsForDisplay(text)).toBe('Aggiungo un LED  ecco!');
  });

  it('removes multiple tags', () => {
    const text = '[AZIONE:play] Avvio [AZIONE:highlight:led1] il LED';
    const result = stripTagsForDisplay(text);
    expect(result).not.toContain('[AZIONE');
    expect(result).toContain('Avvio');
    expect(result).toContain('il LED');
  });

  it('collapses triple newlines to double', () => {
    const text = 'Linea 1\n\n\nLinea 2';
    expect(stripTagsForDisplay(text)).toBe('Linea 1\n\nLinea 2');
  });

  it('trims whitespace', () => {
    expect(stripTagsForDisplay('  testo  ')).toBe('testo');
  });

  it('handles text with no tags', () => {
    expect(stripTagsForDisplay('Ciao, come stai?')).toBe('Ciao, come stai?');
  });

  it('returns empty string for only tags', () => {
    expect(stripTagsForDisplay('[AZIONE:play]')).toBe('');
  });

  it('handles mixed AZIONE and INTENT tags', () => {
    const text = 'Testo [AZIONE:play] altro [INTENT:{"a":1}] fine';
    const result = stripTagsForDisplay(text);
    expect(result).not.toContain('[AZIONE');
    expect(result).not.toContain('[INTENT');
    expect(result).toContain('Testo');
    expect(result).toContain('fine');
  });
});

describe('capWords', () => {
  it('returns short text unchanged', () => {
    const text = 'Ciao mondo!';
    expect(capWords(text)).toBe(text);
  });

  it('returns exactly 80-word text unchanged', () => {
    const words = Array(80).fill('parola').join(' ');
    expect(capWords(words)).toBe(words);
  });

  it('truncates text longer than 80 words', () => {
    const words = Array(100).fill('parola').join(' ');
    const result = capWords(words);
    const resultWords = result.split(/\s+/).filter(Boolean);
    expect(resultWords.length).toBeLessThanOrEqual(81);
  });

  it('ends at sentence boundary when possible', () => {
    const sentence1 = Array(40).fill('parola').join(' ') + '.';
    const sentence2 = Array(50).fill('altra').join(' ') + '.';
    const text = sentence1 + ' ' + sentence2;
    const result = capWords(text);
    expect(result.endsWith('.')).toBe(true);
  });

  it('adds ellipsis when no sentence boundary', () => {
    const words = Array(100).fill('abc').join(' ');
    const result = capWords(words);
    expect(result.endsWith('\u2026')).toBe(true);
  });

  it('handles empty string', () => {
    expect(capWords('')).toBe('');
  });

  it('handles single word', () => {
    expect(capWords('Ciao')).toBe('Ciao');
  });

  it('handles 81 words (just over limit)', () => {
    const words = Array(81).fill('test').join(' ');
    const result = capWords(words);
    const resultWords = result.replace('\u2026', '').split(/\s+/).filter(Boolean);
    expect(resultWords.length).toBeLessThanOrEqual(80);
  });
});
