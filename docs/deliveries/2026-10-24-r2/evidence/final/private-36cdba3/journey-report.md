# R2 finale privato — 36cdba3

Il percorso completo **docente → Studio → fonte Core → studente Hydro → recupero/import → correzione → nuova prova → feedback → diario** è passato in una sola esecuzione con student06: **56/56 check**. La regressione nativa separata del replay passa **21/21 check**. Tutti i dati sono sintetici; nessuna modifica al prodotto durante le prove finali.

## Candidato e integrità

- Commit: `36cdba353401c80b92cc94f256b106238c7610f8`.
- Origin locale: `http://127.0.0.1:5443`; Nodev26.5.1, Chromium locale. Browser plugin assente: riusato Playwright richiesto.
- 1608/1608 sorgenti e 759/759 asset verificati integralmente prima e dopo il percorso e prima/dopo la prova nativa: byte invariati.
- Source tree SHA256: `8a9497d14b2b6d507bce3683452f2cb26fe09915396a423ad148037d8d2d1a42`.
- Candidate manifest SHA256: `0aef183a20dea2c85c879cf14b58c54043aeee2d4264a2b0aa76b93f75a20f5c`.
- Studio espone il commit esatto in window.__ARDESIA_BUILD__.commitSha. I203 corpi HTTP di asset osservati corrispondono al manifest;17 risposte font sono locali HTTP200.

## Fonte di lezione reale

Login docente e studente tramite UI ordinaria e verifica dell'identità Core, senza conservare token, header o storageState. Dall'Aula il docente apre il percorso «Pressione e profondità · percorso guidato», poi Studio same-origin. Annotazione e cattura da sole non pubblicano fonti: il consenso, la registrazione e l'invio del passaggio sono gesti espliciti; nell'Aula servono una spiegazione scritta e la conferma di condivisione separata.

MediaRecorder nativo cattura un tono originale WebAudio a554,365Hz. Non è una voce o una prova del microfono hardware. La spiegazione manuale originale dichiara che l'audio è un tono di test, quindi non viene spacciata per trascrizione vocale. Lo stop drena il recorder e chiude tutte le tracce. Il replay riproduce i byte con digest `a13e634f1dc373c5645836fa239ec0d3484cf39de21e322f0076cfe759d5e641` e evidenzia l'annotazione esatta.

La fonte Core pubblicata è una revisione di gruppo; tutti i quattro tentativi conservano lo stesso resourceId/revisionId. Lo studente apre la revisione esatta autorizzata. Il link nel browser indipendente mostra inizialmente «Registrazione non disponibile»: nessuna distribuzione remota dei byte viene inferita dal descriptor. Esportazione e importazione esplicita del bundle canonico ripristinano il medesimo oggetto e lo stesso digest del media. Riproduzione sempre manuale; bundle raw escluso dalla selezione.

## Quattro ricevute reali

| Passo | Previsione Pa | Risultato Pa | Assistenza registrata | Controllo numerico |
| --- | ---: | ---: | --- | --- |
| relativa iniziale |2000|19620|NO_SUPPORT_REQUESTED; nessun supportUsed|errato|
| correzione relativa |19620|19620|SUPPORT_REQUESTED; lesson-passage, model-result|corretto|
| assoluta |120945|120945|NO_SUPPORT_REQUESTED; nessun supportUsed|corretto|
| trasferimento |114335|114335|NO_SUPPORT_REQUESTED; nessun supportUsed|corretto|

Il risultato resta nascosto prima della previsione. La correzione punta alla consegna iniziale con parentId; la ricevuta originale resta immutata. La lettura degli aiuti riguarda richieste e risultati osservabili dal servizio, non padronanza o assenza di aiuti esterni.

Il tutor ritrova il procedimento errato, pubblica un feedback scientifico manuale e propone nel diario una citazione dell'originale consegnato. Stato verificato dal servizio: CANDIDATE/UNVERIFIED, senza nuova assegnazione, tentativo di verifica o VERIFIED_RESOLVED. La card Hydro non offre più il form guidato Poiseuille e spiega il confine della verifica manuale.

## Ricaricamento del lavoro: limite osservato e provato

