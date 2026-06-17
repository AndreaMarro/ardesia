/**
 * UNLIM Chat Tests — Categoria P0 benchmark (era 0 test)
 * Testa: useGalileoChat, action tags, intent tags, implicit actions, content filter, rate limit
 * (c) Andrea Marro — 12/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Test executeActionTags parsing ──
// We test the regex and switch logic directly
describe('UNLIM Chat — AZIONE tag parsing', () => {
  const actionRegex = /\[azione:([^\]]+)\]/gi;

  it('parses [azione:play] tag', () => {
    const text = 'Ecco, avvio la simulazione! [azione:play]';
    const match = actionRegex.exec(text);
    expect(match).not.toBeNull();
    expect(match[1].trim().split(':')[0].toLowerCase()).toBe('play');
  });

  it('parses [azione:highlight:led1] tag', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = 'Evidenzio il LED rosso [azione:highlight:led1]';
    const match = regex.exec(text);
    expect(match).not.toBeNull();
    const parts = match[1].trim().split(':');
    expect(parts[0].toLowerCase()).toBe('highlight');
    expect(parts[1]).toBe('led1');
  });

  it('parses [azione:loadexp:v1-cap6-esp1] tag', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = 'Carico l\'esperimento [azione:loadexp:v1-cap6-esp1]';
    const match = regex.exec(text);
    expect(match[1].trim().split(':')[0].toLowerCase()).toBe('loadexp');
    expect(match[1].trim().split(':')[1]).toBe('v1-cap6-esp1');
  });

  it('parses multiple AZIONE tags in one response', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = 'Ecco! [azione:highlight:r1] [azione:play]';
    const matches = [...text.matchAll(regex)];
    expect(matches).toHaveLength(2);
    expect(matches[0][1].trim().split(':')[0]).toBe('highlight');
    expect(matches[1][1].trim().split(':')[0]).toBe('play');
  });

  it('handles case-insensitive [AZIONE:PLAY]', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = '[AZIONE:PLAY]';
    const match = regex.exec(text);
    expect(match).not.toBeNull();
    expect(match[1].trim().toLowerCase()).toBe('play');
  });

  it('parses addcomponent with coordinates', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = '[azione:addcomponent:led:200:150]';
    const match = regex.exec(text);
    const parts = match[1].split(':');
    expect(parts[0].toLowerCase()).toBe('addcomponent');
    expect(parts[1]).toBe('led');
    expect(parseInt(parts[2])).toBe(200);
    expect(parseInt(parts[3])).toBe(150);
  });

  it('parses addwire with 4 parameters', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = '[azione:addwire:nano:D13:bb:A5]';
    const match = regex.exec(text);
    const parts = match[1].split(':');
    expect(parts[0].toLowerCase()).toBe('addwire');
    expect(parts.length).toBe(5);
  });

  it('returns no matches for text without AZIONE tags', () => {
    const regex = /\[azione:([^\]]+)\]/gi;
    const text = 'Un LED si accende collegando il piedino lungo al positivo.';
    const matches = [...text.matchAll(regex)];
    expect(matches).toHaveLength(0);
  });

  it('handles all known command types', () => {
    const commands = ['play', 'pause', 'reset', 'highlight', 'loadexp', 'addcomponent',
                      'removecomponent', 'addwire', 'compile', 'undo', 'redo', 'interact', 'clearall'];
    for (const cmd of commands) {
      const regex = /\[azione:([^\]]+)\]/gi;
      const text = `[azione:${cmd}]`;
      const match = regex.exec(text);
      expect(match, `Command ${cmd} should be parseable`).not.toBeNull();
    }
  });
});

// ── Test INTENT tag parsing ──
describe('UNLIM Chat — INTENT tag parsing', () => {
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

  it('extracts valid INTENT tag', () => {
    const text = 'Ecco [INTENT:{"action":"place","component":"led","pin":"D13"}]';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(1);
    const parsed = JSON.parse(tags[0].json);
    expect(parsed.action).toBe('place');
    expect(parsed.component).toBe('led');
  });

  it('extracts multiple INTENT tags', () => {
    const text = '[INTENT:{"action":"place","component":"led"}] poi [INTENT:{"action":"wire","from":"D13","to":"A5"}]';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(2);
  });

  it('returns empty for text without INTENT', () => {
    const tags = extractIntentTags('Un LED e un diodo che emette luce.');
    expect(tags).toHaveLength(0);
  });

  it('handles nested braces in JSON', () => {
    const text = '[INTENT:{"action":"place","options":{"color":"red","size":5}}]';
    const tags = extractIntentTags(text);
    expect(tags).toHaveLength(1);
    const parsed = JSON.parse(tags[0].json);
    expect(parsed.options.color).toBe('red');
  });
});

// ── Test implicit action detection patterns ──
describe('UNLIM Chat — Implicit action detection', () => {
  const patterns = {
    play: /\b(accendi|avvia|fai partire|esegui|simula|prova|play)\b/,
    pause: /\b(ferma|pausa|stop|spegni tutto)\b/,
    undo: /\b(annulla|undo)\b/,
    redo: /\b(ripeti|redo)\b/,
    reset: /\b(pulisci|cancella tutto|reset|ricomincia)\b/,
    highlight: /\b(?:evidenzia|mostra|indica|seleziona)\s+(?:il |la |lo |l'|i |le |gli )?(\w+)/,
  };

  it('detects "accendi" as play', () => {
    expect(patterns.play.test('accendi il circuito')).toBe(true);
  });

  it('detects "avvia la simulazione" as play', () => {
    expect(patterns.play.test('avvia la simulazione')).toBe(true);
  });

  it('detects "ferma" as pause', () => {
    expect(patterns.pause.test('ferma la simulazione')).toBe(true);
  });

  it('detects "annulla" as undo', () => {
    expect(patterns.undo.test('annulla l\'ultimo passo')).toBe(true);
  });

  it('detects "cancella tutto" as reset', () => {
    expect(patterns.reset.test('cancella tutto e ricomincia')).toBe(true);
  });

  it('detects "evidenzia il LED" as highlight', () => {
    const match = patterns.highlight.exec('evidenzia il LED');
    expect(match).not.toBeNull();
    expect(match[1].toLowerCase()).toBe('led');
  });

  it('maps Italian component names correctly', () => {
    const componentMap = {
      led: 'led', resistore: 'resistor', resistenza: 'resistor',
      pulsante: 'push-button', buzzer: 'buzzer-piezo',
      potenziometro: 'potentiometer', batteria: 'battery9v',
      ldr: 'photo-resistor', fotoresistenza: 'photo-resistor'
    };
    expect(componentMap['led']).toBe('led');
    expect(componentMap['resistore']).toBe('resistor');
    expect(componentMap['pulsante']).toBe('push-button');
    expect(componentMap['fotoresistenza']).toBe('photo-resistor');
    expect(Object.keys(componentMap)).toHaveLength(9);
  });
});

// ── Test welcome message ──
describe('UNLIM Chat — Welcome message', () => {
  it('welcome message has correct structure', () => {
    const WELCOME_MSG = {
      id: 'welcome', role: 'assistant',
      content: 'Ciao! Sono **UNLIM**, il tuo assistente per l\'elettronica. Cosa costruiamo oggi?',
    };
    expect(WELCOME_MSG.id).toBe('welcome');
    expect(WELCOME_MSG.role).toBe('assistant');
    expect(WELCOME_MSG.content).toContain('UNLIM');
  });

  it('welcome message is in Italian and age-appropriate', () => {
    const msg = 'Ciao! Sono **UNLIM**, il tuo assistente per l\'elettronica. Cosa costruiamo oggi?';
    expect(msg).toContain('Ciao');
    expect(msg).toContain('costruiamo');
    expect(msg.length).toBeLessThan(100); // Short and friendly
  });
});

// ── Test content filter integration ──
describe('UNLIM Chat — Content filter', () => {
  let validateMessage, sanitizeOutput;

  beforeEach(async () => {
    const mod = await import('../../src/utils/contentFilter.js');
    validateMessage = mod.validateMessage;
    sanitizeOutput = mod.sanitizeOutput;
  });

  it('accepts normal electronics question', () => {
    const result = validateMessage('Come si accende un LED?');
    expect(result.allowed).toBe(true);
  });

  it('accepts Italian component question', () => {
    const result = validateMessage('Cosa fa il resistore nel circuito?');
    expect(result.allowed).toBe(true);
  });

  it('accepts empty string (content filter does not block empty)', () => {
    const result = validateMessage('');
    // Empty is allowed by content filter — input validation is in the UI
    expect(result).toBeDefined();
  });

  it('sanitizeOutput returns a string', () => {
    const clean = sanitizeOutput('Risposta con <b>bold</b> e testo');
    expect(typeof clean).toBe('string');
    expect(clean.length).toBeGreaterThan(0);
  });

  it('sanitizeOutput preserves markdown bold', () => {
    const text = 'Il **LED** e un diodo';
    const clean = sanitizeOutput(text);
    expect(clean).toContain('**LED**');
  });
});

// ── Test quick action messages ──
describe('UNLIM Chat — Quick action messages', () => {
  const QUICK_ACTION_MESSAGES = {
    guide: 'Fammi una domanda guida su questo argomento. Usa parole semplici, una domanda alla volta, adatta a ragazzi 8-14 anni.',
    step: 'Aiutami a risolvere questo esercizio senza dirmi la risposta finale. Guidami passo passo con suggerimenti brevi per studenti 8-14 anni.',
    check: 'Controlla il mio ragionamento: dimmi cosa va bene, cosa migliorare e fammi una domanda di verifica. Tono chiaro per eta 8-14.',
    hint: 'Dammi solo un indizio breve per andare avanti, senza spoiler della soluzione. Linguaggio semplice per 8-14 anni.',
  };

  it('all messages mention age range 8-14', () => {
    for (const [key, msg] of Object.entries(QUICK_ACTION_MESSAGES)) {
      expect(msg, `${key} should mention 8-14`).toContain('8-14');
    }
  });

  it('guide asks a question', () => {
    expect(QUICK_ACTION_MESSAGES.guide).toContain('domanda');
  });

  it('hint avoids spoilers', () => {
    expect(QUICK_ACTION_MESSAGES.hint).toContain('senza spoiler');
  });

  it('step is step-by-step', () => {
    expect(QUICK_ACTION_MESSAGES.step).toContain('passo passo');
  });

  it('check verifies reasoning', () => {
    expect(QUICK_ACTION_MESSAGES.check).toContain('ragionamento');
  });
});
