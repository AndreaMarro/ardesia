---
id: hc-sr04
type: concept
title: "HC-SR04 — alias retrieval per sensore ultrasuoni"
locale: it
volume_ref: 3
pagina_ref: 130
canonical_ref: "concepts/ultrasonic-hcsr04.md"
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: claude-sonnet-4-6
tags: [hcsr04, hc-sr04, ultrasuoni, distanza, sensore, pulsein, vol3, echolocalizzazione]
---

> **Nota alias:** questo file è un alias di retrieval per le query "HC-SR04" (formato con trattini e maiuscole).
> Il file canonico completo è [`ultrasonic-hcsr04.md`](ultrasonic-hcsr04.md) — contiene schema collegamento, codice, limitazioni e PRINCIPIO ZERO esteso.

## Definizione

**HC-SR04** è il sensore a ultrasuoni del kit ELAB: emette un burst di suono a 40 kHz e misura il tempo di ritorno dell'eco per calcolare la distanza da un ostacolo. Vol. 3 pag. 130 lo descrive come «il "pipistrello" del kit: emette un suono troppo acuto per noi, e ascolta il ritorno per capire quanto è lontano un oggetto».

Range operativo: **2 cm – 400 cm**. Risoluzione: ≈ 3 mm. Cono rilevazione: 15°.

## Analogia per la classe

Ragazzi, avete mai visto un pipistrello volare al buio senza sbattere contro le pareti? Lo fa emettendo urletti talmente acuti che noi non sentiamo, poi ascolta l'eco che rimbalza. L'HC-SR04 fa esattamente la stessa cosa — solo che usa l'elettronica al posto delle orecchie!

## Pinout e formula chiave

```
Arduino        HC-SR04
  5V    ──→  VCC
  pin9  ──→  TRIG   (Arduino invia impulso 10 µs)
  pin8  ←──  ECHO   (Arduino misura durata eco)
  GND   ──→  GND
```

```
distanza (cm) = pulseIn(ECHO, HIGH) × 0.0343 / 2
                                      ───────────
                                      velocità suono cm/µs
                                              /2 (andata + ritorno)
```

Vol. 3 pag. 130 spiega: la velocità del suono è 343 m/s = 0.0343 cm/µs a 20°C.

## Errori comuni rapidi

1. **TRIG ↔ ECHO invertiti** — lettura sempre 0. Rispettare il pinout.
2. **`pulseIn` senza timeout** — Arduino si blocca se nessun eco torna. Usare `pulseIn(pin, HIGH, 30000)`.
3. **Refresh < 60 ms** — echi residui del burst precedente falsano la lettura successiva.

## PRINCIPIO ZERO

Ragazzi, prendete il righello — misurate la distanza tra il sensore e il muro. Poi guardate il Serial Monitor: i numeri dovrebbero corrispondere (errore tipico < ±1 cm). Questo è il modo più diretto per **verificare che il kit funziona** prima di qualsiasi progetto più complesso.

Il sensore è sicuro: 40 kHz è inudibile per l'orecchio umano. Se avete un cane in classe, spegnetelo tra un esperimento e l'altro — i cani sentono frequenze più alte.

## Link L1 (raw RAG queries)

- `"HC-SR04 ultrasuoni distanza Arduino"`
- `"pulseIn ECHO timeout 30000 Arduino"`
- `"pipistrello echolocalizzazione sensore ultrasuoni"`
- `"velocità suono 343 m/s cm/µs distanza"`
- `"sensore distanza parcheggio LED buzzer Vol.3"`
