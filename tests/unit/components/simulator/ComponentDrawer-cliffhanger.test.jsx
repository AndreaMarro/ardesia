import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ComponentDrawer from '../../../../src/components/simulator/panels/ComponentDrawer.jsx';

vi.mock('../../../../src/components/simulator/components/registry', () => ({
  getComponentsByVolume: vi.fn(() => []),
  getComponent: vi.fn(() => null),
}));

describe('ComponentDrawer narrative completion CTA', () => {
  it('keeps Passo Passo completion open and loads the next experiment from next_experiment', async () => {
    const onLoadNextExperiment = vi.fn();

    render(
      <ComponentDrawer
        mode="guided"
        experiment={{
          id: 'v1-cap6-esp1',
          title: 'Accendi il tuo primo LED',
          buildSteps: [{ text: 'Inserite il LED', componentType: 'led' }],
          scratchSteps: [],
        }}
        currentStep={1}
        onStepChange={vi.fn()}
        nextExperiment={{
          id: 'v1-cap6-esp2',
          title: 'LED senza resistore',
          preview: 'Cosa succede se togliamo il resistore?',
        }}
        onLoadNextExperiment={onLoadNextExperiment}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Circuito completato!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('component-drawer-cliffhanger')).toHaveTextContent(/Cosa succede se togliamo il resistore/);
    fireEvent.click(screen.getByTestId('component-drawer-cliffhanger-cta'));
    expect(onLoadNextExperiment).toHaveBeenCalledWith('v1-cap6-esp2');
  });
});
