---
id: mosfet-logic-level
type: concept
title: "MOSFET logic level — gate sopporta 3.3-5 V"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [mosfet, logic-level, gate, arduino, vol-non-coperto]
---

## Definizione

Un **MOSFET logic level** (LL-MOSFET) e' un MOSFET il cui gate si "apre completamente" gia' a tensioni basse (3-5 V), invece di richiedere 10 V come molti MOSFET di potenza tradizionali (es. IRF540). E' il tipo giusto per pilotare carichi medi/grandi direttamente da pin Arduino (5V) o ESP32 (3.3V).

## Differenza pratica

A 5 V sul gate:
- **MOSFET standard** (IRF540): R_DS_ON ~ 0.5 Ω -> a 3 A si dissipano 4.5 W = MOSFET caldissimo, perdita di potenza alta
- **MOSFET logic level** (IRL540, IRLZ44N, AOD4184A): R_DS_ON ~ 0.04 Ω -> a 3 A si dissipano 0.36 W = freddo, efficiente

## Modelli consigliati

| Modello | I_D max | Vds max | R_DS_ON @ 5V | Note |
|---|---|---|---|---|
| IRL540 | 28 A | 100 V | 0.077 Ω | TO-220, classico |
| IRLZ44N | 47 A | 55 V | 0.022 Ω | TO-220, basso costo |
| AOD4184A | 50 A | 40 V | 0.0046 Ω | DPAK, SMT |
| FQP30N06L | 30 A | 60 V | 0.045 Ω | TO-220, "L" significa logic level |

Convenzione "L" o "logic level" nel nome aiuta a riconoscerli, ma sempre verificare il datasheet sezione "V_GS(th)".

## Schema con Arduino (low side)

```
+9V (alim. esterna) ---+
                       |
                   carico (motore, LED ad alta corrente, strip LED)
                       |
                       +---+--- diodo flyback (catodo verso +V, se carico induttivo)
                       |
                       +--- Drain MOSFET LL
                                |
                            Source --- GND (comune con Arduino)

Gate <- 220 Ω <- pin Arduino D9 (PWM)
Gate -> 10 kΩ pull-down -> GND  (impedisce flottazione)
```

## Pull-down al gate

Importantissimo aggiungere resistenza 10 kΩ tra gate e GND: durante il boot Arduino i pin sono in input alto-impedenza, e il gate flottante puo' accendere il MOSFET random per qualche centinaio di ms (LED che lampeggia, motore che scatta).

## Errori comuni

1. **MOSFET non logic level pilotato a 5V** -> R_DS_ON alta, calore enorme, possibile distruzione
2. **Pull-down assente** -> stati indefiniti al boot
3. **Resistenza in serie al gate troppo alta** (10 kΩ invece di 100-330 Ω) -> switching lento -> dissipazione PWM elevata
4. **Source non comune con Arduino GND** -> non c'e' V_GS, MOSFET resta spento
5. **Gate sopra Vgs_max** (tipicamente 20 V) -> ossido si rompe permanentemente

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, esistono due tipi di MOSFET: quelli "logic level" che si aprono con 5 V come quelli di Arduino, e quelli "standard" che richiedono 10-12 V. Quando volete pilotare carichi grandi da Arduino, scegliete un MOSFET logic level: scalda meno e funziona meglio.

**Cosa fare:**
- Per il kit ELAB Vol.2 il MOSFET incluso e' adatto al kit (vedi `mosfet.md` + Vol.2 cap.8)
- Spiegare il concetto di V_gs_th come "soglia di accensione del rubinetto"
- Far misurare la temperatura del MOSFET con/senza dissipatore -> esperienza tattile

**Sicurezza:**
- Sempre alim. esterna per carichi > 200 mA, mai dal 5V Arduino
- GND comune obbligatorio
- Diodo flyback su carichi induttivi sempre

## Link L1 (raw RAG queries)

- "MOSFET logic level IRLZ44N"
- "V_gs_th 2V 5V threshold"
- "pull-down gate MOSFET 10k"
