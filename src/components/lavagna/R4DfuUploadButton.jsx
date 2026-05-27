/**
 * R4DfuUploadButton — WebUSB DFU upload for Arduino Nano R4 (Renesas RA4M1).
 *
 * Takes a pre-compiled Intel HEX text (R4 binary linked at 0x4000) and flashes
 * it directly via the existing webDfuFlash service. Skips the local-agent and
 * cloud-recompile paths used by CompileUploadButton — useful when the docente
 * already triggered a parallel R4 cross-compile and we want a single-click
 * upload from the simulator.
 *
 * Browser support: requires WebUSB (Chrome / Edge / Opera). Safari falls back
 * to a disabled state with a docente-friendly Italian message.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */
import React, { useCallback, useEffect, useState } from 'react';

// Nano R4 boot/runtime USB descriptors (DFU runtime + DFU mode).
// Mirrors the filter set used by CompileUploadButton for WebUSB discovery.
const NANO_R4_USB_FILTERS = [
  // Arduino LLC — Nano R4 DFU mode (RA4M1)
  { vendorId: 0x2341, productId: 0x0070 },
  { vendorId: 0x2341, productId: 0x0069 },
  // Renesas DFU base (raw)
  { vendorId: 0x2341 },
];

const NANO_R4_APP_FLASH_ADDRESS = 0x4000;

const STATE = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  PARSING: 'parsing',
  FLASHING: 'flashing',
  SUCCESS: 'success',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
});

function isWebUsbSupported() {
  return typeof navigator !== 'undefined' && !!navigator.usb;
}

const styles = {
  wrap: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'stretch',
    minWidth: 220,
  },
  btn: {
    background: 'var(--elab-navy, #1E4D8C)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '12px 20px',
    fontWeight: 700,
    fontSize: 15,
    fontFamily: 'inherit',
    cursor: 'pointer',
    minHeight: 44,
    display: 'inline-flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { background: '#9BA8B5', cursor: 'not-allowed' },
  btnFlashing: { background: 'var(--elab-orange, #E8941C)' },
  btnSuccess: { background: 'var(--elab-lime, #7CB342)' },
  btnError: { background: 'var(--elab-red, #E54B3D)' },
  status: { fontSize: 12, color: '#5A6B7E', textAlign: 'center', minHeight: 16 },
  progress: { width: '100%', height: 4, borderRadius: 2, background: 'rgba(30, 77, 140, 0.12)', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'var(--elab-orange, #E8941C)', transition: 'width 80ms linear' },
};

