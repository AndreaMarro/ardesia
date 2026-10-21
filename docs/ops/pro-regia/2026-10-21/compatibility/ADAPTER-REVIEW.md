# Review indipendente dell'adapter QUESTION_INBOX

File rivisto: `ardesia-review/bin/pro-regia/question_inbox_adapter.py`, modifica locale di proprietà Pro-Regia, non attribuita a uno SHA del worker.

## Esito

Il record completo viene preservato con `deepcopy`, inclusi campi futuri e spiegazione integrale; l'hash canonico protegge il contenuto al round trip e l'identità viene riverificata. L'envelope è privato, resta QUESTION_INBOX e non emette approvazioni scientifiche/editoriali, importazioni in database o pubblicazioni. Non ci sono route studente o scritture nel Core.

## Difetto riprodotto e corretto dal proprietario

La prima versione associava il valore di `git rev-parse HEAD` a bytes letti dal working tree senza verificare che appartenessero al commit. Una fixture Git sintetica dimostra che, dopo un commit, un manifest e uno shard modificati coerentemente ricevevano `PASS` e il vecchio `sourceCommit`, pur contenendo dati diversi dal blob committato. Evidenza RED dell'invariante: `intake-commit-pin-probe.json`. Il primo script diagnostico era un intermedio locale; il caso è ora incluso nel test portabile consegnato sotto.

Il proprietario ha aggiunto `verify_committed_bytes`, confrontando manifest e ogni shard con `git show <SHA-fissato>:<percorso>`. La revisione del fix conferma che il confronto usa i byte effettivamente letti e il medesimo SHA per tutti i file.

Il revisore ha eseguito un test indipendente sulla versione corretta: **1 test PASS**, 0,052 secondi. Quel file temporaneo non è incluso nella consegna. La stessa invariante è coperta nel file consegnato `bin/pro-regia/test_question_inbox_adapter.py`, metodo `test_intake_rejects_coherent_uncommitted_manifest_and_shard`: caso positivo committato, rifiuto della modifica coerente successiva e assenza di una ricevuta falsa. La suite consegnata conta **5 test PASS**. Non si dichiara un'esecuzione RED del test unitario finale: il RED è stato osservato nel probe diagnostico precedente.

Comando portabile dalla radice della checkout:

```bash
python -B -m unittest discover -s bin/pro-regia -p test_question_inbox_adapter.py -v
```

Nessuna modifica effettuata dall'agente revisore al codice dell'adapter o ai file dei worker. Nessuna full suite o rigenerazione del corpus.
