/**
 * voiceCommands extended — Tests for voice command matching and execution
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  matchVoiceCommand,
  executeVoiceCommand,
  getAvailableCommands,
} from '../../src/services/voiceCommands';

beforeEach(() => {
  vi.clearAllMocks();
  // Mock __ELAB_API
  window.__ELAB_API = {
    play: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    showEditor: vi.fn(),
    showSerialMonitor: vi.fn(),
    compile: vi.fn(),
    getEditorCode: vi.fn(() => 'void setup(){}'),
    getCircuitDescription: vi.fn(() => 'LED + resistore 220 ohm'),
    clearCircuit: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomReset: vi.fn(),
  };
});

describe('voiceCommands extended', () => {
  describe('matchVoiceCommand', () => {
    it('matches "play"', () => {
      const result = matchVoiceCommand('play');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('play');
    });

    it('matches "avvia"', () => {
      const result = matchVoiceCommand('avvia');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('play');
    });

    it('matches "ferma"', () => {
      const result = matchVoiceCommand('ferma');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('stop');
    });

    it('matches "prossimo"', () => {
      const result = matchVoiceCommand('prossimo');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('nextStep');
    });

    it('matches "indietro"', () => {
      const result = matchVoiceCommand('indietro');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('prevStep');
    });

    it('matches "compila"', () => {
      const result = matchVoiceCommand('compila');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('compile');
    });

    it('matches "mostra codice"', () => {
      const result = matchVoiceCommand('mostra codice');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('showEditor');
    });

    it('matches "reset"', () => {
      const result = matchVoiceCommand('reset');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('reset');
    });

    it('returns null for empty text', () => {
      expect(matchVoiceCommand('')).toBeNull();
      expect(matchVoiceCommand(null)).toBeNull();
    });

    it('returns null for unrecognized command', () => {
      expect(matchVoiceCommand('ciao come stai')).toBeNull();
    });

    it('is case insensitive', () => {
      const result = matchVoiceCommand('PLAY');
      expect(result).not.toBeNull();
    });

    it('matches within longer sentences', () => {
      const result = matchVoiceCommand('ok adesso avvia la simulazione');
      expect(result).not.toBeNull();
      expect(result.command.action).toBe('play');
    });
  });

  describe('executeVoiceCommand', () => {
    it('executes play command and returns feedback', () => {
      const match = matchVoiceCommand('play');
      const feedback = executeVoiceCommand(match.command);
      expect(feedback).toBe('Simulazione avviata!');
      expect(window.__ELAB_API.play).toHaveBeenCalled();
    });

    it('executes stop command', () => {
      const match = matchVoiceCommand('ferma');
      const feedback = executeVoiceCommand(match.command);
      expect(feedback).toBe('Simulazione fermata.');
      expect(window.__ELAB_API.pause).toHaveBeenCalled();
    });

    it('returns error message on execution failure', () => {
      const match = matchVoiceCommand('play');
      window.__ELAB_API.play.mockImplementation(() => { throw new Error('fail'); });
      const feedback = executeVoiceCommand(match.command);
      expect(feedback).toBe('Comando non riuscito.');
    });
  });

  describe('getAvailableCommands', () => {
    it('returns array of commands', () => {
      const cmds = getAvailableCommands();
      expect(Array.isArray(cmds)).toBe(true);
      expect(cmds.length).toBeGreaterThan(10);
    });

    it('each command has action, patterns, feedback', () => {
      const cmds = getAvailableCommands();
      for (const cmd of cmds) {
        expect(cmd.action).toBeTruthy();
        expect(Array.isArray(cmd.patterns)).toBe(true);
        expect(cmd.patterns.length).toBeGreaterThan(0);
        expect(cmd.feedback).toBeTruthy();
      }
    });

    it('includes play, stop, compile, reset actions', () => {
      const cmds = getAvailableCommands();
      const actions = cmds.map(c => c.action);
      expect(actions).toContain('play');
      expect(actions).toContain('stop');
      expect(actions).toContain('compile');
      expect(actions).toContain('reset');
    });
  });
});
