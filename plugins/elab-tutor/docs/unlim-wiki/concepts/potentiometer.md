---
id: potentiometer
type: concept
title: "Potenziometro (Potentiometer)"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-mac-mini-iter14
tags: [potenziometro, resistenza-variabile, analogread, divisore-tensione, arduino, sensore]
---

## Definizione

Il potenziometro è una **resistenza variabile** a tre terminali: i due estremi sono collegati ai capi di una resistenza fissa, mentre il terminale centrale (detto "cursore" o "wiper") scorre lungo di essa, prelevando una tensione proporzionale alla posizione. *(Nota: nessun match diretto trovato nei Volumi ELAB — contenuto da conoscenza generale, marcato `source_status: general_knowledge_only`.)*

In Arduino il valore del cursore si legge con `analogRead()`, che restituisce un numero da **0 a 1023** proporzionale alla tensione tra 0 V e 5 V.

## Analogia per la classe

Ragazzi, pensate al volume di uno stereo: quando girate la manopola verso destra il suono aumenta, verso sinistra diminuisce. Dentro quella manopola c'è esattamente un potenziometro! Il cursore scorre su una striscia resistiva e decide quanta tensione "passa" verso Arduino — come una porta che si apre o si chiude a piacere.

## Componenti e schema di collegamento

| Pin potenziometro | Collegamento Arduino |
|-------------------|---------------------|
| Pin 1 (estremo SX) | 5 V |
| Pin 2 (cursore centrale) | A0 (o qualsiasi pin analogico) |
| Pin 3 (estremo DX) | GND |

```
5V ─── [Pin1]───[resistenza fissa]───[Pin3] ─── GND
                        │
                    [Pin2 cursore]
                        │
                        A0 Arduino
```

**Nessuna resistenza esterna necessaria** — il potenziometro è già un divisore di tensione autonomo.

## Cosa succede fisicamente

Quando il cursore è all'estremo GND la tensione su A0 è **0 V** → `analogRead()` = **0**.  
Quando il cursore è all'estremo 5V la tensione su A0 è **5 V** → `analogRead()` = **1023**.  
A metà corsa: **2,5 V** → `analogRead()` ≈ **512**.

La formula generale del divisore di tensione:

```
         R_bassa
V_out = ──────────── × V_in
        R_alta + R_bassa
```

dove `R_bassa` è la porzione di resistenza dal cursore a GND e `R_alta` è la porzione dal cursore a 5 V.

### Valori tipici nei kit Arduino

| Parametro | Valore tipico |
|-----------|--------------|
| Resistenza totale | 10 kΩ (più comune) |
| Potenza massima | 0,25 W |
| Tensione max | 5 V (nei kit a 3,3–5 V) |
| Risoluzione Arduino | 10 bit → 1024 valori (0–1023) |
| Angolo di rotazione | 270° (tipo rotativo) |

## Codice di esempio

```cpp
const int PIN_POT = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(PIN_POT);          // 0-1023
  int percentuale = map(valore, 0, 1023, 0, 100);

  Serial.print("Posizione: ");
  Serial.print(percentuale);
  Serial.println("%");

  delay(200);
}
```

La funzione `map()` è utilissima per convertire i valori del potenziometro in qualsiasi scala (es. 0–180° per un servo, 0–255 per la luminosità di un LED).

## Esperimenti correlati

- **Controllo luminosità LED** — usare `map(analogRead(A0), 0, 1023, 0, 255)` e `analogWrite()` su un LED (tipicamente Cap. LED e PWM, Vol. 1–2)
- **Controllo angolo servo** — `map()` da 0–1023 a 0–180, poi `servo.write()` (Cap. Servo, Vol. 2–3)
- **Termistore / LDR vs potenziometro** — confronto divisore di tensione fisso vs variabile manualmente (Cap. Sensori, Vol. 2)
- Vedi `ldr.md` e `lm35.md` per sensori che usano lo stesso principio `analogRead()` ma con variazione automatica

## Errori comuni

1. **Pin cursore e pin estremo scambiati** — `analogRead()` legge sempre 0 o sempre 1023, non varia. Controllare quale dei tre pin è il cursore centrale (di solito il pin di mezzo fisicamente).
2. **Potenziometro collegato solo a due pin** — senza il terzo estremo collegato a GND o 5 V, la tensione fluttua casualmente (pin "floating"). Collegare sempre tutti e tre i pin.
3. **Rumore di lettura** — `analogRead()` può variare di ±2–3 unità anche a cursore fermo. Usare una media mobile o `constrain()` per stabilizzare.
4. **Scala non mappata** — usare direttamente il valore 0–1023 per controllare un servo provoca movimenti fuori range. Usare sempre `map()` per adattare la scala.
5. **Potenziometro sbagliato per audio** — i potenziometri lineari (tipo B) e logaritmici (tipo A) rispondono diversamente. Per il volume audio serve il tipo A (logaritmico); per controllo Arduino il tipo B (lineare) è più intuitivo.

## Domande tipiche degli studenti

**"Perché `analogRead()` dà 1023 e non 1024?"**  
Arduino ha una risoluzione a 10 bit: 2¹⁰ = 1024 valori possibili, numerati da 0 a 1023. È come contare da 0 a 9 con le dita — dieci posizioni, ma l'ultima è il numero 9, non il numero 10.

**"Posso usare il potenziometro come sensore di temperatura?"**  
No! Il potenziometro varia solo quando lo girate voi a mano. Per la temperatura serve un LM35 o NTC (termistori che cambiano resistenza con il calore). Però entrambi si leggono con `analogRead()` — stesso meccanismo, variabile diversa.

**"Quanti potenziometri posso collegare ad Arduino Nano?"**  
Arduino Nano ha 8 pin analogici (A0–A7), quindi fino a 8 potenziometri contemporaneamente, ognuno su un pin diverso.

**"Cosa succede se supero i 5 V sul potenziometro?"**  
Il pin analogico di Arduino si può danneggiare con tensioni sopra i 5 V. Usare sempre lo stesso Vcc dell'Arduino (5 V per Nano, 3,3 V per modelli 3V3) come alimentazione del potenziometro.

## PRINCIPIO ZERO — Cosa dire ai ragazzi

> **Sicurezza**: il potenziometro è uno dei componenti più sicuri del kit — lavora a bassa tensione (5 V) e non scalda in uso normale. Nessun rischio di bruciature o cortocircuiti se collegato correttamente ai tre pin.

> **Narrativa**: «Ragazzi, il potenziometro è la prima volta che costruite un controllo manuale per Arduino. Voi girate, Arduino sente. È la differenza tra un programma che fa sempre la stessa cosa e uno che risponde a VOI. Oggi siete voi i sensori!»

> **Aggancio concreto**: far provare a ogni ragazzo di girare lentamente il potenziometro mentre il Serial Monitor mostra i valori in tempo reale — vedono con i propri occhi come la rotazione diventa numero. Poi chiedere: "Come fate a portare il cursore esattamente a 512?" — scoperta autonoma del punto medio.

> **Collegamento con la vita reale**: manopola del volume stereo, dimmer della luce in casa, joystick dei videogame (due potenziometri, uno per asse X e uno per asse Y).

## Link L1 (raw RAG queries)

```
potenziometro arduino analogRead
resistenza variabile divisore tensione
potentiometer 10k arduino kit
map analogRead servo potenziometro
analogRead 0 1023 tensione
controllo luminosità PWM analogRead
```

Cercare in `src/data/rag-chunks.json` con le query sopra per trovare chunk L1 correlati se presenti.
