# S04 — acquisizione CAS, addendum 26 ottobre 2026

Questo documento aggiunge il secondo incremento. Non modifica gli esiti e i limiti del batch precedente (commits e5e0d64/62231df, HANDOFF/VALIDATION storici). Il mandato comune allegato integra S04: stessa PR310 e stesso namespace, nessun nuovo Core o grader. Base aggiornata con merge ordinario di main8e0737b1, merge locale9e0cf0b4.

## Decisione e confronto

| Candidato | Identità/provenienza | Capacità/obblighi | Decisione per questo incremento |
|---|---|---|---|
| Cortex Compute Engine | npm0.152.0, gitHead cdabf49318f13bfca08f644d2514aecbd51ad69f; MIT con LICENSE nel tarball | Parser LaTeX/MathJSON, aritmetica esatta e numerica, semplificazione, algebra, derivazione; worker senza servizio | **ADAPT**, calcolo del revisore e fogli privati Core. Non acquisire compile/Assign/grader/identità. Motore distinto dal generatore SymPy, senza asserire indipendenza matematica di ogni algoritmo. |
| SymPy, TARGET-084 | 1.14.0 già pinned in bin/content/physics_bank/requirements.txt; tag annotato2f9c274d→commit16fa855354eb7bcabd3fe10993841e03b1382692; LICENSE BSD3+notices verificata nel tag | CAS completo già usato per generare le risposte; parser sympify/parse_expr richiede attenzione perché usa eval | **REUSE esistente** build-time; **DEFER** endpoint per input non fidato. Ripetere lo stesso motore non è controprova distinta. Nessun server CAS aggiunto. |
| Numbas/JME, TARGET-047 | tagv11.0→commita179b4290c76eb104b3943b81975531af314739a; Apache2 LICENSE blob261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64 | Runtime maturo di assessment con JME, marking ed esami; test upstream QUnit/Node documentati; NOTICE e dipendenze da esaminare se adottato | **DEFER** acquisizione assessment completo: sovrappone tentativi/marking già Core; JME candidato successivo per regole di dominio/distrattori, da provare come adapter senza ledger. Non installato o testato qui. |

Registry139 consultato: TARGET-047/048/049/081/084/109. MathLive081 già presente0.111.1 e riutilizzato, stessa pipeline asset/font e nessuna nuova autorità. PrairieLearn048, STACK049 e Doenet109 sono ulteriori confronti di architettura, non tre adozioni dichiarate. Cortex non risultava presente: proposta di delta per S12/S15, senza assegnare o alterare ID comuni.

Fonti primarie: https://cortexjs.io/compute-engine/api/ ; https://docs.sympy.org/latest/modules/parsing.html ; https://github.com/numbas/Numbas/tree/v11.0 ; https://docs.numbas.org.uk/en/latest/development/runtime.html . Consultazione S12/S15 e contratti effettivi nei commenti6405671200,6405704247,6406015138 della306; nessuna risposta o delega presunta.

## REA realmente eseguito

