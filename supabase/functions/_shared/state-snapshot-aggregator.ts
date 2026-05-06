/**
 * state-snapshot-aggregator — Sprint V iter 43 ATOM A2 (Maker-1)
 *
 * Aggregates UI state snapshot (current circuit + drawing + chat history) from
 * the request body and exposes it as a structured "Stato corrente lavagna" block
 * that the caller (`unlim-chat/index.ts`) injects into BASE_PROMPT alongside the
 * top-3 RRF k=60 RAG hits and L4 class memory layers.
 *
 * This is the runtime wire-up for the env flag `INCLUDE_UI_STATE_IN_ONNISCENZA`
 * (set iter 42 PM autonomous). When true, callers pass `ui_snapshot` from the
 * request body and we serialize it into a compact, prompt-friendly block.
 *
 * NO LLM call. Pure JSON shaping + length capping. Defensive: never throws.
 *
 * Bug 1 fix (UNLIM doesn't see what's on the lavagna): UI snapshot field from
 * request body is now propagated all the way to BASE_PROMPT, mixed with RRF
 * top-3 RAG hits + class_memory L4 hits.
 *
 * (c) Andrea Marro 2026-05-06 — ELAB Tutor
 */

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

/** Loose UI snapshot shape — the frontend may grow fields over time, the
 *  aggregator stays defensive and only reads what it knows. */
export interface UiSnapshot {
  /** Current circuit state (components + connections), shaped by simulator-api. */
  circuit?: {
    components?: Array<{ id?: string; type?: string; x?: number; y?: number; value?: unknown }>;
    connections?: Array<{ from?: string; to?: string }>;
    description?: string;
  } | null;
  /** Drawing overlay paths (lavagna libera annotations). */
  drawing?: {
    paths?: Array<{ tool?: string; color?: string; points?: number }>;
    pathCount?: number;
  } | null;
  /** Recent chat history turns (last N) — caller decides N. */
  chat_history?: Array<{ role: 'user' | 'assistant'; content: string }> | null;
  /** Active experiment id (e.g. v1-cap6-esp1). */
  experiment_id?: string | null;
  /** Active modalità ('percorso' | 'libero' | 'guida-da-errore' | 'gia-montato'). */
  modalita?: string | null;
  /** Active capitolo (volume + chapter title). */
  capitolo?: { volume?: number; title?: string; page?: number } | null;
}

export interface SnapshotAggregateInput {
  /** UI snapshot from request body (already sanitized by caller). */
  ui_snapshot?: UiSnapshot | null;
  /** Top-K RRF fused RAG hits from onniscenza-bridge (text excerpts). */
  rag_top_k?: Array<{ source?: string; layer?: string; text?: string }> | null;
  /** L4 class memory hits (recent session summaries). */
  class_memory?: Array<{ summary?: string; ended_at?: string }> | null;
  /** Optional cap on total prompt block length (chars). Default 1200. */
  maxBlockChars?: number;
}

