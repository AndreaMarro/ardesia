---
id: millis-vs-delay
type: concept
title: "millis() vs delay() — timing bloccante e non-bloccante"
locale: it
volume_ref: 3
pagina_ref: 85
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
fix_iter44_W2: "Body citazione Vol.3 pag.100 fabbricata (Vol.3 max=95) marcata concetto generale. Frontmatter pag.85 OK."
tags: [millis, delay, timing, non-blocking, arduino, vol3, intermedio]
---

## Definizione

`delay(ms)` blocca completamente Arduino per `ms` millisecondi. Durante l'attesa, **niente altro accade**: nessuna lettura sensori, nessun pulsante reagisce, nessuna comunicazione seriale.

`millis()` ritorna il numero di millisecondi trascorsi dall'accensione di Arduino. Permette di gestire timing **senza bloccare** il loop principale.

Vol. 3 pag. 85 introduce: "delay è semplice ma rende Arduino sordo. millis è più complesso ma permette di fare tante cose insieme".

## Esempio classico — perché delay è limitato

**Sketch con delay (ROTTO se vogliamo leggere pulsante):**
```cpp
void loop() {
  digitalWrite(LED, HIGH);
  delay(1000);              // ← Arduino "morto" per 1 sec
  digitalWrite(LED, LOW);
  delay(1000);              // ← Arduino "morto" altri 1 sec

  // Pulsante non viene mai letto se premuto durante delay !!
  if (digitalRead(BUTTON) == LOW) {
    // ...
  }
}
```

**Sketch con millis (corretto):**
```cpp
unsigned long lastBlink = 0;
const unsigned long INTERVAL = 1000;
bool ledState = false;

void loop() {
  unsigned long now = millis();

  if (now - lastBlink >= INTERVAL) {
    lastBlink = now;
    ledState = !ledState;
    digitalWrite(LED, ledState);
  }

  // Pulsante reattivo: letto AD OGNI loop, non bloccato
  if (digitalRead(BUTTON) == LOW) {
    // gestione pulsante immediata
  }
}
```

## Pattern "blink without delay" Vol.3 pag.85

Template universale per timing non-bloccante:

```cpp
unsigned long previousMillis = 0;

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= INTERVAL) {
    previousMillis = currentMillis;
    // azione periodica QUI
  }

  // altre operazioni QUI (tutte reattive)
}
```

Vol. 3 pag. 85 chiama questo pattern "il modo professionale di gestire il tempo in Arduino".

## Quando usare delay()

`delay()` è ancora utile quando:
- Sketch didattico semplice (primi 5 minuti di Arduino, Vol. 3 pag. 1-30)
- Attesa fissa breve durante setup() (calibrazione sensori)
- Niente altri input/output da gestire

NON usare delay() quando:
- Servono input pulsanti reattivi
- Multipli LED a frequenze diverse
- Comunicazione seriale parallela
- Sensori da leggere periodicamente

## Limite di millis()

`millis()` ritorna `unsigned long` (32 bit) → conta fino a **49.7 giorni** prima di overflow (rollover a 0).

**Trick contro rollover** (sottrazione unsigned wraps automaticamente):
```cpp
if (millis() - lastEvent >= INTERVAL) { ... }
```
Funziona correttamente anche dopo overflow grazie all'aritmetica unsigned. **Mai usare** `if (millis() >= lastEvent + INTERVAL)` — questa forma rompe al rollover.

## Esempio multi-task con millis()

Lampeggiare 2 LED a frequenze diverse + leggere pulsante:

```cpp
unsigned long led1Last = 0;
unsigned long led2Last = 0;
const unsigned long LED1_INT = 500;   // 0.5s
const unsigned long LED2_INT = 1500;  // 1.5s
bool led1State = false, led2State = false;

void loop() {
  unsigned long now = millis();

  if (now - led1Last >= LED1_INT) {
    led1Last = now;
    led1State = !led1State;
    digitalWrite(LED1, led1State);
  }

  if (now - led2Last >= LED2_INT) {
    led2Last = now;
    led2State = !led2State;
    digitalWrite(LED2, led2State);
  }

  if (digitalRead(BUTTON) == LOW) {
    // pulsante sempre reattivo
    delay(50);  // OK qui per debounce breve
  }
}
```

Vol. 3 pag. 88 estende questo pattern fino a 4 LED + sensore TMP36 + Serial output, tutti senza bloccare.

## Errori comuni

1. **Usare `int` invece di `unsigned long` per memorizzare millis()** — `int` overflow a 32 secondi (16-bit signed). Sempre `unsigned long` per millis values.

2. **Mancare `unsigned` in confronto** — `if (millis() - last > 1000)` con `last` di tipo signed può comportarsi male al rollover.

3. **Pensare che millis() sia preciso al microsecondo** — millis() ha risoluzione 1 ms. Per timing più fini (PWM custom, generatori onda) usare `micros()` (risoluzione 4 µs).

4. **Resettare previousMillis a 0 invece che a now** — `previousMillis = 0` dopo evento spara l'azione SUBITO al loop successivo (perché now - 0 > INTERVAL). Sempre `previousMillis = currentMillis` (o equivalente).

5. **Mescolare delay() e millis() nello stesso sketch** — Un solo `delay(2000)` rovina la reattività di tutti i task con millis(). Convertire l'intero sketch al pattern non-bloccante.

## Esperimenti correlati

- **Vol. 3 pag. 85** — Primo "blink without delay"
- **Vol. 3 pag. 88** — Multi-task: 2 LED + pulsante + sensore
- **Vol. 3 pag. 95** — Cronometro digitale (vedi `cronometro.md`)
- **Vol. 3 pag. 100** — Datalogger temperatura ogni minuto

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 85):
> "delay è semplice ma rende Arduino sordo. millis è più complesso ma permette di fare tante cose insieme."

**Cosa fare:**
- Mostrate empiricamente: sketch con delay(2000) + pulsante. Premete pulsante: niente succede subito. Ragazzi capiscono "Arduino non sente"
- Convertite lo stesso sketch a millis(). Premete pulsante durante "wait": reazione immediata. Lezione visiva potente
- Vol. 3 pag. 85 raccomanda di insegnare millis() solo dopo che ragazzi padroneggiano `if`, `unsigned long`, e variabili di stato. Non prima
- Disegnate sulla LIM una "linea del tempo" con due cursori: `now` (avanza sempre), `lastEvent` (si aggiorna a evento). Differenza = "tempo trascorso"

**Sicurezza:**
- Niente specifico, ma timing scorretto può portare a comportamenti imprevisti (LED che lampeggia troppo veloce → epilessia indotta? Estremo, ma a 25 Hz alcuni soggetti sensibili)
- Evitare delay > 2 secondi dentro loop() — perde input pulsanti

**Cosa NON fare:**
- Non insegnate millis() come prima cosa — scoraggia. Iniziare con delay() per i primi 5-10 sketch
- Non usate delay(0) o delay() con valori frazionari (millisecondi sotto 1 ms): non funzionano. Per quelle precisione usare `delayMicroseconds(us)`

## Link L1 (raw RAG queries)

- `"millis() vs delay() Arduino non bloccante"`
- `"blink without delay pattern"`
- `"unsigned long rollover millis 49 giorni"`
- `"multi task Arduino senza bloccare"`
- `"micros() risoluzione timing fine"`

## Analogia per la classe

Ragazzi, delay() è come fermare l'orologio: tutto si blocca finché finisce. millis() è il cronometro che corre sempre: voi guardate quanto è passato senza fermarvi. Se Arduino deve fare 2 cose insieme, serve millis().
