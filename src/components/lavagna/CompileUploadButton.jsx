/**
 * src/components/lavagna/CompileUploadButton.jsx
 *
 * Iter 69 A3 — Lavagna UI button "Carica sul kit fisico Nano R4".
 *
 * Wires the existing browser-side detection (iter 65 R4
 * `compileAgentDetect.js`) + iter 69 A2 Express HTTP agent
 * (`http://localhost:8765/compile-and-upload`).
 *
 * Behavior:
 *   1. On mount + every 30s, polls getCompileAgentStatus() (cached, 5s TTL).
 *   2. If agent ONLINE → button enabled (Lime CTA).
 *      If agent OFFLINE → button disabled + tooltip plurale
 *         "Ragazzi, l'agente locale non e attivo..."
 *   3. On click → POST /compile-and-upload with { sketchCode, port, boardId }.
 *      - 30s timeout via AbortController.
 *      - Spinner while in-flight (button disabled).
 *      - Success toast plurale: "Caricato sul kit fisico Nano R4!"
 *      - Error toast per category:
 *           port_missing      → "Ragazzi, collegate la scheda Arduino via USB..."
 *           compile_failed    → "Ragazzi, il codice contiene un errore..."
 *           arduino_cli_absent→ "Ragazzi, Arduino CLI non e installato sul Mac..."
 *           upload_failed     → "Ragazzi, il caricamento e fallito. Provate il
 *                               doppio click sul tasto reset della Nano R4."
 *           (default)         → "Ragazzi, qualcosa e andato storto. Riprovate."
 *
 * Compliance gate (CLAUDE.md §Design + Principio Zero):
 *   - Linguaggio plurale "Ragazzi," (Principio Zero pedagogico)
 *   - Kit fisico mention canonical (Morfismo Sense 2)
 *   - Touch target >= 44x44 (LIM compatibility)
 *   - ARIA role + aria-label + aria-busy + aria-disabled
 *   - Palette CSS vars Navy/Lime/Orange/Red (NO hex inline)
 *   - NO emoji (inline SVG UploadIcon stroke-based)
 *   - WCAG AA contrast Navy/Lime palette
 *
 * Iter 69 honesty caveats:
 *   - Local UploadIcon SVG (NOT added to ElabIcons.jsx to respect iter 69
 *     A3 file-ownership scope; iter 70+ promote to shared if reused).
 *   - Toast surface uses optional prop `onSuccess`/`onError` callbacks so
 *     callers can route to their preferred Toast service.
 *   - Real Nano R4 hardware UAT pending Andrea/Tea iter 70+.
 *   - Cross-platform installer (Win/Linux) deferred iter 67+.
 *
 * Iter 76 D.1 — Demo-mode honest fallback (Andrea iter 76 mandate, Riccardo
 * Omaric demo-grade trust WITHOUT physical Nano R4 board):
 *   - State machine: idle → compiling → compile_success → connecting_usb
 *     → uploading → upload_success | upload_error | compile_only_no_board
 *   - When `requestUsbDevice` returns null OR throws NotFoundError →
 *     transition to `compile_only_no_board` (Riccardo demo state).
 *   - compile_only_no_board renders an honest banner with HEX bytes count +
 *     RAM bytes count + plurale CTA "Riprova caricamento" (touch ≥44px,
 *     ARIA aria-label) — NO false claim "Caricato".
 *   - NEW prop `enableDemoMode` (default false) opts the button into the
 *     two-step state machine (compile-then-WebUSB). When false, the legacy
 *     iter 69 single-shot POST /compile-and-upload path remains active so
 *     other call sites + their tests are unchanged.
 *   - NEW prop `requestUsbDevice` injects a navigator.usb.requestDevice
 *     shim (tests) — default reads `navigator?.usb?.requestDevice` if
 *     present, otherwise treats as "no WebUSB" → compile_only_no_board.
 *   - NEW prop `compileEndpoint` overrides `/compile` URL (tests).
 *   - ZERO emoji (ElabIcons CheckIcon + WarningIcon for the banner).
 *
 * @copyright © Andrea Marro — 2026-05-16 — ELAB Tutor iter 69 A3
 * @copyright © Andrea Marro — 2026-05-17 — ELAB Tutor iter 76 D.1 demo-mode
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCompileAgentStatus } from '../../services/compileAgentDetect';
import { CheckIcon, WarningIcon } from '../common/ElabIcons.jsx';

/** Default loopback URL for the agent's combined endpoint. */
const AGENT_COMPILE_UPLOAD_URL = 'http://localhost:8765/compile-and-upload';

/** Default loopback URL for the agent's compile-only endpoint (iter 76 D.1). */
const AGENT_COMPILE_URL = 'http://localhost:8765/compile';

