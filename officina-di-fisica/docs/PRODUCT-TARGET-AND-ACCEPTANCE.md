# Cric — obiettivo di prodotto e criteri di accettazione

Riferimento: consegna del **27 novembre 2026**, da leggere insieme a [HANDOFF-ASTRA-CLAUDE.md](HANDOFF-ASTRA-CLAUDE.md). Questo documento definisce il risultato da ottenere e come riconoscerlo. Le head, le prove della candidata e i registri scientifici devono essere ricontrollati prima di lavorare: gli stati qui descritti sono uno snapshot, non un’autorizzazione al rilascio.

## 1. Risultato atteso

Cric deve permettere al docente di trovare una risorsa, preparare un caso e usarlo nelle proprie spiegazioni, slide o materiali, lasciando allo studente un collegamento preciso per continuare. Lo studente deve ritrovare quel caso, comprenderne il rapporto con la lezione, esercitarsi e ricevere un passo successivo coerente con le prove disponibili.

La qualità si valuta su questo percorso completo. Aggiungere strumenti, contenuti, pannelli o integrazioni ha senso quando risolve una difficoltà osservata nel percorso. L’implementazione conserva il monolite modulare, l’identità grafica e le autorità esistenti per account, accessi, edizioni, quaderno, ordini e pubblicazione. Le raccolte restano selezioni leggere di risorse: il docente non deve gestire classi, presenze, calendari o lezioni dentro Cric.

## 2. Stato della consegna: funzione e verifica sono separati

**Implementato** indica un comportamento presente nel codice della candidata. **Parziale** indica una capacità limitata a un sottoinsieme o con passaggi ancora mancanti. **Non verificato** indica un risultato per il quale questa consegna non fornisce una prova adeguata; non significa necessariamente che il codice sia assente.

| Area | Stato funzionale osservato | Stato della verifica da conservare nell’handoff |
| --- | --- | --- |
| Copertina e navigazione | **Implementato:** azioni principali ridotte, accessi a studio, percorsi e risorse. | **Non verificato:** comprensibilità e qualità visiva della candidata con persone; collaudo browser da riferire alla SHA effettiva. |
| Uso libero degli strumenti | **Implementato:** ingresso ai banchi senza previsione obbligatoria; scena e comandi disponibili in concentrazione. | **Non verificato:** comportamento completo del consumer composto sui browser e dispositivi previsti. |
| Casi riproducibili e raccolte | **Parziale:** contratto completo su Poiseuille; salvataggio, raccolta, condivisione e revoca presenti. | Contratti e backend hanno prove locali; riapertura visiva e percorso completo richiedono il relativo collaudo browser. |
| Caso, lezione e studio | **Parziale:** collegamenti al caso, alla lezione e al percorso presenti. | **Non verificato:** continuità didattica completa e conservazione del riferimento al caso durante l’intero studio. |
| Adattività | **Implementato:** regole su eventi reali, recupero, pool esaurito, famiglie e programmi; ricevuta recuperabile dal server. | Scenari software documentati in [adaptive-policy.md](adaptive-policy.md). **Non verificato:** efficacia dell’apprendimento sulle persone. |
| Programmi universitari | **Parziale:** grafo, riferimenti validati e ambito della decisione server; scelta del programma non ancora sincronizzata fra dispositivi. | **Non verificato:** copertura generale delle università italiane. Il pacchetto pubblico di prova non certifica il corpus privato di Analisi. |
| Accessibilità | **Parziale:** supporti del lettore, alternative ai grafici, tastiera e correzioni dei controlli presenti. | **Non verificato:** conformità complessiva WCAG della candidata e usabilità con tecnologie assistive. |
| Interoperabilità | **Parziale:** contratti HTTP/JSON, contesto esportabile, biblioteca MCP autorizzata e export QTI della forma supportata. | **Non verificato:** interoperabilità completa con un LMS reale, LTI e rappresentazioni MathML lungo tutto il percorso. |
| Convergenza e rilascio | **Parziale:** candidata isolata e strumenti di conservazione/convergenza disponibili. | Stato di CI, browser, pacchetto, approvazioni e pubblicazione da leggere nelle prove aggiornate; nessun esito si deduce dal solo codice. |

## 3. Semplicità, orientamento e qualità visiva

**Accettazione UX.** In ogni schermata principale l’utente può riconoscere materia, obiettivo, attività corrente e destinazione del prossimo passo. Un’azione primaria emerge nel contesto; le funzioni secondarie possono essere aperte quando servono. Titoli, pulsanti, breadcrumb e messaggi usano gli stessi nomi per lo stesso oggetto. Le route precedenti e gli accessi validi continuano a funzionare.

