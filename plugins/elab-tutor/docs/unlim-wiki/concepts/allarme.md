---
id: allarme
type: concept
title: "Allarme — sensore + cicalino"
locale: it
volume_ref: 1
pagina_ref: 97
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [allarme, cicalino, buzzer, interruttore-magnetico, fotoresistore, ldr, reed-switch, sensore, tone, digitalRead, analogRead, if-else, sicurezza, progetto]
---

## Definizione

Un allarme è un sistema che emette un segnale (suono, luce o entrambi) quando un sensore rileva una condizione anomala — porta aperta, luce interrotta, presenza inattesa. Vol. 1 pag. 97 introduce l'interruttore magnetico come "interruttore che si apre e chiude in risposta a un magnete", che è esattamente il cuore di un allarme anti-apertura porta.

## Analogia per la classe

Ragazzi, pensate all'allarme che sente il suono quando aprite la porta di un negozio: sulla porta c'è un magnete, sul muro c'è l'interruttore magnetico. Finché porta e muro sono vicini, il magnete tiene chiuse le due lamelle metalliche dentro il reed switch — il circuito è chiuso e tutto tace. Nel momento in cui qualcuno apre la porta, il magnete si allontana, le lamelle si aprono, il circuito si interrompe e il cicalino inizia a suonare. Con il vostro kit ELAB potete costruire esattamente lo stesso meccanismo con tre componenti: batteria, interruttore magnetico e cicalino.

## Cosa succede fisicamente

### Circuito base senza Arduino (Vol.1)

Schema: **batteria 9V → (+) breadboard → cicalino (+) → cicalino (−) → interruttore magnetico → (−) breadboard → batteria**.

Nessuna resistenza aggiuntiva: il cicalino attivo ha già una resistenza interna. La corrente scorre solo quando le lamelle del reed switch si toccano (magnete vicino) oppure si interrompono (magnete lontano) — dipende dall'orientamento che scegliate come "allarme ON".

| Stato magnete | Reed switch | Cicalino |
|---------------|-------------|----------|
| Vicino (porta chiusa) | Chiuso (conduce) | Silenzioso |
| Lontano (porta aperta) | Aperto (non conduce) | SUONA |

> Questo schema usa il reed switch in configurazione **normalmente chiuso**: a riposo conduce, a allarme apre. È la stessa logica degli allarmi antifurto professionali.

### Upgrade con Arduino e fotoresistore (Vol.2/3)

Con Arduino possiamo usare un **fotoresistore** come sensore: se qualcuno taglia un fascio di luce, la resistenza del fotoresistore sale, la tensione sul pin A0 cambia, e Arduino suona il cicalino con `tone()`.

```cpp
int sensorPin = A0;
int buzzerPin = 8;
int soglia    = 400;   // valore sperimentale: regolate in base alla luce ambiente

void setup() {
  pinMode(buzzerPin, OUTPUT);
}

void loop() {
  int luce = analogRead(sensorPin);   // 0–1023

  if (luce < soglia) {
    tone(buzzerPin, 1000);            // 1000 Hz = BIP acuto
  } else {
    noTone(buzzerPin);
  }
}
```

### Formula soglia analogica

```
valore ADC = (tensione_sensore / 5V) × 1023
```

Con fotoresistore al buio (~8 kΩ in un partitore con 10 kΩ) → circa 400. Con luce piena (~1 kΩ) → circa 900. La `soglia` nel codice si calibra guardando il Serial Monitor mentre si copre e si scopre il sensore.

### Frequenze buzzer utili

| Suono         | `tone(pin, freq)` | Nota   |
|---------------|-------------------|--------|
| Bip acuto     | `tone(8, 2000)`   | Si6    |
| Sirena bassa  | `tone(8, 440)`    | La4    |
| Sirena alta   | `tone(8, 880)`    | La5    |
| Silenzio      | `noTone(8)`       | —      |

## Esperimenti correlati

- Vol. 1 pag. 94 — Cicalino base senza Arduino ([concepts/cicalino.md](cicalino.md))
- Vol. 1 pag. 98 — Interruttore magnetico + LED ([concepts/interruttore-magnetico.md](interruttore-magnetico.md))
- Vol. 1 pag. 82 — Fotoresistore ([concepts/fotoresistore.md](fotoresistore.md))
- [concepts/digital-read.md](digital-read.md) — `digitalRead()` per pulsante/reed switch con Arduino
- [concepts/analog-read.md](analog-read.md) — `analogRead()` per fotoresistore + soglia `if`
- [concepts/cicalino.md](cicalino.md) — polarità buzzer, buzzer attivo vs passivo

## Errori comuni

1. **Il cicalino suona sempre, anche con porta chiusa** — Il reed switch è orientato al contrario (normalmente aperto invece di normalmente chiuso), oppure i fili + e − del cicalino sono invertiti. Ruotate il cicalino di 180° o scambiate i cavi.

2. **Il cicalino non suona mai** — Con Arduino: verificate che il pin nel codice corrisponda al pin fisico sulla breadboard. Senza Arduino: controllate con il multimetro che la tensione arrivi ai capi del cicalino quando il reed switch si apre.

3. **La soglia analogica non funziona** — Il valore `soglia` nel codice è fisso ma la luce ambiente cambia. Aprite il Serial Monitor, stampate `Serial.println(analogRead(A0))` e leggete il valore reale: coprite il sensore, leggete il valore basso; scopritelo, leggete il valore alto. Impostate la soglia a metà.

