/**
 * UnlimAdapter — Wraps ChatOverlay in FloatingWindow for the Lavagna shell.
 * Manages chat state via useGalileoChat hook + voice via voiceService.
 * ZERO modification to ChatOverlay or any UNLIM file.
 * (legacy file: was GalileoAdapter — renamed iter-66 mandate #14)
 * (c) Andrea Marro — 01/04/2026
 */

import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import FloatingWindow from './FloatingWindow';
import ChatOverlay from '../tutor/ChatOverlay';
import useGalileoChat from './useGalileoChat';
import useUnlimNudge from '../../hooks/useUnlimNudge';
import UnlimNudgeOverlay from './UnlimNudgeOverlay';
const LessonPathPanel = lazy(() => import('../simulator/panels/LessonPathPanel'));
import { getLessonPath } from '../../data/lesson-paths';
import { getVolumeRef } from '../../data/volume-references';
import { getExperimentGroupContext } from '../../data/lesson-groups';
import unlimMemory from '../../services/unlimMemory';
const ExperimentGuide = lazy(() => import('../simulator/panels/ExperimentGuide'));
// Voice service loaded on demand (saves ~1.5MB from initial bundle)
let _voice = null;
async function getVoice() {
  if (!_voice) _voice = await import('../../services/voiceService');
  return _voice;
}
import { sanitizeOutput } from '../../utils/contentFilter';
import logger from '../../utils/logger';
import css from './UnlimAdapter.module.css';

function formatPercorsoExtra(value) {
  const items = Array.isArray(value) ? value : [value];
  return items
    .map((item) => {
      if (item == null) return '';
      if (typeof item === 'string' || typeof item === 'number') return String(item);
      if (typeof item !== 'object') return String(item);
      const ordered = [
        item.text,
        item.error,
        item.mistake,
        item.title,
        item.fix,
        item.correction,
        item.explanation,
        item.why,
        item.analogy,
      ].filter(Boolean);
      if (ordered.length > 0) return ordered.map(String).join(' — ');
      return Object.entries(item)
        .filter(([, v]) => v != null && typeof v !== 'object')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' — ');
    })
    .filter(Boolean)
    .join(' • ');
}

