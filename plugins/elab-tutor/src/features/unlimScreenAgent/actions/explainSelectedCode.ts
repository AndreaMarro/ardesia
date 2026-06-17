import { z } from 'zod';
import type { ActionDef } from '../types';
import { fail, ok } from './utils';

type PatternRule = {
  regex: RegExp;
  explain(match: RegExpMatchArray): string;
};

const rules: PatternRule[] = [
  {
    regex: /digitalWrite\s*\(\s*(\d+)\s*,\s*HIGH\s*\)/i,
    explain: (match) => `Accende LED pin ${match[1]}.`,
  },
  {
    regex: /digitalWrite\s*\(\s*(\d+)\s*,\s*LOW\s*\)/i,
    explain: (match) => `Spegne LED pin ${match[1]}.`,
  },
  {
    regex: /delay\s*\(\s*1000\s*\)/i,
    explain: () => 'Attende 1 secondo.',
  },
  {
    regex: /delay\s*\(\s*(\d+)\s*\)/i,
    explain: (match) => `Attende ${match[1]} millisecondi.`,
  },
  {
    regex: /pinMode\s*\(\s*(\d+)\s*,\s*OUTPUT\s*\)/i,
    explain: (match) => `Configura pin ${match[1]} come uscita.`,
  },
  {
    regex: /pinMode\s*\(\s*(\d+)\s*,\s*INPUT_PULLUP\s*\)/i,
    explain: (match) => `Configura pin ${match[1]} come ingresso con resistenza pull-up interna.`,
  },
  {
    regex: /Serial\.println\s*\(([^)]+)\)/i,
    explain: (match) => `Stampa ${match[1].trim()} nel Serial Monitor.`,
  },
  {
    regex: /analogRead\s*\(\s*(A\d+)\s*\)/i,
    explain: (match) => `Legge il valore analogico dal pin ${match[1]}.`,
  },
];

function explainLine(line: string): string | null {
  for (const rule of rules) {
    const match = line.match(rule.regex);
    if (match) return rule.explain(match);
  }
  return null;
}

export const explainSelectedCode: ActionDef<Record<string, never>> = {
  id: 'explainSelectedCode',
  description: 'Spiega il codice selezionato con regole locali, senza usare modelli LLM.',
  argsSchema: z.object({}).strict(),
  async execute(_args, context) {
    const selected = context.selectedText.trim();
    if (!selected) return fail('Seleziona una riga o un blocco di codice da spiegare.');

    const explanations = selected
      .split('\n')
      .map((line) => explainLine(line.trim()))
      .filter((line): line is string => Boolean(line));

    if (explanations.length === 0) {
      return ok('Non riconosco ancora questa istruzione con le regole locali. Posso dire solo che e codice Arduino selezionato.');
    }

    return ok(explanations.join(' '));
  },
};
