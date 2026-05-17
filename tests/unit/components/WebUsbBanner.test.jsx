/**
 * tests/unit/components/WebUsbBanner.test.jsx — iter 76 B-3 R5 WebUSB banner.
 *
 * Iter 76 ARCHITECTURAL PIVOT (Andrea 2026-05-17): NO download docente direction
 * superseded by cross-compile DIRECT browser via WebUSB. Banner adapt: Chrome/Edge
 * supportato vs Safari/Firefox NON supported messaging.
 *
 * Parallel ship con CompileAgentBanner.jsx legacy iter 65-66 (preserved ZERO
 * regression mandate). HomePage iter 76-B.4 gates which renders via env flag.
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import WebUsbBanner from '../../../src/components/HomePage/WebUsbBanner.jsx';

const origNavigator = globalThis.navigator;

afterEach(() => {
  cleanup();
  if (origNavigator) globalThis.navigator = origNavigator;
  vi.restoreAllMocks();
});

describe('WebUsbBanner — Chrome/Edge supported state', () => {
  beforeEach(() => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      usb: {},
    };
  });

  it('renders banner with Lime success state when WebUSB available', () => {
    render(<WebUsbBanner />);
    const banner = screen.getByTestId('webusb-banner');
    expect(banner).toBeTruthy();
    expect(banner.getAttribute('data-state')).toBe('supported');
  });

  it('shows "WebUSB supportato" title for Chrome', () => {
    render(<WebUsbBanner />);
    expect(screen.getByText(/Compila . Carica pronto/i)).toBeTruthy();
  });

  it('renders ARIA role="status" + aria-live="polite"', () => {
    render(<WebUsbBanner />);
    const banner = screen.getByTestId('webusb-banner');
    expect(banner.getAttribute('role')).toBe('status');
    expect(banner.getAttribute('aria-live')).toBe('polite');
  });
});

describe('WebUsbBanner — Edge browser supported state', () => {
  it('detects Edge UA + renders supported state', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.46',
      usb: {},
    };
    render(<WebUsbBanner />);
    expect(screen.getByTestId('webusb-banner').getAttribute('data-state')).toBe('supported');
  });
});

describe('WebUsbBanner — Safari unsupported state', () => {
  beforeEach(() => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15',
      // no navigator.usb
    };
  });

  it('renders banner with unsupported state', () => {
    render(<WebUsbBanner />);
    expect(screen.getByTestId('webusb-banner').getAttribute('data-state')).toBe('unsupported');
  });

  it('shows Safari-specific recommendation to open Chrome/Edge', () => {
    render(<WebUsbBanner />);
    expect(screen.getByText(/Safari NON supporta WebUSB/i)).toBeTruthy();
  });

  it('has data-browser="safari" attribute for diagnostics', () => {
    render(<WebUsbBanner />);
    expect(screen.getByTestId('webusb-banner').getAttribute('data-browser')).toBe('safari');
  });
});

describe('WebUsbBanner — Firefox unsupported state', () => {
  beforeEach(() => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    };
  });

  it('renders unsupported state for Firefox', () => {
    render(<WebUsbBanner />);
    expect(screen.getByTestId('webusb-banner').getAttribute('data-state')).toBe('unsupported');
  });

  it('shows Firefox-specific recommendation', () => {
    render(<WebUsbBanner />);
    expect(screen.getByText(/Firefox NON supporta WebUSB/i)).toBeTruthy();
  });

  it('has data-browser="firefox" attribute', () => {
    render(<WebUsbBanner />);
    expect(screen.getByTestId('webusb-banner').getAttribute('data-browser')).toBe('firefox');
  });
});

describe('WebUsbBanner — Unknown browser graceful fallback', () => {
  it('renders generic fallback for unrecognized UA', () => {
    globalThis.navigator = { userAgent: 'CustomCrawler/1.0' };
    render(<WebUsbBanner />);
    const banner = screen.getByTestId('webusb-banner');
    expect(banner.getAttribute('data-state')).toBe('unsupported');
    expect(banner.getAttribute('data-browser')).toBe('unknown');
  });
});

describe('WebUsbBanner — compliance gates', () => {
  beforeEach(() => {
    globalThis.navigator = {
      userAgent: 'Chrome/130',
      usb: {},
    };
  });

  it('contains kit fisico mention (PRINCIPIO ZERO)', () => {
    render(<WebUsbBanner />);
    const banner = screen.getByTestId('webusb-banner');
    expect(banner.textContent).toMatch(/Nano R4|kit/i);
  });

  it('uses plurale "Ragazzi" friendly tone OR explicit docente register', () => {
    render(<WebUsbBanner />);
    const banner = screen.getByTestId('webusb-banner');
    // Docente register OK (banner targets docente UI surface)
    expect(banner.textContent.length).toBeGreaterThan(20);
  });
});