/** Embedded Percorso — 5 phases one at a time (PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI). Principio Zero. */
function EmbeddedPercorso({ experiment, onAskUNLIM }) {
  const path = getLessonPath(experiment?.id);
  const volRef = getVolumeRef(experiment?.id);
  const [currentPhase, setCurrentPhase] = React.useState(0);
  const [sessionContext, setSessionContext] = React.useState(null);

  // Load session context from unlimMemory (adaptive)
  React.useEffect(() => {
    (async () => {
      try {
        const classId = localStorage.getItem('elab_class_key') || '_self';
        const progress = await unlimMemory.getProgress(classId);
        const lastLesson = await unlimMemory.getLastLesson(classId);
        const alreadyDone = progress.completedExperiments.includes(experiment?.id);
        setSessionContext({ progress, lastLesson, alreadyDone });
      } catch { setSessionContext(null); }
    })();
  }, [experiment?.id]);

  if (!path?.phases?.length) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#737373', fontFamily: "'Open Sans', sans-serif" }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--elab-navy)', marginBottom: 8 }}>Percorso non disponibile</p>
        <p style={{ fontSize: 15 }}>Questo esperimento non ha un percorso lezione dettagliato.</p>
        <button onClick={() => onAskUNLIM?.('Prepara una lezione per questo esperimento')} style={{ marginTop: 16, padding: '12px 20px', border: '2px solid var(--elab-lime)', borderRadius: 12, background: 'rgba(74,122,37,0.08)', color: 'var(--elab-lime)', fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Chiedi a UNLIM di preparare la lezione
        </button>
      </div>
    );
  }

  const phases = path.phases;
  const phase = phases[currentPhase];
  const totalPages = phases.length;
  const isFirst = currentPhase === 0;
  const isLast = currentPhase === totalPages - 1;
  const componentsNeeded = Array.isArray(path.components_needed) ? path.components_needed : [];

  const PHASE_COLORS = {
    PREPARA: { bg: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '#93c5fd', accent: 'var(--elab-navy)' },
    MOSTRA: { bg: 'linear-gradient(135deg, #fef3c7 0%, #fff7ed 100%)', border: '#fcd34d', accent: 'var(--elab-orange)' },
    CHIEDI: { bg: 'linear-gradient(135deg, #fce7f3 0%, #fef2f2 100%)', border: '#f9a8d4', accent: 'var(--elab-red)' },
    OSSERVA: { bg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '#86efac', accent: 'var(--elab-lime)' },
    CONCLUDI: { bg: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)', border: '#c4b5fd', accent: '#6d28d9' }, // palette
  };
  const colors = PHASE_COLORS[phase.name] || PHASE_COLORS.PREPARA;

  const PS = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' },
    content: { flex: 1, overflow: 'auto', padding: '8px 4px' },
    card: {
      background: colors.bg, borderRadius: 18, padding: '22px 18px',
      border: `1px solid ${colors.border}40`,
      boxShadow: `0 4px 20px ${colors.accent}10`,
    },
    phaseLabel: {
      fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600,
      color: colors.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    phaseName: {
      fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700,
      color: colors.accent, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
    },
    phaseIcon: { fontSize: 28 },
    message: { fontSize: 17, lineHeight: 1.7, color: '#1a1a2e', fontFamily: "'Open Sans', sans-serif", marginBottom: 14 }, // palette
    tip: {
      background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', marginBottom: 12,
      border: '1px dashed ' + colors.accent + '30', fontSize: 15, lineHeight: 1.6, color: '#555',
    },
    tipLabel: { fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600, color: colors.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 },
    extra: { fontSize: 15, lineHeight: 1.6, color: '#444', marginTop: 10, fontStyle: 'italic' },
    componentGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0 14px' },
    componentChip: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.78)',
      border: `1px solid ${colors.accent}24`, color: 'var(--elab-navy)',
      fontFamily: "'Open Sans', sans-serif", fontSize: 13, fontWeight: 700,
    },
    nav: { display: 'flex', gap: 10, padding: '10px 0 4px', flexShrink: 0 },
    navBtn: (primary) => ({
      flex: 1, padding: '14px 16px', border: primary ? 'none' : `2px solid ${colors.accent}40`, borderRadius: 14,
      background: primary ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}cc 100%)` : `${colors.accent}08`,
      color: primary ? '#fff' : colors.accent,
      fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, cursor: 'pointer',
      letterSpacing: '1px', textTransform: 'uppercase',
      boxShadow: primary ? `0 4px 16px ${colors.accent}30` : 'none',
    }),
    progress: { display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0' },
    dot: (active) => ({
      width: active ? 28 : 10, height: 10, borderRadius: 5,
      background: active ? `linear-gradient(90deg, ${colors.accent}, ${colors.accent}99)` : '#d1d5db', // palette
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  };

  // Get extra content for the current phase
  const extras = [];
  if (phase.provocative_question) extras.push({ label: 'Domanda per la classe', text: phase.provocative_question });
  if (phase.common_mistakes?.length) extras.push({ label: 'Errori comuni', text: formatPercorsoExtra(phase.common_mistakes) });
  if (phase.observation_prompt) extras.push({ label: 'Cosa osservare', text: phase.observation_prompt });
  if (phase.analogies?.length) extras.push({ label: 'Analogia', text: formatPercorsoExtra(phase.analogies) });
  if (phase.summary_for_class) extras.push({ label: 'Riepilogo', text: phase.summary_for_class });
  if (phase.concepts_learned?.length) extras.push({ label: 'Concetti', text: formatPercorsoExtra(phase.concepts_learned) });
  if (phase.next_preview) extras.push({ label: 'Prossima volta', text: phase.next_preview });

  return (
    <div style={PS.container}>
      <div style={PS.content}>
        <div style={PS.card}>
          <div style={PS.phaseLabel}>
            <span>Fase {currentPhase + 1} di {totalPages}</span>
            <span style={{ flex: 1, height: 2, background: `${colors.accent}20`, borderRadius: 1 }} />
            <span>{phase.duration_minutes} min</span>
          </div>
          <div style={PS.phaseName}>
            {phase.icon && <span style={PS.phaseIcon}>{phase.icon}</span>}
            <span>{phase.name}</span>
          </div>
          {/* Book reference badge — only on first phase */}
          {currentPhase === 0 && volRef && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '4px 10px', background: 'rgba(30,77,140,0.06)', borderRadius: 8, border: '1px solid rgba(30,77,140,0.15)' }}>
              <span style={{ fontSize: 13 }}>📖</span>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 600, color: 'var(--elab-navy)', letterSpacing: '0.5px' }}>
                Vol. {volRef.volume}, pag. {volRef.bookPage}
              </span>
            </div>
          )}
          {/* Adaptive context banner — only on first phase */}
          {currentPhase === 0 && sessionContext && (
            <div style={{ ...PS.tip, background: sessionContext.alreadyDone ? 'rgba(74,122,37,0.08)' : 'rgba(30,77,140,0.05)', borderColor: sessionContext.alreadyDone ? 'var(--elab-lime)30' : 'var(--elab-navy)20', marginBottom: 14 }}>
              <div style={{ ...PS.tipLabel, color: sessionContext.alreadyDone ? 'var(--elab-lime)' : 'var(--elab-navy)' }}>
                {sessionContext.alreadyDone ? 'Ripasso' : 'Contesto classe'}
              </div>
              {sessionContext.alreadyDone
                ? 'Questo esperimento è già stato fatto in una sessione precedente. Puoi usare il Percorso per un ripasso veloce o saltare alle fasi che servono.'
                : sessionContext.progress?.completedExperiments?.length > 0
                  ? `La classe ha già completato ${sessionContext.progress.completedExperiments.length} esperimenti. ${sessionContext.lastLesson?.experimentId ? `Ultimo: ${sessionContext.lastLesson.experimentId}` : ''}`
                  : 'Prima sessione con questa classe. Il Percorso parte dall\'inizio.'
              }
            </div>
          )}
          {currentPhase === 0 && componentsNeeded.length > 0 && (
            <div style={PS.tip} data-testid="percorso-components-needed">
              <div style={PS.tipLabel}>Componenti</div>
              <div style={PS.componentGrid}>
                {componentsNeeded.map((component, index) => (
                  <span key={`${component.name || index}-${index}`} style={PS.componentChip}>
                    {component.icon && <span aria-hidden="true">{component.icon}</span>}
                    <span>{component.name}</span>
                    {Number(component.quantity) > 1 && <span>× {component.quantity}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
          {currentPhase === 0 && !componentsNeeded.length && phase.components_list && (
            <div style={PS.tip} data-testid="percorso-components-needed">
              <div style={PS.tipLabel}>Componenti</div>
              {phase.components_list}
            </div>
          )}
          <div style={PS.message}>{phase.teacher_message}</div>
          {phase.teacher_tip && (
            <div style={PS.tip}>
              <div style={PS.tipLabel}>Suggerimento</div>
              {phase.teacher_tip}
            </div>
          )}
          {extras.map((ex, i) => (
            <div key={i} style={PS.tip}>
              <div style={PS.tipLabel}>{ex.label}</div>
              {ex.text}
            </div>
          ))}
        </div>
      </div>
      <div style={PS.progress}>
        {phases.map((_, i) => <div key={i} style={PS.dot(i === currentPhase)} />)}
      </div>
      <div style={PS.nav}>
        {!isFirst && <button style={PS.navBtn(false)} onClick={() => setCurrentPhase(p => p - 1)}>Indietro</button>}
        <button
          style={{ ...PS.navBtn(false), flex: 'none', width: 48, padding: '14px 0', fontSize: 18, border: `2px solid ${colors.accent}30` }}
          onClick={() => onAskUNLIM?.(`Sono nella fase ${phase.name} dell'esperimento "${path.title}". ${phase.teacher_message} Dammi un consiglio o un'idea per questa fase.`)}
          title="Chiedi consiglio a UNLIM per questa fase"
          aria-label="Chiedi a UNLIM"
        >?</button>
        {!isLast && <button style={PS.navBtn(true)} onClick={() => setCurrentPhase(p => p + 1)}>Avanti</button>}
        {isLast && <button style={PS.navBtn(true)} onClick={() => onAskUNLIM?.(`Riepilogo della lezione "${path.title}". Sintetizza cosa abbiamo costruito, cosa osservare, errori comuni e riferimento Vol./pag.`)}>Riepilogo</button>}
      </div>
    </div>
  );
}

export const __test__ = {
  formatPercorsoExtra,
};

/** Embedded step-by-step guide — ONE step at a time, Avanti/Indietro buttons. Principio Zero. */
function EmbeddedGuide({ experiment, onAskUNLIM }) {
  const steps = experiment?.steps || [];
  const desc = experiment?.desc || '';
  const observe = experiment?.observe || experiment?.note || '';
  const concept = experiment?.concept || '';
  const solutionHint = experiment?.solutionHint || '';
  const splitSuggestion = experiment?.splitSuggestion || '';
  const volRef = getVolumeRef(experiment?.id);
  const groupCtx = getExperimentGroupContext(experiment?.id);
  const [currentStep, setCurrentStep] = React.useState(-1); // -1 = intro, 0..N-1 = steps, N = osserva, N+1 = concetto
  const [showSolution, setShowSolution] = React.useState(false);

  // Total "pages": intro + steps + observe (if any) + concept (if any)
  const hasObserve = !!observe;
  const hasConcept = !!concept;
  const totalPages = 1 + steps.length + (hasObserve ? 1 : 0) + (hasConcept ? 1 : 0);
  const pageIndex = currentStep + 1; // 0-based page (intro = 0)

  // Principio Zero: UNLIM proattivo quando il docente resta fermo sullo stesso
  // passo. Il hook traccia idle (mouse/key), step stuck, poll 15s; quando
  // `shouldNudge` decide di agire, mostriamo l'overlay con il messaggio per
  // la classe. Se il docente dismette, il hook nasconde il nudge per 90s.
  const nudge = useUnlimNudge({
    currentExperimentId: experiment?.id || null,
    currentStepIndex: currentStep,
    totalSteps: steps.length,
    enabled: !!experiment?.id,
  });

  const GS = {
    container: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 4px' },
    title: {
      fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--elab-navy)',
      marginBottom: 14, textAlign: 'center', lineHeight: 1.3,
    },
    desc: {
      fontSize: 17, lineHeight: 1.7, color: '#555', textAlign: 'center',
      fontFamily: "'Open Sans', sans-serif", maxWidth: 320, margin: '0 auto',
    },
    stepCard: {
      background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #f0fdf4 100%)', // palette
      borderRadius: 18, padding: '24px 20px',
      border: '1px solid rgba(30, 77, 140, 0.12)',
      boxShadow: '0 4px 20px rgba(30, 77, 140, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
    },
    stepLabel: {
      fontFamily: "'Oswald', sans-serif", fontSize: 12, fontWeight: 600,
      color: 'var(--elab-lime)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    stepLabelBar: { flex: 1, height: 2, background: 'linear-gradient(90deg, var(--elab-lime) 0%, transparent 100%)', borderRadius: 1, opacity: 0.3 },
    stepNum: {
      display: 'inline-flex', width: 48, height: 48, borderRadius: 14,
      background: 'linear-gradient(135deg, var(--elab-navy) 0%, #2a6bc4 100%)',
      color: '#fff', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700,
      marginRight: 16, flexShrink: 0,
      boxShadow: '0 3px 12px rgba(30, 77, 140, 0.25)',
    },
    stepText: {
      fontSize: 18, lineHeight: 1.65, color: '#1a1a2e', fontWeight: 500, // palette
      fontFamily: "'Open Sans', sans-serif",
    },
    sectionCard: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)', // palette
      borderRadius: 18, padding: '24px 20px',
      border: '1px solid rgba(74, 122, 37, 0.15)',
      boxShadow: '0 4px 20px rgba(74, 122, 37, 0.08)',
    },
    sectionTitle: {
      fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600,
      color: 'var(--elab-lime)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    sectionText: { fontSize: 17, lineHeight: 1.7, color: '#333', fontFamily: "'Open Sans', sans-serif" },
    nav: { display: 'flex', gap: 10, padding: '10px 0 4px', flexShrink: 0 },
    navBtn: (primary) => ({
      flex: 1, padding: '14px 16px', border: primary ? 'none' : '2px solid rgba(30, 77, 140, 0.3)', borderRadius: 14,
      background: primary ? 'linear-gradient(135deg, var(--elab-navy) 0%, #2a6bc4 100%)' : 'rgba(30, 77, 140, 0.04)',
      color: primary ? '#fff' : 'var(--elab-navy)',
      fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, cursor: 'pointer',
      letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 150ms',
      boxShadow: primary ? '0 4px 16px rgba(30, 77, 140, 0.25)' : 'none',
    }),
    progress: { display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 0' },
    dot: (active) => ({
      width: active ? 24 : 8, height: 8, borderRadius: 4,
      background: active ? 'linear-gradient(90deg, var(--elab-navy), var(--elab-lime))' : '#d1d5db',
      transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    askBtn: { width: '100%', padding: '10px 16px', border: '2px solid var(--elab-lime)', borderRadius: 10, background: 'rgba(74,122,37,0.08)', color: 'var(--elab-lime)', fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', marginTop: 8 },
  };

  if (!steps.length && !desc && !observe) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#737373', fontSize: 16 }}>Questo esperimento non ha passi dettagliati.<br/><button style={GS.askBtn} onClick={() => onAskUNLIM?.('Aiutami con questo esperimento')}>Chiedi a UNLIM</button></div>;
  }

  // Determine what to show for current step
  let content;
  if (currentStep === -1) {
    // Intro page
    content = (
      <div style={GS.content}>
        <div style={GS.title}>{experiment.icon ? `${experiment.icon} ` : ''}{experiment.title}</div>
        {groupCtx && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--elab-lime)', fontWeight: 600, fontFamily: "'Oswald', sans-serif", letterSpacing: '1px', marginBottom: 6 }}>
            {groupCtx.narrative}
          </div>
        )}
        {volRef && (
          <div style={{ margin: '0 auto 12px', padding: '10px 14px', background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', borderRadius: 12, border: '1px solid #93c5fd40', maxWidth: 340 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 600, color: 'var(--elab-navy)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
              Vol. {volRef.volume}, pag. {volRef.bookPage}
            </div>
            <div style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              {volRef.chapter}
            </div>
            {volRef.bookText && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--elab-navy)', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.5px', padding: '4px 0' }}>
                  📖 Cosa dice il libro
                </summary>
                <div style={{ marginTop: 6, fontSize: 13, color: '#333', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid var(--elab-navy)', paddingLeft: 12, background: 'rgba(30, 77, 140, 0.03)', padding: '10px 12px', borderRadius: '0 6px 6px 0' }}>
                  {volRef.bookText}
                </div>
                {volRef.bookQuote && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#666', lineHeight: 1.5, fontStyle: 'italic', textAlign: 'center', padding: '6px 10px' }}>
                    💬 "{volRef.bookQuote}"
                  </div>
                )}
              </details>
            )}
          </div>
        )}
        {desc && <div style={GS.desc}>{desc}</div>}
        {!desc && <div style={GS.desc}>Pronti a iniziare? Premete Avanti per il primo passo.</div>}
        {splitSuggestion && (
          <div style={{ marginTop: 8, padding: 10, background: '#FFF8E7', borderRadius: 8, border: '1px solid var(--elab-orange)33', fontSize: 12, color: '#8B6914', lineHeight: 1.5 }}>
            <strong>Suggerimento docente:</strong> {splitSuggestion}
          </div>
        )}
      </div>
    );
  } else if (currentStep < steps.length) {
    // Step page
    content = (
      <div style={GS.content}>
        <div style={GS.stepCard}>
          <div style={GS.stepLabel}>
            <span>Passo {currentStep + 1} di {steps.length}</span>
            <span style={GS.stepLabelBar} />
            {groupCtx && <span style={{ fontSize: 10, color: 'var(--elab-lime)', opacity: 0.8 }}>Esp. {groupCtx.position}/{groupCtx.total}</span>}
            {volRef && <span style={{ fontSize: 11, color: 'var(--elab-navy)', opacity: 0.7 }}>Vol. {volRef.volume}, p. {volRef.bookPage}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={GS.stepNum}>{currentStep + 1}</span>
            <span style={GS.stepText}>{steps[currentStep]}</span>
          </div>
          {volRef?.bookInstructions?.[currentStep] && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#555', lineHeight: 1.5, fontStyle: 'italic', borderLeft: '3px solid var(--elab-navy)20', paddingLeft: 10 }}>
              Il libro dice: "{volRef.bookInstructions[currentStep]}"
            </div>
          )}
        </div>
      </div>
    );
  } else if (hasObserve && currentStep === steps.length) {
    content = (
      <div style={GS.content}>
        <div style={GS.sectionCard}>
          <div style={GS.sectionTitle}>Cosa osservare</div>
          <div style={GS.sectionText}>{observe}</div>
          {solutionHint && (
            <div style={{ marginTop: 10 }}>
              <button
                style={{ background: 'none', border: '1px dashed #999', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#666' }}
                onClick={() => setShowSolution(s => !s)}
              >
                {showSolution ? 'Nascondi schema finale' : 'Mostra schema finale (soluzione)'}
              </button>
              {showSolution && <div style={{ marginTop: 8, padding: 10, background: '#f0f7ff', borderRadius: 6, fontSize: 13, lineHeight: 1.5 }}>{solutionHint}</div>}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div style={GS.content}>
        <div style={GS.sectionCard}>
          <div style={GS.sectionTitle}>Concetto chiave</div>
          <div style={GS.sectionText}>{concept}</div>
        </div>
        <button style={GS.askBtn} onClick={() => onAskUNLIM?.('Aiutami con questo esperimento')}>Chiedi a UNLIM</button>
      </div>
    );
  }

  const isFirst = currentStep === -1;
  const isLast = pageIndex >= totalPages - 1;

  return (
    <div style={{ ...GS.container, position: 'relative' }}>
      {content}
      {/* Progress dots */}
      <div style={GS.progress}>
        {Array.from({ length: totalPages }, (_, i) => <div key={i} style={GS.dot(i === pageIndex)} />)}
      </div>
      {/* Navigation */}
      <div style={GS.nav}>
        {!isFirst && <button style={GS.navBtn(false)} onClick={() => setCurrentStep(s => s - 1)}>Indietro</button>}
        {!isLast && <button style={GS.navBtn(true)} onClick={() => setCurrentStep(s => s + 1)}>{isFirst ? 'Inizia' : 'Avanti'}</button>}
        {isLast && <button style={GS.navBtn(false)} onClick={() => setCurrentStep(-1)}>Ricomincia</button>}
        {isLast && (
          <button
            style={{ ...GS.navBtn(true), background: 'linear-gradient(135deg, var(--elab-lime), #3A6A1A)', animation: 'pulse 2s infinite' }}
            onClick={() => {
              const api = typeof window !== 'undefined' && window.__ELAB_API;
              if (api?.loadNextExperiment) api.loadNextExperiment();
            }}
          >
            Prossimo esperimento →
          </button>
        )}
      </div>
      {/* Proactive UNLIM nudge — Principio Zero */}
      <UnlimNudgeOverlay
        visible={nudge.nudge}
        message={nudge.message}
        priority={nudge.priority}
        onDismiss={nudge.dismiss}
        onAskUNLIM={onAskUNLIM}
      />
    </div>
  );
}

function EmbeddedDiagnose({ experiment, onAskUNLIM }) {
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    try {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      setDescription(api?.getCircuitDescription?.() || '');
    } catch {
      setDescription('');
    }
  }, [experiment?.id]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 14,
      padding: 18,
      fontFamily: "'Open Sans', sans-serif",
      color: 'var(--elab-navy)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef6ff 100%)',
    }}>
      <div style={{
        border: '1px solid rgba(30, 77, 140, 0.14)',
        borderRadius: 16,
        background: '#fff',
        padding: 18,
        boxShadow: '0 8px 24px rgba(30, 77, 140, 0.08)',
      }}>
        <div style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--elab-lime)',
          marginBottom: 8,
        }}>
          Già montato
        </div>
        <h3 style={{ margin: '0 0 10px', fontSize: 22, lineHeight: 1.2 }}>
          Ragazzi, osservate il circuito pronto.
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: 16, lineHeight: 1.55, color: '#334155' }}>
          Spiegate il percorso della corrente: da dove parte, cosa attraversa, dove torna.
        </p>
        <div style={{
          borderLeft: '4px solid var(--elab-lime)',
          padding: '10px 12px',
          borderRadius: '0 8px 8px 0',
          background: 'rgba(74, 122, 37, 0.08)',
          color: '#1f2937',
          fontSize: 14,
          lineHeight: 1.5,
        }}>
          {description || 'Circuito pronto: chiedete a UNLIM di descriverlo e controllarlo.'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onAskUNLIM?.(`Guida i ragazzi nella diagnosi del circuito già montato "${experiment?.title || ''}". Fai domande difficili ma adatte alla classe: percorso della corrente, polarità LED, ruolo del resistore, possibili errori.`)}
        style={{
          minHeight: 44,
          border: '1px solid rgba(30,77,140,0.22)',
          borderRadius: 12,
          background: 'var(--elab-navy)',
          color: '#fff',
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        Chiedi diagnosi a UNLIM
      </button>
    </div>
  );
}

export default function UnlimAdapter({ visible, onClose, onSpeakingChange, activeTab: initialTab = 'chat' }) {
  const chat = useGalileoChat();
  const [activeTab, setActiveTab] = useState('chat');
  const [currentExperiment, setCurrentExperiment] = useState(null);

  // Sync initial tab when prop changes.
  // Passo Passo is only the ComponentDrawer that mounts the circuit; requests for
  // legacy "guida"/"diagnosi" panels fall back to chat so UNLIM never becomes a
  // second, competing step-by-step UI.
  useEffect(() => {
    if (!visible) return;
    setActiveTab(['chat', 'percorso'].includes(initialTab) ? initialTab : 'chat');
  }, [initialTab, visible]);

  // Get current experiment for Percorso tab — with polling fallback for race condition
  useEffect(() => {
    const tryLoad = () => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (!api) return false;
      const exp = api.getCurrentExperiment?.();
      if (exp) { setCurrentExperiment(exp); return true; }
      return false;
    };
    tryLoad();
    let retries = 0;
    const poll = setInterval(() => { if (tryLoad() || ++retries > 20) clearInterval(poll); }, 500);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    const onChange = () => { const e = api?.getCurrentExperiment?.(); if (e) setCurrentExperiment(e); };
    api?.on?.('experimentChange', onChange);
    return () => { clearInterval(poll); api?.off?.('experimentChange', onChange); };
  }, [visible]);

  // ── Voice state ──
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);

  // ── FloatingWindow state ──
  const [maximized, setMaximized] = useState(false);
  const containerRef = useRef(null);
  const handleAskUNLIM = useCallback((prompt) => {
    if (!prompt) return;
    setActiveTab('chat');
    chat.handleSend?.(String(prompt));
  }, [chat]);
  const handlePercorsoSubmit = useCallback((event) => {
    event?.preventDefault?.();
    const prompt = String(chat.input || '').trim();
    if (!prompt || chat.isLoading) return;
    chat.setInput('');
    chat.handleSend?.(prompt);
  }, [chat]);

  // ── Emit speaking state to parent (drives MascotPresence animation) ──
  useEffect(() => {
    onSpeakingChange?.(voicePlaying || chat.isLoading);
    // Reset speaking state on unmount (e.g. when window is closed mid-response)
    return () => onSpeakingChange?.(false);
  }, [voicePlaying, chat.isLoading, onSpeakingChange]);

  // ── Auto-expand ChatOverlay (it defaults to minimized internally) ──
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      const btn = document.querySelector('[aria-label="Espandi chat UNLIM"]');
      if (btn) btn.click();
    }, 150);
    return () => clearTimeout(timer);
  }, [visible]);

  // ── Voice: detect capabilities on mount (lazy load) ──
  useEffect(() => {
    getVoice().then(v => v.checkVoiceCapabilities()).then(caps => {
      setVoiceAvailable(caps.stt && caps.tts && caps.microphone);
    }).catch(() => setVoiceAvailable(false));
    return () => { getVoice().then(v => { v.cancelRecording(); v.stopPlayback(); }).catch(() => {}); };
  }, []);

  // ── Voice toggle ──
  const handleVoiceToggle = useCallback(async (enabled) => {
    if (enabled && !voiceAvailable) {
      chat.setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'La voce non e disponibile in questo browser o manca il permesso microfono. Su iPad usate Safari aggiornato e consentite il microfono.',
      }]);
      return;
    }
    const v = await getVoice();
    if (enabled) v.unlockAudioPlayback();
    setVoiceEnabled(enabled);
    if (!enabled) {
      v.cancelRecording();
      v.stopPlayback();
      setVoiceRecording(false);
      setVoicePlaying(false);
    }
  }, [voiceAvailable]);

  // ── Voice record (press-to-talk) ──
  const handleVoiceRecord = useCallback(async () => {
    if (chat.isLoading) return;
    const v = await getVoice();
    v.unlockAudioPlayback();

    if (v.isRecording()) {
      setVoiceRecording(false);
      chat.setMessages(prev => [...prev, {
        id: Date.now(), role: 'user',
        content: 'Messaggio vocale in elaborazione...', isVoice: true,
      }]);

      try {
        const audioBlob = await v.stopRecording();
        if (!audioBlob || audioBlob.size < 100) {
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
            if (voiceIdx >= 0) {
              last[voiceIdx] = { ...last[voiceIdx], content: 'Audio troppo breve. Riprova con una frase intera.' };
            }
            return last;
          });
          return;
        }

        const api = typeof window !== 'undefined' && window.__ELAB_API;
        let simulatorCtx = null;
        try { simulatorCtx = api?.getSimulatorContext?.(); } catch { /* silent */ }

        const result = await v.sendVoiceChat(audioBlob, {
          sessionId: localStorage.getItem('elab_tutor_session') || '',
          experimentId: api?.getCurrentExperiment?.()?.id || '',
          circuitState: chat.circuitStateRef.current,
          simulatorContext: simulatorCtx,
        });

        if (result.success) {
          // Update user message with transcript
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
            if (voiceIdx >= 0) {
              last[voiceIdx] = { ...last[voiceIdx], content: result.userText || '(audio)' };
            }
            return last;
          });

          if (result.response) {
            const cleaned = sanitizeOutput(String(result.response))
              .replace(/\[azione:[^\]]+\]/gi, '')
              .replace(/\[AZIONE:[^\]]+\]/g, '')
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            chat.setMessages(prev => [...prev, {
              id: Date.now() + 1, role: 'assistant',
              content: cleaned, isVoice: true,
            }]);
          }

          // Play audio response
          if (result.audio && voiceEnabled) {
            setVoicePlaying(true);
            try {
              await v.playTracked(result.audio, result.audioFormat || 'audio/mpeg');
            } catch (e) {
              logger.warn('[Lavagna Voice] Playback failed:', e);
            }
            setVoicePlaying(false);
          }
        } else {
          chat.setMessages(prev => {
            const last = [...prev];
            const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
            if (voiceIdx >= 0) {
              last[voiceIdx] = { ...last[voiceIdx], content: 'Non sono riuscito a capire. Riprova!' };
            }
            return last;
          });
        }
      } catch (err) {
        logger.error('[Lavagna Voice] Error:', err);
        const detail = /stt|401|403|microfono|permission|timeout|abort/i.test(String(err?.message || ''))
          ? String(err?.message || '').slice(0, 90)
          : '';
        chat.setMessages(prev => {
          const last = [...prev];
          const voiceIdx = (() => { for (let i = last.length - 1; i >= 0; i--) { if (last[i].isVoice && last[i].content === 'Messaggio vocale in elaborazione...') return i; } return -1; })();
          const content = detail
            ? `Voce non completata: ${detail}. Scrivimi qui o riprova.`
            : 'Voce non completata. Scrivimi qui o riprova.';
          if (voiceIdx >= 0) {
            last[voiceIdx] = { ...last[voiceIdx], content };
            return last;
          }
          return [...last, { id: Date.now() + 1, role: 'assistant', content }];
        });
      }
    } else {
      const started = await v.startRecording();
      if (started) {
        setVoiceRecording(true);
        v.stopPlayback();
      } else {
        chat.setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant',
          content: 'Per usare la voce, permetti l\'accesso al microfono nelle impostazioni del browser.',
        }]);
      }
    }
  }, [chat.isLoading, voiceEnabled]);

  // ── Auto-speak latest AI response when voice mode is on ──
  const lastSpokenRef = useRef(null);
  useEffect(() => {
    if (!voiceEnabled || chat.messages.length === 0) return;
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg.role !== 'assistant') return;
    if (lastMsg.id === lastSpokenRef.current) return;
    if (lastMsg.isVoice) return;
    lastSpokenRef.current = lastMsg.id;

    (async () => {
      try {
        setVoicePlaying(true);
        const v = await getVoice();
        const audioData = await v.synthesizeSpeech(lastMsg.content);
        await v.playTracked(audioData, 'audio/mpeg');
      } catch (e) {
        logger.warn('[Lavagna Voice] Auto-speak failed:', e);
      } finally {
        setVoicePlaying(false);
      }
    })();
  }, [chat.messages, voiceEnabled]);

  if (!visible) return null;

  const tabBarStyle = {
    display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', // palette
    background: '#f8fafc', flexShrink: 0, // palette
  };
  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
    fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600,
    letterSpacing: '0.5px', textTransform: 'uppercase',
    background: active ? '#fff' : 'transparent',
    color: active ? 'var(--elab-navy)' : '#737373',
    borderBottom: active ? '2px solid var(--elab-navy)' : '2px solid transparent',
    transition: 'all 150ms',
  });

  return (
    <FloatingWindow
      id="unlim-v3"
      title="UNLIM"
      defaultPosition={{ x: 16, y: 96 }}
      defaultSize={{
        // Andrea 2026-05-08: UNLIM e imprescindibile, ma non deve coprire
        // il pannello Passo Passo che monta fisicamente il circuito.
        w: typeof window !== 'undefined'
          ? Math.min(360, Math.max(300, Math.round(window.innerWidth * 0.34)))
          : 340,
        h: Math.min(520, typeof window !== 'undefined' ? window.innerHeight - 180 : 520),
      }}
      maximized={maximized}
      onMaximize={() => setMaximized(m => !m)}
      onClose={onClose}
      onMinimize={onClose}
      glass
      className={css.unlimWindow}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
          {activeTab === 'chat' && (
            <ChatOverlay
              messages={chat.messages}
              input={chat.input}
              onInputChange={chat.setInput}
              onSend={chat.handleSend}
              isLoading={chat.isLoading}
              onRetry={chat.handleRetry}
              quickActions={chat.quickActions}
              visible={true}
              onClose={onClose}
              expanded={maximized}
              onToggleExpanded={() => setMaximized(m => !m)}
              socraticMode={true}
              onToggleSocraticMode={null}
              onScreenshot={chat.handleScreenshot}
              voiceEnabled={voiceEnabled}
              onVoiceToggle={handleVoiceToggle}
              voiceRecording={voiceRecording}
              onVoiceRecord={handleVoiceRecord}
              voicePlaying={voicePlaying}
            />
          )}
          {activeTab === 'percorso' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <EmbeddedPercorso
                  experiment={currentExperiment}
                  onAskUNLIM={handleAskUNLIM}
                />
              </div>
              <form
                onSubmit={handlePercorsoSubmit}
                aria-label="Scrivi a UNLIM nel percorso"
                style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #e5e7eb', background: '#fff' }}
              >
                <input
                  value={chat.input}
                  onChange={(e) => chat.setInput(e.target.value)}
                  aria-label="Scrivi messaggio a UNLIM nel percorso"
                  placeholder="Scrivi a UNLIM..."
                  disabled={chat.isLoading}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    padding: '10px 12px',
                    fontSize: 14,
                    fontFamily: 'Open Sans, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={chat.isLoading || !String(chat.input || '').trim()}
                  aria-label="Invia messaggio a UNLIM dal percorso"
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    padding: '0 14px',
                    background: chat.isLoading ? '#9ca3af' : 'var(--elab-navy)',
                    color: '#fff',
                    fontFamily: "'Oswald', sans-serif",
                    fontWeight: 700,
                    cursor: chat.isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Invia
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </FloatingWindow>
  );
}
