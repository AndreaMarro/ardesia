---
id: push-button
type: concept
title: "Pulsante (Push Button) — dare un comando con le dita"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [pulsante, push-button, input, digitalread, debounce, active-low, pull-up, interruttore, fondamenti]
---

## Definizione

Un **pulsante** (o push button) è un interruttore momentaneo: chiude il circuito elettrico solo mentre viene tenuto premuto, e torna aperto non appena lo si lascia andare.

> *Nota fonte*: i volumi Omaric non hanno una pagina dedicata esclusivamente al pulsante come componente isolato — il concetto è introdotto in modo distribuito nei capitoli sugli input digitali. Per la teoria del pull-up associato al pulsante vedi → [pull-up-resistor.md](pull-up-resistor.md).

## Analogia per la classe

Ragazzi, pensate al pulsante come al campanello di una porta: lo premete, suona. Lasciate andare, smette. Non resta "suonando" da solo — è momentaneo. Diverso dall'interruttore della luce, che resta acceso o spento (quello si chiama toggle, o interruttore a scatto).

## Come funziona fisicamente

Un push button tattile (il tipo nel kit Omaric) ha **4 pin** disposti a coppie:

```
   [1]──[2]
    │    │     ← internamente già collegati tra loro
   [3]──[4]
```

- Pin 1 e 2 sono sempre in cortocircuito tra loro (stesso lato del pulsante).
- Pin 3 e 4 sono sempre in cortocircuito tra loro (altro lato).
- Premendo il pulsante, il ponte meccanico interno **collega i due lati** → 1-2-3-4 tutti connessi.
- Lasciando andare, il ponte si apre → i due lati sono isolati di nuovo.

Per usarlo su breadboard bastano **due pin diagonali** (es. 1 e 3), uno per lato.

### Schema di collegamento tipico con Arduino

```
    +5 V
      │
   [10 kΩ]   ← pull-up (oppure usa INPUT_PULLUP via software)
      │
      ├──────── Arduino pin 7 (legge HIGH a riposo)
      │
  [PULSANTE]
      │
     GND
```

| Stato pulsante | Pin Arduino | `digitalRead()` |
|---|---|---|
| Non premuto | ~5 V (HIGH) | `1` |
| Premuto | ~0 V (LOW) | `0` |

Questa è logica **active-low**: premere = segnale basso. Vedi → [pull-up-resistor.md](pull-up-resistor.md) per la spiegazione completa.

### Codice di lettura base

```cpp
const int PIN_BTN = 7;

void setup() {
  pinMode(PIN_BTN, INPUT_PULLUP); // pull-up interna ATmega328p
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(PIN_BTN) == LOW) {  // LOW = premuto (active-low)
    Serial.println("Ragazzi, pulsante premuto!");
  }
}
```

## Debounce — il rimbalzo del pulsante

Quando premiamo un pulsante fisico, i contatti meccanici **rimbalzano** decine di volte in pochi millisecondi prima di stabilizzarsi. Per Arduino (che campiona a MHz) questo appare come decine di pressioni rapide al posto di una sola.

**Soluzione software** (la più comune nel kit):

```cpp
const unsigned long DEBOUNCE_MS = 50;
unsigned long ultimaPressione = 0;

void loop() {
  if (digitalRead(PIN_BTN) == LOW) {
    if (millis() - ultimaPressione > DEBOUNCE_MS) {
      ultimaPressione = millis();
      Serial.println("Click (debounced)!");
    }
  }
}
```

**Soluzione hardware**: condensatore da 100 nF tra il pin e GND smussa i rimbalzi (utile per pulsanti di reset).

## Esperimenti correlati

- **Capitoli input digitale** (Vol. 1 + Vol. 2): pulsante + LED — accendere un LED alla pressione.
- **Capitoli contatori**: incrementare un contatore visualizzato su display LCD con ogni pressione.
- **Capitoli interrupt**: collegare il pulsante a un pin interrupt (D2 o D3 su Nano) per risposta immediata senza polling.
- Vedi anche → [pull-up-resistor.md](pull-up-resistor.md) per il circuito di polarizzazione.

## Errori comuni

