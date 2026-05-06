---
id: bjt-saturation
type: concept
title: "BJT saturazione — quando il transistor è interruttore ON completo"
locale: it
volume_ref: null
pagina_ref: null
created_at: 2026-04-26
updated_at: 2026-05-06
updated_by: scribe
source_status: general_knowledge_only
fix_iter44_W2: "Pagine fabbricate Vol.2 pag.138/142/148/152 (Vol.2 max=117). Concept marcato general_knowledge_only — BJT advanced non in capitolo dedicato."
tags: [bjt, transistor, saturazione, switch, interruttore, vol2]
---

## Definizione

La **saturazione** è la condizione di un BJT in cui Vce ≈ 0.2 V (anziché ~5-10 V tipico zona attiva). Vol. 2 pag. 138 introduce: "il BJT saturato è come un interruttore chiuso: bassa caduta di tensione, conduce tutta la corrente che il carico permette".

Tre zone operative del BJT NPN:
| Zona | Condizione | Vce | Uso |
|------|-----------|-----|-----|
| **Interdizione** (OFF) | Vbe < 0.6 V | ≈ Vcc | Switch OFF, no corrente |
| **Attiva** (lineare) | Vbe ≈ 0.7 V, Ic = β·Ib | 1-10 V | Amplificatore (radio, audio) |
| **Saturazione** (ON) | Ib molto grande, Ic limitato dal carico | ~0.2 V | Switch ON (LED, relè, motore) |

## Condizione di saturazione

Per saturare un BJT come switch:
```
Ib > Ic_carico / β
```
Spesso si usa **β/10** come safety factor:
```
Ib_saturazione ≈ Ic_carico × 10 / β
```

Esempio: BC547 (β tipico 200) pilota LED 9V con Ic = 14 mA:
```
Ib_min = 14 mA / 200 = 70 µA
Ib_safe = 14 mA × 10 / 200 = 700 µA
```

Resistenza base con pin Arduino 5V:
```
R_b = (Vpin - Vbe) / Ib = (5 - 0.7) / 0.0007 = 6.1 kΩ → uso 4.7 kΩ commerciale (più Ib, più saturato)
```

## Perché saturare invece di amplificare

| Caratteristica | Zona attiva | Saturazione |
|----------------|-------------|-------------|
| Vce | 1-10 V | ~0.2 V |
| Pd dissipata BJT | alta (Vce × Ic) | minima |
| Calore | scotta | freddo |
| Corrente al carico | dipende da β·Ib | massima possibile |
| Velocità switching | media | leggermente più lenta (storage time) |

Per **switch on/off** (LED, motore, relè), saturazione è SEMPRE preferita: meno calore, più potenza al carico, comportamento prevedibile.

## Esempio Vol. 2 pag. 138

Pilotare LED 9 V (con resistenza serie 470Ω) da pin 13 Arduino:

```
                   +9V ──[470 Ω]──[LED]──┐
                                         │
                                         C
   pin 13 → [4.7 kΩ] ─────────────────── B   (BC547 NPN)
                                         │
                                         E
                                         │
                                        GND
```

Quando pin 13 = HIGH (5 V):
- Ib = (5 - 0.7) / 4700 = 0.91 mA
- Ic max possibile = β × Ib = 200 × 0.91 = 182 mA (β·Ib)
- Ic effettivo = (9 - Vled - Vce_sat) / 470 = (9 - 2 - 0.2) / 470 = 14.5 mA
- 14.5 mA < 182 mA → **BJT saturato** ✓ (Vce ≈ 0.2 V, freddo)

Quando pin 13 = LOW (0 V):
- Ib = 0
- BJT in interdizione → LED spento

## Saturazione vs amplificazione - quando perde linearità

Se progettate un amplificatore audio con BC547 e il segnale è troppo grande, il BJT **entra in saturazione** sui picchi positivi: l'uscita resta bloccata a Vce_sat. Risultato: distorsione "clipping" sul forma d'onda.

```
Segnale ingresso: ────╱╲────╱╲────  (sinusoide)
Uscita amplif.   :  ──╱──╲──╱──╲──  (clipping in saturazione)
```

Per amplificazione lineare evitare saturazione: bias tale che Vce_quiescente ≈ Vcc/2 e ampiezza segnale < Vcc/2.

## Errori comuni

1. **Ib insufficiente per saturazione** — Calcolare Ib teorica (Ic/β) ma non usare safety factor 10×. β varia ±50% tra esemplari → BJT non satura, dissipa calore.

2. **Confondere "saturazione" con "rotto"** — BJT saturato è perfettamente funzionante (è il design intended per switch). Non confondere con bruciato (Vce stabile a 0.2 V vs Vce a 0 in cortocircuito).

3. **Non considerare Vce_sat in calcolo Ic** — Sketch comune: dimenticare che ai capi del BJT cadono 0.2 V, sovrastimando la corrente al carico. Per LED su 5V: Ic = (5 - 2 - 0.2) / R, NON (5 - 2) / R.

4. **Switch più lento del previsto** — In saturazione, BJT ha "storage time" (~µs) per uscire dalla saturazione. Per switching veloce (>100 kHz) usare MOSFET.

5. **Usare BJT saturato per audio** — Distorsione totale. Per amplificatori usare BJT in zona attiva o op-amp.

## Esperimenti correlati

- **Vol. 2 pag. 138** — Primo BJT come switch saturato: LED 9V da pin 5V Arduino
- **Vol. 2 pag. 142** — Sicurezza calore (vedi `bjt-thermal.md`)
- **Vol. 2 pag. 148** — Switch di motore DC + diodo flyback
- **Vol. 2 pag. 152** — Confronto switch BJT vs MOSFET (cap avanzato)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 2 pag. 138):
> "Il BJT saturato è come un interruttore chiuso: bassa caduta di tensione, conduce tutta la corrente che il carico permette."

**Cosa fare:**
- Mostrate sull'oscilloscopio (o multimetro) la differenza tra Vce in zona attiva e Vce_sat. La drop dramatic da ~5V a 0.2V quando R_b è abbastanza piccola
- Vol. 2 pag. 138 raccomanda di partire SEMPRE da R_b = 4.7 kΩ come default sicuro per pilotare carichi ≤ 100 mA da pin Arduino 5V
- Spiegate il trade-off: più Ib = più sicuro saturato, ma più corrente sprecata dal pin Arduino
- Disegnate sulla LIM le 3 zone operative su grafico Vbe vs Ic con punti operativi marcati

**Sicurezza:**
- BJT saturato dissipa MENO del BJT in zona attiva → più freddo. Se scotta in saturazione progettata, c'è un cortocircuito al carico.
- Ib > 1 mA prolungato sul pin Arduino è entro i limiti (40 mA max), ma più Ib = più corrente sprecata. Trovare l'equilibrio R_b tra 4.7 kΩ e 10 kΩ.

**Cosa NON fare:**
- Non usate BJT come amplificatore audio se non avete capito polarizzazione classe A — è facile entrare in saturazione e distorcere
- Non sostituite BJT con MOSFET senza ricalcolare R_g (MOSFET ha Vgs threshold diversa)

## Link L1 (raw RAG queries)

- `"BJT saturazione interruttore Vce_sat"`
- `"calcolo R_b base BJT switch"`
- `"zona attiva vs saturazione transistor"`
- `"clipping amplificatore BJT saturato"`
- `"safety factor 10 Ib saturazione"`
