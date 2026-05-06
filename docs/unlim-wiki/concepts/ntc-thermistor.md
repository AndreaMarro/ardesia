---
id: ntc-thermistor
type: concept
title: "Termistore NTC — temperatura analogica economica"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [ntc, termistore, temperatura, sensore, vol-non-coperto]
---

## Definizione

Un **termistore NTC** (Negative Temperature Coefficient) e' un resistore la cui resistenza **diminuisce** con la temperatura. Tipicamente 10 kΩ a 25 °C, scende a circa 3 kΩ a 50 °C. Si legge con Arduino come divisore di tensione su un pin analogico, poi si converte la resistenza in gradi tramite la formula di Steinhart-Hart o una tabella.

## Schema base — divisore con NTC

```
+5V ---+
       |
       R 10k (riferimento)
       |
       +--- A0 (Arduino)
       |
       NTC 10k
       |
      GND
```

Quando la temperatura sale, R_NTC scende -> tensione su A0 sale.

## Esempio Arduino con Steinhart-Hart approssimata

```cpp
const float R_REF = 10000.0;  // 10k riferimento
const float B = 3950.0;       // costante NTC tipica
const float T0 = 298.15;      // 25 C in Kelvin
const float R0 = 10000.0;     // resistenza a 25 C

void setup() { Serial.begin(9600); }

void loop() {
  int adc = analogRead(A0);
  float v = adc * 5.0 / 1023.0;
  float r_ntc = R_REF * v / (5.0 - v);

  // Beta equation (semplificata)
  float t_kelvin = 1.0 / (1.0/T0 + log(r_ntc/R0)/B);
  float t_celsius = t_kelvin - 273.15;

  Serial.print("R: "); Serial.print(r_ntc);
  Serial.print(" Ohm  T: "); Serial.print(t_celsius);
  Serial.println(" C");
  delay(500);
}
```

## Errori comuni

1. **Direzione del divisore** -> se metti l'NTC in alto invece che in basso, il segno della derivata si inverte
2. **Resistore di riferimento sbagliato** -> per NTC 10k usa R=10k (massima sensibilita' a 25 °C)
3. **B sbagliato** -> ogni NTC ha una costante B diversa (3380, 3950, 4250...) -- controlla il datasheet
4. **Auto-riscaldamento** -> corrente > 100 µA scalda l'NTC stesso, falsando la lettura

## Confronto con LM35/TMP36/DHT22

| Sensore | Tipo | Range | Precisione | Pin |
|---|---|---|---|---|
| NTC 10k | analogico passivo | -50 a +150 °C | ±1-2 °C | 1 ADC |
| LM35 | analogico attivo | -55 a +150 °C | ±0.5 °C | 1 ADC |
| TMP36 | analogico attivo | -40 a +125 °C | ±2 °C | 1 ADC |
| DHT22 | digitale | -40 a +80 °C | ±0.5 °C | 1 dig |

NTC = piu' economico ma richiede calibrazione e formula. LM35/TMP36 = piu' lineare, "plug and read".

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, un termistore NTC e' un resistore "termico": la sua resistenza cambia con la temperatura. Per misurare la temperatura ci basta misurare la sua resistenza con un divisore di tensione.

**Cosa fare:**
- Per il kit ELAB usate il sensore previsto dal volume (LM35 o TMP36)
- L'NTC e' nozione propedeutica utile per capire come funzionano frigoriferi, ferri da stiro, PC fan
- Mostrare la formula Steinhart-Hart come "matematica del mondo reale" (utile per spiegare il logaritmo)

**Sicurezza:**
- Mai immergere in liquidi senza guaina termorestringente
- 5 V / 10 k = 0.5 mA corrente -> trascurabile, nessun rischio

## Link L1 (raw RAG queries)

- "NTC 10k Arduino divisore tensione"
- "Steinhart-Hart formula temperatura"
- "Beta equation NTC 3950"