/**
 * iter 77 STOP-HOOK fix (Codex stop-time review #6): wire Cloud Render
 * endpoint so WebUsbBanner "no-download" promise reflects actual compile
 * destination. Env `VITE_ELAB_CLOUD_COMPILE_URL` overrides hardcoded fallback.
 * When Cloud reachable → no LOCAL agent download required for end-users.
 * When Cloud unreachable AND LOCAL agent present → transparent fallback dev
 * mode. When BOTH unavailable → honest error state (no fake success).
 *
 * Iter 78 Andrea Render deploy expected to populate `elab-cloud-compile.onrender.com`.
 * Until then env unset OR returns 404 → fallback chain triggers LOCAL agent.
 */
const CLOUD_COMPILE_URL =
  (typeof import.meta !== 'undefined'
    && import.meta.env
    && typeof import.meta.env.VITE_ELAB_CLOUD_COMPILE_URL === 'string'
    && import.meta.env.VITE_ELAB_CLOUD_COMPILE_URL.trim().length > 0)
    ? import.meta.env.VITE_ELAB_CLOUD_COMPILE_URL.trim().replace(/\/$/, '') + '/compile'
    : null; // null = no Cloud env wired → LOCAL agent only (dev fallback)

/** Default board FQBN for cross-compile to Nano R4 (iter 76 D.1). */
const DEFAULT_FQBN = 'arduino:renesas_uno:nanor4';

/**
 * Resolve compile endpoint with fallback chain: Cloud Render → LOCAL agent.
 *
 * Honest behavior:
 * - When VITE_ELAB_CLOUD_COMPILE_URL set → Cloud endpoint canonical (no-download path)
 * - When env unset → LOCAL agent (requires Mac install — DEV/Andrea path)
 * - When prop `compileEndpoint` explicit → override both (tests/Andrea ratify)
 *
 * Iter 78+ enhancement: HEAD probe Cloud /health on mount, fallback LOCAL on 5xx.
 * Current behavior: trust env config, no runtime probe (avoid premature optimization).
 */
function resolveCompileEndpoint(overrideEndpoint) {
  if (typeof overrideEndpoint === 'string' && overrideEndpoint.length > 0) {
    return overrideEndpoint;
  }
  if (CLOUD_COMPILE_URL) return CLOUD_COMPILE_URL;
  return AGENT_COMPILE_URL;
}

/**
 * State machine values for the iter 76 D.1 demo-mode flow.
 * Honest names — each transition has a one-shot UI render contract.
 * @typedef {(
 *   'idle'
 *   | 'compiling'
 *   | 'compile_success'
 *   | 'connecting_usb'
 *   | 'uploading'
 *   | 'upload_success'
 *   | 'upload_error'
 *   | 'compile_only_no_board'
 * )} DemoState
 */
export const DEMO_STATES = Object.freeze({
  IDLE: 'idle',
  COMPILING: 'compiling',
  COMPILE_SUCCESS: 'compile_success',
  CONNECTING_USB: 'connecting_usb',
  UPLOADING: 'uploading',
  UPLOAD_SUCCESS: 'upload_success',
  UPLOAD_ERROR: 'upload_error',
  COMPILE_ONLY_NO_BOARD: 'compile_only_no_board',
  // iter 76 PHASE 3 P0.1 fix (Codex Pattern V verdict #3):
  // WebUSB device handle obtained MA real dfu-util flash NOT yet executed.
  // Honest intermediate state. NO claim "Caricato". Iter 77+ hardware UAT
  // Andrea/Tea/Riccardo wires real dfu-util binary transfer.
  HARDWARE_PICKED_AWAITING_FLASH: 'hardware_picked_awaiting_flash',
  // iter 78 B.2.5 (Codex design verdict iter 78): real-vs-simulated honest
  // state machine. FLASHING = dfu write in progress. FLASH_SUCCESS_REAL =
  // dfu 'end' event observed with REAL Nano R4 hardware. FLASH_COMPLETE_SIMULATED
  // = mock USB DFU protocol completed (scientifically valid simulation, NO
  // physical board written). FLASH_ERROR = adapter returned ok:false.
  FLASHING: 'flashing',
  FLASH_SUCCESS_REAL: 'flash_success_real',
  FLASH_COMPLETE_SIMULATED: 'flash_complete_simulated',
  FLASH_ERROR: 'flash_error',
});

/**
 * Parse HEX + RAM byte counts from arduino-cli stdout.
 * Format example: "Lo sketch usa 39048 byte (14%) ... globali usano 3940 byte (12%) ..."
 * Falls back to `null` for either field when the regex doesn't match.
 *
 * @param {string|undefined|null} stdout
 * @returns {{ hexBytes: number|null, ramBytes: number|null }}
 */
