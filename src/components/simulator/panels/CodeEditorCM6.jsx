/* Andrea Marro — 12/02/2026 */
/**
 * CodeEditorCM6 — CodeMirror 6 editor for Arduino C++ code
 * Extracted from NewElabSimulator.jsx for modularity.
 *
 * Props:
 *   code: string
 *   onChange: (code: string) => void
 *   onCompile: (code: string) => void
 *   compilationStatus: null | 'compiling' | 'success' | 'error'
 *   compilationErrors: string | null
 *   compilationWarnings: string | null
 *   compilationErrorLine: number | null
 *   compilationSize: { bytes, total, percent } | null
 *   readOnly: boolean
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, Decoration } from '@codemirror/view';
import { EditorState, Compartment, StateEffect, StateField } from '@codemirror/state';
import { cpp } from '@codemirror/lang-cpp';
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching, foldGutter, indentUnit } from '@codemirror/language';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { tags } from '@lezer/highlight';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { createPaletteDropExtension, insertPaletteSnippet } from '../../ide/CodePalette/DragDropHandler';

/* ═══════════════════════════════════════════════════════════════════
   ELAB Palette constants (shared with NES)
   ═══════════════════════════════════════════════════════════════════ */
const NAVY = 'var(--color-primary)';
const LIME = 'var(--color-accent)';
const VOL3_RED = 'var(--color-vol3)';
const DARK_BG = 'var(--color-code-bg, #1a1a2e)';
const DARK_SURFACE = 'var(--color-code-header, #1E2530)';
const BORDER_WARM = 'var(--color-border, #E8E4DB)';
const FONT_BODY = "var(--font-sans, 'Open Sans', sans-serif)";
const FONT_CODE = "var(--font-mono, 'Fira Code', monospace)";

/* ═══════════════════════════════════════════════════════════════════
   Friendly error translator — importato da modulo condiviso
   ═══════════════════════════════════════════════════════════════════ */
import { friendlyError } from '../utils/friendlyError';

/* ═══════════════════════════════════════════════════════════════════
   Arduino Autocompletion List
   ═══════════════════════════════════════════════════════════════════ */
