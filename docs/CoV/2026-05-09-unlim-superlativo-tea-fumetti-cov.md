# CoV - UNLIM Superlativo Tea/Fumetti

Data: 2026-05-09

## Scope

Sessione operativa per integrare roadmap Tea, `narrative_map.json`, Album Studente, fumetti v2 e architettura UNLIM parallela.

## Root Cause

UNLIM era stato migliorato a livello prompt/policy, ma restava troppo dipendente da raccolta contesto al momento della domanda e tag azione legacy. Mancavano:

- stato condiviso caldo;
- contratto `AgentDecision`;
- collegamento strutturato Tea/album/fumetti;
- modello server-side per badge/album;
- decisione storage fumetti esplicita;
- audit ripetibile Tea/repo/fumetti.

## Cambi implementati

- Audit Tea/fumetti:
  - `scripts/tea-fumetti-package-audit.mjs`
  - output JSON in `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/`
- Fumetti:
  - `src/services/comicPromptTemplate.js`
  - prompt Leonardo AI con screenshot sessione, contesto, cronologia, memoria UNLIM e materiale Tea.
  - runtime policy: asset pre-generati, niente generazione live.
- Album:
  - `supabase/migrations/20260509010000_student_album_narrative_comics.sql`
  - `student_album`, `comic_assets`, `badges_catalog`, `student_badges`.
  - trigger DB `elab_award_progress_badges`.
- UNLIM:
  - `src/services/unlimSharedStateStore.js`
  - snapshot caldo + eventi immediati.
  - `AgentDecision` JSON seed: `reply`, `act`, `diagnose`, `vision`, `rag`, `album`, `comic`, `clarify`.
  - seed iniettato nel contesto chat.
- Nanobot:
  - letto `/tmp/elab-galileo-nanobot`.
  - recuperate lezioni su router JSON, specialisti e action-first.
  - catalogo Nanobot dichiarato non affidabile per Tea 94.
- Addendum Nanobot/Galileo:
  - aggiunta suite `tests/unit/unlimNanobotInspired200Hard.test.js`.
  - corretti trigger operativi per Scratch/Arduino, diagnosi vaga, vision su schermo/Pixtral e parsing pin qualificati.
  - decisione Mistral embeddings documentata: text knowledge con `mistral-embed`, code knowledge con `codestral-embed`, retrieval ibrido BM25+dense+metadata+rerank, ingest server-side.
- Tool executor:
  - aggiunto `executeActionTagsVerified` nel bridge UNLIM.
  - il flusso chat ora usa l'executor async verificato per i tag azione principali.
  - se una Promise/tool fallisce, UNLIM non mette l'azione fra quelle eseguite e aggiunge un messaggio onesto di mancata verifica.
  - `setcode` viene verificato leggendo il codice dall'editor; `compile`, `loadblocks`, `exportfumetto`, `addwire`, `addcomponent` non passano se il tool ritorna errore.

## Evidenza Tea

- 94 esperimenti Tea = 94 esperimenti repo = 94 riferimenti volume.
- 23 capitoli.
- 21 story arcs.
- 9 capstone.
- 23/23 `chapter_title_origin = tea-inferred`.
- 0 missing ID.
- 0 page mismatch.

## Evidenza fumetti

- 94 PDF.
- 94 payload.
- Copertura ID canonici 94/94.
- 7 naming speciali/non regex canonica, tutti corrispondenti a ID Tea/repo speciali.

## Verification

