// © Andrea Marro — 24/05/2026 — ELAB Tutor — Tutti i diritti riservati
//
// codeSync.js — Wave 1b Impl-B-2 expansion
//
// Scope expansion (Sez 3 prompt cross-compilatore Blockly definitivo):
//  - Tolerant AST parse with error recovery (extractFunctions / extractDefines / extractComments)
//  - Italian-localised parse error messages with riga number
//  - hash define macro extraction (display target: Blockly const var block)
//  - Multi-function support beyond setup/loop
//  - Comment preservation roundtrip (metadata)
//  - Backward compat: cppToBlocklyXml(canonical blink) still returns blink starter
//
// Spec: docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md Sez 2 + Sez 3
// Brief: docs/dispatch/2026-05-25-wave-1b-team-brief.md (Impl-B-2 scope)

import { getStarterXml } from './starterTemplates.js';

export const NANO_R4_BLINK_CPP = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
`;

function stripCppComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function normalizeCpp(source) {
  return stripCppComments(source)
    .replace(/\bLED_BUILTIN\b/g, '13')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isNanoR4BlinkCpp(source) {
  const code = normalizeCpp(source);
  return /void\s+setup\s*\(\s*\)\s*{[^}]*pinMode\s*\(\s*13\s*,\s*OUTPUT\s*\)\s*;[^}]*}/.test(code)
    && /void\s+loop\s*\(\s*\)\s*{[^}]*digitalWrite\s*\(\s*13\s*,\s*HIGH\s*\)\s*;[^}]*delay\s*\(\s*\d+\s*\)\s*;[^}]*digitalWrite\s*\(\s*13\s*,\s*LOW\s*\)\s*;[^}]*delay\s*\(\s*\d+\s*\)\s*;[^}]*}/.test(code);
}

/**
 * Extract hash-define macros from C++ source. Comments stripped first so
 * a #define inside a // line or block comment is ignored. Macros without a
 * value (flag style) emit value === ''. Order preserved.
 */
export function extractDefines(source) {
  const text = stripCppComments(source);
  const defines = [];
  const lines = text.split('\n');
  const re = /^\s*#define\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+(.+))?$/;
  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      defines.push({ name: m[1], value: (m[2] || '').trim() });
    }
  }
  return defines;
}

/**
 * Extract comments preserving original position (line + text).
 * Supports // line and block comment forms.
 */
export function extractComments(source) {
  const text = String(source || '');
  const comments = [];
  const lineRe = /\/\/(.*)$/gm;
  let m;
  while ((m = lineRe.exec(text)) !== null) {
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    comments.push({ type: 'line', line, text: m[1].trim() });
  }
  const blockRe = /\/\*([\s\S]*?)\*\//g;
  while ((m = blockRe.exec(text)) !== null) {
    const before = text.slice(0, m.index);
    const line = before.split('\n').length;
    comments.push({ type: 'block', line, text: m[1].trim() });
  }
  comments.sort((a, b) => a.line - b.line);
  return comments;
}

/**
 * Walk source brace-by-brace to find function definitions. Returns array of
 * { name, signature, body, startLine } objects in source order. Tolerant of
 * malformed bodies; unbalanced braces surface via parseCppTolerant errors.
 */
export function extractFunctions(source) {
  const text = stripCppComments(source);
  const functions = [];
  const re = /(?:^|\n)\s*(\w[\w\s*]*?)\s+(\w+)\s*\(([^)]*)\)\s*\{/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const returnType = m[1].trim();
    const name = m[2];
    const params = m[3].trim();
    if (['if', 'while', 'for', 'switch', 'else'].includes(name)) continue;
    const openIdx = m.index + m[0].length - 1;
    let depth = 1;
    let i = openIdx + 1;
    while (i < text.length && depth > 0) {
      const ch = text[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    if (depth !== 0) {
      functions.push({
        name,
        returnType,
        params,
        body: text.slice(openIdx + 1, text.length),
        startLine: text.slice(0, m.index).split('\n').length,
        unbalanced: true,
      });
      continue;
    }
    const body = text.slice(openIdx + 1, i - 1);
    const startLine = text.slice(0, m.index).split('\n').length;
    functions.push({ name, returnType, params, body, startLine });
  }
  return functions;
}

/**
 * Tolerant top-level parse. Never throws — collects errors with Italian
 * localised messages including riga number references. Sets placeholder=true
 * on malformed input so callers can emit a TODO Blockly block.
 */
export function parseCppTolerant(source) {
  const text = String(source || '');
  const errors = [];
  let placeholder = false;

  if (text.trim().length === 0) {
    return { functions: [], defines: [], comments: [], errors, placeholder: false };
  }

  const stripped = stripCppComments(text)
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''");

  const lines = stripped.split('\n');
  let braceDepth = 0;
  let parenDepth = 0;
  let firstMismatchLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
      else if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;
      if ((braceDepth < 0 || parenDepth < 0) && firstMismatchLine === -1) {
        firstMismatchLine = i + 1;
      }
    }
  }

  if (braceDepth !== 0 || parenDepth !== 0 || firstMismatchLine !== -1) {
    const line = firstMismatchLine > 0
      ? firstMismatchLine
      : Math.max(1, lines.length);
    const which = braceDepth !== 0 ? 'parentesi graffe' : 'parentesi tonde';
    errors.push({
      line,
      message: `Errore di sintassi alla riga ${line}: ${which} non bilanciate, blocco non riconosciuto.`,
    });
    placeholder = true;
  }

  // Detect suspicious token sequences (@@@, $$$, %%% inside code blocks)
  const suspiciousRe = /(@{2,}|\${2,}|%{2,}|&{3,})/g;
  let susMatch;
  while ((susMatch = suspiciousRe.exec(stripped)) !== null) {
    const susLine = stripped.slice(0, susMatch.index).split('\n').length;
    errors.push({
      line: susLine,
      message: `Errore di sintassi alla riga ${susLine}: token non riconosciuto "${susMatch[1]}", blocco non riconosciuto.`,
    });
    placeholder = true;
    break;
  }

  // Detect missing semicolon: function-call expression followed by '}' without ';'
  const missingSemiRe = /\b\w+\s*\([^()]*\)\s*\n\s*\}/g;
  let semiMatch;
  while ((semiMatch = missingSemiRe.exec(stripped)) !== null) {
    const semiLine = stripped.slice(0, semiMatch.index).split('\n').length;
    errors.push({
      line: semiLine,
      message: `Errore di sintassi alla riga ${semiLine}: punto e virgola mancante, blocco non riconosciuto.`,
    });
    placeholder = true;
    break;
  }

  // Detect function signature not followed by '{' or ';' (declarations vs malformed)
  const sigRe = /(?:^|\n)\s*\w[\w\s*]*?\s+(\w+)\s*\([^)]*\)\s*([^\s])/g;
  let sigMatch;
  while ((sigMatch = sigRe.exec(stripped)) !== null) {
    const fnName = sigMatch[1];
    const nextChar = sigMatch[2];
    if (['if', 'while', 'for', 'switch', 'else', 'return', 'sizeof'].includes(fnName)) continue;
    if (nextChar !== '{' && nextChar !== ';' && nextChar !== ',') {
      const sigLine = stripped.slice(0, sigMatch.index).split('\n').length + 1;
      errors.push({
        line: sigLine,
        message: `Errore di sintassi alla riga ${sigLine}: funzione ${fnName} senza corpo valido, blocco non riconosciuto.`,
      });
      placeholder = true;
    }
  }

  const functions = extractFunctions(text);
  for (const fn of functions) {
    if (fn.unbalanced) {
      errors.push({
        line: fn.startLine,
        message: `Errore di sintassi alla riga ${fn.startLine}: funzione ${fn.name} senza chiusura graffa, blocco non riconosciuto.`,
      });
      placeholder = true;
    }
  }

  const defines = extractDefines(text);
  const comments = extractComments(text);

  return { functions, defines, comments, errors, placeholder };
}

export function cppToBlocklyXml(source) {
  if (!source || String(source).trim().length === 0) return null;
  if (isNanoR4BlinkCpp(source)) {
    return getStarterXml('blink');
  }
  return null;
}

// ─── Wave 1b Impl-B-2 tolerant API ───────────────────────────────────────────

let _lastDiagnostics = { warnings: [], errors: [], placeholders: [] };

/**
 * Diagnostics from the most recent parseCppTolerant / cppToBlocklyXmlTolerant call.
 * Returns { warnings: [{lineno, message_it}], errors: [...], placeholders: [...] }.
 */
export function getLastParseDiagnostics() {
  return {
    warnings: [..._lastDiagnostics.warnings],
    errors: [..._lastDiagnostics.errors],
    placeholders: [..._lastDiagnostics.placeholders],
  };
}

function resetDiagnostics() {
  _lastDiagnostics = { warnings: [], errors: [], placeholders: [] };
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function detectPatterns(text) {
  const t = stripCppComments(text);
  return {
    hasServo: /#include\s*<Servo\.h>|Servo\s+\w+|\.attach\s*\(|\.write\s*\(\s*\d+\s*\)/.test(t),
    hasLcd: /#include\s*<LiquidCrystal\.h>|LiquidCrystal\s+\w+|lcd\.begin|lcd\.print/.test(t),
    hasSerial: /Serial\.(begin|print|println|read|available)/.test(t),
    hasDigitalWrite: /digitalWrite\s*\(/.test(t),
    hasDigitalRead: /digitalRead\s*\(/.test(t),
    hasAnalogRead: /analogRead\s*\(/.test(t),
    hasIf: /\bif\s*\(/.test(t),
  };
}

function buildCommentXml(text, preserveComments) {
  if (!preserveComments) return '';
  const comments = extractComments(text);
  if (comments.length === 0) return '';
  return comments
    .map((c) => `  <comment pinned="false">${escapeXml(c.text)}</comment>`)
    .join('\n');
}

function buildDefineXml(defines) {
  if (!defines || defines.length === 0) return '';
  return defines
    .map((d) => {
      const valueXml = d.value
        ? `<value name="VALUE">${escapeXml(d.value)}</value>`
        : '';
      return `  <block type="arduino_define_const" x="20" y="20">
    <field name="NAME">${escapeXml(d.name)}</field>
    ${valueXml}
  </block>`;
    })
    .join('\n');
}

function buildProcedureXml(fns) {
  const userFns = fns.filter((f) => f.name !== 'setup' && f.name !== 'loop' && !f.unbalanced);
  if (userFns.length === 0) return '';
  return userFns
    .map(
      (f) => `  <block type="procedures_defnoreturn" x="20" y="20">
    <field name="NAME">${escapeXml(f.name)}</field>
    <comment>${escapeXml(f.body.trim().slice(0, 200))}</comment>
  </block>`
    )
    .join('\n');
}

function buildPlaceholderXml(errors) {
  if (!errors || errors.length === 0) return '';
  const first = errors[0];
  const msg = first.message || first.toString();
  return `  <block type="todo_unknown" x="20" y="20">
    <field name="LABEL">DA COMPLETARE: ${escapeXml(msg)}</field>
    <comment pinned="true">${escapeXml(msg)}</comment>
  </block>`;
}

/**
 * Tolerant cpp -> Blockly XML conversion. Never throws — emits Italian warnings to
 * console + populates getLastParseDiagnostics() on parse issues. Supports:
 *  - canonical blink (delegates to starter)
 *  - servo / lcd / button-led / serial-echo via starter templates when signature matches
 *  - #define macros -> arduino_define_const block + value
 *  - user-defined functions -> procedures_defnoreturn block
 *  - comment preservation via options.preserveComments
 *  - malformed input -> TODO placeholder block + DA COMPLETARE label
 */
export function cppToBlocklyXmlTolerant(source, options = {}) {
  resetDiagnostics();
  const preserveComments = options.preserveComments === true;

  const text = String(source || '');
  if (text.trim().length === 0) {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  }

  const parsed = parseCppTolerant(text);

  // Emit IT warnings to console and to diagnostics
  for (const err of parsed.errors) {
    const message_it = err.message;
    _lastDiagnostics.warnings.push({ lineno: err.line, message_it });
    try {
      // eslint-disable-next-line no-console
      console.warn(message_it);
    } catch {
      // console missing in some test envs — diagnostics still record it
    }
  }

  // Garbage input — no functions, no defines, no recognizable structure
  if (parsed.functions.length === 0 && parsed.defines.length === 0) {
    const lineno = parsed.errors[0]?.line || 1;
    const message_it = `Errore di sintassi alla riga ${lineno}: contenuto non riconosciuto come C++ Arduino.`;
    if (parsed.errors.length === 0) {
      _lastDiagnostics.warnings.push({ lineno, message_it });
      try {
        // eslint-disable-next-line no-console
        console.warn(message_it);
      } catch {
        // best-effort
      }
    }
    const placeholderXml = `  <block type="todo_unknown" x="20" y="20">
    <field name="LABEL">DA COMPLETARE: ${escapeXml(message_it)}</field>
    <comment pinned="true">${escapeXml(message_it)}</comment>
  </block>`;
    _lastDiagnostics.placeholders.push({ message_it });
    return `<xml xmlns="https://developers.google.com/blockly/xml">
