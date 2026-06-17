/**
 * postToVisionEndpoint — Sprint S iter 8 (ATOM-S8-A6)
 *
 * Real implementation of the `postToVisionEndpoint` sub-tool used by the
 * `analyzeImage` composite (composite_of=['captureScreenshot','postToVisionEndpoint']).
 *
 * Flow:
 *   1. captureScreenshot returned base64 PNG (passed via args._prev OR args.image)
 *   2. POST to Supabase Edge Function `unlim-diagnose` with the image + circuit
 *      topology context
 *   3. Receive structured Vision LLM response (description, components detected,
 *      anomalies, suggestions, citations)
 *   4. Return that response as the composite tail value
 *
 * Iter 6 had this as a stub returning 'todo_sett5'. Iter 8 ships the real path.
 *
 * Honesty caveat:
 *   - Endpoint `unlim-diagnose` is the Supabase Edge Function deployed iter 5
 *     P3 (production-live). Authentication via SUPABASE_ANON_KEY headers.
 *   - When env missing OR endpoint returns non-2xx, we return a structured
 *     error so the composite handler can fail at this stage gracefully.
 *   - We DO NOT mock-on-failure here. PRINCIPIO ZERO: no demo/fake data.
 *
 * (c) Andrea Marro — 2026-04-27 — gen-app-opus iter 8
 */

export interface PostToVisionArgs {
  /** Base64 PNG (typically passed in `_prev` from captureScreenshot step). */
  image?: string;
  /** Override prev for test stubbing. */
  _prev?: unknown;
  /** Optional circuit topology snapshot (components, wires) for context. */
  circuit?: {
    components?: Array<{ id: string; type: string; position?: string; value?: unknown }>;
    wires?: Array<{ from: string; to: string }>;
  };
  /** Optional UNLIM session linking. */
  session_id?: string;
  /** Optional teacher-supplied question to focus diagnosis. */
  prompt?: string;
}

export interface PostToVisionResult {
  status: 'ok' | 'error' | 'invalid_input';
  description?: string;
  components_detected?: string[];
  anomalies?: string[];
  suggestions?: string[];
  citations?: Array<{ source: string; chapter?: string; page?: number }>;
  raw?: unknown;
  error?: string;
  latency_ms: number;
}

const ENDPOINT_PATH = '/functions/v1/unlim-diagnose';

function getEnv(): { supabaseUrl: string; anonKey: string } {
  const env = (typeof Deno !== 'undefined' && (Deno as typeof Deno).env)
    ? Deno.env
    : (typeof process !== 'undefined'
       ? { get: (k: string) => process.env[k] }
       : { get: (_k: string) => undefined });
  return {
    supabaseUrl: (env.get('SUPABASE_URL') || '').trim(),
    anonKey: (env.get('SUPABASE_ANON_KEY') || env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim(),
  };
}

function extractImage(args: PostToVisionArgs): string | null {
  if (typeof args.image === 'string' && args.image.length > 0) return args.image;
  // composite-handler passes prior step result via _prev
  if (typeof args._prev === 'string' && args._prev.length > 0) return args._prev;
  if (args._prev && typeof args._prev === 'object') {
    const prev = args._prev as { image?: string; data?: string; screenshot?: string };
    return prev.image || prev.data || prev.screenshot || null;
  }
  return null;
}

/**
 * Real POST to unlim-diagnose Edge Function.
 *
 * @example
 *   const r = await postToVisionEndpoint({ _prev: '<base64>', circuit: {...} });
 *   if (r.status === 'ok') console.log(r.description);
 */
export async function postToVisionEndpoint(args: PostToVisionArgs = {}): Promise<PostToVisionResult> {
  const start = Date.now();

  const image = extractImage(args);
  if (!image) {
    return {
      status: 'invalid_input',
      error: 'no image provided (args.image or args._prev required, base64 PNG expected)',
      latency_ms: Date.now() - start,
    };
  }

  const { supabaseUrl, anonKey } = getEnv();
  if (!supabaseUrl || !anonKey) {
    return {
      status: 'error',
      error: 'SUPABASE_URL or SUPABASE_ANON_KEY missing — cannot POST to unlim-diagnose',
      latency_ms: Date.now() - start,
    };
  }

  const url = `${supabaseUrl}${ENDPOINT_PATH}`;

  const body = {
    image, // base64 PNG
    circuit: args.circuit || null,
    session_id: args.session_id || null,
    prompt: args.prompt || 'Analizza il circuito sulla breadboard. Identifica componenti, polarità, anomalie. Cita Vol/pag se applicabile.',
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000); // Vision LLM can take 8-12s

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      let errBody = '';
      try { errBody = await res.text(); } catch (_e) { /* skip */ }
      return {
        status: 'error',
        error: `unlim-diagnose http ${res.status}: ${errBody.slice(0, 160)}`,
        latency_ms: Date.now() - start,
      };
    }

    const data = await res.json();
    return {
      status: 'ok',
      description: data.description || data.analysis || data.text || '',
      components_detected: data.components_detected || data.components || [],
      anomalies: data.anomalies || [],
      suggestions: data.suggestions || data.next_steps || [],
      citations: data.citations || [],
      raw: data,
      latency_ms: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'error',
      error: `unlim-diagnose fetch failed: ${msg.slice(0, 160)}`,
      latency_ms: Date.now() - start,
    };
  }
}

/**
 * Test helper: lets dispatcher resolve `postToVisionEndpoint` against a stub api.
 * Mounted onto api.unlim namespace by app bootstrap iter 8.
 */
export const POST_TO_VISION_HANDLER_PATH = 'unlim.postToVisionEndpoint';
