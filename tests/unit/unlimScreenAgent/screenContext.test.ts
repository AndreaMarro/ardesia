import { beforeEach, describe, expect, test, vi } from 'vitest';
import { readScreenContext } from '../../../src/features/unlimScreenAgent/screenContext';

type TestWindow = typeof window & {
  __ELAB_IDE_STORE?: { getState: () => any };
  __ELAB_STORE?: { getState: () => any };
  __ELAB_CM6_VIEW?: any;
  __ELAB_BLOCKLY_WORKSPACE?: any;
  Blockly?: any;
  __ELAB_API?: any;
};

const testWindow = window as TestWindow;

describe('unlimScreenAgent readScreenContext', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
    delete testWindow.__ELAB_IDE_STORE;
    delete testWindow.__ELAB_STORE;
    delete testWindow.__ELAB_CM6_VIEW;
    delete testWindow.__ELAB_BLOCKLY_WORKSPACE;
    delete testWindow.Blockly;
    delete testWindow.__ELAB_API;
  });

  test('reads route from hash without leading #', () => {
    window.location.hash = '#/simulatore?exp=v3-cap5-esp1';

    expect(readScreenContext().route).toBe('/simulatore?exp=v3-cap5-esp1');
  });

  test('reads editor mode from elab.ide.mode localStorage key', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key) => key === 'elab.ide.mode' ? 'dual' : null);

    expect(readScreenContext().editorMode).toBe('dual');
  });

  test('reads editor mode from ELAB API when localStorage is empty', () => {
    testWindow.__ELAB_API = { getEditorMode: vi.fn(() => 'scratch') };

    expect(readScreenContext().editorMode).toBe('scratch');
  });

  test('reads cppCode from #cpp-editor input value before store fallback', () => {
    document.body.innerHTML = '<textarea id="cpp-editor">ignored text</textarea>';
    (document.querySelector('#cpp-editor') as HTMLTextAreaElement).value = 'void setup() {}';
    testWindow.__ELAB_IDE_STORE = { getState: () => ({ cppCode: 'store code' }) };

    expect(readScreenContext().cppCode).toBe('void setup() {}');
  });

  test('reads cppCode from #cpp-editor text content when value is absent', () => {
    const editor = document.createElement('div');
    editor.id = 'cpp-editor';
    editor.textContent = 'void loop() {}';
    document.body.append(editor);

    expect(readScreenContext().cppCode).toBe('void loop() {}');
  });

  test('falls back to Zustand-like store for cppCode', () => {
    testWindow.__ELAB_IDE_STORE = { getState: () => ({ ide: { cppCode: 'int x = 1;' } }) };

    expect(readScreenContext().cppCode).toBe('int x = 1;');
  });

  test('falls back to ELAB API for cppCode after DOM and store', () => {
    testWindow.__ELAB_API = { getEditorCode: vi.fn(() => 'int apiValue = 2;') };

    expect(readScreenContext().cppCode).toBe('int apiValue = 2;');
  });

  test('counts Blockly workspace blocks', () => {
    testWindow.__ELAB_BLOCKLY_WORKSPACE = { getAllBlocks: vi.fn(() => [{}, {}, {}]) };

    expect(readScreenContext().blockCount).toBe(3);
  });

  test('falls back to Blockly main workspace', () => {
    testWindow.Blockly = {
      getMainWorkspace: vi.fn(() => ({ getAllBlocks: vi.fn(() => [{}, {}]) })),
    };

    expect(readScreenContext().blockCount).toBe(2);
  });

  test('reads selected text from CM6 selection main range', () => {
    testWindow.__ELAB_CM6_VIEW = {
      state: {
        selection: { main: { from: 5, to: 18 } },
        sliceDoc: vi.fn((from: number, to: number) => `selected ${from}-${to}`),
      },
    };

    expect(readScreenContext().selectedText).toBe('selected 5-18');
  });

  test('returns empty selectedText when CM6 selection is collapsed', () => {
    testWindow.__ELAB_CM6_VIEW = {
      state: {
        selection: { main: { from: 7, to: 7 } },
        sliceDoc: vi.fn(() => 'should not be used'),
      },
    };

    expect(readScreenContext().selectedText).toBe('');
  });

  test('reads selected Blockly block id', () => {
    testWindow.__ELAB_BLOCKLY_WORKSPACE = {
      getAllBlocks: vi.fn(() => []),
      getSelected: vi.fn(() => ({ id: 'block-7' })),
    };

    expect(readScreenContext().selectedBlock).toBe('block-7');
  });

  test('reads compile and experiment state from store', () => {
    testWindow.__ELAB_IDE_STORE = {
      getState: () => ({
        compile: { status: 'error', lastError: 'expected semicolon on line 4' },
        experiment: { id: 'v3-cap8-esp1' },
      }),
    };

    const context = readScreenContext();

    expect(context.compileStatus).toBe('error');
    expect(context.lastCompilerError).toBe('expected semicolon on line 4');
    expect(context.experimentId).toBe('v3-cap8-esp1');
  });

  test('normalizes success compile status to ok from API snapshot', () => {
    testWindow.__ELAB_API = { getCompilationSnapshot: vi.fn(() => ({ status: 'success' })) };

    expect(readScreenContext().compileStatus).toBe('ok');
  });

  test('reads experiment id from API when store has none', () => {
    testWindow.__ELAB_API = { getCurrentExperiment: vi.fn(() => ({ id: 'v2-cap4-esp3' })) };

    expect(readScreenContext().experimentId).toBe('v2-cap4-esp3');
  });

  test('returns fixed Nano R4 compile and board upload fields', () => {
    const context = readScreenContext();

    expect(context.compileTarget).toBe('arduino:renesas_uno:nanor4');
    expect(context.boardConnected).toBe(false);
    expect(context.uploadState).toBe('not_attempted_without_board');
  });
});
