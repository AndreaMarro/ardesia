# Basic Memory — canary locale, cutover e rollback

- **Stato**: PROPOSED / NO CUTOVER
- **Data**: 2026-07-17; baseline aggiornata 2026-07-18
- **Owner delle approvazioni**: Andrea
- **ADR**: `docs/adr/ADR-0003-markdown-git-basic-memory-plane.md`

Questo runbook descrive operazioni future. La sua presenza nel repository non autorizza alcun comando,
installazione, servizio, tunnel, modifica client, migrazione, unload o cancellazione.

## 1. Invarianti

1. Evidenza prodotto/test/Git legata allo SHA resta l'autorità tecnica più alta.
2. Markdown/Git/Obsidian è la fonte umana canonica; Basic Memory è soltanto un indice derivato.
3. L'indice non scrive, sposta, cancella, riformatta o aggiunge frontmatter nel vault canonico.
4. Il database, gli embedding e i log Basic Memory restano fuori dal vault.
5. Il listener, se approvato, ascolta solo su `127.0.0.1:8000/mcp`.
6. Il MacBook accede al listener solo tramite tunnel SSH approvato.
7. In caso di guasto si usa filesystem/`rg`; AgentMemory non è il fallback ordinario.
8. Ogni fase è additiva, hashata e reversibile; nessun rollback cancella dati.
9. Prompt B e loop overnight restano OFF per l'intera procedura.
10. I gate di questa procedura sono separati: una singola approvazione non abilita la fase successiva.

## 2. Baseline verificata, non autorizzativa

Fatti verificati il 17/07 e aggiornati il 18/07:

- MacBook: `/Users/andreamarro/ARDESIA-KNOWLEDGE`;
- Mac Mini: `/Users/progettibelli/ARDESIA-KNOWLEDGE`;
- head iniziale comune: `03d80a0d4c9372438a4c8563db139d079a4e11a4`;
- ultimo head comune pulito: `25f6c2ea5cba477999859e5df9853d37822cb9b4`;
- stato Basic Memory isolato: `/Users/progettibelli/.basic-memory-ardesia`;
- versioni: `uv 0.11.9`, `basic-memory==0.22.1`;
- canary iniziale: 5 entità, 103 embedding, tre query italiane corrette top-1, hash vault identico
  prima/dopo, initialize MCP HTTP 200, loopback-only, restart offline e nessun outbound osservato;
- stato intermedio dopo receipt: 6 entità, 131 embedding, `reindex_recommended=false`;
- reindex offline iniziale: 8/8 entità, zero errori e zero skip; ricerca Founder Beta corretta top-1;
- ultimo reindex offline: 9/9 entità, zero errori e zero skip; ricerca receipt FB-3A corretta top-1;
- listener fermato; nessun LaunchAgent, tunnel o client Basic Memory configurato;
- `bm doctor --local` ha avuto un bug di cleanup dopo i propri probe interni su stato derivato isolato. Il
  database interessato è stato spostato, non cancellato; non usare `doctor` né i suoi writer come gate;
- AgentMemory è escluso dai workflow attivi e dal fallback; il servizio storico non è stato disabilitato
  o cancellato e il cutover non è stato dichiarato completato. Prima di un futuro cutover inventariare
  e ri-hashare processi e file live perché gli snapshot di repository e runtime divergono.
- receipt canonico: `30-Evidence-Receipts/2026-07-18-FOUNDER-BETA-FB3A-REVIEWED.md` nel vault Obsidian.

Questa baseline prova soltanto il canary già svolto. Ogni esecuzione futura deve riconfermare i fatti e
registrare timestamp, comando, output sanitizzato, exit code e SHA.

## 3. Registro delle approvazioni

