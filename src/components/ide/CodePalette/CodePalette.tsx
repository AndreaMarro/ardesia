import React, { useMemo, useState } from 'react';
import {
  PALETTE_ACTIONS,
  PALETTE_CATEGORIES,
  type PaletteAction,
} from './paletteActions';
import { setPaletteDragData } from './DragDropHandler';
import styles from './CodePalette.module.css';

type CodePaletteProps = {
  onInsertSnippet?: (snippet: string) => void;
};

function emitInsertSnippet(snippet: string) {
  window.dispatchEvent(new CustomEvent('elab:insert-palette-snippet', {
    detail: { snippet },
  }));
}

export default function CodePalette({ onInsertSnippet }: CodePaletteProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const groupedActions = useMemo(() => {
    return PALETTE_CATEGORIES
      .map((category) => ({
        category,
        actions: PALETTE_ACTIONS.filter((action) => action.category === category),
      }))
      .filter((group) => group.actions.length > 0);
  }, []);

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, action: PaletteAction) {
    setDraggingId(action.id);
    setPaletteDragData(event, action.snippet);
  }

  function handleInsert(action: PaletteAction) {
    onInsertSnippet?.(action.snippet);
    emitInsertSnippet(action.snippet);
  }

  return (
    <aside className={styles.palette} aria-label="Palette azioni Arduino">
      <div className={styles.header}>
        <span className={styles.title}>Azioni Arduino</span>
        <span className={styles.subtitle}>Trascina nel codice o tocca per inserire.</span>
      </div>

      <div className={styles.groups}>
        {groupedActions.map((group) => (
          <section className={styles.group} key={group.category} aria-label={group.category}>
            <span className={styles.category}>{group.category}</span>
            {group.actions.map((action) => (
              <button
                className={styles.action}
                data-action-id={action.id}
                data-dragging={draggingId === action.id ? 'true' : undefined}
                draggable
                key={action.id}
                onClick={() => handleInsert(action)}
                onDragEnd={() => setDraggingId(null)}
                onDragStart={(event) => handleDragStart(event, action)}
                type="button"
              >
                <span className={styles.label}>{action.label}</span>
                <span className={styles.description}>{action.description}</span>
                <code className={styles.preview}>{action.preview}</code>
              </button>
            ))}
          </section>
        ))}
      </div>
    </aside>
  );
}
