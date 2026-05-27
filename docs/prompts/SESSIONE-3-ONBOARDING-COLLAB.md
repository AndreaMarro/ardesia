# SESSIONE 3 — ONBOARDING COLLABORATRICE + STABILIZZAZIONE
**Da usare con**: Ralph Loop (`--max-iterations 20`)
**Score partenza**: 8.5/10 (post Sessione 2) | **Target**: 9.0/10
**Scopo speciale**: Preparare il sistema per una nuova collaboratrice

---

## COMANDO RALPH LOOP

```
/ralph-loop Esegui TUTTO il prompt in docs/prompts/SESSIONE-3-ONBOARDING-COLLAB.md --max-iterations 20 --completion-promise "SESSIONE 3 COMPLETATA ONBOARDING PRONTO SCORE 9.0 VERIFICATO"
```

---

## CONTESTO PROGETTO ELAB

### Cosa e ELAB
ELAB Tutor e un simulatore di elettronica + AI tutor per bambini 10-14 anni nelle scuole italiane.
Combina un kit fisico (Omaric Elettronica, Strambino/TO) con un simulatore digitale e un assistente AI
chiamato UNLIM. Il team include Giovanni Fagherazzi (ex Global Sales Director Arduino), Kirill Pilipchuk,
Giuseppe Ferrara, Davide Fagherazzi (MePA), Lino Moretto, e Andrea Marro (unico sviluppatore).

### Stack
- React 19 + Vite 7 (routing custom con useState, NO react-router)
- Supabase: 5 Edge Functions (Deno) + pgvector (246 chunk RAG)
- Gemini API: routing 70/25/5 (Flash-Lite/Flash/Pro)
- VPS 72.60.129.50: Voxtral TTS + Galileo Brain fallback
- Deploy: Vercel (frontend) + Supabase (backend)
- CPU emulation: avr8js (ATmega328p) in Web Worker

### Principi fondamentali
1. **Principio Zero**: Solo il docente usa UNLIM. Gli studenti lavorano sul simulatore.
2. **Guida Invisibile**: UNLIM prepara lezioni basate su esperimenti + contesto passato.
3. **No overlay cognitivo**: Pannelli manipolabili, allargabili, nascondibili. Zero sovrapposizioni.
4. **Estetica ELAB**: Navy #1E4D8C, Lime #4A7A25, Orange #E8941C, Red #E54B3D. Oswald + Open Sans.
5. **Engine intoccabile**: CircuitSolver, AVRBridge, SimulationManager, avrWorker — mai modificare.

### File critici

```
SIMULATORE (NON TOCCARE):
src/components/simulator/engine/CircuitSolver.js      — 1702 righe
src/components/simulator/engine/AVRBridge.js          — 1051 righe
src/components/simulator/engine/SimulationManager.js  — 302 righe
src/components/simulator/engine/avrWorker.js          — 348 righe

LAVAGNA (dove si lavora):
src/components/lavagna/LavagnaShell.jsx               — Shell principale
src/components/lavagna/FloatingWindow.jsx             — Finestre drag/resize
src/components/lavagna/AppHeader.jsx                  — Header con logo + tabs
src/components/lavagna/useGalileoChat.js              — Hook chat UNLIM
src/components/lavagna/GalileoAdapter.jsx             — Wrapper ChatOverlay
src/components/lavagna/ExperimentPicker.jsx            — Selezione esperimento
src/components/lavagna/FloatingToolbar.jsx             — Toolbar strumenti
src/components/lavagna/RetractablePanel.jsx            — Pannelli laterali
src/components/lavagna/UnlimBar.jsx                   — Barra input UNLIM

SERVIZI:
src/services/lessonPrepService.js                      — Preparazione lezioni
src/services/api.js                                    — API calls
src/services/compilerService.js                        — Compilatore Arduino
src/services/sessionReportService.js                   — Report/fumetto

BACKEND:
supabase/functions/unlim-chat/index.ts                — Chat endpoint
supabase/functions/_shared/rag.ts                     — RAG semantico
supabase/functions/_shared/system-prompt.ts           — System prompt UNLIM
supabase/functions/_shared/guards.ts                  — Security guards
supabase/functions/_shared/gemini.ts                  — Gemini API client

DATI:
src/data/lesson-paths/                                — 62 percorsi lezione JSON
src/data/experiments/                                 — 62 esperimenti (3 volumi)
data/rag/                                             — 246 chunk + embeddings
```

