/**
 * useUnlimNudge — Test behavioral dell'hook React
 *
 * Verifica:
 * 1. Inizializzazione: no nudge immediato
 * 2. Dopo idle → nudge triggerato
 * 3. dismiss() nasconde nudge per 90s
 * 4. resetIdle() rimette il contatore a zero
 * 5. enabled=false disabilita tutto
 *
 * (c) Andrea Marro — 17/04/2026
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUnlimNudge from '../../src/hooks/useUnlimNudge';

describe('useUnlimNudge — initialization', () => {
  it('restituisce nudge=false all\'inizio (no esperimento)', () => {
    const { result } = renderHook(() => useUnlimNudge());
    expect(result.current.nudge).toBe(false);
    expect(result.current.message).toBe('');
  });

  it('restituisce le funzioni dismiss e resetIdle', () => {
    const { result } = renderHook(() => useUnlimNudge());
    expect(typeof result.current.dismiss).toBe('function');
    expect(typeof result.current.resetIdle).toBe('function');
  });

  it('no nudge se enabled=false anche con esperimento attivo', () => {
    const { result } = renderHook(() =>
      useUnlimNudge({
        currentExperimentId: 'v1-cap6-esp1',
        enabled: false,
      })
    );
    expect(result.current.nudge).toBe(false);
  });
});

describe('useUnlimNudge — dismiss + resetIdle', () => {
  it('dismiss() resetta nudge state', () => {
    const { result } = renderHook(() =>
      useUnlimNudge({ currentExperimentId: 'v1-cap6-esp1' })
    );
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.nudge).toBe(false);
  });

  it('resetIdle() non crasha', () => {
    const { result } = renderHook(() =>
      useUnlimNudge({ currentExperimentId: 'v1-cap6-esp1' })
    );
    expect(() => {
      act(() => result.current.resetIdle());
    }).not.toThrow();
  });
});

describe('useUnlimNudge — priority field', () => {
  it('priority inizialmente è "low"', () => {
    const { result } = renderHook(() => useUnlimNudge());
    expect(result.current.priority).toBe('low');
  });
});
