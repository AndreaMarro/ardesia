# Validazione del candidato, 24 ottobre2026

Base `f456ade218acee1a8b65f5dc24e9220681658b11` (#298); branch `codex/ardesia-convergence-rea-deep-20261024`. Il manifest della composizione identifica i sorgenti applicativi, inclusi nuovi file, dipendenze locali e hash degli asset. I report dei singoli autori conservano la propria base/manifest: una nuova prova non è attribuita retroattivamente a un run precedente.

| Controllo | Risultato e perimetro | Evidenza |
| --- | --- | --- |
| Web completo dopo tutti i fix Web |312 PASS,47 file, Node26.5.1,42,07s, dopo upgrade MathLive0.111.1 | `evidence/core/web-full-closed.log` |
| Studio completo prima dell'ultimo guard revoca |2259 PASS/5 skip storici,165,67s; gate2260/0 incluso replay | `evidence/studio/full-studio.log`, `gate-frozen.log` |
| Studio guard finale |197/197 focused Node22.14 + typecheck; gate2274/0 dopo font/lazy/MathLive0.111.1, incluso replay nativo; sette regressioni prepare più sette per il delta font | `evidence/studio/README.md`, `profile-prepare-fix.json`; `gate-mathlive-fonts-frozen.log`, replay e hash finali nel verbale Studio |
| Core/API completo |854 PASS/30 SKIP espliciti,1 warning,69,10s; ambiente Python3.13 svuotato dei provider | `evidence/core/core-api-full.log` |
| Engine completo |2628 PASS/27 SKIP espliciti,76,27s, provider live non abilitati | `evidence/core/engine-full.log` |
| MCP quattro letture |23 PASS,19,70s; SDK reale stdio→HTTP→Core/SQLite | `evidence/core/mcp-reads.log` |
| Marketing / artefatto |9 test stdlib PASS;2 test builder/server PASS, con veri404, noAPI, no directory listing, traversal e file privati rifiutati | `evidence/core/marketing-unit.log`, `artifact-unit.log` |
| Pubblico sul pacchetto composto |6/6 spec PASS a360/390/820/1440, keyboard, focus, reducedmotion, stop/resume dei frame, reset, audiofinale e CSP | `evidence/poiseuille/public-e2e-artifact-final.log` |
| Privato docente–studente–docente |31/31 check PASS: fonte esatta,4ricevute, correzione figlia assistita, prova diversa e verifica umana diario; zero pageerror/requestfailed/console | `evidence/poiseuille/bridge-journey-complete/result.json` |
| Studio UI reale |36/36 check PASS su4viewport, oggetto selezionato, fit, font, MediaRecorder nativo, noauto mic e riferimenti obsoleti | `evidence/studio/browser-final/result.json`; anteriore al successivo guard read-only |
| Review indipendente |118 check pubblici,68 landing e controprove di focus,8delta pubblici,12 native import/revoke; finding e chiusure nel report, non certificazione universale | `evidence/review/`; alcuni assert iniziali del runner confutati sono conservati |
| REA A/B/C |CLI6.7.0, tre ticket13campi e originali ID/digest; A focus RED/GREEN | `evidence/rea/`; completezza e limiti per singola ricevuta |
| Igiene |localchecksfast READY_FOR_REVIEW: non è full; NUL/secrets/workflow/doc/state/whitespace da rileggere dopo staging | log finali e CI sul proprio SHA |

Gli skip Studio dipendono dai corpus screenshot storici assenti. Gli skip Python sono elencati `-rs`: auth/PG/Supabase, provider/corpus reali o checkout legacy non disponibili. Non attestano servizi remoti o apprendimento. Il warning FastAPI/TestClient è conservato, senza aggiornare dipendenze fuori scope. CI Studio usaNode22, distinta dal full/gate locale26; typecheck e197test del nuovo guard sono stati eseguiti anche conNode22.14. Nessun lock, gate, timeout o asserzione di rifiuto obsoleto è stato indebolito.

## Risultati negativi, confutazioni e correzioni

La diagnosi CI-CATALOG richiesta nel primo mandato è già nella base#298: originale con runtime26.5.1, controprova listener fra commit React e effect, getByRole conservato, findByRole incapace di recuperare un popstate perso, layout subscription. Questo incremento conserva il rifiuto catalogVersion999 e non rinomina il caso flaky. La nuova full312 include quel contratto.

La review nuova ha prodotto quattro difetti concreti: contrasto delle etichette SVG3,656:1→7,215:1; pin duplicati accettati via getAll.join nel Web mentre Core li rifiuta; proposta structuredclone ciclica non serializzabile; revoca completata durante prepareLessonPassage dopo il controllo iniziale. Ogni RED è preservato. Il guard finale verifica availability e ricostruisce marker/digest/scena sotto la lease canonica della lezione, con una porta scoped sola lettura che non può riacquisire il lock o mutare consenso. Non c'è una nuova autorità di revoca. La prova browser ordinaria31/31 precede questo guard; la regressione indipendente e il nuovo gate lo verificano separatamente.

Errori dei runner distinti dal prodotto: opzione `exact` di Playwright usata per errore in TestingLibrary, selector select/textarea ambiguo, nativo audio a coordinate a360, primo verifier REA che ignorava scenario_start, benchmark ArrowRight al massimo, campione con asset superato, formatter che assumeva tutti i campioni LCP presenti. Le correzioni restringono il locator o l'oracolo; dati attesi, timeout e difetti precedenti restano visibili. I fallimenti Web iniziali303PASS/3FAIL erano query non univoche dopo l'aggiunta dei pannelli: valori attesi conservati. Il primo test StaticFiles ha fallito per database di fixture non inizializzato; la fixture ora inizializza il DB, nessun startupguard indebolito.

La prima voce demo macOS è ritirata prima della pubblicazione per diritti non adatti: [correzione/provenienza](evidence/assets/README.md). L'asset finale eSpeak formante è stato decodificato e riprodotto nelle repliche finali. Nessun tool GPL o modello vocale distribuito nell'app; nessuna API.

## Prestazioni e revisione visuale

[Campioni originali](evidence/performance/samples.json) e [sommario](evidence/performance/summary.json): tre context Chromium freddi per target a390 e1440, nessun throttle, host condiviso, load + fontready +2frame. Pubblico baseline#298→candidato: JS237028→239504byte (+2476), CSS53674→60065 (+6391). Audio opzionale1806784byte, preloadnone; zero richiesta WAV all'ingresso. Mediana load locale mobile20,5→24,4ms, desktop20,3→20,4ms. Sono tempi di loopback; nessuna equivalenza con smartphone/rete reali. Il proxy range include trasporto automazione e due frame (~30–35ms); non è INP. LCP ha campioni mancanti dichiarati, quindi non sostiene un confronto causale. Nessuna misura fps/batteria/consumo replay completo dichiarata. I byte HTTP richiesti sono ricontrollati contro il manifest; il successivo fix Studio non cambia i file pubblici.

Screenshot del prodotto reale a4viewport e review indipendente: contrasto corretto, testi geometrici mobile ingranditi, focus/overflow e font locali verificati. Non si deduce qualità grafica eccellente da un'immagine o da Lighthouse. Una registrazione continua propria attraversa landing→microcorso→esperimento→recupero→nuova prova→contatto, senza invii; il container video può essere privo di audio, non viene presentato come cattura sonora.

## Provenienza, privacy e limiti

Originali REA donor e screenshot sono conservati nel workspace locale con ID/digest; nessun asset proprietario incorporato. Trace originali del prodotto sono locali: [manifest](evidence/retained-traces.json). Screenshot e ricevute pubblicabili usano identità, testo e media sintetici. La normalizzazione dei `.log` rimuove solo whitespace finale, con originali compressi e hash in `evidence/log-normalization.json`. Il servizio AgentMemory esterno non è stato verificato o modificato.

Reviewer Claude richiesto dal contesto legacy non disponibile: MCP Agent risponde `Available agents: none`; wrapper Studio punta a un file assente. La review effettiva è dell'agente indipendente Codex, non una review Claude inventata: `evidence/review/claude-availability.json`.

La demo pubblica è locale/non pubblicata e il contatto indica interesse. La beta dimostrata è SQLite/synthetic/loopback. Auth remota, RLS, host MCP commerciali, microfono fisico, FSA, altri motori e efficacia didattica rimangono NOT_RUN. Due variazioni di cache ELAB fuori ownership osservate nel checkout sono escluse dalla consegna, senza attribuirne la causa. Nessun merge, deploy, acquisto, pagamento, dato reale o scheduler.

La CI della nuova draft deve essere letta sul suo SHA effettivo. I run verdi40089052314/20/48 appartengono alla basef456, non attestano questa patch. Esiti remoti conclusivi e riferimenti sono aggiunti nella PR e nella consegna finale.


## Delta conclusivo font e renderer

Codice prodotto `375dbe8d50ce46fab1e47704d73e548c797da09c`. Build unico eseguito da quel commit, non attribuito alla sola base sporca; manifest sorgenti/asset in `evidence/artifact/`. Gli asset pubblici sono byte-identici prima/dopo guard Studio e delta font, quindi le prove pubbliche/video restano esattamente attribuite.

Il benchmark ha rilevato un CDN MathLive non fissato in entrambe le versioni iniziali. Compositore ora lazy al gesto,20woff2 locali dalla dipendenza bloccata e due notice MIT emesse. MathLive0.111.1 esatta nei due lock per la correzione ufficiale del renderer/editor: [changelog primario](https://github.com/arnog/mathlive/blob/8d148b4227ca057fa1aefe89c2149cdcf0591443/CHANGELOG.md). RED reale di shadow con attributoSVG inerte, poi GREEN; nessun payload eseguito. Le API rimosse non erano usate; computeEngine=null resta proprietà supportata. Solo MathLive e tre transitive rimosse cambiano nei lock, nessuna nuova libreria. Web312/312 nuovamente PASS, typecheck PASS; Studio115 focused/typecheck Node22.14 e gate congelato finale2274/0 Node26.5.1, hash521 invariati. Review indipendente52HTTP/plugin e9SSR, separata dalla prova browser del build.

La dipendenza MathJax via CDN nella conversione formula→immagine rimane, come richiesto dalle istruzioni del package. Non è richiesta dal percorso Poiseuille/annotazione nativa collaudato; non dichiarare tutta l'app offline. Misure Studio iniziali con CDN sono preservate come osservazioni confondibili; i nuovi sei campioni finali con font locali hanno report distinto. Le prove dei font Excalidraw/MathLive non certificano tutti i possibili renderer o dispositivi.


### Completamento misure private/marketing

Il report `evidence/performance/private-marketing/` conserva24 campioni prima del fix e il relativo FAIL per CDN, poi sei nuovi campioni sul commit375dbe8d:9/9 controlli PASS, byte HTTP uguali all'artefatto, nessuna richiesta esterna o API a compositore chiuso. JavaScript iniziale completato3098580→2306195 byte (−792385, circa25,6%); CSS162842→169721 (+6879). Il delta byte è distinto dai tempi osservati: snapshot canvas/font+2frame854,2ms a390 e860,9ms a1440, host condiviso e cache non controllate. Marketing: JS4986 invariato; CSS15294→17421 (+2127). Nessun confronto causale o dispositivo fisico dichiarato.

Nella prova separata di apertura del compositore, il probe nativo MathLive esegue HEAD sul suo stesso chunk; il collector che tentava response.body su HEAD produceva un ProtocolError e vedeva ERR_ABORTED. La controprova CDP con metodo/initiator distingue questo dal GET200 byte-conforme e dagli errori della pagina. Il raw resta conservato; non si afferma zero requestfailed per quella prova né si cambia il prodotto per mascherare il probe.
