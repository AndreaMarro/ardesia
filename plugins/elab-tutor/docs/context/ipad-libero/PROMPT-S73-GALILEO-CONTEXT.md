# PROMPT S73 — Galileo Context Awareness + Action Reliability

> Copia-incolla questo intero prompt nella nuova sessione Claude Code.
> Poi lancia `/ralph-loop` per test ciclico dopo ogni fix.

---

## CONTESTO

Progetto ELAB Tutor — simulatore di circuiti per studenti 8-14 anni.
Root: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/`
Nanobot backend: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/nanobot/`
Deploy: Vercel (frontend) + Render (nanobot git push)

**Sessione precedente (S72)**: 11 bugfix iPad (P0 layout/snap/drag, P1 tooltip/ctxmenu/controlbar/pencil, P2 flicker/deselect). Build 0 errori. Score iPad 9.4/10. Deploy su Vercel completato.

**PROBLEMA CRITICO**: Galileo (AI tutor) NON riesce a seguire lo studente. Non capisce cosa sta succedendo sullo schermo, non monta i circuiti quando glielo chiedi, non esegue le istruzioni dell'utente. Il problema e' stato analizzato a fondo in S72 — 6 gap strutturali identificati.

**LEGGI PRIMA DI TUTTO** (in parallelo):
1. `docs/context/ipad-libero/02-INVARIANTS.md` — regole inviolabili
2. `docs/context/ipad-libero/05-TASK-TRACKER.md` — stato sprint
3. `.team-status/QUALITY-AUDIT.md` — audit S72

---

## DIAGNOSI BRUTALMENTE ONESTA (S72 Analysis)

### Stato Attuale: Cosa Funziona vs Cosa NO

| Scenario | Funziona? | Perche' |
|----------|-----------|---------|
| "Avvia la simulazione" | SI | Azione semplice, deterministic_action_fallback la cattura |
| "Fai il reset" / "Pulisci tutto" | SI | Idem, regex in deterministic_action_fallback |
| "Aggiungi un LED" | A VOLTE | deterministic_intent_injection cattura "aggiungi"+"led" → [INTENT:], MA lo specialist spesso genera solo narrativa |
| "Metti un LED vicino al resistore" | A VOLTE | Idem, ma "near" e "relation" dipendono dal parsing regex |
| "Costruisci un circuito con LED e resistore" | NO | Multi-component, nessuna decomposizione. Tutor override "cos" in "costruisci" potrebbe matchare |
| "Montami il circuito dell'esperimento" | NO | Nessun meccanismo che legge buildSteps e genera sequenza di azioni |
| "Collega il LED alla batteria" | RARO | Lo specialist circuit.yml puo' generare [AZIONE:addwire] ma spesso genera narrativa |
| "Cos'e' un resistore?" (teoria) | SI | Tutor specialist risponde bene |
| "Guarda il circuito, cosa manca?" | NO | Senza screenshot: tutor. Con screenshot: vision specialist che NON genera [AZIONE:] |
| "Spiega perche' il LED non si accende" (con circuito attivo) | PARZIALE | Circuit specialist riceve stato ma spesso non genera [AZIONE:highlight] |

### 6 Gap Strutturali

**G1 — TUTOR_OVERRIDE_KEYWORDS troppo aggressivo** (server.py:150-156)
`TUTOR_OVERRIDE_KEYWORDS` contiene "cos" (da "cos'e'"), "spiega", "carica", "esperimento".
Ma "costruisci" contiene "cos", "spiega come collegare" contiene "spiega", "carica l'esperimento e aggiungi un LED" contiene "carica".
Risultato: richieste di azione vanno al TUTOR specialist che NON puo' generare [AZIONE:addcomponent] (vietato in tutor.yml:88-89).

