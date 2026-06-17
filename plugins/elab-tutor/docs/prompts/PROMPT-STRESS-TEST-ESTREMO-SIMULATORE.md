# MEGA STRESS TEST ESTREMO — Simulatore + Arduino + Scratch + UNLIM

**Chiave di accesso**: `ELAB-TEST-2026` (qualsiasi stringa funziona, WelcomePage non valida)

## OBIETTIVO
ZERO DIFETTI. Il simulatore deve funzionare PERFETTAMENTE su tutti e 91 esperimenti.
Arduino deve compilare VERAMENTE. Scratch deve compilare VERAMENTE. Separatamente.
UNLIM deve controllare il circuito e il codice SOLO parlando/scrivendo/digitando.

## REGOLA ASSOLUTA
- Engine INTOCCABILE: MAI modificare CircuitSolver.js, AVRBridge.js, SimulationManager.js, avrWorker.js
- Ogni bug trovato: fix nel layer sopra (UI, adapter, data, CSS)
- Se un esperimento non carica: FIX ORA, non "lo faremo dopo"
- Score onesto: MAI auto-assegnare >7 senza verifica

---

## FASE 1 — VOLUME 1: 38 Esperimenti Circuiti Passivi (TUTTI code:null)

Tutti usano CircuitSolver puro (batteria 9V, no Arduino). Devono:
- Caricare senza errore console
- Piazzare componenti sulla breadboard automaticamente
- Connettere i fili corretti
- La simulazione deve partire (Play) e mostrare risultati corretti
- LED devono accendersi/spegnersi secondo il circuito
- Multimetro deve leggere valori corretti

### Chunk 1.1 — Capitolo 6: Primi Circuiti (3 esperimenti)
```
v1-cap6-esp1  — Primo circuito (LED + batteria + resistore)
v1-cap6-esp2  — Circuito con interruttore
v1-cap6-esp3  — Due LED in serie
```
**Test**: LED si accende, interruttore funziona, serie mostra tensione divisa

### Chunk 1.2 — Capitolo 7: Resistenze (6 esperimenti)
```
v1-cap7-esp1  — Resistore singolo
v1-cap7-esp2  — Due resistori in serie
v1-cap7-esp3  — Due resistori in parallelo
v1-cap7-esp4  — Partitore di tensione
v1-cap7-esp5  — Resistenze miste (serie+parallelo)
v1-cap7-esp6  — Resistenze e LED multipli
```
**Test**: Valori Ohm corretti, partitore calcola giusto, parallelo usa formula 1/Rtot, multimetro verifica

### Chunk 1.3 — Capitolo 8: LED (5 esperimenti)
```
v1-cap8-esp1  — LED rosso base
v1-cap8-esp2  — LED verde
v1-cap8-esp3  — LED giallo
v1-cap8-esp4  — LED multipli parallelo
v1-cap8-esp5  — LED multipli serie
```
**Test**: Colore LED corretto (SVG gradient), tensione forward corretta per colore, corrente limitata da resistore

### Chunk 1.4 — Capitolo 9: Sensori e Componenti (9 esperimenti)
```
v1-cap9-esp1  — Pulsante (push button)
v1-cap9-esp2  — Pulsante + LED
v1-cap9-esp3  — Potenziometro
v1-cap9-esp4  — Potenziometro + LED (dimmer)
v1-cap9-esp5  — LDR (fotoresistenza)
v1-cap9-esp6  — LDR + LED
v1-cap9-esp7  — Buzzer
v1-cap9-esp8  — Buzzer + pulsante
v1-cap9-esp9  — Buzzer + potenziometro
```
**Test**: Pulsante toggle stato, potenziometro varia resistenza (overlay rotazione), LDR varia con slider luce, buzzer suona, combinazioni funzionano

