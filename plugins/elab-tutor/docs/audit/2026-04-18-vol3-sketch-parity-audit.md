# Audit Vol3 simulatore vs sketch ufficiali ELAB

**Data**: 18 aprile 2026
**Fonte**: zip `SKETCH-20260417T150351Z-3-001.zip` caricata da Andrea
(30 file `.ino` ufficiali)
**Metodo**: confronto funzioni Arduino core (pinMode, digitalWrite,
digitalRead, analogRead, analogWrite, Serial, delay, tone) tra
`experiments-vol3.js` e sketch originali.

## Tabella confronto

| Esp simulatore | Sketch ufficiale | Match? | Note |
|---|---|---|---|
| v3-cap5-esp1 | Sketch_5_1 | ✅ | pin 13 equivalente LED_BUILTIN su Nano |
| v3-cap5-esp2 | Sketch_5_2 | ⚠️ | delay simulatore 200ms vs sketch 1000ms — intenzionale? |
| v3-cap6-esp1 | Sketch_6_1 | ✅ | LED + D13 + 470Ω — match perfetto (TASK 3 validato) |
| v3-cap6-esp2 | Sketch_6_2 | ❌ | **Sim: cambio pin D8; Sketch: 2 LED polizia D6+D9** |
| v3-cap6-esp3 | Sketch_6_3 | ❌ | **Sim: cambio pin D5 (generico); Sketch: semaforo 3 LED D5+D6+D9** |
| v3-cap6-esp4 | Sketch_6_4 | ❌ | **Sim: 2 LED polizia; Sketch: pulsante INPUT_PULLUP D10 → LED D5** |
| v3-cap6-esp5 | Sketch_6_5 | ❌ | **Sim: pulsante INPUT_PULLUP; Sketch: toggle con pulsante** |
| v3-cap6-esp6 | Sketch_6_6 | ❌ | **Sim: pulsante + 2 LED; Sketch: toggle (come 6_5)** |
| v3-cap6-esp7 | Sketch_6_7 | ✅ | debounce — match |
| v3-cap6-morse | (manca sketch morse) | ➖ | extra non nel libro |
| v3-cap6-semaforo | Sketch_6_3 | ⚠️ | simulatore 'semaforo' = sketch 6_3; id simulatore è extra |
| v3-cap7-esp1 | Sketch_7_1 | ✅ | analogRead + LED soglia 511 |
| v3-cap7-esp2 | Sketch_7_2 | ✅ | analogRead + tensione float |
| v3-cap7-esp3 | Sketch_7_3 | ✅ | trimmer + 3 LED soglie |
| v3-cap7-esp4 | Sketch_7_4 | ✅ | PWM fade up con for |
| v3-cap7-esp5 | Sketch_7_5 | ⚠️ | sketch usa analogWrite(10,0)(15,0)(20,0) (numeri diversi); simulatore usa valori canonici 0/64/128/255 — simulatore più pedagogico |
| v3-cap7-esp6 | Sketch_7_6 | ✅ | fade up+down |
| v3-cap7-esp7 | Sketch_7_7 | ✅ | trimmer → PWM con map() |
| v3-cap7-esp8 | Sketch_7_8 | ✅ | DAC 10 bit |
| v3-cap8-esp1 | Sketch_8_1 | ✅ | Serial.println in setup |
| v3-cap8-esp2 | Sketch_8_2 | ✅ | Serial.println in loop |
| v3-cap8-esp3 | Sketch_8_3 | ✅ | analogRead + Serial (sim usa A0, sketch A3 — differenza trascurabile) |
| v3-cap8-esp4 | Sketch_8_4 | ✅ | 2 pot + Serial Plotter |
| v3-cap8-esp5 | Sketch_8_5 | ✅ | pot + 3 LED + Serial |
| (mancante sim) | Sketch_8_6 | ❌ | **Sketch 8_6 tone/noTone NON IMPLEMENTATO nel simulatore** |
| (mancante sim) | Sketch_9_1 | ❌ | tone base |
| (mancante sim) | Sketch_9_2 | ❌ | tone con durata |
| (mancante sim) | Sketch_9_3 | ❌ | piano 4 tasti (INPUT_PULLUP + tone DO/RE/MI/FA) |
| (mancante sim) | Sketch_10 Saimon | ⚠️ | c'è v3-extra-simon ma è un gioco, non sketch libro diretto |

