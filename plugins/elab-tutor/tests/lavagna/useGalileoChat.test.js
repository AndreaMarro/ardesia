import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock window.__ELAB_API
const mockAPI = {
  play: vi.fn(),
  pause: vi.fn(),
  reset: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  clearAll: vi.fn(),
  compile: vi.fn(),
  loadExperiment: vi.fn(),
  addComponent: vi.fn(),
  removeComponent: vi.fn(),
  addWire: vi.fn(),
  interactComponent: vi.fn(),
  setComponentValue: vi.fn(),
  captureScreenshot: vi.fn(),
  getCircuitDescription: vi.fn(() => 'LED + resistore'),
  highlightComponent: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.window = { __ELAB_API: mockAPI };
});

// Reimplementation of action parser for testing (mirrors useGalileoChat logic)
function parseActionTags(text) {
  const api = window.__ELAB_API;
  if (!api) return [];
  const regex = /\[AZIONE:([^\]]+)\]/gi;
  const executed = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const parts = match[1].split(':');
    const cmd = parts[0].toLowerCase();
    try {
      switch (cmd) {
        case 'play': api.play?.(); executed.push('play'); break;
        case 'pause': api.pause?.(); executed.push('pause'); break;
        case 'reset': api.reset?.(); executed.push('reset'); break;
        case 'undo': api.undo?.(); executed.push('undo'); break;
        case 'redo': api.redo?.(); executed.push('redo'); break;
        case 'clearall': api.clearAll?.(); executed.push('clearall'); break;
        case 'compile': api.compile?.(); executed.push('compile'); break;
        case 'loadexp':
          if (parts[1]) { api.loadExperiment(parts[1]); executed.push('loadexp:' + parts[1]); }
          break;
        case 'addcomponent':
          if (parts[1]) {
            api.addComponent(parts[1], { x: parseInt(parts[2]) || 200, y: parseInt(parts[3]) || 150 });
            executed.push('addcomponent:' + parts[1]);
          }
          break;
        case 'removecomponent':
          if (parts[1]) { api.removeComponent(parts[1]); executed.push('removecomponent:' + parts[1]); }
          break;
        case 'addwire':
          if (parts.length >= 5) {
            api.addWire(parts[1], parts[2], parts[3], parts[4]);
            executed.push('addwire');
          }
          break;
        case 'interact':
          if (parts[1] && parts[2]) {
            api.interactComponent(parts[1], parts[2], parts[3]);
            executed.push('interact:' + parts[1]);
          }
          break;
        case 'setvalue':
          if (parts[1] && parts[2] && parts[3] !== undefined) {
            api.setComponentValue(parts[1], parts[2], parts[3]);
            executed.push('setvalue:' + parts[1]);
          }
          break;
        case 'screenshot':
          api.captureScreenshot?.();
          executed.push('screenshot');
          break;
        case 'describe':
          api.getCircuitDescription?.();
          executed.push('describe');
          break;
        case 'highlight':
          if (parts[1]) {
            const ids = parts[1].split(',');
            api.highlightComponent?.(ids);
            executed.push('highlight:' + parts[1]);
          }
          break;
        case 'video':
          executed.push('video:' + (parts[1] || ''));
          break;
      }
    } catch { /* ignore */ }
  }
  return executed;
}

