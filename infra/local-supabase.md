# Supabase locale isolato — ARDESIA G0

Runtime di sviluppo sul Mac, preparato il 20 ottobre 2026. Non crea né riattiva progetti cloud, non cambia abbonamenti e non comporta nuove spese di servizio. Il codice applicativo deve ancora essere collegato e verificato separatamente: la disponibilità del runtime non chiude il gate G0.

## Versioni e provenienza

| Componente | Versione | Verifica |
| --- | --- | --- |
| Colima | 0.10.3 arm64 | SHA256 ufficiale `980ad8bf61a4ca370243f4cb41401a61276dcd2c2502bee7b9b86f9250169f34` |
| Lima | 2.2.1 arm64 | SHA256 ufficiale `9e9eacce88f37e185c346bad73aa6136f738d8cdf8c3bb23cd42b071824bc66e` |
| Docker client | 29.9.1 arm64 | Archivio HTTPS ufficiale; SHA256 osservato `7f2c1637313578046e7dd61153e4e4cd1188d83a1e4b71825ab914776c208460`; endpoint `.sha256` del distributore assente |
| Docker server nella VM | 29.5.2 | Distribuzione della VM Colima; interrogato attraverso il socket locale |
| Supabase CLI | 2.121.0 arm64 | SHA256 ufficiale e digest GitHub concordi: `a696418082800fea178d6efeadf66cbaa501f653657b525c95d570d7b2f47d67` |

