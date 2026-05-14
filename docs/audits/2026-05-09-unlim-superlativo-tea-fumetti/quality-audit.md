# Quality Audit - UNLIM Superlativo Tea/Fumetti

Data: 2026-05-09

## Verdict

Local data/architecture gate: PASS parziale, con limiti espliciti.

Non dichiaro UNLIM "superlativo": e' stato introdotto uno shared state store caldo e un seed `AgentDecision`, ma l'orchestratore resta ibrido finche' tool calls e verifier non diventano contratto runtime server-side.

## Evidenze dati

- Audit JSON: `tea-fumetti-audit.json`
- Mismatch JSON: `debug-mismatch-tea-repo.json`
- `narrative_map.json`: 94 esperimenti.
- Repo: 94 esperimenti.
- `volume-references.js`: 94 riferimenti.
- Missing ID: 0.
- Page mismatch: 0.
- Capitoli: 23.
- Story arcs: 21.
- Capstone: 9.
- `chapter_title_origin = tea-inferred`: 23/23.

## Evidenze fumetti

- PDF fumetti v2: 94.
- Payload JSON: 94.
- Copertura ID canonici: 94/94.
- Naming non canonico: 7 file Volume 3 extra/speciali, documentati in debug note.
- Qualita visiva/personaggi/stile: non dichiarata come PASS pixel/editoriale in questa sessione. Ho verificato catalogo, naming, schema, leggibilita file e coerenza metadata, non una review grafica pannello per pannello.

## Implementato

- `src/services/unlimSharedStateStore.js`: snapshot caldo, eventi immediati, `AgentDecision` JSON seed.
- `src/services/comicPromptTemplate.js`: prompt Leonardo AI con Tea, screenshot sessione, cronologia, contesto e memoria UNLIM.
- `supabase/migrations/20260509010000_student_album_narrative_comics.sql`: album, comic assets, badge server-side.
- `scripts/tea-fumetti-package-audit.mjs`: audit ripetibile.

## Test

- `node scripts/tea-fumetti-package-audit.mjs`
  - PASS: genera `tea-fumetti-audit.json` e `debug-mismatch-tea-repo.json`.
- `npx vitest run tests/unit/unlimSharedStateStore.test.js tests/unit/comicPromptTemplate.test.js tests/unit/teaFumettiPackageAudit.test.js tests/unit/studentAlbumMigration.test.js tests/unit/services/unlimContextCollector-liveNarrative.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js --reporter=verbose`
  - PASS: 7 file, 22 test.
- `npx vitest run tests/unit/gamificationService.test.js tests/unit/lavagna/GalileoAdapter-percorso-format.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx --reporter=verbose`
  - PASS: 3 file, 28 test.
- `npm run build`
  - PASS.
  - Warning residui: CSS minify `file` non riconosciuto, CSS syntax `Unexpected "/"`, chunk sopra soglia. Gia noti, non introdotti come gate bloccante qui.
- `BASE_URL=http://127.0.0.1:5174 npx playwright test --config tests/e2e/playwright.config.js tests/e2e/99-unlim-100-operational.spec.js --project=chromium --reporter=json > docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/playwright-unlim-100-operational.json`
  - PASS: 120 expected, 0 unexpected, 0 skipped, 0 flaky.
- Playwright smoke mirato locale:
  - Artifact: `playwright-local-tea-fumetti-smoke.json`
  - PASS: 12 checks, 0 failed.
  - Screenshot: `playwright-local-desktop-unlim-tea-fumetti.png`
  - Screenshot: `playwright-local-ipad-unlim-tea-fumetti.png`

### Addendum hard-mode UNLIM

