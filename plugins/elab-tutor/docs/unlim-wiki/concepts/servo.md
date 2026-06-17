---
id: servo
type: concept
title: "Servo motore — angolo preciso con un solo filo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe-opus
tags: [servo, motore, pwm, angolo, robotica, attuatore, vol3]
---

## Definizione

Il **servo motore** è un motore che può ruotare a un angolo preciso compreso tra 0° e 180° (o 0°-360° per i "continuous rotation"). A differenza del motore DC che gira liberamente, il servo riceve un segnale PWM e si posiziona esattamente dove gli dici — e ci resta anche se qualcuno cerca di spostarlo. Tre fili bastano per alimentarlo e controllarlo.

_(PRIMARY SOURCE: nessuna corrispondenza diretta nei volumi estratti — contenuto da conoscenza tecnica generale. Confronta `src/data/capitoli/v3-bonus-servo-sweep.json` per il riferimento esperimento in Vol. 3.)_

## Analogia per la classe

Ragazzi, immaginate un torneo di braccio di ferro contro un robot: qualunque forza facciate, il braccio robot torna sempre alla stessa posizione perché dentro c'è un motore + un sensore che si corregge continuamente. Il servo fa esattamente questo: riceve l'ordine "vai a 90°" e ci resta, anche se voi premete sul braccio — il motore interno si oppone. Non si "stanca" di tenere la posizione.

## Cosa succede fisicamente

Dentro ogni servo ci sono tre cose: un **motore DC** che fornisce la potenza, un **riduttore di ingranaggi** che moltiplica la coppia e riduce la velocità, e un **potenziometro** che misura l'angolo attuale. Un circuito di controllo confronta l'angolo ricevuto dal segnale PWM con quello misurato dal potenziometro e corregge il motore di conseguenza — questo si chiama **feedback loop** o anello chiuso.

### Il segnale PWM del servo

Il servo usa PWM a **50 Hz** (periodo 20 ms), ma non usa il duty cycle per la luminosità — usa la **durata assoluta dell'impulso** per codificare l'angolo:

| Durata impulso | Angolo servo | `servo.write()` |
|----------------|--------------|-----------------|
| ~1,0 ms        | 0°           | `write(0)`      |
| ~1,5 ms        | 90°          | `write(90)`     |
| ~2,0 ms        | 180°         | `write(180)`    |

**Nota**: il periodo è sempre 20 ms. Solo il "tempo HIGH" cambia (1-2 ms). Il restante tempo (18-19 ms) il segnale è LOW.

### Pinout (tre fili — colori standard SG90)

| Filo   | Colore tipico | Connessione       |
|--------|---------------|-------------------|
| VCC    | Rosso         | +5V (alimentazione) |
| GND    | Marrone/Nero  | GND               |
| Segnale | Arancione/Giallo | Pin PWM Arduino (~) |

### Corrente tipica

| Tipo servo | Corrente a vuoto | Corrente stallo | Coppia max |
|------------|-----------------|-----------------|------------|
| SG90 (mini, plastica) | ~10 mA | ~250 mA | ~1.8 kg·cm |
| MG90S (micro, metallo) | ~10 mA | ~600 mA | ~2.4 kg·cm |

**CRITICO**: il pin `5V` di Arduino Nano/Uno eroga max ~500 mA totali. Con 2+ servo attivi simultaneamente si rischia **brownout** (reset improvviso della scheda). Usare sempre alimentazione esterna per più di un servo.

## Codice Arduino con libreria Servo.h

```cpp
#include <Servo.h>

Servo servoMotore;

void setup() {
  servoMotore.attach(9);  // pin 9 (deve avere ~)
  servoMotore.write(90);  // parte al centro
  delay(1000);
}

void loop() {
  // sweep 0→180 gradi
  for (int angolo = 0; angolo <= 180; angolo += 5) {
    servoMotore.write(angolo);
    delay(30);
  }
  delay(500);

  // sweep 180→0 gradi
  for (int angolo = 180; angolo >= 0; angolo -= 5) {
    servoMotore.write(angolo);
    delay(30);
  }
  delay(500);
}
```

