# Storia e Conoscenza Completa — ELAB Tutor
> Ultimo aggiornamento: 24/03/2026 (ciclo 49+)
> Autore: Andrea Marro. © Tutti i diritti riservati.

---

## COS'È ELAB TUTOR

ELAB Tutor è un simulatore di circuiti educativo con AI tutor integrato ("Galileo"),
pensato per bambini 8-14 anni. I ragazzi trascinano componenti su una breadboard virtuale,
scrivono codice Arduino/Scratch, e dialogano con un tutor AI che risponde in italiano.

**URL produzione**: https://www.elabtutor.school (Vercel)
**Backend AI (Nanobot)**: https://elab-galileo.onrender.com (Render, free tier, cold start ~30s)
**Sito vetrina pubblico**: https://funny-pika-3d1029.netlify.app (Netlify)

---

## IL PRINCIPIO ZERO (definizione esatta di Andrea Marro)

> "ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e non solo.
> Persone totalmente inesperte possono mettersi alla LIM e poter spiegare subito,
> anche appassionandosi. Apprendimento orizzontale."

**Implicazioni concrete:**
- L'insegnante NON deve conoscere elettronica. Galileo è il suo "libro intelligente".
- Lo STUDENTE raramente interagisce con la LIM — è l'insegnante che usa ELAB Tutor.
- Gli STUDENTI VEDONO la LIM → linguaggio SEMPRE 10-14 anni in tutto ciò che appare a schermo.
- Galileo NON si sostituisce all'insegnante: lo ABILITA.
- Modello GIUSTO: insegnante usa ELAB → capisce i concetti → li spiega con le SUE parole.
- Modello SBAGLIATO: insegnante clicca → Galileo parla → studenti leggono passivamente.
- Dopo 10 lezioni: l'insegnante SA l'elettronica base. Galileo diventa assistente, non stampella.

**Basi teoriche:**
- Reggio Emilia (Malaguzzi): insegnante come co-learner
- Montessori: ambiente auto-correttivo (il simulatore dà feedback immediato)
- Freire: educazione orizzontale, co-investigazione
- Mitra (SOLE): mediatore non-esperto + tecnologia = apprendimento efficace
- Congruenza cognitiva (Lockspeiser): un novizio è MEGLIO di un esperto
- Effetto Protégé (Nestojko): chi si prepara a insegnare impara di più

---

## I TRE VOLUMI

### Volume 1 — SCOPERTA (38 esperimenti, Cap 6-14)
Ogni capitolo aggiunge UN concetto. Target: nessuna conoscenza pregressa.
**Filo rosso**: LED → LED + resistore → potenziometro → parallelo → condensatore
                 → fotoresistenza → diodo → MOSFET
