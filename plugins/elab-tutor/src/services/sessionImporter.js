/**
 * ELAB — Session Importer (Goal B B2)
 *
 * Parsing + validazione + restore di un export "elab_session_export" schema
 * v1.0. Difensivo verso JSON ostile: hard cap 1 MB, allowlist esplicita dei
 * campi (niente spread su input parsato), regex whitelist per experiment id,
 * cap su numero componenti/fili, nessun eval/Function/import dinamico.
 *
 * Flow restore: clearCircuit → mountExperiment(id) → setComponentValue per
 * ogni componente con value/color → connectWire per ogni filo.
 *
 * © Andrea Marro — 27/05/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import logger from '../utils/logger.js';
import { EXPORT_SCHEMA_VERSION } from './sessionExporter.js';

export const MAX_IMPORT_BYTES = 1024 * 1024; // 1 MB hard cap
export const MAX_COMPONENTS = 200;
export const MAX_WIRES = 500;

// Whitelist id esperimento: vN-capN-espN (blocca path traversal / injection).
const EXPERIMENT_ID_REGEX = /^v[123]-cap\d+-esp\d+$/;

// Whitelist modalità accettate.
const MODALITA_WHITELIST = new Set(['passo-passo', 'gia-montato', 'percorso']);

// Allowlist campi schema — qualunque chiave extra viene scartata.
const ALLOWED_EXPERIMENT_FIELDS = ['id', 'title', 'volume', 'chapter'];
const ALLOWED_COMPONENT_FIELDS = ['id', 'type', 'x', 'y', 'rotation', 'color', 'value'];
const ALLOWED_WIRE_FIELDS = ['id', 'from', 'to', 'color'];

/**
 * Calcola lunghezza in byte UTF-8 (non characters) — multibyte costa di più.
 */
function byteLength(str) {
  try {
    if (typeof Blob !== 'undefined') return new Blob([str]).size;
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str).length;
  } catch {
    /* fall through */
  }
  return str.length;
}

/**
 * Copia un oggetto includendo SOLO i campi in `allowedFields` (no spread).
 * Difesa contro prototype pollution: ignora __proto__/constructor/prototype.
 * I valori scalari (string/number/null) sono passati così come sono; gli
 * oggetti annidati NON sono attesi nello schema flat.
 */
function pickAllowed(source, allowedFields) {
  const out = {};
  if (!source || typeof source !== 'object') return out;
  for (const key of allowedFields) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    // Object.prototype.hasOwnProperty.call evita property chain inquinata
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const v = source[key];
      // Solo primitives (o null) — schema flat non prevede nested objects.
      if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) {
        out[key] = v;
      } else {
        // Nested object/array nel campo allowlist → drop silenzioso
        out[key] = null;
      }
    }
  }
  return out;
}

/**
 * Valida + sanifica il payload root. Ritorna array di errori (vuoto = ok)
 * e l'oggetto sanitizzato (allowlist-only).
 */
