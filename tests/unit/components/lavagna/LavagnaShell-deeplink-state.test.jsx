import { describe, expect, it, vi } from 'vitest';
import { applyLoadedExperimentStateFromApi } from '../../../../src/components/lavagna/LavagnaShell.jsx';

describe('LavagnaShell deep-link experiment state', () => {
  it('marks a directly loaded experiment as mounted even when experimentChange was missed', () => {
    const experiment = {
      id: 'v2-cap3-esp1',
      title: 'Cap. 3 Esp. 1 - Controlliamo la carica della batteria',
    };
    const setters = {
      setCurrentExperiment: vi.fn(),
      setExperimentName: vi.fn(),
      setHasExperiment: vi.fn(),
      setPickerOpen: vi.fn(),
      setCapitoloPickerOpen: vi.fn(),
      setBentornatiVisible: vi.fn(),
      setCurrentVolume: vi.fn(),
    };

    const applied = applyLoadedExperimentStateFromApi({
      api: {
        loadExperiment: vi.fn(() => true),
        getCurrentExperiment: vi.fn(() => experiment),
      },
      experimentId: experiment.id,
      ...setters,
    });

    expect(applied).toBe(true);
    expect(setters.setCurrentExperiment).toHaveBeenCalledWith(experiment);
    expect(setters.setExperimentName).toHaveBeenCalledWith(experiment.title);
    expect(setters.setHasExperiment).toHaveBeenCalledWith(true);
    expect(setters.setPickerOpen).toHaveBeenCalledWith(false);
    expect(setters.setCapitoloPickerOpen).toHaveBeenCalledWith(false);
    expect(setters.setBentornatiVisible).toHaveBeenCalledWith(false);
    expect(setters.setCurrentVolume).toHaveBeenCalledWith(2);
  });
});
