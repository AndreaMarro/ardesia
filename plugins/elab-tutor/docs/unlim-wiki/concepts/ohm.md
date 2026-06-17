---
id: ohm
type: concept
title: "Ohm (Ω) — L'unità di misura della resistenza"
locale: it
volume_ref: 1
pagina_ref: 35
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [ohm, resistenza, unita-misura, omega, kilohm, codice-colori, legge-ohm, base, fondamenti]
---

## Definizione

L'Ohm (simbolo **Ω**, lettera greca omega) è l'unità di misura della resistenza elettrica. Vol. 1 pag. 35 introduce il resistore descrivendo come "ogni resistore ha un valore in Ohm che dice quanto frena la corrente".

Un Ohm è la resistenza che lascia passare **1 Ampere** di corrente quando ai suoi capi c'è una differenza di tensione di **1 Volt**:

```
1 Ω = 1 V / 1 A
```

## Analogia per la classe

Ragazzi, immaginate di misurare quanto è stretta un'autostrada. Usiamo i "metri di larghezza" — più stretta è, meno macchine passano. Per la corrente elettrica usiamo gli Ohm: più Ohm ha una resistenza, meno corrente passa. Un resistore da 470 Ω "stringe" molto di più di uno da 220 Ω.

## Cosa succede fisicamente

Quando gli elettroni attraversano un materiale resistivo (il filo sottile dentro il resistore), sbattono contro gli atomi e perdono energia. Più il materiale è resistente, più "frenano". Il valore in Ohm misura esattamente quanto questo freno è potente.

**Multipli usati nel kit ELAB:**

| Simbolo | Nome      | Equivalenza     | Esempio               |
|---------|-----------|-----------------|-----------------------|
| Ω       | Ohm       | 1 Ω             | 220 Ω (LED con 5 V)  |
| kΩ      | kilohm    | 1 000 Ω         | 10 kΩ (pull-up)       |
| MΩ      | Megaohm   | 1 000 000 Ω     | (non usato nel kit)   |

**Relazione diretta con la Legge di Ohm:**

```
V = R × I   →   R (in Ω) = V (in V) / I (in A)
```

Esempio: con la batteria 9 V e 20 mA (0.02 A) per il LED:
```
R = 9 / 0.02 = 450 Ω  →  si usa 470 Ω commerciale
```

### Leggere il valore in Ohm dai colori

Le resistenze del kit hanno **4 anelli colorati**. Il terzo anello è il moltiplicatore:

| Colore  | Cifra | Moltiplicatore |
|---------|-------|----------------|
| Marrone | 1     | × 10           |
| Rosso   | 2     | × 100          |
| Arancio | 3     | × 1 000        |
| Giallo  | 4     | × 10 000       |
| Verde   | 5     | × 100 000      |

**Esempio — resistore 470 Ω (Giallo-Viola-Marrone-Oro):**
```
Giallo (4) – Viola (7) – Marrone (×10) – Oro (±5%)
= 47 × 10 = 470 Ω
```

**Esempio — resistore 10 kΩ (Marrone-Nero-Arancio-Oro):**
```
Marrone (1) – Nero (0) – Arancio (×1 000) – Oro (±5%)
= 10 × 1 000 = 10 000 Ω = 10 kΩ
```

## Esperimenti correlati

- **Vol. 1 pag. 27** — Primo circuito LED: scegliere 470 Ω con batteria 9 V
- **Vol. 1 pag. 35** — Variare luminosità cambiando valore della resistenza (220 Ω → 470 Ω)
- **Vol. 1 pag. 45** — Legge di Ohm: calcolare il valore giusto di resistenza per ogni circuito
- **Vol. 2 pag. 8** — Partitore di tensione: due resistenze che si "dividono" la tensione

## Errori comuni

1. **Confondere Ω e kΩ** — Usare una resistenza da 10 kΩ dove serve 470 Ω rende il LED quasi invisibile; usare 470 Ω dove serve 10 kΩ (pull-up) genera troppa corrente inutile. Attenzione all'ordine di grandezza: 10 kΩ = 10 000 Ω, non 10 Ω.

2. **Leggere gli anelli nel verso sbagliato** — Gli anelli si leggono dalla fascia più vicina a un'estremità del corpo. L'anello dell'oro o argento è sempre l'ultimo (tolleranza) e non fa parte del valore. Ruotate la resistenza se non siete sicuri.

