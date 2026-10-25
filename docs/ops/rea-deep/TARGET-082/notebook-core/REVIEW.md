# Revisione indipendente — Core del quaderno scientifico

Data: 20 ottobre 2026. Checkout: `/tmp/ardesia-public-rea-20261020`, baseline `746c7fb`, diff non committato e modificato in parallelo dal builder. Revisione in sola lettura del prodotto; probe e questo report sono esterni al checkout. Gli AGENTS root/Engine richiedono review separata; il workflow corrente ammette Codex. Nessuna CLI LLM, servizio esterno, suite completa o test frontend eseguiti da questo reviewer.

## Esito dopo correzione: R1–R4 chiusi nei probe indipendenti

Rieseguiti **solo i due probe originali**, sul diff aggiornato dopo i fix del builder. Entrambi terminano con exit code 0. Nessuna suite aggiuntiva o operazione esterna.

| Caso | Prima del fix | Dopo il fix |
|---|---|---|
| R1: intero enorme in rect | HTTP 500 | HTTP 422 `invalid_notebook_state` |
| R2: MIME mancante | HTTP 500 | HTTP 422 `notebook_original_integrity_failure` |
| R3: originale diverso tra V1/V2 della stessa risorsa | `valid: true` | StudyError 422 `notebook_original_integrity_failure` |
| R4: surrogato in editionId | HTTP 500 | HTTP 422 `invalid_notebook_binding` |
| R4: surrogato in assetId | HTTP 500 | HTTP 422 `invalid_notebook_binding` |
| R4: surrogato in assetSha256 | HTTP 500 | HTTP 422 `invalid_notebook_binding` |
| R4: surrogato in expectedRevision | HTTP 500 | HTTP 422 `invalid_notebook_binding` |

Verifica in sola lettura dei fix:

- `scientific_notebook.py:43–50`: confronto nel dominio [0,1] prima delle somme, senza conversione int→float. Esclude anche NaN/infinito tramite il confronto, mantiene esclusione dei bool e rettangoli degeneri.
- `scientific_notebook.py:90–93`: accesso difensivo ai campi MIME/hash dell'asset già convalidato come dizionario, errore strutturato in caso di assenza o discordanza.
- `portable.py:228–251`: mappa unica resourceId→source su head e revisioni; verifica identità e uguaglianza dell'intera source; secondo passaggio rifiuta l'alternanza del kind per una risorsa quaderno. Il cambio kind è stato verificato per lettura del fix, non con un nuovo probe.
- `scientific_notebook.py:140–149`: stringhe non vuote, assenza NUL e UTF-8 valido per binding e CAS prima dell'hash del comando. Non introduce un formato UUID o limite ridotto per editionId legacy; questa compatibilità è verificata per lettura del codice, non con nuovi casi eseguiti.

I probe costruiscono nuovamente quaderno V1, consegna, V2 ed export come prerequisiti: il percorso positivo necessario alle riproduzioni continua a funzionare. Nessun ulteriore problema concreto individuato nel delta dei fix. Questo esito chiude i quattro finding della review; non estende la copertura a PostgreSQL live, stress budget, frontend o gate globali.

## Esito iniziale: quattro problemi P2 riprodotti

### R1 — Un intero JSON grande nelle coordinate produce HTTP 500

Riferimento iniziale: `packages/engine/lessonos/study/scientific_notebook.py:45–46`, `validate_state`.

`rect[0] = 10**1000` è un numero JSON legale e occupa circa 1 KiB, ampiamente sotto il budget HTTP. `math.isfinite()` converte l'intero in float e solleva `OverflowError` prima del controllo del dominio [0,1]. Il nuovo endpoint create restituisce `500 Internal Server Error` anziché un rifiuto 422. Il problema riguarda anche gli altri consumer di `validate_state`, compresa l'ispezione offline.

Riproduzione HTTP autentica su fixture sintetica: `notebook-implementation-probe.py`, risultato iniziale `notebook-implementation-probe-before-fix.json`, chiave `hugeIntegerCoordinate`. Atteso: errore di validazione e nessuna mutazione canonica.

### R2 — MIME mancante in un export fa fallire l'ispezione con HTTP 500

Riferimento iniziale: `scientific_notebook.py:91–94`, `inspect_snapshot`.

Partendo da un vero export appena generato, rimuovere `assets[0].mime` e ricalcolare il checksum esterno. Il loop generico degli asset convalida base64, dimensione e hash ma non richiede MIME; il nuovo `asset['mime']` solleva `KeyError`. `POST /study/notebook/inspect` restituisce 500. L'ispezione è un confine per file non fidati e deve rifiutare una forma incompleta con errore strutturato, senza assumere campi non ancora validati.

Riproduzione: stesso probe, chiave `missingAssetMime`. Non occorre alterare byte o hash originali; non è un bypass ACL.

### R3 — L'ispezione accetta un cambio di originale tra revisioni della stessa risorsa

Riferimento iniziale: `packages/engine/lessonos/study/portable.py:229–240`.

