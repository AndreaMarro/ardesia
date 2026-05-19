/**
 * experimentNarrativeService.js
 * ELAB Vol3 Parità Stretta — Tea narrative_map + cliffhanger + schema integration
 * iter-70-A: bridges cliffhanger-table.json + narrative-map-94.json + standard-experiment-schema.json
 *
 * PRINCIPIO ZERO: all cliffhanger texts use "Ragazzi" + Vol/pag verbatim
 * MORFISMO: chain order matches physical printed volumes
 *
 * © Andrea Marro — ELAB Tutor — Tutti i diritti riservati
 */

import cliffhangerTable from '../data/cliffhanger-table.json';
import narrativeMap from '../data/narrative-map-94.json';

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Flatten cliffhanger-table into a Map keyed by experiment id for O(1) lookup.
 * @returns {Map<string, object>}
 */
function buildCliffhangerIndex() {
  const map = new Map();
  for (const entry of cliffhangerTable.experiments) {
    map.set(entry.id, entry);
  }
  return map;
}

/**
 * Flatten narrative-map-94 experiments across all volumes into a Map keyed by id.
 * @returns {Map<string, object>}
 */
function buildNarrativeIndex() {
  const map = new Map();
  for (const volKey of Object.keys(narrativeMap.volumes)) {
    const vol = narrativeMap.volumes[volKey];
    for (const chapKey of Object.keys(vol.chapters || {})) {
      const chap = vol.chapters[chapKey];
      for (const exp of chap.experiments || []) {
        map.set(exp.id, exp);
      }
    }
  }
  return map;
}

// Singleton indexes — built once at module init
const _cliffhangerIndex = buildCliffhangerIndex();
const _narrativeIndex = buildNarrativeIndex();

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the cliffhanger transition text for a given experiment.
 * PRINCIPIO ZERO: returned text always starts with or contains "Ragazzi".
 *
 * @param {string} currentExpId  - canonical experiment id, e.g. "v3-cap5-esp1"
 * @param {string|null} [nextExpId] - expected next id; if provided, validates chain
 * @returns {{ cliffhanger: string, next_id: string|null, valid: boolean, reason: string }}
 */
export function getCliffhangerFor(currentExpId, nextExpId = undefined) {
  const entry = _cliffhangerIndex.get(currentExpId);

  if (!entry) {
    return {
      cliffhanger: null,
      next_id: null,
      valid: false,
      reason: `experiment id "${currentExpId}" not found in cliffhanger-table`
    };
  }

  // If caller provided an expected nextExpId, validate it matches the chain
  if (nextExpId !== undefined && nextExpId !== entry.next_id) {
    return {
      cliffhanger: entry.cliffhanger,
      next_id: entry.next_id,
      valid: false,
      reason: `chain mismatch: expected next="${nextExpId}" but table has next="${entry.next_id}"`
    };
  }

  return {
    cliffhanger: entry.cliffhanger,
    next_id: entry.next_id,
    valid: true,
    reason: 'ok'
  };
}

/**
 * Returns the next experiment id in the canonical Vol3 chain.
 * Uses narrative-map-94.json as source of truth for chain order.
 *
 * @param {string} currentExpId
 * @returns {string|null} next experiment id, or null if terminal (end of chain)
 */
export function getNextExperimentInChain(currentExpId) {
  // Prefer cliffhanger-table for Vol3 (authoritative for canonical chain)
  if (_cliffhangerIndex.has(currentExpId)) {
    return _cliffhangerIndex.get(currentExpId).next_id;
  }
  // Fallback: narrative-map-94 for Vol1/Vol2
  if (_narrativeIndex.has(currentExpId)) {
    return _narrativeIndex.get(currentExpId).next_id ?? null;
  }
  return null;
}

