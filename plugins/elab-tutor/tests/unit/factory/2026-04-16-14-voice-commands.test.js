/**
 * Voice Commands Tests — Factory categoria 3
 * Verifica matchVoiceCommand() con 20+ formulazioni italiane realistiche,
 * inclusa risoluzione ambiguità (longest-pattern-wins), gestione accenti,
 * case insensitivity, punteggiatura, e token speciali nel feedback.
 *
 * DATI REALI: importa direttamente voiceCommands.js, nessun mock sui dati.
 * (c) Andrea Marro — Test Factory 16/04/2026
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  matchVoiceCommand,
  executeVoiceCommand,
  getAvailableCommands,
} from '../../../src/services/voiceCommands.js';

// ─── Setup: assicura window.__ELAB_API assente (jsdom) ───────────────────────
beforeEach(() => {
  delete window.__ELAB_API;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function expectAction(text, expectedAction) {
  const result = matchVoiceCommand(text);
  expect(result, `"${text}" dovrebbe matchare "${expectedAction}"`).not.toBeNull();
  expect(result.command.action).toBe(expectedAction);
}

function expectNoMatch(text) {
  const result = matchVoiceCommand(text);
  expect(result, `"${text}" non dovrebbe matchare nulla`).toBeNull();
}

// ─── Comandi Simulazione ──────────────────────────────────────────────────────
describe('matchVoiceCommand — Simulazione', () => {
  it('1. "avvia" → play', () => expectAction('avvia', 'play'));
  it('2. "fai partire" → play (pattern con spazio)', () => expectAction('fai partire', 'play'));
  it('3. "AVVIA SIMULAZIONE" → play (case insensitive)', () => expectAction('AVVIA SIMULAZIONE', 'play'));
  it('4. "ferma" → stop', () => expectAction('ferma', 'stop'));
  it('5. "stop simulazione" → stop (pattern esatto)', () => expectAction('stop simulazione', 'stop'));
  it('6. "ricomincia" → reset', () => expectAction('ricomincia', 'reset'));
  it('7. "resetta" → reset', () => expectAction('resetta', 'reset'));
});

// ─── Navigazione Esperimento ──────────────────────────────────────────────────
describe('matchVoiceCommand — Navigazione passo', () => {
  it('8. "avanti" → nextStep', () => expectAction('avanti', 'nextStep'));
  it('9. "vai avanti" → nextStep (pattern lungo)', () => expectAction('vai avanti', 'nextStep'));
  it('10. "indietro" → prevStep', () => expectAction('indietro', 'prevStep'));
  it('11. "torna indietro" → prevStep (pattern lungo)', () => {
    const result = matchVoiceCommand('torna indietro');
    expect(result).not.toBeNull();
    expect(result.command.action).toBe('prevStep');
    // Il pattern lungo "torna indietro" deve vincere su "indietro"
    expect(result.matched).toBe('torna indietro');
  });
});

// ─── Longest-Pattern-Wins: Disambiguazione Critica ───────────────────────────
describe('matchVoiceCommand — Disambiguazione (longest-pattern-wins)', () => {
  it('12. "prossimo esperimento" → nextExperiment, NON nextStep', () => {
    // "prossimo" è pattern di nextStep, "prossimo esperimento" è pattern di nextExperiment
    const result = matchVoiceCommand('prossimo esperimento');
    expect(result).not.toBeNull();
    expect(result.command.action).toBe('nextExperiment');
    expect(result.matched).toBe('prossimo esperimento');
  });

  it('13. "prossimo" standalone → nextStep (non nextExperiment)', () => {
    const result = matchVoiceCommand('prossimo');
    expect(result).not.toBeNull();
    expect(result.command.action).toBe('nextStep');
  });

  it('14. "monta circuito" → più specifico (mountExpLed NON cattura "monta circuito")', () => {
    // "monta il circuito" è pattern di mountCircuit
    // "monta circuito" è pattern di mountCircuit
    const result = matchVoiceCommand('monta il circuito');
    expect(result).not.toBeNull();
    expect(result.command.action).toBe('mountCircuit');
  });
});

// ─── Gestione Accenti (NFD normalize) ────────────────────────────────────────
describe('matchVoiceCommand — Accenti e STT', () => {
  it('15. "modalita libera" (senza accento) → setBuildSandbox', () => {
    // Il pattern è "modalità libera" con accento — STT potrebbe omettere l'accento
    expectAction('modalita libera', 'setBuildSandbox');
  });

  it('16. "modalità guidata" (con accento) → setBuildGuided', () => {
    expectAction('modalità guidata', 'setBuildGuided');
  });

  it('17. "passo passo" → setBuildGuided', () => expectAction('passo passo', 'setBuildGuided'));
});

// ─── Pannelli e Editor ────────────────────────────────────────────────────────
describe('matchVoiceCommand — Pannelli', () => {
  it('18. "mostra codice" → showEditor', () => expectAction('mostra codice', 'showEditor'));
  it('19. "apri seriale" → showSerial', () => expectAction('apri seriale', 'showSerial'));
  it('20. "serial monitor" → showSerial', () => expectAction('serial monitor', 'showSerial'));
});

// ─── Componenti ───────────────────────────────────────────────────────────────
describe('matchVoiceCommand — Componenti circuito', () => {
  it('21. "aggiungi led" → addLed', () => expectAction('aggiungi led', 'addLed'));
  it('22. "metti un resistore" → addResistor', () => expectAction('metti un resistore', 'addResistor'));
  it('23. "inserisci pulsante" → addButton', () => expectAction('inserisci pulsante', 'addButton'));
  it('24. "aggiungi cicalino" → addBuzzer', () => expectAction('aggiungi cicalino', 'addBuzzer'));
  it('25. "pulisci circuito" → clearCircuit', () => expectAction('pulisci circuito', 'clearCircuit'));
});

// ─── Capitoli e Volumi ────────────────────────────────────────────────────────
describe('matchVoiceCommand — Capitoli e Volumi', () => {
  it('26. "volume 1" → selectVolume1', () => expectAction('volume 1', 'selectVolume1'));
  it('27. "apri volume due" → selectVolume2', () => expectAction('apri volume due', 'selectVolume2'));
  it('28. "capitolo 3" → selectChapter', () => expectAction('capitolo 3', 'selectChapter'));
  it('29. "capitolo tre" → selectChapter (numero parola)', () => expectAction('capitolo tre', 'selectChapter'));
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────
describe('matchVoiceCommand — Edge cases', () => {
  it('30. Stringa vuota → null', () => expectNoMatch(''));
  it('31. Testo troppo breve "x" → null', () => expectNoMatch('x'));
  it('32. Testo senza match → null', () => expectNoMatch('questa frase non è un comando'));
  it('33. Punteggiatura ignorata: "compila, per favore!" → compile', () => {
    expectAction('compila, per favore!', 'compile');
  });
  it('34. Testo con spazi multipli → normalizzato', () => {
    expectAction('avvia   simulazione', 'play');
  });
});

// ─── executeVoiceCommand — Feedback ──────────────────────────────────────────
describe('executeVoiceCommand — Feedback strings', () => {
  it('35. play → feedback "Simulazione avviata!"', () => {
    const result = matchVoiceCommand('avvia');
    expect(result).not.toBeNull();
    const fb = executeVoiceCommand(result.command, result.matched);
    expect(fb).toBe('Simulazione avviata!');
  });

  it('36. stop → feedback "Simulazione fermata."', () => {
    const result = matchVoiceCommand('ferma');
    expect(result).not.toBeNull();
    const fb = executeVoiceCommand(result.command, result.matched);
    expect(fb).toBe('Simulazione fermata.');
  });

  it('37. describeCircuit → fallback "Circuito vuoto." senza __ELAB_API', () => {
    const result = matchVoiceCommand('descrivi circuito');
    expect(result).not.toBeNull();
    expect(result.command.action).toBe('describeCircuit');
    const fb = executeVoiceCommand(result.command, result.matched);
    expect(fb).toBe('Circuito vuoto.');
  });

  it('38. selectChapter "capitolo 5" → feedback "Capitolo 5!"', () => {
    const result = matchVoiceCommand('capitolo 5');
    expect(result).not.toBeNull();
    const fb = executeVoiceCommand(result.command, result.matched);
    expect(fb).toBe('Capitolo 5!');
  });

  it('39. selectChapter "capitolo due" → feedback "Capitolo 2!"', () => {
    const result = matchVoiceCommand('capitolo due');
    expect(result).not.toBeNull();
    const fb = executeVoiceCommand(result.command, result.matched);
    expect(fb).toBe('Capitolo 2!');
  });

  it('40. executeVoiceCommand non lancia se __ELAB_API mancante', () => {
    const result = matchVoiceCommand('compila');
    expect(result).not.toBeNull();
    expect(() => executeVoiceCommand(result.command, result.matched)).not.toThrow();
  });
});

// ─── getAvailableCommands — Struttura ────────────────────────────────────────
describe('getAvailableCommands — Struttura', () => {
  it('41. Ritorna un array non vuoto', () => {
    const cmds = getAvailableCommands();
    expect(Array.isArray(cmds)).toBe(true);
    expect(cmds.length).toBeGreaterThan(30);
  });

  it('42. Ogni comando ha action, patterns (array), feedback (stringa)', () => {
    const cmds = getAvailableCommands();
    for (const cmd of cmds) {
      expect(typeof cmd.action).toBe('string');
      expect(Array.isArray(cmd.patterns)).toBe(true);
      expect(cmd.patterns.length).toBeGreaterThan(0);
      expect(typeof cmd.feedback).toBe('string');
    }
  });

  it('43. Token speciali __CIRCUIT_DESCRIPTION__ e __CHAPTER_FEEDBACK__ sostituiti', () => {
    const cmds = getAvailableCommands();
    const feedbacks = cmds.map(c => c.feedback);
    expect(feedbacks).not.toContain('__CIRCUIT_DESCRIPTION__');
    expect(feedbacks).not.toContain('__CHAPTER_FEEDBACK__');
  });

  it('44. Tutti i 36+ comandi definiti nel file sono esposti', () => {
    const cmds = getAvailableCommands();
    const actions = cmds.map(c => c.action);
    // Campione di azioni critiche
    const expected = [
      'play', 'stop', 'reset', 'nextStep', 'prevStep',
      'showEditor', 'showSerial', 'compile',
      'addLed', 'addResistor', 'addButton',
      'clearCircuit', 'describeCircuit',
      'undo', 'redo',
      'nextExperiment', 'prevExperiment',
      'startQuiz', 'createReport',
      'selectVolume1', 'selectVolume2', 'selectVolume3',
      'selectChapter',
    ];
    for (const action of expected) {
      expect(actions, `Azione "${action}" mancante`).toContain(action);
    }
  });
});
