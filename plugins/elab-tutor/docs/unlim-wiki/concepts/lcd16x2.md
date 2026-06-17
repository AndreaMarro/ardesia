---
id: lcd16x2
type: concept
title: "Display LCD 16x2 — mostrare testo con Arduino"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [lcd, display, I2C, LiquidCrystal, testo, output, 16x2, interfaccia]
---

## Definizione

Un **display LCD 16×2** è un modulo a cristalli liquidi che mostra 2 righe di 16 caratteri ciascuna, pilotato da Arduino tramite il bus parallelo a 4-bit (6 pin) oppure tramite adattatore I2C (solo 2 pin: SDA + SCL).

> ⚠️ Fonte: conoscenza generale — nessun match diretto nei volumi ELAB. Per citazioni volume future, verificare Vol.2 e Vol.3 sezioni "output display".

## Analogia per la classe

Ragazzi, pensate al display LCD come a un mini-tabellone da stadio: ha 2 "righe" dove potete scrivere quello che volete — il punteggio, un messaggio, la temperatura. Arduino è il cronometrista che aggiorna il tabellone in tempo reale. Senza di lui, il tabellone rimane vuoto.

## Come funziona fisicamente

Il modulo contiene uno strato di **cristalli liquidi** tra due polarizzatori. Quando una cella riceve tensione, i cristalli ruotano e bloccano la luce → pixel nero (carattere visibile). Senza tensione → pixel trasparente (sfondo chiaro).

Il controller integrato **HD44780** (Hitachi) gestisce internamente i 32 caratteri × 5×8 pixel ciascuno. Arduino deve solo inviare codici ASCII.

### Connessione modalità parallela (4-bit)

```
Arduino Nano      LCD 16x2
-----------       ---------
D12         →     RS  (register select)
D11         →     EN  (enable)
D5          →     D4
D4          →     D5
D3          →     D6
D2          →     D7
5V          →     VSS, A (backlight +)
GND         →     VDD, K (backlight -)
Potenziometro 10kΩ → V0 (contrasto)
```

### Connessione modalità I2C (consigliata con kit Omaric)

```
Arduino Nano      Adattatore I2C PCF8574
-----------       ----------------------
A4 (SDA)    →     SDA
A5 (SCL)    →     SCL
5V          →     VCC
GND         →     GND
```

> Ricordate: il bus I2C richiede **resistenze pull-up 4.7 kΩ** su SDA e SCL — spesso già integrate sull'adattatore I2C del modulo LCD. → vedi [pull-up-resistor.md](pull-up-resistor.md)

### Parametri chiave

| Parametro | Valore |
|---|---|
| Tensione operativa | 5 V DC |
| Corrente backlight | ~20 mA (con resistenza serie) |
| Caratteri per riga | 16 |
| Righe | 2 |
| Controller interno | HD44780 |
| Indirizzo I2C tipico | 0x27 oppure 0x3F (verificare) |
| Corrente totale modulo | ~80 mA max (con backlight) |

## Codice Arduino

### Modalità parallela (libreria LiquidCrystal)

```cpp
#include <LiquidCrystal.h>

// RS, EN, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void setup() {
  lcd.begin(16, 2);         // 16 colonne, 2 righe
  lcd.setCursor(0, 0);      // colonna 0, riga 0
  lcd.print("Ragazzi ciao!");
  lcd.setCursor(0, 1);      // riga 1
  lcd.print("ELAB Tutor");
}

void loop() { }
```

### Modalità I2C (libreria LiquidCrystal_I2C)

```cpp
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// indirizzo 0x27, 16 col, 2 righe
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();          // accende la retroilluminazione
  lcd.setCursor(0, 0);
  lcd.print("Ragazzi ciao!");
  lcd.setCursor(0, 1);
  lcd.print("ELAB Tutor");
}

void loop() { }
```

## Esperimenti correlati

- Display con sensore temperatura/umidità DHT11: cap. sensori analogici Vol.3
- Display come feedback visivo esperimenti LED + pulsante: cap. output digitale
- Contatore con pulsante su display: cap. variabili e contatori Vol.2/Vol.3
- Stazione meteo con LCD: capitolo capstone progetti avanzati

## Errori comuni

1. **Schermo acceso ma nessun testo visibile** — Il contrasto è regolato da un potenziometro da 10 kΩ collegato al pin V0. Se è girato tutto da un lato, i pixel sono invisibili anche se Arduino sta scrivendo correttamente. Ruotate lentamente il potenziometro finché il testo appare.