**Colore**: Verde (#7CB342)

### Volume 2 — COMPRENSIONE (18 esperimenti, Cap 6-12)
Il circuito "sente il mondo". Sensori, logica, circuiti più complessi.
**Colore**: Arancione (#E8941C)

### Volume 3 — CREAZIONE (6 esperimenti AVR, Cap 6-8)
Il circuito "pensa". Arduino ATmega328p, codice C++, programmazione.
**Colore**: Rosso (#E54B3D)

**TOTALE**: 62 esperimenti. Curriculum YAML: 61/62 completi (solo v1-cap13-esp2 mancante pinAssignments).

**Vocabolario progressivo (CRITICO):**
- Cap 6 Vol1: "LED, batteria, filo". VIETATO: "resistenza, Ohm, parallelo"
- Cap 9 Vol1: "serie, parallelo". VIETATO: "condensatore, MOSFET, Arduino"
- Vol3: può usare tutto — è l'ultimo volume

---

## STACK TECNICO COMPLETO

### Frontend (elab-builder → Vercel)
- React 19 + Vite 6 (NO react-router — routing custom con useState)
- CSS Modules + Design System (15 classi `.u-*`)
- Bundle: ~1.1MB gzip con code splitting manualChunks

### Simulatore (motore)
| File | Righe | Ruolo |
|------|-------|-------|
| `src/components/simulator/NewElabSimulator.jsx` | ~1900 | Main simulator component |
| `src/components/simulator/engine/CircuitSolver.js` | 1702 | DC solver: Union-Find + MNA/KCL |
| `src/components/simulator/engine/SimulationManager.js` | 302 | Orchestratore CircuitSolver/AVRBridge |
| `src/components/simulator/engine/AVRBridge.js` | 1051 | Bridge avr8js: GPIO/ADC/PWM/USART + Worker |
| `src/components/simulator/engine/avrWorker.js` | 348 | Web Worker CPU AVR |
| `src/components/simulator/canvas/SimulatorCanvas.jsx` | 1382 | Canvas SVG zoom/pan/drag |
| `src/components/simulator/canvas/WireRenderer.jsx` | — | Wire bezier routing + net highlight |

**22 componenti SVG**: LED, resistore, breadboard, Arduino Nano, buzzer, potenziometro,
fotoresistenza, servo, RGB LED, LCD 16x2, condensatore, MOSFET, diodo, multimetro...

**Regole immutabili del simulatore:**
- Pin map ATmega328p: D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC
- Scala SVG: NanoR4Board usa SCALE=1.8
- BB_HOLE_PITCH = 7.5px, SNAP_THRESHOLD = 4.5px
- Bus naming: `bus-bot-plus/minus` NON `bus-bottom-plus/minus`
- NON modificare: `src/components/simulator/engine/*` (solver, AVR, simulation)

### Backend AI — Nanobot (FastAPI + Docker → Render)
- 5 specialisti: circuit, code, tutor, vision, teacher
- Multi-LLM racing: DeepSeek + Groq (text), Gemini 2.5 Flash (vision)
- Intent classification con `classify_intent()`
- Teacher specialist: linguaggio LIM 10-14 anni, NON adulto
- API: `POST /chat`, `POST /vocab-check`, `GET /health`
- Cold start Render free tier: ~30 secondi

### API Globale Simulatore
`window.__ELAB_API` (unified):
- `.galileo.highlightComponent(ids)`, `.galileo.highlightPin(refs)`, `.galileo.clearHighlights()`
- `.galileo.serialWrite(text)`, `.galileo.getCircuitState()`
- `.on(event, callback)`, `.off(event, callback)` — pub/sub
- Events: experimentChange, stateChange, serialOutput, componentInteract, circuitChange

### Sito Vetrina (newcartella → Netlify)
- 16 pagine statiche: landing, volumi, kit, contatti, admin dashboard
- Netlify Functions: auth, Notion DB, Stripe, Resend email
- Widget WhatsApp + Galileo AI su tutte le pagine

---

## STORIA DEL PROGETTO (sessioni)

### Origine (pre-Marzo 2026)
ELAB nasce come materiale fisico per insegnare elettronica a bambini 8-12 anni.
I volumi fisici (stampati) + kit hardware → poi si aggiunge il simulatore digitale.
Il backend AI iniziale (galileo-backend/) ora deprecato, sostituito da Nanobot.

### Sprint 1 — COMPLETATO (12/02/2026) — Foundation
- Dead code eliminato: 2.566 LOC (7 file)
- God component spezzato: 3.507 → 1.831 LOC (9 file estratti)
- CSS: 3 module files creati
- GalileoAPI unificata in `__ELAB_API.galileo`
- Analytics: 7 lifecycle events → n8n webhook
- Event system pub/sub (5 event types)

### Sprint 2 — COMPLETATO (13/02/2026) — Features
- KCL/MNA solver (Gaussian elimination, paralleli ~90%+ accuracy)
- Multimeter V/Ω/A modes con probe draggabili
- Wire bezier routing + current flow animation
- Multi-select, Copy/Paste/Duplicate
- Web Worker per CPU AVR (pin batching 16ms, PWM 50ms)
- Componenti: Servo (PWM→angle) + LCD 16×2 (HD44780 4-bit, 95 chars)
- Tinkercad parity: ~45/56 features (80%)

### Sprint 3 — COMPLETATO (13/02/2026) — Polish & Deploy
- BOM Panel (265 LOC)
- Annotations draggabili SVG (157 LOC)
- Export PNG circuito
- Shortcuts Panel (190 LOC)
- Bundle optimization: 1.757KB → 1.305KB (-26%)
- Test: 68/69 esperimenti PASS
- Deploy: www.elabtutor.school

### Sessione 119 (23/03/2026)
- Identity leak fix: Nanobot risponde "sono UNLIM" alle provocazioni ✅
- Error translator: 24→35 pattern (case sensitivity, setup/loop, unterminated string)
- Vocab checker: endpoint `/vocab-check` live, 4/4 self-test PASS
- Teacher pre-lezione: `teacher.yml` + `classify_intent` routing
- Curriculum YAML: +3 (cap8-esp1, cap9-esp1, cap10-esp1), totale 9 dettagliati
- CSS utility: 15 classi `.u-*` in design-system.css
- Deploy Vercel + Render push

### Autoresearch loop (avviato ~23/03/2026)
- Ciclo 49 al 24/03/2026, score composito: 0.8975
- Tool: Claude Code (headless), DeepSeek R1, Gemini 2.5 Pro, Kimi K2.5
- Pattern Karpathy: modifica→misura→keep/discard

### Sessione S120 — Audit + PDR V3 (24/03/2026 sera)
- **61 cicli completati** oggi (C1 @ 00:45 → C61 @ 19:50)
- Score composito finale: **0.8934** (era 0.7156 a inizio giornata — recupero da 0.72)
- galileo_identity: **1.0** ✅ (fix UNLIM→Galileo in C55-56)
- ipad_compliance: **0.675** ❌ (13 bottoni <44px — FIX ESISTE ma deploy bloccato da NETLIFY_AUTH_TOKEN)
- lighthouse_perf: **0.620** ❌ (frozen tutto il giorno — serve lazy loading router.tsx)
- 3 commit oggi: orchestrator V2, parallel research, CSP headers fix
- **PDR-ORCHESTRATORE-V3.md** scritto (piano definitivo)
- **Fix implementati nella S120**: timeout evaluate.py (300→600s), "come fossi Andrea",
  force_summary(), _galileo_keepalive(), add_attempt() wired, findings con id+text,
  CoV + Zero-Regressioni nel prompt, modello aggiornato a claude-opus-4-6 ovunque
- **BLOCCHI APERTI**: NETLIFY_AUTH_TOKEN (richiesto da Andrea), lazy loading src/router.tsx

---

## METRICHE ATTUALI (ciclo 61, 24/03/2026 ~20:00)

| Metrica | Peso | Target V3 | Stato |
|---------|------|-----------|-------|
| galileo_identity | 15% | 1.0 | ✅ 1.00 (0/5 leaks) |
| content_integrity | 10% | 1.0 | ✅ 1.00 (62/62) |
| ipad_compliance | 10% | 1.0 | ❌ 0.675 (13 bottoni <44px — deploy bloccato) |
| lighthouse_perf | 5% | ≥0.90 | ❌ 0.620 (frozen — serve lazy loading) |
| gulpease | 15% | ≥85 | ⚠️ ~74 avg |
| **composite** | — | ≥0.95 | **0.8934** |

**GAP PRIORITARI (PDR V3):**
1. NETLIFY_AUTH_TOKEN mancante → iPad fix non deployato → score bloccato +0.031
2. lazy loading src/router.tsx → lighthouse 0.62→~0.80 → score +0.020
3. gulpease 74→85 → testi più semplici nel flusso principale

---

## TARGET UTENTE

- **Chi**: Insegnanti inesperti di elettronica nelle scuole italiane
- **Dove**: Scuole medie e superiori, aule con LIM (Lavagna Interattiva Multimediale) e iPad
- **Quando**: Lezioni di tecnologia, scienze, laboratorio
- **Età studenti**: 8-14 anni
- **Età insegnanti**: qualsiasi — anche chi non ha mai toccato un LED

---

## OBIETTIVI E KPI

### Qualità prodotto (autoresearch)
- Composite score ≥ 0.95 entro 4 settimane
- Lighthouse perf ≥ 80
- iPad compliance: 0 bottoni <44px
- Galileo tag accuracy ≥ 95%
- Gulpease ≥ 65 su tutte le risposte

### Prodotto e mercato
- 10 articoli "Come usare ELAB in classe" (automa/articles/)
- Teacher dashboard skeleton
- Vocab checker inline nella pipeline /chat
- i18n EN + ES (P2)
- PWA offline testato

### Business
- Budget mensile: ≤ €20 (escluso Claude Code)
- Andrea Marro è SEMPRE l'autore — watermark su tutto
- Zero regressioni: `npm run build` sempre verde

---

## PALETTE COLORI E DESIGN

- Navy: #1E4D8C
- Lime/Vol1: #7CB342
- Vol2: #E8941C
- Vol3: #E54B3D
- Touch minimo: ≥56px (LIM), ≥44px (iPad)
- Font: leggibile su LIM (grande, alto contrasto)

---

---

## STORIA DI ELAB TUTOR — EVOLUZIONE

### Origine
ELAB nasce come materiale fisico per insegnare elettronica a bambini 8-12 anni.
Volumi stampati + kit hardware → il simulatore digitale arriva come estensione naturale.
Fondatore e autore: **Andrea Marro**.
**Initial commit**: "ELAB Tutor simulator + Galileo AI backend" (sessioni 109-110).

### Linea temporale delle sessioni (selezionate)
| Sessione | Data appross. | Milestone |
|---|---|---|
| S109 | inizio 2026 | Initial commit. Breadboard drag & drop base. |
| S110 | — | Battery wire routing Bézier. iPad touch drag. |
| S111 | — | Scratch/Blockly crash fix. LCD Blockly blocks. |
| S112 | — | Lazy PDF volumes. Progress bar. Apple Pencil. |
| S113 | — | Battery wire routing V6 (L-shape lanes, 14px sep). |
| S114 | — | Parent-child attachment (components follow breadboard). |
| S115 | — | UNLIM Onnipotente v2. 12 nuove azioni. |
| S116 | — | iPad usability: pinch-zoom limits, palm rejection. |
| S161 | — | Blockly 12.4.1 crash fix. Scratch/Passo Passo. |
| Sprint 1 | 12/02/2026 | Dead code -2566 LOC. God component spezzato. |
| Sprint 2 | 13/02/2026 | KCL/MNA, Web Worker AVR, Servo+LCD. |
| Sprint 3 | 13/02/2026 | BOM, Annotations, Export PNG. Deploy Vercel. |
| S118 | — | P0/P1 tasks done. Nanobot identity leak filter. |
| S119 | 23/03/2026 | Teacher specialist. Vocab checker. Error translator 35 pattern. |
| S120+ | 24/03/2026 | Autoresearch loop (ciclo 49+). Score composito 0.8975. |

---

## STORIA DI GALILEO / UNLIM

### Il Nome "Galileo"
**Galileo** è il nome pubblico del tutor AI di ELAB, ispirato a **Galileo Galilei**:
scienziato che ha insegnato come osservare il mondo, fare esperimenti, mettere in dubbio
le certezze — esattamente ciò che ELAB vuole insegnare ai ragazzi.
**UNLIM** è il nome tecnico/interno dell'AI (nome usato nei prompt e nel codice).
Per l'utente finale: "Galileo". Per il codice/backend: "UNLIM".

### Evoluzione del Backend AI

#### Fase 1 — Backend Legacy (galileo-backend/)
Prima versione del backend Galileo. Python notebooks, corpus Notion, moduli vision.
**Ora deprecato**, sostituito completamente da Nanobot.

#### Fase 2 — Monolito UNLIM (pre-v3.0)
Backend monolitico con un solo prompt enorme per tutto (tutor, circuit, code).
Problemi: context overflow, risposte generiche, nessuna specializzazione.

#### Fase 3 — Multi-UNLIM Nanobot (v3.0+, attuale)
**Architettura corrente** (`nanobot/server.py`):
- 5 SPECIALISTI separati: circuit, code, tutor, vision, teacher
- 1 SHARED CONTEXT (`shared.yml`): identità, tag azione, regole comuni
- Ogni specialista ha il suo prompt YAML (`prompts/`)
- **Routing intelligente**: `classify_intent()` → specialista corretto
- **Parallel Racing**: DeepSeek + Groq in parallelo → winner (il più veloce)
- **Cache 4-layer**: risposta cached → Brain routing → LLM parallelo → quality boost
- **Sessioni persistenti**: JSON per ogni utente, memoria tra messaggi
- **Versione attuale**: UNLIM Nanobot v5 / Multi-UNLIM v4.0

#### Fase 4 — Galileo Brain (V13, attivo come shadow)
**Galileo Brain** = modello proprietario di routing locale (Qwen3-4B fine-tunato).
- Fine-tuned via Unsloth LoRA su dataset proprietario ELAB
- Deployment: VPS via Ollama (`galileo-brain` model)
- Modalità: "shadow" (predice ma non controlla), "active" (controlla routing)
- Costo: ~€4/mese (VPS)
- Scopo: classificare intent (action/circuit/code/tutor/vision/navigation) localmente,
  senza spendere token LLM per domande semplici (es. "avvia" → [AZIONE:play])

### Come Funziona il Routing Attuale (Nanobot v5)
```
Messaggio utente
    ↓
GalileoBrain.classify() [locale, shadow mode]
    ↓
classify_intent() [regex + keyword fallback]
    ↓
Specialista scelto: circuit | code | tutor | vision | teacher
    ↓
shared_context + specialist_prompt + stato_simulatore + history
    ↓
DeepSeek ←→ Groq (parallel racing) → winner
    ↓
Risposta UNLIM + [AZIONE:tag] estratti dal frontend
```

### Il Sistema di Tag Azione (27 tag)
Il cuore dell'integrazione Galileo ↔ Simulatore.
UNLIM non parla solo: **agisce** tramite tag nascosti nella risposta:
```
[AZIONE:play]           → avvia simulazione
[AZIONE:loadexp:ID]     → carica esperimento
[AZIONE:highlight:id]   → evidenzia componente SVG
[AZIONE:addwire:...]    → aggiunge filo
[AZIONE:quiz]           → apre quiz
[AZIONE:setcode:...]    → inietta codice Arduino
[AZIONE:youtube:...]    → cerca video
```
Il frontend legge questi tag e li "esegue" sul simulatore, poi li rimuove dal testo visibile.

### Gli Specialisti (v4.0)
| Specialista | Focus | Prompt file |
|---|---|---|
| circuit | Diagnosi circuito, fili, componenti, MNA | circuit.yml |
| code | Debug Arduino C++, Blockly, compilazione | code.yml |
| tutor | Pedagogia, teoria, quiz, giochi, navigazione | tutor.yml |
| vision | Analisi screenshot circuiti via Gemini Vision | vision.yml |
| teacher | Pre-lezione, briefing docente, 10-14 anni | teacher.yml |

### Regola Critica sull'Identità
UNLIM DEVE rispondere "Sono UNLIM, il tuo compagno di avventure nell'elettronica!".
MAI rivelare: modello LLM usato, architettura interna, nomi provider (Anthropic/Google/DeepSeek).
Il **identity leak** era un bug P0 risolto in S119: il filtro server-side blocca qualsiasi
risposta che contenga "Anthropic", "Claude", "DeepSeek", "Gemini", ecc.

---

## VINCOLI NON NEGOZIABILI

1. Zero regressioni — `npm run build` DEVE passare
2. L'insegnante inesperto è il vero utente
3. Andrea Marro è l'autore di tutto (watermark)
4. iPad e LIM centrali (touch ≥56px)
5. Linguaggio LIM 10-14 anni in tutto ciò che appare a schermo
6. CoV su ogni output
7. Massima onestà — numeri reali, mai compiacenza
8. Budget ~€20/mese (escluso Claude)
9. I sistemi si parlano (DeepSeek↔Gemini↔Kimi↔Brain)
10. NON modificare engine/* senza autorizzazione esplicita
