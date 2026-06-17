---
id: voltage-divider
type: concept
title: "Voltage Divider — Partitore di Tensione (approfondimento)"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: mac-mini-wiki-batch-v2
tags: [voltage-divider, partitore, tensione, resistenza, sensori, analog, arduino, ldr, potenziometro, formula]
related: [divisore-tensione, resistenza, legge-ohm, fotoresistore, potenziometro]
---

> **Nota**: Questo file è un approfondimento in chiave ingegneristica del concetto trattato in
> [`divisore-tensione.md`](divisore-tensione.md), che cita Vol. 2 pag. 45.
> Il termine "Voltage Divider" è il nome inglese usato in datasheet, tutorial online e
> documentazione Arduino — UNLIM può restituirlo quando la query arriva da RAG internazionale.

## Definizione

Un **voltage divider** (in italiano: partitore di tensione o divisore di tensione) è un
circuito elementare formato da **due resistori in serie** che produce una tensione di uscita
`Vout` proporzionale alla tensione di ingresso `Vin`:

```
Vout = Vin × R2 / (R1 + R2)
```

È uno dei circuiti più usati in elettronica: ogni volta che Arduino legge un sensore analogico
(LDR, NTC, potenziometro, joystick), c'è quasi sempre un voltage divider dietro.

## Analogia per la classe

Ragazzi, immaginate di dividere un tubo d'acqua in due tratti: il primo tratto stretto
(R1 grande) e il secondo largo (R2 piccolo). La pressione dell'acqua si abbassa nel tratto
stretto, esattamente come la tensione cade su R1. Misurate la pressione nel punto di mezzo
tra i due tratti e avete il vostro `Vout` — il valore dipende da quanto sono "stretti" i due
pezzi di tubo, non dal flusso totale.

## Cosa succede fisicamente

La stessa corrente `I` scorre in serie attraverso R1 e poi R2 (non si "perde" in mezzo):

```
I = Vin / (R1 + R2)          ← legge di Ohm sull'intero ramo
Vout = I × R2                 ← caduta su R2
     = Vin × R2 / (R1 + R2)  ← formula del partitore
```

### Tabella esempi pratici con Arduino (Vin = 5 V)

| R1       | R2       | Vout    | Uso tipico                          |
|----------|----------|---------|--------------------------------------|
| 10 kΩ    | 10 kΩ    | 2.50 V  | Punto di mezzo simmetrico           |
| 10 kΩ    | 4.7 kΩ   | 1.60 V  | Ridurre 3.3 V da modulo a 2 V       |
| 10 kΩ    | LDR      | variabile | Lettura luce con analogRead       |
| 10 kΩ    | NTC      | variabile | Lettura temperatura (termistore)  |
| 10 kΩ    | Pot.     | 0–5 V   | Controllo manuale valore analogico  |

### Con batteria 9 V (come nel kit ELAB)

| R1       | R2       | Vout    |
|----------|----------|---------|
| 470 Ω    | 1 kΩ     | ≈ 6.1 V |
| 1 kΩ     | 1 kΩ     | 4.5 V   |
| 1 kΩ     | 2.2 kΩ   | ≈ 6.2 V |

> Attenzione: non portare mai `Vout` direttamente su un pin Arduino se supera 5 V!

## Schema pratico per Arduino + LDR

```
      +5V
       │
     [R1: 10 kΩ]
       │
       ├──── A0 (Vout letto da analogRead)
       │
     [LDR: ~1 kΩ–100 kΩ]
       │
      GND
```

**Luce intensa** → R_LDR bassa → Vout bassa → `analogRead()` restituisce valore basso (es. 80)
**Buio** → R_LDR alta → Vout alta → `analogRead()` restituisce valore alto (es. 900)

```cpp
int luce = analogRead(A0);   // 0-1023
float volt = luce * (5.0 / 1023.0);
Serial.println(volt);
```

## Voltage Divider vs altri circuiti simili

| Circuito        | Differenza principale                                     |
|-----------------|-----------------------------------------------------------|
| Pull-up         | Voltage divider con R2 = pulsante (aperto/chiuso)        |
| Potenziometro   | Voltage divider regolabile manualmente con cursore       |
| LDO regolatore  | Voltage divider con feedback attivo → tensione stabile   |
| Partitore AC    | Stessa formula ma con impedenza complessa (condensatori) |

## Esperimenti correlati

- `v2-cap4-esp3` — Tre resistori in serie e lettura con multimetro (vedi anche [`divisore-tensione.md`](divisore-tensione.md))
- `v1-cap10-esp1` — LDR + resistore 10 kΩ, lettura analogica
- `v2-cap3-esp4` — Misura corrente con multimetro
- Esperimenti con potenziometro: vedi [`potenziometro.md`](potenziometro.md)
- Lettura fotoresistore: vedi [`fotoresistore.md`](fotoresistore.md)

