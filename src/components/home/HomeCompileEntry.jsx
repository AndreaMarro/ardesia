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

import React, { useCallback, useState } from 'react';
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
// iter 81 81.A2 (close BG agent A2 caveat #5): extract inline puzzle SVG to
// ElabIcons.PuzzleIcon — reusable + central palette discipline.
import { WrenchIcon, PuzzleIcon } from '../common/ElabIcons';
import styles from './HomeCompileEntry.module.css';

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
  // iter 80.A2 editor mode tab state — 'blocks' default (preserves iter 73
  // CC-2 Blockly experience) vs 'code' direct C++ entry. Switching tab
  // changes which source feeds handleCompile (see ScratchCompileBar wire).
  const [editorMode, setEditorMode] = useState('blocks');
  const [compileStatus, setCompileStatus] = useState('idle');
  const [compileErrors, setCompileErrors] = useState(null);
  const [compileWarnings, setCompileWarnings] = useState(null);
  const [compileSize, setCompileSize] = useState(null);

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
          {/* iter 80.A2 (Codex Pattern V iter 79 HIGH IDE-1) — tab switch
              Blockly vs C++ diretto. Labels Italian plurale (PRINCIPIO
              ZERO non-negoziabile). Icone ElabIcons SVG no emoji
              (CLAUDE.md §Regole tecniche 11). ARIA tablist semantica
              WAI-ARIA Authoring Practices Tab pattern (role tablist/tab
              + aria-selected runtime). Touch target ≥44×44 (CLAUDE.md
              §Qualita 9). */}
          {/* iter 81 81.A1 (close BG agent A2 caveat #4): WAI-ARIA Tab
              pattern complete keyboard nav. Arrow Left/Right cycle tabs,
              Home/End jump first/last. Roving tabIndex (iter 80.A2) preserved.
              Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ */}
          <div
            className={styles.tabBar}
            role="tablist"
            aria-label="Modalità editor"
            onKeyDown={(e) => {
              const TAB_ORDER = ['blocks', 'code'];
              const currentIdx = TAB_ORDER.indexOf(editorMode);
              let nextIdx = null;
              if (e.key === 'ArrowRight') nextIdx = (currentIdx + 1) % TAB_ORDER.length;
              else if (e.key === 'ArrowLeft') nextIdx = (currentIdx - 1 + TAB_ORDER.length) % TAB_ORDER.length;
              else if (e.key === 'Home') nextIdx = 0;
              else if (e.key === 'End') nextIdx = TAB_ORDER.length - 1;
              if (nextIdx !== null) {
                e.preventDefault();
                const nextMode = TAB_ORDER[nextIdx];
                setEditorMode(nextMode);
                // Move focus to the newly-active tab (WAI-ARIA mandate).
                requestAnimationFrame(() => {
                  const nextBtn = document.getElementById(`home-compile-tab-${nextMode}`);
                  if (nextBtn) nextBtn.focus();
                });
              }
            }}
          >
            <button
              type="button"
              role="tab"
              id="home-compile-tab-blocks"
              aria-selected={editorMode === 'blocks'}
              aria-controls="home-compile-tabpanel-editor"
              tabIndex={editorMode === 'blocks' ? 0 : -1}
              className={`${styles.tabButton} ${editorMode === 'blocks' ? styles.tabActive : ''}`}
              onClick={() => setEditorMode('blocks')}
              data-testid="home-compile-tab-blocks"
            >
              <PuzzleIcon size={20} className={styles.tabIcon} />
              Blocchi
            </button>
            <button
              type="button"
              role="tab"
              id="home-compile-tab-code"
              aria-selected={editorMode === 'code'}
              aria-controls="home-compile-tabpanel-editor"
              tabIndex={editorMode === 'code' ? 0 : -1}
              className={`${styles.tabButton} ${editorMode === 'code' ? styles.tabActive : ''}`}
              onClick={() => setEditorMode('code')}
              data-testid="home-compile-tab-code"
            >
              <WrenchIcon size={20} className={styles.tabIcon} />
              Codice C++
            </button>
          </div>

          <div
            className={styles.editorSurface}
            role="tabpanel"
            id="home-compile-tabpanel-editor"
            aria-labelledby={editorMode === 'blocks' ? 'home-compile-tab-blocks' : 'home-compile-tab-code'}
          >
            {editorMode === 'blocks' ? (
              <ScratchErrorBoundary>
                <ScratchEditor
                  onChange={handleScratchCodeChange}
                  // iter 82 PHASE 5.5 fix Codex MED-5: gate compileError by editorMode.
                  // Without gate, C++ compile error shows in Blockly overlay after tab switch.
                  compileError={editorMode === 'blocks' ? compileErrors : null}
                  onCompileErrorDismiss={() => setCompileErrors(null)}
                />
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
            onCompile={() => handleCompile(editorMode === 'code' ? cppCode : scratchCode)}
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
            sketchCode={editorMode === 'code' ? cppCode : scratchCode}
            compileButtonLabel="Compila"
            boardId={DEFAULT_BOARD_ID}
            port={null}
          />
        </aside>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Cross-compile per Arduino Nano R4 (Renesas RA4M1). Per caricare sul kit,
          installate l'ELAB Compile Agent locale (banner sopra mostra lo stato).
          Istruzioni d'installazione disponibili nella documentazione tecnica.
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
