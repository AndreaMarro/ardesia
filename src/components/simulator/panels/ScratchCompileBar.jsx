/**
 * ScratchCompileBar — Compile bar for Scratch mode (no code visible)
 * + ScratchErrorBoundary — Graceful fallback on Blockly crash
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 *
 * Iter 69 A3 wire-up: renders the new lavagna `CompileUploadButton` next to
 * the existing cloud "Compila & Carica" button so docenti who installed the
 * ELAB Compile Agent (iter 65 R4 + iter 66 R5 + iter 69 A2) can push the
 * sketch directly onto the physical Nano R4 from the same bar. The cloud
 * button stays as-is (graceful fallback for users without the local agent).
 */
import React, { useState, useEffect } from 'react';
import logger from '../../../utils/logger';
import { friendlyError } from '../utils/friendlyError';
import CompileUploadButton from '../../lavagna/CompileUploadButton';

// ErrorBoundary for ScratchEditor — graceful fallback on Blockly crash
// S161.4: retryKey forces full React remount on retry (cleans orphaned Blockly DOM)
// Iter 35 fix Andrea screenshot: capture error stack + componentStack for diagnosi prod
//   (era solo logger.error → in production minified niente stack utile).
//   Now stores errorMsg + stack in state, exposes diagnostic toggle.
export class ScratchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryKey: 0, errorMsg: '', errorStack: '', componentStack: '', showDiag: false };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, errorMsg: err?.message || String(err), errorStack: err?.stack || '' };
  }
  componentDidCatch(err, info) {
    logger.error('[ScratchErrorBoundary]', err, info?.componentStack);
    this.setState({ componentStack: info?.componentStack || '' });
    // Iter 35: surface to window for prod diagnostic via DevTools console
    try { if (typeof window !== 'undefined') window.__elabBlocklyError = { msg: err?.message, stack: err?.stack, componentStack: info?.componentStack, ts: Date.now() }; } catch (_) { /* ignore */ }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100%', gap: 12, padding: 24, background: 'var(--color-editor-active-bg)', color: 'var(--color-blockly-text)',
          fontFamily: "var(--font-sans)", textAlign: 'center',
        }}>
          <span style={{ fontSize: 32 }}>!</span>
          <p style={{ fontSize: 14, margin: 0 }}>Errore nell'editor blocchi.</p>
          <button
            onClick={() => this.setState(prev => ({ hasError: false, retryKey: prev.retryKey + 1, errorMsg: '', errorStack: '', componentStack: '', showDiag: false }))}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'var(--color-accent)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600,
            }}
          >Riprova</button>
          <p style={{ fontSize: 14, color: 'var(--color-muted)', margin: 0 }}>Oppure usa la tab "Arduino C++"</p>
          {/* Iter 35: diagnostic disclosure (collapsed by default) */}
          {this.state.errorMsg && (
            <details style={{ marginTop: 12, fontSize: 11, color: 'var(--color-muted)', textAlign: 'left', maxWidth: '100%', overflow: 'auto' }}>
              <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Dettagli tecnici (per Andrea)</summary>
              <pre style={{ margin: '8px 0 0', padding: 8, fontSize: 10, fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', borderRadius: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{this.state.errorMsg}{this.state.errorStack ? '\n\n' + this.state.errorStack.slice(0, 800) : ''}</pre>
            </details>
          )}
        </div>
      );
    }
    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

/* ─── S93: Compile bar for Scratch mode (no code visible) ─── */
const SCRATCH_COMPILE_MSGS = [
  '⌛ Compilazione...',
  '⌛ Controllo i blocchi...',
  '⌛ Quasi fatto...',
  '⌛ Traduco in Arduino...',
];

