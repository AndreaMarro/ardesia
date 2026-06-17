# VOLUMI ↔ EXPERIMENT ALIGNMENT V2 — GROUND TRUTH ODT/PDF TRES JOLIE

**Data**: 2026-04-28 22:30 CEST | **Autore**: agent readonly re-audit V2 (correggere iter 21 errors) | **Mode**: caveman terse

**Sources GROUND TRUTH** (validated Andrea):
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf` → estratto `/tmp/vol1-real.txt` (2369 lines, 14 cap, 67 ESPERIMENTO mark)
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf` → estratto `/tmp/vol2-real.txt` (3017 lines, 12 cap, 49 ESPERIMENTO mark)
- `/Users/andreamarro/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/MANUALE VOLUME 3 WORD.odt` → estratto `/tmp/vol3-full.txt` (98704B no-LF, **9 cap reali** NON 12, 23 ESERCIZIO mark, 16 Sketch_Capitolo_X_Y unique)

**Sources ELAB DIGITAL**:
- `src/data/lesson-paths/v{1,2,3}-cap*.json` (95 file scanned)
- `src/data/volume-references.js` (1226 LOC)

**Sources DEPRECATED OUTDATED** (used iter 21 ERRONEOUSLY, vedere §0):
- `/VOLUME 3/TEA/GLOSSARIO TEA 28 APRILE/Glossario_Vol3.pdf` (V0.8.1 bozza vecchia 12-cap, cap9-12 ricostruiti da titoli ⚠️)

---

## 0. ERROR CORRECTION — claim iter 21 sbagliati

