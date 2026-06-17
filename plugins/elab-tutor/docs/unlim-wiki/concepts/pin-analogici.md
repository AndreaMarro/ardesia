---
id: pin-analogici
type: concept
title: "Pin analogici"
locale: it
volume_ref: 3
pagina_ref: 63
created_at: 2026-04-25
updated_at: 2026-04-25
updated_by: scribe-q4
tags: [analogico, analogread, sensori]
---

## Definizione

Pin analogici — concetto base ELAB Tutor. Vol.3 pag.63.

## Analogia per la classe

Ragazzi, I pin analogici leggono valori graduali, da 0 a 1023. Come un termometro che mostra ogni grado.

## Parametri tipici

6 pin (A0-A5). analogRead() restituisce 0-1023 mappato su 0-5V. analogWrite() PWM 0-255.

## Esperimenti correlati

- Vedi Capitolo: `v3-cap7`
- File: `src/data/capitoli/v3-cap7.json`

## Errori comuni

- `errors/analogwrite-su-pin-non-pwm.md`

## PRINCIPIO ZERO

Quando spiegate questo concetto alla classe:
- Parlate in plurale ("Vediamo insieme", "Provate")
- Citate **Vol.3 pag.63**
- Max 60 parole + 1 analogia concreta
- NO comandi diretti al docente (questo è guida silenziosa per voi)
