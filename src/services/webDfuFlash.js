/**
 * webDfuFlash.js — iter 78 B.2.3 WebUSB DFU flash adapter wrapping `dfu`
 * library (flipperdevices/webdfu MIT v0.1.5) for Nano R4 cross-compile.
 *
 * Andrea mandate iter 78 entrance: "no demo, deve funzionare certamente".
 * Codex Pattern V design verdict (iter 78 entrance): `webdfu.write()` is
 * EVENT-DRIVEN (returns WebDFUProcessWrite with events.on('end'/'error')),
 * NOT a Promise. README sample misleading. Adapter wires events to Promise.
 *
 * Real-vs-simulated honest contract:
 *   { mode: 'real' | 'simulated', verified: boolean, evidence: object }
 *
 * NO false claim "Caricato" without dfu process 'end' event observed.
 *
 * @copyright © Andrea Marro — 2026 — ELAB Tutor iter 78 B.2.3
 */

import { WebDFU } from 'dfu';

/**
 * Default DFU transfer size for Renesas RA4M1 (Arduino Nano R4 bootloader).
 * 64-byte chunks per USB Full Speed bulk transfer max. Larger sizes
 * possible MA conservative default for first-iteration MVP iter 78.
 */
const DEFAULT_TRANSFER_SIZE = 64;

/**
 * Default manifestation tolerance flag (Renesas DFU 1.1 default).
 * True = device handles manifestation phase internally without disconnect.
 * False = device disconnects mid-manifestation, browser must re-enumerate.
 */
const DEFAULT_MANIFESTATION_TOLERANT = true;

/**
 * No-op log object — required by dfu library constructor per Codex
 * design verdict (constructor types: `new WebDFU(device, settings, log)`).
 * README omits log arg, MA runtime calls log.warning during manifestation
 * paths → unhandled TypeError without this.
 */
const NOOP_LOG = {
  info: () => { /* noop */ },
  warning: () => { /* noop */ },
  progress: () => { /* noop */ },
};

/**
 * Flash result envelope honest contract per Codex Pattern V design verdict.
 *
 * @typedef {Object} FlashResult
 * @property {boolean} ok — true ONLY if dfu 'end' event observed
 * @property {'real'|'simulated'} mode — real hardware flash OR mock simulation
 * @property {boolean} verified — true ONLY if read-back upload verified bytes
 * @property {Object} evidence — { endEventReceived, bytesTransferred, durationMs, deviceInfo, error? }
 * @property {string} [error] — error message if ok=false
 */

/**
 * Flash binary firmware image to USB DFU device via WebUSB.
 *
 * Codex design verdict iter 78 entrance honored:
 * - `webdfu.write()` returns WebDFUProcessWrite (event-driven), NOT Promise
 * - Adapter wraps proc.events.on('end') + .on('error') into Promise
 * - Log arg passed (otherwise warning calls crash)
 * - Real-vs-simulated mode detection via device descriptor / mock marker
 *
 * @param {USBDevice} device — USBDevice from navigator.usb.requestDevice
 * @param {Uint8Array} binary — firmware binary (from intelHexParser)
 * @param {object} [opts]
 * @param {number} [opts.transferSize=64] — bytes per DFU DNLOAD chunk
 * @param {boolean} [opts.manifestationTolerant=true] — DFU 1.1 manifestation handling
 * @param {function} [opts.onProgress] — progress callback ({bytesTransferred, totalBytes})
 * @param {function} [opts.onStart] — start callback ({totalBytes})
 * @param {Function} [opts.webDfuImpl] — WebDFU constructor override (tests).
 * @returns {Promise<FlashResult>}
 */
