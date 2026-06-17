import { describe, it, expect } from 'vitest';
import { deriveState, computePanelActions, STATES, STATE_PANELS } from '../../../src/components/lavagna/LavagnaStateManager';

describe('LavagnaStateManager', () => {
  describe('deriveState', () => {
    it('returns CLEAN when no experiment loaded', () => {
      expect(deriveState({ hasExperiment: false })).toBe(STATES.CLEAN);
    });

    it('returns BUILD when experiment loaded, not playing, not editing', () => {
      expect(deriveState({ hasExperiment: true, isPlaying: false, isEditing: false })).toBe(STATES.BUILD);
    });

    it('returns CODE when editing', () => {
      expect(deriveState({ hasExperiment: true, isPlaying: false, isEditing: true })).toBe(STATES.CODE);
    });

    it('returns RUN when playing', () => {
      expect(deriveState({ hasExperiment: true, isPlaying: true, isEditing: false })).toBe(STATES.RUN);
    });

    it('returns STUCK when idle > 120s', () => {
      expect(deriveState({ hasExperiment: true, idleSeconds: 130 })).toBe(STATES.STUCK);
    });

    it('returns BUILD (not STUCK) when idle 90s (under 120s threshold)', () => {
      expect(deriveState({ hasExperiment: true, idleSeconds: 90 })).toBe(STATES.BUILD);
    });

    it('returns STUCK when error present', () => {
      expect(deriveState({ hasExperiment: true, hasError: true })).toBe(STATES.STUCK);
    });

    it('STUCK takes priority over other states', () => {
      expect(deriveState({ hasExperiment: true, isPlaying: true, hasError: true })).toBe(STATES.STUCK);
    });
  });

  describe('computePanelActions', () => {
    it('returns suggested panels for CLEAN state', () => {
      const result = computePanelActions(STATES.CLEAN, {}, {});
      expect(result.leftPanel).toBe(false);
      expect(result.bottomPanel).toBe(false);
      expect(result.unlim).toBe(false);
      expect(result.toolbar).toBe(true);
    });

    it('opens left panel in BUILD state', () => {
      const result = computePanelActions(STATES.BUILD, {}, {});
      expect(result.leftPanel).toBe(true);
      expect(result.unlim).toBe(false);
    });

    it('opens bottom panel in CODE state', () => {
      const result = computePanelActions(STATES.CODE, {}, {});
      expect(result.bottomPanel).toBe(true);
      expect(result.leftPanel).toBe(false);
      expect(result.unlim).toBe(false);
    });

    it('does not auto-open unlim in STUCK state', () => {
      const result = computePanelActions(STATES.STUCK, {}, {});
      expect(result.unlim).toBe(false);
    });

    it('respects manual overrides', () => {
      const current = { leftPanel: true, bottomPanel: false, unlim: false, toolbar: true };
      const overrides = { leftPanel: true }; // User manually opened left panel
      const result = computePanelActions(STATES.CODE, current, overrides);
      // CODE state suggests leftPanel=false, but user overrode it to true
      expect(result.leftPanel).toBe(true); // Respects user's manual choice
      expect(result.bottomPanel).toBe(true); // Follows suggestion (no override)
    });
  });

  describe('STATE_PANELS', () => {
    it('has config for all 5 states', () => {
      expect(Object.keys(STATE_PANELS)).toHaveLength(5);
      for (const state of Object.values(STATES)) {
        expect(STATE_PANELS[state]).toBeDefined();
      }
    });

    it('all configs have required keys', () => {
      for (const config of Object.values(STATE_PANELS)) {
        expect(config).toHaveProperty('leftPanel');
        expect(config).toHaveProperty('bottomPanel');
        expect(config).toHaveProperty('unlim');
        expect(config).toHaveProperty('toolbar');
      }
    });
  });
});
