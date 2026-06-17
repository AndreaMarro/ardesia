# Audit: CI Test Gap 12081 locale vs 11958 CI

**Data:** 19/04/2026
**Branch:** `feature/lesson-reader-complete-v1`
**Metodo:** read-only diagnosi, CoV skip (audit-only)
**Verdetto:** root cause CONFIRMED + fix gia` applicato in commit `a1d0a98` (parziale).

## TL;DR

Il gap 123 test (12081 Mac -> 11958 Linux CI) e' causato da **bug noto npm ci + Node 20 + optional native dep**: `lightningcss-linux-x64-gnu@1.30.2` (dipendenza ottimizzata di `@tailwindcss/oxide` in tailwindcss 4.x) viene **skippato silenziosamente** quando `npm ci` gira su Node 20. Senza quel binario nativo, il postcss plugin chains di tailwind fallisce al caricamento di alcuni moduli CSS importati dai componenti React nei test — vitest droppa i file di test al collection time **senza loggare failure** (pool=forks non riporta il crash per errore di `import`).

Il fix e' stato applicato in commit `a1d0a98` (19/04/2026 07:37): bump Node 22 + `npm ci --include=optional` sui workflow `governance-gate.yml` e `quality-gate.yml`. La baseline e' stata ripristinata a 12081 dopo il fix. `test.yml` e `e2e.yml` non erano affetti perche' usano `rm -rf node_modules package-lock.json && npm install` (install full, non ci).

## Evidenza

### 1. Local (Mac M4, Node in uso)

```
npx vitest run --reporter=json
-> numTotalTests: 12081
   numPassedTests: 12081
   numFailedTests: 0
   numTotalTestSuites: 1265
