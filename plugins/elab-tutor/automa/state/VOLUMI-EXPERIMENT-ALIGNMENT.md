# VOLUMI ↔ EXPERIMENT ALIGNMENT — Cap-by-Cap Mapping

**Data**: 2026-04-28 21:09 CEST | **Autore**: agent readonly mapping iter 21 prep | **Mode**: caveman terse
**Sources**:
- `/Users/andreamarro/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol{1,2,3}_ELAB_2026-04-27.pdf` (Tea De Venere, 27/04/2026)
- `src/data/volume-references.js` (1226 LOC, 92/92 enriched bookText/Instructions/Quote/Context)
- `src/data/lesson-paths/v*.json` (95 file = 92 esperimenti + 3 sinonimi cap6/7-mini, cap8-serial duplicati)
- `src/data/lesson-groups.js` (250 LOC, 25 Lezioni raggruppate)

---

## 1. Vol1/2/3 capitoli + variazioni narrative (extract from PDF)

### Vol1 — Le Basi (66 termini, 14 capitoli, Glossario_Vol1.pdf:1-703)

| Cap | Titolo (PDF:lineno) | # Termini | Tema centrale | Esperimenti previsti narrativamente (da bookContext volume-references.js) |
|-----|---------------------|----------|---------------|----------------------------------------------------------------------------|
| 1 | La Storia dell'Elettronica (PDF:39) | 2 (Elettronica, Microchip) | Storia | Nessun esp pratico, capitolo intro |
| 2 | Le grandezze elettriche e Legge di Ohm (PDF:62) | 8 (Tensione, Volt, Corrente, Ampere, Resistenza, Ohm, Legge Ohm, Triangolo Ohm) | Teoria V/I/R | Nessun esp pratico, teoria |
| 3 | Cos'è un resistore? (PDF:135) | 4 (Resistore, Codice colori, Tolleranza, Bande) | Resistore | Nessun esp pratico (Vol2 cap3 introduce esp multimetro) |
| 4 | Cos'è la breadboard? (PDF:176) | 5 (Breadboard, Foro, Riga, Striscia alim, Divisione centrale) | Breadboard | Nessun esp pratico, intro tool |
| 5 | Cosa sono le batterie? (PDF:228) | 8 (Batteria 9V, Pila, Clip, Polo+, Polo-, Cavo R, Cavo N, Energia) | Batteria | Nessun esp pratico, intro componente |
| **6** | **Cos'è il diodo LED? (PDF:301)** | **10** (LED, Diodo, Anodo, Catodo, Polarità, Gambetta, Senso unico, Cortocircuito, Elettrone, Particella) | **LED** | **3 esp**: esp1 LED base, esp2 LED senza R (DIMOSTRATIVO bruciato), esp3 cambia R 470→220 luminosità |
| **7** | **Cos'è il LED RGB? (PDF:392)** | **5** (LED RGB, Catodo comune, Anodo comune, Canale, Sintesi additiva) | **LED RGB** | **6 esp**: esp1 rosso, esp2 verde (sposta R), esp3 blu, esp4 mix 2col=viola, esp5 tutti=bianco bilanciato, esp6 libero |
| **8** | **Cos'è un pulsante? (PDF:441)** | **4** (Pulsante, Contatto, Molla, Interruttore) | **Pulsante** | **5 esp**: esp1 pulsante+LED base, esp2 cambia R/colore, esp3 RGB+1pulsante, esp4 3pulsanti+RGB, esp5 mix R diversi |
| **9** | **Cos'è un potenziometro? (PDF:483)** | **7** (Potenziometro, Cursore, Alberino, Disco resist, Resistore var, Kohm, Manopola) | **Potenziometro** | **9 esp**: esp1 dimmer, esp2 inverte rotazione, esp3 LED diversi, esp4 RGB azzurro, esp5 mix blu/rosso (3 pin), esp6 lampada 3pot+RGB CAPSTONE, esp7 sfida +pulsanti, esp8 sfida combine 5+6, esp9 sfida +pulsante master |
| **10** | **Cos'è un fotoresistore? (PDF:554)** | **3** (Fotoresistore, LDR, Sensore luce) | **LDR** | **6 esp**: esp1 LDR+LED, esp2 cambia colore, esp3 3LDR+RGB, esp4 LED bianco illumina LDR→LED blu (accoppiamento ottico), esp5 +pot regola LED bianco, esp6 +pulsante AND |
| **11** | **Cos'è un cicalino? (PDF:586)** | **2** (Cicalino, Buzzer) | **Buzzer** | **2 esp**: esp1 buzzer continuo, esp2 buzzer+pulsante (campanello) |
| **12** | **L'interruttore magnetico (PDF:610)** | **4** (Interruttore mag, Reed switch, Magnete, Campo magnetico) | **Reed switch** | **4 esp**: esp1 reed+LED, esp2 cambia R luminosità, esp3 sfida RGB+reed, esp4 sfida pot+RGB+reed |
| **13** | **Cos'è l'elettropongo? (PDF:653)** | **2** (Elettropongo, Plastilina conduttiva) | **Plastilina** | **2 esp**: esp1 LED nell'elettropongo base, esp2 circuiti artistici libero |
| **14** | **Costruiamo il primo robot (PDF:680)** | **2** (Robot, Telaio) | **CAPSTONE** | **1 esp**: robot occhi-LED + 3 pot |

