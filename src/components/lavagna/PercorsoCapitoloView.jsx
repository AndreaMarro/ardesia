/**
 * PercorsoCapitoloView — Sprint Q2.D
 * Andrea Marro 2026-04-25
 *
 * Orchestratore Percorso Capitolo. Layout split 70/25:
 *  - main role 70%: display centrale per CLASSE
 *    Teoria narrative + esperimenti chain con transizioni + citazioni inline
 *  - aside role complementary 25%: DocenteSidebar colpo d'occhio
 *
 * PRINCIPIO ZERO:
 *  - Display centrale: testo grande (24px+), letto ad alta voce alla classe
 *  - Sidebar docente: linguaggio neutro nominale, non comandi
 *  - Citazioni Vol.N pag.M cliccabili (apre VolumeViewer)
 *  - Transizioni narrative tra esperimenti dello stesso Cap
 *
 * Props:
 *   capitolo: Capitolo | null
 *   onClose?: () => void
 *   onCitationClick?: ({ volume, page }) => void
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import VolumeCitation from '../common/VolumeCitation.jsx';
import DocenteSidebar from './DocenteSidebar.jsx';
import css from './PercorsoCapitoloView.module.css';
import { getLessonPath } from '../../data/lesson-paths';
// iter 45 Andrea video2 06/05/2026 + ADR-019 Sense 1.5: pulsante "Lezione personalizzata"
// chiama unlim-chat con context onniscenza aggregator (L1 RAG + L2 Wiki + L4 Sessione +
// L5 Lesson + L6 Chat history, già LIVE iter 24 onniscenza-bridge.ts) + Mistral routing
// (LLM_ROUTING_WEIGHTS env attivo prod). Genera proposta adattata classe + storia.
import { sendChat } from '../../services/api.js';

const INCREMENTAL_LABEL = {
  add_component: 'aggiunta componente',
  remove_component: 'rimozione componente',
  modify_component: 'modifica componente',
  from_scratch: 'circuito da zero',
};

function findTransitionFromPrev(capitolo, espIndex) {
  if (!capitolo?.narrative_flow?.transitions || espIndex === 0) return null;
  const prevId = capitolo.esperimenti[espIndex - 1]?.id;
  const currId = capitolo.esperimenti[espIndex]?.id;
  return capitolo.narrative_flow.transitions.find(
    (t) => t.between?.[0] === prevId && t.between?.[1] === currId
  ) ?? null;
}

function findTransitionToNext(capitolo, espIndex) {
  if (!capitolo?.narrative_flow?.transitions) return null;
  const currId = capitolo.esperimenti[espIndex]?.id;
  const nextId = capitolo.esperimenti[espIndex + 1]?.id;
  if (!currId || !nextId) return null;
  return capitolo.narrative_flow.transitions.find(
    (t) => t.between?.[0] === currId && t.between?.[1] === nextId
  ) ?? null;
}

function getNextExperimentForCard(esp) {
  return esp?.next_experiment || getLessonPath(esp?.id)?.next_experiment || null;
}

export default function PercorsoCapitoloView({ capitolo, onClose, onCitationClick }) {
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  // iter 45 Andrea video2 + ADR-019 Sense 1.5 — Lezione personalizzata state
  const [lezioneProposta, setLezioneProposta] = useState(null);
  const [lezioneLoading, setLezioneLoading] = useState(false);
  const [lezioneError, setLezioneError] = useState(null);

  // iter 45 review fix T5/E1 (architect+code-reviewer): AbortController + unmount
  // guard. Senza, race condition cambio capitolo durante fetch + setState dopo
  // unmount = warning React + memory leak.
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      try { abortControllerRef.current?.abort(); } catch { /* noop */ }
    };
  }, []);

  // Builds Mistral prompt for "Lezione personalizzata" via unlim-chat onniscenza-bridge.
  // Backend (ADR-023 §5 + onniscenza-bridge iter 24 LIVE) aggregates L1 RAG + L4 Sessione
  // + L5 Lesson + L6 Chat history when class_id + session_id presenti context.
  const generaLezione = useCallback(async () => {
    if (!capitolo || lezioneLoading) return;
    // Abort any in-flight request before starting new one
    try { abortControllerRef.current?.abort(); } catch { /* noop */ }
    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;
    setLezioneLoading(true);
    setLezioneError(null);
    setLezioneProposta(null);
    try {
      const firstExp = capitolo.esperimenti?.[0];
      const espIds = (capitolo.esperimenti || []).map(e => e.id).join(', ');
      const prompt = [
        `Ragazzi, prepara una proposta di lezione personalizzata per il Capitolo ${capitolo.capitolo ?? capitolo.cap ?? '?'} "${capitolo.titolo}" (Vol.${capitolo.volume}).`,
        `Esperimenti del capitolo: ${espIds}.`,
        `Considerando le sessioni precedenti della classe e la storia chat, suggerisci:`,
        `1. Apertura narrativa breve per la classe (cita Vol/pag verbatim del libro).`,
        `2. Ordine consigliato esperimenti adattato al livello rilevato.`,
        `3. Una analogia chiave da usare durante la spiegazione.`,
        `4. Un punto di verifica per capire se la classe ha capito.`,
        `Mantieni linguaggio plurale "Ragazzi", mai imperativo verso il docente, registro narratore italiano scuola pubblica.`,
      ].join('\n');
      const reply = await sendChat(prompt, [], {
        experimentId: firstExp?.id || null,
        experimentContext: `[CAPITOLO ATTIVO] Vol.${capitolo.volume} Cap.${capitolo.capitolo ?? '?'} — ${capitolo.titolo}`,
        signal: ctrl.signal,
      });
      // Guard: skip setState se aborted o unmounted
      if (ctrl.signal.aborted || !isMountedRef.current) return;
      const text = typeof reply === 'string'
        ? reply
        : (reply?.response || reply?.content || reply?.message || '');
      if (!text) {
        throw new Error(reply?.error || 'Risposta UNLIM vuota');
      }
      setLezioneProposta(text);
    } catch (err) {
      if (ctrl.signal.aborted || !isMountedRef.current) return;
      // Defensive: AbortError NON deve propagare error UI
      if (err?.name === 'AbortError') return;
      setLezioneError(err?.message || 'Errore generazione lezione');
    } finally {
      if (isMountedRef.current) setLezioneLoading(false);
    }
  }, [capitolo, lezioneLoading]);

  if (!capitolo) {
    return (
      <div className={css.fallback}>
        <p>Nessun capitolo selezionato. Caricamento in corso o selezionare Capitolo.</p>
      </div>
    );
  }

  const activeExp = capitolo.esperimenti?.[activeExpIndex] ?? null;
  const activePhase = activeExp?.phases?.[activePhaseIndex] ?? null;
  const docenteSidebarData = activePhase?.docente_sidebar ?? null;

  return (
    <div className={css.container}>
      <main className={css.mainContent} role="main" aria-label={`Percorso ${capitolo.titolo}`}>
        <header className={css.capHeader}>
          <div className={css.capMeta}>
            <span className={css.volBadge}>{`Vol.${capitolo.volume}`}</span>
            {capitolo.pageStart && capitolo.pageEnd && (
              <span className={css.pageRange}>{`pag. ${capitolo.pageStart}-${capitolo.pageEnd}`}</span>
            )}
            <span className={css.typeChip}>{capitolo.type}</span>
          </div>
          <h1 className={css.capTitle}>{capitolo.titolo}</h1>
          {onClose && (
            <button type="button" className={css.closeBtn} onClick={onClose} aria-label="Chiudi percorso">
              ×
            </button>
          )}
        </header>

        {/* iter 45 Andrea video2 + ADR-019 Sense 1.5 — Lezione personalizzata.
             Click → sendChat con context capitolo → unlim-chat (Mistral routing 70/20/10
             + onniscenza-bridge iter 24 LIVE) genera proposta adattata classe + storia. */}
        <section className={css.lezioneBox} aria-label="Lezione personalizzata">
          <button
            type="button"
            onClick={generaLezione}
            disabled={lezioneLoading}
            data-testid="btn-lezione-personalizzata"
            style={{
              minHeight: 56, padding: '12px 24px',
              background: lezioneLoading ? 'var(--elab-hex-737373)' : 'var(--elab-lime, #4A7A25)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700,
              cursor: lezioneLoading ? 'wait' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              boxShadow: '0 4px 12px rgba(74,122,37,0.3)',
            }}
          >
            <span aria-hidden="true">🎓</span>
            {lezioneLoading ? 'Sto preparando la lezione…' : 'Lezione personalizzata'}
          </button>
          {lezioneError && (
            <p style={{ marginTop: 12, color: 'var(--elab-red, #E54B3D)', fontFamily: "'Open Sans', sans-serif" }}>
              Errore: {lezioneError}. Riprovate tra un attimo.
            </p>
          )}
          {lezioneProposta && (
            <article
              data-testid="lezione-proposta"
              style={{
                marginTop: 16, padding: 20,
                background: 'rgba(74,122,37,0.05)',
                border: '2px solid var(--elab-lime, #4A7A25)',
                borderRadius: 12,
                fontFamily: "'Open Sans', sans-serif",
                fontSize: 17, lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                color: 'var(--elab-navy, #1E4D8C)',
              }}
            >
              <header style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--elab-lime)', marginBottom: 10, letterSpacing: '0.4px' }}>
                Proposta UNLIM (adattata alla classe)
              </header>
              {lezioneProposta}
            </article>
          )}
        </section>

        {capitolo.theory?.testo_classe && (
          <section className={css.theorySection} aria-label="Teoria">
            <p className={css.theoryText}>{capitolo.theory.testo_classe}</p>
            {capitolo.theory.citazioni_volume?.length > 0 && (
              <div className={css.citationsRow}>
                {capitolo.theory.citazioni_volume.map((cit, i) => (
                  <VolumeCitation
                    key={i}
                    volume={capitolo.volume}
                    page={cit.page}
                    onClick={onCitationClick}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {capitolo.narrative_flow?.intro_text && (
          <section className={css.introSection}>
            <p className={css.introText}>{capitolo.narrative_flow.intro_text}</p>
          </section>
        )}

        {capitolo.esperimenti?.map((esp, idx) => {
          const transitionFromPrev = findTransitionFromPrev(capitolo, idx);
          const transitionToNext = findTransitionToNext(capitolo, idx);
          const nextExperiment = getNextExperimentForCard(esp);
          const incrementalHint =
            esp.build_circuit?.mode === 'incremental_from_prev'
              ? `Costruzione incremental partendo dal circuito precedente (${INCREMENTAL_LABEL[transitionFromPrev?.incremental_mode] ?? 'modifica'})`
              : null;

          return (
            <React.Fragment key={esp.id}>
              <article
                className={`${css.experimentSection} ${idx === activeExpIndex ? css.activeExp : ''}`}
                onClick={() => { setActiveExpIndex(idx); setActivePhaseIndex(0); }}
                aria-label={`Esperimento ${esp.num}: ${esp.title_classe}`}
              >

              <header className={css.expHeader}>
                <div className={css.expNum}>Esperimento {esp.num}</div>
                <h2 className={css.expTitle}>{esp.title_classe}</h2>
                {esp.volume_ref?.page_start && (
                  <VolumeCitation
                    volume={capitolo.volume}
                    page={esp.volume_ref.page_start}
                    onClick={onCitationClick}
                  />
                )}
              </header>

              {esp.components_needed?.length > 0 && (
                <div className={css.componentsBlock}>
                  <div className={css.blockLabel}>Componenti</div>
                  <ul className={css.componentsList}>
                    {esp.components_needed.map((c, i) => (
                      <li key={i} className={css.componentItem}>
                        {c.name} {c.quantity > 1 ? `× ${c.quantity}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {incrementalHint && (
                <div className={css.incrementalHint}>{incrementalHint}</div>
              )}

              {esp.phases?.length > 0 && (
                <div className={css.phasesBlock}>
                  <div className={css.blockLabel}>Fasi</div>
                  <ol className={css.phasesList}>
                    {esp.phases.map((ph, phi) => (
                      <li
                        key={phi}
                        className={`${css.phaseItem} ${phi === activePhaseIndex && idx === activeExpIndex ? css.activePhase : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveExpIndex(idx); setActivePhaseIndex(phi); }}
                      >
                        <span className={css.phaseName}>{ph.name}</span>
                        {ph.classe_display?.text_hook && (
                          <p className={css.phaseHook}>{ph.classe_display.text_hook}</p>
                        )}
                        {ph.classe_display?.observation_prompt && (
                          <p className={css.phaseObservation}>{ph.classe_display.observation_prompt}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              </article>
              {idx < (capitolo.esperimenti?.length ?? 0) - 1 && (transitionToNext || nextExperiment) && (
                <section
                  className={css.nextTransition}
                  data-testid={`percorso-next-transition-${esp.id}`}
                  aria-label={`Passaggio al prossimo esperimento da ${esp.title_classe}`}
                >
                  <span className={css.transitionLabel}>Prossimo passaggio</span>
                  {transitionToNext?.text_classe && (
                    <p className={css.transitionText}>{transitionToNext.text_classe}</p>
                  )}
                  {nextExperiment && (
                    <div className={css.nextExperimentPreview}>
                      <strong>Prossimo:</strong> {nextExperiment.title || nextExperiment.id}
                      {nextExperiment.preview && (
                        <p className={css.nextPreviewText}>{nextExperiment.preview}</p>
                      )}
                    </div>
                  )}
                </section>
              )}
            </React.Fragment>
          );
        })}

        {capitolo.narrative_flow?.closing_text && (
          <section className={css.closingSection}>
            <p className={css.closingText}>{capitolo.narrative_flow.closing_text}</p>
          </section>
        )}
      </main>

      <DocenteSidebar
        docenteSidebar={docenteSidebarData}
        currentPhase={activePhase?.name ?? null}
        currentExperiment={activeExp ? { id: activeExp.id, num: activeExp.num, title_docente: activeExp.title_docente } : null}
      />
    </div>
  );
}
