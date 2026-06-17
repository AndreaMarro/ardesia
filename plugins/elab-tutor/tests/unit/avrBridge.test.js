/**
 * avrBridge.test.js — Test per AVRBridge (emulazione ATmega328p)
 * Coprire: pin mapping, setAnalogValue clamping, Intel HEX parsing,
 *          setInputPin routing, LCD config, serial buffer, servo angle,
 *          getPinStates struttura, worker vs main-thread branching.
 *
 * ⚠️  avr8js NON viene caricato — solo la logica AVRBridge pura viene testata.
 * © Andrea Marro — 13/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock avr8js (non disponibile in ambiente test) ───────────────────────────
vi.mock('avr8js', () => ({
  CPU: vi.fn(() => ({ data: new Uint8Array(256), cycles: BigInt(0) })),
  AVRTimer: vi.fn(),
  AVRIOPort: vi.fn(() => ({
    addListener: vi.fn(),
    pinState: vi.fn(() => 0),
    setPin: vi.fn(),
  })),
  AVRUSART: vi.fn(() => ({ writeByte: vi.fn() })),
  PinState: { High: 2, Low: 0, Input: 1, InputPullUp: 3 },
  avrInstruction: vi.fn(),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

import AVRBridge from '../../src/components/simulator/engine/AVRBridge.js';

// Helper: crea un'istanza AVRBridge pulita (main-thread mode)
function makeAVR() {
  const avr = new AVRBridge();
  avr._useWorker = false;
  return avr;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. PIN MAPPING — D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC  (regola critica CLAUDE.md)
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — pin mapping ATmega328p', () => {
  it('pin mapping: _handlePinChange PORTB mappa bit0 → D8', () => {
    const avr = makeAVR();
    const captured = [];
    avr.onPinChange = (pin) => captured.push(pin);
    avr.PinState = { High: 2, Low: 0, Input: 1, InputPullUp: 3 };
    // Simula portB con pinState() che ritorna High per bit 0
    avr.portB = {
      pinState: (bit) => (bit === 0 ? 2 : 0),  // bit 0 = High
    };
    avr._handlePinChange('B');
    // bit0 di PORTB deve essere mappato al pin Arduino 8
    expect(captured[0]).toBe(8);
  });

  it('pin mapping: _handlePinChange PORTB bit5 → D13 (LED built-in)', () => {
    const avr = makeAVR();
    const captured = [];
    avr.onPinChange = (pin) => captured.push(pin);
    avr.PinState = { High: 2, Low: 0, Input: 1, InputPullUp: 3 };
    avr.portB = {
      pinState: (bit) => (bit === 5 ? 2 : 0),
    };
    avr._handlePinChange('B');
    expect(captured[5]).toBe(13); // bit5 PORTB = D13
  });

  it('pin mapping: _handlePinChange PORTD bit0 → D0', () => {
    const avr = makeAVR();
    const captured = [];
    avr.onPinChange = (pin) => captured.push(pin);
    avr.PinState = { High: 2, Low: 0, Input: 1, InputPullUp: 3 };
    avr.portD = {
      pinState: (bit) => (bit === 0 ? 2 : 0),
    };
    avr._handlePinChange('D');
    expect(captured[0]).toBe(0); // PD0 = D0
  });

  it('pin mapping: _handlePinChange PORTC bit0 → A0 (pin 14)', () => {
    const avr = makeAVR();
    const captured = [];
    avr.onPinChange = (pin) => captured.push(pin);
    avr.PinState = { High: 2, Low: 0, Input: 1, InputPullUp: 3 };
    avr.portC = {
      pinState: (bit) => (bit === 0 ? 2 : 0),
    };
    avr._handlePinChange('C');
    expect(captured[0]).toBe(14); // PC0 = A0 = pin 14
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. setAnalogValue — clamping 0-1023
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — setAnalogValue clamping', () => {
  it('clamp: valore sopra 1023 viene portato a 1023', () => {
    const avr = makeAVR();
    avr.setAnalogValue(0, 9999);
    expect(avr._analogValues[0]).toBe(1023);
  });

  it('clamp: valore sotto 0 viene portato a 0', () => {
    const avr = makeAVR();
    avr.setAnalogValue(1, -100);
    expect(avr._analogValues[1]).toBe(0);
  });

  it('clamp: valore nel range valido (512) non viene modificato', () => {
    const avr = makeAVR();
    avr.setAnalogValue(2, 512);
    expect(avr._analogValues[2]).toBe(512);
  });

  it('clamp: valore 0 valido', () => {
    const avr = makeAVR();
    avr.setAnalogValue(3, 0);
    expect(avr._analogValues[3]).toBe(0);
  });

  it('clamp: valore 1023 valido (non diventa 1022)', () => {
    const avr = makeAVR();
    avr.setAnalogValue(4, 1023);
    expect(avr._analogValues[4]).toBe(1023);
  });

  it('arrotondamento: 512.7 → 513', () => {
    const avr = makeAVR();
    avr.setAnalogValue(5, 512.7);
    expect(avr._analogValues[5]).toBe(513);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. _parseIntelHex — parser Intel HEX
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — _parseIntelHex', () => {
  it('parsa un record dati valido in flash', () => {
    const avr = makeAVR();
    // Record data: 2 byte a indirizzo 0 (0x0000), word = 0x940C (JMP opcode)
    // :02000000 0C94 <checksum>
    const hex = ':020000000C94F6\n:00000001FF';
    const flash = new Uint16Array(4096);
    avr._parseIntelHex(hex, flash);
    // La prima parola deve essere 0x940C
    expect(flash[0]).toBe(0x940C);
  });

  it('ignora record non-dati (tipo 01 = EOF)', () => {
    const avr = makeAVR();
    const flash = new Uint16Array(4096);
    avr._parseIntelHex(':00000001FF', flash);
    expect(flash[0]).toBe(0); // flash non modificata
  });

  it('ignora linee che non iniziano con ":"', () => {
    const avr = makeAVR();
    const flash = new Uint16Array(4096);
    avr._parseIntelHex('linea_spazzatura\n:00000001FF', flash);
    expect(flash[0]).toBe(0); // nessun dato scritto
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. configureLCDPins — salvataggio configurazione
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — configureLCDPins', () => {
  it('salva la configurazione LCD in _lcdState._lcdPins', () => {
    const avr = makeAVR();
    const pins = { rs: 12, e: 11, d4: 5, d5: 4, d6: 3, d7: 2 };
    avr.configureLCDPins(pins);
    expect(avr._lcdState._lcdPins).toEqual(pins);
  });

  it('resetta il testo LCD a 16 spazi dopo configurazione', () => {
    const avr = makeAVR();
    avr._lcdState.text = ['Hello!', 'World!'];
    avr.configureLCDPins({ rs: 12, e: 11, d4: 5, d5: 4, d6: 3, d7: 2 });
    expect(avr._lcdState.text[0]).toBe('                ');
    expect(avr._lcdState.text[1]).toBe('                ');
  });

  it('salva config in _pendingLCDConfig (BUG-E-07 fix)', () => {
    const avr = makeAVR();
    const pins = { rs: 12, e: 11, d4: 5, d5: 4, d6: 3, d7: 2 };
    avr.configureLCDPins(pins);
    expect(avr._pendingLCDConfig).toEqual(pins);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. getSerialBuffer — svuota il buffer
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — getSerialBuffer', () => {
  it('ritorna il buffer corrente e lo svuota', () => {
    const avr = makeAVR();
    avr.serialBuffer = 'Hello\n';
    const result = avr.getSerialBuffer();
    expect(result).toBe('Hello\n');
    expect(avr.serialBuffer).toBe('');
  });

  it('ritorna stringa vuota se il buffer è vuoto', () => {
    const avr = makeAVR();
    expect(avr.getSerialBuffer()).toBe('');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 6. getServoAngle / getAllServoAngles
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — servo angles', () => {
  it('getServoAngle ritorna null per pin senza servo', () => {
    const avr = makeAVR();
    expect(avr.getServoAngle(9)).toBeNull();
  });

  it('getAllServoAngles ritorna oggetto vuoto inizialmente', () => {
    const avr = makeAVR();
    expect(avr.getAllServoAngles()).toEqual({});
  });

  it('_updateServoAnglesFromPWM calcola angolo 0° per duty 0.0272', () => {
    const avr = makeAVR();
    avr._servoAngles = {};
    avr._updateServoAnglesFromPWM({ 9: 0.0272 });
    // 544us / 20000us = 0° (0 gradi)
    expect(avr._servoAngles[9]).toBeDefined();
    expect(avr._servoAngles[9]).toBeLessThanOrEqual(5); // tolleranza ~5°
  });

  it('_updateServoAnglesFromPWM ignora duty analogWrite normale (0.5 = 50%)', () => {
    const avr = makeAVR();
    avr._servoAngles = {};
    avr._updateServoAnglesFromPWM({ 9: 0.5 }); // 50% duty = analogWrite(128) — NON servo
    expect(avr._servoAngles[9]).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 7. Worker mode — branch corretto per postMessage
// ══════════════════════════════════════════════════════════════════════════════
describe('AVRBridge — worker mode branching', () => {
  it('setAnalogValue usa postMessage in worker mode', () => {
    const avr = makeAVR();
    const messages = [];
    avr._useWorker = true;
    avr._worker = { postMessage: (msg) => messages.push(msg) };
    avr.setAnalogValue(0, 512);
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('setAnalog');
    expect(messages[0].value).toBe(512);
  });

  it('getPinStates ritorna _workerPinStates in worker mode', () => {
    const avr = makeAVR();
    avr._useWorker = true;
    avr._workerPinStates = { D13: 1 };
    avr._workerPWM = { 11: 0.5 };
    const states = avr.getPinStates();
    expect(states.D13).toBe(1);
    expect(states._pwm[11]).toBe(0.5);
  });
});
