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
import { resolveCompileFlash } from '../../utils/compileSizeParse';
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
// Iter 97 atom C — UnlimCompileHelper right-panel mascot per Andrea iter 97 PM
// screenshot feedback "qui sarebbe bello unlim animato che ti spiega cosa fare
// in base alle domande". V1 static scaffold (mascot + speech bubble + 3 quick
// question buttons). V2 animation iter 98+. V3 unlimScreenAgent wire iter 99+
// (post-fix 5 HIGH per code-reviewer atom 34 verdict).
import UnlimCompileHelper from './UnlimCompileHelper';
// Iter 95 SP3 T3 — Virtual Serial Monitor panel rendering predicted Serial.*
// output from user C++ Arduino sketch. Andrea iter 94 PM mandate: "Monitor
// Seriale Virtuale che analizza Serial.begin/print/println + mostra output
// previsto" + mandatory disclaimer "Seriale prevista dal programma. Per
// leggere la seriale reale collega una Nano R4 via USB."
import VirtualSerialMonitor from '../simulator/panels/VirtualSerialMonitor';
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

// iter 88 88.UX-3 /onboard — lazy mount 5-step overlay tour first-render
// per docente non-tech (target Sprint U Riccardo demo). Lazy import keeps
// bundle small (~150 LOC + ~120 LOC CSS module). Mount gated by localStorage
// `elab.compile.onboarded === 'true'` — second visit no auto-mount.
const HomeCompileOnboarding = React.lazy(() => import('./HomeCompileOnboarding'));

