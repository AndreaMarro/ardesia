import React, { useEffect, useRef, useState } from 'react';
import { PaletteIcon, RobotIcon } from '../common/ElabIcons';
import CompileButton from './CompileButton';
import EditorPane from './EditorPane';
import ModeSwitcher, { type IdeMode } from './ModeSwitcher';
import StatusBar, { type CompileStatus } from './StatusBar';
import styles from './IdeShell.module.css';

const STORAGE_KEY = 'elab.ide.mode';

const DEFAULT_CPP = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}`;

const DEFAULT_BLOCKLY_XML = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_base" x="40" y="30" deletable="false"></block>
</xml>`;

type IdeShellProps = {
  initialCpp?: string;
};

type IdeSyncApi = {
  parseCppToAst?: (source: string) => unknown;
  astToBlocklyXml?: (ast: unknown) => string;
  parseBlocklyToAst?: (xml: string) => unknown;
  astToCpp?: (ast: unknown) => string;
};

declare global {
  interface Window {
    __ELAB_IDE_SYNC__?: IdeSyncApi;
  }
}

function isIdeMode(value: string | null): value is IdeMode {
  return value === 'blocks' || value === 'cpp' || value === 'dual';
}

function readInitialMode(): IdeMode {
  if (typeof window === 'undefined') return 'cpp';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isIdeMode(stored) ? stored : 'cpp';
  } catch {
    return 'cpp';
  }
}

function syncCppToBlockly(source: string, fallbackXml: string) {
  const api = typeof window !== 'undefined' ? window.__ELAB_IDE_SYNC__ : undefined;
  if (!api?.parseCppToAst || !api?.astToBlocklyXml) return fallbackXml;
  const ast = api.parseCppToAst(source);
  return api.astToBlocklyXml(ast) || fallbackXml;
}

function syncBlocklyToCpp(xml: string, fallbackCpp: string) {
  const api = typeof window !== 'undefined' ? window.__ELAB_IDE_SYNC__ : undefined;
  if (!api?.parseBlocklyToAst || !api?.astToCpp) return fallbackCpp;
  const ast = api.parseBlocklyToAst(xml);
  return api.astToCpp(ast) || fallbackCpp;
}

export default function IdeShell({ initialCpp = DEFAULT_CPP }: IdeShellProps) {
  const [mode, setMode] = useState<IdeMode>(readInitialMode);
  const [cpp, setCpp] = useState(initialCpp);
  const [blocklyXml, setBlocklyXml] = useState(DEFAULT_BLOCKLY_XML);
  const [compileStatus, setCompileStatus] = useState<CompileStatus>({ state: 'idle' });
  const lastEditRef = useRef<'cpp' | 'blocks' | null>(null);
  const latestGeneratedCppRef = useRef(initialCpp);

  const shellLabel = mode === 'blocks'
    ? 'IDE ELAB in modalita blocchi'
    : mode === 'dual'
      ? 'IDE ELAB in vista doppia'
      : 'IDE ELAB C++';

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // localStorage non disponibile: la sessione resta comunque utilizzabile.
    }
  }, [mode]);

  useEffect(() => {
    if (lastEditRef.current !== 'cpp') return undefined;
    const timer = window.setTimeout(() => {
      setBlocklyXml((currentXml) => syncCppToBlockly(cpp, currentXml));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [cpp]);

  useEffect(() => {
    if (lastEditRef.current !== 'blocks') return undefined;
    const timer = window.setTimeout(() => {
      setCpp(syncBlocklyToCpp(blocklyXml, latestGeneratedCppRef.current));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [blocklyXml]);

  function handleModeChange(nextMode: IdeMode) {
    setMode(nextMode);
  }

  function handleCppChange(nextCpp: string) {
    lastEditRef.current = 'cpp';
    latestGeneratedCppRef.current = nextCpp;
    setCpp(nextCpp);
    if (compileStatus.state !== 'idle') setCompileStatus({ state: 'idle' });
  }

  function handleBlocklyChange(xml: string, generatedCpp?: string) {
    lastEditRef.current = 'blocks';
    latestGeneratedCppRef.current = generatedCpp || cpp;
    setBlocklyXml(xml);
    if (compileStatus.state !== 'idle') setCompileStatus({ state: 'idle' });
  }

  return (
    <div className={styles.shell} data-testid="ide-shell" data-mode={mode} aria-label={shellLabel}>
      <header className={styles.topBar}>
        <div className={styles.brandBlock}>
          <span className={styles.brandTitle}>ELAB IDE</span>
          <span className={styles.brandSubtitle}>C++ Nano R4</span>
        </div>
        <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
        <CompileButton source={cpp} onStatusChange={setCompileStatus} />
      </header>

      <aside className={styles.palettePane} aria-label="Palette componenti">
        <div className={styles.placeholderHeader}>
          <PaletteIcon size={18} />
          <span>Palette</span>
        </div>
        <p>Area pronta per i blocchi componenti.</p>
      </aside>

      <main className={styles.centerPane}>
        <EditorPane
          mode={mode}
          cpp={cpp}
          blocklyXml={blocklyXml}
          onCppChange={handleCppChange}
          onBlocklyChange={handleBlocklyChange}
        />
      </main>

      <aside className={styles.unlimPane} aria-label="Mascotte UNLIM">
        <div className={styles.placeholderHeader}>
          <RobotIcon size={20} />
          <span>UNLIM</span>
        </div>
        <p>Slot mascotte pronto per il prossimo modulo.</p>
      </aside>

      <footer className={styles.bottomBar}>
        <StatusBar status={compileStatus} />
      </footer>
    </div>
  );
}
