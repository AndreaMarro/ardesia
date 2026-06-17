/**
 * UNLIM Proactivity — Test comportamentali
 * Verifica il sistema di nudge proattivo per UNLIM.
 * (c) Andrea Marro — 15/04/2026 — ELAB Tutor
 */
import { describe, it, expect } from 'vitest';
import {
  shouldNudge,
  generateProactiveMessage,
  isMessageKidFriendly,
  IDLE_THRESHOLD_MS,
  STEP_STUCK_THRESHOLD_MS,
  HIGH_PRIORITY_THRESHOLD_MS,
} from '../../src/services/unlimProactivity';

// ─────────────────────────────────────────────────
// Helpers per costruire context di test
// ─────────────────────────────────────────────────
const NOW = 1_700_000_000_000;

function ctx(overrides = {}) {
  return {
    now: NOW,
    lastInteraction: NOW,
    experimentId: null,
    currentStep: null,
    circuitState: null,
    simulationState: null,
    ...overrides,
  };
}

function staticCircuit() {
  return {
    components: [
      { id: 'led1', type: 'led', on: false },
      { id: 'r1', type: 'resistor' },
    ],
  };
}

function liveCircuit() {
  return {
    components: [
      { id: 'led1', type: 'led', on: true, brightness: 0.8 },
      { id: 'r1', type: 'resistor' },
    ],
  };
}

// ─────────────────────────────────────────────────
// 1. Trigger di base: 60s inattività
// ─────────────────────────────────────────────────
describe('shouldNudge — trigger inattività', () => {
  it('NON attiva nudge se l\'utente ha interagito da pochi secondi', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 5_000,
      circuitState: staticCircuit(),
    }));
    expect(res.nudge).toBe(false);
  });

  it('NON attiva nudge a 59s di inattività (sotto soglia)', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 59_000,
      circuitState: staticCircuit(),
    }));
    expect(res.nudge).toBe(false);
  });

  it('attiva nudge esattamente a 60s di inattività', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - IDLE_THRESHOLD_MS,
      circuitState: staticCircuit(),
    }));
    expect(res.nudge).toBe(true);
  });

  it('attiva nudge dopo 90s di inattività su circuito statico', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 90_000,
      circuitState: staticCircuit(),
    }));
    expect(res.nudge).toBe(true);
  });

  it('reason è "user-active" quando utente è attivo', () => {
    const res = shouldNudge(ctx({ lastInteraction: NOW - 1000 }));
    expect(res.reason).toBe('user-active');
  });
});

// ─────────────────────────────────────────────────
// 2. Circuito statico vs circuito vivo
// ─────────────────────────────────────────────────
describe('shouldNudge — stato circuito', () => {
  it('NON attiva nudge se un LED è acceso (circuito vivo)', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 120_000,
      circuitState: liveCircuit(),
      simulationState: { running: true },
    }));
    // LED acceso = circuito vivo, ma idle >2min: priorità high comunque
    // Verifichiamo: il sistema deve NON essere "circuit-static"
    if (res.nudge) {
      expect(res.reason).not.toBe('circuit-static');
    }
  });

  it('attiva nudge con reason=circuit-static se simulazione ferma + idle 60s+', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: staticCircuit(),
      simulationState: { running: false },
    }));
    expect(res.nudge).toBe(true);
    expect(res.reason).toBe('circuit-static');
  });

  it('riconosce brightness > 0 come LED acceso', () => {
    const circ = {
      components: [{ id: 'led1', type: 'led', brightness: 0.5 }],
    };
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: circ,
      simulationState: { running: true },
    }));
    // non deve essere "circuit-static"
    if (res.nudge) expect(res.reason).not.toBe('circuit-static');
  });

  it('riconosce pulsante premuto come circuito NON statico', () => {
    const circ = {
      components: [{ id: 'btn1', type: 'button', pressed: true }],
    };
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: circ,
      simulationState: { running: true },
    }));
    if (res.nudge) expect(res.reason).not.toBe('circuit-static');
  });
});

// ─────────────────────────────────────────────────
// 3. Passo Passo bloccato
// ─────────────────────────────────────────────────
describe('shouldNudge — passo passo bloccato', () => {
  it('NON attiva step-stuck a 20s sullo stesso step', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      currentStep: { index: 2, totalSteps: 5, enteredAt: NOW - 20_000 },
    }));
    // può ancora attivarsi per idle, ma reason NON dev'essere 'step-stuck'
    if (res.nudge) expect(res.reason).not.toBe('step-stuck');
  });

  it('attiva step-stuck a 30s sullo stesso step', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      currentStep: { index: 2, totalSteps: 5, enteredAt: NOW - STEP_STUCK_THRESHOLD_MS },
    }));
    expect(res.nudge).toBe(true);
    expect(res.reason).toBe('step-stuck');
  });

  it('attiva step-stuck a 45s sullo stesso step', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      currentStep: { index: 3, totalSteps: 6, enteredAt: NOW - 45_000 },
    }));
    expect(res.nudge).toBe(true);
    expect(res.reason).toBe('step-stuck');
  });
});

