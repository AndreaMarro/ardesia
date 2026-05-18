/**
 * HomeCompileEntry — HomePage Blockly+IDE cross-compile entry (iter 73 CC-2).
 *
 * iter 64 SPEC mandate Andrea verbatim:
 *   "deve essere disponibile dove ci sono gli esperimenti con arduino e
 *    disponibile in generale nella home ide+blockly. Devono poterlo fare
 *    tutti, in sicurezza. Documenta tutto. Zero debito tecnico."
 *
 * Architecture: lazy-mounted via HomePage hash route `#compile-home`.
 * Reuses simulator panels (ScratchEditor + ScratchCompileBar) + R5
 * CompileAgentBanner (iter 66) + iter 70 CompileUploadButton wire (iter 72 BG-A7).
 *
 * Cross-compile chain end-to-end:
 *   1. Blockly editor → scratchGenerator.js → Arduino C++ string
 *   2. ScratchCompileBar onCompile → POST localhost:8765/compile
 *   3. ELAB Agent → arduino-cli compile FQBN arduino:renesas_uno:nanor4
 *   4. CompileUploadButton (if agent online + sketchCode) → POST /compile-and-upload
 *
 * PRINCIPIO ZERO compliance:
 *   - Plurale "Ragazzi" in tutti i copy
 *   - Kit fisico ELAB mention (Nano R4 breakout wing)
 *   - Vol3 reference quando applicabile
 *
 * Morfismo Sense 2:
 *   - Palette Navy/Lime/Orange/Red CSS vars
 *   - Iconografia ElabIcons SVG (no emoji)
 *   - boardId default `arduino-nano-r4` matching kit Omaric
 */

import React, { useCallback, useRef, useState } from 'react';
import { compileCode } from '../../services/api';
import logger from '../../utils/logger';
// iter 77 P0.2b fix (Codex Pattern V iter 77 verify MED #4): swap legacy
// CompileAgentBanner → WebUsbBanner default per iter 76 ARCHITECTURAL
// PIVOT Andrea verbatim "NO download docente, WebUSB direct". Legacy
// banner gated env flag VITE_USE_LOCAL_AGENT for dev fallback ONLY.
import CompileAgentBanner from '../HomePage/CompileAgentBanner';
import WebUsbBanner from '../HomePage/WebUsbBanner';
const USE_LOCAL_AGENT_BANNER =
  typeof import.meta !== 'undefined'
    && import.meta.env
    && import.meta.env.VITE_USE_LOCAL_AGENT === 'true';
import ScratchEditor from '../simulator/panels/ScratchEditor';
import ScratchCompileBar, { ScratchErrorBoundary } from '../simulator/panels/ScratchCompileBar';
// iter 80.A2 fix (Codex Pattern V iter 79 HIGH IDE-1): add direct C++
// editor tab. HomePage copy line 112 promises "scrivete codice Arduino con
// i blocchi Blockly oppure direttamente in C++" — previously only Blockly
// mounted, breaking PRINCIPIO ZERO mandate Andrea verbatim iter 79 PM.
// CodeEditorCM6 consumed AS-IS from existing simulator panel (iter 73 P0.5
// LIVE: CodeMirror 6 + cpp lang + Arduino autocomplete + friendly error
// translator). NO modify simulator file — pure consumer wire-up.
import CodeEditorCM6 from '../simulator/panels/CodeEditorCM6';
// iter 85 close integration Sub-project A: WrenchIcon + PuzzleIcon ElabIcons
// imports removed — inline tab bar (iter 80.A2 + iter 81.A1) replaced by
// ModeToggle (iter 84 atom 8) which provides its own canonical IT plurale
// label "Blocchi"/"C++" senza icon dependency (palette-only styling).
// iter 85 close integration Sub-project A: wire iter 84 standalone atoms
// 6 (StarterButtons + starterTemplates) + 7 (ElabScratchModeShell) + 8
// (ModeToggle) into production path. PROD user vede ModeToggle top bar +
// ElabScratchModeShell wrap StarterButtons overlay quando workspace empty.
// Anti-regression CRITICAL: editorMode === 'blocks' gate MANDATORY —
// 'code' path NO mount ElabScratchModeShell (Blockly-only crash prevention).
import { ModeToggle, MODE_BLOCKS, MODE_CODE } from '../../features/elabBlocks/ui/ModeToggle.jsx';
import { ElabScratchModeShell } from '../../features/elabBlocks/ui/ElabScratchModeShell.jsx';
import { getStarterXml } from '../../features/elabBlocks/starterTemplates.js';
import * as Blockly from 'blockly';
import styles from './HomeCompileEntry.module.css';

