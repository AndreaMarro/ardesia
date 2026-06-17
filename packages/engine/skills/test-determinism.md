# test-determinism

Determinismo dei test: niente identificatori collidibili tra commit, niente `>=` dove
`==` è possibile. Chiude il pattern SHA/hex-collision (2x) e i test deboli su conteggi.

## When-to-apply

- Quando un test cerca substring/conteggi in output che includono valori variabili tra
  commit (commit SHA, hash, hex, timestamp, log.jsonl/observations.jsonl).
- Quando si scrive un assert su un valore che il mock produce in modo deterministico.

## Checklist/Procedura

- [ ] Nessun test cerca substring corte (es. `"add"`) in stringhe che includono un commit SHA / hash hex: usa task name **namespaced** (es. `"P0b-content-atom"`) o un prefisso distintivo improbabile da collidere.
- [ ] Nessun test dipende da un SHA/hex reale: se serve un id, usa un **seed fisso** o un id namespaced costruito nel test, non il valore generato dal sistema.
- [ ] Nessun test nuovo usa `>=` su conteggi deterministici: se il mock è deterministico usa `== N`. `>=` ammesso solo per valori non deterministici (LLM reale, timestamp).
- [ ] Le asserzioni su collezioni filtrano per chiave esatta/namespaced prima di contare, così l'aggiunta di altre entry non rompe (né maschera) il test.

## Origine-RETRO

- RETRO #7.3: test con substring SHA/hex (pattern 2x) — test observations cercava `"add"` che matchava il commit SHA.
- RETRO #4.3: test con `>=` invece di `==` su conteggi deterministici (pattern 3x: M5-task1-eval-set, M4-severity, pipeline-review-hook).