function validateAndSanitize(parsed) {
  const errors = [];
  const wrap = parsed && parsed.elab_session_export;
  if (!wrap || typeof wrap !== 'object') {
    return { errors: ['Missing root key "elab_session_export"'], sanitized: null };
  }

  if (wrap.version !== EXPORT_SCHEMA_VERSION) {
    errors.push(`Unsupported version "${wrap.version}" (expected "${EXPORT_SCHEMA_VERSION}")`);
  }

  // Experiment
  const rawExp = wrap.experiment;
  if (!rawExp || typeof rawExp !== 'object') {
    errors.push('Missing experiment block');
  }
  const experiment = pickAllowed(rawExp, ALLOWED_EXPERIMENT_FIELDS);
  if (typeof experiment.id !== 'string' || !EXPERIMENT_ID_REGEX.test(experiment.id)) {
    errors.push('experiment.id missing or fails whitelist /^v[123]-cap\\d+-esp\\d+$/');
  }

  // Modalita — opzionale ma se presente deve essere whitelist
  let modalita = wrap.modalita;
  if (modalita != null && !MODALITA_WHITELIST.has(modalita)) {
    errors.push(`modalita "${modalita}" not in whitelist`);
    modalita = null;
  }

  // Components
  if (!Array.isArray(wrap.components)) {
    errors.push('components must be an array');
  }
  const rawComponents = Array.isArray(wrap.components) ? wrap.components : [];
  if (rawComponents.length > MAX_COMPONENTS) {
    errors.push(`components exceeds MAX_COMPONENTS=${MAX_COMPONENTS} (got ${rawComponents.length})`);
  }
  const components = rawComponents.slice(0, MAX_COMPONENTS).map((c) => pickAllowed(c, ALLOWED_COMPONENT_FIELDS));
  components.forEach((c, i) => {
    if (typeof c.id !== 'string' || typeof c.type !== 'string') {
      errors.push(`components[${i}] missing required id/type`);
    }
  });

  // Wires
  if (!Array.isArray(wrap.wires)) {
    errors.push('wires must be an array');
  }
  const rawWires = Array.isArray(wrap.wires) ? wrap.wires : [];
  if (rawWires.length > MAX_WIRES) {
    errors.push(`wires exceeds MAX_WIRES=${MAX_WIRES} (got ${rawWires.length})`);
  }
  const wires = rawWires.slice(0, MAX_WIRES).map((w) => pickAllowed(w, ALLOWED_WIRE_FIELDS));
  wires.forEach((w, i) => {
    if (typeof w.from !== 'string' || typeof w.to !== 'string') {
      errors.push(`wires[${i}] missing required from/to`);
    }
  });

  if (errors.length > 0) return { errors, sanitized: null };

  const sanitized = {
    elab_session_export: {
      version: wrap.version,
      exportedAt: typeof wrap.exportedAt === 'string' ? wrap.exportedAt : null,
      experiment,
      modalita: modalita || 'percorso',
      components,
      wires,
    },
  };
  return { errors: [], sanitized };
}

/**
 * Parsa una stringa JSON e valida contro lo schema v1.0.
 * Sicuro contro JSON malevoli: solo JSON.parse, niente eval/Function,
 * niente spread su input parsato, allowlist esplicita.
 *
 * @param {string} jsonString
 * @returns {{ ok: boolean, errors: string[], session: Object|null }}
 */