// iter 85 close integration Sub-project A: localStorage persistence key
// Andrea ratify gruppo 17 voce 2 verbose explicit naming
// (vs short 'elab_mode' — IT plurale explicit per Sense 1.5 morfismo).
const EDITOR_MODE_STORAGE_KEY = 'elab_editor_mode_preference';

const DEFAULT_BOARD_ID = 'arduino-nano-r4';
// Iter 73 CC-2 fix F2 (Codex Pattern V REFUTE): canonical FQBN passed
// explicit to compileCode — without this, api.js fallback to AVR Nano old
// bootloader (api.js:1294 ALLOWED_COMPILE_BOARDS sanitize). Matches
// src/boards/arduino-nano-r4.json:6 + api.js:64 whitelist (iter 72 BG-A7).
const DEFAULT_FQBN = 'arduino:renesas_uno:nanor4';

// iter 80.A2 (Codex Pattern V iter 79 HIGH IDE-1): default Blink starter
// sketch for "Codice C++" tab. Mirrors Vol3 Cap.6 Esp.1 introduction —
// pin 13 LED standard didattico (PRINCIPIO ZERO triplet coerenza: kit
// Omaric + volumi Davide + software ELAB Tutor). Plurale comment intro.
const DEFAULT_CPP_BLINK = '// Vol3 Cap.6 Esp.1 — Blink sul pin 13 del Nano R4 ELAB\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n';

