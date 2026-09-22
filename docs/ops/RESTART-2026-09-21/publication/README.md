# Prove della ripartenza e pubblicazione GitHub

Snapshot sorgente: **908cdf0f1ffae49d518c7093719904075a593cc0**,
22 settembre 2026. [Guida di lettura](../../../START-HERE.md),
[indice delle unità](../index.json), [preregistrazione](preregistration.md).

## Contenuti e provenienza

| Artefatto | Contenuto |
|---|---|
| [commands.jsonl](commands.jsonl) | 183 esecuzioni storiche del runner, incluse RED e correzioni di setup; comando, cwd, exit, durata e data |
| [restart-evidence.zip](restart-evidence.zip) | 216 file: gli stessi record, il runner, 183 log e output sintetici selezionati dai checkpoint |
| [review-originals.zip](review-originals.zip) | 41 file R-02/R-03 prelevati byte per byte da Git allo snapshot, inclusi receipt e manifest originali |
| [manifest.json](manifest.json) | Inventario completo, dimensioni, SHA-256 degli archivi e di ciascun membro, trasformazioni delle copie di lettura |
| [verify.py](verify.py) | Verifica locale senza dipendenze esterne e senza estrarre/eseguire gli archivi |

I percorsi dentro gli ZIP partono dalla root del repository. I percorsi macchina
nei record descrivono l'ambiente originario, non prerequisiti da ricreare alla
lettera. Gli archivi .lesson e HTML sono output dei probe sintetici; non sono
lezioni di studenti. Sono esclusi cache, configurazioni provider, prompt personali,
copie di sorgenti Kirchhoff estranee al lavoro e il dump della CI già disponibile
su GitHub. Gli altri pack di review già versionati rimangono nelle loro cartelle.

## Originali e copie di lettura

La CI controlla il whitespace anche nei log. Quindici file R-02/R-03 contenevano
spazi finali o righe vuote a fine file prodotti dagli strumenti o dal Markdown.
I byte originali sono conservati integralmente nell'archivio e nello snapshot
Git. Alle copie visibili nelle vecchie cartelle è stata applicata soltanto la
normalizzazione dichiarata nel manifest; contenuto e risultati non sono riscritti.
Ai due closeout è aggiunto un collegamento a questa nota.

**I vecchi SHA256SUMS e gli hash nei receipt si verificano sugli originali
estratti dall'archivio, non sulle copie normalizzate del checkout.** Gli hash
delle copie di lettura sono nel nuovo manifest. Nessun gate, allowlist o regola
Git è stato cambiato per esentare questi file.

Tre log RED R-03 contengono byte NUL perché le asserzioni fallite stampavano
buffer ZIP; quei byte restano nell'archivio binario e sono contati nel manifest.
I pattern del secret scanner del repository sono stati applicati ai contenuti
prima della compressione e ai membri degli archivi .lesson: zero corrispondenze.
Questa è una verifica euristica, non una certificazione generale di assenza di PII.

## Verifica ripetibile

Dalla root del repository:

```sh
python3 docs/ops/RESTART-2026-09-21/publication/verify.py
```

Il comando verifica hash e inventario degli ZIP, originali contro lo snapshot Git,
normalizzazione delle copie, copia testuale dei comandi e riferimenti dell'indice.
Non riesegue test prodotto e non trasforma risultati storici in risultati nuovi.
Per verificare i vecchi manifest, estrarre review-originals.zip in una cartella
vuota e lanciare shasum dalla sottocartella del relativo manifest.

La CI e la PR riportano separatamente i controlli eseguiti sul branch pubblicato.
L'autorizzazione alla pubblicazione non include merge, pilot o deploy manuale.
