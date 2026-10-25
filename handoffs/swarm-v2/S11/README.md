# S11 — Evidenze del percorso, dati minimizzati e privacy

Stato: **READY_FOR_INTEGRATION**, non DONE. Base `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`, branch `codex/s11-learning-insights-20261026`. PR/head effettive e verifiche finali nel registro `evidence/verification.json`. Nessun merge o deploy eseguito da S11.

Lo studente vede prove conservate, aiuti dichiarati, esito deterministico della ricevuta, fonte/revisione e indicazioni revisionate contestabili. Il docente vede le evidenze permesse dal Core; aggregati di gruppo soppressi con meno di cinque studenti contribuenti. Pseudonimi e identificativi restano dati personali. La scelta facoltativa è per edizione e non impedisce submit, lettura o studio essenziale.

Il batch successivo nella stessa consegna aggiunge confronti prima/dopo soltanto tra ricevute legate dal parent canonico, con parametri uguali o contesto cambiato dichiarato, assistenza e nessuna inferenza causale. I recuperi verificati su una prova diversa dal tutor hanno una sezione distinta dalle indicazioni aperte, con ricevuta e revisioni esatte. Non si stimano efficacia, attenzione, padronanza permanente o calibrazione item da dati sintetici.

## Confine implementato

- `lessonos.study.learning_insights`: proiezione ricostruita su ricevute, fonti e diario canonici, nessun grader/registro parallelo.
- `routes.install_routes(app, store_dependency, authenticate, notice=None)`: installer con le dipendenze Core del chiamante; nessuna auth/migrazione propria. GET dashboard/export, PUT preferences, POST events.
- `LearningInsights({me,editionId})`: UI raggiunta dalla composizione sintetica locale, abort e lifetime della sessione, caricamento/errori/retry, export verificato sul server, opt-out, segnalazione esplicita e contestazione tramite diario esistente.
- Persistenza delle sole preferenze e osservazioni facoltative in `study_events`, scoped prima del decode, transazione/lock Core, consenso versionato con generazione server e fingerprint dell’informativa. Retry invariati conservano la generazione; revoca/riattivazione la cambiano. Nessuna dipendenza aggiunta al prodotto.

## Allowlist e motivo di ciascun campo

| Campo proposto | Uso ammesso |
|---|---|
| schemaVersion | Rifiutare forme non comprese |
| eventId | Deduplicazione; stesso ID con dati diversi è409 |
| consentId | Rifiutare code di una scelta revocata, anche con clock skew |
| receiptId | Legare l’osservazione a prova propria e fonti autorizzate |
| kind | Distinguere soli comportamenti allowlisted |
| occurredAt | Ordinamento e finestra di conservazione; mai misura di attenzione |

Tipi: `activity.started`, `activity.ended`, `attempt.seen`, `hint.used`, `feedback.read`, `transfer.started`, `study.resumed`, `difficulty.reported`. Sono dichiarazioni client validate e legate a ricevute, **non esiti canonici**. La UI emette soltanto difficulty.reported su gesto esplicito e opt-in. Non è installato un tracker di navigazione o un SDK universale. Gli eventi precedenti a una ricevuta non hanno ancora un consumer: non si inventano obiettivo/lessonRef/fase fuori dal contratto S10. Attività/versione, modello, pack/hash, controlli e assistenza provengono dalla ricevuta. `NOT_CHECKED` resta tale se il Core non ha registrato un controllo.

Massimi:20 eventi e4096byte per richiesta, ID128caratteri, schema chiuso. Nessun audio/video, risposta libera, biometria, emozione, gaze, tasti, fingerprint o attività fuori dall’app. Test sintetici soltanto. Informativa `None` per default: raccolta disabilitata. Quella del demo è esplicitamente sintetica e non una base giuridica di produzione.

## Raccordi richiesti, ancora non applicati

1. **S00** monta `LearningInsights` nella shell autenticata con `me`/`editionId` già risolti. RootApp/App non modificata autonomamente.
2. **S10** chiama l’installer con store/auth canonici; verifica ingest, admission, ACL, PostgreSQL e costi. Non configurare una notice reale prima della definizione effettiva della finalità/base/informativa e dei processi diritti/retention. Per l’esempio locale l’installer è composto fuori dai file condivisi: questo prova il contratto, non l’installazione nel prodotto o il remoto.
3. **S10 restore, obbligatorio**: chiamare `maintenance.invalidate_after_restore(store, apply=True)` sulla copia verificata prima di servirla. La review ha riprodotto un vecchio backup che riattiva una scelta revocata attraverso l’attuale `operations.restore_data`. Il helper elimina conservativamente preferenze e osservazioni facoltative; le ricevute restano Core e occorre nuova scelta. Test dell’hook verde non certifica la composizione restore corrente, che resta un gap bloccante per raccolta reale.
4. **S10 retention**: `prune_expired(store, apply=False)` è dry run; `apply=True` cancella eventi scaduti senza loggare payload. Va integrato nel processo operatore approvato e dopo restore. Nessuna automazione creata. Filtro di lettura e purge dell’utente sono implementati; da soli non garantiscono uno SLA di cancellazione fisica per account mai riaperti. Backup/provider e conservazione dei consensi richiedono policy operativa reale.
5. **S05** conserva il diario individuale e i suoi comandi. Questa UI proietta, contesta tramite endpoint esistente e rispetta sourceState/status del Core. Nessuna seconda memoria.