export default function R4DfuUploadButton({
  hexText,
  onSuccess,
  onError,
  disabled = false,
  label = 'Carica su Nano R4',
}) {
  const [state, setState] = useState(STATE.IDLE);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!isWebUsbSupported()) setState(STATE.UNSUPPORTED);
  }, []);

  const handleClick = useCallback(async () => {
    if (!hexText) {
      setMessage('Ragazzi, compilate prima il codice.');
      setState(STATE.ERROR);
      return;
    }

    setMessage('Selezionate la Nano R4 in modalità DFU…');
    setState(STATE.CONNECTING);
    setProgress({ done: 0, total: 0 });

    let device;
    try {
      device = await navigator.usb.requestDevice({ filters: NANO_R4_USB_FILTERS });
    } catch (err) {
      if (err && /NotFoundError/i.test(err.name || '')) {
        setState(STATE.ERROR);
        setMessage('Ragazzi, nessuna Nano R4 trovata. Premete due volte RESET sulla scheda e riprovate.');
      } else {
        setState(STATE.ERROR);
        setMessage('Ragazzi, il browser ha negato l\'accesso USB. Avvisate l\'insegnante.');
      }
      if (typeof onError === 'function') onError({ category: 'connect_failed', error: err });
      return;
    }

    setState(STATE.PARSING);
    setMessage('Verifica del file compilato…');
    let binary;
    let startAddress;
    try {
      const { parseIntelHexText } = await import('../../services/intelHexParser.js');
      const parsed = parseIntelHexText(hexText);
      binary = parsed.binary;
      startAddress = parsed.startAddress;
    } catch (err) {
      setState(STATE.ERROR);
      setMessage(`Ragazzi, il file compilato non è leggibile: ${err.message}`);
      if (typeof onError === 'function') onError({ category: 'hex_parse_failed', error: err });
      return;
    }

    if (startAddress !== NANO_R4_APP_FLASH_ADDRESS) {
      setState(STATE.ERROR);
      setMessage('Ragazzi, l\'indirizzo del programma non è quello della Nano R4. Caricamento annullato.');
      if (typeof onError === 'function') {
        onError({ category: 'unexpected_flash_address', detail: { startAddress } });
      }
      return;
    }

    setState(STATE.FLASHING);
    setMessage('Caricamento sulla Nano R4…');
    setProgress({ done: 0, total: binary.length });

    try {
      const { flashDfuFirmware, flashResultMessage } = await import('../../services/webDfuFlash.js');
      const result = await flashDfuFirmware(device, binary, {
        transferSize: 64,
        manifestationTolerant: true,
      });
      if (result.ok) {
        setState(STATE.SUCCESS);
        setMessage(`Caricato! ${binary.length} byte sulla Nano R4.`);
        setProgress({ done: binary.length, total: binary.length });
        if (typeof onSuccess === 'function') {
          onSuccess({
            bytesTransferred: result.evidence?.bytesTransferred ?? binary.length,
            mode: result.mode,
            verified: result.verified,
            message: flashResultMessage(result),
          });
        }
        setTimeout(() => {
          setState(STATE.IDLE);
          setMessage('');
        }, 4500);
      } else {
        setState(STATE.ERROR);
        setMessage(flashResultMessage(result));
        if (typeof onError === 'function') {
          onError({ category: 'flash_failed', error: result.error, message: flashResultMessage(result) });
        }
      }
    } catch (err) {
      setState(STATE.ERROR);
      setMessage(`Ragazzi, il caricamento è fallito: ${err.message}`);
      if (typeof onError === 'function') onError({ category: 'flash_failed', error: err });
    }
  }, [hexText, onSuccess, onError]);

  if (state === STATE.UNSUPPORTED) {
    return (
      <div style={styles.wrap}>
        <button
          type="button"
          style={{ ...styles.btn, ...styles.btnDisabled }}
          disabled
          data-testid="r4-dfu-upload-unsupported"
          aria-label="WebUSB non disponibile"
        >
          WebUSB non disponibile
        </button>
        <span style={styles.status}>Ragazzi, aprite la pagina in Chrome o Edge.</span>
      </div>
    );
  }

  const isBusy = state === STATE.CONNECTING || state === STATE.PARSING || state === STATE.FLASHING;
  const effectiveDisabled = disabled || isBusy || !hexText;
  const btnStyle = {
    ...styles.btn,
    ...(effectiveDisabled ? styles.btnDisabled : {}),
    ...(state === STATE.FLASHING ? styles.btnFlashing : {}),
    ...(state === STATE.SUCCESS ? styles.btnSuccess : {}),
    ...(state === STATE.ERROR ? styles.btnError : {}),
  };

  const labelText =
    state === STATE.CONNECTING ? 'Selezionate la scheda…'
      : state === STATE.PARSING ? 'Verifica…'
      : state === STATE.FLASHING ? 'Caricamento…'
      : state === STATE.SUCCESS ? 'Caricato!'
      : state === STATE.ERROR ? 'Riprova'
      : label;

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={styles.wrap} data-testid="r4-dfu-upload">
      <button
        type="button"
        style={btnStyle}
        onClick={handleClick}
        disabled={effectiveDisabled}
        aria-label={label}
        aria-busy={isBusy}
        data-testid="r4-dfu-upload-btn"
        data-state={state}
      >
        {labelText}
      </button>
      {progress.total > 0 && state === STATE.FLASHING && (
        <div style={styles.progress} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ ...styles.progressBar, width: `${pct}%` }} />
        </div>
      )}
      {message && (
        <span
          style={styles.status}
          role={state === STATE.ERROR ? 'alert' : 'status'}
          data-testid="r4-dfu-upload-status"
        >
          {message}
        </span>
      )}
    </div>
  );
}
