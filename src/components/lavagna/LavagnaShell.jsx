/**
 * LavagnaShell — Main shell for the ELAB Lavagna (digital whiteboard)
 * Assembles: AppHeader + simulator + FloatingToolbar + UnlimAdapter + RetractablePanel
 * Strangler Fig: wraps existing components without modifying them.
 * (c) Andrea Marro — 01/04/2026
 */

import React, { lazy, Suspense, useState, useCallback, useEffect, useRef, useMemo, useId } from 'react';
import { useAuth } from '../../context/AuthContext';
// Iter 44 wire-up: useSessionTracker per persistenza scritte sessione.
// Andrea iter 41+ feedback 2026-05-06: "Cronologia recente" homepage sempre
// vuota nonostante 4+ iter di "fix" (T1-001, T1-002, ADR-019 design, Bug 3
// unit test). Root cause: hook usato SOLO in UnlimWrapper (route #prova/auth
// tutor), MAI in LavagnaShell (#lavagna route principale). Senza wire-up
// `__ELAB_API.experimentChange` non innesca startSession + finaliseSession
// non scatta su Esci → saveSession Supabase mai chiamato → Cronologia void.
import { useSessionTracker } from '../../hooks/useSessionTracker';
import { getSavedSessions } from '../../hooks/useSessionTracker';
import { getLessonPath } from '../../data/lesson-paths';
import AppHeader from './AppHeader';
import FloatingToolbar from './FloatingToolbar';
import RetractablePanel from './RetractablePanel';
import UnlimAdapter from './UnlimAdapter';
import SessionReportComicModal from './SessionReportComicModal';
import VideoFloat from './VideoFloat';
import ExperimentPicker from './ExperimentPicker';
import { deriveState, computePanelActions, STATES } from './LavagnaStateManager';
import MascotPresence from './MascotPresence';
import ErrorToast from './ErrorToast';
import { soundTick, soundPlay, soundPause } from './lavagnaSounds';
import { buildClassProfile, getNextLessonSuggestion } from '../../services/classProfile';
import { getExpFromHash } from '../../utils/hashUtils';
import { HandWaveIcon, PartyIcon, FlaskIcon } from '../common/ElabIcons';
import useOverlayQueue, { markOverlayDismissed } from '../../hooks/useOverlayQueue';
import { isWakeWordSupported, startWakeWordListener, stopWakeWordListener } from '../../services/wakeWord';
import LessonReader from './LessonReader';
import LessonSelector from './LessonSelector';
import logger from '../../utils/logger';
import ErrorBoundary from '../common/ErrorBoundary';
// iter 45 (Andrea video 06/05/2026): rimosso import FloatingWindowCommon — Atom A5 iter 36
// Passo Passo via FloatingWindow LessonReader era duplicato sbagliato del vero
// ComponentDrawer step-by-step in NewElabSimulator. Vedi commento blocco render rimosso.
// Sprint S iter 2 Task B — Capitolo lookup service
import { getCapitolo, listAllCapitoli } from '../../services/percorsoService';
import { showToast as showToastSync } from '../common/Toast';
import { startApplicationNarrativeLoop, stopApplicationNarrativeLoop } from '../../services/unlimContextCollector';
// iter 38 Atom A11 + A12 (WebDesigner-1): pre-emptive UX nudges.
//   - MicPermissionNudge: chiede mic ai docenti PRIMA di entrare in Lavagna
//     così wake word "Ehi UNLIM" è caldo al primo uso (browser cache grant
//     per origin tra getUserMedia e SpeechRecognition).
//   - UpdatePrompt: toast plurale "Ragazzi, c'è una nuova versione…" quando
//     vite-plugin-pwa rileva nuovo SW (registerType:'prompt' → no auto-skip).
// Lazy-load: nessun footprint sul main chunk per docenti già autorizzati /
// senza aggiornamenti pending.
const MicPermissionNudge = lazy(() => import('../common/MicPermissionNudge.jsx'));
const UpdatePrompt = lazy(() => import('../common/UpdatePrompt.jsx'));
// ADR-025 iter 26 — Modalità 4 modes canonical UI (Percorso default + Passo Passo + Già Montato + Libero auto-Percorso)
import ModalitaSwitch from './ModalitaSwitch';
import css from './LavagnaShell.module.css';

const NewElabSimulator = lazy(() => import('../simulator/NewElabSimulator'));
const TeacherDashboard = lazy(() => import('../teacher/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../student/StudentDashboard'));
const VolumeViewer = lazy(() => import('./VolumeViewer'));
const PercorsoPanel = lazy(() => import('./PercorsoPanel'));
const DrawingOverlay = lazy(() => import('../simulator/canvas/DrawingOverlay'));
// Sprint S iter 2 Task B — lazy load Capitolo flow components
const CapitoloPicker = lazy(() => import('./CapitoloPicker'));
const PercorsoCapitoloView = lazy(() => import('./PercorsoCapitoloView'));

const DEFAULT_MODALITA_EXPERIMENT_ID = 'v1-cap6-esp1';

function getStoredClassKey() {
  if (typeof window === 'undefined') return 'classe-fumetto';
  try {
    return localStorage.getItem('elab-license-key') || 'classe-fumetto';
  } catch {
    return 'classe-fumetto';
  }
}

function ensureUnlimMountNamespace() {
  if (typeof window === 'undefined') return;
  const api = window.__ELAB_API;
  if (!api || typeof api.mountExperiment !== 'function') return;
  api.unlim = {
    ...(api.unlim || {}),
    mountExperiment: api.unlim?.mountExperiment || api.mountExperiment.bind(api),
  };
}

export function applyLoadedExperimentStateFromApi({
  api,
  experimentId,
  setCurrentExperiment,
  setExperimentName,
  setHasExperiment,
  setPickerOpen,
  setCapitoloPickerOpen,
  setBentornatiVisible,
  setCurrentVolume,
}) {
  if (!api || !experimentId || typeof api.loadExperiment !== 'function') return false;
  const loaded = api.loadExperiment(experimentId);
  if (!loaded) return false;

  const experiment =
    api.getCurrentExperiment?.()
    || api.getExperiment?.(experimentId)
    || { id: experimentId };

  if (experiment?.id) setCurrentExperiment?.(experiment);
  setExperimentName?.(experiment?.title || experimentId);
  setHasExperiment?.(true);
  setPickerOpen?.(false);
  setCapitoloPickerOpen?.(false);
  setBentornatiVisible?.(false);

  const volMatch = experimentId.match(/^v(\d)/);
  if (volMatch) setCurrentVolume?.(Number(volMatch[1]));

  return true;
}

function getFumettoSessionEvidenceScore(session) {
  const messages = Array.isArray(session?.messages) ? session.messages.length : 0;
  const errors = Array.isArray(session?.errors) ? session.errors.length : 0;
  const actions = Array.isArray(session?.actions)
    ? session.actions.filter((action) => action?.type !== 'experiment_loaded').length
    : 0;
  const completed = Array.isArray(session?.experimentsCompleted) ? session.experimentsCompleted.length : 0;
  const journey = session?.studentJourney && typeof session.studentJourney === 'object'
    ? Object.keys(session.studentJourney).length
    : 0;
  return (messages * 8) + (errors * 6) + (journey * 5) + (completed * 3) + actions;
}

