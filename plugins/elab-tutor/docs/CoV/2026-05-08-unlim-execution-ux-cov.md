# CoV - UNLIM Execution and UX Fix Forward

Data: 2026-05-08

## Addendum - Ripresa operativa 2026-05-09 00:40 Europe/Rome

Nuova richiesta utente gestita:

- La chat UNLIM deve comparire solo quando si preme `Percorso` oppure l'icona/mascotte UNLIM.
- Il feedback di attesa deve dire `ELABorando`.
- Servivano "cento test sparsi e complessi con Playwright"; il gate eseguito ne contiene 120.

Fix aggiunti in questa ripresa:

- `FloatingWindow` ora applica davvero l'id DOM ricevuto (`id="unlim-v3"`), necessario per test affidabili e per chiudere/aprire la finestra senza selettori fragili.
- `ChatOverlay` e `MascotPresence` usano `ELABorando`; rimossi i residui visibili `UNLIM sta elaborando` / `Elaboro`.
- La suite Playwright verifica che `Percorso` apra UNLIM e che `Passo Passo` / `Già Montato` non aprano la chat automaticamente.
- Il bridge editor Arduino è stato corretto: `setEditorCode()` aggiorna la ref sincrona letta da `getEditorCode()` e da `compile`, quindi una risposta UNLIM può fare `setcode` + `compile` nella stessa azione senza compilare codice vecchio.
- Anche `setEditorMode()` e `loadScratchWorkspace()` aggiornano la ref modalità subito, così Scratch/Arduino non dipendono dal render successivo.
- Percorso mantiene i componenti visibili e il formatter evita `[object Object]`.

Verifica nuova:

- Unit mirati: `26/26` PASS.
- Playwright operativo: `120/120` PASS.
- Build produzione locale: PASS.
- Artefatto Playwright: `docs/audits/2026-05-08-unlim-execution-ux/playwright-unlim-100-operational.json`.

Deploy/verifica nuova:

- Supabase Edge `unlim-chat`: deploy eseguito su progetto `euqpdueopmlllqjmqnyb`.
- Vercel production: `dpl_G7LM3S8VZLtC714mW1L6ALWAT8wy`.
- URL production: `https://elab-tutor-13g40ogaf-andreas-projects-6d4e9791.vercel.app`.
- Alias verificati: `https://www.elabtutor.school`, `https://elabtutor.school`, `https://elab-builder.vercel.app`.
- `npx vercel inspect elab-tutor-13g40ogaf-andreas-projects-6d4e9791.vercel.app`: status `Ready`, target `production`, created `2026-05-09 00:42:48 Europe/Rome`.
- Production Playwright operativo: `120/120` PASS su `https://www.elabtutor.school`.
- Edge direct smoke con `x-elab-api-key`: HTTP `200`, source `direct-operational-arduino`, action tag presente, `1411ms`.

Evidenze nuove:

- `docs/audits/2026-05-08-unlim-execution-ux/playwright-production-unlim-100-operational.json`
- `docs/audits/2026-05-08-unlim-execution-ux/edge-unlim-chat-operational-smoke.json`
- `docs/audits/2026-05-08-unlim-execution-ux/production-unlim-operational-desktop-2026-05-09.png`
- `docs/audits/2026-05-08-unlim-execution-ux/production-unlim-operational-ipad-2026-05-09.png`

Limite onesto:

- Smoke diretto senza `x-elab-api-key` torna `401`, coerente con gate API. Il test positivo usa la chiave server disponibile localmente.
- Questo non prova hardware reale, TTS udibile, wake word reale o Apple Pencil.

## Scope

User findings treated as real defects:

- UNLIM reported actions but often did not execute them.
- Free whiteboard showed static "Lavagna libera" copy and did not give useful manual/simulator context.
- Saved history/free sessions were not reliable enough to claim real restoration.
- Percorso rendered `[object Object]` in common mistakes/analogy and Riepilogo could lead to blank/empty experience.
- Header UNLIM button was redundant.
- UNLIM needed a parallel live narrative from app/screen state, every 15 seconds, preferably Pixtral-capable.
- Passo Passo mascot bubble became white/low-signal.

## Root Cause Summary

- `executeActionTags` was not directly tested and acknowledged action badges even when simulator API calls failed.
- `addwire` used the wrong API contract: four tag parts were passed as four function args instead of two pin references.
- `compile` did not pass current editor code.
- `LavagnaShell` free mode rendered a static empty copy instead of mounting `NewElabSimulator`, so UNLIM had no real bridge.
- `GalileoAdapter` formatted arrays of objects with string join, causing `[object Object]`.
- Scratch Blockly theme used CSS variables inside Blockly theme colors; Blockly requires concrete color values.
- Visual/vision flow could send the wrong shape into `analyzeImage`.

## Implemented

