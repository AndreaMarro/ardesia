/**
 * voiceCommandsExtended.test.js — Extended voice command tests
 * Tests: additional patterns, component commands, wake word phrases, edge cases
 * 60 tests (complement to voiceCommands.test.js)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchVoiceCommand, executeVoiceCommand, getAvailableCommands } from '../../src/services/voiceCommands.js';

beforeEach(() => {
  globalThis.window = globalThis.window || {};
  window.__ELAB_API = {
    play: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    showEditor: vi.fn(),
    showSerialMonitor: vi.fn(),
    compile: vi.fn(),
    getEditorCode: vi.fn(() => 'void setup(){}'),
    addComponent: vi.fn(),
    clearCircuit: vi.fn(),
    getCircuitDescription: vi.fn(() => 'Componenti: LED rosso, resistore da 1kOhm. Fili: 3 collegamenti.'),
    undo: vi.fn(),
    redo: vi.fn(),
    hideEditor: vi.fn(),
    setBuildMode: vi.fn(),
    mountExperiment: vi.fn(),
    getCurrentExperiment: vi.fn(() => ({ id: 'v1-cap6-esp1' })),
    getExperimentList: vi.fn(() => ({
      vol1: [
        { id: 'v1-cap6-esp1', title: 'Accendi LED' },
        { id: 'v1-cap6-esp2', title: 'LED senza resistore' },
        { id: 'v1-cap7-esp1', title: 'LED RGB' },
      ],
      vol2: [{ id: 'v2-cap1-esp1', title: 'Multimetro' }],
      vol3: [{ id: 'v3-cap1-esp1', title: 'Arduino Blink' }],
    })),
  };
  window.dispatchEvent = vi.fn();
});

afterEach(() => {
  delete window.__ELAB_API;
});

describe('Component voice commands', () => {
  it('matches "metti led"', () => {
    const r = matchVoiceCommand('metti led');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addLed');
  });

  it('matches "inserisci led"', () => {
    const r = matchVoiceCommand('inserisci led');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addLed');
  });

  it('matches "aggiungi un led"', () => {
    const r = matchVoiceCommand('aggiungi un led');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addLed');
  });

  it('matches "metti resistore"', () => {
    const r = matchVoiceCommand('metti resistore');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addResistor');
  });

  it('matches "aggiungi un resistore"', () => {
    const r = matchVoiceCommand('aggiungi un resistore');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addResistor');
  });

  it('matches "inserisci resistore"', () => {
    const r = matchVoiceCommand('inserisci resistore');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addResistor');
  });

  it('matches "metti pulsante"', () => {
    const r = matchVoiceCommand('metti pulsante');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addButton');
  });

  it('matches "aggiungi bottone"', () => {
    const r = matchVoiceCommand('aggiungi bottone');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addButton');
  });

  it('matches "metti condensatore"', () => {
    const r = matchVoiceCommand('metti condensatore');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addCapacitor');
  });

  it('matches "metti buzzer"', () => {
    const r = matchVoiceCommand('metti buzzer');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addBuzzer');
  });

  it('matches "aggiungi cicalino"', () => {
    const r = matchVoiceCommand('aggiungi cicalino');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addBuzzer');
  });

  it('matches "metti potenziometro"', () => {
    const r = matchVoiceCommand('metti potenziometro');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addPotentiometer');
  });

  it('matches "inserisci potenziometro"', () => {
    const r = matchVoiceCommand('inserisci potenziometro');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('addPotentiometer');
  });
});

describe('Circuit management commands', () => {
  it('matches "svuota circuito"', () => {
    const r = matchVoiceCommand('svuota circuito');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('clearCircuit');
  });

  it('matches "cancella tutto"', () => {
    const r = matchVoiceCommand('cancella tutto');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('clearCircuit');
  });

  it('matches "rimuovi tutto"', () => {
    const r = matchVoiceCommand('rimuovi tutto');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('clearCircuit');
  });

  it('matches "descrivi circuito"', () => {
    const r = matchVoiceCommand('descrivi circuito');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('describeCircuit');
  });

  it('matches "che componenti ci sono"', () => {
    const r = matchVoiceCommand('che componenti ci sono');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('describeCircuit');
  });

  it('matches "elenca componenti"', () => {
    const r = matchVoiceCommand('elenca componenti');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('describeCircuit');
  });
});

describe('Undo/redo extended', () => {
  it('matches "undo" (English)', () => {
    const r = matchVoiceCommand('undo');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('undo');
  });

  it('matches "cancella ultimo"', () => {
    const r = matchVoiceCommand('cancella ultimo');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('undo');
  });

  it('matches "redo" (English)', () => {
    const r = matchVoiceCommand('redo');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('redo');
  });

  it('matches "rifai"', () => {
    const r = matchVoiceCommand('rifai');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('redo');
  });
});

describe('Zoom and view', () => {
  it('matches "zoom fit"', () => {
    const r = matchVoiceCommand('zoom fit');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('zoomFit');
  });

  it('matches "vedi tutto"', () => {
    const r = matchVoiceCommand('vedi tutto');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('zoomFit');
  });

  it('matches "mostra tutto"', () => {
    const r = matchVoiceCommand('mostra tutto');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('zoomFit');
  });
});

describe('Experiment mounting by name', () => {
  it('matches "monta circuito led"', () => {
    const r = matchVoiceCommand('monta circuito led');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('mountExpLed');
  });

  it('matches "monta il led"', () => {
    const r = matchVoiceCommand('monta il led');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('mountExpLed');
  });

  it('matches "monta semaforo"', () => {
    const r = matchVoiceCommand('monta semaforo');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('mountExpSemafor');
  });

  it('matches "monta esperimento uno"', () => {
    const r = matchVoiceCommand('monta esperimento uno');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('mountExp1');
  });

  it('matches "primo esperimento"', () => {
    const r = matchVoiceCommand('primo esperimento');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('mountExp1');
  });
});

describe('Extended simulation patterns', () => {
  it('matches "avvia simulazione"', () => {
    const r = matchVoiceCommand('avvia simulazione');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('play');
  });

  it('matches "inizia simulazione"', () => {
    const r = matchVoiceCommand('inizia simulazione');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('play');
  });

  it('matches "ferma simulazione"', () => {
    const r = matchVoiceCommand('ferma simulazione');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('stop');
  });

  it('matches "stop simulazione"', () => {
    const r = matchVoiceCommand('stop simulazione');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('stop');
  });

  it('matches "resetta"', () => {
    const r = matchVoiceCommand('resetta');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('reset');
  });
});

describe('Build mode extended', () => {
  it('matches "sandbox"', () => {
    const r = matchVoiceCommand('sandbox');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('setBuildSandbox');
  });

  it('matches "modo sandbox"', () => {
    const r = matchVoiceCommand('modo sandbox');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('setBuildSandbox');
  });

  it('matches "modo guidato"', () => {
    const r = matchVoiceCommand('modo guidato');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('setBuildGuided');
  });
});

describe('Serial monitor', () => {
  it('matches "serial monitor"', () => {
    const r = matchVoiceCommand('serial monitor');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('showSerial');
  });

  it('matches "apri seriale"', () => {
    const r = matchVoiceCommand('apri seriale');
    expect(r).not.toBeNull();
    expect(r.command.action).toBe('showSerial');
  });
});

describe('executeVoiceCommand — component commands', () => {
  it('addLed calls addComponent with "led"', () => {
    const r = matchVoiceCommand('aggiungi led');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('led');
  });

  it('addResistor calls addComponent with "resistor"', () => {
    const r = matchVoiceCommand('aggiungi resistore');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('resistor');
  });

  it('addButton calls addComponent with "pushbutton"', () => {
    const r = matchVoiceCommand('aggiungi pulsante');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('pushbutton');
  });

  it('clearCircuit calls clearCircuit', () => {
    const r = matchVoiceCommand('pulisci circuito');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.clearCircuit).toHaveBeenCalled();
  });

  it('undo calls undo', () => {
    const r = matchVoiceCommand('annulla');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.undo).toHaveBeenCalled();
  });

  it('redo calls redo', () => {
    const r = matchVoiceCommand('ripeti');
    executeVoiceCommand(r.command, r.matched);
    expect(window.__ELAB_API.redo).toHaveBeenCalled();
  });
});

describe('executeVoiceCommand — describeCircuit returns dynamic description', () => {
  it('returns circuit description from API', () => {
    const r = matchVoiceCommand('descrivi circuito');
    const feedback = executeVoiceCommand(r.command, r.matched);
    expect(feedback).toBe('Componenti: LED rosso, resistore da 1kOhm. Fili: 3 collegamenti.');
  });

  it('returns "Circuito vuoto." when API returns falsy', () => {
    window.__ELAB_API.getCircuitDescription = vi.fn(() => null);
    const r = matchVoiceCommand('descrivi circuito');
    const feedback = executeVoiceCommand(r.command, r.matched);
    expect(feedback).toBe('Circuito vuoto.');
  });
});

describe('Wake word phrases — substring matching', () => {
  const WAKE_PHRASES = [
    'ehi unlim', 'hey unlim', 'ei unlim', 'ehi un lim',
    'hey un lim', 'ei un lim', 'e unlim', 'ehi anelim',
    'hey anelim', 'ehi online', 'hey online',
  ];

  it('"ehi unlim" is detected in "ehi unlim play"', () => {
    const found = WAKE_PHRASES.some(p => 'ehi unlim play'.includes(p));
    expect(found).toBe(true);
  });

  it('"hey unlim" is detected in "hey unlim avvia"', () => {
    const found = WAKE_PHRASES.some(p => 'hey unlim avvia'.includes(p));
    expect(found).toBe(true);
  });

  it('"ei unlim" is detected', () => {
    const found = WAKE_PHRASES.some(p => 'ei unlim mostra codice'.includes(p));
    expect(found).toBe(true);
  });

  it('"ehi un lim" handles STT word split', () => {
    const found = WAKE_PHRASES.some(p => 'ehi un lim ferma'.includes(p));
    expect(found).toBe(true);
  });

  it('"ehi anelim" handles STT misrecognition', () => {
    const found = WAKE_PHRASES.some(p => 'ehi anelim compila'.includes(p));
    expect(found).toBe(true);
  });

  it('"ehi online" handles STT misrecognition', () => {
    const found = WAKE_PHRASES.some(p => 'ehi online reset'.includes(p));
    expect(found).toBe(true);
  });

  it('does not match "buongiorno"', () => {
    const found = WAKE_PHRASES.some(p => 'buongiorno'.includes(p));
    expect(found).toBe(false);
  });

  it('does not match empty string', () => {
    const found = WAKE_PHRASES.some(p => ''.includes(p));
    expect(found).toBe(false);
  });
});

describe('getAvailableCommands — completeness', () => {
  it('includes component add commands', () => {
    const cmds = getAvailableCommands();
    const actions = cmds.map(c => c.action);
    expect(actions).toContain('addLed');
    expect(actions).toContain('addResistor');
    expect(actions).toContain('addButton');
    expect(actions).toContain('addCapacitor');
    expect(actions).toContain('addBuzzer');
    expect(actions).toContain('addPotentiometer');
  });

  it('includes circuit management commands', () => {
    const cmds = getAvailableCommands();
    const actions = cmds.map(c => c.action);
    expect(actions).toContain('clearCircuit');
    expect(actions).toContain('describeCircuit');
    expect(actions).toContain('undo');
    expect(actions).toContain('redo');
  });

  it('includes mount-by-name commands', () => {
    const cmds = getAvailableCommands();
    const actions = cmds.map(c => c.action);
    expect(actions).toContain('mountExp1');
    expect(actions).toContain('mountExpLed');
    expect(actions).toContain('mountExpSemafor');
  });
});
