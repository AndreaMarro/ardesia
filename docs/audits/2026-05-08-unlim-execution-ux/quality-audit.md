# Quality Audit - UNLIM Execution and UX Fix Forward

Data: 2026-05-08

## Addendum - Volume 3 UNLIM brain/original answers 2026-05-09 01:15 Europe/Rome

Verdetto locale aggiornato: PASS con rischi residui documentati.

Modifiche verificate:

- System prompt: ELAB Tutor descritto come rami paralleli aggiornati nel tempo, non chat lineare.
- System prompt: risposta originale obbligatoria; citazione breve solo come ancora.
- Post-processing citazioni: niente append automatico su conferme, diagnosi operative, istruzioni dirette o tag azione.
- Gamification: disattivati coriandoli e audio celebrativo automatico.
- Repository Galileo Nanobot esaminata e sintetizzata in `docs/architectures/2026-05-09-unlim-parallel-agent-architecture.md`.

Comandi:

- `npx vitest run tests/integration/unlim-chat-prompt-v3.test.js tests/unit/unlimCitesBook.test.js tests/unit/gamificationService.test.js tests/unit/unlimOperationalResponse.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js --reporter=verbose`
  - PASS: 5 file, 66 test.
- `npm run build`
  - PASS.
  - Warning residui: CSS minify `Unexpected "/"`, CSS property generata `file`, chunk size sopra soglia.

Gate Volume 3:

- Test action bridge coprono Arduino `setcode -> compile` e Scratch `loadScratchWorkspace`.
- Smoke produzione precedente Volume 3 semaforo resta documentato in:
  - `playwright-production-volume3-semaforo-smoke.json`
  - `playwright-production-volume3-semaforo-compile-bridge.json`
  - `production-volume3-semaforo-2026-05-09.png`

Finding onesto:

- Questo addendum migliora prompt/policy e rimuove una causa concreta di citazionismo automatico.
- Non dimostra ancora che UNLIM sia un agente totalmente consapevole o che Pixtral sia centrale in produzione.
- Cronologia/session restore resta rischio aperto se non trattato in un task dedicato.

Post-deploy:

- Supabase Edge `unlim-chat`: deploy PASS su progetto `euqpdueopmlllqjmqnyb`.
- Vercel production deploy: PASS, `dpl_6TdCyKB65L6V9bCFLix7JjQGq8fQ`.
- Vercel inspect: target `production`, status `Ready`.
- Alias `https://www.elabtutor.school`: presente.
- Production Playwright operativo post-deploy:
  - Artefatto: `playwright-production-unlim-100-operational-after-brain-deploy.json`
  - PASS: 120 expected, 0 skipped, 0 unexpected, 0 flaky.

## Addendum - Ripresa operativa 2026-05-09 00:40 Europe/Rome

Verdetto locale aggiornato: PASS.

Comandi verificati in questa ripresa:

- `npx vitest run tests/unit/unlimOperationalResponse.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/lavagna/LavagnaStateManager.test.js tests/unit/lavagna/GalileoAdapter-percorso-format.test.jsx`
  - PASS: 4 file, 26 test.
- `npx playwright test --config tests/e2e/playwright.config.js tests/e2e/99-unlim-100-operational.spec.js --project=chromium --reporter=line`
  - PASS: 120/120.
- `npx playwright test --config tests/e2e/playwright.config.js tests/e2e/99-unlim-100-operational.spec.js --project=chromium --reporter=json > docs/audits/2026-05-08-unlim-execution-ux/playwright-unlim-100-operational.json`
  - PASS: 120 expected, 0 skipped, 0 unexpected, 0 flaky.
- `npm run build`
  - PASS.
  - Warnings residui: CSS minify/chunk-size già presenti; non bloccanti per questo gate.

Nuovi controlli coperti:

- `__ELAB_API` espone i contratti operativi richiesti da UNLIM.
- `window.__ELAB_API.unlim` espone highlight/clear/diagnose.
- `Percorso` apre UNLIM; `Passo Passo` e `Già Montato` non aprono la chat automaticamente.
- Mutazioni circuito sparse via API (`addComponent`, stato circuito).
- Arduino: show editor, switch Arduino, set code, immediate get code.
- Scratch: switch/load workspace via `loadScratchWorkspace`.
- Awareness: simulator/editor/Scratch API presenti.
- Percorso: niente `[object Object]`, componenti/testo presenti.
- Copy attesa: `ELABorando`, niente vecchio `UNLIM sta elaborando`.
- Viewport desktop/iPad-like multipli senza error text critici.

Finding corretto durante QA:

- `setEditorCode()` era asincrono rispetto a `getEditorCode()` perché la ref veniva aggiornata solo al render React successivo. Questo avrebbe fatto fallire azioni UNLIM concatenate `setcode -> compile`. Corretto in `src/components/simulator/hooks/useSimulatorAPI.js`.

Non verificato in questa ripresa:

- Provider Pixtral reale in produzione.
- Hardware reale: iPad Safari fisico, Apple Pencil, microfono, TTS udibile, wake word reale.
- Restore cronologia/sessioni salvate.
- Confetti prematuri.

Production post-deploy:

- Supabase Edge `unlim-chat` deploy: PASS.
- Vercel production deploy: PASS, `dpl_G7LM3S8VZLtC714mW1L6ALWAT8wy`.
- Vercel inspect: PASS, target `production`, status `Ready`.
- Alias `https://www.elabtutor.school`: PASS.
- Playwright production operativo: PASS `120/120`.
- Edge direct smoke: PASS con `x-elab-api-key`, source `direct-operational-arduino`, action tag presente.

