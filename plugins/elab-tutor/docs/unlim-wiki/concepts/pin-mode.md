---
id: pin-mode
type: concept
title: "pinMode() — Configurare la Direzione di un Pin"
locale: it
volume_ref: 3
pagina_ref: 47
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [pinmode, setup, output, input, input-pullup, pin-digitali, arduino, digital-write, digital-read, floating, pullup]
---

## Definizione

`pinMode(pin, modalità)` è la funzione Arduino che stabilisce la **direzione** di un pin digitale: se deve mandare segnali verso l'esterno (`OUTPUT`) oppure riceverli dall'esterno (`INPUT` o `INPUT_PULLUP`). Vol. 3 pag. 47 la introduce nel blocco `setup()`: *"Prima di tutto diciamo ad Arduino come usare i pin: pinMode(13, OUTPUT) significa che il pin 13 è un'uscita."*

## Analogia per la classe

Ragazzi, immaginate un cantiere edile: prima che i lavori comincino, il capocantiere assegna a ogni operaio il suo ruolo — chi porta i mattoni (**OUTPUT**, porta corrente fuori), chi controlla cosa arriva (**INPUT**, riceve segnale), chi sta di guardia con la mano sulla recinzione in attesa di un segnale (**INPUT_PULLUP**, attende e abbassa quando qualcuno bussa). Senza questa assegnazione iniziale il cantiere è il caos: ognuno fa quello che vuole e i muri non vengono su. `pinMode` nel `setup()` è il capocantiere che mette ordine prima che il programma cominci a girare nel `loop()`.

## Cosa succede fisicamente

Dentro Arduino Nano ogni pin digitale è collegato a un registro hardware dell'ATmega328p. `pinMode` scrive nei registri **DDR** (Data Direction Register) per dire al microcontrollore se il pin deve guidare tensione verso l'esterno o leggere tensione dall'esterno.

**Le tre modalità a confronto:**

| Modalità        | Registro DDR | Cosa fa il pin                              | Uso tipico                      |
|-----------------|--------------|---------------------------------------------|---------------------------------|
| `OUTPUT`        | bit = 1      | Guida attivamente 5 V o 0 V                 | LED, cicalino, relè via transistor |
| `INPUT`         | bit = 0      | Alta impedenza — legge tensione esterna      | Sensore con pull-down esterno   |
| `INPUT_PULLUP`  | bit = 0 + PU | Alta impedenza + resistenza interna ~47 kΩ a 5 V | Pulsante senza resistenza esterna |

**Corrente massima per pin in OUTPUT:**

| Limite          | Valore | Conseguenza se superato                      |
|-----------------|--------|----------------------------------------------|
| Raccomandato    | 20 mA  | Pin sempre freddo, durata anni               |
| Assoluto        | 40 mA  | Danno permanente al pin e all'ATmega328p     |
| Totale I/O Nano | 200 mA | Reset spontaneo o danno se superato          |

> **Regola:** usate sempre una resistenza in serie con il LED (minimo 150 Ω, consigliato 470 Ω) quando il pin è in `OUTPUT`.

**Pin in stato flottante (floating) — il nemico silenzioso:**

Un pin configurato come `INPUT` senza niente collegato flotta nell'aria: la sua tensione cambia in modo casuale tra HIGH e LOW, influenzata dal rumore elettrico, dalla vostra mano vicina, dai cavi. Il programma legge valori a caso — è un bug difficilissimo da trovare. La soluzione è `INPUT_PULLUP` (resistenza interna) oppure una resistenza di pull-down esterna da 10 kΩ verso GND.

```
Pin flottante (INPUT senza nulla):        Pin con INPUT_PULLUP:
  Pin ─── ? ─── (rumore elettrico)          5V ─── 47kΩ ─── Pin ─── Pulsante ─── GND
  Risultato: digitalRead() imprevedibile    Riposo: HIGH  /  Pulsante premuto: LOW
```

**Logica invertita di INPUT_PULLUP:**

Con `INPUT_PULLUP` il pulsante NON premuto legge `HIGH` (la resistenza tiene il pin a 5 V). Quando il pulsante è premuto, collega il pin a GND e il valore scende a `LOW`. È il contrario dell'intuizione — tenetelo a mente!

**Codice completo con LED + pulsante:**

```cpp
const int PIN_LED     = 10;
const int PIN_PULSANTE = 7;

void setup() {
  pinMode(PIN_LED,      OUTPUT);       // D10 → guida il LED
  pinMode(PIN_PULSANTE, INPUT_PULLUP); // D7  → legge il pulsante (logica invertita)
}

void loop() {
  // pulsante premuto = LOW (INPUT_PULLUP), non premuto = HIGH
  if (digitalRead(PIN_PULSANTE) == LOW) {
    digitalWrite(PIN_LED, HIGH); // LED acceso mentre il pulsante è premuto
  } else {
    digitalWrite(PIN_LED, LOW);  // LED spento
  }
}
```

