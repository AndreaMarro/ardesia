# ELAB Tutor — Bibbia del Prodotto

## Cosa è ELAB Tutor
ELAB Tutor è una piattaforma educativa italiana per insegnare elettronica e Arduino a bambini 8-14 anni.
NON è solo un simulatore. È un ecosistema: **libri fisici + kit Arduino + simulatore browser + AI tutor Galileo + giochi didattici**.

## Il Vero Utente
L'insegnante di tecnologia della scuola media italiana. Spesso NON sa l'elettronica.
ELAB lo abilita: impara mentre insegna. Galileo è il libro intelligente, non il professore sostitutivo.
Lo studente raramente tocca il computer — vede la LIM. L'insegnante guida.

## Il Prodotto Live
- **Sito**: https://elabtutor.school (deploy Vercel)
- **Simulatore**: circuiti drag-and-drop, 21 componenti SVG, engine CircuitSolver (KCL/MNA)
- **AI Galileo**: chatbot pedagogico (n8n + Anthropic + Brain locale Qwen3.5-2B)
- **67 esperimenti** in 3 volumi (Vol1: base, Vol2: intermedio, Vol3: avanzato)
- **4 giochi**: Trova il Guasto, Prevedi e Spiega, Circuito Misterioso, Controlla Circuito
- **Nanobot**: backend per Galileo su Render (https://elab-galileo.onrender.com)

## Stack Tecnico
- React 19 + Vite 7 (NO react-router — routing custom useState)
- Deploy: Vercel (frontend) + Render (Nanobot) + Hostinger VPS (Brain Ollama)
- AI: Anthropic Claude via n8n, con routing locale Galileo Brain V13
- Emulazione CPU: avr8js (ATmega328p) in Web Worker

## Target Market
- Scuole medie italiane (11-14 anni)
- Budget: PNRR Scuola 4.0 (fondi disponibili fino a 2026)
- Decisori: dirigente scolastico, animatore digitale, docente tecnologia
- Canale: MePa/Consip (piattaforma acquisti PA)
- Prezzo stimato: kit fisico + licenza software €15-25/studente/anno

## Competitor
| Competitor | Pro | Contro | Prezzo |
|-----------|-----|--------|--------|
| **Tinkercad Circuits** | Gratuito, Autodesk brand, 3D integration | No AI tutor, no curriculum italiano, no kit fisico | Free |
| **Wokwi** | Simulatore veloce, ESP32/Arduino | Solo online, no pedagogia, no italiano | Free/Pro |
| **Arduino Education** | Brand ufficiale, CTC kit | Costoso (€500-2000/kit), no AI, no simulatore browser | €€€ |
| **Scratch** | Enorme community, visual coding | No elettronica, no circuiti fisici | Free |

## Vantaggi Unici di ELAB
1. **Unico** con libri fisici + simulatore + AI tutor integrati
2. **In italiano** — nessun competitor ha curriculum italiano completo
3. **Per insegnanti inesperti** — non serve sapere l'elettronica
4. **AI Galileo** — tutor che si adatta al livello, scaffolding pedagogico
5. **67 esperimenti guidati** — percorso progressivo da LED a progetti complessi
6. **4 giochi** — gamification integrata nel curriculum

## Punti Deboli (onesti)
1. **Bundle pesante**: 1.7MB (react-pdf 1.5MB, CodeMirror 730KB)
2. **Zero analytics**: non sappiamo come gli utenti usano il prodotto
3. **Zero teacher dashboard**: l'insegnante non può assegnare compiti o vedere progressi
4. **Nessun sistema di progressione**: badge, livelli, streak mancanti
5. **Marketing zero**: nessuna landing page per scuole, nessun funnel
6. **i18n assente**: solo italiano, nessuna localizzazione
7. **Font piccoli su LIM**: testo <24px illeggibile da 3 metri
8. **Google Fonts caricati 2 volte**: external + self-hosted (trovato dal ciclo 22)

## Metriche Attuali (25 marzo 2026)
- Lighthouse Performance: ~73-85 (target 90+)
- iPad compliance: 100% (touch target >=44px)
- Galileo identity: 90% (target 95%)
- Gulpease readability: 73-75 (target >=60, OK)
- Browser check: 0 errori console
- Build: PASS

## Cosa Manca Per Le Scuole (priorità)
1. **Teacher Dashboard** — assegnare esperimenti, vedere progressi classe
2. **Sistema progressione** — badge, livelli, streak per motivare studenti
3. **Modalità LIM** — font grandi, alto contrasto, vista semplificata
4. **Offline/PWA** — molte scuole hanno connessione instabile
5. **Report per genitori** — "tuo figlio ha completato X esperimenti"
6. **Onboarding insegnante** — wizard first-time con video demo
7. **Analytics** — PostHog o simile per capire usage patterns

## File Critici del Codice
```
src/components/simulator/
  NewElabSimulator.jsx         — componente principale simulatore (~1900 righe)
  engine/CircuitSolver.js      — solver DC, KCL/MNA (1702 righe)
  engine/AVRBridge.js          — bridge avr8js, GPIO/ADC/PWM (1051 righe)
  canvas/SimulatorCanvas.jsx   — canvas SVG zoom/pan/drag (1382 righe)
src/
  App.jsx                      — routing principale
  index.css                    — stili globali (Google Fonts issue!)
public/
  index.html                   — entry point (Google Fonts link da rimuovere)
  fonts/                       — font self-hosted (già presenti)
```

## Palette Colori
Navy: #1E4D8C / Lime: #7CB342 / Vol1: #7CB342 / Vol2: #E8941C / Vol3: #E54B3D

## Regole Immutabili
1. Build DEVE passare (`npm run build`)
2. Touch target >= 44px (WCAG + Apple HIG)
3. Font su LIM: corpo >= 24px, titoli >= 32px
4. Linguaggio SEMPRE per 10-14 anni
5. Galileo NON si sostituisce all'insegnante
6. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