### Controllo via potenziometro

```cpp
#include <Servo.h>

Servo servoMotore;
const int PIN_POT = A0;

void setup() {
  servoMotore.attach(9);
}

void loop() {
  int valPot = analogRead(PIN_POT);               // 0–1023
  int angolo  = map(valPot, 0, 1023, 0, 180);    // converti in gradi
  servoMotore.write(angolo);
  delay(15);  // lascia tempo al servo di raggiungere posizione
}
```

`map()` è essenziale: `analogRead` restituisce 0-1023, `servo.write()` vuole 0-180.

### Controllo fine (microsecondi)

```cpp
// Precisione massima: 500 µs = 0°, 1500 µs = 90°, 2500 µs = 180°
servoMotore.writeMicroseconds(1500);  // centro esatto
```

Utile quando `write(90)` non centri perfettamente il servo (variabilità tra modelli).

## Confronto Servo vs Motore DC vs Stepper

| Caratteristica | Servo | Motore DC | Stepper |
|----------------|-------|-----------|---------|
| Posizione precisa | ✅ (0-180°) | ❌ (no feedback) | ✅ (step) |
| Fili controllo | 1 segnale | 2 (dir + PWM) | 4 + driver |
| Giri continui | NO (standard) | ✅ | ✅ |
| Coppia a fermo | ✅ (holding torque) | ❌ | ✅ (bobine) |
| Velocità | media (~60°/0.1s) | alta | bassa-media |
| Caso d'uso | braccio robot, porta | ventola, ruote | stampante 3D |

## Errori comuni

1. **Servo che vibra e non si ferma** — segnale PWM instabile: verificare che il pin abbia `~` e che `servo.attach()` sia chiamato una sola volta in `setup()`. Sintomo tipico: servo oscilla attorno alla posizione target come un pendolo.

2. **Arduino si resetta quando il servo si muove** — brownout da corrente insufficiente. Il servo assorbe troppa corrente dalla linea 5V Arduino. Soluzione: alimentare servo direttamente da batteria 4× AA o power bank 5V, condividendo solo il GND con Arduino.

3. **`servo.write(angolo)` ignorato** — `servo.attach()` dimenticato, oppure angolo fuori range (< 0 o > 180 — viene clippato silenziosamente al valore limite). Verificare che l'angolo passato sia dentro 0-180.

4. **Servo che non raggiunge 0° o 180° esatti** — la libreria Servo.h usa per default impulsi 544-2400 µs. Modelli diversi hanno range diversi. Usare `servo.attach(pin, minUs, maxUs)` per calibrare:
   ```cpp
   servoMotore.attach(9, 600, 2400);  // calibrato per SG90
   ```

5. **Servo fisicamente bloccato oltre i limiti meccanici** — forzare `write(0)` o `write(180)` su un servo già al limite meccanico fa stridere gli ingranaggi e può bruciare il motore interno. Mai aggiungere carichi che limitino la corsa prima di verificare i limiti software.

## Domande tipiche degli studenti

**"Perché il servo non gira in tondo come un motore normale?"**
Perché dentro ha un potenziometro — un sensore di angolo — che fisicamente è limitato meccanicamente. Il servo "sa" dove si trova e non può andare oltre i suoi limiti hardware. Per la rotazione continua esiste la versione "continuous rotation servo" che funziona diversamente.

**"Posso collegare il servo direttamente al pin 5V di Arduino?"**
Per un solo servo SG90 a vuoto sì, ma appena il servo porta un carico (es. un braccio con qualcosa in mano) la corrente sale e Arduino si resetta. Abituatevi sempre ad usare alimentazione esterna per i servo — è buona pratica.

**"`servo.write(90)` e `servo.writeMicroseconds(1500)` sono la stessa cosa?"**
Quasi — `write(90)` internamente converte in ~1500 µs, ma la mappa esatta dipende dai parametri `attach()`. Per massima precisione usate `writeMicroseconds()` con la calibrazione specifica del vostro servo.

