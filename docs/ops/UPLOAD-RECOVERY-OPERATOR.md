# Recupero degli upload sintetici interrotti — Closure1

Stato: implementazione locale da revisionare. Il worker nel repository è disabilitato. Questo documento non autorizza l'attivazione remota e non chiude D55.

Andrea è l'operatore responsabile del progetto sintetico dedicato `gavfmrynhsdxdqbmdkxq`, bucket privato `ardesia-originals`. Un intento interrotto deve essere riconciliato entro **24 ore dalla creazione**. Il recupero remoto attende la scadenza dell'intero lease di dieci minuti, anche per `cleanup_required`, per superare i timeout delle richieste al provider.

Gli originali confermati restano conservati per la verifica Closure1. Andrea deve registrare una decisione di conservazione o cancellazione alla chiusura della verifica, con riesame entro **30 ottobre 2026, 23:59 UTC**. Questo è un termine di riesame, non una cancellazione automatica. Qualunque cancellazione dei confermati richiede una procedura esplicita con gli ID e le prove da preservare. Il recupero qui descritto non cancella mai un originale confermato.

## Autorità da revisionare prima dell'attivazione

La proposta SQL è `supabase/functions/closure1-upload-recovery/operator-review.sql`: crea il ruolo `ardesia_upload_cleanup`, NOLOGIN, NOINHERIT, NOBYPASSRLS. Il ruolo può leggere soltanto ID/stato/tempi degli intent e ID dei metadati, riconciliare uno stato in `committed` quando i metadati esistono e cancellare un intento scaduto senza metadati. Non riceve contenuti, credenziali Auth, accesso diretto a Storage, inserimenti o scritture applicative. Solo `postgres` può assumerlo; nessun ruolo applicativo, anonimo o autenticato riceve appartenenza o privilegi nuovi. Le policy ordinarie e la verifica di `auth.sessions` restano invariate.

Il worker Edge usa le credenziali integrate del provider solo al proprio interno, imposta il ruolo ristretto in ogni transazione e accetta soltanto il progetto/bucket fissati nel codice. Il connettore di deploy non deve impostare un nuovo secret: il file `operator-config.ts` da fornire all'attivazione contiene soltanto SHA-256 della capacità operatore e scadenza assoluta. Il valore della capacità rimane esclusivamente nel file privato dell'operatore. Nessuna chiave service role o credenziale PostgreSQL viene esportata.

Il worker richiede una capacità casuale di 256 bit nell'header Authorization, scaduta al massimo entro un'ora. Non accetta capacità nel body/query/cookie, header Origin, URL, bucket o SQL scelti dal chiamante. I soli comandi sono elenco candidati limitato a 100 e riconciliazione di un ID canonico di 32 caratteri esadecimali. Ogni riconciliazione verifica nuovamente intento, lease e metadati nel database; conoscere un ID non autorizza una cancellazione.

## Preparazione locale, senza attivazione

Usare Python con le dipendenze del servizio. Scegliere una directory privata fuori dal repository, per esempio la directory `work/secrets` già usata dalla verifica, con permessi0700.

```sh
python bin/study-demo/prepare-upload-recovery-operator.py --private-dir /percorso/privato/work/secrets
```

Il comando crea due file0600 e stampa solo i percorsi e la scadenza. Il JSON operatore contiene la capacità e non va aperto in log, chat, shell history o connettori. Il file `-config.ts` contiene solo hash e scadenza: è l'unico file di configurazione da fornire al deploy, al posto del disabilitato `operator-config.ts`. La durata predefinita è45minuti; non riutilizzare una capacità scaduta.

Prima di attivare, revisionare insieme SQL, worker, hash/scadenza e piano di prova. Solo dopo approvazione applicare la proposta SQL come migrazione operativa e distribuire **solo** questa funzione, nome `closure1-upload-recovery`, entrypoint `index.ts`, dipendenza bloccata in `deno.lock`. Il gateway deve avere `verify_jwt=false` per questa sola funzione: la capacità operatore viene verificata dal worker e non è un JWT utente. Non riaprire `closure1-bootstrap`, non pubblicare una route nel backend applicativo e non modificare le policy DELETE/UPDATE dei browser.

## Ispezione e applicazione

Dopo l'attivazione approvata, usare il percorso JSON privato stampato dal preparatore:

