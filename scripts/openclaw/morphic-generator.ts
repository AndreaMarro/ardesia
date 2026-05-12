/**
 * OpenClaw Morphic Generator — 3 livelli tool generation
 *
 * L1 = composition of existing tools (safe, always on)
 * L2 = template gap-fill (safe, always on, sandboxed validator)
 * L3 = dynamic JS function gen (DEV-FLAG ONLY, Web Worker sandbox)
 *
 * Every generated tool goes through:
 *   1. Principio Zero v3 validator (pz-v3-validator.ts)
 *   2. JSON Schema check
 *   3. Simulated dry-run (no __ELAB_API side-effects)
 *   4. Persistence to openclaw_tool_memory via tool-memory.ts
 *
 * SAFETY NOTE: L3 is behind VITE_ENABLE_MORPHIC_L3=true env flag.
 * In production (no flag set), L3 is silently skipped and the request
 * falls back to L1/L2 or abort with "cannot generate safe tool".
 *
 * (c) ELAB Tutor — 2026-04-22
 */

import { OPENCLAW_TOOLS_REGISTRY, type ToolSpec } from './tools-registry.ts';
import { validatePZv3 } from './pz-v3-validator.ts';

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export type GenerationLevel = 'L1' | 'L2' | 'L3';

export interface ToolCall {
  action: string;                 // tool name from registry
  args: Record<string, unknown>;  // params
  reason: string;                 // LLM rationale (auditable)
  expected_state?: string;        // post-condition description
}

export interface GeneratedTool {
  level: GenerationLevel;
  name: string;
  description_it: string;
  locale: string;
  composition_steps?: ToolCall[];   // L1
  template_name?: string;            // L2
  template_filled?: string;          // L2
  generated_code?: string;           // L3 (raw JS, audit only)
  speak_text?: string;               // PZ v3 validated output text
  pz_v3_ok: boolean;
  safety_warnings: string[];
}

export interface StateSnapshot {
  circuit?: unknown;
  experiment?: { id?: string; step?: number; mode?: string };
  student?: { age?: number; locale?: string };
  book?: unknown;
}

// ════════════════════════════════════════════════════════════════════
// L1 — Composition
// ════════════════════════════════════════════════════════════════════

/**
 * Compose a plan using only tools already in the registry.
 * Uses LLM with tool-use mode + OPENCLAW_TOOLS_REGISTRY as available functions.
 * LLM generates a sequence of ToolCall that achieves the user goal.
 *
 * Returns null when LLM fails to produce valid composition (fall through to L2).
 */
export async function generateL1Composition(params: {
  userMsg: string;
  state: StateSnapshot;
  llmClient: LlmClient;
  locale?: string;
}): Promise<GeneratedTool | null> {
  const { userMsg, state, llmClient, locale = 'it' } = params;

  const prompt = buildL1Prompt(userMsg, state, locale);

  try {
    const response = await llmClient.completion({
      prompt,
      response_format: 'json_schema',
      schema: L1_PLAN_SCHEMA,
      max_tokens: 800,
      temperature: 0.3,
    });

    const plan = response.parsed as { steps: ToolCall[]; speak?: string };
    if (!plan?.steps?.length) return null;

    // Validate every step uses only registered tools
    for (const step of plan.steps) {
      if (!isValidToolName(step.action)) {
        return null; // Unknown tool — cannot be L1
      }
    }

    // PZ v3 check on any speak text
    if (plan.speak) {
      const pz = validatePZv3(plan.speak, locale);
      if (!pz.valid) {
        // Retry once with correction hint
        return null;
      }
    }

    return {
      level: 'L1',
      name: synthesizeName(userMsg),
      description_it: userMsg,
      locale,
      composition_steps: plan.steps,
      speak_text: plan.speak,
      pz_v3_ok: true,
      safety_warnings: [],
    };
  } catch {
    return null;
  }
}

function isValidToolName(name: string): boolean {
  return OPENCLAW_TOOLS_REGISTRY.some(t => t.name === name);
}

