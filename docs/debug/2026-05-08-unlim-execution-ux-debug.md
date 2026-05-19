# Debug Note - UNLIM Execution and UX

Data: 2026-05-08

## Addendum - 2026-05-09 00:40 Europe/Rome

Nuova evidenza/fix:

- Il test Playwright iniziale cercava `Percorso` come `button`, ma la UI usa `role="tab"` e `data-testid=modalita-btn-percorso`; il test è stato reso fedele alla UI.
- `FloatingWindow` non applicava il prop `id` al DOM: `#unlim-v3` non esisteva anche quando la finestra era aperta. Fix: `id={id}` sul dialog.
- `setEditorCode()` non aggiornava immediatamente `editorCodeRef`; `getEditorCode()` restituiva il template vecchio nello stesso tick. Fix: aggiornamento sincrono della ref prima di `setEditorCode`.
- `setEditorMode()` e `loadScratchWorkspace()` ora aggiornano subito `editorModeRef` e aprono l'editor.
- Ultimi testi vecchi rimasti sostituiti con `ELABorando`.

QA nuova:

- Playwright operativo complesso: 120/120 PASS.
- Unit mirati: 26/26 PASS.
- Build: PASS.
- Deploy Supabase Edge `unlim-chat`: PASS.
- Deploy Vercel production: PASS `dpl_G7LM3S8VZLtC714mW1L6ALWAT8wy`.
- Production Playwright operativo su `https://www.elabtutor.school`: 120/120 PASS.
- Edge smoke operativo: PASS con API key; senza API key è 401 atteso.

Ancora aperto:

- Cronologia/ripristino sessione vera.
- Confetti su apertura esperimento non completato.
- Verifica/deploy provider Pixtral reale.

## User-Reported Bugs Logged

- UNLIM non esegue realmente le azioni.
- Risposte generiche dopo modifica componenti.
- Free lavagna non deve mostrare staticamente "Lavagna libera" e deve accedere ai manuali.
- Cronologia/sessioni salvate non riportano alla sessione reale.
- Percorso mostra `[object Object]` in Errori comuni e Analogia.
- Riepilogo produce schermo bianco/esperienza vuota.
- Confetti appaiono all'apertura esperimento non completato.
- Volume 3 Arduino semaforo: editor blocchi/simulazione/compila non avviano bene senza chiedere a UNLIM.
- Header UNLIM button non serve.
- UNLIM deve dire "UNLIM sta elaborando" quando pensa.
- Nuvoletta mascotte non deve diventare bianca.
- Creare narrazione parallela ogni 15s e usare Pixtral dove serve.

## Root Causes Confirmed in Code

- Action parser was under-tested and accepted failed actions.
- Wire bridge contract mismatch.
- Compile action did not pass editor code.
- Free mode did not mount real simulator bridge.
- Percorso formatter handled objects as raw strings.
- Blockly theme had invalid CSS var colors.
- Vision branch passed an array into an API expecting a string.

## Fixed in This Pass

- Action bridge hardening.
- Free mode simulator/manual UX.
- Header UNLIM removal.
- Mascot toggle + visible thinking bubble.
- Live narrative snapshot loop every 15s.
- Pixtral-preferred vision path.
- Percorso object formatting and Riepilogo send.
- Scratch Blockly concrete colors.

## Still Open

- Exact session restore from cronologia.
- Confetti premature completion behavior.
- Production verification after deploy: PASS for this smoke, with P2 `scribble_paths` 404 caveat.
- Supabase Edge Pixtral deploy/env verification.

## Latency Follow-up

User reported that UNLIM must respond very fast.

Confirmed risk:

- The UI slow indicator previously waited `5000ms`.
- Test environment still allowed `VITE_API_TIMEOUT=60000`, so changing only defaults would not protect live use.

Changed:

- Thinking feedback is now inserted immediately (`0ms` budget), then the UI yields one frame before heavy screenshot/Pixtral work.
- Chat budgets are bounded in code even if env vars are too high:
  - API timeout max `12000ms`.
  - Local health max `400ms`.
  - Local text chat max `3000ms`.
  - Master text max `18000ms`.
- Added `tests/unit/unlimFastResponseBudget.test.js`.
- Final production deploy: `dpl_3VVmCS1Lf5H5VS5hwzn4NK35Zdxj`.
- Final production latency smoke: PASS `22/22`.

Not claimed:

- This does not make the model itself smarter.
- This does not prove real provider latency in production.
