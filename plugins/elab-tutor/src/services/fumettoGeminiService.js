// © Andrea Marro — 22/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { buildSessionReportComicModel } from './fumettoService';

const DEFAULT_EDGE_PATH = '/functions/v1/unlim-fumetto';

function readEnv(name) {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  return undefined;
}

function normalizeMessages(session = {}) {
  const source = Array.isArray(session.messages)
    ? session.messages
    : Array.isArray(session.chatMessages)
      ? session.chatMessages
      : [];
  return source
    .map((message) => ({
      role: message?.role || 'user',
      text: String(message?.text || message?.content || '').trim(),
    }))
    .filter((message) => message.text)
    .slice(-12);
}

function normalizeComponents(components = []) {
  if (!Array.isArray(components)) return [];
  return components
    .map((component) => {
      if (typeof component === 'string') return component;
      return component?.name || component?.label || component?.type || null;
    })
    .filter(Boolean);
}

function trimText(value, max) {
  const text = typeof value === 'string' ? value : '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Distil the runtime context down to the signal Gemini actually needs.
 *
 * `collectFullContext()` ships large, low-signal runtime state (periodic
 * applicationNarrative snapshots, unlimSharedState event log, agentDecisionSeed).
 * Forwarding it verbatim bloats the Gemini request, slows the round-trip past the
 * 15s LLM timeout and starves the JSON output budget — the fumetto draft then
 * fails and the local sober report is shown instead. Only the distilled fields
 * below carry storyline value; everything else is dropped.
 */
function leanSessionContext(context = {}) {
  if (!context || typeof context !== 'object') return {};
  const circuit = context.circuit && typeof context.circuit === 'object' ? context.circuit : {};
  const compilation = context.compilation || context.lastCompilation
    || context.compilationResult || circuit.lastCompilation || null;
  const serial = context.serial || context.serialOutput || context.serialMonitor || null;
  const components = normalizeComponents(
    context.componentsUsed || context.components || circuit.components || [],
  );
  const lean = {};
  if (context.editorMode) lean.editorMode = context.editorMode;
  if (context.buildStep) lean.buildStep = context.buildStep;
  if (compilation) lean.compilation = compilation;
  if (serial) lean.serial = serial;
  if (Array.isArray(context.recentErrors) && context.recentErrors.length) {
    lean.recentErrors = context.recentErrors.slice(0, 3);
  }
  if (context.completedExperiments?.total != null) {
    lean.completedExperimentsTotal = context.completedExperiments.total;
  }
  const description = context.circuitDescription || circuit.description;
  if (description) lean.circuitDescription = trimText(description, 400);
  if (context.editorCode) lean.editorCode = trimText(context.editorCode, 600);
  if (components.length) lean.components = components.slice(0, 10);
  return lean;
}

function firstExperiment(session = {}) {
  if (session.activeExperiment?.id) return session.activeExperiment;
  if (session.experiment?.id) return session.experiment;
  if (session.sessionContext?.currentExperiment?.id) return session.sessionContext.currentExperiment;
  if (Array.isArray(session.experimentsCompleted) && session.experimentsCompleted[0]?.id) {
    return session.experimentsCompleted[0];
  }
  return null;
}

export function buildFumettoSessionEvidence(session = {}) {
  const localModel = session.sessionStoryline ? null : buildSessionReportComicModel(session);
  const experiment = firstExperiment(session);
  const context = session.sessionContext || session.runtimeContext || session.unlimContext || {};
  const componentsUsed = normalizeComponents(session.componentsUsed).length
    ? normalizeComponents(session.componentsUsed)
    : normalizeComponents(context.componentsUsed || context.circuit?.components || []);

  return {
    sessionId: session.sessionId || session.id || null,
    experiment,
    experimentId: experiment?.id || session.experimentId || context.currentExperimentId || null,
    componentsUsed,
    sessionStoryline: session.sessionStoryline || localModel?.sessionStoryline || null,
    studentJourney: session.studentJourney || null,
    messages: normalizeMessages(session),
    volumeContext: session.volumeContext || null,
    sessionContext: leanSessionContext(context),
  };
}

function resolveEndpoint({ endpoint, supabaseUrl } = {}) {
  if (endpoint) return endpoint;
  const url = supabaseUrl || readEnv('VITE_SUPABASE_URL');
  return url ? `${url.replace(/\/$/, '')}${DEFAULT_EDGE_PATH}` : DEFAULT_EDGE_PATH;
}

const FUMETTO_MAX_ATTEMPTS = 2;
const FUMETTO_RETRY_DELAY_MS = 900;

function fumettoDelay(ms) {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

/**
 * A failure is worth one retry only when it is transient: a network error
 * (no HTTP status) or a 5xx. The fumetto Gemini call runs close to the 15s LLM
 * fetch timeout, so an occasional 503 is latency variance, not a real fault —
 * a second attempt usually succeeds. A 4xx (bad request, auth) is
 * deterministic; retrying it would only delay the local fallback.
 */
function isTransientFumettoFailure(result) {
  if (!result || result.ok) return false;
  return typeof result.status !== 'number' || result.status >= 500;
}

async function requestFumettoDraft({ fetchImpl, url, headers, body }) {
  try {
    const response = await fetchImpl(url, { method: 'POST', headers, body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      return {
        ok: false,
        status: response.status,
        error: data?.error || `http ${response.status}`,
      };
    }
    return {
      ok: true,
      draft: data?.draft,
      provider: data?.provider || 'gemini',
      model: data?.model,
      latencyMs: data?.latencyMs,
      tokensUsed: data?.tokensUsed,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function generateFumettoDraftWithGemini({
  session = {},
  endpoint,
  supabaseUrl,
  anonKey = readEnv('VITE_SUPABASE_ANON_KEY'),
  elabKey = readEnv('VITE_ELAB_API_KEY'),
  fetchImpl = globalThis.fetch,
  retryDelayMs = FUMETTO_RETRY_DELAY_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    return { ok: false, error: 'fetch unavailable' };
  }

  const sessionEvidence = buildFumettoSessionEvidence(session);
  const headers = { 'Content-Type': 'application/json' };
  if (anonKey) {
    headers.Authorization = `Bearer ${anonKey}`;
    headers.apikey = anonKey;
  }
  if (elabKey) {
    headers['X-Elab-Api-Key'] = elabKey;
  }

  const url = resolveEndpoint({ endpoint, supabaseUrl });
  const body = JSON.stringify({ sessionEvidence, sessionId: sessionEvidence.sessionId });

  // One retry on a transient failure: an end-of-session report can afford a
  // short second attempt, and it lifts the fumetto past Gemini latency spikes.
  let result;
  for (let attempt = 1; attempt <= FUMETTO_MAX_ATTEMPTS; attempt += 1) {
    result = await requestFumettoDraft({ fetchImpl, url, headers, body });
    result.attempts = attempt;
    if (!isTransientFumettoFailure(result) || attempt === FUMETTO_MAX_ATTEMPTS) {
      return result;
    }
    await fumettoDelay(retryDelayMs);
  }
  return result;
}
