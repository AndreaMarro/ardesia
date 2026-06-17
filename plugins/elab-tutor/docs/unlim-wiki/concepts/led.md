---
id: led
type: concept
title: "LED (Light-Emitting Diode)"
locale: it
volume_ref: 1
pagina_ref: 27
created_at: 2026-04-23
updated_at: 2026-04-23
updated_by: architect
tags: [led, circuito, base, luminosita, diodo]
---

## Definizione

Il LED (Light-Emitting Diode) è un componente elettronico che emette luce quando attraversato da corrente elettrica in una direzione specifica. Vol. 1 pag. 27 lo descrive come "una piccola lampadina moderna che consuma pochissimo".

## Analogia per la classe

Ragazzi, immaginate il LED come una porta girevole che lascia passare le persone (la corrente) solo in una direzione. Se provate a girarla dall'altra parte, la porta si blocca. Per questo dobbiamo collegare bene anodo e catodo.

## Anatomia

- **Anodo** (+): gamba LUNGA, si collega al positivo
- **Catodo** (−): gamba CORTA, si collega al negativo attraverso una resistenza
- **Bordo piatto** sul catodo: seconda indicazione visiva

## Parametri tipici (LED rosso 5mm)

| Parametro         | Valore                           |
|-------------------|----------------------------------|
| Tensione diretta  | 1.8-2.2V                         |
| Corrente nominale | 20 mA (0.02 A)                   |
| Resistenza serie  | ~220Ω con 5V, ~470Ω con 9V       |
| Potenza           | ~40 mW                           |

## Formula corrente-resistenza

```
R = (V_sorgente - V_led) / I_led
```

Esempio 9V sorgente, LED 2V, 20 mA target:
```
R = (9 - 2) / 0.02 = 350Ω → si sceglie 470Ω commerciale
```

## Esperimenti correlati

- Vol.1 pag.27 — Primo circuito LED (TBD link a experiments/v1-cap6-esp1.md)
- Vol.2 pag.40 — LED con PWM (luminosità variabile)

## Errori comuni

- LED collegato al contrario: non si accende, nessun danno (diodo blocca)
- Senza resistenza: LED brucia in secondi, puzza bruciato
- Resistenza troppo alta: LED fioco o spento
- Resistenza troppo bassa: LED brucia nel giro di minuti

## Link L1 (raw)

Citazioni bookText da Vol.1 pag.27 presenti in `src/data/rag-chunks.json` con query "LED" o "primo circuito".
