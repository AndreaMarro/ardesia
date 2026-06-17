---
id: buzzer-active
type: concept
title: "Buzzer Attivo — suono con un solo filo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [buzzer, buzzer-attivo, suono, audio, digitalwrite, oscillatore, vol1, vol3]
---

## Definizione

Il buzzer attivo è un componente audio che emette un suono a frequenza fissa non appena viene alimentato con tensione continua. Contiene un oscillatore interno: non ha bisogno di `tone()` né di onde quadre esterne — basta `digitalWrite(pin, HIGH)`.

> Nota: i volumi ELAB usano il termine "cicalino piezo" (buzzer passivo, richiede `tone()`). Il buzzer attivo è un componente distinto — riconoscibile dal bollino adesivo verde/giallo sul disco metallico.

## Analogia per la classe

Ragazzi, pensate al buzzer attivo come a un campanello da bicicletta elettronico: premete il bottone (HIGH) e suona sempre allo stesso modo, senza dover scegliere la nota. Il cicalino piezo (passivo) invece è come un altoparlante: avete voi il controllo della frequenza con `tone()`, ma se mandate solo corrente continua — silenzio.

## Riconoscere il buzzer attivo

| Caratteristica | Buzzer Attivo | Cicalino Piezo (Passivo) |
|----------------|--------------|--------------------------|
| Oscillatore interno | Sì | No |
| Alimentazione | DC `digitalWrite(HIGH)` | Onda quadra / `tone()` |
| Frequenza fissa | Sì (~2-4 kHz tipico) | No (voi scegliete) |
| Bollino adesivo | Spesso sì | Raramente |
| Resistenza in serie | Non necessaria | Non necessaria (piezo) |
| Uso più semplice | Sì | No |

## Schema collegamento

```
   pin Arduino → [BUZZER ATTIVO +] → [BUZZER ATTIVO −] → GND
```

Il polo positivo (+) va al pin Arduino, il polo negativo (−) a GND. Corrente tipica: 10-30 mA a 5V — dentro i limiti del pin Arduino (max 40 mA per pin).

## Codice minimo

```cpp
const int PIN_BUZZER = 8;

void setup() {
  pinMode(PIN_BUZZER, OUTPUT);
}

void loop() {
  digitalWrite(PIN_BUZZER, HIGH);   // suona
  delay(500);
  digitalWrite(PIN_BUZZER, LOW);    // silenzio
  delay(500);
}
```

Questo produce un beep intermittente. **Non usate `tone()` con il buzzer attivo** — l'oscillatore interno e l'onda quadra esterna interferiscono producendo suoni irregolari.

## Parametri tipici

- Tensione operativa: 3.3 V – 5 V (compatibile Arduino Nano)
- Corrente: 10-30 mA
- Frequenza emessa: ~2 kHz – 4 kHz (fissa, impressa internamente)
- Livello sonoro: 70-85 dB a 10 cm
- Polarità: rispettare + e − (componente polarizzato)

## Differenza pratica vs `tone()` (passivo)

```cpp
// Buzzer ATTIVO — semplice ON/OFF
digitalWrite(8, HIGH);   // BIP! frequenza fissa
digitalWrite(8, LOW);    // silenzio

// Cicalino PASSIVO — controllo frequenza
tone(8, 440);            // LA4 = 440 Hz (voi scegliete)
noTone(8);               // silenzio
```

Il buzzer attivo è ideale per allarmi e notifiche semplici. Il cicalino passivo serve per melodie e frequenze variabili.

## Esperimenti correlati

- **Allarme sensore** — combinare con sensore PIR o fotoresistore: buzzer attivo ON quando rilevato movimento o buio
- **Semaforo sonoro** — buzzer attivo + LED: beep breve su verde, lungo su rosso
- **Conta-click pulsante** — buzzer attivo conferma ogni click del pulsante fisico
- Vedi anche: `concepts/tone-notone.md` (cicalino passivo + melodie)
- Vedi anche: `concepts/cicalino.md` (cicalino piezo Vol.1 pag.93)
- Vedi anche: `concepts/allarme.md` (progetto allarme completo)

## Errori comuni

1. **Silenzio con `tone()`** — Si usa `tone()` sul buzzer attivo credendo funzioni come il cicalino. Il buzzer attivo ha già il suo oscillatore: `tone()` crea interferenza o nessun suono. Soluzione: `digitalWrite()` semplice.

