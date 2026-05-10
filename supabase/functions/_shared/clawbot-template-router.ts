/**
 * ClawBot L2 Template Router — keyword/category match + arg interpolation.
 *
 * Sprint T iter 26 — agent gen-app — 2026-04-28.
 *
 * `selectTemplate(query, context)` → best-match `ClawBotTemplate` or `null`
 *   when no template scores above threshold (caller falls back to LLM).
 *
 * `executeTemplate(template, inputs, env?)` → returns the resolved sequence
 *   plus an aggregated text response that wire-up code can return to the
 *   client. We DO NOT actually invoke `__ELAB_API` (browser-only) from Deno;
 *   instead we emit `[AZIONE:<tool>:<json-args>]` tags that the client-side
 *   composite handler relays. RAG retrieval IS executed server-side via
 *   `hybridRetrieve` so the citation in the speakTTS step gets a real
 *   Vol/pag pair.
 */

import { TEMPLATES_L2, type ClawBotTemplate, type ClawBotStep, type ClawBotCategory } from './clawbot-templates.ts';

// ─── Selection ──────────────────────────────────────────────────────────────

/**
 * Lightweight Italian stopword list — keeps signal words.
 */
const STOPWORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'uno', 'di', 'a', 'da', 'in',
  'con', 'su', 'per', 'tra', 'fra', 'e', 'o', 'ma', 'che', 'come', 'cosa',
  'cos', 'è', 'sono', 'sei', 'siamo', 'siete', 'mi', 'ti', 'ci', 'vi', 'si',
  'al', 'del', 'dal', 'nel', 'sul', 'col', 'allo', 'dello', 'dallo',
  'quando', 'dove', 'perche', 'perché', 'fa', 'fare', 'fatto',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

export interface SelectContext {
  category_hint?: ClawBotCategory;
  experimentId?: string | null;
  /**
   * Score floor for a match. Defaults to 2 (must share ≥2 keywords with the
   * template description+id). Lower → more recall, more false positives.
   */
  threshold?: number;
}

interface ScoredTemplate {
  template: ClawBotTemplate;
  score: number;
}

/**
 * Score a template against query tokens by counting overlapping tokens with
 * its description+id+name+analogia. Adds bonuses for category hint match
 * and tool-name keywords (e.g. "spiega" → "explain").
 */
function scoreTemplate(template: ClawBotTemplate, queryTokens: Set<string>, context?: SelectContext): number {
  const haystack = [
    template.id,
    template.name,
    template.description,
    template.principio_zero?.analogia ?? '',
    template.principio_zero?.vol_pag ?? '',
  ].join(' ');
  const tplTokens = new Set(tokenize(haystack));

  let score = 0;
  for (const qt of queryTokens) {
    if (tplTokens.has(qt)) score += 1;
  }

  // Category hint bonus
  if (context?.category_hint && template.category === context.category_hint) {
    score += 2;
  }

  // Verb keyword → category alignment heuristic
  const verbMap: Array<[string, ClawBotCategory[]]> = [
    ['spieg', ['lesson-explain']],
    ['intro', ['lesson-introduce']],
    ['diagnos', ['diagnose', 'diagnose-error', 'diagnose-vision', 'lesson-diagnose']],
    ['rovesc', ['diagnose-vision']],
    ['fioco', ['lesson-diagnose']],
    ['cortocirc', ['diagnose-error']],
    ['corto', ['diagnose-error']],
    ['guid', ['guide-action', 'guide-build', 'lesson-guide']],
    ['compil', ['guide-action']],
    ['serial', ['lesson-guide']],
    ['mont', ['guide-build']],
    ['celebr', ['lesson-celebrate', 'feedback-positive']],
    ['critic', ['critique-vision']],
    ['recap', ['lesson-recap']],
    ['ricap', ['lesson-recap']],
    ['error', ['error-recovery']],
    ['errat', ['error-recovery']],
    ['scratc', ['lesson-program-first']],
    ['blockl', ['lesson-program-first']],
  ];
  for (const [stem, cats] of verbMap) {
    for (const qt of queryTokens) {
      if (qt.startsWith(stem) && cats.includes(template.category)) {
        score += 1;
        break;
      }
    }
  }

  return score;
}

