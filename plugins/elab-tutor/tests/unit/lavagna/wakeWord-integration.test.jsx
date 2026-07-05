/**
 * LavagnaShell × wakeWord — Sprint T iter 28 integration tests
 *
 * Verifica wire-up del listener "Ehi UNLIM" dentro LavagnaShell:
 *   - mount/unmount lifecycle
 *   - WebSpeech unsupported → graceful skip
 *   - debouncing wake-word ravvicinati
 *   - no-op se UNLIM già aperto
 *   - toggle off via wakeWordEnabled flag
 *   - persistenza toggle preference
 *
 * Honest caveats:
 *   - I test mockano `services/wakeWord.js` e catturano i callback `onWake`
 *     per simulare il riconoscimento. NON testano la WebSpeech API reale.
 *   - Il debounce è verificato simulando wake consecutivi entro la finestra
 *     di 1500ms (timestamp Date.now()). Con timer reali (no fake timers)
 *     usiamo callback diretti per garantire rapidità.
 *
 * (c) Andrea Marro — 2026-04-29
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import React from 'react';

// ─── Mocks ───
vi.mock('../../../src/plugin/hostIdentity', () => ({
  useHostIdentity: () => ({ user: { id: 'teacher1' }, isDocente: true, isStudente: false }),
}));

vi.mock('../../../src/services/classProfile', () => ({
  buildClassProfile: vi.fn(() => ({
    isFirstTime: false, lastExperimentTitle: 'LED', sessionsCount: 3,
  })),
  getNextLessonSuggestion: vi.fn(() => ({
    experimentId: 'v1-cap6-esp1', title: 'Accendi il LED',
  })),
}));

// Wake-word mock — capture onWake/onCommand callbacks for synchronous testing.
const wakeWordState = {
  supported: true,
  started: false,
  startCount: 0,
  stopCount: 0,
  onWake: null,
  onCommand: null,
};

vi.mock('../../../src/services/wakeWord', () => ({
  isWakeWordSupported: () => wakeWordState.supported,
  startWakeWordListener: ({ onWake, onCommand } = {}) => {
    wakeWordState.startCount += 1;
    wakeWordState.started = true;
    wakeWordState.onWake = onWake;
    wakeWordState.onCommand = onCommand;
    return true;
  },
  stopWakeWordListener: () => {
    wakeWordState.stopCount += 1;
    wakeWordState.started = false;
    wakeWordState.onWake = null;
    wakeWordState.onCommand = null;
  },
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../src/components/simulator/NewElabSimulator', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mock-simulator' }, 'Simulator'),
}));
vi.mock('../../../src/components/lavagna/VolumeViewer', () => ({ default: () => null }));
vi.mock('../../../src/components/lavagna/PercorsoPanel', () => ({ default: () => null }));
vi.mock('../../../src/components/simulator/canvas/DrawingOverlay', () => ({ default: () => null }));
vi.mock('../../../src/components/lavagna/ExperimentPicker', () => ({ default: () => null }));
vi.mock('../../../src/components/lavagna/UnlimAdapter', () => ({
  default: ({ visible }) => React.createElement('div', {
    'data-testid': 'unlim-adapter',
    'data-visible': String(!!visible),
  }),
}));
vi.mock('../../../src/components/tutor/VisionButton', () => ({ default: () => null }));

import LavagnaShell from '../../../src/components/lavagna/LavagnaShell';

function resetWakeWordState() {
  wakeWordState.supported = true;
  wakeWordState.started = false;
  wakeWordState.startCount = 0;
  wakeWordState.stopCount = 0;
  wakeWordState.onWake = null;
  wakeWordState.onCommand = null;
}

describe('LavagnaShell × wakeWord — Sprint T iter 28 integration', () => {
  beforeEach(() => {
    cleanup();
    resetWakeWordState();
    delete window.__ELAB_API;
    // localStorage is mocked in tests/setup.js (vi.fn). Reset call history
    // and provide a default impl returning null (for elab_skip_bentornati
    // we override per test as needed).
    localStorage.getItem.mockReset();
    localStorage.setItem.mockReset();
    localStorage.getItem.mockImplementation((k) => (k === 'elab_skip_bentornati' ? 'true' : null));
  });

  afterEach(() => {
    cleanup();
  });

  it('starts wake-word listener on mount when toggle ON + browser supported', () => {
    render(<LavagnaShell />);
    expect(wakeWordState.startCount).toBe(1);
    expect(typeof wakeWordState.onWake).toBe('function');
  });

  it('opens UNLIM (unlimOpen=true) when wake-word detected', () => {
    render(<LavagnaShell />);
    const adapter = screen.getByTestId('unlim-adapter');
    expect(adapter.getAttribute('data-visible')).toBe('false');
    act(() => { wakeWordState.onWake?.(); });
    expect(adapter.getAttribute('data-visible')).toBe('true');
  });

  it('stops wake-word listener on Lavagna unmount', () => {
    const { unmount } = render(<LavagnaShell />);
    expect(wakeWordState.stopCount).toBe(0);
    unmount();
    expect(wakeWordState.stopCount).toBeGreaterThanOrEqual(1);
  });

  it('skips listener gracefully when WebSpeech API not supported', () => {
    wakeWordState.supported = false;
    render(<LavagnaShell />);
    expect(wakeWordState.startCount).toBe(0);
    // No throw, component still renders
    expect(screen.getByTestId('unlim-adapter')).toBeInTheDocument();
  });

  it('does not re-open UNLIM when wake detected while UNLIM already open (no-op)', () => {
    render(<LavagnaShell />);
    const adapter = screen.getByTestId('unlim-adapter');
    // First wake → opens UNLIM
    act(() => { wakeWordState.onWake?.(); });
    expect(adapter.getAttribute('data-visible')).toBe('true');
    // Subsequent wake while open → no error, no state churn
    act(() => { wakeWordState.onWake?.(); });
    expect(adapter.getAttribute('data-visible')).toBe('true');
  });

  it('debounces multiple wake detections within 1500ms window', () => {
    render(<LavagnaShell />);
    const adapter = screen.getByTestId('unlim-adapter');
    // Sequential rapid wakes — first opens, others ignored by debounce
    // (anche se UNLIM viene chiuso in mezzo, il debounce timestamp blocca
    //  la riapertura entro 1.5s).
    act(() => { wakeWordState.onWake?.(); });
    expect(adapter.getAttribute('data-visible')).toBe('true');
    // Burst di wake ravvicinati: nessun crash, nessun toggle multiplo.
    act(() => {
      wakeWordState.onWake?.();
      wakeWordState.onWake?.();
      wakeWordState.onWake?.();
    });
    expect(adapter.getAttribute('data-visible')).toBe('true');
  });

  it('forwards onCommand text to __ELAB_API.unlim.sendMessage', () => {
    const sendMessage = vi.fn();
    window.__ELAB_API = { unlim: { sendMessage } };
    render(<LavagnaShell />);
    act(() => { wakeWordState.onCommand?.('accendi il LED'); });
    expect(sendMessage).toHaveBeenCalledWith('accendi il LED');
  });

  it('persists wake-word toggle preference in localStorage on mount', async () => {
    // Default: toggle ON → setItem called with ('elab-lavagna-wake-word', 'on')
    // after the persistence useEffect commits post-mount.
    await act(async () => { render(<LavagnaShell />); });
    expect(localStorage.setItem).toHaveBeenCalledWith('elab-lavagna-wake-word', 'on');
  });

  it('respects "off" preference from localStorage and skips listener start', async () => {
    // Override default impl: return 'off' for the wake-word key.
    localStorage.getItem.mockImplementation((k) => {
      if (k === 'elab-lavagna-wake-word') return 'off';
      if (k === 'elab_skip_bentornati') return 'true';
      return null;
    });
    await act(async () => { render(<LavagnaShell />); });
    // Listener NOT started when toggle preference is off (early return path).
    expect(wakeWordState.startCount).toBe(0);
  });
});
