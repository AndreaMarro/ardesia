/**
 * useSTT — Tests for Speech-to-Text hook
 * Tests SpeechRecognition API detection and fallback behavior.
 * Claude code andrea marro — 11/04/2026
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSTT } from '../../src/hooks/useSTT';

vi.mock('../../src/utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), log: vi.fn(), debug: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
});

describe('useSTT', () => {
  describe('without SpeechRecognition API', () => {
    it('returns isSupported=false when API not available', () => {
      const { result } = renderHook(() => useSTT());
      expect(result.current.isSupported).toBe(false);
    });

    it('returns isListening=false initially', () => {
      const { result } = renderHook(() => useSTT());
      expect(result.current.isListening).toBe(false);
    });

    it('returns empty interimText initially', () => {
      const { result } = renderHook(() => useSTT());
      expect(result.current.interimText).toBe('');
    });

    it('startListening returns false when unsupported', () => {
      const { result } = renderHook(() => useSTT());
      let returned;
      act(() => { returned = result.current.startListening(); });
      expect(returned).toBe(false);
    });

    it('stopListening returns false when unsupported', () => {
      const { result } = renderHook(() => useSTT());
      let returned;
      act(() => { returned = result.current.stopListening(); });
      expect(returned).toBe(false);
    });

    it('toggle returns false when unsupported', () => {
      const { result } = renderHook(() => useSTT());
      let returned;
      act(() => { returned = result.current.toggle(); });
      expect(returned).toBe(false);
    });
  });

  describe('with mock SpeechRecognition API', () => {
    let mockRecognition;

    beforeEach(() => {
      mockRecognition = {
        lang: '',
        continuous: false,
        interimResults: false,
        maxAlternatives: 1,
        onresult: null,
        onerror: null,
        onend: null,
        start: vi.fn(),
        stop: vi.fn(),
        abort: vi.fn(),
      };
      window.SpeechRecognition = vi.fn(() => mockRecognition);
    });

    it('returns isSupported=true when API is available', () => {
      const { result } = renderHook(() => useSTT());
      expect(result.current.isSupported).toBe(true);
    });

    it('sets language from options', () => {
      renderHook(() => useSTT({ lang: 'en-US' }));
      expect(mockRecognition.lang).toBe('en-US');
    });

    it('defaults language to it-IT', () => {
      renderHook(() => useSTT());
      expect(mockRecognition.lang).toBe('it-IT');
    });

    it('sets continuous=true for teacher speaking to class', () => {
      renderHook(() => useSTT());
      expect(mockRecognition.continuous).toBe(true);
    });

    it('sets interimResults=true for live feedback', () => {
      renderHook(() => useSTT());
      expect(mockRecognition.interimResults).toBe(true);
    });

    it('startListening calls recognition.start()', () => {
      const { result } = renderHook(() => useSTT());
      act(() => { result.current.startListening(); });
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('exports all expected methods', () => {
      const { result } = renderHook(() => useSTT());
      expect(typeof result.current.startListening).toBe('function');
      expect(typeof result.current.stopListening).toBe('function');
      expect(typeof result.current.toggle).toBe('function');
    });
  });
});