3. **Non tenere conto della tolleranza** — L'anello oro (±5 %) significa che una resistenza da 470 Ω potrebbe misurare tra 446 Ω e 494 Ω. Per il kit ELAB va bene; per circuiti di precisione serve un multimetro.

4. **Mettere due resistenze in parallelo per errore** — Su una breadboard è facile inserire due resistenze sullo stesso nodo senza accorgersene. Due resistenze da 470 Ω in parallelo diventano 235 Ω: il LED riceve il doppio della corrente prevista.

5. **Credere che "maggiore Ohm = più potente"** — È il contrario per la corrente: più alto è il valore in Ohm, meno corrente passa. Un LED con 10 kΩ non si accende quasi per niente, non perché sia "troppo forte" ma perché la corrente è troppo bassa.

## Domande tipiche degli studenti

**"Perché si chiama Ohm? Chi era?"**
Georg Simon Ohm era un fisico tedesco del 1800 che scoprì la relazione tra tensione, corrente e resistenza. La sua formula — che voi già conoscete come V = R × I — è così importante che abbiamo chiamato l'unità di misura con il suo nome. Il simbolo Ω è la lettera greca omega, scelta perché "O" era già usata altrove in fisica.

**"Se aumento gli Ohm, cosa succede al LED?"**
Si affievolisce. Più Ω = più "freno" = meno corrente = meno luce. Provate con una resistenza da 1 kΩ e poi da 10 kΩ sullo stesso LED: vedrete la differenza con i vostri occhi.

**"Come faccio a misurare gli Ohm senza guardare i colori?"**
Con il multimetro! Mettete il selettore su Ω (o sulla simbolo della resistenza), toccate i due piedini della resistenza con le sonde rossa e nera, e lo schermo mostra il valore diretto in Ω o kΩ. È il metodo più affidabile, specie per resistenze danneggiate o di colore difficile da leggere.

**"C'è un modo per ricordare i colori più facilmente?"**
Sì — la frase mnemonica italiana è: **"Nero Bruno Rosso Orange Giallo Verde Blu Viola Grigio Bianco"** per le cifre da 0 a 9. Trovate quella che funziona per voi o inventatene una di classe!

## PRINCIPIO ZERO

**Contesto narrativo per la classe:** Il momento in cui si introduce il valore in Ohm è il primo contatto dei ragazzi con il fatto che i componenti non sono tutti uguali — una resistenza ha un "numero" che decide quanto corrente passa. È l'alba del pensiero da elettronico: non basta mettere un componente, bisogna scegliere quello giusto.

**Cosa fare con i ragazzi:**
- Mostrate tre resistenze fianco a fianco: 220 Ω, 470 Ω, 10 kΩ. Chiedete: "Sembrano uguali, vero? Ma non lo sono — guardate gli anelli"
- Accendete lo stesso LED con ciascuna delle tre resistenze e fate osservare la differenza di luminosità — è la dimostrazione visiva più efficace degli Ohm
- Fate leggere il codice a colori ad alta voce insieme, un anello alla volta, prima di montare il circuito
- Citate Vol. 1 pag. 35: "ogni resistore ha un valore in Ohm che dice quanto frena la corrente"

**Sicurezza:**
- La resistenza è il **componente di protezione**: senza di essa, il LED riceve tutta la tensione e si brucia in pochi secondi
- **Non scendete mai sotto 100 Ω** con LEDs alimentati a 9 V — Vol. 1 lo riporta esplicitamente come regola di sicurezza
- Le resistenze possono diventare calde se il valore è molto basso con alta tensione: insegnate ai ragazzi a non tenere le dita su componenti caldi per più di un secondo

**Cosa NON fare:**
- Non passate oltre il concetto di Ohm finché tutti i ragazzi sanno leggere almeno il codice a 4 fasce — è la base per tutti i circuiti successivi
- Non usate il simbolo Ω senza spiegarlo la prima volta: alcuni ragazzi lo confondono con una "w" o con un'altra lettera

**Cosa dire ai ragazzi** (citazione diretta Vol. 1):
> "Ogni resistore ha un valore in Ohm che dice quanto frena la corrente." — Vol. 1 pag. 35

## Link L1 (raw RAG queries)

Frasi di ricerca per recuperare chunk L1 correlati da `src/data/rag-chunks.json`:

- `"resistore 470 Ohm LED"`
- `"valore resistenza codice colori"`
- `"legge di Ohm V R I"`
- `"kilohm kΩ pull-up resistenza"`
- `"220 Ohm 470 Ohm luminosità LED"`
