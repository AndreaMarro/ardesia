# ATOM-001: Playwright smoke E2E — 3 spec minime

## Contesto

Dalla verifica 18/04/2026: `tests/e2e/` è vuoto (0 spec), ma `playwright.config.js` esiste.
La metrica `e2e_pass_rate` nel benchmark è 0/10 perché nessuna spec è presente. Prima di qualsiasi scenario massivo serve lo scheletro: 3 spec che caricano la pagina, verificano presenza elementi core, e producono il primo report cacheabile per `benchmark.cjs` fast mode.

## Metrica impattata

- `e2e_pass_rate` (peso 0.15) — da 0 a ≥ 0.90 con 3/3 spec passanti
- Contributo benchmark: +1.35 punti (0.90 × 10 × 0.15)

## Cosa fare

- [ ] Crea `tests/e2e/01-home-smoke.spec.js` con test:
  - `goto /` → status 200, title contiene "ELAB"
  - `locator('#root')` è visibile entro 10s
  - nessun errore `console.error` critico (whitelist: `ServiceWorker`, `manifest`)
- [ ] Crea `tests/e2e/02-simulator-mount.spec.js` con test:
  - `goto /#/simulator` → mount simulatore
  - attendi `[data-testid="simulator-canvas"]` o selector canvas SVG simulatore
  - verifica che almeno 1 componente SVG sia renderizzato
- [ ] Crea `tests/e2e/03-unlim-panel.spec.js` con test:
  - `goto /` → click `[data-testid="lavagna-toggle"]` (o testo "Lavagna")
  - verifica pannello UNLIM visibile
  - verifica input chat presente (non serve inviare messaggio — solo UI presence)
- [ ] Assicurati che `package.json` abbia script `test:e2e`:
  ```json
  "test:e2e": "playwright test"
  ```
  Se manca, aggiungi (non è "nuova dep", è uno script).
- [ ] Run `npx playwright install chromium` se non già installato
- [ ] Run `npx playwright test --reporter=list` — tutti 3 devono passare

## Criteri di accettazione (verificabili)

1. `npx vitest run` passa ≥ 12056 (invariato — non toccare unit test)
2. `npm run build` passa
3. `npx playwright test` mostra 3 passed, 0 failed
4. `ls tests/e2e/*.spec.js | wc -l` restituisce ≥ 3
5. `node scripts/benchmark.cjs --fast` mostra `e2e_pass_rate.value >= 0.90` (dopo aver fatto girare `npx playwright test` almeno una volta per popolare cache)

## File intoccabili

- `src/components/simulator/engine/*` (assoluto)
- `package.json` dependencies (no new deps — solo `scripts` OK)
- `playwright.config.js` (usa config esistente; se config incompleta, ATOM-002 separato)
- Qualsiasi file in `src/` (questo task è solo test — generator-test)

## Generator target

`generator-test`

## Stima

**M** (~1h) — scrittura 3 spec + verifica + eventuale fix data-testid mancanti

## Note per Evaluator

- Verifica che i 3 spec siano **indipendenti** (uno non dipende dall'altro)
- Verifica assenza di `page.waitForTimeout(NNNN)` >2000ms — usa invece `waitFor` con locator
- Il report `playwright-report/results.json` deve esistere per alimentare benchmark fast mode
- Se uno dei test fallisce per mancanza `data-testid` in UI → **NON** aggiungere data-testid in src/ (scope violato). Crea ATOM-NNN per quello
- Se i selector CSS generici funzionano senza data-testid → preferiscili per questo smoke
- Benchmark delta atteso: **+1.3 punti** (da 2.77 verso ~4.1 fast mode)