La verifica controlla ogni snapshot individualmente ma non confronta il suo `source` con gli altri snapshot aventi lo stesso resourceId. Il probe crea realmente V1, la consegna, salva V2, esporta e aggiunge un secondo upload dello stesso PDF (stessi byte, diversa identità canonica). Nel solo bundle viene cambiato l'assetId di V2 e vengono ricalcolati il checksum dello snapshot e quello esterno. Il bundle mantiene V1 e V2 della stessa risorsa, ciascuna valida isolatamente, ma con assetId differenti. `inspect_notebook` restituisce `valid: true`.

Questo contraddice l'invariante esplicito del nuovo modello «un originale immutabile per risorsa; nuovo PDF implica nuova risorsa». È una lacuna di consistenza interna dimostrabile, **non** una prova di autenticità server né un accesso indebito. L'export è correttamente dichiarato unsigned e il checksum è ricalcolabile. Servono una mappa resourceId→source comune a risorse correnti e revisioni storiche, e un controllo di coerenza.

Riproduzione: stesso probe, chiave `changedOriginalAcrossRevisions`; inizialmente `valid: true`, `sameResource: true`, assetId diversi. Atteso: errore di integrità del binding.

### R4 — Identità o expectedRevision con surrogato isolato fanno fallire l'hash del comando

Riferimento iniziale: `scientific_notebook.py:139–149,191`, chiamata a `transactions.execute_command`.

`save_notebook` verifica soltanto stringa non vuota per editionId, assetId e assetSha256, e non valida la forma di expectedRevision. Una stringa JSON con escape `\ud800` in ciascuno di questi campi giunge alla serializzazione/hashing del comando; `digest(canonical(payload))` tenta UTF-8 e genera `UnicodeEncodeError`. Il nuovo endpoint restituisce HTTP 500 in tutte e quattro le varianti. La validazione dello stato gestisce già correttamente questi surrogati.

Riproduzione HTTP: `notebook-binding-input-probe.py`, risultato iniziale `notebook-binding-input-probe-before-fix.json`. Richieste inviate come JSON ASCII esplicito per assicurare che l'errore provenga dal server, non dall'encoder del client. Atteso: errore 422 prima dell'hash, preservando la compatibilità delle editionId legacy valide; eventuali rigidità UUID/hash devono corrispondere al contratto già canonico.

## Verifiche di codice e limiti

- Binding esplicito per resource e snapshot per revision, senza associazione per indice o duplicazione dell'archivio originale. Il join in `read_snapshot` seleziona l'esatta revisionId richiesta.
- L'autorizzazione di lettura della risorsa precede l'esposizione dello snapshot. Scrittura riservata al proprietario; creazione privata; originale della stessa edizione e dello stesso proprietario, letto e verificato realmente. Il client non decide owner/visibilità.
- I generici create/revise rifiutano il kind riservato. Submit verifica l'originale obbligatorio e l'eventuale contextId fornito per i quaderni.
- `before_lookup` rinnova autorizzazione e verifica originale prima del receipt. Il controllo della risorsa dopo il receipt impedisce al replay create di riproporre uno snapshot dopo cancellazione. Il codice mantiene CAS e transazione condivisa per revisione, snapshot, evento e receipt.
- I test di prodotto letti coprono concorrenza SQLite (un solo vincitore), rollback alla registrazione del receipt, replay dopo revoca, V1 consegnata/V2 privata, export con pin storico, cancellazione, upgrade schema 5, backup/restore ed erasure cascade. Non vengono contati come test indipendentemente eseguiti in questa review.
- I probe indipendenti eseguono sul Core reale la creazione, submit V1, salvataggio V2 ed export prima degli input avversi. Il setup usa soltanto un PDF sintetico in memoria e database temporanei.
- Export aggiunge gli originali dei quaderni correnti e storici autorizzati, deduplica assetId e rifiuta l'omissione di un originale necessario quando eccede il budget. Esaminati budget decoded/encoded e verifica hash/pagine, senza stress test da 50/96 MiB in questa review.
- Migrazione SQLite 6 e preflight collisione kind legacy esaminati. Il builder aveva già individuato e corretto la collisione: non è contato come finding nuovo.
- PostgreSQL: esaminate migrazione 6, grant/revoke e RLS insieme ai helper precedenti. Il runtime passa a `ardesia_app` senza BYPASSRLS; le nuove tabelle concedono SELECT/INSERT e non UPDATE/DELETE a questo ruolo. Lettura snapshot vincolata alla revisione esatta. **Nessuna migrazione live o query RLS con identità reali è stata eseguita; il comportamento PostgreSQL resta da collaudare.**
- Nessuna affermazione sul frontend avanzato, su MathLive, sul rendering PDF.js, su G0/G1 o sul completamento SYS-01.

## Ripetizione dei probe

```sh
/tmp/ardesia-api-dispatch-20261020/services/study-api/.venv/bin/python /tmp/ardesia-notebook-review-20261020/notebook-implementation-probe.py
/tmp/ardesia-api-dispatch-20261020/services/study-api/.venv/bin/python /tmp/ardesia-notebook-review-20261020/notebook-binding-input-probe.py
```

I file `*-before-fix.json` preservano i risultati iniziali. I normali `.json` vengono aggiornati da ogni esecuzione e possono quindi documentare la verifica successiva del fix. La review non ha modificato file di prodotto.
