---
id: corrente-continua
type: concept
title: "Corrente continua (DC)"
locale: it
volume_ref: 1
pagina_ref: 9
created_at: 2026-04-26
updated_at: 2026-04-26
updated_by: scribe
tags: [corrente-continua, DC, batteria, polarita, fondamenti, sicurezza, tensione, circuito]
---

## Definizione

La corrente continua (in inglese DC, *Direct Current*) è una corrente elettrica che **scorre sempre nella stessa direzione**, con polarità stabile e tensione sostanzialmente costante nel tempo. Vol. 1 pag. 9 la introduce come "la corrente prodotta dalle pile e dalle batterie", contrapponendola alla corrente alternata della rete elettrica domestica. Tutti gli esperimenti dei kit ELAB usano corrente continua — dalla batteria da 9 V ai pin di Arduino.

## Analogia per la classe

Ragazzi, immaginate l'acqua che scorre in una fontana da bere di montagna: esce sempre e solo nella stessa direzione, dalla sorgente verso di voi, con una pressione costante. Non torna mai indietro, non cambia verso, non oscilla. Questa è la corrente continua — affidabile, prevedibile, sicura. La corrente della presa di casa, invece, è come un'altalena che spinge l'acqua avanti e indietro 50 volte al secondo. Con la fontana sapete sempre da dove arriva e dove va: potete costruirci sopra un circuito senza sorprese.

## Cosa succede fisicamente

In un circuito DC gli elettroni (cariche negative) si muovono dal **polo negativo** (−) della batteria, attraverso i fili e i componenti, verso il **polo positivo** (+). Per convenzione storica, la **corrente convenzionale** è definita in senso opposto: da + verso −. Nelle formule e negli schemi ELAB si usa sempre la convenzione.

```
Polo (+) → [circuito: R, LED, motore...] → Polo (−)
     corrente convenzionale →
     ← elettroni (senso fisico reale)
```

La tensione rimane costante fintantoché la batteria è carica — non oscilla, non varia.

### Sorgenti DC nel kit ELAB

| Sorgente              | Tensione nominale | Uso tipico in ELAB                          |
|-----------------------|-------------------|---------------------------------------------|
| Batteria 9 V          | 9 V               | Alimentazione principale Vol. 1–3           |
| Pin Arduino 5 V       | 5 V               | Sensori, LED, logica digitale               |
| Pin Arduino 3,3 V     | 3,3 V             | Sensori delicati (es. fotoresistore)        |
| USB via computer      | 5 V               | Alimentazione Arduino durante programmazione|

### Grandezze fondamentali

| Grandezza   | Simbolo | Unità    | Definizione rapida                   |
|-------------|---------|----------|--------------------------------------|
| Tensione    | V       | Volt (V) | "Pressione" che spinge la corrente   |
| Corrente    | I       | Ampere (A) | Quanti elettroni passano al secondo |
| Resistenza  | R       | Ohm (Ω)  | Quanto il componente frena la corrente|
| Potenza     | P       | Watt (W) | Energia consumata per secondo        |

### Formule chiave

**Legge di Ohm** (→ vedi [legge-ohm.md](legge-ohm.md)):
```
V = R × I
```

**Potenza** dissipata da un componente:
```
P = V × I = R × I²
```

Esempio: LED con 2 V e 20 mA:
```
P = 2 V × 0,02 A = 0,04 W = 40 mW
```

### Carica della batteria 9 V

Una batteria alcalina da 9 V ha capacità tipica di **~550 mAh** (milliampere-ora). Con un circuito che assorbe 50 mA in totale:
```
Durata ≈ 550 mAh / 50 mA ≈ 11 ore
```
Più componenti inserite nel circuito, più corrente assorbite, più in fretta si scarica la batteria.

## Esperimenti correlati

- **Vol. 1 pag. 9** — Introduzione alla corrente: cos'è, da dove viene, come si misura
- **Vol. 1 pag. 27** — Primo LED: applicazione diretta DC su circuito semplice (→ [led.md](led.md))
- **Vol. 1 pag. 35** — Resistenza in serie: DC + Legge di Ohm in pratica (→ [resistenza.md](resistenza.md))
- **Vol. 2 pag. 93** — Motore a corrente continua: il DC muove fisicamente qualcosa (→ [motore-dc.md](motore-dc.md))
- **Tutti gli esperimenti Vol. 1–3**: usano esclusivamente corrente continua (batteria 9 V o pin Arduino)

## Errori comuni

1. **Invertire la polarità della batteria**: collegare il + dove va il − (e viceversa). Nei circuiti con LED il LED semplicemente non si accende (il diodo blocca). Con componenti polarizzati come elettrolitici o motori si può causare un danno. Controllate sempre il colore: rosso = +, nero = −.

2. **Credere che la tensione DC "svanisca" scorrendo nel circuito**: la tensione è la differenza di potenziale tra due punti, non si consuma. Quello che si consuma è l'**energia** (potenza × tempo). La batteria si scarica perché eroga energia, non perché "perde" volt lungo il filo.

3. **Confondere corrente e tensione**: "ho messo troppa corrente nel LED" è impreciso. I ragazzi erogano una **tensione** dalla batteria; la **corrente** dipende da quanto resistenza c'è nel circuito (Legge di Ohm). Per limitare la corrente si aggiunge una resistenza, non si abbassa la corrente direttamente.

4. **Lasciare il circuito chiuso senza carico (cortocircuito)**: collegare il + della batteria direttamente al − senza nessuna resistenza crea un cortocircuito. La batteria si scalda, si scarica rapidissimamente e può in casi estremi rigonfiarsi. Vedi `errors/cortocircuito.md`.

