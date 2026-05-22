// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import PercorsoCapitoloView from '../../../src/components/lavagna/PercorsoCapitoloView.jsx';
import { DEFAULT_PERCORSO_MORPHIC_CONTEXT } from '../../../src/services/percorsoMorphicAdapter.js';

vi.mock('../../../src/services/api.js', () => ({
  sendChat: vi.fn(),
}));

function mockStorageEntries(entries) {
  window.localStorage.getItem.mockImplementation((key) => entries[key] ?? null);
}

const capitolo = {
  id: 'v1-cap6',
  volume: 1,
  capitolo: 6,
  type: 'experiment',
  titolo: "Cos'è il diodo LED?",
  pageStart: 27,
  pageEnd: 34,
  theory: {
    testo_classe: 'Il LED si accende quando la corrente passa nel verso giusto.',
    citazioni_volume: [{ page: 27 }],
  },
  narrative_flow: {
    intro_text: 'Ragazzi, oggi lavoriamo sul kit fisico ELAB e leggiamo Vol.1 pag.27 prima di accendere il LED.',
    transitions: [
      {
        between: ['v1-cap6-esp1', 'v1-cap6-esp2'],
        text_classe: 'Dopo il primo LED, osserviamo cosa cambia con il resistore.',
        incremental_mode: 'modify_component',
      },
    ],
    closing_text: 'Ragazzi, il prossimo passo resta sul kit fisico: Vol.1 pag.32.',
  },
  esperimenti: [
    {
      id: 'v1-cap6-esp1',
      num: 1,
      title_classe: 'Accendi il primo LED',
      title_docente: 'Accendi LED',
      volume_ref: { page_start: 27 },
      components_needed: [
        { name: 'Breadboard', quantity: 1 },
        { name: 'LED rosso', quantity: 1 },
        { name: 'Sensore ultrasuoni HC-SR04', quantity: 1 },
      ],
      build_circuit: { mode: 'from_scratch' },
      phases: [
        {
          name: 'PREPARA',
          classe_display: { text_hook: 'Osserviamo il LED.', observation_prompt: null },
          docente_sidebar: { step_corrente: 'Distribuzione kit', note: [], errori_tipici: [] },
        },
      ],
      session_save: { next_suggested: 'v1-cap6-esp2' },
    },
    {
      id: 'v1-cap6-esp2',
      num: 2,
      title_classe: 'LED con resistore',
      title_docente: 'LED resistore',
      volume_ref: { page_start: 32 },
      components_needed: [{ name: 'Resistore 470Ω', quantity: 1 }],
      build_circuit: { mode: 'incremental_from_prev' },
      phases: [],
      session_save: { next_suggested: null },
    },
  ],
};

const expertContext = {
  ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
  teacher: {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.teacher,
    profile: 'esperto',
    esempiBaseCount: 1,
    analogieCount: 0,
    microStepGranularity: 'compressa',
    skipBasics: true,
    highlightFisico: ['breadboard'],
  },
  classroom: {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom,
    age: 14,
    lexicalComplexity: 'tecnica-guidata',
    kitLevel: 'advanced',
    visibleComponents: DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom.visibleComponents,
  },
  ui: { resolution: '4k', pointer: 'touch', sessionState: 'verifica' },
};

const firstYearContext = {
  ...DEFAULT_PERCORSO_MORPHIC_CONTEXT,
  teacher: {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.teacher,
    profile: 'primo-anno',
    esempiBaseCount: 3,
    analogieCount: 2,
    microStepGranularity: 'espansa',
    skipBasics: false,
  },
  classroom: {
    ...DEFAULT_PERCORSO_MORPHIC_CONTEXT.classroom,
    age: 8,
    lexicalComplexity: 'semplice',
    kitLevel: 'base',
    visibleComponents: ['breadboard', 'led rosso', 'resistore 470', 'fili', 'batteria 9v'],
    componentFilterExplicit: true,
  },
  ui: { resolution: '1080p', pointer: 'mouse', sessionState: 'intro' },
};

