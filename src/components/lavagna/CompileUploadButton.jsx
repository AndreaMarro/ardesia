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
 * @copyright © Andrea Marro — 2026-05-16 — ELAB Tutor iter 69 A3
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getCompileAgentStatus } from '../../services/compileAgentDetect';

/** Default loopback URL for the agent's combined endpoint. */
const AGENT_COMPILE_UPLOAD_URL = 'http://localhost:8765/compile-and-upload';

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
}) {
  const [agentAvailable, setAgentAvailable] = useState(false);
  const [agentChecked, setAgentChecked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mountedRef = useRef(true);

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

  return (
    <button
      type="button"
      role="button"
      aria-label="Carica il programma sul kit fisico Nano R4"
      aria-disabled={disabled || undefined}
      aria-busy={uploading || undefined}
      title={tooltip}
      onClick={handleClick}
      disabled={disabled}
      style={buttonStyle}
      data-elab-component="compile-upload-button"
      data-elab-agent-available={agentAvailable ? 'true' : 'false'}
    >
      {uploading ? <SpinnerIcon /> : <UploadIcon />}
      <span>{label}</span>
    </button>
  );
}