### Cosa funziona (post S1+S2)
- Simulatore con 21 componenti SVG, 62 esperimenti, compilatore Arduino
- UNLIM chat AI LIVE con RAG dai 3 volumi (246 chunk pgvector)
- Lesson Prep: "prepara la lezione" → piano personalizzato
- Scratch/Blockly in italiano per bambini
- Fumetto report con pannelli asimmetrici + foto + stampa PDF
- 5 Edge Functions su Supabase con CORS ristretto
- GDPR: Art. 17, 20, 8 con auth token

---

## 8 CICLI SESSIONE 3

### CICLO 1: Documentazione onboarding collaboratrice
**Obiettivo**: Creare `docs/ONBOARDING.md` completo per la nuova collaboratrice.

Contenuto:
- Mappa del progetto (directory structure spiegata)
- Come buildare e testare (`npm install`, `npx vitest run`, `npm run build`)
- Come deployare (Vercel + Supabase functions deploy)
- Come funziona il simulatore (diagramma flusso semplice)
- Come funziona UNLIM (architettura Lesson Prep)
- Cosa NON toccare (engine files)
- Palette colori e font
- Convenzioni codice (CSS modules, no inline styles, no emoji in codice)
- Credenziali e accessi

**Skill**: `/engineering:documentation`
**Test**: Il documento e chiaro per qualcuno che non ha mai visto il progetto?

### CICLO 2: CLAUDE.md aggiornato per la collaboratrice
**Obiettivo**: CLAUDE.md deve essere la guida definitiva per chiunque lavori sul progetto.

- Aggiornare con Nanobot V2, Supabase, Gemini routing
- Aggiungere sezione Lavagna (file, architettura)
- Aggiungere sezione RAG (246 chunk, ricerca semantica)
- Aggiungere sezione Lesson Prep
- Lista completa bug noti con priorita
- Comandi utili (build, test, deploy, skill)

**Skill**: `/claude-md-management:revise-claude-md`
**Test**: Leggere CLAUDE.md e verificare che sia sufficiente per lavorare

### CICLO 3: Test E2E Playwright setup
**Obiettivo**: Configurare Playwright + scrivere 10 test E2E.

```bash
npx playwright install
```

Test da scrivere:
1. Homepage carica senza errori
2. #lavagna carica il simulatore
3. ExperimentPicker apre e mostra 3 volumi
4. Caricamento esperimento v1-cap6-esp1
5. Play → LED si accende (circuito corretto)
6. Scratch editor apre con blocchi in italiano
7. Chat UNLIM risponde a "ciao"
8. "Prepara la lezione" → risposta strutturata
9. Pannello componenti apre/chiude
10. Report fumetto si genera

**Skill**: `/engineering:testing-strategy`
**Test**: `npx playwright test` tutti PASS

### CICLO 4: Code review della collaboratrice
**Obiettivo**: Simulare una code review come se la collaboratrice avesse fatto un PR.

- Guardare gli ultimi 50 file modificati
- Verificare che ogni file sia chiaro, commentato, testabile
- Cercare pattern inconsistenti
- Verificare naming conventions

**Skill**: `/engineering:code-review`, `/simplify`
**Test**: 0 problemi critici trovati

### CICLO 5: API documentation
**Obiettivo**: Documentare TUTTE le API (frontend + backend).

- `window.__ELAB_API` — tutti i 60+ metodi
- Supabase Edge Functions — 5 endpoint con request/response
- Services: api.js, lessonPrepService.js, compilerService.js
- Events: circuitChange, experimentChange, stateChange

**Skill**: `/engineering:documentation`
**Test**: Documento completo e leggibile

### CICLO 6: Error handling audit
**Obiettivo**: TUTTI gli errori devono essere gestiti gracefully.

- Cercare catch vuoti o silenti
- Aggiungere error boundaries React
- Verificare fallback quando backend e down
- Verificare comportamento offline (SW, HEX precompilati)

**Skill**: `/systematic-debugging`, `/ricerca-bug`
**Test**: Simulare backend down → l'app funziona con fallback

