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
import {
  isValidVolumeCitation,
  formatVolumeCitationLabel,
} from '../../../../../packs/elab-tutor/data/volume-citation.js';
import { BookIcon } from './ElabIcons';
import css from './VolumeCitation.module.css';

export default function VolumeCitation({ volume, page, onClick, label }) {
  if (!isValidVolumeCitation(volume, page)) return null;

  const text = label ?? formatVolumeCitationLabel(volume, page);
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
