/**
 * Iter 95 SP3 T1 — Virtual Serial Monitor C++ Arduino interpreter
 *
 * Lightweight C++ subset parser. Extracts predicted Serial.* output from
 * user sketch WITHOUT compiling or running. Used by VirtualSerialMonitor
 * UI to render predicted serial output when no Nano R4 hardware connected.
 *
 * Andrea iter 94 PM mandate verbatim:
 *   "Si può verificare la seriale prevista. Senza scheda si può fare una
 *    verifica molto utile:
 *      1. compilare il codice per Nano R4;
 *      2. analizzare Serial.begin / Serial.print / Serial.println;
 *      3. mostrare un Monitor Seriale Virtuale;
 *      4. indicare che l'output è previsto/simulato, non letto da hardware."
 *
 * SCOPE (iter 95 SP3 T1):
 *   - parse setup() block + extract sequential Serial.* calls
 *   - parse loop() block + extract sequential Serial.* calls
 *   - Simulate maxIterations=10 loop cycles by default
 *   - Substitute simple literal arguments (string + integer + boolean)
 *   - Detect Serial.begin(baud) for baud rate display
 *   - Identify delay(ms) calls for timestamp annotation
 *
 * EXPLICIT NON-GOALS (iter 96+):
 *   - NOT a real C++ compiler/interpreter
 *   - NO variable substitution beyond simple literals
 *   - NO if/else conditional simulation
 *   - NO function call resolution
 *   - NO sensor/input simulation (analogRead returns variable placeholder)
 *
 * MANDATORY UI disclaimer: "Seriale prevista dal programma. Per leggere la
 * seriale reale collega una Nano R4 via USB." per Andrea iter 94 mandate
 * "non bisogna mai dire 'Seriale reale letta' se la board non è collegata".
 *
 * © Andrea Marro — iter 95 SP3 T1 — 2026-05-19
 */

/**
 * Iter 95 SP3 T1 follow-up fixes (Codex Pattern V + code-reviewer:code-reviewer
 * verdict 2026-05-19): hardcap + comment stripping + falsy-coalesce guard.
 *
 * MAX_ITERATIONS_HARDCAP defends against DoS via large maxIterations option
 * (e.g., 99999 iter × 10 lines/iter = 1M string allocations). LIM displays
 * meaningfully truncate beyond ~200 iterations anyway. Clamps + warning.
 */
const MAX_ITERATIONS_HARDCAP = 200;

/**
 * Strip C/C++ comments before regex matching to prevent false-positive Serial
 * output detection from commented-out lines.
 *
 * CRITICAL fix (code-reviewer:code-reviewer CRITICAL-1 verdict iter 95 SP3 T1
 * follow-up): a docente commenting out `// Serial.println(...)` to disable it
 * MUST NOT cause Monitor Seriale Virtuale to claim the output. Educational
 * trust contract violation (Principio Zero V3) if false-positive output shown.
 *
 * Order matters: strip block comments /*...*\/ FIRST (greedy non-string-aware
 * acceptable for SP3 educational scope; nested block comments not supported
 * by standard C++ either), THEN line comments //...EOL.
 *
 * @param {string} src — raw C++ block content
 * @returns {string} comment-stripped source preserving line structure
 */