### CICLO 7: Security hardening finale
**Obiettivo**: OWASP top 10 check. CSP. Rate limiting persistente.

- CSP header (rimuovere unsafe-inline se possibile)
- Rate limiting su Supabase (non in-memory)
- Validazione input GDPR (email, UUID, enum)
- Session ID non spoofabile
- Prompt injection patterns robusti

**Skill**: `/engineering:code-review`
**Test**: 5 attacchi simulati → tutti bloccati

### CICLO 8: Audit finale + deploy production
**Obiettivo**: Score 9.0+ verificato. Deploy production.

5 agenti CoV:
1. **Funzionale**: tutti i flussi funzionano E2E
2. **UX**: nessun overlay, tutto manipolabile
3. **Security**: OWASP, GDPR, CORS
4. **A11y**: WCAG 2.1 AA completo
5. **Onboarding**: la documentazione e sufficiente per la collaboratrice

Deploy: `npm run build && npx vercel --prod --yes`
Deploy backend: `npx supabase functions deploy --project-ref euqpdueopmlllqjmqnyb`

---

## DESIGN SYSTEM — Documento da creare per la collaboratrice

Crea `docs/DESIGN-SYSTEM.md` con:

### Tokens
```
COLORI:
  --color-primary:   #1E4D8C (Navy)
  --color-success:   #4A7A25 (Lime)
  --color-warning:   #E8941C (Orange)
  --color-error:     #E54B3D (Red)
  --color-text:      #333333
  --color-muted:     #666666
  --color-bg:        #F5F5F5
  --color-white:     #FFFFFF

FONT:
  --font-heading:    'Oswald', sans-serif
  --font-sans:       'Open Sans', sans-serif
  --font-mono:       'Fira Code', monospace

SPACING (4px base):
  --space-1: 4px   --space-2: 8px   --space-3: 12px
  --space-4: 16px  --space-5: 24px  --space-6: 32px
  --space-8: 48px

BORDER-RADIUS:
  --radius-sm: 6px   --radius-md: 10px
  --radius-lg: 14px  --radius-xl: 18px
  --radius-pill: 999px

SHADOWS:
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.05)
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08)
  --shadow-lg: 0 4px 24px rgba(0,0,0,0.1)

Z-INDEX SCALE:
  Canvas/simulator:     0-99
  Retractable panels:   300-499
  Floating windows:     500-999
  Toolbar:              950
  Header:               1000
  UnlimBar:             1050
  Modals/backdrops:     2000-3000
  System (toasts):      5000+
```

### Componenti ELAB
Documenta ogni componente Lavagna con:
- Props, variants, states
- Screenshot
- Do's e Don'ts
- Accessibilita (ARIA, keyboard)

### Audit Design System
Fai un audit con `/design:design-system audit` e correggi:
- Hardcoded hex → CSS variables
- Inconsistent spacing → token scale
- Inconsistent border-radius → standard
- Missing aria-labels

## REGOLE NON NEGOZIABILI

1. ZERO REGRESSIONI (1075+ test)
2. ENGINE INTOCCABILE
3. PRINCIPIO ZERO: solo docente usa UNLIM
4. DOCUMENTA TUTTO per la collaboratrice
5. MASSIMA ONESTA negli score
6. La collaboratrice deve poter lavorare DA SOLA dopo aver letto la documentazione

## CREDENZIALI

```
Supabase: euqpdueopmlllqjmqnyb
URL: https://euqpdueopmlllqjmqnyb.supabase.co
Token: sbp_REVOKED_20260423_REDACTED
Gemini: AIzaSyB3IjfrHeG9u_yscwHamo7lT1zoWJ0ii1g
VPS: 72.60.129.50
Admin: #admin → [REDACTED-MOVED-TO-ENV]
Anon Key: (in supabase/DEPLOY-GUIDE.md)
```

## SKILL DA USARE

```
/elab-quality-gate /lavagna-benchmark /quality-audit
/systematic-debugging /simplify /ricerca-bug
/engineering:documentation /engineering:code-review
/engineering:testing-strategy /claude-md-management:revise-claude-md
/impersonatore-utente /lim-simulator
Preview tools + Control Chrome + Playwright
```
