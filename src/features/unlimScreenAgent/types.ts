import type { z } from 'zod';

export type CompileStatus = 'idle' | 'compiling' | 'ok' | 'error';
export type UploadState = 'not_attempted_without_board';

export interface ScreenContext {
  route: string;
  editorMode: string | null;
  cppCode: string;
  blockCount: number;
  selectedText: string;
  selectedBlock: string | null;
  compileStatus: CompileStatus;
  compileTarget: 'arduino:renesas_uno:nanor4';
  lastCompilerError: string | null;
  boardConnected: false;
  uploadState: UploadState;
  experimentId: string | null;
}

export type ActionId =
  | 'createBlink'
  | 'createButtonLed'
  | 'createAnalogSerial'
  | 'insertSnippet'
  | 'explainSelectedCode'
  | 'fixCompileError'
  | 'compileNanoR4'
  | 'switchEditorMode'
  | 'highlightBlock';

export interface ActionResult {
  ok: boolean;
  summary?: string;
  error?: string;
  patch?: string;
  artifactSize?: number;
  data?: unknown;
}

export interface ActionDef<TArgs = unknown> {
  id: ActionId;
  description: string;
  argsSchema: z.ZodType<TArgs>;
  execute(args: TArgs, context: ScreenContext): Promise<ActionResult>;
}
