/**
 * OpenClaw Tools Registry — declarative list of onnipotenza primitives
 *
 * Architettura (post-audit 2026-04-23):
 *   Layer A = base API reflection (verifica al mount via ensureHandlerResolves)
 *   Layer B = semantic overlay (questo file): category, pz_v3_sensitive, effect, params
 *   Layer C = morphic generated (runtime, persisted in openclaw_tool_memory)
 *
 * Contract:
 *   - `handler` è un dot-path risolto contro window.__ELAB_API
 *     - senza dot        → metodo flat (es. "addComponent" → __ELAB_API.addComponent)
 *     - con "unlim.X"    → namespace UNLIM (es. "unlim.highlightComponent")
 *   - `status` indica se l'handler è già operativo
 *     - "live"      → esiste su __ELAB_API oggi
 *     - "todo_sett5"→ da implementare in Sprint 6 Day 37 (vedi added_in_sprint)
 *     - "composite" → non è un handler diretto, è una composizione L1 (morphic)
 *   - `pz_v3_sensitive: true` → l'azione cambia cosa vede la classe, DEVE essere
 *     accompagnata da un'azione speakTTS che spiega ai RAGAZZI quello che accade
 *   - `params` è JSON-Schema-like (no Zod per mantenere file leggibile a LLM)
 *
 * Mappatura namespace (verificata su src/services/simulator-api.js 22/04/2026):
 *   FLAT (60+ metodi):   addComponent, removeComponent, connectWire, removeWire,
 *                        setComponentValue, moveComponent, interact, clearCircuit,
 *                        getCircuitDescription, getCurrentExperiment, play, pause,
 *                        reset, compile, setEditorCode, getEditorCode,
 *                        appendEditorCode, loadScratchWorkspace, nextStep, prevStep,
 *                        mountExperiment, setBuildMode, captureScreenshot,
 *                        showBom, hideBom, showSerialMonitor, undo, redo, ...
 *   UNLIM (5 metodi):    unlim.highlightComponent, unlim.highlightPin,
 *                        unlim.clearHighlights, unlim.serialWrite,
 *                        unlim.getCircuitState
 *   TODO_SETT5:          unlim.speakTTS, unlim.listenSTT, unlim.saveSessionMemory,
 *                        unlim.recallPastSession, unlim.showNudge,
 *                        unlim.generateQuiz, unlim.exportFumetto,
 *                        unlim.videoLoad, unlim.alertDocente
 *   COMPOSITE:           unlim.analyzeImage (captureScreenshot + Gemini Vision POST),
 *                        unlim.toggleDrawing (pen mode, da aggiungere come flat)
 *
 * (c) ELAB Tutor — 2026-04-22, audited 2026-04-23
 */

export type HandlerStatus = 'live' | 'todo_sett5' | 'composite';

export interface ToolSpec {
  name: string;
  category: 'circuit' | 'read' | 'simulate' | 'visual' | 'code' | 'navigate' | 'vision' | 'ui' | 'voice' | 'memory' | 'meta';
  handler: string; // dot-path into window.__ELAB_API (see namespace mapping above)
  status?: HandlerStatus; // default resolved from added_in_sprint (see resolveStatus)
  params: Record<string, { type: string; required?: boolean; enum?: string[]; description: string }>;
  returns?: string;
  effect: string;
  pz_v3_sensitive: boolean; // true = must be paired with a speakTTS action explaining to class
  since: string;
  added_in_sprint?: string;
  composite_of?: string[]; // solo per status='composite': tool che compongono questo
}

/**
 * Risolve lo status effettivo: se non esplicito, deriva da metadata.
 * Regole default:
 *   - status esplicito → usa quello
 *   - added_in_sprint definito → 'todo_sett5' (semantica: "verrà aggiunto nello sprint X",
 *     quindi al momento non è live)
 *   - altrimenti → 'live' (assume handler esiste su __ELAB_API)
 *
 * NOTE: Una volta che l'handler viene implementato in Sprint 6 Day 37, rimuovere il
 * campo `added_in_sprint` dall'entry per marcarlo 'live' (vedi Task 11 del plan).
 */
export function resolveStatus(spec: ToolSpec): HandlerStatus {
  if (spec.status) return spec.status;
  if (spec.added_in_sprint) return 'todo_sett5';
  return 'live';
}

