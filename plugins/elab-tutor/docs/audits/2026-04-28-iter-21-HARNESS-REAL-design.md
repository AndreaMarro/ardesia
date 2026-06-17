# Sprint T iter 21 — HARNESS REAL design + pilot 5 results

**Data**: 2026-04-28 PM
**Autore**: harness-real spec author (Sprint T iter 21)
**Scope**: spec Playwright REAL UNO PER UNO + smoke 5 piloti su https://www.elabtutor.school + dispatch design Mac Mini.

> **Mandate iter 18 PM**: "USARE PLAYWRIGHT E CONTROL CHROME PER TESTARE LETTERALMENTE TUTTO". Iter 19 ha shipped harness 2.0 (94/94 PASS) ma e' **FALSE POSITIVE confermato**: ZERO browser launch.

---

## 1. Diff vs harness 2.0 false positive

### Cosa harness 2.0 NON faceva (`scripts/harness-2.0/runner.mjs` + `automa/state/iter-19-harness-2.0-results.json`)

Iter 19 ha enumerato 94 file `v*.json` da `src/data/lesson-paths/`. Per ognuno ha eseguito SOLO controlli statici sul JSON sorgente:

| Check (interaction_checks) | Cosa misurava REALMENTE | Browser? |
|---|---|---|
| `mounted_components_count` | `components.length === expected_components_count` (campo del JSON contro se stesso) | NO |
| `description_non_empty` | `description.length > 0` (campo del JSON) | NO |
| `description_cita_titolo` | regex su `title` dentro `description` (campo vs campo nello stesso JSON) | NO |
| `state_capturable` | `typeof components === 'array'` (controllo tipo) | NO |
| `components_match_expected` | `components.length === expected_components_count` (duplicato del primo) | NO |

In `runner.mjs` riga ~28-30 la docstring lo ammette:
> "ITER 19 LIMITS: Simulate/tutor/diagnose stubs (return mock results). Golden directory paths referenced but NOT created here. **NO Playwright launch yet** (preflight infrastructure validation only)."

**Conclusione**: 94/94 PASS = autovalidazione del JSON contro se stesso. Zero garanzia che gli esperimenti funzionino realmente quando un docente apre la LIM.

### Cosa il NUOVO spec REALE fa (`tests/e2e/harness-real-2026-04-28.spec.js`)

Per ogni esperimento (87 file `v[123]-cap*-esp*.json`), un test Playwright Chromium reale che:

1. **Naviga PROD live** `https://www.elabtutor.school` (NON localhost, NON dev build).
2. **Aspetta `window.__ELAB_API`** esposto (signal app boot completo, polling 15s).
3. **Mount esperimento** via 3 strategie a fallback: `__ELAB_API.unlim.mountExperiment(id)` → `__ELAB_API.mountExperiment(id)` → `__ELAB_API.loadExperiment(id)` → hash `#experiment=<id>`.
4. **Cattura `getCircuitState()`** + `getCircuitDescription()` dall'API browser.
5. **Render assertion**: `page.locator('svg').count() > 0` + count `[data-component]`.
6. **Compile test** (solo `hasArduino`): cerca bottone "Compila"/"Compile", click, attende response da `compile|n8n|hostinger`, verifica status.
7. **Screenshot full-page** salvato in `tests/e2e/snapshots/iter-21-real-harness/<id>.png`.
8. **Console errors + page errors + failed network requests** raccolti per ogni test.
9. **Risultato append-only** in `automa/state/iter-21-harness-real/results.jsonl` (1 riga per esperimento).
10. **Pass criteria onesto**: navigate ok + api_ready + mount attempted + svg_count>0 + zero pageerror.

---

## 2. Spec architecture + flow

### File deliverables

| File | LOC | Ruolo |
|---|---|---|
| `tests/e2e/harness-real-2026-04-28.spec.js` | ~290 | Spec Playwright (1 test per esperimento, loop su `enumerateLessonPaths()`) |
| `tests/e2e/playwright.harness-real.config.js` | ~30 | Config dedicata: `testMatch` solo questo spec, no `webServer`, baseURL prod, `maxFailures: 0` |
| `scripts/harness-real/dispatch.sh` | ~75 | Script cron Mac Mini (12h regression) |
| `tests/e2e/snapshots/iter-21-real-harness/` | dir | Screenshot per visual diff |
| `automa/state/iter-21-harness-real/` | dir | Output JSONL + playwright-report.json |

### Flow per test (per ogni 87 esperimenti)