| Gate | Approvazione esplicita richiesta | Non autorizza |
|---|---|---|
| A0 — Segreti | redazione del valore nel file al path segnalato e rotazione/revoca | leggere o stampare il valore; migrare il corpus |
| A1a — Vault/remote | permessi del vault, repository remoto privato e operazioni Git remote | mutare contenuti, installare Basic Memory o avviare servizi |
| A1b — Contenuto canonico | aggiungere/modificare note per un manifest e batch esatti, inclusi conflitti | cambiare permessi/remote, indicizzare o avviare servizi |
| A2 — Installazione | download/install/update di `uv`, Basic Memory, FastEmbed o modelli | configurare indice, log o listener |
| A3 — Stato locale | creare/modificare config, SQLite, embedding, indice e log | listener o tunnel |
| A4 — Listener | avviare temporaneamente MCP loopback | tunnel, LaunchAgent o esposizione LAN |
| A5 — Tunnel | aprire il tunnel SSH dal MacBook | configurare client persistenti |
| A6 — Client | cambiare un singolo client e la sua allowlist | driver, scheduler o altri client |
| A7 — Driver/scheduler | modificare driver, wrapper, LaunchAgent o scheduler | unload AgentMemory |
| A8a — AgentMemory quiesce/snapshot | freeze e snapshot di servizio/path esatti, con durata e rollback | unload, disinstallazione o cancellazione |
| A8b — AgentMemory unload | scaricare/disabilitare il servizio esatto senza cancellare | disinstallare o eliminare dati |
| A9 — Cancellazione | eliminare uno specifico artefatto già inventariato e hashato | cancellazioni più ampie o implicite |

Ogni gate registra approvatore, data/ora, target esatto, durata, rollback e receipt. Se il target cambia,
l'approvazione decade. A1a, A1b, A8a e A8b sono indipendenti; A9 non può essere implicita in A8a/A8b e non è
necessaria per completare il cutover.

## 4. Fase 0 — preflight read-only

Senza modificare servizi o file live:

1. fissare SHA, branch, worktree, `git status` e lista dei writer concorrenti;
2. verificare che Prompt B e loop overnight siano OFF;
3. inventariare path e hash dei file runtime/config senza stampare contenuti sensibili;
4. misurare lo stato AgentMemory con probe bounded e read-only; non usare PID o porte di receipt storici;
5. verificare spazio disco e stimare quota per database, embedding e log;
6. creare il receipt di preflight con comando, output sanitizzato ed exit code.

STOP soltanto per writer attivo sugli stessi path, base ambigua, segreti/PII, azione distruttiva non
autorizzata o regressione degli invarianti. Tool assente, cache guasta o lock stale è REPAIR. Servizio
esterno indisponibile è DEFER e non blocca il percorso filesystem.

## 5. Fase 1 — inventario, segreti e vault pulito

### 5.1 Secret gate A0

La scansione ha segnalato esclusivamente il path
`/Users/andreamarro/VOLUME 3/ardesia-vault-local/90-Archive/Legacy-2026-06/PROMPT-NEXT-v10.md:110`.
Non aprire, copiare o registrare il valore. Lo scanner
deve produrre soltanto path e conteggi, mai il contenuto della corrispondenza.

Prima di migrare il corpus storico, ottenere A0 per:

1. redigere il valore nel file al path segnalato, in una copia di lavoro isolata;
2. ruotarlo/revocarlo nel sistema di origine;
3. eseguire una nuova scansione sanitizzata;
4. registrare soltanto esito, path, conteggio e hash, senza valore.

### 5.2 Manifest e conflitti

Per ogni sorgente generare un manifest append-only con path relativo, SHA-256, dimensione e frontmatter.
Non modificare la sorgente durante l'inventario. Calcolare un digest aggregato prima e dopo ogni fase.

- sorgente curata MacBook: `/Users/andreamarro/VOLUME 3/ardesia-vault-local` — 105 note Markdown;
- replica legacy Mini: `/Users/progettibelli/ELABTUTOR/ardesia-vault-local`;
- `/Users/andreamarro/ARDESIA-VAULT`: sporco, mai promuovere o indicizzare wholesale.

Le note canoniche richiedono almeno `id`, `type`, `status`, `freshness`, `source_sha`, `created_at`, tag e
`[[wikilink]]`. I conflitti vengono **copiati** in `_conflicts/<data>/`; non sovrascrivere e non
cancellare nessuna variante.

Le operazioni sul remote privato e sui permessi del vault richiedono A1a. Ogni aggiunta o modifica al
corpus canonico richiede A1b per manifest e batch esatti. La verifica locale non autorizza push,
condivisione o mutazione dei contenuti.

### 5.3 Single writer e sincronizzazione

Per il canary corrente la branch verificata è `canary/basic-memory-20260717`. Il MacBook è l'unico
writer; il Mini è un mirror fast-forward-only. Un writer lease registra host, branch, base SHA, scadenza e
rilascio nel receipt. Il passaggio di writer richiede lease precedente rilasciato e nuovo gate A1b.