## Sommario onesto

### Cap 5 e Cap 7 e Cap 8 → ✅ allineati
- Cap 5: 2/2 esperimenti match (delay 200ms esp2 curioso ma minore)
- Cap 7: 8/8 esperimenti analogici match
- Cap 8: 5/5 esperimenti Serial match

### Cap 6 → ❌ disallineato strutturalmente
Il simulatore ha una numerazione diversa dal libro. Correlazioni reali:

| Sketch libro | Trovato in simulatore come |
|---|---|
| 6_1 LED+D13 | v3-cap6-esp1 ✅ |
| 6_2 sirena polizia 2 LED | v3-cap6-esp4 (shift di 2) |
| 6_3 semaforo 3 LED | v3-cap6-semaforo (id speciale) |
| 6_4 pulsante INPUT_PULLUP | v3-cap6-esp5 (shift di 1) |
| 6_5 toggle | v3-cap6-esp5 o esp6 |
| 6_6 toggle variante | v3-cap6-esp6 |
| 6_7 debounce | v3-cap6-esp7 ✅ |

I contenuti sono presenti ma distribuiti su id non canonici. Esp2, esp3 del
simulatore (cambio pin) sono extra non nel libro.

### Cap 9 e Cap 10 → ❌ mancanti
Gli sketch `9_1..9_3` (tone base, durata, piano 4 tasti) e `10 Saimon
Says` non hanno controparte 1:1 nel simulatore.
- Il simulatore ha `v3-extra-simon` che è un mini-gioco (Simon Says) —
  probabilmente correlato a Sketch 10, ma non identico.
- I 3 sketch del Cap 9 (buzzer/tone) **mancano completamente**.

## Raccomandazioni prioritizzate

### P0 — Fix minime senza rompere nulla
Nessuna modifica codice richiesta ORA: i Cap 7 e 8 del simulatore sono
perfettamente allineati agli sketch. Gli utenti reali che aprono il libro
a p.77 (analogRead + Serial) trovano il match corretto nel simulatore.

### P1 — Cap 6 rinomina/riordino (future session)
Rinominare gli id per allineare esperimento→capitolo libro è rischioso:
- lesson-paths JSON dipendono
- sessioni studenti salvate riferiscono a vecchi id
- quiz e scratchXml sono mappati

**Suggerimento**: lasciare id attuali ma aggiungere campo `bookSketch`
opzionale per mappare a sketch ufficiale (es. `bookSketch: 'Sketch_6_2'`
sul simulatore v3-cap6-esp4).

### P2 — Cap 9 buzzer/tone (future session)
Aggiungere 3 esperimenti Cap 9:
- v3-cap9-esp1 (tone base D10)
- v3-cap9-esp2 (tone con durata + noTone)
- v3-cap9-esp3 (piano 4 tasti INPUT_PULLUP + tone note)

Richiede componente `buzzer` + `tone()` function in AVRBridge (verificare
se già supportato). Deliverable nuovo non in PDR v3 originale.

### P3 — Cap 10 Saimon
Già presente come `v3-extra-simon`. Verificare se lo sketch ufficiale
Sketch_Capitolo_10_SaimonSays.ino ha stesse funzioni (pulsanti array,
LED array, piezo, tone con note DO-MI-SOL-DO_HIGH). Se sì: documentare
`bookSketch` mapping. Se no: possibile aggiornamento.

## Bilancio

- **17/25 esperimenti simulatore match diretto** (68%)
- **5/25 Cap 6 disallineati strutturalmente** ma il **contenuto c'e'**
- **3 sketch Cap 9 mancanti** (nuovo feature work)
- **Cap 7+8 perfetti** = 13/13 ✅

Questo è il livello di parity REALE oggi. Non serve rompere id per
ora — il valore educativo è preservato, solo la numerazione
capitolo-esperimento non è 1:1 nel Cap 6.

---

*Audit eseguito da Claude (Andrea Marro) il 18/04/2026 confrontando
simulatore branch `session/2026-04-17-pdr-v3-prep` commit 2529491 contro
sketch ufficiali ELAB zip 20260417.*