- Tool executor async verificato:
  - Test RED iniziale: `executeActionTagsVerified` non esisteva, 2 fail attesi.
  - Secondo test RED: tag `play` senza tool disponibile veniva comunque dichiarato eseguito. Corretto con record `tool unavailable`.
  - Implementazione: `executeActionTagsVerified` attende Promise, produce record `{ command, label, ok, reason, observed, expected }`, rilegge `getEditorCode()` dopo `setcode`, e non dichiara riuscite azioni con `success:false`, `ok:false`, `status:error`, `false`, `null` o eccezioni.
  - Il flusso chat usa ora l'executor verificato per i tag azione espliciti e aggiunge un messaggio onesto quando una verifica fallisce.
  - Limite esplicito: alcuni tag legacy restano fallback best-effort quando non esiste stato osservabile affidabile.
- `npx vitest run tests/unit/lavagna/unlimActionExecution.regression.test.js --reporter=verbose`
  - RED: 10 pass, 2 fail attesi per funzione mancante.
  - Secondo RED: 12 pass, 1 fail atteso su tool unavailable.
  - GREEN: 13 pass, 0 fail.
- `npx vitest run tests/unit/unlimNanobotInspired200Hard.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/unlimHardModeAdversarial.test.js tests/unit/unlimAgentDecisionHardMode.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/unlimSharedStateStore.test.js tests/unit/comicPromptTemplate.test.js tests/unit/studentAlbumMigration.test.js --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-tool-executor-230.json`
  - PASS: 230 test, 0 fail.
- `BASE_URL=http://127.0.0.1:5176 npx playwright test --config tests/e2e/playwright.config.js tests/e2e/100-unlim-hard-mode.spec.js --project=chromium --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-tool-executor-hard-mode.json`
  - PASS: 30 expected, 0 unexpected, 0 skipped, 0 flaky.
- `npx vitest run tests/unit/unlimNanobotInspired200Hard.test.js --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-nanobot-200.json`
  - Prima esecuzione: 189 PASS / 11 FAIL. Non dichiarato PASS.
  - Root cause corretti: `lampeggiare/lampeggio`, `blocchetti`, negazione `senza semaforo`, diagnosi vaga `aiuto/non si accende/sbagliato`, `highlightpin:nano:D13,nano:GND`, trigger vision `osserva/leggi/schermata`, clarify `quella`.
  - Artifact finale: PASS 200 test, 0 fail.
- `npx vitest run tests/unit/unlimNanobotInspired200Hard.test.js tests/unit/unlimHardModeAdversarial.test.js tests/unit/unlimAgentDecisionHardMode.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/unlimSharedStateStore.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/comicPromptTemplate.test.js tests/unit/studentAlbumMigration.test.js --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-nanobot-regression.json`
  - PASS: 227 test, 0 fail.
  - Copre superficie Nanobot/Galileo: action-first, circuito live, Scratch/Arduino, report/fumetto, verifier, vision trigger e ambiguity handling.
- `npx vitest run tests/unit/unlimHardModeAdversarial.test.js tests/unit/unlimAgentDecisionHardMode.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/unlimSharedStateStore.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/comicPromptTemplate.test.js tests/unit/studentAlbumMigration.test.js --reporter=json`
  - PASS: 27 test.
  - Copre: semaforo non confuso con Blink, Scratch `loadblocks`, report/fumetto via `exportFumetto`, compile failed non dichiarato eseguito, Scratch failed non dichiarato eseguito, export fumetto failed non dichiarato eseguito, diagnosi dopo evento circuito live, eventi circuito stale non tenuti vivi per sempre.
- `npm run build`
  - PASS dopo hard-mode.
  - Warning residui invariati: CSS minify/syntax e chunk sopra soglia.
- `BASE_URL=http://127.0.0.1:5175 npx playwright test --config tests/e2e/playwright.config.js tests/e2e/100-unlim-hard-mode.spec.js --project=chromium --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-hard-mode.json`
  - PASS: 30 expected, 0 unexpected, 0 skipped, 0 flaky.
- `BASE_URL=http://127.0.0.1:5175 npx playwright test --config tests/e2e/playwright.config.js tests/e2e/99-unlim-100-operational.spec.js --project=chromium --reporter=json > docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-100-operational-after-hard-mode.json`
  - PASS: 120 expected, 0 unexpected, 0 skipped, 0 flaky.