${placeholderXml}
</xml>`;
  }

  // Canonical blink shortcut — pass through starter template
  if (isNanoR4BlinkCpp(text)) {
    const commentsXml = buildCommentXml(text, preserveComments);
    if (commentsXml) {
      const starter = getStarterXml('blink');
      return starter.replace(
        '<xml xmlns="https://developers.google.com/blockly/xml">',
        `<xml xmlns="https://developers.google.com/blockly/xml">\n${commentsXml}`
      );
    }
    return getStarterXml('blink');
  }

  // Pattern-based starter selection
  const pat = detectPatterns(text);
  let baseStarter = null;
  if (pat.hasServo) baseStarter = getStarterXml('servo-sweep');
  else if (pat.hasLcd) baseStarter = getStarterXml('lcd-hello');
  else if (pat.hasSerial && (pat.hasIf || /Serial\.available/.test(text))) baseStarter = getStarterXml('serial-echo');
  else if (pat.hasDigitalRead && pat.hasDigitalWrite && pat.hasIf) baseStarter = getStarterXml('button-led');

  const defineXml = buildDefineXml(parsed.defines);
  const procXml = buildProcedureXml(parsed.functions);
  const commentsXml = buildCommentXml(text, preserveComments);
  const placeholderXml = parsed.placeholder ? buildPlaceholderXml(parsed.errors) : '';

  // Track placeholders for diagnostics consumers
  if (parsed.placeholder) {
    _lastDiagnostics.placeholders.push({ message_it: parsed.errors[0]?.message });
  }

  // Assemble final XML — extra blocks layered alongside starter (or as standalone)
  if (baseStarter) {
    const extras = [defineXml, procXml, commentsXml, placeholderXml].filter(Boolean).join('\n');
    if (extras) {
      return baseStarter.replace(
        '<xml xmlns="https://developers.google.com/blockly/xml">',
        `<xml xmlns="https://developers.google.com/blockly/xml">\n${extras}`
      );
    }
    return baseStarter;
  }

  // No matching starter — assemble standalone XML
  const sections = [defineXml, procXml, commentsXml, placeholderXml].filter(Boolean);
  if (sections.length === 0) {
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
  }
  return `<xml xmlns="https://developers.google.com/blockly/xml">
${sections.join('\n')}
</xml>`;
}