La home distingue il primo ingresso dalla ripresa di un quaderno reale. Se esistono dati propone una ripresa o un’attività motivata; se non esistono propone un punto di ingresso e rende esplicita l’assenza di prove. Non mostra progressi inventati, obiettivi non scelti o percentuali prive di definizione. I dettagli tecnici di edizioni, provider e policy non devono diventare passaggi obbligatori per studiare.

**Prova richiesta.** Eseguire ricerca di un argomento, apertura della lezione, uso di uno strumento, ritorno al punto di studio e ripresa dopo ricarica. Registrare esitazioni, errori di navigazione, ritorni involontari e richieste di aiuto; distinguere osservazioni di persone e script automatici. Confrontare le schermate con la base per gerarchia, leggibilità, spaziatura e coerenza con palette, tipografia e illustrazioni di Cric. Un nuovo stile o una schermata più vuota, da soli, non dimostrano maggiore fruibilità.

## 4. Il docente attinge alle risorse

**Accettazione del percorso docente.** Cercare e aprire uno strumento non richiede iscrivere studenti, creare una classe o completare un quiz. Il docente può modificare le condizioni mentre spiega, ripristinare un caso preparato, usare la vista più adatta e mantenere disponibili i comandi essenziali. Può lasciare Cric e riutilizzare il riferimento nei propri materiali.

Il riuso deve dichiarare ciò che conserva: modello, versione, parametri, istante e vista supportata. Per ogni formato aggiuntivo effettivamente introdotto — figura, stampa, esportazione o incorporamento — verificare che restituisca proprio il caso scelto, con etichette, unità e riferimento alla risorsa, e che non includa note personali o dati degli studenti. Non presentare un collegamento a uno strumento ai valori iniziali come riuso del caso preparato.

Le raccolte sono ordinate, modificabili e condivise con una scelta esplicita. Il link mostra i contenuti previsti, applica gli accessi del visitatore e rispetta la revoca. La UI distingue collegamento alla raccolta e copia autonoma di parametri pubblici. Un cambiamento non salvato non deve essere presentato come già presente nel link condiviso.

**Prova richiesta.** Un docente di prova prepara un confronto, lo inserisce in materiali esterni e lo riapre da un contesto separato. Controllare stesso stato, assenza di note private, comportamento senza account dove consentito, revoca, cambiamento di sessione e risorsa non più accessibile.

## 5. Continuità fra caso, spiegazione e apprendimento

**Accettazione didattica.** Ogni caso scelto per un microcorso ha un obiettivo comprensibile, una domanda di osservazione e un collegamento al passaggio pertinente della spiegazione. Lo studente sa quali grandezze cambiare, quali tenere fisse e quale conclusione cercare. Il collegamento apre il contenuto adatto al fenomeno e al livello del caso, non soltanto la prima lezione del corso.

Durante il passaggio dal caso alla lezione, all’esempio e alla pratica, il riferimento originario deve restare ritrovabile senza ricostruire manualmente i parametri. Il percorso offre un ritorno sensato al caso o alla raccolta. La ripresa dopo ricarica o su un altro dispositivo conserva gli stati per i quali è dichiarata persistenza e segnala quelli soltanto locali.

Il recupero collega la difficoltà osservata a una spiegazione, a un prerequisito o a una rappresentazione pertinente. Una successiva prova autonoma deve evitare soluzioni già mostrate e varianti spacciate per trasferimento. L’esplorazione resta distinta dalla valutazione; eventuali riferimenti fra caso e tentativo usano il quaderno esistente, con attribuzione corretta di utente ed edizione.

**Prova richiesta.** Completare prima un percorso reale di Fluidi con caso preparato dal docente, spiegazione, pratica, errore, recupero e ripresa. Ripetere il medesimo contratto su una rappresentazione di Analisi, usando materiali disponibili e autorizzati. Verificare i collegamenti con un revisore dei contenuti e i comportamenti con test del consumer; nessuna delle due prove sostituisce l’altra.

## 6. Qualità degli oggetti e dei modelli interattivi

**Accettazione tecnica e scientifica.** Ogni strumento dichiara dominio, ipotesi, unità, grandezze controllabili e limiti del modello. Gli stati fuori dominio producono una spiegazione utile; valori non validi e versioni incompatibili non sono corretti silenziosamente. Parametri visualizzati, valori del solver e stato riaperto coincidono, comprese le griglie ammesse dai controlli.

Le rappresentazioni 2D, 3D, numeriche e testuali descrivono lo stesso stato fisico o matematico. Cambiare vista non cambia il problema. Scale, vettori, segni, zeri, grafici, sonde e arrotondamenti restano interpretabili; un effetto visivo non deve suggerire una proprietà assente dal modello. Camera, movimento e riproduzione sono controllabili, con alternativa utilizzabile quando 3D o animazione non sono disponibili.

