# Audit tecnico indipendente AI — pipeline attività — 24 novembre 2026

Revisore `/root/review_corpus_increment`, distinto dall'integratore autore delle modifiche. Lettura senza modificare file del coordinatore. **Nessun finding tecnico concreto individuato nell'ambito sotto; nessuna approvazione umana.**

Ambito letto: schema `activityBatches`, `load_registry`/`load_activity_registry`, `validate_activity_batch` in `batches.py`, `apply_activity_evidence` in `evidence.py`, orchestrazione e coda umana in `__main__.py`, struttura del verificatore `method_activity_verifier.py`. Esaminati anche alcuni originali, in particolare C1, C1-M-graph e C5-M-graph, per capire se i diagrammi fossero dati inline o allegati esterni. I diagrammi esaminati sono inline nel record, quindi coperti dal suo digest.

Snapshot SHA-256 dei moduli sotto `tools/corpus_engineering/`:

| File | SHA-256 |
|---|---|
| `batches.py` | `9fb3cbb20f6ccb2a30ce7cd80c921b6800e6820c8c12c5dd282925d19e7af6dd` |
| `evidence.py` | `9358805e86785d9af3501e51453c10e60ee40e15de3816662627c88a94141909` |
| `__main__.py` | `23a2972b04f493141f002e6a7694c052546abc05842614ba7cfddb1ebb794b32` |
| `method_activity_verifier.py` | `c49cf324d760e7df713aca4a2dcd59dab25d4534608fcf2798c3c947c1e09e8e` |

Controlli tecnici osservati:

- Ogni attività è ricostruita dalla sorgente fissata da commit e percorso; prima dell'attestazione vengono ricontrollati hash del file originale e digest del record.
- Il report è ricalcolato e confrontato integralmente con quello salvato, incluso il checksum del verificatore. Una lettura congelata non può essere riapplicata a un record modificato senza errore.
- Registro e validatore rifiutano identità mancanti, duplicate o incomplete; gli ID registrati devono essere effettive attività della sorgente, non quesiti trasferiti implicitamente in un altro conteggio.
- Le attività vengono caricate fresche: non ereditano approvazioni dalla cache aritmetica dei quesiti.
- I risultati devono dichiarare `humanApproval=NOT_RUN`, `publicationAction=NONE`, `originalEditionRetained=true`, uno scope ammesso e le evidenze individuali richieste.
- I sei wrapper sono esplicitamente `NO_STUDENT_CALCULATION`. La revisione del contenitore non si propaga ai materiali inclusi o collegati.
- La coda di approvazione umana è generata soltanto per i quesiti `REVISED_DRAFT`; costruire la coda non concede approvazioni o pubblicazioni.

Limiti: questo è **un audit del codice e dei confini dell'attestazione**. Non è una seconda revisione scientifica indipendente di tutte le 16 attività. Il revisore non ha letto e risolto individualmente ogni attività qui, né eseguito nuovi rendering, test con studenti o una pubblicazione. La lettura scientifica individuale dichiarata dal modulo resta quella svolta dall'integratore, distinto dall'autore degli originali. Non vengono certificati l'intero corpus, i contenuti figli dei wrapper o CI/merge successivi.

Stato: **TECHNICAL_AI_REVIEW / HUMAN_APPROVAL_NOT_RUN / NO_PUBLICATION_ACTION**.

## Estensione successiva: nuove edizioni nello stesso registro

Riletti `validate_activity_batch`, `assert_activity_identity`, `validate_browser_preview`, `apply_activity_evidence` e la generazione della coda attività dopo l'introduzione di `revisionPackage`. Questa sezione è un audit tecnico dei confini, non una seconda attestazione scientifica di tutte le attività.

| File riletto | SHA-256 dello snapshot |
|---|---|
| `batches.py` | `858d660d083a45d3ae05be0d7dcfba15703866faeb208751914ac8f3a67c82a9` |
| `evidence.py` | `0aa248bd07d39f5a9f3491b5cd7aaa744ad76478c2efd83a55312f027c26cd24` |
| `__main__.py` | `889a8b08e39ce11939744c38d2b6d9fd013cdb847c8acf4273b2162eab75ce2f` |
| `runtime_fingerprint.py` | `8303aae2cd94332e1c93f8e34b3329653c4490d30104c873bb41506469658be7` |

