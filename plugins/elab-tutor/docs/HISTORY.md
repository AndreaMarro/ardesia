# Storia del Progetto ELAB — Dalla prima riga ad oggi

## Cos'e' ELAB

ELAB e' un prodotto educativo per insegnare elettronica e Arduino nelle scuole italiane (target 8-14 anni). Il prodotto fisico include 3 volumi di esercizi + kit hardware (breadboard, componenti, Arduino Nano). Il software (questo repo) e' il simulatore web che accompagna i volumi.

## Il team

| Nome | Ruolo |
|------|-------|
| **Andrea Marro** | Unico sviluppatore software + AI. Tutto il codice e' suo. |
| Giovanni Fagherazzi | Leader strategico — ex Global Sales Director di Arduino |
| Omaric Elettronica (Strambino/TO) | Produttore hardware, filiera Arduino |
| Davide Fagherazzi | MePA / procurement pubblico |
| Kirill Pilipchuk | Implementazione Arduino hardware |
| Lino Moretto | Driver iniziativa AI |
| Giuseppe Ferrara | Strategia finanziaria |

## Architettura del simulatore

Il cuore e' un simulatore di circuiti che funziona interamente nel browser:

1. **CircuitSolver** (~2500 righe) — risolve circuiti DC con MNA/KCL (Modified Nodal Analysis / Kirchhoff's Current Law). Gestisce resistori, LED, condensatori, transistor, paralleli, serie.

2. **AVRBridge** (~1240 righe) — ponte tra il CircuitSolver e l'emulatore CPU avr8js. Gestisce GPIO, ADC, PWM, USART, timer. Permette di eseguire codice Arduino compilato (HEX) nel browser.

3. **PlacementEngine** (~200 righe) — posizionamento automatico componenti. L'orchestrazione Vol1/Vol2 vs Vol3 AVR e' in NewElabSimulator.jsx (~1020 righe).

4. **SimulatorCanvas** (~3150 righe) — canvas SVG con zoom/pan/drag, 21 componenti SVG renderizzati, wire bezier routing, selezione multipla, copy/paste.

5. **Compilatore** — il codice Arduino (C++) viene inviato a un server esterno (n8n su Hostinger) che usa arduino-cli per compilare in HEX. Il HEX viene poi eseguito da avr8js nel browser. Per molti esperimenti, il HEX e' pre-compilato per velocita'.

## Timeline sviluppo

### Fase 1: Fondamenta (Feb 2026)
- Sprint 1: Cleanup — 2,566 righe morte eliminate, god component da 3,507 a 1,831 righe
- Sprint 2: Features — KCL/MNA solver, multimetro, wire bezier, current animation, Web Worker AVR, Servo, LCD
- Sprint 3: Polish — BOM panel, annotations, export PNG, shortcuts, code splitting, deploy Vercel

### Fase 2: Contenuti (Feb 2026)
- 92 esperimenti creati e validati (38 Vol1 + 27 Vol2 + 27 Vol3)
- Lesson paths JSON con obiettivi, step, concetti, suggerimenti
- 4 giochi didattici con scoring
- Auth server-side con bcrypt + HMAC-SHA256
- Gestionale ERP (admin, fatture, ordini)

### Fase 3: UNLIM — Il tutor AI (Mar 2026)
UNLIM e' il nome del sistema AI di tutoring. Include:
- Chat con Galileo (mascotte robot) via Nanobot su Render (https://elab-galileo.onrender.com)
- Messaggi contestuali posizionati accanto ai componenti
- Voice TTS/STT (parla e ascolta)
- 24 comandi vocali ("aggiungi LED", "pulisci", "compila")
- Sistema INTENT: l'AI puo' controllare il simulatore via tag [INTENT:{...}]
- Memoria 3-tier: localStorage + Supabase + nanobot per contesto cross-sessione
- Report "fumetto" della lezione

### Fase 4: Backend Supabase (Apr 2026)
- 8 tabelle (classes, students, sessions, progress, mood, nudges, contexts, confusion)
- RLS policies per ruolo docente/studente
- 5 Edge Functions (chat, diagnose, hints, TTS, GDPR)
- Routing Gemini 70/25/5 (Flash-Lite/Flash/Pro) per ottimizzare costi
- Offline queue con retry

### Fase 5: SVG Premium + Lavagna (Apr 2026)
- Componenti SVG con gradienti realistici (LED dome, resistore cilindrico, breadboard texture)
- NanoR4Board con 7 gradienti hardware-accurate
- Redesign interfaccia "Lavagna": AppHeader glassmorphism, FloatingToolbar, RetractablePanel
- Scratch con palette ELAB e categorie in italiano

## Stato attuale (04/04/2026)

### Cosa funziona bene (7+/10)
- Simulatore DC: solver accurato, 21 componenti, wire routing
- 62 esperimenti con lesson paths
- Build/test: 1001 test, build <60s, PWA 30 precache entries
- Compilatore Arduino (quando il server risponde)

### Cosa ha problemi (4-6/10)
- Dashboard docente: funziona solo con localStorage (Supabase non configurato)
- Scratch/Blockly: funziona ma solo 10/27 esp Vol3 hanno scratchXml
- Solo 6/27 esperimenti Vol3 hanno le 3 modalita' (buildSteps)
- UNLIM: risposte a volte troppo lunghe, hallucination occasionale
- Voice: funziona ma non su tutti i browser
- Monitor seriale: migliorato ma ancora compresso

### Bug noti aperti
1. 21/27 esperimenti Vol3 senza buildSteps (no "Passo Passo" / "Percorso")
2. Scratch non configurato per ~17 esperimenti
3. Componenti difficili da cliccare/trascinare su touch
4. Lavagna: non salva pagine, non cambia pagina
5. Navigazione tra viste (lavagna/presentazione) poco chiara
6. Alcuni lesson path con testi mancanti

## Infrastruttura

| Servizio | URL | Scopo |
|----------|-----|-------|
| Vercel | elabtutor.school | Frontend produzione |
| Supabase | vxvqalmxqtezvgiboxyv.supabase.co | DB + Edge Functions |
| Hostinger/n8n | n8n.srv1022317.hstgr.cloud | Compilatore Arduino |
| VPS Ollama | 72.60.129.50:11434 | Brain V13 (routing AI locale) |

## File critici — NON modificare senza coordinamento

| File | Righe | Perche' |
|------|-------|---------|
| engine/CircuitSolver.js | 2486 | Cuore del solver, algoritmo MNA/KCL |
| engine/AVRBridge.js | 1242 | Bridge CPU emulation, timing critico |
| engine/PlacementEngine.js | 822 | Posizionamento automatico componenti |
| canvas/SimulatorCanvas.jsx | 3149 | Canvas SVG principale |
| NewElabSimulator.jsx | 1022 | Shell simulatore, orchestrazione |
| services/api.js | 1040 | Tutte le chiamate API, routing, retry |
| services/simulator-api.js | 755 | API globale __ELAB_API |
| utils/pinComponentMap.js | 399 | Mapping pin Union-Find |
| vite.config.js | 293 | Build config, chunk splitting, obfuscation |

## Pin mapping ATmega328p (regola immutabile)

```
D0-D7  = PORTD (pin digitali 0-7)
D8-D13 = PORTB (pin digitali 8-13)
A0-A5  = PORTC (pin analogici)
```

## Convenzioni codice

- **Commit**: `tipo(area): descrizione` (feat, fix, style, refactor, test, docs, chore)
- **CSS**: preferire CSS Modules, no inline style per nuovi componenti
- **Icone**: ElabIcons.jsx (24 icone SVG Feather-style), MAI emoji come icone
- **Font min**: 13px testi, 10px label secondarie
- **Touch**: 44x44px minimo per bottoni
- **WCAG**: contrasto 4.5:1 testo, 3:1 grafici
