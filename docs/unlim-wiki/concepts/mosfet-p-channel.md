---
id: mosfet-p-channel
type: concept
title: "MOSFET a canale P — interruttore lato alto"
locale: it
volume_ref: 2
pagina_ref: 75
source_status: volume_anchored
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [mosfet, canale-p, high-side, transistor, vol2, cap8]
---

## Definizione

Il **MOSFET a canale P** e' il "fratello" del canale N: si accende quando la tensione di gate scende sotto Vth (gate negativo rispetto al source). Vol.2 pag.75: "I BJT PNP e i MOSFET a canale P vengono utilizzati come interruttore 'che chiude'" -- spiegazione semplificata, complementare al canale N.

## Quando usarlo: high-side switch

Il MOSFET canale P si mette tra l'alimentazione positiva (+V) e il carico, **sopra** il LED. Permette di scollegare un carico dalla VCC mantenendo il GND comune. Utile quando si vuole spegnere completamente un sotto-circuito senza staccarlo da massa.

## Schema base

```
+9V ---+--- Source
       |
      MOSFET (canale P)
       |
       +--- Drain
            |
            R 470 Ohm
            |
           LED (anodo)
            |
           GND

Gate <- 0V = ON (LED acceso)
Gate <- +9V = OFF (LED spento)
```

## Esempio: spegnere un carico via Arduino

Per pilotare un canale P con Arduino 5V serve un BJT NPN intermedio (level shifter), perche' Arduino non puo' tirare il gate sotto -V. Schema "two-stage":

1. Arduino pin -> base BJT NPN -> collettore al gate del P-MOSFET (tira a GND quando NPN conduce -> P-MOSFET ON)
2. Resistore pull-up dal gate al +V (mantiene OFF a riposo)

## Errori comuni

1. **Confondere logica** -> sul canale P "gate basso = ON", contro-intuitivo rispetto al canale N
2. **Pilotaggio diretto da Arduino** -> 5V sul gate non spegne completamente un canale P alimentato a 9V (V_gs solo -4V, troppo poco)
3. **Pull-up assente** -> il gate flottante puo' restare in stato indefinito

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, esistono due famiglie di MOSFET: canale N e canale P. Il libro a pagina 75 dice che il canale N "chiude" quando il gate e' alto, il canale P quando il gate e' basso. E' come due interruttori complementari.

**Cosa fare:**
- Mostrare il transistor del kit -> e' canale N (Vol.2 pag.78)
- Spiegare che il canale P si trova tipicamente nei circuiti di alimentazione (load-switch, batteria al litio)
- NON costruire il circuito P-MOSFET in classe (richiede BJT intermedio, eccede il kit base)

**Sicurezza:**
- ESD-sensibile come il canale N
- Mai cortocircuitare V+ a GND tramite il MOSFET (carichi sempre in serie)

## Link L1 (raw RAG queries)

- "MOSFET canale P high side switch"
- "P-MOSFET pilotaggio Arduino BJT"
- "Vol.2 pag 75 canale P canale N"
