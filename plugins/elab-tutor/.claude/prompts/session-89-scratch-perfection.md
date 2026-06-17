---
description: "Scratch Perfection + Simon Game + Passo Passo Finestra — Session 89"
---

**TASK**
Voglio che Scratch, il gioco Simon e la modalità Passo Passo funzionino correttamente e siano usabili da uno studente di 13 anni, così che il simulatore ELAB raggiunga la piena maturità didattica.

**CONTEXT FILES**
Prima leggi questi file completamente:
- `src/components/simulator/panels/ScratchEditor.jsx` — editor Blockly, tema ELAB, ErrorBoundary
- `src/components/simulator/panels/scratchGenerator.js` — genera C++ da workspace Blockly
- `src/components/simulator/panels/scratchBlocks.js` — 18 blocchi Arduino custom
- `src/data/experiments-vol3.js` — XML Scratch per esperimenti Vol3 (incluso SIMON)
- `src/components/simulator/panels/ComponentDrawer.jsx` — pannello Passo Passo con buildSteps + scratchSteps
- `src/components/simulator/NewElabSimulator.jsx` — orchestratore principale del simulatore

**REFERENCE**
Il riferimento è Tinkercad Circuits + l'editor Scratch di Arduino: drag-and-drop intuitivo, blocchi colorati che generano codice C++ visibile in tempo reale, compilazione che funziona al primo tentativo.

Regole estratte dal riferimento:
- Always: i blocchi devono essere trascinabili senza crash
- Always: il codice C++ generato deve compilare senza errori
- Always: la modalità Scratch deve essere accessibile anche SENZA il Passo Passo
- Never: lo Scratch non deve richiedere conoscenze pregresse di programmazione
- Always: il feedback visivo (LED acceso, buzzer che suona) deve corrispondere al codice Scratch
- Never: un pannello non deve coprire il circuito se non esplicitamente aperto dall'utente

**SUCCESS BRIEF**
- **Tipo di output**: Simulatore interattivo per bambini 11-14 anni
- **Reazione del destinatario**: "Wow, trascino i blocchi e il LED si accende davvero!" — lo studente capisce la relazione blocco→codice→circuito
- **Does NOT sound like**: Un IDE per adulti, un editor pieno di errori, un'interfaccia che crasha
- **Success means**: Lo studente completa l'esperimento Simon con Scratch senza aiuto dell'insegnante. Il cicalino suona le 4 note diverse. I blocchi non crashano. Il Passo Passo si apre in una finestra separata senza coprire il circuito.

**RULES**
Le mie regole, vincoli e trappole:
1. **ZERO REGRESSIONI** — il simulatore attuale (breadboard, drag-drop, fili, compilazione Arduino C++, Galileo AI, tutti i 70 esperimenti) deve continuare a funzionare identicamente. Se tocchi un file, verifica che tutto ciò che già funzionava continui a funzionare.
2. **Chain of Verification (CoV)** — ogni modifica va verificata punto per punto prima di essere confermata. Niente "dovrebbe funzionare".
3. **Disposizione identica al libro** — "Già Montato" e "Passo Passo" piazzano i componenti nella posizione esatta del libro (stessi fori, stessi colori fili).

**CONVERSATION**
NON iniziare a scrivere codice. Prima fammi domande di chiarimento (usa AskUserQuestion) così possiamo allinearci passo dopo passo. In particolare:
- Come vuoi che si apra la finestra Passo Passo? (modale? pannello laterale? finestra separata?)
- Il Simon deve avere 4 buzzer fisici o 1 buzzer con frequenza modulabile via codice?
- Scratch standalone: tab sempre visibile per tutti i Vol3, o serve un pulsante per attivarlo?

**PLAN**
Prima di scrivere codice, elenca le 3 regole dal context file che contano di più per questo task. Poi dammi il piano di esecuzione (massimo 5 step). Inizia il lavoro solo dopo il mio OK.

**ALIGNMENT**
Aspetta la mia approvazione esplicita prima di procedere con qualsiasi modifica al codice.
