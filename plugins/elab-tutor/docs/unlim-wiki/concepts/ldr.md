---
id: ldr
type: concept
title: "LDR — Resistore Dipendente dalla Luce"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: claude-sonnet-4-6
tags: [ldr, fotoresistore, sensore-luce, analog, partitore, adc, arduino, automatismo]
---

## Definizione

L'LDR (Light Dependent Resistor, in italiano **fotoresistore**) è un resistore la cui resistenza diminuisce all'aumentare dell'intensità luminosa che lo colpisce. Non ha polarità: i due piedini sono intercambiabili. La resistenza tipica varia da circa **1 kΩ** in piena luce fino a **1 MΩ** al buio completo.

> *Nota: questo concetto è trattato nei volumi ELAB come "fotoresistore". Vedi [concepts/fotoresistore.md](fotoresistore.md) per il riferimento Vol.1 pag.81. Il presente file approfondisce la fisica, i circuiti e il codice Arduino.*

## Analogia per la classe

Ragazzi, pensate alle pupille dei vostri occhi: in una stanza buia si allargano per far entrare più luce, in pieno sole si restringono. L'LDR fa esattamente il contrario con la corrente — quando c'è molta luce si "apre" (resistenza bassa, lascia passare corrente), al buio si "chiude" (resistenza alta, blocca quasi tutto). È l'occhio elettronico del nostro kit!

## Cosa succede fisicamente

L'LDR è fatto di un materiale semiconduttore chiamato **solfuro di cadmio (CdS)**, depositato a zig-zag su un supporto ceramico. I fotoni della luce visibile colpiscono gli atomi del CdS e liberano elettroni — più fotoni, più elettroni liberi, più la corrente può scorrere facilmente, quindi la resistenza cala.

### Comportamento tipico

| Condizione luminosa     | Resistenza approssimativa |
|-------------------------|---------------------------|
| Sole diretto            | 100 – 500 Ω               |
| Luce di stanza normale  | 1 – 10 kΩ                 |
| Luce soffusa / tramonto | 10 – 100 kΩ               |
| Oscurità completa       | 500 kΩ – 1 MΩ             |

### Circuito di lettura — il partitore di tensione

Un LDR da solo non si può leggere direttamente. Ha bisogno di un resistore fisso (R_fix) in serie per formare un **partitore di tensione** (vedi [concepts/divisore-tensione.md](divisore-tensione.md)):

```
5V ──── R_fix (10 kΩ) ──┬──── GND
                        │
                       A0  ← qui legge Arduino
                        │
                       LDR ── GND
```

La tensione sul pin A0 vale:

```
Vout = 5V × R_LDR / (R_fix + R_LDR)
```

- **Luce intensa** → R_LDR piccola → Vout piccola → `analogRead` restituisce un valore basso
- **Buio** → R_LDR grande → Vout grande → `analogRead` restituisce un valore alto

### Codice Arduino — lettura base

```cpp
void setup() {
  Serial.begin(9600);
}

void loop() {
  int luce = analogRead(A0);          // 0 (luce) → 1023 (buio)
  Serial.print("Luce: ");
  Serial.println(luce);
  delay(300);
}
```

### Codice Arduino — LED automatico (accende al buio)

```cpp
const int PIN_LDR = A0;
const int PIN_LED = 13;
const int SOGLIA  = 600;   // regolate a seconda dell'ambiente

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int valore = analogRead(PIN_LDR);
  Serial.println(valore);

  if (valore > SOGLIA) {
    digitalWrite(PIN_LED, HIGH);   // buio → LED acceso
  } else {
    digitalWrite(PIN_LED, LOW);    // luce → LED spento
  }
  delay(200);
}
```

> Regolate `SOGLIA` osservando i valori sul Monitor Seriale nella vostra aula: ogni ambiente ha un livello di luce diverso.

## Esperimenti correlati

- **LDR + partitore + Serial Monitor** — Il primo esperimento con l'LDR: portate la mano sopra il sensore e osservate i numeri cambiare. Capitolo del Volume 1 dedicato ai sensori di luce (vedi fotoresistore.md → Vol.1 pag.81).
- **LED notturno automatico** — Soglia `if/else` per accendere un LED quando la luce scende. Collega [concepts/if-else.md](if-else.md) + [concepts/digital-write.md](digital-write.md).
- **Misuratore di luce** — Mappare `analogRead` su percentuale 0-100 con `map()`. Collega [concepts/analog-read.md](analog-read.md) + [concepts/map-constrain.md](map-constrain.md).
- **Allarme luce** — Combinare LDR + cicalino: suona quando qualcuno passa davanti. Collega [concepts/cicalino.md](cicalino.md) + [concepts/allarme.md](allarme.md).

## Errori comuni