export function parseCompileStdout(stdout) {
  if (!stdout || typeof stdout !== 'string') {
    return { hexBytes: null, ramBytes: null };
  }
  // Italian arduino-cli output: "Lo sketch usa 39048 byte"
  // English fallback: "Sketch uses 39048 bytes"
  const hexMatch =
    stdout.match(/(?:Lo\s+sketch\s+usa|Sketch\s+uses)\s+(\d+)\s+byte/i);
  const ramMatch =
    stdout.match(
      /(?:variabili\s+globali\s+usano|Global\s+variables\s+use)\s+(\d+)\s+byte/i,
    );
  return {
    hexBytes: hexMatch ? Number.parseInt(hexMatch[1], 10) : null,
    ramBytes: ramMatch ? Number.parseInt(ramMatch[1], 10) : null,
  };
}

/** Timeout for the compile-and-upload round trip. */
const REQUEST_TIMEOUT_MS = 30_000;

/** Re-poll agent status every 30s (UI is rarely on screen longer). */
const STATUS_POLL_INTERVAL_MS = 30_000;

/**
 * Translate an error category from the agent into the canonical Principio
 * Zero plurale message for the docente / classe.
 *
 * @param {string|undefined} category
 * @returns {string}
 */
export function getDocenteErrorMessage(category) {
  switch (category) {
    case 'port_missing':
      return "Ragazzi, collegate la scheda Arduino via USB al computer e riprovate.";
    case 'compile_failed':
      return "Ragazzi, il codice contiene un errore. Controlliamolo insieme prima di ricaricarlo sul kit.";
    case 'arduino_cli_absent':
      return "Ragazzi, Arduino CLI non e installato sul Mac. Avvisate l'insegnante per installarlo.";
    case 'upload_failed':
      return "Ragazzi, il caricamento e fallito. Premete due volte il tasto reset della Nano R4 e riprovate.";
    case 'permission_denied':
      return "Ragazzi, il computer non ha i permessi per la porta USB. Avvisate l'insegnante.";
    case 'core_missing':
      return "Ragazzi, manca il pacchetto Arduino per la Nano R4. Avvisate l'insegnante per installarlo.";
    case 'timeout':
      return "Ragazzi, l'operazione ha impiegato troppo. Riproviamo tra un attimo.";
    case 'cors_denied':
      return "Ragazzi, il browser ha bloccato la richiesta. Avvisate l'insegnante (CORS).";
    case 'no_fetch':
      return "Ragazzi, il browser non supporta l'invio richieste. Avvisate l'insegnante.";
    default:
      return "Ragazzi, qualcosa e andato storto durante il caricamento. Riproviamo.";
  }
}

/**
 * Tiny inline upload icon. Local on purpose iter 69 A3 file-ownership scope.
 * stroke="currentColor" so the button text color drives the visual.
 */
function UploadIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** Spinner used while compile/upload is in-flight. */
function SpinnerIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      style={{ animation: 'elab-spin 1s linear infinite' }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/** Inject keyframes once per page (idempotent). */
function ensureSpinnerKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('elab-compile-upload-button-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'elab-compile-upload-button-keyframes';
  style.textContent =
    '@keyframes elab-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

/**
 * @param {object} props
 * @param {string} props.sketchCode                - Arduino C++ source
 * @param {string} [props.boardId='arduino-nano-r4']
 * @param {string} props.port                      - serial port
 * @param {Function} [props.onSuccess]             - called on success
 * @param {Function} [props.onError]               - called on error
 * @param {string} [props.endpoint]                - override agent URL (tests)
 * @param {Function} [props.fetchImpl]             - inject fetch (tests)
 * @param {Function} [props.statusImpl]            - inject status probe (tests)
 * @param {boolean} [props.compact]                - shrink padding
 *
 * Iter 74 B1-B narrative cliffhanger props (OPTIONAL — Morfismo Sense 2
 * narrative continuity, mirror of LessonPathPanel.jsx:462-471 pattern):
 *   - currentExperimentId: accepted for parent telemetry parity, unused
 *     locally so a parent can pass it without prop drift
 *   - nextExperiment: lesson-paths JSON `next_experiment {id,title,preview}`
 *   - onLoadNextExperiment(id): callback to mount the next esperimento
 *
 * When ALL THREE conditions hold the cliffhanger CTA is rendered as a
 * sibling block AFTER the upload button:
 *   1) the upload completed successfully at least once this mount
 *   2) `nextExperiment` is a non-empty object with a non-empty `id`
 *   3) the caller didn't unmount the button after the success
 *
 * PRINCIPIO ZERO compliance: plurale "Ragazzi" + canonical kit fisico
 * mention + Vol/pag carried in `preview` when parent supplies it.
 */
export default function CompileUploadButton({
  sketchCode,
  boardId = 'arduino-nano-r4',
  port,
  onSuccess,
  onError,
  endpoint = AGENT_COMPILE_UPLOAD_URL,
  fetchImpl,
  statusImpl,
  compact = false,
  // iter 74 B1-B narrative cliffhanger props (OPTIONAL)
  currentExperimentId, // eslint-disable-line no-unused-vars
  nextExperiment,
  onLoadNextExperiment,
  // iter 76 D.1 demo-mode honest fallback props (OPTIONAL)
  // iter 77 STOP-HOOK fix: default now `resolveCompileEndpoint(undefined)`
  // which picks Cloud Render env first (VITE_ELAB_CLOUD_COMPILE_URL), then
  // LOCAL agent loopback fallback. Tests can still override explicit.
  enableDemoMode = false,
  compileEndpoint = resolveCompileEndpoint(undefined),
  fqbn = DEFAULT_FQBN,
  requestUsbDevice,
  onDemoStateChange,
}) {
  const [agentAvailable, setAgentAvailable] = useState(false);
  const [agentChecked, setAgentChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  // iter 74 B1-B — track whether the last upload returned ok so the
  // cliffhanger CTA can render as a persistent sibling block.
  const [uploadSucceeded, setUploadSucceeded] = useState(false);
  // iter 76 D.1 — demo-mode honest state machine (active only when
  // enableDemoMode prop is true; legacy single-shot path otherwise).
  const [demoState, setDemoStateInternal] = useState(DEMO_STATES.IDLE);
  const [compileBytes, setCompileBytes] = useState({
    hexBytes: null,
    ramBytes: null,
  });
  const [uploadErrorMsg, setUploadErrorMsg] = useState(null);
  const mountedRef = useRef(true);
  // iter 78 STOP-HOOK fix (Codex stop-time review): retry path bypasses
  // flash chain. Need shared compilePayload reference so handleRetryUsb
  // can invoke same flash chain as primary handleDemoClick path.
  const lastCompilePayloadRef = useRef(null);

  // Wrap state setter so external callers can react to transitions (telemetry
  // hook for parent Lavagna shell + e2e instrumentation iter 76 D.5).
  const setDemoState = useCallback((next) => {
    setDemoStateInternal(next);
    if (typeof onDemoStateChange === 'function') {
      try { onDemoStateChange(next); } catch { /* defensive */ }
    }
  }, [onDemoStateChange]);

  useEffect(() => {
    ensureSpinnerKeyframes();
    return () => { mountedRef.current = false; };
  }, []);

  // Poll agent status (mount + every 30s) — defensive deduped via R4 cache.
  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      try {
        const fn = statusImpl || getCompileAgentStatus;
        const status = await fn();
        if (cancelled || !mountedRef.current) return;
        setAgentAvailable(!!(status && status.available));
        setAgentChecked(true);
      } catch {
        if (cancelled || !mountedRef.current) return;
        setAgentAvailable(false);
        setAgentChecked(true);
      }
    };
    probe();
    const id = setInterval(probe, STATUS_POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [statusImpl]);

  const disabled = !agentAvailable || uploading || !sketchCode || !port;

  const tooltip = (() => {
    if (uploading) return "Caricamento in corso, ragazzi...";
    if (!agentChecked) return "Verifico se l'agente locale e attivo...";
    if (!agentAvailable) {
      return "Ragazzi, l'agente locale non e attivo. Chiedete all'insegnante di avviare ELAB Compile Agent.";
    }
    if (!sketchCode) return "Ragazzi, scrivete prima il codice nei blocchi.";
    if (!port) return "Ragazzi, collegate la scheda Arduino e selezionate la porta USB.";
    return "Carica il programma sulla Nano R4 fisica del kit ELAB";
  })();

  const handleClick = useCallback(async () => {
    if (disabled) return;
    setUploading(true);
    // iter 74 B1-B — hide stale cliffhanger from a previous upload while
    // the new attempt is in-flight; re-set on success below.
    setUploadSucceeded(false);

    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      : null;

    const doFetch =
      fetchImpl || (typeof fetch === 'function' ? fetch : null);

    if (!doFetch) {
      if (timer) clearTimeout(timer);
      setUploading(false);
      onError?.({
        category: 'no_fetch',
        message: getDocenteErrorMessage('no_fetch'),
      });
      return;
    }

    try {
      const res = await doFetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sketchCode, boardId, port }),
        signal: controller ? controller.signal : undefined,
      });

      let payload;
      try {
        payload = typeof res.json === 'function' ? await res.json() : null;
      } catch {
        payload = null;
      }

      if (res && res.ok && payload && payload.ok) {
        // iter 74 B1-B — flag success so the cliffhanger CTA can mount.
        // Guarded by mountedRef so we never call setState after unmount.
        if (mountedRef.current) setUploadSucceeded(true);
        onSuccess?.({
          message:
            "Caricato sul kit fisico Nano R4! Ragazzi, ora osservate cosa succede.",
          payload,
        });
      } else {
        const category = payload?.error?.category || 'upload_failed';
        onError?.({
          category,
          message: getDocenteErrorMessage(category),
          detail: payload?.error,
        });
      }
    } catch (err) {
      const aborted = err && (err.name === 'AbortError' || err.code === 20);
      const category = aborted ? 'timeout' : 'agent_offline';
      onError?.({
        category,
        message: getDocenteErrorMessage(category),
        detail: err && err.message ? err.message : undefined,
      });
    } finally {
      if (timer) clearTimeout(timer);
      if (mountedRef.current) setUploading(false);
    }
  }, [disabled, endpoint, sketchCode, boardId, port, fetchImpl, onSuccess, onError]);

  // iter 78 STOP-HOOK fix (Codex stop-time review): extract flash chain into
  // shared helper invoked from BOTH primary handleDemoClick AND handleRetryUsb.
  // Previous retry path stopped at HARDWARE_PICKED_AWAITING_FLASH bypassing
  // entire dfu flash sequence — Codex caught dishonest dead-end remaining.
  // MUST be declared BEFORE handleDemoClick (useCallback deps array reads
  // eagerly at render — TDZ otherwise).
  const invokeFlashChain = useCallback(async (device, compilePayload, pathLabel) => {
    if (mountedRef.current) {
      setDemoState(DEMO_STATES.HARDWARE_PICKED_AWAITING_FLASH);
    }

    // Dynamic import to avoid loading dfu library bundle on every render.
    const { flashDfuFirmware, flashResultMessage } = await import('../../services/webDfuFlash.js');
    const { parseIntelHexBase64 } = await import('../../services/intelHexParser.js');

    // Parse Intel HEX from Cloud Render compile response (OpenAPI 76-D.3).
    let binary;
    try {
      if (!compilePayload?.hexBase64) {
        throw new Error('hexBase64_missing_from_compile_response');
      }
      const parsed = parseIntelHexBase64(compilePayload.hexBase64);
      binary = parsed.binary;
    } catch (parseErr) {
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.FLASH_ERROR);
      }
      onError?.({
        category: 'hex_parse_failed',
        message: `Impossibile interpretare il file HEX (${pathLabel}): ${parseErr.message}`,
        detail: parseErr.message,
      });
      return;
    }

    if (mountedRef.current) {
      setDemoState(DEMO_STATES.FLASHING);
    }

    const flashResult = await flashDfuFirmware(device, binary, {
      transferSize: 64,
      manifestationTolerant: true,
    });

    if (mountedRef.current) {
      setUploading(false);
      if (flashResult.ok) {
        if (flashResult.mode === 'real') {
          setDemoState(DEMO_STATES.FLASH_SUCCESS_REAL);
          setUploadSucceeded(true);
        } else {
          setDemoState(DEMO_STATES.FLASH_COMPLETE_SIMULATED);
          // NOT setUploadSucceeded(true) for simulated — honest separation
        }
      } else {
        setDemoState(DEMO_STATES.FLASH_ERROR);
      }
    }

    if (flashResult.ok) {
      onSuccess?.({
        message: flashResultMessage(flashResult),
        payload: {
          jobId: compilePayload?.jobId,
          device: 'webusb',
          flashMode: flashResult.mode,
          flashVerified: flashResult.verified,
          bytesTransferred: flashResult.evidence.bytesTransferred,
          durationMs: flashResult.evidence.durationMs,
          flashStatus: flashResult.mode === 'real' ? 'flash_success_real' : 'flash_complete_simulated',
          path: pathLabel,
        },
      });
    } else {
      onError?.({
        category: 'flash_failed',
        message: flashResultMessage(flashResult),
        detail: flashResult.error,
      });
    }
  }, [onSuccess, onError, setDemoState]);

  // iter 76 D.1 — demo-mode honest two-step handler. Used only when
  // `enableDemoMode` prop is true (opt-in). Splits compile and upload steps
  // so we can render `compile_only_no_board` when WebUSB returns null.
  const handleDemoClick = useCallback(async () => {
    if (!enableDemoMode) return;
    if (uploading) return;
    if (!sketchCode) return;

    // Reset any previous error / cliffhanger banner.
    setUploadErrorMsg(null);
    if (mountedRef.current) setUploadSucceeded(false);
    setUploading(true);
    setDemoState(DEMO_STATES.COMPILING);

    const doFetch =
      fetchImpl || (typeof fetch === 'function' ? fetch : null);

    if (!doFetch) {
      if (mountedRef.current) setUploading(false);
      setDemoState(DEMO_STATES.UPLOAD_ERROR);
      setUploadErrorMsg(getDocenteErrorMessage('no_fetch'));
      onError?.({
        category: 'no_fetch',
        message: getDocenteErrorMessage('no_fetch'),
      });
      return;
    }

    // ── Step 1: POST /compile (cross-compile WITHOUT board).
    let compilePayload = null;
    try {
      // iter 77 STOP-HOOK #3 fix (Codex stop-time review #8):
      // 'Cloud demo compile path still omits required auth header'.
      // Cloud Render server.js:93-107 authMiddleware requires
      // X-Elab-Api-Key header → 401 prod without. Detect Cloud endpoint
      // via CLOUD_COMPILE_URL match. Env VITE_ELAB_API_KEY surfaced via
      // import.meta.env (build-time inject, .trim() per CLAUDE.md regola).
      const headers = { 'Content-Type': 'application/json' };
      const isCloudEndpoint =
        CLOUD_COMPILE_URL && compileEndpoint.startsWith(CLOUD_COMPILE_URL.replace(/\/compile$/, ''));
      const cloudApiKey =
        typeof import.meta !== 'undefined'
          && import.meta.env
          && typeof import.meta.env.VITE_ELAB_API_KEY === 'string'
          ? import.meta.env.VITE_ELAB_API_KEY.trim()
          : '';
      if (isCloudEndpoint && cloudApiKey) {
        headers['X-Elab-Api-Key'] = cloudApiKey;
      }
      const compileRes = await doFetch(compileEndpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers,
        body: JSON.stringify({ sketchCode, fqbn }),
      });
      try {
        compilePayload =
          typeof compileRes.json === 'function' ? await compileRes.json() : null;
      } catch {
        compilePayload = null;
      }
      if (!compileRes || !compileRes.ok || !compilePayload || !compilePayload.ok) {
        const category = compilePayload?.error?.category || 'compile_failed';
        if (mountedRef.current) {
          setUploading(false);
          setDemoState(DEMO_STATES.UPLOAD_ERROR);
          setUploadErrorMsg(getDocenteErrorMessage(category));
        }
        onError?.({
          category,
          message: getDocenteErrorMessage(category),
          detail: compilePayload?.error,
        });
        return;
      }
    } catch (err) {
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.UPLOAD_ERROR);
        setUploadErrorMsg(getDocenteErrorMessage('compile_failed'));
      }
      onError?.({
        category: 'compile_failed',
        message: getDocenteErrorMessage('compile_failed'),
        detail: err && err.message ? err.message : undefined,
      });
      return;
    }

    // Compile success — parse HEX + RAM byte counts from arduino-cli stdout.
    const bytes = parseCompileStdout(compilePayload?.stdout);
    if (mountedRef.current) {
      setCompileBytes(bytes);
      setDemoState(DEMO_STATES.COMPILE_SUCCESS);
    }
    // iter 78 STOP-HOOK fix (Codex stop-time review): store compilePayload
    // EARLY (post compile_success) so retry path can invoke flash chain even
    // when initial picker returns null and user later retries successfully.
    lastCompilePayloadRef.current = compilePayload;

    // ── Step 2: WebUSB device picker (may return null / NotFoundError).
    setDemoState(DEMO_STATES.CONNECTING_USB);

    const usbPicker =
      requestUsbDevice
      || (typeof navigator !== 'undefined'
        && navigator.usb
        && typeof navigator.usb.requestDevice === 'function'
        ? (filters) => navigator.usb.requestDevice(filters)
        : null);

    if (!usbPicker) {
      // No WebUSB API available (Safari/Firefox or test env without shim) →
      // honest fallback. Andrea Riccardo demo state.
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
      }
      return;
    }

    let device = null;
    try {
      device = await usbPicker({ filters: [] });
    } catch (err) {
      const name = err && err.name;
      if (name === 'NotFoundError' || name === 'AbortError' || name === 'SecurityError') {
        // User cancelled OR no device picked → compile_only_no_board.
        if (mountedRef.current) {
          setUploading(false);
          setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
        }
        return;
      }
      // Other unexpected WebUSB error → upload_error.
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.UPLOAD_ERROR);
        setUploadErrorMsg(getDocenteErrorMessage('upload_failed'));
      }
      onError?.({
        category: 'upload_failed',
        message: getDocenteErrorMessage('upload_failed'),
        detail: err && err.message ? err.message : undefined,
      });
      return;
    }

    if (!device) {
      // requestDevice resolved with null (defensive — some implementations).
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
      }
      return;
    }

    // ── Step 3: device picked → HARDWARE_PICKED_AWAITING_FLASH → FLASHING
    // (iter 78 B.2 web-dfu flash chain LIVE).
    // Iter 78 STOP-HOOK fix (Codex stop-time review): store compilePayload in
    // shared ref so retry path can invoke same flash chain.
    lastCompilePayloadRef.current = compilePayload;
    await invokeFlashChain(device, compilePayload, 'primary');
    return;
  }, [
    enableDemoMode, uploading, sketchCode, compileEndpoint, fqbn,
    fetchImpl, requestUsbDevice, onSuccess, onError, setDemoState, invokeFlashChain,
  ]);


  // Iter 76 D.1 — retry handler used by the compile_only_no_board CTA to
  // re-trigger the WebUSB device picker without re-running /compile.
  const handleRetryUsb = useCallback(async () => {
    if (!enableDemoMode) return;
    // iter 78 STOP-HOOK #2 fix (Codex stop-time review #7):
    // 'retry flash can run while UI remains idle/enabled'.
    // Guard against concurrent retry clicks + disable button via uploading=true.
    // Was missing: button stayed enabled during retry flash → multiple clicks
    // could spawn parallel flash sequences (race + USB device conflict).
    if (uploading) return;
    setUploading(true);
    setUploadErrorMsg(null);
    setDemoState(DEMO_STATES.CONNECTING_USB);

    const usbPicker =
      requestUsbDevice
      || (typeof navigator !== 'undefined'
        && navigator.usb
        && typeof navigator.usb.requestDevice === 'function'
        ? (filters) => navigator.usb.requestDevice(filters)
        : null);

    if (!usbPicker) {
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
      }
      return;
    }

    let device = null;
    try {
      device = await usbPicker({ filters: [] });
    } catch (err) {
      const name = err && err.name;
      if (mountedRef.current) setUploading(false);
      if (name === 'NotFoundError' || name === 'AbortError' || name === 'SecurityError') {
        if (mountedRef.current) setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
        return;
      }
      if (mountedRef.current) {
        setDemoState(DEMO_STATES.UPLOAD_ERROR);
        setUploadErrorMsg(getDocenteErrorMessage('upload_failed'));
      }
      return;
    }

    if (!device) {
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.COMPILE_ONLY_NO_BOARD);
      }
      return;
    }

    // iter 78 STOP-HOOK fix (Codex stop-time review): retry path now invokes
    // SAME flash chain as primary handleDemoClick via shared helper.
    // Previously retry stopped at HARDWARE_PICKED_AWAITING_FLASH bypassing
    // entire dfu sequence — Codex caught dishonest dead-end remaining.
    // Reuse lastCompilePayloadRef (stored by handleDemoClick on compile success).
    const cachedCompile = lastCompilePayloadRef.current;
    if (!cachedCompile || !cachedCompile.hexBase64) {
      // No prior compile available — fall back to honest awaiting state.
      if (mountedRef.current) {
        setUploading(false);
        setDemoState(DEMO_STATES.HARDWARE_PICKED_AWAITING_FLASH);
      }
      onError?.({
        category: 'no_compile_payload',
        message: 'Compilazione precedente non disponibile per retry. Premete Compila prima di riprovare il caricamento.',
      });
      return;
    }
    // invokeFlashChain handles setUploading(false) on completion (both ok + error).
    await invokeFlashChain(device, cachedCompile, 'retry');
  }, [enableDemoMode, uploading, requestUsbDevice, setDemoState, onError, invokeFlashChain]);

  const label = uploading ? 'Caricamento sul kit...' : 'Carica sul kit fisico';

  // Palette via CSS vars with safe fallbacks (palette CLAUDE.md §Design).
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    minWidth: 44,
    padding: compact ? '8px 12px' : '10px 18px',
    border: 'none',
    borderRadius: 6,
    background: disabled
      ? 'var(--color-muted, #8c8c8c)'
      : 'var(--color-accent, #4A7A25)',
    color: 'var(--color-text-inverse, #ffffff)',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    transition: 'background 0.18s ease, opacity 0.18s ease',
  };

  // iter 74 B1-B — cliffhanger visible only when last upload succeeded AND
  // parent supplied a valid `next_experiment` descriptor with an `id`. We
  // require the `id` so a misconfigured parent never produces a dead CTA.
  const showCliffhanger =
    uploadSucceeded
    && nextExperiment
    && typeof nextExperiment === 'object'
    && typeof nextExperiment.id === 'string'
    && nextExperiment.id.length > 0;

  const handleLoadNext = () => {
    if (!showCliffhanger) return;
    if (typeof onLoadNextExperiment === 'function') {
      onLoadNextExperiment(nextExperiment.id);
    }
  };

  const cliffhangerWrapStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  };

  // iter 76 D.1 — when demo-mode is enabled, the visible UI must surface the
  // honest no-board banner whenever the state machine sits there. We render
  // the banner as a sibling of the button so the button stays clickable
  // (retry CTA is INSIDE the banner; the main button remains the primary
  // affordance for re-triggering a full compile+upload cycle).
  const showNoBoardBanner =
    enableDemoMode && demoState === DEMO_STATES.COMPILE_ONLY_NO_BOARD;

  // Honest message — plurale "Collegate" + verbatim HEX bytes count when we
  // have it (parsed from arduino-cli stdout). Never claim "Caricato".
  const noBoardMessage = (() => {
    if (compileBytes.hexBytes != null) {
      return `Compilazione completata: ${compileBytes.hexBytes} byte di codice. Collegate il Nano R4 via USB per caricare sulla scheda.`;
    }
    return "Compilazione completata. Collegate il Nano R4 via USB per caricare sulla scheda.";
  })();

  return (
    <span style={cliffhangerWrapStyle} data-elab-compile-upload-wrap="true">
      <button
        type="button"
        role="button"
        aria-label="Carica il programma sul kit fisico Nano R4"
        aria-disabled={disabled || undefined}
        aria-busy={uploading || undefined}
        title={tooltip}
        onClick={enableDemoMode ? handleDemoClick : handleClick}
        disabled={enableDemoMode ? (uploading || !sketchCode) : disabled}
        style={buttonStyle}
        data-elab-component="compile-upload-button"
        data-elab-agent-available={agentAvailable ? 'true' : 'false'}
        data-elab-demo-mode={enableDemoMode ? 'true' : 'false'}
        data-elab-demo-state={demoState}
      >
        {uploading ? <SpinnerIcon /> : <UploadIcon />}
        <span>{label}</span>
      </button>
      {showNoBoardBanner && (
        <span
          role="status"
          aria-live="polite"
          aria-label="Compilazione completata, scheda Nano R4 non collegata"
          data-testid="compile-only-no-board-banner"
          data-elab-demo-state="compile_only_no_board"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 8,
            padding: '12px 16px',
            marginTop: 4,
            border: '2px solid var(--elab-orange, #E8941C)',
            borderRadius: 8,
            background:
              'var(--elab-no-board-bg, rgba(232, 148, 28, 0.10))',
            color: 'var(--elab-text, #1A1A1A)',
            fontFamily: 'var(--font-sans, "Open Sans", system-ui, sans-serif)',
            maxWidth: 480,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily:
                'var(--font-display, "Oswald", "Open Sans", system-ui, sans-serif)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--elab-navy, #1E4D8C)',
            }}
          >
            <span
              style={{
                color: 'var(--elab-lime, #4A7A25)',
                display: 'inline-flex',
              }}
            >
              <CheckIcon size={20} />
            </span>
            <span>Compilazione completata</span>
            <span
              style={{
                color: 'var(--elab-orange, #E8941C)',
                display: 'inline-flex',
                marginLeft: 4,
              }}
            >
              <WarningIcon size={20} />
            </span>
          </span>
          <span
            data-testid="compile-only-no-board-message"
            style={{ fontSize: 14, lineHeight: 1.45 }}
          >
            {noBoardMessage}
          </span>
          {(compileBytes.hexBytes != null || compileBytes.ramBytes != null) && (
            <span
              data-testid="compile-only-no-board-bytes"
              style={{
                fontFamily:
                  'var(--font-mono, "Fira Code", "Courier New", monospace)',
                fontSize: 13,
                color: 'var(--elab-text-muted, #5A6B7E)',
              }}
            >
              {compileBytes.hexBytes != null && (
                <span data-testid="hex-bytes">
                  HEX: {compileBytes.hexBytes} byte
                </span>
              )}
              {compileBytes.hexBytes != null
                && compileBytes.ramBytes != null
                && ' · '}
              {compileBytes.ramBytes != null && (
                <span data-testid="ram-bytes">
                  RAM: {compileBytes.ramBytes} byte
                </span>
              )}
            </span>
          )}
          <button
            type="button"
            onClick={handleRetryUsb}
            aria-label="Riprova caricamento sul kit Nano R4"
            data-testid="compile-only-no-board-retry"
            style={{
              alignSelf: 'flex-start',
              minHeight: 44,
              minWidth: 44,
              padding: '10px 18px',
              border: '2px solid var(--elab-orange, #E8941C)',
              borderRadius: 8,
              background: 'var(--elab-orange, #E8941C)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily:
                'var(--font-sans, "Open Sans", system-ui, sans-serif)',
            }}
          >
            Riprova caricamento
          </button>
        </span>
      )}
      {showCliffhanger && (
        <span
          role="region"
          aria-label="Prossimo esperimento del percorso"
          data-testid="compile-upload-cliffhanger"
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 6,
            padding: '10px 14px',
            border: '1px solid var(--color-accent, #4A7A25)',
            borderRadius: 6,
            background: 'var(--color-cliffhanger-bg, rgba(74, 122, 37, 0.08))',
            color: 'var(--color-text, #1E4D8C)',
            fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
            maxWidth: 360,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1.4 }}>
            Ragazzi, avete caricato sul kit ELAB. Pronti per
            {' '}
            <strong>{nextExperiment.title || nextExperiment.id}</strong>?
          </span>
          {nextExperiment.preview && (
            <span style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.35 }}>
              {nextExperiment.preview}
            </span>
          )}
          <button
            type="button"
            onClick={handleLoadNext}
            aria-label={`Apri il prossimo esperimento: ${nextExperiment.title || nextExperiment.id}`}
            data-testid="compile-upload-cliffhanger-cta"
            style={{
              alignSelf: 'flex-start',
              minHeight: 44,
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: 'var(--color-accent, #4A7A25)',
              color: 'var(--color-text-inverse, #ffffff)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
            }}
          >
            → Apri prossimo esperimento
          </button>
        </span>
      )}
    </span>
  );
}
