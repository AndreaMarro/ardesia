/**
 * WebSerialUploadButton — Browser-native upload for ATmega328 Arduino via
 * WebSerial + stk500v1. Reusable across HomeCompileEntry, Lavagna,
 * NewElabSimulator. No local agent required.
 *
 * Pattern: pass `hexText` (Intel HEX string). On click: prompt user for serial
 * port, then flash via stk500. Shows compact state: idle → connecting →
 * uploading → success | error. All copy is plurale (Principio Zero).
 *
 * Renesas Nano R4 boards: NOT supported here — they use WebUSB DFU
 * (services/webDfuFlash.js) via the dedicated CompileUploadButton.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */
import React, { useCallback, useEffect, useState } from 'react';
import { requestAndFlash, isWebSerialSupported } from '../../services/webSerialFlash';

const STATE = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
});

function errorMessage(category) {
  switch (category) {
    case 'no_webserial':
      return 'Ragazzi, il browser non supporta WebSerial. Usate Chrome o Edge sul Mac.';
    case 'port_missing':
      return 'Ragazzi, nessuna porta seriale selezionata. Collegate la scheda Arduino via USB e riprovate.';
    case 'permission_denied':
      return 'Ragazzi, il browser ha negato l\'accesso alla porta. Avvisate l\'insegnante.';
    case 'sync_failed':
      return 'Ragazzi, la scheda non risponde. Premete due volte il tasto RESET sulla scheda e riprovate.';
    case 'timeout':
      return 'Ragazzi, il caricamento ha impiegato troppo. Riproviamo.';
    case 'hex_invalid':
      return 'Ragazzi, il file compilato è corrotto. Ricompiliamo prima.';
    case 'upload_failed':
    default:
      return 'Ragazzi, il caricamento è fallito. Riproviamo tra un attimo.';
  }
}

const styles = {
  wrap: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'stretch',
    minWidth: 200,
  },
  btn: {
    background: 'var(--elab-lime, #7CB342)',
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
  btnDisabled: {
    background: '#9BA8B5',
    cursor: 'not-allowed',
  },
  btnUploading: {
    background: 'var(--elab-orange, #E8941C)',
  },
  btnSuccess: {
    background: 'var(--elab-navy, #1E4D8C)',
  },
  btnError: {
    background: 'var(--elab-red, #E54B3D)',
  },
  status: {
    fontSize: 12,
    color: '#5A6B7E',
    textAlign: 'center',
    minHeight: 16,
  },
  progress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    background: 'rgba(30, 77, 140, 0.12)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--elab-orange, #E8941C)',
    transition: 'width 80ms linear',
  },
};

/**
 * @param {object} props
 * @param {string} props.hexText - Intel HEX text from compile result
 * @param {number} [props.baudRate=57600] - 57600 for old bootloader, 115200 for optiboot
 * @param {Function} [props.onSuccess]
 * @param {Function} [props.onError]
 * @param {boolean} [props.disabled]
 * @param {string} [props.label]
 */
export default function WebSerialUploadButton({
  hexText,
  baudRate = 57600,
  onSuccess,
  onError,
  disabled = false,
  label = 'Carica via WebSerial',
}) {
  const [state, setState] = useState(STATE.IDLE);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isWebSerialSupported()) setState(STATE.UNSUPPORTED);
  }, []);

  const handleClick = useCallback(async () => {
    if (!hexText) {
      setMessage('Ragazzi, compilate prima il codice.');
      setState(STATE.ERROR);
      return;
    }
    setState(STATE.CONNECTING);
    setMessage('Selezionate la porta dell\'Arduino…');
    setProgress({ done: 0, total: 0 });

    const result = await requestAndFlash(hexText, {
      baudRate,
      onProgress: (done, total) => {
        setState(STATE.UPLOADING);
        setMessage(`Caricamento: ${done}/${total} byte`);
        setProgress({ done, total });
      },
    });

    if (result.success) {
      setState(STATE.SUCCESS);
      setMessage(`Caricato! ${result.bytesWritten} byte scritti sulla scheda.`);
      if (typeof onSuccess === 'function') onSuccess(result);
      setTimeout(() => {
        setState(STATE.IDLE);
        setMessage('');
      }, 4000);
    } else {
      setState(STATE.ERROR);
      const msg = errorMessage(result.errorCategory);
      setMessage(msg);
      if (typeof onError === 'function') onError({ ...result, message: msg });
    }
  }, [hexText, baudRate, onSuccess, onError]);

  if (state === STATE.UNSUPPORTED) {
    return (
      <div style={styles.wrap}>
        <button
          type="button"
          style={{ ...styles.btn, ...styles.btnDisabled }}
          disabled
          aria-label="WebSerial non supportato"
          data-testid="web-serial-upload-unsupported"
        >
          WebSerial non disponibile
        </button>
        <span style={styles.status}>Ragazzi, aprite la pagina in Chrome o Edge.</span>
      </div>
    );
  }

  const isBusy = state === STATE.CONNECTING || state === STATE.UPLOADING;
  const effectiveDisabled = disabled || isBusy || !hexText;
  const btnStyle = {
    ...styles.btn,
    ...(effectiveDisabled ? styles.btnDisabled : {}),
    ...(state === STATE.UPLOADING ? styles.btnUploading : {}),
    ...(state === STATE.SUCCESS ? styles.btnSuccess : {}),
    ...(state === STATE.ERROR ? styles.btnError : {}),
  };

  const labelText =
    state === STATE.CONNECTING ? 'Selezionate la porta…'
      : state === STATE.UPLOADING ? 'Caricamento…'
      : state === STATE.SUCCESS ? 'Caricato!'
      : state === STATE.ERROR ? 'Riprova'
      : label;

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={styles.wrap} data-testid="web-serial-upload">
      <button
        type="button"
        style={btnStyle}
        onClick={handleClick}
        disabled={effectiveDisabled}
        aria-label={label}
        aria-busy={isBusy}
        data-testid="web-serial-upload-btn"
        data-state={state}
      >
        {labelText}
      </button>
      {progress.total > 0 && state === STATE.UPLOADING && (
        <div style={styles.progress} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ ...styles.progressBar, width: `${pct}%` }} />
        </div>
      )}
      {message && (
        <span
          style={styles.status}
          role={state === STATE.ERROR ? 'alert' : 'status'}
          data-testid="web-serial-upload-status"
        >
          {message}
        </span>
      )}
    </div>
  );
}
