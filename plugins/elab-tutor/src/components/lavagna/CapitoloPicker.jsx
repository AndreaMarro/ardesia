/**
 * CapitoloPicker — Sprint Q2.C
 * Andrea Marro 2026-04-25
 *
 * Grid Cap per volume con switcher Vol 1/2/3.
 * Click su Cap card -> callback onSelectCapitolo(capId).
 *
 * PRINCIPIO ZERO: card descrittive, no comandi al docente.
 *
 * Props:
 *   capitoli: Capitolo[]                       — full lista da percorsoService
 *   volume?: 1 | 2 | 3                          — volume selezionato (default 1)
 *   onSelectCapitolo?: (capId: string) => void
 *   onVolumeChange?: (vol: number) => void
 */

import React, { useState } from 'react';
import css from './CapitoloPicker.module.css';

const VOLUMES = [1, 2, 3];
const TYPE_LABELS = {
  theory: 'theory',
  experiment: 'experiment',
  project: 'project',
  bonus: 'bonus',
  wip: 'wip',
};

export default function CapitoloPicker({
  capitoli = [],
  volume = 1,
  onSelectCapitolo,
  onVolumeChange,
}) {
  const [internalVolume, setInternalVolume] = useState(volume);
  const currentVolume = onVolumeChange ? volume : internalVolume;

  const handleVolumeChange = (v) => {
    if (onVolumeChange) onVolumeChange(v);
    else setInternalVolume(v);
  };

  const filtered = capitoli
    .filter((c) => c.volume === currentVolume && c.type !== 'bonus')
    .sort((a, b) => (a.capitolo ?? 0) - (b.capitolo ?? 0));

  return (
    <div className={css.picker}>
      <div className={css.volumeSwitcher} aria-label="Selezione volume">
        {VOLUMES.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={v === currentVolume}
            aria-label={`Volume ${v}`}
            className={`${css.volumeTab} ${v === currentVolume ? css.volumeTabActive : ''}`}
            onClick={() => handleVolumeChange(v)}
          >
            Vol {v}
          </button>
        ))}
      </div>

      <div
        className={css.capGrid}
        role="region"
        aria-label={`Capitoli volume ${currentVolume}`}
      >
        {filtered.length === 0 ? (
          <div className={css.empty}>Nessun capitolo disponibile per Volume {currentVolume}.</div>
        ) : (
          filtered.map((cap) => (
            <button
              key={cap.id}
              type="button"
              className={`${css.capCard} ${css[`type_${cap.type}`] ?? ''}`}
              onClick={() => onSelectCapitolo?.(cap.id)}
              aria-label={`Capitolo ${cap.capitolo} ${cap.titolo}`}
            >
              <div className={css.capNumber}>Cap. {cap.capitolo}</div>
              <div className={css.capTitle}>{cap.titolo}</div>
              <div className={css.capMeta}>
                <span className={css.typeBadge}>{TYPE_LABELS[cap.type] ?? cap.type}</span>
                {(cap.esperimenti?.length ?? 0) > 0 && (
                  <span className={css.espCount}>
                    {cap.esperimenti.length} esperiment{cap.esperimenti.length === 1 ? 'o' : 'i'}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
