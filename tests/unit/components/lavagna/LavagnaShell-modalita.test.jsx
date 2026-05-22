/**
 * LavagnaShell-modalita.test.jsx — Sprint V iter 1 Atom A13.4 (Tester-1)
 *
 * Tests handleModalitaChange behavior while Percorso is temporarily in standby.
 * Source: src/components/lavagna/LavagnaShell.jsx:621-665 (handleModalitaChange callback).
 *
 * Pattern (per LavagnaShell-libero-auto-percorso-iter26.test.jsx):
 *   replicate handler logic without full React mount (heavy AuthContext + lazy).
 *
 * NOTE iter 34 inversion: Libero now CLEARS canvas (setCurrentExperiment(null)
 * + clearAll()) — this REVERSES iter 26 ADR-025 §4.4 auto-Percorso. Source
 * lines 657-664 confirm. Test asserts CURRENT behavior.
 *
 * 2026-05-22: Percorso/libero/guida-da-errore migrate to Passo Passo instead
 * of opening the broken narrative flow.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Replicates handleModalitaChange contract from LavagnaShell.jsx:621-665.
 * If src behavior changes, update this factory + tests in lockstep.
 */
function makeHandler({
  setModalita,
  setCurrentExperiment,
  getApi,
  setBuildMode = () => {},
  setUnlimOpen = () => {},
  setUnlimTab = () => {},
  setCapitoloPickerOpen = () => {},
  setPickerOpen = () => {},
}) {
  return function handleModalitaChange(nextMode) {
    // Percorso standby: legacy/narrative entries migrate to Passo Passo.
    if (nextMode === 'percorso' || nextMode === 'libero' || nextMode === 'guida-da-errore') {
      nextMode = 'passo-passo';
    }
    if (!['passo-passo', 'gia-montato'].includes(nextMode)) {
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
      setUnlimOpen(false);
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
      setUnlimOpen(false);
      setUnlimTab('chat');
    }

  };
}

function openEmptyLavagnaFallback({
  modalita,
  setPickerOpen = () => {},
  setCapitoloPickerOpen = () => {},
}) {
  setPickerOpen(true);
}

describe('LavagnaShell handleModalitaChange (Sprint V iter 1 A13.4)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('Percorso click while in standby → migrates to Passo Passo', () => {
    const setModalita = vi.fn();
    const setCurrentExperiment = vi.fn();
    const getApi = () => null;
    const handler = makeHandler({ setModalita, setCurrentExperiment, getApi });
    handler('percorso');
    expect(setModalita).toHaveBeenCalledWith('passo-passo');
  });

  it('Percorso standby migration keeps UNLIM on chat and does not open capitoli', () => {
    const setCapitoloPickerOpen = vi.fn();
    const setUnlimOpen = vi.fn();
    const setUnlimTab = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setCapitoloPickerOpen,
      setUnlimOpen,
      setUnlimTab,
      getApi: () => null,
    });
    handler('percorso');
    expect(setUnlimOpen).toHaveBeenCalledWith(false);
    expect(setUnlimTab).toHaveBeenCalledWith('chat');
    expect(setCapitoloPickerOpen).not.toHaveBeenCalled();
  });

  it('Percorso standby migration does not close picker as narrative flow', () => {
    const setPickerOpen = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment: vi.fn(),
      setPickerOpen,
      getApi: () => null,
    });
    handler('percorso');
    expect(setPickerOpen).not.toHaveBeenCalled();
  });

  it('Percorso standby migration starts guided build and does not clear canvas', () => {
    const setCurrentExperiment = vi.fn();
    const setBuildMode = vi.fn();
    const apiSetBuildMode = vi.fn();
    const setBuildStepIndex = vi.fn();
    const clearAll = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment,
      setBuildMode,
      getApi: () => ({ setBuildMode: apiSetBuildMode, setBuildStepIndex, clearAll, unlim: { setDiagnoseMode: vi.fn() } }),
    });
    handler('percorso');
    expect(setCurrentExperiment).not.toHaveBeenCalled();
    expect(setBuildMode).toHaveBeenCalledWith('guided');
    expect(apiSetBuildMode).toHaveBeenCalledWith('guided');
    expect(setBuildStepIndex).toHaveBeenCalledWith(0);
    expect(clearAll).not.toHaveBeenCalled();
  });

  it('Libero click → silently migrated to passo-passo while Percorso is in standby', () => {
    const setModalita = vi.fn();
    const setCurrentExperiment = vi.fn();
    const clearAll = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment,
      getApi: () => ({ clearAll }),
    });
    handler('libero');
    expect(setModalita).toHaveBeenCalledWith('passo-passo');
    expect(clearAll).not.toHaveBeenCalled();
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

  it('Già Montato click → keeps UNLIM window closed while diagnose backend stays enabled', () => {
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
    expect(setUnlimOpen).toHaveBeenCalledWith(false);
    expect(setUnlimTab).toHaveBeenCalledWith('chat');
  });

  it('Passo Passo click → setBuildMode("guided") + api.setBuildMode("guided") without forcing UNLIM open', () => {
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
    expect(setUnlimOpen).toHaveBeenCalledWith(false);
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

  it('Legacy "guida-da-errore" mode → silently migrated to passo-passo', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    handler('guida-da-errore');
    expect(setModalita).toHaveBeenCalledWith('passo-passo');
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

  it('Percorso click with no __ELAB_API present → graceful migration', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    expect(() => handler('percorso')).not.toThrow();
    expect(setModalita).toHaveBeenCalledWith('passo-passo');
  });

  it('empty Lavagna fallback with stale Percorso → opens picker because Percorso is standby', () => {
    const setPickerOpen = vi.fn();
    const setCapitoloPickerOpen = vi.fn();
    openEmptyLavagnaFallback({
      modalita: 'percorso',
      setPickerOpen,
      setCapitoloPickerOpen,
    });
    expect(setCapitoloPickerOpen).not.toHaveBeenCalled();
    expect(setPickerOpen).toHaveBeenCalledWith(true);
  });

  it('empty Lavagna fallback fuori da Percorso → mantiene picker esperimenti', () => {
    const setPickerOpen = vi.fn();
    const setCapitoloPickerOpen = vi.fn();
    openEmptyLavagnaFallback({
      modalita: 'passo-passo',
      setPickerOpen,
      setCapitoloPickerOpen,
    });
    expect(setPickerOpen).toHaveBeenCalledWith(true);
    expect(setCapitoloPickerOpen).not.toHaveBeenCalled();
  });
});
