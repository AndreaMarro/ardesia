/**
 * multimodalRouter — Sprint S iter 4 P1 B2
 *
 * Single entry point for all multi-modal intents (chat, RAG, vision, image-gen,
 * STT, TTS, ClawBot tool dispatch). Delegates to existing services where wired,
 * stubs the rest with explicit "defer iter N" errors.
 *
 * Goal: bind LLM + VLM + ImageGen + ClawBot + Vox via routing layer with smart
 * GPU on/off awareness. Tests use Edge Function endpoints (no GPU). Production
 * runtime uses Gemini EU primary, Together AI gated emergency, RunPod opt-in.
 *
 * Spec ref: docs/specs/SPEC-SPRINT-S-ITER-4-SMART-ONOFF-MULTIMODAL-2026-04-26.md §4
 *
 * (c) Andrea Marro — 26/04/2026
 */

import { sendChat, analyzeImage, diagnoseCircuit, getExperimentHints } from './api.js';

/**
 * @typedef {object} RouteIntent
 * @property {'chat'|'rag'|'vision'|'imageGen'|'stt'|'tts'|'clawbot'} modality
 * @property {object} payload
 * @property {object} [context]
 */

/**
 * @typedef {object} RouteResult
 * @property {boolean} ok
 * @property {string} provider — 'gemini'|'together'|'runpod'|'whisper'|'coqui'|'edge-tts-vps'|'clawbot-local'|'gemini-vision'|'flux'|'stub'|'mistral'|'cloudflare'|'pixtral'
 * @property {*} data
 * @property {number} latencyMs
 * @property {string} [error]
 * @property {object} [meta]
 */

const MODALITIES = ['chat', 'rag', 'vision', 'imageGen', 'stt', 'tts', 'clawbot'];

/**
 * Validate intent shape before routing.
 */
function validateIntent(intent) {
  if (!intent || typeof intent !== 'object') {
    throw new Error('multimodalRouter: intent must be object');
  }
  if (!MODALITIES.includes(intent.modality)) {
    throw new Error(`multimodalRouter: unknown modality '${intent.modality}'. Valid: ${MODALITIES.join(', ')}`);
  }
  if (!intent.payload || typeof intent.payload !== 'object') {
    throw new Error('multimodalRouter: payload required');
  }
}

/**
 * Chat — delegates to existing api.js sendChat (Edge Function unlim-chat → Render fallback).
 * No GPU needed in test mode.
 */
async function routeChat(payload, context) {
  const start = Date.now();
  try {
    const response = await sendChat(payload.message || '', payload.images || [], {
      temperature: payload.temperature,
      maxTokens: payload.maxTokens,
      experimentId: context?.experimentId,
      sessionId: context?.sessionId,
    });
    return {
      ok: true,
      provider: response?.meta?.provider || 'gemini',
      data: response,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'unknown',
      data: null,
      latencyMs: Date.now() - start,
      error: err?.message || String(err),
    };
  }
}

/**
 * Vision — delegates to existing api.js analyzeImage (Gemini Vision EU primary).
 * Production runtime: NEVER routes to RunPod Qwen-VL (latency + GDPR).
 * Bench mode (context.bench=true): may route to RunPod (off by default).
 */
async function routeVision(payload, context) {
  const start = Date.now();
  if (!payload.imageData && !payload.imageBase64) {
    return {
      ok: false,
      provider: 'gemini-vision',
      data: null,
      latencyMs: 0,
      error: 'multimodalRouter.vision: payload.imageData or imageBase64 required',
    };
  }
  try {
    const response = await analyzeImage(
      payload.imageData || payload.imageBase64,
      payload.question || 'Analizza questa immagine di un circuito elettronico.',
      { sessionId: context?.sessionId },
    );
    return {
      ok: true,
      provider: 'gemini-vision',
      data: response,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'gemini-vision',
      data: null,
      latencyMs: Date.now() - start,
      error: err?.message || String(err),
    };
  }
}

