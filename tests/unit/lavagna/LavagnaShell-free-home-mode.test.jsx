import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'teacher1' }, isDocente: false, isStudente: false }),
}));

vi.mock('../../../src/hooks/useSessionTracker', () => ({
  useSessionTracker: () => ({ finaliseSession: undefined }),
}));

vi.mock('../../../src/services/classProfile', () => ({
  buildClassProfile: vi.fn(() => ({ isFirstTime: false, sessionsCount: 0 })),
  getNextLessonSuggestion: vi.fn(() => null),
}));

vi.mock('../../../src/services/wakeWord', () => ({
  isWakeWordSupported: () => false,
  startWakeWordListener: () => false,
  stopWakeWordListener: () => {},
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

vi.mock('../../../src/components/simulator/NewElabSimulator', () => ({
  default: () => <div data-testid="mock-simulator">Simulator</div>,
}));

vi.mock('../../../src/components/lavagna/GalileoAdapter', () => ({
  default: ({ visible }) => visible ? <aside data-testid="mock-unlim">UNLIM</aside> : null,
}));

vi.mock('../../../src/components/lavagna/VideoFloat', () => ({
  default: ({ visible }) => visible ? <div data-testid="mock-video">Video</div> : null,
}));

vi.mock('../../../src/components/lavagna/VolumeViewer', () => ({
  default: ({ visible }) => visible ? <div data-testid="mock-volume">Manuale</div> : null,
}));

vi.mock('../../../src/components/lavagna/ExperimentPicker', () => ({
  default: () => <div data-testid="mock-picker">Picker</div>,
}));

vi.mock('../../../src/components/common/MicPermissionNudge.jsx', () => ({ default: () => null }));
vi.mock('../../../src/components/common/UpdatePrompt.jsx', () => ({ default: () => null }));

import LavagnaShell from '../../../src/components/lavagna/LavagnaShell.jsx';

describe('LavagnaShell free mode launched from homepage', () => {
  beforeEach(() => {
    cleanup();
    delete window.__ELAB_API;
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'elab_skip_bentornati') return 'true';
      if (key === 'elab_lavagna_launch_mode') return 'solo';
      return null;
    });
    window.localStorage.setItem.mockClear();
    window.localStorage.removeItem.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders free workspace with simulator bridge and manual access, without the permanent Lavagna libera copy', async () => {
    render(<LavagnaShell />);

    // Iter 50 fix Andrea 2026-05-13 — flaky under heavy parallel vitest load
    // (default 1000ms timeout exceeded ~5% runs when CPU saturated; verbose
    // bench iter 50 caught at 4108ms). Bump explicit timeout 4000ms keeps
    // assertion strict while tolerating slow async mount under load.
    expect(await screen.findByTestId('mock-simulator', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /chat unlim/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-unlim')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /parla con unlim/i }));
    expect(screen.getByTestId('mock-unlim')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /parla con unlim/i }));
    expect(screen.queryByTestId('mock-unlim')).not.toBeInTheDocument();

    expect(screen.queryByTestId('lavagna-libera-empty-canvas')).not.toBeInTheDocument();
    expect(screen.queryByTestId('modalita-switch-slot')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Lavagna libera|Niente circuiti qui/i);

    fireEvent.click(screen.getByRole('button', { name: /apri manuale/i }));
    expect(screen.getByTestId('mock-volume')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /video/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /capitoli/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fumetto/i })).not.toBeInTheDocument();
  });
});
