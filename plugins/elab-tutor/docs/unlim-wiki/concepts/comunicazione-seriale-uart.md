---
id: comunicazione-seriale-uart
type: concept
title: "Comunicazione Seriale UART"
locale: it
volume_ref: 3
pagina_ref: 75
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [uart, seriale, comunicazione, Serial.print, Serial.read, baud-rate, TX, RX, debug, serial-monitor]
---

## Definizione

La comunicazione seriale UART (Universal Asynchronous Receiver/Transmitter) è il metodo usato da Arduino per scambiare messaggi con il computer o con un altro dispositivo: i dati vengono inviati un bit alla volta su due fili, TX (trasmissione) e RX (ricezione), a una velocità concordata chiamata **baud rate**. Vol. 3 pag. 75 la introduce come il canale che permette ad Arduino di "parlarci" attraverso il Serial Monitor.

## Analogia per la classe

Ragazzi, immaginate di voler spedire un messaggio segreto lettera per lettera su un filo del telefono: ogni lettera viene "smontata" in una sequenza di punti e linee e inviata uno alla volta, poi ricostruita dall'altro capo. La comunicazione seriale funziona esattamente così — Arduino prende ogni byte del messaggio, lo divide in 8 bit (0 e 1), li manda uno dopo l'altro sul filo TX, e dall'altra parte il computer li rimette insieme nella giusta sequenza. Per capirsi, mittente e destinatario devono accordarsi prima sulla velocità: questo è il baud rate, come decidere "una lettera ogni secondo".

## Cosa succede fisicamente

### I pin TX e RX su Arduino Nano

| Pin fisico | Nome   | Direzione          | Nota                            |
|------------|--------|--------------------|---------------------------------|
| D0         | RX     | Arduino ← Esterno  | Ricezione dati                  |
| D1         | TX     | Arduino → Esterno  | Trasmissione dati               |
| USB        | USB-Serial | bidirezionale  | Chip CH340/FT232 converte USB↔UART |

**Regola pratica**: TX di Arduino si collega a RX dell'altro dispositivo e viceversa — i fili si "incrociano".

Quando collegato via USB al computer, Arduino Nano usa il chip convertitore USB-UART integrato: non occorrono fili extra per usare il Serial Monitor.

### Il frame UART (come viaggia ogni byte)

Un frame UART standard è composto da:

```
IDLE │ START │ D0 │ D1 │ D2 │ D3 │ D4 │ D5 │ D6 │ D7 │ STOP │ IDLE
  1  │   0   │ .. │ .. │ .. │ .. │ .. │ .. │ .. │ .. │   1  │  1
```

- **1 bit di START** (sempre 0) — segnala l'inizio del frame
- **8 bit di dati** — il byte vero, dal bit meno significativo al più significativo
- **1 bit di STOP** (sempre 1) — segnala la fine

Totale: **10 bit per byte**. A 9600 baud si trasmettono circa 960 byte al secondo.

### Baud rate: la velocità concordata

| Baud rate | Byte/s (teorici) | Uso tipico                        |
|-----------|------------------|-----------------------------------|
| 9600      | 960              | Debug base, Serial Monitor ELAB   |
| 19200     | 1920             | Sensori lenti                     |
| 38400     | 3840             | Moduli Bluetooth (HC-05)          |
| 115200    | 11520            | Upload sketch, debug veloce       |

**Regola**: mittente e ricevente devono usare **lo stesso** baud rate, altrimenti si leggono solo caratteri incomprensibili (es. `ÿ▶◀`).

### Codice base

```cpp
void setup() {
  Serial.begin(9600);           // apri il canale UART a 9600 baud
  Serial.println("Ciao ELAB!"); // invia stringa + newline
}

void loop() {
  Serial.print("Temperatura: ");
  Serial.print(analogRead(A0));
  Serial.println(" gradi");
  delay(1000);
}
```

