# CHIUSURA 1 — Contratto di integrazione
Data: 2026-10-28. Owner integrazione: CHAT 1A. Stato: contratto operativo iniziale, da verificare con i consumer; non attesta il rilascio.

## Lettura dello snapshot finale

Le sezioni baseline e piano conservano la situazione iniziale. Lo snapshot aggiornato delle prove e dei limiti è in [acceptance-matrix.md](acceptance-matrix.md) e [integration-evidence.json](integration-evidence.json). Per main effettiva, CI post-merge, deployment, rollback e disposition delle PR leggere il record terminale della [PR336](https://github.com/AndreaMarro/ardesia/pull/336). Una previsione in un documento precedente al merge non sostituisce quell'esito. Le approvazioni umane restano distinte dalle prove tecniche e tutte le57 accettazioni scientifiche sono ancora false.

## Baseline verificata
- Repository: AndreaMarro/ardesia; main: 85963b1d7e8a8ec14ee3f7353f9c681b3ff208f7. Nessun commit successivo al momento della verifica.
- PR #328: aperta, head fed51cf31d391d2ee0b2f8d7513b14d8c9c075c9; check Web fallito, quindi non integrabile ancora.
- Vercel ardesia-fisica-preview: deployment dpl_AsDQzeYsK66frDhZZfxQCceCjJQR READY, metadato githubCommitSha efd84677c42e0a2af9e8e21e6709bc2692373f9a. Questo metadato non prova l'identità del bundle distribuito.
- Il mandato utente estende la chiusura all'intero corso Fluidi e termodinamica. Poiseuille è riferimento di qualità, non limite del perimetro.
- Il documento decisionale D01–D68 non è ancora disponibile in questo checkout: nessun requisito verrà ricostruito o dichiarato PASS senza il testo.

## Ownership e collaborazione
| Superficie | Owner | Interfaccia |
| --- | --- | --- |
| Shell, navigazione, player, design system, Core/API, sessioni, remoto, consumer, Studio/LessonOS, CI, integrazione e release | 1A | PR piccole con prova sul consumer |
| Contenuti, syllabus, fonti, esercizi, rubriche, assessment, validazione scientifica | 1B | CoursePack canonico e proiezione generata |
| Plugin scientifici, modelli, renderer, scene, asset, preset, test numerici | 1C | SDK/ToolHost e registry esistenti |
Ogni owner usa branch e checkout/worktree isolati da main. Nessuno modifica sottosistemi di un altro owner senza accordo esplicito nel thread/PR. 1A integra; niente push diretti a main. Non si abilita auto-merge. Le nuove interfacce richiedono un consumer reale e una verifica del proprietario.

## Identità e versionamento: riuso obbligatorio
1. Corso e lezione: usare CoursePack in packages/engine/lessonos/study/content e la proiezione CourseRecord/CourseLesson in apps/web/src/courseLearning.ts. Identità corso: pathId e packId; revisione immutabile: {packId, packVersion, packSha256}. Lezione: lessonRef {id, version, sha256}; obiettivi: objectiveIds della baseline canonica, senza rinumerazioni silenziose.
2. Fonte: StudyResource e PostitReference in apps/studio/src/study/contracts.ts, con {resourceId, revisionId, contextId}, proprietario, edizione, visibilità e hash. Una nuova revisione non cambia una fonte citata da un vecchio tentativo.
3. Esperienza: ComposableExperience/ExperienceRef e CoursePackRef in apps/web/src/components/experienceTypes.ts. Riutilizzare compositionVersion e phases; avanzamento receipt-confirmed. La presenza di contenuto o un calcolo corretto non attesta mastery.
4. La proiezione pubblica è generata dalle fonti canoniche; vietato editarla come secondo corso o includere la banca riservata delle risposte.

## Plugin scientifico: una sola infrastruttura
- Riusare manifest, capability e lifecycle in apps/studio/src/sdk/index.ts e dispatch in apps/studio/src/toolhost/simulationPluginRegistry.ts.
- Un plugin o tool dichiara identità stabile, versione, compatibilità SDK, superfici, capability minime e provenance. Nessun registry concorrente, marketplace o caricamento remoto arbitrario.
- 1C propone l'estensione additiva minima del manifest esistente per modello, schema configurazione, preset e schema snapshot. 1A verifica e collega catalogo, player e authoring. Non forzare modelli di fluidi nello schema dei circuiti elettrici.
- Configurazione: parametri tipati, unità SI, dominio, limiti e preset validati; vietati NaN, infinito e fallback che inventano un risultato. Separare parametri/configurazione, stato scientifico e stato UI.
- Snapshot: envelope versionato con tool/plugin id e versione, model id e versione, config/schema version, parametri, stato serializzabile e provenance. Conservare riferimento alla versione esatta nel tentativo tramite le risorse Core. Aggiornamento incompatibile: migrazione esplicita o blocco leggibile, mai reinterpretazione silenziosa.
- Il catalogo è la vista del registry/manifest esistente. Un docente deve poter inserire una configurazione senza copiare codice.
- Nel player il plugin emette solo dati di interazione/risultato. Core rivalida modello, dominio, identità e riferimenti prima di confermare evidenze.
- Le specifiche nuove sono proposte di estensione fino alla loro implementazione e prova; questo contratto non dichiara API già disponibili.

## Spiegazione, esercizio, tentativo ed evidenza
- Collegare corso/lessonRef/objectiveIds, esperienza/stepId, activityId/version, exerciseRef, fonte/revisione e snapshot/configurazione nello stesso contesto di edizione e identità.
- Riusare ActivityCommit, ActivityEvidenceV2Input/ActivityEvidenceV2 e Core submissions/receipts. Non creare un ledger separato dei tentativi.
- Conservare previsione originale, procedimento, supportUsed, vincolo dichiarato, parametri, risultato ricalcolato dal server e verifica. Assistenza usata e correttezza numerica restano distinte.
- Le v1 esistenti continuano a essere leggibili. Le estensioni v2 non cancellano vecchie ricevute o consegne.
- Feedback docente collegato alla revisione della consegna; revisione successiva rende esplicito lo stato storico/stale. Annotazioni come risorse Core e riferimenti versionati, non stato privato del renderer.
- LessonOS: solo eventi consentiti mediati dall'host e graph.query. Il log è autorevole e i grafi sono viste derivate. Vietata scrittura diretta allo storage LessonOS dal plugin.

## Persistenza, autorizzazioni e ripresa
- Riusare studyRequest/apiClient, sessionBoundary, Core resources/revise, submissions, receipts e workspace; riferimento concreto: apps/web/src/features/learning-journey/coreAdapter.ts.
- Identità effettiva riletta con /me, membership attiva e contesto di edizione validati dal server per ogni lettura/scrittura; un ID inviato dal browser non è autorizzazione.
- Scritture con idempotency key quando supportata; revisione compare-and-swap con expectedRevision. Per risposta persa rileggere lo stato autorevole; non sovrascrivere conflitti.
- Separare bozza locale, invio pendente e ricevuta confermata. Sessione scaduta/revocata invalida richieste e risultati tardivi. Due tab devono mostrare un conflitto e preservare la bozza.
- Il checkpoint S20 riusa risorse private versionate Core. localStorage/sessionStorage sono cache, non ripresa remota attestata.
- Non rimuovere synthetic_only. Un collaudo sintetico remoto deve utilizzare un docente e due studenti distinti autorizzati. Il passaggio a identità reali è un gate separato.
- Backup/ripristino verificati con soli dati sintetici su ambiente isolato, con controllo di hash, ricevute e autorizzazioni dopo restore.
- Nessun dato studente reale, cookie, token o segreto nel repository o nelle evidenze pubbliche.

## Consumer e design system
- Un solo player Web e lo stesso catalogo/proiezione; integrare S20 e i laboratori attraverso i consumer esistenti.
- Studio usa il ToolHost, il registry e il salvataggio del proprio embed; authoring riusa manifest/schema/preset validati. Nessun secondo authoring.
- Token e stili comuni posseduti da 1A; 1C li adotta. Contenuto centrale, controlli contestuali, gerarchia tipografica e stati di caricamento, errore, salvataggio e recupero coerenti.
- Target WCAG 2.2 AA: tastiera, touch, focus, alternative testuali/tabellari dei grafici, riduzione movimento, responsive. Evidenza per singolo percorso prima di attestare conformità.
- I 36 PNG originali del 27 ottobre saranno inventariati e ispezionati solo se accessibili. Atlante e screenshot derivati non provano accesso agli originali.
- Rimuovere eLab dai percorsi/dipendenze runtime attive senza eliminare motori scientifici indipendenti o archivi storici legittimi.

## Gate ed evidenze
| Gate | Condizione necessaria |
| --- | --- |
| G0 | Baseline, ownership, contratti e mappa completa syllabus/plugin condivisi nelle PR 1B/1C |
| G1 | Remoto autenticato: docente + 2 studenti, isolamento/revoca, fonti/tentativi versionati, retry, refresh/secondo dispositivo, 2 tab, scadenza, feedback, restore |
| G2 | Tutte le unità del syllabus con contenuti validati, laboratori incorporati e collegamenti raggiungibili |
| G3 | Prove visive, 2D/3D, responsive, accessibilità, prestazioni ed errori sulla build candidata |
| G4 | CI sulla SHA finale, review, preview Vercel protetta, browser, rollback e accettazione; produzione solo dopo autorizzazione e gate |
Ogni evidenza riporta SHA sorgente e bundle, URL effettiva, ambiente, identità sintetiche/ruoli, scenario, risultato, limiti e not_checked. Un HTTP 200/503 risolto o un flag attivo non chiude G1.
Per D01–D68 conservare il testo originale quando disponibile, estenderne l'applicazione a tutto il corso e registrare PASS/FAIL/NOT_RUN/BLOCKED con evidenza. Non sostituire prove mancanti con descrizioni future.
