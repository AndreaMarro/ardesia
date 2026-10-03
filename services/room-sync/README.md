# Condivisione lavagna ARDESIA

Servizio Node.js 22, senza dipendenze aggiuntive. Due browser collegati allo stesso
servizio leggono e modificano la stessa lavagna. Le modifiche sono salvate su disco;
i cursori e i nomi di presenza scadono dopo 30 secondi e restano in memoria.

## Avvio

Dalla root del monorepo:

```sh
node services/room-sync/server.mjs
```

Indirizzo predefinito: `http://127.0.0.1:4318`. Dati privati:
`~/.local/share/ardesia/room-sync`, directory `0700`, file `0600`. Il servizio
rifiuta una directory dati interna a questo repository. Il processo non registra
token, richieste, testo della lavagna o nomi dei partecipanti nei log.

Configurazione locale temporanea:

```sh
ROOM_SYNC_DATA_DIR=/private/tmp/ardesia-room-sync node services/room-sync/server.mjs
```

Test con richieste HTTP reali su porte loopback temporanee:

```sh
node --test services/room-sync/store.test.mjs
```

Variabili facoltative:

| Variabile | Valore predefinito | Uso |
| --- | --- | --- |
| `ROOM_SYNC_HOST` | `127.0.0.1` | Interfaccia di ascolto |
| `ROOM_SYNC_PORT` | `4318` | Porta HTTP |
| `ROOM_SYNC_DATA_DIR` | directory privata indicata sopra | Persistenza |
| `ROOM_SYNC_ALLOWED_ORIGINS` | origini HTTP `localhost`, `127.0.0.1`, `[::1]`, qualunque porta | Lista esatta di origini separate da virgole; sostituisce i default |
| `ROOM_SYNC_ALLOWED_HOSTS` | hostname loopback e host di bind | Host aggiuntivi separati da virgole, senza schema o porta |

## Accesso e ruoli

Il token è una capability: chi possiede il collegamento può usarne i permessi.
Non sono account verificati. Ogni invito dovrebbe usare un grant distinto, così il
proprietario può revocarlo singolarmente. Il ruolo proviene esclusivamente dal
token verificato dal server. Un parametro `role=owner` non conferisce permessi.
La proprietà della stanza non è trasferibile attraverso questa API.

Il browser conserva il token nel fragment del collegamento e invia
`Authorization: Bearer <token>`; non inserirlo nei parametri query. Il servizio
persiste soltanto l'hash SHA-256 di token casuali da 256 bit. Perdere il token
proprietario significa perdere l'amministrazione della stanza: non esiste recupero
account. La revoca interrompe letture e scritture successive; non cancella copie già
lette o esportate da un partecipante.

## Contratto JSON, protocollo 1

`POST /rooms` non richiede token. Body `{title?, clientId}`. Risposta `201`:
`{roomId, token, role, grantId, snapshot}`. Tutte le rotte seguenti richiedono il
bearer token della stanza. Le richieste POST richiedono `application/json`.

| Metodo e rotta | Body / risposta |
| --- | --- |
| `GET /rooms/:id/snapshot` | `{roomId,title,role,grantId,revision,elements,objectVersions,files}` |
| `POST /rooms/:id/operations` | `{operationId,clientId,changes:[{id,baseVersion,element}],files?}` |
| `GET /rooms/:id/events?since=N` | `{revision,events,resetRequired,snapshot?}` |
| `POST /rooms/:id/undo` | `{operationId,clientId,targetOperationId}` |
| `POST /rooms/:id/grants` | Owner: `{role:'editor'|'viewer'}` → `{grantId,token,role}` |
| `GET /rooms/:id/grants` | Owner: `{grants:[{grantId,role,createdAt,revokedAt}]}` |
| `DELETE /rooms/:id/grants/:grantId` | Owner: `{revoked:true,grantId}` |
| `POST /rooms/:id/presence` | `{clientId,name?,cursor:{x,y}|null}` → `{peers}` |
| `GET /rooms/:id/presence` | `{peers:[{clientId,grantId,role,name,cursor,seenAt}]}` |
| `GET /health` | Pubblica: `{status:'ok',service:'ardesia-room-sync',protocol:1}` |

