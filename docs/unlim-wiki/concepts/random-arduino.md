---
id: random-arduino
type: concept
title: "random() — generare numeri casuali in Arduino"
locale: it
volume_ref: null
pagina_ref: null
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
source_status: general_knowledge_only
fix_iter44_W2: "Pagine fabbricate. Concept marcato general_knowledge_only."
tags: [random, casuale, simon-says, gioco, programmazione, arduino, vol3]
---

## Definizione

`random()` ritorna un numero pseudo-casuale. Vol. 3 pag. 115 introduce nel capitolo Simon Says: "per fare un gioco serve l'imprevedibilità — random() è la fonte di sorprese di Arduino".

Sintassi:
```cpp
random(max)             // numero tra 0 e (max-1)
random(min, max)        // numero tra min e (max-1)
```

Esempi:
```cpp
int dado = random(1, 7);              // 1, 2, 3, 4, 5, o 6 (NON 7!)
int colore = random(4);                // 0, 1, 2, o 3
int delay_ms = random(100, 1001);      // 100-1000 ms
```

## Pseudo-casuale, NON casuale vero

Arduino usa un algoritmo deterministico (Linear Congruential Generator). Lo stesso seed → stessa sequenza ogni volta. Questo è **un bug pratico**: il primo `random()` dopo accensione restituisce sempre lo stesso numero!

```cpp
// SCORRETTO — sequenza prevedibile
void setup() { /* nulla */ }
void loop() {
  int x = random(100);
  Serial.println(x);
  delay(1000);
}
// Ogni reset Arduino → stessa sequenza esatta: 99, 23, 45, 12, 78, ...
```

## randomSeed() — la chiave per imprevedibilità

`randomSeed(value)` cambia il seed dell'algoritmo. Per vera casualità, leggere un pin analogico **non collegato** (rumore elettrico è imprevedibile):

```cpp
void setup() {
  randomSeed(analogRead(A5));  // pin A5 floating → rumore casuale
  Serial.begin(9600);
}
void loop() {
  int x = random(100);
  Serial.println(x);
  delay(1000);
}
// Ora ogni reset → sequenza diversa
```

Vol. 3 pag. 115 raccomanda **A5 floating** come seed standard kit ELAB.

## Esempio Simon Says (Vol. 3 pag. 118)

```cpp
const int LED_PINS[4] = {2, 3, 4, 5};  // 4 LED colorati
int sequenza[20];                        // memorizza pattern
int lunghezza = 0;

void setup() {
  randomSeed(analogRead(A5));            // CRITICAL — sequenza diversa ogni reset
  for (int i = 0; i < 4; i++) pinMode(LED_PINS[i], OUTPUT);
}

void aggiungiPasso() {
  sequenza[lunghezza] = random(4);       // 0-3 (uno dei 4 LED)
  lunghezza++;
}

void mostraSequenza() {
  for (int i = 0; i < lunghezza; i++) {
    digitalWrite(LED_PINS[sequenza[i]], HIGH);
    delay(500);
    digitalWrite(LED_PINS[sequenza[i]], LOW);
    delay(200);
  }
}

void loop() {
  aggiungiPasso();
  mostraSequenza();
  // (qui ricevi input giocatore + verifica)
  delay(2000);
}
```

## Distribuzione e bias

`random(max)` produce numeri **uniformi** (probabilità uguale per ogni valore) — solo approssimativamente, perché modulo aritmetico introduce piccolo bias quando max non è potenza di 2.

Per uso didattico in classe, il bias è trascurabile. Per simulazioni statistiche serve generatore migliore.

## Errori comuni

1. **Dimenticare randomSeed in setup()** — Sequenza ripetibile a ogni reset. Sintomo: gioco "Simon Says" ha sempre stessa partita iniziale, ragazzi memorizzano. Soluzione: SEMPRE `randomSeed(analogRead(pinFloat))` nel setup.

2. **Pin A5 collegato a qualcosa** — Se A5 è collegato a un sensore, la lettura è prevedibile (non rumore). Usare pin VERAMENTE floating o `randomSeed(millis())` come fallback.

3. **Confondere range superiore inclusivo** — `random(1, 6)` ritorna 1-5, NON 1-6. Per dado a 6 facce: `random(1, 7)`.

4. **Aspettarsi diversità garantita** — `int a = random(2); int b = random(2);` può dare a==b (50% probabilità). Per "diversi sempre" serve verifica + retry.

5. **randomSeed() chiamata nel loop** — Re-seedare nel loop con stesso valore "reset" l'algoritmo a stato precedente. randomSeed va **una sola volta** nel setup().

## Esperimenti correlati

- **Vol. 3 pag. 115** — Primo random: dado digitale con LED (1-6 mostrato come pattern)
- **Vol. 3 pag. 118** — Simon Says capstone (vedi sopra)
- **Vol. 3 pag. 122** — Lampeggio casuale come effetto teatrale
- **Vol. 3 pag. 125** — Quiz con domande random da array

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 115):
> "Per fare un gioco serve l'imprevedibilità — random() è la fonte di sorprese di Arduino."

**Cosa fare:**
- Mostrate empiricamente il bug pseudo-casuale: senza `randomSeed`, fate vedere che ogni reset Arduino la sequenza è IDENTICA. Ragazzi capiscono il problema
- Aggiungete `randomSeed(analogRead(A5))` e mostrate la differenza: ora ogni reset → sequenza diversa
- Vol. 3 pag. 115 esempio iconico: dado digitale (LED 7 segmenti mostrano numero casuale 1-6 al click pulsante)
- Spiegate "pseudo-casuale" con metafora: un mago che pesca sempre da un mazzo predisposto, ma con `randomSeed` rimescolate il mazzo

**Sicurezza:**
- random NON è sicuro per crittografia / sicurezza. Per progetti seri (es. password generator) usare crypto-secure RNG (avanzato, fuori scope kit ELAB)
- Pin A5 floating per seed: assicurarsi che NON sia mai usato per altro nello stesso sketch

**Cosa NON fare:**
- Non usate `random()` per scegliere LED senza randomSeed → gioco prevedibile, ragazzi annoiano
- Non re-seedate dentro loop() — annulla il vantaggio dell'imprevedibilità
- Non aspettatevi distribuzione perfetta su sample piccoli (10-20 chiamate possono mostrare cluster — è normale, non bug)

## Link L1 (raw RAG queries)

- `"random Arduino numeri casuali"`
- `"randomSeed analogRead floating pin"`
- `"Simon Says game Arduino"`
- `"pseudo-casuale LCG seed"`
- `"dado digitale LED random"`

## Analogia per la classe

Ragazzi, random() è come tirare un dado: ogni volta esce un numero diverso. Serve quando volete che il programma faccia cose diverse senza copione fisso (es. LED che lampeggia a tempi casuali).
