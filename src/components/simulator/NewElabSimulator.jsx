/**
 * ELAB Simulator — Main Shell Component (Interactive Edition)
 * Container principale: sidebar (ExperimentPicker / ComponentPalette) +
 * main (ControlBar + Canvas) + right panel (CodeEditor) + bottom (SerialMonitor)
 *
 * Supports both CircuitSolver (Vol1/2) and AVRBridge (Vol3) modes.
 * Full interactivity: drag-drop components, wire connections,
 * component manipulation, potentiometer/LDR overlays, code editing.
 *
 * Andrea Marro — 10/02/2026
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  lazy,
} from 'react';
import SimulatorCanvas from './canvas/SimulatorCanvas';
import DrawingOverlay from './canvas/DrawingOverlay';
import ExperimentPicker from './panels/ExperimentPicker';
import ComponentPalette from './panels/ComponentPalette';
import MinimalControlBar from './panels/MinimalControlBar';
import SerialMonitor from './panels/SerialMonitor';
import SerialPlotter from './panels/SerialPlotter';
import CircuitSolver from './engine/CircuitSolver';
import { findExperimentById, ALL_EXPERIMENTS } from '../../data/experiments-index';
import { openReportWindow } from '../unlim/UnlimReport';
import { compileCode as apiCompileCode } from '../../services/api';
import { emitSimulatorEvent } from '../../services/simulator-api';
import { pushActivity } from '../../services/activityBuffer';
import { sendAnalyticsEvent, EVENTS } from './api/AnalyticsWebhook';
import studentTracker from '../../services/studentTracker';
import useUndoRedo from './hooks/useUndoRedo';
import useCircuitStorage from './hooks/useCircuitStorage';
import useMergedExperiment from './hooks/useMergedExperiment';
import useSimulatorAPI from './hooks/useSimulatorAPI';
import useExperimentLoader from './hooks/useExperimentLoader';
import useCircuitHandlers from './hooks/useCircuitHandlers';
import CodeEditorCM6 from './panels/CodeEditorCM6';
import ScratchCompileBar, { ScratchErrorBoundary } from './panels/ScratchCompileBar';
const ScratchEditor = lazy(() => import('./panels/ScratchEditor'));

import PotOverlay from './overlays/PotOverlay';
import LdrOverlay from './overlays/LdrOverlay';
import PropertiesPanel from './panels/PropertiesPanel';
import GalileoResponsePanel from './panels/GalileoResponsePanel';
import ExperimentGuide from './panels/ExperimentGuide';
import BuildModeGuide from './panels/BuildModeGuide';
import ComponentDrawer from './panels/ComponentDrawer';
import NotesPanel from './panels/NotesPanel';
import BomPanel from './panels/BomPanel';
import LessonPathPanel from './panels/LessonPathPanel';
import ShortcutsPanel from './panels/ShortcutsPanel';
import WhiteboardOverlay from './panels/WhiteboardOverlay';
import QuizPanel from './panels/QuizPanel';
import RotateDeviceOverlay from './overlays/RotateDeviceOverlay';
import Annotation from './components/Annotation';
import { useSessionRecorder } from '../../context/SessionRecorderContext';
import { WrenchIcon, FootstepsIcon, PaletteIcon } from '../common/ElabIcons';
import './ElabSimulator.css';
import lyStyles from './layout.module.css';
import { translateCompilationErrors } from './utils/errorTranslator';
import { buildPinComponentMap } from './utils/pinComponentMap';
import logger from '../../utils/logger';
import __useDisclosureLevel from './hooks/useDisclosureLevel';

/* ═══════════════════════════════════════════════════════════════════
   ELAB Palette constants
   ═══════════════════════════════════════════════════════════════════ */
const LIME = 'var(--color-accent)';
const FONT_BODY = "var(--font-sans)";

