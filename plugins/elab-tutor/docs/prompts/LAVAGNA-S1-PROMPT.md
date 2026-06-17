# SESSIONE LAVAGNA 1/8 — AppShell + Header + FloatingWindow + Route

## Stato Ereditato
Score pre-lavagna: 7.2/10 (media aree da S4 V2)
Bug P0 aperti: nessuno
File in src/components/lavagna/: NESSUNO (prima sessione)

## PRIMA DI TUTTO
Leggi COMPLETAMENTE questi file prima di qualsiasi azione:
1. `CLAUDE.md`
2. `docs/plans/2026-04-01-lavagna-redesign.md` — il design document completo
3. `docs/plans/2026-04-01-lavagna-master-plan.md` — il piano master con benchmark
4. `npm run build && npx vitest run` — DEVE passare
5. `/elab-quality-gate pre`
6. `/lavagna-benchmark 1/3` — baseline (tutto N/A, ma F1-F5 devono essere PASS)
7. Cattura screenshot BASELINE di #tutor (salvare mentalmente — ogni audit confrontera con questo)

## REGOLE ESECUZIONE
- PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
- BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
- TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
- PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D, Muted #737373
- FONT: Oswald (display), Open Sans (body), Fira Code (mono)
- ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js
- UNLIM INTOCCABILE: 11 file, 2430 LOC — solo wrappare, mai modificare
- ZERO REGRESSIONI: #tutor IDENTICO in ogni momento. Verificare con screenshot.
- STRANGLER FIG: tutti i file nuovi in src/components/lavagna/
- TOUCH FIRST: pointer events, min 48px target
- CSS MODULES per tutto il nuovo codice
- ZERO EMOJI: usa ElabIcons.jsx SVG

## SKILL DA USARE
```
/elab-quality-gate          — prima, meta, fine
/lavagna-benchmark          — 1/3, 1/2, fine (15 metriche)
/verification-before-completion — prima di ogni commit
/simplify                   — dopo ogni implementazione
/systematic-debugging       — dopo OGNI test failure
/frontend-design            — per ogni componente UI nuovo
/design:accessibility-review — per ogni cambio a11y
/design:design-critique     — review design componenti
```

## TOOL DA USARE
```
preview_start + preview_screenshot  — verifiche visive frequenti
preview_resize                      — test LIM 1024x768
preview_console_logs                — check errori
preview_inspect                     — verificare dimensioni touch target
Playwright (browser_snapshot, browser_click) — test interazioni
Control Chrome (se serve)           — test nel browser reale
```

## 13 TASK (dal master plan, Sessione 1)

### Task 1: Creare directory + route #lavagna in App.jsx
- mkdir src/components/lavagna
- Aggiungere 'lavagna' a VALID_HASHES
- Lazy import LavagnaShell
- Build + test PASS
- Commit

### Task 2: FloatingWindow.jsx + test
- Scrivere test PRIMA (TDD)
- Implementare: drag (pointer events), resize, min/max/close
- 48px touch target su tutti i bottoni
- CSS module: glassmorphism, border-radius 16px, box-shadow
- Z-index management
- localStorage persistence posizione/dimensione
- Test PASS → /simplify → commit

### Task 3: FloatingWindow.module.css
- Animazioni 300ms cubic-bezier
- @media (pointer: coarse) per touch
- Palette ELAB
- /frontend-design → /design:design-critique

### Task 4: AppHeader.jsx — barra top 48px glassmorphism
- backdrop-filter: blur(16px)
- Logo ELAB + placeholder picker + progress dots + Play + avatar
- Tutti bottoni >= 48px
- CSS module
- preview_screenshot per verificare
- Commit

### Task 5: AUDIT 1/3
- /lavagna-benchmark 1/3
- preview_screenshot #lavagna e #tutor
- Fix P0 se presenti

### Task 6: LavagnaShell.jsx — assemblaggio
- Grid: 48px header + 1fr canvas
- Montare NewElabSimulator dentro (wrapping)
- Verificare che il simulatore funziona in #lavagna
- preview_screenshot

### Task 7: RetractablePanel.jsx — pannello generico
- Props: direction (left/right/bottom), open, onToggle
- Animazione slide 300ms
- Resize handle con pointer events
- localStorage dimensione
- Touch: swipe gesture

### Task 8: RetractablePanel.module.css
- Varianti per left/right/bottom
- @media responsive (1024px, 1366px)
- @media (pointer: coarse)

### Task 9: FloatingToolbar.jsx — toolbar canvas
- 6-8 icone ElabIcons
- Glassmorphism
- Posizione centro-basso
- Micro-animazione tap
- Visibilita condizionale

### Task 10: AUDIT 1/2
- /lavagna-benchmark 1/2
- Playwright: touch test su FloatingWindow (se implementato)
- 3 agenti paralleli: a11y, visual, performance
- Fix P0/P1

### Task 11: Integration — pannello sinistro con ComponentDrawer
- Wrappare ComponentDrawer (esistente) in RetractablePanel(left)
- Verificare drag-and-drop funziona dalla palette al canvas

### Task 12: Integration — pannello basso con CodeEditor
- Wrappare CodeEditorCM6 (esistente) in RetractablePanel(bottom)
- Tab: Arduino C++ / Blocchi / Monitor / Passi
- Verificare compilazione funziona

### Task 13: AUDIT FINE SESSIONE
- /lavagna-benchmark fine
- 5 agenti audit completi
- Score card 15 metriche
- Screenshot confronto #tutor vs #lavagna
- Generare LAVAGNA-S2-PROMPT.md
- Aggiornare MEMORY.md

## BENCHMARK TARGET S1
- F1-F5: tutte PASS
- U1 (chrome): >= 7 (simulatore visibile, header + pannelli presenti)
- U2 (touch): >= 8 (tutti i nuovi componenti con 48px target)
- U5 (coerenza): >= 8 (palette ELAB rispettata in tutti i nuovi file)
- D4 (glassmorphism): >= 8 (header con blur visibile)
- D5 (palette): 10 (zero colori fuori palette nei nuovi file)
- **Target composito S1: >= 7.0/10**
