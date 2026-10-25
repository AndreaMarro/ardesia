# Quattro microcorsi Fisica: incremento integrato, completezza ancora da raggiungere

|Corso|Accettazione completa / richiesti|Lacune principali|Stato|URL pubblico|
|---|---:|---|---|---|
|Strumenti e meccanica|0/52|Verifica per target, consegne qualitative, approvazione e continuità remota|DRAFT;2esempi pubblici|https://ardesia-fisica-preview.vercel.app/corsi/strumenti-meccanica/|
|Fluidi e termodinamica|0/57|Stesse lacune; gas ideale non copre il corso intero|DRAFT;1esempio pubblico|https://ardesia-fisica-preview.vercel.app/corsi/fluidi-termodinamica/|
|Elettricità e magnetismo|0/33|Stesse lacune;2resistori non coprono magnetismo/reti arbitrarie|DRAFT;1esempio pubblico|https://ardesia-fisica-preview.vercel.app/corsi/elettricita-magnetismo/|
|Onde, ottica e radiazioni|0/58|Stesse lacune; onda armonica non copre ottica/radiazioni|DRAFT;1esempio pubblico|https://ardesia-fisica-preview.vercel.app/corsi/onde-ottica-radiazioni/|

Il mandato dei quattro corsi **non è interamente completato**. La matrice conserva200obiettivi derivati dal syllabus e38famiglie editoriali; non sostituisce200con4demo. [Copertura per corso](../../../matrici/QUATTRO_CORSI.md), [200schede aggiornate](objective-evidence.json), [snapshot precedente conservato](../../../handoffs/deepseek/2026-10-25/coverage-200.json). Raggiungibilità editoriale verificata non significa spiegazione sufficiente, approvazione o autonomia dello studente.

## Risultato utilizzabile

Landing→quattro URL→lezione→previsione→parametri→risultato Core→spiegazione/esempio/trascrizione/audio→problema diverso→quaderno facoltativo locale→refresh con risultato nascosto. Meccanica contiene molla e cinematica; gli altri esempi sono gas ideale, serie/parallelo e onda armonica. Le risposte dopo aiuti restano assistite; nessun aiuto richiesto non prova autonomia. Le bozze sono separate per corso/lezione/revisione, con rifiuto dei riferimenti obsoleti; non sono sync docente o voti.

