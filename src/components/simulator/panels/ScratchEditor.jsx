import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as Blockly from 'blockly';
import { arduinoGenerator, generateArduinoCode } from './scratchGenerator';
import logger from '../../../utils/logger';
import './scratchBlocks';
import { applyItalianMessages } from '../../../i18n/blockly-msg-it';
import ScratchOnboarding from './ScratchOnboarding';
import ScratchToolbar from './ScratchToolbar';
import ScratchErrorOverlay from './ScratchErrorOverlay';

// iter X.2 Wave 1 Impl-A: apply 15 IT Blockly.Msg overrides at module load
// (BEFORE any Blockly.inject call). Idempotent — safe across hot reloads.
applyItalianMessages(Blockly);
// iter 82 PHASE 5.5 fix CRITICAL-2: elab-blockly-theme.css NOT imported.
// Both Codex Pattern V + code-reviewer found conflict with existing dark
// inline ELAB_BLOCKLY_CSS (lines 193-331) — both !important on same selectors,
// would cause Navy-on-dark contrast regression (~2:1 vs WCAG 4.5:1 target).
// File preserved for iter 83+ refactor atom: consolidate into single theme
// path OR scope to .blockly-light-mode parent class. Block name audit also
// needed (see Codex MED-1+MED-2). NOT functional without integration.

// ─── Blockly 12.4.1 safe-disposal patch ─────────────────────────────────
// Blockly 12.4.1 has an InsertionMarkerPreviewer bug: workspace.dispose()
// crashes in removeTypedBlock (undefined type map) and removeTopBlock
// (throws on missing block). Fixed via postinstall patch in
// scripts/patch-blockly.js — guards both methods at source level.
// workspace.dispose() is now safe to call.
// ─────────────────────────────────────────────────────────────────────────

// ─── ELAB Custom Theme ───────────────────────────────────────
// Palette: Navy #1E4D8C, Lime #4A7A25, Bg #1E2530, Grid #2a3040
const ELAB_THEME = Blockly.Theme.defineTheme('elab', {
    name: 'elab',
    base: Blockly.Themes.Classic,
    blockStyles: {
        // ELAB palette: Navy=control, Lime=digital I/O, Orange=analog, Red=comms
        logic_blocks:    { colourPrimary: '#1E4D8C', colourSecondary: '#163B6E', colourTertiary: '#0F2A50' },
        loop_blocks:     { colourPrimary: '#2e7d50', colourSecondary: '#246840', colourTertiary: '#1a5330' }, // palette
        math_blocks:     { colourPrimary: '#3a8a9e', colourSecondary: '#2e7688', colourTertiary: '#226272' }, // palette
        text_blocks:     { colourPrimary: '#5a8dbe', colourSecondary: '#4a7aa8', colourTertiary: '#3a6892' }, // palette
        colour_blocks:   { colourPrimary: '#9e5ac0', colourSecondary: '#8848a8', colourTertiary: '#723890' }, // palette
        variable_blocks: { colourPrimary: '#F5A623', colourSecondary: '#D08018', colourTertiary: '#B86C14' },
        list_blocks:     { colourPrimary: '#E54B3D', colourSecondary: '#CC3A30', colourTertiary: '#B32A22' },
        // Arduino ELAB categories — Lime for digital, Orange for analog, Red for comms
        arduino_io:      { colourPrimary: '#4A7A25', colourSecondary: '#3D6820', colourTertiary: '#30561A' },
        arduino_sound:   { colourPrimary: '#9e5ac0', colourSecondary: '#8848a8', colourTertiary: '#723890' }, // palette
        arduino_servo:   { colourPrimary: '#0ea87b', colourSecondary: '#0c9068', colourTertiary: '#0a7855' }, // palette
        arduino_time:    { colourPrimary: '#F5A623', colourSecondary: '#D08018', colourTertiary: '#B86C14' },
        arduino_serial:  { colourPrimary: '#E54B3D', colourSecondary: '#CC3A30', colourTertiary: '#B32A22' },
        arduino_lcd:     { colourPrimary: '#6e4ca8', colourSecondary: '#5e3e92', colourTertiary: '#4e307c' }, // palette
        // ELAB high-level blocks
        arduino_elab:    { colourPrimary: '#1E4D8C', colourSecondary: '#163B6E', colourTertiary: '#0F2A50' },
    },
    categoryStyles: {
        logic_category:    { colour: '#1E4D8C' },
        loop_category:     { colour: '#2e7d50' }, // palette
        math_category:     { colour: '#3a8a9e' }, // palette
        text_category:     { colour: '#5a8dbe' }, // palette
        variable_category: { colour: '#F5A623' },
        arduino_io_cat:    { colour: '#4A7A25' },
        arduino_sound_cat: { colour: '#9e5ac0' }, // palette
        arduino_servo_cat: { colour: '#0ea87b' }, // palette
        arduino_time_cat:  { colour: '#F5A623' },
        arduino_serial_cat:{ colour: '#E54B3D' },
        arduino_lcd_cat:   { colour: '#6e4ca8' }, // palette
        arduino_elab_cat:  { colour: '#1E4D8C' },
    },
    componentStyles: {
        workspaceBackgroundColour: '#1e2530', // palette
        toolboxBackgroundColour: '#161b22', // palette
        toolboxForegroundColour: '#c9d1d9', // palette
        flyoutBackgroundColour: '#21262d', // palette
        flyoutForegroundColour: '#c9d1d9', // palette
        flyoutOpacity: 0.95,
        scrollbarColour: '#3a4050', // palette
        scrollbarOpacity: 0.6,
        insertionMarkerColour: '#4A7A25',
        insertionMarkerOpacity: 0.4,
        cursorColour: '#4A7A25',
    },
    fontStyle: {
        family: "'Open Sans', 'Helvetica Neue', sans-serif",
        weight: '600',
        size: 12,
    },
    startHats: true,
});

