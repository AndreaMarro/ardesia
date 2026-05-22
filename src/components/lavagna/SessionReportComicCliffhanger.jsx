import React from 'react';
import styles from './SessionReportComicCliffhanger.module.css';

function getExperimentLabel(id) {
  const match = /^v([1-3])-cap([0-9]+)-esp[0-9]+$/.exec(id || '');
  if (!match) return null;
  return `Vol.${match[1]} cap.${match[2]}`;
}

export default function SessionReportComicCliffhanger({ nextExperiment, onMountNext }) {
  if (!nextExperiment?.id) return null;

  const label = getExperimentLabel(nextExperiment.id);
  const ctaLabel = `Andiamo al prossimo esperimento${label ? ` ${label}` : ''}${
    nextExperiment.title ? `: ${nextExperiment.title}` : ''
  }`;

  return (
    <section
      className={styles.cliffhanger}
      data-testid="session-report-comic-cliffhanger"
      aria-label="Ponte narrativo verso il prossimo esperimento"
    >
      <div className={styles.copy}>
        <p className={styles.kicker}>Ponte narrativo</p>
        <h3 className={styles.title}>Ragazzi, il fumetto non finisce qui.</h3>
        <p className={styles.preview}>
          {nextExperiment.preview ||
            'Il kit fisico ha ancora una domanda aperta: ripartiamo dal prossimo circuito.'}
        </p>
      </div>
      <button
        type="button"
        className={styles.cta}
        onClick={() => onMountNext?.(nextExperiment.id)}
        aria-label={ctaLabel}
      >
        <span>
          Andiamo al prossimo esperimento{label ? ` ${label}` : ''}
        </span>
      </button>
    </section>
  );
}