La [review completa protetta](https://ardesia-fisica-preview-t4tqijqvx-andreas-projects-6d4e9791.vercel.app/corsi/) contiene43lezioni (38famiglie DRAFT +5esempi),12diagnostiche nuove distinte dai200finali, formulari e recuperi. Tutte43lezioni sono state percorse nel browser remoto:38ragionamenti qualitativi mostrano una risposta proposta DRAFT, non un voto automatico. P2: unità vuota rende «Unità richiesta: .» nella sola review; correggere prima dell’erogazione completa. Le clip sono4passaggi originali sintetici, con testo equivalente; ascolto umanoNOT_RUN. Goodnotes7.1.30 osservato solo nei metadati: nessuna prova UI/replay Goodnotes6.

In Aula, le edizioni associate ai quattro pack sf-* caricano lo stesso CourseScope autorizzato dal Core. I cinque esperimenti numerici inviano consegne/ricevute canoniche. La review completa è disponibile al docente proprietario; lo studente riceve solo gli esempi consentiti; anonimo401, altro docente/peer403. Nessun DB/ledger/grader/session authority aggiunto. Le38lezioni qualitative non hanno ancora una consegna canonica dedicata né lessonRef/fase come activityEvidence tipizzata: la ricevuta attuale conserva pack/model/parametri. La preview statica protetta non è una beta Core remota autenticata.

## SHA, distribuzione, PR

Base main64f6206271b218683f4d45cf953d6ee4b9d5f414. Prodotto verificato05d2bc9911aff3862906ac5a71769bc726dfbcea. Branch brevecodex/a-four-courses-20261025, unica [PR306](https://github.com/AndreaMarro/ardesia/pull/306), zero dipendenze da PR aperte. B e ruoloDeepSeek hanno consegnato commit isolati importati con provenienza; A unico integratore/deployer. Nessuna nuova PR di pianificazione o doc.

Produzione `dpl_7BQB2RrpkNdAsFgQ4MktHgfdnS1z`, pubblico anonimo200. Preview degli stessi5esempi `dpl_6sdaKh2borKNRb1k4Pwhzh87uU93`; fullreview `dpl_4tSUVdLjeyQpVqY6eNKF9G1abXp7`. Entrambe le Preview restanoSSO; accessi temporanei revocati e file privati eliminati. [Autorizzazione delimitata/digest](limited-public-authorization.json), [28asset/18route/policy/5range206 anonimi](https-production.json). Il checker storico resta releaseBLOCKED per le approvazioni non attestate: nessuna firma inventata e nessuna promozione dei kit/banca. Il mandato adottato autorizza solo gli esempi originali verificati.

**Esito terminale e CIpostmerge:** leggere il [registro di integrazione aggiornato sullaPR](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404424520). Questo documento viene committato prima del merge e non ne anticipa l’esito. I commit successivi al prodotto05d2 aggiungono soltanto prove/memoria; source inventory applicativo identico verificato prima del push finale.

## Prove riproducibili e limiti delle misure

CIprodotto [40240420368](https://github.com/AndreaMarro/ardesia/actions/runs/40240420368) SUCCESS e pr-contract40240420265SUCCESS: Web418PASS; Engine2757PASS/29SKIP; API1070PASS/18SKIP con PostgreSQL reale; Studio2304PASS/5SKIP; MCP23PASS. Suite sovrapposte non sommate. PubblicoE2E11PASS e teacherE2E1PASS, con back/reload/tastiera e pinobsoleto conservati. Marketing separato05d2 era in attesa dell’installazione browser: non dichiarato verde; stesso codice marketing era verde su3efea7f9. Stato successivo va riletto.

ReviewB remota: consumer15/15 e192controlli, audio5/5 e47controlli, editoriale43/43 e415controlli; diagnostiche12/finali200 raggiungibili. Produzione anonima:15/192 e4audio smoke/24. Zeroerrori console/pagina/rete rilevati. Screenshot360/390/820/1440, focus/tastiera/riduzione movimento/font; non certificazioneWCAG/Safari o ascolto umano. Prove in `handoffs/codex-b/evidence/`.

[WorkflowHTTP locale](workflow-local.json):5modelli,4edizioni, ricevute/retry, proposta privata, pubblicazione di un TUTOR SINTETICO, prova diversa rev2, diniego peer/altro docente, coldreopen su nuovo store e revocaPASS. Non è approvazione umana dei contenuti e non è prova remota Auth/Storage. Il primo runner effettuava troppi scambi login ed è stato respinto429; corretto usando quattro client con cookie jar distinti, senza cambiare il limiter.

```sh
python3 bin/state/project_state.py
python3 bin/web/export_course_learning.py --check
python3 bin/web/export_public_preview.py --check
npm run typecheck:web
npm run test --workspace @ardesia/web -- --maxWorkers=2
PYTHONPATH=packages/engine:services/study-api python docs/ops/four-courses-2026-10-25/verify-workflow.py
python3 docs/ops/four-courses-2026-10-25/build-objective-evidence.py
python3 bin/build_teaching_candidate.py --output /tmp/ardesia-public-FRESH
python3 bin/build_teaching_candidate.py --editorial-review --output /tmp/ardesia-review-FRESH
```

Solo output freschi. `prepare_vercel_upload.py` rifiuta il markerPRIVATE_EDITORIAL_REVIEW senza flag esplicito; il flag non imposta production. Mai promuovere il candidato editoriale. `verify-course-https.py` usa il manifesto prepared esatto; gli access file, se necessari, restano locali0600 e non inGit. Nessuna nuova dipendenza frontend.

Prestazioni:3navigazioni pulite per gruppo, Chromium1440x950 su questoMac senza throttling. Mediane stesso percorso molla, vecchio→nuovo: TTFB23.9→24.2ms, DCL159.5→154.9ms, FCP216→216ms; JSBrotli78663→79515byte, CSS14476invariato. Nuovo corso separato: JS115711/CSS16040byte, FCP188ms. Campione piccolo, non benchmark di capacità o smartphone. Nessuna conclusione di risparmioREA: costo totaleUNKNOWN.

REA realmente eseguito: `ev_1de326b647cd88962ce34d7b84a41bcfbdc7c4bafc77455f8491adc63c5aa715`, captureprocess sui4modelli exit0, bundle conservato. Non nuova osservazione donorUI completa; implementazioni originali, transfer storici e licenze conservati. Dopo interruzione della sessione MCPREA non era più esposto e reaCLI non era nelPATH: nessuna registrazione/installazione globale o nuova esecuzione inventata.

## Correzioni e residui

Review indipendente: diagnostiche riusate sostituite con12nuove;6prompt resi autosufficienti;4item finali corretti per obiettivo/dati/minimo;200item riletti e83ricalcolati indipendentemente,317controprove separate. RootRED/GREEN: domanda qualitativa nascosta e aiuto che non invalidava commit, esposizione DRAFT anonima/student via coursepack, retry fra cinematico e molla. Gate severi conservati. Trasporto UI12cifre/sub1e-14→0 con9hashsource esatti: precisioneCore/HTTP invariata; causa precisa dello staleUbuntu iniziale non isolata, non chiamato flaky. Vecchio singolo timeoutsession-boundary causaUNKNOWN, test invariato. PDF classificato binario con byte/xref intatti; EOFlog puliti;404missingedition ripristinato; assertionregistry2→6 corrette conservando2soleedizioni reali.

Oggetti scientifici bundledfirst-party, non ancora plugin installabili/revocabili viaToolHost. RenderMyWorkspace identificato con soli2staticiArdesia: remotoStudyAPI/Auth/Storage/backup non certificato, nessun servizioELAB riusato automaticamente. FSA live resta disabilitato; MCPwriter non implementato.

Atto umano necessario: revisione scientifica/editoriale per target e revisioni effettive dei quattro corsi e ascolto delle clip. Non basta approvare una card o il titolo dellaPR. Prima di quel passaggio e del percorso remoto completo, mantenere DRAFT/INCOMPLETE e approvazioni false.

## Rollback

Ripristinare tramite Vercel il deployment pubblico precedente `dpl_8aUFbXrEZKpAjf8vRj1wBmK8fyfr`, progetto `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`, team `team_23uD0RgdInaTaOPEL0EGltup`; poi verificare anonimamente route/asset del manifesto precedente. Nessun rollbackDB o migrazione richiesto. Non pubblicare la previewfullreview e non togliereSSO. Main non auto-deployaStudio: policy Git invariata.