## Errori comuni

1. **Dimenticare il GND comune** — Se la batteria esterna e Arduino hanno GND separati,
   `Vout` viene letta rispetto a riferimenti diversi: valori completamente sbagliati.
   Collegare SEMPRE i GND insieme.

2. **Carico a bassa impedenza sul nodo centrale** — Collegare un LED direttamente a `Vout`
   "trascina" la tensione verso il basso (il LED assorbe corrente che altera il partitore).
   Il pin analogico di Arduino ha ~100 MΩ di impedenza: va benissimo. Un LED no.

3. **Resistori troppo piccoli** — Con R1=100 Ω + R2=100 Ω la corrente è 25 mA a 5 V:
   la batteria si scarica inutilmente. Usare 10 kΩ per circuiti con sensori.

4. **Vout > 5 V su pin Arduino** — Se alimentate il partitore a 9 V e Vout supera 5 V,
   potete bruciare il pin ADC. Controllate sempre con il multimetro prima di collegare.

5. **Invertire R1 e R2** — La formula usa R2 (quello verso GND) al numeratore. Se invertite
   i resistori ottenete `Vin × R1 / (R1 + R2)` — il complementare a Vin.

## Domande tipiche degli studenti

**"Il partitore 'consuma' energia anche se non c'è niente collegato?"**
> Sì! Scorre sempre una corrente di riposo `I = Vin / (R1 + R2)`. Con 10 kΩ + 10 kΩ a 5 V
> sono 0.25 mA continui — trascurabile per un esperimento, ma da considerare in sistemi a
> batteria che devono durare mesi.

**"Posso ottenere 3.3 V da 5 V con un partitore per usare un modulo?"**
> Sì, con R1 = 2 kΩ e R2 = 3.3 kΩ ottenete ≈ 3.28 V. Funziona se il modulo assorbe poca
> corrente (es. sensori I2C). Non usate questo metodo per alimentare motori o attuatori.

**"Perché il potenziometro ha 3 terminali?"**
> I terminali esterni sono i due capi (Vin e GND del partitore). Quello centrale è il cursore,
> cioè il nodo `Vout` mobile. Girando la manopola cambiate R1 e R2 contemporaneamente
> mantenendo R1 + R2 = Rtot costante.

**"Come calcolo Vout se ho 3 resistori in serie?"**
> Sommate tutte le resistenze al denominatore, e al numeratore mettete la somma dei resistori
> dal nodo che leggete fino a GND. Es: R1+R2+R3 in serie a 9 V, nodo tra R2 e R3:
> `Vout = 9 × R3 / (R1 + R2 + R3)`.

## PRINCIPIO ZERO

**Narrativa per la LIM** — come presentare il voltage divider alla classe:

> "Ragazzi, ogni volta che Arduino legge un sensore — la luce, la temperatura, il movimento
> del joystick — c'è un piccolo trucco dietro: il partitore di tensione. Due resistori in
> serie che si spartiscono la tensione della batteria come due studenti che si dividono una
> pizza. Chi ha più Ohm, prende più Volt."

**Percorso consigliato in classe:**
1. Mostrate la formula scritta alla lavagna: `Vout = Vin × R2 / (R1 + R2)`
2. Calcolate insieme il valore atteso (es. R1=10kΩ, R2=10kΩ, Vin=5V → 2.5V)
3. Costruite il circuito sul kit fisico con i due resistori sulla breadboard
4. Misurate Vout col multimetro — confrontate con il calcolo
5. Sostituite R2 con l'LDR: coprite con la mano e osservate la tensione cambiare

**Sicurezza:**
- Resistori ≥ 470 Ω su 9 V → corrente massima ≈ 19 mA, sicuro per esperimenti
- Mai portare Vout > 5 V su un pin Arduino — misurare prima col multimetro
- Il nodo centrale del partitore NON è isolato: non toccatelo con le dita bagnate

**Cosa dire ai ragazzi:**
- "Calcoliamo insieme quanti Volt aspettiamo al centro — poi lo misuriamo col multimetro"
- "Cosa succede se metto l'LDR al posto di R2 e copro la luce con la mano?"
- "Perché secondo voi il pin analogico di Arduino legge 0–1023 e non direttamente i Volt?"

**Plurale inclusivo:** "Costruiamo", "Calcoliamo", "Misuriamo", "Proviamo insieme" — mai
comandi al singolo, sempre coinvolgimento collettivo.

## Link L1 (raw RAG queries)

```
voltage divider formula Vout Vin R1 R2
partitore di tensione resistori serie
LDR analogRead sensore luce partitore
analogRead Arduino 0 1023 conversione tensione
potenziometro cursore partitore variabile
resistori serie caduta tensione proporzionale
partitore carico impedenza pin analogico
NTC termistore lettura temperatura analogica
```