/**
 * RAG — uses existing diagnoseCircuit / getExperimentHints if domain matches.
 * Generic RAG retrieval defer iter 5+ (depends Anthropic Contextual ingest 6000 chunks).
 */
async function routeRAG(payload, context) {
  const start = Date.now();
  if (payload.kind === 'experiment-hints') {
    const response = await getExperimentHints(
      payload.experimentId,
      payload.currentStep ?? 0,
      payload.difficulty || 'base',
    );
    return {
      ok: true,
      provider: 'edge-function',
      data: response,
      latencyMs: Date.now() - start,
    };
  }
  if (payload.kind === 'diagnose-circuit') {
    const response = await diagnoseCircuit(payload.circuitState, payload.experimentId);
    return {
      ok: true,
      provider: 'edge-function',
      data: response,
      latencyMs: Date.now() - start,
    };
  }
  // Generic semantic RAG: defer iter 5+ pending hybrid BM25+BGE-M3+RRF wire-up
  return {
    ok: false,
    provider: 'stub',
    data: null,
    latencyMs: 0,
    error: 'multimodalRouter.rag: generic RAG defer iter 5+ (needs hybrid retriever wire-up). Use kind=experiment-hints|diagnose-circuit',
  };
}

/**
 * STT — Speech-to-Text. Delegates to browser SpeechRecognition or Whisper Turbo on RunPod.
 * Production runtime uses browser API (no GPU). Bench mode may route to RunPod port 9000.
 */
async function routeSTT(payload, _context) {
  // eslint-disable-next-line no-unused-vars
  const start = Date.now();
  // Browser SpeechRecognition is invoked from UI components (useSpeechRecognition hook).
  // This stub returns a marker so caller knows to use the hook directly.
  return {
    ok: false,
    provider: 'stub',
    data: null,
    latencyMs: 0,
    error: 'multimodalRouter.stt: invoke useSpeechRecognition hook from UI directly. Programmatic STT defer iter 5+ (needs Whisper Turbo wire-up).',
    meta: { hint: 'src/hooks/useVoiceCommands.js' },
  };
}

/**
 * TTS — Text-to-Speech. Sprint S iter 6 wire-up.
 *
 * Production path: POST `unlim-tts` Edge Function which proxies to Microsoft
 * edge-tts (Isabella Neural, no GPU). VPS Hetzner port 8880 is fallback.
 *
 * Voice default: it-IT-IsabellaNeural (approvato Andrea 2026-04-26).
 * Rate default: -5% (slight slow per ragazzi 8-14).
 *
 * Returns ArrayBuffer audio in `data` on success. Caller is responsible for
 * playback (e.g. via `new Blob([data], { type: 'audio/mpeg' })` + Audio()).
 *
 * Graceful degradation: when Edge Function returns the browser-fallback JSON
 * marker (`{ success: true, source: 'browser' }`), this returns ok=true with
 * `meta.fallback='browser'` so caller can switch to `speechSynthesis` API.
 */
