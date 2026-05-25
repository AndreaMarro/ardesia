/**
 * Compiler Service — Compilazione Arduino con fallback chain
 *
 * Catena di priorità:
 *   1. Pre-compiled HEX (offline, istantaneo, per esperimenti noti)
 *   2. Cache locale (codice già compilato in questa sessione)
 *   3. Server remoto (standalone → n8n webhook → dev locale)
 *   4. Errore user-friendly
 */

import { compileCode as remoteCompileCode } from './api.js';
import { getCachedHex, setCachedHex } from '../components/simulator/utils/compileCache.js';
import { validateIntelHex, NANO_R4_FLASH_BYTES } from '../utils/intelHexValidator.js';
import logger from '../utils/logger.js';

// ─────────────────────────────────────────────────────────────
// Pre-compiled HEX manifest
// Maps experiment IDs to their bundled HEX file paths.
// These are compiled at build time via arduino-cli and served
// as static assets — works fully offline via ServiceWorker.
// ─────────────────────────────────────────────────────────────
const PRECOMPILED_HEX = {
  'v3-cap6-semaforo':    '/hex/v3-cap6-semaforo.hex',
  'v3-cap8-esp3':        '/hex/v3-cap8-esp3.hex',
  // Extra pre-compiled (sub-experiments, variants)
  'v3-cap6-blink':       '/hex/v3-cap6-blink.hex',
  'v3-cap6-morse':       '/hex/v3-cap6-morse.hex',
  'v3-cap6-pin5':        '/hex/v3-cap6-pin5.hex',
  'v3-cap6-sirena':      '/hex/v3-cap6-sirena.hex',
  'v3-cap7-pullup':      '/hex/v3-cap7-pullup.hex',
  'v3-cap7-pulsante':    '/hex/v3-cap7-pulsante.hex',
};

const FAST_PRECOMPILED_MATCHERS = [
  {
    experimentId: 'v3-cap6-semaforo',
    hexFile: PRECOMPILED_HEX['v3-cap6-semaforo'],
    matches: (code) => (
      /pinMode\(5,\s*OUTPUT\)/.test(code)
      && /pinMode\(6,\s*OUTPUT\)/.test(code)
      && /pinMode\(3,\s*OUTPUT\)/.test(code)
      && /digitalWrite\(5,\s*HIGH\)/.test(code)
      && /digitalWrite\(6,\s*HIGH\)/.test(code)
      && /digitalWrite\(3,\s*HIGH\)/.test(code)
    ),
  },
  {
    experimentId: 'v3-cap6-blink',
    hexFile: PRECOMPILED_HEX['v3-cap6-blink'],
    matches: (code) => (
      /pinMode\(13,\s*OUTPUT\)/.test(code)
      && /digitalWrite\(13,\s*HIGH\)/.test(code)
      && /digitalWrite\(13,\s*LOW\)/.test(code)
    ),
  },
];

// ─────────────────────────────────────────────────────────────
// Code hash → HEX file mapping (for compile button matching)
// Populated lazily on first compile request.
// ─────────────────────────────────────────────────────────────
let codeHashMap = null;

/**
 * Simple fast hash for code comparison (FNV-1a 32-bit).
 * Not cryptographic — just for dedup/matching.
 */
function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

/** Normalize code for hash comparison: trim, collapse whitespace, strip comments */
function normalizeCode(code) {
  return code
    .replace(/\/\/.*$/gm, '')           // strip single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')   // strip multi-line comments
    .replace(/©.*$/gm, '')              // strip copyright lines
    .replace(/\s+/g, ' ')              // collapse whitespace
    .trim();
}

/**
 * Build the code hash → hexFile map from experiment data.
 * Called lazily on first compile to avoid importing experiment data at module level.
 */
async function buildCodeHashMap() {
  if (codeHashMap) return codeHashMap;
  codeHashMap = new Map();

  try {
    const [vol1, vol2, vol3] = await Promise.all([
      import('../data/experiments-vol1.js'),
      import('../data/experiments-vol2.js'),
      import('../data/experiments-vol3.js'),
    ]);

    const allExperiments = [
      ...(vol1.experiments || vol1.default || []),
      ...(vol2.experiments || vol2.default || []),
      ...(vol3.experiments || vol3.default || []),
    ];

    for (const exp of allExperiments) {
      if (exp.code && exp.hexFile) {
        const hash = fnv1aHash(normalizeCode(exp.code));
        codeHashMap.set(hash, {
          hexFile: exp.hexFile,
          experimentId: exp.id,
        });
      }
    }
  } catch {
    // If experiment data fails to load, continue without pre-compiled matching
  }

  return codeHashMap;
}

