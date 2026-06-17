/**
 * UnlimWrapper — Wrapper che gestisce UNLIM Mode vs Classic Mode
 * Nasconde/mostra UI elements in base alla modalità.
 * Layer sopra il prodotto esistente — non sostituisce nulla.
 * © Andrea Marro — 27/03/2026
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, Component } from 'react';
import logger from '../../utils/logger';
import UnlimMascot from './UnlimMascot';
import UnlimOverlay, { useOverlayMessages } from './UnlimOverlay';
import UnlimInputBar from './UnlimInputBar';
import UnlimModeSwitch, { useUnlimMode } from './UnlimModeSwitch';
import css from './unlim-wrapper.module.css';
import { AntennaIcon, LetterIcon, CloseIcon, WarningIcon, SettingsIcon, CircuitIcon, SuccessIcon, MicrophoneIcon, RobotIcon, StarIcon, LightbulbIcon, HandWaveIcon, PartyIcon, BookIcon, FlaskIcon, SearchIcon, LoadingIcon } from '../common/ElabIcons';
import { getLessonPath } from '../../data/lesson-paths';
import { sendChat, checkRateLimit } from '../../services/api';
import { useTTS } from '../../hooks/useTTS';
import { useSTT } from '../../hooks/useSTT';
import { useSessionTracker } from '../../hooks/useSessionTracker';
import { getWelcomeMessage, getNextLessonSuggestion, buildClassContext } from '../../services/classProfile';
import { getWelcomeMessage as getExpWelcome } from '../../data/welcome-messages';
import { openReportWindow, isReportCommand } from './UnlimReport';
import { unlimMemory } from '../../services/unlimMemory';
import { matchVoiceCommand, executeVoiceCommand } from '../../services/voiceCommands';
import { startNudgeListener } from '../../services/nudgeService';
import { useAuth } from '../../context/AuthContext';

/**
 * S1 Ciclo 4: Execute an INTENT action from AI response.
 * Supported intents:
 *   { action: "add_component", type: "led", color: "green" }
 *   { action: "remove_component", id: "led1" }
 *   { action: "connect_wire", from: "bat1:positive", to: "bb1:bus-top-plus-1" }
 *   { action: "set_value", id: "r1", field: "value", value: 220 }
 *   { action: "clear_circuit" }
 *   { action: "mount", experiment: "v1-cap6-esp1" }
 *   { action: "mount_animated", experiment: "v1-cap6-esp1" }
 *   { action: "describe_circuit" }
 *
 * @param {Object} intent
 * @param {Function} showMessage - overlay message callback
 * @param {Function} speakIfEnabled - TTS callback
 */
function executeIntent(intent, showMessage, speakIfEnabled) {
  const api = window.__ELAB_API;
  if (!api || !intent?.action) return;

  switch (intent.action) {
    case 'add_component': {
      const id = api.addComponent?.(intent.type || 'led');
      if (id && intent.color) {
        api.setComponentValue?.(id, 'color', intent.color);
      }
      if (id && intent.value !== undefined) {
        api.setComponentValue?.(id, 'value', intent.value);
      }
      const feedback = `Ho aggiunto ${intent.type || 'componente'}${intent.color ? ' ' + intent.color : ''}${id ? ` (${id})` : ''}.`;
      showMessage?.(feedback, { position: 'top-center', type: 'success', duration: 4000 });
      speakIfEnabled?.(feedback);
      break;
    }
    case 'remove_component': {
      api.removeComponent?.(intent.id);
      const feedback = `Ho rimosso ${intent.id || 'il componente'}.`;
      showMessage?.(feedback, { position: 'top-center', type: 'info', duration: 3000 });
      break;
    }
    case 'connect_wire': {
      api.connectWire?.(intent.from, intent.to);
      const feedback = `Filo collegato da ${intent.from} a ${intent.to}.`;
      showMessage?.(feedback, { position: 'top-center', type: 'success', duration: 3000 });
      break;
    }
    case 'set_value': {
      api.setComponentValue?.(intent.id, intent.field || 'value', intent.value);
      const feedback = `Valore di ${intent.id} impostato a ${intent.value}.`;
      showMessage?.(feedback, { position: 'top-center', type: 'info', duration: 3000 });
      break;
    }
    case 'clear_circuit': {
      api.clearCircuit?.();
      showMessage?.('Circuito pulito!', { position: 'top-center', type: 'info', duration: 3000 });
      speakIfEnabled?.('Circuito pulito!');
      break;
    }
    case 'mount': {
      const ok = api.mountExperiment?.(intent.experiment);
      const feedback = ok ? 'Esperimento caricato!' : 'Esperimento non trovato.';
      showMessage?.(feedback, { position: 'top-center', type: ok ? 'success' : 'info', duration: 4000 });
      speakIfEnabled?.(feedback);
      break;
    }
    case 'mount_animated': {
      animatedMountExperiment(intent.experiment, showMessage, speakIfEnabled);
      break;
    }
    case 'describe_circuit': {
      const desc = api.getCircuitDescription?.() || 'Nessun circuito.';
      showMessage?.(desc, { position: 'top-center', type: 'info', duration: 8000 });
      speakIfEnabled?.(desc);
      break;
    }
    default:
      break;
  }
}