**Prova richiesta.** Usare casi di riferimento con risultati indipendenti, invarianti, valori limite, cambi di unità, degenerazioni e casi fuori dominio. Confrontare anche ciò che il browser mostra con ciò che il modello calcola. Verificare tastiera, touch, riduzione del movimento e recupero dopo perdita del contesto grafico dove pertinente. Misurare il carico sul consumer reale prima di fissare un budget prestazionale; non usare la velocità di un solo solver come prova della fluidità dell’interfaccia.

## 7. Adattività dimostrabile e risultati sulle persone

**Accettazione del software adattivo.** La decisione deriva da una storia leggibile di eventi, da una policy identificabile e da contenuti eleggibili. Deve cambiare in modo riproducibile quando cambiano risposte, aiuti, tempo, prerequisiti, programma o accessi. Deve motivare il prossimo passo e rendere evidente quando le informazioni sono insufficienti.

Le controprove obbligatorie comprendono assenza di storia, sola lettura, indizio, errore ripetuto, successo assistito, ripetizione dello stesso quesito, variante della medesima famiglia, famiglia nuova, richiamo ritardato, pool esaurito, cambio edizione, replay e concorrenza. Uno scenario non può ottenere evidenza autonoma aggiungendo letture, ripetendo un invio o modificando soltanto l’etichetta del quesito. Il supporto di accessibilità non è un aiuto sul contenuto, salvo che mostri effettivamente una soluzione.

La classificazione delle famiglie e i recuperi richiedono revisione editoriale: un metadato corretto sintatticamente non garantisce una differenza didattica. Le differenze fra policy di Fisica e altre discipline devono avere nomi e spiegazioni coerenti, senza sommare misure incompatibili sotto la stessa etichetta.

**Accettazione empirica separata.** Osservare docenti e studenti su compiti definiti, registrare problemi e verificare comprensione su esercizi nuovi e richiamo successivo. Definire prima che cosa si misura e come interpretare gli esiti. Un collaudo dell’interfaccia, una dimostrazione svolta da un agente o un piccolo pilot descrittivo non autorizzano una dichiarazione causale di efficacia generale.

## 8. Accessibilità configurabile senza diagnosi

**Accettazione.** Applicare WCAG 2.2 AA ai percorsi effettivi e tradurre UDL e COGA in supporti per orientamento, attenzione, lettura, memoria di lavoro e comprensione matematica. I supporti si scelgono per preferenza o necessità del momento, senza richiedere diagnosi, categorie personali o profili clinici.

Verificare ordine del focus, nomi dei controlli, stato e messaggi, operabilità da tastiera, contrasto, zoom, reflow, riduzione delle animazioni e recupero dopo errore. Formule, grafici e oggetti devono avere una rappresentazione alternativa utile per svolgere il compito. Le preferenze devono essere reversibili e non cancellare la posizione di studio; dichiarare quali sono persistenti e su quale ambito.

**Prova richiesta.** Eseguire audit automatico e verifica manuale su mobile, schermo stretto, zoom e tecnologia assistiva identificata. Provare ricerca, lettura, manipolazione, risposta, correzione e riapertura. Conservare le limitazioni per percorso e tecnologia. Un audit automatico senza violazioni non certifica da solo la conformità complessiva o l’usabilità cognitiva.

## 9. Programmi universitari configurabili

**Accettazione.** Un programma è una configurazione tracciabile con fonte, anno e copertura dichiarata. Collega argomenti, competenze, prerequisiti e materiali identificabili. Importare un programma nuovo valida riferimenti, duplicati e cicli; non richiede duplicare il player, il corpus comune o il quaderno.

Il programma scelto influenza catalogo e decisione di studio con la stessa semantica. Un prerequisito esterno può essere proposto con motivazione. Argomenti mancanti, approfondimenti non coperti e materiali riservati sono espliciti. La futura preferenza persistente deve essere visibile, modificabile e coerente fra dispositivi, preservando la possibilità di esplorare altri argomenti.

**Prova richiesta.** Usare configurazioni con coperture differenti e verificare inclusioni, esclusioni e prerequisiti sulla stessa storia di apprendimento. L’allineamento a Polito è un punto di partenza verificabile; l’estensione ad altri atenei richiede mapping controllati, non una generica dichiarazione di universalità.

## 10. Interoperabilità e indipendenza dal provider

