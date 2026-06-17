/**
 * StarRating — Mostra 1-3 stelle dopo completamento gioco
 * + badge bronzo/argento/oro per progressi complessivi
 * © Andrea Marro — 20/02/2026
 */
import React from 'react';

const STAR_COLORS = { filled: '#f59e0b', empty: '#d1d5db' }; // palette
const BADGE_META = {
  bronzo: { emoji: '', label: 'Bronzo', color: '#cd7f32' }, // palette
  argento: { emoji: '', label: 'Argento', color: '#a0aec0' }, // palette
  oro: { emoji: '', label: 'Oro', color: '#f59e0b' }, // palette
};

export function StarDisplay({ stars, size = 20 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= stars ? STAR_COLORS.filled : STAR_COLORS.empty}
          style={{ transition: 'fill 0.3s ease', filter: i <= stars ? 'drop-shadow(0 1px 2px rgba(245,158,11,0.4))' : 'none' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export function StarResult({ stars, message }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 16px', borderRadius: '10px',
      background: stars === 3 ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.03)',
      border: `1px solid ${stars === 3 ? 'rgba(245,158,11,0.3)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <StarDisplay stars={stars} size={22} />
      {message && <span style={{ fontSize: '14px', color: '#4a5568' }}>{message}</span>}
    </div>
  );
}

export function BadgeDisplay({ badge }) {
  if (!badge) return null;
  const meta = BADGE_META[badge];
  if (!meta) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: '600',
      background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30`,
    }}>
      {meta.label}
    </span>
  );
}

/** Calculate badge from star array: bronzo ≥33%, argento ≥66%, oro 100% */
export function calculateBadge(starsArray) {
  if (!starsArray || starsArray.length === 0) return null;
  const threeStarCount = starsArray.filter(s => s === 3).length;
  const ratio = threeStarCount / starsArray.length;
  if (ratio >= 1) return 'oro';
  if (ratio >= 0.66) return 'argento';
  if (ratio >= 0.33) return 'bronzo';
  return null;
}