### Chunk 1.5 — Capitolo 10: Circuiti Avanzati (6 esperimenti)
```
v1-cap10-esp1  — Ponte di Wheatstone
v1-cap10-esp2  — Circuito RC (condensatore)
v1-cap10-esp3  — LED + condensatore
v1-cap10-esp4  — Diodo rettificatore
v1-cap10-esp5  — Diodo + LED protezione
v1-cap10-esp6  — Transistor come interruttore
```
**Test**: Wheatstone equilibrio, condensatore carica/scarica, diodo blocca corrente inversa, transistor satura

### Chunk 1.6 — Capitoli 11-14: Progetti (9 esperimenti)
```
v1-cap11-esp1  — Allarme (buzzer + reed switch)
v1-cap11-esp2  — Allarme con LDR
v1-cap12-esp1  — Semaforo manuale
v1-cap12-esp2  — Night light (LDR + LED)
v1-cap12-esp3  — Touch lamp (transistor)
v1-cap12-esp4  — Ventola con transistor
v1-cap13-esp1  — Progetto finale 1
v1-cap13-esp2  — Progetto finale 2
v1-cap14-esp1  — Sfida finale
```
**Test**: Ogni progetto funziona end-to-end, nessun componente mancante, nessun pin scollegato

### Verifica per OGNI esperimento V1:
- [ ] Carica senza errori console (0 errors, 0 warnings critici)
- [ ] Componenti piazzati correttamente sulla breadboard
- [ ] Fili collegati (nessun pin floating)
- [ ] Play → simulazione attiva
- [ ] LED accesi/spenti correttamente
- [ ] Multimetro legge valori corretti (V, Ohm, A)
- [ ] Potenziometro/LDR overlay funziona (se presente)
- [ ] Pulsante toggle funziona (se presente)
- [ ] Nessun "NaN" o "Infinity" nei valori

---

## FASE 2 — VOLUME 2: 27 Esperimenti Circuiti Intermedi (TUTTI code:null)

Stesse verifiche di V1, piu:
- Componenti avanzati (condensatori, motore DC, diodi, MOSFET, fototransistore)
- Circuiti piu complessi (piu nodi per il solver)

### Chunk 2.1 — Capitoli 3-5 (9 esperimenti)
```
v2-cap3-esp1 attraverso v2-cap3-esp4  (4)
v2-cap4-esp1 attraverso v2-cap4-esp3  (3)
v2-cap5-esp1, v2-cap5-esp2            (2)
```

### Chunk 2.2 — Capitoli 6-8 (11 esperimenti)
```
v2-cap6-esp1 attraverso v2-cap6-esp4  (4)
v2-cap7-esp1 attraverso v2-cap7-esp4  (4)
v2-cap8-esp1 attraverso v2-cap8-esp3  (3)
```

### Chunk 2.3 — Capitoli 9-12 (7 esperimenti)
```
v2-cap9-esp1, v2-cap9-esp2            (2)
v2-cap10-esp1 attraverso v2-cap10-esp4 (4)
v2-cap12-esp1                          (1)
```

### Verifica per OGNI esperimento V2:
- [ ] Tutto come V1
- [ ] Motore DC gira (se presente) con velocita proporzionale
- [ ] MOSFET switching funziona (Vgs threshold)
- [ ] Condensatore mostra carica/scarica
- [ ] Diodo blocca corrente inversa
- [ ] Fototransistore risponde alla luce

---

## FASE 3 — VOLUME 3: 26 Esperimenti Arduino (25 con codice, 5 con Scratch)

### COMPILAZIONE ARDUINO — DEVE FUNZIONARE VERAMENTE

Per ogni esperimento con `code != null`, il codice C++ Arduino deve:
1. Apparire nell'editor CodeMirror con syntax highlighting
2. Compilare VERAMENTE (tramite HEX precompilato O compilatore remoto)
3. Il LED/servo/LCD deve rispondere al codice
4. Serial Monitor deve mostrare output (se il codice usa Serial.print)

