# POST-LAVAGNA — Prompt per Sessioni Future

## STATO ATTUALE
- **Score**: 8.6/10 (onesto, verificato con 25+ screenshot)
- **Test**: 1032/1032 PASS
- **Build**: 33 precache, ~4005KB
- **Console errors**: 0
- **Commit**: 19 (S4→post-S8)
- **File lavagna**: 20 componenti + 3 file test in `src/components/lavagna/`

## COSA FUNZIONA (VERIFICATO NEL BROWSER)
1. `#tutor` → redirect a `#lavagna` (Strangler Fig switch ATTIVO)
2. Lavagna pulita con auto-picker (0 click prima di vedere esperimenti)
3. ExperimentPicker: 3 volumi, 62 esperimenti, ricerca, click→carica
4. Arduino C++ editor + Scratch blocks nella lavagna
5. LED glow simulation funzionante
6. UNLIM FloatingWindow con minimize/restore
7. FloatingToolbar 6 strumenti
8. 3 modalita (Gia Montato / Passo Passo / Libero)
9. Percorso Lezione con step PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI
10. Dashboard tabs (Lavagna/Classe/Progressi)
11. VetrinaV2 su `#vetrina2` con flusso → login
12. LIM 1024x768 + iPad 768x1024 + Chromebook 1366x768 OK
13. A11y: tutti gli elementi con aria-labels, roles, keyboard nav
14. Navigazione multi-page fluida (showcase→login→lavagna)
15. Zero regressioni su #tutor (vecchio flusso ancora raggiungibile)

## DEBITI TECNICI RESIDUI (per prossime sessioni)

### P1 — Alto impatto, richiedono decisione Andrea
1. **Rimuovere 4 giochi** (~1900 LOC): CircuitDetective, PredictObserveExplain, ReverseEngineeringLab, CircuitReview + mystery-circuits.js, review-circuits.js, useGameScore.js → tocca ElabTutorV4.jsx e TutorSidebar.jsx
2. **Sostituire #vetrina con VetrinaV2**: redirect `#vetrina` → `#vetrina2` oppure montare VetrinaV2 direttamente su `#vetrina`
3. **Rimuovere dead code #tutor**: il vecchio blocco in App.jsx (righe 216+) e dead code dopo il redirect
4. **Rimuovere VetrinaSimulatore S object**: 400 LOC dead code

### P2 — Miglioramenti qualita
5. **Voice commands test**: 24 comandi vocali nella lavagna (serve microfono)
6. **FloatingWindow drag stress test**: drag e resize con pointer events
7. **Dashboard tab Classe test**: serve login docente reale
8. **Mobile 375px**: Percorso Lezione copre il canvas — serve layout diverso per mobile
9. **CSS warning build**: esbuild minifier "Unexpected (" — non bloccante
10. **State machine visuale**: le transizioni auto-panel non sono state osservate nel browser

### P3 — Nice to have
11. Completamento badge nel picker (integrare con gamificationService)
12. Animazione confetti quando esperimento completato nella lavagna
13. Canvas dot pattern background (stile Excalidraw)
14. Dark mode (non prioritario per LIM)

## REGOLE PER SESSIONI FUTURE
```
PATH: export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | sort -V | tail -1)/bin:$PATH"
BUILD: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npm run build
TEST: cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder" && npx vitest run
ENGINE INTOCCABILE: CircuitSolver.js, AVRBridge.js, SimulationManager.js
ZERO REGRESSIONI: 1032+ test, 33 precache
PALETTE: Navy #1E4D8C, Lime #4A7A25, Vol2 #E8941C, Vol3 #E54B3D
```

## COME RIPRENDERE
```
Leggi completamente:
1. CLAUDE.md
2. docs/plans/2026-04-01-lavagna-redesign.md
3. docs/prompts/LAVAGNA-CURRENT-STATE.md
4. docs/prompts/LAVAGNA-POST-S8-PROMPT.md
5. docs/prompts/ANDREA-VISION-COMPLETE.md

Poi: npm run build && npx vitest run
Poi: naviga a #lavagna nel browser e verifica che funziona
Poi: scegli un debito tecnico P1/P2 e fixalo
```
