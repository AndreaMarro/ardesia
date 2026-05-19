/**
 * ElabScratchModeShell — Sub-project A iter 84 atom 7 wrapper.
 *
 * Andrea spec FASE 3:
 *  - Schermata iniziale MAI vuota: StarterButtons overlay when workspace empty.
 *  - Skeleton loading durante Blockly mount (F4 gap audit 4/6 personas fail).
 *  - Progressive disclosure: starter overlay dismisses post first program load.
 *
 * Workspace lifecycle integration:
 *  - Parent (iter 84 close atom OR HomeCompileEntry.jsx) passa workspaceRef
 *    + workspaceReady boolean + onWorkspaceChange callback (Blockly events).
 *  - Shell rende children (ScratchEditor) + StarterButtons overlay when isEmpty.
 *
 * No direct Blockly import — workspace operations delegate parent via onStarterClick.
 */
import React, { useCallback, useMemo } from 'react';
import { StarterButtons } from './StarterButtons.jsx';
import styles from './ElabScratchModeShell.module.css';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children — ScratchEditor OR child wrap
 * @param {boolean} props.workspaceReady — true post Blockly inject + onWorkspaceChange ready
 * @param {number} props.workspaceBlockCount — top-block count (parent provides via Blockly events)
 * @param {(key: 'blink'|'button'|'sensor') => void} props.onStarterClick — parent loads starter XML
 * @param {boolean} [props.disableAutoStarters=false] — opt-out auto-show (iter 85+ teacher mode)
 * @param {string} [props.title='ELAB Scratch Arduino'] — heading
 */
export function ElabScratchModeShell({
  children,
  workspaceReady = false,
  workspaceBlockCount = 0,
  onStarterClick,
  disableAutoStarters = false,
  title = 'ELAB Scratch Arduino',
}) {
  const isEmpty = useMemo(
    () => workspaceReady && workspaceBlockCount <= 1, // tolerance: arduino_base alone counts as empty
    [workspaceReady, workspaceBlockCount]
  );

  const showStarters = !disableAutoStarters && isEmpty;

  const handleStarterClick = useCallback((key) => {
    if (typeof onStarterClick === 'function') {
      onStarterClick(key);
    }
  }, [onStarterClick]);

  return (
    <div className={styles.shell} data-testid="elab-scratch-mode-shell">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {!workspaceReady && (
          <span className={styles.loadingPill} role="status" aria-live="polite">
            Ragazzi, sto preparando i blocchi...
          </span>
        )}
      </div>

      <div className={styles.workspace}>
        {!workspaceReady && (
          <div className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonToolbox} />
            <div className={styles.skeletonCanvas} />
          </div>
        )}
        {children}
        {showStarters && (
          <div className={styles.starterOverlay}>
            <p className={styles.starterPrompt}>
              Ragazzi, da dove cominciamo? Scegliete un programma di partenza:
            </p>
            <StarterButtons onStarterClick={handleStarterClick} disabled={!workspaceReady} />
          </div>
        )}
      </div>
    </div>
  );
}
