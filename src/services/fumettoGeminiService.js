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
    sessionContext: context,
  };
}

function resolveEndpoint({ endpoint, supabaseUrl } = {}) {
  if (endpoint) return endpoint;
  const url = supabaseUrl || readEnv('VITE_SUPABASE_URL');
  return url ? `${url.replace(/\/$/, '')}${DEFAULT_EDGE_PATH}` : DEFAULT_EDGE_PATH;
}

export async function generateFumettoDraftWithGemini({
  session = {},
  endpoint,
  supabaseUrl,
  anonKey = readEnv('VITE_SUPABASE_ANON_KEY'),
  elabKey = readEnv('VITE_ELAB_API_KEY'),
  fetchImpl = globalThis.fetch,
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

  try {
    const response = await fetchImpl(resolveEndpoint({ endpoint, supabaseUrl }), {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionEvidence, sessionId: sessionEvidence.sessionId }),
    });
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