**Accettazione.** Studio, strumenti e quaderno funzionano senza un provider AI. Codice, contratti, comandi di avvio, fixture e prove permettono a un altro agente di riprendere il lavoro dal repository. Le integrazioni opzionali usano identità e permessi esistenti; l’esportazione del contesto distingue risorse pubbliche ed evidenze personali selezionate dall’utente.

Consolidare i consumer già presenti prima di ampliare gli adattatori. MCP resta limitato ai tool autorizzati e al perimetro di lettura dichiarato. QTI deve conservare identità, alternative, chiavi, valutazione e feedback per le forme effettivamente supportate. Per MathML verificare significato, lettura e compatibilità della rappresentazione. Per LTI definire prima il consumer concreto, il flusso d’accesso e le capacità necessarie, evitando una seconda autorità per account o valutazione.

**Prova richiesta.** Eseguire un vero consumo del contratto, con permessi negativi, campi non supportati ed errori espliciti. Importare un export in una piattaforma destinataria identificata quando se ne dichiara la compatibilità. Uno schema valido, un file generato o uno stub non costituiscono da soli un’integrazione funzionante.

## 11. Conservazione dei dati e condizioni di rilascio

**Accettazione.** Nuovi flussi e aggiornamenti conservano tentativi, letture, ricevute, edizioni, ordini e accessi esistenti. Gli indici e le tabelle aggiuntive si installano in modo ripetibile. Retry, interruzioni, cambio account e aggiornamenti concorrenti non duplicano evidenze o attribuiscono dati a un altro utente. L’utente ritrova anche gli elementi oltre il limite della prima pagina; fino alla paginazione il limite deve essere dichiarato.

Le prove confrontano base e candidata su copie isolate di database e sull’artefatto riaperto dopo installazione. Un rollback del codice non elimina le nuove tabelle per simulare compatibilità. I file firmati e i checkpoint della revisione parallela non si sovrascrivono; un nuovo consumer composto richiede le proprie prove anche quando i sorgenti scientifici restano identici.

La consegna deve indicare SHA, dipendenze, comandi, risultati, fallimenti, limiti e prossimo passo. Una prova fallita o non eseguita resta tale. CI sulla head e sul merge tree, collaudo browser, packaging e revisione scientifica hanno ambiti distinti. Merge, preview e pubblicazione dei materiali sono decisioni separate; l’esposizione del corpus nell’app conserva il gate umano.

## 12. Priorità operative e dipendenze

| Priorità | Incremento concreto | Dipendenze | Condizione di uscita |
| --- | --- | --- | --- |
| **P0** | Rendere verificabile la candidata composta e correggere i blocchi del percorso già implementato. | Head e writer riconciliati; ambiente browser; prove e fixture disponibili. | Percorsi risorse e studio eseguiti sulla candidata precisa, negativi conservati, regressioni risolte o bloccanti espliciti. |
| **P1** | Completare il percorso Fluidi: caso preparato, uso esterno, lezione pertinente, pratica, recupero e ritorno. | P0; mapping editoriale e accessi validi. | Il docente riusa il caso e lo studente continua senza perdere il riferimento; la valutazione resta distinta dall’esplorazione. |
| **P1** | Provare il riuso dello stesso contratto su un secondo strumento e su Analisi. | Caso Fluidi stabile; modello e materiali autorizzati. | Riapertura, versioni, permessi e continuità superano gli stessi scenari senza duplicare player o autorità dati. |
| **P1** | Osservare la comprensione dei flussi con persone e correggere i blocchi. | Percorso completo utilizzabile; compiti e dati di prova definiti. | Problemi riproducibili registrati e correzioni verificate; nessuna inferenza impropria sull’efficacia. |
| **P2** | Completare studio quotidiano e preferenze persistenti di programma e obiettivo. | Semantica della policy e autorità delle preferenze definite nel sistema esistente. | Ripresa coerente fra dispositivi, proposta motivata, override esplicito e comportamento onesto quando mancano prove o materiali. |
| **P2** | Migliorare raggiungibilità di raccolte ampie e gestione di casi obsoleti. | Contratti di lettura e versionamento stabili. | Elementi vecchi raggiungibili, stati incompatibili spiegati, prestazioni misurate su carichi dichiarati. |
| **P3** | Completare gli adattatori necessari a consumer esterni reali. | Formati, diritti, accessi e piattaforma destinataria identificati. | Uso effettivo verificato, limiti documentati e flusso principale ancora autonomo dai provider. |

Prima di ogni incremento scegliere un percorso utente, il difetto o limite concreto che risolve, i moduli di proprietà e la prova di accettazione. Chiudere quel percorso nel prodotto prima di aumentare il numero di contenuti o integrazioni. Il successore conserva libertà implementativa dentro questi criteri e aggiorna gli stati con le prove della candidata effettiva.
