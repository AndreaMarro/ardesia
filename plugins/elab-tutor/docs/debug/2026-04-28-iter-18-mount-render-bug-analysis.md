# Iter 18 P0 — mountExperiment returns true ma simulator empty

**Data**: 2026-04-28
**HEAD**: 247722c (post 5448af4)
**Test source**: `automa/state/iter-18-experiments-test-results.json`
**Severity**: P0 CRITICAL — UNLIM Onnipotenza broken (mount-then-empty su 10/10 esperimenti prod)

---

## 1. Bug reproduction

Playwright test su `https://www.elabtutor.school` ha eseguito mount di 10 esperimenti rappresentativi (vol1+vol2+vol3, mix circuit + AVR). Risultato:

| metrica | valore |
|---|---|
| n esperimenti testati | 10 |
| `mountExperiment(id)` returned true | **10/10** |
| `getComponentPositions()` size | **0/10** (TUTTI vuoti) |
| `getComponentStates()` size | **0/10** (TUTTI vuoti) |
| `captureScreenshot()` PNG valido | 10/10 (17-25KB) |
| `simulator_empty_or_minimal` flag | **10/10** |
| `getCircuitDescription()` mostra componenti | **10/10** (preview "Componenti: bat..." / "Arduino Nano") |
| console errors | 14 (CORS n8n compile, NON rilevanti al bug mount) |

**Discrepanza chiave**: stesso `_simulatorRef` usato sia da `getCircuitDescription` (che VEDE componenti) sia da `getComponentPositions/getComponentStates` (che restituiscono vuoto). Mount riportato OK ma due getter contraddittori sullo stesso ref.

---

## 2. Hypothesis 1 — async race: mountExperiment returns BEFORE placeComponents finished

**Rifiutata.**

`mountExperiment(experimentId)` (`src/services/simulator-api.js:264-270`) esegue:
```js
_simulatorRef.selectExperiment(exp);
return true;
```

`selectExperiment` punta a `handleSelectExperiment` (`src/components/simulator/hooks/useExperimentLoader.js:156`), `async` per esperimenti AVR (await import + bridge.loadHex/compile). Per esperimenti `circuit` non è async-await, ma chiama `setCurrentExperiment(experiment)` (line 196) che è React state setter — quindi `mergedExperiment` non è disponibile fino al commit React successivo.

PROBLEMA: il test legge `getComponentPositions` IMMEDIATAMENTE dopo `mountExperiment` returns. Per esperimenti AVR (vol3-cap5+) c'è inoltre `await import('AVRBridge')` + `compileArduinoCode` che impiega secondi, e `mountExperiment` returns SUBITO dopo aver dispatchato `selectExperiment` (NON awaited), quindi è plausibile race.

**Perché rifiutata**: `getCircuitDescription()` legge dallo STESSO `mergedExperimentRef` e VEDE componenti correttamente nello stesso istante. Se fosse pura race su React state non avremmo descrizione popolata e positions vuote insieme. → race su React commit non spiega la divergenza.

---

## 3. Hypothesis 2 — getComponentPositions reads stale state (different store)

**Rifiutata, ma vicino al vero.**

Source code letto:
- `getComponentPositions` (`src/components/simulator/hooks/useSimulatorAPI.js:353-362`):
  ```js
  const exp = mergedExperimentRef.current || currentExperimentRef.current;
  if (!exp) return {};
  const positions = {};
  (exp.components || []).forEach(c => {
    const pos = exp.layout?.[c.id] || {};
    positions[c.id] = { x: pos.x || 0, y: pos.y || 0, type: c.type };
  });
  return positions;
  ```
- `getCircuitState`/`buildStructuredState` (`useSimulatorAPI.js:95-151`): legge stesso `mergedExperimentRef.current || currentExperimentRef.current`.

Stesso ref, stessa fonte. Non è "store diverso".

---

## 4. Hypothesis 3 — mountExperiment doesn't actually call placeComponents/setComponentStates

**Rifiutata.**

`handleSelectExperiment` chiama:
- `setCurrentExperiment(experiment)` (line 196) → `currentExperimentRef.current` aggiornato via useEffect line 590 NewElabSimulator.
- `solverRef.current.loadExperiment(experiment)` (line 330 default circuit branch + line 308 AVR branch) + `setComponentStates(solverRef.current.getState())` (line 331/317).
- `useMergedExperiment` ricalcola `mergedExperiment` su change `currentExperiment` (memo dep line 168).
- `mergedExperimentRef.current = mergedExperiment` (line 591 NewElabSimulator).

Quindi **dopo il commit React**, sia `mergedExperimentRef` sia `componentStatesRef` (line 592) sono popolati. Non è un problema "non viene chiamato".

---