/**
 * Pick best L2 template for a free-form Italian query. Returns null if no
 * template clears the threshold.
 */
export function selectTemplate(query: string, context: SelectContext = {}): ClawBotTemplate | null {
  if (!query || typeof query !== 'string') return null;
  const tokens = new Set(tokenize(query));
  if (tokens.size === 0) return null;

  // 2026-05-10 — Live prod audit (probe stamane Vol.2 multimetro → celebrate-end-volume,
  // Vol.1 LED → diagnose-led-rovesciato, spiega LED → wrong-fire) showed bag-of-words
  // threshold=2 selects wrong-category templates for descriptive queries.
  // Disable L2 short-circuit globally; AgentDecision JSON router (parallel-agent
  // 2026-05-09 architecture) replaces this routing path.
  // Re-enable later only with normalized scoring + per-category thresholds.
  // Tests pass `threshold: 2` explicit override to verify scoring algorithm still works.
  const threshold = context.threshold ?? 999;

  const scored: ScoredTemplate[] = TEMPLATES_L2.map(t => ({ template: t, score: scoreTemplate(t, tokens, context) }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < threshold) return null;

  // Tie-breaker: if top two within 1 point, prefer category_hint match,
  // otherwise the more specific (longer description) wins.
  if (scored.length >= 2 && scored[1].score === best.score) {
    if (context.category_hint) {
      const hinted = scored.find(s => s.template.category === context.category_hint && s.score === best.score);
      if (hinted) return hinted.template;
    }
  }

  // Sprint U fix: lesson-explain templates are experiment-specific.
  // Only serve a lesson-explain template when the query's experimentId
  // exactly matches the template's own inputs.experimentId. All other
  // lesson-explain queries fall through to LLM+RAG (return null).
  if (best.template.category === 'lesson-explain' && context.experimentId !== undefined) {
    const tplExpId = (best.template.inputs as Record<string, unknown> | undefined)?.experimentId;
    if (tplExpId !== context.experimentId) return null;
  }

  return best.template;
}

// ─── Argument interpolation ─────────────────────────────────────────────────

/**
 * Replace `${inputs.X}`, `${prev.Y}`, `${citation.Z}` tokens inside `args`
 * with concrete values. Unknown tokens are left untouched (best-effort).
 *
 * Recursively walks objects + arrays. Preserves non-string scalars.
 */
export function interpolateArgs(
  args: Record<string, unknown>,
  inputs: Record<string, unknown>,
  prev: Record<string, unknown> = {},
  citation: Record<string, unknown> = {},
): Record<string, unknown> {
  function visit(node: unknown): unknown {
    if (node === null || node === undefined) return node;
    if (typeof node === 'string') {
      return node.replace(/\$\{(inputs|prev|citation)\.([a-zA-Z0-9_]+)\}/g, (_full, scope, key) => {
        const src = scope === 'inputs' ? inputs : scope === 'prev' ? prev : citation;
        const v = src?.[key];
        if (v === undefined || v === null) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      });
    }
    if (Array.isArray(node)) return node.map(visit);
    if (typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        out[k] = visit(v);
      }
      return out;
    }
    return node;
  }
  return visit(args) as Record<string, unknown>;
}

// ─── Execution ──────────────────────────────────────────────────────────────

export interface ExecuteEnv {
  /**
   * Optional async retriever for the rag-retrieve step. Signature mirrors
   * `hybridRetrieve(query, topK)` from `./rag.ts`. Caller wires this in to
   * keep the router free of import-time side effects in unit tests.
   */
  ragRetrieve?: (query: string, topK: number) => Promise<Array<Record<string, unknown>>>;
  /**
   * Default citation when RAG retrieval fails or returns empty. Falls back
   * to `template.principio_zero.vol_pag` if available.
   */
  fallbackCitation?: { vol?: string; page?: string | number; verbatim?: string };
}