### Leggere dati in ingresso (Arduino riceve dal computer)

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {    // ci sono byte in arrivo?
    char c = Serial.read();        // leggi un byte
    Serial.print("Hai inviato: ");
    Serial.println(c);
  }
}
```

`Serial.available()` restituisce quanti byte sono presenti nel buffer di ricezione (64 byte max). Va sempre controllato prima di `Serial.read()` per evitare di leggere dati vuoti.

### Riepilogo comandi

| Comando               | Cosa fa                                              |
|-----------------------|------------------------------------------------------|
| `Serial.begin(baud)`  | Inizializza UART alla velocità indicata              |
| `Serial.print(x)`     | Invia `x` come testo (senza newline)                 |
| `Serial.println(x)`   | Invia `x` come testo + `\n` (a capo)                |
| `Serial.write(byte)`  | Invia un byte grezzo (non testo)                     |
| `Serial.available()`  | Quanti byte ci sono nel buffer di ricezione          |
| `Serial.read()`       | Legge un byte dal buffer di ricezione                |
| `Serial.readString()` | Legge una stringa completa dal buffer                |
| `Serial.flush()`      | Aspetta che tutti i dati TX siano inviati            |

## Esperimenti correlati

- Vol. 3 pag. 75 — Primo uso del Serial Monitor: stampa di valori sensor su schermo
- Vol. 2 pag. 55 — Contatore pulsante con debounce: debug via `Serial.println(contatore)` ([`concepts/debounce.md`](debounce.md))
- Vol. 3 cap. 8 — Comunicazione bidirezionale: Arduino riceve comandi dal computer
- [`concepts/pin-digitali.md`](pin-digitali.md) — D0/D1 sono pin UART: non usarli per altri componenti mentre USB è collegato
- [`concepts/serial-monitor.md`](serial-monitor.md) — Interfaccia grafica che mostra i dati UART nel browser/IDE

## Errori comuni

1. **Baud rate errato nel Serial Monitor**: se si vede una sequenza di caratteri strani (`ÿ▶?ÿ`) il baud rate del Serial Monitor non corrisponde a quello di `Serial.begin()`. Controllare che entrambi siano impostati a 9600 (o 115200).

2. **Usare D0/D1 come GPIO mentre USB è collegato**: i pin 0 e 1 sono condivisi con la comunicazione USB-seriale. Collegare un componente su D0 o D1 interferisce con l'upload degli sketch e con il Serial Monitor — possono comparire errori `avrdude: stk500...` durante il caricamento.

3. **Dimenticare `Serial.begin()` nel `setup()`**: senza inizializzare la comunicazione, `Serial.print()` non trasmette nulla — il Serial Monitor rimane vuoto senza errori visibili.

4. **Leggere `Serial.read()` senza controllare `Serial.available()`**: se non ci sono dati in arrivo, `Serial.read()` restituisce `-1`. Comparare `-1` con un carattere dà risultati imprevedibili; usare sempre il controllo `if (Serial.available() > 0)`.

5. **Confondere `Serial.print()` e `Serial.write()`**: `Serial.print(65)` invia la stringa `"65"` (due caratteri), `Serial.write(65)` invia il byte con valore 65 che il terminale mostra come `'A'` (codice ASCII). Usare `print()` per il debug leggibile, `write()` solo per protocolli binari.

## Domande tipiche degli studenti

**"A cosa serve il Serial Monitor se il programma già funziona?"**
È lo strumento di debug più potente che abbiamo: come aggiungere un pannello spia su una macchina. Se il LED non si accende o il sensore dà valori strani, `Serial.println(variabile)` mostra in tempo reale cosa vede Arduino dentro il codice. Senza di esso si lavora "alla cieca".

**"Posso collegare due Arduino insieme e farli parlare?"**
Sì — TX di Arduino A va su RX di Arduino B e viceversa, più un filo GND comune. Entrambi usano `Serial.begin()` con lo stesso baud rate. È così che funzionano moduli come il Bluetooth HC-05 o il GPS: sono dispositivi che comunicano via UART con Arduino.

**"Perché si chiama 'asincrona' la UART?"**
Perché non esiste un filo di clock condiviso che dice "ora leggi il bit". Mittente e ricevente si sincronizzano solo tramite i bit di START e STOP, e si accordano in anticipo sulla velocità (baud rate). A differenza di I2C o SPI, che usano un clock comune, UART funziona anche su lunghe distanze senza filo di sincronizzazione.

**"Cosa succede se `Serial.print()` è dentro `loop()` senza `delay()`?"**
Arduino invia dati centinaia di volte al secondo: il Serial Monitor si riempie così in fretta da diventare illeggibile, e in alcuni casi il buffer si satura rallentando tutto il programma. Aggiungere un `delay(500)` o usare `millis()` per limitare la frequenza di stampa a valori utili (1-2 volte al secondo per il debug).

## PRINCIPIO ZERO

La comunicazione seriale non presenta rischi fisici per i ragazzi — opera a tensioni TTL (5V o 3.3V) sul solo filo dati. Il rischio pratico è **confondere D0/D1 con normali pin GPIO**: collegare un LED o un sensore sui pin 0-1 mentre il cavo USB è inserito blocca silenziosamente l'upload e può fare sembrare che Arduino sia "rotto".

**Safety concreta da ricordare**:
- Sempre scollegare il componente da D0/D1 prima di caricare uno sketch.
- Se l'upload fallisce con `avrdude: stk500_recv(): programmer is not responding`, controllare D0/D1 per prima cosa.
- Il cavo USB non trasmette tensioni pericolose: i ragazzi possono inserirlo e scollegarlo liberamente.

**Cosa mostrare alla classe prima di spiegare UART**:
Aprire il Serial Monitor con Arduino già collegato e far vedere che è vuoto. Poi caricare uno sketch con `Serial.println("Ciao!")` nel `setup()` e mostrare il messaggio che appare. Chiedere ai ragazzi: "da dove viene questa scritta? Chi l'ha inviata?". Aspettare le ipotesi, poi spiegare che è Arduino stesso che ci sta scrivendo attraverso il cavo USB.

**Cosa dire ai ragazzi** (citando il libro):
> "Arduino può parlarci! Usando il Serial Monitor vediamo tutto ciò che Arduino vuole dirci — i valori dei sensori, lo stato dei pin, i messaggi di debug. È come aprire una finestra su ciò che succede dentro la scheda." *(Vol. 3 pag. 75, introduzione Serial Monitor)*

**Narrativa suggerita**:
1. Aprire il Serial Monitor vuoto — "Arduino è silenzioso per ora"
2. Caricare il primo `Serial.println("Ciao!")` — "adesso ci parla!"
3. Dentro `loop()` con `delay(1000)`: "conta i secondi per noi"
4. Leggere un sensore (fotoresistore su A0) e stampare il valore: "Arduino ci dice cosa vede"
5. (Avanzati) Inviare un carattere dal Serial Monitor e far lampeggiare il LED: "noi parliamo ad Arduino, Arduino risponde"

**Plurale inclusivo sempre**: "vediamo insieme cosa stampa", "proviamo a inviare un carattere", "cosa succede se cambiamo il baud rate?" — i ragazzi sul kit fisico, il docente che guida la lettura dalla LIM.

**Non sostituisce la lettura del volume**: le parole esatte di Vol. 3 pag. 75 vanno lette ad alta voce — i ragazzi devono riconoscere le stesse frasi sul libro fisico che hanno in mano e sulla LIM proiettata.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"Serial"` → code-serial, glossary-serial, faq-serial-monitor, capitoli v3-cap8
- `"baud rate"` → glossary-uart, tip-serial, error-baud-mismatch
- `"Serial.println"` → code-3, code-serial, tip-debug
- `"Serial.available"` → code-serial-read, tip-buffer, faq-serial-read
- `"TX RX"` → glossary-uart, tip-pin01, error-upload-d0d1
- `"UART"` → glossary-uart, capitoli v3 comunicazione, tip-due-arduino
- `"Serial Monitor"` → faq-serial-monitor, tip-debug-baud
- `"avrdude stk500"` → error-upload, tip-pin01-conflict