const ARDUINO_KEYWORDS = [
  // Functions
  { label: 'pinMode', type: 'function', info: 'Configures valid pin behavior: INPUT, OUTPUT, INPUT_PULLUP' },
  { label: 'digitalWrite', type: 'function', info: 'Write HIGH or LOW to a digital pin' },
  { label: 'digitalRead', type: 'function', info: 'Read the value from a specified digital pin' },
  { label: 'analogRead', type: 'function', info: 'Reads the value from the specified analog pin' },
  { label: 'analogWrite', type: 'function', info: 'Writes an analog value (PWM wave) to a pin' },
  { label: 'delay', type: 'function', info: 'Pauses the program for the amount of time (in ms)' },
  { label: 'millis', type: 'function', info: 'Returns the number of milliseconds since the board began running' },
  { label: 'micros', type: 'function', info: 'Returns the number of microseconds since the board began running' },
  { label: 'Serial.begin', type: 'function', info: 'Sets the data rate in bits per second (baud) for serial data transmission' },
  { label: 'Serial.print', type: 'function', info: 'Prints data to the serial port as human-readable ASCII text' },
  { label: 'Serial.println', type: 'function', info: 'Prints data to the serial port followed by a carriage return character' },
  { label: 'Serial.available', type: 'function', info: 'Get the number of bytes (characters) available for reading from the serial port' },
  { label: 'Serial.read', type: 'function', info: 'Reads incoming serial data' },
  { label: 'map', type: 'function', info: 'Re-maps a number from one range to another' },
  { label: 'constrain', type: 'function', info: 'Constrains a number to be within a range' },
  { label: 'min', type: 'function', info: 'Calculates the minimum of two numbers' },
  { label: 'max', type: 'function', info: 'Calculates the maximum of two numbers' },
  { label: 'abs', type: 'function', info: 'Calculates the absolute value of a number' },
  { label: 'sq', type: 'function', info: 'Calculates the square of a number' },
  { label: 'sqrt', type: 'function', info: 'Calculates the square root of a number' },
  { label: 'pow', type: 'function', info: 'Calculates the value of a number raised to a power' },
  { label: 'random', type: 'function', info: 'Generates pseudo-random numbers' },
  { label: 'randomSeed', type: 'function', info: 'Initializes the pseudo-random number generator' },
  { label: 'tone', type: 'function', info: 'Generates a square wave of the specified frequency' },
  { label: 'noTone', type: 'function', info: 'Stops the generation of a square wave triggered by tone()' },
  { label: 'pulseIn', type: 'function', info: 'Reads a pulse (either HIGH or LOW) on a pin' },
  { label: 'shiftOut', type: 'function', info: 'Shifts out a byte of data one bit at a time' },
  { label: 'shiftIn', type: 'function', info: 'Shifts in a byte of data one bit at a time' },
  { label: 'attachInterrupt', type: 'function', info: 'Specifies a function to call when an external interrupt occurs' },
  { label: 'detachInterrupt', type: 'function', info: 'Turns off the given interrupt' },
  { label: 'interrupts', type: 'function', info: 'Re-enables interrupts (after they\'ve been disabled by noInterrupts())' },
  { label: 'noInterrupts', type: 'function', info: 'Disables interrupts (you can re-enable them with interrupts())' },

  // Math — Trigonometry & Advanced
  { label: 'sin', type: 'function', info: 'Calculates the sine of an angle (in radians)' },
  { label: 'cos', type: 'function', info: 'Calculates the cosine of an angle (in radians)' },
  { label: 'tan', type: 'function', info: 'Calculates the tangent of an angle (in radians)' },
  { label: 'log', type: 'function', info: 'Calculates the natural logarithm of a number' },
  { label: 'log10', type: 'function', info: 'Calculates the base-10 logarithm of a number' },
  { label: 'ceil', type: 'function', info: 'Rounds a number up to the nearest integer' },
  { label: 'floor', type: 'function', info: 'Rounds a number down to the nearest integer' },
  { label: 'round', type: 'function', info: 'Rounds a number to the nearest integer' },
  { label: 'isnan', type: 'function', info: 'Checks if a value is Not-a-Number (NaN)' },
  { label: 'isinf', type: 'function', info: 'Checks if a value is infinite' },

  // Serial — Advanced
  { label: 'Serial.write', type: 'function', info: 'Writes binary data to the serial port' },
  { label: 'Serial.readString', type: 'function', info: 'Reads characters into a String until timeout' },
  { label: 'Serial.parseInt', type: 'function', info: 'Reads integer from serial buffer' },
  { label: 'Serial.parseFloat', type: 'function', info: 'Reads float from serial buffer' },
  { label: 'Serial.flush', type: 'function', info: 'Waits for outgoing serial data to complete' },
  { label: 'Serial.setTimeout', type: 'function', info: 'Sets the maximum milliseconds to wait for serial data' },

  // String methods
  { label: 'String.length', type: 'function', info: 'Returns the length of the String' },
  { label: 'String.charAt', type: 'function', info: 'Returns the character at index' },
  { label: 'String.indexOf', type: 'function', info: 'Finds the first occurrence of a character or string' },
  { label: 'String.substring', type: 'function', info: 'Returns a substring between two indices' },
  { label: 'String.toInt', type: 'function', info: 'Converts a String to an integer' },
  { label: 'String.toFloat', type: 'function', info: 'Converts a String to a float' },
  { label: 'String.toUpperCase', type: 'function', info: 'Converts a String to upper case' },
  { label: 'String.toLowerCase', type: 'function', info: 'Converts a String to lower case' },

  // Bit manipulation
  { label: 'bitRead', type: 'function', info: 'Reads a bit of a number' },
  { label: 'bitWrite', type: 'function', info: 'Writes a bit of a number' },
  { label: 'bitSet', type: 'function', info: 'Sets (writes a 1 to) a bit of a number' },
  { label: 'bitClear', type: 'function', info: 'Clears (writes a 0 to) a bit of a number' },
  { label: 'bit', type: 'function', info: 'Computes the value of the specified bit (bit 0 is 1, bit 1 is 2, etc.)' },
  { label: 'lowByte', type: 'function', info: 'Extracts the low byte of a word' },
  { label: 'highByte', type: 'function', info: 'Extracts the high byte of a word' },

  // Structure
  { label: 'setup', type: 'function', info: 'Called once when the sketch starts' },
  { label: 'loop', type: 'function', info: 'Loops consecutively, allowing your program to change and respond' },

  // Constants
  { label: 'HIGH', type: 'constant', info: 'Voltage level (5V or 3.3V)' },
  { label: 'LOW', type: 'constant', info: 'Voltage level (0V)' },
  { label: 'INPUT', type: 'constant', info: 'Pin mode: Input' },
  { label: 'OUTPUT', type: 'constant', info: 'Pin mode: Output' },
  { label: 'INPUT_PULLUP', type: 'constant', info: 'Pin mode: Input with internal pullup resistor' },
  { label: 'LED_BUILTIN', type: 'constant', info: 'Pin number of the on-board LED' },
  { label: 'true', type: 'keyword' },
  { label: 'false', type: 'keyword' },

  // Types
  { label: 'void', type: 'keyword' },
  { label: 'boolean', type: 'type' },
  { label: 'char', type: 'type' },
  { label: 'unsigned char', type: 'type' },
  { label: 'byte', type: 'type' },
  { label: 'int', type: 'type' },
  { label: 'unsigned int', type: 'type' },
  { label: 'word', type: 'type' },
  { label: 'long', type: 'type' },
  { label: 'unsigned long', type: 'type' },
  { label: 'short', type: 'type' },
  { label: 'float', type: 'type' },
  { label: 'double', type: 'type' },
  { label: 'string', type: 'type' },
  { label: 'String', type: 'class', info: 'String class for text manipulation' },
  { label: 'array', type: 'type' },

  // Control
  { label: 'if', type: 'keyword' },
  { label: 'else', type: 'keyword' },
  { label: 'for', type: 'keyword' },
  { label: 'switch', type: 'keyword' },
  { label: 'case', type: 'keyword' },
  { label: 'default', type: 'keyword' },
  { label: 'while', type: 'keyword' },
  { label: 'do', type: 'keyword' },
  { label: 'break', type: 'keyword' },
  { label: 'continue', type: 'keyword' },
  { label: 'return', type: 'keyword' },
  { label: 'goto', type: 'keyword' },

  // Syntax
  { label: '#define', type: 'keyword' },
  { label: '#include', type: 'keyword' },
];