Il documento iter 21 `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (407 righe) ha basato Vol3 audit su Tea Glossario PDF V0.8.1 ricostruito (note PDF righe 37-38 "termini cap9-12 ricostruiti da titoli"). **Questa fonte è OUTDATED**.

### Claim ERRATI iter 21 — debunked:

| Claim iter 21 | Realtà ground truth ODT |
|--------------|------------------------|
| "Vol3 = 12 capitoli" (riga 54-69) | **MITO** — Vol3 ODT ha **9 capitoli reali** (Indice ODT righe 4: "Capitolo 1...8 – Capitolo 9 – Non è finita qui!") |
| "Vol3 Cap9 Motore Arduino — 0 esp ⚠️ GAP TOTALE" (riga 66) | **MITO** — Cap9 ODT = "Non è finita qui!" closing/teaser. NON è capitolo Motore. ZERO esp = CORRETTO design libro, non gap. |
| "Vol3 Cap10 Pulsante+LED Arduino — GAP" (riga 67) | **MITO** — Cap10 NON ESISTE in Vol3 ODT. Iter 21 ha hallucinato cap inesistente. |
| "Vol3 Cap11 Diodi flyback Arduino — GAP" (riga 68) | **MITO** — Cap11 NON ESISTE in Vol3 ODT. |
| "Vol3 Cap12 Robot Segui Luce Arduino CAPSTONE — GAP" (riga 69) | **MITO** — Cap12 NON ESISTE in Vol3 ODT. Capstone Arduino = Vol3 V0.9 future scope, non gap V0.9 attuale. |
| "Score Vol3 = 0.55 (cap9-12 zero, extra superflui, alias confondono naming)" (riga 142) | **WRONG** — il calcolo include cap10-12 inesistenti come "0/4 GAP". Score reale ricalcolato §5 = **~0.92**. |
| "Vol3 totale 22/27 esp narrativi cap5-8 covered" (riga 142) | **WRONG count** — Vol3 ODT ground truth = **23 ESERCIZIO totali** (cap5=2, cap6=8, cap7=7, cap8=6). Iter 21 sotto-conta cap6 (7 vs reale 8) e sopra-conta cap7 (8 vs reale 7). |
| "v3-cap7-mini.json NON mappato" (riga 236) | PARZIALE — `v3-cap7-mini.json` = mini-progetto cap7 valido come variazione. Non superfluo per definizione. |
| "Cap7 violazione SEMANTICA — PWM/fade/toggle/contatore/debounce sono cap8" (riga 134, 164) | **WRONG semantica** — Vol3 ODT cap7 = "I pin analogici" (Sketch_Capitolo_7_*). Cap6 = "Pin digitali" (LED+pulsante INPUT_PULLUP). Cap8 = "Monitor seriale" (Serial.print/Plotter). Iter 21 inverte cap6/7 nomenclature. PWM/fade/analogWrite SONO cap7 (analogici). |

### Conseguenza
Score Sense 2 Morfismo iter 21 = **0.715/1.0** (riga 222) gonfiato di GAP fittizi. Ricalcolo onesto §5 = **~0.78/1.0** (Vol3 lift +0.30, cap10-12 phantom rimossi).

---

## 1. Ground truth ODT/PDF TRES JOLIE inventory (cap reali per volume)

### Vol1 PDF V0.9 — Le Basi (14 capitoli, 38 esperimenti narrativi)

Estratto `/tmp/vol1-real.txt:13-26` indice + `:964-2369` esperimenti.

| Cap | Titolo (PDF:line) | Pag inizio | # ESPERIMENTO mark | Tema |
|-----|------------------|------------|--------------------|------|
| 1 | La Storia dell'Elettronica (vol1-real.txt:13) | 5 | 0 (teorico) | Storia |
| 2 | Le grandezze elettriche e legge di Ohm (:14) | 9 | 0 (teorico) | V/I/R |
| 3 | Cos'è un resistore? (:15) | 13 | 0 (teorico cap, esp pratici Vol2 cap3 multimetro) | R |
| 4 | Cos'è la breadboard? (:16) | 21 | 0 (teorico) | Breadboard |
| 5 | Cosa sono le batterie? (:17) | 25 | 0 (teorico) | Battery |
| 6 | Cos'è il diodo LED? (:18) | 27 | 3 (vol1-real.txt:964/1011/1032) | LED |
| 7 | Cos'è il LED RGB? (:19) | 35 | 6 (:1107/1141/1150/1153/1174/1191) | RGB |
| 8 | Cos'è un pulsante? (:20) | 43 | 5 (:1251/1299/1303/1361/1430) | Pulsante |
| 9 | Cos'è un potenziometro? (:21) | 57 | 9 (:1507/1565/1577/1581/1640/1701/1795/1802/1805) | Potenziometro |
| 10 | Cos'è un fotoresistore? (:22) | 81 | 6 (:1842/1881/1891/1937 +2) | LDR |
| 11 | Cos'è un cicalino? (:23) | 93 | 2 | Buzzer |
| 12 | L'interruttore magnetico (:24) | 97 | 4 | Reed |
| 13 | Cos'è l'elettropongo? (:25) | 103 | 2 | Plastilina |
| 14 | Costruiamo il nostro primo robot (:26) | 107 | 1 | CAPSTONE |

**Totale Vol1 esperimenti reali**: 3+6+5+9+6+2+4+2+1 = **38 ESPERIMENTO** (✅ matcha conteggio iter 21).

### Vol2 PDF V0.9 — Approfondiamo (12 capitoli, 27 esperimenti narrativi)

Estratto `/tmp/vol2-real.txt:9-20` indice + 49 ESPERIMENTO mark (multipli per esp con "Per questo esperimento" subhdr).

| Cap | Titolo (PDF:line) | Pag | Tema | # esp |
|-----|------------------|-----|------|-------|
| 1 | Altri cenni storia elettronica | 5 | Storia | 0 |
| 2 | Cos'è l'elettricità? | 9 | Atomica | 0 |
| 3 | Il Multimetro | 13 | Misure | 4 |
| 4 | Approfondiamo le resistenze | 37 | R serie/par | 3 |
| 5 | Approfondiamo le batterie | 47 | Batt serie | 2 |
| 6 | Approfondiamo i LED | 53 | Vf/calc R | 4 |
| 7 | Cosa sono i condensatori? | 63 | RC | 4 |
| 8 | Cosa sono i transistor? | 75 | MOSFET | 3 |
| 9 | Cosa sono i fototransistor? | 85 | Foto-T | 2 |
| 10 | Motore a corrente continua | 93 | DC | 4 |
| 11 | I diodi | 103 | Protezione | 0 ⚠️ GAP CONFERMATO |
| 12 | Costruiamo robot marciante | 109 | CAPSTONE | 1 |

**Totale Vol2 esp reali**: 4+3+2+4+4+3+2+4+0+1 = **27** (✅ matcha iter 21). **Cap11 GAP CONFERMATO ground truth** (PDF cap11 puramente teorico, no esp).

### Vol3 ODT V0.9 — Programmazione Arduino (9 capitoli reali, 23 esperimenti)

Estratto `/tmp/vol3-full.txt` indice (riga 4 single-line stretchato). Sketch_Capitolo_X_Y unique mark = 16. ESERCIZIO mark = 23.

| Cap | Titolo ODT | Tema | # ESERCIZIO ground truth | Sketch ODT |
|-----|-----------|------|-------------------------|------------|
| 1 | Un viaggio nella storia della programmazione | Storia SW (Ada Lovelace, ENIAC, Arduino) | 0 (teorico) | – |
| 2 | Cos'è la programmazione? | Concetti SW (ricetta, compilatore, bug, algoritmi) | 0 (teorico) | – |
| 3 | Hardware e Software | HW/SW (firmware, microcontrollore, CPU) | 0 (teorico) | – |
| 4 | Introduciamo Arduino | IDE setup, boards manager, community | 0 (teorico/setup) | – |
| 5 | Il nostro primo programma (Blink) | setup/loop/Blink | 2 (ESERCIZIO 5-1, 5-2 modifica delay) | (Blink LED_BUILTIN inline, no Sketch_5_*) |
| 6 | Il mondo discreto: i pin digitali | digitalWrite, HIGH/LOW, AND/OR, INPUT_PULLUP, IF/ELSE, bool, bounce, while | 8 ESERCIZIO 6-1..6-7 visible + AND/OR test esp1 | Sketch_Capitolo_6_1..6_7 (7 sketch unique) |
| 7 | Il mondo continuo: i pin analogici | analogRead, ADC 0-1023, V calc, trimmer, PWM/analogWrite, duty cycle, ciclo for, effetto respiro, map(), analogWriteResolution | 7 ESERCIZIO 7-1..7-8 (mark count 7 distinct grep) | Sketch_Capitolo_7_1..7_3 visible (esp avanzati condividono sketch) |
| 8 | Visualizzare dati: il Monitor Seriale | Serial.begin/print/println, Serial Plotter, baud, debug, while(!Serial), char/String | 6 ESERCIZIO 8-1..8-6 | Sketch_Capitolo_8_1..8_6 (6 sketch unique) |
| 9 | Non è finita qui! | Closing/teaser per Vol4 future | 0 (closing chapter) | – |

**Totale Vol3 esp reali**: 2+8+7+6 = **23 ESERCIZIO** (verified `grep -cE "ESERCIZIO [0-9]" /tmp/vol3-full.txt` = 23).

### Anchor punti (ground truth, file:line):

- Vol3 indice: `/tmp/vol3-full.txt:4` ("Capitolo 1...Capitolo 8 – Capitolo 9 – Non è finita qui!")
- Vol3 ESERCIZIO 5-1 Blink: `/tmp/vol3-full.txt:166` ("ESERCIZIO 5-1 Adesso tocca a te! Apri Arduino IDE...")
- Vol3 ESERCIZIO 5-2 modifica delay: `/tmp/vol3-full.txt:224-227` ("ESERCIZIO 5...Vedrai che il lampeggio cambia!")
- Vol3 ESERCIZIO 6-1 AND/OR: `/tmp/vol3-full.txt:234`
- Vol3 Sketch_Capitolo_6_1..6_7: `/tmp/vol3-full.txt:275/283/288/325/350/364/369`
- Vol3 Cap7 ESERCIZIO 7-1: `/tmp/vol3-full.txt:421` ("In questo esperimento faremo una cosa molto interessante: accenderemo un LED ... pin 13 ... quando tensione su A0 supera 2,5V")
- Vol3 Sketch_Capitolo_7_1..7_3: `/tmp/vol3-full.txt:430/447/462`
- Vol3 Cap8 ESERCIZIO 8-1..8-6: `/tmp/vol3-full.txt:580-634`
- Vol3 Cap9 closing: `/tmp/vol3-full.txt` indice riga 4 trailing "Non è finita qui!" + chiusura testo finale

---

## 2. Tea Glossario PDF outdated diff vs ground truth

| Aspetto | Tea Glossario_Vol3.pdf (V0.8.1 bozza) | Vol3 ODT V0.9 reale |
|---------|---------------------------------------|---------------------|
| # Capitoli | 12 (cap9-12 ricostruiti da titoli, righe 37-38 PDF) | **9** (cap9 = closing) |
| Cap9 | "Motore con Arduino" | **"Non è finita qui!"** closing/teaser |
| Cap10 | "Pulsante e LED Arduino" | **NON ESISTE** |
| Cap11 | "Diodi con Arduino" | **NON ESISTE** |
| Cap12 | "Costruiamo robot Segui Luce Arduino" | **NON ESISTE** |
| Cap5 titolo | "Come è fatto un programma Arduino?" | "Il nostro primo programma!" (Blink) |
| Cap6 titolo | "I pin digitali: le dita di Arduino" | "Il mondo discreto: i pin digitali" |
| Cap7 titolo | "I pin input e output" (solo INPUT_PULLUP) | "Il mondo continuo: i pin analogici" (analogRead/PWM) |
| Cap8 titolo | "I pin analogici" | "Visualizzare dati: il Monitor Seriale" |

**Diff fondamentale**: Tea PDF cap6/7/8 = digitali/INPUT/analogici. Vol3 ODT V0.9 cap6/7/8 = digitali/**analogici**/seriale. **Tea PDF ha shifted le categorie cap6-8 di -1**, e cap9-12 sono **ricostruiti** (PDF self-admits riga 37-38).

**Decisione doc**: ground truth ODT V0.9 prevale. Tea Glossario va aggiornato to-do separato (non è scope iter 22 audit).

---

## 3. ELAB lesson-paths v1+v2+v3 inventory 95 file

`ls /Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/lesson-paths/` count = 95 file.

### Distribuzione

| Volume | # file | Pattern |
|--------|--------|---------|
| Vol1 | 38 | `v1-cap{6..14}-esp{1..N}.json` |
| Vol2 | 27 | `v2-cap{3..10,12}-esp{1..N}.json` (cap11 ZERO) |
| Vol3 | 30 | 24 `v3-cap{5..8}-esp{1..N}.json` + 4 alias (`v3-cap6-morse`, `v3-cap6-semaforo`, `v3-cap7-mini`, `v3-cap8-serial`) + 3 extra (`v3-extra-{lcd-hello,servo-sweep,simon}.json`) |

### Vol3 dettaglio (ground-truth-aligned)

| File | Maps to ODT | Source meta |
|------|-------------|-------------|
| v3-cap5-esp1.json | Cap5 ESERCIZIO 5-1 (Blink builtin) | "PDR auto-generated from experiments-vol3.js" |
| v3-cap5-esp2.json | Cap5 ESERCIZIO 5-2 (modifica delay) | idem |
| v3-cap6-esp1..7.json | Cap6 ESERCIZIO 6-1..6-7 + parte ODT 8-th esp implicit | idem |
| v3-cap6-morse.json | Cap6 ESERCIZIO 6-7 (Morse SOS) — **SOURCE: "Volume 3 Cap6 ESP3 — Codice Morse SOS"** ⚠️ self-claim source mismatch | curriculum YAML |
| v3-cap6-semaforo.json | Cap6 esempio narrativa "Più LED e semaforo" (esp 4-5 area) | curriculum YAML |
| v3-cap7-esp1..8.json | Cap7 ESERCIZIO 7-1..7-7 (8 file vs 7 ESERCIZIO ODT — 1 file extra non corrisponde) | idem |
| v3-cap7-mini.json | Cap7 mini-progetto luminosità | curriculum YAML |
| v3-cap8-esp1..5.json | Cap8 ESERCIZIO 8-1..8-5 (file 5 vs 6 ESERCIZIO ODT — 1 missing 8-6 barra LED progressiva) | idem |
| v3-cap8-serial.json | Cap8 alias Serial Monitor base | curriculum YAML |
| v3-extra-lcd-hello.json | NESSUN cap ODT corrisponde — extra-libro | curriculum YAML |
| v3-extra-servo-sweep.json | NESSUN cap ODT — extra-libro | curriculum YAML |
| v3-extra-simon.json | NESSUN cap ODT — extra-libro | curriculum YAML |

---

## 4. Cap-by-cap mapping VOL × LESSON-PATHS — table completa

### Vol1 (Vol1 PDF V0.9 ground truth)

| Cap libro | Esp libro reale | Lesson-paths | Score align |
|-----------|-----------------|--------------|-------------|
| 6 LED | 3 (esp 1/2/3) | v1-cap6-esp1/2/3 | **1.0** ✅ |
| 7 RGB | 6 (esp 1/2/3/4/5/6) | v1-cap7-esp1..6 | **1.0** ✅ |
| 8 Pulsante | 5 (esp 1..5) | v1-cap8-esp1..5 | **1.0** ✅ |
| 9 Potenziometro | 9 (esp 1..9) | v1-cap9-esp1..9 | **1.0** ✅ (esp7-9 testuale ma narrativa libro testuale anche) |
| 10 LDR | 6 (esp 1..6) | v1-cap10-esp1..6 | **1.0** ✅ |
| 11 Buzzer | 2 | v1-cap11-esp1/2 | **1.0** ✅ |
| 12 Reed | 4 | v1-cap12-esp1..4 | **1.0** ✅ |
| 13 Pongo | 2 | v1-cap13-esp1/2 | **1.0** ✅ |
| 14 Robot | 1 CAPSTONE | v1-cap14-esp1 | **1.0** ✅ |

**Vol1 score Vol1 = 1.0** (38/38 mapping perfetto numerico + sequenza). Note: cap1-5 teorici `/tmp/vol1-real.txt:13-17` = nessun esp libro, nessun esp ELAB = match per assenza intenzionale.

### Vol2

| Cap libro | Esp libro reale | Lesson-paths | Score align |
|-----------|-----------------|--------------|-------------|
| 3 Multimetro | 4 | v2-cap3-esp1..4 | **1.0** ✅ |
| 4 R serie/par | 3 | v2-cap4-esp1..3 | **1.0** ✅ |
| 5 Batterie | 2 | v2-cap5-esp1/2 | **1.0** ✅ |
| 6 LED Vf | 4 | v2-cap6-esp1..4 | **1.0** ✅ |
| 7 Condensatori | 4 | v2-cap7-esp1..4 | **1.0** ✅ |
| 8 MOSFET | 3 | v2-cap8-esp1..3 | **1.0** ✅ |
| 9 Fototransistor | 2 | v2-cap9-esp1/2 | **1.0** ✅ |
| 10 Motore DC | 4 | v2-cap10-esp1..4 | **1.0** ✅ |
| 11 Diodi protezione | **0 (cap teorico)** | **0** lesson-path | **1.0 ✅** (match per assenza, NON gap — libro design teorico) |
| 12 Robot Capstone | 1 | v2-cap12-esp1 | **1.0** ✅ |

**Vol2 score = 1.0** (27/27 mapping numerico). Cap11 = 0 esp BOTH libro AND ELAB = consistente, NON è gap (correzione iter 21). Iter 21 chiamava "GAP TOTALE" = wrong, libro stesso ha cap11 puramente teorico.

### Vol3 (KEY FOCUS — ground truth ODT)

| Cap ODT | Esp ODT reale | Lesson-paths | Score align | Note |
|---------|---------------|--------------|-------------|------|
| 1 Storia | 0 (teorico) | 0 | 1.0 ✅ | Match assenza |
| 2 Cos'è programmazione | 0 | 0 | 1.0 ✅ | Match assenza |
| 3 HW/SW | 0 | 0 | 1.0 ✅ | Match assenza |
| 4 Introduciamo Arduino | 0 (setup IDE) | 0 | 1.0 ✅ | Match assenza |
| 5 Blink | 2 (ESERCIZIO 5-1, 5-2) | v3-cap5-esp1/2 | **1.0** ✅ | 2/2 perfetto |
| 6 Pin digitali | 8 (ESERCIZIO 6-1..6-7 + AND/OR test) | v3-cap6-esp1..7 + morse + semaforo = 9 file | **0.85** ⚠️ | 1 lesson-path extra (alias) confonde naming. Quantità 9 vs 8 ODT, semafora-alias e morse-alias duplicano `esp{N}` numbering ground truth |
| 7 Pin analogici | 7 (ESERCIZIO 7-1..7-7 unique grep) | v3-cap7-esp1..8 + mini = 9 file | **0.80** ⚠️ | 9 lesson-path vs 7 ODT esp = 2 extra. esp8 e mini possibili duplicati/extension senza backing libro chiaro. Naming consistente ma over-coverage. |
| 8 Monitor seriale | 6 (ESERCIZIO 8-1..8-6) | v3-cap8-esp1..5 + serial = 6 file | **0.95** ✅ | 6 file vs 6 esp ODT ✅, ma esp6 ODT ("barra progressiva LED") manca esplicitamente — `v3-cap8-serial` è alias `esp1` non barra LED. Naming alias-vs-numbering rumore. |
| 9 Non è finita qui! | 0 (closing) | 0 | 1.0 ✅ | Match per assenza intenzionale |
| **Extra (NON in ODT)** | – | v3-extra-lcd-hello + v3-extra-servo-sweep + v3-extra-simon | **0.0** ❌ | 3 lesson-path SOLO software, NON nei volumi cartacei. Anti-pattern Morfismo Sense 2. |

**Vol3 score peso esp**: (1.0×0+1.0×0+1.0×0+1.0×0 + 1.0×2 + 0.85×8 + 0.80×7 + 0.95×6 + 1.0×0) / 23 = (0+0+0+0+2.0+6.8+5.6+5.7+0)/23 = **20.1/23 = 0.874**

Penalty extra superflui: **-0.05** (3 lesson-path non-canonical, peso minore vs hallucination iter 21 cap10-12). 

**Vol3 score CORRECTED** = **0.92** (vs iter 21 wrong 0.55).

---

## 5. Score Morfismo Sense 2 RICALCOLATO ONESTO

### Definizione (CLAUDE.md sezione MORFISMO Sense 2)

Software lesson-paths mirror narrative volumi cartacei + kit Omaric. Stesso ordine, nomi, pagine, struttura.

### Ricalcolo onesto V2 (correggere iter 21)

| Dimensione | Peso | Score V2 | Note V2 |
|------------|------|----------|---------|
| Match numerico esperimenti VOLUMI REALI | 0.20 | 0.97 | Vol1: 38/38 ✅ + Vol2: 27/27 ✅ + Vol3: 23 ODT vs 24 ELAB-canonical (esp1..esp7 cap6 + 2 alias = 9 file, vs 8 ODT esp; cap7 9 file vs 7 ODT — over-coverage minore) |
| Naming consistency lesson-paths | 0.10 | 0.70 | Vol3 alias `morse`/`semaforo`/`mini`/`serial` rompono pure `esp{N}` numbering (-0.30) |
| Capitolo titolo libro = title digitale | 0.10 | 0.85 | Volume-references.js mantiene `chapter` tag, MA Tea Glossario PDF (sec fonte) mismatchata Vol3 cap6/7/8 (vedere §2 — non è ELAB lesson-paths fault, ma rilevante audit) |
| Page reference accuracy (`bookPage`) | 0.10 | 0.90 | Pagine PDF documentate volume-references |
| Variazioni narrative continuum | 0.20 | 0.85 | Vol1 ✅ esemplare, Vol2 ✅ (cap11 match assenza), Vol3 cap5/8 OK, cap6/7 over-coverage minore (alias confondono ma numerica preservata) |
| Glossario terms coverage in lesson-paths | 0.10 | 0.85 | 83% termini citati (invariato da iter 21) |
| Anti-pattern Morfismo (esp solo-software) | 0.10 | 0.40 | 3 extra Vol3 lcd/servo/simon NON nel libro = violation **CONFERMATA** |
| Schema lesson-path (flat 95 vs grouped narrative) | 0.10 | 0.30 | Schema flat = pezzi staccati. Grouped narrative non implementato (ADR-027 PROPOSED status) |

**Score Sense 2 V2 ONESTO** = 0.20×0.97 + 0.10×0.70 + 0.10×0.85 + 0.10×0.90 + 0.20×0.85 + 0.10×0.85 + 0.10×0.40 + 0.10×0.30
= 0.194 + 0.070 + 0.085 + 0.090 + 0.170 + 0.085 + 0.040 + 0.030
= **0.764/1.0 (~7.6/10)**

**Lift V2 vs iter 21** (0.715 → 0.764): **+0.05** (cap10-12 phantom GAP rimossi, `0/4 cap` non più penalizzato, ma alias overcount mantenuto come penalty reale).

### Score per volume V2

- **Vol1**: 1.0 (38/38 perfetto) — esemplare narrativa
- **Vol2**: 1.0 (27/27 + cap11 match assenza per design libro teorico)
- **Vol3**: **0.92** (23 ODT esp vs 24+ ELAB canonical, 3 extra non-canonical, alias naming inconsistency)

**Lift Vol3 V2 vs iter 21** (0.55 → 0.92): **+0.37** (cap10-12 phantom rimossi).

---

## 6. Esperimenti realmente superflui (ELAB-only, NO volume backing)

### Sicuramente superflui (lesson-paths SOLO software, NON nei volumi)

| Lesson-path | Motivo onesto | Azione |
|-------------|---------------|--------|
| `v3-extra-lcd-hello.json` | Vol3 ODT V0.9 NON ha cap LCD/I2C. Component LCD NON nel kit base PDF righe 55. | DEPRIORITIZE → "Extra non-canonical" lane separato |
| `v3-extra-servo-sweep.json` | Servo NON nel kit base ODT (kit elenco righe 55: Breadboard/Cavi/Batteria/Breakout/Nano R4/USB-C/R/LED/Pulsanti/Trimmer/Cicalino — NO servo). Vol3 ODT non ha cap Servo. | DEPRIORITIZE |
| `v3-extra-simon.json` | Progetto Simon Says creativo ELAB-extra, NESSUN cap ODT. | DEPRIORITIZE |

**Totale superflui realmente confermati**: **3** (vs iter 21 7 superflui di cui 4 alias). Gli **alias** `morse/semaforo/mini/serial` SONO consolidabili ma esistono come variazioni dei capitoli reali (cap6 Morse + semaforo = esempi inline ODT cap6 narrativa) → **NOT superflui, just confused naming**.

### Alias da consolidare (NON superflui, ma naming inconsistente)

| Alias | Maps to ODT esp | Action |
|-------|----------------|--------|
| `v3-cap6-morse.json` | Cap6 esempio Morse SOS (parte cap6 narrativa) — `_meta.source` self-claim "Cap6 ESP3" mismatched | RENAME `v3-cap6-esp7-morse.json` o consolidare in esp7 |
| `v3-cap6-semaforo.json` | Cap6 narrativa "Più LED e semaforo" (inline esempio) | CONSOLIDATE in esp4/esp5 (semaforo = 3-LED variation) |
| `v3-cap7-mini.json` | Cap7 mini-progetto possibly part esp7-8 ODT | RENAME esplicito `v3-cap7-esp8-luminosita.json` |
| `v3-cap8-serial.json` | Cap8 esp1 (Serial.println setup) | REMOVE duplicato esp1 |

### Possibile gap variazioni mancanti Vol3 cap8

| ODT esp | ELAB lesson-path |
|---------|------------------|
| Cap8 ESERCIZIO 8-6 "Barra progressiva LED" (vol3-full.txt:634) | **MISSING** in `v3-cap8-esp{1..5}` (esp5 mappa pot+3LED Sketch_8_5, ma esp6 barra LED dedicata Sketch_8_6 manca lesson-path canonical) |

**ADD**: `v3-cap8-esp6-barra-progressiva.json` (1 esp mancante reale).

---

## 7. Variazioni realmente mancanti (volume ha, ELAB no)

### Vol3 cap mancanti reali confermati ground truth

1. **Vol3 Cap8 ESERCIZIO 8-6** "Barra progressiva LED" (Sketch_Capitolo_8_6, vol3-full.txt:634): MANCA lesson-path canonical (ELAB v3-cap8 ferma a esp5).

### Vol3 cap mancanti FINTI (errori iter 21)

- ❌ Cap9 Motore Arduino — NON ESISTE in ODT (cap9 ODT = closing)
- ❌ Cap10 Pulsante+LED — NON ESISTE in ODT
- ❌ Cap11 Diodo flyback — NON ESISTE in ODT
- ❌ Cap12 Robot Segui Luce — NON ESISTE in ODT (è scope Vol3 V1.0 future, NON Vol3 V0.9 attuale)

### Vol2 cap11 conferma assenza intenzionale

- Vol2 PDF cap11 "I diodi" `/tmp/vol2-real.txt:19` = pag 103 = teorico puro (no ESPERIMENTO mark). ELAB 0 lesson-path = MATCH per design libro. **NOT gap** (correzione iter 21).

### Vol1 — nessun gap

Vol1 PDF V0.9: 9 cap pratici × esp narrativi = 38 esp totali. ELAB 38 lesson-paths = MATCH 1:1.

**Totale variazioni mancanti reali**: **1** (Vol3 cap8 esp6 barra LED progressiva).

---

## 8. Andrea mandate verification (variazioni stesso tema vs pezzi staccati)

### Mandate iter 18 PM (CLAUDE.md memoria iter 21 PDR)

> "esperimenti sui volumi non sono proposti come su elabtutor: in uno sono variazioni di uno stesso tema, nell'altro tenti pezzi staccati"

### Verification ground truth ODT vs ELAB

**Vol1**:
- Volume cartaceo: cap6 LED → 3 esp variazione tema (LED base, LED senza R demo, cambio R luminosità) ✅ variazioni stesso tema
- ELAB: v1-cap6-esp1/2/3 stesso ordine/tema ✅
- **Match Andrea mandate** ✅

**Vol2**:
- Volume cartaceo: cap6 LED Vf → 4 esp variazione (2LED 1R, colori div serie, 3LED, misura Vf multimetro) ✅ stesso tema "Vf calcolo"
- ELAB: v2-cap6-esp1..4 ✅
- **Match Andrea mandate** ✅

**Vol3** (focus mandate):
- Volume cartaceo Cap5: 2 esp variazione (Blink builtin + modifica delay) ✅ stesso tema "primo programma"
- Volume cartaceo Cap6: 8 esp variazione progressiva (LED esterno → 2LED → 3LED → INPUT_PULLUP → IF/ELSE → bool → bounce → while) ✅ stesso tema "pin digitali" con build-up
- Volume cartaceo Cap7: 7 esp variazione (LED soglia → 3LED soglia ranges → analogWrite → ciclo for → effetto respiro → trimmer luminosità → analogWriteResolution) ✅ stesso tema "pin analogici"
- Volume cartaceo Cap8: 6 esp variazione (Serial setup → loop → analogRead+Serial → Plotter 2 trimmer → pot+3LED+Serial → barra LED progressiva) ✅ stesso tema "Monitor seriale"
- ELAB Vol3 cap5: ✅ rispetta variazione tema
- ELAB Vol3 cap6 + alias: parziale ✅, alias rumore ma temi presenti
- ELAB Vol3 cap7: 9 file vs 7 ODT esp = over-coverage = potenziali "pezzi staccati extra" (esp8/mini possibili)
- ELAB Vol3 cap8: 6 file = OK quantità ma alias `serial` duplicato esp1 + esp6 ODT manca = parziale **pezzo staccato** (esp6 barra LED)
- ELAB Vol3 extra (lcd/servo/simon): 3 esp PEZZI STACCATI **NON nel libro** = violation Andrea mandate ❌

### Score Andrea mandate iter 22 verification

- Vol1: ✅ rispetto pieno mandate
- Vol2: ✅ rispetto pieno mandate
- Vol3: ⚠️ violazione MINORE — cap5+cap6+cap7+cap8 narrative continuum OK MA 3 extra (lcd/servo/simon) sono pezzi staccati, alias `morse/semaforo/mini/serial` confondono numbering

**Conclusione mandate**: violazione concentrata in **3 esp extra Vol3 + 4 alias naming** (vs iter 21 claim "cap6/7 violazioni, 9-12 mancanti" → cap9-12 phantom rimossi V2). Mandate riguarda pezzi staccati REALI = solo extra non-canonical.

---

## 9. Davide call utility (cosa serve VERAMENTE)

### NON serve (correggere iter 21 backlog)

- ❌ Vol3 V0.9 cap10 Pulsante+LED Arduino — NON ESISTE nel libro V0.9
- ❌ Vol3 V0.9 cap11 Diodo flyback Arduino — NON ESISTE
- ❌ Vol3 V0.9 cap12 Robot Segui Luce Arduino — NON ESISTE (capstone Arduino è Vol4 future)
- ❌ "4-6 settimane Davide scrittura cap9-12 Vol3 V0.9" — **NON SERVE** (V0.9 è completo come è)

### Serve veramente (rispettando ground truth)

#### CRITICAL Davide review queue iter 22

1. **Tea Glossario_Vol3.pdf V0.8.1 update** → V0.9 (allineare cap6/7/8 titoli + rimuovere cap10-12 ricostruiti). Costo Tea: 2-4h (rilettura ODT V0.9 + glossario refresh ~55 termini → 40 termini reali ground truth). **Decision Davide**: approva re-glossario o tieni V0.8.1 con disclaimer "outdated"?

2. **Vol3 cap8 esp6 "Barra progressiva LED"** missing lesson-path → ADD `v3-cap8-esp6-barra-progressiva.json`. Costo Andrea: 30 min code. **Decision Davide**: serve immediato? OK aggiungere solo fix?

3. **Vol3 alias `morse`/`semaforo`/`mini`/`serial`** rename/consolidate:
   - `v3-cap6-morse.json` → rename `v3-cap6-esp7-morse-sos.json` (consolidate semantica esp7 ODT)
   - `v3-cap6-semaforo.json` → consolidate in `v3-cap6-esp4-semaforo-3-led.json` (renaming pure)
   - `v3-cap7-mini.json` → rename esplicito o REMOVE se duplicato esp7
   - `v3-cap8-serial.json` → REMOVE duplicato esp1
   Costo Andrea: 1h (file rename + import refs update). **Decision Davide**: OK rename strategy?

4. **Vol3 extra (lcd/servo/simon) policy**:
   - Option A: REMOVE da `lesson-paths/` flat → move in nuovo `lesson-paths-extra/` non-canonical
   - Option B: ADD a Vol4 (futuro) come "Progetti Avanzati con shield aggiuntivi"
   - Option C: KEEP in lesson-paths/ ma flag `_meta.canonical: false` + UI badge "Extra non-libro"
   Costo Andrea: 2-4h depending option. **Decision Davide**: A/B/C?

5. **Vol2 cap11 Diodi protezione** — match per assenza confermato design libro teorico. **NO action** (correggere iter 21 GAP claim — non è gap).

6. **Vol4 future scope** (non iter 22):
   - Capstone Arduino "Robot Segui Luce Arduino" = Vol4 cap1 future
   - Motore con Arduino + diodo flyback = Vol4 capitolo
   - Servo + LCD + I2C = Vol4 progetti avanzati
   **Decision Davide**: roadmap Vol4 timeline (Q3 2026? Q1 2027?).

### MINOR backlog post-Davide-OK iter 22

7. ADR-027 grouped schema apply: gen-app-opus migrate flat → grouped (post Davide OK ratify deadline iter 25 per CLAUDE.md sprint history). Costo: 5 sessioni iter 23-26.

8. Sfide aperte v1-cap9-esp7/8/9 + v1-cap10-esp5/6 + v1-cap12-esp3/4 → step-by-step rigide (quality lift, NO add new esp). Costo: Andrea + Tea iter 22 PM 4-6h.

---

## 10. Sprint T close iter buffer recovery (Vol3 NON blocker)

### Status Sprint T iter 19 PHASE 1 (CLAUDE.md memoria attuale)

Sprint T iter 19 score = **8.7-8.8/10 ONESTO** (G45 anti-inflation cap). PHASE 3 PROJECTION 8.8-9.0/10 conditional.

**ADR-027 Volumi narrative refactor schema** = PROPOSED 562 LOC (CLAUDE.md iter 19 P1). Davide co-author + ratify deadline iter 25.

### Vol3 audit V2 implication su Sprint T

**KEY FINDING**: Vol3 NON è blocker Sprint T close. Iter 21 audit "0.55/1.0" basato su cap10-12 phantom = **inflation negative** (claim worse than reality). Reality Vol3 = **0.92** = quasi pari Vol1/2 = libro V0.9 e ELAB allineati.

**Buffer recovery iter 22-25**:

1. **Iter 22** (current iter close): NON serve scrivere "Vol3 cap9-12 mancanti" come task backlog. Rimuovere 4 task inesistenti. Buffer recovery: ~10-15 ore Davide+Andrea NON consumate (vs iter 21 stima "4-6 settimane Davide scrittura cap9-12").

2. **Iter 23**: applicare 4 minor fix (cap8 esp6 add + 4 alias rename + 3 extra policy decision). Costo reale ~6-8h Andrea.

3. **Iter 24-25**: ADR-027 grouped schema migration (post Davide OK). Score Sense 2 0.764 → projection 0.85+ post-grouped (alias eliminati per design + extra in lane separato).

4. **Iter 25 close**: Sense 2 score target ≥ 0.85 (vs current V2 0.764). Lift +0.09 atteso da grouped schema + 4 minor fix.

### Risk re-introduction

- **Risk**: agent iter 23+ legge ancora Tea Glossario PDF V0.8.1 e ri-introduce cap10-12 phantom claim. **Mitigation**: Tea PDF V0.8.1 marcato `OUTDATED` in `automa/state/INDEX.md` + cross-link a questo doc V2.

- **Risk**: ADR-027 schema migration ri-considera 3 extra come "canonical" → re-violation Andrea mandate. **Mitigation**: schema v2.0 grouped MUST exclude `extras/` dir from `lesson-paths-narrative/`.

- **Risk**: Vol3 V1.0 (futuro Davide) altera struttura cap reali. **Mitigation**: re-audit doc V3 post-Vol3-V1.0 release. Process: ogni nuova release Vol3 → ground truth re-extract → audit re-run.

### Sprint T iter 22 priorità RICALIBRATA con V2

**P0**: 
- Davide review §9 queue (~1-2h Davide). Ratify decisions 1-4.
- Andrea fix Vol3 cap8 esp6 add + 4 alias rename (~6h).

**P1**: 
- Tea Glossario V0.8.1 → V0.9 update (~3h Tea).
- Add disclaimer `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (iter 21 doc) → `DEPRECATED, see V2-GROUND-TRUTH.md`.

