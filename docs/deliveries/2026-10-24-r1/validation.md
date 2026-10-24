# R1 — validazione e limiti delle prove

Base #299 `6f19b1956cedbebf36a5cf097af66e47ed8acecd`. Il candidato è una dipendenza della base, non un’alternativa già integrata in main. Main verificato `b124eee04acc8062c27284f23c5d9108e3767c27`; le32 draft/open PR prima della consegna non includono un successore della299. Nessun ramo concorrente modificato. I risultati precedenti sono conservati con la propria identità.

## Identità delle fasi

| Fase | Fonte / scopo |
| --- | --- |
| Base299 |6f19b195, CI40102192875/65/86 SUCCESS letta, Web312. Non attribuita a R1 |
| CODE1 |c762e30af0dbfb709a68468a71df16449e96c1b5; nuove varianti/Corevisual/assistenza, CSP, checker, Vercel, probe e UX;1595sorgenti |
| CODE2 |706316f0582f88366cd3cad6c5c1227537a6c419; refresh tutor e reflow indice landing;1596sorgenti; nuova review pubblica |
| Prodotto finale |91219486ddf270582bef1c2e0bda2a66796e6e78; solo correzione del focus del refresh dopo RED nativo; binding nel report finale |
| Head draft |Successiva memoria/prove soltanto; leggere head e CI effettive nella draft e nella consegna esterna finale |

Il checkout in Documents ha subito timeout Git/mmap di packed-refs (file32KiB, zero blocchi materiali). Non è un difetto scientifico. Clone GitHub della base esatta fuori FileProvider in `/private/tmp/ardesia-r1-20261024`,33file prodotto verificati perSHA e trasferiti, lock reinstallati: [ledger](evidence/root/checkout-transfer.json). Vecchi checkout congelati, nessun reset di modifiche estranee, impostazione OS o cache ELAB alterata. Le suite finali leggono il nuovo checkout. Due build iniziali con output intermedio condiviso non sono usate come prova di esecuzioni indipendenti: la proiezione marketing è ricostruita sequenzialmente e confrontata byte per byte col full e con la preparazione Vercel.

## Suite eseguite

| Ambito | Esito effettivo / runtime / attribuzione |
| --- | --- |
| Web completo CODE1 |322PASS/47file, Node26.5.1 |
| Core/API completo CODE1 |924PASS/30SKIP, Python3.13.14 dal lock;924 comprende4test del guard visuale aggiunti dopo il primo920 |
| Engine completo CODE1 |2632PASS/27SKIP, Python3.13.14, cwd packages/engine |
| MCP |23PASS, SDK stdio→HTTP/Core; quattro letture, nessun host commerciale o writer dichiarato |
| Web CODE2 e finale |324PASS/48file, typecheckPASS, Node26.5.1; delta solo frontend, Core/API/Engine byteidentici alle suite CODE1 |
| Artefatto e Vercel |12PASS, stdlib; include metadata/symlink/shape e gara fra check/copia |
| Marketing |9PASS, stdlib; build pubblico e privato PASS; warning chunkStudio>500kB conservato |
| Probe e boundary |115focusedPASS:64probe+51boundary esistenti;9regressioni permanenti RED→GREEN dopo review indipendente; probe DNS/host/globalunicast/zero scritture |
| Studio |Sorgente/lock invariati rispetto299; buildPASS. Nessuna nuova suite locale completa rivendicata; la CI finale è separata |

Log raw compressi in[evidence/root](evidence/root). Gli skip sono quelli motivati dalle suite (provider/fixture/ambiente): non trasformano test sintetici in prove remote. Nel primo Engine il cwdroot cercava fixture nel posto errato e l’asserzione del conteggio non separava v1 da v2:15FAIL conservati nel workspace, corretti cwd e conteggio della compatibilità originale; non è classificato flaky. Il primo WebNode26 era durante RED concorrente dell’autore UX e non è una baseline pulita. La spec originale CI-CATALOG999/getByRole e la controprova listener ereditate da298 non sono indebolite o riscritte.

