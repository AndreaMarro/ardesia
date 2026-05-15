/**
 * Nanobot V2 — Shared Types
 * (c) Andrea Marro — 02/04/2026
 */

export interface ChatRequest {
  message: string;
  sessionId: string;
  circuitState?: CircuitState | null;
  experimentId?: string | null;
  simulatorContext?: SimulatorContext | null;
  images?: ImageData[];
  aiProfile?: string | null;
  aiDepth?: 'total' | 'compact' | null;
  unlimMode?: string | null;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  source?: string;
  audio?: string;
  actions?: string[];
  error?: string;
  dataProcessing?: string; // GDPR transparency: which external service processed the data
  aiProfile?: string;
}

export interface DiagnoseRequest {
  circuitState: CircuitState;
  experimentId?: string | null;
  sessionId?: string; // For consent check
}

export interface DiagnoseResponse {
  success: boolean;
  diagnosis?: string;
  source?: string;
  error?: string;
}

export interface HintsRequest {
  experimentId: string;
  currentStep?: number;
  difficulty?: 'base' | 'intermedio' | 'avanzato';
  sessionId?: string; // For consent check
}

export interface HintsResponse {
  success: boolean;
  hints?: string;
  source?: string;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export interface CircuitState {
  components?: ComponentState[];
  connections?: ConnectionState[];
  errors?: string[];
  structured?: Record<string, unknown>;
  text?: string;
}

export interface ComponentState {
  id: string;
  type: string;
  value?: number | string;
  state?: string;
}

export interface ConnectionState {
  from: string;
  to: string;
  color?: string;
}

export interface SimulatorContext {
  running?: boolean;
  errors?: string[];
  activeExperiment?: string;
  mode?: string;
  modalita?: string;
  buildMode?: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

// iter 25 P0-A — per-message timeline entry returned by `loadRecentHistory`.
// Backward-compatible with prior single-shape `Array<{ role: 'assistant', content: string }>`:
// callers expecting only role+content keep working; new meta fields are additive optionals.
export interface MessageHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
  experiment_id?: string;
  chapter?: number;
  volume?: number;
}

export interface StudentContext {
  completedExperiments: number;
  totalExperiments: number;
  commonMistakes: string[];
  lastSession: string | null;
  level: 'principiante' | 'intermedio' | 'avanzato';
  currentChapter: number | null;
  // iter 18 — verbatim recall fields per memoria Q10b cross-msg
  lastExperimentId?: string | null;
  currentVolume?: number | null;
  // iter 24 Phase 1 P0 — user_intent_seed verbatim msg1 IMMUTABLE (Doc-3+4 ROOT CAUSE H5 fix)
  userIntentSeed?: string | null;
}

// NB (17/04/2026): modelli GA Google. I preview 3.x erano instabili (503
// UNAVAILABLE a partire da oggi pomeriggio) e causavano UNLIM DOWN per
// Tea. Ripristiniamo 2.5 GA validati funzionanti via curl test.
export type GeminiModel =
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  // Iter 47 Opzione B — Claude on Vertex AI EU multi-region (Anthropic Messages API).
  // GeminiModel union now misnamed but preserved for backward compat across the
  // codebase; treat as ProviderModel. Routing branches in llm-client.ts switch
  // on prefix `claude-` to dispatch via vertex-claude-client.
  | 'claude-haiku-4-5';

// ────────────────────────────────────────────────────────────────────────────
// ADR-049 Sense 1.6 Atom 2 — Onniscenza V2 extended runtime context
// Iter 65 entrance (Andrea ratify gate post-Atom-2 ship).
// Atom 1 SHIPPED iter 64 (4 migrations + sub-processor list + 55 tests).
// Schema source: ADR-049 §4.1 (verbatim).
// ────────────────────────────────────────────────────────────────────────────

/** ADR-049 §3.1 — Row from teacher_history_log table. */
export interface TeacherHistoryItem {
  id?: string;
  teacher_anon_uuid: string;
  session_id?: string;
  experiment_id?: string | null;
  chapter?: string | null;
  vol?: string | null;
  pag?: number | null;
  started_at?: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  concepts_explained?: string[] | null;
  errors_encountered?: string[] | null;
  ragazzi_count_estimated?: number | null;
  device_mode?: 'lim' | 'lim+ipad' | 'solo-lim' | string | null;
  consent_version?: string;
}

/** ADR-049 §3.2 — Row from class_session_metadata table (single per class_key). */
export interface ClassSessionMetadata {
  id?: string;
  class_key: string;
  session_id?: string;
  tempo_disponibile_min?: number;
  livello_autonomia?: 'lead' | 'shared' | 'auto' | string;
  materiale_presente?: Record<string, unknown>;
  esperimento_scelto?: string | null;
  narrative_position?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** ADR-049 §3.3 — Aggregated summary derived from voice_movement_log rows. */
export interface VoiceMovementSummary {
  session_id?: string;
  events_count: number;
  event_types: string[];
  movement_intensity_avg?: number | null;
  zones_preferred: string[];
  /** Most recent wake_word / stt / tts events (last N). */
  recent_events?: Array<{
    event_type: string;
    payload?: Record<string, unknown> | null;
    created_at?: string;
  }>;
}

/** ADR-049 §3.4 — Row from errore_ricorrente_pattern table. */
export interface ErrorePattern {
  id?: string;
  teacher_anon_uuid: string;
  pattern_signature: string;
  detected_count: number;
  first_detected_at?: string;
  last_detected_at?: string;
  capitolo_context?: string | null;
  remediation_suggested?: string | null;
}

/** ADR-049 §4.1 — Predicted next nudge for proactive teacher support (Atom 6 full algo). */
export interface NudgePrediction {
  /** Stable signature ID used to dedupe identical predictions across calls. */
  signature: string;
  /** Confidence 0..1 of the prediction. */
  confidence: number;
  /** Suggested text for the teacher (PRINCIPIO ZERO plurale "Ragazzi,…"). */
  suggested_text?: string;
  /** Source signal: 'history' | 'errore_pattern' | 'class_meta' | 'composite'. */
  source: 'history' | 'errore_pattern' | 'class_meta' | 'composite' | string;
  /** Capitolo/vol/pag context (when derivable). */
  context?: {
    vol?: string | null;
    chapter?: string | null;
    pag?: number | null;
  };
}
