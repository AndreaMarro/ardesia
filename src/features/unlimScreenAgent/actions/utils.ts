import { arduinoAstToBlockly, astToCpp, type ArduinoProgram } from '../../elabArduinoAst';
import type { ActionResult } from '../types';

type LooseWindow = Window & {
  __ELAB_API?: {
    setEditorCode?: (code: string) => void;
    loadScratchWorkspace?: (xml: string) => void;
    setEditorMode?: (mode: string) => void;
  };
  __ELAB_CM6_VIEW?: Cm6View;
  elabCm6View?: Cm6View;
  __ELAB_BLOCKLY_WORKSPACE?: BlocklyWorkspace;
  Blockly?: {
    getMainWorkspace?: () => BlocklyWorkspace | null;
  };
  __ELAB_IDE_STORE?: StoreLike;
  __ELAB_STORE?: StoreLike;
};

type StoreLike = {
  getState?: () => Record<string, unknown>;
  setState?: (state: unknown) => void;
};

export type Cm6View = {
  state?: {
    selection?: { main?: { from: number; to: number } };
  };
  dispatch?: (transaction: { changes: { from: number; to: number; insert: string } }) => void;
  focus?: () => void;
};

export type BlocklyWorkspace = {
  getBlockById?: (id: string) => { select?: () => void } | null;
};

export function getWindow(): LooseWindow | null {
  return typeof window === 'undefined' ? null : window as LooseWindow;
}

export function getCm6View(): Cm6View | null {
  const win = getWindow();
  if (win?.__ELAB_CM6_VIEW) return win.__ELAB_CM6_VIEW;
  if (win?.elabCm6View) return win.elabCm6View;
  if (typeof document === 'undefined') return null;

  const editor = document.querySelector('#cpp-editor') as (HTMLElement & {
    cmView?: Cm6View;
    view?: Cm6View;
  }) | null;
  return editor?.cmView || editor?.view || null;
}

export function getBlocklyWorkspace(): BlocklyWorkspace | null {
  const win = getWindow();
  if (win?.__ELAB_BLOCKLY_WORKSPACE) return win.__ELAB_BLOCKLY_WORKSPACE;
  try {
    return win?.Blockly?.getMainWorkspace?.() || null;
  } catch {
    return null;
  }
}

export function setEditorProgram(program: ArduinoProgram): { cpp: string; xml: string } {
  const cpp = astToCpp(program);
  const xml = arduinoAstToBlockly(program);
  const win = getWindow();
  win?.__ELAB_API?.setEditorCode?.(cpp);
  win?.__ELAB_API?.loadScratchWorkspace?.(xml);
  switchEditorModeLocal('dual');
  return { cpp, xml };
}

export function switchEditorModeLocal(mode: string): void {
  const win = getWindow();
  try {
    win?.localStorage?.setItem('elab.ide.mode', mode);
  } catch {
    // localStorage may be unavailable in embedded contexts.
  }
  win?.__ELAB_API?.setEditorMode?.(mode);
  win?.dispatchEvent?.(new CustomEvent('elab-ide-mode-change', { detail: { mode } }));
}

export function updateCompileState(status: 'compiling' | 'ok' | 'error', lastError: string | null = null): void {
  const win = getWindow();
  const stores = [win?.__ELAB_IDE_STORE, win?.__ELAB_STORE];
  for (const store of stores) {
    if (!store?.setState) continue;
    try {
      const prev = store.getState?.() || {};
      store.setState({
        ...prev,
        compile: {
          ...(typeof prev.compile === 'object' && prev.compile ? prev.compile : {}),
          status,
          lastError,
        },
      });
      return;
    } catch {
      // State update is best-effort for optional host stores.
    }
  }
}

export function ok(summary: string, extra: Omit<ActionResult, 'ok' | 'summary'> = {}): ActionResult {
  return { ok: true, summary, ...extra };
}

export function fail(error: string, extra: Omit<ActionResult, 'ok' | 'error'> = {}): ActionResult {
  return { ok: false, error, ...extra };
}
