# S09 — acquisizione calendario, addendum del 26 ottobre 2026

Questo documento aggiunge un batch allo storico S09. Non sostituisce il README
del primo incremento né le sue prove. PR #307 integrata da S00 in
`992d1a0b5cdf40d94259d3be698a4d6c5dcc1231`; la CI e il browser di quella PR
non certificano questo calendario. Branch successivo:
`codex/s09-calendar-acquisition-20261026`, stesso worktree e namespace.

## Capacità acquisita e decisione

**ADAPT di FullCalendar Standard 7.1.3**: sottosistema completo delle viste mese,
settimana oraria, giorno e lista, navigazione, localizzazione italiana,
posizionamento degli incontri in Europe/Rome e interazione da tastiera.
Il consumer è il disclosure «Calendario delle edizioni» nella regia tutor della
pagina Corsi. Caricamento lazy con fallback; filtro per edizione, date storiche,
dettaglio con anno/offset e collegamento all'edizione. Il mobile parte dalla
lista; la settimana può scorrere all'interno del calendario.

La proiezione usa `agenda()` e le edizioni già lette/autorizzate dal Core. Non
aggiunge fetch, storage, account, database, motore di prenotazione o scritture di
calendario. Drag/resizing/selezione di intervalli disabilitati; nessun plugin
interaction o Premium. Nessun contatto/invito o pagamento reale.

## Ricerca precedente e tre candidati

Registro conservato: `registry/TARGETS.json`, 139 risorse,
SHA256 `df6d75716ab99dbd79d98d666818e56f75a9ebcd2dcb9a61e0a60516c2ad1141`.
Pertinenti TARGET-021 Teachworks, 022 TutorCruncher, 024 MakeLesson,
118 TanStack, 120 Cal.com, 121/122 provider calendario e 123 RFC5545.
I tre renderer seguenti non risultavano registrati alla ricerca per nome;
`registry-proposals.json` è un delta proposto a S12/S15, senza inventare ID o
modificare il registro condiviso. Consultazione GitHub effettiva su #306:
commenti 6405615343 e 6405645256. Le risposte non sono presunte.

| Candidato verificato | Capacità/closure | Decisione motivata |
| --- | --- | --- |
| FullCalendar Standard React 7.1.3 | React 17–19; quattro viste incluse nello stesso package; fusi IANA; closure sei package | ADAPT. Evita un layout/calcolo di intervalli originale e un secondo framework UI. Solo plugin Standard MIT. |
| React Big Calendar 1.20.0 | MIT; peer React19; localizzatore separato; 16 dipendenze dirette dichiarate | DEFER. Ulteriore superficie Moment/DayJS/Luxon/overlays. Segnalazioni upstream timezone DayJS #2807 e popup tastiera #2764 aperte: rischi da verificare, non prova di incompatibilità generale. |
| Schedule-X React 4.1.0 + calendar 4.9.1 | MIT; peer React19; Preact, signals, temporal-polyfill esatto 0.3.2 e conversioni ZonedDateTime | DEFER. Valido candidato, ma aggiunge altro runtime e mapping non necessario al consumer attuale. Non installato nel prodotto. |

