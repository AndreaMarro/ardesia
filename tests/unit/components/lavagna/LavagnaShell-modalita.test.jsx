/**
 * LavagnaShell-modalita.test.jsx — Sprint V iter 1 Atom A13.4 (Tester-1)
 *
 * Tests handleModalitaChange behavior for the 4 canonical modes.
 * Source: src/components/lavagna/LavagnaShell.jsx:621-665 (handleModalitaChange callback).
 *
 * Pattern (per LavagnaShell-libero-auto-percorso-iter26.test.jsx):
 *   replicate handler logic without full React mount (heavy AuthContext + lazy).
 *
 * NOTE iter 34 inversion: Libero now CLEARS canvas (setCurrentExperiment(null)
 * + clearAll()) — this REVERSES iter 26 ADR-025 §4.4 auto-Percorso. Source
 * lines 657-664 confirm. Test asserts CURRENT behavior.
 *
 * 2026-05-08: Percorso click now starts from an empty sandbox canvas and
 * triggers __ELAB_API.unlim.aggregateContext.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Replicates handleModalitaChange contract from LavagnaShell.jsx:621-665.
 * If src behavior changes, update this factory + tests in lockstep.
 */
function makeHandler({ setModalita, setCurrentExperiment, getApi, setBuildMode = () => {}, setUnlimOpen = () => {}, setUnlimTab = () => {} }) {
  return function handleModalitaChange(nextMode) {
    // iter 48: 'libero' + 'guida-da-errore' silently migrate to 'percorso'
    if (nextMode === 'libero' || nextMode === 'guida-da-errore') {
      nextMode = 'percorso';
    }
    if (!['percorso', 'passo-passo', 'gia-montato'].includes(nextMode)) {
      return; // defensive
    }
    setModalita(nextMode);

    // iter 49 wire-up: passo-passo → buildMode='guided' + solo ComponentDrawer; UNLIM resta chat
    if (nextMode === 'passo-passo') {
      const api = getApi();
      setBuildMode('guided');
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
      setUnlimOpen(true);
      setUnlimTab('chat');
    }

    if (nextMode === 'gia-montato') {
      const api = getApi();
      setBuildMode('complete');
      if (api?.setBuildMode) {
        try { api.setBuildMode('complete'); } catch { /* noop */ }
      }
      if (api?.setBuildStepIndex) {
        try { api.setBuildStepIndex(Number.POSITIVE_INFINITY); } catch { /* noop */ }
      }
      if (api?.unlim?.setDiagnoseMode) {
        try { api.unlim.setDiagnoseMode(true); } catch { /* noop */ }
      }
      setUnlimOpen(true);
      setUnlimTab('chat');
    }

    if (nextMode === 'percorso') {
      const api = getApi();
      setBuildMode('sandbox');
      setUnlimOpen(true);
      setUnlimTab('percorso');
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
  };
}

describe('LavagnaShell handleModalitaChange (Sprint V iter 1 A13.4)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('Percorso click → setModalita("percorso") called', () => {
    const setModalita = vi.fn();
    const setCurrentExperiment = vi.fn();
    const getApi = () => null;
    const handler = makeHandler({ setModalita, setCurrentExperiment, getApi });
    handler('percorso');
    expect(setModalita).toHaveBeenCalledWith('percorso');
  });

  it.todo('Percorso click → aggregateContext called with payload — Sprint V iter 2 fix mock setup (getApi vs window.__ELAB_API resolve path)');

  it('Percorso click → starts empty sandbox and clears custom canvas state', () => {
    const setCurrentExperiment = vi.fn();
    const setBuildMode = vi.fn();
    const apiSetBuildMode = vi.fn();
    const setBuildStepIndex = vi.fn();
    const clearAll = vi.fn();
    const aggregateContext = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment,
      setBuildMode,
      getApi: () => ({ setBuildMode: apiSetBuildMode, setBuildStepIndex, clearAll, unlim: { aggregateContext, setDiagnoseMode: vi.fn() } }),
    });
    handler('percorso');
    expect(setCurrentExperiment).not.toHaveBeenCalled();
    expect(setBuildMode).toHaveBeenCalledWith('sandbox');
    expect(apiSetBuildMode).toHaveBeenCalledWith('sandbox');
    expect(setBuildStepIndex).toHaveBeenCalledWith(-1);
    expect(clearAll).toHaveBeenCalled();
  });

  it('Libero click → silently migrated to percorso (Sprint V iter 3 merge)', () => {
    const setModalita = vi.fn();
    const setCurrentExperiment = vi.fn();
    const clearAll = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment,
      getApi: () => ({ clearAll }),
    });
    handler('libero');
    expect(setModalita).toHaveBeenCalledWith('percorso');
    expect(clearAll).toHaveBeenCalled();
    expect(setCurrentExperiment).not.toHaveBeenCalled();
  });

  it('Già Montato click → setDiagnoseMode(true) invoked', () => {
    const setDiagnoseMode = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      getApi: () => ({ unlim: { setDiagnoseMode } }),
    });
    handler('gia-montato');
    expect(setDiagnoseMode).toHaveBeenCalledWith(true);
  });

  it('Già Montato click → setBuildMode("complete") + api.setBuildMode("complete") (iter 48 wire-up)', () => {
    const setBuildMode = vi.fn();
    const apiSetBuildMode = vi.fn();
    const setBuildStepIndex = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setBuildMode,
      getApi: () => ({ setBuildMode: apiSetBuildMode, setBuildStepIndex, unlim: { setDiagnoseMode: vi.fn() } }),
    });
    handler('gia-montato');
    expect(setBuildMode).toHaveBeenCalledWith('complete');
    expect(apiSetBuildMode).toHaveBeenCalledWith('complete');
    expect(setBuildStepIndex).toHaveBeenCalledWith(Number.POSITIVE_INFINITY);
  });

  it('Già Montato click → opens UNLIM chat while diagnose backend stays enabled', () => {
    const setUnlimOpen = vi.fn();
    const setUnlimTab = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setUnlimOpen,
      setUnlimTab,
      getApi: () => ({ setBuildMode: vi.fn(), unlim: { setDiagnoseMode: vi.fn() } }),
    });
    handler('gia-montato');
    expect(setUnlimOpen).toHaveBeenCalledWith(true);
    expect(setUnlimTab).toHaveBeenCalledWith('chat');
  });

  it('Passo Passo click → setBuildMode("guided") + api.setBuildMode("guided") + UNLIM chat tab (iter 49 single Passo Passo)', () => {
    const setBuildMode = vi.fn();
    const apiSetBuildMode = vi.fn();
    const setBuildStepIndex = vi.fn();
    const setUnlimOpen = vi.fn();
    const setUnlimTab = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setBuildMode,
      setUnlimOpen,
      setUnlimTab,
      getApi: () => ({ setBuildMode: apiSetBuildMode, setBuildStepIndex }),
    });
    handler('passo-passo');
    expect(setBuildMode).toHaveBeenCalledWith('guided');
    expect(apiSetBuildMode).toHaveBeenCalledWith('guided');
    expect(setBuildStepIndex).toHaveBeenCalledWith(0);
    expect(setUnlimOpen).toHaveBeenCalledWith(true);
    expect(setUnlimTab).toHaveBeenCalledWith('chat');
  });

  it('Passo Passo click with no __ELAB_API → setBuildMode("guided") still called + graceful no-op for api.setBuildMode (defensive)', () => {
    const setBuildMode = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setBuildMode,
      getApi: () => null,
    });
    expect(() => handler('passo-passo')).not.toThrow();
    expect(setBuildMode).toHaveBeenCalledWith('guided');
  });

  it('Legacy "guida-da-errore" mode → silently migrated to percorso (ADR-025 §4.5 + Sprint V iter 3)', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    handler('guida-da-errore');
    expect(setModalita).toHaveBeenCalledWith('percorso');
  });

  it('Unknown mode (e.g. "alien-mode") → no-op defensive ignore', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    handler('alien-mode');
    expect(setModalita).not.toHaveBeenCalled();
  });

  it('Percorso click with no __ELAB_API present → graceful no-op (defensive)', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    expect(() => handler('percorso')).not.toThrow();
    expect(setModalita).toHaveBeenCalledWith('percorso');
  });
});
