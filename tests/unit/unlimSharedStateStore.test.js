import { describe, expect, it, beforeEach } from 'vitest';

import {
  buildAgentDecisionSeed,
  getUnlimSharedState,
  recordUnlimEvent,
  recordUnlimSnapshot,
  resetUnlimSharedStateForTests,
} from '../../src/services/unlimSharedStateStore.js';

describe('unlimSharedStateStore', () => {
  beforeEach(() => {
    resetUnlimSharedStateForTests();
  });

  it('keeps a warm snapshot plus immediate event history for UNLIM context', () => {
    recordUnlimSnapshot({
      experimentId: 'v3-cap6-semaforo',
      narrativeContext: { title: 'Semaforo con LED' },
      circuit: { components: [{ id: 'led1', type: 'led' }], wires: [] },
    }, { reason: 'periodic-15s' });

    recordUnlimEvent('circuitChange', { action: 'wireAdded', from: 'r1:pin1', to: 'led1:anode' });

    const state = getUnlimSharedState();
    expect(state.revision).toBe(2);
    expect(state.latestSnapshot.experimentId).toBe('v3-cap6-semaforo');
    expect(state.events.at(-1)).toEqual(expect.objectContaining({
      type: 'circuitChange',
      payload: expect.objectContaining({ action: 'wireAdded' }),
    }));
  });

  it('builds an AgentDecision JSON seed with all required parallel branches', () => {
    const seed = buildAgentDecisionSeed({
      message: 'Non va, guarda il circuito e sistemalo',
      simulatorContext: {
        circuit: { components: [{ id: 'led1', type: 'led' }], wires: [] },
        editorCode: 'void setup(){}',
        compilation: { success: false, errors: ['expected ;'] },
      },
      narrativeContext: { id: 'v3-cap6-semaforo', cliffhanger: 'Ora il semaforo decide da solo.' },
      albumContext: { studentId: 'anon-1', completedExperiments: 4 },
      comicContext: { available: true, assetUrl: 'https://example.test/comic.pdf' },
    });

    expect(Object.keys(seed)).toEqual([
      'reply',
      'act',
      'diagnose',
      'vision',
      'rag',
      'album',
      'comic',
      'clarify',
    ]);
    expect(seed.act.needed).toBe(true);
    expect(seed.diagnose.needed).toBe(true);
    expect(seed.vision.needed).toBe(true);
    expect(seed.rag.narrativeMapId).toBe('v3-cap6-semaforo');
    expect(seed.album.needed).toBe(true);
    expect(seed.comic.needed).toBe(true);
    expect(seed.reply.policy).toContain('originale');
  });
});
