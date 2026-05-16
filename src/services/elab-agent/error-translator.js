/**
 * src/services/elab-agent/error-translator.js
 *
 * Iter 71 TEAM C PART 2 — Error translator arduino-cli stderr.
 * Andrea mandate iter 71 PM 2026-05-16 (PART 2 ~3h).
 *
 * Scope:
 *   - translateArduinoCliError(stderr, exitCode) → { category, docenteFriendlyMessage, technicalDetail, suggestedFix }
 *   - 7 canonical categories (verbatim iter 63 spec ELAB-COMPILE-UPLOAD-AGENT.md §3.3):
 *       1. arduino_cli_absent
 *       2. core_missing
 *       3. board_missing
 *       4. port_missing
 *       5. compile_failed
 *       6. upload_failed
 *       7. permission_denied
 *   - + fallback "unknown" category
 *
 * PRINCIPIO ZERO: tutti messaggi plurale "Ragazzi, ..." docente-friendly.
 * Linguaggio NO gergo tecnico (driver/firmware/bootloader spiegati semplici).
 * MORFISMO Sense 2: messaggi citano kit ELAB fisico (cavo USB, Nano R4,
 * doppio-click reset) — NON simulatore.
 *
 * compile_failed: extract first error line + line number + specific hint
 * pattern matching su 4 errori frequenti C++:
 *   - semicolon: "expected ';' before ..."
 *   - scope: "... was not declared in this scope"
 *   - brace: "expected '}' at end of input" / unmatched braces
 *   - no-matching-function: "no matching function for call to ..."
 *
 * Anti-debito:
 *   - Pure function (NO side effects, idempotent)
 *   - stderr truncation 8KB safe (LLM payload limit)
 *   - Defensive: stderr null/undefined → unknown fallback
 *   - Defensive: exitCode 0 + empty stderr → unknown (anomalia chiamante)
 */

const MAX_STDERR_LENGTH = 8 * 1024; // 8KB safe LLM payload

// ============================================================================
// 7 canonical categories + unknown fallback
// ============================================================================

const CATEGORIES = Object.freeze({
  ARDUINO_CLI_ABSENT: 'arduino_cli_absent',
  CORE_MISSING: 'core_missing',
  BOARD_MISSING: 'board_missing',
  PORT_MISSING: 'port_missing',
  COMPILE_FAILED: 'compile_failed',
  UPLOAD_FAILED: 'upload_failed',
  PERMISSION_DENIED: 'permission_denied',
  UNKNOWN: 'unknown',
});

export { CATEGORIES };

// ============================================================================
// Docente-friendly message templates (PLURALE "Ragazzi," + kit fisico)
// ============================================================================

