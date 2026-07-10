# SESSIONE FRONTEND — Pannelli, SVG, UX, Estetica
**Ralph Loop** `--max-iterations 30` | **Score partenza**: 6.8/10 | **Target**: 8.5/10
**Prerequisito**: leggere `docs/SESSION-COMPLETE-02-APR-2026.md`

---

## COMANDO

```
/ralph-loop Esegui TUTTO docs/prompts/PROMPT-FRONTEND-SESSIONE-NEXT.md --max-iterations 30 --completion-promise "FRONTEND SESSIONE COMPLETATA SCORE 8.5 VERIFICATO"
```

---

## CONTESTO PROGETTO

ELAB Tutor = simulatore elettronica + AI tutor per bambini 10-14 anni.
Stack: React 19 + Vite 7 + Supabase + Gemini API.
Deploy: Vercel (frontend) + Supabase Edge Functions (backend).
Palette: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D.
Font: Oswald (heading), Open Sans (body), Fira Code (code).
Touch target minimo: 44x44px. Font minimo: 13px (LIM), 14px (desktop).

### Engine INTOCCABILE
```
src/components/simulator/engine/CircuitSolver.js
src/components/simulator/engine/AVRBridge.js
src/components/simulator/engine/SimulationManager.js
src/components/simulator/engine/avrWorker.js
```

### Stato attuale
- 1075/1075 test PASS | Build ~3995KB | 33 precache
- LessonPathPanel ora collassabile (start collapsed) + resize:both
- 32 bug fix applicati (a11y, z-index, memory leak, overlay)
- Scratch/Compilatore: ZERO BUG (audit 11 agenti)
- Fumetto: production ready
- 11 agenti audit completati, 99 issues trovati, 32 fixati

### Gap REALI frontend (da audit)
1. Pannelli non tutti drag/resize/hide/show come l'utente vuole
2. DrawingOverlay senza undo passo-passo
3. SVG Breadboard/Nano non migliorati (audit SVG non completato per permission)
4. Focus trap mancante in FloatingWindow
5. Border-radius inconsistenti (12px, 14px, 16px, 18px)
6. CSS hardcoded hex invece di CSS variables
7. 67+ bug frontend non fixati dagli audit
8. Bundle > 3800KB target
9. Responsive breakpoints frammentati
10. No test E2E browser

---

## PREPARAZIONE COLLABORATRICE

**In ogni ciclo**, ogni modifica deve:
- Usare nomi chiari (inglese coerente per codice, italiano per UI)
- CSS modules (no inline styles nuovi)
- Commenti dove la logica non e ovvia
- Rispettare il design system ELAB (tokens sotto)

### Design System ELAB

```
COLORI:
  --color-primary:   #1E4D8C    --color-success:   #4A7A25
  --color-warning:   #E8941C    --color-error:     #E54B3D
  --color-text:      #333       --color-muted:     #666
  --color-bg:        #F5F5F5    --color-white:     #FFF

SPACING: 4, 8, 12, 16, 24, 32, 48 px

BORDER-RADIUS: sm=6, md=10, lg=14, xl=18 px

Z-INDEX: canvas 0-99 | panels 300-499 | floating 500-999 | toolbar 950 | header 1000 | UnlimBar 1050 | modals 2000-3000

SHADOWS:
  sm: 0 1px 4px rgba(0,0,0,0.05)
  md: 0 4px 16px rgba(0,0,0,0.08)
  lg: 0 4px 24px rgba(0,0,0,0.1)
```

---

## 8 CICLI — Ogni ciclo: implementa → test → audit CoV (3 agenti) → documenta

### CICLO 1: Layout senza overlay
**IMPERATIVO UTENTE**: "NO OVERLAY COGNITIVO. Pannelli allargabili, allungabili, nascondibili, ritrovabili."