## 5. Hypothesis 4 — lesson-paths JSON malformed o components mancanti

**Rifiutata.**

Verificato `src/data/lesson-paths/v1-cap6-esp1.json` — ha `phases[].build_circuit.intent.components` (formato lesson-path). MA `mountExperiment` NON legge da lesson-paths: legge da `findExperimentById` (`src/data/experiments-index.js:30-32`) che cerca in `ALL_EXPERIMENTS` flat = `EXPERIMENTS_VOL1.experiments + VOL2 + VOL3` (file `experiments-vol1.js`).

Verificato `experiments-vol1.js:20-52` — l'esperimento `v1-cap6-esp1` ha:
- `components: [4 entries]` (battery9v, breadboard-half, resistor 470Ω, led red)
- `layout: { bat1, bb1, r1, led1 }` (4 entries con x/y)
- `connections: [6 entries]`

Dati COMPLETI e CORRETTI. La lesson-path JSON è companion della guida pedagogica, NON è la sorgente del simulatore.

---

## 6. Hypothesis 5 — SimulatorCanvas useEffect race

**Plausibile ma non spiega il bug osservato.**

`SimulatorCanvas` rendering dipende da `mergedExperiment` prop. Lifecycle React:
1. `mountExperiment` → `selectExperiment` → `setCurrentExperiment` (sync setState)
2. React batched commit → `currentExperiment` re-render → `useMergedExperiment` memo ri-calcola `mergedExperiment`
3. `useEffect` line 591 → `mergedExperimentRef.current = mergedExperiment`
4. Canvas riceve nuova prop e renderizza

Se test chiama `getComponentPositions` PRIMA del commit React (stesso microtask) → `mergedExperimentRef.current` ancora null/precedente. Spiega `positions={}` ma NON spiega `getCircuitDescription` che mostra componenti popolati nello stesso istante.

→ È possibile che il test attenda il render (waitForFunction) per `mountExperiment` true, quindi al momento delle letture il commit dovrebbe essere completato.

---

## 7. Hypothesis 6 — Vercel build deploy stale (bundled vs source diverge)

**Possibile contributore parziale, NON root cause primario.**

Il deploy Vercel può servire bundle precedente per qualche secondo dopo push. Ma il test ha `mount_returned: true` su 10/10 e vede descrizioni popolate — quindi il bundle E' quello giusto, è solo i due getter che divergono.

---

## 8. Investigation — read mountExperiment + getters

`src/services/simulator-api.js:264-270`:
```js
mountExperiment(experimentId) {
  if (!_simulatorRef?.selectExperiment) return false;
  const exp = findExperimentById(experimentId);
  if (!exp) return false;
  _simulatorRef.selectExperiment(exp);
  return true;
}
```

Returns `true` immediatamente dopo dispatch. **Non await**.

`getComponentPositions` `src/services/simulator-api.js:347-349`:
```js
return _simulatorRef?.getComponentPositions?.() || {};
```

`getComponentStates` `src/services/simulator-api.js:151-153`:
```js
return _simulatorRef?.getComponentStates?.() || {};
```

Implementazioni in `useSimulatorAPI.js:310` e `:353`.

---

## 9. Investigation — NewElabSimulator experiment load

`NewElabSimulator.jsx:121` `setCurrentExperiment` state setter.
`NewElabSimulator.jsx:551` `useMergedExperiment(...)` ricalcola.
`NewElabSimulator.jsx:557-560` useEffect su `mergedExperiment`: `solverRef.current.loadExperiment(mergedExperiment, { preserveState: true }); setComponentStates(solverRef.current.getState());`
`NewElabSimulator.jsx:590-593` synchronous ref mirror via useEffect:
```js
useEffect(() => { currentExperimentRef.current = currentExperiment; }, [currentExperiment]);
useEffect(() => { mergedExperimentRef.current = mergedExperiment; }, [mergedExperiment]);
useEffect(() => { componentStatesRef.current = componentStates; }, [componentStates]);
```

**Tutti gli aggiornamenti dei ref vivono dentro useEffect**, quindi avvengono DOPO il render commit.

---

## 10. Investigation — lesson-paths JSON sample

`src/data/lesson-paths/v1-cap6-esp1.json` — è scaffolding pedagogico (phases PREPARA/MOSTRA/CHIEDI/OSSERVA/CONCLUDI). Ha `build_circuit.intent.components` ma NON è la fonte del simulatore. Il simulatore legge da `experiments-vol1.js`.

**No malformazione.** Coerente.

---

## 11. Investigation — placeComponents calls

Grep `placeComponents`: nessuna chiamata in src/. Il sistema usa `experiment.components + experiment.layout` direttamente, non c'è "placement engine call post-mount". `PlacementEngine.js` esiste ma non è il path del mount degli esperimenti pre-built — viene usato per drag-add manuale.