/**
 * Runtime validator: verifica che l'handler sia risolvibile sull'API attuale.
 * Usato dal mount di OpenClaw per catchare drift registry↔API.
 *
 * Ritorna { resolved: boolean, reason?: string } per ogni tool.
 * - status='live'      → deve risolvere, altrimenti ERROR
 * - status='todo_sett5'→ può non risolvere (ancora TODO), warning soft
 * - status='composite' → mai testato qui, verificato in morphic-generator L1
 */
export function ensureHandlerResolves(spec: ToolSpec, api: Record<string, unknown>): { resolved: boolean; reason?: string } {
  if (spec.status === 'composite') return { resolved: true }; // L1 layer verifies
  const path = spec.handler.split('.');
  let cur: unknown = api;
  for (const seg of path) {
    if (cur == null || typeof cur !== 'object') {
      return { resolved: false, reason: `path breaks at segment "${seg}" (prev=${typeof cur})` };
    }
    cur = (cur as Record<string, unknown>)[seg];
  }
  if (typeof cur !== 'function') {
    return { resolved: false, reason: `handler "${spec.handler}" is not a function (got ${typeof cur})` };
  }
  return { resolved: true };
}

/**
 * Smoke-test runner: esegue ensureHandlerResolves su tutti i tool.
 * Ritorna summary per logging/dashboard + lista dei broken da fixare.
 */
export function auditRegistry(api: Record<string, unknown>, registry: ToolSpec[]): {
  total: number;
  live_ok: number;
  live_broken: Array<{ name: string; reason: string }>;
  todo: number;
  composite: number;
} {
  const result = { total: registry.length, live_ok: 0, live_broken: [] as Array<{ name: string; reason: string }>, todo: 0, composite: 0 };
  for (const spec of registry) {
    const s = resolveStatus(spec);
    if (s === 'todo_sett5') { result.todo++; continue; }
    if (s === 'composite') { result.composite++; continue; }
    const check = ensureHandlerResolves(spec, api);
    if (check.resolved) result.live_ok++;
    else result.live_broken.push({ name: spec.name, reason: check.reason || 'unknown' });
  }
  return result;
}

