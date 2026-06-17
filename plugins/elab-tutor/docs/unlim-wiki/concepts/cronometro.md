---
id: cronometro
type: concept
title: "Cronometro — misurare il tempo con millis()"
locale: it
volume_ref: 3
pagina_ref: ~88
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [cronometro, millis, timer, unsigned-long, pulsante, lcd, serial-monitor, variabili, overflow, progetto, arduino, timing, misura-tempo, start-stop]
---

## Definizione

Un cronometro è un programma Arduino che misura il tempo trascorso tra due eventi — di solito la pressione di un pulsante START e di un pulsante STOP — usando la funzione `millis()`, che restituisce quanti millisecondi sono passati da quando Arduino si è acceso. Vol. 3 pag. ~88 lo presenta nella sezione Extra come "il progetto che vi fa capire davvero come Arduino tiene il tempo, senza star fermo ad aspettare come fa `delay()`".

## Analogia per la classe

Ragazzi, immaginate un cronometrista alle Olimpiadi: tiene in mano un orologio che non si ferma mai — continua a girare dall'accensione in poi. Quando l'atleta parte, il cronometrista guarda il quadrante e annota il numero. Quando l'atleta arriva, lo guarda di nuovo e fa la differenza. Il vostro Arduino fa esattamente lo stesso: `millis()` è l'orologio che non si ferma mai; voi salvate il valore quando premete START, lo rileggete quando premete STOP, e la differenza è il tempo che è passato.

## Cosa succede fisicamente

### Come funziona millis()

`millis()` è un contatore hardware che Arduino aggiorna ogni millisecondo grazie al suo timer interno (Timer0, 16 MHz con prescaler). Restituisce un numero intero senza segno a 32 bit (`unsigned long`), che può contare fino a circa **49 giorni** prima di ricominciare da zero (overflow).

```
tempo_trascorso = millis_stop - millis_start
```

Questa sottrazione funziona **anche** in caso di overflow perché l'aritmetica modulare su `unsigned long` mantiene il risultato corretto — purché il tempo misurato sia inferiore a 49 giorni.

### Schema circuito con due pulsanti

| Componente     | Pin Arduino | Note                        |
|----------------|-------------|-----------------------------|
| Pulsante START | D2          | INPUT_PULLUP (lato HIGH)    |
| Pulsante STOP  | D3          | INPUT_PULLUP (lato HIGH)    |
| LED rosso      | D8          | 220 Ω serie, segnala "in corsa" |
| LCD 16x2 (opt) | D12-D4      | LiquidCrystal, mostra secondi  |

> Con `INPUT_PULLUP` i pulsanti leggono HIGH a riposo e LOW quando premuti — nessuna resistenza esterna necessaria.

### Codice Cronometro base (Serial Monitor)

```cpp
unsigned long tempoStart = 0;
unsigned long tempoStop  = 0;
bool inCorsa = false;

void setup() {
  Serial.begin(9600);
  pinMode(2, INPUT_PULLUP);  // START
  pinMode(3, INPUT_PULLUP);  // STOP
  pinMode(8, OUTPUT);        // LED "in corsa"
}

void loop() {
  // Pulsante START (LOW = premuto con INPUT_PULLUP)
  if (digitalRead(2) == LOW && !inCorsa) {
    tempoStart = millis();
    inCorsa = true;
    digitalWrite(8, HIGH);          // LED acceso
    Serial.println("-- START --");
    delay(200);                     // debounce semplice
  }

  // Pulsante STOP
  if (digitalRead(3) == LOW && inCorsa) {
    tempoStop = millis();
    inCorsa = false;
    digitalWrite(8, LOW);           // LED spento
    unsigned long durata = tempoStop - tempoStart;
    Serial.print("Tempo: ");
    Serial.print(durata / 1000.0, 2);  // secondi con 2 decimali
    Serial.println(" s");
    delay(200);                     // debounce semplice
  }
}
```

### Tabella conversioni tempo millis

| Valore millis() | Tempo reale   | Caso d'uso tipico          |
|-----------------|---------------|---------------------------|
| 100             | 0.1 s         | Reazione umana molto veloce |
| 1 000           | 1 s           | Reazione media             |
| 10 000          | 10 s          | Sprint breve               |
| 60 000          | 1 min         | Esercizi lunghi            |
| 4 294 967 295   | ~49.7 giorni  | Overflow `unsigned long`  |

