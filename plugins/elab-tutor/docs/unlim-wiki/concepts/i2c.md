---
id: i2c
type: concept
title: "I2C — far parlare più dispositivi con soli 2 fili"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [i2c, comunicazione, protocollo, sda, scl, lcd, sensori, bus, pull-up, two-wire]
---

## Definizione

**I2C** (Inter-Integrated Circuit, pronuncia "I-quadro-C") è un protocollo di comunicazione seriale sincrono a **2 fili** — SDA (dati) e SCL (clock) — che permette ad Arduino di parlare con display, sensori e altri chip usando un unico bus condiviso.

> Argomento non direttamente trattato nei volumi con pagina dedicata. Contenuto basato su conoscenza generale del protocollo, coerente con l'uso pratico nei kit ELAB (display LCD I2C Vol. 3, sensori ambientali). Vedere esperimenti correlati per i riferimenti ai volumi.

## Analogia per la classe

Ragazzi, immaginate che la classe abbia un solo microfono (il bus I2C) che tutti possono usare. Quando qualcuno vuole parlare (un dispositivo manda dati), chiama prima il nome di chi deve ascoltare — quell'indirizzo unico. Solo quel componente risponde. Il maestro (Arduino, il "master") decide sempre chi può parlare e quando. Così 10 alunni (dispositivi) usano lo stesso microfono senza sovrapporsi, con soli 2 fili invece di 20.

## Come funziona fisicamente

Il bus I2C usa due linee con resistenze **pull-up obbligatorie** (tipicamente 4.7 kΩ a 5 V):

```
  Arduino Nano
  ┌──────────────┐
  │  A4 (SDA) ───┼────┬──── SDA dispositivo 1
  │  A5 (SCL) ───┼──┬─┼──── SCL dispositivo 1
  └──────────────┘  │ │
                    │ └──── SCL dispositivo 2
                    └────── SDA dispositivo 2
                    │
                  [4.7kΩ pull-up a 5 V su SDA e SCL]
```

**Pin Arduino Nano dedicati I2C**:

| Pin | Segnale | Colore cavo convenzionale |
|-----|---------|--------------------------|
| A4  | SDA     | Bianco / Blu             |
| A5  | SCL     | Giallo / Verde           |

**Velocità standard**:

| Modalità | Frequenza | Uso tipico |
|----------|-----------|-----------|
| Standard | 100 kHz   | LCD, sensori base |
| Fast     | 400 kHz   | Sensori rapidi, EEPROM |

Ogni dispositivo ha un **indirizzo a 7 bit** univoco (es. `0x27` per molti LCD I2C, `0x68` per MPU-6050). Si possono collegare fino a 127 dispositivi sullo stesso bus.

**Struttura di un messaggio I2C**:
```
START → [INDIRIZZO 7-bit] + [R/W] → ACK → [DATI] → ACK → STOP
```

## Codice Arduino (sketch base)

```cpp
#include <Wire.h>          // libreria I2C inclusa in Arduino IDE

void setup() {
  Wire.begin();            // Arduino diventa master I2C
  Serial.begin(9600);
}

void loop() {
  Wire.beginTransmission(0x27);  // indirizzo LCD I2C
  Wire.write('A');               // manda un byte
  Wire.endTransmission();        // manda STOP bit
  delay(500);
}
```

Per scansionare tutti i dispositivi collegati al bus:

```cpp
#include <Wire.h>
void setup() {
  Wire.begin();
  Serial.begin(9600);
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Ragazzi, trovato dispositivo I2C a: 0x");
      Serial.println(addr, HEX);
    }
  }
}
void loop() {}
```

## Esperimenti correlati

- **LCD 16×2 con modulo I2C** (Cap. Vol. 3 — display): il modulo PCF8574 converte il bus LCD parallelo a 4 fili in I2C. Indirizzo default `0x27`. Vedere → [lcd16x2.md](lcd16x2.md)
- **Sensore di temperatura/umidità I2C**: alcuni kit avanzati ELAB includono sensori con bus I2C (es. SHT31 `0x44`)
- **Pull-up resistenza** (obbligatoria per I2C): → [pull-up-resistor.md](pull-up-resistor.md)

## Errori comuni

1. **Pull-up mancanti su SDA/SCL** — I2C RICHIEDE resistenze pull-up esterne da 4.7 kΩ sia su SDA che su SCL. Senza di esse i dispositivi non comunicano affatto e il bus rimane sempre LOW. Errore silenzioso difficile da diagnosticare: `Wire.endTransmission()` restituisce codice errore 2 (NACK).

2. **Indirizzo sbagliato** — Ogni dispositivo ha un indirizzo fisso o configurabile con ponticelli (A0/A1/A2). Se l'indirizzo nel codice non corrisponde, `Wire.endTransmission()` restituisce 2 (nessun ACK). Usare lo sketch scanner per scoprire l'indirizzo reale.

