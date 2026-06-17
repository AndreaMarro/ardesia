---
id: rfid-mfrc522
type: concept
title: "RFID MFRC522 — lettura tessere senza contatto"
locale: it
volume_ref: 3
pagina_ref: 270
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [rfid, mfrc522, sicurezza, badge, vol3, capstone]
---

## Definizione

Il **MFRC522** è un lettore RFID 13.56 MHz che riconosce tessere/badge senza contatto. Vol. 3 pag. 270 introduce: "MFRC522 è il sensore badge della scuola — leggi il chip dentro la tessera senza toccare nulla, e riconosci chi è. Funziona come metro 1-2 cm".

Pinout SPI (8 pin):
- **VCC** — 3.3V (NON 5V — danneggiato)
- **GND** — massa
- **MOSI** — Arduino D11
- **MISO** — Arduino D12
- **SCK** — Arduino D13
- **SDA/SS** — Arduino D10 (Chip Select)
- **RST** — Arduino D9 (reset)
- **IRQ** — interrupt opzionale (skip)

## Schema collegamento

```
Arduino     MFRC522
  3.3V ───→ VCC  ⚠️ NON 5V !!
  GND  ───→ GND
  D11  ───→ MOSI
  D12  ←── MISO
  D13  ───→ SCK
  D10  ───→ SDA/SS
  D9   ───→ RST
```

**ATTENZIONE**: 3.3V solo. 5V brucia il chip immediatamente.

## Codice Arduino libreria MFRC522

```cpp
#include <SPI.h>
#include <MFRC522.h>

const int RST_PIN = 9;
const int SS_PIN = 10;

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Avvicina tessera al lettore...");
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  Serial.print("UID tessera: ");
  for (int i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
  }
  Serial.println();

  mfrc522.PICC_HaltA();
}
```

UID = identificatore unico tessera (4-7 byte). Ogni badge ha UID DIVERSO.

## Esempio Vol. 3 — sistema accesso

```cpp
const byte BADGE_AUTORIZZATI[][4] = {
  {0xDE, 0xAD, 0xBE, 0xEF},  // tessera Andrea
  {0xCA, 0xFE, 0xBA, 0xBE},  // tessera Maria
};
const int N_AUTORIZZATI = 2;

const int LED_VERDE = 5, LED_ROSSO = 6, BUZZER = 7;

bool autorizza(byte *uid) {
  for (int i = 0; i < N_AUTORIZZATI; i++) {
    bool match = true;
    for (int j = 0; j < 4; j++) {
      if (uid[j] != BADGE_AUTORIZZATI[i][j]) { match = false; break; }
    }
    if (match) return true;
  }
  return false;
}

void loop() {
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) return;

  if (autorizza(mfrc522.uid.uidByte)) {
    digitalWrite(LED_VERDE, HIGH);
    tone(BUZZER, 2000, 200);
    Serial.println("ACCESSO AUTORIZZATO");
  } else {
    digitalWrite(LED_ROSSO, HIGH);
    tone(BUZZER, 200, 1000);
    Serial.println("ACCESSO NEGATO");
  }
  delay(2000);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_ROSSO, LOW);
  mfrc522.PICC_HaltA();
}
```

Vol. 3 pag. 273 estende: aggiungi servo per "porta motorizzata" + log accessi su SD card.

## Tessere/badge supportati

- **MIFARE Classic 1K/4K** — standard kit ELAB (carte/portachiavi)
- **MIFARE Ultralight** — biglietti
- **NFC type 2** — alcuni smartphone (read-only modo passivo)
- **Tessera sanitaria** — NO (frequenza diversa)
- **Bancomat/credit card** — NO (security NFC enhanced, no UID semplice)

Distance read: 2-5 cm tipico, max 10 cm con antenna potenziata.

## Errori comuni

1. **5V invece di 3.3V** — Brucia chip in pochi secondi. Sintomo: lettura sempre 0 dopo prima volta. Verificare con multimetro VCC = 3.3V.

2. **Pin SPI sbagliati** — MFRC522 usa SPI hardware Arduino. MOSI=11, MISO=12, SCK=13 NON modificabili. SS/RST possono variare.

3. **MFRC522.h libreria non installata** — Cerca "MFRC522" by Miguel Balboa, install Arduino IDE.

4. **PCD_Init() fail silent** — Se VCC mancante o pin sbagliato, `PCD_Init()` non genera errore visibile. Test: `mfrc522.PCD_DumpVersionToSerial()` mostra "v1.0" o "v2.0" se OK, "0xFF / unknown" se fail.

5. **UID non match nel codice** — Stamp UID Serial → copia EXACT bytes hex → paste nel codice come `{0xXX, 0xXX, 0xXX, 0xXX}`.

6. **Multiple cards in range** — MFRC522 legge 1 alla volta. Se 2 badge vicini → lettura inconsistente. Distanziare ≥3 cm.

## Esperimenti correlati

- **Vol. 3 pag. 270** — Primo MFRC522: leggi UID Serial Monitor
- **Vol. 3 pag. 273** — Sistema accesso badge + LED + buzzer + servo porta
- **Vol. 3 pag. 276** — Log accessi SD card timestamp
- **Vol. 3 pag. 280** — Capstone: timbro presenze classe (badge × 30 alunni + CSV export)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 270):
> "MFRC522 è il sensore badge della scuola — leggi il chip dentro la tessera senza toccare nulla, e riconosci chi è. Funziona come metro 1-2 cm."

**Cosa fare:**
- Vol. 3 pag. 270 raccomanda di insegnare MFRC522 DOPO SPI basics + array
- Esperimento iconic: ragazzi avvicinano la PROPRIA tessera (mensa, biblioteca) → Arduino legge UID. Magia "wireless"
- Sistema accesso autorizza/nega: ragazzi capiscono subito utility (porta classe, accesso laboratorio)
- Privacy explicit: "Arduino legge SOLO il numero UID, NON i dati personali della tessera". Tranquillizza ragazzi
- Vol. 3 raccomanda di ATTENZIONE 3.3V — un errore brucia chip e progetto kaput

**Sicurezza:**
- 3.3V solo (NON 5V) — regola immutabile.
- Distanze < 10 cm massimo, frequency 13.56 MHz inoffensiva.
- UID NON è private data — è un numero pubblico stampato visibile su molti badge.
- **NON** progettare sistemi accesso real-world (porte casa) — sicurezza inadeguata vs cloning attacks.

**Cosa NON fare:**
- Non insegnate MFRC522 prima di SPI + array — concetti dipendenti.
- Non aspettatevi lettura tessere bancomat — security NFC più strong.
- Non collegate VCC a 5V — chip distrutto, progetto fermo.

## Link L1 (raw RAG queries)

- `"MFRC522 RFID Arduino lettura UID"`
- `"MIFARE Classic 1K tessera scuola"`
- `"sistema accesso badge LED servo"`
- `"3.3V solo MFRC522 NON 5V"`
- `"timbro presenze classe badge SD card"`
