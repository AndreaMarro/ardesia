/**
 * RotateDeviceOverlay — Gentle prompt to rotate device to landscape
 * Shows on touch devices in portrait orientation when viewport width < 1024px.
 * Dismissible — user can tap to hide for the current session.
 * © Andrea Marro — 07/03/2026
 */

import React, { useState, useEffect } from 'react';

const RotateDeviceOverlay = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only activate on touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const checkOrientation = () => {
      if (dismissed) return;
      const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setVisible(isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={styles.backdrop} onClick={handleDismiss}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
            <rect x="8" y="12" width="48" height="32" rx="4" stroke="var(--color-primary, var(--elab-navy))" strokeWidth="2.5" fill="none" />
            <circle cx="52" cy="28" r="2" fill="var(--color-primary, var(--elab-navy))" />
            <path d="M32 50 L26 56 L38 56 Z" fill="var(--color-accent, var(--elab-lime))" />
            <path d="M44 4 C52 4 56 8 56 12" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M56 12 L58 8 L52 10" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h3 style={styles.title}>Ruota il dispositivo</h3>
        <p style={styles.subtitle}>
          Il simulatore funziona meglio in modalit&agrave; orizzontale
        </p>
        <button style={styles.dismissBtn} onClick={handleDismiss}>
          Continua comunque
        </button>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(250, 250, 247, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 'var(--z-overlay, 300)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  card: {
    textAlign: 'center',
    padding: '32px 28px 24px',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    animation: 'elab-rotate-hint 2s ease-in-out infinite',
  },
  title: {
    fontFamily: "var(--font-display, 'Oswald', sans-serif)",
    fontSize: 'var(--font-size-xl, 24px)',
    fontWeight: 700,
    color: 'var(--color-primary, var(--elab-navy))',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px',
  },
  subtitle: {
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    fontSize: 'var(--font-size-base, 15px)',
    color: 'var(--color-text-secondary, #6B6B80)',
    lineHeight: 1.5,
    margin: '0 0 20px',
  },
  dismissBtn: {
    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
    fontSize: 'var(--font-size-sm, 14px)',
    fontWeight: 600,
    color: 'var(--color-text-secondary, #6B6B80)',
    background: 'transparent',
    border: '1px solid var(--color-border, #E5E5EA)',
    borderRadius: 'var(--radius-sm, 6px)',
    padding: '8px 20px',
    cursor: 'pointer',
    minHeight: 'var(--touch-min, 56px)',
  },
};

export default RotateDeviceOverlay;
