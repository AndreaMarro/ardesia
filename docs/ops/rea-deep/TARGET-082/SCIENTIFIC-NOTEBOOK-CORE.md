# SYS-01 — stato canonico del quaderno scientifico

Incremento locale del 20 ottobre 2026, successivo al lettore PDF `746c7fb`.
**SYS-01 resta aperto.** Questa integrazione riguarda Core, API ed export;
non aggiunge ancora i controlli di annotazione/formula nella UI del corso.

## Problema e risultato

Il lettore degli originali disponeva dell'identità binaria autorizzata, ma non
di uno stato annotato versionato. Il nuovo kind `scientific-notebook` estende
le risorse e le revisioni canoniche. Una risorsa rimane legata a un solo
originale; ogni revisione conserva titolo, annotazioni, pagina e geometria.
Un nuovo originale richiede una nuova risorsa. Gli upload distinti non vengono
accorpati in base al fingerprint PDF o all'uguaglianza dei byte.

La scrittura è privata e riservata al proprietario dell'originale nella stessa
edizione. Ogni comando rilegge e verifica i byte, il SHA-256 e il numero di pagine.
Il client non determina proprietario, visibilità, numero di pagine o autorità.
Creazione/revisione generiche rifiutano il kind riservato.

Una consegna deve riferire sia la revisione esatta sia l'originale del quaderno.
Il tutor può leggere V1 consegnata mentre V2 resta privata. Export e verifica
offline includono anche il PDF dei quaderni correnti non consegnati e dei pin
storici autorizzati. La verifica controlla integrità interna e coerenza del
binding tra revisioni: il checksum ricalcolabile **non prova autenticità**.

## Contratto API e stato

`POST /study/scientific-notebooks`, con `Idempotency-Key`, riceve:

```json
{
  "editionId": "fluidi",
  "assetId": "<id canonico dell'upload>",
  "assetSha256": "<SHA-256 dei byte autorizzati>",
  "state": {
    "v": 1,
    "title": "Continuità",
    "annotations": [{
      "id": "formula-1",
      "page": 2,
      "rect": [0.1, 0.4, 0.5, 0.2],
      "kind": "formula",
      "content": "A_1 v_1=A_2 v_2"
    }]
  }
}
```

`POST /study/scientific-notebooks/{resourceId}/revisions` riceve `state` e
`expectedRevision`; deriva il binding dalla risorsa corrente. Una revisione
concorrente obsoleta produce 409. Revisione, snapshot, evento e ricevuta sono
nella stessa transazione; il replay rinnova l'autorizzazione e non ripristina
una risorsa eliminata.

La risposta estende la normale risorsa con:

```text
notebook = {
  v: 1,
  source: {assetId, sha256, pageCount, coordinates},
  state: {v, title, annotations},
  sha256: hash canonico di v + source + state
}
```

`coordinates` è `pdf-normalized-unrotated-top-left-v1`: rettangolo `[x,y,w,h]`
nella pagina non ruotata, origine in alto a sinistra, coordinate normalizzate.
La futura UI deve invertire zoom e rotazione prima del salvataggio. Il rettangolo
deve avere area positiva e rimanere interamente nella pagina.

Tipi di annotazione: `note`, `formula`, `highlight`. Il contenuto è testo;
il Core non esegue HTML o LaTeX e non renderizza formule. Limiti: 20 pagine
dell'originale, 200 annotazioni, titolo di 200 caratteri, contenuto di 5.000
caratteri per annotazione, stato UTF-8 di 160 KiB, testo derivato di 20.000
caratteri. Il superamento viene rifiutato, senza troncamento silenzioso.
L'export mantiene i budget precedenti di 50 MiB decodificati e 96 MiB codificati;
non omette silenziosamente un originale necessario al quaderno.

## Migrazione e riuso

Lo schema canonico passa da 5 a 6 con due tabelle:

- `study_notebook_bindings`: resourceId → assetId, SHA-256, pagine.
- `study_notebook_snapshots`: revisionId → stato e hash.

Non c'è un secondo archivio degli originali o un nuovo journal parallelo.
Il testo derivato continua ad alimentare le interfacce esistenti. Cancellazione
definitiva e ripristino con erasure ledger usano le cascade canoniche.

L'inizializzazione esplicita SQLite aggiunge lo schema; l'apertura delle API
non migra. Uno schema parziale viene rifiutato. Se un vecchio database aveva già
usato il kind libero `scientific-notebook`, la migrazione si ferma con
`notebook_kind_migration_conflict`, preservando i dati per una decisione esplicita.
La migrazione PostgreSQL aggiunge RLS e privilegi SELECT/INSERT al ruolo applicativo.
**PostgreSQL live non è stato collaudato in questo incremento.**