export interface SnapshotAggregateResult {
  /** Pre-formatted prompt block ready to append to BASE_PROMPT. Empty if no inputs. */
  promptBlock: string;
  /** Telemetry: which layers actually contributed content. */
  layersActive: Array<'ui_snapshot' | 'rag' | 'class_memory'>;
  /** Char length of the rendered prompt block. */
  blockLength: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_MAX_BLOCK_CHARS = 1200;

/** Cap a string to N chars + ellipsis. */
function clip(text: string, n: number): string {
  if (!text) return '';
  if (text.length <= n) return text;
  return text.slice(0, Math.max(0, n - 1)) + '…';
}

/** Stable JSON-ish summary of circuit (compact for prompt). */
function summarizeCircuit(circuit: UiSnapshot['circuit']): string {
  if (!circuit) return '';
  const compsArr = Array.isArray(circuit.components) ? circuit.components : [];
  const consArr = Array.isArray(circuit.connections) ? circuit.connections : [];
  if (compsArr.length === 0 && consArr.length === 0 && !circuit.description) return '';

  const compsDesc = compsArr
    .slice(0, 12)
    .map((c) => {
      const id = typeof c?.id === 'string' ? c.id : '?';
      const type = typeof c?.type === 'string' ? c.type : '?';
      return `${id}:${type}`;
    })
    .join(', ');

  const wireCount = consArr.length;
  const compCount = compsArr.length;

  const parts: string[] = [];
  if (compCount > 0) parts.push(`componenti ${compCount} (${clip(compsDesc, 200)})`);
  if (wireCount > 0) parts.push(`fili ${wireCount}`);
  if (circuit.description && typeof circuit.description === 'string') {
    parts.push(`descrizione: ${clip(circuit.description, 240)}`);
  }
  return parts.join(' | ');
}

/** Compact summary of drawing overlay. */
function summarizeDrawing(drawing: UiSnapshot['drawing']): string {
  if (!drawing) return '';
  const explicit = typeof drawing.pathCount === 'number' ? drawing.pathCount : null;
  const arrCount = Array.isArray(drawing.paths) ? drawing.paths.length : 0;
  const count = explicit ?? arrCount;
  if (!count || count <= 0) return '';
  return `disegni docente: ${count} tracci`;
}

/** Compact recent chat history (last 4 turns). */
function summarizeChatHistory(hist: UiSnapshot['chat_history']): string {
  if (!Array.isArray(hist) || hist.length === 0) return '';
  const last = hist.slice(-4);
  return last
    .map((t) => {
      const role = t?.role === 'user' ? 'D' : 'U'; // Docente / UNLIM
      const content = typeof t?.content === 'string' ? clip(t.content.replace(/\s+/g, ' '), 80) : '';
      return `${role}: ${content}`;
    })
    .join(' | ');
}

// ────────────────────────────────────────────────────────────────────────────
// Main entry
// ────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate UI snapshot + RAG hits + class memory into a single prompt block.
 *
 * Invariants:
 *  - Defensive: never throws on bad input (returns empty block + empty layers).
 *  - Output respects `maxBlockChars` cap (default 1200 chars).
 *  - Telemetry `layersActive` reflects which inputs actually produced content
 *    (so the caller can surface `onniscenza_layers_active` in the response).
 *  - Block format is human-readable Italian, prefixed with "Stato corrente
 *    lavagna:" so the LLM treats it as authoritative live state, not a
 *    hypothetical — matches the docente's view of the LIM.
 */
export function aggregateSnapshot(input: SnapshotAggregateInput | null | undefined): SnapshotAggregateResult {
  const empty: SnapshotAggregateResult = { promptBlock: '', layersActive: [], blockLength: 0 };
  if (!input || typeof input !== 'object') return empty;

  const maxChars = typeof input.maxBlockChars === 'number' && input.maxBlockChars > 0
    ? input.maxBlockChars
    : DEFAULT_MAX_BLOCK_CHARS;

  const layersActive: Array<'ui_snapshot' | 'rag' | 'class_memory'> = [];
  const sections: string[] = [];

  // 1. UI snapshot block
  try {
    const ui = input.ui_snapshot;
    if (ui && typeof ui === 'object') {
      const lines: string[] = [];
      if (ui.experiment_id && typeof ui.experiment_id === 'string') {
        lines.push(`- esperimento attivo: ${clip(ui.experiment_id, 60)}`);
      }
      if (ui.modalita && typeof ui.modalita === 'string') {
        lines.push(`- modalità: ${clip(ui.modalita, 30)}`);
      }
      if (ui.capitolo && typeof ui.capitolo === 'object') {
        const cap = ui.capitolo;
        const vol = typeof cap.volume === 'number' ? `Vol.${cap.volume}` : '';
        const title = typeof cap.title === 'string' ? cap.title : '';
        const page = typeof cap.page === 'number' ? `pag.${cap.page}` : '';
        const composed = [vol, title, page].filter(Boolean).join(' ');
        if (composed) lines.push(`- capitolo: ${clip(composed, 120)}`);
      }
      const circuit = summarizeCircuit(ui.circuit);
      if (circuit) lines.push(`- circuito: ${circuit}`);
      const drawing = summarizeDrawing(ui.drawing);
      if (drawing) lines.push(`- ${drawing}`);
      const chat = summarizeChatHistory(ui.chat_history);
      if (chat) lines.push(`- ultime domande: ${chat}`);
      if (lines.length > 0) {
        sections.push(`Stato corrente lavagna:\n${lines.join('\n')}`);
        layersActive.push('ui_snapshot');
      }
    }
  } catch {
    // never throws
  }

  // 2. RAG top-K block
  try {
    const rag = Array.isArray(input.rag_top_k) ? input.rag_top_k : [];
    if (rag.length > 0) {
      const ragLines = rag
        .filter((h) => h && typeof h.text === 'string' && h.text.trim())
        .slice(0, 3)
        .map((h, i) => {
          const src = h.source || h.layer || 'rag';
          return `${i + 1}. [${clip(src, 60)}] ${clip(h.text!.replace(/\s+/g, ' '), 220)}`;
        });
      if (ragLines.length > 0) {
        sections.push(`Fonti volumi/wiki rilevanti (RRF top-${ragLines.length}):\n${ragLines.join('\n')}`);
        layersActive.push('rag');
      }
    }
  } catch {
    // never throws
  }

  // 3. Class memory block
  try {
    const cm = Array.isArray(input.class_memory) ? input.class_memory : [];
    if (cm.length > 0) {
      const cmLines = cm
        .filter((m) => m && typeof m.summary === 'string' && m.summary.trim())
        .slice(0, 3)
        .map((m, i) => {
          const when = typeof m.ended_at === 'string' ? clip(m.ended_at.slice(0, 10), 12) : '';
          return `${i + 1}. ${when ? `(${when}) ` : ''}${clip(m.summary!.replace(/\s+/g, ' '), 200)}`;
        });
      if (cmLines.length > 0) {
        sections.push(`Memoria classe (sessioni precedenti):\n${cmLines.join('\n')}`);
        layersActive.push('class_memory');
      }
    }
  } catch {
    // never throws
  }

  if (sections.length === 0) return empty;

  // Compose final block + cap.
  let block = sections.join('\n\n');
  if (block.length > maxChars) block = clip(block, maxChars);

  return { promptBlock: block, layersActive, blockLength: block.length };
}

/**
 * Read env flag `INCLUDE_UI_STATE_IN_ONNISCENZA` (set iter 42 PM autonomous).
 * Defaults to true when unset — the wire-up is the goal of iter 43.
 */
export function isUiSnapshotEnabled(): boolean {
  try {
    // deno-lint-ignore no-explicit-any
    const denoEnv = (globalThis as any).Deno?.env;
    if (denoEnv && typeof denoEnv.get === 'function') {
      const v = (denoEnv.get('INCLUDE_UI_STATE_IN_ONNISCENZA') || '').trim().toLowerCase();
      if (v === 'false' || v === '0' || v === 'off') return false;
    }
  } catch {
    // ignore — Deno not present (e.g. Node tests) → default true
  }
  return true;
}

/** Module version marker (iter 43). */
export const STATE_SNAPSHOT_AGGREGATOR_VERSION = '1.0-iter43';