---

## 12. Investigation — state flow trace

```
mountExperiment(id)
  → selectExperiment(exp)
    → handleSelectExperiment(exp) [useExperimentLoader.js:156]
      → setCurrentExperiment(exp) [line 196, sync setState]
      → solverRef.current.loadExperiment(exp) [line 330]
      → setComponentStates(solverRef.current.getState()) [line 331]
  → return true [SUBITO, dentro stesso microtask]

[Tick React commit]
  → useEffect [NewElabSimulator:590] currentExperimentRef.current = currentExperiment
  → useMergedExperiment recompute mergedExperiment
  → useEffect [NewElabSimulator:591] mergedExperimentRef.current = mergedExperiment
  → useEffect [NewElabSimulator:592] componentStatesRef.current = componentStates
  → useEffect [NewElabSimulator:557] solverRef.loadExperiment(mergedExperiment) + setComponentStates AGAIN

[Test reads]
  getComponentPositions() → mergedExperimentRef.current.components/layout
  getComponentStates() → componentStatesRef.current
  getCircuitDescription() → buildStructuredState() → mergedExperimentRef.current.components
```

---

## 13. Most likely cause + evidence

**Root cause primario: race condition test-side (Playwright reads BEFORE React commit), aggravato da una incoerenza interna tra getter.**

Evidenza:
1. **Stesso `mergedExperimentRef.current`** alimenta sia `buildStructuredState`/`getCircuitDescription` (vede componenti) sia `getComponentPositions` (vuoto). NON sono store diversi.
2. **Test results inconsistenti**: `sim_desc_preview` mostra "Componenti: bat..." (vol2 cap12 esp1, line 81 results) MA `sim_components: 0`. Se `getCircuitDescription` ha letto componenti, `getComponentPositions` chiamato 1ms dopo dovrebbe vederli pure.
3. **Prima ipotesi** — il test misura `getComponentPositions` come `Object.keys(positions).length` ma la funzione restituisce `{ id: { x, y, type } }`. Se il test invece misura `positions.length` (treating as array), Object literal ha `length === undefined → 0`. **Smoking gun**: la diagnosi `0 components / 0 states` per TUTTI 10 (anche AVR `Arduino Nano (nano1)` esplicitamente nel desc) è coerente con bug nel **test driver**, NON nel runtime.
4. **Capture screenshot OK 17-25KB** = canvas SVG sta renderizzando qualcosa. Se simulatore fosse davvero vuoto, screenshot sarebbe ~5KB (sfondo + breadboard placeholder).
5. `getCircuitDescription` mostra `"Simulazione in corso."` per esperimenti circuit → `state.isSimulating === true` → `solver.start()` è stato chiamato (line 332 useExperimentLoader) → componenti CARICATI nel solver.

**Diagnosi concreta**: il test legge `__ELAB_API.getComponentPositions()` (returns object dict) e prende `Object.keys(...).length`. Se il test prende `.length` direttamente (treating result as array), risulta sempre 0/undefined. Verifica del test driver è BLOCCANTE prima di toccare src.

**Causa secondaria possibile**: timing — `mountExperiment` returns `true` sync, test legge prima del commit React (~16ms). Per esperimenti AVR (vol3) c'è anche compile remoto async che NON è awaited dentro mountExperiment. CORS errors `n8n.srv1022317.hstgr.cloud/compile` blocked → `compileArduinoCode` rejects → bridge non carica → setComponentStates resta vuoto → AVR side davvero vuoto. Ma circuit-mode (vol1/vol2) non ha questo problema.

---

## 14. Proposed fix (concreto, NON commit)

### Fix A — verify test driver primo (BLOCCANTE)

Localizza il driver Playwright (probabilmente in `automa/scripts/iter-18-*.mjs` o esterno). Verifica `getComponentPositions` invocation:
- ATTESO: `Object.keys(api.getComponentPositions()).length`
- BUG IPOTIZZATO: `api.getComponentPositions().length`

Se test bug: NESSUNA modifica src necessaria. Solo correzione test driver + re-run.

### Fix B — make mountExperiment awaitable (se test corretto)

`src/services/simulator-api.js:264-270`:
```js
async mountExperiment(experimentId) {
  if (!_simulatorRef?.selectExperiment) return false;
  const exp = findExperimentById(experimentId);
  if (!exp) return false;
  await _simulatorRef.selectExperiment(exp);
  // FORCE flush refs synchronously dopo commit
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  // Verifica refs popolati
  const components = _simulatorRef.getComponentPositions?.() || {};
  return Object.keys(components).length > 0;
}
```

