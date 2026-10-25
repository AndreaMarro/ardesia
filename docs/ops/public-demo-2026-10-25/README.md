# Demo Fisica e convergenza — 25 ottobre 2026

Ramo breve dalla main integrata51023fc5. Demo pubblica verificata; dettagli e binding nella sezione Pubblico effettivo. Tre esperienze originali (Poiseuille, Idrostatica, Molla/Hooke), dati calcolati nel Core e proiettati nel browser. Banca4000 e quattro esempiDRAFT esclusi; nessuna approvazione editoriale inventata.

## Riproduzione

```sh
npm run typecheck:web
npm run test:web
python3 -m unittest discover -s apps/marketing-01/tests -p 'test*.py'
python3 -m unittest discover -s bin/tests -p 'test_teaching*.py'
python3 bin/build_teaching_candidate.py --output /private/tmp/ardesia-demo-FRESH
python3 bin/web/check_teaching_candidate.py --candidate /private/tmp/ardesia-demo-FRESH --report /private/tmp/ardesia-demo-check.json
python3 bin/web/prepare_vercel_preview.py --candidate /private/tmp/ardesia-demo-FRESH --output /private/tmp/ardesia-vercel-FRESH
python3 bin/web/prepare_vercel_upload.py --prepared /private/tmp/ardesia-vercel-FRESH --output /private/tmp/ardesia-upload-FRESH.json
```

Usare Node26.5.1 per Web come nella CI, dipendenze dal lock, Python3.13 e uv frozen per Core/API. Directory nuove, dipendenze già installate dai lock. Il preparatore non pubblica; la richiesta va inviata tramite connettore Vercel autenticato al team/progetto indicati. Default esclude gli esempi editoriali, --review-examples è opt-in per preview editoriale e l'uploader pubblico lo rifiuta. Il vecchio receipt resta releaseBLOCKED: autorizzazione operativa/scopo demo verificato si registrano separatamente.

Percorsi: home→esperienza, switch dei3modelli, previsione→confronto→indizi→nuovo problema; Salva una bozza in questo browser→refresh→parametri/previsione ritrovati, risultato nuovamente nascosto→cancella. Bozze separate per modello, senza identità o voto/server. Poiseuille recupera oggetto/trascrizione/audio sintetico e nuova prova.

## Convergenza e policy

[37esitiPR](pr-outcomes.json), [confronto protection](policy-change.json). I vecchi snapshot sono conservati. Solo reviewcount/lastpush/codeowner toccati; PR/checkstrict/enforceAdmins/conversazioni invariati. Nessuna review umana simulata. La main510 ha CIpostmerge40228899033verde.

## Prove e limiti

[Transfer ergonomia](rea-ergonomics-transfer.json): Excalidraw0.18.1MIT, snapshot correnti governano le azioni; nessuna equivalenza deletion/revoca. Studio marker dopo OFF: REDriprodotto→GREEN6/6nativo con input sintetico. M1 riallineata al consumer Mini-corsi con10ricevute,2waitlist,media/retry/isolamento e cold senza seed; codice spec preserva e rafforza asserzioni.

Nessun backend remoto/hardware/screenreader certificato. FSA live resta disabilitata. La review visuale indipendente3modelli×390/820/1440 non trova clipping; confronto sotto fold richiede scroll (P2residuo). Nessuna efficacia didattica misurata o compatibilità hostMCPwrite.

## Rollback

Prima di questo rilascio il progetto Fisica aveva solo Preview protette e nessuna produzione/alias. Non promuovere il precedente candidato: includeva quattro esempiDRAFT. Per il primo pubblico, un problema richiede ritirare l'alias pubblico o proteggere il solo target in questione, preservando beta/Studio; mantenere i backup ed evitare ripristini che pubblichino vecchio materiale. Il rollback a una produzione precedente sarà disponibile dopo una futura seconda release ammessa. La policyGitHub si ripristina con PATCH dei soli tre campi dal file locale restore-review-policy.json, senza sostituire l'intera protection.

## Pubblico effettivo

