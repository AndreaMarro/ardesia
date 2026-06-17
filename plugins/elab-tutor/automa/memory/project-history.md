# ELAB Tutor — Project History
**Aggiornato**: 2026-03-25
**Scopo**: Contesto storico per agenti AI tra cicli. Riferimento immutabile.

---

## Principio Zero (immutabile)
> "ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e non solo.
> Persone totalmente inesperte possono mettersi alla LIM e poter spiegare subito,
> anche appassionandosi. Apprendimento orizzontale."
> — Andrea Marro

---

## Sprint 1 — 12/02/2026 (Foundation)
**Obiettivo**: Cleanup, refactor, qualità codice base

| Fix | Dettaglio |
|-----|-----------|
| Dead code eliminato | 2,566 LOC su 7 file |
| God component spezzato | 3,507 → 1,831 LOC (9 file estratti) |
| CSS modules | 3 file: codeEditor, overlays, layout |
| GalileoAPI unificata | merged in `__ELAB_API.galileo`, GalileoAPI.js eliminato |
| Analytics | 7 lifecycle events → n8n webhook |
| Event system | 5 event types con on/off pub/sub |

**Deploy**: Vercel → https://elab-builder.vercel.app

---

## Sprint 2 — 13/02/2026 (Features)
**Obiettivo**: Simulatore world-class, componenti hardware, solver accurato

| Feature | Dettaglio |
|---------|-----------|
| KCL/MNA solver | Gaussian elimination + partial pivoting, LED voltage source model |
| Multimeter | Ω/A modes, BFS resistance trace, current calculation |
| Wire bezier routing | CORNER_RADIUS=5, collinear detection, adaptive radius |
| Current flow animation | direction-aware, speed∝current, gold/orange/red |
| Multi-select | Shift+click, drag-box, multi-delete, multi-move |
| Copy/Paste/Duplicate | Ctrl+C/V/D, ID remapping, wire cloning |
| Web Worker AVR | pin batching 16ms, PWM 50ms, fallback main-thread |
| Servo motor | SVG rotating horn, PWM→angle, registry |
| LCD 16x2 | 5×7 font 95 chars, HD44780 4-bit mode, E falling edge |
| 21 SVG components | +Servo, +LCD16x2 rispetto ai 19 originali |
| Paralleli ~90%+ | MNA solver (era ~50-60% con resistenze parallele) |
| Tinkercad parity | ~45/56 features (80%) |

---

## Sprint 3 — 13/02/2026 (Polish & Deploy)
**Obiettivo**: UI/UX professionale, export, test, deploy

