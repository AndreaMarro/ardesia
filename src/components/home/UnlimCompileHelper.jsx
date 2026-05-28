/**
 * UnlimCompileHelper — mini banner mascot + 3 quick-question forward.
 *
 * Wave 2 X.3b Impl-E refactor (2026-05-25): the full free-text chat input
 * + submit form + #lavagna fallback link have been EXTRACTED into the new
 * UnlimChatPanel.jsx floating component. This file is now a *mini banner
 * only* — kept lean so it can sit beside ScratchCompileBar without dominating
 * the right column.
 *
 * Export contract preserved (iter 104 C3 callers HomeCompileEntry.jsx +
 * LavagnaShell.jsx unchanged):
 *   props.compileStatus: 'idle' | 'compiling' | 'success' | 'verified-legacy' | 'error'
 *   props.onAskQuestion: (question: string) => void — required to enable buttons
 *   props.editorMode: 'blocks' | 'code'
 *   props.sketchCode: string
 *   props.blockCount: number
 *
 * Removed in this refactor (moved into UnlimChatPanel):
 *   - Free-text input + chatForm + chatSubmit + draft useState
 *   - #lavagna anchor "Chat completa su Lavagna" link
 *
 * Retained:
 *   - Mascotte (logo-senza-sfondo.png — iter 104 C4-fix asset)
 *   - Speech bubble status message (5 compileStatus branches, iter 104 C3 copy)
 *   - Context chip ("Blocchi · N blocchi · M righe · status")
 *   - 3 quick-question buttons forwarding `onAskQuestion(label)` to parent
 *
 * © Andrea Marro — Wave 2 X.3b Impl-E refactor — 2026-05-25
 * Original iter 104 C3 © Andrea Marro — 2026-05-24
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import css from './UnlimCompileHelper.module.css';

const MASCOT_SRC = '/assets/mascot/logo-senza-sfondo.png';

const QUICK_QUESTIONS = [
  { id: 'read', label: 'Leggi il programma' },
  { id: 'fix', label: 'Controlla errori' },
  { id: 'next', label: 'Consiglio rapido' },
];

function getStatusMessage(compileStatus) {
  switch (compileStatus) {
    case 'compiling':
      return 'Sto controllando il codice per Nano R4.';
    case 'success':
      return 'Compilazione OK. Potete caricare sulla Nano R4.';
    case 'verified-legacy':
      return 'Codice verificato, ma non ancora per Nano R4.';
    case 'error':
      return 'C\'e un errore nel codice. Apri la chat su Lavagna per i dettagli.';
    default:
      return 'Sono collegato a blocchi, codice e compilazione.';
  }
}

function buildContext({ editorMode, compileStatus, blockCount, sketchCode }) {
  const mode = editorMode === 'code' ? 'C++' : 'Blocchi';
  const lines = String(sketchCode || '').split('\n').filter(Boolean).length;
  return `${mode} · ${blockCount || 0} blocchi · ${lines} righe · ${compileStatus || 'idle'}`;
}

export default function UnlimCompileHelper({
  compileStatus = 'idle',
  onAskQuestion,
  editorMode = 'blocks',
  sketchCode = '',
  blockCount = 0,
}) {
  const { t } = useTranslation();
  const message = getStatusMessage(compileStatus);
  const context = buildContext({ editorMode, compileStatus, blockCount, sketchCode });
  const hasHandler = typeof onAskQuestion === 'function';

  const handleQuestion = (q) => {
    if (!hasHandler) return;
    onAskQuestion(q);
  };

  return (
    <section
      className={css.helper}
      aria-label={t('unlim_compile_helper.aria')}
      data-status={compileStatus}
    >
      <div className={css.mascotRow}>
        <span className={css.mascot} aria-hidden="true">
          <img src={MASCOT_SRC} alt="" className={css.mascotImg} draggable="false" />
        </span>
        <div className={css.speech} role="status" aria-live="polite">
          {message}
        </div>
      </div>

      <div className={css.contextChip}>{context}</div>

      <ul className={css.questions} role="list">
        {QUICK_QUESTIONS.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              className={css.questionBtn}
              onClick={() => handleQuestion(q.label)}
              aria-label={`Chiedi a UNLIM: ${q.label}`}
              disabled={!hasHandler}
            >
              {q.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
