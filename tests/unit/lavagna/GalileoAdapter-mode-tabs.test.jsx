import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react';

vi.mock('../../../src/components/lavagna/FloatingWindow', () => ({
  default: ({ title, children }) => (
    <section data-testid="mock-floating-window" aria-label={title}>{children}</section>
  ),
}));

vi.mock('../../../src/components/tutor/ChatOverlay', () => ({
  default: () => <div data-testid="mock-chat-overlay">Chat UNLIM</div>,
}));

const chatMock = {
    messages: [],
    input: 'Spiegami questo passaggio',
    setInput: vi.fn(),
    setMessages: vi.fn(),
    handleSend: vi.fn(),
    isLoading: false,
    handleRetry: vi.fn(),
    quickActions: [],
    circuitStateRef: { current: null },
    handleScreenshot: vi.fn(),
};

vi.mock('../../../src/components/lavagna/useGalileoChat', () => ({
  default: () => chatMock,
}));

vi.mock('../../../src/services/unlimMemory', () => ({
  default: {
    getProgress: vi.fn(() => Promise.resolve({ completedExperiments: [] })),
    getLastLesson: vi.fn(() => Promise.resolve(null)),
  },
}));

vi.mock('../../../src/services/voiceService', () => ({
  checkVoiceCapabilities: vi.fn(() => Promise.resolve({ stt: false, tts: false, microphone: false })),
  cancelRecording: vi.fn(),
  stopPlayback: vi.fn(),
}));

const experiment = {
  id: 'v1-cap6-primo-circuito',
  title: 'Il tuo primo circuito',
  desc: 'Accendere un LED con batteria e resistore.',
  steps: ['Prendete il resistore.', 'Collegate il LED.'],
  observe: 'Il LED si accende.',
  concept: 'La corrente deve avere un percorso chiuso.',
  buildSteps: [{ id: 'r1', instruction: 'Metti il resistore' }],
};

async function renderMode(activeTab) {
  window.__ELAB_API = {
    getCurrentExperiment: () => experiment,
    on: vi.fn(),
    off: vi.fn(),
  };
  const { default: GalileoAdapter } = await import('../../../src/components/lavagna/GalileoAdapter.jsx');
  return render(<GalileoAdapter visible activeTab={activeTab} onClose={() => {}} />);
}

describe('GalileoAdapter mode tabs', () => {
  beforeEach(() => {
    cleanup();
    delete window.__ELAB_API;
    chatMock.input = 'Spiegami questo passaggio';
    chatMock.setInput.mockClear();
    chatMock.handleSend.mockClear();
  });

  afterEach(() => {
    cleanup();
    delete window.__ELAB_API;
  });

  it('renders Percorso content instead of a blank UNLIM panel', async () => {
    await renderMode('percorso');
    expect(await screen.findByText(/Percorso non disponibile|Fase 1/i)).toBeInTheDocument();
    expect(document.body.textContent.trim().length).toBeGreaterThan(40);
  });

  it('keeps a writable UNLIM input inside Percorso and sends to chat', async () => {
    await renderMode('percorso');
    const input = await screen.findByLabelText(/Scrivi messaggio a UNLIM nel percorso/i);
    expect(input).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('form', { name: /Scrivi a UNLIM nel percorso/i }));
    expect(chatMock.setInput).toHaveBeenCalledWith('');
    expect(chatMock.handleSend).toHaveBeenCalledWith('Spiegami questo passaggio');
  });

  it('legacy Guida tab falls back to chat so Passo Passo is only ComponentDrawer', async () => {
    const view = await renderMode('guida');
    expect(await within(view.container).findByTestId('mock-chat-overlay')).toBeInTheDocument();
  });

  it('legacy Diagnosi tab falls back to chat so UNLIM remains conversational', async () => {
    const view = await renderMode('diagnosi');
    expect(await within(view.container).findByTestId('mock-chat-overlay')).toBeInTheDocument();
  });
});
