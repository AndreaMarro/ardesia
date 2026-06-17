# SESSION 74 — GALILEO ONNIPOTENZA: Simulator Reality + AI Supremacy

> **Data**: 2026-03-06
> **Obiettivo**: Simulatore identico alla realtà + Galileo che governa TUTTO via chat
> **Metodo**: Superpowers skills + Ralph Loop + Chrome verification + Quality Audit
> **Durata stimata**: Sessione lunga (3-5 ore di lavoro autonomo)

---

## REGOLE IMPERATIVE PER QUESTA SESSIONE

1. **USA SEMPRE le superpowers skills** — Invoca `brainstorming` prima di ogni decisione creativa, `systematic-debugging` per ogni bug, `verification-before-completion` prima di dichiarare qualsiasi cosa completata
2. **TESTA IN CHROME** — Ogni fix deve essere verificato nel browser reale, non solo nel codice
3. **RALPH LOOP** — Dopo ogni fase, lancia Ralph Loop per validare. Non procedere finché non passa
4. **QUALITY AUDIT** — Alla fine di ogni macro-fase, lancia quality-audit per regressioni
5. **TodoWrite SEMPRE** — Traccia ogni singolo task. Mai più di 1 task in_progress alla volta
6. **WEB SEARCH** — Cerca documentazione aggiornata quando lavori su pin mapping, specifiche componenti, standard breadboard
7. **CONTEXT PRESERVATION** — Dopo ogni fase completata, scrivi un riassunto nel TodoWrite e aggiorna MEMORY.md
8. **ZERO ASSUNZIONI** — Se non sei sicuro di un pin name, LEGGILO dal file. Se non sei sicuro di un handler, LEGGILO dal codice. Mai indovinare.
9. **COMMIT ATOMICI** — Un commit per ogni fix. Messaggi chiari. Non accumulare.
10. **DEPLOY DOPO OGNI FASE** — Vercel dopo frontend, Render dopo nanobot. Verifica health check.

---

## PREREQUISITI — Carica Contesto

Prima di qualsiasi azione, ESEGUI questi comandi in sequenza:

```
1. Leggi /Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/MEMORY.md
2. Leggi /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/plans/SESSION-74-GALILEO-ONNIPOTENZA.md (questo file)
3. Leggi i file chiave del simulatore:
   - src/components/simulator/engine/PlacementEngine.js (WIRING_TEMPLATES + KNOWN_TYPES)
   - src/components/simulator/utils/pinComponentMap.js (pin mappings)
   - nanobot/server.py (deterministic_action_fallback + normalize_action_tags)
   - src/components/tutor/ElabTutorV4.jsx (action tag handlers + __ELAB_API)
4. Verifica la build: cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build
```

---

## FASE 0: DIAGNOSI (30 min)

### 0.1 — Audit Pin Names
**Skill**: Invoca `quality-audit`

Per OGNI componente SVG, verifica che i pin names siano identici in:
- Il file JSX del componente (es. `Led.jsx` → pin definitions)
- `PlacementEngine.js` → WIRING_TEMPLATES
- `pinComponentMap.js` → pin mappings
- `CircuitSolver.js` → pin handling

**Componenti da verificare** (21 totali):
```
Led, Resistor, Capacitor, PushButton, Potentiometer,
PhotoResistor, BuzzerPiezo, MotorDC, RgbLed, Diode,
MosfetN, Phototransistor, ReedSwitch, Servo, Multimeter,
LCD16x2, Battery9V, NanoR4Board, BreadboardHalf, BreadboardFull, Wire
```

### 0.2 — Mappa Bug Noti
Dai risultati dell'audit S74 pre-sessione, i bug CONFERMATI sono:

| # | Componente | Bug | Severità | File |
|---|-----------|-----|----------|------|
| 1 | MotorDC | Pin `positive/negative` nel JSX, `terminal1/terminal2` in PlacementEngine | HIGH | MotorDC.jsx:82-85, PlacementEngine.js:574-575 |
| 2 | PhotoResistor | Pin `pin1/pin2` nel JSX, `lead1/lead2` in PlacementEngine. Tipo `photo-resistor` vs `photoresistor` | HIGH | PhotoResistor.jsx:58-61, PlacementEngine.js:545-550 |
| 3 | PushButton | 4 pin nel JSX ma WIRING_TEMPLATES usa solo pin1/pin2 (manca pin3/pin4) | MEDIUM | PushButton.jsx:72-77, PlacementEngine.js:520-525 |
| 4 | Phototransistor | Auto-wire cerca `anode/positive/pin1/signal/vcc` ma ha `collector/emitter` | MEDIUM | PlacementEngine.js:637-639 |
| 5 | Battery9V | Presente in KNOWN_TYPES ma MANCA da WIRING_TEMPLATES | MEDIUM | PlacementEngine.js:507-597 |
| 6 | Multimeter | Probe render a y=55 ma pin definiti a y=45 (10px mismatch) | MEDIUM | Multimeter.jsx:19-20 vs 179-181 |
| 7 | MosfetN | WIRING_TEMPLATES usa gate/source/drain — VERIFICARE che JSX usi gli stessi nomi | HIGH | MosfetN.jsx, PlacementEngine.js:557-562 |
| 8 | RgbLed | Stato vecchio (r/g/b) vs nuovo (red/green/blue) — format mismatch | LOW | RgbLed.jsx:89-94, pinComponentMap.js:365 |
| 9 | Resistor | WIRING_TEMPLATES usa lead1/lead2 — VERIFICARE che JSX usi gli stessi | MEDIUM | PlacementEngine.js:515-518 |
| 10 | Capacitor | WIRING_TEMPLATES usa positive/negative — VERIFICARE | LOW | PlacementEngine.js:532-537 |

### 0.3 — Crea TodoWrite con TUTTI i bug
Dopo la diagnosi, crea una TodoWrite con ogni singolo bug come task separato. Ordine: HIGH prima, poi MEDIUM, poi LOW.

---

## FASE 1: FIX SIMULATORE — Pin Reality (2-3 ore)

### Regola Fondamentale
> **I pin names nel componente JSX sono la SOURCE OF TRUTH.**
> PlacementEngine, pinComponentMap, e CircuitSolver si ADATTANO al JSX, non viceversa.
> Motivo: il JSX definisce la geometria SVG e i pin fisici. Tutto il resto è derivato.

### 1.1 — Fix HIGH Priority

**Per ogni fix, segui questo workflow esatto:**

```
1. LEGGI il file JSX del componente → annota i pin names esatti
2. LEGGI PlacementEngine.js → trova il WIRING_TEMPLATES entry
3. CONFRONTA — identifica il mismatch
4. MODIFICA PlacementEngine.js per matchare il JSX
5. CERCA in pinComponentMap.js per lo stesso componente → fix se necessario
6. CERCA in CircuitSolver.js per lo stesso componente → fix se necessario
7. CERCA in nanobot YAML (circuit.yml, nanobot.yml) per riferimenti ai pin → fix
8. BUILD: npm run build → 0 errori
9. COMMIT: git commit con messaggio specifico
```

**FIX-1: MotorDC**
- Leggi MotorDC.jsx → pin names reali
- Aggiorna WIRING_TEMPLATES `'motor-dc'` entry con i pin names corretti
- Verifica pinComponentMap.js per motor-dc handling

**FIX-2: PhotoResistor**
- Leggi PhotoResistor.jsx → pin names reali
- Aggiorna WIRING_TEMPLATES `'photoresistor'` con pin names corretti
- FIX TIPO: se il componente usa `'photo-resistor'` come type, allinea KNOWN_TYPES in PlacementEngine
- Verifica pinComponentMap.js

**FIX-3: MosfetN**
- Leggi MosfetN.jsx → verifica che usi `gate/source/drain`
- Se diverso, aggiorna PlacementEngine
- Verifica CircuitSolver per MOSFET handling

### 1.2 — Fix MEDIUM Priority

**FIX-4: PushButton 4-pin**
- Il pulsante reale ha 4 pin (2 coppie collegate internamente)
- WIRING_TEMPLATES deve gestire almeno 2 pin (quelli su lati opposti)
- Verifica che il CircuitSolver tratti i pin connessi internamente

**FIX-5: Phototransistor auto-wire**
- In PlacementEngine, la funzione che cerca il "signal pin" usa una lista hardcoded: `['anode', 'positive', 'pin1', 'signal', 'vcc']`
- Aggiungi `'collector'` e `'emitter'` alla lista di fallback
- OPPURE: crea una mappa per-component-type dei pin "signal"