3. **Due dispositivi con lo stesso indirizzo** — Non si possono collegare 2 LCD con lo stesso indirizzo `0x27` sullo stesso bus. Uno dei due va configurato su `0x26` o `0x25` (ponticelli A0-A2 sul modulo PCF8574). Sul bus, un solo indirizzo = un solo dispositivo.

4. **Fili SDA/SCL invertiti** — Il bus non funziona se SDA e SCL sono scambiati. Controllare sempre: A4 → SDA (dati), A5 → SCL (clock). Con un multimetro: SCL oscilla a frequenza durante la trasmissione, SDA varia.

5. **Cavi troppo lunghi senza terminazione** — Oltre ~1 metro il segnale I2C degrada. Per distanze maggiori usare I2C bus extender o SPI. Nel kit ELAB i collegamenti sono corti (< 30 cm sulla breadboard) quindi non è un problema.

## Domande tipiche degli studenti

**"Perché serve una libreria `Wire.h` e non basta `digitalWrite`?"**
Perché I2C ha un protocollo complesso: bit di START, indirizzo, bit di ACK, bit di STOP — tutto sincronizzato con il clock. `Wire.h` gestisce questa sequenza automaticamente. Con `digitalWrite` manuale ci vorrebbero 50+ righe di codice per un singolo byte.

**"Quanti dispositivi posso collegare contemporaneamente?"**
Teoricamente 127 dispositivi sullo stesso bus I2C, ma in pratica il limite è la capacità del bus (aumentando dispositivi cresce la capacità parassita). Con 4-8 dispositivi il bus standard da 100 kHz funziona perfettamente sul kit ELAB.

**"SDA e SCL vanno collegati anche a GND?"**
SDA e SCL NON vanno a GND: vanno a 5 V tramite le resistenze pull-up, e poi ai pin A4/A5 di Arduino. GND è condiviso tra Arduino e tutti i dispositivi I2C (filo nero comune).

**"Come faccio a sapere l'indirizzo del mio sensore?"**
Due modi: (1) cerca sul datasheet o sull'etichetta del modulo; (2) carica lo sketch I2C Scanner (cerca "Arduino I2C Scanner" su Arduino IDE esempi) — stampa sul Monitor Seriale tutti gli indirizzi trovati sul bus.

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi (analogia microfono)**:

> "Ragazzi, con I2C possiamo collegare display, sensori e altri chip usando solo 2 fili invece di 8 o 16. Arduino fa da 'direttore d'orchestra': chiama per nome ogni strumento (indirizzo I2C) e solo quello risponde. Questo è come funzionano i sensori moderni dentro i telefoni e le auto."

**Sequenza didattica raccomandata**:
1. Mostrate un LCD I2C collegato a solo 4 fili (VCC, GND, SDA, SCL) vs un LCD parallelo con 12 fili — l'impatto visivo convince
2. Caricate lo sketch Scanner: mostra l'indirizzo `0x27` sul Monitor Seriale — "Arduino ha trovato il display!"
3. Aggiungete un secondo dispositivo I2C (es. sensore): lo Scanner trova entrambi gli indirizzi
4. Mostrate cosa succede senza pull-up (sketch non trova nulla) → aggiungete 4.7 kΩ → tutto torna
5. Collegate al display: `lcd.print("Ragazzi!")` — messaggio visibile sulla LIM

**Sicurezza**:
- Tensione massima SDA/SCL: 5 V (pin Arduino 5 V safe, NON usare moduli da 3.3 V senza level-shifter)
- Nessun rischio di cortocircuito: le pull-up limitano la corrente a ≈ 1 mA anche in caso di conflitto bus
- Prima di collegare un nuovo dispositivo I2C: verificare sempre che lavori a 5 V (moduli display ELAB sì, alcuni sensori moderni solo 3.3 V)

**Cosa NON fare**:
- Non dite "collegare i2c è complicato" — con Wire.h è tra i protocolli più semplici
- Non saltate la spiegazione dell'indirizzo: i ragazzi devono capire che `0x27` non è magia, è un numero scritto sul chip del modulo
- Non dimenticate le pull-up: senza di esse il bus sembra "rotto" senza errori evidenti

## Link L1 (raw RAG queries)

- `"I2C protocollo SDA SCL Arduino"`
- `"Wire.h begin transmission indirizzo"`
- `"I2C pull-up 4.7k resistenza bus"`
- `"LCD display I2C PCF8574 0x27"`
- `"I2C scanner indirizzo dispositivo"`
- `"I2C Two Wire Interface sensori"`
- `"Wire beginTransmission endTransmission"`
