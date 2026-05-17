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
import styles from './HomeCompileEntry.module.css';

const DEFAULT_BOARD_ID = 'arduino-nano-r4';
// Iter 73 CC-2 fix F2 (Codex Pattern V REFUTE): canonical FQBN passed
// explicit to compileCode — without this, api.js fallback to AVR Nano old
// bootloader (api.js:1294 ALLOWED_COMPILE_BOARDS sanitize). Matches
// src/boards/arduino-nano-r4.json:6 + api.js:64 whitelist (iter 72 BG-A7).
const DEFAULT_FQBN = 'arduino:renesas_uno:nanor4';

const HomeCompileEntry = React.memo(function HomeCompileEntry({ onBackHome }) {
  const [scratchCode, setScratchCode] = useState('');
  const [compileStatus, setCompileStatus] = useState('idle');
  const [compileErrors, setCompileErrors] = useState(null);
  const [compileWarnings, setCompileWarnings] = useState(null);
  const [compileSize, setCompileSize] = useState(null);

  const handleScratchCodeChange = useCallback((code) => {
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
        if (result.size) setCompileSize(result.size);
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
          <ScratchErrorBoundary>
            <ScratchEditor onChange={handleScratchCodeChange} />
          </ScratchErrorBoundary>
        </section>

        <aside className={styles.compileBarPanel} aria-label="Pannello compilazione">
          <ScratchCompileBar
            onCompile={() => handleCompile(scratchCode)}
            compilationStatus={compileStatus}
            compilationErrors={compileErrors}
            compilationWarnings={compileWarnings}
            compilationSize={compileSize}
            sketchCode={scratchCode}
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
