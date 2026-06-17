---
id: serial-print
type: concept
title: "Serial.print() e Serial.println() — far parlare Arduino"
locale: it
volume_ref: 3
pagina_ref: 75
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [serial-print, serial-println, serial, debug, uart, serial-monitor, serial-begin, baud-rate]
---

## Definizione

`Serial.print()` e `Serial.println()` sono le funzioni Arduino che inviano testo e numeri dal microcontrollore al computer attraverso il cavo USB. Vol. 3 pag. 75 le introduce come il modo in cui *"Arduino parla con il computer: scrivi una riga di codice e un messaggio appare sullo schermo in tempo reale"*.

## Analogia per la classe

Ragazzi, immaginate che Arduino sia un compagno in un'altra stanza — non potete vederlo, ma può passarvi bigliettini sotto la porta. Ogni `Serial.print()` è un bigliettino. Con `Serial.println()` aggiunge un "a capo" alla fine, come iniziare una nuova riga sul quaderno. Il Serial Monitor è la finestra attraverso cui leggete tutti i bigliettini in arrivo, in tempo reale.

## Cosa succede fisicamente

Quando Arduino esegue `Serial.print("Ciao")`, converte i caratteri in segnali elettrici sul pin **TX** (D1) che viaggiano attraverso il cavo USB al chip USB-UART e arrivano al computer come testo.

| Pin | Nome | Direzione |
|-----|------|-----------|
| D1 | TX (Transmit) | Arduino → computer |
| D0 | RX (Receive) | computer → Arduino |

⚠️ **Non collegate componenti ai pin D0 e D1** quando la seriale è attiva: quei pin servono alla comunicazione e qualsiasi componente collegato interferisce.

### Le tre funzioni principali

| Funzione | Cosa fa | Fine riga? | Esempio output |
|----------|---------|-----------|----------------|
| `Serial.print(val)` | Stampa senza a capo | No | `42` |
| `Serial.println(val)` | Stampa con a capo | Sì | `42↵` |
| `Serial.print(val, BASE)` | Stampa in base diversa | No | `101010` (binario) |

### Serial.begin() — il cancello da aprire prima

`Serial.begin(velocità)` va chiamato **una sola volta** nel `setup()` — apre il canale di comunicazione tra Arduino e il computer. La velocità (in baud = bit al secondo) deve essere identica a quella impostata nel Serial Monitor.

| Velocità | Quando usarla |
|----------|---------------|
| `9600` | default, compatibile con tutto il kit ELAB |
| `115200` | debug rapido, riduce il ritardo tra misura e stampa |

### Snippet base: debug un sensore

```arduino
void setup() {
  Serial.begin(9600);           // apri la porta seriale — DEVE essere in setup()
}

void loop() {
  int val = analogRead(A0);     // leggi sensore su A0 (0-1023)
  Serial.print("Valore: ");     // etichetta senza a capo
  Serial.println(val);          // numero + a capo
  delay(500);                   // aspetta mezzo secondo
}
```

Output nel Serial Monitor:
```
Valore: 427
Valore: 431
Valore: 418
```

### Stampare più valori sulla stessa riga

```arduino
void loop() {
  int luce  = analogRead(A0);
  int pot   = analogRead(A1);
  Serial.print("Luce:");
  Serial.print(luce);
  Serial.print("  Pot:");
  Serial.println(pot);    // solo l'ultimo usa println per il a capo
  delay(500);
}
```

Output:
```
Luce:512  Pot:307
Luce:498  Pot:310
```

### Serial.print() con tipi di dato diversi

```arduino
Serial.println(42);           // intero    → 42
Serial.println(3.14);         // decimale  → 3.14
Serial.println("Ciao!");      // testo     → Ciao!
Serial.println(true);         // booleano  → 1
Serial.println(42,  BIN);     // binario   → 101010
Serial.println(255, HEX);     // esadec.   → FF
```

