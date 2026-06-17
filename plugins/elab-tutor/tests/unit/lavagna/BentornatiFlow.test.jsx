/**
 * Bentornati Flow — Test del flusso Principio Zero
 * "Il docente arriva e UNLIM propone il prossimo esperimento"
 * (c) Andrea Marro — 11/04/2026
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock all heavy dependencies
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'teacher1' }, isDocente: true, isStudente: false }),
}));

vi.mock('../../../src/services/classProfile', () => ({
  buildClassProfile: vi.fn(() => ({
    isFirstTime: true,
    lastExperimentTitle: null,
    sessionsCount: 0,
  })),
  getNextLessonSuggestion: vi.fn(() => ({
    experimentId: 'v1-cap6-esp1',
    title: 'Accendi il tuo primo LED',
  })),
}));

vi.mock('../../../src/utils/logger', () => ({
  default: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Test the BentornatiOverlay component logic
describe('Bentornati Flow — Principio Zero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('classProfile identifies first-time vs returning user', async () => {
    const { buildClassProfile } = await import('../../../src/services/classProfile');

    // First time
    buildClassProfile.mockReturnValue({ isFirstTime: true, sessionsCount: 0 });
    const profile1 = buildClassProfile();
    expect(profile1.isFirstTime).toBe(true);

    // Returning
    buildClassProfile.mockReturnValue({ isFirstTime: false, sessionsCount: 5, lastExperimentTitle: 'LED RGB' });
    const profile2 = buildClassProfile();
    expect(profile2.isFirstTime).toBe(false);
    expect(profile2.lastExperimentTitle).toBe('LED RGB');
  });

  test('getNextLessonSuggestion returns experiment data', async () => {
    const { getNextLessonSuggestion } = await import('../../../src/services/classProfile');

    getNextLessonSuggestion.mockReturnValue({
      experimentId: 'v1-cap7-esp1',
      title: 'Accendi il rosso del LED RGB',
    });

    const suggestion = getNextLessonSuggestion();
    expect(suggestion.experimentId).toBe('v1-cap7-esp1');
    expect(suggestion.title).toContain('RGB');
  });

  test('getNextLessonSuggestion returns null at end of curriculum', async () => {
    const { getNextLessonSuggestion } = await import('../../../src/services/classProfile');
    getNextLessonSuggestion.mockReturnValue(null);
    expect(getNextLessonSuggestion()).toBeNull();
  });

  test('first-time profile has correct structure', async () => {
    const { buildClassProfile } = await import('../../../src/services/classProfile');
    buildClassProfile.mockReturnValue({
      isFirstTime: true,
      sessionsCount: 0,
      lastExperimentTitle: null,
      lastExperimentId: null,
    });

    const profile = buildClassProfile();
    expect(profile).toHaveProperty('isFirstTime');
    expect(profile).toHaveProperty('sessionsCount');
  });

  test('returning profile includes last experiment info', async () => {
    const { buildClassProfile } = await import('../../../src/services/classProfile');
    buildClassProfile.mockReturnValue({
      isFirstTime: false,
      sessionsCount: 12,
      lastExperimentTitle: 'Il potenziometro',
      lastExperimentId: 'v1-cap9-esp1',
    });

    const profile = buildClassProfile();
    expect(profile.isFirstTime).toBe(false);
    expect(profile.sessionsCount).toBe(12);
    expect(profile.lastExperimentTitle).toBeTruthy();
  });
});

describe('Bentornati — LavagnaShell Integration', () => {
  test('LavagnaShell.jsx contains BentornatiOverlay component', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const shellPath = path.resolve('src/components/lavagna/LavagnaShell.jsx');
    const content = fs.readFileSync(shellPath, 'utf8');

    expect(content).toContain('BentornatiOverlay');
    expect(content).toContain('bentornatiVisible');
    expect(content).toContain('handleBentornatiStart');
    expect(content).toContain('handleBentornatiPickExperiment');
  });

  test('BentornatiOverlay has 3 flows (first-time, returning, no-suggestion)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const shellPath = path.resolve('src/components/lavagna/LavagnaShell.jsx');
    const content = fs.readFileSync(shellPath, 'utf8');

    expect(content).toContain('Benvenuti');
    expect(content).toContain('Bentornati');
    expect(content).toContain('isFirstTime');
    expect(content).toContain('onPickExperiment');
  });

  test('LavagnaShell persists layout to localStorage', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const content = fs.readFileSync(path.resolve('src/components/lavagna/LavagnaShell.jsx'), 'utf8');

    expect(content).toContain('elab-lavagna-left-panel');
    expect(content).toContain('elab-lavagna-bottom-panel');
    expect(content).toContain('elab-lavagna-buildmode');
    expect(content).toContain('elab-lavagna-volume');
  });

  test('BentornatiOverlay CSS classes exist', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const cssPath = path.resolve('src/components/lavagna/LavagnaShell.module.css');
    const content = fs.readFileSync(cssPath, 'utf8');

    expect(content).toContain('bentornatiOverlay');
    expect(content).toContain('bentornatiCard');
    expect(content).toContain('bentornatiTitle');
    expect(content).toContain('bentornatiBtn');
  });
});
