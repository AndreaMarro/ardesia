# Sprint U Cycle 1 Iter 1 — Audit Vol3 (29 esperimenti)

**Data**: 2026-05-01  
**Agente**: Audit-2 (vol3)  
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815  
**Fonti verificate**: `src/data/experiments-vol3.js`, `src/data/volume-references.js`, `src/data/lesson-paths/v3-*.json`

---

## Summary

| Metrica | Valore |
|---------|--------|
| Totale esperimenti | 29 |
| Problemi circuito (comps=0 o conns=0 con >2 comps) | 1 |
| Linguaggio unlimPrompt violations (score<6) | 0 |
| Linguaggio unlimPrompt score=6 (no "Ragazzi,") | 26 |
| Linguaggio unlimPrompt score≥8 (OK) | 3 |
| Missing bookText | 0 |
| Missing lesson-path | 0 |
| Lesson-path con singolare violations | 21 |
| Lesson-path senza "Ragazzi" in teacher_msg | 28 |
| Arduino con codice C++ | 29 |
| Scratch con scratchXml | 26 |
| Esperimenti senza scratchXml | 3 |
| Titolo/ID mismatch critici | 4 |
| UnlimPrompt content mismatch (descrive exp diverso) | 1 |

---

## Audit Matrix

| ID | Cap | Title | Comps | Conns | Has_Layout | Mode | UnlimPrompt_Words | Linguaggio_Score | Singolare_Viol | Plurale_Count | Has_BookText | LP_Exists | LP_Phases | LP_ActionTags | Has_Code | Has_ScratchXml | Special_Check | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| v3-cap5-esp1 | Cap5 | Blink con LED_BUILTIN | 2 | 0 | YES | avr | 66 | 6 | 0 | 0 | YES(29w,4i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; 0 conns OK (solo nano+bb, nessun componente esterno) |
| v3-cap5-esp2 | Cap5 | Modifica tempi del Blink | 2 | 0 | YES | avr | 41 | 6 | 0 | 0 | YES(20w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP Ragazzi=0; 0 conns OK (solo nano) |
| v3-cap6-esp1 | Cap6 | Colleghiamo la resistenza | 4 | 5 | YES | avr | 105 | 10 | 0 | 1 | YES(26w,6i) | YES | 5/5 | YES | YES | NO | — | OK | bookRef: Vol3 p.56; unlimPrompt OK plurale; no scratchXml (ma ha code C++) |
| v3-cap6-esp2 | Cap6 | Cambia il numero di pin | 4 | 5 | YES | avr | 84 | 10 | 0 | 1 | YES(24w,4i) | YES | 5/5 | YES | YES | YES | — | OK | bookRef: Vol3 p.57; unlimPrompt con "Ragazzi,"; LP no Ragazzi |
| v3-cap6-morse | Cap6 | SOS in codice Morse | 4 | 5 | YES | avr | 43 | 6 | 0 | 0 | YES(19w,3i) | YES | 5/5 | YES | YES | YES | SPECIAL | WARN | id=v3-cap6-morse; No "Ragazzi," in unlimPrompt; LP Ragazzi=0; unlimPrompt non inizia con "Sei UNLIM"; unlimPrompt 43w borderline |
| v3-cap6-esp3 | Cap6 | (Cambia il numero di pin) | 4 | 5 | YES | avr | 47 | 6 | 0 | 0 | YES(10w,2i) | YES | 5/5 | YES | YES | YES | — | WARN | TITLE_MISMATCH: title="Cap. 6 Esp. 2 - Cambia il numero di pin" duplica v3-cap6-esp2; id usa esp3 ma numerazione esposta è esp2; bookText solo 10w (scarso) |
| v3-cap6-esp4 | Cap6 | Due LED: effetto polizia | 8 | 10 | YES | avr | 44 | 6 | 0 | 0 | YES(26w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | CONTENT_MISMATCH: title="Due LED effetto polizia" ma unlimPrompt descrive "semaforo con 3 LED" (non coerente); No "Ragazzi,"; bookText 26w OK |
| v3-cap6-semaforo | Cap6 | Il semaforo | 8 | 10 | YES | avr | 111 | 6 | 0 | 0 | YES(26w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha singolare violation (premi) in teacher_msg |
| v3-cap6-esp5 | Cap6 | Pulsante con INPUT_PULLUP | 5 | 7 | YES | avr | 59 | 6 | 1 | 0 | YES(20w,2i) | YES | 5/5 | YES | YES | YES | — | WARN | TITLE_MISMATCH: id=v3-cap6-esp5 (cap6) ma title="Cap. 7 Ese. 7.3" (cap7); chapter field=Cap6 (corretto); unlimPrompt ha singolare "premi" (1 viol); No "Ragazzi," |
| v3-cap6-esp6 | Cap6 | Due LED, un pulsante | 7 | 10 | YES | avr | 109 | 6 | 1 | 0 | YES(30w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | TITLE_MISMATCH: id=v3-cap6-esp6 (cap6) ma title="Cap. 7 Mini-progetto"; chapter=Cap6 (corretto); unlimPrompt ha "premi" singolare (1 viol); LP ha 3 singolari violations |
| v3-cap6-esp7 | Cap6 | Debounce del pulsante | 5 | 7 | YES | avr | 53 | 6 | 0 | 0 | YES(15w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP Ragazzi=0 |
| v3-cap7-esp1 | Cap7 | analogRead base | 5 | 8 | YES | avr | 57 | 6 | 0 | 0 | YES(25w,4i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP Ragazzi=0 |
| v3-cap7-esp2 | Cap7 | analogRead con tensione | 5 | 8 | YES | avr | 47 | 6 | 0 | 0 | YES(18w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; unlimPrompt 47w borderline |
| v3-cap7-esp3 | Cap7 | Trimmer controlla 3 LED | 9 | 13 | YES | avr | 42 | 6 | 0 | 0 | YES(33w,2i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; unlimPrompt 42w borderline |
| v3-cap7-esp4 | Cap7 | analogWrite (PWM fade) | 4 | 5 | YES | avr | 50 | 6 | 0 | 0 | YES(25w,4i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation |
| v3-cap7-esp5 | Cap7 | PWM con valori manuali | 4 | 5 | YES | avr | 43 | 6 | 0 | 0 | YES(27w,5i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; unlimPrompt 43w borderline |
| v3-cap7-esp6 | Cap7 | Fade up/down con for | 4 | 5 | YES | avr | 57 | 6 | 0 | 0 | YES(26w,2i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 2 singolari violations |
| v3-cap7-esp7 | Cap7 | Trimmer controlla luminosita | 5 | 8 | YES | avr | 46 | 6 | 0 | 0 | YES(25w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; unlimPrompt 46w borderline |
| v3-cap7-esp8 | Cap7 | DAC reale (10 bit) | 3 | 5 | YES | avr | 50 | 6 | 0 | 0 | YES(24w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation |
| v3-cap8-esp1 | Cap8 | Serial.println in setup | 2 | 0 | YES | avr | 49 | 6 | 0 | 0 | YES(28w,4i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; 0 conns OK (solo nano, sketch USB) |
| v3-cap8-esp2 | Cap8 | Serial.println in loop | 2 | 0 | YES | avr | 44 | 6 | 0 | 0 | YES(22w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation |
| v3-cap8-esp3 | Cap8 | analogRead + Serial Monitor | 3 | 5 | YES | avr | 112 | 6 | 0 | 0 | YES(17w,2i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; bookText 17w scarso |
| v3-cap8-esp4 | Cap8 | Serial Plotter con 2 pot | 4 | 8 | YES | avr | 47 | 6 | 0 | 0 | YES(17w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; bookText 17w scarso |
| v3-cap8-esp5 | Cap8 | Pot + 3 LED + Serial | 9 | 13 | YES | avr | 55 | 6 | 0 | 0 | YES(17w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; bookText 17w scarso |
| v3-extra-lcd-hello | Extra | LCD Hello World | 3 | 8 | YES | avr | 64 | 6 | 0 | 0 | YES(27w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; Extra (non nel libro standard) |
| v3-extra-servo-sweep | Extra | Servo Sweep | 3 | 3 | YES | avr | 80 | 6 | 0 | 0 | YES(26w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 1 singolare violation; Extra (non nel libro standard) |
| v3-extra-simon | Extra | Simon Says — Gioco di Memoria | 15 | 20 | YES | avr | 127 | 6 | 0 | 0 | YES(26w,3i) | YES | 5/5 | YES | YES | YES | — | WARN | No "Ragazzi," in unlimPrompt; LP ha 2 singolari violations; Extra (non nel libro standard) |
| v3-cap7-mini | Cap7 | Potenziometro ADC + LED PWM | 5 | 7 | YES | avr | 67 | 10 | 0 | 1 | YES(134w,5i) | YES | 5/5 | YES | YES | NO | SPECIAL | OK | bookRef: Vol3 p.75; unlimPrompt con "Ragazzi,"; bookText 134w OTTIMO; no scratchXml (OK per mini-progetto) |
| v3-cap8-serial | Cap8 | Comunicazione seriale: primo messaggio | 1 | 0 | YES | avr | 69 | 10 | 0 | 1 | YES(107w,5i) | YES | 5/5 | YES | YES | NO | SPECIAL | WARN | CIRCUIT_GAP: solo 1 componente (nano1), mancante breadboard; TITLE_MISMATCH: title="Cap. 8 Esp. 1" duplica v3-cap8-esp1; bookText 107w OTTIMO; no scratchXml |

---

## Analisi Dettagliata dei Problemi

### Priorità 1 — CIRCUIT_GAP critici

**v3-cap8-serial** — 1 solo componente (nano1), nessuna breadboard. Tutti gli altri esperimenti seriali (v3-cap8-esp1/2/3/4/5) includono almeno `bb1`. Questo esperimento non può essere montato sul simulatore in modo corretto senza breadboard. L'esperimento v3-cap8-serial è un esperimento "intro seriale" con solo il Nano collegato via USB — circuito tecnicamente corretto (non richiede breadboard) MA il pattern diverge dagli altri. **Fix consigliato**: aggiungere `bb1` come componente passivo per coerenza visiva col simulatore.

**v3-cap5-esp1, v3-cap5-esp2, v3-cap8-esp1, v3-cap8-esp2** — 0 connessioni, solo 2 componenti. Questo è CORRETTO pedagogicamente (esp Cap5 usano solo LED_BUILTIN, esp Cap8 seriale non richiede wires esterni). Non è un bug ma va notato.

### Priorità 2 — Linguaggio "Ragazzi," mancante in unlimPrompt (26/29)

**Impatto**: L'unlimPrompt è il contesto passato a UNLIM per rispondere ai docenti. Senza "Ragazzi," nel prompt, UNLIM non viene rafforzato nel pattern linguistico plurale. Il sistema-prompt BASE_PROMPT v3.1 include già la regola, ma il reinforcement nel contesto specifico manca.

**Esperimenti con unlimPrompt score=10 (PASS)**: v3-cap6-esp1, v3-cap6-esp2, v3-cap7-mini, v3-cap8-serial (3/29 con "Ragazzi,", 1 OK ma con circuit gap)

**Esperimenti con score=6 (senza "Ragazzi,")**: tutti gli altri 26.

**Nota**: `v3-cap6-morse` è l'unico esperimento il cui unlimPrompt NON inizia con "Sei UNLIM, il tutor AI di ELAB." — inizia direttamente con "Lo studente sta..." (manca il prefisso standard di identità UNLIM).

### Priorità 3 — Lesson-Path teacher_message senza "Ragazzi" (28/29)

L'unico LP con "Ragazzi" in teacher_message è v3-cap5-esp1 (1 occorrenza). Tutti gli altri 28 lesson-paths hanno teacher_message senza il termine "Ragazzi", il che viola il Principio Zero linguistico.

**Lesson-paths con singolare violations nelle teacher_message** (21 totali):
- v3-cap6-semaforo (1), v3-cap6-esp6 (3), v3-cap7-esp2 (1), v3-cap7-esp3 (1), v3-cap7-esp4 (1), v3-cap7-esp5 (1), v3-cap7-esp6 (2), v3-cap7-esp7 (1), v3-cap7-esp8 (1), v3-cap8-esp1 (1), v3-cap8-esp2 (1), v3-cap8-esp3 (1), v3-cap8-esp4 (1), v3-cap8-esp5 (1), v3-extra-lcd-hello (1), v3-extra-servo-sweep (1), v3-extra-simon (2)

### Priorità 4 — Title/ID Mismatch critici (4 casi)

| ID | Title esposto | Problema |
|----|--------------|---------|
| v3-cap6-esp3 | "Cap. 6 Esp. 2 - Cambia il numero di pin" | Duplica titolo di v3-cap6-esp2; id usa esp3 ma title dice esp2 |
| v3-cap6-esp5 | "Cap. 7 Ese. 7.3 - Pulsante con INPUT_PULLUP" | ID dice cap6, title dice cap7; chapter field dice Cap6 (corretto) |
| v3-cap6-esp6 | "Cap. 7 Mini-progetto - Due LED, un pulsante" | ID dice cap6, title dice cap7 Mini-progetto; chapter field dice Cap6 (corretto) |
| v3-cap8-serial | "Cap. 8 Esp. 1 - Comunicazione seriale: primo messaggio" | Stesso numero "Cap. 8 Esp. 1" di v3-cap8-esp1 (title identica numerazione) |

### Priorità 5 — Content Mismatch in unlimPrompt (1 caso)

**v3-cap6-esp4** — title: "Cap. 6 Esp. 4 - Due LED: effetto polizia"  
unlimPrompt: "...Lo studente sta facendo il **semaforo** con 3 LED sui pin 5, 6 e 9..."  
Il prompt descrive l'esperimento semaforo (v3-cap6-semaforo), non l'effetto polizia. I componenti hanno 8 comps / 10 conns (come v3-cap6-semaforo) — il circuito fisico sembra identico al semaforo. Il contenuto del prompt è fuori posto.

### Priorità 6 — Esperimenti senza scratchXml (3 casi)

| ID | Note |
|----|------|
| v3-cap6-esp1 | Ha codice C++, no scratchXml; bookRef Vol3 p.56 |
| v3-cap7-mini | Mini-progetto, no scratchXml (accettabile per mini-progetto avanzato) |
| v3-cap8-serial | Serial intro, no scratchXml (Scratch non supporta facilmente Serial Monitor) |

Gli esperimenti senza scratchXml non possono essere usati in modalità Scratch del simulatore. Per v3-cap6-esp1 in particolare, gli altri esperimenti Cap6 hanno scratchXml — questa lacuna è anomala.

### Priorità 7 — bookText scarso (<20 parole) in alcuni esperimenti

| ID | bookText Words | Valutazione |
|----|---------------|-------------|
| v3-cap6-esp3 | 10w | SCARSO — non sufficiente per citazione VERBATIM |
| v3-cap8-esp3 | 17w | Borderline |
| v3-cap8-esp4 | 17w | Borderline |
| v3-cap8-esp5 | 17w | Borderline |

---

## Riepilogo Conteggi per Capitolo

| Capitolo | Esperimenti | Circuit OK | Linguaggio Score≥8 | bookText OK | LP OK | Scratch |
|----------|-------------|-----------|-------------------|-------------|-------|---------|
| Cap5 | 2 | 2/2 | 0/2 | 2/2 | 2/2 | 2/2 |
| Cap6 | 9 | 9/9 | 2/9 | 9/9 | 9/9 | 8/9 |
| Cap7 | 10 | 10/10 | 1/10 | 10/10 | 10/10 | 9/10 |
| Cap8 | 6 | 5/6 | 1/6 | 6/6 | 6/6 | 5/6 |
| Extra | 3 | 3/3 | 0/3 | 3/3 | 3/3 | 3/3 |

**Totale**: 29 esperimenti — 28/29 circuit OK, 3/29 linguaggio≥8, 29/29 bookText presente, 29/29 LP presenti, 26/29 scratchXml

---

## Top 5 Issues da risolvere (ordinati per impatto)

1. **LINGUAGGIO unlimPrompt "Ragazzi," mancante (26/29)** — impatto alto: UNLIM riceve contesto senza rinforzo linguistico plurale. Fix: aggiungere "Ragazzi," come apertura implicita o prefisso in ciascun unlimPrompt. Effort: medio (26 modifiche testo).

2. **Lesson-path teacher_message senza "Ragazzi" (28/29) + 21 singolare violations** — impatto alto: il docente legge direttamente questi messaggi durante la lezione. Fix: codemod plurale + aggiunte "Ragazzi," a inizio frasi. Effort: medio-alto.

3. **v3-cap8-serial: 1 solo componente (mancante bb1)** — impatto medio: il simulatore non mostra breadboard, UX incoerente con tutti gli altri esperimenti. Fix: aggiungere `{ type: "breadboard-half", id: "bb1" }` e layout bb1.

4. **Title/ID mismatch (4 casi) + Content mismatch unlimPrompt v3-cap6-esp4** — impatto medio: confonde docenti e studenti che cercano l'esperimento per numero. Fix: aggiornare title fields o rinominare gli ID.

5. **v3-cap6-esp1 senza scratchXml** — impatto basso-medio: unico esperimento Cap6 senza Scratch, incoerente con tutti gli altri del capitolo. Fix: aggiungere `BLINK_EXTERNAL_SCRATCH` (già definito nel file) come scratchXml.

---

## Note Metodologiche

- **Scoring linguaggio unlimPrompt**: 10=solo "Ragazzi," e plurale; 6=no violations singolari ma nessun "Ragazzi,"; <6=violations singolari presenti. Tutti i 29 esperimenti usano "Lo studente" (singolare terza persona) nel contesto UNLIM — questo è il formato standard del prompt ed è accettabile (il tutor parla al docente DI uno studente generico).
- **circuit issues**: Solo esperimenti con >2 componenti E 0 connections vengono flaggati come gap circuito reale. Gli esperimenti Cap5/Cap8 seriale con 0 conn su solo nano+bb sono corretti.
- **bookText**: tutti e 29 presenti. Quelli con <20 parole indicano testo estratto dal PDF con difficoltà di localizzazione.
- **LP completeness**: tutti e 29 hanno 5/5 fasi con teacher_message non vuota e action_tags presenti.