### Debug temperatura NTC (snippet avanzato)

```arduino
void setup() { Serial.begin(9600); }

void loop() {
  int    raw     = analogRead(A0);
  float  tensione = raw * 5.0 / 1023.0;
  float  tempC    = (tensione - 0.5) * 100.0;
  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.println(" C");
  delay(1000);
}
```

Output:
```
Temp: 23.45 C
Temp: 23.67 C
```

**Citazione Vol. 3 pag. 75:** *"Arduino parla con il computer: scrivi una riga di codice e un messaggio appare sullo schermo in tempo reale."*

## Esperimenti correlati

- **v3-cap8-esp1** (Vol. 3 pag. 75) — Prima comunicazione seriale: `Serial.begin(9600)` + `Serial.println()`
- **v3-cap8-esp2** (Vol. 3 pag. 77) — Debug sensore luce: `analogRead(A0)` + `Serial.println(luce)`
- **v3-cap8-esp3** (Vol. 3 pag. 80) — Temperatura NTC con stampa formattata `Serial.print + Serial.println`
- Per aprire il monitor dati: vedi [concepts/serial-monitor.md](serial-monitor.md)
- Per il protocollo fisico TX/RX/baud: vedi [concepts/comunicazione-seriale-uart.md](comunicazione-seriale-uart.md)
- Per leggere valori analogici da stampare: vedi [concepts/analog-read.md](analog-read.md)

## Errori comuni

1. **`Serial.begin()` dimenticato** — `Serial.print()` viene eseguito ma niente appare nel monitor. La seriale non è inizializzata e i dati vengono ignorati. Fix: aggiungere `Serial.begin(9600)` come **prima istruzione** di `setup()`.
2. **Baud rate diverso tra codice e monitor** — Il codice dice `Serial.begin(9600)` ma il menu a tendina del Serial Monitor è su `115200` (o viceversa). Appare testo incomprensibile tipo `???`. Fix: impostare la stessa velocità in entrambi i posti — verificate il menu in basso a destra del Serial Monitor.
3. **Nessuna etichetta prima del numero** — Stampare solo `Serial.println(val)` → compare `427` sullo schermo. Impossibile capire se è luce, temperatura o altro. Usare sempre `Serial.print("NomeSensore: ")` prima del valore.
4. **`println()` su ogni riga invece dell'ultima** — Se ogni `print()` intermedio diventa `println()`, i valori vanno su righe separate invece che sulla stessa riga. Regola: `print()` per i valori intermedi, `println()` solo per l'ultimo della riga.
5. **Componenti su D0 o D1** — Collegare un LED o un pulsante ai pin D0/D1 mentre la seriale è attiva causa caratteri corrotti nel monitor e comportamento imprevedibile. Fix: usare qualsiasi altro pin digitale (D2-D13) per i componenti.

## Domande tipiche degli studenti

**"Qual è la differenza tra `print()` e `println()`?"**
`Serial.print()` stampa il valore e rimane sulla stessa riga — il cursore non si sposta. `Serial.println()` stampa il valore e poi va a capo, come premere Invio sulla tastiera. Se usate solo `print()`, tutto il testo si ammassa su un'unica riga infinita. Se usate solo `println()`, ogni valore va su una riga separata. La combinazione corretta è: `print()` per le etichette e i valori intermedi, `println()` solo alla fine della riga.

**"Posso usare `Serial.print()` per inviare qualsiasi dato?"**
Sì: numeri interi, decimali, testo tra virgolette, booleani, e anche valori in binario o esadecimale aggiungendo `BIN` o `HEX` come secondo parametro. Non potete inviare immagini o suoni — solo testo e numeri. Per i decimali stampati con `float`, di default vengono mostrate 2 cifre dopo la virgola.

