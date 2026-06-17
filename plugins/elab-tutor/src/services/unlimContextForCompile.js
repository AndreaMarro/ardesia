// © Andrea Marro — 29/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * unlimContextForCompile — Compile-home specific UNLIM context collector.
 *
 * Swarm 3 (2026-05-29). Andrea verbatim mandate:
 *   "con unlim integrato con chat e interfacciamento totale"
 *
 * Purpose: forward to the UNLIM backend ONLY the slice of compile-home state
 * UNLIM needs to answer correctly (current sketch source, editor mode, compile
 * status, board picker selection, last upload result). Mirrors the existing
 * `src/services/unlimContextCollector.js` shape used by Lavagna so the Edge
 * Function (`supabase/functions/unlim-chat`) consumes identical keys.
 *
 * Why a separate service (vs reusing unlimContextCollector):
 *   - Compile-home has NO `__ELAB_API` (no simulator runtime mount).
 *   - We must avoid leaking simulator-only fields (pinStates, applicationNarrative)
 *     that don't apply outside Lavagna. Those would mislead the LLM into
 *     "diagnosi circuito" branch instead of "spiegazione codice" branch.
 *   - HomeCompileEntry owns compile state in plain React state; the parent
 *     passes a flat object — we shape it into `simulatorContext`-compatible
 *     fields for `sendChat({ simulatorContext, ... })`.
 *
 * Prompt-injection hardening:
 *   - All free-text fields (compileErrors, compileWarnings, uploadError) are
 *     clipped + stripped of control characters before forwarding. This
 *     prevents an arduino-cli error string containing `[INTENT:{...}]` from
 *     being interpreted as an UNLIM action tag downstream.
 *   - sketchCode is capped at MAX_CODE_CHARS to avoid context overflow + to
 *     prevent multi-line code injection of pseudo-system messages.
 *
 * Output shape mirrors `sendChat()` `simulatorContext` contract (src/services/api.js
 * lines 864-913) so existing nanobotMessage assembly + Edge Function prompt
 * builder consume the same keys.
 *
 * (c) Andrea Marro — Swarm 3 — 2026-05-29
 */

const MAX_CODE_CHARS = 4000;     // ~80 lines C++ typical Blink+sensors
const MAX_ERROR_CHARS = 800;     // arduino-cli stderr clip
const MAX_BOARD_LABEL_CHARS = 80;
const MAX_BOARD_ID_CHARS = 60;
const MAX_FQBN_CHARS = 80;
const MAX_UPLOAD_MSG_CHARS = 400;

/**
 * Strip ASCII control chars (0x00-0x1F except \n/\t) + clip to maxChars.
 * Critical for prompt-injection defence: prevents an attacker-controlled
 * compile error from including `[INTENT:{...}]` or zero-width chars that
 * could exfiltrate context or trigger UNLIM tool dispatch.
 */
function sanitizeFreeText(raw, maxChars = MAX_ERROR_CHARS) {
  if (raw === null || raw === undefined) return '';
  let s = typeof raw === 'string' ? raw : String(raw);
  // Strip control chars except \n (0x0A) and \t (0x09).
  s = s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');
  // Strip [AZIONE:...] / [azione:...] / [INTENT:{...}] tag-like substrings so an
  // error message echoed back as context doesn't get re-interpreted as a tool
  // dispatch on the next round-trip (defence in depth — Edge Function also
  // re-parses, but client should not forward attacker-shaped tag soup).
  s = s.replace(/\[\s*azione\s*:[^\]]*\]/gi, '[azione removed]');
  s = s.replace(/\[\s*INTENT\s*:\s*\{[\s\S]*?\}\s*\]/gi, '[intent removed]');
  // Trim + clip
  s = s.trim();
  if (s.length > maxChars) {
    s = s.slice(0, maxChars) + '… [troncato]';
  }
  return s;
}

/**
 * Sanitize a short opaque token (board id, FQBN). Stricter than free-text:
 * only allow [a-zA-Z0-9:_.-]. Prevents accidental newline/tag injection via
 * board picker if a future picker accepts user-typed values.
 */
function sanitizeToken(raw, maxChars) {
  if (raw === null || raw === undefined) return '';
  const s = typeof raw === 'string' ? raw : String(raw);
  // Whitelist: alphanumerics + : _ . - and ASCII space (FQBN colons mandatory).
  let cleaned = s.replace(/[^a-zA-Z0-9:_.\- ]/g, '').trim();
  // Defence-in-depth: even if token chars survived, prevent the substrings
  // 'INTENT' / 'AZIONE' / 'azione' from being concatenated into a downstream
  // prompt (an attacker-shaped board picker value should never carry tag
  // grammar even after bracket stripping). Replace with neutral '-'.
  cleaned = cleaned.replace(/INTENT|AZIONE|azione|intent/g, '-');
  // Collapse repeated colons (FQBN uses single colons as separators).
  cleaned = cleaned.replace(/:{2,}/g, ':');
  return cleaned.slice(0, maxChars);
}

/**
 * Count non-empty lines for a quick "righe" telemetry the Edge Function
 * prompt mentions ("Codice C++: X righe"). Lazy + safe on undefined.
 */
function countLines(code) {
  if (typeof code !== 'string' || !code) return 0;
  return code.split('\n').filter((l) => l.trim().length > 0).length;
}

