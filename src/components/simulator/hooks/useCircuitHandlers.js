/**
 * useCircuitHandlers — All circuit manipulation handlers
 *
 * Handles: play, pause, reset, back, buildModeSwitch, componentClick,
 * pot/ldr/prop changes, layout, connections, wire CRUD, component CRUD,
 * compile, export, UNLIM, annotations, report, serial input
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 */
import { useCallback, useEffect, useRef } from 'react';
import { getAutoWireColor } from '../canvas/WireRenderer';
import { sendChat as apiSendChat } from '../../../services/api';
import { compileArduinoCode, getLastCompileSource } from '../../../services/compiler';
import { ensureScratchXml } from '../../../features/elabArduinoAst/generators/cppToArduinoBlocklyXml';
import { emitSimulatorEvent } from '../../../services/simulator-api';
import { pushActivity } from '../../../services/activityBuffer';
import { sessionMetrics } from '../../../services/sessionMetrics';
import { sendAnalyticsEvent, EVENTS } from '../api/AnalyticsWebhook';
import { translateCompilationErrors } from '../utils/errorTranslator';
import { buildLCDPinMapping, createOnPinChangeHandler } from '../utils/pinComponentMap';
import { computeAutoPinAssignment, generateComponentId } from '../utils/breadboardSnap';
import { findBestPositionInExperiment } from '../utils/autoPlacement';
import { getComponent } from '../components/registry';
import { exportCanvasPng } from '../utils/exportPng';
import { collectSessionData, captureCircuit, fetchAISummary } from '../../../services/sessionReportService';
import { generateSessionReportPDF } from '../../report/SessionReportPDF';
// compileCache now handled internally by compiler service
import logger from '../../../utils/logger';

/**
 * @param {object} params
 */
