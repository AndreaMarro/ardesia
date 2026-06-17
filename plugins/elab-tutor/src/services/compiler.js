/**
 * Compiler Service — Compilazione Arduino con fallback chain
 *
 * Catena di priorità:
 *   1. Pre-compiled HEX (offline, istantaneo, per esperimenti noti)
 *   2. Cache locale (codice già compilato in questa sessione)
 *   3. Server remoto (standalone → n8n webhook → dev locale)
 *   4. Errore user-friendly
 */

import {
  getCachedHex,
  setCachedHex,
  recordCompileMetric,
  getCompileMetrics,
  resetCompileMetrics,
} from '../components/simulator/utils/compileCache.js';
import {
  validateIntelHex,
  NANO_R4_FLASH_BYTES,
  ATMEGA328P_FLASH_BYTES,
} from '../utils/intelHexValidator.js';
import logger from '../utils/logger.js';
import { compileArduinoInBrowser } from './inBrowserAvrCompiler.js';
import { getBoardForBoardParam, supportsInBrowserCompile } from './arduinoBoards.js';

// ─────────────────────────────────────────────────────────────
// Wave 1b Impl-C-2 — RAM report + size warning thresholds
// Spec source: PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 4 items 1-2
// ─────────────────────────────────────────────────────────────

/** ATmega328p size warn threshold: 28KB out of 32KB flash. */
const ATMEGA328P_SIZE_WARN_BYTES = 28 * 1024;

/** Nano R4 (Renesas) size warn threshold: 90% of 256KB flash. */
const NANO_R4_SIZE_WARN_BYTES = Math.floor(NANO_R4_FLASH_BYTES * 0.9);

/** RAM warn threshold: 90% (applies to all boards). */
const RAM_WARN_PERCENT = 90;

/**
 * Parse arduino-cli stdout for the canonical RAM usage line.
 * Pattern: `RAM:   [...]  XX% (used Y bytes of Z)` (whitespace tolerant).
 *
 * @param {string} stdout - arduino-cli stdout/output text
 * @returns {{ used: number, total: number, percent: number } | null}
 */
export function parseRamReport(stdout) {
  if (typeof stdout !== 'string' || stdout.length === 0) return null;
  // RAM:   [== ]  21% (used 432 bytes of 2048)
  const re = /RAM:[^\d%]*(\d+)\s*%\s*\(used\s+(\d+)\s+bytes\s+of\s+(\d+)\)/i;
  const m = stdout.match(re);
  if (!m) return null;
  return {
    used: Number(m[2]),
    total: Number(m[3]),
    percent: Number(m[1]),
  };
}

/**
 * Compute size + RAM warning flags for a compile result.
 * UI consumer (Wave 2) renders these; here we only SET the flag.
 *
 * @param {{ hexBytes: number, ramPercent: number|null, board?: string }} params
 * @returns {string[]} warn flags subset of ['size-near-limit', 'ram-near-limit']
 */
export function evaluateSizeWarnings({ hexBytes, ramPercent, board }) {
  const warn = [];
  const isNanoR4 = typeof board === 'string' && /renesas|unor4|nanor4/i.test(board);
  const sizeThreshold = isNanoR4 ? NANO_R4_SIZE_WARN_BYTES : ATMEGA328P_SIZE_WARN_BYTES;
  if (typeof hexBytes === 'number' && hexBytes > sizeThreshold) {
    warn.push('size-near-limit');
  }
  if (typeof ramPercent === 'number' && ramPercent >= RAM_WARN_PERCENT) {
    warn.push('ram-near-limit');
  }
  return warn;
}

// ─────────────────────────────────────────────────────────────
// Compile telemetry — session counters (re-exported from compileCache)
// Wave 1b Impl-C-2: counters live in compileCache.js (owned), wrapped here
// to give compiler.js callers a single import surface.
// ─────────────────────────────────────────────────────────────

/**
 * Snapshot of session-scoped compile telemetry.
 * @returns {{ count: number, success: number, avgLatencyMs: number }}
 */
export function getCompileTelemetry() {
  const m = getCompileMetrics();
  return { count: m.count, success: m.success, avgLatencyMs: m.avgLatencyMs };
}

/** Reset compile telemetry. Test hook + session boundary helper. */
export function resetCompileTelemetry() {
  resetCompileMetrics();
}