1. **LDR collegato senza resistore fisso** — collegare solo LDR tra 5V e A0 senza R_fix verso GND. Il pin A0 "flotta" e i valori sono casuali. Soluzione: aggiungere sempre R_fix 10 kΩ verso GND.

2. **Soglia fissa che non funziona in aule diverse** — la luce ambiente cambia da classe a classe. Una soglia hardcoded 500 potrebbe essere "sempre buio" in un'aula luminosa o "sempre luce" in una aula con tende. Soluzione: far calibrare la soglia ai ragazzi tramite Monitor Seriale.

3. **Valore invertito rispetto all'aspettativa** — con il partitore standard (R_fix sopra, LDR verso GND), più luce = valore più basso. Molti ragazzi si aspettano il contrario. Spiegare che è normale, o invertire il partitore (LDR sopra, R_fix verso GND) per invertire la logica.

4. **Confondere LDR con LED** — hanno forma simile (capsula traslucida). LDR ha una caratteristica "a serpentina" visibile; LED ha piedini di lunghezza diversa (anodo lungo). Soluzione: mostrare entrambi fianco a fianco.

5. **Usare R_fix troppo piccola (es. 220 Ω)** — la tensione al nodo cambia poco tra luce e buio, riducendo la sensibilità. Con 220 Ω il range potrebbe essere solo 0-50 invece di 0-900. Usare 10 kΩ per massimizzare il range.

## Domande tipiche degli studenti

**"Perché i numeri salgono quando copro il sensore, invece di scendere?"**
> Perché nel circuito standard R_fix è in alto (verso 5V) e LDR verso GND. Quando coprite il sensore, LDR aumenta di resistenza → il punto di mezzo sale di tensione → `analogRead` legge un numero più alto. È contro-intuitivo ma è fisicamente corretto.

**"L'LDR funziona con la torcia del telefono?"**
> Sì! La torcia LED emette luce visibile che l'LDR percepisce benissimo. Provatelo: avvicinate la torcia e osservate i valori crollare sul Monitor Seriale. È un ottimo test rapido.

**"Posso usarlo per misurare i colori?"**
> No — l'LDR misura solo l'intensità luminosa totale, non il colore. Per riconoscere colori serve un sensore diverso (es. TCS3200) con filtri colorati separati. L'LDR non distingue rosso da blu.

**"Quanto veloce vede la luce?"**
> Molto più lento dei nostri occhi. Il tempo di risposta è circa 10-100 ms — abbastanza per rilevare ombre e variazioni lente, ma non lampi veloci. Non riuscirebbe a "vedere" le lampade al neon che lampeggiano 100 volte al secondo.

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** L'LDR è il primo sensore "continuo" che i ragazzi incontrano — misura una grandezza fisica reale (luce) e la trasforma in numeri. È il ponte tra il mondo fisico e il mondo digitale. Questo momento costruisce l'intuizione fondamentale: *il computer può sentire il mondo*.

**Sicurezza:**
- L'LDR è sicuro a 5V con R_fix 10 kΩ: la corrente massima è 5V / (10kΩ + 100Ω) ≈ 0.5 mA, ben sotto i limiti
- Non usare tensioni superiori a 5V sul pin A0 — si danneggia irreversibilmente l'ADC di Arduino
- Il sensore stesso non è polarizzato: nessun rischio di collegarlo al contrario

**Cosa fare con i ragazzi:**
- Aprite il Monitor Seriale e fate passare la mano lentamente sopra il sensore — vedrete i numeri salire e scendere in tempo reale
- Chiedete: "Che numero leggiamo con la luce della finestra? E se copriamo con la mano?" — fate registrare i valori e decidere insieme la soglia
- Fate provare con la torcia del telefono per vedere il cambio drastico di valori
- Citate la pagina del libro per mostrare che il sensore che hanno in mano è esattamente quello descritto nel testo

**Cosa NON fare:**
- Non lasciate A0 scollegato mostrando valori casuali come se fosse un errore — spiegate che è normale (pin flottante) ma che il circuito richiede sempre R_fix
- Non usare l'LDR per applicazioni di sicurezza reale (antifurto di casa) — la precisione è didattica, non industriale

**Cosa dire ai ragazzi (plurale inclusivo):**
- "Ragazzi, provate a coprire il sensore con la mano — vedete come cambiano i numeri?"
- "Proviamo insieme a trovare la soglia giusta per accendere il LED al buio della nostra aula"
- "Guardate: l'LDR è l'occhio del nostro circuito — sente la luce esattamente come i vostri occhi"

## Link L1 (raw RAG queries)

Query per recuperare chunk L1 correlati da `searchRAGChunks()` o `searchKnowledgeBase()`:

```
fotoresistore LDR sensore luce Arduino
partitore tensione LDR 10kΩ analogRead
luce resistenza variabile CdS
analogRead pin A0 luce oscurità soglia
LED automatico if else luce sensore
LDR circuito divisore tensione breadboard
```
