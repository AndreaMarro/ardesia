---
id: arduino-setup
type: concept
title: "La funzione setup() — configurare Arduino una volta sola"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [setup, loop, funzione, arduino, sketch, inizializzazione, programmazione, base, pinMode, Serial]
---

## Definizione

`setup()` è la funzione obbligatoria di ogni sketch Arduino che viene eseguita **una sola volta** all'accensione (o dopo ogni reset della scheda). Contiene tutto ciò che deve essere configurato prima che il programma entri nel ciclo continuo di `loop()`. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

Ogni sketch Arduino ha esattamente **due funzioni obbligatorie**:

```cpp
void setup() {
  // eseguita UNA volta sola all'avvio o al reset
  pinMode(13, OUTPUT);       // configura pin 13 come uscita
  Serial.begin(9600);        // avvia comunicazione seriale
}

void loop() {
  // eseguita ALL'INFINITO dopo setup()
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
```

## Analogia per la classe

Ragazzi, pensate a come vi preparate la mattina prima di uscire: vi alzate, fate colazione, mettete nello zaino i libri giusti — queste cose le fate **una volta sola** prima di andare a scuola. È `setup()`. Poi, a scuola, fate le ore di lezione che si ripetono ogni giorno — quello è `loop()`. La Arduino non può andare a scuola senza essersi preparata: `setup()` è la colazione obbligatoria!

## Cosa succede fisicamente

Quando caricate uno sketch sulla Nano tramite USB, il codice viene scritto nella memoria **Flash** del microcontrollore ATmega328p. Ogni volta che la scheda viene accesa o premete il tasto **Reset**:

```
ACCENSIONE / RESET
       ↓
   Boot interno ATmega (registri hardware, ~1 ms)
       ↓
   setup()  ← UNA volta sola
       ├─ configurazione pin (pinMode)
       ├─ avvio Serial (Serial.begin)
       ├─ inizializzazione variabili e librerie
       └─ FINE → passa a loop()
       ↓
   loop()   ← Ciclo infinito (vedi arduino-loop.md)
```

`setup()` non ha un tempo massimo — può durare millisecondi o diversi secondi se include un `delay()` o un'attesa. Il codice dopo `setup()` non parte finché essa non termina completamente.

### Istruzioni tipiche in setup()

| Istruzione | Scopo | Esempio |
|------------|-------|---------|
| `pinMode(pin, MODE)` | Dichiara se un pin è INPUT o OUTPUT | `pinMode(13, OUTPUT)` |
| `Serial.begin(baud)` | Avvia la comunicazione col PC | `Serial.begin(9600)` |
| `Wire.begin()` | Avvia il protocollo I2C (display, sensori) | `Wire.begin()` |
| `lcd.begin(16, 2)` | Inizializza display LCD 16 colonne × 2 righe | `lcd.begin(16, 2)` |
| `myservo.attach(pin)` | Collega un servo a un pin PWM | `myservo.attach(9)` |
| `randomSeed(analogRead(A0))` | Inizializza il generatore di numeri casuali | `randomSeed(analogRead(A0))` |

### Esempio reale — LED + Serial Monitor

```cpp
int ledPin = 13;     // variabile globale: visibile sia in setup() che in loop()

void setup() {
  pinMode(ledPin, OUTPUT);   // dichiara il pin come uscita
  Serial.begin(9600);        // 9600 baud = velocità comunicazione col PC
  Serial.println("Arduino pronta!");   // messaggio di avvio visibile nel Monitor Seriale
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED acceso");
  delay(1000);
  digitalWrite(ledPin, LOW);
  Serial.println("LED spento");
  delay(1000);
}
```

