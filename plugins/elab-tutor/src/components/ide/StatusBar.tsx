import React from 'react';
import { ErrorIcon, LoadingIcon, SuccessIcon } from '../common/ElabIcons';
import styles from './IdeShell.module.css';

export type CompileStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'success'; size?: { bytes?: number; total?: number; percent?: number } }
  | { state: 'error'; message?: string };

type StatusBarProps = {
  status: CompileStatus;
};

type CompileSize = { bytes?: number; total?: number; percent?: number };

function formatSize(size?: CompileSize) {
  if (!size) return '';
  const { bytes, total, percent } = size;
  if (typeof bytes !== 'number') return '';
  if (typeof total === 'number' && typeof percent === 'number') {
    return `, ${bytes}/${total} byte (${percent}%)`;
  }
  return `, ${bytes} byte`;
}

export default function StatusBar({ status }: StatusBarProps) {
  let className = styles.statusIdle;
  let icon = null;
  let text = 'Pronto';

  if (status.state === 'loading') {
    className = styles.statusLoading;
    icon = <LoadingIcon size={16} />;
    text = 'Compilazione in corso';
  } else if (status.state === 'success') {
    className = styles.statusSuccess;
    icon = <SuccessIcon size={16} />;
    text = `Compilazione riuscita${formatSize(status.size)}`;
  } else if (status.state === 'error') {
    className = styles.statusError;
    icon = <ErrorIcon size={16} />;
    text = `Errore compilazione${status.message ? `: ${status.message}` : ''}`;
  }

  return (
    <div className={`${styles.statusBar} ${className}`} role="status" aria-live="polite">
      <span className={styles.statusIcon} aria-hidden="true">{icon}</span>
      <span className={styles.statusText}>{text}</span>
    </div>
  );
}