/**
 * Build a compile-home `simulatorContext` payload for sendChat().
 *
 * @param {Object} input
 * @param {string} input.sketchCode          - Source forwarded to compile (Blockly generated C++ OR direct C++)
 * @param {'blocks'|'code'} input.editorMode - Editor mode active in HomeCompileEntry
 * @param {'idle'|'compiling'|'success'|'verified-legacy'|'error'} input.compileStatus
 * @param {string|null} input.compileErrors  - arduino-cli stderr OR friendly translator output
 * @param {string|null} input.compileWarnings
 * @param {{flashUsed?:number, flashTotal?:number, pct?:number}|null} input.compileSize
 * @param {string} input.boardId             - e.g. 'arduino-nano-r4' OR 'arduino-uno-r3'
 * @param {string} input.boardLabel          - human label e.g. 'Nano R4'
 * @param {string} input.fqbn                - canonical arduino-cli FQBN
 * @param {number} input.blockCount          - Blockly workspace top-block count
 * @param {{ok:boolean, message?:string, ts?:number}|null} input.lastUpload
 * @param {string} input.language            - 'it' | 'en'
 *
 * @returns {Object} simulatorContext-compatible payload
 */
export function buildCompileHomeContext(input = {}) {
  const {
    sketchCode = '',
    editorMode = 'blocks',
    compileStatus = 'idle',
    compileErrors = null,
    compileWarnings = null,
    compileSize = null,
    boardId = '',
    boardLabel = '',
    fqbn = '',
    blockCount = 0,
    lastUpload = null,
    language = 'it',
  } = input || {};

  // Sanitize free-text + tokens. Defence-in-depth (Edge Function also sanitises).
  const safeCode = sanitizeFreeText(sketchCode, MAX_CODE_CHARS);
  const safeErrors = compileErrors ? sanitizeFreeText(compileErrors, MAX_ERROR_CHARS) : null;
  const safeWarnings = compileWarnings ? sanitizeFreeText(compileWarnings, MAX_ERROR_CHARS) : null;
  const safeBoardId = sanitizeToken(boardId, MAX_BOARD_ID_CHARS);
  const safeBoardLabel = sanitizeToken(boardLabel, MAX_BOARD_LABEL_CHARS);
  const safeFqbn = sanitizeToken(fqbn, MAX_FQBN_CHARS);

  // Normalise compileStatus to whitelist enum — never forward attacker-shaped status.
  const STATUS_WHITELIST = new Set(['idle', 'compiling', 'success', 'verified-legacy', 'error']);
  const safeStatus = STATUS_WHITELIST.has(compileStatus) ? compileStatus : 'idle';

  // Normalise editorMode.
  const safeMode = editorMode === 'code' ? 'code' : 'blocks';

  // Normalise language enum.
  const safeLanguage = language === 'en' ? 'en' : 'it';

  // Build compilation summary that mirrors src/services/api.js line 877-880 shape.
  const compilation = (safeStatus !== 'idle')
    ? {
        success: safeStatus === 'success' || safeStatus === 'verified-legacy',
        status: safeStatus,
        errors: safeErrors,
        warnings: safeWarnings,
        size: compileSize && typeof compileSize === 'object'
          ? {
              flashUsed: Number(compileSize.flashUsed) || null,
              flashTotal: Number(compileSize.flashTotal) || null,
              pct: Number(compileSize.pct) || null,
            }
          : null,
      }
    : null;

  // Upload result (post arduino-cli + WebUSB chain).
  const upload = lastUpload && typeof lastUpload === 'object'
    ? {
        ok: Boolean(lastUpload.ok),
        message: sanitizeFreeText(lastUpload.message || '', MAX_UPLOAD_MSG_CHARS),
        // No raw timestamp echo — only a relative "secondsAgo" so prompt doesn't
        // leak absolute clocks (less PII surface for school logs).
        secondsAgo: lastUpload.ts ? Math.max(0, Math.round((Date.now() - lastUpload.ts) / 1000)) : null,
      }
    : null;

  return {
    // Marker the Edge Function uses to discriminate compile-home branch
    // vs Lavagna branch (see system-prompt-compile-context.ts).
    surface: 'compile-home',
    language: safeLanguage,
    editorMode: safeMode,
    blockCount: Number.isFinite(blockCount) ? blockCount : 0,
    editorCode: safeCode,
    editorCodeLines: countLines(safeCode),
    compilation,
    upload,
    board: {
      id: safeBoardId,
      label: safeBoardLabel,
      fqbn: safeFqbn,
    },
    // No circuit / pinStates / applicationNarrative — those are simulator-only.
  };
}

/**
 * Quick helper for tests + components: derive a short human-readable
 * context string the welcome message shows ("Blocchi · 4 blocchi · 12 righe ·
 * Nano R4 · OK").
 */
export function describeCompileHomeContextLine(ctx) {
  if (!ctx) return '';
  const parts = [];
  parts.push(ctx.editorMode === 'code' ? 'C++' : 'Blocchi');
  if (ctx.editorMode === 'blocks') {
    parts.push(`${ctx.blockCount || 0} blocchi`);
  }
  parts.push(`${ctx.editorCodeLines || 0} righe`);
  if (ctx.board?.label) parts.push(ctx.board.label);
  if (ctx.compilation?.status) parts.push(ctx.compilation.status);
  return parts.join(' · ');
}

// Export sanitisers for unit tests (do NOT import from production code paths).
export const __test__ = {
  sanitizeFreeText,
  sanitizeToken,
  countLines,
  MAX_CODE_CHARS,
  MAX_ERROR_CHARS,
};

export default buildCompileHomeContext;