`objectVersions` è una mappa `id → intero` del server, indipendente dal campo
`version` di Excalidraw. Un oggetto nuovo ha `baseVersion:0` (accettato anche
`null`). Il contatore cresce a ogni operazione accettata e resta presente dopo la
cancellazione. `element:null` cancella l'oggetto; i tombstone Excalidraw possono
anche essere trasmessi come normali elementi con `isDeleted:true`.

Le operazioni e gli undo accettati rispondono con lo snapshot e
`{accepted:true,operationId,idempotent,operationVersions}`. `operationVersions`
contiene le versioni applicate da quella precisa operazione: un retry può
restituire uno snapshot più recente con modifiche altrui, e non deve essere usato
per aggiornare automaticamente la base delle modifiche locali successive.
La ripetizione dello stesso ID con gli
stessi contenuti, grant e client non applica una seconda modifica, anche dopo un
riavvio. Riutilizzare l'ID con altri contenuti produce `409 operation_id_reused`.

Due oggetti distinti si aggiornano indipendentemente. Se almeno un `baseVersion`
è obsoleto, **l'intero batch** viene rifiutato con `409`:

```json
{
  "error": "conflict",
  "conflicts": [{"id": "oggetto", "expectedVersion": 2, "actualVersion": 3, "current": {"id": "oggetto"}}],
  "snapshot": {"revision": 7}
}
```

Lo snapshot nell'esempio è abbreviato: quello reale contiene tutti i campi. Il
client deve mostrare il conflitto e conservare una scelta locale prima di decidere
se riproporla contro la versione nuova. Non deve fare retry automatico cambiando
soltanto `baseVersion`, perché cancellerebbe il lavoro concorrente.

L'annullamento riguarda soltanto un'operazione dello stesso grant e `clientId`,
e riesce solo se tutti i suoi oggetti hanno ancora la versione applicata da
quell'operazione. Non sovrascrive modifiche successive. Grant condiviso e client ID
non sono un'identità personale verificata; è il limite dell'accesso tramite link.

Ogni evento contiene `{revision,operationId,clientId,kind,changes,objectVersions}`.
Il feed conserva gli ultimi 1.000 eventi; un cursore troppo vecchio o futuro
riceve `resetRequired:true` con snapshot completo. Gli allegati si recuperano dallo
snapshot: il feed non ripete i bytes dei file. Studio controlla il feed ogni
650 ms e rilegge lo snapshot quando cambia la revisione, evitando di trasferire
tutti gli allegati a ogni controllo. La presenza viene aggiornata ogni 1,5 secondi.

`files` è la mappa BinaryFiles di Excalidraw: `{id,dataURL,mimeType,created?,lastRetrieved?}`.
Sono accettati nuovi data URL base64 PNG, JPEG, GIF, WebP e SVG.
Nuovi PDF nel canale `files` sono rifiutati: richiedono la pubblicazione esplicita
dell’originale descritta sotto. Gli snapshot storici restano leggibili. Un file già presente
non può cambiare bytes o MIME; nuovi bytes richiedono un nuovo ID. Non vengono
scaricati URL remoti. Limiti: 4 MiB per file, 20 MiB di allegati per stanza,
30 MiB per richiesta, 10.000 elementi, 20.000 operazioni conservate e 128 MiB di
stato serializzato. Il superamento restituisce un errore, non elimina dati vecchi.
L'undo conserva i file per evitare riferimenti interrotti.

Il servizio non ha campi per appunti privati. Questi devono restare nel deposito
locale del browser e non entrare negli elementi o negli allegati condivisi.

## Persistenza, LAN e limiti verificabili

- Le mutazioni di una stanza sono serializzate. Prima della conferma il servizio
  scrive un file temporaneo, esegue `fsync`, fa rename atomico e sincronizza la
  directory. Un errore di scrittura non viene presentato come successo.
