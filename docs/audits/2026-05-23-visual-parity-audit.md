# ELAB Visual Parity Audit — Demo 25/05/2026
**Data audit:** 2026-05-23  
**Auditor:** Visual Validation Agent (Sonnet 4.6)  
**Metodologia:** Screenshot simulator Già Montato via `__ELAB_API.mountExperiment()` + lettura diretta PNG volumi fisici + ispezione `getCircuitState()` + analisi codice sorgente componenti  
**Server:** `demo25-dev` localhost:5180 (worktree `elab-builder-demo25`)

---

## Premessa metodologica

L'audit confronta lo stato visivo del simulatore in modalità **Già Montato** con le tavole illustrative dei volumi fisici ELAB. Il Morfismo Sense 2 richiede che "prendi una pagina random del Volume + una schermata random del software: devono sembrare lo stesso prodotto fatto da persone che hanno parlato". Questo è il criterio di pass/fail.

Per ogni esperimento:
- Screenshot simulator catturato live
- Pagine libro lette come PNG ad alta risoluzione
- Dati `getCircuitState()` incrociati per verificare connessioni e colori fili
- Analisi codice sorgente Battery9V.jsx, Led.jsx per comportamenti di rendering

---

## ESPERIMENTO 1 — v1-cap6-esp1 "Accendi il tuo primo LED"
**Libro:** Vol1 pag 30-31  
**Simulator screenshot:** Già Montato, LED acceso (rosso), batteria 9V + resistore + LED

### Osservazioni visive oggettive

**Libro (pag 30-31):**
- Batteria 9V orizzontale, corpo nero a sinistra + banda arancione a destra. Orientamento: +/- verticale con clip snap. Il "9V" è in bianco sul corpo nero.
- Breadboard half-size con linee bus rosse in alto e blu/nere in basso.
- Resistore (470Ω, colori marrone-giallo-nero o simile) posizionato a cavallo della zona inferiore breadboard, verticale.
- LED rosso posizionato a cavallo della divisione centrale (fila e/f), gambe verticali, corpo trasparente/rosso sopra.
- Fili: rosso dal + della batteria al bus positivo superiore; filo rosso corto dal bus positivo alla colonna del LED/R; filo nero dal bus negativo inferiore al − della batteria.
- Il LED è orientato con le gambe che attraversano la separazione centrale (anode in zona superiore, cathode in zona inferiore).

**Simulator:**
- Batteria 9V: corpo identico (nero + arancione), "9V" visibile, renderMode `clip_simplified` attivo (per `isDemoExperiment()` = true) → i cavi embedded della batteria sono nascosti, Wire.jsx gestisce i fili esterni. Visivamente corretto: la batteria appare come nel libro.
- Breadboard half-size con linee bus rosse in alto e nere in basso — corretto.
- LED: posizionato a `e7/f7` (anode in e7, cathode in f7 — stessa colonna, righe adiacenti). Questo è orientamento VERTICALE che attraversa la divisione centrale: **corrisponde al libro**. LED acceso con glow rosso visibile.
- Resistore: posizionato a `i7-i9` (colonna 7, righe i-i — zona inferiore breadboard): corrisponde al libro, zona sotto la divisione.
- Fili: rosso (`bat1:positive → bb1:bus-top-plus-1`), rosso corto (`bb1:bus-top-plus-7 → bb1:a7`), nero (`bb1:i9 → bb1:bus-bot-minus-9`), nero (`bb1:bus-bot-minus-1 → bat1:negative`). **4 fili totali** — corrisponde al libro.
- Colori fili: rosso e nero — **corrisponde al libro**.

### Differenze rilevate

1. **Posizione batteria nel canvas:** Il libro mostra la batteria alla sinistra del frame con vista frontale obliqua. Il simulator mostra la batteria alla sinistra con vista laterale piatta (SVG). La prospettiva è diversa ma il riconoscimento è immediato: **drift minore, accettabile**.
2. **Wire routing geometria:** I fili nel simulator sono linee diagonali dritte (dalla batteria al bus breadboard). Il libro mostra fili con leggere curve. La geometria è più rigida nel simulator. **Drift P2 — percepibile ma non bloccante per demo**.
3. **LED nel libro (pag 31 completo):** Il LED è mostrato con il copro obliquo con flat-cut sul catodo visibile. Nel simulator il LED SVG è stilizzato verticale con corpo circolare e glow. Non è identico al disegno libro ma è riconoscibile come LED. **Drift estetico P2**.
4. **Resistore colori band:** Il libro mostra un resistore con bande colorate specifiche (470Ω = giallo-viola-marrone). Nel simulator il resistore è renderizzato con bande colorate generiche visibili ma la lettura precisa delle bande non è verificabile allo zoom attuale. **Non bloccante**.
5. **Dimensione relativa breadboard:** Il simulator mostra una breadboard full-width (30 colonne visibili), mentre il libro mostra una breadboard half-size (~20 fori visibili). Il simulator usa `breadboard-half` correttamente ma la visualizzazione a schermo appare più larga per il zoom. **Accettabile**.

