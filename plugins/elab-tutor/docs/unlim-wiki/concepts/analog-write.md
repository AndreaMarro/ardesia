---
id: analog-write
type: concept
title: "analogWrite() — uscita PWM"
locale: it
volume_ref: 3
pagina_ref: 89
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe-opus
tags: [analogwrite, pwm, output, fading, pin-digitali, ~3-5-6-9-10-11]
---

## Definizione

`analogWrite()` invia un segnale PWM (modulazione di larghezza di impulso) sui pin digitali contrassegnati col simbolo tilde `~` su Arduino Nano. Vol.3 pag.89.

Sintassi: `analogWrite(pin, valore)` dove `valore` va da 0 (sempre OFF) a 255 (sempre ON). Pin disponibili: D3, D5, D6, D9, D10, D11.

## Analogia per la classe

Ragazzi, analogWrite() funziona come un dimmer della luce di casa: non spegne né accende del tutto, ma cambia rapidissimo ON e OFF tante volte al secondo. Se la lampadina è ON solo metà del tempo, sembra mezza luminosa — ma è un trucco degli occhi nostri.

## Differenza con digitalWrite()

| Funzione         | Output           | Pin compatibili        | Scopo                   |
|------------------|------------------|------------------------|-------------------------|
| `digitalWrite()` | HIGH/LOW (0 o 5V)| Tutti i digitali       | ON/OFF puro             |
| `analogWrite()`  | PWM 0-255        | Solo pin con tilde `~` | Intensità variabile     |

## Parametri tipici

- Frequenza PWM Arduino Nano: 490 Hz (D3, D9, D10, D11) oppure 980 Hz (D5, D6).
- Risoluzione: 8 bit (256 livelli).
- Duty cycle: 0% = sempre OFF, 50% = ON metà tempo, 100% = sempre ON.
- Compatibile con LED dimmerati, motori DC velocità variabile, servo motor (con libreria Servo).

## Esperimenti correlati

- Vedi Capitolo: `v3-cap5-pwm-fading`
- Concetto: `pwm.md` (teoria PWM)
- Concetto: `fade-led.md` (esempio pratico fade)
- Sketch: `examples/fade-led.ino` (Arduino IDE)

## Errori comuni

- Usare `analogWrite()` su pin senza tilde (D2, D4, D7, D8, D12, D13) — non emette PWM, comporta solo HIGH se valore >127.
- Confondere `analogRead()` (input ADC, valori 0-1023) con `analogWrite()` (output PWM, valori 0-255).
- Dimenticare `pinMode(pin, OUTPUT)` nel `setup()` — analogWrite implicita non sempre la chiama.

## PRINCIPIO ZERO

Quando spiegate questo concetto alla classe:
- Parlate in plurale ("Vediamo insieme", "Provate il dimmer")
- Citate **Vol.3 pag.89**
- Mostrate il pin tilde `~` sul Nano fisico — gli occhi devono toccare la scheda
- MAX 60 parole + 1 analogia concreta (dimmer luce casa)
- NO comandi diretti al docente — questa è guida silenziosa per voi