- `node scripts/tea-fumetti-package-audit.mjs`: PASS.
- Unit mirati: PASS, 7 file, 22 test.
- Unit regressione confetti/no object/free mode: PASS, 3 file, 28 test.
- `npm run build`: PASS con warning CSS/chunk gia noti.
- Playwright operativo locale: PASS, 120 expected, 0 unexpected.
- Playwright smoke locale: PASS, 12 checks, 0 failed.
- Hard-mode addendum:
  - Unit hard/adversarial: PASS, 27 test su risposte operative, AgentDecision, album/fumetti, verifier azioni.
  - Unit Nanobot/Galileo 200: prima esecuzione 189/200, 11 fail reali; dopo fix, PASS 200/200.
  - Regressione mirata Nanobot/hard/album/fumetto/action bridge: PASS 227/227.
  - Tool executor RED/GREEN: primo run 2 fail attesi su funzione mancante; secondo RED 1 fail su tool unavailable; dopo implementazione, PASS 13/13 bridge e PASS 230/230 regressione.
  - Playwright hard-mode: PASS, 30 expected, 0 unexpected.
  - Playwright hard-mode post tool-executor: PASS, 30 expected, 0 unexpected.
  - Playwright operativo rilanciato dopo hard-mode: PASS, 120 expected, 0 unexpected.
  - Build dopo hard-mode: PASS con warning CSS/chunk gia noti.
  - Fallimento intermedio documentato: suite da 120 bloccata dal modal `Scegli Esperimento`; corretto setup test chiudendo il picker residuo prima dei click modalita.

## Artefatti

- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/tea-fumetti-audit.json`
- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/debug-mismatch-tea-repo.json`
- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/playwright-unlim-100-operational.json`
- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/playwright-local-tea-fumetti-smoke.json`
- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/playwright-local-desktop-unlim-tea-fumetti.png`
- `docs/audits/2026-05-09-unlim-superlativo-tea-fumetti/playwright-local-ipad-unlim-tea-fumetti.png`
- `docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-hard-mode.json`
- `docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-100-operational-after-hard-mode.json`
- `docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-hard-mode.json`
- `docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-nanobot-200.json`
- `docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-nanobot-regression.json`
- `docs/audits/2026-05-09-unlim-hard-tests/vitest-unlim-tool-executor-230.json`
- `docs/audits/2026-05-09-unlim-hard-tests/playwright-unlim-tool-executor-hard-mode.json`
- `docs/audits/2026-05-09-unlim-hard-tests/screenshot-metrics.json`
- `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-desktop.png`
- `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-ipad-portrait.png`
- `docs/audits/2026-05-09-unlim-hard-tests/screenshot-unlim-hard-mobile.png`
- `docs/decisions/2026-05-09-mistral-embeddings-unlim-rag.md`

## Non Claim

Non dichiaro:

- deploy production;
- hardware reale PASS;
- iPad Safari fisico PASS;
- Leonardo AI generazione eseguita;
- Mistral embeddings ingest eseguito su database remoto;
- Pixtral vision reale eseguita su screenshot live;
- fumetti v2 visual QA completa pannello per pannello;
- UNLIM pienamente superlativo/tool-native.

Stato onesto: UNLIM ha ora fondamenta migliori per stato caldo, decisione parallela e primo tool executor async verificato. Resta ancora orchestratore ibrido finche' tutti i tool non passano da contratto server-side/typed executor, verifier async completo e stato osservabile end-to-end.

## Addendum 2026-05-09 - CORS/CSP Compile, Voxtral, Benchmark Severi

### Implementato

- `compile-proxy` Supabase: CORS loopback dev sicuro e preview Vercel.
- CSP effettiva deploy: aggiornato `vercel.json`; `public/_headers` non e' la source of truth su Vercel.
- Drawing sync remoto: `scribble_paths` disabilitato di default via flag per evitare 404 console finche' la migration non e' applicata.
- Voce:
  - aggiunto `/api/voxtral` same-origin proxy verso Supabase `unlim-tts`;
  - `voiceService.synthesizeSpeech()` usa Voxtral clone come primo ramo;
  - `/api/tts` usa Voxtral come primario e il VPS legacy solo fallback corto;
  - aggiunte guardie JWT per ignorare env Supabase legacy/non valide.

### Deploy Preview

- Preview finale testato: `https://elab-tutor-7qahic9er-andreas-projects-6d4e9791.vercel.app`.
- Nessun deploy production eseguito.

### Performance Benchmark