### Chunk 3.1 — Blink & LED Base (10 esperimenti)
```
v3-cap5-esp1  — Blink base (LED onboard)              [HAS CODE]
v3-cap5-esp2  — Blink veloce                           [HAS CODE]
v3-cap6-esp1  — Setup breadboard (SOLO circuito)       [code:null]
v3-cap6-esp2  — LED esterno pin 13                     [HAS CODE]
v3-cap6-esp3  — LED su pin diverso                     [HAS CODE]
v3-cap6-esp4  — Semaforo 3 LED                         [HAS CODE]
v3-cap6-esp5  — digitalRead pulsante                   [HAS CODE]
v3-cap6-esp6  — 2 LED + Pulsante Toggle                [HAS CODE + HEX + SCRATCH]
v3-cap6-esp7  — Debounce con while                     [HAS CODE]
v3-cap6-semaforo — Semaforo completo                   [HAS CODE + HEX + SCRATCH]
```
**Test Arduino**:
- v3-cap5-esp1: LED onboard lampeggia 1s on / 1s off
- v3-cap5-esp2: LED lampeggia veloce (250ms)
- v3-cap6-esp2: LED esterno breadboard lampeggia
- v3-cap6-esp3: LED su pin diverso da 13
- v3-cap6-esp4: Sequenza semaforo (verde→giallo→rosso)
- v3-cap6-esp5: Pulsante INPUT_PULLUP legge HIGH/LOW
- v3-cap6-esp6: Toggle 2 LED con pulsante
- v3-cap6-esp7: Debounce previene rimbalzi
- v3-cap6-semaforo: Semaforo automatico 3 fasi

**Test Scratch** (v3-cap6-esp6, v3-cap6-semaforo):
- Workspace Blockly carica con blocchi corretti
- Blocchi generano codice C++ identico (o equivalente) al codice Arduino
- Compilazione Scratch separata dal codice editor
- Risultato identico: stessi LED, stessa sequenza

### Chunk 3.2 — Analog Read/Write (8 esperimenti)
```
v3-cap7-esp1  — analogRead base (trimmer → LED on/off) [HAS CODE]
v3-cap7-esp2  — analogRead con tensione (Volt)         [HAS CODE]
v3-cap7-esp3  — Trimmer controlla 3 LED                [HAS CODE]
v3-cap7-esp4  — PWM fade up                            [HAS CODE]
v3-cap7-esp5  — PWM valori manuali                     [HAS CODE]
v3-cap7-esp6  — Fade up e down (respiro)               [HAS CODE]
v3-cap7-esp7  — Trimmer + map() → LED brightness       [HAS CODE]
v3-cap7-esp8  — DAC reale 10-bit                       [HAS CODE]
```
**Test Arduino**:
- v3-cap7-esp1: Potenziometro overlay → ruota → LED on/off a soglia
- v3-cap7-esp2: Serial Monitor mostra tensione in Volt (0.00-5.00)
- v3-cap7-esp3: 3 LED si accendono a soglie diverse
- v3-cap7-esp4: LED brightness cresce gradualmente (PWM duty 0→255)
- v3-cap7-esp5: LED a luminosita fissa (valori hardcoded)
- v3-cap7-esp6: LED respira (fade up then down, loop)
- v3-cap7-esp7: Potenziometro controlla brightness via map()
- v3-cap7-esp8: Uscita analogica vera (DAC)

**Test critici PWM**:
- analogWrite(pin, 0) → LED spento (duty 0%)
- analogWrite(pin, 127) → LED mezzo (duty ~50%)
- analogWrite(pin, 255) → LED pieno (duty 100%)
- Transizione smooth senza sfarfallio

### Chunk 3.3 — Serial Communication (5 esperimenti)
```
v3-cap8-esp1  — Serial println in setup                [HAS CODE]
v3-cap8-esp2  — Serial println in loop                 [HAS CODE]
v3-cap8-esp3  — analogRead + Serial Monitor            [HAS CODE + HEX + SCRATCH]
v3-cap8-esp4  — Serial Plotter 2 potenziometri         [HAS CODE]
v3-cap8-esp5  — Pot + 3 LED + Serial (progetto finale) [HAS CODE]
```
**Test Arduino**:
- v3-cap8-esp1: Serial Monitor mostra UNA riga (solo in setup)
- v3-cap8-esp2: Serial Monitor mostra righe continue (in loop)
- v3-cap8-esp3: Serial Monitor mostra valore analogico (0-1023) che cambia con potenziometro
- v3-cap8-esp4: Due valori su Serial Plotter (due colonne)
- v3-cap8-esp5: Progetto completo: pot controlla LED + stampa valori

