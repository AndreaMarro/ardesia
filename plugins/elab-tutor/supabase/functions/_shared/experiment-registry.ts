/**
 * Iter 68 A-NEW-1 — Experiment ID registry for offtopic detector validation.
 *
 * Hard-coded 79 valid experiment IDs extracted from src/data/experiments-vol*.js
 * (Vol1=38 + Vol2=27 + Vol3=14 = 79 total).
 *
 * Why hardcoded vs runtime import: Edge Function (Deno deploy) only uploads
 * supabase/functions/ directory — src/ is NOT bundled. Direct import
 * `from '../../src/data/experiments-vol1.js'` would fail at runtime.
 *
 * Regeneration command (run when adding new experiments):
 *   grep -hoE 'id:\s*"(v[1-3]-cap[0-9]+-[a-z0-9_-]+)"' src/data/experiments-vol*.js \
 *     | sed 's/^id:[[:space:]]*"\(.*\)"/\1/' | sort -u
 *
 * Usage:
 *   import { validateExperimentIdExists } from './experiment-registry.ts';
 *   if (!validateExperimentIdExists(id)) return null; // fall-through
 *
 * Iter 67 PHASE 6 root cause: LLM hallucinates experiment IDs for offtopic
 * queries ("Borsa Tokyo apertura" → fake [AZIONE:loadexp:borsa_tokyo_apertura]).
 * Real user clicks broken state. This registry enables post-LLM validation
 * stripping invalid AZIONE/INTENT tags before reaching browser dispatcher.
 */

export const VALID_EXPERIMENT_IDS: readonly string[] = [
  // Vol1 — Le Basi (38 experiments)
  'v1-cap6-esp1', 'v1-cap6-esp2', 'v1-cap6-esp3',
  'v1-cap7-esp1', 'v1-cap7-esp2', 'v1-cap7-esp3', 'v1-cap7-esp4', 'v1-cap7-esp5', 'v1-cap7-esp6',
  'v1-cap8-esp1', 'v1-cap8-esp2', 'v1-cap8-esp3', 'v1-cap8-esp4', 'v1-cap8-esp5',
  'v1-cap9-esp1', 'v1-cap9-esp2', 'v1-cap9-esp3', 'v1-cap9-esp4', 'v1-cap9-esp5',
  'v1-cap9-esp6', 'v1-cap9-esp7', 'v1-cap9-esp8', 'v1-cap9-esp9',
  'v1-cap10-esp1', 'v1-cap10-esp2', 'v1-cap10-esp3', 'v1-cap10-esp4', 'v1-cap10-esp5', 'v1-cap10-esp6',
  'v1-cap11-esp1', 'v1-cap11-esp2',
  'v1-cap12-esp1', 'v1-cap12-esp2', 'v1-cap12-esp3', 'v1-cap12-esp4',
  'v1-cap13-esp1', 'v1-cap13-esp2',
  'v1-cap14-esp1',

  // Vol2 — Misure e approfondimenti (27 experiments)
  'v2-cap3-esp1', 'v2-cap3-esp2', 'v2-cap3-esp3', 'v2-cap3-esp4',
  'v2-cap4-esp1', 'v2-cap4-esp2', 'v2-cap4-esp3',
  'v2-cap5-esp1', 'v2-cap5-esp2',
  'v2-cap6-esp1', 'v2-cap6-esp2', 'v2-cap6-esp3', 'v2-cap6-esp4',
  'v2-cap7-esp1', 'v2-cap7-esp2', 'v2-cap7-esp3', 'v2-cap7-esp4',
  'v2-cap8-esp1', 'v2-cap8-esp2', 'v2-cap8-esp3',
  'v2-cap9-esp1', 'v2-cap9-esp2',
  'v2-cap10-esp1', 'v2-cap10-esp2', 'v2-cap10-esp3', 'v2-cap10-esp4',
  'v2-cap12-esp1',

  // Vol3 — Arduino, Scratch e sistemi interattivi (14 experiments)
  'v3-cap5-esp1', 'v3-cap5-esp2',
  'v3-cap6-esp1', 'v3-cap6-esp2', 'v3-cap6-esp4', 'v3-cap6-morse', 'v3-cap6-semaforo',
  'v3-cap7-esp1', 'v3-cap7-esp2', 'v3-cap7-esp3', 'v3-cap7-esp6',
  'v3-cap8-esp1', 'v3-cap8-esp2', 'v3-cap8-esp3',
];

/**
 * O(1) lookup Set for validateExperimentIdExists hot path.
 * Frozen post-construction to prevent mutation.
 */
const EXPERIMENT_ID_SET: ReadonlySet<string> = new Set(VALID_EXPERIMENT_IDS);

/**
 * Validate experiment ID exists in registry.
 *
 * @param id Experiment ID candidate (e.g. "v1-cap6-esp1" valid, "borsa_tokyo_apertura" invalid)
 * @returns true if ID exists in registry, false otherwise (including null/undefined/empty)
 *
 * Case sensitive (canonical format lowercase per src/data/experiments-vol*.js).
 * Whitespace NOT trimmed (caller responsibility).
 */
export function validateExperimentIdExists(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return EXPERIMENT_ID_SET.has(id);
}

/**
 * Strip invalid AZIONE:loadexp:<id> and INTENT mountExperiment <id> tags from response text.
 *
 * Iter 68 A-NEW-1 post-LLM validator: LLM hallucinates fake experiment IDs for
 * offtopic queries ("Borsa Tokyo apertura" → [AZIONE:loadexp:borsa_tokyo_apertura]).
 * This validator scans response + removes tags with non-registry IDs.
 *
 * Preserves valid tags. Returns modified response + array of stripped IDs for telemetry.
 *
 * @param responseText Raw LLM response text
 * @returns { text: scrubbed text, stripped: array of invalid IDs removed }
 */
export function stripInvalidExperimentTags(responseText: string): {
  text: string;
  stripped: string[];
} {
  if (!responseText || typeof responseText !== 'string') {
    return { text: responseText || '', stripped: [] };
  }

  const stripped: string[] = [];

  // Pattern 1: [AZIONE:loadexp:<id>] legacy format
  // Catches: [AZIONE:loadexp:borsa_tokyo_apertura], [AZIONE:loadexp:aws-cloud-computing-basics]
  let text = responseText.replace(
    /\[AZIONE:loadexp:([a-z0-9_-]+)\]/gi,
    (match, id) => {
      if (validateExperimentIdExists(id)) return match;
      stripped.push(id);
      return '';
    },
  );

  // Pattern 2: [INTENT:{"tool":"mountExperiment","args":{"id":"<id>"}}] canonical format
  // Catches LLM-generated INTENT mountExperiment with fake IDs
  text = text.replace(
    /\[INTENT:\{"tool":"mountExperiment","args":\{"id":"([a-z0-9_-]+)"\}\}\]/gi,
    (match, id) => {
      if (validateExperimentIdExists(id)) return match;
      stripped.push(id);
      return '';
    },
  );

  // Collapse residual double-spaces from removed tags
  if (stripped.length > 0) {
    text = text.replace(/\s{2,}/g, ' ').trim();
  }

  return { text, stripped };
}
