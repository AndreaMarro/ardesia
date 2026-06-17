/**
 * VisionButton — Vision E2E trigger
 * Click → window.__ELAB_API.captureScreenshot() → pass base64 to onVisionResult.
 * Claude Opus 4.7 andrea marro — 19/04/2026
 */
import React, { useCallback, useState } from 'react';
import { CameraIcon } from '../common/ElabIcons';
import styles from './VisionButton.module.css';

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    throw new Error('Screenshot format invalido');
  }
  const [prefix, base64] = dataUrl.split(',');
  const mimeMatch = prefix.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  return { base64: base64 || '', mimeType };
}

export default function VisionButton({ onVisionResult, onError }) {
  const [loading, setLoading] = useState(false);
  const hasApi =
    typeof window !== 'undefined' &&
    typeof window.__ELAB_API?.captureScreenshot === 'function';

  const handleClick = useCallback(async () => {
    if (!hasApi || loading) return;
    setLoading(true);
    try {
      const dataUrl = await window.__ELAB_API.captureScreenshot();
      const parsed = parseDataUrl(dataUrl);
      onVisionResult?.(parsed);
    } catch (err) {
      if (typeof onError === 'function') {
        onError(err);
      } else if (typeof console !== 'undefined') {
        console.error('[VisionButton] capture error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [hasApi, loading, onVisionResult, onError]);

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleClick}
      disabled={!hasApi || loading}
      aria-label="Guarda il mio circuito - UNLIM analizza lo schermo"
      aria-busy={loading || undefined}
    >
      <CameraIcon size={20} className={styles.icon} aria-hidden="true" />
      <span className={styles.label}>
        {loading ? 'Sto guardando...' : 'Guarda il mio circuito'}
      </span>
    </button>
  );
}
