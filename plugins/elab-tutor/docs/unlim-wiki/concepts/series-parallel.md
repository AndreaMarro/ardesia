---
id: series-parallel
type: concept
title: "Circuiti in Serie e in Parallelo"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: claude-sonnet-4-6
tags: [serie, parallelo, resistenza, tensione, corrente, circuito, fondamenti, legge-ohm, general_knowledge_only]
---

## Definizione

Un circuito **in serie** collega i componenti uno dopo l'altro lungo un unico percorso: la stessa corrente attraversa ogni elemento e le tensioni si sommano. Un circuito **in parallelo** collega i componenti fianco a fianco tra gli stessi due nodi: la stessa tensione cade su ogni ramo e le correnti si sommano. I circuiti reali spesso combinano entrambe le configurazioni (circuiti misti).

> Nota: questo concetto non è direttamente ancorato a una pagina specifica dei volumi ELAB (volume_ref: null). Il contenuto è basato su conoscenza generale di elettronica + allineamento con i principi dei volumi Omaric.

## Analogia per la classe

Ragazzi, immaginate una fila di persone che devono passare attraverso un cancello stretto: devono passare una alla volta — questa è la **serie** (tutti passano per lo stesso punto). Ora immaginate tre cancelli aperti affiancati: ogni gruppo passa per il suo cancello allo stesso momento — questo è il **parallelo** (tutti ricevono la stessa "spinta", ma la folla si divide tra i cancelli). Il cancello più stretto nel parallelo rallenta solo il proprio gruppo, non gli altri!

## Cosa succede fisicamente

### Circuito in Serie

Quando R1, R2 e R3 sono in serie tra la batteria e GND:

```
9V ─── R1 ─── R2 ─── R3 ─── GND
       │       │       │
      V1      V2      V3
```

| Grandezza  | Regola                          | Esempio (9V, 1kΩ+2kΩ+3kΩ) |
|------------|---------------------------------|---------------------------|
| Corrente   | **uguale** su tutti i componenti | I = 9V / 6kΩ = 1.5 mA    |
| Tensione   | **si somma**: V1+V2+V3 = Vtot   | 1.5V + 3V + 4.5V = 9V    |
| Resistenza | **si somma**: Rtot = R1+R2+R3   | 1kΩ + 2kΩ + 3kΩ = 6kΩ   |

> Regola rapida serie: **corrente uguale, tensione si divide**.

### Circuito in Parallelo

Quando R1 e R2 sono entrambi collegati tra 5V e GND:

```
      ┌─── R1 ───┐
5V ───┤           ├─── GND
      └─── R2 ───┘
```

| Grandezza  | Regola                                           | Esempio (5V, 1kΩ ∥ 1kΩ) |
|------------|--------------------------------------------------|--------------------------|
| Tensione   | **uguale** su tutti i rami                       | 5V su R1 e su R2        |
| Corrente   | **si somma**: Itot = I1+I2+...                   | 5mA + 5mA = 10mA        |
| Resistenza | **1/Rtot = 1/R1 + 1/R2** → Rtot < minimo ramo  | 1/Rtot = 1/1k+1/1k → 500Ω |

> Regola rapida parallelo: **tensione uguale, corrente si divide**. Due resistori uguali in parallelo = metà della loro resistenza.

### Formula condensata

```
Serie:    Rtot = R1 + R2 + R3 + ...
Parallelo: 1/Rtot = 1/R1 + 1/R2 + 1/R3 + ...

Caso speciale (solo 2 resistori parallelo):
          Rtot = (R1 × R2) / (R1 + R2)
```

### Circuito misto: serie + parallelo combinati

Un ramo parallelo (R2 ∥ R3) può essere collegato in serie con R1:

```
9V ─── R1 ─── [R2 ∥ R3] ─── GND
```

Soluzione: prima calcolare il parallelo R2∥R3 come resistenza equivalente, poi sommare in serie con R1.

## Esperimenti correlati

- Esperimenti con LED multipli in serie (Vol.1 Cap.6 — LED e resistenze) — la stessa corrente attraversa ogni LED
- Esperimenti con divisore di tensione (vedi [concepts/divisore-tensione.md](divisore-tensione.md)) — due resistori in serie che dividono Vin
- Esperimenti con LED multipli in parallelo (Vol.1 capitoli iniziali) — ogni LED prende la piena tensione, si somma la corrente dalla batteria
- Analisi con multimetro corrente/tensione (Vol.2 Cap.3-4) — misurare le differenze tra i due schemi

Vedi anche: [concepts/legge-ohm.md](legge-ohm.md) · [concepts/resistenza.md](resistenza.md) · [concepts/corrente.md](corrente.md) · [concepts/tensione.md](tensione.md) · [concepts/divisore-tensione.md](divisore-tensione.md)

