---
id: sensore-corrente-acs712
type: concept
title: "ACS712 — sensore di corrente effetto Hall"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [acs712, corrente, hall, sensore, vol-non-coperto]
---

## Definizione

L'**ACS712** e' un sensore di corrente basato sull'**effetto Hall** che misura corrente AC e DC senza contatto galvanico (il filo passa attraverso il chip e crea un campo magnetico proporzionale alla corrente). Versioni: 5 A (ACS712-05B, sensitivita' 185 mV/A), 20 A (100 mV/A), 30 A (66 mV/A).

A riposo (corrente = 0) l'uscita e' VCC/2 (~2.5 V su 5 V). Corrente positiva alza, corrente negativa abbassa.

## Pinout modulo

| Pin | Funzione |
|---|---|
| VCC | 5 V |
| GND | massa |
| OUT | uscita analogica (~2.5 V a 0 A) |
| IP+ | terminale corrente lato 1 (morsetto a vite) |
| IP- | terminale corrente lato 2 |

Il filo del carico passa attraverso IP+ e IP-, NON tocca i pin logici.

## Schema collegamento

```
Carico ---[IP+]--- ACS712 ---[IP-]--- alim. esterna
                     |
                    VCC --- 5V Arduino
                    GND --- GND Arduino
                    OUT --- A0 Arduino
```

## Esempio Arduino (ACS712-05B, 185 mV/A)

```cpp
const int CURRENT = A0;
const float SENS = 0.185;  // V/A per modello 5A

void setup() { Serial.begin(9600); }

void loop() {
  long sum = 0;
  for (int i = 0; i < 100; i++) sum += analogRead(CURRENT);
  float v = (sum / 100.0) * 5.0 / 1023.0;
  float i = (v - 2.5) / SENS;

  Serial.print("V: "); Serial.print(v);
  Serial.print("  I: "); Serial.print(i, 3);
  Serial.println(" A");
  delay(500);
}
```

## Errori comuni

1. **Calibrare V_zero a 2.5 V teorico** -> il vero valore puo' essere 2.45 o 2.55 V, salva offset all'avvio
2. **Filo logico al posto di IP+** -> errore di cablaggio, non funziona
3. **Senza media di 100+ campioni** -> rumore +/- 50 mA tipico
4. **Misure di pochi mA su modulo 30 A** -> risoluzione insufficiente, usa modulo 5 A
5. **AC senza RMS** -> la lettura istantanea e' inutile, fai sommatoria al quadrato e radice

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, l'ACS712 misura quanta corrente passa in un filo SENZA toccarlo elettricamente. Funziona con il principio "effetto Hall": la corrente crea un piccolo campo magnetico, e il chip lo misura.

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per misure energetiche, monitoraggio consumo motori
- Se disponibile, esempio bello: misura corrente di un LED (qualche mA -> il modulo 5 A non vede nulla, serve modulo da 100 mA dedicato), misura corrente motore DC sotto carico
- Spiegare la differenza con "shunt resistor" (resistenza in serie + amplificatore differenziale) -- meno isolato, piu' preciso a basse correnti

**Sicurezza:**
- ACS712 isola elettricamente il misurando dal MCU -> sicuro anche con tensioni alte (AC 230 V) sui morsetti IP, MA: NON usare con i ragazzi correnti AC di rete
- Saldature pulite sui morsetti, mai con corrente attiva

## Link L1 (raw RAG queries)

- "ACS712 effetto Hall corrente Arduino"
- "ACS712-05B 185 mV/A calibrazione"
- "RMS corrente alternata Arduino"