const HomeCompileEntry = React.memo(function HomeCompileEntry({ onBackHome }) {
  const [scratchCode, setScratchCode] = useState('');
  // iter 80.A2 (Codex Pattern V iter 79 HIGH IDE-1): direct C++ editor
  // state. Default seeded Blink Vol3 Cap.6 Esp.1 sketch so docente vede
  // codice già compilabile (Karpathy "Simple": no empty-editor friction).
  const [cppCode, setCppCode] = useState(DEFAULT_CPP_BLINK);
  // iter 85 close integration Sub-project A: editorMode state ora consume
  // localStorage preference Andrea ratify gruppo 17 voce 2. Default 'blocks'
  // preserves iter 73 CC-2 Blockly first-impression (vs 'code' direct C++).
  const [editorMode, setEditorMode] = useState(() => {
    try {
      if (typeof window === 'undefined') return MODE_BLOCKS;
      const saved = window.localStorage.getItem(EDITOR_MODE_STORAGE_KEY);
      if (saved === MODE_CODE || saved === MODE_BLOCKS) return saved;
    } catch (_) { /* defensive — localStorage may throw (private mode, quota) */ }
    return MODE_BLOCKS;
  });
  // iter 85 close integration Sub-project A: workspace lifecycle state for
  // ElabScratchModeShell. workspaceRef stores Blockly workspace instance for
  // starter XML load. workspaceReady toggles skeleton loading (F4 mitigation
  // 4/6 personas fail audit). workspaceBlockCount drives StarterButtons
  // overlay visibility (isEmpty when ≤1 = arduino_base alone).
  const workspaceRef = useRef(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [workspaceBlockCount, setWorkspaceBlockCount] = useState(0);
  const [compileStatus, setCompileStatus] = useState('idle');
  const [compileErrors, setCompileErrors] = useState(null);
  const [compileWarnings, setCompileWarnings] = useState(null);
  const [compileSize, setCompileSize] = useState(null);

  // iter 85 close integration Sub-project A: ModeToggle handler — persists
  // preference localStorage (defensive try/catch — quota OR private mode).
  const handleModeChange = useCallback((mode) => {
    if (mode !== MODE_BLOCKS && mode !== MODE_CODE) return;
    setEditorMode(mode);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(EDITOR_MODE_STORAGE_KEY, mode);
      }
    } catch (_) { /* defensive — localStorage may throw (private mode, quota) */ }
  }, []);

  // iter 85 close integration Sub-project A: ScratchEditor optional callback
  // onWorkspaceReady — captures Blockly workspace ref for starter XML load
  // + flips workspaceReady true → ElabScratchModeShell dismiss skeleton.
  const handleWorkspaceReady = useCallback((workspace) => {
    workspaceRef.current = workspace;
    setWorkspaceReady(true);
  }, []);

  // iter 85 close integration Sub-project A: StarterButtons callback —
  // parent loads pre-built Blockly XML via getStarterXml + domToWorkspace.
  // Defensive: validate workspace ref + Blockly Xml utils available before
  // dispatch. Clear workspace first to avoid stacking with arduino_base.
  const handleStarterClick = useCallback((key) => {
    const xml = getStarterXml(key);
    if (!xml || !workspaceRef.current) {
      logger.warn('[HomeCompileEntry] starter load skipped: missing xml or workspace ref');
      return;
    }
    try {
      const dom = Blockly?.utils?.xml?.textToDom?.(xml);
      if (!dom) {
        logger.warn('[HomeCompileEntry] Blockly.utils.xml.textToDom unavailable');
        return;
      }
      workspaceRef.current.clear();
      Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
    } catch (err) {
      logger.warn('[HomeCompileEntry] starter load failed:', err?.message);
    }
  }, []);

  // iter 79.A A1 fix (Codex Pattern V HIGH IDE-2 + HOMEPAGE-2): ScratchEditor
  // emits onChange(xmlText, generatedCppCode) per ScratchEditor.jsx:407-412+
  // 421-425+491. Previous handler stored xmlText as scratchCode → compile
  // received raw <xml>...</xml> instead of C++ → arduino-cli "Error during
  // build: exit status 1" (empirically reproduced 2026-05-17). Fix: ignore
  // first arg, store second (generated C++).
  const handleScratchCodeChange = useCallback((_xml, code) => {
    setScratchCode(code || '');
  }, []);

  const handleCompile = useCallback(async (codeOverride) => {
    const code = typeof codeOverride === 'string' ? codeOverride : scratchCode;
    if (!code || !code.trim()) {
      setCompileStatus('error');
      setCompileErrors('Ragazzi, prima scrivete il codice Arduino o trascinate i blocchi sull\'editor.');
      return;
    }
    setCompileStatus('compiling');
    setCompileErrors(null);
    setCompileWarnings(null);
    setCompileSize(null);
    try {
      const result = await compileCode(code, DEFAULT_FQBN);
      if (result && result.success) {
        setCompileStatus('success');
        // iter 80 80.A5 fix (Codex Pattern V iter 79 MED COMPILE-6 +
        // Codex Pattern C iter 80 batch MED shape match): api.js compileCode
        // never returns result.size — Cloud Render branch (api.js:1362-1369)
        // maps hexBase64 → result.hex without size; legacy branch (api.js:
        // 1372-1378) maps data.hex → result.hex similarly. Derive bytes from
        // result.hex content: base64 atob length for Cloud (HomeCompileEntry
        // default FQBN = Renesas Nano R4 → isCloudRender=true), Intel HEX
        // hex-digit count / 2 fallback for legacy. Wrap in {bytes,total,
        // percent} object matching ScratchCompileBar:127 render contract
        // (`compilationSize.bytes`/`.total`/`.percent`). Nano R4 flash
        // = 256KB = 262144 bytes per src/boards/arduino-nano-r4.json:12.
        const derivedBytes = (() => {
          if (typeof result.size === 'number') return result.size;
          if (!result.hex) return null;
          const trimmed = String(result.hex).trimStart();
          // Intel HEX heuristic: trimmed starts with ':' (record marker)
          if (trimmed.charAt(0) === ':') {
            return Math.floor(trimmed.replace(/[^0-9a-fA-F]/g, '').length / 2);
          }
          // Base64 path (Cloud Render canonical for Nano R4 FQBN)
          try {
            return atob(trimmed).length;
          } catch {
            return null;
          }
        })();
        if (derivedBytes != null) {
          const FLASH_TOTAL_NANO_R4 = 262144; // 256KB Renesas RA4M1
          setCompileSize({
            bytes: derivedBytes,
            total: FLASH_TOTAL_NANO_R4,
            percent: Math.round((derivedBytes / FLASH_TOTAL_NANO_R4) * 100),
          });
        }
        if (result.warnings) setCompileWarnings(result.warnings);
      } else {
        setCompileStatus('error');
        setCompileErrors(result?.errors || 'Compilazione fallita. Controllate il codice ragazzi.');
      }
    } catch (err) {
      logger.error('[HomeCompileEntry] compile error', err);
      setCompileStatus('error');
      setCompileErrors(err?.message || 'Errore di rete. Verificate la connessione.');
    }
  }, [scratchCode]);

  return (
    <div className={styles.root} data-testid="home-compile-entry" data-elab-mode="compile-home">
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBackHome}
          aria-label="Torna alla home"
        >
          ← Home
        </button>
        <h1 className={styles.title}>Compila Arduino dal kit ELAB</h1>
        <p className={styles.subtitle}>
          Ragazzi, scrivete codice Arduino con i blocchi Blockly oppure direttamente in C++.
          Poi premete <strong>Compila</strong> e caricate sul vostro Nano R4 del kit.
        </p>
      </header>

      <section className={styles.bannerSection} aria-label="Stato browser cross-compile">
        {USE_LOCAL_AGENT_BANNER ? <CompileAgentBanner /> : <WebUsbBanner />}
      </section>

      <main className={styles.editorGrid}>
        <section className={styles.editorPanel} aria-label="Editor Blockly + IDE">
          {/* iter 85 close integration Sub-project A — ModeToggle iter 84
              atom 8 (Andrea ratify gruppo 16 voce 3) replaces inline
              tab bar (iter 80.A2 + iter 81.A1) for canonical 2-state
              Blocchi/C++ toggle. Same WAI-ARIA Tab pattern
              (tablist + tab + aria-selected + Arrow Left/Right + Space/Enter)
              + WCAG touch 44+ + IT plurale label preserved. Top bar
              position visibile LIM 4K + iPad. localStorage persist via
              handleModeChange. */}
          {/* iter 85 close integration Sub-project A: reuse styles.tabBar
              wrapper (defined HomeCompileEntry.module.css:102 — flex 0 0 auto +
              bg + border-bottom + padding 0 8px + gap 4px). NO modify CSS
              module (file ownership rigid per Sub-project A mandate). */}
          <div className={styles.tabBar}>
            <ModeToggle activeMode={editorMode} onModeChange={handleModeChange} />
          </div>

          <div
            className={styles.editorSurface}
            role="tabpanel"
            id="home-compile-tabpanel-editor"
            aria-labelledby="mode-toggle-active"
          >
            {/* iter 85 close integration Sub-project A — anti-regression
                MANDATORY: editorMode === 'blocks' gate. ElabScratchModeShell
                (atom 7) wraps ScratchEditor con StarterButtons (atom 6)
                overlay quando workspace empty + skeleton loading mount.
                editorMode === 'code' path NO mount ElabScratchModeShell
                (Blockly-only crash prevention — workspaceRef nullable
                outside Blockly mount). */}
            {editorMode === MODE_BLOCKS ? (
              <ScratchErrorBoundary>
                <ElabScratchModeShell
                  workspaceReady={workspaceReady}
                  workspaceBlockCount={workspaceBlockCount}
                  onStarterClick={handleStarterClick}
                  title="ELAB Scratch Arduino"
                >
                  <ScratchEditor
                    onChange={handleScratchCodeChange}
                    // iter 82 PHASE 5.5 fix Codex MED-5: gate compileError by editorMode.
                    // Without gate, C++ compile error shows in Blockly overlay after tab switch.
                    compileError={editorMode === MODE_BLOCKS ? compileErrors : null}
                    onCompileErrorDismiss={() => setCompileErrors(null)}
                    // iter 85 close integration Sub-project A: optional callback
                    // wire-up — ScratchEditor emits workspace ref + top-block count
                    // for ElabScratchModeShell skeleton + StarterButtons overlay.
                    onWorkspaceReady={handleWorkspaceReady}
                    onBlockCountChange={setWorkspaceBlockCount}
                  />
                </ElabScratchModeShell>
              </ScratchErrorBoundary>
            ) : (
              <CodeEditorCM6
                code={cppCode}
                onChange={setCppCode}
                readOnly={false}
              />
            )}
          </div>
        </section>

        <aside className={styles.compileBarPanel} aria-label="Pannello compilazione">
          <ScratchCompileBar
            onCompile={() => handleCompile(editorMode === MODE_CODE ? cppCode : scratchCode)}
            compilationStatus={compileStatus}
            compilationErrors={compileErrors}
            compilationWarnings={compileWarnings}
            compilationSize={compileSize}
            // iter 80 80.A2 (Codex Pattern V iter 79 HIGH IDE-1) + 80.A3
            // (MED IDE-3) combined: editorMode-aware source selection +
            // honest label. Source = cppCode when "Codice C++" tab active
            // (CodeEditorCM6 direct entry), scratchCode when Blockly tab
            // (ScratchEditor onChange xml/code → C++ via scratchGenerator).
            // Label override "Compila" because Home handler calls compileCode
            // only — physical upload routes via separate CompileUploadButton.
            sketchCode={editorMode === MODE_CODE ? cppCode : scratchCode}
            compileButtonLabel="Compila"
            boardId={DEFAULT_BOARD_ID}
            port={null}
          />
        </aside>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Cross-compile cloud per Arduino Nano R4 (Renesas RA4M1) direttamente dal
          browser. Premete "Compila" per generare l'eseguibile sul nostro server.
          Per caricare sul kit fisico, collegate Nano R4 via USB-C e premete
          "Carica sul kit fisico" — il browser flasha la scheda via WebUSB
          (Chrome/Edge desktop). Nessun download richiesto.
        </p>
      </footer>
      {/* Iter 74 TRACK A1 fix (Codex iter 73 Pattern V MED #4): rimosso
          link diretto <a href="/scripts/setup-elab-compile-agent.sh"> perché
          script MAI shipped (404 prod confermato empirical). Distribuzione
          packaging Tauri signed installer = iter 64 SPEC Option B
          ($300/yr Apple Dev ID + cross-platform pipeline) defer iter 75+
          scope. Per ora docente legge istruzioni manuale OR Andrea/Tea
          installa via SSH ad-hoc. */}
    </div>
  );
});

export default HomeCompileEntry;