/**
 * S1 Ciclo 6: Animated experiment mounting — loads components one-by-one with feedback overlays.
 * Creates a "magic assembly" effect for the LIM.
 *
 * @param {string} experimentId
 * @param {Function} showMessage
 * @param {Function} speakIfEnabled
 */
async function animatedMountExperiment(experimentId, showMessage, speakIfEnabled) {
  const api = window.__ELAB_API;
  if (!api) return;

  const exp = api.getExperiment?.(experimentId);
  if (!exp) {
    showMessage?.('Esperimento non trovato.', { position: 'top-center', icon: <WarningIcon size={18} />, type: 'info', duration: 3000 });
    return;
  }

  // Step 1: Clear and show "mounting" message
  api.clearCircuit?.();
  showMessage?.(`Sto montando: "${exp.title}"…`, {
    position: 'top-center', icon: <SettingsIcon size={18} />, type: 'hint', duration: 3000,
  });
  speakIfEnabled?.(`Sto montando il circuito: ${exp.title}`);

  await new Promise(r => setTimeout(r, 500));

  // Step 2: Load the experiment (this loads all components and wires at once via selectExperiment)
  api.mountExperiment?.(experimentId);

  await new Promise(r => setTimeout(r, 600));

  // Step 3: Progressive component announcements using the experiment's component list
  const comps = exp.components || [];
  const COMP_NAMES_IT = {
    'resistor': 'il resistore',
    'led': 'il LED',
    'battery9v': 'la batteria',
    'breadboard-half': 'la breadboard',
    'breadboard-full': 'la breadboard grande',
    'capacitor': 'il condensatore',
    'pushbutton': 'il pulsante',
    'potentiometer': 'il potenziometro',
    'buzzer': 'il cicalino',
    'photoresistor': 'il fotoresistore',
    'ldr': 'il sensore di luce',
    'servo': 'il servo',
    'lcd16x2': 'il display',
    'nano-r4': 'l\'Arduino Nano',
    'motor-dc': 'il motore',
  };

  // Announce the first 3 interesting components (skip breadboards from announcement)
  const interesting = comps.filter(c => c.type !== 'breadboard-half' && c.type !== 'breadboard-full').slice(0, 3);
  for (const comp of interesting) {
    const name = COMP_NAMES_IT[comp.type] || comp.type;
    const extra = comp.color ? ` ${comp.color}` : comp.value ? ` da ${comp.value >= 1000 ? comp.value / 1000 + 'k' : comp.value}Ω` : '';
    const msg = `Aggiungo ${name}${extra}`;
    showMessage?.(msg, {
      position: 'contextual',
      targetComponentId: comp.id,
      icon: <CircuitIcon size={18} />,
      type: 'hint',
      duration: 2500,
    });
    await new Promise(r => setTimeout(r, 350));
  }

  await new Promise(r => setTimeout(r, 400));

  // Step 4: Done!
  const doneMsg = `Circuito pronto! "${exp.title}" montato. Premete Play per vederlo funzionare.`;
  showMessage?.(doneMsg, {
    position: 'top-center', icon: <SuccessIcon size={18} />, type: 'success', duration: 7000,
  });
  speakIfEnabled?.(doneMsg);
}