export async function flashDfuFirmware(device, binary, opts = {}) {
  if (!device || typeof device !== 'object') {
    throw new TypeError('flashDfuFirmware: USBDevice required');
  }
  if (!(binary instanceof Uint8Array)) {
    throw new TypeError('flashDfuFirmware: binary must be Uint8Array');
  }
  if (binary.length === 0) {
    throw new RangeError('flashDfuFirmware: empty binary');
  }

  const transferSize = opts.transferSize || DEFAULT_TRANSFER_SIZE;
  const manifestationTolerant = opts.manifestationTolerant !== false
    ? DEFAULT_MANIFESTATION_TOLERANT
    : false;
  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
  const onStart = typeof opts.onStart === 'function' ? opts.onStart : null;

  const startTime = Date.now();

  // Mode detection: mock USBDevice (test scaffold) has __elabMockMode marker
  // per iter 78 B.2.4 emulator convention. Real navigator.usb device lacks it.
  const mode = device.__elabMockMode === 'simulated' ? 'simulated' : 'real';

  // iter 103 — device + DFU descriptors for hardware-UAT discovery. Enriched
  // after connect() with the real DFU properties WebDFU parses from the board.
  const deviceInfo = {
    vendorId: device && device.vendorId,
    productId: device && device.productId,
    dfuVersion: null,
    webdfuType: null,
    transferSize: null,
    manifestationTolerant: null,
    dfuseFirstSegmentStart: null,
  };

  // iter 103 — WebDFU constructor is injectable for tests (the mock USBDevice
  // cannot reproduce every real DFU descriptor — a fake covers those paths).
  const WebDFUCtor = (opts && opts.webDfuImpl) || WebDFU;

  let webdfu;
  try {
    webdfu = new WebDFUCtor(device, { forceInterfacesName: true }, NOOP_LOG);
    await webdfu.init();
  } catch (err) {
    return {
      ok: false,
      mode,
      verified: false,
      evidence: { endEventReceived: false, bytesTransferred: 0, durationMs: Date.now() - startTime, deviceInfo },
      error: `init_failed: ${err.message || err}`,
    };
  }

  if (!webdfu.interfaces || webdfu.interfaces.length === 0) {
    return {
      ok: false,
      mode,
      verified: false,
      evidence: { endEventReceived: false, bytesTransferred: 0, durationMs: Date.now() - startTime, deviceInfo },
      error: 'no_dfu_interfaces',
    };
  }

  try {
    await webdfu.connect(0);
  } catch (err) {
    return {
      ok: false,
      mode,
      verified: false,
      evidence: { endEventReceived: false, bytesTransferred: 0, durationMs: Date.now() - startTime, deviceInfo },
      error: `connect_failed: ${err.message || err}`,
    };
  }

  // iter 103 — enrich deviceInfo with the real DFU descriptors WebDFU parsed
  // from the board. dfuVersion 0x011a marks a DfuSe device; anything else is
  // plain DFU. Logged + returned so a hardware UAT reveals the real behaviour
  // instead of the app assuming it.
  if (webdfu.properties) {
    deviceInfo.dfuVersion = webdfu.properties.DFUVersion ?? null;
    deviceInfo.transferSize = webdfu.properties.TransferSize ?? null;
    deviceInfo.manifestationTolerant = webdfu.properties.ManifestationTolerant ?? null;
  }
  deviceInfo.webdfuType = webdfu.type ?? null;
  if (webdfu.dfuseMemoryInfo
    && Array.isArray(webdfu.dfuseMemoryInfo.segments)
    && webdfu.dfuseMemoryInfo.segments[0]) {
    deviceInfo.dfuseFirstSegmentStart = webdfu.dfuseMemoryInfo.segments[0].start ?? null;
  }
  try {
    console.info('[ELAB DFU flash] device descriptors', deviceInfo);
  } catch { /* console may be unavailable */ }

  // Wire event-driven write process into Promise per Codex design verdict.
  return new Promise((resolve) => {
    let bytesTransferred = 0;
    let endEventReceived = false;
    let errorEventReceived = null;

    let proc;
    try {
      proc = webdfu.write(transferSize, binary, manifestationTolerant);
    } catch (err) {
      resolve({
        ok: false,
        mode,
        verified: false,
        evidence: { endEventReceived: false, bytesTransferred: 0, durationMs: Date.now() - startTime, deviceInfo },
        error: `write_start_failed: ${err.message || err}`,
      });
      return;
    }

    if (!proc || !proc.events || typeof proc.events.on !== 'function') {
      resolve({
        ok: false,
        mode,
        verified: false,
        evidence: { endEventReceived: false, bytesTransferred: 0, durationMs: Date.now() - startTime, deviceInfo },
        error: 'no_process_events',
      });
      return;
    }

    // iter 78 Codex Pattern C P0 fix (review iter 78 finding #1):
    // dfu library emits EITHER 'end' OR 'error' (mutually exclusive, per
    // node_modules/dfu/dist/index.cjs `.then(emit("end")).catch(emit("error"))`).
    // Original implementation ONLY resolved on 'end' → error path hung forever
    // → UI stuck FLASHING. Track resolution state to avoid double-resolve.
    let resolved = false;
    const safeResolve = (payload) => {
      if (resolved) return;
      resolved = true;
      resolve(payload);
    };

    // iter 78 Codex Pattern C P0 fix #2: wall-clock timeout safety net.
    // Real Nano R4 bootloader OR hung USB control transfers could leave
    // adapter pending indefinitely. 60s timeout per Renesas RA4M1 max flash
    // time (39KB sketch + manifestation typical 5-15s).
    const TIMEOUT_MS = 60_000;
    const timeoutId = setTimeout(() => {
      const durationMs = Date.now() - startTime;
      safeResolve({
        ok: false,
        mode,
        verified: false,
        evidence: { endEventReceived, bytesTransferred, durationMs, timedOut: true, deviceInfo },
        error: 'flash_timeout_60s',
      });
    }, TIMEOUT_MS);

    proc.events.on('write/start', (evt) => {
      if (onStart) {
        try { onStart({ totalBytes: binary.length }); } catch (_) { /* swallow */ }
      }
    });

    proc.events.on('write/process', (sent, total) => {
      bytesTransferred = sent;
      if (onProgress) {
        try { onProgress({ bytesTransferred, totalBytes: total }); } catch (_) { /* swallow */ }
      }
    });

    proc.events.on('write/end', () => {
      endEventReceived = true;
    });

    proc.events.on('error', (err) => {
      // P0 fix: resolve Promise on error event (was hanging forever).
      clearTimeout(timeoutId);
      errorEventReceived = err && err.message ? err.message : String(err);
      const durationMs = Date.now() - startTime;
      safeResolve({
        ok: false,
        mode,
        verified: false,
        evidence: { endEventReceived, bytesTransferred, durationMs, deviceInfo },
        error: errorEventReceived,
      });
    });

    proc.events.on('end', () => {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      // Honest: 'verified' is FALSE unless we did UPLOAD readback (not in MVP).
      // Codex design verdict: "Calling it 'verify' without read-back is dishonest."
      safeResolve({
        ok: endEventReceived,
        mode,
        verified: false, // No readback in iter 78 MVP — iter 79+ scope
        evidence: { endEventReceived, bytesTransferred, durationMs, deviceInfo },
      });
    });
  });
}

