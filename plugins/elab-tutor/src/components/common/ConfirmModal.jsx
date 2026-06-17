/**
 * S99: Custom confirmation modal — replaces window.confirm()
 * Non-blocking, React-based, with ELAB design system styling.
 *
 * Usage (hook pattern):
 *   const { confirm, ConfirmDialog } = useConfirmModal();
 *   const ok = await confirm('Eliminare questo elemento?');
 *   if (ok) { ... }
 *   // Render <ConfirmDialog /> in JSX
 *
 * Usage (controlled):
 *   <ConfirmModal open={true} title="Conferma" message="Sei sicuro?"
 *     onConfirm={() => {}} onCancel={() => {}} />
 *
 * © Andrea Marro — 09/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import useFocusTrap from '../../hooks/useFocusTrap';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(30, 77, 140, 0.35)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  animation: 'confirmFadeIn 0.15s ease-out',
};

const modalStyle = {
  background: '#fff',
  borderRadius: 12,
  padding: '24px 28px',
  maxWidth: 380,
  width: '90%',
  boxShadow: '0 8px 32px rgba(30, 77, 140, 0.25)',
  fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
  animation: 'confirmSlideIn 0.2s ease-out',
};

const titleStyle = {
  margin: '0 0 8px 0',
  fontSize: 18,
  fontWeight: 700,
  fontFamily: "var(--font-display, 'Oswald', sans-serif)",
  color: 'var(--color-primary, var(--elab-navy))',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const messageStyle = {
  margin: '0 0 20px 0',
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-text, #1A1A2E)',
};

const btnRow = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
};

const btnBase = {
  padding: '8px 20px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.15s',
};

const cancelBtnStyle = {
  ...btnBase,
  background: 'var(--color-bg-secondary, #F5F5F0)',
  color: 'var(--color-text, #1A1A2E)',
};

const confirmBtnStyle = {
  ...btnBase,
  background: 'var(--color-vol3, var(--elab-red))',
  color: '#fff',
};

// Keyframes injected once
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confirmFadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes confirmSlideIn { from { transform: translateY(-12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  `;
  document.head.appendChild(style);
}

/**
 * Controlled confirmation modal component.
 */
export function ConfirmModal({ open, title = 'Conferma', message, onConfirm, onCancel, confirmLabel = 'Elimina', cancelLabel = 'Annulla' }) {
  const trapRef = useFocusTrap(open);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel]);

  if (!open) return null;
  injectStyles();

  return (
    <div style={overlayStyle} onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div ref={trapRef} style={modalStyle} onClick={e => e.stopPropagation()}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div style={btnRow}>
          <button style={cancelBtnStyle} onClick={onCancel}>{cancelLabel}</button>
          <button style={confirmBtnStyle} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook that returns an async `confirm(message)` function and a `ConfirmDialog` component.
 * Call `await confirm('message')` — returns true/false.
 * Place `<ConfirmDialog />` in your JSX tree.
 */
export function useConfirmModal() {
  const [state, setState] = useState({ open: false, message: '', title: 'Conferma', confirmLabel: 'Elimina' });
  const resolveRef = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise(resolve => {
      resolveRef.current = resolve;
      setState({
        open: true,
        message,
        title: options.title || 'Conferma',
        confirmLabel: options.confirmLabel || 'Elimina',
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setState(s => ({ ...s, open: false }));
    resolveRef.current?.(false);
  }, []);

  const ConfirmDialog = useCallback(() => (
    <ConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [state.open, state.title, state.message, state.confirmLabel, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog };
}

export default ConfirmModal;
