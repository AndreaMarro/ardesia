import React, { useEffect } from 'react';
import SessionReportComic from './SessionReportComic';
import styles from './SessionReportComicModal.module.css';

export default function SessionReportComicModal({ session, onClose, onMountNextExperiment }) {
  useEffect(() => {
    if (!session || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [session]);

  if (!session) return null;

  return (
    <div
      className={styles.backdrop}
      data-testid="session-report-comic-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Fumetto ELAB generato dalla sessione"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={styles.shell}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Chiudi fumetto ELAB"
        >
          x
        </button>
        <SessionReportComic
          session={session}
          onMountNextExperiment={(experimentId) => {
            onMountNextExperiment?.(experimentId);
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}
