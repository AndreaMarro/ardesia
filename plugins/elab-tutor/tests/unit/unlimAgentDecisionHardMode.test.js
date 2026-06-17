import { beforeEach, describe, expect, it } from 'vitest';

import {
  buildAgentDecisionSeed,
  recordUnlimEvent,
  resetUnlimSharedStateForTests,
} from '../../src/services/unlimSharedStateStore.js';

describe('UNLIM AgentDecision hard-mode routing', () => {
  beforeEach(() => {
    resetUnlimSharedStateForTests();
  });

  it('diagnoses a vague question after a live circuit mutation instead of clarifying generically', () => {
    recordUnlimEvent('circuitChange', {
      action: 'wireRemoved',
      from: 'led2:anode',
      to: 'r2:pin1',
    });

    const seed = buildAgentDecisionSeed({
      message: 'Ora questa cosa e cambiata, perche fa cosi?',
      simulatorContext: {
        circuit: {
          components: [{ id: 'led2', type: 'led', state: 'off' }],
          wires: [{ from: 'nano:GND', to: 'rail:-' }],
        },
      },
      narrativeContext: { id: 'v1-cap6-esp1', chapter_title: 'TEA-INFERRED' },
    });

    expect(seed.diagnose.needed).toBe(true);
    expect(seed.clarify.needed).toBe(false);
    expect(seed.rag.needed).toBe(true);
    expect(seed.rag.useCitationAsAnchorOnly).toBe(true);
  });

  it('does not let stale circuit events force diagnosis forever', () => {
    recordUnlimEvent('circuitChange', { action: 'wireAdded' });
    for (let i = 0; i < 8; i += 1) {
      recordUnlimEvent('telemetry', { tick: i });
    }

    const seed = buildAgentDecisionSeed({
      message: 'Dimmi un indizio breve',
      simulatorContext: {},
    });

    expect(seed.diagnose.needed).toBe(false);
    expect(seed.clarify.needed).toBe(false);
  });

  it('routes failed compilation to diagnose even when the student asks vaguely', () => {
    const seed = buildAgentDecisionSeed({
      message: 'Ok e adesso?',
      simulatorContext: {
        compilation: { success: false, errors: ['expected ; before } token'] },
        editorCode: 'void setup() { pinMode(13 OUTPUT); }',
      },
    });

    expect(seed.diagnose.needed).toBe(true);
    expect(seed.clarify.needed).toBe(false);
  });

  it('keeps album and comic branches off unless live context or asset metadata is present', () => {
    const seed = buildAgentDecisionSeed({
      message: 'Raccontami cosa abbiamo sbloccato',
      simulatorContext: { experimentId: 'v2-cap10-esp3' },
    });

    expect(seed.album.needed).toBe(false);
    expect(seed.comic.needed).toBe(false);
    expect(seed.rag.narrativeMapId).toBe('v2-cap10-esp3');
  });
});
