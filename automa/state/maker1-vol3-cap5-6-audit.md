# Maker-1 Vol3 Audit cap5-6 (PDF v0.13)
- Date: 2026-05-07
- Esperimenti audited: 11/11
- PDF source: /tmp/vol3-v013.txt (v0.13 NEWER, 10 capitoli)
- Code source: src/data/experiments-vol3.js
- Spiattellato target cap6: 9 esp (7 + morse + semaforo)

---

## 0. Sources e numerazione ground truth

### PDF v0.13 indice (`/tmp/vol3-v013.txt:11-33`)
```
Cap 1  - Un viaggio nella storia della programmazione (pag 5)
Cap 2  - Cos'è la programmazione? (pag 11)
Cap 3  - Hardware e Software (pag 17)
Cap 4  - Introduciamo Arduino (pag 21)
Cap 5  - Il nostro primo programma (Blink) (pag 29)
Cap 6  - Il mondo discreto: i pin digitali (pag 43)
Cap 7  - Il mondo continuo: i pin analogici (pag 79)
Cap 8  - Visualizzare i dati: Il monitor seriale (pag 113)
Cap 9  - Il piezo: facciamo musica! (pag 133)
Cap 10 - Il progetto finale: il gioco Simon (pag 141)
```

**TOTALE 10 capitoli** in v0.13. Conferma differenza vs vecchio V0.8.1 deprecated (12 cap fittizi) e vs ODT V0.9 (9 cap reali). v0.13 aggiunge **Cap 9 Piezo** + **Cap 10 Simon** (vs ODT che aveva solo cap teasing "Non è finita qui!").

### ESERCIZIO marker count cap5+cap6 (PDF v0.13)
- Cap 5: **2 ESERCIZIO** (5.1 line 955, 5.2 line 1415)
- Cap 6: **8 ESERCIZIO** (6.1 line 1516, 6.2 line 1720, 6.3 line 1784, 6.4 line 1816, 6.5 line 1891, 6.6 line 2128, 6.7 line 2310, 6.8 line 2486)

**TOTALE PDF cap5+cap6 = 10 ESERCIZIO narrativi**.

### Code count cap5+cap6 (`src/data/experiments-vol3.js`)
- v3-cap5-esp1 (line 975), v3-cap5-esp2 (line 1043) = **2 esp**
- v3-cap6-esp1 (line 1120), esp2 (1242), morse (1374), esp3 (1529), esp4 (1662), semaforo (1832), esp5 (2127), esp6 (2292), esp7 (2558) = **9 esp**

**TOTALE code cap5+cap6 = 11 esp**. **+1 vs PDF ground truth**.

### Comment dichiara "7 esperimenti" cap6 (line 1111)
```js
// CAPITOLO 6 — I pin digitali (7 esperimenti)
```
Counter inflato +2 (esp7 + morse + semaforo aggiuntivi numerati).

---

## 1. Audit per esperimento

### v3-cap5-esp1 — Blink con LED_BUILTIN

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 5 Esp. 1 - Blink con LED_BUILTIN" | ESERCIZIO 5.1 "ADESSO TOCCA A TE!" | OK semantica (PDF non titola, dà sketch) |
| Code | pinMode(13, OUTPUT) + delay(1000) | LED_BUILTIN + delay(1000) verbatim line 957-967 | **MINOR** code 13 vs PDF LED_BUILTIN (semanticamente equivalente, sketch_5_1 ELAB site). |
| Components | breadboard + nano | "Apri Arduino IDE…" no breadboard | OK — code mostra schema corretto, esp è solo software (LED integrato). |
| Concept | "pinMode, digitalWrite, delay, LED_BUILTIN" | setup/loop spiegati line 1043-1108 | OK |
| bookRef | (assente) | Vol3 cap5 pag 30 | **MINOR** — bookRef field missing (Vol1 pattern omette bookRef per cap5 esp). |
| Severity | **minor** | | LED_BUILTIN vs 13 deviazione minore. |

### v3-cap5-esp2 — Modifica tempi del Blink

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 5 Esp. 2 - Modifica tempi del Blink" | ESERCIZIO 5.2 "Prova a cambiare il numero dentro le parentesi" | OK |
| Code | delay(200) (esempio) | "500 più veloce, 2000 più lento" line 1419-1420 | OK semantica (esempio diverso valore stesso concept) |
| Concept | "Parametri delay, sperimentazione" | Esercizio sperimentale tempi | OK |
| Severity | **OK** | | Aderenza PDF v0.13 alta. |

