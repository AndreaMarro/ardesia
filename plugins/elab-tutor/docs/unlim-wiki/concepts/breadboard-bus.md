---
id: breadboard-bus
type: concept
title: "Breadboard Bus — le rotaie di alimentazione della breadboard"
locale: it
volume_ref: null
pagina_ref: null
source_status: general_knowledge_only
created_at: 2026-04-28
updated_at: 2026-04-28
updated_by: scribe
tags: [breadboard, bus, alimentazione, rotaia, VCC, GND, power-rail, cablaggio, fondamenti]
---

## Definizione

Il **bus della breadboard** (o *power rail*) è la coppia di righe lunghe rosse e blu ai bordi della breadboard che distribuisce la tensione di alimentazione (+) e la massa (GND) a tutti i componenti inseriti nelle colonne centrali. A differenza delle righe di connessione interne (dove i 5 fori a-e e f-j sono collegati per riga), ogni rotaia del bus è collegata **in tutta la sua lunghezza** (o in metà di essa, nelle breadboard da 830 punti).

> Concetto strettamente correlato: vedi → [breadboard.md](breadboard.md) (Vol. 1 pag. 21) per la struttura generale della breadboard e [ground-massa.md](ground-massa.md) (Vol. 1 pag. 18) per il significato fisico del GND.

## Analogia per la classe

Ragazzi, immaginate che la breadboard sia una città. Le colonne centrali sono le strade dove si costruiscono i circuiti — ogni isolato (riga) connette cinque case. I bus rosso e blu sono invece le **tubature dell'acqua e del gas** che corrono lungo tutta la città: l'acqua (+, corrente) arriva a ogni casa attraverso la tubatura rossa, e il gas (GND, ritorno) riparte dalla tubatura blu. Non dovete portare l'acqua da un capo all'altro della città ogni volta — è già lì, in tutto il bus. Ogni componente si "attacca" alla tubatura più vicina con un corto filo.

## Cosa succede fisicamente

### Struttura interna del bus

```
 Breadboard 830 punti — vista dall'alto
 ┌─────────────────────────────────────────────┐
 │  +  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  ← bus superiore (+)
 │  −  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  ← bus superiore (−)
 │─────────────────────────────────────────────│
 │     1  2  3  4  5  ...                      │
 │  a  ●  ●  ●  ●  ●  ...  righe centrali      │
 │  b  ●  ●  ●  ●  ●  ...  (5 fori per riga)  │
 │  c  ●  ●  ●  ●  ●  ...                      │
 │  d  ●  ●  ●  ●  ●  ...                      │
 │  e  ●  ●  ●  ●  ●  ...                      │
 │─────────────────────────────────────────────│
 │  f  ●  ●  ●  ●  ●  ...  (gap centrale)      │
 │  ...                                         │
 │─────────────────────────────────────────────│
 │  +  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  ← bus inferiore (+)
 │  −  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │  ← bus inferiore (−)
 └─────────────────────────────────────────────┘
```

| Rotaia | Colore convenzionale | Tensione tipica nel kit ELAB | Simbolo |
|--------|----------------------|------------------------------|---------|
| Bus (+) | Rossa | 5 V (da Arduino) o 9 V (batteria) | VCC / +5V / +9V |
| Bus (−) | Blu o nera | 0 V (massa di riferimento) | GND |

### Attenzione: la breadboard da 830 punti ha il bus SPEZZATO a metà

Nelle breadboard da 830 punti (le più comuni nei kit), ogni rotaia rossa e blu è **interrotta fisicamente al centro**: la metà superiore e quella inferiore sono due segmenti distinti non collegati.

```
 Bus superiore: [●●●●●●●●●●●●●●] GAP [●●●●●●●●●●●●●●]
                     ↑                      ↑
               metà sinistra          metà destra
               (indipendente)         (indipendente)
```

**Se dimenticate di "ponticellare" le due metà**, i componenti nella seconda metà del bus non ricevono alimentazione — pur essendo visivamente sulla stessa riga rossa. Questo è uno degli errori più frequenti nei primi esperimenti.

**Fix**: aggiungere un filo di ponticello che connette la riga rossa sinistra a quella destra (e lo stesso per la riga blu):

```
 +  ● ● ●──●─────────┐ ← filo ponticello
                      └── ● ● ●  ← adesso anche questa metà ha +5V
```

## Esperimenti correlati

- **Primo circuito LED** — la batteria 9V si collega al bus (+) e (−); il LED pesca dal bus (Vol. 1 pag. 21 struttura breadboard)
- **Blink con Arduino Nano** — il pin 5V di Arduino Nano va al bus (+), il pin GND al bus (−); tutti i componenti dell'esperimento si alimentano da lì
- **Divisore di tensione** (Vol. 2 pag. 63) — potenziometro con i terminali su bus (+) e (−); il cursore al centro va all'ingresso analogico
- **Circuiti con più componenti contemporanei** (qualsiasi capitolo Vol. 3) — il bus diventa fondamentale per evitare decine di fili che partono tutti dal pin 5V di Arduino

Concetti collegati: [concepts/breadboard.md](breadboard.md) · [concepts/ground-massa.md](ground-massa.md) · [concepts/tensione.md](tensione.md) · [concepts/corrente.md](corrente.md)

## Errori comuni

1. **Bus spezzato a metà non ponticellato** — l'errore classico: si collegano alcuni componenti nella metà sinistra e altri nella destra, poi ci si chiede perché metà del circuito non funziona. Il bus da 830 punti ha un'interruzione fisica al centro invisibile a occhio nudo (solo una sottile linea di separazione). Fix: aggiungere sempre due ponticelli (uno rosso + → +, uno blu − → −) che uniscono le due metà.