Download e file di verifica sono in `work/container-runtime/downloads`, fuori Git. Origini: [Colima](https://github.com/abiosoft/colima/releases/tag/v0.10.3), [Lima](https://github.com/lima-vm/lima/releases/tag/v2.2.1), [Docker](https://download.docker.com/mac/static/stable/aarch64/docker-29.9.1.tgz), [Supabase CLI](https://github.com/supabase/cli/releases/tag/v2.121.0). Nessun bypass TLS.

Immagini scelte dalla CLI fissata: Postgres `17.11.0.004`, GoTrue `v2.197.0`, PostgREST `v16.4`, Storage API `v1.82.1`, Kong `2.8.1`. I digest effettivi vengono conservati nel runtime locale.

## Isolamento e decisione sul percorso dei socket

Binari, download, cache, configurazione Supabase, credenziali e dischi persistenti sono sotto `work/container-runtime` e `work/supabase-local`. Non è stato installato software con Homebrew e non è stato cambiato il contesto Docker globale. `DOCKER_CONFIG`, `SUPABASE_HOME` e la cache sono dedicati. La telemetria è disabilitata nell'ambiente e nel consenso del solo profilo locale.

**ADR locale:** i primi due avvii hanno trovato il limite macOS `UNIX_PATH_MAX=104`: il socket SSH nel percorso della chat richiedeva 148 caratteri. Lima 2.2.1 applica `EvalSymlinks` a `LIMA_HOME`, quindi un collegamento corto verso la cartella lunga non risolve il limite. Il solo stato di controllo usa pertanto `/tmp/ardesia-g0-501`, proprietario uid 501, permessi `0700`. La scelta è reversibile e non apre servizi cloud.

Il disco dati viene collegato a `work/container-runtime/lima/_disks`. Dopo il primo arresto pulito anche il disco di avvio viene spostato in `work/container-runtime/lima/root-disk`. `controlstate.py persist` salva la configurazione recuperabile sotto `controlstate-backup`, escludendo socket e PID. `controlstate.py prepare` ricrea soltanto i file mancanti e rifiuta un percorso temporaneo con proprietario o permessi diversi. Non elimina VM, dischi o volumi. La perdita di `/tmp` non equivale quindi alla perdita dei dischi dopo la persistenza; dopo uno spegnimento anomalo la coerenza dei dati richiede i normali controlli del database.

Nota di ripristino: Colima 0.10.3 rispetta `COLIMA_HOME` soltanto se la directory esiste già. Le sole cartelle vuote e il file del profilo generati dal primo tentativo sotto `~/.colima` sono stati trasferiti/rimossi senza lasciare configurazione globale. Il primo probe della CLI, prima dell'impostazione di `SUPABASE_HOME`, ha aggiornato i metadati preesistenti `~/.supabase/telemetry.json` e `cli-latest`; quei metadati preesistenti non sono stati cancellati. Tutti i successivi comandi usano il profilo isolato.

## Risorse e servizi

VM Apple Virtualization.Framework, arm64, 2 CPU, 4 GiB RAM; disco dati sparse 14 GiB e disco di avvio sparse 8 GiB. Viene montata soltanto `work/supabase-local`, in lettura/scrittura. Kubernetes, Studio, Realtime, Imgproxy, Postgres Meta, Edge Runtime, analytics, Vector, Supavisor e Mailpit sono esclusi.

Endpoint riservati:

- API, Auth, REST e Storage: `http://127.0.0.1:54331`.
- Postgres: `127.0.0.1:54332`; porta shadow riservata `54330`.
- Docker: socket Unix privato in `/tmp/ardesia-g0-501/colima/ardesia/docker.sock`.

Il daemon Docker nella VM usa `ip: 127.0.0.1` e `default-network-opts.bridge.com.docker.network.bridge.host_binding_ipv4=127.0.0.1`. Lo script crea inoltre la rete dedicata `ardesia_g0_loopback` con quell'opzione esplicita e ne verifica il valore prima di avviare Supabase con `--network-id`. `ip` da solo riguarda solo il bridge standard: il controllo del primo bootstrap ha rilevato un bind wildcard del database appena creato; il bootstrap è stato immediatamente fermato e corretto prima delle fixture o di dati applicativi. Le porte finali vengono controllate anche sul Mac. [Riferimento Docker](https://docs.docker.com/engine/network/drivers/bridge/#default-host-binding-address).

Le tabelle nuove richiedono grant espliciti (`api.auto_expose_new_tables = false`). Le prove di accesso usano sessioni `authenticated` e una chiave pubblicabile/anon. `docker exec psql` prepara la fixture e controlla direttamente `SET ROLE authenticated`; la chiave amministrativa locale è usata esclusivamente per eliminare il bucket di prova attraverso Storage API, perché Storage protegge la cancellazione diretta dei bucket via SQL. Non è usata per dimostrare l'accesso consentito o negato.

## Avvio, verifica e arresto

Eseguire dalla radice del repository `work/ardesia`:

```bash
bash ../container-runtime/start.sh
bash -c 'source ../container-runtime/env.sh; python3 ../container-runtime/verify.py'
bash ../container-runtime/status.sh
bash ../container-runtime/stop.sh
```

`start.sh` prepara lo stato privato, avvia la VM se necessario e avvia soltanto i cinque servizi di base. Le credenziali vengono salvate in `work/supabase-local/.env.local`, permessi `0600`; non vengono stampate. Anche i log di avvio sono privati. Non copiare quel file in Git o in output condivisi. `status.sh` mostra nomi, stato dei container, salute Auth e spazio disco senza chiavi.

`stop.sh` conserva i volumi Supabase, ferma Colima e persiste i metadati di recupero. Non usare `supabase stop --no-backup`, `colima delete`, `docker system prune --volumes` o `db reset` per un normale arresto. In caso di crash provare prima `start.sh`; se lo stato di controllo esiste ancora ma è incoerente, raccogliere i log e verificare i processi prima di qualsiasi intervento manuale. Gli script non cancellano automaticamente uno stato sospetto.

La configurazione generata dalla CLI è in `work/supabase-local/supabase/config.toml`. I comandi sono stati scoperti con `--help` della versione installata. Gli script locali sono necessari: una sola clonazione Git non contiene i binari o i dati del Mac.

## Verifica e limiti

Esito finale: **22 verifiche superate, zero fallite**, ripetute con successo dopo il recupero; Auth health HTTP 200; database, Auth, Storage e Kong healthy, REST in esecuzione e interrogato dalle prove. Docker e `lsof` sul Mac confermano esclusivamente `127.0.0.1:54331` e `127.0.0.1:54332`. `assert-loopback.py` applica il controllo anche a ogni avvio. Risultati strutturati: `work/container-runtime/verification.json`, `verification-summary.json` e `loopback.json`; nessuno contiene password, token o dati personali.

**Recupero verificato:** creato un valore sentinella in uno schema PostgreSQL privato con RLS; arrestati Supabase e VM; archiviata la cartella temporanea privata; ricostruita da `controlstate-backup`; riavviati VM e servizi. La sentinella è sopravvissuta ed è stata eliminata insieme allo schema di prova. La seconda esecuzione di tutte le 22 prove è passata. Evidenza in `work/container-runtime/recovery.json`. Gli script sono stati verificati con `bash -n` e compilazione sintattica Python. Il backup gestisce anche i metadati Lima in sola lettura, aggiornandoli senza toccare i dischi vivi.

Spazio reale finale rilevato: circa **5,5 GiB** in `work/container-runtime`, **28 KiB** in `work/supabase-local`, **19 MiB** nello stato temporaneo; **21 GiB disponibili** sul volume del Mac. Le dimensioni logiche sparse dei due dischi restano 14 + 8 GiB. Il primo avvio scarica ed estrae immagini grandi; i successivi riusano la cache. Non sono stati rimossi dati o volumi estranei per liberare spazio.

Il daemon ha emesso avvisi del verificatore di firme sui vecchi manifest Docker di Kong e PostgREST (`expected image index descriptor`); i download sono terminati con i digest del registro e i servizi hanno superato le verifiche. Non è stato applicato alcun bypass di TLS o delle verifiche di firma.

La prova crea due utenti temporanei, una tabella con RLS, policy per proprietario e un bucket privato. Controlla salute Auth, sessioni reali, lettura del proprietario, invisibilità ad altro utente/anon, rifiuto di un inserimento con proprietario falso, download privato, rifiuto di URL pubblico e accesso incrociato, URL firmato di 60 secondi e rimozione del file. Utenti, tabella, policy e bucket sono rimossi alla fine.

Postgres nativo sarebbe un'alternativa per query e RLS, ma da solo non fornisce Auth e Storage Supabase. PGlite è utile per test PostgreSQL embedded; non costituisce una verifica di questo stack. Non sono stati presentati come sostituti equivalenti.

Fonti consultate: [CLI locale](https://supabase.com/docs/guides/local-development/cli/getting-started), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [download privati](https://supabase.com/docs/guides/storage/serving/downloads), [cambiamento dei grant di default](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically). Il passaggio Envoy riguarda il compose self-hosted; questa CLI fissata usa ancora Kong, come confermato dal suo sorgente.
