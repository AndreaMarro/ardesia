# EPIC 1 / A2 — Narrative canon reconciliation audit

> Generato da `scripts/epic1/reconcile-narrative-canon.mjs` — READ-ONLY, nessuna mutazione `src/`.
> Data: 2026-05-14 · ADR: ADR-047 · Iter 54.

## Sintesi

| Metrica | Valore |
|---|---|
| ID canonici Tea (narrative_map) | **94** |
| Presenti in `lesson-paths/` | 94 / 94 |
| Presenti in `capitoli/` | 91 / 94 |
| Presenti in `volume-references.js` | 94 / 94 |
| Presenti in `narrative_metadata_94` | 94 / 94 |
| In un `LESSON_GROUP` | 94 / 94 |
| Title mismatch (lesson-path ↔ Tea) | 72 |
| Chapter mismatch | 4 |
| **next_id chain mismatch** | **20** |
| Page mismatch (volume-references ↔ Tea) | 0 |
| Lesson-path con blocco `steps` 7-step | 0 / 94 |
| Lesson-path con `duration_min` (R12 PZ-V3) | 0 / 94 |
| Capstone canonici (next_id=null) | 9 |
| ID extra in `lesson-paths/` non in Tea | 0 |
| ID extra in `capitoli/` non in Tea | 3 |
| ID extra in `volume-references` non in Tea | 0 |


## Gap 1 — Schema 7-step non adottato

Nessun lesson-path ha il blocco `steps` canonico Tea (setup/ipotesi/costruzione/misura/variazione/conclusione/trasferimento). Tutti usano ancora `phases` 5-fasi. Migrazione **additiva** (ADR-047 D2) richiesta su tutti i 94.
`duration_min` (prerequisito regola PZ-V3 R12) assente su 94 file — presente `duration_minutes` su 94, da rimappare.

## Gap 2 — next_id chain mismatch (Morfismo Sense 2 core)

| id | lesson-path next_experiment.id | Tea next_id |
| --- | --- | --- |
| v1-cap10-esp6 | v1-cap11-esp1 | v1-cap12-esp1 |
| v1-cap11-esp2 | v1-cap12-esp1 | v1-cap14-esp1 |
| v1-cap12-esp4 | v1-cap13-esp1 | _(null)_ |
| v1-cap13-esp2 | v1-cap14-esp1 | _(null)_ |
| v1-cap14-esp1 | v2-cap6-esp1 | _(null)_ |
| v1-cap8-esp5 | v1-cap9-esp1 | v1-cap11-esp1 |
| v1-cap9-esp1 | v1-cap9-esp2 | v2-cap9-esp2 |
| v1-cap9-esp9 | v1-cap10-esp1 | v1-cap13-esp1 |
| v2-cap12-esp1 | v3-cap6-semaforo | _(null)_ |
| v2-cap5-esp2 | v2-cap6-esp1 | _(null)_ |
| v2-cap7-esp4 | v2-cap8-esp1 | _(null)_ |
| v3-cap6-esp5 | v3-cap6-semaforo | v3-cap6-esp6 |
| v3-cap6-esp6 | v3-cap8-esp3 | v3-cap6-esp7 |
| v3-cap6-esp7 | v3-cap7-esp1 | v3-cap6-morse |
| v3-cap6-morse | _(null)_ | v3-cap6-semaforo |
| v3-cap6-semaforo | v3-cap6-esp6 | _(null)_ |
| v3-cap7-esp8 | v3-cap8-esp1 | v3-cap7-mini |
| v3-cap7-mini | _(null)_ | v3-extra-lcd-hello |
| v3-cap8-esp3 | v3-extra-lcd-hello | v3-cap8-esp4 |
| v3-cap8-esp5 | v3-extra-lcd-hello | v3-cap8-serial |


## Gap 3 — Title mismatch

