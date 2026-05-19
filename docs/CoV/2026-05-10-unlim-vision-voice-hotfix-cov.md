# CoV - UNLIM vision + voice hotfix

Data: 2026-05-10  
Verdict: **deploy production eseguito**, con caveat su latenza cold e microfono reale.

## Problema osservato

- Dopo voce: `Messaggio vocale in elaborazione...` seguito da errore generico.
- Domanda scritta: `riesci a vedere il circuito?`
- Risposta sbagliata: spiegazione teorica del cortocircuito invece di lettura schermo/circuito.
- Errore UI: `Errore sconosciuto`.

## Correzioni

- Trigger visivo esteso a `vedere/vederlo`.
- Vision branch non cade piu' nella chat generica se screenshot/vision fallisce.
- Fallback visivo usa `getCircuitDescription()` quando possibile.
- Fallback errori chat usa `result.response` prima del messaggio generico.
- STT voce usa anon JWT ELAB valido come fallback.
- Errore voce sostituisce la bolla di elaborazione invece di lasciarla appesa.

## Prove eseguite

- `npx vitest run tests/unit/components/tutor/ChatOverlay-waiting-copy.test.jsx tests/unit/unlimResponseQualityRouter.test.js tests/unit/voiceServiceVoxtralPrimary.test.js tests/unit/lavagna/useGalileoChatFastPath.test.jsx tests/unit/lavagna/unlimActionExecution.regression.test.js`: **25/25**.
- `npx vitest run tests/unit/lavagna/useGalileoChatFastPath.test.jsx tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/unlimNanobotInspired200Hard.test.js tests/unit/voiceServiceVoxtralPrimary.test.js`: **221/221**.
- `node scripts/bench/unlim-response-quality-speed.mjs`: **100/100**.
- `npm run build`: **PASS** con warning gia' noti.
- Smoke browser manuale locale: `/unlim-vision` chiamato e risposta visiva mostrata; niente risposta cortocircuito, niente `Errore sconosciuto`.
- `RUN_RESPONSE_QUALITY_SPEED=1 BASE_URL=http://127.0.0.1:5173 npx playwright test tests/e2e/104-unlim-response-quality-speed.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1`: secondo run **PASS**.
- `RUN_VOICE_BENCHMARK=1 BASE_URL=http://127.0.0.1:5173 npx playwright test tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1`: **PASS**.
- `npx vercel --prod --yes`: **READY**.
- Deploy testato prima della chiusura: `https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app`, deployment id `dpl_CC1FdpmRkGk9d8fZNWFML4zH8jx5`.
- Deploy finale dopo aggiornamento documentazione: `https://elab-tutor-r7tu0ys93-andreas-projects-6d4e9791.vercel.app`
- Alias: `https://www.elabtutor.school`
- Deployment id finale: `dpl_CjapjW2bC5fLRPwmAEmfQctjAtLZ`
- `npx vercel inspect elab-tutor-r7tu0ys93-andreas-projects-6d4e9791.vercel.app`: **Ready**, alias `www.elabtutor.school`, `elab-builder.vercel.app`, `elabtutor.school`.
- `curl -sSI https://www.elabtutor.school`: HTTP 200, `last-modified: Sat, 09 May 2026 23:05:43 GMT`, `etag: "83329d76124b0ce7cbdc285b314577c1"`.
- Smoke visione post-deploy: **PASS** (`/unlim-vision` chiamato, risposta visiva mostrata, niente cortocircuito generico, niente `Errore sconosciuto`).
- Smoke visione su deploy finale `r7tu0ys93`: **PASS** (`visionCalled: true`, `hasVisionAnswer: true`, `hasWrongShortCircuitAnswer: false`, `hasUnknownError: false`, `hasOldTypo: false`, `consoleErrors: []`).
- `RUN_VOICE_BENCHMARK=1 BASE_URL=https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app npx playwright test tests/e2e/102-unlim-voice-reactivity-benchmark.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1`: **PASS**.
- `RUN_RESPONSE_QUALITY_SPEED=1 BASE_URL=https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app npx playwright test tests/e2e/104-unlim-response-quality-speed.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1`: primo run **FAIL**, secondo run caldo **PASS**.
- `BASE_URL=https://elab-tutor-mvrg7h18w-andreas-projects-6d4e9791.vercel.app npx playwright test tests/e2e/99-unlim-100-operational.spec.js --config=tests/e2e/playwright.config.js --project=chromium --workers=1`: **120/120**.
- `curl https://elab-galileo.onrender.com/health`: HTTP 200, `status: ok`, `version: 5.5.0`, multi-provider e vision attiva.

## Dati non perfetti

- Un run 104 seriale ha fallito su mobile: risposta utile `702 ms` contro budget `500 ms`.
- Un run 104 produzione cold ha fallito: `apiReadyMs=11557` e Arduino operativo `2259 ms`.
- Un run parallelo 102/104 e' invalido per artefatti Playwright condivisi corrotti.
- Il test voce non dimostra microfono reale, solo pipeline browser/API/TTS.
- Galileo/Nanobot Render risponde, ma il piano Render non-free/paid non e' provato da health pubblico. Serve dashboard/API Render con credenziali.

## Decisione

La patch corregge i due difetti mostrati dallo screenshot ed e' in produzione. Il risultato non va dichiarato perfetto: cold load, voce hardware reale e piano Render non-free restano da verificare.