export function parseSessionJSON(jsonString) {
  if (typeof jsonString !== 'string') {
    return { ok: false, errors: ['Input must be a string'], session: null };
  }

  const size = byteLength(jsonString);
  if (size > MAX_IMPORT_BYTES) {
    return {
      ok: false,
      errors: [`payload too large (${size} > ${MAX_IMPORT_BYTES})`],
      session: null,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return { ok: false, errors: [`invalid JSON: ${err.message}`], session: null };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errors: ['parsed payload is not an object'], session: null };
  }

  const { errors, sanitized } = validateAndSanitize(parsed);
  if (errors.length > 0 || !sanitized) {
    return { ok: false, errors, session: null };
  }
  return { ok: true, errors: [], session: sanitized };
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
 * Applica una sessione validata al simulatore live.
 *
 * Sequenza:
 *   1. clearCircuit() — reset
 *   2. mountExperiment(id) — carica layout stock
 *   3. setComponentValue per ogni componente con value o color noti
 *   4. connectWire per ogni filo
 *
 * NOTE v1: le custom positions (x/y/rotation) NON sono ri-applicate —
 * mountExperiment carica il layout stock. v2 farà diff + drag-restore.
 *
 * @param {Object} session payload validato (root con elab_session_export oppure inner)
 * @param {Object} [opts]
 * @param {Object} [opts.api]  default window.__ELAB_API
 * @returns {Promise<{ ok: boolean, applied: { components: number, wires: number }, errors: string[] }>}
 */
export async function restoreSession(session, opts = {}) {
  const errors = [];
  const applied = { components: 0, wires: 0 };

  const payload = session?.elab_session_export || session;
  if (!payload || typeof payload !== 'object') {
    return { ok: false, applied, errors: ['Invalid session object'] };
  }

  const experimentId = payload.experiment?.id;
  if (typeof experimentId !== 'string' || !EXPERIMENT_ID_REGEX.test(experimentId)) {
    return { ok: false, applied, errors: ['Missing or invalid experiment.id'] };
  }

  const api = resolveApi(opts.api);
  const unlim = api?.unlim;
  // Codex stop-time fix 2026-05-25: only `mountExperiment` exists on both
  // top-level `__ELAB_API` (simulator-api.js:300) AND `unlim` namespace
  // (simulator-api.js:769). The other restore primitives — clearCircuit,
  // setComponentValue, connectWire — live ONLY at top-level (lines 273, 282,
  // 290). Previous code looked them up under `unlim` only, so restore was a
  // silent no-op in production. Resolve each via top-level → unlim fallback.
  const pickFn = (name) => {
    if (typeof api?.[name] === 'function') return api[name].bind(api);
    if (typeof unlim?.[name] === 'function') return unlim[name].bind(unlim);
    return null;
  };
  const apiMountExperiment = pickFn('mountExperiment');
  if (!apiMountExperiment) {
    return { ok: false, applied, errors: ['Simulator API unavailable (window.__ELAB_API)'] };
  }
  const apiClearCircuit = pickFn('clearCircuit');
  const apiSetComponentValue = pickFn('setComponentValue');
  const apiConnectWire = pickFn('connectWire');

  // 1. clearCircuit (best-effort: alias di clearAll, può non esistere su mock)
  if (apiClearCircuit) {
    try {
      apiClearCircuit();
    } catch (err) {
      errors.push(`clearCircuit threw: ${err.message}`);
    }
  }

  // 2. mountExperiment
  try {
    const mounted = apiMountExperiment(experimentId);
    if (mounted === false) {
      return { ok: false, applied, errors: [...errors, `mount failed for "${experimentId}"`] };
    }
  } catch (err) {
    return { ok: false, applied, errors: [...errors, `mount failed: ${err.message}`] };
  }

  // 3. setComponentValue per i campi value / color (skip null). Codex MED-3:
  // only count as applied when setComponentValue API is available — silent
  // no-op without warning was misleading.
  const components = Array.isArray(payload.components) ? payload.components : [];
  if (!apiSetComponentValue && components.length > 0) {
    errors.push('setComponentValue API unavailable — component values not restored');
  }
  for (const c of components) {
    if (typeof c.id !== 'string') continue;
    if (!apiSetComponentValue) continue;
    let appliedThisComponent = false;
    try {
      if (c.value !== undefined && c.value !== null) {
        apiSetComponentValue(c.id, 'value', c.value);
        appliedThisComponent = true;
      }
      if (c.color !== undefined && c.color !== null) {
        apiSetComponentValue(c.id, 'color', c.color);
        appliedThisComponent = true;
      }
      if (appliedThisComponent) applied.components += 1;
    } catch (err) {
      errors.push(`setComponentValue failed for ${c.id}: ${err.message}`);
    }
  }

  // 4. connectWire
  const wires = Array.isArray(payload.wires) ? payload.wires : [];
  if (!apiConnectWire && wires.length > 0) {
    errors.push('connectWire API unavailable');
  }
  for (const w of wires) {
    if (typeof w.from !== 'string' || typeof w.to !== 'string') continue;
    if (!apiConnectWire) break;
    try {
      apiConnectWire(w.from, w.to);
      applied.wires += 1;
    } catch (err) {
      errors.push(`connectWire ${w.from} -> ${w.to} failed: ${err.message}`);
    }
  }

  if (errors.length > 0) {
    logger.warn('[sessionImporter] restoreSession completed with errors', errors);
  }
  return { ok: errors.length === 0, applied, errors };
}

/**
 * One-shot: parse + restore.
 *
 * @param {string} jsonString
 * @param {Object} [opts] passato a restoreSession
 * @returns {Promise<{ ok: boolean, errors: string[], applied: Object }>}
 */
export async function importSessionFromJSON(jsonString, opts = {}) {
  const parsed = parseSessionJSON(jsonString);
  if (!parsed.ok || !parsed.session) {
    return { ok: false, errors: parsed.errors, applied: { components: 0, wires: 0 } };
  }
  return restoreSession(parsed.session, opts);
}

export default { parseSessionJSON, restoreSession, importSessionFromJSON };