const arduinoCompletionSource = completeFromList(ARDUINO_KEYWORDS);

// ── ELAB dark theme for CodeMirror ─────────────────────────────────
const elabDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: DARK_BG,
    color: 'var(--color-code-text, #E5E7EB)',
    fontFamily: FONT_CODE,
    fontSize: '14px',
    height: '100%',
  },
  '.cm-content': {
    caretColor: 'var(--color-code-cursor, #F59E0B)',
    fontFamily: FONT_CODE,
    lineHeight: '1.5',
    padding: '6px 0',
  },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--color-code-cursor, #F59E0B)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(124, 179, 66, 0.25)',
  },
  '.cm-panels': { backgroundColor: DARK_SURFACE, color: 'var(--color-code-text, #E5E7EB)' },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--color-editor-border, #2D3748)' },
  '.cm-panels.cm-panels-bottom': { borderTop: '1px solid var(--color-editor-border, #2D3748)' },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(124, 179, 66, 0.3)',
    outline: '1px solid rgba(124, 179, 66, 0.5)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(124, 179, 66, 0.5)',
  },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.04)' },
  '.cm-selectionMatch': { backgroundColor: 'rgba(124, 179, 66, 0.15)' },
  '&.cm-focused .cm-matchingBracket': {
    backgroundColor: 'rgba(124, 179, 66, 0.3)',
    outline: '1px solid rgba(124, 179, 66, 0.5)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-code-gutter-bg, #151528)',
    color: 'var(--color-code-gutter-text, #555)',
    border: 'none',
    borderRight: '1px solid var(--color-editor-border, #2D3748)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text-gray-200, #9CA3AF)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--color-editor-border, #374151)',
    border: 'none',
    color: 'var(--color-text-gray-200, #9CA3AF)',
  },
  '.cm-tooltip': {
    backgroundColor: DARK_SURFACE,
    border: '1px solid var(--color-editor-border, #374151)',
    color: 'var(--color-code-text, #E5E7EB)',
  },
  '.cm-tooltip .cm-tooltip-arrow:before': { borderTopColor: 'var(--color-editor-border, #374151)' },
  '.cm-tooltip .cm-tooltip-arrow:after': { borderTopColor: DARK_SURFACE },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: 'var(--color-editor-border, #2D3748)',
      color: 'var(--color-code-text, #E5E7EB)',
    },
    '& > ul > li': {
      padding: '4px 8px',
    },
    backgroundColor: DARK_SURFACE,
    border: '1px solid var(--color-editor-border, #4B5563)',
  },
  '.cm-completionInfo': {
    backgroundColor: DARK_BG,
    color: 'var(--color-text-gray-200, #9CA3AF)',
    border: '1px solid var(--color-editor-border, #4B5563)',
    padding: '4px 8px',
    marginTop: '-1px', // Align with tooltip
  },
  '.cm-scroller': { overflow: 'auto' },
}, { dark: true });