- Eseguire **un solo processo per directory dati**. Il servizio è un nodo locale,
  non un database distribuito. Non dispone ancora di lock tra processi, backup
  automatici, recupero account, rate limiting per identità o monitor operativo.
- Il bind loopback permette test con browser distinti sulla stessa macchina. Per
  altri dispositivi servono configurazione LAN esplicita di bind, origin e host,
  URL raggiungibile e un trasporto HTTPS affidabile. Il default HTTP non protegge
  capability link o lavagna su una rete non fidata. Nessuna esposizione LAN o
  distribuzione remota viene attivata automaticamente.
- È una sincronizzazione a conflitti espliciti, non un CRDT. Una selezione che
  modifica molti oggetti è atomica; un conflitto su uno di essi ferma tutto il batch.
- Ordine z: gli elementi mantengono l'ordine di inserimento server. Non è definita
  un'operazione autonoma per riordinare globalmente la scena. Il client conserva
  eventuali indici di ordinamento Excalidraw dentro gli oggetti.
- Non sono inclusi voce/video, autenticazione istituzionale, autorizzazioni per
  singolo oggetto, crittografia dei file a riposo o gestione di più server.

## MCP core: leggere e modificare la stanza da un host MCP

`mcp_server.py` espone un vero server **MCP stdio**, collegato all'API HTTP della
stessa lavagna. Richiede Python 3.12 e lo SDK `mcp` 2.x nel runtime scelto. Nel
checkout affiancato di Kirchhoff questi sono già disponibili in `.venv`; il
servizio non installa dipendenze e non cerca automaticamente quell'ambiente.
Lo SDK 2.2.0 usa `MCPServer`, il nuovo nome di `FastMCP`.

Avvia prima il servizio Node. Configura poi l'host MCP con il percorso assoluto
dell'interprete Python scelto, l'argomento assoluto `mcp_server.py` e queste
variabili nell'ambiente del subprocess:

| Variabile | Significato |
| --- | --- |
| `ARDESIA_MCP_ORIGIN` | Default `http://127.0.0.1:4318`; solo HTTP loopback, nessun percorso, query, fragment o credenziale nell'URL |
| `ARDESIA_MCP_ROOM_ID` | Stanza autorizzata, obbligatoria e fissa per tutta la vita del processo |
| `ARDESIA_MCP_TOKEN` | Capability di un grant della stanza, obbligatoria; usa l'ambiente protetto dell'host, non argomenti dei tool o URL |
| `ARDESIA_MCP_CLIENT_ID` | Identità di questo client; se assente è generata per processo. Impostala stabilmente per retry e undo dopo un riavvio |
| `ARDESIA_MCP_ALLOW_WRITE` | `0` per default: espone solo lettura. `1` espone anche modifica e annullamento |

Il token non viene restituito dagli strumenti o scritto nei log. Usa un grant
dedicato a questo host: il proprietario può revocarlo dalla lavagna. Il flag di
scrittura **non aumenta i permessi del grant**: un viewer riceve comunque `403`.
Non sono esposti creazione stanza, inviti, revoca o altre operazioni amministrative.
Le credenziali non fanno parte dello schema degli strumenti.

| Strumento | Argomenti | Effetto |
| --- | --- | --- |
| `room_snapshot` | Nessuno | Snapshot corrente con `objectVersions`, elementi e allegati |
| `room_apply` | `operation_id`, `changes`, `files?` | Batch atomico sullo stesso endpoint `/operations` della lavagna |
| `room_undo` | `operation_id`, `target_operation_id` | Undo condizionale delle sole operazioni dello stesso grant e client MCP |