2. **Riga rossa usata come GND (o viceversa)** — si "salva" tempo collegando un filo a caso sul bus, invertendo + e −. Risultato: componenti polarizzati (LED, condensatori elettrolitici, chip) si invertono e possono bruciarsi. Fix: rispettare sempre la convenzione rossa = + e blu = −, come nei volumi.

3. **Bus non collegato ad alcuna sorgente** — la riga rossa e quella blu della breadboard non hanno tensione di partenza: è solo rame. Qualcuno va a lavorare su un circuito pensando "il bus è già alimentato" ma non ha collegato né la batteria né il pin 5V di Arduino. Fix: controllare sempre con il voltmetro che il bus rosso segni la tensione attesa (5 V o 9 V) prima di procedere.

4. **Due sorgenti diverse sullo stesso bus senza controllo** — si porta 9 V dal lato batteria e 5 V dal pin 5V di Arduino sulla stessa rotaia rossa. Le due tensioni si "scontrano" e possono danneggiare Arduino (il pin 5V non regge 9 V in ingresso). Fix: usare bus separati per sorgenti separate, o non collegare mai due diversi + sulla stessa rotaia.

5. **Filo troppo corto che "sfiora" il bus senza entrare nel foro** — visivamente il filo sembra inserito, ma elettricamente è disconnesso. Fix: premere con fermezza finché il filo non offre resistenza; verificare con il voltmetro o con il multimetro in modalità continuità.

## Domande tipiche degli studenti

**"Devo usare il bus o posso collegare tutto direttamente al pin 5V di Arduino?"**
Per uno o due componenti si può fare, ma il pin 5V di Arduino eroga al massimo ~400 mA totali. Se collegassimo ogni filo direttamente al pin, si affollerebbero fili su un solo punto. Il bus distribuisce la stessa tensione su tutta la lunghezza della breadboard — molto più comodo con più componenti, e non cambia nulla elettricamente.

**"Il bus rosso deve essere sempre 5 V o posso metterci 9 V?"**
Dipende dall'esperimento. Con solo la batteria 9V (senza Arduino) potete usare il bus a 9 V — ma attenzione: se poi inserite un chip o un LED senza resistenza adeguata, potrebbero bruciare. Con Arduino, usate il bus a 5 V (dal pin 5V del Nano). I volumi specificano sempre la tensione corretta per ogni esperimento.

**"Le due righe rosse (superiore e inferiore) sono collegate tra loro?"**
No, sono rotaie indipendenti. Potete usarle per tensioni diverse nello stesso esperimento (es. bus superiore = 5 V logic, bus inferiore = 9 V per motori). Oppure collegarle insieme con un ponticello se vi serve tutta la lunghezza a 5 V.

**"Come faccio a sapere se il bus è spezzato a metà?"**
Guardate la riga rossa o blu: c'è una piccola interruzione nella linea stampata, di solito al centro della breadboard. In alternativa, usate il multimetro in modalità continuità: appoggiate i puntali ai due estremi del bus — se non suona, è spezzato.

## PRINCIPIO ZERO

**Cosa comunicare ai ragazzi:**

> "Ragazzi, nella breadboard ci sono due tipi di connessioni. Le righe centrali (a-b-c-d-e e f-g-h-i-j) collegano pochi fori vicini — utili per i componenti. Le righe rosse e blu ai bordi — i **bus** — corrono per tutta la lunghezza della breadboard: sono come le tubature dell'acqua di tutta la città. Collegare il + della batteria al bus rosso significa che tutti i componenti possono 'bere' da lì, senza portare un filo separato per ognuno. Prima di iniziare qualsiasi circuito, guardate sempre se il bus è alimentato."

**Sequenza didattica raccomandata:**
1. Mostrate la breadboard vuota e chiedete: "Dove mettete il + della batteria?" Lasciate che qualcuno provi a collegarlo direttamente a una riga centrale.
2. Dopo aver montato un LED: "Funziona? Perché sì o no?" → dipende da dove è collegato il filo.
3. Introducete il bus: spostate il + sul bus rosso, aggiungete un filo dal bus al circuito LED. Si accende.
4. Aggiungete un secondo LED che pesca dallo stesso bus rosso. "Avete visto? Nessun filo extra verso la batteria — il bus distribuisce la tensione a tutti."
5. Dimostrate il problema del bus spezzato: mettete un LED nella metà destra del bus non ponticellata. Non si accende. "Perché? Perché il bus si interrompe qui. Fix: ponticello."

**Sicurezza:**
- Il kit ELAB lavora a 9 V DC — sicuro per i ragazzi, possono maneggiare breadboard e fili liberamente.
- Non collegare mai il bus rosso alla rete elettrica domestica (230 V): la breadboard è solo per bassissima tensione DC (max 12 V sicuri nel kit).
- Con la batteria 9 V: un cortocircuito bus(+) → bus(−) scarica rapidamente la batteria e scalda il filo. Non pericoloso per i ragazzi, ma spiega l'odore di "caldo" e mostra come controllare sempre i cablaggi prima di inserire la batteria.

**Cosa NON fare:**
- Non lasciare il bus non collegato e procedere con il circuito — verificare sempre con voltmetro prima di aggiungere componenti.
- Non mixare tensioni diverse sullo stesso bus senza averlo spiegato ai ragazzi — fonte di confusione e possibili danni ai componenti.

## Link L1 (raw RAG queries)

- `"breadboard bus rotaia rossa blu alimentazione GND VCC"`
- `"breadboard 830 punti bus spezzato ponticello"`
- `"power rail breadboard collegamento batteria 5V Arduino"`
- `"riga rossa blu breadboard tensione corrente convenzione"`
- `"bus non alimentato circuito non funziona diagnosi"`
- `"due sorgenti tensione breadboard bus separati"`
