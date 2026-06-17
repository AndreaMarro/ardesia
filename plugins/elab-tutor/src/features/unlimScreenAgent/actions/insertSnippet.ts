import { z } from 'zod';
import type { ActionDef } from '../types';
import { fail, getCm6View, getWindow, ok } from './utils';

const argsSchema = z.object({
  snippet: z.string().min(1),
}).strict();

export const insertSnippet: ActionDef<z.infer<typeof argsSchema>> = {
  id: 'insertSnippet',
  description: 'Inserisce uno snippet nel punto del cursore dell editor C++ locale.',
  argsSchema,
  async execute(args, context) {
    const view = getCm6View();
    const range = view?.state?.selection?.main;
    if (view?.dispatch && range) {
      view.dispatch({ changes: { from: range.from, to: range.to, insert: args.snippet } });
      view.focus?.();
      return ok('Snippet inserito nel cursore dell editor.');
    }

    const win = getWindow();
    if (win?.__ELAB_API?.setEditorCode) {
      const separator = context.cppCode.endsWith('\n') || context.cppCode.length === 0 ? '' : '\n';
      win.__ELAB_API.setEditorCode(`${context.cppCode}${separator}${args.snippet}`);
      return ok('Snippet aggiunto in fondo al codice.');
    }

    return fail('Editor C++ non disponibile per inserire lo snippet.');
  },
};