| id | lesson-path title | Tea title |
| --- | --- | --- |
| v1-cap10-esp2 | LED diverso colore con LDR | Bloccare il LED con il dito |
| v1-cap10-esp3 | 3 LDR controllano RGB | Il sensore di luce nel buio |
| v1-cap10-esp4 | LED bianco illumina LDR → LED blu | Luminosità controllata |
| v1-cap10-esp5 | Aggiungi pot per controllare LED bianco | Il primo sensore del progetto |
| v1-cap10-esp6 | Aggiungi pulsante al circuito LDR | Sensori e feedback immediato |
| v1-cap11-esp1 | Buzzer suona continuo | Crea una porta AND con i relè |
| v1-cap11-esp2 | Campanello con pulsante | Crea una porta OR con i relè |
| v1-cap12-esp1 | LED con reed switch | Il bottone che accende il LED |
| v1-cap12-esp2 | Cambia luminosità con magnete | Prova il circuito con il pulsante |
| v1-cap12-esp3 | Sfida: RGB + reed switch | Rimbalzi e contatti sporchi |
| v1-cap12-esp4 | Sfida: pot + RGB + reed switch | Controllo manuale dei circuiti |
| v1-cap13-esp1 | LED nell'elettropongo | LED nell'elettropongo conduttivo |
| v1-cap13-esp2 | Circuiti artistici con plastilina | Circuiti artistici con elettropongo |
| v1-cap14-esp1 | Il Primo Robot ELAB | Costruisci un circuito con sensore di luce |
| v1-cap8-esp3 | RGB + pulsante = viola | Illumina con variazione di resistenza |
| v1-cap8-esp4 | 3 pulsanti → 3 colori RGB | Prova il circuito con il kit Omaric |
| v1-cap8-esp5 | Mix avanzato con resistori diversi | Misura la tensione nel circuito |
| v1-cap9-esp1 | Dimmer LED con potenziometro | Accendi un LED con un bottone |
| v1-cap9-esp2 | Inverti la rotazione | Sensore di prossimità con LED |
| v1-cap9-esp3 | LED di colore diverso con pot | LED con luminosità variabile |
| v1-cap9-esp4 | Dimmer RGB azzurrino | Amplificazione con transistor |
| v1-cap9-esp5 | Pot miscelatore blu rosso | Relay elettromagnetico |
| v1-cap9-esp8 | Sfida: combina esperimenti 5+6 | Combina esperimenti: due LED RGB sincronizzati |
| v1-cap9-esp9 | Sfida: aggiungi pulsante all'esp 8 | Sfida finale: pulsante master a 3 livelli |
| v2-cap10-esp1 | Far Girare il Motore | Interruttore invertito (NOT) |
| v2-cap10-esp2 | Invertire la Rotazione | Logica NAND (NOT AND) |
| v2-cap10-esp3 | Motore con Pulsante | Logica NOR (NOT OR) |
| v2-cap10-esp4 | Motore + Pulsante + LED Indicatore | XOR (Exclusive OR) |
| v2-cap12-esp1 | Robot Segui Luce | L'addizionatore binario |
| v2-cap5-esp1 | Batterie in serie (piu spinta!) | Batterie in serie (più spinta!) |
| v2-cap6-esp1 | LED in serie con 1 resistore | Serie e parallelo: primi contatti |
| v2-cap6-esp2 | LED in serie colori diversi | Resistenza e caduta di tensione |
| v2-cap6-esp3 | Tre LED in serie | Resistenze in serie: effetto cumulativo |
| v2-cap6-esp4 | Misurare Vf con il multimetro | Resistenze in parallelo: il percorso alternativo |
| v2-cap7-esp1 | Scarica condensatore con multimetro | Circuiti misti: serie dentro parallelo |
| v2-cap7-esp2 | Scarica condensatore con LED rosso | Misurare corrente in circuiti misti |
| v2-cap7-esp3 | Condensatori in parallelo | Misurare tensione in circuiti misti |
| v2-cap7-esp4 | Variare R nella scarica RC | Challenge: circuito super-complesso |
| v2-cap8-esp1 | MOSFET come interruttore | Il circuito in serie |
| v2-cap8-esp2 | MOSFET e carica del corpo | LED multipli in serie |
| v2-cap8-esp3 | MOSFET + pot + tensione soglia | Circuito parallelo |
| v2-cap9-esp1 | Fototransistor come sensore | Il pulsante accende il LED |
| v2-cap9-esp2 | Luce Notturna Automatica | Logica AND con due pulsanti |
| v3-cap5-esp1 | Blink con LED_BUILTIN | Il primo contatto con gli interruttori |
| v3-cap5-esp2 | Modifica tempi del Blink | Interruttori in serie |
| v3-cap6-esp1 | Circuito AND/OR con pulsanti | Interruttori in parallelo |
| v3-cap6-esp2 | Cambia pin del LED | Porte logiche AND |
| v3-cap6-esp3 | 2 LED alternati | Porte logiche OR |
| v3-cap6-esp4 | Due LED: effetto polizia | Combinare AND e OR |
| v3-cap6-esp5 | Sirena con Buzzer | Encoder binario a 3 bit |
| v3-cap6-esp6 | 2 LED + Pulsante (toggle) | Decoder binario |
| v3-cap6-esp7 | Codice Morse con LED | Modulazione d'ampiezza (AM) |
| v3-cap6-morse | SOS in codice Morse | Codice Morse |
| v3-cap6-semaforo | Semaforo 3 LED | Semaforo intelligente con logica |
| v3-cap7-esp1 | Pulsante accende LED | PWM e modulazione della velocità |
| v3-cap7-esp2 | Pulsante spegne LED | Potenziometro e controllo analogico |
| v3-cap7-esp3 | Pulsante con INPUT_PULLUP | Controllo motore con potenziometro |
| v3-cap7-esp4 | PWM: luminosita variabile | Sensore di temperatura TMP36 |
| v3-cap7-esp5 | Fade LED su e giu | Semaforino termico: if condizionale |
| v3-cap7-esp6 | 2 LED con pulsante (toggle) | Loop for: sequenze automatiche |
| v3-cap7-esp7 | Contatore con LED binario | Knight Rider: sequenza luminosa |
| v3-cap7-esp8 | Anti-rimbalzo pulsante (debounce) | Progetto integrato: stazione meteorologica |
| v3-cap7-mini | Capitolo 7 - Mini progetto: potenziometro ADC + LED PWM | Sfida capstone: sistema di allarme intelligente |
| v3-cap8-esp1 | Serial.println in setup | Resistenze in serie: addizione |
| v3-cap8-esp2 | Serial.println in loop | Resistenze in parallelo: armonia |
| v3-cap8-esp3 | analogRead + Serial Monitor | Circuiti misti: la sfida |
| v3-cap8-esp4 | Serial Plotter con 2 potenziometri | Legge di Ohm: il triangolo magico |
| v3-cap8-esp5 | Pot + 3 LED + Serial Monitor | Predire e misurare: la sfida pratica |
| v3-cap8-serial | Capitolo 8 - Comunicazione seriale: il primo messaggio dal Nano al PC | Potenza e calore: l'energia del circuito |
| v3-extra-lcd-hello | LCD Hello World | Display LCD 16x2: Hello World |
| v3-extra-servo-sweep | Servo Sweep | Servo motore: sweep da 0 a 180 gradi |
| v3-extra-simon | Simon Says — Gioco di Memoria | Gioco Simon: memoria e velocità |