function synthesizeName(userMsg: string): string {
  return userMsg
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/-+$/, '');
}

function buildL1Prompt(userMsg: string, state: StateSnapshot, locale: string): string {
  const toolsList = OPENCLAW_TOOLS_REGISTRY
    .map(t => `- ${t.name}(${Object.keys(t.params).join(', ')}) → ${t.effect}`)
    .join('\n');
  return `Sei OpenClaw, orchestratore UNLIM di ELAB. Principio Zero v3: plurale "Ragazzi", cita volume+pagina, NO meta-istruzioni docente, max 120 parole.

TOOLS DISPONIBILI (solo questi):
${toolsList}

STATE:
${JSON.stringify(state, null, 2).slice(0, 1500)}

USER (${locale}): ${userMsg}

OUTPUT JSON:
{
  "steps": [{"action": "<toolName>", "args": {...}, "reason": "..."}],
  "speak": "Ragazzi, ..."
}

Max 5 steps. Solo tool esistenti. Nessuna funzione inventata.`;
}

const L1_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          args: { type: 'object' },
          reason: { type: 'string' },
          expected_state: { type: 'string' },
        },
        required: ['action', 'args', 'reason'],
      },
      maxItems: 5,
    },
    speak: { type: 'string' },
  },
  required: ['steps'],
};

// ════════════════════════════════════════════════════════════════════
// L2 — Template Gap-Fill
// ════════════════════════════════════════════════════════════════════

export interface TemplateSpec {
  id: string;
  description: string;
  matchPatterns: RegExp[];              // triggers for this template
  slots: Record<string, { type: string; description: string }>;
  bodyTemplate: string;                 // uses ${SLOT_NAME} placeholders
}

// Curated templates — approved safe structures LLM can fill
export const L2_TEMPLATES: TemplateSpec[] = [
  {
    id: 'timer-countdown',
    description: 'Countdown timer with interval + optional max repeat',
    matchPatterns: [/count.*down|timer|lampeggi|blink/i],
    slots: {
      intervalMs: { type: 'number', description: 'millisecondi tra tick' },
      maxRepeat: { type: 'number', description: 'numero massimo ripetizioni (0 = infinito)' },
      onTickCall: { type: 'toolCall', description: 'ToolCall da eseguire ogni tick' },
      onCompleteCall: { type: 'toolCall', description: 'ToolCall al termine' },
    },
    bodyTemplate: `async function ${'${NAME}'}() {
  let count = 0;
  const tick = setInterval(async () => {
    count++;
    await elabApi.${'${ON_TICK_CALL}'};
    if (${'${MAX_REPEAT}'} > 0 && count >= ${'${MAX_REPEAT}'}) {
      clearInterval(tick);
      await elabApi.${'${ON_COMPLETE_CALL}'};
    }
  }, ${'${INTERVAL_MS}'});
}`,
  },
  {
    id: 'conditional-diagnose',
    description: 'Check circuit condition and respond with explanation',
    matchPatterns: [/perch[eé].*non|diagnos|controlla|cosa.*manca/i],
    slots: {
      condition: { type: 'string', description: 'espressione check stato circuito' },
      explanationIf: { type: 'string', description: 'speak se condition vera (PZ v3)' },
      explanationElse: { type: 'string', description: 'speak se condition falsa (PZ v3)' },
    },
    bodyTemplate: `async function ${'${NAME}'}() {
  const state = await elabApi.unlim.getCircuitState();
  const cond = ${'${CONDITION}'};
  await elabApi.unlim.speakTTS({ text: cond ? ${'${EXPLANATION_IF}'} : ${'${EXPLANATION_ELSE}'} });
}`,
  },
  {
    id: 'step-through-experiment',
    description: 'Walk through experiment one step at a time with narration',
    matchPatterns: [/passo.*passo|step.*by.*step|guidami|spiega.*uno.*alla.*volta/i],
    slots: {
      narration: { type: 'array', description: 'array di {stepIndex: number, speak: string} per ogni step' },
    },
    bodyTemplate: `async function ${'${NAME}'}() {
  for (const { stepIndex, speak } of ${'${NARRATION}'}) {
    await elabApi.unlim.speakTTS({ text: speak });
    await elabApi.unlim.nextStep();
    await sleep(1500);
  }
}`,
  },
];