**G2 — Specialist genera narrativa anziche' tag** (circuit.yml + nanobot AI)
Il prompt circuit.yml dice "DEVI SEMPRE emettere il tag [INTENT:]" (riga 58) ma i modelli LLM (DeepSeek/Groq) non sono affidabili al 100% nel seguire istruzioni di formato. A volte il modello genera "Perfetto! Piazziamo il LED..." senza nessun tag.
Il sistema ha 3 layer di recovery: deterministic_intent_injection (server.py:864), repair_missing_action_tags (server.py:2320), deterministic_action_fallback (server.py:768). Ma il recovery copre solo pattern semplici.

**G3 — Multi-component build non decomposto** (server.py + circuit.yml)
"Costruisci un circuito con LED, resistore e batteria" richiede 3 addcomponent + N addwire.
`deterministic_intent_injection` (server.py:902) usa `_PLACE_REQUEST_RE.search()` che trova solo il PRIMO match.
Il PlacementEngine frontend (PlacementEngine.js) supporta array di componenti in `intent.components[]`, ma il backend non genera mai array con >1 elemento.

**G4 — Contesto manca il "goal state"** (ElabTutorV4.jsx:1177-1183)
Il messaggio a Galileo include:
- Stato circuito attuale (cosa c'e' sul canvas) ✅
- Esperimento attivo (ID + titolo + componenti attesi) ✅
- Posizioni componenti ✅
- Connessioni fili ✅
Ma NON include:
- Cosa l'utente sta CERCANDO DI FARE
- Differenza tra stato attuale e stato desiderato
- Storico azioni recenti nel contesto semantico

**G5 — Wiring: lo specialist non sa come collegare** (circuit.yml:45-46)
Il tag [AZIONE:addwire:comp1:pin1:comp2:pin2] richiede pin ESATTI (es. "led1:anode:r1:lead1").
Lo specialist LLM deve sapere nomi pin specifici di ogni componente. Non li ha nel prompt.
Il PlacementEngine supporta `"wires":"auto"` nel [INTENT:] ma il cablaggio automatico non e' completo per tutti i tipi.

**G6 — Vision specialist isolato** (vision.yml + server.py:171-172)
Quando l'utente manda screenshot (camera button o "guarda"), il messaggio va al vision specialist che analizza l'immagine ma NON genera [AZIONE:] — il prompt vision.yml non lo permette e non ha la lista dei tag. Lo studente riceve "Vedo un circuito con LED..." ma nessuna azione correttiva.

---

## FILE CHIAVE E LINE NUMBERS

### Backend (nanobot/)
- `server.py:126-163` — INTENT_KEYWORDS, TUTOR_OVERRIDE_KEYWORDS, CODE_OVERRIDE_KEYWORDS
- `server.py:166-209` — classify_intent() — keyword matching, score-based
- `server.py:212-223` — detect_all_intents() — multi-intent detection (usata da classify_complexity)
- `server.py:226-278` — classify_complexity() + COMPLEX_PATTERNS
- `server.py:281-283` — get_specialist_prompt()
- `server.py:676-724` — normalize_action_tags()
- `server.py:728-766` — is_action_request() + regex
- `server.py:768-791` — deterministic_action_fallback() — play/pause/reset/clearall/notebook
- `server.py:794-960` — deterministic_intent_injection() — component placement
- `server.py:2280-2399` — /tutor-chat endpoint — il flusso principale
- `prompts/circuit.yml` — specialist circuiti (99 righe)
- `prompts/tutor.yml` — specialist tutor (108 righe)
- `prompts/vision.yml` — specialist vision

### Frontend (src/)
- `ElabTutorV4.jsx:908-1025` — buildTutorContext() — cosa manda al backend
- `ElabTutorV4.jsx:1035-1044` — ACTION_INTENT_KEYWORDS regex
- `ElabTutorV4.jsx:1130-1220` — handleSend() — entry point chat
- `ElabTutorV4.jsx:1435-1641` — executeActionTags() — esecuzione azioni
- `PlacementEngine.js` (756 righe) — calcolo posizioni breadboard da [INTENT:]
- `NewElabSimulator.jsx:1194-1197` — circuitState generation (structured + text)

---

## FIX DA IMPLEMENTARE (in ordine)

