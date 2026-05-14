/**
 * useSimulatorAPI — Public API registration + circuit state bridge + proactive events
 *
 * Registers window.__ELAB_API for MCP/UNLIM integration.
 * Bridges circuit state to parent (ElabTutorV4) for UNLIM context.
 * Detects proactive circuit events (LED burned, high current).
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 */
import { useCallback, useEffect, useRef } from 'react';
import { registerSimulatorInstance, unregisterSimulatorInstance } from '../../../services/simulator-api';
import { pushActivity } from '../../../services/activityBuffer';

/**
 * @param {object} params — all refs and setters needed by the API
 */
export default function useSimulatorAPI({
  // Refs for current state (avoid stale closures in mount-time API)
  currentExperimentRef,
  mergedExperimentRef,
  componentStatesRef,
  editorCodeRef,
  editorModeRef,
  scratchGeneratedCodeRef,
  showCodeEditorRef,
  circuitStatusRef,
  buildStepIndexRef,
  canUndoRef,
  canRedoRef,
  selectedComponentIdRef,
  serialOutputRef,
  compilationDetailsRef,
  isRunningRef,
  solverRef,
  avrRef,
  pinMapRef,
  // Callback refs
  handleSelectExperimentRef,
  handlePlayRef,
  handlePauseRef,
  handleResetRef,
  handleCompileRef,
  handleComponentClickRef,
  handleConnectionAddRef,
  handleWireDeleteRef,
  handleComponentAddRef,
  handleComponentDeleteRef,
  handleLayoutChangeRef,
  handleBuildModeSwitchRef,
  handlePropChangeRef,
  // Undo/redo
  getCurrentSnapshotRef,
  pushSnapshotRef,
  undoHistory,
  redoHistory,
  getCurrentSnapshot,
  restoreSnapshotRef,
  // State setters
  setApiHighlightedComponents,
  setApiHighlightedPins,
  setEditorCode,
  setEditorMode,
  setScratchXml,
  setScratchFullscreen,
  setShowCodeEditor,
  setShowBom,
  setShowLessonPath,
  setShowNotes,
  setShowQuiz,
  setBottomPanel,
  setShowBottomPanel,
  setBuildStepIndex,
  setCustomComponents,
  setCustomConnections,
  setCustomLayout,
  setCustomPinAssignments,
  setConnectionOverrides,
  codeNeedsCompileRef,
  // Parent callbacks
  onCircuitStateChange,
  onCircuitEvent,
  // Experiment data
  mergedExperiment,
  currentExperiment,
  componentStates,
  buildStepIndex,
  // Wire mode
  setWireMode,
  wireMode,
}) {
  // Ref for wireMode to avoid stale closure
  const wireModeRef = useRef(wireMode);
  wireModeRef.current = wireMode;
  // Phase 7: Structured AI context API
  const buildStructuredState = useCallback(() => {
    const exp = mergedExperimentRef.current || currentExperimentRef.current;
    if (!exp) return null;

    const states = componentStatesRef.current || {};
    const comps = exp.components || [];
    const conns = exp.connections || [];

    let voltages = {};
    let currents = {};
    try {
      if (solverRef.current) {
        voltages = solverRef.current.getNodeVoltages?.() || {};
        currents = solverRef.current.getComponentCurrents?.() || {};
      }
    } catch { /* solver may not be ready */ }

    const measurements = {};
    comps.forEach(c => {
      const v = voltages[c.id];
      const i = currents[c.id];
      if (v !== undefined || i !== undefined) {
        measurements[c.id] = {};
        if (v !== undefined) measurements[c.id].voltage = v;
        if (i !== undefined) measurements[c.id].current = i;
      }
    });

    return {
      experiment: {
        id: exp.id || null,
        title: exp.title || null,
        chapter: exp.chapter || null,
      },
      components: comps.map(c => ({
        id: c.id,
        type: c.type,
        state: states[c.id] || {},
        position: exp.layout?.[c.id] || null,
        parentId: exp.layout?.[c.id]?.parentId || null,
      })),
      connections: conns.map(conn => ({
        from: conn.from,
        to: conn.to,
        color: conn.color || 'auto',
      })),
      measurements,
      status: circuitStatusRef.current?.status || 'idle',
      warnings: circuitStatusRef.current?.warnings || [],
      errors: circuitStatusRef.current?.errors || [],
      isSimulating: isRunningRef.current || false,
      buildMode: !exp.buildMode ? 'mounted' : exp.buildMode === 'guided' ? 'guided' : 'explore',
      buildStepIndex: buildStepIndexRef.current ?? null,
      buildStepTotal: exp.buildSteps?.length || null,
      arduinoCode: editorCodeRef.current || null,
    };
  }, []);

  /* ─────────────────────────────────────────────────
     UNLIM PERVASIVO: Bridge circuit state → parent
     Debounced at 400ms for responsive AI feedback.
     ───────────────────────────────────────────────── */
  const circuitBridgeTimerRef = useRef(null);
  useEffect(() => {
    if (!onCircuitStateChange || !mergedExperiment) return;

    clearTimeout(circuitBridgeTimerRef.current);
    circuitBridgeTimerRef.current = setTimeout(() => {
      const exp = mergedExperiment;
      const states = componentStates;
      const conns = exp.connections || [];
      const comps = exp.components || [];

      // 1. Component states summary
      const compSummary = comps.map(c => {
        const s = states[c.id] || {};
        const parts = [c.id + ' (' + c.type + ')'];
        if (c.type === 'led' || c.type === 'rgb-led') {
          const on = s.brightness > 0 || s.glowing;
          parts.push(on ? 'ACCESO' : 'spento');
          if (s.burned) parts.push('BRUCIATO!');
          if (s.current) parts.push(Math.round(s.current * 1000) / 1000 + 'mA');
        }
        if (c.type === 'resistor' && (s.resistance || c.state?.resistance)) {
          parts.push((s.resistance || c.state?.resistance) + 'Ω');
        }
        if (c.type === 'buzzer-piezo') parts.push(s.on ? 'suona' : 'silenzioso');
        if (c.type === 'motor-dc') parts.push(s.spinning ? 'gira' : 'fermo');
        if (c.type === 'potentiometer') parts.push('posizione: ' + Math.round((s.position || 0.5) * 100) + '%');
        if (c.type === 'push-button') parts.push(s.pressed ? 'PREMUTO' : 'rilasciato');
        if (c.type === 'photo-resistor') parts.push('luce: ' + Math.round((s.lightLevel || 0.5) * 100) + '%');
        if (c.type === 'battery9v') parts.push((s.voltage || 9) + 'V');
        if (c.type === 'capacitor') parts.push(s.charging ? 'caricando' : s.charged ? 'carico' : 'scarico');
        return parts.join(' — ');
      }).join('\n');

      // 2. Connection list
      const connSummary = conns.map(conn => {
        return `${conn.from} → ${conn.to} (${conn.color || 'auto'})`;
      }).join('\n');

      // 3. Circuit health from solver
      let healthSummary = '';
      if (solverRef.current) {
        try {
          const diag = solverRef.current.getDiagnostics?.() || {};
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          if (diag.shortCircuit) healthSummary += 'CORTOCIRCUITO RILEVATO — simulazione in pausa\n';
          const burned = comps.filter(c => (states[c.id] || {}).burned);
          if (burned.length > 0) healthSummary += 'COMPONENTI BRUCIATI: ' + burned.map(c => c.id).join(', ') + '\n';
          if (diag.overloadWarnings?.length > 0) healthSummary += 'SOVRACCARICO: ' + diag.overloadWarnings.map(w => w.message).join('; ') + '\n';
          const highCurrent = comps.filter(c => (states[c.id] || {}).current > 50);
          if (highCurrent.length > 0) healthSummary += 'CORRENTE ALTA: ' + highCurrent.map(c => c.id + '=' + Math.round((states[c.id]?.current || 0)) + 'mA').join(', ') + '\n';
          if (diag.disconnectedPins?.length > 0) {
            const discPins = diag.disconnectedPins.slice(0, 10);
            healthSummary += 'PIN SCOLLEGATI: ' + discPins.map(d => `${d.compId}:${d.pinName}`).join(', ') + '\n';
          }
          const deadLeds = comps.filter(c =>
            (c.type === 'led' || c.type === 'rgb-led') &&
            !(states[c.id]?.brightness > 0) && !(states[c.id]?.glowing)
          );
          if (deadLeds.length > 0) healthSummary += 'LED spenti (possibile errore di collegamento): ' + deadLeds.map(c => c.id).join(', ') + '\n';
        } catch { /* solver may not be ready */ }
      }

      // 4. Build mode context
      const buildCtx = !currentExperiment?.buildMode
        ? 'Già Montato (circuito completo visibile)'
        : currentExperiment.buildMode === 'guided'
          ? `Passo Passo — step ${buildStepIndex + 1}/${exp.buildSteps?.length || '?'}`
          : 'Esplora Libero (canvas vuoto, studente costruisce da zero)';

      // 5. Assemble full circuit context
      const circuitContext = [
        `[STATO CIRCUITO — aggiornamento live]`,
        `Esperimento: "${exp.title || exp.id}" — ${exp.chapter || ''}`,
        `Modalità: ${buildCtx}`,
        ``,
        `Componenti (${comps.length}):`,
        compSummary,
        ``,
        `Connessioni (${conns.length} fili):`,
        connSummary,
        healthSummary ? `\n${healthSummary}` : '',
      ].filter(Boolean).join('\n');

      const MAX_CONTEXT_CHARS = 3000;
      const sanitizedText = circuitContext.length > MAX_CONTEXT_CHARS
        ? circuitContext.slice(0, MAX_CONTEXT_CHARS) + '\n... [troncato per dimensione]'
        : circuitContext;

      onCircuitStateChange({
        structured: buildStructuredState(),
        text: sanitizedText,
      });
    }, 400);

    return () => clearTimeout(circuitBridgeTimerRef.current);
  }, [componentStates, mergedExperiment, currentExperiment, buildStepIndex, onCircuitStateChange, buildStructuredState]);

  /* ─────────────────────────────────────────────────
     Proactive event detection (LED burned, high current)
     ───────────────────────────────────────────────── */
  const firedEventsRef = useRef(new Set());
  useEffect(() => {
    if (!onCircuitEvent || !mergedExperiment) return;
    const comps = mergedExperiment.components || [];
    const states = componentStates;

    comps.forEach(c => {
      if ((c.type === 'led' || c.type === 'rgb-led') && states[c.id]?.burned) {
        const key = `burned-${c.id}`;
        if (!firedEventsRef.current.has(key)) {
          firedEventsRef.current.add(key);
          onCircuitEvent({
            type: 'led-burned',
            componentId: c.id,
            message: `Oh no! Il LED "${c.id}" si e bruciato! Probabilmente manca un resistore o il suo valore e troppo basso. Vuoi che UNLIM ti spieghi cosa e successo?`
          });
        }
      }
    });

    comps.forEach(c => {
      const s = states[c.id] || {};
      if (s.current && s.current > 30 && (c.type === 'led' || c.type === 'rgb-led')) {
        const key = `highcurrent-${c.id}`;
        if (!firedEventsRef.current.has(key)) {
          firedEventsRef.current.add(key);
          onCircuitEvent({
            type: 'high-current',
            componentId: c.id,
            message: `Attenzione: il LED "${c.id}" sta ricevendo ${Math.round(s.current)}mA — e troppo! Rischia di bruciarsi. Prova ad aggiungere un resistore o aumentarne il valore.`
          });
        }
      }
    });
  }, [componentStates, mergedExperiment, onCircuitEvent]);

  // Reset proactive events when experiment changes
  useEffect(() => {
    firedEventsRef.current = new Set();
  }, [currentExperiment?.id]);

  /* ─────────────────────────────────────────────────
     Register public API for MCP/AI integration
     (runs once on mount, uses refs for live data)
     ───────────────────────────────────────────────── */
  useEffect(() => {
    const apiInstance = {
      selectExperiment: (exp) => handleSelectExperimentRef.current?.(exp),
      getCurrentExperiment: () => currentExperimentRef.current,
      play: () => handlePlayRef.current?.(),
      pause: () => handlePauseRef.current?.(),
      reset: () => handleResetRef.current?.(),
      getComponentStates: () => componentStatesRef.current,
      interact: (id, action, value) => {
        if (typeof action === 'string' && ['setLightLevel', 'setPosition', 'touchGate', 'releaseGate', 'press', 'release', 'toggle'].includes(action)) {
          if (solverRef.current) solverRef.current.interact(id, action, value);
          if (action === 'press' || action === 'release') {
            handleComponentClickRef.current?.(id, action);
          }
          if ((action === 'setPosition' || action === 'setLightLevel') && avrRef.current && typeof value === 'number') {
            const pinEntry = Object.entries(pinMapRef.current).find(
              ([, m]) => m.compId === id || m.directCompId === id
            );
            if (pinEntry) {
              const pin = parseInt(pinEntry[0]);
              avrRef.current.setInputPin(pin, Math.round(value * 1023));
            }
          }
          return;
        }
        handleComponentClickRef.current?.(id, action);
      },
      addWire: (from, to) => handleConnectionAddRef.current?.(from, to),
      removeWire: (index) => handleWireDeleteRef.current?.(index),
      addComponent: (type, pos) => handleComponentAddRef.current?.(type, pos),
      removeComponent: (id) => handleComponentDeleteRef.current?.(id),
      setComponentValue: (id, field, value) => handlePropChangeRef.current?.(id, field, value),
      getEditorCode: () => editorModeRef?.current === 'scratch' ? scratchGeneratedCodeRef.current : editorCodeRef.current,
      setEditorCode: (code) => {
        editorCodeRef.current = code;
        setEditorCode(code);
        codeNeedsCompileRef.current = true;
      },
      setHighlightedComponents: (ids) => setApiHighlightedComponents(Array.isArray(ids) ? ids : (ids ? [ids] : [])),
      setHighlightedPins: (refs) => setApiHighlightedPins(Array.isArray(refs) ? refs : (refs ? [refs] : [])),
      serialWrite: (text) => { if (avrRef.current) avrRef.current.serialWrite?.(text); },
      moveComponent: (id, x, y) => {
        handleLayoutChangeRef.current?.(id, { x: parseInt(x), y: parseInt(y) }, true);
      },
      clearAll: () => {
        const snap = getCurrentSnapshotRef.current?.();
        if (snap) pushSnapshotRef.current?.(snap);
        pushActivity('clearall', currentExperimentRef.current?.id || '');
        setCustomComponents([]);
        setCustomConnections([]);
        setCustomLayout({});
        setCustomPinAssignments({});
        setConnectionOverrides({});
      },
      getComponentPositions: () => {
        const exp = mergedExperimentRef.current || currentExperimentRef.current;
        if (!exp) return {};
        const positions = {};
        (exp.components || []).forEach(c => {
          const pos = exp.layout?.[c.id] || {};
          positions[c.id] = { x: pos.x || 0, y: pos.y || 0, type: c.type };
        });
        return positions;
      },
      getLayout: () => {
        const exp = mergedExperimentRef.current || currentExperimentRef.current;
        return {
          components: exp?.components || [],
          connections: exp?.connections || [],
          layout: exp?.layout || {},
          pinAssignments: exp?.pinAssignments || {},
        };
      },
      getCircuitState: () => buildStructuredState(),
      getCompilationSnapshot: () => compilationDetailsRef.current,
      showEditor: () => setShowCodeEditor(true),
      hideEditor: () => setShowCodeEditor(false),
      setEditorMode: (mode) => {
        if (mode === 'scratch' || mode === 'arduino') {
          editorModeRef.current = mode;
          setEditorMode(mode);
          setShowCodeEditor(true);
          pushActivity('editor_switch', mode);
        }
      },
      getEditorMode: () => editorModeRef.current,
      isEditorVisible: () => showCodeEditorRef.current,
      loadScratchWorkspace: (xml) => {
        editorModeRef.current = 'scratch';
        setScratchXml(xml);
        setEditorMode('scratch');
        setShowCodeEditor(true);
      },
      undo: () => {
        const snapshot = undoHistory(getCurrentSnapshot());
        if (snapshot) restoreSnapshotRef.current?.(snapshot);
      },
      redo: () => {
        const snapshot = redoHistory(getCurrentSnapshot());
        if (snapshot) restoreSnapshotRef.current?.(snapshot);
      },
      canUndo: () => canUndoRef.current,
      canRedo: () => canRedoRef.current,
      highlightPin: (refs) => setApiHighlightedPins(Array.isArray(refs) ? refs : (refs ? [refs] : [])),
      setBuildMode: (mode) => handleBuildModeSwitchRef.current?.(mode),
      setBuildStepIndex: (index) => {
        const steps = currentExperimentRef.current?.buildSteps || [];
        const numericIndex = Number(index);
        if (numericIndex === Number.POSITIVE_INFINITY) {
          setBuildStepIndex(Infinity);
          pushActivity('build_step_complete', 'mounted');
          return;
        }
        if (!Number.isFinite(numericIndex)) return;
        const requested = Math.max(-1, Math.trunc(numericIndex));
        const next = steps.length > 0
          ? Math.min(requested, steps.length - 1)
          : requested;
        setBuildStepIndex(next);
        if (next >= 0) pushActivity('build_step_set', `step ${next + 1}/${steps.length}`);
      },
      resetBuildSteps: () => setBuildStepIndex(-1),
      getBuildMode: () => {
        const mode = currentExperimentRef.current?.buildMode;
        if (mode === false || mode === undefined || mode === null) return 'complete';
        return mode; // 'guided' or 'sandbox'
      },
      nextStep: () => {
        const steps = currentExperimentRef.current?.buildSteps || [];
        setBuildStepIndex(prev => {
          const next = steps.length > 0 ? Math.min(prev + 1, steps.length - 1) : prev;
          if (next !== prev) pushActivity('build_step_next', `step ${next + 1}/${steps.length}`);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
          return next;
        });
      },
      prevStep: () => setBuildStepIndex(prev => {
        const next = Math.max(-1, prev - 1);
        if (next !== prev) pushActivity('build_step_prev', `step ${next + 1}`);
        return next;
      }),
      getBuildStepIndex: () => buildStepIndexRef.current,
      showBom: () => setShowBom(true),
      hideBom: () => setShowBom(false),
      showLessonPath: () => { setShowLessonPath(true); setShowBom(false); setShowNotes(false); setShowQuiz(false); },
      hideLessonPath: () => setShowLessonPath(false),
      showSerialMonitor: () => { setShowCodeEditor(true); setBottomPanel('monitor'); },
      hideSerialMonitor: () => { setShowCodeEditor(false); },
      isSimulating: () => isRunningRef.current || false,
      getSimulationStatus: () => isRunningRef.current ? 'running' : 'stopped',
      /** Set tool mode: 'select' or 'wire' */
      setToolMode: (mode) => { if (setWireMode) { setWireMode(mode === 'wire'); wireModeRef.current = mode === 'wire'; } },
      /** Get current tool mode */
      getToolMode: () => wireModeRef.current ? 'wire' : 'select',
      getSelectedComponent: () => {
        const id = selectedComponentIdRef.current;
        if (!id) return null;
        const circuit = buildStructuredState();
        const comp = circuit?.components?.find(c => c.id === id);
        return comp ? { id: comp.id, type: comp.type, state: comp.state || {} } : { id };
      },
      getSerialOutput: () => {
        const text = serialOutputRef.current || '';
        if (!text) return null;
        const lines = text.split('\n').filter(Boolean);
        return { lastLines: lines.slice(-10), lineCount: lines.length };
      },
      appendEditorCode: (code) => { setEditorCode(prev => (prev || '') + '\n' + code); codeNeedsCompileRef.current = true; },
      resetEditorCode: () => {
        const orig = currentExperimentRef.current?.code || '';
        setEditorCode(orig);
      },
      getExperimentOriginalCode: () => currentExperimentRef.current?.code || '',
      setScratchFullscreen: (v) => { setScratchFullscreen(!!v); if (v) { setEditorMode('scratch'); setShowCodeEditor(true); } },
      compileAndLoad: async (code) => {
        if (handleCompileRef.current) {
          return await handleCompileRef.current(code);
        }
        return null;
      },
    };
    registerSimulatorInstance(apiInstance);
    return () => unregisterSimulatorInstance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { buildStructuredState };
}
