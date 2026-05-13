/**
 * Nanobot V2 — UNLIM Chat Edge Function
 * Handles POST /tutor-chat (text) and POST /chat (vision)
 * Routes to Gemini 3.x with student memory and circuit context.
 * Falls back to Galileo Brain on VPS if Gemini is unavailable.
 * (c) Andrea Marro — 02/04/2026
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { callLLM, callBrainFallback, getMetrics } from '../_shared/llm-client.ts';
import { routeModel, routeThinkingLevel, modelDisplayName } from '../_shared/router.ts';
import { buildSystemPrompt } from '../_shared/system-prompt.ts';
import { loadStudentContext, saveInteraction, saveMessageHistory, checkConsent, loadRecentHistory, extractVolCapFromMessage } from '../_shared/memory.ts';
import { buildOfftopicGentleBridge, type OfftopicType } from '../_shared/offtopic-template-response.ts';
import { checkRateLimitPersistent, validateChatInput, sanitizeMessage, sanitizeCircuitState, validateExperimentId, validateMimeType, getCorsHeaders, getSecurityHeaders, checkBodySize, validateSessionId, verifyElabApiKey } from '../_shared/guards.ts';
import type { ChatRequest, ChatResponse, CircuitState } from '../_shared/types.ts';
import { retrieveVolumeContext, hybridRetrieve, formatHybridContext } from '../_shared/rag.ts';
import { getCapitoloByExperimentId, buildCapitoloPromptFragment, inferCapitoloFromMessage, buildCapitoloSummaryFragment } from '../_shared/capitoli-loader.ts';
import { buildCitazioneFragment, rewriteCitationToCanonical, forceCitationFromQuery, forceCitationFromSession } from '../_shared/volumi-citazioni.ts';
import { validatePrincipioZero, enforceItalianK12Opener, rewriteSingolareToPlurale } from '../_shared/principio-zero-validator.ts';
// iter 11 P0 — Andrea mandate: 10 paletti runtime checkContentSafety post-LLM.
// Audit iter 11 backend trovò content-safety-guard.ts (306 LOC) DEAD CODE non wired.
// Wire post-enforcer + pre-PZ-validator. Live smoke Q9 220V FAIL → safety_warning trigger.
import { checkContentSafety } from '../_shared/content-safety-guard.ts';
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
// iter 27 Agent Z — safety hardcoded fallback wrap.
// Iter 24 dim-1 LIVE prod bench: Cat C "scossa" returned 503 vuoto (GDPR
// rischio minori 8-14 anni). Iter 25 P0-B shipped pure fallback helper.
// Iter 27 wires it into the catch path so when the entire LLM chain
// (Together → Gemini → Brain) returns nothing OR Promise.race timeout
// fires on a SAFETY-relevant query, we emit the canonical 220V refusal
// instead of HTTP 503. ZERO network. ZERO breaking change on success path.
import { getSafetyHardcodedResponse } from '../_shared/safety-hardcoded-fallback.ts';
// Broader Cat C safety detection: voltage_danger regex covers 220V/110V/presa
// of `safeMessage`, but iter 24 evidence also showed "scossa" / "brucia" /
// "elettrocuzione" / "pericoloso" / "ferito" miss the strict voltage regex.
// Local module-private regex to AVOID coupling with VOLTAGE_DANGER_QUERY_RE
// (line 235) — that pattern is iter 11 PATCH B owned, do not redefine here.
const ITER27_SAFETY_BROAD_RE = /\b(scossa|scoss[ae]|elettrocuzion[ei]|brucia(?:re|to|ti|no)?|pericolo(?:so|si)?|ferit[oai]|folgora(?:re|to)?|ustion[ei])\b/i;
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
      .replace(/\[INTENT:\{[\s\S]*?\}\]/g, '')
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

    // iter 11 PATCH B — PRE-LLM voltage_danger detector
    // Live smoke Q9 "Posso usare 220V casa?" → UNLIM rispondeva senza redirect 9V.
    // Hard-block pre-LLM con redirect template plurale Ragazzi + kit ELAB 9V batteria sicura.
    const VOLTAGE_DANGER_QUERY_RE = /\b(220\s*[Vv]|110\s*[Vv]|tensione\s+di\s+rete|presa\s+(di\s+corrente|a\s+muro|elettrica)|prese\s+a\s+muro|impianto\s+elettrico|alta\s+tensione|corrente\s+di\s+casa|elettricit[àa]\s+di\s+casa)\b/i;
    if (VOLTAGE_DANGER_QUERY_RE.test(safeMessage)) {
      const safetyResp = `Ragazzi, attenzione: 220V casa è pericoloso per ragazzi 8-14 anni. Sul kit ELAB usate sempre la batteria 9V — sicura e perfetta per tutti gli esperimenti dei volumi. Per dubbi, controllate il libro o chiedete al docente.`;
      saveInteraction(sessionId, safeExperimentId || null, 'safety_voltage', safetyResp.slice(0, 100), 'safety-pre-llm', safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
      // iter 26 P0 — saveMessageHistory wire safety-pre-llm path timeline (Doc-4 #1).
      saveMessageHistory(sessionId, safeExperimentId || null, null, null, 'safety_voltage', safeMessage, safetyResp.slice(0, 100), 'safety-pre-llm')
        .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));
      return new Response(JSON.stringify({
        success: true,
        response: safetyResp,
        source: 'safety-pre-llm',
        dataProcessing: 'pre-llm-safety-block',
        aiProfile: activeAiProfile.id,
        safety_fires: ['voltage_danger'],
        prompt_class: { category: 'safety_warning', skipOnniscenza: true, topK: 0, wordCount: safeMessage.split(/\s+/).length },
      } satisfies ChatResponse & Record<string, unknown>), {
        status: 200,
        headers: getSecurityHeaders(req),
      });
    }

    // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea screenshot evidence:
    // OFFTOPIC_QUERY_RE matchava "storia" all'interno del template envelope
    // `[GERARCHIA CONTESTO] ... esperimenti/storia come cose visibili ora.`
    // di api.js:783 → ON-TOPIC user query (legge Ohm, LED, etc.) classificata
    // erroneamente off-topic. Strip envelope blocks before regex test.
    // Iter 44 P0 Andrea 2026-05-13 prod screenshot evidence: pre-LLM detector
    // matched expNamePatterns words ("semaforo", "primo LED") INSIDE system-injected
    // context blocks like [GERARCHIA CONTESTO]/[RIFERIMENTO LIBRO FISICO]. Previous
    // regex required `\n\n` paragraph terminator — failed on SINGLE-LINE envelopes
    // from frontend api.js:783 envelope-builder. Surgical fix: strip ALL square-bracket
    // UPPERCASE system-tag content from `[TAG ...]` until next `[AZIONE`/`[INTENT` OR EOF
    // OR another `[UPPERCASE_TAG]` block. Strip envelope tags whitelist-style.
    const SYSTEM_TAG_RE = /\[(?:GERARCHIA\s+CONTESTO|PRESENTE\s+LIVE|CONTESTO\s+CAPITOLO|NARRAZIONE\s+LIVE|RIFERIMENTO\s+LIBRO\s+FISICO|STORIA\s+SESSIONI|MEMORIA\s+(?:STUDENTE|PASSATA)|REGIA\s+(?:MULTI-AI|PARALLELA)|PROFILO\s+ATTIVO|AGENT_DECISION_JSON|AUTOCOSCIENZA|CITAZIONE\s+VOL|CONOSCENZA\s+DAI\s+VOLUMI|CONTESTO|Hybrid\s+RAG|FONTE|wiki|rag|glossario|docs)\b[\s\S]*?(?=\[(?:AZIONE|INTENT|GERARCHIA|PRESENTE|CONTESTO|NARRAZIONE|RIFERIMENTO|STORIA|MEMORIA|REGIA|PROFILO|AGENT|AUTOCOSCIENZA|CITAZIONE|CONOSCENZA|Hybrid|FONTE|wiki|rag|glossario|docs)\b|$)/gi;
    const stripEnvelope = (s: string): string => String(s || '')
      .replace(SYSTEM_TAG_RE, ' ')
      .replace(/REGOLA:[\s\S]*?(?:\n\n|$)/gi, ' ')
      .replace(/\{[\s\S]{200,}?\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const userQueryStripped = stripEnvelope(safeMessage) || safeMessage;

    // iter 11 PATCH B — PRE-LLM off-topic detector (matematica/aritmetica/capitali/sport/cinema/etc.)
    // Live smoke Q8 "Quanto fa 2+2?" → UNLIM rispondeva "Fa 4." senza redirect ELAB.
    // Hard-redirect pre-LLM con plurale Ragazzi + invito kit ELAB.
    // iter 22 — expand OFFTOPIC_QUERY_RE per edge case 33% pass test 9 patterns.
    // iter 20 baseline added: presidente/squadre calcio/Serie A/partita/gol/campionato.
    // iter 22 add: math operators (5x7/5+7) + "capitale X" (no preposition) + guerra mondiale +
    // teorema/formula/equazione + Marvel/Disney/Hollywood/Netflix/Amazon film/serie.
    // Iter 41 Sprint U Cycle 2 — extend cooking + historical figures detection.
    const OFFTOPIC_QUERY_RE = /\b(quanto\s+fa\s+\d+(?:\s*[+\-*x×÷/]\s*\d+)?|matematica\s+(?!del|della|dei|degli|del\s+LED|del\s+circuito)|aritmetica|teorema(?!\s+di\s+kirchhoff)|formula\s+(?:matematica|chimica|fisica\s+(?!del\s+circuito))|equazione\s+(?!circuito|elettrica)|capitale\s+\w+|presidente(?:\s+(di|del|della))?|chi\s+è\s+il\s+presidente|geografia|storia\s+(?!del|della|dei|degli|elettronica|arduino)|guerra\s+(?:mondiale|prima|seconda)|sport(?!ello)|cinema|musica|videogioc|tiktok|instagram|youtube|pokemon|calcio|basket|tennis|Inter|Juventus|Milan(?!\s+città)|Roma(?!\s+città)|Napoli(?!\s+città)|Lazio|Atalanta|Serie\s+A|Champions|partita|gol|campionato|risultato\s+(inter|juventus|milan|roma|napoli|lazio|atalanta|serie\s+a)|risultato\s+sportivo|film\s+(?:Marvel|Disney|Hollywood|nuovo|recente|ultimo)|serie\s+(?:Netflix|Amazon|HBO|TV)|Marvel|Disney(?!\s+land)|Hollywood|canzone\s+(?:tiktok|virale|nuova)|Pitagora|Pitagorica|cuoc\w*|cuccere|bollire|friggere|condire|impastare|ricett\w*|ingredient\w*|Napoleone|Cesare|Garibaldi|Mussolini|Hitler|Stalin|imperatore|imperat(?:rice|rici)|antichi\s+romani|antichi\s+greci|medioevo|rinascimento|rivoluzione\s+francese|rivoluzione\s+industriale|Netflix|Fortnite|Sanremo|TikTok|YouTube|Instagram|pasta\s+(?:al\s+pomodoro|alla?|in\s+bianco|carbonara)|pizza\s+margherita|tiramisu|lasagne|risotto|carbonara|amatriciana|traduci\b|come\s+si\s+dice|in\s+inglese|in\s+francese|in\s+spagnolo|in\s+tedesco|translation|translate)\b/i;
    if (OFFTOPIC_QUERY_RE.test(userQueryStripped)) {
      // iter 21 Andrea mandate "deve riportare al focus del discorso LENTAMENTE" — NON brutal rejection.
      // Acknowledge brief + gentle bridge + recall session lastExperimentId se disponibile.
      // 3-step pattern: (1) acknowledge curiosità (2) bridge dolce a ELAB context (3) recall/proposta.
      // iter 24 Phase 2 P2 latency fix — Promise.race timeout 100ms (Doc-1 evidence iter 21 await loadStudentContext blocks hot-path +200-300ms).
      // Trade-off: 100ms slow session → no recall (fallback "prima volta" template). Acceptable hot-path target <300ms.
      const offSessionCtx = await Promise.race([
        loadStudentContext(sessionId).catch(() => null),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 100)),
      ]);
      const hasSession = offSessionCtx?.lastExperimentId;
      // Detect tipo off-topic per acknowledge personalizzato
      // iter 22 — extend isMath/isHistory/isCulture detect regex (iter 21 acknowledge 33%→67%→?)
      const isSport = /\b(calcio|inter|juventus|milan|roma|napoli|lazio|atalanta|serie\s+a|champions|partita|gol|campionato|sport(?!ello))\b/i.test(safeMessage);
      // iter 22.3 fix bug \b boundary fail on "5x7" (no boundary digit-letter). Remove trailing \b after \d, add operator.
      const isMath = /\b(quanto\s+fa\s+\d+|aritmetica|matematica|teorema|formula\s+(?:matematica|fisica|chimica)|equazione|pitagora|pitagorica)/i.test(safeMessage);
      const isHistory = /\b(presidente|capitale\s+\w+|geografia|storia|guerra\s+(?:mondiale|prima|seconda))\b/i.test(safeMessage);
      const isCulture = /\b(cinema|musica|tiktok|instagram|youtube|videogioc|pokemon|film|serie\s+(?:tv|netflix|amazon)|marvel|disney|hollywood|canzone)\b/i.test(safeMessage);
      let acknowledge: string;
      if (isSport) acknowledge = 'Ragazzi, capisco la passione per lo sport! È bello avere altre passioni.';
      else if (isMath) acknowledge = 'Ragazzi, bella curiosità matematica!';
      else if (isHistory) acknowledge = 'Ragazzi, bella domanda di cultura generale!';
      else if (isCulture) acknowledge = 'Ragazzi, capisco la curiosità!';
      else acknowledge = 'Ragazzi, è una bella curiosità!';
      const bridge = `Però adesso siamo dentro il nostro percorso ELAB — qui ci occupiamo di elettronica e Arduino.`;
      const recall = hasSession
        ? ` Ricordate? Stavamo lavorando su ${offSessionCtx.lastExperimentId} (Vol.${offSessionCtx.currentVolume || '?'} cap.${offSessionCtx.currentChapter || '?'}). Riprendiamo da lì insieme? [AZIONE:loadexp:${offSessionCtx.lastExperimentId}]`
        : ` Volete iniziare un esperimento sul kit ELAB? Possiamo cominciare con il primo LED del Vol.1 cap.6, oppure scegliete voi.`;
      const offResp = `${acknowledge} ${bridge}${recall}`;
      saveInteraction(sessionId, safeExperimentId || null, 'offtopic_redirect', offResp.slice(0, 100), 'offtopic-pre-llm', safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
      // iter 26 P0 — saveMessageHistory wire offtopic-pre-llm legacy regex path timeline (Doc-4 #1).
      saveMessageHistory(sessionId, safeExperimentId || null, offSessionCtx?.currentChapter || null, offSessionCtx?.currentVolume || null, 'offtopic_redirect', safeMessage, offResp.slice(0, 100), 'offtopic-pre-llm')
        .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));
      return new Response(JSON.stringify({
        success: true,
        response: offResp,
        source: 'offtopic-pre-llm',
        dataProcessing: 'pre-llm-offtopic-redirect',
        aiProfile: activeAiProfile.id,
        safety_fires: ['off_topic'],
        prompt_class: { category: 'default', skipOnniscenza: true, topK: 0, wordCount: safeMessage.split(/\s+/).length },
      } satisfies ChatResponse & Record<string, unknown>), {
        status: 200,
        headers: getSecurityHeaders(req),
      });
    }

    // Iter 44 P0 hotfix Andrea 2026-05-13 prod screenshot evidence: pre-LLM detector
    // was receiving FULL envelope `safeMessage` containing [GERARCHIA CONTESTO]
    // system narrative with experiment context words like "semaforo", "primo LED".
    // Detector matched expNamePatterns inside CONTEXT blocks → returned mount-experiment
    // template regardless of actual user query. Verified prod: envelope containing
    // "esperimenti/semaforo come template" → returned "Ragazzi, apriamo esperimento del semaforo"
    // for ANY user query. Surgical fix: pass `userQueryStripped` (already computed line 283
    // via stripEnvelope) instead of `safeMessage`. Preserves detector behavior on REAL user
    // query, strips system-injected context words.
    const directOperational = buildDirectOperationalResponse(userQueryStripped, safeCircuitState as CircuitState | null);
    if (directOperational) {
      // iter 20 P0 BUG FIX — direct-operational source bypassava enforcer + forceCitation*
      // → iter 19 stress 100q evidence: 5+ fail su categorie A/E/H (Arduino bypass canned string
      // "Passo ad Arduino e preparo Blink sul pin 13" ignora Vol/pag + plurale).
      // Wire enforceItalianK12Opener + rewriteCitationToCanonical + forceCitationFromQuery
      // + forceCitationFromSession (iter 20 P0 short-prompt recall) su direct-operational path.
      // Load studentContext sync per session-based citation force (short blocking ~250ms OK).
      const opStudentCtx = await loadStudentContext(sessionId).catch(() => null);
      let opResponse = enforceItalianK12Opener(directOperational.response);
      opResponse = rewriteCitationToCanonical(opResponse);
      opResponse = forceCitationFromQuery(safeMessage, opResponse);
      opResponse = forceCitationFromSession(opStudentCtx?.lastExperimentId || null, opResponse);
      saveInteraction(sessionId, safeExperimentId || null, safeExperimentId || 'operational', opResponse.slice(0, 100), directOperational.source, safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
      // iter 26 P0 — saveMessageHistory wire direct-operational path timeline (Doc-4 #1).
      const opChapterMatch = (safeExperimentId || '').match(/cap(\d+)/);
      const opChapter = opChapterMatch ? parseInt(opChapterMatch[1], 10) : (opStudentCtx?.currentChapter || null);
      const opVolMatch = (safeExperimentId || '').match(/^v([1-3])/);
      const opVolume = opVolMatch ? parseInt(opVolMatch[1], 10) : (opStudentCtx?.currentVolume || null);
      saveMessageHistory(sessionId, safeExperimentId || null, opChapter, opVolume, safeExperimentId || 'operational', safeMessage, opResponse.slice(0, 100), directOperational.source)
        .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));
      return new Response(JSON.stringify({
          success: true,
          response: opResponse,
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
    //
    // 2026-05-10 iter 8 Agent 2 Fix 1: Promise.all parallelize loadStudentContext
    // + hybridRetrieve. Previously sequential ~250ms + 2000ms = 2250ms. Now
    // parallel, max(250, 2000) = 2000ms = -250ms p95 lift. Onniscenza aggregator
    // remains sequential (depends on classifier output already computed).
    // Reuse stripped query computed above (line ~272) per Andrea iter 41 fix.
    const promptClass = classifyPrompt(userQueryStripped);

    // iter 25 P0-C — off-topic Cat D regression fix (vs iter 5 P3 91.80% baseline, dim-1 measured 37.5%).
    // Classifier off_topic category triggers template response WITHOUT LLM call (deterministic).
    // 3-step gentle bridge pattern Andrea iter 21 mandate "riportare al focus LENTAMENTE".
    // Runs AFTER legacy inline OFFTOPIC_QUERY_RE block (line ~261) — picks up cases legacy regex missed
    // (cooking/translation/celebrity/extended sport/extended culture). Legacy regex retained iter 25
    // (double-fire impossible: legacy returns first if matches; classifier handles remainder).
    if (promptClass.category === 'off_topic') {
      const offSessionCtxPromise = loadStudentContext(sessionId).catch(() => null);
      const offTimeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 100));
      const offSessionCtx = await Promise.race([offSessionCtxPromise, offTimeoutPromise]);
      const offtopicType = (promptClass.offtopicType ?? 'generic') as OfftopicType;
      let offResp = buildOfftopicGentleBridge(offtopicType, {
        lastExperimentId: offSessionCtx?.lastExperimentId || undefined,
        currentVolume: offSessionCtx?.currentVolume || undefined,
        currentChapter: offSessionCtx?.currentChapter || undefined,
      });
      // iter 28 H6 fix code-review — wire forceCitation chain on classifier off-topic path
      // (precedente skipping enforceItalianK12Opener + rewriteCitationToCanonical + forceCitationFromQuery
      // + forceCitationFromSession). Mirror direct-operational path line 336-339.
      offResp = enforceItalianK12Opener(offResp);
      offResp = rewriteCitationToCanonical(offResp);
      offResp = forceCitationFromQuery(safeMessage, offResp);
      offResp = forceCitationFromSession(offSessionCtx?.lastExperimentId || null, offResp);
      saveInteraction(sessionId, safeExperimentId || null, 'offtopic_classifier', offResp.slice(0, 100), 'offtopic-template-iter25', safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
      saveMessageHistory(sessionId, safeExperimentId || null, offSessionCtx?.currentChapter || null, offSessionCtx?.currentVolume || null, 'offtopic_classifier', safeMessage, offResp.slice(0, 100), 'offtopic-template-iter25')
        .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));
      return new Response(JSON.stringify({
        success: true,
        response: offResp,
        source: 'offtopic-template-iter25',
        dataProcessing: 'classifier-off-topic-template',
        aiProfile: activeAiProfile.id,
        safety_fires: ['off_topic'],
        prompt_class: promptClass,
      } satisfies ChatResponse & Record<string, unknown>), {
        status: 200,
        headers: getSecurityHeaders(req),
      });
    }

    let ragContext = '';
    let retrievedChunksDebug: Array<Record<string, unknown>> = [];
    let retrievalModeUsed: 'hybrid' | 'dense' | 'fallback' = 'dense';

    // Build hybridRetrieve promise (with 2s timeout race) only if classifier
    // says we need it; otherwise short-circuit.
    const ragTopK = Math.max(2, Math.min(3, promptClass.topK || 3));
    const RAG_TIMEOUT_MS = 2000;
    const buildRagPromise = (): Promise<unknown[] | null> => {
      if (promptClass.skipOnniscenza) return Promise.resolve(null);
      const ragTimeoutPromise = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('rag_timeout_2s')), RAG_TIMEOUT_MS)
      );
      const ragHitsPromise = hybridRetrieve(safeMessage, ragTopK, {
        source: safeExperimentId
          ? (safeExperimentId.startsWith('v1-') ? 'vol1' : safeExperimentId.startsWith('v2-') ? 'vol2' : safeExperimentId.startsWith('v3-') ? 'vol3' : undefined)
          : undefined,
      });
      return Promise.race([ragHitsPromise, ragTimeoutPromise]).catch((ragErr) => {
        console.warn(JSON.stringify({
          level: 'warn', event: 'rag_hybrid_error',
          error: ragErr instanceof Error ? ragErr.message : 'unknown',
        }));
        return null;
      });
    };

    // Parallel fetch: studentContext (Supabase REST ~250ms) + RAG hybridRetrieve (≤2s).
    const [studentContext, ragHits] = await Promise.all([
      loadStudentContext(sessionId),
      buildRagPromise(),
    ]);
    // iter 18.3 DEBUG — surface studentContext per diagnose memoria Q10 verbatim recall.
    console.info(JSON.stringify({
      level: 'info', event: 'debug_student_context',
      sessionId: sessionId.slice(0, 12),
      studentContext: studentContext ? {
        lastExperimentId: studentContext.lastExperimentId || null,
        currentChapter: studentContext.currentChapter || null,
        currentVolume: studentContext.currentVolume || null,
        completedExperiments: studentContext.completedExperiments,
      } : null,
    }));

    if (ragHits && Array.isArray(ragHits) && ragHits.length > 0) {
      ragContext = formatHybridContext(ragHits as Parameters<typeof formatHybridContext>[0]);
      retrievedChunksDebug = (ragHits as Array<Record<string, unknown>>).map((h) => ({
        id: h.id,
        source: h.source,
        chapter: h.chapter,
        page: h.page,
        score: h.score,
        mode: h.mode,
      }));
      retrievalModeUsed = 'hybrid';
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
        // iter 12 P0 fix #1 — caller history injection (audit P0 #3 chiuso).
        // loadRecentHistory carica ultimi 5 lesson_contexts assistant messages
        // → Onniscenza L6_chat_history popolata → memoria Q10 cross-msg PASS.
        const recentHistory = await loadRecentHistory(sessionId, 5).catch(() => []);
        onniscenzaSnapshot = await aggregateOnniscenza({
          query: safeMessage,
          experiment_id: safeExperimentId,
          session_id: sessionId, // iter 35 fix Agent C audit: was undefined ref `safeSessionId` masked while ENABLE_ONNISCENZA off
          history: recentHistory,
          supabase: supaClient,
          // iter 11 P0 #5 — Andrea audit: L3_glossario era hard-disabled (Tea 180 termini
          // esclusi del tutto). Rimuovo opt-out per riabilitare. L1 RAG resta disabled
          // perché già fatto sopra (riga 298) — evita doppio retrieve.
          enable: { L1_rag: false /* already done above */ },
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
    // iter 14 Andrea — fallback inferCapitoloFromMessage quando experimentId missing
    // (audit P0 #9 fix). Sostituisce RAG dynamic broken con knowledge inline da
    // capitoli.json 37 capitoli structure ricca (testo_classe + citazioni_volume +
    // analogies_classe + esperimenti elenco). LLM cita Vol/pag verbatim sempre.
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
    // iter 14 fallback — infer Capitolo da safeMessage regex Vol.X cap.Y
    if (!capitoloFragment) {
      try {
        const inferred = inferCapitoloFromMessage(safeMessage);
        if (inferred) {
          // capitoli.json ha 0/37 citazioni populated — fallback a volumi-citazioni hardcoded
          // 30 capitoli core con bookText verbatim + analogia + errori_comuni.
          const citazione = buildCitazioneFragment(inferred.volume, inferred.capitolo ?? 0);
          if (citazione) {
            capitoloFragment = citazione;
          } else {
            capitoloFragment = buildCapitoloSummaryFragment(inferred);
          }
          console.info(JSON.stringify({
            level: 'info', event: 'capitolo_inferred',
            volume: inferred.volume,
            capitolo: inferred.capitolo,
            citazione_hardcoded: !!citazione,
            messagePreview: safeMessage.slice(0, 60),
          }));
        }
      } catch (inferErr) {
        console.warn(JSON.stringify({
          level: 'warn', event: 'capitolo_infer_error',
          error: inferErr instanceof Error ? inferErr.message : 'unknown',
        }));
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
    // Sprint U iter 41 — Andrea live test 2026-05-12 PM evidence: L2 templates
    // serve hardcoded narrative ("Vol.1 pag.45 'Approfondimento...'") for ANY
    // matching experimentId regardless of actual query. Bypasses Vertex Edge
    // Function entirely → linguaggio rewriter + anti-invenzione + memoria
    // contextualized SKIPPED. Real user gets stale RGB context on Vol.1 LED
    // query because L2 template content hardcoded shared.
    // Mitigation: gate behind `ENABLE_L2_TEMPLATES` env (default OFF). Edge
    // Function handles ALL educational queries via Vertex Gemini Flash-Lite
    // + Onniscenza + RAG + linguaggio rewriter post-LLM. Re-enable when L2
    // template content rewritten per-experiment Sprint U Cycle 2+ scope.
    const l2TemplatesEnabled = (Deno.env.get('ENABLE_L2_TEMPLATES') || 'false').toLowerCase() === 'true';
    try {
      const tpl = l2TemplatesEnabled ? selectTemplate(safeMessage, {
        experimentId: safeExperimentId ?? undefined,
      }) : null;
      if (tpl) {
        // iter-RALPH-2 (2026-05-12): wire real hybridRetrieve so L2 templates
        // surface real Vol/pag citation from RAG instead of empty "Vol.1 pag.''".
        // Source filter derived from experimentId (v1-→vol1, v2-→vol2, v3-→vol3).
        const tplRagSource = safeExperimentId
          ? (safeExperimentId.startsWith('v1-') ? 'vol1'
            : safeExperimentId.startsWith('v2-') ? 'vol2'
            : safeExperimentId.startsWith('v3-') ? 'vol3' : undefined)
          : undefined;
        const exec = await executeTemplate(tpl, { experimentId: safeExperimentId ?? undefined }, {
          ragRetrieve: async (q: string, k: number) => {
            try {
              const hits = await hybridRetrieve(q, k, { source: tplRagSource });
              return Array.isArray(hits) ? (hits as Array<Record<string, unknown>>) : [];
            } catch (_e) {
              return [];
            }
          },
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
        saveInteraction(sessionId, safeExperimentId || null, topicCategory, `tpl:${tpl.id}`, 'clawbot-l2', safeMessage)
          .catch(err => console.warn('[Nanobot V2] Memory save error:', err));
        // iter 26 P0 — saveMessageHistory wire clawbot-l2 template path timeline (Doc-4 #1) + user_intent_seed via 6th arg above.
        const tplChapterMatch = (safeExperimentId || '').match(/cap(\d+)/);
        const tplChapter = tplChapterMatch ? parseInt(tplChapterMatch[1], 10) : null;
        const tplVolMatch = (safeExperimentId || '').match(/^v([1-3])/);
        const tplVolume = tplVolMatch ? parseInt(tplVolMatch[1], 10) : null;
        saveMessageHistory(sessionId, safeExperimentId || null, tplChapter, tplVolume, topicCategory, safeMessage, tplText.slice(0, 100), `clawbot-l2-${tpl.id}`)
          .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));

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

    // 4. Determine thinking level (iter 46 v75 architectural pivot):
    //   - Pro model → 'medium' (legacy retained for explicit Pro paths / offline audit)
    //   - Flash + THINKING_KEYWORDS → 'medium' (educational deep-thinking, cheaper than Pro)
    //   - Otherwise undefined (Flash-Lite + vision + diagnostic Flash → no thinking)
    // Andrea iter 46 mandate "9681ms troppo lungo" → Flash + thinkingBudget=2048
    // (vertex-client.ts:thinkingLevelToBudget) targets ~3-4s vs Pro 8-9s LIVE.
    const thinkingLevel = routeThinkingLevel(model, safeMessage, hasImages);

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
      // 2026-05-10 iter 8 Agent 2 Fix 2: raise LLM cap conditionally to kill
      // I1 mount 503 timeout (Onniscenza + Mistral schema gen overflow 8s).
      // Schema mode + vision + thinkingLevel routinely need 8-12s structured
      // generation. Default 8s preserved for fast chat path.
      // Iter 43 A1 hotfix: Vertex Pro + thinkingLevel:medium routinely exceeds 12s
      // (live v68 smoke "approfondisci nel dettaglio..." → 503 timeout 13.7s elapsed).
      // Raise thinking cap 12s→25s to accommodate Pro thinking budget. Other paths
      // (schema/vision) keep 12s. Cost: slower 503 detection on Pro fail (acceptable).
      const llmCapMs = thinkingLevel ? 25000 : ((useIntentSchema || hasImages) ? 12000 : 8000);
      const timeoutPromise = new Promise<never>((_, rej) => {
        setTimeout(() => rej(new Error(`llm_timeout_${llmCapMs}ms`)), llmCapMs);
      });
      result = await Promise.race([llmCallPromise, timeoutPromise]);

      // 2026-05-10 iter 7 — schema parse for ANY provider that honored
      // useIntentSchema (Gemini Flash-Lite + Mistral both support
      // responseFormat:json_schema). Live probe v54 confirmed Gemini emits
      // canonical {text,intents} but previous code skipped parse because
      // provider !== 'mistral'. Now parse defensively whenever schema mode
      // active AND text starts with `{`. Legacy [INTENT:...] regex below
      // remains fallback for non-schema mode.
      if (useIntentSchema && result && typeof result.text === 'string' && result.text.trim().startsWith('{')) {
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

      // Iter 41 Sprint U Cycle 2 2026-05-12 PM — Andrea screenshot evidence
      // multiple bugs: LLM occasionally emits `Ragazzi, {"text":"...","intents":[]}`
      // with PREFIX before JSON envelope, OR multiple concatenated envelopes
      // `{...}{...}{...}`, OR markdown code-fence `json {...}` blocks.
      // startsWith('{') gate fails on prefix → raw JSON literal leaks to chat UI.
      // Universal post-process: extract text fields from ANY JSON envelope leak,
      // concat clean text, drop literal. Idempotent if no envelope present.
      // Iter 41 v66: strip markdown code-fence FIRST (catches `\`\`\`json {tool...} \`\`\`` leak even
      // without `"text":` envelope match — matrix evidence concept run 2/3 LLM emit code-fence
      // with intent_tools array literal NOT wrapped in {text:..} envelope).
      if (result && typeof result.text === 'string' && /```/.test(result.text)) {
        const stripped = result.text
          .replace(/```json[\s\S]*?```/gi, ' ')
          .replace(/```[\s\S]*?```/g, ' ')
          .replace(/```json[\s\S]*$/gi, ' ') // unterminated fence salvage
          .replace(/\s+/g, ' ')
          .trim();
        if (stripped && stripped !== result.text) {
          result = { ...result, text: stripped };
          console.info(JSON.stringify({
            level: 'info', event: 'markdown_codefence_scrubbed',
            timestamp: new Date().toISOString(),
          }));
        }
      }
      if (result && typeof result.text === 'string' && /\{\s*"text"\s*:/i.test(result.text)) {
        try {
          const envelopeRe = /\{\s*"text"\s*:\s*"((?:[^"\\]|\\.)*)"\s*(?:,\s*"intents"\s*:\s*\[[\s\S]*?\])?\s*\}/g;
          const extracted: string[] = [];
          let stripped = result.text;
          let m: RegExpExecArray | null;
          envelopeRe.lastIndex = 0;
          // eslint-disable-next-line no-cond-assign
          while ((m = envelopeRe.exec(result.text)) !== null) {
            const cleanText = m[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, ' ')
              .replace(/\\\\/g, '\\');
            extracted.push(cleanText);
          }
          if (extracted.length > 0) {
            stripped = result.text
              .replace(/```json[\s\S]*?```/gi, ' ')
              .replace(/```[\s\S]*?```/g, ' ')
              .replace(envelopeRe, ' ')
              .replace(/^\s*Ragazzi,?\s*$/gim, ' ')
              .trim();
            const cleanResponse = (stripped + ' ' + extracted.join(' ')).replace(/\s+/g, ' ').trim();
            result = { ...result, text: cleanResponse };
            console.info(JSON.stringify({
              level: 'info', event: 'json_envelope_leak_scrubbed',
              envelopeCount: extracted.length,
              timestamp: new Date().toISOString(),
            }));
          } else {
            // Iter 41 v64 NEW fallback: closed-envelope regex didn't match (truncated mid-JSON
            // due to maxOutputTokens cap). Andrea matrix 1/1000 evidence:
            // `Ragazzi, {"text":"Ragazzi, il terminale 'drain'...` (200-char log slice).
            // Salvage: find first `{"text":"` opening, extract substring until EOF or
            // closing quote heuristically, decode escapes, drop wrapper prefix.
            const openIdx = result.text.search(/\{\s*"text"\s*:\s*"/);
            if (openIdx >= 0) {
              const opener = result.text.slice(openIdx).match(/\{\s*"text"\s*:\s*"/);
              const afterOpen = openIdx + (opener ? opener[0].length : 0);
              let tail = result.text.slice(afterOpen);
              // Truncate at unescaped closing quote if present.
              const closeMatch = tail.match(/(?<!\\)"\s*(?:,\s*"intents"|\})/);
              if (closeMatch && typeof closeMatch.index === 'number') {
                tail = tail.slice(0, closeMatch.index);
              }
              const decoded = tail
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, ' ')
                .replace(/\\\\/g, '\\')
                .trim();
              const before = result.text.slice(0, openIdx).replace(/Ragazzi,?\s*$/i, '').trim();
              const merged = (before ? before + ' ' : '') + decoded;
              const cleanResponse = merged.replace(/\s+/g, ' ').trim();
              if (cleanResponse) {
                result = { ...result, text: cleanResponse };
                console.info(JSON.stringify({
                  level: 'info', event: 'json_envelope_truncated_salvaged',
                  charsExtracted: decoded.length,
                  timestamp: new Date().toISOString(),
                }));
              }
            }
          }
        } catch (_scrubErr) {
          console.warn(JSON.stringify({
            level: 'warn', event: 'json_envelope_scrub_failed',
            error: _scrubErr instanceof Error ? _scrubErr.message : 'unknown',
            timestamp: new Date().toISOString(),
          }));
        }
      }

      // ── Iter 50 v79 — H1 fix [CONTESTO OPERATIVO] envelope echo scrubber ──
      // Andrea 2026-05-13 1000-q matrix evidence color-036/046/076 + diag-068:
      // Vertex Gemini Flash plain (iter 46 v78 architectural pivot from Pro→Flash,
      // no thinkingBudget) occasionally verbalizes the `[CONTESTO OPERATIVO ...]`
      // (or `[CONTESTO OPERATIVO ELAB]` / `[- STATO SIMULATORE]` / `[UNLIM]` variants)
      // bracket-prefix envelope back as user-facing response. BASE_PROMPT v3.1 has
      // no explicit "MAI ripetere" rule for this variant (rule exists only for
      // [CONTESTO CAPITOLO LIBRO] at system-prompt.ts:257). H1 agent confidence 6/10.
      // Surgical post-LLM regex strip + defensive fallback to neutral Ragazzi opener.
      if (result && typeof result.text === 'string' && /\[CONTESTO\s+OPERATIVO/i.test(result.text)) {
        const stripped = result.text.replace(/\[CONTESTO\s+OPERATIVO[^\]]*\][^\n]*\n?/gi, '').trim();
        if (stripped.length === 0) {
          // Entire response was envelope echo — substitute polite retry message.
          result = { ...result, text: 'Ragazzi, riprovate la domanda — un momento di confusione.' };
          console.warn(JSON.stringify({
            level: 'warn', event: 'contesto_operativo_full_echo_substituted',
            timestamp: new Date().toISOString(),
          }));
        } else {
          result = { ...result, text: stripped };
          console.warn(JSON.stringify({
            level: 'warn', event: 'contesto_operativo_envelope_scrubbed',
            originalLen: result.text.length,
            strippedLen: stripped.length,
            timestamp: new Date().toISOString(),
          }));
        }
      }

      // ── Iter 50 v79 — H2 fix bare {"intents":[ JSON literal scrubber ──
      // Andrea 2026-05-13 1000-q matrix evidence control-065 "Stop simulazione":
      // Mistral/Gemini structured output schema mode (ENABLE_INTENT_TOOLS_SCHEMA iter 38+)
      // with token cap (120-520 maxOutputTokens) can emit prose then open `{"intents":[`
      // and EOF mid-JSON. Iter 41 v66 envelope scrubber only catches `{"text":"..."}`
      // shape requiring "text" key (line 907 regex), blind to bare `{"intents":[`.
      // H2 agent confidence 7/10. Strip from first `{"intents":[` substring onwards
      // outside `[INTENT:...]` brackets (server intent-parser handles those separately).
      if (result && typeof result.text === 'string' && /\{\s*"intents"\s*:\s*\[/.test(result.text)) {
        const match = result.text.match(/\{\s*"intents"\s*:\s*\[/);
        const idx = match ? result.text.indexOf(match[0]) : -1;
        if (idx >= 0) {
          const before = result.text.slice(0, idx).trim();
          // Defensive: only strip if there's natural language prose before the JSON.
          // (Avoid emitting empty response if the entire result was bare JSON.)
          if (before && before.length >= 10) {
            const slicedLen = result.text.length - idx;
            result = { ...result, text: before };
            console.warn(JSON.stringify({
              level: 'warn', event: 'bare_intents_literal_scrubbed',
              sliceLen: slicedLen,
              prefixLen: before.length,
              timestamp: new Date().toISOString(),
            }));
          }
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
        // iter 27 Agent Z — safety hardcoded fallback wrap.
        // LLM chain fully exhausted (Together + Gemini + Brain all failed).
        // For SAFETY-relevant queries (voltage_danger OR broader Cat C
        // scossa/brucia/pericolo/ferito/elettrocuzione/folgora/ustione),
        // GDPR Art. 8 + D.Lgs. 101/2018 mandate a warning to minors 8-14
        // — never 503 vuoto. ZERO network — pure helper from iter 25.
        const isSafetyRelevant =
          VOLTAGE_DANGER_QUERY_RE.test(safeMessage) ||
          ITER27_SAFETY_BROAD_RE.test(safeMessage);
        if (isSafetyRelevant) {
          const safetyFallback = getSafetyHardcodedResponse('voltage_danger');
          saveInteraction(
            sessionId,
            safeExperimentId || null,
            'safety_fallback_wrap',
            safetyFallback.slice(0, 100),
            'safety-hardcoded-fallback-iter27',
            safeMessage,
          ).catch((err) => console.warn('[Nanobot V2] Memory save error:', err));
          saveMessageHistory(
            sessionId,
            safeExperimentId || null,
            null,
            null,
            'safety_fallback_wrap',
            safeMessage,
            safetyFallback.slice(0, 100),
            'safety-hardcoded-fallback-iter27',
          ).catch((err) => console.warn('[Nanobot V2] MessageHistory save error:', err));
          console.warn(JSON.stringify({
            level: 'warn',
            event: 'safety_hardcoded_fallback_fired',
            source: 'safety-hardcoded-fallback-iter27',
            llmError: llmError instanceof Error ? llmError.message : 'unknown',
            timestamp: new Date().toISOString(),
          }));
          return new Response(JSON.stringify({
            success: true,
            response: safetyFallback,
            source: 'safety-hardcoded-fallback-iter27',
            dataProcessing: 'llm-chain-exhausted-safety-fallback',
            aiProfile: activeAiProfile.id,
            safety_fires: ['voltage_danger', 'llm_chain_exhausted'],
            prompt_class: {
              category: 'safety_warning',
              skipOnniscenza: true,
              topK: 0,
              wordCount: safeMessage.split(/\s+/).length,
            },
          } satisfies ChatResponse & Record<string, unknown>), {
            status: 200,
            headers: getSecurityHeaders(req),
          });
        }
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
    // 57-tool registry handlers live in the browser context (see
    // `scripts/openclaw/dispatcher.ts` which resolves `globalThis.__ELAB_API`).
    // Defensive: never throws — empty array on any error / no tags.
    let parsedIntents: IntentTag[] = [];
    // Enforcer applied as LAST step (post INTENT parse) at line 6a-bis below.
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

    // 6a-bis. 2026-05-10 iter 8 — apply enforcer AS LAST STEP.
    // Strip leaked context tags + auto-prepend "Ragazzi," opener.
    // Idempotent. Live r5-042 + andrea-screenshot-comemai catastrophic fix.
    cleanText = enforceItalianK12Opener(cleanText);

    // 6a-bis-2. Sprint V iter 40 — singolare → plurale runtime rewriter.
    // Andrea screenshot 2026-05-12 PM: "Con Arduino puoi dosare..." singolare
    // violation persists despite CLAUDE.md iter 21 codemod mandate (200 files
    // pending). Runtime rewriter fixes ALL outputs (LLM + L2 template + RAG)
    // without touching data files. Protected regions: «book quotes», AZIONE
    // tags, INTENT tags, code blocks preserved INVIOLATE.
    cleanText = rewriteSingolareToPlurale(cleanText);

    // iter 15 — rewrite citation narrative → canonical Vol.X pag.Y.
    // R-100 evidence iter 14: LLM cita narrative form 100% volte, mai canonical strict.
    // Detect "Volume X capitolo Y" / "il capitolo Y del Volume X" → append "(Vol.X pag.Y)".
    cleanText = rewriteCitationToCanonical(cleanText);

    // iter 17 — force inject canonical da QUERY (non solo da response narrative).
    // Q1 LED Vol.1 cap.6 evidence: LLM rephrase analogia senza Vol/cap mention → rewriter miss.
    // forceCitationFromQuery detect Vol.X cap.Y in MESSAGE + force append se response missing.
    cleanText = forceCitationFromQuery(safeMessage, cleanText);

    // iter 20 P0 — force inject canonical da SESSION CONTEXT (lastExperimentId).
    // Iter 19 stress 100q B Memoria 60% fail short-prompt recall ("Continuiamo", "Pin?", "Componente?").
    // forceCitationFromQuery checks ONLY message → short prompt no Vol/cap → no force inject.
    // forceCitationFromSession check studentContext.lastExperimentId → force inject from session memory.
    cleanText = forceCitationFromSession(studentContext?.lastExperimentId || null, cleanText);

    // 6a-ter. iter 14 Andrea — auto-trigger screenshot quando classifier flagga
    // `triggers_vision_chain=true` (audit P0 #4 finalmente chiuso). Andrea ricordo nanobot
    // "capiva quando fare screenshot" via VISION_REQUEST_RE pattern (guarda lavagna /
    // vedi circuito / controlla breadboard). Append [AZIONE:screenshot] alla risposta
    // SOLO se nessuna immagine già allegata (hasImages=false) e classifier ha detected.
    // Frontend dispatcher iter 36 IntentsDispatcher consuma azione → captureScreenshot live.
    if (promptClass.triggers_vision_chain && !hasImages && !cleanText.includes('[AZIONE:screenshot]')) {
      cleanText = `${cleanText}\n[AZIONE:screenshot]`;
      console.info(JSON.stringify({
        level: 'info', event: 'auto_trigger_screenshot',
        category: promptClass.category,
        wordCount: promptClass.wordCount,
      }));
    }

    // 6a-ter. iter 11 P0 — Andrea mandate paletti: wire checkContentSafety post-enforcer.
    // 10 rules runtime: volgari/off-topic/220V/privacy minori/GDPR Art.8/hallucination/citation verbatim.
    // Pre-fix audit: content-safety-guard.ts (306 LOC) DEAD CODE 0 callsites.
    // Behavior: if rewritten provided → use it; else log + preserve. NEVER blocca chat (defensive).
    let safetyFires: string[] = [];
    let safetyBlocked = false;
    try {
      const safetyResult = await checkContentSafety(cleanText, {
        rag_chunks: retrievedChunksDebug?.map(c => ({
          volume: typeof c === 'object' && c !== null ? (c as Record<string, unknown>).volume_id as string | number | undefined : undefined,
          page: typeof c === 'object' && c !== null ? (c as Record<string, unknown>).page_number as number | undefined : undefined,
        })),
      });
      if (!safetyResult.passed) {
        safetyFires = safetyResult.all_fires || (safetyResult.rule_fired ? [safetyResult.rule_fired] : []);
        safetyBlocked = true;
        console.warn(JSON.stringify({
          level: 'warn', event: 'content_safety_fires',
          fires: safetyFires,
          notes: safetyResult.notes,
          experimentId: safeExperimentId || null,
        }));
        // Auto-rewrite if available (imperative docente case typically).
        if (safetyResult.rewritten && typeof safetyResult.rewritten === 'string') {
          cleanText = safetyResult.rewritten;
          // Re-apply enforcer on rewritten text (idempotent).
          cleanText = enforceItalianK12Opener(cleanText);
        }
      }
    } catch (safetyErr) {
      // Safety guard must NEVER break chat flow.
      console.warn('[Nanobot V2] content-safety-guard error (non-blocking):', safetyErr);
    }

    // 6b. Sprint S iter 2 — Task A4: post-LLM PRINCIPIO ZERO validation.
    // Append-warning pattern: log violations, NEVER reject/modify response.
    // CRITICAL severity → console.error; lower → no-op (telemetry future).
    try {
      // iter 11 P0 #9 — isConceptIntro dynamic: derive from capitoloFragment presence
      // (when capitolo recognized + experimentId valid → likely concept intro).
      // Was hardcoded `false` → citation Vol/pag rule MAI triggered. Audit P1 #9 fix.
      const isConceptIntro = capitoloFragment !== '' && safeExperimentId !== '';
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
    // 7. Save interaction to memory.
    const topicCategory = safeExperimentId || 'general';
    // iter 12 P0 fix #2 — extract Vol/cap from user message as fallback experimentId.
    // Q10 memoria diagnosi: msg1 "Stiamo facendo Vol.1 cap.6" senza experimentId esplicito
    // → last_experiment_id null → msg2 perde context. Estrai da safeMessage prima.
    const fallbackExpId = safeExperimentId || extractVolCapFromMessage(safeMessage) || null;
    // iter 13 P0 race-cond fix — V4 live smoke Q10b "Continuiamo" 2-3s gap mostrava
    // memoria FAIL: saveInteraction async non committed prima di Q10b read.
    // Await sync save quando experimentId disponibile (recall-relevant), altrimenti
    // fire-and-forget (chit_chat/offtopic non-critical). Trade-off ~50-100ms latency
    // Q10a-style msg1, ma Q10b read garantito.
    const isMemoryRelevant = fallbackExpId !== null && cleanText.length > 30;
    // iter 25 P0-A — extract chapter/volume from fallbackExpId for unlim_message_history timeline.
    // Critical for marathon msg4 recall fix (Doc-4 #1 architectural unblocker).
    const histChapterMatch = fallbackExpId?.match(/cap(\d+)/);
    const histChapter = histChapterMatch ? parseInt(histChapterMatch[1], 10) : null;
    const histVolMatch = fallbackExpId?.match(/^v([1-3])/);
    const histVolume = histVolMatch ? parseInt(histVolMatch[1], 10) : null;
    if (isMemoryRelevant) {
      await saveInteraction(sessionId, fallbackExpId, topicCategory, cleanText.slice(0, 100), result.model, safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error (sync):', err));
    } else {
      saveInteraction(sessionId, fallbackExpId, topicCategory, cleanText.slice(0, 100), result.model, safeMessage)
        .catch(err => console.warn('[Nanobot V2] Memory save error (async):', err));
    }
    // iter 25 P0-A — append per-message turn to unlim_message_history timeline (fire-and-forget).
    // Sblocca marathon recall "il secondo era quale?" / "riepilogo". GDPR slice 250/100 server-side.
    saveMessageHistory(sessionId, fallbackExpId, histChapter, histVolume, topicCategory, safeMessage, cleanText.slice(0, 100), result.model)
      .catch(err => console.warn('[Nanobot V2] MessageHistory save error:', err));

    const audioUrl: string | null = null; // decoupled — frontend fetches separately

    // 10. Return response — include data processing transparency (GDPR)
    const response: ChatResponse & {
      debug_retrieval?: Array<Record<string, unknown>>;
      retrieval_mode?: string;
      intents_parsed?: Array<{ tool: string; args: Record<string, unknown> }>;
      // iter 11 P0 — Andrea live smoke audit: surface ALWAYS (was debug-only).
      // Telemetry observability for benchmark + frontend client (Onniscenza visible).
      prompt_class?: { category: string; skipOnniscenza: boolean; topK: number; wordCount: number; triggers_vision_chain?: boolean };
      // iter 11 P0 #1 — content-safety-guard fires surface for audit + frontend.
      safety_fires?: string[];
    } = {
      success: true,
      response: cleanText,
      // iter 24: use result.model (actual provider model) when provider != gemini
      source: result.provider === 'mistral' ? result.model
        : result.provider === 'together' ? `together-${result.model}`
        : result.provider === 'brain' ? 'brain'
        : result.provider === 'vertex' ? `vertex-${result.model}`
        : result.provider === 'vertex-claude' ? `vertex-claude-${result.model}`
        : modelDisplayName(model) || result.model,
      audio: audioUrl || undefined,
      // Sprint U iter 39 Phase 0 — Vertex EU label for GDPR Art.8 minori
      // observability (Andrea + audit trail). dataProcessing surfaces actual
      // provider used by callLLM router (vertex-eu wins over AI Studio when
      // ENABLE_VERTEX_EU=true + SA configured).
      dataProcessing: result.provider === 'mistral' ? 'mistral-eu'
        : result.provider === 'together' ? 'together-ai'
        : result.provider === 'brain' ? 'local-brain'
        : result.provider === 'vertex' ? `vertex-eu-${Deno.env.get('GCP_VERTEX_LOCATION') || 'europe-west9'}`
        : 'google-gemini-ai-studio',
      aiProfile: activeAiProfile.id,
    };
    // iter 11 P0 — surface prompt_class ALWAYS (Andrea live smoke 2026-05-10
    // findings: prompt_class invisible in prod API → Onniscenza classifier
    // non-osservabile da telemetry). Cheap: ~80 byte payload extra.
    response.prompt_class = {
      category: promptClass.category,
      skipOnniscenza: promptClass.skipOnniscenza,
      topK: promptClass.topK,
      wordCount: promptClass.wordCount,
      triggers_vision_chain: promptClass.triggers_vision_chain || false,
    };
    if (safetyFires.length > 0) {
      response.safety_fires = safetyFires;
    }
    // Iter 10 P0: surface retrieved chunks for bench (B2 hybrid RAG eval)
    if (debugRetrieval) {
      response.debug_retrieval = retrievedChunksDebug;
      response.retrieval_mode = retrievalModeUsed;
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