```
playwright test
  ├─ load harness-real spec
  ├─ enumerateLessonPaths() → 87 ID readdirSync filtered ^v\d+-cap\d+-esp\d+\.json$
  ├─ for each lp:
  │    ├─ test(`real harness ${lp.id}`)
  │    │    ├─ page.goto(PROD_URL)
  │    │    ├─ waitForElabApi(15s polling)  ← signal app boot
  │    │    ├─ tryMountExperiment(page, id)  ← 4 strategies
  │    │    ├─ waitForTimeout(2500)         ← render allowance
  │    │    ├─ captureCircuitState()        ← read API snapshot
  │    │    ├─ count svg + data-component nodes
  │    │    ├─ if hasArduino: locator("button:has-text('Compila')").click + waitForResponse compile-proxy
  │    │    ├─ page.screenshot fullPage → snapshots/<id>.png
  │    │    ├─ append result JSONL  ← finally block, always runs
  │    │    └─ expect.soft + expect hard svg_count>0
  └─ playwright-report.json + dispatch.log
```

Race conditions controllate: `try/catch/finally` garantisce che ogni test scriva il proprio record JSONL anche su crash.

---

## 3. Pilot 5 esperimenti — RESULTS REALI 2026-04-28T19:17:23Z

Eseguito comando:
```bash
ELAB_PROD_URL=https://www.elabtutor.school \
  npx playwright test --config tests/e2e/playwright.harness-real.config.js \
  --grep "v1-cap6-esp1|v1-cap10-esp1|v1-cap11-esp1|v2-cap3-esp1|v3-cap5-esp1"
```

| Esperimento | Title | Volume | Arduino | navigate | api_ready | svg_count | pageErrors | pass | duration |
|---|---|---|---|---|---|---|---|---|---|
| v1-cap6-esp1 | Accendi il tuo primo LED | 1 | no | OK | **FALSE** | **0** | 0 | **FAIL** | 23.6s |
| v1-cap10-esp1 | La fotoresistenza sente la luce | 1 | no | OK | **FALSE** | **0** | 0 | **FAIL** | 32.6s |
| v1-cap11-esp1 | Buzzer suona continuo | 1 | no | OK | **FALSE** | **0** | 0 | **FAIL** | 26.7s |
| v2-cap3-esp1 | Controlliamo la carica della batteria | 2 | yes | OK | **FALSE** | **0** | 0 | **FAIL** | 20.2s |
| v3-cap5-esp1 | Blink con LED_BUILTIN | 3 | yes | OK | **FALSE** | **0** | 0 | **FAIL** | 19.6s |

**5/5 FAIL.** Pattern uniforme: la home si carica, MA `__ELAB_API` non e' MAI esposto, ZERO svg renderizzati, ZERO console error, ZERO page error, ZERO failed request. Nemmeno il bottone "Compila" e' visibile per Arduino esperimenti.

### Root cause (confermato da screenshot)

Lo screenshot `tests/e2e/snapshots/iter-21-real-harness/v1-cap6-esp1.png` mostra:
> **"BENVENUTO IN ELAB TUTOR — Simulatore di elettronica e Arduino per la scuola"**
> Form: "Chiave univoca" + "Inserisci la tua chiave..." + bottone ENTRA
> Banner: "Prima di iniziare, dicci quanti anni hai. Ci serve per proteggerti al meglio!" + dropdown "Quanti anni hai?"

E' la **WelcomePage license gate** (`AuthContext.jsx`), che monta PRIMA di NewElabSimulator. Il routing custom hash-based (`#experiment=...`) non bypassa il gate. `__ELAB_API` viene esposto SOLO dopo che il simulatore monta — quindi MAI in questo flusso. Lo stesso `fixtures.js` lo riconosce con `skipIfProd()` ("License-accept automation not implemented for prod baseURL — sprint-3 Day 05 target").

