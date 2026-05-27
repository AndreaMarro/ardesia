import { describe, it, expect } from 'vitest';
import { buildUnlimScreenSnapshot } from '../../../src/services/unlimContextCollector.js';

describe('buildUnlimScreenSnapshot — LIM context shape', () => {
  it('normalizes circuit, Blockly/Arduino, step, drawing, mode, narrative and visual fields', () => {
    const context = {
      circuit: {
        components: [{ id: 'led1', type: 'led' }],
        connections: [{ from: 'nano:D13', to: 'led1:anode' }],
        simulation: { state: 'stopped' },
      },
      circuitDescription: 'LED su D13 con resistore',
      editorCode: 'void setup() {}\nvoid loop() {}',
      editorMode: 'arduino',
      editorVisible: true,
      buildMode: 'passo-passo',
      buildStep: { current: 2, total: 5, title: 'Collega il LED' },
      drawing: { visible: true, strokes: 3 },
      blocklyXml: '<xml><block type="controls_if"/></xml>',
      applicationNarrative: [{ ts: 1, narrativeLine: 'screenshot app disponibile' }],
      visualSnapshot: { available: true, capturedAt: 2, reason: 'loop' },
    };

    const snap = buildUnlimScreenSnapshot(context);
    expect(snap.circuit.components).toHaveLength(1);
    expect(snap.circuit.description).toBe('LED su D13 con resistore');
    expect(snap.arduino.code).toContain('void setup');
    expect(snap.cpp.code).toContain('void loop');
    expect(snap.blockly.xml).toContain('controls_if');
    expect(snap.step.current).toBe(2);
    expect(snap.drawing.visible).toBe(true);
    expect(snap.modalita.buildMode).toBe('passo-passo');
    expect(snap.narrative).toHaveLength(1);
    expect(snap.visual.available).toBe(true);
  });

  it('is defensive on null/empty input', () => {
    const snap = buildUnlimScreenSnapshot(null);
    expect(snap).toEqual(expect.objectContaining({
      circuit: null,
      blockly: null,
      arduino: null,
      cpp: null,
      step: null,
      drawing: null,
      modalita: expect.any(Object),
      narrative: [],
      visual: null,
    }));
  });
});
