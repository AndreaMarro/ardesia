---
id: pwm-detail
type: concept
title: "PWM in dettaglio — duty cycle, frequenza, risoluzione"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [pwm, analog-write, duty-cycle, timer, vol-non-coperto]
---

## Definizione

**PWM** (Pulse Width Modulation) e' una tecnica per simulare un segnale analogico usando solo livelli digitali (HIGH/LOW). Il pin si accende e si spegne molto velocemente: la **percentuale di tempo HIGH** (duty cycle 0-100%) determina la "tensione media" che vede il carico (LED, motore, buzzer).

Su Arduino UNO/Nano con `analogWrite(pin, valore)`:
- `valore = 0` -> 0% duty (sempre LOW, "spento")
- `valore = 127` -> 50% duty (meta' tempo HIGH, meta' LOW)
- `valore = 255` -> 100% duty (sempre HIGH, "acceso")

## Pin PWM su Arduino UNO/Nano

I pin con simbolo `~` sono PWM hardware: **D3, D5, D6, D9, D10, D11**. Su altri pin `analogWrite()` non funziona.

## Frequenza di default

- D5, D6 -> ~980 Hz (Timer0, condiviso con `millis()` e `delay()`)
- D3, D9, D10, D11 -> ~490 Hz (Timer1/Timer2)

Per LED e motori a basso giro la frequenza di default va bene. Per applicazioni audio o motori che "fischiano" si puo' alzare con registri Timer (avanzato).

## Risoluzione

Su Arduino UNO/Nano la risoluzione PWM standard e' **8 bit** (0-255). Su Arduino R4 e ESP32 si arriva a 12-16 bit.

## Esempio: dimmer LED

```cpp
const int LED = 9;

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int v = 0; v <= 255; v++) {
    analogWrite(LED, v);
    delay(10);
  }
  for (int v = 255; v >= 0; v--) {
    analogWrite(LED, v);
    delay(10);
  }
}
```

## Errori comuni

1. **Usare un pin non-PWM** (es. D7) -> `analogWrite()` si comporta come `digitalWrite()` con soglia su 128
2. **Modificare Timer0** -> rompe `millis()`, `delay()`, `Serial`
3. **PWM su carichi induttivi** (motori, rele') senza diodo di flyback -> picchi di tensione che danneggiano il transistor di pilotaggio
4. **Frequenza udibile** sotto i 2 kHz -> il motore "fischia" (mosca dentro la cassa)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il PWM e' un trucco per "fingere" tensioni intermedie usando solo HIGH e LOW. E' come accendere e spegnere la luce 500 volte al secondo: l'occhio vede una luminosita' intermedia.

**Cosa fare:**
- Far provare i 6 pin PWM con un LED + resistore -> notare che D7 NON funziona come dimmer
- Far variare il duty cycle con un potenziometro letto da `analogRead()` mappato 0-255
- Spiegare che PWM != tensione vera (con un voltmetro normale si legge la media)

**Sicurezza:**
- Per motori DC > 200 mA usare un MOSFET o L293D, mai pilotare il motore direttamente dal pin
- Sempre diodo flyback (1N4007) sui carichi induttivi

## Link L1 (raw RAG queries)

- "PWM duty cycle Arduino"
- "analogWrite pin 9 LED dimmer"
- "frequenza PWM 490 Hz 980 Hz"
- "Timer0 millis interferenza PWM"
