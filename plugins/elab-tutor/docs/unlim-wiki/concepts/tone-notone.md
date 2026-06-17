---
id: tone-notone
type: concept
title: "tone() e noTone() — generare suoni con Arduino"
locale: it
volume_ref: 3
pagina_ref: 50
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [tone, noTone, suono, frequenza, cicalino, buzzer, melodia, vol3]
---

## Definizione

`tone(pin, frequenza, durata)` genera un'onda quadra alla frequenza specificata sul pin digitale. Suona attraverso un cicalino piezo o altoparlante.

`noTone(pin)` ferma il suono.

Vol. 3 pag. 50 introduce: "tone() trasforma Arduino in uno strumento musicale primitivo — onda quadra, due voci limitate, ma sufficienti per allarmi, melodie semplici e Simon Says".

## Sintassi

```cpp
tone(pin, frequencyHz);              // suona finché noTone() o nuovo tone()
tone(pin, frequencyHz, durationMs);  // suona per durata, poi auto-stop

noTone(pin);                         // ferma immediatamente
```

Esempi:
```cpp
tone(8, 440);              // LA4 (440 Hz) infinito
tone(8, 440, 1000);        // LA4 per 1 secondo
delay(1000);
noTone(8);                 // ferma (anche se tone() avrebbe già finito)
```

## Schema cicalino piezo (Vol. 3 pag. 50)

```
   pin Arduino → [BUZZER PIEZO] → GND
```

Il piezo si comporta come un altoparlante minuscolo: vibra alla frequenza dell'onda, generando suono. Niente resistenza necessaria (impedenza alta del piezo limita corrente).

**Vol. 3 pag. 50 raccomanda pin 8** per cicalino in tutti gli esempi (Timer 2 dedicato a tone()).

## Frequenze note musicali

| Nota | Frequenza (Hz) | Note |
|------|----------------|------|
| DO4 (C4) | 262 | DO centrale |
| RE4 | 294 | |
| MI4 | 330 | |
| FA4 | 349 | |
| SOL4 | 392 | |
| LA4 (A4) | 440 | accordatura standard |
| SI4 | 494 | |
| DO5 | 523 | DO ottava sopra |

Vol. 3 pag. 53 fornisce file `pitches.h` con costanti `NOTE_C4`, `NOTE_A4`, ecc.

## Esempio melodia

```cpp
const int PIN_BUZZER = 8;
int melodia[] = {262, 262, 392, 392, 440, 440, 392};  // "twinkle twinkle"
int durate[] = {500, 500, 500, 500, 500, 500, 1000};

void setup() {
  for (int i = 0; i < 7; i++) {
    tone(PIN_BUZZER, melodia[i], durate[i]);
    delay(durate[i] + 50);  // pausa tra note (50 ms)
  }
  noTone(PIN_BUZZER);  // sicurezza fine
}

void loop() {
  // melodia suona una volta nel setup
}
```

## Limitazioni cruciali

1. **UN solo pin alla volta** — tone() usa Timer 2 di ATmega328. Solo UNA tone() può suonare contemporaneamente. Tentare di suonare 2 pin in parallelo: il secondo override il primo.

2. **PWM bloccato su pin 3 e 11** — Timer 2 controlla anche PWM dei pin 3 e 11 (`analogWrite`). Quando tone() attivo, `analogWrite(3,...)` o `analogWrite(11,...)` NON funzionano.

3. **Range frequenza**: 31 Hz – 65535 Hz teorico. Pratico 100 Hz - 5000 Hz (oltre suoni stridenti, sotto poco udibili).

4. **Onda quadra**: timbro "computer anni '80", non realistico. Per audio decente serve DAC esterno + libreria PCM.

## Errori comuni

1. **Suono continua dopo programma** — Dimenticato `noTone()` alla fine. Soluzione: sempre `noTone(pin)` prima di passare ad altra fase.

2. **Note troppo veloci** — `tone(8, 440, 50);` 50 ms per nota è troppo breve, suona "click". Minimo 100 ms per note distinguibili.

3. **Pausa tra note mancante** — Suonare note diverse senza pausa fa fondere insieme. Aggiungere 50-100 ms `delay()` tra `tone()` consecutivi.

4. **Volume basso** — Cicalino piezo è intrinsecamente debole (5-10 mW). Per volumi alti serve altoparlante 8Ω + transistor amplificatore. NON aumentare tensione direttamente al piezo (lo brucia).

5. **Suoni metallici/distorti** — Frequenza non multipla di 31.25 Hz (clock Timer 2 / 256). Ogni frequenza viene approssimata, alte note (>10 kHz) hanno errore percentuale visibile.

## Esempio Simon Says con feedback audio

```cpp
const int LED_PINS[4] = {2, 3, 4, 5};
const int FREQS[4] = {262, 330, 392, 523};  // DO MI SOL DO5

void mostraPasso(int idx) {
  digitalWrite(LED_PINS[idx], HIGH);
  tone(8, FREQS[idx], 400);
  delay(500);
  digitalWrite(LED_PINS[idx], LOW);
}
```

Vol. 3 pag. 55 lega tone() a Simon Says: ogni colore ha frequenza dedicata, ragazzi associano colore a suono.

## Esperimenti correlati

- **Vol. 3 pag. 50** — Primo tone: bip allarme
- **Vol. 3 pag. 53** — Melodia con array (twinkle twinkle, fra martino)
- **Vol. 3 pag. 55** — Simon Says con audio + LED
- **Vol. 3 pag. 60** — Sirena ambulanza (sweep frequenza)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 50):
> "tone() trasforma Arduino in uno strumento musicale primitivo — onda quadra, due voci limitate, ma sufficienti per allarmi, melodie semplici e Simon Says."

**Cosa fare:**
- Mostrate l'onda quadra sull'oscilloscopio (se disponibile): tone(8, 440) → forma d'onda quadra a 440 Hz visibile
- Vol. 3 pag. 50 raccomanda di partire SEMPRE da pin 8 + cicalino piezo SENZA resistenza. Schema più semplice possibile
- Esempio iconico: bip allarme quando temperatura > 30°C (lega tone() a sensore TMP36 → causalità chiara)
- Insegnate `noTone()` come **regola di pulizia**: ogni volta che il tono finisce, sempre stop esplicito per sicurezza

**Sicurezza:**
- Cicalino piezo non scotta. Sicuro per ragazzi.
- **Volume**: tone(8, 4000) a 4 kHz è penetrante, fastidioso a lungo. Per esercizi prolungati usare frequenze 200-500 Hz più gradevoli.
- **NON ALIMENTARE PIEZO da batteria diretta**: 9V applicato direttamente al piezo lo distrugge. Sempre tramite pin Arduino (5V con limite corrente interno).

**Cosa NON fare:**
- Non usate tone() insieme a analogWrite(3) o analogWrite(11) — Timer 2 conflict
- Non aspettatevi qualità audio — è onda quadra, niente sample audio
- Non lasciate tone() infinito senza condizione di uscita: rumore costante diventa fastidioso classe

## Link L1 (raw RAG queries)

- `"tone Arduino frequenza cicalino"`
- `"piezo buzzer schema arduino"`
- `"melodia note pitches.h"`
- `"Simon Says audio LED"`
- `"sweep frequenza sirena Arduino"`
