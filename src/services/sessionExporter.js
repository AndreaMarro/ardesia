/**
 * ELAB — Session Exporter (Goal B B1)
 *
 * Serializza lo stato live del simulatore ELAB nel formato JSON canonico
 * "elab_session_export" schema v1.0. Funzione pura: legge tramite
 * window.__ELAB_API.unlim.getCircuitState() e produce solo dati — nessun
 * accesso al DOM, nessuna scrittura su storage.
 *
 * Schema v1.0 root: { elab_session_export: { version, exportedAt, experiment,
 *   modalita, components, wires } }
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import logger from '../utils/logger.js';

export const EXPORT_SCHEMA_VERSION = '1.0';

// Allowlist esplicito dei campi che entrano nello schema — niente spread su
// input dinamico, blocca silenziosamente eventuali campi inattesi.
const COMPONENT_FIELDS = ['id', 'type', 'x', 'y', 'rotation', 'color', 'value'];
const WIRE_FIELDS = ['id', 'from', 'to', 'color'];

/**
 * Deriva il numero volume (1|2|3|null) dal prefisso id esperimento.
 */
function deriveVolume(experimentId) {
  if (typeof experimentId !== 'string') return null;
  const m = experimentId.match(/^v(\d)-/);
  return m ? Number(m[1]) : null;
}

/**
 * Deriva il numero capitolo da experiment.chapter (number|string "Capitolo N")
 * oppure dall'id "vX-capN-...". Ritorna null se non disponibile.
 */
function deriveChapter(experiment, experimentId) {
  if (experiment && typeof experiment.chapter === 'number') return experiment.chapter;
  if (experiment && typeof experiment.chapter === 'string') {
    const m = experiment.chapter.match(/Capitolo\s+(\d+)/i);
    if (m) return Number(m[1]);
  }
  if (typeof experimentId === 'string') {
    const m = experimentId.match(/-cap(\d+)/);
    if (m) return Number(m[1]);
  }
  return null;
}

/**
 * Mappa i componenti live → schema (solo campi allowlist).
 * Position può essere { x, y } innestato oppure x/y top-level.
 */
function mapComponents(rawComponents) {
  if (!Array.isArray(rawComponents)) return [];
  return rawComponents.map((c) => {
    const pos = (c && c.position) || {};
    const x = typeof pos.x === 'number' ? pos.x : (typeof c?.x === 'number' ? c.x : null);
    const y = typeof pos.y === 'number' ? pos.y : (typeof c?.y === 'number' ? c.y : null);
    const rotation =
      typeof pos.rotation === 'number' ? pos.rotation :
      typeof c?.rotation === 'number' ? c.rotation : 0;
    return {
      id: c?.id ?? null,
      type: c?.type ?? null,
      x,
      y,
      rotation,
      color: c?.state?.color ?? c?.color ?? null,
      value: c?.state?.value ?? c?.value ?? null,
    };
  });
}

/**
 * Mappa le connessioni → wires (solo campi allowlist).
 */
function mapWires(rawConnections) {
  if (!Array.isArray(rawConnections)) return [];
  return rawConnections.map((conn, idx) => ({
    id: conn?.id || `w${idx + 1}`,
    from: typeof conn?.from === 'string' ? conn.from : null,
    to: typeof conn?.to === 'string' ? conn.to : null,
    color: conn?.color || 'auto',
  }));
}

/**
 * Risolve l'oggetto API simulatore (default: window.__ELAB_API).
 */
function resolveApi(apiArg) {
  if (apiArg) return apiArg;
  if (typeof window === 'undefined') return null;
  return window.__ELAB_API || null;
}

/**
 * Costruisce l'oggetto session export (NON stringificato).
 *
 * @param {Object} [opts]
 * @param {Object} [opts.api]            default window.__ELAB_API
 * @param {string} [opts.modalita]       'passo-passo' | 'gia-montato' | 'percorso'
 * @param {Object} [opts.experimentMeta] override metadata { id, title, volume, chapter }
 * @returns {Object} session export root (con chiave elab_session_export)
 */
export function buildSessionExport({ api, modalita = 'percorso', experimentMeta } = {}) {
  const resolved = resolveApi(api);

  let state = null;
  try {
    state = resolved?.unlim?.getCircuitState?.() || null;
  } catch (err) {
    logger.warn('[sessionExporter] getCircuitState threw, falling back to empty session', err);
    state = null;
  }

  const liveExp = state?.experiment || {};
  // experimentMeta vince su quanto letto live
  const id = experimentMeta?.id ?? liveExp.id ?? null;
  const title = experimentMeta?.title ?? liveExp.title ?? null;
  const volume = experimentMeta?.volume ?? deriveVolume(id);
  const chapter = experimentMeta?.chapter ?? deriveChapter(liveExp, id);

  return {
    elab_session_export: {
      version: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      experiment: { id, title, volume, chapter },
      modalita: modalita || 'percorso',
      components: mapComponents(state?.components),
      wires: mapWires(state?.connections),
    },
  };
}

/**
 * Serializza un session export in stringa JSON (indent 2).
 *
 * @param {Object} session
 * @returns {string}
 */
export function serializeSessionExport(session) {
  return JSON.stringify(session, null, 2);
}

/**
 * One-shot: costruisce + serializza.
 *
 * @param {Object} [opts] vedi buildSessionExport
 * @returns {string}
 */
export function exportSessionAsJSON(opts) {
  return serializeSessionExport(buildSessionExport(opts));
}

// Re-export costanti allowlist per testabilità.
export const __INTERNALS__ = { COMPONENT_FIELDS, WIRE_FIELDS };

export default exportSessionAsJSON;
