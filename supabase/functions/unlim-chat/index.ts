/**
 * Nanobot V2 — UNLIM Chat Edge Function
 * Handles POST /tutor-chat (text) and POST /chat (vision)
 * Routes to Gemini 3.x with student memory and circuit context.
 * Falls back to Galileo Brain on VPS if Gemini is unavailable.
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { callLLM, callBrainFallback, getMetrics } from '../_shared/llm-client.ts';
import { routeModel, modelDisplayName } from '../_shared/router.ts';
import { buildSystemPrompt } from '../_shared/system-prompt.ts';
import { loadStudentContext, saveInteraction, checkConsent } from '../_shared/memory.ts';
import { checkRateLimitPersistent, validateChatInput, sanitizeMessage, sanitizeCircuitState, validateExperimentId, validateMimeType, getCorsHeaders, getSecurityHeaders, checkBodySize, validateSessionId, verifyElabApiKey } from '../_shared/guards.ts';
import type { ChatRequest, ChatResponse, CircuitState } from '../_shared/types.ts';
import { retrieveVolumeContext, hybridRetrieve, formatHybridContext } from '../_shared/rag.ts';
import { getCapitoloByExperimentId, buildCapitoloPromptFragment } from '../_shared/capitoli-loader.ts';
import { validatePrincipioZero } from '../_shared/principio-zero-validator.ts';
import { selectTemplate, executeTemplate } from '../_shared/clawbot-template-router.ts';
import { aggregateOnniscenza } from '../_shared/onniscenza-bridge.ts';
// iter 37 Phase 1 Atom A2 — pre-LLM regex classifier drives ENABLE_ONNISCENZA
// conditional path: chit_chat skips aggregator (~500-1000ms saved), deep
// questions / safety / citations preserve top-3, plurale ragazzi top-2.
import { classifyPrompt } from '../_shared/onniscenza-classifier.ts';
// iter 36 Phase 1 Atom A1 — Onnipotenza dispatcher 62-tool wire post-LLM.
// Parses `[INTENT:{...}]` tags from LLM response, returns parsed intents in
// the API response so the client (browser-side __ELAB_API) can dispatch.
// `cleanText` strips the tags before TTS / display (Principio Zero V3
// preservation: tags don't pollute the user-facing line count / Vol/pag check).
import { parseIntentTags, stripIntentTags, type IntentTag } from '../_shared/intent-parser.ts';
// iter 38 A7 — Mistral function calling (structured output) opt-in for action prompts.
// Replaces legacy `[INTENT:{...}]` regex parsing path on a heuristic match.
// Falls through to legacy regex when ENABLE_INTENT_TOOLS_SCHEMA != true OR
// when the model didn't return parseable JSON (defensive).
import { INTENT_TOOLS_SCHEMA, shouldUseIntentSchema, CANONICAL_INTENT_TOOLS } from '../_shared/intent-tools-schema.ts';
import { buildDirectOperationalResponse, capWordsPreservingControlTags, UNLIM_MAX_VISIBLE_WORDS } from '../_shared/operational-response.ts';
import { selectUnlimAiProfile } from '../_shared/unlim-ai-profiles.ts';

// CORS headers dynamically generated per-request via getCorsHeaders(req)

// Voxtral TTS endpoint on VPS
const VPS_TTS_URL = Deno.env.get('VPS_TTS_URL') || 'http://72.60.129.50:8880/tts';

/**
 * Request TTS audio from Voxtral on VPS.
 * Non-blocking — returns URL or null.
 */
async function requestTTS(text: string): Promise<string | null> {
  try {
    // Strip action tags from TTS text
    const cleanText = text
      .replace(/\[azione:[^\]]+\]/gi, '')
      .replace(/\[AZIONE:[^\]]+\]/gi, '')
      .replace(/\[INTENT:\{[^}]+\}\]/g, '')
      .replace(/\n{2,}/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 5) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(VPS_TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voice: 'unlim-tutor',
        language: 'it',
        speed: 0.95,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    // Return audio as base64 data URL
    const audioBuffer = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    return `data:audio/mpeg;base64,${base64}`;
  } catch {
    // TTS failure is non-critical — text response still works
    return null;
  }
}

// Uptime tracking
const START_TIME = Date.now();
const VERSION = '2.1.0';

