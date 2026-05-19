/**
 * tests/unit/services/webUsbDetect.test.js — iter 76 WebUSB feature detect.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  detectWebUSBCapability,
  requestNanoR4Device,
  getAuthorizedDevices,
  getWebUsbStatus,
  NANO_R4_USB_FILTERS,
} from '../../../src/services/webUsbDetect.js';

const origNavigator = globalThis.navigator;

beforeEach(() => {
  // Default reset — jsdom navigator preserved unless test overrides
});

afterEach(() => {
  if (origNavigator) globalThis.navigator = origNavigator;
  vi.restoreAllMocks();
});

describe('webUsbDetect — constants', () => {
  it('exports NANO_R4_USB_FILTERS containing Arduino vendor 0x2341', () => {
    expect(Array.isArray(NANO_R4_USB_FILTERS)).toBe(true);
    expect(NANO_R4_USB_FILTERS.length).toBeGreaterThan(0);
    expect(NANO_R4_USB_FILTERS[0].vendorId).toBe(0x2341);
  });
});

describe('detectWebUSBCapability — browser sniffing', () => {
  it('returns webUsbAvailable=true + browser=chrome + recommendation OK when navigator.usb present + Chrome UA', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      usb: {},
    };
    const cap = detectWebUSBCapability();
    expect(cap.webUsbAvailable).toBe(true);
    expect(cap.browser).toBe('chrome');
    expect(cap.recommendation).toMatch(/pronto|supportato/i);
  });

  it('returns browser=edge when Edg/ in UA', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.46',
      usb: {},
    };
    const cap = detectWebUSBCapability();
    expect(cap.browser).toBe('edge');
    expect(cap.webUsbAvailable).toBe(true);
  });

  it('returns webUsbAvailable=false + browser=safari + Aprite Chrome recommendation when Safari UA', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      // no navigator.usb
    };
    const cap = detectWebUSBCapability();
    expect(cap.webUsbAvailable).toBe(false);
    expect(cap.browser).toBe('safari');
    expect(cap.recommendation).toMatch(/Safari NON supporta WebUSB/);
    expect(cap.recommendation).toMatch(/Chrome OR Edge/);
  });

  it('returns webUsbAvailable=false + browser=firefox when Firefox UA', () => {
    globalThis.navigator = {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
    };
    const cap = detectWebUSBCapability();
    expect(cap.webUsbAvailable).toBe(false);
    expect(cap.browser).toBe('firefox');
    expect(cap.recommendation).toMatch(/Firefox NON supporta WebUSB/);
  });

  it('returns browser=unknown + safe fallback recommendation when unrecognized UA', () => {
    globalThis.navigator = { userAgent: 'CustomCrawler/1.0' };
    const cap = detectWebUSBCapability();
    expect(cap.browser).toBe('unknown');
    expect(cap.webUsbAvailable).toBe(false);
    expect(cap.recommendation).toMatch(/Chrome OR Edge/);
  });

  it('handles missing navigator gracefully (SSR/Node context)', () => {
    // jsdom always provides navigator. Simulate absence by deleting temporarily.
    const tmp = globalThis.navigator;
    delete globalThis.navigator;
    const cap = detectWebUSBCapability();
    expect(cap.webUsbAvailable).toBe(false);
    expect(cap.browser).toBe('unknown');
    expect(cap.recommendation).toMatch(/NON browser|Chrome OR Edge/);
    globalThis.navigator = tmp;
  });
});

describe('requestNanoR4Device — user gesture flow', () => {
  it('throws web_usb_unavailable when navigator.usb missing', async () => {
    globalThis.navigator = { userAgent: 'Safari' };
    await expect(requestNanoR4Device()).rejects.toThrow('web_usb_unavailable');
  });

  it('returns USBDevice when navigator.usb.requestDevice resolves', async () => {
    const mockDevice = { vendorId: 0x2341, productId: 0x0070 };
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { requestDevice: vi.fn().mockResolvedValue(mockDevice) },
    };
    const dev = await requestNanoR4Device();
    expect(dev).toBe(mockDevice);
    expect(globalThis.navigator.usb.requestDevice).toHaveBeenCalledWith({ filters: NANO_R4_USB_FILTERS });
  });

  it('returns null when user dismisses picker (NotFoundError)', async () => {
    const err = new Error('No device selected');
    err.name = 'NotFoundError';
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { requestDevice: vi.fn().mockRejectedValue(err) },
    };
    const dev = await requestNanoR4Device();
    expect(dev).toBeNull();
  });

  it('rethrows non-NotFoundError exceptions', async () => {
    const err = new Error('Security policy');
    err.name = 'SecurityError';
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { requestDevice: vi.fn().mockRejectedValue(err) },
    };
    await expect(requestNanoR4Device()).rejects.toThrow('Security policy');
  });

  it('accepts custom filters override', async () => {
    const mockDevice = { vendorId: 0x9999 };
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { requestDevice: vi.fn().mockResolvedValue(mockDevice) },
    };
    const filters = [{ vendorId: 0x9999 }];
    await requestNanoR4Device({ filters });
    expect(globalThis.navigator.usb.requestDevice).toHaveBeenCalledWith({ filters });
  });
});

describe('getAuthorizedDevices — no user gesture', () => {
  it('returns [] when navigator.usb missing', async () => {
    globalThis.navigator = { userAgent: 'Safari' };
    const devs = await getAuthorizedDevices();
    expect(devs).toEqual([]);
  });

  it('returns devices array from navigator.usb.getDevices', async () => {
    const mockDevices = [{ vendorId: 0x2341 }, { vendorId: 0x2341 }];
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { getDevices: vi.fn().mockResolvedValue(mockDevices) },
    };
    const devs = await getAuthorizedDevices();
    expect(devs).toEqual(mockDevices);
  });

  it('returns [] gracefully on getDevices error', async () => {
    globalThis.navigator = {
      userAgent: 'Chrome',
      usb: { getDevices: vi.fn().mockRejectedValue(new Error('blocked')) },
    };
    const devs = await getAuthorizedDevices();
    expect(devs).toEqual([]);
  });
});

describe('getWebUsbStatus — combined status', () => {
  it('returns webUsbAvailable=false + authorizedDevices=0 when navigator.usb missing', async () => {
    globalThis.navigator = { userAgent: 'Mozilla/5.0 (Macintosh) Version/17.0 Safari/605.1.15' };
    const status = await getWebUsbStatus();
    expect(status.webUsbAvailable).toBe(false);
    expect(status.authorizedDevices).toBe(0);
    expect(status.browser).toBe('safari');
  });

  it('returns authorizedDevices count when WebUSB available', async () => {
    globalThis.navigator = {
      userAgent: 'Chrome/130',
      usb: { getDevices: vi.fn().mockResolvedValue([{ a: 1 }, { b: 2 }]) },
    };
    const status = await getWebUsbStatus();
    expect(status.webUsbAvailable).toBe(true);
    expect(status.authorizedDevices).toBe(2);
  });
});
