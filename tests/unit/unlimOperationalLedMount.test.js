import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../../src/utils/contentFilter', () => ({
  validateMessage: vi.fn(() => ({ allowed: true })),
  sanitizeOutput: vi.fn((text) => text),
}));

vi.mock('../../src/services/lessonPrepService', () => ({
  isLessonPrepCommand: vi.fn(() => false),
  getLessonSummary: vi.fn(),
  prepareLesson: vi.fn(),
}));

vi.mock('../../src/services/unlimContextCollector', () => ({
  collectFullContext: vi.fn(() => ({})),
  getLatestVisualSnapshotImage: vi.fn(() => null),
}));

vi.mock('../../src/components/lavagna/intentsDispatcher', () => ({
  executeServerIntents: vi.fn(() => []),
}));

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import { buildDirectOperationalResponse } from '../../supabase/functions/_shared/operational-response.ts';
import { __test__ } from '../../src/components/lavagna/useGalileoChat.js';

describe('UNLIM direct LED mounting path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.__ELAB_API = {
      loadExperiment: vi.fn(() => ({ ok: true })),
      addWire: vi.fn(() => ({ id: 'wire-ok' })),
      highlightPin: vi.fn(() => ({ ok: true })),
      unlim: { clearHighlights: vi.fn() },
    };
  });

  afterEach(() => {
    delete window.__ELAB_API;
  });

  it('turns a circuit mounting request into a full ordered action plan', async () => {
    const response = buildDirectOperationalResponse('Monta un circuito LED con resistenza su Arduino D13 e GND', null);

    expect(response?.source).toBe('direct-operational-led-mount');
    expect(response?.response).toContain('[AZIONE:loadexp:v1-cap6-esp1]');
    expect(response?.response).toContain('[AZIONE:addwire:nano:D13:r1:pin1]');
    expect(response?.response).toContain('[AZIONE:addwire:r1:pin2:led1:anode]');
    expect(response?.response).toContain('[AZIONE:addwire:led1:cathode:nano:GND]');
    expect(response?.response).toContain('[AZIONE:highlightpin:nano:D13,nano:GND]');

    const result = await __test__.executeActionTagsVerified(response.response);

    expect(window.__ELAB_API.loadExperiment).toHaveBeenCalledWith('v1-cap6-esp1');
    expect(window.__ELAB_API.addWire).toHaveBeenCalledWith('nano:D13', 'r1:pin1');
    expect(window.__ELAB_API.addWire).toHaveBeenCalledWith('r1:pin2', 'led1:anode');
    expect(window.__ELAB_API.addWire).toHaveBeenCalledWith('led1:cathode', 'nano:GND');
    expect(result.executed).toEqual(expect.arrayContaining([
      'loadexp:v1-cap6-esp1',
      'addwire:nano:D13->r1:pin1',
      'addwire:r1:pin2->led1:anode',
      'addwire:led1:cathode->nano:GND',
    ]));
  });
});