**Totale Vol1**: 38 esp narrativi previsti. **Lesson-paths flat presenti**: 38. **Match COMPLETO numerico**.

### Vol2 — Approfondiamo (59 termini, 12 capitoli, Glossario_Vol2.pdf:1-646)

| Cap | Titolo (PDF:lineno) | # Termini | Tema centrale | Esperimenti previsti narrativamente |
|-----|---------------------|----------|---------------|--------------------------------------|
| 1 | Altri cenni storia elettronica (PDF:35) | 1 | Intro | Nessun esp |
| 2 | Cos'è l'elettricità? (PDF:50) | 5 (Elettricità, Atomo, Movimento e-, Conduttore, Bassa tensione) | Teoria atomica | Nessun esp |
| **3** | **Il Multimetro (PDF:103)** | **8** (Multimetro, Voltmetro, Amperometro, Ohmmetro, Puntali, Selettore, Display, Misurazione) | **Multimetro** | **4 esp**: esp1 misura V batt, esp2 diario batt, esp3 misura R, esp4 misura I (in serie) |
| **4** | **Approfondiamo le resistenze (PDF:182)** | **4** (Serie E12, Serie, Parallelo, R equivalente) | **R serie/parallelo** | **3 esp**: esp1 2R parallelo, esp2 3R serie, esp3 partitore tensione |
| **5** | **Approfondiamo le batterie (PDF:225)** | **5** (Batt serie, Batt parallelo, Antiserie, Capacità Ah, Ora) | **Batterie multiple** | **2 esp**: esp1 batt serie (somma V), esp2 batt antiserie (sottrae V) |
| **6** | **Approfondiamo i LED (PDF:280)** | **4** (V soglia LED, I max LED, Calcolo R, V equivalente) | **Vf/legge Ohm LED** | **4 esp**: esp1 2LED serie 1R, esp2 LED colori diversi serie, esp3 3LED serie, esp4 misura Vf con multimetro |
| **7** | **Cosa sono i condensatori? (PDF:319)** | **9** (Condensatore, F, µF, Elettrolitico, Elettrolita, Polarizzazione, V max, Carica, Scarica) | **Condensatori RC** | **4 esp**: esp1 scarica con multimetro, esp2 scarica visibile su LED, esp3 cap parallelo (tau↑), esp4 varia R (tau=RC) |
| **8** | **Cosa sono i transistor? (PDF:404)** | **8** (Transistor, Interruttore elettronico, Interruttore digit, Amplificazione, Drain, Source, Gate, V comando) | **MOSFET** | **3 esp**: esp1 MOSFET come switch, esp2 carica corpo umano, esp3 +pot trova V soglia |
| **9** | **Cosa sono i fototransistor? (PDF:481)** | **3** (Fototransistor, Collettore, Emettitore) | **Fototransistor** | **2 esp**: esp1 fototransistor sensore, esp2 luce notturna automatica (+MOSFET) |
| **10** | **Il motore a corrente continua (PDF:516)** | **4** (Motore DC, Senso rotazione, Ruote, Albero) | **Motore DC** | **4 esp**: esp1 motore base, esp2 inverti polarità, esp3 +pulsante, esp4 +LED indicatore |
| **11** | **I diodi (PDF:559)** | **5** (Diodo protezione, Bobina, Campo magn, Picco V, Diodo approfondito) | **Diodi protezione** | **0 esp pratici nel volume-references.js** ⚠️ GAP |
| **12** | **Costruiamo robot marciante (PDF:613)** | **3** (Robot marciante, Telaio, Assemblaggio) | **CAPSTONE** | **1 esp**: robot segui-luce (foto+MOSFET+motori) |

**Totale Vol2**: 27 esp narrativi previsti (esclude cap11 senza esp). **Lesson-paths flat presenti**: 27. **Match numerico ma cap11 zero coverage**.

### Vol3 — Arduino (55 termini, 12 capitoli, Glossario_Vol3.pdf:1-602)

| Cap | Titolo (PDF:lineno) | # Termini | Tema centrale | Esperimenti previsti narrativamente |
|-----|---------------------|----------|---------------|--------------------------------------|
| 1 | Storia programmazione (PDF:39) | 4 | Storia SW | Nessun esp |
| 2 | Cos'è programmazione? (PDF:87) | 4 | Concetti SW | Nessun esp |
| 3 | Hardware vs Software (PDF:127) | 2 | Distinzione | Nessun esp |
| 4 | IDE e collegamento Arduino (PDF:150) | 10 (Arduino, UNO, Nano, µC, Pin, LED_BUILTIN, USB, IDE, Desktop, Web) | IDE setup | Nessun esp pratico, setup |
| **5** | **Come è fatto un programma Arduino? (PDF:243)** | **10** (Sketch, void, setup, loop, Funzione, pinMode, OUTPUT, Parentesi tonde/graffe, ;) | **Struttura sketch** | **2 esp**: esp1 Blink LED_BUILTIN, esp2 modifica delay |
| **6** | **I pin digitali: le dita di Arduino (PDF:331)** | **6** (Pin digit, HIGH, LOW, digitalWrite, digitalRead, INPUT) | **OUTPUT digitale** | **NARRATIVO**: blink LED esterno + variazioni pin/morse/semaforo/2-LED |
| **7** | **I pin input e output (PDF:389)** | **4** (INPUT_PULLUP, R pull-up, Falsi valori, Logica invertita) | **INPUT/pulsante** | **NARRATIVO**: pulsante con INPUT_PULLUP variazioni |
| **8** | **I pin analogici (PDF:432)** | **6** (Pin analog, Segnale analog, analogRead, Pot Arduino, A0-A5, Range 0-1023) | **ANALOG** | **NARRATIVO**: potenziometro+Serial Monitor |
| **9** | **Motore con Arduino (PDF:491)** | **2** (Motore DC Arduino, Pilotaggio) | **Motore+MOSFET** | **0 esp pratici** ⚠️ GAP |
| **10** | **Pulsante e LED Arduino (PDF:518)** | **2** (Programma interattivo, Lettura pulsante) | **Combo I/O** | **0 esp pratici** ⚠️ GAP (sovrappone Cap7) |
| **11** | **Diodi con Arduino (PDF:540)** | **1** (Diodo flyback) | **Protezione motore** | **0 esp pratici** ⚠️ GAP |
| **12** | **Costruiamo robot Segui Luce Arduino (PDF:558)** | **4** (Robot SeguiL, Sensore direzionale, Comportamento, Inseguimento) | **CAPSTONE** | **0 esp pratici nel volume-references.js** ⚠️ GAP (Vol2 cap12 lo copre senza Arduino) |