## Errori comuni

1. **LED in serie senza abbastanza tensione** — ogni LED richiede circa 2V di caduta; con 3 LED in serie su una batteria 5V non arrivate ai 6V minimi. Soluzione: usate una batteria 9V, oppure passate ai LED in parallelo (ognuno con la propria resistenza).

2. **Resistenza in parallelo con un LED** — una resistenza in parallelo a un LED cortocircuita quasi tutto il percorso del LED (corrente scorre preferenzialmente nella resistenza più bassa). La resistenza di protezione va **in serie** col LED, non in parallelo.

3. **Confondere dove misurare la tensione vs la corrente** — la tensione si misura in parallelo ai morsetti del componente (puntali ai due estremi), la corrente si misura in serie (multimetro in amperometro inserito nel percorso). Scambiare le posizioni può danneggiare il multimetro.

4. **Aggiungere componenti in parallelo "senza pensare" alla batteria** — ogni ramo parallelo aggiuntivo assorbe più corrente. Con tanti LED in parallelo senza resistenze dedicate, la batteria si scarica rapidamente e i LED ricevono più corrente del previsto.

5. **Calcolo Rtot parallelo sbagliato** — errore classico: sommare R1+R2 anche in parallelo. Ricordate: in parallelo la resistenza totale è **sempre minore** della resistenza più piccola tra i rami.

## Domande tipiche degli studenti

**"Se metto due batterie in serie, la tensione raddoppia — è lo stesso per i resistori?"**
> Per le batterie in serie sì, la tensione si somma. Per i resistori in serie, anche la resistenza si somma — ma la tensione non si "raddoppia", si divide tra i componenti in proporzione ai loro valori. È la Legge di Ohm che governa tutto!

**"Perché le prese di corrente a casa sono in parallelo e non in serie?"**
> Ottima domanda! In parallelo ogni apparecchio riceve la tensione piena (220V) indipendentemente dagli altri. In serie, se un apparecchio si rompe o si spegne, interrompe il circuito per tutti — come le vecchie lucine di Natale in serie: una va, si spengono tutte.

**"Come faccio a riconoscere se un circuito è in serie o in parallelo?"**
> Seguite il percorso della corrente: se c'è un solo percorso possibile dall'inizio alla fine (tutti i componenti in fila), è serie. Se la corrente può scegliere tra due o più strade alternate, quella parte è in parallelo. Nei circuiti misti, cercate i "bivi" e i "ricongiungimenti".

**"La resistenza totale in parallelo è sempre metà di quella di un singolo resistore?"**
> Solo se i due resistori sono uguali. Con R1=R2, ottieni Rtot = R/2. Ma se R1=1kΩ e R2=10kΩ, la resistenza totale è circa 909Ω — molto vicina al valore più piccolo. Il ramo con meno resistenza "domina" il parallelo.

## PRINCIPIO ZERO

**Narrativa per la classe** — quando portate questo concetto alla LIM:

> "Ragazzi, guardate il kit: abbiamo costruito i LED uno dopo l'altro in fila — serie. Misuriamo la tensione su ognuno col multimetro: vedete come si divide? Ora proviamo a collegarli fianco a fianco — parallelo. La tensione è la stessa su tutti, ma guardate la corrente totale che esce dalla batteria: è la somma di tutti i rami!"

**Sicurezza:** in serie con una resistenza di protezione adeguata, le tensioni restano sicure (≤9V kit Omaric). In parallelo, controllate che la corrente totale non superi la portata della batteria o dei connettori della breadboard (~200-300mA per circuiti da banco).

**Cosa dire ai ragazzi:**
- "Proviamo insieme: con questi tre resistori in serie, quanto vale la corrente totale? Calcoliamola con la Legge di Ohm prima di misurare."
- "Ragazzi, osservate: ho staccato un LED dalla fila in serie — che succede agli altri? E se faccio la stessa cosa in parallelo?"
- "Chi mi sa dire dove mettere il puntale rosso del multimetro per misurare la tensione su R2 senza smontare il circuito?"

**Plurale inclusivo:** usate sempre "Calcoliamo", "Proviamo", "Osservate insieme" — mai comandi diretti al singolo. Il kit fisico è sempre protagonista: costruite prima il circuito sulla breadboard, poi confrontate con la simulazione.

## Link L1 (raw RAG queries)

Query dirette da passare a `searchRAGChunks()` o `searchKnowledgeBase()` per arricchire il contesto:

```
resistori in serie somma corrente uguale
resistori in parallelo tensione uguale corrente somma
circuito misto serie parallelo calcolo
Rtot parallelo formula due resistori
LED in serie in parallelo tensione
legge di Ohm circuito serie parallelo
caduta tensione resistori serie misura multimetro
corrente totale parallelo batteria breadboard
```