// ─── Toolbox XML (ELAB palette colours) ──────────────────────
const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="Decisioni" categorystyle="logic_category">
    <label text="Se succede qualcosa, fai qualcos'altro" web-class="toolboxLabel"></label>
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
  </category>
  <category name="Ripeti" categorystyle="loop_category">
    <label text="Ripeti le azioni piu volte" web-class="toolboxLabel"></label>
    <block type="controls_repeat_ext">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="controls_flow_statements"></block>
  </category>
  <category name="Numeri" categorystyle="math_category">
    <label text="Calcoli e numeri" web-class="toolboxLabel"></label>
    <block type="math_number"><field name="NUM">0</field></block>
    <block type="math_arithmetic">
      <value name="A"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="B"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="arduino_map">
      <value name="FROM_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="FROM_HIGH"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
      <value name="TO_LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="TO_HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
    </block>
    <block type="arduino_random">
      <value name="MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="MAX"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
    </block>
    <block type="math_modulo">
      <value name="DIVIDEND"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="DIVISOR"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
    </block>
    <block type="math_constrain">
      <value name="VALUE"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
      <value name="LOW"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
      <value name="HIGH"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
    </block>
  </category>
  <category name="Variabili" categorystyle="variable_category">
    <label text="Salva e usa valori" web-class="toolboxLabel"></label>
    <block type="arduino_variable_set">
      <value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    </block>
    <block type="arduino_variable_get"></block>
  </category>
  <category name="Testo" categorystyle="text_category">
    <block type="text"></block>
    <block type="text_join"></block>
  </category>
  <sep gap="16"></sep>
  <category name="Accendi e Spegni" categorystyle="arduino_io_cat">
    <label text="Controlla i pin di Arduino" web-class="toolboxLabel"></label>
    <block type="arduino_pin_mode"></block>
    <block type="arduino_digital_write"></block>
    <block type="arduino_digital_read"></block>
    <block type="arduino_analog_write"></block>
    <block type="arduino_analog_read"></block>
  </category>
  <category name="Suoni" categorystyle="arduino_sound_cat">
    <label text="Fai suonare il buzzer" web-class="toolboxLabel"></label>
    <block type="arduino_tone">
      <value name="FREQ"><shadow type="math_number"><field name="NUM">440</field></shadow></value>
    </block>
    <block type="arduino_no_tone"></block>
  </category>
  <category name="Motore Servo" categorystyle="arduino_servo_cat">
    <label text="Controlla un motore servo" web-class="toolboxLabel"></label>
    <block type="arduino_servo_attach"></block>
    <block type="arduino_servo_write">
      <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
    </block>
    <block type="arduino_servo_read"></block>
  </category>
  <category name="Schermo LCD" categorystyle="arduino_lcd_cat">
    <label text="Scrivi messaggi sul display" web-class="toolboxLabel"></label>
    <block type="arduino_lcd_init"></block>
    <block type="arduino_lcd_print">
      <value name="TEXT"><shadow type="text"><field name="TEXT">Ciao!</field></shadow></value>
    </block>
    <block type="arduino_lcd_set_cursor"></block>
    <block type="arduino_lcd_clear"></block>
  </category>
  <category name="Tempo" categorystyle="arduino_time_cat">
    <label text="Aspetta e misura il tempo" web-class="toolboxLabel"></label>
    <block type="arduino_delay">
      <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
    </block>
    <block type="arduino_millis"></block>
  </category>
  <category name="Comunicazione" categorystyle="arduino_serial_cat">
    <label text="Parla con il computer" web-class="toolboxLabel"></label>
    <block type="arduino_serial_begin"></block>
    <block type="arduino_serial_print"></block>
    <block type="arduino_serial_available"></block>
    <block type="arduino_serial_read"></block>
  </category>
  <category name="Sensori" categorystyle="arduino_io_cat">
    <label text="Leggi sensori speciali" web-class="toolboxLabel"></label>
    <block type="arduino_pulse_in"></block>
  </category>