function getRuntimeFumettoSession({ currentExperiment, experimentName, initialExperimentId }) {
  const experimentId = currentExperiment?.id || initialExperimentId || getExpFromHash() || 'v1-cap6-esp1';
  const savedSessions = getSavedSessions();
  const matchingSessions = [...savedSessions]
    .reverse()
    .filter((session) => session.experimentId === experimentId);
  const saved = matchingSessions
    .map((session, index) => ({ session, index, score: getFumettoSessionEvidenceScore(session) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.session
    || null;
  const lessonPath = getLessonPath(experimentId);
  const now = new Date().toISOString();
  const startedAt = saved?.startedAt || saved?.startTime || now;
  const endedAt = saved?.endedAt || saved?.endTime || now;
  const componentsUsed = Array.isArray(lessonPath?.components_needed)
    ? lessonPath.components_needed.map((component) => component.name).filter(Boolean)
    : [];
  const sessionMistakes = Array.isArray(saved?.errors)
    ? saved.errors.map((error) => ({
        type: error.type || 'other',
        description: error.detail || error.type || 'errore osservato sul kit fisico',
        atSec: undefined,
      }))
    : [];
  const assistantText = Array.isArray(saved?.messages)
    ? [...saved.messages].reverse().find((message) => message.role === 'assistant' && message.text)?.text
    : null;
  const fallbackCompletedExperiment = {
    id: experimentId,
    title: lessonPath?.title || currentExperiment?.title || experimentName || experimentId,
    volume: lessonPath?.volume,
  };
  const savedCompleted = Array.isArray(saved?.experimentsCompleted)
    ? saved.experimentsCompleted.filter((experiment) => experiment?.id)
    : [];
  const experimentsCompleted = savedCompleted.length > 0
    ? [
        ...savedCompleted,
        ...(savedCompleted.some((experiment) => experiment.id === experimentId)
          ? []
          : [fallbackCompletedExperiment]),
      ]
    : [fallbackCompletedExperiment];
  const savedJourney = saved?.studentJourney && typeof saved.studentJourney === 'object'
    ? saved.studentJourney
    : {};
  const mistakesMade = Array.isArray(savedJourney.mistakesMade) && savedJourney.mistakesMade.length > 0
    ? savedJourney.mistakesMade
    : sessionMistakes;
  const variationsTriedSpontaneously = Array.isArray(savedJourney.variationsTriedSpontaneously)
    ? savedJourney.variationsTriedSpontaneously
    : (Array.isArray(saved?.actions)
        ? saved.actions.map((action) => action.detail).filter(Boolean).slice(0, 3)
        : []);
  const helpRequestsCount = Number.isFinite(savedJourney.helpRequestsCount)
    ? savedJourney.helpRequestsCount
    : (Array.isArray(saved?.messages)
        ? saved.messages.filter((message) => message.role === 'user').length
        : 0);

  return {
    ...saved,
    studentAlias: saved?.studentAlias || 'Classe ELAB',
    classKey: saved?.classKey || getStoredClassKey(),
    startedAt,
    endedAt,
    savedAt: now,
    experimentsCompleted,
    componentsUsed: Array.isArray(saved?.componentsUsed) && saved.componentsUsed.length > 0
      ? saved.componentsUsed
      : componentsUsed,
    narrations: {
      ...(saved?.narrations || {}),
      ...(assistantText ? { [experimentId]: assistantText } : {}),
    },
    studentJourney: {
      ...savedJourney,
      mistakesMade,
      mistakesOvercome: Array.isArray(savedJourney.mistakesOvercome) ? savedJourney.mistakesOvercome : [],
      variationsTriedSpontaneously,
      helpRequestsCount,
    },
    next_experiment: lessonPath?.next_experiment || null,
  };
}
const DRAWING_SYNC_ENABLED = import.meta.env.VITE_ENABLE_DRAWING_SYNC === 'true';
const PERCORSO_SESSION_STATES = ['intro', 'costruzione', 'verifica', 'report'];

function readPercorsoSessionState() {
  try {
    const value = window.localStorage?.getItem?.('elab-percorso-session-state');
    return PERCORSO_SESSION_STATES.includes(value) ? value : 'intro';
  } catch {
    return 'intro';
  }
}

// Component quick-add buttons for left panel (uses __ELAB_API)
// Realistic component icons — recognizable by a 10-year-old
// SVG gradients use scoped IDs to avoid global DOM namespace collisions
function buildQuickComponents(prefix, volumeNumber = 3) {
  // All components with volume availability — filtered by current volume
  const ALL_COMPONENTS = [
    // ── Volume 1: Le Basi ──
    { type: 'led', label: 'LED', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ledDome`} cx="40%" cy="35%"><stop offset="0%" stopColor="#a4e65e" /><stop offset="60%" stopColor="var(--elab-lime)" /><stop offset="100%" stopColor="#2d5a10" /></radialGradient></defs>
        <ellipse cx="14" cy="10" rx="6" ry="8" fill={`url(#${prefix}ledDome)`} />
        <ellipse cx="14" cy="10" rx="6" ry="8" fill="none" stroke="var(--elab-hex-3a6a1a)" strokeWidth="0.5" />
        <ellipse cx="11.5" cy="7" rx="2" ry="3" fill="rgba(255,255,255,0.4)" />
        <rect x="8" y="17" width="12" height="2" rx="0.5" fill="#bbb" stroke="#999" strokeWidth="0.5" />
        <path d="M10 19v5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M18 19v7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <text x="19.5" y="27" fontSize="5" fill="#999" fontFamily="sans-serif">+</text>
      </svg>
    )},
    { type: 'resistor', label: 'Resistore', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M2 14h6M20 14h6" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <defs><linearGradient id={`${prefix}resBody`} x1="8" y1="9" x2="8" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--elab-hex-e8d5b0)" /><stop offset="50%" stopColor="var(--elab-hex-d4b896)" /><stop offset="100%" stopColor="var(--elab-hex-c4a87a)" /></linearGradient></defs>
        <rect x="8" y="9" width="12" height="10" rx="2" fill={`url(#${prefix}resBody)`} stroke="var(--elab-hex-a08a60)" strokeWidth="0.5" />
        <rect x="10" y="9" width="1.5" height="10" rx="0.3" fill="var(--elab-hex-8b4513)" />
        <rect x="13" y="9" width="1.5" height="10" rx="0.3" fill="#222" />
        <rect x="16" y="9" width="1.5" height="10" rx="0.3" fill="var(--elab-red)" />
        <rect x="18.5" y="9" width="1" height="10" rx="0.3" fill="var(--elab-hex-c5a33e)" />
      </svg>
    )},
    { type: 'push-button', label: 'Pulsante', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="6" y="10" width="16" height="10" rx="2" fill="#333" stroke="#222" strokeWidth="0.5" />
        <defs><radialGradient id={`${prefix}btnCap`} cx="45%" cy="40%"><stop offset="0%" stopColor="var(--elab-orange)" /><stop offset="100%" stopColor="#c07010" /></radialGradient></defs>
        <circle cx="14" cy="12" r="4" fill={`url(#${prefix}btnCap)`} />
        <circle cx="13" cy="11" r="1.2" fill="rgba(255,255,255,0.3)" />
        <path d="M8 20v4M12 20v4M16 20v4M20 20v4" stroke="#999" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'battery9v', label: 'Batteria 9V', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="16" height="18" rx="2" fill="var(--elab-navy)" stroke="#153d6e" strokeWidth="0.5" />
        <text x="14" y="17" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">9V</text>
        <rect x="9" y="3" width="3" height="4" rx="1" fill="#666" />
        <rect x="16" y="4" width="3" height="3" rx="1" fill="#666" />
        <text x="10.5" y="3" textAnchor="middle" fontSize="5" fill="var(--elab-red)" fontFamily="sans-serif">+</text>
        <text x="17.5" y="3.5" textAnchor="middle" fontSize="6" fill="#333" fontFamily="sans-serif">-</text>
      </svg>
    )},
    { type: 'potentiometer', label: 'Potenziometro', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="4" y="7" width="20" height="14" rx="2" fill="var(--elab-hex-2980b9)" stroke="var(--elab-hex-1a6fa0)" strokeWidth="0.5" />
        <defs><radialGradient id={`${prefix}potKnob`} cx="45%" cy="38%"><stop offset="0%" stopColor="var(--elab-hex-f0f0f0)" /><stop offset="60%" stopColor="#ccc" /><stop offset="100%" stopColor="#888" /></radialGradient></defs>
        <circle cx="14" cy="14" r="6" fill={`url(#${prefix}potKnob)`} stroke="#777" strokeWidth="0.5" />
        <circle cx="13" cy="12" r="1.5" fill="rgba(255,255,255,0.5)" />
        <path d="M14 8v4" stroke="#444" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 21v3M14 21v3M20 21v3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'buzzer-piezo', label: 'Buzzer', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="13" r="8" fill="#222" stroke="#111" strokeWidth="0.5" />
        <circle cx="14" cy="13" r="6" fill="#333" />
        <circle cx="14" cy="13" r="1.5" fill="#111" />
        <text x="14" y="6" textAnchor="middle" fontSize="5" fill="var(--elab-red)" fontWeight="bold" fontFamily="sans-serif">+</text>
        <path d="M10 21v3M18 21v3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'photo-resistor', label: 'LDR', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ldrBody`} cx="50%" cy="40%"><stop offset="0%" stopColor="var(--elab-hex-d4a574)" /><stop offset="100%" stopColor="var(--elab-hex-8b6914)" /></radialGradient></defs>
        <circle cx="14" cy="12" r="7" fill={`url(#${prefix}ldrBody)`} stroke="var(--elab-hex-7a5a10)" strokeWidth="0.5" />
        <path d="M14 5.5c1.5 0 2.5 1.2 2.5 2.8s-1 2.8-2.5 2.8-2.5-1.2-2.5-2.8S12.5 5.5 14 5.5z" fill="var(--elab-hex-a07830)" stroke="var(--elab-hex-7a5a10)" strokeWidth="0.3" />
        <path d="M10 19v5M18 19v5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M3 6l3 3M3 3l2 2" stroke="var(--elab-orange)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'reed-switch', label: 'Interruttore Reed', vol: 1, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="18" height="8" rx="4" fill="none" stroke="#999" strokeWidth="1" />
        <path d="M8 14h4M16 14h4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12.5" cy="14" r="1" fill="#666" />
        <circle cx="15.5" cy="14" r="1" fill="#666" />
        <path d="M2 14h3M23 14h3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    // ── Volume 2: Approfondiamo ──
    { type: 'capacitor', label: 'Condensatore', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M14 2v7M14 19v7" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <defs><linearGradient id={`${prefix}capBody`} x1="7" y1="9" x2="21" y2="9" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--elab-hex-2a6496)" /><stop offset="40%" stopColor="var(--elab-hex-3498db)" /><stop offset="100%" stopColor="var(--elab-hex-2472a4)" /></linearGradient></defs>
        <rect x="7" y="9" width="14" height="10" rx="2" fill={`url(#${prefix}capBody)`} stroke="var(--elab-hex-1a5276)" strokeWidth="0.5" />
        <rect x="7" y="9" width="3" height="10" rx="1" fill="var(--elab-hex-1a3a5c)" opacity="0.5" />
        <text x="18" y="8" fontSize="6" fill="var(--elab-red)" fontFamily="sans-serif">+</text>
      </svg>
    )},
    { type: 'motor-dc', label: 'Motore DC', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}motorBody`} x1="5" y1="7" x2="23" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#bbb" /><stop offset="50%" stopColor="#ddd" /><stop offset="100%" stopColor="#aaa" /></linearGradient></defs>
        <rect x="5" y="7" width="18" height="14" rx="3" fill={`url(#${prefix}motorBody)`} stroke="#888" strokeWidth="0.5" />
        <rect x="23" y="12" width="4" height="4" rx="1" fill="#888" />
        <text x="14" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#555" fontFamily="sans-serif">M</text>
        <path d="M8 21v3M18 21v3" stroke="var(--elab-red)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'diode', label: 'Diodo', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M2 14h8M18 14h8" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10 8l8 6-8 6V8z" fill="#333" stroke="#222" strokeWidth="0.5" />
        <path d="M18 8v12" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )},
    { type: 'mosfet-n', label: 'MOSFET N', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="7" y="5" width="14" height="18" rx="2" fill="#333" stroke="#222" strokeWidth="0.5" />
        <text x="14" y="16" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold" fontFamily="sans-serif">N</text>
        <path d="M4 10h3M4 18h3M21 14h3" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <text x="3" y="9" fontSize="5" fill="#666" fontFamily="sans-serif">G</text>
        <text x="3" y="22" fontSize="5" fill="#666" fontFamily="sans-serif">S</text>
        <text x="24" y="13" fontSize="5" fill="#666" fontFamily="sans-serif">D</text>
      </svg>
    )},
    { type: 'phototransistor', label: 'Fototransistore', vol: 2, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}ptBody`} cx="50%" cy="40%"><stop offset="0%" stopColor="var(--elab-hex-e0e8ef)" /><stop offset="100%" stopColor="var(--elab-hex-8899aa)" /></radialGradient></defs>
        <circle cx="14" cy="13" r="7" fill={`url(#${prefix}ptBody)`} stroke="var(--elab-hex-667788)" strokeWidth="0.5" />
        <circle cx="14" cy="13" r="3" fill="var(--elab-hex-334455)" />
        <path d="M10 20v4M18 20v4" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M3 6l3 3M3 3l2 2" stroke="var(--elab-orange)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    // ── Volume 3: Arduino ──
    { type: 'nano-r4', label: 'Arduino Nano', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}nanoBoard`} x1="4" y1="4" x2="4" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--elab-hex-008080)" /><stop offset="100%" stopColor="var(--elab-hex-005555)" /></linearGradient></defs>
        <rect x="4" y="4" width="20" height="20" rx="2" fill={`url(#${prefix}nanoBoard)`} stroke="var(--elab-hex-004040)" strokeWidth="0.5" />
        <rect x="10" y="2" width="8" height="4" rx="1" fill="#888" stroke="#666" strokeWidth="0.5" />
        <rect x="8" y="10" width="12" height="6" rx="1" fill="#222" />
        <text x="14" y="15" textAnchor="middle" fontSize="5" fill="#0f0" fontFamily="monospace">NANO</text>
        {Array.from({length: 7}, (_, i) => <circle key={`l${i}`} cx={6} cy={6 + i * 2.5} r="0.8" fill="var(--elab-hex-c5a33e)" />)}
        {Array.from({length: 7}, (_, i) => <circle key={`r${i}`} cx={22} cy={6 + i * 2.5} r="0.8" fill="var(--elab-hex-c5a33e)" />)}
      </svg>
    )},
    { type: 'servo', label: 'Servo', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><linearGradient id={`${prefix}servoBody`} x1="3" y1="8" x2="3" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="var(--elab-hex-4488cc)" /><stop offset="100%" stopColor="var(--elab-hex-2266aa)" /></linearGradient></defs>
        <rect x="3" y="8" width="22" height="14" rx="2" fill={`url(#${prefix}servoBody)`} stroke="var(--elab-hex-1a5276)" strokeWidth="0.5" />
        <circle cx="20" cy="15" r="3.5" fill="#ddd" stroke="#999" strokeWidth="0.5" />
        <path d="M20 15l-2 -5h4z" fill="#fff" stroke="#999" strokeWidth="0.5" />
        <path d="M6 8v-3M10 8v-3M14 8v-3" stroke="var(--elab-red)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )},
    { type: 'lcd16x2', label: 'LCD 16x2', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="2" y="6" width="24" height="16" rx="2" fill="var(--elab-hex-2d8b2d)" stroke="var(--elab-hex-1a6b1a)" strokeWidth="0.5" />
        <rect x="4" y="8" width="20" height="12" rx="1" fill="var(--elab-hex-90ee90)" stroke="var(--elab-hex-60c060)" strokeWidth="0.5" />
        <text x="14" y="14" textAnchor="middle" fontSize="4" fill="#333" fontFamily="monospace">Hello!</text>
        <text x="14" y="18" textAnchor="middle" fontSize="4" fill="#333" fontFamily="monospace">ELAB</text>
      </svg>
    )},
    { type: 'rgb-led', label: 'LED RGB', vol: 3, icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <defs><radialGradient id={`${prefix}rgbDome`} cx="40%" cy="35%"><stop offset="0%" stopColor="#fff" /><stop offset="30%" stopColor="#eef" /><stop offset="100%" stopColor="#aab" /></radialGradient></defs>
        <ellipse cx="14" cy="10" rx="6" ry="8" fill={`url(#${prefix}rgbDome)`} />
        <ellipse cx="14" cy="10" rx="6" ry="8" fill="none" stroke="#889" strokeWidth="0.5" />
        <circle cx="11" cy="9" r="2" fill="var(--elab-red)" opacity="0.5" />
        <circle cx="17" cy="9" r="2" fill="var(--elab-hex-2563eb)" opacity="0.5" />
        <circle cx="14" cy="12" r="2" fill="var(--elab-hex-16a34a)" opacity="0.5" />
        <rect x="8" y="17" width="12" height="2" rx="0.5" fill="#bbb" stroke="#999" strokeWidth="0.5" />
        <path d="M9 19v5M12 19v5M16 19v5M19 19v5" stroke="#999" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
    )},
  ];

  return ALL_COMPONENTS.filter(c => c.vol <= volumeNumber);
}