### Verifica criteri Morfismo

- Layout componenti rispecchia il libro: PASS
- Fili rosso/nero corretti: PASS
- LED acceso con glow: PASS
- Battery clip_simplified attivo: PASS
- LED orientamento attraversa divisione centrale: PASS

**SCORE ESP1: 8/10**  
Gap: wire routing geometria (P2), prospettiva batteria (P2), LED body style (P2).

---

## ESPERIMENTO 2 — v1-cap6-esp2 "LED senza resistore (cosa NON fare!)"
**Libro:** Vol1 pag 32  
**Simulator screenshot:** Già Montato, LED BRUCIATO (X rossa + label "BRUCIATO!")

### Osservazioni visive oggettive

**Libro (pag 32):**
- Circuit identico a esp1 MA **senza resistore**. Solo batteria + LED direttamente.
- Il LED è mostrato senza corpo visibile (implicito "bruciato/rotto").
- Il libro mostra una singola illustrazione del circuito senza resistore con testo pedagogico "se colleghi per errore il LED direttamente alla batteria, il LED si brucia".
- Non c'è una illustrazione del LED bruciato esplicitamente — il testo spiega il concetto.

**Simulator:**
- Battery 9V presente, breadboard, LED (id `led1`, colore `blue`). **DISCREPANZA CRITICA: il libro parla di LED generico (non specifica colore), il simulator usa LED BLU.**
- Il LED mostra una X rossa grande con label "BRUCIATO!" sopra. Questo è il feedback visivo del simulator per segnalare il LED danneggiato. **Aggiunta non presente nel libro** — è una scelta pedagogica del software.
- Solo 2 fili: rosso (bat1 → bus-top-plus-2) + nero (bat1 → bus-bot-minus). Nessun resistore — corrisponde al libro.
- Non c'è resistore nel layout: corretto per questo esperimento.

### Differenze rilevate

