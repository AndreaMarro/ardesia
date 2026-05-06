---
id: sensore-suolo-umidita
type: concept
title: "Sensore umidita' suolo — capacitivo o resistivo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-05-06
updated_at: 2026-05-06
updated_by: team-lead-iter44
tags: [umidita, suolo, sensore, agricoltura, vol-non-coperto]
---

## Definizione

Un **sensore di umidita' del suolo** misura quanta acqua c'e' nel terreno. Esistono due tipi:

- **Resistivo** (YL-69) -- 2 elettrodi che misurano resistenza tra loro. Economico (~1 €), ma corrosione veloce delle punte
- **Capacitivo** (v1.2 / v2.0) -- non ha elettrodi a contatto, misura la capacita' del terreno. Piu' costoso (~3-5 €), MA dura anni e non corrode

Per progetti scuola e' fortemente raccomandato il **capacitivo**.

## Schema collegamento (capacitivo)

```
+3.3V o +5V --- VCC
GND        --- GND
A0         --- AOUT (uscita analogica)
```

Inserire la sonda nel terriccio del vaso, NON oltre la "linea bianca" (i circuiti elettronici devono restare fuori).

## Esempio Arduino

```cpp
const int SUOLO = A0;

void setup() { Serial.begin(9600); pinMode(SUOLO, INPUT); }

void loop() {
  int v = analogRead(SUOLO);
  // Calibrazione tipica capacitivo v1.2 (5V):
  //   asciutto:   ~620 (out of 1023)
  //   bagnato:    ~310
  int percentuale = map(v, 620, 310, 0, 100);
  percentuale = constrain(percentuale, 0, 100);

  Serial.print("ADC: "); Serial.print(v);
  Serial.print("  Umidita': "); Serial.print(percentuale);
  Serial.println("%");
  delay(1000);
}
```

## Calibrazione (a 2 punti)

1. Lasciare la sonda all'aria -> registrare ADC_asciutto
2. Immergere la punta in un bicchiere d'acqua (NON oltre la linea) -> registrare ADC_bagnato
3. Mappare con `map()` come sopra

## Errori comuni

1. **Sensore resistivo lasciato 24/7 acceso** -> elettrolisi, corrosione visibile in 1-2 settimane (vedere `relay-state-machine.md` per accendere solo durante la lettura)
2. **Calibrazione mancante** -> lettura "raw" non significa nulla, sempre 2 punti minimi
3. **Sonda troppo profonda** -> i circuiti elettronici si bagnano e si rompono
4. **Confondere alto/basso ADC** -> capacitivo: ADC alto = asciutto, ADC basso = bagnato (resistivo: opposto!)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi:**
> Ragazzi, questo sensore misura quanta acqua c'e' nel terriccio della pianta. Possiamo usarlo per costruire un sistema di irrigazione automatico che innaffia solo quando la pianta ha sete!

**Cosa fare:**
- NON e' nel kit ELAB base -- propedeutico per "Smart Garden" o progetti scienze
- Se disponibile, accoppiarlo a una pompa d'acqua + relay per esperimento "irrigazione automatica"
- Spiegare il ciclo: leggi umidita' -> se sotto soglia accendi pompa per N secondi -> aspetta -> rileggi

**Sicurezza:**
- NON immergere oltre la linea bianca (circuiti)
- Pompa d'acqua sempre con alim. esterna + diodo flyback
- Acqua + elettronica -> tappetino isolante sotto, sempre

## Link L1 (raw RAG queries)

- "sensore umidita suolo capacitivo Arduino"
- "YL-69 vs capacitive v1.2"
- "smart garden irrigazione automatica"