export default function useCircuitHandlers({
  // Experiments
  currentExperiment,
  mergedExperiment,
  componentStates,
  buildStepIndex,
  // Refs
  solverRef,
  avrRef,
  avrPollRef,
  pinMapRef,
  loadedExpIdRef,
  avrSetupLockRef,
  avrLoadingRef,
  compilingRef,
  codeNeedsCompileRef,
  editorCodeRef,
  editorModeRef,
  scratchGeneratedCodeRef,
  isRunningRef,
  handleCompileRef,
  handlePauseRef,
  canvasContainerRef,
  avrTxLenRef,
  // Undo
  pushSnapshot,
  getCurrentSnapshot,
  // State setters
  setCurrentExperiment,
  setComponentStates,
  setIsRunning,
  setSimulationTime,
  setSerialOutput,
  setAvrReady,
  setCustomLayout,
  setCustomConnections,
  setCustomComponents,
  setCustomPinAssignments,
  setConnectionOverrides,
  setPotOverlay,
  setLdrOverlay,
  setPropsPanel,
  setEditorCode,
  setEditorMode,
  setScratchXml,
  setScratchGeneratedCode,
  setShowCodeEditor,
  setShowSidebar,
  setShowBottomPanel,
  setShowPalette,
  setBuildStepIndex,
  setAnnotations,
  setSelectedAnnotation,
  setSelectedWireIndex,
  setWireMode,
  setCompilationStatus,
  setCompilationErrors,
  setCompilationWarnings,
  setCompilationErrorLine,
  setCompilationSize,
  setExportToast,
  setShowBom,
  setShowQuiz,
  setSimulationAnnouncement,
  setPdfReady,
  setIsGeneratingReport,
  setIsAskingUNLIM,
  setUnlimResponse,
  // Other
  compilationStatus,
  isAskingUNLIM,
  isGeneratingReport,
  potOverlay,
  ldrOverlay,
  pdfReady,
  customConnections,
  customComponents,
  connectionOverrides,
  startAVRPolling,
  handlePause: handlePauseFn,
  clearSaved,
  clearSavedCode,
  trackedTimeout,
  recordEvent,
  recordMilestone,
  getTimeline,
  // Session report refs
  messagesRef,
  quizResultsRef,
  sessionStartRef,
  codeContentRef,
  compilationResultRef,
  // Callback refs for public API sync
  onExperimentChangeRef,
}) {
  /* ─────────────────────────────────────────────────
     Play / Pause / Reset
     ───────────────────────────────────────────────── */
  const handlePlay = useCallback(async () => {
    if (!currentExperiment) return;
    if (compilingRef.current) return;
    if (compilationStatus === 'error') return;
    if (currentExperiment.simulationMode === 'avr' && codeNeedsCompileRef.current && handleCompileRef.current) {
      const codeToCompile = editorModeRef.current === 'scratch' ? scratchGeneratedCodeRef.current : editorCodeRef.current;
      await handleCompileRef.current(codeToCompile);
      if (codeNeedsCompileRef.current) return;
    }
    if (currentExperiment.simulationMode === 'avr' && avrRef.current) {
      avrRef.current.start();
      startAVRPolling();
    } else if (currentExperiment.simulationMode === 'avr' && !avrRef.current) {
      // no-op: AVR not loaded
    } else if (currentExperiment.simulationMode !== 'avr' && solverRef.current) {
      solverRef.current.start();
    }
    setIsRunning(true);
    pushActivity('play', currentExperiment?.id || '');
    setSimulationAnnouncement('Simulazione avviata');
    recordEvent('simulation_started');
    try { sendAnalyticsEvent(EVENTS.SIMULATION_STARTED, { experimentId: currentExperiment?.id, mode: currentExperiment?.simulationMode }); } catch { }
    try { emitSimulatorEvent('stateChange', { state: 'playing', experimentId: currentExperiment?.id }); } catch { }
  }, [currentExperiment, startAVRPolling, compilationStatus]);

  const handleReset = useCallback(() => {
    handlePauseFn();
    pushActivity('reset', currentExperiment?.id || '');
    setSimulationAnnouncement('Simulazione resettata');
    if (avrTxLenRef) avrTxLenRef.current = 0;
    if (currentExperiment) {
      clearSaved();
      clearSavedCode(currentExperiment.id);
      setCustomLayout({});
      setCustomConnections([]);
      setCustomComponents([]);
      setCustomPinAssignments({});
      setConnectionOverrides({});
      setPotOverlay(null);
      setLdrOverlay(null);
      setAnnotations([]);
      setSelectedAnnotation(null);
      setBuildStepIndex(
        currentExperiment.buildMode === 'guided' ? -1
          : currentExperiment.buildMode === 'sandbox' ? -1
            : Infinity
      );
      const originalCode = currentExperiment.code || '';
      setEditorCode(originalCode);
      codeNeedsCompileRef.current = false;
      setCompilationStatus(null);
      setCompilationErrors(null);
      setCompilationWarnings(null);
      setCompilationSize(null);
      setScratchXml(ensureScratchXml(currentExperiment));
      setScratchGeneratedCode('');
      if (currentExperiment.id) {
        localStorage.removeItem(`elab_scratch_${currentExperiment.id}`);
        localStorage.removeItem(`elab_scratch_code_${currentExperiment.id}`);
      }
      if (currentExperiment.simulationMode === 'avr' && avrRef.current) {
        avrRef.current.reset();
        setSerialOutput('');
        setComponentStates({ _pins: avrRef.current.getPinStates() });
      } else if (solverRef.current) {
        solverRef.current.loadExperiment(currentExperiment);
        setComponentStates(solverRef.current.getState());
        solverRef.current.start();
        setIsRunning(true);
      }
    }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    setSimulationTime(0);
    try { sendAnalyticsEvent(EVENTS.SIMULATION_RESET, { experimentId: currentExperiment?.id }); } catch { }
    try { emitSimulatorEvent('stateChange', { state: 'reset', experimentId: currentExperiment?.id }); } catch { }
  }, [currentExperiment, handlePauseFn, clearSaved, clearSavedCode]);

  /* ─────────────────────────────────────────────────
     Switch Build Mode
     ───────────────────────────────────────────────── */
  const handleBuildModeSwitch = useCallback((newMode) => {
    if (!currentExperiment) return;
    const effectiveMode = newMode === 'complete' ? false : newMode;
    if (currentExperiment.buildMode === effectiveMode) return;
    setCurrentExperiment(prev => ({ ...prev, buildMode: effectiveMode }));
    clearSaved();
    setCustomLayout({});
    setCustomConnections([]);
    setCustomComponents([]);
    setCustomPinAssignments({});
    setConnectionOverrides({});
    setWireMode(false);
    setSelectedWireIndex(-1);
    setBuildStepIndex(
      effectiveMode === 'guided' ? -1
        : effectiveMode === 'sandbox' ? -1
          : Infinity
    );
    if (solverRef.current && currentExperiment.simulationMode === 'circuit') {
      const refreshed = { ...currentExperiment, buildMode: effectiveMode };
      solverRef.current.loadExperiment(refreshed);
      setComponentStates(solverRef.current.getState());
      solverRef.current.start();
      setIsRunning(true);
    }
  }, [currentExperiment, clearSaved]);

  /* ─────────────────────────────────────────────────
     Back to experiment list
     ───────────────────────────────────────────────── */
  const handleBack = useCallback(() => {
    handlePauseFn();
    if (avrRef.current) { avrRef.current.destroy(); avrRef.current = null; }
    avrLoadingRef.current = false;
    avrSetupLockRef.current.inProgress = false;
    avrSetupLockRef.current.expId = null;
    loadedExpIdRef.current = null;
    setCurrentExperiment(null);
    if (onExperimentChangeRef.current) onExperimentChangeRef.current(null);
    setComponentStates({});
    setShowSidebar(true);
    setSerialOutput('');
    setAvrReady(false);
    pinMapRef.current = {};
    setCustomLayout({});
    setCustomConnections([]);
    setCustomComponents([]);
    setCustomPinAssignments({});
    setEditorCode('');
    setCompilationStatus(null);
    setPotOverlay(null);
    setLdrOverlay(null);
    setShowPalette(false);
    setShowCodeEditor(false);
    setWireMode(false);
    setShowBom(false);
    setShowQuiz(false);
    setAnnotations([]);
    setSelectedAnnotation(null);
  }, [handlePauseFn]);

  /* ─────────────────────────────────────────────────
     Component interaction (pot/LDR overlays, multimeter, etc.)
     ───────────────────────────────────────────────── */
  const handleComponentClick = useCallback((componentId, action) => {
    if (!mergedExperiment) return;
    const comp = mergedExperiment.components.find(c => c.id === componentId);
    if (!comp) return;

    try { sendAnalyticsEvent(EVENTS.COMPONENT_INTERACTED, { componentId, type: comp.type, action: action || 'click' }); } catch { }
    try { emitSimulatorEvent('componentInteract', { componentId, type: comp.type, action: action || 'click' }); } catch { }

    if (comp.type === 'push-button' && (action === 'press' || action === 'release')) {
      setComponentStates(prev => ({ ...prev, [componentId]: { ...prev[componentId], pressed: action === 'press' } }));
      if (mergedExperiment.simulationMode === 'circuit' && solverRef.current) {
        solverRef.current.interact(componentId, action);
      }
      if (mergedExperiment.simulationMode === 'avr' && avrRef.current) {
        const pinEntry = Object.entries(pinMapRef.current).find(
          ([, m]) => m.compId === componentId || m.directCompId === componentId
        );
        if (pinEntry) {
          const pin = parseInt(pinEntry[0]);
          avrRef.current.setInputPin(pin, action === 'press' ? 0 : 1);
        }
        if (solverRef.current) solverRef.current.interact(componentId, action);
      }
      return;
    }

    if (comp.type === 'potentiometer') {
      const currentValue = componentStates[componentId]?.position ?? 0.5;
      setPotOverlay({ componentId, value: currentValue });
      return;
    }

    if (comp.type === 'photo-resistor' || comp.type === 'phototransistor') {
      const currentValue = componentStates[componentId]?.lightLevel ?? 0.5;
      setLdrOverlay({ componentId, value: currentValue });
      return;
    }

    if (comp.type === 'multimeter' && action === 'cycle-mode') {
      const currentMode = componentStates[componentId]?.mode || 'voltage';
      const modes = ['voltage', 'resistance', 'current'];
      const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
      const nextMode = modes[nextIdx];
      setComponentStates(prev => ({ ...prev, [componentId]: { ...prev[componentId], mode: nextMode } }));
      if (solverRef.current) solverRef.current.interact(componentId, 'set-mode', nextMode);
      return;
    }

    const editableTypes = ['resistor', 'capacitor', 'led', 'battery9v'];
    if (editableTypes.includes(comp.type) && !action) {
      setPropsPanel({ id: componentId, type: comp.type, value: comp.value, color: comp.color });
      return;
    }

    if (solverRef.current) {
      switch (comp.type) {
        case 'push-button':
          solverRef.current.interact(componentId, 'press');
          setTimeout(() => solverRef.current.interact(componentId, 'release'), 200);
          break;
        case 'reed-switch':
          solverRef.current.interact(componentId, 'toggle');
          break;
        case 'mosfet-n':
          if (componentStates[componentId]?.gateTouched) {
            solverRef.current.interact(componentId, 'releaseGate');
          } else {
            solverRef.current.interact(componentId, 'touchGate');
          }
          break;
      }
    }
  }, [mergedExperiment, componentStates]);

  /* ─────────────────────────────────────────────────
     Pot / LDR / Properties value change
     ───────────────────────────────────────────────── */
  const handlePotValueChange = useCallback((newValue) => {
    if (!potOverlay) return;
    setPotOverlay(prev => prev ? { ...prev, value: newValue } : null);
    const cid = potOverlay.componentId;
    setComponentStates(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), position: newValue } }));
    if (solverRef.current && mergedExperiment?.simulationMode === 'circuit') {
      solverRef.current.interact(cid, 'setPosition', newValue);
    }
    if (mergedExperiment?.simulationMode === 'avr' && avrRef.current) {
      const pinEntry = Object.entries(pinMapRef.current).find(
        ([, m]) => m.compId === cid || m.directCompId === cid
      );
      if (pinEntry) {
        const pin = parseInt(pinEntry[0]);
        avrRef.current.setInputPin(pin, Math.round(newValue * 1023));
      }
    }
  }, [potOverlay, mergedExperiment]);

  const handleLdrValueChange = useCallback((newValue) => {
    if (!ldrOverlay) return;
    setLdrOverlay(prev => prev ? { ...prev, value: newValue } : null);
    const cid = ldrOverlay.componentId;
    setComponentStates(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), lightLevel: newValue } }));
    if (solverRef.current && mergedExperiment?.simulationMode === 'circuit') {
      solverRef.current.interact(cid, 'setLightLevel', newValue);
    }
    if (mergedExperiment?.simulationMode === 'avr' && avrRef.current) {
      const pinEntry = Object.entries(pinMapRef.current).find(
        ([, m]) => m.compId === cid || m.directCompId === cid
      );
      if (pinEntry) {
        const pin = parseInt(pinEntry[0]);
        avrRef.current.setInputPin(pin, Math.round(newValue * 1023));
      }
    }
  }, [ldrOverlay, mergedExperiment]);

  const handlePropChange = useCallback((compId, field, newValue) => {
    pushSnapshot(getCurrentSnapshot());
    // Andrea 23/05/2026: "voglio che le proprietà degli oggetti cambino senza la scritta unknown"
    // Quando creiamo entry per comp non in customComponents, recupera type da experiment OR mergedExperiment.
    const lookupType = (id) => {
      const exp = currentExperiment?.components?.find(c => c.id === id);
      if (exp?.type) return exp.type;
      const merged = mergedExperiment?.components?.find(c => c.id === id);
      return merged?.type || 'resistor'; // fallback resistor (most common editable)
    };
    setCustomComponents(prev => {
      const existing = prev.find(c => c.id === compId);
      if (existing) return prev.map(c => c.id === compId ? { ...c, [field]: newValue } : c);
      return [...prev, { id: compId, type: lookupType(compId), [field]: newValue }];
    });
    if (solverRef.current) {
      solverRef.current.interact(compId, field === 'value' ? 'setValue' : 'setColor', newValue);
    }
  }, [pushSnapshot, getCurrentSnapshot, currentExperiment, mergedExperiment]);

  const handleComponentValueChange = useCallback((componentId, newValue) => {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    setComponentStates(prev => ({ ...prev, [componentId]: { ...(prev[componentId] || {}), ...newValue } }));
    if (solverRef.current) {
      for (const [key, val] of Object.entries(newValue)) {
        solverRef.current.interact(componentId, `set${key.charAt(0).toUpperCase() + key.slice(1)}`, val);
      }
    }
  }, []);

  /* ─────────────────────────────────────────────────
     Serial input
     ───────────────────────────────────────────────── */
  const handleSerialInput = useCallback((text) => {
    if (avrRef.current) {
      avrRef.current.serialWrite(text);
      try { emitSimulatorEvent('serialOutput', { char: text, direction: 'input' }); } catch { }
    }
  }, []);

  /* ─────────────────────────────────────────────────
     Ask UNLIM
     ───────────────────────────────────────────────── */
  const handleAskUNLIM = useCallback(async () => {
    if (!mergedExperiment || isAskingUNLIM) return;
    setIsAskingUNLIM(true);
    setUnlimResponse({ text: 'UNLIM sta analizzando l\'esperimento... Potrebbe richiedere fino a 30 secondi.', timestamp: Date.now(), loading: true });

    try {
      const ledStates = (mergedExperiment.components || [])
        .filter(c => c.type === 'led' || c.type === 'rgb-led')
        .map(c => {
          const state = componentStates[c.id] || {};
          const isOn = state.brightness > 0 || state.glowing;
          return `${c.id}: ${isOn ? 'ACCESO' : 'spento'}`;
        }).join(', ');
      const buildModeText = !currentExperiment?.buildMode
        ? 'Già Montato (circuito completo)'
        : currentExperiment.buildMode === 'guided'
          ? `Passo Passo (step ${buildStepIndex + 1} di ${mergedExperiment.buildSteps?.length || '?'})`
          : 'Esplora Libero (canvas libero)';

      const unlimPrompt = mergedExperiment.unlimPrompt ||
        `Sei UNLIM, il tutor AI di ELAB. Lo studente sta guardando l'esperimento "${mergedExperiment.title}". ` +
        `Descrizione: ${mergedExperiment.desc || 'N/A'}. ` +
        `Concetti chiave: ${mergedExperiment.concept || 'N/A'}. ` +
        `Modalità: ${buildModeText}. ` +
        (ledStates ? `LED nel circuito: ${ledStates}. ` : '') +
        `Spiega in modo semplice e coinvolgente, usando analogie adatte a bambini di 8-12 anni. Rispondi in italiano.`;

      let imageBase64 = null;
      const svgEl = canvasContainerRef.current?.querySelector('svg');
      if (svgEl) {
        try {
          const svgData = new XMLSerializer().serializeToString(svgEl);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
          const maxDim = 600;
          const scale = Math.min(maxDim / (img.width || 800), maxDim / (img.height || 600), 1);
          canvas.width = Math.round((img.width || 800) * scale);
          canvas.height = Math.round((img.height || 600) * scale);
          ctx.fillStyle = '#fafaf7'; // palette
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          imageBase64 = canvas.toDataURL('image/png').split(',')[1];
          URL.revokeObjectURL(url);
        } catch (screenshotErr) {
          logger.warn('[ELAB] Screenshot capture failed:', screenshotErr.message);
        }
      }

      const images = imageBase64 ? [{ base64: imageBase64, mimeType: 'image/png' }] : [];
      const result = await apiSendChat(unlimPrompt, images);

      if (result.success) {
        setUnlimResponse({ text: result.response, timestamp: Date.now() });
      } else {
        const errorText = result.response || 'UNLIM non e disponibile al momento.';
        setUnlimResponse({ text: errorText + '\n\nPuoi comunque leggere la guida dell\'esperimento nel pannello a destra.', timestamp: Date.now() });
      }
    } catch (err) {
      logger.error('[ELAB] Ask UNLIM error:', err);
      const msg = err?.message?.includes('abort') || err?.message?.includes('timeout')
        ? 'UNLIM ci sta mettendo troppo. Il servizio potrebbe essere temporaneamente non disponibile.'
        : 'Errore di connessione con UNLIM.';
      setUnlimResponse({ text: msg + '\n\nPuoi comunque leggere la guida dell\'esperimento nel pannello a destra.', timestamp: Date.now() });
    } finally {
      setIsAskingUNLIM(false);
    }
  }, [mergedExperiment, isAskingUNLIM, componentStates, currentExperiment, buildStepIndex]);

  /* ═══════════════════════════════════════════════════════════════
     Layout change handler (drag-drop moves)
     ═══════════════════════════════════════════════════════════════ */
  const dragSnapshotPushedRef = useRef(false);
  useEffect(() => {
    const resetDragSnapshot = () => { dragSnapshotPushedRef.current = false; };
    window.addEventListener('mouseup', resetDragSnapshot);
    return () => window.removeEventListener('mouseup', resetDragSnapshot);
  }, []);

  const handleLayoutChange = useCallback((componentId, newPos, isFinal = true) => {
    if (!dragSnapshotPushedRef.current) {
      pushSnapshot(getCurrentSnapshot());
      dragSnapshotPushedRef.current = true;
      recordMilestone('draggedComponent');
    }

    const comp = mergedExperiment
      ? (mergedExperiment.components || []).find(c => c.id === componentId)
      : null;
    const containerTypes = ['breadboard-half', 'breadboard-full', 'nano-r4'];
    const noSnapTypes = [...containerTypes, 'battery9v', 'multimeter'];
    const isContainer = comp && containerTypes.includes(comp.type);

    if (isContainer && mergedExperiment) {
      // CASCADE MOVE: breadboard/nano drags its children
      const childIds = new Set();
      const registered = getComponent(comp.type);
      const dims = registered?.boardDimensions;
      const bbW = dims?.width || 256;
      const bbH = dims?.height || 165;

      for (const c of (mergedExperiment.components || [])) {
        if (c.id === componentId) continue;
        const cLayout = mergedExperiment.layout?.[c.id];
        if (!cLayout) continue;
        if (containerTypes.includes(c.type) && cLayout.parentId !== componentId) continue;
        if (cLayout.parentId === componentId) { childIds.add(c.id); continue; }
        const bbPos = mergedExperiment.layout?.[componentId] || { x: 0, y: 0 };
        const MARGIN = 15;
        if (cLayout.x >= bbPos.x - MARGIN && cLayout.x <= bbPos.x + bbW + MARGIN &&
          cLayout.y >= bbPos.y - MARGIN && cLayout.y <= bbPos.y + bbH + MARGIN) {
          childIds.add(c.id);
        }
      }

      const myLayout = mergedExperiment.layout?.[componentId];
      if (myLayout?.parentId) {
        const parentId = myLayout.parentId;
        childIds.add(parentId);
        for (const c of (mergedExperiment.components || [])) {
          if (c.id === componentId || childIds.has(c.id)) continue;
          const cL = mergedExperiment.layout?.[c.id];
          if (cL?.parentId === parentId) childIds.add(c.id);
        }
      }

      setCustomLayout(prev => {
        const basePos = currentExperiment?.layout?.[componentId] || { x: 0, y: 0 };
        const oldPos = prev[componentId]
          ? { x: prev[componentId].x ?? basePos.x, y: prev[componentId].y ?? basePos.y }
          : basePos;
        const dx = newPos.x - oldPos.x;
        const dy = newPos.y - oldPos.y;
        const posUpdate = { x: newPos.x, y: newPos.y };
        if (newPos.rotation !== undefined) posUpdate.rotation = newPos.rotation;
        const next = { ...prev, [componentId]: { ...prev[componentId], ...posUpdate } };
        if (dx !== 0 || dy !== 0) {
          for (const childId of childIds) {
            const baseChildPos = currentExperiment?.layout?.[childId] || { x: 0, y: 0 };
            const childX = prev[childId]?.x ?? baseChildPos.x;
            const childY = prev[childId]?.y ?? baseChildPos.y;
            next[childId] = {
              ...prev[childId],
              x: childX + dx,
              y: childY + dy,
              parentId: prev[childId]?.parentId ?? baseChildPos.parentId ?? componentId,
            };
          }
        }
        return next;
      });
    } else {
      setCustomLayout(prev => {
        const posUpdate = { x: newPos.x, y: newPos.y };
        if (newPos.rotation !== undefined) posUpdate.rotation = newPos.rotation;
        if (newPos.parentId !== undefined) posUpdate.parentId = newPos.parentId;
        return { ...prev, [componentId]: { ...prev[componentId], ...posUpdate } };
      });
    }

    if (!isFinal) {
      if (mergedExperiment && comp && !isContainer && !noSnapTypes.includes(comp.type)) {
        setCustomPinAssignments(prev => {
          const next = { ...prev };
          const prefix = `${componentId}:`;
          let changed = false;
          for (const key of Object.keys(next)) {
            if (key.startsWith(prefix)) { delete next[key]; changed = true; }
          }
          const basePins = currentExperiment?.pinAssignments || {};
          for (const key of Object.keys(basePins)) {
            if (key.startsWith(prefix)) { next[key] = null; changed = true; }
          }
          return changed ? next : prev;
        });
      }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    } else if (mergedExperiment && comp && !isContainer && !noSnapTypes.includes(comp.type)) {
      const originalPos = currentExperiment?.layout?.[componentId];
      const SNAP_BACK_THRESHOLD = 3;
      if (originalPos && Math.hypot(newPos.x - originalPos.x, newPos.y - originalPos.y) < SNAP_BACK_THRESHOLD) {
        setCustomLayout(prev => { const next = { ...prev }; delete next[componentId]; return next; });
        setCustomPinAssignments(prev => {
          const next = { ...prev };
          const prefix = `${componentId}:`;
          for (const key of Object.keys(next)) { if (key.startsWith(prefix)) delete next[key]; }
          return next;
        });
      } else {
        const breadboards = (mergedExperiment.components || []).filter(
          c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
        );
        let snapped = false;
        for (const bb of breadboards) {
          const bbPos = mergedExperiment.layout?.[bb.id] || { x: 0, y: 0 };
          const result = computeAutoPinAssignment(componentId, comp.type, newPos.x, newPos.y, bb.id, bbPos, bb.type);
          if (result) {
            setCustomLayout(prev => ({
              ...prev,
              [componentId]: { ...prev[componentId], x: result.componentX, y: result.componentY, parentId: bb.id }
            }));
            setCustomPinAssignments(prev => {
              const next = { ...prev };
              for (const key of Object.keys(next)) { if (key.startsWith(`${componentId}:`)) delete next[key]; }
              return { ...next, ...result.pinAssignments };
            });
            snapped = true;
            break;
          }
        }
        if (!snapped) {
          setCustomLayout(prev => {
            const entry = prev[componentId];
            if (entry?.parentId) {
              const next = { ...prev, [componentId]: { ...entry } };
              delete next[componentId].parentId;
              return next;
            }
            return prev;
          });
          setCustomPinAssignments(prev => {
            const next = { ...prev };
            for (const key of Object.keys(next)) { if (key.startsWith(`${componentId}:`)) next[key] = null; }
            const basePins = currentExperiment?.pinAssignments || {};
            for (const key of Object.keys(basePins)) { if (key.startsWith(`${componentId}:`)) next[key] = null; }
            return next;
          });
        }
      }
    }
  }, [mergedExperiment, currentExperiment, pushSnapshot, getCurrentSnapshot]);

  /* ═══════════════════════════════════════════════════════════════
     Connection / Wire handlers
     ═══════════════════════════════════════════════════════════════ */
  const handleConnectionAdd = useCallback((fromPinRef, toPinRef) => {
    pushSnapshot(getCurrentSnapshot());
    const color = getAutoWireColor(fromPinRef, toPinRef);
    const newConn = { from: fromPinRef, to: toPinRef, color, id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
    pushActivity('wire_added', `${fromPinRef}→${toPinRef}`);
    setCustomConnections(prev => [...prev, newConn]);
    recordMilestone('connectedWire');
    try { emitSimulatorEvent('circuitChange', { action: 'wireAdded', from: fromPinRef, to: toPinRef }); } catch { }
    return newConn.id;
  }, [pushSnapshot, getCurrentSnapshot, recordMilestone]);

  const handleWireUpdate = useCallback((wireIndex, newConnectionData) => {
    if (!mergedExperiment) return;
    const conn = mergedExperiment.connections[wireIndex];
    if (conn && conn.id) {
      setConnectionOverrides(prev => ({ ...prev, [conn.id]: newConnectionData }));
    }
  }, [mergedExperiment]);

  const handleWireClick = useCallback((wireIndex) => {
    setSelectedWireIndex(prev => {
      const isDeselect = prev === wireIndex;
      if (isDeselect) { setPropsPanel(null); return -1; }
      return wireIndex;
    });
    setPropsPanel(prevPanel => {
      if (prevPanel?.type === 'wire' && prevPanel.id === wireIndex) return null;
      return { id: wireIndex, type: 'wire', color: 'green' };
    });
  }, []);

  const handleWireDelete = useCallback((wireIndex) => {
    if (!mergedExperiment) return;
    const allConns = mergedExperiment.connections || [];
    const conn = allConns[wireIndex];
    if (!conn) return;
    pushActivity('wire_removed', `${conn.from}→${conn.to}`);
    const baseCount = (currentExperiment?.connections || []).length;
    let isCustom = false;
    let customIndex = customConnections.findIndex(c => c.id === conn.id);
    if (customIndex !== -1) { isCustom = true; }
    else { customIndex = wireIndex - baseCount; if (customIndex >= 0 && customIndex < customConnections.length) isCustom = true; }
    pushSnapshot(getCurrentSnapshot());
    if (isCustom) {
      const connId = conn.id;
      if (connId && connectionOverrides[connId]) {
        setConnectionOverrides(prev => { const next = { ...prev }; delete next[connId]; return next; });
      }
      setCustomConnections(prev => prev.filter((_, i) => i !== customIndex));
    } else {
      if (conn.id) setConnectionOverrides(prev => ({ ...prev, [conn.id]: { hidden: true } }));
    }
    setSelectedWireIndex(-1);
    try { emitSimulatorEvent('circuitChange', { action: 'wireRemoved', wireIndex }); } catch { }
  }, [mergedExperiment, currentExperiment, customConnections, connectionOverrides, pushSnapshot, getCurrentSnapshot]);

  /* ═══════════════════════════════════════════════════════════════
     Component add / delete
     ═══════════════════════════════════════════════════════════════ */
  const handleComponentAdd = useCallback((type, position) => {
    pushSnapshot(getCurrentSnapshot());
    const existingIds = new Set([
      ...(mergedExperiment?.components || []).map(c => c.id),
      ...(customComponents || []).map(c => c.id),
    ]);
    const id = generateComponentId(type, existingIds);
    const newComp = { id, type };
    if (type === 'resistor') newComp.value = 1000;
    if (type === 'led') newComp.color = 'red';
    if (type === 'capacitor') newComp.value = 100e-6;

    // Auto-placement: if no position given, find the best free slot on the breadboard
    const autoPos = (!position && mergedExperiment)
      ? findBestPositionInExperiment(type, mergedExperiment)
      : null;
    const dropX = position?.x ?? autoPos?.x ?? 200;
    const dropY = position?.y ?? autoPos?.y ?? 150;
    const noSnapTypes = ['breadboard-half', 'breadboard-full', 'battery9v', 'nano-r4', 'multimeter'];
    let finalX = dropX, finalY = dropY, newPinAssignments = {}, snappedBbId = null;

    if (!noSnapTypes.includes(type) && mergedExperiment) {
      const breadboards = (mergedExperiment.components || []).filter(
        c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
      );
      for (const bb of breadboards) {
        const bbPos = mergedExperiment.layout?.[bb.id] || { x: 0, y: 0 };
        const result = computeAutoPinAssignment(id, type, dropX, dropY, bb.id, bbPos, bb.type);
        if (result) {
          finalX = result.componentX; finalY = result.componentY;
          newPinAssignments = result.pinAssignments; snappedBbId = bb.id;
          break;
        }
      }
    }

    pushActivity('component_added', `${type} (${id})`);
    setCustomComponents(prev => [...prev, newComp]);
    setCustomLayout(prev => ({
      ...prev,
      [id]: { x: finalX, y: finalY, ...(snappedBbId ? { parentId: snappedBbId } : {}) },
    }));
    if (Object.keys(newPinAssignments).length > 0) {
      setCustomPinAssignments(prev => ({ ...prev, ...newPinAssignments }));
    }
    try { emitSimulatorEvent('circuitChange', { action: 'componentAdded', componentId: id, type }); } catch { }
    return id;
  }, [mergedExperiment, pushSnapshot, getCurrentSnapshot]);

  const handleComponentDelete = useCallback((componentId) => {
    pushSnapshot(getCurrentSnapshot());
    pushActivity('component_removed', componentId);
    const isUserAdded = customComponents.some(c => c.id === componentId);
    if (isUserAdded) setCustomComponents(prev => prev.filter(c => c.id !== componentId));
    if (!isUserAdded && currentExperiment) {
      setCustomLayout(prev => ({ ...prev, [componentId]: { ...(prev[componentId] || {}), hidden: true } }));
    }
    setCustomConnections(prev => prev.filter(conn => {
      const fromId = conn.from.split(':')[0];
      const toId = conn.to.split(':')[0];
      return fromId !== componentId && toId !== componentId;
    }));
    if (isUserAdded) {
      setCustomLayout(prev => { const next = { ...prev }; delete next[componentId]; return next; });
    }
    setCustomPinAssignments(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${componentId}:`) || next[key].startsWith(`${componentId}:`)) delete next[key];
      }
      return next;
    });
    setCustomLayout(prev => {
      let changed = false;
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key]?.parentId === componentId) { next[key] = { ...next[key] }; delete next[key].parentId; changed = true; }
      }
      return changed ? next : prev;
    });
  }, [customComponents, currentExperiment, pushSnapshot, getCurrentSnapshot]);

  /* ═══════════════════════════════════════════════════════════════
     Reset experiment to original state
     ═══════════════════════════════════════════════════════════════ */
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  const handleResetExperiment = useCallback(() => {
    if (!currentExperiment) return;
    pushSnapshot(getCurrentSnapshot());
    clearSaved();
    clearSavedCode(currentExperiment.id);
    localStorage.removeItem(`elab_scratch_${currentExperiment.id}`);
    localStorage.removeItem(`elab_scratch_code_${currentExperiment.id}`);
    setCustomLayout({});
    setCustomConnections([]);
    setCustomComponents([]);
    setCustomPinAssignments({});
    setScratchXml('');
    setScratchGeneratedCode('');
    setConnectionOverrides({});
    setPotOverlay(null);
    setLdrOverlay(null);
    setAnnotations([]);
    setSelectedAnnotation(null);
    setBuildStepIndex(
      currentExperiment.buildMode === 'guided' ? -1
        : currentExperiment.buildMode === 'sandbox' ? -1
          : Infinity
    );
    const originalCode = currentExperiment.code || '';
    setEditorCode(originalCode);
    codeNeedsCompileRef.current = false;
    setCompilationStatus(null);
    if (solverRef.current && currentExperiment.simulationMode === 'circuit') {
      solverRef.current.loadExperiment(currentExperiment);
      setComponentStates(solverRef.current.getState());
      solverRef.current.start();
      setIsRunning(true);
    }
  }, [currentExperiment, pushSnapshot, getCurrentSnapshot, clearSaved, clearSavedCode]);

  /* ═══════════════════════════════════════════════════════════════
     Arduino compilation handler (with cache)
     ═══════════════════════════════════════════════════════════════ */
  // iter 79.A A2 ROLLBACK (Codex Pattern C iter 79.A post-fix verify HIGH):
  // initial A2 fix forced NANO_R4_FQBN here, but the resulting HEX is loaded
  // into AVRBridge (line ~888-907) which only runs ATmega328p AVR firmware,
  // NOT Renesas RA4M1 ARM Cortex-M4. Hardcoded Nano R4 FQBN broke ALL
  // simulationMode==='avr' Vol3 experiments. Revert: leave board undefined
  // so api.js default AVR fires for the in-browser simulator path. The
  // PHYSICAL Nano R4 cross-compile path runs via CompileUploadButton →
  // local agent (iter 79.A A3 returns hexBase64), independent of this hook.
  const handleCompile = useCallback(async (code) => {
    if (compilingRef.current) {
      return { success: false, status: 'busy', errors: 'Compilazione gia in corso' };
    }
    compilingRef.current = true;
    let finalResult = null;

    setCompilationStatus('compiling');
    setCompilationErrors(null);
    setCompilationWarnings(null);
    setCompilationErrorLine(null);
    setCompilationSize(null);

    try {
      const experimentId = (mergedExperiment || currentExperiment)?.id;
      const result = await compileArduinoCode(code, { experimentId });

      if (result.success && result.hex) {
        const compileSource = getLastCompileSource();
        setCompilationStatus(compileSource === 'precompiled' ? 'success-local' : 'success');
        codeNeedsCompileRef.current = false;
        if (window.innerHeight > 820) setShowBottomPanel(true);

        const FLASH_TOTAL = 32256;
        const hexBytes = result.size || Math.floor(result.hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
        setCompilationSize({ bytes: hexBytes, total: FLASH_TOTAL, percent: Math.round((hexBytes / FLASH_TOTAL) * 100) });

        pushActivity('compile_success', `${hexBytes}/${FLASH_TOTAL}B (${result.source})`);
        sessionMetrics.trackCompilation(true);
        finalResult = {
          ...result,
          success: true,
          status: compileSource === 'precompiled' ? 'success-local' : 'success',
          size: result.size || hexBytes,
        };
        void (async () => {
          try {
            if (avrRef.current) {
              avrRef.current.pause();
              if (avrPollRef.current) { clearInterval(avrPollRef.current); avrPollRef.current = null; }
              setIsRunning(false);
              const loaded = await avrRef.current.loadHexFromString(result.hex);
              if (loaded) {
                setSerialOutput('');
                const lcdMapping = buildLCDPinMapping(mergedExperiment || currentExperiment);
                if (lcdMapping && avrRef.current.configureLCDPins) avrRef.current.configureLCDPins(lcdMapping);
                setComponentStates({ _pins: avrRef.current.getPinStates() });
              }
            } else if (currentExperiment?.simulationMode === 'avr') {
              const { default: AVRBridge } = await import('../engine/AVRBridge');
              const bridge = new AVRBridge();
              bridge.onSerialOutput = (char) => {
                setSerialOutput(prev => { const next = prev + char; return next.length > 4000 ? next.slice(-3000) : next; });
                try { emitSimulatorEvent('serialOutput', { char }); } catch { }
              };
              bridge.onPinChange = createOnPinChangeHandler(bridge, setComponentStates, pinMapRef);
              const loaded = await bridge.loadHexFromString(result.hex);
              if (loaded) {
                avrRef.current = bridge;
                setAvrReady(true);
                setSerialOutput('');
                const lcdMapping = buildLCDPinMapping(mergedExperiment || currentExperiment);
                if (lcdMapping && bridge.configureLCDPins) bridge.configureLCDPins(lcdMapping);
                setComponentStates({ _pins: bridge.getPinStates() });
              }
            }
          } catch (err) {
            logger.warn('[ELAB] AVRBridge lazy-load failed:', err.message);
          }
        })();
        if (result.output) {
          const warnLines = result.output.split('\n').filter(l => /warning:/i.test(l));
          if (warnLines.length > 0) setCompilationWarnings(translateCompilationErrors(warnLines.join('\n')));
        }
        trackedTimeout(() => { setCompilationStatus(null); setCompilationWarnings(null); }, 5000);
      } else {
        setCompilationStatus('error');
        const fullText = result.errors || 'Errore di compilazione sconosciuto';
        const lines = fullText.split('\n');
        const errorLines = [], warnLines = [];
        for (const line of lines) { if (/warning:/i.test(line)) warnLines.push(line); else errorLines.push(line); }
        const rawErrors = errorLines.join('\n').trim() || fullText;
        pushActivity('compile_error', rawErrors.slice(0, 120));
        sessionMetrics.trackCompilation(false);
        setCompilationErrors(translateCompilationErrors(rawErrors));
        if (warnLines.length > 0) setCompilationWarnings(translateCompilationErrors(warnLines.join('\n')));
        try { sendAnalyticsEvent(EVENTS.ERROR, { type: 'compilation_failed', errors: rawErrors.slice(0, 200) }); } catch { }
        const lineMatch = fullText.match(/\.ino:(\d+):\d+:.*error/);
        if (lineMatch) setCompilationErrorLine(parseInt(lineMatch[1]));
        finalResult = { ...result, success: false, status: 'error', errors: rawErrors };
      }
    } catch (err) {
      logger.error('[ELAB] Compilation error:', err);
      setCompilationStatus('error');
      setCompilationErrors('Non riesco a compilare il codice. Controlla la connessione internet e riprova!');
      try { sendAnalyticsEvent(EVENTS.ERROR, { type: 'compilation', message: err.message }); } catch { }
      trackedTimeout(() => { setCompilationStatus(null); setCompilationErrors(null); }, 10000);
      finalResult = { success: false, status: 'error', errors: err?.message || 'Errore di compilazione' };
    } finally {
      compilingRef.current = false;
    }
    return finalResult || { success: false, status: 'error', errors: 'Compilazione senza risultato' };
  }, [currentExperiment, mergedExperiment, trackedTimeout]);

  /* ─────────────────────────────────────────────────
     Canvas drag-over, Export PNG, Quiz, Report, Annotations
     ───────────────────────────────────────────────── */
  const handleCanvasDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }, []);

  const handleExportPng = useCallback(async () => {
    if (!canvasContainerRef.current) return;
    const ok = await exportCanvasPng(canvasContainerRef.current, currentExperiment?.id);
    if (ok) { setExportToast(true); trackedTimeout(() => setExportToast(false), 2500); }
  }, [currentExperiment, trackedTimeout]);

  const handleQuizComplete = useCallback((results) => {
    if (quizResultsRef) quizResultsRef.current = results;
  }, [quizResultsRef]);

  const handleGenerateReport = useCallback(async () => {
    if (isGeneratingReport || !currentExperiment) return;
    setIsGeneratingReport(true);
    recordEvent('report_generated');
    try {
      const screenshot = await captureCircuit(canvasContainerRef);
      const stepsTotal = currentExperiment?.buildSteps?.length || 0;
      const sessionData = collectSessionData({
        messages: messagesRef?.current || [],
        activeExperiment: currentExperiment,
        quizResults: quizResultsRef?.current || null,
        codeContent: codeContentRef.current || null,
        compilationResult: compilationResultRef.current || null,
        sessionStartTime: sessionStartRef?.current || Date.now(),
        buildStepIndex,
        buildStepsTotal: stepsTotal,
        isCircuitComplete: stepsTotal > 0 ? buildStepIndex >= stepsTotal - 1 : !currentExperiment?.buildMode,
      });
      const aiSummary = await fetchAISummary(sessionData);
      const timeline = getTimeline();
      const measurements = solverRef.current ? {
        voltages: solverRef.current.getNodeVoltages(),
        currents: solverRef.current.getComponentCurrents(),
      } : { voltages: {}, currents: {} };
      const result = await generateSessionReportPDF(sessionData, screenshot, aiSummary, timeline, measurements);
      if (result?.blob) {
        const url = URL.createObjectURL(result.blob);
        setPdfReady({ url, filename: result.filename });
      }
    } catch (err) {
      logger.error('Report generation failed:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [currentExperiment, isGeneratingReport, buildStepIndex, getTimeline]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfReady) return;
    const a = document.createElement('a');
    a.href = pdfReady.url;
    a.download = pdfReady.filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => { URL.revokeObjectURL(pdfReady.url); setPdfReady(null); }, 2000);
  }, [pdfReady]);

  /* ─────────────────────────────────────────────────
     Annotation handlers
     ───────────────────────────────────────────────── */
  const saveAnnotations = useCallback((newAnnotations) => {
    if (!currentExperiment?.id) return;
    try { localStorage.setItem(`elab_notes_${currentExperiment.id}`, JSON.stringify(newAnnotations)); } catch { }
  }, [currentExperiment?.id]);

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  useEffect(() => {
    if (!currentExperiment?.id) return;
    try {
      const saved = localStorage.getItem(`elab_notes_${currentExperiment.id}`);
      if (saved) setAnnotations(JSON.parse(saved));
    } catch { }
  }, [currentExperiment?.id]);

  const handleAnnotationAdd = useCallback(() => {
    const id = `note-${Date.now()}`;
    const vb = canvasContainerRef.current?.querySelector('svg')?.viewBox?.baseVal;
    const cx = (vb?.x || 0) + (vb?.width || 400) / 2;
    const cy = (vb?.y || 0) + (vb?.height || 300) / 2;
    setAnnotations(prev => {
      const next = [...prev, { id, x: cx - 80, y: cy - 24, text: 'Nota...' }];
      saveAnnotations(next);
      return next;
    });
    setSelectedAnnotation(id);
  }, [saveAnnotations]);

  const handleAnnotationTextChange = useCallback((noteId, newText) => {
    setAnnotations(prev => {
      const next = prev.map(a => a.id === noteId ? { ...a, text: newText } : a);
      saveAnnotations(next);
      return next;
    });
  }, [saveAnnotations]);

  const handleAnnotationDelete = useCallback((noteId) => {
    setAnnotations(prev => {
      const next = prev.filter(a => a.id !== noteId);
      saveAnnotations(next);
      return next;
    });
    setSelectedAnnotation(null);
  }, [saveAnnotations]);

  const handleAnnotationSelect = useCallback((noteId) => {
    setSelectedAnnotation(prev => prev === noteId ? null : noteId);
  }, []);

  const handleAnnotationPositionChange = useCallback((noteId, newX, newY) => {
    setAnnotations(prev => {
      const next = prev.map(a => a.id === noteId ? { ...a, x: newX, y: newY } : a);
      saveAnnotations(next);
      return next;
    });
  }, [saveAnnotations]);

  return {
    handlePlay,
    handleReset,
    handleBuildModeSwitch,
    handleBack,
    handleComponentClick,
    handlePotValueChange,
    handleLdrValueChange,
    handlePropChange,
    handleComponentValueChange,
    handleSerialInput,
    handleAskUNLIM,
    handleLayoutChange,
    handleConnectionAdd,
    handleWireUpdate,
    handleWireClick,
    handleWireDelete,
    handleComponentAdd,
    handleComponentDelete,
    handleResetExperiment,
    handleCompile,
    handleCanvasDragOver,
    handleExportPng,
    handleQuizComplete,
    handleGenerateReport,
    handleDownloadPdf,
    handleAnnotationAdd,
    handleAnnotationTextChange,
    handleAnnotationDelete,
    handleAnnotationSelect,
    handleAnnotationPositionChange,
  };
}