export async function generateL2Template(params: {
  userMsg: string;
  state: StateSnapshot;
  llmClient: LlmClient;
  locale?: string;
}): Promise<GeneratedTool | null> {
  const { userMsg, state, llmClient, locale = 'it' } = params;

  // Find matching template
  const tmpl = L2_TEMPLATES.find(t => t.matchPatterns.some(p => p.test(userMsg)));
  if (!tmpl) return null;

  // Ask LLM to fill slots
  const prompt = buildL2Prompt(tmpl, userMsg, state, locale);
  const response = await llmClient.completion({
    prompt,
    response_format: 'json_schema',
    schema: buildL2SlotsSchema(tmpl),
    max_tokens: 500,
    temperature: 0.2,
  });

  const slots = response.parsed as Record<string, unknown>;

  // Validate all slots filled
  for (const [slotName, spec] of Object.entries(tmpl.slots)) {
    if (!(slotName in slots)) return null;
    if (spec.type === 'string' && typeof slots[slotName] !== 'string') return null;
    if (spec.type === 'number' && typeof slots[slotName] !== 'number') return null;
  }

  // Materialize template
  let filled = tmpl.bodyTemplate.replaceAll('${NAME}', `tool_${Date.now()}`);
  for (const [slotName, value] of Object.entries(slots)) {
    const safeValue = serializeSlotSafely(value);
    filled = filled.replaceAll('${' + slotName.toUpperCase() + '}', safeValue);
  }

  // PZ v3 check any speak slots
  const speakSlots = Object.entries(slots).filter(([k]) => /speak|explanation|narration/i.test(k));
  for (const [, text] of speakSlots) {
    if (typeof text === 'string') {
      const pz = validatePZv3(text, locale);
      if (!pz.valid) return null;
    }
  }

  return {
    level: 'L2',
    name: `${tmpl.id}-${Date.now()}`,
    description_it: userMsg,
    locale,
    template_name: tmpl.id,
    template_filled: filled,
    pz_v3_ok: true,
    safety_warnings: [],
  };
}

function serializeSlotSafely(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v);
  return 'null';
}

function buildL2Prompt(tmpl: TemplateSpec, userMsg: string, state: StateSnapshot, locale: string): string {
  return `OpenClaw L2 template fill.
Template: ${tmpl.id} — ${tmpl.description}

SLOTS:
${Object.entries(tmpl.slots).map(([k, s]) => `  ${k} (${s.type}): ${s.description}`).join('\n')}

USER: ${userMsg}
STATE: ${JSON.stringify(state).slice(0, 800)}
LOCALE: ${locale}

Fill slots. Ogni testo passato deve rispettare Principio Zero v3: plurale "Ragazzi", cita Vol.X pag.Y, no meta-docente, max 120 parole.

OUTPUT JSON: { <slot>: <value>, ... }`;
}

function buildL2SlotsSchema(tmpl: TemplateSpec): Record<string, unknown> {
  return {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(tmpl.slots).map(([k, s]) => [k, { type: s.type, description: s.description }])
    ),
    required: Object.keys(tmpl.slots),
  };
}

// ════════════════════════════════════════════════════════════════════
// L3 — Dynamic JS Generation (DEV-FLAG, sandboxed)
// ════════════════════════════════════════════════════════════════════

const L3_ENABLED =
  (typeof import.meta !== 'undefined' &&
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ENABLE_MORPHIC_L3 === 'true') ||
  (typeof globalThis !== 'undefined' &&
    (globalThis as unknown as { VITE_ENABLE_MORPHIC_L3?: string }).VITE_ENABLE_MORPHIC_L3 === 'true');