Ogni sync verifica base comune, bundle/fetch hashato, fast-forward senza merge implicito/force e head
finale identica. Una divergenza o due writer è STOP: conservare entrambe le varianti in
`_conflicts/<data>/` sotto A1b e riconciliare prima di indicizzare. Il clone di sync Mini non è il path
indicizzato: da uno SHA pulito si produce uno snapshot/worktree dedicato, manifestato e read-only.

## 6. Fase 2 — installazione e configurazione isolate

### 6.1 Installazione, gate A2

La versione già verificata è `basic-memory==0.22.1` con `uv 0.11.9`. Qualsiasi installazione,
reinstallazione, download di modello o aggiornamento richiede A2. Pin esatto, auto-update disattivato e
hash/provenienza degli artefatti devono comparire nel receipt. Non aggiornare automaticamente.

### 6.2 Configurazione, gate A3

Usare esclusivamente lo stato isolato `/Users/progettibelli/.basic-memory-ardesia`. Prima di eseguire
comandi, la CLI pinned deve confermare tramite help/schema i campi supportati. La configurazione ammessa
è:

| Area | Valore obbligatorio |
|---|---|
| progetto | locale, nome `ardesia`, path dello snapshot Mini pulito e read-only |
| database | SQLite locale fuori dal vault |
| embedding | FastEmbed locale, modello `bge-small-en-v1.5`, batch `2` |
| aggiornamenti/promozioni | `auto_update=false`, `cloud_promo_opt_out=true` |
| telemetria | `logfire_enabled=false`, `logfire_send_to_logfire=false` |
| sync/frontmatter | `ensure_frontmatter_on_sync=false` |
| permalink | `disable_permalinks=true`, `update_permalinks_on_move=false` |
| scrittura/formattazione | `write_note_overwrite_default=false`, `format_on_save=false` |

Non inventare o usare `BASIC_MEMORY_FORCE_LOCAL` o `BASIC_MEMORY_NO_PROMOS`: non sono campi supportati.
Con A1a creare lo snapshot Mini dedicato e applicare owner/mode/ACL read-only registrati; il database e i
log restano su path separati scrivibili coperti da A3. Configurare una allowlist default-deny che consenta
soltanto read/search/context/status ed escluda tutti i tool write/move/delete.

A3 autorizza soltanto config, SQLite, indice, embedding e log locali con quota definita. Non autorizza
listener, tunnel o modifiche al vault canonico.

## 7. Fase 3 — canary di cinque note

Prima delle 105 note indicizzare soltanto:

1. indice canonico;
2. Founder Beta;
3. decisione corrente;
4. receipt 1;
5. receipt 2.

Procedura:

1. fissare head Git e manifest SHA-256 del sottoinsieme;
2. con A1b, fare l'eventuale test di scrittura **attraverso Markdown/Obsidian** su un batch esatto o una
   copia disposable, mai tramite Basic Memory;
3. fissare un nuovo hash immediatamente prima delle operazioni Basic Memory;
4. con A3, eseguire i probe `status` e `reindex` esposti dalla CLI pinned, indicizzare offline e
   verificare esattamente 5/5 entità, zero errori e zero skip;
5. leggere le cinque note ed eseguire il probe `search` con tre query italiane e aspettativa top-1
   preregistrata;
6. acquisire `tools/list`/superficie CLI e provare su una copia disposable che write/move/delete siano
   assenti o falliscano senza mutare il corpus; se un writer riesce, STOP e nessun listener/client;
7. verificare che Git status e hash dei Markdown siano byte-identici prima/dopo le operazioni Basic
   Memory: sono ammessi cambiamenti soltanto nel database/indice derivato;
8. spostare in quarantena hashata e ricostruire **solo l'indice derivato** se il target esatto e il
   rollback sono coperti da A3; non cancellare indice o note senza A9;
9. ripetere ricerca e conteggi dopo la ricostruzione.

Il roundtrip write/read/search significa quindi: writer autorevole Markdown/Obsidian, poi Basic Memory
read/search. Un tool Basic Memory di scrittura non fa parte del canary.

La sintassi esatta di `status`, `reindex` e `search` deve provenire da `bm --help` della versione
`0.22.1`; il receipt registra help/versione e comando effettivo. Se la superficie non coincide, STOP e
aggiornare il runbook con una PR: non inventare comandi compatibili per tentativi.