Confini verificati nel codice: insieme completo e unico degli ID; confronto del report ricalcolato; origine dei record da commit/percorso e hash; candidato e binding concordi; versione successiva e base controllate, poi importazione canonica fresca; prova browser vincolata ai byte del pacchetto e al runtime. Il confronto finale di `sourceRef` con il ledger avviene in `apply_activity_evidence`. Il giudizio storico separato è richiesto per DRAFT e il flag di fallimento deve corrispondere al suo booleano. Le nuove attività sono `REVISED_ACTIVITY_DRAFT`; i finding sulle edizioni pubblicate hanno campo e lista metadata espliciti. Nessuna scrittura su un'autorità di pubblicazione o assegnazione di approvazione umana.

La coda conserva `NOT_RUN`, distingue `DRAFT` da `NONE` e lega le bozze a candidato/prove. Le attività sono ricostruite fresche, quindi non ereditano giudizi dalla cache. Tutti i batch sono validati prima dell'aggiornamento in memoria e il checkpoint viene scritto dopo i gate: un errore non promuove un lotto parziale.

Eseguiti indipendentemente i cinque test di `test_activity_reviews.py`: PASS. Essi coprono source/candidate hash, versione, approvazione, azione, giudizio storico separato, proprietà dei record metodo e duplicati del registro. Questo esito non amplia l'ambito della mia lettura scientifica dei 16 record metodo.

**Finding P2 segnalato al root:** nello snapshot sopra `assert_activity_identity` accetta un record invariato con `publicationAction=NONE`, `ok=true` e `failedPublishedEdition=true`. Controprova eseguita in memoria con una fixture sorgente/risultato completa: nessuna eccezione. L'applicazione successiva produrrebbe `calculatorFreeReview=PASS_AI` e contemporaneamente `publishedEditionCalculatorFreeReview=FAIL` per la stessa edizione senza una bozza distinta. I report reali esaminati non contengono questa contraddizione. Il contratto deve rifiutarla: il fallimento storico è ammesso solo con una DRAFT e giudizio separato; un record invariato accettato deve avere flag assente o falso. Il revisore non ha modificato il coordinatore.

**Raccomandazione browser:** lo snapshot verifica overflow delle formule presenti ma non la loro completezza. Una lista `formulas=[]` supera quel filtro anche se il pacchetto contiene formule. Confrontati 480 casi browser già salvati con i blocchi dei pacchetti: nessuna omissione attuale. Una guardia sul numero di formule attese, usando le metriche già salvate, impedirebbe un futuro successo quando il renderer omette le formule; non richiede di ampliare questa attestazione a rendering non eseguiti dal revisore.

Il fingerprint esclude soltanto i contratti offline `corpus-*` attualmente non letti dal preview/importer; conserva server, CSS, renderer, contenuti, migrazioni, contratti del runtime, dipendenze d'audit e protocollo. Nessuna omissione concreta del runtime attuale individuata in tale esclusione. Non è un'autorizzazione ad escludere futuri contratti runtime con lo stesso prefisso.

## Chiusura dei due finding dopo la correzione del root

**Finding P2 sul giudizio invariato: RISOLTO.** Riletto il controllo: per `action=NONE` il flag `failedPublishedEdition` deve essere assente o letteralmente falso; un valore vero o un altro tipo viene rifiutato. La fixture negativa ora esercita questa contraddizione e passa attendendo l'errore. Le DRAFT mantengono il giudizio storico distinto e la coerenza del flag.

**Completezza della preview: RISOLTA nell'ambito segnalato.** `validate_browser_preview` conta le formule e figure dei blocchi e promptBlocks del pacchetto e rifiuta metriche insufficienti. Lo strumento browser verifica la stessa condizione durante l'esecuzione, decodifica le immagini e salva `figureCount`. Il test con una formula attesa ma `formulas=[]` ora viene rifiutato. Non si deduce più completezza dal solo fatto che non sia stato misurato overflow.

Riletti anche il supporto ai pacchetti di due record e il cleanup del browser di test: accessi a record campionati opzionali, distruzione della stdout del server creato dal test, unref e timeout di chiusura cancellato. Non è presente un `process.exit` forzato che trasformi un test fallito in successo. Questo è un esame del codice; le prove complete di uscita dei browser riportate dall'integratore non vengono presentate come eseguite da questo revisore.

Eseguiti nuovamente in modo indipendente **5 test attività + 9 test registro: 14/14 PASS**. Non è stato rieseguito dal revisore l'intero rendering di 774 casi, che al momento della chiusura di questo audit è lavoro separato dell'integratore. Nessun nuovo finding concreto emerso nella rilettura circoscritta. **I due finding tecnici sopra sono chiusi; nessuna approvazione umana o pubblicazione è concessa da questo esito.**