**"Il servo consuma corrente anche quando è fermo?"**
Sì — il servo tiene la posizione attivando il motore interno ogni volta che qualcosa cerca di spostarlo. Se non serve holding torque, chiamare `servo.detach()` per liberare il pin PWM e ridurre consumo. Il servo resterà nella posizione ma senza resistenza.

## Esperimenti correlati

- Esperimento sweep automatico 0°→180°→0° — `v3-bonus-servo-sweep` (Vol. 3, vedere `src/data/capitoli/v3-bonus-servo-sweep.json`)
- Controllo servo via potenziometro — abbina `analog-read.md` + `map-constrain.md`
- Braccio robot 2 gradi di libertà — abbina 2 servo + 2 potenziometri (capstone Vol. 3)

## Concetti correlati

- [pwm.md](pwm.md) — il segnale PWM che comanda il servo
- [motore-dc.md](motore-dc.md) — alternativa per rotazione continua
- [stepper-motor.md](stepper-motor.md) — alternativa per angoli > 180°
- [analog-read.md](analog-read.md) — lettura potenziometro per controllo angolo
- [map-constrain.md](map-constrain.md) — conversione range 0-1023 → 0-180

## PRINCIPIO ZERO

**Sicurezza:**
- Il servo SG90 gira con coppia ~1.8 kg·cm — sufficiente a pizzicare le dita dei ragazzi se il braccio è rigido. Prima di azionare: verificare che nessuna dita sia nel raggio di movimento.
- Mai corto-circuitare alimentazione servo — 600 mA stallo + surriscaldamento rapido.
- Se il servo emette stridore (ingranaggi) → spegnere subito. Significa che è bloccato meccanicamente.

**Narrativa suggerita per la classe:**

1. Mostrare fisicamente un SG90: tre fili, corpo piccolo — chiedere "ragazzi, secondo voi cosa c'è dentro?" (aspettarsi risposte: motore, ingranaggi, ...)
2. Collegare e far girare sweep automatico — il momento "wow" è vedere il braccio tornare sempre alla stessa posizione
3. Introdurre il potenziometro: "ora comanda il servo con la mano"
4. Far ruotare il potenziometro e osservare il servo che segue — connessione al mondo reale: "così funzionano le articolazioni dei robot industriali"

**Cosa NON fare:**
- Non insegnare servo prima del PWM — senza capire il concetto di duty cycle / impulso temporizzato, il servo sembra "magia".
- Non usare pin 5V Arduino per più di un servo contemporaneamente — brownout blocca la lezione.
- Non forzare il braccio servo manualmente quando alimentato — il motore interno si oppone e si può bruciare.

**Cosa dire ai ragazzi** (guida silenziosa, citazione libera Vol. 3 — esperimento v3-bonus-servo-sweep):
> "Ragazzi, il servo riceve un comando e ci va — e ci resta. Non importa se voi premete sul braccio: il motore dentro continua a correggere. Questo si chiama controllo a feedback chiuso, ed è lo stesso principio dei robot industriali, dei droni e dei bracci chirurgici."

**Non sostituisce la lettura del volume**: le istruzioni fisiche di cablaggio del Vol. 3 (esperimento servo-sweep) vanno lette durante la costruzione — i ragazzi devono vedere le stesse connessioni sul libro fisico e sulla LIM.

## Link L1 (raw RAG queries)

Query per recuperare i chunk L1 correlati da `src/data/rag-chunks.json`:

- `"servo motore angolo PWM"` → capitoli v3-bonus-servo-sweep, glossary servo
- `"Servo.h attach write"` → code chunks v3 cap servo, tip-servo
- `"servo brownout alimentazione"` → error chunks servo-vibra
- `"map 0 1023 0 180 servo"` → code-analogRead-servo, analogWrite-map
- `"servo potenziometro braccio"` → v3 cap servo esperimento 2
