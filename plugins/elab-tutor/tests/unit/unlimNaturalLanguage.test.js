/**
 * UNLIM Natural Language Understanding Tests
 * Tests implicit action detection, vision trigger patterns,
 * component name mapping, and edge cases.
 *
 * Functions extracted from src/components/lavagna/useGalileoChat.js
 * since they are not exported directly.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ══════════════════════════════════════════════
// Extracted functions (mirrors source exactly)
// ══════════════════════════════════════════════

const componentMap = {
  led: 'led',
  resistore: 'resistor',
  resistenza: 'resistor',
  pulsante: 'push-button',
  buzzer: 'buzzer-piezo',
  potenziometro: 'potentiometer',
  batteria: 'battery9v',
  ldr: 'photo-resistor',
  fotoresistenza: 'photo-resistor',
};

/**
 * detectImplicitActions — extracted from useGalileoChat.js line ~391
 * Scans userMessage + aiResponse for Italian patterns.
 * Returns array of executed action strings.
 */
function detectImplicitActions(userMessage, aiResponse, api) {
  if (!api) return [];

  // Already has explicit tags? Skip fallback.
  if (/\[azione:/i.test(aiResponse) || /\[INTENT:\{/.test(aiResponse)) return [];

  const combined = (userMessage + ' ' + aiResponse).toLowerCase();
  const executed = [];

  // Play / run simulation
  if (
    /\b(accendi|avvia|fai partire|esegui|simula|prova|play)\b/.test(combined) &&
    !/\b(non |senza |prima di )\b.*\b(accend|avvia|esegu)/.test(combined)
  ) {
    api.play?.();
    executed.push('play');
  }

  // Pause / stop
  if (/\b(ferma|pausa|stop|spegni tutto)\b/.test(combined) && !executed.includes('play')) {
    api.pause?.();
    executed.push('pause');
  }

  // Highlight components
  const highlightMatch = combined.match(
    /\b(?:evidenzia|mostra|indica|seleziona)\s+(?:il |la |lo |l'|i |le |gli )?(\w+)/
  );
  if (highlightMatch && api.unlim?.highlightComponent) {
    const target = highlightMatch[1];
    const type = componentMap[target];
    if (type) {
      const layout = api.getLayout?.();
      if (layout?.components) {
        const ids = layout.components.filter((c) => c.type === type).map((c) => c.id);
        if (ids.length > 0) {
          api.unlim.highlightComponent(ids);
          executed.push('highlight:' + ids.join(','));
        }
      }
    }
  }

  // Undo / Redo
  if (/\b(annulla|undo)\b/.test(combined)) {
    api.undo?.();
    executed.push('undo');
  }
  if (/\b(ripeti|redo)\b/.test(combined)) {
    api.redo?.();
    executed.push('redo');
  }

  // Reset / clear
  if (/\b(pulisci|cancella tutto|reset|ricomincia)\b/.test(combined)) {
    api.clearAll?.();
    executed.push('clearall');
  }

  return executed;
}

/**
 * Vision trigger regex — extracted from useGalileoChat.js line ~611
 */
const visionPatterns =
  /\b(guarda|analizza|controlla|vedi|osserva|screenshot|foto|immagine)\b.*\b(circuito|schema|breadboard|simulatore|lavagna|mio)\b|\b(circuito|schema|breadboard)\b.*\b(guarda|analizza|controlla|vedi|osserva)\b/i;

// ══════════════════════════════════════════════
// Helper: create mock API
// ══════════════════════════════════════════════
function createMockApi(components = []) {
  return {
    play: vi.fn(),
    pause: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    clearAll: vi.fn(),
    getLayout: vi.fn(() => ({ components })),
    unlim: {
      highlightComponent: vi.fn(),
      clearHighlights: vi.fn(),
    },
  };
}

// ══════════════════════════════════════════════
// 1. IMPLICIT ACTION DETECTION (50 tests)
// ══════════════════════════════════════════════
describe('detectImplicitActions', () => {
  let api;

  beforeEach(() => {
    api = createMockApi([
      { id: 'led1', type: 'led' },
      { id: 'r1', type: 'resistor' },
      { id: 'btn1', type: 'push-button' },
      { id: 'pot1', type: 'potentiometer' },
      { id: 'batt1', type: 'battery9v' },
    ]);
  });

  // ── Play triggers ──
  describe('play actions', () => {
    it('"accendi" triggers play', () => {
      const result = detectImplicitActions('accendi il circuito', '', api);
      expect(result).toContain('play');
      expect(api.play).toHaveBeenCalled();
    });

    it('"avvia" triggers play', () => {
      const result = detectImplicitActions('avvia la simulazione', '', api);
      expect(result).toContain('play');
    });

    it('"fai partire" triggers play', () => {
      const result = detectImplicitActions('fai partire il circuito', '', api);
      expect(result).toContain('play');
    });

    it('"esegui" triggers play', () => {
      const result = detectImplicitActions('esegui il codice', '', api);
      expect(result).toContain('play');
    });

    it('"simula" triggers play', () => {
      const result = detectImplicitActions('simula il circuito', '', api);
      expect(result).toContain('play');
    });

    it('"prova" triggers play', () => {
      const result = detectImplicitActions('prova il circuito', '', api);
      expect(result).toContain('play');
    });

    it('"play" triggers play', () => {
      const result = detectImplicitActions('play', '', api);
      expect(result).toContain('play');
    });

    it('play in AI response triggers play', () => {
      const result = detectImplicitActions('cosa faccio?', 'Ora accendi il circuito', api);
      expect(result).toContain('play');
    });

    it('"non accendere" does NOT trigger play (negation)', () => {
      const result = detectImplicitActions('non accendere il circuito', '', api);
      expect(result).not.toContain('play');
    });

    it('"senza avviare" does NOT trigger play (negation)', () => {
      const result = detectImplicitActions('senza avviare la simulazione', '', api);
      expect(result).not.toContain('play');
    });

    it('"prima di eseguire" does NOT trigger play (negation)', () => {
      const result = detectImplicitActions('prima di eseguire il codice', '', api);
      expect(result).not.toContain('play');
    });
  });

  // ── Pause triggers ──
  describe('pause actions', () => {
    it('"ferma" triggers pause', () => {
      const result = detectImplicitActions('ferma la simulazione', '', api);
      expect(result).toContain('pause');
      expect(api.pause).toHaveBeenCalled();
    });

    it('"pausa" triggers pause', () => {
      const result = detectImplicitActions('metti in pausa', '', api);
      expect(result).toContain('pause');
    });

    it('"stop" triggers pause', () => {
      const result = detectImplicitActions('stop', '', api);
      expect(result).toContain('pause');
    });

    it('"spegni tutto" triggers pause', () => {
      const result = detectImplicitActions('spegni tutto', '', api);
      expect(result).toContain('pause');
    });

    it('pause does NOT trigger if play already triggered', () => {
      const result = detectImplicitActions('accendi e poi ferma', '', api);
      expect(result).toContain('play');
      expect(result).not.toContain('pause');
    });

    it('"ferma" in AI response triggers pause', () => {
      const result = detectImplicitActions('cosa succede?', 'Ferma la simulazione prima', api);
      expect(result).toContain('pause');
    });
  });

  // ── Highlight triggers ──
  describe('highlight actions', () => {
    it('"evidenzia il LED" highlights LED components', () => {
      const result = detectImplicitActions('evidenzia il led', '', api);
      expect(result).toContain('highlight:led1');
      expect(api.unlim.highlightComponent).toHaveBeenCalledWith(['led1']);
    });

    it('"mostra il resistore" highlights resistors', () => {
      const result = detectImplicitActions('mostra il resistore', '', api);
      expect(result).toContain('highlight:r1');
    });

    it('"indica la resistenza" highlights resistors (alias)', () => {
      const result = detectImplicitActions('indica la resistenza', '', api);
      expect(result).toContain('highlight:r1');
    });

    it('"seleziona il pulsante" highlights push-buttons', () => {
      const result = detectImplicitActions('seleziona il pulsante', '', api);
      expect(result).toContain('highlight:btn1');
    });

    it('"evidenzia il potenziometro" highlights potentiometers', () => {
      const result = detectImplicitActions('evidenzia il potenziometro', '', api);
      expect(result).toContain('highlight:pot1');
    });

    it('"mostra la batteria" highlights batteries', () => {
      const result = detectImplicitActions('mostra la batteria', '', api);
      expect(result).toContain('highlight:batt1');
    });

    it('highlight with article "lo" — unknown component yields no highlight', () => {
      const result = detectImplicitActions('mostra lo schema', '', api);
      expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
    });

    it('highlight for unknown component yields no highlight action', () => {
      const result = detectImplicitActions('evidenzia il transistor', '', api);
      expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
    });

    it('highlight when no components of that type exist yields no highlight', () => {
      const emptyApi = createMockApi([]);
      const result = detectImplicitActions('evidenzia il led', '', emptyApi);
      expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
    });

    it('highlight multiple LEDs lists all IDs', () => {
      const multiApi = createMockApi([
        { id: 'led1', type: 'led' },
        { id: 'led2', type: 'led' },
        { id: 'led3', type: 'led' },
      ]);
      const result = detectImplicitActions('evidenzia il led', '', multiApi);
      expect(result).toContain('highlight:led1,led2,led3');
    });
  });

  // ── Undo / Redo ──
  describe('undo/redo actions', () => {
    it('"annulla" triggers undo', () => {
      const result = detectImplicitActions('annulla', '', api);
      expect(result).toContain('undo');
      expect(api.undo).toHaveBeenCalled();
    });

    it('"undo" triggers undo', () => {
      const result = detectImplicitActions('undo', '', api);
      expect(result).toContain('undo');
    });

    it('"ripeti" triggers redo', () => {
      const result = detectImplicitActions('ripeti', '', api);
      expect(result).toContain('redo');
      expect(api.redo).toHaveBeenCalled();
    });

    it('"redo" triggers redo', () => {
      const result = detectImplicitActions('redo', '', api);
      expect(result).toContain('redo');
    });
  });

  // ── Clear / reset ──
  describe('clear actions', () => {
    it('"pulisci" triggers clearall', () => {
      const result = detectImplicitActions('pulisci la lavagna', '', api);
      expect(result).toContain('clearall');
      expect(api.clearAll).toHaveBeenCalled();
    });

    it('"cancella tutto" triggers clearall', () => {
      const result = detectImplicitActions('cancella tutto', '', api);
      expect(result).toContain('clearall');
    });

    it('"reset" triggers clearall', () => {
      const result = detectImplicitActions('reset', '', api);
      expect(result).toContain('clearall');
    });

    it('"ricomincia" triggers clearall', () => {
      const result = detectImplicitActions('ricomincia da zero', '', api);
      expect(result).toContain('clearall');
    });
  });

  // ── Questions should NOT trigger actions ──
  describe('questions do NOT trigger actions', () => {
    it('"il LED non va" should not trigger play', () => {
      const result = detectImplicitActions('il LED non va', '', api);
      expect(result).not.toContain('play');
    });

    it('"perche non funziona?" should not trigger anything', () => {
      const result = detectImplicitActions('perche non funziona?', '', api);
      expect(result).toHaveLength(0);
    });

    it('"cosa fa un resistore?" should not trigger highlight', () => {
      const result = detectImplicitActions('cosa fa un resistore?', '', api);
      expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
    });

    it('"il circuito non si accende" should not trigger play (negation)', () => {
      const result = detectImplicitActions('il circuito non si accende', '', api);
      expect(result).not.toContain('play');
    });

    it('"spiegami il potenziometro" should not trigger highlight', () => {
      const result = detectImplicitActions('spiegami il potenziometro', '', api);
      expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
    });
  });

  // ── Explicit tags skip fallback ──
  describe('explicit tags bypass', () => {
    it('AI response with [azione:play] skips implicit detection', () => {
      const result = detectImplicitActions('accendi', '[azione:play]', api);
      expect(result).toHaveLength(0);
    });

    it('AI response with [AZIONE:pause] skips implicit detection', () => {
      const result = detectImplicitActions('ferma', '[AZIONE:pause]', api);
      expect(result).toHaveLength(0);
    });

    it('AI response with [INTENT:{...}] skips implicit detection', () => {
      const result = detectImplicitActions('accendi', '[INTENT:{"action":"play"}]', api);
      expect(result).toHaveLength(0);
    });
  });

  // ── No API ──
  describe('no API fallback', () => {
    it('returns empty array when api is null', () => {
      const result = detectImplicitActions('accendi', '', null);
      expect(result).toEqual([]);
    });

    it('returns empty array when api is undefined', () => {
      const result = detectImplicitActions('accendi', '', undefined);
      expect(result).toEqual([]);
    });
  });

  // ── Mixed / compound ──
  describe('mixed messages', () => {
    it('"accendi e poi fermalo" triggers play (first wins, pause blocked)', () => {
      const result = detectImplicitActions('accendi e poi fermalo', '', api);
      expect(result).toContain('play');
      expect(result).not.toContain('pause');
    });

    it('multiple actions can co-exist (play + undo)', () => {
      const result = detectImplicitActions('accendi e annulla', '', api);
      expect(result).toContain('play');
      expect(result).toContain('undo');
    });

    it('play + clearall can co-exist', () => {
      const result = detectImplicitActions('accendi e poi pulisci', '', api);
      expect(result).toContain('play');
      expect(result).toContain('clearall');
    });
  });
});

// ══════════════════════════════════════════════
// 2. VISION TRIGGER PATTERNS (20 tests)
// ══════════════════════════════════════════════
describe('visionPatterns regex', () => {
  // ── Should match ──
  describe('valid vision triggers', () => {
    it('"guarda il mio circuito" matches', () => {
      expect(visionPatterns.test('guarda il mio circuito')).toBe(true);
    });

    it('"analizza la breadboard" matches', () => {
      expect(visionPatterns.test('analizza la breadboard')).toBe(true);
    });

    it('"controlla il simulatore" matches', () => {
      expect(visionPatterns.test('controlla il simulatore')).toBe(true);
    });

    it('"vedi il circuito" matches', () => {
      expect(visionPatterns.test('vedi il circuito')).toBe(true);
    });

    it('"osserva lo schema" matches', () => {
      expect(visionPatterns.test('osserva lo schema')).toBe(true);
    });

    it('"guarda la lavagna" matches', () => {
      expect(visionPatterns.test('guarda la lavagna')).toBe(true);
    });

    it('"fai uno screenshot del circuito" matches', () => {
      expect(visionPatterns.test('fai uno screenshot del circuito')).toBe(true);
    });

    it('"foto del mio circuito" matches', () => {
      expect(visionPatterns.test('foto del mio circuito')).toBe(true);
    });

    it('"immagine della breadboard" matches', () => {
      expect(visionPatterns.test('immagine della breadboard')).toBe(true);
    });

    it('reversed order: "il circuito guarda" matches', () => {
      expect(visionPatterns.test('il circuito guarda')).toBe(true);
    });

    it('reversed: "la breadboard analizza" matches', () => {
      expect(visionPatterns.test('la breadboard analizza')).toBe(true);
    });

    it('"guarda il mio" matches (mio keyword)', () => {
      expect(visionPatterns.test('guarda il mio')).toBe(true);
    });

    it('case insensitive: "GUARDA IL CIRCUITO" matches', () => {
      expect(visionPatterns.test('GUARDA IL CIRCUITO')).toBe(true);
    });
  });

  // ── Should NOT match ──
  describe('invalid vision triggers', () => {
    it('"guarda che bello" does NOT match (no circuit reference)', () => {
      expect(visionPatterns.test('guarda che bello')).toBe(false);
    });

    it('"il circuito non funziona" does NOT match (no visual verb)', () => {
      expect(visionPatterns.test('il circuito non funziona')).toBe(false);
    });

    it('"accendi il circuito" does NOT match (accendi is not a vision verb)', () => {
      expect(visionPatterns.test('accendi il circuito')).toBe(false);
    });

    it('"il LED non si accende" does NOT match', () => {
      expect(visionPatterns.test('il LED non si accende')).toBe(false);
    });

    it('"come funziona un resistore?" does NOT match', () => {
      expect(visionPatterns.test('come funziona un resistore?')).toBe(false);
    });

    it('empty string does NOT match', () => {
      expect(visionPatterns.test('')).toBe(false);
    });

    it('"guarda" alone does NOT match (no target)', () => {
      expect(visionPatterns.test('guarda')).toBe(false);
    });
  });
});

// ══════════════════════════════════════════════
// 3. COMPONENT NAME MAPPING (15 tests)
// ══════════════════════════════════════════════
describe('componentMap Italian-to-English mapping', () => {
  it('"led" maps to "led"', () => {
    expect(componentMap.led).toBe('led');
  });

  it('"resistore" maps to "resistor"', () => {
    expect(componentMap.resistore).toBe('resistor');
  });

  it('"resistenza" maps to "resistor" (alias)', () => {
    expect(componentMap.resistenza).toBe('resistor');
  });

  it('"pulsante" maps to "push-button"', () => {
    expect(componentMap.pulsante).toBe('push-button');
  });

  it('"buzzer" maps to "buzzer-piezo"', () => {
    expect(componentMap.buzzer).toBe('buzzer-piezo');
  });

  it('"potenziometro" maps to "potentiometer"', () => {
    expect(componentMap.potenziometro).toBe('potentiometer');
  });

  it('"batteria" maps to "battery9v"', () => {
    expect(componentMap.batteria).toBe('battery9v');
  });

  it('"ldr" maps to "photo-resistor"', () => {
    expect(componentMap.ldr).toBe('photo-resistor');
  });

  it('"fotoresistenza" maps to "photo-resistor"', () => {
    expect(componentMap.fotoresistenza).toBe('photo-resistor');
  });

  it('"transistor" is NOT in the map', () => {
    expect(componentMap.transistor).toBeUndefined();
  });

  it('"motore" is NOT in the map', () => {
    expect(componentMap.motore).toBeUndefined();
  });

  it('"condensatore" is NOT in the map', () => {
    expect(componentMap.condensatore).toBeUndefined();
  });

  it('"diodo" is NOT in the map', () => {
    expect(componentMap.diodo).toBeUndefined();
  });

  it('map has exactly 9 entries', () => {
    expect(Object.keys(componentMap)).toHaveLength(9);
  });

  it('all mapped values are non-empty strings', () => {
    for (const [, val] of Object.entries(componentMap)) {
      expect(typeof val).toBe('string');
      expect(val.length).toBeGreaterThan(0);
    }
  });
});

// ══════════════════════════════════════════════
// 4. EDGE CASES (15 tests)
// ══════════════════════════════════════════════
describe('edge cases', () => {
  let api;

  beforeEach(() => {
    api = createMockApi([{ id: 'led1', type: 'led' }]);
  });

  it('empty user message and empty AI response returns empty', () => {
    const result = detectImplicitActions('', '', api);
    expect(result).toEqual([]);
  });

  it('empty user message with action in AI response works', () => {
    const result = detectImplicitActions('', 'accendi il circuito', api);
    expect(result).toContain('play');
  });

  it('very long input (10000 chars) does not throw', () => {
    const longInput = 'a'.repeat(10000);
    expect(() => detectImplicitActions(longInput, '', api)).not.toThrow();
  });

  it('very long input returns empty (no keywords)', () => {
    const longInput = 'a'.repeat(10000);
    const result = detectImplicitActions(longInput, '', api);
    expect(result).toEqual([]);
  });

  it('input with emoji does not break detection', () => {
    const result = detectImplicitActions('accendi il circuito \uD83D\uDD25\uD83D\uDE80', '', api);
    expect(result).toContain('play');
  });

  it('input with only emoji returns empty', () => {
    const result = detectImplicitActions('\uD83D\uDD25\uD83D\uDE80\uD83D\uDCA1', '', api);
    expect(result).toEqual([]);
  });

  it('input with special characters does not throw', () => {
    expect(() => detectImplicitActions('accendi!!! @#$%^&*()', '', api)).not.toThrow();
  });

  it('input with newlines detects actions', () => {
    const result = detectImplicitActions('ciao\naccendi\nil circuito', '', api);
    expect(result).toContain('play');
  });

  it('input with tabs detects actions', () => {
    const result = detectImplicitActions('accendi\til\tcircuito', '', api);
    expect(result).toContain('play');
  });

  it('case insensitive: "ACCENDI" triggers play', () => {
    const result = detectImplicitActions('ACCENDI IL CIRCUITO', '', api);
    expect(result).toContain('play');
  });

  it('case insensitive: "Evidenzia Il Led" triggers highlight', () => {
    const result = detectImplicitActions('Evidenzia Il Led', '', api);
    expect(result).toContain('highlight:led1');
  });

  it('partial word "accendino" does NOT trigger play (word boundary)', () => {
    const result = detectImplicitActions('ho un accendino', '', api);
    expect(result).not.toContain('play');
  });

  it('number-only input returns empty', () => {
    const result = detectImplicitActions('12345', '', api);
    expect(result).toEqual([]);
  });

  it('HTML-like input does not throw', () => {
    expect(() => detectImplicitActions('<script>alert("accendi")</script>', '', api)).not.toThrow();
  });

  it('vision regex with very long input does not throw', () => {
    const longInput = 'x'.repeat(50000) + ' guarda il circuito';
    expect(() => visionPatterns.test(longInput)).not.toThrow();
    expect(visionPatterns.test(longInput)).toBe(true);
  });

  it('highlight without unlim.highlightComponent skips gracefully', () => {
    const noUnlimApi = { ...createMockApi([{ id: 'led1', type: 'led' }]), unlim: null };
    const result = detectImplicitActions('evidenzia il led', '', noUnlimApi);
    expect(result.filter((a) => a.startsWith('highlight:'))).toHaveLength(0);
  });

  it('undo and redo in same message both trigger', () => {
    const result = detectImplicitActions('annulla e poi ripeti', '', api);
    expect(result).toContain('undo');
    expect(result).toContain('redo');
  });
});