## 8. Fase 4 — listener temporaneo e CoV runtime

Solo dopo A4, verificare prima con `bm mcp --help` che la CLI pinned esponga la superficie prevista. Se
flag o semantica differiscono, STOP: non improvvisare alias o variabili.

Esempio vincolato al loopback:

```sh
BASIC_MEMORY_CONFIG_DIR=/Users/progettibelli/.basic-memory-ardesia \
FASTMCP_CHECK_FOR_UPDATES=off \
FASTMCP_SHOW_SERVER_BANNER=false \
HF_HUB_OFFLINE=1 \
TRANSFORMERS_OFFLINE=1 \
/Users/progettibelli/.local/bin/bm mcp \
  --transport streamable-http \
  --host 127.0.0.1 \
  --port 8000 \
  --path /mcp \
  --project ardesia
```

`auto_update=false` resta nella configurazione; non sostituirlo con variabili inventate. Non creare un
LaunchAgent in questa fase.

CoV obbligatoria:

1. initialize MCP HTTP 200 e read/search soltanto;
2. `tools/list` conforme all'allowlist; prova negativa write/move/delete su snapshot disposable senza
   mutazioni; se la CLI non può applicare il confine fail-closed, nessun listener/client viene approvato;
3. socket in ascolto esclusivamente su `127.0.0.1:8000`, mai `0.0.0.0`, `::` o interfacce LAN;
4. nessun socket outbound osservato durante indicizzazione, ricerca e restart;
5. restart a freddo con `HF_HUB_OFFLINE=1` e `TRANSFORMERS_OFFLINE=1`;
6. stessa query, stesso documento top-1 e stessi conteggi dopo restart;
7. hash Markdown e Git status invariati;
8. PID, CPU, RSS, elapsed, dimensione DB/embedding/log e spazio disco registrati;
9. stop del listener a fine finestra e prova che la porta non ascolti più.

`bm doctor --local` non sostituisce questi controlli granulari a causa del bug di cleanup già osservato.

## 9. Fase 5 — tunnel MacBook

Solo dopo A5, e mentre il listener A4 è attivo, il solo tunnel ammesso è:

```sh
ssh -o ExitOnForwardFailure=yes -N -L 127.0.0.1:8000:127.0.0.1:8000 macmini
```

Verificare dal MacBook initialize/read/search, poi chiudere il tunnel e provare che non resti alcun
listener locale. A5 non autorizza configurazioni client persistenti, autossh, LaunchAgent o esposizione
Tailscale/LAN.

## 10. Fase 6 — migrazione controllata delle 105 note

Prerequisiti: A0 completato; A1a per i permessi/remote applicabili; A1b per manifest e batch esatti;
canary cinque-note verde secondo §14.1; hash invariati; A3 rinnovato per il nuovo target, con manifest,
snapshot sorgente, index path, modello, quota, log e rollback esatti. Ogni espansione del target rinnova A3.

1. lavorare da manifest, non da copia directory indiscriminata;
2. importare a batch piccoli con receipt e digest prima/dopo;
3. validare frontmatter e wikilink prima di promuovere una nota;
4. copiare ogni collisione in `_conflicts/<data>/`;
5. non sovrascrivere, rinominare distruttivamente o cancellare;
6. dopo ogni batch verificare Git diff, conteggi, query preregistrate e zero mutazioni Basic Memory ai
   Markdown;
7. se un batch fallisce, lasciare il vault precedente byte-identico e isolare il batch;
8. non indicizzare il vault sporco wholesale.

Il corpus storico entra solo dopo il secret gate. Un errore di embedding degrada a SQLite testuale o
filesystem/`rg`, non al cloud.

## 11. Fase 7 — client, driver e cutover

### 11.1 Client, gate A6

Cambiare un solo client alla volta. La configurazione deve:

- puntare a Markdown/Git/Obsidian come autorità;
- usare Basic Memory solo per read/search/context;
- applicare l'allowlist default-deny senza write/move/delete;
- degradare direttamente a filesystem/`rg`;
- non usare AgentMemory come fallback.

Dopo ogni client: test normale, listener assente, indice corrotto/assente, tunnel chiuso, restart e ricerca
filesystem. Revertire il singolo client se un gate fallisce.

### 11.2 Driver e scheduler, gate A7

