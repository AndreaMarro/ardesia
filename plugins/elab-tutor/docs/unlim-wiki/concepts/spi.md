---
id: spi
type: concept
title: "SPI — Serial Peripheral Interface"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: claude-sonnet-4-6
tags: [spi, protocollo, comunicazione, seriale, mosi, miso, sck, cs, avanzato]
---

## Definizione

**SPI** (Serial Peripheral Interface) è un protocollo di comunicazione digitale che permette ad Arduino di "parlare" con sensori, display e moduli usando 4 fili. È più veloce di I2C ma usa più pin. Nei kit ELAB lo trovate ogni volta che collegate una SD card, un modulo RFID MFRC522 o un display TFT.

> [nota generale — non presente nei volumi estratti]: SPI fu inventato da Motorola negli anni '80 e oggi è lo standard per comunicazioni veloci a corto raggio su circuiti embedded.

## Analogia per la classe

Ragazzi, immaginate una conversazione a due canali separati: uno per parlare verso di voi, uno per ascoltarvi. In SPI esistono esattamente due "fili voce": uno porta i dati DA Arduino AL dispositivo (**MOSI**), l'altro porta i dati DAL dispositivo VERSO Arduino (**MISO**). Un terzo filo batte il tempo come un metronomo (**SCK**), e un quarto filo dice "ehi, sto parlando proprio con te!" (**CS**). Ragazzi, è come fare telefonate su due cuffie separate invece di urlare tutti insieme — nessuna confusione!

## Come funziona fisicamente

SPI è **sincrono e full-duplex**: Arduino invia e riceve allo stesso tempo, sincronizzati da un clock comune.

### I 4 fili SPI — Arduino Nano

| Pin Arduino | Sigla | Nome completo | Direzione |
|-------------|-------|---------------|-----------|
| D11 | MOSI | Master Out, Slave In | Arduino → dispositivo |
| D12 | MISO | Master In, Slave Out | dispositivo → Arduino |
| D13 | SCK | Serial Clock | Arduino → dispositivo |
| D10 | CS/SS | Chip Select / Slave Select | Arduino → dispositivo |

> [nota generale]: `D13` è anche il pin del LED integrato sul Nano. Quando SPI è attivo, il LED lampeggia involontariamente — comportamento normale, non un guasto.

### Confronto SPI vs I2C

| Caratteristica | SPI | I2C |
|----------------|-----|-----|
| Pin richiesti | 4 (+ 1 CS per device extra) | 2 (SDA + SCL) |
| Velocità tipica | 1–50 MHz | 100–400 kHz |
| Full-duplex | ✓ Sì | ✗ No |
| Indirizzi | No — 1 CS pin per device | Sì — fino a 127 dispositivi |
| Pull-up richiesti | No | Sì (4,7 kΩ su SDA e SCL) |
| Uso kit ELAB | SD card, RFID, display TFT | LCD I2C, RTC, MPU6050 |

### Schema collegamento tipico (SD card)

```
Arduino Nano   →   Modulo SD card
     5V        →   VCC
    GND        →   GND
    D11        →   MOSI
    D12        ←   MISO
    D13        →   SCK
    D10        →   CS
```

### Codice base Arduino

```cpp
#include <SPI.h>

const int CS_PIN = 10;

void setup() {
  SPI.begin();                    // avvia il bus SPI (D11/D12/D13)
  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, LOW);      // seleziona il dispositivo

  byte risposta = SPI.transfer(0x9F);   // invia 0x9F, riceve risposta

  digitalWrite(CS_PIN, HIGH);     // deseleziona il dispositivo
}

void loop() {}
```

> Regola fondamentale: `CS LOW` = sto parlando con questo dispositivo. `CS HIGH` = fine trasmissione, dispositivo libero.

## Esperimenti correlati

- **SD card datalogger** — usa SPI per leggere/scrivere file CSV su microSD → vedi `sd-card-spi.md`
- **RFID MFRC522** — legge tag e badge via SPI → vedi `rfid-mfrc522.md`
- **Matrice LED 8×8 MAX7219** — controlla 64 LED via SPI shift register → vedi `matrice-led-8x8.md`
- **I2C e SPI a confronto** — vedi `i2c-spi.md` per esperimenti paralleli Vol. 3

## Errori comuni

1. **CS non gestito manualmente** — `SPI.begin()` avvia il bus ma NON seleziona nessun dispositivo. Servono sempre `pinMode(CS, OUTPUT)` + `digitalWrite(CS, LOW/HIGH)`. Sintomo: nessuna risposta dal dispositivo.