/**
 * Detect if WebUSB device is DFU-capable by inspecting interface descriptors.
 * Pre-flight check to surface honest error BEFORE attempting WebDFU.init().
 *
 * @param {USBDevice} device
 * @returns {{capable: boolean, dfuInterfaceFound: boolean, reason?: string}}
 */
export function isDfuCapable(device) {
  if (!device || !Array.isArray(device.configurations)) {
    return { capable: false, dfuInterfaceFound: false, reason: 'no_configurations' };
  }
  for (const config of device.configurations) {
    if (!config.interfaces) continue;
    for (const iface of config.interfaces) {
      const alts = iface.alternates || [];
      for (const alt of alts) {
        // DFU interface class: 0xFE (Application Specific)
        // DFU subclass: 0x01 (Device Firmware Upgrade)
        // DFU protocol: 0x01 (Runtime mode) OR 0x02 (DFU mode)
        if (alt.interfaceClass === 0xFE && alt.interfaceSubclass === 0x01) {
          return {
            capable: true,
            dfuInterfaceFound: true,
            interfaceNumber: iface.interfaceNumber,
            protocol: alt.interfaceProtocol,
          };
        }
      }
    }
  }
  return { capable: false, dfuInterfaceFound: false, reason: 'no_dfu_interface_in_descriptors' };
}

/**
 * Compose honest flash status message for UI rendering per Codex honesty mandate.
 *
 * @param {FlashResult} result
 * @returns {string} Italian user-facing message
 */
export function flashResultMessage(result) {
  if (!result) return 'Stato sconosciuto.';
  if (result.ok && result.mode === 'real') {
    return result.verified
      ? `Caricamento reale: trasferimento DFU completato e verificato sul Nano R4. ${result.evidence.bytesTransferred} byte trasferiti in ${result.evidence.durationMs}ms.`
      : `Caricamento reale: trasferimento DFU completato sul Nano R4 (manifestation tolerant, no read-back verify). ${result.evidence.bytesTransferred} byte trasferiti in ${result.evidence.durationMs}ms.`;
  }
  if (result.ok && result.mode === 'simulated') {
    return `Simulazione scientifica: protocollo DFU mock completato, nessuna scheda fisica scritta. ${result.evidence.bytesTransferred} byte processati in ${result.evidence.durationMs}ms. Hardware UAT reale iter 79+ con Tea + Riccardo + kit Omaric.`;
  }
  return `Errore flash: ${result.error || 'unknown'} (mode=${result.mode}, durata ${result.evidence ? result.evidence.durationMs : 0}ms)`;
}

export const _internal = {
  DEFAULT_TRANSFER_SIZE,
  DEFAULT_MANIFESTATION_TOLERANT,
  NOOP_LOG,
};