function stripComments(src) {
  if (!src) return src;
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

/**
 * Extract block content between matched braces starting after a header pattern.
 * Returns null if header not found OR braces unbalanced.
 *
 * @param {string} code — full C++ source
 * @param {RegExp} headerRegex — matches function signature
 * @returns {string|null} content between braces (exclusive)
 */
function extractBlock(code, headerRegex) {
  const match = code.match(headerRegex);
  if (!match) return null;
  const startIdx = match.index + match[0].length;
  let depth = 1;
  let i = startIdx;
  while (i < code.length && depth > 0) {
    const ch = code[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return code.substring(startIdx, i - 1);
}

/**
 * Parse a single Serial argument and convert to string representation.
 * Returns the literal value OR a placeholder for variables.
 *
 * @param {string} arg — raw argument text (trimmed)
 * @returns {string} display value
 */
function parseSerialArgument(arg) {
  const trimmed = arg.trim();
  if (!trimmed) return '';
  const strMatch = trimmed.match(/^["']([^"']*)["']$/);
  if (strMatch) return strMatch[1];
  if (/^-?\d+$/.test(trimmed)) return trimmed;
  if (/^-?\d+\.\d+$/.test(trimmed)) return trimmed;
  if (trimmed === 'true' || trimmed === 'false') return trimmed;
  return `[${trimmed}]`;
}

/**
 * Extract sequential Serial.* + delay() calls from a code block (order preserved).
 * Joins adjacent Serial.print + Serial.println as single line per Arduino convention.
 *
 * @param {string} block — C++ source between setup() or loop() braces
 * @returns {Array<{type:'line'|'delay', value:string|number}>} ordered actions
 */
function extractSerialAndDelayCalls(block) {
  if (!block) return [];
  // CRITICAL fix (code-reviewer CRITICAL-1): strip comments BEFORE regex match.
  // Without this, `// Serial.println("X")` would falsely emit "X" as setup/loop
  // output → docente comments-out a line to disable but monitor still claims
  // output is generated. Pedagogical trust contract violation Principio Zero.
  const clean = stripComments(block);
  const actions = [];
  const callRegex = /(?:(Serial)\.(print|println)\s*\(([^)]*)\))|(?:delay\s*\(\s*(\d+)\s*\))/g;
  let pendingPrint = '';
  for (const match of clean.matchAll(callRegex)) {
    if (match[1] === 'Serial') {
      const method = match[2];
      const arg = parseSerialArgument(match[3] || '');
      if (method === 'print') {
        pendingPrint += arg;
      } else {
        actions.push({ type: 'line', value: pendingPrint + arg });
        pendingPrint = '';
      }
    } else if (match[4] !== undefined) {
      if (pendingPrint) {
        actions.push({ type: 'line', value: pendingPrint });
        pendingPrint = '';
      }
      actions.push({ type: 'delay', value: parseInt(match[4], 10) });
    }
  }
  if (pendingPrint) actions.push({ type: 'line', value: pendingPrint });
  return actions;
}

/**
 * Interpret C++ Arduino sketch and produce predicted serial output structure.
 *
 * @param {string} code — full C++ source code
 * @param {Object} options
 * @param {number} options.maxIterations — max loop() iterations to simulate (default 10)
 * @returns {{
 *   baudRate: number|null,
 *   setupOutput: string[],
 *   loopOutput: Array<{iteration:number, lines:string[], delaysMs:number[], timestamps:number[]}>,
 *   warnings: string[]
 * }}
 */
export function interpretSerialOutput(code, options = {}) {
  // CRITICAL fix (code-reviewer CRITICAL-2 + HIGH-1): falsy-coalesce bug +
  // missing hardcap. Old `options.maxIterations || 10` treated 0 as 10 (bug:
  // consumer wanting "no loop simulation" gets opposite). Also accepted
  // arbitrary large value (99999 → 1M string allocations memory DoS attack
  // surface). Number.isFinite gate + clamp via Math.min hardcap 200 (LIM
  // display ceiling sensible). Negative + NaN → fallback to default 10.
  const warnings = [];
  const rawMax = Number(options.maxIterations);
  let maxIterations;
  if (Number.isFinite(rawMax) && rawMax >= 0) {
    const clampedMax = Math.min(Math.floor(rawMax), MAX_ITERATIONS_HARDCAP);
    if (clampedMax !== rawMax) {
      warnings.push(`maxIterations clamped to ${clampedMax} (hardcap ${MAX_ITERATIONS_HARDCAP})`);
    }
    maxIterations = clampedMax;
  } else {
    maxIterations = 10;
  }

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return {
      baudRate: null,
      setupOutput: [],
      loopOutput: [],
      warnings: ['empty input'],
    };
  }

  const baudMatch = code.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/);
  const baudRate = baudMatch ? parseInt(baudMatch[1], 10) : null;

  const setupBlock = extractBlock(code, /void\s+setup\s*\(\s*\)\s*\{/);
  if (setupBlock === null) warnings.push('setup() not found');

  const loopBlock = extractBlock(code, /void\s+loop\s*\(\s*\)\s*\{/);
  if (loopBlock === null) warnings.push('loop() not found');

  const setupActions = extractSerialAndDelayCalls(setupBlock);
  const setupOutput = setupActions.filter((a) => a.type === 'line').map((a) => a.value);

  const loopActions = extractSerialAndDelayCalls(loopBlock);
  const hasSerialInLoop = loopActions.some((a) => a.type === 'line');
  const loopOutput = [];
  if (hasSerialInLoop) {
    let cumulativeMs = 0;
    for (let iter = 1; iter <= maxIterations; iter++) {
      const lines = [];
      const delaysMs = [];
      const timestamps = [];
      for (const action of loopActions) {
        if (action.type === 'line') {
          lines.push(action.value);
          timestamps.push(cumulativeMs);
        } else if (action.type === 'delay') {
          delaysMs.push(action.value);
          cumulativeMs += action.value;
        }
      }
      loopOutput.push({ iteration: iter, lines, delaysMs, timestamps });
    }
  }

  return {
    baudRate,
    setupOutput,
    loopOutput,
    warnings,
  };
}

export default interpretSerialOutput;
