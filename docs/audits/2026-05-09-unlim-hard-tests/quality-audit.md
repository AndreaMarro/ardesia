# Quality Audit - UNLIM Hard Tests

Data: 2026-05-09

## Verdict

Hard-mode locale: PASS sui test eseguiti, con limiti espliciti.

Non dichiaro hardware reale PASS, deploy production, ne' UNLIM pienamente tool-native.

## Test eseguiti

- Unit Nanobot/Galileo inspired 200:
  - `vitest-unlim-nanobot-200.json`
  - Prima esecuzione: 189 PASS / 11 FAIL. Non dichiarato PASS.
  - Fix applicati su trigger Scratch/Arduino, diagnosi vaga, vision trigger Pixtral/schermo, `highlightpin` con pin qualificati e clarify su riferimento ambiguo.
  - Riesecuzione artifact: 200 test PASS, 0 fail.
- Regressione mirata dopo i 200:
  - `vitest-unlim-nanobot-regression.json`
  - 227 test PASS, 0 fail.
  - Copre 200 Nanobot + hard/adversarial preesistenti + AgentDecision + operational response + shared state + action bridge + fumetto/album.
- Tool executor verificato:
  - Primo test RED: `executeActionTagsVerified` mancante, 2 fail attesi.
  - Implementato executor async per tag azione principali: attende Promise tool, rilegge stato editor per `setcode`, non dichiara compile/export/Scratch/addwire falliti come eseguiti.
  - Secondo test RED: tool void mancante (`play`) veniva ancora dichiarato eseguito. Corretto con `tool unavailable`.
  - `vitest-unlim-tool-executor-230.json`: 230 test PASS, 0 fail.
  - Limite: i comandi legacy senza stato osservabile restano fallback best-effort, non verifica forte end-to-end.
- Unit hard/adversarial:
  - `vitest-unlim-hard-mode.json`
  - 27 test PASS.
  - Include semaforo Arduino distinto da Blink, Scratch `loadblocks`, report/fumetto via `exportFumetto`, verifier su `success:false`/`ok:false`, AgentDecision su evento circuito live e compilazione fallita.
- Build:
  - `npm run build` PASS.
  - Warning residui CSS/chunk gia noti.
- Playwright hard-mode:
  - `playwright-unlim-hard-mode.json`
  - 30 expected, 0 unexpected, 0 skipped, 0 flaky.
- Playwright hard-mode post tool-executor:
  - `playwright-unlim-tool-executor-hard-mode.json`
  - 30 expected, 0 unexpected, 0 skipped, 0 flaky.
- Playwright operativo post-hard-mode:
  - `playwright-unlim-100-operational-after-hard-mode.json`
  - 120 expected, 0 unexpected, 0 skipped, 0 flaky.

## Screenshot

- `screenshot-unlim-hard-desktop.png`
- `screenshot-unlim-hard-ipad-portrait.png`
- `screenshot-unlim-hard-mobile.png`
- `screenshot-metrics.json`: no `[object Object]`, no autoplay media, no overflow orizzontale nei tre viewport catturati.

## Note mismatch/test

- Primo hard-mode Playwright non eseguito per titolo duplicato nel test: corretto.
- Secondo hard-mode Playwright ha rivelato test sbagliato sul bus eventi fumetto: runtime usa `__ELAB_API.on`, non DOM event.
- Prima riesecuzione della suite 120 bloccata da picker esperimenti residuo: corretto setup test, non dichiarato PASS fino alla riesecuzione verde.
- Prima esecuzione dei 200 Nanobot/Galileo: 11 fail reali su frasi operative vaghe (`blocchetti`, `lampeggiare`, `aiuto non si accende`, `guarda/osserva/leggi schermata`, pin `nano:D13`). Corretti nel codice e rieseguiti verdi.
- Primo test tool-executor RED: confermato che mancava un executor async verificato. Implementato senza dichiarare prima il PASS.
