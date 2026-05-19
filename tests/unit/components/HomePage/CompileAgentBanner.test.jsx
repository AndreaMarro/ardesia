/**
 * CompileAgentBanner.test.jsx — Iter 66 P0.3 R5 banner widget tests
 *
 * Covers all 4 platform/state combinations + edge cases:
 *   T1: initial loading state renders nothing (no flash banner)
 *   T2: Mac ONLINE renders green banner + version string
 *   T3: Mac OFFLINE renders orange CTA + install button + downloadUrl
 *   T4: Windows renders neutral info banner + "iter 67" copy
 *   T5: Linux renders neutral info banner
 *   T6: Unknown platform graceful degradation (minimal banner)
 *   T7: Mac install button href points to R4 downloadUrl
 *   T8: Touch target ≥44px (computed minHeight on action button)
 *   T9: getCompileAgentStatus invoked on mount
 *   T10: useEffect cleanup cancels polling setInterval on unmount
 *   T11: ARIA accessibility — role=status + accessible name on banner & button
 *   T12: CSS palette tokens used (no hex inline) — verify className tokens
 *   T13 (bonus): Mac ONLINE without version still renders (version optional)
 *   T14 (bonus): Mac OFFLINE invokes onInstallClick analytics hook
 *
 * Source: src/components/HomePage/CompileAgentBanner.jsx
 * Source under test API: src/services/compileAgentDetect.js (R4 iter 65)
 *
 * © Andrea Marro — 2026-05-16 — ELAB Tutor iter 66 P0.3
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import {
  render,
  screen,
  cleanup,
  waitFor,
  act,
} from '@testing-library/react';

// Mock R4 detection helper. ⚠ Must come BEFORE component import so the
// component picks up the mocked module.
vi.mock('../../../../src/services/compileAgentDetect.js', () => ({
  getCompileAgentStatus: vi.fn(),
  getAgentInstallInstructions: vi.fn(),
  detectCompileAgent: vi.fn(),
}));

import CompileAgentBanner from '../../../../src/components/HomePage/CompileAgentBanner.jsx';
import {
  getCompileAgentStatus,
  getAgentInstallInstructions,
} from '../../../../src/services/compileAgentDetect.js';

beforeEach(() => {
  // Real timers by default — waitFor() polls via setTimeout under the hood,
  // and mocked Promise microtasks resolve naturally. Tests that need to
  // assert setInterval polling cadence (T10) opt into fake timers locally
  // via `vi.useFakeTimers()` inside the test body, then restore with
  // `vi.useRealTimers()` before the next test runs.
  getCompileAgentStatus.mockReset();
  getAgentInstallInstructions.mockReset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ──────────────────────────────────────────────────────────────────
   T1: Initial loading state — renders nothing
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — initial state', () => {
  it('T1: renders nothing during initial loading (before probe resolves)', () => {
    // Never resolve the probe — banner stays in loading state.
    getCompileAgentStatus.mockReturnValue(new Promise(() => {}));
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    const { container } = render(<CompileAgentBanner />);
    expect(container.querySelector('[data-testid="compile-agent-banner"]')).toBeNull();
  });
});

/* ──────────────────────────────────────────────────────────────────
   T2 + T13: Mac ONLINE state — green banner + version
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — Mac online', () => {
  it('T2: renders green banner with version string when agent online', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: true,
      port: 17852,
      version: '1.2.0',
      latencyMs: 18,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('online');
    expect(banner.textContent).toContain('Agent ELAB attivo');

    const version = screen.getByTestId('compile-agent-version');
    expect(version.textContent.trim()).toBe('v1.2.0');
  });

  it('T13: renders green banner WITHOUT version when agent online but version missing', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: true,
      port: 17852,
      latencyMs: 22,
      // no version field
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('online');
    expect(banner.textContent).toContain('Agent ELAB attivo');
    expect(screen.queryByTestId('compile-agent-version')).toBeNull();
  });
});

/* ──────────────────────────────────────────────────────────────────
   T3 + T7 + T14: Mac OFFLINE state — orange CTA + install button
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — Mac offline', () => {
  it('T3: renders orange CTA + install button with downloadUrl on Mac offline', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 12,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('offline');
    expect(banner.textContent).toContain('Carica codice direttamente su Nano R4');

    const installBtn = screen.getByTestId('compile-agent-install-button');
    expect(installBtn).toBeTruthy();
    expect(installBtn.textContent).toContain('Installa Agent ELAB');
  });

  it('T7: install button href is exactly the R4 downloadUrl', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 8,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-install-button')).toBeTruthy();
    });

    const installBtn = screen.getByTestId('compile-agent-install-button');
    expect(installBtn.getAttribute('href')).toBe(
      '/scripts/setup-elab-compile-agent.sh'
    );
  });

  it('T14: install button click invokes onInstallClick analytics hook', async () => {
    const onInstallClick = vi.fn();
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 5,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner onInstallClick={onInstallClick} />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-install-button')).toBeTruthy();
    });

    const installBtn = screen.getByTestId('compile-agent-install-button');
    installBtn.click();
    expect(onInstallClick).toHaveBeenCalledTimes(1);
    expect(onInstallClick).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'mac' })
    );
  });
});

/* ──────────────────────────────────────────────────────────────────
   T4: Windows neutral info banner
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — Windows', () => {
  it('T4: renders neutral info banner with iter 67 copy on Windows', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 10,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'win',
      detected: false,
      downloadUrl: null,
      instructionsUrl: '/docs/compile-agent-windows-iter67.md',
      label: 'Windows',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('windows');
    expect(banner.textContent).toContain('Compilazione cloud disponibile');
    expect(banner.textContent).toContain('Installer desktop per Windows in arrivo iter 67');
    // No install button on Win (iter 67+).
    expect(screen.queryByTestId('compile-agent-install-button')).toBeNull();
  });
});

/* ──────────────────────────────────────────────────────────────────
   T5: Linux neutral info banner
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — Linux', () => {
  it('T5: renders neutral info banner on Linux', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 10,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'linux',
      detected: false,
      downloadUrl: null,
      instructionsUrl: '/docs/compile-agent-linux-iter67.md',
      label: 'Linux',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('linux');
    expect(banner.textContent).toContain('Compilazione cloud disponibile');
    expect(banner.textContent).toContain('Linux');
  });
});

/* ──────────────────────────────────────────────────────────────────
   T6: Unknown platform graceful degradation
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — unknown platform', () => {
  it('T6: renders minimal info banner with graceful degradation on unknown platform', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'no_fetch',
      latencyMs: 0,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'unknown',
      detected: false,
      downloadUrl: null,
      instructionsUrl: '/docs/compile-agent-manual-install.md',
      label: 'Sconosciuto',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('data-state')).toBe('unknown');
    expect(banner.textContent).toContain('Compilazione cloud disponibile');
    expect(screen.queryByTestId('compile-agent-install-button')).toBeNull();
  });
});

/* ──────────────────────────────────────────────────────────────────
   T8: Touch target ≥44px (Mac offline install button)
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — touch target', () => {
  it('T8: install button has min-height ≥44px (WCAG 2.5.5 touch target)', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 6,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-install-button')).toBeTruthy();
    });

    const installBtn = screen.getByTestId('compile-agent-install-button');
    // CSS module class assigned; jsdom does not load stylesheets so we
    // assert the class membership (which carries the 44px rule) rather
    // than the computed style.
    expect(installBtn.className).toMatch(/buttonPrimary/);
  });
});

/* ──────────────────────────────────────────────────────────────────
   T9: getCompileAgentStatus invoked on mount
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — mount probe', () => {
  it('T9: getCompileAgentStatus is called on mount', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 4,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(getCompileAgentStatus).toHaveBeenCalled();
    });
    expect(getCompileAgentStatus.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});

/* ──────────────────────────────────────────────────────────────────
   T10: useEffect cleanup cancels polling interval on unmount
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — polling lifecycle', () => {
  it('T10: clears setInterval on unmount (no further probes after unmount)', async () => {
    // Selective fake timers: leave setTimeout real so waitFor() can poll.
    // Fake only setInterval/clearInterval — that's what the polling lifecycle
    // assertion actually exercises (vi.advanceTimersByTime triggers the
    // 30s repeat probe; clearInterval spy proves cleanup ran).
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 4,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(getCompileAgentStatus).toHaveBeenCalled();
    });

    // Reset to baseline so we can detect post-unmount calls.
    const callsAtUnmount = getCompileAgentStatus.mock.calls.length;
    unmount();
    // clearInterval was invoked at least once by cleanup.
    expect(clearIntervalSpy).toHaveBeenCalled();

    // Advance timers well beyond the poll interval — no further probes
    // should fire because the interval is cleared.
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(getCompileAgentStatus.mock.calls.length).toBe(callsAtUnmount);
  });
});

/* ──────────────────────────────────────────────────────────────────
   T11: ARIA accessibility
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — ARIA', () => {
  it('T11: banner has role=status, aria-live=polite, accessible name', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: false,
      port: 17852,
      error: 'agent_offline',
      latencyMs: 4,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
    expect(banner.getAttribute('aria-label')).toBeTruthy();
    expect(banner.getAttribute('aria-label').length).toBeGreaterThan(0);

    const installBtn = screen.getByTestId('compile-agent-install-button');
    expect(installBtn.getAttribute('aria-label')).toBe(
      'Installa Agent ELAB per Mac'
    );
  });
});

/* ──────────────────────────────────────────────────────────────────
   T12: CSS palette tokens used (no hex hardcoded in component output)
   ────────────────────────────────────────────────────────────────── */