- Verificare che LessonPathPanel parta collapsed (gia fatto — verificare visivamente)
- FloatingWindow UNLIM: posizione iniziale left-bottom (non copra il canvas)
- Verificare che RetractablePanel sinistro SPINGA il canvas (non copra)
- Verificare su 3 viewport: LIM 1024x768, Desktop 1280x800, iPad 768x1024
- Screenshot su ogni viewport

**Skill**: `/frontend-design`, `/lim-simulator`, `/design:design-critique`
**Tool**: preview_screenshot, preview_resize, preview_snapshot
**Audit**: 3 agenti (overlay-check, responsive-check, usability-check)

### CICLO 2: DrawingOverlay undo + eraser fix
- Aggiungere pathsHistory stack (useState)
- Undo button nella toolbar penna
- Redo button
- Eraser visual feedback migliorato (opacity 0.5, cursor diverso)
- Testa su iPad (touch drawing)

**Skill**: `/analisi-simulatore`, `/systematic-debugging`
**Tool**: preview_eval per testare draw → undo → verify
**Audit**: 3 agenti (interaction, a11y, code-quality)

### CICLO 3: SVG Breadboard + NanoR4Board polish
- Leggere e analizzare BreadboardFull.jsx, BreadboardHalf.jsx, NanoR4Board.jsx
- Verificare gradienti (PCB texture, gold pads, chip)
- BB_HOLE_PITCH = 7.5px, SCALE = 1.8 verificati
- ID SVG scoped con prefix (no collisioni)
- Confronto con foto in `ELAB - TRES JOLIE/FOTO/`
- Pin labels leggibili e corretti

**Skill**: `/nano-breakout`, `/tinkercad-simulator`, `/volume-replication`
**Tool**: preview_screenshot del simulatore con circuito LED montato
**Audit**: 3 agenti (visual-quality, pin-accuracy, performance)

### CICLO 4: CSS Design System cleanup
- Cercare TUTTI gli hex hardcoded in CSS modules lavagna → sostituire con CSS variables
- Standardizzare border-radius (sm/md/lg/xl)
- Standardizzare spacing (4/8/12/16/24/32/48)
- Rimuovere inline styles rimasti
- Creare `src/styles/tokens.css` con :root variables

**Skill**: `/design:design-system audit`, `/simplify`
**Tool**: grep per hex codes hardcoded
**Audit**: 3 agenti (consistency, naming, token-coverage)

### CICLO 5: Focus trap + A11y completo
- FloatingWindow: focus trap (Tab non esce dal dialog)
- ExperimentPicker: focus trap nel modal
- aria-live su VideoFloat risultati filtrati
- Verificare TUTTI touch targets >= 44px (grep per width/height < 44)
- Verificare TUTTI font >= 13px (grep per font-size < 13)
- Contrast ratio text su tutti i backgrounds

**Skill**: `/design:accessibility-review`, `/quality-audit`
**Tool**: preview_inspect per verificare CSS computed values
**Audit**: 3 agenti (wcag, touch-targets, contrast)

### CICLO 6: Test E2E nel browser
Usa Control Chrome + Preview tools per 10 test:

1. `#lavagna` → ExperimentPicker apre
2. Seleziona "Accendi il tuo primo LED" → circuito appare
3. LessonPathPanel collapsed → click → si espande
4. Premi Play → LED si illumina
5. Apri pannello componenti sinistro → lista visibile
6. Apri UNLIM chat → scrivi "ciao" → risposta entro 10s
7. "Prepara la lezione" → risposta strutturata
8. Penna: disegna su canvas → clear → canvas pulito
9. Resize FloatingWindow UNLIM → nuova posizione persistente
10. `#vetrina` → no sigle strane, link scuole funziona

**Skill**: `/elab-quality-gate`, `/lavagna-benchmark`
**Tool**: Control Chrome execute_javascript, preview_click, preview_fill
**Audit**: 3 agenti (E2E-pass-rate, console-errors, UX-flow)