function mapDebugRetrievalChunk(cr: Record<string, unknown>): Record<string, unknown> {
  return {
    id: cr.id,
    content: cr.content,
    source: cr.source,
    chapter: cr.chapter,
    page: cr.page,
    section_title: cr.section_title,
    corpus: cr.corpus,
    score: cr.score,
  };
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  // Health check — GET returns status, uptime, version, metrics
  if (req.method === 'GET') {
    const uptime = Math.floor((Date.now() - START_TIME) / 1000);
    return new Response(JSON.stringify({
      status: 'ok',
      version: VERSION,
      uptimeSeconds: uptime,
      metrics: getMetrics(),
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: getSecurityHeaders(req),
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: getSecurityHeaders(req),
    });
  }

  // ── Defense-in-depth: custom ELAB API key check ──
  // Supabase anon JWT is shipped in the browser bundle and therefore scrapeable;
  // the X-Elab-Api-Key header gates the Edge Function with a server-only secret
  // that only legitimate ELAB builds carry. Fail-open when ELAB_API_KEY isn't
  // set so the deployment stays backward-compatible during rollout.
  const apiKeyCheck = verifyElabApiKey(req);
  if (!apiKeyCheck.ok) {
    return new Response(JSON.stringify({ success: false, error: 'unauthorized', reason: apiKeyCheck.reason }), {
      status: 401,
      headers: getSecurityHeaders(req),
    });
  }

  // Body size check (DoS protection)
  const bodyCheck = checkBodySize(req);
  if (bodyCheck) return bodyCheck;

  try {
    const body = await req.json() as ChatRequest & {
      debug_retrieval?: boolean;
      retrieval_mode?: 'hybrid' | 'dense' | 'auto';
      top_k?: number;
    };
    const { message, sessionId, circuitState, experimentId, simulatorContext, images, aiProfile: requestedAiProfile, aiDepth, unlimMode } = body;
    // Iter 10 P0 debug: surface retrieved chunks when bench/dev requests debug_retrieval=true
    const debugRetrieval = body.debug_retrieval === true;
    const retrievalModeReq = body.retrieval_mode;
    const topKReq = typeof body.top_k === 'number' && body.top_k > 0 && body.top_k <= 20 ? body.top_k : 5;

    // SessionId format validation
    if (!validateSessionId(sessionId)) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid sessionId format' }), {
        status: 400,
        headers: getSecurityHeaders(req),
      });
    }

    // Input validation
    const validation = validateChatInput(message, sessionId, images);
    if (!validation.valid) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 400,
        headers: getSecurityHeaders(req),
      });
    }

    // Rate limiting — persistent DB with in-memory fallback (30 req/min per session)
    const rateLimitAllowed = await checkRateLimitPersistent(sessionId);
    if (!rateLimitAllowed) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Stai andando troppo veloce! Aspetta qualche secondo.',
      }), {
        status: 429,
        headers: getSecurityHeaders(req),
      });
    }

    // Prompt injection guard
    const { safe, cleaned: safeMessage } = sanitizeMessage(message);
    if (!safe) {
      return new Response(JSON.stringify({
        success: true,
        response: safeMessage,
        source: 'guard',
      }), {
        status: 200,
        headers: getSecurityHeaders(req),
      });
    }

    // Sanitize inputs against injection
    const safeCircuitState = sanitizeCircuitState(circuitState);
    const safeExperimentId = validateExperimentId(experimentId);
    const safeImages = images?.map(img => ({
      ...img,
      mimeType: validateMimeType(img.mimeType),
    }));

    const hasImages = (safeImages?.length ?? 0) > 0;
    const liveSimulatorContext = simulatorContext && typeof simulatorContext === 'object'
      ? { ...simulatorContext, modalita: unlimMode || simulatorContext.modalita || simulatorContext.mode || simulatorContext.buildMode }
      : (unlimMode ? { modalita: unlimMode } : null);
    const activeAiProfile = selectUnlimAiProfile(safeMessage, {
      hasImages,
      requestedProfile: requestedAiProfile || null,
      requestedDepth: aiDepth || null,
      experimentId: safeExperimentId || null,
      simulatorContext: liveSimulatorContext,
      circuitState: safeCircuitState as CircuitState | null,
    });

    const directOperational = buildDirectOperationalResponse(safeMessage, safeCircuitState as CircuitState | null);
    if (directOperational) {
      saveInteraction(sessionId, safeExperimentId || null, safeExperimentId || 'operational', directOperational.response.slice(0, 100), directOperational.source)
        .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
      return new Response(JSON.stringify({
          success: true,
          response: directOperational.response,
          source: directOperational.source,
          dataProcessing: directOperational.dataProcessing,
          aiProfile: activeAiProfile.id,
        } satisfies ChatResponse), {
        status: 200,
        headers: getSecurityHeaders(req),
      });
    }

    // Consent check — configurable enforcement level via CONSENT_MODE env var:
    // 'strict' = block if consent not explicitly granted (requires Supabase Auth)
    // 'soft' = block if revoked, warn if unknown (default)
    // 'off' = no consent check
    const consentMode = Deno.env.get('CONSENT_MODE') || 'soft';
    if (consentMode !== 'off') {
      const consentStatus = await checkConsent(sessionId);
      if (consentStatus === 'revoked') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Il consenso genitoriale è stato revocato. Chiedi al tuo insegnante.',
        } satisfies ChatResponse), {
          status: 403,
          headers: getSecurityHeaders(req),
        });
      }
      if (consentMode === 'strict' && consentStatus !== 'granted') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Serve il consenso genitoriale per usare il tutor AI. Chiedi al tuo insegnante.',
        } satisfies ChatResponse), {
          status: 403,
          headers: getSecurityHeaders(req),
        });
      }
      if (consentStatus === 'unknown') {
        console.info(JSON.stringify({
          level: 'info', event: 'consent_unknown',
          sessionPrefix: sessionId.slice(0, 8),
          timestamp: new Date().toISOString(),
        }));
      }
    }

    // LIVE_CHAT_RAG: hybrid retrieval restored 2026-05-10.
    // Earlier directive 2026-05-09 disabled live RAG in chat hot path. Live prod
    // probes 2026-05-10 confirmed Vol/pag verbatim citations missing 3/5 because
    // static knowledge pack covers only chapter-level summaries, not page-level
    // verbatim quotes. Restore hybridRetrieve gated by classifier (chit_chat skips,
    // citation_vol_pag/plurale top-2, deep/safety/default top-3).
    // RAG metadata NULL gap (chapter/page/section_title) iter 14 backfill still
    // pending — citations limited to chunk content text until backfill ships.
    const studentContext = await loadStudentContext(sessionId);

    let ragContext = '';
    let retrievedChunksDebug: Array<Record<string, unknown>> = [];
    let retrievalModeUsed: 'hybrid' | 'dense' | 'fallback' = 'dense';

    // 2026-05-10 — Live RAG retrieval restored.
    // Run classifier first to decide topK; chit_chat skips entirely; others get
    // 2-3 chunks. Hybrid retrieval = dense (cosine) + sparse (BM25 italian) RRF k=60.
    // Defensive: errors fall through to empty ragContext (LLM still works on
    // static knowledge pack from system prompt).
    const promptClass = classifyPrompt(safeMessage);
    if (!promptClass.skipOnniscenza) {
      try {
        const ragTopK = Math.max(2, Math.min(3, promptClass.topK || 3));
        // 2026-05-10 iter 5 fix: 2s timeout race vs hybridRetrieve to avoid
        // P4 503 regression (full path LLM 8s + RAG 2-3s + Onniscenza 1-2s
        // exceeded global timeout). RAG timeout falls through to static pack.
        const RAG_TIMEOUT_MS = 2000;
        const ragTimeoutPromise = new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error('rag_timeout_2s')), RAG_TIMEOUT_MS)
        );
        const ragHitsPromise = hybridRetrieve(safeMessage, ragTopK, {
          source: safeExperimentId
            ? (safeExperimentId.startsWith('v1-') ? 'vol1' : safeExperimentId.startsWith('v2-') ? 'vol2' : safeExperimentId.startsWith('v3-') ? 'vol3' : undefined)
            : undefined,
        });
        const hits = await Promise.race([ragHitsPromise, ragTimeoutPromise]);
        if (hits && hits.length > 0) {
          ragContext = formatHybridContext(hits);
          retrievedChunksDebug = hits.map((h) => ({
            id: h.id,
            source: h.source,
            chapter: h.chapter,
            page: h.page,
            score: h.score,
            mode: h.mode,
          }));
          retrievalModeUsed = 'hybrid';
        }
      } catch (ragErr) {
        console.warn(JSON.stringify({
          level: 'warn', event: 'rag_hybrid_error',
          error: ragErr instanceof Error ? ragErr.message : 'unknown',
        }));
        // ragContext stays '' — fall through to static knowledge pack
      }
    }

    // Iter 30 P0.6 — Onniscenza 7-layer aggregator wire-up (opt-in env flag).
    // ENABLE_ONNISCENZA=true activates aggregateOnniscenza in parallel to RAG.
    // Augments ragContext with L4 class memory + L6 chat history + L7 analogia
    // when supabase client + history provided (non-blocking, defensive try/catch).
    //
    // iter 37 Atom A2 — conditional aggregator path (latency lift).
    // Pre-LLM regex classifier decides:
    //   chit_chat        => skip aggregator entirely (~500-1000ms saved)
    //   citation_vol_pag => onniscenza top-2 focused fetch (volume-anchored)
    //   plurale_ragazzi  => onniscenza top-2 (docente narrating, concise)
    //   deep_question    => onniscenza top-3 (full RRF context)
    //   safety_warning   => onniscenza top-3 (mandatory safety)
    //   default fallback => onniscenza top-3 (safer default)
    // promptClass already computed above for live RAG retrieval gate.
    let onniscenzaSnapshot: unknown = null;
    let onniTopK = 3; // top-K used for prompt injection (default keeps existing behavior)
    if ((Deno.env.get('ENABLE_ONNISCENZA') || 'false').toLowerCase() === 'true' && !promptClass.skipOnniscenza) {
      onniTopK = promptClass.topK;
      try {
        const supaUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
        const supaKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
        // Lightweight inline supabase adapter (avoids extra import bloat)
        let supaClient: unknown = null;
        if (supaUrl && supaKey) {
          // Minimal fetch-based adapter compatible with onniscenza-bridge expectations
          supaClient = {
            from: (table: string) => ({
              select: (cols: string) => ({
                eq: (col: string, val: unknown) => ({
                  limit: (n: number) => fetch(
                    `${supaUrl}/rest/v1/${table}?select=${cols}&${col}=eq.${val}&limit=${n}`,
                    { headers: { 'apikey': supaKey, 'Authorization': `Bearer ${supaKey}` } },
                  ).then((r) => r.ok ? r.json() : []),
                  order: () => ({
                    limit: (n: number) => fetch(
                      `${supaUrl}/rest/v1/${table}?select=${cols}&${col}=eq.${val}&limit=${n}`,
                      { headers: { 'apikey': supaKey, 'Authorization': `Bearer ${supaKey}` } },
                    ).then((r) => r.ok ? r.json() : []),
                  }),
                }),
              }),
            }),
          };
        }
        onniscenzaSnapshot = await aggregateOnniscenza({
          query: safeMessage,
          experiment_id: safeExperimentId,
          session_id: sessionId, // iter 35 fix Agent C audit: was undefined ref `safeSessionId` masked while ENABLE_ONNISCENZA off
          history: [], // caller history injection iter 31+
          supabase: supaClient,
          enable: { L1_rag: false /* already done above */, L3_glossario: false },
        });
      } catch (onniErr) {
        console.warn(JSON.stringify({
          level: 'warn', event: 'onniscenza_bridge_error',
          error: onniErr instanceof Error ? onniErr.message : 'unknown',
        }));
        onniscenzaSnapshot = null;
      }
    }

    // 3. Build system prompt with all context
    const experimentContext = safeExperimentId
      ? `Esperimento attivo: ${safeExperimentId}`
      : null;

    // Sprint S iter 2 — Task A4: resolve Capitolo from experimentId (defensive).
    // Legacy experimentId not yet in 37-Capitoli mapping → returns null → fragment empty.
    // buildSystemPrompt skips empty fragment, preserving legacy behavior (Task A5).
    let capitoloFragment = '';
    if (safeExperimentId) {
      try {
        const match = getCapitoloByExperimentId(safeExperimentId);
        capitoloFragment = buildCapitoloPromptFragment(match?.capitolo ?? null, safeExperimentId);
      } catch (capErr) {
        console.warn(JSON.stringify({
          level: 'warn', event: 'capitolo_fragment_error',
          experimentId: safeExperimentId,
          error: capErr instanceof Error ? capErr.message : 'unknown',
        }));
        capitoloFragment = '';
      }
    }

    // RAG rule is already in BASE_PROMPT; just append retrieved context
    // Image PII guard: instruct AI to ignore personal info in images
    const imagePiiGuard = hasImages
      ? '\n\nREGOLA IMMAGINI: Se l\'immagine contiene volti, nomi, indirizzi o dati personali, IGNORA queste informazioni. Analizza SOLO i componenti elettronici visibili. MAI menzionare persone o dati personali nelle risposte.'
      : '';

    // Iter 31 P0 Andrea mandate: Onniscenza snapshot inject prompt LLM.
    // 7-layer aggregator (RAG + Wiki + Glossario + Sessione + Vision + LLM-knowledge
    // + Analogia) fused via RRF k=60. Inject top-3 fused hits as additional context
    // to enable cross-layer reasoning ("incrociare tutto"). Defensive — only when
    // ENABLE_ONNISCENZA=true env flag set + snapshot non-null.
    let onniscenzaContext = '';
    if (onniscenzaSnapshot && typeof onniscenzaSnapshot === 'object') {
      const snap = onniscenzaSnapshot as { fused?: Array<{ layer?: string; text?: string; source?: string }> };
      // iter 37 A2: dynamic top-K from classifier (top-2 for citation/plurale, top-3 otherwise).
      const top3 = (snap.fused || []).slice(0, Math.max(0, onniTopK));
      if (top3.length > 0) {
        const onniLines = top3.map((h, i) => {
          const src = h.source || h.layer || 'onniscenza';
          const txt = (h.text || '').slice(0, 200).replace(/\n/g, ' ');
          return `${i + 1}. [${src}] ${txt}`;
        }).join('\n');
        onniscenzaContext = `\n\nCONTESTO ONNISCENZA (incrocio 7-layer RRF top-3 — usa per coerenza risposta):\n${onniLines}`;
      }
    }

    // iter 38 A7 — Mistral structured output gate (computed early so the
    // system prompt can include the schema override). Heuristic: action-verb
    // detector + env opt-in. When true, BASE_PROMPT's legacy [INTENT:...]
    // block is superseded by a JSON output instruction (see system-prompt.ts).
    const intentSchemaEnabled =
      (Deno.env.get('ENABLE_INTENT_TOOLS_SCHEMA') || 'false').toLowerCase() === 'true';
    const useIntentSchema = intentSchemaEnabled && shouldUseIntentSchema(safeMessage);

    const systemPrompt = buildSystemPrompt(
      studentContext,
      safeCircuitState as CircuitState | null,
      experimentContext,
      capitoloFragment,
      useIntentSchema,
      activeAiProfile,
    )
      + (ragContext ? `\n\n${ragContext}` : '')
      + onniscenzaContext
      + imagePiiGuard;

    // 3.5 ClawBot L2 template short-circuit (Sprint T iter 26).
    // Try keyword/category match BEFORE invoking the LLM. If a template fits,
    // execute it server-side, return [AZIONE:...] tags + speakTTS text. This
    // gives a deterministic morphic path for the 20 documented patterns
    // (introduce/explain/diagnose/guide/celebrate/recap/critique/debug/
    // reroute) and falls back to the LLM otherwise.
    try {
      const tpl = selectTemplate(safeMessage, {
        experimentId: safeExperimentId ?? undefined,
      });
      if (tpl) {
        const exec = await executeTemplate(tpl, { experimentId: safeExperimentId ?? undefined }, {
          ragRetrieve: async (_q: string, _k: number) => [],
        });
        const tplText = exec.responseText;
        // Iter 34 P0 latency fix Andrea "troppo lento":
        // PREVIOUSLY blocked chat response up to 3s waiting TTS render.
        // NOW return chat text IMMEDIATELY + frontend fetches TTS audio async
        // via separate /unlim-tts call when needed (audio decoupled from text).
        // Effect: -3s perceived latency template path.
        const tplAudio: string | null = null;
        // Save short audit row to student memory (non-blocking)
        const topicCategory = safeExperimentId || tpl.category;
        saveInteraction(sessionId, safeExperimentId || null, topicCategory, `tpl:${tpl.id}`, 'clawbot-l2')
          .catch(err => console.warn('[Nanobot V2] Memory save error:', err));

        const tplResponse: ChatResponse & {
          template_id?: string;
          template_category?: string;
          template_latency_ms?: number;
        } = {
          success: true,
          response: tplText,
          source: `clawbot-l2-${tpl.id}`,
          audio: tplAudio || undefined,
          dataProcessing: 'local-template',
          template_id: tpl.id,
          template_category: tpl.category,
          template_latency_ms: exec.latencyMs,
        };
        return new Response(JSON.stringify(tplResponse), {
          status: 200,
          headers: getSecurityHeaders(req),
        });
      }
    } catch (tplErr) {
      // Template router must NEVER break chat flow — fall through to LLM
      console.warn(JSON.stringify({
        level: 'warn', event: 'clawbot_template_error',
        error: tplErr instanceof Error ? tplErr.message : 'unknown',
      }));
    }

    // 4. Route to optimal model
    const routedModel = routeModel(safeMessage, hasImages, safeCircuitState as CircuitState | null);
    const model = activeAiProfile.depth === 'total' && routedModel === 'gemini-2.5-flash-lite'
      ? 'gemini-2.5-flash'
      : routedModel;

    // 4. Determine thinking level for Pro model
    const thinkingLevel = model === 'gemini-2.5-pro' ? 'medium' : undefined;

    // 5. Call LLM (Together default, Gemini fallback, Brain last resort)
    // Sprint S iter 5: Andrea decision — Together AI primary, Gemini fallback
    // (R5 49/50 PASS Llama 3.3 70B, audit docs/audits/2026-04-26-sprint-s-iter4-r5-together-direct-RESULT.md)
    // callLLM respects LLM_PROVIDER env (defaults to 'together' in llm-client.ts:192).
    //
    // iter 37 Phase 3 latency p95 mitigation:
    //   - Promise.race 8s timeout kills tail outliers (R5 max 17971ms = 18s).
    //   - On timeout, throws 'llm_timeout_8s' → caught by existing catch → callBrainFallback.
    //   - maxOutputTokens reduced 256→120 per iter 31 close mandate (sync llm-client.ts:311 default).
    // iter 38 A7 — Mistral structured-output flow.
    // `useIntentSchema` already computed earlier (BEFORE buildSystemPrompt) so
    // the system prompt could conditionally include the JSON output override.
    // Schema only takes effect when:
    //   1. env flag ENABLE_INTENT_TOOLS_SCHEMA enabled
    //   2. heuristic shouldUseIntentSchema(message) detects an action verb
    //   3. provider routing lands on Mistral (other providers ignore field)
    // When all three hold, Mistral returns a JSON object {text, intents?[]}
    // that we project to cappedText + parsed intents (replacing regex parse).
    let result;
    let preparsedIntents: unknown[] | null = null;
    try {
      const llmCallPromise = callLLM({
        model,
        systemPrompt,
        message: safeMessage,
        images: safeImages,
        maxOutputTokens: activeAiProfile.depth === 'total' ? 520 : 240,
        temperature: 0.7,
        thinkingLevel,
        preferFastProvider: true,
        // Iter 38 A7: structured output for Mistral when opt-in. Defensive:
        // other providers ignore this field; Mistral validates server-side.
        ...(useIntentSchema ? { responseFormat: INTENT_TOOLS_SCHEMA } : {}),
      });
      const timeoutPromise = new Promise<never>((_, rej) => {
        setTimeout(() => rej(new Error('llm_timeout_8s')), 8000);
      });
      result = await Promise.race([llmCallPromise, timeoutPromise]);

      // iter 38 A7 — when schema mode used + provider is Mistral, parse the
      // JSON object out of result.text and project text/intents back into
      // the legacy flow shape. If parse fails for any reason (provider
      // didn't honor schema, or Gemini fallback ran), we leave the original
      // text intact and rely on the legacy `parseIntentTags` regex below.
      if (useIntentSchema && result && typeof result.text === 'string' && result.provider === 'mistral') {
        try {
          const parsed = JSON.parse(result.text) as { text?: string; intents?: unknown[] };
          if (parsed && typeof parsed.text === 'string' && parsed.text.trim()) {
            // Cleanly substitute prose; cap + intent dispatch downstream still runs.
            result = { ...result, text: parsed.text };
            if (Array.isArray(parsed.intents) && parsed.intents.length > 0) {
              // Filter to canonical tool whitelist defensively (iter 38 4-way drift fix).
              preparsedIntents = parsed.intents.filter((i) => {
                const t = (i as { tool?: string })?.tool;
                return typeof t === 'string' && (CANONICAL_INTENT_TOOLS as readonly string[]).includes(t);
              });
            }
          }
        } catch (_parseErr) {
          // Defensive: legacy [INTENT:...] regex below will pick up any tags.
          console.info(JSON.stringify({
            level: 'info', event: 'intent_schema_parse_fallback',
            timestamp: new Date().toISOString(),
          }));
        }
      }
    } catch (llmError) {
      // Both Together + Gemini failed — try Brain fallback
      console.warn(JSON.stringify({
        level: 'warn', event: 'llm_fallback_brain',
        error: llmError instanceof Error ? llmError.message : 'unknown',
        timestamp: new Date().toISOString(),
      }));
      result = await callBrainFallback(safeMessage, systemPrompt);
      if (!result) {
        return new Response(JSON.stringify({
          success: false,
          error: 'AI temporaneamente non disponibile. Riprova tra qualche secondo.',
        } satisfies ChatResponse), {
          status: 503,
          headers: getSecurityHeaders(req),
        });
      }
    }

    // 6. Cap visible prose length, preserving complete action/intent tags.
    // 2026-05-10 iter 6 — defensive translate `[ACTION:...]` (English drift)
    // → `[AZIONE:...]` italiano BEFORE cap. LLM occasionally emits English
    // uppercase ACTION format despite system prompt (live prod probe P7 v52);
    // browser whitelist case-insensitive accepts only `[azione:...]` so untranslated
    // tags get silently dropped. Translation in regex preserve order + payload.
    const translatedText = (result.text || '').replace(/\[ACTION:/gi, '[AZIONE:');
    const cappedText = capWordsPreservingControlTags(
      translatedText,
      Math.min(activeAiProfile.maxVisibleWords || UNLIM_MAX_VISIBLE_WORDS, UNLIM_MAX_VISIBLE_WORDS),
    );

    // 6a. Sprint T iter 36 Phase 1 — Atom A1 — Onnipotenza dispatcher wire-up.
    // Parse `[INTENT:{tool:"...",args:{...}}]` tags from the LLM response and
    // surface them as `intents_parsed` for the client (browser `__ELAB_API`)
    // to dispatch. Server-side dispatch is NOT performed here because the
    // 62-tool registry handlers live in the browser context (see
    // `scripts/openclaw/dispatcher.ts` which resolves `globalThis.__ELAB_API`).
    // Defensive: never throws — empty array on any error / no tags.
    let parsedIntents: IntentTag[] = [];
    let cleanText = cappedText;
    try {
      // iter 38 A7: when Mistral structured-output produced intents, prefer
      // them (already validated against canonical schema). Otherwise fall
      // back to legacy regex parse on capped text.
      if (preparsedIntents && preparsedIntents.length > 0) {
        parsedIntents = preparsedIntents
          .map((i) => {
            const o = i as { tool?: unknown; args?: unknown };
            const tool = typeof o.tool === 'string' ? o.tool : '';
            const args = (o.args && typeof o.args === 'object' && !Array.isArray(o.args))
              ? (o.args as Record<string, unknown>)
              : {};
            return tool ? ({ tool, args } as IntentTag) : null;
          })
          .filter((x): x is IntentTag => x !== null);
        cleanText = cappedText; // schema mode already returned clean prose
        if (parsedIntents.length > 0) {
          console.info(JSON.stringify({
            level: 'info', event: 'intents_parsed_schema',
            count: parsedIntents.length,
            tools: parsedIntents.map(i => i.tool),
            experimentId: safeExperimentId || null,
            timestamp: new Date().toISOString(),
          }));
        }
      } else {
        parsedIntents = parseIntentTags(cappedText);
        cleanText = stripIntentTags(cappedText);
        if (parsedIntents.length > 0) {
          console.info(JSON.stringify({
            level: 'info', event: 'intents_parsed',
            count: parsedIntents.length,
            tools: parsedIntents.map(i => i.tool),
            experimentId: safeExperimentId || null,
            timestamp: new Date().toISOString(),
          }));
        }
      }
    } catch (intentErr) {
      // Parser must NEVER break chat flow.
      console.warn('[Nanobot V2] intent-parser error (non-blocking):', intentErr);
      parsedIntents = [];
      cleanText = cappedText;
    }

    // 6b. Sprint S iter 2 — Task A4: post-LLM PRINCIPIO ZERO validation.
    // Append-warning pattern: log violations, NEVER reject/modify response.
    // CRITICAL severity → console.error; lower → no-op (telemetry future).
    try {
      const isConceptIntro = false; // best-guess; future: derive from experimentContext metadata
      const pzValidation = validatePrincipioZero(cleanText, { isConceptIntro });
      if (pzValidation.severity === 'CRITICAL') {
        console.error(JSON.stringify({
          level: 'error', event: 'pz_critical_violation',
          violations: pzValidation.violations,
          experimentId: safeExperimentId || null,
          model: result.model,
          sample: cleanText.slice(0, 200),
          timestamp: new Date().toISOString(),
        }));
      } else if (pzValidation.violations.length > 0) {
        console.info(JSON.stringify({
          level: 'info', event: 'pz_violations',
          severity: pzValidation.severity,
          count: pzValidation.violations.length,
          rules: pzValidation.violations.map(v => v.rule),
          experimentId: safeExperimentId || null,
        }));
      }
    } catch (pzErr) {
      // Validator must NEVER break chat flow.
      console.warn('[Nanobot V2] PZ validator error (non-blocking):', pzErr);
    }

    // Iter 34 P0 latency fix Andrea "troppo lento":
    // PREVIOUSLY blocked chat response up to 3s waiting TTS render (Promise.race).
    // NOW return chat text IMMEDIATELY + frontend fetches TTS audio async via
    // separate /unlim-tts call when needed. Effect: -3s perceived latency.
    // 7. Save interaction to memory (async, non-blocking)
    const topicCategory = safeExperimentId || 'general';
    saveInteraction(sessionId, safeExperimentId || null, topicCategory, cleanText.slice(0, 100), result.model)
      .catch(err => console.warn('[Nanobot V2] Memory save error:', err));

    const audioUrl: string | null = null; // decoupled — frontend fetches separately

    // 10. Return response — include data processing transparency (GDPR)
    const response: ChatResponse & {
      debug_retrieval?: Array<Record<string, unknown>>;
      retrieval_mode?: string;
      intents_parsed?: Array<{ tool: string; args: Record<string, unknown> }>;
      // iter 37 A2: telemetry for benchmark/debug. Omitted unless debug_retrieval=true to keep payload minimal.
      prompt_class?: { category: string; skipOnniscenza: boolean; topK: number; wordCount: number };
    } = {
      success: true,
      response: cleanText,
      // iter 24: use result.model (actual provider model) when provider != gemini
      source: result.provider === 'mistral' ? result.model
        : result.provider === 'together' ? `together-${result.model}`
        : result.provider === 'brain' ? 'brain'
        : modelDisplayName(model) || result.model,
      audio: audioUrl || undefined,
      dataProcessing: result.provider === 'mistral' ? 'mistral-eu'
        : result.provider === 'together' ? 'together-ai'
        : result.provider === 'brain' ? 'local-brain'
        : 'google-gemini',
      aiProfile: activeAiProfile.id,
    };
    // Iter 10 P0: surface retrieved chunks for bench (B2 hybrid RAG eval)
    if (debugRetrieval) {
      response.debug_retrieval = retrievedChunksDebug;
      response.retrieval_mode = retrievalModeUsed;
      // iter 37 A2: surface classifier verdict for bench R5 latency measurement.
      response.prompt_class = {
        category: promptClass.category,
        skipOnniscenza: promptClass.skipOnniscenza,
        topK: promptClass.topK,
        wordCount: promptClass.wordCount,
      };
    }

    // iter 36 Phase 1 Atom A1: surface parsed intents for client-side dispatch
    // via window.__ELAB_API. Empty array omitted to keep payload minimal.
    if (parsedIntents.length > 0) {
      response.intents_parsed = parsedIntents.map(i => ({ tool: i.tool, args: i.args }));
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: getSecurityHeaders(req),
    });

  } catch (err) {
    // Structured logging — no internal details to client
    console.error(JSON.stringify({
      level: 'error',
      event: 'chat_error',
      error: err instanceof Error ? err.message : 'unknown',
      timestamp: new Date().toISOString(),
    }));
    return new Response(JSON.stringify({
      success: false,
      error: 'Errore interno. Riprova.',
    } satisfies ChatResponse), {
      status: 500,
      headers: getSecurityHeaders(req),
    });
  }
});