function QuickComponentPanel({ volumeNumber = 3 }) {
  const svgPrefix = useId().replace(/:/g, '') + '_';
  const allComponents = useMemo(() => buildQuickComponents(svgPrefix, volumeNumber), [svgPrefix, volumeNumber]);
  const [showAll, setShowAll] = useState(false);

  // Get component types used in current experiment
  const experimentTypes = useMemo(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    const exp = api?.getActiveExperiment?.();
    if (!exp?.components) return null;
    return new Set(exp.components.map(c => c.type));
  }, []);

  // Filter to experiment components unless "Mostra tutti" is active
  const components = useMemo(() => {
    if (showAll || !experimentTypes || experimentTypes.size === 0) return allComponents;
    return allComponents.filter(c => experimentTypes.has(c.type));
  }, [allComponents, experimentTypes, showAll]);

  const handleAdd = useCallback((type) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.addComponent) {
      api.addComponent(type, { x: 200 + Math.random() * 100, y: 150 + Math.random() * 80 });
      soundTick();
    }
  }, []);

  const hasFilter = experimentTypes && experimentTypes.size > 0 && !showAll;

  return (
    <div className={css.quickComponents}>
      <div className={css.panelTitle}>Componenti</div>
      <div className={css.componentGrid}>
        {components.map(c => (
          <button
            key={c.type}
            className={css.componentBtn}
            onClick={() => handleAdd(c.type)}
            aria-label={'Aggiungi ' + c.label}
          >
            <span style={{ flexShrink: 0, width: 28, height: 28 }}>{c.icon}</span>
            <span className={css.componentLabel}>{c.label}</span>
          </button>
        ))}
      </div>
      {experimentTypes && experimentTypes.size > 0 && (
        <button
          className={css.showAllBtn}
          onClick={() => setShowAll(s => !s)}
          aria-label={showAll ? 'Mostra solo componenti esperimento' : 'Mostra tutti i componenti'}
        >
          {showAll ? 'Solo esperimento' : 'Mostra tutti'}
        </button>
      )}
    </div>
  );
}

/**
 * BentornatiOverlay — Principio Zero welcome screen.
 * When the teacher opens ELAB, UNLIM proposes the next experiment
 * based on past sessions. No choices needed. 30 seconds to teaching.
 * Claude web andrea marro — 11/04/2026
 */
function BentornatiOverlay({ visible, onStart, onPickExperiment }) {
  const dataRef = useRef(null);
  if (!dataRef.current) {
    dataRef.current = {
      profile: buildClassProfile(),
      suggestion: getNextLessonSuggestion(),
    };
  }
  const { profile, suggestion } = dataRef.current;

  if (!visible) return null;

  // First-time flow
  if (profile.isFirstTime) {
    return (
      <div className={css.bentornatiOverlay}>
        <div className={css.bentornatiCard}>
          <div className={css.bentornatiIconWrap}>
            <HandWaveIcon size={32} />
          </div>
          <h2 className={css.bentornatiTitle}>Benvenuti!</h2>
          <p className={css.bentornatiMessage}>
            Pronti per il primo esperimento?
          </p>
          <p className={css.bentornatiNext}>
            <strong>{suggestion?.title || 'Accendi il tuo primo LED'}</strong>
          </p>
          <button className={css.bentornatiBtn} onClick={() => onStart(suggestion)}>
            <FlaskIcon size={22} /> Inizia
          </button>
        </div>
      </div>
    );
  }

  // Returning with a suggested next experiment
  if (suggestion) {
    return (
      <div className={css.bentornatiOverlay}>
        <div className={css.bentornatiCard}>
          <div className={css.bentornatiIconWrap}>
            <PartyIcon size={32} />
          </div>
          <h2 className={css.bentornatiTitle}>Bentornati!</h2>
          <p className={css.bentornatiMessage}>
            L'ultima volta: <em>&ldquo;{profile.lastExperimentTitle}&rdquo;</em>
          </p>
          <p className={css.bentornatiNext}>
            Oggi: <strong>{suggestion.title}</strong>
          </p>
          <button className={css.bentornatiBtn} onClick={() => onStart(suggestion)}>
            <FlaskIcon size={22} /> Inizia
          </button>
          <button className={css.bentornatiAlt} onClick={onPickExperiment}>
            Scegli un altro esperimento
          </button>
        </div>
      </div>
    );
  }

  // Returning but no suggestion (end of curriculum or no next_suggested)
  return (
    <div className={css.bentornatiOverlay}>
      <div className={css.bentornatiCard}>
        <div className={css.bentornatiIconWrap}>
          <PartyIcon size={32} />
        </div>
        <h2 className={css.bentornatiTitle}>Bentornati!</h2>
        <p className={css.bentornatiMessage}>
          Pronti a continuare? Scegliete l'esperimento di oggi!
        </p>
        <button className={css.bentornatiBtn} onClick={onPickExperiment}>
          Scegli esperimento
        </button>
      </div>
    </div>
  );
}