const TEMPLATES = {
  [CATEGORIES.ARDUINO_CLI_ABSENT]: {
    docenteFriendlyMessage:
      'Ragazzi, il programma Arduino CLI non e\' installato sul computer. ' +
      'Senza questo programma non possiamo compilare e caricare i nostri sketch sulla scheda Nano R4. ' +
      'Chiediamo all\'insegnante di installarlo dal sito ufficiale arduino.cc.',
    suggestedFix:
      'Aprite il Terminale (o Prompt comandi su Windows) e installate Arduino CLI ' +
      'seguendo la guida https://arduino.github.io/arduino-cli/latest/installation/',
  },

  [CATEGORIES.CORE_MISSING]: {
    docenteFriendlyMessage:
      'Ragazzi, manca il "core" Renesas per la scheda Nano R4. ' +
      'Il core e\' come il dizionario che Arduino usa per parlare con la nostra scheda. ' +
      'Senza non possiamo compilare il codice per il Nano R4.',
    suggestedFix:
      'Nel Terminale digitate: arduino-cli core install arduino:renesas_uno ' +
      '(scarica il dizionario per la Nano R4, dura un paio di minuti)',
  },

  [CATEGORIES.BOARD_MISSING]: {
    docenteFriendlyMessage:
      'Ragazzi, la scheda Nano R4 non viene riconosciuta dal computer. ' +
      'Controllate sul vostro kit ELAB che il cavo USB-C sia inserito bene sia nella scheda sia nel computer.',
    suggestedFix:
      'Scollegate il cavo USB, aspettate 3 secondi, ricollegatelo. ' +
      'Verificate che la scheda mostri la scritta "Nano R4" e il logo Arduino.',
  },

  [CATEGORIES.PORT_MISSING]: {
    docenteFriendlyMessage:
      'Ragazzi, non riesco a trovare la porta USB della Nano R4. ' +
      'Quando attacchiamo la scheda al computer, il computer le assegna un nome (tipo COM3 su Windows o /dev/cu.usbmodem su Mac). ' +
      'In questo momento non lo trova.',
    suggestedFix:
      'Sulla Nano R4 fate doppio-click veloce sul pulsantino di reset (vicino al connettore USB-C). ' +
      'Vedrete il LED arancione lampeggiare: la scheda e\' in modalita\' caricamento. ' +
      'Riprovate il caricamento entro 8 secondi.',
  },

  [CATEGORIES.COMPILE_FAILED]: {
    docenteFriendlyMessage:
      'Ragazzi, il nostro codice contiene un errore di scrittura: il compilatore non riesce a tradurlo per la scheda. ' +
      'Niente paura, capita a tutti! Leggiamo insieme dove sta il problema e correggiamolo.',
    suggestedFix:
      'Controllate la riga indicata: spesso manca un punto e virgola (;) a fine riga, ' +
      'oppure una parentesi graffa {} aperta o chiusa nel posto sbagliato.',
  },

  [CATEGORIES.UPLOAD_FAILED]: {
    docenteFriendlyMessage:
      'Ragazzi, il programma e\' stato compilato bene ma non riesco a caricarlo sulla scheda Nano R4. ' +
      'Forse la scheda non e\' pronta a ricevere il codice in questo momento.',
    suggestedFix:
      'Sulla Nano R4 fate doppio-click veloce sul pulsantino di reset. ' +
      'Il LED arancione deve lampeggiare lentamente: vuol dire che la scheda aspetta il nostro codice. ' +
      'Riprovate il caricamento subito dopo.',
  },

  [CATEGORIES.PERMISSION_DENIED]: {
    docenteFriendlyMessage:
      'Ragazzi, il computer ci dice che non abbiamo il permesso di parlare con la scheda Nano R4. ' +
      'Su Linux capita la prima volta che usiamo Arduino: il sistema vuole essere sicuro che siamo autorizzati.',
    suggestedFix:
      'Su Linux aprite il Terminale e digitate: sudo usermod -a -G dialout $USER ' +
      'poi fate logout e login (il computer impara che potete usare la porta USB).',
  },

  [CATEGORIES.UNKNOWN]: {
    docenteFriendlyMessage:
      'Ragazzi, c\'e\' stato un piccolo intoppo che non avevo previsto. ' +
      'Riproviamo: spesso il problema si risolve da solo!',
    suggestedFix:
      'Provate a scollegare e ricollegare il cavo USB della Nano R4, ' +
      'poi riprovate. Se l\'errore ripete, segnalatelo al supporto ELAB.',
  },
};

// ============================================================================
// stderr categorization patterns (regex word-boundary safe)
// ============================================================================

