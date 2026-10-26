# S01 — registro append-only

Le voci e gli allegati precedenti restano fotografie datate. Le correzioni
successive si aggiungono e citano la voce smentita; non cancellano il passato.

## 26 ottobre 2026 — checkpoint f3789e73 → abd35ede

Ripresa del mandato V2 e del nuovo mandato comune REA-FIRST, senza nuova chat,
reset del vecchio B o riapertura della review304/306 ormai integrate.
Riletti AGENTS, CANON/ADR pertinenti, RUNLOG/NEXT e handoff del dominio nella
prima parte di S01. Registro139 preservato: JSXGraph è TARGET-083;
GeoGebra018 e Desmos019 sono confronti documentati in REA-REUSE.md.

Codice scientifico e risorse in56d56190; normalizzazione dei soli log test
in f05830e8 (hash originali conservati); catalogo/API/consumer in f3789e73.
Merge ordinario main8e0737b1 in abd35ede, senza conflitti o delta ai modelli.
Main8e0737b1 deriva da308 e CI40247327806 SUCCESS, riletta sul provider.
Vercel production resta dpl_7BQB2RrpkNdAsFgQ4MktHgfdnS1z READY,
fonte05d2bc9911aff3862906ac5a71769bc726dfbcea. Nessun rilascioS01 dichiarato.

Prove correnti:43 Core PASS,6 UI PASS con grafico mockato solo nei test di
stato;4 HTTP della factory e poi5 HTTP includendo cookie/adapter reali.
E2E consumer, build e typecheck di questo batch ancora NON_RUN.
Il donor isolato aveva7 PASS; non è prova del consumerArdesia.

Errori/correzioni preservati:

- StrictMode:5 PASS/1 FAIL, cleanup segnava per sempre alive=false;
  setup ora riattiva il flag,6PASS. RED eGREEN in evidence/ui-state-*.log.
- Il primo test del cookie revocava il token di ingresso, non la sessione
  nuova emessa dal login: attendeva401 e riceveva200. Verificato il codice
  /study/session, corretto il test a revocare il cookie effettivo:5PASS.
  Il log grezzo resta fuoriGit perché il traceback include token sintetici;
  non attribuire questo errore di test a un bypass dell'autoritàCore.
- REA distribuito: timeout30s, zero JS completati, evidenza parziale esportata
  e hash registrato. Nessuna conclusione di lifecycle/assenza rete dal timeout.
- Harness privato: corretti percorsi relativi della root e import logout
  prima della prova browser; non sono PASS o difetti del prodotto.

S00 ha fornito patch limitata e byte-esatta manifest+rootlock perJSXGraph1.14.0:
SHA2562514ee396cc26d61cf59ec1d718f1f0332609d43b938542137589bc16f6fd5e4.
Autore della patchS00, applicatoreS01 suabd35ede, hash egitapply--checkPASS.
Nessun'altra modifica ai rootfile. Niente npmci o sostituzione dipendenze
shared. FactoryAPI eRootApp NON delegati: prova candidata composta solo in
memoria con il vero create_app e auth/store/body admission originali.
Entrypoint lab privato escluso dal build pubblico, consumer non ancora montato
nella navigazione principale. Conservati noticeMIT/distLICENSE/COPYRIGHT.

## Prossime azioni prioritarie di questo checkpoint

1. Verificare consumer esatto. Primo passo: finestra macchina coordinata,
   poi typecheck/build e prove-consumer.cjs con unChromium55510/55511.
   Accettazione:4 viste, grafici reali/tabelle, note→reopen esatto senza
   risposta, cookie/revoca, fallback/touch,390/820/1440 e budget350KiBgzip.
   Evidenza richiesta: report/log/hash/screenshot della fonte committata.
2. Chiudere raccordi prodotto. Dipendenza:S00 mount e installatoreAPI,
   S03 definizione/fonte canonica tra edizioni. Primo passo: patch minima
   applicabile con writer esplicito. Accettazione: ingresso reale e coldreopen
   autorizzato, senza dumpJSON inMateriali. Nessun ActivityEvidence inventato.
3. PR unica da main. Primo passo: dopo dipendenza risolta e prove, push e
   contrattoPR/CI esatta; consegna aS00 senza merge/deploy autonomi.
   Accettazione: integrazione+controprova suSHA e limiteVercel esplicito.
4. Lifecycle scientifico. Primo passo: adapter nel namespace proprio al
   PluginManager/ToolHost già presenti, senza nuovi broker/permessi.
   Accettazione:install/update/rollback/revoke/uninstall e snapshot leggibile
   senza eseguire codice ritirato; finché manca restaBUNDLED_FIRST_PARTY.
5. Famiglie eKirchhoff. Primo passo: verificare diritti/closure alpin
   b35a8b5da0616f00a7764397bda0e6b95aca3c95 e oracoliDC prima delconsumer.
   Poi espansioni delle4famiglie e riusoAnalisi1; non dichiarare4corsi finiti
   da4strumenti. S04 approvazioni e copertura editoriale restano distinti.

## Appendice proposta a S00 per RUNLOG/NEXT

S01 prosegue senza riscrivere lo storico: nuovi modelli analiticiSI,
catalogo/versioni, risorseCore private/revisioni/CAS e consumer comune.
43Core+5HTTP+6UI PASS nei limiti sopra; patchdipendenza esatta di autoreS00
applicata. REA parziale per timeout conservato, valutazione3candidati eseguita.
Slot pesante e raccordi shared ancora da chiudere, nessun nuovoVercelS01.
Gap espliciti: pipeline4corsi completa, fonte cross-edition, pluginlifecycle,
Kirchhoff, approvazioni e distribuzione. Nessun grant/schema/DB/LLM parallelo.

## 26 ottobre 2026 — correzione del checkpoint compiler e aggiornamento main

Main992d1a0b (307 integrata) unita ordinariamente in a03f6d4b dopo94fd282f;
nessun conflitto, file S09 importati dalla main, non riattribuiti aS01.
Prima verifica TypeScript:FAIL su tipi S01 della fixtureJSON/mock, proprietà
`exact` di TestingLibrary e opzioni incomplete nei tipi JSXGraph. Seconda:
FAIL ancora su Promise<unknown> e keyboard assente in BoardAttributes.
Correzioni ora nel codice; verifica successiva demandata alla CI sul commit,
non dichiarata già PASS. Nessun ts-ignore o modifica dei tipi upstream.

**Errore di reporting corretto:** nel comment6405836902 avevo riportato EXIT0
e rilascio mentre il poll restituiva ancora session_id. Il processo terminò
EXIT1. Correzione pubblicata6405839734, log distinti conservati in evidence.
Non usare quel primo messaggio come evidenza di un typecheck riuscito.
Tutti i processi compilerS01 sono terminati; nessun browser consumer avviato.

Pressione disco fino345MiB: eliminati solo68.109.949byte di mappe, documenti e
bundle duplicati nell'estrazione npm privata S01. Originale tarball verificato
conservato, ricostruzione byte-esatta possibile; nessun sorgente, runtime,
tipo o notice usato dal consumer modificato. Dettaglio pruned-extraction.json.
Il digest REA dell'intera directory descrive l'estrazione prima del taglio;
non viene falsamente riattribuito alla directory alleggerita.

Per progredire senza aggiungere carico alMac, una sola PRdraft verso main
porta la dipendenza ora risolvibile e le correzioni alla CI remota. Draft non
significa READY: E2E consumer e composizione S00 restano da eseguire.
Precedenza locale alle finestreS06/S05/S08 già richieste; nessun reset o
interruzione dei loro processi. Restano valide le5azioni prioritarie sopra.
