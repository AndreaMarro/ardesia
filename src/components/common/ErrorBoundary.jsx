import React from 'react';
import i18n from '../../i18n';
import logger from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Minimal logging to help debug production crashes (no PII by default)
    try {
      // eslint-disable-next-line no-console
      logger.error('[ELAB] Unhandled UI error:', error);
    } catch {}

    try {
      const payload = {
        ts: Date.now(),
        href: typeof window !== 'undefined' ? window.location.href : null,
        message: error?.message || String(error),
        stack: error?.stack || null,
        componentStack: errorInfo?.componentStack || null,
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      };
      if (typeof window !== 'undefined') {
        window.__ELAB_LAST_ERROR__ = payload;
        try {
          sessionStorage.setItem('elab_last_error', JSON.stringify(payload));
        } catch {}
      }
    } catch {}

    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const info = this.state.errorInfo;
      const detailsText = [
        `Message: ${err?.message || String(err)}`,
        '',
        err?.stack ? `Stack:\n${err.stack}` : null,
        info?.componentStack ? `\nComponent stack:\n${info.componentStack}` : null,
      ].filter(Boolean).join('\n');

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: 'var(--elab-hex-fff8e7)', fontFamily: 'Open Sans, sans-serif',
          padding: '40px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--elab-navy)', marginBottom: '24px' }}>ELAB</div>
          <h1 style={{ color: 'var(--elab-navy)', fontSize: '28px', marginBottom: '16px', fontFamily: 'Oswald, sans-serif' }}>
            {i18n.t('errors.boundary_title')}
          </h1>
          <p style={{ color: '#555', fontSize: '18px', marginBottom: '24px', maxWidth: '500px' }}>
            {i18n.t('errors.boundary_body')}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--elab-navy)', color: 'white', border: 'none', padding: '14px 32px',
                borderRadius: '8px', fontSize: '18px', cursor: 'pointer', minHeight: '44px'
              }}
            >
              {i18n.t('errors.boundary_reload')}
            </button>
            {/* iter 45 fix Andrea video2 06/05/2026 B8 "spesso accade un errore... ricarico
                la pagina e non va. Se invece utilizzo Berkeley va subito": ricarica
                semplice non basta perché Service Worker continua servire chunk stale.
                Pulsante hard-reset: unregister TUTTI gli SW + clearStorages caches +
                reload. Risolve regressione cache cross-deploy. */}
            <button
              onClick={async () => {
                try {
                  if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map(r => r.unregister().catch(() => null)));
                  }
                  if (typeof caches !== 'undefined') {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(k => caches.delete(k).catch(() => null)));
                  }
                } catch { /* best-effort */ }
                // Hard reload bypassing cache
                try { window.location.replace(window.location.pathname + '?v=' + Date.now()); }
                catch { window.location.reload(); }
              }}
              style={{
                background: 'var(--elab-orange, #E8941C)', color: 'white', border: 'none', padding: '14px 24px',
                borderRadius: '8px', fontSize: '16px', cursor: 'pointer', minHeight: '44px',
              }}
              title={i18n.t('errors.boundary_clear_cache_title')}
            >
              {i18n.t('errors.boundary_clear_cache')}
            </button>
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => this.setState(s => ({ ...s, showDetails: !s.showDetails }))}
              style={{
                background: 'transparent',
                color: 'var(--elab-navy)',
                border: '1px solid rgba(30,77,140,0.35)',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {this.state.showDetails ? i18n.t('errors.boundary_hide_details') : i18n.t('errors.boundary_show_details')}
            </button>

            {this.state.showDetails && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard?.writeText(detailsText);
                  } catch {
                    // no-op
                  }
                }}
                style={{
                  background: 'var(--elab-hex-ffffff)',
                  color: '#111',
                  border: '1px solid rgba(0,0,0,0.12)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {i18n.t('errors.boundary_copy_details')}
              </button>
            )}
          </div>

          {this.state.showDetails && (
            <pre style={{
              marginTop: 14,
              padding: 14,
              width: '100%',
              maxWidth: 920,
              textAlign: 'left',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 10,
              overflow: 'auto',
              fontSize: 14,
              lineHeight: 1.45,
              color: '#111',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              whiteSpace: 'pre-wrap'
            }}>
              {detailsText}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