`changes` mantiene il contratto HTTP: `[{id,baseVersion,element}]`. Leggi le
versioni prima della modifica. Dopo un errore di rete riusa lo stesso
`operation_id` e gli stessi contenuti; il servizio gestisce l'idempotenza anche
dopo riavvio. Dopo un conflitto scegli esplicitamente come conservare entrambi i
lavori: il bridge non aggiorna automaticamente le versioni e non rispedisce la
richiesta. Gli errori hanno `isError: true` e `structuredContent` con codice,
stato HTTP e, per i conflitti, snapshot e oggetti coinvolti.

Il bridge usa connessioni dirette: ignora proxy di ambiente e rifiuta redirect.
`localhost` viene fissato a `127.0.0.1`, senza risoluzione DNS. Non accetta URL,
stanze o token dagli strumenti, e non scarica URL presenti nella lavagna. Gli
appunti personali restano fuori dalle API condivise. Le letture non sono
memorizzate dal bridge: una revoca viene rispettata alla chiamata successiva.

Esecuzione con il runtime già presente nel checkout affiancato, dopo aver
configurato le variabili nell'host:

```sh
../kirchhoff-takeover-20261002/.venv/bin/python services/room-sync/mcp_server.py
```

Test: subprocess MCP stdio reale tramite SDK e processo HTTP Node canonico su
porta loopback temporanea, senza handler fittizio per l'API della lavagna:

```sh
../kirchhoff-takeover-20261002/.venv/bin/python -m pytest services/room-sync/test_mcp_server.py -q -o addopts=''
```

Limiti del bridge: una stanza per processo, trasporto stdio, solo loopback HTTP,
risposta massima 32 MiB, timeout 8 secondi. Non offre un'interfaccia MCP Apps;
la lavagna resta la UI del prodotto. I permessi dell'host MCP e l'autorizzazione
alle sue azioni restano responsabilità dell'host; le annotazioni dei tool
dichiarano esplicitamente lettura o modifica.

## Originali PDF: consenso per documento

La condivisione di una pagina raster non pubblica il PDF originale. La UI deve
usare un gesto esplicito per ciascun documento. Il protocollo aggiuntivo usa lo
stesso server e gli stessi grant; non passa dal campo `files` della lavagna.

| Metodo e rotta | Contratto |
| --- | --- |
| `GET /rooms/:id/pdf` | Metadati dei soli originali pubblicati e `revision` |
| `POST /rooms/:id/pdf/:sha256` | Owner/editor: `{consent:'share-complete-document',name,totalPages,base64}` |
| `GET /rooms/:id/pdf/:sha256` | Byte `application/pdf`, solo con token attivo della stanza |
| `DELETE /rooms/:id/pdf/:sha256` | Owner o editor autore: interrompe condivisione futura, conserva i byte privati |

Snapshot ed eventi includono `pdfRevision`; lo snapshot include `pdfDocuments`
senza byte. Questa revisione è distinta da quella degli interventi sulla lavagna.
Un viewer può scaricare, ma non pubblicare né interrompere la pubblicazione.
La revoca del token interrompe le richieste successive, non elimina le copie già
salvate da un partecipante. La ricezione locale richiede controllo di SHA-256,
dimensione e quota prima di conservare i byte o offrirli nell'export `.lesson`.

L'autenticazione precede la lettura del body grande ed è ripetuta prima del parse
e della pubblicazione. Limiti: 20 MiB/PDF, 100 MiB e 32 originali conservati per
stanza; retry dello stesso hash non consumano nuova quota. File ritirati e byte di
upload interrotti ancora presenti consumano quota. Nessun recupero quota cancella
implicitamente fonti precedenti. La collisione di hash/byte o metadati viene
rifiutata.

I PDF sono file privati `pdf/<roomId>/<sha256>.pdf`, con scrittura temporanea,
fsync e rename. La ricevuta nel record transazionale della stanza è il punto di
pubblicazione: file senza ricevuta non sono serviti, e un retry può riutilizzarli.
Un errore non viene trasformato in una conferma. I file non vengono inviati a
provider esterni né resi accessibili senza il token della stanza.

```sh
node --test services/room-sync/pdf-store.test.mjs services/room-sync/pdf-http.test.mjs
```
