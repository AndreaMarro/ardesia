---
id: circuito-aperto
type: concept
title: "Circuito aperto"
locale: it
volume_ref: 1
pagina_ref: 28
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [fondamenti, circuito, corrente, diagnostica, troubleshooting, base]
---

## Definizione

Un circuito aperto è un percorso elettrico interrotto: la corrente non può scorrere perché manca almeno un collegamento che chiude il cammino tra il polo positivo e il polo negativo della sorgente. Vol. 1 pag. 28 lo introduce come "un circuito con un buco — gli elettroni arrivano all'interruzione e si fermano".

## Analogia per la classe

Ragazzi, pensate alla pista di una gara di Formula 1. La macchina (la corrente) deve fare il giro completo per tagliare il traguardo. Se anche solo un metro di asfalto è rimosso, la macchina si ferma lì — non può saltare il buco. Nel circuito aperto il "buco" è un filo staccato, un componente mancante, o un collegamento sulla breadboard inserito nella riga sbagliata.

## Cosa succede fisicamente

Quando il circuito è aperto:

| Grandezza        | Valore nel circuito aperto         | Perché                                      |
|------------------|------------------------------------|---------------------------------------------|
| Corrente (I)     | 0 A                                | Il percorso è interrotto, nessun elettrone scorre |
| Tensione sul gap | = V_sorgente (es. 9 V)             | Tutta la tensione "cade" sull'interruzione  |
| Tensione sul LED | 0 V                                | Nessuna corrente → nessuna caduta di tensione sui componenti |
| Resistenza       | → ∞ (praticamente infinita)        | Aria o vuoto tra i due punti aperti         |

### Formula chiave

Dalla Legge di Ohm (`I = V / R`):

```
R → ∞  ⟹  I = V / ∞ = 0 A
```

Se misuri con il multimetro i capi del gap, leggi quasi tutta la tensione della sorgente (es. ~9 V su una batteria 9V). Questo è il segnale diagnostico più utile: **tensione alta sul gap = circuito aperto lì**.

## Esperimenti correlati

- **Vol.1 pag.27** — Primo circuito LED: togliere il filo del catodo simula intenzionalmente un circuito aperto per far capire la differenza
- **Vol.1 pag.35** — Resistenza in serie: un LED che non si accende è quasi sempre un circuito aperto
- **Vol.2 pag.8** — Partitore di tensione: misurare con il multimetro dove la tensione "salta" rivela l'apertura
- **Vol.3 pag.75** — UART: TX non collegato a RX crea un circuito aperto seriale (nessun dato ricevuto)

## Errori comuni

1. **Filo inserito nella riga sbagliata della breadboard** — visivamente sembra collegato ma la corrente non passa; soluzione: controllare riga per riga con il multimetro in modalità continuità.
2. **GND non collegato** — il componente ha il positivo ma manca il cammino di ritorno; il LED rimane spento anche con tutto il resto corretto.
3. **Cavetto breadboard con punta ossidato o rotto internamente** — all'esterno sembra intatto, ma internamente il filo è interrotto; soluzione: sostituire il cavetto.
4. **Componente inserito a cavallo del canale centrale della breadboard** — i fori centrali non sono collegati tra loro; ogni gamba del componente va su una riga diversa dello stesso lato.
5. **Pin Arduino non dichiarato come OUTPUT** — il pin non alimenta il circuito, comportamento identico a circuito aperto; soluzione: aggiungere `pinMode(pin, OUTPUT)` nel setup.

## Domande tipiche degli studenti

**"Perché il LED non si accende se ho messo tutti i fili?"**
Quasi sempre è un circuito aperto: un cavetto staccato di 1 mm, oppure GND non collegato. Chiedete loro di tracciare il percorso con il dito dalla batteria/pin Arduino fino al LED e poi fino a GND — troveranno il buco.

**"Cosa leggo con il multimetro se il circuito è aperto?"**
In modalità voltmetro, leggete circa tutta la tensione della sorgente sui capi del punto interrotto. In modalità continuità (bip), non sentirete nessun suono attraverso il gap.

**"Un circuito aperto è pericoloso?"**
No, è il contrario — con I = 0 A non scorre corrente, quindi nessun componente si scalda. È una situazione sicura ma inutile: il circuito semplicemente non funziona.

**"È uguale a un interruttore aperto?"**
Sì, esattamente! Un interruttore aperto crea intenzionalmente un circuito aperto. Quando premete il pulsante, chiudete il circuito e la corrente può scorrere.

## PRINCIPIO ZERO

### Sicurezza

Il circuito aperto è **intrinsecamente sicuro**: I = 0 A significa zero calore, zero rischio di cortocircuito. Potete lasciare i ragazzi esplorare liberamente — al massimo il componente non funziona.

### Narrativa per il docente

Quando vedete un gruppo con il LED spento, non dite subito la risposta. Guidateli con questa sequenza:

> *"Ragazzi, seguite il percorso con il dito: partiamo dal + della batteria — dove arriva questo filo? — e dall'altra parte del LED, dove va? — arriviamo al − della batteria senza interruzioni?"*

Questa routine crea il **metodo diagnostico** che useranno per tutta la vita: prima di cambiare componenti, verificare il percorso completo.

### Cosa dire ai ragazzi (cita il Volume)

Leggete dal Vol. 1 pag. 28:

> *"Un circuito con un buco — gli elettroni arrivano all'interruzione e si fermano."*

Poi aggiungete: *"Vediamo insieme dove si è fermata la nostra corrente. Tracciamo il cammino."*

### Connessione con circuito chiuso

Questo concetto va insegnato sempre **in coppia** con `circuito-chiuso.md`: il contrasto tra le due situazioni fissa l'intuizione più di qualsiasi spiegazione isolata.

## Link L1 (raw RAG queries)

- Query `"circuito aperto"` in `src/data/rag-chunks.json` → chunk Vol.1 cap.4-5
- Query `"filo staccato"` → chunk errori diagnostici
- Query `"corrente zero"` → chunk teoria base + tabelle legge di Ohm
- Query `"LED non si accende"` → chunk troubleshooting + esperimenti Vol.1 pag.27-35
- Query `"continuità multimetro"` → chunk strumenti di misura Vol.2