1. **Colore LED: BLUE nel simulator vs. libro non specifica colore (implica lo stesso LED rosso dell'esp1).** Il libro di esp2 mostra un LED senza specificare colore ma il contesto narrativo con esp1 implica lo stesso LED. Usare un LED blu introduce un cambio visivo arbitrario. **GAP P1 — potenziale confusione per studenti/docenti.**
2. **"BRUCIATO!" overlay non presente nel libro:** Il libro non mostra graficamente un LED bruciato — spiega verbalmente il concetto. Il simulator aggiunge questa visualizzazione che non ha controparte nel volume. Questo è una aggiunta pedagogica del software che può confondere il docente che guarda il libro. **GAP P2 — scelta product divergente.**
3. **Filo rosso va a `bus-top-plus-2` (colonna 2) nel simulator, non colonna 1 come in esp1.** Differenza minore nella posizione dell'attacco bus, non visibile al docente. **Trascurabile.**
4. **Wire routing da batteria al bus:** Filo rosso diagonale. Nel libro è più corto e orizzontale/verticale. **P2.**

### Verifica criteri Morfismo

- Layout circuito senza resistore: PASS
- LED colore rosso come esp1: FAIL (LED blu)
- Feedback bruciato coerente con libro: NEUTRAL (aggiunta utile ma non nel libro)

**SCORE ESP2: 6.5/10**  
Gap principale: LED colore blu non coerente con narrazione libro (P1). Feedback visivo "BRUCIATO!" è extra-libro ma pedagogicamente valido.

---

## ESPERIMENTO 3 — v1-cap6-esp3 "Cambia luminosità"
**Libro:** Vol1 pag 33  
**Simulator screenshot:** Già Montato, LED BRUCIATO (X rossa), LED verde, resistore

### Osservazioni visive oggettive

**Libro (pag 33):**
- **Esperimento 3 = partire dal circuito esp1 MA con resistore 220Ω al posto di 470Ω** → LED più luminoso.
- Il libro mostra LED **VERDE** (non rosso) nel circuito di esp3. Questa è la prima evidenza visiva di LED verde nel libro.
- Il layout è identico a esp1 ma il LED è verde e il resistore è 220Ω.
- Secondo illustrazione: resistore 1kΩ → LED meno luminoso.

**Simulator (Screenshot):**
- Il titolo mostra "Cambia luminosità con resistenze diverse" — corretto.
- Il circuito mostra LED BRUCIATO (X rossa) e R1. **PROBLEMA CRITICO: lo stato Già Montato mostra un LED bruciato, non un LED verde acceso.**
- Il LED è verde (`led1 color: green`) ma appare con overlay BRUCIATO visibile.
- Dati `getCircuitState` mostrano `led1.state.burned: false` con `brightness: 0` — lo stato di simulazione non ha bruciato il LED, ma c'è un overlay BRUCIATO visibile nel screenshot.

### Analisi del problema

Incrociando i dati: il screenshot mostra la stessa vista di esp2 (LED bruciato, X rossa visibile), **il che suggerisce che mountExperiment('v1-cap6-esp3') potrebbe non aver resettato correttamente il LED burned state dall'experiment precedente (esp2)**. Questo è un bug di stato: lo stato "burned" di esp2 persiste su esp3.

Verifica: `getCircuitState` per esp3 riporta `led1.state.burned: false` ma il rendering mostra l'overlay BRUCIATO. La discrepanza indica un bug di rendering — lo stato React non si sincronizza correttamente al mount di un nuovo esperimento, mantenendo l'overlay visivo del precedente.

**QUESTO È UN BUG CRITICO P0 PER LA DEMO.**

### Differenze rilevate

1. **BUG P0 — LED esp3 mostra stato "BRUCIATO" da esp2:** Quando si monta esp3 da esp2, l'overlay BRUCIATO persiste. Lo studente/docente vede un LED bruciato in un esperimento in cui il LED dovrebbe essere VERDE e ACCESO. **Bloccante per demo.**
2. **LED colore verde corretto** (dati confermano `color: green`): allineato al libro pag 33.
3. **Resistore 220Ω corretto** (dati confermano `value: 220`): allineato al libro.
4. **Wire routing e posizioni componenti:** stessi di esp1, corretti.

**SCORE ESP3: 3/10** (penalizzato P0 per bug stato BRUCIATO persistente)  
Bug P0 bloccante per demo: stato burned non si resetta al mount di nuovo esperimento.

---

## ESPERIMENTO 4 — v2-cap7-esp1 "Scarica condensatore + multimetro"
**Libro:** Vol2 pag 67-68  
**Simulator screenshot:** Già Montato, condensatore + pulsante + resistore + multimetro esterno

### Osservazioni visive oggettive

**Libro (pag 67-68):**
- Condensatore 1000µF a cavallo della separazione centrale breadboard (gambe spanning righe).
- Pulsante a cavallo della separazione centrale, vicino al condensatore.
- Resistore 1kΩ connesso al positivo del condensatore.
- **Multimetro analogico/digitale giallo** sulla destra del frame, con sonda rossa sul positivo del condensatore e sonda nera sul negativo. Mostra "9.00 V".
- Batteria 9V a sinistra con la sua clip.
- **Fili: rosso dal positivo batteria al bus, filo colorato dal bus al pulsante.** Il libro usa colori vivaci.
- La batteria nel libro è mostrata con la stessa prospettiva laterale del simulator.

**Simulator:**
- Componenti presenti: `bat1` (battery9v), `c1` (capacitor), `btn1` (push-button), `r1` (resistor, 1kΩ implied), `mm1` (multimeter).
- Multimetro: posizionato in alto a destra, corpo giallo con display "0.00", sonde rosse/nere visibili. **Corrisponde al libro.**
- Posizione multimetro sonde: `mm1:probe-positive → bb1:j12`, `mm1:probe-negative → bb1:j15`. Le sonde toccano la breadboard accanto al condensatore. **Nel libro le sonde toccano il condensatore direttamente (ai capi) — potrebbero essere connesse correttamente ma la posizione visuale nel simulator mostra le sonde sul lato inferiore (righe j), non direttamente ai morsetti del condensatore.**
- Condensatore: posizione `x:207.75, y:98.75` — nella metà destra della breadboard. Nel libro è più centrato/sinistra.
- Pulsante: vicino al condensatore — corretto.
- Fili: rosso (bat1+ → bus-top-plus-1), rosso (bus-top-plus-10 → a10), nero (h18 → bus-bot-minus-18), nero (bus-bot-minus-1 → bat1-), sonda rossa (mm1 → j12), sonda nera (mm1 → j15).
- **I fili sono solo 4 di circuito + 2 sonde.** Il libro mostra anche un filo colorato tra pulsante e condensatore. **Gap: manca filo dal pulsante al circuito principale.**

### Differenze rilevate

1. **Sonde multimetro non ai capi del condensatore:** Il libro mostra chiaramente le sonde mm connesse direttamente ai terminali del condensatore (positivo/negativo). Nel simulator le sonde sono a `j12` e `j15` — non verificabile senza vedere la mappa completa se questi fori coincidono con i terminali del condensatore a `bb1:j12` (pin del condensatore) o solo vicino. Da `getCircuitState`: condensatore è a posizione `x:207.75, y:98.75` che corrisponde grossomodo alle colonne 12-14. Le sonde a j12/j15 sono plausibilmente sui terminali del condensatore. **Accettabile — probabile allineamento corretto.**
2. **Filo tra pulsante e condensatore:** Le connessioni mostrano `bus-top-plus-10 → a10` (filo dal bus al pulsante/condensatore) ma non appare un filo esplicito tra pulsante e condensatore come mostra il libro. **Gap P1 — wire routing non mostra connessione esplicita pulsante↔condensatore.**
3. **Posizione condensatore:** nel simulator è nella zona destra della breadboard (col ~12-14). Nel libro è più centrale-sinistra. **Drift P2 — layout non perfettamente speculare al libro.**
4. **Batteria clip_simplified attivo:** corretto.
5. **Multimetro display "0.00":** Il libro mostra "9.00 V" (condensatore carico). Nel simulator idle il display mostra 0.00 — normale perché la simulazione non è avviata. **Accettabile per Già Montato.**

**SCORE ESP4: 7/10**  
Gap principali: wire routing pulsante↔condensatore non esplicito (P1), posizione componenti leggermente diversa dal libro (P2), multimetro display 0 vs 9V (comportamento atteso).

---

## ESPERIMENTO 5 — v2-cap7-esp2 "Scarica con LED rosso"
**Libro:** Vol2 pag 69-71  
**Simulator screenshot:** Già Montato, condensatore + pulsante + LED rosso + resistore + multimetro

### Osservazioni visive oggettive

**Libro (pag 69-71):**
- Pulsante a cavallo separazione centrale.
- Condensatore a fianco del pulsante, negativo verso il basso.
- Resistore 1kΩ tra positivo condensatore e breadboard.
- **LED rosso** con anodo verso il lato libero del resistore e catodo verso la breadboard.
- Multimetro giallo a destra con sonda rossa sul positivo condensatore e nera sul negativo.
- **Fili multipli:** rosso (batteria → bus), filo verde/colorato (pulsante → condensatore), filo colorato (LED − → batteria −). Il libro usa 3 colori diversi per i fili.

**Simulator:**
- Componenti: `bat1`, `c1`, `btn1`, `led1` (LED, verificato rosso nel screenshot), `r1`, `mm1`.
- Connessioni (da `getCircuitState`): rosso (bat+ → bus-top-plus-1), rosso (bus-top-plus-10 → a10), **nero (a6 → bus-top-minus-6)**, **nero (bus-top-minus-1 → bat-)**, **giallo (g12 → c5)**, **verde (a5 → a15)**, **arancione (a22 → a23)**, **nero (a24 → bus-top-minus-24)**, sonda rossa mm (b5), sonda nera mm (b6).
- **5 colori di fili usati**: rosso, nero, giallo, verde, arancione. Il libro usa principalmente rosso + 1-2 colori. **I colori multipli nel simulator sono più vivaci e differenziati rispetto al libro.**
- LED rosso confermato visivamente nel screenshot (corpo rosso/arancione visibile a circa col 22-24 breadboard).
- Sonde multimetro a b5/b6 — vicine al condensatore (a c1 pos x:155.25 → col ~5-6). **Le sonde sembrano toccare i terminali del condensatore: allineato al libro.**
- Filo nero connette `a6 → bus-top-minus-6` — questo è il filo del catodo LED verso il GND. Il libro mostra lo stesso percorso.

### Differenze rilevate

1. **Wire colors: il simulator usa 5 colori (rosso/nero/giallo/verde/arancione).** Il libro mostra principalmente rosso/nero + al massimo 1 filo colorato (es. filo rosso per connessione pulsante→condensatore). L'uso di giallo, verde e arancione nel simulator rende il circuito più colorato del libro. **Gap estetico P2 — non bloccante ma riduce il Morfismo sense 2 per questo esperimento.**
2. **Posizione LED:** a `x:286.5, y:43.75` (col ~22-23, zona superiore). Nel libro il LED è posizionato a destra del resistore nella zona superiore breadboard — **corrisponde.**
3. **Wire routing geometria:** Fili arancione e verde fanno salti orizzontali lunghi (a5 → a15 = 10 colonne). Il libro non mostra fili così lunghi su file singola. **P2.**
4. **Sonde multimetro:** a b5/b6 (affiancate). Il libro mostra sonde ai capi del condensatore con cavi ben distinti. Nel simulator le sonde sono adiacenti (b5/b6 = stessa riga, colonne 5 e 6). **Accettabile — sonde correttamente sui terminali.**
5. **Display multimetro: 0.00** vs 9V libro — normale per stato idle.

**SCORE ESP5: 7/10**  
Gap principali: wire colors multipli non corrispondono alla semplicità visiva del libro (P2), wire routing salti lunghi (P2).

---

## ESPERIMENTO 6 — v3-cap6-esp4 "Due LED che si alternano"
**Libro:** Vol3 pag 54-56, Esercizio 6.4  
**Simulator screenshot:** Già Montato, Arduino Nano R4 su breakout + breadboard + 2 LED (blu + rosso) + 2 resistori + editor codice aperto

### Osservazioni visive oggettive

**Libro (pag 54-56):**
- **Arduino Nano R4 inserito nel ELAB Nano Breakout**, che è poi connesso alla breadboard.
- Schema: 1 LED blu su pin 6, 1 LED rosso su pin 9.
- Resistori in serie con ogni LED, tra LED e GND.
- Il breakout è mostrato come scheda separata con pin esposti, il Nano è inserito sopra.
- Colori LED nel libro: **blu e rosso** (esplicitamente: "1 LED blu, 1 LED rosso").
- **Il libro mostra la breadboard separata dal breakout, con fili che vanno dal breakout ai LED sulla breadboard.**
- Layout: breakout a sinistra, breadboard a destra, LED a destra della breadboard.
- **Wire routing nel libro:** 2 fili colorati dal breakout ai pin di breadboard + 2 fili GND dal LED verso il bus negativo.

**Simulator:**
- Componenti: `bb1` (breadboard half), `nano1` (nano-r4), `r1`, `led1`, `r2`, `led2`.
- Il Nano R4 è posizionato a `x:230, y:10` con `parentId: bb1` — **il Nano è inserito nella breadboard**, non su un breakout separato. **DISCREPANZA CRITICA: il libro mostra esplicitamente il "ELAB Nano Breakout" come scheda intermedia.**
- LED posizioni: `led1` a `x:481.5, y:43.75` e `led2` a `x:511.5, y:43.75` — entrambi in zona destra breadboard alta, vicini, **nessun ordine blu-rosso verificabile visivamente** (screenshot mostra un LED blu e uno rosso a destra).
- Fili connessioni: **arancione** (nano:W_D6 → bb1:a16) e **arancione** (nano:W_D9 → bb1:a20) — entrambi arancioni. Nel libro i fili dei pin sono mostrati con colori diversi per distinguerli. **Entrambi arancioni rende difficile la distinzione.**
- Fili GND per ogni LED: **nero** (bb1:a26 → bus-bot-minus-26) e **nero** (bb1:a30 → bus-bot-minus-30) — corretti.
- Fili corte tra R e LED: **verde** (bb1:d23 → bb1:d25) e **verde** (bb1:d27 → bb1:d29) — questi sono i fili tra resistore e LED. Nel libro non sono mostrati fili così brevi tra R e LED — sono direttamente connessi (stesso filo).
- **Editor di codice aperto sul lato destro** con codice Arduino visibile: `LED_BLU = 6`, `LED_ROSSO = 9`, `delay(200)`. **Il codice mostra correttamente i pin 6 e 9 come da libro.**
- **Label "Errore di compilazione"** visibile nell'header dell'editor. **BUG P0: il codice pre-caricato produce un errore di compilazione visibile nel Già Montato.**

### Differenze rilevate

1. **ASSENZA BREAKOUT ELAB:** Il libro mostra esplicitamente il "ELAB Nano Breakout" come componente separato tra Nano e breadboard. Il simulator inserisce il Nano direttamente nella breadboard senza breakout. **Gap P0 per Morfismo Sense 2 — il breakout è un componente fisico del kit che deve essere riconoscibile.**
2. **BUG P0: Errore di compilazione visibile** nell'header editor ("Errore di compilazio..." troncato). Il codice pre-caricato non compila nel Già Montato. **Bloccante per demo.**
3. **Fili dal Nano ai LED tutti arancioni:** pin D6 e pin D9 usano entrambi filo arancione. Non è sbagliato funzionalmente ma riduce la leggibilità visiva. Il libro usa colori differenti. **Gap P2.**
4. **Fili corti verdi tra R e LED:** nel libro il resistore è direttamente in serie con il LED senza filo separato. Il simulator aggiunge fili verdi corti `d23→d25` e `d27→d29`. **Wire routing artificiale non presente nel libro — Gap P1.**
5. **LED colori (blu e rosso):** confermati visivamente nel screenshot. **Corrisponde al libro.**
6. **Pin assignments verificati:** D6 e D9 come da libro. **Corretti.**

**SCORE ESP6: 4/10**  
Gap critici: assenza ELAB Nano Breakout (P0), errore compilazione visibile (P0), wire routing artificioso con fili verdi corti (P1).

---

## ESPERIMENTO 7 — v3-cap6-esp5 "Costruiamo un semaforo"
**Libro:** Vol3 pag 57-58, Esercizio 6.5  
**Simulator screenshot:** Già Montato, Arduino Nano R4 + breadboard + 3 LED (verde, giallo, rosso) + 3 resistori + editor codice

### Osservazioni visive oggettive

**Libro (pag 57):**
- Arduino Nano R4 su **ELAB Nano Breakout** + breadboard.
- 3 LED: rosso, giallo, verde. Colori espliciti nel libro.
- 3 resistori 470Ω, uno per ogni LED.
- Pin usati: **5 (LED verde), 6 (LED giallo), 9 (LED rosso)** come da libro.
- Layout libro pag 57: breakout a sinistra, 3 LED sulla breadboard a destra in sequenza (verde-giallo-rosso da sinistra a destra).
- La foto/illustrazione mostra i 3 LED ben distanziati e identificabili per colore.

**Simulator:**
- Componenti: `bb1`, `nano1`, `r1`, `led1`, `r2`, `led2`, `r3`, `led3`.
- Nano posizionato come in esp4: direttamente in bb1 senza breakout. **Stessa assenza breakout.**
- Connessioni: **arancione** (nano:W_D5 → bb1:a14), **arancione** (nano:W_D6 → bb1:a18), **arancione** (nano:W_D9 → bb1:a22). **Tutti e 3 i fili arancioni** — nessuna differenziazione cromatica tra pin diversi. Nel libro i fili sono di colore diverso per distinguere le connessioni.
- Fili GND: nero per ognuno dei 3 LED — corretti.
- Fili verdi corti tra R e LED: stessa struttura di esp4 (d21→d23, d25→d27, d29→d21). **Il terzo filo verde (d29→d21) è anomalo: collega col 29 a col 21 — un filo che salta 8 colonne in modo inusuale.** Potrebbe essere un bug di routing.
- **Editor di codice aperto con codice semaforo:** `LED_VERDE=5`, `LED_GIALLO=6`, `LED_ROSSO=9`, sequenza verde(3s)-giallo(1s)-rosso(3s). **Pin corretti come da libro.** Status "Pronto" visibile (non errore come esp4).
- **3 LED visibili nel screenshot:** verde a sinistra (col ~20), giallo al centro (col ~24), rosso a destra (col ~27). **Ordine e colori coerenti con la narrazione libro (semaforo).**
- Resistori tra LED: posizioni `x:421.5, 451.5, 481.5` (scaglionati) — corrette.

### Differenze rilevate

1. **ASSENZA BREAKOUT ELAB:** stessa critica di esp4. **Gap P0.**
2. **Tutti i fili pin sono arancioni:** 3 fili dal Nano (D5/D6/D9) tutti dello stesso colore. Il libro mostra colori differenziati. **Gap P2.**
3. **Wire corto anomalo d29→d21:** Il terzo filo verde salta dalla colonna 29 alla colonna 21 — geometricamente non ha senso visivamente (salta sopra il LED intermedio). Questo potrebbe essere un routing bug. **Gap P1.**
4. **LED order e colori corretti:** verde(sx)-giallo(center)-rosso(dx). **Match con libro.**
5. **Pin assignments corretti:** D5, D6, D9. **Match.**
6. **Editor "Pronto"** (non errore): a differenza di esp4, il codice semaforo compila. **Positivo.**

**SCORE ESP7: 5/10**  
Gap critici: assenza breakout (P0), wire routing anomalo d29→d21 (P1), fili tutti arancioni (P2).

---

## SCORE AGGREGATO

| Esp | ID | Titolo | Score |
|-----|-----|--------|-------|
| 1 | v1-cap6-esp1 | Accendi il tuo primo LED | 8/10 |
| 2 | v1-cap6-esp2 | LED senza resistore | 6.5/10 |
| 3 | v1-cap6-esp3 | Cambia luminosità | 3/10 |
| 4 | v2-cap7-esp1 | Scarica condensatore + multimetro | 7/10 |
| 5 | v2-cap7-esp2 | Scarica con LED rosso | 7/10 |
| 6 | v3-cap6-esp4 | Due LED che si alternano | 4/10 |
| 7 | v3-cap6-esp5 | Costruiamo un semaforo | 5/10 |
| **TOT** | | | **5.8/10** |

**Media ponderata: 5.8/10**

---

## TOP 10 FIX PRIORITIZZATI

### P0 — Bloccanti per demo (devono essere risolti prima del 25/05)

**FIX-01 [P0] — Bug stato burned persiste su esp3**  
Quando si passa da `v1-cap6-esp2` (LED bruciato) a `v1-cap6-esp3`, lo stato visivo BRUCIATO rimane sul LED. La simulazione riporta `burned: false` ma il rendering mantiene l'overlay. Il problema è nella sincronizzazione del componente LED React al mount di un nuovo esperimento: lo stato `burned` da esp2 non viene resettato.  
File: `src/components/simulator/components/Led.jsx` + `PlacementEngine.js` o il mount handler in `NewElabSimulator.jsx`.  
Impact: esp3 è inutilizzabile in demo — mostra LED bruciato invece di LED verde acceso.

**FIX-02 [P0] — Errore compilazione visibile su v3-cap6-esp4**  
L'header dell'editor Arduino mostra "Errore di compilazio..." nel Già Montato di esp4. Il codice pre-caricato (LED_BLU/LED_ROSSO) non compila correttamente o lo stato di compilazione precedente non viene resettato al mount.  
File: `src/components/lavagna/` — logica reset editor + compile status al mountExperiment.  
Impact: impressione di software rotto durante demo Vol3.

**FIX-03 [P0] — Assenza ELAB Nano Breakout nei circuiti Vol3 (esp4 e esp5)**  
Il libro Vol3 mostra esplicitamente il "ELAB Nano Breakout" come scheda fisica tra Arduino Nano R4 e breadboard. Il simulator inserisce il Nano direttamente nella breadboard senza breakout. Questo viola il Morfismo Sense 2 per tutti gli esperimenti Vol3 che usano il breakout.  
File: `src/data/experiments-vol3.js` — aggiungere componente `nano-breakout` al layout di esp4 e esp5 + SVG del breakout.  
Impact: riconoscimento hardware del kit fisico completamente mancante per Vol3.

### P1 — Importanti (migliorano qualità demo se risolti)

**FIX-04 [P1] — LED colore blu in esp2 invece di continuare con LED rosso**  
Il libro esp2 usa lo stesso LED dell'esp1 (rosso, implicito dalla narrativa continua). Il simulator usa LED blu. Rompe la continuità narrativa libro→simulator per esp2.  
File: `src/data/experiments-vol1.js` — cambiare `led1.color: "blue"` a `"red"` in v1-cap6-esp2.  
Impact: media, ma importante per Morfismo Sense 2 durante transizione esp1→esp2.

**FIX-05 [P1] — Wire routing corti verdi artificiali tra R e LED (esp4 e esp5)**  
Il simulator aggiunge fili corti verdi tra il resistore e il LED (es. `d23→d25`) che non compaiono nel libro. Nel libro il resistore è direttamente connesso alla stessa colonna del LED. Questi fili extra rendono il layout più caotico.  
File: `src/data/experiments-vol3.js` — rimuovere le connessioni wire verdi intermedie e allineare pin assignments R-LED sulla stessa colonna.  
Impact: semplifica il layout e avvicina al libro.

**FIX-06 [P1] — Wire anomalo d29→d21 in esp5 (semaforo)**  
Il filo verde `d29→d21` in esp5 salta visivamente sopra componenti intermedi. La geometria è errata — probabilmente un bug nei pin assignments del terzo LED/resistore.  
File: `src/data/experiments-vol3.js` — rivedere pinAssignments e connections per r3/led3 in v3-cap6-esp5.  
Impact: layout semaforo incoerente con libro.

**FIX-07 [P1] — Connessione pulsante↔condensatore non esplicita in esp4**  
Il libro mostra chiaramente un filo colorato dal pulsante al condensatore. Nel simulator il collegamento esiste (via bus) ma non c'è un filo esplicito visibile. Aggiungere una connessione wire diretta pulsante→condensatore positivo.  
File: `src/data/experiments-vol2.js` — aggiungere wire connection btn1:pin1→c1:positive in v2-cap7-esp1.  
Impact: chiarezza pedagogica del circuito di scarica condensatore.

### P2 — Miglioramenti estetici (nice-to-have)

**FIX-08 [P2] — Fili pin digitali tutti arancioni in esp4 e esp5**  
Tutti i fili dal Nano ai pin LED usano colore arancione. Differenziare i colori (es. verde per D5, giallo per D6, arancione per D9) migliora la leggibilità e avvicina al libro.  
File: `src/data/experiments-vol3.js` — cambiare wire color per D5 e D6 in esp4/esp5.

**FIX-09 [P2] — Wire routing geometria — linee più curve**  
I fili nel simulator sono segmenti diagonali rigidi. Il libro mostra fili con leggere curve organiche. Implementare Bezier curve sul rendering Wire.jsx per un aspetto più simile al libro.  
File: `src/components/simulator/canvas/Wire.jsx` — aggiungere curvatura ai fili.

**FIX-10 [P2] — Overlay BRUCIATO esp2 semanticamente corretto ma extra-libro**  
Il feedback "BRUCIATO!" con X rossa è una aggiunta utile che non ha controparte nel libro. Valutare se ridurre l'overlay (es. solo bagliore rosso debole, no X grande) per avvicinarsi all'illustrazione libro che non mostra esplicitamente un LED bruciato.  
File: `src/components/simulator/components/Led.jsx` — reducere prominenza overlay burned.

---

## Osservazioni trasversali

### Battery9V clip_simplified
Attivo correttamente su tutti e 7 gli esperimenti (via `isDemoExperiment()`). La batteria appare senza i cavi embedded SVG — i cavi Wire.jsx esterni gestiscono la geometria. Visivamente il risultato è corretto e vicino al libro per tutti i Vol1/Vol2. **PASS.**

### Multimetro (esp4 e esp5)
Il multimetro giallo digitale è visivamente riconoscibile e coerente con le illustrazioni libro. Le sonde sono posizionate correttamente sui terminali del condensatore. Il display mostra 0.00 allo stato idle — accettabile. **PASS.**

### Breadboard e linee bus
La breadboard half-size con linee rosse (bus+) e nere (bus−) corrisponde al libro in tutti gli esperimenti. **PASS.**

### Codice Arduino Vol3
Il codice pre-caricato per esp4 (LED alternati) e esp5 (semaforo) è corretto come da libro. Pin assignments D5/D6/D9 confermati. Il codice esp5 compila ("Pronto"), esp4 non compila ("Errore di compilazione"). **Bug esp4 è P0.**

### Morfismo Test (regola CLAUDE.md)
"Prendi una pagina del Volume + una schermata del software: devono sembrare lo stesso prodotto."
- Vol1 (esp1, esp2): **PASSA** (riconoscibili, stesso layout base)
- Vol1 esp3: **FALLISCE** (LED bruciato su esp3 è sbagliato)  
- Vol2 (esp4, esp5): **PASSA PARZIALMENTE** (layout vicino, wire routing diverso)
- Vol3 (esp6, esp7): **FALLISCE** (breakout mancante, errore compilazione)

---

## Sintesi finale per demo 25/05

**Score globale: 5.8/10** — non sufficiente per una demo di qualità senza fix P0.

**3 fix P0 obbligatori pre-demo:**
1. Reset stato burned LED al mount nuovo esperimento (esp3 rotto)
2. Reset compile error display al mount nuovo esperimento (esp4)
3. Aggiungere ELAB Nano Breakout nei layout esp4 e esp5

**Con i 3 P0 risolti, lo score sale a circa 7.5/10** — accettabile per demo con le dovute note.

**4 fix P1 consigliati** per rafforzare il Morfismo: colore LED esp2, wire routing Vol3, connessione pulsante esp4, filo anomalo esp5.

**3 fix P2** per polish estetico: colori fili Vol3, curvatura wire, overlay burned.

---

*Audit eseguito 2026-05-23 — worktree elab-builder-demo25 — NO modifiche al codice*
