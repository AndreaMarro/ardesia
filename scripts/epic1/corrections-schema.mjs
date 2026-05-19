#!/usr/bin/env node
/**
 * EPIC 1 / A4.1a — zod schema for a3-corrections.json (the correction contract).
 * Validates the contract FILE is well-formed. Does not touch lesson-paths.
 */
import { z } from 'zod';

export const CorrectionEntry = z.object({
  action: z.enum(['keep', 'correct', 'remove', 'consolidate']),
  bookFaithfulTitle: z.string().nullable(),
  page: z.number().int().positive().nullable(),
  chapter: z.number().int().positive().nullable(),
  nextId: z.string().nullable(),
  consolidateInto: z.string().optional(),
  source: z.enum(['repo', 'tea', 'neither', 'volume']),
  confidence: z.enum(['high', 'medium', 'low']),
  note: z.string().optional(),
}).strict().refine(
  (e) => e.action !== 'consolidate' || typeof e.consolidateInto === 'string',
  { message: 'consolidateInto is required when action is "consolidate"', path: ['consolidateInto'] },
);

export const CorrectionsFile = z.object({
  generatedFrom: z.array(z.string()).min(1),
  experiments: z.record(z.string(), CorrectionEntry),
});

export function validateCorrectionsFile(obj) {
  const r = CorrectionsFile.safeParse(obj);
  if (r.success) return { ok: true };
  return { ok: false, error: r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
}
