/**
 * webUsbDetect.js — iter 76 WebUSB cross-compile direction (Andrea pivot 2026-05-17).
 *
 * Andrea direttiva: "Non deve essere qualcosa che scarichi. Deve funzionare
 * DIRETTAMENTE dalla piattaforma elabtutor."
 *
 * Browser-side feature detection for WebUSB API + Nano R4 specific device
 * filter. Chrome/Edge ONLY (Safari + Firefox NON support WebUSB).
 *
 * Architecture:
 *   1. Browser → WebUSB API → user gesture device picker
 *   2. Frontend POST sketch to Cloud Compile Service (Render Docker arduino-cli)
 *   3. Cloud returns HEX bytes base64
 *   4. Browser WebUSB DFU flash direct to Nano R4 (no local install)
 *
 * This module covers ONLY step 1 (capability + device probe). Cloud compile
 * via `src/services/api.js compileCode()` (iter 76 B-4 refactor). Flash via
 * `src/services/webDfuFlash.js` (iter 76 B-2 future scaffold).
 *
 * Separation from legacy `compileAgentDetect.js` (iter 65-71 local agent
 * dev mode): iter 76 prod path uses webUsbDetect; local agent retained dev
 * fallback when `import.meta.env.VITE_USE_LOCAL_AGENT === 'true'`.
 *
 * @module services/webUsbDetect
 * @copyright © Andrea Marro — 2026 — ELAB Tutor — Tutti i diritti riservati
 */

/**
 * Arduino Nano R4 USB vendor + product IDs.
 *
 * Source: Arduino Renesas board definition `arduino:renesas_uno:nanor4`
 * → arduino-cli board details FQBN reveals usbProduct/usbVendor.
 *
 * IMPORTANT iter 76: values BELOW are placeholder candidates pending
 * empirical verification iter 76 B-2 first hardware run Andrea/Tea.
 * Real Nano R4 USB descriptor query required to confirm. Arduino vendor
 * 0x2341 confirmed. Product TBD (likely 0x0070 OR 0x0069 per Arduino
 * Nano family — verify via macOS `system_profiler SPUSBDataType | grep
 * -i nano` con board connected).
 *
 * If wrong filter → `requestDevice` user picker mostra ALL USB devices
 * (worst case UX) MA NO crash.
 */
export const NANO_R4_USB_FILTERS = Object.freeze([
  Object.freeze({ vendorId: 0x2341 }), // Arduino vendor — broad filter iter 76 A
  // Object.freeze({ vendorId: 0x2341, productId: 0x0070 }), // narrow iter 76 B-2 post empirical verify
]);

/**
 * Capability detection — returns object describing browser support.
 *
 * Pure function. NO side effects (NO device prompt user gesture required).
 * Safe to call render-time (no useEffect needed).
 *
 * @returns {{
 *   webUsbAvailable: boolean,
 *   browser: 'chrome'|'edge'|'firefox'|'safari'|'unknown',
 *   userAgent: string,
 *   recommendation: string
 * }}
 */
export function detectWebUSBCapability() {
  if (typeof navigator === 'undefined') {
    return {
      webUsbAvailable: false,
      browser: 'unknown',
      userAgent: '',
      recommendation: 'Ambiente NON browser. WebUSB richiede browser Chrome OR Edge.',
    };
  }

  const ua = navigator.userAgent || '';
  let browser = 'unknown';
  if (/Edg\//.test(ua)) browser = 'edge';
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = 'chrome';
  else if (/Firefox\//.test(ua)) browser = 'firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'safari';

  const webUsbAvailable = typeof navigator.usb !== 'undefined';

  let recommendation;
  if (webUsbAvailable) {
    recommendation = 'WebUSB supportato — Compila & Carica pronto.';
  } else if (browser === 'safari') {
    recommendation = 'Safari NON supporta WebUSB. Aprite Chrome OR Edge per usare Compila & Carica.';
  } else if (browser === 'firefox') {
    recommendation = 'Firefox NON supporta WebUSB. Aprite Chrome OR Edge per usare Compila & Carica.';
  } else {
    recommendation = 'Browser sconosciuto. Aprite Chrome OR Edge (versione recente) per usare Compila & Carica.';
  }

  return { webUsbAvailable, browser, userAgent: ua, recommendation };
}

/**
 * Request user permission to access Nano R4 device. REQUIRES user gesture
 * (click handler) per browser security policy. Throws otherwise.
 *
 * @param {object} [opts]
 * @param {Array} [opts.filters] Override USB filters (default Nano R4).
 * @returns {Promise<USBDevice|null>} Selected device OR null if user dismissed.
 */
export async function requestNanoR4Device(opts = {}) {
  if (typeof navigator === 'undefined' || !navigator.usb) {
    throw new Error('web_usb_unavailable');
  }
  const filters = opts.filters || NANO_R4_USB_FILTERS;
  try {
    const device = await navigator.usb.requestDevice({ filters });
    return device;
  } catch (err) {
    // User dismissed picker = DOMException 'NotFoundError' OR similar
    if (err?.name === 'NotFoundError') return null;
    throw err;
  }
}

/**
 * Get list of previously-authorized devices (no user gesture required).
 * Use for auto-reconnect post-page-refresh.
 *
 * @returns {Promise<USBDevice[]>}
 */
export async function getAuthorizedDevices() {
  if (typeof navigator === 'undefined' || !navigator.usb) return [];
  try {
    return await navigator.usb.getDevices();
  } catch (_) {
    return [];
  }
}

/**
 * Convenience: high-level status combining capability + authorized devices.
 *
 * @returns {Promise<{
 *   webUsbAvailable: boolean,
 *   browser: string,
 *   authorizedDevices: number,
 *   recommendation: string
 * }>}
 */
export async function getWebUsbStatus() {
  const cap = detectWebUSBCapability();
  if (!cap.webUsbAvailable) {
    return { ...cap, authorizedDevices: 0 };
  }
  const devices = await getAuthorizedDevices();
  return { ...cap, authorizedDevices: devices.length };
}