### v3-cap6-esp1 — Colleghiamo la resistenza (LED esterno + 470Ω + D13)

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 1 - Colleghiamo la resistenza" | ESERCIZIO 6.1 "PROVIAMO IL CIRCUITO AND E OR" line 1516-1518 | **HIGH MISMATCH** |
| Content | LED esterno + 470Ω + D13, sketch Blink modificato | 2 pulsanti AND/OR su breadboard, NO sketch (esercizio circuito puro) line 1518-1670 | **HIGH** narrative mismatch |
| bookRef | "Vol3 p.56 - ESPERIMENTO 1" | PDF v0.13 ESERCIZIO 6.1 = AND/OR con 2 pulsanti pag 44-46 | **HIGH** wrong reference |
| Comment in code | "ALLINEATO al libro p.56" "Il precedente AND/OR rimosso" | PDF v0.13 6.1 = AND/OR | **HIGH** — code AUTO-DICHIARA di aver rimosso AND/OR, ma PDF v0.13 conferma 6.1 È AND/OR. Refactor sbagliato. |
| Severity | **HIGH** | | Esercizio code è semanticamente PDF 6.2 "ACCENDIAMO UN LED ESTERNO" line 1720-1779, NON 6.1. |

### v3-cap6-esp2 — Cambia il numero di pin (D13 → D8)

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 2 - Cambia il numero di pin" | ESERCIZIO 6.2 "ACCENDIAMO UN LED ESTERNO" line 1720-1779 | **HIGH MISMATCH** |
| Content | LED esterno + D8 al posto di D13 | LED esterno + D13 + Blink ("useremo lo stesso codice del Blink, ma con una piccola modifica") | **HIGH** narrative — il "cambia pin" è ESERCIZIO 6.3 line 1784-1812, non 6.2 |
| bookRef | "Vol3 p.57 - ESPERIMENTO 2" | PDF v0.13 6.2 = LED esterno con D13 (introduzione LED esterno) | **HIGH** wrong reference |
| Code | pinMode(8, OUTPUT) | PDF 6.2 usa "13" verbatim line 1772 | **HIGH** code deviation |
| Severity | **HIGH** | | Numerazione disallineata: code esp2 = PDF esp3. |

### v3-cap6-morse — SOS in codice Morse

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 3 - SOS in codice Morse" | nessun match nel PDF v0.13 | **CRITICAL INVENTED** |
| bookRef | "Vol3 Cap6 ESPERIMENTO 3" | PDF v0.13 ESERCIZIO 6.3 = "cambia il pin" + tabella pin digitali/analogici breakout line 1784-1812. NESSUN SOS Morse nel libro. | **CRITICAL** ESPERIMENTO 3 non è Morse. |
| Concept | Morse code, funzioni `punto()`, `linea()` | NON nel PDF v0.13 cap6 | **CRITICAL** — esperimento spiattellato/inventato. |
| ANDREA mandate | NO synthesis se PDF unreadable | Morse leggibile? **NO** - assente | **CRITICAL** — invenzione narrativa. |
| Severity | **CRITICAL** | | Esperimento NON esiste in PDF v0.13. Andrea iter 21 mandate "no spiattellato" violato. |

### v3-cap6-esp3 — Cambia il numero di pin (D5)

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 3 - Cambia il numero di pin" | ESERCIZIO 6.3 line 1784: "abbiamo utilizzato il pin 13… avremmo potuto utilizzare qualunque altro pin" | OK semantica match |
| bookRef | "Vol3 Cap6 ESPERIMENTO 2" | PDF 6.3 = cambio pin (questo è 6.3, NON 6.2 come dichiarato) | **HIGH** bookRef wrong number |
| Content | pin D5 + LED verde | PDF: "scegli un altro pin… modifica il programma" line 1806-1812. Pin specifico non vincolato. | OK |
| Code | pinMode(5, OUTPUT) | PDF non vincola (esempio). | OK |
| Duplicate concept | esp2 (D13→D8) + esp3 (D5) entrambi "cambia pin" | PDF 6.2 = LED esterno D13 ; PDF 6.3 = "cambia pin" generico | **HIGH** duplicato (code esp2+esp3 = stesso concetto PDF 6.3, dimezzato in 2 entry, ANDREA "spiattellato" pattern). |
| Severity | **HIGH** | | numerazione bookRef sbagliata + duplicato concettuale con esp2. |

