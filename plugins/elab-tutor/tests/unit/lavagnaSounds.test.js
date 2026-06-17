/**
 * lavagnaSounds — Tests for audio feedback system
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setSoundsEnabled,
  getSoundsEnabled,
  soundTick,
  soundPlay,
  soundPause,
  soundError,
  soundComplete,
} from '../../src/components/lavagna/lavagnaSounds';

const store = {};
const localStorageMock = {
  getItem: vi.fn((k) => store[k] ?? null),
  setItem: vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k) => { delete store[k]; }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

globalThis.AudioContext = vi.fn(() => ({
  state: 'running',
  resume: vi.fn(() => Promise.resolve()),
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 0, exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
}));

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('lavagnaSounds', () => {
  it('sounds enabled by default', () => {
    expect(getSoundsEnabled()).toBe(true);
  });

  it('setSoundsEnabled(false) disables sounds', () => {
    setSoundsEnabled(false);
    expect(getSoundsEnabled()).toBe(false);
  });

  it('setSoundsEnabled(true) re-enables sounds', () => {
    setSoundsEnabled(false);
    setSoundsEnabled(true);
    expect(getSoundsEnabled()).toBe(true);
  });

  it('soundTick runs without error', () => {
    expect(() => soundTick()).not.toThrow();
  });

  it('soundPlay runs without error', () => {
    expect(() => soundPlay()).not.toThrow();
  });

  it('soundPause runs without error', () => {
    expect(() => soundPause()).not.toThrow();
  });

  it('soundError runs without error', () => {
    expect(() => soundError()).not.toThrow();
  });

  it('soundComplete runs without error', () => {
    expect(() => soundComplete()).not.toThrow();
  });

  it('sounds do not play when disabled', () => {
    setSoundsEnabled(false);
    soundTick();
    // AudioContext should not be created when sounds are disabled
    // The function returns early before creating context
    expect(AudioContext).not.toHaveBeenCalled();
  });
});
