// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * ELAB Code Protection — Runtime anti-tampering
 * (c) Andrea Marro — Solo produzione
 *
 * Key blocking (F12, Ctrl+U, Ctrl+Shift+I/J/C)
 * Right-click + drag-select blocking
 * CSS anti-select for protected areas
 *
 * NOTE: DevTools size detection, debugger timing, console override detection
 * are ALL REMOVED. They conflict with the obfuscator's own protection
 * (disableConsoleOutput, debugProtection, selfDefending) causing false
 * positives that nuke the page and crash React.
 * The obfuscator provides: RC4 string encryption, control flow flattening,
 * dead code injection, domain lock, debug protection — sufficient protection.
 *
 * NON attivo in development per non bloccare il debug
 */

const IS_PROD = import.meta.env.PROD

// ─── KEY BLOCKING ─────────────────────────────────────────
function _blockKeys(e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.ctrlKey && e.key === 'u') ||
    (e.ctrlKey && e.key === 'U') ||
    (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
    (e.metaKey && e.key === 'u') ||
    (e.metaKey && e.key === 'U')
  ) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

function _blockContextMenu(e) {
  e.preventDefault()
  return false
}

function _blockDragSelect(e) {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
    e.preventDefault()
  }
}

// ─── ASCII ART CONSOLE NOTICE ────────────────────────────
function _showConsoleNotice() {
  const art = [
    '%c╔══════════════════════════════════════════════════════╗',
    '║                                                      ║',
    '║   ███████╗██╗      █████╗ ██████╗                    ║',
    '║   ██╔════╝██║     ██╔══██╗██╔══██╗                   ║',
    '║   █████╗  ██║     ███████║██████╔╝                   ║',
    '║   ██╔══╝  ██║     ██╔══██║██╔══██╗                   ║',
    '║   ███████╗███████╗██║  ██║██████╔╝                   ║',
    '║   ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝                   ║',
    '║                                                      ║',
    '║   ELAB Tutor — Simulatore Circuiti Educativo         ║',
    '║   Copyright (c) 2025-2026 Andrea Marro               ║',
    '║   Tutti i diritti riservati.                         ║',
    '║                                                      ║',
    '║   Questo software è protetto da copyright.           ║',
    '║   La copia, la modifica, la decompilazione e la      ║',
    '║   distribuzione non autorizzata sono VIETATE          ║',
    '║   ai sensi della L. 633/1941 e del D.Lgs 518/1992.  ║',
    '║                                                      ║',
    '║   Qualsiasi uso non autorizzato sarà perseguito.     ║',
    '║                                                      ║',
    '╚══════════════════════════════════════════════════════╝'
  ].join('\n')
  try { console.log(art, 'color:#1E4D8C;font-family:monospace;font-size:11px;') } catch (_) {}
}

// ─── RUNTIME DOMAIN CHECK (supplementary to obfuscator domainLock) ──
const ALLOWED_HOSTS = [
  'localhost',
  '127.0.0.1',
  'elabtutor.school',
  'www.elabtutor.school',
  'elab-builder.vercel.app',
]
function _checkDomain() {
  try {
    const h = window.location.hostname
    if (!h || ALLOWED_HOSTS.some(d => h === d || h.endsWith('.' + d) || h.endsWith('.vercel.app'))) return
    // Silent degradation: throttle simulation loop
    const _raf = window.requestAnimationFrame
    let count = 0
    window.requestAnimationFrame = function(cb) {
      count++
      if (count % 4 !== 0) return _raf.call(window, () => {})
      return _raf.call(window, cb)
    }
  } catch (_) {}
}

// ─── INIT ─────────────────────────────────────────────────
export function initCodeProtection() {
  if (!IS_PROD) return

  // Key blocking
  document.addEventListener('keydown', _blockKeys, true)
  document.addEventListener('contextmenu', _blockContextMenu, true)
  document.addEventListener('selectstart', _blockDragSelect, true)

  // CSS anti-select for protected areas
  const style = document.createElement('style')
  style.textContent = [
    '.elab-protected, .simulator-canvas, .code-editor-panel,',
    '.experiment-data, .circuit-solver, [data-protected] {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  -ms-user-select: none !important;',
    '  user-select: none !important;',
    '  -webkit-touch-callout: none !important;',
    '}',
    'input, textarea, [contenteditable="true"] {',
    '  -webkit-user-select: text !important;',
    '  user-select: text !important;',
    '}'
  ].join('\n')
  document.head.appendChild(style)

  // ASCII Art console notice
  _showConsoleNotice()

  // Runtime domain check (silent degradation)
  _checkDomain()
}