describe('PercorsoCapitoloView — morfismo runtime per-docente/per-classe', () => {
  // HIGH-G fix (Phase 1 sub-iter 83.6): reset localStorage mock state to prevent leak
  // to subsequent specs in vitest fork worker.
  afterEach(() => {
    if (typeof window !== 'undefined' && window.localStorage?.getItem?.mockReset) {
      window.localStorage.getItem.mockReset();
      window.localStorage.getItem.mockReturnValue(null);
    }
  });

  it('renderizza attributi morfici e invarianti Principio Zero', () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

    const root = screen.getByTestId('percorso-morphic-root');
    expect(root).toHaveAttribute('data-teacher-profile', 'esperto');
    expect(root).toHaveAttribute('data-class-kit', 'advanced');
    expect(root).toHaveAttribute('data-session-state', 'verifica');
    expect(screen.getAllByText(/Ragazzi,/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/kit fisico/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Vol\.1 pag\.27|Vol\.\s*1\s*pag\.\s*27/i).length).toBeGreaterThanOrEqual(1);
  });

  it('docente esperto vede meno esempi e micro-step compressi', () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

    expect(screen.getByTestId('morphic-example-count')).toHaveTextContent('1');
    expect(screen.getByTestId('morphic-microsteps')).toHaveTextContent(/compressa/i);
  });

  it('docente primo anno vede piu esempi e analogie', () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={firstYearContext} />);

    expect(screen.getByTestId('morphic-example-count')).toHaveTextContent('3');
    expect(screen.getByTestId('morphic-analogy-count')).toHaveTextContent('2');
    expect(screen.getByTestId('morphic-microsteps')).toHaveTextContent(/espansa/i);
  });

  it('kit base nasconde componenti non disponibili senza modificare lesson-paths', () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={firstYearContext} />);

    expect(screen.getByText('LED rosso')).toBeInTheDocument();
    expect(screen.queryByText('Sensore ultrasuoni HC-SR04')).toBeNull();
    expect(screen.getByTestId('morphic-hidden-components-v1-cap6-esp1')).toHaveTextContent('1');
  });

  it('non espone id tecnici nel prossimo aggancio classe', () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

    expect(screen.queryByText(/v1-cap6-esp2/i)).toBeNull();
    expect(screen.getByText(/Prossimo aggancio: LED con resistore/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vol\.1 pag\.32/i).length).toBeGreaterThanOrEqual(1);
  });

  it('risolve next_suggested cross-chapter da lesson-path e volume references', () => {
    const capitoloCrossChapter = {
      ...capitolo,
      narrative_flow: {
        ...capitolo.narrative_flow,
        closing_text: 'Ragazzi, chiudiamo il capitolo con il kit fisico ELAB: Vol.1 pag.33.',
      },
      esperimenti: [
        {
          ...capitolo.esperimenti[0],
          id: 'v1-cap6-esp3',
          title_classe: 'Cambia luminosità con resistenze diverse',
          session_save: { next_suggested: 'v1-cap7-esp1' },
        },
      ],
    };

    render(<PercorsoCapitoloView capitolo={capitoloCrossChapter} morphicContext={expertContext} />);

    expect(screen.queryByText(/v1-cap7-esp1/i)).toBeNull();
    expect(screen.getByText(/Prossimo aggancio: Accendi il rosso del RGB/i)).toBeInTheDocument();
    expect(screen.getByText(/Vol\.1 pag\.36/i)).toBeInTheDocument();
  });

  it('ignora next_experiment.title vuoto e usa lesson-path come fallback', () => {
    const capitoloNextObjectBlankTitle = {
      ...capitolo,
      esperimenti: [
        {
          ...capitolo.esperimenti[0],
          next_experiment: { id: 'v1-cap7-esp1', title: '   ' },
          session_save: { next_suggested: null },
        },
      ],
    };

    render(<PercorsoCapitoloView capitolo={capitoloNextObjectBlankTitle} morphicContext={expertContext} />);

    expect(screen.queryByText(/v1-cap7-esp1/i)).toBeNull();
    expect(screen.getByText(/Prossimo aggancio: Accendi il rosso del RGB/i)).toBeInTheDocument();
    expect(screen.getByText(/Vol\.1 pag\.36/i)).toBeInTheDocument();
  });

  it('localStorage docente/classe produce resa diversa dopo resolve runtime', async () => {
    mockStorageEntries({
      'elab-teacher-anon-uuid': 'teacher-b',
      'elab-class-key': 'classe-b',
      'elab-morphic-teacher-profile:teacher-b': JSON.stringify({ experience: 'first_year' }),
      'elab-morphic-class-profile:classe-b': JSON.stringify({ age: 8, kit: 'base', competence: 'novice' }),
    });

    render(<PercorsoCapitoloView capitolo={capitolo} />);

    await waitFor(() => {
      expect(screen.getByTestId('percorso-morphic-root')).toHaveAttribute('data-teacher-profile', 'primo-anno');
    });
    expect(screen.getByTestId('morphic-example-count')).toHaveTextContent('3');
  });

  it('si aggiorna in tempo reale quando cambia contesto morfico runtime', async () => {
    const entries = {
      'elab-teacher-anon-uuid': 'teacher-live',
      'elab-class-key': 'classe-live',
      'elab-morphic-teacher-profile:teacher-live': JSON.stringify({ experience: 'expert' }),
      'elab-morphic-class-profile:classe-live': JSON.stringify({ age: 14, kit: 'advanced', competence: 'expert' }),
      'elab-percorso-session-state': 'verifica',
    };
    mockStorageEntries(entries);

    render(<PercorsoCapitoloView capitolo={capitolo} />);

    await waitFor(() => {
      expect(screen.getByTestId('percorso-morphic-root')).toHaveAttribute('data-teacher-profile', 'esperto');
    });
    expect(screen.getByTestId('percorso-morphic-root')).toHaveAttribute('data-session-state', 'verifica');
    expect(screen.getByTestId('morphic-example-count')).toHaveTextContent('1');

    entries['elab-morphic-teacher-profile:teacher-live'] = JSON.stringify({ experience: 'first_year' });
    entries['elab-morphic-class-profile:classe-live'] = JSON.stringify({ age: 8, kit: 'base', competence: 'novice' });
    entries['elab-percorso-session-state'] = 'costruzione';
    window.dispatchEvent(new CustomEvent('elab:percorso-morphic-context-changed'));

    await waitFor(() => {
      expect(screen.getByTestId('percorso-morphic-root')).toHaveAttribute('data-teacher-profile', 'primo-anno');
    });
    expect(screen.getByTestId('percorso-morphic-root')).toHaveAttribute('data-session-state', 'costruzione');
    expect(screen.getByTestId('morphic-example-count')).toHaveTextContent('3');
    expect(screen.getByTestId('morphic-microsteps')).toHaveTextContent(/espansa/i);
  });

  it('morfizza il pannello Percorso sui segnali live di scrittura, montaggio, latenza e memoria', async () => {
    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

    const root = screen.getByTestId('percorso-morphic-root');
    const firstInstance = root.getAttribute('data-morphic-instance');
    expect(firstInstance).toMatch(/percorso-live-/);
    expect(screen.getByTestId('morphic-live-variation')).toHaveTextContent(/Ragazzi,/i);

    act(() => {
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'text',
          value: 'Uno studente scrive che il LED non si accende',
        },
      }));
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'mounting',
          value: 'LED forse invertito sulla breadboard',
        },
      }));
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'latency',
          latencyMs: 1850,
        },
      }));
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'screenshot',
          value: 'jumper sulla riga accanto',
        },
      }));
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'audio',
          value: 'il docente chiede un controllo piu lento',
        },
      }));
      window.dispatchEvent(new CustomEvent('elab:percorso-live-signal', {
        detail: {
          source: 'past_lesson',
          value: 'La classe ha gia sbagliato due volte la polarita LED',
        },
      }));
    });

    await waitFor(() => {
      expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/scrittura/i);
    });
    expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/montaggio/i);
    expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/latenza alta/i);
    expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/screenshot/i);
    expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/audio/i);
    expect(screen.getByTestId('percorso-live-regia')).toHaveTextContent(/lezioni passate/i);
    expect(screen.getByTestId('percorso-live-next-action')).toHaveTextContent(/Ragazzi,/i);
    expect(screen.getByTestId('percorso-live-next-action')).toHaveTextContent(/kit fisico ELAB/i);
    expect(screen.getByTestId('percorso-live-next-action')).toHaveTextContent(/Vol\.1 pag\.27/i);
  });

  it('ogni riapertura del pannello Percorso ha identita live e micro-regia diverse', () => {
    const first = render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);
    const firstRoot = screen.getByTestId('percorso-morphic-root');
    const firstInstance = firstRoot.getAttribute('data-morphic-instance');
    const firstVariation = screen.getByTestId('morphic-live-variation').textContent;
    expect(firstVariation).toMatch(/Ragazzi,/i);
    expect(screen.getAllByText(/Vol\.1 pag\.27|Vol\.\s*1\s*pag\.\s*27/i).length).toBeGreaterThanOrEqual(1);

    first.unmount();

    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);
    const secondRoot = screen.getByTestId('percorso-morphic-root');
    const secondInstance = secondRoot.getAttribute('data-morphic-instance');
    const secondVariation = screen.getByTestId('morphic-live-variation').textContent;

    expect(secondInstance).not.toBe(firstInstance);
    expect(secondVariation).not.toBe(firstVariation);
    expect(secondVariation).toMatch(/Ragazzi,/i);
    expect(screen.getAllByText(/kit fisico/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Vol\.1 pag\.27|Vol\.\s*1\s*pag\.\s*27/i).length).toBeGreaterThanOrEqual(1);
  });

  it('morfizza anche quantita di testo corretto e numero di slide del pannello', () => {
    const expert = render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={expertContext} />);

    expect(screen.getByTestId('percorso-writing-budget')).toHaveTextContent(/1 frase/i);
    expect(screen.getByTestId('percorso-slide-budget')).toHaveTextContent(/1 slide/i);
    expect(screen.getByTestId('percorso-writing-budget')).toHaveTextContent(/Vol\.1 pag\.27/i);

    expert.unmount();

    render(<PercorsoCapitoloView capitolo={capitolo} morphicContext={firstYearContext} />);

    expect(screen.getByTestId('percorso-writing-budget')).toHaveTextContent(/7 frasi/i);
    expect(screen.getByTestId('percorso-slide-budget')).toHaveTextContent(/4 slide/i);
    expect(screen.getByTestId('percorso-writing-budget')).toHaveTextContent(/solo dal percorso ELAB/i);
    expect(screen.getByTestId('percorso-slide-budget')).toHaveTextContent(/kit fisico ELAB/i);
  });
});