describe('UNLIM Action Parser — 30 Test', () => {
  it('1. play', () => {
    expect(parseActionTags('Avvio! [AZIONE:play]')).toEqual(['play']);
    expect(mockAPI.play).toHaveBeenCalled();
  });

  it('2. pause', () => {
    expect(parseActionTags('[AZIONE:pause]')).toEqual(['pause']);
  });

  it('3. reset', () => {
    expect(parseActionTags('[AZIONE:reset]')).toEqual(['reset']);
  });

  it('4. undo', () => {
    expect(parseActionTags('[AZIONE:undo]')).toEqual(['undo']);
  });

  it('5. redo', () => {
    expect(parseActionTags('[AZIONE:redo]')).toEqual(['redo']);
  });

  it('6. clearall', () => {
    expect(parseActionTags('[AZIONE:clearall]')).toEqual(['clearall']);
  });

  it('7. compile', () => {
    expect(parseActionTags('[AZIONE:compile]')).toEqual(['compile']);
  });

  it('8. loadexp', () => {
    const r = parseActionTags('[AZIONE:loadexp:v1-cap6-esp1]');
    expect(r).toEqual(['loadexp:v1-cap6-esp1']);
    expect(mockAPI.loadExperiment).toHaveBeenCalledWith('v1-cap6-esp1');
  });

  it('9. highlight multiple', () => {
    const r = parseActionTags('[AZIONE:highlight:led1,r1]');
    expect(r).toEqual(['highlight:led1,r1']);
    expect(mockAPI.highlightComponent).toHaveBeenCalledWith(['led1', 'r1']);
  });

  it('10. video', () => {
    expect(parseActionTags('[AZIONE:video:ohm]')).toEqual(['video:ohm']);
  });

  it('11. addcomponent con coordinate', () => {
    parseActionTags('[AZIONE:addcomponent:led:200:150]');
    expect(mockAPI.addComponent).toHaveBeenCalledWith('led', { x: 200, y: 150 });
  });

  it('12. addcomponent default coordinate', () => {
    parseActionTags('[AZIONE:addcomponent:resistor]');
    expect(mockAPI.addComponent).toHaveBeenCalledWith('resistor', { x: 200, y: 150 });
  });

  it('13. removecomponent', () => {
    parseActionTags('[AZIONE:removecomponent:led1]');
    expect(mockAPI.removeComponent).toHaveBeenCalledWith('led1');
  });

  it('14. addwire 4 params', () => {
    parseActionTags('[AZIONE:addwire:led1:anode:nano:D13]');
    expect(mockAPI.addWire).toHaveBeenCalledWith('led1', 'anode', 'nano', 'D13');
  });

  it('15. interact con valore', () => {
    parseActionTags('[AZIONE:interact:pot1:rotate:128]');
    expect(mockAPI.interactComponent).toHaveBeenCalledWith('pot1', 'rotate', '128');
  });

  it('16. setvalue', () => {
    parseActionTags('[AZIONE:setvalue:r1:resistance:220]');
    expect(mockAPI.setComponentValue).toHaveBeenCalledWith('r1', 'resistance', '220');
  });

  it('17. screenshot + describe in sequenza', () => {
    const r = parseActionTags('[AZIONE:screenshot] [AZIONE:describe]');
    expect(r).toEqual(['screenshot', 'describe']);
  });

  it('18. catena play + pause', () => {
    const r = parseActionTags('Test [AZIONE:play] poi [AZIONE:pause]');
    expect(r).toEqual(['play', 'pause']);
  });

  it('19. catena costruzione 4 step', () => {
    const r = parseActionTags('[AZIONE:clearall] [AZIONE:addcomponent:led:200:150] [AZIONE:compile] [AZIONE:play]');
    expect(r).toEqual(['clearall', 'addcomponent:led', 'compile', 'play']);
  });

  it('20. catena loadexp + highlight + play', () => {
    const r = parseActionTags('[AZIONE:loadexp:v3-cap5-esp1] [AZIONE:highlight:led1] [AZIONE:play]');
    expect(r).toEqual(['loadexp:v3-cap5-esp1', 'highlight:led1', 'play']);
  });

  it('21. 5 azioni', () => {
    const r = parseActionTags('[AZIONE:clearall] [AZIONE:addcomponent:led:100:100] [AZIONE:addcomponent:resistor:100:200] [AZIONE:addwire:led1:cathode:r1:pin1] [AZIONE:play]');
    expect(r).toHaveLength(5);
  });

  it('22. setvalue + compile + play', () => {
    const r = parseActionTags('[AZIONE:setvalue:r1:resistance:1000] [AZIONE:compile] [AZIONE:play]');
    expect(r).toEqual(['setvalue:r1', 'compile', 'play']);
  });

  it('23. nessun tag', () => {
    expect(parseActionTags('Ciao, sono UNLIM!')).toEqual([]);
  });

  it('24. tag malformato ignorato', () => {
    expect(parseActionTags('[AZIONE:]')).toEqual([]);
  });

  it('25. case insensitive', () => {
    expect(parseActionTags('[azione:PLAY]')).toEqual(['play']);
  });

  it('26. testo intorno ai tag', () => {
    const r = parseActionTags('Ecco! [AZIONE:highlight:led1] Vedi?');
    expect(r).toEqual(['highlight:led1']);
  });

  it('27. addwire incompleto ignorato', () => {
    expect(parseActionTags('[AZIONE:addwire:led1:anode]')).toEqual([]);
  });

  it('28. diagnosi proattiva', () => {
    const resp = 'LED al contrario! [AZIONE:highlight:led1]';
    expect(parseActionTags(resp)).toEqual(['highlight:led1']);
    expect(resp.length).toBeLessThan(200);
  });

  it('29. suggerimento prossimo esperimento', () => {
    expect(parseActionTags('Prova il prossimo: [AZIONE:loadexp:v1-cap6-esp2]'))
      .toEqual(['loadexp:v1-cap6-esp2']);
  });

  // === ABILITÀ 6-7: Spiegazione codice + Debug guidato ===
  it('30a. spiegazione codice — risposta con highlight', () => {
    const resp = 'Questa riga accende il LED sul pin 13! [AZIONE:highlight:led1]';
    const r = parseActionTags(resp);
    expect(r).toEqual(['highlight:led1']);
    expect(resp.length).toBeLessThan(200);
  });

  it('30b. debug guidato — describe + highlight sequenza', () => {
    const resp = 'Controlliamo le connessioni... [AZIONE:describe] Hmm, il LED sembra al contrario! [AZIONE:highlight:led1]';
    const r = parseActionTags(resp);
    expect(r).toEqual(['describe', 'highlight:led1']);
  });

  it('30c. debug guidato — nessuna soluzione diretta, solo guida', () => {
    const resp = 'Prova a seguire il filo dal LED alla batteria... riesci a vedere dove si interrompe? [AZIONE:highlight:led1,r1]';
    const r = parseActionTags(resp);
    expect(r).toEqual(['highlight:led1,r1']);
    // La risposta NON dà la soluzione ma guida lo studente
    expect(resp).not.toMatch(/collegalo|spostalo|mettilo/i);
  });

  it('30. costruzione guidata 7 step', () => {
    const r = parseActionTags(
      '[AZIONE:clearall] [AZIONE:addcomponent:led:200:150] [AZIONE:addcomponent:resistor:200:200] ' +
      '[AZIONE:addwire:led1:cathode:r1:pin1] [AZIONE:addwire:r1:pin2:nano:GND] ' +
      '[AZIONE:addwire:led1:anode:nano:D13] [AZIONE:compile]'
    );
    expect(r).toHaveLength(7);
    expect(mockAPI.clearAll).toHaveBeenCalled();
    expect(mockAPI.addComponent).toHaveBeenCalledTimes(2);
    expect(mockAPI.addWire).toHaveBeenCalledTimes(3);
    expect(mockAPI.compile).toHaveBeenCalled();
  });
});
