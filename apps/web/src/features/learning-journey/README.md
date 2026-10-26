# S20 — Learning Journey

Consumer componibile di Poiseuille main: obiettivo, fonte esatta, previsione, laboratorio, formule, ragionamento, ricevuta, feedback e problema diverso nello stesso spazio. Non crea auth, grading, tentativi, scheduler o memoria alternativi. Stato UI e comando pending sono una risorsa privata nel ledger Study esistente; le ricevute Core restano l'autorità.

## Integrazione riservata a S00

Base verificata `a00f2f40091aecf69e58ebaba42cf70d748e4066`. Nessun file condiviso è modificato dalla PR S20. Applicare con controllo sulla composizione corrente:

```sh
git apply --check apps/web/src/features/learning-journey/mount-classroom.patch
git apply apps/web/src/features/learning-journey/mount-classroom.patch
```

La patch monta lazy `LearningJourney` soltanto per studente iscritto con attività iniziale Poiseuille e `VITE_S20_LEARNING_JOURNEY=1`. Default spento. Include filtro di `learning-journey-checkpoint` nel confine di lettura `useCourseWorkspace`, prima della cache: le viste generiche non mostrano/modificano il JSON della posizione salvata. Il consumer S20 rilegge autonomamente il medesimo Core autorizzato. Non applicare soltanto il mount senza il filtro.

`s02-navigation.patch` contiene **solo il primo hunk originale S02** di `root-navigation-and-availability.patch`, fonte `28d70a549b73bebffee42e200aa7f1fb1ac2b1d5`, blob `95b796920510b5e20d4bdf819588fbaa1d7bcd01`. S02 ha confermato il riuso nella composizione QA e la consegna attribuita a S00. Preserva logout, setView e scroll; pushState solo per una vista differente, replaceState per la vista corrente. Non duplicare se S00 ha già composto il raccordo S02. Il file originale completo è conservato in evidence; il secondo hunk `enabledViews` **non** è applicato dalla prova S20.

Il plugin `verification/vite.proof.config.mjs` compone questi tre raccordi **soltanto durante il build di prova della vera App**. Non sostituisce App, Shell o API. Il backend è `create_app` originale con auth/sessioni/SQLite e identità sintetiche; nessun endpoint di successo simulato. Una composizione QA non è main o deployment.

## Riproduzione

Usare le dipendenze dichiarate dal monorepo, senza modificare lockfile. Python >=3.12 e dipendenze `services/study-api/pyproject.toml`; Chromium Playwright installato. Il plugin Browser non è disponibile in questa sessione: verifica con Playwright regolare. Directory private/evidence fuori da sorgenti e Git; non pubblicare `access.json`, cookie o database.

```sh
# Dalla radice del repository, con il runtime del progetto attivo
npm exec --workspace @ardesia/web -- vitest run src/features/learning-journey/model.test.ts --maxWorkers=1
npm run typecheck --workspace @ardesia/web
node node_modules/vite/bin/vite.js build --config apps/web/src/features/learning-journey/verification/vite.proof.config.mjs

# Vite scrive ../proof-dist; impostare il percorso assoluto effettivo.
export S20_PRIVATE_DIR=/absolute/private-s20-fixture
export S20_FRONTEND=/absolute/proof-dist
python -m uvicorn server:app --app-dir apps/web/src/features/learning-journey/verification --host 127.0.0.1 --port 5460

# In altro terminale: stesse variabili, directory di fixture nuova per ogni suite.
export S20_ORIGIN=http://127.0.0.1:5460
export S20_EVIDENCE_DIR=/absolute/s20-evidence
node apps/web/src/features/learning-journey/verification/browser.mjs
# recovery.mjs richiede una seconda fixture vuota e la sua istanza API.
node apps/web/src/features/learning-journey/verification/recovery.mjs
```

L'API di test genera codici soltanto nella directory privata. Il runner li scambia tramite la vera `/study/session`, carica l'App compilata e verifica il consumer montato. `route.fetch()` inoltra il comando al Core prima di interrompere la risposta per simulare la perdita di rete; nessuna risposta positiva viene costruita dal test. L'esito ignoto si ritenta con la stessa chiave. Rifiuti definitivi del POST e conflitti CAS hanno recuperi distinti.

`vite.baseline.config.mjs` e `baseline.mjs` verificano separatamente la main senza trasformazioni S20/S02. Gli input scientifici e le review sono sintetici. Questi runner sono prove funzionali, non test con studenti, ascolto umano o approvazione scientifica.

## Confini di stato

- `model.ts`: checkpoint validato per attore/edizione/pack/step; capacità future tipizzate NOT_AVAILABLE; limite dell'envelope serializzato verificato prima del freeze.
- `coreAdapter.ts`: sola chiamata ai contratti esistenti; CAS, create idempotente, ricevuta legata a submission, edizione, testo, previsione e fonte.
- `useJourney.ts`: bozza nel cache UI di sessione già esistente, con base originale e conflitto esplicito; salvataggio Core prima di lasciare un passo; guardia beforeunload per modifiche non confermate. Nessun archivio browser persistente S20.
- `LearningJourney.tsx`, `JourneyDialog.tsx`: composizione, focus, touch/tastiera, concentrazione, fonte e feedback; riuso PhysicsLab/PoiseuilleModel/SourceViewer/FormulaField/FormulaPreview/PredictionEvidence/Radix.

La posizione ripristinata è il problema/passaggio salvato; lo scroll esatto della pagina non viene sincronizzato. Una bozza non salvata è protetta nella sessione e dal dialogo nativo di uscita, ma non è dichiarata persistita dopo crash del browser. La ricevuta indica consegna; confronto deterministico, aiuto richiesto e verifica del ragionamento sono distinti.

## Dipendenze future

Le PR #309 (S06), #315 (S05), #316 (S02), #312 (S11), #317 (S01), #313 (S08) sono state lette come aperte all'ingresso. Non sono importate da branch non integrati. `JourneyIntegrations` offre solo porte tipizzate per memoria, studio autonomo e replay. S00 abilita gli adapter dopo disponibilità e controprova. S20 non propone scheduler/FSRS, secondi tentativi o un'autorità `completed`.

Raccordi futuri: S03 identifica gli obiettivi e la fonte CoursePack; S06 mantiene comandi/piano/autovalutazione canonici; S17 collega il passaggio registrato e verifica i byte del replay. S01/S18/S19 restano capacità specialistiche degli owner. Nessun bottone annuncia capacità non disponibili.