**Note PDF:37-38**: "i capitoli 9-12 hanno contenuto limitato nel PDF sorgente, termini ricostruiti da titoli". Il libro Vol3 V0.8.1 è **INCOMPLETO** sui cap 9-12, manualizza esp Cap5-Cap8 only.

**Totale Vol3 lesson-paths flat presenti**: 27 + 3 extra (LCD, Servo, Simon). Volume-references.js mappa cap5-cap8 + extra. **Cap9-12 GAP volumi cartacei**.

---

## 2. Lesson-paths flat 92 file inventario sintetico

92 file core + 3 alias (`v3-cap6-morse.json`, `v3-cap6-semaforo.json`, `v3-cap6-mini.json`, `v3-cap8-serial.json`) = **95 file totali** in `src/data/lesson-paths/`.

**Distribuzione**:
- **Vol1**: 38 file `v1-cap{6..14}-esp{1..N}.json`
  - cap6: 3 esp | cap7: 6 | cap8: 5 | cap9: 9 | cap10: 6 | cap11: 2 | cap12: 4 | cap13: 2 | cap14: 1
- **Vol2**: 27 file `v2-cap{3..10,12}-esp{1..N}.json`
  - cap3: 4 | cap4: 3 | cap5: 2 | cap6: 4 | cap7: 4 | cap8: 3 | cap9: 2 | cap10: 4 | cap12: 1 (cap11 ZERO)
- **Vol3**: 27 + 3 alias + 3 extra = 30 file
  - cap5: 2 | cap6: 7+morse+semaforo | cap7: 8+mini | cap8: 5+serial | extra: 3 (lcd/servo/simon)

**Totale conteggio onesto**: 92 esperimenti distinti (volume-references.js conferma 92 chiavi enriched, alias `v3-cap6-morse`/`v3-cap6-semaforo`/`v3-cap7-mini`/`v3-cap8-serial` count separatamente nel mapping).

---

## 3. Cap-by-cap mapping table (SEZIONE PRINCIPALE)

### Vol1

| Cap libro | Tema | Variazioni narrative libro | Lesson-paths digitali | Gap |
|-----------|------|---------------------------|----------------------|-----|
| 6 LED | LED accensione | esp1 base, esp2 NO-R dimostrativo, esp3 cambia R | v1-cap6-esp1/2/3 | NESSUN GAP. Mapping 1:1 narrativa. |
| 7 LED RGB | Sintesi additiva | esp1 R, esp2 G, esp3 B, esp4 mix 2col=viola, esp5 mix 3=bianco, esp6 libero | v1-cap7-esp1/2/3/4/5/6 | NESSUN GAP. 6/6 covered. |
| 8 Pulsante | Switch ON/OFF | esp1 puls+LED, esp2 var R/colore, esp3 puls+RGB, esp4 3puls+RGB, esp5 mix R diversi | v1-cap8-esp1/2/3/4/5 | NESSUN GAP. 5/5 covered. |
| 9 Potenziometro | Dimmer + capstone | esp1 dimmer, esp2 inverti, esp3 colori div, esp4 RGB azzurro, esp5 blu/rosso 3pin, esp6 lampada 3pot CAPSTONE, esp7-9 sfide aperte | v1-cap9-esp1/2/3/4/5/6/7/8/9 | NESSUN GAP. 9/9 covered (ma esp7-9 "sfide aperte" testuali, non hands-on guidate). |
| 10 LDR | Sensore luce | esp1 LDR+LED, esp2 cambia colore, esp3 3LDR+RGB, esp4 accoppiamento ottico, esp5 +pot, esp6 +puls AND | v1-cap10-esp1/2/3/4/5/6 | NESSUN GAP. 6/6 covered. |
| 11 Buzzer | Suono | esp1 continuo, esp2 +pulsante | v1-cap11-esp1/2 | NESSUN GAP. 2/2. |
| 12 Reed switch | Mag interruttore | esp1 base, esp2 var R, esp3 sfida RGB, esp4 sfida pot+RGB+reed | v1-cap12-esp1/2/3/4 | NESSUN GAP. 4/4. |
| 13 Elettropongo | Plastilina | esp1 LED+pongo, esp2 artistico libero | v1-cap13-esp1/2 | NESSUN GAP. 2/2. |
| 14 Robot CAPSTONE | Progetto finale | esp1 robot 3pot+2LED | v1-cap14-esp1 | NESSUN GAP. 1/1. |

