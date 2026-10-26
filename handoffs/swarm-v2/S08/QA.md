# Riprodurre S08

Usare un checkout isolato con i runtime del lock già installati. Le prove usano esclusivamente dati sintetici e un database nuovo. Nessuna credenziale reale, provider esterno o microfono. I due WAV sinusoidali vengono generati nel browser e restano nel contesto QA temporaneo; non nel Git.

1. Avviare `qa-server.py --directory <directory-nuova>` con `PYTHONPATH=packages/engine:services/study-api` e il runtime Study API. Salva solo token sintetici locali nel percorso indicato, con umask077. Non riusare database di studenti.
2. Avviare Web Vite su127.0.0.1:5480 con proxy `/study`→127.0.0.1:5481; Studio Vite su127.0.0.1:5482. Le porte sono esclusive della prova, non5320/5321 delle altre sessioni. Se le dipendenze sono symlink fuori dal checkout, consentire nel **solo config QA locale** le loro directory reali in `server.fs.allow`: il font403 osservato nella prima prova derivava da questa configurazione; nessun cambiamento prodotto necessario.
3. Eseguire `ARDESIA_MEDIA_ACCESS=<directory-nuova>/access.json node handoffs/swarm-v2/S08/browser-proof.mjs`. Variabili opzionali `ARDESIA_MEDIA_WEB_URL`, `ARDESIA_MEDIA_STUDIO_URL`, `ARDESIA_MEDIA_OUTPUT`. Accessfile e DB non vanno committati. Il runner richiede un archivio senza precedenti fonti S08; scegliere un database nuovo a ogni esecuzione.
4. Il runner salva screenshot desktop/mobile/player e JSON nel solo output indicato (default artifacts/lesson-media, ignorato da Git). Il percorso reale attraversa API Core → Materiali → editor → cold reload → popup player canonico → audio seek/play/pause → ritorno al catalogo → ricerca/export → ritiro fonte → export negato; controlla anonimo401 e altro studente403.

I test aggiunti si eseguono con:

```
npm run test --workspace @ardesia/web -- src/features/lesson-media/ --maxWorkers=1
npm run typecheck:web
PYTHONPATH=packages/engine python -m pytest packages/engine/tests/study/test_lesson_media.py packages/engine/tests/study/test_context_memory.py packages/engine/tests/study/test_access.py -q
PYTHONPATH=packages/engine:services/study-api python -m pytest services/study-api/tests/test_lesson_media_http.py -q
```

Il runner prova Chromium con media sintetici locali. Non prova ascolto umano, Safari/device fisico, video remoto, Range/segmenti HTTP protetti, sottotitoli incorporati nel player, revoca di copie scaricate o efficacia didattica. La prima run UI ha avuto un timeout di selezione; la successiva prova completa è distinta. Le esecuzioni ampie sul Mac sotto carico hanno prodotto timeout in exam-cas non modificato: non dichiararle verdi né rinominare il caso flaky. Conservare comandi ed esiti nella validazione finale.

## Addendum 26 ottobre — replay con sottotitoli

Stesse porte/runtime/database nuovo dei punti1–2. Avviare `ARDESIA_MEDIA_ACCESS=<directory-nuova>/access.json ARDESIA_MEDIA_OUTPUT=<output-nuovo> node handoffs/swarm-v2/S08/playback-browser-proof.mjs` dalla root. Non impostare REA_SIGNAL per la normale esecuzione; CDP5483 e segnale opzionali solo per osservazione autorizzata della propria fixture. Script genera journal/WAV e indici Core; niente byte/studenti reali. Il secondo browser finale usa status403/401 esatti e zero seek/track. Restano i limiti espliciti nel rapporto nuovo. Prima di unire il codice, eseguire typecheck/test/build dei due workspace dai rispettivi lock; i27testStudio e44Web si eseguono con poolthreads/maxWorkers1/no-file-parallelism e timeouttest/hook/teardown30000.
