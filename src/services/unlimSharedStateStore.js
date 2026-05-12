const MAX_EVENTS = 80;
const MAX_SNAPSHOTS = 12;

const ACTION_RE = /\b(aggiung\w*|mett\w*|colleg\w*|costruisc\w*|piazz\w*|inserisc\w*|mont\w*|togl\w*|rimuov\w*|elimin\w*|sostituisc\w*|corregg\w*|sistem\w*|ripar\w*|smont\w*|scolleg\w*|cambi\w*|modific\w*|fammi|fallo|avvi\w*|compil\w*|caric\w*|apr\w*|mostr\w*)\b/i;
const DIAGNOSE_RE = /\b(non va|non funziona|perche|perch[eé]|errore|sbagliato|bruciato|corto|non si accende|bloccato|aiuto)\b/i;
const VISION_RE = /\b(guarda|vedi|osserva|leggi|schermo|screenshot|immagine|foto|lavagna|schermata|cosa c'e|cosa c[’']e)\b/i;
const CLARIFY_RE = /\b(qualcosa|coso|quello|quella|li|la cosa|non so)\b/i;

let state = createInitialState();

function createInitialState() {
  return {
    revision: 0,
    updatedAt: null,
    latestSnapshot: null,
    snapshots: [],
    events: [],
  };
}

function nowIso() {
  return new Date().toISOString();
}

function compactPayload(payload) {
  if (!payload || typeof payload !== 'object') return payload ?? null;
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return { unserializable: true };
  }
}

function bump() {
  state.revision += 1;
  state.updatedAt = nowIso();
}

export function recordUnlimSnapshot(snapshot, options = {}) {
  const entry = {
    ts: Date.now(),
    reason: options.reason || snapshot?.reason || 'snapshot',
    ...compactPayload(snapshot),
  };

  state.latestSnapshot = entry;
  state.snapshots.push(entry);
  state.snapshots = state.snapshots.slice(-MAX_SNAPSHOTS);
  bump();
  return entry;
}

export function recordUnlimEvent(type, payload = {}) {
  const event = {
    ts: Date.now(),
    type: String(type || 'event'),
    payload: compactPayload(payload),
  };

  state.events.push(event);
  state.events = state.events.slice(-MAX_EVENTS);
  bump();
  return event;
}

export function getUnlimSharedState() {
  return {
    revision: state.revision,
    updatedAt: state.updatedAt,
    latestSnapshot: state.latestSnapshot,
    snapshots: [...state.snapshots],
    events: [...state.events],
  };
}

export function resetUnlimSharedStateForTests() {
  state = createInitialState();
}

function hasCircuitState(simulatorContext) {
  const circuit = simulatorContext?.circuit || simulatorContext;
  return Boolean((circuit?.components || []).length || (circuit?.wires || circuit?.connections || []).length);
}

function hasCodeState(simulatorContext) {
  return Boolean(simulatorContext?.editorCode || simulatorContext?.compilation || simulatorContext?.lastCompilation);
}

function hasRecentCircuitEvent() {
  return state.events.slice(-8).some((event) => ['circuitChange', 'componentInteract', 'stateChange'].includes(event.type));
}

export function buildAgentDecisionSeed({
  message = '',
  simulatorContext = {},
  narrativeContext = null,
  albumContext = null,
  comicContext = null,
} = {}) {
  const text = String(message || '');
  const actionAsked = ACTION_RE.test(text);
  const diagnoseAsked = DIAGNOSE_RE.test(text) || Boolean(simulatorContext?.compilation?.success === false) || hasRecentCircuitEvent();
  const visionAsked = VISION_RE.test(text);
  const hasState = hasCircuitState(simulatorContext) || hasCodeState(simulatorContext);
  const vagueWithoutState = CLARIFY_RE.test(text) && !hasState && !narrativeContext;

  return {
    reply: {
      needed: true,
      policy: 'risposta originale, breve, operativa; citazioni Vol./pag. solo come ancore utili',
    },
    act: {
      needed: actionAsked,
      requireVerifier: actionAsked,
      reason: actionAsked ? 'richiesta azione/tool' : null,
    },
    diagnose: {
      needed: diagnoseAsked,
      sources: ['circuito', 'codice', 'compilazione', 'eventi recenti'],
    },
    vision: {
      needed: visionAsked,
      reason: visionAsked ? 'utente chiede di guardare contenuto visivo' : null,
    },
    rag: {
      needed: Boolean(narrativeContext || simulatorContext?.experimentId || simulatorContext?.circuit?.experiment?.id),
      narrativeMapId: narrativeContext?.id || simulatorContext?.experimentId || simulatorContext?.circuit?.experiment?.id || null,
      useCitationAsAnchorOnly: true,
    },
    album: {
      needed: Boolean(albumContext),
      updateTimeline: Boolean(albumContext),
    },
    comic: {
      needed: Boolean(comicContext?.available || comicContext?.assetUrl),
      runtimePolicy: 'read-pre-generated-asset-only',
    },
    clarify: {
      needed: vagueWithoutState,
      reason: vagueWithoutState ? 'richiesta vaga senza stato caldo sufficiente' : null,
    },
  };
}
