# UNLIM — Visione Completa del Prodotto

> Fonte: brainstorming con Andrea Marro, 27/03/2026
> Trascrizione audio 25/03/2026 + sessione interattiva G4
> Questo documento è la BUSSOLA. Ogni decisione di design deve essere coerente con questa visione.

---

## Il Principio Zero

**L'insegnante deve poter arrivare alla lavagna e spiegare PER MAGIA anche se non sa niente.**

UNLIM non è un chatbot. Non è un pannello laterale. Non è una videolezione.
UNLIM è l'INTELLIGENZA INVISIBILE che permette a qualunque docente di insegnare elettronica senza preparazione.

---

## Cos'è UNLIM

UNLIM è la mascotte ELAB — il robottino del logo — che vive dentro il simulatore.

- **Ferma nell'angolo**, sempre presente. Si attiva visivamente (occhi che brillano, piccola animazione) quando parla. Non si sposta per lo schermo.
- **Messaggi contestuali** appaiono dove hanno senso: accanto al LED quando parla del LED, sopra la breadboard quando suggerisce il montaggio, al centro per le domande alla classe. Poi spariscono. **Lo schermo è sempre pulito.**
- **Input**: barra semplice in basso (testo) + microfono (voce). Il docente parla o scrive e UNLIM capisce.
- **Output**: messaggi overlay brevi + voce TTS per la LIM. Linguaggio 10-14 anni.

---

## Le 7 Capacità Fondamentali

### 1. SA TUTTO (Onnisciente)
- Stato circuito attuale (componenti, fili, simulazione)
- Storia di TUTTE le sessioni precedenti della classe
- Contesto: "l'ultima volta abbiamo fatto il LED, Marco ha avuto problemi con la polarità"
- Curriculum completo dei 67 esperimenti (3 volumi)
- Vocabolario progressivo per capitolo
- Misconcezioni comuni per ogni concetto
- Vede screenshot del simulatore in tempo reale

### 2. PUÒ TUTTO (Onnipotente)
- Montare circuiti completi o passo passo
- Compilare codice Arduino
- Evidenziare componenti e pin
- Caricare qualsiasi esperimento
- Fare quiz, cercare video YouTube
- Misurare tensione/corrente
- Diagnosticare errori nel circuito
- Fare screenshot
- 26+ azioni documentate in GALILEO-CAPABILITIES.md

### 3. PREPARA LA LEZIONE
- Quando il docente apre UNLIM, la lezione è GIÀ PRONTA
- Basata sul contesto precedente + prossimo esperimento del volume
- La struttura NON è fissa — si adatta a cosa succede durante la lezione
- Pre-generata dai processi automatici (automa), non generata live

### 4. IL DOCENTE SCEGLIE COME LAVORARE
- **Libero**: monta fisicamente il circuito, UNLIM osserva e aiuta se chiesto
- **Già Montato**: "Monta il circuito per me" → circuito pronto
- **Passo Passo**: UNLIM guida componente per componente
- UNLIM si adatta alla scelta senza giudizio

### 5. SCRIVE OVUNQUE
- Sulla breadboard: appunti posizionati accanto ai componenti
- Sullo schermo: annotazioni libere come su una lavagna
- Tutto è annotabile. Lo schermo È una lavagna.

### 6. STRUMENTI NASCOSTI (Progressive Disclosure)
- Editor codice, Scratch/Blockly, serial monitor, BOM, quiz, video, lavagna, appunti, esporta PNG, shortcuts — ci sono TUTTI
- Appaiono quando il docente li chiede ("mostrami il codice") o quando UNLIM li suggerisce al momento giusto ("Ora che siamo al Vol3, ti mostro l'editor Arduino")
- Mai tutti visibili insieme. L'interfaccia è sempre minimale.

### 7. SESSIONI SALVATE + REPORT FUMETTO
- Ogni sessione salva TUTTO: messaggi, stato circuito, screenshot, annotazioni, esperimenti fatti, errori, tempo
- Quando il docente torna, UNLIM sa esattamente dove eravamo
- **Report fumetto**: il docente preme "Crea il report" → PDF con la mascotte ELAB che racconta la lezione. Immagini del circuito, domande, risposte, concetti. Condivisibile con genitori, dirigente, studenti assenti.

---

## Cosa SPARISCE (rispetto all'interfaccia attuale)

| Elemento | Perché sparisce |
|----------|----------------|
| Chat come pannello fisso laterale | Sostituita da messaggi contestuali overlay |
| "Sono qui! Come posso aiutarti?" | UNLIM non si presenta — è già lì |
| Toggle "Modalità Guida" | UNLIM è SEMPRE la guida |
| Menu Dev/Admin visibili | Solo per admin, nascosti |
| 7 bottoni toolbar densi | Progressive disclosure via UNLIM |
| Sidebar navigazione volumi tradizionale | UNLIM propone il prossimo passo |
| Il nome "Galileo" come brand separato | È UNLIM. Un solo nome. |

---

## Come Appare sulla LIM (Flusso Tipo)