**FIX-6: Battery9V wiring template**
- Aggiungi entry in WIRING_TEMPLATES per `'battery9v'`
- Pin: `positive` → bus +, `negative` → bus -
- Posizione default: sotto la breadboard

**FIX-7: Multimeter probe position**
- Allinea y coordinate: probes render e pin definitions devono usare lo stesso y
- Scegli: y=45 (pin) o y=55 (render) e allinea entrambi

**FIX-8: Resistor pin names**
- Leggi Resistor.jsx → verifica pin names esatti
- Se diversi da `lead1/lead2`, aggiorna PlacementEngine

### 1.3 — Fix LOW Priority

**FIX-9: Capacitor pin names** — Verifica e allinea
**FIX-10: RgbLed state format** — Unifica su formato nuovo

### 1.4 — Post-Fix Validation

```
1. npm run build → 0 errori
2. Lancia dev server: npm run dev
3. Per OGNI componente fixato:
   a. Aggiungi manualmente alla breadboard
   b. Verifica che i pin siano visibili e cliccabili
   c. Collega un filo → verifica snap-to-pin
   d. Chiedi a Galileo "aggiungi un [componente]" → verifica placement
   e. Chiedi a Galileo "collega [componente] al pin D3" → verifica wiring
```

**Skill**: Invoca `verification-before-completion` prima di dichiarare la Fase 1 completata.

### 1.5 — Deploy Intermedio
```bash
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes
```

---

## FASE 2: GALILEO SUPREMACY — Test Onnipotenza (1-2 ore)

### 2.1 — Test Suite Completa
**Skill**: Invoca `ralph-loop:ralph-loop`

Testa OGNI singola azione che Galileo dovrebbe poter eseguire. Usa Chrome MCP o Playwright per verifica visiva reale.

**LISTA ESAUSTIVA DEI TEST** (30 test):

#### Gruppo A: Simulazione (3 test)
```
A1: "Avvia la simulazione" → aspetta [AZIONE:play] → verifica che il simulatore sia in play
A2: "Metti in pausa" → aspetta [AZIONE:pause] → verifica pausa
A3: "Resetta tutto" → aspetta [AZIONE:reset] → verifica reset
```

#### Gruppo B: Componenti Singoli (7 test)
```
B1: "Metti un LED sulla breadboard" → verifica LED piazzato con INTENT
B2: "Aggiungi un resistore da 220 ohm" → verifica resistore con valore
B3: "Metti un pulsante" → verifica pulsante piazzato
B4: "Aggiungi un buzzer" → verifica buzzer piazzato
B5: "Metti un potenziometro" → verifica pot piazzato
B6: "Aggiungi un motore DC" → verifica motore piazzato (PIN FIX VERIFICATO)
B7: "Metti un fotoresistore" → verifica photoresistor (PIN FIX VERIFICATO)
```

#### Gruppo C: Circuiti Multi-Componente (5 test)
```
C1: "Costruisci un circuito con un LED e un resistore" → verifica 2 componenti + fili
C2: "Costruisci un circuito con LED, resistore e pulsante" → verifica 3 comp + fili
C3: "Metti 3 LED rossi in parallelo" → verifica 3 LED
C4: "Costruisci il circuito del semaforo con 3 LED" → verifica piazzamento corretto
C5: "Aggiungi un potenziometro e collegalo ad A0" → verifica wiring ad Arduino
```

#### Gruppo D: Wiring Specifico (4 test)
```
D1: "Collega il LED al pin D3" → verifica filo LED→D3
D2: "Collega il positivo del buzzer a D9" → verifica pin specifico
D3: "Collega il motore ai pin D5 e GND" → verifica wiring motore (PIN FIX)
D4: "Rimuovi tutti i fili" → verifica clearall
```

#### Gruppo E: Navigazione (4 test)
```
E1: "Carica l'esperimento del primo circuito" → verifica loadexp
E2: "Apri il manuale del volume 1" → verifica opentab:manuale
E3: "Vai alla pagina del LED nel manuale" → verifica openvolume
E4: "Apri il simulatore" → verifica opentab:simulatore
```

#### Gruppo F: Codice (3 test)
```
F1: "Scrivi il codice per far lampeggiare un LED" → verifica setcode
F2: "Compila il codice" → verifica compile
F3: "Mostrami il codice per il semaforo" → verifica setcode con codice multi-LED
```

#### Gruppo G: Interazioni (2 test)
```
G1: "Premi il pulsante" → verifica interact:press
G2: "Ruota il potenziometro a metà" → verifica interact:setPosition
```

