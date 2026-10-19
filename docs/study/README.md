# ARDESIA Fisica — microdemo locale sintetica

Questa estensione riusa Studio (React/Vite), il modello `postitObject`, lo store SQLite e le proiezioni grounded di LessonOS. Il dominio è in `packages/engine/lessonos/study`; l'adapter HTTP in `services/study-api`. Non abilita servizi cloud o modelli live.

## Avvio

Da questo checkout, con Node/npm, uv e ffprobe disponibili:

```sh
npm --prefix apps/studio ci --no-audit --no-fund
npm --prefix apps/studio run build
$HOME/.local/bin/uv run --project services/study-api python bin/study-demo/serve.py
```

Aprire `http://127.0.0.1:5208/?vista=fisica`. Il launcher crea `.study-demo/` con database persistente, blob privati e `demo-access.json` (permessi 0600). Il file contiene accessi temporanei a identità sintetiche: non committarlo, non distribuirlo e non usarlo su Internet. Per la demo, copiare l'accesso dell'attore desiderato nel campo «Accesso sintetico». Non inserire dati di persone reali.

Il tutor approva l'edizione dal gruppo e assegna l'attività da Lezione. Gli studenti confermano il posto, salvano una fonte privata, provano il laboratorio e consegnano. In Da correggere, il tutor genera una proposta **fittizia**, modifica il testo e pubblica la propria review. Lo studente rivede il feedback, apre un nuovo tentativo e recupera la memoria contestuale. I suggerimenti sono deterministici. I file immagine/audio non ricevono una trascrizione live; il PDF tenta prima l'estrazione nativa.

La configurazione locale rifiuta host diversi da loopback e un'origine browser diversa da quella del servizio. `create_app(..., demo=False)` rifiuta l'avvio: questa autenticazione è esclusivamente una superficie di collaudo sintetico, senza claim di auth produzione.

## Prova riproducibile

```sh
node bin/study-demo/verify.mjs
```

Il runner compila Studio, crea un **nuovo** database sintetico per il run, genera immagini/PDF originali e un tono audio (ffmpeg), avvia il servizio su loopback :5228, esegue il percorso con dieci contesti browser, spegne il processo, riavvia sullo stesso DB e riapre in un profilo pulito. Manifest, comandi, esiti e immagini finiscono in `artifacts/study-demo/<run-id>/`; le credenziali restano nella cartella runtime ignorata. Il manifest riporta i PID distinti e lo SHA. Non avviare due runner sulla stessa porta; `STUDY_VERIFY_PORT` seleziona una porta differente.

```sh
cd packages/engine
$HOME/.local/bin/uv run --extra study pytest -q
```

La suite Engine ordinaria usa il gruppo dev, che comprende il validatore immagini per i test. L'extra `study` dichiara le dipendenze runtime del modulo opzionale. La suite HTTP si esegue dalla radice con `PYTHONPATH=packages/engine:services/study-api $HOME/.local/bin/uv run --project services/study-api pytest services/study-api/tests -q`. Le suite Studio e il suo gate restano invariati.

## Export e limiti

Materiali esporta `.study.json`: fonti correnti, tentativi, review, layout e allegati privati autorizzati con hash. Riapertura **in lettura**, controllo integrità e omissioni visibili; non importa permessi, iscrizioni o sessioni. Non è il formato `.lesson`. Il canvas e il journal storici continuano a usare l'export `.lesson` esistente, verificato separatamente. L'export del quaderno limita gli allegati a 50 MiB e dichiara le omissioni.

La vista studio propone oggetti contestuali nello stesso monorepo e riusa identità/layout dei post-it; non aggiunge un motore canvas. Non attesta integrazione di ogni strumento storico nel laboratorio. Le revisioni inviate restano immutabili, le fonti correnti possono essere aggiornate, i derivati obsoleti sono esclusi dal recupero. La cancellazione completa dei dati personali e le policy di conservazione richiedono M2: M1 usa soltanto fonti sintetiche.

Vedere `progress.md`, `release-readiness.json` e il manifest del run accettato per stato e prove. La microdemo storica `53782a1…` non è stata recuperata: i componenti mancanti sono stati ricostruiti sulla base `b124eee0`, preservando il checkout originale in conflitto.