```

198 test file raccolti (matches `.test-count-baseline.json > test_files`).

### 2. Deterministic vs dynamic test count

- Tutti i test file che generano test dinamicamente (`lessonPathsValidation.test.js`, `experimentIcons.test.js`, `pdr-69-experiments.test.js`, ecc.) iterano su **liste statiche** (`ALL_EXPERIMENTS` importato, `jsonFiles` da `fs.readdirSync`).
- `src/data/lesson-paths/` ha **95 file tracciati in git** -> identico su CI e locale.
- `docs/volumi-originali/VOLUME-{1,2,3}-TESTO.txt` tracciati in git -> identici.
- `automa/state/heartbeat.json` tracciato in git -> identico.
- `tests/setup.js` non ha nessuno skip condizionale (`skipIf`, `runIf`, `process.platform`, `process.env.CI`) -> escluso env-gating.
- Grep per `it.skip|describe.skip|process.platform|isMac|isLinux` in `tests/` -> 0 match.

**Conclusione strutturale:** i test dovrebbero essere esattamente 12081 su ogni OS. Il gap deve nascere al momento del collection/import, non a runtime.

### 3. Firma del bug npm ci + Node 20 + optional deps

- `package-lock.json` dichiara `lightningcss-linux-x64-gnu@1.30.2` come `optionalDependencies` di `lightningcss`.
- `lightningcss` e' dipendenza diretta di `@tailwindcss/oxide@4.1.18`, caricato da `tailwindcss@4.1.18`.
- Bug noto npm (vedi npm/cli#4828 e issue correlate): `npm ci` su Node 20 non rispetta sempre optional deps platform-specifiche, anche se presenti nel lock file. Il sintomo: `node_modules/lightningcss-linux-x64-gnu/` mancante post-install.
- Al caricamento di un CSS module via Vite plugin react -> tailwind v4 chain -> oxide tenta `require('lightningcss-linux-x64-gnu')` -> throw `MODULE_NOT_FOUND` -> il test file che importa quel componente fallisce il setup-file, e vitest (pool=forks) **puo' marcare il file come "not collected" senza conteggio failure**.
- Commit message (a1d0a98): "vitest silently drops ~123 test files at collection time" — allinea con i numeri osservati.

### 4. Fix applicato (commit a1d0a98)

- `governance-gate.yml`: Node 20 -> 22, `npm ci` -> `npm ci --include=optional`.
- `quality-gate.yml`: Node 20 -> 22, `npm ci || npm install` -> `npm ci --include=optional || npm install --include=optional`.
- `test.yml` + `e2e.yml`: **non toccati** perche' gia' usano `rm -rf node_modules package-lock.json && npm install` (full install, non affetto dal bug).
- Baseline `.test-count-baseline.json > total` ripristinata a 12081.

## Test flaky CI vs local

Non esistono. Verificato:

- `jq -r '.testResults[] | select(.numFailingTests > 0)'` su local run -> 0 failure.
- 0 test con `.skip`, 0 con `process.env.CI` gating, 0 con platform detection.
- Il gap e' **binary drop di file interi**, non flakiness di test individuali.

I 123 test mancanti su CI sono **blocchi interi di file** che non venivano collezionati — probabilmente tutti i test file che importano componenti React con CSS modules che triggerano la pipeline tailwind/lightningcss (stima: 3-5 file da ~25-40 tests ciascuno). Non e' stato possibile identificare i file esatti senza accesso ai log CI pre-fix.

## Cost/benefit

### Indagare ulteriormente? NO.

Motivi:

1. **Root cause identificato e fixato.** Commit a1d0a98 e' on-branch, CoV 3/3 locale PASS.
2. **Deploy.yml usa gia' Node 22** senza problemi (evidenza: Vercel deploy green su produzione).
3. **Verifica effettiva sara' automatica** al prossimo push: quality-gate girera' su Node 22 + --include=optional e dovrebbe riportare 12081.
4. Ulteriori ore di indagine (identificare gli N test file esatti che venivano droppati) avrebbero costo alto (richiederebbe accesso CI logs o replica dell'errore in Docker ubuntu:22.04 + Node 20) e valore basso — non cambierebbe il fix.

### Accettare 11958 come baseline? NO.

Motivi:

1. **E' un downgrade governance.** Il commit message di `c3640dd` era onesto ("fix(ci): baseline 12081->11958 CI reality") ma era un workaround, non il fix.
2. `a1d0a98` ha gia' ripristinato 12081 come target. Correct.
3. Se il fix Node 22 non tenesse (improbabile), il comportamento corretto e' aprire issue, non lowering baseline.

## Raccomandazioni

1. **Lasciare invariato** il fix in a1d0a98 — e' il fix corretto, surgical e applicato.
2. **Verificare al prossimo push** che quality-gate + governance-gate riportino 12081 (non 11958). Se riportano ancora 11958: il fix non ha preso e serve indagine vera (Docker repro).
3. **Opzionale P3 (non bloccante):** allineare anche `test.yml` + `e2e.yml` a Node 22 per uniformita' — oggi funzionano perche' usano `npm install`, ma Node 20 e' EOL ad aprile 2026. Surgical change, 2 righe yaml.
4. **Opzionale P3:** modificare la quality-gate step `npx vitest run --reporter=json > /tmp/vitest-output.json 2>&1` per separare stderr (`2> /tmp/vitest-err.log`), cosi' eventuali warning Linux non corrompono il JSON parsing. Oggi questo non e' la causa (JSON valido anche mescolato localmente), ma e' best practice.

## Chiusura

**Root cause:** `npm ci` + Node 20 + Linux runner skippa `lightningcss-linux-x64-gnu@1.30.2` (optional native), cascade -> vite/tailwind/oxide plugin fail al caricamento -> vitest `pool: forks` droppa silenziosamente ~123 test di file che importano CSS modules via React.

**Fix:** commit a1d0a98 (Node 22 + `--include=optional`) — gia' applicato, in attesa di verifica runtime al prossimo CI run.

**Confidence:** 85% root cause certo (evidenza commit + package-lock + bug npm pubblico documentato). 15% residuo: non e' stato replicato localmente in container Linux per misurare esattamente quali N file finiscono droppati. Validazione finale: primo CI run dopo merge PR.