### v3-cap6-esp4 — Due LED: effetto polizia

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 4 - Due LED: effetto polizia" | ESERCIZIO 6.4 "DUE LED CHE SI ALTERNANO" line 1816-1880 | OK semantica |
| bookRef | "Vol3 Cap6 ESPERIMENTO 4" | match line 1816 | OK |
| Content | LED rosso + blu, D5/D6, alternanza 200ms | PDF: LED blu + LED rosso, pin 6+9, 200ms | **MEDIUM** colore + pin specifici differiscono ("rosso/blu" code vs "blu/rosso" PDF, "D5/D6" code vs "pin 6/pin 9" PDF line 1845). Concept identical. |
| Naming | "effetto polizia" | PDF: "effetto alternato" line 1879-1880 | **MINOR** code aggiunge metafora "polizia" non in PDF. |
| Severity | **MEDIUM** | | pin code 5+6 vs PDF 6+9 — controllo simulator/kit. |

### v3-cap6-semaforo — Il semaforo

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 5 - Il semaforo" | ESERCIZIO 6.5 "COSTRUIAMO UN SEMAFORO" line 1891-1955 | OK PDF allineato |
| bookRef | "Vol3 Cap6 ESPERIMENTO 5" | match | OK |
| Content | 3 LED + D5/D6/D3 + Verde 3s/Giallo 1s/Rosso 3s | PDF: "tre pin diversi, ad esempio 5, 6 e 9" line 1909, "modifica i tempi del delay" line 1948 | **MEDIUM** code D3 vs PDF "9" (deviazione pin); timing 3s/1s/3s code vs PDF "lascia libero al docente" |
| Lesson group | esp5 viene da `v3-cap6-semaforo` ID | PDF 6.5 è semaforo | OK semantica |
| Severity | **MEDIUM** | | pin D3 deviation vs PDF "pin 9". |

### v3-cap6-esp5 — Pulsante con INPUT_PULLUP

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 5 - Pulsante con INPUT_PULLUP" | ESERCIZIO 6.6 "LEGGERE UN PULSANTE E CONTROLLARE UN LED" line 2128-2306 | OK semantica |
| bookRef | "Vol3 Cap7 ESERCIZIO 7.3" | PDF 6.6 (NON cap7!). PDF v0.13 cap7 ESERCIZIO 7.3 = analogico/PWM line 2939+. | **CRITICAL** bookRef wrong volume reference (sbagliato cap7) |
| Content | INPUT_PULLUP + toggle (statoLED bool) + delay(300) | PDF: digitalRead + INPUT_PULLUP + IF + bool + delay debounce — line 2126-2304 esattamente. | **OK** content |
| Code: usa toggle | `if(statoLED == false) { statoLED = true; } else { statoLED = false; }` | PDF: identico pattern flowchart line 2364-2384 | OK |
| Numbering | code numera "esp5" | PDF è ESERCIZIO 6.6 | **HIGH** numerazione disallineata (esp5 code = PDF 6.6) |
| Severity | **HIGH** | | bookRef errato (cap7 invece cap6). |

### v3-cap6-esp6 — Due LED, un pulsante

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 6 - Due LED, un pulsante" | nessun ESERCIZIO con questo schema in PDF v0.13 cap6 | **CRITICAL INVENTED** |
| bookRef | "Vol3 Cap7 Mini-progetto" | PDF v0.13 cap7 NON ha mini-progetto schema "due LED un pulsante" (cap7 = analogici/PWM/trimmer). NON nel PDF cap6 nemmeno. | **CRITICAL** invented experiment |
| Content | premuto = verde / non premuto = rosso | NON corrisponde a esercizio PDF v0.13 | **CRITICAL** synthesized esperimento |
| Severity | **CRITICAL** | | NO matching ESERCIZIO in PDF cap5+cap6+cap7 v0.13. Spiattellato pattern violato. |

### v3-cap6-esp7 — Debounce del pulsante

| Campo | Code | PDF v0.13 | Verdict |
|-------|------|-----------|---------|
| Title | "Cap. 6 Esp. 7 - Debounce del pulsante" | ESERCIZIO 6.7 line 2310-2398 (toggle) + ESERCIZIO 6.8 "EVITARE IL LAMPEGGIO" line 2486-2562 (debounce while) | OK match parziale |
| Content | toggle + while(digitalRead==LOW){} + delay(300) | PDF v0.13 6.8 = while debounce esattamente line 2522-2562 | OK |
| bookRef | (assente) | PDF v0.13 ESERCIZIO 6.8 | **MINOR** missing bookRef |
| Concept | "Debounce con while, rimbalzo meccanico" | PDF: "while finché il pulsante è premuto" line 2542-2562 | OK |
| Severity | **MEDIUM** | | code esp7 conflate ESERCIZIO 6.7 + 6.8 PDF; bookRef missing. |

