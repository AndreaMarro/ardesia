/**
 * INTENT_TOOLS_SCHEMA — Sprint T iter 38 Atom A7
 *
 * Canonical JSON Schema for Mistral La Plateforme structured-output
 * (`response_format = { type: 'json_schema', schema: ... }`).
 *
 * Replaces the legacy regex-based `[INTENT:{...}]` parsing path that
 * suffered 4-way schema drift (Tester-6 R7 v53: canonical 12.5%,
 * 17/200 params_fail = scorer drift). Mistral now validates the model
 * output server-side against this schema and returns parsed JSON.
 *
 * CRITICAL CANONICAL ALIGNMENT (iter 38 A7 fix):
 *   mountExperiment.args.id — STRING, NOT `experimentId`.
 *   This matches:
 *     1. system-prompt.ts few-shot Esempio 2: `{"tool":"mountExperiment","args":{"id":"v3-cap6-semaforo"}}`
 *     2. Browser API positional: `__ELAB_API.mountExperiment(id)` and the
 *        intentsDispatcher whitelist (iter 37 B-NEW Maker-1).
 *     3. ADR-028 §14 amend (surface-to-browser pivot iter 36).
 *
 * Prior drift cases (iter 36-37) used `experimentId` in some scorer fixtures
 * and `id` in others; this iter 38 schema is the single source of truth.
 *
 * Tools whitelist matches the 12 safe browser-side tools defined in
 * supabase/functions/_shared/intent-parser.ts and src/components/lavagna/
 * intentsDispatcher.js (iter 37 Maker-1 surface-to-browser pivot).
 *
 * Reference: PDR Sprint T iter 38 §3 Atom A7.
 * Mistral docs: https://docs.mistral.ai/capabilities/structured-output/json_schema/
 *
 * (c) Andrea Marro 2026-04-30 — ELAB Tutor Maker-1
 */

import type { MistralResponseFormat } from './mistral-client.ts';

/**
 * Canonical tool names — single source of truth.
 * MUST mirror intent-parser.ts ALLOWED_TOOLS + intentsDispatcher.js whitelist.
 */
export const CANONICAL_INTENT_TOOLS = [
  'highlightComponent',
  'mountExperiment',
  'captureScreenshot',
  'highlightPin',
  'clearHighlights',
  'clearCircuit',
  'getCircuitState',
  'getCircuitDescription',
  'setComponentValue',
  'toggleDrawing',
  'serialWrite',
  'clearHighlightPins',
] as const;

export type CanonicalIntentTool = typeof CANONICAL_INTENT_TOOLS[number];

/**
 * INTENT_TOOLS_SCHEMA — wrapped in MistralResponseFormat for direct
 * pass-through to `callLLM({ ..., responseFormat: INTENT_TOOLS_SCHEMA })`.
 *
 * Schema shape (per PDR §3 A7):
 *   {
 *     intents: [{ tool, args }],   // optional array of structured intents
 *     text: "Italian K-12 prose"   // mandatory plurale "Ragazzi," ≤120 parole (Andrea 10/05/2026)
 *   }
 *
 * `text` is REQUIRED (every UNLIM reply needs prose). `intents` is OPTIONAL
 * (replies that don't trigger any browser action — e.g. pure explanation —
 * omit it). Browser-side intentsDispatcher iterates `intents[]` if present.
 *
 * Note on canonical args alignment:
 *   - mountExperiment.args.id : string  (NOT experimentId)
 *   - highlightComponent.args.ids : string[]
 *   - highlightPin.args.ids : string[] (e.g. ["nano:D13"])
 *   - setComponentValue.args : { id, field, value }
 * The schema below intentionally uses `additionalProperties: true` on the
 * inner `args` object because tools have heterogeneous argument shapes;
 * the per-tool args validation lives in the browser dispatcher (defensive
 * second line of defense + keeps Mistral happy with a permissive schema).
 */
export const INTENT_TOOLS_SCHEMA: MistralResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'unlim_response_with_intents',
    strict: false,
    schema: {
      type: 'object',
      properties: {
        intents: {
          type: 'array',
          description: 'Optional sequence of browser-dispatchable intents (highlight, mount, screenshot, etc.). Empty array or omitted when no UI action is needed.',
          items: {
            type: 'object',
            properties: {
              tool: {
                type: 'string',
                enum: [...CANONICAL_INTENT_TOOLS],
                description: 'Canonical tool name from the 12-tool browser whitelist.',
              },
              args: {
                type: 'object',
                additionalProperties: true,
                description: 'Per-tool arguments. mountExperiment.args.id (string), highlightComponent.args.ids (string[]), etc.',
              },
            },
            required: ['tool', 'args'],
            additionalProperties: false,
          },
        },
        text: {
          type: 'string',
          description: 'Italian K-12 plurale "Ragazzi/e," prose response. Max ~120 words ben formattate (feedback 2026-05-10). Cita Vol N pag NN verbatim quando RAG context lo include. Analogie OPZIONALI (solo se aggiungono valore). Mention kit fisico in ultima frase.',
          minLength: 1,
        },
      },
      required: ['text'],
      additionalProperties: false,
    },
  },
};

/**
 * Detector heuristic — should the caller request structured output?
 *
 * The schema mode adds ~50-150ms latency (Mistral validates) and constrains
 * generation, so it's only worth using when the prompt LIKELY triggers a
 * browser action. Conservative trigger: explicit verbs like "mostra",
 * "evidenzia", "carica", "schermata", "screenshot", "monta", "highlight"
 * that map to one of the 12 tools.
 *
 * Returns false for chit-chat / pure-explanation prompts where the legacy
 * regex path is faster and equivalent.
 */
// 2026-05-10 iter 8 Agent 5 Fix 1 expansion: action verbs that trigger schema mode.
// Iter 7 live probe I5 "Avvia simulazione" missed → legacy [AZIONE:play] text instead
// of canonical INTENT JSON. Adds simulation control + editor + diagnose verbs.
const ACTION_TRIGGER_RE =
  /\b(mostra|mostrami|evidenzi[ai]|highlight|carica|monta|montami|montiamo|screenshot|cattura|foto|scatta|pulisci|cancella|connect[ai]?|collega|cambia|imposta|avvia|avviamo|play|start|esegui|riavvia|pausa|stop|ferma|reset|resetta|compila|compile|undo|annulla|redo|ripeti|interagisci|interact|apri|apriamo|chiudi|chiudiamo)\b/i;

export function shouldUseIntentSchema(message: string | null | undefined): boolean {
  if (!message || typeof message !== 'string') return false;
  return ACTION_TRIGGER_RE.test(message);
}

export const INTENT_TOOLS_SCHEMA_VERSION = '1.0-iter38';