// ── ELAB syntax highlighting (Arduino/C++ colors) ──────────────────
const elabHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--color-syntax-keyword, #C792EA)', fontWeight: '600' },
  { tag: tags.controlKeyword, color: 'var(--color-syntax-keyword, #C792EA)', fontWeight: '600' },
  { tag: tags.moduleKeyword, color: 'var(--color-syntax-keyword, #C792EA)', fontWeight: '600' },
  { tag: tags.operatorKeyword, color: 'var(--color-syntax-keyword, #C792EA)' },
  { tag: tags.typeName, color: 'var(--color-syntax-type, #FFCB6B)' },
  { tag: tags.function(tags.variableName), color: 'var(--color-syntax-function, #82AAFF)' },
  { tag: tags.definition(tags.function(tags.variableName)), color: 'var(--color-syntax-function, #82AAFF)', fontWeight: '600' },
  { tag: tags.string, color: 'var(--color-syntax-string, #C3E88D)' },
  { tag: tags.character, color: 'var(--color-syntax-string, #C3E88D)' },
  { tag: tags.comment, color: 'var(--color-syntax-comment, #6B7280)', fontStyle: 'italic' },
  { tag: tags.lineComment, color: 'var(--color-syntax-comment, #6B7280)', fontStyle: 'italic' },
  { tag: tags.blockComment, color: 'var(--color-syntax-comment, #6B7280)', fontStyle: 'italic' },
  { tag: tags.number, color: 'var(--color-syntax-number, #F78C6C)' },
  { tag: tags.integer, color: 'var(--color-syntax-number, #F78C6C)' },
  { tag: tags.float, color: 'var(--color-syntax-number, #F78C6C)' },
  { tag: tags.bool, color: 'var(--color-syntax-number, #F78C6C)' },
  { tag: tags.operator, color: 'var(--color-syntax-operator, #89DDFF)' },
  { tag: tags.punctuation, color: 'var(--color-syntax-operator, #89DDFF)' },
  { tag: tags.bracket, color: 'var(--color-syntax-operator, #89DDFF)' },
  { tag: tags.macroName, color: 'var(--color-syntax-macro, var(--elab-red))', fontWeight: '600' },
  { tag: tags.processingInstruction, color: 'var(--color-syntax-macro, var(--elab-red))', fontWeight: '600' },
  { tag: tags.meta, color: 'var(--color-syntax-macro, var(--elab-red))' },
  { tag: tags.variableName, color: 'var(--color-syntax-variable, #E5E7EB)' },
  { tag: tags.propertyName, color: 'var(--color-syntax-function, #82AAFF)' },
]);

