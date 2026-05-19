import React, { useState } from 'react';
import { CircuitIcon, LoadingIcon } from '../common/ElabIcons';
import type { CompileStatus } from './StatusBar';
import styles from './IdeShell.module.css';

type CompileButtonProps = {
  source: string;
  onStatusChange: (status: CompileStatus) => void;
};

function normalizeSize(payload: Record<string, unknown>) {
  const raw = payload.size && typeof payload.size === 'object'
    ? payload.size as Record<string, unknown>
    : payload;
  const bytes = Number(raw.bytes ?? raw.flash ?? raw.flashBytes ?? raw.programSize);
  const total = Number(raw.total ?? raw.max ?? raw.maxBytes ?? raw.flashTotal);
  const percent = Number(raw.percent ?? raw.percentage);
  return {
    bytes: Number.isFinite(bytes) ? bytes : undefined,
    total: Number.isFinite(total) ? total : undefined,
    percent: Number.isFinite(percent) ? percent : undefined,
  };
}

export default function CompileButton({ source, onStatusChange }: CompileButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCompile() {
    if (loading) return;
    setLoading(true);
    onStatusChange({ state: 'loading' });

    try {
      const response = await fetch('/api/compile/nanor4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.ok === false) {
        const message = String(payload?.error || payload?.message || 'compilazione non riuscita');
        onStatusChange({ state: 'error', message });
        return;
      }

      onStatusChange({ state: 'success', size: normalizeSize(payload || {}) });
    } catch (error) {
      onStatusChange({
        state: 'error',
        message: error instanceof Error ? error.message : 'errore di rete',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.compileButton}
      onClick={handleCompile}
      disabled={loading}
    >
      {loading ? <LoadingIcon size={16} /> : <CircuitIcon size={16} />}
      <span>{loading ? 'Compilazione...' : 'Compila'}</span>
    </button>
  );
}