Fonti primarie: [FullCalendar React](https://fullcalendar.io/docs/react),
[fusi](https://fullcalendar.io/docs/timeZone),
[Standard/Premium](https://fullcalendar.io/license),
[accessibilità](https://fullcalendar.io/docs/accessibility),
[eventInteractive](https://fullcalendar.io/docs/eventInteractive),
[RBC registry](https://registry.npmjs.org/react-big-calendar/1.20.0),
[RBC localizzatori](https://github.com/bigcalendar/react-big-calendar#localization-and-date-formatting),
[RBC #2807](https://github.com/bigcalendar/react-big-calendar/issues/2807),
[#2764](https://github.com/bigcalendar/react-big-calendar/issues/2764),
[Schedule-X React](https://registry.npmjs.org/@schedule-x%2freact/4.1.0),
[calendar](https://registry.npmjs.org/@schedule-x%2fcalendar/4.9.1),
[zone/eventi](https://schedule-x.dev/docs/calendar/events).
Confronto indipendente read-only del reviewer; nessun runtime delle alternative.

## REA Evidence e limiti

Runtime strumento locale: `rea-agents 6.7.0`. Provider statico
`rea-javascript-application` versione `1`, non confuso con la versione del
pacchetto. Parent Evidence:
`ev_c7746ece6181ad5412ff4d108d658379a381e65b6eb32477e6eeb192756121f1`.
Riepilogo:
`ev_ae47cd0d34c7ca528658771aca61e94526e0db72ade56ec225a29bb475f4b4bf`,
salvato in `rea-static-summary.json`.

Analisi inerte dei sette percorsi distribuiti selezionati: package.json,
index.js, public-api.js, chunks/c0b7e8fb.js, daygrid.js, timegrid.js, list.js.
Sei JS analizzati, zero parse failure; 12.548 byte letti. Artefatto estratto
SHA256 `c0a6ae4072b9b56bc65ea884ecae75142cd189ee3fc26f1b5a5d883f32a0014d`.
217 file fuori selezione; grafo parziale, unknown semantici troncati al limite400.
Non è un audit completo, non osserva esecuzione né prova assenza di rete.

Bundle completo esportato prima dell'interruzione della chat:
`outputs/S09_REA_STATIC.bundle.json`, 2.935.020 byte,
SHA256 `ae6ba226ccb20a5beabe74ea173b45ded2eef5e8dc5e14228454a6772c623e25`.
Dopo l'interruzione il riferimento non era più nel ledger della nuova
connessione: una richiesta di vista ha restituito `missing`; il bundle
portabile è conservato, senza ripetere il produttore o inventare dati.

Lettura diretta della distribuzione e delle API v7: il componente conserva
CalendarApi/DataManager in useState, applica le props e chiama destroy nel
cleanup; useCalendarController espone navigazione e stato della vista. Questo
motiva il riuso del controller e il montaggio nel boundary di sessione Ardesia.
È osservazione di sorgente distribuito, non prova di lifecycle eseguito.
Runtime REA/E2E del consumer: ancora da completare al checkpoint sotto.

## Provenienza, licenze e packaging

`provenance.json` conserva tarball ufficiali npm, SHA256, integrità SHA512
verificata, manifest, repository e hash delle licenze. Closure completa:

- @fullcalendar/react, @fullcalendar/core, @full-ui/headless-calendar: 7.1.3 MIT.
- temporal-polyfill 1.0.1 e temporal-utils 1.0.1: MIT.
- temporal-spec 1.0.0: Apache-2.0.

React/ReactDOM 19.2.6 già presenti in Ardesia. Nessun Premium, acquisto o asset
proprietario. Licenze originali in `licenses/`, notices anche nel chunk lazy e
consultabili dalla UI. Codice donor distribuito da npm, non copiato nel repo.

Patch proposta al writer S00: `../dependencies.patch`, 3.902 byte,
SHA256 `3500827e6baa7b25ff0793af45915c733dbc44dabfc5aa3811ea3d95d07825b0`.
Risolta con npm --package-lock-only in scratch; git apply --check PASS su main
992d1a0b. Manifest/lock reali non modificati a questo checkpoint; il runtime
locale è isolato in work/, non rende riproducibile un checkout pulito. **Nessuna
PR di consumer dichiarata pronta prima del raccordo delle dipendenze.**

Funzioni originali limitate a proiezione/filter/dettaglio, integrazione con
permessi/session epoch, boundary, notices e tema Ardesia. Layout delle date,
viste, tastiera/navigazione e fusi sono del sottosistema acquisito.

## Registro append-only — checkpoint iniziale

26/10/2026, fonte iniziale595fbb79, poi nuova base992d1a0b:

1. Test con FullCalendar reale (nessun mock) 2 PASS in10,35s: owner/cancelled,
   storico, le due02:30 Roma con GMT+2/GMT+1, filtro e rimozione selezione obsoleta.
   Typecheck exit0 PRIMA delle successive correzioni CSS/API: non trasferito.
2. E2E run1 FAIL: fixture sovrapponeva due incontri90min, Core409 calendar_conflict.
   Corretto scenario: prima02:00 earlier, seconda02:30 later; date successive
   adiacenti18:00/19:30. Non si modifica il vincolo Core.
3. Run2 FAIL: Vite scopre il nuovo lazy package, ottimizza e ricarica la pagina
   chiudendo disclosure. Console/pageerror vuoti; rilancio su cache riscaldata.
4. Run3 FAIL: riutilizzo di chiave idempotente con expectedRevision cambiata,
   Core409 idempotency_conflict. Harness ora include la revisione nella chiave.
5. Run4/5 FAIL: testo degli incontri presente e orari corretti, selettori v6
   inesistenti in v7. Correzione verificata sui tipi/sorgenti: v7 `eventClass`
   accetta STRINGA, non array; `viewClass` e className propri per CSS stabile.
   Aggiunta asserzione del vero evento tabbabile, da eseguire dopo correzione.
6. Interruzione chat termina processi propri; verifica ps zero browser/API/Vite
   S09. Slot rilasciato su GitHub6405804739/6405826740, senza toccare PID altrui.
7. Correzione datata della sintesi «6MIT» in6405804739: closure5MIT+1Apache2,
   pubblicata in6405816404, licenze originali conservate.

I FAIL non sono contati come PASS. JSON/DOM/screenshot restano nei run locali;
nessun token/DB nel repo. Nessuna approvazione umana o distribuzione attestata.

## Debito e prossimi passi per S00

1. Applicare la patch dipendenze dalla coda S00; poi checkout riproducibile e CI
   sul commit esatto. Nessun vendor per evitare coordinamento.
2. Finestra concordata: test corretti, build, un Chromium + REA sul consumer,
   Roma/DST da browser Honolulu, quattro viste, filtro, reload, revoca401,
   screenshot1440/820/390 e hash. Runtime attualmente non certificato.
3. Review e PR del solo batch completo da992d1a0b, integrazione sequenziale S00
   e verifica main/postmerge. Backend remoto/deploy rimangono distinti.
4. Prossima acquisizione: disponibilità e proposte di spostamento, soltanto dopo
   contratto S10 di audit/riconferma; confronto TARGET021/022/120/123 già avviato.
   Non trasformare drag di calendario in una scrittura Core non autorizzata.

Appendice RUNLOG/NEXT consegnata tramite questo file e successivi checkpoint;
writer comuni S00. Il gestionale avanzato, pricing configurabile, recuperi,
disponibilità persistita e ambiente remoto restano incompleti.

## Checkpoint successivo — 26/10/2026, prima della prova browser finale

Suite namespace su codice corretto: **18 PASS**,4file,32,92s, un solo worker.
Include asserzione del tabindex0 sul vero evento FullCalendar con la classe v7.
Log `work/s09-calendar-tests-corrected.log`. Non è ancora browser/CI/build.
S15 ha proposto icalendar7.3.0 test-only in307/6405772410; risposta effettiva
6405917529: DEFER al batch interoperabilitàICS perché questo renderer non cambia
serializzatore/receipt. Conservare byte/hash storici; oracolo e conformitàfisica
CRLF/folding distinti, nessuna adozione già asserita.

26/10/2026, fonte b91ac19c: browser run6 FAIL sulla ricerca label esatta del
filtro. Eventi v7 presenti (prima asserzione2PASS); console/pageerror vuoti.
Correzione consumer: associazioni label/for esplicite con useId, evitando che
le opzioni del select entrino nel testo della label implicita. Test e browser
da ripetere; non aumento timeout.

26/10/2026, fonte bd264c66: run7 FAIL discrimina salto di periodo al filtro.
Il consumer spostava automaticamente alla prossima data, perdendo il periodo
storico scelto. Correzione: filtro cambia soltanto gli incontri, conserva periodo;
aggiunta regressione con date passate/future e nome accessibile esatto.

26/10/2026: regressioni dopo label/filtro **3 PASS** in6,64s, calendario
reale, nessun mock. Il filtro conserva il mese storico quando esistono anche
incontri futuri. Suite namespace18PASS precedente distinta da questo rerun3.

## Prova conclusa — 26/10/2026, fonte542921b6

Browser reale **PASS**, uscita0, applicazione identica a fe355ff2. Il runner
`../prove-calendar.mjs` usa un solo Chromium, cookie reali/API originaria e
SQLite sintetico. Otto incontri di due edizioni dello stesso tutor, date
configurate via HTTP Core, nessuna risposta di rete mockata. Browser
Pacific/Honolulu, calendario Europe/Rome: primo incontro attraversa il cambio
d'ora (02:00 GMT+2 →02:30 GMT+1 in90min), secondo parte02:30 GMT+1. I due eventi
sono adiacenti, non sovrapposti; le due02:30 distinte sono anche coperte dal test
reale del componente. Filtro conserva periodo e dettaglio/link corrispondono.

Tastiera: apertura disclosure e attivazione evento con Enter; quattro viste,
roundtrip prev/next. Screenshot desktop1440 mese, tablet820 settimana,
mobile390 lista; nessun overflow della pagina. Settimana mobile scorre nella
propria griglia, tap reale cambia vista. Reload rilegge le date Core; revoca
reale401 elimina calendario e intero pannello tutor. Errori console/pageerror
inattesi0; un401 atteso registrato separatamente. Prima apertura1450ms osservata
in questo scenario, non benchmark generale. `calendar-evidence.json` e tre
screenshot nel presente percorso; `artifacts.json` conserva byte/SHA256.
Screenshot desktop/mobile ispezionati visivamente: testo, controlli e dettaglio
leggibili; titolo lungo compattato nell'evento, completo nel dettaglio.

**REA runtime riuscita distinta dalle azioni:** REA CDP provider versione2,
HeadlessChrome148.0.7778.96,
Evidence `ev_02650d0a6c3f6e6218cb871bb7e4f20e34ce8c5eb5dd300131a4d1c7190e61d6`.
Osservazione passiva della medesima pagina autentica dopo le azioni del runner:
DOM/accessibility del calendario, filtro e incontri. Non ha eseguito azioni.
Copertura policy_filtered e attach_limited, nessuna sezione troncata o
indisponibile; sorgenti/cookie/body/storage intenzionalmente esclusi, attività
di rete precedente non ricostruita. Zero richieste durante la breve finestra
non prova assenza generale di rete. Identità dell'artefatto non fornita dal
provider; fonte attribuita al processo Vite nel worktree e al commit del runner.

Bundle portabile completo `outputs/S09_REA_RUNTIME.bundle.json`:188458byte,
SHA256 `dc36123df5cd3a10353a5bf2fd2550c5f6cbbd60d9b189e02b983414aa922da0`.
`rea-runtime-summary.json` conserva limiti e nodi rilevanti. Prima di questa
osservazione `capture_browser_scenario` è FALLITO con execution_failure e
cleanup_incomplete, senza Evidence di azioni riuscite: errore integrale in
`rea-scenario-failure.json`. Non ripetuto a input invariato, nessuna configurazione
o installazione modificata. Browser esistente poi chiuso dal runner (uscita0),
nessun Chromium54929 residuo. API61433/Vite61436 terminati dopo verifica comandi
propri, rilascio effettivo GitHub6406114368. Nessun processo altrui toccato.

Review indipendente source-only successiva alle correzioni: nessun finding
azionabile; nessun test/browser aggiuntivo eseguito dal reviewer, nessuna firma
umana. Verifica live separata del primo batch:307MERGED in992d1a0b e
postmergeCI40251190531SUCCESS. Questo non attesta il nuovo calendario.

### Stato di integrazione al presente checkpoint

Consumer locale e E2E completi; **packaging condiviso ancora PENDING_S00**.
La patchesatta dei due manifest è pronta e verificata, ma non è autorizzato un
vendor per evitare la coda del writer. Una revisione locale non sostituisce
npmci/CI sul commit finale. Nessun rilascio remoto o DONE del batch acquisizione
finché S00 non integra dipendenze, PR/check e main. L'interfaccia usa solo date
già presenti nel Core: non sblocca pricing, rinvii, recuperi o disponibilità.

## Controprova CI e ripresa filesystem — 26/10/2026

CIcefda140 run40254045727: Core/API/MCP/Studio/goldenPASS; WebFAIL per
dipendenze mancanti e opzione exact non ammessa in ByRoleOptions. HygieneFAIL
per una riga vuota finale nelle notices first-party. Corretti opzione di test
e blankEOF, licenze donor originali intatte; non cambia comportamento del
consumer verificato nel browser. PackagingS00 e nuovaCI ancora pendenti.

macOS ha evictato .git e sorgenti in Documents (compressed,dataless): lettori
Git bloccati. Richiesto brctl download dei soli tre file propri, ancora non
materializzati. Checkout originale e filecloud preservati. Per procedere
creato checkout sparso da ESATTOcefda140 nel solo /private/tmp/ardesia-s09-
calendar-recovery-20261026, branch codex/s09-calendar-recovery-20261026.
La correzione va alla STESSA320 con push fast-forward, nessuna nuovaPR e nessun
branchreset/forcepush; il checkout originale potrà incorporarla normalmente
quando iCloud restituisce i file. Terminati soltanto lettori propri bloccati.
