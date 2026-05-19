import { z } from 'zod';
import type { ActionDef } from '../types';
import { fail, ok } from './utils';

function extractLine(error: string): string | null {
  const match = error.match(/\.ino:(\d+):\d+/);
  return match ? match[1] : null;
}

export const fixCompileError: ActionDef<Record<string, never>> = {
  id: 'fixCompileError',
  description: 'Analizza errori di compilazione comuni e propone una patch locale senza LLM.',
  argsSchema: z.object({}).strict(),
  async execute(_args, context) {
    const error = context.lastCompilerError || '';
    if (!error.trim()) return fail('Nessun errore del compilatore disponibile.');

    if (/expected\s+(?:';'|semicolon)|expected semicolon/i.test(error)) {
      const line = extractLine(error);
      const where = line ? ` alla linea ${line}` : ' sulla riga indicata dal compilatore';
      return ok(`Probabile punto e virgola mancante${where}.`, {
        patch: `Aggiungi ';' alla fine dell istruzione${line ? ` alla linea ${line}` : ''}.`,
      });
    }

    if (/pinMode.*not declared|pinMode.*was not declared/i.test(error)) {
      return ok('pinMode non viene riconosciuto: probabilmente manca setup() o il codice e fuori da una funzione Arduino.', {
        patch: 'Inserisci le istruzioni di configurazione dentro:\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // codice ripetuto\n}',
      });
    }

    return ok('Errore non riconosciuto dalle euristiche locali. Controlla la riga indicata dal compilatore e parentesi, virgole o punti e virgola vicini.', {
      patch: 'Nessuna patch automatica sicura disponibile.',
    });
  },
};