2. **D13 / LED built-in interferisce** — SCK su D13 fa lampeggiare il LED integrato durante trasmissioni SPI. Non è un errore, è il comportamento atteso. Non usare `digitalWrite(13,...)` mentre SPI è attivo.

3. **Cavi troppo lunghi** — SPI è progettato per distanze brevi (≤ 30 cm). Cavi più lunghi corrompono il segnale clock ad alta frequenza. Se il dispositivo risponde in modo casuale, accorciate i cavi.

4. **Velocità SPI incompatibile** — alcuni moduli funzionano solo a basse velocità. Usate `SPI.setClockDivider(SPI_CLOCK_DIV16)` per rallentare se il dispositivo non risponde correttamente.

5. **Due dispositivi SPI senza CS separati** — se collegate due moduli SPI sullo stesso bus (MOSI/MISO/SCK condivisi), ognuno DEVE avere il proprio pin CS dedicato. Senza distinzione CS, entrambi ricevono tutti i comandi contemporaneamente → collisione dati.

## Domande tipiche degli studenti

**"Perché si chiama 'Master' e 'Slave'?"**
Arduino è il "Master" perché controlla il clock (SCK) e decide quando iniziare la comunicazione. Il sensore o modulo è lo "Slave" perché aspetta e risponde solo quando viene interpellato dal suo pin CS.

**"Posso collegare più dispositivi SPI insieme?"**
Sì! MOSI, MISO e SCK si condividono tra tutti i dispositivi. Ma ogni dispositivo ha bisogno del proprio pin CS separato. Con 3 dispositivi servono 3 pin CS (es. D10, D9, D8).

**"SPI è meglio di I2C?"**
Dipende. SPI è più veloce e full-duplex, ma usa più pin. I2C usa solo 2 pin e può gestire tanti dispositivi con indirizzi diversi. Nel kit ELAB: SD card e RFID usano SPI perché hanno bisogno di velocità. LCD e RTC usano I2C perché il risparmio di pin vale più della velocità.

**"Cosa succede se dimentico il 'CS HIGH' alla fine?"**
Il dispositivo rimane "selezionato" e continua ad ascoltare il bus SPI. Se poi comunicate con un altro dispositivo SPI, quello "bloccato" potrebbe interpretare dati non suoi e rispondere in modo imprevedibile. Sempre `CS HIGH` dopo ogni trasmissione!

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (linguaggio Vol. 3 narrativo inclusivo):

> Ragazzi, SPI sembra complicato ma in realtà è la stessa cosa che fate quando parlate per walkie-talkie: uno parla, l'altro ascolta, e poi si invertono. Il "canale" è il filo MOSI/MISO, il "cambio turno" è il clock SCK, e il "chiamo proprio te" è il pin CS. Quando collegate la SD card sul kit fisico, state usando esattamente questo protocollo — Arduino e la SD card si "parlano" 10 milioni di volte al secondo!

**Cosa fare in classe:**
- Mostrate sul simulatore ELAB i 4 fili SPI evidenziati con colori diversi prima di costruire il circuito fisico sul kit
- Confrontate il pinout SD card stampato sul modulo con la tabella MOSI/MISO/SCK/CS — riconoscere le etichette fisiche costruisce comprensione
- Usate il Serial Monitor per stampare la risposta SPI del modulo: vedere byte esadecimali reali rende astratto il protocollo

**Sicurezza:**
- SPI lavora a 5V logici (Arduino Nano). Alcuni moduli moderni sono 3,3V. Controllate sempre il datasheet o la serigrafia sul modulo — collegare 5V a un pin 3,3V può danneggiare il modulo permanentemente
- CS floating (non collegato) può attivare il dispositivo involontariamente — collegare sempre CS a un pin OUTPUT definito

**Cosa NON fare:**
- Non insegnate SPI prima che i ragazzi abbiano capito `digitalRead/digitalWrite` e il concetto di pin OUTPUT — è un prerequisito indispensabile
- Non lasciare CS non collegato o floating — comportamento imprevedibile
- Non usare cavi jumper lunghi per SPI — degradano il segnale a frequenze >1 MHz

## Link L1 (raw RAG queries)

- `"SPI Arduino MOSI MISO SCK CS pin"`
- `"SPI.begin SPI.transfer Arduino esempio"`
- `"differenza SPI I2C velocità pin Arduino"`
- `"CS Chip Select Slave Select SPI"`
- `"SD card SPI Arduino datalogger"`
