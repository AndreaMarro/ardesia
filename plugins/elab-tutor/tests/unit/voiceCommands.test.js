import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchVoiceCommand, executeVoiceCommand, getAvailableCommands } from '../../src/services/voiceCommands.js';

describe('voiceCommands', () => {
  beforeEach(() => {
    // Mock __ELAB_API
    window.__ELAB_API = {
      play: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      showPanel: vi.fn(),
      showEditor: vi.fn(),
      hideEditor: vi.fn(),
      compile: vi.fn(),
      getEditorCode: vi.fn(() => 'void setup() {} void loop() {}'),
      mountExperiment: vi.fn(),
      setBuildMode: vi.fn(),
      getCurrentExperiment: vi.fn(() => ({ id: 'v1-cap6-esp1', title: 'LED' })),
      getExperimentList: vi.fn(() => ({
        vol1: [
          { id: 'v1-cap6-esp1', title: 'LED' },
          { id: 'v1-cap6-esp2', title: 'LED RGB' },
          { id: 'v1-cap7-esp1', title: 'RGB Mix' },
        ],
        vol2: [{ id: 'v2-cap3-esp1', title: 'Multimetro' }],
        vol3: [{ id: 'v3-cap5-esp1', title: 'Primo Programma' }],
      })),
    };
  });

  describe('matchVoiceCommand', () => {
    it('matches exact Italian commands', () => {
      expect(matchVoiceCommand('avvia')).toBeTruthy();
      expect(matchVoiceCommand('avvia').command.action).toBe('play');

      expect(matchVoiceCommand('ferma')).toBeTruthy();
      expect(matchVoiceCommand('ferma').command.action).toBe('stop');

      expect(matchVoiceCommand('prossimo')).toBeTruthy();
      expect(matchVoiceCommand('prossimo').command.action).toBe('nextStep');
    });

    it('matches English commands', () => {
      expect(matchVoiceCommand('play').command.action).toBe('play');
      expect(matchVoiceCommand('stop').command.action).toBe('stop');
      expect(matchVoiceCommand('next').command.action).toBe('nextStep');
    });

    it('matches multi-word patterns', () => {
      expect(matchVoiceCommand('fai partire').command.action).toBe('play');
      expect(matchVoiceCommand('mostra codice').command.action).toBe('showEditor');
      expect(matchVoiceCommand('monitor seriale').command.action).toBe('showSerial');
    });

    it('is case-insensitive', () => {
      expect(matchVoiceCommand('AVVIA').command.action).toBe('play');
      expect(matchVoiceCommand('Ferma').command.action).toBe('stop');
    });

    it('strips punctuation', () => {
      expect(matchVoiceCommand('avvia!').command.action).toBe('play');
      expect(matchVoiceCommand('ferma.').command.action).toBe('stop');
    });

    it('matches within longer phrases', () => {
      expect(matchVoiceCommand('per favore avvia la simulazione').command.action).toBe('play');
      expect(matchVoiceCommand('per favore mostra codice').command.action).toBe('showEditor');
    });

    it('returns null for unrecognized text', () => {
      expect(matchVoiceCommand('come funziona un resistore')).toBeNull();
      expect(matchVoiceCommand('cosa succede se collego il LED al contrario')).toBeNull();
    });

    it('does not match patterns inside other words (word boundary)', () => {
      // "play" should NOT match inside "display"
      expect(matchVoiceCommand('display')).toBeNull();
      // "fit" should NOT match inside "profitto"
      expect(matchVoiceCommand('profitto')).toBeNull();
      // "back" should NOT match inside "feedback"
      expect(matchVoiceCommand('feedback')).toBeNull();
      // "start" should NOT match inside "restart"
      expect(matchVoiceCommand('restart')).toBeNull();
    });

    it('handles accented Italian STT output', () => {
      // Italian STT sometimes returns accented variants
      expect(matchVoiceCommand('avvià').command.action).toBe('play');
      expect(matchVoiceCommand('indìetro').command.action).toBe('prevStep');
    });

    it('returns null for empty/short text', () => {
      expect(matchVoiceCommand('')).toBeNull();
      expect(matchVoiceCommand('a')).toBeNull();
      expect(matchVoiceCommand(null)).toBeNull();
    });

    // ── Principio Zero: nuovi comandi ──

    it('matches "monta il circuito"', () => {
      const m = matchVoiceCommand('monta il circuito');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('mountCircuit');
    });

    it('matches "monta passo passo"', () => {
      const m = matchVoiceCommand('monta passo passo');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('mountStepByStep');
    });

    it('matches "prossimo esperimento" (not nextStep)', () => {
      const m = matchVoiceCommand('prossimo esperimento');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('nextExperiment');
    });

    it('matches "esperimento successivo"', () => {
      const m = matchVoiceCommand('esperimento successivo');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('nextExperiment');
    });

    it('matches "esperimento precedente"', () => {
      const m = matchVoiceCommand('esperimento precedente');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('prevExperiment');
    });

    it('matches "prepara la lezione"', () => {
      const m = matchVoiceCommand('prepara la lezione');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('prepareLesson');
    });

    it('matches "compila il codice" (longer than "compila")', () => {
      const m = matchVoiceCommand('compila il codice');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('compileCode');
    });

    it('matches "nascondi il codice"', () => {
      const m = matchVoiceCommand('nascondi il codice');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('hideEditor');
    });

    it('matches "fai il quiz"', () => {
      const m = matchVoiceCommand('fai il quiz');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('startQuiz');
    });

    it('matches "crea il report"', () => {
      const m = matchVoiceCommand('crea il report');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('createReport');
    });

    it('matches "volume 1"', () => {
      const m = matchVoiceCommand('volume 1');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('selectVolume1');
    });

    it('matches "volume due"', () => {
      const m = matchVoiceCommand('volume due');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('selectVolume2');
    });

    it('matches "volume tre"', () => {
      const m = matchVoiceCommand('volume tre');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('selectVolume3');
    });

    it('matches "capitolo 3" with chapter-map', () => {
      const m = matchVoiceCommand('capitolo 3');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('selectChapter');
      expect(m.matched).toBe('capitolo 3');
    });

    it('matches "capitolo cinque"', () => {
      const m = matchVoiceCommand('capitolo cinque');
      expect(m).toBeTruthy();
      expect(m.command.action).toBe('selectChapter');
      expect(m.matched).toBe('capitolo cinque');
    });

    it('prefers longer pattern: "prossimo esperimento" over "prossimo"', () => {
      const m = matchVoiceCommand('prossimo esperimento');
      expect(m.command.action).toBe('nextExperiment');
    });

    it('prefers longer pattern: "compila il codice" over "compila"', () => {
      const m = matchVoiceCommand('compila il codice');
      expect(m.command.action).toBe('compileCode');
    });

    it('"prossimo" alone still matches nextStep', () => {
      const m = matchVoiceCommand('prossimo');
      expect(m.command.action).toBe('nextStep');
    });
  });

  describe('executeVoiceCommand', () => {
    it('calls __ELAB_API.play for play command', () => {
      const match = matchVoiceCommand('avvia');
      const feedback = executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.play).toHaveBeenCalled();
      expect(feedback).toBe('Simulazione avviata!');
    });

    it('calls __ELAB_API.pause for stop command', () => {
      const match = matchVoiceCommand('ferma');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.pause).toHaveBeenCalled();
    });

    it('calls __ELAB_API.compile with editor code for compile command', () => {
      const match = matchVoiceCommand('compila');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.getEditorCode).toHaveBeenCalled();
      expect(window.__ELAB_API.compile).toHaveBeenCalledWith('void setup() {} void loop() {}');
    });

    it('returns feedback even when __ELAB_API is undefined', () => {
      delete window.__ELAB_API;
      const match = matchVoiceCommand('avvia');
      const feedback = executeVoiceCommand(match.command, match.matched);
      expect(feedback).toBe('Simulazione avviata!');
    });

    it('returns fallback feedback on error', () => {
      window.__ELAB_API.play = () => { throw new Error('test'); };
      const match = matchVoiceCommand('play');
      const feedback = executeVoiceCommand(match.command, match.matched);
      expect(feedback).toBe('Comando non riuscito.');
    });

    // ── Principio Zero: execute tests ──

    it('mountCircuit sets build mode and mounts experiment', () => {
      const match = matchVoiceCommand('monta il circuito');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.setBuildMode).toHaveBeenCalledWith('complete');
      expect(window.__ELAB_API.mountExperiment).toHaveBeenCalledWith('v1-cap6-esp1');
    });

    it('mountStepByStep sets guided mode and mounts', () => {
      const match = matchVoiceCommand('monta passo passo');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.setBuildMode).toHaveBeenCalledWith('guided');
      expect(window.__ELAB_API.mountExperiment).toHaveBeenCalledWith('v1-cap6-esp1');
    });

    it('nextExperiment mounts the next experiment in list', () => {
      const match = matchVoiceCommand('prossimo esperimento');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.mountExperiment).toHaveBeenCalledWith('v1-cap6-esp2');
    });

    it('prevExperiment does nothing when at first experiment', () => {
      const match = matchVoiceCommand('esperimento precedente');
      executeVoiceCommand(match.command, match.matched);
      // v1-cap6-esp1 is first in list, so mountExperiment should not be called
      expect(window.__ELAB_API.mountExperiment).not.toHaveBeenCalled();
    });

    it('prepareLesson dispatches custom event', () => {
      const listener = vi.fn();
      window.addEventListener('elab-voice-command', listener);
      const match = matchVoiceCommand('prepara la lezione');
      executeVoiceCommand(match.command, match.matched);
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].detail.action).toBe('prepareLesson');
      window.removeEventListener('elab-voice-command', listener);
    });

    it('hideEditor calls __ELAB_API.hideEditor', () => {
      const match = matchVoiceCommand('nascondi il codice');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.hideEditor).toHaveBeenCalled();
    });

    it('startQuiz dispatches custom event', () => {
      const listener = vi.fn();
      window.addEventListener('elab-voice-command', listener);
      const match = matchVoiceCommand('fai il quiz');
      executeVoiceCommand(match.command, match.matched);
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].detail.action).toBe('startQuiz');
      window.removeEventListener('elab-voice-command', listener);
    });

    it('createReport dispatches custom event', () => {
      const listener = vi.fn();
      window.addEventListener('elab-voice-command', listener);
      const match = matchVoiceCommand('crea il report');
      executeVoiceCommand(match.command, match.matched);
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].detail.action).toBe('createReport');
      window.removeEventListener('elab-voice-command', listener);
    });

    it('selectVolume1 mounts first vol1 experiment', () => {
      const match = matchVoiceCommand('volume 1');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.mountExperiment).toHaveBeenCalledWith('v1-cap6-esp1');
    });

    it('selectVolume3 mounts first vol3 experiment', () => {
      const match = matchVoiceCommand('volume tre');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.mountExperiment).toHaveBeenCalledWith('v3-cap5-esp1');
    });

    it('selectChapter returns dynamic chapter feedback', () => {
      const match = matchVoiceCommand('capitolo 3');
      const feedback = executeVoiceCommand(match.command, match.matched);
      expect(feedback).toBe('Capitolo 3!');
    });

    it('compileCode compiles via explicit pattern', () => {
      const match = matchVoiceCommand('compila il codice');
      executeVoiceCommand(match.command, match.matched);
      expect(window.__ELAB_API.getEditorCode).toHaveBeenCalled();
      expect(window.__ELAB_API.compile).toHaveBeenCalledWith('void setup() {} void loop() {}');
    });
  });

  describe('getAvailableCommands', () => {
    it('returns all commands with action, patterns, feedback', () => {
      const cmds = getAvailableCommands();
      expect(cmds.length).toBeGreaterThan(30);
      for (const cmd of cmds) {
        expect(cmd.action).toBeTruthy();
        expect(cmd.patterns.length).toBeGreaterThan(0);
        expect(cmd.feedback).toBeTruthy();
      }
    });

    it('includes all Principio Zero commands', () => {
      const cmds = getAvailableCommands();
      const actions = cmds.map(c => c.action);
      expect(actions).toContain('mountCircuit');
      expect(actions).toContain('mountStepByStep');
      expect(actions).toContain('nextExperiment');
      expect(actions).toContain('prevExperiment');
      expect(actions).toContain('prepareLesson');
      expect(actions).toContain('compileCode');
      expect(actions).toContain('hideEditor');
      expect(actions).toContain('startQuiz');
      expect(actions).toContain('createReport');
      expect(actions).toContain('selectVolume1');
      expect(actions).toContain('selectVolume2');
      expect(actions).toContain('selectVolume3');
      expect(actions).toContain('selectChapter');
    });
  });
});