- `RUN_PERF_BENCHMARK=1 ... tests/e2e/101-unlim-performance-benchmark.spec.js`
- Artifact: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-vercel-preview-fast-tts.json`.
- Verdict: PASS.
- Compile p95: 1269.5 ms, soglia 1500.
- Long task max: 491 ms, soglia 750.
- Console errors: 0.
- Network failures rilevanti: 0.

### Voice/Voxtral Benchmark

- `RUN_VOICE_BENCHMARK=1 ... tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js`
- Artifact: `docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-vercel-preview-fast-tts.json`.
- Verdict formale: FAIL per `realMicrophoneHardwareLog = NOT_PROVEN`.
- Endpoint tecnici:
  - `/api/voxtral`: 200, MP3, provider `voxtral`, model `voxtral-mini-tts-2603`, voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`, 2654 ms nel benchmark.
  - `/api/tts`: 200, MP3, provider `voxtral`, stesso voice id, 3453 ms nel benchmark.
  - Console errors: 0.
  - Network failures: 0.

### Non Claim Aggiornato

Non dichiaro:

- production deploy;
- voce clone Andrea validata da ascolto umano;
- microfono/altoparlante hardware PASS;
- conversazione voce completa microfono -> STT -> UNLIM -> TTS -> speaker PASS;
- UNLIM pienamente superlativo.

Stato storico prima dei rerun fast-active: un benchmark preview aveva dato verde su browser/compile. Gli addendum successivi sotto sono la source of truth finale: performance severa non stabile su preview e production, fast-active production PASS, voce hardware FAIL.

## Addendum 2026-05-09 - Fast Active 1-2s, Rerun Severi, Production Gate

### Implementato dopo il benchmark voce

- Fast path operativo locale in `useGalileoChat`: richieste note Arduino/Scratch/circuito non aspettano il ramo LLM quando esiste un `directOperationalResponse`.
- Rate limit LLM bypassato solo per azioni operative locali verificabili, cosi' la terza richiesta consecutiva non viene bloccata durante i test di montaggio circuito.
- Nuovo caso circuito: "Monta un circuito LED con resistenza su Arduino D13 e GND" genera piano azione con `loadexp`, tre `addwire`, `highlightpin` e diagnosi.
- Piano UX/UI iPad/libro/narrazione/Scratch/Arduino creato in `docs/plans/2026-05-09-ux-ui-ipad-narrative-experiments-scratch-arduino-plan.md`.

### Evidenza fast active

- Unit: `docs/audits/2026-05-09-unlim-hard-tests/vitest-fast-active-actions.json`, PASS 216/216.
- Local Playwright: `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-local.json`, PASS.
- Preview Playwright: `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-preview-sequential.json`, PASS.
- Preview testato: `https://elab-tutor-dr7glsvx2-andreas-projects-6d4e9791.vercel.app`.
- Latenze preview osservate:
  - Arduino semaforo + compile: first reply 238 ms, action verified 1450 ms.
  - Scratch LED: first reply 379 ms, action verified 390 ms.
  - Montaggio LED D13/GND: first reply 1156 ms, action verified 1289 ms.

### Benchmark severo aggiornato

- Performance rerun preview artifact: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-vercel-preview-fast-active-rerun.json`.
- Verdict aggiornato: FAIL non stabile.
- Motivo: long task max 1003 ms su soglia 750 ms nel rerun piu' recente; run precedente 1174 ms.
- Compile p95 nel rerun: 1328.1 ms, sotto soglia 1500 ms.
- Console errors: 0.
- Conclusione: il fast path operativo sotto 1-2 secondi e' provato per casi noti; il performance gate severo generale non e' PASS.

### Voce/Voxtral aggiornata

- Artifact preview fast-active: `docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-vercel-preview-fast-active-sequential.json`.
- Verdict formale: FAIL per `realMicrophoneHardwareLog = NOT_PROVEN`.
- Endpoint tecnici preview:
  - `/api/voxtral`: 200 MP3, provider `voxtral`, model `voxtral-mini-tts-2603`, voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`, circa 2809.5 ms.
  - `/api/tts`: 200 MP3, provider `voxtral`, stesso voice id, circa 3080 ms.
- Conclusione: Voxtral funziona tecnicamente, ma non e' provata la catena hardware microfono -> voce clonata -> speaker, e la risposta audio completa non e' ancora nel budget 1-2 secondi.