### FIX-1: TUTOR_OVERRIDE_KEYWORDS — Stop false positive [P0]
**File**: `nanobot/server.py:150-156`
**Problema**: "costruisci" → match "cos" di TUTOR_OVERRIDE. "spiega come collegare" → match "spiega".
**Fix**: Cambiare da substring match a word-boundary match. Ogni keyword deve essere un pattern regex `\b...\b` o un match piu' preciso. Alternative:
- Usare `re.search(r'\b' + kw + r'\b', msg)` per ogni keyword
- Oppure spostare il check tutor DOPO il check circuit quando il messaggio contiene verbi d'azione

**Verifica**: "costruisci un circuito con LED" deve andare a `circuit`, NON `tutor`.

### FIX-2: Multi-component intent injection [P0]
**File**: `nanobot/server.py:864-960` (deterministic_intent_injection)
**Problema**: `_PLACE_REQUEST_RE.search()` trova solo il primo componente.
**Fix**: Usare `re.findall()` o iterare tutti i match. Generare `intent.components[]` con N elementi:
```python
[INTENT:{"action":"place_and_wire","components":[
  {"type":"led"},
  {"type":"resistor","near":"led_NEW_0","relation":"right"},
  {"type":"battery9v","near":"resistor_NEW_1","relation":"right"}
],"wires":"auto"}]
```
**Nota**: Il PlacementEngine frontend GIA' supporta array di components (PlacementEngine.js:51).

**Verifica**: "Metti un LED, un resistore e una batteria" → 3 componenti piazzati.

### FIX-3: Circuit specialist prompt hardening [P0]
**File**: `nanobot/prompts/circuit.yml:55-81` (placement_intent section)
**Problema**: Il modello LLM a volte ignora la sezione placement_intent e genera solo narrativa.
**Fix**:
1. Aggiungere regola IMPERATIVE in cima: "Se il messaggio contiene un verbo d'azione (aggiungi/metti/collega/costruisci), la risposta DEVE terminare con [INTENT:] o [AZIONE:]. VIETATO rispondere senza tag."
2. Aggiungere pin map nel prompt per permettere wiring diretto:
```yaml
pin_map: |
  LED: anode (+), cathode (-)
  Resistor: lead1, lead2
  Battery9V: positive (+), negative (-)
  PushButton: pin1, pin2
  Buzzer: positive, negative
  Potentiometer: vcc, signal, gnd
  Capacitor: positive, negative
  RGB-LED: red, common, green, blue
```
3. Aggiungere esempi di wiring:
```yaml
  "Collega il LED alla batteria attraverso un resistore"
  → [INTENT:{"action":"place_and_wire","components":[{"type":"led"},{"type":"resistor","near":"led_NEW_0"}],"wires":"auto"}]
```

**Verifica**: 10 frasi diverse di piazzamento → tutte devono generare [INTENT:] o [AZIONE:].

### FIX-4: Wiring auto nel PlacementEngine [P1]
**File**: `src/components/simulator/engine/PlacementEngine.js`
**Problema**: `"wires":"auto"` nel [INTENT:] non cabla tutti i tipi di componente.
**Fix**: Verificare e completare il wiring automatico per TUTTI i 14 tipi di componente:
- led + resistor → resistor:lead2 → led:anode, led:cathode → GND
- push-button → pin1 → segnale, pin2 → GND
- buzzer → positive → segnale, negative → GND
- potentiometer → vcc → +5V, gnd → GND, signal → analogico
- etc.

**Verifica**: Ogni componente aggiunto con "wires":"auto" deve avere fili coerenti.

