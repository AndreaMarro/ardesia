# R2: percorso privato reale sul candidato bec05cc

Candidato: `bec05cc8172393b153b7d8ea56ae48f1afa95ef0`, origin locale `http://127.0.0.1:5443`. Node v26.5.1. Browser Chromium locale, dati e identità sintetici. Nessuna modifica al prodotto durante questa prova.

Il percorso docente → Studio → fonte Core → studente idrostatica → recupero/import → correzione → nuova prova → feedback → diario è completato con **55 check combinati PASS**. Restano due difetti UI P2 riportati sotto. Nessuna verifica del diario è stata richiesta: lo stato resta **CANDIDATE**.

## Identità e integrità

- 1607 sorgenti e 759 asset verificati integralmente prima, prima della continuazione e dopo l'intero percorso: byte invariati.
- Source tree SHA256: `726ef9e268e151d7d8f37b1addf84a60490c8074d339185c9853882834aab179`.
- Candidate manifest SHA256: `fcff0d778af80b4790b49a5e6b920edc0f0b6b503a208c051cb2c1b524e4675a`.
- Studio espone il commit esatto in `window.__ARDESIA_BUILD__.commitSha`.
- 239 corpi HTTP di asset osservati corrispondono al manifest; 21 risposte font locali HTTP200.

## Percorso osservato

Login docente e studente03 attraverso la UI con accessi sintetici, senza conservare token, header o stato autenticato. Dall'Aula il docente apre «Pressione e profondità · percorso guidato», poi la lavagna Studio same-origin. Apertura e annotazione non avviano la cattura né pubblicano una fonte. Il consenso e il gesto Registra sono espliciti.

La registrazione usa un tono originale WebAudio a 554,365Hz attraverso MediaRecorder nativo. Non è una voce né una prova del microfono hardware. Lo stop attende il drenaggio e rilascia tutte le tracce. Il docente collega una reale annotazione e invia il passaggio all'Aula; solo la spiegazione scritta originale e la conferma esplicita pubblicano una fonte di gruppo Core. Il testo dichiara che l'audio contiene un tono di prova; non viene presentato come trascrizione vocale.

Il docente ascolta il replay e vede l'oggetto collegato. I byte effettivi del media riprodotto hanno SHA256 `85769c342eb92696704614518df64343fb7323e86c9aab3a2f6cd7cf49bc8470`, uguale al descriptor. Esporta quindi il bundle canonico .lesson, conservato esclusivamente nel work privato.

Lo studente apre il percorso in un browser indipendente e seleziona la coppia esatta resourceId/revisionId della fonte. Dopo la previsione errata recupera la revisione autorizzata. Il link da solo mostra «Registrazione non disponibile»: non distribuisce i byte. L'importazione esplicita del bundle nel nuovo browser ripristina oggetto e media con lo stesso digest. La riproduzione è manuale.

## Quattro ricevute Core persistite

| Passaggio | Previsione Pa | Risultato Pa | Aiuti dichiarati al servizio | Esito numerico |
| --- | ---: | ---: | --- | --- |
| relativa, prima consegna | 2000 | 19620 | NO_SUPPORT_REQUESTED, nessuno | errato |
| relativa, correzione collegata | 19620 | 19620 | SUPPORT_REQUESTED: lesson-passage, model-result | corretto |
| assoluta | 120945 | 120945 | NO_SUPPORT_REQUESTED, nessuno | corretto |
| trasferimento | 114335 | 114335 | NO_SUPPORT_REQUESTED, nessuno | corretto |

Tutte conservano la stessa fonte di lezione e unità Pa. La correzione ha parentId della prima consegna; previsione e procedimento originali restano nella ricevuta precedente. Il risultato è nascosto prima della consegna. Le etichette sugli aiuti descrivono richieste e risultati osservabili dal servizio, non assenza di aiuti esterni o padronanza certificata.

Il tutor ritrova la consegna errata e pubblica un feedback scientifico manuale. Lo studente lo rilegge sulla propria consegna originaria. Il tutor seleziona una citazione dell'originale consegnato e crea un'osservazione model-selection nel diario. Il thread restituito e poi riletto è CANDIDATE/UNVERIFIED, senza esercizio assegnato, tentativi di verifica o stato VERIFIED_RESOLVED.

## Provenienza dell'esecuzione e limiti

Il primo run conserva 38 check prima di un errore del runner: confrontava un pin resourceId/revisionId con un source_ref che comprende anche contextId. L'osservazione era già stata creata correttamente. Il raw con passed:false resta intatto; il confronto è stato corretto nel solo runner e la continuazione legge lo stato persistito, senza ripetere registrazione o quattro consegne. Il risultato combinato conserva originalRunnerFailure.

Zero pageerror e zero console error/warning. Due GET /study/me sono stati annullati dalla navigazione immediata del runner dopo il login; sono conservati come ERR_ABORTED, non cancellati dai risultati. Nessuna richiesta di comando o media è fallita. Le schermate selezionate non hanno overflow orizzontale della pagina; questo non elimina il difetto di inquadratura del canvas riportato sotto.

Questa è una prova locale funzionale e di provenienza, non una misura di prestazioni, un test hardware, una prova di apprendimento o una verifica remota della beta. Costo totale e costo provider: UNKNOWN; non sono state invocate inferenze o API vocali.

## F1 — P2: replay dopo restringimento del viewport

Riproduzione: aprire il replay importato a1440px, ridurre a390×844, attendere due requestAnimationFrame. Il rettangolo dell'oggetto collegato è x520,09/y372,19/w399,80/h145,59: fuori dal viewport. «Inquadra contenuto» lo riporta a x33,47/y279,16/w323,03/h119,67, leggibile; audio continua a funzionare. Prima/dopo inclusi. Il listener resize di ReplayView chiama fitScene immediatamente; questa è una causa plausibile da verificare dal proprietario Studio, non un fix applicato qui. Fonte: apps/studio/src/ReplayView.tsx:100–108.

## F2 — P2: affordance di verifica guidata sbagliata per Hydro

La card del CANDIDATE Hydrostatic mostra «Verifica e prepara il prossimo passo», benché l'assegnazione Hydro guidata non sia supportata. Work passa baseActivity(data.edition), poiseuille-v1 per fluidi, a Diary; Diary passa lo stesso activityId a tutte le card e mostra il builder per activityId non-null. Fonti: apps/web/src/features/Work.tsx:48–51 e apps/web/src/features/Diary.tsx:184–188,400–408. Non è stato aperto o inviato alcun comando di assegnazione/verifica: non si attribuisce al backend l'accettazione di una prova sbagliata. La creazione e la rilettura del CANDIDATE manuale richiesto sono riuscite.

## Selezione

Questa cartella contiene solo riepiloghi sanificati, hash degli asset osservati e schermate della UI con dati sintetici. Il bundle .lesson originale, le fonti raw, gli accessi e lo stato autenticato sono esclusi. I raw del primo run e della continuazione restano nel work privato. selection-manifest.json identifica i file selezionati; non include se stesso.
