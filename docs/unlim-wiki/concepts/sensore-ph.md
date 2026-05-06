---
id: sensore-ph
type: concept
title: "Sensore pH — acidita' di un liquido"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [ph, sensore, liquidi, vol-non-coperto]
---

## Definizione

Un **sensore pH** misura l'acidita' di un liquido (scala 0-14, dove 7 = neutro, 0-6 = acido, 8-14 = basico). I moduli educativi tipici (es. SEN0161 / E-201-C) includono una **sonda di vetro** + scheda di amplificazione che restituisce una tensione analogica proporzionale al pH.

## Pinout modulo SEN0161

| Pin | Funzione |
|---|---|
| V+ | 5 V |
| G | GND |
| Po | uscita analogica (~2.5 V a pH 7) |
| Do | uscita digitale soglia (non usata di solito) |
| To | sensore temperatura (compensazione, opzionale) |

## Schema base

```
+5V --- V+
GND --- G
A0 ----- Po (uscita pH analogica)
```

Sonda BNC -> scheda -> uscita analogica.

## Esempio Arduino

```cpp
const int PH_PIN = A0;

void setup() { Serial.begin(9600); }

void loop() {
  long sum = 0;
  for (int i = 0; i < 10; i++) sum += analogRead(PH_PIN);
  float v = (sum / 10.0) * 5.0 / 1023.0;

  // Calibrazione lineare a 2 punti:
  // pH 4.0 -> v = 3.04 V (esempio)
  // pH 7.0 -> v = 2.50 V (esempio)
  // slope = (7.0 - 4.0) / (2.50 - 3.04) = -5.55 pH/V
  // intercept = 7.0 - slope * 2.50 = 20.875

  float ph = -5.55 * v + 20.875;
  Serial.print("V: "); Serial.print(v);
  Serial.print("  pH: "); Serial.println(ph);
  delay(1000);
}
```

## Calibrazione

Procedura standard a 2 punti:
1. Immergere sonda in tampone pH 7.00 -> registrare V_7
2. Risciacquare con acqua distillata, asciugare delicatamente
3. Immergere in tampone pH 4.01 -> registrare V_4
4. Calcolare slope e intercept come sopra

Una calibrazione mensile e' raccomandata (l'elettrodo si "stanca").

## Errori comuni

1. **Sonda asciutta o vecchia** -> letture instabili
2. **Toccare la membrana di vetro con dita** -> contaminazione (oli, sale)
3. **Cavo BNC piegato o danneggiato** -> rumore enorme
4. **Misure veloci senza media** -> letture saltellano (fai media di 10-20 campioni)
5. **Mescolare con cucchiaio metallico** -> falsa la lettura per qualche secondo

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, il pH ci dice se un liquido e' "acido" come l'aceto (pH ~3) o "basico" come il sapone (pH ~9). La sonda di vetro genera una piccola tensione che dipende dal pH, e Arduino la legge.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per progetti scienze della Terra, biologia, idroponica
- Se disponibile in laboratorio scuola, e' bellissimo da provare con: aceto (acido), acqua del rubinetto (neutro), bicarbonato sciolto (basico)
- Spiegare che il pH e' fondamentale in agricoltura, medicina, chimica

**Sicurezza:**
- Conservare la sonda in soluzione di KCl 3M, mai asciutta a lungo (si rompe la membrana)
- Risciacquare sempre con acqua distillata tra una misura e l'altra
- Liquidi acidi forti (acido cloridrico) -> NON usare con i ragazzi

## Link L1 (raw RAG queries)

- "sensore pH Arduino SEN0161 calibrazione"
- "sonda BNC pH 7 4"
- "elettrodo vetro membrana"
