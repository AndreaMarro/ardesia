# Revisione indipendente del descrittore originale

Revisione delle modifiche non committate presenti il 20 ottobre 2026 in
`/tmp/ardesia-public-rea-20261020`. Nessun file di prodotto modificato.

## Riscontro concreto

**P2 — Gli allegati di edizioni legacy con ID superiore a 256 caratteri vengono rifiutati dal nuovo client.**

`apps/studio/src/study/originalAsset.ts:36` impone un limite di 256 caratteri a
`editionId`, mentre il Core conserva esplicitamente gli ID legacy fino a 8192
caratteri (`packages/engine/lessonos/study/editions.py:13`,
`packages/engine/tests/study/test_edition_listing.py:133`).

Riproduzione eseguita con una fixture storica di 257 caratteri creata secondo il
meccanismo già usato dai test del repository: utente autorizzato, caricamento PDF
200, lettura HTTP 200, SHA-256 e byte validi. `read_asset` e `studyBlob` restituiscono
l'originale; `studyOriginal` rifiuta la medesima risposta con
`invalid_asset_descriptor`. Occorre allineare il contratto del nuovo client al
budget legacy del Core e aggiungere copertura sul valore massimo supportato.

File riproducibili:

- `server-probe.py`: costruisce fixture e risposta HTTP reali;
- `authorized-legacy-response.json`: risposta sintetica, senza cookie o token;
- `client-probes.mjs`: transpila i tre moduli attuali in questa cartella e prova
  client nuovo e precedente;
- `review-probes.json`: esito della riproduzione e dei probe aggiuntivi.

## Verifiche eseguite

- I due test HTTP del descrittore passano.
- I 25 test di `original-asset.test.ts` e `session-transport.test.ts` passano.
- Probe separati: cambio sessione durante SHA-256 rigetta la risposta; cancellazione
  dell'utente durante uno stream incompleto rigetta e cancella il reader;
  descrittore invalido cancella il body.
- Ispezione del flusso Core: autorizzazione prima di `repository.get`;
  controllo lunghezza e SHA-256 prima del ritorno del descrittore.
- Ispezione consumer: `read_asset` conserva `(bytes, mime)`; `studyBlob` conserva il
  suo valore Blob. Il probe confronta entrambi con la risposta reale.

## Limiti

Scope limitato ai sei file richiesti e ai relativi consumer. Fixture sintetiche
SQLite, TestClient FastAPI e Web Streams di Node. Nessun dato reale, provider
remoto, proxy di produzione o browser mobile verificato. Typecheck e suite complete
restano in capo al builder. Questa review non certifica PDF.js, UI, G0 o G1.
