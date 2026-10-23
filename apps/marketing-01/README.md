# Ardesia — MARKETING-01

Pagina pubblica **autonoma** di manifestazione d’interesse per quattro microcorsi Fisica2026/27. Anteprima e pacchetto pronto alla pubblicazione; nessun deploy implicito. Il sito andreamarro.it rimane separato e invariato.

## Avvio e verifica

Dalla root del repository (Python standard library, nessuna dipendenza di prodotto):

```sh
python3 apps/marketing-01/build.py
python3 -m unittest discover -s apps/marketing-01/tests -v
python3 apps/marketing-01/serve.py --port 5390
```

Anteprima: `http://127.0.0.1:5390`. Il server locale restituisce veri404, senza fallback SPA. Il pacchetto funziona anche aprendo `dist/index.html`: i quattro contatti diretti non dipendono da JavaScript.

La prova browser usa il Playwright già presente nel monorepo. Avvia una propria preview su porta libera, verifica390/820/1440, tastiera, CTA, selezione persistente, deep link/reload, link locali, assenza JS, due schede e404, poi arresta browser/server. Intercetta il solo endpoint esterno WhatsApp, senza inviare messaggi.

```sh
npm ci --no-audit --no-fund
npx playwright install chromium
MARKETING_QA_OUTPUT=/percorso/esterno/qa node apps/marketing-01/tests/browser.mjs
```

Su un Mac con Chrome, `ARDESIA_BROWSER='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` evita di installare un browser. La CI dedicata esegue gli stessi controlli. `MARKETING_QA_OUTPUT` va tenuto fuori dal pacchetto distribuito.

## Un solo modello di scheda

`build.py` legge direttamente la configurazione canonica Core indicata da `catalog.json`. Titoli, ID e unità non sono duplicati: le chiavi della copia editoriale devono corrispondere esattamente alla composizione. Una configurazione mancante o incoerente interrompe il build. Non si carica il corpo della banca e non si importano soluzioni o decisioni editoriali.

Le descrizioni dei risultati sono **obiettivi proposti**, non prestazioni garantite. Una futura materia può usare lo stesso renderer e una sua configurazione/copia editoriale, senza quattro nuove implementazioni. Occorre aggiornare normalmente il testo della pagina e il suo riferimento ufficiale; non si dichiara già disponibile una nuova banca o un programma didattico.

Ogni scheda ha una CTA WhatsApp diretta con percorso e interesse non vincolante. I due selettori condividono lo stato nella pagina, senza cookie/localStorage, database, form, analytics o contatti automatici. La barra persistente appare quando il pannello iniziale esce dallo schermo, comportamento trasferito dal donor Maven con REA. La selezione è preservata nel testo, non in un nuovo archivio di contatti.

## Pubblicazione dopo autorizzazione

Il target richiesto è24ottobre2026; è una scadenza di consegna, **non una data di avvio dei corsi**. Defaultbuild `noindex` e robots `Disallow` per evitare di indicizzare la preview.

1. Decidere l’URL HTTPS definitivo della pagina autonoma (sottodominio o hosting statico separato). Non sono necessari il backend didattico o Sites.
2. Generare il pacchetto finale con quell’indirizzo, per esempio `python3 apps/marketing-01/build.py --site-url https://DOMINIO-DECISO/`. Il parametro rimuove `noindex` e genera canonical/sitemap; non effettua deploy.
3. Pubblicare **solo il contenuto di `dist/`** sull’hosting statico scelto, con `index.html` e `404.html` come documento404. Nessun rewrite generale a index. Su Cloudflare Pages, per esempio, il progetto deve pubblicare questa directory e non il monorepo/app Studio. Su Netlify usare un draft prima dell’autorizzazione alla produzione.
4. Impostare HTTPS e gli header del server preview (`serve.py`), mantenere i dati di contatto corretti, ripetere il browser test sull’URL effettivo. Il dominio del tutor può successivamente collegarsi con un semplice link, senza migrare il sito.
5. Verificare URL/CTA/privacy e conferma esplicita della versione prima del deploy di produzione. Nessuna nuova raccolta dati va introdotta per una manifestazione d’interesse.

Rollback: ripubblicare il precedente artifact statico o rimuovere il collegamento. La branch `pro/ardesia-*` è esclusa dall’autodeploy Studio corrente; questa directory non cambia le configurazioni degli altri prodotti.

Fonti, licenza degli asset e limiti di verifica: `SOURCES.md`. Foto originale di Andrea ripresa dagli asset del suo sito per la presentazione del docente; illustrazioni SVG originali e icona tipografica Ardesia, senza asset Maven o immagini di persone generate.
