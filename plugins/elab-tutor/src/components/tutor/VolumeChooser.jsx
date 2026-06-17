/**
 * ELAB Tutor — VolumeChooser
 * UNLIM-style overlay: "Quale volume usate oggi?" → 4 scatole
 * Ritorno: "Bentornati! Continuiamo?" → Continua / Cambia volume
 * Design: LIM-friendly, touch targets ≥ 48px, linguaggio 10-14 anni
 * © Andrea Marro — 29/03/2026 — G22 Volume Sections
 */

import React, { useState, useMemo } from 'react';
import { VOLUMES } from '../../data/experiments-index';
import css from './VolumeChooser.module.css';

const VOL_COLORS = {
  1: 'var(--elab-lime)',
  2: 'var(--elab-orange)',
  3: 'var(--elab-red)',
  inventor: 'var(--elab-navy)',
};

const iconSvg = { xmlns: 'http://www.w3.org/2000/svg', width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const VOL_ICONS = {
  1: <svg {...iconSvg} style={{ color: 'var(--elab-lime)' }}><circle cx="12" cy="12" r="3"/><line x1="12" y1="5" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="19"/><line x1="5" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="19" y2="12"/></svg>,
  2: <svg {...iconSvg} style={{ color: 'var(--elab-orange)' }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  3: <svg {...iconSvg} style={{ color: 'var(--elab-red)' }}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/></svg>,
  inventor: <svg {...iconSvg} style={{ color: 'var(--elab-navy)' }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

const VOL_BG = {
  1: 'linear-gradient(135deg, #f1f8e9, #e8f5e9)', // palette
  2: 'linear-gradient(135deg, #fff8e1, #fff3e0)', // palette
  3: 'linear-gradient(135deg, #fce4ec, #ffebee)', // palette
  inventor: 'linear-gradient(135deg, #e3f2fd, #e8eaf6)', // palette
};

/**
 * @param {Object} props
 * @param {function} props.onSelectVolume - Called with volume number (1,2,3) or 'inventor'
 * @param {number|string|null} props.lastVolume - Last used volume from localStorage
 * @param {string|null} props.lastExperimentTitle - Title of last experiment
 * @param {boolean} props.isFirstTime - True if no prior sessions
 */
export default function VolumeChooser({ onSelectVolume, lastVolume, lastExperimentTitle, isFirstTime }) {
  const [showChangeMode, setShowChangeMode] = useState(false);

  // If returning user and not explicitly changing, show "Bentornati"
  const showWelcomeBack = lastVolume && !isFirstTime && !showChangeMode;

  const volumeCards = useMemo(() => {
    const cards = VOLUMES.map((vol, i) => ({
      key: i + 1,
      icon: VOL_ICONS[i + 1],
      title: `Volume ${i + 1}`,
      subtitle: vol.subtitle || '',
      count: vol.experiments.length,
      color: VOL_COLORS[i + 1],
      bg: VOL_BG[i + 1],
    }));
    cards.push({
      key: 'inventor',
      icon: VOL_ICONS.inventor,
      title: 'Inventore',
      subtitle: 'Costruisci quello che vuoi!',
      count: null,
      color: VOL_COLORS.inventor,
      bg: VOL_BG.inventor,
    });
    return cards;
  }, []);

  const lastVolumeLabel = lastVolume === 'inventor'
    ? 'modalità Inventore'
    : `Volume ${lastVolume}`;

  return (
    <div className={css.overlay} role="dialog" aria-modal="true" aria-label="Scegli il volume">
      <div className={css.container}>
        {/* Mascot */}
        <div className={css.mascotRow}>
          <img
            src="/assets/mascot/logo-senza-sfondo.png"
            alt="UNLIM"
            className={css.mascot}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {showWelcomeBack ? (
          /* ── RETURN FLOW: "Bentornati!" ── */
          <>
            <h1 className={css.heading}>Bentornati!</h1>
            <p className={css.subtitle}>
              L'ultima volta avete usato <strong style={{ color: VOL_COLORS[lastVolume] || VOL_COLORS.inventor }}>
                {lastVolumeLabel}
              </strong>
              {lastExperimentTitle && (
                <> — <em>"{lastExperimentTitle}"</em></>
              )}
            </p>
            <p className={css.subtitle}>Continuiamo da dove eravamo?</p>

            <div className={css.returnButtons}>
              <button
                onClick={() => onSelectVolume(lastVolume)}
                className={css.returnBtn}
                style={{ borderColor: VOL_COLORS[lastVolume] || VOL_COLORS.inventor, color: '#fff', background: VOL_COLORS[lastVolume] || VOL_COLORS.inventor }}
              >
                Continua
              </button>
              <button
                onClick={() => setShowChangeMode(true)}
                className={`${css.returnBtn} ${css.changeBtn}`}
              >
                Cambia volume
              </button>
            </div>
          </>
        ) : (
          /* ── FIRST TIME / CHANGE MODE: "Quale volume?" ── */
          <>
            <h1 className={css.heading}>
              {isFirstTime ? 'Ciao! Quale volume usate oggi?' : 'Quale volume usate oggi?'}
            </h1>
            {isFirstTime && (
              <p className={css.subtitle}>Scegli il volume del tuo kit ELAB</p>
            )}

            <div className={css.grid}>
              {volumeCards.map((card) => (
                <button
                  key={card.key}
                  onClick={() => onSelectVolume(card.key)}
                  className={css.card}
                  style={{ background: card.bg, borderColor: card.color, '--card-color': `${card.color}40` }}
                >
                  <span className={css.cardIcon}>{card.icon}</span>
                  <span className={css.cardTitle} style={{ color: card.color }}>{card.title}</span>
                  <span className={css.cardCount}>
                    {card.count != null ? `${card.count} esperimenti` : 'Tutti i pezzi'}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