**Test Scratch** (v3-cap8-esp3):
- Blocchi Scratch generano analogRead + Serial.println
- Output identico al codice Arduino

**Test Serial Monitor critici**:
- Baud rate corretto (9600 default)
- Timestamp toggle funziona
- Scroll automatico
- Clear funziona
- Nessun carattere corrotto
- Buffer non cresce all'infinito (bounded)

### Chunk 3.4 — Extra: LCD + Servo + Simon (3 esperimenti)
```
v3-extra-lcd-hello    — LCD 16x2 "Ciao!"               [HAS CODE + HEX]
v3-extra-servo-sweep  — Servo sweep 0-180               [HAS CODE + HEX + SCRATCH]
v3-extra-simon        — Simon Says (4 LED + buzzer)     [HAS CODE + HEX + SCRATCH]
```
**Test Arduino**:
- v3-extra-lcd-hello: LCD mostra "Ciao!" sulla prima riga, testo scorre
- v3-extra-servo-sweep: Servo ruota da 0 a 180 gradi e torna (horn SVG visibile)
- v3-extra-simon: 4 LED lampeggiano in sequenza, buzzer suona, gioco interattivo

**Test Scratch** (v3-extra-servo-sweep, v3-extra-simon):
- Blocchi Servo: angolo 0→180 con delay
- Blocchi Simon: sequenza random, input utente, feedback LED/buzzer
- Simon SCRATCH ha `scratchSteps` progressivi (progressive disclosure)

**Test LCD critici**:
- Caratteri 5x7 font rendering (95 caratteri supportati)
- Cursor position (row 0, col 0)
- Clear display
- Backlight on/off
- 4-bit mode HD44780 emulation

**Test Servo critici**:
- Horn SVG ruota visivamente
- Angolo 0° = 1ms pulse, 90° = 1.5ms, 180° = 2ms
- Smooth rotation (no jitter)

**Test Simon critici**:
- 4 LED distinti (colori diversi)
- Sequenza cresce di 1 ad ogni round
- Buzzer tono diverso per ogni LED
- Game over detection
- Score counting

### Verifica per OGNI esperimento V3:
- [ ] Codice C++ appare nell'editor con syntax highlighting
- [ ] Compilazione avvia SENZA errori (HEX caricato o compilato)
- [ ] AVR emulation attiva (CPU cycles running)
- [ ] Output hardware corretto (LED/Servo/LCD/Buzzer risponde)
- [ ] Serial Monitor funziona (se presente nel codice)
- [ ] Scratch workspace carica (se presente)
- [ ] Scratch genera codice C++ valido
- [ ] Scratch compilazione separata produce stesso risultato
- [ ] Pin mapping corretto (D0-D7=PORTD, D8-D13=PORTB, A0-A5=PORTC)
- [ ] Nessun errore console

---

## FASE 4 — UNLIM: Controllare TUTTO Parlando/Scrivendo/Digitando

### Il cuore del test: UNLIM deve poter fare TUTTO sul circuito e sul codice.
L'utente non tocca mai il mouse. Solo parla, scrive, o digita.

