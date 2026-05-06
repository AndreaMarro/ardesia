---
id: mosfet-vs-bjt
type: concept
title: "MOSFET vs BJT — quale transistor scegliere"
locale: it
volume_ref: 2
pagina_ref: 75
source_status: volume_anchored
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [mosfet, bjt, transistor, confronto, vol2, cap8]
---

## Definizione

**BJT** (Bipolar Junction Transistor) e **MOSFET** (Metal Oxide Semiconductor Field Effect Transistor) sono entrambi transistor "interruttori comandati", ma con funzionamento diverso. Vol.2 pag.75 introduce: "I BJT NPN e i MOSFET a canale N hanno un comportamento analogo e vengono utilizzati come interruttore". Vol.2 pag.82 precisa: "La tensione di soglia Vth vale circa 1V per i BJT e 2V per i MOSFET utilizzati in questo kit".

## Confronto rapido

| Aspetto | BJT (NPN) | MOSFET (canale N) |
|---|---|---|
| Terminali | Base / Collettore / Emettitore | Gate / Drain / Source |
| Comando | Corrente di base | Tensione di gate |
| Vth | ~0.7 V (Vbe) | ~2 V (Vol.2 kit ELAB) |
| Resistenza ON | qualche ohm | milli-ohm (R_DS_ON) |
| Velocita' | media | alta |
| Costo | basso | medio |

## Quando usare BJT

- Piccoli carichi (< 200 mA): LED, buzzer
- Quando hai gia' un resistore di base in serie a un pin Arduino
- Circuiti analogici (amplificatori)

## Quando usare MOSFET

- Carichi piu' grandi (motori, lampadine, strisce LED)
- Quando vuoi dissipare poco (R_DS_ON bassa = pochi watt persi)
- Switching veloce (PWM ad alta frequenza)

## Esempio dal kit ELAB Vol.2 cap.8

Vol.2 pag.78 esperimento 1: MOSFET come interruttore -> gate al positivo accende il LED, gate al negativo spegne. Vol.2 pag.81 esperimento 2: tocca con il dito il gate scollegato -> la carica del corpo accende il MOSFET. Questo NON funziona con un BJT, perche' il BJT richiede corrente continua di base.

## Errori comuni

1. **Pilotare un MOSFET con corrente** invece che con tensione -> non si rovina ma si comporta strano
2. **Saturare un BJT senza resistore di base** -> brucia il transistor (corrente eccessiva)
3. **Usare MOSFET 5V con gate a 3.3V** (ESP32) -> alcuni MOSFET non aprono completamente, serve un "logic level MOSFET"
4. **Gate flottante** -> sul MOSFET il gate va sempre tenuto a un livello noto (resistore pull-down 10k a massa quando inutilizzato)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol.2 pag.75):
> Ragazzi, BJT e MOSFET sono due famiglie di transistor. Il libro a pagina 75 dice: "I BJT NPN e i MOSFET a canale N hanno un comportamento analogo e vengono utilizzati come interruttore".

**Cosa fare:**
- Far ripetere l'esperimento Vol.2 pag.78 con il MOSFET del kit
- Mostrare che il dito tocca il gate (Vol.2 pag.81) e il LED si accende -> dimostrazione tensione, non corrente
- Spiegare che il BJT lo vedremo nei volumi successivi (citazione Vol.2 pag.75: "Sara' spiegata piu' approfonditamente nei volumi successivi!")

**Sicurezza:**
- Mai toccare i piedini del MOSFET con le mani sporche di umido -> ESD puo' danneggiarlo
- Sempre resistore in serie al LED, anche con MOSFET

## Link L1 (raw RAG queries)

- "MOSFET BJT differenza Arduino"
- "Vth tensione soglia transistor"
- "logic level MOSFET 3.3V"
- "Vol.2 capitolo 8 transistor"
