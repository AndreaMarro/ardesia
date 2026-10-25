# R2 — REA D e Taylor canonico

Missione D conclusa su CircuitJS reale, poi trasferimento originale al Taylor già esistente. Il controllo Voltage5→2.5V aggiorna correnti50→25mA e5→2.5mA. Il negativo tastiera non cambia il valore; a390px il controllo non è azionabile. L’Evidence mobile resta **incomplete**, senza reinterpretarla come successo. I3ID/digest e limiti sono in `D-evidence-ledger.json`; il ticket a13campi è `D-transfer-ticket.json`.

Nessun codice/solver/asset donatore trasferito. Le fonti primarie e la decisione GPL observe-only sono nel ticket. Raw Evidence, DOM e PNG donatore restano in work. Il comportamento Taylor non è stato osservato nel donatore: è adattamento originale concordato prima del codice (`contract-approved.md` è la registrazione successiva della decisione).

## Prodotto e verifiche

Ownership limitata a TaylorLab.tsx, nuovi TaylorPlot.tsx/CSS, taylor.py e relativi due test. Il Core usa lo stesso calcolo Fraction del polinomio/bound per punto selezionato e41campioni; exp è solo riferimento numerico Core. Il browser valida e proietta coordinate, senza exp/polinomi o nuovo solver. Risposta legacy senza plot resta numericamente consegnabile e dichiara il grafico indisponibile.

- `taylor-core-red.log`:4FAIL → `taylor-core-green.log`:90PASS (4nuovi+86esistenti).
- `taylor-ui-red.log`:9FAIL → `taylor-ui-final.log`:13PASS (12nuovi+classroom1), `taylor-typecheck-final.log`:PASS.
- `taylor-benchmark-{base,final}.json`:7×1000valutazioni x=.5/n8, CPU locale mediana0.1223→1.9423ms; JSONcompatto539→6784byte. Non è latenza HTTP né costo monetario.
- `product-ui-run4/result.json`:26/26PASS su Webdev5440/API5441 reali, solo student-02 sintetico. Login UI,3POST canonici per grado0/3/8,41punti/curve diverse, tastiera n7→8 senzaAPI, x2/n1.5 invalidi senza quartoPOST, nessun overflow a360/390/820/1440, reducedmotion/zeroanimazioni,4hashprodotto immutati. PNG esclusivamente nostro prodotto360/1440.

La prova browser è **runtime dev**, non artefatto statico finale, beta remota o approvazione scientifica. Nella fase Taylor zero errori JS/console; il preludio del login conserva il401 previsto e richieste abortite dalla navigazione, senza un claim zero-errori globale. Nessuna consegna persistente di studente inviata. Nessun token, cookie, accessfile, DB o trace autenticata conservato.

Storia del raccoglitore preservata: run1 attendeva Aula dopo login che va intenzionalmente aToday; run2 intercetta502 durante restart controllato API del coordinatore; run3 completa19check poi legge testo dentro details chiuso. Corretto solo runner; run4 usa pannello aperto e fasi esplicite, senza modificare prodotto o aumentare timeout. Questi non sono RED prodotto né conteggi aggiuntivi di funzionalità.

La fascia SVG interpola i bound campionati; non certifica un inviluppo continuo fra punti. Lo scarto floating-point rispetto a exp non dimostra il resto. Approvazione umana NOT_RUN/DRAFT; touch fisico, apprendimento, PG/remoto, fieldINP/fps e costo token/USD **UNKNOWN/NOT_RUN**. Full suite/artefatto finale restano al coordinatore.

## Review indipendente C (read-only)

Letti i6file C congelati: learning_experiences.py, learning-compositions-v1.json, test_learning_experiences.py, route learning-experiences di app.py, test_learning_composition_http.py, experienceTypes.ts. Nessun edit prodotto C.

`test_C_independent.py` / `C-independent-review.log`:3PASS con SQLite nativo. Mutazione hint senza versionbump cambia SHA e rifiuta atomicamente il pin; concorrenza evidence1legacy/evidence2ratio usa la stessa fence assistenza; unitàerrata resta errore distinto, retry conserva ricevuta e nuovo tentativo resta assistito, peer isolato.

`test_C_huge_prediction.py` / `C-huge-prediction-red.log`:1FAIL indipendente conservato. Il nuovo scalar accetta l’intero JSON finito10**1000 fino a math.isfinite, che solleva OverflowError invece di StudyError422. Nessuna scrittura/bypass; il pattern ratio legacy è preesistente e distinto. Fix e regressione permanente assegnati dal coordinatore al proprietario C; il probe resta immutato per riesecuzione.

Chiusura successiva C: il proprietario ha aggiunto `_finite_prediction_number` con protezione OverflowError e regressioni HTTP scalar/ratio legacy. Riesecuzione indipendente dello stesso `test_C_huge_prediction.py` immutato: `C-huge-prediction-green.log`1PASS; RED originale conservato. Inventario6file C post-fix e SHA del probe in `C-reviewed-source-hashes.json`. Nessun finding aperto entro questo scope; non equivale a una review di ogni file del prodotto o a un test PG/remoto.