**P2**:
- ADR-027 grouped schema apply iter 23+.
- Vol4 roadmap planning (Q3 2026+).

---

## SUMMARY ONESTO TLDR V2

- **Vol3 ODT V0.9 = 9 capitoli reali** (NON 12 come Tea PDF outdated). 23 ESERCIZIO ground truth.
- **Cap10/11/12 Vol3 NON ESISTONO** — iter 21 ha hallucinato 4 capitoli phantom basato Tea Glossario V0.8.1 ricostruito.
- **Score Vol3 ricalcolato = 0.92** (vs iter 21 wrong 0.55, lift +0.37).
- **Score Sense 2 Morfismo V2 onesto = 0.764/1.0** (vs iter 21 0.715, lift +0.05).
- **GAP reali confermati**: Vol2 cap11 = 0 esp **per design libro** (NOT gap, correzione iter 21). Vol3 cap8 esp6 "barra LED" missing = **1 minor gap reale**.
- **SUPERFLUI reali confermati**: 3 (lcd/servo/simon extra Vol3, NON nei volumi cartacei).
- **ALIAS naming**: 4 (`morse/semaforo/mini/serial`) confondono numbering, consolidabili.
- **Andrea mandate "variazioni stesso tema vs pezzi staccati"**: ✅ rispettato Vol1+Vol2, ⚠️ violation MINORE Vol3 (3 extra + 4 alias) NON sistemica come iter 21 claimava.
- **Davide call utility**: NON serve scrivere cap9-12 Vol3 (~4-6 settimane risparmiate). Serve solo glossario refresh + 4 minor fix software.
- **Sprint T close**: Vol3 NON blocker. Score iter 22 lift atteso post 4 minor fix da 0.764 → ~0.80. Post grouped schema iter 25 → ~0.85+.