**Implicazione brutale**: 0/87 esperimenti possono essere testati su prod senza:
- (a) ottenere una chiave univoca valida + automatizzare il form, oppure
- (b) deployare un build con flag `VITE_E2E_AUTH_BYPASS` che riconosca `localStorage['elab_e2e_user']` anche in prod build (oggi e' `dead-code-eliminated`).

---

## 4. Estrapolazione totale 87 esperimenti

**Stima onesta basata sul pilot 5**: tutti i 87 falliranno con lo stesso pattern (api_ready=FALSE, svg=0). Il root cause non e' "esperimenti rotti" — e' che il harness non riesce ad ARRIVARE al simulatore.

**Quindi non si puo' ancora rispondere alla domanda di Andrea** ("quanti dei 92/87 esperimenti non funzionano realmente?"). Ci serve sbloccare il gate prima.

Stima a posteriori una volta sbloccato il gate (basata su iter 18 PM feedback Andrea + audit Tea 4 capstone problematici): ipotesi pessimistica = 30-50% degli 87 esperimenti avra' problemi reali (componenti non disposti correttamente, compile fail, render rotto). Ma e' ipotesi — solo il run reale post-bypass sara' la verita'.

---

## 5. Blocker prod identificati

| # | Blocker | Severity | Mitigazione |
|---|---|---|---|
| **B1** | **WelcomePage license gate** assorbe ogni navigazione, `__ELAB_API` mai esposto, hash routing inerte | **P0** | Build flag `VITE_E2E_AUTH_BYPASS=true` per il deploy preview Vercel + pre-shared E2E key in localStorage seedata da `seedE2EBypass()`. Oppure: chiave univoca dedicata "harness-e2e" creata in Supabase + automation form. |
| B2 | `__ELAB_API` potrebbe essere ulteriormente strippato in prod build (obfuscation `vite.config.js`) | P1 | Verificare `window.__ELAB_API` in DevTools una volta dentro l'app. Se anche dentro l'app non e' esposto in prod, aggiungere flag opt-in `VITE_EXPOSE_ELAB_API=true` per harness deploy. |
| B3 | Compile-proxy n8n Hostinger throttle (1 req/sec stimato) | P1 | Sequenziale gia' enforced (`workers: 1`). Aggiungere `await page.waitForTimeout(1500)` post-compile per non saturare. |
| B4 | Render cold start 18s su Nanobot (UNLIM chat) | P2 | Test UNLIM-driven non incluso pilot. Quando aggiunto, primo turn warm-up dedicato. |
| B5 | CORS Edge Function unlim-chat (header `apikey` richiesto) | P2 | Spec NON chiama Edge Function direttamente — solo via UI. Risolto by-design. |
| B6 | Cookies/localStorage cross-test contamination | P2 | Playwright crea contesto fresh per ogni test (default). OK. |
| B7 | Vercel rate limit ~100 req/min anonimo | P2 | 87 test × ~10 req/test = 870 req in 30 min = 29 req/min. Sotto soglia. OK. |

---

## 6. Mac Mini cron 12h dispatch design

**File**: `scripts/harness-real/dispatch.sh` (75 LOC, eseguibile, deliverato).

### Schedule

```cron
# Mac Mini /var/at/tabs/progettibelli (or launchctl com.elab.harness-real)
0 2,14 * * *  /bin/bash /Users/progettibelli/elab/scripts/harness-real/dispatch.sh \
              >> /tmp/harness-real-dispatch.log 2>&1
```

Run alle **02:00 e 14:00 UTC** (04:00 e 16:00 CEST). Notte + pomeriggio = copertura asincrona traffico utenti.

### Output per run

- `automa/state/iter-21-harness-real/results-<UTC_TS>.jsonl` (87 righe + meta header)
- `automa/state/iter-21-harness-real/playwright-report-<UTC_TS>.json`
- `automa/state/iter-21-harness-real/dispatch-<UTC_TS>.log`
- `tests/e2e/snapshots/iter-21-real-harness/<id>.png` (overwrite per run, latest only)

### Alert

Se `>20% fail` → log `[UTC_TS] ALERT: XX% experiments failing on prod` su stderr. Cron redirect cattura. Hook successivo (Telegram via OpenClaw) puo' grep su "ALERT:" e notificare Andrea.

### Exit codes onesti

- `0` = run completed (regardless of test failures — failures are DATA, non infra)
- `1` = playwright/setup error (infra failure, alertable)

Cosi' il monitoring distingue "esperimenti rotti" (segnale di prodotto) da "infra rotta" (segnale di sistema).

### NPM script suggerito (NON applicato ancora — Andrea decide)

```json
// package.json scripts (proposed, NOT applied)
"test:harness-real": "ELAB_PROD_URL=https://www.elabtutor.school playwright test --config tests/e2e/playwright.harness-real.config.js",
"test:harness-real-smoke": "ELAB_PROD_URL=https://www.elabtutor.school playwright test --config tests/e2e/playwright.harness-real.config.js --grep 'v1-cap6-esp1|v1-cap10-esp1|v1-cap11-esp1|v2-cap3-esp1|v3-cap5-esp1'"
```

---

## 7. Comparison tempo/cost vs harness 2.0 stub

| Dimensione | harness 2.0 stub (iter 19) | harness REAL (iter 21) |
|---|---|---|
| Browser launch | NO | YES (Chromium headless) |
| Network calls | NO | YES (~10 req/test prod Vercel) |
| Vercel egress | 0 | ~5MB per test × 87 = ~430MB per run |
| Tempo per esperimento | ~2ms (sync JSON parse) | ~25s (avg pilot, navigate + wait + screenshot) |
| Tempo totale 87 esp | ~190ms | **~36 min sequenziale** (workers=1) |
| CPU host | trascurabile | ~1 core 100% durante run |
| Cost compile-proxy n8n | 0 | ~25 chiamate compile (solo Arduino) per run |
| Cost stimato cron 12h | $0 | ~$0.10/run Vercel egress + $0 n8n self-hosted = ~$6/mese (2 run/giorno × 30) |
| **Validity** | **0/10 false positive** | **8/10 reale** (ancora bloccato dal license gate, ma il rilevamento e' la prova del valore) |

**Onesta**: harness REAL costa 12000x in tempo e ~$6/mese in Vercel egress, ma e' l'UNICO che fornisce evidence vera. Iter 19 stub era spreco di CI cycles travestito da PASS.

---

## 8. Honest gaps + next steps Andrea

### Gaps onesti questa sessione

1. **Pilot 5/5 FAIL = 0 esperimenti effettivamente testati nel simulatore.** La spec funziona ma il prodotto live blocca l'accesso (gate licenza).
2. **Compile flow non e' stato eseguito** per nessuno dei 2 esperimenti Arduino del pilot — bottone "Compila" non visibile (mai arrivati al simulatore).
3. **UNLIM language verify (`Principio Zero V3`) non implementato** — ho commentato `[...] omit detail` nel task originale e non l'ho aggiunto perche' non si raggiunge mai uno stato dove UNLIM risponde.
4. **`webServer` removed** dalla config dedicata — corretto, ma se Andrea vorra' eseguire in dev, dovra' usare la config principale `playwright.config.js` con override baseURL.

### Andrea action items (3)

1. **Sbloccare gate** scegliendo (a) o (b) di sezione 5/B1. Raccomando (a) build flag `VITE_E2E_AUTH_BYPASS=true` solo per deploy preview dedicato (`elab-tutor-e2e.vercel.app`) — separa traffico harness da utenti reali.
2. **Confermare Mac Mini cron** schedule (02:00/14:00 UTC OK?) o preferisci altro orario.
3. **Decidere npm script wire-up** (proposto sezione 6, NOT applied — modifica a `package.json` richiede OK esplicito per regola "MAI aggiungere dipendenze npm senza approvazione").

### Iter 22 priorities (post Andrea sblocco)

- P0: re-run harness-real su 87 con gate bypassato → primo dato VERO sui 87 esperimenti
- P0: classificazione esperimenti per failure mode (no render / componenti sovrapposti / compile fail / API missing)
- P1: aggiunta Principio Zero V3 verify post-mount (chiede UNLIM "spiega questo" + valida regex `Ragazzi,` + `Vol\.\d+\s*pag\.\s*\d+`)
- P1: visual diff regression (compare screenshot run-N vs run-N-1, alert se delta >5%)
- P2: Mac Mini Telegram alert hook su `ALERT:` line dispatch.log

---

## 9. File deliverables index

| Path | Type | Stato |
|---|---|---|
| `tests/e2e/harness-real-2026-04-28.spec.js` | spec | NEW, runnable, ESM |
| `tests/e2e/playwright.harness-real.config.js` | config | NEW, dedicated |
| `tests/e2e/snapshots/iter-21-real-harness/` | dir | NEW, 5 PNG pilot |
| `automa/state/iter-21-harness-real/results.jsonl` | data | NEW, 5 record pilot + meta |
| `automa/state/iter-21-harness-real/playwright-report.json` | data | NEW (last run) |
| `scripts/harness-real/dispatch.sh` | script | NEW, executable, cron-ready |
| `docs/audits/2026-04-28-iter-21-HARNESS-REAL-design.md` | doc | THIS FILE |

**Onesta finale**: la spec funziona, ha catturato evidence vera (license gate blocca harness su prod), e fornisce infra completa per quando il blocker B1 sara' sbloccato. Iter 19 harness 2.0 va flaggato come **DEPRECATED FALSE POSITIVE** in `automa/state/iter-19-harness-2.0-results.json` (non rimosso — storia onesta).