Nessuna nuova dipendenza di prodotto: il Core riusa pypdf, transazioni, ricevute,
revisioni, export e cancellazione già presenti. Nessun codice di terze parti
copiato nel nuovo modulo. MathLive ed Excalidraw restano componenti dello Studio
esistente, con le relative licenze nel progetto.

## Acquisizione REA del sistema originale

REA 6.7.0, MCP stdio reale, 207 schemi annunciati dal server. La versione è ancora
`latest` su npm ed è la release ufficiale del 18 ottobre 2026; nessuna reinstallazione.
Target: Studio locale di questo repository, Vite su porta 5395, Chrome 155.0.8059.85,
viewport 1440×1000. Il lockfile dello Studio risolve MathLive 0.110.0,
Excalidraw 0.18.1 e PDF.js 6.0.227. Quest'ultimo è distinto dal PDF.js 6.4.299
del nuovo lettore Web.

| Evidenza | Osservazione e limite |
|---|---|
| `ev_4ae512266d3dbfc29090a03d82c1b0f9790c6e15da676db3bacdffb051acc55b` | Prima cattura troppo anticipata: mostra caricamento/fallback. Non prova il funzionamento della lavagna. |
| `ev_4262a9eb22a1b768425a55c61c453402ff8dc32f5ab22ab502314f113c0d6b43` | Apertura del compositore, scelta integrale e campo MathLive visibile: cinque step completati. Completa entro la selezione DOM/CSS/accessibilità/screenshot e metadati di rete. Corpi di rete non richiesti. |
| `ev_a054105d4e436e3bccd7771fcc24165a643e7d78510eb3794851ca8adbac0d48` | Sette step completati fino all'attesa dopo l'inserimento. Undo scade dopo 15 s; Redo, chiusura e riapertura cancellati. Evidenza incompleta. |

La terza cattura registra `EventEnvelope v2: payload.element.customData contains
a non-JSON value of type undefined`, con stack nel journal dello Studio.
L'errore precede il timeout di Undo; l'ordine osservato non dimostra da solo
un rapporto causale. Il flusso salva–chiudi–riapri originale non è verificato.

REA conserva DOM, CSS, accessibilità, schermate e metadati degli eventi selezionati.
Non ha attribuito un'identità binaria al target servito; l'indice locale registra
separatamente commit, hash dei sorgenti pertinenti e lockfile. Questi hash non
sostituiscono l'attribuzione runtime mancante.

La lettura dei sorgenti conferma font MathLive da unpkg e conversione LaTeX→SVG
con MathJax da CDN. Decisione tecnica: riusare il compositore maturo con un
adattatore nuovo, mantenendo LaTeX e stato editabile nel Core; completare asset
locali, renderer e storia Undo prima dell'integrazione nella UI. Non adottare
come già verificato il vecchio wrapper del journal.

## Verifica e difetti corretti

Le ricevute sono in `notebook-core/verification.json`; i log completi e i bundle
MCP sono nella consegna ZIP. I test esercitano API/SQLite reali con PDF sintetici:
pagina e formula, riapertura dello store, V1 consegnata/V2 privata, export,
revoca, concorrenza, rollback della ricevuta, migrazione, cancellazione e restore.

La review separata Codex ha riprodotto quattro P2, poi confermato i fix:
interi enormi nelle coordinate, MIME mancante nell'export, cambio dell'originale
tra revisioni, surrogati Unicode nelle identità/CAS. Otto regressioni HTTP
fallivano prima della correzione; i 31 test mirati finali passano. Una prima
invocazione senza PYTHONPATH è fallita in raccolta ed è conservata come tale.
I test legacy modificati aggiornano il numero di schema atteso e richiedono
le nuove colonne; i gate non sono stati indeboliti.

La review non attesta indipendenza tra famiglie di modelli. Il gate storico
`packages/engine/eval/gate.sh` punta a `~/lessonos`: la suite equivalente è stata
eseguita dalla directory del package in questo checkout, senza modificare il gate.
Nessuna UI modificata o suite frontend ripetuta in questo incremento.

## Prossimo confine da completare

Restano l'editor integrato di annotazioni e formule, il controllo della geometria
con rotazione/zoom, Undo isolato per attore/corso/fonte, recupero degli errori e
salva–chiudi–riapri nel browser. Occorrono il confronto REA con un workflow
equivalente autorizzato e le verifiche UI a 390/820/1440 px, tastiera, contrasto,
movimento ridotto e accessibilità. Il Core verde non prova una UI perfetta.

SYS-02..08, accessi nominativi, preflight cloud, G0/G1 e rilascio rimangono aperti.
Nessun push, merge, deploy o messaggio esterno.
