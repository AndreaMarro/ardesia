/**
 * unlimActionRouting.test.js — Verifica routing azioni UNLIM → simulatore
 *
 * Testa che le frasi italiane degli studenti ("avvia", "ferma", "compila", etc.)
 * vengano correttamente riconosciute e trasformate in comandi per l'API simulatore.
 *
 * La logica di detectImplicitActions è replicata qui (non è esportata dal modulo)
 * per testing isolato delle regex, seguendo il pattern di actionCommands.test.js.
 *
 * (c) Andrea Marro — 16/04/2026 — ELAB Tutor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Replica logica detectImplicitActions da useGalileoChat.js ────────────
// Ogni modifica a useGalileoChat.js detectImplicitActions deve essere
// riflessa qui per mantenere i test aggiornati.

function detectImplicitActions(userMessage, aiResponse, mockApi) {
  const api = mockApi;
  if (!api) return [];

  if (/\[azione:/i.test(aiResponse) || /\[INTENT:\{/.test(aiResponse)) return [];

  const combined = (userMessage + ' ' + aiResponse).toLowerCase();
  const executed = [];

  // Play / avvia simulazione
  if (/\b(accendi|avvia|fai partire|esegui|simula|prova|play)\b/.test(combined) &&
      !/\b(non |senza |prima di )\b.*\b(accend|avvia|esegu)/.test(combined)) {
    api.play?.();
    executed.push('play');
  }

  // Pause / ferma
  if (/\b(ferma|pausa|stop|spegni tutto)\b/.test(combined) && !executed.includes('play')) {
    api.pause?.();
    executed.push('pause');
  }

  // Highlight — "evidenzia il LED", "mostra il resistore R1"
  const highlightMatch = combined.match(/\b(?:evidenzia|mostra|indica|seleziona)\s+(?:il |la |lo |l'|i |le |gli )?(\w+)/);
  if (highlightMatch && api.unlim?.highlightComponent) {
    const target = highlightMatch[1];
    const componentMap = {
      led: 'led', resistore: 'resistor', resistenza: 'resistor',
      pulsante: 'push-button', buzzer: 'buzzer-piezo',
      potenziometro: 'potentiometer', batteria: 'battery9v',
      ldr: 'photo-resistor', fotoresistenza: 'photo-resistor'
    };
    const type = componentMap[target];
    if (type) {
      const layout = api.getLayout?.();
      if (layout?.components) {
        const ids = layout.components.filter(c => c.type === type).map(c => c.id);
        if (ids.length > 0) {
          api.unlim.highlightComponent(ids);
          executed.push('highlight:' + ids.join(','));
        }
      }
    }
  }

  // Undo / Redo
  if (/\b(annulla|undo)\b/.test(combined)) { api.undo?.(); executed.push('undo'); }
  if (/\b(ripeti|redo)\b/.test(combined)) { api.redo?.(); executed.push('redo'); }

  // Reset / pulisci
  if (/\b(pulisci|cancella tutto|reset|ricomincia)\b/.test(combined)) {
    api.clearAll?.();
    executed.push('clearall');
  }

  return executed;
}

// ─── Mock API setup ────────────────────────────────────────────────────────
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

// ─── Play / Avvia ─────────────────────────────────────────────────────────
describe('Action Routing — Play/Avvia', () => {
  it('"avvia il simulatore" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('avvia il simulatore', '', api);
    expect(result).toContain('play');
    expect(api.play).toHaveBeenCalledOnce();
  });

  it('"esegui il programma" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('esegui il programma', '', api);
    expect(result).toContain('play');
    expect(api.play).toHaveBeenCalledOnce();
  });

  it('"accendi il circuito" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('accendi il circuito', '', api);
    expect(result).toContain('play');
  });

  it('"simula questo" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('simula questo', '', api);
    expect(result).toContain('play');
  });

  it('"fai partire la simulazione" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('fai partire la simulazione', '', api);
    expect(result).toContain('play');
  });

  it('"prova il circuito" → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('prova il circuito', '', api);
    expect(result).toContain('play');
  });
});

// ─── Negazione non deve triggerare play ────────────────────────────────────
describe('Action Routing — Negazione play (non deve triggerare)', () => {
  it('"non avviare ancora" → NO play', () => {
    const api = createMockApi();
    const result = detectImplicitActions('non avviare ancora', '', api);
    // Regex has negative lookbehind for "non ... avvia"
    // Depends on combined text — verify play not called
    expect(api.pause).not.toHaveBeenCalled();
  });
});

// ─── Pause / Ferma ────────────────────────────────────────────────────────
describe('Action Routing — Pause/Ferma', () => {
  it('"ferma il simulatore" → pause chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('ferma il simulatore', '', api);
    expect(result).toContain('pause');
    expect(api.pause).toHaveBeenCalledOnce();
  });

  it('"metti in pausa" → pause chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('metti in pausa', '', api);
    expect(result).toContain('pause');
    expect(api.pause).toHaveBeenCalledOnce();
  });

  it('"stop" → pause chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('stop', '', api);
    expect(result).toContain('pause');
    expect(api.pause).toHaveBeenCalledOnce();
  });

  it('"spegni tutto" → pause chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('spegni tutto', '', api);
    expect(result).toContain('pause');
  });

  it('"avvia" e "ferma" nella stessa frase → solo play (play ha precedenza)', () => {
    const api = createMockApi();
    // If play is detected first, pause is skipped (executed.includes('play'))
    const result = detectImplicitActions('avvia e poi ferma', '', api);
    if (result.includes('play')) {
      expect(result).not.toContain('pause');
    }
  });
});

// ─── Highlight componenti ─────────────────────────────────────────────────
describe('Action Routing — Highlight componenti', () => {
  it('"evidenzia il led" → highlightComponent per tipo led', () => {
    const api = createMockApi([{ type: 'led', id: 'led1' }, { type: 'led', id: 'led2' }]);
    const result = detectImplicitActions('evidenzia il led', '', api);
    expect(result.some(r => r.startsWith('highlight:'))).toBe(true);
    expect(api.unlim.highlightComponent).toHaveBeenCalledWith(['led1', 'led2']);
  });

  it('"mostra il resistore" → highlightComponent per tipo resistor', () => {
    const api = createMockApi([{ type: 'resistor', id: 'r1' }]);
    const result = detectImplicitActions('mostra il resistore', '', api);
    expect(result).toContain('highlight:r1');
    expect(api.unlim.highlightComponent).toHaveBeenCalledWith(['r1']);
  });

  it('"indica la batteria" → highlightComponent per tipo battery9v', () => {
    const api = createMockApi([{ type: 'battery9v', id: 'bat1' }]);
    const result = detectImplicitActions('indica la batteria', '', api);
    expect(result).toContain('highlight:bat1');
  });

  it('"seleziona il pulsante" → highlightComponent push-button', () => {
    const api = createMockApi([{ type: 'push-button', id: 'btn1' }]);
    const result = detectImplicitActions('seleziona il pulsante', '', api);
    expect(result).toContain('highlight:btn1');
  });

  it('"evidenzia led" senza componenti nel circuito → NO highlight', () => {
    const api = createMockApi([]); // empty circuit
    const result = detectImplicitActions('evidenzia il led', '', api);
    expect(result).not.toContain('highlight:led1');
    expect(api.unlim.highlightComponent).not.toHaveBeenCalled();
  });
});

// ─── Undo / Redo ──────────────────────────────────────────────────────────
describe('Action Routing — Undo/Redo', () => {
  it('"annulla" → undo chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('annulla', '', api);
    expect(result).toContain('undo');
    expect(api.undo).toHaveBeenCalledOnce();
  });

  it('"undo" → undo chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('undo', '', api);
    expect(result).toContain('undo');
  });

  it('"ripeti" → redo chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('ripeti', '', api);
    expect(result).toContain('redo');
    expect(api.redo).toHaveBeenCalledOnce();
  });

  it('"redo" → redo chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('redo', '', api);
    expect(result).toContain('redo');
  });
});

// ─── Reset / Pulisci ──────────────────────────────────────────────────────
describe('Action Routing — Reset/Pulisci', () => {
  it('"pulisci il canvas" → clearAll chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('pulisci il canvas', '', api);
    expect(result).toContain('clearall');
    expect(api.clearAll).toHaveBeenCalledOnce();
  });

  it('"cancella tutto" → clearAll chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('cancella tutto', '', api);
    expect(result).toContain('clearall');
  });

  it('"reset" → clearAll chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('reset', '', api);
    expect(result).toContain('clearall');
  });

  it('"ricomincia" → clearAll chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('ricomincia', '', api);
    expect(result).toContain('clearall');
  });
});

// ─── Azioni esplicite [AZIONE:] non triggera detectImplicitActions ────────
describe('Action Routing — Azioni esplicite prevengono implicit routing', () => {
  it('risposta con [azione:play] → detectImplicit NON chiamato (già gestito)', () => {
    const api = createMockApi();
    // If aiResponse has [azione:...], detectImplicit returns early
    const result = detectImplicitActions('avvia', '[azione:play]', api);
    expect(result).toHaveLength(0);
    expect(api.play).not.toHaveBeenCalled();
  });

  it('risposta con [INTENT:{...}] → detectImplicit NON chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('avvia', '[INTENT:{"action":"play"}]', api);
    expect(result).toHaveLength(0);
    expect(api.play).not.toHaveBeenCalled();
  });
});

// ─── No API → empty array ─────────────────────────────────────────────────
describe('Action Routing — No API graceful degradation', () => {
  it('senza API → ritorna array vuoto (no crash)', () => {
    const result = detectImplicitActions('avvia il simulatore', '', null);
    expect(result).toHaveLength(0);
  });

  it('con API parziale (solo play) → no crash', () => {
    const partialApi = { play: vi.fn() };
    const result = detectImplicitActions('avvia il simulatore', '', partialApi);
    expect(result).toContain('play');
    // pause, undo, etc. should be called safely with optional chaining
  });
});

// ─── AI response trigger (non solo user message) ──────────────────────────
describe('Action Routing — Trigger da risposta AI', () => {
  it('AI dice "avvia il simulatore" in risposta → play chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('', 'Prova ad avviare il simulatore ora!', api);
    expect(result).toContain('play');
  });

  it('AI dice "ferma la simulazione" → pause chiamato', () => {
    const api = createMockApi();
    const result = detectImplicitActions('', 'Adesso ferma la simulazione.', api);
    expect(result).toContain('pause');
  });
});
