# Prossimo incarico: completare i quattro microcorsi di Fisica

## Addendum operativo corrente — S00, 26 ottobre 2026

Il proprietario ha adottato esplicitamente «Esegui S00 in questa A». La306 è
MERGED su `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`, CI post-merge40242587363
e readiness40242587350 SUCCESS: non rifare quella convergenza. Il mandato V2
prevede12 stream concorrenti, una PR implementativa attiva per stream, nessun
limite globale di3. S00 integra/distribuisce e aggiorna RUNLOG/NEXT; S02 shell,
S10 API/auth/schema/storage. Non creare nuove chat dalla sessione S00.

Leggere [handoff S00](../../handoffs/swarm-v2/S00/README.md) e registro dei writer,
poi rendezvous [commenti306](https://github.com/AndreaMarro/ardesia/pull/306).
I ruoli proposti non provano che tutte le chat abbiano START osservato. Rileggere
PR307/308/309 e successive sulla head effettiva, senza ereditarne il verde.
Room è temporaneamente di S07 per l'adapter opzionale; Courses di S09 per il mount
tutor; RootApp resta S00. Deleghe e coda sono nei commenti6404992331/6405061639.
Host8GiB: un solo slot pesante alla volta, niente processi altrui terminati.

Primo batch S00: export **privato esplicito** Web `/`+Studio `/studio/`, registro
operatore `/ops/release/`; pubblico e review editoriale restano separati. Il
backend non configurato risponde503, non un finto login. La CSP privata richiede
MathJax locale dal lock esistente. Stato corrente e prove terminali vanno letti
nell'handoff/PR: implementazione e26 test pipeline non equivalgono a integrazione
o beta remota. SSO Vercel resta un gate operatore distinto dai permessi Core.

Il prossimo risultato deve collegare consumer pronti alla main attraverso check
del merge-tree, poi CI post-merge e preview protetta effettiva. «Studia da solo»
richiede contratto S06/S10, fonti esatte, submit/receipt/feedback e cold/revoca;
nessun nuovo ledger. Mantieni espliciti0/52,0/57,0/33,0/58 completamenti e gli
obiettivi validi sotto. Il vecchio conteggio0PR era storico, non stato attuale.

Aggiornato il 25 ottobre 2026. #304 e#305 sono integrate: non ripartire dal vecchio blocco review. L’incremento corrente è nella sola [PR306](https://github.com/AndreaMarro/ardesia/pull/306), prodotto `05d2bc9911aff3862906ac5a71769bc726dfbcea`; i commit successivi aggiungono prove e memoria. Prima di lavorare leggere il [registro con esito terminale e CI post-merge](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404424520), verificare main/PR/Vercel attuali e rigenerare `python3 bin/state/project_state.py`. Una consegna datata non certifica il presente.

Leggere [consegna e rollback](four-courses-2026-10-25/README.md), [matrice dei quattro corsi](../../matrici/QUATTRO_CORSI.md), [200 schede](four-courses-2026-10-25/objective-evidence.json), ultimo RUNLOG, AGENTS, CANON-INDEX, ADR-0004 e protocollo memoria. Conservare il denominatore 52/57/33/58: **zero obiettivi con accettazione completa**. Le43 lezioni e38 famiglie DRAFT nella review protetta e i5 esempi pubblici non sono quattro corsi completi.

Pubblico: https://ardesia-fisica-preview.vercel.app/corsi/ , deployment `dpl_7BQB2RrpkNdAsFgQ4MktHgfdnS1z`. Review completa con SSO: https://ardesia-fisica-preview-t4tqijqvx-andreas-projects-6d4e9791.vercel.app/corsi/ , deployment `dpl_4tSUVdLjeyQpVqY6eNKF9G1abXp7`. Share temporanei revocati; nessun access file in Git. Non rimuovere SSO. L’autorizzazione pubblica riguarda solo gli esempi originali verificati, non kit o banca di4.000 DRAFT. Rollback: `dpl_8aUFbXrEZKpAjf8vRj1wBmK8fyfr`, sul solo progetto Fisica.

A resta unico integratore/deployer e writer della memoria comune. B cura modelli/strumenti; il ruolo DeepSeek contenuti, controprove e Goodnotes, con file e worktree separati. Handoff in `handoffs/codex-a`, `handoffs/codex-b`, `handoffs/deepseek/2026-10-25`. Conservare attribuzione e provenienza. Sette check strict, enforceAdmins e conversazioni risolte restano obbligatori; policy single-maintainer autorizzata, nessuna review umana inventata o uso di --admin. Nessun secondo Core, database, grader, ledger o autorità di sessione.

## Ordine di lavoro

1. **P0 — Accettazione per tutti i 200 obiettivi.** Primo passo: partire da U1-01 nella matrice e collegare una prova qualitativa a consegna, feedback e attività diversa attraverso i contratti Core esistenti. Le38 lezioni qualitative sono consultabili, ma non hanno ancora attività canoniche consegnabili dedicate. Dipendenze: docente/editor, contratto di evidenza e pubblicazione esplicita. Accettazione: spiegazione, pratica, feedback, transfer, correttezza scientifica e percorso UI verificati per ogni target, con distinzione fra assistenza e autonomia. Evidenza: schede, ricevute, revisioni e approvazioni umane delle versioni effettive; mai cambiare false in true per una metrica.
2. **P0 — Continuità Core remota.** Primo passo: identificare o predisporre Study API/Auth/Storage nel perimetro autorizzato; Render Ardesia attuale contiene solo statici, non usare ELAB come Ardesia. Dipendenze: provider e costi consentiti, identità, backup. Accettazione: due browser, docente→studente→review, riapertura, revoca, isolamento e restore. Evidenza: backend reale e ricevute/digest; il workflow HTTP locale su 5 modelli e 4 edizioni già verde non certifica il remoto.
3. **P1 — Revisione esatta e plugin.** Primo passo: estendere il contratto canonico ActivityEvidence per lessonRef/fase e scegliere un oggetto mancante dalla matrice. I cinque modelli attuali sono first-party nel bundle, non plugin installabili. Dipendenze: schema, capability, versioni, licenza e ownership B. Accettazione: installazione, mount, revoca, round-trip e consumer funzionanti. Evidenza: RED/GREEN, UI, controprove scientifiche e REA, con costo totale misurato oppure UNKNOWN.
4. **P1 — Qualità umana e compatibilità.** Primo passo: ascoltare le quattro clip e verificare Safari/device reale; correggere «Unità richiesta: .» nella review qualitativa. Dipendenze: operatore, dati sintetici e permessi. Accettazione: testo/audio comprensibili e recuperabili, focus/font/movimento ridotto corretti. Evidenza: gesti e limiti espliciti. Goodnotes osservato solo nei metadati della versione 7.1.30: non dichiarare Goodnotes6, UI o replay collaudati.

Prima della consegna aggiornare RUNLOG con risultati, errori/correzioni, alternative, prove e limiti; terminare con 3–5 task che abbiano primo passo, dipendenze, accettazione ed evidenza. Aggiornare NEXT e provenienza. Il mandato resta aperto finché tutti e quattro i corsi non superano i criteri. Non creare una nuova PR per prolungare artificialmente un’attività aperta: verificare prima l’esito effettivo della 306.


## Addendum S00 successivo — 26 ottobre 2026, candidata2c522f96

308 e307 sono MERGED, main992d1a0b e CI post-merge40251190531SUCCESS. Il vecchio stato delle loro draft è storico.314 ha fonte2c522f96,7requiredSUCCESS,27pipeline/10Studio mirati e791browser locali; uploadVercel ancora in corso e nessun nuovo deployment attestato a questo checkpoint. Leggere il rapportoS00/rendezvous306 per esito terminale e URL effettivi, senza ereditare un verde da un'altraSHA. Sorgenti runtime del build pulite, i commit successivi di memoria non cambiano i suoi asset.

Prima chiudere314 attraverso provaHTTPS/merge/postmerge e ricevuta provider, poi integrare i consumer già pronti dalla main aggiornata. S10START rimane non osservato: gli installer condivisi richiedono writer esplicito, non endpoint finti. La finestra S01perJSXGraph è stata rilasciata; patch manifest/lock1.14.0 autoreS00 consegnata e verificata dall'owner. FontLiberation1.05legacy nonOFL e source esatto non verificato: Studio solo preview interna, nessuna pubblicazione implicita. Pubblico5demo invariato, quattro corsi ancora0/200accettazioni complete.

Ricordare, leggere e aggiornare lo storico senza modificare il passato: voci e conclusioni precedenti rimangono, smentite aggiunte datate con prove. Handoff di ogni owner e appendici aS00, RUNLOG/NEXT un solo writer. Non chiamare DONE unaPR aperta, una chiusura senza integrazione, una demo mock o unaCI di altrahead.


## Addendum S00 — preview HTTPS effettiva,26 ottobre2026

La314 ha ora una preview protetta reale: https://ardesia-fisica-preview-kpdx7h80d-andreas-projects-6d4e9791.vercel.app/ops/release/ , deploymentdpl_CESVaUARu9iX9zZuwZSqRjj8W1U8, fonte2c522f96.796controlli HTTPS PASS; grant revocato e file privato cancellato,302 versoSSO verificato. La vecchia nota upload in corso resta storica. Non confondere READY provider con beta: API503, nessun backend remoto o ACL studente certificato. Produzione invariata; Studio solo interna per limite Liberationlegacy. Receipt/runner in handoffs/swarm-v2/S00/; rileggere esito terminale314 e CI post-merge prima di ripartire.

S00 ha congelato la317 su2e9cea03 e prende il raccordo installer API, RootApp e typedreader science-resource nella STESSA PR dopo314 terminale. Nessun nuovo ramo dipendente o PR per prolungarla. Prima prove sulla composizione finale, poi integrazione e distribuzione pertinente.309/316,311/318/319 e calendario320 seguono per consumer, non ordine dei numeri. Delega S09 limitata alla patch3500827e… già consegnata, nessuna reinstallazione dei node_modules condivisi. Conservare0/52,0/57,0/33,0/58 e i5task dell'ultima voce RUNLOG; storico append-only, smentite datate e provate.


### S00: correzione successiva alla prova796

La prova796 resta storica sulla build4. Review visuale indipendente trovaP2 banner sovrapposto: CSS corretto e RED reale conservato, nuovo build/GREEN richiesti prima del merge314. Gate locale2311PASS/2FAIL non va nascosto dietro7requiredCIverdi; controprova mostra errore di commit durante test/SHA compilata e52miratiPASS aHEADferma. MathJax15,7s contro15s non completamente attribuito. Leggere nuovo handoff/rendezvous314 e mantenereHEADimmutabile durante test. Nessuna soglia,gate ocronologia modificata; quattro corsi ancora0/200.


## S00 — checkpoint800HTTPS, decisione diagnostica richiesta

Nuova preview privata https://ardesia-fisica-preview-bjr7xic5r-andreas-projects-6d4e9791.vercel.app/ops/release/ , deploymentdpl_G2Tqz6efx2PMHv3n9B71VZVYS3wy, fonte15825e70,795locali/800HTTPS e7requiredCI40294401864 verdi; grant revocato e produzione invariata. Vecchia preview796 resta storico distinto. Due gate locali falliti, ultimo2312/1 su localMathJax, replayNON_RUN; non nasconderlo dietroCIverde. Dopo regola stopAGENTSStudio§5,314 è temporaneamenteBLOCKED_HUMAN_DECISION: leggere handoffs/swarm-v2/S00/DIAGNOSTIC-DECISION.md e patch byte-equivalente NON applicata. Prima misurare build/confronto e bytecorrotto, nessuna soglia alzata o rerun identico; poi ciclo autorizzato e chiusura con merge/postCI.317 resta stessaPR congelata2e9cea03 per raccordoS00 dopo314. Quattro corsi ancora0/200, Core remoto503 e limite licenzaStudio invariati; seguire5task ultimaRUNLOG e memoriaappend-only.


### S00 — ciclo mirato autorizzato direttamente dal proprietario

26 ottobre2026: autorizzato «senza indebolire i gate». Misura reale del confronto Buffer2,27MB:9,085s/helperstrutturale e0,132ms/native, build36–84ms; entrambi rifiutano4corruzioni di byte. Applicata patch1riga equivalente, gate/pool/timeout invariati. Non riproporre la domanda già autorizzata né cancellare i2FAIL storici. Eseguire mirato/gate sulla nuovaHEADferma, poi CI/merge/postCI dellaSTESSA314. Previewfonte15825e70 resta800HTTPS e non cambia per soli test. Report e script in handoffs/swarm-v2/S00; successivi317/309/311/318/319 e quattro corsi0/200 restano obiettivi, con5task ultimaRUNLOG.


## S00 — esito terminale314 verificato,26 ottobre2026

314 MERGED su maina00f2f40091aecf69e58ebaba42cf70d748e4066, treeab509d3 uguale al merge-tree, CIpostmerge40319487576SUCCESS. Gate congelato2314/0 con replay reale, sorgente573ee34d eHEAD/script invariati. Il blocco umano e i2FAIL precedenti restano storici: autorizzazione diretta, misura costoMatcher e patch byte-equivalente verificata li superano senza cambiare soglie. Vecchi/tmp scomparsi: esecuzione lì interrotta senza esito, recupero persistente ~/Developer/ardesia-s00-20261026/repo e log evidence/approved-gate. Non rifare la314 o chiedere l'autorizzazione già data.

Prossimo incarico concreto nella STESSA317, non nuovaPR: checkoutscience S00 da2e9cea03 +main314,4test URI esattiRED/GREEN; UI/API/typedreader NONancora composti. Prima raccordare ownership Materials313/SourceViewer309-315/app.py312, già contattati. Conservare modelliS01 e vecchieprove senza trasferirle alla nuovaSHA. Preview privata dpl_G2Tqz6efx2PMHv3n9B71VZVYS3wy fonte15825e70/800HTTPS distinta daHEADprova; produzione invariata. Core remoto503, Studio soltanto interna e quattro corsi0/200. Cinque task prioritizzati con dipendenze/accettazione/evidenza nell'ultimaRUNLOG; memoria append-only.


## S00 — raccordo317 implementato, verifiche finali da chiudere (26 ottobre2026)

Main a00, ingresso317f708. Ora esistono mount nei Materiali, reader science-resource e factoryAPI reale; non sono più soltanto proposte.53Core/HTTP,38mirati Web aggiornati e typecheck PASS. Primo browser actualApp17gruppi e fullWeb463 sono prima delle2correzioni P2: nuovo browser/build/CI esatti necessari prima di terminale317 e preview. Digest non più dinamico: hash+compile stessi bytes, dopo controprova .pyc che smentisce esplicitamente la prima candidata S01.5regressioni, EvidenceREA/RED originali e review in handoffs/swarm-v2/S00/evidence/science-composition. Non chiedere autorizzazioni già date, non indebolire gate.

Continuare STESSA317 fino a merge/postmerge e preview protetta pertinente; SourceViewer/Materials/app.py writerS00, owner congelati. Non applicare la vecchia patch installerS06:309350d65a lo contiene già. Poi comporre309/316/315/313 con conflitti reali, e Studio con hunk minimi.0/200 e Core remoto503 restano limiti. Seguire5task ultimaRUNLOG, cronologia append-only; le vecchie conclusioni restano con smentite datate.


## S00 —19gruppi nel prodotto e verifica visuale corretta,26 ottobre2026

Prodotto317 b701e531:38mirati/53CoreHTTP/typecheck/build aggregate verdi,19browser actualApp+Materiali+Core/CSP e nuovo mobile390. I precedenti18PASS non bastavano: grafico nel PNG390 tagliato durante resize; controprova misuraSVGvecchio, attesa ora sul predicato geometrico, nuovi pixel completi con review indipendente. Renderer invariato, bug permanente non dimostrato. Originali e smentite conservati in evidence/science-composition; non attribuire463fullWeb preP2 alla head attuale senza CI. Prima chiudere laSTESSA317 attraverso CI esatta/merge-tree/merge/postCI e preview protetta byte-verificata, poi altri consumer.0/200, Core remoto503 e Studio interno restano limiti;5task ultimaRUNLOG con primi passi/dipendenze/accettazione/prove. Memoria append-only, non riscrivere il passato.


## S00 — ripresa e terminale317,26 ottobre2026

317 MERGED: main e95a80b393589b71da2846aa98814dc1a034b730, treee667e356 uguale alla head7b9a4189 verificata, CIpostmerge40370053167SUCCESS. Nuova preview privata fonteprodotto b701e531: https://ardesia-fisica-preview-gh2h25wc0-andreas-projects-6d4e9791.vercel.app/ops/release/ , dpl_DC99opdh3H2jtAtf1d1Zwt2na5tV,805HTTPS PASS. Grantrevocato/fileprivatoeliminato/302SSO; produzione invariata. Vecchi upload e terminale pendenti sono storia, non stato corrente. Leggere ricevute science-terminal e ultimaRUNLOG.

Prossima309già in composizione su main317, stessaPR/worktreeS00study: preservare entrambi typedreader e installercanonici.502Web/95CoreHTTP verdi prima della review;3REDlogout/late200 e cache malformata richiedono nuoviGREEN, browser, CI/merge/postCI. Non ereditare i verdi e non chiudere316prima dell'integrazione reale309. Patch325 da riallineare al candidatofisso successivo; failure40371391113 dopo317 è guarddi composizione, non loaderregredito dimostrato. S00 writer unico RUNLOG/NEXT, tutti ricordano/leggono/appendono lo storico senza riscrivere passato.

Quattro corsi ancora0/52,0/57,0/33,0/58; Core remoto503 e Studiointerno restano limiti. I5task ultimaRUNLOG mantengono primi passi,dipendenze,accettazione e prove.


### 309: correzioni di review prima della prova browser

I3REDsessioni e13REDcache sono stati corretti; fullWeb521 ebuild PASS, poi secondo revisore ha trovato chiaviprototipo:5REDeffettivi corretti con mappeetichette aprototiponullo e fasi con vocabolariounico.63mirati ebuild/typecheck PASS; seconda controprova del revisoreGREEN. Log/limiti preservati in handoffs/swarm-v2/S00/evidence/study-composition. RisultatiCore non salvati nel cacheoffline, omissione esplicitaUI, inputconservati. Prima di dichiarare309pronta eseguire proveApp sulla nuovaSHAferma e7required/merge-tree;316rimaneaperta finoall'integrazione vera.


### 309: FAILbrowser da conservare e nuovaCI da leggere

Fonte ae71864: buildPASS, browser5check poi timeoutEsegui modello, una solaPOSTdiagnostica+GET200/zeroJSerror. Controprova successivaFAILprima avviofixture20s, browserNON_RUN; host8GBswap osservato,causaNONPROVATA. Stopheavy locali, nessun timeoutalzato oetichettaflaky. Runneroriginale ora cattura eventiDOM e azionirete suFAIL; jobWebCI esistente esegueS06+science confactoryreale, manifestbytecorrenti/HEADpulita. Artefatti inallowlist per nonpubblicareSQLite/token inOOM. Prima leggi nuovahead/CI/prove:309nonèintegrata,316nonchiudereancora.317rimaneMERGED/CIpostverde/805HTTPSprivati verificati.


### Finding B-05 sulla main317, correzione nel candidato309

ASTRA B/A hanno verificato che compare scientifico accettava revisionId:null e usava la versione corrente. S00 ha riprodotto RED nella factory reale e corretto la validazione prima del read;6HTTP PASS, due revisioni con risultati distinti e ACL conservati. Il read opzionale rimane previsto per i suoi consumer. Prove in science-null-{red,green}.log.gz e astra-b-science-null-e95a80b.json. Non dichiarare questa correzione già integrata o distribuita: attendere la nuova head309 e i suoi gate. Il FAIL browser locale resta aperto e i5task dell'ultima RUNLOG restano prioritari.


### S00 — browser composto verificato in CI, 26 ottobre 2026

Su head309 `9da49952`, job Web40375681120 SUCCESS: 34 controlli Studio autonomo e19 science nella merge SHA92607baf. Report e screenshot in `handoffs/swarm-v2/S00/evidence/study-composition/ci-9da-consumers/`. Il FAIL locale resta non attribuito: il verde remoto non ne dimostra la causa. B-05 corretto successivamente in `50b07bea`, 6 HTTP GREEN; attendere CI della nuova head, review, merge ordinario e post-merge prima di chiamare 309 integrata o chiudere316. Main resta e95 finché GitHub non prova il contrario. S19 ha preparato solo localmente la patch API contro9da; pubblicarla soltanto dopo la nuova main, senza trasformare la preparazione in integrazione. Conservare cinque task e limiti dell'ultima RUNLOG; memoria append-only.


Nota successiva: B-05 ha anche controprova indipendente ASTRA B9/9 sulla fonte50b07bea; il log RED conteneva valori della fixture sintetica e la relativa riga è ora redatta con ricevuta/digest, senza cambiare l'asserzione. La candidata5513 era già stata pubblicata; nessuna riscrittura della cronologia o credenziale di produzione identificata. Leggere la nuova head effettiva, non trasferire automaticamente il verde9da.


## S00 — esito terminale309/316 e base per il seguito,26 ottobre2026

**309 e316 sono MERGED**, main `d7dc3917d695c80d027c91df21577e06ec649232`, treee1f62518 identico al merge tree verificato. CI della head 40378097214 e **post-merge 40379757071 SUCCESS**; report post-merge 34 Study + 19 Science PASS con manifest esatto in `handoffs/swarm-v2/S00/evidence/study-terminal/`. Commenti terminali309#6424498231 e316#6424498826. Non ripartire dai vecchi checkpoint draft o chiedere nuovamente autorizzazione al merge. Il FAIL locale resta non attribuito; l'integrazione non lo trasforma in una diagnosi.

S19 ha la base reale per riallineare la stessa #325; prima leggere la nuova head/CI, poi comporre il consumer e verificare merge/post-merge. Memoria #315, Back/Forward, media #313 e Room 311/318/319/322/324 restano raccordi espliciti, non consumer completati dalla sola ancestry. Backend remoto assente: servono adapter/entrypoint/policy hosted, non soltanto URL; guardie loopback locali da conservare. S10 non identificato, nessun riuso ELAB. Matrice di 60 probe disponibile ma tutti i journey remoti restano BLOCKED (503). lessonRef/fase esatti nella ricevuta sono un gap da riprodurre prima di progettare il contratto additivo.

Produzione dei 5 esempi e preview #317 restano invariate, quattro corsi0/52, 0/57, 0/33, 0/58. Seguire i 5 task dell'ultima RUNLOG con primi passi, dipendenze, accettazione ed evidenze. Storico append-only, un writer S00, smentite datate e provate. Questo addendum va portato nel prossimo consumer integrato; gli esiti terminali sono già pubblicati nelle PR, senza creare una PR solo per documentazione.


## Addendum S00 — 26 ottobre 2026: composizione #325 e indice di tutte le consegne

Leggere il nuovo [indice degli stream](../../handoffs/swarm-v2/README.md) e il [report Kirchhoff](../../handoffs/swarm-v2/S00/kirchhoff-composition.md). Il registro fotografa 20 PR/19 fonti di chat su main d7; le sue 7 integrate/13 aperte sono un checkpoint, non lo stato futuro. Non ripartire dai blocchi già superati di #304, #309 o #316. RUNLOG conserva risultati, errori, correzioni e 5 task con accettazione.

S00 ha composto il consumer S19 nella stessa #325: fonti con revisione esatta, copia privata, retry canonico, input JSON recuperabili senza motore, revoca e risposte tardive isolate. Prove locali: 530 Web, 45 S19 Python, 8 context, 32 browser componenti e 2 journey reali desktop/touch. Nuova CI, merge e post-merge vanno verificati sulla SHA corrente; non riciclare i verdi della vecchia head b64. Il task immediato è chiudere correttamente questa integrazione.

Dopo l'esito terminale, affrontare backend hosted e lessonRef/fase esatti; poi comporre memoria/media/Room usando i contratti esistenti. Nessuna nuova PR per prolungare artificialmente il lavoro. S03/S10/S12/S13 senza pacchetto autonomo verificato restano gap, non attività completate. Le 60 prove remote sono ancora preparate, zero eseguite. I quattro corsi rimangono 0/52, 0/57, 0/33, 0/58; DRAFT e approvazione umana restano distinti dai test verdi.

Pubblicare su GitHub codice, prove curate e handoff nel perimetro autorizzato, senza trascrizioni private o credenziali. Gli snapshot e le conclusioni precedenti si conservano: aggiungere una correzione datata con prova, mai riscrivere il passato.


### #325 — correzione CI del 26 ottobre 2026

La head33a non è verde: due test API conservavano il vecchio catalogo a sei pack e la build pubblica rilevava il digest catalog.py non rigenerato. Entrambi riprodotti; ora set esatto a sette pack e proiezione rigenerata dal Core, tutti gli altri dati pubblici identici. API5/5 e --check PASS, ricevute in kirchhoff-composition/ci-33a. Non cancellare i FAIL o chiamarli flaky. La prossima azione è nuova CI completa, review, merge protetto e post-merge nella stessa325; i cinque task dell'ultima RUNLOG restano validi. Nessun deploy pubblico o cambio della copertura0/200.


### #325 — spec browser di inventario, 26 ottobre 2026

CI5092: API eS19PASS, Webphysics-pathways ancora cerca6programmi mentreDOM7. Delta successivo allinea tre aspettative e aggiunge titoloKirchhoff, preservando riferimento obsoleto e tutti i controlli di navigazione. LocaleNOT_RUN per ENOSPC nell'installazione, non un fallimento del browser; continuare tramiteCI. Ricevute ci-5092 e addendumRUNLOG conservano la distinzione. Chiudere la stessa325 con merge/post-CI reali; restano backend, lessonRef/fase, consumer e0/200, senza modificare storia o gate.

## Addendum S00 — 26 ottobre 2026: tree G0 composto e verifiche terminali nella stessa #313

Il mandato intensivo del proprietario autorizza implementazione, merge ordinari e preview Vercel protette senza nuovi costi o servizi ELAB. Non ripartire dalla ricognizione: main osservata b24ef978, #325 già merged; dettagli, originali e deleghe sono nell'ultima appendice RUNLOG. La stessa #313 assorbe #322/#323/#324/#318 conservando i parent originali. Consegne congelate: media3872c0be, Formulaa2fb0532, S182c0cdd1c, S20eb443ed1, G05cb141f2, P0b26f4e4. SourceViewer, Materials, Room e Classroom sono consumer reali; le vecchie patch di mount non vanno riapplicate.

G0 locale è provato in un solo journey Poiseuille: PDF/annotazione/formula, consenso e registrazione, oggetto/capitolo, export/import .lesson fra browser, replay/PDF esatti, due ricevute, feedback e vero riavvio Core. Preserve tutti i RED e le rettifiche CSS/parent/transfer. Core canonico conserva lessonRef/fase; legacy compatibile senza falsa attribuzione. Il runner CI required ora copre golden e layout, oltre alle suite esistenti. Non cambiare HEAD durante i gate: il primo Studio ha correttamente fallito quando la regia l'ha spostata in esecuzione.

Prima azione: rileggere #313 per head remota, sette required checks, merge e post-merge reali, quindi la ricevuta del deployment. I commit API devono avere il tree locale verificato; nessun vecchio verde certifica una nuova SHA. La preview usa i comandi canonici con `--include-private --learning-journey`, poi `--private-integrated` e `--protected-integrated-preview`; target Preview, SSO invariato, backend503 esplicito e pubblico dei cinque esempi conservato. Non chiudere le PR assorbite prima che la main contenga i loro originali.

In parallelo sono già affidati incrementi isolati: #315+#312 (storia personale, notice=None), #310 (revisore senza approvazioni automatiche), #321 (race membership/retarget) e #320 (calendario reale). S00 resta il solo writer esterno; confrontare e integrare i loro nuovi head, non sovrascrivere. #311/#319 richiedono ancora composizione di scene/Library/grant/trasporto; nessuna intera PR è già superseded. Blocchi scientifici, attivazione raccolta facoltativa e licenza di distribuzione esterna asset restano distinti dalla normale integrazione tecnica.

G1 non è pronto: nessun backend Ardesia hosted trovato in Render/Supabase; il runtime attuale è loopback e il prototipo Vercel di giugno non lo sostituisce. Non eliminare guardie locali, non usare progetti ELAB, non creare costi. Preparare e verificare ambiente/identità/storage/restore prima di collegare l'API. Quattro corsi ancora 0/200, approvazione umana distinta dai test. Questa appendice descrive il candidato; gli esiti esterni terminali si leggono nelle PR e nelle ricevute di release, senza inferirli dalle prove locali.


### Addendum S00 — golden nativo concluso, 26 ottobre 2026

Fonte golden locale7c941263,26PASS, prove e limiti in `handoffs/swarm-v2/S00/g0-final-20261026/README.md`. Mantiene il percorso unico con formulaMathLive e SVG collegato all’audio, importUI su nuovo browser, Core riavviato e due ricevute. Web622,Studio2365/5SKIP,CoreAPI1224/30SKIP,rilascio27,layout16; build pubblica e igiene PASS. Non riattribuire a questi verdi una head remota senza controllare tree eCI. Primo passo necessario: completare la stessa313 con parent originali318/322/323/324, sette gate richiesti, merge ordinario,CIpush e Preview protetta su progetto canonico; la313 è la ricevuta esterna autorevole. PhaseE ha consegne isolate da integrare sulla main risultante;311/319 e profiloG1 non sono già conclusi. Nessun costo nuovo, backendELAB o promozioneDRAFT autorizzati.


Addendum CI G0: la head011246b ha raggiunto GitHub con tree esatto; S19 ha fermato il preparatore storico della patch325. Correzione: binding ai moduli attuali,49test locali PASS e3negativi sulle copie temporanee. Non saltare S19 o riusare la vecchia CI: verificare nuova head313, sette required più S19, merge ordinario e pushprima Preview. Evidenza in `handoffs/swarm-v2/S00/g0-final-20261026/s19-ci/`.


Addendum navigazione G0: b8 ha passato golden26, layout, Studio e S19; Web ha fermato il test storico della cronologia. Due RED conservati: aspettativa Shell obsoleta e perdita effettiva dell’unità nel cambio edizione. La correzione minima preserva URL esatto e passa browser+22unitari. Rileggere head e CI della313 prima di merge e Preview; prove in g0-final-20261026/pathway-history-ci.


## Addendum PRO — 27 ottobre 2026: convergenza delle sette PR residue

Base osservata dc353639. Il ramo `pro/recovery-convergence-20261027` compone310/311/312/315/319/320/321 preservando gli originali: non rifare acquisizioni o aprire sistemi paralleli. Consumer reali: calendario, audit nella factory API, memoria/grafo, insight con caricamento isolato, raccolta Room sul writer scena/editoriale esistente. Corretto il filtro penna prima della coda per conservare il tratto al cambio lifecycle. Recovery corsi e ritorno alla pratica verificati con RED prima del fix. Leggere l'ultima RUNLOG per prove e limiti; il primo commit recovery conteneva solo test e non va presentato come completamento.

La nuova root build produce Web+Studio privati con il preparatore canonico, non soltanto Studio; conserva SSO, /study503 e deployment Git disabilitato. Il progetto pubblico va aggiornato separatamente dai soli asset PUBLIC_DEMONSTRATION. Prima di riprendere leggere la PR di convergenza per head, sette required, merge/post-CI e deployment effettivi: questo addendum è pre-release, non una ricevuta di pubblicazione.

Il Core hosted e il trasporto collaborativo non sono certificati: non eliminare guardie sintetiche/loopback o trasformare SSO Vercel in autorizzazione applicativa. I quattro corsi restano0/200 accettati,38 lezioni qualitative DRAFT e5esempi pubblici. Ordine operativo: terminalizzare integrazione e deploy, poi runtime remoto verificato, poi accettazione scientifica progressiva con prove docente–studente. Nessun uso del servizio Codex, costo nuovo o modifica distruttiva.