**Pin map ATmega328p — dove agisce `pinMode`:**

| Pin Arduino | Registro DDR | Note                                          |
|-------------|--------------|-----------------------------------------------|
| D0-D7       | DDRD         | D0/D1 riservati a Serial RX/TX — non usarli   |
| D8-D13      | DDRB         | D13 = LED_BUILTIN onboard                     |
| A0-A5       | DDRC         | Usabili come digitali con `pinMode` se necessario |

> `pinMode` va chiamato **una sola volta nel `setup()`**, non nel `loop()` — riscrivere il registro DDR a ogni ciclo non causa errori ma è inutile e rallenta il programma.

## Esperimenti correlati

- **v3-cap5-esp1** — Vol. 3 pag. 47: primo `pinMode(13, OUTPUT)` + `digitalWrite` nel Blink
- **v3-cap6-esp1** — Vol. 3 pag. 53: LED esterno su D10 con resistenza 470 Ω (`OUTPUT`)
- **v3-cap7-esp1** — Vol. 3 pag. 63: pulsante su D7 con `INPUT_PULLUP` + logica invertita
- **v3-cap7-esp2** — Vol. 3 pag. 65: pulsante controlla LED — combinazione `pinMode` + `digitalRead` + `digitalWrite`
- **v3-cap8-esp1** — Vol. 3 pag. 75: più pin configurati insieme (`OUTPUT` LED + `INPUT_PULLUP` pulsante + Serial)

## Errori comuni

1. **Non chiamare `pinMode` prima di `digitalWrite` o `digitalRead`** — di default tutti i pin sono `INPUT`. Se usate `digitalWrite(10, HIGH)` senza `pinMode(10, OUTPUT)`, il pin resta ad alta impedenza e il LED non si accende. Non dà errore di compilazione: è un bug silenzioso che confonde tutti. Soluzione: ogni pin che usate deve avere il suo `pinMode` nel `setup()`.

2. **Sbagliare il numero del pin tra `pinMode` e `digitalWrite`** — scrivere `pinMode(10, OUTPUT)` ma poi `digitalWrite(11, HIGH)` non accende nulla su D10 e lascia D11 in stato indefinito. I numeri devono essere identici. Usate costanti con nome (`const int PIN_LED = 10;`) per evitare questo errore.

3. **Aspettarsi logica normale con `INPUT_PULLUP`** — con `INPUT_PULLUP` il pulsante NON premuto vale `HIGH` e premuto vale `LOW`. Se scrivete `if (digitalRead(7) == HIGH)` per "pulsante premuto", ottenete il contrario di quello che volete. Condizione corretta: `if (digitalRead(7) == LOW)`.

4. **Chiamare `pinMode` nel `loop()` invece che nel `setup()`** — funziona tecnicamente ma riscrive il registro DDR centinaia di volte al secondo. Il comportamento è corretto ma è uno spreco e può mascherare errori logici. La regola: configurazione dei pin → `setup()`; azioni → `loop()`.

5. **Usare D0 o D1 come `OUTPUT` con `Serial.begin()` attivo** — i pin D0 (RX) e D1 (TX) sono usati internamente dalla comunicazione USART. Se li configurate come `OUTPUT` e ci attaccate un LED, il LED lampeggia in modo strano (risponde ai dati seriali) e il Monitor Seriale riceve caratteri corrotti. Regola: non toccare mai D0/D1 se avete `Serial.begin()` nel codice.

## Domande tipiche degli studenti

**"Se non metto `pinMode`, cosa usa Arduino per default?"**
Di default tutti i pin sono `INPUT` — alta impedenza, nessuna forza attiva. Per questo senza `pinMode(pin, OUTPUT)` un `digitalWrite` non ha effetto visibile: il pin non guida nessuna tensione. Il valore di default INPUT è pensato per proteggere il microcontrollore da cortocircuiti accidentali al boot.

**"Posso chiamare `pinMode` nel `loop()` per cambiare la direzione a runtime?"**
Sì, è tecnicamente possibile e a volte utile (es. pin che funge da OUTPUT poi da INPUT per misurare). Ma è una tecnica avanzata — per i circuiti base dei kit ELAB mettete sempre tutto nel `setup()`. Cambiare DDR durante il `loop()` richiede attenzione: assicuratevi che il pin non stia pilotando nulla di attivo nel momento del cambio.