</xml>`;

// ─── CSS overrides for ELAB dark theme + iPad touch ──────────
const ELAB_BLOCKLY_CSS = `
/* Toolbox — iPad touch-friendly (≥44px targets) */
.blocklyToolboxDiv {
  background: var(--color-blockly-toolbox, #161B22) !important;
  border-right: 1px solid var(--color-blockly-grid, #2a3040) !important;
  padding: 4px 0 !important;
  -webkit-overflow-scrolling: touch !important;
}
.blocklyToolboxCategory {
  padding: 10px 12px !important;
  margin: 2px 4px !important;
  border-radius: 8px !important;
  min-height: 56px !important;
  display: flex !important;
  align-items: center !important;
  transition: background 0.15s ease !important;
}
.blocklyToolboxCategory:hover {
  background: var(--color-accent-subtle, rgba(124, 179, 66, 0.12)) !important;
}
.blocklyToolboxCategory[aria-selected="true"],
.blocklyToolboxCategory.blocklyTreeSelected {
  background: var(--color-code-selection, rgba(124, 179, 66, 0.2)) !important;
}
.blocklyToolboxCategoryLabel {
  font-family: var(--font-sans, 'Open Sans', sans-serif) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: var(--color-blockly-text, #C9D1D9) !important;
  letter-spacing: 0.02em !important;
}
.blocklyToolboxCategoryIcon {
  width: 20px !important;
  height: 20px !important;
  border-radius: 4px !important;
}

/* Flyout */
.blocklyFlyoutBackground {
  fill: var(--color-blockly-flyout, #21262D) !important;
  fill-opacity: 0.97 !important;
}

/* Workspace — touch-action for iPad drag */
.blocklyMainBackground {
  fill: var(--color-blockly-bg, #1E2530) !important;
}
.blocklySvg {
  touch-action: none !important;
}
.blocklyDraggable {
  touch-action: none !important;
}

/* Block text */
.blocklyText {
  font-family: var(--font-sans, 'Open Sans', sans-serif) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  fill: var(--color-text-inverse, #fff) !important;
}
.blocklyEditableText > .blocklyText {
  fill: var(--color-text-inverse, #fff) !important;
}
.blocklyEditableText > rect {
  fill: rgba(255,255,255,0.15) !important;
  rx: 4 !important;
  ry: 4 !important;
}

/* Field inputs */
.blocklyHtmlInput {
  font-family: var(--font-mono, 'Fira Code', monospace) !important;
  font-size: 14px !important;
  background: var(--color-blockly-input-bg, #0D1117) !important;
  color: var(--color-blockly-text, #C9D1D9) !important;
  border: 1px solid var(--color-accent, var(--elab-lime)) !important;
  border-radius: 4px !important;
  padding: 4px 6px !important;
  min-height: 44px !important;
}

/* Dropdown arrow */
.blocklyDropdownRect {
  fill: rgba(255,255,255,0.12) !important;
  rx: 4 !important;
  ry: 4 !important;
}

/* Scrollbar — wider for touch */
.blocklyScrollbarHandle {
  fill: var(--color-blockly-scrollbar, #3A4050) !important;
  rx: 4 !important;
  ry: 4 !important;
}
.blocklyScrollbarBackground {
  fill: transparent !important;
}

/* Trashcan */
.blocklyTrash image {
  opacity: 0.6 !important;
}
.blocklyTrash image:hover {
  opacity: 0.9 !important;
}

/* Zoom controls */
.blocklyZoom > image {
  opacity: 0.6 !important;
}
.blocklyZoom > image:hover {
  opacity: 0.9 !important;
}

/* Connection highlight — wider for touch precision */
.blocklyHighlightedConnectionPath {
  stroke: var(--color-accent, var(--elab-lime)) !important;
  stroke-width: 4px !important;
}

/* Selected block glow */
.blocklySelected > .blocklyPath {
  stroke: var(--color-accent, var(--elab-lime)) !important;
  stroke-width: 3px !important;
}

/* Separator in toolbox */
.blocklyTreeSeparator {
  border-bottom: 1px solid var(--color-blockly-grid, #2a3040) !important;
  margin: 6px 8px !important;
}

/* Flyout blocks — bigger touch targets */
.blocklyFlyout .blocklyDraggable {
  cursor: grab !important;
}
`;

const ScratchEditor = ({ onChange, initialCode, compileError, onCompileErrorDismiss, onWorkspaceReady, onBlockCountChange }) => {
    const blocklyDiv = useRef(null);
    const workspaceRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const isMountedRef = useRef(false);
    const isReloadingRef = useRef(false); // S112: Guard against onChange during programmatic workspace reloads
    // iter 85 close integration Sub-project A: optional callbacks ref pattern
    // (defensive backward-compat — existing callers without props see ZERO change).
    // Stored in refs to avoid useEffect re-running on every parent re-render.
    const onWorkspaceReadyRef = useRef(onWorkspaceReady);
    const onBlockCountChangeRef = useRef(onBlockCountChange);

    // iter 82 Task 6: Blockly UX overhaul overlays state
    const [showOnboarding, setShowOnboarding] = useState(
        () => typeof window !== 'undefined' && !localStorage.getItem('elab-blockly-onboarded')
    );
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    // iter 85 close integration Sub-project A: keep callback refs current without
    // forcing Blockly re-init useEffect to re-run.
    useEffect(() => { onWorkspaceReadyRef.current = onWorkspaceReady; }, [onWorkspaceReady]);
    useEffect(() => { onBlockCountChangeRef.current = onBlockCountChange; }, [onBlockCountChange]);

    // Inject ELAB CSS overrides once
    useEffect(() => {
        const id = 'elab-blockly-theme-css';
        if (!document.getElementById(id)) {
            const style = document.createElement('style');
            style.id = id;
            style.textContent = ELAB_BLOCKLY_CSS;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        if (!blocklyDiv.current) return;

        // S161.4: Clean up any orphaned Blockly DOM from previous failed mount
        // (prevents InsertionMarker crash cascade on ErrorBoundary retry)
        while (blocklyDiv.current.firstChild) {
            blocklyDiv.current.removeChild(blocklyDiv.current.firstChild);
        }

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: TOOLBOX_XML,
            theme: ELAB_THEME,
            renderer: 'zelos', // Rounded blocks — cleaner, more modern look
            grid: {
                spacing: 24,
                length: 2,
                colour: '#2a3040', // palette
                snap: true,
            },
            zoom: {
                controls: true,
                wheel: true,
                pinch: true,
                startScale: 1.0,
                maxScale: 2.5,
                minScale: 0.3,
                scaleSpeed: 1.15,
            },
            trashcan: true,
            sounds: false,
            move: {
                scrollbars: { horizontal: true, vertical: true },
                drag: true,
                wheel: true,
            },
        });

        const workspace = workspaceRef.current;

        // S112: Guard — suppress onChange during initial XML load
        isReloadingRef.current = true;
        // Load initial code if exists as XML
        if (initialCode && initialCode.startsWith('<xml')) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(initialCode, 'text/xml');
                Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
            } catch (e) {
                logger.error('[ScratchEditor] Invalid XML for Blockly', e);
            }
        } else {
            const xml = `
            <xml xmlns="https://developers.google.com/blockly/xml">
              <block type="arduino_base" x="40" y="30" deletable="false"></block>
            </xml>`;
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        }
        isReloadingRef.current = false;
        // S112: Emit initial onChange with correctly loaded workspace
        try {
            const xmlDom = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xmlDom);
            const code = generateArduinoCode(workspace);
            // Use setTimeout to ensure change listener is registered first
            setTimeout(() => onChangeRef.current?.(xmlText, code), 0);
        } catch (_) { /* ignore */ }

        // S83: Wrapped in try-catch to prevent Blockly crash on block move/disconnect
        const onChangeHandler = (event) => {
            if (event?.type === Blockly.Events?.UI || event?.isUiEvent) return;
            // S112: Skip onChange during programmatic workspace reloads (experiment switch)
            // to prevent saving intermediate/cleared workspace XML to localStorage
            if (isReloadingRef.current) return;
            try {
                const xmlDom = Blockly.Xml.workspaceToDom(workspace);
                const xmlText = Blockly.Xml.domToText(xmlDom);
                const code = generateArduinoCode(workspace);
                onChangeRef.current?.(xmlText, code);
            } catch (err) {
                logger.warn('[ScratchEditor] Code generation error:', err?.message);
                // Still save workspace XML even if code gen fails
                try {
                    const xmlDom = Blockly.Xml.workspaceToDom(workspace);
                    const xmlText = Blockly.Xml.domToText(xmlDom);
                    onChangeRef.current?.(xmlText, '// Errore generazione codice\n');
                } catch (_) { /* ignore */ }
            }
        };

        workspace.addChangeListener(onChangeHandler);

        // iter 82 Task 6: undo/redo state tracking for ScratchToolbar buttons
        const undoRedoListener = () => {
            try {
                setCanUndo(workspace.undoStack_?.length > 0);
                setCanRedo(workspace.redoStack_?.length > 0);
            } catch (_) { /* defensive — undoStack_ private API may change */ }
        };
        workspace.addChangeListener(undoRedoListener);

        // iter 85 close integration Sub-project A: optional callback wire-up.
        // Emit workspace ref + initial block count post-mount so parent
        // (HomeCompileEntry) can render ElabScratchModeShell with workspaceReady
        // + workspaceBlockCount props. Backward-compat: callbacks omitted = NO-OP.
        try {
            if (typeof onWorkspaceReadyRef.current === 'function') {
                onWorkspaceReadyRef.current(workspace);
            }
        } catch (err) {
            logger.warn('[ScratchEditor] onWorkspaceReady callback error:', err?.message);
        }
        let blockCountListener = null;
        if (typeof onBlockCountChangeRef.current === 'function') {
            const emitBlockCount = () => {
                try {
                    const count = workspace.getTopBlocks(false).length;
                    if (typeof onBlockCountChangeRef.current === 'function') {
                        onBlockCountChangeRef.current(count);
                    }
                } catch (_) { /* defensive — workspace may be disposed mid-event */ }
            };
            // Initial emit (post arduino_base load).
            emitBlockCount();
            blockCountListener = (event) => {
                if (!event) return;
                // Use string literals (Blockly Events constants may differ across versions)
                if (event.type === 'create' || event.type === 'delete' || event.type === 'finished_loading') {
                    emitBlockCount();
                }
            };
            workspace.addChangeListener(blockCountListener);
        }

        // S83: ResizeObserver — recalculate Blockly layout when container resizes
        let resizeObserver;
        if (blocklyDiv.current) {
            resizeObserver = new ResizeObserver(() => {
                try { Blockly.svgResize(workspace); } catch (_) { /* ignore */ }
            });
            resizeObserver.observe(blocklyDiv.current);
        }

        return () => {
            resizeObserver?.disconnect();
            if (workspace) {
                workspace.removeChangeListener(onChangeHandler);
                // iter 82 PHASE 5.5 fix CRITICAL-1: undoRedoListener was never removed
                // → memory leak on ScratchEditor remount (Codex Pattern C + code-reviewer findings)
                workspace.removeChangeListener(undoRedoListener);
                // iter 85 close integration Sub-project A: cleanup blockCount listener
                if (blockCountListener) {
                    try { workspace.removeChangeListener(blockCountListener); } catch (_) { /* defensive workspace dispose */ }
                }
                // Safe to dispose — patched by scripts/patch-blockly.js
                try { workspace.dispose(); } catch (_) { /* ignore residual */ }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload workspace when initialCode changes AFTER mount (e.g., Passo Passo step change, experiment switch)
    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            return;
        }
        if (!workspaceRef.current || !initialCode) return;
        const workspace = workspaceRef.current;
        // S112: Guard — suppress onChange during programmatic clear+load to prevent
        // saving intermediate (empty/wrong) workspace XML to localStorage
        isReloadingRef.current = true;
        workspace.clear();
        if (initialCode.startsWith('<xml')) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(initialCode, 'text/xml');
                Blockly.Xml.domToWorkspace(xmlDoc.documentElement, workspace);
            } catch (e) {
                logger.error('[ScratchEditor] Invalid XML reload', e);
            }
        } else {
            const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
              <block type="arduino_base" x="40" y="30" deletable="false"></block>
            </xml>`;
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
        }
        isReloadingRef.current = false;
        // S112: Emit one final onChange with the correct loaded workspace
        try {
            const xmlDom = Blockly.Xml.workspaceToDom(workspace);
            const xmlText = Blockly.Xml.domToText(xmlDom);
            const code = generateArduinoCode(workspace);
            onChangeRef.current?.(xmlText, code);
        } catch (_) { /* ignore */ }
    }, [initialCode]);

    // iter 82 Task 6: ScratchToolbar handlers wired to Blockly workspace API
    const handleUndo = useCallback(() => {
        try { workspaceRef.current?.undo(false); } catch (_) { /* defensive */ }
    }, []);
    const handleRedo = useCallback(() => {
        try { workspaceRef.current?.undo(true); } catch (_) { /* defensive */ }
    }, []);
    const handleClear = useCallback(() => {
        // iter 82 PHASE 5.5 fix Codex HIGH-1: workspace.clear() deletes the protected
        // arduino_base block → generateArduinoCode() emits empty setup/loop afterwards.
        // Preserve arduino_base: collect deletable top-blocks, remove only those.
        try {
            const ws = workspaceRef.current;
            if (!ws) return;
            const topBlocks = ws.getTopBlocks(false) || [];
            topBlocks.forEach((block) => {
                if (block?.type !== 'arduino_base' && block?.isDeletable?.()) {
                    block.dispose(false);
                }
            });
        } catch (_) { /* defensive */ }
    }, []);
    const handleHelp = useCallback(() => setShowOnboarding(true), []);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {showOnboarding && (
                <ScratchOnboarding onComplete={() => setShowOnboarding(false)} />
            )}
            <ScratchToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClear}
                onHelp={handleHelp}
                canUndo={canUndo}
                canRedo={canRedo}
            />
            <div
                ref={blocklyDiv}
                style={{ flex: 1, width: '100%', minHeight: '200px' }}
                className="blockly-container"
            />
            <ScratchErrorOverlay
                error={compileError}
                onDismiss={() => onCompileErrorDismiss?.()}
            />
        </div>
    );
};

export default ScratchEditor;
