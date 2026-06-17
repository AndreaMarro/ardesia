---
id: timer1-timer2
type: concept
title: "Timer1 e Timer2 — interrupt periodici precisi"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [timer, interrupt, atmega328p, vol-non-coperto]
---

## Definizione

Arduino UNO/Nano (ATmega328P) ha **3 timer hardware**:

- **Timer0** (8 bit) -- usato da `millis()`, `delay()`, `analogWrite()` su D5/D6. **NON toccare**
- **Timer1** (16 bit) -- libero, controlla anche `analogWrite()` su D9/D10
- **Timer2** (8 bit) -- libero, controlla anche `analogWrite()` su D3/D11 + `tone()`

I timer permettono di eseguire una funzione (interrupt) a intervalli precisi (microsecondi) **senza** usare `delay()` che blocca tutto il programma.

## Esempio: Timer1 che fa lampeggiare un LED ogni secondo

Libreria piu' semplice: **TimerOne** (Library Manager).

```cpp
#include <TimerOne.h>

const int LED = 13;
volatile bool stato = false;

void onTimer() {
  stato = !stato;
  digitalWrite(LED, stato);
}

void setup() {
  pinMode(LED, OUTPUT);
  Timer1.initialize(1000000);  // 1 secondo in microsecondi
  Timer1.attachInterrupt(onTimer);
}

void loop() {
  // qui puoi fare qualunque cosa: il LED continua a lampeggiare in background
  Serial.println("loop principale libero!");
  delay(100);
}
```

## Perche' usare un Timer invece di delay()

- `delay()` blocca il `loop()` -> Arduino non puo' leggere sensori, gestire seriale, rispondere a pulsanti
- Timer interrupt -> la funzione si esegue "in parallelo", il `loop()` resta libero
- Precisione superiore (a 16 MHz Arduino calcola al microsecondo)

## Conflitti con `analogWrite()`

Modificando i registri Timer1 si rompe `analogWrite()` su **D9 e D10**. Modificando Timer2 si rompe **D3 e D11** + `tone()`.

Per `analogWrite` leggi `pwm-detail.md`.

## Timer2 per audio

`tone(pin, frequenza)` usa Timer2 internamente. Per generare segnali audio precisi, libreria **TimerThree** o accesso diretto ai registri (`TCCR2A`, `TCCR2B`, `OCR2A`).

## Errori comuni

1. **`Serial.print` dentro l'interrupt** -> bloccante, rompe il timing
2. **Variabile condivisa non `volatile`** -> il compilatore puo' "ottimizzarla via", l'interrupt non si vede
3. **Modificare Timer0** -> rompe `millis()`, `delay()`, `Serial`
4. **Interrupt troppo frequente** (< 10 µs) -> il `loop()` non gira piu'
5. **Calcoli pesanti dentro interrupt** -> mantieni interrupt brevissimi (<10 µs ideale)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, dentro Arduino ci sono 3 "orologini" (Timer) che possono far eseguire una funzione a intervalli precisissimi, in parallelo al programma principale. E' come avere un secondo cervello che batte il tempo mentre voi pensate ad altro.

**Cosa fare:**
- NON introdurre Timer prima che i ragazzi siano comodi con `millis()` (concetto "non-blocking" piu' semplice)
- Spiegare che `delay()` e' come "tenere il fiato" -- Timer e' come avere un metronomo che continua mentre respiriamo
- Idea: Timer1 fa pulsare LED, intanto il `loop()` legge un potenziometro

**Sicurezza:**
- Variabili condivise tra `loop()` e interrupt sempre `volatile`
- Mai funzioni lunghe dentro interrupt (no `Serial.print` lunghi, no `delay()`)

## Link L1 (raw RAG queries)

- "Timer1 Arduino TimerOne libreria"
- "interrupt periodico ATmega328P"
- "volatile variabile Arduino interrupt"
