# R2 — identità, verifica e limiti

Primo prodotto `bec05cc8172393b153b7d8ea56ae48f1afa95ef0`, finale `36cdba353401c80b92cc94f256b106238c7610f8`, base#300 `6a81d870fd1f390444ef5acbe6bc42203104fa63`. La head documentale successiva conserva i sorgenti del prodotto; verificare sempre head/base/CI LIVE prima di continuare. La diagnosi catalogVersion999/getByRole ereditata dalle consegne precedenti non è indebolita inR2.

## Binding dell’artefatto

Inventario finale 1608 sorgenti SHA256 `8a9497d14b2b6d507bce3683452f2cb26fe09915396a423ad148037d8d2d1a42`. Pubblico 20 asset, manifest `651f6b31501f00fb14048607c4529675961821044e568ab3c13bf06af7fa418d`; privato 759 asset, manifest `0aef183a20dea2c85c879cf14b58c54043aeee2d4264a2b0aa76b93f75a20f5c`. I 20 file pubblici sono byte-identici alla fase bec05cc. Manifest e inventari accompagnano i pacchetti; il privato non è distribuito sul cloud.

**Correzione del processo di build:** era stata preparata una build con Studio riusato perché i521sorgenti e gli asset coincidevano. Vite incorpora però anche il commitGit nell’identitàStudio: l’uguaglianza dei sorgenti non copriva tutto il contesto di build. Questa build è stata esclusa prima del percorso finale; Studio è stato ricostruito su `bec05cc` e poi su `36cdba3` dopo i fix, e il candidato verificato controlla anche `window.__ARDESIA_BUILD__.commitSha`. Le prove precedenti mantengono le loro head e non sono rinominate retroattivamente.

Riproduzione con runtime previsti dai lock e dipendenze installate:

```sh
python3 bin/build_teaching_candidate.py --output /tmp/ardesia-r2-public-fresh
python3 bin/web/check_teaching_candidate.py --candidate /tmp/ardesia-r2-public-fresh --report /tmp/r2-public-gate.json
python3 bin/web/serve_teaching_candidate.py --directory /tmp/ardesia-r2-public-fresh/public --port 5442
# In una seconda directory nuova, solo per QA locale:
python3 bin/build_teaching_candidate.py --output /tmp/ardesia-r2-private-fresh --include-private
```

Per il gate pubblico usare una build separata senza `--include-private`, oppure la proiezione pubblica verificata: il full privato mantiene il tripwire vendor già documentato inR1 e non è certificato distribuibile. Il report deve stare fuori dal candidato. Il builder pretende una directory nuova; non sovrascrivere prove storiche. Per la QA locale riusare il seed sintetico `bin/study-demo/seed_course_capabilities.py --data-dir <directory-privata-nuova>`, StudyAPI SQLite e factory esistenti; credenziali solo nel file privato, mai nei log o nel repository. Il runner finale dichiara URL, store sintetico e identità dell’artefatto richiesti.

## Test e controprove