- Action bridge now returns success only when the API succeeds, normalizes component aliases, converts wire tags to `fromPin/toPin`, passes current code to compile, and reports Scratch load only when bridge succeeds.
- Free mode now mounts the simulator bridge, keeps manual access, removes static "Lavagna libera" copy, and hides the header UNLIM button.
- Mascot toggles UNLIM open/closed; X remains on the UNLIM panel.
- Mascot thinking bubble now shows a dark visible status with "Elaboro"; chat slow indicator says `UNLIM sta elaborando...`.
- Added app live narrative loop every 15 seconds using parallel getters: simulator context, description, editor code, and app screenshot. Compact JSON goes into `sessionStorage`; screenshot data stays in memory and is used only when vision is needed.
- `analyzeImage` can use the dedicated `unlim-vision` endpoint and sends `provider: pixtral` when requested. The current production Edge function must also be deployed/configured for hard Pixtral forcing; otherwise existing fallback/duplicate-image path still biases away from Gemini where possible.
- System prompt/frontend context now tells UNLIM to use `[NARRAZIONE LIVE]`, decide between action/state/screenshot/citation, and not claim actions without tags.

## Verification

- Targeted unit: `25/25` PASS.
- Build: `npm run build` PASS.
- Browser plugin path: used first on `http://127.0.0.1:5173/#lavagna-solo`.
- Local Playwright smoke: `23/23` PASS, `0` critical console/page errors.

Evidence:

- `docs/audits/2026-05-08-unlim-execution-ux/playwright-local-smoke.json`
- `docs/audits/2026-05-08-unlim-execution-ux/local-desktop-free-mode.png`
- `docs/audits/2026-05-08-unlim-execution-ux/local-ipad-free-mode.png`
- `docs/audits/2026-05-08-unlim-execution-ux/local-desktop-arduino-scratch.png`

## Explicit Exceptions

- Core linguistic/system prompt was touched as an explicit exception because the user asked to improve UNLIM behavior and context comprehension. This is documented here.
- Pixtral is wired/requested, but a true production claim requires checking deployed Supabase Edge env/function. No Mistral/Pixtral provider success is claimed yet.

## Not Verified

- Apple Pencil physical input: not verified.
- Real iPad Safari hardware: not verified.
- Real microphone, audible TTS, wake word hardware: not verified.
- Session history restore to the exact previous session: not fixed in this patch; remains a P0/P1 follow-up.

## Deploy Gate

Pre-deploy gate was satisfied locally. User already requested production deploy after CoV/audit, so production deploy was executed.

## Production Deployment

- Deployment: `dpl_AkM1NR9TNV8iaF9iaF7hNUmjqqmR`
- URL: `https://elab-tutor-end9mkg32-andreas-projects-6d4e9791.vercel.app`
- Alias: `https://www.elabtutor.school`, `https://elabtutor.school`, `https://elab-builder.vercel.app`
- Status: `Ready`
- Target: `production`
- Created: 2026-05-08 21:07:43 Europe/Rome
- Verification: `npx vercel inspect elab-tutor-end9mkg32-andreas-projects-6d4e9791.vercel.app`

## Production Smoke

- Playwright production smoke: `23/23` PASS.
- Critical console/page/http errors: `0`.
- Known non-blocking HTTP 404: `2` requests to Supabase `scribble_paths`; this is a P2 persistence/schema issue already known from Session 0 and not counted as critical for this UI smoke.

Evidence:

- `docs/audits/2026-05-08-unlim-execution-ux/playwright-production-smoke.json`
- `docs/audits/2026-05-08-unlim-execution-ux/production-desktop-free-mode.png`
- `docs/audits/2026-05-08-unlim-execution-ux/production-ipad-free-mode.png`
- `docs/audits/2026-05-08-unlim-execution-ux/production-desktop-arduino-scratch.png`

## Latency Follow-up

User escalation: "UNLIM deve essere velocissimo quando risponde".

Implemented and deployed in final latency fix-forward:

- Added a regression budget test for perceived response speed.
- Thinking indicator is inserted immediately (`0ms` budget) and the UI yields one frame before heavy screenshot/Pixtral work.
- Optional local server health probe is capped at `300ms`/max `400ms`, so absent localhost cannot stall cloud chat for seconds.
- Optional local chat fallback is capped at `2.5s` text and `6s` image.
- Client API timeout is hard-capped at `12s`; text master timeout at `15s`.
- Chat latency is logged through `unlimLatencyLog` for future measurement.

Verification:

- `npm test -- --run tests/unit/unlimFastResponseBudget.test.js`: PASS, 3 tests.
- Targeted UNLIM regression suite after final patch: PASS, 3 files, 9 tests.
- `npm run build`: PASS with existing CSS/chunk warnings.
- Final deployment: `dpl_3VVmCS1Lf5H5VS5hwzn4NK35Zdxj`
- Final production URL: `https://elab-tutor-pefo8chyn-andreas-projects-6d4e9791.vercel.app`
- Alias: `https://www.elabtutor.school`
- Final latency production smoke: `docs/audits/2026-05-08-unlim-execution-ux/playwright-production-latency-smoke.json`, PASS `22/22`.