**"A cosa serve mettere un'etichetta come `Serial.print("Luce: ")` prima del numero?"**
Quando il monitor mostra solo `427` non sapete cosa significa — è luce? temperatura? tensione? Con `"Luce: 427"` è immediato. Quando avete due o tre sensori diversi e stampate tutti i valori uno sotto l'altro, senza etichette sembrano tutti uguali. Le etichette sono il modo in cui "leggete" il debug come se fosse una conversazione con Arduino.

**"Posso chiamare `Serial.print()` mentre Arduino fa altre cose (controlla un LED, legge un pulsante)?"**
Sì, `Serial.print()` non blocca il programma — si esegue velocemente e poi Arduino continua. Però occhio al `delay()`: se avete `delay(2000)` nel loop, la stampa si ferma per 2 secondi ad ogni giro. Per programmi che devono reagire velocemente a sensori usate `millis()` invece di `delay()`. Per ora, con `delay(500)` per il debug, va benissimo.

## PRINCIPIO ZERO

**Per il docente — guida silenziosa:**

📖 **Citate le parole del Vol. 3 pag. 75:** *"Arduino parla con il computer: scrivi una riga di codice e un messaggio appare sullo schermo in tempo reale."*

**Cosa dire ai ragazzi:**
> "Fino adesso guardavamo solo il LED per capire cosa stava facendo Arduino. Adesso Arduino può *parlarci*: scrive messaggi direttamente sullo schermo mentre lavora. `Serial.print()` è come dare ad Arduino una voce. Proviamo insieme: aggiungete questa riga e vedete il valore del vostro sensore apparire in tempo reale mentre lo muovete."

**Sicurezza:**
- La comunicazione seriale usa 5V sui pin TX/RX — nessun rischio per i ragazzi
- Non collegare componenti ai pin D0 (RX) e D1 (TX) durante le attività seriali: interferisce con la trasmissione e può causare valori corrotti o reset di Arduino
- Se il Serial Monitor mostra caratteri strani (`???` o `â€œ`), controllare il baud rate nel menu a tendina in basso a destra — non è un guasto del kit, è solo un disallineamento di velocità tra codice e monitor

**Narrativa per la classe — progressione 5 step:**
1. *Il problema*: "Fino adesso come facevate a sapere cosa leggeva il sensore? Solo guardando il LED, vero? Ma se volete il numero esatto — 427 o 512?"
2. *Aprite la porta*: mostrate `Serial.begin(9600)` nel `setup()`. "Questa riga apre la 'porta' tra Arduino e il computer. 9600 è la velocità — come i giri di un motore, devono essere uguali da tutte e due le parti."
3. *Prima stampa*: digitate insieme `Serial.println(val)` nel `loop()`. Caricate il codice, aprite il Serial Monitor (pulsante in alto a destra). Fate scegliere ai ragazzi `9600` dal menu a tendina.
4. *Il momento 'wow'*: i numeri appaiono in tempo reale mentre i ragazzi muovono un potenziometro o coprono un fotoresistore con la mano. Fate fare a turno — ognuno vede "i propri numeri" scorrere.
5. *Sfida*: "Riuscite a stampare due sensori sulla stessa riga, con un'etichetta davanti a ciascuno?" → introduce la combinazione `Serial.print()` + `Serial.println()` e il concetto di formattazione dell'output.

## Link L1 (raw RAG queries)

Query per `src/data/rag-chunks.json`:
- `"Serial.print println baud rate begin"` — funzioni seriale + velocità (tip-15, code-11)
- `"Arduino parla computer seriale monitor tempo reale"` — bookContext Vol. 3 pag. 75
- `"analogRead Serial println debug sensore A0"` — snippet code-11 debug sensore luce
- `"Serial.print temperatura NTC formattato gradi Celsius"` — snippet code-15 temp + println
- `"TX RX pin D0 D1 UART seriale conflitto GPIO"` — conflitto pin componenti/seriale
- `"Serial.begin 9600 setup comunicazione seriale primi passi"` — tip-12 Cap. 5 Vol. 3
