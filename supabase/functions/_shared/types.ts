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
  | 'gemini-2.5-pro';