### Formula conversione ms → secondi con decimali

```
secondi = millis_delta / 1000.0
```

Il `.0` forza la divisione in virgola mobile (`float`): senza di esso, `durata / 1000` farebbe divisione intera e troncherebbe i decimali (es. 1850 ms → 1 invece di 1.85).

### Upgrade con LCD (variante Vol.3 Extra)

```cpp
#include <LiquidCrystal.h>
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// Nella loop(), dopo aver calcolato durata:
lcd.clear();
lcd.setCursor(0, 0);
lcd.print("Tempo:");
lcd.setCursor(0, 1);
lcd.print(durata / 1000.0, 2);
lcd.print(" s");
```

Il codice LCD si aggiunge sopra al codice base: `millis()` lavora uguale, cambia solo come mostrare il risultato.

## Esperimenti correlati

- Vol. 3 pag. ~88 — Cronometro (questo progetto, sezione Extra)
- [concepts/delay-millis.md](delay-millis.md) — differenza `delay()` vs `millis()`, blocking vs non-blocking
- [concepts/pulsante.md](pulsante.md) — `digitalRead()`, INPUT_PULLUP, debounce
- [concepts/lcd-display.md](lcd-display.md) — `LiquidCrystal`, `lcd.print()`, `lcd.setCursor()`
- [concepts/variabili-arduino.md](variabili-arduino.md) — `unsigned long`, perché non usare `int` per millis()
- [concepts/semaforo.md](semaforo.md) — primo progetto con timing, prerequisito consigliato

## Errori comuni

1. **Variabile `millis()` dichiarata come `int` invece di `unsigned long`** — `int` su Arduino è 16 bit con massimo 32 767: `millis()` supera quel valore in 32 secondi e il contatore va in overflow negativo. Usate **sempre** `unsigned long` per memorizzare valori di `millis()`.

2. **Il cronometro parte da solo senza premere START** — Con `INPUT_PULLUP`, il pin legge HIGH a riposo e LOW quando premuto. Se usate `if (digitalRead(pin) == HIGH)` invece di `== LOW`, il cronometro si avvia non appena la scheda si accende. Ricordate: **pullup → premuto = LOW**.

3. **Il tempo mostrato è in millisecondi invece di secondi** — Avete stampato `durata` invece di `durata / 1000.0`. Aggiungete la divisione e il `.0` per ottenere secondi con decimali.

4. **Il cronometro si riavvia da solo più volte al secondo** — Manca il debounce: il pulsante rimbalza e Arduino legge decine di pressioni in pochi millisecondi. Soluzione semplice: `delay(200)` dopo aver rilevato la pressione. Soluzione avanzata: leggere il fronte (LOW precedente → LOW attuale solo al primo ciclo) con una variabile `bool statoPrec`.

5. **Con LCD il display mostra numeri che si sovrappongono** — Manca `lcd.clear()` prima di scrivere il nuovo valore. Alternativa più fluida: `lcd.setCursor(0,1)` senza clear (evita il lampeggio) e scrivere un numero con spazi extra per coprire i vecchi caratteri (es. `lcd.print(sec, 2); lcd.print("   ");`).

## Domande tipiche degli studenti

**"Perché usiamo `millis()` invece di `delay()` per il cronometro?"**
Con `delay(1000)` Arduino si ferma un secondo intero e non sente niente — né pulsanti, né sensori. Con `millis()` il programma gira continuamente nel `loop()` e può rispondere subito a qualsiasi evento. Il cronometro funzionerebbe anche con `delay()`, ma non potreste mai aggiungere un pulsante STOP che risponde in tempo reale: Arduino sarebbe "addormentato" durante il delay.

**"Cosa succede se `millis()` arriva a 49 giorni e riparte da zero?"**
La sottrazione `millis_stop - millis_start` su `unsigned long` dà comunque il risultato corretto grazie all'aritmetica modulare (wraparound). Esempio: se `start = 4 294 960 000` e dopo 10 000 ms arriva `stop = 7 705` (già ripartito), `7705 - 4 294 960 000` in `unsigned long` fa `10 001` — corretto. Per misure di secondi o minuti non dovete preoccuparvi.