// Pattern detection: prima category match wins. Ordine importante.
// arduino_cli_absent: ENOENT spawn fail (non testabile da stderr puro)
const PATTERNS_BY_CATEGORY = [
  {
    category: CATEGORIES.ARDUINO_CLI_ABSENT,
    // arduino-cli ENOENT spawn — usually wrapper detects, ma fallback su stderr
    patterns: [
      /command not found.*arduino-cli/i,
      /arduino-cli.*no such file/i,
      /'arduino-cli' is not recognized/i,
    ],
  },
  {
    category: CATEGORIES.CORE_MISSING,
    patterns: [
      /platform.*not (?:installed|found)/i,
      /core.*not installed/i,
      /platform missing/i,
      /unknown platform/i,
      /no installed platform matches/i,
      // arduino-cli specific: "Error during build: Error resolving FQBN: ... unknown platform"
      /unknown package.*arduino/i,
    ],
  },
  {
    category: CATEGORIES.BOARD_MISSING,
    patterns: [
      /board.*not found/i,
      /invalid fqbn/i,
      /board not found in installed platform/i,
      // arduino-cli: "no board ID 'nanor4' found"
      /no board id.*found/i,
    ],
  },
  {
    category: CATEGORIES.PORT_MISSING,
    patterns: [
      /no port.*found/i,
      /port.*not found/i,
      /serial port.*not available/i,
      /no serial port/i,
      /no upload port provided/i,
      /no devices found/i,
      // dfu-util Nano R4 specific
      /no dfu capable usb device available/i,
      /cannot open dfu device/i,
    ],
  },
  {
    category: CATEGORIES.PERMISSION_DENIED,
    patterns: [
      /permission denied/i,
      /access denied/i,
      /cannot access/i,
      /operation not permitted/i,
      /eacces/i,
    ],
// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
  },
  {
    category: CATEGORIES.UPLOAD_FAILED,
    patterns: [
      /upload.*failed/i,
      /failed uploading/i,
      /error during upload/i,
      /avrdude.*verification error/i,
      /dfu-util.*error/i,
      /bootloader.*not responding/i,
      /could not (?:upload|flash|write to device)/i,
    ],
  },
  {
    category: CATEGORIES.COMPILE_FAILED,
    patterns: [
      /compilation error/i,
      /error during build/i,
      /\berror:/i, // gcc/g++ canonical error prefix
      /expected ['"][;{},)]['"]/i,
      /was not declared in this scope/i,
      /no matching function for call/i,
      /undefined reference to/i,
      /'\w+'\s*(?:does not name a type|undeclared)/i,
    ],
  },
];

// ============================================================================
// compile_failed sub-hint extraction (semicolon / scope / brace / no-match)
// ============================================================================

/**
 * Extract first error line + line number + specific hint from compile_failed stderr.
 * @param {string} stderr
 * @returns {{ errorLine: string|null, lineNumber: number|null, specificHint: string|null }}
 */
function extractCompileFailedDetails(stderr) {
  const lines = stderr.split('\n');
  let errorLine = null;
  let lineNumber = null;
  let specificHint = null;

  // Find first line matching gcc/g++ "path:line:col: error: ..." pattern
  for (const line of lines) {
    const match = line.match(/[^:]+:(\d+):(?:\d+:)?\s*error:\s*(.+)/i);
    if (match) {
      lineNumber = parseInt(match[1], 10);
      errorLine = match[2].trim();
      break;
    }
  }

  if (!errorLine) {
    // Fallback: first line containing "error:"
    for (const line of lines) {
      const idx = line.toLowerCase().indexOf('error:');
      if (idx >= 0) {
        errorLine = line.slice(idx + 6).trim();
        break;
      }
    }
  }

  // Sub-hint pattern matching
  if (errorLine) {
    const lower = errorLine.toLowerCase();
    if (lower.includes("expected ';'") || lower.includes('expected ";"')) {
      specificHint =
        'Manca un punto e virgola (;) a fine riga. ' +
        'In C++ ogni istruzione finisce con ;';
    } else if (lower.includes('was not declared in this scope')) {
      const nameMatch = errorLine.match(/'([^']+)'\s+was not declared/);
      const name = nameMatch ? nameMatch[1] : 'la variabile';
      specificHint =
        `Il compilatore non conosce "${name}". ` +
        'Forse l\'avete scritta male (maiuscole/minuscole contano!) ' +
        'o l\'avete dichiarata DOPO il punto in cui la usate.';
    } else if (
      lower.includes("expected '}'") ||
      lower.includes('expected "}"') ||
      lower.includes("expected '{'") ||
      lower.includes('expected "{"')
    ) {
      specificHint =
        'Manca una parentesi graffa { o }. ' +
        'Ogni { aperta deve avere una } che la chiude. ' +
        'Controllate setup() e loop().';
    } else if (lower.includes('no matching function for call')) {
      specificHint =
        'State chiamando una funzione con argomenti sbagliati. ' +
        'Es. digitalWrite vuole 2 argomenti (pin + HIGH/LOW), non 1 o 3.';
    } else if (lower.includes('undefined reference')) {
      specificHint =
        'State usando una funzione di una libreria che non avete incluso. ' +
        'Es. Servo richiede #include <Servo.h>';
    }
  }

  return { errorLine, lineNumber, specificHint };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Categorize stderr arduino-cli + build docente-friendly response.
 *
 * @param {string|null|undefined} stderr - arduino-cli stderr output
 * @param {number|null|undefined} [exitCode] - arduino-cli exit code (0 = success)
 * @param {object} [opts]
 * @param {string} [opts.operation] - 'compile' | 'upload' (hint per disambiguare permission/port)
 * @returns {{
 *   category: string,
 *   docenteFriendlyMessage: string,
 *   technicalDetail: string,
 *   suggestedFix: string,
 *   errorLine?: string,
 *   lineNumber?: number,
 *   specificHint?: string,
 * }}
 */
export function translateArduinoCliError(stderr, exitCode, opts = {}) {
  const { operation } = opts;

  // Defensive: stderr null/undefined/empty + exitCode 0 → unknown (chiamante anomalo)
  const stderrStr = typeof stderr === 'string' ? stderr : '';
  const trimmedStderr = stderrStr.trim();

  if (!trimmedStderr && (exitCode === 0 || exitCode === null || exitCode === undefined)) {
    return buildResponse(CATEGORIES.UNKNOWN, '(no stderr, no exit code)');
  }

  // Truncate stderr for safe LLM/log payload (8KB)
  const truncatedStderr =
    stderrStr.length > MAX_STDERR_LENGTH
      ? stderrStr.slice(0, MAX_STDERR_LENGTH) + '\n... (truncated)'
      : stderrStr;

  // Find first matching category (order matters: arduino_cli_absent → ... → compile_failed)
  let matchedCategory = null;
  for (const { category, patterns } of PATTERNS_BY_CATEGORY) {
    if (patterns.some((rgx) => rgx.test(stderrStr))) {
      matchedCategory = category;
      break;
    }
  }

  // Operation hint disambiguation: permission_denied during upload → upload_failed wrapped
  // (keep permission_denied if explicit, but suggest reset for upload context)
  if (!matchedCategory) {
    matchedCategory = CATEGORIES.UNKNOWN;
  }

  // compile_failed: extract sub-details
  if (matchedCategory === CATEGORIES.COMPILE_FAILED) {
    const details = extractCompileFailedDetails(stderrStr);
    return buildResponse(matchedCategory, truncatedStderr, details);
  }

  // Operation-aware refinement: if upload context + generic error → upload_failed
  if (operation === 'upload' && matchedCategory === CATEGORIES.UNKNOWN && exitCode !== 0) {
    matchedCategory = CATEGORIES.UPLOAD_FAILED;
  }

  return buildResponse(matchedCategory, truncatedStderr);
}

/**
 * Build canonical response object from category + technical detail.
 */
function buildResponse(category, technicalDetail, extras = {}) {
  const template = TEMPLATES[category] || TEMPLATES[CATEGORIES.UNKNOWN];
  const response = {
    category,
    docenteFriendlyMessage: template.docenteFriendlyMessage,
    technicalDetail: technicalDetail || '(empty)',
    suggestedFix: template.suggestedFix,
  };

  // compile_failed extras: errorLine + lineNumber + specificHint
  if (extras.errorLine !== undefined) {
    response.errorLine = extras.errorLine;
  }
  if (extras.lineNumber !== undefined && extras.lineNumber !== null) {
    response.lineNumber = extras.lineNumber;
  }
  if (extras.specificHint !== undefined && extras.specificHint !== null) {
    response.specificHint = extras.specificHint;
  }

  return response;
}

/**
 * Convenience: detect ENOENT / spawn error → arduino_cli_absent BEFORE stderr available.
 * Use in server.js handleCompile/handleUpload catch block.
 *
 * @param {Error|object} err - thrown error from runArduinoCli
// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
 * @returns {object} canonical translator response
 */
export function translateSpawnError(err) {
  if (err && (err.category === 'arduino_cli_absent' || (err.code === 'ENOENT'))) {
    return buildResponse(CATEGORIES.ARDUINO_CLI_ABSENT, err.message || err.detail || 'ENOENT');
  }
  return buildResponse(CATEGORIES.UNKNOWN, (err && err.message) || String(err));
}
