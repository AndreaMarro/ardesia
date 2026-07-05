// ============================================
// ELAB Tutor V4 - Assistente AI Premium
// Smart container: state + logic + composition
// Rendering extracted to sub-components
// © Andrea Marro — 08/02/2026
// Tutti i diritti riservati
// ============================================

import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import './ElabTutorV4.css';
import { sendChat, analyzeImage, checkRateLimit, diagnoseCircuit, getExperimentHints } from '../../services/api';
import { getTotalExperiments, EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3 } from '../../data/experiments-index';
import { buildClassProfile, getNextLessonSuggestion } from '../../services/classProfile';
import { validateMessage, sanitizeOutput } from '../../utils/contentFilter';
import unlimMemory from '../../services/unlimMemory'; // UNLIM Onnipotente: persistent memory
import studentTracker from '../../services/studentTracker';
import { showToast } from '../common/Toast';
import { formatForContext as formatActivityContext, pushActivity } from '../../services/activityBuffer'; // Sprint 1 Context Mastery
import { sessionMetrics } from '../../services/sessionMetrics'; // Sprint 1 Context Mastery: session metrics
import { findVideo, getYouTubeSearchUrl } from '../../data/unlim-videos'; // UNLIM Onnipotente: curated YouTube DB
import { getNewConcepts, getPrerequisites } from '../../data/concept-graph'; // PDR: concept graph for pedagogical context
import { TabHint } from './ContextualHints';
import NewElabSimulator from '../simulator/NewElabSimulator';
const CircuitDetective = lazy(() => import('./CircuitDetective'));
const PredictObserveExplain = lazy(() => import('./PredictObserveExplain'));
const ReverseEngineeringLab = lazy(() => import('./ReverseEngineeringLab'));
const CircuitReview = lazy(() => import('./CircuitReview'));
// (projectHistoryService rimosso — usato solo da handleCompile eliminato)
import studentService from '../../services/studentService';
import { useConfirmModal } from '../common/ConfirmModal';
import TutorLayout from './TutorLayout';
import useIsMobile from '../../hooks/useIsMobile';
import { useHostIdentity } from '../../plugin/hostIdentity';
import { SessionRecorderProvider } from '../../context/SessionRecorderContext';
const ManualTab = lazy(() => import('./ManualTab'));
const CanvasTab = lazy(() => import('./CanvasTab'));
const NotebooksTab = lazy(() => import('./NotebooksTab'));
const VideosTab = lazy(() => import('./VideosTab'));

import PresentationModal from './PresentationModal';
import VolumeChooser from './VolumeChooser';
import { loadPdfJs } from './utils/documentConverters';
import logger from '../../utils/logger';
import { captureWhiteboardScreenshot } from '../../utils/whiteboardScreenshot';
import {
    checkVoiceCapabilities, startRecording, stopRecording, isRecording as isVoiceRecording,
    cancelRecording, sendVoiceChat, synthesizeSpeech, playAudio, playTracked, stopPlayback,
    unlockAudioPlayback,
} from '../../services/voiceService';

// ── localStorage notebook size cap ──────────────────
const MAX_NOTEBOOKS = 20;
const MAX_DATAURL_LENGTH = 500_000; // 500KB

/**
 * Generate a size-capped data URL from a canvas.
 * If the result exceeds MAX_DATAURL_LENGTH, re-encode as JPEG at lower quality.
 * Returns null if still too large after quality reduction.
 */
function cappedToDataURL(canvas, format = 'image/jpeg', quality = 0.6) {
    if (!canvas) return null;
    let dataUrl = canvas.toDataURL(format, quality);
    if (dataUrl.length <= MAX_DATAURL_LENGTH) return dataUrl;
    // Try lower quality JPEG
    dataUrl = canvas.toDataURL('image/jpeg', 0.3);
    if (dataUrl.length <= MAX_DATAURL_LENGTH) return dataUrl;
    // Still too large — skip saving image
    return null;
}

/**
 * Cap notebooks array to MAX_NOTEBOOKS, keeping the most recent.
 */
function capNotebooks(notebooksArr) {
    if (notebooksArr.length <= MAX_NOTEBOOKS) return notebooksArr;
    return notebooksArr.slice(0, MAX_NOTEBOOKS);
}

/**
 * Save notebooks to localStorage with size cap.
 */
function persistNotebooks(notebooksArr, toastFn) {
    const capped = capNotebooks(notebooksArr);
    try {
        localStorage.setItem('elab-notebooks', JSON.stringify(capped));
    } catch (e) {
        if (e?.name === 'QuotaExceededError' || e?.code === 22) {
            if (toastFn) toastFn('Spazio di archiviazione pieno! Elimina alcuni taccuini vecchi.', 'warning');
        }
    }
    return capped;
}

/**
 * Extract [INTENT:{...}] tags from text using balanced-brace matching.
 * Unlike regex, this correctly handles nested JSON brackets.
 * @returns {Array<{fullMatch: string, json: string}>}
 */
function extractIntentTags(text) {
    const results = [];
    const marker = '[INTENT:';
    let pos = 0;
    while (pos < text.length) {
        const start = text.indexOf(marker, pos);
        if (start === -1) break;
        const jsonStart = start + marker.length;
        if (text[jsonStart] !== '{') { pos = jsonStart; continue; }
        let depth = 0;
        let end = -1;
        for (let i = jsonStart; i < text.length; i++) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') {
                depth--;
                if (depth === 0) { end = i; break; }
            }
        }
        if (end === -1) break;
        if (text[end + 1] === ']') {
            results.push({
                fullMatch: text.substring(start, end + 2),
                json: text.substring(jsonStart, end + 1)
            });
        }
        pos = (end !== -1) ? end + 2 : jsonStart;
    }
    return results;
}

const TOTAL_EXPERIMENTS = getTotalExperiments();
const VOL1_COUNT = EXPERIMENTS_VOL1?.experiments?.length || 0;
const VOL2_COUNT = EXPERIMENTS_VOL2?.experiments?.length || 0;
const VOL3_COUNT = EXPERIMENTS_VOL3?.experiments?.length || 0;