**https://ardesia-fisica-preview.vercel.app** — accesso anonimo200, deployment `dpl_8aUFbXrEZKpAjf8vRj1wBmK8fyfr`, prodotto `9fe1cef6319fc789fbfca9bc89fb5f060e6aa0d2`. Home→fluidi, oppure `esperienza/?modello=molla` e `esperienza/?modello=idrostatica`. I tre laboratori sono demo originali delimitate, non l'intero catalogo. [Autorizzazione separata e digest16file](public-release-authorization.json).

[HTTPS16asset/13route](public-https.json), [browser12/12](public-browser.json), [contesto16check](public-context.json), [costi/performance misurati e UNKNOWN](performance.json). Nessuna credenziale nel bundle, nessuna richiesta API/localhost, routebanca/private404. I12casi remoti includono i3modelli a360/390/820/1440, risultatoCore, nuova prova, focus, bozzaesplicita/refresh/cancellazione; il controllo distinto verifica landing→recupero/trascrizione/formula→audio nativo42,695s→pausa/ripresa/fine→nuova prova→riapertura e contatto senza invio. La qualità audio all'ascolto NON è stata revisionata: trascrizione completa disponibile; non confondere decode/playhead con ascolto o approvazione scientifica.

```sh
ARDESIA_PUBLIC_BASE_URL=https://ardesia-fisica-preview.vercel.app ARDESIA_PUBLIC_QA_OUT=/private/tmp/ardesia-public-QA-FRESH node docs/ops/public-demo-2026-10-25/verify-public.mjs
ARDESIA_PUBLIC_BASE_URL=https://ardesia-fisica-preview.vercel.app ARDESIA_PUBLIC_QA_OUT=/private/tmp/ardesia-context-QA-FRESH node docs/ops/public-demo-2026-10-25/verify-context.mjs
```

La QA protetta ha usato un linktemporaneo con cookie in sola memoria, poi revocato. Un primo tentativo con header automation non era il contratto dei linkshare (302, non risultato applicativo); corretto con il tool access dedicato. Un diagnostico ha esposto un identificatore temporaneo, immediatamente revocato e rigenerato, mai inserito nel repository. La prima smoke conservava1favicon annullato durante navigazione; aggiunte fence del caricamentoreale mantenendo l'asserzione zeroerrori. Il controllo contestuale ha registrato `net::ERR_ABORTED` del ritratto lazy quando screenshot/navigazione erano immediati; ora scorre realmente fino all'immagine, verifica decode e attende prima di uscire. IFAILrimangono negli outputlocali. Nessun rerunpass usato come unica spiegazione.

Il promotePreview è stato rifiutato con422 senza causa dettagliata; creato targetproduction dagli stessi file statici verificati, senza codicebuild o environment runtime, poi nuovamente confrontati tutti i byte sull'alias pubblico. SSOpreview resta attiva e le due Preview (nuova e storica) restano302anonime; Studio/Render/auto-deployGit non modificati. Per questo primo rilascio senza produzione precedente, **rollback = pause del solo progetto Fisica** via Vercel; ripristino con unpause dopo correzione. Non promuovere le vecchie Preview che contengono esempiDRAFT. Il backup completo delle protection e la PATCHrestore dei soli3campireview sono conservati anche negli outputlocali privati.

CI prodotto `9fe1cef6`: [40230503935](https://github.com/AndreaMarro/ardesia/actions/runs/40230503935) SUCCESS; metadati40230503879SUCCESS. Studio2304PASS/5SKIP, Web382PASS, Engine2676PASS/29SKIP, StudyAPI985PASS/18SKIP, MCP23PASS; API include12testPostgreSQLreale come già nella main, nessuna certificazioneSupabaseremota. PublicCI11PASS, teacherpath1PASS, 14contrattiartifact/upload; non sommare suite sovrapposte. La CI della head di memoria e la CI dopo merge devono essere rilette live nella [PR305](https://github.com/AndreaMarro/ardesia/pull/305); nessun esito futuro è anticipato qui.
