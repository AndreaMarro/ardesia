---
id: arduino-power
type: concept
title: "Alimentazione Arduino — VIN, USB, jack, limiti tensione"
locale: it
volume_ref: 3
pagina_ref: 22
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [alimentazione, vin, usb, jack, regolatore, sicurezza, vol3, arduino-nano]
---

## Definizione

Arduino Nano R4 ha **3 modi alternativi** di alimentazione:
1. **USB** (5 V via cavo dal PC) — più sicuro, default per programmazione
2. **VIN pin** (7-12 V batteria/alimentatore) — regolatore on-board scende a 5 V interno
3. **5V pin diretto** (5 V regolata esterna) — solo per esperti, bypassa regolatore

Vol. 3 pag. 22 introduce: "Arduino è la centralina del kit. Per accenderla scegliete una sola fonte di alimentazione — mai due insieme".

## Limiti tensione (CRITICAL safety)

| Pin alimentazione | Tensione minima | Tensione max | Note |
|-------------------|-----------------|--------------|------|
| **USB** | 4.75 V | 5.25 V | Limitato dal computer/caricatore |
| **VIN** | 7 V | 12 V (max **20 V** raro) | Regolatore lineare → calore se >12 V |
| **5V** | 4.75 V | 5.5 V | Bypass regolatore — **rischio danni** |
| **3.3V** | – | – | **OUTPUT only**, mai input |

**Vol. 3 pag. 22 raccomanda**: usate USB durante programmazione + sviluppo. Passate a VIN con batteria 9 V SOLO quando il progetto è pronto e funzionante.

## Schema connessione batteria 9V

```
   Batteria 9V (+) ────────── VIN
   Batteria 9V (−) ────────── GND
```

Il regolatore lineare on-board (AMS1117 o simile) converte 9V → 5V internamente per alimentare il microcontrollore + sensori a 5 V.

**Corrente max disponibile pin 5V**: ~500 mA via USB, ~200 mA via VIN+regolatore (la differenza viene dissipata come calore). Per LED/motori/relè potenti usare alimentazione separata.

## Errori comuni (importanti per sicurezza)

1. **Alimentare USB + VIN insieme** — Possibile cortocircuito tra il regolatore VIN e l'alimentazione USB del PC. Vol. 3 pag. 22 esplicito: "una sola fonte alla volta". Scollegare il jumper 5V/USB se entrambi presenti.

2. **VIN con tensione > 12 V** — Regolatore si surriscalda → si stacca termicamente → in casi estremi si brucia. Limite assoluto 20 V momentaneo, raccomandato max 12 V continuativo.

3. **Inversione polarità** — `+` su GND e `−` su VIN può friggere il regolatore (alcune Nano hanno protezione, altre no). **Sempre verificare con multimetro prima di collegare**.

4. **5V pin direttamente da batteria 9V** — Bypassa il regolatore: i 9 V arrivano sul microcontrollore atmega328, che lavora a 5 V → **distrugge il chip immediatamente**.

5. **Massa flottante** — Arduino e alimentazione esterna devono condividere GND. Senza riferimento comune, segnali I/O sono incoerenti o danneggiano i pin.

6. **Carichi pesanti dal pin 5V** — Motori DC che consumano 800 mA bruciano il regolatore. Usare alimentazione separata per il motore + GND comune con Arduino per i segnali di controllo.

## Esperimenti correlati

- **Vol. 3 pag. 22** — Primo accendere Nano via USB
- **Vol. 3 pag. 28** — Passare a batteria 9 V via VIN (progetto autonomo)
- **Vol. 3 pag. 35** — Calcolo consumi: quanto dura la batteria con N LED accesi
- **Vol. 3 pag. 42** — Motore DC: alimentazione separata + ground comune

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 22):
> "Arduino è la centralina del kit. Per accenderla scegliete una sola fonte di alimentazione — mai due insieme."

**Cosa fare:**
- Mostrate fisicamente le 3 entrate: cavo USB, jack VIN (se presente), pin VIN/5V/GND. Fate identificare a turno
- Misurate con multimetro la tensione su 5V quando alimentate via USB → leggete ~5 V. Poi via VIN+9V → leggete ancora ~5 V. Spiegate il regolatore
- Vol. 3 pag. 22 raccomanda di NON staccare mai USB dal PC mentre la batteria 9V è collegata. Sequenza corretta: scollegare USB → poi collegare batteria

**Sicurezza (RIPETERE A OGNI LEZIONE):**
- **Mai 220 V su Arduino** — funziona a 5 V, la rete domestica brucerebbe tutto in millisecondi
- **Mai inversione polarità batteria** — controllare con multimetro: nero (−) GND, rosso (+) VIN
- **Mai due alimentazioni insieme** — una sola alla volta
- **Mai cortocircuito 5V↔GND** — vincere subito di toccare con un filo i due pin

**Cosa NON fare:**
- Non usate alimentatori da muro non regolati (i.e. trasformatori senza specifiche tensione DC esatta)
- Non collegate batteria al pin 5V direttamente (sempre via VIN se >5 V)
- Non lasciate la batteria 9V collegata quando Arduino è spento per giorni — si scarica

## Link L1 (raw RAG queries)

- `"alimentazione Arduino USB VIN"`
- `"batteria 9V Arduino regolatore"`
- `"limite tensione VIN Arduino Nano"`
- `"polarità inversa Arduino sicurezza"`
- `"5V pin bypass regolatore danni"`