Evidence post-deploy:

- `playwright-production-unlim-100-operational.json`
- `edge-unlim-chat-operational-smoke.json`
- `production-unlim-operational-desktop-2026-05-09.png`
- `production-unlim-operational-ipad-2026-05-09.png`

## Verdict

Local quality gate: PASS.  
Production smoke gate: PASS with one known P2 caveat.

Deployment: `dpl_AkM1NR9TNV8iaF9iaF7hNUmjqqmR`  
Production alias: `https://www.elabtutor.school`

## Verified Commands

- `npm test -- --run tests/unit/services/unlimContextCollector-liveNarrative.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/lavagna/GalileoAdapter-percorso-format.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx tests/unit/lavagna/wakeWord-integration.test.jsx tests/unit/lavagna/MascotPresence.test.jsx`
  - PASS: 6 files, 25 tests.
  - Warning: React Suspense `act(...)` warning in wake word test; no failed assertion.
- `npm run build`
  - PASS.
  - Warnings: existing CSS/chunk warnings remain; no build failure.
- Local Playwright smoke:
  - PASS: 23 checks.
  - Critical console/page errors: 0.
- Production Playwright smoke:
  - PASS: 23 checks.
  - Critical console/page/http errors: 0.
  - Known P2 HTTP 404: 2 Supabase `scribble_paths` requests.

## Checks Covered

- Free lavagna loads with simulator bridge.
- Static "Lavagna libera" copy absent.
- Header UNLIM button absent.
- Mascot opens and closes UNLIM.
- Manual opens from free mode.
- Desktop and iPad proxy have no horizontal overflow.
- 15s live narrative snapshot appears in `sessionStorage`.
- Vol.3 semaforo loads.
- Scratch `loadScratchWorkspace` bridge succeeds and editor becomes visible.
- Arduino editor code bridge accepts code.

## Findings / Residual Risk

1. **Session history restore remains unresolved**

   User reported saved sessions in history do not restore the real expected session. This patch does not claim to fix it.

2. **Pixtral hard guarantee requires Edge verification**

   Frontend sends Pixtral preference and the repo Edge function now accepts `provider`, but deployed Supabase function/env must be verified/deployed separately before claiming "Pixtral is definitely the provider".

3. **Hardware claims remain blocked**

   Physical Apple Pencil, real iPad Safari, real microphone, audible TTS and wake word are not PASS without real hardware/log evidence.

4. **Build warnings remain**

   CSS minify/chunk-size warnings persist. They did not block this gate but should be cleaned in a project hygiene session.

5. **Supabase `scribble_paths` 404 remains P2**

   Production smoke still observes two 404s against `scribble_paths`. This does not block the verified UI flows, but drawing persistence/schema should be fixed before claiming drawing persistence clean.

## Evidence

- `playwright-local-smoke.json`
- `playwright-production-smoke.json`
- `local-desktop-free-mode.png`
- `local-ipad-free-mode.png`
- `local-desktop-arduino-scratch.png`
- `production-desktop-free-mode.png`
- `production-ipad-free-mode.png`
- `production-desktop-arduino-scratch.png`

## Latency Addendum

Data: 2026-05-08 22:04 Europe/Rome

Scope: latency follow-up, deployed after local verification and production smoke.

Implemented controls:

- Visible thinking feedback inserted immediately; UI yields one frame before screenshot/Pixtral work.
- Local server health probe capped at `300ms` default, `400ms` maximum.
- Local text chat capped at `2500ms`; local image chat capped at `6000ms`.
- Client API timeout hard-capped at `12000ms`.
- Master text chat timeout set to `15000ms`, maximum `18000ms`.
- Latency samples recorded in the existing localStorage ring buffer.

Fresh verification:

- `npm test -- --run tests/unit/unlimFastResponseBudget.test.js`
  - PASS: 1 file, 3 tests.
- `npm test -- --run tests/unit/unlimFastResponseBudget.test.js tests/unit/services/unlimContextCollector-liveNarrative.test.js tests/unit/lavagna/unlimActionExecution.regression.test.js tests/unit/lavagna/GalileoAdapter-percorso-format.test.jsx tests/unit/lavagna/LavagnaShell-free-home-mode.test.jsx tests/unit/lavagna/MascotPresence.test.jsx`
  - PASS: 6 files, 19 tests.
- `npm run build`
  - PASS.
  - Existing warnings remain: CSS minify warnings and chunk-size warnings.
- `npx vercel inspect elab-tutor-pefo8chyn-andreas-projects-6d4e9791.vercel.app`
  - PASS: deployment `dpl_3VVmCS1Lf5H5VS5hwzn4NK35Zdxj`, target `production`, status `Ready`.
- Production latency smoke:
  - `docs/audits/2026-05-08-unlim-execution-ux/playwright-production-latency-smoke.json`
  - PASS: `22/22` checks.
  - Covered: lavagna free production loads, manual visible, mascot opens UNLIM, input visible, "UNLIM sta elaborando"/"Elaboro" feedback under `1200ms`, no iPad horizontal overflow, no critical console/page/http/request failures.

Notes:

- Two failed intermediate deploy/smoke attempts happened before the final fix; they are superseded by `dpl_3VVmCS1Lf5H5VS5hwzn4NK35Zdxj`.
- The production smoke filters the deliberately delayed `unlim-chat`/`unlim-vision` calls used to prove the thinking feedback; provider quality/answer quality is not claimed by this latency smoke.
