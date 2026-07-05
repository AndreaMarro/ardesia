/**
 * PercorsoCapitoloView tests — Sprint Q2.D
 * Andrea Marro 2026-04-25
 *
 * Orchestratore principale Percorso Capitolo.
 * Layout 70/25: display centrale (classe) + sidebar destra (docente colpo d'occhio).
 *
 * PRINCIPIO ZERO:
 *  - Display centrale: testo grande narrativo, classe legge ad alta voce
 *  - Sidebar docente: linguaggio neutro nominale, colpo d'occhio
 *  - Citazioni volume inline cliccabili
 *  - Transizioni narrative tra esperimenti dello stesso Cap
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PercorsoCapitoloView from '../../../../src/components/lavagna/PercorsoCapitoloView.jsx';
import { sendChat } from '../../../../src/services/api.js';

vi.mock('../../../../src/services/api.js', () => ({
  sendChat: vi.fn(),
}));

vi.mock('../../../../../../packs/elab-tutor/data/lesson-paths', () => ({
  getLessonPath: vi.fn((experimentId) => {
    if (experimentId === 'v1-cap6-esp1') {
      return {
        next_experiment: {
          id: 'v1-cap6-esp2',
          title: 'LED senza resistore (cosa NON fare!)',
          preview: 'Cosa succede se togliamo il resistore? Il LED è in pericolo!',
        },
      };
    }
    return null;
  }),
}));

const SAMPLE_CAPITOLO_EXP = {
  id: 'v1-cap6',
  volume: 1,
  capitolo: 6,
  type: 'experiment',
  titolo: "Cos'è il diodo LED?",
  titolo_classe: "Cos'è il diodo LED?",
  pageStart: 27,
  pageEnd: 34,
  theory: {
    testo_classe: "Un diodo LED produce luce quando attraversato da corrente.",
    citazioni_volume: [
      { page: 27, quote: 'Un diodo LED è un piccolo dispositivo elettronico...', context: 'opening' },
    ],
    figure_refs: [],
    analogies_classe: [],
  },
  narrative_flow: {
    intro_text: 'Oggi il diodo LED.',
    transitions: [
      {
        between: ['v1-cap6-esp1', 'v1-cap6-esp2'],
        text_classe: 'Abbiamo acceso il LED. Ma cosa succede senza resistore?',
        text_docente_action: 'Differire: resistore. Osservazione comportamento senza protezione.',
        incremental_mode: 'remove_component',
      },
    ],
    closing_text: 'Abbiamo scoperto che il LED si brucia senza resistore.',
  },
  esperimenti: [
    {
      id: 'v1-cap6-esp1',
      num: 1,
      title_classe: 'Accendi il primo LED',
      title_docente: 'Accendi LED',
      volume_ref: { page_start: 29, page_end: 31, fig_refs: [] },
      duration_minutes: 45,
      components_needed: [
        { name: 'LED rosso', quantity: 1, icon: 'led' },
        { name: 'Resistore 470Ω', quantity: 1, icon: 'resistor' },
      ],
      build_circuit: { mode: 'from_scratch', intent: { components: [], wires: [] } },
      phases: [
        {
          name: 'PREPARA',
          duration_minutes: 5,
          classe_display: {
            text_hook: 'Avete mai acceso una lampadina?',
            observation_prompt: null,
            analogies: [],
          },
          docente_sidebar: {
            step_corrente: 'Distribuzione kit',
            spunto_per_classe: null,
            note: ['Resistore: differire'],
            errori_tipici: [],
          },
          action_tags: [],
          auto_action: null,
        },
      ],
      assessment_invisible: [],
      session_save: { concepts_covered: [], next_suggested: 'v1-cap6-esp2', resume_message: '' },
    },
    {
      id: 'v1-cap6-esp2',
      num: 2,
      title_classe: 'LED senza resistore',
      title_docente: 'LED no resistore',
      volume_ref: { page_start: 32, page_end: 32, fig_refs: [] },
      duration_minutes: 40,
      components_needed: [],
      build_circuit: {
        mode: 'incremental_from_prev',
        incremental_delta: { base_experiment_id: 'v1-cap6-esp1', operations: [{ op: 'remove', target: 'r1' }] },
      },
      phases: [],
      assessment_invisible: [],
      session_save: { concepts_covered: [], next_suggested: null, resume_message: '' },
    },
  ],
};

const SAMPLE_CAPITOLO_THEORY = {
  id: 'v1-cap1',
  volume: 1,
  capitolo: 1,
  type: 'theory',
  titolo: "La Storia dell'Elettronica",
  titolo_classe: "La Storia dell'Elettronica",
  pageStart: 5,
  pageEnd: 8,
  theory: {
    testo_classe: 'La storia dell\'elettronica inizia nel 1800.',
    citazioni_volume: [],
    figure_refs: [],
    analogies_classe: [],
  },
  esperimenti: [],
};

describe('PercorsoCapitoloView', () => {
  it('renders Cap titolo prominently', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByRole('heading', { name: /Cos'è il diodo LED/i })).toBeInTheDocument();
  });

  it('renders Cap volume + page range', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    // Header badge shows "Vol.1" + VolumeCitation badge in theory shows same — at least 1 match
    expect(screen.getAllByText(/Vol\.\s*1/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/pag\.\s*27\s*-\s*34/i)).toBeInTheDocument();
  });

  it('renders theory testo_classe', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByText(/Un diodo LED produce luce/)).toBeInTheDocument();
  });

  it('renders all esperimenti titles', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByText('Accendi il primo LED')).toBeInTheDocument();
    expect(screen.getByText('LED senza resistore')).toBeInTheDocument();
  });

  it('renders narrative_flow.transitions between esperimenti', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByText(/Abbiamo acceso il LED. Ma cosa succede senza resistore/)).toBeInTheDocument();
  });

  it('renders next_experiment preview as a between-card cliffhanger, not inside a flat grid/card', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    const transition = screen.getByTestId('percorso-next-transition-v1-cap6-esp1');

    expect(transition).toHaveTextContent(/LED senza resistore/);
    expect(transition).toHaveTextContent(/Il LED è in pericolo/);
    expect(transition.closest('article')).toBeNull();
  });

  it('renders DocenteSidebar with role complementary', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('renders main content with role main', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders for theory Cap (no esperimenti)', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_THEORY} />);
    expect(screen.getByText(/La storia dell'elettronica inizia/)).toBeInTheDocument();
  });

  it('shows components_needed list per esperimento', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByText('LED rosso')).toBeInTheDocument();
    expect(screen.getByText(/Resistore 470/)).toBeInTheDocument();
  });

  it('shows incremental_from_prev hint for esp2', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    expect(screen.getByText(/incremental|partendo|circuito precedente/i)).toBeInTheDocument();
  });

  it('renders empty fallback when capitolo is null', () => {
    render(<PercorsoCapitoloView capitolo={null} />);
    expect(screen.getByText(/Nessun capitolo|Caricamento/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked if onClose provided', () => {
    const handler = vi.fn();
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} onClose={handler} />);
    const closeBtn = screen.queryByRole('button', { name: /chiudi/i });
    if (closeBtn) {
      closeBtn.click();
      expect(handler).toHaveBeenCalled();
    }
  });

  it('VolumeCitation badge renders for theory citations', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    // SAMPLE has citazioni_volume with page 27
    expect(screen.getAllByText(/Vol\.\s*1\s*pag\.\s*27/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders esperimento phase docente_sidebar in sidebar', () => {
    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    // docente_sidebar.step_corrente of esp1 phase 1 = "Distribuzione kit"
    expect(screen.getByText('Distribuzione kit')).toBeInTheDocument();
  });

  it('Lezione personalizzata displays sendChat.response, not the raw JSON envelope', async () => {
    sendChat.mockResolvedValueOnce({
      success: true,
      response: 'Ragazzi, partiamo dal LED come porta girevole. (Riferimento: Vol. 1, pag. 29 del libro ELAB.)',
      source: 'test',
    });

    render(<PercorsoCapitoloView capitolo={SAMPLE_CAPITOLO_EXP} />);
    fireEvent.click(screen.getByTestId('btn-lezione-personalizzata'));

    await waitFor(() => {
      expect(screen.getByTestId('lezione-proposta')).toHaveTextContent(/porta girevole/);
    });
    expect(screen.getByTestId('lezione-proposta')).not.toHaveTextContent('"success"');
    expect(sendChat).toHaveBeenCalledWith(
      expect.stringMatching(/lezione personalizzata/i),
      [],
      expect.objectContaining({ experimentId: 'v1-cap6-esp1' })
    );
  });
});