---

## 2. Mapping disallineamento numerazione

| Code ID | Code title | PDF v0.13 ESERCIZIO match | Severity |
|---------|-----------|---------------------------|----------|
| v3-cap5-esp1 | Blink LED_BUILTIN | 5.1 (line 955) | minor (LED_BUILTIN vs 13) |
| v3-cap5-esp2 | Modifica tempi | 5.2 (line 1415) | OK |
| v3-cap6-esp1 | Colleghiamo resistenza (LED+470+D13) | **6.2** (line 1720) NON 6.1 | high |
| v3-cap6-esp2 | Cambia pin (D8) | **6.3** (line 1784) NON 6.2 | high |
| v3-cap6-morse | SOS Morse | **NO MATCH** PDF v0.13 cap6 | **CRITICAL** invented |
| v3-cap6-esp3 | Cambia pin (D5) | duplicato esp2 vs **6.3** | high (duplicato) |
| v3-cap6-esp4 | Effetto polizia | **6.4** (line 1816) | medium (pin diff) |
| v3-cap6-semaforo | Semaforo 3 LED | **6.5** (line 1891) | medium (pin diff) |
| v3-cap6-esp5 | INPUT_PULLUP toggle | **6.6+6.7** conflated (line 2128+2310) | high (bookRef cap7 sbagliato) |
| v3-cap6-esp6 | 2 LED 1 pulsante | **NO MATCH** PDF v0.13 | **CRITICAL** invented |
| v3-cap6-esp7 | Debounce while | **6.8** (line 2486) | medium (bookRef missing) |

---

## 3. PDF v0.13 ground truth NON mappato in code (gap analysis)

| ESERCIZIO PDF v0.13 | Tema | In code? | Note |
|---------------------|------|----------|------|
| 6.1 (line 1516) | Circuito AND/OR con 2 pulsanti | **NO** — code v3-cap6-esp1 commento dichiara "AND/OR rimosso" | **CRITICAL GAP** Andrea iter 21 mandate "no rimuovere narrativa libro" violato. |

ALL altri 9 ESERCIZIO PDF v0.13 cap5+cap6 (5.1, 5.2, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8) hanno almeno un esperimento code corrispondente (con disallineamenti numerazione/bookRef sopra). PDF 6.1 (AND/OR) è l'UNICO TOTAL GAP.

---

## 4. Verdict spiattellato cap6 (Andrea iter 21 mandate)

**Target Andrea**: cap6 9 esp = 7+morse+semaforo. Verifica narrative reale:

- PDF v0.13 cap6 = **8 ESERCIZIO narrativi distinct** (6.1-6.8)
- Code = **9 entry** (esp1-7 + morse + semaforo)

**Spiattellato verdict per esperimento**:
- v3-cap6-esp1 (LED+470+D13) = PDF 6.2 (mappato)
- v3-cap6-esp2 (cambia pin D8) = duplicato esp3 PDF 6.3 (1 PDF esp → 2 code esp = **spiattellato +1**)
- **v3-cap6-morse (SOS)** = **INVENTATO** (PDF 0 ESERCIZIO Morse) **+1 spiattellato**
- v3-cap6-esp3 (cambia pin D5) = PDF 6.3 (duplicato esp2)
- v3-cap6-esp4 (polizia) = PDF 6.4 (ok)
- v3-cap6-semaforo = PDF 6.5 (ok)
- v3-cap6-esp5 (INPUT_PULLUP) = PDF 6.6+6.7 conflated (1 code = 2 PDF, **opposite spiattellato compression**)
- **v3-cap6-esp6 (2 LED 1 pulsante)** = **INVENTATO** **+1 spiattellato**
- v3-cap6-esp7 (debounce while) = PDF 6.8 (ok)

**Spiattellato real count cap6**: 9 code vs 8 PDF distinct = **+1 NET**, MA con **2 ESERCIZIO PDF GAP NON COVERED** (6.1 AND/OR rimosso narrativamente, esp5 conflate 6.6+6.7).