CI associata alla head `bec05cc`: [ci40137915671](https://github.com/AndreaMarro/ardesia/actions/runs/40137915671) e [marketing40137915753](https://github.com/AndreaMarro/ardesia/actions/runs/40137915753), entrambe SUCCESS. Gli8job hanno eseguito il checkout del merge ref `638f3465078bcdf39502f4ef5fc4f6f1a79ec644`: prova dell’integrazione della head con la base, distinta dalle suite locali detached sul prodotto. Le API GitHub confermano lo stesso tree `ae21331acbf30c5e73f9db8a870bb44f5283bb9e` per merge e head: contenuto testato identico al freeze. Web usaNode26.5.1, StudioNode22.23.3, Engine/API CPython3.12.3 eMCP3.13.17; localeAPI usaPython3.13.14 dal lock.

| Ambito CI | Esito |
| --- | --- |
| Web |346test; typecheck/build;6spec pubbliche e1percorso physics nel browser |
| Studio |2273PASS/5SKIP; typecheck/build |
| Engine |2654PASS/29SKIP |
| StudyAPI/Core |951PASS/30SKIP e12unittest del candidato separati |
| StudyMCP |23PASS SDK stdio→HTTP/Core; nessun host commerciale o nuovo writer dimostrato |
| Marketing |9unit,36check viewport su3motori completati |
| Golden path |1PASS, jobadvisory con continue-on-error: non prova vincolante del replayStudio |
| Hygiene |SUCCESS |

Localmente: baseline324Web; primo full342PASS/1FAIL, successivo346PASS/52file; Core/API950PASS/30SKIP prima dell’ultimo guard,124focused dopo;7focusedfrontend dopo gli ultimi fix pubblici. Log e runCI restano datati, senza sommare come test distinti le ripetizioni degli stessi casi. Gli skip provider/DB non sono verifiche remote positive.

- **Caricamento React:** falliva l’headingTaylor mentre corso/topbar corretti e modulo ancora inSuspense. Controprova controlla il modulo reale con routing già terminato; rilascio→render. La fixture attende il modulo; nessun timeout ampliato o asserzione catalogo obsoleto rimossa. Il primo runner root senza dedupeReact era configurato male, conservato come tale.
- **Core:** review non autrice produce interoJSON enorme→OverflowError/500; finite guard sicuro per scalar e ratio→422/zero scritture. Probeimmutato RED→GREEN e regressioneHTTP permanente. Pin/versione/digest, fonte, appartenenza, crossattore/edizione, retry409, due writer e assistenza tra revisioni coperti.
- **UI privata:** probe non autori verificano fonteheadmutata senza cambio del pin e risposta tardiva del corsoA che non popolaB. Ultimo indizio native-disabled perdeva focus→aria-disabled con guard mantiene il bottone; controprova nativa7check senza nuove consegne.
- **UI pubblica:** secondo «nuova prova» ripeteva gli stessi parametri→alternanza anche di riferimento; RED/GREEN conservati. EtichetteSVG a360 erano8,69px→14,9px effettivi,16,4px a390. Review finale80check,4percorsi nativi e36oracoliSI; nessunfinding aperto nell’ambito dichiarato. Due asserzioni iniziali dell’extractor REA sul focus non supportato sono sostituite da lettura nativa, restano errori di copertura e non vengono chiamate REDprodotto.

## Prima prova privata su bec05cc

Sul primo candidato con Studio ricostruito su bec05cc:55controlli in due segmenti documentati; UIlogin sintetico docente/student03, oggetto annotato, MediaRecorder nativo alimentato da tonoWebAudio, stopdrain/rilascio track, proposta senza pubblicazione implicita, fonte di gruppo confermata intenzionalmente, revisione/pin canonici. Quattro ricevute:2000Pa errati→19620Pa con aiuto e parent dell’originale→120945Pa→114335Pa con problemi diversi e assistenza distinta. Nessun risultato prima della previsione; feedback pubblicato e riletto dallo studente; docente ritrova originale/osservazione manuale CANDIDATE nel diario.

Browser studente indipendente: prima mediaUNAVAILABLE, poi importazione esplicita `.lesson` nello store nuovo e replay dello stesso audio/oggetto. A390 il viewport salvato desktop richiede il comando esistente «Inquadra contenuto» per portare l’oggetto nel campo visivo: prima/dopo documentati; non è un autofit già implementato. FontsStudio locali200, reduced-motion e screenshot privati390/1440,0errori applicativi. Restano2GET/me abortiti nella navigazione strumentata immediatamente dopo login, non sono cancellati dai log né errori di una mutazione.

Primo segmento:38controlli prima che il solo runner confrontasse la coppia resourceId/revisionId con source_ref che comprende anche contextId. L’osservazione era già stata creata; proseguimento da quel diario con la stessa ricevuta, senza duplicare consegne/feedback. Confronto esatto dei due pin e del contesto, verifica completa1607sorgenti/759asset prima/dopo. Report iniziale e continuazione restano distinti: non è un falso unico run tuttoverde.

## Fix dei due P2 emersi nella prima prova

Entrambi sono chiusi nel commit `36cdba3`, mantenendo i RED precedenti e la prima prova sul suo SHA. Nessuna seconda PR o nuova dipendenza.

- Diario: il form guidato richiede `thread.originalExerciseId`, congelato dal Core da submission.activity_id, uguale alla capability attiva e la stessa edizione. Hydro, origine mancante, trasferimento o mismatch restano manuali con spiegazione. Nessuna inferenza da concetto o semplice appartenenza a Fluidi. RED6FAIL/2PASS→21focusedPASS (8nuovi), Web completo354PASS/53file; Poiseuille e Taylor reali preservati.
- Replay: ResizeObserver sui bounds reali, doppioRAF cancellabile, annullamento e reset della cache su dimensione zero, cleanup al cambio lezione/unmount. Pan/zoom/scrub/audio a dimensioni ferme non ricentrano. Il primo RED riproduce il vecchio viewport; review e autore trovano anche resize390→0→390, RED prima della correzione del callback pendente.33focusedPASS/typecheck; gate originale immutato `VITEST_MAX_WORKERS=1 bash eval/gate.sh`:2277PASS/0FAIL/exit0, incluso un replay browser, senza SKIP_REPLAY.
- Review non autrice finale:20probe sulle closure/espressioni reali e controfattuali, nessun finding aperto nello scope. Primo errore di wrapper TypeScript conservato; non è un test prodotto fallito. Il wrapper package review.sh punta a uno sibling personale assente: review separata effettuata da un agente non autore, senza modificare il gate.
- Nuovo candidato costruito con il builder standard sul commit esatto, nessun riuso di buildStudio precedente. Prova nativa finale21/21: quattro larghezze e apertura diretta390, oggetto visibile senza fit manuale, pan e timeline preservati, audio con digest esatto, nessun errore runtime o richiesta fallita.

## Percorso continuo finale su 36cdba3

Studente sintetico06 nuovo:56/56controlli in una sola esecuzione,1608sorgenti e759asset verificati prima/dopo, Studio espone lo SHA corretto. Docente→annotazione/cattura→fonte di gruppo→quattro ricevute→recupero/import in browser indipendente→feedback→diario manuale senza form Poiseuille. Le quattro consegne mantengono la fonte esatta e distinguono2000Pa errati,19620Pa assistiti,120945Pa e114335Pa senza nuove richieste di aiuto. La correzione mantiene parentId e originale.

La UI dello studente conserva lo snapshot caricato prima della pubblicazione del docente. Nel run finale si verifica esplicitamente che il feedback nuovo non sia ancora nello snapshot, poi si ricarica la pagina attraverso il browser e si legge il feedback esatto. È un gesto del percorso, non una notifica realtime o un fix di sincronizzazione implicita. Il primo tentativo36 si fermava su networkidle prima delle mutazioni didattiche; il secondo05 arriva a43controlli e viene continuato in sola lettura fino61 senza duplicare le quattro consegne. Questi negativi/segmenti restano separati dalla prova unica06. Non si aumentano timeout o si chiamano flaky i casi.

CI finale del prodotto, tutte SUCCESS/attempt1: [ci40140273151](https://github.com/AndreaMarro/ardesia/actions/runs/40140273151), [studio-preview-readiness40140273173](https://github.com/AndreaMarro/ardesia/actions/runs/40140273173), [marketing40140273245](https://github.com/AndreaMarro/ardesia/actions/runs/40140273245). Nove job, con Studio readiness di sola verifica senza deploy. Conteggi effettivi: Web354; Studio2276PASS/5SKIP e stesso conteggio ripetuto in readiness; Engine2654/29SKIP; API951/30SKIP più12unittest; MCP23; marketing9unit e36viewport/3motori. Checkoutmerge `7ec8e6fa5e7de56085379940c1bce93996df7c81`, tree `f3896074fa0323cb4b88fe7ce361913574bcc45d` identico alla head36cdba3. Le ricevute CI archiviate indicano checkout/tree/conteggi reali; le successive head documentali hanno risultati propri nella PR. Le suite locali complete354Web e gateStudio2277 sono distinte da questi run.

## Prestazioni e costi

Confronto pubblico R1 `9121948`→R2 `bec05cc`: sempre20asset,2.570.117→2.595.281byte (+25.164); JS+24.121 eCSS+1.043byte, nessuna libreria aggiunta.12campioni alternati con contesti nuovi, Chromium148/Node26.5.1, viewport390, reduced-motion, stesso hostloopback non controllato:3richieste iniziali,0pageerror/overflow/animazioni attive. MedianaDOM27→27ms; clickautomation→risultato45,8→37,7ms. Sono dati descrittivi che includono l’automazione, non fieldINP né miglioramento causale.

Taylor41campioni: benchmark CPU Python3.13 sullo stesso input0,1223→1,9423ms (+1,82); JSON539→6784byte. Non misuraHTTP/produzione o costo totale. Costi complessivi REA e alternativa diretta UNKNOWN; nessun confronto economico inventato, test di carico o efficacia didattica umana effettuati.

## Cloud e limiti residui

Prima preview Vercel deployment `dpl_EiocJ3vy9RVLJG3fJXk7xHU4GQoa`, progetto `prj_cLYaIqgzRZJFZGDcAsyvZBDzhgT8`/team confermato. Targetnull=preview,SSOpreview attiva prima/dopo, nessun dominio o produzione. Solo20file pubblici e regoleHTTP esplicite, metadatiGit `bec05cc`. Il link temporaneo d’accesso e i cookie restano fuori daGit e dagli output. Le prove HTTPS finali verificano20/20byte identici, CSP/media-self/noindex/no-store,6percorsi privati/ignoti404 e100/100controlli su360/390/820/1440;0pageerror/consoleerror/abort nel run finale. CTA→landing conserva il corso e il messaggio d’interesse; nessun invio. Il primo runner registrava8FAIL di selezione corso e5abort, leggendo prima che la landing finisse la navigazione e lo scriptdefer: run conservato; fence su load e controprova col veroJS distinguono l’inizializzazione dal routing. Non chiamato flaky e non corretto alcun byte prodotto per far passare il runner. La ricevuta READY resta una prova distinta dal collaudoHTTPS.

Preview finale aggiornata allo SHA36cdba3: `dpl_DFzshU93DT5N746XiPYr26dyjpcx`, [URL protetto](https://ardesia-fisica-preview-p4t6b0w96-andreas-projects-6d4e9791.vercel.app). Nuovo controllo fisico HTTPS:100/100,20/20asset200 byte/SHA identici,6path404,0errori/abort/hostesterni; anonimo302 e accesso autorizzato200, SSO mantenuta. Il binding finale e l’equivalenza pubblica sono archiviati separatamente dalla prima preview bec05cc.

Render confermato MyWorkspace `tea-d4gouafdiees73b2m8f0`: servizio `srv-dbdu1g3l550s738cq3t0`, branch storico `pro/ardesia-golive-02-20261024`, autoDeployoff. Nessuna mutazione: non è la betaR2.

Approvazione scientifica/editoriale/audio e quattroDRAFT ancora pendenti. PrivatebetaAuth/Storage/inviti, trasporto remoto dei media, hardware/FSA/devicefisici, rollback operativo remoto, consumoCPU/FPS/fieldINP e pilot umano NOT_RUN. Le capacità future di plugin/risorse sono un mandato verificabile, non funzionalità già consegnate. Nessuna produzione, DNS, pagamento, acquisto o scheduler.