const ScratchCompileBar = React.memo(function ScratchCompileBar({
  onCompile, compilationStatus, compilationErrors, compilationWarnings, compilationSize,
  // iter 69 A3 optional props: when provided, render the physical-kit upload
  // button beside the cloud Compile button. Keep them OPTIONAL so callers that
  // have not yet wired board detection still render the legacy bar unchanged.
  sketchCode, port, boardId,
  onPhysicalUploadSuccess, onPhysicalUploadError,
}) {
  const [showErrors, setShowErrors] = useState(false);
  const [compileMsg, setCompileMsg] = useState(0);
  useEffect(() => { if (compilationErrors) setShowErrors(true); }, [compilationErrors]);
  useEffect(() => {
    if (compilationStatus !== 'compiling') { setCompileMsg(0); return; }
    const interval = setInterval(() => setCompileMsg(i => (i + 1) % SCRATCH_COMPILE_MSGS.length), 3000);
    return () => clearInterval(interval);
  }, [compilationStatus]);

  const isSuccess = compilationStatus === 'success' || compilationStatus === 'success-local';
  const statusColor = isSuccess ? 'var(--color-accent)'
    : compilationStatus === 'error' ? 'var(--color-vol3)'
    : compilationStatus === 'compiling' ? 'var(--color-status-compiling)' : 'var(--color-muted)';

  const localIndicator = compilationStatus === 'success-local' ? ' ⚡' : '';
  const statusText = isSuccess
    ? (compilationSize ? `✅${localIndicator} ${compilationSize.bytes}/${compilationSize.total} bytes (${compilationSize.percent}%)` : `✅ Compilazione OK${localIndicator}`)
    : compilationStatus === 'error' ? '❌ Errore'
    : compilationStatus === 'compiling' ? SCRATCH_COMPILE_MSGS[compileMsg]
    : 'Pronto';

  // iter 69 A3 — physical kit upload button is rendered only when sketchCode
  // is provided. The button itself self-disables when the local agent is
  // offline; this guard avoids mounting an interval-poller when the caller
  // hasn't opted in to physical-kit upload at all.
  const showPhysicalUpload = typeof sketchCode === 'string' && sketchCode.length > 0;

  return (
    <div style={{
      flexShrink: 0, borderTop: '1px solid var(--color-blockly-grid, #2a3040)',
      background: 'var(--color-code-header, #181825)',
    }}>
      {/* Warning panel */}
      {compilationWarnings && (
        <div style={{ padding: 'var(--space-1-5) var(--space-2-5)', borderTop: '2px solid var(--color-warning-panel-border)', background: 'var(--color-warning-panel-bg)' }}>
          <span style={{ color: 'var(--color-warning-panel-text)', fontWeight: 700, fontSize: 15 }}>{'⚠'} Avvisi</span>
          <pre style={{ margin: 'var(--space-1) 0 0', fontSize: 14, color: 'var(--color-warning-panel-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "var(--font-mono)" }}>
            {compilationWarnings}
          </pre>
        </div>
      )}
      {/* Error panel */}
      {showErrors && compilationErrors && (
        <div style={{ padding: 'var(--space-1-5) var(--space-2-5)', borderTop: '2px solid var(--color-vol3)', background: 'var(--color-error-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-vol3)', fontWeight: 700, fontSize: 15 }}>{'❌'} Errori di compilazione</span>
            <button
              onClick={() => setShowErrors(false)}
              style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: 16, padding: 0, minWidth: 56, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Chiudi pannello errori"
            >{'✕'}</button>
          </div>
          <pre style={{ margin: 'var(--space-1) 0 0', fontSize: 14, color: 'var(--color-vol3)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: "var(--font-mono)" }}>
            {friendlyError(compilationErrors)}
          </pre>
        </div>
      )}
      {/* Status + Compile button row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-2-5)' }}>
        <span style={{ flex: 1, fontSize: 14, color: statusColor, fontFamily: "var(--font-mono)" }}>
          {statusText}
        </span>
        {/* iter 69 A3 — physical kit upload (only when sketchCode prop wired) */}
        {showPhysicalUpload && (
          <CompileUploadButton
            sketchCode={sketchCode}
            port={port}
            boardId={boardId}
            onSuccess={onPhysicalUploadSuccess}
            onError={onPhysicalUploadError}
            compact
          />
        )}
        <button
          onClick={onCompile}
          disabled={compilationStatus === 'compiling'}
          style={{
            padding: '6px 16px', border: 'none', borderRadius: 4,
            background: 'var(--color-accent)', color: 'var(--color-text-inverse)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', minHeight: 44,
            opacity: compilationStatus === 'compiling' ? 0.5 : 1,
            fontFamily: "var(--font-sans)",
          }}
        >
          {compilationStatus === 'compiling' ? '⌛ Compilazione...' : '▶ Compila & Carica'}
        </button>
      </div>
    </div>
  );
});

export default ScratchCompileBar;