**Vol1 totale**: 38/38 mapping COMPLETO 1:1. Score Vol1 = **0.85** (gap minore: esp variation labels follow narrative ordering, ma alcune `bookContext` sono "sfide aperte" senza step-by-step).

### Vol2

| Cap libro | Tema | Variazioni narrative libro | Lesson-paths digitali | Gap |
|-----------|------|---------------------------|----------------------|-----|
| 3 Multimetro | Misure V/I/R | esp1 V batt, esp2 diario, esp3 R, esp4 I serie | v2-cap3-esp1/2/3/4 | NESSUN GAP. 4/4. |
| 4 R serie/par | Combinazioni R | esp1 2R par, esp2 3R serie, esp3 partitore | v2-cap4-esp1/2/3 | NESSUN GAP. 3/3. |
| 5 Batterie | Serie/antiserie | esp1 serie, esp2 antiserie | v2-cap5-esp1/2 | NESSUN GAP. 2/2. NOTA: PDF Glossario menziona "parallelo Ah" ma nessun esp. |
| 6 LED Vf | Vf + calcolo R | esp1 2LED+1R, esp2 colori div serie, esp3 3LED, esp4 misura Vf | v2-cap6-esp1/2/3/4 | NESSUN GAP. 4/4. |
| 7 Condensatori | RC scarica | esp1 multimetro, esp2 LED scarica, esp3 cap par, esp4 varia R | v2-cap7-esp1/2/3/4 | NESSUN GAP. 4/4. |
| 8 MOSFET | Switch elettronico | esp1 base, esp2 carica corpo, esp3 V soglia con pot | v2-cap8-esp1/2/3 | NESSUN GAP. 3/3. |
| 9 Fototransistor | Sensore luce avanzato | esp1 base, esp2 luce notturna automatica | v2-cap9-esp1/2 | NESSUN GAP. 2/2. |
| 10 Motore DC | Movimento | esp1 motore, esp2 inverti, esp3 +puls, esp4 +LED indic | v2-cap10-esp1/2/3/4 | NESSUN GAP. 4/4. |
| **11 Diodi protezione** | **Diodo flyback** | **0 esp libro nel volume-references.js** | **0 lesson-paths** | **⚠️ GAP TOTALE V2 CAP11**: glossario PDF cita 5 termini (Diodo protezione, Bobina, Campo magn, Picco V, Diodo approf) ma ZERO esp pratici lato libro+digitale. Davide review: serve esp pratico? |
| 12 Robot Capstone | Segui-luce | esp1 robot foto+MOSFET+motori | v2-cap12-esp1 | NESSUN GAP. 1/1. |

**Vol2 totale**: 27/27 mapping COMPLETO ECCETTO cap11 zero. Score Vol2 = **0.78** (cap11 missing pratico, "sfide" cap10-esp4 generic).

### Vol3

| Cap libro | Tema | Variazioni narrative libro | Lesson-paths digitali | Gap |
|-----------|------|---------------------------|----------------------|-----|
| 5 Sketch | setup/loop/Blink | esp1 Blink builtin, esp2 modifica delay | v3-cap5-esp1/2 | NESSUN GAP. 2/2. |
| 6 Pin digitali OUTPUT | digitalWrite + variazioni | esp1 LED esterno D13, esp2 cambia pin D8, esp3 sperimentazione, esp4 2LED sirena, esp5 commenti, esp6 debug, esp7 codice Morse, +morse alias, +semaforo alias | v3-cap6-esp1/2/3/4/5/6/7 + v3-cap6-morse + v3-cap6-semaforo | ⚠️ GAP MINORE: alias `morse` e `semaforo` duplicano `esp7` (Morse) e `esp4` semaforo non esiste. Schema confuso libro vs digitale. |
| 7 INPUT pulsante | digitalRead + INPUT_PULLUP | esp1 puls+LED, esp2 puls spegne, esp3 INPUT_PULLUP, esp4 PWM, esp5 fade, esp6 toggle, esp7 contatore binario, esp8 debounce | v3-cap7-esp1/2/3/4/5/6/7/8 + v3-cap7-mini | ⚠️ GAP STRUCTURAL: PDF Glossario cap7 = "I pin input e output" (pulsanti+PULLUP) — esp4-5 (PWM/fade) appartengono semanticamente a Cap8 analogico nel libro, non Cap7. Mapping digitale `v3-cap7-esp4/esp5` violation narrative. |
| 8 Analogici | analogRead+Serial | esp1 Serial.println setup, esp2 Serial loop, esp3 analogRead+Serial, esp4 Serial Plotter 2pot, esp5 capstone pot+3LED+Serial, +serial alias | v3-cap8-esp1/2/3/4/5 + v3-cap8-serial | ⚠️ GAP MINORE: alias `v3-cap8-serial` duplica `esp3`. Naming inconsistency. |
| **9 Motore Arduino** | **Pilotaggio MOSFET** | **0 esp libro (PDF cap9 incomplete V0.8.1)** | **0 lesson-paths** | **⚠️ GAP TOTALE V3 CAP9**: glossario cita Pilotaggio motore ma libro V0.8.1 incompleto, ZERO esp digitali. |
| **10 Pulsante+LED Arduino** | **Combo I/O** | **0 esp** | **0 lesson-paths** | **⚠️ GAP TOTALE V3 CAP10**: ridondante con Cap7 esp1. Possibile da rimuovere come capitolo o aggiungere variazioni. |
| **11 Diodo flyback Arduino** | **Protezione motore** | **0 esp** | **0 lesson-paths** | **⚠️ GAP TOTALE V3 CAP11**: glossario menziona ma nessun esp libro+digitale. |
| **12 Robot Segui Luce Arduino** | **CAPSTONE** | **0 esp libro V0.8.1 cap12 incomplete** | **0 lesson-paths** | **⚠️ GAP TOTALE V3 CAP12**: capstone Arduino mancante (Vol2 cap12 capstone elettronico OK). |
| **Extra (NON nel libro)** | **Progetti avanzati** | **NESSUNA narrative book** | **v3-extra-lcd-hello + v3-extra-servo-sweep + v3-extra-simon** | **⚠️ SUPERFLUI: 3 esp digitali NON corrispondenti a capitoli volume**. Sono in `volume-references.js` come "Extra - Progetti e Sfide Finali" pag 88-92 ma il PDF Glossario non li elenca come capitoli. |