export interface ExecuteResult {
  templateId: string;
  resolvedSequence: ClawBotStep[];
  /**
   * Plain-text response with [AZIONE:<tool>:<args>] tags that the
   * client-side composite handler interprets. The final `speakTTS` text is
   * surfaced verbatim so the chat UI shows the docente-facing message.
   */
  responseText: string;
  citation: { vol?: string; page?: string | number; verbatim?: string } | null;
  latencyMs: number;
}

/**
 * Execute an L2 template by interpolating args and (optionally) invoking
 * the RAG retriever for a real citation. Tool dispatch is NOT performed
 * here — instead each step is encoded as `[AZIONE:tool:args]` for the
 * client to relay. This keeps the router Deno-pure.
 */
export async function executeTemplate(
  template: ClawBotTemplate,
  inputs: Record<string, unknown> = {},
  env: ExecuteEnv = {},
): Promise<ExecuteResult> {
  const t0 = Date.now();
  // Merge defaults from template.inputs for any keys not provided
  const mergedInputs: Record<string, unknown> = { ...template.inputs, ...inputs };

  let citation = env.fallbackCitation ?? null;
  if (!citation && template.principio_zero?.vol_pag) {
    // Parse "Vol.1 pag.156" into structured form for interpolation
    const m = template.principio_zero.vol_pag.match(/Vol\.(\d+)\s*pag\.(\d+)/i);
    if (m) {
      citation = { vol: m[1], page: m[2], verbatim: '' };
    }
  }

  const prev: Record<string, unknown> = {};
  const resolvedSequence: ClawBotStep[] = [];

  for (const step of template.sequence) {
    let args = interpolateArgs(step.args, mergedInputs, prev, (citation ?? {}) as Record<string, unknown>);

    // Side-effect: execute ragRetrieve server-side to get real citation
    if (step.tool === 'ragRetrieve' && env.ragRetrieve) {
      try {
        const queryArg = typeof args.query === 'string' ? args.query : '';
        const topK = typeof args.topK === 'number' ? args.topK : 3;
        const chunks = await env.ragRetrieve(queryArg, topK);
        prev.chunks = chunks;
        const top = chunks?.[0];
        if (top) {
          const vol = (top.vol as string) ?? (top.volume_id as string) ?? citation?.vol ?? '';
          const page = (top.page as string | number) ?? (top.page_number as string | number) ?? citation?.page ?? '';
          const content = typeof top.content === 'string' ? (top.content as string).slice(0, 120) : '';
          citation = { vol: String(vol), page, verbatim: content };
          // Re-interpolate the rest of args (in case query referenced citation)
          args = interpolateArgs(step.args, mergedInputs, prev, citation as unknown as Record<string, unknown>);
        }
      } catch (_err) {
        // RAG failure is non-fatal — keep fallback citation.
      }
    }

    resolvedSequence.push({ step: step.step, tool: step.tool, args, expected_status: 'ok' });

    if (template.fallback_strategy === 'halt-on-error') {
      // No actual error possible here (we don't dispatch), but honour the
      // contract for future client relays.
    }
  }

  // Build response text: pull last speakTTS step text verbatim, append AZIONE
  // tags for the other tools. This matches existing `[AZIONE:...]` UNLIM
  // convention used by useGalileoChat.
  const speakStep = [...resolvedSequence].reverse().find(s => s.tool === 'speakTTS');
  const speakText = (speakStep?.args?.text as string | undefined) ?? '';

  const actionTags = resolvedSequence
    .filter(s => s.tool !== 'speakTTS')
    .map(s => `[AZIONE:${s.tool}:${safeJson(s.args)}]`)
    .join(' ');

  const responseText = [speakText, actionTags].filter(Boolean).join('\n\n');

  return {
    templateId: template.id,
    resolvedSequence,
    responseText,
    citation,
    latencyMs: Date.now() - t0,
  };
}

function safeJson(o: unknown): string {
  try {
    return JSON.stringify(o);
  } catch {
    return '{}';
  }
}
