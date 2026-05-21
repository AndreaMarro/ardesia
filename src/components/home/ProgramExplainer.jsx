/**
 * src/components/home/ProgramExplainer.jsx
 *
 * iter 88 UX-7 — empty-state explainer card on HomePage cross-compile entry.
 *
 * Renders a collapsible "Cosa fa questo programma?" panel above the
 * editor surface. iter-102 (Andrea "allarga l'editor"): default COLLAPSED
 * so the Blockly editor gets the vertical room it needs — the expanded
 * panel ate ~210px and squeezed the editor to ~258px. The panel is one
 * click away; the docente's expand/collapse choice persists in
 * localStorage ('true'/'false') across visits.
 *
 * Spec contract per docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md §88.UX-7:
 *   - Collapsed: button label "Cosa fa questo programma?" + chevron down
 *   - Expanded:  3-4 sentences plurale "Ragazzi, questo programma..."
 *   - templateKey prop drives content from EXPLAINERS map (default blink-led)
 *   - localStorage key 'elab.compile.explainer.collapsed' (string 'true' only)
 *   - ARIA: button[aria-expanded][aria-controls] + section[role=region]
 *   - PRINCIPIO ZERO plurale "Ragazzi," verbatim in body (regola 14)
 *   - NO emoji (inline chevron SVG only)
 *
 * Component NOT wired into HomeCompileEntry here per atom-ownership split
 * (parallel UX-3 subagent owns HomeCompileEntry.jsx). Orchestrator iter 88
 * P0.11+ wires <ProgramExplainer /> below editorPanel.
 *
 * @copyright © Andrea Marro — 2026-05-18 — ELAB Tutor iter 88 UX-7
 */

import React, { useCallback, useEffect, useState } from 'react';
import styles from './ProgramExplainer.module.css';

const STORAGE_KEY = 'elab.compile.explainer.collapsed';

/**
 * Per-template explainer copy. Each entry is a stable docente-facing
 * description PLURALE that opens with "Ragazzi," + cites the volume/page
 * the program lives on inside the kit fisico ELAB.
 *
 * Tested by ProgramExplainer.test.jsx T5 (default vs override).
 * Iter 89+ can extend with `read-pir`, `servo-sweep` etc as Vol3 capstones
 * gain dedicated starter sketches.
 *
 * @type {Record<string,{title:string,body:string}>}
 */
const EXPLAINERS = Object.freeze({
  'blink-led': {
    title: 'Programma "LED che lampeggia"',
    body:
      'Ragazzi, questo programma accende e spegne il LED collegato al pin 13 ogni '
      + 'mezzo secondo. Lo trovate nel Volume 3 Capitolo 6 Esperimento 1 a pagina '
      + '72. Sul kit ELAB il LED rosso e gia montato sulla scheda Nano R4 fisica, '
      + 'quindi appena caricate il programma vedrete il LED che lampeggia.',
  },
  'read-button': {
    title: 'Programma "Leggi il pulsante"',
    body:
      'Ragazzi, questo programma legge lo stato di un pulsante collegato al pin 2 '
      + 'e accende il LED del pin 13 solo mentre lo tenete premuto. Lo trovate nel '
      + 'Volume 3 Capitolo 6 Esperimento 2 a pagina 78. Sul kit ELAB montate il '
      + 'pulsante sulla breadboard con il resistore di pull-down come nello schema.',
  },
  'read-sensor': {
    title: 'Programma "Leggi il sensore"',
    body:
      'Ragazzi, questo programma legge un sensore analogico (per esempio un '
      + 'potenziometro) collegato al pin A0 e stampa il valore sul Monitor Seriale. '
      + 'Lo trovate nel Volume 3 Capitolo 7 Esperimento 1 a pagina 95. Sul kit '
      + 'ELAB usate il potenziometro fornito e leggete i valori da 0 a 1023.',
  },
});

/**
 * Decorative chevron icon — collapsed renders down (▾), expanded renders
 * up (▴). Pure SVG, no ElabIcons import (ChevronIcon non disponibile in
 * iter 88 ElabIcons.jsx — verificato grep).
 */
function ChevronInline({ expanded }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-testid="program-explainer-chevron"
      style={{
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 180ms ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Read initial collapsed flag from localStorage. iter-102: default COLLAPSED
 * (true) — the panel only stays open when the docente explicitly expanded it
 * (stored 'false'). SAFE on SSR/test envs where window/localStorage absent.
 */
function readInitialCollapsed() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

/**
 * @param {object} props
 * @param {string} [props.templateKey='blink-led']
 */
export default function ProgramExplainer({ templateKey = 'blink-led' }) {
  const [collapsed, setCollapsed] = useState(readInitialCollapsed);

  // iter-102: persist BOTH states. Default is collapsed, so an explicit
  // 'false' is required to remember the docente chose to keep it open.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false');
    } catch {
      /* defensive — localStorage may throw in private mode */
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((prev) => !prev), []);

  const explainer = EXPLAINERS[templateKey] || EXPLAINERS['blink-led'];
  const sectionId = `elab-explainer-${templateKey}`;
  const expanded = !collapsed;

  return (
    <div className={styles.root} data-elab-component="program-explainer">
      <button
        type="button"
        className={styles.toggleBtn}
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={sectionId}
        data-testid="program-explainer-toggle"
      >
        <span className={styles.toggleLabel}>
          Cosa fa questo programma?
        </span>
        <ChevronInline expanded={expanded} />
      </button>
      {expanded && (
        <section
          id={sectionId}
          role="region"
          aria-label="Spiegazione del programma corrente"
          className={styles.body}
          data-testid="program-explainer-body"
        >
          <h3 className={styles.title} data-testid="program-explainer-title">
            {explainer.title}
          </h3>
          <p className={styles.text}>
            {explainer.body}
          </p>
        </section>
      )}
    </div>
  );
}
