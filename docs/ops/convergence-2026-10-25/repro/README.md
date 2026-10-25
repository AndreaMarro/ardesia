# Prove del percorso attuale — solo dati sintetici e loopback

Questi script sono riproduzioni parametrizzate dei probe eseguiti sul prodotto
`40567cd7ccb56e7c5353a5f7c507c98dfa9eb4bb`. Non sono tool di produzione,
non accettano origin remoti e non stampano i codici di accesso.
Serve un clone con dipendenze del lock installate, Node26.5.1 per Web e Python3.13
nell'ambiente API. La cattura usa un dispositivo audio sintetico di Chromium.

Dalla root, prepara directory **nuove** e dipendenze già previste dal progetto:

```sh
npm ci
npm --prefix apps/studio ci
uv sync --project services/study-api --frozen --python 3.13
npx playwright install chromium
export ARDESIA_QA_DATA="$(mktemp -d /tmp/ardesia-ui-data.XXXXXX)"
export ARDESIA_QA_OUTPUT="$(mktemp -d /tmp/ardesia-ui-proof.XXXXXX)"
export ARDESIA_QA_BASE_URL=http://127.0.0.1:55343
services/study-api/.venv/bin/python bin/study-demo/seed_course_capabilities.py --data-dir "$ARDESIA_QA_DATA"
npm run build:web
ARDESIA_STUDIO_BASE=/studio/ npm --prefix apps/studio run build
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir "$ARDESIA_QA_DATA" --no-seed --port 55343 --frontend-dir apps/web/dist --studio-dir apps/studio/dist
```

L'ultimo comando resta nel terminale server. In un altro terminale usa gli stessi
valori di DATA/OUTPUT/BASE_URL. La fixture ammette due studenti sintetici nelle due
edizioni; non conferma un'offerta, non pubblica quesiti e non prova iscrizioni o
pagamenti. I codici sono nel file privato `$ARDESIA_QA_DATA/demo-access.json`.
Il laboratorio Web è alla root e Studio sotto `/studio/`.

```sh
cd apps/web
ARDESIA_WEB_URL="$ARDESIA_QA_BASE_URL" ARDESIA_DEMO_ACCESS="$ARDESIA_QA_DATA/demo-access.json" npx playwright test e2e/journey.spec.ts --workers=1
cd ../..
node docs/ops/convergence-2026-10-25/repro/audio-visible-ui.mjs
node docs/ops/convergence-2026-10-25/repro/cold-current-web.mjs before
```

Ferma con Ctrl-C **il solo server avviato da te**, poi rilancia lo stesso comando
`serve.py --no-seed` sulla stessa directory. Non rigenerare la fixture. Quindi:

```sh
node docs/ops/convergence-2026-10-25/repro/cold-current-web.mjs after
node bin/qa/audio-cross-view.mjs /tmp
```

Il journey Web verifica laboratorio/interesse, revisione/diario/nuova prova e
revisioni originali. Il probe UI audio registra e annota con i pulsanti reali,
revoca dalla seconda vista, verifica track ended e rifiuto di copiare il vecchio
riferimento. Il cold prova tre profili nuovi, ricevute/fonti/esiti identici e
isolamento dello studente2. I JSON, screenshot e video rimangono nell'OUTPUT.
Il probe `bin/qa` è invece un fixture dei controller: Web Locks/BC/MediaRecorder
reali, non una prova della UI. La CI lo esegue e conserva i log.

La vecchia spec Studio `study-group-journey.spec.ts` ora supera il funnel ma si
ferma su `Approva edizione di test`, comando trasferito intenzionalmente in
Mini-corsi. Non è dichiarata interamente verde. Il suo cold legacy richiede dati
specifici di quel percorso precedente e non sostituisce il cold corrente qui.
Non ripristinare il comando né indebolire preview/hash/revision dell'offerta.