**Veredetto onesto**: Spiattellato cap6 NON è solo "+2 narrative explosion" come sospettato. È DISALLINEAMENTO STRUTTURALE multi-direzione:
- 2 esperimenti **inventati senza base PDF** (morse + 2-LED-1-pulsante)
- 1 esperimento **PDF rimosso** (6.1 AND/OR — code commenti dichiarano "rimosso intenzionalmente")
- 1 **duplicato concettuale** (esp2 + esp3 stessa narrativa "cambia pin")
- 1 **conflate 2 PDF in 1 code** (esp5 = 6.6+6.7 fusi)
- Numerazione disallineata su 7/9 esperimenti

---

## 5. v0.13 vs old V0.8.1 differences (claim originali iter 21 deprecated)

PDF v0.13 conferma:
- **10 capitoli reali** (vs V0.8.1 12 cap fittizi cap10-12, vs ODT V0.9 9 cap)
- Cap 9 NUOVO **"Il piezo: facciamo musica!"** (pag 133, ESERCIZIO 9.1+9.2 line 4189+4276) — assente sia V0.8.1 che ODT
- Cap 10 NUOVO **"Il progetto finale: il gioco Simon"** (pag 141) — capstone Arduino reale
- Cap 5 piattezza confermata (2 esercizi)
- Cap 6 piattezza 8 esercizi reali (vs claim iter 21 "8 ESERCIZIO" ✓ confermato per cap6)

---

## 6. Top issues prioritizzati

1. **CRITICAL**: v3-cap6-morse + v3-cap6-esp6 sono **esperimenti inventati** non presenti in PDF v0.13 cap5-7. Andrea iter 21 mandate "Vol3 narrative refactor con Davide co-author" violato. Fix: eliminare entrambi OR riposizionare in lesson-paths "Estensioni Andrea custom" out of cap6.
2. **CRITICAL GAP**: PDF v0.13 ESERCIZIO 6.1 (AND/OR 2 pulsanti) **completamente assente** in code. Code commento dichiara "rimosso intenzionalmente" — viola Morfismo Sense 2 triplet coerenza.
3. **HIGH**: numerazione disallineata 7/9 esperimenti cap6 (esp1=PDF 6.2, esp2=PDF 6.3, esp3 duplicato esp2, esp5=PDF 6.6+6.7 conflate). bookRef errati (esp5 dice "cap7" invece "cap6"). Fix: rinumerare + risistemare bookRef.
4. **MEDIUM**: deviazioni pin (esp4 PDF "6+9" vs code "5+6"; semaforo PDF "5,6,9" vs code "5,6,3"). Validare con kit Omaric fisico.
5. **MINOR**: bookRef field missing su v3-cap5-esp1, esp2, v3-cap6-esp7. Aggiungere.

---

## 7. Anti-inventions mandate compliance

ANDREA mandate "NO synthesis if PDF unreadable for an esperimento":
- ✅ PDF v0.13 readable per tutti 8 ESERCIZIO cap6 + 2 cap5 (verbatim citations sopra)
- ❌ Code introduce 2 esperimenti senza riferimento PDF (morse + 2-LED-1-pulsante)
- ✅ Sketch C++ inline code esistono. Per cap5 esp1+esp2: PDF v0.13 mostra sketch verbatim line 957-967 (esp1 con LED_BUILTIN), e variante delay tempi (esp2). Code esp1 usa "13" invece "LED_BUILTIN" — minor deviation. Code esp2 usa delay(200) — esempio coerente con PDF.
- ✅ Per cap6 esp1+esp2+esp3: PDF v0.13 NON mostra sketch separato per "cambia pin" (rinvia all'esempio pinMode). Code C++ scritto da Andrea — questo è ACCETTABILE perché PDF dice "modifica il programma inserendo il numero del nuovo pin" line 1809.

Compliance: **PARTIAL** — 2 esperimenti violano (morse, 2-LED-1-pulsante).

---

## 8. Status finale

- **Esperimenti audited**: 11/11 (2 cap5 + 9 cap6 code)
- **PDF v0.13 ESERCIZIO mappati**: 8/10 cap5+cap6 (5.1, 5.2, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8); 6.1 AND/OR **gap totale**
- **Code esp inventati**: 2 (v3-cap6-morse + v3-cap6-esp6)
- **Severity counters**: 2 critical, 5 high, 3 medium, 3 minor
- **Spiattellato cap6 real**: NET +1 esp ma con disallineamento strutturale (vedi §4)
- **v0.13 vs old**: PDF v0.13 conferma 10 cap (cap9-piezo, cap10-Simon NUOVI vs ODT)

**Status COMPLETED**.