## Gap 4 — Chapter mismatch

| id | lesson-path chapter | Tea chapter |
| --- | --- | --- |
| v3-cap6-esp6 | 7 | 6 |
| v3-extra-lcd-hello | 99 | null |
| v3-extra-servo-sweep | 99 | null |
| v3-extra-simon | 99 | null |


## Gap 5 — Page mismatch (volume-references ↔ Tea narrative_map)

_(nessuno)_


## Gap 6 — Copertura mancante

**Assenti da `lesson-paths/`:** _(nessuno)_

**Assenti da `volume-references.js`** (blocca citazione verbatim PZ-V3 R4): _(nessuno)_

**Assenti da `narrative_metadata_94`:** _(nessuno)_

**Non in alcun `LESSON_GROUP`:** _(nessuno)_

## Gap 7 — ID extra (presenti nel repo, NON nei 94 canonici Tea)

**lesson-paths/:** _(nessuno)_
**capitoli/:** v3-bonus-lcd-hello-esp1, v3-bonus-servo-sweep-esp1, v3-cap9-esp1
**volume-references.js:** _(nessuno)_

## Capstone canonici (next_id=null) — 9

- `v1-cap12-esp4`
- `v1-cap13-esp2`
- `v1-cap14-esp1`
- `v2-cap12-esp1`
- `v2-cap5-esp2`
- `v2-cap7-esp4`
- `v3-cap6-semaforo`
- `v3-cap8-serial`
- `v3-extra-simon`

> Questi richiedono `is_capstone=true` + step `trasferimento` con `next_experiment_id=null` + overlay celebrativo UI invece del banner cliffhanger.

## Tabella completa per-esperimento

| id | LP | Cap | Vref | Meta | Grp | title✓ | chap✓ | next✓ | page✓ | steps | capstone |
|---|---|---|---|---|---|---|---|---|---|---|---|
| v1-cap10-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap10-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap10-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap10-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap10-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap10-esp6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v1-cap11-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap11-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v1-cap12-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap12-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap12-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap12-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v1-cap13-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap13-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v1-cap14-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v1-cap6-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap6-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap6-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap7-esp6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap8-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap8-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap8-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap8-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap8-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v1-cap9-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v1-cap9-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp8 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v1-cap9-esp9 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v2-cap10-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap10-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap10-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap10-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap12-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v2-cap3-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap3-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap3-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap3-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap4-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap4-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap4-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap5-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap5-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v2-cap6-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap6-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap6-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap6-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap7-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap7-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap7-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap7-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v2-cap8-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap8-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap8-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap9-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v2-cap9-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap5-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap5-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap6-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap6-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap6-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap6-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap6-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap6-esp6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |  |
| v3-cap6-esp7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap6-morse | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap6-semaforo | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| v3-cap7-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp6 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap7-esp8 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap7-mini | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap8-esp1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap8-esp2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap8-esp3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap8-esp4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |  |
| v3-cap8-esp5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ |  |
| v3-cap8-serial | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✓ |
| v3-extra-lcd-hello | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |  |
| v3-extra-servo-sweep | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |  |
| v3-extra-simon | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ | ✓ |

---
_ADR-047 · EPIC 1 A2 · gate: Andrea ratifica questo report prima di A3-A7._
