# S01 — raccordo consegnato a S00

Fonte verificata c2ecf61bb0352562b59826cc4ab8a12d4a5dcde6, PR317 da main992d1a0b.
Il manifest in evidence/final congela sorgenti prodotto e prove. Nessun file
shared modificato, eccetto manifest/lock con patch esatta di autoreS00 già
delegata e applicata. Non è una richiesta di aggirare freeze/CI/editoria.

## API: patch concreta, non applicata

`study-api-composition.patch` aggiunge solo import e installatore; controllo
gitapply--check riuscito sulla base corrente. La prova E2E ha composto queste
righe in memoria nel vero create_app, conservando authenticate/store_dependency,
cookie/revoca, body admission e relative risposte. Non usare il resolver header
delle sole unit test come auth del prodotto. Niente nuove tabelle/grant/schema.

S00/S10 applicano il raccordo condiviso. Se altri installer hanno cambiato il
contesto, rivedere le due righe sull'head finale; non forzare la patch né
sostituire app.py intera. Verificare 401/403/409/422 e segnale cookie rejected
nella composizione finale, poi il percorso UI su quello stesso SHA.

## UI: ingresso e riapertura esatti

Export reale: `ScienceLibrary` da
`apps/web/src/features/science-library/ScienceLibrary.tsx`.

```tsx
const ScienceLibrary = lazy(() => import('./features/science-library/ScienceLibrary')
  .then(module => ({default: module.ScienceLibrary})));
// Nel consumer autenticato, con edizione realmente accessibile:
<ScienceLibrary me={me} editionId={data.edition.id} context="course"
  resourceRef={selectedScienceRef} onResourceSaved={handleSavedScienceRef}/>
```

`selectedScienceRef` è `{resourceId,revisionId}` con entrambi obbligatori;
non sostituire la revisione richiesta con la latest. Il componente esegue la
lettura autorizzata dal Core. Vecchia implementazione non disponibile: conserva
il testo senza rieseguire un altro modello. Le viste course/notebook riusano
lo stesso componente. `onResourceSaved` è chiamato solo se il save confermato
corrisponde alle modifiche aperte; un retry vecchio non deve eliminare testo
successivo. I query param attuali sono scienceResource/scienceRevision.

S00 deve comporre la navigazione reale e il typed reader di `science-resource`:
aprire il componente con riferimento esatto e mostrare gli oggetti salvati
dalla workspace Core. Filtrare il kind dalla visualizzazione/modifica JSON
generica di Materiali, come gli altri machine kinds S05/S06. Il filtro UI non
concede ACL. Non introdurre una seconda raccolta in localStorage o un viewer
che deduca permessi dai campi del payload. Conservare il re-export shell S02.
Il lab.html privato è la prova del consumer, esclusa dal build pubblico normale;
non è la navigazione principale già integrata.

Gli activityId nuovi non sono ancora nel dispatcher/coursepack chiuso: S00/S03
devono legare le lezioni e la fonte canonica alle definizioni, dopo controprove.
S01 non inventa campi lessonRef/fase o submission/valutazioni parallele.
Condivisione fra viste di corso non equivale a risorsa privata cross-edition.

## Prove eseguite e riproduzione

Su c2ecf61b: tsc EXIT0;13Web,43Core,5HTTP PASS; build EXIT0;17 controlli
browser PASS sull'artefatto compilato. CSP della prova senza unsafe-eval;
licenza recuperata viaHTTP e byte-esatta. Dataset Core,4viste, zoom/tabelle,
previsione/transfer, note→coldreopen, aiuti, offline/retry, peer403, revoca401,
tastiera/touch,390/820/1440. Zero pageerror/richieste esterne nella pagina
principale. La caduta intenzionale del chunk nella prova fallback è distinta.

Nello slot macchina concordato, senza altri compiler/browser:

```sh
node node_modules/vite/bin/vite.js build --config handoffs/swarm-v2/S01/vite.proof.config.ts
ARDESIA_S01_PYTHON=/percorso/venv/api/bin/python \
ARDESIA_S01_EVIDENCE=/nuova/cartella/privata \
ARDESIA_S01_BUILT_FRONTEND=/private/tmp/ardesia-s01-proof-dist \
node handoffs/swarm-v2/S01/prove-consumer.cjs
```

Il runner usa solo processi/porte propri55510/55511 e li chiude in finally.
La cartella prove contiene accessi sintetici: tenerla fuoriGit; non allegare
DB, fixture-private.json o cookie. Nessuna reinstallazione del node_modules
shared. Le13unit test,43Core e5HTTP sono elencate nei log preservati gzip.

## Limiti di adozione e accettazione finale

JSXGraph1.14.0 MIT, closure/notice documentati. Lazy chunk~259kBgzip secondo
Vite, budget350KiB PASS; misurazione/hash indipendenti in bundle.json.
Warning JessieCodeeval nel donor preservato: i percorsi numerici provati non
lo richiedono sottoCSP, nessuna attestazione su script JessieCode arbitrari.
REA sul dist era parziale/timeout e non è una verifica riuscita di architettura.

Le prove sono reali nella composizione privata; API/RootApp su main e Vercel
restano NON_VERIFICATI. Servono integrazione S00, controprova sullo SHA finale,
CI corrente e distribuzione appropriata con limiti espliciti. Human approval,
plugin install/update/rollback/revoke/uninstall, Kirchhoff e copertura dei200
target restano aperti. Questa consegna non conclude i quattro microcorsi.