### FIX-5: Vision → Action bridge [P1]
**File**: `nanobot/prompts/vision.yml` + `nanobot/server.py` (post-vision processing)
**Problema**: Vision specialist analizza ma non agisce.
**Fix**: Dopo che vision specialist risponde, se il messaggio originale conteneva verbi d'azione ("correggi", "sistema", "ripara", "aggiungi quello che manca"), fare un secondo pass con il circuit specialist passandogli l'analisi vision come contesto + stato circuito.
```python
# In /tutor-chat, after vision response:
if intent == "vision" and is_action_request(user_msg):
    # Chain: vision analysis → circuit specialist for actions
    vision_analysis = result["response"]
    circuit_result = await route_to_specialist("circuit",
        message=f"[Analisi visiva]: {vision_analysis}\n\nStudente: {user_msg}",
        circuit_context=circuit_context)
    result["response"] = circuit_result["response"]
```

**Verifica**: "Guarda il mio circuito e correggi gli errori" con screenshot → deve generare [AZIONE:] correttive.

### FIX-6: Context enrichment — "goal state" [P1]
**File**: `src/components/tutor/ElabTutorV4.jsx:1177-1183`
**Problema**: Il contesto non include cosa l'utente VUOLE fare.
**Fix**: Aggiungere al contesto inviato al backend:
```javascript
// In handleSend(), before sendChat():
const goalContext = buildGoalContext(userMessage, activeExperiment, circuitStateRef.current);
// buildGoalContext parses the user's request and contrasts with current state
```
Formato:
```
[Richiesta utente]: "aggiungi un LED rosso"
[Componenti attuali]: r1 (resistor), bat1 (battery9v)
[Componenti mancanti per richiesta]: LED
```

**Verifica**: Il backend riceve contesto con gap analysis.

### FIX-7: deterministic_action_fallback — espandere [P2]
**File**: `nanobot/server.py:768-791`
**Problema**: Copre solo play/pause/reset/clearall/notebook. Non copre highlight, loadexp, compile.
**Fix**: Aggiungere regex per:
- "evidenzia" / "mostrami dove" → [AZIONE:highlight:...]
- "compila" / "verifica il codice" → [AZIONE:compile]
- "carica esperimento X" → [AZIONE:loadexp:ID]
- "apri il simulatore/manuale/video" → [AZIONE:opentab:NOME]

**Verifica**: "compila il codice" → [AZIONE:compile] anche se specialist non lo genera.

---

## PROCEDURA DI ESECUZIONE

```
1. Leggi file di contesto (INVARIANTS, TASK-TRACKER, QUALITY-AUDIT) — in parallelo
2. Leggi file sorgente chiave (server.py, circuit.yml, tutor.yml, vision.yml, ElabTutorV4.jsx, PlacementEngine.js)
3. Implementa FIX-1 (TUTOR_OVERRIDE false positive)
4. Implementa FIX-2 (Multi-component intent injection)
5. Implementa FIX-3 (Circuit specialist prompt hardening)
6. Implementa FIX-4 (Wiring auto PlacementEngine)
7. Implementa FIX-5 (Vision → Action bridge)
8. Implementa FIX-6 (Context enrichment goal state)
9. Implementa FIX-7 (deterministic_action_fallback expand)
10. npm run build — DEVE passare con 0 errori
11. Deploy nanobot: cd nanobot && git add -A && git commit -m "S73: Galileo context + action reliability" && git push
12. Deploy frontend: npx vercel --prod --yes
13. /ralph-loop — test ciclico su TUTTE le frasi della tabella di test sotto
14. /quality-audit — audit finale
15. Aggiorna 05-TASK-TRACKER.md
```

---

## RALPH LOOP — TEST MATRIX

Dopo ogni fix, testa queste frasi. Tutte devono produrre il risultato atteso.

### Azioni Semplici (devono GIA' funzionare — regression check)
```
R1: "avvia la simulazione"           → [AZIONE:play]
R2: "ferma tutto"                    → [AZIONE:pause]
R3: "reset"                          → [AZIONE:reset]
R4: "pulisci la breadboard"          → [AZIONE:clearall]
```

### Piazzamento Singolo Componente (FIX-1 + FIX-3)
```
R5:  "aggiungi un LED"               → [INTENT:...led...]
R6:  "metti un resistore"            → [INTENT:...resistor...]
R7:  "piazza un buzzer"              → [INTENT:...buzzer-piezo...]
R8:  "ho bisogno di un pulsante"     → [INTENT:...push-button...]
R9:  "mi serve un potenziometro"     → [INTENT:...potentiometer...]
R10: "inserisci un condensatore"     → [INTENT:...capacitor...]
```

