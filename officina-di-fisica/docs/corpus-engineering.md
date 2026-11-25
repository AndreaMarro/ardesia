## Stato operativo — PR #364 in CI, runtime nuovo in rivalidazione

Ultimo checkpoint integralmente validato: 2.048 quesiti DRAFT e 214 attività, generazione 90d05fb5, sulla SHA `5a9a0b8fe700034dc2494fe1fce2223ded89bb50`, runtime f897. [PR #364](https://github.com/AndreaMarro/ardesia/pull/364) aperta e congelata su quella SHA; CI in corso, nessun merge dichiarato. Release 2048 riproducibile/smoke e boundary verificati, SHA256 `a62a386c649b4b90bf40f6e4c233cb3ad21af3135bdcc1dc49eeb144f4130eb5`, zero sorgenti e figure DRAFT distribuiti.

Canone remoto: `831b73fa71076b2e9b363006ffd94a350f22fe90`, PR #363 MERGED, 1.728/204, post-merge 14/14 SUCCESS sui run 45540501792/45540501766. Report versionato. Non confondere il checkpoint della feature con il conteggio già canonico.

ROOT `/private/tmp/cric-resident-integrator`, nuovo ramo `feat/cric-experiment-manual-revisions`. Core 32c6763 integrato localmente nel merge `1db37d69ca3d8006fb53b1d713a32a40f1082212`; attuale runtime `97cd2aba7360c632b8d7421f8ccaaa58c00d8e600c14b67d6b74de13a35bea72`. Il checkpoint 2048 resta storico del runtime precedente finché i gate dipendenti non sono realmente rinnovati. Nessun FP ritoccato. `editorial/reviews/runtime-transition-20261125.json` marca CURRENT_RUNTIME_REVALIDATION_PENDING.

Replay esaustivo in corso con il runner esistente `tests/corpus/browser-batches.mjs`, quattro worker, output `/private/tmp/cric-runtime97-all-ui`, log `/private/tmp/cric-runtime97-all-ui.log`. Il processo verifica tutti i lotti registrati e le 14 edizioni correttive già registrate. Le 9 anteprime118/119/140 sono state davvero rifatte sul 97cd nella worktree core, oltre a12 casi tecnici nel banco reale. La revisione scientifica distinta dei 16 ID di037/038/041 continua in `/private/tmp/cric-experiment-contract-fix`; nuovi verifier non sono ancora nel registro. Originali negativi e test riprodotti su vero Git snapshot f897, non sul runtime nuovo mascherato.

035/036/039/040 richiedono nuova lettura delle dipendenze cambiate, veri replay e report attuali prima del prossimo ETL. I test storici037/038/041 usano ora un fixture autentico isolato; nessuna vecchia asserzione rimossa. Il helper ha 3 test e review tecnica distinta, che segnala correttamente che il test di conservazione confronta banco.js e APP, mentre la costruzione scrive solo nel TemporaryDirectory.

I 112 candidati U4-02 sono tutti salvati sui rami autore. ROOT include 141–147; review incrociata in corso. Piccolo finding 144-11 sulle ipotesi per confrontare intensità: autore deve precisare onde progressive codirezionali e stesso coefficiente, poi rilettura distinta e nuovi hash. Non congelare 144 prima di quel fix. Prossimo ID operativo del checkpoint: `u4-wave-amplitude-energy-01`, 141. Ancora 2.558 quesiti e 171 attività sul checkpoint; nessun nuovo credito dai lavori in corso. Human NOT_RUN, nuove pubblicazioni 0, 93 esami protetti. Mandato aperto.

Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 2.048 quesiti e 214 attività, 25 novembre 2026

Generazione `90d05fb5bd0d0ffda8f110475c4b8af7d923e08987254f670e49ee4ec0476cc0`, manifest `a5aa43a38ec626635c91e45f81de4282b9b9bd2ab8d02be98601a112a3bf2a01`. Tutti i 4.606 quesiti e le 385 attività sono contabilizzati. **2.048 revisioni individuali DRAFT e 214 attività complete**; restano **2.558 quesiti e 171 attività**. U1, U2, U3 e U4-01 revisionati in bozza. Prossimo ID operativo `u4-wave-amplitude-energy-01`, lotto 141, distinto dall’ordinamento lessicografico della coda completa.

I nuovi 160 quesiti U4-01 trattano lunghezza d’onda, eco, periodo ridotto, massimi di velocità/accelerazione, energia, fase spaziale/temporale, intensità sferica ed energia incidente. Autori e verificatori distinti, 245 controprove, 400 configurazioni Hypothesis, ipotesi, unità, conti manuali, inverse e distrattori per ID. Corrette e rilette due motivazioni: il distrattore 36 di 132-15 omette q², e 1/4 in 138-01 omette il fattore p anziché invertire un rapporto uguale a 1. Chiavi/formule/figure e altri record invariati. Le 480 anteprime ROOT finali sono terminate con 0; le 48 di 138 rifatte sul nuovo hash e il vecchio report conservato come superato. Totale 6.186 anteprime valide: 6.144 quesiti e 42 per le 14 nuove edizioni di attività, tutte sul runtime f897.

Fresh e incrementale coincidono. Coesistenza di 2.062 edizioni nello stesso SQLite temporaneo, secondo import senza scritture e tutti i 991 pubblicati/live head/storia/tentativi invariati. Competency graph, diario, ripetizione distinta da trasferimento, autonomia distinta da aiuto e richiamo differito verificati solo su fixture private sintetiche. Nessuna misura di apprendimento reale.

Validazione locale: suite 481 test PASS sul precedente checkpoint 1888, più 11+11 test indipendenti dei nuovi 160 e 3 test della fixture storica (8,065s/2,626s/17,214s). La somma non è dichiarata una singola suite completa sulla 2048: la CI deve eseguire l’intera suite sulla SHA finale. Tutti i lotti scientifici e le integrazioni sono stati rivalidati dalla ricostruzione completa. Il nuovo supporto storico riproduce davvero i difetti f897 dal commit493df79 in un ambiente temporaneo vincolato per hash; nessuna asserzione dei vecchi test rimossa, nessuna firma storica applicata al runtime nuovo.

Il canone remoto contiene 1.728/204: PR #363 MERGED su `831b73fa71076b2e9b363006ffd94a350f22fe90`, head `493df796527bdb31b71f223343384656258e8e3a`, 24 SUCCESS/1 SKIPPED pre-merge e **14/14 post-merge SUCCESS** sui run 45540501792/45540501766, report versionato. Release 1728 SHA256 `a3b377d8f8fc07416d760c440be0ced950aa94f5c8ead1a851e316c3a52f9c4e`, zero sorgenti/figure DRAFT distribuiti. Questo 2048/214 è sul ramo `feat/cric-u3-surface`, ancora da integrare con release e gate della SHA finale.

Core e nuove edizioni sperimentali 118/119/140 restano isolate in `feat/cric-experiment-parameterization`, runtime finale 97cd2aba. Dopo il rilievo del revisore, il banco mostra ora i blocchi nel lettore esistente da Comprendi. 12 casi tecnici reali e 9 anteprime rinnovate sono riusciti; la revisione scientifica distinta delle 16 attività 037/038/041 è ancora in corso. I finding originali restano negativi e immutati. Quando il core sarà integrato, tutte le prove dipendenti dal runtime devono essere realmente rieseguite, senza ritag. U4-02 continua con ownership 141–147 e riformulazioni manuali dei logaritmi, fuori conteggio finché non supera i gate.

Dei 199 vecchi controlli tecnici, 97 hanno ora revisione completa e 102 restano parziali. Mancano 2.558 revisioni complete e 2.456 sole risoluzioni indipendenti: code distinte. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, nuove pubblicazioni 0, 93 domande d’esame protette. Axe e fixture non certificano tutti i criteri WCAG/UDL o apprendimento reale. Mandato aperto: proseguire i contenuti senza attendere l’approvazione umana dei lotti precedenti. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.888 quesiti e 214 attività, 25 novembre 2026

Generazione `447461e5791774c155dcf8058f41b14f2e90a49e92b089a31aeffbdc00bb262e`, manifest `25f072fab56c8510b6a9d190d1ec890415138dc74b1976abe9bb0331dc3f567f`. Tutti i 4.606 quesiti e 385 attività contabilizzati. **1.888 revisioni individuali DRAFT e 214 attività complete**; restano 2.718 quesiti e 171 attività. U1, U2 e tutti gli shard U3 revisionati in bozza. Prossimo ID operativo `u4-wave-wavelength-01`, lotto130; l’ordine operativo per famiglie è distinto dall’ordinamento lessicografico del backlog.

Le 160 nuove revisioni U3-05 hanno autori e verificatori distinti: reti multistadio, colonna accelerata, forza su film, lavoro superficiale, Laplace per gocce e alveoli, surfattante, due gocce, capillarità, distacco e frammentazione.245 controprove, 400 configurazioni Hypothesis e 480 nuove anteprime ROOT con uscita 0. Corrette tre motivazioni: due confronti dimensionali e il prodotto newton per metro nel joule, senza cambiare chiavi. Riletti SVG e ipotesi per ID. Totale 5.706 anteprime registrate sul runtime f897:5.664 quesiti e 42 delle14 nuove edizioni di attività.

Dieci esperienze039/040 aggiunte: moti, secanti, caduta, parabola e accelerazione centripeta, con 118 casi nei consumer effettivi3D/fallback,160 configurazioni di controllo e 489 osservazioni temporali. Radicali semplici documentati mediante limiti razionali, istante di inversione distinto dalla derivata definita. Sono prove indipendenti delle attività originali, non nuove pubblicazioni. Nessun cambiamento di formule, parser o tolleranze in questo checkpoint.

Suite locale tracciata: **481 test PASS in 419,121 s**,75 moduli dello startingHead `ce4eaa150922a747e04b48d2b0d1eedb496384f3`, hash degli input invariati. Inventario, esito e trascritto riproducibile in `editorial/reviews/local-regressions-1888-20261125.json`. Fresh e incrementale coincidono. Coesistenza di 1.902 edizioni nello stesso SQLite temporaneo, secondo import senza scritture,991 pubblicati/live head/storia/tentativi invariati; adattività e diario solo su fixture sintetiche private. La prova130–134 aggiunta dopo lo snapshot ha 11 test mirati PASS in 8,065 s ed è fuori dai 481.

Il canone remoto contiene 1.728/204: PR #363 MERGED su `831b73fa71076b2e9b363006ffd94a350f22fe90`, head `493df796527bdb31b71f223343384656258e8e3a`,24 SUCCESS/1 SKIPPED pre-merge. Post-merge ancora in corso sui run 45540501792/45540501766: non dichiarare già14 PASS. Il canone precedente0970417 ha 14/14 post-merge SUCCESS. Release1728 SHA256 `a3b377d8f8fc07416d760c440be0ced950aa94f5c8ead1a851e316c3a52f9c4e`, zero sorgenti/figure DRAFT distribuiti. Questo1888/214 è sul successore `feat/cric-u3-surface`, da consolidare con i gate della SHA finale.

Le prove storiche037/038/041 restano fuori registro:95°/40° non manuali, separatori delle migliaia non copiabili e frecce con scale incompatibili. Core e nuove edizioni118/119/140 sono isolate sul ramo `feat/cric-experiment-parameterization`. Il revisore ha inoltre trovato che il banco ignorava i blocchi editoriali: corretto riusando il lettore esistente in un pannello disponibile da Comprendi, con 12 casi tecnici effettivi riusciti; revisione scientifica distinta ancora in corso. Il nuovo runtime non è integrato: dopo il merge richiede vera riesecuzione delle prove dipendenti, mai ritag di f897.

Tutti160 candidati U4-01 sono salvati con ownership disgiunta e review incrociata in chiusura. Correzioni dei feedback13215 e 13801 rilette dal revisore; gli altri contenuti e le chiavi non sono stati modificati. U4-02 continua sui112 ID reali nei lotti 141–147;140 è riservato all’attività. Questi lavori fuori registro non aumentano i conteggi del checkpoint.

Dei 199 vecchi controlli tecnici,97 ID hanno ora una revisione completa e 102 restano parziali. Mancano 2.718 revisioni complete e 2.616 sole risoluzioni indipendenti: code distinte. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, pubblicazioni nuove 0,93 esami protetti. Axe e fixture non certificano tutti i criteri WCAG/UDL o apprendimento reale. Mandato aperto; proseguire senza attendere il gate umano di pubblicazione. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.728 quesiti e 204 attività, 25 novembre 2026

Generazione `98e03e39c8eef3963bb2c4e71da88a486601332574c0f9a908ac89cc5b9677fb`, manifest `2445ee1f9604a6b6a13ecd62305e83b42f1af4a0143a6e110cca857479b7f454`.
Contabilizzati tutti i 4.606 quesiti e le 385 attività. Revisioni complete: **1.728 quesiti DRAFT e 204 attività**; restano **2.878 quesiti e 181 attività**, tutte esperienze. U1, U2 e U3-01..04 revisionati in bozza. Prossimo ID del checkpoint: `u3-network-stages-01`, batch `network-stages-120`.

I 160 nuovi quesiti U3-04 coprono svuotamento, trasporto, Poiseuille, reti, dissipazione, profili, Couette e gradiente pressorio. Autori e verificatori distinti hanno risolto ogni ID: 245 controprove, 375 configurazioni Hypothesis, identità fresh/saved, domini, unità, inversi, conti manuali e distrattori. Due motivazioni testuali corrette dagli autori e rilette: una radice attribuita impropriamente a9 e la definizione dimensionale del pascal. Chiavi e formule invariate. I 480 casi browser finali sono terminati con0; due pacchetti rifatti dopo i feedback, con hash nuovi verificati. Totale5.226 anteprime valide:5.184 quesiti e42 delle14 nuove edizioni di attività. Profilo effettivo ancora f897, senza modifiche al runtime in questo incremento.

Sette esempi di copertura034 e tutti i dieci banchi035/036 aggiungono17 attività. Banchi verificati nei consumer reali:32 casi3D/fallback/stati limite,1.423 configurazioni contro oracoli indipendenti,28 esercizi distinti con conti manuali, unità e risposte errate/corrette. Le letture numeriche osservative sono distinte dai calcoli assegnati; radicali semplici possono essere delimitati con quadrati razionali. Il controesempio preliminare del piano è ritirato: la guardia UI già presente mantiene μd≤μs. Claim e correzione conservati, nessun fix runtime o credito prima della review completa. Axe e le fixture non certificano da sole tutti i criteri WCAG/UDL o apprendimento reale.

Suite tracciata: **415 test PASS in197,642s**; inventario dello startingHead `3af76dbd9000898f22708c62fe5cef45eb692fab` in `editorial/reviews/local-regressions-1728-20261125.json`. Fresh e incrementale identici. Coesistenza:1.742 edizioni nello stesso SQLite temporaneo, secondo import senza scritture, tutti i991 pubblicati, live head e storia invariati. Adattività su fixture private sintetiche, non su tentativi reali. Human NOT_RUN; nuove pubblicazioni zero;93 domande d’esame protette.

Prove storiche037/038 aggiunte fuori registro dopo la suite:16 test mirati PASS, senza accreditarne le attività.037 ha3PASS/3FAIL: due roundtrip dei numeri raggruppati rifiutati dall’input, un trasferimento95° non manuale.038 ha2PASS/2FAIL: altro95° e residui trigonometrici mostrati come componenti non nulle agli angoli esattamente ortogonali/antiparalleli. Il primo giudizio0383/1 è archiviato byte-identico e corretto esplicitamente. Questi difetti dei consumer sono distinti dalla correttezza delle leggi e dei valori della fonte. Non sono stati nascosti cambiando etichette o tolleranze.

Il canone remoto contiene1.568/187: PR#362 MERGED su `0970417edf5114b5cede22b12e94e1b5be306919`, head `b469b3b8f7ac0879236b98716b51d1e1a9b8e259`,24SUCCESS/1SKIPPED prima del merge e **14/14 post-merge SUCCESS** nei run45530466030/45530466044, report versionato. Release1568 SHA256 `3240d5e5568270c7993ad521068b95375b9af52452a4785994315bbd105c7a8c`, zero sorgenti/figure DRAFT distribuiti. Questo1728/204 è su `feat/cric-u3-viscosity`, ancora da integrare con i propri gate.

La patch per esperienze è separata in `/private/tmp/cric-experiment-contract-fix`, branch `feat/cric-experiment-parameterization`: nuova selezione didattica opzionale di due input sulla griglia, y sempre dalla legge installata e fisica/references immutabili; formatter copiabile senza punti delle migliaia; zeri geometrici esatti senza soglia globale sulle piccole quantità. Nuove edizioni118/119 ancora da produrre e verificare. La patch non è ancora integrata e cambierà il fingerprint: dopo il suo merge occorre rifare davvero le anteprime, non ritoccare f897 nei report. Il lavoro su039 e le esperienze successive continua.

Dei199 ID con vecchi controlli tecnici,88 sono ora completamente revisionati e111 restano parziali. Code distinte:2.878 revisioni complete mancanti,2.767 sole risoluzioni indipendenti. Le100 revisioni Pro restano NOT_IDENTIFIED. I160 candidati U3-05 fuori registro proseguono con review incrociata; U4-01 ha ownership130–139 e corrisponde a onde, courseC5, nonC3. Ownership non completa ID. Mandato aperto; pubblicazione e vera approvazione umana restano gate separati. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.568 quesiti e 187 attività, 25 novembre 2026

Generazione `dbd3d5d8473091ae0faf2d32ba1f76d001b35fb2540a380df0bd77e62d584ae8`, manifest `e297f6940fed78c6e46634870dbe1459e55c871bf68558075ab01a42c87818bc`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Revisioni complete: 1.568 quesiti DRAFT e 187 attività; restano **3.038 quesiti e 198 attività**. U1, U2 e U3-01/U3-02/U3-03 revisionati in bozza. Prossimo ID da consolidare: `u3-reservoir-emptying-01`, batch `reservoir-emptying-107`. Il mandato rimane aperto.

I 320 quesiti aggiunti rispetto al canone 1248 hanno autori e verificatori distinti, risoluzioni individuali, ipotesi, controlli matematici e dimensionali, inversi, conti manuali e distrattori motivati. Le nuove famiglie comprendono galleggiamento, continuità, reti, pompa, Bernoulli e getti. Due feedback corretti dagli autori e riletti: un distrattore non era descritto dalla divisione inversa indicata e una frase ometteva l’uguaglianza u=−3. Nessuna modifica alle chiavi per eludere il controllo.

Quattro didascalie hanno fallito il reflow mobile: report e schermate NONPASS conservati; correzioni lette separatamente e 192 casi rifatti con uscita 0. I 960 nuovi casi dei quesiti hanno report validi e processi terminati con 0. Totale 4.746 anteprime sul medesimo runtime: 4.704 quesiti e 42 delle 14 nuove edizioni di attività. Formula termica inizialmente troppo larga su 320 px separata in tappe algebriche; fallimento conservato e sei casi rifatti. Nessuna asserzione o regola CSS allentata. Axe non certifica da solo WCAG/UDL o esperienza reale DSA/ADHD.

Le 58 attività aggiunte comprendono 12 lezioni, 40 esempi C4/C5 e sei esempi C6. Sei nuove edizioni correttive: C5-E008, E009, E017, E018 e C6-E003, E004; i rispettivi finding negativi sulle edizioni originali restano visibili, separati dalle prove delle bozze. Sono ora 14 problemi originali e 14 nuove edizioni DRAFT nel registro. Le nuove spiegazioni precisano tensione costante, geometria degli echi, risposte angolari esatte, bilancio termico senza falsa uguaglianza di arrotondamento e ipotesi del sensore. Nessuna edizione storica sostituita.

Suite tracciata: **371 test PASS in 165,423 s**, inventario degli input e startingHead `3e3f7907173254902f304db981eba19966734235` nel report `editorial/reviews/local-regressions-1568-20261125.json`. Le prove originali 034 aggiunte successivamente restano fuori registro e hanno controlli mirati separati. Fresh e incrementale coincidono. Coesistenza: 1.582 edizioni nel medesimo SQLite temporaneo, secondo import senza scritture, tutti i 991 pubblicati, live head e storia invariati. Adattività verificata con fixture private sintetiche, nessuna misura di apprendimento reale.

Il rilievo preliminare sul piano inclinato è stato ritirato: considerava soltanto il risolutore e non la guardia già presente nel consumer. L’handler mantiene μd≤μs prima di ogni solve; default e reset sono validi. Il controesempio diretto è fuori dal dominio raggiungibile del banco. Claim originale, motivazione del ritiro e hash restano tracciati, senza credito di completamento né modifiche al runtime. Proseguire la lettura completa dei consumer, senza inferire problemi di prodotto dai soli limiti dei parametri.

Il canone remoto contiene ancora 1.248/129: PR #361 MERGED su `8a2d7c5abf64753c69cdd8066a9dcc8302e03448`, head finale `d77132ba4a7966ee37a9ac23ef1a40ca28d9168c`, CI post-merge 14/14 SUCCESS sui run 45522773668 e 45522773758. Nessun bypass. Release 1248 SHA256 `0eb025ac3697804558ee11eb81dd8756aa7c14a5a5562c10faeb9d01f672fc5a`, zero sorgenti o figure DRAFT distribuiti. Questo incremento 1568/187 sul ramo `feat/cric-u3-buoyancy` richiede ancora release, PR e CI sulla SHA finale prima dell’integrazione canonica.

Dei 199 ID con vecchi controlli tecnici, 65 hanno ora una revisione completa e 134 restano parziali. Backlog completo 3.038 e sola risoluzione indipendente 2.904 sono code diverse. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, nuove pubblicazioni zero, 93 domande d’esame protette. U3-04 nei lotti 107–116 e le prove di copertura 034 continuano fuori conteggio. Ownership assegna lavoro, non completa record. Proseguire senza attendere firme umane per l’authoring; pubblicazione separata. Le sezioni successive sono snapshot storici.

## Checkpoint corrente — 1.408 quesiti e 169 attività, 25 novembre 2026

Generazione `e2b6b54d3a4f665b5827076a5376e75c6f684e6a0800f24357c6d4eea1008f47`, manifest `afa4c8e8fb1ace0ef48722f55f10f598b86d104e2b1090f95a7979abcac629ef`.
Tutti i 4.606 quesiti e le 385 attività sono contabilizzati. Revisioni complete: 1.408 quesiti DRAFT e 169 attività; restano 3.198 quesiti e 216 attività. U1, U2 e U3-01/U3-02 revisionati in bozza. Prossimo ID: `u3-identical-branches-01`, batch `identical-branches-095`.

Le dieci famiglie 084–093 hanno autori e verificatori distinti, risoluzioni individuali, oracoli, controprove e procedimenti manuali. Quattro didascalie hanno fallito il reflow mobile: report e schermate NONPASS conservati, correzioni rilette separatamente, 192 casi rifatti con uscita 0. Gli altri sei pacchetti hanno 288 casi con uscita 0. Complessivamente 4.251 anteprime valide sul runtime effettivo: 4.224 quesiti e 27 delle nove nuove edizioni di attività. Le scansioni axe non certificano da sole WCAG/UDL o esperienza reale DSA/ADHD.

Dodici lezioni 023–026 e 28 esempi 027–030 aggiungono 40 attività. C5-E008v2 esplicita la tensione invariata nel confronto di potenze sulla corda; il finding originale resta negativo. Nove problemi originali e nove bozze corrette sono registrati separatamente. Fresh e incrementale producono lo stesso checkpoint. Coesistenza di 1.417 edizioni nello stesso SQLite temporaneo, secondo import senza scritture, 991 pubblicati, live head e storia invariati. Adattività verificata su fixture private sintetiche. I controlli mirati passano; suite completa e CI del prossimo consolidamento ancora da eseguire.

Il canone remoto contiene 1.248 quesiti e 129 attività: PR #361 MERGED su `8a2d7c5abf64753c69cdd8066a9dcc8302e03448`, head finale `d77132ba4a7966ee37a9ac23ef1a40ca28d9168c`. CI post-merge 14/14 SUCCESS, run 45522773668 e 45522773758, riportati in `editorial/reviews/ci-postmerge-1248-20261125.json`. Anche PR #360 ha 14/14 post-merge SUCCESS. Nessun bypass. Release 1248 SHA256 `0eb025ac3697804558ee11eb81dd8756aa7c14a5a5562c10faeb9d01f672fc5a`, nessuna sorgente o figura DRAFT distribuita.

Questo checkpoint 1408/169 è sul ramo `feat/cric-u3-buoyancy`, ancora da integrare. I 160 quesiti 095–104 hanno review scientifica e 480 anteprime con uscita 0, ma non sono ancora registrati. Le attività 105/106/117 avanzano separatamente. Ownership U3-04 nei lotti 107–116: assegna lavoro, non completa ID.

Dei 199 ID con controlli tecnici recuperati, 43 hanno ora una revisione completa; 156 restano parziali. Backlog completo: 3.198; sola risoluzione indipendente: 3.042. Le 100 revisioni Pro restano NOT_IDENTIFIED. Human NOT_RUN, pubblicazioni aggiunte zero, 93 domande d’esame protette. Proseguire con 1568 e tutto il corpus senza attendere firme umane per l’authoring. Il mandato rimane aperto. Le sezioni successive sono snapshot storici.

## Checkpoint corrente — 1.248 quesiti e 129 altre attività, 25 novembre 2026

Generazione `08f8b3c9bafed7a706577825ffb37b99b3410438ac7fe03e1d2bb64a68276a24`, manifest `c074bca3b71bca45a5944eef208519246f55f43568d52352f92f1d2ea1bfd3bc`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Sono complete
1.248 revisioni individuali DRAFT e 129 revisioni di attività; restano **3.358 quesiti
e 256 attività**. U1, tutti gli shard U2 e U3-01 sono revisionati in bozza.
Prossimo ID da consolidare: `u3-archimedes-force-01`, lotto `archimedes-force-084`.

I 160 nuovi quesiti U3-01 sono collegati alle competenze e lezioni C2 reali. Le dieci
famiglie 074–083 hanno autori e verificatori distinti, ipotesi fisiche, passaggi
manuali, formule inverse e motivazioni dei distrattori per ID. Le 245 controprove
comprendono chiavi errate con binding e token rinnovati: gli oracoli le respingono
indipendentemente dalla sola firma. Corrette e rilette una negazione non universale
sul segno di un distrattore nel manometro e una frase che impediva erroneamente alla
profondità di variare lungo la colonna. Nessun PASS è basato sulla sola chiave fonte.
L'esposizione accidentale iniziale della chiave fonte di 079-01 è dichiarata nella
nota per ID; il risultato è stato derivato separatamente dal bilancio delle pressioni.

Il compilatore ha rifiutato 27 record concettuali con una nuova etichetta fuori
contratto. Il verificatore ha usato il valore previsto AI_CONCEPTUAL, conservando
le prove fisiche e tutti gli altri campi. Nessuno schema è stato ampliato o giudizio
promosso a EXACT_ORACLE. Nuovo test sul contratto: RED sui cinque report iniziali,
poi GREEN su tutti gli 80 record fresh/saved e sugli stessi pacchetti/binding.
La ripresa non ha contato il lotto rifiutato e ha mantenuto il checkpoint precedente.

La suite tracciata passa **248 test** in 187,420 s. Le 480 nuove anteprime sono
terminate con uscita 0; con i report precedenti validi sul medesimo runtime si
raggiungono 3.768 casi: 3.744 quesiti e 24 delle otto nuove edizioni di attività.
Ogni pacchetto ha isolamento ospite, formule, figure, reflow e controllo axe alle tre
larghezze; questo non certifica da solo WCAG/UDL o l'esperienza reale DSA/ADHD.
Fresh e incrementale producono lo stesso puntatore. Il collaudo comune importa
1.256 edizioni nello stesso SQLite temporaneo, ripete senza scritture e conserva
991 pubblicati, live head e storia. Nessun database o tentativo degli utenti modificato.
Le prove adattive sono fixture sintetiche private, non apprendimento osservato.

Le nuove attività 020–022 completano le lezioni C4 e le prime quattro C5; originali
e figure restano invariati. Otto problemi nelle edizioni originali sono tracciati
separatamente dalle otto bozze corrette: C1-E003, C1-E008, C1-L002, C1-L003, C2-E005,
C2-L007, C3-E003 e C3-E020. Approvazione umana NOT_RUN; pubblicazioni aggiunte zero;
93 domande d'esame protette. Nessuna delle 100 revisioni Pro è stata identificata.
Dei 199 ID con vecchi controlli tecnici, 22 hanno ora una vera revisione completa
attraverso i nuovi lotti; i restanti 177 sono ancora parziali. Il backlog completo
contiene 3.358 ID e quello della sola risoluzione indipendente 3.181: sono code diverse.

PR #360, lotto 960/105, è **MERGED** su `0d9f79696153838f3cc23b1fe6f3aece7dc5fcc8`.
La head verificata era `4490b7025bee534d1e2ed96b14c1e5c3bdce63cd`: 26 check SUCCESS
e uno SKIPPED prima del merge, senza bypass. La fixture web di revoca è stata
corretta dopo il RED reale: target 3/3, typecheck e suite web 893/893 PASS, review
indipendente. Un timeout successivo nel diario WebKit è stato seguito da un replay
locale completo sulle cinque configurazioni, 15 scansioni axe PASS; una sola
riesecuzione del job sulla stessa head è terminata SUCCESS, senza cambiare o saltare
asserzioni. Il timeout iniziale non è dichiarato PASS né si pretende di aver risolto
una causa non riprodotta. CI post-merge ancora in corso: corpus45515730354 e
Officina45515730416. Il canone contiene quindi 960/105, con verifica post-merge da chiudere.
La release 960 ricostruita conserva SHA256
`6c80f034b60ff03c59645e076218156ae973479ae72c65a95d93e7b4f56e6446`;
zero sorgenti o figure DRAFT nel pacchetto.

Questo incremento 1.248/129 e il checkpoint storico 1.088/119 sono sul ramo
`feat/cric-u2-closure`, ancora da integrare con una PR e i propri gate. I 160 candidati
U3-02 (084–093) sono tutti salvati; review incrociate in corso, non conteggiati.
Le lezioni successive 023–025 hanno prove salvate fuori registro e non aumentano129.
L'ownership assegna lavoro, non completa record; l'autorità resta il checkpoint.

Proseguire: chiudere la CI post-merge #360; integrare 1.248/129 sulla SHA esatta;
consolidare 1.408 dopo review completa di U3-02; continuare tutte le famiglie e le
attività residue, senza attendere firme umane per l'authoring. La pubblicazione
resta un gate separato. Le sezioni seguenti sono snapshot storici.

## Checkpoint corrente — 1.088 quesiti e 119 altre attività, 25 novembre 2026

Generazione `c0201cafe7ce3b2d7f9fcea13eff3e257419b5b6d4b9daa6bc19d1711877d1f3`, manifest `f6d246073d29b3aa3ebda873df32dc9821f1e32ecd934a110c1d86f91249279d`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Le revisioni complete
in bozza sono 1.088; le altre attività riesaminate sono 119. Restano **3.518 quesiti
e 266 attività**. U1 e tutti gli shard U2-01..06 sono revisionati in DRAFT.
Prossimo ID da consolidare: `u3-pressure-area-01`, lotto `pressure-area-074` in U3-01.

Le otto nuove famiglie 065–072 coprono coppie di forze, gravità, orbite, discesa con
perdite, lancio elastico, urti e frenata. Autori e verificatori distinti hanno
congelato i singoli candidati dopo le correzioni; 196 controprove verificano anche
chiavi e binding falsificati in memoria. Conservate ipotesi, inversi, unità, passaggi
manuali e lettura fisica dei risultati per ogni ID. Le 14 lezioni aggiunte dai lotti
016–019 completano C3 e le prime quattro C4: 180 controlli esatti, originali invariati.
La controreview di elettrostatica conferma la distinzione tra carica libera e tensione
fissate per i dielettrici e tra conduttore in equilibrio e filo resistivo in corrente.
Le costanti tabulate arrotondate restano distinte dai valori SI esatti, senza inventare
una richiesta di calcolo decimale non presente nella lezione.

La suite tracciata passa **215 test** in 141,629 s. I 384 nuovi casi browser hanno
uscita regolare 0; con i report precedenti ancora validi sul medesimo runtime sono
3.288 anteprime: 3.264 dei quesiti e 24 delle otto nuove edizioni di attività.
Le ricostruzioni fresh e incrementale hanno gli stessi byte del checkpoint.
Nel medesimo SQLite temporaneo convivono 1.096 edizioni: secondo import senza
scritture, tutti i 991 pubblicati e la storia invariati, nessuna pubblicazione o
scrittura su database degli utenti. Le prove adattive sono fixture private sintetiche,
non evidenze di apprendimento reale. Le 93 domande d'esame restano protette.

Restano otto problemi nelle edizioni originali, affiancati da otto bozze corrette:
C1-E003, C1-E008, C1-L002, C1-L003, C2-E005, C2-L007, C3-E003 e C3-E020.
Approvazione umana NOT_RUN; nuove pubblicazioni zero. Le 100 revisioni Pro non sono
identificate; i 199 controlli recuperati rimangono parziali. Il backlog completo ha
3.518 ID, quello della sola risoluzione indipendente 3.319: sono code diverse.

Il canone remoto verificato resta 800/89 su `884c06422a570fc021401285550ad43ab0ecb132`,
con CI post-merge 14/14 SUCCESS. PR #360 contiene 960/105 sulla head
`4490b7025bee534d1e2ed96b14c1e5c3bdce63cd`, ma non è ancora MERGED: il job web ha
riprodotto una corsa nella fixture di revoca della sessione. La sola attesa del test
è stata corretta in una worktree dedicata; target 3/3, typecheck e suite web 893/893
PASS. La review indipendente conferma il fix; è stato pushato e la nuova CI sulla head corretta precede il merge.
Questo incremento 1.088/119 è sul ramo successivo `feat/cric-u2-closure` e richiede
la propria integrazione dopo #360. Nessuna prova locale è chiamata CI post-merge.

I 160 candidati U3-01 sono già salvati: review incrociate in chiusura e 480 nuove
anteprime in esecuzione; non sono conteggiati in 1.088. L'authoring U3-02 è iniziato
con ownership disgiunta su altri 160 ID reali, lotti 084–093. Il terzo revisore prosegue
le lezioni C4. L'ownership assegna lavoro, non completa record: l'autorità resta
`editorial/corpus/checkpoint.json`.

Proseguire senza attendere firme umane: concludere PR #360 con tutti i gate sulla SHA
finale e post-merge; integrare 1.088/119; consolidare 1.248 dopo la verifica completa
di U3-01; continuare U3-02 e tutte le famiglie residue. Le sezioni seguenti conservano
snapshot storici. La pubblicazione resta un gate separato.

## Checkpoint corrente — 960 quesiti e 105 altre attività, 25 novembre 2026

Generazione `debb91ed15d80c101a2c0fa244640b37ad78bfb1f6f70e12e768e0100170de7a`, manifest `36e7878ea400b1e243590d8f22b05948463fc3724775931369e7dcde69c51189`.
Contabilizzati tutti i 4.606 quesiti e le 385 attività:960 revisioni individuali DRAFT,
105 attività riesaminate; restano 3.646 quesiti e 280 attività. U1 e U2-01..05 completi
in bozza. Prossimo ID da consolidare: `u2-force-couple-01`, lotto 065 inU2-06.
I 128 candidati 065–072 hanno già review indipendente e 384 anteprime con uscita0,
ma restano fuori dal registro fino al prossimo incremento 1088. I 160 candidati U3-01
sono assegnati ad autori e verificatori distinti; non equivalgono a revisioni finite.

Le dieci famiglie 055–064 hanno evidenze individuali distinte dall'autore e
controprove su chiavi, binding, ipotesi, formule, unità e figure. Le 16 nuove lezioni
012–015 conservano tutte le edizioni storiche. C2-L007v2 esplicita stazionarietà,
sviluppo completo, dominio Newtoniano e no-slip prima di dedurre la parabola:
un controesempio laminare non stazionario e il controllo dell'integrale su anelli
distinguono questi requisiti. Le altre nuove lezioni termiche016/017 ed elettriche 018
hanno review già salvate, ma non aumentano 105 finché fuori dal registro.

Il collaudo congiunto ha trovato due falsi positivi del correttore: la normalizzazione
casefold confondeva M/m e V/v in opzioni fisicamente diverse. La selezione effettiva
ora conserva l'identità dell'opzione; il fallback testuale vale quando non ambiguo.
RED su tre controprove, GREEN su cinque test e tre test indipendenti, incluso il
consumer HTTP reale con 10 tentativi sintetici temporanei. Verificate 4.042 selezioni
su 241 choice originali e 603 registrate. Nessun tentativo reale è stato ricalcolato.

Il nuovo runtime ha richiesto il rendering di tutti i 65 pacchetti: 2.904 casi,
2.880 dei quesiti e 24 delle otto nuove edizioni di attività, alle tre larghezze.
Un processo 055 si è bloccato dopo i controlli nella pulizia finale: interrotto e
registrato NONPASS; il replay dello stesso pacchetto è terminato con 0. Gli altri 64
sono terminati con 0 nel run congiunto. Evidenza separata in
`editorial/reviews/browser-case-runtime-20261125.json`; nessun vecchio report rietichettato.
209 test editoriali e 18 workflow applicativi PASS. Fresh e incrementale hanno puntatori
identici. Il collaudo comune importa 968 edizioni, ripete senza scritture, conserva
991 pubblicati, live head e storia, non aggiunge tentativi reali o pubblicazioni.
L'adattività è provata con fixture private sintetiche, non con apprendimento osservato.

Otto originali conservano problemi espliciti: C1-E003,C1-E008,C1-L002,C1-L003,
C2-E005,C2-L007,C3-E003,C3-E020. Le otto nuove edizioni restano DRAFT; firme umane 0,
nuove pubblicazioni 0. Pro 100 non identificato; 199 controlli recuperati restano parziali.
Backlog completo 3.646 ID; coda storica della sola risoluzione indipendente 3.447 ID.

Canone verificato: PR #359 MERGED su `884c06422a570fc021401285550ad43ab0ecb132`,
800/89, post-merge 14/14 SUCCESS (corpus 45502678487, Officina 45502678472).
Il lotto960/105 richiede la propria PR, CI sulla head esatta e postmerge.
Le sezioni successive sono snapshot precedenti; prevale questo blocco corrente.

Priorità: integrare 960 con tutti i gate; consolidare 1.088 con i 128 finali U2 e le review
attività già pronte; completare i 160 U3-01 con verifica incrociata; proseguire
sistematicamente tutti i restanti ID, senza attendere firme umane per l'authoring.
Pubblicazione e approvazione umana rimangono gate separati.

# Revisione integrale del corpus

Mandato del proprietario del 24 novembre 2026: 4.000 quesiti Ardesia e 606 Cric,
conservando l'unica applicazione e le sue edizioni, gli esami e i progressi.
La base è `5d1dc8dc`; Ardesia è letto dalla SHA risolta di main, mai da una copia
non identificata. Il registro è uno strumento editoriale offline, non un secondo
archivio degli studenti. Non viene letto da `catalog_seed` e non pubblica nulla.

## Contratto e decisioni

Gli ID Cric restano invariati; quelli Ardesia diventano `AR-<id sorgente>`.
Il contenuto canonico JSON e i file sorgente hanno SHA-256 distinti. Ogni voce
contiene provenienza, hash, stato e verifiche: una vecchia prova vale soltanto per
gli stessi byte normalizzati e per la versione del verificatore identificata.
I confronti semantici producono candidati da esaminare, mai cancellazioni automatiche.
Famiglia comune non significa domanda duplicata: ripetizione e trasferimento vanno
decisi sul compito cognitivo, non soltanto sui numeri.

Il comando costruisce una generazione immutabile in lotti di massimo 100 ID e poi
sposta atomicamente il puntatore del checkpoint. Un'interruzione prima del puntatore
lascia leggibile il checkpoint precedente. Una riesecuzione con gli stessi ingressi
produce gli stessi byte. Un hash diverso invalida le prove del contenuto precedente.
Le attività non questionarie sono contabilizzate separatamente per evitare che
lezioni, esempi, esperimenti o esami sfuggano al vincolo senza calcolatrice.

Le revisioni sono pacchetti `astra/1`, accettati dal validatore e dall'importatore
editoriale già esistenti. Gli ID di competenze, prerequisiti, famiglie e recupero
collegano le nuove schede al sequenziamento e al diario esistenti. Nessuna migrazione
dei tentativi e nessuna nuova authority di pubblicazione. Un'importazione di prova
usa esclusivamente un SQLite temporaneo e non promuove le bozze.

Verifica automatica, revisione AI, approvazione umana e pubblicazione hanno stati
distinti. I manifest non contengono risposte. I pacchetti editoriali offline non
vanno aggiunti a `content/` né serviti da una route HTTP. La presenza di un numero
razionale o della dichiarazione `calculatorAllowed=false` non prova fattibilità
manuale; occorrono un percorso esplicito e un controllo per ID.

## Sequenza eseguibile

- [ ] Recupero verificabile, SHA e checksum; identificare separatamente il lotto Pro.
- [x] Test RED/GREEN: identità, idempotenza, invalidazione, checkpoint, parser sicuro.
- [x] Contabilizzare 4.606 quesiti e tutte le altre attività senza pubblicare DRAFT.
- [x] Ricalcolare le prove recuperate e registrare limiti e copertura individuale.
- [ ] Risolvere e riscrivere ogni famiglia con verificatore indipendente, dimensioni,
  ipotesi, distrattori, aritmetica manuale e asset progressivi quando pertinenti.
- [ ] Importare i lotti nel banco autore, verificare isolamento e adattività.
- [ ] Eseguire suite e CI sulla SHA candidata, revisione indipendente e integrazione
  controllata nel branch canonico; mantenere handoff e lista dei mancanti.

Priorità di rischio: non pubblicare il sorgente DRAFT; non cambiare una vecchia
risposta d'esame; non riusare una prova dopo una modifica; non promuovere un lotto
parzialmente valido; non presentare similarità lessicale come deduplicazione semantica.

La Taste Skill 2.5.1 è stata letta dalla copia recuperata in `taste-v251`;
[sito della skill](https://www.tasteskill.dev/). Qui si preservano il lettore e le
figure scientifiche esistenti. Didascalie e lettura progressiva richieste dal mandato
prevalgono sulle regole di marketing della skill. Playwright e axe-core del progetto
restano i verificatori dell'interfaccia; la loro esecuzione non certifica da sola
WCAG 2.2 AA, UDL 3.0 o l'uso reale con persone con DSA/ADHD.

## Checkpoint corrente — 800 quesiti e 89 altre attività

Generazione `bdd6171e789ceb7c06961ed7f9501545e818e011723291e5664de613c4c627ed`, manifest `9b90da6f221144ab1875116d230f6c19bca22e6609267b2925fe954265feb9bb`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati. Sono completate
800 revisioni individuali DRAFT e 89 revisioni di attività; restano 3.806 quesiti e
296 attività. U1 e gli shard U2-01..U2-04 sono revisionati in bozza. Il prossimo ID
da consolidare è `u2-impulse-01`, lotto 055 in U2-05.

Le dieci nuove famiglie 044–053 hanno verifica distinta dall'autore per ogni ID,
con controprove che sostituiscono chiavi e binding in memoria per isolare il
controllo matematico. Corretti prima del freeze due distrattori equivalenti W/J/s,
una precisazione sul lavoro utile e la competenza primaria dell'energia elastica.
I 146 test editoriali passano. Tutte le 2.421 anteprime sono state riprodotte sotto
il protocollo finale: 2.400 casi dei quesiti e 21 delle sette nuove edizioni di
attività, a 1440, 768 e 320 pixel. Fresh e incrementale producono lo stesso puntatore.

La revisione delle prime quattro lezioni conserva due originali validi e due FAIL
editoriali di severità distinta: C1-L002 confonde il massimo della proiezione con
segno con il suo modulo; C1-L003 descrive come positivi anche gli estremi nulli di
un grafico. Le nuove v2 distinguono concordi/discordi, prodotti e proiezioni, e i
due diversi moti dei grafici x–t/v–t, con calcoli manuali e limiti espliciti. Le
figure storiche sono copiate byte per byte da Git nel pacchetto con tutti gli hash;
i file pubblicati rimangono intatti. Una falsa catena prodotta dallo splitter è
stata corretta prima del freeze usando formule autonome. Una scansione dei 640
quesiti precedenti non ha trovato gli stessi pattern; non è una prova semantica
generale su tutte le formule.

Il browser ora raggiunge ogni figura lazy prima di decodificarla, con deadline di
15 secondi. Il blocco a 320 pixel era nel collaudo delle lezioni lunghe; i run non
terminati sono stati abortiti e non dichiarati PASS. Il cambiamento del test hash
ha richiesto il nuovo rendering di tutti i lotti: non sono state rietichettate le
prove precedenti. Nessun CSS o renderer è stato modificato.

Il collaudo di convivenza usa lo stesso importatore canonico, in lotti di massimo
100, nello stesso SQLite temporaneo: 807 edizioni candidate, seconda importazione
senza scritture, tutti i 991 pubblicati e la storia invariati. Per ogni nuovo quesito
esercita grading e grafo e distingue ripetizione, aiuto, autonomia e trasferimento
differito con fixture sintetiche. Non crea tentativi studenti, apprendimento reale,
firme umane o pubblicazioni. Una lettura incoerente del registro è stata riprodotta
indipendentemente e corretta con uno snapshot unico; tre test e il replay del
controesempio confermano la correzione. La CI ripete il collaudo e confronta il report.

Sette originali pubblicati conservano un problema tracciato: C1-E003, C1-E008,
C1-L002, C1-L003, C2-E005, C3-E003, C3-E020. Le sette nuove edizioni sono DRAFT,
verificate separatamente; nessuna approvazione umana o pubblicazione aggiunta.
Il backlog completo contiene 3.806 ID, la vecchia coda solo indipendentSolution
3.607: i 199 controlli recuperati rimangono parziali. Pro100 non identificato.

PR #358 (640/85) è MERGED su `b919e130c77dd5ab19ca7712e8f37e5c708bc39e`, con
24 check SUCCESS e uno SKIPPED sulla head `73db9b1f0a18add3ee06eb103f98c2ffda6a242e`.
CI post-merge realmente SUCCESS: corpus45496024392 e Officina45496023935, 14 job
complessivi. Anche #357 ha concluso entrambi i workflow post-merge con successo.
Il nuovo incremento 800/89 è su `feat/cric-u2-energy`: PR, CI e merge propri ancora
da completare. I candidati U2-05 fuori registro non aumentano il conteggio800.

## Snapshot precedente — 640 quesiti e 85 altre attività

Generazione `66e0af717843b2f3188e8340e143ee6c10f5c44addb56b53a78c6af8490ac433`; manifest `6473c92448fc78a8e1d2bdcffca404234143d7a34da723b226106d03d25da5e8`.
Il registro contabilizza tutti i 4.606 quesiti e le 385 altre attività. Sono completate
640 revisioni individuali DRAFT e 85 revisioni di attività: restano 3.966 quesiti e
300 attività. U1 e i tre shard U2-01, U2-02, U2-03 sono revisionati in bozza.
Il prossimo ID da consolidare è `u2-parallel-springs-01`, lotto 044 in U2-04.

Le 1.935 anteprime private comprendono 1.920 casi dei quesiti e 15 delle cinque
nuove edizioni di esempi, ciascuno a 1440, 768 e 320 pixel. Ogni pacchetto registrato
ha verifica indipendente per ID, import canonico ripetuto senza nuove scritture e
preservazione dei 991 pubblicati, dei live head e della storia. Tutti i 116 test
editoriali passano; ricostruzione fresh e incrementale coincidono. I nuovi lotti
036–041 includono 147 controprove; due etichette dei pesi intersecate dai piani sono
state corrette dall'autore, rilette dal revisore e sottoposte a 96 nuove anteprime.

Cinque edizioni originali conservano un giudizio negativo esplicito: C1-E003,
C1-E008, C2-E005, C3-E003, C3-E020. Le cinque nuove v2 sono bozze separatamente
verificate. C3-E020 lascia ln 2 simbolico, esplicita il percorso reversibile
immaginato tra gli stessi stati e lo distingue dall'espansione libera reale.
L'aritmetica manuale è documentata, senza pretendere una valutazione numerica del
logaritmo. Nessuna firma umana o pubblicazione aggiunta.

Il nuovo campo additivo `pendingFullQuestionRevisionIds` elenca tutti i 3.966 ID
senza revisione completa; la coda precedente `pendingQuestionIds`, conservata per
compatibilità, riguarda soltanto la soluzione indipendente ancora NOT_RUN. La sua
lunghezza è 3.767: la differenza di 199 sono controlli recuperati ancora parziali,
non revisioni complete. Il test ha riprodotto l'assenza del nuovo campo prima della
correzione e passa sulla nuova generazione. Anche questo selettore è stato riletto
da un revisore distinto. Le 100 revisioni Pro restano non identificate.

PR #357 (544/69) è MERGED su `6ab24b975686fbfc72c1adefdad6845c48b1ce4d`, dopo 24
check SUCCESS e uno SKIPPED sulla head `7bcf2ccbb5266ef6cbd1ec9bef5e244a05859390`.
I workflow post-merge 45493606289 e 45493606308 sono ancora da verificare fino a
conclusione. Il nuovo incremento 640/85 è sul ramo `feat/cric-u2-contact`, con la
propria PR/CI ancora da completare. Non confondere autore, verifica AI, firma umana
e pubblicazione. I candidati fuori registro non incrementano il completamento.

## Snapshot precedente — 544 quesiti e 69 altre attività

Generazione `446c3b28d505045e286a9523cf749bb897e836687c76b735fda01266c3797aff`, manifest `82ee5179209a9583a7dfd2d652a2aaf810db621ef55837c568678df31484d7ff`.
Tutti i 4.606 quesiti e le 385 altre attività sono contabilizzati; 544 quesiti hanno
revisioni complete DRAFT e 69 attività hanno riesame individuale. Restano 4.062
revisioni complete e 316 attività. U1, U2-01 e U2-02 sono revisionati in bozza;
U2-03 ha i primi 64 ID completati. Primo ID successivo: `u2-incline-acceleration-01`.

Le 1.644 anteprime private (1.632 dei quesiti, 12 delle quattro nuove edizioni di
esempi) sono riferite ai pacchetti e al protocollo attuali. Sono stati corretti
cinque testi/formule troppo larghi sui piccoli schermi; una seconda prova ha
localizzato nel prompt di Atwood una sequenza di definizioni senza spazi.
97 test editoriali, 55 Python applicativi, 260 Node e due dei contratti PASS.
Ricostruzione fresh identica all'incrementale, import idempotenti; tutti i 991
pubblicati, i live head e le versioni storiche preservati nei database di prova.

Quattro originali pubblicati conservano un problema esplicito: C1-E003, C1-E008,
C2-E005 (approssimazione idrostatica non dichiarata) e C3-E003 (uguaglianza usata
per un arrotondamento). Le nuove v2 sono DRAFT separatamente verificate. Il calcolo
originale di C3-E003 è manualmente fattibile: il difetto riguarda la precisione
presentata, non una necessità di calcolatrice. Nessuna firma umana o pubblicazione.

Il fingerprint delle prove include ora politiche d'esame e motori installati;
l'harness rifiuta override esterni non compresi nella prova e passa al processo
figlio il percorso assoluto dei motori verificati. Due controesempi indipendenti
sono stati corretti. Tutte le anteprime sono state riprodotte sotto il protocollo
finale; le prove precedenti non sono state rietichettate.

PR #356 è MERGED su `0b5f3a8bce91f1c9aa9ac273829bc6c67e72023c`; entrambi i workflow
post-merge sono SUCCESS (45478253510 e 45478253343). Questo incremento è sul ramo
`feat/cric-u2-orbits`, in attesa della propria PR/CI/integrazione. I candidati 036–041
fuori registro non incrementano le revisioni complete. Le 199 verifiche recuperate
restano parziali; le 100 revisioni Pro non sono identificate.

L'integratore attivo è `/private/tmp/cric-resident-integrator`, checkout dello stesso
repository fuori da iCloud; i due worktree autore residenti hanno ownership disgiunta.
Il vecchio checkout nella workspace è conservato per recupero, non è la copia attiva.
Le ricostruzioni da Git di file offloaded sono state verificate byte per byte; il
backup originale di `config.worktree` non è disponibile e i suoi byte non sono
stati acquisiti. Non dedurre da questo il recupero di artefatti scientifici mancanti.

## Snapshot precedente — 416 quesiti e 45 altre attività

Generazione `ee506766c87603c1be333fb3d4323b65a1346006c0d9b0959614fe8f1eec6f12`:
416quesiti riscritti DRAFT e45/385attività riesaminate; restano4190revisioni
complete e340attività. Sei nuove famiglie021–026 hanno96soluzioni individuali,
verificatori separati dagli autori e288anteprime private terminali exit0. Il totale
è1254casi:1248quesiti e6revisioni di esempi. Le otto attività aggiunte sono
C1-E017..020 eC2-E001..004, con49controlli esatti e sette figure storiche rilette.

I test avversari provano96risposte sbagliate con binding e firme rinnovati soltanto
in memoria: gli oracoli matematici le rifiutano. Le firme congelate rifiutano anche
testi, fonti, asset e forme incomplete. Nessuna prova deriva dalla chiave originaria.
Ricostruzione fresh identica all'incrementale; import idempotenti e991pubblicati/
storico invariati. I due FAIL delle vecchie edizioni E003/E008 restano aperti.

Primo ID successivo `u2-vertical-flight-01` (027); authoring027–030 e031–034 in
worktree isolati non equivale a revisione completata. C1-E021..023 sono ancora da
riesaminare nel file `content/esempi-di-copertura.json`, non nel fileC1.json.
Approvazione umana NOT_RUN e nuove pubblicazioni0. Le sezioni sotto sono snapshot.

## Checkpoint precedente del primo shard U2 — 320 quesiti e 37 altre attività

Completate le ulteriori64schede su medie a tempi uguali, andata/ritorno e primo
arresto: tuttaU1 e tutti i160ID di U2-01 sono ora revisionati in bozza, per320
quesiti complessivi. I quattro nuovi lotti hanno verifica indipendente per ID,
88controprove, import idempotente e192anteprime terminali PASS. Il totale delle
anteprime è966:960dei quesiti e6delle due nuove edizioni degli esempi.

Anche C1-E009–E016 sono stati riesaminati individualmente:8originali validi con
procedure manuali documentate,36controlli e figure verificate; nessuna nuova
edizione necessaria. Le37attività riesaminate comprendono16percorsi/contenitori,
5laboratori e16esempi, due dei quali hanno le candidate corrette v2. Restano
4286quesiti da revisionare integralmente e348altre attività. I due problemi delle
edizioni pubblicate C1-E003/E008 restano espliciti fino al gate editoriale umano.

Checkpoint `fa1bbebaa9e3638a04508c21adcf8bc70d6340e920a5d8a088aece0887c0d8d6`;
le generazioni precedenti rimangono conservate. La prosecuzione parte da
`u2-freefall-speed-01` nello shard U2-02; caduta libera e moto circolare sono
assegnati ad autori distinti, senza contare le candidate in corso come completate.

## Checkpoint precedente U2 iniziale — 256 quesiti e 29 altre attività

La PR355 è integrata in `ba6aec22008f2ac83de4959a6165bac5a8ee0a14`; le run
post-merge Officina45466165934 e corpus45466165896 sono SUCCESS. Il successivo
incremento è sul ramo `feat/cric-u2-first-families`, da integrare dopo la propria CI.

Sono revisionati256quesiti, inclusi96nuovi U2 su moto uniforme, posizione,
velocità media, accelerazione media, velocità finale e partenza da fermo. Autore
e verificatore sono distinti per ciascun ID. Le procedure manuali e le controprove
mantengono distinti componenti con segno, moduli, medie e vincoli fra prove.

Sono riesaminate29altre attività:16precedenti,5laboratori classici e8esempi C1.
Il riesame dei laboratori controlla anche il runtime tramite21configurazioni e131
controlli indipendenti. C2 confronta le letture effettive a quattro cifre
significative:4909/78540 si confronta con1/16 tramite78544 e78540, senza divisione
decimale. Le consegne qualitative non vengono presentate come calcoli numerici.

Due originali non sono certificati senza calcolatrice: C1-E003 conclude con un
angolo decimale da trigonometria inversa; C1-E008 scrive approssimazioni come
uguaglianze esatte e le propaga. Le nuove edizioni v2/base1 sostituiscono quel
procedimento con seno3/5 e coseno4/5 nel primo quadrante, e conπ/5 eπ²/5 nel moto
circolare. La review indipendente approva tecnicamente le candidate DRAFT, mentre
conserva i due FAIL degli originali in `publishedEditionReview`. La pubblicazione
rimane separata: non è dichiarato100%manuale il materiale attualmente pubblicato.

`revisionPackage` estende il medesimo registro delle attività: identità, fonti,
versioni, firme, import e browser sono controllati con gli stessi strumenti.
Ogni nuova edizione conserva i live e i payload storici: nessun dato degli utenti
è stato aperto. La generazione registra esplicitamente le due edizioni pubblicate
problematiche e la coda delle nuove bozze, senza trasformare il loro PASS in un
PASS degli originali. Un test rifiuta proprio tale contraddizione.

Sono passate774anteprime (768dei quesiti e6delle due nuove edizioni) con exit0,
completezza delle formule e figure, decodifica degli asset, controllo degli ospiti,
axe e overflow. Un primo run parallelo era rimasto vivo nel cleanup dopo le
asserzioni ed è stato interrotto con esito1. La correzione chiude esplicitamente
la stdout del server di prova e ne rimuove il riferimento, senza forzare exit0 o
chiudere browser dell'utente. Il successivo run completo termina con16lotti,
quattro worker e zero errori. Corretto anche l'accesso al terzo record, inesistente
nei pacchetti di due esempi. I contratti offline del corpus hanno invalidazione
propria; non invalidano più il lettore, mentre CSS e contratti runtime sì.

Il checkpoint `c0ef6e38483d96d9421d448e7effd2c9eb43ab78291696916f74475d29417e19`
contabilizza4606quesiti e385attività: restano4350revisioni complete e356attività.
HumanApproval rimaneNOT_RUN e zero nuovi contenuti sono pubblicati. La prossima
famiglia da consolidare è `u2-equal-time-average-01`; altri64candidati sono già
scritti e recensiti, ma non contano come completati prima del loro collaudo.

## Checkpoint precedente U1 — 160 quesiti e 16 altre attività

La PR354 è integrata in `f972c972ffdc8d229c2d55dc7cc43b8a335bf5a1` dopo i check
tecnici; la CI corpus post-merge è SUCCESS, mentre il job Officina va riconciliato
con lo stato corrente. La PR353 sui permessi è integrata in `b0642d87` e la sua
CI post-merge è SUCCESS. Le sezioni successive conservano gli incrementi precedenti.

La continuazione completa scientificamente le sei famiglie U1 residue: difference,
perpendicular, scalar-product, vector-product, projection e angle-ratio. Tutti i
160 ID U1 hanno quindi una nuova scheda con soluzione indipendente, ipotesi,
calcolo manuale, distrattori e provenienza; sono nove pacchetti registrati perché
il primo contiene due famiglie. Le bozze restano da approvare umanamente.
Sono passate 480 anteprime a1440/768/320px e tutte le importazioni idempotenti.

Le altre attività ora hanno lotti di verifica nello stesso registro e nello stesso
checkpoint: sei contenitori di corso senza calcoli incorporati e dieci percorsi di
metodo con49 passi. Ogni passo è confrontato con un risultato indipendente; le
cinque inverse sono risolte simbolicamente e le quantità sono controllate con Pint
e frazioni esatte. I contenitori non certificano le attività collegate. Le sedici
edizioni originali restano valide e conservate, senza riscritture inutili.

La generazione contiene le due code di riesame umano: `human-approval-queue.json`
per le nuove schede e `human-activity-review-queue.json` per le attività riesaminate.
ID e hash individuano esattamente ciò che è da approvare; nessuna voce è approvata
automaticamente. Restano4.446 quesiti da revisionare integralmente e369 altre
attività da riesaminare. Pro100 rimane non identificato e199 prove recuperate sono
parziali, indipendenti da questi conteggi. Zero nuove pubblicazioni.

La verifica dell'importatore è estesa anche alle revisioni di ID Cric già esistenti:
il puntatore live deve conservare l'edizione precedente, anziché diventare nullo.
Una controprova crea un'edizione successiva in SQLite temporaneo, la reimporta e
controlla sia il live sia tutti i payload delle versioni storiche. Non è stato
modificato il database di un'installazione reale.

Nel processo indipendente sono stati corretti vettori disegnati con scale diverse
e simboli non definiti nei testi isolati. Le firme sono state rifiutate dopo i
cambiamenti e congelate soltanto dopo nuova lettura. I verificatori e le note per
ogni ID sono persistiti accanto ai rapporti. Primo ID successivo da consolidare:
`u2-uniform-displacement-01`; i candidati U2 ancora in verifica non sono conteggiati
come completati. La review U2 sta correggendo distrattori equivalenti e il testo
di una conversione: non si attende il gate umano per continuare gli altri lotti.

## Ripresa precedente del 24 novembre 2026 — 64 schede e lotti parametrizzati

La PR #352 è integrata in `a599cc8c621ea5c2b8e62834cbe00419b4694b4f`;
i 14 job post-merge sono terminati con successo. Il registro versionato
`editorial/batches/registry.json` identifica i lotti e i loro ID disgiunti.
L'aggregatore scopre i verificatori dal registro, controlla la completezza di ogni
risultato e lega le prove ai byte del pacchetto, alle fonti, agli asset e alla
versione del verificatore. Non dipende dal nome o dalla dimensione del primo lotto.

Le 32 revisioni iniziali sono conservate; `scale-002` aggiunge 16 quesiti sulle
potenze di dieci e `vectors-003` 16 su spostamenti concordi e coordinate.
Sono quindi 64 i quesiti riscritti, 4.542 quelli ancora da revisionare integralmente.
Le 385 attività restano inventariate con riesame `NOT_RUN`. I 199 controlli recuperati
rimangono prove parziali distinte e il lotto Pro di 100 revisioni non è identificato.
L'approvazione scientifica umana resta `NOT_RUN`; nessuna bozza è pubblicata.

La cache riusa soltanto l'aritmetica sorgente quando coincidono fonte, provenienza,
schema ed evaluatore. Famiglia, competenza e giudizi vengono ricostruiti, evitando
che la rimozione di una revisione conservi una vecchia tassonomia. Le prove browser
sono invalidate da cambiamenti al runtime del lettore, al protocollo di prova o
alle dipendenze effettive; sono state rieseguite 192 anteprime su tre larghezze.
Ogni importazione usa SQLite temporaneo, salva il numero registrato di bozze,
non ne duplica alcuna alla ripetizione e conserva identici i 991 materiali pubblicati.

Le controprove hanno rilevato un report di importazione non aggiornato dopo una
modifica al diario degli errori: il gate lo ha rifiutato e l'importazione è stata
rieseguita. Hanno inoltre corretto cache di tassonomia, prove browser non legate
al runtime e accettazione di output scientifici incompleti. Le chiavi concettuali
controllate mediante lettura AI sono dichiarate `AI_CONCEPTUAL`, separatamente dai
risultati verificati tramite oracoli matematici esatti.

Il collaudo dei permessi ha riprodotto un accesso ospite alle figure tramite alias
URL. La correzione è nella PR #353: normalizzazione prima del dispatch e controllo
dell'identità della directory nel fallback statico. Le controprove HTTP verificano
il diniego agli ospiti e la lettura autorizzata sulle medesime varianti. La review
indipendente è tecnica e non costituisce approvazione scientifica umana.

La prosecuzione assegnata è `u1-vector-difference-01`: i successivi 96 ID U1 hanno
ownership disgiunta in due worktree di authoring. I candidati in lavorazione non
sono conteggiati come revisioni verificate. Un unico integratore aggiorna registro,
prove e checkpoint dopo la verifica indipendente.

## Primo checkpoint del 24 novembre 2026 — stato storico della PR #352

Il [puntatore machine-readable](../editorial/corpus/checkpoint.json) identifica
una generazione con checksum, 47 lotti e tutti i 4.606 ID. Le 385 altre attività
sono nell'inventario separato: nessuna è dichiarata senza calcolatrice sulla sola
base di uno screening automatico. `state`, `review` ed `evidence` distinguono i
32 record riscritti, i 199 con prove tecniche recuperate e i record ancora da risolvere.
Le 93 domande d'esame Cric sono contabilizzate con visibilità `protected_exam`.
Zero nuovi record sono pubblicati. La revisione completa resta da eseguire su
4.574 quesiti, oltre al riesame sistematico delle attività non questionarie.

La selezione storica di 199 ID è stata rieseguita dal verificatore nel commit
`5cfbdcb055ba3ba136f97fb56e997f06e6cf3605`, senza copiarne l'implementazione o
importare il generatore. I suoi controlli numerici a campione e le chiavi concettuali
AI non completano la catena scientifico-didattica. Non è stata identificata come il
lotto delle 100 revisioni Pro citato nel mandato. I worktree locali del 21 novembre
e i branch remoti sono stati ispezionati; una lettura di `git status` del vecchio
worktree `recupero-q027` è rimasta indisponibile ed è stata interrotta. Il recupero
Q027 e le edizioni C1/C2/C4/C5 già presenti nel branch canonico sono conservati.

Il [lotto units-001](../editorial/batches/units-001.json) contiene 32 schede
complete e due allegati SVG originali con hash. I calcoli usano conteggi indipendenti
di celle, conversioni SI esatte e sistemi di taratura risolti con SymPy. La review
AI indipendente ha controllato risposte, ipotesi, fonti, distrattori e decomposizione
delle uguaglianze sul pacchetto con digest
`8f23c52cf23aa8103781781e833400353a1fd637951911de7b5dadeac7542e17`.
Il verificatore congela contenuto, provenienza e asset: rigenerare le associazioni
non rinnova automaticamente il giudizio. I giudizi umani rimangono `NOT_RUN`.

I test hanno rilevato e corretto: accettazione del lotto vuoto/parziale, riuso di
cache senza checksum, arrotondamento preliminare di decimali, aggiramento del limite
degli esponenti con underscore, mancato legame alle figure e alla provenienza,
distribuzione involontaria dei sorgenti DRAFT. L'anteprima a 320 px ha rilevato
18 formule troppo lunghe: ora ogni uguaglianza è una tappa leggibile. L'ispezione
axe usa un contesto di test con bypass CSP per l'iniezione del verificatore; la
CSP dell'applicazione resta invariata. Il test prova anche che l'ospite riceve 403
sugli allegati della bozza.

L'importatore resta quello canonico, con un adapter offline da massimo 100 ID e
un savepoint per lotto. Nel SQLite temporaneo il primo import crea 32 bozze, il
secondo zero revisioni, e tutti i 991 materiali pubblicati conservano gli stessi
byte. I file `editorial/` e gli strumenti che incorporano i testi delle bozze sono
esclusi dal pacchetto scaricabile. Nessun database degli utenti è stato aperto.

## Riproduzione

Dalla directory `officina-di-fisica/`, con Git che dispone dei due commit sorgente:

```sh
python3 -m venv var/corpus-venv
var/corpus-venv/bin/pip install -r tools/corpus_engineering/requirements.txt
var/corpus-venv/bin/python -m unittest discover -s tests/corpus -v
npm ci
var/corpus-venv/bin/python -m tools.corpus_engineering.batches
var/corpus-venv/bin/python -m tools.corpus_engineering --source-ref 5cfbdcb055ba3ba136f97fb56e997f06e6cf3605 --cric-ref 5d1dc8dc7b601aef959d10d564c75462be74708d --destination var/corpus-reproduction
cmp editorial/corpus/checkpoint.json var/corpus-reproduction/checkpoint.json
node tests/corpus/browser-batches.mjs
python3 tools/package_release.py var/corpus-release.zip --verify
var/corpus-venv/bin/python -m tools.corpus_engineering.release_check var/corpus-release.zip
```

La costruzione della release legge HEAD, quindi il controllo ZIP va ripetuto dopo
il commit. Il workflow `cric-corpus.yml` ripete questi comandi insieme ai gate
preesistenti del prodotto; lo stato GitHub va letto sulla SHA effettiva. Le prove
locali non sostituiscono la CI né dichiarano una pubblicazione.

## Prosecuzione obbligatoria

1. Consolidare i nuovi lotti tramite PR verso `officina-di-fisica`, completare i gate
   e rileggere la CI sulla SHA risultante. Non eseguire deploy o promozioni editoriali.
2. Continuare da `u2-vertical-flight-01` per famiglie, preservando il legame al
   testo letto e il riesame indipendente. U1 e U2-01 sono già revisionati.
3. Applicare lo stesso protocollo ai4.190quesiti ancora aperti e recuperare
   le prove pertinenti prima di riscrivere. I 199 recuperati hanno ancora fasi aperte.
4. Rivedere lezioni, esempi, esperimenti ed esami; gli indicatori di approssimazione
   sono priorità di lettura, non prova automatica di necessità della calcolatrice.
   Preparare nuove edizioni, mai sostituire le risposte di tentativi storici.
5. Completare revisione umana, verifica d'uso con studenti e pubblicazione controllata
   soltanto dopo le rispettive evidenze. Nessun PASS tecnico vale come firma umana.