1. **Pin flottante senza pull-up** — Collegare il pulsante senza pull-up (né interna né esterna): il pin non ha riferimento fisso e legge valori casuali anche senza premere. Soluzione: `pinMode(pin, INPUT_PULLUP)`.

2. **Logica invertita nel codice** — Con pull-up, premere dà LOW. Chi scrive `if (digitalRead(pin) == HIGH)` per rilevare la pressione non vedrà mai il LED accendersi. Regola: con pull-up usare `== LOW` per "premuto".

3. **Pulsante inserito a cavallo del canale centrale della breadboard** — I 4 pin di un pulsante tattile hanno un orientamento preciso. Inserito al contrario, i due lati sono già in cortocircuito e il pulsante sembra sempre premuto. Controllare l'orientamento (i pin più larghi = stessa coppia interna).

4. **Debounce ignorato nei contatori** — Un singolo click fisico conta 5-20 volte a causa del rimbalzo. Per LED on/off non si nota, ma per contatori o toggle di stato è fondamentale aggiungere il debounce (50 ms software).

5. **Confondere pulsante momentaneo con toggle** — Il pulsante rilasciato torna aperto. Usarlo come "switch on/off" richiede una variabile stato nel codice che si inverte a ogni pressione, non basta `digitalRead()`.

## Domande tipiche degli studenti

**"Perché il mio LED si accende anche senza premere il pulsante?"**
Probabilmente il pin è flottante (nessuna pull-up). Aggiungere `INPUT_PULLUP` nel `setup()` oppure una resistenza da 10 kΩ verso 5 V. Senza pull-up il pin legge rumore casuale.

**"Il mio contatore salta da 1 a 7 con una sola pressione — perché?"**
È il rimbalzo meccanico (debounce). Aggiungete un controllo `millis()` come mostrato sopra: il contatore accetta un nuovo click solo dopo 50 ms dall'ultimo.

**"Posso collegare il pulsante direttamente tra 5 V e il pin Arduino senza resistenza?"**
Sì, MA senza pull-up il pin fluttua quando il pulsante non è premuto. Con pull-up `INPUT_PULLUP` interna: tutto corretto, nessun componente esterno necessario.

**"Quanti pulsanti posso collegare ad Arduino?"**
Uno per pin digitale disponibile. Arduino Nano ha D2-D13 (12 pin digitali) + A0-A5 usabili come digital (6 pin). Massimo ~18 pulsanti su una sola scheda — più che sufficienti per tutti i kit Omaric.

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi (linguaggio kit, non parafasi)**:

> "Ragazzi, il pulsante è il modo più semplice per parlare ad Arduino: lo premete, Arduino vi sente. Ma Arduino è molto veloce — sente anche i microscopici rimbalzi del meccanismo. Per questo aggiungiamo sempre il debounce: gli diciamo di ignorare i rimbalzi nei primi 50 millisecondi."

**Sequenza didattica raccomandata**:
1. Inserite il pulsante in breadboard e collegatelo a GND sul lato opposto al pin digitale.
2. Usate `INPUT_PULLUP` — nessuna resistenza esterna, più veloce da cablare per la classe.
3. Mostrate con `Serial.println()` il comportamento active-low (premuto = LOW).
4. Aggiungete un LED: premendo accende, lasciando spegne.
5. Mostrate il problema del rimbalzo con un contatore — poi aggiungete il debounce insieme.

**Sicurezza**:
- Nessun rischio: corrente massima con pull-up interna (~30 kΩ) e pulsante premuto ≈ 0.17 mA (limite sicuro Arduino 40 mA/pin).
- Non collegare mai il pulsante direttamente tra 5 V e GND senza passare per un pin o una resistenza — cortocircuito diretto.

**Cosa NON fare in classe**:
- Non mostrare un pin flottante senza prima spiegare il perché — sembra un bug Arduino e confonde.
- Non saltare il debounce nei progetti con contatori o toggle — i ragazzi si frustreranno con valori "impazziti".

## Link L1 (raw RAG queries)

- `"pulsante digitalRead INPUT_PULLUP"`
- `"push button breadboard pin Arduino"`
- `"debounce pulsante millis rimbalzo"`
- `"active-low pulsante premuto LOW"`
- `"pulsante tattile 4 pin breadboard orientamento"`
- `"interrupt pulsante D2 D3 Arduino Nano"`
