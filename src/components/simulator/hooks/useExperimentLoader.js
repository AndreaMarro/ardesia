/**
 * useExperimentLoader — Experiment selection, AVR polling, Simon sounds
 *
 * Handles: handleSelectExperiment, startAVRPolling, Simon audio effects
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 */
import { useCallback, useEffect, useRef } from 'react';
import { preloadExperiment } from '../../../services/api';
import { compileArduinoCode } from '../../../services/compiler';
import { emitSimulatorEvent } from '../../../services/simulator-api';
import { pushActivity } from '../../../services/activityBuffer';
import { sessionMetrics } from '../../../services/sessionMetrics';
import { sendAnalyticsEvent, EVENTS } from '../api/AnalyticsWebhook';
import { buildPinComponentMap, buildLCDPinMapping, createOnPinChangeHandler } from '../utils/pinComponentMap';
import { inferParentFromPinAssignments } from '../utils/parentChild';
import { hasLessonPath } from '../../../data/lesson-paths';
import logger from '../../../utils/logger';

/**
 * @param {object} params
 */
export default function useExperimentLoader({
  // Refs
  solverRef,
  avrRef,
  avrPollRef,
  pinMapRef,
  loadedExpIdRef,
  avrSetupLockRef,
  avrLoadingRef,
  isRunningRef,
  userKitsRef,
  codeNeedsCompileRef,
  editorCodeRef,
  editorModeRef,
  scratchGeneratedCodeRef,
  currentExperimentRef,
  mergedExperimentRef,
  onCodeSelectRef,
  onOpenSimulatorRef,
  onExperimentChangeRef,
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
  setEditorCode,
  setEditorMode,
  setScratchXml,
  setScratchGeneratedCode,
  setShowCodeEditor,
  setShowSidebar,
  setShowGuide,
  setShowBom,
  setShowQuiz,
  setShowLessonPath,
  setShowNotes,
  setShowBottomPanel,
  setBuildStepIndex,
  setSelectedVolume,
  setAnnotations,
  setSelectedAnnotation,
  setCompilationStatus,
  setCompilationErrors,
  setCompilationWarnings,
  setCompilationErrorLine,
  setCompilationSize,
  setCircuitStatus,
  // Undo
  resetHistory,
  // Storage
  loadFromStorage,
  loadSavedCode,
  // Timer
  trackedTimeout,
  // Session
  recordEvent,
  // Merged experiment (for polling)
  mergedExperiment,
}) {
  /* ─────────────────────────────────────────────────
     Select experiment
     ───────────────────────────────────────────────── */
  const handleSelectExperiment = useCallback(async (experiment) => {
    // Antigravity: infer parentId from pinAssignments
    if (experiment.pinAssignments && experiment.layout) {
      const parentMap = inferParentFromPinAssignments(experiment.pinAssignments);
      for (const [compId, bbId] of Object.entries(parentMap)) {
        if (experiment.layout[compId] && !experiment.layout[compId].parentId) {
          experiment.layout[compId] = { ...experiment.layout[compId], parentId: bbId };
        }
      }
    }

    // Volume bypass guard
    const kits = userKitsRef.current;
    if (kits !== null && experiment.id) {
      const volMatch = experiment.id.match(/^v(\d)/);
      if (volMatch) {
        const volNum = parseInt(volMatch[1], 10);
        const kitName = `Volume ${volNum}`;
        if (!kits.includes(kitName)) return;
      }
    }

    // Guards
    if (experiment.simulationMode === 'avr' && avrSetupLockRef.current.inProgress && experiment.id === avrSetupLockRef.current.expId) return;
    if (experiment.id === loadedExpIdRef.current && (avrRef.current || solverRef.current || avrLoadingRef.current)) return;

    loadedExpIdRef.current = experiment.id;
    preloadExperiment(experiment.id);
    if (experiment.simulationMode === 'avr') {
      avrSetupLockRef.current.inProgress = true;
      avrSetupLockRef.current.expId = experiment.id;
      avrLoadingRef.current = true;
    }

    // Stop everything first
    if (solverRef.current) { solverRef.current.pause(); solverRef.current.reset(); }
    if (avrRef.current) { avrRef.current.pause(); avrRef.current.destroy(); avrRef.current = null; }
    if (avrPollRef.current) { clearInterval(avrPollRef.current); avrPollRef.current = null; }

    setCircuitStatus({ status: 'idle', warnings: [], errors: [] });
    setCurrentExperiment(experiment);
    pushActivity('experiment_loaded', `${experiment.id} "${experiment.title || experiment.name || ''}"`.trim());
    sessionMetrics.trackExperimentLoad(experiment.id);
    recordEvent('experiment_loaded', { experimentId: experiment.id, experimentName: experiment.name || experiment.id });
    if (onExperimentChangeRef.current) onExperimentChangeRef.current(experiment);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    setIsRunning(false);
    setSimulationTime(0);
    setSerialOutput('');
    setAvrReady(false);

    // Reset custom overlays + undo history
    setCustomLayout({});
    setCustomConnections([]);
    setCustomComponents([]);
    setCustomPinAssignments({});
    setPotOverlay(null);
    setLdrOverlay(null);
    resetHistory();
    setAnnotations([]);
    setSelectedAnnotation(null);
    setShowBom(false);
    setShowQuiz(false);
    // Principio Zero: il percorso lezione è la PRIMA cosa che il docente vede
    // Si apre automaticamente se l'esperimento ha un lesson path
    setShowLessonPath(hasLessonPath(experiment.id));
    setBuildStepIndex(
      experiment.buildMode === 'guided' ? -1
        : experiment.buildMode === 'sandbox' ? -1
          : Infinity
    );
    const volNum = experiment.id.startsWith('v3-') ? 3 : experiment.id.startsWith('v2-') ? 2 : 1;
    setSelectedVolume(volNum);
    setShowNotes(false);

    loadFromStorage(experiment.id);

    const savedCode = loadSavedCode(experiment.id);
    const DEFAULT_SKETCH = 'void setup() {\n  // Il tuo codice di configurazione\n}\n\nvoid loop() {\n  // Il tuo codice principale\n}\n';
    const actualCode = savedCode || experiment.code || DEFAULT_SKETCH;
    setEditorCode(actualCode);
    const isAvr = experiment.simulationMode === 'avr';
    const savedScratch = isAvr ? localStorage.getItem(`elab_scratch_${experiment.id}`) : null;
    setScratchXml(savedScratch || experiment.scratchXml || '');
    setScratchGeneratedCode(isAvr ? localStorage.getItem(`elab_scratch_code_${experiment.id}`) || '' : '');
    setEditorMode(isAvr ? 'scratch' : 'arduino');
    const originalCode = (experiment.code || '').trim();
    codeNeedsCompileRef.current = actualCode.trim() !== originalCode;
    setCompilationStatus(null);
    setCompilationErrors(null);
    setCompilationWarnings(null);
    setCompilationErrorLine(null);
    const isAvrWithCode = isAvr && !!experiment.code;
    setShowCodeEditor(isAvrWithCode);
    setShowSidebar(false);
    setShowGuide(true);

    pinMapRef.current = buildPinComponentMap(experiment);

    if (experiment.simulationMode === 'avr') {
      try {
        const { default: AVRBridge } = await import('../engine/AVRBridge');
        const bridge = new AVRBridge();

        bridge.onSerialOutput = (char) => {
          setSerialOutput(prev => {
            const next = prev + char;
            return next.length > 4000 ? next.slice(-3000) : next;
          });
          try { emitSimulatorEvent('serialOutput', { char }); } catch { }
        };

        bridge.onPinChange = createOnPinChangeHandler(bridge, setComponentStates, pinMapRef);

        let loaded = false;

        if (experiment.hexFile) {
          const hexUrl = experiment.hexFile.startsWith('/') ? experiment.hexFile : `/hex/${experiment.hexFile}`;
          loaded = await bridge.loadHex(hexUrl);
          if (loaded) {
            setCompilationStatus('success-local');
            trackedTimeout(() => setCompilationStatus(null), 3000);
          }
        } else if (experiment.code) {
          setCompilationStatus('compiling');
          try {
            const result = await compileArduinoCode(experiment.code, { experimentId: experiment.id });
            if (result.success && result.hex) {
              loaded = await bridge.loadHexFromString(result.hex);
              setCompilationStatus(result.source === 'precompiled' ? 'success-local' : 'success');
              trackedTimeout(() => setCompilationStatus(null), 3000);
            } else {
              setCompilationStatus('error');
              setCompilationErrors(result.errors || 'Errore di compilazione');
            }
          } catch (compileErr) {
            logger.warn('[ELAB] Errore compilazione:', compileErr.message);
            setCompilationStatus('error');
            setCompilationErrors('Non riesco a compilare il codice. Controlla la connessione internet e riprova!');
          }
        }

        if (loaded) {
          avrRef.current = bridge;
          setAvrReady(true);
          if (window.innerHeight > 820) setShowBottomPanel(true);

          const lcdMapping = buildLCDPinMapping(experiment);
          if (lcdMapping && bridge.configureLCDPins) bridge.configureLCDPins(lcdMapping);

          const pinStates = bridge.getPinStates();
          if (solverRef.current) {
            solverRef.current.loadExperiment(experiment);
            const solverStates = solverRef.current.getState();
            setComponentStates({ ...solverStates, _pins: pinStates });
          } else {
            setComponentStates(prev => ({ ...prev, _pins: pinStates }));
          }
        } else {
          if (solverRef.current) {
            solverRef.current.loadExperiment(experiment);
            setComponentStates(solverRef.current.getState());
          }
        }
      } catch (err) {
        logger.error('[ELAB] AVRBridge load error:', err.message);
      } finally {
        avrLoadingRef.current = false;
        avrSetupLockRef.current.inProgress = false;
      }
    } else {
      avrLoadingRef.current = false;
      avrSetupLockRef.current.inProgress = false;
      if (solverRef.current) {
        solverRef.current.loadExperiment(experiment);
        setComponentStates(solverRef.current.getState());
        solverRef.current.start();
        setIsRunning(true);
      }
    }

    if (experiment.code && onCodeSelectRef.current) onCodeSelectRef.current(experiment.code);
    if (onOpenSimulatorRef.current) onOpenSimulatorRef.current(experiment.id);

    try { sendAnalyticsEvent(EVENTS.EXPERIMENT_LOADED, { experimentId: experiment.id, title: experiment.title, mode: experiment.simulationMode }); } catch { }
    try { emitSimulatorEvent('experimentChange', { experimentId: experiment.id, title: experiment.title, mode: experiment.simulationMode }); } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────────────────────────────────
     AVR pin polling loop
     ───────────────────────────────────────────────── */
  const avrTxLenRef = useRef(0);
  const avrTxTimerRef = useRef(null);

  const startAVRPolling = useCallback(() => {
    if (!avrRef.current || !mergedExperiment) return;

    if (avrPollRef.current) {
      clearInterval(avrPollRef.current);
      avrPollRef.current = null;
    }

    avrPollRef.current = setInterval(() => {
      if (!avrRef.current || !avrRef.current.running) return;

      const pinStates = avrRef.current.getPinStates();
      const newStates = {};
      const pinMap = pinMapRef.current;

      // Servo angle state from PWM duty cycles
      if (avrRef.current.getAllServoAngles) {
        const servoAngles = avrRef.current.getAllServoAngles();
        if (servoAngles) {
          Object.entries(pinMap).forEach(([pinNum, mapping]) => {
            if (mapping.compType === 'servo' && servoAngles[pinNum] !== undefined) {
              newStates[mapping.compId] = { angle: servoAngles[pinNum], active: true };
            }
          });
        }
      }

      // LCD 16x2 state from HD44780 emulation
      if (avrRef.current.getLCDState) {
        const lcdState = avrRef.current.getLCDState();
        if (lcdState) {
          const comps = mergedExperiment?.components || [];
          comps.forEach(comp => {
            if (comp.type === 'lcd16x2') {
              newStates[comp.id] = {
                text: lcdState.text,
                cursorPos: lcdState.cursorPos,
                cursorVisible: lcdState.cursorVisible,
                displayOn: lcdState.displayOn,
                backlight: lcdState.backlight,
              };
            }
          });
        }
      }

      newStates._pins = pinStates;
      newStates._avrRunning = true;

      // TX/RX LED pulse
      const currentSerial = avrRef.current.serialBuffer;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      if (currentSerial.length > (avrTxLenRef.current || 0)) {
        newStates._txActive = true;
        avrTxLenRef.current = currentSerial.length;
        if (avrTxTimerRef.current) clearTimeout(avrTxTimerRef.current);
        avrTxTimerRef.current = setTimeout(() => {
          setComponentStates(prev => ({ ...prev, _txActive: false }));
        }, 80);
      }

      // Simulation time from CPU cycles
      if (avrRef.current.cpu) {
        const cycles = Number(avrRef.current.cpu.cycles);
        setSimulationTime(cycles / 16000000);
      }

      setComponentStates(prev => {
        const nextPins = { ...(prev._pins || {}), ...pinStates };
        newStates._pins = nextPins;
        const merged = { ...prev, ...newStates };

        // PUSH TO MNA SOLVER
        if (solverRef.current) {
          let targetNano = null;
          solverRef.current.components.forEach((c) => {
            if (c.type === 'nano-r4') targetNano = c;
          });

          if (targetNano) {
            targetNano.state = targetNano.state || {};
            targetNano.state.pinStates = nextPins;
            targetNano.state.pinModes = nextPins._modes || {};
          }

          solverRef.current.solve(0.050);

          if (targetNano) {
            for (let i = 0; i <= 13; i++) {
              const mode = targetNano.state.pinModes[i];
              if (mode === 2 || mode === 3) {
                const v = solverRef.current.getNodeVoltage(`${targetNano.id}:D${i}`);
                if (v !== null) avrRef.current.setInputPin(i, v > 2.5 ? 1 : 0);
              }
            }
            for (let a = 0; a <= 7; a++) {
              const v = solverRef.current.getNodeVoltage(`${targetNano.id}:A${a}`);
              if (v !== null) avrRef.current.setAnalogValue(a, (v / 5.0) * 1023);
            }
          }

          const solverStates = solverRef.current.getState();
          for (const id in solverStates) {
            if (id === '_pins' || id === '_avrRunning' || id === '_txActive') continue;
            merged[id] = { ...solverStates[id], ...(newStates[id] || {}) };
          }
        }

        return merged;
      });
    }, 50);
  }, [mergedExperiment]);

  return { handleSelectExperiment, startAVRPolling, avrTxLenRef };
}