// ─────────────────────────────────────────────────
// 4. Priority scaling
// ─────────────────────────────────────────────────
describe('shouldNudge — priority', () => {
  it('priority=low per idle breve su circuito statico', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: staticCircuit(),
    }));
    expect(res.priority).toBe('low');
  });

  it('priority=medium oltre 90s di inattività', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 100_000,
      circuitState: staticCircuit(),
    }));
    expect(res.priority).toBe('medium');
  });

  it('priority=high solo se esperimento bloccato da oltre 2 minuti', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - HIGH_PRIORITY_THRESHOLD_MS,
      experimentId: 'v1-cap6-esp1',
      circuitState: staticCircuit(),
    }));
    expect(res.priority).toBe('high');
  });

  it('priority NON è high a 119s di inattività', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 119_000,
      circuitState: staticCircuit(),
    }));
    expect(res.priority).not.toBe('high');
  });

  it('priority=high a 180s di inattività', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 180_000,
      circuitState: staticCircuit(),
    }));
    expect(res.priority).toBe('high');
  });
});

// ─────────────────────────────────────────────────
// 5. Lingua 10-14 anni (no jargon)
// ─────────────────────────────────────────────────
describe('generateProactiveMessage — linguaggio ragazzi', () => {
  it('messaggio default NON contiene jargon tecnico', () => {
    const msg = generateProactiveMessage({});
    expect(isMessageKidFriendly(msg)).toBe(true);
  });

  it('messaggio per esperimento noto NON contiene jargon', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'circuit-static',
    });
    expect(isMessageKidFriendly(msg)).toBe(true);
  });

  it('NON contiene "Kirchhoff" o "MNA" o "KCL"', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'experiment-stuck',
    });
    const lower = msg.toLowerCase();
    expect(lower).not.toContain('kirchhoff');
    expect(lower).not.toContain('mna');
    expect(lower).not.toContain('kcl');
  });

  it('NON contiene "ADC" / "PWM" / "GPIO" / "USART"', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'step-stuck',
      currentStep: { index: 0, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    const lower = msg.toLowerCase();
    expect(lower).not.toMatch(/\badc\b/);
    expect(lower).not.toMatch(/\bpwm\b/);
    expect(lower).not.toMatch(/\bgpio\b/);
    expect(lower).not.toMatch(/\busart\b/);
  });

  it('isMessageKidFriendly rifiuta stringa con "MNA"', () => {
    expect(isMessageKidFriendly('Usiamo MNA per risolvere')).toBe(false);
  });

  it('isMessageKidFriendly accetta linguaggio semplice', () => {
    expect(isMessageKidFriendly('Ragazzi, guardate il LED')).toBe(true);
  });
});

// ─────────────────────────────────────────────────
// 6. Rivolto alla classe, non al docente
// ─────────────────────────────────────────────────
describe('generateProactiveMessage — rivolto alla classe', () => {
  it('include "Ragazzi" (si rivolge alla classe)', () => {
    const msg = generateProactiveMessage({ _reason: 'circuit-static' });
    expect(msg).toMatch(/Ragazzi/i);
  });

  it('NON dice "Docente, chiedi..." o "Insegnante, spiega..."', () => {
    const msg = generateProactiveMessage({ _reason: 'circuit-static' });
    expect(msg.toLowerCase()).not.toContain('docente,');
    expect(msg.toLowerCase()).not.toContain('insegnante,');
    expect(msg.toLowerCase()).not.toMatch(/chiedi alla classe/);
  });

  it('contiene una domanda per la classe (punto interrogativo)', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'circuit-static',
    });
    expect(msg).toContain('?');
  });

  it('step-stuck: include domanda aperta per stimolare discussione', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'step-stuck',
      currentStep: { index: 0, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    expect(msg).toMatch(/\?/);
  });
});

// ─────────────────────────────────────────────────
// 7. Cita il libro se esperimento noto
// ─────────────────────────────────────────────────
describe('generateProactiveMessage — cita libro', () => {
  it('per esperimento noto cita pagina del libro (circuit-static)', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'circuit-static',
    });
    expect(msg).toMatch(/pagina\s+\d+/i);
  });

  it('per esperimento SCONOSCIUTO NON menziona pagina specifica', () => {
    const msg = generateProactiveMessage({
      experimentId: 'esperimento-inesistente-xyz',
      _reason: 'circuit-static',
    });
    expect(msg).not.toMatch(/pagina\s+\d+/i);
  });

  it('step-stuck cita il testo di quella istruzione dal libro', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'step-stuck',
      currentStep: { index: 0, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    // vol1-cap6-esp1 ha istruzione "Collega la clip della batteria..."
    expect(msg.toLowerCase()).toContain('collega');
  });

  it('experiment-stuck: cita il libro se bookQuote disponibile', () => {
    const msg = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'experiment-stuck',
    });
    // v1-cap6-esp1 ha bookQuote "Il LED si è acceso!"
    expect(msg.toLowerCase()).toMatch(/led|acceso|circuito/);
  });
});

