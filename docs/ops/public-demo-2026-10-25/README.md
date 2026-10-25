# Demo Fisica e convergenza — 25 ottobre 2026

Ramo breve dalla main integrata51023fc5. Consegna in corso, non ancora dichiarata pubblicata. Tre esperienze originali (Poiseuille, Idrostatica, Molla/Hooke), dati calcolati nel Core e proiettati nel browser. Banca4000 e quattro esempiDRAFT esclusi; nessuna approvazione editoriale inventata.

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