Nella stessa esecuzione student06, «Il mio lavoro → Consegne e feedback» viene aperto prima della pubblicazione del tutor. La riga non contiene ancora feedback; resta uno snapshot anche dopo la pubblicazione dall'altro browser. Un **ricaricamento esplicito del browser**, seguito dal ritorno a «Consegne e feedback», mostra sulla stessa consegna il testo esatto restituito dal tutor. Screenshot prima della pubblicazione, prima del reload e dopo sono selezionati. Non si dichiara aggiornamento in tempo reale.

## Fix replay mobile: RED → GREEN

Sul precedente bec05cc il rettangolo dell'oggetto a390px restava x520,09/w399,80, fuori schermo dopo1440→390; «Inquadra contenuto» lo recuperava. La regressione unit osserva fit1440 anziché390 prima della patch. Un secondo RED390→0 prima del frame pendente osserva un fit errato a0. Log RED conservati.

ReplayView ora osserva i bounds effettivi del canvas, ignora/cancella il fit sui bounds0, rinvia il fit dopo il layout e cancella observer/entrambi i frame su nuova lezione o unmount. Stessi bounds, pan/zoom, scrub e progressione audio non avviano fit automatici. Focused4file33PASS e typecheckPASS.

La prova nativa usa il bundle reale esportato sul precedente candidato, importato da UI in un browser anonimo:1440→390→820→360→1440 e apertura diretta390. L'oggetto resta dentro il canvas senza premere Inquadra; tempo e media restano invariati. Nel journeyfresh06 la nuova registrazione prova lo stesso fix: a390px rettangolo x33,47/y279,16/w323,03/h119,67. Un pan nativo via wheel viene osservato e conservato durante rerender e avanzamento audio. La preservazione zoom è coperta al bordo componente; non si presenta come prova nativa di una gesture zoom.

## Salute e provenienza dei tentativi

Finale06: zero pageerror, zero console error/warning. Due GET /study/me annullati con ERR_ABORTED durante navigazione sono conservati e distinti; nessun comando o media fallito. Nativo: zero pageerror, console error/warning e richieste fallite. Schermate finali senza overflow orizzontale della pagina.

Prima del run finale restano, senza sovrascrittura:

1. `journey-36cdba3`: attesa generica networkidle scaduta nel login, prima di registrazioni/consegne/fonti/diario. Causa dell'attività di rete UNKNOWN; non si attribuisce al prodotto o al carico. Attesa rimossa dal solo runner, nessun timeout aumentato.
2. `journey-36cdba3-run2`: student05,43check e4ricevute; stop sul feedback ancora assente nello snapshot Work. `reload-05-36cdba3` chiude61check combinati read-only. Il browser originale era stato chiuso: il prima è la schermata/DOM conservata, il dopo un nuovo login+reload; non è il run continuo finale.
3. Prove storiche bec05cc: selezione17file invariata, manifest4c0b5b8171f5d4de2b15969ecfd57c5e9de3ab029c9313564e4b0c7403d82016;55check combinati appartengono a quel candidato, non a36cdba3.

Il run completo56check appartiene solo a student06. La sola fixture aggiunta è membership fluidi tramite il helper Core add_test_member, su token sintetico già esistente. Nessuna consegna05 è stata duplicata o cancellata.

## Riproduzione e limiti

Runner nel work privato: run-replay-viewport.cjs e run-r2-final-fixed.cjs. Richiedono esplicitamente ARDESIA_EXPECTED_SHA, ARDESIA_CANDIDATE_MANIFEST, ARDESIA_PRIVATE_UI_OUT; il journey richiede ARDESIA_DEMO_ACCESS e un attore sintetico nuovo/membro. Il nativo richiede un bundle esportato e descriptor sintetici privati. Credenziali, bundle, fonti raw e stato autenticato non sono selezionati.

Questa prova riguarda il runtime locale sul candidato identificato. Non è verifica remota della beta, misura di prestazioni, prova hardware o apprendimento certificato. Costo totale/provider: UNKNOWN; nessuna inferenza o API vocale invocata. selection-manifest.json elenca hash dei file selezionati, escluso se stesso.
