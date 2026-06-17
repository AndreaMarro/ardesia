/**
 * Iter 95 SP3 T2 — Virtual Serial Monitor UI panel
 *
 * Renders predicted Serial.* output from user C++ Arduino sketch.
 * Consumes interpretSerialOutput(cppCode) from src/services/virtualSerialInterpreter.js
 *
 * Andrea iter 94 PM mandate verbatim:
 *   "Monitor Seriale Virtuale
 *    [setup] ELAB Nano R4 pronto
 *    [loop 1] LED acceso
 *    [+1000 ms] LED spento
 *    Con nota chiara: Questa è la seriale prevista dal programma.
 *    Per leggere la seriale reale collega una Nano R4 via USB."
 *
 * Disclaimer mandatory when boardConnected===false (default). Board-detected
 * label shown when boardConnected===true MA NO claim "seriale reale letta"
 * (real serial reading is separate iter 96+ scope).
 *
 * Props:
 *   cppCode: string — user C++ source code
 *   boardConnected: boolean — Nano R4 USB detected (default false)
 *   maxIterations: number — loop() simulation count (default 10)
 *
 * © Andrea Marro — iter 95 SP3 T2 — 2026-05-19
 */
// iter 95 SP3 T2 follow-up (code-reviewer HIGH-2): useDeferredValue debounce
// to avoid per-keystroke parser re-run on iPad LIM. Defers cppCode update
// allowing React to prioritize input responsiveness over predicted-output panel.
import React, { useMemo, useDeferredValue } from 'react';
import { interpretSerialOutput } from '../../../services/virtualSerialInterpreter';
import css from './VirtualSerialMonitor.module.css';
import { LetterIcon, SearchIcon, WarningIcon } from '../../common/ElabIcons';

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTimestamp(ms) {
  if (ms === 0) return '0 ms';
  if (ms < 1000) return `${ms} ms`;
  const s = Math.floor(ms / 1000);
  const remMs = ms % 1000;
  if (remMs === 0) return `${s}s`;
  return `${s}s${pad2(Math.floor(remMs / 10))}`;
}

export default function VirtualSerialMonitor({
  cppCode,
  boardConnected = false,
  maxIterations = 10,
}) {
  // HIGH-2 fix: useDeferredValue debounces cppCode parsing across keystrokes.
  // useMemo invalidates only on deferredCode change → less CPU tax on iPad LIM.
  const deferredCode = useDeferredValue(cppCode);
  const result = useMemo(
    () => interpretSerialOutput(deferredCode, { maxIterations }),
    [deferredCode, maxIterations]
  );

  const { baudRate, setupOutput, loopOutput, warnings } = result;
  const hasInput = cppCode && typeof cppCode === 'string' && cppCode.trim().length > 0;
  const hasSerial = setupOutput.length > 0 || loopOutput.length > 0;

  return (
    <section className={css.monitor} aria-label="Monitor Seriale Virtuale">
      <header className={css.header}>
        <h3 className={css.title}>Monitor Seriale Virtuale</h3>
        {baudRate && (
          <span className={css.baudRate} aria-label={`Baud rate ${baudRate}`}>
            {baudRate} baud
          </span>
        )}
        {boardConnected ? (
          <span className={`${css.boardStatus} ${css.boardConnected}`}>
            Nano R4 rilevata
          </span>
        ) : (
          <span className={`${css.boardStatus} ${css.boardDisconnected}`}>
            Nano R4 non collegata
          </span>
        )}
      </header>

      <div className={css.outputArea} role="log" aria-live="polite">
        {!hasInput && (
          <div className={css.emptyState}>
            <span className={css.emptyStateIcon} aria-hidden="true"><LetterIcon size={36} /></span>
            <p className={css.emptyStateText}>Nessun codice da analizzare</p>
          </div>
        )}

        {hasInput && !hasSerial && (
          <div className={css.emptyState}>
            <span className={css.emptyStateIcon} aria-hidden="true"><SearchIcon size={36} /></span>
            <p className={css.emptyStateText}>
              Nessuna istruzione seriale rilevata.
              <br />
              Aggiungi <code>Serial.begin(9600)</code> e{' '}
              <code>Serial.println("...")</code> per vedere l'output.
            </p>
          </div>
        )}

        {hasInput && hasSerial && (
          <>
            {setupOutput.length > 0 && (
              <>
                <div className={css.sectionLabel}>setup() — esecuzione una volta</div>
                {setupOutput.map((line, idx) => (
                  <div key={`setup-${idx}`} className={css.outputLine}>
                    <span className={css.outputLabel}>[setup]</span>
                    <span className={css.outputTimestamp}>0 ms</span>
                    <span className={css.outputText}>{line}</span>
                  </div>
                ))}
              </>
            )}

            {loopOutput.length > 0 && (
              <>
                <div className={css.sectionLabel}>loop() — esecuzione ripetuta</div>
                {loopOutput.map((iter) => (
                  <React.Fragment key={`iter-${iter.iteration}`}>
                    {iter.lines.map((line, lineIdx) => (
                      <div key={`iter-${iter.iteration}-line-${lineIdx}`} className={css.outputLine}>
                        <span className={css.outputLabel}>[loop {iter.iteration}]</span>
                        <span className={css.outputTimestamp}>
                          {formatTimestamp(iter.timestamps[lineIdx] || 0)}
                        </span>
                        <span className={css.outputText}>{line}</span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {warnings && warnings.length > 0 && warnings[0] !== 'empty input' && (
        <div className={css.warnings} role="alert">
          {warnings.map((w, i) => (
            <div key={`warn-${i}`} className={css.warningItem}>
              <WarningIcon size={14} />{w}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer mandatory Andrea iter 94 PM. NOT <footer> element to avoid
          DOM semantics collision with parent page <footer>. role="note" + aria.
          HIGH-3 fix (code-reviewer): conditional CTA text based on boardConnected.
          When board IS connected, "collega Nano R4 via USB" contraddiceva green
          badge. Rewrite CTA mantenendo "Seriale prevista" framing (panel ALWAYS
          predicted, real serial reading is separate iter 96+ scope). */}
      <div className={css.disclaimer} role="note" aria-label="Avviso seriale virtuale">
        <span className={css.disclaimerIcon} aria-hidden="true">ⓘ</span>
        <p className={css.disclaimerText}>
          <strong>Seriale prevista dal programma.</strong>{' '}
          {boardConnected
            ? 'Per leggere la seriale reale aprite il Monitor Seriale del kit (iter 96).'
            : 'Per leggere la seriale reale collega una Nano R4 via USB.'}
        </p>
      </div>
    </section>
  );
}
