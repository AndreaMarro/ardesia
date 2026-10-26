# S20 — Learning Journey

Consumer componibile di Poiseuille main: obiettivo, fonte esatta, previsione, laboratorio, formule, ragionamento, ricevuta, feedback e problema diverso nello stesso spazio. Non crea auth, grading, tentativi, scheduler o memoria alternativi. Stato UI e comando pending sono una risorsa privata nel ledger Study esistente; le ricevute Core restano l'autorità.

## Integrazione applicativa S00 — 26 ottobre 2026

Il consumer è ora montato nei sorgenti applicativi reali, sopra la composizione della PR #323 (`a23029b11ec00cb5e53453da1d9fb05af7cd45d5`) con main `b24ef9784bcac50c00d6e343a172eef904c19eab`. Prodotto verificato localmente: `7c610177d77e2796a34d0e49bb5f732bc72d93df`. Questo stato locale non attesta merge, deploy o backend remoto.

`Classroom.tsx` monta lazy `LearningJourney` soltanto per studente iscritto con attività iniziale Poiseuille e `VITE_S20_LEARNING_JOURNEY=1`. Il flag rimane **spento di default**: la prova corrente usa il normale build Web con il flag acceso. Gli strumenti esistenti dell’aula restano raggiungibili; tornando al percorso, la bozza UI della sessione si ripristina. Una correzione con `parentId` esplicito conserva il precedente editor di consegna.

`useCourseWorkspace.ts` esclude `learning-journey-checkpoint` e le tre risorse interne S06 prima della cache generica. Il consumer S20 rilegge autonomamente il medesimo Core autorizzato. Un riferimento `journey` non disponibile non apre silenziosamente un altro checkpoint: lo studente può scegliere esplicitamente di aprire il percorso dell’edizione.

`App.tsx` integra il primo hunk originale S02: `pushState` per una vista differente, `replaceState` per la vista corrente. Attribuzione conservata: `root-navigation-and-availability.patch`, fonte `28d70a549b73bebffee42e200aa7f1fb1ac2b1d5`, blob `95b796920510b5e20d4bdf819588fbaa1d7bcd01`. Logout, cambio vista e scroll restano quelli dell’App. Il secondo hunk storico `enabledViews` non è introdotto qui.

`mount-classroom.patch` e `s02-navigation.patch` sono artefatti della consegna owner storica: **non riapplicarli** sulla composizione corrente. `verification/vite.proof.config.mjs` imposta soltanto flag e directory di uscita; non trasforma più App, Classroom o il workspace in memoria. Il backend delle prove è `create_app` originale con auth/sessioni/SQLite e identità sintetiche; nessun endpoint di successo simulato.

## Riproduzione

Usare le dipendenze dichiarate dal monorepo, senza modificare lockfile. Python >=3.12 e dipendenze `services/study-api/pyproject.toml`; Chromium Playwright installato. Directory private/evidence fuori da sorgenti e Git; non pubblicare `access.json`, cookie o database. La prova del 26 ottobre usa Node 24.22.1, Python 3.13.16 e Chromium 148.0.7778.96; non sostituisce il gate CI Node 26.5.1.

```sh
# Dalla radice del repository, con il runtime del progetto attivo
npm exec --workspace @ardesia/web -- vitest run src/features/learning-journey/model.test.ts src/features/learning-journey/mount.test.tsx src/__tests__/course-workspace.test.tsx src/__tests__/classroom-course-boundary.test.tsx src/__tests__/session-boundary.test.tsx --maxWorkers=1
npm run typecheck:web
VITE_S20_LEARNING_JOURNEY=1 npm run build:web

# Il normale build Web scrive apps/web/dist.
export S20_PRIVATE_DIR=/absolute/private-s20-fixture
export S20_FRONTEND=/absolute/repository/apps/web/dist
PYTHONPATH=packages/engine:services/study-api:plugins/s19-circuit-lab python -m uvicorn server:app --app-dir apps/web/src/features/learning-journey/verification --host 127.0.0.1 --port 5460

# In altro terminale: stesse variabili, directory di fixture nuova per ogni suite.
export S20_ORIGIN=http://127.0.0.1:5460
export S20_EVIDENCE_DIR=/absolute/s20-evidence
node apps/web/src/features/learning-journey/verification/browser.mjs
# recovery.mjs richiede una seconda fixture vuota e la sua istanza API.
node apps/web/src/features/learning-journey/verification/recovery.mjs
# La prova Escape richiede una sessione non revocata: usare la fixture recovery
# oppure una terza fixture. Il runner journey revoca la propria sessione.
node apps/web/src/features/learning-journey/verification/dialog.mjs
```