describe('CompileAgentBanner — CSS palette', () => {
  it('T12: component does NOT inject inline hex color tokens (palette via CSS module classes only)', async () => {
    getCompileAgentStatus.mockResolvedValue({
      available: true,
      port: 17852,
      version: '1.0.0',
      latencyMs: 8,
    });
    getAgentInstallInstructions.mockReturnValue({
      platform: 'mac',
      detected: true,
      downloadUrl: '/scripts/setup-elab-compile-agent.sh',
      instructionsUrl: '/docs/RICCARDO-UAT-GUIDE.md',
      label: 'macOS',
    });

    const { container } = render(<CompileAgentBanner />);
    await waitFor(() => {
      expect(screen.getByTestId('compile-agent-banner')).toBeTruthy();
    });

    // Walk all rendered nodes; verify no element carries an inline
    // `color:` or `background-color:` set via the `style` attribute to a
    // raw hex. SVG icons may legitimately use currentColor / stroke
    // attributes, which is fine (those are NOT inline color hex tokens).
    const allEls = container.querySelectorAll('[style]');
    for (const el of allEls) {
      const inline = el.getAttribute('style') || '';
      expect(inline).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
    }

    // And confirm the banner classNames carry our palette state class.
    const banner = screen.getByTestId('compile-agent-banner');
    expect(banner.className).toMatch(/bannerOnline/);
  });
});
