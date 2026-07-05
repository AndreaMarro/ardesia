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
import { useTranslation } from 'react-i18next';
import VolumeCitation from '../common/VolumeCitation.jsx';
import DocenteSidebar from './DocenteSidebar.jsx';
import css from './PercorsoCapitoloView.module.css';
import { getLessonPath } from '../../../../../packs/elab-tutor/data/lesson-paths';
import { getVolumeRef } from '../../../../../packs/elab-tutor/data/volume-references.js';
import {
  adaptPercorsoRender,
  DEFAULT_PERCORSO_MORPHIC_CONTEXT,
  resolvePercorsoMorphicContext,
} from '../../services/percorsoMorphicAdapter.js';
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

const PERCORSO_MORPHIC_RUNTIME_EVENT = 'elab:percorso-morphic-context-changed';
const PERCORSO_LIVE_SIGNAL_EVENT = 'elab:percorso-live-signal';
const PERCORSO_MORPHIC_POLL_MS = 750;
const PERCORSO_LIVE_SIGNAL_LIMIT = 6;

let percorsoLiveInstanceSerial = 0;

// Runtime contract del solo pannello Percorso: ELABTutor puo inviare segnali live
// da testo, azioni, montaggio, latenza, screenshot, audio e memoria lezioni passate.
// Il canone resta invariato; cambiano regia, quantita di testo e numero di slide.
const PERCORSO_OPENING_VARIATIONS = [
  'Ragazzi, partiamo dal kit fisico ELAB: prima osservazione, poi prova sul banco.',
  'Ragazzi, teniamo Vol/pag davanti e usiamo il circuito reale come verifica.',
  'Ragazzi, una previsione breve prima di toccare i componenti del kit fisico ELAB.',
  'Ragazzi, oggi il percorso resta canonico: cambia solo il ritmo della regia.',
  'Ragazzi, prima il dettaglio visibile sul banco, poi la frase da portare alla classe.',
  'Ragazzi, scegliamo il controllo piu utile adesso e lasciamo il docente alla guida.',
];

