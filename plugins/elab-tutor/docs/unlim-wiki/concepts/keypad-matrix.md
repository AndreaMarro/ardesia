---
id: keypad-matrix
type: concept
title: "Keypad matrix 4×4 — input numerico via scansione righe/colonne"
locale: it
volume_ref: 3
pagina_ref: 215
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [keypad, matrice, input, scansione, vol3]
---

## Definizione

Il **keypad matrix 4×4** è una tastiera a 16 tasti organizzati in matrice di 4 righe × 4 colonne. Vol. 3 pag. 215 introduce: "Il keypad è come una tabella incrociata: ogni tasto è all'incrocio di una riga e una colonna, e Arduino scopre quale è premuto controllando una cella alla volta".

Layout standard:
```
    C1  C2  C3  C4
R1   1   2   3   A
R2   4   5   6   B
R3   7   8   9   C
R4   *   0   #   D
```

Pinout: 8 pin (R1-R4 + C1-C4).

## Principio scansione (perché matrice e non 16 pin separati)

Per 16 tasti separati: 16 pin Arduino + 16 resistenze. Troppo.
Per matrice 4×4: solo **8 pin** (4 righe + 4 colonne). Risparmio 50%.

Funzionamento (polling sequenziale):
1. Arduino imposta tutte le righe HIGH, colonne come INPUT_PULLUP
2. Premi tasto → corrente passa da riga a colonna → colonna va LOW
3. Arduino abbassa una riga alla volta (R1 LOW, R2-R4 HIGH)
4. Per ogni riga, legge le colonne. Tasto premuto = riga × colonna identificate

## Schema collegamento

```
Arduino     Keypad 4×4
  D9   ←──→ R1
  D8   ←──→ R2
  D7   ←──→ R3
  D6   ←──→ R4
  D5   ←──→ C1
  D4   ←──→ C2
  D3   ←──→ C3
  D2   ←──→ C4
```

## Codice Arduino con libreria Keypad.h

```cpp
#include <Keypad.h>

const byte ROWS = 4;
const byte COLS = 4;

char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};

Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

void setup() {
  Serial.begin(9600);
}

void loop() {
  char tasto = keypad.getKey();
  if (tasto) {
    Serial.print("Tasto: ");
    Serial.println(tasto);
  }
}
```

`getKey()` ritorna char solo al press (non hold). Per detection multipla usare `getState()`.

## Esempio Vol. 3 — combinazione lock

```cpp
String COMBINAZIONE = "1234";
String input = "";
const int PIN_LED_VERDE = 11;
const int PIN_LED_ROSSO = 12;

void loop() {
  char tasto = keypad.getKey();
  if (!tasto) return;

  Serial.print(tasto);

  if (tasto == '#') {  // submit
    if (input == COMBINAZIONE) {
      digitalWrite(PIN_LED_VERDE, HIGH);
      Serial.println(" → APERTO");
    } else {
      digitalWrite(PIN_LED_ROSSO, HIGH);
      Serial.println(" → SBAGLIATO");
    }
    delay(2000);
    digitalWrite(PIN_LED_VERDE, LOW);
    digitalWrite(PIN_LED_ROSSO, LOW);
    input = "";
  } else if (tasto == '*') {  // clear
    input = "";
    Serial.println(" CLEAR");
  } else {
    input += tasto;  // append digit
  }
}
```

Vol. 3 pag. 218 estende: combinazione + LCD I2C + servo per "porta segreta".

## Errori comuni

1. **rowPins e colPins swap** — Sintomo: ogni tasto stampa lettera sbagliata. Scambiare arrays nella dichiarazione `Keypad`.

2. **Pin senza pull-up** — Library Keypad imposta automatic INPUT_PULLUP. Non aggiungere pull-down esterni.

3. **Multi-press detection** — `getKey()` ritorna SOLO un tasto. Per shift+key (es. SHIFT + 5 = '%') serve `getKeys()` array detection.

4. **Bouncing percepito** — Library Keypad include debounce 10ms default. Se persistono ripetizioni, aumentare:
```cpp
keypad.setDebounceTime(50);
```

5. **Conflitto pin con Serial** — D0/D1 sono RX/TX hardware Serial. Evitare per keypad → no Serial Monitor durante uso.

6. **Pin keypad reservati per altro** — Pin SPI (D11/12/13), I2C (A4/A5), interrupt (D2/D3) potrebbero servire per altri sensori. Pianificare layout pin a inizio progetto.

## Esperimenti correlati

- **Vol. 3 pag. 215** — Primo keypad: lettura tasti Serial Monitor
- **Vol. 3 pag. 218** — Combinazione lock con LED + servo
- **Vol. 3 pag. 220** — Calcolatrice 4 funzioni (capstone)
- **Vol. 3 pag. 225** — Quiz interattivo: 4 domande, 4 risposte (A/B/C/D), keypad input

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 215):
> "Il keypad è come una tabella incrociata: ogni tasto è all'incrocio di una riga e una colonna, e Arduino scopre quale è premuto controllando una cella alla volta."

**Cosa fare:**
- Vol. 3 pag. 215 raccomanda di insegnare keypad DOPO `digitalRead` + `if/else` + array
- Disegnate sulla LIM la matrice 4×4 con righe e colonne. Ragazzi capiscono il concetto della "tabella scolastica"
- Esempio combinazione lock è iconic: ragazzi pensano subito a sblocco bici/cassaforte
- Spiegate il **risparmio pin** rispetto a 16 tasti separati: concetto importante per ingegneria
- Calcolatrice capstone è gratificante: 4 operazioni + display LCD = progetto completo

**Sicurezza:**
- Keypad è componente passivo. Sicuro per ragazzi.
- Verificate scrupolosamente connessioni (8 fili) — errori comuni con pulizia layout breadboard.

**Cosa NON fare:**
- Non insegnate keypad senza array (matrice 2D = `keys[ROWS][COLS]`).
- Non usate keypad per timer real-time — polling latenza ~10-50ms.
- Non aspettatevi rilevamento gesture complesse (multi-touch, swipe) — keypad meccanico è 1-tasto-alla-volta.

## Link L1 (raw RAG queries)

- `"keypad matrix 4x4 Arduino libreria"`
- `"scansione riga colonna pin economy"`
- `"combinazione lock LED servo"`
- `"Keypad.h getKey debounce"`
- `"calcolatrice keypad LCD I2C"`
