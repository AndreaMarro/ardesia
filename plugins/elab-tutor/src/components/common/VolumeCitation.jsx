/**
 * VolumeCitation — inline badge per citazioni volumi nel Percorso Capitolo
 * Andrea Marro 2026-04-25 (Sprint Q2.A)
 *
 * Renderizza "Vol.N pag.M" come badge cliccabile (apre VolumeViewer)
 * o span statico (display only).
 *
 * PRINCIPIO ZERO: testo neutro nominale, no comandi.
 *
 * Props:
 *   volume: 1 | 2 | 3
 *   page: number positive
 *   onClick?: ({ volume, page }) => void
 *   label?: string (override testo default "Vol.N pag.M")
 */

import React from 'react';
import { BookIcon } from './ElabIcons';
import css from './VolumeCitation.module.css';

const VALID_VOLUMES = [1, 2, 3];

export default function VolumeCitation({ volume, page, onClick, label }) {
  if (!VALID_VOLUMES.includes(volume)) return null;
  if (typeof page !== 'number' || page <= 0) return null;

  const text = label ?? `Vol.${volume} pag.${page}`;
  const ariaLabel = `Citazione Volume ${volume} pagina ${page}`;

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        className={css.badge}
        onClick={() => onClick({ volume, page })}
        aria-label={ariaLabel}
      >
        <BookIcon className={css.icon} aria-hidden="true" />
        <span className={css.text}>{text}</span>
      </button>
    );
  }

  return (
    <span className={css.badgeStatic} aria-label={ariaLabel}>
      <span aria-hidden="true" className={css.icon}>📖</span>
      <span className={css.text}>{text}</span>
    </span>
  );
}
