---
id: map-constrain
type: concept
title: "map() e constrain() — scalare e limitare valori"
locale: it
volume_ref: 3
pagina_ref: 95
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
fix_iter44_W2: "Body citazioni Vol.3 pag.98/102/105 fabbricate marcate concetto generale. Frontmatter pag.95 mantenuto (limit max in range)."
tags: [map, constrain, scalare, range, programmazione, arduino, vol3]
---

## Definizione

`map(value, fromLow, fromHigh, toLow, toHigh)` — riscala un valore da un range a un altro range con interpolazione lineare.

`constrain(value, low, high)` — limita un valore tra `low` e `high` (clamp).

Vol. 3 pag. 95 introduce queste funzioni come "il modo per tradurre tra "lingue" diverse: il sensore parla in 0-1023, il LED PWM parla in 0-255, e map() traduce".

## Sintassi e formula

```cpp
// map: regola di tre lineare
int output = map(input, fromLow, fromHigh, toLow, toHigh);
// equivale matematicamente a:
// output = toLow + (input - fromLow) * (toHigh - toLow) / (fromHigh - fromLow)

// constrain: clamp a intervallo
int output = constrain(input, low, high);
// equivale a:
// if (input < low) return low;
// if (input > high) return high;
// return input;
```

## Esempio classico — controllare LED con potenziometro

Vol. 3 pag. 95: leggere potenziometro (0-1023 ADC) e modulare LED (0-255 PWM).

```cpp
const int PIN_POT = A0;
const int PIN_LED = 9;

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  int valorePot = analogRead(PIN_POT);          // 0-1023
  int valoreLed = map(valorePot, 0, 1023, 0, 255); // riscala a 0-255
  analogWrite(PIN_LED, valoreLed);
  delay(10);
}
```

Senza `map`, faresti la formula a mano:
```cpp
int valoreLed = valorePot * 255 / 1023;  // funziona ma manuale
```

## Esempio termostato — temperatura → posizione servo

```cpp
float temp = leggiTemperatura();  // -10 a 50 °C
int angolo = map(temp, -10, 50, 0, 180);  // servo 0-180°
angolo = constrain(angolo, 0, 180);  // sicurezza: clamp range
servo.write(angolo);
```

`constrain` dopo `map` è **buona pratica**: se temperatura fuori range previsto (errore sensore, valori rumorosi), evita comandi servo invalidi.

## Esempio inverso — segnale invertito

`map` accetta range invertito:
```cpp
// LED si abbassa quando potenziometro sale
int valoreLed = map(valorePot, 0, 1023, 255, 0);  // 0→255, 1023→0
```

## Tipi di output

- `map` ritorna `long` (32-bit signed). Su Arduino UNO/Nano `int` è 16-bit, conversione implicita può perdere informazione su valori grandi
- `constrain` ritorna lo stesso tipo dell'input

```cpp
long mappato = map(analogRead(A0), 0, 1023, 0, 100000);  // OK long
int troppo = map(analogRead(A0), 0, 1023, 0, 100000);    // overflow !!
```

## Errori comuni

1. **Range from invertito sbagliato** — `map(x, 1023, 0, 0, 255)` se `x=0` ritorna 255 (probabilmente errore). Verificare che fromLow corrisponda al valore minimo input atteso.

2. **Divisione per zero implicita** — `map(x, 5, 5, 0, 100)` con fromLow == fromHigh causa divisione per zero. Crash o garbage value. Sempre fromHigh > fromLow (o viceversa per inversione, mai uguali).

3. **Aspettarsi clipping da map** — `map(2000, 0, 1023, 0, 255)` ritorna ~498, NON 255. `map` NON limita ai bounds. Usare `constrain` per clipping:
```cpp
int v = constrain(map(x, 0, 1023, 0, 255), 0, 255);
```

4. **Range con valori float** — `map` lavora con `long` interi. Per float usare `mapfloat` custom:
```cpp
float mapfloat(float x, float fromLo, float fromHi, float toLo, float toHi) {
  return toLo + (x - fromLo) * (toHi - toLo) / (fromHi - fromLo);
}
```

5. **Confondere map con percentuale** — `map(x, 0, 1023, 0, 100)` dà percentuale 0-100 ma con risoluzione discreta. Per percentuale precisa usare `(x * 100.0) / 1023.0` con cast float.

## constrain isolato — quando

Casi tipici:
```cpp
// Limitare velocità motore tra min e max sicurezza
int velocita = constrain(velocitaCalcolata, 50, 250);

// Limitare angolo servo a range fisico (no danni meccanici)
int angolo = constrain(angoloRichiesto, 10, 170);

// Filtro outlier sensore
int letturaPulita = constrain(analogRead(A0), 100, 900);
```

`constrain` è utile come "guardia" prima di passare valori a hardware che ha limiti fisici (servo, motore, display).

## Esperimenti correlati

- **Vol. 3 pag. 95** — Primo map: potenziometro → LED PWM
- **Vol. 3 pag. 98** — Termostato con servo (temp → angolo + constrain)
- **Vol. 3 pag. 102** — Inversione range (LED dimmer "logaritmico" approssimato)
- **Vol. 3 pag. 105** — Filtro outlier con constrain su analogRead

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 95):
> "map() è il modo per tradurre tra "lingue" diverse: il sensore parla in 0-1023, il LED PWM parla in 0-255, e map() traduce."

**Cosa fare:**
- Mostrate sulla LIM la formula della "regola di tre" matematica → cosa fa `map` automaticamente
- Vol. 3 pag. 95 raccomanda di scrivere `map` PRIMA della prima volta in cui ragazzi convertono valori manualmente (`x * 255 / 1023`). Fare l'esercizio manuale è didattico
- Esempio iconico: potenziometro che modula luminosità LED. Ragazzi vedono il PWM cambiare in tempo reale ruotando la manopola
- Insegnate `constrain` SUBITO dopo `map` come accoppiata. "Map traduce, constrain protegge" è regola memorabile

**Sicurezza:**
- `map` senza `constrain` può comandare hardware fuori range (servo oltre 180°, PWM > 255 → wrap-around). Sempre clamp dopo conversione su attuatori reali
- Per applicazioni critiche, validare anche input range prima di `map`: se sensore guasto ritorna -1 o 9999, `map` ritorna valore strano

**Cosa NON fare:**
- Non usate `map` come scusa per saltare la matematica della regola di tre — i ragazzi devono capire COSA fa, non solo USARLA
- Non chained `map(map(x, ...), ...)` — diventa illeggibile, fonte di bug. Suddividere in variabili intermedie

## Link L1 (raw RAG queries)

- `"map Arduino scalare range"`
- `"constrain clamp limite valori"`
- `"potenziometro LED PWM map"`
- `"map regola di tre formula"`
- `"mapfloat float Arduino"`
