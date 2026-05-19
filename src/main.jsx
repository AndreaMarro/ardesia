// ELAB Tutor - © Andrea Marro — 08/02/2026
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer'
import App from './App.jsx'
import { initCodeProtection } from './utils/codeProtection.js'
import studentTracker from './services/studentTracker.js'
import './index.css'
import './styles/design-system.css'
import './styles/accessibility-fixes.css'  // WCAG 2.1 AA — DO NOT REMOVE

import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";
import "mobile-drag-drop/default.css";

// Polyfill Buffer for @react-pdf/renderer
window.Buffer = Buffer

// Polyfill mobile drag and drop for touch devices
polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride
});
window.addEventListener('touchmove', function () { }, { passive: false });

// Handle chunk loading errors after deploy (Credit: Tea PR #73)
// When cached HTML references old chunk hashes, reload once
window.addEventListener('vite:preloadError', (event) => {
  const reloaded = sessionStorage.getItem('elab-chunk-reload');
  if (!reloaded) {
    sessionStorage.setItem('elab-chunk-reload', '1');
    window.location.reload();
  }
  event.preventDefault();
});

// P0 hotfix (2026-04-22 fix/p0-pwa-stale-precache):
// When a new service worker activates after a deploy and claims this tab
// (see vite.config.js workbox.clientsClaim), the `controllerchange` event
// fires. Reload once so the tab refetches the fresh index.html instead of
// continuing to render under the previous SW's precached HTML.
//
// Critical guard: only reload on SW *updates*, never on first install.
// On a fresh browser profile there is no controller at module load; when
// the first SW activates and claims the page, `controllerchange` fires
// exactly once. Without the `hadController` check we would force every
// brand-new user through an extra reload (caught in tests/e2e/12-stress-
// insegnante-impreparato.spec.js:322 as a spurious pageerror).
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return; // first install — nothing to replace, nothing to reload
    if (sessionStorage.getItem('elab-sw-reload') === '1') return;
    sessionStorage.setItem('elab-sw-reload', '1');
    window.location.reload();
  });
}

// Anti-tampering (solo produzione)
initCodeProtection()

// Student activity tracker — persiste dati reali in localStorage
studentTracker.init()

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
)
