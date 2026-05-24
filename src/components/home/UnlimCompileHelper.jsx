/**
 * UnlimCompileHelper — right-panel mascot + quick UNLIM forward
 *
 * iter 104 C3 REWRITE post Codex audit (Andrea verbatim "salvo Codex parziale"):
 *   Codex V1 conteneva `answerQuestion()` HARDCODED decision-tree con 3 regex
 *   pre-canned + local `useState messages` chatLog → FAKE chat che simulava
 *   UNLIM senza backend. Violava CLAUDE.md §12 "MAI dati finti o demo".
 *
 * Questa versione:
 *   - Rimuove `answerQuestion()` finto + local chatLog + chatForm complesso
 *   - Quick buttons + free text input → forward `onAskQuestion(text)` callback
 *     al parent (HomeCompileEntry), che instrada a Lavagna chat reale via
 *     hash navigation con `seedMessage` query param.
 *   - Mantiene mascotte + speech bubble status real-time + context chip.
 *   - Footer banner onesto: "La chat completa con UNLIM e sulla Lavagna".
 *
 * Quando il parent NON passa onAskQuestion, i bottoni mostrano solo affordance
 * visiva e l'input scivola in stato pending (niente fake reply locale).
 *
 * Future C3b iter (out of scope qui): mount UnlimAdapter standalone in
 * HomeCompileEntry per chat in-page senza navigare via Lavagna (richiede
 * AuthContext/SessionRecorder provider wire).
 *
 * Props:
 *   compileStatus: 'idle' | 'compiling' | 'success' | 'verified-legacy' | 'error'
 *   onAskQuestion: (question: string) => void — required per attivare bottoni
 *   editorMode: 'blocks' | 'code'
 *   sketchCode: string — codice corrente (per context chip righe count)
 *   blockCount: number — blocchi correnti (per context chip)
 *
 * © Andrea Marro — iter 104 C3 — 2026-05-24
 */
import React, { useState } from 'react';
import css from './UnlimCompileHelper.module.css';

// Mascotte ufficiale ELAB (Vera) PNG servita da public/ — iter-102 mandate.
const MASCOT_SRC = '/assets/mascot/elab-mascot-vera.png';

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
  const message = getStatusMessage(compileStatus);
  const context = buildContext({ editorMode, compileStatus, blockCount, sketchCode });
  const [draft, setDraft] = useState('');
  const hasHandler = typeof onAskQuestion === 'function';

  const handleQuestion = (q) => {
    if (!hasHandler) return;
    onAskQuestion(q);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || !hasHandler) return;
    setDraft('');
    handleQuestion(question);
  };

  return (
    <section
      className={css.helper}
      aria-label="Aiuto UNLIM compilazione"
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

      <form className={css.chatForm} onSubmit={handleSubmit}>
        <input
          className={css.chatInput}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={hasHandler ? 'Chiedi a UNLIM' : 'Apri la Lavagna per chattare'}
          aria-label="Scrivi a UNLIM"
          disabled={!hasHandler}
        />
        <button
          type="submit"
          className={css.chatSubmit}
          aria-label="Invia a UNLIM"
          disabled={!hasHandler}
        >
          →
        </button>
      </form>

      <a className={css.openLavagnaLink} href="#lavagna" aria-label="Apri la Lavagna per chat UNLIM completa">
        Chat completa su Lavagna
      </a>
    </section>
  );
}
