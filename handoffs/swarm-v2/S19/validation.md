# Validazione S19 — prove e limiti

Base Ardesia `a00f2f40091aecf69e58ebaba42cf70d748e4066`; motore installato `b35a8b5da0616f00a7764397bda0e6b95aca3c95`. I log sotto evidence si riferiscono ai sorgenti della tranche e alle correzioni dichiarate; non certificano la main integrata o un backend remoto.

| Prova | Esito osservato | Fonte |
|---|---|---|
| Package Kirchhoff editable e HEAD effettiva | PASS; installato0.1.0 al pin, nessun solver copiato | plugin-install.log, test_adapter.py |
| Divisori indipendenti, KCL/Ohm, topologie limite/export upstream | 87 PASS | upstream-focused.log |
| Adapter, input/claim bounds, vero Core/HTTP, CAS/retry, revoca/isolamento e review→LessonOS; regressioni Core storiche sulla patch esatta | 90 PASS,1warning di deprecazione Starlette/httpx | python-final.log |
| Browser reale in finestra esclusiva concordata con S00 | 22 PASS in30.3s, Chromium desktop1440×1080 e touch emulato390×844;1worker, soglie5000/45000 invariate | browser-exclusive-slot.log, desktop/touch-circuit.png |
| Contratto host controllato/401 indipendente da Entry | PASS nei22 casi, con gate di risposta; ricezione/revoca reali, solo401 specifico iniettato | test host sotto web/tests |
| Build/typecheck e licenze | PASS prima della chiusura,27runtime/type notices; audit npm0vulnerabilità | web-core-client-build.log, npm-audit-current.json, dependency-provenance.json |
| Patch S00 sui file condivisi | git apply --check PASS; prove runtime su copie temporanee dei moduli reali, non sui file condivisi | integration.patch, consumer.patch, compose_candidate.py |
| Ultima estensione disponibilità del motore | input/note preservati e nessun esito riusato; test nuovi predisposti, esecuzione finale demandata alla CI S19 per rispettare il rilascio slot a S00 | test_unavailable_engine..., test_missing_engine..., lab.spec.ts |
| CI/merge/mount principale/remoto | Da leggere sulla head esatta della PR; nessun DONE o deploy attestato da questo documento | PR e handoff README |

## Fallimenti conservati

- Primo setup: uv rifiuta editable Git URL; corretto acquisendo checkout sparse immutabile e installando da percorso. Primo pytest senza pytest installato è errore d'ambiente, non RED scientifico.
- Prima composizione: StudyStore non implementa context manager; fixture corretta con try/finally. HTTP prima dell'installer:2FAIL, poiPASS.
- Prima build: dichiarazioni CSS mancanti; aggiunto vite/client. Primo audit: Vite8.0.12 vulnerabile, sostituito solo nel lock S19 con8.3.5;0vulnerabilità.
- Browser primo giro8PASS/2FAIL: eliminando un nodo rimaneva un layout riferito al nodo assente. Pulizia dei layout e regression test, nessuna guardia backend rimossa.
- Review fresca: vedere REVIEW.md e review-red.log/browser-review-red.log. Guardie input, salvataggi concorrenti, idempotenza e riapertura del procedimento corrette. KCL su circuito rifiutato prima valid_so_far: refused-kcl-red.log; ora non valutabile senza solved.
- browser-review-first-fix:18PASS/2FAIL; il test movimento non selezionava il nodo con Enter e non provava alcun movimento. La controprova ora richiede bounding box diversa; non è stato indebolito un requisito di prodotto.
- browser-transfer-red è fixture con sessione già revocata. browser-transfer-actual-red riproduce il difetto vero del riferimento Core riusato dal transfer, poi corretto con nuova identità del documento.
- browser-final.log conserva timeout con stato Operazione in corso e forte rallentamento concorrente (i90Python durano121.75s rispetto13.39s degli87precedenti). Solo processi propri fermati. S00 concede finestra dopo rilascio S18/S17/S20: gli stessi22casi passano in30.3s. Questo confronto sostiene l'effetto del carico, senza cancellare i FAIL o attribuire ogni latenza a una causa universale.