## Contraddizioni e RED/GREEN

- **CSP esportata:**299serviva l’audio localmente ma esportava default-src none senza media-src; WAVready0/NotSupported nel browser con policy reale. Sola aggiunta media-self→ready4/playback e nessuna violazione. Nuova policy condivisa fra server/compositore/output; il fatto che un server locale permetta audio non certifica la distribuzione.
- **Contenuto scientifico:** nuova prova iniziale cambiava solo raggio, non il tipo di trasferimento; sostituita con η2/L2/Qfissa→Δp4. Seconda variante η2/L0,5/Δpfissa→Q1. Dominio completo prima del risultato e visual dal Core. Il caso estremo generava velocità infinita: RED indipendente→rifiuto invalid_physical_domain;4test permanenti, nessun frontend solver.
- **Assistenza:** nuovi ID editoriali potevano perdere disponibilità di un vecchio risultato sul medesimo modello/parametri; ricerca canonica perattore/edizione/versione/parametri normalizzati e lock esistente. Nove attacchi SQLite, due connessioni: esattamente una prima risposta NO_SUPPORT e una SUPPORT nella gara v1/v2, isolamento preservato. NO_SUPPORT_REQUESTED non osserva aiuti esterni.
- **Gate artefatto:** report copiava metadata non validi, lettura indiretta da symlink e shape errata; indipendentiRED→GREEN più test permanenti. La preparazione Vercel rileggeva un manifest alterabile dopo il check: confronto con digest già verificato, copia senza seguire link, rehashoutput e cleanup; controprova immutata passa dopo il fix.
- **Probe:** is_global da solo ammetteva multicast/riservati. Ora solo globalunicast, DNS risolto e fissato, TLS sul nome originale, niente redirect/proxy/token; RED9→GREEN. Anche un preflightPASS restituisce betaReadyfalse e11gate operatore NOT_RUN.
- **Primo uso:** retry perdevafocus e istruzione di Qfissa sopravviveva al cambio manuale→REA/spec/RED4/GREEN6. Testo200 nell’esperienza richiedeva flex-wrap e overflow-wrap sul titolo finale. Review indipendente trova frecce landing fuori12px a360/390: sola terza colonna max-content→24stressPASS e85journeyPASS su706.
- **Refresh tutor:** il nuovo invio non compariva in una pagina già aperta; comando esplicito onUpdate, senza polling o seconda cache. DueunitRED→GREEN; browser vede nuovo invio e selezione/filtro preservati, ma native disabled perdefocus mentre jsdom lo conserva. RED706 conservato; aria-disabled e fence esistente evitano overlap mantenendo il controllo nel tab order. Prova browser finale912 passed=true/offlineRetryPassed=true e activeElement BUTTON; stessa ricevuta, senza rifare A/B. Il primo tentativo912 si ferma per ricorsione nel wrapper esterno di provenance, corretto nel solo runner e conservato nel ledger.
- **Voce:** prima sintesi sperimentale rate140 non corrispondeva al generatore versionato; esclusa. Il generatore invariato eSpeakformante0.3.5/rate0,95 produce WAV esatto SHA530c78a6075ea26949265a80fe9efc7d23083cf638cb600ec52fb42ddc873989,1.882.900byte,42,695s. Testo originale v2 coincide; l’ultima frase introduce η/L senza dare4. Binding deterministico non è ascolto umano.

Le prove indipendenti e i RED originali sono selezionati in[evidence/review](evidence/review). Errori dei runner sono mantenuti: localizzatori/replay/empty-state/contextId, misure prima di Animation.ready/load, collector body su navigazione abortita. Le correzioni cambiano il setup, non le asserzioni privacy/scientifiche né i timeout di prodotto. Il percorso privato è una sequenza di segmenti riusciti, non un falso unico run interamente verde.

## Percorsi effettivi e confronto