Contract e checkpoint pubblicati nel rendez-vous #306. Nessuna delega shared presunta; nessuna chat nuova o messaggio a studenti.

## Riproduzione locale sintetica

Usare le dipendenze dei lock correnti; dati privati di QA fuori dal repository. La composizione ha cookie/sessioni Core e SQLite persistente; il solo adapter locale di store/auth serve la factory del nuovo namespace. Le ammissioni/protezioni remote rimangono da comporre da S10.

```sh
PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study/test_learning_insights.py services/study-api/tests/test_learning_insights_http.py -q
npm run test --workspace @ardesia/web -- src/features/learning-insights/LearningInsights.test.tsx --maxWorkers=1
npm run typecheck:web
PYTHONPATH=packages/engine:services/study-api python handoffs/swarm-v2/S11/run_demo.py --data-dir /PERCORSO_PRIVATO_NUOVO/s11 --port 55621
node handoffs/swarm-v2/S11/prepare_preview.mjs /PERCORSO_PRIVATO_NUOVO/preview
node node_modules/vite/bin/vite.js --config /PERCORSO_PRIVATO_NUOVO/preview/vite.config.mjs --configLoader native
node handoffs/swarm-v2/S11/verify_browser.mjs /PERCORSO_PRIVATO_NUOVO/s11/access.json /PERCORSO_PRIVATO_NUOVO/evidence
```

Il demo emette `access.json`0600, fuori Git. Per QA browser usare una cartella dati nuova: la contestazione e le scelte sono persistenti. La pagina locale di prova monta il componente esistente, legge `/study/me` e usa il proxy stesso-origin `/study` su55621; nessuna nuova pagina login. Vite55610, Playwright Chromium già installato, desktop1440×1000/mobile390×844, movimento ridotto. `verify_browser.mjs ACCESS_JSON OUTPUT_DIR` verifica sessione, evidenze, opt-in/segno/riapertura/opt-out, contestazione, download, tastiera, overflow e revoca. Le401 deliberate sono registrate come negative attese, separate dagli errori inattesi. Non certifica Safari, hardware o efficacia con studenti.

## Riuso e licenze

Donor effettivo: Core, diario, Study API e client sessioni del repository alla base sopra; React19.2.6, Vite8.0.12, Vitest4.1.8 e Playwright1.60.0 già nei lock. Nessun codice, asset, schema o SDK xAPI/Caliper/OpenTelemetry esterno incorporato. Nessuna nuova dipendenza runtime, licenza o framework da approvare. Il codice prodotto è originale in questo repository; licenza del repository invariata. API e test esistenti hanno fornito il contratto: nessuna sessione REA eseguita, nessun risparmio temporale misurato o dichiarato. Rollback: non installare/rimuovere i due mount condivisi; opt-out e helper di purge cancellano solo dati facoltativi, non voti o ricevute.

## Tre prossimi batch

1. **Integrazione privata completa S00/S10:** installare mount/restore/retention, eseguire regressione reale backup→withdraw→restore con ledger corrente e PostgreSQL/revoca/concorrenza. Accettazione: nessuna scelta o osservazione resuscitata, due identità/edizioni e dashboard raggiungibile nella shell. Poi CI esatta e deployment privato pertinente; nessuna approvazione pubblica implicita.
2. **Obiettivi/fasi e interruzioni spiegabili:** consumare lessonRef/fase S10 e gli stati S06, senza raccogliere click per indovinare abbandono. Confronti fra prove nuove con versioni e criteri comparabili, stati mancanti espliciti, test negativi di relabeling e distinzione assistenza.
3. **Validazione delle misure e diritti:** calibrazione solo dopo piano e dati sufficienti con incertezza, nessun valore da pochi click; definire finalità/basi e policy per audit preferenze/backup, export/correzione/cancellazione end-to-end. Coinvolgere revisione umana pedagogica e privacy: nessuna firma inventata.