Limiti: touch emulato, nessun device fisico/Safari/WCAG completo; nessun pilot umano; backend di prova SQLite con identità sintetiche, nessun ACL remoto attestato. La fixture di indisponibilità è failure injection, non un motore differente realmente distribuito. Le risposte derivate non sono certificazioni di persona/procedimento. I warn use-client del bundler e deprecazione httpx sono conservati, non filtrati come PASS scientifici.

Controllo igiene iniziale: git diff --check rileva spazi finali nello stdout upstream conservato. Le viste testuali sono normalizzate solo per spazi finali; i byte originali delle prove interessate rimangono integralmente in evidence/raw-log-evidence.tar.gz. Errori, conteggi e soglie non alterati. Il primo commit è rimasto nella storia; correzione additiva, nessuna riscrittura.

## Delta CI e controprova sulla provenienza

CI sul commit a6be7b9202ba0f2644a2eb1659d5cb877e96e03e:35PythonPASS3.10s,24browserPASS18.2s,27notices,0npmvulnerabilità ([run40360688622](https://github.com/AndreaMarro/ardesia/actions/runs/40360688622)). I test di indisponibilità sono quindi eseguiti e verdi in quellaCI. Successiva correzione della copertura dei path CI:184e27829d93c21e9978915445c7f4793369f007, nessun cambiamento runtime.

Il successivo finding ASTRA sulla cache timestamp richiede una nuova head e prova distinta: test_loaded_source.py esegue il controesempio sul package installato e il controllo protetto con partitore8V;2PASS0.64s in loaded-source-counterprobe.log. Il confine ora compila byte confrontati con i Gitblob e congelati, con rifiuto del preimport. Le precedenti attestazioni SourceSnapshot-only sono superate. La CI completa deve essere riletta sulla head successiva; nessun vecchio verde ereditato.

## Ripresa dopo interruzione — 26 ottobre 2026

Verifica remota completata sulla head implementativa `f80dc4d2998d83ff8f7c4fd3116bd75c5021873c`, PR325 ancora draft. Il [run S19 40365882911](https://github.com/AndreaMarro/ardesia/actions/runs/40365882911) dichiara quella head e prova il merge sintetico `4119739` con la base `a00f2f40091aecf69e58ebaba42cf70d748e4066`: **37 Python PASS, 1 warning, 1.96s; 24 browser PASS, 12.7s; 27 notices verificati; audit npm 0 vulnerabilità**. Sono inclusi i due test source/pyc e le regressioni di indisponibilità. I sette controlli richiesti della PR sono SUCCESS; anche marketing ed e2e advisory sono SUCCESS. Estratto dei log e snapshot dei risultati in [ci-f80dc4d-summary.json](evidence/ci-f80dc4d-summary.json).

Questa evidenza sostituisce l'attesa CI riportata sopra solo per `f80dc4d`; conserva i risultati delle head precedenti nel loro perimetro. SourceSnapshot da solo non garantisce i byte caricati: la correzione effettiva verifica i Gitblob, congela i sorgenti e compila quei byte evitando la cache pyc, con rifiuto del preimport non controllato. L'enunciato SourceSnapshot-only precedente nel README è superato da questa correzione.

La ripresa non avvia test pesanti locali: nessun runner/server S19 attivo e porta5198 libera al controllo. Questo aggiornamento è solo documentale e additivo; la CI della sua eventuale nuova head deve essere riletta separatamente. Patch per i file condivisi ancora da comporre da S00; nessuna prova di mount main, merge, deploy, revisione scientifica umana o Product Verified.

## Cambio della base durante la ripresa

La successiva head documentale `5e080e3ed6ce5798bda2ca25cee92fc8e6934674` ha S19 FAILURE nel [run40371391113](https://github.com/AndreaMarro/ardesia/actions/runs/40371391113): il checkout CI `cc6b538` compone con main `e95a80b393589b71da2846aa98814dc1a034b730`, successiva alla base a00. La collection abortisce in conftest con exit4 perché `integration.patch` non si applica ad app.py535. La nuova registrazione science_library fra calendar e static mount interrompe il contesto della patch. Nessun test scientifico o browser viene eseguito da questa lane; nessun verde f80 trasferito alla nuova composizione. [Log e metadati del failure](evidence/ci-5e080e3-failure.json).

S00 conferma che la composizione della PR309 modifica ancora lo stesso blocco installer e richiede di attendere il proprio candidato immutabile. Nessuna modifica alla factory/Core, al solver o al composer; guardia di applicabilità invariata. Il prossimo riallineamento riguarda solo patch e handoff S19 sulla base fissata da S00, seguito da CI completa della nuova composizione. Nessuna nuova esecuzione pesante locale.

## Preparazione locale sul candidato S00 fissato

S00 fornisce il candidato immutabile `9da49952491445b93349e3f7b7f75bb9e323e074` della stessa PR309, ancora da integrare in main, e autorizza solo preparazione locale di patch/handoff. I tre hash del manifest `handoffs/swarm-v2/S00/study-composition-manifest.json` coincidono con i file letti da quel commit; app.py ha SHA256 `c7bd8da7f46f8b3201944c763f90f36ea4c6719f90795f9637a4aa72f514ab26`.

Controprova leggera su copie del candidato: la vecchia patch fallisce su app.py535; la patch locale aggiornata usa il contesto esatto `science_library` e installa S19 subito dopo, prima dei mount statici. `integration.patch` e `consumer.patch` superano ciascuna check, applicazione e check inverso; i tre moduli Python composti superano la compilazione sintattica. [Evidenza e hash degli input/output](evidence/patch-candidate-9da4995.json). Il consumer patch non richiede modifiche. Nessun apply fuzzy o allentamento della guardia del composer.

Queste prove attestano solo applicabilità e sintassi, non runtime, browser, disponibilità remota o integrazione di309. Nessun test pesante locale; nessun file condiviso modificato, commit o push di questo riallineamento. Il push325 rimane sospeso fino alla main309 effettiva comunicata da S00; poi rileggere SHA/base, verificare gli input e richiedere la CI completa della nuova composizione senza ereditare i verdi storici.

## Verifica esplicita con S00 prima del push condizionato

Su richiesta del proprietario, riletti GitHub e S00: PR309 ancora OPEN/DRAFT, mergedAt e mergeCommit null; main effettiva `e95a80b393589b71da2846aa98814dc1a034b730`. S00 conferma che prepara una successiva head locale `50b07bea0859000e0ba697a9e1fb684afb6d14f5`, con app.py invariato, e che comunicherà main solo dopo i gate corretti e il merge. Le prove di questa futura head riferite da S00 non sono riesecuzioni S19. [Stato e conferma conservati](evidence/main309-status.json).

La condizione per pubblicare il riallineamento325 non è soddisfatta. Conservati patch locale su9da e failure precedente; nessun commit/push, test pesante locale o nuovo verde S19 dichiarato. Resta necessario ricontrollare la main effettiva, aggiornare il handoff e leggere la CI della nuova head325 dopo il push.

## Main309 integrata: riallineamento S19 da pubblicare

S00 comunica il merge309 e GitHub lo conferma alle18:40:03Z del26ottobre2026: main `d7dc3917d695c80d027c91df21577e06ec649232`, genitori e95a80b e080e39b7, tree `e1f625187eb196cdc5b7b6b30948e9dddc2a5c2f`. [Prova del merge](evidence/main309-merged.json). La precedente condizione di attesa è quindi soddisfatta. Il run post-merge40379757071 era appena accodato alla comunicazione S00: nessun suo verde viene presunto.

Riletti via GitHub i file di questa main esatta: tutti i tre hash del manifest S00 coincidono; app.py conserva il SHA256c7bd8da7 già verificato sul candidato9da. Su copie temporanee di catalog.py, context.py, app.py e Courses.tsx, entrambe le patch superano check/apply/check inverso; i tre moduli Python composti superano la compilazione sintattica. Installazione S19 dopo science_library e prima dei mount statici, consumer invariata. [Hash e controlli della main effettiva](evidence/patch-main-d7dc3917.json).

Il commit di riallineamento riguarda soltanto patch, handoff ed evidenze S19. Runtime/solver, composer, file condivisi e lock comuni restano intatti; nessun test pesante locale. La lane S19 e tutti i gate richiesti vanno ora letti sulla nuova head325 e sul suo merge checkout effettivo. Il failure40371391113 e i verdi storici rimangono conservati nei rispettivi perimetri; la presente prova leggera non li sostituisce con un PASS runtime implicito.