Skill utilizzata: `/Users/andreamarro/.agents/skills/reverse-engineer-anything/SKILL.md` (v42 letta prima dell'analisi). Tool analyze_javascript_application sul pacchetto npm installato isolatamente, due percorsi distribuiti: dist/esm-min/compute-engine.js e math-json.js. Parametri: timeout30s/source, heap256MiB, max2500nodi/1500unknown. Main entrypoint distribuito rinvia a chunk-FISE6MIP e chunk-6FECZNSW: l'integrazione usa il pacchetto intero con i chunk, non copia soltanto l'entrypoint.

Evidence parent `ev_87d050e62901613a1e4d2b25441efd694016d1922689efb80835c86959d31132`, vista `ev_d1d984ea2a07d1504f15de340f40e57228a51d62b28503c7dc441013370b3f0a`. Provider vista rea-analysis-view1; il profilo del parent è conservato nell'export, non si attribuiscono provider nativi a questa analisi JS. `rea-summary.json` conserva digest e limiti. Export completo6.142.778byte nella cartella work isolata, non nel Git. Analisi statica **parziale**, 493file fuori scope e capacità unknown1500 raggiunta; nessuna conclusione di esecuzione o assenza di rete dal solo grafo. Nessun target nativo aperto; nessuna sessione binaria da chiudere. Dopo l'interruzione gli strumenti REA sono stati rimossi dalla sessione: non si inventano ulteriori catture.

Per conoscere semantica/versione reali, i probe Node del distribuito sono più pertinenti di decompilare altri megabyte: x/x→1 perde dominio; Assign cambia engine condiviso; sqrt(x²)→Abs(x); 1/3+1/6→1/2. `donor-probes.json` conserva replay controllato. Errore corretto: API0.152 usa form:'raw', non la vecchia opzione canonical:false. I test finali usano la API dichiarata corrente.

## Codice riutilizzato e closure

Pin proposto @cortex-js/compute-engine=0.152.0, integrity sha512 nel lock; complex.js2.4.3 MIT; @arnog/colors0.7.3 MIT dichiarata da metadata, gitHeadc0ced913c05f14abd60ac9a0bcc076b53eeda63b. `resolved-closure.json` riproduce pin/resolved/integrity esatti. Install isolata con ignore-scripts, nessun modifica al node_modules condiviso. LICENSE CE e complex.js copiati integralmente nel NOTICE servito dal consumer. Il tarball colors non include LICENSE/copyright e il repository dichiarato ha risposto404: limite conservato, titolare non inventato. La dichiarazione SPDX MIT del publisher è la prova disponibile. Nessun test o asset upstream ricopiato sotto copyright Ardesia.

Codice originale necessario: allowlist MathJSON prima di canonicalizzare, budget e terminazione worker, restrizioni esplicite, binding alla fonte, UI accessibile, serializzazione e revisioni Core. Non è un CAS originale; delega parser/semplificazione/calcolo/derivata al motore maturo. Non quantificato alcun risparmio moltiplicativo. Test upstream completi **NON_RUN**; contratti e probe discriminanti propri più E2E del consumer sono le prove pertinenti eseguite qui.

## Integrazione e limiti

AssessmentQuality monta lazy il laboratorio dalla coda docente. MathLive0.111.1 è un editor reale con fallback LaTeX. Motore solo in worker dedicato: 15s carico, 2,5s lavoro sincrono, terminate su fine/errore/annullamento/unmount; motore nuovo per job, nessun token nel worker. Linguaggio aritmetico puro e limitato, input512caratteri, AST160nodi/profondità16, esponenti numerici≤128, valori≤10¹²; niente compilazione o Assign. Risultati sono segnalazioni matematiche, mai voti o approvazioni. Restrizioni di denominatori/radici/log/tangente prima di semplificazione, elenco dichiarato parziale; nessun teorema di uguaglianza globale o verifica automatica delle unità.

Risorse `assessment-quality-worksheet-v1` private nello StudyStore esistente, create/get/revise standard; nessuna tabella/API/login/ledger parallelo. Binding bankId/questionId/version/SHA; accesso docente e fonte riconfermati prima di calcolo/save. Riapertura dalla revisione corrente Core; risultati persistiti ignorati e calcolo da ripetere. CAS delle revisioni preserva bozza su409. Nessun localStorage/IndexedDB parallelo. Vecchi fogli rimangono consultabili, nuova fonte richiede nuovo foglio. Nessuna nuova controprova dei2.151 numerici non verificati viene dichiarata per il solo fatto di avere il laboratorio.

File shared: patch concreta manifest+lock separata, richiesta a S00 prima di applicazione; adapter quality API precedente ancora da montare nella factory produttiva. Harness locale usa la factory e auth/store reali con il solo hook esplicito già consegnato. Merge/deploy restano S00. **Una prova locale non è integrazione o distribuzione.**

## Addendum di packaging — 26 ottobre, successivo ai probe npm

La variante finale acquisisce **tre file ESM ufficiali byte-immutati** nel namespace S04, più LICENSE e confine TypeScript originale limitato ai metodi usati. Il replay Node senza npm consumer risolve e calcola correttamente. Non sono frammenti CAS riscritti. Totale sorgenti distribuiti **4.175.080 byte** (corregge il totale4.129.325 scritto nel commento6406115946; il precedente worker compilato era4.129,63kB). Nomi e hash in vendor-manifest.json; entrypoint+due chunk costituiscono la chiusura importata osservata. Nessun package/lock comune modificato, nessun package runtime esterno importato da questi moduli durante il consumer verificato. Il limite di provenienza colors rimane conservato; nessun codice proprietario copiato.

La patch compute-engine-dependency.patch resta prova storica della prima proposta, **NON APPLICARE** alla variante vendorizzata. Richiesta manifest6406015138 superata da questa variante se i gate sul consumer finale passano; hook qualityAPI ancora richiesto a S00. Rimosso il link locale al pacchetto npm prima dei gate finali: il risultato deve essere riproducibile con le sole dipendenze già bloccate.

Main992d1a0b incorporata con merge ordinario successivo; comprende primo batchS09, nessun namespaceS04 da main. La prima lettura GitHub era limitata alla pagina100 e perdeva nuovi checkpoint; correzione: paginazione completa, segnalazioneS06 della concorrenza tsc conservata. Nessuna cancellazione di storia.

## Addendum consumer diretto — successivo al commit38867e3f

Il laboratorio finale è raggiungibile anche senza l'installer qualityAPI: la selezione della coda canonica passa al mount S04 tramite **una prop** selectedQuestionId, nello stesso raccordo QuestionBankReview delegato daS00 nel commento6405061639; onSelect=setSelected e ReviewEditor/ApprovalGate sono preservati. Il pulsante del quesito selezionato apre un foglio legato alla fonte corrente via endpoint teacher esistente. Cambiare selezione non sostituisce il foglio aperto: va prima chiuso con il controllo della bozza non salvata. Il dashboard condivide questo stesso laboratorio, non crea un secondo mount. Il solo audit massivo continua a richiedere l'hookS10/S00 precedente.

`serve-core.py` prepara esclusivamente attori sintetici e serve la **create_app produttiva senza hook o monkeypatch**. La prova finale deve usare questo percorso. Il primo E2E9,9s era sul percorso audit con hook e npm; rimane valido solo per quella variante. Questo addendum supera il limite iniziale «intero laboratorio dipendente dall'hook», non dichiara integrato l'audit.

## Addendum revisione e recupero — 26 ottobre, successivo a6cca6a2a

Richiesta una review separata tramite skill requesting-code-review. Tre finding Important ricevuti e riprodotti: identità create riutilizzata per un nuovo foglio identico (possibile alias del vecchio record), numeratoredecimale passato aRational che richiede interi, fonte corrente etichettata con bindingstorico dopo cambio versione. Correzioni: idempotency per operazione/risorsa/revisione, reset solo suNuovofoglio e chiave stabile per retry; Rational per interi sicuri, Divide per altri numeri ammessi; version/SHA correnti dal detail e bindingstorico distinto senza attribuirgli il testocorrente. TestRED/GREEN dedicati; scenario browser esteso con duecreate byteidentici maIDdistinti e frazionedecimale reale.

Il caso x^0conx=0 era **già rifiutato** dal controllo nonfinito: il primo test attendeva erroneamente una specifica parola «dominio». Aggiunta la restrizione conservativa x≠0 visibile già prima del caso degenere; non si inventa una rispostaerrata precedente. Il nuovo test verifica proprio la restrizione prima assente. I log originari preservano anche l'aspettativa iniziale sbagliata.

Dopo interruzione lunga, alcune letture di rootfile del vecchio checkout bloccavano Gitread (campione del soloPIDproprio1357 inrefresh/index_fd/read su.coderabbit.yaml, poi timeout.gitattributes). Nessuna guardiaGit disabilitata o modifica mascherata. Nuovo checkoutisolato `work/ardesia-s04-recovered` dalla medesima6cca tramiteclone--shared/checkout, stessi remote/branch/PR, trasferiti test e handoff noncommittati; vecchio checkout conservato. Nessun processofile altrui toccato. Il ripristino atomico del solo.coderabbit.yaml nel vecchio checkout riproduceva il blobHEAD immutato, non una configurazionenuova. I test16PASS nel checkoutrecuperato non dipendono dal pacchettonpm CAS.

Il follow-upE2E ha esercitato la stessa frazionedecimale dentrox/x e ha rilevato il residuo annidato nonnumerico deldonor. TestRED aggiuntivo e fix di evaluate sullasola sostituzionenumerica prima di comporla; reviewerfollow-upread-only senzaissue.17namespacePASS, nuovo source217facab. Non si dichiara il primo tentativoE2E comePASS né siestendono itimeout; la prova completa viene ripetuta suquesta fonte.
