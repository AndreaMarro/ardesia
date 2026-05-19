import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code, onChange, language, hideFooter }) => (
    <textarea
      data-testid="mock-code-editor"
      data-language={language}
      data-hide-footer={String(hideFooter)}
      aria-label="Editor C++"
      value={code}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock('../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: ({ onChange, initialCode }) => (
    <button
      data-testid="mock-blockly"
      data-initial-code={initialCode || ''}
      onClick={() => onChange?.('<xml><block type="arduino_base" /></xml>', 'void setup() {}\nvoid loop() {}')}
    >
      Area blocchi
    </button>
  ),
}));

import IdeShell from '../../../src/components/ide/IdeShell';
import CompileButton from '../../../src/components/ide/CompileButton';
import ModeSwitcher from '../../../src/components/ide/ModeSwitcher';
import StatusBar from '../../../src/components/ide/StatusBar';

const defaultSource = 'void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n}';

beforeEach(() => {
  vi.useFakeTimers();
  window.localStorage.getItem.mockReturnValue(null);
  fetch.mockReset();
  delete window.__ELAB_IDE_SYNC__;
});

afterEach(() => {
  try {
    vi.runOnlyPendingTimers();
  } catch {
    // Alcuni test tornano a timer reali per attese fetch.
  }
  vi.useRealTimers();
});

describe('IdeShell C++ first', () => {
  it('usa cpp come modalita predefinita e la persiste su localStorage', () => {
    render(<IdeShell />);
    expect(screen.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'cpp');
    expect(screen.getByTestId('mock-code-editor')).toHaveAttribute('data-language', 'cpp');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('elab.ide.mode', 'cpp');
  });

  it('ripristina la modalita salvata blocks', async () => {
    vi.useRealTimers();
    window.localStorage.getItem.mockReturnValue('blocks');
    render(<IdeShell />);
    expect(screen.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'blocks');
    expect(screen.queryByTestId('mock-code-editor')).toBeNull();
    expect(await screen.findByTestId('mock-blockly')).toBeInTheDocument();
  });

  it('ignora valori localStorage non validi e resta su cpp', () => {
    window.localStorage.getItem.mockReturnValue('legacy');
    render(<IdeShell />);
    expect(screen.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'cpp');
  });

  it('ModeSwitcher mostra tre pulsanti in italiano e cambia stato', () => {
    render(<IdeShell />);
    fireEvent.click(screen.getByRole('button', { name: 'Blocchi' }));
    expect(screen.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'blocks');
    fireEvent.click(screen.getByRole('button', { name: 'Vista doppia' }));
    expect(screen.getByTestId('ide-shell')).toHaveAttribute('data-mode', 'dual');
    expect(window.localStorage.setItem).toHaveBeenLastCalledWith('elab.ide.mode', 'dual');
  });

  it('in modalita dual mostra editor e blocchi insieme', async () => {
    vi.useRealTimers();
    window.localStorage.getItem.mockReturnValue('dual');
    render(<IdeShell />);
    expect(screen.getByTestId('mock-code-editor')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-blockly')).toBeInTheDocument();
    expect(screen.getByTestId('editor-pane')).toHaveAttribute('data-mode', 'dual');
  });

  it('passa CodeEditorCM6 con language cpp e footer interno nascosto', () => {
    render(<IdeShell />);
    const editor = screen.getByTestId('mock-code-editor');
    expect(editor).toHaveAttribute('data-language', 'cpp');
    expect(editor).toHaveAttribute('data-hide-footer', 'true');
  });

  it('debounce cpp change -> parse AST -> generate Blockly dopo 500ms', async () => {
    const parseCppToAst = vi.fn((source) => ({ kind: 'Program', source }));
    const astToBlocklyXml = vi.fn(() => '<xml><block type="arduino_base" /></xml>');
    window.__ELAB_IDE_SYNC__ = { parseCppToAst, astToBlocklyXml };
    render(<IdeShell initialCpp={defaultSource} />);

    fireEvent.change(screen.getByTestId('mock-code-editor'), { target: { value: 'void setup() {}' } });
    expect(parseCppToAst).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(500); });

    expect(parseCppToAst).toHaveBeenCalledWith('void setup() {}');
    expect(astToBlocklyXml).toHaveBeenCalledWith({ kind: 'Program', source: 'void setup() {}' });
  });

  it('debounce blockly change -> parse AST -> generate cpp dopo 500ms', async () => {
    vi.useRealTimers();
    const parseBlocklyToAst = vi.fn((xml) => ({ kind: 'Blocks', xml }));
    const astToCpp = vi.fn(() => 'void setup() {}\nvoid loop() {}');
    window.__ELAB_IDE_SYNC__ = { parseBlocklyToAst, astToCpp };
    window.localStorage.getItem.mockReturnValue('blocks');
    render(<IdeShell initialCpp={defaultSource} />);

    const blockly = await screen.findByTestId('mock-blockly');
    vi.useFakeTimers();
    fireEvent.click(blockly);
    await act(async () => { vi.advanceTimersByTime(500); });

    expect(parseBlocklyToAst).toHaveBeenCalledWith('<xml><block type="arduino_base" /></xml>');
    expect(astToCpp).toHaveBeenCalledWith({ kind: 'Blocks', xml: '<xml><block type="arduino_base" /></xml>' });
  });

  it('CompileButton invia POST a /api/compile/nanor4 con sorgente corrente e aggiorna stato ok', async () => {
    vi.useRealTimers();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, size: { bytes: 812, total: 98304, percent: 1 } }),
    });
    render(<IdeShell initialCpp={defaultSource} />);

    fireEvent.click(screen.getByRole('button', { name: /compila/i }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(fetch).toHaveBeenCalledWith('/api/compile/nanor4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: defaultSource }),
    });
    await screen.findByText(/Compilazione riuscita/);
    expect(screen.queryByText(/Caricato/i)).toBeNull();
  });

  it('CompileButton mostra errore compatto quando la compilazione fallisce', async () => {
    vi.useRealTimers();
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'expected ; before }' }),
    });
    render(<IdeShell />);

    fireEvent.click(screen.getByRole('button', { name: /compila/i }));
    await screen.findByText(/Errore compilazione/);
    expect(screen.getByRole('status')).toHaveTextContent('expected ; before }');
  });
});

describe('Componenti IDE isolati', () => {
  it('ModeSwitcher espone stato selezionato accessibile', () => {
    const onModeChange = vi.fn();
    render(<ModeSwitcher mode="cpp" onModeChange={onModeChange} />);
    expect(screen.getByRole('button', { name: 'C++' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Vista doppia' }));
    expect(onModeChange).toHaveBeenCalledWith('dual');
  });

  it('StatusBar rende pronto, loading, ok ed errore senza testo Caricato', () => {
    const { rerender } = render(<StatusBar status={{ state: 'idle' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Pronto');
    rerender(<StatusBar status={{ state: 'loading' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Compilazione in corso');
    rerender(<StatusBar status={{ state: 'success', size: { bytes: 128, total: 98304, percent: 1 } }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Compilazione riuscita');
    expect(screen.queryByText(/Caricato/i)).toBeNull();
    rerender(<StatusBar status={{ state: 'error', message: 'errore' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Errore compilazione');
  });

  it('CompileButton protegge dal doppio click durante loading', async () => {
    vi.useRealTimers();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, size: { bytes: 1, total: 98304, percent: 1 } }),
    });
    render(<CompileButton source="void setup() {}" onStatusChange={() => {}} />);
    const button = screen.getByRole('button', { name: /compila/i });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });
});