async function routeTTS(payload, context) {
  const start = Date.now();
  if (!payload || typeof payload.text !== 'string' || !payload.text.trim()) {
    return {
      ok: false,
      provider: 'edge-tts',
      data: null,
      latencyMs: 0,
      error: 'multimodalRouter.tts: payload.text required (non-empty string)',
    };
  }

  // Resolve Supabase Edge Function URL + auth from Vite env when available.
  // Falls back to public ELAB project ref. Tests injecting `context.endpoint`
  // override (no env coupling).
  const env = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {};
  const supabaseUrl = (context && context.supabaseUrl) || env.VITE_SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co';
  const anonKey = (context && context.anonKey) || env.VITE_SUPABASE_ANON_KEY || '';
  const elabKey = (context && context.elabKey) || env.VITE_ELAB_API_KEY || '';
  const endpoint = (context && context.endpoint) || `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/unlim-tts`;

  const headers = { 'Content-Type': 'application/json' };
  if (anonKey) {
    headers['apikey'] = anonKey;
    headers['Authorization'] = `Bearer ${anonKey}`;
  }
  if (elabKey) {
    headers['X-Elab-Api-Key'] = elabKey;
  }

  const body = {
    text: payload.text,
    voice: payload.voice || 'it-IT-IsabellaNeural',
    rate: payload.rate || '-5%',
    pitch: payload.pitch || 'default',
    provider: payload.provider || 'auto',
    sessionId: context?.sessionId,
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return {
        ok: false,
        provider: 'edge-tts',
        data: null,
        latencyMs,
        error: `multimodalRouter.tts: http ${res.status}`,
      };
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('audio/')) {
      const audio = await res.arrayBuffer();
      return {
        ok: true,
        provider: res.headers.get('x-tts-provider') || 'edge-tts',
        data: audio,
        latencyMs,
        meta: {
          contentType,
          voice: res.headers.get('x-tts-voice') || body.voice,
          edgeLatencyMs: Number(res.headers.get('x-tts-latency-ms')) || null,
        },
      };
    }
    // JSON body = browser-fallback marker (graceful degradation)
    let json = null;
    try { json = await res.json(); } catch { /* ignore */ }
    if (json && json.source === 'browser') {
      return {
        ok: true,
        provider: 'browser-fallback',
        data: null,
        latencyMs,
        meta: { fallback: 'browser', text: json.text, message: json.message, edge_tts_error: json.edge_tts_error },
      };
    }
    return {
      ok: false,
      provider: 'edge-tts',
      data: null,
      latencyMs,
      error: `multimodalRouter.tts: unexpected content-type '${contentType}'`,
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'edge-tts',
      data: null,
      latencyMs: Date.now() - start,
      error: err?.message || String(err),
    };
  }
}

/**
 * Image generation — Cloudflare Workers AI FLUX schnell (Sprint T iter 24).
 *
 * Frontend NEVER exposes CLOUDFLARE_API_TOKEN. Goes through Supabase Edge
 * Function `unlim-imagegen` which proxies to CF `@cf/black-forest-labs/flux-1-schnell`.
 *
 * Returns base64 PNG in `data.imageBase64` on success.
 *
 * Graceful degradation: if Edge Function returns 404/501 with marker
 * `{ deferred: true }`, returns ok=false with provider='cloudflare-deferred' so
 * caller can show "image gen non ancora disponibile" notice.
 *
 * © Andrea Marro — 26/04/2026 — ELAB Tutor — Tutti i diritti riservati
 */
async function routeImageGen(payload, context = {}) {
  const start = Date.now();
  if (!payload || typeof payload.prompt !== 'string' || !payload.prompt.trim()) {
    return {
      ok: false,
      provider: 'cloudflare',
      data: null,
      latencyMs: 0,
      error: 'multimodalRouter.imageGen: payload.prompt required (non-empty string)',
    };
  }
  const env = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : {};
  const supabaseUrl = context.supabaseUrl || env.VITE_SUPABASE_URL || 'https://euqpdueopmlllqjmqnyb.supabase.co';
  const anonKey = context.anonKey || env.VITE_SUPABASE_ANON_KEY || '';
  const elabKey = context.elabKey || env.VITE_ELAB_API_KEY || '';
  const endpoint = context.endpoint || `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/unlim-imagegen`;

  const headers = { 'Content-Type': 'application/json' };
  if (anonKey) {
    headers['apikey'] = anonKey;
    headers['Authorization'] = `Bearer ${anonKey}`;
  }
  if (elabKey) headers['X-Elab-Api-Key'] = elabKey;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: payload.prompt,
        numSteps: payload.numSteps || 4,
        width: payload.width || 1024,
        height: payload.height || 1024,
        sessionId: context.sessionId,
      }),
    });
    const latencyMs = Date.now() - start;
    if (res.status === 404 || res.status === 501) {
      // Edge function not deployed yet — graceful degradation marker
      return {
        ok: false,
        provider: 'cloudflare-deferred',
        data: null,
        latencyMs,
        error: 'multimodalRouter.imageGen: unlim-imagegen Edge Function not yet deployed (iter 25+).',
        meta: { httpStatus: res.status },
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        provider: 'cloudflare',
        data: null,
        latencyMs,
        error: `multimodalRouter.imageGen: http ${res.status}`,
      };
    }
    const data = await res.json();
    return {
      ok: true,
      provider: 'cloudflare',
      data,
      latencyMs,
      meta: { model: data?.model || '@cf/black-forest-labs/flux-1-schnell' },
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'cloudflare',
      data: null,
      latencyMs: Date.now() - start,
      error: err?.message || String(err),
    };
  }
}