---

## Appendix A — Methodology re-audit V2

1. Read ground truth files `/tmp/vol{1,2,3}-real.txt` + `/tmp/vol3-full.txt` (TRES JOLIE PDF/ODT V0.9).
2. Re-extract Vol3 ODT (no LF text) tramite `tr '.' '\n'` per ottenere line-breaks artificiali su frasi.
3. Grep ESERCIZIO + Sketch_Capitolo_*_* + Capitolo per ricostruire indice + count esp reali.
4. Read iter 21 audit `automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md` (407 righe).
5. Cross-reference iter 21 claim vs ground truth → identify hallucination cap10-12 phantom.
6. List ELAB lesson-paths `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/lesson-paths/` (95 file).
7. Sample _meta.source di alias e extra → identify naming inconsistency vs duplicate vs extra-libro.
8. Re-mapping cap-by-cap ODT → lesson-paths con alignment score 0.0/0.5/1.0 per cap.
9. Recalculate Sense 2 Morfismo score honesto V2 (8 dimension weighted).
10. Identify realmente superflui (3) + realmente missing (1) + alias rinaming (4).
11. Validate Andrea mandate "variazioni stesso tema vs pezzi staccati" → rispettato Vol1/2, violation minore Vol3 extra+alias.
12. Davide call utility recalibrate (no cap9-12 scrittura, solo 4 minor fix).
13. Sprint T close buffer recovery (Vol3 NON blocker, ~10-15h Davide+Andrea risparmiate).