/**
 * Error Boundary — cattura crash in overlay/TTS/mascotte senza uccidere il simulatore.
 * Mostra il children originale (simulatore) anche se UNLIM crasha.
 */
class UnlimErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    logger.error('[UNLIM] Error boundary caught:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * UnlimWrapper — avvolge il contenuto del tutor e aggiunge il layer UNLIM.
 * Auto-rileva l'esperimento corrente ascoltando l'evento 'experimentChange'
 * emesso da __ELAB_API — nessuna prop necessaria da ElabTutorV4.
 *
 * @param {React.ReactNode} children - il contenuto originale (ElabTutorV4 interno)
 */
export default function UnlimWrapper({ children }) {
  const { user } = useAuth();
  const { isUnlim, toggleMode } = useUnlimMode();
  const { messages, showMessage, dismissMessage } = useOverlayMessages();
  const [mascotState, setMascotState] = useState('idle'); // idle, active, thinking, speaking
  const [isLoading, setIsLoading] = useState(false);
  const [inputBarVisible, setInputBarVisible] = useState(false);
  const [currentExperimentId, setCurrentExperimentId] = useState(null);
  // G36: Offline detection — show persistent banner after 2+ consecutive AI failures
  const [isOffline, setIsOffline] = useState(false);
  const failCountRef = useRef(0);

  // G41: Nudge overlay — teacher sends, student sees
  const [pendingNudge, setPendingNudge] = useState(null);
  useEffect(() => {
    if (!user?.id || user?.ruolo === 'docente' || user?.ruolo === 'admin') return;
    return startNudgeListener(user.id, (nudges) => {
      // Show the most recent nudge
      if (nudges.length > 0) setPendingNudge(nudges[nudges.length - 1]);
    });
  }, [user?.id, user?.ruolo]);
  // Escape key dismisses nudge overlay
  useEffect(() => {
    if (!pendingNudge) return;
    const onKey = (e) => { if (e.key === 'Escape') setPendingNudge(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingNudge]);

  // Session tracker — registra messaggi, azioni, errori per ogni esperimento
  const sessionTracker = useSessionTracker();

  // TTS — voce per leggere i messaggi ad alta voce
  const tts = useTTS();
  // TTS: ON di default in Lavagna (docente ha bisogno della voce come guida invisibile)
  // OFF di default in Tutor (studente lavora in silenzio)
  const isLavagna = window.location.hash === '#lavagna';
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const stored = localStorage.getItem('elab-tts-muted');
      if (stored !== null) return stored === 'true'; // rispetta scelta utente
      return !isLavagna; // default: ON in lavagna, OFF altrove
    } catch { return true; }
  });
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem('elab-tts-muted', String(next)); } catch {}
      if (next) tts.stop(); // ferma voce se si muta
      return next;
    });
  }, [tts]);

  // STT — riconoscimento vocale per input voce
  // NOTE: speakIfEnabled moved BELOW stt declaration to avoid TDZ (G42 P0 fix)
  const [sttInputText, setSttInputText] = useState('');
  const stt = useSTT({
    lang: 'it-IT',
    onResult: useCallback((text) => {
      // Testo finale riconosciuto → prima controlla comandi vocali locali
      setSttInputText('');
      if (!text) return;

      // G40: Voice shortcut — intercetta comandi frequenti PRIMA dell'AI
      const match = matchVoiceCommand(text);
      if (match) {
        const feedback = executeVoiceCommand(match.command);
        // Feedback vocale + overlay per comandi diretti
        if (speakIfEnabledRef.current) speakIfEnabledRef.current(feedback);
        if (showMessageRef.current) {
          showMessageRef.current(feedback, {
            position: 'top-center', icon: <MicrophoneIcon size={18} />, type: 'success', duration: 3000,
          });
        }
        if (sessionTrackerRef.current) {
          sessionTrackerRef.current.recordAction('voice_command', match.command.action);
        }
        return;
      }

      // Nessun match → invia a AI come prima
      handleSendRef.current?.(text);
    }, []),
    onInterim: useCallback((text) => {
      setSttInputText(text);
    }, []),
  });
  // G51: One-time browser compat warning for voice control
  useEffect(() => {
    if (!stt.isSupported && !localStorage.getItem('elab_voice_compat_warned')) {
      localStorage.setItem('elab_voice_compat_warned', 'true');
      showMessage('Il controllo vocale funziona su Chrome e Edge. Qui puoi scrivere!', {
        position: 'top-center', icon: <MicrophoneIcon size={18} />, type: 'info', duration: 6000,
      });
    }
  }, [stt.isSupported, showMessage]);

  // Refs per callback stabili (evita dipendenza circolare con useSTT onResult)
  const handleSendRef = useRef(null);
  const speakIfEnabledRef = useRef(null);
  const showMessageRef = useRef(null);
  const sessionTrackerRef = useRef(null);

  // Speak helper — legge il testo se non è mutato
  // G40 fix: guard su stt.isListening per evitare feedback loop mic→TTS→mic
  // G42 P0 fix: moved AFTER stt declaration to avoid TDZ ReferenceError
  const speakIfEnabled = useCallback((text) => {
    if (!isMuted && tts.isSupported && text && !stt.isListening) {
      tts.speak(text);
    }
  }, [isMuted, tts, stt.isListening]);

  // Auto-rileva l'esperimento corrente dall'evento del simulatore
  // P1-2 fix: retry se __ELAB_API non è pronto al mount
  // C1 fix: mountedRef previene memory leak se unmount durante retry
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    function trySubscribe() {
      if (!mountedRef.current) return false;
      const api = window.__ELAB_API;
      if (!api?.on) return false;
      api.on('experimentChange', handleExpChange);
      return true;
    }
    function handleExpChange(data) {
      if (!mountedRef.current) return;
      if (data?.experimentId) setCurrentExperimentId(data.experimentId);
    }
    if (!trySubscribe()) {
      // Retry con backoff: 500ms, 1500ms, 3000ms (LIM lente possono impiegare fino a 5s)
      const delays = [500, 1500, 3000];
      const timers = [];
      let subscribed = false;
      delays.forEach((delay) => {
        timers.push(setTimeout(() => {
          if (!mountedRef.current || subscribed) return;
          subscribed = trySubscribe();
        }, delay));
      });
      return () => {
        mountedRef.current = false;
        timers.forEach(clearTimeout);
        const api = window.__ELAB_API;
        if (api?.off) api.off('experimentChange', handleExpChange);
      };
    }
    return () => {
      mountedRef.current = false;
      const api = window.__ELAB_API;
      if (api?.off) api.off('experimentChange', handleExpChange);
    };
  }, []);

  // Ascolta eventi 'unlim-contextual-message' da ElabTutorV4
  // Quando un'azione highlight viene eseguita, il messaggio appare accanto al componente
  useEffect(() => {
    function handleContextualMessage(e) {
      if (!mountedRef.current || !isUnlim) return;
      const { text, targetComponentId, type, icon, duration } = e.detail || {};
      if (!text) return;
      showMessage(text, {
        position: targetComponentId ? 'contextual' : 'center',
        targetComponentId: targetComponentId || null,
        icon: icon || null,
        type: type || 'info',
        duration: duration || 6000,
      });
      speakIfEnabled(text);
    }
    window.addEventListener('unlim-contextual-message', handleContextualMessage);
    return () => window.removeEventListener('unlim-contextual-message', handleContextualMessage);
  }, [isUnlim, showMessage, speakIfEnabled]);

  // G47: "Chiedi ancora" from UNLIMResponsePanel opens the input bar
  useEffect(() => {
    const handleOpenInput = () => {
      setInputBarVisible(true);
      setMascotState('active');
    };
    window.addEventListener('elab-open-unlim-input', handleOpenInput);
    return () => window.removeEventListener('elab-open-unlim-input', handleOpenInput);
  }, []);

  // Carica il percorso lezione per l'esperimento corrente
  const lessonPath = currentExperimentId ? getLessonPath(currentExperimentId) : null;

  // P0-1 fix: abort richiesta in corso quando si chiude la barra input
  const abortRef = useRef(null);
  const handleMascotClick = useCallback(() => {
    if (inputBarVisible) {
      setInputBarVisible(false);
      setMascotState('idle');
      if (abortRef.current) abortRef.current.abort();
      setIsLoading(false);
      // BUG-20 fix: stop STT and clear interim text when closing input bar
      if (stt.isListening) stt.stopListening();
      setSttInputText('');
    } else {
      setInputBarVisible(true);
      setMascotState('active');
    }
  }, [inputBarVisible, stt]);

  // Quando l'utente invia un messaggio dalla barra input → UNLIM API
  // P1-1 fix: ricalcola lessonPath dentro il callback (no stale closure)
  // P1-5 fix: gestisce isLoading per disabilitare input durante richiesta
  const handleSend = useCallback(async (text) => {
    // G51: Offline guard — show message instead of loading spinner
    if (!navigator.onLine) {
      showMessage('UNLIM non e disponibile offline. Consulta la guida cliccando PREPARA!', {
        position: 'top-center', icon: <AntennaIcon size={18} />, type: 'info', duration: 5000,
      });
      return;
    }

    // G40: Voice shortcut — intercetta comandi vocali anche se digitati
    const voiceMatch = matchVoiceCommand(text);
    if (voiceMatch) {
      const feedback = executeVoiceCommand(voiceMatch.command);
      showMessage(feedback, {
        position: 'top-center', icon: <MicrophoneIcon size={18} />, type: 'success', duration: 3000,
      });
      speakIfEnabled(feedback);
      sessionTracker.recordAction('voice_command', voiceMatch.command.action);
      return;
    }

    // "Non so" celebration — celebrate honesty, then guide discovery
    const NON_SO_RE = /^(non\s+(?:lo\s+)?so|boh|non\s+capisco|non\s+ho\s+capito|aiuto)\s*[.!?]*$/i;
    if (NON_SO_RE.test(text.trim())) {
      const celebrations = [
        'Fantastico che lo dici! "Non so" e il primo passo per imparare. Proviamo insieme?',
        'Bravo/a! Chi dice "non so" e piu coraggioso di chi inventa. Vediamo un po\'...',
        'Perfetto! "Non so" significa che stai pensando davvero. Ripartiamo dal circuito.',
        'Grande! Non sapere e normalissimo. Guardiamo insieme cosa succede nel circuito.',
      ];
      const msg = celebrations[Math.floor(Math.random() * celebrations.length)];
      showMessage(msg, { position: 'top-center', icon: <StarIcon size={18} />, type: 'success', duration: 6000 });
      speakIfEnabled(msg);
      sessionTracker.recordAction('non_so_celebration', text);
      setMascotState('speaking');
      setTimeout(() => setMascotState(inputBarVisible ? 'active' : 'idle'), 4000);
      return;
    }

    // Intercetta comando "crea il report" — eseguilo localmente senza AI
    if (isReportCommand(text)) {
      const opened = openReportWindow(currentExperimentId);
      if (opened === 'downloaded') {
        showMessage('Report scaricato! Aprilo dalla cartella Download.', {
          position: 'top-center', icon: '\uD83D\uDCC4', type: 'success', duration: 8000,
        });
        speakIfEnabled('Report scaricato! Aprilo dalla cartella Download.');
        sessionTracker.recordAction('report_downloaded', currentExperimentId || 'last');
      } else if (opened) {
        showMessage('Report generato! Usa Stampa per salvarlo come PDF.', {
          position: 'top-center', icon: '\uD83D\uDCC4', type: 'success', duration: 6000,
        });
        speakIfEnabled('Report generato! Usa il pulsante Stampa per salvarlo come PDF.');
        sessionTracker.recordAction('report_generated', currentExperimentId || 'last');
      } else {
        showMessage('Non ci sono ancora dati per il report. Fate prima una lezione!', {
          position: 'top-center', icon: '\u26A0\uFE0F', type: 'info', duration: 5000,
        });
        speakIfEnabled('Non ci sono ancora dati per il report. Fate prima una lezione!');
      }
      return;
    }

    // Rate limit check — prevent spam from children tapping rapidly
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      showMessage(rateCheck.message || 'Aspetta qualche secondo...', {
        position: 'top-center', icon: <LoadingIcon size={18} />, type: 'info', duration: 3000,
      });
      return;
    }
    setMascotState('thinking');
    setIsLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Record user message in session
    sessionTracker.recordMessage('user', text);

    const path = currentExperimentId ? getLessonPath(currentExperimentId) : null;

    // Inject class context + forbidden vocabulary into experiment context for AI
    const classCtx = buildClassContext();
    const expCtx = path
      ? `Esperimento: ${path.title} (${path.experiment_id}). Obiettivo: ${path.objective || ''}`
      : undefined;
    // Vocabulary constraint: inject forbidden words so AI avoids them
    const forbidden = path?.vocabulary?.forbidden;
    const vocabCtx = forbidden?.length
      ? `VOCABOLARIO VIETATO — NON usare MAI queste parole: ${forbidden.join(', ')}. Usa solo parole dalla lista consentita del livello attuale.`
      : undefined;
    // G36: inject student memory so AI personalizes responses
    const memoryCtx = unlimMemory.buildMemoryContext() || undefined;
    // S1 Ciclo 5: Inject circuit context so AI always knows what's on the breadboard
    const circuitCtx = (() => {
      try {
        const ctx = window.__ELAB_API?.getSimulatorContext?.();
        if (!ctx) return undefined;
        const parts = [];
        if (ctx.components?.length > 0) {
          const compNames = ctx.components.map(c => `${c.type}(${c.id})`).join(', ');
          parts.push(`Circuito attuale: ${compNames}.`);
        }
        if (ctx.wires?.length > 0) parts.push(`Fili: ${ctx.wires.length}.`);
        if (ctx.simulation?.state === 'running') parts.push('Simulazione in corso.');
        return parts.length > 0 ? `STATO CIRCUITO: ${parts.join(' ')}` : undefined;
      } catch { return undefined; }
    })();

    const fullContext = [expCtx, vocabCtx, classCtx, memoryCtx, circuitCtx].filter(Boolean).join('\n') || undefined;

    try {
      const result = await sendChat(text, [], {
        signal: controller.signal,
        experimentId: currentExperimentId || undefined,
        experimentContext: fullContext,
      });

      if (controller.signal.aborted) return;

      if (result?.success && result.response) {
        // G36: AI responded — clear offline state
        failCountRef.current = 0;
        setIsOffline(false);

        // S1 Ciclo 4: Parse and execute [INTENT:{...}] tags from AI response
        const intentMatches = [...result.response.matchAll(/\[INTENT:(\{[^}]+\})\]/gi)];
        for (const im of intentMatches) {
          try {
            const intent = JSON.parse(im[1]);
            executeIntent(intent, showMessage, speakIfEnabled);
          } catch { /* malformed INTENT — ignore */ }
        }

        // Estrai target componentId da action tags nella risposta
        const highlightMatch = result.response.match(/\[azione:highlight:([^\]]+)\]/i);
        const targetComponentId = highlightMatch
          ? highlightMatch[1].split(',')[0].trim()
          : null;

        // Rimuovi i tag azione e INTENT dal testo visualizzato
        const cleanText = result.response
          .replace(/\[azione:[^\]]+\]/gi, '')
          .replace(/\[INTENT:[^\]]+\]/gi, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        // Tronca a 40 parole per overlay LIM — testo completo va alla voce TTS
        const MAX_OVERLAY_WORDS = 40;
        const words = cleanText.split(/\s+/);
        const displayText = words.length > MAX_OVERLAY_WORDS
          ? words.slice(0, MAX_OVERLAY_WORDS).join(' ') + '…'
          : cleanText;

        setMascotState('speaking');
        showMessage(displayText, {
          position: targetComponentId ? 'contextual' : 'top-center',
          targetComponentId,
          icon: <RobotIcon size={18} />,
          type: 'info',
          duration: 12000,
        });
        speakIfEnabled(cleanText);
        // Record assistant response in session
        sessionTracker.recordMessage('assistant', cleanText);
        if (targetComponentId) {
          sessionTracker.recordAction('highlight', targetComponentId);
        }
      } else {
        // G36: track consecutive failures for offline detection
        failCountRef.current += 1;
        if (failCountRef.current >= 2) setIsOffline(true);
        showMessage('Non sono riuscito a rispondere. Riprova tra poco!', {
          position: 'top-center',
          icon: <WarningIcon size={18} />,
          type: 'info',
          duration: 4000,
        });
      }
    } catch (err) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;
      failCountRef.current += 1;
      if (failCountRef.current >= 2) setIsOffline(true);
      showMessage('Errore di connessione. Controlla la rete e riprova.', {
        position: 'top-center',
        icon: <WarningIcon size={18} />,
        type: 'info',
        duration: 4000,
      });
    } finally {
      if (!controller.signal.aborted) {
        setMascotState('active');
        setIsLoading(false);
      }
    }
  }, [showMessage, currentExperimentId, speakIfEnabled, sessionTracker]);
  // Aggiorna refs per callback stabili (usati da STT onResult senza dipendenza circolare)
  handleSendRef.current = handleSend;
  speakIfEnabledRef.current = speakIfEnabled;
  showMessageRef.current = showMessage;
  sessionTrackerRef.current = sessionTracker;
  // Cleanup abort controller on unmount
  useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

  // Mostra messaggio di benvenuto contestuale (basato sulla storia classe)
  // Se c'è un esperimento caricato → class_hook del lesson path
  // Se non c'è esperimento → welcome message contestuale + suggerimento
  const welcomeShownRef = useRef(false);
  useEffect(() => {
    if (!isUnlim) return;

    if (currentExperimentId) {
      // G38: Welcome contestuale — messaggio specifico per esperimento (max 15 parole)
      const expWelcome = getExpWelcome(currentExperimentId);
      const path = getLessonPath(currentExperimentId);
      const preparePhase = path?.phases?.[0];
      const welcomeText = expWelcome || preparePhase?.class_hook;
      if (welcomeText) {
        const timer = setTimeout(() => {
          showMessage(welcomeText, {
            position: 'contextual',
            targetComponentId: null,
            icon: expWelcome ? <FlaskIcon size={18} /> : <LightbulbIcon size={18} />,
            type: 'hint',
            duration: 8000,
          });
          speakIfEnabled(welcomeText);
          sessionTracker.recordAction('welcome_shown', welcomeText);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } else if (!welcomeShownRef.current) {
      // Nessun esperimento → messaggio di benvenuto contestuale
      welcomeShownRef.current = true;
      const welcome = getWelcomeMessage();
      let innerTimer, loadTimer;
      const WELCOME_DURATION = 10000;
      const timer = setTimeout(() => {
        showMessage(welcome.text, {
          position: 'top-center',
          icon: welcome.type === 'first_time' ? <HandWaveIcon size={18} /> : <PartyIcon size={18} />,
          type: 'hint',
          duration: WELCOME_DURATION,
        });
        speakIfEnabled(welcome.text);

        // Suggerimento DOPO che il welcome scompare (no sovrapposizione)
        const suggestion = getNextLessonSuggestion();
        if (suggestion) {
          innerTimer = setTimeout(() => {
            showMessage(suggestion.message, {
              position: 'top-center',
              icon: <BookIcon size={18} />,
              type: 'hint',
              duration: 12000,
            });
            speakIfEnabled(suggestion.message);
          }, WELCOME_DURATION + 1000);

          // Principio Zero: auto-load primo esperimento per nuovi utenti
          // Per i ritorni il docente decide — ha già visto il flusso
          if (welcome.type === 'first_time') {
            loadTimer = setTimeout(() => {
              if (window.__ELAB_API?.loadExperiment) {
                window.__ELAB_API.loadExperiment(suggestion.experimentId);
              }
            }, WELCOME_DURATION + 3000);
          }
        }
      }, 1000);
      return () => { clearTimeout(timer); clearTimeout(innerTimer); clearTimeout(loadTimer); };
    }
  }, [currentExperimentId, isUnlim, showMessage, speakIfEnabled, sessionTracker]);

  // In Classic Mode: renderizza solo i children + switch
  if (!isUnlim) {
    return (
      <div className={css.root}>
        {children}
        <div className={css.modeSwitchFixed}>
          <UnlimModeSwitch isUnlim={isUnlim} onToggle={toggleMode} />
        </div>
      </div>
    );
  }

  // UNLIM Mode: children + mascotte + overlay + input bar + switch
  // ErrorBoundary wrappa SOLO il layer UNLIM — se crasha, il simulatore resta vivo
  return (
    <div className={css.root}>
      {/* Contenuto originale (ElabTutorV4) — FUORI dal boundary */}
      {children}

      <UnlimErrorBoundary fallback={null}>
        {/* G36: Persistent offline banner — orange, not scary red */}
        {isOffline && (
          <div role="alert" className={css.offlineBanner}>
            <AntennaIcon size={18} color="var(--color-text, #1A1A2E)" />
            Connessione AI non disponibile — il simulatore funziona, la chat riproverà automaticamente
            <button
              type="button"
              aria-label="Chiudi avviso connessione"
              onClick={() => { failCountRef.current = 0; setIsOffline(false); }}
              className={css.offlineDismiss}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        )}

        {/* G41: Teacher nudge overlay — gentle encouragement from teacher */}
        {pendingNudge && (
          <div
            role="presentation"
            onClick={() => setPendingNudge(null)}
            className={css.nudgeBackdrop}
          />
        )}
        {pendingNudge && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nudge-title"
            onClick={(e) => e.stopPropagation()}
            className={css.nudgeDialogAnimated}
          >
            <div className={css.nudgeIcon} aria-hidden="true"><LetterIcon size={36} color="var(--color-primary, var(--elab-navy))" /></div>
            <p id="nudge-title" className={css.nudgeTitle}>
              {pendingNudge.message}
            </p>
            <p className={css.nudgeFrom}>
              — Il tuo insegnante
            </p>
            <button
              type="button"
              autoFocus
              onClick={() => setPendingNudge(null)}
              aria-label="Chiudi messaggio insegnante"
              className={css.nudgeCloseBtn}
            >
              Grazie!
            </button>
          </div>
        )}

        {/* Overlay messaggi contestuali — click chiude messaggio E ferma voce */}
        <UnlimOverlay messages={messages} onDismiss={(id) => { dismissMessage(id); tts.stop(); }} />

        {/* Mascotte nell'angolo — tap=chat, long-press=mute */}
        <UnlimMascot
          state={mascotState}
          onClick={handleMascotClick}
          isMuted={isMuted}
          onLongPress={tts.isSupported ? toggleMute : undefined}
        />

        {/* Barra input (visibile quando la mascotte è attiva) */}
        {inputBarVisible && (
          <UnlimInputBar
            onSend={handleSend}
            onReport={() => handleSend('crea il report')}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onMicClick={() => {
              if (!stt.isSupported) {
                showMessage('La voce funziona solo su Chrome o Edge. Scrivete qui sotto!', {
                  position: 'top-center', icon: <MicrophoneIcon size={18} />, type: 'info', duration: 5000,
                });
                return;
              }
              if (stt.isListening) { stt.stopListening(); return; }
              tts.stop();
              setTimeout(() => stt.startListening(), 150);
            }}
            isListening={stt.isListening}
            isLoading={isLoading}
            placeholder={stt.isListening
              ? (sttInputText || 'Sto ascoltando...')
              : isOffline
                ? 'Offline — prova comandi: "avvia", "stop", "compila"...'
                : lessonPath
                  ? `Chiedi qualcosa su "${lessonPath.title}"...`
                  : 'Chiedi qualcosa a UNLIM...'}
          />
        )}
      </UnlimErrorBoundary>
    </div>
  );
}

// Re-export per uso esterno
export { useUnlimMode } from './UnlimModeSwitch';