#### Gruppo H: Educativi (2 test)
```
H1: "Fammi un quiz su questo esperimento" → verifica quiz dispatch
H2: "Cerca un video su come funziona un LED" → verifica youtube search
```

### 2.2 — Criterio di Successo
- **PASS**: L'azione viene eseguita correttamente nel simulatore visibile in Chrome
- **PARTIAL**: L'azione viene eseguita ma con errori minori (posizione sbagliata, pin sbagliato)
- **FAIL**: L'azione non viene eseguita, o viene eseguita in modo completamente errato

**Target**: 28/30 PASS (93%+). Se sotto 28, NON procedere alla fase successiva.

### 2.3 — Fix dei Fail
Per ogni test FAIL o PARTIAL:
1. **Skill**: Invoca `systematic-debugging`
2. Identifica il punto esatto di failure (nanobot? frontend? PlacementEngine?)
3. Fix, build, test di nuovo
4. Commit atomico

### 2.4 — Ralph Loop Finale Fase 2
**Skill**: Invoca `ralph-loop:ralph-loop` con i 5 test più critici:
1. Circuito multi-componente (C2)
2. Wiring specifico (D1)
3. Avvia simulazione dopo build (A1 dopo C2)
4. Vision: "Guarda il mio circuito e dimmi se è corretto" (se tab canvas/simulator)
5. Smontaggio: "Rimuovi il LED" → [AZIONE:removecomponent:led1]

---

## FASE 3: SMONTAGGIO & CONTROLLO TOTALE (30 min)

### 3.1 — Test "Dio Mode"
Galileo deve poter SMONTARE e RICOSTRUIRE un intero circuito via chat:

```
Sequenza test:
1. "Costruisci un circuito con LED e resistore collegati a D3"
   → Verifica circuito funzionante
2. "Avvia la simulazione"
   → LED acceso
3. "Metti in pausa"
   → Simulazione ferma
4. "Rimuovi il LED"
   → LED rimosso, resistore resta
5. "Sostituisci con un buzzer"
   → Buzzer piazzato dove era il LED
6. "Collegalo a D3"
   → Buzzer collegato
7. "Avvia"
   → Simulazione con buzzer
8. "Pulisci tutto"
   → Breadboard vuota
9. "Carica l'esperimento v1-cap6-primo-circuito"
   → Esperimento caricato con componenti pre-piazzati
10. "Compila ed avvia"
    → Codice compilato + simulazione partita
```

**Target**: 10/10 comandi eseguiti in sequenza senza errori.

### 3.2 — Test Contesto Persistente
Galileo deve RICORDARE cosa c'è sul circuito:

```
1. "Metti un LED" → LED piazzato
2. "Che componenti ci sono?" → Galileo lista: "1 LED, 1 Arduino Nano"
3. "Aggiungi un resistore vicino al LED" → Resistore piazzato VICINO al LED
4. "Collegali insieme" → Galileo capisce LED+Resistore e crea filo
5. "Cosa manca per completare il circuito?" → Galileo suggerisce: "collegamento ad Arduino e GND"
```

---

## FASE 4: iPAD OPTIMIZATION (30 min)

### 4.1 — Diagnosi iPad
Basandoti su TUTTO il contesto accumulato nelle fasi precedenti:

1. **Web Search**: Cerca "iPad Safari CSS touch target 2026 best practices"
2. **Web Search**: Cerca "iPad viewport responsive simulator SVG 2026"
3. Identifica i componenti del simulatore che NON funzionano su iPad:
   - Touch targets troppo piccoli (< 44px)
   - Hover-only interactions (potentiometro, pulsante)
   - SVG viewport su iPad (dimensioni schermo)
   - Chat overlay keyboard push-up
   - Toolbar overflow su iPad landscape/portrait

### 4.2 — Fix iPad Critici
Per ogni issue trovata:
1. Fix CSS con media queries per tablet
2. Fix touch handlers (long-press = right-click, pinch = zoom)
3. Verifica con `preview_resize` preset tablet (768x1024)

### 4.3 — iPad Galileo Test
Se possibile con Chrome DevTools device emulation:
1. Apri il simulatore in iPad mode
2. Testa i 5 comandi Galileo più comuni
3. Verifica che le azioni del simulatore funzionino con touch

---