**"Perché `INPUT_PULLUP` invece di mettere una resistenza esterna?"**
Entrambe le soluzioni vanno bene. `INPUT_PULLUP` usa la resistenza interna dell'ATmega328p (~47 kΩ) e risparmia un componente sulla breadboard. La resistenza esterna (10 kΩ) vi dà più controllo sul valore e funziona anche su schede che non hanno pull-up interni. Nei kit ELAB si usa `INPUT_PULLUP` per semplicità — meno fili, stesso risultato.

**"Devo chiamare `pinMode` anche per `analogRead`?"**
No! I pin A0-A5 in modalità `analogRead` non hanno bisogno di `pinMode` — l'ADC li gestisce in automatico come ingressi analogici. Se volete usare A0-A5 come pin digitali (con `digitalRead`/`digitalWrite`), allora sì, servono `pinMode(A0, INPUT)` o `pinMode(A0, OUTPUT)`.

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** `pinMode` è la prima riga del programma che i ragazzi scrivono nel `setup()` — il momento in cui dicono ad Arduino *chi fa cosa*. Prima ancora di accendere un LED, stanno definendo ruoli e responsabilità. È una metafora potente per il concetto di configurazione: nessun sistema funziona senza sapere prima cosa deve fare ogni parte.

**Cosa fare con i ragazzi:**
- Prima di aprire l'IDE, chiedete: "Se doveste costruire un robot, come gli direste se una mano deve dare oggetti o riceverli?" — poi mostrate che `OUTPUT`/`INPUT` fa esattamente questo
- Citate Vol. 3 pag. 47: *"Prima di tutto diciamo ad Arduino come usare i pin: pinMode(13, OUTPUT) significa che il pin 13 è un'uscita"* — leggete la riga insieme
- Mostrate il Blink: fate notare che `pinMode` è nel `setup()` (eseguito una volta) e `digitalWrite` è nel `loop()` (ripetuto all'infinito) — "setup = preparazione, loop = lavoro"
- Per il pulsante con `INPUT_PULLUP`: fate premere il pulsante e chiedete "Cosa vi aspettate che legga Arduino?" — poi mostrate il Monitor Seriale con i valori HIGH/LOW invertiti. "Sorpresa! Con INPUT_PULLUP la logica è al contrario — premuto = LOW"
- Collegamento alla vita reale: "Ogni dispositivo elettronico configura i suoi pin all'avvio. Quando accendete lo smartphone, il processore fa centinaia di `pinMode` prima ancora di mostrarvi lo schermo"

**Sicurezza:**
- Un pin in `OUTPUT` può erogare massimo 40 mA prima di danneggiarsi in modo permanente — ricordate sempre la resistenza in serie con il LED
- Non collegare mai un pin `OUTPUT` direttamente a GND o 5V: è un cortocircuito che brucia il pin in millisecondi
- I pin A0-A5 in modalità analogica reggono al massimo 5 V in ingresso — tensioni superiori danneggiano l'ADC irreversibilmente
- D0/D1 sono riservati alla comunicazione seriale: non usarli mai come `OUTPUT` nei circuiti ELAB

**Cosa NON fare:**
- Non mostrare `pinMode` nel `loop()` come pratica normale — confonde la distinzione fondamentale setup/loop
- Non dimenticare di spiegare la logica invertita di `INPUT_PULLUP` prima che i ragazzi si chiedano perché il pulsante fa il contrario

**Cosa dire ai ragazzi** (citazione diretta Vol. 3):
> *"Prima di tutto diciamo ad Arduino come usare i pin: pinMode(13, OUTPUT) significa che il pin 13 è un'uscita."* — Vol. 3 pag. 47

**Progressione didattica consigliata (6 step):**
1. `pinMode(13, OUTPUT)` + `digitalWrite(13, HIGH/LOW)` — LED di bordo D13, codice Blink stock
2. LED esterno su D10 con resistenza 470 Ω — stessa logica, pin diverso, circuito fisico
3. Aggiungere secondo LED su D11 — due `pinMode` nel `setup()`, due `digitalWrite` nel `loop()`
4. Pulsante su D7 con `INPUT_PULLUP` — primo `INPUT`, Monitor Seriale per vedere HIGH/LOW
5. Pulsante che controlla LED — combina `digitalRead` + `if/else` + `digitalWrite`
6. Sfida: pulsante toggle (premuto una volta = accende, premuto di nuovo = spegne) — introduce la variabile di stato `bool statoLed`

## Link L1 (raw RAG queries)

Frasi di ricerca per recuperare chunk L1 correlati da `src/data/rag-chunks.json`:

- `"pinMode OUTPUT INPUT INPUT_PULLUP setup pin"`
- `"pin flottante floating digitalRead imprevedibile"`
- `"INPUT_PULLUP pulsante resistenza interna logica invertita"`
- `"DDR registro direzione pin ATmega328p"`
- `"pinMode OUTPUT LED resistenza 470 corrente massima 40mA"`
