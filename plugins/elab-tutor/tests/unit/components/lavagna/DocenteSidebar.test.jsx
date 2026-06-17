/**
 * DocenteSidebar tests — Sprint Q2.B
 * Andrea Marro 2026-04-25
 *
 * Sidebar sticky destra, colpo d'occhio docente.
 * PRINCIPIO ZERO: linguaggio neutro nominale, NO imperativi seconda persona.
 * Docente la legge in silenzio, NON la riceve come ordine.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocenteSidebar from '../../../../src/components/lavagna/DocenteSidebar.jsx';

const SAMPLE_FULL = {
  step_corrente: 'Distribuzione kit alla classe',
  spunto_per_classe: "Domanda: 'Avete mai acceso una lampadina?'",
  note: ['Resistore necessario altrimenti LED bruciato', 'Polarità LED rispettata'],
  errori_tipici: [
    { problema: 'LED inserito al contrario', soluzione_neutra: 'Rotazione LED' },
    { problema: 'Fili in righe diverse', soluzione_neutra: 'Riposizionamento stessa riga' },
  ],
};

const SAMPLE_MINIMAL = {
  step_corrente: 'Step in corso',
  spunto_per_classe: null,
  note: [],
  errori_tipici: [],
};

describe('DocenteSidebar', () => {
  it('renders step_corrente prominently', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    expect(screen.getByText('Distribuzione kit alla classe')).toBeInTheDocument();
  });

  it('renders spunto_per_classe when present', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    expect(screen.getByText(/Domanda:/)).toBeInTheDocument();
    expect(screen.getByText(/Avete mai acceso una lampadina/)).toBeInTheDocument();
  });

  it('hides spunto section when null', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_MINIMAL} />);
    expect(screen.queryByText(/Spunto/i)).not.toBeInTheDocument();
  });

  it('renders all note as list items', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    expect(screen.getByText(/Resistore necessario/)).toBeInTheDocument();
    expect(screen.getByText(/Polarità LED rispettata/)).toBeInTheDocument();
  });

  it('hides note section when empty array', () => {
    const { container } = render(<DocenteSidebar docenteSidebar={SAMPLE_MINIMAL} />);
    // No "Note" heading rendered when empty
    expect(container.querySelector('[data-section="note"]')).not.toBeInTheDocument();
  });

  it('renders errori_tipici with problema + soluzione_neutra', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    expect(screen.getByText('LED inserito al contrario')).toBeInTheDocument();
    expect(screen.getByText('Rotazione LED')).toBeInTheDocument();
    expect(screen.getByText('Fili in righe diverse')).toBeInTheDocument();
    expect(screen.getByText('Riposizionamento stessa riga')).toBeInTheDocument();
  });

  it('hides errori section when empty array', () => {
    const { container } = render(<DocenteSidebar docenteSidebar={SAMPLE_MINIMAL} />);
    expect(container.querySelector('[data-section="errori"]')).not.toBeInTheDocument();
  });

  it('has role complementary for accessibility', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('has aria-label "Sidebar docente"', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} />);
    const sb = screen.getByRole('complementary');
    expect(sb.getAttribute('aria-label')).toContain('docente');
  });

  it('renders empty fallback when docenteSidebar is null', () => {
    render(<DocenteSidebar docenteSidebar={null} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('renders empty fallback when docenteSidebar is undefined', () => {
    render(<DocenteSidebar />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('renders currentPhase context if provided', () => {
    render(<DocenteSidebar docenteSidebar={SAMPLE_FULL} currentPhase="MOSTRA" />);
    expect(screen.getByText(/MOSTRA/)).toBeInTheDocument();
  });

  it('renders currentExperiment title if provided', () => {
    render(
      <DocenteSidebar
        docenteSidebar={SAMPLE_FULL}
        currentExperiment={{ id: 'v1-cap6-esp1', title_docente: 'Accendi LED' }}
      />
    );
    expect(screen.getByText(/Accendi LED/)).toBeInTheDocument();
  });
});