// ─────────────────────────────────────────────────────────────
// Session HEX cache (code hash → { hex, size })
// ─────────────────────────────────────────────────────────────
const sessionCache = new Map();
const MAX_CACHE_ENTRIES = 20;

function getCachedResult(codeHash) {
  return sessionCache.get(codeHash) || null;
}

function setCachedResult(codeHash, hex, size) {
  if (sessionCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = sessionCache.keys().next().value;
    sessionCache.delete(firstKey);
  }
  sessionCache.set(codeHash, { hex, size });
}

// ─────────────────────────────────────────────────────────────
// Compilation source tracking
// ─────────────────────────────────────────────────────────────

/** @type {'precompiled'|'cache'|'remote'|null} */
let lastCompileSource = null;

/** Get the source of the last compilation */
export function getLastCompileSource() {
  return lastCompileSource;
}

// ─────────────────────────────────────────────────────────────
// Main compile function
// ─────────────────────────────────────────────────────────────

/**
 * Compile Arduino code with intelligent fallback chain.
 *
 * @param {string} code — Arduino C++ source code
 * @param {object} [options]
 * @param {string} [options.experimentId] — current experiment ID (for direct pre-compiled lookup)
 * @param {string} [options.board] — FQBN board string
 * @returns {Promise<{success: boolean, hex: string|null, errors: string|null, output: string|null, source: string, size?: number}>}
 */
