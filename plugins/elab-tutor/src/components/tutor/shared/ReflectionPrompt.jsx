// ============================================
// ReflectionPrompt — Riflessione post-attivita
// "Sapere di Non Sapere" — celebra la confusione
// Salva nel diario via studentService
// © Andrea Marro — 2026
// ============================================

import React, { useState } from 'react';
import studentService from '../../../services/studentService';
import css from './ReflectionPrompt.module.css';

/**
 * Componente di riflessione che appare dopo ogni attivita completata.
 * Celebra la confusione e il "non sapere" come parte del processo.
 *
 * @param {string} toolName - Nome dello strumento (detective, poe, reverse, review)
 * @param {string} activityId - ID dell'attivita completata
 * @param {function} onSave - Callback con { type, text } quando lo studente salva
 * @param {function} onDismiss - Callback quando chiude senza scrivere
 */
export default function ReflectionPrompt({ toolName, activityId, onSave, onDismiss }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('reflection'); // reflection | wonder | confused
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    const entry = {
      type: mode,
      text: text.trim(),
      toolName,
      activityId,
      timestamp: new Date().toISOString()
    };
    // Persistenza REALE in localStorage via studentService
    studentService.saveReflection(entry);
    // Callback al parent (logSession, etc.)
    onSave?.(entry);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className={`elab-tool__card ${css.cardSaved}`}>
        <p className={css.savedMessage}>
          {mode === 'confused' ? 'La confusione è il primo passo della scoperta!' : 'Riflessione salvata nel tuo diario!'}
        </p>
      </div>
    );
  }

  const prompts = {
    reflection: {
      emoji: '',
      title: 'Cosa hai scoperto?',
      placeholder: 'Scrivi qualcosa che hai capito, anche piccola...',
      buttonText: 'Salva nel diario'
    },
    wonder: {
      emoji: '',
      title: 'Scrivi una meraviglia',
      placeholder: 'Qualcosa che ti ha sorpreso o incuriosito...',
      buttonText: 'Salva la meraviglia'
    },
    confused: {
      emoji: '',
      title: 'Non ho capito...',
      placeholder: 'Cosa ti confonde? Le domande migliori nascono dalla confusione!',
      buttonText: 'Salva la domanda'
    }
  };

  const current = prompts[mode];

  return (
    <div className={`elab-tool__card ${css.card}`}>
      {/* Mode selector */}
      <div className={css.modeSelector}>
        {Object.entries(prompts).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`${css.modeBtn} ${mode === key ? css.modeBtnActive : ''}`}
          >
            {val.title}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <h4 className={css.promptTitle}>
        {current.title}
      </h4>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={current.placeholder}
        className={`elab-tool__textarea ${css.textarea}`}
      />

      <div className={css.actions}>
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className={`elab-tool__btn elab-tool__btn--primary ${css.saveBtn}`}
        >
          {current.buttonText}
        </button>
        <button
          onClick={onDismiss}
          className={`elab-tool__btn elab-tool__btn--secondary ${css.skipBtn}`}
        >
          Salta
        </button>
      </div>

      {mode === 'confused' && (
        <p className={css.socratesQuote}>
          "So di non sapere" — Socrate. Le domande migliori non hanno risposta facile.
        </p>
      )}
    </div>
  );
}
