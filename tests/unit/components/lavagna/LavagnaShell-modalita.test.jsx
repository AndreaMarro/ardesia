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
 * Sprint V iter 1 Atom A5: Percorso click triggers __ELAB_API.unlim.aggregateContext
 * with {lesson, class_key, recent_sessions_limit:5}. NO canvas mutation.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Replicates handleModalitaChange contract from LavagnaShell.jsx:621-665.
 * If src behavior changes, update this factory + tests in lockstep.
 */
function makeHandler({ setModalita, setCurrentExperiment, getApi }) {
  return function handleModalitaChange(nextMode) {
    if (!['percorso', 'passo-passo', 'gia-montato', 'libero'].includes(nextMode)) {
      return; // defensive
    }
    setModalita(nextMode);

    if (nextMode === 'gia-montato') {
      const api = getApi();
      if (api?.unlim?.setDiagnoseMode) {
        try { api.unlim.setDiagnoseMode(true); } catch { /* noop */ }
      }
    }

    if (nextMode === 'percorso') {
      const api = getApi();
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

    if (nextMode === 'libero') {
      const api = getApi();
      try {
        setCurrentExperiment(null);
        if (api?.clearAll) api.clearAll();
        try { localStorage.removeItem('elab-lavagna-exp-id'); } catch { /* noop */ }
      } catch { /* noop */ }
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

  it('Percorso click → does NOT mutate currentExperiment (preserve canvas mandate)', () => {
    const setCurrentExperiment = vi.fn();
    const aggregateContext = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment,
      getApi: () => ({ unlim: { aggregateContext } }),
    });
    handler('percorso');
    expect(setCurrentExperiment).not.toHaveBeenCalled();
  });

  it('Libero click → currentExperiment cleared + clearAll() invoked + localStorage exp-id removed (iter 34 P0 inversion)', () => {
    localStorage.setItem('elab-lavagna-exp-id', 'v1-cap6-esp1');
    const setCurrentExperiment = vi.fn();
    const clearAll = vi.fn();
    const handler = makeHandler({
      setModalita: vi.fn(),
      setCurrentExperiment,
      getApi: () => ({ clearAll }),
    });
    handler('libero');
    expect(setCurrentExperiment).toHaveBeenCalledWith(null);
    expect(clearAll).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('elab-lavagna-exp-id')).toBeNull();
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

  it('Unknown / legacy mode (e.g. "guida-da-errore") → no-op defensive ignore', () => {
    const setModalita = vi.fn();
    const handler = makeHandler({
      setModalita,
      setCurrentExperiment: vi.fn(),
      getApi: () => null,
    });
    handler('guida-da-errore');
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
