# S04 — consegna del laboratorio matematico

26 ottobre 2026. **READY_FOR_INTEGRATION: non ancora integrato o distribuito.**

PR310, stesso branch `codex/s04-assessment-quality-20261026`. Il prodotto provato è `529a3596970290ca0065561324dab54f97f13fd7`, base `992d1a0b5cdf40d94259d3be698a4d6c5dcc1231`. I commit successivi di consegna conservano i file del prodotto: confrontare `product-inventory-529a3596.json` prima dell’integrazione.

## Capacità acquisita e risultato utente

Il docente seleziona un quesito nella coda esistente e apre un laboratorio privato. Può scrivere formule con MathLive, semplificare, confrontare due procedimenti tramite lo scarto simbolico, sostituire valori e calcolare una derivata. Conserva formule, ipotesi, note e riferimento alla versione del quesito in fogli Core che può riaprire. Due fogli con testo identico hanno identità indipendenti.

Il motore è Cortex Compute Engine0.152.0: tre file ESM ufficiali immutati, 4.175.080byte complessivi, con MIT e manifest SHA. MathLive0.111.1 era già presente ed è riutilizzato con font locali. Il risultato è un supporto al revisore: nessun voto, approvazione o pubblicazione automatica; nessun teorema di uguaglianza globale o verifica automatica delle unità.

## REA, riuso e codice originale

REA ha analizzato staticamente due file della distribuzione npm. Evidence parent: `ev_87d050e62901613a1e4d2b25441efd694016d1922689efb80835c86959d31132`. La copertura è parziale: 493file non selezionati e capacità di1500unknown raggiunta. L’export originale ha6.142.778byte; hash e limiti sono in `rea-summary.json`, l’export compresso precedente resta negli outputs della chat. Il grafo non dimostra esecuzione o assenza di comportamenti nei file esclusi. Probe Node ed E2E sono prove separate.

Sono stati confrontati tre candidati: ADAPT del Compute Engine; SymPy084 già usato dal generatore, quindi una seconda chiamata non è indipendenza; Numbas047 Apache2 rimandato per evitare un secondo assessment/ledger. MathLive081 è riuso esistente. S12/S15 sono stati consultati nel rendezvous; il delta proposto non altera gli ID139. Fonti, pin, closure e decisioni sono in `REA-REUSE.md` e `registry-proposal.json`.

LICENSE di Compute Engine e complex.js sono conservate. Per colors0.7.3 esiste la dichiarazione MIT del publisher, ma il pacchetto omette LICENSE e il repository dichiarato risponde404: il limite è scritto nel NOTICE, senza inventare un titolare. Il consumer serve il NOTICE come asset200 con byte esatti. La vecchia proposta di dipendenza npm è **SUPERSEDED_NOT_APPLIED**: non applicarla alla variante vendorizzata.

Originali sono l’adapter, il controllo del dominio prima della semplificazione, i limiti di input/AST/esponenti, il worker cancellabile e il raccordo UI/Core. Il CAS rimane quello upstream. Il worker riceve soltanto input matematici, senza token, e termina su esito, errore, annullamento o unmount:15s per carico e2,5s per lavoro. Non vengono chiamati Assign, compile o provider. Le restrizioni sono esplicitamente parziali; decimali e frazioni sono valutati dal motore prima della sostituzione.

## Integrazione e persistenza

Il mount QuestionBankReview era delegato daS00 nel commento6405061639. Una prop trasmette il quesito selezionato, mantenendo `onSelect=setSelected`; ReviewEditor e ApprovalGate restano invariati. Il laboratorio diretto usa API docente già presenti e funziona senza hook aggiuntivi. Il solo audit massivo richiede ancora l’import/install della patch già consegnata aS10/S00. Nessuna modifica a factory, auth, schema o lock condivisi. `serve-core.py` usa la create_app produttiva senza monkeypatch o risposte simulate.

I fogli sono risorse private `assessment-quality-worksheet-v1`, con gli stessi create/get/revise e storico del Core. Il binding contiene banca, quesito, versione e SHA. CREATE ha receipt idempotenti; REVISE usa expectedRevision CAS e ignora l’header idempotency. Non si attribuisce al server un replay delle revisioni che non esiste.

Accesso e fonte vengono riconfermati prima di calcolo/save. Un cambio di fonte blocca il foglio: testo e hash correnti sono distinti dal binding storico. Il risultato archiviato viene ignorato finché non ricalcolato.409 mantiene la bozza;401/403 o fine sessione svuotano il consumer. Nessun nuovo database, localStorage, login, grader o ledger.

## Prove effettive

- **17test mirati PASS**, cinque file. Aritmetica sul donor reale; UI con API controllate e worker ownership dichiarati come test unitari. RED/GREEN per tre finding Important e per la frazione decimale composta. Non presentati come E2E.
- **Review separata read-only:** tre finding risolti; follow-up senza issue residui negli ambiti esaminati, inclusa la valutazione della sostituzione numerica prima di comporla. `REVIEW.md` registra confini e comportamenti non giudicati. Nessuna approvazione scientifica umana. CodeRabbit aveva saltato la draft e non è contato come review.
- **Build prodotto EXIT0**,1m9s sotto contesa. Warning per chunk oltre500kB mantenuto; CAS lazy circa4,1MB non compressi. Non modificato il limite del warning.
- **E2E prodotto529 PASS51,8s**, runner1,2m: Chrome reale, artefatto compilato, cookie e SQLite/Core reali, factory originale. Due create con testo identico e ID distinti, frazione decimale composta, dominio a zero, salvataggio/reload/riapertura,409 reale con bozza conservata, touch390 e tastiera Enter,1440/390 senza overflow, logout401/student403, NOTICE200 byte identico. Zero errori pagina/console inattesi; il409 atteso richiede URL specifico e risposta asserita. Primo calcolo2834ms in questa osservazione, non benchmark generale.
- **Nuovo processo dopo stop del server:** stessa risorsa, revisione corrente e storica, nota e SHA esatti, fonte/versione corrispondenti, privata e non pubblicata. Vedere `cold-reopen-529a3596.json`.
- **CI:** verificare i check sulla head esatta di consegna. I precedenti verdi di388/6cca sono fotografie storiche. L’inventario dimostra quali file del prodotto sono rimasti identici.

## Storico e debito residuo

Il primo audit4000, HANDOFF e VALIDATION restano invariati. Quattro dossier sono ancora DRAFT:128seed,112combinazioni distinte e0/200accettazioni complete.200 è baseline editoriale interna, non un numero ufficiale MUR. I2151numerici non verificati non diventano verificati grazie alla sola disponibilità del laboratorio.

Gli errori e le correzioni sono conservati: letture del filesystem bloccate, checkout recuperato sul medesimo commit, vecchio bootstrap demo non leggibile, errore import.meta/CJS nel runner, frazione annidata del donor. Nessun timeout aumentato o processo altrui terminato; dati e prove precedenti preservati. Nuovi log compressi con hash negli outputs `final-529a3596`.

S00 conserva merge, distribuzione e controprova post-merge. Restano il raccordo dell’audit massivo, la review scientifica dei contenuti, il trattamento del machinekind nei Materiali generici, il limite di provenienza colors e la misura nell’ambiente target. I cinque prossimi task con primo passo, dipendenze e accettazione sono nel `MEMORY-APPENDIX.md`; la memoria comune resta al writerS00.