**"Posso fare un cronometro che mostra il tempo in tempo reale (mentre corre) invece di mostrarlo solo allo STOP?"**
Sì: nel `loop()`, se `inCorsa == true`, calcolate `unsigned long corrente = millis() - tempoStart` e stampate ogni, diciamo, 100 ms usando un secondo `millis()` come timer di aggiornamento display. Questo è il pattern "millis per timer multipli" — il passo successivo dopo aver capito il cronometro base.

**"Perché il tempo mostrato ha sempre gli stessi due decimali (es. 1.85 s) ma non cambia cifra per cifra?"**
La precisione di `millis()` è 1 ms (Arduino a 16 MHz), quindi il terzo decimale esiste ma cambia ogni millisecondo — troppo veloce da leggere. Due decimali (centesimi di secondo, come uno stop-watch vero) sono la scelta giusta per la leggibilità umana.

## PRINCIPIO ZERO

### Sicurezza

- Tutte le tensioni in gioco sono **5 V DC da Arduino** o **9 V DC dalla batteria ELAB** — sicure per i ragazzi con i kit fisici.
- `INPUT_PULLUP` non richiede resistenze esterne per i pulsanti: la resistenza interna da ~47 kΩ protegge già il pin. **Non aggiungete resistenze pull-down esterne** se usate `INPUT_PULLUP`: darebbe una rete divisore e il pin fluttuerebbe.
- Il LED indicatore su D8 richiede la solita **resistenza da 220 Ω**: senza di essa il pin eroga corrente oltre il limite e si danneggia.

### Narrativa per la classe

Il cronometro è il progetto in cui capiamo che Arduino non "dorme" mai: anche quando non sta facendo niente di visibile, il suo timer interno conta incessantemente i millisecondi dall'accensione. `millis()` è come il polso di Arduino — batte sempre, 1 000 volte al secondo, che voi lo stiate leggendo o no. Salvare quel valore nel momento preciso in cui volete "fermare il tempo" è la stessa cosa che fa un atleta quando segna l'ora di partenza sul foglio. La differenza dal semaforo, dove abbiamo usato `delay()`, è profonda: là Arduino si fermava e aspettava passivamente; qui resta sempre sveglio e può reagire a qualsiasi evento in qualsiasi momento. Questo principio — *non bloccare il programma* — è alla base di quasi tutto il codice Arduino professionale.

### Cosa dire ai ragazzi

- *"Prima di caricare il codice: secondo voi, quando premete START, Arduino "parte" o "ricorda un numero"? Qual è la differenza?"* (Risposta attesa: ricorda il numero — `millis()` stava già girando, Arduino nota solo il valore in quel momento.)
- *"Proviamo a misurare il vostro tempo di reazione: io dico GO, voi premete START e STOP il più velocemente possibile. Quanto fate? La media umana è 150-250 ms."*
- *"Se cambiamo `unsigned long` in `int` cosa succede? Proviamo!"* — dopo 32 secondi il Serial Monitor mostrerà numeri negativi o caotici: errore di overflow reale, visibile in classe.
- Citate **Vol. 3 pag. ~88** quando mostrate il codice sulla LIM.
- Mostrate il Serial Monitor mentre il cronometro gira: far vedere i numeri che cambiano in tempo reale rende concreto il concetto di "millis() non si ferma mai".

### Progressione didattica consigliata (5 passi)

1. Richiamare il Semaforo (già fatto) → *"lì avevamo `delay()` che bloccava tutto — oggi usiamo `millis()` che non blocca nulla"*
2. Spiegare `millis()` con l'analogia del cronometrista: orologio che gira sempre, noi annotiamo i numeri
3. Cablare un solo pulsante START su D2 con `INPUT_PULLUP` + LED su D8 — verificare che il LED si accenda alla pressione
4. Caricare il codice base e misurare qualcosa di concreto (tempo di reazione, tempo per alzarsi e sedersi, ecc.)
5. Sfida aperta: *"Come fareste per aggiungere un pulsante RESET che azzera il cronometro senza spegnere Arduino? Quali variabili cambiate?"*

## Link L1 (raw RAG queries)

Questi termini trovano i chunk rilevanti in `src/data/rag-chunks.json`:

- `"millis() cronometro tempo elapsed Arduino"`
- `"unsigned long millis overflow timer"`
- `"digitalRead INPUT_PULLUP pulsante cronometro"`
- `"millis() vs delay() non-blocking timer"`
- `"lcd.print millis secondi display cronometro"`
- `"millis tempo reazione stop watch Arduino Nano"`