### Production decision

- L'utente ha chiesto esplicitamente deploy su sito principale dopo CoV/audit.
- Se viene eseguito production deploy in questa sessione, non va interpretato come PASS severo performance: e' un deploy richiesto per vedere il sistema, con benchmark severo ancora rosso su long task.

### Next session vincolante

- Continuare su fumetto e Leonardo.ai.
- Creare benchmark dedicato Leonardo/fumetto nella prossima sessione, non in questa.

## Addendum 2026-05-09 - Production Deploy e Test Post-Deploy

### Deploy production

- Primo production deploy:
  - Deployment: `dpl_DybrX58RFxtcSzLPbPJb7nJmeVxc`.
  - Alias: `https://www.elabtutor.school`.
  - Post-deploy fast-active: FAIL per CORS compile diretto verso `https://n8n.srv1022317.hstgr.cloud/compile`.
- Fix applicato:
  - `compileCode()` su browser HTTPS usa prima `https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/compile-proxy`.
  - Il browser HTTPS non prova piu' endpoint n8n compile diretti.
  - CSP Vercel e `_headers` non includono piu' `https://n8n.srv1022317.hstgr.cloud`.
- Verifica pre-redeploy:
  - `vitest-cors-csp-compile-production-fix.json`: PASS 17/17.
  - `npm-build-production-compile-proxy-fix.log`: PASS, warning CSS/chunk gia noti.
- Secondo production deploy:
  - Deployment: `dpl_2NVVZ6yVYf2mBkHinTDBrCSxobN2`.
  - Alias: `https://www.elabtutor.school`.
  - CSP production verificata via header: n8n non presente in `connect-src`.

### Post-deploy production

- Fast active production:
  - Artifact: `docs/audits/2026-05-09-unlim-fast-active-benchmark/playwright-fast-active-production-main-after-compile-proxy-fix.json`.
  - Verdict: PASS.
  - Base URL: `https://www.elabtutor.school`.
  - API ready: 7826 ms.
  - Arduino semaforo + compile: first reply 197 ms, action verified 1454 ms, compile 1222 ms.
  - Scratch LED: first reply 435 ms, action verified 464 ms.
  - Montaggio LED D13/GND: first reply 510 ms, action verified 543 ms.
  - Console errors: 0.
  - Network failures: 0.
- Voice/Voxtral production:
  - Artifact: `docs/audits/2026-05-09-unlim-voice-benchmark/playwright-unlim-voice-reactivity-benchmark-production-main.json`.
  - Verdict: FAIL.
  - Motivi: `apiReadyMs = 13443` su soglia 10000; `realMicrophoneHardwareLog = NOT_PROVEN`.
  - `/api/tts`: 200 MP3 Voxtral, voice `9234f1b6-766a-485f-acc4-e2cf6dc42327`, 1844.1 ms.
  - `/api/voxtral`: 200 MP3 Voxtral, stesso voice id, 3921.6 ms.
  - Console errors: 0.
- Performance severa production:
  - Artifact timeout: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-production-main.json`.
  - Artifact rerun: `docs/audits/2026-05-09-unlim-performance-benchmark/playwright-unlim-performance-benchmark-production-main-rerun.json`.
  - Verdict: FAIL.
  - Primo run: `window.__ELAB_API` non pronto entro 7000 ms.
  - Rerun: `apiReadyMs = 7899`, `firstMeaningfulTextMs = 7916`, `longTaskMaxMs = 1038`, `compileP95Ms = 2003.3`.
  - Console errors: 0.

### Stato onesto finale

- Il sito principale e' deployato.
- Le azioni operative note rispondono in 1-2 secondi e verificano l'azione su production.
- CORS/CSP compile production e' corretto nel test fast-active e nell'header CSP.
- Non dichiaro performance severo PASS: caricamento iniziale, long task e compile p95 sono ancora instabili sopra soglia.
- Non dichiaro voce hardware PASS: manca prova reale microfono/speaker e API ready voce e' lenta sul dominio principale.
