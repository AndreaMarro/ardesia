/**
 * IncrementalBuildHint — Sprint Q2.E
 * Andrea Marro 2026-04-25
 *
 * Mostra delta operations per esperimenti con build_circuit.mode='incremental_from_prev'.
 * Visualizza "Da circuito {base}: {operations list}" SENZA pulire canvas.
 *
 * PRINCIPIO ZERO: linguaggio neutro nominale ("Modifica r1", non "Modifica il r1!").
 *
 * Props:
 *   incrementalDelta: { base_experiment_id, operations[{op, target, params?}] } | null
 */

import React from 'react';
import css from './IncrementalBuildHint.module.css';

const OP_NOMINAL_LABEL = {
  add: 'Aggiunta',
  remove: 'Rimozione',
  modify: 'Modifica',
};

function describeOperation(operation) {
  const label = OP_NOMINAL_LABEL[operation.op] ?? operation.op;
  const target = operation.target ?? '?';
  let detail = '';
  if (operation.params) {
    if (operation.params.value !== undefined) {
      detail = ` → valore ${operation.params.value}`;
    } else if (operation.params.type) {
      detail = ` (${operation.params.type})`;
    }
  }
  return { label, target, detail };
}

export default function IncrementalBuildHint({ incrementalDelta }) {
  if (!incrementalDelta) return null;
  const ops = incrementalDelta.operations ?? [];
  if (ops.length === 0) return null;

  return (
    <div
      className={css.hint}
      role="region"
      aria-label="Costruzione incremental — modifiche dal circuito precedente"
    >
      <header className={css.header}>
        <span className={css.label}>Costruzione incremental</span>
        <span className={css.baseRef}>
          Da: <code>{incrementalDelta.base_experiment_id ?? '—'}</code>
        </span>
        <span className={css.count}>{ops.length} operazione{ops.length === 1 ? '' : 'i'}</span>
      </header>
      <ul className={css.opList}>
        {ops.map((op, idx) => {
          const { label, target, detail } = describeOperation(op);
          return (
            <li key={idx} className={`${css.opItem} ${css[`op_${op.op}`] ?? ''}`}>
              <span className={css.opLabel}>{label}</span>
              <code className={css.opTarget}>{target}</code>
              {detail && <span className={css.opDetail}>{detail}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
