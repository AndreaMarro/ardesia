---
id: legge-ohm
type: concept
title: "Legge di Ohm (V = R × I)"
locale: it
volume_ref: 1
pagina_ref: 45
created_at: 2026-04-23
updated_at: 2026-04-23
updated_by: architect
tags: [legge-ohm, formula, teoria, V=RI, corrente, tensione, resistenza]
---

## Definizione

La legge di Ohm lega tre grandezze elettriche fondamentali: tensione (V, Volt), corrente (I, Ampere), resistenza (R, Ohm). Vol. 1 pag. 45 la introduce come "la formula madre di tutto il corso".

## Formula

```
V = R × I
```

Riarrangiamenti utili:
```
R = V / I    (se conosco V e I, trovo R)
I = V / R    (se conosco V e R, trovo I)
```

## Analogia idraulica per la classe

Ragazzi, immaginate l'acqua in un tubo:
- **Tensione (V)** = pressione dell'acqua
- **Corrente (I)** = quanta acqua scorre al secondo
- **Resistenza (R)** = quanto è stretto il tubo

Più pressione → più acqua. Più tubo stretto → meno acqua passa. La formula V=R×I descrive questo.

## Esempi risolti

### Esempio 1 — LED con 9V e 470Ω
```
I = V / R = 9V / 470Ω ≈ 0.019A = 19 mA
```
OK per un LED normale (20 mA nominale).

### Esempio 2 — Pull-up con 5V
```
R = V / I = 5V / 0.0001A = 50.000Ω = 50 kΩ
```
Con pull-up 10 kΩ, corrente = 0.5 mA (basso, safe).

## Applicazioni nei volumi

- Vol.1 pag.45 — Introduzione teoria
- Vol.1 pag.50 — Calcolo resistenza per LED
- Vol.2 pag.8 — Partitore di tensione
- Vol.2 pag.30 — Dimensionamento per MOSFET gate

## Esperimenti correlati

- v1-cap6-esp1 — Primo LED (applicazione V=R×I)
- v2-cap3-esp5 — Partitore potenziometro

## Principio Zero v3 reminder

Quando spieghi la legge di Ohm alla classe, parti dall'analogia idraulica (concreto), poi introduci formula (astratto). Cita Vol.1 pag.45 per dare fonte concreta.