### CICLO 7: Performance e bundle
- `npx vite-bundle-visualizer` per identificare chunk grandi
- Lazy import per componenti pesanti (react-pdf, recharts, CodeMirror)
- Tree shaking verificato
- Target: < 3800KB precache
- Rimuovere dead code/import trovati dagli audit

**Skill**: `/simplify`, `/engineering:tech-debt`
**Tool**: npm run build, misurare precache
**Audit**: 3 agenti (bundle-size, lazy-loading, dead-code)

### CICLO 8: Audit finale SEVERO + deploy
5 agenti paralleli CoV:
1. **UX**: 3 viewport, nessun overlay, pannelli manipolabili
2. **A11y**: WCAG 2.1 AA, touch targets, contrast, focus
3. **Visual**: palette ELAB rispettata, SVG belli, coerenza
4. **Performance**: bundle size, cold start, memory leaks
5. **Collaboratrice**: codice leggibile, CSS modules, nomi chiari

Score = MINIMO dei 5 agenti. Se < 8.5, fixa e rilancia.
Deploy: `npm run build && npx vercel --prod --yes`

---

## DOCUMENTO ONBOARDING (prodotto dall'agente analisi — salvare in docs/ONBOARDING.md)

Il documento onboarding per la collaboratrice e gia stato prodotto e contiene:
1. **10 file piu importanti** con learning path ordinato
2. **Flusso dati**: UnlimBar → useGalileoChat → sendChat → Edge Function → Gemini → action tags → __ELAB_API
3. **Simulatore**: 3 layer (CircuitSolver IMMUTABILE, AVRBridge IMMUTABILE, Canvas modificabile)
4. **Lavagna**: LavagnaShell, FloatingWindow, useGalileoChat, StateManager
5. **Deploy**: Vercel (frontend) + Supabase (backend) + VPS (TTS)
6. **Convenzioni**: CSS modules (no inline), absolute imports, camelCase, useCallback per handlers
7. **IMMUTABILI**: CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js — MAI toccare

### File critici che la collaboratrice deve conoscere:
```
LEARNING PATH (in ordine):
1. CLAUDE.md                    — contesto progetto, regole
2. App.jsx                      — routing (#tutor, #lavagna, #admin)
3. LavagnaShell.jsx             — shell principale workspace
4. NewElabSimulator.jsx         — simulatore (1900 LOC)
5. CircuitSolver.js             — solver DC (IMMUTABILE)
6. AVRBridge.js                 — emulazione CPU (IMMUTABILE)
7. SimulatorCanvas.jsx          — rendering SVG canvas
8. FloatingWindow.jsx           — finestre drag/resize
9. useGalileoChat.js            — hook chat UNLIM
10. vite.config.js              — build config
```

### Flusso dati semplificato:
```
Docente scrive "Come accendo il LED?"
    → UnlimBar.jsx (input)
    → useGalileoChat.js (hook)
    → api.js sendChat() (HTTP POST)
    → Supabase Edge Function unlim-chat
    → rag.ts (cerca nei 246 chunk volumi)
    → system-prompt.ts (costruisce prompt)
    → Gemini API (genera risposta + [AZIONE:highlight:led1])
    → Risposta al frontend
    → executeActionTags() → window.__ELAB_API.galileo.highlightComponent(['led1'])
    → LED si illumina nel simulatore
    → Chat mostra "Per accendere il LED..." (tag azione nascosti)
```

## REGOLE

1. ZERO REGRESSIONI (1075+ test)
2. ENGINE INTOCCABILE
3. SCORE SENZA SCREENSHOT = 0
4. MAI SCORE > 7 SENZA 10+ PROVE
5. DOCUMENTA OGNI DECISIONE

## CREDENZIALI

```
Admin: #admin → [REDACTED-MOVED-TO-ENV]
Supabase: euqpdueopmlllqjmqnyb | Token: sbp_REVOKED_20260423_REDACTED
Gemini: [REDACTED_GOOGLE_API_KEY]
VPS: 72.60.129.50
Anon Key: (in supabase/DEPLOY-GUIDE.md)
```
