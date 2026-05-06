---
id: mosfet-n-channel
type: concept
title: "MOSFET a canale N — interruttore lato basso"
locale: it
volume_ref: 2
pagina_ref: 78
source_status: volume_anchored
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [mosfet, canale-n, low-side, transistor, vol2, cap8]
---

## Definizione

Il **MOSFET a canale N** e' il piu' comune nei kit Arduino: si comporta come un interruttore che si chiude quando la tensione di gate sale sopra Vth (~2 V nel kit ELAB Vol.2 pag.82). Vol.2 pag.75: "I BJT NPN e i MOSFET a canale N hanno un comportamento analogo e vengono utilizzati come interruttore".

## Pin del MOSFET kit ELAB

Vol.2 pag.78 indica l'orientamento del transistor del kit:
- Piedino sinistro -> **Gate** (G, comando)
- Piedino centrale -> **Drain** (D, lato carico)
- Piedino destro -> **Source** (S, lato massa)

Configurazione tipica "low-side switch": il MOSFET si mette tra il carico (LED + R) e GND.

## Schema base (Vol.2 pag.78)

```
   +9V
    |
    R 470 Ohm
    |
   LED (anodo)
    |
    +-- Drain
        |
       MOSFET (canale N)
        |
    +-- Source -> GND
        
Gate <- pin Arduino o batteria positivo
```

## Esempio Arduino — accensione PWM

```cpp
const int GATE = 9;  // PWM pin

void setup() {
  pinMode(GATE, OUTPUT);
}

void loop() {
  for (int v = 0; v <= 255; v++) {
    analogWrite(GATE, v);  // controlla luminosita' LED
    delay(10);
  }
}
```

## Errori comuni

1. **Source non collegato a GND** -> il MOSFET non si accende
2. **Gate flottante** quando lo scolleghiamo -> resistore pull-down 10k a massa raccomandato
3. **Carico induttivo senza diodo flyback** -> picchi di tensione bruciano il MOSFET
4. **Confondere Drain e Source** -> non funziona, il MOSFET e' "asimmetrico" sui canali integrati

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol.2 pag.78):
> Ragazzi, il libro a pagina 78 dice: "Il piedino piu' a sinistra e' il gate, quello in mezzo il drain e quello piu' a destra e' la source". Il gate e' come l'interruttore della luce, il drain e source sono i due fili.

**Cosa fare:**
- Far identificare i 3 piedini sul transistor del kit (Vol.2 pag.78)
- Far provare l'esperimento Vol.2 pag.78: gate al positivo -> LED acceso
- Spiegare che il MOSFET si chiama "a canale N" perche' conduce con tensione positiva sul gate

**Sicurezza:**
- Mai applicare > 20 V sul gate (rompe l'ossido)
- Resistore in serie al LED sempre presente

## Link L1 (raw RAG queries)

- "MOSFET canale N gate drain source"
- "Vol.2 pag 78 esperimento transistor"
- "low side switch Arduino MOSFET"
