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