Pubblico CODE1:6spec/113check quattroviewport, focus/back/forward/reload/contatto, audio e zeroerrori; ogni bodyHTTP incluso WAVrange è confrontato col manifest. Zoomnativo200% distinto da pageScale/pinch e fontcalcolati200. CODE2: review indipendente85/85 e stress24/24 a360/390/820/1440; domain leggibile prima del risultato, pausa/Enter, grafico e nuova geometria, audio sottoCSP, fontlocali, true404; zero richieste esterne, JSerrori o violazioniCSP. Finali/equivalenze nel binding indipendente.

Privato c762: docente crea fonte esatta su oggetto/scena reale; due contesti indipendenti, student02 senza ricevute pregresse all’inizio. Sette ricevute A/B con errori, recupero e correzione assistita, Atransfer4/Btransfer1 e fonte canonica; nuovo archivio prima mediaUNAVAILABLE, poi import esplicito e replay degli stessi byte. Tutor rilegge feedback, diario CANDIDATE→conferma→attività diversa→verifica esplicita VERIFIED_RESOLVED. Dati sintetici nel medesimo store, zero errore applicativo nei segmenti principali e conclusivi. Delta finale refresh usa questi receipt e un ulteriore invio UI, senza iniezione stato o seconda autorità. [Ledger e limiti](evidence/beta/private-ui/README.md).

Prestazioni baseline299 vs c762:12campioni finali,3per390/1440×plain/CPU4+rete150ms/200000B/sdown93750up;38checkPASS. JS239504→249666byte (+10162), CSS60065→60135 (+70);3richieste iniziali e0API/audio/interazione. Caricamento throttled3901872→1925ms,14401878→1926; proxyevent→2rAF50→50 e52,1→54,3ms. Host/cache non controllati, non è fieldINP, fps o costoCPU%. CODE2 cambia solo CSSmarketing e Reviewprivato; campioni/binding finali separati. Nessun claim di velocizzazione causale. Video continuo del prodotto, senza traccia audio; playbackWAV collaudato separatamente.

REA6.7.0/Node26.5.1 viaCLI, MCPREA non esposto. Un’osservazione nuova CircuitJS cambia esempio e contesto visibile insieme (11stepcompleti); primo Enter non conclusivo conservato. Evidence ev_782935bb9b848aa2257a7502c4fbcf91072b0da21aa8c10375317c3ebb7a9c87, digest2ccbdd1a30b0023cf74ccd500780afec1a9f5aec42882ca5dda0e980144fc3dc. Specifica originale→coerenza del contesto e riprova accessibile→testRED/GREEN. Nessun codice/asset donor adottato. [Ticket13campi](evidence/ux/R1-transfer-ticket.json), costo complessivo e confronto metodo diretto UNKNOWN: durateCLI non misurano preparazione/analisi/engineering.

## Gate rimasti aperti

TechnicalPASS pubblico, **releaseBLOCKED**: reviewer/authorizer/date/decision umani NULL, quattroDRAFT non approvati né esclusi. FullprivatoTechnicalFAIL per un singolo pattern clientFirebase upstream (valore non copiato né usato): la documentazione ufficiale distingue APIidentifier e autorizzazione, ma restrizioni non misurate. Nessuna allowlist o promessa di pacchetto privato distribuibile.

Vercel403 e CLI senza autenticazione; preparazione BuildOutputv3 pronta, nessun target/progetto/deploy creato. Provider headers/404/HTTPS/rollback NOT_RUN. Supabase accessibili soltanto progetti legacy non designati come stagingArdesia: non usati. G0loopback/syntheticonon indebolito; invitiSupabase501. Auth/RLS/Storage remoti, due account reali, login/logout/revoca/inviti/backuprestore, coorte, microfono/FSA/dispositivi fisici e apprendimento umano NOT_RUN. Studio CDNMathJax legacy fuori percorso Poiseuille resta limite della base. WriterMCP/host reale/reader2Engine non implementati qui. MemoriaGit canonica aggiornata; servizioAgentMemory esterno UNKNOWN/non modificato.
