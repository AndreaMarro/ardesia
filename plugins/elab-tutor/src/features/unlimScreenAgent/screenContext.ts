import type { CompileStatus, ScreenContext } from './types';

type LooseStore = {
  getState?: () => Record<string, unknown>;
};

type LooseWindow = Window & {
  __ELAB_IDE_STORE?: LooseStore;
  __ELAB_STORE?: LooseStore;
  __ELAB_CM6_VIEW?: Cm6View;
  elabCm6View?: Cm6View;
  __ELAB_BLOCKLY_WORKSPACE?: BlocklyWorkspace;
  Blockly?: {
    getMainWorkspace?: () => BlocklyWorkspace | null;
  };
  __ELAB_API?: {
    getEditorCode?: () => string | null;
    getEditorMode?: () => string | null;
    getCurrentExperiment?: () => { id?: string } | null;
    getCompilationSnapshot?: () => Record<string, unknown> | null;
  };
};

type Cm6View = {
  state?: {
    selection?: {
      main?: { from: number; to: number };
    };
    sliceDoc?: (from: number, to: number) => string;
    doc?: { toString?: () => string };
  };
};

type BlocklyWorkspace = {
  getAllBlocks?: () => unknown[];
  getSelected?: () => { id?: string } | null;
};

function getWindow(): LooseWindow | null {
  return typeof window === 'undefined' ? null : window as LooseWindow;
}

function getStoreState(): Record<string, unknown> {
  const win = getWindow();
  const stores = [win?.__ELAB_IDE_STORE, win?.__ELAB_STORE];
  for (const store of stores) {
    try {
      const state = store?.getState?.();
      if (state && typeof state === 'object') return state;
    } catch {
      // Optional host stores must not break context collection.
    }
  }
  return {};
}

function readPath<T = unknown>(source: unknown, path: string[]): T | undefined {
  let cursor = source as Record<string, unknown> | undefined;
  for (const key of path) {
    if (!cursor || typeof cursor !== 'object') return undefined;
    cursor = cursor[key] as Record<string, unknown> | undefined;
  }
  return cursor as T | undefined;
}

function readEditorElementCode(): string | null {
  if (typeof document === 'undefined') return null;
  const element = document.querySelector('#cpp-editor') as (HTMLElement & { value?: string }) | null;
  if (!element) return null;
  if (typeof element.value === 'string') return element.value;
  return element.textContent ?? '';
}

function readCm6View(): Cm6View | null {
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

function readCppCode(state: Record<string, unknown>): string {
  const elementCode = readEditorElementCode();
  if (elementCode !== null) return elementCode;

  const storeCode =
    readPath<string>(state, ['cppCode']) ??
    readPath<string>(state, ['ide', 'cppCode']) ??
    readPath<string>(state, ['editor', 'cppCode']) ??
    readPath<string>(state, ['editor', 'code']);
  if (typeof storeCode === 'string') return storeCode;

  const apiCode = getWindow()?.__ELAB_API?.getEditorCode?.();
  return typeof apiCode === 'string' ? apiCode : '';
}

function readWorkspace(): BlocklyWorkspace | null {
  const win = getWindow();
  if (win?.__ELAB_BLOCKLY_WORKSPACE) return win.__ELAB_BLOCKLY_WORKSPACE;
  try {
    return win?.Blockly?.getMainWorkspace?.() || null;
  } catch {
    return null;
  }
}

function readSelectedText(): string {
  const view = readCm6View();
  const selection = view?.state?.selection?.main;
  if (!selection || selection.from === selection.to) return '';
  return view?.state?.sliceDoc?.(selection.from, selection.to) ?? '';
}

function normalizeCompileStatus(value: unknown): CompileStatus {
  if (value === 'success') return 'ok';
  if (value === 'idle' || value === 'compiling' || value === 'ok' || value === 'error') return value;
  return 'idle';
}

function readCompileStatus(state: Record<string, unknown>): CompileStatus {
  const fromStore =
    readPath<unknown>(state, ['compile', 'status']) ??
    readPath<unknown>(state, ['compilation', 'status']);
  if (fromStore) return normalizeCompileStatus(fromStore);

  const snapshot = getWindow()?.__ELAB_API?.getCompilationSnapshot?.();
  return normalizeCompileStatus(snapshot?.status);
}

function readLastCompilerError(state: Record<string, unknown>): string | null {
  const value =
    readPath<unknown>(state, ['compile', 'lastError']) ??
    readPath<unknown>(state, ['compilation', 'lastError']) ??
    readPath<unknown>(state, ['compilation', 'errors']);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readExperimentId(state: Record<string, unknown>): string | null {
  const value =
    readPath<unknown>(state, ['experiment', 'id']) ??
    readPath<unknown>(state, ['currentExperiment', 'id']);
  if (typeof value === 'string' && value.length > 0) return value;

  const apiId = getWindow()?.__ELAB_API?.getCurrentExperiment?.()?.id;
  return typeof apiId === 'string' && apiId.length > 0 ? apiId : null;
}

export function readScreenContext(): ScreenContext {
  const win = getWindow();
  const state = getStoreState();
  const workspace = readWorkspace();
  const selectedBlock = workspace?.getSelected?.()?.id ?? null;

  return {
    route: win?.location?.hash?.replace(/^#/, '') ?? '',
    editorMode: win?.localStorage?.getItem('elab.ide.mode') ?? win?.__ELAB_API?.getEditorMode?.() ?? null,
    cppCode: readCppCode(state),
    blockCount: workspace?.getAllBlocks?.().length ?? 0,
    selectedText: readSelectedText(),
    selectedBlock,
    compileStatus: readCompileStatus(state),
    compileTarget: 'arduino:renesas_uno:nanor4',
    lastCompilerError: readLastCompilerError(state),
    boardConnected: false,
    uploadState: 'not_attempted_without_board',
    experimentId: readExperimentId(state),
  };
}
