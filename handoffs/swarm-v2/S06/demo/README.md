# Riproduzione locale S06

Richiede dipendenze Web/API già installate secondo il repository. Non installa servizi o dipendenze nuove. Usa soltanto loopback e identità sintetiche. Avviare un singolo browser rispettando lo slot host; porte5360/5361 devono essere libere.

Dalla root del checkout, primo terminale:

```sh
S06_DEMO_RUN=acceptance-1 PYTHONPATH=packages/engine:services/study-api python -m uvicorn api:app --app-dir handoffs/swarm-v2/S06/demo --host 127.0.0.1 --port 5361
```

Secondo terminale:

```sh
node handoffs/swarm-v2/S06/demo/dev.mjs
```

Poi, serialmente:

```sh
S06_OUTPUTS=/percorso/locale/evidenze node handoffs/swarm-v2/S06/demo/browser.mjs
S06_DEMO_RUN=acceptance-1 S06_OUTPUTS=/percorso/locale/evidenze PYTHONPATH=packages/engine python handoffs/swarm-v2/S06/demo/workflow.py
```

Il primo runner termina revocando le sessioni sintetiche. Il runner keyboard-touch è stato eseguito con una nuova sessione emessa dal Core sullo stessoDB: ripristinare `access.json` con una nuova sessione sintetica propria prima di lanciarlo, oppure usare un nuovoDEMO_RUN. Mai riusare un token revocato o una identità reale. I file access/DB/log sono gitignorati; non allegarli alla PR. Per ripetere il flusso iniziale scegliere un nomeDEMO_RUN nuovo: iDBprecedenti rimangono come prova e non vengono cancellati.

`workflow.py` verifica sei lezioni,12tentativi, retry idempotente e riapertura in nuove sessioni cookie. `browser.mjs` verifica14comportamenti della molla, desktop/mobile, offline/reconnect/secondo browser/revoca. `keyboard-touch.mjs` verificaTab e tap reali. I fallimenti conservati documentano nome accessibile ambiguo e classificazione del distacco rete deliberato; nessun timeout è stato aumentato.

La composizione del demo aggancia il modulo S06 all'installer esistente passando authenticate/store_dependency reali. Non certifica un hook già inmain, un backend remoto o un rilascio pubblico. L'HTMLdemo è solo harness e non una shell sostitutiva. I percorsi personali presenti nelle prove locali non sono dipendenze del runner portabile.