`selectExperiment` deve essere già async-aware (handleSelectExperiment è async per AVR).

### Fix C — add mount lifecycle event

In `useExperimentLoader.js:341` esiste già `emitSimulatorEvent('experimentChange', ...)`. Aggiungere `emitSimulatorEvent('experimentMounted', ...)` AFTER tutti i setState + dopo che mergedExperimentRef è popolato (dentro useEffect specifico). Test attende l'evento prima di leggere.

### Fix D — mount-completion promise

Espone `_simulatorRef.mountPromise` che si risolve quando `mergedExperimentRef.current?.id === expectedId && componentStatesRef.current popolato`. mountExperiment returns la promise.

---

## 15. Test plan post-fix

1. **Verifica test driver locale** (10 min):
   - Trova script Playwright. `grep -rn "simulator_empty_or_minimal" ./automa ../`.
   - Conferma sintassi `getComponentPositions`. Se bug test → fix test, re-run, atteso 10/10 PASS senza toccare src.

2. **Manual smoke test prod** (5 min):
   - Aprire DevTools console su `https://www.elabtutor.school`
   - `await __ELAB_API.mountExperiment('v1-cap6-esp1')` → `true`
   - Wait 500ms
   - `Object.keys(__ELAB_API.getComponentPositions())` → atteso `['bat1','bb1','r1','led1']`
   - `Object.keys(__ELAB_API.getComponentStates())` → atteso ≥4 entries
   - `__ELAB_API.getCircuitDescription()` → atteso "Componenti: batteria 9V (bat1), resistore da 470Ω (r1), LED rosso (led1). Fili: 6 collegamenti."

3. **Se bug nel runtime** post-Fix B:
   - Test 10 esperimenti con `await mountExperiment` (awaitable)
   - Atteso 10/10 con `getComponentPositions` non-vuoto
   - Coverage AVR (vol3): verifica CORS n8n compile fix separato (preflight failed)

4. **Regression test**:
   - `npx vitest run tests/unit/simulator-api.test.js` (se esiste)
   - `npx vitest run` baseline preservata

5. **CORS n8n** (separato, non blocking iter 18):
   - Vol3 cap5/6/7/8 esperimenti hanno CORS fail su `n8n.srv1022317.hstgr.cloud/compile` preflight
   - Probabile causa: hostname Vercel non in CORS allowlist n8n
   - Fix lato n8n: aggiungere `https://www.elabtutor.school` ad `Access-Control-Allow-Origin`

---

## 16. Prevention recommendations

1. **mountExperiment deve essere awaitable** — qualunque API che dispatcha React setState e returns "true" senza await è source di confusione test-side.
2. **Aggiungere test E2E unit `tests/unit/simulator-api.test.js`** che verifica mount + readback positions in jsdom React Testing Library.
3. **Documentare il contract `__ELAB_API`** in `src/services/simulator-api.js` JSDoc: ogni getter dichiara "available within X ms after mountExperiment".
4. **Smoke test post-deploy automatico** — Playwright spec `tests/e2e/03-mount-getters.spec.js` con `await page.waitForFunction(() => Object.keys(window.__ELAB_API.getComponentPositions()).length > 0, { timeout: 3000 })`.
5. **CoV protocol**: prima di chiamare un bug "rilevato in prod", verificare che il test driver sia corretto (read/parse) — qui il fenomeno `getCircuitDescription full + getComponentPositions empty` è internamente contraddittorio, segnale di bug test, non bug runtime.

---

## Appendix — file refs

- `src/services/simulator-api.js:264-270` (mountExperiment)
- `src/services/simulator-api.js:347-349` (getComponentPositions wrapper)
- `src/services/simulator-api.js:151-153` (getComponentStates wrapper)
- `src/services/simulator-api.js:277-341` (getCircuitDescription)
- `src/components/simulator/hooks/useSimulatorAPI.js:303-453` (apiInstance object con tutti i getter)
- `src/components/simulator/hooks/useSimulatorAPI.js:353-362` (getComponentPositions impl)
- `src/components/simulator/hooks/useSimulatorAPI.js:310` (getComponentStates impl)
- `src/components/simulator/hooks/useSimulatorAPI.js:95-151` (buildStructuredState)
- `src/components/simulator/hooks/useExperimentLoader.js:156-343` (handleSelectExperiment)
- `src/components/simulator/hooks/useMergedExperiment.js:21-168` (memo merge)
- `src/components/simulator/NewElabSimulator.jsx:590-593` (ref mirror useEffects)
- `src/data/experiments-vol1.js:20-52` (v1-cap6-esp1 dataset)
- `src/data/experiments-index.js:30-32` (findExperimentById)
- `automa/state/iter-18-experiments-test-results.json` (test results)