## FASE 5: VERIFICA FINALE & DEPLOY (30 min)

### 5.1 — Quality Audit Completa
**Skill**: Invoca `quality-audit`
- Build health (0 errori, 0 warning critici)
- Bundle size check
- Console.log check (0 inappropriate)
- Font check (Roboto + Poppins sito, Oswald + Open Sans + Fira Code tutor)
- Touch target audit (44px minimum)

### 5.2 — Ralph Loop Finale
**Skill**: Invoca `ralph-loop:ralph-loop`
Esegui i 3 test della "Ralph Loop Classica":
1. Text chat — risposta contestuale sull'esperimento corrente
2. Vision — screenshot del circuito analizzato da Galileo
3. Action tags — comando eseguito nel simulatore

### 5.3 — Deploy Produzione
```bash
# Frontend
cd "VOLUME 3/PRODOTTO/elab-builder" && npm run build && npx vercel --prod --yes

# Backend (se modificato)
cd "VOLUME 3/PRODOTTO/elab-builder/nanobot" && git add -A && git commit -m "S74: pin fixes + Galileo omnipotence" && git push origin main
```

### 5.4 — Smoke Test Post-Deploy
1. Apri https://www.elabtutor.school in Chrome
2. Login con credenziali test
3. Apri simulatore
4. Chiedi a Galileo: "Costruisci un circuito con LED e resistore, collegali a D3 e avvia la simulazione"
5. Verifica esecuzione completa

### 5.5 — Aggiorna MEMORY.md
**Skill**: Invoca `claude-md-management:revise-claude-md`
Aggiorna con:
- Nuovi punteggi
- Bug risolti
- Issues rimasti
- Stato iPad

---

## APPENDICE A: Comandi Headless per Batch Testing

Se serve testare in batch (programmatic function calling via CLI):

```bash
# Test singolo con context preservation
SESSION_ID="s74-$(date +%s)"

claude -p "Apri il simulatore ELAB, aggiungi un LED e un resistore, collegali a D3, avvia la simulazione. Verifica che il LED si accenda." \
  --session-id "$SESSION_ID" \
  --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebFetch,WebSearch" \
  --output-format json

# Continua nella stessa sessione con contesto
claude -p "Ora rimuovi il LED e sostituiscilo con un buzzer. Il resistore deve restare." \
  --session-id "$SESSION_ID" \
  --allowedTools "Bash,Read,Write,Edit" \
  --output-format json
```

## APPENDICE B: Chrome MCP Test Pattern

Per ogni test che richiede verifica visiva:

```
1. mcp__Claude_in_Chrome__tabs_context_mcp → ottieni tabId
2. mcp__Claude_in_Chrome__navigate → vai a https://www.elabtutor.school
3. mcp__Claude_in_Chrome__read_page → leggi stato pagina
4. mcp__Claude_in_Chrome__find → trova elemento specifico (es. "LED component")
5. mcp__Claude_in_Chrome__computer screenshot → cattura stato visivo
6. Confronta con stato atteso
```

## APPENDICE C: Programmatic Function Calling Pattern

Per massimizzare efficienza, usa il pattern "structured tool chaining":

```
Fase 1: DIAGNOSI (read-only)
  → Glob + Grep + Read in parallelo
  → Nessuna modifica

Fase 2: PIANO (structured)
  → TodoWrite con tutti i fix
  → Ordine di priorità

Fase 3: ESECUZIONE (edit + verify)
  → Per ogni fix: Edit → Build → Test → Commit
  → Mai più di 1 file alla volta per fix atomici

Fase 4: VALIDAZIONE (test + deploy)
  → Ralph Loop con Chrome
  → Quality Audit
  → Deploy solo se tutto PASS
```

---

## METRICHE DI SUCCESSO SESSIONE

| Metrica | Target | Critico |
|---------|--------|---------|
| Pin bugs fixati | 10/10 | 7/10 minimo |
| Test Galileo PASS | 28/30 | 25/30 minimo |
| Sequenza Dio Mode | 10/10 | 8/10 minimo |
| Build errors | 0 | 0 (bloccante) |
| Ralph Loop finale | 3/3 PASS | 2/3 minimo |
| iPad critici fixati | 3/3 | Best effort |

---

**Autore**: Claude Code S73 (pre-sessione)
**Per**: Sessione 74 — Galileo Onnipotenza
**Ultimo aggiornamento**: 2026-03-06
