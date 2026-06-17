# CoV - Volume 3 UNLIM Brain, Original Answers, Nanobot Review

Data: 2026-05-09

## Scope

Sessione di stabilizzazione severa su UNLIM dopo segnalazioni utente:

- UNLIM cita troppo i volumi e non produce discorso originale.
- UNLIM non deve essere una chat lineare a catena.
- Valutare repository `galileo nanobot`.
- Niente coriandoli/musichetta automatica.
- Volume 3 Arduino deve restare coperto nei gate.

## Root Cause

1. `src/services/bookCitation.js` appendeva automaticamente il riferimento Vol./pag. a quasi ogni risposta per esperimento noto. Questa regola era nata come safeguard PDR, ma oggi rendeva UNLIM innaturale e ripetitivo.
2. Il system prompt descriveva ancora molte parti come catena/testo, non come ambiente operativo parallelo con stato live, tool, diagnosi, Scratch/Arduino e Pixtral.
3. Gli effetti celebrativi erano automatici dentro `gamificationService`, quindi potevano apparire anche quando l'utente percepiva l'esperimento come non completato.

## Fix Implementati

- `supabase/functions/_shared/system-prompt.ts`
  - Aggiunta mappa operativa ELAB Tutor con rami paralleli: stato simulatore, narrazione live, fonti, strumenti, visione/Pixtral.
  - Aggiunta regola `RISPOSTA ORIGINALE`: non copiare il volume come risposta; creare sintesi propria con stato reale, concetto, analogia e prossimo gesto utile.
  - Citazioni ridimensionate: massimo una citazione breve, solo quando aiuta.

- `src/services/bookCitation.js`
  - Aggiunta policy `shouldAppendBookCitation()`.
  - Le citazioni automatiche restano per spiegazioni concettuali.
  - Le citazioni automatiche non vengono piu' aggiunte a conferme brevi, diagnosi operative, istruzioni dirette o risposte con tag azione.

- `src/services/gamificationService.js`
  - Effetti celebrativi automatici disattivati: niente confetti e niente fanfare automatiche su completamento esperimento o vittoria gioco.

- `docs/architectures/2026-05-09-unlim-parallel-agent-architecture.md`
  - Documentata architettura bersaglio del cervello UNLIM.
  - Documentato confronto con `AndreaMarro/elab-galileo-nanobot`.

## Repository Nanobot

Repo esaminata: `AndreaMarro/elab-galileo-nanobot`, clonata in `/tmp/elab-galileo-nanobot`.

Finding onesto:

- Nanobot contiene policy migliori per azione/diagnosi: prompt specialistici, router JSON, action-first, Scratch/Arduino, visione, vincolo "non dire ho fatto senza tag".
- Non conviene ripristinarlo in blocco: FastAPI esterno + provider racing senza state store/verifier rischia di aggiungere latenza e non garantisce consapevolezza reale.
- Decisione tecnica: recuperare le policy buone, ma costruire UNLIM come orchestratore parallelo con stato condiviso caldo e tool verificati.

## Verification

Comando:

`npx vitest run tests/integration/unlim-chat-prompt-v3.test.js tests/unit/unlimCitesBook.test.js tests/unit/gamificationService.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js --reporter=verbose`

Risultato: PASS, 5 file, 66 test.

Copertura rilevante:

- Prompt: rami paralleli, Pixtral, Scratch/Arduino, citazioni come ancora breve, risposta originale.
- Citazioni: concettuale cita; operativo/diagnosi/tag non cita automaticamente.
- Gamification: completamento esperimento non avvia audio/confetti.
- Azioni UNLIM: Arduino setcode/compile, Scratch `loadScratchWorkspace`, action bridge.

Comando:

`npm run build`

Risultato: PASS.

Warning residui:

- CSS minify: `Unexpected "/"`.
- CSS property generata `file` non riconosciuta.
- Chunk size sopra soglia (`react-pdf`, `ScratchEditor`, `LavagnaShell`, altri).

## Production State

Prima di questo CoV, produzione era gia' stata portata a:

- Vercel production deploy precedente: `dpl_G7LM3S8VZLtC714mW1L6ALWAT8wy`.
- Alias: `https://www.elabtutor.school`.
- Smoke Volume 3 semaforo precedente: PASS, con compile bridge funzionante e caveat CORS/fallback documentato.

Deploy production eseguito dopo CoV + audit aggiornato:

- Supabase Edge `unlim-chat`: deploy PASS su progetto `euqpdueopmlllqjmqnyb`.
- Vercel production deploy: `dpl_6TdCyKB65L6V9bCFLix7JjQGq8fQ`.
- Production URL: `https://elab-tutor-q2mdcw48f-andreas-projects-6d4e9791.vercel.app`.
- Alias: `https://www.elabtutor.school`.
- Vercel inspect: target `production`, status `Ready`.

Production smoke post-deploy:

- `BASE_URL=https://www.elabtutor.school npx playwright test --config tests/e2e/playwright.config.js tests/e2e/99-unlim-100-operational.spec.js --project=chromium --reporter=json > docs/audits/2026-05-08-unlim-execution-ux/playwright-production-unlim-100-operational-after-brain-deploy.json`
- Risultato: PASS, 120 expected, 0 skipped, 0 unexpected, 0 flaky.

## Non Claim

Non dichiaro PASS per:

- iPad Safari fisico.
- Apple Pencil fisica.
- microfono reale.
- TTS udibile.
- wake word reale.
- Pixtral come provider effettivo in produzione senza log provider.
- piena trasformazione di UNLIM in agente consapevole continuo: oggi e' migliorato in prompt/policy, ma resta da rifattorizzare orchestratore, state store e verifier.