export const OPENCLAW_TOOLS_REGISTRY: ToolSpec[] = [
  // ═══════════════════════════════════════════════════════════════════
  // CIRCUIT MANIPULATION (primary onnipotenza surface)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'addComponent',
    category: 'circuit',
    handler: 'addComponent',
    params: {
      type: { type: 'string', required: true, enum: ['led', 'resistor', 'button', 'battery9v', 'potentiometer', 'buzzer', 'ldr', 'reed', 'capacitor', 'diode', 'transistor', 'servo'], description: 'tipo componente' },
      x: { type: 'number', required: false, description: 'posizione X breadboard (default auto)' },
      y: { type: 'number', required: false, description: 'posizione Y breadboard (default auto)' },
    },
    returns: 'string id del componente creato',
    effect: 'aggiunge componente al breadboard visibile',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'removeComponent',
    category: 'circuit',
    handler: 'removeComponent',
    params: {
      id: { type: 'string', required: true, description: 'id componente da rimuovere' },
    },
    effect: 'rimuove componente',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'addWire',
    category: 'circuit',
    handler: 'connectWire',
    params: {
      from: { type: 'string', required: true, description: 'formato comp:pin, es "led1:anode"' },
      to: { type: 'string', required: true, description: 'formato comp:pin, es "r1:pin1"' },
    },
    effect: 'crea filo tra due pin',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'removeWire',
    category: 'circuit',
    handler: 'removeWire',
    params: { id: { type: 'string', required: true, description: 'id filo' } },
    effect: 'rimuove filo',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'setComponentValue',
    category: 'circuit',
    handler: 'setComponentValue',
    params: {
      id: { type: 'string', required: true, description: 'id componente' },
      param: { type: 'string', required: true, description: 'nome parametro (resistance, voltage, value, position, ...)' },
      value: { type: 'any', required: true, description: 'nuovo valore' },
    },
    effect: 'cambia parametro componente (es r1.resistance=220)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'moveComponent',
    category: 'circuit',
    handler: 'moveComponent',
    params: {
      id: { type: 'string', required: true, description: 'id' },
      x: { type: 'number', required: true, description: 'X target' },
      y: { type: 'number', required: true, description: 'Y target' },
    },
    effect: 'sposta componente nella nuova posizione',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'interact',
    category: 'circuit',
    handler: 'interact',
    params: {
      id: { type: 'string', required: true, description: 'id componente' },
      action: { type: 'string', required: true, enum: ['press', 'release', 'rotate', 'toggle'], description: 'azione' },
      value: { type: 'any', required: false, description: 'valore opzionale (es rotazione angolo)' },
    },
    effect: 'interagisce con componente (es premi pulsante)',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'clearCircuit',
    category: 'circuit',
    handler: 'clearCircuit',
    params: {},
    effect: 'pulisce intera breadboard',
    pz_v3_sensitive: true,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // STATE READING (observation, onniscienza)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'getCircuitState',
    category: 'read',
    handler: 'unlim.getCircuitState',
    params: {},
    returns: 'oggetto CircuitState completo',
    effect: 'ritorna stato corrente circuito',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getCircuitDescription',
    category: 'read',
    handler: 'getCircuitDescription',
    params: {},
    returns: 'string descrizione linguaggio naturale',
    effect: 'descrizione testuale del circuito corrente',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getCurrentExperiment',
    category: 'read',
    handler: 'getCurrentExperiment',
    params: {},
    returns: 'oggetto con {id, title, chapter, buildSteps}',
    effect: 'metadata esperimento corrente',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getBuildStepIndex',
    category: 'read',
    handler: 'getBuildStepIndex',
    params: {},
    returns: 'number indice passo corrente (0-based) o -1 se non in modalità guidata',
    effect: 'indice step build corrente',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getSimulationStatus',
    category: 'read',
    handler: 'getSimulationStatus',
    params: {},
    returns: 'string: "running" | "paused" | "stopped"',
    effect: 'stato simulazione',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // SIMULATION (run control)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'play',
    category: 'simulate',
    handler: 'play',
    params: {},
    effect: 'avvia simulazione',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'pause',
    category: 'simulate',
    handler: 'pause',
    params: {},
    effect: 'mette in pausa simulazione',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'reset',
    category: 'simulate',
    handler: 'reset',
    params: {},
    effect: 'reset circuito a stato iniziale esperimento',
    pz_v3_sensitive: true,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // VISUAL AIDS (didattica)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'highlight',
    category: 'visual',
    handler: 'unlim.highlightComponent',
    params: {
      ids: { type: 'array', required: true, description: 'array di id componenti da evidenziare' },
    },
    effect: 'evidenzia componenti con glow visivo',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'highlightPin',
    category: 'visual',
    handler: 'unlim.highlightPin',
    params: {
      pins: { type: 'array', required: true, description: 'array di pin, es ["nano:D13", "led1:anode"]' },
    },
    effect: 'evidenzia pin specifici',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'clearHighlights',
    category: 'visual',
    handler: 'unlim.clearHighlights',
    params: {},
    effect: 'rimuove tutti gli highlight',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // CODE (Arduino C++ + Scratch/Blockly)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'compile',
    category: 'code',
    handler: 'compile',
    params: {},
    returns: 'object {success, hex, errors, warnings}',
    effect: 'compila codice editor Arduino corrente',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'setEditorCode',
    category: 'code',
    handler: 'setEditorCode',
    params: {
      code: { type: 'string', required: true, description: 'codice Arduino C++ completo' },
    },
    effect: 'sovrascrive codice editor',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'getEditorCode',
    category: 'code',
    handler: 'getEditorCode',
    params: {},
    returns: 'string codice corrente',
    effect: 'ritorna codice editor',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'appendEditorCode',
    category: 'code',
    handler: 'appendEditorCode',
    params: {
      code: { type: 'string', required: true, description: 'codice da aggiungere in fondo' },
    },
    effect: 'append al codice esistente',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'loadScratchWorkspace',
    category: 'code',
    handler: 'loadScratchWorkspace',
    params: {
      xml: { type: 'string', required: true, description: 'Blockly XML workspace' },
    },
    effect: 'carica workspace Scratch/Blockly',
    pz_v3_sensitive: true,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // NAVIGATION (guided build steps)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'nextStep',
    category: 'navigate',
    handler: 'nextStep',
    params: {},
    effect: 'avanza al prossimo step del build guidato',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'prevStep',
    category: 'navigate',
    handler: 'prevStep',
    params: {},
    effect: 'torna indietro di uno step',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'mountExperiment',
    category: 'navigate',
    handler: 'mountExperiment',
    params: {
      id: { type: 'string', required: true, description: 'es "v1-cap6-esp1"' },
    },
    effect: 'carica esperimento specifico',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'setBuildMode',
    category: 'navigate',
    handler: 'setBuildMode',
    params: {
      mode: { type: 'string', required: true, enum: ['complete', 'guided', 'sandbox'], description: 'modalità build' },
    },
    effect: 'cambia modalità (Già Montato / Passo Passo / Libero)',
    pz_v3_sensitive: true,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // VISION (circuit photos)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'captureScreenshot',
    category: 'vision',
    handler: 'captureScreenshot',
    params: {},
    returns: 'string base64 PNG',
    effect: 'cattura screenshot corrente breadboard',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'analyzeImage',
    category: 'vision',
    handler: 'unlim.analyzeImage',
    status: 'composite',
    composite_of: ['captureScreenshot', 'postToVisionEndpoint'],
    params: {
      image: { type: 'string', required: true, description: 'base64 PNG' },
    },
    returns: 'string analisi Vision LLM',
    effect: 'analizza immagine con Qwen VL (composite: screenshot + POST a /unlim-vision)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // TUTOR UI CONTROL
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'showBom',
    category: 'ui',
    handler: 'showBom',
    params: {},
    effect: 'mostra Bill of Materials (lista componenti)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'showSerialMonitor',
    category: 'ui',
    handler: 'showSerialMonitor',
    params: {},
    effect: 'apre Serial Monitor',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'toggleDrawing',
    category: 'ui',
    handler: 'toggleDrawing',
    status: 'todo_sett5',
    added_in_sprint: 'sett5',
    params: {
      enabled: { type: 'boolean', required: true, description: 'true=abilita penna, false=disabilita' },
    },
    effect: 'abilita/disabilita modalità disegno su lavagna (da implementare Sprint 6 Day 37)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ═══════════════════════════════════════════════════════════════════
  // VOICE (Voxtral TTS + Whisper STT)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'speakTTS',
    category: 'voice',
    handler: 'unlim.speakTTS',
    status: 'live', // Sprint 6 Day 37: wired to voiceService Kokoro→Edge→Nanobot chain
    params: {
      text: { type: 'string', required: true, description: 'testo da pronunciare (MUST pass PZ v3 validator)' },
      voice: { type: 'string', required: false, enum: ['francesca-it', 'emma-en', 'lucia-es', 'celine-fr', 'kathrin-de'], description: 'voce locale' },
      speed: { type: 'number', required: false, description: 'velocità 0.5-1.5, default 0.95 bambino' },
    },
    effect: 'UNLIM parla testo attraverso Voxtral TTS',
    pz_v3_sensitive: true, // itself is the speak validator target
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'listenSTT',
    category: 'voice',
    handler: 'unlim.listenSTT',
    status: 'live', // Sprint 6 Day 37: wired to voiceService startRecording/stopRecording/sendVoiceChat
    params: {
      timeout: { type: 'number', required: false, description: 'timeout ms, default 8000' },
    },
    returns: 'string trascrizione Whisper Turbo',
    effect: 'ascolta microfono e trascrive',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },

  // ═══════════════════════════════════════════════════════════════════
  // MEMORY (Supabase state)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'saveSessionMemory',
    category: 'memory',
    handler: 'unlim.saveSessionMemory',
    status: 'live', // Sprint 6 Day 37: wired to projectHistoryService localStorage layer (Supabase pgvector pending Day 38)
    params: {
      summary: { type: 'string', required: true, description: 'riassunto testuale ciò che è stato fatto' },
      concepts_learned: { type: 'array', required: false, description: 'array di concetti assimilati' },
      concepts_struggled: { type: 'array', required: false, description: 'array di concetti in difficoltà' },
    },
    effect: 'salva riassunto sessione su Supabase (GDPR-compliant anonymized)',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'recallPastSession',
    category: 'memory',
    handler: 'unlim.recallPastSession',
    status: 'live', // Sprint 6 Day 37: wired to projectHistoryService.getTimeline + getStory
    params: {
      student_hash: { type: 'string', required: true, description: 'hash anonimo studente' },
      n: { type: 'number', required: false, description: 'quante ultime sessioni (default 5)' },
    },
    returns: 'array di SessionSummary',
    effect: 'recupera ultime N sessioni dello studente',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },

  // ═══════════════════════════════════════════════════════════════════
  // META (nudge, alert, generate content)
  // ═══════════════════════════════════════════════════════════════════
  {
    name: 'showNudge',
    category: 'meta',
    handler: 'unlim.showNudge',
    status: 'live', // Sprint 6 Day 37: wired to nudgeService.sendNudge (localStorage + BroadcastChannel + Supabase if configured)
    params: {
      type: { type: 'string', required: true, enum: ['hint', 'warning', 'celebration', 'retry'], description: 'tipo nudge' },
      message: { type: 'string', required: true, description: 'messaggio nudge (pass PZ v3)' },
    },
    effect: 'mostra mascotte UNLIM con messaggio contestuale',
    pz_v3_sensitive: true,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'generateQuiz',
    category: 'meta',
    handler: 'unlim.generateQuiz',
    status: 'live', // Sprint 6 Day 37: emits quizRequested event (QuizPanel listener subscribes — Day 38 wires actual generation)
    params: {
      topic: { type: 'string', required: true, description: 'argomento es "legge Ohm"' },
      n: { type: 'number', required: false, description: 'numero domande (default 3)' },
      difficulty: { type: 'string', required: false, enum: ['easy', 'medium', 'hard'] },
    },
    returns: 'array di {question, options, correct, explanation}',
    effect: 'genera quiz dinamico (LLM + Wiki LLM RAG)',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'exportFumetto',
    category: 'meta',
    handler: 'unlim.exportFumetto',
    status: 'live', // Sprint 6 Day 37: emits fumettoExportRequested event (UnlimReport subscribes — Day 38 wires)
    params: {
      session_id: { type: 'string', required: false, description: 'sessione da esportare (default: current)' },
    },
    returns: 'string URL PDF generato',
    effect: 'genera Report Fumetto PDF via FLUX.1-schnell async',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'videoLoad',
    category: 'meta',
    handler: 'unlim.videoLoad',
    status: 'live', // Sprint 6 Day 37: emits videoLoadRequested event (video component Day 38)
    params: {
      youtubeId: { type: 'string', required: true, description: 'YouTube video ID' },
      startAt: { type: 'number', required: false, description: 'secondo partenza' },
    },
    effect: 'carica e mostra video YouTube embedded',
    pz_v3_sensitive: true,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },
  {
    name: 'alertDocente',
    category: 'meta',
    handler: 'unlim.alertDocente',
    status: 'live', // Sprint 6 Day 37: wired to nudgeService inverted channel (system → docente)
    params: {
      reason: { type: 'string', required: true, description: 'motivo alert (es "studente bloccato su esperimento")' },
      urgency: { type: 'string', required: false, enum: ['low', 'medium', 'high'], description: 'default medium' },
    },
    effect: 'mostra alert visuale discreto per docente (no interruzione classe)',
    pz_v3_sensitive: false,
    since: '2026-05',
    added_in_sprint: 'sprint-6',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LAYER A EXPANSION — Sprint 6 Day 38 (reflect full __ELAB_API surface)
  // Target: dispatcher completeness (docs/architectures/openclaw-registry-v2-3-layer.md §3)
  // All handlers verified on src/services/simulator-api.js + mock API 2026-04-23
  // ═══════════════════════════════════════════════════════════════════

  // ── Layer A: navigation + read (batch 1) ──────────────────────────
  {
    name: 'loadExperiment',
    category: 'navigate',
    handler: 'loadExperiment',
    params: {
      id: { type: 'string', required: true, description: 'id esperimento, es "v1-cap6-primo-circuito"' },
    },
    effect: 'carica esperimento (flat API, alias semantico di mountExperiment)',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'getComponentPositions',
    category: 'read',
    handler: 'getComponentPositions',
    params: {},
    returns: 'mappa { [id]: { x, y } } posizioni correnti sulla breadboard',
    effect: 'posizioni attuali di tutti i componenti (serve a L1 composizione spatial)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getLayout',
    category: 'read',
    handler: 'getLayout',
    params: {},
    returns: 'oggetto layout esportabile (componenti + wire + zoom/pan)',
    effect: 'struttura completa del layout correnta, serializzabile',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getSelectedComponent',
    category: 'read',
    handler: 'getSelectedComponent',
    params: {},
    returns: 'oggetto componente selezionato o null',
    effect: 'componente attualmente selezionato in UI (per context-aware help)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'isSimulating',
    category: 'read',
    handler: 'isSimulating',
    params: {},
    returns: 'boolean true se simulazione in esecuzione',
    effect: 'flag se la simulazione sta girando (piu granulare di getSimulationStatus)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ── Layer A: editor/code (batch 2) ────────────────────────────────
  {
    name: 'getEditorMode',
    category: 'read',
    handler: 'getEditorMode',
    params: {},
    returns: 'string "arduino" | "scratch" | "code"',
    effect: 'modo editor corrente (Arduino C++ o Scratch/Blockly)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'setEditorMode',
    category: 'code',
    handler: 'setEditorMode',
    params: {
      mode: { type: 'string', required: true, enum: ['arduino', 'scratch', 'code'], description: 'modo editor' },
    },
    effect: 'passa tra Arduino e Scratch nel pannello codice',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'resetEditorCode',
    category: 'code',
    handler: 'resetEditorCode',
    params: {},
    effect: 'ripristina codice editor al template originale dell esperimento',
    pz_v3_sensitive: true,
    since: '2026-04',
  },
  {
    name: 'getExperimentOriginalCode',
    category: 'read',
    handler: 'getExperimentOriginalCode',
    params: {},
    returns: 'string codice sorgente template esperimento corrente',
    effect: 'codice originale esperimento (per diff con stato utente)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'isEditorVisible',
    category: 'read',
    handler: 'isEditorVisible',
    params: {},
    returns: 'boolean true se pannello editor aperto',
    effect: 'flag visibilita pannello editor (per decisioni showBom vs showCode)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },

  // ── Layer A: UI tool mode + context aggregator (batch 3) ──────────
  {
    name: 'setToolMode',
    category: 'ui',
    handler: 'setToolMode',
    params: {
      mode: { type: 'string', required: true, enum: ['select', 'wire', 'pen'], description: 'modalita strumento canvas' },
    },
    effect: 'cambia modalita cursore canvas (select | wire | pen disegno)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getToolMode',
    category: 'read',
    handler: 'getToolMode',
    params: {},
    returns: 'string "select" | "wire" | "pen"',
    effect: 'modalita cursore canvas corrente',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'hideEditor',
    category: 'ui',
    handler: 'hideEditor',
    params: {},
    effect: 'nasconde pannello editor (libera spazio per breadboard)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'hideBom',
    category: 'ui',
    handler: 'hideBom',
    params: {},
    effect: 'chiude Bill of Materials (lista componenti)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
  {
    name: 'getSimulatorContext',
    category: 'read',
    handler: 'getSimulatorContext',
    params: {},
    returns: 'bundle full state { experiment, circuit, editor, sim, tool }',
    effect: 'snapshot completo contesto simulatore (usato da state-snapshot-aggregator)',
    pz_v3_sensitive: false,
    since: '2026-04',
  },
];

// Export counts for sanity check
export const TOTAL_TOOLS = OPENCLAW_TOOLS_REGISTRY.length;
export const CATEGORIES = [...new Set(OPENCLAW_TOOLS_REGISTRY.map(t => t.category))];
export const NEW_IN_SPRINT_6 = OPENCLAW_TOOLS_REGISTRY.filter(t => t.added_in_sprint === 'sprint-6').length;

// Helper: build JSON Schema for LLM tool-use
export function buildJsonSchemaForLLM(): Record<string, unknown> {
  return {
    tools: OPENCLAW_TOOLS_REGISTRY.map(t => ({
      name: t.name,
      description: t.effect,
      parameters: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(t.params).map(([k, p]) => [k, { type: p.type, enum: p.enum, description: p.description }])
        ),
        required: Object.entries(t.params).filter(([, p]) => p.required).map(([k]) => k),
      },
    })),
  };
}

if (typeof module !== 'undefined' && module.exports) {
  console.log(`OPENCLAW_TOOLS_REGISTRY loaded: ${TOTAL_TOOLS} tools across ${CATEGORIES.length} categories.`);
  console.log(`New in Sprint 6: ${NEW_IN_SPRINT_6} tools (saveSessionMemory, recallPastSession, showNudge, generateQuiz, exportFumetto, videoLoad, alertDocente, speakTTS, listenSTT = 9, some were proposed earlier).`);
}