export async function compileArduinoCode(code, options = {}) {
  const { experimentId, board } = options;
  const normalizedCode = normalizeCode(code);
  const codeHash = fnv1aHash(normalizedCode);

  const fastPrecompiled = FAST_PRECOMPILED_MATCHERS.find(entry => entry.matches(normalizedCode));
  if (fastPrecompiled) {
    try {
      const hex = await fetchHexFile(fastPrecompiled.hexFile);
      if (hex) {
        lastCompileSource = 'precompiled';
        const size = Math.floor(hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
        setCachedResult(codeHash, hex, size);
        return {
          success: true,
          hex,
          errors: null,
          output: null,
          source: 'precompiled',
          experimentId: fastPrecompiled.experimentId,
          size,
        };
      }
    } catch {
      // Continue to the normal cache/remote chain.
    }
  }

  // ── Step 1: Direct pre-compiled lookup by experiment ID ──
  if (experimentId && PRECOMPILED_HEX[experimentId]) {
    const hashMap = await buildCodeHashMap();
    const match = hashMap.get(codeHash);

    // Only use pre-compiled if code hasn't been modified
    if (match && match.experimentId === experimentId) {
      try {
        const hex = await fetchHexFile(match.hexFile);
        if (hex) {
          lastCompileSource = 'precompiled';
          const size = Math.floor(hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
          setCachedResult(codeHash, hex, size);
          return {
            success: true,
            hex,
            errors: null,
            output: null,
            source: 'precompiled',
            size,
          };
        }
      } catch {
        // HEX file fetch failed — continue to next fallback
      }
    }
  }

  // ── Step 2: Code hash matching (user compiled same code before, or matches ANY experiment) ──
  const cached = getCachedResult(codeHash);
  if (cached) {
    lastCompileSource = 'cache';
    return {
      success: true,
      hex: cached.hex,
      errors: null,
      output: null,
      source: 'cache',
      size: cached.size,
    };
  }

  // Check if code matches ANY experiment's default code
  const hashMap = await buildCodeHashMap();
  const anyMatch = hashMap.get(codeHash);
  if (anyMatch) {
    try {
      const hex = await fetchHexFile(anyMatch.hexFile);
      if (hex) {
        lastCompileSource = 'precompiled';
        const size = Math.floor(hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        setCachedResult(codeHash, hex, size);
        return {
          success: true,
          hex,
          errors: null,
          output: null,
          source: 'precompiled',
          size,
        };
      }
    } catch {
      // Continue to remote
    }
  }

  // ── Step 2b: Persistent cache (localStorage, survives page reload) ──
  try {
    const persistent = getCachedHex(codeHash);
    if (persistent) {
      lastCompileSource = 'cache';
      setCachedResult(codeHash, persistent.hex, persistent.size);
      return {
        success: true,
        hex: persistent.hex,
        errors: null,
        output: null,
        source: 'persistent-cache',
        size: persistent.size,
      };
    }
  } catch { /* localStorage read error, continue to remote */ }

  // ── Step 3: Remote compilation (standalone → n8n → local dev) ──
  // Wave 1 Impl-C: exponential backoff schedule [1s, 2s] = 2 retries (3 total
  // attempts). Retry ONLY on 5xx server errors or network throws. 4xx client
  // errors (incl. syntax compile errors) bubble immediately — no retry.
  // Spec: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4 item 2
  // "Timeout 30s + retry 1× exponential backoff".
  const RETRY_BACKOFF_MS = [1000, 2000];
  const MAX_ATTEMPTS = RETRY_BACKOFF_MS.length + 1; // 3 total

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await remoteCompileCode(code, board);
      if (result.success && result.hex) {
        lastCompileSource = 'remote';
        const size = result.size || Math.floor(result.hex.replace(/[^0-9a-fA-F]/g, '').length / 2);
        setCachedResult(codeHash, result.hex, size);
        try { setCachedHex(codeHash, result.hex, size); } catch { /* ignore persistent cache write errors */ }
        return { ...result, source: 'remote', size };
      }

      // Distinguish retriable (5xx / network) from non-retriable (4xx / syntax).
      // remoteCompileCode catches HTTP internally and returns shape without
      // status. Heuristics: source='none' OR connectivity keywords OR explicit
      // 5xx in errors string. 4xx markers in errors → NO retry.
      const errStr = result.errors || '';
      const isClientError = /\b4\d{2}\b/.test(errStr); // 400, 401, 403, 404 …
      const isServerError = /\b5\d{2}\b/.test(errStr); // 500, 502, 503, 504 …
      const isNetworkError = !result.hex && !isClientError && (
        isServerError ||
        result.source === 'none' ||
        errStr.includes('non raggiungibile') ||
        errStr.includes('non risponde') ||
        errStr.includes('Failed to fetch') ||
        errStr.includes('NetworkError') ||
        errStr.includes('timeout')
      );

      if (!isNetworkError) {
        // 4xx client error or syntax — don't retry
        lastCompileSource = null;
        return { ...result, source: 'remote' };
      }

      // 5xx / network — retry with exponential backoff if attempts remain
      if (attempt < RETRY_BACKOFF_MS.length) {
        await new Promise(r => setTimeout(r, RETRY_BACKOFF_MS[attempt]));
      }
    } catch {
      // Hard JS exception (network throw) — retry with exponential backoff
      if (attempt < RETRY_BACKOFF_MS.length) {
        await new Promise(r => setTimeout(r, RETRY_BACKOFF_MS[attempt]));
      }
    }
  }

  // ── Step 4: All fallbacks exhausted ──
  lastCompileSource = null;
  return {
    success: false,
    hex: null,
    errors: 'Server di compilazione non raggiungibile. Prova con il codice predefinito dell\'esperimento oppure controlla la connessione internet e riprova.',
    output: null,
    source: 'none',
  };
}

// ─────────────────────────────────────────────────────────────
// HEX file fetcher (works offline via ServiceWorker cache)
// ─────────────────────────────────────────────────────────────

async function fetchHexFile(hexPath) {
  const url = hexPath.startsWith('/') ? hexPath : `/hex/${hexPath}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) return null;
  const text = await response.text();

  // Defensive Intel HEX validation (iter X.1.6, spec Sez 4 item 6 + Sez 20 item 3).
  // Pre-compiled HEX files are built via arduino-cli at deploy time and served as
  // static assets. Validation catches:
  //   - deploy bug (broken HEX shipped)
  //   - ServiceWorker cache corruption
  //   - CDN tampering (defense in depth)
  // Cap = Nano R4 flash (256 KB) since pre-compiled targets primarily Nano R4
  // (vedi PRECOMPILED_HEX map: v3-cap6-* + v3-cap7-* + v3-cap8-*).
  const validation = validateIntelHex(text, { maxBytes: NANO_R4_FLASH_BYTES });
  if (!validation.valid) {
    logger.warn(`fetchHexFile: HEX malformato per ${hexPath} — ${validation.error}`);
    return null;
  }
  return text;
}

/**
 * Check if a given experiment has a pre-compiled HEX available.
 * Useful for UI to show "pre-compilato" indicator.
 */
export function hasPrecompiledHex(experimentId) {
  return !!PRECOMPILED_HEX[experimentId];
}

/**
 * Get count of available pre-compiled experiments.
 */
export function getPrecompiledCount() {
  return Object.keys(PRECOMPILED_HEX).length;
}
