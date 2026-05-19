import React, { Suspense, lazy } from 'react';
import CodeEditorCM6 from '../simulator/panels/CodeEditorCM6';
import type { IdeMode } from './ModeSwitcher';
import styles from './IdeShell.module.css';

const ScratchEditor = lazy(() => import('../simulator/panels/ScratchEditor'));

type EditorPaneProps = {
  mode: IdeMode;
  cpp: string;
  blocklyXml: string;
  onCppChange: (source: string) => void;
  onBlocklyChange: (xml: string, generatedCpp?: string) => void;
};

function BlocklyPane({ blocklyXml, onBlocklyChange }: Pick<EditorPaneProps, 'blocklyXml' | 'onBlocklyChange'>) {
  return (
    <div className={styles.blocklyPane} data-testid="blockly-slot">
      <Suspense fallback={<div className={styles.blocklyFallback}>Preparazione blocchi...</div>}>
        <ScratchEditor initialCode={blocklyXml} onChange={onBlocklyChange} />
      </Suspense>
    </div>
  );
}

function CppPane({ cpp, onCppChange }: Pick<EditorPaneProps, 'cpp' | 'onCppChange'>) {
  return (
    <div className={styles.cppPane}>
      <CodeEditorCM6
        code={cpp}
        onChange={onCppChange}
        language="cpp"
        title="C++ Nano R4"
        hideFooter
      />
    </div>
  );
}

export default function EditorPane({ mode, cpp, blocklyXml, onCppChange, onBlocklyChange }: EditorPaneProps) {
  return (
    <section className={styles.editorPane} data-testid="editor-pane" data-mode={mode} aria-label="Editor progetto">
      {mode === 'cpp' && <CppPane cpp={cpp} onCppChange={onCppChange} />}
      {mode === 'blocks' && <BlocklyPane blocklyXml={blocklyXml} onBlocklyChange={onBlocklyChange} />}
      {mode === 'dual' && (
        <div className={styles.dualSplit}>
          <BlocklyPane blocklyXml={blocklyXml} onBlocklyChange={onBlocklyChange} />
          <CppPane cpp={cpp} onCppChange={onCppChange} />
        </div>
      )}
    </section>
  );
}
