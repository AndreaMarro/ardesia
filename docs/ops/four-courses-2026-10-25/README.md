# Quattro percorsi nello stesso ecosistema — incremento25ottobre2026

Base integrata `64f6206271b218683f4d45cf953d6ee4b9d5f414` (#305). A unico integratore/deployer, ramo breve `codex/a-four-courses-20261025`, nessuna dipendenza da PR aperte. B e ruoloDeepSeek hanno prodotto commit isolati importati con cherry-pick, autori e provenienza conservati. Stato remoto finale e CI saranno aggiunti solo dopo esecuzione.

[Copertura dei quattro corsi](../../../matrici/QUATTRO_CORSI.md):200sotto-obiettivi richiesti,0con tutti i criteri d’accettazione;38famiglie scritte e43lezioni originali DRAFT consultabili nella review protetta. La demo pubblica include5lezioni delimitate, non i corsi interi né la banca4000DRAFT. Nessun contenuto dai kit privati di ardesia-knowledge è stato importato.

## Comportamento implementato

Landing→quattro URL `/corsi/{pathId}/`→lezione→previsione obbligatoria→parametri→modello Core→spiegazione/recupero→problema diverso→quaderno facoltativo solo browser→riapertura senza soluzione. `strumenti-meccanica` include molla e cinematica; gli altri gas ideale, serie/parallelo e onda armonica. Le risposte dopo aiuti restano assistite; assenza di aiuti non dimostra autonomia. Stato locale isolato per corso+lezione+revisione; riferimento obsoleto rifiutato.

Stessa CourseScope in Aula, autenticata da `/study/course-learning?editionId=`: verifica accesso edizione prima di proiettare il pack (teacherowner: fullreview; student: soli esempi delimitati, senza200risposte editoriali) e usa i servizi di consegna/revisione/diario esistenti. Nessuna bozza pubblica letta in modalità autenticata. Ricevuta numerica per pack/versione/digest e retry canonico. Nessun DB/ledger/grader/session authority aggiunto. Non certifica Auth/Storage remoto: i servizi Ardesia identificati su Render sono statici.

I4CoursePack interi rimangono DRAFT in preview protetta, con sequenze38famiglie,12diagnostiche distinte, formulari,200prove finali e recuperi. I problemi qualitativi si possono ragionare e confrontare con soluzione proposta; non vengono trasformati in voti.

## Riproduzione

Runtime del lock e dipendenze già installate; nessuna nuova dipendenza frontend.

```sh
python3 bin/state/project_state.py
python3 bin/web/export_course_learning.py --check
python3 bin/web/export_public_preview.py --check
npm run typecheck:web
npm run test --workspace @ardesia/web -- --maxWorkers=2
PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study services/study-api/tests/test_four_courses_http.py -q
python3 bin/build_teaching_candidate.py --output /tmp/ardesia-public-FRESH
python3 bin/build_teaching_candidate.py --editorial-review --output /tmp/ardesia-editorial-FRESH
```

Output freschi, mai una directory con dati privati. `prepare_vercel_upload.py` rifiuta un manifesto PRIVATE_EDITORIAL_REVIEW senza `--protected-editorial-review`; il flag non imposta targetproduction. Non cambiare SSO né promuovere quel candidato. Il checker di rilascio storico restaBLOCKED per le approvazioni non attestate: nessuna firma sintetizzata.

## Prove e limiti prima del deploy

Web415PASS prima dei due ultimi test RED/GREEN11/11; Core+HTTP719PASS/30SKIP. I conteggi si sovrappongono, non sommarli. TypecheckPASS. Originale fullWeb defaultworkers413PASS/1timeout in session-boundary, test invariato; full2workers415PASS. Causa non stabilita: non chiamato flaky/risolto. CI sulla head finale deve verificare separatamente.

REA reale `ev_1de326b647cd88962ce34d7b84a41bcfbdc7c4bafc77455f8491adc63c5aa715`, captureprocessdei modelli: exit0, bundle JSON conservato. Non è una nuova osservazione UI donor; il transfer corrente riusa i contratti e le prove storiche e introduce implementazioni originali. Costo totaleREA/diretto UNKNOWN (analisi, debug e review non cronometrati). Goodnotes UI e audio docente sono NOT_RUN, non ricostruiti dai soli metadati.

Errori corretti: costanteR arrotondata vsCoreSI esplicitata/corretta; diagnostiche prima riusavanofinali, sostituite con12nuove (RED/GREEN);6prompt non autosufficienti e4item non atomici corretti dopo reviewB; A ha trovato domanda qualitativa nascosta e assistenza non invalidante (RED2FAIL→GREEN11PASS). Scala gas ora derivata dai campioniCore per non tagliare i punti. Nessuna formula scientifica duplicata inTS.

Il vecchio `packages/engine/bin/review.sh` usa account/token ladder e `--dangerously-skip-permissions`: non eseguito, in conflitto col perimetro corrente. Review separataB + root e controprove sostituiscono il meccanismo legacy; non costituiscono approvazione scientifica/editoriale umana.

ReviewB ha riprodotto l’esposizione DRAFT tramite coursepack raw anonimo e course-learning studente; entrambi corretti sul server,4path RED→GREEN. Revoca usa tutte le sessioni del principal, compreso il cookie emesso dallo scambio. Nessuna sicurezza delegata al solo filtroUI.

## Correzioni prima della seconda CI

Retry cinematica→Hooke verificato col vero editor di consegna: parent del modello originale conservato per retry e rimosso cambiando modello. Pendingimmutabile conserva retry esatto. I38passaggi qualitativi sono consultabili, non ancora consegne canoniche dedicate; lessonRef/fase non sono ancora activityEvidence tipizzata (la ricevuta identifica pack/model/parametri). Questi limiti impediscono COMPLETE.

CIiniziale: Engine/Studio/MCP/marketingverdi; problemi veri metadata/login, whitespacePDF/log e dueassertregistry2→6corretti. Ripristinato404coursepackmissing, regredito a409dal binding anticipato. ExportcheckUbuntu ha rilevato differenza; local3.13/3.14/hashseed identici, causa nonstabilita. TrasportoUI esplicito12cifre/sub1e-14→0 con9hashsourceesatti, nessuna modifica della precisioneCore/HTTP; confronto byte rimane esatto. Nuovi17contrattiPASS e4HTTPprivilegiriprodotti indipendentementeB. Non si elimina il gate quando segnala stale.

Teacher E2E corretto per6programmi ma2soleedizioni reali: API/SQLiteveri,1/1PASS in1.1min, back/reload/tastieraa3viewport. Bconsumer15/192,audio5/43,visual3604/4PASSsu3efea7f9; screenshot390/820/1440 letti. Fineaudio naturale8x, seekserverlocale non disponibile; Vercelrange da verificare. Questi risultati restano legati alla versione riportata, non a un futurodeployment.
