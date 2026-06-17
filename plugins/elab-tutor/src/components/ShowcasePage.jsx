// ============================================
// ELAB Tutor - Showcase Page — Landing pubblica
// Renderizza VetrinaSimulatore direttamente (no redirect esterno)
// Andrea Marro — 27/03/2026
// ============================================

import VetrinaSimulatore from './VetrinaSimulatore';

export default function ShowcasePage({ onNavigate }) {
  return <VetrinaSimulatore onNavigate={onNavigate} />;
}
