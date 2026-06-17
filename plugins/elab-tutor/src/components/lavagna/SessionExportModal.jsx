/**
 * SessionExportModal — Goal B B3
 *
 * Modal aperto dal pulsante Salva in AppHeader. Tre azioni esplicite per
 * il docente:
 *   1. Salva su Supabase  → richiama callback parent (sessionTracker)
 *   2. Esporta JSON       → download blob schema v1.0 (sessionExporter)
 *   3. Importa JSON       → file input + restore via sessionImporter
 *
 * ARIA dialog role + aria-modal. ESC + backdrop click + esplicito close.
 * Touch target >= 44x44. Copy + ARIA label in italiano. Match palette
 * Lavagna (navy / lime / orange focus ring).
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  exportSessionAsJSON,
} from '../../services/sessionExporter.js';
import {
  importSessionFromJSON,
  MAX_IMPORT_BYTES,
} from '../../services/sessionImporter.js';
import logger from '../../utils/logger.js';
import css from './SessionExportModal.module.css';

function sanitizeFilenameToken(token) {
  if (typeof token !== 'string' || !token) return 'session';
  return token.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'session';
}

export default function SessionExportModal({
  isOpen,
  onClose,
  onSaveSupabase,
  currentExperimentId,
  currentModalita,
}) {
  const fileInputRef = useRef(null);
  const overlayRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  // Codex HIGH-3 fix 2026-05-25: ESC was bound only to the overlay element
  // (tabIndex=-1, never focused), so live ESC keystrokes never reached the
  // handler. Bind at document level when open, and programmatically focus
  // the overlay on mount so screen-reader users land inside the dialog.
  useEffect(() => {
    if (!isOpen) return undefined;
    try { overlayRef.current?.focus?.(); } catch { /* ignore */ }
    const onDocKeyDown = (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onDocKeyDown, true);
    return () => document.removeEventListener('keydown', onDocKeyDown, true);
  }, [isOpen, onClose]);

  // Codex HIGH-3 fix: explicit close handler with preventDefault to neutralize
  // any parent click-capture (e.g. AppHeader stacking context bubble-up).
  const handleExplicitClose = useCallback((ev) => {
    try { ev?.preventDefault?.(); ev?.stopPropagation?.(); } catch { /* ignore */ }
    onClose?.();
  }, [onClose]);

  const handleKeyDown = useCallback((ev) => {
    // Backup: still handle keydown on the overlay (when it IS focused).
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      onClose?.();
    }
  }, [onClose]);

  const handleBackdropClick = useCallback((ev) => {
    // Solo se il click è proprio sul backdrop (non sul contenuto).
    if (ev.target === ev.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  const handleExport = useCallback(() => {
    setErrorMsg(null);
    try {
      const json = exportSessionAsJSON({
        modalita: currentModalita || 'percorso',
        experimentMeta: currentExperimentId ? { id: currentExperimentId } : undefined,
      });
      const expToken = sanitizeFilenameToken(currentExperimentId || 'session');
      const filename = `elab-session-${expToken}-${Date.now()}.json`;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoca dopo un tick per evitare race con il download del browser
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch { /* ignore */ }
      }, 0);
    } catch (err) {
      logger.error('[SessionExportModal] export failed', err);
      setErrorMsg('Esportazione non riuscita. Riprova tra un attimo.');
    }
  }, [currentExperimentId, currentModalita]);

  const handleImportClick = useCallback(() => {
    setErrorMsg(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (ev) => {
    setErrorMsg(null);
    const file = ev.target.files && ev.target.files[0];
    // Resetta sempre il value così re-import dello stesso file funziona.
    if (ev.target) ev.target.value = '';
    if (!file) return;

    if (file.size > MAX_IMPORT_BYTES) {
      setErrorMsg(`File troppo grande (max ${Math.round(MAX_IMPORT_BYTES / 1024)} KB).`);
      return;
    }

    setBusy(true);
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('lettura fallita'));
        reader.readAsText(file);
      });

      const result = await importSessionFromJSON(text);
      if (!result.ok) {
        const summary = (result.errors && result.errors.length > 0)
          ? result.errors.slice(0, 3).join(' · ')
          : 'errore sconosciuto';
        setErrorMsg(`Import non riuscito: ${summary}`);
        return;
      }

      onClose?.();
    } catch (err) {
      logger.error('[SessionExportModal] import failed', err);
      setErrorMsg('Lettura del file non riuscita. Verifica che sia un JSON ELAB.');
    } finally {
      setBusy(false);
    }
  }, [onClose]);

  const handleSaveSupabase = useCallback(() => {
    setErrorMsg(null);
    try {
      onSaveSupabase?.();
    } catch (err) {
      logger.error('[SessionExportModal] supabase save threw', err);
      setErrorMsg('Salvataggio su Supabase non riuscito. Riprova.');
    }
  }, [onSaveSupabase]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={css.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-export-modal-title"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      data-testid="session-export-modal"
    >
      <div className={css.content}>
        <button
          type="button"
          className={css.closeBtn}
          onClick={handleExplicitClose}
          aria-label="Chiudi finestra di salvataggio"
          title="Chiudi"
          data-testid="session-export-modal-close"
        >
          {'×'}
        </button>

        <h2 id="session-export-modal-title" className={css.title}>
          Salva la sessione
        </h2>
        <p className={css.subtitle}>
          Scegli come conservare il lavoro della classe: in cloud su Supabase,
          come file JSON da scaricare o ripristina una sessione esportata in precedenza.
        </p>

        {errorMsg && (
          <p className={css.errorBox} role="alert">
            <strong>Attenzione.</strong> {errorMsg}
          </p>
        )}

        <div className={css.actions}>
          {/* 1. Salva su Supabase */}
          <button
            type="button"
            className={`${css.actionBtn} ${css.actionPrimary}`}
            onClick={handleSaveSupabase}
            aria-label="Salva la sessione su Supabase"
            data-testid="session-export-save-supabase"
            disabled={busy}
          >
            <span className={css.actionIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M3 4h11l3 3v9H3V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M6 4v5h7V4M6 16v-5h8v5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={css.actionText}>
              <span className={css.actionLabel}>Salva su Supabase</span>
              <span className={css.actionHint}>Cronologia classe + Cronologia recente.</span>
            </span>
          </button>

          {/* 2. Esporta JSON */}
          <button
            type="button"
            className={css.actionBtn}
            onClick={handleExport}
            aria-label="Esporta la sessione come file JSON"
            data-testid="session-export-download-json"
            disabled={busy}
          >
            <span className={css.actionIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v9m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className={css.actionText}>
              <span className={css.actionLabel}>Esporta JSON</span>
              <span className={css.actionHint}>Scarica un file con componenti e fili.</span>
            </span>
          </button>

          {/* 3. Importa JSON */}
          <button
            type="button"
            className={css.actionBtn}
            onClick={handleImportClick}
            aria-label="Importa una sessione da file JSON"
            data-testid="session-export-import-json"
            disabled={busy}
          >
            <span className={css.actionIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M10 17V8m0 0l3 3m-3-3L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 6V4a1 1 0 011-1h12a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className={css.actionText}>
              <span className={css.actionLabel}>Importa JSON</span>
              <span className={css.actionHint}>Ripristina una sessione precedente.</span>
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className={css.fileInput}
            onChange={handleFileChange}
            aria-label="Importa JSON: seleziona file"
            data-testid="session-export-file-input"
          />
        </div>
      </div>
    </div>
  );
}