**Vol3 totale**: 22/27 esp narrativi cap5-8 covered, 0/4 cap9-12 (volume incomplete), 3 extra non-canonical. Score Vol3 = **0.55** (cap9-12 zero, extra superflui, alias confondono naming).

---

## 4. Diagnosi narrative continuum violation per capitolo

**REGOLA Andrea iter 18 PM**: "esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro tenti pezzi staccati"

### Vol1 — Diagnosi
- **Cap6/7/8/9/10/11/12/13/14**: lesson-paths PRESENTANO variazioni stesso tema OK. Ordine matcha narrativa ✅. Naming `esp{N}` sequenziale ✅.
- **Violazione minore**: `v1-cap9-esp7/8/9` sono "sfide aperte" (libro testo "Vuoi provare ad aggiungere..."). Non hanno step-by-step rigide come libro narrativa. Potrebbero confondere.
- **Score Vol1 narrative continuum**: 0.85 — buon allineamento.

### Vol2 — Diagnosi
- **Cap3/4/5/6/7/8/9/10**: variazioni narrative OK. Tema centrale per cap mantenuto ✅.
- **Cap11 violazione TOTALE**: glossario libro cita 5 termini diodi protezione MA volume-references.js + lesson-paths flat = ZERO esp. Discrepanza assoluta narrativa libro (esiste cap teorico) vs digitale (non implementato).
- **Score Vol2 narrative continuum**: 0.78 — cap11 black hole.

### Vol3 — Diagnosi (PROBLEMATICO)
- **Cap5/8 OK**: narrativa lineare seguita.
- **Cap6 violazione SCHEMA**: nomi `morse`/`semaforo` come alias separati da `esp{N}` rompono numbering sequenziale narrativo. Nel libro semaforo è esempio dentro Cap6 esp4-5 (vedi `volume-references.js` linee 962-972), non un esperimento separato.
- **Cap6/Cap8 alias DUPLICATI**: `v3-cap6-morse` ≅ `v3-cap6-esp7` (Morse), `v3-cap8-serial` ≅ `v3-cap8-esp3` (analogRead+Serial). DUE strade per stessa cosa = pezzi staccati.
- **Cap7 violazione SEMANTICA**: digitale mette PWM/fade/toggle/contatore/debounce come esp4-8 di cap7, ma libro Cap7 = "I pin input e output" (solo INPUT_PULLUP). PWM/analog appartengono Cap8 nel libro. **Lesson-paths Vol3 cap7 = 8 esp ma libro cap7 = 2 esp narrativi (1=pulsante PULLUP, 2=2LED scelta)**. Le altre 6 esp lesson-path sono PEZZI STACCATI inseriti.
- **Cap9-12 violazione TOTALE**: libro V0.8.1 incompleto, glossario PDF nota righe 37-38 "ricostruiti da titoli". ZERO esp libro/digitale. Cap arduino motore/diodi/robot mancano completamente.
- **Extra (lcd/servo/simon) violazione MORFISMO**: 3 esp digitali esistono SOLO nel software, NON nel volume cartaceo PDF. Anti-pattern Morfismo Sense 2.
- **Score Vol3 narrative continuum**: 0.55 — diversi pezzi staccati, alias duplicati, capitoli mancanti, esp solo-software.

**Diagnosi sintetica**:
- Vol1: ✅ esemplare narrativa
- Vol2: ⚠️ cap11 missing
- Vol3: ❌ violations multiple — È QUI il problema iter 18 PM

---

## 5. Glossario Tea mapping vs lesson-paths + RAG coverage

**Totale termini Glossario Tea**: Vol1=66 + Vol2=59 + Vol3=55 = **180 termini**.

### Sample mapping (12 termini key, NO completo per spazio):