- Screenshot hard-mode:
  - `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-desktop.png`
  - `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-ipad-portrait.png`
  - `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-mobile.png`
  - `screenshot-metrics.json`: no `[object Object]`, no autoplay media, no overflow orizzontale desktop/iPad/mobile.

### Fallimento intermedio non nascosto

- Prima esecuzione della nuova spec hard-mode: errore di test per titolo duplicato `fumetto export dispatches verified runtime events pdf`; corretto aggiungendo indice al titolo.
- Seconda esecuzione della hard-mode: errore di test sul contratto eventi fumetto; il runtime usa `window.__ELAB_API.on('fumettoExportRequested')`, non DOM `CustomEvent`. Corretto il test sul bus reale.
- Prima riesecuzione della suite 120: timeout per modal `Scegli Esperimento` che intercettava i click modalita. Corretto il setup Playwright chiudendo il picker residuo dopo `loadExperiment`.
- Prima esecuzione dei 200 test Nanobot/Galileo: 11 fail reali su linguaggio operativo vago e parsing azioni. Correzione applicata e artifact finale verde 200/200.
- Prima esecuzione tool-executor: 2 fail reali attesi per mancanza funzione async verificata. Corretto con executor e rieseguito verde.

## Playwright checks coperti

- Page identity `/#lavagna`.
- Not blank.
- No framework overlay.
- No `[object Object]`.
- Arduino `setEditorCode -> getEditorCode`.
- Scratch API esposta.
- Compile API esposta.
- No confetti nodes.
- Desktop no horizontal overflow.
- iPad proxy not blank.
- iPad proxy no horizontal overflow.
- Console/page health senza errori rilevanti.

## Rischi residui

- Migration Supabase non applicata su progetto remoto in questa sessione.
- RLS non testata contro database reale.
- Mistral embeddings non ancora eseguiti su ingest remoto: architettura e decisione sono pronte, serve `MISTRAL_API_KEY` nell'ambiente target e pipeline dedicata.
- Pixtral non ancora invocato su screenshot live reale: trigger vision e contratto sono coperti da test unit, non da chiamata modello.
- Leonardo AI non invocato: creato template e contratto, non generato asset.
- Fumetti v2 non revisionati pagina per pagina con OCR/visual QA.
- UNLIM ancora ibrido: non ha ancora verifier hard post-azione su ogni tool.
- Verifier hard ora copre anche Promise async e readback editor per i tag principali, ma non ancora ogni tool legacy e non ancora un contratto server-side typed.
- Nanobot non allineato come catalogo: 69 esperimenti e ID legacy.

## Addendum 2026-05-09 - Benchmark Prestazioni/Voce Post-Deploy Preview Storico

Nota: questo blocco documenta un run precedente. Gli addendum successivi su fast-active/production sono la source of truth finale della sessione.

### Preview

- `https://elab-tutor-7qahic9er-andreas-projects-6d4e9791.vercel.app`
- Nessun deploy production.

### Performance

