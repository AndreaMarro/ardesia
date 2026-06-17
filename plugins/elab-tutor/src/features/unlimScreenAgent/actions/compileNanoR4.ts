import { z } from 'zod';
import type { ActionDef } from '../types';
import { fail, ok, updateCompileState } from './utils';

export const compileNanoR4: ActionDef<Record<string, never>> = {
  id: 'compileNanoR4',
  description: 'Compila localmente per Arduino Nano R4 con target arduino:renesas_uno:nanor4.',
  argsSchema: z.object({}).strict(),
  async execute(_args, context) {
    if (!context.cppCode.trim()) return fail('Non c e codice C++ da compilare.');
    updateCompileState('compiling');

    try {
      const response = await fetch('/api/compile/nanor4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: context.cppCode, fqbn: context.compileTarget }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.success === false) {
        const message = String(payload.error || payload.errors || 'Compilazione Nano R4 fallita.');
        updateCompileState('error', message);
        return fail(message, { data: payload });
      }

      const artifactSize = typeof payload.size === 'number'
        ? payload.size
        : typeof payload.hex === 'string'
          ? Math.floor(payload.hex.replace(/[^0-9a-fA-F]/g, '').length / 2)
          : undefined;

      updateCompileState('ok', null);
      return ok(`Compilazione Nano R4 completata${artifactSize ? `: artifact ${artifactSize} byte.` : '.'}`, {
        artifactSize,
        data: payload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore di rete durante la compilazione Nano R4.';
      updateCompileState('error', message);
      return fail(message);
    }
  },
};
