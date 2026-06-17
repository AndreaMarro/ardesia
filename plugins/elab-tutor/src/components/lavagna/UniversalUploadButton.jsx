/**
 * UniversalUploadButton — Single browser-side upload entry for ANY Arduino.
 *
 * Takes a `boardId` (from services/arduinoBoards.js) + Intel HEX text and
 * dispatches via arduinoUploader.uploadToBoard. The button auto-routes to
 * WebSerial (stk500v1/v2) or WebUSB (DFU) per the board's protocol. Future
 * BOSSA / esptool protocols surface as honest "not yet implemented".
 *
 * Replaces the previous WebSerialUploadButton + R4DfuUploadButton pair when
 * combined with a board picker.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */
import React, { useCallback, useState } from 'react';
import { uploadToBoard, describeUploadError } from '../../services/arduinoUploader.js';
import { getBoardById, MCU_FAMILY } from '../../services/arduinoBoards.js';

const STATE = Object.freeze({
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
});

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
  btnUploading: { background: 'var(--elab-orange, #E8941C)' },
  btnSuccess: { background: 'var(--elab-lime, #7CB342)' },
  btnError: { background: 'var(--elab-red, #E54B3D)' },
  status: { fontSize: 12, color: '#5A6B7E', textAlign: 'center', minHeight: 16 },
  progress: { width: '100%', height: 4, borderRadius: 2, background: 'rgba(30, 77, 140, 0.12)', overflow: 'hidden' },
  progressBar: { height: '100%', background: 'var(--elab-orange, #E8941C)', transition: 'width 80ms linear' },
};

export default function UniversalUploadButton({
  boardId,
  hexText,
  onSuccess,
  onError,
  disabled = false,
  label,
}) {
  const [state, setState] = useState(STATE.IDLE);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const board = getBoardById(boardId);
  const computedLabel = label || (board ? `Carica su ${board.label}` : 'Carica');
  const isRenesas = board?.mcuFamily === MCU_FAMILY.RENESAS;

  const handleClick = useCallback(async () => {
    if (!hexText) {
      setMessage('Ragazzi, compilate prima il codice.');
      setState(STATE.ERROR);
      return;
    }
    setState(STATE.UPLOADING);
    setMessage('Selezionate la scheda…');
    setProgress({ done: 0, total: 0 });

    const result = await uploadToBoard({
      boardId,
      hexText,
      onProgress: (done, total) => {
        setMessage(`Caricamento: ${done}/${total} byte`);
        setProgress({ done, total });
      },
    });

    if (result.success) {
      setState(STATE.SUCCESS);
      setMessage(`Caricato! ${result.bytesWritten} byte su ${board?.label || boardId}.`);
      if (typeof onSuccess === 'function') onSuccess(result);
      setTimeout(() => {
        setState(STATE.IDLE);
        setMessage('');
      }, 4500);
    } else {
      setState(STATE.ERROR);
      // Forward protocol so STK500 boards get USB-replug guidance instead
      // of Nano-R4-specific "double-tap RESET" copy (Andrea report 2026-05-28).
      const msg = describeUploadError(result.errorCategory, result.protocol);
      setMessage(msg);
      if (typeof onError === 'function') onError({ ...result, message: msg });
    }
  }, [boardId, hexText, board, onSuccess, onError]);

  const isBusy = state === STATE.UPLOADING;
  const effectiveDisabled = disabled || isBusy || !hexText || !board;
  const btnStyle = {
    ...styles.btn,
    ...(effectiveDisabled ? styles.btnDisabled : {}),
    ...(state === STATE.UPLOADING ? styles.btnUploading : {}),
    ...(state === STATE.SUCCESS ? styles.btnSuccess : {}),
    ...(state === STATE.ERROR ? styles.btnError : {}),
  };

  const labelText =
    state === STATE.UPLOADING ? 'Caricamento…'
      : state === STATE.SUCCESS ? 'Caricato!'
      : state === STATE.ERROR ? 'Riprova'
      : computedLabel;

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div style={styles.wrap} data-testid={`universal-upload-${boardId || 'none'}`}>
      {!hexText && state === STATE.IDLE && (
        <span
          style={{ ...styles.status, fontStyle: 'italic' }}
          data-testid="universal-upload-needs-compile"
        >
          Ragazzi, premete <strong>Compila</strong> per attivare il caricamento.
        </span>
      )}
      {isRenesas && state === STATE.IDLE && (
        <div
          style={{
            fontSize: 11,
            color: '#5A6B7E',
            background: 'rgba(232, 148, 28, 0.12)',
            border: '1px solid rgba(232, 148, 28, 0.32)',
            borderRadius: 6,
            padding: '6px 10px',
            lineHeight: 1.4,
          }}
          data-testid="r4-dfu-instructions"
        >
          Ragazzi, prima del caricamento premete <strong>2 volte</strong> il tasto <strong>RESET</strong> sulla Nano R4 — il LED L lampeggia: la scheda è pronta.
        </div>
      )}
      <button
        type="button"
        style={btnStyle}
        onClick={handleClick}
        disabled={effectiveDisabled}
        aria-label={computedLabel}
        aria-busy={isBusy}
        data-testid="universal-upload-btn"
        data-board={boardId}
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
          data-testid="universal-upload-status"
        >
          {message}
        </span>
      )}
    </div>
  );
}
