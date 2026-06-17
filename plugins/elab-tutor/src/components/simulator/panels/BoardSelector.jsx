import React, { useState, useEffect, useRef } from 'react';

/**
 * BoardSelector — iter 60 Phase 1 R1 scaffold (Andrea ratify Q1-Q3 pending).
 *
 * Status: SCAFFOLD — disabled by default until Andrea ratifies:
 *   Q1: default board iter 59 (AVR Nano classic vs Nano R4)
 *   Q2: n8n server `arduino-cli core install arduino:renesas_uno` PREREQ
 *   Q3: UNO R4 variant (WiFi vs Minima vs both)
 *
 * Compliance:
 *   - CLAUDE.md rule 9: touch target ≥44x44px (radio + label hit area)
 *   - CLAUDE.md rule 11: NO emoji icons (text-only label, ElabIcons opt-in iter 61)
 *   - CLAUDE.md rule 16: palette Navy #1E4D8C / Lime #4A7A25 (CSS var fallback)
 *   - CLAUDE.md rule 17: Open Sans body / Oswald title
 *   - WCAG AA: 4.5:1 contrast Navy on white verified; aria-checked + radiogroup semantics
 *   - Morfismo Sense 1.5: localStorage key `elab-compile-board` per-docente persistence
 *
 * See: docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md R1
 * See: docs/adrs/ADR-032-blockly-nano-r4-cross-compile-board-param.md (DRAFT)
 *
 * @param {Object} props
 * @param {string} props.value Currently selected board FQBN
 * @param {(fqbn: string) => void} props.onChange Board change handler
 * @param {Array<{fqbn: string, label: string}>} props.availableBoards Allowlist
 * @param {boolean} [props.disabled=true] Disabled until ratify (default safe)
 */
export function BoardSelector({ value, onChange, availableBoards = [], disabled = true }) {
  const [internalValue, setInternalValue] = useState(value || '');
  const radioRefs = useRef([]);

  // Load persisted board from localStorage on mount (Morfismo Sense 1.5 per-docente).
  useEffect(() => {
    try {
      const stored = localStorage.getItem('elab-compile-board');
      if (stored && availableBoards.some((b) => b.fqbn === stored)) {
        setInternalValue(stored);
        if (typeof onChange === 'function' && stored !== value) {
          onChange(stored);
        }
      }
    } catch (err) {
      // localStorage unavailable (private mode / SSR) — silent fallback.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (fqbn) => {
    if (disabled) return;
    setInternalValue(fqbn);
    try {
      localStorage.setItem('elab-compile-board', fqbn);
    } catch (err) {
      // silent fallback
    }
    if (typeof onChange === 'function') onChange(fqbn);
  };

  // Keyboard arrow navigation (WCAG 2.1.1 + ARIA radiogroup pattern).
  const handleKeyDown = (e, idx) => {
    if (disabled) return;
    const total = availableBoards.length;
    if (total === 0) return;
    let nextIdx = idx;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIdx = (idx + 1) % total;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIdx = (idx - 1 + total) % total;
    } else {
      return;
    }
    e.preventDefault();
    const nextBoard = availableBoards[nextIdx];
    handleSelect(nextBoard.fqbn);
    if (radioRefs.current[nextIdx]) radioRefs.current[nextIdx].focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Seleziona scheda Arduino"
      aria-disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        border: `1px solid var(--elab-navy, #1E4D8C)`,
        borderRadius: 8,
        background: '#FFFFFF',
        fontFamily: 'var(--elab-font-body, "Open Sans", system-ui, sans-serif)',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--elab-font-title, "Oswald", system-ui, sans-serif)',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--elab-navy, #1E4D8C)',
          marginBottom: 4,
        }}
      >
        Scheda Arduino {disabled ? '(in attesa di abilitazione)' : ''}
      </div>
      {availableBoards.map((board, idx) => {
        const checked = internalValue === board.fqbn;
        return (
          <label
            key={board.fqbn}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minHeight: 44,
              minWidth: 44,
              padding: '6px 8px',
              borderRadius: 6,
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: checked ? 'rgba(74, 122, 37, 0.10)' : 'transparent',
              border: checked
                ? `2px solid var(--elab-lime, #4A7A25)`
                : '2px solid transparent',
              fontSize: 14,
              color: 'var(--elab-navy, #1E4D8C)',
            }}
          >
            <input
              ref={(el) => (radioRefs.current[idx] = el)}
              type="radio"
              name="elab-board-selector"
              value={board.fqbn}
              checked={checked}
              disabled={disabled}
              onChange={() => handleSelect(board.fqbn)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              aria-checked={checked}
              style={{ width: 20, height: 20, accentColor: 'var(--elab-lime, #4A7A25)' }}
            />
            <span>{board.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default BoardSelector;
