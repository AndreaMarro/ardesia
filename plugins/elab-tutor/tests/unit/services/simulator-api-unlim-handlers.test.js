/**
 * simulator-api-unlim-handlers.test.js — Sprint 6 Day 37
 * Target: 9 OpenClaw handlers wired in window.__ELAB_API.unlim
 * (speakTTS, listenSTT, saveSessionMemory, recallPastSession, showNudge,
 *  generateQuiz, exportFumetto, videoLoad, alertDocente)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock all upstream service modules ───
vi.mock('../../../src/data/experiments-index', () => ({
  findExperimentById: vi.fn((id) => id === 'v1-cap1-esp1' ? { id, title: 'Test' } : null),
  EXPERIMENTS_VOL1: { experiments: [] },
  EXPERIMENTS_VOL2: { experiments: [] },
  EXPERIMENTS_VOL3: { experiments: [] },
}));

vi.mock('../../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ message: 'ok' })),
  analyzeImage: vi.fn(() => Promise.resolve({ analysis: 'ok' })),
  compileCode: vi.fn(() => Promise.resolve({ hex: 'a' })),
}));

vi.mock('../../../src/services/unlimContextCollector', () => ({
  logError: vi.fn(),
}));

vi.mock('../../../src/utils/whiteboardScreenshot', () => ({
  captureWhiteboardScreenshot: vi.fn(() => Promise.resolve('data:image/png;base64,abc')),
}));

vi.mock('../../../src/services/voiceService', () => ({
  synthesizeSpeech: vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
  playAudio: vi.fn(() => Promise.resolve({})),
  startRecording: vi.fn(() => Promise.resolve(true)),
  stopRecording: vi.fn(() => Promise.resolve(new Blob(['x']))),
  sendVoiceChat: vi.fn(() => Promise.resolve({ userText: 'ciao maestra', response: 'ok' })),
  cancelRecording: vi.fn(),
  isRecording: vi.fn(() => false),
  unlockAudioPlayback: vi.fn(),
  stopPlayback: vi.fn(),
}));

vi.mock('../../../src/services/nudgeService', () => ({
  sendNudge: vi.fn((sid, sname, msg) => ({ id: 'nud_abc', studentId: sid, message: msg, timestamp: '2026-04-23T05:00:00Z' })),
}));

vi.mock('../../../src/services/projectHistoryService', () => ({
  default: {
    saveSnapshot: vi.fn((pid, snap) => ({ id: pid, experimentId: pid, snapshots: [{ id: 's1', ...snap, timestamp: 'T' }] })),
    getTimeline: vi.fn(() => [{ id: 's1', code: 'void setup(){}', timestamp: 'T1' }]),
    getStory: vi.fn(() => 'Hai iniziato con 5 righe e ora ne hai 12.'),
    listProjects: vi.fn(() => [{ id: 'p1', snapshotCount: 3 }]),
    getProject: vi.fn((id) => ({ id, snapshots: [{ id: 's1', code: 'x', timestamp: 'T' }] })),
  },
}));

import {
  registerSimulatorInstance,
  unregisterSimulatorInstance,
  emitSimulatorEvent,
} from '../../../src/services/simulator-api.js';
import * as voiceService from '../../../src/services/voiceService.js';
import * as nudgeService from '../../../src/services/nudgeService.js';
import projectHistoryService from '../../../src/services/projectHistoryService.js';

const HANDLER_NAMES = [
  'speakTTS', 'listenSTT', 'saveSessionMemory', 'recallPastSession',
  'showNudge', 'generateQuiz', 'exportFumetto', 'videoLoad', 'alertDocente',
];

const stubSimulator = {
  setHighlightedComponents: vi.fn(),
  setHighlightedPins: vi.fn(),
  serialWrite: vi.fn(),
  getCircuitState: vi.fn(() => ({ components: [], wires: [] })),
  getComponentStates: vi.fn(() => ({})),
};

beforeEach(() => {
  delete window.__ELAB_API;
  delete window.__ELAB_EVENTS;
  vi.clearAllMocks();
  registerSimulatorInstance(stubSimulator);
});

afterEach(() => {
  unregisterSimulatorInstance();
});

describe('Sprint 6 Day 37 — 9 handlers exist on window.__ELAB_API.unlim', () => {
  for (const name of HANDLER_NAMES) {
    it(`exposes window.__ELAB_API.unlim.${name} as function`, () => {
      expect(typeof window.__ELAB_API.unlim[name]).toBe('function');
    });
  }
});

describe('speakTTS — delegates to voiceService.synthesizeSpeech + playAudio', () => {
  it('returns Promise resolving to { ok: true } on success', async () => {
    const res = await window.__ELAB_API.unlim.speakTTS({ text: 'Ragazzi, accendete il LED.' });
    expect(voiceService.synthesizeSpeech).toHaveBeenCalledWith('Ragazzi, accendete il LED.');
    expect(voiceService.playAudio).toHaveBeenCalled();
    expect(res.ok).toBe(true);
  });

  it('accepts plain string instead of object', async () => {
    const res = await window.__ELAB_API.unlim.speakTTS('Ciao classe');
    expect(voiceService.synthesizeSpeech).toHaveBeenCalledWith('Ciao classe');
    expect(res.ok).toBe(true);
  });

  it('returns { ok: false, error } on synth failure', async () => {
    voiceService.synthesizeSpeech.mockRejectedValueOnce(new Error('TTS down'));
    const res = await window.__ELAB_API.unlim.speakTTS({ text: 'x' });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/TTS down/);
  });

  it('rejects empty text with ok=false', async () => {
    const res = await window.__ELAB_API.unlim.speakTTS({ text: '' });
    expect(res.ok).toBe(false);
  });
});

describe('listenSTT — wraps recording + voice-chat round-trip', () => {
  it('starts recording and resolves transcript when stop() called', async () => {
    const session = window.__ELAB_API.unlim.listenSTT({ sessionId: 's1' });
    expect(voiceService.startRecording).toHaveBeenCalled();
    const result = await session.stop();
    expect(voiceService.stopRecording).toHaveBeenCalled();
    expect(voiceService.sendVoiceChat).toHaveBeenCalled();
    expect(result.userText).toBe('ciao maestra');
  });

  it('cancel() aborts without round-trip', async () => {
    const session = window.__ELAB_API.unlim.listenSTT({});
    await session.cancel();
    expect(voiceService.cancelRecording).toHaveBeenCalled();
    expect(voiceService.sendVoiceChat).not.toHaveBeenCalled();
  });

  it('resolves ok=false if startRecording denied', async () => {
    voiceService.startRecording.mockResolvedValueOnce(false);
    const session = window.__ELAB_API.unlim.listenSTT({});
    await session.ready;
    expect(session.ok).toBe(false);
    const result = await session.stop();
    expect(result.ok).toBe(false);
    expect(voiceService.sendVoiceChat).not.toHaveBeenCalled();
  });
});

describe('saveSessionMemory — delegates to projectHistoryService.saveSnapshot', () => {
  it('saves snapshot with projectId + payload', () => {
    const res = window.__ELAB_API.unlim.saveSessionMemory({
      projectId: 'v1-cap6-led',
      code: 'void setup(){}',
      note: 'pass step 1',
    });
    expect(projectHistoryService.saveSnapshot).toHaveBeenCalledWith(
      'v1-cap6-led',
      expect.objectContaining({ code: 'void setup(){}', note: 'pass step 1' })
    );
    expect(res.ok).toBe(true);
    expect(res.projectId).toBe('v1-cap6-led');
  });

  it('returns ok=false when projectId missing', () => {
    const res = window.__ELAB_API.unlim.saveSessionMemory({ code: 'x' });
    expect(res.ok).toBe(false);
  });
});

describe('recallPastSession — delegates to projectHistoryService.getTimeline + getStory', () => {
  it('returns timeline + narrative for projectId', () => {
    const res = window.__ELAB_API.unlim.recallPastSession({ projectId: 'v1-cap6-led' });
    expect(projectHistoryService.getTimeline).toHaveBeenCalledWith('v1-cap6-led');
    expect(projectHistoryService.getStory).toHaveBeenCalledWith('v1-cap6-led');
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.snapshots)).toBe(true);
    expect(res.story).toMatch(/righe/);
  });

  it('returns ok=false when projectId missing', () => {
    const res = window.__ELAB_API.unlim.recallPastSession({});
    expect(res.ok).toBe(false);
  });

  it('respects optional limit on snapshots', () => {
    projectHistoryService.getTimeline.mockReturnValueOnce([
      { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' },
    ]);
    const res = window.__ELAB_API.unlim.recallPastSession({ projectId: 'p', limit: 2 });
    expect(res.snapshots.length).toBe(2);
  });
});

describe('showNudge — delegates to nudgeService.sendNudge', () => {
  it('sends nudge to studentId with message', () => {
    const res = window.__ELAB_API.unlim.showNudge({
      studentId: 'stud_42',
      studentName: 'Maria',
      message: 'Ottimo lavoro sul LED!',
    });
    expect(nudgeService.sendNudge).toHaveBeenCalledWith('stud_42', 'Maria', 'Ottimo lavoro sul LED!', expect.any(Object));
    expect(res.ok).toBe(true);
    expect(res.id).toBe('nud_abc');
  });

  it('returns ok=false on missing studentId', () => {
    const res = window.__ELAB_API.unlim.showNudge({ message: 'x' });
    expect(res.ok).toBe(false);
  });
});

describe('alertDocente — sends teacher alert via nudge channel', () => {
  it('emits via sendNudge with teacher recipient + severity', () => {
    const res = window.__ELAB_API.unlim.alertDocente({
      severity: 'warning',
      message: 'Studente bloccato 5 minuti',
      studentId: 'stud_42',
    });
    expect(nudgeService.sendNudge).toHaveBeenCalled();
    const args = nudgeService.sendNudge.mock.calls[0];
    expect(args[2]).toContain('Studente bloccato');
    expect(res.ok).toBe(true);
    expect(res.severity).toBe('warning');
  });

  it('default severity = info', () => {
    const res = window.__ELAB_API.unlim.alertDocente({ message: 'check' });
    expect(res.severity).toBe('info');
  });
});

describe('generateQuiz — emits quizRequested event for QuizPanel', () => {
  it('fires window.__ELAB_EVENTS.quizRequested with payload', () => {
    const listener = vi.fn();
    window.__ELAB_API.on('quizRequested', listener);
    const res = window.__ELAB_API.unlim.generateQuiz({
      experimentId: 'v1-cap6-led',
      count: 5,
    });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      experimentId: 'v1-cap6-led',
      count: 5,
    }));
    expect(res.ok).toBe(true);
    expect(res.requestId).toBeTruthy();
  });

  it('count default = 3 if missing', () => {
    const listener = vi.fn();
    window.__ELAB_API.on('quizRequested', listener);
    window.__ELAB_API.unlim.generateQuiz({ experimentId: 'x' });
    expect(listener.mock.calls[0][0].count).toBe(3);
  });
});

describe('exportFumetto — emits fumettoExportRequested event for UnlimReport', () => {
  it('fires event with sessionData payload', () => {
    const listener = vi.fn();
    window.__ELAB_API.on('fumettoExportRequested', listener);
    const res = window.__ELAB_API.unlim.exportFumetto({
      sessionData: { steps: 3, duration_min: 45 },
      format: 'pdf',
    });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      sessionData: { steps: 3, duration_min: 45 },
      format: 'pdf',
    }));
    expect(res.ok).toBe(true);
  });

  it('default format = pdf', () => {
    const listener = vi.fn();
    window.__ELAB_API.on('fumettoExportRequested', listener);
    window.__ELAB_API.unlim.exportFumetto({ sessionData: {} });
    expect(listener.mock.calls[0][0].format).toBe('pdf');
  });
});

describe('videoLoad — emits videoLoadRequested event', () => {
  it('fires event with url + autoplay', () => {
    const listener = vi.fn();
    window.__ELAB_API.on('videoLoadRequested', listener);
    const res = window.__ELAB_API.unlim.videoLoad({
      url: 'https://example.com/v.mp4',
      autoplay: false,
    });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com/v.mp4',
      autoplay: false,
    }));
    expect(res.ok).toBe(true);
  });

  it('returns ok=false on invalid url', () => {
    const res = window.__ELAB_API.unlim.videoLoad({ url: '' });
    expect(res.ok).toBe(false);
  });
});

describe('audit registry: 6 handlers move from todo_sett5 → live', () => {
  it('imports tools-registry without throwing', async () => {
    const mod = await import('../../../scripts/openclaw/tools-registry.ts');
    expect(mod).toBeTruthy();
    expect(Array.isArray(mod.OPENCLAW_TOOLS_REGISTRY)).toBe(true);
  });
});