// Reference threshold const so tests can introspect it (no behavior effect).
void ATMEGA328P_FLASH_BYTES;

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
  // 2026-05-27 — Andrea mandate "esperimenti devono funzionare". Compiled with
  // arduino-cli + arduino:avr:nano:cpu=atmega328old. Sketch 924B / 970B.
  'v3-cap6-esp3':        '/hex/v3-cap6-esp3.hex',
  'v3-cap6-esp4':        '/hex/v3-cap6-esp4.hex',
};

// Nano R4 (Renesas RA4M1) precompiled HEX variants. Linked at flash base 0x4000.
// Compiled with arduino-cli --fqbn arduino:renesas_uno:nanor4. Used when caller
// passes board='arduino:renesas_uno:nanor4' (or any 'renesas' substring).
// Generated via `npm run compile:r4:precompile` — append more entries as you
// add experiments to public/hex/.
const PRECOMPILED_HEX_R4 = {
  'v3-cap6-esp1':        '/hex/v3-cap6-esp1-r4.hex',
  'v3-cap6-esp2':        '/hex/v3-cap6-esp2-r4.hex',
  'v3-cap6-esp3':        '/hex/v3-cap6-esp3-r4.hex',
  'v3-cap6-esp4':        '/hex/v3-cap6-esp4-r4.hex',
};

function isRenesasBoard(board) {
  if (!board) return false;
  return /renesas|nanor4|unor4/i.test(String(board));
}