L'API di test genera codici soltanto nella directory privata. Il runner li scambia tramite la vera `/study/session`, carica l'App compilata e verifica il consumer montato. `route.fetch()` inoltra il comando al Core prima di interrompere la risposta per simulare la perdita di rete; nessuna risposta positiva viene costruita dal test. L'esito ignoto si ritenta con la stessa chiave. Rifiuti definitivi del POST e conflitti CAS hanno recuperi distinti. La prova Escape invia un solo tasto appena il dialogo è visibile, senza ritardi artificiali o timeout aumentati.

`vite.baseline.config.mjs` e `baseline.mjs` verificano separatamente la main senza trasformazioni S20/S02. Gli input scientifici e le review sono sintetici. Questi runner sono prove funzionali, non test con studenti, ascolto umano o approvazione scientifica.

## Confini di stato

- `model.ts`: checkpoint validato per attore/edizione/pack/step; capacità future tipizzate NOT_AVAILABLE; limite dell'envelope serializzato verificato prima del freeze.
- `coreAdapter.ts`: sola chiamata ai contratti esistenti; CAS, create idempotente, ricevuta legata a submission, edizione, testo, previsione e fonte.
- `useJourney.ts`: bozza nel cache UI di sessione già esistente, con base originale e conflitto esplicito; salvataggio Core prima di lasciare un passo; guardia beforeunload per modifiche non confermate. Nessun archivio browser persistente S20.
- `LearningJourney.tsx`, `JourneyDialog.tsx`: composizione, focus, touch/tastiera, concentrazione, fonte e feedback; riuso PhysicsLab/PoiseuilleModel/SourceViewer/FormulaField/FormulaPreview/PredictionEvidence/Radix.

La posizione ripristinata è il problema/passaggio salvato; lo scroll esatto della pagina non viene sincronizzato. Una bozza non salvata è protetta nella sessione e dal dialogo nativo di uscita, ma non è dichiarata persistita dopo crash del browser. La ricevuta indica consegna; confronto deterministico, aiuto richiesto e verifica del ragionamento sono distinti.

## Capacità disponibili e limiti

`JourneyIntegrations` offre porte tipizzate per memoria, studio autonomo e replay. Gli adapter restano NOT_AVAILABLE finché il contesto corrente non è supportato e provato. S06 è presente nella main composta, ma il pack predefinito `relazioni-fluidi-v1` non ha la proiezione dei quattro corsi S06: il relativo servizio restituisce `independent_study_unavailable`. Non compare quindi un bottone di studio autonomo che condurrebbe a un 404. S20 non propone scheduler/FSRS, secondi tentativi o un’autorità `completed`.

Questo incremento verifica soltanto il contesto canonico Poiseuille in `activityEvidence` (esperienza e passo); la provenienza generica `lessonRef`/fase è un incremento S00 distinto. S03 identifica gli obiettivi e la fonte CoursePack; S06 mantiene comandi/piano/autovalutazione canonici; S17 collega il passaggio registrato e verifica i byte del replay. S01/S18/S19 restano capacità specialistiche degli owner. Nessun bottone annuncia capacità non disponibili. Handoff storico, nuovi risultati e limiti sono separati in `HANDOFF.md`.
