// ============================================
// ELAB Tutor - Suggerimenti Contestuali
// TabHint: tooltip al primo accesso di ogni tab
// © Andrea Marro — 2026
// ============================================

import React, { useState, useEffect } from 'react';
import { getTotalExperiments } from '../../data/experiments-index';
import './TutorTools.css'; // per fadeInDown + classi condivise

const HINT_KEY_PREFIX = 'elab_hint_';
const TOTAL_EXPERIMENTS = getTotalExperiments();

// Suggerimenti per ogni tab (mostrati solo la prima volta)
const TAB_HINTS = {
  chat: {
    emoji: '',
    title: 'Chatta con UNLIM',
    text: 'Da quale argomento vuoi partire? Qui puoi fare domande su elettronica, Arduino e circuiti, con una guida passo passo.',
  },
  manual: {
    emoji: '',
    title: 'Il tuo manuale ELAB',
    text: 'Quale volume ti serve adesso? Qui trovi i 3 volumi ELAB da sfogliare e usare durante gli esperimenti.',
  },
  simulator: {
    emoji: '',
    title: 'Simulatore ELAB',
    text: `${TOTAL_EXPERIMENTS} circuiti già pronti: quale vuoi osservare per primo? Nel simulatore puoi vedere cosa succede e interagire con i componenti.`,
  },
  canvas: {
    emoji: '',
    title: 'La tua lavagna',
    text: 'Ti va di schizzare un circuito o annotare un dubbio? Puoi anche chiedere un commento sul disegno che hai fatto.',
  },
  notebooks: {
    emoji: '',
    title: 'Il tuo quaderno',
    text: 'Quale idea vuoi fissare adesso? Qui puoi prendere appunti durante la lezione, con salvataggio automatico.',
  },
  detective: {
    emoji: '',
    title: 'Trova il Guasto',
    text: 'C\'è un errore nascosto nel circuito: quale indizio noti per primo?',
  },
  poe: {
    emoji: '',
    title: 'Prevedi e Spiega',
    text: 'Cosa ti aspetti che succeda? Prima fai una previsione, poi confrontala con il risultato.',
  },
  reverse: {
    emoji: '',
    title: 'Circuito Misterioso',
    text: 'Il circuito funziona, ma un componente è nascosto: quali misure ti aiutano a identificarlo?',
  },
  review: {
    emoji: '',
    title: 'Controlla Circuito',
    text: 'Se UNLIM propone un circuito, quali controlli faresti prima di confermarlo?',
  },
  timeline: {
    emoji: '',
    title: 'I Miei Progressi',
    text: 'Quale passaggio vuoi rivedere? Qui trovi il tuo percorso, progetto dopo progetto.',
  },
  videos: {
    emoji: '',
    title: 'Video e Media',
    text: 'Preferisci un esempio visivo? Qui trovi video e contenuti multimediali su circuiti e Arduino.',
  },
};


/**
 * Componente per suggerimenti contestuali
 * Mostra un tooltip al primo accesso di ogni tab
 */
export function TabHint({ tabId, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const hint = TAB_HINTS[tabId];

  useEffect(() => {
    if (!hint) return;
    const key = HINT_KEY_PREFIX + tabId + '_seen';
    const seen = localStorage.getItem(key);
    if (!seen) {
      // Mostra dopo un breve ritardo
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tabId, hint]);

  const dismiss = () => {
    const key = HINT_KEY_PREFIX + tabId + '_seen';
    localStorage.setItem(key, 'true');
    setVisible(false);
    onDismiss?.();
  };

  if (!visible || !hint) return null;

  return (
    <div className="elab-tool__hint-tooltip">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {hint.emoji && <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{hint.emoji}</span>}
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 4px',
            color: 'var(--color-primary, var(--elab-navy))',
            fontFamily: 'var(--font-display, Oswald, sans-serif)',
            fontSize: 14
          }}>
            {hint.title}
          </h4>
          <p style={{
            margin: 0,
            color: 'var(--color-text-secondary, #6B6B80)',
            fontFamily: 'var(--font-sans, Open Sans, sans-serif)',
            fontSize: 14,
            lineHeight: 1.4
          }}>
            {hint.text}
          </p>
        </div>
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none',
            color: 'var(--elab-muted, #64748B)',
            cursor: 'pointer', fontSize: '1.1rem',
            padding: 4, flexShrink: 0, minHeight: 44, minWidth: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          aria-label="Chiudi suggerimento"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Proactive hooks (useIdleSuggestion, useConfusionPrompt) removed —
// UNLIM now speaks only when addressed by the student.
