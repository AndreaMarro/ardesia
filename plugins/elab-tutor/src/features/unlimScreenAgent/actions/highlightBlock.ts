import { z } from 'zod';
import type { ActionDef } from '../types';
import { fail, getBlocklyWorkspace, ok } from './utils';

const argsSchema = z.object({
  blockId: z.string().min(1),
}).strict();

export const highlightBlock: ActionDef<z.infer<typeof argsSchema>> = {
  id: 'highlightBlock',
  description: 'Evidenzia un blocco Blockly selezionandolo nel workspace locale.',
  argsSchema,
  async execute(args) {
    const workspace = getBlocklyWorkspace();
    const block = workspace?.getBlockById?.(args.blockId);
    if (!block?.select) return fail(`Blocco ${args.blockId} non trovato.`);
    block.select();
    return ok(`Blocco ${args.blockId} evidenziato.`);
  },
};