### Chunk 4.1 — Comandi Voce Circuito (24 comandi vocali)
```
"aggiungi un LED"              → LED appare sulla breadboard
"aggiungi un resistore"        → Resistore appare
"aggiungi un pulsante"         → Pulsante appare
"aggiungi un potenziometro"    → Potenziometro appare
"aggiungi un buzzer"           → Buzzer appare
"aggiungi una batteria"        → Batteria 9V appare
"aggiungi un condensatore"     → Condensatore appare
"aggiungi un motore"           → Motore DC appare
"aggiungi un diodo"            → Diodo appare
"aggiungi un Arduino"          → Arduino Nano appare
"aggiungi un servo"            → Servo appare
"aggiungi un LCD"              → LCD 16x2 appare
"collega il LED al resistore"  → Wire tra i due
"pulisci tutto"                → clearCircuit()
"cancella l'ultimo"            → undo()
"rifai"                        → redo()
"monta l'esperimento"          → mountExperiment() completo
"descrivi il circuito"         → getCircuitDescription()
"avvia la simulazione"         → Play
"ferma la simulazione"         → Stop
"accendi il LED"               → setComponentValue(led, HIGH)
"spegni il LED"                → setComponentValue(led, LOW)
"ruota il potenziometro a 50%" → setComponentValue(pot, 512)
"che cosa c'e nel circuito?"   → descrive componenti e connessioni
```
**Test per OGNI comando**: dire il comando → azione eseguita in <3 secondi → risultato visibile

### Chunk 4.2 — Comandi Chat Circuito (digitare nella chat)
```
"Metti un LED rosso sulla breadboard"
"Collega il pin 13 dell'Arduino al LED"
"Aggiungi un resistore da 220 ohm"
"Collega la batteria al circuito"
"Monta l'esperimento v1-cap6-esp1"
"Pulisci tutto e ricomincia"
"Cosa c'e nel mio circuito adesso?"
"Il LED non si accende, perche?"
"Come calcolo la resistenza giusta?"
"Fammi vedere il Ponte di Wheatstone"
```
**Test**: UNLIM risponde con [INTENT:{...}] o [AZIONE:...] che esegue l'azione + spiegazione pedagogica <60 parole

### Chunk 4.3 — Comandi Chat Codice Arduino (digitare nella chat)
```
"Scrivi un codice per far lampeggiare il LED"
"Modifica il delay a 500ms"
"Aggiungi un Serial.println per debug"
"Compila il codice"
"Il codice non compila, cosa c'e di sbagliato?"
"Spiega cosa fa analogRead"
"Spiega cosa fa map()"
"Scrivi un codice per il semaforo"
"Aggiungi il debounce al pulsante"
"Fai il fade con PWM"
```
**Test**: UNLIM genera codice corretto nell'editor + lo compila + mostra risultato

### Chunk 4.4 — Comandi Chat Scratch (digitare nella chat)
```
"Apri Scratch"
"Crea un blocco per accendere il LED"
"Aggiungi un loop che lampeggia il LED"
"Come funziona il blocco 'Accendi e Spegni'?"
"Compila i blocchi Scratch"
"Il servo non si muove, aiuto"
"Fammi vedere il Simon Says in Scratch"
```
**Test**: UNLIM apre Scratch, manipola blocchi, compila separatamente da Arduino

### Chunk 4.5 — Comandi Chat Navigazione
```
"Apri il manuale del Volume 1"
"Vai a pagina 25"
"Che esperimento e a pagina 30?"
"Apri il percorso della lezione"
"Quali sono le fasi dell'esperimento?"
"Fammi un riassunto di quello che ho fatto"
"Salva la sessione"
"Come va il mio progresso?"
```
**Test**: UNLIM controlla VolumeViewer, PercorsoPanel, sessioni, progresso

### Chunk 4.6 — Comandi Estremi / Edge Cases
```
"Aggiungi 15 LED tutti insieme"          → max componenti
"Collega tutto a tutto"                  → cortocircuito detection
"Scrivi un codice con 1000 righe"        → editor performance
"Compila un codice con errori di sintassi" → error translation kid-friendly
"Parla in inglese"                       → UNLIM resta in italiano
"Cosa sai fare?"                         → elenco capabilities
"Chi sei?"                               → "Sono UNLIM" (non Galileo)
"Quanti anni hai?"                       → risposta pedagogica
""                                       → stringa vuota → no crash
"aaaaaaaaaaaaaaaaaaaaaaaaa"              → nonsense → risposta gentile
"DROP TABLE students"                    → injection → ignorato
"<script>alert('xss')</script>"          → XSS → sanitizzato
```
**Test**: Nessun crash, nessun errore, risposte sempre appropriate