### Apertura
1. Docente apre elabtutor.school sulla LIM
2. UNLIM (mascotte nell'angolo) riconosce la classe: "Bentornati! L'ultima volta avete fatto il LED. Oggi passiamo al resistore!"
3. Sopra la breadboard appare: "Cap 6 Esp 3 — Cambia luminosità. Servono 3 resistori diversi. Premi ▶ quando sei pronto."
4. Lo schermo è pulito: breadboard grande, mascotte piccola, messaggio breve.

### Durante la lezione
5. Docente preme ▶ → UNLIM monta il circuito passo passo (o tutto insieme, come preferisce)
6. Docente dice: "Cosa succede se uso il resistore grande?" → UNLIM: "Provate! Cambiate il resistore e guardate il LED." (overlay accanto al resistore, 4s)
7. Uno studente monta il LED al contrario → UNLIM vede (screenshot) → overlay accanto al LED: "Giralo! L'anodo (gamba lunga) va verso il +" (3s, poi sparisce)
8. Docente scrive "ANODO = +" sulla breadboard con la penna → l'annotazione resta

### Chiusura
9. Docente: "Ok ragazzi, cosa abbiamo imparato oggi?"
10. UNLIM suggerisce: "Più resistenza = meno luce. Il resistore è come un rubinetto!" (overlay centrale)
11. Docente: "Crea il report" → PDF fumetto generato con tutto quello che è successo

---

## Principi di Design

### Estetica ELAB
- Palette: Navy #1E4D8C, Lime #558B2F, Vol1 verde, Vol2 arancio, Vol3 rosso
- Font: stile dei volumi cartacei
- L'interfaccia deve sembrare una ESTENSIONE dei volumi fisici e delle scatole kit

### Linguaggio
- SEMPRE 10-14 anni
- Analogie quotidiane: "il resistore è come un tubo stretto per l'acqua"
- Mai pedante, mai professorale
- UNLIM dice "non lo so" quando non sa
- Mai volgare, mai rivela l'implementazione

### Minimale ma Potente
- Pochi elementi sullo schermo, tanto dietro
- La breadboard/simulatore è il protagonista, non l'interfaccia
- Ogni strumento appare quando serve, sparisce quando non serve

### Il Prodotto è UNO
- ELAB Tutor + Kit fisico + Volumi cartacei = stessa cosa
- Ogni volume è legato ai pezzi del suo kit e agli esperimenti
- Il software non ha senso senza il kit, il kit non ha senso senza il software

---

## Sicurezza e Privacy

- GDPR pieno per le scuole italiane
- Modelli locali o cluster scolastici quando possibile
- Non è un clone ChatGPT — è un prodotto chiuso e controllato
- Codice protetto, non copiabile
- Safety filter: blocca contenuti pericolosi, volgari, off-topic

---

## Anti-Pattern (Cosa UNLIM NON È)

| UNLIM NON è | Perché |
|-------------|--------|
| Un chatbot in una sidebar | I messaggi vanno DOVE servono, non in una finestra fissa |
| Una videolezione automatica | Il docente è il MEDIUM, non lo spettatore |
| Un sostituto dell'insegnante | È un assistente INVISIBILE |
| Un clone ChatGPT per ragazzini | È un prodotto verticale per elettronica educativa |
| Un'app generica di e-learning | È legato ai kit ELAB fisici e ai volumi specifici |
| Un prodotto che richiede formazione | Il docente arriva e SPIEGA SUBITO |

---

## Stato Attuale vs Visione

| Aspetto | Oggi | Visione |
|---------|------|---------|
| Mascotte | Lettera "U" | Robottino logo ELAB animato |
| Messaggi | Toast top-center fisso | Overlay contestuali posizionati |
| Input | Solo testo | Testo + voce |
| Output | Solo testo overlay | Testo overlay + TTS voce |
| Chat | Pannello laterale | Sparisce |
| Lesson paths | 13/67 statici | 67/67 pre-generati, adattivi |
| Memoria sessioni | localStorage isolato | Backend sync cross-device |
| Report | Non esiste | PDF fumetto su richiesta |
| Strumenti | Tutti visibili | Progressive disclosure |
| Annotazioni | Solo canvas generico | Su breadboard + schermo |
| Teacher Dashboard | Disconnesso da lesson paths | Integrato con progressi |

---

## File di Riferimento

| Documento | Dove |
|-----------|------|
| Capacità tecniche complete | `automa/context/GALILEO-CAPABILITIES.md` |
| Trascrizione audio Andrea | Nella conversazione G4 (27/03/2026) |
| Mercato e pricing | `memory/mercato-pnrr-mepa.md` |
| Committenti | `memory/committenti-dettaglio.md` |
| Sprint Plan originale | `automa/SPRINT-PLAN.md` |
| Verifica richieste | `automa/VERIFICA-RICHIESTE.md` |
| Stato UNLIM G1 | `memory/unlim-mode-status.md` |
| Best practices sessioni lunghe | `memory/long-session-best-practices.md` |
