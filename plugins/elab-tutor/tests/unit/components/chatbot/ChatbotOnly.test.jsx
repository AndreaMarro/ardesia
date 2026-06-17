/**
 * ChatbotOnly tests — Sprint T iter 37 Atom A6 (WebDesigner-1)
 *
 * Coverage: render shell + sidebar (empty + sessions) + tools palette buttons +
 * back home + new chat + reset + a11y (role + aria-label).
 *
 * useGalileoChat hook is mocked to keep the unit test fast/isolated and avoid
 * pulling in services/api + Supabase + RAG dependencies that depend on env.
 *
 * Iter 64 T2 Lighthouse perf optim (Sprint U):
 *   Chat panel is now React.lazy() + Suspense, so chat-internal selectors
 *   (chatbot-bubble-assistant, chatbot-input, chatbot-send-btn) require
 *   `findBy*` async API to wait for the lazy chunk to resolve. The mocked
 *   hook resolves synchronously inside the lazy module so the wait is just
 *   a microtask flush — total runtime delta < 5ms.
 *
 * Andrea Marro — iter 37 — 2026-04-30 — iter 64 lazy split 2026-05-15
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock useGalileoChat default export to keep the test pure unit.
vi.mock('../../../../src/components/lavagna/useGalileoChat.js', () => ({
  default: () => ({
    messages: [
      { id: 'welcome', role: 'assistant', content: 'Ciao Ragazzi! Sono UNLIM.' },
    ],
    input: '',
    isLoading: false,
    setInput: vi.fn(),
    handleSend: vi.fn(),
    handleReset: vi.fn(),
  }),
}));

import ChatbotOnly from '../../../../src/components/chatbot/ChatbotOnly.jsx';

// localStorage in tests/setup.js is vi.fn() mock — install real backing.
function installLocalStorageBacking() {
  const store = new Map();
  window.localStorage.getItem.mockImplementation((key) => store.has(key) ? store.get(key) : null);
  window.localStorage.setItem.mockImplementation((key, val) => { store.set(key, String(val)); });
  window.localStorage.removeItem.mockImplementation((key) => { store.delete(key); });
  window.localStorage.clear.mockImplementation(() => { store.clear(); });
  return store;
}

describe('ChatbotOnly', () => {
  beforeEach(() => {
    installLocalStorageBacking();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the chatbot shell with sidebar + main + tools', () => {
    render(<ChatbotOnly />);
    expect(screen.getByTestId('chatbot-only-shell')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-tools-palette')).toBeInTheDocument();
  });

  it('renders sidebar empty state with plurale + kit mention when no sessions', () => {
    render(<ChatbotOnly />);
    const empty = screen.getByTestId('chatbot-sidebar-empty');
    expect(empty.textContent).toMatch(/Ragazzi/);
    expect(empty.textContent).toMatch(/kit ELAB/i);
  });

  it('renders the New Chat button with plurale aria-label', () => {
    render(<ChatbotOnly />);
    const btn = screen.getByTestId('chatbot-new-chat-btn');
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute('aria-label')).toMatch(/Ragazzi|nuova chat/i);
  });

  it('renders 5 tool buttons in palette (Vision/Compile/Fumetto/Lavagna/Reset)', () => {
    render(<ChatbotOnly />);
    expect(screen.getByTestId('chatbot-tool-vision')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-tool-compile')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-tool-fumetto')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-tool-lavagna')).toBeInTheDocument();
    expect(screen.getByTestId('chatbot-tool-reset')).toBeInTheDocument();
  });

  it('tool buttons have plurale "Ragazzi" tooltip aria-label', () => {
    render(<ChatbotOnly />);
    const visionBtn = screen.getByTestId('chatbot-tool-vision');
    expect(visionBtn.getAttribute('aria-label')).toMatch(/Ragazzi/);
  });

  it('renders back-home button and triggers onBackHome on click', () => {
    const onBackHome = vi.fn();
    render(<ChatbotOnly onBackHome={onBackHome} />);
    fireEvent.click(screen.getByTestId('chatbot-back-home'));
    expect(onBackHome).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenLavagna when Lavagna mini tool button clicked', () => {
    const onOpenLavagna = vi.fn();
    render(<ChatbotOnly onOpenLavagna={onOpenLavagna} />);
    fireEvent.click(screen.getByTestId('chatbot-tool-lavagna'));
    expect(onOpenLavagna).toHaveBeenCalledTimes(1);
  });

  it('renders welcome assistant bubble from useGalileoChat', async () => {
    render(<ChatbotOnly />);
    const bubble = await screen.findByTestId('chatbot-bubble-assistant');
    expect(bubble.textContent).toMatch(/Ciao Ragazzi/);
  });

  it('renders chat input with plurale + kit ELAB placeholder', async () => {
    render(<ChatbotOnly />);
    const input = await screen.findByTestId('chatbot-input');
    expect(input.getAttribute('placeholder')).toMatch(/Ragazzi/);
    expect(input.getAttribute('placeholder')).toMatch(/kit ELAB/i);
  });

  it('renders Send button disabled when input is empty', async () => {
    render(<ChatbotOnly />);
    const sendBtn = await screen.findByTestId('chatbot-send-btn');
    expect(sendBtn).toBeDisabled();
  });

  it('renders chat header with mascotte avatar + sub-title plurale', () => {
    render(<ChatbotOnly />);
    const main = screen.getByLabelText('Conversazione UNLIM');
    expect(main.textContent).toMatch(/UNLIM/);
    expect(main.textContent).toMatch(/Ragazzi/);
  });

  it('renders sessions when localStorage has elab_unlim_sessions', () => {
    const sessions = [
      {
        id: 'sess-1',
        experimentId: 'v1-cap6-esp1',
        title: 'LED rosso prima accensione',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        description_unlim: 'Sessione di prova plurale',
        messages: [{ id: 1 }, { id: 2 }],
      },
    ];
    localStorage.setItem('elab_unlim_sessions', JSON.stringify(sessions));
    render(<ChatbotOnly />);
    const items = screen.getAllByTestId('chatbot-history-item');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].textContent).toMatch(/LED rosso/);
  });
});