### Chunk 4.7 — Test Voce Edge TTS
```
Attivare microfono → icona mic rossa sulla mascotte
Dire "Ciao UNLIM" → risposta parlata con voce IsabellaNeural
Dire 5 comandi rapidi → rate limit non blocca (queue)
VPS down (72.60.129.50:8880) → fallback browser TTS (no crash)
Disattivare voce → TTS si ferma immediatamente
Riattivare voce → riprende senza problemi
Audio lungo (>100 chars) → chunking <100 chars, pause 150ms
```

### Chunk 4.8 — Test Contesto UNLIM
```
Aprire VolumeViewer su pagina 15 → UNLIM sa "[Volume aperto: Volume 1 ... pagina 15]"
Caricare esperimento v1-cap9-esp3 → UNLIM sa cosa c'e nel circuito
Fare 3 errori di fila → UNLIM cambia tono (piu incoraggiante)
Completare un esperimento → UNLIM congratula
Chiedere "cosa ho fatto nella lezione scorsa?" → memory cross-session
```

### Verifica per OGNI comando UNLIM:
- [ ] Risposta in <5 secondi
- [ ] Risposta <60 parole (mai verbose)
- [ ] Azione eseguita correttamente (se comando azione)
- [ ] Nessuna hallucination (non inventa componenti/funzioni)
- [ ] Tono pedagogico (non accademico, non baby)
- [ ] Italiano corretto
- [ ] Nessun errore console

---

## FASE 5 — STRESS TEST ESTREMI

### Chunk 5.1 — Performance Limiti
```
Aprire TUTTI i pannelli contemporaneamente (UNLIM + Volume + Percorso + Sidebar)
Navigare 50 pagine PDF in 10 secondi → no crash, no memory leak
Disegnare 100 tratti penna su una pagina → no lag
Inviare 20 messaggi UNLIM in 30 secondi → rate limit gestito
Caricare/scaricare 10 esperimenti in sequenza rapida → no stato corrotto
Ridimensionare finestra 20 volte → layout responsive corretto
```

### Chunk 5.2 — LIM 1024x768
```
Impostare viewport a 1024x768 (risoluzione LIM scolastica)
Tutti i bottoni devono essere visibili (>44px touch target)
Testo leggibile (>13px)
Sidebar compatta (155px)
Toolbar compatta (48px)
Nessun overlap di elementi
Scroll funziona
```

### Chunk 5.3 — Mobile Landscape
```
Impostare viewport a 768x400 (tablet landscape)
Sidebar nascosta o compatta
Header visibile
Simulatore usabile
UNLIM chat leggibile
```

### Chunk 5.4 — Accessibilita WCAG
```
Contrasto testo: >4.5:1 per testo normale, >3:1 per testo grande
Focus ring visibile su tutti i bottoni (Tab navigation)
aria-label su tutti i bottoni icona
aria-live su messaggi dinamici (errori, UNLIM risposte)
Nessun testo <12px
Nessun touch target <44px
```

### Chunk 5.5 — Console Zero Errors
```
Aprire DevTools Console
Navigare TUTTO il sito: Welcome → Lavagna → ogni esperimento
ZERO errors in console (warning accettabili solo se non critici)
ZERO "undefined" o "null" in UI
ZERO crash React (Error Boundary non deve mai attivarsi)
```

### Chunk 5.6 — Build e Bundle
```
npm run build → PASS (0 errors, 0 type errors)
Bundle size < 4500KB totale
Precache entries: ~32-34
Build time < 60s
Tutti gli asset referenziati esistono (no 404)
Service Worker registra correttamente
```

---

## FASE 6 — CIRCUITI ESTREMI (Test CircuitSolver)

