# 3. Memoria, post-it e morfismi

## Nucleo da non perdere
La visione originale è lavagna che conserva il lavoro → grafo del modo di spiegare → materiali fondati sulle fonti e continuità. Nessun riaddestramento dei pesi è necessario per questa memoria. `eventlog.ts`, proiezioni e `grounded_memory.py` sono punti di partenza; non inferire da tipi e unit test una protezione remota non implementata.

Quattro letture della stessa memoria: fonti originali; episodi/azioni; metodo didattico del tutor; osservazioni del percorso individuale. Postgres/event store è la verità dei fatti didattici registrati; indici vettoriali, riepiloghi e grafo sono proiezioni rigenerabili. Dati commerciali mantengono le proprie tabelle transazionali: «una memoria» non significa mettere saldi e disponibilità soltanto in un grafo.

Una dichiarazione dell’AI è `PROPOSED`, un controllo simbolico è `CHECKED_IN_SCOPE`, una revisione umana è `REVIEWED_BY_ACTOR`. La verità matematica non segue dall’esistenza della citazione. La conferma manuale di una trascrizione non certifica il risultato. Le date, autore e versione della fonte vanno conservati separatamente.

## Resource e viste
`ResourceVersion` identifica bytes/struttura immutabili con owner, hash e riferimenti. `BoardView` contiene posizione, dimensione, z-order e istanze di visualizzazione. `Relation` esplicita `cites`, `derived_from`, `attempt_of`, `feedback_on`, `requires`, `corrects`.

Il modello post-it esistente è adattato, non copiato in un concorrente. Il post-it principale contiene l’attività; i figli mostrano note, passi, diagnostica o fonti. Spostare o ridimensionare cambia solo la vista. Due viste della stessa fonte puntano alla stessa versione. Duplicare un tentativo è invece un comando semantico, esplicitamente tracciato. Rimozione di un genitore: chiedere detach/archive dei figli o applicare policy documentata; mai cancellare implicitamente fonti consegnate.

## Memoria individuale e permessi
Il server filtra risorse accessibili PRIMA del retrieval. Query, top-k, cache e risultati delle embedding usano tenant, membership, scope e versione della policy. Il token passato dal browser non può scegliere un teacher_id altrui. Le risposte del gruppo non incorporano dettagli delle consegne individuali; il tutor può vedere un riepilogo autorizzato, non una classifica pubblica degli errori.

Una fonte modificata crea nuova versione: gli artefatti dipendenti diventano STALE, non vengono riscritti per sembrare sempre corretti. Cancellazione o revoca toglie accesso a indici/cache e job non ancora consegnati. Le citazioni diventano indisponibili esplicitamente. Le copie già esportate non sono revocabili tecnicamente: non prometterlo. Append-only log conserva metadati minimi/tombstone quando i contenuti personali devono essere rimossi; definire retention e base giuridica prima dei dati reali.

## Morfismo di presentazione
La parola recupera il significato storico nel repository: stessa attività, diversa presentazione per contesto. Definire una funzione testabile:
`present(activityVersion, authorizedContext, preferences, deviceCapabilities) -> ViewModel`.

Il contesto include ruolo, corso, fase della sessione, lingua, assistenza scelta e accessibilità. Può cambiare dimensione, densità, strumenti disponibili, quantità di spiegazione, modalità carta/sequenza/canvas. Non cambia risultati corretti, prerequisiti ufficiali, voto, proprietà o diritti. Disattivare animazioni non deve togliere informazioni; una LIM pubblica non mostra regia o nomi associati a errori privati. Nessuna categorizzazione «fragile» o disabilità inferita dal modello.

Personalizzazioni sono configurazioni versionate entro schema, con reset e preview; non CSS/JS arbitrario scaricato da utenti. Un insegnante può cambiare temi e rubriche del proprio corso senza fork. Fonte storica: SOURCES.morfismo, i vecchi vincoli ELAB non vengono trasferiti automaticamente.

## Morfismo di integrazione
Un adapter traduce un contratto del Core in una capacità esterna, dichiarando ciò che preserva e ciò che perde. Non è una pretesa formale di aver implementato tutta la teoria delle categorie.

`adapt(source, targetCapability, authContext) -> { artifact, preserved, losses, unsupported, sourceVersion, receipt }`.

Leggi verificabili:
- identità: serializzare e rileggere senza trasformazione conserva la proiezione semantica dichiarata;
- composizione: A→B→C è confrontabile con A→C solo sui campi dichiarati preservati da entrambi;
- restrizione: nessun adapter aumenta diritti o pubblico destinatario;
- dipendenza: una fonte nuova invalida tutti i derivati identificati;
- perdita esplicita: i campi non rappresentabili non diventano stringhe inventate.

Esempi: PDF conserva testo/figure/riferimenti, perde interazione e permessi granulari dopo download. Google Calendar rappresenta orari e link, non consegne o voti. MCP fornisce azioni/risorse autorizzate, non un mirror del database. LMS LTI offre un contesto di lancio da verificare, non un ruolo amministratore universale. QTI conserva un subset dei quesiti, non qualunque laboratorio.

Per G0: adapter web + bundle lezione + PDF/HTML e mock Calendar con loss report. Per G1: Google Calendar autorizzato e almeno un host MCP realmente provato; se non accessibile, stato BLOCKED, mentre l’app web può essere pronta con questo limite dichiarato.

## Addendum V4 — una sola memoria anche per il Diario
`learningDebtProjection.ts` è già derivabile dagli eventi `error.observed` e `exercise.completed` e può filtrare per `studentId`. La nuova funzione `DiaryProjection` deve riusarne semantica compatibile, collegando varianti, spiegazioni e revisioni; non affiancare una tabella autorevole di «errori» alimentata separatamente. L'AI può proporre una osservazione, non rendere automaticamente vero un errore e non dichiarare chiusa una lacuna sulla base di un numero corretto casuale. I post-it mostrano l'estratto sorgente e una correzione quale **vista autorizzata**, senza duplicare la fonte.

Per il morfismo, il Diario sul mobile è una sequenza di card con prossima azione; in aula il docente vede solo la propria selezione di riepilogo aggregato; nella regia una coda per correzione e validazione. I diritti e lo stato dell'errore non cambiano per la disposizione delle card. Vedi `specs/13`.
