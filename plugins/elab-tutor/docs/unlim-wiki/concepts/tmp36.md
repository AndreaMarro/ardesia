---
id: tmp36
type: concept
title: "TMP36 — sensore di temperatura analogico"
locale: it
volume_ref: 3
pagina_ref: 92
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [tmp36, sensore, temperatura, analogico, analog-read, vol3, sensori-ambiente]
---

## Definizione

Il TMP36 è un sensore di temperatura **analogico** a 3 pin. Vol. 3 pag. 92 lo introduce come "il sensore più semplice del kit: 3 piedini, alimentazione, e uscita una tensione che dice quanti gradi ci sono".

Pinout:
- **Pin 1 (VCC)**: 5 V
- **Pin 2 (Vout)**: tensione proporzionale alla temperatura — collegato a A0 Arduino
- **Pin 3 (GND)**: massa

**Output linear**: 10 mV per °C, con offset 500 mV a 0 °C.

```
T (°C) = (Vout - 0.5) × 100
```

Esempio: Vout = 0.75 V → T = (0.75 - 0.5) × 100 = **25 °C**

## Lettura via Arduino

```cpp
const int PIN_TMP = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(PIN_TMP);             // 0-1023
  float vout = raw * (5.0 / 1023.0);          // 0-5 V
  float celsius = (vout - 0.5) * 100.0;       // °C
  Serial.print("T = ");
  Serial.print(celsius);
  Serial.println(" °C");
  delay(1000);
}
```

**Vol. 3 pag. 92** mostra il primo sketch + collegamento breadboard.
**Vol. 3 pag. 95** estende: convertire °C → °F, soglia allarme con LED rosso quando T > 30 °C.

## Range e precisione

| Caratteristica | Valore |
|----------------|--------|
| Range temperatura | -40 °C a +125 °C |
| Precisione | ±2 °C tipica, ±1 °C calibrata |
| Tempo di risposta | ~10 secondi (massa termica) |
| Corrente assorbita | < 50 µA |
| Tensione di alimentazione | 2.7-5.5 V |

## Errori comuni

1. **Pinout invertito** — Confondere pin 1 (VCC) con pin 3 (GND) brucia il sensore in pochi secondi. Vol. 3 pag. 92 mostra il sensore con la **parte piatta verso di voi**: pin 1 a sinistra, pin 3 a destra. Verificare due volte prima di alimentare.

2. **Aspettarsi reazione istantanea** — Il TMP36 ha massa termica del package. Cambia lentamente (10 secondi per stabilizzarsi). Non ha senso leggere ogni 10 ms.

3. **Lettura singola rumorosa** — `analogRead` può fluttuare ±2-3 unità per rumore elettrico. Soluzione: media di 10 letture:
```cpp
long sum = 0;
for (int i = 0; i < 10; i++) {
  sum += analogRead(PIN_TMP);
  delay(10);
}
float media = sum / 10.0;
```

4. **Voltaggio riferimento sbagliato** — Il calcolo `5.0 / 1023.0` assume VCC = 5 V esatti. Se Arduino è alimentato via USB con cavo lungo, VCC potrebbe essere 4.7-4.9 V → offset di temperatura. Misurare VCC reale con multimetro per calibrare.

5. **Mettere il sensore vicino a fonti di calore** — LED accesi, motori, regolatore Arduino: tutti scaldano. Il TMP36 sente il calore dell'ambiente vicino, non solo dell'aria. Posizionare distante da componenti caldi.

## Esperimenti correlati

- **Vol. 3 pag. 92** — Primo lettura temperatura, Serial Monitor
- **Vol. 3 pag. 95** — Termometro con LED soglia (verde/arancio/rosso)
- **Vol. 3 pag. 100** — Datalogger temperatura: registrare ogni minuto su EEPROM
- **Vol. 3 pag. 105** — Grafico temperatura sul Serial Plotter (capitolo PWM/grafica)

## PRINCIPIO ZERO

**Cosa dire ai ragazzi** (citazione Vol. 3 pag. 92):
> "Il TMP36 è il sensore più semplice del kit: 3 piedini, alimentazione, e uscita una tensione che dice quanti gradi ci sono."

**Cosa fare:**
- Mostrate il sensore fisicamente: parte piatta verso voi, identificate i 3 pin
- Spiegate la formula `(Vout - 0.5) × 100` un pezzo alla volta — perché 0.5? perché ×100? Vol. 3 mostra il datasheet del TMP36 con il grafico V/T lineare
- Misurate la temperatura della stanza, poi fatela toccare ai ragazzi (il calore della mano deve farla salire dopo 10-20 secondi). Risposta lenta = lezione importante sui sensori reali
- Confrontate con multimetro: il valore mostrato nel Serial Monitor deve coincidere ±2 °C con un termometro vero

**Sicurezza:**
- Il TMP36 è robusto a livello di pinout corretto, ma **NON tollera VCC > 5.5 V**. Se il progetto futuro userà 6V o 9V, NON collegare TMP36 direttamente — usare regolatore.
- Non immergere il sensore in acqua/liquidi senza incapsulamento — il package non è waterproof.

**Cosa NON fare:**
- Non leggere temperatura più velocemente di ogni 100 ms — risposta termica è lenta, sprecate calcoli
- Non usate TMP36 sotto 0 °C su batteria 9V senza calibrazione: l'offset 500 mV può scendere sotto la sensibilità ADC

## Link L1 (raw RAG queries)

- `"TMP36 sensore temperatura analogico"`
- `"analogRead temperatura formula"`
- `"calcolo gradi Celsius Vout TMP36"`
- `"datasheet TMP36 lineare"`
- `"errori sensore temperatura Arduino"`