2. **Polarità invertita** — Buzzer attivo è polarizzato. Pin + al GND → nessun suono, talvolta riscaldamento. Verificare sempre la marcatura + sul corpo o il bollino adesivo.

3. **Confusione attivo/passivo** — I due componenti sembrano identici. Test rapido: collegare direttamente a 5V e GND senza Arduino — il buzzer attivo suona, il cicalino piezo tace.

4. **Suono continuo non voluto** — `digitalWrite(HIGH)` e poi programma fermo (niente `loop()`): il buzzer rimane acceso. Sempre aggiungere la condizione di spegnimento `LOW`.

5. **Volume troppo alto in classe** — 80+ dB a pochi centimetri è fastidioso. Mettere un dito sul buzzer per attutire durante i test, oppure usare frequenze brevi (delay 100 ms ON, 900 ms OFF).

## Domande tipiche degli studenti

**"Perché non funziona `tone()` con questo buzzer?"**
Ragazzi, il buzzer attivo ha già un "musicista" dentro di sé che suona sempre alla stessa nota. Se gli mandate anche `tone()` dall'esterno, è come due musicisti che suonano insieme senza accordarsi — caos. Con `digitalWrite` invece voi gli dite solo "suona" o "smetti".

**"Come faccio a capire se è attivo o passivo?"**
Prendete il buzzer, collegate + a 5V e − a GND direttamente dalla breadboard (senza Arduino). Se suona, è attivo. Se tace, è passivo. Semplice.

**"Posso cambiare la frequenza del buzzer attivo?"**
No, ragazzi — la frequenza è fissa dentro il componente. Se volete scegliere le note, avete bisogno del cicalino piezo (passivo) + `tone()`. Il buzzer attivo è il componente "usa e suona".

**"Quanta corrente consuma? Brucia Arduino?"**
Circa 10-20 mA a 5V, dentro il limite dei pin Arduino (max 40 mA). Nessun problema. Se usate molti buzzer in parallelo su pin diversi, calcolate il totale — ogni pin ha il suo limite individuale.

## PRINCIPIO ZERO

**Contesto pedagogico per questa classe:**
Il buzzer attivo è il componente audio più semplice per introdurre il suono nei circuiti. Richiede solo `digitalWrite` — nessun concetto nuovo rispetto ai LED.

**Quando usarlo in lezione:**
- Dopo aver già spiegato `digitalWrite` e LED (Cap. 6-7 Vol.1)
- Come "ricompensa" sonora in progetti allarme o semaforo
- Prima di introdurre `tone()` e il cicalino passivo (Vol.3 pag.50)

**Cosa dire ai ragazzi:**
> "Ragazzi, questo componente suona da solo — basta dargli corrente. È come un campanello: voi premete il bottone (HIGH), lui suona. Niente formule magiche, niente `tone()`. Poi vedremo il cicalino piezo dove sceglierete le note — quello è più complicato ma anche più divertente."

**Sequenza consigliata:**
1. Mostrare il buzzer attivo sul kit fisico — farlo suonare una volta live
2. Cablare insieme su breadboard (2 fili: pin + GND)
3. Caricare codice `digitalWrite(HIGH)/LOW` con delay
4. Chiedere ai ragazzi: "Come lo spegneremo automaticamente dopo 5 secondi?" → guida verso `millis()` o variabile contatore

**Sicurezza:**
- Componente completamente sicuro per ragazzi 8-14 anni
- Volume 80 dB può essere fastidioso: eseguire test brevi (bip 200 ms)
- NON alimentare a 12V direttamente (tensione massima 5-6V per la maggior parte dei modelli)
- Polarizzato: + al pin Arduino, − a GND — invertito non danneggia Arduino ma il buzzer potrebbe non funzionare o scaldarsi

**Cosa NON fare:**
- Non usate `tone()` con il buzzer attivo — interferisce con l'oscillatore interno
- Non lasciate il buzzer in HIGH continuo durante spiegazioni lunghe (rumore costante distrae)
- Non confondete buzzer attivo e cicalino piezo passivo in dimostrazione live — testate sempre prima

## Link L1 (raw RAG queries)

- `"buzzer attivo Arduino digitalWrite suono"`
- `"differenza buzzer attivo passivo piezo"`
- `"cicalino suono semplice allarme Arduino"`
- `"buzzer active passive tone difference"`
- `"oscillatore interno buzzer 5V"`