### Piazzamento con Relazione Spaziale (FIX-3)
```
R11: "metti un LED vicino al resistore"     → [INTENT:...near:r1...right...]
R12: "aggiungi un buzzer sotto il LED"      → [INTENT:...near:led1...below...]
R13: "piazza il pulsante a sinistra"        → [INTENT:...left...]
```

### Multi-Component Build (FIX-2 — CRITICO)
```
R14: "costruisci un circuito con LED e resistore"           → [INTENT:...components:[led, resistor]...]
R15: "metti un LED, un resistore e una batteria"            → [INTENT:...components:[led, resistor, battery9v]...]
R16: "aggiungi LED e buzzer"                                → [INTENT:...components:[led, buzzer-piezo]...]
R17: "fammi un semaforo con 3 LED"                          → [INTENT:...components:[led, led, led]...]
```

### Intent Routing (FIX-1 — no false positive)
```
R18: "costruisci un circuito con LED"       → specialist: circuit (NON tutor)
R19: "spiega come collegare un LED"         → specialist: circuit (NON tutor, contiene "collega")
R20: "cos'e' un resistore?"                 → specialist: tutor (teoria pura, OK)
R21: "carica l'esperimento e aggiungi LED"  → specialist: circuit (azione prevale)
```

### Wiring (FIX-4 + FIX-5)
```
R22: "collega il LED alla batteria"         → [AZIONE:addwire:...] o [INTENT:...wires:auto...]
R23: "aggiungi un LED con i fili"           → [INTENT:...wires:auto...] e fili visibili
```

### Vision + Action (FIX-5 — se screenshot disponibile)
```
R24: "guarda il circuito e dimmi cosa manca"    → analisi + suggerimenti
R25: "correggi gli errori che vedi"             → analisi + [AZIONE:] correttive
```

### Deterministic Fallback (FIX-7)
```
R26: "compila il codice"               → [AZIONE:compile]
R27: "apri il simulatore"              → [AZIONE:opentab:simulatore]
R28: "evidenzia il LED"                → [AZIONE:highlight:led1]
```

### Regressione — NON deve rompere
```
R29: "quanto fa 3 + 5?"                → risposta teoria (nessun tag)
R30: "raccontami una barzelletta"      → off-topic amichevole (nessun tag)
```

---

## INVARIANTI DA RISPETTARE

1. **ZERO emoji nel codice sorgente** (prompt YAML inclusi)
2. **BB_HOLE_PITCH = 7.5px** — NON toccare
3. **handleWheel, handleKeyDown, handleBackgroundClick** — NON modificare logica esistente
4. **PlacementEngine coordinate** — devono allinearsi alla griglia breadboard (multipli di BB_PITCH)
5. **Palette**: Navy `#1E4D8C`, Lime `#7CB342`
6. **Build 0 errori** — sempre
7. **Nessun console.log in produzione** (usare print() lato server, logger.js lato client)
8. **Nanobot identity**: Galileo NON rivela MAI architettura interna (multi-specialist, etc.)
9. **CORS**: non aggiungere origini non autorizzate
10. **Token auth**: non toccare authService.js o le Netlify Functions

---

## DOPO I FIX

1. `npm run build` — 0 errori
2. Deploy nanobot su Render (git push)
3. Deploy frontend su Vercel (`npx vercel --prod --yes`)
4. `/ralph-loop` su R1-R30
5. `/quality-audit`
6. Test iPad reale con Chiara:
   - Tutti gli 11 fix S72 (iPad touch)
   - P1-PENCIL-1 heuristic (Pencil USB-C)
   - Galileo context awareness (R5-R28 da iPad)

---

*Prompt S73 v1.0 — 2026-03-05 — Analisi S72 (Claude Opus 4.6) — Brutalmente onesto*