2. **Indirizzo I2C sbagliato** — Il modulo I2C PCF8574 può avere indirizzo `0x27` oppure `0x3F` a seconda del produttore. Se il display non risponde, usate lo sketch `I2C_Scanner` per trovare l'indirizzo reale prima di procedere.

3. **Manca `lcd.begin()` nel setup** — Senza questa chiamata il display non viene inizializzato. Il testo non appare e nessun errore di compilazione segnala il problema. È una riga obbligatoria.

4. **Testo che "scompare" a loop** — Se chiamate `lcd.print()` nel `loop()` senza `lcd.clear()` o `lcd.setCursor()`, i caratteri si sovrascrivono ma in modo disordinato. Usate sempre `lcd.setCursor(colonna, riga)` prima di scrivere o `lcd.clear()` per pulire tutto.

5. **Backlight sempre spenta in modalità I2C** — In modalità I2C bisogna chiamare esplicitamente `lcd.backlight()` nel `setup()`. Senza questa chiamata il display funziona ma rimane buio.

## Domande tipiche degli studenti

**"Perché ci sono così tanti fili? Non esiste un modo più semplice?"**
Sì! Con l'adattatore I2C bastano solo 4 fili (VCC, GND, SDA, SCL) invece di 10+. Sul kit Omaric trovate l'adattatore I2C già montato sul display — è la versione consigliata.

**"Posso scrivere più di 16 caratteri per riga?"**
No, il display fisico ha esattamente 16 caratteri per riga. Se il vostro testo è più lungo, potete scorrere il testo con `lcd.scrollDisplayLeft()` oppure spezzarlo su due righe gestendo voi il conteggio.

**"Il display consuma molta batteria?"**
La retroilluminazione consuma circa 20 mA — come un LED acceso. Su batterie 9 V da 600 mAh dura ~30 ore. Potete spegnere il backlight con `lcd.noBacklight()` per risparmiare energia quando non serve.

**"Come metto i caratteri speciali tipo la à o la é?"**
Il controller HD44780 ha una tabella ASCII estesa con alcuni caratteri speciali. Per caratteri custom (frecce, simboli) si usano `lcd.createChar()` con bitmap 5×8. È un argomento avanzato per capitoli successivi.

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi (linguaggio diretto, plurale inclusivo)**:

> "Ragazzi, il display LCD è il modo più semplice per far 'parlare' il vostro circuito. Invece di aprire il Serial Monitor sul PC, le informazioni appaiono direttamente sul modulo che tenete in mano — proprio come il display di una calcolatrice o di un microonde."

**Sequenza didattica raccomandata**:
1. Mostrate il modulo fisico LCD: spiegate le 2 righe, i 16 caratteri, il connettore I2C
2. Collegate insieme i 4 fili I2C con la breadboard (2 min con kit Omaric)
3. Caricate lo sketch base con `lcd.print("Ragazzi ciao!")`
4. Mostrate il problema del contrasto: ruotate il potenziometro insieme
5. Fate scrivere agli studenti i propri nomi sul display — esercizio motivante
6. Introdcuete `setCursor()` per posizionare il testo sulla seconda riga

**Sicurezza**:
- Il display usa 5 V: nessun rischio per tensioni sopra la sicurezza
- La backlight ha una resistenza interna di protezione — non collegare direttamente a 5 V senza il modulo completo
- Corrente totale ~80 mA: tenere conto se alimentato da pin 5 V di Arduino (limite 500 mA totale via USB)

**Cosa NON fare**:
- Non collegare pin D4-D7 prima di aver verificato l'alimentazione: un cortocircuito sulle righe dati non brucia il display ma può confondere il controller HD44780 in uno stato bloccato (fix: togliere alimentazione e ricollegare)
- Non fare `lcd.clear()` ad ogni ciclo del loop() se aggiornate spesso: lampeggia visibilmente. Usate `setCursor()` + sovrascrittura con spazi invece

## Link L1 (raw RAG queries)

- `"LCD 16x2 Arduino display LiquidCrystal"`
- `"I2C display testo output Arduino"`
- `"lcd.print setCursor riga colonna"`
- `"HD44780 controller caratteri"`
- `"LiquidCrystal_I2C 0x27 indirizzo"`
- `"display contrasto potenziometro V0"`
- `"lcd backlight I2C Arduino"`
