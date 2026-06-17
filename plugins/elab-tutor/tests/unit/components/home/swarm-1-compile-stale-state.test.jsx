/**
 * tests/unit/components/home/swarm-1-compile-stale-state.test.jsx
 *
 * SWARM 1 regression — Andrea verbatim 2026-05-29:
 *   "succede niente se cambi i blocchi o codice e puoi compilare e caricare
 *    una sola volta."
 *
 * Root cause confirmed by Swarm 1 debugger pass: HomeCompileEntry was
 * passing the `blocklyXml` state directly to ScratchEditor as `initialCode`.
 * Every Blockly user-edit fires onChange → setBlocklyXml(newXml) → re-render
 * → ScratchEditor.useEffect[initialCode] (panels/ScratchEditor.jsx:548-581)
 * runs workspace.clear() + reload from newXml + synthetic onChange. Visible
 * effect: workspace remounts on EVERY user edit ("sembra che succeda niente")
 * → user cannot produce a meaningful second compile.
 *
 * FIX (HomeCompileEntry.jsx ONLY — file ownership respected):
 *   - blocklyInitialCodeRef pins the initialCode prop to a stable value
 *   - blocklyEditorKey bumps to force a clean remount when an intentional
 *     re-seed happens (e.g. C++ → Blocks mode switch)
 *   - User-edits keep `blocklyXml` state for code preview/cppToBlocklyXml use
 *     but NEVER flow back into ScratchEditor as initialCode
 *
 * REGRESSION GUARANTEES locked here:
 *   A. First compile cycle + edit blocks + second compile → second
 *      compileCode call receives the NEW code (not the stale first-compile
 *      code) AND compiledHex propagates fresh to UniversalUploadButton.
 *   B. ScratchEditor's mount-time initialCode is taken from the ref, NOT
 *      from blocklyXml state. After multiple onChange emissions, no remount,
 *      no useEffect re-run on initialCode → feedback loop broken.
 *   C. C++ → Blocks mode switch triggers an intentional remount (key bump)
 *      so the cppToBlocklyXml output reaches the workspace cleanly.
 *   D. compileStatus transitions success → compiling → success on second
 *      cycle (not stuck after first compile).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';

// ── i18n stub ────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'it', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ── ScratchEditor stub that mirrors the REAL ScratchEditor.jsx:548-581
// useEffect[initialCode] behavior. The real editor calls workspace.clear()
// + reload + synthetic onChange whenever the `initialCode` prop changes
// (mount OR re-render with new value). This stub records EVERY initialCode
// it receives via prop, so the test can detect the previous feedback loop:
// if `initialCode` flows back into the editor on every user onChange, this
// list grows on every edit. After the fix it should only grow on
// intentional re-seeds (mount, mode switch).
const initialCodeReceived = [];
let mountCount = 0;
let lastSeenInitialCode = null;
vi.mock('../../../../src/components/simulator/panels/ScratchEditor', () => ({
  default: function ScratchEditorStub({ initialCode, onChange, onWorkspaceReady, onBlockCountChange }) {
    // First-mount effect — records the initialCode at mount + emits initial
    // onChange + wires up the test helper.
    React.useEffect(() => {
      mountCount += 1;
      lastSeenInitialCode = initialCode;
      initialCodeReceived.push({ kind: 'mount', mountIndex: mountCount, initialCode });
      onWorkspaceReady?.({ getTopBlocks: () => [], clear: () => {} });
      onBlockCountChange?.(0);
      onChange?.(initialCode || '<xml/>', 'void setup(){}\nvoid loop(){}\n');
      // eslint-disable-next-line no-restricted-globals
      window.__swarm1_emit = (xml, cpp) => act(() => { onChange?.(xml, cpp); });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Re-effect simulating the REAL ScratchEditor `useEffect[initialCode]`
    // at panels/ScratchEditor.jsx:548-581. The real editor wipes its
    // workspace + reloads from initialCode + emits a synthetic onChange
    // every time initialCode (prop) changes after mount. We emulate that
    // here. Pre-fix bug: every user edit caused setBlocklyXml → re-render
    // → new initialCode → THIS effect fires → workspace reload destroys
    // the user's edits. Post-fix: initialCode is pinned to a ref so this
    // effect fires only on intentional re-seeds (mode switch via key bump).
    const isFirstEffectRef = React.useRef(true);
    React.useEffect(() => {
      if (isFirstEffectRef.current) {
        isFirstEffectRef.current = false;
        return;
      }
      // Only count as "reload" when initialCode actually changed.
      if (initialCode === lastSeenInitialCode) return;
      lastSeenInitialCode = initialCode;
      initialCodeReceived.push({ kind: 'reload', mountIndex: mountCount, initialCode });
    }, [initialCode]);
    return React.createElement('div', {
      'data-testid': 'scratch-editor-stub',
      'data-initial-code-len': String((initialCode || '').length),
      'data-mount-count': String(mountCount),
    });
  },
}));

// ── ScratchCompileBar stub
vi.mock('../../../../src/components/simulator/panels/ScratchCompileBar', () => ({
  default: ({ onCompile, compilationStatus, boardId, compileButtonLabel }) =>
    React.createElement('div', {
      'data-testid': 'compile-bar-stub',
      'data-compile-status': compilationStatus || 'idle',
      'data-compile-board-id': boardId || '',
    }, React.createElement('button', {
      type: 'button',
      'data-testid': 'compile-button-stub',
      onClick: () => onCompile?.(),
    }, compileButtonLabel || 'Compila')),
  ScratchErrorBoundary: ({ children }) => React.createElement(React.Fragment, null, children),
}));

// ── Dependency stubs
vi.mock('../../../../src/components/HomePage/CompileAgentBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cab-stub' }),
}));
vi.mock('../../../../src/components/HomePage/WebUsbBanner', () => ({
  default: () => React.createElement('div', { 'data-testid': 'wub-stub' }),
}));
vi.mock('../../../../src/components/home/UnlimCompileHelper', () => ({
  default: () => React.createElement('div', { 'data-testid': 'unlim-helper-stub' }),
}));
vi.mock('../../../../src/components/home/HomeCompileOnboarding', () => ({
  default: () => null,
}));
vi.mock('../../../../src/components/simulator/panels/VirtualSerialMonitor', () => ({
  default: () => React.createElement('div', { 'data-testid': 'serial-stub' }),
}));
vi.mock('../../../../src/components/lavagna/BoardPicker', () => ({
  default: ({ boardId, onChange }) => React.createElement('select', {
    'data-testid': 'board-picker-stub',
    value: boardId || '',
    onChange: (e) => onChange?.(e.target.value),
  }, [
    React.createElement('option', { key: 'nano-r4', value: 'nano-r4' }, 'Arduino Nano R4'),
    React.createElement('option', { key: 'uno', value: 'uno' }, 'Arduino Uno R3'),
  ]),
}));
vi.mock('../../../../src/components/lavagna/UniversalUploadButton', () => ({
  default: ({ boardId, hexText }) => React.createElement('button', {
    type: 'button',
    'data-testid': `universal-upload-${boardId || 'none'}`,
    'data-hex-text-length': String((hexText || '').length),
    disabled: !hexText,
  }, 'Carica'),
}));
vi.mock('../../../../src/components/simulator/panels/CodeEditorCM6', () => ({
  default: ({ code, onChange }) => React.createElement('textarea', {
    'data-testid': 'code-editor-cm6-stub',
    value: code || '',
    onChange: (e) => onChange?.(e.target.value),
  }),
}));
vi.mock('../../../../src/features/elabBlocks/ui/ModeToggle.jsx', () => ({
  MODE_BLOCKS: 'blocks',
  MODE_CODE: 'code',
  ModeToggle: ({ activeMode, onModeChange }) => React.createElement('div', {
    'data-testid': 'mode-toggle-stub',
    'data-active-mode': activeMode,
  }, [
    React.createElement('button', {
      key: 'blocks',
      'data-testid': 'mode-toggle-blocks',
      onClick: () => onModeChange?.('blocks'),
    }, 'Blocchi'),
    React.createElement('button', {
      key: 'code',
      'data-testid': 'mode-toggle-code',
      onClick: () => onModeChange?.('code'),
    }, 'C++'),
  ]),
}));
vi.mock('../../../../src/features/elabBlocks/ui/ElabScratchModeShell.jsx', () => ({
  ElabScratchModeShell: ({ children }) => React.createElement('div', null, children),
}));
vi.mock('../../../../src/features/elabBlocks/starterTemplates.js', () => ({
  getStarterXml: () => '<xml><block type="arduino_base"/></xml>',
}));
vi.mock('../../../../src/features/elabBlocks/codeSync.js', () => ({
  NANO_R4_BLINK_CPP: 'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){}\n',
  cppToBlocklyXml: () => `<xml data-derived-from="cpp"><block type="arduino_base"/></xml>`,
}));
vi.mock('blockly', () => ({
  utils: { xml: { textToDom: () => ({}) } },
  Xml: { domToWorkspace: vi.fn() },
}));
vi.mock('../../../../src/utils/logger', () => ({
  default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));
vi.mock('../../../../src/utils/compileSizeParse', () => ({
  resolveCompileFlash: (result) => result?.success
    ? { flash: { used: 5544, total: 32256 }, sram: null }
    : null,
}));
const compileCodeMock = vi.fn();
vi.mock('../../../../src/services/api', () => ({
  compileCode: (...args) => compileCodeMock(...args),
}));
vi.mock('../../../../src/services/arduinoBoards', () => ({
  getBoardById: (id) => {
    if (id === 'uno') return { id: 'uno', label: 'Arduino Uno R3', fqbn: 'arduino:avr:uno' };
    if (id === 'nano-r4') return { id: 'nano-r4', label: 'Arduino Nano R4', fqbn: 'arduino:renesas_uno:nanor4' };
    return null;
  },
}));

async function loadEntry() {
  const { default: HomeCompileEntry } = await import('../../../../src/components/home/HomeCompileEntry');
  return HomeCompileEntry;
}

function clickCompile() {
  const btn = screen.getByTestId('compile-button-stub');
  return act(async () => { btn.click(); });
}

beforeEach(() => {
  compileCodeMock.mockReset();
  initialCodeReceived.length = 0;
  mountCount = 0;
  lastSeenInitialCode = null;
  // eslint-disable-next-line no-restricted-globals
  delete window.__swarm1_emit;
  try { window.localStorage.setItem('elab.compile.onboarded', 'true'); } catch (_) { /* noop */ }
});