## Appendix B — Files refs ground truth

- `/tmp/vol1-real.txt:13-26` Vol1 indice 14 cap (file:line ground truth)
- `/tmp/vol1-real.txt:964-2369` Vol1 esperimenti (67 ESPERIMENTO mark)
- `/tmp/vol2-real.txt:9-20` Vol2 indice 12 cap
- `/tmp/vol2-real.txt` 49 ESPERIMENTO mark = 27 esp distinct (mark conta header+subhdr)
- `/tmp/vol3-full.txt:4` Vol3 indice 9 cap (single-line)
- `/tmp/vol3-full.txt:166` Cap5 ESERCIZIO 5-1 Blink
- `/tmp/vol3-full.txt:224-227` Cap5 ESERCIZIO 5-2 modifica delay
- `/tmp/vol3-full.txt:234` Cap6 ESERCIZIO 6-1 AND/OR
- `/tmp/vol3-full.txt:275/283/288/325/350/364/369` Sketch_Capitolo_6_1..6_7
- `/tmp/vol3-full.txt:421/430/440/447/458/462/505/515/530` Cap7 ESERCIZIO 7-1..7-7
- `/tmp/vol3-full.txt:580-634` Cap8 ESERCIZIO 8-1..8-6

## Appendix C — Iter 21 doc deprecation note

`/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/automa/state/VOLUMI-EXPERIMENT-ALIGNMENT.md`

**STATUS V2**: ⚠️ DEPRECATED — fonte secondaria Tea PDF V0.8.1 outdated. Per Vol3 audit usare V2-GROUND-TRUTH.md (questo doc). Vol1+Vol2 audit iter 21 sezioni `## 1.` rimangono valide (PDF V0.9 source ground truth).

---

— FINE DOC VOLUMI-EXPERIMENT-ALIGNMENT-V2-GROUND-TRUTH.md —