5. **Pensare che tutti i componenti funzionino a qualsiasi tensione DC**: 5 V e 9 V sono entrambi DC ma non intercambiabili. Un LED senza resistenza su 9 V brucia in secondi; un sensore da 3,3 V collegato a 9 V si danneggia. La tensione DC deve sempre essere *quella giusta* per il componente.

## Domande tipiche degli studenti

**"Perché si chiama corrente *continua*? Continua come?"**
Continua nel senso di *costante nel tempo*: scorre sempre nella stessa direzione, senza interruzioni e senza cambiare verso. È il contrario della corrente alternata, che ogni 1/50 di secondo inverte. "Continua" non significa che dura per sempre — la batteria si scarica — ma che in ogni istante la direzione è la stessa.

**"La batteria è sempre a 9 V anche quando è quasi scarica?"**
No: una batteria nuova può superare i 9,5 V; una batteria scarica scende sotto gli 8 V e i componenti iniziano a comportarsi in modo strano (LED fiochi, Arduino che si resetta). Un multimetro in modalità DC Volt mostra il livello di carica reale — è il primo strumento da usare se "qualcosa non funziona come prima".

**"Che differenza fa usare il pin 5 V di Arduino invece della batteria 9 V?"**
La tensione è diversa: 5 V vs 9 V. Alcuni componenti (sensori, display LCD) richiedono esattamente 5 V — la batteria da 9 V li brucerebbe senza un regolatore. Arduino ha già un regolatore di tensione interno che produce 5 V stabili dal 9 V in ingresso. Collegate sempre i componenti alla tensione che richiedono, non "alla più vicina".

**"Cosa succede se inverto i fili della batteria?"**
Dipende dal componente. Il LED non si accende (diodo, blocca la corrente inversa). Una resistenza funziona uguale (è bidirezionale). Il motore DC gira al contrario — è un modo legittimo per invertire la marcia! Un condensatore elettrolitico però si può danneggiare, e Arduino potrebbe resettarsi o bruciare se invertito. Controllate sempre prima di collegare.

## PRINCIPIO ZERO

### Sicurezza

La corrente continua a 9 V è sicura per bambini e ragazzi: la soglia di percezione cutanea è circa 1 mA, e 9 V su pelle asciutta produce correnti dell'ordine di microampere — ben al di sotto di qualsiasi soglia di pericolo. Questo è il motivo fondamentale per cui i kit ELAB usano batterie da 9 V DC invece della rete elettrica.

Regola d'oro nel contesto ELAB:
- I ragazzi possono toccare breadboard, fili, componenti e batterie con le mani — nessun pericolo
- Non smontate mai alimentatori o trasformatori di rete — quelli contengono AC ad alta tensione
- Se vedete un filo che scintilla o sentite odore di bruciato, staccate la batteria subito e controllate se c'è un cortocircuito

### Narrativa per il docente

La corrente continua è il fondamento di tutto il corso. Prima di mostrare qualsiasi circuito, è utile stabilire questo schema mentale nei ragazzi:

> *"La batteria è come un serbatoio d'acqua in cima a una collina. I fili sono il tubo. I componenti (resistenze, LED, motori) sono le valvole e le ruote idrauliche lungo il percorso. L'acqua scende sempre dall'alto verso il basso — non risale mai da sola."*

Questo schema regge per il 90% degli esperimenti dei tre volumi. Tornateci ogni volta che un ragazzo è confuso.

Usate questa sequenza quando introducete la DC:

> *"Da dove viene la corrente nel nostro kit?"* → dalla batteria  
> *"In che direzione scorre?"* → sempre la stessa, dal + al −  
> *"Cosa succede se blocchiamo il percorso?"* → la corrente si ferma (circuito aperto)  
> *"Cosa succede se non mettiamo ostacoli?"* → cortocircuito, la batteria si scalda  

La risposta a ogni dubbio pratico passa per questa struttura.

### Cosa dire ai ragazzi (cita il Volume)

Dal Vol. 1 (introduzione pag. 9):

> *"La batteria produce corrente continua — gli elettroni escono dal polo negativo, attraversano il circuito e rientrano nel polo positivo. Sempre nello stesso verso, senza oscillazioni."*

Poi aggiungete: *"Vediamo insieme il percorso che fa la corrente nel nostro primo circuito — dal + della batteria, attraverso la resistenza e il LED, fino al −. Ogni volta che costruiamo un circuito, questo è il percorso che dobbiamo immaginare."*

### Connessione con altri concetti

Insegnate sempre in coppia con `corrente.md` (cos'è la corrente in generale) e `tensione.md` (la "pressione" che la spinge). Collegate a `polarita.md` per spiegare perché il verso dei collegamenti conta. Quando introducete l'AC come contesto della rete domestica, usate `corrente-alternata.md` per il confronto.

## Link L1 (raw RAG queries)

- Query `"corrente continua batteria"` in `src/data/rag-chunks.json` → chunk introduzione Vol. 1 pag. 9
- Query `"DC direct current batteria 9V"` → chunk fondamenti corrente continua
- Query `"polo positivo negativo batteria circuito"` → chunk polarità e direzione corrente Vol. 1
- Query `"corrente costante direzione stessa"` → chunk definizione corrente continua
- Query `"tensione 5V 9V Arduino pin"` → chunk sorgenti DC nel kit ELAB
- Query `"batteria scarica tensione scende"` → chunk autonomia batteria e misura multimetro