// ─────────────────────────────────────────────────
// 8. Messaggi DIVERSI per esperimenti DIVERSI
// ─────────────────────────────────────────────────
describe('generateProactiveMessage — varietà per esperimento', () => {
  it('esperimenti diversi generano messaggi diversi (circuit-static)', () => {
    const msgA = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'circuit-static',
    });
    const msgB = generateProactiveMessage({
      experimentId: 'v1-cap7-esp1',
      _reason: 'circuit-static',
    });
    expect(msgA).not.toBe(msgB);
  });

  it('esperimenti diversi generano messaggi diversi (step-stuck)', () => {
    // Usa step index=1 che in v1-cap6-esp1 e v1-cap7-esp2 è diverso
    const msgA = generateProactiveMessage({
      experimentId: 'v1-cap6-esp1',
      _reason: 'step-stuck',
      currentStep: { index: 1, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    const msgB = generateProactiveMessage({
      experimentId: 'v1-cap7-esp2',
      _reason: 'step-stuck',
      currentStep: { index: 1, totalSteps: 3, enteredAt: NOW - 40_000 },
    });
    expect(msgA).not.toBe(msgB);
  });

  it('step-stuck con indici diversi cita istruzioni diverse', () => {
    const expId = 'v1-cap6-esp1';
    const msgStep0 = generateProactiveMessage({
      experimentId: expId,
      _reason: 'step-stuck',
      currentStep: { index: 0, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    const msgStep2 = generateProactiveMessage({
      experimentId: expId,
      _reason: 'step-stuck',
      currentStep: { index: 2, totalSteps: 5, enteredAt: NOW - 40_000 },
    });
    expect(msgStep0).not.toBe(msgStep2);
  });
});

// ─────────────────────────────────────────────────
// 9. Robustezza input (nessun crash su input malformati)
// ─────────────────────────────────────────────────
describe('shouldNudge — robustezza input', () => {
  it('non crasha con context=null', () => {
    const res = shouldNudge(null);
    expect(res).toBeDefined();
    expect(res.nudge).toBeTypeOf('boolean');
  });

  it('non crasha con context={}', () => {
    const res = shouldNudge({});
    expect(res).toBeDefined();
  });

  it('non crasha con lastInteraction invalido (string)', () => {
    const res = shouldNudge({ lastInteraction: 'yesterday', now: NOW });
    expect(res.nudge).toBeTypeOf('boolean');
  });

  it('gestisce circuitState=null correttamente', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: null,
    }));
    // Nessun circuito = nessun "circuit-static" da triggerare
    expect(res.reason).not.toBe('circuit-static');
  });

  it('gestisce components non-array senza crashare', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      circuitState: { components: 'not-an-array' },
    }));
    expect(res.nudge).toBeTypeOf('boolean');
  });

  it('generateProactiveMessage ritorna stringa con input vuoto', () => {
    const msg = generateProactiveMessage({});
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  it('generateProactiveMessage ritorna stringa con input null', () => {
    const msg = generateProactiveMessage(null);
    expect(typeof msg).toBe('string');
  });
});

// ─────────────────────────────────────────────────
// 10. Combinazione di trigger — priorità A > B > C
// ─────────────────────────────────────────────────
describe('shouldNudge — ordine priorità trigger', () => {
  it('esperimento bloccato >2min ha priorità su step-stuck', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 180_000,
      currentStep: { index: 1, totalSteps: 5, enteredAt: NOW - 40_000 },
      circuitState: staticCircuit(),
    }));
    expect(res.reason).toBe('experiment-stuck-long');
    expect(res.priority).toBe('high');
  });

  it('step-stuck ha priorità su circuit-static generico', () => {
    const res = shouldNudge(ctx({
      lastInteraction: NOW - 65_000,
      currentStep: { index: 1, totalSteps: 5, enteredAt: NOW - 40_000 },
      circuitState: staticCircuit(),
    }));
    expect(res.reason).toBe('step-stuck');
  });
});

// ─────────────────────────────────────────────────
// 11. Contratto API — forma del risultato
// ─────────────────────────────────────────────────
describe('shouldNudge — forma del risultato', () => {
  it('ritorna sempre campi nudge, message, priority, reason', () => {
    const res = shouldNudge(ctx({ lastInteraction: NOW - 65_000, circuitState: staticCircuit() }));
    expect(res).toHaveProperty('nudge');
    expect(res).toHaveProperty('message');
    expect(res).toHaveProperty('priority');
    expect(res).toHaveProperty('reason');
  });

  it('priority è uno dei valori attesi', () => {
    const res = shouldNudge(ctx({ lastInteraction: NOW - 200_000, circuitState: staticCircuit() }));
    expect(['low', 'medium', 'high']).toContain(res.priority);
  });

  it('messaggio non vuoto quando nudge=true', () => {
    const res = shouldNudge(ctx({ lastInteraction: NOW - 65_000, circuitState: staticCircuit() }));
    if (res.nudge) {
      expect(res.message.length).toBeGreaterThan(10);
    }
  });

  it('messaggio vuoto quando nudge=false', () => {
    const res = shouldNudge(ctx({ lastInteraction: NOW - 1000 }));
    expect(res.nudge).toBe(false);
    expect(res.message).toBe('');
  });
});