- Artifact: `docs/audits/2026-05-09-unlim-performance-benchmark/performance-benchmark.json`
- Artifact Playwright: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-vercel-preview-fast-tts.json`
- Verdict: PASS.
- Compile p95: 1269.5 ms su soglia 1500.
- Long task max: 491 ms su soglia 750.
- Console errors: 0.

### Voce/Voxtral

- Artifact: `docs/audits/2026-05-09-unlim-voice-benchmark/voice-reactivity-benchmark.json`
- Artifact Playwright: `docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-vercel-preview-fast-tts.json`
- Verdict formale: FAIL, perche' hardware reale non provato.
- `/api/voxtral`: PASS tecnico, 200 MP3, provider `voxtral`, voice id clone `9234f1b6-766a-485f-acc4-e2cf6dc42327`, 2654 ms.
- `/api/tts`: PASS tecnico, 200 MP3, provider `voxtral`, voice id clone, 3453 ms.
- Console errors: 0.
- Network failures: 0.

### Nota Onesta

Il sistema ora produce audio Voxtral con il voice id clone configurato. Questo non equivale a dire che la somiglianza con la voce di Andrea sia validata: serve ascolto umano o benchmark percettivo. Headless Playwright prova endpoint, UI e assenza di errori, non hardware reale.

## Addendum 2026-05-09 - Fast Active, Rerun Severi, Deploy Production Richiesto

### Fast active 1-2s

- Artifact unit: `docs/audits/2026-05-09-unlim-hard-tests/vitest-fast-active-actions.json`.
- Artifact local: `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-local.json`.
- Artifact preview: `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-preview-sequential.json`.
- Verdict: PASS per richieste operative note e verificabili.
- Preview testato: `https://elab-tutor-dr7glsvx2-andreas-projects-6d4e9791.vercel.app`.
- Misure preview:
  - Arduino semaforo + compile: first reply 238 ms, action verified 1450 ms.
  - Scratch LED: first reply 379 ms, action verified 390 ms.
  - Montaggio circuito LED D13/GND: first reply 1156 ms, action verified 1289 ms.

### Benchmark performance severissimo aggiornato

- Artifact: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-vercel-preview-fast-active-rerun.json`.
- Verdict: FAIL non stabile.
- Motivo: long task max 1003 ms su soglia 750 ms; run precedente 1174 ms.
- Compile p95 nel rerun: 1328.1 ms su soglia 1500 ms.
- Console errors: 0.
- Conclusione: CORS/CSP compile e fast action sono sistemati, ma non posso dichiarare performance PASS severo finche' i long task non restano sotto soglia in rerun.

### Voce/Voxtral

- Artifact: `docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-vercel-preview-fast-active-sequential.json`.
- Verdict formale: FAIL per assenza di prova hardware reale.
- `/api/voxtral`: 200 MP3, provider `voxtral`, voice clone `9234f1b6-766a-485f-acc4-e2cf6dc42327`, circa 2809.5 ms.
- `/api/tts`: 200 MP3, provider `voxtral`, stesso voice id, circa 3080 ms.
- Conclusione: endpoint tecnici funzionano, ma risposta audio completa non e' ancora 1-2s e la somiglianza voce Andrea non e' validata da ascolto/log hardware.

### Deploy production

- L'utente ha dato approvazione esplicita a deploy su sito principale.
- Il deploy production, se completato, e' eseguito per rendere visibile il sistema, non come dichiarazione di gate severo verde.

### Prossima sessione

- Continuare fumetto + Leonardo.ai.
- Aggiungere benchmark severissimo dedicato al workflow Leonardo/fumetto nella prossima sessione.

## Addendum Production 2026-05-09

- Production finale: `https://www.elabtutor.school`.
- Deployment finale: `dpl_2NVVZ6yVYf2mBkHinTDBrCSxobN2`.
- Primo production deploy: post-deploy fast-active FAIL per CORS compile n8n diretto.
- Fix: HTTPS browser usa Supabase `compile-proxy`; n8n rimosso da CSP deploy.
- Verifica fix:
  - Unit CORS/CSP: PASS 17/17.
  - Build: PASS.
  - Header CSP production: n8n assente da `connect-src`.
- Fast-active production dopo fix: PASS.
  - Arduino first reply 197 ms, verified 1454 ms.
  - Scratch first reply 435 ms, verified 464 ms.
  - Circuito LED first reply 510 ms, verified 543 ms.
- Voce production: FAIL.
  - `/api/tts` Voxtral 1844.1 ms, ma API ready 13443 ms e hardware non provato.
- Performance severa production: FAIL.
  - Run 1: API non pronta entro 7000 ms.
  - Rerun: API ready 7899 ms, first meaningful text 7916 ms, long task 1038 ms, compile p95 2003.3 ms.

Conclusione: il sito e' visibile e il fast path operativo e' sotto 1-2s sui casi testati; UNLIM non e' ancora "superlativo" secondo il criterio severo generale.