// ── Error line decoration (red background) ─────────────────────────
const setErrorLine = StateEffect.define();
const errorLineField = StateField.define({
  create() { return Decoration.none; },
  update(decorations, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value === null) return Decoration.none;
        const lineNum = e.value;
        if (lineNum < 1 || lineNum > tr.state.doc.lines) return Decoration.none;
        const line = tr.state.doc.line(lineNum);
        return Decoration.set([
          Decoration.line({ class: 'cm-errorLine' }).range(line.from),
        ]);
      }
    }
    return decorations;
  },
  provide: f => EditorView.decorations.from(f),
});

const errorLineTheme = EditorView.baseTheme({
  '.cm-errorLine': {
    backgroundColor: 'rgba(229, 75, 61, 0.2)',
  },
  '.cm-errorLine .cm-gutterElement': {
    color: 'var(--color-vol3, var(--elab-red)) !important',
    fontWeight: '700 !important',
  },
});

const CodeEditorCM6 = React.memo(function CodeEditorCM6({
  code = '',
  onChange,
  onCompile,
  compilationStatus = null,
  compilationErrors = null,
  compilationWarnings = null,
  compilationErrorLine = null,
  compilationSize = null,
  readOnly = false,
  title = 'Editor Codice',
  onExplainCode,
  hideFooter = false,
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const readOnlyComp = useRef(new Compartment());
  const fontSizeComp = useRef(new Compartment());
  const [showErrors, setShowErrors] = useState(false);
  const [fontSize, setFontSize] = useState(13);
  // Track external code to avoid echo loops
  const externalCodeRef = useRef(code);

  // Show/hide error panel when errors change
  useEffect(() => {
    setShowErrors(!!compilationErrors);
  }, [compilationErrors]);

  // ── Initialize CodeMirror ─────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const onUpdate = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        const newCode = update.state.doc.toString();
        externalCodeRef.current = newCode;
        onChange(newCode);
      }
    });

    const startState = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        foldGutter(),
        history(),
        highlightSelectionMatches(),
        indentUnit.of('  '),
        cpp(),
        syntaxHighlighting(elabHighlightStyle),
        elabDarkTheme,
        errorLineField,
        errorLineTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        readOnlyComp.current.of(EditorState.readOnly.of(readOnly)),
        fontSizeComp.current.of(EditorView.theme({ '&': { fontSize: '14px' }, '.cm-content': { fontSize: '14px' } })),
        onUpdate,
        autocompletion({ override: [arduinoCompletionSource] }),
        createPaletteDropExtension(),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ── Palette click-to-insert fallback (tablet/touch) ───────────────
  useEffect(() => {
    function handlePaletteInsert(event) {
      const snippet = event?.detail?.snippet;
      const view = viewRef.current;
      if (!view || typeof snippet !== 'string' || !snippet) return;
      insertPaletteSnippet(view, snippet);
    }

    window.addEventListener('elab:insert-palette-snippet', handlePaletteInsert);
    return () => {
      window.removeEventListener('elab:insert-palette-snippet', handlePaletteInsert);
    };
  }, []);

  // ── Sync external code changes ────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    // Avoid echo: only update if the code changed externally
    if (code === externalCodeRef.current) return;
    externalCodeRef.current = code;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: code },
    });
  }, [code]);

  // ── Sync readOnly ─────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: readOnlyComp.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  // ── Sync font size ──────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: fontSizeComp.current.reconfigure(
        EditorView.theme({ '&': { fontSize: fontSize + 'px' }, '.cm-content': { fontSize: fontSize + 'px' } })
      ),
    });
  }, [fontSize]);

  // ── Sync error line decoration ────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: setErrorLine.of(compilationErrorLine || null),
    });
  }, [compilationErrorLine]);

  // ── Status bar ────────────────────────────────────────────────────
  // Encouraging messages that rotate during compilation
  const [compileMsg, setCompileMsg] = useState(0);
  useEffect(() => {
    if (compilationStatus !== 'compiling') { setCompileMsg(0); return; }
    const msgs = [
      'Compilazione in corso...',
      'Controllo il codice...',
      'Quasi fatto...',
      'Traduco in linguaggio Arduino...',
    ];
    const interval = setInterval(() => setCompileMsg(i => (i + 1) % msgs.length), 3000);
    return () => clearInterval(interval);
  }, [compilationStatus]);

  const COMPILE_MESSAGES = [
    'Compilazione in corso...',
    'Controllo il codice...',
    'Quasi fatto...',
    'Traduco in linguaggio Arduino...',
  ];

  const isSuccess = compilationStatus === 'success' || compilationStatus === 'success-local';
  const statusColor =
    isSuccess ? LIME
      : compilationStatus === 'error' ? VOL3_RED
        : compilationStatus === 'compiling' ? 'var(--color-vol2)'
          : 'var(--color-text-gray-300)';

  const localIndicator = compilationStatus === 'success-local' ? ' \u26a1' : '';
  const statusText =
    isSuccess
      ? (compilationSize
        ? `\u2705${localIndicator} ${compilationSize.bytes}/${compilationSize.total} bytes (${compilationSize.percent}%)`
        : `Compilazione OK${localIndicator} \u2014 Premi Play`)
      : compilationStatus === 'error' ? 'Errore di compilazione'
        : compilationStatus === 'compiling' ? COMPILE_MESSAGES[compileMsg]
          : 'Pronto';

  return (
    <div style={codeEditorStyles.root}>
      {/* Header */}
      <div style={codeEditorStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1-5)' }}>
          <span style={codeEditorStyles.title}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
            <button
              onClick={() => setFontSize(s => Math.max(9, s - 1))}
              style={codeEditorStyles.fontSizeBtn}
              title="Rimpicciolisci testo"
            >A-</button>
            <span style={{ fontSize: 14, color: 'var(--color-text-gray-300, #737373)', fontFamily: FONT_CODE, minWidth: 18, textAlign: 'center' }}>{fontSize}</span>
            <button
              onClick={() => setFontSize(s => Math.min(22, s + 1))}
              style={codeEditorStyles.fontSizeBtn}
              title="Ingrandisci testo"
            >A+</button>
          </div>
          {onExplainCode && !readOnly && (
            <button
              onClick={() => onExplainCode(code)}
              style={{
                ...codeEditorStyles.fontSizeBtn,
                marginLeft: 6,
                fontSize: 14,
                padding: '4px 12px',
                color: 'var(--color-accent, var(--elab-lime))',
                borderColor: 'var(--color-accent, var(--elab-lime))',
              }}
              title="Chiedi a UNLIM di spiegare il codice"
              aria-label="Spiega il codice"
            >? Spiega</button>
          )}
        </div>
        <span role="status" aria-live="polite" style={{ ...codeEditorStyles.status, color: statusColor }}>
          {compilationStatus === 'compiling' && (
            <span style={{ marginRight: 4, animation: 'spin 1s linear infinite', display: 'inline-block' }} aria-hidden="true">&#x2699;</span>
          )}
          {statusText}
        </span>
      </div>

      {/* CodeMirror container */}
      <div ref={containerRef} style={codeEditorStyles.editorWrap} />

      {/* Warning panel (yellow) */}
      {compilationWarnings && (
        <div role="status" aria-live="polite" style={{ ...codeEditorStyles.errorPanel, borderTop: '2px solid var(--color-warning-panel-border, #F1C40F)', background: 'var(--color-warning-panel-bg, #1a1a0a)' }}>
          <div style={codeEditorStyles.errorHeader}>
            <span style={{ color: 'var(--color-warning-panel-text, #F1C40F)', fontWeight: 700, fontSize: 14 }}>
              &#x26A0; Avvisi
            </span>
          </div>
          <pre style={{ ...codeEditorStyles.errorText, color: 'var(--color-warning-panel-text, #F1C40F)' }}>
            {friendlyError(compilationWarnings)}
          </pre>
        </div>
      )}

      {/* Error panel (red) */}
      {showErrors && compilationErrors && (
        <div role="alert" aria-live="assertive" style={codeEditorStyles.errorPanel}>
          <div style={codeEditorStyles.errorHeader}>
            <span style={{ color: VOL3_RED, fontWeight: 700, fontSize: 14 }}>
              &#x274C; Errori di compilazione
            </span>
            <button
              onClick={() => setShowErrors(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-gray-300, #737373)', cursor: 'pointer', fontSize: 16, padding: 0, minWidth: 56, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)' }}
              title="Chiudi errori"
              aria-label="Chiudi pannello errori"
            >
              &#x2715;
            </button>
          </div>
          <pre style={codeEditorStyles.errorText}>
            {friendlyError(compilationErrors)}
          </pre>
        </div>
      )}

      {!hideFooter && (
        <div style={codeEditorStyles.footer}>
          <button
            onClick={() => onCompile && onCompile(viewRef.current ? viewRef.current.state.doc.toString() : code)}
            disabled={compilationStatus === 'compiling'}
            style={{
              ...codeEditorStyles.compileBtn,
              opacity: compilationStatus === 'compiling' ? 0.5 : 1,
            }}
          >
            {compilationStatus === 'compiling'
              ? <><span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>{'\u25CB'}</span> Compilazione...</>
              : '\u25B6 Compila & Carica'}
          </button>
        </div>
      )}
    </div>
  );
});

const codeEditorStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--color-code-bg, #1a1a2e)',
    borderLeft: `1px solid ${BORDER_WARM}`,
    fontFamily: FONT_CODE,
    fontSize: 14,
    color: 'var(--color-code-text, #CDD6F4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 10px',
    borderBottom: '1px solid var(--color-editor-border, #2D3748)',
    background: 'var(--color-code-header, #181825)',
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-gray-200, #737373)',
    fontFamily: FONT_BODY,
  },
  status: {
    fontSize: 14,
    fontFamily: FONT_CODE,
  },
  fontSizeBtn: {
    background: 'transparent',
    border: '1px solid var(--color-editor-border, #2D3748)',
    borderRadius: 3,
    color: 'var(--color-text-gray-200, #737373)',
    fontSize: 14,
    padding: '1px 6px',
    cursor: 'pointer',
    fontFamily: FONT_CODE,
    lineHeight: 1,
    minWidth: 56,
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  footer: {
    padding: '6px 10px',
    borderTop: '1px solid var(--color-editor-border, #2D3748)',
    background: 'var(--color-code-header, #181825)',
  },
  compileBtn: {
    width: '100%',
    padding: '6px 0',
    border: 'none',
    borderRadius: 4,
    background: 'var(--color-accent, var(--elab-lime))',
    color: 'var(--color-text-inverse, #fff)',
    fontFamily: FONT_BODY,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    minHeight: 56,
  },
  errorPanel: {
    maxHeight: 120,
    overflow: 'auto',
    borderTop: `2px solid ${VOL3_RED}`,
    background: 'var(--color-error-bg, #1a0a0a)',
  },
  errorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 10px',
    background: 'var(--color-error-header-bg, rgba(229, 75, 61, 0.12))',
  },
  errorText: {
    margin: 0,
    padding: '6px 10px',
    fontSize: 14,
    lineHeight: '1.4',
    color: 'var(--color-error-text, #F8A0A0)',
    fontFamily: FONT_CODE,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
};

export default CodeEditorCM6;