const LIVE_SIGNAL_LABEL = {
  text: 'scrittura',
  writing: 'scrittura',
  message: 'scrittura',
  action: 'azione',
  mounting: 'montaggio',
  circuit: 'montaggio',
  latency: 'latenza',
  screenshot: 'screenshot',
  audio: 'audio',
  voice: 'audio',
  past_lesson: 'lezioni passate',
  lesson_memory: 'lezioni passate',
  memory: 'lezioni passate',
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

function GraduationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 11v4.5c1.4 1.5 3.1 2.2 5 2.2s3.6-.7 5-2.2V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 9v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function withPrincipioZeroFrame(text) {
  const original = String(text || '').trim();
  if (!original) return original;
  const prefix = /^Ragazzi[\s,:;.\-]/i.test(original) ? '' : 'Ragazzi, ';
  const kit = /kit fisico|kit ELAB/i.test(original) ? '' : ' Sul kit fisico ELAB teniamo davanti breadboard e componenti reali.';
  return `${prefix}${original}${kit}`;
}

function buildMorphicIntro(baseText, capitolo, hint) {
  const framed = withPrincipioZeroFrame(baseText);
  if (!framed) return framed;
  if (hint.teacherProfile === 'primo-anno') {
    return `${framed} Procediamo con ${hint.esempiBaseCount} esempi brevi e micro-passaggi sul kit fisico ELAB.`;
  }
  if (hint.teacherProfile === 'esperto') {
    return `${framed} Teniamo il focus sul passaggio nuovo, senza ripetere le basi gia viste.`;
  }
  return framed;
}

function formatNextExperimentLabel(next, capitolo) {
  if (!next) return null;
  const id = typeof next === 'string' ? next : next.id;
  const experiment = id
    ? capitolo?.esperimenti?.find((item) => item.id === id)
    : null;
  const lessonPath = id ? getLessonPath(id) : null;
  const volumeRef = id ? getVolumeRef(id) : null;
  const rawTitle = typeof next === 'object' ? String(next.title || '').trim() : null;
  const title = rawTitle && rawTitle !== id
    ? rawTitle
    : (experiment?.title_classe || experiment?.title_docente || experiment?.title || lessonPath?.title || null);
  if (!title) return null;

  const volume = volumeRef?.volume
    || experiment?.volume
    || lessonPath?.volume
    || (typeof next === 'object' ? next.volume : null)
    || capitolo?.volume;
  const page = experiment?.volume_ref?.page_start
    || experiment?.pageStart
    || volumeRef?.bookPage
    || (typeof next === 'object' ? next.volume_ref?.page_start || next.pageStart : null);
  return volume && page ? `${title} (Vol.${volume} pag.${page})` : title;
}

function resolveNextExperimentForCard(esp) {
  return esp?.next_experiment || getLessonPath(esp?.id)?.next_experiment || null;
}

function getNextExperimentPreview(next) {
  return next && typeof next === 'object' ? String(next.preview || '').trim() : '';
}

function getRuntimeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readRuntimeStorage(storage, key) {
  try {
    return storage?.getItem?.(key) ?? null;
  } catch {
    return null;
  }
}

function readFirstRuntimeStorage(storage, keys) {
  for (const key of keys) {
    const value = readRuntimeStorage(storage, key);
    if (value) return value;
  }
  return null;
}

function createPercorsoOpeningVariation() {
  percorsoLiveInstanceSerial += 1;
  const index = (percorsoLiveInstanceSerial - 1) % PERCORSO_OPENING_VARIATIONS.length;
  return {
    id: `percorso-live-${Date.now().toString(36)}-${percorsoLiveInstanceSerial}`,
    text: PERCORSO_OPENING_VARIATIONS[index],
  };
}

function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeLiveSignal(input) {
  if (!input) return null;
  const raw = typeof input === 'string' ? { source: 'message', value: input } : input;
  const source = String(raw.source || raw.kind || raw.type || 'message').toLowerCase();
  const latencyMs = Number(raw.latencyMs ?? raw.latency_ms ?? raw.value);
  const label = source === 'latency' && (!Number.isFinite(latencyMs) || latencyMs >= 1200)
    ? 'latenza alta'
    : (LIVE_SIGNAL_LABEL[source] || source);
  const value = source === 'latency' && Number.isFinite(latencyMs)
    ? `${latencyMs} ms`
    : String(raw.value || raw.text || raw.summary || '').trim();
  return {
    source,
    label,
    value,
    at: raw.at || Date.now(),
  };
}

function compactLiveSignals(signals) {
  const byLabel = new Map();
  signals
    .map(normalizeLiveSignal)
    .filter(Boolean)
    .forEach((signal) => {
      byLabel.set(signal.label, signal);
    });
  return Array.from(byLabel.values()).slice(-PERCORSO_LIVE_SIGNAL_LIMIT);
}

function readRuntimeLiveSignals(capitolo) {
  const storage = getRuntimeStorage();
  const rawSignals = [
    safeJsonParse(readRuntimeStorage(storage, capitolo?.id ? `elab-percorso-live-signals:${capitolo.id}` : ''), []),
    safeJsonParse(readRuntimeStorage(storage, 'elab-percorso-live-signals'), []),
  ].flatMap((value) => Array.isArray(value) ? value : (value ? [value] : []));

  const directSignals = [
    ['text', readRuntimeStorage(storage, 'elab-percorso-written-message')],
    ['action', readRuntimeStorage(storage, 'elab-percorso-action-state')],
    ['mounting', readRuntimeStorage(storage, 'elab-percorso-mounting-state')],
    ['latency', readRuntimeStorage(storage, 'elab-percorso-latency-ms')],
    ['screenshot', readRuntimeStorage(storage, 'elab-percorso-screenshot-state')],
    ['audio', readRuntimeStorage(storage, 'elab-percorso-audio-state')],
    ['past_lesson', readRuntimeStorage(storage, 'elab-percorso-past-lesson-memory')],
  ]
    .filter(([, value]) => value)
    .map(([source, value]) => ({ source, value }));

  return compactLiveSignals([...rawSignals, ...directSignals]);
}

function buildMorphicRuntimeSignature(capitolo) {
  const storage = getRuntimeStorage();
  const teacherId = readFirstRuntimeStorage(storage, [
    'elab-teacher-anon-uuid',
    'elab_teacher_anon_uuid',
    'elab-teacher-id',
  ]);
  const classKey = readFirstRuntimeStorage(storage, ['elab-class-key', 'elab_class_key']);
  return JSON.stringify({
    capitoloId: capitolo?.id || null,
    teacherId,
    classKey,
    teacherProfile: readRuntimeStorage(storage, teacherId ? `elab-morphic-teacher-profile:${teacherId}` : 'elab-percorso-teacher-profile'),
    teacherProfileFallback: readRuntimeStorage(storage, 'elab_morphic_teacher_profile'),
    classProfile: readRuntimeStorage(storage, classKey ? `elab-morphic-class-profile:${classKey}` : 'elab-percorso-class-profile'),
    classProfileFallback: readRuntimeStorage(storage, 'elab_morphic_class_profile'),
    sessionState: readFirstRuntimeStorage(storage, ['elab-percorso-session-state', 'elab_session_state']),
    resolution: readFirstRuntimeStorage(storage, ['elab-lim-resolution', 'elab_percorso_resolution']),
    pointer: readFirstRuntimeStorage(storage, ['elab-pointer-mode', 'elab_percorso_pointer']),
    liveSignals: readRuntimeStorage(storage, capitolo?.id ? `elab-percorso-live-signals:${capitolo.id}` : ''),
    liveSignalsGlobal: readRuntimeStorage(storage, 'elab-percorso-live-signals'),
    writtenMessage: readRuntimeStorage(storage, 'elab-percorso-written-message'),
    actionState: readRuntimeStorage(storage, 'elab-percorso-action-state'),
    mountingState: readRuntimeStorage(storage, 'elab-percorso-mounting-state'),
    latencyMs: readRuntimeStorage(storage, 'elab-percorso-latency-ms'),
    screenshotState: readRuntimeStorage(storage, 'elab-percorso-screenshot-state'),
    audioState: readRuntimeStorage(storage, 'elab-percorso-audio-state'),
    lessonMemory: readRuntimeStorage(storage, 'elab-percorso-past-lesson-memory'),
  });
}

function buildMorphicClosing(baseText, capitolo, hint) {
  const framed = withPrincipioZeroFrame(baseText);
  const next = hint.nextExperiment;
  if (!next) return framed;
  const nextLabel = formatNextExperimentLabel(next, capitolo);
  if (!nextLabel) return framed;
  return `${framed} Prossimo aggancio: ${nextLabel}.`;
}

function buildLiveRegiaNextAction(liveSignals, capitolo, activeExp) {
  const page = activeExp?.volume_ref?.page_start || capitolo?.pageStart || capitolo?.page_start || '?';
  const hasMounting = liveSignals.some((signal) => signal.label === 'montaggio');
  const hasLatency = liveSignals.some((signal) => signal.label === 'latenza alta');
  const hasScreenshot = liveSignals.some((signal) => signal.label === 'screenshot');
  const hasAudio = liveSignals.some((signal) => signal.label === 'audio');
  const hasMemory = liveSignals.some((signal) => signal.label === 'lezioni passate');
  if (hasLatency) {
    return `Ragazzi, rallentiamo un passaggio: sul kit fisico ELAB facciamo una sola verifica visibile, poi riprendiamo da Vol.${capitolo.volume} pag.${page}.`;
  }
  if (hasScreenshot || hasMounting) {
    return `Ragazzi, guardiamo il montaggio reale sul kit fisico ELAB: prima polarita e riga breadboard, poi Vol.${capitolo.volume} pag.${page}.`;
  }
  if (hasAudio) {
    return `Ragazzi, trasformiamo la domanda ascoltata in una prova breve sul kit fisico ELAB, restando su Vol.${capitolo.volume} pag.${page}.`;
  }
  if (hasMemory) {
    return `Ragazzi, riprendiamo l'errore gia visto nelle lezioni passate e lo verifichiamo sul kit fisico ELAB a Vol.${capitolo.volume} pag.${page}.`;
  }
  return `Ragazzi, restiamo sul kit fisico ELAB e scegliamo il prossimo controllo da Vol.${capitolo.volume} pag.${page}.`;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildMorphicOutputBudget(hint, liveSignals, capitolo, activeExp) {
  const page = activeExp?.volume_ref?.page_start || capitolo?.pageStart || capitolo?.page_start || '?';
  const hasLatency = liveSignals.some((signal) => signal.label === 'latenza alta');
  const hasVisualSignal = liveSignals.some((signal) => signal.label === 'montaggio' || signal.label === 'screenshot');
  const hasMemory = liveSignals.some((signal) => signal.label === 'lezioni passate');

  let sentenceCount = hint.teacherProfile === 'primo-anno' ? 5 : (hint.teacherProfile === 'esperto' ? 2 : 3);
  if (hint.lexicalComplexity === 'semplice') sentenceCount += 1;
  if (hint.sessionState === 'intro') sentenceCount += 1;
  if (hint.sessionState === 'verifica') sentenceCount -= 1;
  if (hint.sessionState === 'report') sentenceCount += 1;
  if (hasLatency) sentenceCount -= 1;
  if (hasMemory) sentenceCount += 1;
  sentenceCount = clampNumber(sentenceCount, 1, 7);

  let slideCount = hint.teacherProfile === 'primo-anno' ? 4 : (hint.teacherProfile === 'esperto' ? 2 : 3);
  if (hint.sessionState === 'verifica') slideCount -= 1;
  if (hint.sessionState === 'report') slideCount += 1;
  if (hasLatency) slideCount -= 1;
  if (hasVisualSignal) slideCount += 1;
  slideCount = clampNumber(slideCount, 1, 5);

  return {
    sentenceCount,
    slideCount,
    writingLabel: `${sentenceCount} ${sentenceCount === 1 ? 'frase' : 'frasi'} corrette da Vol.${capitolo.volume} pag.${page}, solo dal percorso ELAB`,
    slideLabel: `${slideCount} ${slideCount === 1 ? 'slide' : 'slide'} sul kit fisico ELAB`,
  };
}

export default function PercorsoCapitoloView({
  capitolo,
  onClose,
  onCitationClick,
  morphicContext = null,
}) {
  const { t } = useTranslation();
  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [runtimeMorphicContext, setRuntimeMorphicContext] = useState(
    morphicContext || DEFAULT_PERCORSO_MORPHIC_CONTEXT
  );
  const [openingVariation] = useState(createPercorsoOpeningVariation);
  const [liveSignals, setLiveSignals] = useState(() => readRuntimeLiveSignals(capitolo));
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

  useEffect(() => {
    if (morphicContext) {
      setRuntimeMorphicContext(morphicContext);
      return undefined;
    }
    let cancelled = false;
    let lastSignature = null;

    const refreshMorphicContext = () => {
      const signature = buildMorphicRuntimeSignature(capitolo);
      if (signature === lastSignature) return;
      lastSignature = signature;
      resolvePercorsoMorphicContext({ capitolo })
        .then((context) => {
          if (!cancelled && isMountedRef.current && signature === lastSignature) {
            setRuntimeMorphicContext(context);
          }
        })
        .catch(() => {
          if (!cancelled && isMountedRef.current && signature === lastSignature) {
            setRuntimeMorphicContext(DEFAULT_PERCORSO_MORPHIC_CONTEXT);
          }
        });
    };

    const forceRefreshMorphicContext = () => {
      lastSignature = null;
      refreshMorphicContext();
    };

    refreshMorphicContext();
    const intervalId = globalThis.setInterval?.(refreshMorphicContext, PERCORSO_MORPHIC_POLL_MS);
    globalThis.addEventListener?.('storage', forceRefreshMorphicContext);
    globalThis.addEventListener?.(PERCORSO_MORPHIC_RUNTIME_EVENT, forceRefreshMorphicContext);

    return () => {
      cancelled = true;
      if (intervalId) globalThis.clearInterval?.(intervalId);
      globalThis.removeEventListener?.('storage', forceRefreshMorphicContext);
      globalThis.removeEventListener?.(PERCORSO_MORPHIC_RUNTIME_EVENT, forceRefreshMorphicContext);
    };
  }, [capitolo, morphicContext]);

  useEffect(() => {
    let cancelled = false;
    let lastLiveSignature = null;

    const applyLiveSignals = (signals) => {
      if (cancelled || !isMountedRef.current) return;
      setLiveSignals(compactLiveSignals(signals));
    };

    const refreshLiveSignals = () => {
      const nextSignals = readRuntimeLiveSignals(capitolo);
      const signature = JSON.stringify(nextSignals);
      if (signature === lastLiveSignature) return;
      lastLiveSignature = signature;
      applyLiveSignals(nextSignals);
    };

    const onLiveSignal = (event) => {
      const next = normalizeLiveSignal(event?.detail);
      if (!next) return;
      setLiveSignals((current) => compactLiveSignals([...current, next]));
    };

    refreshLiveSignals();
    const intervalId = globalThis.setInterval?.(refreshLiveSignals, PERCORSO_MORPHIC_POLL_MS);
    globalThis.addEventListener?.('storage', refreshLiveSignals);
    globalThis.addEventListener?.(PERCORSO_MORPHIC_RUNTIME_EVENT, refreshLiveSignals);
    globalThis.addEventListener?.(PERCORSO_LIVE_SIGNAL_EVENT, onLiveSignal);

    return () => {
      cancelled = true;
      if (intervalId) globalThis.clearInterval?.(intervalId);
      globalThis.removeEventListener?.('storage', refreshLiveSignals);
      globalThis.removeEventListener?.(PERCORSO_MORPHIC_RUNTIME_EVENT, refreshLiveSignals);
      globalThis.removeEventListener?.(PERCORSO_LIVE_SIGNAL_EVENT, onLiveSignal);
    };
  }, [capitolo]);

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
        <p>{t('percorso_view.no_chapter')}</p>
      </div>
    );
  }

  const activeExp = capitolo.esperimenti?.[activeExpIndex] ?? null;
  const activePhase = activeExp?.phases?.[activePhaseIndex] ?? null;
  const docenteSidebarData = activePhase?.docente_sidebar ?? null;
  const activeMorphicHint = adaptPercorsoRender(runtimeMorphicContext, activeExp, capitolo);
  const introText = buildMorphicIntro(capitolo.narrative_flow?.intro_text, capitolo, activeMorphicHint);
  const closingText = buildMorphicClosing(capitolo.narrative_flow?.closing_text, capitolo, activeMorphicHint);
  const liveRegiaNextAction = buildLiveRegiaNextAction(liveSignals, capitolo, activeExp);
  const morphicOutputBudget = buildMorphicOutputBudget(activeMorphicHint, liveSignals, capitolo, activeExp);

  return (
    <div
      className={css.container}
      data-testid="percorso-morphic-root"
      data-morphic-instance={openingVariation.id}
      data-teacher-profile={activeMorphicHint.teacherProfile}
      data-class-kit={activeMorphicHint.kitLevel}
      data-session-state={activeMorphicHint.sessionState}
      data-rag-chapter-focus={activeMorphicHint.ragChapterFocus || ''}
      style={activeMorphicHint.cssVars}
    >
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
            <button type="button" className={css.closeBtn} onClick={onClose} aria-label={t('percorso_view.close')}>
              ×
            </button>
          )}
        </header>

        {/* iter 45 Andrea video2 + ADR-019 Sense 1.5 — Lezione personalizzata.
             Click → sendChat con context capitolo → unlim-chat (Mistral routing 70/20/10
             + onniscenza-bridge iter 24 LIVE) genera proposta adattata classe + storia. */}
        <section className={css.lezioneBox} aria-label={t('percorso_view.custom_lesson')}>
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
            <span aria-hidden="true" className={css.lessonIcon}><GraduationIcon /></span>
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

        <section
          className={css.morphicRuntimeCue}
          aria-label={t('percorso_view.path_adaptation')}
          data-testid="percorso-morphic-cue"
          data-transition-emphasis={activeMorphicHint.transitionEmphasis}
        >
          <span>{t('percorso_view.kit_ribbon')}</span>
          <span>{`Lessico ${activeMorphicHint.lexicalComplexity}`}</span>
          <span data-testid="morphic-example-count">{activeMorphicHint.esempiBaseCount}</span>
          <span data-testid="morphic-analogy-count">{activeMorphicHint.analogieCount}</span>
          <span data-testid="morphic-microsteps">{`Micro-step ${activeMorphicHint.microStepGranularity}`}</span>
          <span data-testid="morphic-live-variation">{openingVariation.text}</span>
        </section>

        <section className={css.liveRegiaPanel} aria-label={t('percorso_view.live_regia_aria')}>
          <div className={css.liveRegiaHeader}>
            <span className={css.liveRegiaTitle}>{t('percorso_view.live_regia_title')}</span>
            <span className={css.liveRegiaStatus}>
              {liveSignals.length > 0 ? 'contesto aula attivo' : 'in ascolto del contesto aula'}
            </span>
          </div>
          <div className={css.liveRegiaSignals} data-testid="percorso-live-regia">
            {liveSignals.length > 0 ? (
              liveSignals.map((signal) => (
                <span key={`${signal.label}-${signal.at}`} className={css.liveSignal}>
                  {signal.value ? `${signal.label}: ${signal.value}` : signal.label}
                </span>
              ))
            ) : (
              <span className={css.liveSignal}>nessun segnale live recente</span>
            )}
          </div>
          <div className={css.liveRegiaBudget} aria-label={t('percorso_view.morphic_budget')}>
            <span className={css.liveBudgetItem} data-testid="percorso-writing-budget">
              {morphicOutputBudget.writingLabel}
            </span>
            <span className={css.liveBudgetItem} data-testid="percorso-slide-budget">
              {morphicOutputBudget.slideLabel}
            </span>
          </div>
          <p className={css.liveRegiaAction} data-testid="percorso-live-next-action">
            {liveRegiaNextAction}
          </p>
        </section>

        {capitolo.theory?.testo_classe && (
          <section className={css.theorySection} aria-label={t('percorso_view.theory')}>
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

        {introText && (
          <section className={css.introSection}>
            <p className={css.introText}>{introText}</p>
          </section>
        )}

        {capitolo.esperimenti?.map((esp, idx) => {
          const transition = findTransitionFromPrev(capitolo, idx);
          const transitionToNext = findTransitionToNext(capitolo, idx);
          const transitionAlreadyShownBetweenCards = idx > 0 && findTransitionToNext(capitolo, idx - 1);
          const nextExperiment = resolveNextExperimentForCard(esp);
          const nextExperimentLabel = formatNextExperimentLabel(nextExperiment, capitolo);
          const nextExperimentPreview = getNextExperimentPreview(nextExperiment);
          const morphicHint = adaptPercorsoRender(runtimeMorphicContext, esp, capitolo);
          const incrementalHint =
            esp.build_circuit?.mode === 'incremental_from_prev'
              ? `Costruzione incremental partendo dal circuito precedente (${INCREMENTAL_LABEL[transition?.incremental_mode] ?? 'modifica'})`
              : null;

          return (
            <React.Fragment key={esp.id}>
              <article
                className={`${css.experimentSection} ${idx === activeExpIndex ? css.activeExp : ''}`}
                onClick={() => { setActiveExpIndex(idx); setActivePhaseIndex(0); }}
                aria-label={`Esperimento ${esp.num}: ${esp.title_classe}`}
              >
                {transition && !transitionAlreadyShownBetweenCards && (
                  <div className={css.transition}>
                    <span className={css.transitionLabel}>{t('percorso_view.transition')}</span>
                    <p className={css.transitionText}>{transition.text_classe}</p>
                  </div>
                )}

              <header className={css.expHeader}>
                <div className={css.expNum}>{t('percorso_view.experiment_num', { num: esp.num })}</div>
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
                  <div className={css.blockLabel}>{t('percorso_view.components')}</div>
                  <ul className={css.componentsList}>
                    {morphicHint.visibleComponents.map((c, i) => (
                      <li key={i} className={css.componentItem}>
                        {c.name} {c.quantity > 1 ? `× ${c.quantity}` : ''}
                      </li>
                    ))}
                  </ul>
                  {morphicHint.hiddenComponentsCount > 0 && (
                    <div
                      className={css.hiddenComponentsNote}
                      data-testid={`morphic-hidden-components-${esp.id}`}
                    >
                      {morphicHint.hiddenComponentsCount}
                    </div>
                  )}
                </div>
              )}

              {incrementalHint && (
                <div className={css.incrementalHint}>{incrementalHint}</div>
              )}

              {esp.phases?.length > 0 && (
                <div className={css.phasesBlock}>
                  <div className={css.blockLabel}>{t('percorso_view.phases')}</div>
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
              {idx < (capitolo.esperimenti?.length ?? 0) - 1 && (transitionToNext || nextExperimentLabel) && (
                <section
                  className={css.nextTransition}
                  data-testid={`percorso-next-transition-${esp.id}`}
                  aria-label={`Passaggio al prossimo esperimento da ${esp.title_classe}`}
                >
                  <span className={css.transitionLabel}>{t('percorso_view.next_step')}</span>
                  {transitionToNext?.text_classe && (
                    <p className={css.transitionText}>{transitionToNext.text_classe}</p>
                  )}
                  {nextExperimentLabel && (
                    <div className={css.nextExperimentPreview}>
                      <strong>{t('percorso_view.next_prefix')}</strong> {nextExperimentLabel}
                      {nextExperimentPreview && (
                        <p className={css.nextPreviewText}>{nextExperimentPreview}</p>
                      )}
                    </div>
                  )}
                </section>
              )}
            </React.Fragment>
          );
        })}

        {closingText && (
          <section className={css.closingSection}>
            <p className={css.closingText}>{closingText}</p>
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
