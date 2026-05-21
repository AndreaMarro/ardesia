/**
 * ElabScratchModeShell — wrapper dell'editor Blockly su #compile-home.
 *
 * iter-102 ridisegno (Andrea "tutta la composizione... non ha senso"):
 *  - Rimosso l'header blu ridondante "ELAB Scratch Arduino" — la pagina ha
 *    già il suo titolo + il tab "Blocchi": era la terza intestazione uguale.
 *  - Gli starter NON sono più un overlay opaco sopra la canvas Blockly
 *    (causava la composizione confusa, toolbox sbiadita dietro): ora una
 *    striscia pulita SOPRA l'editor, visibile solo a workspace vuoto, che
 *    sparisce al primo blocco.
 *  - La canvas Blockly + la toolbox restano sempre pulite e leggibili.
 *
 * Workspace lifecycle: il parent passa workspaceReady + workspaceBlockCount
 * (da eventi Blockly) + onStarterClick (carica lo starter XML).
 */
import React, { useCallback, useMemo } from 'react';
import { StarterButtons } from './StarterButtons.jsx';
import styles from './ElabScratchModeShell.module.css';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children — ScratchEditor (Blockly)
 * @param {boolean} props.workspaceReady — true post Blockly inject
 * @param {number} props.workspaceBlockCount — top-block count (eventi Blockly)
 * @param {(key: 'blink'|'button'|'sensor') => void} props.onStarterClick
 * @param {boolean} [props.disableAutoStarters=false] — opt-out striscia starter
 */
export function ElabScratchModeShell({
  children,
  workspaceReady = false,
  workspaceBlockCount = 0,
  onStarterClick,
  disableAutoStarters = false,
}) {
  const isEmpty = useMemo(
    () => workspaceReady && workspaceBlockCount <= 1, // arduino_base da solo = vuoto
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
      {showStarters && (
        <div className={styles.starterStrip}>
          <p className={styles.starterPrompt}>
            Ragazzi, da dove cominciamo? Partite da un programma pronto qui sotto,
            oppure trascinate i blocchi dalla cassetta colorata.
          </p>
          <StarterButtons onStarterClick={handleStarterClick} disabled={!workspaceReady} />
        </div>
      )}

      <div className={styles.workspace}>
        {!workspaceReady && (
          <div className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonToolbox} />
            <div className={styles.skeletonCanvas} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