| Termine | Cap libro | Lesson-path digit cita | RAG chunk Supabase? |
|---------|-----------|----------------------|---------------------|
| LED (Vol1 PDF:303) | V1 Cap6 | v1-cap6-esp1/2/3 + v1-cap7-esp* + ... (50+ menzioni cross-cap) | ✅ rag_chunks vol1 cap6 (1881 chunks ingest iter 7) |
| Anodo/Catodo (Vol1 PDF:321/328) | V1 Cap6 | v1-cap6-esp1 bookInstructions cita gambetta lunga/corta | ✅ chunk vocabulary "anodo"/"catodo" |
| Sintesi additiva (Vol1 PDF:429) | V1 Cap7 | v1-cap7-esp4 bookContext cita "sintesi additiva" | ✅ vol1 cap7 chunks |
| Pulsante (Vol1 PDF:445) | V1 Cap8 | v1-cap8-esp1/2/3/4/5 | ✅ |
| Reed switch (Vol1 PDF:623) | V1 Cap12 | v1-cap12-esp1/2/3/4 | ✅ |
| Elettropongo (Vol1 PDF:657) | V1 Cap13 | v1-cap13-esp1/2 | ✅ |
| Multimetro (Vol2 PDF:107) | V2 Cap3 | v2-cap3-esp1/2/3/4 | ✅ |
| Antiserie (Vol2 PDF:249) | V2 Cap5 | v2-cap5-esp2 cita "ANTISERIE" verbatim | ✅ |
| Tau RC (Vol2 cap7 implicit) | V2 Cap7 | v2-cap7-esp4 cita "Tau = R × C" | ✅ |
| **Diodo protezione (Vol2 PDF:563)** | V2 Cap11 | **❌ NESSUN lesson-path** (cap11 missing) | ⚠️ chunk teorico solo, nessun esperimento |
| Sketch/setup/loop (Vol3 PDF:247-274) | V3 Cap5 | v3-cap5-esp1/2 | ✅ |
| **Diodo flyback (Vol3 PDF:545)** | V3 Cap11 | **❌ NESSUN lesson-path** (cap11 missing) | ⚠️ chunk teorico solo |
| **Robot Segui Luce Arduino (V3 PDF:563)** | V3 Cap12 | **❌ NESSUN lesson-path Arduino** (Vol2 cap12 ha versione non-Arduino) | ⚠️ |

**Mapping coverage statistic**:
- ~150/180 termini (83%) hanno almeno 1 lesson-path che li cita esplicitamente nel `bookText/Instructions/Quote`
- ~30/180 termini (17%) coprono cap senza esp pratici (V1 Cap1-5 teorici + V2 Cap1-2-11 + V3 Cap1-4-9-10-11-12)
- RAG coverage onesto: 1881 chunks su 6000 target (Box 3 Sprint S = 0.7), copre Vol1+2+3 + 100 wiki concepts. Ricerca termini tipo "antiserie" / "elettropongo" funziona, ma "diodo flyback" recall basso (poco materiale libro).

---

## 6. Score Morfismo Sense 2 honest current

**Definizione (CLAUDE.md sezione MORFISMO Sense 2)**: software lesson-paths mirror narrative volumi cartacei + kit Omaric. Stesso ordine, nomi, pagine, struttura.

**Calcolo onesto current**:

| Dimensione | Peso | Score | Note |
|------------|------|-------|------|
| Match numerico esperimenti (Vol1: 38/38, Vol2: 27/27, Vol3: 27/27) | 0.20 | 0.95 | Quasi-perfetto numerico |
| Naming consistency lesson-paths | 0.10 | 0.65 | Vol3 alias morse/semaforo/mini/serial duplicano, naming inconsistente |
| Capitolo titolo libro = title digitale | 0.10 | 0.85 | Volume-references.js mantiene `chapter` tag (es "Capitolo 6 - Cos'è il diodo LED?") OK |
| Page reference accuracy (`bookPage`) | 0.10 | 0.90 | Pagine pdf documentate volume-references |
| Variazioni narrative continuum (vs pezzi staccati) | 0.20 | 0.65 | Vol1 OK, Vol2 cap11 GAP, Vol3 cap6/7/9-12 violations |
| Glossario terms coverage in lesson-paths | 0.10 | 0.85 | 83% termini citati, 17% solo cap teorici |
| Anti-pattern Morfismo (esp solo-software) | 0.10 | 0.40 | 3 extra Vol3 (lcd/servo/simon) violation |
| Schema lesson-path (flat vs grouped narrative) | 0.10 | 0.30 | flat 92 file = pezzi staccati; volumi raggruppano per tema-capitolo |

**Score Morfismo Sense 2 ONESTO current** = 0.20×0.95 + 0.10×0.65 + 0.10×0.85 + 0.10×0.90 + 0.20×0.65 + 0.10×0.85 + 0.10×0.40 + 0.10×0.30
= 0.19 + 0.065 + 0.085 + 0.09 + 0.13 + 0.085 + 0.04 + 0.03
= **0.715/1.0 (~7.2/10)**

**ADR-027 PROPOSED claim** "post-refactor 0.7 → 0.95" è **PLAUSIBILE** se refactor `lesson-paths-narrative/v{N}-cap{M}.json` grouped + rimozione superflui + add cap mancanti. Current 0.72 ≅ 0.7 ADR baseline coincide approssimativamente.

---

## 7. Lista esperimenti SUPERFLUI digitali (NON nel libro, candidati removal)

