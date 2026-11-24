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