function pickHexManifest(board) {
  return isRenesasBoard(board) ? PRECOMPILED_HEX_R4 : PRECOMPILED_HEX;
}

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
  // v3-cap6-esp3 — single LED on pin 8 blink 700ms.
  {
    experimentId: 'v3-cap6-esp3',
    hexFile: PRECOMPILED_HEX['v3-cap6-esp3'],
    matches: (code) => (
      /pinMode\(\s*(LED_PIN|8)\s*,\s*OUTPUT\)/.test(code)
      && /digitalWrite\(\s*(LED_PIN|8)\s*,\s*HIGH\)/.test(code)
      && /digitalWrite\(\s*(LED_PIN|8)\s*,\s*LOW\)/.test(code)
      && /delay\(\s*700\s*\)/.test(code)
    ),
  },
  // v3-cap6-esp4 — two LEDs on pin 6 + 9 alternating 200ms.
  {
    experimentId: 'v3-cap6-esp4',
    hexFile: PRECOMPILED_HEX['v3-cap6-esp4'],
    matches: (code) => (
      /pinMode\(\s*(LED_BLU|6)\s*,\s*OUTPUT\)/.test(code)
      && /pinMode\(\s*(LED_ROSSO|9)\s*,\s*OUTPUT\)/.test(code)
      && /digitalWrite\(\s*(LED_BLU|6)\s*,\s*HIGH\)/.test(code)
      && /digitalWrite\(\s*(LED_ROSSO|9)\s*,\s*HIGH\)/.test(code)
      && /delay\(\s*200\s*\)/.test(code)
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
 * @returns {Promise<{success: boolean, hex: string|null, errors: string|null, output: string|null, source: string, size?: number, ram?: {used:number,total:number,percent:number}|null, warn?: string[]}>}
 */
export async function compileArduinoCode(code, options = {}) {
  const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const result = await _compileArduinoCodeInner(code, options);
  const latencyMs = Math.max(
    0,
    ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0
  );

  // Wave 1b Impl-C-2: enrich result with ram + warn fields.
  const ram = parseRamReport(result.output);
  const hexBytes = typeof result.size === 'number'
    ? result.size
    : (result.hex ? Math.floor(result.hex.replace(/[^0-9a-fA-F]/g, '').length / 2) : 0);
  const warn = evaluateSizeWarnings({
    hexBytes,
    ramPercent: ram ? ram.percent : null,
    board: options.board,
  });

  // Wave 1b Impl-C-2: telemetry counter (fire-and-forget).
  try {
    recordCompileMetric({
      success: !!result.success,
      latencyMs,
      ramPercent: ram ? ram.percent : null,
    });
  } catch { /* telemetry must not break compile flow */ }

  return { ...result, ram, warn };
}

async function _compileArduinoCodeInner(code, options = {}) {
  const { experimentId, board } = options;
  const normalizedCode = normalizeCode(code);
  const baseHash = fnv1aHash(normalizedCode);

  const r4 = isRenesasBoard(board);
  const manifest = pickHexManifest(board);
  // Adversarial-review MED-2 fix 2026-05-27: cache key MUST include board
  // family. Same code compiled for AVR then R4 was hitting cache + returning
  // AVR HEX for R4 upload → DFU rejected with unexpected_flash_address.
  const codeHash = `${baseHash}:${r4 ? 'r4' : 'avr'}`;

  const fastPrecompiled = FAST_PRECOMPILED_MATCHERS.find(entry => entry.matches(normalizedCode));
  if (fastPrecompiled) {
    // Pick board-specific hex when available; fall through if R4 variant missing.
    const hexFile = r4
      ? (manifest[fastPrecompiled.experimentId] || null)
      : fastPrecompiled.hexFile;
    if (hexFile) {
      try {
        const hex = await fetchHexFile(hexFile);
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
            board: board || 'avr',
          };
        }
      } catch {
        // Continue to the normal cache/remote chain.
      }
    }
  }

  // ── Step 1: Direct pre-compiled lookup by experiment ID ──
  if (experimentId && manifest[experimentId]) {
    const hashMap = await buildCodeHashMap();
    const match = hashMap.get(codeHash);

    // Only use pre-compiled if code hasn't been modified
    if (match && match.experimentId === experimentId) {
      try {
        const hex = await fetchHexFile(manifest[experimentId]);
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

  // ── Step 1.5: In-browser AVR compile (no backend) ──
  // Routed via board registry: only ATmega328P-class boards (Uno, Nano)
  // currently emit machine code in-browser. Renesas R4, SAMD, ESP32 fall
  // through to precompiled HEX or remote compile chain.
  const boardEntry = getBoardForBoardParam(board);
  if (boardEntry && supportsInBrowserCompile(boardEntry)) {
    try {
      const browserResult = compileArduinoInBrowser(code, { board: boardEntry.id });
      if (browserResult.success && browserResult.hex) {
        lastCompileSource = 'browser';
        setCachedResult(codeHash, browserResult.hex, browserResult.size);
        return {
          success: true,
          hex: browserResult.hex,
          errors: null,
          output: null,
          source: 'browser',
          size: browserResult.size,
          board: boardEntry.id,
        };
      }
    } catch {
      // Fall through to cache/remote chain.
    }
  } else if (!r4 && !boardEntry) {
    // No board hint at all — default to ATmega328P Nano.
    try {
      const browserResult = compileArduinoInBrowser(code, { board: 'nano' });
      if (browserResult.success && browserResult.hex) {
        lastCompileSource = 'browser';
        setCachedResult(codeHash, browserResult.hex, browserResult.size);
        return {
          success: true,
          hex: browserResult.hex,
          errors: null,
          output: null,
          source: 'browser',
          size: browserResult.size,
          board: 'nano',
        };
      }
    } catch {
      // fall through
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
    // When caller requested Renesas board, prefer the R4 precompiled variant
    // (linked at 0x4000) over the experiment.hexFile which is the AVR HEX.
    const targetHexFile =
      r4 && manifest[anyMatch.experimentId]
        ? manifest[anyMatch.experimentId]
        : anyMatch.hexFile;
    try {
      const hex = await fetchHexFile(targetHexFile);
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
        // Wave 1b Impl-C-2: validate remote HEX response before returning.
        // Defense in depth — catches n8n/proxy returning malformed HEX
        // (e.g. truncated, HTML error page, bad checksum). Pre-compiled path
        // already validates via fetchHexFile.
        const remoteValidation = validateIntelHex(result.hex, { maxBytes: NANO_R4_FLASH_BYTES });
        if (!remoteValidation.valid) {
          logger.warn(`compileArduinoCode: remote HEX malformato — ${remoteValidation.error}`);
          lastCompileSource = null;
          return {
            success: false,
            hex: null,
            errors: `Risposta del compilatore non valida: HEX malformato (${remoteValidation.error}). Riprova o usa il codice predefinito.`,
            output: result.output || null,
            source: 'remote',
          };
        }
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
