/**
 * Volume 3 Cap.6 canonical parity after printed-manual realignment.
 *
 * The extracted printed text has ESERCIZIO 6.1 as the AND/OR digital logic
 * exercise; ESERCIZIO 6.2 is the external LED on pin 13.
 */
import { describe, it, expect } from 'vitest';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';
import { getVolumeRef } from '../../src/data/volume-references';

// Support both [...] and {list:[...]} shapes historically used in this project.
const list = Array.isArray(EXPERIMENTS_VOL3)
  ? EXPERIMENTS_VOL3
  : (EXPERIMENTS_VOL3?.experiments || EXPERIMENTS_VOL3?.list || []);
const exp1 = list.find(e => e.id === 'v3-cap6-esp1');
const exp2 = list.find(e => e.id === 'v3-cap6-esp2');

describe('v3-cap6-esp1 — parity con libro Vol3 ESERCIZIO 6.1', () => {
  it('esiste e ha id stabile', () => {
    expect(exp1).toBeDefined();
    expect(exp1.id).toBe('v3-cap6-esp1');
  });

  it('il titolo fa riferimento alla logica AND/OR', () => {
    const title = String(exp1.title).toLowerCase();
    expect(title).toMatch(/and|or|logici/);
  });

  it('contiene pulsanti, LED e resistori per mostrare AND e OR', () => {
    const types = exp1.components.map(c => c.type).sort();
    expect(types).toContain('breadboard-half');
    expect(types).toContain('nano-r4');
    expect(types.filter(t => t === 'push-button').length).toBeGreaterThanOrEqual(2);
    expect(types.filter(t => t === 'led').length).toBeGreaterThanOrEqual(2);
    expect(types.filter(t => t === 'resistor').length).toBeGreaterThanOrEqual(2);
  });

  it('usa un resistore da 470Ω (come da libro)', () => {
    const r = exp1.components.find(c => c.type === 'resistor');
    expect(r).toBeDefined();
    expect(r.value).toBe(470);
  });

  it('usa pin digitali risolti per ingressi e uscite', () => {
    const connections = JSON.stringify(exp1.connections);
    const code = String(exp1.code || '');
    expect(connections).toMatch(/nano1:W_D3|nano1:W_D5|nano1:W_D6/);
    expect(code).toMatch(/digitalRead/);
    expect(code).toMatch(/digitalWrite/);
  });

  it('il codice usa letture digitali e scritture digitali', () => {
    const code = String(exp1.code || '');
    expect(code).toMatch(/digitalRead/);
    expect(code).toMatch(/digitalWrite/);
    expect(code).toMatch(/&&|\|\|/);
  });

  it('il catodo del LED arriva a GND (via resistore) come dice il libro', () => {
    const pins = exp1.pinAssignments;
    expect(pins['led1:anode']).toBeDefined();
    expect(pins['led1:cathode']).toBeDefined();
    // Almeno una connessione termina sul bus GND
    const wires = JSON.stringify(exp1.connections);
    expect(wires).toMatch(/bus-bot-minus|GND/);
  });

  it('il metadato volume-references cita Vol3 pag 45', () => {
    const ref = getVolumeRef('v3-cap6-esp1');
    expect(ref).toBeDefined();
    expect(ref.volume).toBe(3);
    expect(ref.bookPage).toBe(45);
    expect(ref.bookText).toMatch(/AND|OR|logica/i);
  });

  it('descrizione allineata al libro (logica digitale)', () => {
    const desc = String(exp1.desc).toLowerCase();
    expect(desc).toMatch(/and|or|logica|pulsanti/);
  });

  it('unlimPrompt cita la pagina del libro per abilitare il "docente impreparato"', () => {
    const p = String(exp1.unlimPrompt);
    expect(p).toMatch(/pagina\s*45|pag\.?\s*45/i);
  });

  it('numero di buildSteps coerente con un circuito AND/OR completo', () => {
    expect(Array.isArray(exp1.buildSteps)).toBe(true);
    expect(exp1.buildSteps.length).toBeGreaterThanOrEqual(10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// Parity extra: esp2 del libro = LED esterno sul pin 13
// ═══════════════════════════════════════════════════════════════════
describe('v3-cap6-esp2 — parity con libro Vol3 ESERCIZIO 6.2', () => {
  it('esiste e usa il pin D13 per il LED esterno', () => {
    expect(exp2).toBeDefined();
    const conn = JSON.stringify(exp2.connections);
    const code = String(exp2.code || '');
    expect(/nano1:W_D13(\b|")/.test(conn)).toBe(true);
    expect(/pinMode\s*\(\s*13/.test(code)).toBe(true);
  });

  it('mantiene il resistore 470Ω e il LED (stesso circuito, solo pin cambiato)', () => {
    const types = exp2.components.map(c => c.type).sort();
    expect(types).toEqual(['breadboard-half', 'led', 'nano-r4', 'resistor'].sort());
    const r = exp2.components.find(c => c.type === 'resistor');
    expect(r.value).toBe(470);
  });

  it('il titolo riflette il LED esterno', () => {
    const title = String(exp2.title).toLowerCase();
    expect(title).not.toBe(String(exp1.title).toLowerCase());
    expect(title).toMatch(/led|esterno|pin 13/);
  });

  it('unlimPrompt cita la pagina 51 (ESERCIZIO 6.2 libro)', () => {
    expect(String(exp2.unlimPrompt)).toMatch(/pagina\s*51|pag\.?\s*51/i);
  });
});