4. **tone() non smette quando tolgo la mano** — Manca `noTone(pin)` nel ramo `else`. Senza `noTone()`, la funzione `tone()` continua fino alla prossima chiamata o fino a che si richiama con frequenza diversa.

5. **Il suono è un ronzio continuo invece di un BIP** — Avete un cicalino **passivo** (quello che nel kit ha solo due fili senza circuito interno). Il cicalino passivo ha bisogno di `tone()` per suonare; con `digitalWrite(pin, HIGH)` emette solo un click. Con quello **attivo** (tre pin o con marcatura) basta `digitalWrite(pin, HIGH)`.

## Domande tipiche degli studenti

**"Posso fare in modo che l'allarme si spenga da solo dopo 5 secondi?"**
Sì: usate `tone(pin, freq, 5000)` — il terzo parametro è la durata in millisecondi. Oppure dopo `tone()` aggiungete `delay(5000); noTone(pin);`. L'upgrade elegante usa `millis()` per non bloccare il programma.

**"Come faccio a far suonare la sirena che sale e scende come quella della polizia?"**
Con un ciclo `for` che cambia la frequenza:
```cpp
for (int f = 500; f < 1500; f += 10) { tone(8, f); delay(5); }
for (int f = 1500; f > 500; f -= 10) { tone(8, f); delay(5); }
```
Questo fa salire il suono da 500 Hz a 1500 Hz e ridiscendere, in loop.

**"Se voglio due sensori (porta E finestra) devo usare due Arduino?"**
No: collegate i due reed switch in **serie**. Se uno dei due si apre, il circuito si interrompe e il cicalino suona. Con Arduino potete usare due pin digitali separati e fare `if (digitalRead(pinA) == LOW || digitalRead(pinB) == LOW)`.

**"La batteria da 9V si scarica in fretta con il cicalino acceso?"**
Il cicalino da 9V assorbe circa 30 mA. Una batteria 9V da 500 mAh dura circa 16 ore se il cicalino suonasse sempre — in un allarme reale suona solo pochi secondi, quindi la batteria dura mesi. Spiegate la differenza tra corrente di picco e consumo medio.

## PRINCIPIO ZERO

### Sicurezza

- Tutte le tensioni in gioco sono **9 V DC dalla batteria ELAB** o **5 V DC da Arduino** — sicure per i ragazzi con i kit fisici.
- Il cicalino attivo non ha bisogno di resistenza serie: ha già una resistenza interna. Non cortocircuitarlo direttamente tra + e − senza il reed switch interposto.
- Il reed switch contiene due lamelle di metallo sottile: non piegarlo o torcerlo, si rompe. Avvicinate il magnete gradualmente, non toccate le lamelle con le mani.
- `tone()` genera un segnale che può arrivare a 20 kHz: evitate di tenere il buzzer vicino all'orecchio a piena potenza.

### Narrativa per la classe

L'allarme è il primo progetto in cui il circuito **reagisce al mondo**: non aspetta che voi premiate un bottone, ma decide da solo di suonare perché qualcosa è cambiato nell'ambiente. Il reed switch è come un guardiano silenzioso: finché il magnete è vicino, lui tiene chiuse le lamelle e tutto tace. Appena il magnete si allontana — porta aperta, finestra aperta — le lamelle si aprono e il cicalino urla. È lo stesso principio che protegge i musei, i negozi, le case. La differenza tra il vostro allarme e quello professionale? Il vostro lo avete capito componente per componente.

### Cosa dire ai ragazzi

- *"Prima di collegare tutto, facciamo previsioni: la porta è chiusa, il magnete è vicino — il cicalino suonerà o starà zitto? Perché?"* (Ragioniamo sul circuito prima di alimentarlo.)
- *"Avvicinate il magnete lentamente: a che distanza si chiudono le lamelle? Ogni reed switch ha una distanza di attivazione diversa — questo si chiama 'distanza di operate'."*
- *"Con Arduino, come faremmo a far suonare l'allarme solo se la porta rimane aperta per più di 3 secondi, non appena si apre? Cosa ci serve?"* (Aggancio a `millis()` e variabili di stato — pensiero computazionale.)
- Citate **Vol. 1 pag. 97** quando mostrate l'interruttore magnetico sulla LIM.
- Mostrate ai ragazzi come avvicinare e allontanare il magnete per "testare" l'allarme prima di collegare il cicalino — abituateli a verificare passo per passo.

### Progressione didattica consigliata (4 passi)

1. Richiamare il cicalino base (Vol.1 Cap.11) e l'interruttore magnetico (Vol.1 Cap.12) — già visti separatamente
2. Cablare: **batteria → cicalino → reed switch → GND** — porta chiusa = silenzio, porta aperta = suono
3. Con Arduino (Vol.3): aggiungere `analogRead()` su fotoresistore e soglia `if` — allarme luce interrotta
4. Sfida aperta: *"Come aggiungete un LED rosso che lampeggi mentre suona? Come fate a resettare l'allarme con un pulsante?"*

## Link L1 (raw RAG queries)

Questi termini trovano i chunk rilevanti in `src/data/rag-chunks.json`:

- `"allarme cicalino interruttore magnetico reed switch"`
- `"tone() buzzer frequenza Arduino"`
- `"analogRead fotoresistore soglia if allarme"`
- `"cicalino attivo passivo polarità"`
- `"digital read reed switch normallyOpen normallyClose"`
- `"interruttore magnetico lamelle magnete porta sensore"`
