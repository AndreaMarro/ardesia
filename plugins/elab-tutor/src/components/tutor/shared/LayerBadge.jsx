// ============================================
// LayerBadge — Badge Terra/Schema/Cielo + Volume
// Centralizza costanti duplicate in 3+ file
// © Andrea Marro — 2026
// ============================================

import React from 'react';

export const LAYER_COLORS = {
  terra: { bg: 'var(--elab-hex-dcfce7)', text: 'var(--elab-hex-16a34a)', label: 'Terra', emoji: '' },
  schema: { bg: '#dbeafe', text: 'var(--elab-navy)', label: 'Schema', emoji: '' },
  cielo: { bg: 'var(--elab-hex-ffedd5)', text: 'var(--elab-hex-ea580c)', label: 'Cielo', emoji: '' }
};

const LAYER_INFO = {
  terra: { name: 'Terra', description: 'Concreto: toccare, vedere, fare' },
  schema: { name: 'Schema', description: 'Rappresentazione: schemi, simboli, diagrammi' },
  cielo: { name: 'Cielo', description: 'Astratto: formule, logica, generalizzazioni' }
};

const DIFFICULTY_LABELS = {
  1: 'Facile',
  2: 'Medio',
  3: 'Difficile'
};

/**
 * Badge per layer Terra/Schema/Cielo
 */
export function LayerBadge({ layer }) {
  const info = LAYER_COLORS[layer];
  if (!info) return null;

  return (
    <span className={`elab-tool__badge elab-tool__badge--${layer}`}>
      {info.label}
    </span>
  );
}

/**
 * Badge per Volume e Capitolo
 */
export function VolumeBadge({ volume, chapter }) {
  return (
    <span className="elab-tool__badge elab-tool__badge--volume">
      Vol.{volume}{chapter ? ` Cap.${chapter}` : ''}
    </span>
  );
}

/**
 * Badge per difficolta
 */
export function DifficultyBadge({ level }) {
  return (
    <span className="elab-tool__badge elab-tool__badge--difficulty">
      {DIFFICULTY_LABELS[level] || `Livello ${level}`}
    </span>
  );
}

/**
 * Badge per concetto
 */
export function ConceptBadge({ concept }) {
  return (
    <span className="elab-tool__badge elab-tool__badge--concept">
      {concept}
    </span>
  );
}

export default LayerBadge;
