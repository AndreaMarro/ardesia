# Ergonomia Studio, M1 e review pubblico — 25 ottobre 2026

Base51023fc5. Quattro file Studio congelati, SHA256 e asset in handoff.json. Nessun commit/push/PR/deploy o memoria condivisa modificati dall’agente.

Esiti: typecheckPASS,45test miratiPASS, autoreRED→GREEN3/3, nativeUIbuilt6/6PASS, M1PASS26.3s, coldPASS3.3s, pubblico9/9casi(72check)PASS a390/820/1440. Il cold usa lo stessoDB dopo riavvio --no-seed e nuovo profilo. Nessuna asserzione sul flusso originario rimossa: dieci ricevute/studenti, media, retry,403,11–12waitlist, review, nuovo tentativo,LessonOS e quaderno/originale. Le stringhe del quaderno locale ora verificano review/ricevuta indicate nel file, testo esattofeedback e autenticità canonica non verificata.

REA Excalidraw0.18.1MIT, Evidence completa ev_07e02f9658eb8e510182691d22d4cd510cd0e994b687bd0ae65a7dafec66df0a. Selezione mostra azioni oggetto; Delete porta0oggetti/0selezioni e le rimuove. LessonPassageAuthor deriva disponibilità dal controller esistente, elimina marker/trasferimento/riferimento quando scompare il recording e conserva il contesto scelto. Non si equiparano cancellazione grafica e revoca audio; nessun donor code/asset copiato. Controller/privacy invariati. REA costo totaleUNKNOWN; finestre di cattura osservate non sono costo totale né confronto col metodo diretto.

ResiduoP2: pulsanti confronto sottofold (y1038–1189desktop,1430–1626mobilealto1000), scroll necessario, nessun clipping. Il finding CTA molla→Fluidi è corretto daB e riverificato. La review non approva editorialmente né prova apprendimento umano.

Riproduzione M1/cold (root repo; dipendenze già installate; directory nuove):

```sh
export PATH=/opt/homebrew/opt/node@26/bin:$PATH
export QA=/private/tmp/ardesia-m1-fresh
services/study-api/.venv/bin/python bin/study-demo/seed.py --data-dir "$QA"
services/study-api/.venv/bin/python bin/study-demo/fixtures.py "$QA/fixtures"
npm run build:web
ARDESIA_STUDIO_BASE=/studio/ npm --prefix apps/studio run build
services/study-api/.venv/bin/python bin/study-demo/serve.py --data-dir "$QA" --no-seed --port 55475 --frontend-dir apps/web/dist --studio-dir apps/studio/dist
```

In altro terminale (stessoQA ePATH), da apps/studio:

```sh
STUDY_DEMO_DATA_DIR="$QA" ARDESIA_STUDIO_E2E_BASE_URL=http://127.0.0.1:55475 npx playwright test e2e/study-group-journey.spec.ts --workers=1
```

Ferma soltanto il server avviato da te; riavvia lo stesso comando serve.py con stessaQA e --no-seed. Poi, da apps/studio:

```sh
STUDY_DEMO_DATA_DIR="$QA" ARDESIA_STUDIO_E2E_BASE_URL=http://127.0.0.1:55475 npx playwright test e2e/study-cold-reopen.spec.ts --workers=1
```

I build effettivamente provati sono isolati in m1-build/{web,studio}; asset/hash nei binding. I log con suffissi precedenti conservano gli errori della spec e della fixture, non sono dichiarati verdi. Non trasferire le directory m1-data* con credenziali nel repository/rilascio. Probe nativo e review pubblica riproducibili con audio-presentation-native.mjs e public-independent-review.mjs. Vercel e SHA finale sono del root.
