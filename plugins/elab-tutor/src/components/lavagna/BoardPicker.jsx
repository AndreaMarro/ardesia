/**
 * BoardPicker — Compact dropdown for selecting target Arduino board.
 *
 * Lists all boards from services/arduinoBoards.js. Emits boardId on change.
 * Used by the simulator to choose which target gets compiled + uploaded.
 *
 * @copyright © Andrea Marro — 2026-05-27 — ELAB Tutor
 */
import React from 'react';
import { BOARDS } from '../../services/arduinoBoards.js';

const styles = {
  wrap: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 220,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    fontSize: 14,
    fontFamily: 'inherit',
    border: '1px solid rgba(124, 179, 66, 0.4)',
    borderRadius: 8,
    background: '#FFFFFF',
    color: '#1A1A1A',
    cursor: 'pointer',
    minHeight: 36,
  },
};

export default function BoardPicker({ boardId, onChange, hint }) {
  return (
    <div style={styles.wrap}>
      <label style={styles.label} htmlFor="elab-board-picker">
        {hint || 'Scheda Arduino'}
      </label>
      <select
        id="elab-board-picker"
        value={boardId || ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={styles.select}
        data-testid="board-picker"
      >
        {BOARDS.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
          </option>
        ))}
      </select>
    </div>
  );
}
