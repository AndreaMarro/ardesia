import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../../src/services/api', () => ({
  sendChat: vi.fn(),
  analyzeImage: vi.fn(),
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}));

vi.mock('../../../src/utils/contentFilter', () => ({
  validateMessage: vi.fn(() => ({ allowed: true })),
  sanitizeOutput: vi.fn((text) => text),
}));

vi.mock('../../../src/services/lessonPrepService', () => ({
  isLessonPrepCommand: vi.fn(() => false),
  getLessonSummary: vi.fn(),
  prepareLesson: vi.fn(),
}));

vi.mock('../../../src/services/unlimContextCollector', () => ({
  collectFullContext: vi.fn(() => ({})),
  getLatestVisualSnapshotImage: vi.fn(() => null),
}));

vi.mock('../../../src/components/lavagna/intentsDispatcher', () => ({
  executeServerIntents: vi.fn(() => []),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

import { __test__ } from '../../../src/components/lavagna/useGalileoChat.js';

describe('UNLIM action execution bridge regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.__ELAB_API = {
      addWire: vi.fn(() => ({ id: 'wire-1' })),
      addComponent: vi.fn(() => 'led2'),
      compile: vi.fn(() => ({ success: true })),
      getEditorCode: vi.fn(() => 'void setup(){} void loop(){}'),
      loadScratchWorkspace: vi.fn(() => true),
      setEditorCode: vi.fn(),
      setEditorMode: vi.fn(),
      showEditor: vi.fn(),
    };
  });

  afterEach(() => {
    delete window.__ELAB_API;
  });

  it('converts four-part addwire tags into the two-pin simulator API contract', () => {
    const result = __test__.executeActionTags('[AZIONE:addwire:led1:anode:nano:D13]');

    expect(window.__ELAB_API.addWire).toHaveBeenCalledWith('led1:anode', 'nano:D13');
    expect(result).toEqual(['addwire:led1:anode->nano:D13']);
  });

  it('does not report a component as added when the simulator bridge rejects it', () => {
    window.__ELAB_API.addComponent.mockReturnValueOnce(null);

    const result = __test__.executeActionTags('[AZIONE:addcomponent:led:200:150]');

    expect(window.__ELAB_API.addComponent).toHaveBeenCalledWith('led', { x: 200, y: 150 });
    expect(result).toEqual([]);
  });

  it('passes current editor code to compile so Arduino actions are not empty no-ops', () => {
    const result = __test__.executeActionTags('[AZIONE:compile]');

    expect(window.__ELAB_API.compile).toHaveBeenCalledWith('void setup(){} void loop(){}');
    expect(result).toEqual(['compile']);
  });

  it('does not report compile as executed when the verifier returns a failed result', () => {
    window.__ELAB_API.compile.mockReturnValueOnce({ success: false, errors: ['expected initializer before loop'] });

    const result = __test__.executeActionTags('[AZIONE:compile]');

    expect(window.__ELAB_API.compile).toHaveBeenCalledWith('void setup(){} void loop(){}');
    expect(result).toEqual([]);
  });

  it('compiles the code just set by UNLIM instead of stale editor state', () => {
    const code = 'void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); }';
    const result = __test__.executeActionTags(`[AZIONE:setcode:${code}] [AZIONE:compile]`);

    expect(window.__ELAB_API.setEditorCode).toHaveBeenCalledWith(code);
    expect(window.__ELAB_API.compile).toHaveBeenCalledWith(code);
    expect(result).toEqual(['setcode', 'compile']);
  });

  it('reports Scratch block loading only when loadScratchWorkspace is present and succeeds', () => {
    const xml = '<xml><block type="arduino_delay"></block></xml>';
    const result = __test__.executeActionTags(`[AZIONE:loadblocks:${xml}]`);

    expect(window.__ELAB_API.loadScratchWorkspace).toHaveBeenCalledWith(xml);
    expect(result).toEqual(['loadblocks']);
  });

  it('does not report Scratch block loading when the verifier rejects the workspace', () => {
    window.__ELAB_API.loadScratchWorkspace.mockReturnValueOnce({ ok: false, error: 'invalid xml' });

    const result = __test__.executeActionTags('[AZIONE:loadblocks:<xml><broken></xml>]');

    expect(result).toEqual([]);
  });

  it('routes UNLIM report/fumetto requests through the simulator export tool', () => {
    window.__ELAB_API.unlim = {
      exportFumetto: vi.fn(() => ({ ok: true, format: 'pdf' })),
    };

    const result = __test__.executeActionTags('[AZIONE:exportfumetto:pdf]');

    expect(window.__ELAB_API.unlim.exportFumetto).toHaveBeenCalledWith({
      format: 'pdf',
      source: 'unlim-action',
    });
    expect(result).toEqual(['exportfumetto']);
  });

  it('does not report fumetto export when the export tool rejects the request', () => {
    window.__ELAB_API.unlim = {
      exportFumetto: vi.fn(() => ({ ok: false, error: 'no session data' })),
    };

    const result = __test__.executeActionTags('[AZIONE:report]');

    expect(window.__ELAB_API.unlim.exportFumetto).toHaveBeenCalledWith({
      format: 'pdf',
      source: 'unlim-action',
    });
    expect(result).toEqual([]);
  });

  it('keeps action requests on the action bridge instead of diverting them to vision', () => {
    expect(__test__.shouldUseVisualNarrative('controlla se il circuito è giusto')).toBe(true);
    expect(__test__.shouldUseVisualNarrative('riesci a vedere il circuito?')).toBe(true);
    expect(__test__.shouldUseVisualNarrative('aggiungi un LED e collega il circuito')).toBe(false);
    expect(__test__.shouldUseVisualNarrative('compila il codice del semaforo')).toBe(false);
  });

  it('awaits async tool results before reporting compile as executed', async () => {
    window.__ELAB_API.compile.mockResolvedValueOnce({
      success: false,
      errors: ['expected initializer before loop'],
    });

    const result = await __test__.executeActionTagsVerified('[AZIONE:compile]');

    expect(window.__ELAB_API.compile).toHaveBeenCalledWith('void setup(){} void loop(){}');
    expect(result.executed).toEqual([]);
    expect(result.records).toEqual([
      expect.objectContaining({
        command: 'compile',
        ok: false,
        label: 'compile',
      }),
    ]);
  });

  it('verifies setcode by reading back the editor before reporting success', async () => {
    const code = 'void setup(){ pinMode(13, OUTPUT); }';
    window.__ELAB_API.getEditorCode.mockReturnValueOnce('old code');

    const result = await __test__.executeActionTagsVerified(`[AZIONE:setcode:${code}]`);

    expect(window.__ELAB_API.setEditorCode).toHaveBeenCalledWith(code);
    expect(result.executed).toEqual([]);
    expect(result.records[0]).toEqual(expect.objectContaining({
      command: 'setcode',
      ok: false,
      reason: expect.stringContaining('editor'),
    }));
  });

  it('does not report a void action as executed when the tool function is unavailable', async () => {
    delete window.__ELAB_API.play;

    const result = await __test__.executeActionTagsVerified('[AZIONE:play]');

    expect(result.executed).toEqual([]);
    expect(result.records[0]).toEqual(expect.objectContaining({
      command: 'play',
      ok: false,
      reason: expect.stringContaining('unavailable'),
    }));
  });
});