```sh
python bin/study-demo/recover-supabase-uploads.py --operator-file /percorso/privato/upload-recovery-ID.json --limit 100
python bin/study-demo/recover-supabase-uploads.py --operator-file /percorso/privato/upload-recovery-ID.json --limit 100 --apply
```

L'ispezione legge soltanto i candidati scaduti; il numero è limitato alla pagina richiesta. L'applicazione riusa `recover_uploads` del Core e stampa soltanto `cleaned`, `failed`, `skipped`. Ripetere pagine limitate finché non restano candidati. Un fallimento restituisce exit1 e mantiene l'intento recuperabile; non cancellarlo a mano per sbloccare la chiave.

Il worker acquisisce lo stesso advisory lock `asset.upload` del Core prima di leggere l'intento. Il formato della chiave è identico a `json.dumps` Python, inclusi gli spazi. Se una transazione concorrente ha confermato i metadati, i metadati prevalgono e i byte restano. Altrimenti il worker elimina solo quell'oggetto, verifica l'assenza via HEAD e cancella l'intento nella stessa transazione bloccata. La FK esistente elimina la prenotazione della chiave idempotente, rendendo possibile un nuovo tentativo. Nessuna tabella o ledger aggiuntivo.

Non usare questo strumento per cancellare confermati, dati di altri progetti o contenuti reali. Non lanciare recuperi subito dopo aver ucciso una richiesta ancora in corso: attendere almeno la scadenza del lease persistito.

## Prova remota richiesta per D55

D55 resta aperto finché una prova effettiva sul progetto dedicato non documenta:

1. Un PNG sintetico arriva a Storage ma una failure controllata impedisce i metadati; intento e chiave restano persistiti, il retry della stessa chiave fallisce409.
2. La sessione che ha caricato viene revocata; l'app e un peer continuano a negare lettura/scrittura. L'operatore indipendente vede il candidato soltanto dopo il lease.
3. Il recupero elimina esclusivamente l'orfano, verifica byte assenti e rimuove intento/prenotazione. Ripetere il recupero è innocuo.
4. Un nuovo login autorizzato ripete la stessa richiesta/chiave: un solo nuovo originale e un solo receipt vengono confermati. Replay restituisce lo stesso receipt.
5. Un originale già confermato conserva byte, SHA e receipt invariati; un candidato selezionato prima di un commit concorrente viene preservato grazie allo stesso lock.

Conservare prova con SHA del codice/worker, ID esatti, tempi, conteggi e hash dei byte, senza capacità, token, password o contenuti riservati. Il worker non fornisce una prova remota finché non è stato attivato e usato sul provider reale.

## Fine intervento e ripristino

Andrea verifica conteggi, originali confermati e assenza dell'orfano; elimina i file privati della capacità quando non servono più. La scadenza rende inutilizzabile il worker. Per un nuovo intervento generare una capacità nuova e distribuire soltanto hash/scadenza dopo revisione.

Per ritirare l'autorità, prima distribuire il `operator-config.ts` disabilitato del repository o ritirare la funzione, poi eliminare esclusivamente le quattro policy `upload_cleanup_intent_read`, `upload_cleanup_metadata_read`, `upload_cleanup_reconcile`, `upload_cleanup_intent_delete`, revocare i grant del ruolo e rimuovere `ardesia_upload_cleanup`. Non eliminare intent, metadati o originali come parte del ritiro. Controllare che l'app mantenga isolamento e revoca.

## Test locali riproducibili

```sh
PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study/test_upload_recovery.py services/study-api/tests/test_upload_recovery_operator.py services/study-api/tests/test_asset_descriptor_http.py -q
deno test --config supabase/functions/closure1-upload-recovery/deno.json --lock supabase/functions/closure1-upload-recovery/deno.lock supabase/functions/closure1-upload-recovery/core_test.ts
python bin/study-demo/test-upload-recovery-postgres.py
```

L'ultimo comando usa PostgreSQL17 e Deno installati, crea un database TLS isolato su loopback con policy minime, verifica ACL/RLS, cascade e lock reali, poi arresta ed elimina il server temporaneo in `finally`. Non legge né modifica il progetto remoto. La prova RLS locale non sostituisce la prova Auth/Supabase remota richiesta sopra.

Riferimenti ufficiali consultati: [segreti integrati Edge](https://supabase.com/docs/guides/functions/secrets), [PostgreSQL da Edge](https://supabase.com/docs/guides/functions/connect-to-postgres), [Storage API e HEAD](https://supabase.github.io/storage/).