export default function ElabTutorV4({ provaMode = false, onNavigate, initialExperimentId: deepLinkExpId }) {
    // ===================== STATE =====================
    const { user, isDocente } = useHostIdentity();
    const { confirm: confirmModal, ConfirmDialog } = useConfirmModal();

    // ── VOLUME SECTIONS (G22): Primary volume state ──
    // activeVolume: null = not chosen, 1/2/3 = volume, 'inventor' = free mode
    // Persisted in localStorage for "Bentornati" return flow
    const _savedVolume = useMemo(() => {
        try {
            const saved = localStorage.getItem('elab_active_volume');
            if (saved === 'inventor') return 'inventor';
            const num = Number(saved);
            return (num >= 1 && num <= 3) ? num : null;
        } catch { return null; }
    }, []);
    const [activeVolume, setActiveVolumeRaw] = useState(_savedVolume);
    // showVolumeChooser: skip if returning user has a saved volume (Principio Zero — 0 clicks to start)
    const [showVolumeChooser, setShowVolumeChooser] = useState(!_savedVolume);
    const setActiveVolume = useCallback((vol) => {
        setActiveVolumeRaw(vol);
        setShowVolumeChooser(false);
        try { localStorage.setItem('elab_active_volume', String(vol)); } catch { /* silent */ }
    }, []);

    // Chat State — Principio Zero: welcome dinamico basato sulla storia classe
    const _classProfile = buildClassProfile();
    const _nextSuggestion = getNextLessonSuggestion();
    // Welcome message adapts: if volume already chosen, show context; if not, volume chooser overlay handles it
    const _welcomeText = activeVolume
        ? (activeVolume === 'inventor'
            ? `**Modalità Inventore attiva!**\n\nHai tutti i componenti a disposizione. Costruisci quello che vuoi!`
            : _nextSuggestion
                ? `**Pronti!**\n\nVolume ${activeVolume} attivo. Oggi: **${_nextSuggestion.title}** — premete Inizia!`
                : `**Pronti!**\n\nVolume ${activeVolume} attivo. Scegliete un esperimento o chiedetemi qualcosa!`)
        : `**Ciao! Sono UNLIM**\n\nScegliete il volume per iniziare!`;
    const [messages, setMessages] = useState([{
        id: 'welcome',
        role: 'assistant',
        content: _welcomeText,
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isSocraticMode = true; // Always active — guide mode IS the product

    // Active Experiment (for AI context) — MUST be declared before useCallbacks that depend on it
    const [activeExperiment, setActiveExperiment] = useState(null);

    // Principio Zero: progressive disclosure basata sul volume
    // Vol1/Vol2 = LIVELLO 1 (solo breadboard, lesson path, UNLIM)
    // Vol3/Inventore = LIVELLO 2 (+ editor codice, Scratch, Serial Monitor)
    const disclosureLevel = useMemo(() => {
        if (activeVolume === 'inventor' || activeVolume === 3) return 2;
        if (activeExperiment?.id?.startsWith('v3-')) return 2;
        return 1;
    }, [activeExperiment?.id, activeVolume]);

    // Voice State (UNLIM speaks — realtime via nanobot)
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceRecording, setVoiceRecording] = useState(false);
    const [voicePlaying, setVoicePlaying] = useState(false);
    const [voiceAvailable, setVoiceAvailable] = useState(false);

    // S92: Safety timeout — auto-reset isLoading if stuck for >30s
    useEffect(() => {
        if (!isLoading) return;
        const timeout = setTimeout(() => {
            logger.warn('[UNLIM] isLoading stuck for 30s — auto-resetting');
            setIsLoading(false);
        }, 30000);
        return () => clearTimeout(timeout);
    }, [isLoading]);

    // ─── Voice: detect capabilities on mount ───
    useEffect(() => {
        checkVoiceCapabilities().then(caps => {
            const available = caps.stt && caps.tts && caps.microphone;
            setVoiceAvailable(available);
            logger.debug(`[Voice] Capabilities: STT=${caps.stt} TTS=${caps.tts} Mic=${caps.microphone}`, available ? 'Ready' : 'Not available');
        }).catch(() => setVoiceAvailable(false));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => { cancelRecording(); stopPlayback(); };
    }, []);

    /**
     * Toggle voice mode on/off.
     */
    const handleVoiceToggle = useCallback((enabled) => {
        if (enabled && !voiceAvailable) {
            logger.warn('[Voice] Not available — cannot enable');
            return;
        }
        if (enabled) unlockAudioPlayback(); // Unlock browser autoplay on user gesture
        setVoiceEnabled(enabled);
        if (!enabled) {
            cancelRecording();
            stopPlayback();
            setVoiceRecording(false);
            setVoicePlaying(false);
        }
        logger.debug(`[Voice] ${enabled ? 'Enabled' : 'Disabled'}`);
    }, [voiceAvailable]);

    /**
     * Start/stop voice recording. On stop, sends to /voice-chat.
     * Called by ChatOverlay microphone button (press-to-talk or toggle).
     */
    const handleVoiceRecord = useCallback(async () => {
        if (isLoading) return;
        unlockAudioPlayback(); // Ensure audio unlocked on every record tap

        if (isVoiceRecording()) {
            // Stop recording → send to nanobot
            setVoiceRecording(false);
            setIsLoading(true);

            try {
                const audioBlob = await stopRecording();
                if (!audioBlob || audioBlob.size < 100) {
                    setIsLoading(false);
                    return;
                }

                // Add "recording" indicator to chat
                const recordingMsgId = 'voice-' + Date.now();
                setMessages(prev => [...prev, {
                    id: recordingMsgId,
                    role: 'user',
                    content: 'Messaggio vocale in elaborazione...',
                    isVoice: true,
                }]);

                // Collect simulator context for voice (same as text chat path)
                let simulatorCtx = null;
                try {
                    const api = typeof window !== 'undefined' && window.__ELAB_API;
                    if (api?.getSimulatorContext) {
                        simulatorCtx = api.getSimulatorContext();
                    }
                } catch { /* silent */ }

                // Send to nanobot voice-chat (STT → AI → TTS in one call)
                const result = await sendVoiceChat(audioBlob, {
                    sessionId: localStorage.getItem('elab_tutor_session') || '',
                    experimentId: activeExperiment?.id || '',
                    circuitState: circuitStateRef.current?.structured
                        ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                        : (circuitStateRef.current ? { raw: circuitStateRef.current } : null),
                    simulatorContext: simulatorCtx,
                });

                if (result.success) {
                    // Update user message with transcript
                    setMessages(prev => prev.map(m =>
                        m.id === recordingMsgId
                            ? { ...m, content: result.userText || '(audio)', isVoice: true }
                            : m
                    ));

                    // Add AI response with tags stripped + execute actions (shared with text chat)
                    if (result.response) {
                        const voiceAiResponse = sanitizeOutput(String(result.response));
                        const voiceMsgId = 'voice-resp-' + Date.now();

                        // Strip tags for display
                        let voiceStripped = voiceAiResponse;
                        for (const { fullMatch } of extractIntentTags(voiceAiResponse)) {
                            voiceStripped = voiceStripped.replace(fullMatch, '');
                        }
                        const voiceDisplayText = voiceStripped
                            .replace(/\[azione:[^\]]+\]/gi, '')
                            .replace(/\[AZIONE:[^\]]+\]/g, '')
                            .replace(/\n{3,}/g, '\n\n')
                            .trim();

                        // Add cleaned message
                        setMessages(prev => [...prev, {
                            id: voiceMsgId,
                            role: 'assistant',
                            content: voiceDisplayText || voiceAiResponse,
                            isVoice: true,
                            timing: result.timing,
                            _executedActions: [],
                        }]);

                        // Execute ALL action tags (same as text chat)
                        await processAiResponse(voiceAiResponse, result.userText || '', voiceMsgId);
                    }

                    // Play audio response if available
                    if (result.audio && voiceEnabled) {
                        setVoicePlaying(true);
                        try {
                            await playTracked(result.audio, result.audioFormat || 'audio/mpeg');
                        } catch (e) {
                            logger.error('[Voice] Playback failed:', e);
                        }
                        setVoicePlaying(false);
                    }
                } else {
                    setMessages(prev => prev.map(m =>
                        m.id === recordingMsgId
                            ? { ...m, content: 'Non sono riuscito a capire. Riprova!' }
                            : m
                    ));
                }
            } catch (err) {
                logger.error('[Voice] Error:', err);
                setMessages(prev => [...prev, {
                    id: 'voice-err-' + Date.now(),
                    role: 'assistant',
                    content: 'Scusa, c\'è stato un problema con la voce. Provate a scrivere oppure riprovate!',
                }]);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Start recording
            const started = await startRecording();
            if (started) {
                setVoiceRecording(true);
                stopPlayback(); // Stop any playing audio
            } else {
                // Microphone denied
                setMessages(prev => [...prev, {
                    id: 'mic-err-' + Date.now(),
                    role: 'assistant',
                    content: 'Per usare la voce, devi permettere l\'accesso al microfono nelle impostazioni del browser.',
                }]);
            }
        }
    }, [isLoading, voiceEnabled, activeExperiment]);

    /**
     * Auto-speak the latest AI response when voice mode is on.
     * Uses useEffect to react to new messages — works for ALL chat paths
     * (text, voice, vision, hints, detective, etc.) without modifying each one.
     */
    const lastMsgRef = useRef(null);
    useEffect(() => {
        if (!voiceEnabled || messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        // Only speak assistant messages, not user messages
        if (lastMsg.role !== 'assistant') return;
        // Don't re-speak same message
        if (lastMsg.id === lastMsgRef.current) return;
        // Don't speak voice responses (already spoken via /voice-chat)
        if (lastMsg.isVoice) return;
        lastMsgRef.current = lastMsg.id;

        // Async TTS in background
        (async () => {
            try {
                setVoicePlaying(true);
                const audioData = await synthesizeSpeech(lastMsg.content);
                await playTracked(audioData, 'audio/mpeg');
            } catch (e) {
                logger.error('[Voice] Auto-speak failed:', e);
            } finally {
                setVoicePlaying(false);
            }
        })();
    }, [messages, voiceEnabled]);

    // (CodePanel rimosso — editor Arduino eliminato)

    // Context Panel State
    const [activeTab, _setActiveTab] = useState('simulator');
    const setActiveTab = useCallback((tab) => {
      _setActiveTab(prev => { if (prev !== tab) pushActivity('tab_switch', `${prev}→${tab}`); return tab; });
    }, []);
    const [pendingExperimentId, setPendingExperimentId] = useState(
        deepLinkExpId || (provaMode ? 'v1-cap6-esp1' : null)
    );
    const [pdfZoom, setPdfZoom] = useState(1);
    const [fitMode, setFitMode] = useState('width');

    // UI Visibility State
    const [showChat, setShowChat] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Preloaded Volumes State
    const [volumePages, setVolumePages] = useState({ 1: [], 2: [], 3: [] });
    const [loadingVolume, setLoadingVolume] = useState(null);
    const [volumeProgress, setVolumeProgress] = useState(null); // S112: download progress 0-100
    const [selectedVolume, setSelectedVolume] = useState(null);

    // Document Viewer State
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [currentDocPage, setCurrentDocPage] = useState(0);
    const [viewMode, setViewMode] = useState('manual');
    const docViewerRef = useRef(null);

    // Canvas refs (shared with CanvasTab)
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    // YouTube + Meet state (shared with VideosTab)
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [meetLink, setMeetLink] = useState('');
    const [meetActive, setMeetActive] = useState(false);
    const [meetCopied, setMeetCopied] = useState(false);

    // AbortController for analyzeImage — cancels previous in-flight request (race condition fix)
    const analyzeAbortRef = useRef(null);

    // UNLIM PERVASIVO: Live circuit state from NewElabSimulator (ref = no re-render)
    // Updated via onCircuitStateChange callback, read when user sends chat message
    const circuitStateRef = useRef(null);

    // ── UNLIM ONNIPOTENTE: Tracking refs ──
    const interactionHistoryRef = useRef([]); // last N user interactions with circuit
    const errorHistoryRef = useRef([]);       // recent circuit errors (polarita, short, etc.)
    const sessionStartRef = useRef(Date.now());
    // ── Session Report: refs passed to simulator for PDF generation ──
    const messagesForReportRef = useRef([]);
    const quizResultsForReportRef = useRef(null);
    useEffect(() => { messagesForReportRef.current = messages; }, [messages]);
    const buildStepIndexRef = useRef(-1);
    const inactivityTimerRef = useRef(null);
    const proactiveCooldownRef = useRef(0); // prevent spam: last proactive auto-send timestamp

    // Sprint 1 Context Mastery: track tab switches
    const prevTabRef = useRef(activeTab);
    useEffect(() => {
        if (activeTab !== prevTabRef.current) {
            pushActivity('tab_switch', activeTab);
            prevTabRef.current = activeTab;
        }
    }, [activeTab]);

    // ── UNLIM ONNIPOTENTE: Experiment change handler with memory tracking ──
    const handleExperimentChange = useCallback((experiment) => {
        setActiveExperiment(experiment);
        // Track in persistent memory
        if (experiment?.id) {
            try { unlimMemory.trackExperimentCompletion(experiment.id, 'loaded'); } catch { /* silent */ }
        }
    }, []);

    // UNLIM PERVASIVO: Proactive event handler — UNLIM intervenes on circuit events
    // Called by NewElabSimulator when critical events happen (LED burned, high current, etc.)
    // S58 FIX: Anti-spam — deduplicate messages, longer cooldowns, suppress repeated success msgs
    const lastProactiveRef = useRef({ message: '', timestamp: 0 }); // dedup tracker
    const handleCircuitEvent = useCallback((event) => {
        if (!event?.message) return;

        // ── UNLIM ONNIPOTENTE: Track interaction history ──
        interactionHistoryRef.current.push({
            type: event.type || 'event',
            summary: `${event.type || 'event'}:${event.componentId || ''}`,
            timestamp: Date.now(),
        });
        if (interactionHistoryRef.current.length > 20) {
            interactionHistoryRef.current = interactionHistoryRef.current.slice(-20);
        }
        // Track errors specifically
        if (event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') {
            errorHistoryRef.current.push(`${event.type}:${event.componentId || ''}`);
            if (errorHistoryRef.current.length > 10) {
                errorHistoryRef.current = errorHistoryRef.current.slice(-10);
            }
            // Track mistake in persistent memory
            try { unlimMemory.trackMistake(event.type, `${event.componentId || 'unknown'}: ${(event.message || '').slice(0, 80)}`); } catch { /* silent */ }
        }

        // ── S58 FIX: Anti-spam deduplication ──
        // Suppress identical messages within 30s, and success events ("LED acceso", "Bravo") within 120s
        const now = Date.now();
        const msgKey = event.message.slice(0, 50); // first 50 chars as dedup key
        const isSuccess = /bravo|funziona|acceso|accendi/i.test(event.message);
        const dedupWindow = isSuccess ? 120000 : 30000; // 2min for success, 30s for errors
        if (msgKey === lastProactiveRef.current.message && now - lastProactiveRef.current.timestamp < dedupWindow) {
            return; // Skip duplicate — already shown recently
        }
        lastProactiveRef.current = { message: msgKey, timestamp: now };

        // ── UNLIM ONNIPOTENTE (Fase 6): Proactive auto-diagnosis on critical errors ──
        // After showing the built-in event message, auto-send to AI for deeper analysis
        // S58 FIX: Increased cooldown 10s → 60s to prevent diagnosis spam
        if ((event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') &&
            now - proactiveCooldownRef.current > 60000) { // 60s cooldown between auto-diagnoses
            proactiveCooldownRef.current = now;
            setTimeout(() => {
                const autoMsg = `[EVENTO CIRCUITO: ${event.type} su ${event.componentId || 'componente'}] Analizza questo errore del circuito e aiuta lo studente a capire cosa è andato storto e come correggere.`;
                handleSend(autoMsg);
            }, 2000); // 2s delay so user sees the event first
        }

        // Add UNLIM's proactive message to chat
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: event.message,
            proactive: true, // Mark as proactive (not user-triggered)
        }]);
        // S92: Only auto-open chat for critical events (burnout, short-circuit, high-current).
        // Non-critical events add the message silently — user sees notification badge.
        if (event.type === 'burnout' || event.type === 'short-circuit' || event.type === 'high-current') {
            setShowChat(true);
        }
    }, []);

    // ── UNLIM ONNIPOTENTE: YouTube search handler (curated DB + fallback) ──
    const handleYouTubeSearch = useCallback((query) => {
        // Try curated video DB first
        const curated = findVideo(query);
        if (curated) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `Ho trovato un video perfetto su **${curated.topic}**: "${curated.title}" di ${curated.channel}`,
                proactive: true,
                youtubeSearch: { url: curated.url, query: curated.title, curated: true },
            }]);
        } else {
            // Fallback: YouTube search URL
            const searchUrl = getYouTubeSearchUrl(query);
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `Ecco, ho cercato "${query}" su YouTube per te!`,
                proactive: true,
                youtubeSearch: { url: searchUrl, query: query },
            }]);
        }
    }, []);

    // MCP Tool: diagnoseCircuit — proactive circuit diagnosis via nanobot
    const handleDiagnoseCircuit = useCallback(async () => {
        const state = circuitStateRef.current?.text || circuitStateRef.current;
        if (!state) {
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: 'Non c\'è un circuito attivo da analizzare. Aprite un esperimento nel simulatore e costruite qualcosa!',
                proactive: true,
            }]);
            setShowChat(true);
            return;
        }
        setIsLoading(true);
        setShowChat(true);
        try {
            const result = await diagnoseCircuit(
                circuitStateRef.current?.structured || state,
                activeExperiment?.id
            );
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(), role: 'assistant',
                    content: `**Diagnosi Circuito**\n\n${result.diagnosis}`,
                    proactive: true,
                }]);
            } else {
                // Fallback: ask UNLIM via chat
                const fallbackMsg = 'Analizza il mio circuito e dimmi se ci sono errori di cablaggio, polarità o componenti mancanti. Dai una diagnosi con voto da 1 a 5 stelle.';
                setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: fallbackMsg }]);
                const chatResult = await sendChat(fallbackMsg, [], { experimentContext: state, experimentId: activeExperiment?.id || null });
                if (chatResult.success) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1, role: 'assistant',
                        content: sanitizeOutput(typeof chatResult.response === 'string' ? chatResult.response : JSON.stringify(chatResult.response)),
                    }]);
                }
            }
        } catch { /* diagnose/chat error — silent */ }
        setIsLoading(false);
    }, [activeExperiment]);

    // MCP Tool: getExperimentHints — progressive hints via nanobot
    const handleGetHints = useCallback(async () => {
        if (!activeExperiment?.id) {
            setMessages(prev => [...prev, {
                id: Date.now(), role: 'assistant',
                content: 'Seleziona un esperimento nel simulatore per ricevere suggerimenti mirati!',
                proactive: true,
            }]);
            setShowChat(true);
            return;
        }
        setIsLoading(true);
        setShowChat(true);
        try {
            const result = await getExperimentHints(activeExperiment.id);
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now(), role: 'assistant',
                    content: `**Suggerimenti per "${activeExperiment.title || activeExperiment.id}"**\n\n${result.hints}`,
                    proactive: true,
                }]);
            } else {
                // Fallback: ask UNLIM via chat
                const fallbackMsg = `Dammi 3 suggerimenti progressivi per l'esperimento "${activeExperiment.title || activeExperiment.id}": uno leggero (domanda guida), uno medio (indizio concreto), uno diretto (soluzione passo passo).`;
                setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: fallbackMsg }]);
                const chatResult = await sendChat(fallbackMsg, [], { socraticMode: true, experimentId: activeExperiment?.id || null });
                if (chatResult.success) {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1, role: 'assistant',
                        content: sanitizeOutput(typeof chatResult.response === 'string' ? chatResult.response : JSON.stringify(chatResult.response)),
                    }]);
                }
            }
        } catch { /* hints/chat error — silent */ }
        setIsLoading(false);
    }, [activeExperiment]);

    // Video/Slide State
    const [slides, setSlides] = useState([]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    // Google Meet State

    // Session Recording State
    const [sessionLog, setSessionLog] = useState([]);
    const sessionStartTime = useRef(Date.now());


    // Notebooks State
    const [notebooks, setNotebooks] = useState([]);
    const [notebookTitle, setNotebookTitle] = useState('');
    const [activeNotebookId, setActiveNotebookId] = useState(null);
    const [activePageIndex, setActivePageIndex] = useState(0);

    // YouTube helpers
    const addYoutubeVideo = useCallback(() => {
        const match = youtubeUrl.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) { setCurrentVideoId(match[1]); setYoutubeUrl(''); }
    }, [youtubeUrl]);

    // Google Meet helpers
    const startMeet = useCallback(() => {
        if (meetLink.trim()) { setMeetActive(true); }
    }, [meetLink]);
    const joinMeet = useCallback(() => {
        if (meetLink.trim()) window.open(meetLink, '_blank', 'noopener');
    }, [meetLink]);
    const copyMeetLink = useCallback(() => {
        navigator.clipboard?.writeText(meetLink).then(() => {
            setMeetCopied(true);
            setTimeout(() => setMeetCopied(false), 2000);
        }).catch(() => { });
    }, [meetLink]);
    const stopMeet = useCallback(() => {
        setMeetActive(false); setMeetLink('');
    }, []);

    const getStoredCurrentUser = useCallback(() => {
        try {
            const raw = sessionStorage.getItem('elab_current_user') || localStorage.getItem('elab_current_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const getCurrentUserId = useCallback(() => {
        return user?.id || getStoredCurrentUser()?.id || 'anonymous';
    }, [getStoredCurrentUser, user?.id]);

    // ===================== EFFECTS =====================

    // Content protection (light) - © Andrea Marro 2026
    useEffect(() => {
        const handleCopy = (e) => {
            const el = e.target;
            if (el.closest('.v4-manual') || el.closest('.v4-pdf-viewer')) {
                e.preventDefault();
                e.clipboardData?.setData('text/plain', '© ELAB Tutor - Contenuto protetto');
            }
        };
        const handleDragStart = (e) => {
            if (e.target.tagName?.toLowerCase() === 'img' && e.target.closest('.v4-manual')) {
                e.preventDefault();
            }
        };
        document.addEventListener('copy', handleCopy);
        document.addEventListener('dragstart', handleDragStart);
        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    // Load notebooks from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('elab-notebooks');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                parsed = parsed.map(n => ({ ...n, pages: n.pages || [n.data] }));
                setNotebooks(parsed);
            } catch { /* corrupt localStorage — ignore */ }
        }
    }, []);

    // Slides persistence
    useEffect(() => {
        const saved = localStorage.getItem('elab_tutor_slides');
        if (saved) {
            try { setSlides(JSON.parse(saved)); } catch (e) { logger.warn('Corrupt elab_tutor_slides in localStorage', e); }
        }
    }, []);

    useEffect(() => {
        if (slides.length > 0) {
            const capped = slides.length > 50 ? slides.slice(-50) : slides;
            try {
                localStorage.setItem('elab_tutor_slides', JSON.stringify(capped));
            } catch (e) {
                logger.warn('Failed to persist slides to localStorage', e);
            }
        }
    }, [slides]);

    // Fullscreen event listener
    useEffect(() => {
        const handler = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);
            // S92: Don't force-open chat on fullscreen exit — let user decide
        };
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── UNLIM ONNIPOTENTE: Persistent memory — save session summary on unload ──
    useEffect(() => {
        const handleBeforeUnload = () => {
            try {
                const chatCount = messages.filter(m => m.id !== 'welcome').length;
                if (chatCount < 2) return; // no meaningful session
                const lastMsg = messages[messages.length - 1];
                const duration = Math.round((Date.now() - sessionStartRef.current) / 60000);
                const expName = activeExperiment?.title || activeExperiment?.id || 'nessuno';
                const summary = `${chatCount} msg, ${duration}min, esp: ${expName}, ultimo: ${(lastMsg?.content || '').slice(0, 60)}`;
                unlimMemory.saveSessionSummary(summary);
                // Track experiment if one was active
                if (activeExperiment?.id) {
                    unlimMemory.trackExperimentCompletion(activeExperiment.id, 'session-end');
                }
            } catch { /* silent — never block page unload */ }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [messages, activeExperiment]);

    // ── UNLIM ONNIPOTENTE (Fase 5): Backend memory sync — init on mount ──
    useEffect(() => {
        try { unlimMemory.initSync(); } catch { /* silent — backend sync is optional */ }
    }, []);

    // ── UNLIM ONNIPOTENTE (Fase 6): Inactivity nudge ──
    // If >120s without chat interaction and an experiment is loaded, UNLIM offers help
    useEffect(() => {
        if (!activeExperiment) return;
        // Reset timer on every new message
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            // Only nudge if chat is open and there are components loaded
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            const states = api?.getComponentStates?.() || {};
            if (Object.keys(states).length === 0) return; // empty board, don't bother
            setMessages(prev => {
                // Don't add if last message is already a proactive nudge
                const last = prev[prev.length - 1];
                if (last?.proactive && last?.content?.includes('Tutto bene')) return prev;
                return [...prev, {
                    id: Date.now(),
                    role: 'assistant',
                    content: `Tutto bene? Stai lavorando su **${activeExperiment?.title || 'questo esperimento'}**. Se hai bisogno di aiuto, chiedimi pure! Posso spiegarti il circuito, avviare la simulazione, o darti un suggerimento.`,
                    proactive: true,
                }];
            });
            // S92: Don't force-open chat — nudge message visible via notification badge
        }, 120000); // 2 minutes
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [messages.length, activeExperiment]);

    // ===================== SESSION LOGGING =====================

    const SESSION_LOG_KEY = 'elab_session_log';
    const studentSessionId = useRef(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(SESSION_LOG_KEY);
            if (saved) setSessionLog(JSON.parse(saved));
        } catch { }
        try {
            const userId = getCurrentUserId();
            studentSessionId.current = studentService.startSession(userId);
            return () => {
                if (studentSessionId.current) {
                    studentService.endSession(userId, studentSessionId.current);
                }
            };
        } catch { }
    }, [getCurrentUserId]);

    const logSession = useCallback((type, data) => {
        const entry = {
            time: Date.now() - sessionStartTime.current,
            timestamp: new Date().toLocaleTimeString('it-IT'),
            type,
            data
        };
        setSessionLog(prev => {
            const updated = [...prev, entry];
            try {
                localStorage.setItem(SESSION_LOG_KEY, JSON.stringify(updated.slice(-500)));
            } catch { }
            return updated;
        });
        try {
            const userId = getCurrentUserId();
            if (studentSessionId.current) {
                studentService.logActivity(userId, studentSessionId.current, {
                    tipo: type,
                    dettaglio: JSON.stringify(data).substring(0, 200)
                });
            }
        } catch { }
    }, [getCurrentUserId]);

    useEffect(() => {
        if (messages.length > 1) {
            const last = messages[messages.length - 1];
            if (last.id !== 'welcome') {
                logSession(last.role === 'user' ? 'chat-user' : 'chat-ai', {
                    content: typeof last.content === 'string' ? last.content.substring(0, 200) : ''
                });
            }
        }
    }, [messages.length]);

    useEffect(() => {
        logSession('tab-change', { tab: activeTab });
    }, [activeTab]);

    const exportSession = () => {
        const sessionData = {
            exportDate: new Date().toISOString(),
            duration: Math.round((Date.now() - sessionStartTime.current) / 1000),
            chatMessages: messages.filter(m => m.id !== 'welcome').map(m => ({
                role: m.role,
                content: typeof m.content === 'string' ? m.content : '',
                hasImage: !!m.image
            })),
            notebooks: notebooks.map(n => ({ title: n.title, date: n.date, pageCount: n.pages?.length || 0 })),
            slides: slides.length,
            log: sessionLog
        };
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `elab-sessione-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ===================== FULLSCREEN =====================

    const toggleNativeFullscreen = useCallback(() => {
        const el = document.querySelector('.elab-v4');
        if (!el) return;
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        } else {
            el.requestFullscreen().catch(() => {
                setIsFullscreen(!isFullscreen);
            });
        }
    }, [isFullscreen]);

    // ===================== VOLUME LOADING =====================
    // S112: Lazy PDF rendering — store the pdf object, render pages on demand
    // Old approach: rendered ALL 114 pages at 3x scale → blocked UI for minutes + GB of RAM
    // New approach: load PDF once, render only the visible page on navigation

    const volumePdfRef = useRef({}); // { [volNum]: pdfDocument }

    const renderVolumePage = useCallback(async (volNum, pageNum) => {
        const pdf = volumePdfRef.current[volNum];
        if (!pdf) return null;
        const pageIndex = pageNum + 1; // pdf.js is 1-indexed
        if (pageIndex < 1 || pageIndex > pdf.numPages) return null;
        try {
            const page = await pdf.getPage(pageIndex);
            const scale = 1.5; // S112: was 3 — 75% less memory per page
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            return cappedToDataURL(canvas, 'image/jpeg', 0.85); // S112: JPEG = ~5x smaller than PNG, size-capped
        } catch (err) {
            logger.error(`Errore render pagina ${pageIndex}:`, err);
            return null;
        }
    }, []);

    const loadVolume = async (volNum) => {
        // If PDF already loaded, just switch to it
        if (volumePdfRef.current[volNum]) {
            setSelectedVolume(volNum);
            setCurrentDocPage(0);
            setViewMode('manual');
            // Render first page if not cached
            if (!volumePages[volNum]?.[0]) {
                const firstPage = await renderVolumePage(volNum, 0);
                if (firstPage) {
                    setVolumePages(prev => ({ ...prev, [volNum]: [firstPage] }));
                }
            }
            setLoadingVolume(null);
            return;
        }

        setLoadingVolume(volNum);
        setVolumeProgress(0);

        try {
            if (!window.pdfjsLib) {
                await loadPdfJs();
            }
            const response = await fetch(`/volumes/volume${volNum}.pdf`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // S112: Stream download with progress tracking
            const contentLength = +response.headers.get('Content-Length') || 0;
            let arrayBuffer;
            if (contentLength && response.body) {
                const reader = response.body.getReader();
                const chunks = [];
                let received = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    received += value.length;
                    setVolumeProgress(Math.round((received / contentLength) * 90)); // 0-90% = download
                }
                const combined = new Uint8Array(received);
                let offset = 0;
                for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }
                arrayBuffer = combined.buffer;
            } else {
                // Fallback: no Content-Length header
                arrayBuffer = await response.arrayBuffer();
                setVolumeProgress(90);
            }

            setVolumeProgress(92); // Parsing PDF...
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Store the PDF document for lazy page rendering
            volumePdfRef.current[volNum] = pdf;

            // Render only the first page immediately — rest rendered on navigation
            setVolumeProgress(95); // Rendering first page...
            const firstPage = await renderVolumePage(volNum, 0);
            const placeholders = new Array(pdf.numPages).fill(null);
            if (firstPage) placeholders[0] = firstPage;

            setVolumeProgress(100);
            setVolumePages(prev => ({ ...prev, [volNum]: placeholders }));
            setSelectedVolume(volNum);
            setCurrentDocPage(0);
            setViewMode('manual');
        } catch (err) {
            logger.error('Errore caricamento volume:', err);
            showToast(`Errore nel caricamento del Volume ${volNum}. Controlla la connessione.`, 'error');
        }

        setLoadingVolume(null);
        setVolumeProgress(null);
    };

    // S112: Lazy page renderer — renders pages as the user navigates
    useEffect(() => {
        if (viewMode !== 'manual' || !selectedVolume) return;
        const volNum = selectedVolume;
        const pageIdx = currentDocPage;

        // Already rendered?
        if (volumePages[volNum]?.[pageIdx]) return;
        // PDF not loaded?
        if (!volumePdfRef.current[volNum]) return;

        let cancelled = false;
        renderVolumePage(volNum, pageIdx).then(rendered => {
            if (cancelled || !rendered) return;
            setVolumePages(prev => {
                const pages = [...(prev[volNum] || [])];
                pages[pageIdx] = rendered;
                return { ...prev, [volNum]: pages };
            });
        });

        // Pre-render adjacent pages for smooth navigation
        const prerender = [pageIdx - 1, pageIdx + 1];
        for (const adj of prerender) {
            if (adj < 0 || !volumePdfRef.current[volNum] || adj >= volumePdfRef.current[volNum].numPages) continue;
            if (volumePages[volNum]?.[adj]) continue;
            renderVolumePage(volNum, adj).then(rendered => {
                if (cancelled || !rendered) return;
                setVolumePages(prev => {
                    const pages = [...(prev[volNum] || [])];
                    if (!pages[adj]) { // Don't overwrite if already rendered
                        pages[adj] = rendered;
                        return { ...prev, [volNum]: pages };
                    }
                    return prev;
                });
            });
        }

        return () => { cancelled = true; };
    }, [viewMode, selectedVolume, currentDocPage, renderVolumePage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ===================== DOC SCREENSHOT =====================

    const sendDocScreenshotToChat = async () => {
        let imageData = null;
        if (viewMode === 'manual' && selectedVolume && volumePages[selectedVolume]?.[currentDocPage]) {
            imageData = volumePages[selectedVolume][currentDocPage];
        } else if (viewMode === 'document' && currentDoc && currentDoc.pages[currentDocPage]) {
            imageData = currentDoc.pages[currentDocPage];
        }

        if (!imageData) {
            showToast('Nessun documento visualizzato da inviare', 'warning');
            return;
        }

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: '*Screenshot documento allegato*',
            image: imageData
        };
        setMessages(prev => [...prev, userMsg]);

        // Abort previous analyzeImage if still in-flight (race condition fix)
        if (analyzeAbortRef.current) analyzeAbortRef.current.abort();
        const abortController = new AbortController();
        analyzeAbortRef.current = abortController;

        setIsLoading(true);
        try {
            const result = await analyzeImage(imageData, 'Analizza questa immagine e descrivi cosa vedi. Se contiene testo, circuiti elettronici, codice o diagrammi, spiegali in dettaglio.', { signal: abortController.signal });
            if (abortController.signal.aborted) { setIsLoading(false); return; }
            const assistantMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: result.response || 'Non sono riuscito ad analizzare l\'immagine.'
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            // Ignore aborted requests (superseded by newer call)
            if (err.name === 'AbortError') { setIsLoading(false); return; }
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Errore nell\'analisi dell\'immagine. Riprova.'
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        setIsLoading(false);
    };

    // ===================== SEND IMAGE TO UNLIM (Whiteboard / generic) =====================
    const handleSendImageToUNLIM = useCallback(async (imageDataUrl, message) => {
        setShowChat(true);
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: message || '*Disegno dalla lavagna allegato*',
            image: imageDataUrl,
        };
        setMessages(prev => [...prev, userMsg]);

        if (analyzeAbortRef.current) analyzeAbortRef.current.abort();
        const abortController = new AbortController();
        analyzeAbortRef.current = abortController;

        setIsLoading(true);
        try {
            const base64 = imageDataUrl.includes(',') ? imageDataUrl.split(',')[1] : imageDataUrl;
            const images = [{ base64, mimeType: 'image/png' }];
            const result = await sendChat(message || 'Analizza questo disegno dalla lavagna.', images, {
                socraticMode: isSocraticMode,
                experimentContext: null,
                circuitState: null,
                experimentId: null,
                signal: abortController.signal,
            });
            if (abortController.signal.aborted) { setIsLoading(false); return; }
            if (result?.success) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: sanitizeOutput(typeof result.response === 'string' ? result.response : JSON.stringify(result.response || 'Non sono riuscito ad analizzare il disegno.')),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: sanitizeOutput(String(result?.response || 'Non sono riuscito ad analizzare il disegno. Riprova.')),
                    isError: true,
                }]);
            }
        } catch (err) {
            if (err.name === 'AbortError') { setIsLoading(false); return; }
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Errore nell\'analisi del disegno. Riprova.',
            }]);
        }
        setIsLoading(false);
    }, [isSocraticMode]);

    // ===================== SLIDES =====================

    const addCanvasToSlides = () => {
        if (!canvasRef.current) return;
        const dataUrl = cappedToDataURL(canvasRef.current, 'image/jpeg', 0.6);
        if (!dataUrl) return; // too large, skip
        setSlides(prev => [...prev, { id: Date.now(), type: 'image', content: dataUrl }]);
    };

    const goToSlide = (index) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlideIndex(index);
        }
    };

    // ===================== NOTEBOOKS =====================

    const clearCanvas = () => {
        const ctx = ctxRef.current;
        if (!ctx || !canvasRef.current) return;
        ctx.fillStyle = 'var(--elab-hex-ffffff)';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const loadPageImage = (dataUrl) => {
        if (!dataUrl) {
            setTimeout(clearCanvas, 50);
            return;
        }
        const img = new Image();
        img.onload = () => {
            setTimeout(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'var(--elab-hex-ffffff)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }, 50);
        };
        img.src = dataUrl;
    };

    const createNotebook = (initialTitle = null, initialImage = null) => {
        const title = initialTitle || notebookTitle.trim() || `Lezione ${new Date().toLocaleDateString()}`;
        let firstPage = null;
        if (initialImage) {
            firstPage = initialImage.length > MAX_DATAURL_LENGTH ? null : initialImage;
        } else if (canvasRef.current) {
            firstPage = cappedToDataURL(canvasRef.current, 'image/jpeg', 0.6);
        }

        const newNote = { id: Date.now(), title, date: new Date().toLocaleString(), pages: [firstPage] };
        const updated = persistNotebooks([newNote, ...notebooks], showToast);
        setNotebooks(updated);
        setNotebookTitle('');
        setActiveNotebookId(newNote.id);
        setActivePageIndex(0);
        setActiveTab('canvas');
        if (initialImage) {
            setTimeout(() => loadPageImage(initialImage), 100);
        }
    };

    const savePage = () => {
        if (!canvasRef.current || !activeNotebookId) return;
        const dataUrl = cappedToDataURL(canvasRef.current, 'image/jpeg', 0.6);
        const updated = notebooks.map(n => {
            if (n.id === activeNotebookId) {
                const newPages = [...(n.pages || [])];
                if (activePageIndex >= newPages.length) {
                    newPages.push(dataUrl);
                } else {
                    newPages[activePageIndex] = dataUrl;
                }
                while (newPages.length <= activePageIndex) newPages.push(null);
                return { ...n, pages: newPages, date: new Date().toLocaleString() };
            }
            return n;
        });
        setNotebooks(updated);
        persistNotebooks(updated, showToast);
    };

    const addPage = () => {
        savePage();
        clearCanvas();
        const updated = notebooks.map(n => {
            if (n.id === activeNotebookId) {
                return { ...n, pages: [...(n.pages || []), null] };
            }
            return n;
        });
        setNotebooks(updated);
        persistNotebooks(updated, showToast);
        setActivePageIndex(prev => prev + 1);
    };

    const openNotebook = (note) => {
        setActiveNotebookId(note.id);
        setActivePageIndex(0);
        const pages = note.pages || [note.data];
        loadPageImage(pages[0]);
        setActiveTab('canvas');
    };

    const changePage = (index) => {
        savePage();
        setActivePageIndex(index);
        const note = notebooks.find(n => n.id === activeNotebookId);
        if (note) {
            const pages = note.pages || [note.data];
            loadPageImage(pages[index]);
        }
    };

    const deleteNotebookNew = async (id) => {
        if (!await confirmModal('Eliminare questo taccuino?')) return;
        const updated = notebooks.filter(n => n.id !== id);
        setNotebooks(updated);
        persistNotebooks(updated, showToast);
        if (activeNotebookId === id) closeNotebook();
    };

    const closeNotebook = () => {
        if (activeNotebookId) savePage();
        setActiveNotebookId(null);
        setActiveTab('notebooks');
    };

    // (codeTemplates rimosso — editor Arduino eliminato, code generation passa all'AI)

    // ===================== INTENT DETECTION =====================

    const detectIntent = (text) => {
        // Rimosse tutte le "frasi fatte" (Regex)
        // L'utente ha richiesto che UNLIM sia completamente autonomo (autoscienza), 
        // interfacciato a tutti i comandi tramite intelligenza artificiale pura.
        // Restituendo sempre null forziamo TUTTO ad andare al backend/nanobot.
        return null;
    };

    // ===================== TUTOR CONTEXT (~30 tokens/msg) =====================
    // Built on-demand when user sends a message — AI always knows current state
    const buildTutorContext = useCallback(() => {
        const parts = [];
        parts.push(`tab=${activeTab}`);
        if (activeVolume) parts.push(`volume_attivo=${activeVolume === 'inventor' ? 'Inventore' : `Vol${activeVolume}`}`);
        if (activeExperiment) parts.push(`esp=${activeExperiment.id} "${activeExperiment.title || ''}"`);
        parts.push(`disclosure=${disclosureLevel}`);
        if (selectedVolume) parts.push(`manuale=Vol${selectedVolume} p.${currentDocPage + 1}`);
        if (currentVideoId) parts.push(`video=youtube:${currentVideoId}`);
        else if (meetActive) parts.push(`video=meet-attivo`);
        if (activeNotebookId) {
            const nb = notebooks.find(n => n.id === activeNotebookId);
            parts.push(`taccuino="${nb?.title || ''}" p.${activePageIndex + 1}`);
        }
        parts.push(`socratico=${isSocraticMode ? 'si' : 'no'}`);
        // Enriched context from simulator API (when available)
        try {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api) {
                const states = api.getComponentStates();
                const componentCount = Object.keys(states).length;
                if (componentCount > 0) {
                    parts.push(`componenti=${componentCount}`);
                    // Report LED states
                    const leds = Object.entries(states).filter(([k]) => k.startsWith('led'));
                    if (leds.length > 0) {
                        const ledSummary = leds.map(([id, s]) => `${id}:${s.on ? 'ON' : 'OFF'}`).join(',');
                        parts.push(`led=[${ledSummary}]`);
                    }
                    // Report button states
                    const buttons = Object.entries(states).filter(([k]) => k.startsWith('btn') || k.startsWith('push'));
                    if (buttons.length > 0) {
                        parts.push(`pulsanti=[${buttons.map(([id, s]) => `${id}:${s.pressed ? 'premuto' : 'rilasciato'}`).join(',')}]`);
                    }
                    // Report potentiometer states
                    const pots = Object.entries(states).filter(([k]) => k.startsWith('pot'));
                    if (pots.length > 0) {
                        parts.push(`potenziometri=[${pots.map(([id, s]) => `${id}:${Math.round((s.position || 0) * 100)}%`).join(',')}]`);
                    }
                    // Report buzzer states
                    const buzzers = Object.entries(states).filter(([k]) => k.startsWith('buz'));
                    if (buzzers.length > 0) {
                        parts.push(`buzzer=[${buzzers.map(([id, s]) => `${id}:${s.active ? 'attivo' : 'spento'}`).join(',')}]`);
                    }
                    // Report servo states
                    const servos = Object.entries(states).filter(([k]) => k.startsWith('srv') || k.startsWith('servo'));
                    if (servos.length > 0) {
                        parts.push(`servo=[${servos.map(([id, s]) => `${id}:${s.angle || 0}°`).join(',')}]`);
                    }
                }
            }
            // Report all component IDs with types for AI awareness
            if (activeExperiment?.components?.length > 0) {
                const compList = activeExperiment.components.map(c => `${c.id}(${c.type})`).join(',');
                parts.push(`tutti_componenti=[${compList}]`);
            }
            // ── S58: Component positions for spatial awareness ──
            if (api.getComponentPositions) {
                const positions = api.getComponentPositions();
                const posEntries = Object.entries(positions);
                if (posEntries.length > 0 && posEntries.length <= 15) {
                    // Include positions for small circuits (≤15 components)
                    parts.push(`posizioni=[${posEntries.map(([id, p]) => `${id}:${Math.round(p.x || 0)},${Math.round(p.y || 0)}`).join('|')}]`);
                }
            }
            // ── S58: Connection details (wires) for circuit awareness ──
            if (api.getLayout) {
                const layout = api.getLayout();
                if (layout?.connections?.length > 0) {
                    const wireCount = layout.connections.length;
                    parts.push(`fili=${wireCount}`);
                    // Show first 8 connections for context
                    const wireDetails = layout.connections.slice(0, 8).map((c, i) =>
                        `${i}:${c.from || '?'}→${c.to || '?'}`
                    ).join('|');
                    parts.push(`connessioni=[${wireDetails}]`);
                }
            }
        } catch { /* silent */ }

        // ── UNLIM ONNIPOTENTE: Enriched context data ──
        // Interaction history (last 5 actions)
        if (interactionHistoryRef.current.length > 0) {
            const recent = interactionHistoryRef.current.slice(-5);
            parts.push(`ultime_azioni=[${recent.map(a => a.summary).join(',')}]`);
        }
        // Build step progress
        if (buildStepIndexRef.current >= 0 && activeExperiment?.buildSteps) {
            const total = activeExperiment.buildSteps.length;
            parts.push(`passo=${buildStepIndexRef.current + 1}/${total}`);
        }
        // Error history
        if (errorHistoryRef.current.length > 0) {
            parts.push(`errori_recenti=[${errorHistoryRef.current.slice(-3).join(',')}]`);
        }
        // Session stats
        parts.push(`messaggi=${messages.length}`);
        const sessionMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
        if (sessionMinutes > 0) parts.push(`durata=${sessionMinutes}min`);

        // ── Sprint 1 Context Mastery: 5 new context blocks ──
        try {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api) {
                // G2: Selected Component
                const sel = api.getSelectedComponent?.();
                if (sel) parts.push(`componente_selezionato=${sel.id}(${sel.type})`);
                // G3: Compilation Result
                const comp = api.getCompilationSnapshot?.();
                if (comp && comp.status && comp.status !== 'idle') {
                    parts.push(`compilazione=${comp.status}`);
                    if (comp.errors) parts.push(`errore_compilazione=${String(comp.errors).slice(0, 150)}`);
                    if (comp.warnings) parts.push(`warning_compilazione=${String(comp.warnings).slice(0, 100)}`);
                }
                // G4: Serial Output (last 10 lines)
                const serial = api.getSerialOutput?.();
                if (serial && serial.lastLines.length > 0) {
                    parts.push(`serial_output=[${serial.lastLines.slice(-5).join(' | ')}] (${serial.lineCount} righe totali)`);
                }
                // G8: Editor Mode
                const edMode = api.getEditorMode?.();
                if (edMode) parts.push(`editor=${edMode}`);
                const edVis = api.isEditorVisible?.();
                if (edVis !== undefined) parts.push(`editor_visibile=${edVis ? 'si' : 'no'}`);
            }
        } catch { /* silent */ }
        // G1: Activity Ring Buffer (last 5 actions with timestamps)
        const activityBlock = formatActivityContext(5);
        if (activityBlock) parts.push(activityBlock);
        // G9: Session Metrics (time on experiment, compilations, idle time)
        const metricsBlock = sessionMetrics.formatForContext();
        if (metricsBlock) parts.push(metricsBlock);

        // Student memory context (from "./unlimMemory" service)
        let memoryContext = '';
        try {
            if (typeof window !== 'undefined' && window.__unlimMemory) {
                memoryContext = window.__unlimMemory.buildMemoryContext();
            }
        } catch { /* silent */ }

        // PDR: Inject concept graph pedagogical context
        let conceptContext = '';
        try {
            if (activeExperiment?.id) {
                const newConcepts = getNewConcepts(activeExperiment.id);
                const prereqs = getPrerequisites(activeExperiment.id);
                if (newConcepts.length > 0) {
                    conceptContext = `\nCONCETTI DA INSEGNARE: ${newConcepts.map(c => `${c.name} (analogia: "${c.analogy}")`).join('; ')}`;
                }
                if (prereqs.length > 0) {
                    conceptContext += `\nPREREQUISITI: ${prereqs.map(c => c.name).join(', ')}`;
                }
            }
        } catch { /* silent */ }

        // S58: Streamlined context — clear, structured, no redundancy with nanobot.yml system prompt
        return `[CONTESTO DI SISTEMA — UNLIM v3.0]

STATO ATTUALE INTERFACCIA:
${parts.join('\n')}${conceptContext}

AZIONI DISPONIBILI (usa [AZIONE:comando:args] alla fine della risposta):
CIRCUITO: play | pause | reset | addcomponent:tipo[:x:y] | removecomponent:id | addwire:comp1:pin1:comp2:pin2 | removewire:indice | clearall | interact:id:azione[:valore] | movecomponent:id:x:y | setvalue:id:parametro:valore | measure:id | diagnose | listcomponents
CODICE: compile | openeditor | closeeditor | switcheditor:scratch|arduino | loadblocks:xml
NAVIGAZIONE: loadexp:id | opentab:simulatore|manuale|video|lavagna | openvolume:1|2|3[:pagina] | setbuildmode:montato|passopasso|libero | nextstep | prevstep
VISTA: highlight:id1,id2 | highlightpin:comp:pin | showbom | showserial | quiz[:espId] | youtube:query | undo | redo
TIPI COMPONENTE: led | resistor | pushbutton | capacitor | buzzer | potentiometer | battery

REGOLE CRITICHE PER QUESTA RISPOSTA:
1. ONESTA': Se l'utente chiede "cosa vedi?" → descrivi SOLO i dati qui sopra (componenti, connessioni, LED, posizioni). Non inventare.
2. AZIONE OBBLIGATORIA: Se l'utente chiede di FARE qualcosa → includi [AZIONE:...] alla fine. Mai dire "l'ho fatto" senza il tag.
3. CONTESTO REALE: Se led=[led1:OFF] → il LED e' spento. Se fili=0 → non ci sono fili. Basa OGNI risposta su questi dati.
4. DOMANDE OFF-TOPIC: Rispondi brevemente (max 1 frase) e ridireziona all'elettronica. Non fare lezioni step-by-step su matematica o altro.
5. TAG FORMATO: [AZIONE:comando:args] — AZIONE sempre MAIUSCOLO, tag alla FINE della risposta, dopo la spiegazione.
6. PER RIMUOVERE TUTTI I FILI: Se fili=N, emetti N tag [AZIONE:removewire:i] per i da N-1 a 0 (partendo dall'ultimo).
7. LINGUAGGIO 10-14 ANNI: Max 120 parole ben formattate (feedback 2026-05-10). Plurale "Ragazzi/e" o "voi". Mai termini come "dispositivo a semiconduttore", "diodo a emissione di luce", "componente elettronico passivo". Analogie utili quando rendono chiaro: LED="lampadina minuscola", resistore="tubo stretto per l'acqua", corrente="acqua che scorre", tensione="pressione dell'acqua".
8. ANALOGIA OPZIONALE: Usa analogie quando aggiungono valore, non sempre obbligatorie. Cita Vol N pag NN concordato quando rilevante.
9. MONTA CIRCUITO: Se l'utente dice "monta il semaforo" o simile → usa [AZIONE:loadexp:v3-cap6-semaforo]. ID formato: v{vol}-cap{cap}-esp{num} o v3-cap6-semaforo.
10. PREPARA LEZIONE: Se il docente chiede di preparare la lezione → usa il contesto attuale + memoria sessioni per suggerire l'esperimento giusto e caricarlo.${memoryContext ? `\n\n${memoryContext}` : ''}`;
    }, [activeTab, activeExperiment, activeVolume, selectedVolume, currentDocPage,
        currentVideoId, meetActive, disclosureLevel,
        activeNotebookId, notebooks, activePageIndex, isSocraticMode, messages.length]);

    // ===================== AUTO-SCREENSHOT (UNLIM Onnipotente — FASE 4) =====================
    // Detects when the student's message needs visual context from the simulator
    // and auto-captures a screenshot to send to the Vision specialist
    const VISUAL_KEYWORDS = /(?:cosa vedi|guarda|screen|mostrami|fammi vedere|controlla il circuito|analizza|verifica|è giusto|è corretto|check|foto|screenshot|schermata|sembra|vedi qualcosa|dov'è l'errore|dove sbaglio|non funziona|non si accende|si è bruciato|bruciato|cortocircuito|short|errore nel circuito|lavagna|disegno|ho disegnato|ho scritto sulla|scritto qui|questa pagina|questo esperimento|questa immagine|questo schema)/i;
    const CANVAS_KEYWORDS = /(?:lavagna|disegno|ho disegnato|ho scritto sulla|scritto qui|canvas|whiteboard)/i;
    // S63 FIX: action-intent messages must go to /tutor-chat (circuit specialist), NOT /chat (vision).
    // Auto-screenshot + images → /chat → vision specialist → no [AZIONE:] tags → commands broken.
    // S66 FIX: expanded with 20+ missing Italian action verbs that were causing
    // action messages to route to vision specialist instead of circuit specialist.
    // Every verb here BLOCKS auto-screenshot so the message goes to /tutor-chat.
    const ACTION_INTENT_KEYWORDS = /\b(carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|evidenzia|sposta|premi|gira|avvia|ferma|reset|compila|imposta|setta|cancella|pulisci|interagisci|svuota|azzera|facciamo|fai|fammi|elimina|cambia|modifica|sostituisci|ricollega|rifai|monta|smonta|scollega|inserisci|posiziona|piazza|sistema|ripara|correggi|al\s+posto)\b/i;
    const shouldAutoScreenshot = useCallback((message) => {
        // S63 FIX: NEVER auto-screenshot for action commands — they must route to /tutor-chat
        // so the circuit specialist can generate [AZIONE:...] tags for the simulator.
        if (ACTION_INTENT_KEYWORDS.test(message)) return false;
        // Condition 1: visual keywords in the message
        if (VISUAL_KEYWORDS.test(message)) return true;
        // Condition 2: simulator tab is active AND student asks about their circuit
        if (activeTab === 'simulator' && /circuito|circuit|schema|collegament|esperiment/i.test(message)) return true;
        // Condition 3: canvas tab is active AND student asks about anything visual
        if (activeTab === 'canvas') return true;
        // Condition 4: manual/document tab + page-oriented question
        if (activeTab === 'manual' && /pagina|manuale|documento|figura|immagine|schema/i.test(message)) return true;
        return false;
    }, [activeTab]);

    const captureActiveVisualContext = useCallback(async (message = '') => {
        const wantsCanvas = activeTab === 'canvas' || CANVAS_KEYWORDS.test(message);

        // S66 FIX: canvas ref may be null right after tab switch. Retry once after short delay.
        let canvasEl = activeTab === 'canvas' ? canvasRef.current : null;
        if (activeTab === 'canvas' && !canvasEl) {
            await new Promise(r => setTimeout(r, 150));
            canvasEl = canvasRef.current;
        }

        const whiteboardShot = captureWhiteboardScreenshot({
            tutorCanvas: canvasEl,
        });

        if (whiteboardShot.dataUrl && (
            wantsCanvas ||
            activeTab === 'canvas' ||
            whiteboardShot.source === 'simulator-whiteboard'
        )) {
            return whiteboardShot;
        }

        if (activeTab === 'manual') {
            if (viewMode === 'manual' && selectedVolume && volumePages[selectedVolume]?.[currentDocPage]) {
                return { dataUrl: volumePages[selectedVolume][currentDocPage], source: 'manual-page' };
            }
            if (viewMode === 'document' && currentDoc?.pages?.[currentDocPage]) {
                return { dataUrl: currentDoc.pages[currentDocPage], source: 'document-page' };
            }
        }

        if (activeTab === 'simulator') {
            const api = typeof window !== 'undefined' && window.__ELAB_API;
            if (api?.captureScreenshot) {
                const simulatorData = await api.captureScreenshot();
                if (simulatorData) {
                    return { dataUrl: simulatorData, source: 'simulator' };
                }
            }
        }

        try {
            if (typeof document !== 'undefined') {
                const panel = document.querySelector('.v4-panel');
                if (panel) {
                    const { default: html2canvas } = await import('html2canvas');
                    const canvas = await html2canvas(panel, {
                        backgroundColor: '#FFFFFF', /* html2canvas requires literal hex */
                        useCORS: true,
                        logging: false,
                        scale: 1,
                    });
                    const dataUrl = canvas?.toDataURL?.('image/png');
                    if (dataUrl) {
                        return { dataUrl, source: 'active-tab' };
                    }
                }
            }
        } catch (err) {
            logger.warn('[UNLIM] Active tab screenshot fallback failed:', err?.message || err);
        }

        return { dataUrl: null, source: null };
    }, [
        activeTab,
        currentDoc,
        currentDocPage,
        selectedVolume,
        viewMode,
        volumePages,
    ]);

    // ===================== AI RESPONSE PROCESSOR (shared between text + voice) =====================

    /**
     * Process AI response: strip action/intent tags from display text, parse + execute actions.
     * Used by BOTH handleSend (text chat) and handleVoiceRecord (voice chat).
     * @param {string} aiResponse - raw AI response (may contain [AZIONE:...] and [INTENT:...] tags)
     * @param {string} userMessage - the user's original message (for quiz fallback)
     * @param {number|string} msgId - message ID to update with _executedActions
     * @returns {Promise<string>} displayText (tags stripped)
     */
    const processAiResponse = async (aiResponse, userMessage, msgId) => {
        const aiLower = aiResponse.toLowerCase();
        const userLower = userMessage.toLowerCase();

        // ── S116: Strip hallucinated INTENT tags for simple action commands ──
        const _simpleActionRe = /\b(avvia|start|play|fai\s+partire|ferma|stop|pausa|pause|reset|resetta|riavvia|compila|annulla|undo|rifai|redo)\b/i;
        const _hasComponentWords = /\b(led|resistor[ei]?|resistenz[ae]|buzzer|pulsante|condensator[ei]?|potenziometr[oi]|servo|motor[ei]|diod[oi]|mosfet|reed|rgb|metti|aggiungi|costruisci|collega)\b/i;
        let effectiveResponse = aiResponse;
        if (_simpleActionRe.test(userMessage) && !_hasComponentWords.test(userMessage)) {
            const hallucinatedIntents = extractIntentTags(aiResponse);
            if (hallucinatedIntents.length > 0) {
                logger.info('[S116] Stripping', hallucinatedIntents.length, 'hallucinated INTENT tags for simple action:', userMessage.substring(0, 60));
                for (const { fullMatch } of hallucinatedIntents) {
                    effectiveResponse = effectiveResponse.replace(fullMatch, '');
                }
            }
        }

        // ── Strip action tags from display text ──
        let strippedResponse = effectiveResponse;
        for (const { fullMatch } of extractIntentTags(effectiveResponse)) {
            strippedResponse = strippedResponse.replace(fullMatch, '');
        }
        const displayText = strippedResponse
            .replace(/\[azione:[^\]]+\]/gi, '')
            .replace(/\[AZIONE:[^\]]+\]/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        // ── Parse action tags ──
        let actionTags = effectiveResponse.match(/\[azione:([^\]]+)\]/gi) || [];
        const api = typeof window !== 'undefined' && window.__ELAB_API;
        const executedActions = [];
        const actionFailures = [];
        // G25: Ralph Loop removed — doubled latency for action-intent messages.
        // Action tag generation is now handled by improved nanobot prompts.

        const parseIntOr = (value, fallback) => {
            const parsed = Number.parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : fallback;
        };
        const normalizeComponentToken = (value) =>
            (value || '').toLowerCase().replace(/[\s_-]+/g, '');
        const TYPE_ALIASES = {
            led: 'led', rgbled: 'rgb-led', resistor: 'resistor', resistore: 'resistor',
            resistenza: 'resistor', battery: 'battery9v', batteria: 'battery9v', battery9v: 'battery9v',
            buzzer: 'buzzer-piezo', cicalino: 'buzzer-piezo', buzzerpiezo: 'buzzer-piezo',
            button: 'push-button', pulsante: 'push-button', pushbutton: 'push-button',
            potentiometer: 'potentiometer', potenziometro: 'potentiometer', pot: 'potentiometer',
            photoresistor: 'photo-resistor', fotoresistore: 'photo-resistor', ldr: 'photo-resistor',
            reed: 'reed-switch', reedswitch: 'reed-switch', motor: 'motor-dc', motore: 'motor-dc',
            motoredc: 'motor-dc', capacitor: 'capacitor', condensatore: 'capacitor',
            diode: 'diode', diodo: 'diode', mosfet: 'mosfet-n', mosfetn: 'mosfet-n',
            servo: 'servo', arduino: 'nano-r4-board', nano: 'nano-r4-board', nanor4board: 'nano-r4-board',
        };
        const getLiveComponents = () => {
            try {
                const layout = api?.getLayout?.();
                return Array.isArray(layout?.components) ? layout.components : [];
            } catch { return []; }
        };
        const resolveComponentIds = (token, allowMultiple = false) => {
            const cleaned = (token || '').trim();
            if (!cleaned) return [];
            const components = getLiveComponents();
            if (!components.length) return [cleaned];
            const normalizedToken = normalizeComponentToken(cleaned);
            const byId = components.filter(c => normalizeComponentToken(c?.id) === normalizedToken);
            if (byId.length) return allowMultiple ? byId.map(c => c.id) : [byId[0].id];
            const byPrefixId = components.filter(c => normalizeComponentToken(c?.id).startsWith(normalizedToken));
            if (byPrefixId.length) return allowMultiple ? byPrefixId.map(c => c.id) : [byPrefixId[0].id];
            const normalizedType = normalizeComponentToken(TYPE_ALIASES[normalizedToken] || cleaned);
            const byType = components.filter(c => normalizeComponentToken(c?.type) === normalizedType);
            if (byType.length) return allowMultiple ? byType.map(c => c.id) : [byType[0].id];
            return [];
        };
        const resolveSingleComponentId = (token) => {
            const ids = resolveComponentIds(token, false);
            return ids.length ? ids[0] : null;
        };
        const resolveExperimentId = (requestedId) => {
            const raw = (requestedId || '').trim();
            if (!raw || !api?.getExperimentList) return raw;
            if (api?.getExperiment?.(raw)) return raw;
            const EXP_ID_ALIASES = {
                'v1-cap6-primo-circuito': 'v1-cap6-esp1', 'v1-cap6-led-rosso': 'v1-cap6-esp2',
                'v1-cap6-led-bruciato': 'v1-cap6-esp3', 'v1-cap8-pulsante-led': 'v1-cap8-esp1',
                'v1-cap8-semaforo-pulsante': 'v1-cap8-esp5', 'v1-cap11-buzzer': 'v1-cap11-esp1',
                'v3-cap6-led-blink': 'v3-cap6-blink',
            };
            if (EXP_ID_ALIASES[raw]) return EXP_ID_ALIASES[raw];
            const normalize = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
            const prefixMatch = raw.match(/^(v\d-cap\d+)/i);
            const prefix = prefixMatch ? prefixMatch[1].toLowerCase() : '';
            const rawTokens = raw.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
                .filter(tok => !/^v\d$/.test(tok) && !/^cap\d+$/.test(tok) && tok !== 'esp');
            const list = api.getExperimentList?.() || {};
            const flat = [...(list.vol1 || []), ...(list.vol2 || []), ...(list.vol3 || [])];
            let candidates = flat;
            if (prefix) {
                const prefixed = flat.filter(exp => (exp.id || '').toLowerCase().startsWith(prefix));
                if (prefixed.length) candidates = prefixed;
            }
            if (!candidates.length) return raw;
            const scored = candidates.map(exp => {
                const idNorm = normalize(exp.id);
                const titleNorm = normalize(exp.title);
                let score = 0;
                if (idNorm.includes(normalize(raw))) score += 8;
                for (const tok of rawTokens) {
                    if (idNorm.includes(tok)) score += 3;
                    if (titleNorm.includes(tok)) score += 4;
                }
                return { id: exp.id, score };
            }).sort((a, b) => b.score - a.score);
            if (scored[0]?.score > 0) return scored[0].id;
            if (candidates.length === 1) return candidates[0].id;
            return raw;
        };
        const recordActionFailure = (tagText, reason) => {
            actionFailures.push(`${tagText} → ${reason}`);
        };

        // ── PlacementEngine intent resolution ──
        const PLACEMENT_ENGINE_ENABLED = true;
        const intentTags = extractIntentTags(aiResponse);
        logger.debug('[UNLIM-DEBUG] intentTags:', intentTags.length, 'api:', !!api, 'actionTags:', actionTags.length);
        if (intentTags.length > 0) logger.debug('[UNLIM-DEBUG] INTENT json:', intentTags.map(t => t.json));

        if (PLACEMENT_ENGINE_ENABLED && intentTags.length > 0 && api) {
            try {
                const { resolvePlacement } = await import('../simulator/engine/PlacementEngine');
                const currentLayout = api.getLayout?.() || {};
                logger.debug('[UNLIM-DEBUG] Layout: comps=', currentLayout.components?.length, 'pins=', Object.keys(currentLayout.pinAssignments || {}).length);
                const snapshot = {
                    components: currentLayout.components || [],
                    connections: currentLayout.connections || [],
                    layout: currentLayout.layout || {},
                    pinAssignments: currentLayout.pinAssignments || {},
                };
                const peActions = [];
                for (const tag of intentTags) {
                    try {
                        const intent = JSON.parse(tag.json);
                        logger.debug('[UNLIM-DEBUG] Parsed intent:', intent);
                        const placementResult = resolvePlacement(intent, snapshot);
                        logger.debug('[UNLIM-DEBUG] PlacementResult:', placementResult.success, 'actions:', placementResult.actions?.length, 'errors:', placementResult.errors);
                        if (placementResult.success) {
                            peActions.push(...placementResult.actions);
                            for (const action of placementResult.actions) {
                                if (action.pinAssignments) {
                                    for (const key of Object.keys(action.pinAssignments)) {
                                        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
                                            snapshot.pinAssignments[key] = action.pinAssignments[key];
                                        }
                                    }
                                }
                            }
                        }
                        if (placementResult.errors.length > 0) logger.warn('[PlacementEngine]', placementResult.errors);
                    } catch (parseErr) {
                        logger.warn('[G25] Dropped malformed INTENT tag:', tag.fullMatch.substring(0, 80), '—', parseErr.message);
                        recordActionFailure(tag.fullMatch.substring(0, 40), `parse error: ${parseErr.message}`);
                    }
                }
                logger.debug('[UNLIM-DEBUG] peActions:', peActions.length, peActions.map(a => `${a.type}:${a.tag}`));
                if (peActions.length > 0) {
                    // G25: Sequential placement — components first, then wires.
                    // Each addComponent is sync but we yield between them to let state settle.
                    const peIdMap = {};
                    for (const action of peActions) {
                        if (action.type !== 'addcomponent') continue;
                        try {
                            const tagMatch = action.tag.match(/addcomponent:([^:]+):(-?\d+):(-?\d+)/);
                            logger.debug('[UNLIM-DEBUG] tagMatch:', tagMatch, 'from:', action.tag);
                            if (!tagMatch) continue;
                            const type = TYPE_ALIASES[normalizeComponentToken(tagMatch[1])] || tagMatch[1];
                            const x = parseInt(tagMatch[2], 10) || 200;
                            const y = parseInt(tagMatch[3], 10) || 150;
                            logger.debug('[UNLIM-DEBUG] addComponent:', type, x, y, 'api.addComponent:', !!api.addComponent);
                            if (api.addComponent) {
                                const realId = api.addComponent(type, { x, y });
                                logger.debug('[UNLIM-DEBUG] addComponent result:', realId);
                                if (realId && action.componentId) peIdMap[action.componentId] = realId;
                                executedActions.push(`addcomponent:${realId || type}`);
                            }
                            // G25: Yield to let React state settle between component additions
                            await new Promise(r => setTimeout(r, 0));
                        } catch (err) { logger.error('[UNLIM-DEBUG] addComponent error:', err); recordActionFailure(action.tag, err.message); }
                    }
                    // G25: Small delay before wiring — ensures all components are registered
                    if (peActions.some(a => a.type === 'addwire')) {
                        await new Promise(r => setTimeout(r, 50));
                    }
                    for (const action of peActions) {
                        if (action.type !== 'addwire') continue;
                        try {
                            const inner = action.tag.slice(action.tag.indexOf(':') + 1, -1);
                            const parts = inner.split(':').map(s => s.trim());
                            if (!(parts[1] && parts[2] && parts[3] && parts[4])) continue;
                            let fromComp = peIdMap[parts[1]] || parts[1];
                            let toComp = peIdMap[parts[3]] || parts[3];
                            const fromId = resolveSingleComponentId(fromComp) || fromComp;
                            const toId = resolveSingleComponentId(toComp) || toComp;
                            const fromPin = `${fromId}:${parts[2]}`;
                            const toPin = `${toId}:${parts[4]}`;
                            if (api.addWire) {
                                api.addWire(fromPin, toPin);
                                executedActions.push(`addwire:${fromPin}->${toPin}`);
                            }
                        } catch (err) { recordActionFailure(action.tag, err.message); }
                    }
                }
            } catch (err) {
                logger.warn('[PlacementEngine] fallback to raw AZIONE tags:', err.message);
            }
        }

        // ── Execute [AZIONE:cmd:args] tags ──
        logger.debug('[UNLIM-DEBUG] AZIONE tags to execute:', actionTags);
        for (const tag of actionTags) {
            const colonIdx = tag.indexOf(':');
            if (colonIdx < 0) continue;
            const inner = tag.slice(colonIdx + 1, -1);
            const parts = inner.split(':').map(s => s.trim());
            const cmd = parts[0]?.toLowerCase();
            const tagText = `[AZIONE:${inner}]`;
            logger.debug('[UNLIM-DEBUG] Executing AZIONE:', cmd, 'parts:', parts, 'api:', !!api);
            try {
                if (cmd === 'play') {
                    if (!api?.play) throw new Error('API simulatore non disponibile');
                    api.play(); executedActions.push('play');
                } else if (cmd === 'pause') {
                    if (!api?.pause) throw new Error('API simulatore non disponibile');
                    api.pause(); executedActions.push('pause');
                } else if (cmd === 'reset') {
                    if (!api?.reset) throw new Error('API simulatore non disponibile');
                    api.reset(); executedActions.push('reset');
                } else if (cmd === 'highlight') {
                    if (!api?.unlim?.highlightComponent) throw new Error('highlight non disponibile');
                    const rawTargets = (parts[1] || '').split(',').map(s => s.trim()).filter(Boolean);
                    const resolvedTargets = [...new Set(rawTargets.flatMap(token => resolveComponentIds(token, true)))];
                    if (!resolvedTargets.length) throw new Error('componenti da evidenziare non trovati');
                    api.unlim.highlightComponent(resolvedTargets);
                    setTimeout(() => api.unlim.clearHighlights(), 4000);
                    // Notifica UnlimWrapper per messaggio contestuale accanto al componente
                    window.dispatchEvent(new CustomEvent('unlim-contextual-message', {
                      detail: {
                        text: displayText,
                        targetComponentId: resolvedTargets[0],
                        type: 'hint',
                        icon: null,
                        duration: 5000,
                      },
                    }));
                    executedActions.push(`highlight:${resolvedTargets.join(',')}`);
                } else if (cmd === 'loadexp' && parts[1]) {
                    const resolvedId = resolveExperimentId(parts[1]);
                    if (!api?.getExperiment?.(resolvedId)) throw new Error(`esperimento non trovato: ${parts[1]}`);
                    setPendingExperimentId(resolvedId);
                    setActiveTab('simulator');
                    executedActions.push(`loadexp:${resolvedId}`);
                } else if (cmd === 'opentab' && parts[1]) {
                    const tabMap = { simulatore: 'simulator', manuale: 'manual', video: 'videos', lavagna: 'canvas', taccuini: 'notebooks', detective: 'detective', poe: 'poe', reverse: 'reverse', review: 'review' };
                    const tab = tabMap[parts[1].toLowerCase()] || parts[1];
                    setActiveTab(tab);
                    executedActions.push(`opentab:${parts[1]}`);
                } else if (cmd === 'openvolume' && parts[1]) {
                    const vol = parseInt(parts[1]);
                    const page = parts[2] ? parseInt(parts[2]) : null;
                    if (vol >= 1 && vol <= 3) {
                        loadVolume(vol).then(() => { if (page) setCurrentDocPage(Math.max(0, page - 1)); }).catch(() => { });
                        setActiveTab('manual');
                        executedActions.push(`openvolume:${parts[1]}`);
                    } else throw new Error(`volume non valido: ${parts[1]}`);
                } else if (cmd === 'addwire') {
                    if (!api?.addWire) throw new Error('addWire non disponibile');
                    if (!(parts[1] && parts[2] && parts[3] && parts[4])) throw new Error('argomenti addwire incompleti');
                    const fromId = resolveSingleComponentId(parts[1]);
                    const toId = resolveSingleComponentId(parts[3]);
                    if (!fromId) throw new Error(`componente sorgente non trovato: ${parts[1]}`);
                    if (!toId) throw new Error(`componente destinazione non trovato: ${parts[3]}`);
                    api.addWire(`${fromId}:${parts[2]}`, `${toId}:${parts[4]}`);
                    executedActions.push(`addwire:${fromId}:${parts[2]}->${toId}:${parts[4]}`);
                } else if (cmd === 'removewire') {
                    if (!api?.removeWire) throw new Error('removeWire non disponibile');
                    const wireIndex = Number.parseInt(parts[1], 10);
                    if (!Number.isFinite(wireIndex) || wireIndex < 0) throw new Error(`indice filo non valido: ${parts[1] || ''}`);
                    api.removeWire(wireIndex);
                    executedActions.push(`removewire:${wireIndex}`);
                } else if (cmd === 'addcomponent') {
                    if (!api?.addComponent) throw new Error('addComponent non disponibile');
                    if (!parts[1]) throw new Error('tipo componente mancante');
                    const type = TYPE_ALIASES[normalizeComponentToken(parts[1])] || parts[1];
                    const x = parseIntOr(parts[2], 200);
                    const y = parseIntOr(parts[3], 150);
                    const addedId = api.addComponent(type, { x, y });
                    if (!addedId) throw new Error(`aggiunta componente fallita: ${type}`);
                    executedActions.push(`addcomponent:${addedId}`);
                } else if (cmd === 'removecomponent') {
                    if (!api?.removeComponent) throw new Error('removeComponent non disponibile');
                    if (!parts[1]) throw new Error('componente da rimuovere mancante');
                    const targets = [...new Set(resolveComponentIds(parts[1], true))];
                    if (!targets.length) throw new Error(`componente non trovato: ${parts[1]}`);
                    targets.forEach(id => api.removeComponent(id));
                    executedActions.push(`removecomponent:${targets.join(',')}`);
                } else if (cmd === 'interact') {
                    if (!api?.interact) throw new Error('interact non disponibile');
                    if (!parts[1]) throw new Error('componente da interagire mancante');
                    const compId = resolveSingleComponentId(parts[1]) || parts[1];
                    const action = parts[2] || 'press';
                    const parsedValue = parts[3] ? Number.parseFloat(parts[3]) : undefined;
                    const value = Number.isFinite(parsedValue) ? parsedValue : undefined;
                    api.interact(compId, action, value);
                    if (action === 'press') setTimeout(() => api.interact(compId, 'release'), 300);
                    executedActions.push(`interact:${compId}:${action}`);
                } else if (cmd === 'compile') {
                    if (!api?.getEditorCode) throw new Error('compile non disponibile');
                    const code = api.getEditorCode();
                    if (code) {
                        const compileFn = api.compileAndLoad || api.compile;
                        compileFn(code).then(compileResult => {
                            if (compileResult && !compileResult.success) {
                                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: `\u274C Errore: ${compileResult.errors || 'sconosciuto'}`, proactive: true }]);
                            }
                        }).catch(() => { recordActionFailure(tagText, 'compilazione fallita'); });
                    } else throw new Error('editor codice vuoto');
                    executedActions.push('compile');
                } else if (cmd === 'movecomponent') {
                    if (!api?.moveComponent) throw new Error('moveComponent non disponibile');
                    if (!parts[1]) throw new Error('componente da spostare mancante');
                    const compId = resolveSingleComponentId(parts[1]) || parts[1];
                    const positions = api?.getComponentPositions?.() || {};
                    const fallbackPos = positions?.[compId] || { x: 200, y: 150 };
                    api.moveComponent(compId, parseIntOr(parts[2], fallbackPos.x), parseIntOr(parts[3], fallbackPos.y));
                    executedActions.push(`movecomponent:${compId}`);
                } else if (cmd === 'clearall') {
                    if (!api?.clearAll) throw new Error('clearAll non disponibile');
                    api.clearAll(); executedActions.push('clearall');
                } else if (cmd === 'quiz') {
                    const expId = parts[1] || activeExperiment?.id || null;
                    window.dispatchEvent(new CustomEvent('unlim-quiz', { detail: { experimentId: expId } }));
                    executedActions.push('quiz');
                } else if (cmd === 'youtube' && parts.length > 1) {
                    const query = parts.slice(1).join(' ');
                    handleYouTubeSearch(query);
                    executedActions.push(`youtube:${query.slice(0, 20)}`);
                } else if (cmd === 'createnotebook') {
                    const title = parts.slice(1).join(' ').trim() || `Lezione ${new Date().toLocaleDateString()}`;
                    createNotebook(title);
                    executedActions.push(`createnotebook:${title}`);
                } else if (cmd === 'setvalue') {
                    if (!api?.interact) throw new Error('interact non disponibile');
                    if (!parts[1] || !parts[2] || parts[3] === undefined) throw new Error('argomenti setvalue incompleti');
                    const compId = resolveSingleComponentId(parts[1]) || parts[1];
                    const param = parts[2].toLowerCase();
                    const value = Number.parseFloat(parts[3]);
                    if (!Number.isFinite(value)) throw new Error(`valore non numerico: ${parts[3]}`);
                    const PARAM_MAP = {
                        resistance: 'setResistance', position: 'setPosition', lightlevel: 'setLightLevel',
                        light: 'setLightLevel', luce: 'setLightLevel', angle: 'setPosition', angolo: 'setPosition',
                    };
                    api.interact(compId, PARAM_MAP[param] || `set${param.charAt(0).toUpperCase()}${param.slice(1)}`, value);
                    executedActions.push(`setvalue:${compId}:${param}:${value}`);
                } else if (cmd === 'measure') {
                    if (!parts[1]) throw new Error('componente da misurare mancante');
                    const compId = resolveSingleComponentId(parts[1]) || parts[1];
                    const circuitState = api?.getCircuitState?.();
                    if (!circuitState?.measurements) throw new Error('misurazioni non disponibili — avvia la simulazione');
                    const meas = circuitState.measurements[compId];
                    if (!meas) throw new Error(`nessuna misura per ${compId}`);
                    const vStr = meas.voltage !== undefined ? `${meas.voltage.toFixed(3)} V` : 'N/D';
                    const iStr = meas.current !== undefined ? `${(meas.current * 1000).toFixed(1)} mA` : 'N/D';
                    setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `\uD83D\uDCCA **Misura ${compId}**: Tensione = ${vStr} | Corrente = ${iStr}`, proactive: true }]);
                    executedActions.push(`measure:${compId}`);
                } else if (cmd === 'diagnose') {
                    handleDiagnoseCircuit();
                    executedActions.push('diagnose');
                } else if (cmd === 'openeditor') {
                    if (disclosureLevel < 2) {
                        setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `L'editor del codice Arduino si usa nel **Volume 3**! Per adesso concentriamoci sul circuito.`, proactive: true }]);
                        executedActions.push('openeditor:blocked-disclosure');
                    } else {
                        if (!api?.showEditor) throw new Error('showEditor non disponibile');
                        api.showEditor(); executedActions.push('openeditor');
                    }
                } else if (cmd === 'closeeditor') {
                    if (!api?.hideEditor) throw new Error('hideEditor non disponibile');
                    api.hideEditor(); executedActions.push('closeeditor');
                } else if (cmd === 'switcheditor') {
                    if (disclosureLevel < 2) {
                        setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `I blocchi e il codice Arduino si usano nel **Volume 3**! Per adesso concentriamoci sul circuito.`, proactive: true }]);
                        executedActions.push('switcheditor:blocked-disclosure');
                    } else {
                        if (!api?.setEditorMode) throw new Error('setEditorMode non disponibile');
                        const mode = (parts[1] || '').toLowerCase();
                        if (mode !== 'scratch' && mode !== 'arduino') throw new Error(`modo editor non valido: ${mode}`);
                        if (!api.isEditorVisible?.()) api.showEditor?.();
                        api.setEditorMode(mode);
                        executedActions.push(`switcheditor:${mode}`);
                    }
                } else if (cmd === 'loadblocks') {
                    if (!api?.loadScratchWorkspace) throw new Error('loadScratchWorkspace non disponibile');
                    const xml = parts.slice(1).join(':');
                    if (!xml) throw new Error('XML workspace mancante');
                    api.loadScratchWorkspace(xml);
                    executedActions.push('loadblocks');
                } else if (cmd === 'undo') {
                    if (!api?.undo) throw new Error('undo non disponibile');
                    api.undo(); executedActions.push('undo');
                } else if (cmd === 'redo') {
                    if (!api?.redo) throw new Error('redo non disponibile');
                    api.redo(); executedActions.push('redo');
                } else if (cmd === 'highlightpin') {
                    if (!api?.highlightPin) throw new Error('highlightPin non disponibile');
                    const rawPins = (parts.slice(1).join(':') || '').split(',').map(s => s.trim()).filter(Boolean);
                    if (!rawPins.length) throw new Error('pin da evidenziare mancanti');
                    api.highlightPin(rawPins);
                    setTimeout(() => api.highlightPin([]), 4000);
                    executedActions.push(`highlightpin:${rawPins.join(',')}`);
                } else if (cmd === 'serialwrite') {
                    if (!api?.serialWrite) throw new Error('serialWrite non disponibile');
                    const text = parts.slice(1).join(':');
                    if (!text) throw new Error('testo seriale mancante');
                    api.serialWrite(text);
                    executedActions.push('serialwrite');
                } else if (cmd === 'setbuildmode') {
                    if (!api?.setBuildMode) throw new Error('setBuildMode non disponibile');
                    const modeMap = {
                        montato: 'complete', 'già montato': 'complete', giamontato: 'complete', complete: 'complete',
                        passopasso: 'guided', 'passo passo': 'guided', guided: 'guided',
                        libero: 'sandbox', costruisci: 'sandbox', sandbox: 'sandbox',
                    };
                    const mode = modeMap[(parts[1] || '').toLowerCase().replace(/[\s_-]+/g, '')] || parts[1];
                    if (!mode) throw new Error('modalità mancante');
                    api.setBuildMode(mode);
                    executedActions.push(`setbuildmode:${mode}`);
                } else if (cmd === 'nextstep') {
                    if (!api?.nextStep) throw new Error('nextStep non disponibile');
                    api.nextStep(); executedActions.push('nextstep');
                } else if (cmd === 'prevstep') {
                    if (!api?.prevStep) throw new Error('prevStep non disponibile');
                    api.prevStep(); executedActions.push('prevstep');
                } else if (cmd === 'showbom') {
                    if (!api?.showBom) throw new Error('showBom non disponibile');
                    api.showBom(); executedActions.push('showbom');
                } else if (cmd === 'showserial') {
                    if (!api?.showSerialMonitor) throw new Error('showSerialMonitor non disponibile');
                    api.showSerialMonitor(); executedActions.push('showserial');
                } else if (cmd === 'listcomponents') {
                    const components = getLiveComponents();
                    if (components.length === 0) {
                        setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: '\uD83D\uDCCB **Componenti**: Nessun componente piazzato.', proactive: true }]);
                    } else {
                        const list = components.map(c => `\u2022 **${c.id}** (${c.type})`).join('\n');
                        setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `\uD83D\uDCCB **Componenti piazzati** (${components.length}):\n${list}`, proactive: true }]);
                    }
                    executedActions.push('listcomponents');
                } else if (cmd === 'getstate') {
                    const circuitState = api?.getCircuitState?.() || api?.unlim?.getCircuitState?.();
                    if (!circuitState) throw new Error('stato circuito non disponibile');
                    const comps = (circuitState.components || []).length;
                    const wires = (circuitState.connections || []).length;
                    const simState = circuitState.isSimulating ? '\u25B6 In esecuzione' : '\u23F8 Fermata';
                    const expName = circuitState.experiment?.title || 'Nessuno';
                    setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `\uD83D\uDCCA **Stato Circuito**:\n\u2022 Esperimento: **${expName}**\n\u2022 Componenti: **${comps}**\n\u2022 Fili: **${wires}**\n\u2022 Simulazione: **${simState}**`, proactive: true }]);
                    executedActions.push('getstate');
                } else if (cmd === 'setcode') {
                    const arg = parts.slice(1).join(':').replace(/\\n/g, '\n');
                    if (!arg) throw new Error('codice mancante');
                    if (!api?.setEditorCode) throw new Error('setEditorCode non disponibile');
                    api.showEditor?.(); api.setEditorMode?.('arduino');
                    api.setEditorCode(arg);
                    executedActions.push('setcode');
                } else if (cmd === 'appendcode') {
                    const arg = parts.slice(1).join(':').replace(/\\n/g, '\n');
                    if (!arg) throw new Error('codice mancante');
                    if (!api?.appendEditorCode) throw new Error('appendEditorCode non disponibile');
                    api.showEditor?.(); api.setEditorMode?.('arduino');
                    api.appendEditorCode(arg);
                    executedActions.push('appendcode');
                } else if (cmd === 'getcode') {
                    const code = api?.getEditorCode?.() || '';
                    const mode = api?.getEditorMode?.() || 'arduino';
                    const displayCode = code ? code.substring(0, 500) + (code.length > 500 ? '\n// ... (troncato)' : '') : '(vuoto)';
                    setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: `\uD83D\uDCDD **Codice ${mode === 'scratch' ? 'Scratch (generato)' : 'Arduino'}**:\n\`\`\`cpp\n${displayCode}\n\`\`\``, proactive: true }]);
                    executedActions.push('getcode');
                } else if (cmd === 'resetcode') {
                    if (!api?.resetEditorCode) throw new Error('resetEditorCode non disponibile');
                    api.showEditor?.(); api.setEditorMode?.('arduino');
                    api.resetEditorCode();
                    executedActions.push('resetcode');
                } else if (cmd === 'openchat') {
                    setShowChat(true); executedActions.push('openchat');
                } else if (cmd === 'closechat') {
                    setShowChat(false); executedActions.push('closechat');
                } else if (cmd === 'fullscreenscratch') {
                    if (!api?.showEditor) throw new Error('showEditor non disponibile');
                    api.showEditor(); api.setEditorMode?.('scratch'); api.setScratchFullscreen?.(true);
                    executedActions.push('fullscreenscratch');
                } else if (cmd === 'exitscratchfullscreen') {
                    api.setScratchFullscreen?.(false);
                    executedActions.push('exitscratchfullscreen');
                }
            } catch (err) {
                recordActionFailure(tagText, err?.message || 'errore sconosciuto');
            }
        }

        if (actionFailures.length > 0) {
            const uniqueFailures = [...new Set(actionFailures)];
            errorHistoryRef.current.push(...uniqueFailures.map(f => `action_fail:${f}`));
            if (errorHistoryRef.current.length > 10) errorHistoryRef.current = errorHistoryRef.current.slice(-10);
            // G25: Console warn for EVERY dropped action (no silent drops)
            for (const failure of uniqueFailures) {
                logger.warn('[G25] Action dropped:', failure);
            }
            // G25: User-facing message if majority of actions failed
            const totalActions = actionTags.length + intentTags.length;
            if (totalActions > 0 && actionFailures.length > totalActions * 0.5) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 3,
                    role: 'assistant',
                    content: 'UNLIM non ha capito bene come eseguire questa azione. Riprova con parole diverse!',
                    proactive: true,
                }]);
            }
        }

        // ── Quiz fallback ──
        const quizKeywords = /\b(quiz|verificami|testami|domande\s+di\s+verifica)\b/i;
        if (quizKeywords.test(userLower) && !executedActions.some(a => a === 'quiz')) {
            window.dispatchEvent(new CustomEvent('unlim-quiz', { detail: { experimentId: activeExperiment?.id || null } }));
            executedActions.push('quiz');
        }

        // Update message with executed actions badge
        if (executedActions.length > 0 && msgId) {
            setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, _executedActions: executedActions } : m
            ));
        }

        // ── Implicit navigation ──
        if (!actionTags.length) {
            if (aiLower.includes('simulatore') || aiLower.includes('circuito')) setActiveTab('simulator');
            const elabPageMatch = aiResponse.match(/\[V(\d)P(\d+)\]/i);
            const volPageMatch2 = aiLower.match(/(?:volume|vol\.?|v)\s*(\d)\s*(?:pagina|pag\.?|p\.?)\s*(\d+)/i) || aiLower.match(/v(\d)p(\d+)/i);
            const simplePageMatch = aiLower.match(/pagina\s*(\d+)/);
            if (elabPageMatch) {
                loadVolume(parseInt(elabPageMatch[1])).then(() => setCurrentDocPage(Math.max(0, parseInt(elabPageMatch[2]) - 1))).catch(() => { });
                setActiveTab('manual');
            } else if (volPageMatch2) {
                loadVolume(parseInt(volPageMatch2[1])).then(() => setCurrentDocPage(Math.max(0, parseInt(volPageMatch2[2]) - 1))).catch(() => { });
                setActiveTab('manual');
            } else if (simplePageMatch) {
                const volMention = aiLower.match(/(?:volume|vol\.?)\s*(\d)/);
                const vol = volMention ? parseInt(volMention[1]) : 1;
                loadVolume(vol).then(() => setCurrentDocPage(Math.max(0, parseInt(simplePageMatch[1]) - 1))).catch(() => { });
                setActiveTab('manual');
            }
            if (userLower.includes('led') && (userLower.includes('accendi') || userLower.includes('spegni'))) setActiveTab('simulator');
        }

        return displayText;
    };

    // ===================== CHAT HANDLER =====================

    const handleSend = async (messageOverride) => {
        const userMessage = messageOverride || input;
        if (!userMessage.trim() || isLoading) return;

        pushActivity('message_sent', userMessage.slice(0, 60));
        sessionMetrics.trackInteraction();
        const validation = validateMessage(userMessage);
        if (!validation.allowed) {
            setMessages(prev => [...prev,
            { id: Date.now(), role: 'user', content: userMessage },
            { id: Date.now() + 1, role: 'assistant', content: validation.message }
            ]);
            if (!messageOverride) setInput('');
            return;
        }

        const rateCheck = checkRateLimit();
        if (!rateCheck.allowed) {
            setMessages(prev => [...prev,
            { id: Date.now(), role: 'user', content: userMessage },
            { id: Date.now() + 1, role: 'assistant', content: rateCheck.message, isRateLimit: true }
            ]);
            if (!messageOverride) setInput('');
            return;
        }

        if (!messageOverride) setInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);

        // detectIntent: try/catch protects chat from any runtime error in command parsing
        let localResponse = null;
        try {
            localResponse = detectIntent(userMessage);
        } catch (err) {
            // Log silently — never break chat flow due to detectIntent bugs
            logger.warn('[UNLIM] detectIntent error:', err.message);
        }
        if (localResponse) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: localResponse
            }]);
            return;
        }

        setIsLoading(true);

        const volNum = activeExperiment?.id?.match(/^v(\d+)-/)?.[1] || '?';
        // UNLIM CENTRO DI COMANDO: always include tutor context + circuit state
        const tutorContext = buildTutorContext();
        const liveCircuit = circuitStateRef.current?.text || circuitStateRef.current || '';

        // S73 FIX-6: Goal state enrichment — tell the backend WHAT the user wants
        let goalContext = '';
        if (ACTION_INTENT_KEYWORDS.test(userMessage)) {
            const circuitData = circuitStateRef.current?.structured || circuitStateRef.current || {};
            const currentComponents = (circuitData.components || []).map(c => `${c.id} (${c.type})`);
            const currentWires = (circuitData.connections || []).length;
            goalContext = `\n[Richiesta utente]: "${userMessage.substring(0, 150)}"`;
            goalContext += `\n[Componenti attuali]: ${currentComponents.length > 0 ? currentComponents.join(', ') : 'nessuno'}`;
            goalContext += `\n[Fili attuali]: ${currentWires}`;
            if (activeExperiment?.components) {
                const expectedTypes = activeExperiment.components.map(c => c.type);
                const currentTypes = (circuitData.components || []).map(c => c.type);
                const missing = expectedTypes.filter(t => !currentTypes.includes(t));
                if (missing.length > 0) {
                    goalContext += `\n[Componenti mancanti per esperimento]: ${missing.join(', ')}`;
                }
            }
        }

        const experimentContext = liveCircuit
            ? `${tutorContext}\n${liveCircuit}${goalContext}`
            : activeExperiment
                ? `${tutorContext}\n[Esp: Vol.${volNum} "${activeExperiment.title || activeExperiment.id || ''}" — ${activeExperiment.chapter || ''} — componenti: ${(activeExperiment.components || []).map(c => c.type).join(', ')}]${goalContext}`
                : `${tutorContext}${goalContext}`;

        // ── Auto-screenshot (UNLIM Onnipotente — FASE 4 + Smart Canvas) ──
        // Capture screenshot from the CORRECT source based on active tab
        let autoImages = [];
        let autoScreenshotSource = null;
        if (shouldAutoScreenshot(userMessage)) {
            try {
                const { dataUrl, source } = await captureActiveVisualContext(userMessage);
                autoScreenshotSource = source;

                if (dataUrl) {
                    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
                    autoImages = [{ base64, mimeType: 'image/png' }];
                }
            } catch (err) {
                // Never break chat flow due to screenshot failure
                logger.warn('[UNLIM] Auto-screenshot failed:', err.message);
            }
        }

        const isWhiteboardScreenshot = autoScreenshotSource === 'tutor-canvas' || autoScreenshotSource === 'simulator-whiteboard';
        const isNonSimulatorVisual = isWhiteboardScreenshot ||
            autoScreenshotSource === 'manual-page' ||
            autoScreenshotSource === 'document-page' ||
            autoScreenshotSource === 'active-tab';
        // S104: Collect unified simulator context for UNLIM Context Engine
        let simulatorContext = null;
        if (!isNonSimulatorVisual) {
            try {
                const api = typeof window !== 'undefined' && window.__ELAB_API;
                if (api?.getSimulatorContext) {
                    simulatorContext = api.getSimulatorContext();
                }
            } catch { /* silent — don't break chat flow */ }
        }

        const result = await sendChat(userMessage, autoImages, {
            socraticMode: isSocraticMode,
            experimentContext: isNonSimulatorVisual ? null : experimentContext,
            circuitState: isNonSimulatorVisual ? null : (circuitStateRef.current
                ? (circuitStateRef.current.structured
                    ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                    : { raw: circuitStateRef.current })
                : null),
            experimentId: isNonSimulatorVisual ? null : (activeExperiment?.id || null),
            simulatorContext,
        });

        if (result.success) {
            try { studentTracker.logChatInteraction(userMessage); } catch { }
            const rawResponse = (typeof result.response === 'string') ? result.response : (result.response ? JSON.stringify(result.response) : 'Errore: risposta non valida.');
            const aiResponse = sanitizeOutput(rawResponse);
            // Use shared processAiResponse for tag stripping + action execution
            const msgId = Date.now() + 1;
            // Step 1: Strip tags to get display text (synchronous part)
            let strippedForDisplay = aiResponse;
            for (const { fullMatch } of extractIntentTags(aiResponse)) {
                strippedForDisplay = strippedForDisplay.replace(fullMatch, '');
            }
            let displayText = strippedForDisplay
                .replace(/\[azione:[^\]]+\]/gi, '')
                .replace(/\[AZIONE:[^\]]+\]/g, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

            // iter-RALPH-1 (2026-05-12): word count cap 80→140 to match new 120-parole rule
            // (feedback 2026-05-10). Safety margin +20 over target 120 for graceful sentence end.
            const UNLIM_MAX_WORDS = 140;
            const words = displayText.split(/\s+/).filter(Boolean);
            if (words.length > UNLIM_MAX_WORDS) {
                const truncated = words.slice(0, UNLIM_MAX_WORDS).join(' ');
                // Find last sentence boundary (. ! ?)
                const lastSentence = truncated.search(/[.!?][^.!?]*$/);
                displayText = lastSentence > 20
                    ? truncated.substring(0, lastSentence + 1)
                    : truncated + '…';
            }

            // Step 2: Add message FIRST (so action execution can reference/update it)
            setMessages(prev => [...prev, {
                id: msgId,
                role: 'assistant',
                content: displayText || aiResponse,
                source: result.source || null,
                _executedActions: [],
            }]);

            // Step 3: Execute actions (async — Ralph Loop, PlacementEngine, AZIONE commands)
            await processAiResponse(aiResponse, userMessage, msgId);
        } else {
            const errorMsg = result.error || result.response || 'Qualcosa non ha funzionato. Riprova tra qualche secondo.';
            let friendlyError = errorMsg;
            if (errorMsg.includes('Timeout') || errorMsg.includes('timeout')) {
                friendlyError = 'UNLIM ci sta mettendo un po\'. Riprova tra qualche secondo.';
            } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                friendlyError = 'Controlla la connessione internet e riprova.';
            } else if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503')) {
                friendlyError = 'Il server ha un problema temporaneo. Riprova tra un momento.';
            }
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: friendlyError,
                isError: true,
                retryMessage: userMessage
            }]);
        }
        // Loading state is rendered by ChatOverlay only; no duplicate assistant placeholder.
        setMessages(prev => prev.filter(m => !m.isSlowIndicator));
        setIsLoading(false);
    };

    const handleRetry = (retryMessage) => {
        setMessages(prev => prev.filter(m => !m.isError || m.retryMessage !== retryMessage));
        handleSend(retryMessage);
    };

    // (handleCompile rimosso — editor Arduino eliminato)

    // ===================== QUICK ACTIONS =====================

    const showLessonChecklist = useCallback(() => {
        setShowChat(true);
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: `**Checklist Lezione (30 min)**\n\n- Obiettivo spiegato in 1 frase (oggi cosa impariamo?)\n- Manuale Vol.1 aperto sulla pagina iniziale\n- Simulatore avviato con 1 circuito base (LED + resistenza)\n- Almeno 1 prova fatta dagli studenti (Play/Stop o piccola modifica)\n- Chiusura con 1 domanda di riflessione + 1 mini compito per casa\n\nSe vuoi, ti preparo anche una scaletta pronta da leggere in classe.`
        }]);
    }, []);

    const defaultQuickActions = [
        { text: 'Esperimento', action: () => setActiveTab('simulator') },
        { text: 'Manuale', action: () => setActiveTab('manual') },
        { text: 'Diagnosi Circuito', action: handleDiagnoseCircuit },
        { text: 'Suggerimenti', action: handleGetHints },
        {
            text: 'Fammi una domanda guida',
            action: () => handleSend('Fammi una domanda guida su questo argomento. Usa parole semplici, una domanda alla volta, adatta a ragazzi 8-14 anni.')
        },
        {
            text: 'Aiutami senza dirmi la risposta',
            action: () => handleSend('Aiutami a risolvere questo esercizio senza dirmi la risposta finale. Guidami passo passo con suggerimenti brevi per studenti 8-14 anni.')
        },
        {
            text: 'Controlla il mio ragionamento',
            action: () => handleSend('Controlla il mio ragionamento: dimmi cosa va bene, cosa migliorare e fammi una domanda di verifica. Tono chiaro per eta 8-14.')
        },
        {
            text: 'Dammi un indizio',
            action: () => handleSend('Dammi solo un indizio breve per andare avanti, senza spoiler della soluzione. Linguaggio semplice per 8-14 anni.')
        },
        { text: 'Trova il Guasto', action: () => setActiveTab('detective') },
        { text: 'Prevedi e Spiega', action: () => setActiveTab('poe') },
        { text: 'Circuito Misterioso', action: () => setActiveTab('reverse') },
        { text: 'Controlla Circuito', action: () => setActiveTab('review') },
        { text: 'Lavagna', action: () => setActiveTab('canvas') },
    ];

    const quickActions = isDocente
        ? [
            { text: 'Apri Manuale Vol1', action: () => { setActiveTab('manual'); loadVolume(1); } },
            { text: 'Apri Simulatore Base', action: () => { setPendingExperimentId(null); setActiveTab('simulator'); } },
            { text: 'Checklist Lezione', action: showLessonChecklist },
            ...defaultQuickActions,
        ]
        : defaultQuickActions;

    const isMobile = useIsMobile(768);

    // ===================== RENDER =====================

    return (
        <SessionRecorderProvider>
            <div className={`elab-v4 ${isFullscreen ? 'fullscreen-mode' : ''}`}>
                {provaMode && (
                    <div style={{
                        background: 'linear-gradient(90deg, var(--elab-navy), #2563EB)',
                        color: 'white',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontFamily: "'Open Sans', sans-serif",
                        zIndex: 100,
                    }}>
                        <span>Versione di prova — Volume 1 ({VOL1_COUNT} esperimenti)</span>
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('register')}
                                style={{
                                    background: 'var(--elab-lime)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '4px 14px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    minHeight: '44px',
                                }}
                            >
                                Tutti i {TOTAL_EXPERIMENTS} esperimenti
                            </button>
                        )}
                    </div>
                )}

                {/* ── G22: Volume Chooser Overlay ── */}
                {/* Shows every session start: "Bentornati" (returning) or "Ciao" (first time) */}
                {!provaMode && showVolumeChooser && (
                    <VolumeChooser
                        onSelectVolume={(vol) => {
                            setActiveVolume(vol);
                            // Update welcome message after volume selection
                            const volLabel = vol === 'inventor' ? 'Inventore' : `Volume ${vol}`;
                            const welcomeMsg = vol === 'inventor'
                                ? `**Modalità Inventore attiva!**\n\nHai tutti i componenti a disposizione. Costruisci quello che vuoi!`
                                : `**${volLabel} selezionato!**\n\nScegliete un esperimento o chiedetemi qualcosa!`;
                            setMessages([{ id: 'welcome', role: 'assistant', content: welcomeMsg }]);
                        }}
                        lastVolume={_savedVolume}
                        lastExperimentTitle={_classProfile.lastExperimentTitle}
                        isFirstTime={_classProfile.isFirstTime}
                    />
                )}

                <TutorLayout
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hideNavigation={activeTab === 'simulator'}
                    messages={messages}
                    input={input}
                    onInputChange={setInput}
                    onSend={handleSend}
                    isLoading={isLoading}
                    onRetry={handleRetry}
                    quickActions={quickActions}
                    showChat={showChat}
                    onToggleChat={() => setShowChat(p => !p)}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleNativeFullscreen}
                    sessionLogLength={sessionLog.length}
                    onExportSession={exportSession}
                    selectedVolume={selectedVolume}
                    activeVolume={activeVolume}
                    onChangeVolume={() => setShowVolumeChooser(true)}
                    isMobile={isMobile}
                    socraticMode={isSocraticMode}
                    onToggleSocraticMode={null}
                    allowedGames={isDocente ? null : user?.classActiveGames ?? null}
                    voiceEnabled={voiceEnabled}
                    onVoiceToggle={handleVoiceToggle}
                    voiceRecording={voiceRecording}
                    onVoiceRecord={handleVoiceRecord}
                    voicePlaying={voicePlaying}
                    voiceAvailable={voiceAvailable}
                    onScreenshot={async () => {
                        try {
                            const { dataUrl, source: captureSource } = await captureActiveVisualContext('screenshot');
                            if (dataUrl) {
                                const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
                                const images = [{ base64, mimeType: 'image/png' }];
                                const isCanvas = captureSource === 'tutor-canvas' || captureSource === 'simulator-whiteboard';
                                const isManualPage = captureSource === 'manual-page' || captureSource === 'document-page';
                                const chatMsg = isCanvas
                                    ? 'Analizza questo disegno dalla lavagna e dimmi cosa vedi, se ci sono errori o suggerimenti.'
                                    : isManualPage
                                        ? 'Analizza questa pagina e spiegami i concetti principali in modo semplice.'
                                        : 'Analizza questa schermata del simulatore e dimmi se vedi qualcosa di sbagliato o se va tutto bene.';
                                setMessages(prev => [...prev, {
                                    id: Date.now(), role: 'user',
                                    content: isCanvas ? 'Analizza il mio disegno dalla lavagna' : isManualPage ? 'Analizza questa pagina' : 'Analizza questa schermata',
                                    image: dataUrl,
                                }]);
                                setShowChat(true);
                                setIsLoading(true);
                                // Canvas screenshots: no circuit context (distract vision)
                                // Simulator screenshots: include full context
                                const result = isCanvas
                                    ? await sendChat(chatMsg, images, {
                                        socraticMode: isSocraticMode,
                                        experimentContext: null,
                                        circuitState: null,
                                        experimentId: null,
                                    })
                                    : isManualPage
                                        ? await sendChat(chatMsg, images, {
                                            socraticMode: isSocraticMode,
                                            experimentContext: null,
                                            circuitState: null,
                                            experimentId: null,
                                        })
                                        : await sendChat(chatMsg, images, {
                                            socraticMode: isSocraticMode,
                                            experimentContext: buildTutorContext(),
                                            circuitState: circuitStateRef.current?.structured
                                                ? { structured: circuitStateRef.current.structured, text: circuitStateRef.current.text }
                                                : (circuitStateRef.current ? { raw: circuitStateRef.current } : null),
                                            experimentId: activeExperiment?.id || null,
                                        });
                                setIsLoading(false);
                                if (result.success) {
                                    const displayText = (result.response || '').replace(/\[azione:[^\]]+\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();
                                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: displayText, source: result.source || null }]);
                                } else {
                                    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Non sono riuscito ad analizzare lo screenshot. Riprova!', isError: true }]);
                                }
                            } else {
                                setShowChat(true);
                                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Non c\'e nulla da catturare. Apri il simulatore o la lavagna e riprova!' }]);
                            }
                        } catch (err) {
                            setIsLoading(false);
                            logger.warn('[Screenshot] Error:', err);
                        }
                    }}
                >
                    {/* === CONTENT PANEL === */}
                    <div className="v4-panel" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <TabHint tabId={activeTab} onDismiss={() => { }} />

                        {activeTab === 'manual' && (
                            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: 'var(--elab-navy)' }}>Caricamento...</div>}>
                            <ManualTab
                                selectedVolume={selectedVolume}
                                volumePages={volumePages}
                                loadingVolume={loadingVolume}
                                volumeProgress={volumeProgress}
                                onLoadVolume={loadVolume}
                                uploadedDocs={uploadedDocs}
                                currentDoc={currentDoc}
                                currentDocPage={currentDocPage}
                                viewMode={viewMode}
                                fitMode={fitMode}
                                pdfZoom={pdfZoom}
                                onSetUploadedDocs={setUploadedDocs}
                                onSetCurrentDoc={setCurrentDoc}
                                onSetCurrentDocPage={setCurrentDocPage}
                                onSetViewMode={setViewMode}
                                onSetFitMode={setFitMode}
                                onSetPdfZoom={setPdfZoom}
                                onSendDocScreenshot={sendDocScreenshotToChat}
                                onToggleFullscreen={toggleNativeFullscreen}
                                isFullscreen={isFullscreen}
                                docViewerRef={docViewerRef}
                            />
                            </Suspense>
                        )}

                        <div style={{ display: activeTab === 'simulator' ? 'block' : 'none', height: activeTab === 'simulator' ? '100%' : 0 }}>
                            <NewElabSimulator
                                onExperimentChange={handleExperimentChange}
                                onCircuitStateChange={(ctx) => { circuitStateRef.current = ctx; }}
                                onCircuitEvent={handleCircuitEvent}
                                initialExperimentId={pendingExperimentId}
                                onInitialExperimentConsumed={() => setPendingExperimentId(null)}
                                userKits={provaMode ? ['Volume 1'] : (isDocente || user?.ruolo === 'admin' ? null : (user?.kits || []))}
                                activeVolume={activeVolume}
                                onDiagnoseCircuit={handleDiagnoseCircuit}
                                onGetHints={handleGetHints}
                                onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                onSendImageToUNLIM={handleSendImageToUNLIM}
                                messagesRef={messagesForReportRef}
                                quizResultsRef={quizResultsForReportRef}
                                sessionStartRef={sessionStartRef}
                                circuitStateRef={circuitStateRef}
                                onTabChange={setActiveTab}
                                disclosureLevel={disclosureLevel}
                            />
                        </div>

                        {activeTab === 'detective' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <CircuitDetective
                                    onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'poe' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <PredictObserveExplain
                                    onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'reverse' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <ReverseEngineeringLab
                                    onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'review' && (
                            <Suspense fallback={<div className="game-loading">Caricamento gioco...</div>}>
                                <CircuitReview
                                    onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                    onOpenSimulator={(experimentId) => { setPendingExperimentId(experimentId || null); setActiveTab('simulator'); }}
                                    logSession={logSession}
                                />
                            </Suspense>
                        )}

                        {activeTab === 'canvas' && (
                            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: 'var(--elab-navy)' }}>Caricamento...</div>}>
                            <CanvasTab
                                canvasRef={canvasRef}
                                ctxRef={ctxRef}
                                slides={slides}
                                onSetIsPresentationMode={setIsPresentationMode}
                                onAddCanvasToSlides={addCanvasToSlides}
                                activeNotebookId={activeNotebookId}
                                activePageIndex={activePageIndex}
                                onChangePage={changePage}
                                onSetShowChat={setShowChat}
                                onSetMessages={setMessages}
                                onSetIsLoading={setIsLoading}
                                onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                                onSendImageToUNLIM={handleSendImageToUNLIM}
                            />
                            </Suspense>
                        )}

                        {activeTab === 'notebooks' && (
                            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: 'var(--elab-navy)' }}>Caricamento...</div>}>
                            <NotebooksTab
                                notebooks={notebooks}
                                activeNotebookId={activeNotebookId}
                                activePageIndex={activePageIndex}
                                notebookTitle={notebookTitle}
                                onSetNotebookTitle={setNotebookTitle}
                                onCreateNotebook={createNotebook}
                                onOpenNotebook={openNotebook}
                                onDeleteNotebook={deleteNotebookNew}
                                onCloseNotebook={closeNotebook}
                                onChangePage={changePage}
                                onAddPage={addPage}
                                onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                            />
                            </Suspense>
                        )}

                        {activeTab === 'videos' && (
                            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center', color: 'var(--elab-navy)' }}>Caricamento...</div>}>
                            <VideosTab
                                youtubeUrl={youtubeUrl}
                                currentVideoId={currentVideoId}
                                onSetYoutubeUrl={setYoutubeUrl}
                                onSetCurrentVideoId={setCurrentVideoId}
                                onAddYoutubeVideo={addYoutubeVideo}
                                meetLink={meetLink}
                                meetActive={meetActive}
                                meetCopied={meetCopied}
                                onSetMeetLink={setMeetLink}
                                onSetMeetActive={setMeetActive}
                                onStartMeet={startMeet}
                                onJoinMeet={joinMeet}
                                onCopyMeetLink={copyMeetLink}
                                onStopMeet={stopMeet}
                                onSendToUNLIM={(msg) => { setShowChat(true); handleSend(msg); }}
                            />
                            </Suspense>
                        )}

                        {/* © Andrea Marro — 27/02/2026 — ELAB Tutor — Tutti i diritti riservati */}
                    </div>
                </TutorLayout>

                {/* Presentation Modal */}
                {isPresentationMode && slides.length > 0 && (
                    <PresentationModal
                        slides={slides}
                        currentSlideIndex={currentSlideIndex}
                        onGoToSlide={goToSlide}
                        onClose={() => setIsPresentationMode(false)}
                    />
                )}

                {/* S99: Custom confirmation modal */}
                <ConfirmDialog />
            </div>
        </SessionRecorderProvider>
    );
}