/* Helpers extracted to utils/pinComponentMap.js and utils/breadboardSnap.js — Andrea Marro 12/02/2026 */

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const NewElabSimulator = ({
  onCodeSelect,
  onExperimentChange,
  onCircuitStateChange,
  onCircuitEvent,
  initialExperimentId = null,
  onInitialExperimentConsumed,
  onOpenSimulator,
  highlightedComponents = [],
  highlightedPins = [],
  userKits = null,
  onDiagnoseCircuit,
  onGetHints,
  onSendToUNLIM,
  onSendImageToUNLIM,
  messagesRef,
  quizResultsRef,
  sessionStartRef,
  circuitStateRef,
  onTabChange,
  disclosureLevel = 1,
  activeVolume = null,
  hideLessonPath = false,
  hideComponentDrawer = false,
  enableDrawingSync = false,
}) => {
  // ─── UNLIM API highlight state (internal, merged with props) ───
  const [apiHighlightedComponents, setApiHighlightedComponents] = useState([]);
  const [apiHighlightedPins, setApiHighlightedPins] = useState([]);
  const asArray = useCallback((v) => (Array.isArray(v) ? v : []), []);

  // ─── G22: Volume-aware experiment access ───
  // When activeVolume is set, restrict ExperimentPicker to that volume's experiments.
  // Inventor mode or null activeVolume → show all (use original userKits).
  const volumeUserKits = useMemo(() => {
    if (activeVolume === 'inventor' || activeVolume === null) return userKits; // admin/inventor: show all
    // activeVolume is 1, 2, or 3 → only show that volume
    return [`Volume ${activeVolume}`];
  }, [activeVolume, userKits]);

  // ─── Core state ───
  const [currentExperiment, setCurrentExperiment] = useState(null);
  const mergedExperimentRef = useRef(null);
  const [componentStates, setComponentStates] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [simulationAnnouncement, setSimulationAnnouncement] = useState('');
  const isRunningRef = useRef(false);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  const [simulationTime, setSimulationTime] = useState(0);
  const [showSidebar, setShowSidebar] = useState(() => {
    // Lavagna has its own panels — hide simulator sidebar
    if (window.location.hash === '#lavagna') return false;
    // G12 RESPIRA: sidebar hidden by default (progressive disclosure)
    try { const v = localStorage.getItem('elab-sidebar-pref'); return v === '1'; }
    catch { return false; }
  });
  const [serialOutput, setSerialOutput] = useState('');
  const [avrReady, setAvrReady] = useState(false);
  const solverRef = useRef(null);
  const avrRef = useRef(null);
  const timeRef = useRef(0);
  const avrPollRef = useRef(null);
  const pinMapRef = useRef({});
  const loadedExpIdRef = useRef(null);
  const compilingRef = useRef(false);
  const statusTimersRef = useRef([]);
  const wireStartRef = useRef(null);
  const probeConnectionsRef = useRef({});
  const avrSetupLockRef = useRef({ inProgress: false, expId: null });

  // ─── Panel toggle state ───
  const [showPalette, setShowPalette] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorMode, setEditorMode] = useState('arduino');
  const [modeSwitchNotice, setModeSwitchNotice] = useState(null);
  const [scratchFullscreen, setScratchFullscreen] = useState(false);
  const [scratchXml, setScratchXml] = useState('');
  const [scratchGeneratedCode, setScratchGeneratedCode] = useState('');
  const [wireMode, setWireMode] = useState(false);
  const [bottomPanel, setBottomPanel] = useState('monitor');
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [serialBaudRate, setSerialBaudRate] = useState(9600);
  const [serialTimestamps, setSerialTimestamps] = useState(false);
  const [baudMismatch, setBaudMismatch] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  // T1-001 fix: useRef to avoid stale closure on isDrawingEnabled
  // and eliminate registration gap when drawingEnabled changes.
  const drawingEnabledRef = useRef(drawingEnabled);
  useEffect(() => { drawingEnabledRef.current = drawingEnabled; }, [drawingEnabled]);

  // Expose drawing toggle on __ELAB_API for Lavagna toolbar
  // Poll until API is available (it's created async by useSimulatorAPI)
  // Registered ONCE ([] deps) -- no gap between cleanup and re-registration
  useEffect(() => {
    const toggle = (enabled) => setDrawingEnabled(
      typeof enabled === 'boolean' ? enabled : (p) => !p
    );
    const check = setInterval(() => {
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api) {
        api.toggleDrawing = toggle;
        api.isDrawingEnabled = () => drawingEnabledRef.current;
        clearInterval(check);
      }
    }, 200);
    return () => {
      clearInterval(check);
      const api = typeof window !== 'undefined' && window.__ELAB_API;
      if (api) { delete api.toggleDrawing; delete api.isDrawingEnabled; }
    };
  }, []); // stable -- registered once, cleaned up on unmount only

  // ─── Onboarding: welcome card per primo accesso ───
  const WELCOME_KEY = 'elab-sim-welcomed';
  const [showWelcome, setShowWelcome] = useState(() => {
    try { return !localStorage.getItem(WELCOME_KEY); } catch { return true; }
  });
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try { localStorage.setItem(WELCOME_KEY, '1'); } catch {}
  }, []);

  // Progressive disclosure: milestone tracking per uso futuro
  const _disclosureHook = __useDisclosureLevel();
  const recordMilestone = _disclosureHook.recordMilestone;

  useEffect(() => {
    try { localStorage.setItem('elab-sidebar-pref', showSidebar ? '1' : '0'); } catch {}
  }, [showSidebar]);

  // S101: Swipe gesture detection for panel navigation
  const canvasContainerRef = useRef(null);
  const editorPanelRef = useRef(null);
  const sidebarRef = useRef(null);
  const bottomPanelRef = useRef(null);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    let swipeStart = null;
    const SWIPE_MIN_DIST = 50, SWIPE_MAX_TIME = 400, EDGE_ZONE = 40;
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) { swipeStart = null; return; }
      swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    };
    const onTouchEnd = (e) => {
      if (!swipeStart || e.changedTouches.length < 1) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - swipeStart.x, dy = touch.clientY - swipeStart.y, dt = Date.now() - swipeStart.time;
      if (dt > SWIPE_MAX_TIME || Math.abs(dx) < SWIPE_MIN_DIST || Math.abs(dy) > Math.abs(dx)) { swipeStart = null; return; }
      const rect = el.getBoundingClientRect();
      if (dx < 0 && rect.right - swipeStart.x < EDGE_ZONE) {
        if (currentExperiment?.simulationMode === 'avr' && currentExperiment?.id?.startsWith('v3-') && !showCodeEditor) setShowCodeEditor(true);
      }
      swipeStart = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [currentExperiment, showCodeEditor]);

  useEffect(() => {
    const el = editorPanelRef.current;
    if (!el || !showCodeEditor) return;
    let swipeStart = null;
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) { swipeStart = null; return; }
      const rect = el.getBoundingClientRect();
      if (e.touches[0].clientX - rect.left > 40) { swipeStart = null; return; }
      swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    };
    const onTouchEnd = (e) => {
      if (!swipeStart || e.changedTouches.length < 1) return;
      const dx = e.changedTouches[0].clientX - swipeStart.x, dy = e.changedTouches[0].clientY - swipeStart.y;
      if (Date.now() - swipeStart.time > 400 || dx < 50 || Math.abs(dy) > Math.abs(dx)) { swipeStart = null; return; }
      setShowCodeEditor(false); swipeStart = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [showCodeEditor]);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || !showSidebar) return;
    let swipeStart = null;
    const onTouchStart = (e) => { if (e.touches.length !== 1) { swipeStart = null; return; } swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }; };
    const onTouchEnd = (e) => {
      if (!swipeStart || e.changedTouches.length < 1) return;
      const dy = e.changedTouches[0].clientY - swipeStart.y, dx = e.changedTouches[0].clientX - swipeStart.x;
      if (Date.now() - swipeStart.time > 400 || dy < 60 || Math.abs(dx) > Math.abs(dy)) { swipeStart = null; return; }
      if (window.innerWidth <= 1365) setShowSidebar(false); swipeStart = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [showSidebar]);

  useEffect(() => {
    const el = bottomPanelRef.current;
    if (!el || showBottomPanel) return;
    let swipeStart = null;
    const onTouchStart = (e) => { if (e.touches.length !== 1) { swipeStart = null; return; } swipeStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }; };
    const onTouchEnd = (e) => {
      if (!swipeStart || e.changedTouches.length < 1) return;
      const dy = e.changedTouches[0].clientY - swipeStart.y, dx = e.changedTouches[0].clientX - swipeStart.x;
      if (Date.now() - swipeStart.time > 400 || dy > -30 || Math.abs(dx) > Math.abs(dy)) { swipeStart = null; return; }
      setShowBottomPanel(true); swipeStart = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [showBottomPanel]);

  // Helper: tracked setTimeout (auto-cleanup on unmount)
  const trackedTimeout = useCallback((fn, delay) => {
    const id = setTimeout(() => { statusTimersRef.current = statusTimersRef.current.filter(t => t !== id); fn(); }, delay);
    statusTimersRef.current.push(id);
    return id;
  }, []);
  useEffect(() => { return () => { statusTimersRef.current.forEach(id => clearTimeout(id)); statusTimersRef.current = []; }; }, []);

  useEffect(() => { if (!wireMode) wireStartRef.current = null; }, [wireMode]);

  // ─── Component manipulation state ───
  const [customLayout, setCustomLayout] = useState({});
  const [customConnections, setCustomConnections] = useState([]);
  const [customComponents, setCustomComponents] = useState([]);
  const [customPinAssignments, setCustomPinAssignments] = useState({});
  const [selectedWireIndex, setSelectedWireIndex] = useState(-1);
  const [connectionOverrides, setConnectionOverrides] = useState({});

  // ─── BUILD MODE ───
  const [buildStepIndex, setBuildStepIndex] = useState(-1);
  const [showNotes, setShowNotes] = useState(false);
  // G22: Volume from parent activeVolume prop (1/2/3), inventor → 3 for max components, fallback 1
  const selectedVolume = typeof activeVolume === 'number' ? activeVolume : (activeVolume === 'inventor' ? 3 : 1);

  const buildStepSoundRef = useRef(null);
  const handleBuildStepChange = useCallback((newIndex) => {
    const prevIndex = buildStepIndex;
    setBuildStepIndex(newIndex);
    if (newIndex > prevIndex && newIndex >= 0) {
      try {
        if (!buildStepSoundRef.current) buildStepSoundRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = buildStepSoundRef.current;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
      } catch {}
    }
    const hwLen = currentExperiment?.buildSteps?.length || 0;
    const sSteps = currentExperiment?.scratchSteps;
    if (sSteps && newIndex >= hwLen) {
      const scratchStep = sSteps[newIndex - hwLen];
      if (scratchStep?.xml) { setScratchXml(scratchStep.xml); setShowCodeEditor(true); }
    } else if (sSteps && newIndex < hwLen && prevIndex >= hwLen) { setShowCodeEditor(false); }
  }, [buildStepIndex, currentExperiment]);

  const buildStepHighlightIds = useMemo(() => {
    if (!currentExperiment?.buildMode || buildStepIndex < 0) return [];
    const steps = currentExperiment.buildSteps || [];
    if (buildStepIndex >= steps.length) return [];
    const step = steps[buildStepIndex];
    return step.componentId ? [step.componentId] : [];
  }, [currentExperiment, buildStepIndex]);

  useEffect(() => {
    if (!currentExperiment?.buildMode || currentExperiment.buildMode !== 'guided') return;
    if (buildStepIndex < 0) return;
    const steps = currentExperiment.buildSteps || [];
    let latestScratchXml = null;
    for (let i = Math.min(buildStepIndex, steps.length - 1); i >= 0; i--) {
      if (i < steps.length && steps[i].scratchXml) { latestScratchXml = steps[i].scratchXml; break; }
    }
    if (latestScratchXml) setScratchXml(latestScratchXml);
  }, [currentExperiment, buildStepIndex]);

  const mergedHighlightedComponents = useMemo(
    () => [...asArray(highlightedComponents), ...asArray(apiHighlightedComponents), ...buildStepHighlightIds],
    [highlightedComponents, apiHighlightedComponents, asArray, buildStepHighlightIds]
  );
  const mergedHighlightedPins = useMemo(
    () => [...asArray(highlightedPins), ...asArray(apiHighlightedPins)],
    [highlightedPins, apiHighlightedPins, asArray]
  );

  // ─── Undo/Redo ───
  const { pushSnapshot, undo: undoHistory, redo: redoHistory, resetHistory, canUndo, canRedo } = useUndoRedo();
  const getCurrentSnapshot = useCallback(() => {
    const deepClone = (obj) => typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
    return { layout: deepClone(customLayout), connections: deepClone(customConnections), components: deepClone(customComponents), pinAssignments: deepClone(customPinAssignments), connectionOverrides: deepClone(connectionOverrides) };
  }, [customLayout, customConnections, customComponents, customPinAssignments, connectionOverrides]);

  const restoreSnapshotRef = useRef(null);
  const getCurrentSnapshotRef = useRef(getCurrentSnapshot);
  const pushSnapshotRef = useRef(pushSnapshot);
  getCurrentSnapshotRef.current = getCurrentSnapshot;
  pushSnapshotRef.current = pushSnapshot;

  // ─── Save/Load (localStorage) ───
  const storageRestoreState = useCallback((snapshot) => {
    if (!snapshot) return;
    setCustomLayout(snapshot.layout || {}); setCustomConnections(snapshot.connections || []); setCustomComponents(snapshot.components || []);
    setCustomPinAssignments(snapshot.pinAssignments || {}); setConnectionOverrides(snapshot.connectionOverrides || {});
  }, []);
  const { loadFromStorage, clearSaved, exportJSON, importJSON } = useCircuitStorage(currentExperiment?.id || null, getCurrentSnapshot, storageRestoreState);

  // ─── Code editor state ───
  const [editorCode, setEditorCode] = useState('');
  const codeNeedsCompileRef = useRef(false);
  const [compilationStatus, setCompilationStatus] = useState(null);
  const [compilationErrors, setCompilationErrors] = useState(null);
  const [compilationWarnings, setCompilationWarnings] = useState(null);
  const [compilationErrorLine, setCompilationErrorLine] = useState(null);
  const [compilationSize, setCompilationSize] = useState(null);

  // ─── Compile Only (solo verifica) ───
  const handleCompileOnly = useCallback(async () => {
    const codeToCompile = editorModeRef.current === 'scratch' ? scratchGeneratedCodeRef.current : editorCodeRef.current;
    if (!codeToCompile || compilingRef.current) return;
    compilingRef.current = true;
    recordMilestone('compiledCode');
    setCompilationStatus('compiling'); setCompilationErrors(null); setCompilationWarnings(null); setCompilationErrorLine(null); setCompilationSize(null);
    try {
      const result = await apiCompileCode(codeToCompile);
      recordEvent('code_compiled', { success: !!result.success, errorCount: result.errors ? (typeof result.errors === 'string' ? result.errors.split('\n').filter(Boolean).length : 0) : 0 });
      if (result.success) {
        setCompilationStatus('success'); codeNeedsCompileRef.current = false;
        const FLASH_TOTAL = 32256;
        const hexBytes = result.size || Math.floor((result.hex || '').replace(/[^0-9a-fA-F]/g, '').length / 2);
        setCompilationSize({ bytes: hexBytes, total: FLASH_TOTAL, percent: Math.round((hexBytes / FLASH_TOTAL) * 100) });
        if (result.output) {
          const warnLines = result.output.split('\n').filter(l => /warning:/i.test(l));
          if (warnLines.length > 0) setCompilationWarnings(translateCompilationErrors(warnLines.join('\n')));
        }
        trackedTimeout(() => { setCompilationStatus(null); setCompilationWarnings(null); }, 5000);
        try { studentTracker.logCompilation(true); } catch { }
      } else {
        setCompilationStatus('error');
        const fullText = result.errors || 'Errore di compilazione sconosciuto';
        const lines = fullText.split('\n'); const errorLines = [], warnLines = [];
        for (const line of lines) { if (/warning:/i.test(line)) warnLines.push(line); else errorLines.push(line); }
        const rawErrors = errorLines.join('\n').trim() || fullText;
        setCompilationErrors(translateCompilationErrors(rawErrors));
        try { studentTracker.logCompilation(false, rawErrors.slice(0, 100)); } catch { }
        if (warnLines.length > 0) setCompilationWarnings(translateCompilationErrors(warnLines.join('\n')));
        try { sendAnalyticsEvent(EVENTS.ERROR, { type: 'compilation_failed', errors: rawErrors.slice(0, 200) }); } catch { }
        const lineMatch = fullText.match(/\.ino:(\d+):\d+:.*error/);
        if (lineMatch) setCompilationErrorLine(parseInt(lineMatch[1]));
      }
    } catch (err) {
      logger.error('[ELAB] Compilation error:', err);
      setCompilationStatus('error');
      setCompilationErrors('Non riesco a compilare il codice. Controlla la connessione internet e riprova!');
      try { sendAnalyticsEvent(EVENTS.ERROR, { type: 'compilation', message: err.message }); } catch { }
    } finally { compilingRef.current = false; }
  }, [trackedTimeout]);

  // ─── Code Persistence ───
  const EDITOR_STORAGE_KEY = 'elab_editor_code';
  const autoSaveTimeoutRef = useRef(null);
  useEffect(() => {
    if (!currentExperiment?.id || !editorCode) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      try { localStorage.setItem(`${EDITOR_STORAGE_KEY}-${currentExperiment.id}`, editorCode); } catch (e) { logger.warn('[ELAB] localStorage save failed:', e); }
    }, 5000);
    return () => { if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current); };
  }, [editorCode, currentExperiment?.id]);

  const loadSavedCode = useCallback((experimentId) => {
    if (!experimentId) return null;
    try { return localStorage.getItem(`${EDITOR_STORAGE_KEY}-${experimentId}`); } catch { return null; }
  }, []);
  const clearSavedCode = useCallback((experimentId) => {
    if (!experimentId) return;
    try { localStorage.removeItem(`${EDITOR_STORAGE_KEY}-${experimentId}`); } catch {}
  }, []);

  // ─── Overlay/Panel state ───
  const [potOverlay, setPotOverlay] = useState(null);
  const [ldrOverlay, setLdrOverlay] = useState(null);
  const [propsPanel, setPropsPanel] = useState(null);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const { recordEvent, recordSnapshot, getTimeline } = useSessionRecorder();
  const [showGuide, setShowGuide] = useState(true);
  const [showBom, setShowBom] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLessonPath, setShowLessonPath] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [pdfReady, setPdfReady] = useState(null);
  const codeContentRef = useRef(null);
  const compilationResultRef = useRef(null);
  useEffect(() => { codeContentRef.current = editorCode; }, [editorCode]);
  useEffect(() => { compilationResultRef.current = compilationStatus; }, [compilationStatus]);
  const compilationDetailsRef = useRef({ status: 'idle', errors: null, warnings: null, size: null });
  useEffect(() => { compilationDetailsRef.current = { status: compilationStatus, errors: compilationErrors, warnings: compilationWarnings, size: compilationSize }; }, [compilationStatus, compilationErrors, compilationWarnings, compilationSize]);
  const serialOutputRef = useRef('');
  useEffect(() => { serialOutputRef.current = serialOutput; }, [serialOutput]);
  const selectedComponentIdRef = useRef(null);
  useEffect(() => { selectedComponentIdRef.current = selectedComponentId; }, [selectedComponentId]);

  const toggleRightPanel = useCallback((panel) => {
    if (panel === 'bom') setShowBom(prev => { if (!prev) { setShowNotes(false); setShowQuiz(false); setShowLessonPath(false); } return !prev; });
    else if (panel === 'notes') setShowNotes(prev => { if (!prev) { setShowBom(false); setShowQuiz(false); setShowLessonPath(false); } return !prev; });
    else if (panel === 'quiz') setShowQuiz(prev => { if (!prev) { setShowBom(false); setShowNotes(false); setShowLessonPath(false); } return !prev; });
    else if (panel === 'lessonPath') setShowLessonPath(prev => { if (!prev) { setShowBom(false); setShowNotes(false); setShowQuiz(false); } return !prev; });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const expId = e.detail?.experimentId;
      if (currentExperiment?.quiz?.length > 0 && (!expId || expId === currentExperiment.id)) { setShowQuiz(true); setShowBom(false); setShowNotes(false); }
    };
    window.addEventListener('unlim-quiz', handler);
    return () => window.removeEventListener('unlim-quiz', handler);
  }, [currentExperiment]);

  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [exportToast, setExportToast] = useState(false);
  const [wireToast, setWireToast] = useState(null);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const [isAskingUNLIM, setIsAskingUNLIM] = useState(false);
  const [unlimResponse, setUnlimResponse] = useState(null);
  const [circuitWarning, setCircuitWarning] = useState(null);
  const [circuitStatus, setCircuitStatus] = useState({ status: 'idle', warnings: [], errors: [] });
  const circuitStatusRef = useRef({ status: 'idle', warnings: [], errors: [] });
  const buildStepIndexRef = useRef(0);
  const canUndoRef = useRef(false);
  const canRedoRef = useRef(false);
  useEffect(() => { circuitStatusRef.current = circuitStatus; }, [circuitStatus]);
  useEffect(() => { buildStepIndexRef.current = buildStepIndex; }, [buildStepIndex]);
  useEffect(() => { canUndoRef.current = canUndo; }, [canUndo]);
  useEffect(() => { canRedoRef.current = canRedo; }, [canRedo]);

  const userKitsRef = useRef(userKits);
  useEffect(() => { userKitsRef.current = userKits; }, [userKits]);

  // ─── Callback refs for public API ───
  const handleSelectExperimentRef = useRef(null);
  const handlePlayRef = useRef(null);
  const handlePauseRef = useRef(null);
  const handleResetRef = useRef(null);
  const handleCompileRef = useRef(null);
  const handleComponentClickRef = useRef(null);
  const handleConnectionAddRef = useRef(null);
  const handleWireDeleteRef = useRef(null);
  const handleComponentAddRef = useRef(null);
  const handleComponentDeleteRef = useRef(null);
  const handlePropChangeRef = useRef(null);
  const handleLayoutChangeRef = useRef(null);
  const handleBuildModeSwitchRef = useRef(null);
  const avrLoadingRef = useRef(false);
  const onCodeSelectRef = useRef(onCodeSelect);
  const onOpenSimulatorRef = useRef(onOpenSimulator);
  const onExperimentChangeRef = useRef(onExperimentChange);
  onCodeSelectRef.current = onCodeSelect;
  onOpenSimulatorRef.current = onOpenSimulator;
  onExperimentChangeRef.current = onExperimentChange;

  // ═══════════════════════════════════════════════════════════════
  // EXTRACTED HOOKS
  // ═══════════════════════════════════════════════════════════════

  const { mergedExperiment, breadboardActiveHoles, enrichedComponentStates } = useMergedExperiment({
    currentExperiment, customComponents, customConnections, customLayout, customPinAssignments, connectionOverrides, buildStepIndex, componentStates,
  });

  // ─── Re-solve helper ───
  const reSolve = useCallback(() => {
    if (!mergedExperiment) return;
    if (mergedExperiment.simulationMode === 'avr') { pinMapRef.current = buildPinComponentMap(mergedExperiment); }
    else if (solverRef.current) { solverRef.current.loadExperiment(mergedExperiment, { preserveState: true }); setComponentStates(solverRef.current.getState()); }
  }, [mergedExperiment]);

  useEffect(() => {
    if (!mergedExperiment) return;
    if (mergedExperiment.simulationMode === 'avr') { pinMapRef.current = buildPinComponentMap(mergedExperiment); return; }
    if (!solverRef.current) return;
    solverRef.current.loadExperiment(mergedExperiment, { preserveState: true });
    if (isRunning) setComponentStates(solverRef.current.getState());
  }, [mergedExperiment, isRunning]);

  // ─── Undo/Redo: restoreSnapshot + keyboard shortcuts ───
  const restoreSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    setCustomLayout(snapshot.layout); setCustomConnections(snapshot.connections); setCustomComponents(snapshot.components); setCustomPinAssignments(snapshot.pinAssignments);
  }, []);
  restoreSnapshotRef.current = restoreSnapshot;

  const handleUndoBtn = useCallback(() => {
    const snapshot = undoHistory(getCurrentSnapshot());
    if (snapshot) { restoreSnapshotRef.current(snapshot); pushActivity('undo'); recordMilestone('usedUndo'); }
  }, [undoHistory, getCurrentSnapshot, recordMilestone]);
  const handleRedoBtn = useCallback(() => {
    const snapshot = redoHistory(getCurrentSnapshot());
    if (snapshot) { restoreSnapshotRef.current(snapshot); pushActivity('redo'); }
  }, [redoHistory, getCurrentSnapshot]);

  // Refs for state sync
  const currentExperimentRef = useRef(currentExperiment);
  const componentStatesRef = useRef(componentStates);
  const editorCodeRef = useRef(editorCode);
  useEffect(() => { currentExperimentRef.current = currentExperiment; }, [currentExperiment]);
  useEffect(() => { mergedExperimentRef.current = mergedExperiment; }, [mergedExperiment]);
  useEffect(() => { componentStatesRef.current = componentStates; }, [componentStates]);
  useEffect(() => { editorCodeRef.current = editorCode; }, [editorCode]);
  const scratchGeneratedCodeRef = useRef(scratchGeneratedCode);
  useEffect(() => { scratchGeneratedCodeRef.current = scratchGeneratedCode; }, [scratchGeneratedCode]);
  const editorModeRef = useRef(editorMode);
  useEffect(() => { editorModeRef.current = editorMode; }, [editorMode]);
  const showCodeEditorRef = useRef(showCodeEditor);
  useEffect(() => { showCodeEditorRef.current = showCodeEditor; }, [showCodeEditor]);

  // ─── Keyboard shortcuts ───
  const selectedComponentRef = useRef(null);
  const selectedWireIndexRef = useRef(-1);
  const [selectedComponent, setSelectedComponent] = useState(null);
  useEffect(() => { selectedComponentRef.current = selectedComponent; }, [selectedComponent]);
  useEffect(() => { selectedWireIndexRef.current = selectedWireIndex; }, [selectedWireIndex]);

  useEffect(() => {
    const handleUndoRedoKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.target.closest && e.target.closest('.cm-editor')) return;
      const isMac = ((typeof navigator !== 'undefined' && navigator.platform) || '').toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); const s = undoHistory(getCurrentSnapshot()); if (s) restoreSnapshotRef.current(s); }
      else if ((mod && e.key === 'y') || (mod && e.key === 'z' && e.shiftKey)) { e.preventDefault(); const s = redoHistory(getCurrentSnapshot()); if (s) restoreSnapshotRef.current(s); }
      else if (e.key === ' ' && !mod) { e.preventDefault(); if (isRunningRef.current) { handlePauseRef.current?.(); } else { handlePlayRef.current?.(); } }
      else if (e.key === 'Escape') { if (scratchFullscreen) { setScratchFullscreen(false); return; } setWireMode(false); setSelectedComponent(null); setSelectedWireIndex(-1); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { if (selectedComponentRef.current) { e.preventDefault(); handleComponentDeleteRef.current?.(selectedComponentRef.current); } else if (selectedWireIndexRef.current >= 0) { e.preventDefault(); handleWireDeleteRef.current?.(selectedWireIndexRef.current); } }
      else if (mod && e.key === '/') { e.preventDefault(); setShowShortcuts(prev => !prev); }
      else if (mod && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); if (currentExperiment?.simulationMode === 'avr' && handleCompileOnly) handleCompileOnly(); }
    };
    window.addEventListener('keydown', handleUndoRedoKey);
    return () => window.removeEventListener('keydown', handleUndoRedoKey);
  }, [undoHistory, redoHistory, getCurrentSnapshot, currentExperiment, handleCompileOnly]);

  // ─── Initialize CircuitSolver ───
  useEffect(() => {
    solverRef.current = new CircuitSolver();
    let cycleWarnings = [], cycleErrors = [];
    solverRef.current.onStateChange = (state) => {
      setComponentStates(state); timeRef.current = solverRef.current.time; setSimulationTime(solverRef.current.time);
      if (cycleErrors.length > 0) setCircuitStatus({ status: 'error', warnings: cycleWarnings, errors: cycleErrors });
      else if (cycleWarnings.length > 0) setCircuitStatus({ status: 'warning', warnings: cycleWarnings, errors: [] });
      else setCircuitStatus(prev => prev.status === 'idle' ? prev : { status: 'ok', warnings: [], errors: [] });
      cycleWarnings = []; cycleErrors = [];
    };
    solverRef.current.onWarning = (type, message) => {
      setCircuitWarning(prev => (prev && prev.type === type && prev.message === message) ? prev : { type, message });
      if (type !== 'short-circuit') trackedTimeout(() => setCircuitWarning(null), 5000);
      if (type === 'short-circuit') { if (!cycleErrors.includes(message)) cycleErrors.push(message); if (handlePauseRef.current) handlePauseRef.current(); }
      else { if (!cycleWarnings.includes(message)) cycleWarnings.push(message); }
    };
    return () => { if (solverRef.current) solverRef.current.destroy(); if (avrRef.current) avrRef.current.destroy(); if (avrPollRef.current) clearInterval(avrPollRef.current); };
  }, []);

  // ─── Experiment Loader Hook ───
  const { handleSelectExperiment, startAVRPolling, avrTxLenRef } = useExperimentLoader({
    solverRef, avrRef, avrPollRef, pinMapRef, loadedExpIdRef, avrSetupLockRef, avrLoadingRef, isRunningRef, userKitsRef, codeNeedsCompileRef,
    editorCodeRef, editorModeRef, scratchGeneratedCodeRef, currentExperimentRef, mergedExperimentRef, onCodeSelectRef, onOpenSimulatorRef, onExperimentChangeRef,
    setCurrentExperiment, setComponentStates, setIsRunning, setSimulationTime, setSerialOutput, setAvrReady,
    setCustomLayout, setCustomConnections, setCustomComponents, setCustomPinAssignments, setConnectionOverrides,
    setPotOverlay, setLdrOverlay, setEditorCode, setEditorMode, setScratchXml, setScratchGeneratedCode,
    setShowCodeEditor, setShowSidebar, setShowGuide, setShowBom, setShowQuiz, setShowLessonPath, setShowNotes, setShowBottomPanel,
    setBuildStepIndex, setSelectedVolume: () => {/* G22: volume controlled by parent activeVolume prop */}, setAnnotations, setSelectedAnnotation,
    setCompilationStatus, setCompilationErrors, setCompilationWarnings, setCompilationErrorLine, setCompilationSize, setCircuitStatus,
    resetHistory, loadFromStorage, loadSavedCode, trackedTimeout, recordEvent,
    mergedExperiment, componentStates, currentExperiment, isRunning,
  });

  // ─── Pause handler (needed by circuit handlers) ───
  const handlePause = useCallback(() => {
    if (avrRef.current) avrRef.current.pause();
    if (solverRef.current) solverRef.current.pause();
    setComponentStates(prev => ({ ...prev, _avrRunning: false, _txActive: false, _rxActive: false }));
    if (avrPollRef.current) { clearInterval(avrPollRef.current); avrPollRef.current = null; }
    setIsRunning(false);
    pushActivity('pause');
    setSimulationAnnouncement('Simulazione in pausa');
    recordEvent('simulation_stopped');
    try { sendAnalyticsEvent(EVENTS.SIMULATION_PAUSED); } catch { }
    try { emitSimulatorEvent('stateChange', { state: 'paused' }); } catch { }
  }, []);

  // ─── Circuit Handlers Hook ───
  const handlers = useCircuitHandlers({
    currentExperiment, mergedExperiment, componentStates, buildStepIndex,
    solverRef, avrRef, avrPollRef, pinMapRef, loadedExpIdRef, avrSetupLockRef, avrLoadingRef, compilingRef, codeNeedsCompileRef,
    editorCodeRef, editorModeRef, scratchGeneratedCodeRef, isRunningRef, handleCompileRef, handlePauseRef, canvasContainerRef, avrTxLenRef,
    pushSnapshot, getCurrentSnapshot,
    setCurrentExperiment, setComponentStates, setIsRunning, setSimulationTime, setSerialOutput, setAvrReady,
    setCustomLayout, setCustomConnections, setCustomComponents, setCustomPinAssignments, setConnectionOverrides,
    setPotOverlay, setLdrOverlay, setPropsPanel, setEditorCode, setEditorMode, setScratchXml, setScratchGeneratedCode,
    setShowCodeEditor, setShowSidebar, setShowBottomPanel, setShowPalette, setBuildStepIndex,
    setAnnotations, setSelectedAnnotation, setSelectedWireIndex, setWireMode,
    setCompilationStatus, setCompilationErrors, setCompilationWarnings, setCompilationErrorLine, setCompilationSize,
    setExportToast, setShowBom, setShowQuiz, setSimulationAnnouncement, setPdfReady, setIsGeneratingReport,
    setIsAskingUNLIM, setUnlimResponse,
    compilationStatus, isAskingUNLIM, isGeneratingReport, potOverlay, ldrOverlay, pdfReady,
    customConnections, customComponents, connectionOverrides,
    startAVRPolling, handlePause, clearSaved, clearSavedCode, trackedTimeout, recordEvent, recordMilestone, getTimeline,
    messagesRef, quizResultsRef, sessionStartRef, codeContentRef, compilationResultRef,
    onExperimentChangeRef,
  });

  const {
    handlePlay, handleReset, handleBuildModeSwitch, handleBack, handleComponentClick,
    handlePotValueChange, handleLdrValueChange, handlePropChange, handleComponentValueChange,
    handleSerialInput, handleAskUNLIM, handleLayoutChange, handleConnectionAdd, handleWireUpdate,
    handleWireClick, handleWireDelete, handleComponentAdd, handleComponentDelete,
    handleResetExperiment, handleCompile, handleCanvasDragOver, handleExportPng,
    handleQuizComplete, handleGenerateReport, handleDownloadPdf,
    handleAnnotationAdd, handleAnnotationTextChange, handleAnnotationDelete,
    handleAnnotationSelect, handleAnnotationPositionChange,
  } = handlers;

  // ─── Keep callback refs in sync ───
  useEffect(() => { handleSelectExperimentRef.current = handleSelectExperiment; }, [handleSelectExperiment]);
  useEffect(() => { handlePlayRef.current = handlePlay; }, [handlePlay]);
  useEffect(() => { handlePauseRef.current = handlePause; }, [handlePause]);
  useEffect(() => { handleResetRef.current = handleReset; }, [handleReset]);
  useEffect(() => { handleComponentClickRef.current = handleComponentClick; }, [handleComponentClick]);
  useEffect(() => { handleCompileRef.current = handleCompile; }, [handleCompile]);
  useEffect(() => { handleConnectionAddRef.current = handleConnectionAdd; }, [handleConnectionAdd]);
  useEffect(() => { handleWireDeleteRef.current = handleWireDelete; }, [handleWireDelete]);
  useEffect(() => { handleComponentAddRef.current = handleComponentAdd; }, [handleComponentAdd]);
  useEffect(() => { handleComponentDeleteRef.current = handleComponentDelete; }, [handleComponentDelete]);
  useEffect(() => { handlePropChangeRef.current = handlePropChange; }, [handlePropChange]);
  useEffect(() => { handleLayoutChangeRef.current = handleLayoutChange; }, [handleLayoutChange]);
  useEffect(() => { handleBuildModeSwitchRef.current = handleBuildModeSwitch; }, [handleBuildModeSwitch]);

  // ─── Simulator API Hook ───
  useSimulatorAPI({
    currentExperimentRef, mergedExperimentRef, componentStatesRef, editorCodeRef, editorModeRef, scratchGeneratedCodeRef, showCodeEditorRef,
    circuitStatusRef, buildStepIndexRef, canUndoRef, canRedoRef, selectedComponentIdRef, serialOutputRef, compilationDetailsRef, isRunningRef,
    solverRef, avrRef, pinMapRef,
    handleSelectExperimentRef, handlePlayRef, handlePauseRef, handleResetRef, handleCompileRef, handleComponentClickRef,
    handleConnectionAddRef, handleWireDeleteRef, handleComponentAddRef, handleComponentDeleteRef, handleLayoutChangeRef, handleBuildModeSwitchRef, handlePropChangeRef,
    getCurrentSnapshotRef, pushSnapshotRef, undoHistory, redoHistory, getCurrentSnapshot, restoreSnapshotRef,
    setApiHighlightedComponents, setApiHighlightedPins, setEditorCode, setEditorMode, setScratchXml, setScratchFullscreen,
    setShowCodeEditor, setShowBom, setShowLessonPath, setShowNotes, setShowQuiz, setBottomPanel, setShowBottomPanel, setBuildStepIndex,
    setCustomComponents, setCustomConnections, setCustomLayout, setCustomPinAssignments, setConnectionOverrides,
    codeNeedsCompileRef,
    onCircuitStateChange, onCircuitEvent, mergedExperiment, currentExperiment, componentStates, buildStepIndex,
    setWireMode, wireMode,
  });

  // ─── Load initial experiment ───
  useEffect(() => {
    if (initialExperimentId) { const exp = findExperimentById(initialExperimentId); if (exp) handleSelectExperiment(exp); onInitialExperimentConsumed?.(); }
  }, [initialExperimentId]);

  // Principio Zero: auto-show LessonPath on EVERY new experiment load
  // The lesson path is the teacher's primary guide — always show it first
  useEffect(() => {
    if (currentExperiment) {
      setShowLessonPath(true);
    }
  }, [currentExperiment?.id]);

  // ─── Derived flags ───
  const isAvrMode = currentExperiment?.simulationMode === 'avr';
  const leftPanelMode = showPalette ? 'palette' : 'picker';
  // Principio Zero: progressive disclosure — Vol1/Vol2 nascondono codice/serial
  const isVol3 = currentExperiment?.id?.startsWith('v3-') ?? false;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="elab-simulator" style={{ position: 'relative', borderTop: currentExperiment ? `3px solid var(--color-vol${selectedVolume}, var(--color-primary))` : 'none', transition: 'border-color 300ms ease' }}>
      {/* ──── TOP: MinimalControlBar (G12 RESPIRA) ──── */}
      <div className={lyStyles.controlBarRow}>
        <MinimalControlBar
          minimalMode={true}
          onTabChange={onTabChange}
          experiment={currentExperiment}
          isRunning={isRunning}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onBack={handleBack}
          simulationTime={simulationTime}
          showPalette={showPalette}
          onTogglePalette={currentExperiment ? () => { setShowPalette(prev => !prev); recordMilestone('usedPalette'); } : undefined}
          showCodeEditor={showCodeEditor}
          onToggleCodeEditor={currentExperiment && isVol3 ? () => { setShowCodeEditor(prev => !prev); recordMilestone('usedCodeEditor'); } : undefined}
          wireMode={wireMode}
          onToggleWireMode={currentExperiment ? () => setWireMode(prev => !prev) : undefined}
          onAskUNLIM={currentExperiment ? handleAskUNLIM : undefined}
          isAskingUNLIM={isAskingUNLIM}
          onDiagnoseCircuit={currentExperiment ? onDiagnoseCircuit : undefined}
          onGetHints={currentExperiment ? onGetHints : undefined}
          experimentName={currentExperiment?.title || ''}
          isArduinoExperiment={currentExperiment?.simulationMode === 'avr'}
          onResetExperiment={currentExperiment ? handleResetExperiment : undefined}
          onExportJSON={currentExperiment ? exportJSON : undefined}
          onImportJSON={currentExperiment ? importJSON : undefined}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndoBtn}
          onRedo={handleRedoBtn}
          showBom={showBom}
          onToggleBom={currentExperiment ? () => toggleRightPanel('bom') : undefined}
          showLessonPath={showLessonPath}
          onToggleLessonPath={currentExperiment ? () => toggleRightPanel('lessonPath') : undefined}
          onExportPng={currentExperiment ? handleExportPng : undefined}
          onToggleShortcuts={() => setShowShortcuts(prev => !prev)}
          showSidebar={showSidebar}
          onToggleSidebar={() => setShowSidebar(prev => !prev)}
          onCompile={isVol3 && currentExperiment?.simulationMode === 'avr' ? handleCompileOnly : undefined}
          compileStatus={compilationStatus}
          circuitStatus={circuitStatus}
          showBottomPanel={showBottomPanel}
          onToggleBottomPanel={isVol3 && currentExperiment?.simulationMode === 'avr' ? () => setShowBottomPanel(prev => !prev) : undefined}
          onAddAnnotation={currentExperiment ? handleAnnotationAdd : undefined}
          showWhiteboard={showWhiteboard}
          onToggleWhiteboard={currentExperiment ? () => setShowWhiteboard(prev => !prev) : undefined}
          showDrawingOverlay={drawingEnabled}
          onToggleDrawingOverlay={currentExperiment ? () => setDrawingEnabled(prev => !prev) : undefined}

          showNotes={showNotes}
          onToggleNotes={currentExperiment ? () => toggleRightPanel('notes') : undefined}
          showQuiz={showQuiz}
          onToggleQuiz={currentExperiment ? () => toggleRightPanel('quiz') : undefined}
          hasQuiz={!!(currentExperiment?.quiz?.length)}
          onGenerateReport={currentExperiment ? handleGenerateReport : undefined}
          isGeneratingReport={isGeneratingReport}
          onOpenFumetto={currentExperiment ? () => openReportWindow(currentExperiment.id) : undefined}
          selectedComponentId={selectedComponentId}
          onComponentDelete={currentExperiment ? handleComponentDelete : undefined}
          onComponentRotate={currentExperiment ? (compId) => {
            const pos = mergedExperiment?.layout?.[compId] || { x: 0, y: 0, rotation: 0 };
            handleLayoutChange(compId, { ...pos, rotation: ((pos.rotation || 0) + 90) % 360 });
          } : undefined}
          onShowProperties={currentExperiment ? (compId) => { handleComponentClick(compId); } : undefined}
          onShowWelcome={() => setShowWelcome(true)}
        />
      </div>

      {/* PDF Ready Toast */}
      {pdfReady && (
        <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-primary, var(--elab-navy))', color: 'var(--color-text-inverse, #fff)', padding: '10px 18px', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.25)', fontFamily: "var(--font-sans)", fontSize: 14 }}>
          <span>Report PDF pronto!</span>
          <button onClick={handleDownloadPdf} aria-label="Scarica report PDF" style={{ background: 'var(--color-accent, var(--elab-lime))', color: 'var(--color-text-inverse, #fff)', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Scarica</button>
          <button onClick={() => { if (pdfReady.url) URL.revokeObjectURL(pdfReady.url); setPdfReady(null); }} style={{ background: 'transparent', color: '#fff9', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '2px 6px' }} aria-label="Chiudi">✕</button>
        </div>
      )}

      {/* BUILD MODE SWITCHER */}
      {currentExperiment && currentExperiment.buildSteps && currentExperiment.buildSteps.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '8px 16px', background: 'var(--color-bg-secondary, #F7F8FA)', borderBottom: '1px solid var(--color-border, #E5E5E5)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 3, background: 'var(--color-bg-tertiary, #ECECF0)', borderRadius: 12, padding: 4 }}>
            {[
              { key: 'complete', label: 'Già Montato', Icon: WrenchIcon, color: 'var(--color-primary, var(--elab-navy))', title: 'Circuito già pronto — osserva e sperimenta' },
              { key: 'guided', label: 'Passo Passo', Icon: FootstepsIcon, color: 'var(--color-accent, var(--elab-lime))', title: 'Costruisci il circuito un pezzo alla volta' },
              { key: 'sandbox', label: 'Libero', Icon: PaletteIcon, color: 'var(--color-primary, var(--elab-navy))', title: 'Breadboard libera — sperimenta come vuoi' },
            ].map(m => {
              const isActive = (m.key === 'complete' && !currentExperiment.buildMode) || currentExperiment.buildMode === m.key;
              const Icon = m.Icon;
              return (<button key={m.key} onClick={() => handleBuildModeSwitch(m.key)} title={m.title} aria-label={m.title} aria-pressed={isActive} style={{ border: 'none', borderRadius: 'var(--radius-md, 10px)', padding: '8px 24px', fontSize: 15, fontWeight: isActive ? 700 : 500, fontFamily: "var(--font-sans)", background: isActive ? m.color : 'transparent', color: isActive ? 'var(--color-text-inverse, #fff)' : 'var(--color-text-secondary, #6B6B80)', cursor: 'pointer', transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: 8, minHeight: 'var(--touch-min, 56px)', boxShadow: isActive ? 'var(--shadow-md, 0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03))' : 'none', letterSpacing: isActive ? '0.3px' : '0', transform: isActive ? 'scale(1.02)' : 'scale(1)' }}><Icon size={18} />{m.label}</button>);
            })}
          </div>
        </div>
      )}

      {/* ──── MAIN LAYOUT ──── */}
      <div className="elab-simulator__layout">
        {/* LEFT SIDEBAR — hide palette in guided mode (Passo Passo manages components) */}
        {showSidebar && (
          <div ref={sidebarRef} className="elab-simulator__sidebar">
            {leftPanelMode === 'palette' && currentExperiment && (currentExperiment.buildMode !== 'guided') && (
              <ComponentPalette wireMode={wireMode} onWireModeToggle={() => setWireMode(prev => !prev)} volumeFilter={selectedVolume} experimentComponents={currentExperiment?.components ? [...new Set(currentExperiment.components.map(c => c.type))] : null} style={{ height: '100%', border: 'none', borderRadius: 0 }} />
            )}
            <div style={{ display: leftPanelMode === 'palette' && currentExperiment && currentExperiment.buildMode !== 'guided' ? 'none' : 'block', height: '100%' }}>
              <ExperimentPicker onSelectExperiment={(exp) => { handleSelectExperiment(exp); if (window.innerWidth <= 1365) setShowSidebar(false); }} currentExperimentId={currentExperiment?.id} userKits={volumeUserKits} />
            </div>
          </div>
        )}

        {/* CENTER: Canvas */}
        <div className="elab-simulator__main">
          <RotateDeviceOverlay />
          {currentExperiment ? (
            <>
              <div ref={canvasContainerRef} style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }} onDragOver={handleCanvasDragOver}>
                <SimulatorCanvas
                  experiment={mergedExperiment} componentStates={enrichedComponentStates}
                  highlightedComponents={mergedHighlightedComponents} highlightedPins={mergedHighlightedPins}
                  onComponentClick={handleComponentClick} onComponentValueChange={handleComponentValueChange}
                  onPinClick={wireMode ? (pinRef) => { if (!wireStartRef.current) { wireStartRef.current = pinRef; } else { if (pinRef !== wireStartRef.current) handleConnectionAdd(wireStartRef.current, pinRef); wireStartRef.current = null; } } : undefined}
                  onConnectionAdd={handleConnectionAdd} onLayoutChange={handleLayoutChange}
                  onComponentAdd={handleComponentAdd} onComponentDelete={handleComponentDelete}
                  selectedWireIndex={selectedWireIndex} onWireClick={handleWireClick} onWireDelete={handleWireDelete} onWireUpdate={handleWireUpdate}
                  wireMode={wireMode} onWireModeChange={(val) => setWireMode(typeof val === 'boolean' ? val : !wireMode)}
                  onProbeConnectionChange={(conns) => { probeConnectionsRef.current = conns; if (solverRef.current && mergedExperiment) { solverRef.current.setProbeConnections(conns); solverRef.current.solve(); setComponentStates(prev => ({ ...prev, ...solverRef.current.getState() })); } }}
                  annotations={annotations} selectedAnnotation={selectedAnnotation}
                  onAnnotationSelect={handleAnnotationSelect} onAnnotationTextChange={handleAnnotationTextChange}
                  onAnnotationDelete={handleAnnotationDelete} onAnnotationPositionChange={handleAnnotationPositionChange}
                  onSendToUNLIM={onSendToUNLIM}
                  buildValidation={currentExperiment?.buildMode === 'guided' ? { currentStep: buildStepIndex, buildSteps: currentExperiment?.buildSteps || [] } : null}
                  onBuildValidationResult={(result) => { if (result.valid) handleBuildStepChange(result.stepIndex + 1); }}
                  snapToGrid={currentExperiment?.buildMode === 'sandbox'} onSelectionChange={setSelectedComponentId}
                  className="elab-simulator__canvas" style={{ flex: 1 }}
                />
                <WhiteboardOverlay active={showWhiteboard} experimentId={currentExperiment?.id} onClose={() => setShowWhiteboard(false)} onSendToUNLIM={onSendImageToUNLIM ? (dataUrl) => { setShowWhiteboard(false); onSendImageToUNLIM(dataUrl, 'Analizza questo disegno dalla lavagna e dimmi cosa rappresenta. Se è uno schema elettrico, controlla se è corretto.'); } : undefined} />
                <DrawingOverlay drawingEnabled={drawingEnabled} canvasWidth={canvasContainerRef.current?.offsetWidth || 800} canvasHeight={canvasContainerRef.current?.offsetHeight || 600} onPathsChange={() => {}} initialFullscreen={!!hideLessonPath} onClose={() => setDrawingEnabled(false)} experimentId={currentExperiment?.id || null} syncEnabled={enableDrawingSync} />
                <div className="sr-only" role="status" aria-live="assertive" aria-atomic="true">{simulationAnnouncement}</div>
                {circuitWarning && (<div role="alert" aria-live="assertive" style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-vol3, var(--elab-red))', color: 'var(--color-text, #1A1A2E)', padding: '8px 20px', borderRadius: 8, fontFamily: "var(--font-display, 'Oswald', sans-serif)", fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 16px rgba(229,75,61,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, animation: 'pulse 0.6s ease-in-out infinite alternate' }}><span style={{ fontSize: 20 }}>{'!'}</span><span>{circuitWarning.message}</span></div>)}
                {showGuide && currentExperiment && (!currentExperiment.buildMode || currentExperiment.buildMode === 'sandbox') && (<ExperimentGuide experiment={currentExperiment} buildMode={currentExperiment.buildMode || 'complete'} onClose={() => setShowGuide(false)} onSendToUNLIM={onSendToUNLIM} />)}
                {showBom && currentExperiment && (<BomPanel experiment={mergedExperiment} onClose={() => setShowBom(false)} />)}
                {!hideLessonPath && showLessonPath && currentExperiment && (<LessonPathPanel experiment={currentExperiment} allExperiments={ALL_EXPERIMENTS} onClose={() => setShowLessonPath(false)} onSendToUNLIM={onSendToUNLIM} onLoadExperiment={(id) => { const exp = findExperimentById(id); if (exp) handleSelectExperiment(exp); }} />)}
                {showQuiz && currentExperiment?.quiz?.length > 0 && (<QuizPanel experiment={currentExperiment} onClose={() => setShowQuiz(false)} onSendToUNLIM={onSendToUNLIM} onQuizComplete={handleQuizComplete} />)}
                {exportToast && (<div role="status" aria-live="polite" style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-accent, var(--elab-lime))', color: 'var(--color-text-inverse, #fff)', padding: '8px 20px', borderRadius: 8, fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, boxShadow: '0 4px 12px rgba(124,179,66,0.35)', zIndex: 100, pointerEvents: 'none' }}>Foto salvata!</div>)}
                {wireToast && (<div role="status" aria-live="polite" style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-vol2, var(--elab-orange))', color: 'var(--color-text, #1A1A2E)', padding: '8px 20px', borderRadius: 8, fontFamily: "var(--font-display, 'Oswald', sans-serif)", fontSize: 16, fontWeight: 700, boxShadow: '0 4px 12px rgba(232,148,28,0.35)', zIndex: 100, pointerEvents: 'none' }}>{wireToast}</div>)}
                {wireMode && (<div className={lyStyles.wireModeIndicator} role="status" aria-live="polite"><span style={{ fontSize: 14 }}>&#x1F50C;</span><span>Collegamento fili attivo</span>{wireStartRef.current && (<span style={{ color: 'var(--color-vol2-text, #996600)' }}>Da: {wireStartRef.current} — clicca il pin destinazione</span>)}</div>)}
                {currentExperiment && currentExperiment.buildMode === 'guided' && !hideComponentDrawer && (
                  <ComponentDrawer mode={currentExperiment.buildMode} experiment={currentExperiment} currentStep={buildStepIndex} onStepChange={handleBuildStepChange} volumeNumber={selectedVolume}
                    onStartScratchPhase={(chosenMode) => { setShowCodeEditor(true); setEditorMode(chosenMode || 'scratch'); }}
                    onCompileAndPlay={() => { if (handleCompileOnly) handleCompileOnly(); }}
                  />
                )}
                <NotesPanel experimentId={currentExperiment?.id} visible={showNotes} onClose={() => setShowNotes(false)} />
              </div>

              {/* BOTTOM PANEL: Serial Monitor / Plotter — solo Vol3 (disclosure >= 2) */}
              {isAvrMode && isVol3 && (
                <div ref={bottomPanelRef} className="elab-simulator__bottom-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'max-height 200ms ease', maxHeight: showBottomPanel ? 'min(350px, 45dvh)' : 40, flexShrink: 0 }}>
                  {!showBottomPanel && (<button onClick={() => setShowBottomPanel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, minHeight: 44, background: 'var(--color-code-header, #181825)', border: 'none', borderTop: '1px solid var(--color-code-border, #313244)', cursor: 'pointer', width: '100%', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: 'var(--color-text-gray-300, #737373)' }} title="Apri Monitor Seriale"><span style={{ fontSize: 14 }}>{'\u25B2'}</span><span>Monitor Seriale</span>{isRunning && (<span style={{ width: 8, height: 8, borderRadius: '50%', background: LIME, boxShadow: '0 0 6px rgba(124,179,66,0.5)', flexShrink: 0 }} />)}</button>)}
                  {showBottomPanel && (<>
                    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-editor-border, #2D3748)', flexShrink: 0 }}>
                      <button onClick={() => setBottomPanel('monitor')} style={{ flex: 1, padding: '4px 8px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, background: bottomPanel === 'monitor' ? 'var(--color-editor-active-bg, #1E2530)' : 'var(--color-editor-bg, #161B22)', color: bottomPanel === 'monitor' ? LIME : 'var(--color-text-gray-400, #666)', borderBottom: bottomPanel === 'monitor' ? `2px solid ${LIME}` : '2px solid transparent', minHeight: 36 }}>Monitor</button>
                      <button onClick={() => setBottomPanel('plotter')} style={{ flex: 1, padding: '4px 8px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, background: bottomPanel === 'plotter' ? 'var(--color-editor-active-bg, #1E2530)' : 'var(--color-editor-bg, #161B22)', color: bottomPanel === 'plotter' ? 'var(--color-tab-plotter, #3498DB)' : 'var(--color-text-gray-400, #666)', borderBottom: bottomPanel === 'plotter' ? '2px solid var(--color-tab-plotter, #3498DB)' : '2px solid transparent', minHeight: 36 }}>Plotter</button>
                      <button onClick={() => setShowBottomPanel(false)} title="Chiudi pannello (Monitor/Plotter)" aria-label="Chiudi pannello seriale" style={{ padding: '4px 10px', border: 'none', cursor: 'pointer', background: 'var(--color-editor-bg, #161B22)', color: 'var(--color-text-gray-300, #737373)', fontSize: 16, borderBottom: '2px solid transparent', minHeight: 36, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 150ms, background 150ms' }} onPointerEnter={e => { e.currentTarget.style.color = 'var(--elab-red)'; e.currentTarget.style.background = 'rgba(229,75,61,0.1)'; }} onPointerLeave={e => { e.currentTarget.style.color = '#737373'; e.currentTarget.style.background = 'var(--color-editor-bg, #161B22)'; }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4L12 12M4 12L12 4"/></svg></button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
                      {bottomPanel === 'monitor' ? (<SerialMonitor serialOutput={serialOutput} onSerialInput={handleSerialInput} onClear={() => setSerialOutput('')} isRunning={isRunning} onBaudRateChange={(baud) => { setSerialBaudRate(baud); if (avrRef.current) { const sketchBaud = avrRef.current.getConfiguredBaudRate(); setBaudMismatch(sketchBaud !== null && sketchBaud !== baud); } }} baudMismatch={baudMismatch} showTimestamps={serialTimestamps} onToggleTimestamps={() => setSerialTimestamps(prev => !prev)} onSendToUNLIM={onSendToUNLIM} />) : (<SerialPlotter serialOutput={serialOutput} isRunning={isRunning} onClear={() => setSerialOutput('')} />)}
                    </div>
                  </>)}
                </div>
              )}
            </>
          ) : (
            <div className="elab-simulator__placeholder">
              {showWelcome ? (
                <div className="sim-welcome">
                  <div className="sim-welcome__header">
                    <span className="sim-welcome__icon">&#x26A1;</span>
                    <h2 className="sim-welcome__title">Benvenuto nel Simulatore!</h2>
                    <p className="sim-welcome__subtitle">Iniziare è facilissimo. Segui questi 3 passi:</p>
                  </div>
                  <div className="sim-welcome__steps">
                    <button className="sim-welcome__step" onClick={() => { if (!showSidebar) setShowSidebar(true); }}>
                      <span className="sim-welcome__step-num">1</span>
                      <span className="sim-welcome__step-icon">&#x1F4D6;</span>
                      <span className="sim-welcome__step-text">
                        <strong>Scegli un esperimento</strong>
                        <span>Dalla lista a sinistra, tocca un esperimento</span>
                      </span>
                    </button>
                    <button className="sim-welcome__step" onClick={() => { if (!showSidebar) setShowSidebar(true); }}>
                      <span className="sim-welcome__step-num">2</span>
                      <span className="sim-welcome__step-icon">&#x1F50D;</span>
                      <span className="sim-welcome__step-text">
                        <strong>Guarda il circuito</strong>
                        <span>Qui al centro apparirà il circuito da esplorare</span>
                      </span>
                    </button>
                    <button className="sim-welcome__step" disabled style={{ opacity: 0.7 }}>
                      <span className="sim-welcome__step-num">3</span>
                      <span className="sim-welcome__step-icon">&#x1F916;</span>
                      <span className="sim-welcome__step-text">
                        <strong>Chiedi aiuto a UNLIM</strong>
                        <span>Il bottone in alto a destra spiega tutto</span>
                      </span>
                    </button>
                  </div>
                  <button className="sim-welcome__dismiss" onClick={dismissWelcome}>Ho capito, iniziamo!</button>
                </div>
              ) : (
                <>
                  <span className="elab-simulator__placeholder-icon">&#x26A1;</span>
                  <span className="elab-simulator__placeholder-text">ELAB Simulator</span>
                  <span style={{ fontSize: 14, color: 'var(--color-text-gray-100, #AAA)' }}>Seleziona un esperimento dalla sidebar</span>
                  {!showSidebar && (<button onClick={() => setShowSidebar(true)} style={{ marginTop: 12, padding: '6px 16px', border: `1px solid ${LIME}`, borderRadius: 6, background: 'transparent', color: LIME, cursor: 'pointer', fontFamily: FONT_BODY, fontSize: 14 }}>Mostra Esperimenti</button>)}
                </>
              )}
            </div>
          )}

          {!showCodeEditor && currentExperiment && currentExperiment.simulationMode === 'avr' && isVol3 && (
            <button onClick={() => setShowCodeEditor(true)} aria-label="Apri editor codice" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 30, width: 24, height: 64, border: 'none', borderRadius: '6px 0 0 6px', background: 'var(--color-primary, var(--elab-navy))', color: 'var(--color-text-inverse, #fff)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', fontSize: 14, padding: 0, transition: 'opacity var(--transition-base)' }} title="Apri Editor">‹</button>
          )}
        </div>

        {/* RIGHT PANEL: Code Editor */}
        {showCodeEditor && currentExperiment && (
          <div ref={editorPanelRef} className={`${lyStyles.codeEditorPanel} ${editorMode === 'scratch' ? (scratchFullscreen ? lyStyles.codeEditorPanelScratchFullscreen : lyStyles.codeEditorPanelScratch) : ''}`}>
            <div role="tablist" aria-label="Editor codice" style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-blockly-grid, #2a3040)', background: 'var(--color-editor-bg, #161B22)', flexShrink: 0 }}>
              <button onClick={() => setShowCodeEditor(false)} aria-label="Chiudi editor" title="Chiudi editor (torna al circuito)" style={{ width: 44, minHeight: 44, border: 'none', cursor: 'pointer', padding: 0, background: 'var(--color-editor-bg, #161B22)', color: 'var(--color-text-gray-400, #666)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'color 150ms, background 150ms' }} onPointerEnter={e => { e.currentTarget.style.color = 'var(--elab-red)'; e.currentTarget.style.background = 'rgba(229,75,61,0.1)'; }} onPointerLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.background = 'var(--color-editor-bg, #161B22)'; }}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4L12 12M4 12L12 4"/></svg></button>
              <button onClick={() => { if (editorMode !== 'arduino') { setModeSwitchNotice('arduino'); setTimeout(() => setModeSwitchNotice(null), 4000); } setEditorMode('arduino'); setScratchFullscreen(false); }} style={{ flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer', minHeight: 44, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, background: editorMode === 'arduino' ? 'var(--color-editor-active-bg, #1E2530)' : 'var(--color-editor-bg, #161B22)', color: editorMode === 'arduino' ? 'var(--color-accent, var(--elab-lime))' : 'var(--color-text-gray-400, #666)', borderBottom: editorMode === 'arduino' ? '2px solid var(--color-accent, var(--elab-lime))' : '2px solid transparent' }}>{'</>  Arduino C++'}</button>
              {currentExperiment?.simulationMode === 'avr' && isVol3 && (<button onClick={() => { if (editorMode !== 'scratch') { setModeSwitchNotice('scratch'); setTimeout(() => setModeSwitchNotice(null), 4000); } setEditorMode('scratch'); }} style={{ flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer', minHeight: 44, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, background: editorMode === 'scratch' ? 'var(--color-editor-active-bg, #1E2530)' : 'var(--color-editor-bg, #161B22)', color: editorMode === 'scratch' ? 'var(--color-tab-scratch, #E67E22)' : 'var(--color-text-gray-400, #666)', borderBottom: editorMode === 'scratch' ? '2px solid var(--color-tab-scratch, #E67E22)' : '2px solid transparent' }}>{'Blocchi'}</button>)}
              {editorMode === 'scratch' && (<button onClick={() => setScratchFullscreen(f => !f)} title={scratchFullscreen ? 'Esci da schermo intero (Esc)' : 'Schermo intero'} aria-label={scratchFullscreen ? 'Esci da schermo intero' : 'Schermo intero'} style={{ padding: scratchFullscreen ? '7px 16px' : '7px 12px', border: 'none', cursor: 'pointer', minHeight: 44, minWidth: 56, fontFamily: "var(--font-sans)", fontSize: scratchFullscreen ? 14 : 18, fontWeight: scratchFullscreen ? 600 : 400, background: scratchFullscreen ? 'var(--color-tab-scratch, #E67E22)' : 'var(--color-editor-bg, #161B22)', color: scratchFullscreen ? '#fff' : 'var(--color-text-gray-400, #666)', borderLeft: scratchFullscreen ? 'none' : '1px solid var(--color-blockly-grid, #2a3040)', borderRadius: scratchFullscreen ? '6px' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>{scratchFullscreen ? (<><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 2h4v4M6 14H2v-4M14 2L9.5 6.5M2 14l4.5-4.5"/></svg>Esci</>) : (<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6V2h4M14 10v4h-4M2 2l4.5 4.5M14 14L9.5 9.5"/></svg>)}</button>)}
            </div>
            {modeSwitchNotice && (
              <div role="status" aria-live="polite" style={{ padding: '8px 16px', background: 'var(--color-vol2, var(--elab-orange))', color: 'var(--color-text, #1A1A2E)', fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500, textAlign: 'center', animation: 'sim-welcome-fade 0.3s ease' }}>
                {modeSwitchNotice === 'scratch'
                  ? 'Ora usi i blocchi. Le modifiche ai blocchi non cambiano il codice Arduino.'
                  : 'Ora scrivi codice. Le modifiche qui non cambiano i blocchi Scratch.'}
              </div>
            )}
            {scratchFullscreen && editorMode === 'scratch' && (<button onClick={() => setScratchFullscreen(false)} style={{ position: 'fixed', top: 16, right: 16, zIndex: 950, padding: '8px 18px', border: 'none', cursor: 'pointer', minHeight: 44, background: 'var(--color-tab-scratch, #E67E22)', color: '#fff', borderRadius: 10, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform 0.15s ease' }} onPointerEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'} aria-label="Esci da schermo intero"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 2h4v4M6 14H2v-4M14 2L9.5 6.5M2 14l4.5-4.5"/></svg>Esci da Schermo Intero</button>)}
            {editorMode === 'arduino' ? (
              <CodeEditorCM6 code={editorCode} onChange={(code) => { setEditorCode(code); codeNeedsCompileRef.current = true; if (compilationStatus === 'error') { setCompilationStatus(null); setCompilationErrors(null); setCompilationWarnings(null); setCompilationErrorLine(null); } }} onCompile={handleCompile} compilationStatus={compilationStatus} compilationErrors={compilationErrors} compilationWarnings={compilationWarnings} compilationErrorLine={compilationErrorLine} compilationSize={compilationSize} readOnly={false} onExplainCode={onSendToUNLIM ? (currentCode) => { const snippet = currentCode?.length > 800 ? currentCode.slice(0, 800) + '\n// ...(troncato)' : currentCode; onSendToUNLIM(`Spiegami questo codice Arduino riga per riga:\n\`\`\`\n${snippet || '(vuoto)'}\n\`\`\``); } : undefined} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <ScratchErrorBoundary>
                    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-accent, var(--elab-lime))', fontFamily: "var(--font-sans)", fontSize: 14, gap: 8, background: 'var(--color-editor-active-bg, #1E2530)' }}><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>...</span>Caricamento editor blocchi...</div>}>
                      <ScratchEditor initialCode={scratchXml} onChange={(xml, generatedCode) => { setScratchXml(xml); setScratchGeneratedCode(generatedCode); codeNeedsCompileRef.current = true; if (currentExperiment?.id) { localStorage.setItem(`elab_scratch_${currentExperiment.id}`, xml); if (generatedCode) localStorage.setItem(`elab_scratch_code_${currentExperiment.id}`, generatedCode); } }} />
                    </Suspense>
                  </ScratchErrorBoundary>
                </div>
                <ScratchCompileBar onCompile={() => handleCompile(scratchGeneratedCodeRef.current)} compilationStatus={compilationStatus} compilationErrors={compilationErrors} compilationWarnings={compilationWarnings} compilationSize={compilationSize} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      <GalileoResponsePanel response={unlimResponse} isAsking={isAskingUNLIM} onAskAgain={() => { setUnlimResponse(null); window.dispatchEvent(new CustomEvent('elab-open-unlim-input')); }} onClose={() => setUnlimResponse(null)} />
      {potOverlay && (<PotOverlay value={potOverlay.value} onValueChange={handlePotValueChange} onClose={() => setPotOverlay(null)} />)}
      {ldrOverlay && (<LdrOverlay value={ldrOverlay.value} onValueChange={handleLdrValueChange} onClose={() => setLdrOverlay(null)} />)}
      {propsPanel && (<PropertiesPanel comp={propsPanel} onValueChange={handlePropChange} onClose={() => setPropsPanel(null)} />)}
      {showShortcuts && (<ShortcutsPanel onClose={() => setShowShortcuts(false)} />)}
    </div>
  );
};

export default NewElabSimulator;
