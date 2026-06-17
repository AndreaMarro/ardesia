import { arduinoAstToBlockly as astToBlockly, astToCpp } from '../../elabArduinoAst';
import type { ActionDef, ActionId, ActionResult, ScreenContext } from '../types';
import { compileNanoR4 } from './compileNanoR4';
import { createAnalogSerial } from './createAnalogSerial';
import { createBlink } from './createBlink';
import { createButtonLed } from './createButtonLed';
import { explainSelectedCode } from './explainSelectedCode';
import { fixCompileError } from './fixCompileError';
import { highlightBlock } from './highlightBlock';
import { insertSnippet } from './insertSnippet';
import { switchEditorMode } from './switchEditorMode';

const actions: ActionDef<any>[] = [
  createBlink,
  createButtonLed,
  createAnalogSerial,
  insertSnippet,
  explainSelectedCode,
  fixCompileError,
  compileNanoR4,
  switchEditorMode,
  highlightBlock,
];

export const actionRegistry = actions.reduce((registry, action) => {
  registry[action.id] = action as ActionDef;
  return registry;
}, {} as Record<ActionId, ActionDef>);

export function getAction(id: ActionId): ActionDef {
  return actionRegistry[id];
}

export async function executeAction(
  id: ActionId,
  args: unknown,
  context: ScreenContext,
): Promise<ActionResult> {
  const action = getAction(id);
  const parsed = action.argsSchema.safeParse(args);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Argomenti non validi per ${id}: ${parsed.error.issues.map((issue) => issue.message).join(', ')}`,
    };
  }
  return action.execute(parsed.data, context);
}

export {
  astToBlockly,
  astToCpp,
  compileNanoR4,
  createAnalogSerial,
  createBlink,
  createButtonLed,
  explainSelectedCode,
  fixCompileError,
  highlightBlock,
  insertSnippet,
  switchEditorMode,
};
