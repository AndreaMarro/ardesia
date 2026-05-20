/**
 * Iter 97 atom C — UnlimCompileHelper scaffold per Andrea iter 97 PM screenshot
 * feedback verbatim: "qui sarebbe bello unlim animato che ti spiega cosa fare in
 * base alle domande" (right panel below ScratchCompileBar currently empty area).
 *
 * V1 scaffold: static mascot + plurale speech bubble + 3 quick question buttons.
 * V2 iter 98+: full animated mascot with reactions to compile state (idle →
 * compiling → success → error animations).
 * V3 iter 99+: wire to unlimScreenAgent (iter 93 atom 34 — currently NO-GO 5 HIGH
 * per code-reviewer verdict; refactor needed canonical elabArduinoAst integration).
 *
 * Props:
 *   compileStatus: 'idle' | 'compiling' | 'success' | 'error' (matches
 *     ScratchCompileBar canonical state). Adapts message + future animation.
 *   onAskQuestion: (question: string) => void — callback when quick question
 *     clicked. Wires to UNLIM chat (HomePage UNLIM panel) in iter 98+ atom.
 *
 * © Andrea Marro — iter 97 atom C — 2026-05-19
 */
import React from 'react';
import { RobotIcon } from '../common/ElabIcons';
import css from './UnlimCompileHelper.module.css';

const QUICK_QUESTIONS = [
  { id: 'whatis', label: 'Che cosa è una compilazione?' },
  { id: 'howto', label: 'Come carico sul Nano R4?' },
  { id: 'error', label: 'Come leggo gli errori?' },
];

function getStatusMessage(compileStatus) {
  switch (compileStatus) {
    case 'compiling':
      return 'Ragazzi, sto preparando il programma per il vostro Nano R4. Aspettate un attimo!';
    case 'success':
      return 'Compilazione riuscita ragazzi! Ora potete caricare il programma sul vostro kit ELAB.';
    case 'error':
      return 'C\'è un errore nel programma, ragazzi. Aprite la sezione errori per capire cosa correggere.';
    default:
      return 'Ragazzi, scrivete il vostro programma a sinistra. Quando siete pronti, premete Compila qui sopra.';
  }
}

export default function UnlimCompileHelper({
  compileStatus = 'idle',
  onAskQuestion,
}) {
  const message = getStatusMessage(compileStatus);
  const handleQuestion = (q) => {
    if (typeof onAskQuestion === 'function') onAskQuestion(q);
  };

  return (
    <section
      className={css.helper}
      aria-label="Aiuto UNLIM compilazione"
      data-status={compileStatus}
    >
      <div className={css.mascotRow}>
        <span className={css.mascot} aria-hidden="true">
          <RobotIcon size={48} color="#1E4D8C" />
        </span>
        <div className={css.speech} role="status" aria-live="polite">
          {message}
        </div>
      </div>

      <div className={css.questionsLabel} aria-hidden="true">Domande veloci</div>
      <ul className={css.questions} role="list">
        {QUICK_QUESTIONS.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className={css.questionBtn}
              onClick={() => handleQuestion(q.label)}
              aria-label={`Chiedi: ${q.label}`}
            >
              {q.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