export default function LavagnaShell({ initialExperimentId } = {}) {
  // iter 27 P0 SURGICAL FIX (Agent X 94/94 esperimenti BROKEN evidence brutale):
  // Accept initialExperimentId prop from App.jsx #lavagna route deep-link `?exp=<id>`.
  // Wired in useEffect mount polling __ELAB_API ready below.
  const { user, isDocente, isStudente } = useAuth();
  // Iter 44 persistenza scritte: hook self-wires su __ELAB_API.experimentChange
  // (auto-startSession + recordAction 'experiment_loaded') + beforeunload +
  // visibilitychange (auto-finaliseSession + saveSession Supabase). Solo
  // invocazione qui basta a popolare Cronologia recente HomePage.
  const sessionTracker = useSessionTracker();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('elab_lavagna_active_tab');
      return ['lavagna', 'lezione', 'classe', 'progressi'].includes(saved) ? saved : 'lavagna';
    } catch { return 'lavagna'; }
  });
  const [activeTool, setActiveTool] = useState('select');
  const [toolToast, setToolToast] = useState(null);
  const [unlimOpen, setUnlimOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(false);
  const [fumettoSession, setFumettoSession] = useState(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [experimentName, setExperimentName] = useState('Scegli un esperimento...');
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lavagnaState, setLavagnaState] = useState(STATES.CLEAN);
  const [hasExperiment, setHasExperiment] = useState(false);
  // Homepage "Lavagna libera" launchMode='solo': scope hard = lavagna bianca + UNLIM.
  // Nessun percorso verso esperimenti, componenti, breadboard, manuale, capitoli,
  // videolezioni o fumetto. Il Tutor completo resta su #tutor/#lavagna normale.
  // iter 45 review fix F-4.1.a (architect): consume + clear flag al primo read
  // così click "Lavagna libera" attiva freeMode SOLO per quella sessione, non
  // perpetuamente. Senza clear, ogni successiva visita #lavagna restava bloccata
  // in freeMode finché cache pulita. Pattern read-once safe legacy migration-friendly.
  //
  // iter 32 M8 code-review fix React 19 strict-mode:
  // useState initializer è PURE READ-ONLY (NO side effects). Side effects (localStorage.remove + delete window prop)
  // moved to useEffect con freeModeConsumeRef one-shot guard. React 19 strict-mode safe (double-invoke initializer
  // returna identical value senza mutazione globale state).
  const [freeMode, setFreeMode] = useState(() => {
    try {
      const rawHash = window.location.hash.replace('#', '').split('?')[0].toLowerCase();
      if (rawHash === 'lavagna-solo') return true;
      if (window.__ELAB_LAVAGNA_LAUNCH_MODE === 'solo') return true;
      const flag = window.localStorage.getItem('elab_lavagna_launch_mode');
      if (flag === 'solo') return true;
      return false;
    } catch { return false; }
  });
  const freeModeConsumeRef = useRef(false);
  useEffect(() => {
    if (freeModeConsumeRef.current) return;
    freeModeConsumeRef.current = true;
    if (freeMode) {
      // Side-effect contained: consume flags post-mount (React 19 strict-mode safe via ref guard).
      try { window.localStorage.removeItem('elab_lavagna_launch_mode'); } catch { /* noop */ }
      try {
        if (typeof window.__ELAB_LAVAGNA_LAUNCH_MODE !== 'undefined') {
          try { delete window.__ELAB_LAVAGNA_LAUNCH_MODE; } catch { window.__ELAB_LAVAGNA_LAUNCH_MODE = null; }
        }
      } catch { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps — one-shot consume on mount only
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [lessonSteps, setLessonSteps] = useState([]);
  const [unlimSpeaking, setUnlimSpeaking] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-left-panel') || '180', 10) || 180; } catch { return 180; }
  });
  const [bottomPanelSize, setBottomPanelSize] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-bottom-panel') || '200', 10) || 200; } catch { return 200; }
  });
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-volume') || '1', 10) || 1; } catch { return 1; }
  });
  const [currentVolumePage, setCurrentVolumePage] = useState(() => {
    try { return parseInt(localStorage.getItem('elab-lavagna-page') || '1', 10) || 1; } catch { return 1; }
  });
  const [percorsoOpen, setPercorsoOpen] = useState(false);
  // Sprint S iter 2 Task B — Capitolo (Modalita Percorso Capitolo)
  const [capitoloPickerOpen, setCapitoloPickerOpen] = useState(false);
  const [activeCapitoloId, setActiveCapitoloId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState('v1-accendi-led');
  const [unlimTab, setUnlimTab] = useState('chat'); // 'chat' | 'percorso'
  const [buildMode, setBuildMode] = useState(() => {
    try {
      const v = localStorage.getItem('elab-lavagna-buildmode');
      return ['complete', 'guided', 'sandbox'].includes(v) ? v : 'complete';
    } catch { return 'complete'; }
  }); // complete | guided | sandbox
  // ADR-025 iter 26 — modalità canonical 4 modes (Percorso default, Passo Passo, Già Montato, Libero)
  // Default 'percorso' (NOT 'libero'). Libero auto-mounts Percorso (NON sandbox vuoto).
  // iter 36 Atom A4 fix — H4 mitigation: migrate stale legacy values (e.g. 'guida-da-errore'
  // removed iter 26) to canonical 'percorso'. Without this, a docente che aveva selezionato
  // un mode legacy in iter <26 vedeva localStorage stale → re-mount restava su valore
  // invalid filtered out → setModalita default 'percorso' attivo MA bottone non mostrato attivo
  // perché il browser ricaricava su modalità non più rendered. Forziamo cleanup al mount.
  const [modalita, setModalita] = useState(() => {
    const CANONICAL = ['percorso', 'passo-passo', 'gia-montato'];
    const MIGRATED_TO_PERCORSO = ['libero', 'guida-da-errore'];
    try {
      const v = localStorage.getItem('elab-lavagna-modalita');
      if (CANONICAL.includes(v)) return v;
      // Stale or unknown value (legacy 'guida-da-errore', 'complete', 'guided', 'sandbox', null)
      // → reset localStorage + default to 'percorso' canonical default.
      if (v != null) {
        try { localStorage.removeItem('elab-lavagna-modalita'); } catch {}
      }
      return 'percorso';
    } catch { return 'percorso'; }
  });
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [bentornatiVisible, setBentornatiVisible] = useState(() => {
    try { return localStorage.getItem('elab_skip_bentornati') !== 'true'; } catch { return true; }
  });
  // Sprint T iter 28 — wake-word toggle (default ON; gated by browser support).
  // Persisted across sessions via localStorage so docente disabled state sticks.
  const [wakeWordEnabled, setWakeWordEnabled] = useState(() => {
    try { return localStorage.getItem('elab-lavagna-wake-word') !== 'off'; } catch { return true; }
  });
  const [wakeWordActive, setWakeWordActive] = useState(false);

  // Codex MED#1 fix (Phase 1 sub-iter 83.6): derive + persist sessionState morfico per ModalitaSwitch cue.
  // Mappa stato lavagna → fase canonica: intro (default), costruzione (mode=passo-passo/libero/gia-montato attivo).
  // Persiste in localStorage 'elab-percorso-session-state' per consumare adapter percorsoMorphicAdapter.
  const [storedPercorsoSessionState, setStoredPercorsoSessionState] = useState(readPercorsoSessionState);
  const derivedSessionState = React.useMemo(() => {
    if (typeof modalita === 'string' && (modalita === 'passo-passo' || modalita === 'libero' || modalita === 'gia-montato')) return 'costruzione';
    return PERCORSO_SESSION_STATES.includes(storedPercorsoSessionState) ? storedPercorsoSessionState : 'intro';
  }, [modalita, storedPercorsoSessionState]);
  React.useEffect(() => {
    try { window.localStorage?.setItem?.('elab-percorso-session-state', derivedSessionState); } catch { /* noop */ }
    setStoredPercorsoSessionState((current) => (current === derivedSessionState ? current : derivedSessionState));
  }, [derivedSessionState]);
  // F2.B: serializzazione primo-accesso. ConsentBanner (se presente) ha
  // priorità su Bentornati/Picker. ExperimentPicker parte ultimo.
  const bentornatiAllowed = useOverlayQueue('bentornati');
  const pickerAllowed = useOverlayQueue('picker');

  const ensureDefaultExperimentForMode = useCallback((api) => {
    if (!api) return false;
    try {
      if (api.getCurrentExperiment?.()) return true;
    } catch { /* noop */ }
    try {
      const loaded = api.loadExperiment?.(DEFAULT_MODALITA_EXPERIMENT_ID);
      if (loaded) {
        const exp = api.getExperiment?.(DEFAULT_MODALITA_EXPERIMENT_ID);
        setExperimentName(exp?.title || 'Accendi il tuo primo LED');
        setHasExperiment(true);
        setBentornatiVisible(false);
        setPickerOpen(false);
        setCurrentVolume(1);
        return true;
      }
    } catch { /* noop */ }
    return false;
  }, []);

  // Refs for wake-word callback — avoid re-mounting listener on state change.
  // The wakeWord service holds module-level singleton state, so re-mounting
  // would risk double-listener leaks. Refs read latest values without redep.
  const unlimOpenRef = useRef(unlimOpen);
  useEffect(() => { unlimOpenRef.current = unlimOpen; }, [unlimOpen]);
  const lastWakeAtRef = useRef(0);

  useEffect(() => {
    startApplicationNarrativeLoop({ intervalMs: 15000, includeVisual: true });
    return () => stopApplicationNarrativeLoop();
  }, []);

  // Persist wake-word toggle preference
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-wake-word', wakeWordEnabled ? 'on' : 'off'); } catch {}
  }, [wakeWordEnabled]);

  useEffect(() => {
    if (freeMode) return;
    try {
      const rawHash = window.location.hash.replace('#', '').split('?')[0].toLowerCase();
      if (rawHash === 'lavagna-solo') {
        try { window.localStorage.removeItem('elab_lavagna_launch_mode'); } catch { /* noop */ }
        setFreeMode(true);
        return;
      }
      if (window.__ELAB_LAVAGNA_LAUNCH_MODE === 'solo') {
        try { delete window.__ELAB_LAVAGNA_LAUNCH_MODE; } catch { window.__ELAB_LAVAGNA_LAUNCH_MODE = null; }
        try { window.localStorage.removeItem('elab_lavagna_launch_mode'); } catch { /* noop */ }
        setFreeMode(true);
        return;
      }
      if (window.localStorage.getItem('elab_lavagna_launch_mode') === 'solo') {
        window.localStorage.removeItem('elab_lavagna_launch_mode');
        setFreeMode(true);
      }
    } catch { /* noop */ }
  }, [freeMode]);

  useEffect(() => {
    const onLaunchMode = (event) => {
      if (event?.detail?.mode !== 'solo') return;
      try { delete window.__ELAB_LAVAGNA_LAUNCH_MODE; } catch { window.__ELAB_LAVAGNA_LAUNCH_MODE = null; }
      try { window.localStorage.removeItem('elab_lavagna_launch_mode'); } catch { /* noop */ }
      setFreeMode(true);
    };
    window.addEventListener('elab-lavagna-launch-mode', onLaunchMode);
    return () => window.removeEventListener('elab-lavagna-launch-mode', onLaunchMode);
  }, []);

  useEffect(() => {
    if (!freeMode) return;
    setUnlimOpen(false);
    setUnlimTab('chat');
    setPickerOpen(false);
    setCapitoloPickerOpen(false);
    setActiveCapitoloId(null);
    setBentornatiVisible(false);
    setVideoOpen(false);
  }, [freeMode]);

  /**
   * Sprint T iter 28 — "Ehi UNLIM" wake-word lifecycle wired to LavagnaShell.
   *
   * Behaviour:
   *   - Mounts a single SpeechRecognition listener on Lavagna entry.
   *   - On wake detection: opens UNLIM (no-op if already open) + shows feedback.
   *   - Debounces multiple sequential wakes within 1500ms (avoids re-trigger spam).
   *   - On unmount or toggle-off: stops listener + cleans state.
   *
   * Honest caveats (JSDoc, NOT marketing):
   *   1. WebSpeech API supported only on Chrome/Edge (not Firefox/Safari).
   *      Graceful skip with logger warn — feature absent, no error thrown.
   *   2. Italian phonetic detection delegated to wakeWord.js WAKE_PHRASES list
   *      (11 variants incl. "ehi unlim", "hey unlim", "ei unlim"). False
   *      positives possible on similar-sounding speech (ESEMPIO: "ehi anna" può
   *      essere parsed come "ehi un...") — accepted trade-off for accessibility.
   *   3. Debouncing is timestamp-based (1.5s) — protects against double-detect
   *      from interim results, NOT a hard mutex. Concurrent wakes from two
   *      LavagnaShell instances (impossibile in pratica, single-page app) NON
   *      sono gestiti.
   *   4. PZ V3 mandate: wake-word ATTIVO solo dentro LavagnaShell mount lifecycle.
   *      Quando Tutor / Simulator standalone montati senza Lavagna → listener
   *      non parte (componente non montato).
   */
  useEffect(() => {
    // Toggle off → ensure listener stopped, do nothing else.
    if (!wakeWordEnabled) {
      stopWakeWordListener();
      setWakeWordActive(false);
      return undefined;
    }
    // Browser support gate (Caveat 1).
    if (!isWakeWordSupported()) {
      logger.warn('[LavagnaShell] Wake word "Ehi UNLIM" non supportato dal browser (richiede Chrome/Edge).');
      setWakeWordActive(false);
      return undefined;
    }
    // Iter 35 fix Andrea "modalità vocale non riesco a farla andare":
    // Browser policy SpeechRecognition richiede user gesture per mic permission.
    // Su mount Lavagna NO gesture → onerror not-allowed silent. Fix: warm-up
    // mic via getUserMedia su prima interazione (click/touch any anywhere LavagnaShell).
    // Permission cached browser per origine → SpeechRecognition successivi OK.
    let micWarmedUp = false;
    const warmUpMic = () => {
      if (micWarmedUp || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      micWarmedUp = true;
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Subito chiudi: serve solo permission grant, non recording.
          stream.getTracks().forEach(t => t.stop());
          // Re-start wake word listener post permission (fresh state).
          stopWakeWordListener();
          setTimeout(() => {
            const restarted = startWakeWordListener({
              onWake: () => {
                const now = Date.now();
                if (now - lastWakeAtRef.current < 1500) return;
                lastWakeAtRef.current = now;
                setUnlimOpen(true);
                setUnlimTab('chat');
                setToolToast('Ti ascolto!');
                setTimeout(() => setToolToast(null), 2000);
              },
              onCommand: (text) => {
                const api = typeof window !== 'undefined' && window.__ELAB_API;
                if (api?.unlim?.sendMessage) api.unlim.sendMessage(text);
              },
            });
            setWakeWordActive(restarted);
          }, 100);
        })
        .catch(() => { /* permission denied → wake-word-error event già dispatched */ });
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', warmUpMic, { once: true });
      document.addEventListener('touchstart', warmUpMic, { once: true });
    }
    const started = startWakeWordListener({
      onWake: () => {
        // Debounce: ignora wake successivi entro 1.5s (Caveat 3).
        const now = Date.now();
        if (now - lastWakeAtRef.current < 1500) return;
        lastWakeAtRef.current = now;
        setUnlimOpen(true);
        setUnlimTab('chat');
        setToolToast('Ti ascolto!');
        setTimeout(() => setToolToast(null), 2000);
      },
      onCommand: (text) => {
        const api = typeof window !== 'undefined' && window.__ELAB_API;
        if (api?.unlim?.sendMessage) {
          api.unlim.sendMessage(text);
        }
      },
    });
    setWakeWordActive(started);
    return () => {
      stopWakeWordListener();
      setWakeWordActive(false);
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', warmUpMic);
        document.removeEventListener('touchstart', warmUpMic);
      }
    };
  }, [wakeWordEnabled]);

  // iter 35 fix Bug 8: ascolta errori wake word + toast feedback docente.
  useEffect(() => {
    const onWakeError = (ev) => {
      const msg = ev?.detail?.message || 'Microfono non autorizzato per "Ehi UNLIM".';
      try { showToastSync?.(msg, 'warning'); } catch (_) { /* ignore */ }
      setWakeWordActive(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('elab-wake-word-error', onWakeError);
      return () => window.removeEventListener('elab-wake-word-error', onWakeError);
    }
    return undefined;
  }, []);

  // Persist layout sizes and volume navigation to localStorage
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-left-panel', String(leftPanelSize)); } catch {}
  }, [leftPanelSize]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-bottom-panel', String(bottomPanelSize)); } catch {}
  }, [bottomPanelSize]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-buildmode', buildMode); } catch {}
  }, [buildMode]);
  // ADR-025 iter 26 — persist modalità canonical
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-modalita', modalita); } catch {}
  }, [modalita]);

  // Iter 34 P0 fix Andrea bug "lavagna bianca quando selezionata non è mai vuota":
  // ADR-025 §4.4 iter 26 forced Libero → auto-Percorso (NON sandbox). Andrea iter
  // 34 ha invertito il mandate: Libero DEVE essere blank sandbox (true empty
  // canvas) per consentire creazione libera senza esperimento pre-mounted.
  // Diagnose flow integrato dentro Già Montato + Passo Passo (mode 'guida-da-errore' REMOVED).
  const handleModalitaChange = useCallback((nextMode) => {
    // Sprint V iter 3 — 'libero' MERGED in 'percorso' (Andrea iter 1+ mandate). Migrate silently.
    if (nextMode === 'libero' || nextMode === 'guida-da-errore') {
      nextMode = 'percorso';
    }
    if (!['percorso', 'passo-passo', 'gia-montato'].includes(nextMode)) {
      return; // defensive: ignore unknown modes
    }
    setModalita(nextMode);
    // iter 48 Andrea verbatim "i tre tasti devono attivare quello per cui sono pensati":
    // wire-up modalita → simulator buildMode + ComponentDrawer + UNLIM tab. Senza
    // questo, prima di iter 48, Passo Passo + Già Montato cambiavano solo lo stato
    // UI (button visualmente attivo) ma il simulator non riceveva setBuildMode →
    // ComponentDrawer NON appariva → tasto inutile. Mapping canonical:
    //   percorso     → buildMode 'sandbox' + canvas vuoto + UNLIM percorso tab
    //   passo-passo  → buildMode 'guided' + solo ComponentDrawer; UNLIM resta chat
    //   gia-montato  → buildMode 'complete' + diagnose backend; UNLIM resta chat
    if (nextMode === 'passo-passo' && typeof window !== 'undefined') {
      const api = window.__ELAB_API;
      ensureDefaultExperimentForMode(api);
      setBuildMode('guided');
      setUnlimOpen(true);
      setUnlimTab('chat');
      manualOverridesRef.current.unlim = true;
      if (api?.setBuildMode) {
        try { api.setBuildMode('guided'); } catch { /* noop */ }
      }
      if (api?.setBuildStepIndex) {
        try { api.setBuildStepIndex(0); } catch { /* noop */ }
      } else if (api?.nextStep && (api?.getBuildStepIndex?.() ?? -1) < 0) {
        try { api.nextStep(); } catch { /* noop */ }
      }
      if (api?.unlim?.setDiagnoseMode) {
        try { api.unlim.setDiagnoseMode(false); } catch { /* noop */ }
      }
    }
    // Già Montato NEW: signal pre-assembled diagnose mode to simulator if API present
    if (nextMode === 'gia-montato' && typeof window !== 'undefined') {
      const api = window.__ELAB_API;
      ensureDefaultExperimentForMode(api);
      setBuildMode('complete');
      setUnlimOpen(true);
      setUnlimTab('chat');
      manualOverridesRef.current.unlim = true;
      if (api?.setBuildMode) {
        try { api.setBuildMode('complete'); } catch { /* noop */ }
      }
      if (api?.setBuildStepIndex) {
        try { api.setBuildStepIndex(Number.POSITIVE_INFINITY); } catch { /* noop */ }
      }
      if (api?.unlim?.setDiagnoseMode) {
        try { api.unlim.setDiagnoseMode(true); } catch { /* noop */ }
      }
    }
    // Sprint V iter 1 Atom A5 — Percorso morphic Onniscenza Sense 1.5.
    // Andrea mandate: vecchia "Libero" + adattamento contesto lezione+classe+sessioni.
    // Trigger best-effort prefetch dell'aggregator Onniscenza (client-side bridge only;
    // wire-up Edge Function chain decisione orchestratore Phase 4). NON muta
    // currentExperiment — preserva canvas (no clearAll).
    if (nextMode === 'percorso' && typeof window !== 'undefined') {
      // Andrea 2026-05-08: Percorso deve partire senza nulla. Quindi non
      // preserviamo il circuito: mettiamo il simulatore in sandbox vuota e
      // lasciamo a UNLIM la lettura narrativa/morfica.
      setBuildMode('sandbox');
      setUnlimOpen(true);
      setUnlimTab('percorso');
      setPickerOpen(false);
      setCapitoloPickerOpen(true);
      manualOverridesRef.current.unlim = true;
      const api = window.__ELAB_API;
      if (api?.setBuildMode) {
        try { api.setBuildMode('sandbox'); } catch { /* noop */ }
      }
      if (api?.setBuildStepIndex) {
        try { api.setBuildStepIndex(-1); } catch { /* noop */ }
      }
      if (api?.clearAll) {
        try { api.clearAll(); } catch { /* noop */ }
      }
      if (api?.unlim?.setDiagnoseMode) {
        try { api.unlim.setDiagnoseMode(false); } catch { /* noop */ }
      }
      if (api?.unlim?.aggregateContext) {
        try {
          api.unlim.aggregateContext({
            lesson: api?.unlim?.getActiveLessonId?.() || null,
            class_key: (() => {
              try { return localStorage.getItem('elab-class-key') || null; } catch { return null; }
            })(),
            recent_sessions_limit: 5,
          });
        } catch { /* noop */ }
      }
    }
    // Sprint V iter 3 — 'libero' MERGED in 'percorso'. Legacy clearAll branch
    // RIMOSSO: percorso preserva canvas (no clearAll) per Onniscenza morphic
    // Sense 1.5 contesto lezione+classe+sessioni precedenti. Andrea iter 1+
    // mandate: percorso = vecchia "Libero" + adattamento contesto morfico.
  }, [ensureDefaultExperimentForMode]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-volume', String(currentVolume)); } catch {}
  }, [currentVolume]);
  useEffect(() => {
    try { localStorage.setItem('elab-lavagna-page', String(currentVolumePage)); } catch {}
  }, [currentVolumePage]);
  useEffect(() => {
    try { localStorage.setItem('elab_lavagna_active_tab', activeTab); } catch {}
  }, [activeTab]);

  // Principio Zero: Bentornati flow replaces the old auto-open picker.
  // The BentornatiOverlay handles first-time vs returning users.
  // Fallback: if bentornati is dismissed without loading, open picker.
  useEffect(() => {
    if (!hasExperiment && !bentornatiVisible && !pickerOpen && !capitoloPickerOpen && !freeMode) {
      const timer = setTimeout(() => {
        if (modalita === 'percorso') {
          setCapitoloPickerOpen(true);
          return;
        }
        setPickerOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [hasExperiment, bentornatiVisible, pickerOpen, capitoloPickerOpen, freeMode, modalita]);
  const manualOverridesRef = useRef({});
  const apiReadyRef = useRef(false);

  // Poll for __ELAB_API availability (simulator may mount async)
  useEffect(() => {
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api && !apiReadyRef.current) {
        apiReadyRef.current = true;
        clearInterval(check); // Stop polling once API is found

        // iter 26 Bug 2 EXIT HASH NAV restore: re-load last expId on mount
        // so docente returning to Lavagna sees the experiment + drawing bucket
        // intact (saved via handleMenuOpen on exit). NOT applied if user already
        // started a fresh experiment (currentExperiment !== null at restore time).
        try {
          // iter 27 P0 SURGICAL FIX — PRIORITY: deep-link prop > localStorage > nothing.
          // Deep-link `#lavagna?exp=v1-cap6-esp1` arriva via App.jsx prop initialExperimentId.
          // Override savedExpId iff prop fornito (intentional user navigation).
          const expIdToLoad = initialExperimentId || localStorage.getItem('elab-lavagna-last-expId');
          if (expIdToLoad && !currentExperiment && api.loadExperiment) {
            applyLoadedExperimentStateFromApi({
              api,
              experimentId: expIdToLoad,
              setCurrentExperiment,
              setExperimentName,
              setHasExperiment,
              setPickerOpen,
              setCapitoloPickerOpen,
              setBentornatiVisible,
              setCurrentVolume,
            });
          }
        } catch { /* localStorage quota OR private mode */ }

        // Listen for experiment changes
        api.on?.('experimentChange', (data) => {
          // Save entire experiment for child panels (PercorsoPanel, etc.)
          // Use microtask delay to ensure getCurrentExperiment is updated
          setTimeout(() => {
            const fullExp = api.getCurrentExperiment?.();
            if (fullExp?.id) setCurrentExperiment(fullExp);
          }, 100);
          if (data?.title) {
            setExperimentName(data.title);
            setHasExperiment(true);
            setPickerOpen(false);
            // PDR: trigger canvas auto-fit after experiment load
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
          }
          if (data?.totalSteps != null) setTotalSteps(data.totalSteps);
          if (data?.currentStep != null) setCurrentStep(data.currentStep);
          if (data?.steps) setLessonSteps(data.steps);
          // Track build mode for hiding component bar in Libero
          const mode = api.getBuildMode?.();
          if (mode) setBuildMode(mode);
        });

        // Listen for state changes (play/pause)
        api.on?.('stateChange', (data) => {
          if (data?.running != null) setIsPlaying(data.running);
        });
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  // iter 28 hashchange listener — in-place navigation from #lavagna?exp=A to
  // #lavagna?exp=B triggers `loadExperiment(B)`. Complements iter 27 first-mount
  // prop wiring (which only fires on FIRST mount via __ELAB_API polling above).
  // Guards: skip if same expId (no double-load), skip if API not ready
  // (will retry on next hashchange), skip if no `?exp=` (graceful).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // iter 30 P2.3 (Agent T tech-debt P0-3) — getExpFromHash imported from utility module.
    // Was duplicated here + src/App.jsx:83 — single source prevents drift iter 27 P0 fix + iter 28 hashchange.
    function handleHashChange() {
      const newExpId = getExpFromHash();
      if (!newExpId) return;
      const api = window.__ELAB_API;
      if (!api || !api.loadExperiment) return;
      // Only switch if different from current (avoid double-load race with first-mount)
      const current = api.getCurrentExperiment?.();
      if (current?.id === newExpId) return;
      api.loadExperiment(newExpId);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Track current panel values in refs (avoids putting them in useEffect deps)
  const panelStateRef = useRef({ leftPanel: false, bottomPanel: false, unlim: false });
  useEffect(() => {
    panelStateRef.current = { leftPanel: leftPanelOpen, bottomPanel: bottomPanelOpen, unlim: unlimOpen };
  });

  // ── State machine: auto-manage panels ──
  useEffect(() => {
    if (freeMode) return;
    const newState = deriveState({ hasExperiment, isPlaying, isEditing });
    if (newState !== lavagnaState) {
      setLavagnaState(newState);
      const panels = computePanelActions(newState,
        { ...panelStateRef.current, toolbar: true },
        manualOverridesRef.current
      );
      setLeftPanelOpen(panels.leftPanel);
      setBottomPanelOpen(panels.bottomPanel);
      setUnlimOpen(panels.unlim);
    }
  }, [hasExperiment, isPlaying, isEditing, lavagnaState]);

  // Track manual overrides when user explicitly toggles a panel
  const toggleLeftPanel = useCallback(() => {
    manualOverridesRef.current.leftPanel = true;
    setLeftPanelOpen(p => !p);
  }, []);
  const toggleBottomPanel = useCallback(() => {
    manualOverridesRef.current.bottomPanel = true;
    setBottomPanelOpen(p => !p);
  }, []);

  // Build mode change — sets simulator mode via API + auto-opens UNLIM tab
  const handleBuildModeChange = useCallback((mode) => {
    setBuildMode(mode);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.setBuildMode) api.setBuildMode(mode);
    if (mode === 'guided') {
      return;
    } else if (mode === 'sandbox') {
      setUnlimOpen(true);
      setUnlimTab('percorso');
      manualOverridesRef.current.unlim = true;
    }
  }, []);

  const applyCurrentModalitaToSimulator = useCallback((mode = modalita) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;
    if (mode === 'percorso') {
      try { api.setBuildMode?.('sandbox'); } catch { /* noop */ }
      try { api.setBuildStepIndex?.(-1); } catch { /* noop */ }
      try { api.clearAll?.(); } catch { /* noop */ }
      try { api.unlim?.setDiagnoseMode?.(false); } catch { /* noop */ }
      setBuildMode('sandbox');
      return;
    }
    if (mode === 'passo-passo') {
      try { api.setBuildMode?.('guided'); } catch { /* noop */ }
      try { api.setBuildStepIndex?.(0); } catch { /* noop */ }
      try { api.unlim?.setDiagnoseMode?.(false); } catch { /* noop */ }
      setBuildMode('guided');
      return;
    }
    if (mode === 'gia-montato') {
      try { api.setBuildMode?.('complete'); } catch { /* noop */ }
      try { api.setBuildStepIndex?.(Number.POSITIVE_INFINITY); } catch { /* noop */ }
      try { api.unlim?.setDiagnoseMode?.(true); } catch { /* noop */ }
      setBuildMode('complete');
    }
  }, [modalita]);

  // Helper: sync drawing state with simulator via __ELAB_API
  const syncDrawing = useCallback((enabled) => {
    setDrawingEnabled(enabled);
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.toggleDrawing) api.toggleDrawing(enabled);
  }, []);

  // ── Toolbar actions via __ELAB_API ──
  const handleToolChange = useCallback((tool) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;

    switch (tool) {
      case 'pen': {
        const next = !drawingEnabled;
        setDrawingEnabled(next);
        setActiveTool(next ? 'pen' : 'select');
        const penApi = typeof window !== 'undefined' && window.__ELAB_API;
        if (penApi?.toggleDrawing) penApi.toggleDrawing(next);
        // iter 45 B5: switch back to pen mode (off eraser) when entering pen.
        try {
          window.dispatchEvent(new CustomEvent('elab-set-eraser-mode', { detail: { eraser: false } }));
        } catch { /* noop */ }
        return;
      }
      // iter 45 fix Andrea video2 06/05/2026 B5 "manca la gomma": tool eraser
      // attiva drawing mode + switch isEraser=true via CustomEvent globale che
      // DrawingOverlay (canvas/DrawingOverlay.jsx) ascolta e toggla state.
      case 'eraser': {
        setDrawingEnabled(true);
        setActiveTool('eraser');
        const eraserApi = typeof window !== 'undefined' && window.__ELAB_API;
        if (eraserApi?.toggleDrawing) eraserApi.toggleDrawing(true);
        try {
          window.dispatchEvent(new CustomEvent('elab-set-eraser-mode', { detail: { eraser: true } }));
        } catch { /* noop */ }
        return;
      }
      case 'delete': {
        if (api) {
          const selectedId = api.getSelectedComponent?.();
          if (selectedId) {
            api.removeComponent(selectedId);
          } else {
            // Feedback: nulla selezionato
            setToolToast('Tocca un componente prima di eliminarlo');
            setTimeout(() => setToolToast(null), 2500);
          }
        }
        setActiveTool('select');
        syncDrawing(false);
        break;
      }
      case 'undo': api?.undo?.(); setActiveTool('select'); syncDrawing(false); break;
      case 'redo': api?.redo?.(); setActiveTool('select'); syncDrawing(false); break;
      case 'select':
        setActiveTool('select');
        syncDrawing(false);
        api?.setToolMode?.('select');
        break;
      case 'wire':
        setActiveTool('wire');
        syncDrawing(false);
        api?.setToolMode?.('wire');
        break;
      default:
        setActiveTool(tool);
        syncDrawing(false);
        break;
    }
  }, [syncDrawing, drawingEnabled]);

  // Sync drawing state from simulator back to LavagnaShell (when user clicks ESCI/ESC inside DrawingOverlay)
  useEffect(() => {
    if (!drawingEnabled) return;
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api?.isDrawingEnabled && !api.isDrawingEnabled()) {
        setDrawingEnabled(false);
        setActiveTool('select');
        clearInterval(check);
      }
    }, 300);
    return () => clearInterval(check);
  }, [drawingEnabled]);

  // ── Header actions ──
  const handlePlay = useCallback(() => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (!api) return;
    if (isPlaying) {
      api.pause?.();
      soundPause();
    } else {
      api.play?.();
      soundPlay();
    }
  }, [isPlaying]);

  const handleMenuOpen = useCallback(() => {
    // iter 26 Bug 2 EXIT HASH NAV fix (Andrea iter 19 PM mandate):
    // Save current expId to localStorage before exiting Lavagna so re-entry
    // restores the experiment + drawing bucket. Without this, drawings persisted
    // to elab-drawing-<expId> become orphaned when DrawingOverlay mounts with null.
    if (typeof window !== 'undefined') {
      try {
        const expId = currentExperiment?.id;
        if (expId) {
          localStorage.setItem('elab-lavagna-last-expId', String(expId));
        }
      } catch { /* localStorage quota OR private mode */ }
      // Iter 44 persistenza: finalise sessione corrente prima di uscire.
      // Hook beforeunload non scatta su hash change interno → invocazione esplicita
      // popola Cronologia recente HomePage + sync Supabase.
      try {
        sessionTracker?.finaliseSession?.();
      } catch { /* silent — best effort persistence */ }
      // Iter 44 fix Andrea 2026-05-06 PM "non si puo tornare indietro a homepage":
      // Esci → '#tutor' veniva intercettato App.jsx S8 redirect (Strangler Fig
      // switch) e tornava a '#lavagna' = loop infinito senza exit. Fix: torna
      // direttamente a '#home' (route VALID_HASHES iter 35 P0 default landing).
      window.location.hash = '#home';
    }
  }, [currentExperiment, sessionTracker]);

  // Iter 44 persistenza Lavagna libera (no experiment): manual startSession
  // se freeMode attivo + nessuna session corrente. Senza experimentChange
  // event (no api.loadExperiment), hook non auto-starta.
  useEffect(() => {
    if (freeMode && sessionTracker?.startSession) {
      sessionTracker.startSession('lavagna-libera');
    }
  }, [freeMode, sessionTracker]);

  // SessionTracker listens to __ELAB_API experimentChange, but API-driven loads
  // can race that subscription. Keep the session aligned with the visible
  // experiment so the explicit Salva button never becomes a no-op.
  useEffect(() => {
    const expId = currentExperiment?.id;
    if (!freeMode && expId && sessionTracker?.startSession) {
      sessionTracker.startSession(expId);
    }
  }, [currentExperiment?.id, freeMode, sessionTracker]);

  // Iter 44 persistenza unmount: finalise on LavagnaShell unmount (route change
  // back to home, browser back, Vercel redirect). Hook beforeunload copre tab
  // close MA non SPA route change.
  useEffect(() => {
    return () => {
      try {
        sessionTracker?.finaliseSession?.();
      } catch { /* silent */ }
    };
  }, [sessionTracker]);

  const handlePickerOpen = useCallback(() => setPickerOpen(true), []);
  const handlePickerClose = useCallback(() => setPickerOpen(false), []);

  const handleExperimentSelect = useCallback((exp) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api?.loadExperiment) {
      api.loadExperiment(exp.id);
      setTimeout(() => applyCurrentModalitaToSimulator(), 120);
    }
    setExperimentName(exp.title || exp.id);
    setHasExperiment(true);
    setBentornatiVisible(false);
    // Detect volume from experiment ID prefix (v1-*, v2-*, v3-*)
    const volMatch = (exp.id || '').match(/^v(\d)/);
    if (volMatch) setCurrentVolume(Number(volMatch[1]));
    // Reset manual overrides when loading new experiment
    manualOverridesRef.current = {};
  }, [applyCurrentModalitaToSimulator]);

  // Bentornati: teacher clicks "Inizia" → load suggested experiment + open UNLIM
  // Handles race condition: if __ELAB_API is not ready yet, retries with polling
  const handleBentornatiStart = useCallback((suggestion) => {
    if (!suggestion?.experimentId) {
      setBentornatiVisible(false);
      return;
    }
    // Update UI immediately — no waiting
    setExperimentName(suggestion.title || suggestion.experimentId);
    setHasExperiment(true);
    setBentornatiVisible(false);
    setPickerOpen(false);
    const volMatch = (suggestion.experimentId || '').match(/^v(\d)/);
    if (volMatch) setCurrentVolume(Number(volMatch[1]));
    manualOverridesRef.current = {};

    // Load experiment via API — with retry if API not ready yet
    const tryLoad = () => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api?.loadExperiment) {
        api.loadExperiment(suggestion.experimentId);
        setTimeout(() => applyCurrentModalitaToSimulator(), 120);
        return true;
      }
      return false;
    };
    if (!tryLoad()) {
      // API not ready — poll every 300ms, up to 10 attempts (3s)
      let attempts = 0;
      const poll = setInterval(() => {
        if (tryLoad() || ++attempts >= 10) clearInterval(poll);
      }, 300);
    }
  }, [applyCurrentModalitaToSimulator]);

  const handleLessonExperimentSelect = useCallback((expId) => {
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    api?.mountExperiment?.(expId);
    setCurrentExperiment({ id: expId });
    setHasExperiment(true);
    const volMatch = expId.match(/^v(\d)/);
    if (volMatch) setCurrentVolume(Number(volMatch[1]));
  }, []);

  // Bentornati: teacher clicks "Scegli altro" → dismiss overlay, open picker
  const handleBentornatiPickExperiment = useCallback(() => {
    setBentornatiVisible(false);
    markOverlayDismissed();
    setPickerOpen(true);
  }, []);

  // ── UNLIM toggle (also from header) ──
  const toggleUnlim = useCallback(() => {
    manualOverridesRef.current.unlim = true;
    setUnlimOpen(prev => !prev);
  }, []);

  // ── Volume viewer toggle ──
  const toggleVolume = useCallback(() => {
    setVolumeOpen(prev => !prev);
  }, []);

  const handleVolumePage = useCallback((page, vol) => {
    setCurrentVolumePage(page);
    // Inject volume context into __ELAB_API for UNLIM to read
    const api = typeof window !== 'undefined' && window.__ELAB_API;
    if (api) {
      api._volumeContext = { volumeNumber: vol, page };
    }
  }, []);

  // ── Sprint S iter 2 Task B — Capitolo Picker + Percorso Capitolo View ──
  const handleCapitoliOpen = useCallback(() => {
    setCapitoloPickerOpen(true);
  }, []);

  const handleCapitoliClose = useCallback(() => {
    setCapitoloPickerOpen(false);
  }, []);

  const handleCapitoloSelect = useCallback((capId) => {
    setActiveCapitoloId(capId);
    setCapitoloPickerOpen(false);
    // Detect volume from capitolo for VolumeViewer alignment
    try {
      const cap = getCapitolo(capId);
      if (cap?.volume) setCurrentVolume(cap.volume);
    } catch (err) {
      logger.warn('[Lavagna] getCapitolo failed:', err?.message || err);
    }
  }, []);

  const handlePercorsoCapitoloClose = useCallback(() => {
    setActiveCapitoloId(null);
  }, []);

  const handleHomeClick = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.location.hash = 'home';
  }, []);

  // VolumeCitation onClick wired → opens VolumeViewer at vol/page (lazy-loaded already)
  const handleCitationClick = useCallback(({ volume, page }) => {
    if (typeof volume === 'number' && volume >= 1 && volume <= 3) {
      setCurrentVolume(volume);
    }
    if (typeof page === 'number' && page > 0) {
      setCurrentVolumePage(page);
    }
    setVolumeOpen(true);
  }, []);

  // Resolve Capitolo object from id (memoized)
  const activeCapitolo = useMemo(() => {
    if (!activeCapitoloId) return null;
    try {
      return getCapitolo(activeCapitoloId);
    } catch (err) {
      logger.warn('[Lavagna] getCapitolo lookup failed:', err?.message || err);
      return null;
    }
  }, [activeCapitoloId]);

  // Capitoli full list for picker (memoized)
  const allCapitoli = useMemo(() => {
    try {
      return listAllCapitoli();
    } catch (err) {
      logger.warn('[Lavagna] listAllCapitoli failed:', err?.message || err);
      return [];
    }
  }, []);

  // Clear volume context when viewer closes
  useEffect(() => {
    if (!volumeOpen) {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api) api._volumeContext = null;
    }
  }, [volumeOpen]);

  // ── Video toggle ──
  const toggleVideo = useCallback(() => {
    if (videoOpen && !videoMinimized) {
      setVideoOpen(false);
      setVideoMinimized(false);
    } else {
      setVideoOpen(true);
      setVideoMinimized(false);
    }
  }, [videoOpen, videoMinimized]);

  // ── Fumetto Report open ──
  // Iter 83: render in-page. The legacy popup/download path was invisible in
  // browsers that block window.open, so teachers saw "nothing happened".
  const handleFumettoOpen = useCallback(() => {
    try {
      ensureUnlimMountNamespace();
      sessionTracker.finaliseSession();
      const session = getRuntimeFumettoSession({ currentExperiment, experimentName, initialExperimentId });
      setFumettoSession(session);
      setToolToast('Fumetto generato dalla sessione. Buon lavoro, Ragazzi.');
      setTimeout(() => setToolToast(null), 2500);
    } catch (err) {
      logger.warn('[Fumetto] Unable to open report window:', err?.message || err);
      showToastSync?.('Errore nella generazione del Fumetto. Riprova.', 'error');
    }
  }, [currentExperiment, experimentName, initialExperimentId, sessionTracker]);

  const handleFumettoMountNext = useCallback((experimentId) => {
    if (!experimentId) return;
    const lessonPath = getLessonPath(experimentId);
    const api = typeof window !== 'undefined' ? window.__ELAB_API : null;
    const applyNextExperimentState = () => {
      setCurrentExperiment({
        id: experimentId,
        title: lessonPath?.title || experimentId,
        volume: lessonPath?.volume,
      });
      setExperimentName(lessonPath?.title || experimentId);
      setHasExperiment(true);
      setBentornatiVisible(false);
      const volMatch = experimentId.match(/^v(\d)/);
      if (volMatch) setCurrentVolume(Number(volMatch[1]));
    };

    api?.mountExperiment?.(experimentId);
    if (typeof window !== 'undefined') {
      const nextHash = `#lavagna?exp=${encodeURIComponent(experimentId)}`;
      if (!window.location.hash.includes(`exp=${encodeURIComponent(experimentId)}`)) {
        window.history.replaceState(null, '', nextHash);
      }
    }
    applyNextExperimentState();
    setTimeout(applyNextExperimentState, 300);
    manualOverridesRef.current = {};
  }, []);

  // ── Voice command integration: "crea il report" / "fumetto" ──
  useEffect(() => {
    const onVoiceCommand = (ev) => {
      if (ev?.detail?.action === 'createReport') {
        handleFumettoOpen();
      }
    };
    window.addEventListener('elab-voice-command', onVoiceCommand);
    return () => window.removeEventListener('elab-voice-command', onVoiceCommand);
  }, [handleFumettoOpen]);

  return (
    <div className={css.shell}>
      {/*
        Screen-reader heading — lavagna route previously had zero <h1> elements
        (stress-test P2-007). Keep it visually hidden to preserve existing
        design while giving assistive tech a proper document outline.
      */}
      <h1 className="visually-hidden">
        {experimentName ? `Lavagna ELAB — ${experimentName}` : 'Lavagna ELAB'}
      </h1>
      {/* iter 38 Atom A11 — mic permission nudge (self-managed visibility).
          Returns null se permesso 'granted' o se docente ha cliccato "Più tardi".
          onGrant: avvia warm-up wake word IMMEDIATAMENTE così LavagnaShell
          successivo .startWakeWordListener() trova permission cached. */}
      <Suspense fallback={null}>
        <MicPermissionNudge
          onGrant={() => {
            // Pre-warm wake word: idempotente (modulo singleton). Se già
            // attivo via useEffect lavagna sotto, è no-op.
            if (typeof window !== 'undefined' && isWakeWordSupported()) {
              try {
                startWakeWordListener({
                  onWake: () => { /* listener lavagna sotto sovrascrive callbacks reali */ },
                  onCommand: () => { /* idem */ },
                });
              } catch { /* best effort */ }
            }
          }}
        />
      </Suspense>
      {/* iter 38 Atom A12 — PWA update prompt. Toast plurale "Ragazzi…"
          appare quando vite-plugin-pwa segnala onNeedRefresh (registerType:
          'prompt'). Self-managed: needRefresh flag interno; component
          returns null fino a SW update. */}
      <Suspense fallback={null}>
        <UpdatePrompt autoReloadSeconds={5} />
      </Suspense>
      <AppHeader
        experimentName={freeMode ? 'ELAB' : experimentName}
        onHome={handleHomeClick}
        totalSteps={totalSteps}
        currentStep={currentStep}
        onPickerOpen={freeMode ? undefined : handlePickerOpen}
        onUnlimToggle={undefined}
        unlimOpen={unlimOpen}
        onVideoToggle={freeMode ? undefined : toggleVideo}
        videoOpen={videoOpen}
        onVolumeToggle={toggleVolume}
        volumeOpen={volumeOpen}
        // iter 45 fix Andrea video2 06/05/2026 B3 "manca il pulsante per il
        // salvataggio della sessione": pulsante esplicito Salva nel header.
        // Chiama sessionTracker.finaliseSession() (saveSessions localStorage +
        // saveSessionSummary unlimMemory + saveSessionToSupabase async). Auto
        // save invisibility/beforeunload preserved.
        onSaveSession={sessionTracker?.finaliseSession ? () => {
          try {
            if (currentExperiment?.id && sessionTracker?.startSession) {
              sessionTracker.startSession(currentExperiment.id);
            }
            sessionTracker.finaliseSession();
            setToolToast('Sessione salvata. Buon lavoro, Ragazzi.');
            setTimeout(() => setToolToast(null), 2500);
          } catch (err) {
            setToolToast('Errore salvataggio. Riprova tra un attimo.');
            setTimeout(() => setToolToast(null), 2500);
          }
        } : undefined}
        onPercorsoToggle={() => {
          // Open UNLIM with Percorso tab instead of separate panel
          if (unlimOpen && unlimTab === 'percorso') {
            // Already showing percorso — switch back to chat
            setUnlimTab('chat');
          } else {
            setUnlimOpen(true);
            setUnlimTab('percorso');
            manualOverridesRef.current.unlim = true;
          }
        }}
        percorsoOpen={unlimOpen && unlimTab === 'percorso'}
        onFumettoOpen={freeMode ? undefined : handleFumettoOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showLezioneTab={!freeMode && isDocente}
        showClasseTab={!freeMode && isDocente}
        showProgressiTab={!freeMode && isStudente}
      />

      <div className={css.body}>
        {/* === LAVAGNA VIEW (simulatore + pannelli) === */}
        <div className={css.lavagnaView} style={{ display: activeTab === 'lavagna' ? 'contents' : 'none' }}>
          {/* ADR-025 iter 26 — Modalità switch 4 modes canonical (Percorso default + Passo Passo + Già Montato + Libero auto-Percorso) */}
          {!freeMode && (
            <div className={css.modalitaSwitchSlot} data-testid="modalita-switch-slot">
              <ModalitaSwitch activeMode={modalita} onModeChange={handleModalitaChange}
          sessionState={derivedSessionState}
        />
            </div>
          )}

          {/* Left panel — quick component palette (hidden in Libero/sandbox: solo canvas pulito.
               iter 45 B9: anche hidden in freeMode 'Lavagna libera' Andrea mandate). */}
          {!freeMode && hasExperiment && buildMode !== 'sandbox' && (
            <RetractablePanel
              id="lavagna-left"
              direction="left"
              open={leftPanelOpen}
              onToggle={toggleLeftPanel}
              defaultSize={180}
              minSize={140}
              maxSize={280}
              onSizeChange={setLeftPanelSize}
              className={css.hideOnPortrait}
            >
              <QuickComponentPanel volumeNumber={currentVolume} />
            </RetractablePanel>
          )}

          {/* Center — simulator canvas + floating toolbar.
               Homepage freeMode=true: blank simulator bridge + UNLIM, without
               permanent copy that blocks manuals/actions. */}
          <main className={css.canvas} style={{
            ...(leftPanelOpen && !freeMode ? { marginLeft: leftPanelSize } : {}),
            ...(bottomPanelOpen ? { marginBottom: bottomPanelSize } : {}),
          }}>
            <Suspense fallback={
              <div className={css.loading}>
                <span>Caricamento simulatore...</span>
              </div>
            }>
              {/* iter 45 fix Andrea video 06/05/2026: ComponentDrawer è il VERO Passo Passo
                   click-per-clic (Andrea Marro 20/02/2026). Quando modalita='passo-passo'
                   NON nascondere ComponentDrawer — al contrario, è proprio quello che
                   l'utente vuole vedere ("sotto si nascondono i veri pulsanti" — Andrea verbatim). */}
              <NewElabSimulator
                hideLessonPath
                hideBuildModeBar
                enableDrawingSync={DRAWING_SYNC_ENABLED}
                onFumettoOpen={handleFumettoOpen}
              />
            </Suspense>

            <FloatingToolbar
              activeTool={activeTool}
              onToolChange={handleToolChange}
              abovePanel={bottomPanelOpen}
              leftPanelOpen={leftPanelOpen}
            />
          </main>

          {/* Right — UNLIM AI in FloatingWindow */}
          <UnlimAdapter
            visible={unlimOpen}
            onClose={() => { manualOverridesRef.current.unlim = true; setUnlimOpen(false); }}
            onSpeakingChange={setUnlimSpeaking}
            activeTab={unlimTab}
          />
        </div>

        {/* === DASHBOARD VIEW (docente o studente) === */}
        {activeTab === 'classe' && isDocente && (
          <div className={css.dashboardView}>
            <Suspense fallback={<div className={css.loading}><span>Caricamento dashboard...</span></div>}>
              <TeacherDashboard />
            </Suspense>
          </div>
        )}
        {activeTab === 'progressi' && isStudente && (
          <div className={css.dashboardView}>
            <Suspense fallback={<div className={css.loading}><span>Caricamento progressi...</span></div>}>
              <StudentDashboard />
            </Suspense>
          </div>
        )}

        {activeTab === 'lezione' && (
          <div className={css.dashboardView}>
            <LessonSelector
              volumeNumber={currentVolume}
              activeLessonId={activeLessonId}
              onLessonSelect={setActiveLessonId}
            />
            <LessonReader
              lessonId={activeLessonId}
              currentExperimentId={currentExperiment?.id}
              onExperimentSelect={handleLessonExperimentSelect}
            />
          </div>
        )}

        {/* Volume PDF Viewer */}
        <Suspense fallback={null}>
          <VolumeViewer
            visible={volumeOpen}
            volumeNumber={currentVolume}
            onClose={() => setVolumeOpen(false)}
            onPageChange={handleVolumePage}
            onVolumeChange={setCurrentVolume}
            initialPage={1}
          />
        </Suspense>

        {/* Video — YouTube + Videocorsi in FloatingWindow */}
        {!freeMode && (
          <VideoFloat
            visible={videoOpen}
            minimized={videoMinimized}
            onClose={() => { setVideoOpen(false); setVideoMinimized(false); }}
            onMinimize={() => setVideoMinimized(true)}
            onRestore={() => setVideoMinimized(false)}
          />
        )}

        <SessionReportComicModal
          session={fumettoSession}
          onClose={() => setFumettoSession(null)}
          onMountNextExperiment={handleFumettoMountNext}
        />

        {/* Sprint S iter 2 Task B — CapitoloPicker overlay (modal) */}
        {!freeMode && capitoloPickerOpen && (
          <div
            className={css.capitoloPickerOverlay}
            data-testid="capitolo-picker-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Selezione capitolo"
            onClick={(e) => {
              // Click backdrop closes picker; clicks inside content do not
              if (e.target === e.currentTarget) handleCapitoliClose();
            }}
          >
            <div className={css.capitoloPickerContent}>
              <button
                type="button"
                className={css.capitoloPickerClose}
                onClick={handleCapitoliClose}
                aria-label="Chiudi selezione capitolo"
              >
                ×
              </button>
              <ErrorBoundary>
                <Suspense fallback={<div className={css.loading}><span>Caricamento capitoli...</span></div>}>
                  <CapitoloPicker
                    capitoli={allCapitoli}
                    volume={currentVolume}
                    onVolumeChange={setCurrentVolume}
                    onSelectCapitolo={handleCapitoloSelect}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* Sprint S iter 2 Task B — PercorsoCapitoloView overlay (side panel) */}
        {!freeMode && activeCapitoloId && (
          <div
            className={css.percorsoCapitoloOverlay}
            data-testid="percorso-capitolo-view"
          >
            <ErrorBoundary>
              <Suspense fallback={<div className={css.loading}><span>Caricamento capitolo...</span></div>}>
                <PercorsoCapitoloView
                  capitolo={activeCapitolo}
                  onClose={handlePercorsoCapitoloClose}
                  onCitationClick={handleCitationClick}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}

        {/* iter 45 fix Andrea video 06/05/2026: rimosso FloatingWindow LessonReader per
             modalita='passo-passo'. Era duplicato sbagliato (narrative capitolo invece
             click-by-click build). Vero Passo Passo = ComponentDrawer in NewElabSimulator
             (Andrea Marro 20/02/2026 src/components/simulator/panels/ComponentDrawer.jsx)
             che renderizza quando currentExperiment.buildMode === 'guided' (iniettato
             da ExperimentPicker:202 quando experiment ha buildSteps[]).
             Andrea audio Voxtral verbatim 06/05/2026: "passo passo qua è sbagliato,
             parla di cose a caso mentre in realtà sotto si nascondono i veri pulsanti". */}
      </div>

      {/* Bottom panel — placeholder for code/serial (simulator handles its own) */}
      {bottomPanelOpen && (
        <RetractablePanel
          id="lavagna-bottom"
          direction="bottom"
          open={bottomPanelOpen}
          onToggle={toggleBottomPanel}
          defaultSize={200}
          minSize={100}
          maxSize={400}
          onSizeChange={setBottomPanelSize}
        >
          <div className={css.bottomPlaceholder}>
            <span>Il pannello codice e integrato nel simulatore</span>
          </div>
        </RetractablePanel>
      )}

      {/* Tool feedback toast — iter 75 75-B.2 fix (TRACK C audit P0 +
          Codex iter 74 verdict): color #fff on var(--elab-orange)
          contrast 2.4:1 WCAG AA FAIL. Switched to var(--elab-text,
          #1A1A1A) contrast ~7.8:1 PASS AA + AAA. Andrea regola 10
          "Contrasto WCAG AA 4.5:1 testo". */}
      {toolToast && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)', background: 'var(--elab-orange)', color: 'var(--elab-text, #1A1A1A)', padding: '10px 20px', borderRadius: 10, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 9999, pointerEvents: 'none' }}>
          {toolToast}
        </div>
      )}

      <button
        type="button"
        className={`${css.wakeWordPill} ${wakeWordActive ? css.wakeWordPillActive : ''}`}
        onClick={() => setWakeWordEnabled(v => !v)}
        aria-pressed={wakeWordEnabled}
        aria-label={wakeWordEnabled ? 'Disattiva wake word Ehi UNLIM' : 'Attiva wake word Ehi UNLIM'}
        title={wakeWordEnabled ? 'Wake word attiva: dì Ehi UNLIM' : 'Attiva wake word Ehi UNLIM'}
      >
        <span className={css.wakeWordDot} aria-hidden="true" />
        <span>Ehi UNLIM</span>
      </button>

      {/* Drawing overlay controlled via NewElabSimulator's own DrawingOverlay + __ELAB_API.toggleDrawing */}

      {/* Error-to-UNLIM bridge — toast when circuit/compilation errors occur */}
      <ErrorToast
        onAskUnlim={(msg) => {
          setUnlimOpen(true);
          const api = typeof window !== 'undefined' && window.__ELAB_API;
          if (api?.unlim?.sendMessage) api.unlim.sendMessage(msg);
        }}
      />

      {/* Percorso lezione — integrato dentro UNLIM (UnlimAdapter tab Percorso) */}

      {/* Mascotte ELAB — draggable, click apre UNLIM */}
      <MascotPresence
        speaking={unlimSpeaking}
        onClick={() => {
          manualOverridesRef.current.unlim = true;
          setUnlimOpen(open => !open);
        }}
        mascotSrc="/assets/mascot/logo-senza-sfondo.png"
      />

      {/* Bentornati Overlay — Principio Zero: auto-propose next experiment.
          Serializzato: attende ConsentBanner dismesso (route student-facing). */}
      <BentornatiOverlay
        visible={!freeMode && bentornatiVisible && !hasExperiment && bentornatiAllowed}
        onStart={handleBentornatiStart}
        onPickExperiment={handleBentornatiPickExperiment}
      />

      {/* Experiment Picker Modal — ultimo in coda: evita stacking con Bentornati. */}
      <ExperimentPicker
        open={!freeMode && pickerOpen && pickerAllowed && !bentornatiVisible}
        onClose={handlePickerClose}
        onSelect={handleExperimentSelect}
        onAskUnlim={(msg) => {
          setUnlimOpen(true);
          const api = typeof window !== 'undefined' && window.__ELAB_API;
          if (api?.unlim?.sendMessage) api.unlim.sendMessage(msg);
        }}
        onFreeMode={() => {
          const api = typeof window !== 'undefined' && window.__ELAB_API;
          if (api?.clearCircuit) api.clearCircuit();
          setHasExperiment(false);
          setFreeMode(true);
        }}
      />
    </div>
  );
}