### Chunk 6.1 — Circuiti Patologici (via UNLIM o manuale)
```
"Metti un LED senza resistore" → warning, LED brucia
"Collega la batteria in corto" → short circuit detection
"Metti 10 resistori in parallelo" → formula 1/Rtot stabile
"Metti un resistore da 0 ohm" → wire equivalente
"Metti un resistore da 10 megaohm" → quasi aperto
"Scollega un filo" → pin floating detection
"Collega il LED al contrario" → polarita invertita, LED spento
"Metti il diodo al contrario" → corrente bloccata
"Transistor senza base" → transistor OFF
"MOSFET gate a 0V" → MOSFET OFF
"MOSFET gate a 5V" → MOSFET ON (sopra threshold 2V)
```

### Chunk 6.2 — Misure Estreme (Multimetro)
```
Misurare tensione ai capi della batteria → 9V
Misurare tensione ai capi del LED rosso → ~1.8V
Misurare tensione ai capi del LED verde → ~2.1V
Misurare corrente nel circuito semplice → I = V/R
Misurare resistenza di un resistore → valore nominale
Misurare resistenza di due in parallelo → Rtot
Misurare in un nodo complesso (3+ rami) → KCL verificato
Cambiare modo multimetro: V → Ohm → A → V (ciclo completo)
```

---

## OUTPUT ATTESO

### Per ogni Fase, produrre:
1. **Tabella risultati**: Esperimento | Status (PASS/FAIL) | Note
2. **Bug list**: Severita (P0/P1/P2) | Descrizione | File | Fix proposto
3. **Fix immediato** per tutti i P0 (bloccanti)
4. **Fix immediato** per tutti i P1 (importanti)
5. **Test dopo fix**: ri-verifica che il fix funziona

### Score finale (onesto, per area):
| Area | Score /10 | Note |
|------|-----------|------|
| Circuiti passivi V1 (38 esp) | ? | |
| Circuiti passivi V2 (27 esp) | ? | |
| Arduino compilazione V3 (25 esp) | ? | |
| Scratch compilazione V3 (5 esp) | ? | |
| HEX precompilati V3 (6 esp) | ? | |
| Serial Monitor | ? | |
| PWM / analogWrite | ? | |
| LCD 16x2 | ? | |
| Servo | ? | |
| UNLIM comandi voce (24 cmd) | ? | |
| UNLIM comandi chat circuito | ? | |
| UNLIM comandi chat codice | ? | |
| UNLIM comandi chat Scratch | ? | |
| UNLIM contesto e memoria | ? | |
| Edge TTS | ? | |
| Performance | ? | |
| LIM 1024x768 | ? | |
| Accessibilita WCAG | ? | |
| Console errors | ? | |
| Build/Bundle | ? | |

### Regole di scoring:
- 10/10: Zero difetti, funziona perfettamente
- 8-9/10: Funziona, 1-2 bug minori
- 6-7/10: Funziona base, bug visibili
- 4-5/10: Funziona parzialmente, bug bloccanti
- 1-3/10: Non funziona o crash
- 0/10: Non implementato

### Skills da usare (IN ORDINE):
1. `elab-quality-gate` — gate iniziale
2. `analisi-simulatore` — verifica engine
3. `ricerca-bug` — ricerca sistematica
4. `analisi-galileo` — verifica UNLIM
5. `elab-nanobot-test` — test endpoint
6. `lim-simulator` — test LIM
7. `impersonatore-utente` — test come docente/studente
8. `quality-audit` — audit completo
9. `lavagna-benchmark` — benchmark 15 metriche
10. `elab-quality-gate` — gate finale

### Conteggio chunk totali: 27 chunk
- V1: 6 chunk (38 esperimenti)
- V2: 3 chunk (27 esperimenti)
- V3: 4 chunk (26 esperimenti, di cui 25 Arduino + 5 Scratch)
- UNLIM: 8 chunk (24 voice + chat + edge cases + TTS + contesto)
- Stress: 6 chunk (performance + LIM + mobile + WCAG + console + build)

### Tempo stimato: sessione INTERA dedicata solo a test
### Risultato atteso: ZERO P0, massimo 3 P1, score medio >8/10
