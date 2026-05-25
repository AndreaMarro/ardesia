import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import SessionReportComic from '../../../src/components/lavagna/SessionReportComic';
import SessionReportComicModal from '../../../src/components/lavagna/SessionReportComicModal';

const { routeImageGenMock } = vi.hoisted(() => ({
  routeImageGenMock: vi.fn(),
}));

vi.mock('../../../src/services/multimodalRouter', () => ({
  multimodalRouter: {
    routeImageGen: routeImageGenMock,
  },
}));

const mockSession = {
  studentAlias: 'S001',
  startedAt: '2026-04-19T09:00:00Z',
  endedAt: '2026-04-19T10:30:00Z',
  experimentsCompleted: [
    { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
    { id: 'v1-cap6-esp2', title: 'LED + Resistore', volume: 1 },
    { id: 'v1-cap7-esp1', title: 'LED RGB', volume: 1 },
  ],
  narrations: {
    'v1-cap6-esp1': 'Ragazzi, abbiamo acceso il primo LED con 470 ohm — come una porta che si apre!',
    'v1-cap6-esp2': 'Il resistore protegge il LED dalla corrente — come un filtro nel rubinetto.',
    'v1-cap7-esp1': 'Con 3 canali PWM mescoliamo colori — come una palette del pittore.',
  },
};

describe('SessionReportComic — Fumetto Report MVP', () => {
  beforeEach(() => cleanup());
  afterEach(() => {
    delete window.__ELAB_API;
    window.location.hash = '';
    routeImageGenMock.mockReset();
    cleanup();
  });

  it('renders header with session date', () => {
    render(<SessionReportComic session={mockSession} />);
    expect(screen.getByText(/19\/4\/2026|19\/04\/2026/)).toBeInTheDocument();
  });

  it('renders student alias in header', () => {
    render(<SessionReportComic session={mockSession} />);
    expect(screen.getByText(/S001/)).toBeInTheDocument();
  });

  it('renders 6 vignette slots as a complete narrative arc', () => {
    render(<SessionReportComic session={mockSession} />);
    const vignettes = screen.getAllByRole('figure');
    expect(vignettes.length).toBe(6);
    expect(screen.queryByText(/Prossimo esperimento/i)).not.toBeInTheDocument();
  });

  it('renders a single completed experiment across all 6 arc panels', () => {
    render(
      <SessionReportComic
        session={{
          ...mockSession,
          experimentsCompleted: [
            { id: 'v1-cap6-esp1', title: 'Accendi il LED', volume: 1 },
          ],
        }}
      />
    );

    expect(screen.getAllByRole('figure')).toHaveLength(6);
    expect(screen.getAllByText(/Accendi il LED/i).length).toBeGreaterThanOrEqual(6);
    expect(screen.queryByText(/Prossimo esperimento/i)).not.toBeInTheDocument();
  });

  it('shows narration text for each completed vignette', () => {
    render(<SessionReportComic session={mockSession} />);
    expect(screen.getByText(/acceso il primo LED/i)).toBeInTheDocument();
    expect(screen.getByText(/resistore protegge/i)).toBeInTheDocument();
    expect(screen.getAllByText(/mescoliamo colori/i).length).toBeGreaterThan(0);
  });

  it('Principio Zero v3: "Ragazzi" present in narrations', () => {
    render(<SessionReportComic session={mockSession} />);
    const ragazzi = screen.getAllByText(/Ragazzi/i);
    expect(ragazzi.length).toBeGreaterThan(0);
  });

  it('Principio Zero v3: NO "Docente leggi" text anywhere', () => {
    render(<SessionReportComic session={mockSession} />);
    const body = document.body.textContent || '';
    expect(body).not.toMatch(/Docente,?\s*leggi/i);
    expect(body).not.toMatch(/Insegnante,?\s*leggi/i);
  });

  it('renders export PDF button with WCAG accessible label', () => {
    render(<SessionReportComic session={mockSession} />);
    expect(screen.getByRole('button', { name: /Scarica PDF|Stampa/i })).toBeInTheDocument();
  });

  it('calls onExport when export button clicked', () => {
    const onExport = vi.fn();
    render(<SessionReportComic session={mockSession} onExport={onExport} />);
    fireEvent.click(screen.getByRole('button', { name: /Scarica PDF|Stampa/i }));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('generates six session-specific panel images through the imagegen route', async () => {
    routeImageGenMock.mockResolvedValue({
      ok: true,
      data: { image: 'data:image/png;base64,ZmFrZS1lbGFi' },
    });

    render(<SessionReportComic session={mockSession} />);
    fireEvent.click(screen.getByRole('button', { name: /Genera immagini del fumetto dalla sessione/i }));

    await waitFor(() => expect(routeImageGenMock).toHaveBeenCalledTimes(6));
    expect(routeImageGenMock.mock.calls[0][0].prompt).toMatch(/kit fisico|ELAB Tea flat vector/i);
    expect(routeImageGenMock.mock.calls[0][1].sessionId).toMatch(/fs-[a-f0-9]{8}-panel-1/i);
    expect(screen.getByTestId('session-report-comic-imagegen-status')).toHaveTextContent(/Immagini generate: 6\/6/i);
    expect(screen.getAllByRole('img', { name: /Immagine generata per/i })).toHaveLength(6);
  });

  it('keeps the comic usable when image generation is unavailable', async () => {
    routeImageGenMock.mockResolvedValue({
      ok: false,
      provider: 'cloudflare-deferred',
      data: null,
    });

    render(<SessionReportComic session={mockSession} />);
    fireEvent.click(screen.getByRole('button', { name: /Genera immagini del fumetto dalla sessione/i }));

    await waitFor(() => expect(routeImageGenMock).toHaveBeenCalledTimes(6));
    expect(screen.getByTestId('session-report-comic-imagegen-status')).toHaveTextContent(/non disponibile/i);
    expect(screen.getAllByRole('figure')).toHaveLength(6);
  });

  it('does not claim Gemini ready when the draft is rejected by grounding checks', () => {
    render(
      <SessionReportComic
        session={{
          ...mockSession,
          fumettoGeminiStatus: 'ready',
          geminiDraft: {
            storyline: { problem: 'Il motore ha girato', contextWarnings: [] },
            panels: [{ role: 'problema', caption: 'Ragazzi, il motore ha girato.' }],
            imagePrompts: [],
          },
        }}
      />
    );

    expect(screen.getByTestId('session-report-comic-gemini-status')).toHaveTextContent(/scartata/i);
    expect(screen.getByTestId('session-report-comic-gemini-status')).not.toHaveTextContent(/pronta/i);
  });

  it('falls back to window.print when onExport is missing', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<SessionReportComic session={mockSession} />);
    fireEvent.click(screen.getByRole('button', { name: /Scarica PDF|Stampa/i }));
    expect(printSpy).toHaveBeenCalledOnce();
    printSpy.mockRestore();
  });

  it('handles empty session (zero experiments) without crash', () => {
    const empty = { studentAlias: 'S002', startedAt: '2026-04-19T09:00:00Z', experimentsCompleted: [], narrations: {} };
    render(<SessionReportComic session={empty} />);
    const vignettes = screen.getAllByRole('figure');
    expect(vignettes.length).toBe(6);
  });

  it('handles missing narrations gracefully', () => {
    const noNarr = { ...mockSession, narrations: {} };
    render(<SessionReportComic session={noNarr} />);
    expect(screen.getAllByText(/Accendi il LED/i).length).toBeGreaterThan(0);
  });

  it('renders a photo placeholder when a session experiment has no usable asset', () => {
    render(
      <SessionReportComic
        session={{
          ...mockSession,
          experimentsCompleted: [
            { id: 'custom-no-photo', title: 'Esperimento senza foto', volume: 99 },
          ],
          narrations: {},
        }}
      />
    );
    expect(screen.getAllByText(/Esperimento senza foto/i).length).toBeGreaterThan(0);
  });

  it('falls back to an in-card placeholder when the mapped photo asset fails to load', () => {
    render(<SessionReportComic session={mockSession} />);
    const image = screen.getByRole('img', { name: /Foto esperimento: Accendi il LED/i });

    fireEvent.error(image);

    expect(screen.queryByRole('img', { name: /Foto esperimento: Accendi il LED/i })).not.toBeInTheDocument();
    expect(screen.getAllByText(/Accendi il LED/i).length).toBeGreaterThan(0);
  });

  it('keeps the next-experiment CTA hidden while Percorso is in standby', () => {
    const mountExperiment = vi.fn();
    const onMountNextExperiment = vi.fn();
    window.__ELAB_API = { unlim: { mountExperiment } };

    render(
      <SessionReportComic
        onMountNextExperiment={onMountNextExperiment}
        session={{
          ...mockSession,
          savedAt: '2026-04-19T10:30:00Z',
          next_experiment: {
            id: 'v1-cap6-esp2',
            title: 'LED senza resistore (cosa NON fare!)',
            preview: 'Il LED è in pericolo se manca il resistore del kit fisico.',
          },
        }}
      />
    );

    expect(screen.queryByTestId('session-report-comic-cliffhanger')).not.toBeInTheDocument();
    expect(mountExperiment).not.toHaveBeenCalled();
    expect(onMountNextExperiment).not.toHaveBeenCalled();
  });

  it('does not mount a next experiment from the comic while standby is active', () => {
    const mountExperiment = vi.fn();
    window.__ELAB_API = { mountExperiment };

    render(
      <SessionReportComic
        session={{
          ...mockSession,
          savedAt: '2026-04-19T10:30:00Z',
          next_experiment: {
            id: 'v1-cap6-esp2',
            title: 'LED senza resistore',
            preview: 'Ragazzi, ripartiamo dal resistore del kit fisico.',
          },
        }}
      />
    );

    expect(screen.queryByTestId('session-report-comic-cliffhanger')).not.toBeInTheDocument();
    expect(mountExperiment).not.toHaveBeenCalled();
  });

  it('does not render malformed next experiment CTA while Percorso is hidden', () => {
    render(
      <SessionReportComic
        session={{
          ...mockSession,
          savedAt: '2026-04-19T10:30:00Z',
          next_experiment: {
            id: 'next-free-lab',
            title: 'Laboratorio libero',
          },
        }}
      />
    );

    expect(screen.queryByTestId('session-report-comic-cliffhanger')).not.toBeInTheDocument();
  });

  it('renders canonical UNLIM mascot, didactic exercises, notes, and session fingerprint', () => {
    render(
      <SessionReportComic
        session={{
          ...mockSession,
          classKey: 'classe-fumetto',
          componentsUsed: ['LED rosso', 'resistore 470 Ohm', 'breadboard'],
          studentJourney: {
            mistakesMade: [{ description: 'LED girato al contrario' }],
            mistakesOvercome: ['LED girato al contrario'],
            helpRequestsCount: 1,
          },
        }}
      />
    );

    expect(screen.getByTestId('session-report-comic-mascot')).toHaveTextContent(/UNLIM/i);
    expect(screen.getByTestId('session-report-comic-mascot')).toHaveAccessibleName(/UNLIM mascotte canonica ELAB/i);
    expect(screen.getByTestId('unlim-mascotte')).toHaveAccessibleName(/UNLIM mascotte canonica Tea/i);
    expect(screen.getByTestId('session-report-comic-exercises')).toHaveTextContent(/kit fisico/i);
    expect(screen.getByTestId('session-report-comic-exercises')).toHaveTextContent(/resistore 470 Ohm/i);
    expect(screen.getByTestId('session-report-comic-quiz')).toHaveTextContent(/Domande a crocette/i);
    expect(screen.getByTestId('session-report-comic-quiz')).toHaveTextContent(/LED girato al contrario/i);
    expect(screen.getByTestId('session-report-comic-notes')).toHaveTextContent(/Spazio appunti/i);
    expect(screen.getByTestId('session-report-comic-notes')).toHaveTextContent(/LED girato al contrario/i);
    expect(screen.getByTestId('session-report-comic-diary')).toHaveTextContent(/Pagina diario/i);
    expect(screen.getByTestId('session-report-comic-diary')).toHaveTextContent(/Vol\.1 pag\./i);
    expect(screen.getByText(/Traccia sessione:/i)).toBeInTheDocument();
  });

  it('wraps the comic in an accessible modal and closes after next experiment mount', () => {
    const onClose = vi.fn();
    const onMountNextExperiment = vi.fn();
    const mountExperiment = vi.fn();
    window.__ELAB_API = { unlim: { mountExperiment } };

    render(
      <SessionReportComicModal
        onClose={onClose}
        onMountNextExperiment={onMountNextExperiment}
        session={{
          ...mockSession,
          savedAt: '2026-04-19T10:30:00Z',
          next_experiment: {
            id: 'v1-cap6-esp2',
            title: 'LED senza resistore',
            preview: 'Ragazzi, il kit fisico chiede cosa succede senza resistore.',
          },
        }}
      />
    );

    expect(screen.getByRole('dialog', { name: /Fumetto ELAB generato dalla sessione/i })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    expect(mountExperiment).not.toHaveBeenCalled();
    expect(onMountNextExperiment).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('unlocks page scroll when the modal is closed or unmounted', () => {
    const onClose = vi.fn();
    const { unmount } = render(<SessionReportComicModal session={mockSession} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Chiudi fumetto ELAB/i }));
    expect(onClose).toHaveBeenCalledOnce();

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