describe('SWARM 1 — HomeCompileEntry one-shot compile/upload bug', () => {
  it('A: re-compile after first cycle picks up NEW Blockly-derived C++ (no stale closure)', async () => {
    const FIRST_CPP = 'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);}\n';
    const SECOND_CPP = 'void setup(){pinMode(7,OUTPUT);}\nvoid loop(){digitalWrite(7,LOW);}\n';

    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC\n:10000000FIRSTHEXAAAA',
      output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // eslint-disable-next-line no-restricted-globals
    window.__swarm1_emit('<xml><block type="blink13"/></xml>', FIRST_CPP);
    await clickCompile();
    await waitFor(() => {
      expect(screen.getByTestId('compile-bar-stub').getAttribute('data-compile-status')).toBe('success');
    });
    expect(compileCodeMock).toHaveBeenCalledTimes(1);
    expect(compileCodeMock.mock.calls[0][0]).toContain('pinMode(13,OUTPUT)');

    compileCodeMock.mockResolvedValueOnce({
      success: true,
      hex: ':020000020000FC\n:10000000SECONDHEXBBBB',
      output: 'Lo sketch usa 5600 byte. Il massimo è 32256 byte.',
      provider: 'cloud-renesas',
    });
    // eslint-disable-next-line no-restricted-globals
    window.__swarm1_emit('<xml><block type="blink7"/></xml>', SECOND_CPP);
    await clickCompile();
    await waitFor(() => {
      expect(compileCodeMock).toHaveBeenCalledTimes(2);
    });
    expect(compileCodeMock.mock.calls[1][0]).toContain('pinMode(7,OUTPUT)');
    expect(compileCodeMock.mock.calls[1][0]).not.toContain('pinMode(13,OUTPUT)');
  });

  it('B: re-compile after edits sends fresh hex to UniversalUploadButton (different content)', async () => {
    const FIRST_CPP = 'void setup(){}\nvoid loop(){digitalWrite(13,HIGH);delay(500);}\n';
    const SECOND_CPP = 'void setup(){}\nvoid loop(){digitalWrite(13,HIGH);delay(100);}\n';

    compileCodeMock
      .mockResolvedValueOnce({
        success: true,
        hex: ':020000020000FC\n:10000000FIRSTHEX',
        output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      })
      .mockResolvedValueOnce({
        success: true,
        hex: ':020000020000FC\n:10000000SECONDHEX_FAR_LONGER_TEXT_TWICE_AS_BIG_SO_LENGTH_DIFFERS',
        output: 'Lo sketch usa 5644 byte. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      });

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // eslint-disable-next-line no-restricted-globals
    window.__swarm1_emit('<xml/>', FIRST_CPP);
    await clickCompile();
    await waitFor(() => {
      expect(screen.getByTestId('compile-bar-stub').getAttribute('data-compile-status')).toBe('success');
    });
    const uploadBtn1 = await screen.findByTestId('universal-upload-nano-r4');
    const hexLen1 = Number(uploadBtn1.getAttribute('data-hex-text-length') || 0);
    expect(hexLen1).toBeGreaterThan(10);

    // eslint-disable-next-line no-restricted-globals
    window.__swarm1_emit('<xml data-second/>', SECOND_CPP);
    await clickCompile();
    await waitFor(() => {
      expect(compileCodeMock).toHaveBeenCalledTimes(2);
    });
    const uploadBtn2 = await screen.findByTestId('universal-upload-nano-r4');
    const hexLen2 = Number(uploadBtn2.getAttribute('data-hex-text-length') || 0);
    expect(hexLen2).toBeGreaterThan(hexLen1);
    expect(compileCodeMock.mock.calls[1][0]).toContain('delay(100)');
  });

  it('C: ScratchEditor initialCode prop is stable across user onChange (feedback loop broken — regression guard)', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // Wait for first-mount effect to record the initial mount entry.
    await waitFor(() => {
      const mounts = initialCodeReceived.filter((r) => r.kind === 'mount');
      expect(mounts.length).toBeGreaterThanOrEqual(1);
    });
    const mounts = initialCodeReceived.filter((r) => r.kind === 'mount');
    const initialIc = mounts[0].initialCode;
    expect(typeof initialIc).toBe('string');
    expect(initialIc.length).toBeGreaterThan(0);

    // 5 user-edit onChange dispatches. The REAL ScratchEditor would re-run
    // useEffect[initialCode] on each (workspace.clear()+reload). Pre-fix
    // HomeCompileEntry passed `initialCode={blocklyXml}` → every onChange
    // updates blocklyXml → new prop → 5 reloads. Post-fix: initialCode
    // is pinned to a ref → ZERO reloads.
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-restricted-globals
      window.__swarm1_emit(`<xml data-edit="${i}"/>`, `// edit ${i}\nvoid setup(){}\nvoid loop(){}\n`);
    }

    // CRITICAL REGRESSION GUARANTEE: no 'reload' entry exists. Pre-fix
    // would have produced 5 reload entries (one per user edit). Post-fix
    // produces ZERO reloads — the feedback loop is broken.
    const reloads = initialCodeReceived.filter((r) => r.kind === 'reload');
    expect(reloads).toHaveLength(0);
    // And the mount count is still exactly 1.
    const mountsAfter = initialCodeReceived.filter((r) => r.kind === 'mount');
    expect(mountsAfter).toHaveLength(1);
  });

  it('D: C++ → Blocks mode switch triggers intentional remount (key bump) with cppToBlocklyXml output', async () => {
    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    await waitFor(() => {
      const mounts = initialCodeReceived.filter((r) => r.kind === 'mount');
      expect(mounts.length).toBeGreaterThanOrEqual(1);
    });
    const firstMount = initialCodeReceived.filter((r) => r.kind === 'mount')[0];

    // Switch to C++ mode (ScratchEditor unmounts).
    const codeBtn = screen.getByTestId('mode-toggle-code');
    await act(async () => { codeBtn.click(); });

    // Switch back to Blocks — `reseedBlocklyEditor` bumps the editor key →
    // ScratchEditor remounts with the cppToBlocklyXml output.
    const blocksBtn = screen.getByTestId('mode-toggle-blocks');
    await act(async () => { blocksBtn.click(); });

    // After remount, we should see a SECOND mount entry whose initialCode is
    // the cppToBlocklyXml output (mocked to '<xml data-derived-from="cpp">').
    await waitFor(() => {
      const mounts = initialCodeReceived.filter((r) => r.kind === 'mount');
      expect(mounts.length).toBeGreaterThanOrEqual(2);
    });
    const mountsNow = initialCodeReceived.filter((r) => r.kind === 'mount');
    const secondMount = mountsNow[mountsNow.length - 1];
    expect(secondMount.initialCode).toContain('data-derived-from="cpp"');
    expect(secondMount.initialCode).not.toBe(firstMount.initialCode);
  });

  it('E: compileStatus correctly transitions success → compiling → success on second cycle', async () => {
    let resolveSecond;
    const secondPending = new Promise((res) => { resolveSecond = res; });
    compileCodeMock
      .mockResolvedValueOnce({
        success: true,
        hex: ':020000020000FC\n:10000000FIRST',
        output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      })
      .mockReturnValueOnce(secondPending);

    const Entry = await loadEntry();
    render(React.createElement(Entry, { onBackHome: vi.fn() }));
    await screen.findByTestId('scratch-editor-stub');

    // eslint-disable-next-line no-restricted-globals
    window.__swarm1_emit('<xml/>', 'void setup(){}\nvoid loop(){}\n');
    await clickCompile();
    await waitFor(() => {
      expect(screen.getByTestId('compile-bar-stub').getAttribute('data-compile-status')).toBe('success');
    });

    await clickCompile();
    await waitFor(() => {
      expect(screen.getByTestId('compile-bar-stub').getAttribute('data-compile-status')).toBe('compiling');
    });

    await act(async () => {
      resolveSecond({
        success: true,
        hex: ':020000020000FC\n:10000000SECOND_DIFFERENT',
        output: 'Lo sketch usa 5544 byte. Il massimo è 32256 byte.',
        provider: 'cloud-renesas',
      });
      await secondPending;
    });
    await waitFor(() => {
      expect(screen.getByTestId('compile-bar-stub').getAttribute('data-compile-status')).toBe('success');
    });
    expect(compileCodeMock).toHaveBeenCalledTimes(2);
  });
});