// iter 88 88.UX-7 /extract — collapsible "Cosa fa questo programma?" panel.
// Plain Italian docente explainer per-template (blink-led/read-button/read-sensor).
// localStorage persist `elab.compile.explainer.collapsed`. PRINCIPIO ZERO
// plurale + Vol3 Cap.6 Esp.1 reference. Lazy import bundle small (~175 LOC).
const ProgramExplainer = React.lazy(() => import('./ProgramExplainer'));

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

  // iter 88 88.UX-3 /onboard — first-render tour mount gate. Read
  // localStorage at lazy init time (NOT useEffect) so we never render
  // overlay then dismiss = flicker. Defensive try/catch private mode +
  // SSR (typeof window === 'undefined' guard). Default false NOT true on
  // throw — safer to skip tour than block compile entry behind broken
  // localStorage.
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return typeof window !== 'undefined'
        && window.localStorage.getItem('elab.compile.onboarded') !== 'true';
    } catch (_) {
      return false;
    }
  });

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
        const provider = result.provider || 'cloud-renesas';
        if (provider !== 'cloud-renesas') {
          setCompileStatus('verified-legacy');
          setCompileSize(null);
          if (result.warnings) setCompileWarnings(result.warnings);
          return;
        }

        setCompileStatus('success');
        // iter-102 fix (Codex iter-101 review + live Chrome debug 2026-05-20):
        // iter-80.A5 reported result.artifactSizeBytes (= hexSize, the Intel
        // HEX *file* size) and atob(hexBase64).length (the same HEX text) as
        // the flash figure → the panel showed "42%" for a Blink that really
        // uses ~14%. resolveCompileFlash parses arduino-cli stdout
        // (result.output, authoritative) with an Intel HEX data-record
        // fallback. See src/utils/compileSizeParse.js.
        const flash = resolveCompileFlash(result);
        if (flash) {
          setCompileSize(flash);
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

  const isLegacyVerified = compileStatus === 'verified-legacy';

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
          {isLegacyVerified ? (
            <>
              {' '}Poi premete <strong>Compila</strong>: se vedete “codice verificato”,
              è solo una verifica legacy, non un programma pronto da caricare sul Nano R4.
            </>
          ) : (
            <>
              {' '}Poi premete <strong>Compila</strong>: il caricamento sul Nano R4 si abilita
              solo dopo una compilazione reale per il kit.
            </>
          )}
        </p>
      </header>

      <section className={styles.bannerSection} aria-label="Stato browser cross-compile">
        {/* iter 87 PHASE 4c UX (Andrea feedback 2026-05-18): hide redundant
            "Apri il Compilatore" CTA when banner rendered INSIDE compiler page
            (sei già nel compilatore). Status part still useful (WebUSB ready
            indicator). openCompilerUrl=null hides only the CTA button. */}
        {USE_LOCAL_AGENT_BANNER
          ? <CompileAgentBanner openCompilerUrl={null} />
          : <WebUsbBanner openCompilerUrl={null} />}
      </section>

      <main className={styles.editorGrid}>
        {/* iter 88 88.UX-3 /onboard — data-onboard-target attrs identify
            highlight zones for 5-step tour overlay (HomeCompileOnboarding).
            "starter-buttons" wraps editorPanel containing StarterButtons
            overlay (atom 7 ElabScratchModeShell, mounts inside ScratchEditor
            when workspace empty). "editor" wraps the editor surface, "compile-bar"
            wraps the ScratchCompileBar aside. NO functional change — pure attr
            additions for tour outline targeting. */}
        <section className={styles.editorPanel} aria-label="Editor Blockly + IDE" data-onboard-target="starter-buttons">
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

          {/* iter 88 88.UX-7 /extract — ProgramExplainer collapsible panel
              above editor first-render. Plain Italian "Cosa fa questo
              programma?" per current loaded template (default blink-led
              maps Vol3 Cap.6 Esp.1 Blink). NO functional wiring to editor
              state — pure presentational. Mounts both Blockly + C++ tabs
              (templateKey static "blink-led" until iter 89+ dynamic detect
              via volume-references.js wire-up). */}
          <React.Suspense fallback={null}>
            <ProgramExplainer templateKey="blink-led" />
          </React.Suspense>

          <div
            className={styles.editorSurface}
            role="tabpanel"
            id="home-compile-tabpanel-editor"
            aria-labelledby="mode-toggle-active"
            data-onboard-target="editor"
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
                // iter 87 PHASE 4c UX: hide duplicate "▶ Compila & Carica" footer
                // button. Canonical compile entry = ScratchCompileBar aside (right
                // panel). Andrea feedback 2026-05-18 PM: 3 compile buttons (header
                // banner CTA + green editor footer + side panel) confondevano.
                hideCompileButton
                // iter 88 88.UX-1 /distill — hide decorative "Editor Codice"
                // title + A-/13/A+ font zoom toolbar. Status preserved
                // (role="status" aria-live) accessibility. Reduces ≤5 elem
                // first-render per Andrea verdetto iter 87 PHASE 4c
                // "ux ui fanno schifo" + critique Nielsen 22/40 mediocre.
                // ScratchCompileBar aside already shows canonical status.
                compact
              />
            )}
          </div>
        </section>

        <aside className={styles.compileBarPanel} aria-label="Pannello compilazione" data-onboard-target="compile-bar">
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
          {/* Iter 97 atom C — UnlimCompileHelper static mascot scaffold per
              Andrea iter 97 PM screenshot feedback "qui sarebbe bello unlim
              animato che ti spiega cosa fare in base alle domande". V1 fills
              previously empty right-panel area below ScratchCompileBar.
              V2 iter 98+ wire onAskQuestion to HomePage UNLIM chat surface. */}
          <UnlimCompileHelper compileStatus={compileStatus} />
        </aside>

        {/* Iter 95 SP3 T3 — Virtual Serial Monitor. iter-103 layout refactor
            (Andrea iter 103 PM ratify "Monitor sotto l'editor"): spostato
            DENTRO editorGrid come cella della griglia (grid-area: serial)
            sotto l'editor. Prima era un <section> fratello a tutta larghezza
            — la "banda nera gigante" del bug. Mostra l'output Serial.*
            previsto dal sorgente corrente; disclaimer Andrea iter 94 PM
            dentro al componente. */}
        <section
          className={styles.virtualSerialSection}
          aria-label="Monitor Seriale Virtuale"
          data-onboard-target="virtual-serial"
        >
          <VirtualSerialMonitor
            cppCode={editorMode === MODE_CODE ? cppCode : scratchCode}
            boardConnected={false}
            maxIterations={10}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        {/* iter 88 88.UX-2 /clarify — Andrea verdetto iter 87 PHASE 4c critique
            Nielsen #2 Match real world 2/4. Rewrite jargon scuola pubblica:
            "Renesas RA4M1" → "Arduino Nano R4 del kit ELAB"; "ARM Cortex-M4"
            rimosso; "WebUSB (Chrome/Edge desktop)" → "Chrome o Edge (computer,
            non tablet)"; "Carica sul kit fisico" → "Carica sul kit Arduino";
            "flasha" → "carica". Docente non-tech 8-14 anni studenti target. */}
        <p className={styles.footerNote}>
          {isLegacyVerified
            ? 'Codice verificato dal compilatore legacy: il compilatore Nano R4 non è ancora attivo, quindi questo risultato non abilita il caricamento sul kit fisico.'
            : 'Compila il programma per l\'Arduino Nano R4 del kit ELAB dal browser. Il caricamento sul kit fisico sarà disponibile solo dopo una compilazione Nano R4 reale. Funziona con browser Chrome o Edge (su computer, non tablet).'}
        </p>
      </footer>
      {/* Iter 74 TRACK A1 fix (Codex iter 73 Pattern V MED #4): rimosso
          link diretto <a href="/scripts/setup-elab-compile-agent.sh"> perché
          script MAI shipped (404 prod confermato empirical). Distribuzione
          packaging Tauri signed installer = iter 64 SPEC Option B
          ($300/yr Apple Dev ID + cross-platform pipeline) defer iter 75+
          scope. Per ora docente legge istruzioni manuale OR Andrea/Tea
          installa via SSH ad-hoc. */}

      {/* iter 88 88.UX-3 /onboard — first-render 5-step tour overlay.
          Mount only if localStorage `elab.compile.onboarded !== 'true'`
          (gated by useState lazy init top). Suspense fallback=null per
          spec — no skeleton, just instant mount on chunk load (~150 LOC
          + ~120 LOC CSS module, loads <30ms typical). On dismiss
          (skip/Esc/complete step 5) → setShowOnboarding(false) +
          localStorage.setItem 'true' (set internally by component). */}
      {showOnboarding && (
        <React.Suspense fallback={null}>
          <HomeCompileOnboarding onComplete={() => setShowOnboarding(false)} />
        </React.Suspense>
      )}
    </div>
  );
});

export default HomeCompileEntry;