Wrapper, hook, driver, LaunchAgent e scheduler non si modificano insieme ai client. Inventariare i file
live e confrontarne gli hash con il repository prima di una PR dedicata. Prompt B e loop overnight
restano OFF anche dopo A7, salvo futura autorizzazione esplicita distinta.

### 11.3 AgentMemory, gate A8a/A8b

Solo dopo accettazione completa:

1. verificare in sola lettura che tutti i client migrati superino il fallback filesystem e producano zero
   nuove scritture AgentMemory; non mutare il servizio;
2. ottenere A8a su servizio, path, durata, freeze, snapshot e rollback esatti;
3. congelare le scritture e creare snapshot/manifest hashato senza cancellare l'origine;
4. verificare zero writer e integrità dello snapshot;
5. ottenere A8b sul servizio esatto;
6. scaricare/disabilitare senza disinstallare e senza cancellare dati;
7. verificare cold restart macchina, assenza di dipendenze e accesso allo snapshot come sola sorgente di
   migrazione.

Nessuna cancellazione è necessaria. Qualunque eliminazione futura richiede A9 separato e target
inventariato; non usare glob, path ampi o variabili non risolte.

## 12. Rollback

| Guasto | Rollback sicuro |
|---|---|
| indice/embedding corrotto | isolare il DB derivato, ricostruire dal Git canonico; continuare con `rg` |
| listener non conforme | fermare il listener, verificare porta chiusa; continuare col filesystem |
| tunnel/client guasto | chiudere tunnel e ripristinare la config salvata del singolo client verso filesystem/`rg` |
| migrazione batch fallita | isolare il batch, conservare entrambe le varianti e ripartire dal digest precedente |
| cutover AgentMemory fallito | lasciare snapshot e servizio intatti; usare il piano file-first, non AgentMemory come fallback ordinario |
| Basic Memory indisponibile | accodare receipt, lavorare sui Markdown e riconciliare Obsidian prima della release |

Il rollback non cancella database, note, snapshot o log. Ogni artefatto dismesso viene spostato in
quarantena hashata solo con il gate applicabile. Riattivare AgentMemory come fallback ordinario non è un
rollback previsto da questa architettura.

## 13. Contratto di evidenza

Ogni fase produce un receipt append-only con:

- approvazione/gate e target;
- timestamp e host;
- base e candidate SHA;
- comando esatto, exit code e output sanitizzato;
- manifest e SHA-256 prima/dopo;
- conteggi note/entità/errori/skip;
- query attese e ranking ottenuto;
- hash del vault e `git status` prima/dopo;
- socket listener/outbound e risultato restart offline;
- CPU, RSS, disco e quota log;
- rischi, RED residuo, rollback provato e prossima fase.

Non inserire segreti, token, contenuti sensibili o embedding nel receipt. Se Basic Memory non è
disponibile, salvare il receipt nel filesystem e sincronizzarlo in Obsidian prima della release.

## 14. Criteri di accettazione

### 14.1 Canary cinque-note verde

Il canary che abilita la migrazione controllata è verde solo con:

- manifest e hash del sottoinsieme, esattamente 5/5 entità, zero errori/skip;
- fonte Markdown byte-identica prima/dopo tutte le operazioni Basic Memory;
- query preregistrate top-1, ricostruzione completa e restart offline riuscito;
- listener esclusivamente loopback e zero outbound osservato;
- `tools/list`, allowlist e prova negativa fail-closed senza write/move/delete sullo snapshot disposable;
- receipt canary sincronizzato e legato allo SHA.

### 14.2 Cutover accettabile

Il cutover richiede inoltre:

- migrazione delle 105 note riconciliata per manifest/batch con A1b e A3 correnti;
- manifest, frontmatter e conflitti verificati;
- fallback filesystem/`rg` provato per ogni client;
- single-writer, mirror fast-forward-only e snapshot indicizzato read-only verificati;
- receipt di client, driver, snapshot e rollback sincronizzati e legati allo SHA;
- nessun segreto, PII, deploy, cloud embedding, Prompt B o loop overnight.

Il cutover richiede ratifica ADR-0003, tutte le approvazioni applicabili e A8a/A8b specifici.
Finché questi gate non sono completati, lo stato resta **PROPOSED / NO CUTOVER**: AgentMemory resta fuori
dai workflow attivi e dal fallback, mentre il servizio storico non viene disabilitato né cancellato.