| Feature | LOC | Dettaglio |
|---------|-----|-----------|
| BOM Panel | 265 | tabella componenti con icona, nome, quantità, valori |
| Annotations | 157 | note draggabili SVG sul canvas (#FFF9C4 sticky-note) |
| Export PNG | — | screenshot circuito via SVG serialization |
| Shortcuts Panel | 190 | modal con tutte le scorciatoie (3 categorie) |
| Bundle optimization | — | manualChunks: CodeMirror, AVR, React → -26% chunk principale |
| Test E2E | 68/69 | solo v1-cap13-esp2 senza pinAssignments |

**Statistiche post-Sprint 3**:
- 67 esperimenti (38+18+11 → poi espansi a 69)
- Build time: 4.35s
- Deploy: Vercel + custom domain elabtutor.school

---

## Sessioni 75-108 — fino 10/03/2026 (Galileo Evolution)
**Tema**: Da "UNLIM" a "Galileo" — identità e intelligenza AI

| Sessione | Feature |
|----------|---------|
| S75-S85 | Brain V1-V5 training (modelli leggeri per routing AI) |
| S86-S95 | Identity hardening: nanobot.yml 3.0 — regola anti-leak "UNLIM" |
| S96-S105 | Wiring Helper, Debug Assistant, Progressive Hints, Quiz Expansion |
| S106-S108 | Code Explanation, Brain V13 (Qwen3.5-2B Q5_K_M GGUF) |

**Galileo AI (S115+)**:
- 26+ action tags: `[AZIONE:loadexp]`, `[AZIONE:play]`, `[AZIONE:highlight]`, ecc.
- Vision: analisi screenshot circuito
- Multi-intent: più azioni in una risposta
- Identity: 0 leak "UNLIM" da ciclo 55

**Brain V13 su VPS**:
- Modello: Qwen3.5-2B Q5_K_M (1.4GB)
- URL: http://72.60.129.50:11434
- Hugging Face: AIndrea/galileo-brain-gguf (privato)
- Scopo: routing intent rapido, offline-ready

---

## S117-S119 — 23/03/2026 (Automa Bootstrap)
**Tema**: Sistema autonomo di auto-miglioramento

| Fix | Dettaglio |
|-----|-----------|
| docker-compose | Setup orchestratore container |
| eval-200 | 200+ benchmark automatici |
| pedagogy-sim | Simulazione lezioni pedagogiche |
| Electron View PoC | Visualizzazione stato circuiti |

---

## Automa Loop — 23-25/03/2026 (61+ cicli)

### Score Evolution
| Periodo | Score Composito | Evento |
|---------|----------------|--------|
| Ciclo 1-57 | 0.8934 | Fase di stabilizzazione |
| Ciclo 58-61 | 0.8934 → bloccato | iPad + Lighthouse bloccanti |
| Ciclo 62-65 | 0.8934 → 0.9586 | Sblocco iPad (ipad_compliance=1.0) |
| Ciclo 1-11 (25/03) | 0.9586 → 0.9593 | Progressione lenta |

### Fix Critici per Score
- **Ciclo 3**: Google Fonts self-hosted (FiraCode, OpenSans, Oswald)
- **Ciclo 52**: Font preload + lazy images → Lighthouse 62→73%
- **Ciclo 60**: Touch target fix → ipad_compliance 1.0 stabile
- **Ciclo 11**: BackstopJS baseline creata per visual regression

---

## Architettura Tecnica Corrente (25/03/2026)

### Stack
- **Frontend**: React 19 + Vite 7 (NO react-router — routing custom useState)
- **AI Chat**: nanobot (n8n + Anthropic Claude) su Render
- **Brain locale**: Qwen3.5-2B su VPS Hostinger
- **Simulatore**: CircuitSolver (KVL/KCL/MNA) + AVRBridge + avr8js

### Deploy
| Sistema | URL | Note |
|---------|-----|------|
| App principale | https://www.elabtutor.school | Vercel |
| Nanobot AI | https://elab-galileo.onrender.com | Render |
| Brain VPS | http://72.60.129.50:11434 | Hostinger |
| Vetrina | https://funny-pika-3d1029.netlify.app | Netlify (solo vetrina) |

### Regole Immutabili (CLAUDE.md)
1. Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
2. BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
3. Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
4. `npm run build` DEVE passare prima di ogni deploy
5. Target: bambini 8-12 anni — feedback visivo forte

### Palette ELAB
- Navy: #1E4D8C
- Lime: #7CB342
- Vol1: #7CB342 / Vol2: #E8941C / Vol3: #E54B3D

---

## Contenuti Didattici

### 67-69 Esperimenti (3 volumi)
| Volume | N. Esp | Contenuto |
|--------|--------|-----------|
| Vol1 | 38 | LED, RGB, Pulsante, Potenziometro, LDR, Buzzer, Reed Switch, Elettropongo |
| Vol2 | 18 | LED avanzato, Condensatore, MOSFET, Fototransistor, Motore DC |
| Vol3 | 11 | Arduino: pin digitali/analogici, Serial, progetti |

### 4 Giochi Didattici
1. Detective Circuiti (trova l'errore)
2. Prevedi-Osserva-Spiega (POE)
3. Reverse Engineering (scopri cosa fa)
4. Circuit Review (valuta circuiti)

---

## Automa — Architettura Sistema (25/03/2026)

### File Principali
| File | Righe | Ruolo |
|------|-------|-------|
| orchestrator.py | 900+ | Loop principale: CHECK→ANALISI→RESEARCH→IMPLEMENT→EVAL→DECIDE |
| evaluate.py | 276 | LOCKED — metriche composite (Karpathy prepare.py) |
| checks.py | 393 | 7 health check automatici |
| benchmarks.py | 205 | 91+ benchmark definiti |
| self_exam.py | 750+ | Auto-riflessione ogni 5 cicli |
| parallel_research.py | 260+ | Thread Kimi K2.5 parallelo metric-driven |
| agent.py | 512 | Wrapper Agent SDK + fallback claude -p |
| context_db.py | 279 | SQLite knowledge store (state/context.db) |

### Score Evaluation Weights
| Metrica | Peso | Valore Target |
|---------|------|---------------|
| galileo_tag_accuracy | 20% | 1.0 |
| galileo_gulpease | 15% | >0.80 |
| galileo_identity | 15% | 1.0 |
| build_pass | 15% | 1.0 |
| content_integrity | 10% | 1.0 |
| ipad_compliance | 10% | 1.0 |
| lighthouse_perf | 5% | >0.85 |

---

*Generato automaticamente — aggiornare ad ogni sessione significativa*