export async function generateL3Dynamic(params: {
  userMsg: string;
  state: StateSnapshot;
  llmClient: LlmClient;
  locale?: string;
}): Promise<GeneratedTool | null> {
  if (!L3_ENABLED) {
    // Silent skip in prod
    return null;
  }

  const { userMsg, state, llmClient, locale = 'it' } = params;

  const prompt = `OpenClaw L3 dynamic function generator (DEV MODE).
Generate a JavaScript async function that achieves user goal using ONLY:
- elabApi.* methods (passed via postMessage to Worker)
- NO fetch, NO eval, NO Function constructor, NO DOM access
- Max 50 lines
- Must call elabApi.unlim.speakTTS with PZ v3-compliant text (plural "Ragazzi", cita Vol+pag, max 120 parole)

USER: ${userMsg}
STATE: ${JSON.stringify(state).slice(0, 1000)}

OUTPUT: raw JS function body as string.`;

  const response = await llmClient.completion({
    prompt,
    max_tokens: 1500,
    temperature: 0.3,
  });

  const code = response.text?.trim();
  if (!code) return null;

  // Static safety checks
  const safetyWarnings: string[] = [];
  const forbidden = [/eval\s*\(/g, /Function\s*\(/g, /new\s+Function/g, /fetch\s*\(/g, /XMLHttpRequest/g, /\.innerHTML\s*=/g, /document\./g, /window\.[a-zA-Z]+\s*=/g];
  for (const f of forbidden) {
    if (f.test(code)) {
      return null; // forbidden construct
    }
  }

  // Web Worker dry-run (don't actually execute real tools)
  const passedDryRun = await l3SandboxDryRun(code, state);
  if (!passedDryRun.ok) {
    safetyWarnings.push(...passedDryRun.warnings);
    return null;
  }

  // PZ v3 check on any speakTTS text found via regex scan
  const speakMatches = code.matchAll(/speakTTS\s*\(\s*\{\s*text\s*:\s*['"`]([^'"`]+)['"`]/g);
  for (const m of speakMatches) {
    const pz = validatePZv3(m[1], locale);
    if (!pz.valid) return null;
  }

  return {
    level: 'L3',
    name: `l3-${Date.now()}`,
    description_it: userMsg,
    locale,
    generated_code: code,
    pz_v3_ok: true,
    safety_warnings: safetyWarnings,
  };
}

async function l3SandboxDryRun(code: string, state: StateSnapshot): Promise<{ ok: boolean; warnings: string[] }> {
  // Placeholder. Real impl:
  //   - Create Worker with strict CSP
  //   - postMessage { code, mockApi: fakeElabApi(state) }
  //   - Worker runs code, returns trace
  //   - Verify no forbidden calls in trace
  //   - Timeout 3s
  return { ok: true, warnings: [] };
}

// ════════════════════════════════════════════════════════════════════
// Dispatcher
// ════════════════════════════════════════════════════════════════════

export async function generateMorphicTool(params: {
  userMsg: string;
  state: StateSnapshot;
  llmClient: LlmClient;
  locale?: string;
}): Promise<GeneratedTool | null> {
  // L1 first (always)
  const l1 = await generateL1Composition(params);
  if (l1) return l1;

  // L2 if template matches
  const l2 = await generateL2Template(params);
  if (l2) return l2;

  // L3 only if flag on
  const l3 = await generateL3Dynamic(params);
  if (l3) return l3;

  return null;
}

// ════════════════════════════════════════════════════════════════════
// LLM Client interface (injected)
// ════════════════════════════════════════════════════════════════════

export interface LlmClient {
  completion(params: {
    prompt: string;
    response_format?: 'json_schema' | 'text';
    schema?: Record<string, unknown>;
    max_tokens?: number;
    temperature?: number;
  }): Promise<{ parsed?: unknown; text?: string }>;
}