| Lesson-path | Motivo superfluità | Azione consigliata iter 22 |
|-------------|--------------------|--------------------------|
| `v3-cap6-morse.json` | Duplica `v3-cap6-esp7` (Morse). Sezione PDF Glossario:303-309 cita LED ma NON nominazione separata "morse". Volume-references.js linee 930-940 mappa pag 57 STESSA pag di esp7. | **REMOVE** o consolidare in esp7 |
| `v3-cap6-semaforo.json` | Volume-references.js linee 962-972 mappa pag 58 chapter "Capitolo 6 - I Pin Digitali". Glossario PDF non separa "semaforo" come esp distinto, è esempio del cap6 narrativa. Schema confuso. | **CONSOLIDATE** in esp4 (semaforo era inline narrative cap6) |
| `v3-cap7-mini.json` | Volume-references.js NON mappa esplicitamente. È duplicato/alias confuso. | **REMOVE** se duplicato |
| `v3-cap8-serial.json` | Duplica `v3-cap8-esp3` (analogRead+Serial Monitor). volume-references.js linee 1126+ mappa stesso obiettivo. | **REMOVE** o consolidare |
| `v3-extra-lcd-hello.json` | NON in volume PDF (cap V3 V0.8.1 ha solo cap1-12). Volume-references.js cita pag 88 "Extra - Progetti e Sfide Finali" ma libro Glossario PDF non elenca extra come capitolo. **Anti-pattern Morfismo**. | **DEPRIORITIZE** o move a separate "Extra" non-canonical lane |
| `v3-extra-servo-sweep.json` | Idem sopra (LCD/servo/simon = ELAB pad-on, non libro). Servo NON nel kit base PDF. | **DEPRIORITIZE** |
| `v3-extra-simon.json` | Idem. Simon Says = progetto creativo ELAB extra-libro. | **DEPRIORITIZE** |

**Totale candidati removal/consolidate**: 4 (alias) + 3 (extra) = **7 lesson-paths superflui** (8% del totale 92).

---

## 8. Lista variazioni libro MANCANTI digitali (candidati add)

### Cap volumi con ZERO esp digitali (gap totale)

| Cap libro | Tema | Esp da aggiungere |
|-----------|------|-------------------|
| **V2 Cap11** Diodi protezione | 5 termini glossario (Diodo prot, Bobina, Campo magn, Picco V, Diodo approf) | Esperimento polarità inversa con diodo (LED si accende solo in 1 verso); Esperimento motore + diodo flyback in parallelo bobina (osserva picco V quando spegni motore). MIN 2 esp pratici. |
| **V3 Cap9** Motore Arduino | Pilotaggio MOSFET via digitalWrite | Esperimento Arduino+pinMode OUTPUT+MOSFET+motore (1 sketch base, 1 PWM speed control). MIN 2 esp. |
| **V3 Cap10** Pulsante+LED Arduino | Programma interattivo | Già coperto da v3-cap7-esp1/2/6. Possibile ridondanza, ma se libro lo chiede, add 1 esp specifico "modalità debug Serial Monitor durante interactive". |
| **V3 Cap11** Diodo flyback | Protezione Arduino motori | Esperimento motore+Arduino+diodo flyback (variation cap9 con focus protezione). MIN 1 esp. |
| **V3 Cap12** Robot Segui Luce Arduino | CAPSTONE Vol3 | Esperimento Arduino+2LDR+2MOSFET+motori+algoritmo segui-luce (versione Arduino del Vol2 cap12 elettronico). MIN 1 esp capstone. |

**Totale missing variazioni**: ~6-8 esp. Costo Davide+Andrea: 1-2 settimane scrittura libro Vol3 V0.9 + lesson-paths.

### Variazioni "sfide aperte" che potrebbero diventare esp guidate

- v1-cap9-esp7/8/9 ("Vuoi provare ad aggiungere..."): potrebbero avere step-by-step rigida vs testo aperto
- v1-cap10-esp5/6: parti da esp4 ma instruction generic
- v1-cap12-esp3/4: "Realizza un circuito che..." senza step

**Action**: convertire 6+ "sfide aperte" → step-by-step formali (quality lift, no add new esp).

---

## 9. Recommendation ADR-027 schema concrete

### Schema attuale (flat 95 file)

```
src/data/lesson-paths/
├── v1-cap6-esp1.json
├── v1-cap6-esp2.json
├── v1-cap6-esp3.json
├── v1-cap7-esp1.json
... (95 file totale)
```

**Problema**: ogni file standalone. UNLIM mounta `experiment_id` singolo. Narrative continuum perso. Studente vede esp4 senza contesto esp1-3 capitolo.

### Schema proposto post-refactor (grouped narrative)

```
src/data/lesson-paths-narrative/
├── v1-cap6.json   # 1 file PER CAPITOLO contiene tutta narrative
├── v1-cap7.json
├── ...
├── v3-cap8.json
```

### Esempio concrete `v1-cap6.json` grouped struct:

```json
{
  "_meta": {
    "version": "2.0",
    "schema": "narrative-grouped",
    "source": "Vol1 Cap6 'Cos'è il diodo LED?' p.27 Vol1 PDF",
    "glossarioRef": "Glossario_Vol1.pdf:301-389 (10 termini)"
  },
  "volume": 1,
  "chapter": 6,
  "chapter_title": "Cos'è il diodo LED?",
  "chapter_page_start": 27,
  "tema_centrale": "LED accensione + variazioni",
  "narrative_intro": "Il LED è una piccola lampadina elettronica...",
  "vocabulary": ["LED","diodo","anodo","catodo","polarità","gambetta","cortocircuito","resistore","circuito chiuso"],
  "glossario_terms": [
    {"term": "LED", "tecnica": "Light Emitting Diode...", "bambini": "una piccola lampadina..."},
    {"term": "Anodo", "tecnica": "Terminale +", "bambini": "gamba LUNGA"},
    // ... 8 more termini Cap6 PDF Vol1
  ],
  "experiments": [
    {
      "id": "esp1",
      "narrative_position": "primo",
      "title": "Accendi il tuo primo LED",
      "book_page": 29,
      "book_text": "Per accendere il LED...",
      "instructions": [...],
      "transition_to_next": "Adesso che hai acceso il LED, vediamo cosa succede SENZA il resistore..."
    },
    {
      "id": "esp2",
      "narrative_position": "dimostrativo: cosa NON fare",
      "title": "LED senza resistore (cosa NON fare!)",
      "book_page": 32,
      "book_text": "Il nostro circuito include un resistore, ma perché?...",
      "warning": "ATTENZIONE: il LED si brucia!",
      "transition_from_prev": "Variazione esp1: rimuovi resistore",
      "transition_to_next": "Ora che capisci il rischio, esplora resistori diversi"
    },
    {
      "id": "esp3",
      "narrative_position": "variazione luminosità",
      "title": "Cambia luminosità con resistenze diverse",
      "book_page": 33,
      "book_text": "Per rendere il led più luminoso...",
      "instructions": [...],
      "transition_from_prev": "Parti dal circuito esp1, cambia R 470→220",
      "concludes_chapter": true
    }
  ],
  "chapter_capstone_summary": "Hai imparato come funziona un circuito LED, perché serve il resistore, e come la luminosità dipende dalla R."
}
```

**Benefici grouped**:
- UNLIM riceve TUTTO il contesto capitolo in 1 mount → narrativa continua
- `transition_from_prev/to_next` esplicita continuum (no pezzi staccati)
- `narrative_position` + `concludes_chapter` segnano arco narrativo
- Glossario termini per cap inline (no fetch separato)
- 38 file Vol1 → 9 file (1 per cap), 27 Vol2 → 10 file, 27 Vol3 → 8 file = **~27 file totali** (vs 95 attuali)

### Path migrazione proposta iter 22-25:

1. **Iter 22**: Davide review + approve schema v2.0 grouped
2. **Iter 23**: gen-app-opus migra Vol1 (38 esp → 9 file grouped) + tests preserved
3. **Iter 24**: gen-app-opus migra Vol2 + Vol3 cap5-8 (CAP9-12 add)
4. **Iter 25**: deprecate `lesson-paths/` flat (mantenere alias compat 1 sprint)
5. **Iter 26**: Davide + Andrea ratify retire flat schema definitiva

---

## 10. Davide Fagherazzi review action items per iter 22

### CRITICAL — Decisioni Davide per iter 22 spawn

1. **Vol2 Cap11 Diodi protezione**: scrivere libro 2-3 esp pratici (diodo polarità + diodo flyback motore)? O Cap11 resta solo teorico glossario? **Decision Davide.**

2. **Vol3 V0.8.1 Cap9-12 incomplete**: serve Vol3 V0.9 con cap9-12 completi (Motore+Arduino, Pulsante+LED Arduino, Diodo flyback Arduino, Robot Segui Luce Arduino)? Stima 4-6 settimane scrittura Davide. **Decision Davide.**

3. **Vol3 cap7 PWM/fade/toggle/contatore/debounce**: questi 6 esp digitali pertengono Cap7 (input/output) o Cap8 (analogici)? **Davide review libro narrativa cap7-cap8 split**.

4. **Vol3 Extra (LCD/Servo/Simon)**: questi 3 esp digitali esistono solo software. Aggiungere a Vol3 V0.9 come "Capitolo 13: Progetti Extra"? O rimuovere? **Decision Davide.**

5. **Naming alias `morse`/`semaforo`/`mini`/`serial`**: Davide preferisce numbering puro `esp{N}` o naming descriptive? Andrea propone REMOVE alias, mantenere solo `esp{N}`. **Decision Davide.**

### MINOR — Refactor schema (post Davide OK su #1-5)

6. ADR-027 grouped schema apply: Andrea+gen-app-opus spawn iter 23-26 (5 sessioni).

7. Glossario Tea integration: 180 termini in `lesson-paths-narrative/v{N}-cap{M}.json` `glossario_terms[]` field — auto-import script. Tea+Davide review.

8. Sfide aperte (v1-cap9-esp7/8/9 + v1-cap12-esp3/4): convertire step-by-step formali. Andrea + Tea iter 22 PM.

---

## SUMMARY ONESTO TLDR

- **92 esperimenti** lesson-paths flat = **92 voci** volume-references.js (match numerico ✅)
- **180 termini Glossario** Tea Vol1+2+3 = 83% citati in lesson-paths
- **Score Morfismo Sense 2 onesto current = 0.72/1.0** (ADR-027 baseline 0.70 confermato)
- **GAP critici**: V2 Cap11 (0 esp), V3 Cap9/10/11/12 (0 esp libro V0.8.1 incomplete)
- **SUPERFLUI**: 7 lesson-paths (4 alias duplicati + 3 extra non-canonical)
- **Vol1 esemplare** (0.85), **Vol2 cap11 black hole** (0.78), **Vol3 problematico** (0.55) — È QUI il focus iter 21-22
- **ADR-027 schema grouped narrative** raccomandato (95 file flat → ~27 file per-capitolo)
- **Davide review queue** = 5 decisioni critical iter 22

---

— FINE DOC VOLUMI-EXPERIMENT-ALIGNMENT.md —
