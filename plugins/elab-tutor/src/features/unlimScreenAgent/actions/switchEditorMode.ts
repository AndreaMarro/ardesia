import { z } from 'zod';
import type { ActionDef } from '../types';
import { ok, switchEditorModeLocal } from './utils';

const argsSchema = z.object({
  mode: z.enum(['arduino', 'scratch', 'dual']),
}).strict();

export const switchEditorMode: ActionDef<z.infer<typeof argsSchema>> = {
  id: 'switchEditorMode',
  description: 'Cambia modalita editor locale tra Arduino C++, Blocchi o duale.',
  argsSchema,
  async execute(args) {
    switchEditorModeLocal(args.mode);
    return ok(`Modalita editor impostata su ${args.mode}.`);
  },
};