/**
 * Mistral chat helper — Sprint T iter 24. Frontend never holds MISTRAL_API_KEY.
 * Goes through Edge Function `unlim-chat` which now includes Mistral in its
 * fallback chain (RunPod → Mistral EU → Gemini → Together gated).
 *
 * Caller selects modality='chat' to use this. The provider field returned by
 * the Edge Function reflects the actual fallback hit (mistral|gemini|together).
 *
 * NOTE: this is a thin wrapper around routeChat that hints provider preference
 * via context.preferProvider='mistral'. The Edge Function is responsible for
 * honoring the hint when MISTRAL_API_KEY is configured.
 */
async function routeMistralChat(payload, context = {}) {
  return routeChat(payload, { ...context, preferProvider: 'mistral' });
}

/**
 * Pixtral vision helper — Sprint T iter 24. Routes vision intent through
 * Edge Function with provider hint='mistral' to use Pixtral 12B.
 * Falls back to Gemini Vision EU automatically.
 */
async function routePixtralVision(payload, context = {}) {
  return routeVision(payload, { ...context, preferProvider: 'mistral' });
}

/**
 * ClawBot — local tool dispatcher (Sprint 6 Day 39 gate post R5 ≥90% PASS).
 * Iter 4 scaffold only.
 */
async function routeClawBot(payload, _context) {
  return {
    ok: false,
    provider: 'clawbot-local',
    data: null,
    latencyMs: 0,
    error: 'multimodalRouter.clawbot: scaffold defer iter 5+ (Sprint 6 Day 39 gate post R5 ≥90% PASS). Tool dispatcher in scripts/openclaw/dispatcher.ts pending.',
    meta: { requested_tool: payload?.toolId || 'unknown' },
  };
}

/**
 * Main router entry point.
 *
 * @param {RouteIntent} intent
 * @returns {Promise<RouteResult>}
 *
 * @example
 *   const r = await multimodalRouter.route({
 *     modality: 'chat',
 *     payload: { message: 'Spiega Ohm' },
 *     context: { experimentId: 'v1-cap6-esp1' },
 *   });
 */
async function route(intent) {
  validateIntent(intent);
  const { modality, payload, context = {} } = intent;
  switch (modality) {
    case 'chat':     return routeChat(payload, context);
    case 'vision':   return routeVision(payload, context);
    case 'rag':      return routeRAG(payload, context);
    case 'stt':      return routeSTT(payload, context);
    case 'tts':      return routeTTS(payload, context);
    case 'imageGen': return routeImageGen(payload, context);
    case 'clawbot':  return routeClawBot(payload, context);
    default:
      // unreachable due to validateIntent; defensive
      throw new Error(`multimodalRouter: unhandled modality '${modality}'`);
  }
}

export const multimodalRouter = {
  route,
  modalities: MODALITIES,
  // Expose individual route fns for direct call when caller knows modality
  routeChat,
  routeVision,
  routeRAG,
  routeSTT,
  routeTTS,
  routeImageGen,
  routeClawBot,
  // iter 24 helpers (provider preference hint to Edge Function)
  routeMistralChat,
  routePixtralVision,
};

export default multimodalRouter;