Aprendo il Monitor Seriale (icona lente in alto a destra nell'IDE), si vede "Arduino pronta!" apparire **una sola volta** — prova diretta che `setup()` gira una sola volta.

## Esperimenti correlati

- **Primo LED che lampeggia** — Cap. 6 Vol. 1: `setup()` dichiara il pin del LED come OUTPUT; `loop()` lo accende e spegne
- **Lettura pulsante** — Cap. 8 Vol. 1: `setup()` dichiara il pin del pulsante come INPUT o INPUT_PULLUP
- **Monitor Seriale** — Vol. 2 esperimenti analogici: `Serial.begin(9600)` sempre in `setup()` prima di usare `Serial.print()` in `loop()`
- **Display LCD** — Vol. 2 / Vol. 3: `lcd.begin(16, 2)` in `setup()`, poi scrittura testo in `loop()`
- **Servo motor** — Vol. 3: `myservo.attach(9)` in `setup()` prima del sweep in `loop()`

## Errori comuni

1. **`pinMode()` in `loop()` invece di `setup()`** — Funziona, ma è inefficiente: riconfigurare il pin 100+ volte al secondo è inutile. Tutto ciò che si fa una volta va in `setup()`. Il codice è anche più difficile da leggere.

2. **Dimenticare `Serial.begin()` prima di `Serial.print()`** — Se non si chiama `Serial.begin(9600)` in `setup()`, il Monitor Seriale mostra caratteri incomprensibili o niente. L'ordine è obbligatorio: prima `begin()`, poi `print()`.

3. **`delay()` lungo in `setup()` blocca l'avvio** — Un `delay(10000)` in `setup()` fa sembrare la scheda "rotta" per 10 secondi prima che inizi `loop()`. Utile a volte per aspettare l'accensione di un display, ma da documentare con un commento.

4. **Variabile dichiarata dentro `setup()` usata in `loop()`** — Una variabile dichiarata DENTRO `setup()` esiste solo lì. Per condividerla con `loop()`, va dichiarata **globale** (fuori da entrambe le funzioni, all'inizio del file).

5. **Confondere reset hardware con riesecuzione completa** — Premere Reset sul Nano riesegue `setup()` dall'inizio. I dati in EEPROM persistono al reset; le variabili in RAM si azzerano. Utile saperlo quando si debugga un circuito.

## Domande tipiche degli studenti

**"Perché si chiama `setup` e non `start` o `inizio`?"**  
Il nome viene dalla tradizione Arduino — "setup" in inglese significa "preparazione, configurazione". Gli inventori di Arduino hanno scelto questo nome per rendere chiaro che è la fase di *configurazione* prima dell'esecuzione principale. In italiano potremmo tradurlo come "preparazione" o "configurazione iniziale".

**"Cosa succede se lascio `setup()` vuota?"**  
Nessun problema — lo sketch compila e gira ugualmente. `setup()` vuota significa semplicemente che non c'è nulla da configurare prima di `loop()`. Succede raramente in pratica: quasi ogni sketch configura almeno un pin o avvia la comunicazione seriale.

**"Posso chiamare `setup()` manualmente dentro `loop()`?"**  
Tecnicamente sì — è una normale funzione C++. Ma è una cattiva idea: si riconfigurerebbero i pin centinaia di volte al secondo. Se serve eseguire del codice una volta sola in risposta a un evento (es. al primo avvio dopo il login), usate una variabile booleana `bool primavolta = true;` e un `if` in `loop()`.

**"Se premo Reset, `loop()` riparte da dove si era fermato o dall'inizio?"**  
Riparte dall'inizio, anzi prima riesegue `setup()`. Un Reset equivale a spegnere e riaccendere la scheda: tutto ricomincia da zero (variabili RAM azzerate, `setup()` rieseguita, `loop()` reiniziata).

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Narrativa docente**: «Ragazzi, guardate questo sketch: ha due blocchi — `setup()` e `loop()`. Il primo si vede subito quando accendiamo la Nano: configura i pin, avvia il Serial, prepara tutto. Poi "scompare" — non lo vediamo più girare. Quello che gira in continuazione è `loop()`. È come aprire un'app sul telefono: il caricamento iniziale è `setup()`, l'app aperta che risponde ai tocchi è `loop()`.»

> **Demo consigliata**: caricare uno sketch con `Serial.println("setup eseguita!")` in `setup()` e `Serial.println("loop gira...")` in `loop()`. Aprire il Monitor Seriale e mostrare che "setup eseguita!" appare **una volta sola** mentre "loop gira..." continua a scorrere — evidenza visiva diretta e immediata.

> **Aggancio al kit fisico**: «Quando collegate il cavo USB e vedete il LED L sulla Nano lampeggiare velocemente per un secondo — quello è `setup()` che gira. Poi il LED si stabilizza nel comportamento dello sketch — quello è `loop()`. La Nano vi sta comunicando fisicamente la differenza!»

> **Sicurezza**: nessun rischio specifico legato a `setup()`. Ricordare che un `delay()` molto lungo in `setup()` (es. `delay(30000)`) può far credere che la scheda sia difettosa — spiegare ai ragazzi di aspettare che finisca prima di preoccuparsi.

## Link L1 (raw RAG queries)

- `"setup arduino funzione sketch"`
- `"setup loop arduino differenza una volta"`
- `"pinMode setup arduino configurazione"`
- `"Serial begin setup 9600"`
- `"variabile globale setup loop arduino"`
- `"arduino sketch struttura base obbligatoria"`
- `"setup vuota arduino sketch"`