/**
 * Validates a runtime experiment object against the canonical Tea 7-step schema.
 * Checks: required fields, all 7 steps present, PRINCIPIO ZERO rules (subset checkable statically).
 *
 * @param {object} expData - experiment object from experiments-vol*.js
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateExperimentAgainstSchema(expData) {
  const errors = [];
  const warnings = [];

  if (!expData || typeof expData !== 'object') {
    return { valid: false, errors: ['expData must be a non-null object'], warnings: [] };
  }

  // ── Required top-level fields ────────────────────────────────────────────
  const requiredFields = ['id', 'title', 'chapter'];
  for (const field of requiredFields) {
    if (!expData[field]) errors.push(`missing required field: "${field}"`);
  }

  // ── experiment_id pattern ────────────────────────────────────────────────
  if (expData.id && !/^v[1-3]-(cap\d+-esp\d+|cap\d+-[a-z]+|extra-[a-z-]+)/.test(expData.id)) {
    errors.push(`id "${expData.id}" does not match canonical pattern v{vol}-cap{n}-{slug}`);
  }

  // ── PRINCIPIO ZERO: no "Galileo" name ───────────────────────────────────
  const textFields = ['title', 'desc', 'unlimPrompt', 'observe'];
  for (const f of textFields) {
    if (typeof expData[f] === 'string' && /\bgalileo\b/i.test(expData[f])) {
      errors.push(`PRINCIPIO ZERO violation: field "${f}" contains "Galileo" (use "UNLIM")`);
    }
  }

  // ── PRINCIPIO ZERO: unlimPrompt should address "Ragazzi" ────────────────
  if (expData.unlimPrompt && !/ragazz[ie]/i.test(expData.unlimPrompt)) {
    warnings.push('PRINCIPIO ZERO: unlimPrompt does not contain "Ragazzi/Ragazze" (plurale obbligatorio)');
  }

  // ── components_needed structure (if present) ─────────────────────────────
  if (Array.isArray(expData.components)) {
    expData.components.forEach((comp, i) => {
      if (!comp.type) errors.push(`components[${i}] missing "type"`);
      if (!comp.id)   errors.push(`components[${i}] missing "id"`);
    });
  }

  // ── 7-step pedagogical structure check (if steps object is present) ──────
  if (expData.steps && typeof expData.steps === 'object' && !Array.isArray(expData.steps)) {
    const requiredSteps = ['setup', 'ipotesi', 'costruzione', 'misura', 'variazione', 'conclusione', 'trasferimento'];
    for (const step of requiredSteps) {
      if (!expData.steps[step]) {
        errors.push(`missing pedagogical step: "${step}" (Tea canonical 7-step structure)`);
      }
    }
    // trasferimento must have cliffhanger
    if (expData.steps.trasferimento && !expData.steps.trasferimento.cliffhanger) {
      errors.push('trasferimento step missing "cliffhanger" field');
    }
  }

  // ── buildSteps array (ELAB-specific guided mode) ─────────────────────────
  if (expData.buildSteps !== undefined && !Array.isArray(expData.buildSteps)) {
    errors.push('"buildSteps" must be an array when present');
  }

  // ── difficulty range ─────────────────────────────────────────────────────
  if (expData.difficulty !== undefined) {
    if (typeof expData.difficulty !== 'number' || expData.difficulty < 1 || expData.difficulty > 5) {
      warnings.push('"difficulty" should be integer 1-5');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Returns metadata for an experiment from the cliffhanger table (title, page, chapter).
 * Useful for UI display of "next experiment" CTA.
 *
 * @param {string} expId
 * @returns {object|null}
 */
export function getExperimentMeta(expId) {
  return _cliffhangerIndex.get(expId) ?? null;
}

/**
 * Returns all Vol3 experiments in canonical physical-book chain order.
 * Useful for building navigation / progress UI.
 *
 * @returns {Array<{ id: string, title: string, page: number, next_id: string|null }>}
 */
export function getVol3Chain() {
  return cliffhangerTable.experiments.map(e => ({
    id: e.id,
    title: e.title,
    chapter: e.chapter_title,
    page: e.page,
    next_id: e.next_id
  }));
}
